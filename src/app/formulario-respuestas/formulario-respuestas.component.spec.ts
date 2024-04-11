import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormularioRespuestasComponent } from './formulario-respuestas.component';

describe('FormularioRespuestasComponent', () => {
  let component: FormularioRespuestasComponent;
  let fixture: ComponentFixture<FormularioRespuestasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormularioRespuestasComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormularioRespuestasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
