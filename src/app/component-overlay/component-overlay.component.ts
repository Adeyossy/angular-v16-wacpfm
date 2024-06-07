import { Component, Input } from '@angular/core';
import { OverlayComponent } from '../overlay/overlay.component';

@Component({
  selector: 'app-component-overlay',
  templateUrl: './component-overlay.component.html',
  styleUrls: ['./component-overlay.component.css', "../overlay/overlay.component.css"]
})
export class ComponentOverlayComponent extends OverlayComponent {
}
