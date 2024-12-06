import { Component, Input, OnInit } from '@angular/core';
import { where } from 'firebase/firestore';
import { NEVER, Observable, concatMap, map, of } from 'rxjs';
import { DEFAULT_WRITING } from 'src/app/models/candidate';
import { DEFAULT_LECTURE, UPDATE_COURSES_LECTURES, UpdateCourseLecture } from 'src/app/models/update_course';
import { DEFAULT_COURSE_RECORD, UPDATE_COURSE_TYPES, UpdateCourseType } from 'src/app/models/update_course_record';
import { DEFAULT_RESOURCE_PERSON, RESOURCE_PERSONS, RESOURCE_PERSON_TITLES, ResourcePerson } from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth.service';
import { HelperService } from 'src/app/services/helper.service';

@Component({
  selector: 'app-resource-person',
  templateUrl: './resource-person.component.html',
  styleUrls: ['./resource-person.component.css']
})
export class ResourcePersonComponent implements OnInit {
  @Input() resourcePerson: ResourcePerson = Object.assign({}, DEFAULT_RESOURCE_PERSON);

  lectures$: Observable<UpdateCourseLecture[]> = NEVER;
  updater$: Observable<string> = of("initial");

  titles = RESOURCE_PERSON_TITLES;
  selection = RESOURCE_PERSON_TITLES.map(_t => false);

  courseTypes = UPDATE_COURSE_TYPES;
  courseSelection = UPDATE_COURSE_TYPES.map(_t => false);
  newLecture$: Observable<UpdateCourseLecture> = NEVER;

  constructor(private authService: AuthService, public helper: HelperService) { }

  ngOnInit(): void {
    this.selection = this.titles.map(title => title === this.resourcePerson.title);
    this.courseSelection = this.courseTypes.map(type => type === this.resourcePerson.courseType);
    if (this.resourcePerson.userEmail) {
      this.lectures$ = this.authService.queryCollections$<UpdateCourseLecture>(
        UPDATE_COURSES_LECTURES, where("lecturerEmail", "==", this.resourcePerson.userEmail)
      )
    }
    this.createNewLecture();
  }

  setTitle(title: string[]) {
    if (title.length > 0)
      this.resourcePerson.title = title[0] as "Dr." | "Prof.";
  }

  setCourseType(courseType: string[]) {
    if (courseType.length > 0) {
      this.resourcePerson.courseType = courseType[0] as UpdateCourseType;
    }
  }

  lectureToCardList(lecture: UpdateCourseLecture) {
    return {
      title: lecture.lectureTitle,
      subtitle: lecture.lecturerEmail,
      text: lecture.courseType
    }
  }

  createNewLecture() {
    this.newLecture$ = this.authService.getDocId$(UPDATE_COURSES_LECTURES).pipe(
      map(ref => {
        const lecture = Object.assign({}, DEFAULT_LECTURE);
        lecture.lectureId = ref.id;
        lecture.updateCourseId = this.resourcePerson.updateCourseId;
        lecture.startTime = this.helper.data.course.startDate.toString();
        lecture.endTime = String(parseInt(lecture.startTime) + (60 * 60 * 1000));
        lecture.lecturerEmail = this.helper.data.lecturer.userEmail;
        return lecture;
      })
    );
  }

  showLecture(lecture: UpdateCourseLecture) {
    this.helper.setComponentDialogData({
      courseId: lecture.updateCourseId,
      lecture,
      payment: Object.assign({}, DEFAULT_COURSE_RECORD),
      course: this.helper.data.course,
      lecturer: Object.assign({}, DEFAULT_RESOURCE_PERSON),
      writing: Object.assign({}, DEFAULT_WRITING)
    });

    this.helper.toggleDialog(1);
    this.createNewLecture();
  }

  updateLecturer() {
    this.updater$ = this.authService.addDocWithID$(RESOURCE_PERSONS, this.resourcePerson.id,
      this.resourcePerson).pipe(map(_update => "final"));
  }
}
