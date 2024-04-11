import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecepcionProductoComponent } from './recepcion-producto.component';

describe('RecepcionProductoComponent', () => {
  let component: RecepcionProductoComponent;
  let fixture: ComponentFixture<RecepcionProductoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RecepcionProductoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RecepcionProductoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
