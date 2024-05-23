import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthErrorCodes, User } from 'firebase/auth';
import { UploadResult } from 'firebase/storage';
import { NEVER, Observable, Subscription, catchError, concatMap, map, timeout } from 'rxjs';
import { UPDATE_COURSES_RECORDS, UpdateCourseRecord, UpdateCourseType } from 'src/app/models/update_course_record';
import { AuthService } from 'src/app/services/auth.service';

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

  uploadStarted = false;

  constructor(private activatedRoute: ActivatedRoute, private authService: AuthService,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    this.courseRecords$ = this.activatedRoute.paramMap.pipe(
      map(params => {
        const id = params.get("updateCourseId");
        if (id !== null) return id;
        throw "Param does not exist";
      }),
      concatMap(id => this.authService.queryCollections$(UPDATE_COURSES_RECORDS,
        "updateCourseId", "==", id)),
      map(res => res.docs.map(doc => doc.data() as UpdateCourseRecord)
        .filter(rec => rec.paymentEvidence)),
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

  create(courseType: UpdateCourseType, uCourseId: string, user: User, downloadURL: string) {
    return {
      courseType: courseType,
      updateCourseId: uCourseId,
      paymentId: null,
      paymentEvidence: downloadURL,
      id: "",
      userEmail: user.email!,
      userId: user.uid
    } as UpdateCourseRecord
  }

  addNewRecord(courseType: UpdateCourseType, uCourseId: string, user: User, downloadURL: string) {
    return this.authService.addDoc$(UPDATE_COURSES_RECORDS,
      this.create(courseType, uCourseId, user, downloadURL)).pipe(
        map(doc => "done")
      )
  }

  // addMultipleRecords(uCourseId)

  uploadReceipt() {
    // Use transactions for multiple uploads
    // When payment receipt upload is done
    this.uploadStarted = true;
    if (this.receiptFile) {
      this.paymentSub$ = this.authService.getFirebaseUser$().pipe(
        map(user => {
          if (user) return user;
          throw new Error(AuthErrorCodes.NULL_USER);
        }),
        concatMap(user => this.authService.uploadFile$("receipts", this.receiptFile!, user.uid).pipe(
          concatMap(result => this.activatedRoute.paramMap.pipe(
            map(params => {
              return {
                category: params.get("category") ? params.get("category") as string : "",
                uCourseId: params.get("updateCourseId") ? params.get("updateCourseId") as string : "",
                result: result
              }
            }),
            concatMap(params => this.authService.getFirebaseUser$().pipe(
              map(user => {
                if (user) return { ...params, user };
                throw new Error(AuthErrorCodes.NULL_USER)
              })
            )),
            concatMap(params => {
              switch (params.category) {
                case "jnr":
                  return this.addNewRecord("Membership", params.uCourseId, params.user, result);

                case "snr":
                  return this.addNewRecord("Fellowship", params.uCourseId, params.user, result);

                case "tot":
                  return this.addNewRecord("ToT", params.uCourseId, params.user, result);

                case "tot-resident":
                  return this.authService.addDocsInBulk$([
                    this.create("Membership", params.uCourseId, params.user, result),
                    this.create("Fellowship", params.uCourseId, params.user, result),
                    this.create("ToT", params.uCourseId, params.user, result),
                  ], UPDATE_COURSES_RECORDS);

                default:
                  throw new Error("Error Uploading");
              }
            })
          ))
        ))
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
}
