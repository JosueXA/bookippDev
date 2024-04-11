import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "src/app/guards/auth.guard";
import { ClienteCreacionEdicionComponent } from "./cliente-creacion-edicion.component";

const routes: Routes = [{
    path: '',
    component: ClienteCreacionEdicionComponent,
    canActivate: [AuthGuard],
    data: { state: "cliente", id_menu: "CLIENCAT002" }
}];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class ClienteCreacionEdicionRoutingModule { }