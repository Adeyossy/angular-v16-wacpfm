import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CasebookComponent } from './casebook.component';

describe('CasebookComponent', () => {
  let component: CasebookComponent;
  let fixture: ComponentFixture<CasebookComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CasebookComponent]
    });
    fixture = TestBed.createComponent(CasebookComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
