import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
// import { AuthGuard } from "src/app/guards/AuthGuard.guard";
import { InventarioComponent } from './inventario.component';

const routes: Routes = [
    {
        path: '',
        component: InventarioComponent,
        children: [
            {
                path: 'productos',
                loadChildren: () =>
                    import('./productos/productos.module').then(
                        (module) => module.ProductosModule
                    ),
            },
            {
                path: 'producto',
                loadChildren: () =>
                    import(
                        './productos/producto-creacion-edicion/producto-creacion-edicion.module'
                    ).then((module) => module.ProductoCreacionEdicionModule),
            },
            {
                path: 'importar-productos',
                loadChildren: () =>
                    import(
                        './productos/importar-productos/importar-productos.module'
                    ).then((module) => module.ImportarProductosModule),
            },
            {
                path: 'recepcion-productos',
                loadChildren: () =>
                    import('./recepcion-producto/recepcion-producto.module').then(
                        (module) => module.RecepcionProductoModule
                    ),
            },
            {
                path: 'recepcion-producto',
                loadChildren: () =>
                    import(
                        './recepcion-producto/recepcion-producto-creacion-edicion/recepcion-producto-creacion-edicion.module'
                    ).then((module) => module.RecepcionProductoCreacionEdicionModule),
            },
        ],
    },
    {
        path: '',
        redirectTo: 'inventario',
        pathMatch: 'full',
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class InventarioRoutingModule { }
