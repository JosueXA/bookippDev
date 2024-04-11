import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TipoExcepcionCreacionEdicionComponent } from './tipo-excepcion-creacion-edicion.component';

describe('TipoExcepcionCreacionEdicionComponent', () => {
    let component: TipoExcepcionCreacionEdicionComponent;
    let fixture: ComponentFixture<TipoExcepcionCreacionEdicionComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [TipoExcepcionCreacionEdicionComponent]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TipoExcepcionCreacionEdicionComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
