import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import PaystackPop from '@paystack/inline-js';
import { catchError, concatMap, map, Observable, of } from 'rxjs';
import { EventRecord } from 'src/app/models/event_record';
import { PaystackTransaction, Transaction } from 'src/app/models/payment';
import { AuthService } from 'src/app/services/auth.service';
import { EventService } from 'src/app/services/event.service';
import { HelperService } from 'src/app/services/helper.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-event-payment',
  templateUrl: './event-payment.component.html',
  styleUrls: ['./event-payment.component.css']
})
export class EventPaymentComponent implements OnInit {
  popup = new PaystackPop();
  pay$: Observable<string> | null = null;
  declare transaction: PaystackTransaction; // stored reference during automatic verification
  paymentStatus$: Observable<string> | null = null;

  constructor(private activatedRoute: ActivatedRoute, private eventService: EventService,
    private authService: AuthService, private helper: HelperService, private router: Router) { }

  ngOnInit(): void {
    this.paymentStatus$ = this.getEventId$().pipe(
      concatMap(eventId => this.eventService.getEventById$(eventId)),
      map(event => new Date(event.registration_opens).toISOString().slice(0, 10)),
      concatMap(date => this.eventService.verifyPayment$(date)),
      concatMap(transactions => {
        if (transactions.length > 0) {
          return this.verifyTransaction$(transactions[0], this.showSuccessDialog)
        } else return of("empty");
      })
    )
  }

  verifyTransaction$ = (transaction: PaystackTransaction | Transaction, callback: () => boolean) => {
    // console.log("transaction in verifyTransaction => ", transaction);
    // console.log("transaction reference in verifyTransaction => ", transaction.reference);
    return this.authService.verifyTransaction({
      reference: transaction.reference,
      secret_key: environment.secret_key
    }).pipe(
      concatMap(response => {
        // console.log("response => ", response);
        return this.authService.fetchEventPayment$().pipe(
          concatMap(config => this.eventService.getUser$().pipe(
            map(user => Object.assign({email: user.email!}, config))
          )),
          concatMap(params => {
            if (response && response.data && response.data.status === "success" &&
              response.data.amount === params.payment.amount
              && response.data.customer && response.data.customer.email.trim() ===
              params.email?.trim()) {
              const data = {
                amountPaid: params.payment.fee,
                transaction,
                approved: response.data.customer.email.trim() === params.email?.trim(),
                paymentData: response
              };
              
              const approve$ = this.getEventId$().pipe(
                concatMap(this.createEventRecord),
                map(eventRecord => Object.assign(eventRecord, data) as EventRecord),
                concatMap(eventRecord => this.eventService.approveEventRecord$(eventRecord))
              );

              return approve$;
            } else {
              const decline$ = this.getEventId$().pipe(
                concatMap(this.createEventRecord),
                concatMap(eventRecord => this.eventService.declineEventRecord$(eventRecord))
              );
              // console.log("Created declined records =>", val);
              return decline$;
            }
          }),
          map(callback),
          concatMap(_val => {
            this.helper.resetDialog();
            return this.router.navigate(["../.."], { relativeTo: this.activatedRoute })
          }),
          map(state => state ? "Successful" : "Verification Failed"),
          catchError(err => {
            // console.log("Caught error => ", err);
            this.showErrorDialog();
            this.pay$ = null;
            // this.verifyAgain$ = null;
            return of("Verification Failed");
          })
        )
      })
    )
  }

  showVerifyErrorDialog = () => {
    this.helper.setDialog({
      title: "Error",
      message: "An error occurred while verifying your payment.",
      buttonText: "Verify Again"
    });
    this.helper.toggleDialog(0);
  }

  showCancelDialog = () => {
    this.helper.setDialog({
      title: "Cancelled!",
      message: `You have cancelled this payment. Kindly wait a few minutes before trying again.`,
      buttonText: "Dismiss"
    });
    this.helper.toggleDialog(0);
    return true;
  }

  cancel = () => {
    // console.log("Cancelled");
    this.showCancelDialog();
    this.pay$ = null;
  }

  showErrorDialog = (message = "") => {
    this.helper.setDialog({
      title: "Error!",
      message: message ? message : `It seems an error occurred while making your payment. 
      Kindly wait a few minutes before trying again.`,
      buttonText: "Try again"
    });
    this.helper.toggleDialog(0);
    return true
  }

  error = (error: { type: string, message: string }) => {
    // console.log("An error occurred");
    // console.log("Error type =>", error.type);
    // console.log("Error message =>", error.message);
    this.showErrorDialog(error.message);
    this.pay$ = null;
  }

  showSuccessDialog = () => {
    this.helper.setDialog({
      title: "Payment Successful",
      message: "Your payment was successful. You should now have access to the course.",
      buttonText: "Continue"
    });
    this.helper.toggleDialog(0);
    return true
  }

  showProcessingDialog = () => {
    this.helper.setDialog({
      title: "Payment Processing",
      message: "Please wait while your payment is being processed!",
      buttonText: "DO NOT CLOSE"
    });
    this.helper.toggleDialog(0);
    return true
  }

  onSuccess = (transaction: PaystackTransaction) => {
    // console.log("onSuccess called");
    // console.log("transaction in onSuccess =>", transaction);
    this.showProcessingDialog();
    this.transaction = transaction;
    this.pay$ = this.verifyTransaction$(
      transaction,
      this.showSuccessDialog
    );
  }

  getEventId$ = () => {
    return this.activatedRoute.paramMap.pipe(
      map(paramMap => {
        const eventId = paramMap.get("eventId");
        return eventId ? eventId : "";
      })
    );
  }

  createEventRecord = (eventId: string) => {
    return this.authService.getAppUser$().pipe(
      map(user => {
        const eventRecord: EventRecord = {
          amountPaid: -1,
          college: user.college,
          country: user.country,
          dateOfRegistration: user.dateOfRegistration,
          designation: user.designation,
          email: user.email,
          eventId,
          firstname: user.firstname,
          gender: user.gender,
          id: this.eventService.computeEventRecordId(user.email, eventId),
          lastname: user.lastname,
          middlename: user.middlename,
          paymentData: null,
          phoneNumber: user.phoneNumber,
          practicePlace: user.practicePlace,
          transaction: null,
          userId: user.userId,
          whatsapp: user.whatsapp,
          zip: user.zip
        };
        return eventRecord;
      })
    )
  }

  pay() {
    // this.popup = new PaystackPop();
    this.pay$ = this.getEventId$().pipe(
      concatMap(eventId => this.eventService.getUser$().pipe(
        map(user => {
          return {
            email: user.email!,
            name: user.displayName ? user.displayName : "",
            eventId
          }
        })
      )),
      concatMap(record => this.authService.fetchEventPayment$().pipe(
        map(config => {
          console.log("Payment started");
          type Channels = ["card", "bank_transfer", "apple_pay", "ussd", "qr", "mobile_money", "eft"];
          const channels: Channels = [
            "card", "bank_transfer", "bank", "apple_pay", "ussd", "qr", "mobile_money", "eft"
          ] as unknown as Channels;
          const newPopup = this.popup.newTransaction({
            key: config[environment.public_key as 'test_pk' | 'live_pk'],
            channels,
            amount: config.payment.amount,
            email: record.email,
            metadata: {
              custom_fields: [
                {
                  display_name: "Name",
                  variable_name: "name",
                  value: record.name
                },
                {
                  display_name: "Fee",
                  variable_name: "fee",
                  value: config.payment.fee
                },
                {
                  display_name: "Event ID",
                  variable_name: "event_id",
                  value: record.eventId
                }
              ]
            },
            onSuccess: this.onSuccess,
            onError: this.error,
            onCancel: this.cancel
          });
          // console.log("getStatus response =>", newPopup.getStatus);

        })
      )),
      map(_void => "Payment in progress")
    )
  }
}
