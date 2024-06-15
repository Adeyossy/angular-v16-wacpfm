import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResourcePersonComponent } from './resource-person.component';

describe('ResourcePersonComponent', () => {
  let component: ResourcePersonComponent;
  let fixture: ComponentFixture<ResourcePersonComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ResourcePersonComponent]
    });
    fixture = TestBed.createComponent(ResourcePersonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
