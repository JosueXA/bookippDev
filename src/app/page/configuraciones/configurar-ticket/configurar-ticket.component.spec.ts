import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigurarTicketComponent } from './configurar-ticket.component';

describe('ConfigurarTicketComponent', () => {
  let component: ConfigurarTicketComponent;
  let fixture: ComponentFixture<ConfigurarTicketComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfigurarTicketComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfigurarTicketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
