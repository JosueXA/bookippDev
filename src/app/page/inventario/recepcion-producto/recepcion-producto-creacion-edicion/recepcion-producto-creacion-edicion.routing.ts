import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from "src/app/guards/auth.guard";
import { RecepcionProductoCreacionEdicionComponent } from './recepcion-producto-creacion-edicion.component';

const routes: Routes = [{
    path: '',
    component: RecepcionProductoCreacionEdicionComponent,
    canActivate: [AuthGuard],
    data: { state: "agregarOrdenCompra", id_menu: "INVENTCT004" }
}];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class RecepcionProductoCreacionEdicionRoutingModule { }
