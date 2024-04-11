import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "src/app/guards/auth.guard";
import { ExcepcionesPersonalCreacionEdicionComponent } from "./excepcionesPersonal-creacion-edicion.component";

const routes: Routes = [{
    path: '',
    component: ExcepcionesPersonalCreacionEdicionComponent,
    canActivate: [AuthGuard],
    data: { state: "ConsultaExcepcionesPersonal", id_menu: "PERSCAT003" }
}];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class ExcepcionesPersonalCreacionEdicionRoutingModule { }
