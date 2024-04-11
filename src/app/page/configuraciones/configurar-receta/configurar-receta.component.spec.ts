import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigurarRecetaComponent } from './configurar-receta.component';

describe('ConfigurarRecetaComponent', () => {
  let component: ConfigurarRecetaComponent;
  let fixture: ComponentFixture<ConfigurarRecetaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfigurarRecetaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfigurarRecetaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
