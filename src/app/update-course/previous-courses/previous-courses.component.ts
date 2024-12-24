import { Component, OnInit } from '@angular/core';
import { where } from 'firebase/firestore';
import { map, Observable, of } from 'rxjs';
import { UPDATE_COURSES, UpdateCourse } from 'src/app/models/update_course';
import { AuthService } from 'src/app/services/auth.service';
import { HelperService } from 'src/app/services/helper.service';

@Component({
  selector: 'app-previous-courses',
  templateUrl: './previous-courses.component.html',
  styleUrls: ['./previous-courses.component.css']
})
export class PreviousCoursesComponent implements OnInit {
  previousCourses: Observable<UpdateCourse[]> = of([]);
  private readonly twoWeeks = 2 * 7 * 24 * 60 * 60 * 1000;

  constructor(private authService: AuthService, public helper: HelperService) {}

  ngOnInit(): void {
    this.previousCourses = this.authService.queryCollections$<UpdateCourse>(UPDATE_COURSES, 
      where("endDate", "<", Date.now() - this.twoWeeks)).pipe(
        map(courses => courses.sort((a, b) => b.endDate - a.endDate))
      );
  }
}
