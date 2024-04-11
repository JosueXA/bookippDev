import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigurarRecetaElectronicaComponent } from './configurar-receta-electronica.component';

describe('ConfigurarRecetaElectronicaComponent', () => {
  let component: ConfigurarRecetaElectronicaComponent;
  let fixture: ComponentFixture<ConfigurarRecetaElectronicaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfigurarRecetaElectronicaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfigurarRecetaElectronicaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
