import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CatalogosComponent } from './catalogos.component';
import { AuthGuard } from 'src/app/guards/auth.guard';

const routes: Routes = [
    {
        path: 'promociones',
        loadChildren: () =>
          import('./promociones/promociones.module').then(
            (module) => module.PromocionesModule
          ),
      },
      {
        path: 'promociones-creacion-edicion',
        loadChildren: () =>
            import('./promociones/promociones-creacion-edicion/promociones-creacion-edicion.module').then(
                (module) => module.PromocionesCreacionEdicionModule
            ),
      },
      {
        path: '',
        component: CatalogosComponent,
        children: [
            {
                path: 'servicio',
                loadChildren: () =>
                    import('./servicio/servicio.module').then(
                        (module) => module.ServiciolModule
                    ),
            },
            {
                path: 'sucursal',
                loadChildren: () =>
                    import('./sucursal/sucursal.module').then(
                        (module) => module.SucursalModule
                    ),
            },
            {
                path: 'excepciones-personal',
                loadChildren: () =>
                    import('./excepciones-personal/excepciones-personal.module').then(
                        (module) => module.Excepciones_PersonalModule
                    ),
            },
            {
                path: 'excepcionesPersonal-creacion-edicion',
                loadChildren: () =>
                    import('./excepciones-personal/excepcionesPersonal-creacion-edicion/excepcionesPersonal-creacion-edicion.module').then(
                        (module) => module.ExcepcionesPersonalCreacionEdicionModule
                    ),
            },
            {
                path: 'personal',
                loadChildren: () =>
                    import('./personal/personal.module').then(
                        (module) => module.PersonalModule
                    ),
            },
            {
                path: 'cliente',
                loadChildren: () =>
                    import('./cliente/cliente.module').then(
                        (module) => module.ClienteModule
                    ),
            },
            {
                path: 'importar-clientes',
                loadChildren: () =>
                    import('./cliente/importar-clientes/importar-clientes.module').then(
                        (module) => module.ImportarClientesModule
                    ),
            },
            {
                path: 'cliente-creacion-edicion',
                loadChildren: () =>
                    import('./cliente/cliente-creacion-edicion/cliente-creacion-edicion.module').then(
                        (module) => module.ClienteCreacionEdicionModule
                    ),
            },
            {
                path: 'receta',
                loadChildren: () =>
                    import('./cliente/receta/receta.module').then(
                        (module) => module.RecetaModule
                    ),
            },
            {
                path: 'formulario',
                loadChildren: () =>
                    import('./formulario/formulario.module').then(
                        (module) => module.FormularioModule
                    ),
            },
            {
              path: 'formulario/actualizar/:id',
              loadChildren: () =>
                  import('./formulario/modals/update-formulario/update-formulario.module').then(
                      (module) => module.UpdateFormularioModule
                  ),
            },
            {
              path: 'formulario/nuevo',
              loadChildren: () =>
                  import('./formulario/modals/nuevo-formulario/nuevo-formulario.module').then(
                    (module) => module.NuevoFormularioModule
                  )
            },
            {
                path: '',
                redirectTo: 'servicio',
                pathMatch: 'full',
            },

        ],
    },
    {
        path: '',
        redirectTo: 'servicio',
        pathMatch: 'full',
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class CatalogosRoutingModule { }
