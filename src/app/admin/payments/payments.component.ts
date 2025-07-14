import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { concatMap, map, Observable, of } from 'rxjs';
import { PaymentService } from 'src/app/services/payment.service';
import { CardList } from 'src/app/widgets/card-list/card-list.component';

@Component({
  selector: 'app-payments',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.css']
})
export class PaymentsComponent implements OnInit {
  items$: Observable<Array<[string, CardList[]]>> = of([]);

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
    this.items$ = this.activatedRoute.paramMap.pipe(
      map(this.getParams),
      concatMap(([category, id]) => this.paymentService.getPaymentList(category, id)),
      map(list => [["All", list]])
    );
  }
}
