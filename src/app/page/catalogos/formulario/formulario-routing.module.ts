import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormularioComponent } from './formulario.component';
import { AuthGuard } from 'src/app/guards/auth.guard';
import { ExitGuard } from 'src/app/guards/exit.guard';

const routes: Routes = [{
  path: '',
  component: FormularioComponent,
  canActivate: [AuthGuard],
  canDeactivate: [ExitGuard],
  data: { state: "listadoFormulario", id_menu: "FORMS001" }
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FormularioRoutingModule { }
