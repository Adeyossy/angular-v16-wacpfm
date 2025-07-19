import { Injectable } from '@angular/core';
import { User } from 'firebase/auth';
import { catchError, concatMap, map, Observable, of } from 'rxjs';
import { AuthService } from './auth.service';
import { ParamMap } from '@angular/router';
import { arrayUnion, Timestamp, where } from 'firebase/firestore';
import { Event, DEFAULT_NEW_EVENT, EVENTS_COLLECTION } from '../models/event';
import { AppUser } from '../models/user';
import { DEFAULT_NEW_EVENT_RECORD, EVENT_RECORDS_COLLECTION, EventRecord } from '../models/event_record';
import { HelperService } from './helper.service';
import { CacheService } from './cache.service';
import { CardList } from '../widgets/card-list/card-list.component';
import { DEFAULT_NEW_TRANSACTION_RESPONSE, PaystackTransaction, Transaction } from '../models/payment';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EventService extends CacheService {

  getEvents() {
    return this.authService.getCollection$<Event>(EVENTS_COLLECTION);
  }

  getEventId$(paramMap: Observable<ParamMap>) {
    return paramMap.pipe(
      map(params => {
        const p = params.get("workshop");
        return p ? p : ""
      })
    );
  }

  getEventById$(id: string): Observable<Event> {
    return this.authService.getDocById$<Event>(EVENTS_COLLECTION, id).pipe(
      map(w => w !== null ? w : JSON.parse(JSON.stringify(DEFAULT_NEW_EVENT)))
    );
  }

  getPayments$(eventId: string) {
    return this.queryItem$<EventRecord>(EVENT_RECORDS_COLLECTION, [
      where("eventId", "==", eventId)
    ]);
  }

  getPaymentsList$(id: string): Observable<CardList[]> {
    return this.getPayments$(id).pipe(
      map(records => records.map(r => {
        const t = r.dateOfRegistration as unknown as Timestamp;
        return {
          title: r.email,
          subtitle: `${r.firstname} ${r.lastname}`,
          text: `${new Date(Math.round(t.seconds * 1000)).toLocaleDateString("en-NG")}`
        }
      }))
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
          id: this.computeEventRecordId(user.email, eventId),
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

  verifyTransaction$ = (transaction: PaystackTransaction | Transaction, eventId: string) => {
    // console.log("transaction in verifyTransaction => ", transaction);
    // console.log("transaction reference in verifyTransaction => ", transaction.reference);
    return this.authService.verifyTransaction({
      reference: transaction.reference,
      secret_key: environment.secret_key
    }).pipe(
      concatMap(response => {
        // console.log("response => ", response);
        return this.authService.fetchEventPayment$().pipe(
          concatMap(config => this.getUser$().pipe(
            map(user => Object.assign({ email: user.email! }, config))
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

              const approve$ = this.createEventRecord(eventId).pipe(
                map(eventRecord => Object.assign(eventRecord, data) as EventRecord),
                concatMap(eventRecord => this.approveEventRecord$(eventRecord))
              );

              return approve$;
            } else {
              const decline$ = this.createEventRecord(eventId).pipe(
                concatMap(eventRecord => this.declineEventRecord$(eventRecord))
              );
              // console.log("Created declined records =>", val);
              return decline$;
            }
          }),
          catchError(err => {
            // console.log("Caught error => ", err);
            // this.verifyAgain$ = null;
            return of("Verification Failed");
          })
        )
      })
    )
  }

  verifyPayment$ = (eventRegOpenDate: string) => {
    return this.getUser$().pipe(
      concatMap(user => this.authService.getPaystackCustomer({
        email: user.email!, secret_key: environment.secret_key
      })),
      concatMap(customerResponse => {
        if (customerResponse.data) {
          return this.authService.getTransaction({
            secret_key: environment.secret_key,
            params: {
              customer: customerResponse.data ? customerResponse.data.id : 0,
              from: eventRegOpenDate,
              status: "success"
            }
          })
        } else return of(DEFAULT_NEW_TRANSACTION_RESPONSE);
      }),
      map(transResponse => {
        if (transResponse.data && transResponse.data.length) {
          return transResponse.data;
        }
        return [];
      })
    );
  }

  getAllPayments$ = (date: string) => {
    return this.authService.getTransaction({
      secret_key: environment.secret_key,
      params: {
        from: date,
        status: "success"
      }
    }).pipe(
      map(res => {
        if (res.data && res.data.length) {
          return res.data;
        }
        return [];
      })
    )
  }

  computeEventRecordId(email: string, workshopId: string) {
    return `${email}-${workshopId}`;
  }

  getEventRecordById$(id: string): Observable<EventRecord> {
    return this.authService.getDocById$<EventRecord>(EVENT_RECORDS_COLLECTION, id).pipe(
      map(w => {
        if (w !== null) return w;
        const record: EventRecord = JSON.parse(JSON.stringify(DEFAULT_NEW_EVENT_RECORD));
        const [email, eventId] = id.split("-");
        record.id = id;
        record.email = email;
        record.eventId = eventId;
        return record;
      })
    );
  }

  approveEventRecord$(eventRecord: EventRecord) {
    return this.authService.batchWriteDocs$(
      [
        {
          path: `${EVENT_RECORDS_COLLECTION}/${eventRecord.id}`,
          data: eventRecord,
          type: 'set'
        },
        {
          path: `${EVENTS_COLLECTION}/${eventRecord.eventId}`,
          data: {
            registered_participants: arrayUnion(eventRecord.email),
            paid_participants: arrayUnion(eventRecord.email)
          },
          type: 'update'
        }
      ]
    )
  }

  declineEventRecord$(eventRecord: EventRecord) {
    return this.authService.batchWriteDocs$(
      [
        {
          path: `${EVENT_RECORDS_COLLECTION}/${eventRecord.id}`,
          data: eventRecord,
          type: 'set'
        },
        {
          path: `${EVENTS_COLLECTION}/${eventRecord.eventId}`,
          data: {
            registered_participants: arrayUnion(eventRecord.email)
          },
          type: 'update'
        }
      ]
    )
  }

  getUser$(): Observable<User> {
    return this.authService.getFirebaseUser$();
  }

  getUserEventRecord$(eventId: string): Observable<EventRecord> {
    return this.getUser$().pipe(
      map(user => this.computeEventRecordId(user.email!, eventId)),
      concatMap(id => this.getEventRecordById$(id))
    );
  }
}
