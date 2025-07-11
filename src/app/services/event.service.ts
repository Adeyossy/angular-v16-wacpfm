import { Injectable } from '@angular/core';
import { User } from 'firebase/auth';
import { concatMap, map, Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { ParamMap } from '@angular/router';
import { arrayUnion } from 'firebase/firestore';
import { Event, DEFAULT_NEW_EVENT, EVENTS_COLLECTION } from '../models/event';
import { AppUser } from '../models/user';
import { DEFAULT_NEW_EVENT_RECORD, EVENT_RECORDS_COLLECTION, EventRecord } from '../models/event_record';

@Injectable({
  providedIn: 'root'
})
export class EventService {

  constructor(private authService: AuthService) { }

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
