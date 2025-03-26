import { Component, Input, OnInit } from '@angular/core';
import { User } from 'firebase/auth';
import { Observable } from 'rxjs';
import { DISSERTATION, Dissertation, DissertationGrade, SubGrade } from 'src/app/models/candidate';
import { AppUser, USERS } from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth.service';
import { CardList } from 'src/app/widgets/card-list/card-list.component';

@Component({
  selector: 'app-dissertation',
  templateUrl: './dissertation.component.html',
  styleUrls: ['./dissertation.component.css']
})
export class DissertationComponent implements OnInit {
  // The properties that have an array as values involving the examiner (e.g. gradesByExaminer,
  // examinerEmails, examinerIds) should be filtered to show data for this examiner only
  // except the CE is viewing the details
  @Input() dissertation: Dissertation = JSON.parse(JSON.stringify(DISSERTATION));
  declare oldBook: typeof this.dissertation;
  declare user$: Observable<User>;
  gradesBySection: CardList[][] = [];
  sections: SubGrade[] = [];
  
  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.oldBook = JSON.parse(JSON.stringify(this.dissertation));
    this.user$ = this.authService.getFirebaseUser$();
    this.gradesBySection = this.dissertation.gradesByExaminer.map(this.gradeToCardList);
  }

  getUserDetails$(email: string) {
    return this.authService.queryByUserEmail$<AppUser>(USERS);
  }

  getSections(grade: DissertationGrade) {
    return [
      grade.abstract, grade.preliminaryPages, grade.introduction, grade.literatureReview,
      grade.method, grade.results, grade.discussion, grade.references, grade.appendices
    ];
  }

  subGradeToCardList = (subGrade: SubGrade & {title: string}): CardList => {
    return {
      title: subGrade.title,
      subtitle: `Score: ${subGrade.score}`,
      text: subGrade.comment
    }
  }

  gradesToCardList = (grade: DissertationGrade) => {
    return this.getSections(grade).map(this.subGradeToCardList)
  }

  gradeToCardList = (grade: DissertationGrade) => {
    return [
      {
        title: grade.abstract.title,
        subtitle: "Score".concat(": ", grade.abstract.score.toString()),
        text: grade.abstract.comment
      },
      {
        title: grade.preliminaryPages.title,
        subtitle: "Score".concat(": ", grade.preliminaryPages.score.toString()),
        text: grade.preliminaryPages.comment
      },
      {
        title: grade.introduction.title,
        subtitle: "Score".concat(": ", grade.introduction.score.toString()),
        text: grade.introduction.comment
      },
      {
        title: grade.literatureReview.title,
        subtitle: "Score".concat(": ", grade.literatureReview.score.toString()),
        text: grade.literatureReview.comment
      },
      {
        title: grade.method.title,
        subtitle: "Score".concat(": ", grade.method.score.toString()),
        text: grade.method.comment
      },
      {
        title: grade.results.title,
        subtitle: "Score".concat(": ", grade.results.score.toString()),
        text: grade.results.comment
      },
      {
        title: grade.discussion.title,
        subtitle: "Score".concat(": ", grade.discussion.score.toString()),
        text: grade.discussion.comment
      },
      {
        title: grade.references.title,
        subtitle: `Score: ${grade.references.score}`,
        text: grade.references.comment
      },
      {
        title: grade.appendices.title,
        subtitle: `Score: ${grade.appendices.score}`,
        text: grade.appendices.comment
      }
    ];
  }
}
