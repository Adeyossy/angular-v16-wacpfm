import { Component, Input } from '@angular/core';
import { OverlayComponent } from '../overlay/overlay.component';
import { UpdateCourseLectureComponent } from '../update-course/update-course-lecture/update-course-lecture.component';

@Component({
  selector: 'app-component-overlay',
  templateUrl: './component-overlay.component.html',
  styleUrls: ['./component-overlay.component.css', "../overlay/overlay.component.css"]
})
export class ComponentOverlayComponent extends OverlayComponent {
  @Input() component: typeof UpdateCourseLectureComponent = UpdateCourseLectureComponent;
}
