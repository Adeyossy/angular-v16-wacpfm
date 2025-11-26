import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthErrorCodes, User } from 'firebase/auth';
import { arrayUnion, FieldValue, where } from 'firebase/firestore';
import { UploadResult } from 'firebase/storage';
import { NEVER, Observable, Subscription, catchError, concatMap, map, of, timeout, zip } from 'rxjs';
import { BY_CATEGORY, UPDATE_COURSES_RECORDS, UpdateCourseRecord, UpdateCourseType } from 'src/app/models/update_course_record';
import { AuthService } from 'src/app/services/auth.service';
import { HelperService } from 'src/app/services/helper.service';
import PaystackPop from '@paystack/inline-js';
import { BasicResponse, Category, CustomerResponse, Payment, PaymentParams, PaystackInitResponse, PaystackResponse, PaystackTransaction } from 'src/app/models/payment';
import { environment } from 'src/environments/environment';
import { UPDATE_COURSES } from 'src/app/models/update_course';
import { UpdateCourseService } from 'src/app/services/update-course.service';

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
  payWithCard$: Observable<string> | null = null;
  paystackCustomer$: Observable<CustomerResponse> = of();

  uploadStarted = false;
  popup: PaystackPop = new PaystackPop();
  declare transaction: PaystackTransaction; // stored reference during automatic verification
  hasVerificationFailed = false; // if automatic verification failed
  enteredReference = ""; // entered by user if verification failed and there's no stored transaction
  verifyAgain$: Observable<string> | null = null;

  constructor(private activatedRoute: ActivatedRoute, private authService: AuthService,
    private router: Router, public helper: HelperService,
    private updateCourservice: UpdateCourseService) {
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
        map(user => {
          const filteredRecords = res.filter(r => r.userEmail.toLowerCase().trim() ===
            user!.email?.toLowerCase().trim());
          if (filteredRecords.length === 0) {
            this.paystackCustomer$ = this.authService.getPaystackCustomer({
              email: user.email!,
              secret_key: environment.secret_key
            })
          }
          return filteredRecords;
        })
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
    // console.log("upload event => ", event);
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
        return this.addNewRecord("" as unknown as UpdateCourseType, params.uCourseId,
          params.user, params.result, params.paymentId, params.approved);
    }
  }

  aggregateParams$ = (result: string) => {
    return this.activatedRoute.paramMap.pipe(
      map(params => ({
        category: params.get("category") ? params.get("category") as Category : "",
        uCourseId: params.get("updateCourseId") ? params.get("updateCourseId") as string : "",
        result
      })),
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

  /**
   * Upload payment receipt for those who paid externally for admin verification.
   */
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
          this.helper.resetComponentDialogData();
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
      // console.log('r.files => ', URL.createObjectURL(r.files[0]));
    }
  }

  dismissOverlay(pay: string) {
    this.paymentSub$ = NEVER;
    this.uploadStarted = false;
    if (pay === 'done') this.router.navigateByUrl('/dashboard/updatecourse')
  }

  /**
   * Create records for successful but unverified transactions. This will be useful for
   * verification at the dashboard as one of the checks run to grant access to the course.
   * @param params object containing user info, update course ID, course category and result?
   * @param transaction Paystack transaction object
   * @returns Array<UpdateCourseRecords>
   */
  createUnverifiedRecord = (params: PaymentParams, transaction: PaystackTransaction) => {
    return zip(BY_CATEGORY[params.category as Category]
      .items.map(category => this.createUnverifiedRecordWithId(
        params, transaction, category
      )));
  }

  createUnverifiedRecordWithId = (
    params: PaymentParams,
    transaction: PaystackTransaction,
    category: string): Observable<UpdateCourseRecord> => {
    return this.authService.getDocId$(UPDATE_COURSES_RECORDS).pipe(
      map(docc => (
        {
          courseType: category as UpdateCourseType,
          updateCourseId: params.uCourseId,
          id: docc.id,
          paymentId: null,
          userEmail: params.user.email!,
          userId: params.user.uid,
          transaction,
          paymentEvidence: ""
        }
      ))
    )
  }

  /**
   * Uploads the created records for successful but unverified payments to cloud firestore.
   * @param records Array of update course records
   * @returns Observable of a string containing the status of the upload
   */
  saveUnverifiedRecord = (records: UpdateCourseRecord[]) => {
    return this.authService.batchWriteDocs$(records.map(r => ({
      path: `${UPDATE_COURSES_RECORDS}/${r.id}`,
      data: r,
      type: "set"
    })));
    // return this.authService.addDocsInBulk$(records, UPDATE_COURSES_RECORDS);
  }

  createApprovedRecord = (params: PaymentParams,
    response: BasicResponse, transaction: PaystackTransaction): UpdateCourseRecord[] => {
    return BY_CATEGORY[params.category as Category]
      .items.map(category => {
        let record: UpdateCourseRecord = {
          courseType: category as UpdateCourseType,
          updateCourseId: params.uCourseId,
          id: "",
          paymentId: response,
          userEmail: response.data.customer.email,
          userId: params.user.uid,
          approved: response.data.customer.email.trim() === params.user.email?.trim(),
          transaction,
          paymentEvidence: "",
          flaggedForFraud: !(response.data.customer.email.trim() === params.user.email?.trim())
        }
        return record;
      });
  }

  updateCourseUpdate = (records: UpdateCourseRecord[]) => {
    const update: { [p: string]: FieldValue } = {};
    records.forEach(r => {
      if (r.courseType === "Membership") update["membershipParticipants"] = arrayUnion(r.userEmail);
      if (r.courseType === "Fellowship") update["fellowshipParticipants"] = arrayUnion(r.userEmail);
      if (r.courseType === "ToT") update["totParticipants"] = arrayUnion(r.userEmail);
    });
    return update;
  }

  createDeclinedRecord = (params: { user: User, uCourseId: string, category: string },
    response: BasicResponse, transaction: PaystackTransaction): UpdateCourseRecord[] => {
    return BY_CATEGORY[params.category as Category]
      .items.map(category => {
        let record: UpdateCourseRecord = {
          courseType: category as UpdateCourseType,
          updateCourseId: params.uCourseId,
          id: "",
          paymentId: null,
          userEmail: response.data.customer.email,
          userId: params.user.uid,
          transaction,
          paymentEvidence: "",
          flaggedForFraud: !(response.data.customer.email.trim() === params.user.email?.trim())
        }
        return record;
      });
  }

  verifyTransaction = (transaction: PaystackTransaction, callback: () => boolean, params: PaymentParams) => {
    // console.log("transaction in verifyTransaction => ", transaction);
    // console.log("transaction reference in verifyTransaction => ", transaction.reference);
    return this.authService.verifyTransaction({
      reference: transaction.reference,
      secret_key: environment.secret_key
    }).pipe(
      concatMap(response => {
        if (response && response.data && response.data.status === "success" &&
          response.data.amount === BY_CATEGORY[params.category as Category].amount
          && response.data.customer && response.data.customer.email.trim() ===
          params.user.email?.trim()) {
          const val = this.createApprovedRecord(params, response, transaction);
          // console.log("Created approved records =>", val);
          return this.authService.addDocsInBulk$(val, UPDATE_COURSES_RECORDS).pipe(
            concatMap(_v => this.authService.batchWriteDocs$([{
              path: `${UPDATE_COURSES}/${params.uCourseId}`,
              data: this.updateCourseUpdate(val),
              type: "update"
            }]))
          );
        } else {
          const val = this.createDeclinedRecord(params, response, transaction);
          // console.log("Created declined records =>", val);
          return this.authService.addDocsInBulk$(val, UPDATE_COURSES_RECORDS);
        }
      }),
      map(callback),
      concatMap(_val => {
        this.helper.resetDialog();
        return this.router.navigate(["../.."], { relativeTo: this.activatedRoute })
      }),
      map(state => state ? "Successful" : "Verification Failed"),
      catchError(err => {
        // console.log("Caught error => ", err);
        this.showErrorDialog();
        this.payWithCard$ = null;
        this.verifyAgain$ = null;
        return of("Verification Failed");
      })
    )
  }

  verifyFromRecord$ = (record: UpdateCourseRecord, callback: () => boolean) => {
    return this.updateCourservice.verifyPaymentFromRecord$(record).pipe(
      map(callback),
      concatMap(_val => {
        this.helper.resetDialog();
        return this.router.navigate(["../.."], { relativeTo: this.activatedRoute })
      }),
      map(state => state ? "Successful" : "Verification Failed"),
      catchError(err => {
        // console.log("Caught error => ", err);
        this.showErrorDialog();
        this.payWithCard$ = null;
        this.verifyAgain$ = null;
        return of("Verification Failed");
      })
    )
  }

  verifyFromRecords$ = (records: UpdateCourseRecord[], callback: () => boolean) => {
    return this.updateCourservice.verifyPaymentFromRecords$(records).pipe(
      map(callback),
      concatMap(_val => {
        this.helper.resetDialog();
        return this.router.navigate(["../.."], { relativeTo: this.activatedRoute })
      }),
      map(state => state ? "Successful" : "Verification Failed"),
      catchError(err => {
        // console.log("Caught error => ", err);
        this.showErrorDialog();
        this.payWithCard$ = null;
        this.verifyAgain$ = null;
        return of("Verification Failed");
      })
    )
  }

  showRefErrorDialog = () => {
    this.helper.setDialog({
      title: "Reference Error",
      message: "Invalid reference pasted. Kindly check the reference again. There should be only 2 hyphens and no space.",
      buttonText: "Close"
    });
    this.helper.toggleDialog(0);
  }

  showVerifyErrorDialog = () => {
    this.helper.setDialog({
      title: "Error",
      message: "An error occurred while verifying your payment.",
      buttonText: "Verify Again"
    });
    this.helper.toggleDialog(0);
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

  cancel = () => {
    // console.log("Cancelled");
    this.showCancelDialog();
    this.payWithCard$ = null;
  }

  showErrorDialog = (message = "") => {
    this.helper.setDialog({
      title: "Error!",
      message: message ? message : `It seems an error occurred while making your payment. 
      Kindly wait a few minutes before trying again.`,
      buttonText: "Try again"
    });
    this.helper.toggleDialog(0);
    return true
  }

  error = (error: { type: string, message: string }) => {
    // console.log("An error occurred");
    // console.log("Error type =>", error.type);
    // console.log("Error message =>", error.message);
    this.showErrorDialog(error.message);
    this.payWithCard$ = null;
  }

  showWaitingDialog = (startTime: number) => {
    this.helper.setDialog({
      title: "Please wait",
      message: `Payment information is being processed (${startTime})`,
      buttonText: "Continue"
    });
    this.helper.toggleDialog(0);
    return true
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
    // console.log("onSuccess called");
    // console.log("transaction in onSuccess =>", transaction);

    let startTime = 10;
    this.transaction = transaction;
    this.showWaitingDialog(startTime);
    const countdown = setInterval(
      () => {
        startTime = startTime - 1;
        this.showWaitingDialog(startTime)
        if (startTime === 0) clearInterval(countdown);
      },
      1000
    );

    // Fetch params and use for the following:
    // 1. Create records for successful but unverified payments
    // 2. Save those unverified records to firestore - useful for dashboard verification
    // 3. Finally verify the transaction
    setTimeout(
      () => {
        this.payWithCard$ = this.aggregateParams$("").pipe(
          concatMap(params => this.createUnverifiedRecord(params, transaction)),
          concatMap(records => this.saveUnverifiedRecord(records).pipe(
            concatMap(_v => this.verifyFromRecords$(records, this.showSuccessDialog))
          ))
        )
      },
      10000
    );
  }

  toTransaction = (reference: string) => {
    return {
      id: "",
      message: "",
      redirecturl: "",
      reference,
      status: "",
      trans: "",
      transaction: "",
      trxref: ""
    }
  }

  parseTimestamp(timestamp: string) {
    const epochOffset = parseInt(timestamp);
    const nan = isNaN(epochOffset);
    if (!nan) {
      return (new Date().getMonth() - new Date(epochOffset).getMonth()) <= 4
    } return nan;
  }

  parseReference(reference: string, customer: CustomerResponse) {
    // console.log("customer => ", customer);
    const segments = reference.split("-");
    const [userId, updateCourseId, timestamp] = segments.length === 3 ? segments : reference.split("_");
    const timetruth = this.parseTimestamp(timestamp);
    this.verifyAgain$ = this.aggregateParams$("").pipe(
      concatMap(params => {
        if (userId === params.user.uid && updateCourseId === params.uCourseId &&
          timetruth && customer.status) {
          return this.verifyTransaction(
            this.toTransaction(reference),
            this.showSuccessDialog,
            params
          );
        }
        this.showRefErrorDialog();
        this.verifyAgain$ = null;
        return of("Error occurred");
      })
    );
  }

  verifyFromCustomerData = (customer: CustomerResponse) => {
    // console.log("customer =>", customer);
    if (customer.status) {
      if (customer.data && customer.data.transactions.length > 0) {
        this.verifyAgain$ = this.activatedRoute.paramMap.pipe(
          map(params => {
            let courseId = params.get("updateCourseId");
            return courseId ? courseId : "";
          }),
          map(courseId => customer.data!.transactions.find(
            transaction => transaction.reference.split("-")[1] === courseId ||
              transaction.reference.split("_")[1] === courseId)
          ),
          concatMap(transaction => {
            // console.log("transaction => ", transaction);
            if (transaction !== undefined) {
              return this.aggregateParams$("").pipe(
                concatMap(params => this.verifyTransaction(
                  transaction,
                  this.showSuccessDialog,
                  params
                ))
              );
            }

            return of("Failed");
          })
        )
      } else {
        this.showVerifyErrorDialog();
      }
    } else this.showVerifyErrorDialog();
  }

  newTransaction() {
    this.popup = new PaystackPop();
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
            userId: user.userId, category: obj.category as 'jnr' | 'snr' | 'tot' | 'tot-resident' | 'developer',
            uCourseId: obj.uCourseId, email: user.email
          }
        })
      )),
      concatMap(vals => this.authService.fetchPaystackConfig$().pipe(
        map(config => {
          // console.log("Payment started");
          type Channels = ["card", "bank_transfer", "apple_pay", "ussd", "qr", "mobile_money", "eft"];
          const channels: Channels = [
            "card", "bank_transfer", "bank", "apple_pay", "ussd", "qr", "mobile_money", "eft"
          ] as unknown as Channels;
          const newPopup = this.popup.newTransaction({
            key: config[environment.public_key as 'test_pk' | 'live_pk'],
            channels,
            amount: config[vals.category].amount,
            email: vals.email,
            metadata: {
              custom_fields: [
                {
                  display_name: "Category",
                  variable_name: "category",
                  value: config[vals.category].name
                },
                {
                  display_name: "Fee",
                  variable_name: "fee",
                  value: config[vals.category].fee
                },
                {
                  display_name: "Course ID",
                  variable_name: "course_id",
                  value: vals.uCourseId
                }
              ]
            },
            reference: `${vals.userId}-${vals.uCourseId}-${Date.now()}`,
            onSuccess: this.onSuccess,
            onError: this.error,
            onCancel: this.cancel
          });
          // console.log("getStatus response =>", newPopup.getStatus);

        })
      )),
      map(_void => "Payment in progress")
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
        // console.log("res.data => ", res.data);
        // console.log("res.data.access_code => ", res.data.access_code);
        const popup = new PaystackPop();
        // popup.newTransaction({})
        // let rs = popup.resumeTransaction as
        const popupTransaction = popup.resumeTransaction(res.data.access_code as unknown as ResumeOptions);
        popupTransaction.getStatus().status === "success";
        return "Payment in progress"
      })
    )
  }
}
