import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReporteCitasComponent } from './reporteCitas.component';

describe('ReporteCitasComponent', () => {
    let component: ReporteCitasComponent;
    let fixture: ComponentFixture<ReporteCitasComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ReporteCitasComponent]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ReporteCitasComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
