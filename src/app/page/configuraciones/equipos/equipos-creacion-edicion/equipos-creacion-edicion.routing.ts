import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "src/app/guards/auth.guard";
import { EquiposCreacionEdicionComponent } from "./equipos-creacion-edicion.component";

const routes: Routes = [{
    path: '',
    component: EquiposCreacionEdicionComponent,
    canActivate: [AuthGuard],
    data: { state: "equipo", id_menu: "CONFIGCT002" }
}];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class EquiposCreacionEdicionRoutingModule { }
