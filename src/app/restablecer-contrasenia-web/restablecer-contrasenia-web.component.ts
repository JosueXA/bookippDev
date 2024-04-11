import { Component, OnInit } from '@angular/core';
import { RestablecerContraseniaWebService } from './restablecer-contrasenia-web.service';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';
import { PantallaService } from '../core/services/pantalla.service';

@Component({
  selector: 'app-restablecer-contrasenia-web',
  templateUrl: './restablecer-contrasenia-web.component.html',
  styleUrls: ['./restablecer-contrasenia-web.component.scss', '../page/page.component.scss']
})
export class RestablecerContraseniaWebComponent implements OnInit {
   c: string = "";
   correo: string = "";
   pass: string = "";
   errorMensaje: string = "Procesando informacion...";
	
  constructor(
	private _backService: RestablecerContraseniaWebService,
	private _translate: TranslateService,
	private _route: ActivatedRoute,
	private _pantallaServicio: PantallaService,
  ) { 
	const userLang = (navigator.language).toLocaleLowerCase();
	let lang = userLang.substring(0, 2) == 'en' ? 'en-us' : 'es-mx';

	this._translate.setDefaultLang(lang);
	this._translate.use(lang);
  }

  ngOnInit(): void {
	this._route.queryParams.subscribe(params => {
		this.c = params["c"];
		if(this.c){
			this.cargarInformacion();
			return;
		}

		this.errorMensaje = "Ha ocurrido un error";
	});
  }

  cargarInformacion(){
	this._pantallaServicio.mostrarSpinner();
	let params: any = {};
	params.c = this.c;
	this._backService.HttpPost("aspxs/RestablecerContrasenia/confirmarContrasenia", {}, params).subscribe(
		response => {
			const dataTemp = eval(response);
			this.correo = dataTemp.correo;
			this.pass = dataTemp.pass;
			this.errorMensaje = "";
			this._pantallaServicio.ocultarSpinner();
		},
		error => {
			this.errorMensaje = "Ha ocurrido un error";
			this._pantallaServicio.ocultarSpinner();
		}
	)
  }
}
