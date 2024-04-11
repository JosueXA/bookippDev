import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { RestablecerContraseniaWebComponent } from "./restablecer-contrasenia-web.component";

const routes: Routes = [
    {
        path: '',
        component: RestablecerContraseniaWebComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class RestablecerContraseniaWebRouting { }
