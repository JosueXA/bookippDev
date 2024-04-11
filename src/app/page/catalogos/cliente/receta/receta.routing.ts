import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "src/app/guards/auth.guard";
import { RecetaComponent } from "./receta.component";

const routes: Routes = [{
    path: '',
    component: RecetaComponent,
    canActivate: [AuthGuard],
    data: { state: "receta", id_menu: "CONFIGCT014" }
}];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class RecetaRoutingModule { }