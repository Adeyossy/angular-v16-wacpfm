import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NEVER, Observable, of } from 'rxjs';
import { UpdateCourseLecture } from 'src/app/models/update_course';
import { DEFAULT_COURSE_RECORD, UPDATE_COURSE_TYPES, UpdateCourseRecord, UpdateCourseType } from 'src/app/models/update_course_record';
import { CardList } from '../card-list/card-list.component';
import { ResourcePerson } from 'src/app/models/user';
import { CardListItem } from '../card-list-item/card-list-item.component';

@Component({
  selector: 'app-course-type',
  templateUrl: './course-type.component.html',
  styleUrls: ['./course-type.component.css']
})
export class CourseTypeComponent implements OnInit {
  @Input() lists: Array<UpdateCourseLecture | UpdateCourseRecord | ResourcePerson> = [];
  cardList: CardList = [];
  cardListMap: { Membership: CardList, Fellowship: CardList, ToT: CardList } = {
    Membership: [],
    Fellowship: [],
    ToT: []
  }
  @Input() newItem$: Observable<UpdateCourseLecture | UpdateCourseRecord | ResourcePerson> =
    of(Object.assign({}, DEFAULT_COURSE_RECORD));
  @Input() title = "";
  @Input() subtitle = "";
  @Output() onRecordClicked: EventEmitter<UpdateCourseRecord> = new EventEmitter();
  @Output() onLectureClicked: EventEmitter<UpdateCourseLecture> = new EventEmitter();
  @Output() onLecturerClicked: EventEmitter<ResourcePerson> = new EventEmitter();
  courseTypes = UPDATE_COURSE_TYPES;

  ngOnInit(): void {
    // this.lists.sort()
    this.cardList = this.lists.map(this.convertToCardList);
    const nested = this.courseTypes.map(
      c => [
        c, 
        this.courseTypeOnly(this.lists, c).map(this.convertToCardList)
      ]
    );
    this.cardListMap = Object.fromEntries(nested);
  }

  courseTypeOnly<Type extends { courseType: UpdateCourseType }>(records: Type[],
    courseType: UpdateCourseType) {
    return records.filter(record => record.courseType === courseType)
  }

  paymentToCardList = (record: UpdateCourseRecord): CardListItem => {
    return {
      title: record.userEmail,
      subtitle: record.courseType,
      text: "",
      control: this.evaluateControl(record),
      state: this.evaluateState(record)
    }
  }

  trackByEmail = (
    _index: number,
    item: UpdateCourseLecture | UpdateCourseRecord | ResourcePerson
  ) => {
    if ("paymentId" in item) {
      return item.userEmail;
    } else {
      if ("accountNumber" in item) {
        return item.userEmail;
      }
      return item.lectureTitle;
    }
  }

  convertToCardList = (
    listItem: UpdateCourseLecture | UpdateCourseRecord | ResourcePerson
  ): CardListItem => {
    if ("paymentId" in listItem) {
      return this.paymentToCardList(listItem);
    }

    if ("accountNumber" in listItem) {
      return {
        title: listItem.userEmail,
        subtitle: listItem.accountName,
        text: "",
        control: this.evaluateControl(listItem),
        state: this.evaluateState(listItem)
      }
    }

    return {
      title: listItem.lectureTitle,
      subtitle: listItem.lecturerEmail,
      text: listItem.courseType,
      control: this.evaluateControl(listItem),
      state: this.evaluateState(listItem)
    }
  }

  selectCategory = (
    item: UpdateCourseLecture | UpdateCourseRecord | ResourcePerson,
    id: string
  ) => {
    if ("paymentId" in item) {
      if (item.userEmail === id) {
        this.onRecordClicked.emit(item);
      }
    } else {
      if ("accountNumber" in item) {
        if (item.userEmail === id) this.onLecturerClicked.emit(item);
      }
      else {
        if (item.lectureTitle === id) this.onLectureClicked.emit(item);
      }
    }
  }

  emitItem = (id: string) => {
    this.lists.forEach(item => this.selectCategory(item, id))
  }

  emit = (list: UpdateCourseLecture | UpdateCourseRecord | ResourcePerson) => {
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

  extractEmails(record: UpdateCourseRecord | ResourcePerson | UpdateCourseLecture) {
    if ("lecturerEmail" in record) return record.lecturerEmail;
    return record.userEmail;
  }
}
