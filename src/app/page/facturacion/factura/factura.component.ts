import { Component, OnInit, ViewChild } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { MethodsService } from 'src/app/core/services/methods.service';
import { PantallaService } from 'src/app/core/services/pantalla.service';
import { ToasterService } from 'src/shared/toaster/toaster.service';
import { Router } from '@angular/router';
import moment from 'moment';
import dayjs from 'dayjs';
declare var $: any; // JQUERY
import * as bootstrap from 'bootstrap'; // BOOTSTRAP
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatSort, Sort } from '@angular/material/sort';

@Component({
	selector: 'app-factura',
	templateUrl: './factura.component.html',
	styleUrls: ['./factura.component.scss', '../../page.component.scss']
})
export class FacturaComponent implements OnInit {
	sessionTraslate: any = {};
	facturaTranslate: any = {};
	agendaTranslate: any = {};
	notasTranslate: any = {};
	LANGS: any = {};
	calendarioTranslate: any = {};

	// Modales
	modales: any = {};
	msgConfirmBorrar: any = "";
	msgInformacionFactura: any = "";

	ranges: any = {};
	invalidDates: moment.Moment[] = [
		moment().add(2, 'days'),
		moment().add(3, 'days'),
		moment().add(5, 'days'),
	];
	isInvalidDate = (m: moment.Moment) => {
		return this.invalidDates.some((d) => d.isSame(m, 'day'));
	};

	displayedColumns: string[] = ['acciones', 'nombre', 'estatus', 'nombreSerie', 'folio', 'uuid', 'importe', 'fechaCreacion'];
	dataSource = new MatTableDataSource<any>();
	@ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

	constructor(
		private _translate: TranslateService,
		private _backService: MethodsService,
		public _pantallaServicio: PantallaService,
		private matIconRegistry: MatIconRegistry,
		private domSanitizer: DomSanitizer,
		private _toaster: ToasterService,
		private _router: Router,
        private _liveAnnouncer: LiveAnnouncer
	) {
		this._translate.setDefaultLang(this._pantallaServicio.idioma);
		this._translate.use(this._pantallaServicio.idioma);

		this._translate.get('facturaTranslate').subscribe((translated) => {
			this.facturaTranslate = this._translate.instant('facturaTranslate');
			this.sessionTraslate = this._translate.instant('sessionTraslate');
			this.agendaTranslate = this._translate.instant('agendaTranslate');
			this.notasTranslate = this._translate.instant('notasTranslate');
			this.LANGS = this._translate.instant('LANGS');
			this.calendarioTranslate = this._translate.instant('calendarioTranslate');

			this.ranges = {
				[this.calendarioTranslate['dias7']]: [
					moment().subtract(6, 'days'),
					moment(),
				], //subtract
				[this.calendarioTranslate['ultimoMes']]: [
					moment().startOf('month'),
					moment().endOf('month'),
				],
				[this.calendarioTranslate['ultimoAnio']]: [
					moment().startOf('year'),
					moment().endOf('year'),
				],
			};
		});

		this.matIconRegistry.addSvgIcon('iconFlechaDerecha', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/FlechaDerechaPequena-icon.svg"));
		this.matIconRegistry.addSvgIcon('iconCasita', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Casa1-icon.svg"));
		this.matIconRegistry.addSvgIcon('iconAgenda', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/CalendarioEditar-icon.svg"));
		this.matIconRegistry.addSvgIcon('iconFlechaAbajo', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/FlechaAbajoPequena-icon.svg"));
		this.matIconRegistry.addSvgIcon('iconEditar', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Editar-icon.svg"));
		this.matIconRegistry.addSvgIcon('iconCancelar', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Basura-icon.svg"));
		this.matIconRegistry.addSvgIcon('iconCerrarModal', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/10-2-TiposdeExcepcion-icon.svg"));
	}

	ngOnInit(): void {
		this.crearModales();
		this.dataSource.paginator = this.paginator;
		this.consultarDocumentos();
		this.consultaClientesFiltro();
		this.consultaSeriesFolio();
	}

	// Variables---------------------------------------------------------------------------------------------------------------
	filtro: any = {
		fechas: { startDate: dayjs().startOf('month'), endDate: dayjs().endOf('month') },
		cliente: null,
		serie: null,
		folio: "",
	};
	dataTrue: any = false;
	consultaExitosa: any = false;
	clientes: any = {};
	series: any = {};
	facturasPDFS: any = [];
	pageSize: any = 15;

	datosGenerales: any = false;
	conceptos: any = true;
	ocultarGuardar: any = false;
	facturacion: any = {
		idFactura: "",
		emisorSucursal: "",
		emisorRegimenFiscal: "",
		receptorCFDI: "",
		receptorFormaPago: "",
		receptorMetodoPago: "",
		receptorNombre: "",
		receptorRFC: "",
		serieyFolioFactura: "",
		listaFacturar: [],
		subtotal: 0.0,
		total: 0.0,
		impuestoIva: 0.0,
		subtotalMostrar: 0.0,
		totalMostrar: 0.0,
		impuestoIvaMostrar: 0.0,
		ivaGeneral: null,
		aplicaIVA: true,
		aplicaResico: true,
	};
	dataSucursales: any = [];
	dataformasDePago: any = [];
	datametodosDePago: any = [];
	dataCFDI: any = [];
	dataRegimen: any = [];
	dataSerie: any = [];
	datosFiscales: any = [];

	folio_pago: any = null;
	idFactura: any = null;
	dataImpuestoIva: any = null;
	dataFactura: any = null;
	dataCveProdServ: any = null;
	dataUnidadMedida: any = null;
	dataConceptos: any = null;
	dataFacturaDetalle: any = null;
	idPagoClienteProducto: any = null;
	idClienteParam: any = null;
	nuevosDatosEmisor: any = null;
	dataGrid2: any = null;
	altura: any = null;
	dataGrid: any = null;
	cantidadClientes: any = null;
	keyNames: any = null;

	//funciones---------------------------------------------------------------------------------------------------------------
	crearModales() {
		if ($('body').find('.modalconfirmBorrarFactura').length > 1) {
			$('body').find('.modalconfirmBorrarFactura')[1].remove();
		}

		this.modales.modalconfirmBorrarFactura = new bootstrap.Modal(
			$('#modalconfirmBorrarFactura').appendTo('body'),
			{
				backdrop: 'static',
				keyboard: false,
			}
		);

		if ($('body').find('.modalInformacionFactura').length > 1) {
			$('body').find('.modalInformacionFactura')[1].remove();
		}

		this.modales.modalInformacionFactura = new bootstrap.Modal(
			$('#modalInformacionFactura').appendTo('body'),
			{
				backdrop: 'static',
				keyboard: false,
			}
		);

		if ($('body').find('.modalFactura').length > 1) {
			$('body').find('.modalFactura')[1].remove();
		}

		this.modales.modalFactura = new bootstrap.Modal(
			$('#modalFactura').appendTo('body'),
			{
				backdrop: 'static',
				keyboard: false,
			}
		);
	}

	validarFiltros() {//Validacion de que los datos sean correctos integramente
		if (this.filtro.fechas.startDate <= this.filtro.fechas.endDate) {
			return true;
		} else {
			return false;
		}
	}

	consultarDocumentos() {
		if (this.validarFiltros()) {
			let params: any = {
				fechaInicio: this.filtro.fechas.startDate.format('YYYY-MM-DD'),
				fechaFin: this.filtro.fechas.endDate.format('YYYY-MM-DD'),
				cliente: this.filtro.cliente == undefined ? "" : this.filtro.cliente,
				serie: this.filtro.serie == undefined ? "" : this.filtro.serie
			};
			this.filtro.folio = "";
			this._pantallaServicio.mostrarSpinner();

			this._backService.HttpPost('catalogos/factura/consultarDocumentos', {}, params).subscribe(
				response => {
					this.dataGrid = eval(response);
					let camposAux = 8;
					if (this.dataGrid.length == 0) {
						this.cantidadClientes = this.dataGrid.length + ' ' + this.notasTranslate.clientes; //Mensaje de SIN DOCUMENTOS
					}

					for (let i = 0; i < this.dataGrid.length; i++) { //Validaciones para el GRID
						if (this.dataGrid[i].fechaCreacion) {
							this.dataGrid[i].fechaCreacion = new Date(this.dataGrid[i].fechaCreacion);
						}
						if (this.dataGrid[i].folio == null) {
							this.dataGrid[i].folio = "";
						}

						this.dataGrid[i].seleccionado = false;
					}

					this.dataGrid2 = JSON.parse(JSON.stringify(this.dataGrid));   //Se manda la información al GRID
					this.altura = this.pageSize * 30 + 57;

					if (this.dataGrid.length == 0) { //No se muestra el GRID
						this.dataTrue = false; //Se muestra el mensaje de que no hay registros
						this.consultaExitosa = false;
					} else { //Se muestra el GRID
						this.dataTrue = true;
						this.consultaExitosa = false;
					}

					this.dataSource.data = this.dataGrid;
					this.dataSource.paginator = this.paginator;
                    this.dataSource.sort = this.sort;
					this._pantallaServicio.ocultarSpinner();
				},
				error => {
					this._pantallaServicio.ocultarSpinner();
					if (error === 'SinSesion' || error === 'SesionCaducada') {
						if (error === 'SinSesion') {
							this._toaster.error(this.sessionTraslate.favorIniciarSesion);
						}
						if (error === 'SesionCaducada') {
							this._toaster.error(this.sessionTraslate.sesionCaducada);
						}
						this._router.navigate(['/login']);
					}
				}
			)
		} else {
			this._toaster.error(this.facturaTranslate.fechasErroneas);
		}
	}

	consultaClientesFiltro() {
		this._backService.HttpPost('catalogos/factura/consultarClientesConDocumentos', {}, {}).subscribe(
			response => {
				this.clientes = eval(response);
			},
			error => {
				this._pantallaServicio.ocultarSpinner();
				if (error === 'SinSesion' || error === 'SesionCaducada') {
					if (error === 'SinSesion') {
						this._toaster.error(this.sessionTraslate.favorIniciarSesion);
					}
					if (error === 'SesionCaducada') {
						this._toaster.error(this.sessionTraslate.sesionCaducada);
					}
					this._router.navigate(['/login']);
				}
			}
		)
	}

	consultaSeriesFolio() {
		this._backService.HttpPost('catalogos/factura/consultarSeriesdeFolio', {}, {}).subscribe(
			response => {
				this.series = eval(response);
			},
			error => {
				this._pantallaServicio.ocultarSpinner();
				if (error === 'SinSesion' || error === 'SesionCaducada') {
					if (error === 'SinSesion') {
						this._toaster.error(this.sessionTraslate.favorIniciarSesion);
					}
					if (error === 'SesionCaducada') {
						this._toaster.error(this.sessionTraslate.sesionCaducada);
					}
					this._router.navigate(['/login']);
				}
			}
		);
	}

	busquedaFolio() { // -----------------------Filtrado del folio		
		if (this.filtro.folio != "") {
			const foundItem = this.dataGrid.filter((item: any) => item.folio.toUpperCase().match(this.filtro.folio.toUpperCase()));
			this.dataSource.data = foundItem;
			this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
		}
		else {
			this.dataSource.data = this.dataGrid;
			this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
		}
	};

	changeDocument(value?: any, idFactura?: any) {
		if (value) {
			this.facturasPDFS.push(idFactura);
		}
		else {
			this.facturasPDFS.splice(this.facturasPDFS.findIndex((e: any) => e === idFactura), 1);
		}
	}

	descargarDocumento() { //Se descarga el .zip con el XML y el PDF
		if (this.facturasPDFS.length > 0) {
			let params: any = {};
			params.idFacturas = this.facturasPDFS;
			this._pantallaServicio.mostrarSpinner();
			this._backService.HttpPost('catalogos/factura/generarPDFactura', {}, params).subscribe(
				response => {
					const dateTemp = eval(response);
					// window.open('handlers/handlerFileRequest.ashx?pathFacturas=' + response);
					const element = document.createElement('a');
					element.setAttribute('href', 'data:text/plain;base64,' + dateTemp.base64);
					element.setAttribute('download', dateTemp.nombre);
					element.click();
					this._pantallaServicio.ocultarSpinner();
				},
				error => {
					this._pantallaServicio.ocultarSpinner();
					if (error === 'SinSesion' || error === 'SesionCaducada') {
						if (error === 'SinSesion') {
							this._toaster.error(this.sessionTraslate.favorIniciarSesion);
						}
						if (error === 'SesionCaducada') {
							this._toaster.error(this.sessionTraslate.sesionCaducada);
						}
						this._router.navigate(['/login']);
					}
				}
			);
		} else {
			this._toaster.error('Para descargar debe contar con facturas seleccionadas');
		}
	}

	editarDocumento(entity?: any) {
		this.folio_pago = entity.folio_pago;
		this.idPagoClienteProducto = entity.idPagoClienteProducto;
		this.idFactura = entity.idFactura;
		this.idClienteParam = entity.idCliente;
		this.editarFactura();
	}


	cerrarBorrarFactura() {
		$('body').css('overflow', 'auto');
	}

	preparacionCancelarFactura(idFactura?: any) {
		this.idFactura = idFactura;
		this.confirmBorrarFactura(this.facturaTranslate.deseaBorrarFactura);
	}

	confirmBorrarFactura(message?: any) {
		this.msgConfirmBorrar = message;
		this.modales.modalconfirmBorrarFactura.show();
	}

	//Funcion para Abrir Ventana del Sat para Cancelar
	cancelarFactura() {
		this.cancelar();
		// this.consultarDocumentos();
		this._pantallaServicio.ocultarSpinner();
	};

	//Funcion para Actualizar Factura a Estatus Cancelado
	cancelar(idFactura?: any) {
		let params: any = {};
		params.idFactura = this.idFactura;
		params.folioPago = '';
		this._pantallaServicio.mostrarSpinner();
		//Verificar el estatus de la factura antes de Cancelar

		this._backService.HttpPost('catalogos/factura/consultarFacturas', {}, params).subscribe(
			response => {
				let datosFactura = eval(response);
				if (datosFactura[0].idFacturaEstatus == '2') {
					this._toaster.error('La factura tiene estatus Cancelado,No es posible Cancelarse');
					return;
				}
				else {
					let params: any = {}
					params.idFactura = this.idFactura;
					params.idFacturaEstatus = '1';
					params.serie = 'F';
					if (datosFactura[0].idFacturaEstatus == '3') {
						this._backService.HttpPost('catalogos/factura/CancelarFacturaFinal', {}, params).subscribe(
							response => {
							},
							error => {
								this._pantallaServicio.ocultarSpinner();
								if (error === 'SinSesion' || error === 'SesionCaducada') {
									if (error === 'SinSesion') {
										this._toaster.error(this.sessionTraslate.favorIniciarSesion);
									}
									if (error === 'SesionCaducada') {
										this._toaster.error(this.sessionTraslate.sesionCaducada);
									}
									this._router.navigate(['/login']);
								}
							}
						)
					}
					else {
						this._backService.HttpPost('catalogos/factura/CancelarFacturaFinal', {}, params).subscribe(
							response => {
								window.open("https://portalcfdi.facturaelectronica.sat.gob.mx/", "target = 1462228482471", "width=800, height=510");
								this.consultarDocumentos();
							},
							error => {
								this._pantallaServicio.ocultarSpinner();
								if (error === 'SinSesion' || error === 'SesionCaducada') {
									if (error === 'SinSesion') {
										this._toaster.error(this.sessionTraslate.favorIniciarSesion);
									}
									if (error === 'SesionCaducada') {
										this._toaster.error(this.sessionTraslate.sesionCaducada);
									}
									this._router.navigate(['/login']);
								}
							}
						)
					}

				}
			},
			error => {
				this._pantallaServicio.ocultarSpinner();
				if (error === 'SinSesion' || error === 'SesionCaducada') {
					if (error === 'SinSesion') {
						this._toaster.error(this.sessionTraslate.favorIniciarSesion);
					}
					if (error === 'SesionCaducada') {
						this._toaster.error(this.sessionTraslate.sesionCaducada);
					}
					this._router.navigate(['/login']);
				}
			}
		)
	};

	// Carga de opciones del dropdown list de las sucursales
	cargarSucursales(opcion?: any) {
		this._backService.HttpPost('catalogos/factura/consultaSucursal', {}, {}).subscribe(
			response => {
				this.dataSucursales = eval(response);
				if (opcion == 1) {
					this.setearDatosFiscales();
				} else {
					this.setearFactura();
				}
			},
			error => {
				this._pantallaServicio.ocultarSpinner();
				if (error === 'SinSesion' || error === 'SesionCaducada') {
					if (error === 'SinSesion') {
						this._toaster.error(this.sessionTraslate.favorIniciarSesion);
					}
					if (error === 'SesionCaducada') {
						this._toaster.error(this.sessionTraslate.sesionCaducada);
					}
					this._router.navigate(['/login']);
				}
			}
		)
	};

	// Carga de opciones del dropdown list de regimen fiscal 
	cargarRegimenFiscal(fisica?: any, moral?: any) {
		let params: any = {};
		params.fisica = fisica;
		params.moral = moral

		this._backService.HttpPost('catalogos/factura/cargarRegimenFiscal', {}, params).subscribe(
			response => {
				this.dataRegimen = eval(response);
			},
			error => {
				this._pantallaServicio.ocultarSpinner();
				if (error === 'SinSesion' || error === 'SesionCaducada') {
					if (error === 'SinSesion') {
						this._toaster.error(this.sessionTraslate.favorIniciarSesion);
					}
					if (error === 'SesionCaducada') {
						this._toaster.error(this.sessionTraslate.sesionCaducada);
					}
					this._router.navigate(['/login']);
				}
			}
		)
	};

	//Carga los regimenes fiscales en base a la sucursal seleccionada
	actualizarSucursal(idSucursal?: any) {
		let params: any = {};
		params.idSucursal = idSucursal;

		this._backService.HttpPost('catalogos/factura/cargarEmisor', {}, params).subscribe(
			response => {
				if (eval(response).length == 0) {//Si no regresa nada quiere decir que la sucursal no tiene datos fiscales y se informa al usuario
					this.modalInformacionFactura(this.agendaTranslate.noInfoSucursal);
					this.facturacion.emisorSucursal = this.facturacion.antiguoemisorSucursal;
				} else {
					this.facturacion.antiguoemisorSucursal = idSucursal;
					this.nuevosDatosEmisor = eval(response);
					this.facturacion.emisorSucursal = this.nuevosDatosEmisor[0].idSucursal;
					this.facturacion.emisorRegimenFiscal = this.nuevosDatosEmisor[0].regimenFiscal
				}
			},
			error => {
				this._pantallaServicio.ocultarSpinner();
				if (error === 'SinSesion' || error === 'SesionCaducada') {
					if (error === 'SinSesion') {
						this._toaster.error(this.sessionTraslate.favorIniciarSesion);
					}
					if (error === 'SesionCaducada') {
						this._toaster.error(this.sessionTraslate.sesionCaducada);
					}
					this._router.navigate(['/login']);
				}
			}
		)
	}

	factura() {
		//this.citaFacturar = this.clickedEvent.cita;
		let params: any = {};
		params.folioPago = this.folio_pago;
		params.idCliente = this.idClienteParam;
		this._pantallaServicio.mostrarSpinner();

		this._backService.HttpPost('catalogos/factura/datosFiscales', {}, params).subscribe(
			response => {
				switch (response) {
					case "NIFC":
						let idCliente = this.idClienteParam;
						let w = 1000;
						let h = 530;
						let left = Number((screen.width / 2) - (w / 2));
						let tops = Number((screen.height / 2) - (h / 2));
						let lang = this.LANGS.using;
						let caracteristicas = "height=" + h + ",width=" + w + ",scrollTo,resizable=0,scrollbars=1,location=1," + "top=" + tops + ", left=" + left;
						window.open('/informacionFiscalCliente.html#/' + idCliente + '&' + this.folio_pago + '&' + lang, 'Popup', caracteristicas);
						this._pantallaServicio.ocultarSpinner();
						break;
					case "NIFS":
						this.modalInformacionFactura(this.agendaTranslate.noInfoSucursal);
						this._pantallaServicio.ocultarSpinner();
						break;
					case "NICE":
						this.modalInformacionFactura(this.agendaTranslate.noCertiEmpresa);
						this._pantallaServicio.ocultarSpinner();
						break;
					case "FND":
						this.modalInformacionFactura("No cuenta con facturas disponibles");
						this._pantallaServicio.ocultarSpinner();
						break;
					default:
						this.datosFiscales = eval(response);
						if (this.datosFiscales.length == 3) {
							this.dataFactura = this.datosFiscales[0];
							this.idFactura = this.dataFactura[0].idFactura;
							this.dataFacturaDetalle = this.datosFiscales[1];
							this.dataConceptos = this.datosFiscales[2];
							this.cargarSucursales(2);
						} else if (this.datosFiscales.length == 1) {
							this.dataFactura = this.datosFiscales[0];
							this.idFactura = this.dataFactura[0].idFactura;
							this.dataFacturaDetalle = null;
							this.dataConceptos = null;
							this.cargarSucursales(2);
						} else {
							this.dataFactura = null;
							this.idFactura = null;
							this.dataFacturaDetalle = null;
							this.dataConceptos = null;
							this.cargarSucursales(1);
						}
				}
			},
			error => {
				this._pantallaServicio.ocultarSpinner();
				if (error === 'SinSesion' || error === 'SesionCaducada') {
					if (error === 'SinSesion') {
						this._toaster.error(this.sessionTraslate.favorIniciarSesion);
					}
					if (error === 'SesionCaducada') {
						this._toaster.error(this.sessionTraslate.sesionCaducada);
					}
					this._router.navigate(['/login']);
				}
			}
		)
	};

	editarFactura() {

		if (this.idPagoClienteProducto == null) {
			let params: any = {};
			params.folioPago = this.folio_pago;
			params.idFactura = this.idFactura;
			this._pantallaServicio.mostrarSpinner();

			this._backService.HttpPost('catalogos/factura/datosFactura', {}, params).subscribe(
				response => {
					this.dataFactura = eval(response)[0];
					this.dataFacturaDetalle = eval(response)[1];
					this.dataConceptos = eval(response)[2];
					this.cargarSucursales(2);
					setTimeout(() => {
						this.modales.modalFactura.show();
						this._pantallaServicio.ocultarSpinner();
					}, 5);
				},
				error => {
					this._pantallaServicio.ocultarSpinner();
					if (error === 'SinSesion' || error === 'SesionCaducada') {
						if (error === 'SinSesion') {
							this._toaster.error(this.sessionTraslate.favorIniciarSesion);
						}
						if (error === 'SesionCaducada') {
							this._toaster.error(this.sessionTraslate.sesionCaducada);
						}
						this._router.navigate(['/login']);
					}
				}
			)
		}
		else {
			let params: any = {};
			params.idPagoClienteProducto = this.idPagoClienteProducto;
			params.idFactura = this.idFactura;
			this._pantallaServicio.mostrarSpinner();

			this._backService.HttpPost('catalogos/factura/datosFacturaProducto', {}, params).subscribe(
				response => {
					this.dataFactura = eval(response)[0];
					this.dataFacturaDetalle = eval(response)[1];
					this.dataConceptos = eval(response)[2];
					this.cargarSucursales(2);
					setTimeout(() => {
						this.modales.modalFactura.show();
						this._pantallaServicio.ocultarSpinner();
					}, 5);
				},
				error => {
					this._pantallaServicio.ocultarSpinner();
					if (error === 'SinSesion' || error === 'SesionCaducada') {
						if (error === 'SinSesion') {
							this._toaster.error(this.sessionTraslate.favorIniciarSesion);
						}
						if (error === 'SesionCaducada') {
							this._toaster.error(this.sessionTraslate.sesionCaducada);
						}
						this._router.navigate(['/login']);
					}
				}
			)
		}
	};

	conceptosFacturar() {
		let params: any = {};
		params.folioPago = this.folio_pago;
		this._backService.HttpPost('catalogos/factura/cargarConceptosFacturar', {}, params).subscribe(
			response => {
				this.dataConceptos = eval(response);
				if (this.dataFacturaDetalle) {
					if (this.dataConceptos.length == this.dataFacturaDetalle.length) {//Quiere decir que todos los conceptos de la cita ya han sido facturados
						// this.ocultarGuardar = true;
					}
				}
				this.setearConceptos();
			},
			error => {
				this._pantallaServicio.ocultarSpinner();
				if (error === 'SinSesion' || error === 'SesionCaducada') {
					if (error === 'SinSesion') {
						this._toaster.error(this.sessionTraslate.favorIniciarSesion);
					}
					if (error === 'SesionCaducada') {
						this._toaster.error(this.sessionTraslate.sesionCaducada);
					}
					this._router.navigate(['/login']);
				}
			}
		)
	};

	setearConceptos() {
		this.facturacion.listaFacturar = [];
		this.facturacion.subtotal = 0.0;
		this.facturacion.total = 0.0;
		this.facturacion.impuestoIva = 0.0;
		this.facturacion.subtotalMostrar = 0.0;
		this.facturacion.totalMostrar = 0.0;
		this.facturacion.impuestoIvaMostrar = 0.0;
		this.facturacion.ivaGeneral = (this.dataFactura) ? this.dataFactura[0].factor_iva : null;
		if (this.facturacion.ivaGeneral) {
			this.facturacion.aplicaIVA = 0;
		}
		this.facturacion.aplicaResico = 0;
		this.facturacion.retencionISR = 0.0125;
		this.facturacion.impuestoRetencionISR = 0.0;
		let contadorFacturados = 0;
		let posicion = 0;

		for (let i = 0; i < this.dataConceptos.length; i++) 	{
			if (this.dataConceptos[i].idServicio !== null && this.dataConceptos[i].nombreServicio !== null) {
				let index = this.facturacion.listaFacturar.filter((e: any) => e.idServicio === this.dataConceptos[i].idServicio)[0];
				if (false) {
					this.facturacion.listaFacturar[this.facturacion.listaFacturar.indexOf(index)].cantidad++;
					this.facturacion.listaFacturar[this.facturacion.listaFacturar.indexOf(index)].importe =
						parseFloat((this.facturacion.listaFacturar[this.facturacion.listaFacturar.indexOf(index)].cantidad *
							this.facturacion.listaFacturar[this.facturacion.listaFacturar.indexOf(index)].valorU).toFixed(6));
					this.facturacion.listaFacturar[this.facturacion.listaFacturar.indexOf(index)].importeMostrar = Math.round(this.facturacion.listaFacturar[this.facturacion.listaFacturar.indexOf(index)].importe * 100) / 100
					this.facturacion.listaFacturar[this.facturacion.listaFacturar.indexOf(index)].totalImporte = this.facturacion.listaFacturar[this.facturacion.listaFacturar.indexOf(index)].importeMostrar;
					this.facturacion.subtotal += (this.facturacion.listaFacturar[this.facturacion.listaFacturar.indexOf(index)].yaFacturado || !this.facturacion.listaFacturar[this.facturacion.listaFacturar.indexOf(index)].seFactura) ? 0 : this.facturacion.listaFacturar[this.facturacion.listaFacturar.indexOf(index)].valorU;
					this.facturacion.subtotalMostrar += (this.facturacion.listaFacturar[this.facturacion.listaFacturar.indexOf(index)].yaFacturado || !this.facturacion.listaFacturar[this.facturacion.listaFacturar.indexOf(index)].seFactura) ? 0 : this.facturacion.listaFacturar[this.facturacion.listaFacturar.indexOf(index)].valorU;
					posicion = this.facturacion.listaFacturar[this.facturacion.listaFacturar.indexOf(index)].id;
				} else {
					let yaFacturado = 0;
					let seFactura = 0;
					let facturado = undefined;
					if (this.dataFacturaDetalle) {
						facturado = this.dataFacturaDetalle.filter((e: any) => e.idServicio === this.dataConceptos[i].idServicio)[0];
						if (facturado) {
							seFactura = 1;
							(facturado.facturado != 0 || (parseFloat(this.dataConceptos[i].montoTotal) < 0.01)) ? yaFacturado = 1 : yaFacturado = 0;
						}
						else {
							(parseFloat(this.dataConceptos[i].montoTotal) < 0.01) ? yaFacturado = 1 : yaFacturado = 0;
						}
					}
					else {
						seFactura = 1;
					}
					this.facturacion.listaFacturar.push({
						id: i,
						idServicio: (facturado) ? facturado.idServicio : this.dataConceptos[i].idServicio,
						descripcion: (facturado) ? facturado.descripcion : this.dataConceptos[i].nombreServicio,
						cveUnidad: (facturado) ? facturado.idUnidadMedida : this.dataConceptos[i].idUnidadMedidaServicio,
						cveProdServ: (facturado) ? facturado.idClaveProdServ : this.dataConceptos[i].idClaveProdServServicio,
						cantidad: 1,
						valorU: (facturado) ? parseFloat(((facturado.importe + facturado.monto_iva - facturado.isr_resico) / facturado.cantidad).toFixed(6)) : parseFloat((this.dataConceptos[i].montoTotal).toFixed(6)),
						importe: (facturado) ? parseFloat((facturado.importe).toFixed(6)) : parseFloat((this.dataConceptos[i].montoTotal).toFixed(6)),
						importeMostrar: (facturado) ? parseFloat((facturado.importe).toFixed(6)) : Math.round(parseFloat((this.dataConceptos[i].montoTotal).toFixed(6)) * 100) / 100,
						dataUnidadMedida: this.dataUnidadMedida,
						dataCveProdServ: this.dataCveProdServ,
						seFactura: seFactura,
						ivaImporte: (facturado) ? parseFloat(facturado.monto_iva.toFixed(6)) : 0.000000,
						ivaImporteMostrar: (facturado) ? parseFloat(facturado.monto_iva.toFixed(6)) : 0.000000,
						impuestoIVA: null,
						factor_iva: (facturado) ? ((facturado.factor_iva > 0.000000) ? facturado.factor_iva : "") : "",
						dataIVA: this.dataImpuestoIva,
						totalImporte: (facturado) ? parseFloat((facturado.importe + facturado.monto_iva - facturado.isr_resico).toFixed(6)) : parseFloat((this.dataConceptos[i].montoTotal).toFixed(6)),
						yaFacturado: yaFacturado,
						idInventarioPresentacion: "",
						idInventarioProducto: "",
						tipo: this.dataConceptos[i].tipo,
						montoTotal: (facturado) ? parseFloat((facturado.importe).toFixed(6)) : this.dataConceptos[i].montoTotal,
						aplicaIVA: (facturado) ? ((facturado.factor_iva > 0.000000) ? 1 : 0) : 0,
						aplicaResico: parseFloat(facturado.isr_resico) > 0 ? 1: 0,
						retencionISRMostrar: (facturado) ? parseFloat(facturado.isr_resico.toFixed(6)) : 0.000000,					
					});
					posicion = i;
					let servicioId = this.facturacion.listaFacturar.filter((e: any) => e.id === i)[0];
					this.facturacion.subtotal += (servicioId.yaFacturado || !servicioId.seFactura) ? 0 : servicioId.importe;
					this.facturacion.impuestoIva += (servicioId.yaFacturado || !servicioId.seFactura) ? 0 : servicioId.ivaImporte;
					this.facturacion.subtotalMostrar += (servicioId.yaFacturado || !servicioId.seFactura) ? 0 : servicioId.importeMostrar;
					this.facturacion.impuestoIvaMostrar += (servicioId.yaFacturado || !servicioId.seFactura) ? 0 : servicioId.ivaImporteMostrar;
					this.facturacion.impuestoRetencionISR += (servicioId.yaFacturado || !servicioId.seFactura) ? 0 : servicioId.retencionISRMostrar;
				}
			} else if (this.dataConceptos[i].idInventarioPresentacion !== null && this.dataConceptos[i].nombreProducto !== null) {
				let yaFacturado = 0;
				let seFactura = 0;
				let facturado = undefined;
				if (this.dataFacturaDetalle) {
					facturado = this.dataFacturaDetalle.filter((e: any) => e.idInventarioPresentacion === this.dataConceptos[i].idInventarioPresentacion)[0];
					if (facturado) {
						seFactura = 1;
						(facturado.facturado != 0 || (parseFloat(this.dataConceptos[i].montoTotal) < 0.01)) ? yaFacturado = 1 : yaFacturado = 0;
					}
					else {
						(parseFloat(this.dataConceptos[i].montoTotal) < 0.01) ? yaFacturado = 1 : yaFacturado = 0;
					}
				}
				else {
					seFactura = 1;
				}
				this.facturacion.listaFacturar.push({
					id: i,
					idInventarioPresentacion: (facturado) ? facturado.idInventarioPresentacion : this.dataConceptos[i].idInventarioPresentacion,
					idInventarioProducto: (facturado) ? facturado.idInventarioProducto : this.dataConceptos[i].idInventarioProducto,
					descripcion: (facturado) ? facturado.descripcion : this.dataConceptos[i].nombreProducto,
					cveUnidad: (facturado) ? facturado.idUnidadMedida : this.dataConceptos[i].idUnidadMedidaProducto,
					cveProdServ: (facturado) ? facturado.idClaveProdServ : this.dataConceptos[i].idClaveProdServProducto,
					cantidad: (facturado) ? facturado.cantidad : this.dataConceptos[i].cantidadProducto,
					valorU: (facturado) ? parseFloat(((facturado.importe + facturado.monto_iva - facturado.isr_resico) / facturado.cantidad).toFixed(6)) : parseFloat((this.dataConceptos[i].montoTotal / this.dataConceptos[i].cantidadProducto).toFixed(6)),
					importe: (facturado) ? parseFloat((facturado.importe).toFixed(6)) : parseFloat((this.dataConceptos[i].montoTotal).toFixed(6)),
					importeMostrar: (facturado) ? parseFloat((facturado.importe).toFixed(6)) : Math.round(parseFloat((this.dataConceptos[i].montoTotal).toFixed(6)) * 100) / 100,
					dataUnidadMedida: this.dataUnidadMedida,
					dataCveProdServ: this.dataCveProdServ,
					seFactura: seFactura,
					ivaImporte: (facturado) ? parseFloat(facturado.monto_iva.toFixed(6)) : 0.000000,
					ivaImporteMostrar: (facturado) ? parseFloat(facturado.monto_iva.toFixed(6)) : 0.000000,
					impuestoIVA: null,
					factor_iva: (facturado) ? ((facturado.factor_iva > 0.000000) ? facturado.factor_iva : "") : "",
					dataIVA: this.dataImpuestoIva,
					totalImporte: (facturado) ? parseFloat((facturado.importe + facturado.monto_iva - facturado.isr_resico).toFixed(6)) : parseFloat((this.dataConceptos[i].montoTotal).toFixed(6)),
					yaFacturado: yaFacturado,
					idServicio: "",
					tipo: this.dataConceptos[i].tipo,
					montoTotal: (facturado) ? parseFloat((facturado.importe).toFixed(6)) : this.dataConceptos[i].montoTotal,
					aplicaIVA: (facturado) ? ((facturado.factor_iva > 0.000000) ? 1 : 0) : 0,
					aplicaResico: parseFloat(facturado.isr_resico) > 0 ? 1: 0,
					retencionISRMostrar: (facturado) ? parseFloat(facturado.isr_resico.toFixed(6)) : 0.000000,
				});
				posicion = i;
				this.facturacion.subtotal += (this.facturacion.listaFacturar[i].yaFacturado || !this.facturacion.listaFacturar[i].seFactura) ? 0 : this.facturacion.listaFacturar[i].importe;
				this.facturacion.impuestoIva += (this.facturacion.listaFacturar[i].yaFacturado || !this.facturacion.listaFacturar[i].seFactura) ? 0 : this.facturacion.listaFacturar[i].ivaImporte;
				this.facturacion.subtotalMostrar += (this.facturacion.listaFacturar[i].yaFacturado || !this.facturacion.listaFacturar[i].seFactura) ? 0 : this.facturacion.listaFacturar[i].importeMostrar;
				this.facturacion.impuestoIvaMostrar += (this.facturacion.listaFacturar[i].yaFacturado || !this.facturacion.listaFacturar[i].seFactura) ? 0 : this.facturacion.listaFacturar[i].ivaImporteMostrar;
				this.facturacion.impuestoRetencionISR += (this.facturacion.listaFacturar[i].yaFacturado || !this.facturacion.listaFacturar[i].seFactura) ? 0 : this.facturacion.listaFacturar[i].retencionISRMostrar;
			}
			else if (this.dataConceptos[i].idInventarioPresentacion == null && this.dataConceptos[i].nombreServicio == null) {

				let index = this.facturacion.listaFacturar.filter((e: any) => e.idServicio === this.dataConceptos[i].idServicio)[0];
				if (false) {
					this.facturacion.listaFacturar[this.facturacion.listaFacturar.indexOf(index)].cantidad++;
					this.facturacion.listaFacturar[this.facturacion.listaFacturar.indexOf(index)].importe =
						parseFloat((this.facturacion.listaFacturar[this.facturacion.listaFacturar.indexOf(index)].cantidad *
							this.facturacion.listaFacturar[this.facturacion.listaFacturar.indexOf(index)].valorU).toFixed(6));
					this.facturacion.listaFacturar[this.facturacion.listaFacturar.indexOf(index)].importeMostrar = Math.round(this.facturacion.listaFacturar[this.facturacion.listaFacturar.indexOf(index)].importe * 100) / 100
					this.facturacion.listaFacturar[this.facturacion.listaFacturar.indexOf(index)].totalImporte = this.facturacion.listaFacturar[this.facturacion.listaFacturar.indexOf(index)].importeMostrar;
					this.facturacion.subtotal += (this.facturacion.listaFacturar[this.facturacion.listaFacturar.indexOf(index)].yaFacturado || !this.facturacion.listaFacturar[this.facturacion.listaFacturar.indexOf(index)].seFactura) ? 0 : this.facturacion.listaFacturar[this.facturacion.listaFacturar.indexOf(index)].valorU;
					this.facturacion.subtotalMostrar += (this.facturacion.listaFacturar[this.facturacion.listaFacturar.indexOf(index)].yaFacturado || !this.facturacion.listaFacturar[this.facturacion.listaFacturar.indexOf(index)].seFactura) ? 0 : this.facturacion.listaFacturar[this.facturacion.listaFacturar.indexOf(index)].valorU;
					posicion = this.facturacion.listaFacturar[this.facturacion.listaFacturar.indexOf(index)].id;
				} else {
					let yaFacturado = 0;
					let seFactura = 0;
					let facturado = undefined;
					if (this.dataFacturaDetalle && this.dataConceptos[i].idServicio != null) {
						facturado = this.dataFacturaDetalle.filter((e: any) => e.idServicio === this.dataConceptos[i].idServicio)[0];
						if (facturado) {
							seFactura = 1;
							(facturado.facturado != 0 || (parseFloat(this.dataConceptos[i].montoTotal) < 0.01)) ? yaFacturado = 1 : yaFacturado = 0;
						}
						else {
							(parseFloat(this.dataConceptos[i].montoTotal) < 0.01) ? yaFacturado = 1 : yaFacturado = 0;
						}
					}
					else {
						seFactura = 1;
					}
					this.facturacion.listaFacturar.push({
						id: i,
						idServicio: (facturado) ? facturado.idServicio : this.dataConceptos[i].idServicio,
						descripcion: (facturado) ? facturado.descripcion : this.dataConceptos[i].descripcion,
						cveUnidad: (facturado) ? facturado.idUnidadMedida : this.dataConceptos[i].idUnidadMedidaServicio,
						cveProdServ: (facturado) ? facturado.idClaveProdServ : this.dataConceptos[i].idClaveProdServServicio,
						cantidad: 1,
						valorU: (facturado) ? parseFloat(((facturado.importe + facturado.monto_iva - facturado.isr_resico) / facturado.cantidad).toFixed(6)) : parseFloat((this.dataConceptos[i].montoTotal).toFixed(6)),
						importe: (facturado) ? parseFloat((facturado.importe).toFixed(6)) : parseFloat((this.dataConceptos[i].montoTotal).toFixed(6)),
						importeMostrar: (facturado) ? parseFloat((facturado.importe).toFixed(6)) : Math.round(parseFloat((this.dataConceptos[i].montoTotal).toFixed(6)) * 100) / 100,
						dataUnidadMedida: this.dataUnidadMedida,
						dataCveProdServ: this.dataCveProdServ,
						seFactura: seFactura,
						ivaImporte: (facturado) ? parseFloat(facturado.monto_iva.toFixed(6)) : 0.000000,
						ivaImporteMostrar: (facturado) ? parseFloat(facturado.monto_iva.toFixed(6)) : 0.000000,
						impuestoIVA: null,
						factor_iva: (facturado) ? ((facturado.factor_iva > 0.000000) ? facturado.factor_iva : "") : "",
						dataIVA: this.dataImpuestoIva,
						totalImporte: (facturado) ? parseFloat((facturado.importe + facturado.monto_iva - facturado.isr_resico).toFixed(6)) : parseFloat((this.dataConceptos[i].montoTotal).toFixed(6)),
						yaFacturado: yaFacturado,
						idInventarioPresentacion: "",
						idInventarioProducto: "",
						tipo: this.dataConceptos[i].tipo,
						montoTotal: (facturado) ? parseFloat((facturado.importe).toFixed(6)) :this.dataConceptos[i].montoTotal,
						aplicaIVA: (facturado) ? ((facturado.factor_iva > 0.000000) ? 1 : 0) : 0,
						aplicaResico: parseFloat(facturado.isr_resico) > 0 ? 1: 0,
						retencionISRMostrar: (facturado) ? parseFloat(facturado.isr_resico.toFixed(6)) : 0.000000,
					});
					posicion = i;
					let servicioId = this.facturacion.listaFacturar.filter((e: any) => e.id === i)[0];
					this.facturacion.subtotal += (servicioId.yaFacturado || !servicioId.seFactura) ? 0 : servicioId.importe;
					this.facturacion.impuestoIva += (servicioId.yaFacturado || !servicioId.seFactura) ? 0 : servicioId.ivaImporte;
					this.facturacion.subtotalMostrar += (servicioId.yaFacturado || !servicioId.seFactura) ? 0 : servicioId.importeMostrar;
					this.facturacion.impuestoIvaMostrar += (servicioId.yaFacturado || !servicioId.seFactura) ? 0 : servicioId.ivaImporteMostrar;
					this.facturacion.impuestoRetencionISR += (servicioId.yaFacturado || !servicioId.seFactura) ? 0 : servicioId.retencionISRMostrar;
				}

			}

			let seFacturaTemp = this.facturacion.listaFacturar[posicion].seFactura ? true : false;
			let yaFacturadoTemp = this.facturacion.listaFacturar[posicion].yaFacturado ? true : false;
			//Cambios Sara
			if (!seFacturaTemp || yaFacturadoTemp) {
				contadorFacturados++;
			}
		}
		this.facturacion.total = (this.facturacion.subtotal + this.facturacion.impuestoIva - this.facturacion.impuestoRetencionISR);
		this.facturacion.totalMostrar = (this.facturacion.subtotalMostrar + this.facturacion.impuestoIvaMostrar - this.facturacion.impuestoRetencionISR);
		//Cambios Sara
		if (this.facturacion.listaFacturar.length == contadorFacturados) {//Quiere decir que todos los conceptos de la cita ya han sido facturados
			this.ocultarGuardar = true;
		}
		else {
			this.ocultarGuardar = false;
		}
	}; //Seteamos los conceptos que estan y seran facturados	

	setearDatosFiscales() { //Setea los datos cuando se abren desde la agenda y no cuenta con ninguna factura
		this._backService.HttpPost('catalogos/factura/cargarDatos', {}, {}).subscribe(
			response => {
				this.dataImpuestoIva = eval(response)[6];
				this.dataformasDePago = eval(response)[2];
				this.datametodosDePago = eval(response)[1];
				this.dataCFDI = eval(response)[0];
				this.dataSerie = eval(response)[4];
				this.dataCveProdServ = eval(response)[5];
				this.dataUnidadMedida = eval(response)[3];
				let fisica, moral = 0;
				if (this.datosFiscales[0].tipo == "Física") {
					fisica = 1;
					moral = 0;
				} else {
					fisica = 0;
					moral = 1;
				}
				this.cargarRegimenFiscal(fisica, moral);
				//Datos del receptor
				this.facturacion.receptorIdCliente = (this.datosFiscales[1].idCliente == null) ? "" : this.datosFiscales[1].idCliente;
				this.facturacion.receptorNombre = (this.datosFiscales[1].nombre == null) ? "" : this.datosFiscales[1].nombre;
				this.facturacion.receptorRFC = (this.datosFiscales[1].RFC == null) ? "" : this.datosFiscales[1].RFC;
				this.facturacion.receptorCFDI = (this.datosFiscales[1].idDatosFiscalesUsoCFDI == null) ? this.dataCFDI.filter((e: any) => e.descripcion === 'Por definir')[0].idDatosFiscalesUsoCFDI : this.datosFiscales[1].idDatosFiscalesUsoCFDI;
				this.facturacion.receptorFormaPago = (this.datosFiscales[1].idDatosFiscalesFormaPago == null) ? this.dataformasDePago.filter((e: any) => e.descripcion === 'Por definir')[0].idDatosFiscalesFormaPago : this.datosFiscales[1].idDatosFiscalesFormaPago;
				this.facturacion.receptorMetodoPago = (this.datosFiscales[1].idDatosFiscalesMetodoPago == null) ? this.datametodosDePago.filter((e: any) => e.descripcion === 'Pago en una sola exhibición')[0].idDatosFiscalesMetodoPago : this.datosFiscales[1].idDatosFiscalesMetodoPago;
				//Datos del emisor y generales
				this.facturacion.emisorSucursal = (this.datosFiscales[0].idSucursal == null) ? "" : this.datosFiscales[0].idSucursal;
				this.facturacion.antiguoemisorSucursal = this.facturacion.emisorSucursal;
				this.facturacion.emisorRegimenFiscal = (this.datosFiscales[0].regimenFiscal == null) ? "" : this.datosFiscales[0].regimenFiscal;
				this.modales.modalFactura.show();
				this._pantallaServicio.ocultarSpinner();
				this.conceptosFacturar();
			},
			error => {
				this._pantallaServicio.ocultarSpinner();
				if (error === 'SinSesion' || error === 'SesionCaducada') {
					if (error === 'SinSesion') {
						this._toaster.error(this.sessionTraslate.favorIniciarSesion);
					}
					if (error === 'SesionCaducada') {
						this._toaster.error(this.sessionTraslate.sesionCaducada);
					}
					this._router.navigate(['/login']);
				}
			}
		)
	};

	setearFactura() {
		this._backService.HttpPost('catalogos/factura/cargarDatos', {}, {}).subscribe(
			response => {
				this.dataImpuestoIva = eval(response)[6];
				this.dataformasDePago = eval(response)[2];
				this.datametodosDePago = eval(response)[1];
				this.dataCFDI = eval(response)[0];
				this.dataSerie = eval(response)[4];
				this.dataCveProdServ = eval(response)[5];
				this.dataUnidadMedida = eval(response)[3];
				let fisica, moral = 0;
				if (this.dataFactura[0].tipo == "Física") {
					fisica = 1;
					moral = 0;
				} else {
					fisica = 0;
					moral = 1;
				}
				this.cargarRegimenFiscal(fisica, moral);
				//Datos del receptor
				this.facturacion.receptorIdCliente = (this.dataFactura[0].idCliente == null) ? "" : this.dataFactura[0].idCliente;
				this.facturacion.receptorNombre = (this.dataFactura[0].clienteNombre == null) ? "" : this.dataFactura[0].clienteNombre;
				this.facturacion.receptorRFC = (this.dataFactura[0].clienteRFC == null) ? "" : this.dataFactura[0].clienteRFC;
				this.facturacion.receptorCFDI = (this.dataFactura[0].receptorusoCFDI == null) ? "" : this.dataFactura[0].receptorusoCFDI;
				this.facturacion.receptorFormaPago = (this.dataFactura[0].receptorFormaPago == null) ? "" : this.dataFactura[0].receptorFormaPago;
				this.facturacion.receptorMetodoPago = (this.dataFactura[0].receptorMetodoDePago == null) ? "" : this.dataFactura[0].receptorMetodoDePago;
				//Datos del emisor y generales
				this.facturacion.emisorSucursal = (this.dataFactura[0].idSucursal == null) ? "" : this.dataFactura[0].idSucursal;
				this.facturacion.antiguoemisorSucursal = this.facturacion.emisorSucursal;
				this.facturacion.emisorRegimenFiscal = (this.dataFactura[0].regimenFiscal == null) ? "" : this.dataFactura[0].regimenFiscal;
				this.facturacion.serieyFolioFactura = (this.dataFactura[0].idSerie == null) ? "" : this.dataFactura[0].idSerie;
				this.modales.modalFactura.show();
				this._pantallaServicio.ocultarSpinner();
				this.conceptosFacturar();
			},
			error => {
				this._pantallaServicio.ocultarSpinner();
				if (error === 'SinSesion' || error === 'SesionCaducada') {
					if (error === 'SinSesion') {
						this._toaster.error(this.sessionTraslate.favorIniciarSesion);
					}
					if (error === 'SesionCaducada') {
						this._toaster.error(this.sessionTraslate.sesionCaducada);
					}
					this._router.navigate(['/login']);
				}
			}
		)
	}; //Setea los datos cuando se abren desde listado de documento, o ya existen facturas relacionadas a la cita

	regresarDatosGenerales() {
		this.datosGenerales = false;
		this.conceptos = true;
	};

	next() {
		this.conceptos = false;
		this.datosGenerales = true;
	};

	guardarFacturas() {
		let llevaIVA = false;
		let params: any = {};
		params.folioPago = this.folio_pago;
		params.idPagoClienteProducto = null;
		params.serie = this.facturacion.serieyFolioFactura;
		params.totalIva = this.facturacion.impuestoIva;
		params.subTotalAntesImpuestos = this.facturacion.subtotal;
		params.idCliente = this.facturacion.receptorIdCliente;
		params.clienteNombre = this.facturacion.receptorNombre;
		params.clienteRFC = this.facturacion.receptorRFC;
		params.receptorFormaPago = this.facturacion.receptorFormaPago;
		params.receptorMetodoDePago = this.facturacion.receptorMetodoPago;
		params.receptorusoCFDI = this.facturacion.receptorCFDI;
		params.regimenFiscal = this.facturacion.emisorRegimenFiscal;
		params.conceptos = [];
		for (let i = 0; i < this.facturacion.listaFacturar.length; i++) {
			if (this.facturacion.listaFacturar[i].seFactura && !this.facturacion.listaFacturar[i].yaFacturado) {
				params.conceptos.push(this.facturacion.listaFacturar[i]);
			}
		}
		params.factor_iva = (this.facturacion.ivaGeneral) ? this.facturacion.ivaGeneral : "";
		params.guardar = (this.idFactura) ? 0 : 1;//1 = guardar Primera vez, 0 = Cuando edita la factura
		params.idFactura = (this.idFactura) ? this.idFactura : "";
		params.timbrado = "0";
		params.retencionISRMostrar = (this.facturacion.impuestoRetencionISR);  // guardar el importe del retencion de resico

		this._pantallaServicio.mostrarSpinner();
		this._backService.HttpPost('catalogos/factura/guardarFactura', {}, params, "text").subscribe(
			response => {
				this._pantallaServicio.ocultarSpinner();
				this.cerrarModalFactura();
				this._toaster.success('La factura se guardó exitosamente');
			},
			error => {
				this._pantallaServicio.ocultarSpinner();
				if (error === 'SinSesion' || error === 'SesionCaducada') {
					if (error === 'SinSesion') {
						this._toaster.error(this.sessionTraslate.favorIniciarSesion);
					}
					if (error === 'SesionCaducada') {
						this._toaster.error(this.sessionTraslate.sesionCaducada);
					}
					this._router.navigate(['/login']);
				}
			}
		)
	};

	timbrarFacturas() {
		let llevaIVA = false;
		let params: any = {};
		params.folioPago = this.folio_pago;
		params.idPagoClienteProducto = null;
		params.serie = this.facturacion.serieyFolioFactura;
		params.totalIva = this.facturacion.impuestoIva;
		params.subTotalAntesImpuestos = this.facturacion.subtotal;
		params.idCliente = this.facturacion.receptorIdCliente;
		params.clienteNombre = this.facturacion.receptorNombre;
		params.clienteRFC = this.facturacion.receptorRFC;
		params.receptorFormaPago = this.facturacion.receptorFormaPago;
		params.receptorMetodoDePago = this.facturacion.receptorMetodoPago;
		params.receptorusoCFDI = this.facturacion.receptorCFDI;
		params.regimenFiscal = this.facturacion.emisorRegimenFiscal;
		params.conceptos = [];
		for (let i = 0; i < this.facturacion.listaFacturar.length; i++) {
			if (this.facturacion.listaFacturar[i].seFactura && !this.facturacion.listaFacturar[i].yaFacturado) {
				params.conceptos.push(this.facturacion.listaFacturar[i]);
			}
		}
		params.factor_iva = (this.facturacion.ivaGeneral) ? this.facturacion.ivaGeneral : "";
		params.guardar = (this.idFactura) ? 0 : 1;//1 = guardar Primera vez, 0 = Cuando edita la factura
		params.idFactura = (this.idFactura) ? this.idFactura : "";
		params.timbrado = "1";
		params.retencionISRMostrar = (this.facturacion.impuestoRetencionISR);

		this._pantallaServicio.mostrarSpinner();
		this._backService.HttpPost('catalogos/factura/generarFactura', {}, params, "text").subscribe(
			(response: any) => {
				this._pantallaServicio.ocultarSpinner();
				if (response == "True" || response == "true" || response == true) {
					this.cerrarModalFactura();
					this._toaster.success('La factura se timbró exitosamente');
					this.consultarDocumentos();

				} else {
					this.cerrarModalFactura();
					this.modalInformacionFactura(response);
				}
			},
			error => {
				this._pantallaServicio.ocultarSpinner();
				if (error === 'SinSesion' || error === 'SesionCaducada') {
					if (error === 'SinSesion') {
						this._toaster.error(this.sessionTraslate.favorIniciarSesion);
					}
					if (error === 'SesionCaducada') {
						this._toaster.error(this.sessionTraslate.sesionCaducada);
					}
					this._router.navigate(['/login']);
				}
			}
		)
	};

	calcularTotalFactura(index?: any, seFactura?: any) {
		if (seFactura) {
			this.facturacion.subtotal += this.facturacion.listaFacturar[index].importe;
			this.facturacion.impuestoIva += this.facturacion.listaFacturar[index].ivaImporte;
			this.facturacion.total = (this.facturacion.subtotal + this.facturacion.impuestoIva);
			this.facturacion.subtotalMostrar += this.facturacion.listaFacturar[index].importeMostrar;
			this.facturacion.impuestoIvaMostrar += this.facturacion.listaFacturar[index].ivaImporteMostrar;
			this.facturacion.totalMostrar = (this.facturacion.subtotalMostrar + this.facturacion.impuestoIvaMostrar);
		} else {
			this.facturacion.listaFacturar[index].aplicaIVA = false;
			this.deshabilitarIvaDropDown(index);
			this.facturacion.subtotal -= this.facturacion.listaFacturar[index].importe;
			this.facturacion.impuestoIva -= this.facturacion.listaFacturar[index].ivaImporte;
			this.facturacion.total = (this.facturacion.subtotal + this.facturacion.impuestoIva);
			this.facturacion.subtotalMostrar -= this.facturacion.listaFacturar[index].importeMostrar;
			this.facturacion.impuestoIvaMostrar -= this.facturacion.listaFacturar[index].ivaImporteMostrar;
			this.facturacion.totalMostrar = (this.facturacion.subtotalMostrar + this.facturacion.impuestoIvaMostrar);
		}
	}

	// Habilitar / deshabilitar dropdown
	deshabilitarIvaDropDown(index?: any) {

		//Aplica iva (Están volteados)
		//True -> No aplica iva
		//False -> Aplica IVA

		//Checar si hay al menos uno seleccionado para saber si habilitar o deshabilitar el dropdown
		this.facturacion.aplicaIVA = true;
		for (let i = 0; i < this.facturacion.listaFacturar.length; i++) {
			if (this.facturacion.listaFacturar[i].aplicaIVA) {
				this.facturacion.aplicaIVA = false;
				break;
			}
		}

		//Si ya no hay ninguno seleccionado, settear el ivaGeneral
		if (this.facturacion.aplicaIVA) {
			this.facturacion.ivaGeneral = null;
		}

		//Resetear calculos concepto
		let valor = 0.00;
		this.facturacion.listaFacturar[index].factor_iva = "";
		this.facturacion.subtotal += (this.facturacion.listaFacturar[index].ivaImporte - this.facturacion.listaFacturar[index].retencionISRMostrar);
		this.facturacion.subtotalMostrar += (this.facturacion.listaFacturar[index].ivaImporteMostrar - this.facturacion.listaFacturar[index].retencionISRMostrar);
		this.facturacion.listaFacturar[index].importe += (this.facturacion.listaFacturar[index].ivaImporte - this.facturacion.listaFacturar[index].retencionISRMostrar)
		this.facturacion.listaFacturar[index].importeMostrar += ((Math.round(this.facturacion.listaFacturar[index].ivaImporte * 100) / 100) - this.facturacion.listaFacturar[index].retencionISRMostrar);
		this.facturacion.impuestoIva -= this.facturacion.listaFacturar[index].ivaImporte;
		this.facturacion.impuestoIvaMostrar -= this.facturacion.listaFacturar[index].ivaImporteMostrar;
		this.facturacion.impuestoRetencionISR -= this.facturacion.listaFacturar[index].retencionISRMostrar;
		this.facturacion.listaFacturar[index].ivaImporte = 0.000000;
		this.facturacion.listaFacturar[index].ivaImporteMostrar = 0.000000;
		this.facturacion.listaFacturar[index].retencionISRMostrar = 0.000000;
		this.facturacion.listaFacturar[index].totalImporte = (this.facturacion.listaFacturar[index].importeMostrar + (this.facturacion.listaFacturar[index].ivaImporteMostrar - this.facturacion.listaFacturar[index].retencionISRMostrar));
		this.facturacion.total = (this.facturacion.subtotal + (this.facturacion.impuestoIva - this.facturacion.impuestoRetencionISR));
		this.facturacion.totalMostrar = (this.facturacion.subtotalMostrar + (this.facturacion.impuestoIvaMostrar - this.facturacion.impuestoRetencionISR));

		if(parseInt(this.facturacion.listaFacturar[index].cantidad) == 1){
			this.facturacion.listaFacturar[index].importe = this.facturacion.listaFacturar[index].valorU;
			this.facturacion.listaFacturar[index].importeMostrar = this.facturacion.listaFacturar[index].valorU;
			this.facturacion.listaFacturar[index].totalImporte = this.facturacion.listaFacturar[index].importeMostrar;
		}
		//Cálculos para el subtotal y el total
		//Index para buscar el elemento en el arreglo que seleccionó y aplicarle o desaplicarle el iva
		if (this.facturacion.listaFacturar[index].aplicaIVA == true && this.facturacion.listaFacturar[index].aplicaResico == false) {
			if (this.facturacion.ivaGeneral) {
				//Hay iva
				this.facturacion.listaFacturar[index].factor_iva = this.facturacion.ivaGeneral;
				//Importe e importe Mostrar regresan a su estado original para poder hacer de nuevo los cálculos
				this.facturacion.listaFacturar[index].importe = this.facturacion.listaFacturar[index].importeMostrar + this.facturacion.listaFacturar[index].ivaImporteMostrar;
				this.facturacion.listaFacturar[index].importeMostrar = parseFloat((this.facturacion.listaFacturar[index].importeMostrar + this.facturacion.listaFacturar[index].ivaImporteMostrar).toFixed(6));

				this.facturacion.listaFacturar[index].ivaImporte = parseFloat((this.facturacion.listaFacturar[index].importe - (this.facturacion.listaFacturar[index].importe / (1 + this.facturacion.ivaGeneral))).toFixed(6));
				this.facturacion.listaFacturar[index].ivaImporteMostrar = (Math.round(this.facturacion.listaFacturar[index].ivaImporte * 100) / 100);
				this.facturacion.listaFacturar[index].importe = parseFloat((this.facturacion.listaFacturar[index].importe / (1 + this.facturacion.ivaGeneral)).toFixed(6));
				this.facturacion.listaFacturar[index].importeMostrar = (Math.round(this.facturacion.listaFacturar[index].importe * 100) / 100);
				this.facturacion.listaFacturar[index].totalImporte = (this.facturacion.listaFacturar[index].importeMostrar + this.facturacion.listaFacturar[index].ivaImporteMostrar);
				this.facturacion.subtotal -= (this.facturacion.listaFacturar[index].ivaImporte - this.facturacion.listaFacturar[index].retencionISRMostrar);
				this.facturacion.impuestoIva += this.facturacion.listaFacturar[index].ivaImporte;
				this.facturacion.impuestoRetencionISR += this.facturacion.listaFacturar[index].retencionISRMostrar;
				this.facturacion.total = (this.facturacion.subtotal + this.facturacion.impuestoIva - this.facturacion.impuestoRetencionISR);
				this.facturacion.subtotalMostrar -= (this.facturacion.listaFacturar[index].ivaImporteMostrar - this.facturacion.listaFacturar[index].retencionISRMostrar);
				this.facturacion.impuestoIvaMostrar += this.facturacion.listaFacturar[index].ivaImporteMostrar;
				this.facturacion.totalMostrar = (this.facturacion.subtotalMostrar + this.facturacion.impuestoIvaMostrar  - this.facturacion.impuestoRetencionISR);
				this.facturacion.listaFacturar[index].retencionISRMostrar = 0.00;
			}
		}
		else if (this.facturacion.listaFacturar[index].aplicaIVA == true && this.facturacion.listaFacturar[index].aplicaResico == true) {
			if (this.facturacion.ivaGeneral) {
				//Hay iva
				this.facturacion.listaFacturar[index].factor_iva = this.facturacion.ivaGeneral;
				//Importe e importe Mostrar regresan a su estado original para poder hacer de nuevo los cálculos
				this.facturacion.listaFacturar[index].importe = this.facturacion.listaFacturar[index].importeMostrar + this.facturacion.listaFacturar[index].ivaImporteMostrar;
				this.facturacion.listaFacturar[index].importeMostrar = parseFloat((this.facturacion.listaFacturar[index].importeMostrar + this.facturacion.listaFacturar[index].ivaImporteMostrar).toFixed(6));

				let impuestoGeneral = this.facturacion.listaFacturar[index].factor_iva - this.facturacion.retencionISR;
				this.facturacion.listaFacturar[index].importe = parseFloat((this.facturacion.listaFacturar[index].importe / (1 + impuestoGeneral)).toFixed(6));
				this.facturacion.listaFacturar[index].importeMostrar = (Math.round(this.facturacion.listaFacturar[index].importe * 100) / 100);
				this.facturacion.listaFacturar[index].ivaImporte = parseFloat((this.facturacion.listaFacturar[index].importe * this.facturacion.ivaGeneral).toFixed(6));
				this.facturacion.listaFacturar[index].ivaImporteMostrar = (Math.round(this.facturacion.listaFacturar[index].ivaImporte * 100) / 100);
				this.facturacion.listaFacturar[index].retencionISRMostrar = (Math.round(parseFloat((this.facturacion.listaFacturar[index].importe * this.facturacion.retencionISR).toFixed(6)) * 100) / 100);
				
				this.facturacion.listaFacturar[index].totalImporte = (this.facturacion.listaFacturar[index].importeMostrar + this.facturacion.listaFacturar[index].ivaImporteMostrar - this.facturacion.listaFacturar[index].retencionISRMostrar);
				this.facturacion.subtotal -= (this.facturacion.listaFacturar[index].ivaImporte - this.facturacion.listaFacturar[index].retencionISRMostrar);
				this.facturacion.impuestoIva += this.facturacion.listaFacturar[index].ivaImporte;
				this.facturacion.impuestoRetencionISR += this.facturacion.listaFacturar[index].retencionISRMostrar;
				this.facturacion.total = (this.facturacion.subtotal + (this.facturacion.impuestoIva - this.facturacion.impuestoRetencionISR));
				this.facturacion.subtotalMostrar -= (this.facturacion.listaFacturar[index].ivaImporteMostrar - this.facturacion.listaFacturar[index].retencionISRMostrar);
				this.facturacion.impuestoIvaMostrar += this.facturacion.listaFacturar[index].ivaImporteMostrar;
				this.facturacion.totalMostrar = (this.facturacion.subtotalMostrar + (this.facturacion.impuestoIvaMostrar - this.facturacion.impuestoRetencionISR));
			}
		}
		// Caso cuando el iva esta deshabilitado y resico esta habilitado
		else if (this.facturacion.listaFacturar[index].aplicaIVA == false && this.facturacion.listaFacturar[index].aplicaResico == true) {
			this.facturacion.listaFacturar[index].importe = this.facturacion.listaFacturar[index].importeMostrar + this.facturacion.listaFacturar[index].ivaImporteMostrar;
			this.facturacion.listaFacturar[index].importeMostrar = parseFloat((this.facturacion.listaFacturar[index].importeMostrar + this.facturacion.listaFacturar[index].ivaImporteMostrar).toFixed(6));

			let impuestoGeneral = this.facturacion.retencionISR;
			this.facturacion.listaFacturar[index].importe = parseFloat((this.facturacion.listaFacturar[index].importe / (1 - impuestoGeneral)).toFixed(6));
			this.facturacion.listaFacturar[index].importeMostrar = (Math.round(this.facturacion.listaFacturar[index].importe * 100) / 100);
			this.facturacion.listaFacturar[index].retencionISRMostrar = (Math.round(parseFloat((this.facturacion.listaFacturar[index].importe * this.facturacion.retencionISR).toFixed(6)) * 100) / 100);
			
			this.facturacion.listaFacturar[index].totalImporte = (this.facturacion.listaFacturar[index].importeMostrar - this.facturacion.listaFacturar[index].retencionISRMostrar);
			this.facturacion.subtotal += (this.facturacion.listaFacturar[index].retencionISRMostrar);
			this.facturacion.impuestoRetencionISR += this.facturacion.listaFacturar[index].retencionISRMostrar;
			this.facturacion.total = (this.facturacion.subtotal + (this.facturacion.impuestoIva - this.facturacion.impuestoRetencionISR));
			this.facturacion.subtotalMostrar += (this.facturacion.listaFacturar[index].retencionISRMostrar);
			this.facturacion.totalMostrar = (this.facturacion.subtotalMostrar + (this.facturacion.impuestoIvaMostrar - this.facturacion.impuestoRetencionISR));
		}
	

	}

	changeIvaGeneral() {
		//Checar cada uno de los detalles a ver si se les aplica el IVA y si no se les calculó ya
		for (let i = 0; i < this.facturacion.listaFacturar.length; i++) {
			if (this.facturacion.listaFacturar[i].aplicaIVA && (this.facturacion.listaFacturar[i].factor_iva != this.facturacion.ivaGeneral)) {
				this.facturacion.listaFacturar[i].factor_iva = this.facturacion.ivaGeneral;
				//Importe e importe Mostrar regresan a su estado original para poder hacer de nuevo los cálculos
				this.facturacion.listaFacturar[i].importe = this.facturacion.listaFacturar[i].importeMostrar + this.facturacion.listaFacturar[i].ivaImporteMostrar;
				this.facturacion.listaFacturar[i].importeMostrar = parseFloat((this.facturacion.listaFacturar[i].importeMostrar + this.facturacion.listaFacturar[i].ivaImporteMostrar).toFixed(6));
				this.facturacion.subtotal += this.facturacion.listaFacturar[i].ivaImporte;
				this.facturacion.impuestoIva -= this.facturacion.listaFacturar[i].ivaImporte;
				this.facturacion.subtotalMostrar += this.facturacion.listaFacturar[i].ivaImporteMostrar;
				this.facturacion.impuestoIvaMostrar -= this.facturacion.listaFacturar[i].ivaImporteMostrar;

				this.facturacion.listaFacturar[i].ivaImporte = parseFloat((this.facturacion.listaFacturar[i].importe - (this.facturacion.listaFacturar[i].importe / (1 + this.facturacion.ivaGeneral))).toFixed(6));
				this.facturacion.listaFacturar[i].ivaImporteMostrar = (Math.round(this.facturacion.listaFacturar[i].ivaImporte * 100) / 100);
				this.facturacion.listaFacturar[i].importe = parseFloat((this.facturacion.listaFacturar[i].importe / (1 + this.facturacion.ivaGeneral)).toFixed(6));
				this.facturacion.listaFacturar[i].importeMostrar = (Math.round(this.facturacion.listaFacturar[i].importe * 100) / 100);
				this.facturacion.listaFacturar[i].totalImporte = (this.facturacion.listaFacturar[i].importeMostrar + this.facturacion.listaFacturar[i].ivaImporteMostrar);
				this.facturacion.subtotal -= this.facturacion.listaFacturar[i].ivaImporte;
				this.facturacion.impuestoIva += this.facturacion.listaFacturar[i].ivaImporte;
				this.facturacion.total = (this.facturacion.subtotal + this.facturacion.impuestoIva);
				this.facturacion.subtotalMostrar -= this.facturacion.listaFacturar[i].ivaImporteMostrar;
				this.facturacion.impuestoIvaMostrar += this.facturacion.listaFacturar[i].ivaImporteMostrar;
				this.facturacion.totalMostrar = (this.facturacion.subtotalMostrar + this.facturacion.impuestoIvaMostrar);
			}
		}
	};

	validarCamposGenerales() {
		let isValid = true;

		if (this.facturacion.emisorSucursal == "") {
			isValid = false;
			$("#sucursalInput").addClass("errorCampo");
		} else {
			$("#sucursalInput").removeClass("errorCampo");
		}

		if (this.facturacion.emisorRegimenFiscal == "") {
			isValid = false;
			$("#regimenFiscalInput").addClass("errorCampo");
		} else {
			$("#regimenFiscalInput").removeClass("errorCampo");
		}

		if (this.facturacion.receptorRFC == "") {
			isValid = false;
			$("#rfcInput").addClass("errorCampo");
		} else {
			$("#rfcInput").removeClass("errorCampo");
		}

		if (this.facturacion.receptorFormaPago == "") {
			isValid = false;
			$("#formasDePagoSelect").addClass("errorCampo");
		} else {
			$("#formasDePagoSelect").removeClass("errorCampo");
		}

		if (this.facturacion.receptorMetodoPago == "") {
			isValid = false;
			$("#metodosDePagoSelect").addClass("errorCampo");
		} else {
			$("#metodosDePagoSelect").removeClass("errorCampo");
		}

		if (this.facturacion.receptorCFDI == "") {
			isValid = false;
			$("#CFDIInput").addClass("errorCampo");
		} else {
			$("#CFDIInput").removeClass("errorCampo");
		}

		if (this.facturacion.serieyFolioFactura == "") {
			isValid = false;
			$("#serieFolioInput").addClass("errorCampo");
		} else {
			$("#serieFolioInput").removeClass("errorCampo");
		}


		if (isValid) {
			this.next();
		}
	}

	validarConceptos(opcion?: any) {
		let isValid = true;
		for (let i = 0; i < this.facturacion.listaFacturar.length; i++) {
			$("#cveProdServ" + i + " .select2-choice").removeClass("errorCampo");
			$("#unidad" + i + " .select2-choice").removeClass("errorCampo");
			if (this.facturacion.listaFacturar[i].seFactura && !this.facturacion.listaFacturar[i].yaFacturado) {
				if (this.facturacion.listaFacturar[i].cveProdServ == "" || this.facturacion.listaFacturar[i].cveProdServ == null) {
					$("#cveProdServ" + i + " .select2-choice").addClass("errorCampo");
					isValid = false;
				}
				if (this.facturacion.listaFacturar[i].cveUnidad == "" || this.facturacion.listaFacturar[i].cveUnidad == null) {
					$("#unidad" + i + " .select2-choice").addClass("errorCampo");
					isValid = false;
				}

				if (this.facturacion.listaFacturar[i].tipo == 5) {
					if (this.facturacion.listaFacturar[i].cantidad == 0 || this.facturacion.listaFacturar[i].cantidad == "" || this.facturacion.listaFacturar[i].cantidad == null) {
						this._toaster.error('No se puede facturar cantidades en 0');
						isValid = false;
					}
					if (this.facturacion.listaFacturar[i].montoTotal == 0 || this.facturacion.listaFacturar[i].montoTotal == "" || this.facturacion.listaFacturar[i].montoTotal == null) {
						this._toaster.error('No se puede facturar montos en 0');
						isValid = false;
					}
				}
			}
		}

		$("#ddlIvaGeneral").removeClass("errorCampo");
		//Validar que haya seleccionado un iva general
		if (!this.facturacion.aplicaIVA) {
			if (!this.facturacion.ivaGeneral) {
				isValid = false;
				$("#ddlIvaGeneral").addClass("errorCampo");
				this._toaster.error(this.facturaTranslate.ivaMensaje);
			}
		}

		if (isValid) {
			if (opcion == 1) {
				this.guardarFacturas();
			} else {
				this.timbrarFacturas();

			}
		}
	}

	cerrarModalFactura() {
		this.modales.modalFactura.hide();
		this.datosGenerales = false;
		this.conceptos = true;
		this.facturacion.emisorSucursal = "";
		this.facturacion.emisorRegimenFiscal = "";
		this.facturacion.receptorCFDI = "";
		this.facturacion.receptorFormaPago = "";
		this.facturacion.receptorMetodoPago = "";
		this.facturacion.receptorNombre = "";
		this.facturacion.receptorRFC = "";
		this.facturacion.serieyFolioFactura = "";
		this.dataSucursales = [];
		this.dataformasDePago = [];
		this.datametodosDePago = [];
		this.dataCFDI = [];
		this.dataRegimen = [];
		this.dataSerie = [];
		this.datosFiscales = [];
		$("#sucursalInput").removeClass("errorCampo");
		$("#regimenFiscalInput").removeClass("errorCampo");
		$("#rfcInput").removeClass("errorCampo");
		$("#formasDePagoSelect").removeClass("errorCampo");
		$("#metodosDePagoSelect").removeClass("errorCampo");
		$("#CFDIInput").removeClass("errorCampo");
		$("#serieFolioInput").removeClass("errorCampo");
		for (let i = 0; i < this.facturacion.listaFacturar.length; i++) {
			if (this.facturacion.listaFacturar[i].seFactura) {
				$("#cveProdServ" + i).removeClass("errorCampo");
				$("#unidad" + i).removeClass("errorCampo");
				$("#impuestos" + i).removeClass("errorCampo");
			}
		}
	}

	modalInformacionFactura(message?: any) {
		this.modales.modalInformacionFactura.show();
		this.msgInformacionFactura = message;
	};

    // Funcion para el sorting de la tabla
    announceSortChange(sortState: Sort) {
        if (sortState.direction) {
            this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
        } else {
            this._liveAnnouncer.announce('Sorting cleared');
        }
    }
}
