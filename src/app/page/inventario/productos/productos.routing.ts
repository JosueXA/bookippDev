import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "src/app/guards/auth.guard";
import { ProductosComponent } from "./productos.component";

const routes: Routes = [{
    path: '',
    component: ProductosComponent,
    canActivate: [AuthGuard],
    data: { state: "consultaProductos", id_menu: "INVENTCT001" }
}];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ProductosRoutingModule { }
