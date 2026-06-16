import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { concatMap, map, Observable, of } from 'rxjs';
import { Event } from 'src/app/models/event';
import { Transaction } from 'src/app/models/payment';
import { UpdateCourse } from 'src/app/models/update_course';
import { PaymentService } from 'src/app/services/payment.service';
import { CardList } from 'src/app/widgets/card-list/card-list.component';

@Component({
  selector: 'app-payments',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.css']
})
export class PaymentsComponent implements OnInit {
  items$: Observable<Array<[string, CardList[]]>> = of([]);
  transactions$: Observable<CardList[]> = of([]);
  activity$: Observable<UpdateCourse | Event> = of();

  constructor(private activatedRoute: ActivatedRoute, private paymentService: PaymentService) {}

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

    this.items$ = this.activatedRoute.paramMap.pipe(
      map(this.getParams),
      concatMap(([category, id]) => this.paymentService.getPaymentList(category, id)),
      map(list => [["All", list]])
    );

    this.transactions$ = this.paymentService.getSuccessfulPayments$(
      "",
      ""
    ).pipe(
      map(transactions => transactions.map(transaction => {
        return {
          title: transaction.customer.email,
          subtitle: transaction.reference,
          text: ""
        }
      }))
    );
  }
}
