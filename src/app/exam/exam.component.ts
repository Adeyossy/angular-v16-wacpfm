import { Component, OnInit } from '@angular/core';
import { Exam, EXAMS } from '../models/exam';
import { NEVER, Observable } from 'rxjs';
import { ExamService } from '../services/exam.service';

@Component({
  selector: 'app-exam',
  templateUrl: './exam.component.html',
  styleUrls: ['./exam.component.css']
})
export class ExamComponent implements OnInit {
  exam$: Observable<Exam> = NEVER;

  constructor(private examService: ExamService) {}

  ngOnInit(): void {
    this.exam$ = this.examService.getItem$(EXAMS);
  }
}
