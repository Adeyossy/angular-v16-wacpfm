import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { QueryFieldFilterConstraint, where } from 'firebase/firestore';
import { Observable, of, map, concatMap, catchError } from 'rxjs';
import { CacheService } from './cache.service';
import { DEFAULT_UPDATE_COURSE, UPDATE_COURSES, UpdateCourse } from '../models/update_course';
import { UPDATE_COURSES_RECORDS, UpdateCourseRecord } from '../models/update_course_record';
import { CardList } from '../widgets/card-list/card-list.component';

@Injectable({
  providedIn: 'root'
})
export class UpdateCourseService extends CacheService {
  shouldUpgradeDB = false;

  queryUpdateCourse$(where: QueryFieldFilterConstraint[]): Observable<UpdateCourse[]> {
    return this.queryItem$<UpdateCourse>(UPDATE_COURSES, where).pipe(
      map(courses => courses.map(this.defineMissing).map(this.participantsToArray)),
      concatMap(courses => this.shouldUpgradeDB ? this.upgradeDB(courses) : of(courses))
    );
  }

  participantsToArray = (course: UpdateCourse) => {
    if (typeof (course.membershipParticipants) === "string") {
      this.shouldUpgradeDB = true;
      course.membershipParticipants = course.membershipParticipants.split(", ");
    }

    if (typeof (course.fellowshipParticipants) === "string") {
      this.shouldUpgradeDB = true;
      course.fellowshipParticipants = course.fellowshipParticipants.split(", ");
    }

    if (typeof (course.totParticipants) === "string") {
      this.shouldUpgradeDB = true;
      course.totParticipants = course.totParticipants.split(", ");
    }
    console.log("shouldUpgradeDB =>", this.shouldUpgradeDB);
    return course;
  }

  defineMissing = (course: UpdateCourse): UpdateCourse => {
    const c: UpdateCourse = JSON.parse(JSON.stringify(DEFAULT_UPDATE_COURSE));

    return {
      creator: course.creator !== undefined ? course.creator : c.creator,
      endDate: course.endDate !== undefined ? course.endDate : c.endDate,
      fellowshipCertificate: course.fellowshipCertificate !== undefined ?
        course.fellowshipCertificate : c.fellowshipCertificate,
      fellowshipClassLink: course.fellowshipClassLink !== undefined ?
        course.fellowshipClassLink : c.fellowshipClassLink,
      fellowshipCPD: course.fellowshipCPD !== undefined ? course.fellowshipCPD : c.fellowshipCPD,
      fellowshipGroupLink: course.fellowshipGroupLink !== undefined ?
        course.fellowshipGroupLink : c.fellowshipGroupLink,
      fellowshipLectures: course.fellowshipLectures !== undefined ?
        course.fellowshipLectures : c.fellowshipLectures,
      fellowshipParticipants: course.fellowshipParticipants !== undefined ?
        course.fellowshipParticipants : c.fellowshipParticipants,
      fellowshipRelease: course.fellowshipRelease !== undefined ?
        course.fellowshipRelease : c.fellowshipRelease,
      fellowshipTheme: course.fellowshipTheme !== undefined ? course.fellowshipTheme :
        c.fellowshipTheme,
      membershipCertificate: course.membershipCertificate !== undefined ?
        course.membershipCertificate : c.membershipCertificate,
      membershipClassLink: course.membershipClassLink !== undefined ?
        course.membershipClassLink : c.membershipClassLink,
      membershipCPD: course.membershipCPD !== undefined ? course.membershipCPD : c.membershipCPD,
      membershipGroupLink: course.membershipGroupLink !== undefined ?
        course.membershipGroupLink : c.membershipGroupLink,
      membershipLectures: course.membershipLectures !== undefined ?
        course.membershipLectures : c.membershipLectures,
      membershipParticipants: course.membershipParticipants !== undefined ?
        course.membershipParticipants : c.membershipParticipants,
      membershipRelease: course.membershipRelease !== undefined ?
        course.membershipRelease : c.membershipRelease,
      membershipTheme: course.membershipTheme !== undefined ? course.membershipTheme :
        c.membershipTheme,
      registrationCloseDate: course.registrationCloseDate !== undefined ?
        course.registrationCloseDate : c.registrationCloseDate,
      registrationOpenDate: course.registrationOpenDate !== undefined ?
        course.registrationOpenDate : c.registrationOpenDate,
      resourcePersons: course.resourcePersons !== undefined ? course.resourcePersons :
        c.resourcePersons,
      startDate: course.startDate !== undefined ? course.startDate : c.startDate,
      title: course.title !== undefined ? course.title : c.title,
      totCertificate: course.totCertificate !== undefined ?
        course.totCertificate : c.totCertificate,
      totClassLink: course.totClassLink !== undefined ?
        course.totClassLink : c.totClassLink,
      totCPD: course.totCPD !== undefined ? course.totCPD : c.totCPD,
      totGroupLink: course.totGroupLink !== undefined ?
        course.totGroupLink : c.totGroupLink,
      totLectures: course.totLectures !== undefined ?
        course.totLectures : c.totLectures,
      totParticipants: course.totParticipants !== undefined ?
        course.totParticipants : c.totParticipants,
      totRelease: course.totRelease !== undefined ?
        course.totRelease : c.totRelease,
      totTheme: course.totTheme !== undefined ? course.totTheme :
        c.totTheme,
      updateCourseId: course.updateCourseId !== undefined ?
        course.updateCourseId : c.updateCourseId
    }
  }

  backup = (courses: UpdateCourse[]) => {
    return this.authService.batchWriteDocs$(
      courses.map(course => {
        return {
          data: course,
          path: `backup_${UPDATE_COURSES}_2/${course.updateCourseId}`,
          type: "set"
        }
      })
    )
  }

  writeUpgradeToDB = (courses: UpdateCourse[]) => {
    return this.authService.batchWriteDocs$(
      courses.map(course => {
        return {
          data: course,
          path: `${UPDATE_COURSES}/${course.updateCourseId}`,
          type: "update"
        }
      })
    ).pipe(map(_res => courses))
  }

  upgradeDB = (courses: UpdateCourse[]): Observable<UpdateCourse[]> => {
    console.log("Upgrading the collection in database");
    return this.backup(courses).pipe(
      map(res => {
        console.log("backup done");
        return courses.map(this.defineMissing).map(this.participantsToArray)
      }),
      concatMap(this.writeUpgradeToDB),
      map(res => {
        console.log("final result =>", res);
        console.log("done");
        this.resetCache(UPDATE_COURSES);
        return res;
      }),
      catchError(err => {
        console.log("err converting =>", err);
        return of([])
      })
    )
  }

  getPayments$(id: string) {
    return this.queryItem$<UpdateCourseRecord>(UPDATE_COURSES_RECORDS, [
      where("updateCourseId", "==", id)
    ])
  }

  getPaymentsList$(id: string): Observable<CardList[]> {
    return this.getPayments$(id).pipe(
      map(records => records.map(r => {
        return {
          title: r.userEmail,
          subtitle: r.courseType,
          text: ""
        }
      }))
    )
  }
}
