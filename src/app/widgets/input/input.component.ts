import { Component, EventEmitter, Input, Output } from '@angular/core';

type InputType = {
  type: string;
  name: string;
  label: string;
  placeholder: string;
  value: string | number;
  required: boolean;
  disabled: boolean;
}

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.css']
})
export class InputComponent {
  @Input() type = "text";
  @Input() name = "";
  @Input() label = "";
  @Input() placeholder = "";
  @Input() value: string | number = "";
  @Input() required = true;
  @Input() disabled = true;
  @Input() icon = "circle-fill";
  
  @Output() emitValue = new EventEmitter<string>();
}
