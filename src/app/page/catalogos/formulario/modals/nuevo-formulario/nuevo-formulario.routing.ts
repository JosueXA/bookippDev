import { RouterModule, Routes } from "@angular/router";
import { NgModule } from "@angular/core";
import { NuevoFormularioComponent } from "./nuevo-formulario.component";
import { AuthGuard } from 'src/app/guards/auth.guard';
import { ExitGuard } from 'src/app/guards/exit.guard';

const routes: Routes = [{
  path: '',
  component: NuevoFormularioComponent,
  canActivate: [AuthGuard],
  canDeactivate: [ExitGuard],
  data: { state: "formularioCreacion", id_menu: "FORMS002" }
}];

@NgModule({
imports: [RouterModule.forChild(routes)],
exports: [RouterModule],
})
export class NuevoFormularioRoutingModule { }
