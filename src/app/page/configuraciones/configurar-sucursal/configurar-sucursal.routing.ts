import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "src/app/guards/auth.guard";
import { ConfigurarSucursalComponent } from "./configurar-sucursal.component";

const routes: Routes = [{
    path: '',
    component: ConfigurarSucursalComponent,
    canActivate: [AuthGuard],
    data: { state: "configuracionSucursal", id_menu: "CONFIGCT011" }
}];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class ConfigurarSucursalRoutingModule { }
