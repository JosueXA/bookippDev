import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportarClientesComponent } from './importar-clientes.component';

describe('ImportarClientesComponent', () => {
  let component: ImportarClientesComponent;
  let fixture: ComponentFixture<ImportarClientesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImportarClientesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImportarClientesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
