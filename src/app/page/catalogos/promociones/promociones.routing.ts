import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "src/app/guards/auth.guard";
import { PromocionesComponent } from "./promociones.component";

const routes: Routes = [{ 
    path: '', 
    component: PromocionesComponent,
    canActivate: [AuthGuard],
    data: {state: "consultaPromociones", id_menu: "PROMCAT001"}
  }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PromocionesRoutingModule { }
