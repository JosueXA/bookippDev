import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from 'src/shared/shared.module';
import { FacturacionRoutingModule } from './facturacion.routing';
import { FacturacionComponent } from './facturacion.component';

@NgModule({
    declarations: [
        FacturacionComponent,
    ],
    imports: [CommonModule, FacturacionRoutingModule, SharedModule]
})
export class FacturacionModule { }
