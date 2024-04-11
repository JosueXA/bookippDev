import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "src/app/guards/auth.guard";
import { ConfigurarRecetaElectronicaComponent } from "./configurar-receta-electronica.component";

const routes: Routes = [{
    path: '',
    component: ConfigurarRecetaElectronicaComponent,
    canActivate: [AuthGuard],
    data: { state: "configurarRecetaElectronica", id_menu: "CONFIGCT015" }
}];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class ConfigurarRecetaElectronicaRoutingModule { }
