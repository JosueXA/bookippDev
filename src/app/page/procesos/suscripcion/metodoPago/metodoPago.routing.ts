import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "src/app/guards/auth.guard";
import { MetodoPagoComponent } from "./metodoPago.component";

const routes: Routes = [{ 
    path: '', 
    component: MetodoPagoComponent,
    canActivate: [AuthGuard],
    data: {state: "metodoPago", id_menu: "SUSCRIP001"}
  }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MetodoPagoRoutingModule { }
