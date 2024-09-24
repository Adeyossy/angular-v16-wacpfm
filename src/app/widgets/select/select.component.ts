import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';

@Component({
  selector: 'app-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.css']
})
export class SelectComponent implements OnInit {
  @Input() mode = "";
  @Input() items: string[] = [];
  @Input() itemsSelectionState: boolean[] = [];
  overallState = false;
  @Input() noOfClicks = 0;
  @Output() emitItems = new EventEmitter<string[]>();

  ngOnInit(): void {
    if(this.itemsSelectionState.length === 0) this.itemsSelectionState = this.items.map(_item => false);
  }

  toggleItem(index: number) {
    ++this.noOfClicks;
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
    if (this.itemsSelectionState.reduce(this.reducePredicate)) {
      return this.itemsSelectionState[index];
    } else {
      return !this.itemsSelectionState[index];
    }
  }

  showAll() {
    this.itemsSelectionState.fill(false);
  }

  reducePredicate = (acc: boolean, curr: boolean) => {
    return acc || curr
  }
}
