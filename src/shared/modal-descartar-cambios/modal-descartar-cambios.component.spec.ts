import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalDescartarCambiosComponent } from './modal-descartar-cambios.component';

describe('ModalDescartarCambiosComponent', () => {
    let component: ModalDescartarCambiosComponent;
    let fixture: ComponentFixture<ModalDescartarCambiosComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ModalDescartarCambiosComponent]
        })
            .compileComponents();

        fixture = TestBed.createComponent(ModalDescartarCambiosComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
