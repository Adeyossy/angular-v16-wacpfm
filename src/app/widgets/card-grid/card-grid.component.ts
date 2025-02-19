import { Component, Input } from '@angular/core';

export interface CardGrid {title: string; description: string; link: string}
@Component({
  selector: 'app-card-grid',
  templateUrl: './card-grid.component.html',
  styleUrls: ['./card-grid.component.css']
})
export class CardGridComponent {
  @Input() items: CardGrid[] = [];
}
