import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "src/app/guards/auth.guard";
import { PromocionesCreacionEdicionComponent } from "./promociones-creacion-edicion.component";

const routes: Routes = [{ 
    path: '', 
    component: PromocionesCreacionEdicionComponent,
    canActivate: [AuthGuard],
    data: {state: "promocion", id_menu: "PROMCAT002"}
  }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PromocionesCreacionEdicionRoutingModule { }
