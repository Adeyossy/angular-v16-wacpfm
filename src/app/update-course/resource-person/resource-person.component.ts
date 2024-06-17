import { Component, Input, OnInit } from '@angular/core';
import { NEVER, Observable, concatMap, map, of } from 'rxjs';
import { UPDATE_COURSES_LECTURES, UpdateCourseLecture } from 'src/app/models/update_course';
import { DEFAULT_COURSE_RECORD } from 'src/app/models/update_course_record';
import { RESOURCE_PERSONS, RESOURCE_PERSON_TITLES, ResourcePerson } from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth.service';
import { HelperService } from 'src/app/services/helper.service';

@Component({
  selector: 'app-resource-person',
  templateUrl: './resource-person.component.html',
  styleUrls: ['./resource-person.component.css']
})
export class ResourcePersonComponent implements OnInit {
  @Input() resourcePerson: ResourcePerson = {
    accountName: "",
    accountNumber: 0,
    bankName: "",
    lectureId: "",
    title: "Dr.",
    updateCourseId: "",
    userEmail: "",
    userId: ""
  };

  lectures$: Observable<UpdateCourseLecture[]> = NEVER;

  titles = RESOURCE_PERSON_TITLES;
  selection = RESOURCE_PERSON_TITLES.map(_t => false);

  constructor(private authService: AuthService, public helper: HelperService) {}

  ngOnInit(): void {
    this.selection = this.titles.map(title => title === this.resourcePerson.title);
    if (this.resourcePerson.userEmail) {
      this.lectures$ = this.authService.queryCollections$<UpdateCourseLecture>(
        UPDATE_COURSES_LECTURES, "userEmail", "==", this.resourcePerson.userEmail
      )
    }
  }

  setTitle(title: string[]) {
    if (title.length > 0)
    this.resourcePerson.title = title[0] as "Dr." | "Prof.";
  }

  lectureToCardList(lecture: UpdateCourseLecture) {
    return {
      title: lecture.lectureTitle,
      subtitle: lecture.lecturerEmail,
      text: lecture.courseType
    }
  }
  
  showLecture(lecture: UpdateCourseLecture) {
    this.helper.setComponentDialogData({ 
      courseId: lecture.updateCourseId,
      lecture,
      payment: Object.assign({}, DEFAULT_COURSE_RECORD),
      course: this.helper.data.course
    });
    
    this.helper.toggleDialog(1);
    // this.createNewLecture();
  }
}
