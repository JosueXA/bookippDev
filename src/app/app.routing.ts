import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
	{
		path: 'login', loadChildren: () => import('./login/login.module').then(module => module.LoginModule)
	},
	{
		path: 'registro-empresa', loadChildren: () => import('./registrar-empresa/registrar-empresa.module').then(module => module.RegistrarEmpresaModule)
	},
	{
		path: 'validar-correo-web', loadChildren: () => import('./validar-correo-web/validar-correo-web.module').then(module => module.ValidarCorreoWebModule)
	},
	{
		path: 'bookipp-app', loadChildren: () => import('./bookipp-app/bookipp-app.module').then(module => module.BookippAppModule)
	},
	{
		path: 'restablecer-contrasenia-web', loadChildren: () => import('./restablecer-contrasenia-web/restablecer-contrasenia-web.module').then(module => module.RestablecerContraseniaWebModule)
	},
	{
		path: 'politica', loadChildren: () => import('./politica-privacidad/politica-privacidad.module').then(module => module.PoliticaPrivacidadModule)
	},
	{
		path: 'formulario', loadChildren: () => import('./formulario-respuestas/formulario-respuestas.module').then(module => module.FormularioRespuestasModule)
	},
	{
		path: '', loadChildren: () => import('./page/page.module').then(module => module.PageModule)
	},
	{
		path: '**', loadChildren: () => import('../shared/not-found/not-found.module').then(module => module.NotFoundModule)
	}
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})
export class AppRoutingModule { }
