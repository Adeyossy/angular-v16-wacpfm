import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Upload } from 'src/app/models/candidate';
import { FilePlus } from '../file-upload/file-upload.component';

@Component({
  selector: 'app-title-subtitle-file',
  templateUrl: './title-subtitle-file.component.html',
  styleUrls: ['./title-subtitle-file.component.css']
})
export class TitleSubtitleFileComponent {
  @Input() title = "";
  @Input() subtitle? = "";
  @Input() files: Upload[] = [];
  @Output() titleEmitter = new EventEmitter<string>();
  @Output() subtitleEmitter = new EventEmitter<string>();

  toFile = (file: Upload) => {
    const newFile = new File([], "empty");
    const filePlus: FilePlus = {
      blobURL: "",
      cloudURL: file.url,
      ...newFile
    }
    return filePlus;
  }
}
