import { Component, OnInit } from '@angular/core';
import { where } from 'firebase/firestore';
import { Observable, of } from 'rxjs';
import { Exam, EXAMS } from 'src/app/models/exam';
import { ExamService } from 'src/app/services/exam.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  exams$: Observable<Exam[]> = of();

  constructor(private examService: ExamService) {}

  ngOnInit(): void {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 2);
    this.exams$ = this.examService.queryItem$(EXAMS, [
      where("registrationStartDate", ">=", date.getTime())
    ]);
  }

  toCardGrid = (exam: Exam) => {
    return {
      title: exam.alias.replace("-", " ").replace("_", " "),
      description: exam.title,
      link: `./${exam.alias}`
    }
  }

  sorter = (a: Exam, b: Exam) => {
    return b.registrationStartDate - a.registrationStartDate
  }
}
