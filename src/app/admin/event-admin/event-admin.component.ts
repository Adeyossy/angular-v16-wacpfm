import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { concatMap, Observable, of, timestamp } from 'rxjs';
import { Event, DEFAULT_NEW_EVENT } from 'src/app/models/event';
import { EventService } from 'src/app/services/event.service';

@Component({
  selector: 'app-event-admin',
  templateUrl: './event-admin.component.html',
  styleUrls: ['./event-admin.component.css']
})
export class EventAdminComponent {
  event$: Observable<Event> = of(DEFAULT_NEW_EVENT);

  constructor (private activatedRoute: ActivatedRoute, private eventService: EventService) {}

  ngOnInit () {
    this.event$ = this.eventService.getEventId$(this.activatedRoute.paramMap).pipe(
      concatMap(this.eventService.getEventById$)
    );
  }

  msToDate = (ms: number) => {
    return new Date(ms).toLocaleDateString("en-NG").split("/").reverse().join("-");
  }
}
