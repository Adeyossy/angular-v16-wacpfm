import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { catchError, concatMap, map, Observable, of } from 'rxjs';
import { AcademicWriting, CANDIDATES, MembershipExamRecord, NEW_MEMBERSHIP_CANDIDATE } from 'src/app/models/candidate';
import { DEFAULT_LECTURE, DEFAULT_UPDATE_COURSE } from 'src/app/models/update_course';
import { DEFAULT_COURSE_RECORD } from 'src/app/models/update_course_record';
import { DEFAULT_RESOURCE_PERSON } from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth.service';
import { ExamService } from 'src/app/services/exam.service';
import { HelperService } from 'src/app/services/helper.service';

@Component({
  selector: 'app-edit-membership',
  templateUrl: './edit-membership.component.html',
  styleUrls: ['./edit-membership.component.css']
})
export class EditMembershipComponent implements OnInit {
  membership$: Observable<MembershipExamRecord> = of();
  updateTracker$: Observable<boolean> | null = null;
  yesNo = ["Yes", "No"];

  constructor(private activatedRoute: ActivatedRoute, private examService: ExamService,
    private helper: HelperService, private authService: AuthService) { }

  ngOnInit(): void {
    this.membership$ = this.activatedRoute.paramMap.pipe(
      concatMap(params => {
        let examAlias = params.get("examAlias");
        let candidateId = params.get("candidateId");
        return this.examService.queryCandidate$(examAlias!, candidateId!, NEW_MEMBERSHIP_CANDIDATE)
      })
    )
  }

  toCardList = (upload: AcademicWriting, index: number) => {
    return { title: upload.title, subtitle: upload.type, text: `${index}` }
  }

  showWriting(membership: MembershipExamRecord, index: number) {
    this.helper.setComponentDialogData({
      course: Object.assign({}, DEFAULT_UPDATE_COURSE),
      courseId: this.examService.parseCandidateExamId(membership),
      lecture: Object.assign({}, DEFAULT_LECTURE),
      lecturer: Object.assign({}, DEFAULT_RESOURCE_PERSON),
      payment: Object.assign({}, DEFAULT_COURSE_RECORD),
      writing: [membership.pmrs, index]
    });

    this.helper.toggleDialog(1);
  }

  addPMR(membership: MembershipExamRecord) {
    const pmr: AcademicWriting = {
      candidateId: membership.candidateId,
      candidateEmail: membership.userEmail,
      examAlias: membership.examAlias,
      examinerEmails: [],
      examinerIds: [],
      files: [],
      gradesByExaminer: [],
      title: "",
      type: "pmrs",
      wacpNo: "",
      description: ""
    };
    membership.pmrs.push(pmr);
    this.showWriting(membership, membership.pmrs.length - 1);
  }

  toSelectionState(items: string[], value: string) {
    return items.map(item => item.toLowerCase().trim() === value.toLowerCase().trim())
  }

  toBoolean(value: string) {
    if (value.toLowerCase() === 'yes') return true;
    return false;
  }

  update$(membership: MembershipExamRecord) {
    this.updateTracker$ = this.authService.addDocWithID$(CANDIDATES, 
      this.examService.parseCandidateExamId(membership), membership, true).pipe(
      map(_void => {
        this.helper.setDialog({
          title: "Registration Complete",
          message: "Your registration is complete. Click the button below to continue.",
          buttonText: "Continue",
          navUrl: "/dashboard/exam"
        });
        return true;
      }),
      catchError(_err => of(false))
    );
  }
}
