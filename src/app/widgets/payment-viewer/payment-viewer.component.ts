import { Component, Input } from '@angular/core';
import { collection, doc, writeBatch } from 'firebase/firestore';
import { NEVER, Observable, concatMap, map } from 'rxjs';
import { DEFAULT_UPDATE_COURSE, UPDATE_COURSES, UpdateCourse } from 'src/app/models/update_course';
import { DEFAULT_COURSE_RECORD, UPDATE_COURSES_RECORDS, UpdateCourseRecord } from 'src/app/models/update_course_record';
import { AuthService } from 'src/app/services/auth.service';
import { HelperService } from 'src/app/services/helper.service';

@Component({
  selector: 'app-payment-viewer',
  templateUrl: './payment-viewer.component.html',
  styleUrls: ['./payment-viewer.component.css']
})
export class PaymentViewerComponent {
  @Input() record: UpdateCourseRecord = Object.assign({}, DEFAULT_COURSE_RECORD);
  @Input() updateCourse: UpdateCourse = Object.assign({}, DEFAULT_UPDATE_COURSE);
  approval$: Observable<boolean> = NEVER;

  constructor(private authService: AuthService, private helper: HelperService) {}

  approve() {
    this.approval$ = this.authService.getFirestore$().pipe(
      concatMap(db => {
        const batch = writeBatch(db);
        const recordRef = doc(collection(db, UPDATE_COURSES_RECORDS), this.record.id);
        batch.update(recordRef, {approved: true});
        const updateCourseRef = doc(collection(db, UPDATE_COURSES), this.updateCourse.updateCourseId);
        if (this.record.courseType === 'Membership') {
          const members = this.updateCourse.membershipParticipants.split(", ");
          members.push(this.record.userEmail);
          batch.update(updateCourseRef, {membershipParticipants: members.join(", ")})
        }
        if (this.record.courseType === 'Fellowship') {
          const fellows = this.updateCourse.fellowshipParticipants.split(", ");
          fellows.push(this.record.userEmail);
          batch.update(updateCourseRef, {fellowshipParticipants: fellows.join(", ")})
        }
        if (this.record.courseType === 'ToT') {
          const tots = this.updateCourse.totParticipants.split(", ");
          tots.push(this.record.userEmail);
          batch.update(updateCourseRef, {totParticipants: tots.join(", ")})
        }

        return batch.commit();
      }),
      map(_v => true)
    )
  }

  deny() {
    this.approval$ = this.authService.updateDoc$(UPDATE_COURSES_RECORDS, this.record.id, 
      {approved: false}).pipe(map(_v => true));
  }

  continue() {
    this.helper.toggleDialog(-1);
    // this.helper.setComponentDialogData()
  }
}