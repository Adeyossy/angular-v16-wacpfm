import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { where } from 'firebase/firestore';
import { catchError, concatMap, map, Observable, of } from 'rxjs';
import { Candidate, CANDIDATES, FellowshipExamRecord, NEW_CANDIDATE, NEW_FELLOWSHIP_CANDIDATE } from "src/app/models/candidate";
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
  user$: Observable<AppUser> = of();

  handicap = ["None", "Use of a wheelchair", "Use of walking frame or crutches", `Visual acuity 
    worse than 3/60 despite correction`, `Severe hearing impairment`, `Stammering`, 
    "Others"];

  updateTracker$: Observable<boolean> | null = null;

  constructor(private authService: AuthService, private activeRoute: ActivatedRoute,
    private examService: ExamService) {}

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
      concatMap(this.mapToCandidate)
    );

    this.user$ = this.authService.getAppUser$();
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
        if (candidates.length === 0) {
          switch(category.toLowerCase().trim()) {
            case "membership":
              return NEW_CANDIDATE;
            
            case "fellowship":
              return NEW_FELLOWSHIP_CANDIDATE; 

            default:
              return NEW_CANDIDATE;
          }
        } else return candidates[0];
      })
    )
  }

  fetchForFellowship(candidate: Candidate) {
    return candidate as FellowshipExamRecord;
  }

  update$() {
    this.updateTracker$ = this.candidate$.pipe(
      concatMap(candidate => this.authService.addDocWithID$(CANDIDATES, candidate.userId, 
        candidate, true)),
      map(_void => true),
      catchError(_err => of(false))
    )
  }
}
