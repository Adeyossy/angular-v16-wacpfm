import { Component, OnInit } from '@angular/core';
import { where } from 'firebase/firestore';
import { map, Observable, of } from 'rxjs';
import { Exam, EXAMS } from 'src/app/models/exam';
import { ExamService } from 'src/app/services/exam.service';
import { CardGrid } from 'src/app/widgets/card-grid/card-grid.component';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  exams$: Observable<Exam[]> = of();
  cardGridItems$: Observable<CardGrid[]> = of();

  constructor(private examService: ExamService) {}

  ngOnInit(): void {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 2);
    this.cardGridItems$ = this.examService.queryItem$<Exam>(EXAMS, [
      where("registrationStartDate", ">=", date.getTime())
    ]).pipe(
      map(exams => exams.sort(this.sorter).map(this.toCardGrid))
    )
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
