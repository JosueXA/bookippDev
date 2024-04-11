import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "src/app/guards/auth.guard";
import { CambioTipoCreacionEdicionComponent } from "./cambio-tipo-creacion-edicion.component";


const routes: Routes = [{
    path: '',
    component: CambioTipoCreacionEdicionComponent,
    canActivate: [AuthGuard],
    data: { state: "cambio_tipo", id_menu: "CONFIGCT006" }
}];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class CambioTipoCreacionEdicionRoutingModule { }
