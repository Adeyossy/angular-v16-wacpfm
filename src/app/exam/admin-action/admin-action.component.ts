import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { concatMap, map, Observable, of } from 'rxjs';
import { Exam } from 'src/app/models/exam';
import { Examiner } from 'src/app/models/examiner';
import { ExamService } from 'src/app/services/exam.service';

@Component({
  selector: 'app-admin-action',
  templateUrl: './admin-action.component.html',
  styleUrls: ['./admin-action.component.css']
})
export class AdminActionComponent implements OnInit {
  exam$: Observable<Exam[]> = of([]);
  examiners$: Observable<Examiner[]> = of([]);

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
  }
}
