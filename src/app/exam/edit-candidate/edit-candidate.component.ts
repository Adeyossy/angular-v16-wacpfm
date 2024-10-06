import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { Candidate } from 'src/app/models/exam';

@Component({
  selector: 'app-edit-candidate',
  templateUrl: './edit-candidate.component.html',
  styleUrls: ['./edit-candidate.component.css']
})
export class EditCandidateComponent {
  candidate$: Observable<Candidate> = new Observable();

  handicap = ["None", "Use of a wheelchair", "Use of walking frame or crutches", `Visual acuity 
    worse than 3/60 despite correction`, `Severe hearing impairment despite hearing aid`, 
    "Others"]
}
