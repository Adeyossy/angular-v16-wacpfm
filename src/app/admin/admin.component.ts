import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { NEVER, Observable, map } from 'rxjs';
import { UPDATE_COURSES_RECORDS, UpdateCourseRecord } from '../models/update_course_record';
import { CardList } from '../widgets/card-list/card-list.component';
import { UPDATE_COURSES, UpdateCourse } from '../models/update_course';

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

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.records$ = this.authService.queryCollections$<UpdateCourseRecord>(UPDATE_COURSES_RECORDS,
      "updateCourseId", "==", "rQ8gxQlr1iozMdlB1V5W");

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
            newRecs.push({title: rec.userEmail, subtitle: rec.courseType, text: ""})
          }
        }
        return newRecs;
      })
    );

    this.courses$ = this.authService.getCollection$(UPDATE_COURSES);
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

  setToPayment() {
    this.level = 2;
    this.sublevel = 0;
  }
}
