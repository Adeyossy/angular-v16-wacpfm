import { Component, Input } from '@angular/core';
import { UpdateCourseLecture } from 'src/app/models/update_course';
import { UPDATE_COURSE_TYPES, UpdateCourseType } from 'src/app/models/update_course_record';

@Component({
  selector: 'app-update-course-lecture',
  templateUrl: './update-course-lecture.component.html',
  styleUrls: ['./update-course-lecture.component.css']
})
export class UpdateCourseLectureComponent {
  @Input() updateCourseId = "";
  @Input() lecture: UpdateCourseLecture = {
    courseType: "Membership",
    lectureId: "",
    lecturerId: "",
    lecturerEmail: "",
    lectureTitle: "",
    updateCourseId: this.updateCourseId,
    startTime: Date.now().toString(),
    endTime: String(Date.now() + (60 * 60)),
    materialLink: [],
    videoLink: ""
  }
  courseTypes = UPDATE_COURSE_TYPES.slice();

  setCourseType(value: string[]) {
    if(value.length) {
      this.lecture.courseType = value[0] as UpdateCourseType
    } 
  }
}
