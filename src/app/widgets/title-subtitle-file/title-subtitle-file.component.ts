import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AcademicWriting, CANDIDATES, DEFAULT_UPLOAD, DEFAULT_WRITING, Upload, Writing, WritingType } from 'src/app/models/candidate';
import { FilePlus } from '../file-upload/file-upload.component';
import { serverTimestamp } from 'firebase/firestore';
import { HelperService } from 'src/app/services/helper.service';
import { AuthService } from 'src/app/services/auth.service';
import { catchError, map, Observable, of } from 'rxjs';
import { EXAMS } from 'src/app/models/exam';

@Component({
  selector: 'app-title-subtitle-file',
  templateUrl: './title-subtitle-file.component.html',
  styleUrls: ['./title-subtitle-file.component.css']
})
export class TitleSubtitleFileComponent implements OnInit {
  @Input() writing: [AcademicWriting[], number] = [[], -1];
  path = "";
  filesPlus: FilePlus[] = [];
  updateWriting$: Observable<boolean> | null = null;

  constructor(private helper: HelperService, private authService: AuthService) {}

  ngOnInit(): void {
    const writing = this.parseWriting();
    this.path = `${EXAMS}/${writing.examAlias}/${writing.candidateId}`
  }

  setTitle(title: string) {
    this.writing[0][this.writing[1]].title = title;
  }

  setDescription(description: string) {
    this.writing[0][this.writing[1]].description = description;
  }

  updateUploads(uploads: Upload[]) {
    this.writing[0][this.writing[1]].files = uploads;
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
    // this.filesPlusToUploads(this.filesPlus);
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
