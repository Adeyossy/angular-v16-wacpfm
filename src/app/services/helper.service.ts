import { Injectable } from '@angular/core';
import { UpdateCourseLectureComponent } from '../update-course/update-course-lecture/update-course-lecture.component';
import { DEFAULT_LECTURE, DEFAULT_UPDATE_COURSE, UpdateCourse, UpdateCourseLecture } from '../models/update_course';
import { DEFAULT_COURSE_RECORD, UpdateCourseRecord } from '../models/update_course_record';
import { DEFAULT_RESOURCE_PERSON, ResourcePerson } from '../models/user';
import { AcademicWriting, DEFAULT_ACADEMIC_WRITING, DEFAULT_WRITING, Writing } from '../models/candidate';

export interface SimpleDialog {
  title: string,
  message: string,
  buttonText: string,
  navUrl?: string
}

export interface ComponentDialogInfo {
  type: string,
  data: UpdateCourseLecture | UpdateCourseRecord | null,
  courseId: string
}

export interface ComponentDialogData {
  courseId: string,
  lecture: UpdateCourseLecture,
  payment: UpdateCourseRecord,
  course: UpdateCourse,
  lecturer: ResourcePerson,
  writing: [AcademicWriting[], number]
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
    payment: Object.assign({}, DEFAULT_COURSE_RECORD),
    course: Object.assign({}, DEFAULT_UPDATE_COURSE),
    lecturer: Object.assign({}, DEFAULT_RESOURCE_PERSON),
    writing: [[], -1]
  }

  dialog: SimpleDialog = {
    title: "",
    message: "",
    buttonText: ""
  }

  countries = [
    'Benin', 'Burkina Faso', 'Gambia', 'Ghana', 'Guinea',
    'Ivory Coast', 'Liberia', 'Niger', 'Nigeria', 'Senegal', 
    'Sierra Leone', 'Togo'
  ];

  constructor() { }

  dateToMillis(date: Date) {
    return date.getTime();
  }

  millisToDate(millis: number) {
    return new Date(millis);
  }

  getDate(millis: number) {
    return new Intl.DateTimeFormat("en-NG").format(millis);
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

  setDialog(dialog: SimpleDialog) {
    this.dialog = dialog;
  }

  resetDialog() {
    this.dialog = {
      title: "",
      message: "",
      buttonText: ""
    };

    this.isDialogShown = -1;
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

  resetComponentDialogData() {
    this.data = {
      courseId: "",
      lecture: Object.assign({}, DEFAULT_LECTURE),
      payment: Object.assign({}, DEFAULT_COURSE_RECORD),
      course: Object.assign({}, DEFAULT_UPDATE_COURSE),
      lecturer: Object.assign({}, DEFAULT_RESOURCE_PERSON),
      writing: [[], -1]
    };
  }

  sortCourseType(record1: UpdateCourseRecord, record2: UpdateCourseRecord) {
    if(record1.courseType === "Membership") return -1;
    if(record2.courseType === "Membership") return 1;
    return record1.courseType.charCodeAt(0) - record2.courseType.charCodeAt(0);
  }

  toDateString(millis: number) {
    return new Date(millis).toLocaleDateString("en-NG").split("/").reverse().join("-");
  }

  parseToMillis(date: string) {
    return Date.parse(date);
  }
}
