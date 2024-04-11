import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CambioTipoCreacionEdicionComponent } from './cambio-tipo-creacion-edicion.component';

describe('CambioTipoCreacionEdicionComponent', () => {
    let component: CambioTipoCreacionEdicionComponent;
    let fixture: ComponentFixture<CambioTipoCreacionEdicionComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CambioTipoCreacionEdicionComponent]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CambioTipoCreacionEdicionComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
