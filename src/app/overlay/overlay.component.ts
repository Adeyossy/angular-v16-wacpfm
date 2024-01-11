import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-overlay',
  templateUrl: './overlay.component.html',
  styleUrls: ['./overlay.component.css']
})
export class OverlayComponent {
  @Input() title = "";
  @Input() description = "";
  @Input() bi = "";
  @Input() navText = "";
  @Input() done = false;
  @Input() narrow = false;
  @Output() clickEmitter = new EventEmitter();

  emitClick() {
    this.clickEmitter.emit();
  }
}
