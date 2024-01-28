import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { User } from 'firebase/auth';
import { Observable, concatMap, map, partition } from 'rxjs';
import { UPDATE_COURSES, UPDATE_COURSES_LECTURES, UpdateCourse, UpdateCourseLecture } from 'src/app/models/update_course';
import { UPDATE_COURSES_RECORDS, UpdateCourseRecord } from 'src/app/models/update_course_record';
import { AppUser, USERS } from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth.service';
import { HelperService } from 'src/app/services/helper.service';

@Component({
  selector: 'app-update-course-details',
  templateUrl: './update-course-details.component.html',
  styleUrls: ['./update-course-details.component.css']
})
export class UpdateCourseDetailsComponent implements OnInit {
  ongoing: Observable<UpdateCourse | null> = new Observable();
  courseRecords: Observable<UpdateCourseRecord[]> = new Observable();
  user$: Observable<AppUser> = new Observable();
  updateCourseLecture$: Observable<UpdateCourseLecture[]> = new Observable();
  lecturesSplit: Observable<UpdateCourseLecture[]>[] = [];
  updateCourseId = "";
  openCategoryUI = false;
  day = 0; // first day (zero-based numbering)

  constructor(private activatedRoute: ActivatedRoute, private authService: AuthService,
    public helper: HelperService) { }

  ngOnInit(): void {
    this.ongoing = this.activatedRoute.paramMap.pipe(
      map(params => {
        const updateCourseId = params.get("updateCourseId");
        console.log(updateCourseId);
        if (updateCourseId) return updateCourseId;
        else throw new Error("Route does not exist");
      }),
      concatMap(updateCourseId => {
        return this.authService.getDoc$(UPDATE_COURSES, updateCourseId);
      }),
      map(doc => {
        if (doc.exists()) return doc.data() as UpdateCourse;
        else throw new Error(this.authService.FIRESTORE_NULL_DOCUMENT);
      })
    );

    this.user$ = this.authService.getDocByUserId$(USERS).pipe(
      map(doc => {
        if (doc.exists()) return doc.data() as AppUser;
        else throw new Error(this.authService.FIRESTORE_NULL_DOCUMENT);
      })
    );

    this.courseRecords = this.activatedRoute.paramMap.pipe(
      concatMap(params => this.authService.queryCollections$(UPDATE_COURSES_RECORDS,
        "updateCourseId", "==", params.get("updateCourseId") as string)),
      map(doc => doc.docs.map(docDoc => {
        return docDoc.data() as UpdateCourseRecord;
      }))
    )

    this.updateCourseLecture$ = this.activatedRoute.paramMap.pipe(
      concatMap(params => this.authService.queryCollections$(UPDATE_COURSES_LECTURES, "updateCourseId",
        "==", params.get("updateCourseId") as string)),
      map(doc => doc.docs.map(docDoc => docDoc.data() as UpdateCourseLecture)
        .sort((a, b) => parseInt(a.startTime) - parseInt(b.startTime))))

    this.lecturesSplit = [
      this.updateCourseLecture$.pipe(
        map(lectures => lectures.filter((lecture, index, array) =>
          new Date(parseInt(lecture.startTime)).getDay() === 
          new Date(parseInt(array[0].startTime)).getDay())
        )
      ),
      this.updateCourseLecture$.pipe(
        map(lectures => lectures.filter((lecture, index, array) =>
          new Date(parseInt(lecture.startTime)).getDay() !== 
          new Date(parseInt(array[0].startTime)).getDay())
        )
      )
    ]
  }

  getLectureObservable$(updateCourseId: string) {
    return this.authService.queryCollections$(UPDATE_COURSES_LECTURES, "updateCourseId",
      "==", updateCourseId).pipe(
        map(doc => doc.docs.map(docDoc => docDoc.data() as UpdateCourseLecture)
          .sort((a, b) => parseInt(a.startTime) - parseInt(b.startTime)))
      )
  }

  toggleDay(day: number) {
    if (this.day !== day) this.day = day;
  }
}
