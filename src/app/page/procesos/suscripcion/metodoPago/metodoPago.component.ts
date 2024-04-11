import { Token } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as bootstrap from 'bootstrap'; // BOOTSTRAP
import { MethodsService } from 'src/app/core/services/methods.service';
import { PantallaService } from 'src/app/core/services/pantalla.service';
import { environment } from 'src/environments/environment';
import { ToasterService } from 'src/shared/toaster/toaster.service';
declare var $: any; // JQUERY


@Component({
  selector: 'app-metodoPago',
  templateUrl: './metodoPago.component.html',
  styleUrls: ['./metodoPago.component.scss', '../../../page.component.scss'],
})
export class MetodoPagoComponent implements OnInit {
	// Variables de Translate
	sessionTraslate: any = {};
	metodoPagoTranslate: any = {};

	// Modales
	modales: any = {}; 

	constructor(private _translate: TranslateService, private _backService: MethodsService, private _route: ActivatedRoute, public _pantallaServicio: PantallaService, private _router: Router, private _toaster: ToasterService,private matIconRegistry: MatIconRegistry, private domSanitizer: DomSanitizer) {
		this._translate.setDefaultLang(this._pantallaServicio.idioma);
        this._translate.use(this._pantallaServicio.idioma);

        this._translate.get('sessionTraslate').subscribe((translated: string) => {  
            this.sessionTraslate = this._translate.instant('sessionTraslate');
            this.metodoPagoTranslate = this._translate.instant('metodoPagoTranslate');
        });
		
		this.tipoPantalla = this.metodoPagoTranslate.metodoPago;

		this.matIconRegistry.addSvgIcon('iconCasa1', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../../assets/icons/finales/Casa1-icon.svg"));
		this.matIconRegistry.addSvgIcon('iconCruzCirculo', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../../assets/icons/finales/10-2-TiposdeExcepcion-icon.svg"));
		this.matIconRegistry.addSvgIcon('iconFlecha1DerechaPeque', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../../assets/icons/finales/FlechaDerechaPequena-icon.svg"));
		this.matIconRegistry.addSvgIcon('iconInfoCircle', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../../assets/icons/finales/InfoCirculo-icon.svg"));
	}

	ngOnInit(): void {
		this.implementarConekta();

		this._route.queryParams.subscribe(params => {
            this.id = params["idPaquete"];
            this.crearModales();
            this.getDataGrid();
			this.obtenerDatosADmin();
        });
	}

	crearModales() {
        if ($('body').find('.modal-confirm').length > 1) {
            $('body').find('.modal-confirm')[1].remove();
        }
        this.modales.modalConfirm = new bootstrap.Modal($("#modal-confirm").appendTo("body"), {
            backdrop: "static", 
            keyboard: false,
        });

        if ($('body').find('.modal-error').length > 1) {
            $('body').find('.modal-error')[1].remove();
        }
        this.modales.modalError = new bootstrap.Modal($("#modal-error").appendTo("body"), {
            backdrop: "static", 
            keyboard: false,
        });

        if ($('body').find('.modal-confirmGratis').length > 1) {
            $('body').find('.modal-confirmGratis')[1].remove();
        }
        this.modales.modalConfirmGratis = new bootstrap.Modal($("#modal-confirmGratis").appendTo("body"), {
            backdrop: "static", 
            keyboard: false,
        });

        if ($('body').find('.modalFiscal').length > 1) {
            $('body').find('.modalFiscal')[1].remove();
        }
        this.modales.modalFiscal = new bootstrap.Modal($("#modalFiscal").appendTo("body"), {
            backdrop: "static", 
            keyboard: false,
        });

        if ($('body').find('.modal-alert').length > 1) {
            $('body').find('.modal-alert')[1].remove();
        }
        this.modales.modalAlert = new bootstrap.Modal($("#modal-alert").appendTo("body"), {
            backdrop: "static", 
            keyboard: false,
        });

        if ($('body').find('.modal-alertError').length > 1) {
            $('body').find('.modal-alertError')[1].remove();
        }
        this.modales.modalAlertError = new bootstrap.Modal($("#modal-alertError").appendTo("body"), {
            backdrop: "static", 
            keyboard: false,
        });

        if ($('body').find('.modal-succes').length > 1) {
            $('body').find('.modal-succes')[1].remove();
        }
        this.modales.modalSuccess = new bootstrap.Modal($("#modal-succes").appendTo("body"), {
            backdrop: "static", 
            keyboard: false,
        });
    }

    // ------------------------------------------------------------------------------------------- //
    // --------------------------------------- METODO DE PAGO ------------------------------------ //
    // ------------------------------------------------------------------------------------------- //

	// ------------------------------------------------------------------------------------------- //
    // ----------------------------------- DECLARACIÓN DE VARIABLES ------------------------------ //
	metodoPago: any = {
		mes: null,
		agno: null,
		CCV: "",
		numeroTarjeta: "",
		nombre: "",
		email: "",
		idOpcionPaquete: "",
		numeroTicket: 0,
		clabe: 0,
		correoAdmin: "",
		mesesSelect: [{ mes: "01", id: 1 }, { mes: "02", id: 1 }, { mes: "03", id: 1 }, { mes: "04", id: 1 }, { mes: "05", id: 1 }, { mes: "06", id: 1 }, { mes: "07", id: 1 }, { mes: "08", id: 1 }, { mes: "09", id: 1 }, { mes: "10", id: 1 }, { mes: "11", id: 1 }, { mes: "12", id: 1 }],
		agnoSelect: [{ agno: "16" }, { agno: "17" }, { agno: "18" }, { agno: "19" }, { agno: "20" }, { agno: "21" }, { agno: "22" }, { agno: "23" }, { agno: "24" }, { agno: "25" }, { agno: "26" }, { agno: "27" }, { agno: "28" }, { agno: "29" }, { agno: "30" }],
		activarPayPal: false,
		activarBanorte: false,
		aceptaTerminos: false
	};
	tipoPantalla = this.metodoPagoTranslate.metodoPago;
	activo = 0;
	id: any = "";
	precio: any = -5;
	tipoMoneda: any = {};
	nombre: any = "";
	suscripcion: any = false;
	cantidadMeses: any = 0;
	duracion: any = 0;
	idPaquete: any = 0;
	cantidadOpciones = [];
	minimoDias: any = "";
	maximoDias: any = "";
	banco: any = "";
	beneficiario: any = "";
	referencia: any = "";
	cuenta: any = "";
	precioConIva: any = 0.00;
	precioConComision: any = 0.00;
	precioConDescuentoSinC: any = 0.00;
	precioSinIva: any = 0.00;
	precioBanco: any = 0.00;
	IVA = 0.00;
	Comision: any = 0.00;
	precioTotal: any = 0.00;
	precioDescuento: any = "";
	descuentoCambio: any = "";
	mensajeErrorMesAngo = "";
	texto: any;
	idEmpresa: any;
	esPrueba: any;
	dataGrid: any;
	promocion: any = [{
		descripcion: "",
		fechaFin: "",
		fechaInicio: "",
		idDescuentoTipo: "",
		idPromocionAdmin: 0,
		paquete: "",
		valor: null
	}];
	paramsNotifi9 = { life: 2000, theme: "ruby", sticky: false };

	// Stripe
    checkout: any;
    checkoutInfo: any;
    tarjetas: any = [];
    tarjetaSeleccionada: any;
    isNuevaTarjeta: any = false;
    mensajes: any = {};

    // Activar Suspcripcion
    esSuscripcion: boolean = true;
    deshabilitarSuspcripcion: boolean = false;

	// ------------------------------------------------------------------------------------------- //
    // -------------------------------------- DECLARACIÓN DE FUNCIONES --------------------------- //
	alertMessage(message: any) {
		this.modales.modalAlert.show();
		$("#modal-alert .modal-body").html('<span class="title">' + message + '</span>');
	}

	successMessage(message: any) {
		this.modales.modalSuccess.show();
		$("#modal-succes .modal-body").html('<span class="title">' + message + '</span>');
	}

	alertError(message: any) {
		this.modales.modalAlertError.show();
		$("#modal-alertError .modal-body").html('<span class="title">' + message + '</span>');
	}

	getMonedaBase() {
		this._backService.HttpPost("procesos/suscripcion/Suscripcion/getMonedaBase", {}, {}, 'text').subscribe((response: string) => {
            this.tipoMoneda = response;
			this.getDescuentoCambio();
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

	setActivo(valor: any) {
		if (this.metodoPago.aceptaTerminos) {
            this.deshabilitarSuspcripcion = false;
			this.activo = valor;

			// Se elimina el checkout si es que existe
			if(this.checkout){
				if(!this.checkout.embeddedCheckout.isDestroyed){
					this.checkout.destroy();
				}
			}

			// Si es pago con tarjeta se hace la inicialización de stripe
			if(this.activo == 1){
                this.deshabilitarSuspcripcion = true;
				this.initializeStripe();
			}			
		} else {
			this.activo = 0;
			this._toaster.error("Por favor marque que ha leído los términos y condiciones para proceder.");
		}
	}

	cambioSuscripcion() {
		this._pantallaServicio.mostrarSpinner();
		var params: any = {};
		params.idPaquete = this.id;
		params.idOpcionPaquete = this.metodoPago.idOpcionPaquete;

		this._backService.HttpPost("procesos/suscripcion/Suscripcion/getMonedaBase", {}, params).subscribe((response: string) => {
            this.texto = eval(response);
			if (this.texto == "0") {
				this._pantallaServicio.ocultarSpinner();
				this._router.navigate(["/confirmacionPago"]);
			} else {
				this._pantallaServicio.ocultarSpinner();
				this.modales.modalError.show();
			}
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

	_window(): any {
		// return the global native browser window object
		return window;
	}

	pagoTarjeta() {
		if (this.metodoPago.CCV.length <= 4 && this.metodoPago.numeroTarjeta.length <= 16 && (this.metodoPago.mes != '' || this.metodoPago.mes != null) && this.metodoPago.agno != '') {
			$("#btnGuardar").addClass("disabled");
			this._pantallaServicio.mostrarSpinner();

			//this._window().Conekta.setPublicKey('key_NS4kKEKhW5H5ltBZbpg2lhU'); // Modo Pruebas
			//this._window().Conekta.setPublicKey("key_dfMMBv86vSYvMf4NBSnYwYg"); // Modo Producción
			this._window().Conekta.setPublicKey(environment.conektaPublicKey);

			var successResponseHandler = ((token: any) => {
				//Se crea un arreglo que mandará la información necesaria para que se procese en el backend lo de conekta
				var conektaParams: any = {};
				conektaParams.token = token.id;
				conektaParams.name = this.metodoPago.nombre;
				conektaParams.email = this.metodoPago.email;
				conektaParams.idPaquete = this.id;
				conektaParams.idOpcionPaquete = this.metodoPago.idOpcionPaquete;
				conektaParams.precioTotal = this.precioTotal;
		
				this._backService.HttpPost("procesos/suscripcion/Suscripcion/pagoTarjeta", {}, conektaParams).subscribe((response: string) => {
					this.texto = response;
					//AÑADIR EN LOS ERRORES EL MENSAJE QUE TRAIGA DEL WS
					if (this.texto.includes("[ERROR]:")) {
						$("#btnGuardar").removeClass("disabled");
						this._pantallaServicio.ocultarSpinner();
						this.alertMessage(this.texto);
					} else {
						$("#btnGuardar").removeClass("disabled");
						this._pantallaServicio.ocultarSpinner();
						this.successMessage(this.texto);
					}
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
					/*this.texto = eval(error); DUDA
					this._pantallaServicio.ocultarSpinner();
					this.alertMessage(error);*/
				});
			});

			//Muestra el modal de error en caso de que falle la verificación
			var errorResponseHandler = ((error: any) => {
				//$("#btnGuardar").removeClass("disabled");
				this._pantallaServicio.ocultarSpinner();
				this.alertMessage(error.message_to_purchaser);
			});

			var tokenParams = {
				"card": {
					"number": this.metodoPago.numeroTarjeta,
					"name": this.metodoPago.nombre,
					"exp_year": "20" + this.metodoPago.agno,
					"exp_month": this.metodoPago.mes,
					"cvc": this.metodoPago.CCV
				}
			};
			this._window().Conekta.Token.create(tokenParams, successResponseHandler, errorResponseHandler);
		}
	}

	validarPayPal(variable: any) {
		// var params: any = {};
		// params.idPaquete = this.id;
		// params.idEmpresa = this.idEmpresa;
		// if (variable == false) {
		// 	params.tipoPago = 0;
		// } else {
		// 	params.tipoPago = 1;
		// }
		// params.idOpcionPaquete = this.metodoPago.idOpcionPaquete;

		// this._backService.HttpPost("procesos/suscripcion/Suscripcion/pagoPayPal", {}, params).subscribe((response: string) => {
        //     var form = document.createElement("form");
		// 	form.setAttribute("method", "POST");
		// 	var data = eval(response);
		// 	for (var key in data) {
		// 		if (data.hasOwnProperty(key)) {
		// 			var hiddenField = document.createElement("input");
		// 			hiddenField.setAttribute("type", "hidden");
		// 			hiddenField.setAttribute("name", data[key].Nombre);
		// 			hiddenField.setAttribute("value", data[key].Valor);
		// 			form.appendChild(hiddenField);
		// 		}
		// 	}
		// 	var param: any = {};
		// 	param.codigo = "WADMINESPMODPA";

		// 	this._backService.HttpPost("procesos/suscripcion/Suscripcion/getInfoAdmin", {}, params).subscribe((response: string) => {
		// 		this.esPrueba = eval(response);
		// 		if (this.esPrueba[0].valor == "1") {
		// 			form.setAttribute("action", "https://www.sandbox.paypal.com/cgi-bin/webscr");
		// 		} else {
		// 			form.setAttribute("action", "https://www.paypal.com/cgi-bin/webscr");
		// 		}
		// 		document.body.appendChild(form);
		// 		form.submit();
		// 	}, 
		// 	(error) => {
		// 		this._pantallaServicio.ocultarSpinner();
		// 		if (error == 'SinSesion' || error == 'SesionCaducada') {
		// 			if (error == 'SinSesion') {
		// 			this._toaster.error(this.sessionTraslate.favorIniciarSesion);
		// 			}
		// 			if (error == 'SesionCaducada') {
		// 			this._toaster.error(this.sessionTraslate.sesionCaducada);
		// 			}
		// 			this._router.navigate(['/login']);
		// 			return;
		// 		}
		// 	});
        // }, 
        // (error) => {
        //     this._pantallaServicio.ocultarSpinner();
        //     if (error == 'SinSesion' || error == 'SesionCaducada') {
        //         if (error == 'SinSesion') {
        //         this._toaster.error(this.sessionTraslate.favorIniciarSesion);
        //         }
        //         if (error == 'SesionCaducada') {
        //         this._toaster.error(this.sessionTraslate.sesionCaducada);
        //         }
        //         this._router.navigate(['/login']);
        //         return;
        //     }
        // });
	}

	getDataGrid() {
		this._pantallaServicio.mostrarSpinner();
		var param: any = {};
		param.idPaquete = this.id;

		this._backService.HttpPost("procesos/suscripcion/Suscripcion/getPaquetes", {}, param).subscribe((response: string) => {
            this.dataGrid = eval(response);
			this.metodoPago.activarPayPal = this.dataGrid[0].activarPayPal == 'True'? true : false;
			this.metodoPago.activarBanorte = this.dataGrid[0].activarBanorte == 'True'? true : false;
			this.precio = this.dataGrid[0].monto;
			this.nombre = this.dataGrid[0].nombre;

			//Buscamos el id de la empresa
			this._backService.HttpPost("procesos/suscripcion/Suscripcion/getIdEmpresa", {}, {}).subscribe((response: string) => {
				this.idEmpresa = eval(response);

				//Buscar promociones
				this._backService.HttpPost("procesos/suscripcion/Suscripcion/validarPromocion", {}, {}).subscribe((response: string) => {
					this.promocion = eval(response);
					this.getMonedaBase();
					this.getInfoFiscal();
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

			//Buscamos las opciones de un paquete
			param = {};
			param.idPaquete = this.id;
			param.idPaqueteOpcionesPago = null;

			this._backService.HttpPost("procesos/suscripcion/Suscripcion/getOpcionesPaquete", {}, param).subscribe((response: string) => {
				this.metodoPago.cantidadOpciones = eval(response);
				//this.metodoPago.cantidadOpciones[0].idPaqueteOpcionesPago = null;                                    
				for (var x = 0; x < this.metodoPago.cantidadOpciones.length ; x++) {
					if (x == 0) {
						this.metodoPago.cantidadOpciones[x].duracionOriginal = this.metodoPago.cantidadOpciones[x].duracion;
						this.metodoPago.cantidadOpciones[x].duracion = this.metodoPago.cantidadOpciones[x].duracion + " " + this.metodoPagoTranslate.mes;
					} else {
						this.metodoPago.cantidadOpciones[x].duracionOriginal = this.metodoPago.cantidadOpciones[x].duracion;
						this.metodoPago.cantidadOpciones[x].duracion = this.metodoPago.cantidadOpciones[x].duracion + " " + this.metodoPagoTranslate.meses;
					}
				}
				this.metodoPago.idOpcionPaquete = this.metodoPago.cantidadOpciones[0].idPaqueteOpcionesPago;
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

	getDescuentoCambio() {
		var param: any = {};
		param.idPaquete = this.id;

		this._backService.HttpPost("procesos/suscripcion/Suscripcion/getDescuentoCambio", {}, param).subscribe((response: string) => {
            this.descuentoCambio = eval(response).toFixed(2);

			$("#cuerpo").show();
			//this._pantallaServicio.ocultarSpinner();
			this.getPrecioOpcion();
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

	getPrecioOpcion() {
		this._pantallaServicio.mostrarSpinner();
		setTimeout(() => {
			var param: any = {};
			param.idPaquete = this.id;
			param.idOpcionPaquete = this.metodoPago.idOpcionPaquete;

			this._backService.HttpPost("procesos/suscripcion/Suscripcion/getPrecioOpcion", {}, param).subscribe((response: string) => {
				if (this.metodoPago.idOpcionPaquete != null) {
					var infoTemp = eval(response);
					if(infoTemp.length != 0 && infoTemp != undefined){
						//Precio sin Iva del paquete
						this.precioSinIva = (infoTemp[0].costo.toFixed(2) / 1.16).toFixed(2);
						//Calcula el IVA
						this.IVA = this.precioSinIva * 0.16;
						//Comision Conekta
						this.Comision = ((((infoTemp[0].costo - Number(this.descuentoCambio)) * 0.029) + 2.5) * 1.16).toFixed(2);
						//Precio sin comision
						this.precioConIva = parseFloat(infoTemp[0].costo.toFixed(2)).toFixed(2);
						//Precio con descuento sin comision
						this.precioBanco = Number(this.precioConIva) - Number(this.descuentoCambio);
						//Precio con Comision del paquete
						this.precioConComision = parseFloat(infoTemp[0].costo.toFixed(2)) + Number(this.Comision);
						//Precio total con comision
						this.precioTotal = Number(this.precioConIva) - Number(this.descuentoCambio) + Number(this.Comision);
						this.precioTotal = this.precioTotal.toFixed(2)
	
						this.duracion = infoTemp[0].duracion;
					}
				} else {
					this.precioTotal = (eval(response.replace(",", "."))).toFixed(2);
					this.duracion = 1;
				}
				if (typeof this.promocion != "undefined") {
					if (this.promocion[0].idDescuentoTipo == 1) {
						this.precioDescuento = this.precioConComision - this.promocion[0].valor;
					} else {
						this.precioDescuento = this.precioConComision - (this.precioConComision * (this.promocion[0].valor / 100));
					}
					this.precioDescuento = this.precioDescuento.toFixed(2);
				} else {
					this.precioDescuento = this.precioConComision;
				}
				if (typeof this.precioConComision == "undefined") {
					this.precioTotal = "0.00";
					this.precioDescuento = "0.00";
				}
				if (this.duracion <= 6) {
					$("#idRecurrente").show();
					$("#idRecurrente2").show();
				} else {
					$("#idRecurrente").hide();
					$("#idRecurrente2").hide();
				}

				this.reiniciarTerminosCondiciones();
				this.generarTicket();
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
		},1000);
	}

	getInfoFiscal() {
		// Información para depósito
		var param: any = {};
		param.codigo = "WADMINPMNOMBAN";
		this._backService.HttpPost("procesos/suscripcion/Suscripcion/getInfoAdmin", {}, param).subscribe((response: string) => {
            this.banco = eval(response);
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

		var param: any = {};
		param.codigo = "WADMINPMNOMBEN";
		this._backService.HttpPost("procesos/suscripcion/Suscripcion/getInfoAdmin", {}, param).subscribe((response: string) => {
            this.beneficiario = eval(response);
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

		var param: any = {};
		param.codigo = "WADMINPMNUMREFE";
		this._backService.HttpPost("procesos/suscripcion/Suscripcion/getInfoAdmin", {}, param).subscribe((response: string) => {
            this.referencia = eval(response);
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

		var param: any = {};
		param.codigo = "WADMINPMNUMCUEN";
		this._backService.HttpPost("procesos/suscripcion/Suscripcion/getInfoAdmin", {}, param).subscribe((response: string) => {
            this.cuenta = eval(response);
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

		//Obtenemos el minimo y maximo dias de activación
		var param: any = {};
		param.codigo = "WADMINMINHABSUS";
		this._backService.HttpPost("procesos/suscripcion/Suscripcion/getInfoAdmin", {}, param).subscribe((response: string) => {
            this.minimoDias = eval(response);
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

		var param: any = {};
		param.codigo = "WADMINMAXHABSUS";
		this._backService.HttpPost("procesos/suscripcion/Suscripcion/getInfoAdmin", {}, param).subscribe((response: string) => {
            this.maximoDias = eval(response);
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

	validarForm() {
		var errorT = false;
		var errorM = false;
		var errorA = false;
		var errorC = false;
		var errorN = false;
		var errorE = false;

		if (this.metodoPago.nombre == "" || this.metodoPago.nombre == null) {
			$("#nombre").addClass('errorCampo');
			$("#errorNombre").show();
			errorN = true;
		} else {
			$("#nombre").removeClass('errorCampo');
			$("#errorNombre").hide();
			errorN = false;
		}
		if (this.metodoPago.email == "" || this.metodoPago.email == null || this.validarEmail(this.metodoPago.email) == false) {
			$("#email").addClass('errorCampo');
			$("#errorMail").show();
			errorE = true;
		} else {
			$("#email").removeClass('errorCampo');
			$("#errorMail").hide();
			errorT = false;
		}
		if (this.metodoPago.numeroTarjeta.length > 16 || this.metodoPago.numeroTarjeta.length == 0) {
			$("#numeroTarjeta").addClass('errorCampo');
			$("#errorTarjeta").show();
			errorT = true;

		} else {
			$("#numeroTarjeta").removeClass('errorCampo');
			$("#errorTarjeta").hide();
			errorT = false;
		}

		if (this.metodoPago.mes == null) {
			errorM = true;
			$("#mesSelect").addClass('errorCampo');
		} else {
			$("#mesSelect").removeClass('errorCampo');
			errorM = false;
		}

		if (this.metodoPago.agno == null) {
			errorA = true;
			$("#agnoSelect").addClass('errorCampo');
		} else {
			$("#agnoSelect").removeClass('errorCampo');
			errorA = false;
		}

		if (errorM == false && errorA == false) {
			$("#errorMesAgno").hide();
		}

		if (errorM == true && errorA == false) {
			this.mensajeErrorMesAngo = this.metodoPagoTranslate.seleccioneMes;
			$("#errorMesAgno").show();
		}

		if (errorM == false && errorA == true) {
			this.mensajeErrorMesAngo = this.metodoPagoTranslate.seleccioneAnio;
			$("#errorMesAgno").show();
		}

		if (errorM == true && errorA == true) {
			this.mensajeErrorMesAngo = this.metodoPagoTranslate.seleccioneMesAnio;
			$("#errorMesAgno").show();
		}

		if (this.metodoPago.CCV.length > 4 || this.metodoPago.CCV.length == 0) {
			errorC = true;
			$("#CCVInput").addClass('errorCampo');
			$("#errorCCV").show();
		} else {
			$("#CCVInput").removeClass('errorCampo');
			errorC = false;
			$("#errorCCV").hide();
		}

		if (errorT == false && errorM == false && errorA == false && errorC == false && errorN == false && errorE == false) {
			this.modales.modalConfirm.show();
		}
	};

	validarEmail(email: any) {
		var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return re.test(email);
	}

	//Modal para la confirmación del pago con tarjeta.
	confirm() {
		this.modales.modalConfirm.show();
	};

	cerrarModal(param: any) {
		var cerrar = "#" + param;
		$(cerrar).modal('hide');
	};

	//Modal para la confirmación del cambio a un paquete gratis
	confirmGratis() {
		this.modales.modalConfirmGratis.show();
	};

	generarTicket() {
		// Se aceptan los terminos y condiciones
		if(this.metodoPago.aceptaTerminos){
			if (this.metodoPago.idOpcionPaquete != '') {
				this.metodoPago.mostrarPagos = true; //Le muestra los pagos
				var params: any = {};
				params.idPaqueteOpcionesPago = this.metodoPago.idOpcionPaquete;
	
				this._backService.HttpPost("procesos/suscripcion/Suscripcion/buscarTicket", {}, params).subscribe((response: string) => {
					if (response == '0') {//No existe, hay que hacerle uno nuevo
						var params: any = {};
						params.idPaqueteOpcionesPago = this.metodoPago.idOpcionPaquete;
						params.descripcion = "Ticket"; //máximo 20 caracteres
	
						this._backService.HttpPost("procesos/suscripcion/Suscripcion/crearTicket", {}, params).subscribe((response: string) => {
							var params: any = {};
							params.idPaqueteOpcionesPago = this.metodoPago.idOpcionPaquete;
	
							this._backService.HttpPost("procesos/suscripcion/Suscripcion/buscarTicket", {}, params).subscribe((response: string) => {
								this.metodoPago.numeroTicket = (response + 1100);
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
					} else {//Quiere decir que ya existe y hay que hacer un update
						this.metodoPago.numeroTicket = (response + 1100);
						var params: any = {};
						params.idPaqueteOpcionesPago = this.metodoPago.idOpcionPaquete;
						params.idEmpresaTicket = response; //Ticket que hay que modificar
	
						this._backService.HttpPost("procesos/suscripcion/Suscripcion/modificarTicket", {}, params).subscribe((response: string) => {
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
		}

		// Se quita la aceptación de terminos y condiciones
		if (!this.metodoPago.aceptaTerminos) {
			this.metodoPago.mostrarPagos = false;
			this._pantallaServicio.ocultarSpinner();
		}

		// Reiniciar pagos
		this.reiniciarPagos();
	};

	validarDatosfiscales() {
		// if ($('#checkFactura').attr('checked')) {
		if (this.metodoPago.requiereFactura == 1) {
			this._backService.HttpPost("configuracion/configuracionSucursal/cargarInformacionFiscalSucursal", {}, {}).subscribe((response: string) => {
				if (eval(response).length > 0) {
					var datosFiscales = eval(response);
					this.metodoPago.requiereFactura = true;
				} else {
					this.modales.modalFiscal.show();
					this.metodoPago.requiereFactura = false;
				}
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
	};

	obtenerDatosADmin() {
		var param: any = {};
		param.codigo = "WADMINPMCLABE";

		this._backService.HttpPost("procesos/suscripcion/Suscripcion/getInfoAdmin", {}, param).subscribe((response: string) => {
			this.metodoPago.clabe = eval(response)[0].valor;
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

		var param: any = {};
		param.codigo = "WADMINMAILADMIN";
		
		this._backService.HttpPost("procesos/suscripcion/Suscripcion/getInfoAdmin", {}, param).subscribe((response: string) => {
            this.metodoPago.correoAdmin = eval(response)[0].valor;
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
	};

	cerrarModalFiscal() {
		$('#checkFactura').attr('checked', false);
		this.modales.modalFiscal.hide();
	};

	prueba() {
		this._backService.HttpPost("procesos/suscripcion/Suscripcion/cargarPdfTC", {}, {}).subscribe((response: string) => {
            var data = eval(response);
			window.open(environment.URL + 'handler?idTerminosCondiciones=' + data[0].valor);
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

	avisoPrueba() {
		this._backService.HttpPost("procesos/suscripcion/Suscripcion/cargarPdfAP", {}, {}).subscribe((response: string) => {
            var data = eval(response);
			window.open(environment.URL + 'handler?idTerminosCondiciones=' + data[0].valor);
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

	pagoExitoso() {
		this.modales.modalSuccess.hide();
		this._router.navigate(['/procesos/agenda']);
	}

	irAAgenda(){
        this._router.navigate(['/procesos/agenda']);
    }

	irASuscripcion(){
        this._router.navigate(['/procesos/suscripcion']);
    }

	validarNum(e: any) {
        var key;
        if (window.event) // IE
        {
            key = e.keyCode;
        }
        else if (e.which) // Netscape/Firefox/Opera
        {
            key = e.which;
        }
        if (key < 48 || key > 57) {
            if (key == 8) // Detectar backspace (retroceso)
            {
                return true;
            }
            else {
                return false;
            }
        }
        return true;
    }

	implementarConekta () {
		const script = document.createElement('script')
		script.src = 'https://cdn.conekta.io/js/latest/conekta.js'
		script.async = true
		document.body.appendChild(script);
	}

	// ---------------------------------- STRIPE ----------------------------------
	reiniciarTerminosCondiciones(){
		this.metodoPago.aceptaTerminos = false;
	}

	reiniciarPagos(){
		this.setActivo(0);
	}

	// -- Inicialización -- 
	async initializeStripe() {
		this._pantallaServicio.mostrarSpinner();

		// Obtención de la duración del paquete
		var duracion = 0;
		for(var i = 0; i < this.metodoPago.cantidadOpciones.length; i++){
			var opcion = this.metodoPago.cantidadOpciones[i];

			if(opcion.idPaqueteOpcionesPago == this.metodoPago.idOpcionPaquete){
				duracion = opcion.duracionOriginal;
			}
		}

        var params: any = {
            idEmpresa: this._pantallaServicio.session.idEmpresa,
			idSucursal: this._pantallaServicio.session.idSucursal,
			idUsuarioSucursal: this._pantallaServicio.session.idUsuarioSucursal,
			nombreUsuario: this._pantallaServicio.session.nUsuario,

            moneda: "mxn", 					// moneda base
            monto: this.precioBanco,  		// precio banco
			nombrePaquete: this.nombre, 	// nombre del paquete
			duracionPaquete: duracion,
            esSuscripcion: this.esSuscripcion ? "1" : "0", // enviamos el parametro de saber si es una Suspcripcion
        };
        
        this._backService.HttpPost("stripe/Stripe/StripeProcesoPago", {}, params).subscribe(async (response: any) => {
            switch(response.codigo){
                case 1: 
                    // Se creo un checkout
                    this.tarjetas = [];

                    this.checkoutInfo = {
                        pk: response.pk,
                        id: response.checkout_id,
                        clientSecret: response.checkout_cs
                    }

                    const clientSecret = this.checkoutInfo.clientSecret;
                    const stripe = Stripe(this.checkoutInfo.pk);

                    this.checkout = await stripe.initEmbeddedCheckout({
                        clientSecret,
						onComplete: () => this.pagoConStripe()
                    });

                    // Mount Checkout
                    this.checkout.mount('#checkoutStripe');
                    break;

                case 2:
                    // El usuario ya tenía tarjetas registradas
                    this.tarjetas = response.tarjetas;
                    break;
                    
                default:
                    // Hubo un error
                    this._toaster.error(response.descripcion);
                    break;
            }

           this._pantallaServicio.ocultarSpinner();
        });
    }

	pagoConStripe() { 
		// Destroy Checkout instance
		this._pantallaServicio.mostrarSpinner();
		this.checkout.destroy();

		var duracion = 0;
		for(var i = 0; i < this.metodoPago.cantidadOpciones.length; i++){
			var opcion = this.metodoPago.cantidadOpciones[i];

			if(opcion.idPaqueteOpcionesPago == this.metodoPago.idOpcionPaquete){
				duracion = opcion.duracionOriginal;
			}
		}

		// Mandar llamar función del back para el guardado de la información de la suscripción o pago
		var params: any = {};
		params.idPaquete = this.id;
		params.idOpcionPaquete = this.metodoPago.idOpcionPaquete;
		params.precioTotal = this.precioBanco;
		params.duracionPaquete = duracion;

		params.CheckoutId = this.checkoutInfo.id;
		params.esSuscripcion = this.esSuscripcion ? "1" : "0";

		this._backService.HttpPost("procesos/suscripcion/Suscripcion/pagoTarjetaStripe", {}, params).subscribe((response: string) => {
			this.texto = response;
			//AÑADIR EN LOS ERRORES EL MENSAJE QUE TRAIGA DEL WS
			if (this.texto.includes("[ERROR]:")) {
				$("#btnGuardar").removeClass("disabled");
				this.alertMessage(this.texto);
			} else {
				$("#btnGuardar").removeClass("disabled");
				this.successMessage(this.texto);
			}

			this._pantallaServicio.ocultarSpinner();
		}, 
		(error) => {
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
			this._pantallaServicio.ocultarSpinner();
		});
	}

}
