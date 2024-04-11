import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageComponent } from './page.component';

const routes: Routes = [
    {
        path: '',
        component: PageComponent,
        children: [
            {
                path: 'home',
                loadChildren: () =>
                    import('./home/home.module').then((module) => module.HomeModule),
            },
            {
                path: 'procesos',
                loadChildren: () =>
                    import('./procesos/procesos.module').then(
                        (module) => module.ProcesosModule
                    ),
            },
            {
                path: 'catalogos',
                loadChildren: () =>
                    import('./catalogos/catalogos.module').then(
                        (module) => module.CatalogosModule
                    ),
            },
            {
                path: 'reportes',
                loadChildren: () =>
                    import('./reportes/reportes.module').then(
                        (module) => module.ReportesModule
                    ),
            },
            {
                path: 'configuraciones',
                loadChildren: () =>
                    import('./configuraciones/configuraciones.module').then(
                        (module) => module.ConfiguracionesModule
                    ),
            },
            {
                path: 'inventario',
                loadChildren: () =>
                    import('./inventario/inventario.module').then(
                        (module) => module.InventarioModule
                    ),
            },
			{
                path: 'facturacion',
                loadChildren: () =>
                    import('./facturacion/facturacion.module').then(
                        (module) => module.FacturacionModule
                    ),
            },
            {
                path: '',
                redirectTo: 'procesos',
                pathMatch: 'full',
            },
        ],
    },
    {
        path: '',
        redirectTo: 'procesos',
        pathMatch: 'full',
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class PageRoutingModule { }
