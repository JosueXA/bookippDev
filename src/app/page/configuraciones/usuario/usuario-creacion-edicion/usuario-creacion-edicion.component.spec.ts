import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsuarioCreacionEdicionComponent } from './usuario-creacion-edicion.component';

describe('UsuarioCreacionEdicionComponent', () => {
    let component: UsuarioCreacionEdicionComponent;
    let fixture: ComponentFixture<UsuarioCreacionEdicionComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [UsuarioCreacionEdicionComponent]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(UsuarioCreacionEdicionComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
