import { Injectable } from '@angular/core';
import PaystackPop from '@paystack/inline-js';
import { EventService } from './event.service';
import { UpdateCourseService } from './update-course.service';

type Channels = ["card", "bank_transfer", "apple_pay", "ussd", "qr", "mobile_money", "eft"];

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  popup: PaystackPop = new PaystackPop();
  channels: Channels = [
    "card", "bank_transfer", "bank", "apple_pay", "ussd", "qr", "mobile_money", "eft"
  ] as unknown as Channels;

  constructor(private eventService: EventService, private courseService: UpdateCourseService) { }

  getPaymentList (type: string, id: string) {
    if (type === "updatecourse") {
      return this.courseService.getPaymentsList$(id);
    }

    return this.eventService.getPaymentsList$(id);
  }

  getEventPayments() {
    return this.eventService.getAllPayments$("2025-07-07");
  }
}
