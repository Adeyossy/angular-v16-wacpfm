import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { User } from 'firebase/auth';
import { concatMap, map, Observable, of } from 'rxjs';
import { DEFAULT_NEW_EVENT, Event } from 'src/app/models/event';
import { Lecture } from 'src/app/models/update_course';
import { EventService } from 'src/app/services/event.service';
import { HelperService } from 'src/app/services/helper.service';

@Component({
  selector: 'app-event-details',
  templateUrl: './event-details.component.html',
  styleUrls: ['./event-details.component.css']
})
export class EventDetailsComponent {
  today = Date.now();
  event$: Observable<Event> = of(JSON.parse(JSON.stringify(DEFAULT_NEW_EVENT)));
  eventLectures$: Observable<Lecture[]> = of([]);
  declare user$: Observable<User>;

  constructor(public eventService: EventService, private activatedRoute: ActivatedRoute,
    public helper: HelperService) {
    this.user$ = eventService.getUser$();
  }

  ngOnInit(): void {
    this.event$ = this.activatedRoute.paramMap.pipe(
      map(paramMap => {
        const p = paramMap.get("eventId");
        return p ? p : ""
      }),
      concatMap(id => {
        this.eventLectures$ = this.eventService.getLecturesByEvent(id);
        return this.eventService.getEventById$(id);
      })
    );
  }

  parseMillisToDate = (millis: number) => {
    return Intl.DateTimeFormat("en-NG").format(millis);
  }

  parseCourseDuration = (ms: number) => {
    const seconds = ms / 1000;
    const minute = 60;
    const hour = 60 * minute;
    const day = 24 * hour;
    const week = 7 * day;
    const month = 4 * week;
    const year = 12 * month;

    if (seconds >= month) return `${Math.round(seconds / month)} months`;
    if (seconds >= week && seconds < month) return `${Math.round(seconds / week)} weeks`;
    if (seconds >= day && seconds < week) return `${Math.round(seconds / day)} days`;
    if (seconds >= hour && seconds < day) return `${Math.round(seconds / hour)} hours`;
    if (seconds >= minute && seconds < hour) return `${Math.round(seconds / minute)} minutes`;
    return `${seconds} seconds`;
  }
  
  isRegistered$(event: Event) {
    return this.user$.pipe(
      map(user => event.registered_participants.includes(user.email!))
    );
  }

  hasPaid$(event: Event) {
    return this.user$.pipe(
      map(user => event.paid_participants.includes(user.email!))
    );
  }
}
