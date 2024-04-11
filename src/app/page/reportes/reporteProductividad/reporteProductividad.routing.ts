import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "src/app/guards/auth.guard";
import { ReporteProductividadComponent } from "./reporteProductividad.component";

const routes: Routes = [{
    path: '',
    component: ReporteProductividadComponent,
    canActivate: [AuthGuard],
    data: { state: "reporteProductividad", id_menu: "REPORCAT001" }
}];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class ReporteProductividadRoutingModule { }
