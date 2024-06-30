import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResourcePersonsDashComponent } from './resource-persons-dash.component';

describe('ResourcePersonsDashComponent', () => {
  let component: ResourcePersonsDashComponent;
  let fixture: ComponentFixture<ResourcePersonsDashComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ResourcePersonsDashComponent]
    });
    fixture = TestBed.createComponent(ResourcePersonsDashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
