import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComponentOverlayComponent } from './component-overlay.component';

describe('ComponentOverlayComponent', () => {
  let component: ComponentOverlayComponent;
  let fixture: ComponentFixture<ComponentOverlayComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ComponentOverlayComponent]
    });
    fixture = TestBed.createComponent(ComponentOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
