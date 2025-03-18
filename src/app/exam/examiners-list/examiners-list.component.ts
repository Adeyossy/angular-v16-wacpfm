import { Component, Input, OnInit } from '@angular/core';
import { arrayRemove, arrayUnion } from 'firebase/firestore';
import { catchError, map, Observable, of } from 'rxjs';
import { AcademicWriting, CANDIDATES, DEFAULT_ACADEMIC_WRITING } from 'src/app/models/candidate';
import { Examiner } from 'src/app/models/examiner';
import { AuthService } from 'src/app/services/auth.service';
import { ExamService } from 'src/app/services/exam.service';

@Component({
  selector: 'app-examiners-list',
  templateUrl: './examiners-list.component.html',
  styleUrls: ['./examiners-list.component.css']
})
export class ExaminersListComponent implements OnInit {
  examiners$: Observable<Examiner[]> = of([]);
  @Input() writing: AcademicWriting = JSON.parse(JSON.stringify(DEFAULT_ACADEMIC_WRITING));
  @Input() allWritings: AcademicWriting[] = [];
  declare oldWriting: AcademicWriting;

  selecting$: Observable<string> | null = null;

  constructor(private authService: AuthService, private examService: ExamService) { }

  ngOnInit(): void {
    this.oldWriting = JSON.parse(JSON.stringify(this.writing));

    this.examiners$ = this.examService.queryExaminers$(this.writing.examAlias).pipe(
      map(examiners => examiners.filter(e => e.venue !== undefined && e.venue !== ""))
    );
  }

  toCardListItem(examiner: Examiner) {
    return {
      title: examiner.name,
      subtitle: examiner.country === "Nigeria" ? `${examiner.country} ${examiner.geopolitical}` : examiner.country,
      text: `${examiner.dissertationsSupervised} dissertations supervised | ${examiner.casebooksSupervised} casebooks supervised`
    };
  }

  selectExaminer(examiner: Examiner) {
    const writing: AcademicWriting = JSON.parse(JSON.stringify(this.writing));
    
    // It's expected the writing should have an exam alias. In the event that it does not
    // assign the examiner's exam alias to the writing.
    // This comes with the caveat that the examiner's data being considered is that of
    // the current exam.
    if (writing.examAlias === undefined) writing.examAlias = examiner.examAlias;
    const email = writing.examinerEmails.find(
      email => email.toLowerCase().trim() === examiner.userEmail.toLowerCase().trim()
    );

    if (email) {
      writing.examinerEmails = writing.examinerEmails.filter(
        e => email.toLowerCase().trim() !== e.toLowerCase().trim()
      )
    } else {
      writing.examinerEmails.push(examiner.userEmail.toLowerCase().trim());
    }

    const id = writing.examinerIds.find(
      id => id.toLowerCase().trim() === examiner.userId.toLowerCase().trim()
    );

    if (id) {
      writing.examinerIds = writing.examinerIds.filter(
        i => id.toLowerCase().trim() !== i.toLowerCase().trim()
      )
    } else {
      writing.examinerIds.push(examiner.userId.toLowerCase().trim());
    }

    this.writeToDoc(writing)
  }

  writeToDoc(writing: AcademicWriting) {
    const path = `${CANDIDATES}/${this.examService.parseIdToExamId(writing.candidateId, writing.examAlias)}`;
    console.log("path =>", path);
    console.log("writing =>", writing);
    this.selecting$ = this.authService.batchWriteDocs$([
      {
        path,
        data: {
          [writing.type]: arrayRemove(this.oldWriting)
        },
        type: 'update'
      },
      {
        path,
        data: { [writing.type]: arrayUnion(writing) },
        type: "update"
      }
    ]).pipe(
      map(r => {
        this.writing = writing;
        this.selecting$ = null;
        return r;        
      }),
      catchError(err => {
        console.log("error writing document =>", err);
        this.selecting$ = null;
        return of("");
      })
    )
  }

  getSupervisions(examiner: Examiner) {
    const supervisions = this.allWritings.filter(w => w.examinerEmails.includes(examiner.userEmail));
    const casebooks = supervisions.filter(s => s.type === "casebooks");
    const dissertations = supervisions.filter(s => s.type === "dissertations");
    return [`${casebooks.length} casebooks`, `${dissertations.length} dissertations`];
  }
}
