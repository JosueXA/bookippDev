import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "src/app/guards/auth.guard";
import { CajaComponent } from "./caja.component"; 

const routes: Routes = [{ 
    path: '', 
    component: CajaComponent,
    canActivate: [AuthGuard],
    data: {state: "agenda", id_menu: "CAJACAT001"}
  }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CajaRoutingModule { }
