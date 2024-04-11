import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormularioRespuestasRoutingModule } from './formulario-respuestas-routing.module';
import { FormularioRespuestasComponent } from './formulario-respuestas.component';
import { SharedModule } from 'src/shared/shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { OpcionesRespuestasPipe } from '../core/pipe/opciones-respuestas.pipe';


@NgModule({
  declarations: [
    FormularioRespuestasComponent,
    OpcionesRespuestasPipe
  ],
  imports: [
    CommonModule,
    FormularioRespuestasRoutingModule,
    SharedModule,
    NgSelectModule
  ]
})
export class FormularioRespuestasModule { }
