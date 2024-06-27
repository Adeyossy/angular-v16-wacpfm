import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NEVER, Observable, of } from 'rxjs';
import { UpdateCourseLecture } from 'src/app/models/update_course';
import { DEFAULT_COURSE_RECORD, UPDATE_COURSE_TYPES, UpdateCourseRecord, UpdateCourseType } from 'src/app/models/update_course_record';
import { CardList } from '../card-list/card-list.component';
import { ResourcePerson } from 'src/app/models/user';

@Component({
  selector: 'app-course-type',
  templateUrl: './course-type.component.html',
  styleUrls: ['./course-type.component.css']
})
export class CourseTypeComponent {
  @Input() lists: Array<UpdateCourseLecture | UpdateCourseRecord | ResourcePerson> = [];
  @Input() newItem$: Observable<UpdateCourseLecture | UpdateCourseRecord | ResourcePerson> = 
  of(Object.assign({}, DEFAULT_COURSE_RECORD));
  @Input() title = "";
  @Input() subtitle = "";
  @Output() onRecordClicked: EventEmitter<UpdateCourseRecord> = new EventEmitter();
  @Output() onLectureClicked: EventEmitter<UpdateCourseLecture> = new EventEmitter();
  @Output() onLecturerClicked: EventEmitter<ResourcePerson> = new EventEmitter();
  courseTypes = UPDATE_COURSE_TYPES;

  courseTypeOnly<Type extends { courseType: UpdateCourseType }>(records: Type[], 
    courseType: UpdateCourseType) {
    return records.filter(record => record.courseType === courseType)
  }

  paymentToCardList(record: UpdateCourseRecord) {
    return {
      title: record.userEmail,
      subtitle: record.courseType,
      text: ""
    }
  }

  convertToCardList(list: UpdateCourseLecture | UpdateCourseRecord | ResourcePerson) {
    if ("paymentId" in list) {
      return this.paymentToCardList(list);
    }

    if ("accountNumber" in list) {
      return {
        title: list.userEmail,
        subtitle: "",
        text: ""
      }
    }

    return {
      title: list.lectureTitle,
      subtitle: list.lecturerEmail,
      text: list.courseType
    }
  }

  emit(list: UpdateCourseLecture | UpdateCourseRecord | ResourcePerson) {
    if ("paymentId" in list) {
      this.onRecordClicked.emit(list);
    } else {
      if ("accountNumber" in list) this.onLecturerClicked.emit(list);
      else this.onLectureClicked.emit(list);
    }
  }

  evaluateControl(list: UpdateCourseLecture | UpdateCourseRecord | ResourcePerson) {
    if ("paymentId" in list) {
      return !(list.approved === undefined)
    }
    return false;
  }

  evaluateState(list: UpdateCourseLecture | UpdateCourseRecord | ResourcePerson) {
    if ("paymentId" in list) {
      return !!list.approved
    }

    return false;
  }
}
