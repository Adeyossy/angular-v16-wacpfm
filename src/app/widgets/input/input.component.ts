import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.css']
})
export class InputComponent {
  @Input() attributes = {
    type: "text",
    name: "",
    label: "",
    placeholder: "",
    value: "",
    required: true,
    disabled: false,
    icon: "circle-fill"
  }
  @Output() emitValue = new EventEmitter<string>();
}
