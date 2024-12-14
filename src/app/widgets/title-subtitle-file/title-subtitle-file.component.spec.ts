import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TitleSubtitleFileComponent } from './title-subtitle-file.component';

describe('TitleSubtitleFileComponent', () => {
  let component: TitleSubtitleFileComponent;
  let fixture: ComponentFixture<TitleSubtitleFileComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TitleSubtitleFileComponent]
    });
    fixture = TestBed.createComponent(TitleSubtitleFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
