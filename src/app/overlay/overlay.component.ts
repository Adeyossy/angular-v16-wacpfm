import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';

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
  @Input() navUrl: string | undefined = "";
  @Input() done = false;
  @Input() narrow = false;
  @Output() clickEmitter = new EventEmitter();

  constructor(private router: Router) { }

  emitClick() {
    if (this.navUrl) this.router.navigateByUrl(this.navUrl);
    this.clickEmitter.emit();
  }
}
