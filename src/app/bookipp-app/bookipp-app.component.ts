import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { PantallaService } from '../core/services/pantalla.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ToasterService } from 'src/shared/toaster/toaster.service';
declare var $: any; // JQUERY
import moment from 'moment';
import * as bootstrap from 'bootstrap'; // BOOTSTRAP
import { BookippAppService } from './bookipp-app.service';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { loadScript } from "@paypal/paypal-js";
import { environment } from 'src/environments/environment';

@Component({
	selector: 'app-bookipp-app',
	templateUrl: './bookipp-app.component.html',
	styleUrls: ['./bookipp-app.component.scss', '../page/page.component.scss']
})
export class BookippAppComponent implements OnInit {
	// Variable de translate de sucursal
	bookippAppTranslate: any = {};
	agendaTranslate: any = {};
	equiposTranslate: any = {};

	email: any = "";
	t: any = "";

	// Modales
	modales: any = {};

	textModalAlert: any = "";
	textModalCitaAgendada: any = "";

	//Variable Paypal
	paypal: any = null;

	constructor(
		private _backService: BookippAppService,
		private _translate: TranslateService,
		private _pantallaServicio: PantallaService,
		private _toaster: ToasterService,
		private _router: Router,
		private _route: ActivatedRoute,
		private matIconRegistry: MatIconRegistry,
		private domSanitizer: DomSanitizer
	) {
		const userLang = (navigator.language).toLocaleLowerCase();
		let lang = userLang.substring(0, 2) == 'en' ? 'en-us' : 'es-mx';

		this._translate.setDefaultLang(lang);
		this._translate.use(lang);

		this._translate.get('bookippAppTranslate').subscribe((translated: string) => {
			this.bookippAppTranslate = this._translate.instant('bookippAppTranslate');
			this.agendaTranslate = this._translate.instant('agendaTranslate');
			this.equiposTranslate = this._translate.instant('equiposTranslate');
		});

		this.matIconRegistry.addSvgIcon('iconSearch', this.domSanitizer.bypassSecurityTrustResourceUrl("../../assets/icons/finales/Buscar-icon.svg"));
		this.matIconRegistry.addSvgIcon('iconCheck', this.domSanitizer.bypassSecurityTrustResourceUrl("../../assets/icons/finales/timeClose.svg"));
		this.matIconRegistry.addSvgIcon('iconOutline', this.domSanitizer.bypassSecurityTrustResourceUrl("../../assets/icons/finales/Circulo-icon.svg"));
	}

	ngOnInit(): void {
		this._route.queryParams.subscribe(params => {
			this.email = params["email"];
			this.t = params["t"];

            if(!this.email || this.email === '' || this.email === null){
                this._router.navigate(["/login"]);
            }else{
                this.crearModales();
                this.cargarPantalla();
            }
		});
	}

	// ----------------------- Declaracion de variables ---------------------------

	// Variables de parámetros de la pantalla
	parametros: any = {
		origen: "",
		email: "",
		idFacebook: "",
	};

	// Variables de la empresa
	empresa: any = {
		idEmpresa: "",
		listadoSucursales: [],
		idSucursalSeleccionada: "",
	};

	// Variables de la sucursal seleccionada
	sucursal: any = {
		configuracion: {
			configuracionCompleta: {},
			diasMaximosAgendar: 0,
			elegirCabina: false,
			elegirPersonal: false,
			pagoConPaypal: false,
			idPaypal: "",
			paypalComisionPorCliente: false,
			horaActual: "",
			realizoAlta: "",
			idMetodoPagoSucursalPaypal: "",
			enviarCorreoCitaOnline: false,
		},
		servicios: {
			listadoOriginal: [],
			listadoFiltrado: [],
			listadoMostrado: [],
			textoBusqueda: "",
		},
		personales: {
			listado: [],
			serviciosPorPersonal: [],
		},
		cabinas: {
			listado: [],
			serviciosPorCabina: [],
			idCabinaSeleccionada: "",
			nombreCabinaSeleccionada: "",
		},
		horarioDisponible: {
			diasListado: [],
			horasListado: [],
			mostrarBoton7DiasAnteriores: false,
			mostrarBoton7DiasSiguientes: false,
			diaEstaSeleccionado: false,
			cargaEnProgreso: false,
		},
	};

	// Variables del wizard
	wizard: any = {
		cantidadServicioslimite: 3,
		pasoActual: 1,
		pasoActualEncabezado: 1,
		pasosTotalesEncabezado: 5,
		saltarPasoPersonal: false,
		mostrarBotonesPaso1: false,
		mostrarBotonesPaso2: false,
		mostrarBotonesPaso3: false,
		mostrarBotonesPaso4: false,
		mostrarBotonesPaso5: false,
		mostrarBotonAgendar: false,
		mostrarBotonPaypal: false,
	};

	// Variables de cita
	cita: any = {
		idCita: "",
		fecha: "",
		fechaMostrar: "",
		horaInicio: "",
		horaFin: "",
		servicios: [],
		total: 0,
		subtotalPaypal: 0,
		paypalTotal: 0,
		comisionPaypal: 0,
		cliente: {
			nombre: "",
			correo: "",
			telefono: "",
		}
	};

	// Variables de notificaciones
	notificaciones: any = {
		error: { life: 4000, theme: "ruby", sticky: false }
	};

	citasPermitidas: any = null;

	// ----------------------- Declaracion de funciones ---------------------------

	// ------------------------------------------ Funciones de carga -------------------------------------------
	//Funcion para cargar los modales
	crearModales() {
		if ($('body').find('.modalAlert').length > 1) {
			$('body').find('.modalAlert')[1].remove();
		}
		this.modales.modalAlert = new bootstrap.Modal(
			$('#modalAlert').appendTo('body'), { backdrop: 'static', keyboard: false, }
		);

		if ($('body').find('.modalCitaAgendada').length > 1) {
			$('body').find('.modalCitaAgendada')[1].remove();
		}
		this.modales.modalCitaAgendada = new bootstrap.Modal(
			$('#modalCitaAgendada').appendTo('body'), { backdrop: 'static', keyboard: false, }
		);
	}

	cargarPantalla() {
		this._pantallaServicio.mostrarSpinner();
		this.obtenerParametrosPantalla();
		this.consultarSucursales();
	}

	obtenerParametrosPantalla() {
		switch (this.t) {
			case '1':
				this.parametros.origen = 'facebook';
				break;

			case '2':
				this.parametros.origen = 'webc';
				break;

			default:
				this.parametros.origen = 'facebook';
				break;
		}
		this.parametros.email = this.email;
	}

	consultarSucursales() {
		// Se verifica de que plataforma se está ingresando (si no trae correo es facebook)
		if (this.parametros.email) {
			let params: any = {};
			params.email = this.parametros.email;

			this._backService.HttpPost("Facebook/Facebook/consultarEmpresa", {}, params).subscribe(
				response => {
					let dataTemp = eval(response);
					if (dataTemp == "0") {
						this.mostrarMensajeEmpresaError(this.bookippAppTranslate.modalEmpresa);
						this._pantallaServicio.ocultarSpinner();
					}
					else {
						this.empresa.idEmpresa = dataTemp;
						let paramsSucursales: any = {};
						paramsSucursales.idEmpresa = this.empresa.idEmpresa;

						this._backService.HttpPost("Facebook/BookippApp/obtenerListaSucEmpresa", {}, paramsSucursales).subscribe(
							response => {
								this.empresa.listadoSucursales = eval(response);

								if (this.empresa.listadoSucursales.length == 1) {
									this.empresa.idSucursalSeleccionada = this.empresa.listadoSucursales[0].idSucursal;
									this.consultarInformacionSucursal();
								}
								else {
									this._pantallaServicio.ocultarSpinner();
								}
							},
							error => {
								this._pantallaServicio.ocultarSpinner();
							}
						);
					}
				},
				error => {
					this._pantallaServicio.ocultarSpinner();
					this.mostrarMensajeEmpresaError(this.bookippAppTranslate.modalFacebook);
				}
			);
		}
		else {
			// Si viene por parte de facebook se consultan las sucursales de la empresa en base al id de Facebook
			this.parametros.origen = 'facebook';
			this._backService.HttpPost("Facebook/wsFacebook.asmx/GetID", {}, {}).subscribe(
				response => {
					this.parametros.idFacebook = response;
					let params: any = {};
					params.idFb = this.parametros.idFacebook;

					this._backService.HttpPost("Facebook/BookippApp/selectSucursalesFB", {}, params).subscribe(
						response => {
							this.empresa.listadoSucursales = eval(response);

							if (this.empresa.listadoSucursales.length == 1) {
								this.empresa.idSucursalSeleccionada = this.empresa.listadoSucursales[0].idSucursal;
								this.consultarInformacionSucursal();
							}
							else {
								this._pantallaServicio.ocultarSpinner();
							}
						},
						error => {
							this._pantallaServicio.ocultarSpinner();
						}
					);
				},
				error => {
					this.mostrarMensajeEmpresaError(this.bookippAppTranslate.modalFacebook);
					this._pantallaServicio.ocultarSpinner();
				}
			);
		}
	}

	mostrarMensajeEmpresaError(message?: any) {
		this.textModalAlert = message;
		this.modales.modalAlert.show();
	}

	// ----------------------------------------- Funciones de proceso ------------------------------------------
	consultarInformacionSucursal() {
		this._pantallaServicio.mostrarSpinner();
		// Se limpian primero la información general de la sucursal
		this.limpiarDatosSucursal(1);

		let params: any = {};
		params.idSucursal = this.empresa.idSucursalSeleccionada;

		this._backService.HttpPost("Facebook/BookippApp/consultarInformacionSucursal", {}, params).subscribe(
			response => {
				let dataTemp = eval(response);

				// - Cargar configuración de la sucursal elegida
				this.sucursal.configuracion.configuracionCompleta = dataTemp[0];
				for (let i = 0; i < this.sucursal.configuracion.configuracionCompleta.length; i++) {
					let config = this.sucursal.configuracion.configuracionCompleta[i];

					switch (config.codigo) {
						case "WSLIMAGEPOST":
							this.sucursal.configuracion.diasMaximosAgendar = parseInt(config.valor);
							break;

						case "WSSELEPERS":
							this.sucursal.configuracion.elegirPersonal = config.valor == "Si" ? true : false;
							break;

						case "WSSELECABINA":
							this.sucursal.configuracion.elegirCabina = config.valor == "Si" ? true : false;
							break;

						case "WSLIGASPAYPAL":
							this.sucursal.configuracion.pagoConPaypal = config.valor == "1" ? true : false;
							break;

						case "WSIDPAYPAL":
							this.sucursal.configuracion.idPaypal = config.valor;
							break;

						case "WSCLICOMPAYPAL":
							this.sucursal.configuracion.paypalComisionPorCliente = config.valor == "1" ? true : false;
							break;

						case "WSCRECITAONL":
							this.sucursal.configuracion.enviarCorreoCitaOnline = config.valor == "Si" ? true : false;
							break;
					}
				}

				// Cargar paypal
				if (this.sucursal.configuracion.pagoConPaypal) {
					this.agregarSDK();
				}

				// - Generar los días disponibles para agendar en la sucursal
				this.generarHorarioDiasDisponibles();

				//- Cargar servicios de la sucursal
				this.sucursal.servicios.listadoOriginal = dataTemp[1];
				for (let i = 0; i < this.sucursal.servicios.listadoOriginal.length; i++) {
					let serv = this.sucursal.servicios.listadoOriginal[i]; // No se utiliza un angular.copy porque se va a modificar información del registro
					serv.seleccionado = false;
					serv.cantidad = 0;
					serv.listadoPersonal = [];
				}

				// Cargar personales de la sucursal y ligarlos a los servicios correspondientes           
				this.sucursal.personales.serviciosPorPersonal = dataTemp[2];
				let personalAux = "";
				for (let i = 0; i < dataTemp[2].length; i++) {
					let pers = JSON.parse(JSON.stringify(dataTemp[2][i])); // Se utiliza un angular.copy para que ese registro no se ligue a la variable en donde se va a guardar

					if (personalAux != pers.idPersonal) {
						personalAux = pers.idPersonal;
						this.sucursal.personales.listado.push({
							idPersonal: pers.idPersonal,
							nombre: pers.nombre
						});
					}

					for (let j = 0; j < this.sucursal.servicios.listadoOriginal.length; j++) {
						let serv = this.sucursal.servicios.listadoOriginal[j];
						if (serv.idServicio == pers.idServicio) {
							serv.listadoPersonal.push({
								idPersonal: pers.idPersonal,
								nombre: pers.nombre
							});
							j = this.sucursal.servicios.listadoOriginal.length;
						}
					}
				}

				// Cargar cabinas de la sucursal
				this.sucursal.cabinas.serviciosPorCabina = dataTemp[3];
				let cabinaAux = "";
				for (let i = 0; i < dataTemp[3].length; i++) {
					let cab = JSON.parse(JSON.stringify(dataTemp[3][i]));
					if (cabinaAux != cab.idPersonal) {
						cabinaAux = cab.idPersonal;
						this.sucursal.cabinas.listado.push({
							idPersonal: cab.idPersonal,
							nombre: cab.nombre,
							todosServicios: cab.todosServicios == 1 ? true : false
						});
					}
				}

				// Cargar la hora actual de la sucursal
				this.sucursal.configuracion.horaActual = moment(dataTemp[4][0].horaActual);

				// Cargar el usuario admin de la empresa
				this.sucursal.configuracion.realizoAlta = dataTemp[5][0].idUsuarioSucursal;

				// Cargar método de pago paypal
				this.sucursal.configuracion.idMetodoPagoSucursalPaypal = dataTemp[6][0].idMetodoPagoSucursal;

				// Cargar los demás listados de servicios
				this.sucursal.servicios.listadoFiltrado = JSON.parse(JSON.stringify(this.sucursal.servicios.listadoOriginal));
				this.sucursal.servicios.listadoMostrado = JSON.parse(JSON.stringify(this.sucursal.servicios.listadoOriginal));

				// Iniciar proceso del wizard
				this.iniciarWizard(1);

				this._pantallaServicio.ocultarSpinner();
			},
			error => { }
		);
	}

	generarHorarioDiasDisponibles() {
		let inicio = moment();
		let fin = moment().add(this.sucursal.configuracion.diasMaximosAgendar - 1, 'day');

		while (inicio <= fin) {

			let diaAgenda: any = {};

			diaAgenda.diaSemanaNumero = inicio.format('d');
			switch (diaAgenda.diaSemanaNumero) {
				case "1": diaAgenda.diaSemana = "Lun";
					break;
				case "2": diaAgenda.diaSemana = "Mar";
					break;
				case "3": diaAgenda.diaSemana = "Mie";
					break;
				case "4": diaAgenda.diaSemana = "Jue";
					break;
				case "5": diaAgenda.diaSemana = "Vie";
					break;
				case "6": diaAgenda.diaSemana = "Sáb";
					break;
				case "0": diaAgenda.diaSemana = "Dom";
					break;
			}

			diaAgenda.dia = inicio.format('D');

			diaAgenda.mesNumero = inicio.format('M');
			switch (diaAgenda.mesNumero) {
				case "1": diaAgenda.mes = "Enero";
					break;
				case "2": diaAgenda.mes = "Febrero";
					break;
				case "3": diaAgenda.mes = "Marzo";
					break;
				case "4": diaAgenda.mes = "Abril";
					break;
				case "5": diaAgenda.mes = "Mayo";
					break;
				case "6": diaAgenda.mes = "Junio";
					break;
				case "7": diaAgenda.mes = "Julio";
					break;
				case "8": diaAgenda.mes = "Agosto";
					break;
				case "9": diaAgenda.mes = "Septiembre";
					break;
				case "10": diaAgenda.mes = "Octubre";
					break;
				case "11": diaAgenda.mes = "Noviembre";
					break;
				case "12": diaAgenda.mes = "Diciembre";
					break;
			}
			diaAgenda.mesMostrar = (this.sucursal.horarioDisponible.diasListado.length == 0) ? true : (diaAgenda.dia == "1") ? true : false;

			diaAgenda.anio = inicio.format('YYYY');
			diaAgenda.anioMostrar = (this.sucursal.horarioDisponible.diasListado.length == 0) ? true : (diaAgenda.dia == "1" && diaAgenda.mes == "1") ? true : false;

			diaAgenda.fechaCompleta = inicio.format('YYYY-MM-DD');
			diaAgenda.fechaCompletaFormatoEstandar = inicio.format('YYYYMMDD');
			diaAgenda.fechaCompletaFormatoMostrar = inicio.format('DD/MM/YYYY');

			diaAgenda.mostrarDia = (this.sucursal.horarioDisponible.diasListado.length < 7) ? true : false;
			diaAgenda.seleccionado = false;

			this.sucursal.horarioDisponible.diasListado.push(diaAgenda);

			inicio = inicio.add(1, 'day');
		}

		// Mostrar/Ocultar botones
		if (this.sucursal.horarioDisponible.diasListado.length != 0) {
			this.sucursal.horarioDisponible.mostrarBoton7DiasAnteriores = this.sucursal.horarioDisponible.diasListado[0].mostrarDia ? false : true;
			this.sucursal.horarioDisponible.mostrarBoton7DiasSiguientes = this.sucursal.horarioDisponible.diasListado[this.sucursal.horarioDisponible.diasListado.length - 1].mostrarDia ? false : true;
		}
		else {
			this.sucursal.horarioDisponible.mostrarBoton7DiasAnteriores = false;
			this.sucursal.horarioDisponible.mostrarBoton7DiasAnteriores = false;
		}

	}

	consultarHorarioHorasDisponibles(horario?: any) {
		this._pantallaServicio.mostrarSpinner();

		// Se especifica que ya se realizó una selección de día
		this.sucursal.horarioDisponible.diaEstaSeleccionado = true;

		// Se indica que se ocultarán los mensajes si no hay horas disp o no se ha seleccionado día
		this.sucursal.horarioDisponible.cargaEnProgreso = true;

		// Se quita la selección del día anterior seleccionado y se limpian las horas disponibles
		this.limpiarHorarioDiasDisponibles();

		// Se selecciona el día
		horario.seleccionado = true;

		// Limpiar los datos de fecha y horario de la cita, horario y personal de los servicios de cita
		this.limpiarDatosCita(4);

		// Guardar fecha seleccionada como fecha de cita
		this.cita.fecha = horario.fechaCompleta;
		this.cita.fechaMostrar = horario.fechaCompletaFormatoMostrar;

		// Se obtienen los parámetros para consultar las horas disponibles de ese día
		let params: any = {};
		params.sucPersList = [];
		params.fecha = horario.fechaCompleta;

		for (let i = 0; i < this.cita.servicios.length; i++) {
			let elem = JSON.parse(JSON.stringify(this.cita.servicios[i]));
			let obj: any = {};

			if (this.sucursal.configuracion.elegirCabina) {
				if (this.sucursal.cabinas.idCabinaSeleccionada) {
					obj.idPersonal = this.sucursal.cabinas.idCabinaSeleccionada;
				}
				else {
					if (this.sucursal.configuracion.elegirPersonal) {
						if (elem.idPersonalElegido) {
							obj.idPersonal = elem.idPersonalElegido;
						}
						else {
							obj.idPersonal = 0;
						}
					}
					else {
						obj.idPersonal = 0;
					}
				}
			}
			else {
				if (this.sucursal.configuracion.elegirPersonal) {
					if (elem.idPersonalElegido) {
						obj.idPersonal = elem.idPersonalElegido;
					}
					else {
						obj.idPersonal = 0;
					}
				}
				else {
					obj.idPersonal = 0;
				}
			}
			obj.idServicio = elem.idServicio;

			params.sucPersList.push(obj);
		}

		this._backService.HttpPost("procesos/agenda/Agenda/obtenerHorariosDisp", {}, params).subscribe(
			response => {
				// Se recibe un arreglo con las diferentes opciones de los hoarios, cada opción separada en diferentes registros 
				// según los servicios que se enviaron
				let tmpArray = eval(response);

				if (tmpArray.length > 0) {

					let opc = "";
					let elementoOpcion = 1;
					let primerElementoOpcionGuardado = false;
					for (let i = 0; i < tmpArray.length; i++) {
						let elem = tmpArray[i];

						// Se calcula cuando es el primer elemento de la opción y cuando es uno posterior
						if (elem.opcion != opc) {

							elementoOpcion = 1;
							primerElementoOpcionGuardado = false;

							opc = elem.opcion;
						}
						else {
							elementoOpcion++;
						}

						// Se obtiene la fecha del elemento de la opción
						let hms = elem.horaInicio.split(':');
						let horaRealOpcion = moment(this.cita.fecha).set('h', hms[0]).set('m', hms[1]);

						// Se verifica que que sea el primer elemento de la opción
						if (elementoOpcion == 1) {

							// Se verifica que la hora de inicio del elemento sea superior a la hora actual de la sucursal
							if (horaRealOpcion > moment()) {

								// Se guarda la opción en el arreglo de horas disponibles
								this.sucursal.horarioDisponible.horasListado.push({
									opcion: elem.opcion,
									seleccionado: false,
									horaInicio: elem.horaInicio.substring(0, 5),
									horaFin: elem.horaFin.substring(0, 5),
									horario: elem.horaInicio.substring(0, 5) + " - " + elem.horaFin.substring(0, 5),
									detalle: [{
										horaInicio: elem.horaInicio.substring(0, 5),
										horaFin: elem.horaFin.substring(0, 5),
										idPersonal: elem.idPersonal,
										idServicio: elem.idServicio
									}]
								})

								// Se especifica que se guardo el primer elemento de la opción asegurando que todas las horas de inicio de
								// de la opción son mayor a la hora actual de la sucursal
								primerElementoOpcionGuardado = true;
							}

						}

						// Se verifica que sea un elemento posterior al primero de la opción
						if (elementoOpcion > 1) {

							// Se verifica que se haya guardado la primera posición (la hora inicio de la opción sean mayor a la hora actual de la sucursal)
							if (primerElementoOpcionGuardado) {

								// Se actualiza la información del ultimo registro del arreglo de horas disponibles con la información del elemento de la opción
								let horarioDisponibleActualizar = this.sucursal.horarioDisponible.horasListado[this.sucursal.horarioDisponible.horasListado.length - 1];
								horarioDisponibleActualizar.horaFin = elem.horaFin.substring(0, 5);
								horarioDisponibleActualizar.horario = horarioDisponibleActualizar.horaInicio + " - " + horarioDisponibleActualizar.horaFin;
								horarioDisponibleActualizar.detalle.push({
									horaInicio: elem.horaInicio.substring(0, 5),
									horaFin: elem.horaFin.substring(0, 5),
									idPersonal: elem.idPersonal,
									idServicio: elem.idServicio
								});
							}
						}

					}

				}

				// Se indica que se mostrarán los mensajes si no hay horas disp o no se ha seleccionado día
				this.sucursal.horarioDisponible.cargaEnProgreso = false;
				this._pantallaServicio.ocultarSpinner();
			},
			error => { }
		);
	}

	limpiarDatosSucursal(opc?: any) {

		// Se limpian todos los datos de sucursal
		if (opc == 1) {
			this.sucursal.configuracion.configuracionCompleta = {};
			this.sucursal.configuracion.diasMaximosAgendar = 0;
			this.sucursal.configuracion.elegirCabina = false;
			this.sucursal.configuracion.elegirPersonal = false;
			this.sucursal.configuracion.pagoConPaypal = false;
			this.sucursal.configuracion.idPaypal = "";
			this.sucursal.configuracion.paypalComisionPorCliente = false;
			this.sucursal.configuracion.horaActual = "";
			this.sucursal.configuracion.realizoAlta = "";
			this.sucursal.configuracion.idMetodoPagoSucursalPaypal = "";
			this.sucursal.configuracion.enviarCorreoCitaOnline = false;

			this.sucursal.servicios.listadoOriginal = [];
			this.sucursal.servicios.listadoFiltrado = [];
			this.sucursal.servicios.listadoMostrado = [];
			this.sucursal.servicios.textoBusqueda = "";

			this.sucursal.personales.listado = [];
			this.sucursal.personales.serviciosPorPersonal = [];

			this.sucursal.cabinas.listado = [];
			this.sucursal.cabinas.serviciosPorCabina = [];
			this.sucursal.cabinas.idCabinaSeleccionada = null;
			this.sucursal.cabinas.nombreCabinaSeleccionada = "";

			this.sucursal.horarioDisponible.diasListado = [];
			this.sucursal.horarioDisponible.horasListado = [];

			this.sucursal.horarioDisponible.mostrarBoton7DiasAnteriores = false;
			this.sucursal.horarioDisponible.mostrarBoton7DiasSiguientes = false;

			this.sucursal.horarioDisponible.diaEstaSeleccionado = false;
		}

		// Se limpian los datos de la sucursal necesario para reiniciar el wizard 
		// (se queda la configuración de sucursal, se limpian limpian los arreglos de servicios en base al original, se limpia el texto de busqueda de servicios y la cabina seleccionada, 
		// y también se reinicia la selección del horario)
		if (opc == 2) {
			this.sucursal.servicios.listadoFiltrado = JSON.parse(JSON.stringify(this.sucursal.servicios.listadoOriginal));
			this.sucursal.servicios.listadoMostrado = JSON.parse(JSON.stringify(this.sucursal.servicios.listadoOriginal));
			this.sucursal.servicios.textoBusqueda = "";

			this.sucursal.cabinas.idCabinaSeleccionada = null;
			this.sucursal.cabinas.nombreCabinaSeleccionada = "";

			this.reiniciarSeleccionHorarioDisponible();
		}

	}

	limpiarDatosCita(opc?: any) {

		// Inicio/reinicio del wizard
		if (opc == 1) {
			// Limpiar todos los datos de cita
			this.cita.fecha = "";
			this.cita.fechaMostrar = "";
			this.cita.horaInicio = "";
			this.cita.horaFin = "";

			this.cita.servicios = [];
			this.wizard.mostrarBotonesPaso1 = false;

			this.cita.total = 0;
			this.cita.subtotalPaypal = 0;
			this.cita.paypalTotal = 0;
			this.cita.comisionPaypal = 0;

			this.cita.cliente.nombre = "";
			this.cita.cliente.correo = "";
			this.cita.cliente.telefono = "";
			this.wizard.mostrarBotonesPaso4 = false;
		}

		// Cambio de cabina
		if (opc == 2) {
			// Limpiar los datos de fecha y horario de cita, servicios de cita y totales de cita
			this.cita.fecha = "";
			this.cita.fechaMostrar = "";
			this.cita.horaInicio = "";
			this.cita.horaFin = "";

			this.cita.servicios = [];
			this.wizard.mostrarBotonesPaso1 = false;

			this.cita.total = 0;
			this.cita.subtotalPaypal = 0;
			this.cita.paypalTotal = 0;
			this.cita.comisionPaypal = 0;
		}

		// Cambio de servicio
		if (opc == 3) {
			// Limpiar los datos de fecha y horario de la cita, horario y personal de los servicios de cita y totales de cita
			this.cita.fecha = "";
			this.cita.fechaMostrar = "";
			this.cita.horaInicio = "";
			this.cita.horaFin = "";

			for (let i = 0; i < this.cita.servicios.length; i++) {
				let cs = this.cita.servicios[i];
				cs.horaInicio = "";
				cs.horaFin = "";
				cs.idPersonal = "";
			}

			this.cita.total = 0;
			this.cita.subtotalPaypal = 0;
			this.cita.paypalTotal = 0;
			this.cita.comisionPaypal = 0;
		}

		// Cambio de personal o cambio de día del horario disponible
		if (opc == 4) {
			// Limpiar los datos de fecha y horario de la cita, horario y personal de los servicios de cita
			this.cita.fecha = "";
			this.cita.fechaMostrar = "";
			this.cita.horaInicio = "";
			this.cita.horaFin = "";

			for (let i = 0; i < this.cita.servicios.length; i++) {
				let cs = this.cita.servicios[i];
				cs.horaInicio = "";
				cs.horaFin = "";
				cs.idPersonal = "";
			}
		}

		//
		if (opc == 5) {
			// Limpiar solo solo datos de cliente de cita
			this.cita.cliente.nombre = "";
			this.cita.cliente.correo = "";
			this.cita.cliente.telefono = "";
			this.wizard.mostrarBotonesPaso4 = false;
		}

	}

	reiniciarSeleccionHorarioDisponible() {
		// Se quita el dia seleccionado del horario disponible
		for (let i = 0; i < this.sucursal.horarioDisponible.diasListado.length; i++) {
			let elem = this.sucursal.horarioDisponible.diasListado[i];
			elem.seleccionado = false;
			if (i < 7) {
				elem.mostrarDia = true;
			}
			else {
				elem.mostrarDia = false;
			}
		}

		// Se indica que no se ha seleccionado día
		this.sucursal.horarioDisponible.diaEstaSeleccionado = false;

		// Se verifica si se mostraran los botones de los días siguientes o anteriores
		if (this.sucursal.horarioDisponible.diasListado.length != 0) {
			this.sucursal.horarioDisponible.mostrarBoton7DiasAnteriores = this.sucursal.horarioDisponible.diasListado[0].mostrarDia ? false : true;
			this.sucursal.horarioDisponible.mostrarBoton7DiasSiguientes = this.sucursal.horarioDisponible.diasListado[this.sucursal.horarioDisponible.diasListado.length - 1].mostrarDia ? false : true;
		}
		else {
			this.sucursal.horarioDisponible.mostrarBoton7DiasAnteriores = false;
			this.sucursal.horarioDisponible.mostrarBoton7DiasAnteriores = false;
		}

		// Se limpian las horas disponibles
		this.limpiarHorarioHorasDisponibles();
	}

	limpiarHorarioDiasDisponibles() {
		for (let i = 0; i < this.sucursal.horarioDisponible.diasListado.length; i++) {
			let elem = this.sucursal.horarioDisponible.diasListado[i];
			elem.seleccionado = false;
		}

		this.limpiarHorarioHorasDisponibles();
	}

	limpiarHorarioHorasDisponibles() {
		// Se limpia el arreglo de horas disponibles
		this.sucursal.horarioDisponible.horasListado = [];

		this.wizard.mostrarBotonesPaso3 = false;
	}

	calcularCitaTotal() {
		this.cita.total = 0;
		for (let i = 0; i < this.cita.servicios.length; i++) {
			let cs = JSON.parse(JSON.stringify(this.cita.servicios[i]));
			this.cita.total = this.cita.total + Number(cs.costoMinimo);
		}
	}

	calcularCitaPaypalTotal() {
		this.cita.subtotalPaypal = 0;
		this.cita.paypalTotal = 0;
		this.cita.comisionPaypal = 0;

		for (let i = 0; i < this.cita.servicios.length; i++) {
			let cs = JSON.parse(JSON.stringify(this.cita.servicios[i]));
			if (cs.pagoConPaypal) {
				this.cita.subtotalPaypal = this.cita.subtotalPaypal + Number(cs.costoMinimo);
			}
		}

		if (this.sucursal.configuracion.paypalComisionPorCliente) {
			//this.cita.paypalTotal = Number((((1 / 0.0458) * (this.cita.subtotalPaypal + 4.64)) / ((1 / 0.0458) - 1)).toFixed(2));
			this.cita.paypalTotal = Number((((1 / 0.0395) * (this.cita.subtotalPaypal + 4)) / ((1 / 0.0395) - 1)).toFixed(2));
			this.cita.comisionPaypal = ((this.cita.paypalTotal - this.cita.subtotalPaypal).toFixed(2));
		}
		else {
			this.cita.paypalTotal = this.cita.subtotalPaypal;
			this.cita.comisionPaypal = 0;
		}

	}

	// ---------------- Funciones generales del wizard ----------------
	iniciarWizard(opc?: any) {

		// Iniciar wizard (Se manda llamar después de cambiar o seleccionar sucursal)
		if (opc == 1) {

			// * Aquí no se tienen que mandar llamar la función de reiniciar datos de sucursal ya que esta opción se manda
			// llamar después del cambio de una sucursal y ahí se limpian/crean los datos de sucursal

			// Datos del wizard
			this.wizard.pasoActual = 1;
			this.wizard.pasoActualEncabezado = 1;
			this.wizard.saltarPasoPersonal = !this.sucursal.configuracion.elegirPersonal ? true : false;
			this.wizard.pasosTotalesEncabezado = this.wizard.saltarPasoPersonal ? 4 : 5;

			this.wizard.mostrarBotonesPaso1 = false;
			this.wizard.mostrarBotonesPaso2 = false;
			this.wizard.mostrarBotonesPaso3 = false;
			this.wizard.mostrarBotonesPaso4 = false;
			this.wizard.mostrarBotonesPaso5 = false;
			this.wizard.mostrarBotonAgendar = false;
			this.wizard.mostrarBotonPaypal = false;

			// Limpiar todos los datos de la cita
			this.limpiarDatosCita(1);

		}

		// Iniciar wizard (Se manda llamar después de agendar una cita)
		if (opc == 2) {

			// Se reinician solo los datos necesarios de la sucursal (dejando la misma sucursal seleccionada en la cita anterior)
			this.limpiarDatosSucursal(2);

			// Datos del wizard
			this.wizard.pasoActual = 1;
			this.wizard.pasoActualEncabezado = 1;
			this.wizard.saltarPasoPersonal = !this.sucursal.configuracion.elegirPersonal ? true : false;
			this.wizard.pasosTotalesEncabezado = this.wizard.saltarPasoPersonal ? 4 : 5;

			this.wizard.mostrarBotonesPaso1 = false;
			this.wizard.mostrarBotonesPaso2 = false;
			this.wizard.mostrarBotonesPaso3 = false;
			this.wizard.mostrarBotonesPaso4 = false;
			this.wizard.mostrarBotonesPaso5 = false;
			this.wizard.mostrarBotonAgendar = false;
			this.wizard.mostrarBotonPaypal = false;

			// Limpiar todos los datos de la cita
			this.limpiarDatosCita(1);
		}
	}

	cambiarPaso(accion?: any) {

		switch (this.wizard.pasoActual) {
			case 1:
				if (accion == "+") {
					if (!this.wizard.saltarPasoPersonal) {
						this.wizard.pasoActual = this.wizard.pasoActual + 1;
						this.wizard.pasoActualEncabezado = this.wizard.pasoActualEncabezado + 1;
					}
					else {
						this.wizard.pasoActual = this.wizard.pasoActual + 2;
						this.wizard.pasoActualEncabezado = this.wizard.pasoActualEncabezado + 1;
					}
				}
				break;

			case 2:
				if (accion == "-") {
					this.wizard.pasoActual = this.wizard.pasoActual - 1;
					this.wizard.pasoActualEncabezado = this.wizard.pasoActualEncabezado - 1;
				}
				if (accion == "+") {
					this.wizard.pasoActual = this.wizard.pasoActual + 1;
					this.wizard.pasoActualEncabezado = this.wizard.pasoActualEncabezado + 1;
				}
				break;

			case 3:
				if (accion == "-") {
					if (!this.wizard.saltarPasoPersonal) {
						this.wizard.pasoActual = this.wizard.pasoActual - 1;
						this.wizard.pasoActualEncabezado = this.wizard.pasoActualEncabezado - 1;
					}
					else {
						this.wizard.pasoActual = this.wizard.pasoActual - 2;
						this.wizard.pasoActualEncabezado = this.wizard.pasoActualEncabezado - 1;
					}
				}
				if (accion == "+") {
					this.wizard.pasoActual = this.wizard.pasoActual + 1;
					this.wizard.pasoActualEncabezado = this.wizard.pasoActualEncabezado + 1;
				}
				break;

			case 4:
				if (accion == "-") {
					this.wizard.pasoActual = this.wizard.pasoActual - 1;
					this.wizard.pasoActualEncabezado = this.wizard.pasoActualEncabezado - 1;
				}
				if (accion == "+") {
					this.wizard.pasoActual = this.wizard.pasoActual + 1;
					this.wizard.pasoActualEncabezado = this.wizard.pasoActualEncabezado + 1;
					if (this.sucursal.configuracion.pagoConPaypal) {
						this.generarBotonPaypal();
					}
					else {
						this.wizard.mostrarBotonAgendar = true;
						this.wizard.mostrarBotonPaypal = false;
					}
				}
				break;

			case 5:
				if (accion == "-") {
					this.wizard.pasoActual = this.wizard.pasoActual - 1;
					this.wizard.pasoActualEncabezado = this.wizard.pasoActualEncabezado - 1;
				}
				break;
		}

	}

	// -------------------- Apartado de Servicios ---------------------
	cambiarCabina() {
		this._pantallaServicio.mostrarSpinner();

		// Se limpia los datos necesarios
		this.sucursal.servicios.textoBusqueda = "";
		this.limpiarDatosCita(2);
		this.reiniciarSeleccionHorarioDisponible();

		if (this.sucursal.cabinas.idCabinaSeleccionada) {
			// Se quita el paso de elegir personales
			this.wizard.saltarPasoPersonal = true;

			// Se busca la información de la cabina seleccionada
			for (let i = 0; i < this.sucursal.cabinas.listado.length; i++) {
				let cab = JSON.parse(JSON.stringify(this.sucursal.cabinas.listado[i]));

				if (cab.idPersonal == this.sucursal.cabinas.idCabinaSeleccionada) {

					// Se obtiene el nombre de la cabina seleccionada para mostrar en la confirmación
					this.sucursal.cabinas.nombreCabinaSeleccionada = cab.nombre;

					// Se obtienen los servicios que pertenecen a la cabina para solo mostrar esos o mostrar todos si así está configurada
					// la cabina
					if (cab.todosServicios) {
						this.sucursal.servicios.listadoFiltrado = JSON.parse(JSON.stringify(this.sucursal.servicios.listadoOriginal));
					}
					else {
						this.sucursal.servicios.listadoFiltrado = [];
						this.sucursal.servicios.listadoMostrado = [];

						for (let j = 0; j < this.sucursal.cabinas.serviciosPorCabina.length; j++) {
							let cabServ = JSON.parse(JSON.stringify(this.sucursal.cabinas.serviciosPorCabina[j]));

							if (cab.idPersonal == cabServ.idPersonal) {
								// Se obtiene la información del servicio perteneciente a la cabina para mostrarlo
								for (let k = 0; k < this.sucursal.servicios.listadoOriginal.length; k++) {
									let serv = JSON.parse(JSON.stringify(this.sucursal.servicios.listadoOriginal[k]));

									if (serv.idServicio == cabServ.idServicio) {
										this.sucursal.servicios.listadoFiltrado.push(serv);
									}
								}
							}
						}
					}

					this.sucursal.servicios.listadoMostrado = JSON.parse(JSON.stringify(this.sucursal.servicios.listadoFiltrado));
					i = this.sucursal.cabinas.listado.length;
				}
			}
		}
		else {
			// Si pone el paso de elegir personal si la sucursal lo tiene permitido
			this.wizard.saltarPasoPersonal = !this.sucursal.configuracion.elegirPersonal ? true : false;

			// Si se quita la cabina seleccionada, se obtienen los servicios originales de la sucursal
			this.sucursal.servicios.listadoFiltrado = JSON.parse(JSON.stringify(this.sucursal.servicios.listadoOriginal));
			this.sucursal.servicios.listadoMostrado = JSON.parse(JSON.stringify(this.sucursal.servicios.listadoFiltrado));
		}

		// Se calculan la nueva cantidad de pasos en base a si se puede elegir personal o no
		this.wizard.pasosTotalesEncabezado = this.wizard.saltarPasoPersonal ? 4 : 5;

		if (this.sucursal.cabinas.idCabinaSeleccionada) {
			let params: any = {};
			params.idPersonal = this.sucursal.cabinas.idCabinaSeleccionada;

			this._backService.HttpPost("Facebook/BookippApp/actualizarLimiteCabina", {}, params).subscribe(
				response => {
					this._pantallaServicio.ocultarSpinner();
				},
				error => {
					this._pantallaServicio.ocultarSpinner();
				}
			);
		}
		else {
			this._pantallaServicio.ocultarSpinner();
		}

	}

	buscarServicios() {
		let filtroTexto = this.sucursal.servicios.textoBusqueda.toUpperCase();

		if (filtroTexto) {
			let elementos = filtroTexto.split(",");

			let elementosFiltrados = this.sucursal.servicios.listadoFiltrado.filter((servicio: any) => {
				if (servicio.nombre.toUpperCase().match(elementos[0]) != null) {
					return servicio;
				}
			})

			this.sucursal.servicios.listadoMostrado = JSON.parse(JSON.stringify(elementosFiltrados));
		}
		else {
			this.sucursal.servicios.listadoMostrado = JSON.parse(JSON.stringify(this.sucursal.servicios.listadoFiltrado));
		}
	}

	seleccionarServicio(servicio?: any) {
		const condicion = (this.cita.servicios.length < this.wizard.cantidadServicioslimite) || servicio.seleccionado;
		if (!condicion) return;

		servicio.seleccionado = !servicio.seleccionado;
		if (servicio.seleccionado) {
			servicio.cantidad = 1;

			// Se agrega el servicio a los servicios de cita
			this.cita.servicios.push({
				idServicio: JSON.parse(JSON.stringify(servicio.idServicio)),
				nombre: JSON.parse(JSON.stringify(servicio.nombre)),
				duracion: JSON.parse(JSON.stringify(servicio.duracion)),
				costoMinimo: JSON.parse(JSON.stringify(servicio.costoMinimo)),
				costoMaximo: JSON.parse(JSON.stringify(servicio.costoMaximo)),

				idPersonalElegido: "",
				personalNombre: "Sin Preferencia",
				idPersonal: "",

				horaInicio: "",
				horaFin: "",

				pagoConPaypalObligatorio: servicio.pagoPaypal ? true : false,
				pagoConPaypal: servicio.pagoPaypal ? true : false,

				listadoPersonal: JSON.parse(JSON.stringify(servicio.listadoPersonal))
			});
		}
		else {
			servicio.cantidad = 0;

			// Se quita de los servicios de cita el servicio seleccionado para quitar
			for (let i = 0; i < this.cita.servicios.length; i++) {
				let serv = JSON.parse(JSON.stringify(this.cita.servicios[i]));

				if (serv.idServicio == servicio.idServicio) {
					this.cita.servicios.splice(i, 1);
					i--;
				}
			}
		}

		// Se pasa la información al arreglo de donde se filtran los datos que se muestran
		for (let i = 0; i < this.sucursal.servicios.listadoFiltrado.length; i++) {
			let serv = this.sucursal.servicios.listadoFiltrado[i];
			if (serv.idServicio == servicio.idServicio) {
				serv.seleccionado = !serv.seleccionado;
				if (serv.seleccionado) {
					serv.cantidad = 1;
				}
				else {
					serv.cantidad = 0;
				}
			}
		}

		// Se reinicia el horario disponible
		this.reiniciarSeleccionHorarioDisponible();

		// Limpiar los datos de fecha y horario de la cita, horario y personal de los servicios de cita y totales de cita
		this.limpiarDatosCita(3);

		// Se calcula el total de la cita
		this.calcularCitaTotal();

		// Se calcula el total de la cita que se pagará con paypal
		this.calcularCitaPaypalTotal();

		// Se verifica si se van a mostrar o a quitar los botones para avanzar
		if (this.cita.servicios.length == 0) {
			this.wizard.mostrarBotonesPaso1 = false;
		}
		else {
			this.wizard.mostrarBotonesPaso1 = true;
		}
	}

	cambiarCantidadServicio(servicio?: any, opcion?: any) {
		if (opcion == "change") {
			// Se verifica que no se haya ingresado nada vacio
			if ((servicio.cantidad).toString() != "") {

				// Eliminar los servicios de cita pertenecientes al servicio del cual se está cambiando la cantidad
				// para poder calcular correctamente cuanto es la cantidad restante de servicios disponibles
				for (let i = 0; i < this.cita.servicios.length; i++) {
					let serv = JSON.parse(JSON.stringify(this.cita.servicios[i]));

					if (serv.idServicio == servicio.idServicio) {
						this.cita.servicios.splice(i, 1);
						i--;
					}
				}

				servicio.cantidad = parseInt((servicio.cantidad).toString());
				if (servicio.cantidad < 1) {
					// Si la cantidad es menor a 1, se pone 1 que es la cantidad minima que deben de tener los servicios
					servicio.cantidad = 1;
				}
				else {
					// Si la cantidad no es menor a 1, se tiene que verificar que no sobrepase la cantidad restante de servicios disponibles
					if (servicio.cantidad > (this.wizard.cantidadServicioslimite - this.cita.servicios.length)) {
						servicio.cantidad = (this.wizard.cantidadServicioslimite - this.cita.servicios.length);
					}
				}

				// Una vez obtenida la cantidad real del servicio, se pasa esa información al listado principal del cual se obtiene
				// el listado que se muestra para no perderla cuando se haga una busqueda
				for (let i = 0; i < this.sucursal.servicios.listadoFiltrado.length; i++) {
					let serv = this.sucursal.servicios.listadoFiltrado[i];
					if (serv.idServicio == servicio.idServicio) {
						serv.cantidad = JSON.parse(JSON.stringify(servicio.cantidad));
					}
				}

				// Por ultimo se agrega el servicio en los servicios de cita la cantidad de veces que se selecciono
				for (let i = 0; i < servicio.cantidad; i++) {
					this.cita.servicios.push({
						idServicio: JSON.parse(JSON.stringify(servicio.idServicio)),
						nombre: JSON.parse(JSON.stringify(servicio.nombre)),
						duracion: JSON.parse(JSON.stringify(servicio.duracion)),
						costoMinimo: JSON.parse(JSON.stringify(servicio.costoMinimo)),
						costoMaximo: JSON.parse(JSON.stringify(servicio.costoMaximo)),

						idPersonalElegido: "",
						personalNombre: "Sin Preferencia",
						idPersonal: "",

						horaInicio: "",
						horaFin: "",

						pagoConPaypalObligatorio: servicio.pagoPaypal ? true : false,
						pagoConPaypal: servicio.pagoPaypal ? true : false,

						listadoPersonal: JSON.parse(JSON.stringify(servicio.listadoPersonal))
					});
				}

				// Se reinicia el horario disponible
				this.reiniciarSeleccionHorarioDisponible();

				// Limpiar los datos de fecha y horario de la cita, horario y personal de los servicios de cita y totales de cita
				this.limpiarDatosCita(3);

				// Se calcula el total de la cita
				this.calcularCitaTotal();

				// Se calcula el total de la cita que se pagará con paypal
				this.calcularCitaPaypalTotal();

			}
		}

		if (opcion == "blur") {
			// Se verifica que al momento de dejar de editar la cantidad se haya dejado vacio el campo
			if ((servicio.cantidad).toString() == "") {

				// Se eliminan los servicios de la cita pertenecientes al servicio del cual se edito la cantidad
				for (let i = 0; i < this.cita.servicios.length; i++) {
					let serv = JSON.parse(JSON.stringify(this.cita.servicios[i]));

					if (serv.idServicio == servicio.idServicio) {
						this.cita.servicios.splice(i, 1);
						i--;
					}
				}

				// Se le pone 1 a la cantidad del servicio que es la cantidad minima que debe de tener
				servicio.cantidad = 1;

				// Por ultimo se agrega el servicio en los servicios de cita
				this.cita.servicios.push({
					idServicio: JSON.parse(JSON.stringify(servicio.idServicio)),
					nombre: JSON.parse(JSON.stringify(servicio.nombre)),
					duracion: JSON.parse(JSON.stringify(servicio.duracion)),
					costoMinimo: JSON.parse(JSON.stringify(servicio.costoMinimo)),
					costoMaximo: JSON.parse(JSON.stringify(servicio.costoMaximo)),

					idPersonalElegido: "",
					personalNombre: "Sin Preferencia",
					idPersonal: "",

					horaInicio: "",
					horaFin: "",

					pagoConPaypalObligatorio: servicio.pagoPaypal ? true : false,
					pagoConPaypal: servicio.pagoPaypal ? true : false,

					listadoPersonal: JSON.parse(JSON.stringify(servicio.listadoPersonal))
				});

				// Limpiar los datos de fecha y horario de la cita, horario y personal de los servicios de cita y totales de cita
				this.limpiarDatosCita(3);

				// Se calcula el total de la cita
				this.calcularCitaTotal();

				// Se calcula el total de la cita que se pagará con paypal
				this.calcularCitaPaypalTotal();

				// Se reinicia el horario disponible
				this.reiniciarSeleccionHorarioDisponible();
			}
		}

	}

	// ------------------- Apartado de Personales ---------------------
	seleccionarPersonal(servicio?: any) {
		// Se obtiene el nombre del personal seleccionado para mostrar en la confirmación, o se quita si se quito el personal
		if (servicio.idPersonalElegido) {
			for (let i = 0; i < servicio.listadoPersonal.length; i++) {
				if (servicio.listadoPersonal[i].idPersonal == servicio.idPersonalElegido) {
					servicio.personalNombre = JSON.parse(JSON.stringify(servicio.listadoPersonal[i].nombre));
					i = servicio.listadoPersonal.length;
				}
			}
		}
		else {
			servicio.personalNombre = "Sin Preferencia";
		}

		// Se reinicia el horario disponible
		this.reiniciarSeleccionHorarioDisponible();

		// Limpiar los datos de fecha y horario de la cita, horario y personal de los servicios de cita
		this.limpiarDatosCita(4);
	}

	// --------------------- Apartado de Horario ----------------------
	horarioCambiarDeDias(opc?: any) {

		let indexPrimerDia = -1;
		let indexUltimoDia = -1;

		// Obtener los index del primer y ultimo día que se muestran e indicar que ya no se muestren
		for (let i = 0; i < this.sucursal.horarioDisponible.diasListado.length; i++) {
			let elem = this.sucursal.horarioDisponible.diasListado[i];

			if (elem.mostrarDia) {
				if (indexPrimerDia == -1) {
					indexPrimerDia = i;
				}
				indexUltimoDia = i;

				elem.mostrarDia = false;
			}
		}

		if (opc == "+") {
			let realizado = 0;
			for (let i = indexUltimoDia + 1; i < this.sucursal.horarioDisponible.diasListado.length; i++) {
				let elem = this.sucursal.horarioDisponible.diasListado[i];

				if (realizado < 7) {
					elem.mostrarDia = true;
					realizado++;
				}
				else {
					i = this.sucursal.horarioDisponible.diasListado.length;
				}
			}
		}

		if (opc == "-") {
			let realizado = 0;
			for (let i = indexPrimerDia - 1; i >= 0; i--) {
				let elem = this.sucursal.horarioDisponible.diasListado[i];

				if (realizado < 7) {
					elem.mostrarDia = true;
					realizado++;
				}
				else {
					i = 0;
				}
			}
		}

		if (this.sucursal.horarioDisponible.diasListado.length != 0) {
			this.sucursal.horarioDisponible.mostrarBoton7DiasAnteriores = this.sucursal.horarioDisponible.diasListado[0].mostrarDia ? false : true;
			this.sucursal.horarioDisponible.mostrarBoton7DiasSiguientes = this.sucursal.horarioDisponible.diasListado[this.sucursal.horarioDisponible.diasListado.length - 1].mostrarDia ? false : true;
		}
		else {
			this.sucursal.horarioDisponible.mostrarBoton7DiasAnteriores = false;
			this.sucursal.horarioDisponible.mostrarBoton7DiasAnteriores = false;
		}
	}

	seleccionarHorarioHora(horario?: any) {

		// Se quita la selección del horario anterior
		for (let i = 0; i < this.sucursal.horarioDisponible.horasListado.length; i++) {
			let elem = this.sucursal.horarioDisponible.horasListado[i];
			elem.seleccionado = false;
		}

		// Se selecciona el nuevo horario
		horario.seleccionado = true;

		// Se guarda el horario seleccionado como la hora inicio y fin de la cita
		this.cita.horaInicio = horario.horaInicio;
		this.cita.horaFin = horario.horaFin;

		// Se limpian las horas de inicio y fin de los servicios de la cita para cambiarlos por los nuevos
		for (let i = 0; i < this.cita.servicios.length; i++) {
			let cs = this.cita.servicios[i];

			cs.horaInicio = "";
			cs.horaFin = "";
			cs.idPersonal = "";
		}

		// Se le asigna a cada servicio de cita su hora de inicio y fin
		for (let i = 0; i < horario.detalle.length; i++) {
			let hs = horario.detalle[i];

			for (let j = 0; j < this.cita.servicios.length; j++) {
				let cs = this.cita.servicios[j];
				if (cs.idServicio == hs.idServicio) {
					if (!cs.horaInicio) {
						cs.horaInicio = hs.horaInicio;
						cs.horaFin = hs.horaFin;
						// Si se eligió cabina, se pone vacio el personal ya que el idPersonal que regreso el horario disponible
						// fue la cabina
						if (this.sucursal.cabinas.idCabinaSeleccionada) {
							cs.idPersonal = "";
						}
						else {
							cs.idPersonal = hs.idPersonal;
						}
						j = this.cita.servicios.length;
					}
				}
			}
		}

		// Se muestra el botón para avanzar al siguiente paso
		this.wizard.mostrarBotonesPaso3 = true;

	}

	// --------------------- Apartado de Cliente ----------------------
	validarClienteInformacion(proceso?: any, opc?: any) {
		let expRegularSoloLetras = RegExp("^[a-zA-Z áéíóúñÁÉÍÓÚÑ\s]*$");
		let expRegularSoloNumeros = new RegExp("^[0-9]*$");
		let expRegularEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

		let valido = true;

		if (this.cita.cliente.nombre) {
			if (!expRegularSoloLetras.test(this.cita.cliente.nombre)) {
				if (opc == 1 && proceso == 'blur') {
					$("#clienteNombre").addClass("errorCampo");
				}
				valido = false;
			}
			else {
				if (opc == 1) {
					$("#clienteNombre").removeClass("errorCampo");
				}
			}
		}
		else {
			if (opc == 1 && proceso == 'blur') {
				$("#clienteNombre").addClass("errorCampo");
			}
			valido = false;
		}

		if (this.cita.cliente.telefono) {
			if (this.cita.cliente.telefono.length >= 8) {
				if (!expRegularSoloNumeros.test(this.cita.cliente.telefono)) {
					if (opc == 2 && proceso == 'blur') {
						$("#clienteTelefono").addClass("errorCampo");
					}
					valido = false;
				}
				else {
					if (opc == 2) {
						$("#clienteTelefono").removeClass("errorCampo");
					}
				}
			}
			else {
				if (opc == 2 && proceso == 'blur') {
					$("#clienteTelefono").addClass("errorCampo");
				}
				valido = false;
			}
		}
		else {
			if (opc == 2 && proceso == 'blur') {
				$("#clienteTelefono").addClass("errorCampo");
			}
			valido = false;
		}

		if (this.cita.cliente.correo) {
			if (!expRegularEmail.test(this.cita.cliente.correo)) {
				if (opc == 3 && proceso == 'blur') {
					$("#clienteCorreo").addClass("errorCampo");
				}
				valido = false;
			}
			else {
				if (opc == 3) {
					$("#clienteCorreo").removeClass("errorCampo");
				}
			}
		}
		else {
			if (opc == 3 && proceso == 'blur') {
				$("#clienteCorreo").addClass("errorCampo");
			}
			valido = false;
		}

		if (valido) {
			this.wizard.mostrarBotonesPaso4 = true;
		}
		else {
			this.wizard.mostrarBotonesPaso4 = false;
		}

	}

	// --------------------------- Agendar ----------------------------
	agendarSinPagar() {
		this._pantallaServicio.mostrarSpinner();

		let paramsCliente: any = {};
		paramsCliente.idSucursal = this.empresa.idSucursalSeleccionada;
		paramsCliente.nombre = this.cita.cliente.nombre;
		paramsCliente.telefono = this.cita.cliente.telefono;
		paramsCliente.correo = (this.cita.cliente.correo).toLowerCase();

		this._backService.HttpPost("Facebook/BookippApp/selectClienteCorreo", {}, paramsCliente).subscribe(
			response => {
				let dataCliente = eval(response);

				let clienteNombre = this.cita.cliente.nombre;
				let clienteTelefono = this.cita.cliente.telefono;
				let clienteCorreo = (this.cita.cliente.correo).toLowerCase();

				// Se verifica si se seleccionó cabina o no
				if (this.sucursal.cabinas.idCabinaSeleccionada) {

					// Se selecciono cabina y se tiene que verificar si tiene un limite configurado y si lo tiene, si no lo ha superado
					let cabinaAgendarPermitido = false;

					let paramsCabina: any = {};
					paramsCabina.idPersonal = this.sucursal.cabinas.idCabinaSeleccionada;
					paramsCabina.idSucursal = this.empresa.idSucursalSeleccionada;
					paramsCabina.cantidadCitas = this.cita.servicios.length

					this._backService.HttpPost("Facebook/BookippApp/consultarLimiteCabina", {}, paramsCabina).subscribe(
						response => {
							let limiteCabina = response;

							// Se checa si la cabina tiene limite configurado y si ya se cumplió o no 
							switch (limiteCabina) {
								case 1:
									cabinaAgendarPermitido = true;
									break;

								case -1:
									cabinaAgendarPermitido = true;
									break;

								case -2:
									cabinaAgendarPermitido = false;
									this._toaster.error('¡Ups! Parece que la cabina se encuentra saturada en el día seleccionado. Intenta seleccionar otro horario para agendar');
									this._pantallaServicio.ocultarSpinner();
									break;

								default:
									this.citasPermitidas = false;
									break;
							}

							// Se verifica que en la cabina se pueda agendar dependiendo del limite de usos de la cabina
							if (cabinaAgendarPermitido) {

								// Se verifica si el cliente ya existe
								if (dataCliente.length >= 1) {

									// Se obtienen los parámetros para agendar
									let paramsCita: any = {};
									paramsCita.idCita = 0;
									paramsCita.cliente = dataCliente[0].idCliente.toString();

									paramsCita.fecha = this.cita.fecha;
									paramsCita.horaInicio = this.cita.horaInicio;
									paramsCita.horaFin = this.cita.horaFin;

									paramsCita.servicios = [];
									paramsCita.horaInicioServicio = [];
									paramsCita.personal = [];

									for (let i = 0; i < this.cita.servicios.length; i++) {
										let elem = JSON.parse(JSON.stringify(this.cita.servicios[i]));

										paramsCita.servicios.push(elem.idServicio);
										paramsCita.horaInicioServicio.push(elem.horaInicio);
										paramsCita.personal.push("");
									}

									paramsCita.recurrencia = false;
									paramsCita.recInicio = "";
									paramsCita.recFin = "";
									paramsCita.frecuencia = "";
									paramsCita.repeticion = "";
									paramsCita.lun = false;
									paramsCita.mar = false;
									paramsCita.mie = false;
									paramsCita.jue = false;
									paramsCita.vie = false;
									paramsCita.sab = false;
									paramsCita.dom = false;

									paramsCita.idSucursal = this.empresa.idSucursalSeleccionada;
									//paramsCita.realizoAlta = this.sucursal.configuracion.realizoAlta;
									paramsCita.realizoAlta = "";
									paramsCita.origen = this.parametros.origen;
									paramsCita.confirmada = false;

									paramsCita.idPromocionSucursal = [];
									paramsCita.valorPromocion = [];
									paramsCita.tipoPromocion = [];
									paramsCita.idReferencia = "";

									paramsCita.idCabina = this.sucursal.cabinas.idCabinaSeleccionada;

									this._backService.HttpPost("movil/AgendaMovil/insertCita", {}, paramsCita).subscribe(
										response => {
											let idCita = parseInt(eval(response)[0].idCita);

											switch (idCita) {
												case -1:
													this._toaster.error('La Cabina no labora en el día seleccionado');
													this._pantallaServicio.ocultarSpinner();
													break;

												case -2:
													this._toaster.error('La Cabina cuenta con un descanso en el horario seleccionado');
													this._pantallaServicio.ocultarSpinner();
													break;

												case -3:
													this._toaster.error('La hora de la cita se encuentra fuera del horario de la Cabina');
													this._pantallaServicio.ocultarSpinner();
													break;

												case -4:
													this._toaster.error('La cabina ya cuenta con una cita en el horario seleccionado');
													this._pantallaServicio.ocultarSpinner();
													break;

												case -5:
													this._toaster.error(this.equiposTranslate.equipoNoDisponible);
													this._pantallaServicio.ocultarSpinner();
													break;

												case -6:
													this._toaster.error('El personal no labora en el horario seleccionado');
													this._pantallaServicio.ocultarSpinner();
													break;

												case -7:
													this._toaster.error('El personal tiene un descanso en el horario seleccionado');
													this._pantallaServicio.ocultarSpinner();
													break;

												default:
													// Se agendo todo correctamente y se va a enviar el correo de la cita
													this.enviarCorreo(idCita);
													break;
											}
										},
										error => { }
									);
								}
								else {

									let paramsCliente: any = {};
									paramsCliente.nombre = clienteNombre;
									paramsCliente.telefono = clienteTelefono;
									paramsCliente.email = clienteCorreo;
									paramsCliente.nacimiento = "";
									paramsCliente.idUsuarioSucursal = "-1";
									paramsCliente.idSucursal = this.empresa.idSucursalSeleccionada;
									paramsCliente.idReferencia = "";

									// Antes de agendar se guarda el cliente
									this._backService.HttpPost("Facebook/BookippApp/insertCliente", {}, paramsCliente).subscribe(
										response => {
											let idCliente = eval(response);

											// Se obtienen los parámetros para agendar
											let paramsCita: any = {};
											paramsCita.idCita = 0;
											paramsCita.cliente = idCliente;

											paramsCita.fecha = this.cita.fecha;
											paramsCita.horaInicio = this.cita.horaInicio;
											paramsCita.horaFin = this.cita.horaFin;

											paramsCita.servicios = [];
											paramsCita.horaInicioServicio = [];
											paramsCita.personal = [];

											for (let i = 0; i < this.cita.servicios.length; i++) {
												let elem = JSON.parse(JSON.stringify(this.cita.servicios[i]));

												paramsCita.servicios.push(elem.idServicio);
												paramsCita.horaInicioServicio.push(elem.horaInicio);
												paramsCita.personal.push("");
											}

											paramsCita.recurrencia = false;
											paramsCita.recInicio = "";
											paramsCita.recFin = "";
											paramsCita.frecuencia = "";
											paramsCita.repeticion = "";
											paramsCita.lun = false;
											paramsCita.mar = false;
											paramsCita.mie = false;
											paramsCita.jue = false;
											paramsCita.vie = false;
											paramsCita.sab = false;
											paramsCita.dom = false;

											paramsCita.idSucursal = this.empresa.idSucursalSeleccionada;
											//paramsCita.realizoAlta = this.sucursal.configuracion.realizoAlta;
											paramsCita.realizoAlta = "";
											paramsCita.origen = this.parametros.origen;
											paramsCita.confirmada = false;

											paramsCita.idPromocionSucursal = [];
											paramsCita.valorPromocion = [];
											paramsCita.tipoPromocion = [];
											paramsCita.idReferencia = "";

											paramsCita.idCabina = this.sucursal.cabinas.idCabinaSeleccionada;

											this._backService.HttpPost("movil/AgendaMovil/insertCita", {}, paramsCita).subscribe(
												response => {
													let idCita = parseInt(eval(response)[0].idCita);

													switch (idCita) {

														case -1:
															this._toaster.error('La Cabina no labora en el día seleccionado');
															this._pantallaServicio.ocultarSpinner();
															break;

														case -2:
															this._toaster.error('La Cabina cuenta con un descanso en el horario seleccionado');
															this._pantallaServicio.ocultarSpinner();
															break;

														case -3:
															this._toaster.error('La hora de la cita se encuentra fuera del horario de la Cabina');
															this._pantallaServicio.ocultarSpinner();
															break;

														case -4:
															this._toaster.error('La cabina ya cuenta con una cita en el horario seleccionado');
															this._pantallaServicio.ocultarSpinner();
															break;

														case -5:
															this._toaster.error(this.equiposTranslate.equipoNoDisponible);
															this._pantallaServicio.ocultarSpinner();
															break;

														case -6:
															this._toaster.error('El personal no labora en el horario seleccionado');
															this._pantallaServicio.ocultarSpinner();
															break;

														case -7:
															this._toaster.error('El personal tiene un descanso en el horario seleccionado');
															this._pantallaServicio.ocultarSpinner();
															break;

														default:
															// Se agendo todo correctamente y se va a enviar el correo de la cita
															this.enviarCorreo(idCita);
															break;

													}
												},
												error => {
													this._pantallaServicio.ocultarSpinner();
												}
											);
										},
										error => {
											this._pantallaServicio.ocultarSpinner();
										}
									);
								}

							}
						},
						error => {
							this._pantallaServicio.ocultarSpinner();
						}
					);
				}
				else {
					// No se selecciono cabina

					// Se verifica si el cliente ya existe
					if (dataCliente.length >= 1) {

						// Se obtienen los parámetros para agendar
						let paramsCita: any = {};
						paramsCita.idCita = 0;
						paramsCita.cliente = dataCliente[0].idCliente.toString();

						paramsCita.fecha = this.cita.fecha;
						paramsCita.horaInicio = this.cita.horaInicio;
						paramsCita.horaFin = this.cita.horaFin;

						paramsCita.servicios = [];
						paramsCita.horaInicioServicio = [];
						paramsCita.personal = [];

						for (let i = 0; i < this.cita.servicios.length; i++) {
							let elem = JSON.parse(JSON.stringify(this.cita.servicios[i]));

							paramsCita.servicios.push(elem.idServicio);
							paramsCita.horaInicioServicio.push(elem.horaInicio);
							paramsCita.personal.push(elem.idPersonal);
						}

						paramsCita.recurrencia = false;
						paramsCita.recInicio = "";
						paramsCita.recFin = "";
						paramsCita.frecuencia = "";
						paramsCita.repeticion = "";
						paramsCita.lun = false;
						paramsCita.mar = false;
						paramsCita.mie = false;
						paramsCita.jue = false;
						paramsCita.vie = false;
						paramsCita.sab = false;
						paramsCita.dom = false;

						paramsCita.idSucursal = this.empresa.idSucursalSeleccionada;
						//paramsCita.realizoAlta = this.sucursal.configuracion.realizoAlta;
						paramsCita.realizoAlta = "";
						paramsCita.origen = this.parametros.origen;
						paramsCita.confirmada = false;

						paramsCita.idPromocionSucursal = [];
						paramsCita.valorPromocion = [];
						paramsCita.tipoPromocion = [];
						paramsCita.idReferencia = "";

						paramsCita.idCabina = "";

						this._backService.HttpPost("movil/AgendaMovil/insertCita", {}, paramsCita).subscribe(
							response => {
								let idCita = parseInt(eval(response)[0].idCita);

								switch (idCita) {
									case -1:
										this._toaster.error('El personal no labora en el día seleccionado');
										this._pantallaServicio.ocultarSpinner();
										break;

									case -2:
										this._toaster.error('El personal cuenta con un descanso en el horario seleccionado');
										this._pantallaServicio.ocultarSpinner();
										break;

									case -3:
										this._toaster.error('La hora de la cita se encuentra fuera del horario del Personal');
										this._pantallaServicio.ocultarSpinner();
										break;

									case -4:
										this._toaster.error('El personal ya cuenta con una cita en el horario seleccionado');
										this._pantallaServicio.ocultarSpinner();
										break;

									case -5:
										this._toaster.error(this.equiposTranslate.equipoNoDisponible);
										this._pantallaServicio.ocultarSpinner();
										break;

									default:
										// Se agendo todo correctamente y se va a enviar el correo de la cita
										this.enviarCorreo(idCita);
										break;
								}
							},
							error => {
								this._pantallaServicio.ocultarSpinner();
							}
						);
					}
					else {

						let paramsCliente: any = {};
						paramsCliente.nombre = clienteNombre;
						paramsCliente.telefono = clienteTelefono;
						paramsCliente.email = clienteCorreo;
						paramsCliente.nacimiento = "";
						paramsCliente.idUsuarioSucursal = "-1";
						paramsCliente.idSucursal = this.empresa.idSucursalSeleccionada;
						paramsCliente.idReferencia = "";

						this._backService.HttpPost("Facebook/BookippApp/insertCliente", {}, paramsCliente).subscribe(
							response => {
								let idCliente = eval(response);

								// Se obtienen los parámetros para agendar
								let paramsCita: any = {};
								paramsCita.idCita = 0;
								paramsCita.cliente = idCliente;

								paramsCita.fecha = this.cita.fecha;
								paramsCita.horaInicio = this.cita.horaInicio;
								paramsCita.horaFin = this.cita.horaFin;

								paramsCita.servicios = [];
								paramsCita.horaInicioServicio = [];
								paramsCita.personal = [];

								for (let i = 0; i < this.cita.servicios.length; i++) {
									let elem = JSON.parse(JSON.stringify(this.cita.servicios[i]));

									paramsCita.servicios.push(elem.idServicio);
									paramsCita.horaInicioServicio.push(elem.horaInicio);
									paramsCita.personal.push(elem.idPersonal);
								}

								paramsCita.recurrencia = false;
								paramsCita.recInicio = "";
								paramsCita.recFin = "";
								paramsCita.frecuencia = "";
								paramsCita.repeticion = "";
								paramsCita.lun = false;
								paramsCita.mar = false;
								paramsCita.mie = false;
								paramsCita.jue = false;
								paramsCita.vie = false;
								paramsCita.sab = false;
								paramsCita.dom = false;

								paramsCita.idSucursal = this.empresa.idSucursalSeleccionada;
								//paramsCita.realizoAlta = this.sucursal.configuracion.realizoAlta;
								paramsCita.realizoAlta = "";
								paramsCita.origen = this.parametros.origen;
								paramsCita.confirmada = false;

								paramsCita.idPromocionSucursal = [];
								paramsCita.valorPromocion = [];
								paramsCita.tipoPromocion = [];
								paramsCita.idReferencia = "";

								paramsCita.idCabina = "";

								this._backService.HttpPost("movil/AgendaMovil/insertCita", {}, paramsCita).subscribe(
									response => {
										let idCita = parseInt(eval(response)[0].idCita);

										switch (idCita) {
											case -1:
												this._toaster.error('El personal no labora en el día seleccionado')
												this._pantallaServicio.ocultarSpinner();
												break;

											case -2:
												this._toaster.error('El personal cuenta con un descanso en el horario seleccionado')
												this._pantallaServicio.ocultarSpinner();
												break;

											case -3:
												this._toaster.error('La hora de la cita se encuentra fuera del horario del Personal')
												this._pantallaServicio.ocultarSpinner();
												break;

											case -4:
												this._toaster.error('El personal ya cuenta con una cita en el horario seleccionado')
												this._pantallaServicio.ocultarSpinner();
												break;

											case -5:
												this._toaster.error(this.equiposTranslate.equipoNoDisponible)
												this._pantallaServicio.ocultarSpinner();
												break;

											default:
												// Se agendo todo correctamente y se va a enviar el correo de la cita
												this.enviarCorreo(idCita);
												break;
										}
									},
									error => {
										this._pantallaServicio.ocultarSpinner();
									}
								);
							},
							error => {
								this._pantallaServicio.ocultarSpinner();
							}
						);
					}

				}
			},
			error => {
				this._pantallaServicio.ocultarSpinner();
			}
		);
	}

	agendarConPagoPaypal(transaccion?: any) {
		this._pantallaServicio.mostrarSpinner();

		let paramsCliente: any = {};
		paramsCliente.idSucursal = this.empresa.idSucursalSeleccionada;
		paramsCliente.nombre = this.cita.cliente.nombre;
		paramsCliente.telefono = this.cita.cliente.telefono;
		paramsCliente.correo = (this.cita.cliente.correo).toLowerCase();

		this._backService.HttpPost("Facebook/BookippApp/selectClienteCorreo", {}, paramsCliente).subscribe(
			response => {
				let dataCliente = eval(response);
				let clienteNombre = this.cita.cliente.nombre;
				let clienteTelefono = this.cita.cliente.telefono;
				let clienteCorreo = (this.cita.cliente.correo).toLowerCase();

				// Se verifica si el cliente ya existe
				if (dataCliente.length >= 1) {

					// Se obtienen los parámetros para agendar
					let params: any = {};
					params.idSucursal = this.empresa.idSucursalSeleccionada;
					params.fechaCita = this.cita.fecha;
					params.horaInicioCita = this.cita.horaInicio;
					params.horaFinCita = this.cita.horaFin;
					params.idCliente = dataCliente[0].idCliente.toString();
					params.origen = this.parametros.origen;
					params.idCabina = this.sucursal.cabinas.idCabinaSeleccionada ? this.sucursal.cabinas.idCabinaSeleccionada : "";
					params.servicios = JSON.parse(JSON.stringify(this.cita.servicios));
					for (let i = 0; i < params.servicios.length; i++) {
						params.servicios[i].pagoConPaypal = params.servicios[i].pagoConPaypal;
					}
					params.comisionPaypal = this.sucursal.configuracion.paypalComisionPorCliente ? this.cita.comisionPaypal : "";
					params.comisionConcepto = "Cargo por pago con Paypal";
					params.idMetodoPago = this.sucursal.configuracion.idMetodoPagoSucursalPaypal;
					params.idTransaccion = transaccion.id;
					params.totalPagoPaypal = transaccion.purchase_units[0].amount.value;
					params.idVendedor = transaccion.payer.payer_id;
					params.idComprador = transaccion.purchase_units[0].payee.merchant_id;
					params.fechaCreacionPaypal = transaccion.create_time;
					params.fechaPagoPaypal = transaccion.update_time;
					params.realizoAlta = this.sucursal.configuracion.realizoAlta;

					this._backService.HttpPost("Facebook/BookippApp/agendarCitaPagoPaypal", {}, params).subscribe(
						response => {
							let idCita = parseInt(response);
							this.enviarCorreo(idCita);
						},
						error => {
							this._pantallaServicio.ocultarSpinner();
						}
					);
				}
				else {

					let paramsCliente: any = {};
					paramsCliente.nombre = clienteNombre;
					paramsCliente.telefono = clienteTelefono;
					paramsCliente.email = clienteCorreo;
					paramsCliente.nacimiento = "";
					paramsCliente.idUsuarioSucursal = "-1";
					paramsCliente.idSucursal = this.empresa.idSucursalSeleccionada;
					paramsCliente.idReferencia = "";

					this._backService.HttpPost("Facebook/BookippApp/insertCliente", {}, paramsCliente).subscribe(
						response => {
							let idCliente = eval(response);

							let params: any = {};
							params.idSucursal = this.empresa.idSucursalSeleccionada;
							params.fechaCita = this.cita.fecha;
							params.horaInicioCita = this.cita.horaInicio;
							params.horaFinCita = this.cita.horaFin;
							params.idCliente = idCliente;
							params.origen = this.parametros.origen;
							params.idCabina = this.sucursal.cabinas.idCabinaSeleccionada ? this.sucursal.cabinas.idCabinaSeleccionada : "";
							params.servicios = JSON.parse(JSON.stringify(this.cita.servicios));
							for (let i = 0; i < params.servicios.length; i++) {
								params.servicios[i].pagoConPaypal = params.servicios[i].pagoConPaypal;
							}
							params.comisionPaypal = this.sucursal.configuracion.paypalComisionPorCliente ? this.cita.comisionPaypal : "";
							params.comisionConcepto = "Cargo por pago con Paypal";
							params.idMetodoPago = this.sucursal.configuracion.idMetodoPagoSucursalPaypal;
							params.idTransaccion = transaccion.id;
							params.totalPagoPaypal = transaccion.purchase_units[0].amount.value;
							params.idVendedor = transaccion.payer.payer_id;
							params.idComprador = transaccion.purchase_units[0].payee.merchant_id;
							params.fechaCreacionPaypal = transaccion.create_time;
							params.fechaPagoPaypal = transaccion.update_time;
							params.realizoAlta = this.sucursal.configuracion.realizoAlta;

							this._backService.HttpPost("Facebook/BookippApp/agendarCitaPagoPaypal", {}, params).subscribe(
								response => {
									let idCita = parseInt(response);
									this.enviarCorreo(idCita);
								},
								error => {
									this._pantallaServicio.ocultarSpinner();
								}
							);
						},
						error => {
							this._pantallaServicio.ocultarSpinner();
						}
					);
				}
			},
			error => {
				this._pantallaServicio.ocultarSpinner();
			}
		);
	}

	enviarCorreo(idCita?: any) {
		let paramsCorreo: any = {};
		paramsCorreo.idCita = idCita;

		this._backService.HttpPost("movil/AgendaMovil/datosReprogramar", {}, paramsCorreo).subscribe(
			response => {
				let dataCita = eval(response);
				let fechaCita = moment(dataCita[0].fechaCita);
				let correoParams: any = {};
				let costoMin = 0;
				let costoMax = 0;
				let direccion = dataCita[0].calle + " #" + dataCita[0].numero + ", Col. " + dataCita[0].colonia + ", " + dataCita[0].nombre;
				correoParams.horaInicio = dataCita[0].horaInicioServicio.substring(0, 5);
				correoParams.fechaCita = fechaCita.format("DD/MM/YY");
				correoParams.sucursal = dataCita[0].nombreSucursal;
				correoParams.nombre = dataCita[0].nombreCliente;
				correoParams.email = dataCita[0].emailCliente;
				correoParams.servicios = "<tr><td style='width: 60px;text-align: center;'>" +
					`<img src=' ${environment.urlMigracion}assets/images/system/servicio_correo.png' width='32' height='55'></td>` +
					"<td>Servicio:</td><td>";

				for (let i = 0; i < dataCita.length; i++) {
					correoParams.servicios += dataCita[i].nombreServicio;

					if (i == (dataCita.length - 1)) {
						correoParams.servicios += "</td></tr>";
					} else {
						correoParams.servicios += ",";
					}
					costoMin += dataCita[i].costoMinimo;
					costoMax += dataCita[i].costoMaximo ? dataCita[i].costoMaximo : dataCita[i].costoMinimo;
				}
				correoParams.servicios += "<tr bgcolor='#e6e6e6'><td style='width: 60px;text-align: center;'>" +
					`<img src=' ${environment.urlMigracion}assets/images/system/ubicacion_correo.png' width='43' height='55'></td>` +
					"<td>Ubicación:</td><td>" + direccion + "</td></tr>" + "<tr><td style='width: 60px;text-align: center;'>" +
					`<img src=' ${environment.urlMigracion}assets/images/system/telefono_correo.png' width='34' height='55'></td>` +
					"<td>Teléfono:</td><td>" + dataCita[0].telefono + "</td></tr>";

				correoParams.costo = costoMin == costoMax ? "$" + costoMin.toFixed(2) : "$" + costoMin.toFixed(2) + " - " + "$" + costoMax.toFixed(2);
				correoParams.idioma = "ESP";
				correoParams.id_sucursal = this.empresa.idSucursalSeleccionada;

				this._backService.HttpPost("movil/UsuarioMovil/correoResumen", {}, correoParams).subscribe(
					response => {
						this.enviarCorreoCitaOnline(idCita);
						// Se muestra el modal para indicar que la cita se agendó correctamente
						this.mostrarModalCitaAgendada(this.bookippAppTranslate.citaAgendada);
						// Se reinicia el wizard
						this.iniciarWizard(2);
						this._pantallaServicio.ocultarSpinner();
					},
					error => {
						this._toaster.error(error.Message);
						this._pantallaServicio.ocultarSpinner();
					}
				);
			},
			error => {
				this._toaster.error(error.Message);
				this._pantallaServicio.ocultarSpinner();
			}
		);
	}

	enviarCorreoCitaOnline(idCita?: any) {

		if (this.sucursal.configuracion.enviarCorreoCitaOnline) {

			let params: any = {};
			params.idSucursal = this.empresa.idSucursalSeleccionada;
			params.idEmpresa = this.empresa.idEmpresa;

			this._backService.HttpPost("Facebook/BookippApp/consultarUsuariosAdmin", {}, params).subscribe(
				response => {
					let usuariosadmin = eval(response);

					if (usuariosadmin.length > 0) {

						let paramsCorreo: any = {};
						paramsCorreo.idCita = idCita;

						this._backService.HttpPost("movil/AgendaMovil/datosReprogramar", {}, paramsCorreo).subscribe(
							response => {

								let dataCita = eval(response);
								let fechaCita = moment(dataCita[0].fechaCita);

								let correoParams: any = {};
								let costoMin = 0;
								let costoMax = 0;
								let direccion = dataCita[0].calle + " #" + dataCita[0].numero + ", Col. " + dataCita[0].colonia + ", " + dataCita[0].nombre;
								correoParams.horaInicio = dataCita[0].horaInicioServicio.substring(0, 5);
								correoParams.fechaCita = fechaCita.format("DD/MM/YY");
								correoParams.sucursal = dataCita[0].nombreSucursal;
								correoParams.nombre = dataCita[0].nombreCliente;
								correoParams.email = usuariosadmin[0].email;
								correoParams.servicios = "<tr><td style='width: 60px;text-align: center;'>" +
									`<img src='${environment.urlMigracion}assets/images/system/servicio_correo.png' width='32' height='55'></td>` +
									"<td>Servicio:</td><td>";

								for (let i = 0; i < dataCita.length; i++) {
									correoParams.servicios += dataCita[i].nombreServicio;

									if (i == (dataCita.length - 1)) {
										correoParams.servicios += "</td></tr>";
									} else {
										correoParams.servicios += ",";
									}
									costoMin += dataCita[i].costoMinimo;
									costoMax += dataCita[i].costoMaximo ? dataCita[i].costoMaximo : dataCita[i].costoMinimo;
								}
								correoParams.servicios += "<tr bgcolor='#e6e6e6'><td style='width: 60px;text-align: center;'>" +
									`<img src='${environment.urlMigracion}assets/images/system/ubicacion_correo.png' width='43' height='55'></td>` +
									"<td>Ubicación:</td><td>" + direccion + "</td></tr>" + "<tr><td style='width: 60px;text-align: center;'>" +
									`<img src='${environment.urlMigracion}assets/images/system/telefono_correo.png' width='34' height='55'></td>` +
									"<td>Teléfono:</td><td>" + dataCita[0].telefonoCliente + "</td></tr>" + "<tr><td style='width: 60px;text-align: center;'>" +
									"<tr bgcolor='#e6e6e6'><td style='width: 60px;text-align: center;'>" +
									`<img src='${environment.urlMigracion}assets/images/system/cliente_correo.png' width='43' height='55'></td>` +
									"<td>Cliente:</td><td>" + dataCita[0].nombreCliente + "</td></tr>";

								correoParams.costo = costoMin == costoMax ? "$" + costoMin.toFixed(2) : "$" + costoMin.toFixed(2) + " - " + "$" + costoMax.toFixed(2);
								correoParams.idioma = "ESP";
								correoParams.id_sucursal = this.empresa.idSucursalSeleccionada;

								this._backService.HttpPost("movil/UsuarioMovil/correoResumen", {}, correoParams).subscribe(
									response => {
										this._pantallaServicio.ocultarSpinner();
									},
									error => {
										this._toaster.error(error.Message);
										this._pantallaServicio.ocultarSpinner();
									}
								);
							},
							error => {
								this._toaster.error(error.Message);
								this._pantallaServicio.ocultarSpinner();
							}
						);
					}
					else {
						this._toaster.error(this.agendaTranslate.reciboClienteSinEmail);
						this._pantallaServicio.ocultarSpinner();
					}
				},
				error => {
					this._toaster.error(error.Message);
					this._pantallaServicio.ocultarSpinner();
				}
			);
		}
	}

	mostrarModalCitaAgendada(message?: any) {
		this.textModalCitaAgendada = message;
		this.modales.modalCitaAgendada.show();
	}


	// ------------------------------------------ Funciones de Paypal ------------------------------------------
	async agregarSDK() {
		try {
			this.paypal = await loadScript({ "client-id": this.sucursal.configuracion.idPaypal, currency: 'MXN', "disable-funding": 'credit,card' });
			if (typeof this.paypal === 'undefined') {
				this.sucursal.configuracion.pagoConPaypal = false;
			}
		} catch (error) {
			this._toaster.error("Hubo un error con Paypal, favor de intentarlo más tarde");
		}
	}

	generarBotonPaypal() {
		this._pantallaServicio.mostrarSpinner();

		// Se verifica si se pagará con paypal
		let pagoPaypalBand = false;
		for (let i = 0; i < this.cita.servicios.length; i++) {
			let elem = JSON.parse(JSON.stringify(this.cita.servicios[i]));
			if (elem.pagoConPaypal) {
				pagoPaypalBand = true;
			}
		}

		this.wizard.mostrarBotonAgendar = false;
		this.wizard.mostrarBotonPaypal = false;

		if (pagoPaypalBand) {

			setTimeout(() => {
				// Si se paga con paypal se cargan el botón para pagar con paypal y crear la cita
				this.wizard.mostrarBotonAgendar = false;
				this.wizard.mostrarBotonPaypal = true;

				// Se vuelven a calcular el total que se pagará con paypal
				this.calcularCitaPaypalTotal();

				setTimeout(() => {
					// Se vuelven a generar los botones

					this.paypal.Buttons({
						style: {
							color: 'blue',
						},
						// Se crea una orden de compra con el monto total que pagará el cliente
						createOrder: (data: any, actions: any) => {
							this._pantallaServicio.mostrarSpinner();
							return actions.order.create({
								purchase_units: [{
									amount: {
										value: this.cita.paypalTotal.toString()
									}
								}]
							});
						},

						onApprove: (data: any, actions: any) => {
							return actions.order.capture().then((details: any) => {
								this.agendarConPagoPaypal(details);
							});
						},

						onCancel: (data: any, actions: any) => {
							this._toaster.error("Se canceló el pago con Paypal");
							this._pantallaServicio.ocultarSpinner();
						},

						onError: (data: any, actions: any) => {
							this._toaster.error("Hubo un error con Paypal, favor de intentarlo más tarde");
							this._pantallaServicio.ocultarSpinner();
						},

					}).render('#botonesPaypal');

					setTimeout(() => {
						this._pantallaServicio.ocultarSpinner();
					}, 100);

				}, 100);

			}, 100);

		}
		else {
			// Si no se va a pagar nada con paypal, se muestra el botón de agendar normal
			this.wizard.mostrarBotonAgendar = true;
			this.wizard.mostrarBotonPaypal = false;

			this._pantallaServicio.ocultarSpinner();
		}

	}

	validarEntradaSoloNumeros(evt?: any) {
		var theEvent = evt || window.event;

		// Handle paste
		if (theEvent.type === 'paste') {
			key = evt.clipboardData.getData('text/plain');
		} else {
			// Handle key press
			var key = theEvent.keyCode || theEvent.which;
			key = String.fromCharCode(key);
		}

		var regex = /^[0-9]*$/;
		if (!regex.test(key)) {
			theEvent.returnValue = false;
			if (theEvent.preventDefault) theEvent.preventDefault();
		}
	}
}
