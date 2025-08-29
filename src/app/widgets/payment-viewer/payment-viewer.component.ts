import { Component, Input, OnInit } from '@angular/core';
import { arrayRemove, arrayUnion, collection, doc, where, writeBatch } from 'firebase/firestore';
import { NEVER, Observable, concatMap, map, of } from 'rxjs';
import { DEFAULT_UPDATE_COURSE, UPDATE_COURSES, UpdateCourse } from 'src/app/models/update_course';
import { DEFAULT_COURSE_RECORD, PaymentRecord, UPDATE_COURSES_RECORDS, UpdateCourseRecord } from 'src/app/models/update_course_record';
import { AppUser, USERS } from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth.service';
import { HelperService } from 'src/app/services/helper.service';
import { CardList } from '../card-list/card-list.component';

type ApprovalStates = "initial" | "final";
export interface PaymentManager {
  record: PaymentRecord
}

@Component({
  selector: 'app-payment-viewer',
  templateUrl: './payment-viewer.component.html',
  styleUrls: ['./payment-viewer.component.css']
})
export class PaymentViewerComponent implements OnInit {
  @Input() record: UpdateCourseRecord = Object.assign({}, DEFAULT_COURSE_RECORD);
  @Input() updateCourse: UpdateCourse = Object.assign({}, DEFAULT_UPDATE_COURSE);
  approval$: Observable<ApprovalStates> = of("initial");
  userDetails$: Observable<CardList[]> = NEVER;

  constructor(private authService: AuthService, private helper: HelperService) { }

  appUsersToCardList = (appUsers: AppUser[]) => {
    const keys = ["firstname", "middlename", "lastname", "gender", "phoneNumber", "whatsapp",
      "email", "country", "zip", "designation", "practicePlace", "college"] as const;
    if (appUsers.length > 0) {
      return keys.map(key => { return { title: appUsers[0][key], subtitle: key, text: "" } })
    }
    return keys.map(_k => { return { title: "", subtitle: "", text: "" } });
  }

  ngOnInit(): void {
    this.userDetails$ = this.authService.queryCollections$<AppUser>
      (USERS, where("email", "==", this.record.userEmail)).pipe(
        map(this.appUsersToCardList)
      );
  }

  approve() {
    this.approval$ = this.authService.getFirestore$().pipe(
      concatMap(db => {
        const batch = writeBatch(db);
        const recordRef = doc(collection(db, UPDATE_COURSES_RECORDS), this.record.id);
        batch.update(recordRef, { approved: true });
        const updateCourseRef = doc(collection(db, UPDATE_COURSES), this.updateCourse.updateCourseId);
        if (this.record.courseType === 'Membership') {
          const members = typeof(this.updateCourse.membershipParticipants) === "string" ?
            this.updateCourse.membershipParticipants.split(", ") : 
            this.updateCourse.membershipParticipants
          members.push(this.record.userEmail);
          batch.update(updateCourseRef, { membershipParticipants: arrayUnion(this.record.userEmail) })
        }
        if (this.record.courseType === 'Fellowship') {
          const fellows = typeof(this.updateCourse.fellowshipParticipants) === "string" ? 
            this.updateCourse.fellowshipParticipants.split(", ") : 
            this.updateCourse.fellowshipParticipants;
          fellows.push(this.record.userEmail);
          batch.update(updateCourseRef, { fellowshipParticipants: arrayUnion(this.record.userEmail)})
        }
        if (this.record.courseType === 'ToT') {
          const tots = typeof(this.updateCourse.totParticipants) === "string" ? 
            this.updateCourse.totParticipants.split(", ") :
            this.updateCourse.totParticipants;
          tots.push(this.record.userEmail);
          batch.update(updateCourseRef, { totParticipants: arrayUnion(this.record.userEmail) })
        }

        return batch.commit();
      }),
      map(_v => "final")
    )
  }

  deny() {
    this.approval$ = this.authService.getFirestore$().pipe(
      concatMap(db => {
        const batch = writeBatch(db);
        const recordRef = doc(collection(db, UPDATE_COURSES_RECORDS), this.record.id);
        batch.update(recordRef, { approved: false });
        const updateCourseRef = doc(collection(db, UPDATE_COURSES), this.updateCourse.updateCourseId);
        if (this.record.courseType === 'Membership') {
          let members = typeof(this.updateCourse.membershipParticipants) === "string" ?
          this.updateCourse.membershipParticipants.split(", ") : 
          this.updateCourse.membershipParticipants;
          if (members.includes(this.record.userEmail)) {
            members = members.filter(rec => rec.toLowerCase() !== this.record.userEmail.toLowerCase());
            batch.update(updateCourseRef, { membershipParticipants: arrayRemove(this.record.userEmail) })
          }
        }
        if (this.record.courseType === 'Fellowship') {
          let fellows = typeof(this.updateCourse.fellowshipParticipants) === "string" ? 
            this.updateCourse.fellowshipParticipants.split(", ") : 
            this.updateCourse.fellowshipParticipants;
          if (fellows.includes(this.record.userEmail)) {
            fellows = fellows.filter(rec => rec.toLowerCase() !== this.record.userEmail.toLowerCase());
            batch.update(updateCourseRef, { fellowshipParticipants: arrayRemove(this.record.userEmail) })
          }
        }
        if (this.record.courseType === 'ToT') {
          let tots = typeof(this.updateCourse.totParticipants) === "string" ? 
            this.updateCourse.totParticipants.split(", ") : 
            this.updateCourse.totParticipants;
          if (tots.includes(this.record.userEmail)) {
            tots = tots.filter(rec => rec.toLowerCase() !== this.record.userEmail.toLowerCase());
            batch.update(updateCourseRef, { totParticipants: arrayRemove(this.record.userEmail) })
          }
        }

        return batch.commit();
      }),
      map(_v => "final")
    )
  }

  continue() {
    this.helper.resetComponentDialogData();
    // this.helper.setComponentDialogData()
  }
}
