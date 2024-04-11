import { Component, OnInit } from '@angular/core';
import { MethodsService } from '../core/services/methods.service';
import { TranslateService } from '@ngx-translate/core';
import { PantallaService } from '../core/services/pantalla.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ToasterService } from 'src/shared/toaster/toaster.service';
declare var $: any; // JQUERY
import * as bootstrap from 'bootstrap'; // BOOTSTRAP
import { parseClassNames } from '@fullcalendar/core';
import { ValidarCorreoWebService } from './validar-correo-web.service';

@Component({
	selector: 'app-validar-correo-web',
	templateUrl: './validar-correo-web.component.html',
	styleUrls: [ './validar-correo-web.component.scss', '../page/page.component.scss']
})
export class ValidarCorreoWebComponent implements OnInit {
	// Variable de translate de sucursal
	registroEmpresaTranslate: any = {};

	i: any = "";
	c: any = "";

	constructor(
		private _backService: ValidarCorreoWebService,
		private _translate: TranslateService,
		private _pantallaServicio: PantallaService,
		private _router: Router,
		private _toaster: ToasterService,
		private _route: ActivatedRoute
	) {
		const userLang = (navigator.language).toLocaleLowerCase();
		let lang = userLang.substring(0, 2) == 'en' ? 'en-us' : 'es-mx';

		this._translate.setDefaultLang(lang);
		this._translate.use(lang);

		this._translate.get('registroEmpresaTranslate').subscribe((translated: string) => {
			this.registroEmpresaTranslate = this._translate.instant('registroEmpresaTranslate');
		});
	}

	ngOnInit(): void {
		this._route.queryParams.subscribe(params => {
			this.i = params["i"]; 
            this.c = params["c"];
		});

		if (!this.i || !this.c)
		{
			$("#vista")[0].innerHTML = "<div id='titulo'>Ha ocurrido un error</div>";
		}
		else
		{
			// Llamada al back para confirmar el correo
			var params: any = {};
			params.i = this.i;
			params.c = this.c;
			this._backService.HttpPost("aspxs/validarCorreo/confirmarCorreo", {}, params).subscribe((response: string) => {
				var dataTemp = eval(response);

				if(dataTemp){
					if(dataTemp.length > 0){
						$("#vista")[0].innerHTML = "<div id='titulo'>Ha ocurrido un error</div>";
					}
					else{
						//this._router.navigate(['/login']);
					}
				}
				else{
					//this._router.navigate(['/login']);
				}
			}, error => {
			
			});

			// DataTable dt = bllEnviarCorreo.confirmarCorreo(connectionString, i, c);
			// if (dt.Rows.Count > 0)
			// {
			// 	vista.InnerHtml = "<div id='titulo'>Ha ocurrido un error</div>";
			// }
			// else {
			// 	Response.BufferOutput = true;
			// 	Response.Redirect("https://" + System.Configuration.ConfigurationManager.AppSettings["serverURL"] + "/index.html#/agenda");//"https://my.bookipp.com/index.html#/agenda");
				
			// 	//Response.Redirect("http://13.85.28.87/bookipp_prueba//index.html#/agenda");
			// }
		}
	}
}
