import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "src/app/guards/auth.guard";
import { Excepciones_PersonalComponent } from "./excepciones-personal.component";

const routes: Routes = [{
    path: '',
    component: Excepciones_PersonalComponent,
    canActivate: [AuthGuard],
    data: { state: "ConsultaExcepcionesPersonal", id_menu: "PERSCAT003" }
}];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class Excepciones_PersonalRoutingModule { }
