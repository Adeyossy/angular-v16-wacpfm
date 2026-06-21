import { Component, Input, OnInit } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { DEFAULT_TRANSACTION, Transaction } from 'src/app/models/payment';
import { UpdateCourseRecord, UpdateCourseType } from 'src/app/models/update_course_record';
import { HelperService } from 'src/app/services/helper.service';
import { PaymentService } from 'src/app/services/payment.service';
import { UpdateCourseMetadata } from 'src/app/services/update-course.service';

@Component({
  selector: 'app-paystack-payment-viewer',
  templateUrl: './paystack-payment-viewer.component.html',
  styleUrls: ['./paystack-payment-viewer.component.css']
})
export class PaystackPaymentViewerComponent implements OnInit {
  @Input() transaction: Transaction = JSON.parse(JSON.stringify(DEFAULT_TRANSACTION));
  records$: Observable<UpdateCourseRecord[]> = of([]);
  metadata: UpdateCourseMetadata = {
    category: "Membership",
    course_id: "",
    fee: 0
  }

  constructor (public helper: HelperService, private paymentService: PaymentService) {}

  ngOnInit(): void {
    this.metadata = this.paymentService.parseTrxMetadata(this.transaction);
    console.log("metadata =>", this.metadata);

    this.records$ = this.paymentService.getRecords$(
      "updatecourse",
      this.metadata.course_id,
      this.transaction.customer.email
    ) as Observable<UpdateCourseRecord[]>;

    this.records$ = this.records$.pipe(
      map(records => {
        if (records.length) return records;
        const recordTypes: UpdateCourseType[] = this.metadata.category === "ToT & Resident" ? [
          "Membership", "Fellowship", "ToT"
        ] : [this.metadata.category];
        return this.createMissingRecords(recordTypes);
      })
    )
  }

  createMissingRecords = (recordTypes: UpdateCourseType[]): UpdateCourseRecord[] => {
    return recordTypes.map(
      r => {
        return {
          courseType: r,
          id: `${this.transaction.customer.email}-${this.helper.data.courseId}-${r}`,
          paymentId: this.transaction,
          updateCourseId: this.helper.data.courseId,
          userEmail: this.transaction.customer.email,
          userId: ""
        }
      }
    )
  }
}
