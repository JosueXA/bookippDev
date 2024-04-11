import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/shared/shared.module';
import { InventarioComponent } from './inventario.component';
import { InventarioRoutingModule } from './inventario.routing';

@NgModule({
    declarations: [InventarioComponent],
    imports: [CommonModule, SharedModule, InventarioRoutingModule],
})
export class InventarioModule { }
