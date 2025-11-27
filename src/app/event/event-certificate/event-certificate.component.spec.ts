import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventCertificateComponent } from './event-certificate.component';

describe('EventCertificateComponent', () => {
  let component: EventCertificateComponent;
  let fixture: ComponentFixture<EventCertificateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EventCertificateComponent]
    });
    fixture = TestBed.createComponent(EventCertificateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
