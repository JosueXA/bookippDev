import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateFormularioComponent } from './update-formulario.component';

describe('UpdateFormularioComponent', () => {
  let component: UpdateFormularioComponent;
  let fixture: ComponentFixture<UpdateFormularioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdateFormularioComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateFormularioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
