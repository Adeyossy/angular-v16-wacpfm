import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DEFAULT_UPLOAD, DEFAULT_WRITING, Upload, Writing, WritingType } from 'src/app/models/candidate';
import { FilePlus } from '../file-upload/file-upload.component';
import { serverTimestamp } from 'firebase/firestore';

@Component({
  selector: 'app-title-subtitle-file',
  templateUrl: './title-subtitle-file.component.html',
  styleUrls: ['./title-subtitle-file.component.css']
})
export class TitleSubtitleFileComponent {
  @Input() writing: Writing = Object.assign({}, DEFAULT_WRITING);
  @Output() writingEmitter = new EventEmitter<Writing>();
  @Output() titleEmitter = new EventEmitter<string>();
  @Output() subtitleEmitter = new EventEmitter<string>();

  toFilePlus = (file: Upload) => {
    const newFile = new File([], "empty") as FilePlus;
    newFile.blobURL = "";
    newFile.cloudURL = file.url;
    return newFile;
  }

  /**
   * Converts files in FilePlus format for storage as Upload object, then emits it
   * @param filesPlus files from file-upload component
   * @returns void
   */
  filePlusToUpload(filesPlus: FilePlus[]) {
    return filesPlus.map(filePlus => {
      const upload: Upload = {
        description: "",
        filetype: filePlus.type,
        id: filePlus.lastModified,
        type: this.writing.type,
        uploadDate: serverTimestamp(),
        url: filePlus.cloudURL
      }
    })
  }
}
