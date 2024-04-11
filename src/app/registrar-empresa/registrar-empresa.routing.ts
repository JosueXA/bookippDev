import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { RegistrarEmpresaComponent } from "./registrar-empresa.component";

const routes: Routes = [
    {
        path: '',
        component: RegistrarEmpresaComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class RegistrarEmpresaRoutinModule { }
