import { Component, Input } from '@angular/core';
import { OverlayComponent } from '../overlay/overlay.component';
import { UpdateCourseLectureComponent } from '../update-course/update-course-lecture/update-course-lecture.component';
import { HelperService } from '../services/helper.service';
import { DEFAULT_LECTURE } from '../models/update_course';
import { DEFAULT_COURSE_RECORD } from '../models/update_course_record';
import { DEFAULT_RESOURCE_PERSON } from '../models/user';
import { DEFAULT_WRITING } from '../models/candidate';

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
        lecture: Object.assign({}, DEFAULT_LECTURE),
        payment: Object.assign({}, DEFAULT_COURSE_RECORD),
        course: this.helper.data.course,
        lecturer: Object.assign({}, DEFAULT_RESOURCE_PERSON),
        writing: [[], -1]
      }
    );
    this.helper.toggleDialog(-1);
  }
}
