import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "src/app/guards/auth.guard";
import { TipoExcepcionCreacionEdicionComponent } from "./tipo-excepcion-creacion-edicion.component";


const routes: Routes = [{
    path: '',
    component: TipoExcepcionCreacionEdicionComponent,
    canActivate: [AuthGuard],
    data: { state: "tipoExcepcion", id_menu: "CONFIGCT004" }
}];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class TipoExcepcionCreacionEdicionRoutingModule { }
