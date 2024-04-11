import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "src/app/guards/auth.guard";
import { ConfigurarTicketComponent } from "./configurar-ticket.component";

const routes: Routes = [{
    path: '',
    component: ConfigurarTicketComponent,
    canActivate: [AuthGuard],
    data: { state: "configurarTicket", id_menu: "CONFIGCT009" }
}];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class ConfigurarTicketRoutingModule { }
