import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "src/app/guards/auth.guard";
import { UsuarioComponent } from "./usuario.component";


const routes: Routes = [{
    path: '',
    component: UsuarioComponent,
    canActivate: [AuthGuard],
    data: { state: "consultaUsuario", id_menu: "CONFIGCT007" }
}];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class UsuarioRoutingModule { }
