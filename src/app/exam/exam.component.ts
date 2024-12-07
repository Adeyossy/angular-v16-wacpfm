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
  registrationTasks = [
    {
      title: "Candidate",
      description: "Membership",
      link: "/dashboard/exam/:examAlias/candidate/membership/:userId/edit"
    },
    {
      title: "Candidate",
      description: "Fellowship",
      link: "/dashboard/exam/:examAlias/candidate/fellowship/:userId/edit"
    },
    {
      title: "Examiner",
      description: "",
      link: "/dashboard/exam/:examAlias/examiner/:userId/edit"
    }
  ];

  continuationTasks = [
    {
      title: "Home",
      description: "",
      link: ":examAlias/:userType/:userId"
    }
  ]

  constructor(private examService: ExamService, private authService: AuthService) { }

  ngOnInit(): void {
    this.appUser$ = this.authService.getAppUser$();
    this.exam$ = this.examService.queryItem$<Exam>(EXAMS, [
      where("alias", "==", "first2025")
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
    if (exam.fellowship.candidates.includes(userEmail)) return "fellowship";
    else {
      if (exam.examiners.includes(userEmail)) return "examiner";
      else if (exam.membership.candidates.includes(userEmail)) return "membership";
      else return ""
    }
  }

  replaceReg(examAlias: string, userId: string) {
    return this.registrationTasks.map(r => {
      r.link = r.link.replace(":examAlias", examAlias).replace(":userId", userId);
      return r;
    })
  }

  replaceHome(examAlias: string, userType: string, userId: string) {
    return this.continuationTasks.map(c => {
      c.link = c.link.replace(":examAlias", examAlias).replace(":userType", userType)
      .replace(":userId", userId);
      return c;
    })
  }
}
