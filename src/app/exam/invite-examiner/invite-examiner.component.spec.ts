import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InviteExaminerComponent } from './invite-examiner.component';

describe('InviteExaminerComponent', () => {
  let component: InviteExaminerComponent;
  let fixture: ComponentFixture<InviteExaminerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InviteExaminerComponent]
    });
    fixture = TestBed.createComponent(InviteExaminerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
