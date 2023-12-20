import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';

@Component({
  selector: 'app-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.css']
})
export class SelectComponent implements OnInit {
  @Input() mode = "";
  @Input() items: string[] = [];
  itemsSelectionState: boolean[] = [];
  overallState = false;
  @Output() emitItems = new EventEmitter<string[]>();

  ngOnInit(): void {
    this.itemsSelectionState = this.items.map(_item => false);
  }

  toggleItem(index: number) {
    console.log('index => ', index);
    console.log('itemsSelectionState => ', this.itemsSelectionState[index]);
    if (this.mode === "single") {
      const itemState = this.itemsSelectionState[index];
      this.itemsSelectionState = this.itemsSelectionState.fill(false);
      this.itemsSelectionState[index] = !itemState;
    } else {
      this.itemsSelectionState[index] = !this.itemsSelectionState[index];
    }
    this.emitItems.emit(this.items.filter((_item, index) => this.itemsSelectionState[index]));
  }

  showItem(index: number): boolean {
    this.overallState = !!this.itemsSelectionState.find(item => item);
    if (this.overallState) {
      return this.itemsSelectionState[index];
    } else {
      return !this.itemsSelectionState[index];
    }
  }

  showAll() {
    this.itemsSelectionState.fill(false);
  }


}
