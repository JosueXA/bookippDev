import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "src/app/guards/auth.guard";
import { ClienteComponent } from "./cliente.component";

const routes: Routes = [{
    path: '',
    component: ClienteComponent,
    canActivate: [AuthGuard],
    data: { state: "consultaCliente", id_menu: "CLIENCAT001" }
}];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class ClienteRoutingModule { }