import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from 'src/shared/shared.module';
import { UpdateFormularioComponent } from './update-formulario.component';
import { UpdateFormularioRoutingModule } from './update-formulario.routing';

@NgModule({
	declarations: [
		UpdateFormularioComponent,
	],
	imports: [CommonModule, UpdateFormularioRoutingModule, SharedModule]
})
export class UpdateFormularioModule { }
