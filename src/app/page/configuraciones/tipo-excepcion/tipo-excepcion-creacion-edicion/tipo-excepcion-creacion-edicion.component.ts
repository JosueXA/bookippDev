import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MethodsService } from 'src/app/core/services/methods.service';
import { PantallaService } from 'src/app/core/services/pantalla.service';
import { ToasterService } from 'src/shared/toaster/toaster.service';
declare var $: any; // JQUERY
import * as bootstrap from 'bootstrap'; // BOOTSTRAP
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-tipo-excepcion-creacion-edicion',
  templateUrl: './tipo-excepcion-creacion-edicion.component.html',
  styleUrls: ['./tipo-excepcion-creacion-edicion.component.scss', '../../../page.component.scss']
})
export class TipoExcepcionCreacionEdicionComponent implements OnInit {

  // Variables de Translate
  tipoExcepcionTranslate:any ={};

  // Modales
  modales: any = {};

  stateParams_idTipoExcepcion:any;

  constructor(private _translate: TranslateService, 
    private _backService: MethodsService, 
    public _pantallaServicio: PantallaService, 
    private _dialog: MatDialog, 
    private _router: Router, 
    private _toaster: ToasterService,
	private matIconRegistry: MatIconRegistry, 
    private domSanitizer: DomSanitizer,
    private _route: ActivatedRoute) {

      	this._translate.setDefaultLang(this._pantallaServicio.idioma);
        this._translate.use(this._pantallaServicio.idioma);

        this._translate.get('tipoExcepcionTranslate').subscribe((translated) => {                        
            this.tipoExcepcionTranslate = this._translate.instant('tipoExcepcionTranslate');            
        });

		this.matIconRegistry.addSvgIcon('iconCasa1', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Casa1-icon.svg"));
            this.matIconRegistry.addSvgIcon('iconFlecha1DerechaPeque', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/FlechaDerechaPequena-icon.svg"));
    }

	ngOnInit(): void {
		this._route.queryParams.subscribe(params => {
            this.stateParams_idTipoExcepcion = params["idTipoExcepcion"];
        });
		this.tipoExcepcion.idTipoExcepcion = this.stateParams_idTipoExcepcion; 

		// if (document.getElementById("styleGeneral") != null)
        //     $("#styleGeneral").remove();
        // var style = document.createElement('style');
        // style.type = 'text/css';
        // style.id = 'styleGeneral';
        // style.innerHTML = "a{white-space:nowrap;text-overflow:ellipsis;background:0 0}";
        // document.getElementsByTagName('head')[0].appendChild(style);


		if (this.tipoExcepcion.idTipoExcepcion == 'N' || this.tipoExcepcion.idTipoExcepcion == '') {
            
        }
        else {
            this.tipoExcepcion_consultaTipoExcepciones();
            this.tipoExcepcion.opc = true;
            this.tipoExcepcion.textOPC = this.tipoExcepcionTranslate.actualizar;
        }

		this.crearModales();
	}

	crearModales() {

        if($("body").find(".modal-alert").length > 1){
            $("body").find(".modal-alert")[1].remove();
        }
        this.modales.modalAlert = new bootstrap.Modal($("#modal-alert").appendTo("body"), {
            backdrop: "static", 
            keyboard: false,
        });

        if($("body").find(".modal-confirm").length > 1){
            $("body").find(".modal-confirm")[1].remove();
        }
        this.modales.modalConfirm = new bootstrap.Modal($("#modal-confirm").appendTo("body"), {
            backdrop: "static", 
            keyboard: false,
        });

		if($("body").find(".cancelarConfirm").length > 1){
            $("body").find(".cancelarConfirm")[1].remove();
        }
        this.modales.cancelarConfirm = new bootstrap.Modal($("#cancelarConfirm").appendTo("body"), {
            backdrop: "static", 
            keyboard: false,
        });

    }

  	rootScope_fromState = "";
	tipoExcepcion = {
		idTipoExcepcion: null,
		descripcion: '',
		opc: false,
		textOPC: this.tipoExcepcionTranslate.nuevo,
		gudardado: true,
	};
	dataTipoExcepcion:any = [];
	paramsNotifi8 = {
		life: 3000,
		theme: "lime",
		sticky: false
	};
	validar = false;
	ver = false;
	guardarPre = false;

	tipoExcepcion_consultaTipoExcepciones () {
		var param:any = {};
		param.idTipoExcepcion = this.tipoExcepcion.idTipoExcepcion;

		this._backService.HttpPost("catalogos/TipoExcepcion/consultarTipoExcepcionesNuevo", {}, param).subscribe( (data:any) => {
			this.dataTipoExcepcion = eval(data);
				this.tipoExcepcion.descripcion = this.dataTipoExcepcion[0].descripcion;
		}, error => {

		});

	};

	tipoExcepcion_REM () {
		if (this.validar == false && this.ver == false) {
			$("#descripcion").removeClass("errorCampo");
		}
	}

	tipoExcepcion_ADD () {
		if ((this.tipoExcepcion.descripcion == "" || this.tipoExcepcion.descripcion == undefined) && this.ver == true) {
			$("#descripcion").addClass("errorCampo");
		}
		if (this.guardarPre == true && (this.tipoExcepcion.descripcion == "" || this.tipoExcepcion.descripcion == undefined)) {
			$("#descripcion").addClass("errorCampo");
		}
	};

	tipoExcepcion_cancelar () {
		if (this.tipoExcepcion.idTipoExcepcion == 'N' || this.tipoExcepcion.idTipoExcepcion == '') {
			//Nuevo
			if ((this.tipoExcepcion.descripcion == "" || this.tipoExcepcion.descripcion == undefined)) {				
				this._router.navigate(['/configuraciones/consultaTipoExcepcion']);
			}
			else {
				this.modales.cancelarConfirm.show();
			}
		}
		else {
			if (this.tipoExcepcion.descripcion == this.dataTipoExcepcion[0].descripcion) {
				this._router.navigate(['/configuraciones/consultaTipoExcepcion']);
			}
			else {
				this.modales.cancelarConfirm.show();
			}
		}
	};

	tipoExcepcion_guardar () {
		//Guardar
		if (this.tipoExcepcion.descripcion != "" && this.tipoExcepcion.descripcion != null && this.tipoExcepcion.descripcion != undefined) {
			var param:any = {};
			param.descripcion = this.tipoExcepcion.descripcion;

			this._backService.HttpPost("catalogos/TipoExcepcion/insertarTipoExcepciones", {}, param).subscribe( (data:any) => {
				if (data == 0) {
					$("#errorDescripcion").text(this.tipoExcepcionTranslate.descripcionExiste);
					$("#descripcion").addClass("errorCampo");
					this.validar = true;
					this.guardarPre = true;
				}
				else {
					this.tipoExcepcion.gudardado = false;
					$("#errorDescripcion").text("");							
					this._router.navigate(['/configuraciones/consultaTipoExcepcion']);
				}
			}, error => {

			});
		}
		else {
			$("#descripcion").addClass("errorCampo");
			this.guardarPre = true;
			this.validar = false;
			$("#errorDescripcion").text("");
		}
	};

	tipoExcepcion_actualizar () {
		//ACTUALIZAR
		if (this.tipoExcepcion.descripcion != "" && this.tipoExcepcion.descripcion != undefined) {
			var param:any = {};
			param.idTipoExcepcion = this.tipoExcepcion.idTipoExcepcion;
			param.descripcion = this.tipoExcepcion.descripcion;

			this._backService.HttpPost("catalogos/TipoExcepcion/actualizarTipoExcepciones", {}, param).subscribe( (data:any) => {
				if (data == 0) {
					$("#errorDescripcion").text(this.tipoExcepcionTranslate.descripcionExiste);
					$("#descripcion").addClass("errorCampo");
					this.guardarPre = true;
					this.validar = true;
				}
				else {
					this.tipoExcepcion.gudardado = false;
					$("#errorDescripcion").text("");							
					this._router.navigate(['/configuraciones/consultaTipoExcepcion']);
				}
			});
		}
		else {
			$("#descripcion").addClass("errorCampo");
			this.validar = false;
			this.guardarPre = true;
			$("#errorDescripcion").text("");
		}
	};

	tipoExcepcion_opciones () {
		//OPCIONES
		if (this.tipoExcepcion.idTipoExcepcion == 'N' || this.tipoExcepcion.idTipoExcepcion == '') {
			//Nuevo
			this.tipoExcepcion_guardar();
		}
		else {
			this.tipoExcepcion_actualizar();
		}
	};

    irAAgenda(){
        this._router.navigate(['/procesos/agenda']);
    }

    irATipoExcepcion(){
        this._router.navigate(['/configuraciones/consultaTipoExcepcion']);
    }
}
