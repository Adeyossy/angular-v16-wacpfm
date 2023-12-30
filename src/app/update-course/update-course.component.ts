import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Observable, map } from 'rxjs';
import { UPDATE_COURSES_RECORDS, UpdateCourseRecord } from '../models/update_course_record';
import { QueryDocumentSnapshot, QuerySnapshot } from 'firebase/firestore';

@Component({
  selector: 'app-update-course',
  templateUrl: './update-course.component.html',
  styleUrls: ['./update-course.component.css']
})
export class UpdateCourseComponent implements OnInit {
  docs = new Observable<string[]>();
  ongoing = new Observable();

  constructor(private authService: AuthService) {
  }

  ngOnInit(): void {
    this.docs = this.authService.queryByUserId$(UPDATE_COURSES_RECORDS).pipe(
      map(value => value.docs as QueryDocumentSnapshot<UpdateCourseRecord>[]),
      map(docs => docs.map(doc => doc.data().updateCourseId)),
      // map(courseIds => )
    )
  }
}
