import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditCandidateComponent } from './edit-candidate.component';

describe('EditCandidateComponent', () => {
  let component: EditCandidateComponent;
  let fixture: ComponentFixture<EditCandidateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EditCandidateComponent]
    });
    fixture = TestBed.createComponent(EditCandidateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
