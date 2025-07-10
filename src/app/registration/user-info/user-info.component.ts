import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { concatMap, map, Observable, of } from 'rxjs';
import { DEFAULT_NEW_EVENT_RECORD, EventRecord } from 'src/app/models/event_record';
import { EventService } from 'src/app/services/event.service';
import { RegistrationComponent } from '../registration.component';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-user-info',
  templateUrl: './user-info.component.html',
  styleUrls: ['./user-info.component.css']
})
export class UserInfoComponent extends RegistrationComponent implements OnInit {
  eventRecord$: Observable<EventRecord> = of(DEFAULT_NEW_EVENT_RECORD);

  constructor(private eventService: EventService) {
    super(inject(AuthService), inject(Router), inject(ActivatedRoute))
  }

  override ngOnInit(): void {
    this.eventRecord$ = this.activatedRoute.paramMap.pipe(
      concatMap(paramMap => {
        const eventId = paramMap.get("eventId");
        return eventId ? this.eventService.getUserEventRecord$(eventId) : of(DEFAULT_NEW_EVENT_RECORD);
      })
    )
  }
}
