import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "src/app/guards/auth.guard";
import { RecepcionProductoComponent } from "./recepcion-producto.component";

const routes: Routes = [{ 
  path: '', 
  component: RecepcionProductoComponent,
  canActivate: [AuthGuard],
  data: {state: "consultaOrdenCompra", id_menu: "INVENTCT003"}
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RecepcionProductoRoutingModule { }
