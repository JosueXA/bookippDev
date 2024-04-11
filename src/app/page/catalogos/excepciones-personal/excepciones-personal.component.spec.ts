import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Excepciones_PersonalComponent } from './excepciones-personal.component';

describe('Excepciones_PersonalComponent', () => {
    let component: Excepciones_PersonalComponent;
    let fixture: ComponentFixture<Excepciones_PersonalComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [Excepciones_PersonalComponent]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(Excepciones_PersonalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
