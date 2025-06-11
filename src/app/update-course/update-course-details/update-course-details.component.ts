import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { User } from 'firebase/auth';
import { collection, doc, runTransaction, where, writeBatch } from 'firebase/firestore';
import { AsyncSubject, NEVER, Observable, Subscription, concatMap, from, iif, map, of, partition } from 'rxjs';
import { UPDATE_COURSES, UPDATE_COURSES_LECTURES, UpdateCourse, UpdateCourseDetails, UpdateCourseLecture, UpdateCourseRev } from 'src/app/models/update_course';
import { UPDATE_COURSES_RECORDS, UpdateCourseRecord, UpdateCourseType } from 'src/app/models/update_course_record';
import { AppUser, IndexType, RESOURCE_PERSONS, ResourcePerson, USERS } from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth.service';
import { HelperService } from 'src/app/services/helper.service';

@Component({
  selector: 'app-update-course-details',
  templateUrl: './update-course-details.component.html',
  styleUrls: ['./update-course-details.component.css']
})
export class UpdateCourseDetailsComponent implements OnInit, OnDestroy {
  ongoing: Observable<UpdateCourseRev> = new Observable();
  courseRecords$: Observable<UpdateCourseRecord[]> = new Observable();
  user$: Observable<AppUser> = new Observable();
  updateCourseLecture$: Observable<UpdateCourseLecture[]> = new Observable();
  lecturesPerRecord$: Observable<UpdateCourseLecture[][][]> = new Observable();
  lecturesPerRecordAsync: AsyncSubject<UpdateCourseLecture[][][]> = new AsyncSubject();
  lecturesSplit: Observable<UpdateCourseLecture[]>[] = [];
  updateCourseId = "";
  openCategoryUI = false;
  day: number[] = []; // first day (zero-based numbering)
  conversionSub = new Subscription();
  pattern = /-/g;
  today = Date.now();
  resourcePersons$: Observable<ResourcePerson[]> = of([]);
  elders$: Observable<string> = NEVER;
  membershipRecord$: Observable<UpdateCourseRecord> = NEVER;
  fellowshipRecord$: Observable<UpdateCourseRecord> = NEVER;
  totRecord$: Observable<UpdateCourseRecord> = NEVER;

  constructor(private activatedRoute: ActivatedRoute, private authService: AuthService,
    public helper: HelperService) {
    this.lecturesPerRecord$.subscribe(this.lecturesPerRecordAsync);
  }

  ngOnInit(): void {
    this.getElders();

    this.resourcePersons$ = this.activatedRoute.paramMap.pipe(
      concatMap(params => {
        const id = params.get("updateCourseId");
        if (id) {
          return this.authService.getFirebaseUser$().pipe(
            concatMap(user => this.authService.queriesCollections$<ResourcePerson>(RESOURCE_PERSONS, [
              where("updateCourseId", "==", id),
              where("userEmail", "==", user.email)
            ]))
          )
        }
        return of([])
      })
    )

    this.ongoing = this.activatedRoute.paramMap.pipe(
      map(params => {
        const updateCourseId = params.get("updateCourseId");
        if (updateCourseId) return updateCourseId;
        else throw new Error("Route does not exist");
      }),
      concatMap(updateCourseId => {
        return this.authService.getDoc$<UpdateCourse>(UPDATE_COURSES, updateCourseId);
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
            participants: typeof(uCourse.fellowshipParticipants) === "string" ? 
              uCourse.fellowshipParticipants.split(", ") : uCourse.fellowshipParticipants,
            releaseResources: uCourse.fellowshipRelease,
            theme: uCourse.fellowshipTheme,
            groupLink: uCourse?.fellowshipGroupLink,
            classLink: uCourse?.fellowshipClassLink
          },
          membership: {
            certificate: uCourse.membershipCertificate,
            cpd: uCourse.membershipCPD,
            lectures: uCourse.membershipLectures,
            participants: typeof(uCourse.membershipParticipants) === "string" ? 
            uCourse.membershipParticipants.split(", ") : uCourse.membershipParticipants,
            releaseResources: uCourse.membershipRelease,
            theme: uCourse.membershipTheme,
            groupLink: uCourse?.membershipGroupLink,
            classLink: uCourse?.membershipClassLink
          },
          tot: {
            certificate: uCourse.totCertificate,
            cpd: uCourse.totCPD,
            lectures: uCourse.totLectures,
            participants: typeof(uCourse.totParticipants) === "string" ? 
            uCourse.totParticipants.split(", ") : uCourse.totParticipants,
            releaseResources: uCourse.totRelease,
            theme: uCourse.totTheme,
            groupLink: uCourse?.totGroupLink,
            classLink: uCourse?.totClassLink
          }
        };
      })
    );

    this.user$ = this.authService.getDocByUserId$<AppUser>(USERS);

    // // this.courseRecords$ = this.getCourseRecords();

    // this.updateCourseLecture$ = this.getCourseLectures();

    // this.lecturesPerRecord$ = this.getLecturesPerRecord();

    this.courseRecords$ = this.user$.pipe(
      concatMap(appUser => this.ongoing.pipe(
        concatMap((uCourse) => this.getCourseRecords(appUser.email).pipe(
          concatMap(records =>  records.length > 0 ? 
            of(records) : this.batchWriteRecords(uCourse, appUser))
        ))
      ))
    );

    // this.conversionSub = this.user$.pipe(
    //   concatMap(appUser => this.ongoing.pipe(
    //     concatMap((uCourse) => this.getCourseRecords(appUser.email).pipe(
    //       concatMap(records => {
    //         return iif(() => records.length > 0, of(null),
    //           this.batchWriteRecords(uCourse, appUser))
    //       })
    //     ))
    //   ))
    // ).subscribe({
    //   next: _val => {
    //     console.log("converted successfully");
    //     this.courseRecords$ = this.getCourseRecords();
    //     this.updateCourseLecture$ = this.getCourseLectures();
    //     this.lecturesPerRecord$ = this.getLecturesPerRecord();
    //     const lprAsync = new AsyncSubject<UpdateCourseLecture[][][]>();
    //     this.lecturesPerRecord$.subscribe(lprAsync);
    //     this.lecturesPerRecordAsync = lprAsync;
    //   },
    //   error: err => {
    //     console.log("error on conversion");
    //     console.log(err);
    //   },
    //   complete: () => {
    //     console.log("conversion complete");
    //   }
    // })
  }

  ngOnDestroy(): void {
    this.conversionSub.unsubscribe()
  }

  hasPaid(course: UpdateCourseRev, email: string) {
    return course.membership.participants.includes(email) ||
      course.fellowship.participants.includes(email) ||
      course.tot.participants.includes(email)
  }

  isMembership(course: UpdateCourseRev, email: string) {
    return course.membership.participants.includes(email);
  }

  isFellowship(course: UpdateCourseRev, email: string) {
    return course.fellowship.participants.includes(email);
  }

  isTot(course: UpdateCourseRev, email: string) {
    return course.tot.participants.includes(email);
  }

  getCourseRecords(email: string) {
    return this.activatedRoute.paramMap.pipe(
      concatMap(params => this.authService.queriesForListener$(UPDATE_COURSES_RECORDS,
        [
          where("updateCourseId", "==", params.get("updateCourseId") as string),
          where("userEmail", "==", email)
        ])
      ),
      map(snapshot => snapshot.docs.map(doc => {
        this.day.push(0);
        const record = doc.data() as UpdateCourseRecord;
        if (!record.hasOwnProperty('id') || !record.id) record.id = doc.id;
        return record;
      }).sort(this.helper.sortCourseType)
      ),
      map(records => {
        console.log("records length in method => ", records.length)
        this.updateCourseLecture$ = this.getCourseLectures();
        this.lecturesPerRecord$ = this.getLecturesPerRecord(records);
        const lprAsync = new AsyncSubject<UpdateCourseLecture[][][]>();
        this.lecturesPerRecord$.subscribe(lprAsync);
        this.lecturesPerRecordAsync = lprAsync;
        return records;
      })
    );
  }

  // Get with multiple queries
  // Use a listener
  getCourseLectures() {
    return this.activatedRoute.paramMap.pipe(
      concatMap(params => this.authService.queryCollections$<UpdateCourseLecture>
        (UPDATE_COURSES_LECTURES, where("updateCourseId", "==", params.get("updateCourseId") as string))),
      map(docs => docs.sort((a, b) => parseInt(a.startTime) - parseInt(b.startTime)))
    );
  }

  // For each lecture record, return an observable of its lectures
  getLecturesPerRecord(records: UpdateCourseRecord[]) {
    return this.updateCourseLecture$.pipe(
      map(lectures => records.map(record =>
        lectures.filter(lect => lect.courseType === record.courseType))
      ),
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

  filterRecords(record: UpdateCourseRecord) {
    return record.approved !== false;
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
      paymentEvidence: "",
      approved: true
    } as UpdateCourseRecord
  }

  batchWriteRecords(uCourse: UpdateCourseRev, appUser: AppUser) {
    console.log("batch writing records");
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
      }),
      map(_v => [] as UpdateCourseRecord[])
    )
  }

  goToClass() {
    const confno = "";
    const zoomURI = `zoommtg://zoom.us/join?action=join&confno=${confno}&pwd=<password>`;
    window.location.href = ""
  }

  getStartDate(newCourse: UpdateCourseRev, courseType: UpdateCourseType) {
    if (courseType === "Membership") {
      return newCourse.startDate
    } else {
      if (courseType === "Fellowship") {
        const date = new Date(newCourse.startDate);
        date.setDate(date.getDate() + 2);
        date.setHours(9);
        return date.getTime();
      } else {
        return newCourse.endDate
      }
    }
  }

  getEndDate(newCourse: UpdateCourseRev, courseType: UpdateCourseType) {
    if (courseType === "Membership") {
      const date = new Date(newCourse.startDate);
      date.setDate(date.getDate() + 1);
      date.setHours(17);
      return date.getTime();
    } else {
      if (courseType === "Fellowship") {
        const date = new Date(newCourse.startDate);
        date.setDate(date.getDate() + 3);
        date.setHours(16);
        return date.getTime();
      } else {
        const end = new Date(newCourse.endDate);
        end.setHours(17);
        return end.getTime();
      }
    }
  }

  calculateDates(newCourse: UpdateCourseRev, courseType: UpdateCourseType) {
    if (courseType === "Membership") {
      const date = new Date(newCourse.startDate);
      date.setDate(date.getDate() + 1);
      date.setHours(16);
      let endDate = date.getTime();
      return [newCourse.startDate, endDate]
    } else {
      if (courseType === "Fellowship") {
        const date = new Date(newCourse.startDate);
        date.setDate(date.getDate() + 2);
        date.setHours(9);
        const startDate = date.getTime();
        date.setDate(date.getDate() + 1);
        date.setHours(16);
        const endDate = date.getTime();
        return [startDate, endDate]
      } else {
        return [newCourse.endDate]
      }
    }
  }

  getElders() {
    this.elders$ = this.authService.fetchElders$().pipe(
      map(d => d["elders"])
    )
  }
}
