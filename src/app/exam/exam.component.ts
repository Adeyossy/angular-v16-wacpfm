import { Component, OnInit } from '@angular/core';
import { Exam, EXAMS, NEW_EXAM } from '../models/exam';
import { map, NEVER, Observable, of } from 'rxjs';
import { ExamService } from '../services/exam.service';
import { where } from 'firebase/firestore';
import { AppUser } from '../models/user';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-exam',
  templateUrl: './exam.component.html',
  styleUrls: ['./exam.component.css']
})
export class ExamComponent implements OnInit {
  exam$: Observable<Exam> = new Observable();
  appUser$: Observable<AppUser> = NEVER; 

  constructor(private examService: ExamService, private authService: AuthService) { }

  ngOnInit(): void {
    this.appUser$ = this.authService.getAppUser$();
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

  getUserType(exam: Exam, userEmail: string) {
    if (exam.fellowship.candidates.includes(userEmail)) return "Fellowship Candidate";
    else {
      if (exam.fellowship.examiners.includes(userEmail)) return "Examiner";
      else if (exam.membership.curriculum.toLowerCase() === "new") {
        if (exam.membership.candidates.includes(userEmail)) return "Membership Candidate";
        else return "Examiner"
      } else return ""
    }
  }
}
