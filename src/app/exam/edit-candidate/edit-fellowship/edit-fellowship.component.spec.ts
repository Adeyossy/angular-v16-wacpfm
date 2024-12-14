import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditFellowshipComponent } from './edit-fellowship.component';

describe('EditFellowshipComponent', () => {
  let component: EditFellowshipComponent;
  let fixture: ComponentFixture<EditFellowshipComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EditFellowshipComponent]
    });
    fixture = TestBed.createComponent(EditFellowshipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
