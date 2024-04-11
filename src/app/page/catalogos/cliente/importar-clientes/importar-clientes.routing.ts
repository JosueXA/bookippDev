import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/guards/auth.guard';
import { ImportarClientesComponent } from './importar-clientes.component';

const routes: Routes = [
  {
    path: '',
    component: ImportarClientesComponent,
    canActivate: [AuthGuard],
    data: { state: 'importador', id_menu: 'CLIENCAT002' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ImportarClientesRoutingModule {}
