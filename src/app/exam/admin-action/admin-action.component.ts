import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { concatMap, map, Observable, of } from 'rxjs';
import { Candidate } from 'src/app/models/candidate';
import { Exam } from 'src/app/models/exam';
import { Examiner } from 'src/app/models/examiner';
import { ExamService } from 'src/app/services/exam.service';
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
  candidates$: Observable<Candidate[]> = of([]);
  candidatesList$: Observable<CardList[]> = of([]);

  constructor(private examService: ExamService, private activatedRoute: ActivatedRoute) {}

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
            text: examiner.userEmail
          }
        });
        return of(examinersList);
      })
    )
  }
}
