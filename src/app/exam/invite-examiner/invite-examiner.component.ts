import { Component, Input, OnInit } from '@angular/core';
import { arrayRemove, arrayUnion } from 'firebase/firestore';
import { catchError, map, Observable, of } from 'rxjs';
import { EXAMS } from 'src/app/models/exam';
import { Examiner, EXAMINERS, NEW_EXAMINER } from 'src/app/models/examiner';
import { AuthService } from 'src/app/services/auth.service';
import { HelperService } from 'src/app/services/helper.service';

type Venue = "Ibadan" | "Accra" | "Abuja" | undefined | "";

@Component({
  selector: 'app-invite-examiner',
  templateUrl: './invite-examiner.component.html',
  styleUrls: ['./invite-examiner.component.css']
})
export class InviteExaminerComponent implements OnInit {
  @Input() examiner: Examiner = Object.assign({}, NEW_EXAMINER);
  venues = ['Ibadan', 'Abuja', 'Accra'];
  venuesSelection: boolean[] = [];
  initialVenue: Venue = "";
  hasVenueChanged = false;
  updateTracker$: Observable<boolean> | null = null;

  constructor(private authService: AuthService, public helper: HelperService) {}

  ngOnInit(): void {
    this.initialVenue = this.examiner.venue;
    this.toItemSelectionState();
  }

  toItemSelectionState() {
    const invitationVenue = this.examiner.venue ? this.examiner.venue.toLowerCase().trim() : "";
    this.venuesSelection = this.venues.map(venue => venue.toLowerCase().trim() === invitationVenue);
  }

  changeVenue(venues: string[]) {
    const venue = venues[0] as Venue;
    this.hasVenueChanged = this.examiner.venue !== venue;
    this.examiner.venue = venue;
    this.toItemSelectionState();
  }

  effectChange() {
    this.updateTracker$ = this.authService.batchWriteDocs$([
      {
        path: `${EXAMINERS}/${this.examiner.userId.concat("_", this.examiner.examAlias)}`,
        data: { venue: this.examiner.venue },
        type: "update"
      },
      {
        path: `${EXAMS}/${this.examiner.examAlias}`,
        data: {
          invitedExaminers: arrayUnion(this.examiner.userId)
        },
        type: "update"
      }
    ]).pipe(
      map(response => response === "done"),
      catchError(err => {
        console.log("error => ", err);
        this.updateTracker$ = null;
        return of(false);
      })
    );
  }

  revokeInvitation() {
    this.examiner.venue = "";
    this.updateTracker$ = this.authService.batchWriteDocs$([
      {
        path: `${EXAMINERS}/${this.examiner.userId.concat("_", this.examiner.examAlias)}`,
        data: { venue: "" },
        type: "update"
      },
      {
        path: `${EXAMS}/${this.examiner.examAlias}`,
        data: {
          invitedExaminers: arrayRemove(this.examiner.userId)
        },
        type: "update"
      }
    ]).pipe(
      map(response => {
        this.helper.resetComponentDialogData();
        return response === "done"
      }),
      catchError(err => {
        console.log("error => ", err);
        this.updateTracker$ = null;
        return of(false);
      })
    );
  }
}
