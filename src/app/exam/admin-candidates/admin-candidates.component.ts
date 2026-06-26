import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { concatMap, Observable, of } from 'rxjs';
import { FellowshipExamRecord, MembershipExamRecord } from 'src/app/models/candidate';
import { ExamService } from 'src/app/services/exam.service';
import { CardListItem } from 'src/app/widgets/card-list-item/card-list-item.component';
import { CardList } from 'src/app/widgets/card-list/card-list.component';

@Component({
  selector: 'app-admin-candidates',
  templateUrl: './admin-candidates.component.html',
  styleUrls: ['./admin-candidates.component.css']
})
export class AdminCandidatesComponent implements OnInit {
  // This should lead to another route/screen/component with Membership or Fellowship dichotomies
  // For now this list will have all candidates together.

  candidates$: Observable<(MembershipExamRecord | FellowshipExamRecord)[]> = of([]);

  constructor (
    private examService: ExamService,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.candidates$ = this.examService.parseExamAliasFromRoute$(this.activatedRoute.paramMap)
    .pipe(
      concatMap(this.examService.queryCandidates$)
    );
  }

  toCardList = (candidate: MembershipExamRecord | FellowshipExamRecord): CardListItem => {
    return {
      title: candidate.wacpNo,
      subtitle: candidate.examNo,
      text: candidate.category
    }
  }
}
