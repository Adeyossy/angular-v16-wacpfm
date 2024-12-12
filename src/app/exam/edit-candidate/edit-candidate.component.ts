import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { arrayUnion, doc, where, writeBatch } from 'firebase/firestore';
import { catchError, concatMap, map, Observable, of } from 'rxjs';
import { Candidate, CANDIDATES, FellowshipExamRecord, NEW_CANDIDATE, NEW_FELLOWSHIP_CANDIDATE, PreviousAttempt } from "src/app/models/candidate";
import { EXAM_DESCRIPTION, EXAMS } from 'src/app/models/exam';
import { AppUser } from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth.service';
import { ExamService } from 'src/app/services/exam.service';

@Component({
  selector: 'app-edit-candidate',
  templateUrl: './edit-candidate.component.html',
  styleUrls: ['./edit-candidate.component.css']
})
export class EditCandidateComponent implements OnInit {
  candidate$: Observable<Candidate> = new Observable();
  candidateType$: Observable<string> = of("");
  candidateCategories = ["Membership", "Fellowship"];
  candidateCurriculum = ["New", "Old"];
  yesNo = ["Yes", "No"];
  user$: Observable<AppUser> = of();

  handicap = ["None", "Use of a wheelchair", "Use of walking frame or crutches", `Visual acuity 
    worse than 3/60 despite correction`, `Severe hearing impairment`, `Stammering`,
    "Others"];

  updateTracker$: Observable<boolean> | null = null;
  previousAttempts = 0;

  constructor(private authService: AuthService, private activeRoute: ActivatedRoute,
    public examService: ExamService, private router: Router) { }

  ngOnInit(): void {
    this.candidateType$ = this.activeRoute.paramMap.pipe(
      map(paramMap => {
        const category = paramMap.get("category");
        if (category !== null) {
          return category.toLowerCase().trim();
        }
        return "";
      })
    );

    this.candidate$ = this.activeRoute.paramMap.pipe(
      concatMap(this.paramsToCandidate),
      concatMap(this.mapToCandidate),
      map(candidate => {
        this.previousAttempts = candidate.previousAttemptsDetails.length;
        return candidate;
      }),
      concatMap(candidate => this.activeRoute.paramMap.pipe(
        map(paramMap => {
          let examAlias = paramMap.get("examAlias");
          if (examAlias) candidate.examAlias = examAlias;
          let candidateId = paramMap.get("candidateId");
          if (candidateId) candidate.candidateId = candidateId;
          return candidate
        })
      ))
    );

    this.user$ = this.authService.getAppUser$();
  }

  newPreviousAttempt(): PreviousAttempt {
    return Object.assign({}, {
      month: "",
      year: "",
      modulesPassed: [].slice()
    })
  }

  paramsToCandidate = (params: ParamMap) => {
    const examAlias = params.get("examAlias");
    const candidateId = params.get("candidateId");

    if (candidateId !== null && examAlias !== null)
      return this.examService.queryItem$<Candidate>(CANDIDATES, [
        where("examAlias", "==", examAlias),
        where("candidateId", "==", candidateId)
      ]);

    return of([]);
  }

  mapToCandidate = (candidates: Candidate[]) => {
    return this.candidateType$.pipe(
      map(category => {
        let candidate: Candidate;
        if (candidates.length === 0) {
          switch (category.toLowerCase().trim()) {
            case "membership":
              candidate = Object.assign({}, NEW_CANDIDATE);
              break;

            case "fellowship":
              candidate = Object.assign({}, NEW_FELLOWSHIP_CANDIDATE);
              break;

            default:
              candidate = Object.assign({}, NEW_CANDIDATE);
              break;
          }
        } else candidate = candidates[0];
        candidate.category = category;
        return candidate;
      })
    )
  }

  fetchForFellowship(candidate: Candidate) {
    return candidate as FellowshipExamRecord;
  }

  getItems(category: string, curriculum = "old") {
    if (!curriculum) curriculum = "old";
    return EXAM_DESCRIPTION[category as "membership" | "fellowship"][curriculum as "old" | "new"]
  }

  toSelectionState(items: string[], value: string) {
    return items.map(item => item.toLowerCase().trim() === value.toLowerCase().trim())
  }

  attemptToSelectionState = (items: string[], category: string, curriculum: string) => {
    return this.getItems(category, curriculum).map(
      module => items.map(item => item.toLowerCase()).includes(module.toLowerCase())
    )
  }

  update$(candidate: Candidate) {
    // this.updateTracker$ = this.candidate$.pipe(
    //   concatMap(candidate => this.authService.addDocWithID$(CANDIDATES, candidate.userId, 
    //     candidate, true)),
    //   map(_void => true),
    //   catchError(_err => of(false))
    // );

    this.updateTracker$ = this.authService.batchWriteDocs$([
      {
        path: `${CANDIDATES}/${this.examService.parseCandidateExamId(candidate)}`, 
        data: candidate, 
        type: "set"
      },
      {
        path: `${EXAMS}/${candidate.examAlias}`,
        data: {
          [candidate.category]: {
            candidates: arrayUnion(candidate.candidateId)
          }
        },
        type: "update"
      }
    ]).pipe(
      concatMap(res => res !== "" ? this.router.navigate(['upload'], { relativeTo: this.activeRoute }) : of(false)),
      catchError(err => {
        console.log("error => ", err);
        this.updateTracker$ = null;
        return of(false);
      })
    )
  }
}
