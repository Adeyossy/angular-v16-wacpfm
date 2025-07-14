import { Component, Input } from '@angular/core';

export interface CardGridItem {
  title: string; 
  description: string; 
  link: string
}

@Component({
  selector: 'app-card-grid',
  templateUrl: './card-grid.component.html',
  styleUrls: ['./card-grid.component.css']
})
export class CardGridComponent {
  @Input() items: {title: string; description: string; link: string}[] = [];
}
