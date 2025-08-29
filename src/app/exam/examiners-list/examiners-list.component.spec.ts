import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExaminersListComponent } from './examiners-list.component';

describe('ExaminersListComponent', () => {
  let component: ExaminersListComponent;
  let fixture: ComponentFixture<ExaminersListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ExaminersListComponent]
    });
    fixture = TestBed.createComponent(ExaminersListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
