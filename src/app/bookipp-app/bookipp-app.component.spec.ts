import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookippAppComponent } from './bookipp-app.component';

describe('BookippAppComponent', () => {
  let component: BookippAppComponent;
  let fixture: ComponentFixture<BookippAppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BookippAppComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookippAppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
