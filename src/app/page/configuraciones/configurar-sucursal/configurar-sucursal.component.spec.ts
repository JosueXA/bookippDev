import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigurarSucursalComponent } from './configurar-sucursal.component';

describe('ConfigurarSucursalComponent', () => {
    let component: ConfigurarSucursalComponent;
    let fixture: ComponentFixture<ConfigurarSucursalComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ConfigurarSucursalComponent]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ConfigurarSucursalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
