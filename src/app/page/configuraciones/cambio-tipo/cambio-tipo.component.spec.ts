import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CambioTipoComponent } from './cambio-tipo.component';

describe('CambioTipoComponent', () => {
    let component: CambioTipoComponent;
    let fixture: ComponentFixture<CambioTipoComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CambioTipoComponent]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CambioTipoComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
