import { Injectable } from '@angular/core';
import PaystackPop from '@paystack/inline-js';
import { EventService } from './event.service';
import { UpdateCourseService } from './update-course.service';
import { TransactionParamsWithSK, TransactionResponse } from '../models/payment';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';

type Channels = ["card", "bank_transfer", "apple_pay", "ussd", "qr", "mobile_money", "eft"];

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  popup: PaystackPop = new PaystackPop();
  channels: Channels = [
    "card", "bank_transfer", "bank", "apple_pay", "ussd", "qr", "mobile_money", "eft"
  ] as unknown as Channels;
  backendUrl = "/.netlify/functions";

  constructor(
    private eventService: EventService, 
    private courseService: UpdateCourseService,
    private httpClient: HttpClient
  ) { }

  getTransaction(options: TransactionParamsWithSK) {
    return this.httpClient.post<string>(
      `${this.backendUrl}/get-transaction`, options
    );
  }

  getPaymentList(type: string, id: string) {
    if (type === "updatecourse") {
      return this.courseService.getPaymentsList$(id);
    }

    return this.eventService.getPaymentsList$(id);
  }

  getEventPayments() {
    return this.eventService.getAllPayments$("2025-07-07");
  }

  getAllPayments$ = (date: string) => {
    return this.getTransaction({
      secret_key: "PAYSTACK_LIVE_SK",
      params: {
        from: date,
        status: "success",
        perPage: 500
      }
    }).pipe(
      map(res => {
        const response = JSON.parse(res) as unknown as TransactionResponse;
        if (response.data && response.data.length) {
          return response.data;
        }
        return [];
      })
    )
  }
}
