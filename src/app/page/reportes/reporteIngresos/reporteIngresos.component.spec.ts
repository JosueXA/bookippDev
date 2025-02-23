import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReporteIngresosComponent } from './reporteIngresos.component';

describe('ReporteIngresosComponent', () => {
    let component: ReporteIngresosComponent;
    let fixture: ComponentFixture<ReporteIngresosComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ReporteIngresosComponent]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ReporteIngresosComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
