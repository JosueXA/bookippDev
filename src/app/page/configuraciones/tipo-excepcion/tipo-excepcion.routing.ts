import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "src/app/guards/auth.guard";
import { TipoExcepcionComponent } from "./tipo-excepcion.component";


const routes: Routes = [{
    path: '',
    component: TipoExcepcionComponent,
    canActivate: [AuthGuard],
    data: { state: "consultaTipoExcepcion", id_menu: "CONFIGCT003" }
}];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class TipoExcepcionRoutingModule { }
