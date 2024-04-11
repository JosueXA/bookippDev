import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TipoExcepcionComponent } from './tipo-excepcion.component';

describe('TipoExcepcionComponent', () => {
    let component: TipoExcepcionComponent;
    let fixture: ComponentFixture<TipoExcepcionComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [TipoExcepcionComponent]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TipoExcepcionComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
