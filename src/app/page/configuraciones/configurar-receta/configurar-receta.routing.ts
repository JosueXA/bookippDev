import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "src/app/guards/auth.guard";
import { ConfigurarRecetaComponent } from "./configurar-receta.component";

const routes: Routes = [{
    path: '',
    component: ConfigurarRecetaComponent,
    canActivate: [AuthGuard],
    data: { state: "configurarReceta", id_menu: "CONFIGCT013" }
}];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class ConfigurarRecetaRoutingModule { }
