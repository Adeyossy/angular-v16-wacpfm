import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { NEVER, Observable, concatMap, map, timer } from 'rxjs';
import { UPDATE_COURSES_RECORDS, UPDATE_COURSE_TYPES, UpdateCourseRecord, UpdateCourseType } from '../models/update_course_record';
import { CardList } from '../widgets/card-list/card-list.component';
import { UPDATE_COURSES, UPDATE_COURSES_LECTURES, UpdateCourse, UpdateCourseLecture, DEFAULT_LECTURE } from '../models/update_course';
import { HelperService } from '../services/helper.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  courses$: Observable<UpdateCourse[]> = NEVER;
  records$: Observable<UpdateCourseRecord[]> = NEVER;
  list$: Observable<CardList[]> = new Observable();
  level = 0;
  sublevel = 0;
  currentCourse: UpdateCourse | null = null;
  courseTypes = UPDATE_COURSE_TYPES;
  newLecture$: Observable<UpdateCourseLecture> = NEVER;
  lectures$: Observable<UpdateCourseLecture[]> = NEVER;

  constructor(private authService: AuthService, private helper: HelperService) { }

  ngOnInit(): void {
    // this.records$ = this.authService.queryCollections$<UpdateCourseRecord>(UPDATE_COURSES_RECORDS,
    //   "updateCourseId", "==", "rQ8gxQlr1iozMdlB1V5W");

    // this.list$ = this.records$.pipe(
    //   map(records => {
    //     const newRecs: CardList[] = [];
    //     for (let i = 0; i < records.length; i++) {
    //       let rec = records[i];
    //       let existingIndex = newRecs.findIndex(c => c.title === rec.userEmail);
    //       if (existingIndex >= 0) {
    //         newRecs[existingIndex].subtitle += `, ${rec.courseType}`;
    //         newRecs[existingIndex].subtitle = newRecs[existingIndex].subtitle.split(", ")
    //           .sort().join(", ");
    //       } else {
    //         if (rec.userEmail === "adeyossy1@gmail.com") continue;
    //         newRecs.push({ title: rec.userEmail, subtitle: rec.courseType, text: "" })
    //       }
    //     }
    //     return newRecs;
    //   })
    // );

    this.courses$ = this.authService.getCollection$(UPDATE_COURSES);
    this.createNewLecture();
  }

  courseToCardList(course: UpdateCourse) {
    return {
      title: course.title,
      subtitle: Intl.DateTimeFormat("en-NG").format(course.startDate),
      text: Date.now() > course.endDate ? "Ended" : "In Progress"
    }
  }

  setCourse(course: UpdateCourse) {
    this.currentCourse = course;
    this.level = 1;
  }

  hybridize(records: UpdateCourseRecord[]) {
    for (let i = 0; i < records.length; i++) {
      let currentRecord = records[i];
      for (let j = i + 1; j < records.length; j++) {
        let nextRecord = records[j];
        if (currentRecord.userEmail === nextRecord.userEmail) {
          if (currentRecord.courseType !== nextRecord.courseType) {
            currentRecord.courseType += `, ${nextRecord.courseType}`
          }
        }
      }
    }
    return records;
  }

  setToPayment() {
    this.level = 2;
    this.sublevel = 0;
    this.records$ = this.authService.queryCollectionsUnTyped$(UPDATE_COURSES_RECORDS,
      "updateCourseId", "==", this.currentCourse?.updateCourseId!).pipe(
        map(snapshot => snapshot.docs.map(doc => {
          const record = doc.data() as UpdateCourseRecord;
          if(record.id !== doc.id) record.id = doc.id;
          return record;
        })),
        map(this.hybridize)
      );

    this.list$ = this.records$.pipe(
      map(records => {
        const newRecs: CardList[] = [];
        for (let i = 0; i < records.length; i++) {
          let rec = records[i];
          let existingIndex = newRecs.findIndex(c => c.title === rec.userEmail);
          if (existingIndex >= 0) {
            newRecs[existingIndex].subtitle += `, ${rec.courseType}`;
            newRecs[existingIndex].subtitle = newRecs[existingIndex].subtitle.split(", ")
              .sort().join(", ");
          } else {
            if (rec.userEmail === "adeyossy1@gmail.com") continue;
            newRecs.push({ title: rec.userEmail, subtitle: rec.courseType, text: "" })
          }
        }
        return newRecs;
      })
    );
  }

  setToLectures() {
    this.level = 2;
    this.sublevel = 1;
    this.lectures$ = this.authService.queryCollectionsUnTyped$(UPDATE_COURSES_LECTURES,
      "updateCourseId", "==", this.currentCourse!.updateCourseId).pipe(
        map(snapshot => snapshot.docs.map(doc => {
          const lecture = doc.data() as UpdateCourseLecture;
          if(lecture.lectureId !== doc.id) lecture.lectureId = doc.id;
          return lecture;
        }))
      );
  }

  createNewLecture() {
    this.newLecture$ = this.authService.getDocId$(UPDATE_COURSES_LECTURES).pipe(
      map(ref => {
        const lecture = Object.assign({}, DEFAULT_LECTURE);
        lecture.lectureId = ref.id;
        lecture.updateCourseId = this.currentCourse!.updateCourseId;
        lecture.startTime = this.currentCourse!.startDate.toString();
        lecture.endTime = String(parseInt(lecture.startTime) + (60 * 60));
        return lecture;
      })
    );
  }

  setToResourcePersons() {
    this.level = 2;
    this.sublevel = 2;
    this.lectures$ = this.authService.queryCollections$<UpdateCourseLecture>(UPDATE_COURSES_LECTURES,
      "updateCourseId", "==", this.currentCourse!.updateCourseId);
  }

  convertToCardList(title: string, subtitle: string, text: string) {
    return { title, subtitle, text }
  }

  paymentToCardList(record: UpdateCourseRecord) {
    return {
      title: record.userEmail,
      subtitle: record.courseType,
      text: ""
    }
  }

  courseTypeOnly<Type extends {courseType: UpdateCourseType}>(records: Type[], courseType: UpdateCourseType) {
    return records.filter(record => record.courseType === courseType)
  }

  showLecture(lecture: UpdateCourseLecture) {
    this.helper.setComponentDialogData({ 
      courseId: this.currentCourse!.updateCourseId,
      lecture,
      payment: this.helper.data.payment,
      course: this.helper.data.course
    });
    
    this.helper.toggleDialog(1);
    this.createNewLecture();
  }

  showPayment(record: UpdateCourseRecord) {
    this.helper.setComponentDialogData({
      courseId: this.currentCourse!.updateCourseId,
      lecture: this.helper.data.lecture,
      payment: record,
      course: this.currentCourse!
    });

    this.helper.toggleDialog(1);
  }
}
