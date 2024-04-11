import { Component, OnInit } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MethodsService } from 'src/app/core/services/methods.service';
import { PantallaService } from 'src/app/core/services/pantalla.service';
import { ToasterService } from 'src/shared/toaster/toaster.service';
declare var $: any; // JQUERY


@Component({
  selector: 'app-suscripcion',
  templateUrl: './suscripcion.component.html',
  styleUrls: ['./suscripcion.component.scss'],
})
export class SuscripcionComponent implements OnInit {
	// Variables de Translate
	sessionTraslate: any = {};

	constructor(private _translate: TranslateService, private _backService: MethodsService, public _pantallaServicio: PantallaService, private _router: Router, private _toaster: ToasterService,private matIconRegistry: MatIconRegistry, private domSanitizer: DomSanitizer) {
		this._translate.setDefaultLang(this._pantallaServicio.idioma);
        this._translate.use(this._pantallaServicio.idioma);

        this._translate.get('sessionTraslate').subscribe((translated: string) => {  
            this.sessionTraslate = this._translate.instant('sessionTraslate');
        });
		
		this.matIconRegistry.addSvgIcon('iconCasa1', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Casa1-icon.svg"));
		this.matIconRegistry.addSvgIcon('iconFlecha1DerechaPeque', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/FlechaDerechaPequena-icon.svg"));
	}

	ngOnInit(): void {
		this.iniciarPantalla();
	}

    // ------------------------------------------------------------------------------------------- //
    // ------------------------------------------ SUSCRIPCIÓN ------------------------------------ //
    // ------------------------------------------------------------------------------------------- //

	// ------------------------------------------------------------------------------------------- //
    // -------------------------------------- DECLARACIÓN DE VARIABLES --------------------------- //
	cuenta: any = {
		empresa: "",
		numSucursales: "",
		creacion: "",
		paquete: "",
		fechaSuscripcion: "",
		fechaVigencia: "",
		romState: ""
	};
	dataEstadoCuenta: any = {};
	dataGrid: any = [];
	dataSelect: any;
	rootScope_fromState = "";
	tipoPantalla = "";
	class = 0;
	totalP = 1;
	paqueteVigente = false;

	// ------------------------------------------------------------------------------------------- //
    // -------------------------------------- DECLARACIÓN DE FUNCIONES --------------------------- //
	iniciarPantalla() {
		$("#cuerpo").hide();
		this._pantallaServicio.mostrarSpinner();

		this.tipoPantalla = "Suscripción";
		this.class = 0;
		this.totalP = 1;

		this._backService.HttpPost("seguridad/obtenerPaqueteVigente", {}, {}, 'string').subscribe((response: string) => {
			if (response == "True") {
				this.paqueteVigente = true;
			}
			else {
				this.paqueteVigente = false;
			}

			this.getDataGrid();
			this.consultarEstadoCuenta();
		}, 
		(error) => {
			this._pantallaServicio.ocultarSpinner();
			if (error == 'SinSesion' || error == 'SesionCaducada') {
				if (error == 'SinSesion') {
				this._toaster.error(this.sessionTraslate.favorIniciarSesion);
				}
				if (error == 'SesionCaducada') {
				this._toaster.error(this.sessionTraslate.sesionCaducada);
				}
				this._router.navigate(['/login']);
				return;
			}
			this._toaster.error(this.sessionTraslate.errorEliminar);
		});
	}

	changeClass(selectedDiv: any) {
		this.class = selectedDiv;
		this.metodoPago(selectedDiv);
		//$("#botonSiguiente").click();
	};

	consultarEstadoCuenta() {
		this._backService.HttpPost("catalogos/estadoCuenta/consultarEstadoCuenta", {}, {}).subscribe((response: string) => {
            this.dataEstadoCuenta = {};
			this.dataEstadoCuenta = eval(response);
			this.cuenta.empresa = this.dataEstadoCuenta[0].empresa;
			this.cuenta.numSucursales = this.dataEstadoCuenta[0].numeroSucursales;
			this.cuenta.creacion = this.dataEstadoCuenta[0].fechaAlta;
			this.cuenta.paquete = this.dataEstadoCuenta[0].nombre;
			this.cuenta.fechaSuscripcion = this.dataEstadoCuenta[0].fechaSuscripcion;
			this.cuenta.fechaVigencia = this.dataEstadoCuenta[0].fechaVigencia;
        }, 
        (error) => {
            this._pantallaServicio.ocultarSpinner();
            if (error == 'SinSesion' || error == 'SesionCaducada') {
                if (error == 'SinSesion') {
                this._toaster.error(this.sessionTraslate.favorIniciarSesion);
                }
                if (error == 'SesionCaducada') {
                this._toaster.error(this.sessionTraslate.sesionCaducada);
                }
                this._router.navigate(['/login']);
                return;
            }
            this._toaster.error(this.sessionTraslate.errorEliminar);
        });
	};

	getDataGrid() {
		var params: any = {};
		params.idPaquete = null;

		this._backService.HttpPost("procesos/suscripcion/Suscripcion/getPaquetes", {}, params).subscribe((response: string) => {
			this.dataGrid = eval(response);
			this.dataSelect = JSON.parse(JSON.stringify(this.dataGrid));;
			this.totalP = this.dataGrid.length;

			setTimeout(() => {
				for (var i = 0; i < this.dataGrid.length; i++) {
					let ebi_img : any = document.getElementById("img" + this.dataGrid[i].idPaquete);
					ebi_img.src = this.dataGrid[i].codigo;
				}
			},50);

			$("#cuerpo").show();
			this._pantallaServicio.ocultarSpinner();
		}, 
		(error) => {
			this._pantallaServicio.ocultarSpinner();
			if (error == 'SinSesion' || error == 'SesionCaducada') {
				if (error == 'SinSesion') {
				this._toaster.error(this.sessionTraslate.favorIniciarSesion);
				}
				if (error == 'SesionCaducada') {
				this._toaster.error(this.sessionTraslate.sesionCaducada);
				}
				this._router.navigate(['/login']);
				return;
			}
		});
	}

	irAAgenda(){
        this._router.navigate(['/procesos/agenda']);
    }

	metodoPago(id: any){
		this._router.navigate(
            ['/procesos/metodoPago'],
            {queryParams: { idPaquete: id }}
        );
	}
}
