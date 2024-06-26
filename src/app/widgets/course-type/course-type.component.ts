import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NEVER, Observable } from 'rxjs';
import { UpdateCourseLecture } from 'src/app/models/update_course';
import { UPDATE_COURSE_TYPES, UpdateCourseRecord, UpdateCourseType } from 'src/app/models/update_course_record';
import { CardList } from '../card-list/card-list.component';

@Component({
  selector: 'app-course-type',
  templateUrl: './course-type.component.html',
  styleUrls: ['./course-type.component.css']
})
export class CourseTypeComponent {
  @Input() lists: Array<UpdateCourseLecture | UpdateCourseRecord> = [];
  @Input() newItem$: Observable<UpdateCourseLecture | UpdateCourseRecord> = NEVER;
  @Input() title = "";
  @Input() subtitle = "";
  @Output() onRecordClicked: EventEmitter<UpdateCourseRecord> = new EventEmitter();
  @Output() onLectureClicked: EventEmitter<UpdateCourseLecture> = new EventEmitter();
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

  convertToCardList(list: UpdateCourseLecture | UpdateCourseRecord) {
    if ("userEmail" in list) {
      return this.paymentToCardList(list);
    }

    return {
      title: list.lectureTitle,
      subtitle: list.lecturerEmail,
      text: list.courseType
    }
  }

  emit(list: UpdateCourseLecture | UpdateCourseRecord) {
    if ("userEmail" in list) {
      this.onRecordClicked.emit(list);
    } else {
      this.onLectureClicked.emit(list);
    }
  }

  evaluateControl(list: UpdateCourseLecture | UpdateCourseRecord) {
    if ("userEmail" in list) {
      return !(list.approved === undefined)
    }
    return false;
  }

  evaluateState(list: UpdateCourseLecture | UpdateCourseRecord) {
    if ("userEmail" in list) {
      return !!list.approved
    }

    return false;
  }
}
