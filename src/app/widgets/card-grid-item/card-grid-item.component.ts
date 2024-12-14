import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-card-grid-item',
  templateUrl: './card-grid-item.component.html',
  styleUrls: ['./card-grid-item.component.css']
})
export class CardGridItemComponent {
  @Input() link = window.location.href;
  @Input() title = "";
  @Input() description = "";
  @Input() linkText = "GO"
}
