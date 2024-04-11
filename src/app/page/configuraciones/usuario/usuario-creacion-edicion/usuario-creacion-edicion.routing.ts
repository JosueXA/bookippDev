import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "src/app/guards/auth.guard";
import { UsuarioCreacionEdicionComponent } from "./usuario-creacion-edicion.component";

const routes: Routes = [{
    path: '',
    component: UsuarioCreacionEdicionComponent,
    canActivate: [AuthGuard],
    data: { state: "usuario", id_menu: "CONFIGCT008" }
}];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class UsuarioCreacionEdicionRoutingModule { }
