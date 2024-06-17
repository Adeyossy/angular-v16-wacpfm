import { Component, Input } from '@angular/core';

export interface CardList {
  title: string;
  subtitle: string;
  text: string;
}

@Component({
  selector: 'app-card-list',
  templateUrl: './card-list.component.html',
  styleUrls: ['./card-list.component.css']
})
export class CardListComponent {
  @Input() item: CardList = {title: "", subtitle: "", text: "" }
  @Input() index: number = -1;
  @Input() control = false;
  @Input() state = false;
}
