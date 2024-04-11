import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InformacionFiscalClienteComponent } from './informacion-fiscal-cliente.component';

describe('InformacionFiscalClienteComponent', () => {
  let component: InformacionFiscalClienteComponent;
  let fixture: ComponentFixture<InformacionFiscalClienteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InformacionFiscalClienteComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InformacionFiscalClienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
