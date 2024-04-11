import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from "src/app/guards/auth.guard";
import { ProductoCreacionEdicionComponent } from './producto-creacion-edicion.component';

const routes: Routes = [{
    path: '',
    component: ProductoCreacionEdicionComponent,
    canActivate: [AuthGuard],
    data: { state: "productos", id_menu: "INVENTCT001" }
}];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class ProductoCreacionEdicionRoutingModule { }
