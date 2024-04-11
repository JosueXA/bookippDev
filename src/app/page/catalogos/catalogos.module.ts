import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from 'src/shared/shared.module';
import { CatalogosRoutingModule } from './catalogos.routing';
import { CatalogosComponent } from './catalogos.component';

@NgModule({
	declarations: [
		CatalogosComponent,
	],
	imports: [CommonModule, CatalogosRoutingModule, SharedModule]
})
export class CatalogosModule { }
