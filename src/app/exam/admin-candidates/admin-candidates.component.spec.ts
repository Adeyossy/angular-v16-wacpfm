import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminCandidatesComponent } from './admin-candidates.component';

describe('AdminCandidatesComponent', () => {
  let component: AdminCandidatesComponent;
  let fixture: ComponentFixture<AdminCandidatesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdminCandidatesComponent]
    });
    fixture = TestBed.createComponent(AdminCandidatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
