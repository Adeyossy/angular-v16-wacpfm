import { Component, OnInit } from '@angular/core';
import { catchError, concatMap, map, Observable, of } from 'rxjs';
import { Candidate, CANDIDATES, NEW_CANDIDATE } from "src/app/models/candidate";
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-edit-candidate',
  templateUrl: './edit-candidate.component.html',
  styleUrls: ['./edit-candidate.component.css']
})
export class EditCandidateComponent implements OnInit {
  candidate$: Observable<Candidate> = new Observable();

  handicap = ["None", "Use of a wheelchair", "Use of walking frame or crutches", `Visual acuity 
    worse than 3/60 despite correction`, `Severe hearing impairment`, `Stammering`, 
    "Others"];

  updateTracker$: Observable<boolean> | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.candidate$ = of(NEW_CANDIDATE);
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
