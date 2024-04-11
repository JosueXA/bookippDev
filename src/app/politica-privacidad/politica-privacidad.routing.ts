import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { PoliticaPrivacidadComponent } from "./politica-privacidad.component";

const routes: Routes = [
    {
        path: '',
        component: PoliticaPrivacidadComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class PoliticaPrivacidadRouting { }
