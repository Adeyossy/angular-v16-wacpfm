import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthErrorCodes, User } from 'firebase/auth';
import { where } from 'firebase/firestore';
import { UploadResult } from 'firebase/storage';
import { NEVER, Observable, Subscription, catchError, concatMap, map, of, timeout } from 'rxjs';
import { BY_CATEGORY, UPDATE_COURSES_RECORDS, UpdateCourseRecord, UpdateCourseType } from 'src/app/models/update_course_record';
import { AuthService } from 'src/app/services/auth.service';
import { HelperService } from 'src/app/services/helper.service';
import PaystackPop from '@paystack/inline-js';
import { Payment, PaystackInitResponse, PaystackTransaction } from 'src/app/models/payment';
import { environment } from 'src/environments/environment';

interface ResumeOptions {
  accessCode: string
}

@Component({
  selector: 'app-update-course-payment',
  templateUrl: './update-course-payment.component.html',
  styleUrls: ['./update-course-payment.component.css']
})
export class UpdateCoursePaymentComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('receipt') receipt: ElementRef = new ElementRef('input');
  uploadChosen = false;
  routeSub = new Subscription();
  paymentSub$: Observable<string> = NEVER;
  what: any = "";
  receiptURL = "";
  receiptFile: File | null = null;
  uCourseRecord: UpdateCourseRecord = {
    courseType: "Membership",
    id: "",
    paymentId: null,
    updateCourseId: "",
    userEmail: "",
    userId: "",
    paymentEvidence: ""
  };

  courseRecords$: Observable<UpdateCourseRecord[]> = new Observable();
  payWithCard$: Observable<boolean> | null = null;

  uploadStarted = false;

  constructor(private activatedRoute: ActivatedRoute, private authService: AuthService,
    private router: Router, public helper: HelperService) {
  }

  ngOnInit(): void {
    this.courseRecords$ = this.activatedRoute.paramMap.pipe(
      map(params => {
        const id = params.get("updateCourseId");
        if (id !== null) return id;
        throw "Param does not exist";
      }),
      concatMap(id => this.authService.queryCollections$<UpdateCourseRecord>(UPDATE_COURSES_RECORDS,
        where("updateCourseId", "==", id))),
      map(res => res.filter(rec => rec.paymentEvidence || rec.paymentId !== null)),
      concatMap(res => this.authService.getFirebaseUser$().pipe(
        map(user => res.filter(r => r.userEmail.toLowerCase().trim() ===
          user!.email?.toLowerCase().trim()))
      ))
      // timeout({ first: 10000, with: () => NEVER }),
      // catchError((err, caught) => { console.log("error => ", err); return NEVER }),
    )
  }

  ngAfterViewInit(): void {
    // const x = this.receipt.nativeElement as HTMLInputElement;
  }

  ngOnDestroy(): void {
    this.routeSub.unsubscribe();
  }

  handleEvent(event: any) {
    console.log("upload event => ", event);
    // console.log("instance of event => ", );
  }

  create(courseType: UpdateCourseType, uCourseId: string, user: User, downloadURL: string,
    paymendId: Payment | null = null, approved = false) {
    const record: UpdateCourseRecord = {
      courseType: courseType,
      updateCourseId: uCourseId,
      paymentId: paymendId,
      paymentEvidence: downloadURL,
      id: "",
      userEmail: user.email!,
      userId: user.uid
    };
    if (approved) record.approved = true;
    return record;
  }

  addNewRecord(courseType: UpdateCourseType, uCourseId: string, user: User, downloadURL: string,
    paymentId: Payment | null = null, approved = false) {
    return this.authService.addDoc$(UPDATE_COURSES_RECORDS,
      this.create(courseType, uCourseId, user, downloadURL, paymentId, approved))
  }

  addDocsByCategory = (params: {
    category: string, uCourseId: string, result: string, user: User,
    paymentId?: Payment | null, approved?: boolean
  }) => {
    switch (params.category) {
      case "jnr":
        return this.addNewRecord("Membership", params.uCourseId, params.user, params.result,
          params.paymentId, params.approved);

      case "snr":
        return this.addNewRecord("Fellowship", params.uCourseId, params.user, params.result,
          params.paymentId, params.approved);

      case "tot":
        return this.addNewRecord("ToT", params.uCourseId, params.user, params.result,
          params.paymentId, params.approved);

      case "tot-resident":
        return this.authService.addDocsInBulk$([
          this.create("Membership", params.uCourseId, params.user, params.result,
            params.paymentId, params.approved),
          this.create("Fellowship", params.uCourseId, params.user, params.result,
            params.paymentId, params.approved),
          this.create("ToT", params.uCourseId, params.user, params.result,
            params.paymentId, params.approved),
        ], UPDATE_COURSES_RECORDS);

      default:
        throw new Error("Error Uploading");
    }
  }

  aggregateParams$(result: string) {
    return this.activatedRoute.paramMap.pipe(
      map(params => {
        return {
          category: params.get("category") ? params.get("category") as string : "",
          uCourseId: params.get("updateCourseId") ? params.get("updateCourseId") as string : "",
          result: result
        }
      }),
      concatMap(params => this.authService.getFirebaseUser$().pipe(
        map(user => { return { ...params, user } })
      ))
    )
  }

  modifyDB = (result: string) => {
    return this.aggregateParams$(result).pipe(
      concatMap(this.addDocsByCategory)
    )
  }

  uploadReceipt() {
    // Use transactions for multiple uploads
    // When payment receipt upload is done
    this.uploadStarted = true;
    this.helper.toggleDialog(0);

    this.helper.setDialog({
      title: "Uploading...",
      message: "Your receipt is being uploaded",
      buttonText: "Please wait"
    });

    if (this.receiptFile) {
      this.paymentSub$ = this.authService.getFirebaseUser$().pipe(
        concatMap(user => this.authService.uploadFile$("receipts", this.receiptFile!, user.uid).pipe(
          concatMap(this.modifyDB)
        )),
        map(res => {
          this.router.navigateByUrl("/dashboard/updatecourse");
          this.helper.toggleDialog(-1);
          return "done"
        })
      );
    }
  }

  updateCollections() {
  }

  onChange(what: any) {
    const r = this.receipt.nativeElement as HTMLInputElement;
    if (r.files && r.files.length) {
      const file = r.files[0];
      this.receiptFile = file;
      this.receiptURL = URL.createObjectURL(file);
      console.log('r.files => ', URL.createObjectURL(r.files[0]));
    }
  }

  dismissOverlay(pay: string) {
    this.paymentSub$ = NEVER;
    this.uploadStarted = false;
    if (pay === 'done') this.router.navigateByUrl('/dashboard/updatecourse')
  }

  verifyTransaction = (transaction: PaystackTransaction, callback: () => boolean) => {
    return this.authService.verifyTransaction({ reference: transaction.reference }).pipe(
      concatMap(res => {
        console.log("res => ", res);
        if (res.data.status === "success" && res.data.amount) { // Confirm payment amount
          return this.aggregateParams$("").pipe(
            map(params => {
              return {
                ...params,
                paymentId: res,
                approved: true
              }
            }),
            concatMap(this.addDocsByCategory),
            map(callback),
            concatMap(_val => {
              this.helper.resetDialog();
              return this.router.navigate(["../.."], { relativeTo: this.activatedRoute })
            })
          )
        }
        this.showErrorDialog();
        return of(false)
      })
    )
  }

  showCancelDialog = () => {
    this.helper.setDialog({
      title: "Cancelled!",
      message: `You have cancelled this payment. Kindly wait a few minutes before trying again.`,
      buttonText: "Dismiss"
    });
    this.helper.toggleDialog(0);
    return true;
  }

  onCancel = (transaction: PaystackTransaction) => {
    this.payWithCard$ = this.verifyTransaction(transaction, this.showCancelDialog);
  }

  cancel = () => {
    this.showCancelDialog();
    this.payWithCard$ = null;
  }

  showErrorDialog = (message="") => {
    this.helper.setDialog({
      title: "Error!",
      message: message ? message : `It seems an error occurred while making your payment. 
      Kindly wait a few minutes before trying again.`,
      buttonText: "Try again"
    });
    this.helper.toggleDialog(0);
    return true
  }

  onError = (transaction: PaystackTransaction) => {
    this.payWithCard$ = this.verifyTransaction(transaction, this.showErrorDialog);
  }

  error = (type: string, message: string) => {
    this.showErrorDialog(message);
    this.payWithCard$ = null;
  }

  showSuccessDialog = () => {
    this.helper.setDialog({
      title: "Payment Successful",
      message: "Your payment was successful. You should now have access to the course.",
      buttonText: "Continue"
    });
    this.helper.toggleDialog(0);
    return true
  }

  onSuccess = (transaction: PaystackTransaction) => {
    this.payWithCard$ = this.verifyTransaction(
      transaction,
      this.showSuccessDialog
    );
  }

  newTransaction() {
    const popup = new PaystackPop();
    this.payWithCard$ = this.activatedRoute.paramMap.pipe(
      map(params => {
        return {
          category: params.get("category") ? params.get("category") as string : "",
          uCourseId: params.get("updateCourseId") ? params.get("updateCourseId") as string : ""
        }
      }),
      concatMap(obj => this.authService.getAppUser$().pipe(
        map(user => {
          return {
            userId: user.userId, category: obj.category as 'jnr' | 'snr' | 'tot' | 'tot-resident',
            uCourseId: obj.uCourseId, email: user.email
          }
        })
      )),
      concatMap(vals => this.authService.fetchPaystackConfig$().pipe(
        map(config => {
          popup.newTransaction({
            key: config[environment.public_key as 'test_pk' | 'live_pk'],
            channels: ["card"],
            amount: BY_CATEGORY[vals.category].amount,
            email: vals.email,
            metadata: {
              custom_fields: [
                {
                  display_name: "Category",
                  variable_name: "category",
                  value: BY_CATEGORY[vals.category].name
                },
                {
                  display_name: "Fee",
                  variable_name: "fee",
                  value: BY_CATEGORY[vals.category].fee
                },
                {
                  display_name: "Course ID",
                  variable_name: "course_id",
                  value: vals.uCourseId
                }
              ]
            },
            reference: `${vals.userId}_${vals.uCourseId}_${Date.now()}`,
            onSuccess: this.onSuccess,
            onCancel: this.cancel
          })
        })
      )),
      map(_void => true)
    )
  }

  payNow() {
    this.payWithCard$ = this.authService.getAppUser$().pipe(
      concatMap(user => this.authService.initialiseTransaction({
        email: user.email,
        amount: 25000 * 100,
        reference: user.userId.concat("_", Date.now().toString()),
        secret_key: environment.secret_key,
        metadata: {
          updateCourseId: "",
          updateCourseType: ""
        }
      })),
      map(res => {
        // console.log("res => ", res);
        typeof (res);
        console.log("res.data => ", res.data);
        console.log("res.data.access_code => ", res.data.access_code);
        const popup = new PaystackPop();
        // popup.newTransaction({})
        // let rs = popup.resumeTransaction as
        const popupTransaction = popup.resumeTransaction(res.data.access_code as unknown as ResumeOptions);
        popupTransaction.getStatus().status === "success";
        return true
      })
    )
  }
}
