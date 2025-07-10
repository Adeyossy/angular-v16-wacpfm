import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Event } from 'src/app/models/event';
import { EventService } from 'src/app/services/event.service';

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.css']
})
export class EventsComponent implements OnInit {
  events$: Observable<Event[]> = of([]);

  constructor (private eventService: EventService) {}

  ngOnInit(): void {
    this.events$ = this.eventService.getEvents();
  }
}
