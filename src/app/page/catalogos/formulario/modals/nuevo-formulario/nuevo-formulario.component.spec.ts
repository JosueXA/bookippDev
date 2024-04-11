import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NuevoFormularioComponent } from './nuevo-formulario.component';

describe('NuevoFormularioComponent', () => {
  let component: NuevoFormularioComponent;
  let fixture: ComponentFixture<NuevoFormularioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NuevoFormularioComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NuevoFormularioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
