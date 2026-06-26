import { Component, Input } from '@angular/core';

export interface CardListItem {
  title: string;
  subtitle: string;
  text: string;
}

@Component({
  selector: 'app-card-list-item',
  templateUrl: './card-list-item.component.html',
  styleUrls: ['./card-list-item.component.css']
})
export class CardListItemComponent {
  @Input() item: CardListItem = { title: "", subtitle: "", text: "" }
  @Input() index: number = -1;
  @Input() control = false;
  @Input() state = false;
}
