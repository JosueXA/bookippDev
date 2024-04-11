import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidarCorreoWebComponent } from './validar-correo-web.component';

describe('RegistrarEmpresaComponent', () => {
    let component: ValidarCorreoWebComponent;
    let fixture: ComponentFixture<ValidarCorreoWebComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ValidarCorreoWebComponent]
        })
            .compileComponents();

        fixture = TestBed.createComponent(ValidarCorreoWebComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
