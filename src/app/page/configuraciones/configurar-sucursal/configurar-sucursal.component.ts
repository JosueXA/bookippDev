import { Component, AfterViewInit , ViewChild } from '@angular/core';
// TRANSLATE
import { TranslateService } from '@ngx-translate/core';
import { MethodsService } from 'src/app/core/services/methods.service';
import { PantallaService } from 'src/app/core/services/pantalla.service';
import { Router, ActivatedRoute } from '@angular/router';

// JQUERY
declare var $: any;
import * as bootstrap from 'bootstrap'; // BOOTSTRAP
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatTableDataSource } from '@angular/material/table';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';

@Component({
	selector: 'app-configurar-sucursal',
	templateUrl: './configurar-sucursal.component.html',
	styleUrls: ['./configurar-sucursal.component.scss', '../../page.component.scss'],
})
export class ConfigurarSucursalComponent implements AfterViewInit  {
	// Variables de permisos
	permisos_gerente: any = [];
	permisos_visualizacion: any = [];

	// Variables de Translate
	configuracionSucursalTranslate_codigoSucursalRepetido: any = '';
	configuracionSucursalTranslate_nombreFormato: any = '';
	configuracionSucursalTranslate_correoFormato: any = '';
	configuracionSucursalTranslate_noMayor365: any = '';
	configuracionSucursalTranslate_diasMayor0: any = '';
	configuracionSucursalTranslate_noMayor720: any = '';
	configuracionSucursalTranslate_Mayor0: any = '';
	configuracionSucursalTranslate_impuestoRango: any = '';
	configuracionSucursalTranslate_numeroFormato: any = '';
	configuracionSucursalTranslate_coloniaFormato: any = '';
	configuracionSucursalTranslate_ciudadFormato: any = '';
	configuracionSucursalTranslate_numeroInteriorFormato: any = '';
	configuracionSucursalTranslate_telefonoFormato: any = '';
	configuracionSucursalTranslate_telefonoOficinaFormato: any = '';
	configuracionSucursalTranslate_nombreContactoFormato: any = '';
	configuracionSucursalTranslate_rfcFormato: any = '';
	configuracionSucursalTranslate_soloEnteros: any = '';
	configuracionSucursalTranslate_calleFormato: any = '';
	configuracionSucursalTranslate_codigoPostFormato: any = '';
	configuracionSucursalTranslate_aliasRepetido: any = '';
	configuracionSucursalTranslate_descartarCambios: any = '';
	configuracionSucursalTranslate_eliminar: any = '';
	configuracionSucursalTranslate_nombrePaginaWeb: any = '';

	// Modales
	modales: any = {};
	modalAlert_mensaje = "";
	modalConfirm_mensaje = "";

	//Mat-table Datos, paginacion, ordenamiento
	displayedColumns: string[] = ["idEmpresaFbSucursal", "nombre"];
	dataSource = new MatTableDataSource<any>([]);
	@ViewChild(MatPaginator) paginator!: MatPaginator;
	@ViewChild(MatSort) sort!: MatSort;

    //Validacion de guardar permisos
    permiso_guardar: boolean = false;

	//--- Inicialicacion para el paginator
	ngAfterViewInit() {
		this.paginator._intl.itemsPerPageLabel = 'filas por pagina';
		this.dataSource.paginator = this.paginator;
		this.dataSource.sort = this.sort;
	}

	constructor(
		private _backService: MethodsService,
		private _pantallaServicio: PantallaService,
		private _translate: TranslateService,
		private _liveAnnouncer: LiveAnnouncer,
		private _router: Router,
		private matIconRegistry: MatIconRegistry,
		private domSanitizer: DomSanitizer,
	) {
		this._translate.setDefaultLang(this._pantallaServicio.idioma);
		this._translate.use(this._pantallaServicio.idioma);

		this._translate.get('servicioTranslate.inicio').subscribe((translated: string) => {
			this.configuracionSucursalTranslate_codigoSucursalRepetido = this._translate.instant('configuracionSucursalTranslate.codigoSucursalRepetido');
			this.configuracionSucursalTranslate_nombreFormato = this._translate.instant('configuracionSucursalTranslate.nombreFormato');
			this.configuracionSucursalTranslate_correoFormato = this._translate.instant('configuracionSucursalTranslate.correoFormato');
			this.configuracionSucursalTranslate_noMayor365 = this._translate.instant('configuracionSucursalTranslate.noMayor365');
			this.configuracionSucursalTranslate_diasMayor0 = this._translate.instant('configuracionSucursalTranslate.diasMayor0');
			this.configuracionSucursalTranslate_noMayor720 = this._translate.instant('configuracionSucursalTranslate.noMayor720');
			this.configuracionSucursalTranslate_Mayor0 = this._translate.instant('configuracionSucursalTranslate.Mayor0');
			this.configuracionSucursalTranslate_impuestoRango = this._translate.instant('configuracionSucursalTranslate.impuestoRango');
			this.configuracionSucursalTranslate_numeroFormato = this._translate.instant('configuracionSucursalTranslate.numeroFormato');
			this.configuracionSucursalTranslate_coloniaFormato = this._translate.instant('configuracionSucursalTranslate.coloniaFormato');
			this.configuracionSucursalTranslate_ciudadFormato = this._translate.instant('configuracionSucursalTranslate.ciudadFormato');
			this.configuracionSucursalTranslate_numeroInteriorFormato = this._translate.instant('configuracionSucursalTranslate.numeroInteriorFormato');
			this.configuracionSucursalTranslate_telefonoFormato = this._translate.instant('configuracionSucursalTranslate.telefonoFormato');
			this.configuracionSucursalTranslate_telefonoOficinaFormato = this._translate.instant('configuracionSucursalTranslate.telefonoOficinaFormato');
			this.configuracionSucursalTranslate_nombreContactoFormato = this._translate.instant('configuracionSucursalTranslate.nombreContactoFormato');
			this.configuracionSucursalTranslate_rfcFormato = this._translate.instant('configuracionSucursalTranslate.rfcFormato');
			this.configuracionSucursalTranslate_soloEnteros = this._translate.instant('configuracionSucursalTranslate.soloEnteros');
			this.configuracionSucursalTranslate_calleFormato = this._translate.instant('configuracionSucursalTranslate.calleFormato');
			this.configuracionSucursalTranslate_codigoPostFormato = this._translate.instant('configuracionSucursalTranslate.codigoPostFormato');
			this.configuracionSucursalTranslate_aliasRepetido = this._translate.instant('configuracionSucursalTranslate.aliasRepetido');
			this.configuracionSucursalTranslate_descartarCambios = this._translate.instant('configuracionSucursalTranslate.descartarCambios');
			this.configuracionSucursalTranslate_eliminar = this._translate.instant('configuracionSucursalTranslate.eliminar');
			this.configuracionSucursalTranslate_nombrePaginaWeb = this._translate.instant('configuracionSucursalTranslate.nombrePaginaWeb');
		});
		
		this.matIconRegistry.addSvgIcon('iconCasita', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Casa1-icon.svg"));
		this.matIconRegistry.addSvgIcon('iconCerrarModal', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/10-2-TiposdeExcepcion-icon.svg"));
		this.matIconRegistry.addSvgIcon('iconFlechaDerecha', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/FlechaDerechaPequena-icon.svg"));

        this.permiso_guardar = String(this._pantallaServicio.session['CONFIGCT012'] || '') === '1';
	}

	ngOnInit(): void {
		this._pantallaServicio.mostrarSpinner();
		this.informacionFiscalSucursal_cargarPaises();
		this.informacionFiscalSucursal_cargarFormasDePago();
		this.informacionFiscalSucursal_cargarMetodosDePago();
		this.informacionFiscalSucursal_cargarUsoCFDI();
		this.informacionFiscalSucursal_cargarRegimen();
		this.validarTipoUsuario();
		this.generarLink();
		this.consultarPaginas();
		this.crearModales();
		this.consultarParametros();
	}


	crearModales() {
		this.modales.modalAlert = new bootstrap.Modal($("#modal-alert").appendTo("body"), {
			backdrop: "static",
			keyboard: false,
		});

		this.modales.modalConfirm = new bootstrap.Modal($("#modal-confirm").appendTo("body"), {
			backdrop: "static",
			keyboard: false,
		});

		this.modales.modalFacebook = new bootstrap.Modal($("#modalFacebook").appendTo("body"), {
			backdrop: "static",
			keyboard: false,
		});
	}

	//!-- DECLARACION DE VARIABLES----------------------------------
	rootScope_fromState = 'configuracionSucursal';

	infoFiscalR = false;
	esGerenteGeneral = false;
	esGerenteSucursal = false;
	parametro: any = {
		tiempoCita: '',
		horasCita: '',
		personal: false,
		cabina: false,
		citaonline: false,
		confirmacion: false,
		recordatorio: false,
		horasRecordatorio: '',
		cancelarCita: '',
		activarChat: false,
		costoVisible: false,
		codigoSucursal: '',
		nombreFacebook: '',
		idFacebook: '',
		zonaHoraria: null,
		impuesto: '',
		fondoCaja: '',
		enviarSMSCreacionCita: false,
		enviarSMSRecordatorioCita: false,
		enviarWPPCreacionCita: false,
		enviarWPPRecordatorioCita: false,
	};
	colorCitas: any = {
		pendientes: '',
		confirmadas: '',
		proceso: '',
		terminadas: '',
		canceladas: '',
		descansos: '',
		servicios: '',
	};
	dataCarga: any = [];
	dataNew: any = [];
	//dataFacebook: any = [];
	idBorrarFacebook: any = [];
	confCambios: any = {};
	confCambiosParametros: any = {};
	correo: any = {
		cuenta: '',
		password: '',
		servidor: '',
		puerto: '',
	};
	informacionFiscalSucursal: any = {
		id: 0,
		radioTipo: 0,
		nombre: '',
		RFC: '',
		curp: '',
		pais: 0,
		calle: '',
		estado: 0,
		colonia: '',
		ciudad: '',
		codigoPostal: '',
		numeroInterior: '',
		numero: '',
		telefono: '',
		email: '',
		nombreContacto: '',
		telefonoOficina: '',
		metodoPago: '',
		digitosCuenta: '',
		alias: '',
		usoCFDI: '',
		cuenta: '',
		banco: '',
		clabeInterbancaria: '',
		direccionBanco: '',
		sucursalBanco: '',
		modelFormasDePago: 0,
		modelMetodosDePago: 0,
		modelUsosCFDI: 0,
		idSucursal: 0,
		valMoral: 1,
		valFisica: 1,
		infoEmpresa: false,
		dataInformacionFiscalSucursal: [],
		dataSucursales: [],
		dataEstados: [],
		dataPaises: [],
		formasDePago: [],
		metodosDePago: [],
		usosCFDI: [],
		razonSocial: '',
	};
	dataRegimen: any = [];
	band1 = true;
	bandSpinner = true;

	// ---------------------------------------- Zonas Horarias ----------------------------------------
	listadoZonasHorarias: any = [];
	// ------------------------------- Estado de Actividad de Clientes --------------------------------
	estadoActividadClientes: any = {
		activo: {
			clienteActivoPorCita: false,
		},
		nuevo: {
			clienteNuevoPorDias: false,
		},
	};
	// ---------------------------------------- Pago con Paypal ---------------------------------------
	paypalConfiguracion: any = {
		pagoConPaypal: false,
		idPaypal: '',
		paypalComisionCliente: false,
	};
	// ------------------------------------------- Pestañas -------------------------------------------
	tabActive = 1;
	listas: any = {
		liCitas: {
			width: '20%',
			display: 'block',
		},
		liFacebook: {
			width: '20%',
			display: 'block',
		},
		liInfoFacturacion: {
			width: '20%',
			display: 'block',
		},
		liCorreo: {
			width: '20%',
			display: 'block',
		},
		liPaypal: {
			width: '20%',
			display: 'block',
		},
	};

	guardar = false;
	valido1 = false;
	valido2 = false;
	valido3 = false;
	cancel = false;
	correoEmpresa = '';
	facebookButtonLink = '';
	facebookIFrameLink = '';
	integracion = '';

	//!--- DECLARACION DE FUNCIONES ------------------

	//!-- funcion incompleta --- falta algunos datos que se deben traer del login o validacion de autentificacion
	consultarParametros() {
		this._backService.HttpPost('configuracion/ConfiguracionSucursal/consultarParametros', {}, {}).subscribe(
			(response: string) => {
				if (this.dataCarga.length > 0) {
					this.limpiarCampos();
					this.dataCarga = [];
				}

				var dataTemp = eval(response);

				// Carga la información de la configuraciónd de la sucursal
				this.parametro.tiempoCita = dataTemp[0].tiempoCita;
				this.parametro.horasCita = dataTemp[0].horasCita;
				this.parametro.cancelarCita = dataTemp[0].cancelarCita;
				this.parametro.horasRecordatorio = dataTemp[0].horasRecordatorio;
				this.parametro.impuesto = dataTemp[0].impuesto;
				this.parametro.fondoCaja = dataTemp[0].fondoCaja;
				this.parametro.zonaHoraria = dataTemp[0].zonaHoraria;
				this.parametro.enviarSMSCreacionCita = dataTemp[0].enviarSMSCreacionCita === '1' ? true : false;
				this.parametro.enviarSMSRecordatorioCita = dataTemp[0].enviarSMSRecordatorioCita === '1' ? true : false;
				this.parametro.enviarWPPCreacionCita = dataTemp[0].enviarWPPCreacionCita === '1' ? true : false;
				this.parametro.enviarWPPRecordatorioCita = dataTemp[0].enviarWPPRecordatorioCita === '1' ? true : false;
				
				// Carga la configuración del correo de la sucursal
				this.correo.cuenta = dataTemp[0].correoCuenta;
				this.correo.password = dataTemp[0].correoPassword;
				this.correo.servidor = dataTemp[0].correoServidor;
				this.correo.puerto = dataTemp[0].correoPuerto;

				dataTemp[0].personal.toLowerCase() === 'si' ? this.parametro.personal = true : this.parametro.personal = false;
				dataTemp[0].confirmacion.toLowerCase() === 'si' ? this.parametro.confirmacion = true : this.parametro.confirmacion = false;
				dataTemp[0].recordatorio.toLowerCase() === 'si' ? this.parametro.recordatorio = true : this.parametro.recordatorio = false;
				dataTemp[0].activarChat.toLowerCase() === 'si' ? this.parametro.activarChat = true : this.parametro.activarChat = false;
				dataTemp[0].costoVisible.toLowerCase() === 'si' ? this.parametro.costoVisible = true : this.parametro.costoVisible = false;
				dataTemp[0].cabina.toLowerCase() === 'si' ? this.parametro.cabina = true : this.parametro.cabina = false;
				dataTemp[0].citaonline.toLowerCase() === 'si' ? this.parametro.citaonline = true : this.parametro.citaonline = false;

				// Carga la configuración de los colores de citas
				this.colorCitas.pendientes = dataTemp[0].pendientes;
				this.colorCitas.confirmadas = dataTemp[0].confirmadas;
				this.colorCitas.proceso = dataTemp[0].proceso;
				this.colorCitas.terminadas = dataTemp[0].terminadas;
				this.colorCitas.canceladas = dataTemp[0].canceladas;
				this.colorCitas.descansos = dataTemp[0].descansos;
				this.colorCitas.servicios = dataTemp[0].servicios;
				$('.onoffswitch-label').css('display', 'block');

				// Carga la configuración de paypal
				this.paypalConfiguracion.pagoConPaypal = dataTemp[0].pagoConPaypal === '1' ? true : false;
				this.paypalConfiguracion.idPaypal = dataTemp[0].idPaypal;
				this.paypalConfiguracion.paypalComisionCliente = dataTemp[0].paypalComisionCliente === '1' ? true : false;

				this._backService.HttpPost('configuracion/ConfiguracionSucursal/consultaCodigoSucursal', {}, {}).subscribe(
					(response: string) => {
						this.parametro.codigoSucursal = eval(response)[0].codigoSucursal;
						this.confCambiosParametros = Object.assign({}, this.parametro);
						this.consultarZonasHorarias();
						this.consultarConfiguracionEstadoActividadClientesSucursal();
						this.informacionFiscalSucursal_cargarInformacionFiscalSucursal();
					},
					(error) => { }
				);

				const infoParametroTemp: any = {
					nombreFacebook: dataTemp[0].nombreFacebook,
					tiempoCita: dataTemp[0].tiempoCita,
					horasCita: dataTemp[0].horasCita,
					cancelarCita: dataTemp[0].cancelarCita,
					horasRecordatorio: dataTemp[0].horasRecordatorio,
					personal: this.parametro.personal,
					confirmacion: this.parametro.confirmacion,
					recordatorio: this.parametro.recordatorio,
					activarChat: this.parametro.activarChat,
					cabina: this.parametro.cabina,
					citaonline: this.parametro.citaonline,
				};
				this.dataCarga.push(Object.assign({}, infoParametroTemp));
			},
			(error) => { }
		);
	}

	// Carga la lista de paises para el dropdown del campo Pais
	informacionFiscalSucursal_cargarPaises() {
		this._backService.HttpPost('catalogos/Pais/getPaises', {}, null).subscribe(
			(response: string) => {
				this.informacionFiscalSucursal.dataPaises = eval(response);
				if (this.informacionFiscalSucursal.dataPaises != null) {
					this.informacionFiscalSucursal.pais = this.informacionFiscalSucursal.dataPaises[0].idPais;
					this.informacionFiscalSucursal_cargarEstados(null);
				}
			},
			(error) => { }
		);
	}

	// Carga la lista de estados para el dropdown del campo Pais
	informacionFiscalSucursal_cargarEstados(cambio: any) {
		var params: any = {};
		params.idPais = this.informacionFiscalSucursal.pais;
		this._backService.HttpPost('catalogos/Estado/cargarEstadosEnPais', {}, params).subscribe(
			(response: string) => {
				this.informacionFiscalSucursal.dataEstados = eval(response);
				if (this.informacionFiscalSucursal.dataEstados != null) {
					if (cambio != null) {
						this.informacionFiscalSucursal.estado = this.informacionFiscalSucursal.dataEstados[0].idEstado;
					}
				}
			},
			(error) => {
			}
		);
	}

	// Cargar información
	informacionFiscalSucursal_cargarInformacionFiscalSucursal() {
		this._backService.HttpPost('configuracion/ConfiguracionSucursal/cargarInformacionFiscalSucursal', {}, {}).subscribe(
			(response: string) => {
				this.informacionFiscalSucursal.dataInformacionFiscalSucursal = eval(response);
				if (this.informacionFiscalSucursal.dataInformacionFiscalSucursal.length > 0) {
					this.informacionFiscalSucursal.id = this.informacionFiscalSucursal.dataInformacionFiscalSucursal[0].idInformacionFiscalSucursal;
					this.informacionFiscalSucursal.RFC = this.informacionFiscalSucursal.dataInformacionFiscalSucursal[0].RFC;
					this.informacionFiscalSucursal.pais = this.informacionFiscalSucursal.dataInformacionFiscalSucursal[0].idPais;
					if (this.informacionFiscalSucursal.pais === '' || this.informacionFiscalSucursal.pais === undefined) {
						this.informacionFiscalSucursal.pais = 1;
					}
					this.informacionFiscalSucursal.calle = this.informacionFiscalSucursal.dataInformacionFiscalSucursal[0].calle;
					this.informacionFiscalSucursal.estado = this.informacionFiscalSucursal.dataInformacionFiscalSucursal[0].idEstado;
					this.informacionFiscalSucursal_cargarEstados(null);
					this.informacionFiscalSucursal.colonia = this.informacionFiscalSucursal.dataInformacionFiscalSucursal[0].colonia;
					this.informacionFiscalSucursal.ciudad = this.informacionFiscalSucursal.dataInformacionFiscalSucursal[0].ciudad;
					this.informacionFiscalSucursal.codigoPostal = this.informacionFiscalSucursal.dataInformacionFiscalSucursal[0].codigoPostal;
					this.informacionFiscalSucursal.numeroInterior = this.informacionFiscalSucursal.dataInformacionFiscalSucursal[0].numeroInterior;
					this.informacionFiscalSucursal.numero = this.informacionFiscalSucursal.dataInformacionFiscalSucursal[0].numero;
					this.informacionFiscalSucursal.telefono = this.informacionFiscalSucursal.dataInformacionFiscalSucursal[0].telefono;
					this.informacionFiscalSucursal.email = this.informacionFiscalSucursal.dataInformacionFiscalSucursal[0].email;
					this.informacionFiscalSucursal.nombreContacto = this.informacionFiscalSucursal.dataInformacionFiscalSucursal[0].nombreContacto;
					this.informacionFiscalSucursal.telefonoOficina = this.informacionFiscalSucursal.dataInformacionFiscalSucursal[0].numeroContacto;
					this.informacionFiscalSucursal.modelMetodosDePago = this.informacionFiscalSucursal.dataInformacionFiscalSucursal[0].idDatosFiscalesMetodoPago;
					if (this.informacionFiscalSucursal.modelMetodosDePago === '' || this.informacionFiscalSucursal.modelMetodosDePago === undefined) {
						this.informacionFiscalSucursal.modelMetodosDePago = 1;
					}
					this.informacionFiscalSucursal.digitosCuenta = this.informacionFiscalSucursal.dataInformacionFiscalSucursal[0].digitosCuenta;
					this.informacionFiscalSucursal.alias = this.informacionFiscalSucursal.dataInformacionFiscalSucursal[0].alias;
					this.informacionFiscalSucursal.modelUsosCFDI = this.informacionFiscalSucursal.dataInformacionFiscalSucursal[0].idDatosFiscalesUsoCFDI;
					if (this.informacionFiscalSucursal.modelUsosCFDI === '' || this.informacionFiscalSucursal.modelUsosCFDI === undefined) {
						this.informacionFiscalSucursal.modelUsosCFDI = 22;
					}
					this.informacionFiscalSucursal.modelFormasDePago = this.informacionFiscalSucursal.dataInformacionFiscalSucursal[0].idDatosFiscalesFormaPago;
					if (this.informacionFiscalSucursal.modelFormasDePago === '' || this.informacionFiscalSucursal.modelFormasDePago === undefined) {
						this.informacionFiscalSucursal.modelFormasDePago = 23;
					}
					this.informacionFiscalSucursal.banco = this.informacionFiscalSucursal.dataInformacionFiscalSucursal[0].banco;
					this.informacionFiscalSucursal.cuenta = this.informacionFiscalSucursal.dataInformacionFiscalSucursal[0].cuenta;
					this.informacionFiscalSucursal.clabeInterbancaria = this.informacionFiscalSucursal.dataInformacionFiscalSucursal[0].clabeInterbancaria;
					this.informacionFiscalSucursal.direccionBanco = this.informacionFiscalSucursal.dataInformacionFiscalSucursal[0].direccionBanco;
					this.informacionFiscalSucursal.sucursalBanco = this.informacionFiscalSucursal.dataInformacionFiscalSucursal[0].sucursalBanco;
					this.informacionFiscalSucursal.curp = this.informacionFiscalSucursal.dataInformacionFiscalSucursal[0].curp;
					this.informacionFiscalSucursal.regimenFiscal = this.informacionFiscalSucursal.dataInformacionFiscalSucursal[0].regimenFiscal;
					if (this.informacionFiscalSucursal.regimenFiscal === '' || this.informacionFiscalSucursal.regimenFiscal === undefined) {
						if (this.informacionFiscalSucursal.radioTipo === '0') {
							this.informacionFiscalSucursal.regimenFiscal = 3;
						}
						if (this.informacionFiscalSucursal.regimenFiscal === 1) {
							this.informacionFiscalSucursal.regimenFiscal = 1;
						}
					}
					this.informacionFiscalSucursal.razonSocial = this.informacionFiscalSucursal.dataInformacionFiscalSucursal[0].razon_social;

					if (this.informacionFiscalSucursal.dataInformacionFiscalSucursal[0].idEmpresa != null) {
						this.informacionFiscalSucursal.infoEmpresa = true;
					}
					this.informacionFiscalSucursal.nombre = this.informacionFiscalSucursal.dataInformacionFiscalSucursal[0].nombre;
					if (this.informacionFiscalSucursal.dataInformacionFiscalSucursal[0].tipo === 'Moral') {
						this.informacionFiscalSucursal.radioTipo = '1';
						this.informacionFiscalSucursal.tamanioRFC = 12;
						// $('#fisicaInput').checked = false;
						// $('#moralInput').checked = true;
						// $('#divCURP').style.display = 'none';
						// $('#divRFC').style.display = 'block';
					} else {
						this.informacionFiscalSucursal.radioTipo = '0';
						this.informacionFiscalSucursal.tamanioRFC = 13;
						// $('#fisicaInput').checked = true;
						// $('#moralInput').checked = false;
						// $('#divCURP').style.display = 'block';
						// $('#divRFC').style.display = 'block';
					}

					//CHECAR
					var infoFiscalTemp: any = {
						radioTipo: this.informacionFiscalSucursal.radioTipo,
						nombre: this.informacionFiscalSucursal.nombre,
						RFC: this.informacionFiscalSucursal.RFC,
						pais: this.informacionFiscalSucursal.pais,
						calle: this.informacionFiscalSucursal.calle,
						estado: this.informacionFiscalSucursal.estado,
						colonia: this.informacionFiscalSucursal.colonia,
						ciudad: this.informacionFiscalSucursal.ciudad,
						codigoPostal: this.informacionFiscalSucursal.codigoPostal,
						numeroInterior: this.informacionFiscalSucursal.numeroInterior,
						numero: this.informacionFiscalSucursal.numero,
						telefono: this.informacionFiscalSucursal.telefono,
						email: this.informacionFiscalSucursal.email,
					};
					this.dataCarga.push(Object.assign({}, infoFiscalTemp));
					this.confCambios = Object.assign({}, this.informacionFiscalSucursal); //Para checar cambios al momento de querer cambiar de pestaña
				} else {
					this.informacionFiscalSucursal.id = 0;
					this.confCambios = Object.assign({}, this.informacionFiscalSucursal);
				}

				this._pantallaServicio.ocultarSpinner();
				$('.btnGuardar').removeClass('disabled');

				this.onChangeDdlEstado();
				this.band1 = true;
			},
			(error) => { }
		);
	}

	// Carga de opciones del dropdown list de forma de pago
	informacionFiscalSucursal_cargarFormasDePago() {
		this._backService.HttpPost('configuracion/ConfiguracionSucursal/cargarFormasDePago', {}, {}).subscribe(
			(response: string) => {
				this.informacionFiscalSucursal.formasDePago = eval(response);
			},
			(error) => { }
		);
	}

	// Carga de opciones del dropdown list de metodo de pago
	informacionFiscalSucursal_cargarMetodosDePago() {
		this._backService.HttpPost('configuracion/ConfiguracionSucursal/cargarMetodosDePago', {}, {}).subscribe(
			(response: string) => {
				this.informacionFiscalSucursal.metodosDePago = eval(response);
			},
			(error) => { }
		);
	}

	// Carga de opciones del dropdown list de usoCFDI
	informacionFiscalSucursal_cargarUsoCFDI() {
		this._backService.HttpPost('configuracion/ConfiguracionSucursal/cargarUsoCFDI', {}, {}).subscribe(
			(response: string) => {
				this.informacionFiscalSucursal.usosCFDI = eval(response);
			},
			(error) => { }
		);
	}

	//Funcion que carga los regimen fiscales falta crear fc y llamado a ws con los datos Hause
	informacionFiscalSucursal_cargarRegimen() {
		var params: any = {};
		params.moral = this.informacionFiscalSucursal.valMoral;
		params.fisica = this.informacionFiscalSucursal.valFisica;
		this._backService.HttpPost('configuracion/ConfiguracionSucursal/cargarRegimen', {}, params).subscribe(
			(response: string) => {
				this.dataRegimen = eval(response);
			},
			(error) => { }
		);
	}

	guardarParametros() {
		this.valido1 = true;
		this.valido2 = true;
		this.valido3 = true;
		this.guardar = true;

		this.validadParametros();
		if (this.valido1) {
			//if (valido2) {
			if (this.valido3) {
				// Validación de la config de paypal
				if ((this.paypalConfiguracion.pagoConPaypal && this.paypalConfiguracion.idPaypal) || !this.paypalConfiguracion.pagoConPaypal) {
					var personal, confirmacion, recordatorio, activarChat, costoVisible, cabina, citaonline;
					((this.parametro.personal) ? personal = 'Si' : personal = 'No');
					((this.parametro.confirmacion) ? confirmacion = 'Si' : confirmacion = 'No');
					((this.parametro.recordatorio) ? recordatorio = 'Si' : recordatorio = 'No');
					((this.parametro.activarChat) ? activarChat = 'Si' : activarChat = 'No');
					((this.parametro.costoVisible) ? costoVisible = 'Si' : costoVisible = 'No');
					((this.parametro.cabina) ? cabina = 'Si' : cabina = 'No');
					((this.parametro.citaonline) ? citaonline = 'Si' : citaonline = 'No');
					var params: any = {};
					params.datos = [
						this.parametro.tiempoCita,
						this.parametro.horasCita,
						personal,
						confirmacion,
						recordatorio,
						this.parametro.cancelarCita,
						activarChat,
						this.colorCitas.pendientes,
						this.colorCitas.descansos,
						this.colorCitas.proceso,
						this.colorCitas.terminadas,
						this.colorCitas.canceladas,
						this.parametro.nombreFacebook,
						this.parametro.idFacebook,
						this.colorCitas.confirmadas,
						this.parametro.horasRecordatorio,
						this.colorCitas.servicios,
						costoVisible,
						this.parametro.impuesto,
						this.correo.cuenta,
						this.correo.password,
						this.correo.servidor,
						this.correo.puerto,
						this.parametro.fondoCaja,
						this.parametro.zonaHoraria,
						cabina,
						this.parametro.enviarSMSCreacionCita ? 1 : 0,
						this.parametro.enviarSMSRecordatorioCita ? 1 : 0,
						this.parametro.enviarWPPCreacionCita ? 1 : 0,
						this.parametro.enviarWPPRecordatorioCita ? 1 : 0,
						this.paypalConfiguracion.pagoConPaypal ? 1 : 0,
						this.paypalConfiguracion.idPaypal,
						this.paypalConfiguracion.paypalComisionCliente ? 1 : 0,
						citaonline,
					];

					var params2: any = {};
					params2.codigoSucursal = this.parametro.codigoSucursal;

					this._backService.HttpPost('configuracion/ConfiguracionSucursal/actualizarCodigoSucursal', {}, params2).subscribe(
						(response: string) => {
							if (eval(response) === -2) {
								this.modalAlert_mensaje = this.configuracionSucursalTranslate_codigoSucursalRepetido;
								this.modales.modalAlert.show();
								$(".btnGuardar").removeClass("disabled");
								this._pantallaServicio.ocultarSpinner();
								this.bandSpinner = true;
							} else {
								this._backService.HttpPost('configuracion/ConfiguracionSucursal/guardarParametros', {}, params).subscribe(
									(response: string) => {
										this.bandSpinner = false;
										if (this.informacionFiscalSucursal.RFC != '') {
											this.informacionFiscalSucursal_guardarInformacionFiscalSucursal();
										}
										this.guardarConfiguracionEstadoActividadClientesSucursal();
										this._pantallaServicio.ocultarSpinner();
									},
									(error) => {
										this._pantallaServicio.ocultarSpinner();
									}
								);
							}
						},
						(error) => {
							this._pantallaServicio.ocultarSpinner();
						}
					);
				} else {
					this.tabActive = 6;
					$('#inputClientIDPaypal').addClass('errorCampo');
					$('.btnGuardar').removeClass('disabled');
					this._pantallaServicio.ocultarSpinner();
				}
			} else {
				this.tabActive = 4;
				$('.btnGuardar').removeClass('disabled');
				this._pantallaServicio.ocultarSpinner();
			}
		} else {
			this.tabActive = 1;
			$('.btnGuardar').removeClass('disabled');
			this._pantallaServicio.ocultarSpinner();
		}
	}

	//Obtiene las ciudades
	onChangeDdlEstado() {
		var params: any = {};
		params.idEstado = this.informacionFiscalSucursal.estado;
		this._backService.HttpPost('catalogos/Ciudad/consultaCiudadesEnEstado', {}, params).subscribe(
			(response: string) => {
				this.informacionFiscalSucursal.dataCiudad = eval(response);
			},
			(error) => { }
		);
	}

	//Función que guarda la información usando los valores de los campos como parámetros Hause
	informacionFiscalSucursal_guardarInformacionFiscalSucursal() {
		var params: any = {};
		params.nombre = this.informacionFiscalSucursal.nombre;
		params.infoEmpresa = this.informacionFiscalSucursal.infoEmpresa;
		params.idInformacionFiscalSucursal = this.informacionFiscalSucursal.id;
		params.RFC = this.informacionFiscalSucursal.RFC;
		params.pais = this.informacionFiscalSucursal.pais;
		params.calle = this.informacionFiscalSucursal.calle;
		params.estado = this.informacionFiscalSucursal.estado;
		params.colonia = this.informacionFiscalSucursal.colonia;
		params.ciudad = this.informacionFiscalSucursal.ciudad;
		params.codigoPostal = this.informacionFiscalSucursal.codigoPostal;
		params.numeroInterior = this.informacionFiscalSucursal.numeroInterior;
		params.numero = this.informacionFiscalSucursal.numero;
		params.telefono = this.informacionFiscalSucursal.telefono;
		params.email = this.informacionFiscalSucursal.email;
		if (this.informacionFiscalSucursal.radioTipo === '0') {
			params.tipo = 'Física';
		} else {
			params.tipo = 'Moral';
		}
		params.nombreContacto = this.informacionFiscalSucursal.nombreContacto;
		params.telefonoOficina = this.informacionFiscalSucursal.telefonoOficina;
		params.metodoPago = this.informacionFiscalSucursal.modelMetodosDePago;
		params.digitosCuenta = this.informacionFiscalSucursal.digitosCuenta;
		params.alias = this.informacionFiscalSucursal.alias;
		params.usoCFDI = this.informacionFiscalSucursal.modelUsosCFDI;
		params.cuenta = this.informacionFiscalSucursal.cuenta;
		params.banco = this.informacionFiscalSucursal.banco;
		params.clabeInterbancaria = this.informacionFiscalSucursal.clabeInterbancaria;
		params.direccionBanco = this.informacionFiscalSucursal.direccionBanco;
		params.sucursalBanco = this.informacionFiscalSucursal.sucursalBanco;
		params.formaPago = this.informacionFiscalSucursal.modelFormasDePago;
		params.razonSocial = this.informacionFiscalSucursal.razonSocial === undefined ? '' : this.informacionFiscalSucursal.razonSocial;
		params.regimenFiscal = this.informacionFiscalSucursal.regimenFiscal;
		params.curp = this.informacionFiscalSucursal.curp;

		this._backService.HttpPost('configuracion/ConfiguracionSucursal/guardarInformacionFiscalSucursal', {}, params).subscribe(
			(response: string) => {
				if (eval(response) === 1) {
					$('#aliasInput').removeClass('errorCampo');
					$('#erroraliasInput').text('');
				} else {
					$('#aliasInput').addClass('errorCampo');
					$('#erroraliasInput').text(this.configuracionSucursalTranslate_aliasRepetido);
				}
			},
			(error) => { }
		);
	}

	//Función que valida los campos
	validadParametros() {
		if (this.validarCampos(this.parametro.tiempoCita, 'tiempoCita', 'requerido', 1)) {
			if (this.validarCampos(this.parametro.tiempoCita, 'tiempoCita', 'numero', 1)) {
				if (this.parametro.tiempoCita > 365) {
					this.validarCampos(this.configuracionSucursalTranslate_noMayor365, 'tiempoCita', 'otro', 1);
				}
				if (this.parametro.tiempoCita <= 0) {
					this.validarCampos(this.configuracionSucursalTranslate_diasMayor0, 'tiempoCita', 'otro', 1);
				}
			}
		}
		if (this.validarCampos(this.parametro.horasCita, 'horasCita', 'requerido', 1)) {
			if (this.validarCampos(this.parametro.horasCita, 'horasCita', 'numero', 1)) {
				if (this.parametro.horasCita > 720) {
					this.validarCampos(this.configuracionSucursalTranslate_noMayor720, 'horasCita', 'otro', 1);
				}
				if (this.parametro.horasCita < 0) {
					this.validarCampos(this.configuracionSucursalTranslate_Mayor0, 'horasCita', 'otro', 1);
				}
			}
		}
		if (this.validarCampos(this.parametro.impuesto, 'impuesto', 'requerido', 1)) {
			if (this.validarCampos(this.parametro.impuesto, 'impuesto', 'impuesto', 1)) {
				if (this.parametro.impuesto <= 0 || this.parametro.impuesto > 100) {
					this.validarCampos(this.configuracionSucursalTranslate_impuestoRango, 'impuesto', 'otro', 1);
				}
			}
		}

		if (this.validarCampos(this.parametro.cancelarCita, 'cancelarCita', 'requerido', 1)) {
			if (this.validarCampos(this.parametro.cancelarCita, 'cancelarCita', 'numero', 1)) {
				if (this.parametro.cancelarCita > 720) {
					this.validarCampos(this.configuracionSucursalTranslate_noMayor720, 'cancelarCita', 'otro', 1);
				}
				if (this.parametro.cancelarCita <= 0) {
					this.validarCampos(this.configuracionSucursalTranslate_Mayor0, 'cancelarCita', 'otro', 1);
				}
			}
		}
		if (this.validarCampos(this.parametro.horasRecordatorio, 'horasRecordatorio', 'requerido', 1)) {
			if (this.validarCampos(this.parametro.horasRecordatorio, 'horasRecordatorio', 'numero', 1)) {
				if (this.parametro.horasRecordatorio > 720) {
					this.validarCampos(this.configuracionSucursalTranslate_noMayor720, 'horasRecordatorio', 'otro', 1);
				}
				if (this.parametro.horasRecordatorio <= 0) {
					this.validarCampos(this.configuracionSucursalTranslate_Mayor0, 'horasRecordatorio', 'otro', 1);
				}
			}
		}

		if (this.validarCampos(this.parametro.fondoCaja, 'fondoCaja', 'requerido', 1)) {
			if (this.validarCampos(this.parametro.fondoCaja, 'fondoCaja', 'numero', 1)) {
				if (Number(this.parametro.fondoCaja) < 0) {
					this.validarCampos('Fondo de Caja debe ser mayor a 0', 'fondoCaja', 'otro', 1);
				}
			}
		}

		if (this.tabActive === 4) {
			var xCamp = [
				{ scope: this.informacionFiscalSucursal.RFC, name: 'rfcInput', tValid: 'rfc' }, //0
				//{ scope: this.informacionFiscalSucursal.colonia, name: 'coloniaInput', tValid: 'colonia' },//1 NO REQUERIDO
				{ scope: this.informacionFiscalSucursal.nombre, name: 'nombreInput', tValid: 'nombre' }, //2
				{ scope: this.informacionFiscalSucursal.codigoPostal, name: 'codigoPostalInput', tValid: 'codigoPostal' }, //3
				//{ scope: this.informacionFiscalSucursal.calle, name: 'calleInput', tValid: 'calle' },//4 NO REQUERIDO
				//{ scope: this.informacionFiscalSucursal.numero, name: 'numeroInput', tValid: 'numLetras' },//5 NO REQUERIDO
				//{ scope: this.informacionFiscalSucursal.numeroInterior, name: 'numeroInteriorInput', tValid: 'numInteriorLetras' },//6 NO REQUERIDO
				//{ scope: this.informacionFiscalSucursal.email, name: 'emailInput', tValid: 'correo' },//7
				//{ scope: this.informacionFiscalSucursal.ciudad, name: 'ciudadInput', tValid: 'ciudad' },//8 NO REQUERIDO
				//{ scope: this.informacionFiscalSucursal.telefono, name: 'telefonoInput', tValid: 'telefono' },//9 NO REQUERIDO
				//{ scope: this.informacionFiscalSucursal.telefonoOficina, name: 'telefonoOficinaInput', tValid: 'telefonoOficina' },//10 NO REQUERIDO
				//{ scope: this.informacionFiscalSucursal.nombreContacto, name: 'nombreContactoInput', tValid: 'nombreContacto' },//11 NO REQUERIDO
				//{ scope: this.informacionFiscalSucursal.digitosCuenta, name: 'digitosCuentaInput', tValid: 'digitosCuenta' },//12 NO REQUERIDO
				//{ scope: this.informacionFiscalSucursal.alias, name: 'aliasInput', tValid: 'alias' }];//13
				{ scope: this.informacionFiscalSucursal.modelUsosCFDI, name: 'usoCFDISelect', tValid: 'numero' },
				{ scope: this.informacionFiscalSucursal.modelMetodosDePago, name: 'metodosDePagoSelect', tValid: 'numero' },
				{ scope: this.informacionFiscalSucursal.modelFormasDePago, name: 'formasDePagoSelect', tValid: 'numero' },
			];

			for (var i = 0; i < xCamp.length; i++) {
				$('#' + xCamp[i].name).removeClass('errorCampo');
				$('#error' + xCamp[i].name).text('');
			}

			var validarFiscal = true;
			var camposLleno = 0;
			for (var i = 0; i < xCamp.length; i++) {
				if ($(`#${xCamp[i].name}`).value === '') {
					validarFiscal = false;
					this.valido3 = false;
				} else {
					camposLleno++;
				}
			}
			if (camposLleno != 0) {
				for (var i = 0; i < xCamp.length; i++) {
					if ($(`#${xCamp[i].name}`).value != '') {
						this.validarCampos(
							xCamp[i].scope,
							xCamp[i].name,
							xCamp[i].tValid,
							3
						);
					} else {
						if (i != 6 && i != 10 && i != 12) {
							$('#' + xCamp[i].name).addClass('errorCampo');
							$('#error' + xCamp[i].name).text('');
						}
					}
				}
			} else {
				this.valido3 = true;
			}
		}
	}

	//Función que valida los campos
	validarCampos(campo: any, name: any, tipo: any, v: any): any {
		var numExp = RegExp('^[0-9]*$');
		var regexRazonSocial = /^[A-Za-z\sÀ-ÖØ-öø-ÿ]{1,}[\.]{0,1}[A-Za-z\sÀ-ÖØ-öø-ÿ]{0,}$/;
		var regexnombres = /^[A-Za-z\sÀ-ÖØ-öø-ÿ]{1,}$/;
		var regexCalle = /^[a-zA-Z1-9À-ÖØ-öø-ÿ]+\.?(( |\-)[a-zA-Z1-9À-ÖØ-öø-ÿ]+\.?)*$/;
		var regexCodigoPostal = /^([1-9]{2}|[0-9][1-9]|[1-9][0-9])[0-9]{3}$/;
		var regexTelefono = new RegExp('^(\\(\\d{2}\\)|\\d{2})?-?(\\d{2})?-?\\d{2}-?\\d{2}-?\\d{2}-?\\d{2}$');
		var regexNumero = /^\d{0,15}$/;
		var regexNumeroLetras = /^[a-zA-Z0-9]+\.?(( |\-)[a-zA-Z0-9]+\.?)*$/;
		var regexMovil = new RegExp('^(\\(\\d{3}\\)|\\d{3})?-?((\\d{3}-?\\d{3}-?\\d{2}-?\\d{2})|(\\d{2}-?\\d{2}-?\\d{2}-?\\d{2}-?\\d{2}))$');
		var regexEmail = /^[_a-z0-9-]+(.[_a-z0-9-]+)*@[a-z0-9-]+(.[a-z0-9-]+)*(.[a-z]{2,4})$/;
		//var regexRFC = /^([A-Z|a-z|&amp;]{3})(([0-9]{2})([0][13456789]|[1][012])([0][1-9]|[12][\d]|[3][0])|([0-9]{2})([0][13578]|[1][02])([0][1-9]|[12][\d]|[3][01])|([02468][048]|[13579][26])([0][2])([0][1-9]|[12][\d])|([1-9]{2})([0][2])([0][1-9]|[12][0-8]))(\w{2}[A|a|0-9]{1})$|^([A-Z|a-z]{4})(([0-9]{2})([0][13456789]|[1][012])([0][1-9]|[12][\d]|[3][0])|([0-9]{2})([0][13578]|[1][02])([0][1-9]|[12][\d]|[3][01])|([02468][048]|[13579][26])([0][2])([0][1-9]|[12][\d])|([1-9]{2})([0][2])([0][1-9]|[12][0-8]))((\w{2})([A|a|0-9]{1})){0,3}$/;
		//var regexRFC = /^[a-zA-Z]{3,4}(\d{6})((\D|\d){3})?$/;
		var rfcFisica = /^[A-ZÑ&]{4}[0-9]{2}[0-1][0-9][0-3][0-9][A-Z0-9]{3}$/i;
		var rfcMoral = /^[A-ZÑ&]{3}[0-9]{2}[0-1][0-9][0-3][0-9][A-Z0-9]{3}$/i;
		var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

		if (tipo === 'razonSocial') {
			if (campo != '') {
				if (!regexRazonSocial.test(campo)) {
					$('#' + name).addClass('errorCampo');
					$('#error' + name).text(this.configuracionSucursalTranslate_nombreFormato);
					this.setFalseValidos(v);
					return false;
				} else {
					$('#' + name).removeClass('errorCampo');
					$('#error' + name).text('');
					return true;
				}
			} else {
				$('#' + name).addClass('errorCampo');
				$('#error' + name).text('');
				this.setFalseValidos(v);
				return false;
			}
		}
		if (tipo === 'numLetras') {
			if (campo != '') {
				if (!regexNumeroLetras.test(campo)) {
					$('#' + name).addClass('errorCampo');
					$('#error' + name).text(this.configuracionSucursalTranslate_numeroFormato);
					this.setFalseValidos(v);
					return false;
				} else {
					$('#' + name).removeClass('errorCampo');
					$('#error' + name).text('');
					return true;
				}
			} else {
				$('#' + name).addClass('errorCampo');
				$('#error' + name).text('');
				this.setFalseValidos(v);
				return false;
			}
		}
		if (tipo === 'colonia') {
			if (campo != '') {
				if (!regexRazonSocial.test(campo)) {
					$('#' + name).addClass('errorCampo');
					$('#error' + name).text(this.configuracionSucursalTranslate_coloniaFormato);
					this.setFalseValidos(v);
				} else {
					$('#' + name).removeClass('errorCampo');
					$('#error' + name).text('');
				}
			} else {
				$('#' + name).addClass('errorCampo');
				$('#error' + name).text('');
				this.setFalseValidos(v);
			}
		}
		if (tipo === 'ciudad') {
			if (campo != '') {
				if (!regexRazonSocial.test(campo)) {
					$('#' + name).addClass('errorCampo');
					$('#error' + name).text(this.configuracionSucursalTranslate_ciudadFormato);
					this.setFalseValidos(v);
				} else {
					$('#' + name).removeClass('errorCampo');
					$('#error' + name).text('');
				}
			} else {
				$('#' + name).addClass('errorCampo');
				$('#error' + name).text('');
				this.setFalseValidos(v);
			}
		}
		if (tipo === 'numInteriorLetras') {
			if (campo != '') {
				if (!regexNumeroLetras.test(campo)) {
					$('#' + name).addClass('errorCampo');
					$('#error' + name).text(this.configuracionSucursalTranslate_numeroInteriorFormato);
					this.setFalseValidos(v);
					return false;
				} else {
					$('#' + name).removeClass('errorCampo');
					$('#error' + name).text('');
					return true;
				}
			}
		}
		if (tipo === 'telefono') {
			if (campo != '') {
				if (!regexTelefono.test(campo)) {
					$('#' + name).addClass('errorCampo');
					$('#error' + name).text(this.configuracionSucursalTranslate_telefonoFormato);
					this.setFalseValidos(v);
					return false;
				} else {
					$('#' + name).removeClass('errorCampo');
					$('#error' + name).text('');
					return true;
				}
			} else {
				$('#' + name).addClass('errorCampo');
				$('#error' + name).text('');
				this.setFalseValidos(v);
				return false;
			}
		}
		if (tipo === 'telefonoOficina') {
			if (campo != '') {
				if (!regexTelefono.test(campo)) {
					$('#' + name).addClass('errorCampo');
					$('#error' + name).text(this.configuracionSucursalTranslate_telefonoOficinaFormato);
					this.setFalseValidos(v);
					return false;
				} else {
					$('#' + name).removeClass('errorCampo');
					$('#error' + name).text('');
					return true;
				}
			}
		}
		if (tipo === 'nombreContacto') {
			if (campo != '') {
				if (!regexnombres.test(campo)) {
					$('#' + name).addClass('errorCampo');
					$('#error' + name).text(this.configuracionSucursalTranslate_nombreContactoFormato);
					this.setFalseValidos(v);
					return false;
				} else {
					$('#' + name).removeClass('errorCampo');
					$('#error' + name).text('');
					return true;
				}
			} else {
				$('#' + name).addClass('errorCampo');
				$('#error' + name).text('');
				this.setFalseValidos(v);
				return false;
			}
		}
		if (tipo === 'alias') {
			if (campo != '') {
				$('#' + name).removeClass('errorCampo');
				$('#error' + name).text('');
				return true;
				//}
			} else {
				$('#' + name).addClass('errorCampo');
				$('#error' + name).text('');
				this.setFalseValidos(v);
				return false;
			}
		}
		if (tipo === 'rfc') {
			if (campo != '') {
				if (this.informacionFiscalSucursal.radioTipo === '0') {
					//fisico
					if (!rfcFisica.test(campo)) {
						$('#' + name).addClass('errorCampo');
						$('#error' + name).text(this.configuracionSucursalTranslate_rfcFormato);
						this.setFalseValidos(v);
						return false;
					} else {
						$('#' + name).removeClass('errorCampo');
						$('#error' + name).text('');
						return true;
					}
				} else {
					//moral
					if (!rfcMoral.test(campo)) {
						$('#' + name).addClass('errorCampo');
						$('#error' + name).text(this.configuracionSucursalTranslate_rfcFormato);
						this.setFalseValidos(v);
						return false;
					} else {
						$('#' + name).removeClass('errorCampo');
						$('#error' + name).text('');
						return true;
					}
				}
			} else {
				$('#' + name).addClass('errorCampo');
				$('#error' + name).text('');
				this.setFalseValidos(v);
				return false;
			}
		}
		if (tipo === 'numero') {
			if (campo != '') {
				if (!numExp.test(campo)) {
					$('#' + name).addClass('errorCampo');
					$('#error' + name).text(this.configuracionSucursalTranslate_soloEnteros);
					this.setFalseValidos(v);
					return false;
				} else {
					$('#' + name).removeClass('errorCampo');
					$('#error' + name).text('');
					return true;
				}
			} else {
				$('#' + name).addClass('errorCampo');
				$('#error' + name).text('');
				this.setFalseValidos(v);
				return false;
			}
		}
		if (tipo === 'nombre') {
			if (campo != '') {
				if (!regexRazonSocial.test(campo)) {
					$('#' + name).addClass('errorCampo');
					$('#error' + name).text(this.configuracionSucursalTranslate_nombreFormato);
					this.setFalseValidos(v);
					return false;
				} else {
					$('#' + name).removeClass('errorCampo');
					$('#error' + name).text('');
					return true;
				}
			} else {
				$('#' + name).addClass('errorCampo');
				$('#error' + name).text('');
				this.setFalseValidos(v);
				return false;
			}
		}
		if (tipo === 'calle') {
			if (campo != '') {
				if (!regexCalle.test(campo)) {
					$('#' + name).addClass('errorCampo');
					$('#error' + name).text(this.configuracionSucursalTranslate_calleFormato);
					this.setFalseValidos(v);
					return false;
				} else {
					$('#' + name).removeClass('errorCampo');
					$('#error' + name).text('');
					return true;
				}
			} else {
				$('#' + name).addClass('errorCampo');
				$('#error' + name).text('');
				this.setFalseValidos(v);
				return false;
			}
		}
		if (tipo === 'codigoPostal') {
			if (campo != '') {
				if (!regexCodigoPostal.test(campo)) {
					$('#' + name).addClass('errorCampo');
					$('#error' + name).text(this.configuracionSucursalTranslate_codigoPostFormato);
					this.setFalseValidos(v);
					return false;
				} else {
					$('#' + name).removeClass('errorCampo');
					$('#error' + name).text('');
					return true;
				}
			} else {
				$('#' + name).addClass('errorCampo');
				$('#error' + name).text('');
				this.setFalseValidos(v);
				return false;
			}
		}
		if (tipo === 'correo') {
			if (campo != '') {
				if (!re.test(campo)) {
					$('#' + name).addClass('errorCampo');
					$('#error' + name).text(this.configuracionSucursalTranslate_correoFormato);
					this.setFalseValidos(v);
				} else {
					$('#' + name).removeClass('errorCampo');
					$('#error' + name).text('');
				}
			} else {
				$('#' + name).addClass('errorCampo');
				$('#error' + name).text('');
				this.setFalseValidos(v);
			}
		}
		if (tipo === 'requerido') {
			if (campo === '') {
				$('#' + name).addClass('errorCampo');
				$('#error' + name).text('');
				this.setFalseValidos(v);
				return false;
			} else {
				$('#' + name).removeClass('errorCampo');
				$('#error' + name).text('');
				return true;
			}
		}
		if (tipo === 'otro') {
			$('#' + name).addClass('errorCampo');
			$('#error' + name).text(campo);
			this.setFalseValidos(v);
		}
		if (tipo === 'impuesto') {
			if (campo != '') {
				if (!numExp.test(campo)) {
					$('#' + name).addClass('errorCampo');
					$('#error' + name).text(this.configuracionSucursalTranslate_nombreFormato);
					this.setFalseValidos(v);
					return false;
				} else {
					$('#' + name).removeClass('errorCampo');
					$('#error' + name).text('');
					return true;
				}
			} else {
				$('#' + name).addClass('errorCampo');
				$('#error' + name).text('');
				this.setFalseValidos(v);
				return false;
			}
		}
	}

	// Función que checkea o descheckea el radio correspondiente, modifica el valor de radioTipo
	informacionFiscalSucursal_checkRadio(radio: string) {
		this.informacionFiscalSucursal.radioTipo = radio;
		this.informacionFiscalSucursal.RFC = '';
		if (radio === '0') {
			// $('#moralInput').checked = false;
			// $('#fisicaInput').checked = true;
			// $('#divCURP').style.display = 'block';
			// $('#divRFC').style.display = 'block';
			this.informacionFiscalSucursal.tamanioRFC = 13;
			$('#rfcInput').maxLength = 13;
			//$('#txtCURP').value = '';
			this.informacionFiscalSucursal.curp = "";
			this.informacionFiscalSucursal.valFisica = 1;
			this.informacionFiscalSucursal.valMoral = 0;
			this.informacionFiscalSucursal_cargarRegimen();
		} else {
			// $('#fisicaInput').checked = false;
			// $('#moralInput').checked = true;
			// $('#divCURP').style.display = 'none';
			// $('#divRFC').style.display = 'block';
			this.informacionFiscalSucursal.tamanioRFC = 12;
			$('#rfcInput').maxLength = 12;
			$('#rfcInput').value = '';
			this.informacionFiscalSucursal.valFisica = 0;
			this.informacionFiscalSucursal.valMoral = 1;
			this.informacionFiscalSucursal_cargarRegimen();
		}
		setTimeout(() => {
			$('#rfcInput').focus();
		}, 10);
	}

	descartarConfigSucursal() {
		this.dataNew = [
			this.parametro.nombreFacebook,
			this.parametro.tiempoCita, this.parametro.horasCita,
			this.parametro.cancelarCita, this.parametro.horasRecordatorio,
			this.parametro.personal, this.parametro.confirmacion, this.parametro.cabina, this.parametro.citaonline,
			this.parametro.recordatorio, this.parametro.activarChat, this.parametro.codigoSucursal,
			this.informacionFiscalSucursal.radioTipo, this.informacionFiscalSucursal.nombre,
			this.informacionFiscalSucursal.RFC, this.informacionFiscalSucursal.pais,
			this.informacionFiscalSucursal.calle, this.informacionFiscalSucursal.estado,
			this.informacionFiscalSucursal.colonia, this.informacionFiscalSucursal.ciudad,
			this.informacionFiscalSucursal.codigoPostal, this.informacionFiscalSucursal.numeroInterior,
			this.informacionFiscalSucursal.numero, this.informacionFiscalSucursal.telefono,
			this.informacionFiscalSucursal.email, this.informacionFiscalSucursal.telefonoOficina,
			this.informacionFiscalSucursal.nombreContacto, this.informacionFiscalSucursal.modelMetodosDePago,
			this.informacionFiscalSucursal.digitosCuenta, this.informacionFiscalSucursal.alias, this.informacionFiscalSucursal.modelUsosCFDI,
			this.informacionFiscalSucursal.cuenta, this.informacionFiscalSucursal.banco, this.informacionFiscalSucursal.direccionBanco,
			this.informacionFiscalSucursal.sucursalBanco, this.informacionFiscalSucursal.clabeInterbancaria, this.informacionFiscalSucursal.modelFormasDePago
		];
		const dataOld = [
			this.confCambiosParametros.nombreFacebook,
			this.confCambiosParametros.tiempoCita, this.confCambiosParametros.horasCita,
			this.confCambiosParametros.cancelarCita, this.confCambiosParametros.horasRecordatorio,
			this.confCambiosParametros.personal, this.confCambiosParametros.confirmacion, this.confCambiosParametros.cabina,
			this.confCambiosParametros.recordatorio, this.confCambiosParametros.activarChat, this.confCambiosParametros.codigoSucursal,
			this.confCambios.radioTipo, this.confCambios.nombre,
			this.confCambios.RFC, this.confCambios.pais,
			this.confCambios.calle, this.confCambios.estado,
			this.confCambios.colonia, this.confCambios.ciudad,
			this.confCambios.codigoPostal, this.confCambios.numeroInterior,
			this.confCambios.numero, this.confCambios.telefono,
			this.confCambios.email, this.confCambios.telefonoOficina,
			this.confCambios.nombreContacto, this.confCambios.modelMetodosDePago,
			this.confCambios.digitosCuenta, this.confCambios.alias, this.confCambios.modelUsosCFDI,
			this.confCambios.cuenta, this.confCambios.banco, this.confCambios.direccionBanco,
			this.confCambios.sucursalBanco, this.confCambios.clabeInterbancaria, this.confCambios.modelFormasDePago
		];
		var cambio = false;
		for (var i = 0; i < this.dataNew.length; i++) {
			if (!(this.dataNew[i] === dataOld[i])) {
				cambio = true;
			}
		}
		if (cambio) {
			this.modalConfirm_mensaje = this.configuracionSucursalTranslate_descartarCambios;
			this.modales.modalConfirm.show();
		} else {
			location.href = '/' + this.rootScope_fromState;
		}
	}

	validarTipoUsuario() {
		this._backService.HttpPost('catalogos/Personal/validarTipoUsuario', {}, {}).subscribe(
			(response: string) => {
				var tipoUsuario = 0;
				if (tipoUsuario === 1) {
					this.esGerenteSucursal = true;
					this.listas.liCitas.width = '25%';
					this.listas.liFacebook.width = '25%';
					this.listas.liCorreo.width = '25%';
					this.listas.liPaypal.width = '25%';
					this.listas.liInfoFacturacion.width = '0%';
					this.listas.liInfoFacturacion.display = 'none';
				} else {
					this.esGerenteGeneral = true;
					this.listas.liCitas.width = '20%';
					this.listas.liFacebook.width = '20%';
					this.listas.liCorreo.width = '20%';
					this.listas.liPaypal.width = '20%';
					this.listas.liInfoFacturacion.width = '20%';
					this.listas.liInfoFacturacion.display = 'block';
				}
			},
			(error) => { }
		);
	}

	limpiarCampos() {
		var xCamp = [
			{ scope: this.informacionFiscalSucursal.RFC, name: 'rfcInput', tValid: 'rfc' },
			{ scope: this.informacionFiscalSucursal.colonia, name: 'coloniaInput', tValid: 'calle' },
			{ scope: this.informacionFiscalSucursal.nombre, name: 'nombreInput', tValid: 'razonSocial' },
			{ scope: this.informacionFiscalSucursal.codigoPostal, name: 'codigoPostalInput', tValid: 'codigoPostal' },
			{ scope: this.informacionFiscalSucursal.calle, name: 'calleInput', tValid: 'calle' },
			{ scope: this.informacionFiscalSucursal.numero, name: 'numeroInput', tValid: 'numero' },
			{ scope: this.informacionFiscalSucursal.numeroInterior, name: 'numeroInteriorInput', tValid: 'numero' },
			{ scope: this.informacionFiscalSucursal.email, name: 'emailInput', tValid: 'correo' },
			{ scope: this.informacionFiscalSucursal.ciudad, name: 'ciudadInput', tValid: 'nombre' },
			{ scope: this.informacionFiscalSucursal.telefono, name: 'telefonoInput', tValid: 'telefono' },
			{ scope: this.informacionFiscalSucursal.telefonoOficina, name: 'telefonoOficinaInput', tValid: 'telefonoOficina' }, //10 NO REQUERIDO
			{ scope: this.informacionFiscalSucursal.nombreContacto, name: 'nombreContactoInput', tValid: 'nombreContacto' }, //11
			{ scope: this.informacionFiscalSucursal.digitosCuenta, name: 'digitosCuentaInput', tValid: 'digitosCuenta' }, //12 NO REQUERIDO
			{ scope: this.informacionFiscalSucursal.alias, name: 'aliasInput', tValid: 'alias' },
			{ scope: this.informacionFiscalSucursal.cuenta, name: 'cuentaInput', tValid: 'cuenta' },
			{ scope: this.informacionFiscalSucursal.banco, name: 'bancoInput', tValid: 'banco' },
			{ scope: this.informacionFiscalSucursal.clabeInterbancaria, name: 'clabeInterbancariaInput', tValid: 'clabeInterbancaria' },
			{ scope: this.informacionFiscalSucursal.direccionBanco, name: 'direccionBancoInput', tValid: 'direccionBanco' },
			{ scope: this.informacionFiscalSucursal.sucursalBanco, name: 'sucursalBancoInput', tValid: 'sucursalBanco' },
		];
		//$("#fisicaInput").checked = true;
		//$("#moralInput").checked = false;
		this.informacionFiscalSucursal.radioTipo = '0';
	}

	// borrarFacebook() {
	// 	this.parametro.nombreFacebook = '';
	// 	this.parametro.idFacebook = '';
	// }

	cancelarParametros() {
		//this.consultarParametros();
		location.href = '/' + this.rootScope_fromState;
		this.cancel = true;
	}

	txtfocus(v: any, event: any, t: any) {
		if (t === 'f') {
			if (this.guardar) {
				var txt = $(`#${event.target.id}`).value;
				var error = $('#error' + event.target.id).innerHTML;
				if (error === '' || error === undefined) {
					$('#' + event.target.id).removeClass('errorCampo');
				}
			}
		} else {
			if (this.guardar) {
				var txt = $(event.target.id).value;
				if (txt === '' || txt === undefined) {
					$('#' + event.target.id).addClass('errorCampo');
				} else {
					var error = $('error' + event.target.id).innerHTML;
					if (error === '' || error === undefined) {
						$('#' + event.target.id).removeClass('errorCampo');
					}
				}
			}
		}
	}

	camposFiscal(id: any) {
		var value = $("#" + id).value;
		if (value != '') {
			this.infoFiscalR = true;
		}
	}

	accionBoton() {
		this._pantallaServicio.mostrarSpinner();
		$('.btnGuardar').addClass('disabled');
		this.guardarParametros();
		this.dataCarga = [
			this.parametro.nombreFacebook,
			this.parametro.tiempoCita, this.parametro.horasCita,
			this.parametro.cancelarCita, this.parametro.horasRecordatorio,
			this.parametro.personal, this.parametro.confirmacion, this.parametro.cabina, this.parametro.citaonline,
			this.parametro.recordatorio, this.parametro.activarChat, this.parametro.codigoSucursal,
			this.informacionFiscalSucursal.radioTipo, this.informacionFiscalSucursal.nombre,
			this.informacionFiscalSucursal.RFC, this.informacionFiscalSucursal.pais,
			this.informacionFiscalSucursal.calle, this.informacionFiscalSucursal.estado,
			this.informacionFiscalSucursal.colonia, this.informacionFiscalSucursal.ciudad,
			this.informacionFiscalSucursal.codigoPostal, this.informacionFiscalSucursal.numeroInterior,
			this.informacionFiscalSucursal.numero, this.informacionFiscalSucursal.telefono,
			this.informacionFiscalSucursal.email, this.informacionFiscalSucursal.nombreContacto,
			this.informacionFiscalSucursal.telefonoOficina, this.informacionFiscalSucursal.metodoPago,
			this.informacionFiscalSucursal.digitosCuenta, this.informacionFiscalSucursal.alias,
			this.informacionFiscalSucursal.usoCFDI, this.informacionFiscalSucursal.cuenta,
			this.informacionFiscalSucursal.banco, this.informacionFiscalSucursal.clabeInterbancaria,
			this.informacionFiscalSucursal.direccionBanco, this.informacionFiscalSucursal.sucursalBanco,
			this.informacionFiscalSucursal.modelFormasDePago, this.informacionFiscalSucursal.modelMetodosDePago,
			this.informacionFiscalSucursal.modelUsosCFDI
		];
	}

	// se valida la url para la obtencion segura del link
	generarLink() {
		this.correoEmpresa = '';
		this.facebookButtonLink = '';
		this.facebookIFrameLink = '';
		this.integracion = '';

		this._backService.HttpPost('facebook/BookippApp/selectEmpresa', {}, {}).subscribe(
			(response: string) => {
				this.correoEmpresa = eval(response)[0].email;
				this.facebookButtonLink = environment.urlMigracion + 'bookipp-app?email=' + this.correoEmpresa + '&t=1';
				this.facebookIFrameLink = `<iframe src="${environment.urlMigracion}bookipp-app?email=` + this.correoEmpresa + '&t=2' + ' " scrolling="yes" width="100%" height="100%" frameborder="0"></iframe>';
				this.integracion = `${environment.urlMigracion}bookipp-app?email=` + this.correoEmpresa + '&t=2';
			},
			(error) => { }
		);
	}

	modalPaginaFb() {
		this.consultarPaginas();
		this.modales.modalFacebook.show();
	}

	//Función que carga los datos del grid
	consultarPaginas() {
		this._backService.HttpPost('configuracion/ConfiguracionSucursal/consultarFacebook', {}, {}).subscribe(
			(response: string) => {
				var dataTemp = eval(response);
				//this.dataFacebook = dataTemp;
				this.dataSource.data = dataTemp;
				this.dataSource.paginator = this.paginator;
				this.dataSource.sort = this.sort;
				if (this.dataSource.data.length > 0) {
					this.listas.liCitas.width = '20%';
					this.listas.liInfoFacturacion.width = '20%';
					this.listas.liCorreo.width = '20%';
					this.listas.liPaypal.width = '20%';
					this.listas.liFacebook.width = '20%';
					this.listas.liFacebook.display = 'block';
				} else {
					this.listas.liCitas.width = '20%';
					this.listas.liInfoFacturacion.width = '20%';
					this.listas.liCorreo.width = '20%';
					this.listas.liPaypal.width = '20%';
					this.listas.liFacebook.width = '20%';
					this.listas.liFacebook.display = 'block';
				}
			},
			(error) => { }
		);
	}

	// Función que elimina del grid
	borrarFacebook(row: any) {
		const index = this.dataSource.data.filter((e: any) => e.idEmpresaFbSucursal !== row.idEmpresaFbSucursal);
		//this.dataFacebook = index;
		this.dataSource.data = index;
		this.dataSource.paginator = this.paginator;
		this.dataSource.sort = this.sort;
		this.idBorrarFacebook.push(row.idEmpresaFbSucursal);
	};

	guardarPaginasFb() {
		this._pantallaServicio.mostrarSpinner();
		var params: any = {};
		params.idFb = this.idBorrarFacebook;
		this._backService.HttpPost('configuracion/ConfiguracionSucursal/guardarPaginasFb', {}, params).subscribe(
			(response: string) => {
				this.consultarPaginas();
				this._pantallaServicio.ocultarSpinner();
			},
			(error) => {
				this._pantallaServicio.ocultarSpinner();
			}
		);
	}

	// ---------------------------------------- Zonas Horarias --------------------------------------------------
	consultarZonasHorarias() {
		this._backService.HttpPost('configuracion/ConfiguracionSucursal/consultarZonasHorarias', {}, {}).subscribe(
			(response: string) => {
				this.listadoZonasHorarias = eval(response);
				console.log(this.listadoZonasHorarias);
				
			},
			(error) => {
				this._router.navigate(['/login']);
			}
		);
	}

	// ------------------------------- Configuración Estado Actividad de Clientes -------------------------------
	consultarConfiguracionEstadoActividadClientesSucursal() {
		this._backService.HttpPost('configuracion/ConfiguracionSucursal/consultarConfiguracionEstadoActividadClientesSucursal', {}, {}).subscribe(
			(response: string) => {
				var dataTemp = eval(response);
				this.estadoActividadClientes.nuevo = dataTemp[0];
				this.estadoActividadClientes.activo = dataTemp[1];
				this.estadoActividadClientes.inactivo = dataTemp[2];
				this.estadoActividadClientes.nuevo.clienteNuevoPorDias = dataTemp[0].clienteNuevoPorDias === 1 ? true : false;
				this.estadoActividadClientes.nuevo.clienteActivoPorCita = dataTemp[0].clienteActivoPorCita === 1 ? true : false;
			},
			(error) => {
				this._router.navigate(['/login']);
			}
		);
	}

	guardarConfiguracionEstadoActividadClientesSucursal() {
		var params: any = {};

		params.idClienteEstadoActividadConfiguracionNuevo = this.estadoActividadClientes.nuevo.idClienteEstadoActividadConfiguracion;
		params.clienteNuevoPorDias = this.estadoActividadClientes.nuevo.clienteNuevoPorDias ? '1' : '0';
		params.clienteNuevoDias = this.estadoActividadClientes.nuevo.clienteNuevoDias;

		params.idClienteEstadoActividadConfiguracionActivo = this.estadoActividadClientes.activo.idClienteEstadoActividadConfiguracion;
		params.clienteActivoPorCita = this.estadoActividadClientes.activo.clienteActivoPorCita ? '1' : '0';
		params.clienteActivoDias = this.estadoActividadClientes.activo.clienteActivoDias;

		params.idClienteEstadoActividadConfiguracionInactivo = this.estadoActividadClientes.inactivo.idClienteEstadoActividadConfiguracion;

		this._backService.HttpPost('configuracion/ConfiguracionSucursal/guardarConfiguracionEstadoActividadClientesSucursal', {}, params).subscribe(
			(response: string) => {
				eval(response);
				this.consultarParametros();
			},
			(error) => {
				this._router.navigate(['/login']);
			}
		);
	}

	// ------------------------------------- Pago con Paypal Configuracion --------------------------------------
	cambioEstatusPagoPaypal() {
		this.paypalConfiguracion.idPaypal = '';
		this.paypalConfiguracion.paypalComisionCliente = false;
	}

	cambioIdPaypal() {
		$('#inputClientIDPaypal').removeClass('errorCampo');
	}

	//!---- Variables que se separaron!! -----------------------------------------------------------------------
	setFalseValidos(v: any) {
		switch (v) {
			case 1:
				this.valido1 = false;
				break;
			case 2:
				this.valido2 = false;
				break;
			case 3:
				this.valido3 = false;
				break;
		}
	}

	setColors(name: string, color: string) {
		if (color != '') {
			$(name).simplecolorpicker('selectColor', color);
		} else {
			$(name).simplecolorpicker('selectColor', '#7bd148');
		}
	}

	onChangeTabs(tabs: any) {
		let tabActual = tabs.index + 1;
		if (tabActual >= 3) tabActual++;
		this.tabActive = tabActual;
	}

	//Funcion para el sorting de la tabla de facebook
	announceSortChange(sortState: Sort) {
		if (sortState.direction) {
			this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
		} else {
			this._liveAnnouncer.announce('Sorting cleared');
		}
	}

	// Scripts
	configurar_sucursal_validarNum(e: any) {
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
}
