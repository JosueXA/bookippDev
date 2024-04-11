import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/guards/auth.guard';
import { SucursalComponent } from './sucursal.component';
import { ExitGuard } from '../../../guards/exit.guard';

const routes: Routes = [
    {
        path: '',
        component: SucursalComponent,
        canActivate: [AuthGuard],
        canDeactivate: [ExitGuard],
        data: { state: 'sucursal', id_menu: 'SUCURSA001' },
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class SucursalRoutingModule { }
