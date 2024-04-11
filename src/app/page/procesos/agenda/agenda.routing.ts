import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "src/app/guards/auth.guard";
import { AgendaComponent } from "./agenda.component";

const routes: Routes = [{ 
    path: '', 
    component: AgendaComponent,
    canActivate: [AuthGuard],
    data: {state: "agenda", id_menu: "AGENCAT004"}
  }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AgendaRoutingModule { }
