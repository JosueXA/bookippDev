import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProcesosComponent } from './procesos.component';
import { AuthGuard } from "src/app/guards/auth.guard";

const routes: Routes = [
    {
        path: '',
        component: ProcesosComponent,
        children: [
            {
                path: 'agenda',
                loadChildren: () =>
                    import('./agenda/agenda.module').then(
                        (module) => module.AgendaModule
                    ),
            },
            {
                path: 'suscripcion',
                loadChildren: () =>
                    import('./suscripcion/suscripcion.module').then(
                        (module) => module.SuscripcionModule
                    ),
            },
            {
                path: 'metodoPago',
                loadChildren: () =>
                    import('./suscripcion/metodoPago/metodoPago.module').then(
                        (module) => module.MetodoPagoModule
                    ),
            },
            {
                path: 'test',
                loadChildren: () =>
                    import('./test/test.module').then(
                        (module) => module.TestModule
                    ),
            },
            {
                path: '',
                redirectTo: 'agenda',
                pathMatch: 'full'
            },
        ],
    },
    {
        path: '',
        redirectTo: 'agenda',
        pathMatch: 'full'
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class ProcesosRoutingModule { }
