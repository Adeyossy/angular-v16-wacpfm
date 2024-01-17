import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-update-course-payment',
  templateUrl: './update-course-payment.component.html',
  styleUrls: ['./update-course-payment.component.css']
})
export class UpdateCoursePaymentComponent implements OnInit, OnDestroy {
  routeSub = new Subscription();
  
  constructor(private activatedRoute: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.routeSub = this.activatedRoute.paramMap.subscribe({
      next: params => {}
    })
  }

  ngOnDestroy(): void {
    this.routeSub.unsubscribe();
  }

  uploadReceipt() {
    // Use transactions for multiple uploads
    // When payment receipt upload is done
  }
}
