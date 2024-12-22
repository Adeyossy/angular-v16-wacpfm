import { Component, OnInit } from '@angular/core';
import { HelperService } from './services/helper.service';
import { catchError, concatMap, map, Observable, of } from 'rxjs';
import { EventType, Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { UPDATE_COURSES, UpdateCourse } from './models/update_course';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  isNavigating$: Observable<boolean> = of(false);

  constructor(public helper: HelperService, private router: Router,
    private authService: AuthService) { }

  ngOnInit(): void {
    this.isNavigating$ = this.router.events.pipe(
      map(event => {
        if (event.type === EventType.NavigationEnd || event.type === EventType.NavigationError ||
          event.type === EventType.NavigationCancel || event.type === EventType.Scroll) {
          // console.log("navigation ended");
          return false;
        }
        return true;
      })
    );

    // this is a one-time operation to run once:
    if (false) this.authService.getCollection$<UpdateCourse>(UPDATE_COURSES).pipe(
      concatMap(courses => this.authService.batchWriteDocs$(courses.map
        (course => {
          return {
            data: course,
            path: `backup_${UPDATE_COURSES}_2/${course.updateCourseId}`,
            type: "set"
          }
        })).pipe(
          map(res => {
            console.log("backup done");
            return courses.map(course => {
              return {
                updateCourseId: course.updateCourseId,
                title: course.title,
                creator: course.creator,
                registrationOpenDate: course.registrationOpenDate,
                registrationCloseDate: course.registrationCloseDate,
                startDate: course.startDate,
                endDate: course.endDate,
                membershipRelease: course.membershipRelease,
                membershipCertificate: course.membershipCertificate,
                membershipCPD: course.membershipCPD,
                membershipLectures: course.membershipLectures,
                membershipTheme: course.membershipTheme,
                membershipParticipants: course.membershipParticipants.split(", "),
                membershipGroupLink: course.membershipGroupLink ? course.membershipGroupLink : "",
                membershipClassLink: course.membershipClassLink ? course.membershipClassLink : "",
                fellowshipRelease: course.fellowshipRelease,
                fellowshipCertificate: course.fellowshipCertificate,
                fellowshipCPD: course.fellowshipCPD,
                fellowshipLectures: course.fellowshipLectures,
                fellowshipTheme: course.fellowshipTheme,
                fellowshipParticipants: course.fellowshipParticipants.split(", "),
                fellowshipGroupLink: course.fellowshipGroupLink ? course.membershipGroupLink : "",
                fellowshipClassLink: course.fellowshipClassLink ? course.fellowshipClassLink : "",
                totRelease: course.totRelease,
                totCertificate: course.totCertificate,
                totCPD: course.totCPD,
                totLectures: course.totLectures,
                totTheme: course.totTheme,
                totParticipants: course.totParticipants.split(", "),
                totGroupLink: course.totGroupLink ? course.totGroupLink : "",
                totClassLink: course.totClassLink ? course.totClassLink : "",
                resourcePersons: course.resourcePersons
              }
            })
          }),
          concatMap(mappedCourses => this.authService.batchWriteDocs$(
            mappedCourses.map(course => {
              return {
                data: course,
                path: `${UPDATE_COURSES}/${course.updateCourseId}`,
                type: "update"
              }
            })
          )),
          map(res => {
            console.log("final result =>", res);
            return res;
          })
        )
      ),
      catchError(err => {
        console.log("err converting =>", err);
        return of("error")
      })
    ).subscribe({
      next: (val) => {
        console.log("done converting =>", val);
      }
    })
  }
}
