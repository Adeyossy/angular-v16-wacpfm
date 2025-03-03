import { Component, inject, Input } from '@angular/core';
import { OverlayComponent } from '../overlay/overlay.component';
import { UpdateCourseLectureComponent } from '../update-course/update-course-lecture/update-course-lecture.component';
import { HelperService } from '../services/helper.service';
import { DEFAULT_LECTURE } from '../models/update_course';
import { DEFAULT_COURSE_RECORD } from '../models/update_course_record';
import { DEFAULT_RESOURCE_PERSON } from '../models/user';
import { Router } from '@angular/router';

@Component({
  selector: 'app-component-overlay',
  templateUrl: './component-overlay.component.html',
  styleUrls: ['./component-overlay.component.css', "../overlay/overlay.component.css"]
})
export class ComponentOverlayComponent extends OverlayComponent {
  @Input() component: typeof UpdateCourseLectureComponent | null = UpdateCourseLectureComponent;

  constructor(private helper: HelperService) {
    super(inject(Router));
  }

  closeDialog() {
    this.helper.resetComponentDialogData();
  }
}
