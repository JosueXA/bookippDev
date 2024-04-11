import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from "src/app/guards/auth.guard";
import { ImportarProductosComponent } from './importar-productos.component';

const routes: Routes = [{ 
  path: '', 
  component: ImportarProductosComponent,
  canActivate: [AuthGuard],
  data: {state: "importadorProductos", id_menu: "INVENTCT002"}
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ImportarProductosRoutingModule {}
