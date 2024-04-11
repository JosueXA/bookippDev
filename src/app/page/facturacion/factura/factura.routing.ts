import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "src/app/guards/auth.guard";
import { FacturaComponent } from "./factura.component";

const routes: Routes = [{
    path: '',
    component: FacturaComponent,
    canActivate: [AuthGuard],
    data: { state: "factura", id_menu: "FACTUCAT001" }
}];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class FacturaRoutingModule { }