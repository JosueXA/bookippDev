import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExcepcionesPersonalCreacionEdicionComponent } from './excepcionesPersonal-creacion-edicion.component';

describe('ExcepcionesPersonalCreacionEdicionComponent', () => {
    let component: ExcepcionesPersonalCreacionEdicionComponent;
    let fixture: ComponentFixture<ExcepcionesPersonalCreacionEdicionComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ExcepcionesPersonalCreacionEdicionComponent]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ExcepcionesPersonalCreacionEdicionComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
