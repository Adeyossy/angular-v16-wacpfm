import { Component, inject, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-card-grid-item',
  templateUrl: './card-grid-item.component.html',
  styleUrls: ['./card-grid-item.component.css']
})
export class CardGridItemComponent {
  @Input() link = inject(Router).url;
  @Input() title = "";
  @Input() description = "";
  @Input() linkText = "GO"
}
