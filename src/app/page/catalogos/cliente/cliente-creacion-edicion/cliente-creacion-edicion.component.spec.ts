import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClienteCreacionEdicionComponent } from './cliente-creacion-edicion.component';

describe('ClienteCreacionEdicionComponent', () => {
    let component: ClienteCreacionEdicionComponent;
    let fixture: ComponentFixture<ClienteCreacionEdicionComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ClienteCreacionEdicionComponent]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ClienteCreacionEdicionComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
