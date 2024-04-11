import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "src/app/guards/auth.guard";
import { PersonalComponent } from "./personal.component";

const routes: Routes = [{
    path: '',
    component: PersonalComponent,
    canActivate: [AuthGuard],
    data: { state: "personal", id_menu: "PERSCAT001" }
}];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class PersonalRoutingModule { }
