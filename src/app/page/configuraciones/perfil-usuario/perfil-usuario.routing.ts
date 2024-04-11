import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "src/app/guards/auth.guard";
import { PerfilUsuarioComponent } from "./perfil-usuario.component";


const routes: Routes = [{
    path: '',
    component: PerfilUsuarioComponent,
    canActivate: [AuthGuard],
    data: { state: "configurarPerfilesUsuario", id_menu: "CONFIGCT007" }
}];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class PerfilUsuarioRoutingModule { }
