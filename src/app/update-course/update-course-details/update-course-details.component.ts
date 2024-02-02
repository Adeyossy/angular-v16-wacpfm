import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { User } from 'firebase/auth';
import { collection, doc, runTransaction, writeBatch } from 'firebase/firestore';
import { AsyncSubject, Observable, Subscription, concatMap, from, iif, map, of, partition } from 'rxjs';
import { UPDATE_COURSES, UPDATE_COURSES_LECTURES, UpdateCourse, UpdateCourseDetails, UpdateCourseLecture, UpdateCourseRev } from 'src/app/models/update_course';
import { UPDATE_COURSES_RECORDS, UpdateCourseRecord } from 'src/app/models/update_course_record';
import { AppUser, USERS } from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth.service';
import { HelperService } from 'src/app/services/helper.service';

@Component({
  selector: 'app-update-course-details',
  templateUrl: './update-course-details.component.html',
  styleUrls: ['./update-course-details.component.css']
})
export class UpdateCourseDetailsComponent implements OnInit, OnDestroy {
  ongoing: Observable<UpdateCourseRev> = new Observable();
  courseRecords: Observable<UpdateCourseRecord[]> = new Observable();
  user$: Observable<AppUser> = new Observable();
  updateCourseLecture$: Observable<UpdateCourseLecture[]> = new Observable();
  lecturesPerRecord$: Observable<UpdateCourseLecture[][][]> = new Observable();
  lecturesPerRecordAsync: AsyncSubject<UpdateCourseLecture[][][]> = new AsyncSubject();
  lecturesSplit: Observable<UpdateCourseLecture[]>[] = [];
  updateCourseId = "";
  openCategoryUI = false;
  day: number[] = []; // first day (zero-based numbering)
  conversionSub = new Subscription();

  constructor(private activatedRoute: ActivatedRoute, private authService: AuthService,
    public helper: HelperService) {
      this.lecturesPerRecord$.subscribe(this.lecturesPerRecordAsync);
    }

  ngOnInit(): void {
    this.ongoing = this.activatedRoute.paramMap.pipe(
      map(params => {
        const updateCourseId = params.get("updateCourseId");
        if (updateCourseId) return updateCourseId;
        else throw new Error("Route does not exist");
      }),
      concatMap(updateCourseId => {
        return this.authService.getDoc$(UPDATE_COURSES, updateCourseId);
      }),
      map(doc => {
        if (doc.exists()) return doc.data() as UpdateCourse;
        else throw new Error(this.authService.FIRESTORE_NULL_DOCUMENT);
      }),
      map(uCourse => {
        return {
          creator: uCourse.creator, endDate: uCourse.endDate, title: uCourse.title,
          updateCourseId: uCourse.updateCourseId, startDate: uCourse.startDate,
          registrationOpenDate: uCourse.registrationOpenDate,
          registrationCloseDate: uCourse.registrationCloseDate,
          resourcePersons: uCourse.resourcePersons,
          fellowship: { 
            certificate: uCourse.fellowshipCertificate,
            cpd: uCourse.fellowshipCPD,
            lectures: uCourse.fellowshipLectures,
            participants: uCourse.fellowshipParticipants,
            releaseResources: uCourse.fellowshipRelease,
            theme: uCourse.fellowshipTheme
          },
          membership: { 
            certificate: uCourse.membershipCertificate,
            cpd: uCourse.membershipCPD,
            lectures: uCourse.membershipLectures,
            participants: uCourse.membershipParticipants,
            releaseResources: uCourse.membershipRelease,
            theme: uCourse.membershipTheme
          },
          tot: { 
            certificate: uCourse.totCertificate,
            cpd: uCourse.totCPD,
            lectures: uCourse.totLectures,
            participants: uCourse.totParticipants,
            releaseResources: uCourse.totRelease,
            theme: uCourse.totTheme
          }
        };
      })
    );

    this.user$ = this.authService.getDocByUserId$(USERS).pipe(
      map(doc => {
        if (doc.exists()) return doc.data() as AppUser;
        else throw new Error(this.authService.FIRESTORE_NULL_DOCUMENT);
      })
    );

    // this.courseRecords = this.getCourseRecords();

    this.updateCourseLecture$ = this.getCourseLectures();

    this.lecturesPerRecord$ = this.getLecturesPerRecord();

    this.conversionSub = this.user$.pipe(
      concatMap(appUser => this.ongoing.pipe(
        concatMap((uCourse) => this.getCourseRecords().pipe(
          concatMap(records => {
            return iif(() => records.length > 0, of(null), 
              this.batchWriteRecords(uCourse, appUser))             
          })
        ))
      ))
    ).subscribe({
      next: _val => {
        console.log("converted successfully");
        this.courseRecords = this.getCourseRecords().pipe(
          map(rec => rec.sort((a, b) => a.courseType.charCodeAt(0) - b.courseType.charCodeAt(0)))
        );
        this.updateCourseLecture$ = this.getCourseLectures();
        this.lecturesPerRecord$ = this.getLecturesPerRecord();
        const lprAsync = new AsyncSubject<UpdateCourseLecture[][][]>();
        this.lecturesPerRecord$.subscribe(lprAsync);
        this.lecturesPerRecordAsync = lprAsync;
      },
      error: err => {
        console.log("error on conversion");
        console.log(err);
      },
      complete: () => {
        console.log("conversion complete");
      }
    })
  }

  ngOnDestroy(): void {
    this.conversionSub.unsubscribe()
  }

  getCourseRecords() {
    return this.activatedRoute.paramMap.pipe(
      concatMap(params => this.authService.queryCollections$(UPDATE_COURSES_RECORDS,
        "updateCourseId", "==", params.get("updateCourseId") as string)),
      map(doc => doc.docs.map(docDoc => {
        this.day.push(0);
        const data = docDoc.data() as UpdateCourseRecord;
        if(!Object.hasOwn(data, 'id') || !data.id) data.id = docDoc.id;
        return data;
      })),
      concatMap(doc => this.user$.pipe(
        map(user => doc.filter(d => d.userEmail.toLowerCase() === user.email.toLowerCase())
          .sort((a, b) => a.courseType.charCodeAt(0) - b.courseType.charCodeAt(0)))
      ))
    );
  }

  getCourseLectures() {
    return this.activatedRoute.paramMap.pipe(
      concatMap(params => this.authService.queryCollections$(UPDATE_COURSES_LECTURES, "updateCourseId",
        "==", params.get("updateCourseId") as string)),
      map(doc => doc.docs.map(docDoc => docDoc.data() as UpdateCourseLecture)
        .sort((a, b) => parseInt(a.startTime) - parseInt(b.startTime))));
  }

  getLecturesPerRecord() {
    return this.updateCourseLecture$.pipe(
      concatMap(lectures => {
        // console.log("piping lpr");
        return this.courseRecords.pipe(
          map(records =>
            records.map(record =>
              lectures.filter(lect => lect.courseType === record.courseType)
            )
          )
        )
      }),
      map(lecturess => lecturess.map(lectures => [
        lectures.filter((lecture, index, array) =>
          new Date(parseInt(lecture.startTime)).getDay() ===
          new Date(parseInt(array[0].startTime)).getDay()),
        lectures.filter((lecture, index, array) =>
          new Date(parseInt(lecture.startTime)).getDay() !==
          new Date(parseInt(array[0].startTime)).getDay())
      ]))
    )
  }

  toggleDay(r: number, day: number) {
    if (this.day[r] !== day) this.day[r] = day;
  }

  getCourseTypeDeets(obj: UpdateCourseRev, property: "Membership" | "Fellowship" | "ToT") {
    return obj[property.toLowerCase() as "membership" | "fellowship" | "tot"]
  }

  createNewRecord(refId: string, uCourse: UpdateCourseRev, appUser: AppUser, 
    courseType: "Membership" | "Fellowship" | "ToT") {
    return {
      id: refId,
      userEmail: appUser.email.toLowerCase().trim(),
      userId: appUser.userId,
      courseType: courseType,
      paymentId: "",
      updateCourseId: uCourse!.updateCourseId,
      paymentEvidence: ""
    } as UpdateCourseRecord
  }

  batchWriteRecords(uCourse: UpdateCourseRev, appUser: AppUser) {
    return this.authService.getFirestore$().pipe(
      concatMap(db => {
          const batch = writeBatch(db);
          if (uCourse!.membership.participants.find(member =>
            member.toLowerCase().trim() === appUser.email.toLowerCase().trim())) {
            const memberRef = doc(collection(db, UPDATE_COURSES_RECORDS));
            batch.set(memberRef, 
              this.createNewRecord(memberRef.id, uCourse, appUser, "Membership"))
          }

          if (uCourse!.fellowship.participants.find(fellow =>
            fellow.toLowerCase().trim() === appUser.email.toLowerCase().trim())) {
            const fellowRef = doc(collection(db, UPDATE_COURSES_RECORDS));
            batch.set(fellowRef, 
              this.createNewRecord(fellowRef.id, uCourse, appUser, "Fellowship"))
          }

          if (uCourse!.tot.participants.find(tot =>
            tot.toLowerCase().trim() === appUser.email.toLowerCase().trim())) {
            const totRef = doc(collection(db, UPDATE_COURSES_RECORDS));
            batch.set(totRef, 
              this.createNewRecord(totRef.id, uCourse, appUser, "ToT"))
          }

          return from(batch.commit());        
      })
    )
  }
}
