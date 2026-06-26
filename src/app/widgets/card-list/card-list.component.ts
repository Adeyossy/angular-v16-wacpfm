import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CardListItem } from '../card-list-item/card-list-item.component';

export type CardList = CardListItem[];

@Component({
  selector: 'app-card-list',
  templateUrl: './card-list.component.html',
  styleUrls: ['./card-list.component.css']
})
export class CardListComponent {
  @Input() items: CardList = [];
  @Input() title = "";
  @Output() itemEmitter: EventEmitter<string> = new EventEmitter();

  emitClick = (id: string) => {
    this.itemEmitter.emit(id);
  }

  // trackByTitle = (_index: number, item: CardListItem) => {
  //   return item.title;
  // }

  sort = () => {
    this.items.sort((a, b) => a.title.localeCompare(b.title));
  }
}
