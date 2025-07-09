import { Injectable } from '@angular/core';
import PaystackPop from '@paystack/inline-js';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';
import { concatMap, map } from 'rxjs';
import { NewTransactionOptions } from '../models/payment';

type Channels = ["card", "bank_transfer", "apple_pay", "ussd", "qr", "mobile_money", "eft"];

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  popup: PaystackPop = new PaystackPop();
  channels: Channels = [
    "card", "bank_transfer", "bank", "apple_pay", "ussd", "qr", "mobile_money", "eft"
  ] as unknown as Channels;

  constructor(private authService: AuthService) { }

  pay(options: NewTransactionOptions) {
    return this.authService.fetchPaystackConfig$().pipe(
      map(config => this.popup.newTransaction(options))
    );
  }
}
