import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "src/app/guards/auth.guard";
import { CambioTipoComponent } from "./cambio-tipo.component";


const routes: Routes = [{
    path: '',
    component: CambioTipoComponent,
    canActivate: [AuthGuard],
    data: { state: "consultaCambio_tipo", id_menu: "CONFIGCT005" }
}];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class CambioTipoRoutingModule { }
