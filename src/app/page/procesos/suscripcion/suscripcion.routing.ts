import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "src/app/guards/auth.guard";
import { SuscripcionComponent } from "./suscripcion.component";

const routes: Routes = [{ 
    path: '', 
    component: SuscripcionComponent,
    canActivate: [AuthGuard],
    data: {state: "suscripcion", id_menu: "SUSCRIP001"}
  }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SuscripcionRoutingModule { }
