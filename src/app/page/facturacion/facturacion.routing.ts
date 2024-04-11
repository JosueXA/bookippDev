import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FacturacionComponent } from './facturacion.component';
import { AuthGuard } from 'src/app/guards/auth.guard';

const routes: Routes = [
      {
        path: '',
        component: FacturacionComponent,
        children: [
			{
                path: 'facturacionSerie',
                loadChildren: () =>
                    import('./facturacion/facturacion.module').then(
                        (module) => module.FacturacionModule
                    ),
            },
            {
                path: 'facturaSerie',
                loadChildren: () =>
                    import('./facturacion/factura-creacion-edicion/factura-creacion-edicion.module').then(
                        (module) => module.FacturaCreacionEdicionModule
                    ),
            },
            {
                path: 'factura',
                loadChildren: () =>
                    import('./factura/factura.module').then(
                        (module) => module.FacturaModule
                    ),
            },
            {
                path: '',
                redirectTo: 'facturacionSerie',
                pathMatch: 'full',
            },
        ],
    },
    {
        path: '',
        redirectTo: 'facturacionSerie',
        pathMatch: 'full',
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class FacturacionRoutingModule { }
