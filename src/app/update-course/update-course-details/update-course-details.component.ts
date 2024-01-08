import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, concatMap, map } from 'rxjs';
import { UPDATE_COURSES, UpdateCourse } from 'src/app/models/update_course';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-update-course-details',
  templateUrl: './update-course-details.component.html',
  styleUrls: ['./update-course-details.component.css']
})
export class UpdateCourseDetailsComponent implements OnInit {
  ongoing: Observable<UpdateCourse | null> = new Observable();
  updateCourseId = "";

  constructor(private activatedRoute: ActivatedRoute, private authService: AuthService) {}

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
    )
  }
}
