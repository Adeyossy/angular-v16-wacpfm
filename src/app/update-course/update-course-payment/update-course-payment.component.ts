import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthErrorCodes, User } from 'firebase/auth';
import { where } from 'firebase/firestore';
import { UploadResult } from 'firebase/storage';
import { NEVER, Observable, Subscription, catchError, concatMap, map, of, timeout } from 'rxjs';
import { UPDATE_COURSES_RECORDS, UpdateCourseRecord, UpdateCourseType } from 'src/app/models/update_course_record';
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

  feeByCategory = {
    jnr: 25945.37*100,
    snr: 25945.37*100,
    tot: 10945.37*100,
    'tot-resident': 20945.37*100
  }

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
    paymendId: Payment | null = null, approved=false) {
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
    paymentId: Payment | null=null, approved=false ) {
    return this.authService.addDoc$(UPDATE_COURSES_RECORDS,
      this.create(courseType, uCourseId, user, downloadURL, paymentId, approved))
  }

  addDocsByCategory = (params: {category: string, uCourseId: string, result: string, user: User,
    paymentId?: Payment | null, approved?: boolean }) => {
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
          this.create("Membership", params.uCourseId, params.user, params.result),
          this.create("Fellowship", params.uCourseId, params.user, params.result),
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

  onSuccess = (transaction: PaystackTransaction) => {
    this.payWithCard$ = this.authService.verifyTransaction({reference: transaction.reference}).pipe(
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
            concatMap(_val => this.router.navigate([], {relativeTo: this.activatedRoute}))
          )
        } return of(false)
      })
    )
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
            userId: user.userId, category: obj.category,
            uCourseId: obj.uCourseId, email: user.email
          }
        })
      )),
      concatMap(vals => this.authService.fetchPaystackConfig$().pipe(
        map(config => {
          popup.newTransaction({
            key: config[environment.public_key as 'test_pk' | 'live_pk'],
            channels: ["card"],
            amount: this.feeByCategory[vals.category as 'jnr' | 'snr' | 'tot' | 'tot-resident'],
            email: vals.email,
            reference: `${vals.userId}_${vals.uCourseId}_${Date.now()}`,
            onSuccess: this.onSuccess
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
