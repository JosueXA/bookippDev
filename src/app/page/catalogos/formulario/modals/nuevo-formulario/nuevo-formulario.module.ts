import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from 'src/shared/shared.module';
import { NuevoFormularioComponent } from './nuevo-formulario.component';
import { NuevoFormularioRoutingModule } from './nuevo-formulario.routing';

@NgModule({
	declarations: [
    NuevoFormularioComponent
	],
	imports: [CommonModule, NuevoFormularioRoutingModule, SharedModule]
})
export class NuevoFormularioModule { }
