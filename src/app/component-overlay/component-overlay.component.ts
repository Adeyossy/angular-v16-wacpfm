import { Component, Input } from '@angular/core';
import { OverlayComponent } from '../overlay/overlay.component';
import { UpdateCourseLectureComponent } from '../update-course/update-course-lecture/update-course-lecture.component';
import { HelperService } from '../services/helper.service';
import { DEFAULT_LECTURE } from '../models/update_course';
import { DEFAULT_COURSE_RECORD } from '../models/update_course_record';

@Component({
  selector: 'app-component-overlay',
  templateUrl: './component-overlay.component.html',
  styleUrls: ['./component-overlay.component.css', "../overlay/overlay.component.css"]
})
export class ComponentOverlayComponent extends OverlayComponent {
  @Input() component: typeof UpdateCourseLectureComponent | null = UpdateCourseLectureComponent;

  constructor(private helper: HelperService) {
    super();
  }

  closeDialog() {
    this.helper.setComponentDialogData(
      {
        courseId: "",
        lecture: DEFAULT_LECTURE,
        payment: Object.assign({}, DEFAULT_COURSE_RECORD),
        course: this.helper.data.course
      }
    );
    this.helper.toggleDialog(-1);
  }
}
