import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/guards/auth.guard';
import { ServicioComponent } from './servicio.component';
import { ExitGuard } from '../../../guards/exit.guard';

const routes: Routes = [
    {
        path: '',
        component: ServicioComponent,
        canActivate: [AuthGuard],
        canDeactivate: [ExitGuard],
        data: { state: 'servicio', id_menu: 'SERPAQCT001' },
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class ServicioRoutingModule { }
