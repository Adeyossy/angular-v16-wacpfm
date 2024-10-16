import { Component, OnInit } from '@angular/core';
import { Exam, EXAMS, NEW_EXAM } from '../models/exam';
import { map, NEVER, Observable, of } from 'rxjs';
import { ExamService } from '../services/exam.service';
import { where } from 'firebase/firestore';

@Component({
  selector: 'app-exam',
  templateUrl: './exam.component.html',
  styleUrls: ['./exam.component.css']
})
export class ExamComponent implements OnInit {
  exam$: Observable<Exam> = new Observable();

  constructor(private examService: ExamService) { }

  ngOnInit(): void {
    this.exam$ = this.examService.queryItem$<Exam>(EXAMS, [
      where("registrationStartDate", "<=", Date.now()),
      where("registrationCloseDate", ">=", Date.now())
    ]).pipe(
      map(exams => {
        if (exams.length > 0) {
          if (exams.length > 1) console.log("Expected an array of 1 exam but got ", exams.length);
          return exams[0];
        } 
        
        return Object.assign({}, NEW_EXAM);
      })
    )
  }
}
