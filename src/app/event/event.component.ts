import { Component, OnInit } from '@angular/core';
import { EventService } from '../services/event.service';
import { concatMap, Observable, of } from 'rxjs';
import { DEFAULT_NEW_EVENT, Event } from '../models/event';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-event',
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.css']
})
export class EventComponent implements OnInit {
  event$: Observable<Event> = of(DEFAULT_NEW_EVENT);
  
  constructor (private eventService: EventService, private activatedRoute: ActivatedRoute) {}

  ngOnInit() {
    this.event$ = this.eventService.getEventId$(this.activatedRoute.paramMap).pipe(
      concatMap(this.eventService.getEventById$)
    );
  }
}
