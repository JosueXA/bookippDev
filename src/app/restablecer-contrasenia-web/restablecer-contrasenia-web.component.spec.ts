import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RestablecerContraseniaWebComponent } from './restablecer-contrasenia-web.component';

describe('RestablecerContraseniaWebComponent', () => {
  let component: RestablecerContraseniaWebComponent;
  let fixture: ComponentFixture<RestablecerContraseniaWebComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RestablecerContraseniaWebComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RestablecerContraseniaWebComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
