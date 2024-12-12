import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AcademicWriting, CANDIDATES, DEFAULT_UPLOAD, DEFAULT_WRITING, Upload, Writing, WritingType } from 'src/app/models/candidate';
import { FilePlus } from '../file-upload/file-upload.component';
import { serverTimestamp } from 'firebase/firestore';
import { HelperService } from 'src/app/services/helper.service';
import { AuthService } from 'src/app/services/auth.service';
import { catchError, map, Observable, of } from 'rxjs';

@Component({
  selector: 'app-title-subtitle-file',
  templateUrl: './title-subtitle-file.component.html',
  styleUrls: ['./title-subtitle-file.component.css']
})
export class TitleSubtitleFileComponent implements OnInit {
  @Input() writing: [AcademicWriting[], number] = [[], -1];
  filesPlus: FilePlus[] = [];
  @Output() writingEmitter = new EventEmitter<Writing>();
  @Output() titleEmitter = new EventEmitter<string>();
  @Output() subtitleEmitter = new EventEmitter<string>();
  updateWriting$: Observable<boolean> | null = null;

  constructor(private helper: HelperService, private authService: AuthService) {}

  ngOnInit(): void {
    this.filesPlus = this.parseWriting().files.map(this.toFilePlus);
  }

  toFilePlus = (upload: Upload) => {
    const newFile = new File([], "empty") as FilePlus;
    newFile.blobURL = "";
    newFile.cloudURL = upload.url;
    return newFile;
  }

  setTitle(title: string) {
    this.writing[0][this.writing[1]].title = title;
  }

  setDescription(description: string) {
    this.writing[0][this.writing[1]].description = description;
  }

  createFilePlus() {
    const obj: Upload = JSON.parse(JSON.stringify(DEFAULT_UPLOAD));
    this.filesPlus.unshift(this.toFilePlus(obj));
  }

  createUpload() {
    const obj: Upload = JSON.parse(JSON.stringify(DEFAULT_UPLOAD));
    this.writing[0][this.writing[1]].files.push(obj);
    // this.filesPlus.unshift(this.toFilePlus(obj));
  }

  updateFilePlus([filePlus, index]: [FilePlus, number]) {
    this.filesPlus[index] = filePlus;
  }

  updateUpload([filePlus, index]: [FilePlus, number]) {
    this.writing[0][this.writing[1]].files[index] = this.filePlusToUpload(filePlus);

  }

  deleteFilePlus(index: number) {
    this.filesPlus.splice(index, 1);
  }

  deleteUpload(index: number) {
    this.writing[0][this.writing[1]].files.splice(index, 1);
  }

  filePlusToUpload = (filePlus: FilePlus) => {
    const [writings, index] = this.writing;
    const writing = writings[index];
    const upload: Upload = {
      description: filePlus.name,
      filetype: filePlus.type,
      id: filePlus.lastModified,
      type: writing.type,
      uploadDate: Date.now(),
      url: filePlus.cloudURL
    }
    return upload;
  }

  /**
   * Converts files in FilePlus format for storage as Upload object as part of an AcademicWriting
   * @param filesPlus files from file-upload component
   * @returns void
   */
  filesPlusToUploads(filesPlus: FilePlus[]) {
    this.writing[0][this.writing[1]].files = filesPlus.map(this.filePlusToUpload);
  }

  cancel() {
    this.helper.resetComponentDialogData();
    this.helper.toggleDialog(-1);
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
    this.filesPlusToUploads(this.filesPlus);
    const writing = this.parseWriting();
    this.updateWriting$ = this.authService.addDocWithID$(CANDIDATES, this.helper.data.courseId, {
      [writing.type.toLowerCase()]: this.writing[0]
    }, true).pipe(
      map(_v => {
        this.cancel();
        return true;
      }),
      catchError(err => {
        console.log("error updating writing => ", err);
        this.updateWriting$ = null;
        return of(false);
      })
    )
  }
}
