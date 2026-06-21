import { Injectable } from '@angular/core';
import PaystackPop from '@paystack/inline-js';
import { EventService } from './event.service';
import { UpdateCourseService } from './update-course.service';
import { Transaction, TransactionParamsWithSK, TransactionResponse } from '../models/payment';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { environment } from 'src/environments/environment';

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

  getRecords$ = (type: string, id: string, email: string) => {
    if (type === "updatecourse") {
      return this.courseService.getRecords$(id, email)
    }

    return this.eventService.getRecords$(id, email);
  }

  parseTrxMetadata = (transaction: Transaction) => {
    return this.courseService.parseTrxMetadata(transaction);
  }

  getPaymentList(type: string, id: string) {
    if (type === "updatecourse") {
      return this.courseService.getPaymentsList$(id);
    }

    return this.eventService.getPaymentsList$(id);
  }

  getCategory$ = (category: string, id: string) => {
    if (category === "updatecourse") {
      return this.courseService.getUpdateCourse$(id);
    }

    return this.eventService.getEventById$(id);
  }

  getCourse$ = (id: string) => {
    return this.courseService.getUpdateCourse$(id);
  }

  getEventPayments() {
    return this.eventService.getAllPayments$("2025-07-07");
  }

  getSuccessfulPayments$ = (from: string, to: string) => {
    return this.getTransaction({
      secret_key: environment.secret_key,
      params: {
        from,
        status: "success",
        perPage: 500,
        to
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
