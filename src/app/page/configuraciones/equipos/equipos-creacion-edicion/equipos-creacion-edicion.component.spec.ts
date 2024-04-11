import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EquiposCreacionEdicionComponent } from './equipos-creacion-edicion.component';

describe('EquiposCreacionEdicionComponent', () => {
    let component: EquiposCreacionEdicionComponent;
    let fixture: ComponentFixture<EquiposCreacionEdicionComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [EquiposCreacionEdicionComponent]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(EquiposCreacionEdicionComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
