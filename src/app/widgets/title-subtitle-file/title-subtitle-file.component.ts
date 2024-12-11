import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AcademicWriting, CANDIDATES, DEFAULT_UPLOAD, DEFAULT_WRITING, Upload, Writing, WritingType } from 'src/app/models/candidate';
import { FilePlus } from '../file-upload/file-upload.component';
import { serverTimestamp } from 'firebase/firestore';
import { HelperService } from 'src/app/services/helper.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-title-subtitle-file',
  templateUrl: './title-subtitle-file.component.html',
  styleUrls: ['./title-subtitle-file.component.css']
})
export class TitleSubtitleFileComponent {
  @Input() writing: [AcademicWriting[], number] = [[], -1];
  @Output() writingEmitter = new EventEmitter<Writing>();
  @Output() titleEmitter = new EventEmitter<string>();
  @Output() subtitleEmitter = new EventEmitter<string>();

  constructor(private helper: HelperService, private authService: AuthService) {}

  toFilePlus = (file: Upload) => {
    const newFile = new File([], "empty") as FilePlus;
    newFile.blobURL = "";
    newFile.cloudURL = file.url;
    return newFile;
  }

  /**
   * Converts files in FilePlus format for storage as Upload object as part of an AcademicWriting
   * @param filesPlus files from file-upload component
   * @returns void
   */
  filePlusToUpload(filesPlus: FilePlus[]) {
    const [writings, index] = this.writing;
    const writing = writings[index];
    this.writing[0][index].files = filesPlus.map((filePlus, i) => {
      const upload: Upload = {
        description: filePlus.name,
        filetype: filePlus.type,
        id: filePlus.lastModified,
        type: writing.type,
        uploadDate: serverTimestamp(),
        url: filePlus.cloudURL
      }
      return upload;
    })
  }

  cancel() {
    this.helper.resetComponentDialogData();
  }

  parseWriting() {
    return this.writing[0][this.writing[1]];
  }

  /**
   * Update the appropriate firestore document. 
   * Use id from helper.updateCourseId (needs replacing)
   */
  update() {
    // Update the appropriate firestore document
    const writing = this.parseWriting();
    this.authService.addDocWithID$(CANDIDATES, this.helper.data.courseId, {
      [writing.type.toLowerCase()]: []
    }, true)
  }
}
