import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReporteProductividadComponent } from './reporteProductividad.component';

describe('ReporteProductividadComponent', () => {
    let component: ReporteProductividadComponent;
    let fixture: ComponentFixture<ReporteProductividadComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ReporteProductividadComponent]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ReporteProductividadComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
