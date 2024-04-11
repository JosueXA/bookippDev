import { Component, OnInit, ViewChild } from '@angular/core';
import { MethodsService } from 'src/app/core/services/methods.service';
import { TranslateService } from '@ngx-translate/core';
import { PantallaService } from 'src/app/core/services/pantalla.service';
import { Router } from '@angular/router';
import { ToasterService } from 'src/shared/toaster/toaster.service';
import * as bootstrap from 'bootstrap'; // BOOTSTRAP
import saveAs from 'file-saver';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
declare var $: any; // JQUERY
import moment from 'moment/moment';
import dayjs from 'dayjs';
import { DateAdapter } from '@angular/material/core';
import { Chart } from 'chart.js/auto';
import { jsPDF } from 'jspdf';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { TicketService } from 'src/app/core/services/ticket.service';

interface IColum {
	title: string;
	nameCol: string;
	styleCss?: string;
	styleCssRow?: string;
}

const numberFormat = new Intl.NumberFormat('es-MX', {
	style: 'currency',
	currency: 'MXN',
	minimumFractionDigits: 2,
	maximumFractionDigits: 2,
});

@Component({
	selector: 'app-productos',
	templateUrl: './productos.component.html',
	styleUrls: ['./productos.component.scss', '../../page.component.scss'],
})
export class ProductosComponent implements OnInit {
	// Variable de translate
	consultaProductosTranslate: any = {};
	sessionTraslate: any = {};
	consultaAjustesTranslate: any = {};
	calendarioTranslate: any = {};

	// Modales
	modales: any = {};

	//Permisos
	permisoAccionInventario: any = null;
	permisoLecturaCertificadoRegalo: any = null;
	permisoAccionCertificadoRegalo: any = null;

	constructor(
		private _backService: MethodsService,
		private _translate: TranslateService,
		private _pantallaServicio: PantallaService,
		private _router: Router,
		private _toaster: ToasterService,
		private dateAdapter: DateAdapter<Date>,
		private matIconRegistry: MatIconRegistry,
		private domSanitizer: DomSanitizer,
		private _ticketService: TicketService
	) {
		this.dateAdapter.setLocale('en-GB');
		this._translate.setDefaultLang(this._pantallaServicio.idioma);
		this._translate.use(this._pantallaServicio.idioma);

		this._translate
			.get('consultaProductosTranslate')
			.subscribe((translated: string) => {
				this.consultaProductosTranslate = this._translate.instant(
					'consultaProductosTranslate'
				);
				this.consultaAjustesTranslate = this._translate.instant(
					'consultaAjustesTranslate'
				);
				this.sessionTraslate = this._translate.instant('sessionTraslate');
				this.calendarioTranslate = this._translate.instant(
					'calendarioTranslate'
				);

				this.ranges = {
					[this.calendarioTranslate['dias7']]: [moment().subtract(6, 'days'), moment()], //subtract
					[this.calendarioTranslate['ultimoMes']]: [moment().startOf('month'), moment().endOf('month')],
					[this.calendarioTranslate['ultimoAnio']]: [moment().startOf('year'), moment().endOf('year')],
				};

				this.columnsProductos = [
					{
						title: this.consultaProductosTranslate.acciones,
						nameCol: 'acciones',
						styleCss: 'text-align: center; min-width: 150px;',
						styleCssRow: 'text-align: center; min-width: 150px;',
					},
					{
						title: this.consultaProductosTranslate.nombreMarca,
						nameCol: 'nombreMarca',
						styleCss: 'text-align: center; width: 15%; min-width: 150px;',
						styleCssRow: 'text-align: center; width: 15%; min-width: 150px;',
					},
					{
						title: this.consultaProductosTranslate.nombreProducto,
						nameCol: 'nombreProducto',
						styleCss: 'text-align: center; width: 15%; min-width: 150px;',
						styleCssRow: 'text-align: center; width: 15%; min-width: 150px;',
					},
					{
						title: this.consultaProductosTranslate.descripcion,
						nameCol: 'descripcion',
						styleCss: 'text-align: center; width: 15%;',
						styleCssRow: 'text-align: center; width: 15%;',
					},
					{
						title: this.consultaProductosTranslate.existencia,
						nameCol: 'existencia',
						styleCss: 'text-align: center; min-width: 150px;',
						styleCssRow: 'text-align: center; min-width: 150px;',
					},
					{
						title: this.consultaProductosTranslate.precioVenta,
						nameCol: 'precioVenta',
						styleCss: 'text-align: center; min-width: 120px;',
						styleCssRow: 'text-align: center; min-width: 120px;',
					},
					{
						title: this.consultaProductosTranslate.nombreProveedor,
						nameCol: 'nombreProveedor',
						styleCss: 'text-align: center; width: 15%; min-width: 120px;',
						styleCssRow: 'text-align: center; width: 15%; min-width: 120px;',
					},
				];
				this.displayedProductos = this.columnsProductos.map((e) => e.nameCol);

				this.columnsHistorico = [
					{
						title: this.consultaProductosTranslate.acciones,
						nameCol: 'acciones',
						styleCss: 'text-align: center; min-width: 100px;',
						styleCssRow: 'text-align: center; min-width: 100px;',
					},
					{
						title: this.consultaProductosTranslate.nombreMarca,
						nameCol: 'marca',
						styleCss: 'text-align: center; width: 15%;',
						styleCssRow: 'text-align: center; width: 15%;',
					},
					{
						title: this.consultaProductosTranslate.nombreProducto,
						nameCol: 'producto',
						styleCss: 'text-align: center; width: 15%;',
						styleCssRow: 'text-align: center; width: 15%;',
					},
					{
						title: this.consultaProductosTranslate.descripcion,
						nameCol: 'presentacion',
						styleCss: 'text-align: center; width: 15%;',
						styleCssRow: 'text-align: center; width: 15%;',
					},
					{
						title: 'Existencia Inicial',
						nameCol: 'existenciaInicial',
						styleCss: 'text-align: center; min-width: 100px;',
						styleCssRow: 'text-align: center; min-width: 100px;',
					},
					{
						title: 'Entradas',
						nameCol: 'entradas',
						styleCss: 'text-align: center; width: 15%;',
						styleCssRow: 'text-align: center; width: 15%;',
					},
					{
						title: 'Salidas',
						nameCol: 'salidas',
						styleCss: 'text-align: center; width: 15%;',
						styleCssRow: 'text-align: center; width: 15%;',
					},
					{
						title: 'Existencia Final',
						nameCol: 'existenciaFinal',
						styleCss: 'text-align: center; min-width: 110px;',
						styleCssRow: 'text-align: center; min-width: 110px;',
					},
				];
				this.displayedHistorico = this.columnsHistorico.map((e) => e.nameCol);

				this.columnsHistoricoMesActual = [
					{
						title: this.consultaProductosTranslate.nombreMarca,
						nameCol: 'marca',
						styleCss: 'text-align: center;',
						styleCssRow: 'text-align: center;',
					},
					{
						title: this.consultaProductosTranslate.nombreProducto,
						nameCol: 'producto',
						styleCss: 'text-align: center;',
						styleCssRow: 'text-align: center;',
					},
					{
						title: this.consultaProductosTranslate.descripcion,
						nameCol: 'presentacion',
						styleCss: 'text-align: center;',
						styleCssRow: 'text-align: center;',
					},
					{
						title: 'Existencia',
						nameCol: 'existencia',
						styleCss: 'min-width: 150px; text-align: center;',
						styleCssRow: 'text-align: center;',
					},
					{
						title: 'Costo',
						nameCol: 'costo',
						styleCss: 'text-align: center;',
						styleCssRow: 'text-align: center;',
					},
				];
				this.displayedHistoricoMesActual = this.columnsHistoricoMesActual.map(
					(e) => e.nameCol
				);

				this.columnsValorizacionActual = [
					{
						title: this.consultaProductosTranslate.nombreMarca,
						nameCol: 'marca',
						styleCss: 'text-align: center;',
						styleCssRow: 'text-align: center;',
					},
					{
						title: this.consultaProductosTranslate.nombreProducto,
						nameCol: 'producto',
						styleCss: 'text-align: center;',
						styleCssRow: 'text-align: center;',
					},
					{
						title: this.consultaProductosTranslate.descripcion,
						nameCol: 'presentacion',
						styleCss: 'text-align: center;',
						styleCssRow: 'text-align: center;',
					},
					{
						title: 'Fecha Devolucion',
						nameCol: 'fechaDevolucion',
						styleCss: 'min-width: 150px; text-align: center;',
						styleCssRow: 'text-align: center;',
					},
					{
						title: 'Cantidad',
						nameCol: 'cantidad',
						styleCss: 'text-align: center;',
						styleCssRow: 'text-align: center;',
					},
				];
				this.displayedValorizacionActual = this.columnsValorizacionActual.map(
					(e) => e.nameCol
				);

				this.columnsAjuste = [
					{
						title: this.consultaAjustesTranslate.numCtrl,
						nameCol: 'folio',
						styleCss: 'text-align: center; min-width: 100px;',
						styleCssRow: 'text-align: center; min-width: 100px;',
					},
					{
						title: this.consultaAjustesTranslate.fecha,
						nameCol: 'fechaAjuste',
						styleCss: 'text-align: center; width: 20%;',
						styleCssRow: 'text-align: center; width: 20%;',
					},
					{
						title: this.consultaAjustesTranslate.producto,
						nameCol: 'nombre',
						styleCss: 'text-align: center; width: 20%; min-width: 120px;',
						styleCssRow: 'text-align: center; width: 20%; min-width: 120px;',
					},
					{
						title: this.consultaAjustesTranslate.cantidad,
						nameCol: 'cantidad',
						styleCss: 'text-align: center; width: 20%;',
						styleCssRow: 'text-align: center; width: 20%;',
					},
					{
						title: this.consultaAjustesTranslate.realizado,
						nameCol: 'realizoAlta',
						styleCss: 'text-align: center; width: 20%;',
						styleCssRow: 'text-align: center; width: 20%;',
					},
					{
						title: this.consultaAjustesTranslate.observaciones,
						nameCol: 'observaciones',
						styleCss: 'text-align: center; width: 20%; min-width: 150px;',
						styleCssRow: 'text-align: center; width: 20%; min-width: 150px;',
					},
				];
				this.displayedAjuste = this.columnsAjuste.map((e) => e.nameCol);

				this.columnsCertificado = [
					{
						title: this.consultaProductosTranslate.acciones,
						nameCol: 'acciones',
						styleCss: 'text-align: center; min-width: 100px;',
						styleCssRow: 'text-align: center; min-width: 100px;',
					},
					{
						title: 'Nombre',
						nameCol: 'nombre',
						styleCss: 'text-align: center; width: 12%; min-width: 120px;',
						styleCssRow: 'text-align: center; width: 12%; min-width: 120px;',
					},
					{
						title: 'Cantidad',
						nameCol: 'cantidad',
						styleCss: 'text-align: center;',
						styleCssRow: 'text-align: center;',
					},
					{
						title: 'Cantidad en Existencia',
						nameCol: 'cantidadExistencia',
						styleCss: 'text-align: center; width: 10%; min-width: 140px;',
						styleCssRow: 'text-align: center; width: 10%; min-width: 140px;',
					},
					{
						title: 'Realizó Alta',
						nameCol: 'personaAlta',
						styleCss: 'text-align: center; width: 14%; min-width: 100px;',
						styleCssRow: 'text-align: center; width: 14%; min-width: 100px;',
					},
					{
						title: 'Fecha Alta',
						nameCol: 'fechaAlta',
						styleCss: 'text-align: center; width: 15%; min-width: 100px;',
						styleCssRow: 'text-align: center; width: 15%; min-width: 100px;',
					},
					{
						title: 'Realizó Cambio',
						nameCol: 'personaCambio',
						styleCss: 'text-align: center; width: 14%; min-width: 100px;',
						styleCssRow: 'text-align: center; width: 14%; min-width: 100px;',
					},
					{
						title: 'Fecha Cambio',
						nameCol: 'fechaCambio',
						styleCss: 'text-align: center; width: 15%; min-width: 100px;',
						styleCssRow: 'text-align: center; width: 15%; min-width: 100px;',
					},
					{
						title: 'Todas las Sucursales',
						nameCol: 'esEmpresa',
						styleCss: 'text-align: center; min-width: 130px;',
						styleCssRow: 'text-align: center; min-width: 130px;',
					},
				];
				this.displayedCertificado = this.columnsCertificado.map(
					(e) => e.nameCol
				);

				this.columnsPMR = [
					{
						title: this.consultaProductosTranslate.nombreMarca,
						nameCol: 'marca',
						styleCss: 'text-align: center;',
						styleCssRow: 'text-align: center;',
					},
					{
						title: this.consultaProductosTranslate.nombreProducto,
						nameCol: 'producto',
						styleCss: 'text-align: center;',
						styleCssRow: 'text-align: center;',
					},
					{
						title: this.consultaProductosTranslate.descripcion,
						nameCol: 'presentacion',
						styleCss: 'text-align: center;',
						styleCssRow: 'text-align: center;',
					},
					{
						title: 'Fecha Ultima Venta',
						nameCol: 'ultimaVenta',
						styleCss: 'text-align: center;',
						styleCssRow: 'text-align: center;',
					},
					{
						title: 'Cant. Meses sin vender',
						nameCol: 'cantidadMeses',
						styleCss: 'text-align: center;',
						styleCssRow: 'text-align: center;',
					},
				];
				this.displayedPMR = this.columnsPMR.map((e) => e.nameCol);

				this.columnsPMV = [
					{
						title: this.consultaProductosTranslate.nombreMarca,
						nameCol: 'marca',
						styleCss: 'text-align: center;',
						styleCssRow: 'text-align: center;',
					},
					{
						title: this.consultaProductosTranslate.nombreProducto,
						nameCol: 'producto',
						styleCss: 'text-align: center;',
						styleCssRow: 'text-align: center;',
					},
					{
						title: this.consultaProductosTranslate.descripcion,
						nameCol: 'presentacion',
						styleCss: 'text-align: center;',
						styleCssRow: 'text-align: center;',
					},
					{
						title: 'Ganancia Obtenida',
						nameCol: 'montoVendido',
						styleCss: 'text-align: center;',
						styleCssRow: 'text-align: center;',
					},
				];
				this.displayedPMV = this.columnsPMV.map((e) => e.nameCol);
			});


		this.matIconRegistry.addSvgIcon('iconCasita', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Casa1-icon.svg"));
		this.matIconRegistry.addSvgIcon('iconCross', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/10-2-TiposdeExcepcion-icon.svg"));
		this.matIconRegistry.addSvgIcon('iconAgregar', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Agregar-1-icon.svg"));
		this.matIconRegistry.addSvgIcon('iconSubir', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/NubeSubir-icon.svg"));
		this.matIconRegistry.addSvgIcon('iconExcel', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Excel-icon.svg"));
		this.matIconRegistry.addSvgIcon('iconBuscar', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Buscar-icon.svg"));
		this.matIconRegistry.addSvgIcon('iconEliminar', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Basura-icon.svg"));
		this.matIconRegistry.addSvgIcon('iconEditar', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Editar-icon.svg"));
		this.matIconRegistry.addSvgIcon('iconOrdenCompra', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/08-2-RecepciondeProducto-icon.svg"));
		this.matIconRegistry.addSvgIcon('iconMas', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Mas-icon.svg"));
		this.matIconRegistry.addSvgIcon('iconMenos', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Menos-icon.svg"));
		this.matIconRegistry.addSvgIcon('iconCoin', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/02-PuntodeVenta-icon.svg"));
		this.matIconRegistry.addSvgIcon('iconBars', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Menu-Hamburguesa-icon.svg"));
		this.matIconRegistry.addSvgIcon('iconCalendario', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/CalendarioEditar-icon.svg"));
		this.matIconRegistry.addSvgIcon('iconFlechaAbajo', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Flecha1Abajo-icon.svg"));
		this.matIconRegistry.addSvgIcon('iconFlechaDerecha', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/FlechaDerechaPequena-icon.svg"));
	}

	ngOnInit(): void {
		this.consultarPermisos();
		this.crearModales();
		this.consultaProductos();
		this.consultarInventarioMovimientoEIndicadores();
	}

	//ConsultarPermisos
	consultarPermisos() {
		this.permisoAccionInventario = Number(
			this._pantallaServicio.session['INVENTCT002']
		);
		this.permisoLecturaCertificadoRegalo = Number(
			this._pantallaServicio.session['INVENTCT005']
		);
		this.permisoAccionCertificadoRegalo = Number(
			this._pantallaServicio.session['INVENTCT006']
		);
	}

	// Crear modales
	crearModales() {
		if ($('body').find('.modalConfirmBorrarProducto').length > 1) {
			$('body').find('.modalConfirmBorrarProducto')[1].remove();
		}

		this.modales.modalConfirmBorrarProducto = new bootstrap.Modal(
			$('#modalConfirmBorrarProducto').appendTo('body'),
			{
				backdrop: 'static',
				keyboard: false,
			}
		);

		if ($('body').find('.modalDetalleValorizacionActual').length > 1) {
			$('body').find('.modalDetalleValorizacionActual')[1].remove();
		}

		this.modales.modalDetalleValorizacionActual = new bootstrap.Modal(
			$('#modalDetalleValorizacionActual').appendTo('body'),
			{
				backdrop: 'static',
				keyboard: false,
			}
		);

		if ($('body').find('.modalDetalleProductosDevueltos').length > 1) {
			$('body').find('.modalDetalleProductosDevueltos')[1].remove();
		}

		this.modales.modalDetalleProductosDevueltos = new bootstrap.Modal(
			$('#modalDetalleProductosDevueltos').appendTo('body'),
			{
				backdrop: 'static',
				keyboard: false,
			}
		);

		if ($('body').find('.modalMovimientosDetalle').length > 1) {
			$('body').find('.modalMovimientosDetalle')[1].remove();
		}

		this.modales.modalMovimientosDetalle = new bootstrap.Modal(
			$('#modalMovimientosDetalle').appendTo('body'),
			{
				backdrop: 'static',
				keyboard: false,
			}
		);

		if ($('body').find('.modalAjuste').length > 1) {
			$('body').find('.modalAjuste')[1].remove();
		}

		this.modales.modalAjuste = new bootstrap.Modal(
			$('#modalAjuste').appendTo('body'),
			{
				backdrop: 'static',
				keyboard: false,
			}
		);

		if ($('body').find('.modalCertificadoRegalo').length > 1) {
			$('body').find('.modalCertificadoRegalo')[1].remove();
		}

		this.modales.modalCertificadoRegalo = new bootstrap.Modal(
			$('#modalCertificadoRegalo').appendTo('body'),
			{
				backdrop: 'static',
				keyboard: false,
			}
		);

		if ($('body').find('.modalBorrarCertificadoRegalo').length > 1) {
			$('body').find('.modalBorrarCertificadoRegalo')[1].remove();
		}

		this.modales.modalBorrarCertificadoRegalo = new bootstrap.Modal(
			$('#modalBorrarCertificadoRegalo').appendTo('body'),
			{
				backdrop: 'static',
				keyboard: false,
			}
		);

		if ($('body').find('.modalCertificadoRegaloEditar').length > 1) {
			$('body').find('.modalCertificadoRegaloEditar')[1].remove();
		}

		this.modales.modalCertificadoRegaloEditar = new bootstrap.Modal(
			$('#modalCertificadoRegaloEditar').appendTo('body'),
			{
				backdrop: 'static',
				keyboard: false,
			}
		);

		if ($('body').find('.modalDetalleProductosMenorRotacion').length > 1) {
			$('body').find('.modalDetalleProductosMenorRotacion')[1].remove();
		}

		this.modales.modalDetalleProductosMenorRotacion = new bootstrap.Modal(
			$('#modalDetalleProductosMenorRotacion').appendTo('body'),
			{
				backdrop: 'static',
				keyboard: false,
			}
		);

		if ($('body').find('.modalDetalleProductosMasVendidos').length > 1) {
			$('body').find('.modalDetalleProductosMasVendidos')[1].remove();
		}

		this.modales.modalDetalleProductosMasVendidos = new bootstrap.Modal(
			$('#modalDetalleProductosMasVendidos').appendTo('body'),
			{
				backdrop: 'static',
				keyboard: false,
			}
		);
	}

	// ------------------------------------------- DECLARACIÓN DE VARIABLES GENERALES Y ESTILOS --------------------------------------------
	rootScope_fromState = 'Inventario';

	// -------------------------------------------------------- FUNCIONES GENERALES --------------------------------------------------------
	crearNuevoProducto() {
		this._router.navigate(['/inventario/producto'], {
			queryParams: { idProducto: 'N' },
		});
	}

	importarProductos() {
		this._router.navigate(['/inventario/importar-productos']);
	}

	// ------------------------------------------------------- LISTADO DE PRODUCTOS --------------------------------------------------------
	// Declaración de variables
	columnsProductos: IColum[] = [];
	displayedProductos: string[] = [];
	dataSourceProductos: MatTableDataSource<any>;

	//TablePaginatorProductos
	@ViewChild('paginatorProductos') paginatorProductos: MatPaginator;

	listadoProductos: any = {
		primeraCarga: true,
		dataListadoProductos: [],
		dataListadoProductosOriginal: [],
		pageSize: 15,
		alturaGrid: 15 * 45 + 81,
		totalMontoProductos: 0,
		montoTotal: 0,
		busquedaProductosTexto: '',
		precioAntesDeEditar: 0,
		exportar: {},
	};
	etiquetaSeleccionada: any = '';
	columnasProductos: any = null;

	// Declaración de funciones
	consultaProductos() {
		this._pantallaServicio.mostrarSpinner();
		let params: any = {};
		if (this.etiquetaSeleccionada != 'N') {
			params.idEtiqueta = this.etiquetaSeleccionada;
		} else {
			params.idEtiqueta = null;
		}
		this._backService
			.HttpPost('catalogos/Producto/consultarPresentacion', {}, params)
			.subscribe(
				(response) => {
					let dataTemp = eval(response);

					let dataProducto = [];
					let dataPresentacion = [];

					if (dataTemp.length === 2) {
						dataProducto = dataTemp[0];
						dataPresentacion = dataTemp[1];

						for (let i = 0; i < dataProducto.length; i++) {
							let primeraEntrada = true;
							dataProducto[i].presentaciones = [];

							for (let j = 0; j < dataPresentacion.length; j++) {
								if (
									dataProducto[i].marca == dataPresentacion[j].nombreMarca &&
									dataProducto[i].idInventarioProducto ==
									dataPresentacion[j].idInventarioProducto
								) {
									dataProducto[i].presentaciones.push(dataPresentacion[j]);
									if (primeraEntrada) {
										dataProducto[i].nombreMarca =
											dataPresentacion[j].nombreMarca;
										dataProducto[i].nombreProducto =
											dataPresentacion[j].nombreProducto;
										dataProducto[i].nombrePresentacion =
											dataPresentacion[j].descripcion;
										dataProducto[i].um = dataPresentacion[j].um;
										dataProducto[i].existencia = dataPresentacion[j].existencia;
										dataProducto[i].nombreProveedor =
											dataPresentacion[j].nombreProveedor;
										dataProducto[i].precioVenta = numberFormat.format(
											dataPresentacion[j].precioVenta
										);
										dataProducto[i].mostrarEdicionPrecioVenta = false;
										dataProducto[i].presentacionSeleccionada =
											dataPresentacion[j];
										dataProducto[i].presentacionNgModel =
											dataPresentacion[j].idInventarioPresentacion;
									}
									primeraEntrada = false;
								}
							}
						}

						this.listadoProductos.dataListadoProductos = dataProducto;
						this.listadoProductos.dataListadoProductosOriginal = JSON.parse(
							JSON.stringify(dataProducto)
						);

						if (this.listadoProductos.dataListadoProductos.length == 0) {
							this._router.navigate(['/inventario/producto'], {
								queryParams: { idProducto: 'N' },
							});
						} else {
							this.columnasProductos = JSON.parse(
								JSON.stringify(
									this.listadoProductos.dataListadoProductos[0]
										.presentaciones[0]
								)
							);
						}

						this.dataSourceProductos = new MatTableDataSource<any>(
							this.listadoProductos.dataListadoProductos
						);
						this.dataSourceProductos.paginator = this.paginatorProductos;
					}
					this._pantallaServicio.ocultarSpinner();
				},
				(error) => {
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

	calcularMontoTotalProductos(data: any) {
		let monto = 0;
		for (let i = 0; i < data.length; i++) {
			for (let j = 0; j < data[i].presentaciones.length; j++) {
				monto +=
					data[i].presentaciones[j].existencia *
					data[i].presentaciones[j].precioVenta;
			}
		}
		return monto;
	}

	buscarProductos() {
		let filtroTexto =
			this.listadoProductos.busquedaProductosTexto.toUpperCase();

		if (filtroTexto) {
			let elementos = filtroTexto.split(',');

			let elementosFiltrados =
				this.listadoProductos.dataListadoProductosOriginal.filter(
					(prod: any) => {
						if (prod.nombreMarca.toUpperCase().match(elementos[0]) != null) {
							if (elementos[1]) {
								if (
									prod.nombreProducto.toUpperCase().match(elementos[1]) != null
								) {
									return prod;
								}
							} else {
								return prod;
							}
						} else {
							if (
								prod.nombreProducto.toUpperCase().match(elementos[0]) != null
							) {
								return prod;
							}
						}
					}
				);

			this.listadoProductos.dataListadoProductos = JSON.parse(
				JSON.stringify(elementosFiltrados)
			);

			this.dataSourceProductos = new MatTableDataSource<any>(
				elementosFiltrados
			);
			this.dataSourceProductos.paginator = this.paginatorProductos;
		} else {
			this.listadoProductos.dataListadoProductos = JSON.parse(
				JSON.stringify(this.listadoProductos.dataListadoProductosOriginal)
			);

			this.dataSourceProductos = new MatTableDataSource<any>(
				this.listadoProductos.dataListadoProductosOriginal
			);
			this.dataSourceProductos.paginator = this.paginatorProductos;
		}

		this.listadoProductos.totalMontoProductos =
			this.calcularMontoTotalProductos(
				this.listadoProductos.dataListadoProductos
			);
	}

	actualizarProducto(entity: any) {
		this._router.navigate(['/inventario/producto'], {
			queryParams: {
				idProducto: entity.presentacionSeleccionada.idInventarioPresentacion,
			},
		});
	}

	preparacionBorrarProducto(id: any) {
		this.listadoProductos.productoAEliminar = id;
		$('#modalConfirmBorrarProducto .modal-body').html(
			'<span class="title">' +
			this.consultaProductosTranslate.deseaBorrarProducto +
			'</span>'
		);
		this.modales.modalConfirmBorrarProducto.show();
	}

	borrarProducto() {
		this._pantallaServicio.mostrarSpinner();
		let params: any = {};
		params.idInventarioPresentacion = this.listadoProductos.productoAEliminar;

		this._backService
			.HttpPost('catalogos/Producto/borrarProducto', {}, params)
			.subscribe(
				(response) => {
					this.consultaProductos();
					this.modales.modalConfirmBorrarProducto.hide();
				},
				(error) => {
					this._pantallaServicio.ocultarSpinner();
					if (error === 'SinSesion' || error === 'SesionCaducada') {
						if (error === 'SinSesion') {
							this._toaster.error(this.sessionTraslate.favorIniciarSesion);
						}
						if (error === 'SesionCaducada') {
							this._toaster.error(this.sessionTraslate.sesionCaducada);
						}
						this._router.navigate(['/login']);
						return;
					}
					this._router.navigate(['/login']);
				}
			);
	}

	cerrarBorrarProducto() {
		this.modales.modalConfirmBorrarProducto.hide();
	}

	realizarOrdenCompra(entity: any) {
		this._router.navigate(['/inventario/recepcion-producto'], {
			queryParams: {
				idOrden: 'P' + entity.presentacionSeleccionada.idInventarioPresentacion,
			},
		});
	}

	cambiarPresentacionSeleccionada(item: any) {
		const selected = item.presentaciones.find(
			(e: any) => e.idInventarioPresentacion === item.presentacionNgModel
		);
		item.nombrePresentacion = selected.descripcion;
		item.um = selected.um;
		item.existencia = selected.existencia;
		item.nombreProveedor = selected.nombreProveedor;
		item.precioVenta = numberFormat.format(selected.precioVenta);
		item.presentacionSeleccionada = selected;
	}

	mostrarEdicionPrecioVentaProducto(prod: any) {
		prod.mostrarEdicionPrecioVenta = true;
		this.listadoProductos.precioAntesDeEditar = prod.precioVenta;
	}

	editarPrecioProducto(prod: any) {
		this._pantallaServicio.mostrarSpinner();
		prod.precioVenta = Number(prod.precioVenta);
		for (let i = 0; i < prod.presentaciones.length; i++) {
			if (
				prod.presentaciones[i].idInventarioPresentacion ==
				prod.presentacionSeleccionada.idInventarioPresentacion
			) {
				prod.presentaciones[i].precioVenta = prod.precioVenta;
			}
		}

		let params: any = {};
		params.precio = prod.precioVenta;
		params.idInventarioPresentacion =
			prod.presentacionSeleccionada.idInventarioPresentacion;

		this._backService
			.HttpPost('catalogos/Producto/editarPrecio', {}, params)
			.subscribe(
				(response) => {
					this.listadoProductos.totalMontoProductos =
						this.calcularMontoTotalProductos(
							this.listadoProductos.dataListadoProductos
						);
					prod.mostrarEdicionPrecioVenta = false;
					this._pantallaServicio.ocultarSpinner();
				},
				(error) => {
					prod.precioVenta = this.listadoProductos.precioAntesDeEditar;

					for (let i = 0; i < prod.presentaciones.length; i++) {
						if (
							prod.presentaciones[i].idInventarioPresentacion ==
							prod.presentacionSeleccionada.idInventarioPresentacion
						) {
							prod.presentaciones[i].precioVenta = prod.precioVenta;
						}
					}

					if (error === 'SinSesion' || error === 'SesionCaducada') {
						if (error === 'SinSesion') {
							this._toaster.error(this.sessionTraslate.favorIniciarSesion);
						}
						if (error === 'SesionCaducada') {
							this._toaster.error(this.sessionTraslate.sesionCaducada);
						}
						this._router.navigate(['/login']);
					}
					this._pantallaServicio.ocultarSpinner();
				}
			);
	}

	// Exportación de Productos
	exportarProductos() {
		let nombreExcel = 'Listado de Productos';

		this.listadoProductos.exportar.columnas = [];

		for (let i = 1; i < this.columnsProductos.length; i++) {
			this.listadoProductos.exportar.columnas.push({
				field: this.columnsProductos[i].nameCol,
				name: this.columnsProductos[i].title,
			});
		}

		this.formatearDataProductosAExportar(
			this.listadoProductos.exportar.columnas,
			JSON.parse(JSON.stringify(this.listadoProductos.dataListadoProductos))
		);

		this.formatearDataProductosJson(
			this.listadoProductos.exportar.columnas,
			this.listadoProductos.exportar.dataExportar
		);

		this.crearExcelProductos(
			this.listadoProductos.exportar.columnas,
			this.listadoProductos.exportar.dataJSON,
			nombreExcel
		);
	}

	formatearDataProductosAExportar(columnas: any, data: any) {
		this.listadoProductos.exportar.dataExportar = [];

		for (let i = 0; i < data.length; i++) {
			for (let k = 0; k < data[i].presentaciones.length; k++) {
				let obj: any = {};
				for (let j = 0; j < columnas.length; j++) {
					let col = columnas[j].field;

					if (
						data[i].presentaciones[k][col] === undefined ||
						data[i].presentaciones[k][col] === null ||
						data[i].presentaciones[k][col] === ''
					) {
						obj[col] = ' ';
					} else {
						obj[col] = data[i].presentaciones[k][col];
					}
				}
				this.listadoProductos.exportar.dataExportar.push(obj);
			}
		}
	}

	formatearDataProductosJson(columnas: any, data: any) {
		let dataJson = '';

		for (let i = 0; i < data.length; i++) {
			let evento = data[i];

			let registro = '{';

			for (let j = 0; j < columnas.length; j++) {
				let col = columnas[j].field;

				registro +=
					'"' +
					col +
					'"' +
					':' +
					'"' +
					evento[col.toString()].toString().split('"').join("'") +
					'",';
			}

			registro = registro.substring(0, registro.length - 1);

			if (i != data.length - 1) {
				registro += '},';
			} else {
				registro += '}';
			}

			dataJson += registro;
		}

		var listadoprod = '[' + dataJson.replace(/(?:\r\n|\r|\n|\t)/g, ' ') + ']';
		this.listadoProductos.exportar.dataJSON = $.parseJSON(listadoprod);
	}

	crearExcelProductos(columnas: any, dataJson: any, nombreExcel: any) {
		let tabla = '<table><tr>';

		let headersString = '';
		for (let i = 0; i < columnas.length; i++) {
			let header = columnas[i].name;

			headersString += '<th>' + header + '</th>';
		}

		tabla += headersString + '</tr>';

		for (let i = 0; i < dataJson.length; i++) {
			let row = dataJson[i];

			let rowExcel = this.crearExcelRowProductos(columnas, row);
			tabla += rowExcel;
		}

		tabla += '</table>';

		(document.getElementById('excelTable') as any).innerHTML = tabla;

		let blob = new Blob(['\uFEFF' + tabla], {
			type: 'text/plain;charset=utf-8',
		});
		saveAs(blob, nombreExcel + '.xls');
	}

	crearExcelRowProductos(columnas: any, row: any) {
		let value = '';
		let rowExcel = '<tr>';

		for (let i = 0; i < columnas.length; i++) {
			let col = columnas[i].field;

			if (row[col] === undefined) {
				value = '';
			} else {
				value = row[col];
			}

			if (value.length > 0) {
				rowExcel += '<td>' + value + '</td>';
			}
		}
		rowExcel += '</tr>';
		return rowExcel;
	}

	// ----------------------------------------------------------- HISTORICO MOVIMIENTOS -----------------------------------------------------------

	// Declaración de variables

	//Variable de graficas
	chartPMR: any = null;
	chartPMV: any = null;
	selectGraficaPMV: string = 'Cantidad';

	//TablecolumnsHistorico
	columnsHistorico: IColum[] = [];
	displayedHistorico: string[] = [];
	dataSourceHistorico: MatTableDataSource<any>;
	@ViewChild('paginatorHistorico') paginatorHistorico: MatPaginator;

	//TableHistoricoMesActual
	columnsHistoricoMesActual: IColum[] = [];
	displayedHistoricoMesActual: string[] = [];
	dataSourceHistoricoMesActual: MatTableDataSource<any>;
	@ViewChild('paginatorHistoricoMesActual')
	paginatorHistoricoMesActual: MatPaginator;

	//TablecolumnsPMR
	columnsPMR: IColum[] = [];
	displayedPMR: string[] = [];
	dataSourcePMR: MatTableDataSource<any>;
	@ViewChild('paginatorPMR') paginatorPMR: MatPaginator;

	//TablecolumnsPMV
	columnsPMV: IColum[] = [];
	displayedPMV: string[] = [];
	dataSourcePMV: MatTableDataSource<any>;
	@ViewChild('paginatorPMV') paginatorPMV: MatPaginator;

	tipoModalMostrarMesActual: any = false;

	//TableValorizacionActual
	columnsValorizacionActual: IColum[] = [];
	displayedValorizacionActual: string[] = [];
	dataSourceValorizacionActual: MatTableDataSource<any>;
	@ViewChild('paginatorValorizacionActual')
	paginatorValorizacionActual: MatPaginator;

	//TableModalMovimientosDetalle
	columnsMovimientosDetalle: IColum[] = [
		{
			title: 'Fecha Movimiento',
			nameCol: 'fecha',
			styleCss: 'text-align: center;',
			styleCssRow: 'text-align: center;',
		},
		{
			title: 'Folio',
			nameCol: 'folio',
			styleCss: 'text-align: center;',
			styleCssRow: 'text-align: center;',
		},
		{
			title: 'Realizó Alta',
			nameCol: 'realizoAlta',
			styleCss: 'text-align: center;',
			styleCssRow: 'text-align: center;',
		},
		{
			title: 'Referencia',
			nameCol: 'referencia',
			styleCss: 'text-align: center;',
			styleCssRow: 'text-align: center;',
		},
		{
			title: 'Movimiento',
			nameCol: 'cantidad',
			styleCss: 'text-align: center;',
			styleCssRow: 'text-align: center;',
		},
	];
	displayedMovimientosDetalle: string[] = this.columnsMovimientosDetalle.map(
		(e) => e.nameCol
	);
	dataSourceMovimientosDetalle: MatTableDataSource<any>;
	@ViewChild('paginatorMovimientosDetalle')
	paginatorMovimientosDetalle: MatPaginator;

	// date range picker
	ranges: any = {};
	invalidDates: moment.Moment[] = [
		moment().add(2, 'days'),
		moment().add(3, 'days'),
		moment().add(5, 'days'),
	];
	isInvalidDate = (m: moment.Moment) => {
		return this.invalidDates.some((d) => d.isSame(m, 'day'));
	};

	movimientos: any = {
		primeraCarga: true,
		textoFiltro: '',
		fechaInicio: moment().startOf('month').format('DD/MM/YYYY'),
		fechaFin: moment().format('DD/MM/YYYY'),
		fechaCalendario: {
			startDate: dayjs().startOf('month'),
			endDate: dayjs(),
		},
		dataMovimientos: [],
		dataMovimientosOriginal: [],
		presentacionSeleccionada: {},
		dataMovimientosDetalle: [],
		dashboard: {
			valorizacionActual: {
				indicador: 0,
				detalle: {
					data: [],
					grid: {},
					total: 0,
				},
			},
			valorizacionMesAnterior: {
				indicador: 0,
				detalle: {
					data: [],
					grid: {},
					total: 0,
				},
			},
			productosDevueltos: {
				indicador: 0,
				detalle: {
					data: [],
					grid: {},
				},
			},
			productosMasVendidos: {
				graficaElegida: 1,
				cantidad: {
					graficaInformacion: [],
					detalle: {
						data: [],
						grid: {},
					},
				},
				ganancia: {
					graficaInformacion: [],
					detalle: {
						data: [],
						grid: {},
					},
				},
			},
			productosMenorRotacion: {
				graficaInformacion: [],
				detalle: {
					data: [],
					grid: {},
				},
			},
		},
		exportar: {},
	};

	consultarInventarioMovimientoEIndicadores() {
		this._pantallaServicio.mostrarSpinner();

		const params = {
			fechaInicio: this.movimientos.fechaCalendario.startDate
				.startOf('day')
				.format('YYYY-MM-DD HH:mm:ss'),
			fechaFin: this.movimientos.fechaCalendario.endDate
				.endOf('day')
				.format('YYYY-MM-DD HH:mm:ss'),
		};

		this._backService
			.HttpPost(
				'catalogos/Producto/consultarInventarioMovimientoEIndicadores',
				{},
				params
			)
			.subscribe(
				(response) => {
					const dataTemp = eval(response);

					this.movimientos.dataMovimientos = dataTemp[0];
					this.movimientos.dataMovimientosOriginal = JSON.parse(
						JSON.stringify(this.movimientos.dataMovimientos)
					);
					this.movimientos.alturaGridMovimientos =
						this.movimientos.dataMovimientos.length * 30 + 45;

					this.movimientos.dashboard.valorizacionActual.indicador =
						dataTemp[1][0].valorizacionTotal;
					this.movimientos.dashboard.valorizacionMesAnterior.indicador =
						dataTemp[2][0].valorizacionMesAnterior;
					this.movimientos.dashboard.productosDevueltos.indicador =
						dataTemp[3][0].cantProductosDevueltos;
					this.movimientos.dashboard.productosMasVendidos.cantidad.graficaInformacion =
						dataTemp[4];
					this.movimientos.dashboard.productosMasVendidos.ganancia.graficaInformacion =
						dataTemp[5];
					this.movimientos.dashboard.productosMenorRotacion.graficaInformacion =
						dataTemp[6];

					this.movimientos.primeraCarga = false;
					this._pantallaServicio.ocultarSpinner();
				},
				(error) => {
					this._pantallaServicio.ocultarSpinner();
					if (error === 'SinSesion' || error === 'SesionCaducada') {
						if (error === 'SinSesion') {
							this._toaster.error(this.sessionTraslate.favorIniciarSesion);
						}
						if (error === 'SesionCaducada') {
							this._toaster.error(this.sessionTraslate.sesionCaducada);
						}
						this._router.navigate(['/login']);
						return;
					}
					this._router.navigate(['/login']);
				}
			);
	}

	consultarInventarioMovimiento() {
		this._pantallaServicio.mostrarSpinner();
		const params = {
			fechaInicio: this.movimientos.fechaCalendario.startDate
				.startOf('day')
				.format('YYYY-MM-DD HH:mm:ss'),
			fechaFin: this.movimientos.fechaCalendario.endDate
				.endOf('day')
				.format('YYYY-MM-DD HH:mm:ss'),
		};

		this._backService
			.HttpPost('catalogos/Producto/consultarInventarioMovimiento', {}, params)
			.subscribe(
				(response) => {
					const dataTemp = eval(response);

					this.movimientos.dataMovimientos = dataTemp;
					this.movimientos.dataMovimientosOriginal = JSON.parse(
						JSON.stringify(this.movimientos.dataMovimientos)
					);
					this.movimientos.alturaGridMovimientos =
						this.movimientos.dataMovimientos.length * 30 + 45;

					this.dataSourceHistorico = new MatTableDataSource<any>(
						this.movimientos.dataMovimientos
					);
					this.dataSourceHistorico.paginator = this.paginatorHistorico;
					this._pantallaServicio.ocultarSpinner();
				},
				(error) => {
					this._pantallaServicio.ocultarSpinner();
					if (error === 'SinSesion' || error === 'SesionCaducada') {
						if (error === 'SinSesion') {
							this._toaster.error(this.sessionTraslate.favorIniciarSesion);
						}
						if (error === 'SesionCaducada') {
							this._toaster.error(this.sessionTraslate.sesionCaducada);
						}
						this._router.navigate(['/login']);
						return;
					}
					this._router.navigate(['/login']);
				}
			);
	}

	consultarInventarioMovimientoDetalle(entity: any) {
		this._pantallaServicio.mostrarSpinner();
		this.movimientos.dataMovimientosDetalle = [];

		this.movimientos.presentacionSeleccionada = entity;
		this.movimientos.presentacionSeleccionada.mpp =
			this.movimientos.presentacionSeleccionada.marca +
			'-' +
			this.movimientos.presentacionSeleccionada.producto +
			'-' +
			this.movimientos.presentacionSeleccionada.presentacion;

		const params = {
			fechaInicio: dayjs(
				this.movimientos.fechaCalendario.startDate,
				'DD/MM/YYYY'
			)
				.startOf('day')
				.format('YYYY-MM-DD HH:mm:ss'),
			fechaFin: dayjs(this.movimientos.fechaCalendario.endDate, 'DD/MM/YYYY')
				.endOf('day')
				.format('YYYY-MM-DD HH:mm:ss'),
			idInventarioPresentacion: entity.idInventarioPresentacion,
		};

		this._backService
			.HttpPost(
				'catalogos/Producto/consultarInventarioMovimientoDetalle',
				{},
				params
			)
			.subscribe(
				(response) => {
					this.movimientos.dataMovimientosDetalle = eval(response);

					for (
						let i = 0;
						i < this.movimientos.dataMovimientosDetalle.length;
						i++
					) {
						if (this.movimientos.dataMovimientosDetalle[i].referencia == 1) {
							this.movimientos.dataMovimientosDetalle[i].referencia = 'Venta';
						} else {
							if (this.movimientos.dataMovimientosDetalle[i].referencia == 2) {
								this.movimientos.dataMovimientosDetalle[i].referencia =
									'Ajuste';
							} else {
								if (
									this.movimientos.dataMovimientosDetalle[i].referencia == 3
								) {
									this.movimientos.dataMovimientosDetalle[i].referencia =
										'Orden de Compra';
								} else {
									if (
										this.movimientos.dataMovimientosDetalle[i].referencia == 4
									) {
										this.movimientos.dataMovimientosDetalle[i].referencia =
											'Creación';
									}
								}
							}
						}
					}
					console.log(this.movimientos.dataMovimientosDetalle);

					this.dataSourceMovimientosDetalle = new MatTableDataSource<any>(
						this.movimientos.dataMovimientosDetalle
					);
					this.dataSourceMovimientosDetalle.paginator =
						this.paginatorMovimientosDetalle;

					this.modales.modalMovimientosDetalle.show();
					this._pantallaServicio.ocultarSpinner();
				},
				(error) => {
					this._pantallaServicio.ocultarSpinner();
					if (error === 'SinSesion' || error === 'SesionCaducada') {
						if (error === 'SinSesion') {
							this._toaster.error(this.sessionTraslate.favorIniciarSesion);
						}
						if (error === 'SesionCaducada') {
							this._toaster.error(this.sessionTraslate.sesionCaducada);
						}
						this._router.navigate(['/login']);
						return;
					}
					this._router.navigate(['/login']);
				}
			);
	}

	filtrarMovimientos() {
		const filtroTexto = this.movimientos.textoFiltro.toUpperCase();

		if (filtroTexto) {
			const elementosFiltrados =
				this.movimientos.dataMovimientosOriginal.filter((mov: any) => {
					if (mov.marca.toUpperCase().match(filtroTexto) != null) {
						return mov;
					} else {
						if (mov.producto.toUpperCase().match(filtroTexto) != null) {
							return mov;
						} else {
							if (mov.presentacion.toUpperCase().match(filtroTexto) != null) {
								return mov;
							}
						}
					}
				});

			this.movimientos.dataMovimientos = JSON.parse(
				JSON.stringify(elementosFiltrados)
			);
		} else {
			this.movimientos.dataMovimientos = JSON.parse(
				JSON.stringify(this.movimientos.dataMovimientosOriginal)
			);
		}

		this.dataSourceHistorico = new MatTableDataSource<any>(
			this.movimientos.dataMovimientos
		);
		this.dataSourceHistorico.paginator = this.paginatorHistorico;

		this.movimientos.alturaGridMovimientos =
			this.movimientos.dataMovimientos.length * 30 + 45;
	}

	mostrarDetalleValorizacionActual() {
		this._pantallaServicio.mostrarSpinner();
		this.tipoModalMostrarMesActual = true;
		let params: any = {};
		params.opc = 2;

		this._backService
			.HttpPost('catalogos/Producto/consultarIndicadorDetalle', {}, params)
			.subscribe(
				(response) => {
					const dataTemp = eval(response);
					this.movimientos.dashboard.valorizacionActual.detalle.data = dataTemp;

					this.movimientos.dashboard.valorizacionActual.detalle.total = 0;
					for (
						let i = 0;
						i <
						this.movimientos.dashboard.valorizacionActual.detalle.data.length;
						i++
					) {
						this.movimientos.dashboard.valorizacionActual.detalle.total =
							this.movimientos.dashboard.valorizacionActual.detalle.total +
							this.movimientos.dashboard.valorizacionActual.detalle.data[i]
								.existencia *
							this.movimientos.dashboard.valorizacionActual.detalle.data[i]
								.costo;
					}

					this.dataSourceHistoricoMesActual = new MatTableDataSource<any>(
						this.movimientos.dashboard.valorizacionActual.detalle.data
					);
					this.dataSourceHistoricoMesActual.paginator =
						this.paginatorHistoricoMesActual;

					this.modales.modalDetalleValorizacionActual.show();
					this._pantallaServicio.ocultarSpinner();
				},
				(error) => {
					this._pantallaServicio.ocultarSpinner();
					if (error === 'SinSesion' || error === 'SesionCaducada') {
						if (error === 'SinSesion') {
							this._toaster.error(this.sessionTraslate.favorIniciarSesion);
						}
						if (error === 'SesionCaducada') {
							this._toaster.error(this.sessionTraslate.sesionCaducada);
						}
						this._router.navigate(['/login']);
						return;
					}
					this._router.navigate(['/login']);
				}
			);
	}

	mostrarDetalleValorizacionMesAnterior() {
		this._pantallaServicio.mostrarSpinner();
		this.tipoModalMostrarMesActual = false;
		let params: any = {};
		params.opc = 3;

		this._backService
			.HttpPost('catalogos/Producto/consultarIndicadorDetalle', {}, params)
			.subscribe(
				(response) => {
					const dataTemp = eval(response);
					this.movimientos.dashboard.valorizacionMesAnterior.detalle.data =
						dataTemp;

					this.movimientos.dashboard.valorizacionMesAnterior.detalle.total = 0;
					for (
						let i = 0;
						i <
						this.movimientos.dashboard.valorizacionMesAnterior.detalle.data
							.length;
						i++
					) {
						this.movimientos.dashboard.valorizacionMesAnterior.detalle.total =
							this.movimientos.dashboard.valorizacionMesAnterior.detalle.total +
							this.movimientos.dashboard.valorizacionMesAnterior.detalle.data[i]
								.existencia *
							this.movimientos.dashboard.valorizacionMesAnterior.detalle.data[
								i
							].costo;
					}

					this.dataSourceHistoricoMesActual = new MatTableDataSource<any>(
						this.movimientos.dashboard.valorizacionMesAnterior.detalle.data
					);
					this.dataSourceHistoricoMesActual.paginator =
						this.paginatorHistoricoMesActual;

					this.modales.modalDetalleValorizacionActual.show();
					this._pantallaServicio.ocultarSpinner();
				},
				(error) => {
					this._pantallaServicio.ocultarSpinner();
					if (error === 'SinSesion' || error === 'SesionCaducada') {
						if (error === 'SinSesion') {
							this._toaster.error(this.sessionTraslate.favorIniciarSesion);
						}
						if (error === 'SesionCaducada') {
							this._toaster.error(this.sessionTraslate.sesionCaducada);
						}
						this._router.navigate(['/login']);
						return;
					}
					this._router.navigate(['/login']);
				}
			);
	}

	mostrarDetalleProductosDevueltos() {
		this._pantallaServicio.mostrarSpinner();

		let params: any = {};
		params.opc = 4;

		this._backService
			.HttpPost('catalogos/Producto/consultarIndicadorDetalle', {}, params)
			.subscribe(
				(response) => {
					const dataTemp = eval(response);
					this.movimientos.dashboard.productosDevueltos.detalle.data = dataTemp;

					this.dataSourceValorizacionActual = new MatTableDataSource<any>(
						this.movimientos.dashboard.productosDevueltos.detalle.data
					);
					this.dataSourceValorizacionActual.paginator =
						this.paginatorValorizacionActual;

					this.modales.modalDetalleProductosDevueltos.show();
					this._pantallaServicio.ocultarSpinner();
				},
				(error) => {
					this._pantallaServicio.ocultarSpinner();
					if (error === 'SinSesion' || error === 'SesionCaducada') {
						if (error === 'SinSesion') {
							this._toaster.error(this.sessionTraslate.favorIniciarSesion);
						}
						if (error === 'SesionCaducada') {
							this._toaster.error(this.sessionTraslate.sesionCaducada);
						}
						this._router.navigate(['/login']);
						return;
					}
					this._router.navigate(['/login']);
				}
			);
	}

	mostrarDetalleProductosMasVendidosCantidad() {
		this._pantallaServicio.mostrarSpinner();

		let params: any = {};
		params.opc = 5;

		this._backService
			.HttpPost('catalogos/Producto/consultarIndicadorDetalle', {}, params)
			.subscribe(
				(response) => {
					var dataTemp = eval(response);
					this.movimientos.dashboard.productosMasVendidos.cantidad.detalle.data =
						dataTemp;

					this.dataSourcePMV = new MatTableDataSource(dataTemp);
					this.dataSourcePMV.paginator = this.paginatorPMV;

					this.modales.modalDetalleProductosMasVendidos.show();
					this._pantallaServicio.ocultarSpinner();
				},
				(error) => {
					this._pantallaServicio.ocultarSpinner();
					if (error === 'SinSesion' || error === 'SesionCaducada') {
						if (error === 'SinSesion') {
							this._toaster.error(this.sessionTraslate.favorIniciarSesion);
						}
						if (error === 'SesionCaducada') {
							this._toaster.error(this.sessionTraslate.sesionCaducada);
						}
						this._router.navigate(['/login']);
						return;
					}
					this._router.navigate(['/login']);
				}
			);
	}

	mostrarDetalleProductosMasVendidosGanancia() {
		this._pantallaServicio.mostrarSpinner();

		let params: any = {};
		params.opc = 6;

		this._backService
			.HttpPost('catalogos/Producto/consultarIndicadorDetalle', {}, params)
			.subscribe(
				(response) => {
					const dataTemp = eval(response);
					this.movimientos.dashboard.productosMasVendidos.ganancia.detalle.data =
						dataTemp;

					this.dataSourcePMV = new MatTableDataSource(dataTemp);
					this.dataSourcePMV.paginator = this.paginatorPMV;

					this.modales.modalDetalleProductosMasVendidos.show();
					this._pantallaServicio.ocultarSpinner();
				},
				(error) => {
					this._pantallaServicio.ocultarSpinner();
					if (error === 'SinSesion' || error === 'SesionCaducada') {
						if (error === 'SinSesion') {
							this._toaster.error(this.sessionTraslate.favorIniciarSesion);
						}
						if (error === 'SesionCaducada') {
							this._toaster.error(this.sessionTraslate.sesionCaducada);
						}
						this._router.navigate(['/login']);
						return;
					}
					this._router.navigate(['/login']);
				}
			);
	}

	mostrarDetalleProductosMenorRotacion() {
		this._pantallaServicio.mostrarSpinner();

		let params: any = {};
		params.opc = 7;

		this._backService
			.HttpPost('catalogos/Producto/consultarIndicadorDetalle', {}, params)
			.subscribe(
				(response) => {
					const dataTemp = eval(response);
					this.movimientos.dashboard.productosMenorRotacion.detalle.data =
						dataTemp;

					this.dataSourcePMR = new MatTableDataSource(
						this.movimientos.dashboard.productosMenorRotacion.detalle.data
					);
					this.dataSourcePMR.paginator = this.paginatorPMR;

					this.modales.modalDetalleProductosMenorRotacion.show();
					this._pantallaServicio.ocultarSpinner();
				},
				(error) => {
					this._pantallaServicio.ocultarSpinner();
					if (error === 'SinSesion' || error === 'SesionCaducada') {
						if (error === 'SinSesion') {
							this._toaster.error(this.sessionTraslate.favorIniciarSesion);
						}
						if (error === 'SesionCaducada') {
							this._toaster.error(this.sessionTraslate.sesionCaducada);
						}
						this._router.navigate(['/login']);
						return;
					}
					this._router.navigate(['/login']);
				}
			);
	}

	// Exportación de Movimientos
	exportarMovimientos(opc: any) {
		debugger;
		let nombreExcel = '';

		if (opc === 1) {
			nombreExcel =
				'Movimientos de ' +
				this.movimientos.fechaCalendario.startDate +
				'-' +
				this.movimientos.fechaCalendario.endDate;
		}
		if (opc === 2) {
			nombreExcel =
				'Detalle ' +
				this.movimientos.presentacionSeleccionada.mpp +
				' ' +
				this.movimientos.fechaCalendario.startDate +
				'-' +
				this.movimientos.fechaCalendario.endDate;
		}

		this.movimientos.exportar.columnas = [];

		if (opc == 1) {
			for (let i = 1; i < this.columnsHistorico.length; i++) {
				this.movimientos.exportar.columnas.push({
					field: this.columnsHistorico[i].nameCol,
					name: this.columnsHistorico[i].title,
				});
			}
			this.formatearDataMovimientosAExportar(
				this.movimientos.exportar.columnas,
				JSON.parse(JSON.stringify(this.movimientos.dataMovimientos))
			);
		}

		if (opc == 2) {
			for (let i = 1; i < this.columnsMovimientosDetalle.length; i++) {
				this.movimientos.exportar.columnas.push({
					field: this.columnsMovimientosDetalle[i].nameCol,
					name: this.columnsMovimientosDetalle[i].title,
				});
			}
			this.formatearDataMovimientosAExportar(
				this.movimientos.exportar.columnas,
				JSON.parse(JSON.stringify(this.movimientos.dataMovimientosDetalle))
			);
		}

		this.formatearDataMovimientosJson(
			this.movimientos.exportar.columnas,
			this.movimientos.exportar.dataExportar
		);
		this.crearExcelMovimientos(
			this.movimientos.exportar.columnas,
			this.movimientos.exportar.dataJSON,
			nombreExcel
		);
	}

	formatearDataMovimientosAExportar(columnas: any, data: any) {
		this.movimientos.exportar.dataExportar = [];

		for (let i = 0; i < data.length; i++) {
			let obj: any = {};
			for (let j = 0; j < columnas.length; j++) {
				let col = columnas[j].field;
				if (
					data[i][col] === undefined ||
					data[i][col] === null ||
					data[i][col] === ''
				) {
					obj[col] = ' ';
				} else {
					obj[col] = data[i][col];
				}
			}
			this.movimientos.exportar.dataExportar.push(obj);
		}
	}

	formatearDataMovimientosJson(columnas: any, data: any) {
		let dataJson = '';

		for (let i = 0; i < data.length; i++) {
			let evento = data[i];

			let registro = '{';

			for (let j = 0; j < columnas.length; j++) {
				let col = columnas[j].field;

				registro +=
					'"' +
					col +
					'"' +
					':' +
					'"' +
					evento[col.toString()].toString().split('"').join("'") +
					'",';
			}

			registro = registro.substring(0, registro.length - 1);

			if (i != data.length - 1) {
				registro += '},';
			} else {
				registro += '}';
			}

			dataJson += registro;
		}

		this.movimientos.exportar.dataJSON = $.parseJSON(
			'[' + dataJson.replace(/(?:\r\n|\r|\n)/g, ' ') + ']'
		);
	}

	crearExcelMovimientos(columnas: any, dataJson: any, nombreExcel: any) {
		let tabla = '<table><tr>';

		let headersString = '';
		for (let i = 0; i < columnas.length; i++) {
			let header = columnas[i].name;

			headersString += '<th>' + header + '</th>';
		}

		tabla += headersString + '</tr>';

		for (let i = 0; i < dataJson.length; i++) {
			let row = dataJson[i];

			let rowExcel = this.crearExcelRowMovimientos(columnas, row);
			tabla += rowExcel;
		}

		tabla += '</table>';

		(document.getElementById('excelTable') as any).innerHTML = tabla;

		const blob = new Blob(['\uFEFF' + tabla], {
			type: 'text/plain;charset=utf-8',
		});
		saveAs(blob, nombreExcel + '.xls');
	}

	crearExcelRowMovimientos(columnas: any, row: any) {
		let value = '';
		let rowExcel = '<tr>';

		for (let i = 0; i < columnas.length; i++) {
			let col = columnas[i].field;

			if (row[col] === undefined) {
				value = '';
			} else {
				value = row[col];
			}

			if (value.length > 0) {
				rowExcel += '<td>' + value + '</td>';
			}
		}
		rowExcel += '</tr>';
		return rowExcel;
	}

	//Grafica PRM
	cargarGraficaPMR() {
		const lengthCadena = 10;

		const labels =
			this.movimientos.dashboard.productosMenorRotacion.graficaInformacion.map(
				(x: any) => {
					return x.name.substring(
						0,
						x.name.length > lengthCadena ? lengthCadena : x.name.length
					);
				}
			);

		const dataY =
			this.movimientos.dashboard.productosMenorRotacion.graficaInformacion.map(
				(x: any) => x.y
			);

		const ebi_gPersonal: HTMLCanvasElement = document.getElementById(
			'graficaPMR'
		) as HTMLCanvasElement;

		if (this.chartPMR) {
			this.chartPMR.destroy();
		}

		if (ebi_gPersonal) {
			this.chartPMR = new Chart(ebi_gPersonal, {
				type: 'bar',
				data: {
					labels: dataY.length > 0 ? labels : ['No hay datos'], // Nombre de las barras
					datasets: [
						{
							label: 'Data',
							data: dataY, // Valores de las barras
							borderWidth: 1,
						},
					],
				},
				options: {
					responsive: true,
					plugins: {
						title: {
							text: 'PRODUCTOS CON MENOR ROTACIÓN',
							display: true,
						},
						legend: {
							display: false,
						},
					},
					scales: {
						x: {
							stacked: true,
							ticks: {
								font: {
									size: 11,
								},
							},
						},
						y: {
							stacked: true,
							title: {
								display: true,
								text: 'Cantidad de meses sin Rotación',
							},
							ticks: {
								stepSize: 5,
								font: {
									size: 12,
								},
							},
						},
					},
				},
			});
		}
	}

	descargarPMR() {
		const image = this.chartPMR.toBase64Image();
		const pdf = new jsPDF();
		pdf.addImage(image, 'PNG', 15, 10, 170, 85);
		pdf.save('chart.pdf');
	}

	//Grafica PMV
	cargarGraficaPMV(selectGrafica?: string) {
		let labels = null;
		let dataY = null;

		if (selectGrafica) {
			this.selectGraficaPMV = selectGrafica;
		}

		if (this.selectGraficaPMV === 'Ganancia') {
			labels =
				this.movimientos.dashboard.productosMasVendidos.ganancia.graficaInformacion.map(
					(x: any) => x.name
				);

			dataY =
				this.movimientos.dashboard.productosMasVendidos.ganancia.graficaInformacion.map(
					(x: any) => x.y
				);
		}

		if (this.selectGraficaPMV === 'Cantidad') {
			labels =
				this.movimientos.dashboard.productosMasVendidos.cantidad.graficaInformacion.map(
					(x: any) => x.name
				);

			dataY =
				this.movimientos.dashboard.productosMasVendidos.cantidad.graficaInformacion.map(
					(x: any) => x.y
				);
		}

		const ebi_gPersonal: HTMLCanvasElement = document.getElementById(
			'graficaPMV'
		) as HTMLCanvasElement;

		if (this.chartPMV) {
			this.chartPMV.destroy();
		}

		if (ebi_gPersonal) {
			this.chartPMV = new Chart(ebi_gPersonal, {
				type: 'bar',
				data: {
					labels: dataY.length > 0 ? labels : ['No hay datos'], // Nombre de las barras
					datasets: [
						{
							label: 'Data',
							data: dataY, // Valores de las barras
							borderWidth: 1,
						},
					],
				},
				options: {
					responsive: true,
					plugins: {
						title: {
							text: 'TOP 5 PRODUCTOS MAS VENDIDOS',
							display: true,
						},
						legend: {
							display: false,
						},
					},
					scales: {
						x: {
							stacked: true,
							ticks: {
								font: {
									size: 11,
								},
							},
						},
						y: {
							stacked: true,
							title: {
								display: true,
								text: this.selectGraficaPMV + ' Productos Vendidos',
							},
							ticks: {
								stepSize: 5,
								font: {
									size: 12,
								},
							},
						},
					},
				},
			});
		}
	}

	descargarPMV() {
		const image = this.chartPMV.toBase64Image();
		const pdf = new jsPDF();
		pdf.addImage(image, 'PNG', 15, 10, 170, 85);
		pdf.save('chart.pdf');
	}

	verDetallePMV() {
		if (this.selectGraficaPMV === 'Ganancia') {
			this.mostrarDetalleProductosMasVendidosGanancia();
		}
		if (this.selectGraficaPMV === 'Cantidad') {
			this.mostrarDetalleProductosMasVendidosCantidad();
		}
	}

	mostrarTicketFolioVenta(folio?: any){
		this._ticketService.caja_movimientos_mostrarTicketFolioVenta(folio);
	}

	// ----------------------------------------------------------- AJUSTES -----------------------------------------------------------

	// Declaración de variables
	ajustes: any = {
		primeraCarga: true,
		textoFiltro: '',
		fechaInicio: moment().startOf('month').format('DD/MM/YYYY'),
		fechaFin: moment().format('DD/MM/YYYY'),
		fechaCalendario: {
			startDate: dayjs().startOf('month'),
			endDate: dayjs(),
		},
		exportar: {},
	};
	columnasOriginalesAjuste: any = null;

	//TablecolumnsHistorico
	columnsAjuste: IColum[] = [];
	displayedAjuste: string[] = [];
	dataSourceAjuste: MatTableDataSource<any>;
	@ViewChild('paginatorAjuste') paginatorAjuste: MatPaginator;

	// Declaración de funciones
	consultaAjustes() {
		this._pantallaServicio.mostrarSpinner();

		const params = {
			fechaInicio: this.ajustes.fechaCalendario.startDate
				.startOf('day')
				.format('YYYY-MM-DD HH:mm:ss'),
			fechaFin: this.ajustes.fechaCalendario.endDate
				.endOf('day')
				.format('YYYY-MM-DD HH:mm:ss'),
		};

		this._backService
			.HttpPost('catalogos/Ajustes/consultaAjustes', {}, params)
			.subscribe(
				(response) => {
					const dataTemp = eval(response);
					this.ajustes.dataAjustes = JSON.parse(JSON.stringify(dataTemp));
					this.ajustes.dataAjustesOriginal = JSON.parse(
						JSON.stringify(dataTemp)
					);

					this.ajustes.altura = this.ajustes.dataAjustes.length * 30 + 45;

					this.ajustes.primeraCarga = false;

					this.dataSourceAjuste = new MatTableDataSource<any>(
						this.ajustes.dataAjustes
					);
					this.dataSourceAjuste.paginator = this.paginatorAjuste;

					this._pantallaServicio.ocultarSpinner();
				},
				(error) => {
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

	filtrarAjustes() {
		let filtroTexto = this.ajustes.textoFiltro.toUpperCase();

		if (filtroTexto) {
			const elementosFiltrados = this.ajustes.dataAjustesOriginal.filter(
				(aj: any) => {
					if (aj.nombre.toUpperCase().match(filtroTexto) != null) {
						return aj;
					}
				}
			);
			this.ajustes.dataAjustes = JSON.parse(JSON.stringify(elementosFiltrados));
		} else {
			this.ajustes.dataAjustes = JSON.parse(
				JSON.stringify(this.ajustes.dataAjustesOriginal)
			);
		}

		this.dataSourceAjuste = new MatTableDataSource<any>(
			this.ajustes.dataAjustes
		);
		this.dataSourceAjuste.paginator = this.paginatorAjuste;

		this.ajustes.altura = this.ajustes.dataAjustes.length * 30 + 45;
	}

	mostrarInformacionAjuste(idAjuste: any) {
		$('#tituloModal').html(this.consultaProductosTranslate.Ajustes);
		$('#idObservaciones').css('border-color', '');
		this.consultarInformacionAjuste(idAjuste);
	}

	consultarInformacionAjuste(idAjuste: any) {
		this._pantallaServicio.mostrarSpinner();
		let params: any = {};
		params.idInventarioAjuste = idAjuste;

		this._backService
			.HttpPost('catalogos/Ajustes/consultaAjustesDetalleProducto', {}, params)
			.subscribe(
				(response) => {
					this.ajustes.dataProductos = eval(response);
					let num = this.ajustes.dataProductos[0].folio.toString();
					for (let i = num.length; i < 5; i++) {
						num = '0' + num;
					}
					this.ajustes.numCtrl = num;
					this.ajustes.productoSeleccionado =
						this.ajustes.dataProductos[0].marca +
						' - ' +
						this.ajustes.dataProductos[0].producto +
						' - ' +
						this.ajustes.dataProductos[0].presentacion;
					this.ajustes.cantidad = this.ajustes.dataProductos[0].cantidad;
					this.ajustes.observaciones =
						this.ajustes.dataProductos[0].observaciones;
					this.ajustes.fecha = this.ajustes.dataProductos[0].fechaAjuste;
					this.ajustes.unidadMedidaSeleccionada =
						this.ajustes.dataProductos[0].unidadMedida;

					$('#buscarProducto').prop('readonly', true);
					$('#btnGuardar').hide();
					$('#idFecha').prop('readonly', true);
					$('#idCantidad').prop('readonly', true);
					$('#idObservaciones').prop('readonly', true);
					$('#idObservaciones').css('color', '#555');
					$('#idObservaciones').css('backgroundColor', '#eee');
					$('#idObservaciones').css('border', 'none');
					this._pantallaServicio.ocultarSpinner();
				},
				(error) => {
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

	// Exportación de Ajustes
	exportarAjustes(opc?: any) {
		const nombreExcel =
			'Ajustes de ' +
			this.ajustes.fechaCalendario.startDate +
			'-' +
			this.ajustes.fechaCalendario.endDate;

		this.ajustes.exportar.columnas = [];

		for (let i = 0; i < this.columnsAjuste.length; i++) {
			this.ajustes.exportar.columnas.push({
				field: this.columnsAjuste[i].nameCol,
				name: this.columnsAjuste[i].title,
			});
		}

		this.formatearDataAjustesAExportar(
			this.ajustes.exportar.columnas,
			JSON.parse(JSON.stringify(this.ajustes.dataAjustes))
		);
		this.formatearDataAjustesJson(
			this.ajustes.exportar.columnas,
			this.ajustes.exportar.dataExportar
		);
		this.crearExcelAjustes(
			this.ajustes.exportar.columnas,
			this.ajustes.exportar.dataJSON,
			nombreExcel
		);
	}

	formatearDataAjustesAExportar(columnas: any, data: any) {
		this.ajustes.exportar.dataExportar = [];

		for (var i = 0; i < data.length; i++) {
			var obj: any = {};
			for (var j = 0; j < columnas.length; j++) {
				var col = columnas[j].field;
				if (
					data[i][col] === undefined ||
					data[i][col] === null ||
					data[i][col] === ''
				) {
					obj[col] = ' ';
				} else {
					obj[col] = data[i][col];
				}
			}
			this.ajustes.exportar.dataExportar.push(obj);
		}
	}

	formatearDataAjustesJson(columnas: any, data: any) {
		let dataJson = '';

		for (let i = 0; i < data.length; i++) {
			let evento = data[i];

			let registro = '{';

			for (let j = 0; j < columnas.length; j++) {
				let col = columnas[j].field;

				registro +=
					'"' +
					col +
					'"' +
					':' +
					'"' +
					evento[col.toString()].toString().split('"').join("'") +
					'",';
			}

			registro = registro.substring(0, registro.length - 1);

			if (i != data.length - 1) {
				registro += '},';
			} else {
				registro += '}';
			}

			dataJson += registro;
		}

		this.ajustes.exportar.dataJSON = $.parseJSON(
			'[' + dataJson.replace(/(?:\r\n|\r|\n)/g, ' ') + ']'
		);
	}

	crearExcelAjustes(columnas: any, dataJson: any, nombreExcel: any) {
		let tabla = '<table><tr>';

		let headersString = '';
		for (let i = 0; i < columnas.length; i++) {
			let header = columnas[i].name;

			headersString += '<th>' + header + '</th>';
		}

		tabla += headersString + '</tr>';

		for (let i = 0; i < dataJson.length; i++) {
			let row = dataJson[i];

			let rowExcel = this.crearExcelRowAjustes(columnas, row);
			tabla += rowExcel;
		}

		tabla += '</table>';

		(document.getElementById('excelTable') as any).innerHTML = tabla;

		let blob = new Blob(['\uFEFF' + tabla], {
			type: 'text/plain;charset=utf-8',
		});
		saveAs(blob, nombreExcel + '.xls');
	}

	crearExcelRowAjustes(columnas: any, row: any) {
		let value = '';
		let rowExcel = '<tr>';

		for (let i = 0; i < columnas.length; i++) {
			let col = columnas[i].field;

			if (row[col] === undefined) {
				value = '';
			} else {
				value = row[col];
			}

			if (value.length > 0) {
				rowExcel += '<td>' + value + '</td>';
			}
		}
		rowExcel += '</tr>';
		return rowExcel;
	}

	// ----------------------------------------------------------- AGREGAR AJUSTE ----------------------------------------------------------

	// Declaración de variables
	ajusteSeleccionada = 'N';

	ajuste: any = {
		numCtrl: 0,
		fecha: '',
		fechaActual: new Date(),
		fechaMax: '',
		marca: '',
		productos: [],
		productoSeleccionado: '',
		dataProductos: [],
		presentacion: '',
		cantidad: '',
		observaciones: '',
		unidadMedida: [],
		unidadMedidaSeleccionada: this.consultaAjustesTranslate.unidadMedida,
		nombreCantidad: this.consultaAjustesTranslate.msgCantidad,
		prodEncontrado: false,
		prodValida: false,
		fechaValida: false,
		cantValida: false,
		guardarAjuste: false,
		option: 0,
		ErrorProd: false,
		ErrorFecha: false,
		ErrorCant: false,
		cantidadPresentacion: 0,
		ajusteCreadoMov: false,
		ajusteCreadoAj: false,
		bandGuardar: false,
		idInventarioPresentacion: null,
		idInventarioAjuste: null,
	};

	msgErrorProd = '';
	msgErrorCantidad = '';
	msgErrorFecha = '';
	checked = false;
	cant = 0;

	// Declaración de funciones
	abrirModalAjuste(message: any, presentacion: any) {
		this._pantallaServicio.mostrarSpinner();
		let title = '';

		if (message === 1) {
			this.ajuste.option = 1;
			title =
				'<i class="fa fa-plus" aria-hidden="true" style="margin-left: 6px;cursor:pointer;" ></i>';
		} else {
			if (message === 2) {
				this.ajuste.option = 2;
				title =
					'<i class="fa fa-minus" aria-hidden="true" style="margin-left: 6px;cursor:pointer;" ></i>';
			}
		}

		$('#idFecha').removeClass('errorCampo');
		$('#idCantidad').removeClass('errorCampo');
		$('#idObservaciones').removeClass('errorCampo');

		this.msgErrorCantidad = '';
		this.msgErrorFecha = '';

		$('#tituloModal').html(this.consultaProductosTranslate.Ajustes + title);
		$('#idObservaciones').css('border-color', '');

		this.consultarFolio(presentacion);
		this.ajuste.fecha = new Date();
		this.ajuste.productoSeleccionado =
			presentacion.presentacionSeleccionada.descripcion;

		this.modales.modalAjuste.show();
	}

	cerrarModalAjuste() {
		this.modales.modalAjuste.hide();
	}

	consultarFecha() {
		let params: any = {};
		let fecha = '';

		params.dia = this.ajuste.fecha.getDate().toString();
		params.mes = (this.ajuste.fecha.getMonth() + 1).toString();
		params.año = (this.ajuste.fecha.getYear() + 1900).toString();

		if (params.dia < 10) params.dia = '0' + params.dia;

		if (params.mes < 10) params.mes = '0' + params.mes;

		fecha = params.dia + '/' + params.mes + '/' + params.año;

		this.ajuste.fecha = fecha;
	}

	consultarFolio(presentacion: any) {
		//Si el ajuste del producto es nuevo, permite escribir en la pantalla
		if (this.ajusteSeleccionada == 'N') {
			let params: any = {};
			params.folio = null;

			this._backService
				.HttpPost('catalogos/Ajustes/consultaAjustesDetalleFolio', {}, params)
				.subscribe(
					(response) => {
						const folio = eval(response);
						let num: any = "0";
						if (!folio) {
							num = 1;
						} 
						
						if (folio) {
							num = folio[0].folio;
						}

						for (let i = num.toString().length; i < 5; i++) {
							num = '0' + num;
						}

						this.ajuste.numCtrl = num;
						this.ajuste.idInventarioPresentacion =
							presentacion.presentacionSeleccionada.idInventarioPresentacion;
						this.ajuste.cantidadPresentacion =
							presentacion.presentacionSeleccionada.existencia;
						this.ajuste.unidadMedidaSeleccionada = 'pieza';

						this.ajuste.cantidad = null;
						this.ajuste.observaciones = '';
						$('#buscarProducto').prop('readonly', false);
						$('#btnGuardar').show();
						$('#idFecha').prop('readonly', false);
						$('#idCantidad').prop('readonly', false);
						$('#idObservaciones').prop('readonly', false);
						$('#idObservaciones').css('color', '#555');
						$('#idObservaciones').css('backgroundColor', '#fff');
						$('#idObservaciones').css('border', '1px solid #ccc');
						this._pantallaServicio.ocultarSpinner();
					},
					(error) => {
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
	}

	guardarAjuste() {
		this._pantallaServicio.mostrarSpinner();
		switch (this.ajuste.option) {
			case 1: //Sumar
				if (!this.checked) {
					this.ajuste.bandGuardar = true;
					this.validarGuardar();

					if (this.ajuste.guardarAjuste) {
						this.checked = true;
						let params: any = {};
						params.folio = this.ajuste.numCtrl;
						params.observaciones = this.ajuste.observaciones;
						params.idInvPresentacion = this.ajuste.idInventarioPresentacion;
						params.cantidad = parseInt(this.ajuste.cantidad, 10);
						params.fechaCambio = moment(this.ajuste.fecha).format('YYYY-MM-DD HH:mm');
						params.fechaAjuste = moment(this.ajuste.fecha).format('YYYY-MM-DD HH:mm');

						this._backService
							.HttpPost('catalogos/Ajustes/guardarAjustesDetalle', {}, params)
							.subscribe(
								(response) => {
									this.ajuste.guardarAjuste = false;
									this.ajuste.bandGuardar = true;
									this.modales.modalAjuste.hide();
									//
									for (
										let i = 0;
										i < this.listadoProductos.dataListadoProductos.length;
										i++
									) {
										for (
											let j = 0;
											j <
											this.listadoProductos.dataListadoProductos[i]
												.presentaciones.length;
											j++
										) {
											if (
												this.listadoProductos.dataListadoProductos[i]
													.presentaciones[j].idInventarioPresentacion ==
												params.idInvPresentacion
											) {
												this.listadoProductos.dataListadoProductos[
													i
												].presentaciones[j].existencia =
													this.listadoProductos.dataListadoProductos[i]
														.presentaciones[j].existencia + params.cantidad;
												this.listadoProductos.dataListadoProductos[
													i
												].existencia =
													this.listadoProductos.dataListadoProductos[
														i
													].presentaciones[j].existencia;
												break;
											}
										}
									}

									this.ajuste.cantidad = null;
									this.ajuste.fecha = null;
									this.ajuste.observaciones = '';
									this.ajuste.numCtrl = 0;
									this.ajuste.presentacion = '';
									this.ajuste.cantidadPresentacion = 0;
									this.ajuste.idInventarioPresentacion = null;
									this.checked = false;

									this.ajuste.ajusteCreadoMov = true;
									this.ajuste.ajusteCreadoAj = true;
									this._pantallaServicio.ocultarSpinner();
								},
								(error) => {
									this._pantallaServicio.ocultarSpinner();
									if (error === 'SinSesion' || error === 'SesionCaducada') {
										if (error === 'SinSesion') {
											this._toaster.error(
												this.sessionTraslate.favorIniciarSesion
											);
										}
										if (error === 'SesionCaducada') {
											this._toaster.error(this.sessionTraslate.sesionCaducada);
										}
										this._router.navigate(['/login']);
									}
								}
							);
					} else {
						this._pantallaServicio.ocultarSpinner();
					}
				}
				break;

			case 2: //Restar
				if (!this.checked) {
					this.ajuste.bandGuardar = true;
					this.validarGuardar();

					if (this.ajuste.guardarAjuste) {
						this.checked = true;
						let params: any = {};
						params.folio = this.ajuste.numCtrl;
						params.observaciones = this.ajuste.observaciones;
						params.idInvPresentacion = this.ajuste.idInventarioPresentacion;
						params.cantidad = parseInt(this.ajuste.cantidad, 10) * -1;
						params.fechaCambio = moment(this.ajuste.fecha).format('DD/MM/YYYY');
						params.fechaAjuste = moment(this.ajuste.fecha).format('DD/MM/YYYY');

						this._backService
							.HttpPost('catalogos/Ajustes/guardarAjustesDetalle', {}, params)
							.subscribe(
								(response) => {
									this.ajuste.guardarAjuste = false;
									this.ajuste.bandGuardar = true;
									this.modales.modalAjuste.hide();
									//
									for (
										let i = 0;
										i < this.listadoProductos.dataListadoProductos.length;
										i++
									) {
										for (
											let j = 0;
											j <
											this.listadoProductos.dataListadoProductos[i]
												.presentaciones.length;
											j++
										) {
											if (
												this.listadoProductos.dataListadoProductos[i]
													.presentaciones[j].idInventarioPresentacion ==
												params.idInvPresentacion
											) {
												this.listadoProductos.dataListadoProductos[
													i
												].presentaciones[j].existencia =
													this.listadoProductos.dataListadoProductos[i]
														.presentaciones[j].existencia + params.cantidad;
												this.listadoProductos.dataListadoProductos[
													i
												].existencia =
													this.listadoProductos.dataListadoProductos[
														i
													].presentaciones[j].existencia;
												break;
											}
										}
									}
									this.checked = false;
									this.ajuste.cantidad = null;
									this.ajuste.fecha = null;
									this.ajuste.observaciones = '';
									this.ajuste.numCtrl = 0;
									this.ajuste.presentacion = '';
									this.ajuste.cantidadPresentacion = 0;
									this.ajuste.idInventarioPresentacion = null;

									this.ajuste.ajusteCreadoMov = true;
									this.ajuste.ajusteCreadoAj = true;
									this._pantallaServicio.ocultarSpinner();
								},
								(error) => {
									this._pantallaServicio.ocultarSpinner();
									if (error === 'SinSesion' || error === 'SesionCaducada') {
										if (error === 'SinSesion') {
											this._toaster.error(
												this.sessionTraslate.favorIniciarSesion
											);
										}
										if (error === 'SesionCaducada') {
											this._toaster.error(this.sessionTraslate.sesionCaducada);
										}
										this._router.navigate(['/login']);
									}
								}
							);
					} else {
						this._pantallaServicio.ocultarSpinner();
					}
				}
				break;
		}
	}

	validarGuardar() {
		this.validarFecha();
		this.validarCantidad();

		if (this.ajuste.cantValida && this.ajuste.fechaValida) {
			if (this.ajuste.fechaValida) {
				$('#idFecha').removeClass('errorCampo');
				this.msgErrorFecha = '';

				if (this.ajuste.cantValida) {
					$('#idCantidad').removeClass('errorCampo');
					this.msgErrorCantidad = '';

					if (this.cant + parseInt(this.ajuste.cantidad, 10) < 0) {
						this._toaster.error(this.consultaAjustesTranslate.msgErrorExist);
						this.ajuste.cantValida = false;
					} else {
						this.ajuste.guardarAjuste = true;
					}
				}
			}
		} else {
			if (this.ajuste.fechaValida) {
				if (this.ajuste.fecha == '' || this.ajuste.fecha == null) {
					$('#idFecha').addClass('errorCampo');
					this.ajuste.ErrorFecha = false;
					this.msgErrorFecha = '';
				} else {
					$('#idFecha').removeClass('errorCampo');
					this.ajuste.ErrorFecha = false;
					this.msgErrorFecha = '';
				}
			} else {
				$('#idFecha').addClass('errorCampo');
				this.ajuste.ErrorFecha = true;
				if (this.ajuste.fecha) {
					this.msgErrorFecha = this.consultaAjustesTranslate.msgErrorFecha;
				} else {
					this.msgErrorFecha = '';
				}
			}
			//Si el campo del producto esta incorrecto mostrara el mensaje de error
			if (this.ajuste.cantidad == '' || this.ajuste.cantidad == undefined) {
				$('#idCantidad').addClass('errorCampo');
				this.msgErrorCantidad = '';
				this.ajuste.ErrorCant = false;
			} else {
				if (!this.ajuste.cantValida) {
					$('#idCantidad').addClass('errorCampo');
					this.msgErrorCantidad =
						this.consultaAjustesTranslate.msgErrorCantidad;
					this.ajuste.ErrorCant = true;
				} else {
					$('#idCantidad').removeClass('errorCampo');
					this.msgErrorCantidad = '';
					this.ajuste.cantValida = false;
					this.ajuste.ErrorCant = false;
				}
			}
		}
	}

	validarCantidad() {
		const valCantidad = /^-?[0-9]+(?:\.[0-9]+)?$/;
		const cant = valCantidad.test(this.ajuste.cantidad);
		if (!cant || this.ajuste.cantidad == 0) {
			this.ajuste.cantValida = false;
		} else {
			this.ajuste.cantValida = true;
		}
	}

	validarFecha() {
		this.ajuste.fechaActual = new Date();

		if (this.ajuste.fecha) {

			if(!(this.ajuste.fecha instanceof Date)){
				var currentDate = new Date();
				var currentTime = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

				var ajusteFechaMoment = moment(this.ajuste.fecha + " " + currentTime);
				this.ajuste.fecha = ajusteFechaMoment.toDate();
			}

			if (this.ajuste.fecha <= this.ajuste.fechaActual) {
				this.ajuste.fechaValida = true;
			} else {
				this.ajuste.fechaValida = false;
			}
		} else {
			if (this.ajuste.fecha != '' || this.ajuste.fecha === null) {
				this.ajuste.fechaValida = true;
			} else {
				this.ajuste.fechaValida = false;
			}
		}
	}

	validarProducto() { }

	onBlurTxt(elemento: any) {
		if (this.ajuste.bandGuardar) {
			switch (elemento) {
				case 'idFecha':
					if (!this.ajuste.ErrorFecha) {
						if (this.ajuste.fecha == '' || this.ajuste.fecha === null) {
							$('#' + elemento).addClass('errorCampo');
						}
					}
					break;

				case 'buscarProducto':
					//Valida si encontro o no el producto en el input

					if (!this.ajuste.ErrorProd) {
						if (this.ajuste.productoSeleccionado == '') {
							$('#' + elemento).addClass('errorCampo');
						}
					}
					break;

				case 'idCantidad':
					if (!this.ajuste.ErrorCant) {
						if (this.ajuste.cantidad == '') {
							$('#' + elemento).addClass('errorCampo');
						}
					}

					break;
			}
		}
	}

	onFocusTxt(elemento: any) {
		if (this.ajuste.bandGuardar) {
			switch (elemento) {
				case 'idFecha':
					if (!this.ajuste.ErrorFecha) {
						$('#' + elemento).removeClass('errorCampo');
					}
					break;
				case 'buscarProducto':
					if (!this.ajuste.ErrorProd) {
						$('#' + elemento).removeClass('errorCampo');
					}
					break;
				case 'idCantidad':
					if (!this.ajuste.ErrorCant) {
						$('#' + elemento).removeClass('errorCampo');
					}
					break;
			}
		}
	}

	// ------------------------------------------------------- CERTIFICADO DE REGALO -------------------------------------------------------
	// Declaración de variables
	certificadoRegalo: any = {
		cantidadMinima: {},
		pageSize: 15,
		alturaC: 15 * 30 + 81,
		nombreCertificadoRegalo: '',
		cantidadCertificadoRegalo: '',
		observacionesCertificadoRegalo: '',
		esTodasSucursales: false,
		dataCertificadoRegalo: [],
		validacionNuevoCertificadoRegalo: false,
		idCertificadoRegaloEditar: null,
		nombreCertificadoRegaloEditar: '',
		nombreCertificadoRegaloOriginal: '',
		cantidadCertificadoRegaloEditar: '',
		observacionesCertificadoRegaloEditar: '',
		esTodasSucursalesEditar: false,
		cantidadUsadaEditar: '',
		validacionNuevoCertificadoRegaloEditar: false,
		idCertificadoRegaloBorrar: '',
		certificadoRegaloNombreBorrar: '',
	};

	//TablecolumnsHistorico
	columnsCertificado: IColum[] = [];
	displayedCertificado: string[] = [];
	dataSourceCertificado: MatTableDataSource<any>;
	@ViewChild('paginatorCertificado') paginatorCertificado: MatPaginator;

	// Declaración de funciones
	consultaCertificadoRegalo() {
		this._pantallaServicio.mostrarSpinner();
		let params: any = {};
		params.opcion = 1;
		params.fecha = '';

		this._backService
			.HttpPost(
				'catalogos/CertificadoRegalo/consultarCertificadoRegalo',
				{},
				params
			)
			.subscribe(
				(response) => {
					this.certificadoRegalo.dataCertificadoRegalo = eval(response).map(
						(d: any) => {
							d.fechaAlta = d.fechaAlta
								? moment(d.fechaAlta).format('DD-MM-YYYY hh:mm A')
								: '';
							d.fechaCambio = d.fechaCambio
								? moment(d.fechaCambio).format('DD-MM-YYYY hh:mm A')
								: '';
							return d;
						}
					);

					this.dataSourceCertificado = new MatTableDataSource<any>(
						this.certificadoRegalo.dataCertificadoRegalo
					);
					this.dataSourceCertificado.paginator = this.paginatorCertificado;

					this._pantallaServicio.ocultarSpinner();
				},
				(error) => {
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

	nuevoCertificadoRegalo() {
		this.certificadoRegalo.nombreCertificadoRegalo = '';
		this.certificadoRegalo.cantidadCertificadoRegalo = '';
		this.certificadoRegalo.observacionesCertificadoRegalo = '';
		this.certificadoRegalo.esTodasSucursales = false;

		$('#nombreCertificadoRegalo').removeClass('errorCampo');
		$('#cantidadCertificadoRegalo').removeClass('errorCampo');
		$('#observacionesCertificadoRegalo').removeClass('errorCampo');
		this.modales.modalCertificadoRegalo.show();
	}

	validarNuevoCertificadoRegalo() {
		this._pantallaServicio.mostrarSpinner();
		this.certificadoRegalo.validacionNuevoCertificadoRegalo = true;

		$('#nombreCertificadoRegalo').removeClass('errorCampo');
		$('#cantidadCertificadoRegalo').removeClass('errorCampo');

		if (this.certificadoRegalo.nombreCertificadoRegalo === '') {
			$('#nombreCertificadoRegalo').addClass('errorCampo');
			this.certificadoRegalo.validacionNuevoCertificadoRegalo = false;
		}

		if (
			this.certificadoRegalo.cantidadCertificadoRegalo.toString() === '' ||
			Number(this.certificadoRegalo.cantidadCertificadoRegalo) === 0
		) {
			$('#cantidadCertificadoRegalo').addClass('errorCampo');
			this.certificadoRegalo.validacionNuevoCertificadoRegalo = false;
		}

		if (this.certificadoRegalo.validacionNuevoCertificadoRegalo !== false) {
			this.guardarCertificadoRegalo();
		} else {
			this._pantallaServicio.ocultarSpinner();
		}
	}

	guardarCertificadoRegalo() {
		let params: any = {};
		params.nombre = this.certificadoRegalo.nombreCertificadoRegalo;
		params.cantidad = this.certificadoRegalo.cantidadCertificadoRegalo;
		params.esTodasSucursales = this.certificadoRegalo.esTodasSucursales;

		this._backService
			.HttpPost(
				'catalogos/CertificadoRegalo/insertarCertificadoRegalo',
				{},
				params
			)
			.subscribe(
				(response) => {
					const resultadoInsertarCertificado = eval(response);

					switch (resultadoInsertarCertificado) {
						case -1:
							$('#nombreCertificadoRegalo').addClass('errorCampo');
							this._toaster.error(
								'Ya existe un Certificado de Regalo con el mismo nombre en la Empresa'
							);
							this._pantallaServicio.ocultarSpinner();
							break;
						case -2:
							$('#nombreCertificadoRegalo').addClass('errorCampo');
							this._toaster.error(
								'Ya existe un Certificado de Regalo con el mismo nombre en la Empresa'
							);
							this._pantallaServicio.ocultarSpinner();
							break;
						case -3:
							$('#nombreCertificadoRegalo').addClass('errorCampo');
							this._toaster.error(
								'Ya existe un Certificado de Regalo con el mismo nombre en la Sucursal'
							);
							this._pantallaServicio.ocultarSpinner();
							break;
						default:
							this._toaster.success(
								'El Certificado de Regalo se ingresó correctamente'
							);
							this.consultaCertificadoRegalo();
							this.modales.modalCertificadoRegalo.hide();
							this._pantallaServicio.ocultarSpinner();
							break;
					}
				},
				(error) => {
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

	editarCertificadoRegalo(data: any) {
		this.certificadoRegalo.idCertificadoRegaloEditar = data.idCertificadoRegalo;
		this.certificadoRegalo.nombreCertificadoRegaloEditar = data.nombre;
		this.certificadoRegalo.nombreCertificadoRegaloOriginal = data.nombre;
		this.certificadoRegalo.cantidadCertificadoRegaloEditar = data.cantidad;
		this.certificadoRegalo.observacionesCertificadoRegaloEditar =
			data.observaciones;
		if (data.esTodasSucursales === 1) {
			this.certificadoRegalo.esTodasSucursalesEditar = true;
		} else {
			this.certificadoRegalo.esTodasSucursalesEditar = false;
		}
		this.certificadoRegalo.cantidadUsadaEditar = data.cantidadUsada;

		$('#nombreCertificadoRegaloEditar').removeClass('errorCampo');
		$('#cantidadCertificadoRegaloEditar').removeClass('errorCampo');
		$('#observacionesCertificadoRegaloEditar').removeClass('errorCampo');
		this.modales.modalCertificadoRegaloEditar.show();
	}

	validarCertificadoRegaloEditar() {
		this._pantallaServicio.mostrarSpinner();
		this.certificadoRegalo.validacionNuevoCertificadoRegaloEditar = true;

		$('#nombreCertificadoRegaloEditar').removeClass('errorCampo');
		$('#cantidadCertificadoRegaloEditar').removeClass('errorCampo');
		$('#observacionesCertificadoRegalo').removeClass('errorCampo');

		if (this.certificadoRegalo.nombreCertificadoRegaloEditar == '') {
			$('#nombreCertificadoRegaloEditar').addClass('errorCampo');
			this.certificadoRegalo.validacionNuevoCertificadoRegaloEditar = false;
		}

		if (
			this.certificadoRegalo.cantidadCertificadoRegaloEditar.toString() ===
			'' ||
			Number(this.certificadoRegalo.cantidadCertificadoRegaloEditar) === 0
		) {
			$('#cantidadCertificadoRegaloEditar').addClass('errorCampo');
			this.certificadoRegalo.validacionNuevoCertificadoRegaloEditar = false;
		}

		if (
			this.certificadoRegalo.validacionNuevoCertificadoRegaloEditar != false
		) {
			this.actualizarCertificadoRegalo();
		} else {
			this._pantallaServicio.ocultarSpinner();
		}
	}

	actualizarCertificadoRegalo() {
		let params: any = {};
		params.idCertificadoRegaloEditar =
			this.certificadoRegalo.idCertificadoRegaloEditar;
		params.nombre = this.certificadoRegalo.nombreCertificadoRegaloEditar;
		params.cantidad = this.certificadoRegalo.cantidadCertificadoRegaloEditar;
		params.esTodasSucursales = this.certificadoRegalo.esTodasSucursalesEditar;
		params.observacionesCertificadoRegalo =
			this.certificadoRegalo.observacionesCertificadoRegaloEditar;
		params.cantidadUsadaEditar = this.certificadoRegalo.cantidadUsadaEditar;

		this._backService
			.HttpPost(
				'catalogos/CertificadoRegalo/modificarCertificadoRegalo',
				{},
				params
			)
			.subscribe(
				(response) => {
					const validacionEditarCertificado = eval(response);

					switch (validacionEditarCertificado) {
						case -1:
							$('#nombreCertificadoRegaloEditar').addClass('errorCampo');
							this._toaster.error(
								'Ya existe un Certificado de Regalo con el mismo nombre en la Empresa'
							);
							this._pantallaServicio.ocultarSpinner();
							break;
						case -2:
							$('#nombreCertificadoRegaloEditar').addClass('errorCampo');
							this._toaster.error(
								'Ya existe un Certificado de Regalo con el mismo nombre en la Empresa'
							);
							this._pantallaServicio.ocultarSpinner();
							break;
						case -3:
							$('#cantidadCertificadoRegaloEditar').addClass('errorCampo');
							this._toaster.error(
								'No se puede ingresar la cantidad solicitada'
							);
							this._pantallaServicio.ocultarSpinner();
							break;
						case -4:
							$('#nombreCertificadoRegaloEditar').addClass('errorCampo');
							this._toaster.error(
								'Ya existe un Certificado de Regalo con el mismo nombre en la Sucursal'
							);
							this._pantallaServicio.ocultarSpinner();
							break;
						case -5:
							$('#cantidadCertificadoRegaloEditar').addClass('errorCampo');
							this._toaster.error(
								'No se puede ingresar la cantidad solicitada'
							);
							this._pantallaServicio.ocultarSpinner();
							break;
						default:
							this._toaster.success(
								'El Certificado de Regalo se actualizó correctamente'
							);
							this.consultaCertificadoRegalo();
							this.modales.modalCertificadoRegaloEditar.hide();
							this._pantallaServicio.ocultarSpinner();
							break;
					}
				},
				(error) => {
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

	mdBorrarCertificadoRegalo(data: any) {
		this.certificadoRegalo.idCertificadoRegaloBorrar = data.idCertificadoRegalo;
		this.certificadoRegalo.certificadoRegaloNombreBorrar = data.nombre;
		this.modales.modalBorrarCertificadoRegalo.show();
	}

	eliminarCertificadoRegalo() {
		this._pantallaServicio.mostrarSpinner();
		let params: any = {};
		params.idCertificadoRegalo =
			this.certificadoRegalo.idCertificadoRegaloBorrar;

		this._backService
			.HttpPost(
				'catalogos/CertificadoRegalo/eliminarCertificadoRegalo',
				{},
				params
			)
			.subscribe(
				(response) => {
					const resultadoEliminarCertificado = eval(response);

					switch (resultadoEliminarCertificado) {
						case -1:
							this._pantallaServicio.ocultarSpinner();
							this._toaster.error(
								'No se puede eliminar el Certificado de Regalo'
							);
							break;

						default:
							this._toaster.success(
								'El Certificado de Regalo se eliminó correctamente'
							);
							this.consultaCertificadoRegalo();
							this.modales.modalBorrarCertificadoRegalo.hide();
							this._pantallaServicio.ocultarSpinner();
							break;
					}
				},
				(error) => {
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

	validarCantidadCertificadoRegalo() {
		const floatRegex = RegExp('^[0-9]+$');
		if (this.certificadoRegalo.cantidadCertificadoRegalo.toString() !== '') {
			if (
				floatRegex.test(
					(this.certificadoRegalo.cantidadCertificadoRegalo || '').toString()
				)
			) {
			} else {
				this.certificadoRegalo.cantidadCertificadoRegalo = 0;
			}
		}
	}

	validarCantidadCertificadoRegaloEditar() {
		const floatRegex = RegExp('^[0-9]+$');
		if (
			this.certificadoRegalo.cantidadCertificadoRegaloEditar.toString() != ''
		) {
			if (
				floatRegex.test(
					this.certificadoRegalo.cantidadCertificadoRegaloEditar.toString()
				)
			) {
			} else {
				this.certificadoRegalo.cantidadCertificadoRegaloEditar = 0;
			}
		}
	}

	// Otras funcionales extra
	// funcionalidad para cuando se cambia el tabs
	onTabChanged(tab: any) {
		const clickedIndex = tab.index;
		if (clickedIndex === 0) {
			this.consultaProductos();
		}
		if (clickedIndex === 1) {
			this.consultarInventarioMovimiento();
			this.cargarGraficaPMR();
			this.cargarGraficaPMV();
		}
		if (clickedIndex === 2) {
			this.consultaAjustes();
		}
		if (clickedIndex === 3) {
			this.consultaCertificadoRegalo();
		}
	}

	validarNum(e: any) {
		let key;
		if (window.event) {
			// IE
			key = e.keyCode;
		} else if (e.which) {
			// Netscape/Firefox/Opera
			key = e.which;
		}
		if (key < 48 || key > 57) {
			if (key === 8) {
				// Detectar backspace (retroceso)
				return true;
			} else {
				return false;
			}
		}
		return true;
	}
}
