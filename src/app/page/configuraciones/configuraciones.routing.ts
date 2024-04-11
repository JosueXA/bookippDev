import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConfiguracionesComponent } from './configuraciones.component';
import { AuthGuard } from 'src/app/guards/auth.guard';

const routes: Routes = [
    {
        path: '',
        component: ConfiguracionesComponent,
        children: [
            {
                path: 'configurar-sucursal',
                loadChildren: () =>
                    import('./configurar-sucursal/configurar-sucursal.module').then(
                        (module) => module.ConfigurarSucursalModule
                    ),
            },
            {
                path: 'consultaEquipos',
                loadChildren: () =>
                    import('./equipos/equipos.module').then(
                        (module) => module.EquiposModule
                    ),
            },
            {
                path: 'equipo',
                loadChildren: () =>
                    import(
                        './equipos/equipos-creacion-edicion/equipos-creacion-edicion.module'
                    ).then((module) => module.EquiposCreacionEdicionModule),
            },
            {
                path: 'consultaTipoExcepcion',
                loadChildren: () =>
                    import('./tipo-excepcion/tipo-excepcion.module').then(
                        (module) => module.TipoExcepcionModule
                    ),
            },
            {
                path: 'tipoExcepcion',
                loadChildren: () =>
                    import(
                        './tipo-excepcion/tipo-excepcion-creacion-edicion/tipo-excepcion-creacion-edicion.module'
                    ).then((module) => module.TipoExcepcionCreacionEdicionModule),
            },
            {
                path: 'consultaCambioTipo',
                loadChildren: () =>
                    import('./cambio-tipo/cambio-tipo.module').then(
                        (module) => module.CambioTipoModule
                    ),
            },
            {
                path: 'cambioTipo',
                loadChildren: () =>
                    import(
                        './cambio-tipo/cambio-tipo-creacion-edicion/cambio-tipo-creacion-edicion.module'
                    ).then((module) => module.CambioTipoCreacionEdicionModule),
            },
            {
                path: 'consultaUsuario',
                loadChildren: () =>
                    import('./usuario/usuario.module').then(
                        (module) => module.UsuarioModule
                    ),
            },
            {
                path: 'usuario',
                loadChildren: () =>
                    import(
                        './usuario/usuario-creacion-edicion/usuario-creacion-edicion.module'
                    ).then((module) => module.UsuarioCreacionEdicionModule),
            },
            {
                path: 'configurarPerfilUsuario',
                loadChildren: () =>
                    import('./perfil-usuario/perfil-usuario.module').then(
                        (module) => module.PerfilUsuarioModule
                    ),
            },
            {
                path: 'configurar-ticket',
                loadChildren: () =>
                    import('./configurar-ticket/configurar-ticket.module').then(
                        (module) => module.ConfigurarTicketModule
                    ),
            },
            {
                path: 'configurar-receta',
                loadChildren: () =>
                    import('./configurar-receta/configurar-receta.module').then(
                        (module) => module.ConfigurarRecetaModule
                    ),
            },
            {
                path: 'configurar-receta-electronica',
                loadChildren: () =>
                    import('./configurar-receta-electronica/configurar-receta-electronica.module').then(
                        (module) => module.ConfigurarRecetaElectronicaModule
                    ),
            },
            {
                path: '',
                redirectTo: 'configurar-sucursal',
                pathMatch: 'full',
            },
        ],
    },
    {
        path: '',
        redirectTo: 'configurar-sucursal',
        pathMatch: 'full',
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class ConfiguracionesRoutingModule { }
