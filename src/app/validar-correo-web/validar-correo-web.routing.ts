import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ValidarCorreoWebComponent } from "./validar-correo-web.component";

const routes: Routes = [
    {
        path: '',
        component: ValidarCorreoWebComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ValidarCorreoWebRouting { }
