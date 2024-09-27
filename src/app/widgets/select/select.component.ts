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
    this.overallState = !!this.itemsSelectionState.find(this.findPredicate);
  }

  toggleItem(index: number) {
    if (this.mode === "single") {
      const itemState = this.itemsSelectionState[index];
      this.itemsSelectionState = this.itemsSelectionState.fill(false);
      this.itemsSelectionState[index] = !itemState;
      this.overallState = !itemState;
    } else {
      this.itemsSelectionState[index] = !this.itemsSelectionState[index];
    }
    this.emitItems.emit(this.items.filter((_item, index) => this.itemsSelectionState[index]));
  }

  showItem(index: number): boolean {
    const truth = this.itemsSelectionState.find(this.findPredicate);
    console.log(this.itemsSelectionState);
    console.log("Truth => ", truth);
    if (truth) {
      return this.itemsSelectionState[index];
    } else {
      return !this.itemsSelectionState[index];
    }
  }

  showAll() {
    console.log("show all");
    this.overallState = false;
    this.itemsSelectionState.fill(false);
    console.log("all state => ", this.itemsSelectionState);
  }

  findPredicate = (state: boolean) => {
    return state
  }
}
