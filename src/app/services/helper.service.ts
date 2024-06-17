import { Injectable } from '@angular/core';
import { UpdateCourseLectureComponent } from '../update-course/update-course-lecture/update-course-lecture.component';
import { DEFAULT_LECTURE, UpdateCourseLecture } from '../models/update_course';
import { DEFAULT_COURSE_RECORD, UpdateCourseRecord } from '../models/update_course_record';

export interface ComponentDialogInfo {
  type: string,
  data: UpdateCourseLecture | UpdateCourseRecord | null,
  courseId: string
}

export interface ComponentDialogData {
  courseId: string,
  lecture: UpdateCourseLecture,
  payment: UpdateCourseRecord
}

@Injectable({
  providedIn: 'root'
})
export class HelperService {
  showSidebarOnMobile = false;
  isDashboard = false;
  isDialogShown = -1;
  componentDialogType = "";

  data: ComponentDialogData = {
    courseId: "",
    lecture: Object.assign({}, DEFAULT_LECTURE),
    payment: Object.assign({}, DEFAULT_COURSE_RECORD)
  }

  dialog = {
    title: "",
    message: "",
    buttonText: ""
  }

  constructor() { }

  dateToMillis(date: Date) {
    return date.getTime();
  }

  millisToDate(millis: number) {
    return new Date(millis);
  }

  getDateString(millis: number) {
    const date = new Date(millis);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDay();
    // return `${year}-${month}-${day}`;
    return date.toISOString().substring(0, 10);
  }

  getTodaysDate() {
    return this.getDateString(Date.now());
  }

  millisToHour(millis: string) {
    return new Date(parseInt(millis)).getHours().toString().concat(":00");
  }

  toggleDashboard(state: boolean) {
    this.isDashboard = state;
  }

  toggleSidebar(state: boolean) {
    this.showSidebarOnMobile = state;
  }

  toggleDialog(state: number) {
    this.isDialogShown = state;
  }

  setDialog(dialog: {title: string, message: string, buttonText: string}) {
    this.dialog = dialog;
  }

  getDialogComponent(type: string) {
    if (type === "lecture") {
      return UpdateCourseLectureComponent;
    }

    // if (this.componentDialogType === "payment") {
    //   return 
    // }

    return null;
  }

  setComponentDialogData(data: ComponentDialogData) {
    this.data = data;
  }
}
