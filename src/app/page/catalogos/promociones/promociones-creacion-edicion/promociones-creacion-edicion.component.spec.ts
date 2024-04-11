import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PromocionesCreacionEdicionComponent } from './promociones-creacion-edicion.component';

describe('PromocionesCreacionEdicionComponent', () => {
  let component: PromocionesCreacionEdicionComponent;
  let fixture: ComponentFixture<PromocionesCreacionEdicionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PromocionesCreacionEdicionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PromocionesCreacionEdicionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
