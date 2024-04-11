import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecepcionProductoCreacionEdicionComponent } from './recepcion-producto-creacion-edicion.component';

describe('RecepcionProductoCreacionEdicionComponent', () => {
    let component: RecepcionProductoCreacionEdicionComponent;
    let fixture: ComponentFixture<RecepcionProductoCreacionEdicionComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [RecepcionProductoCreacionEdicionComponent]
        })
            .compileComponents();

        fixture = TestBed.createComponent(RecepcionProductoCreacionEdicionComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
