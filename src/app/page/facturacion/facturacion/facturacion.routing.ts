import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "src/app/guards/auth.guard";
import { FacturacionComponent } from "./facturacion.component";

const routes: Routes = [{
    path: '',
    component: FacturacionComponent,
    canActivate: [AuthGuard],
    data: { state: "consultaFacturaSeries", id_menu: "FACTUCAT001" }
}];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class FacturacionRoutingModule { }