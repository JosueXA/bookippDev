import { RouterModule, Routes } from "@angular/router";
import { UpdateFormularioComponent } from "./update-formulario.component";
import { NgModule } from "@angular/core";
import { AuthGuard } from 'src/app/guards/auth.guard';
import { ExitGuard } from 'src/app/guards/exit.guard';

const routes: Routes = [{
  path: '',
  component: UpdateFormularioComponent,
  canActivate: [AuthGuard],
  canDeactivate: [ExitGuard],
  data: { state: "formularioEdicion", id_menu: "FORMS002" }
}];

@NgModule({
imports: [RouterModule.forChild(routes)],
exports: [RouterModule],
})
export class UpdateFormularioRoutingModule { }
