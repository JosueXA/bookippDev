import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FacturaCreacionEdicionComponent } from './factura-creacion-edicion.component';

describe('FacturaCreacionEdicionComponent', () => {
  let component: FacturaCreacionEdicionComponent;
  let fixture: ComponentFixture<FacturaCreacionEdicionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FacturaCreacionEdicionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FacturaCreacionEdicionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
