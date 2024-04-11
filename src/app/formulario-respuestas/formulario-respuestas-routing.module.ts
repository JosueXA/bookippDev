import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormularioRespuestasComponent } from './formulario-respuestas.component';

const routes: Routes = [
  {
    path:'',
    component:FormularioRespuestasComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FormularioRespuestasRoutingModule { }
