import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from 'src/shared/shared.module';
import { ReportesRoutingModule } from './reportes.routing';
import { ReportesComponent } from './reportes.component';

@NgModule({
    declarations: [
        ReportesComponent,
    ],
    imports: [CommonModule, ReportesRoutingModule, SharedModule]
})
export class ReportesModule {}
