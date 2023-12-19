import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.css']
})
export class SelectComponent {
  @Input() mode = "";
  @Input() items: string[] = [];
  @Input() itemsSelectionState: boolean[] = [];
  @Input() selectedItems: string[] = [];
  @Output() emitItems = new EventEmitter<string[]>();

  toggleItem(index: number) {
    if (this.mode === "single") {
      const itemState = this.itemsSelectionState[index];
      this.itemsSelectionState = this.itemsSelectionState.fill(false);
      this.itemsSelectionState[index] = itemState;
    } else {
      this.itemsSelectionState[index] = !this.itemsSelectionState[index];
    }
    this.emitItems.emit(this.items.filter(_item => this.itemsSelectionState[index]));
  }

  toggleItems(index: number) {
  }
}
