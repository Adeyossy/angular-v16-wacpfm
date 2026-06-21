import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaystackPaymentViewerComponent } from './paystack-payment-viewer.component';

describe('PaystackPaymentViewerComponent', () => {
  let component: PaystackPaymentViewerComponent;
  let fixture: ComponentFixture<PaystackPaymentViewerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PaystackPaymentViewerComponent]
    });
    fixture = TestBed.createComponent(PaystackPaymentViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
