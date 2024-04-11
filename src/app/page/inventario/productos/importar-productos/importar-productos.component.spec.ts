import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportarProductosComponent } from './importar-productos.component';

describe('ImportarProductosComponent', () => {
  let component: ImportarProductosComponent;
  let fixture: ComponentFixture<ImportarProductosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImportarProductosComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImportarProductosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
