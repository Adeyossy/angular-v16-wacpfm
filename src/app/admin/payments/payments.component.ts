import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { concatMap, map, Observable, of } from 'rxjs';
import { Event } from 'src/app/models/event';
import { Transaction } from 'src/app/models/payment';
import { DEFAULT_UPDATE_COURSE, UpdateCourse } from 'src/app/models/update_course';
import { HelperService } from 'src/app/services/helper.service';
import { PaymentService } from 'src/app/services/payment.service';
import { CardListItem } from 'src/app/widgets/card-list-item/card-list-item.component';
import { CardList } from 'src/app/widgets/card-list/card-list.component';

@Component({
  selector: 'app-payments',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.css']
})
export class PaymentsComponent implements OnInit {
  items$: Observable<Array<[string, CardListItem[]]>> = of([]);
  transactions$: Observable<Transaction[]> = of([]);
  category$: Observable<UpdateCourse | Event> = of();
  updateCourse$: Observable<UpdateCourse> = of(DEFAULT_UPDATE_COURSE);

  constructor(
    private activatedRoute: ActivatedRoute,
    private paymentService: PaymentService,
    private helper: HelperService
  ) { }

  getParam = (paramMap: ParamMap, param: string): string => {
    const arg = paramMap.get(param);
    console.log(param, "=>", arg);
    if (arg) return arg;
    return "";
  }

  getParams = (paramMap: ParamMap): [string, string] => {
    return [
      this.getParam(paramMap, "category"),
      this.getParam(paramMap, "id")
    ]
  }

  ngOnInit(): void {
    const params = this.activatedRoute.paramMap.pipe(
      map(this.getParams)
    );

    const queryParams: Observable<[string, string]> = this.activatedRoute.queryParamMap.pipe(
      map(q => [this.getParam(q, "from"), this.getParam(q, "to")])
    );

    this.items$ = this.activatedRoute.paramMap.pipe(
      map(this.getParams),
      concatMap(([category, id]) => this.paymentService.getPaymentList(category, id)),
      map(list => [["All", list]])
    );

    this.category$ = params.pipe(
      concatMap(([category, id]) => this.paymentService.getCategory$(category, id))
    );

    this.updateCourse$ = params.pipe(
      concatMap(([category, id]) => this.paymentService.getCourse$(id))
    )

    this.transactions$ = queryParams.pipe(
      concatMap(([from, to]) => this.paymentService.getSuccessfulPayments$(from, to)),
      concatMap(transactions => params.pipe(
        map(([category, id]) => transactions.filter(trx => {
          if (category === "updatecourse") return trx.amount > 1200000;
          return trx.amount < 1200000
        }).sort((a, b) => a.customer.email.charCodeAt(0) - b.customer.email.charCodeAt(0)))
      ))
    );
  }

  transactionToCardList = (transaction: Transaction, uOrE: UpdateCourse | Event) => {
    return {
      title: transaction.customer.email,
      subtitle: this.flag(uOrE, transaction.customer.email),
      text: transaction.paid_at.slice(0, 10)
    }
  }

  trackById = (_index: number, item: Transaction) => {
    return item.customer.email;
  }

  flag = (uOrE: UpdateCourse | Event, email: string) => {
    if ("updateCourseId" in uOrE) {
      return this.flagUpdateCourseTrxs(uOrE, email);
    }

    return this.flagEventTrxs(uOrE, email);
  }

  flagUpdateCourseTrxs = (updateCourse: UpdateCourse, email: string) => {
    return [
      updateCourse.membershipParticipants.includes(email) ? "Membership" : "",
      updateCourse.fellowshipParticipants.includes(email) ? "Fellowship" : "",
      updateCourse.totParticipants.includes(email) ? "ToT" : ""
    ].filter(
      c => c !== ""
    ).join(", ");
  }

  flagEventTrxs = (event: Event, email: string) => {
    return event.paid_participants.find(e => e === email) || ""
  }

  showDialog = (transaction: Transaction, updateCourse: UpdateCourse) => {
    const data = this.helper.resetComponentDialogData();
    data.course = updateCourse;
    data.courseId = updateCourse.updateCourseId;
    data.paystack = transaction;
    this.helper.setComponentDialogData(data);
  }
}
