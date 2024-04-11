import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReportesComponent } from './reportes.component';
import { AuthGuard } from 'src/app/guards/auth.guard';

const routes: Routes = [
    {
        path: '',
        component: ReportesComponent,
        children: [
            {
                path: 'reporteProductividad',
                loadChildren: () =>
                    import('./reporteProductividad/reporteProductividad.module').then(
                        (module) => module.ReporteProductividadModule
                    ),
            },
            {
                path: 'reporteCitas',
                loadChildren: () =>
                    import('./reporteCitas/reporteCitas.module').then(
                        (module) => module.ReporteCitasModule
                    ),
            },
            {
                path: 'reporteIngresos',
                loadChildren: () =>
                    import('./reporteIngresos/reporteIngresos.module').then(
                        (module) => module.ReporteIngresosModule
                    ),
            },
            {
                path: '',
                redirectTo: 'reporteProductividad',
                pathMatch: 'full',
            },
        ],
    },
    {
        path: '',
        redirectTo: 'reporteProductividad',
        pathMatch: 'full',
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class ReportesRoutingModule { }
