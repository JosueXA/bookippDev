import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "src/app/guards/auth.guard";
import { ReporteIngresosComponent } from "./reporteIngresos.component";

const routes: Routes = [{
    path: '',
    component: ReporteIngresosComponent,
    canActivate: [AuthGuard],
    data: { state: "ventaProducto", id_menu: "REPORCAT003" }
}];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class ReporteIngresosRoutingModule { }
