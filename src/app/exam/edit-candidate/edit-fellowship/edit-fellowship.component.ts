import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { where } from 'firebase/firestore';
import { concatMap, map, Observable, of } from 'rxjs';
import { AcademicWriting, CANDIDATES, DISSERTATION, Dissertation, FellowshipExamRecord, NEW_FELLOWSHIP_CANDIDATE } from 'src/app/models/candidate';
import { DEFAULT_LECTURE, DEFAULT_UPDATE_COURSE } from 'src/app/models/update_course';
import { DEFAULT_COURSE_RECORD } from 'src/app/models/update_course_record';
import { DEFAULT_RESOURCE_PERSON } from 'src/app/models/user';
import { ExamService } from 'src/app/services/exam.service';
import { HelperService } from 'src/app/services/helper.service';

@Component({
  selector: 'app-edit-fellowship',
  templateUrl: './edit-fellowship.component.html',
  styleUrls: ['./edit-fellowship.component.css']
})
export class EditFellowshipComponent implements OnInit {
  fellowship$: Observable<FellowshipExamRecord> = of();
  updateTracker$: Observable<boolean> | null = null;

  constructor(private examService: ExamService, private route: ActivatedRoute,
    private helper: HelperService) { }

  ngOnInit(): void {
    this.fellowship$ = this.route.paramMap.pipe(
      concatMap(params => {
        const examAlias = params.get("examAlias");
        const candidateId = params.get("candidateId");
        return this.examService.queryItem$<FellowshipExamRecord>(CANDIDATES, [
          where("examAlias", "==", examAlias),
          where("candidateId", "==", candidateId)
        ]);
      }),
      map(records => {
        if (records.length === 0) return Object.assign({}, NEW_FELLOWSHIP_CANDIDATE);
        return records[0];
      })
    );
  }

  toCardList = (upload: AcademicWriting, index: number) => {
    return { title: upload.title, subtitle: upload.type, text: `${index}` }
  }

  showWriting(fellowship: FellowshipExamRecord, index: number, writings: AcademicWriting[]) {
    const data = this.helper.resetComponentDialogData();
    data.courseId = this.examService.parseCandidateExamId(fellowship);
    data.writing = [writings, index];
    this.helper.setComponentDialogData(data);
  }

  addDissertation(fellowship: FellowshipExamRecord) {
    const dissertation: Dissertation = {
      abstract: "",
      candidateId: fellowship.candidateId,
      candidateEmail: fellowship.userEmail,
      examAlias: fellowship.examAlias,
      examinerEmails: [],
      examinerIds: [],
      files: [],
      gradesByExaminer: [],
      title: "",
      type: "dissertations",
      wacpNo: fellowship.examNo,
      description: ""
    };
    fellowship.dissertations.push(dissertation);
    this.showWriting(fellowship, fellowship.dissertations.length - 1, fellowship.dissertations);
  }

  addCasebook(fellowship: FellowshipExamRecord) {
    const casebook: AcademicWriting = {
      candidateEmail: fellowship.userEmail,
      candidateId: fellowship.candidateId,
      examAlias: fellowship.examAlias,
      examinerEmails: [],
      examinerIds: [],
      files: [],
      gradesByExaminer: [],
      title: "",
      type: "casebooks",
      wacpNo: fellowship.examNo,
      description: ""
    };
    fellowship.casebooks.push(casebook);
    this.showWriting(fellowship, fellowship.casebooks.length - 1, fellowship.casebooks);
  }

  done() {
    this.examService.showDoneMessage();
  }

  // update$(membership: MembershipExamRecord) {
  //   this.updateTracker$ = this.authService.addDocWithID$(CANDIDATES,
  //     this.examService.parseCandidateExamId(membership), membership, true).pipe(
  //       map(_void => {
  //         this.helper.setDialog({
  //           title: "Registration Complete",
  //           message: "Your registration is complete. Click the button below to continue.",
  //           buttonText: "Continue",
  //           navUrl: "/dashboard/exam"
  //         });
  //         return true;
  //       }),
  //       catchError(_err => of(false))
  //     );
  // }
}
