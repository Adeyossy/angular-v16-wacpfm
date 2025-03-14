import { Component, DoCheck, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { AuthService, RefinedData } from '../services/auth.service';
import { NEVER, Observable, concatMap, map, of, timer } from 'rxjs';
import { DEFAULT_COURSE_RECORD, UPDATE_COURSES_RECORDS, UPDATE_COURSE_TYPES, UpdateCourseRecord, UpdateCourseType } from '../models/update_course_record';
import { CardList } from '../widgets/card-list/card-list.component';
import { UPDATE_COURSES, UPDATE_COURSES_LECTURES, UpdateCourse, UpdateCourseLecture, DEFAULT_LECTURE } from '../models/update_course';
import { HelperService } from '../services/helper.service';
import { DEFAULT_RESOURCE_PERSON, RESOURCE_PERSONS, ResourcePerson } from '../models/user';
import { DEFAULT_WRITING } from '../models/candidate';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  courses$: Observable<UpdateCourse[]> = NEVER;
  cardItem$: Observable<CardList> = of({title: "", subtitle: "", text: ""});
  records$: Observable<UpdateCourseRecord[]> = NEVER;
  // list$: Observable<CardList[]> = new Observable();
  level = 0;
  sublevel = 0;
  currentCourse: UpdateCourse | null = null;
  courseTypes = UPDATE_COURSE_TYPES;
  newLecture$: Observable<UpdateCourseLecture> = NEVER;
  lectures$: Observable<UpdateCourseLecture[]> = NEVER;
  resourcePersons$: Observable<ResourcePerson[]> = NEVER;
  newLecturer$: Observable<ResourcePerson> = NEVER;
  grantAccess$: Observable<void> = NEVER;
  data$: Observable<string> | null = null;

  // should lecture is a flag to let the system knoww that
  // shouldRefresh: "lecture" | "payment" | "resource_person" | "" = "";
  // refreshID = "";

  constructor(private authService: AuthService, public helper: HelperService) { }

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

    this.courses$ = this.authService.getCollectionListener$(UPDATE_COURSES).pipe(
      map(snapshot => snapshot.docs.map(doc => doc.data() as UpdateCourse))
    );
    this.createNewLecture();
    this.createNewLecturer();
  }

  // ngDoCheck(): void {
  //   if (this.helper.isDialogShown === -1 && this.shouldRefresh) {
  //     switch (this.shouldRefresh) {
  //       case "lecture":
  //         // this.setToLectures();
  //         break;

  //       case "payment":
  //         this.cardItem$ = this.refreshRecord();
  //         break;

  //       case "resource_person":
  //         // this.setToResourcePersons();
  //         break;

  //       default:
  //         break;
  //     }

  //     this.shouldRefresh = "";
  //   }
  // }

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
    const newRecords: UpdateCourseRecord[] = [];
    for (let i = 0; i < records.length; i++) {
      let currentRecord = Object.assign({}, records[i]);
      for (let j = i + 1; j < records.length; j++) {
        let nextRecord = records[j];
        if (currentRecord.userEmail === nextRecord.userEmail) {
          if (currentRecord.courseType !== nextRecord.courseType) {
            currentRecord.courseType += `, ${nextRecord.courseType}`
          }
        }
      }
      if (newRecords.find(n => n.userEmail === records[i].userEmail) === undefined) {
        newRecords.push(Object.assign({}, currentRecord))
      }
    }
    return newRecords;
  }

  // refreshRecord() {
  //   return this.authService.getDoc$<UpdateCourseRecord>(UPDATE_COURSES_RECORDS, this.refreshID)
  //   .pipe(map(rec => this.paymentToCardList(rec)));
  // }

  setToPayment() {
    this.level = 2;
    this.sublevel = 0;
    this.records$ = this.authService.queryForListener$(UPDATE_COURSES_RECORDS,
      "updateCourseId", "==", this.currentCourse?.updateCourseId!).pipe(
        map(snapshot => snapshot.docs.map(doc => {
          const record = doc.data() as UpdateCourseRecord;
          if (record.id !== doc.id) record.id = doc.id;
          return record;
        }))
      );
  }

  setToLectures() {
    this.level = 2;
    this.sublevel = 1;
    this.lectures$ = this.authService.queryForListener$(UPDATE_COURSES_LECTURES,
      "updateCourseId", "==", this.currentCourse!.updateCourseId).pipe(
        map(snapshot => snapshot.docs.map(doc => {
          const lecture = doc.data() as UpdateCourseLecture;
          if (lecture.lectureId !== doc.id) lecture.lectureId = doc.id;
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
    this.resourcePersons$ = this.authService.queryForListener$(RESOURCE_PERSONS,
      "updateCourseId", "==", this.currentCourse!.updateCourseId).pipe(
        map(snapshot => snapshot.docs.map(doc => {
          const resourcePerson = doc.data() as ResourcePerson;
          return resourcePerson;
        }))
      );
  }

  createNewLecturer() {
    this.newLecturer$ = this.authService.getDocId$(RESOURCE_PERSONS).pipe(
      map(ref => {
        const lecturer = Object.assign({}, DEFAULT_RESOURCE_PERSON);
        lecturer.id = ref.id;
        lecturer.updateCourseId = this.currentCourse!.updateCourseId;
        return lecturer;
      })
    );
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

  courseTypeOnly<Type extends { courseType: UpdateCourseType }>(records: Type[], courseType: UpdateCourseType) {
    return records.filter(record => record.courseType === courseType)
  }

  getHybridParticipants(records: UpdateCourseRecord[]) {
    const hybrids = this.hybridize(records)
    return hybrids.filter(record => record.courseType.split(", ").sort().join(", ")
      === "Fellowship, Membership, ToT");
  }

  showLecture(lecture: UpdateCourseLecture) {
    this.helper.setComponentDialogData({
      courseId: this.currentCourse!.updateCourseId,
      lecture,
      payment: Object.assign({}, DEFAULT_COURSE_RECORD),
      course: this.helper.data.course,
      lecturer: Object.assign({}, DEFAULT_RESOURCE_PERSON),
      writing: [[], -1]
    });

    this.helper.toggleDialog(1);
    this.createNewLecture();
  }

  showPayment(record: UpdateCourseRecord) {
    this.helper.setComponentDialogData({
      courseId: this.currentCourse!.updateCourseId,
      lecture: Object.assign({}, DEFAULT_LECTURE),
      payment: record,
      course: this.currentCourse!,
      lecturer: Object.assign({}, DEFAULT_RESOURCE_PERSON),
      writing: [[], -1]
    });

    this.helper.toggleDialog(1);
  }

  showResourcePerson(resourcePerson: ResourcePerson) {
    this.helper.setComponentDialogData({
      courseId: this.currentCourse!.updateCourseId,
      lecture: Object.assign({}, DEFAULT_LECTURE),
      payment: Object.assign({}, DEFAULT_COURSE_RECORD),
      course: this.currentCourse!,
      lecturer: resourcePerson,
      writing: [[], -1]
    });

    this.helper.toggleDialog(1);
  }

  byCourseType(courseType: UpdateCourseType, emails: string) {
    if (courseType === "Membership") {
      return { membershipParticipants: emails }
    }

    if (courseType === "Fellowship") {
      return { fellowshipParticipants: emails }
    }

    if (courseType === "ToT") {
      return { totParticants: emails }
    }

    return {}
  }

  grantAllAccess(courseType: UpdateCourseType) {
    this.grantAccess$ = this.authService.getDoc$<UpdateCourse>(UPDATE_COURSES,
      this.currentCourse!.updateCourseId).pipe(
        concatMap(course => {
          return this.records$.pipe(
            map(recs => this.courseTypeOnly(recs, courseType).filter(rec => rec.approved === true)
              .map(rec => rec.userEmail).join(", ")),
            concatMap(emails => this.authService.updateDoc$(UPDATE_COURSES, course.updateCourseId,
              this.byCourseType(courseType, emails)))
          )
        })
      )
  }

  fetchData$() {
    this.data$ = this.authService.getDetails$(this.currentCourse!.updateCourseId).pipe(
      map(data => {
        let refined: RefinedData[] = [];
        for (let i = 0; i < data.length; i++) {
          const d = data[i];
          if (refined.find(r => r.user_email === d.user_email)) continue;
          for (let j = i+1; j < data.length; j++) {
            const next = data[j];
            if (d.user_email === next.user_email) {
              if (!d.category.includes(next.category)) {
                // Get the sort value. The order of the arguments matter
                const sortNumber = this.helper.sortByUpdateCourseType(d.category, next.category);
                
                // If the sortNumber is negative, concat in the order of the arguments,
                // else concat in the reverse order.
                d.category = sortNumber < 0 ? 
                  d.category.concat(", ", next.category) as UpdateCourseType :
                  next.category.concat(", ", d.category) as UpdateCourseType;
              }
            }
          }
          refined.push(d);
        }
        const rows = refined.map(d => Object.values(d).join(";")).join("\r\n");
        const final = Object.keys(refined[0]).join(";").concat("\r\n", rows);
        const json = JSON.stringify(data);
        return URL.createObjectURL(new Blob([final], {type: "text/csv"}))
      })
    )
  }
}
