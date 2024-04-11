import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "src/app/guards/auth.guard";
import { EquiposComponent } from "./equipos.component";

const routes: Routes = [{ 
    path: '', 
    component: EquiposComponent,
    canActivate: [AuthGuard],
    data: {state: "consultaEquipos", id_menu: "CONFIGCT001"}
  }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EquiposRoutingModule { }
