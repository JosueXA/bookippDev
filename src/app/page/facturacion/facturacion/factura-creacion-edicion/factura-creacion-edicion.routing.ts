import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "src/app/guards/auth.guard";
import { FacturaCreacionEdicionComponent } from "./factura-creacion-edicion.component";

const routes: Routes = [{
    path: '',
    component: FacturaCreacionEdicionComponent,
    canActivate: [AuthGuard],
    data: { state: "facturaSeries", id_menu: "FACTUCAT001" }
}];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class FacturaCreacionEdicionRoutingModule { }