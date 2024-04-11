import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductoCreacionEdicionComponent } from './producto-creacion-edicion.component';

describe('ProductoCreacionEdicionComponent', () => {
    let component: ProductoCreacionEdicionComponent;
    let fixture: ComponentFixture<ProductoCreacionEdicionComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ProductoCreacionEdicionComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ProductoCreacionEdicionComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
