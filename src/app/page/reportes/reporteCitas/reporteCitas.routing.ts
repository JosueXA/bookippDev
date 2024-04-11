import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "src/app/guards/auth.guard";
import { ReporteCitasComponent } from "./reporteCitas.component";

const routes: Routes = [{
    path: '',
    component: ReporteCitasComponent,
    canActivate: [AuthGuard],
    data: { state: "reporteVentas", id_menu: "REPORCAT002" }
}];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class ReporteCitasRoutingModule { }
