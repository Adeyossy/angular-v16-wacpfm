import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { concatMap, map, Observable, of } from 'rxjs';
import { AcademicWriting, Candidate, FellowshipExamRecord, MembershipExamRecord } from 'src/app/models/candidate';
import { Exam } from 'src/app/models/exam';
import { Examiner } from 'src/app/models/examiner';
import { ExamService } from 'src/app/services/exam.service';
import { HelperService } from 'src/app/services/helper.service';
import { CardList } from 'src/app/widgets/card-list/card-list.component';

@Component({
  selector: 'app-admin-action',
  templateUrl: './admin-action.component.html',
  styleUrls: ['./admin-action.component.css']
})
export class AdminActionComponent implements OnInit {
  exam$: Observable<Exam[]> = of([]);
  examiners$: Observable<Examiner[]> = of([]);
  examinersList$: Observable<CardList[]> = of([]);
  candidates$: Observable<Array<MembershipExamRecord | FellowshipExamRecord>> = of([]);
  candidatesList$: Observable<CardList[]> = of([]);
  writings$: Observable<AcademicWriting[]> = of([]);

  constructor(private examService: ExamService, private activatedRoute: ActivatedRoute, 
    private helper: HelperService) {}

  ngOnInit(): void {
    const examAlias$ = this.activatedRoute.paramMap.pipe(
      map(params => params.get("examAlias")),
      map(examAlias => examAlias === null ? "" : examAlias)
    );

    this.exam$ = examAlias$.pipe(
      concatMap(examAlias => this.examService.queryExam$(examAlias))
    );

    this.examiners$ = examAlias$.pipe(
      concatMap(examAlias => this.examService.queryExaminers$(examAlias))
    );

    this.examinersList$ = this.examiners$.pipe(
      concatMap(examiners => {
        const examinersList = examiners.map(examiner => {
          return {
            title: examiner.name,
            subtitle: examiner.country,
            text: `Score: ${this.examService.scoreExaminer(examiner)}`
          }
        });
        return of(examinersList);
      })
    );

    this.candidates$ = examAlias$.pipe(
      concatMap(examAlias => this.examService.queryCandidates$(examAlias)),
      map(candidates => candidates.filter(this.candidateFilter))
    );

    this.writings$ = this.candidates$.pipe(
      map(candidates => candidates.flatMap(this.getWriting))
    );
  }

  toCardListItem = (user: Candidate | Examiner) => {
    if ("yearOfFellowship" in user) return {
      title: user.name,
      subtitle: user.country === "Nigeria" ? `${user.country} ${user.geopolitical}` : user.country,
      text: `Score: ${this.examService.scoreExaminer(user)}`
    }; 
    else return {
      title: user.wacpNo,
      subtitle: user.category,
      text: user.examCentre
    }
  }

  writingToCardListItem = (writing: AcademicWriting) => {
    return {
      title: writing.wacpNo,
      subtitle: writing.title,
      text: writing.type
    }
  }

  candidateFilter = (candidate: MembershipExamRecord | FellowshipExamRecord) => {
    if ("pmrs" in candidate) {
      return candidate.pmrs.length > 0;
    } return candidate.casebooks.length > 0 || candidate.dissertations.length > 0
  }

  getWriting = (candidate: MembershipExamRecord | FellowshipExamRecord) => {
    if ("pmrs" in candidate) {
      return candidate.pmrs.map(pmr => this.replaceWacpNo(candidate.examNo, pmr));
    } return candidate.casebooks.map(c => this.replaceWacpNo(candidate.examNo, c))
      .concat(candidate.dissertations.map(d => this.replaceWacpNo(candidate.examNo, d)))
  }

  replaceWacpNo = (examNo: string, writing: AcademicWriting) => {
    writing.wacpNo = examNo;
    return writing;
  }

  showInviteExaminer(examiner: Examiner) {
    const data = this.helper.resetComponentDialogData();
    data.courseId = examiner.userId;
    data.examiner = examiner;
    this.helper.setComponentDialogData(data);
  }

  showAssignmentDialog(writings: AcademicWriting[], writing: AcademicWriting) {
    const data = this.helper.resetComponentDialogData();
    data.courseId = writing.wacpNo;
    data.academicWriting = writing;
    data.allWritings = writings;
    this.helper.setComponentDialogData(data);
  }
}
