import { Component, AfterViewInit, OnInit, ViewChild } from '@angular/core';
import { MethodsService } from 'src/app/core/services/methods.service';
import { PantallaService } from "src/app/core/services/pantalla.service";
import { MatDialog } from '@angular/material/dialog';
import { Router } from "@angular/router";
import { TranslateService } from '@ngx-translate/core'; // TRANSLATE
declare var $: any; // JQUERY
import * as bootstrap from 'bootstrap'; // BOOTSTRAP
import { ToasterService } from "src/shared/toaster/toaster.service";
import moment from 'moment'; // MOMENT
import { format, set } from 'date-fns';
import { saveAs } from 'file-saver';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { Chart, CategoryScale } from 'chart.js/auto';
import { retry } from 'rxjs';
import { MatTabGroup } from '@angular/material/tabs';
import { jsPDF } from 'jspdf';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { TicketService } from 'src/app/core/services/ticket.service';
import dayjs from 'dayjs';

@Component({
    selector: 'app-reporteIngresos',
    templateUrl: './reporteIngresos.component.html',
    styleUrls: ['./reporteIngresos.component.scss', '../../page.component.scss'],
})

export class ReporteIngresosComponent implements OnInit {
    // Variables de Translate
    reporteVentaProductoTranslate: any = {};
    consultaFacturaSerieTranslate: any = {};
    consultaAjustesTranslate: any = {};
    reporteVentasTranslate: any = {};
    calendarioTranslate: any = {};
    facturaTranslate: any = {};
    agendaTranslate: any = {};
    sessionTraslate: any = {};

    // Modales
    modales: any = {}; 
    desserts: any;
    sortedData: any;

    constructor(private _translate: TranslateService, private _backService: MethodsService, public _pantallaServicio: PantallaService, private _dialog: MatDialog, private _router: Router, private _toaster: ToasterService, private matIconRegistry: MatIconRegistry, private domSanitizer: DomSanitizer, public _ticketService: TicketService) {
        this._translate.setDefaultLang(this._pantallaServicio.idioma);
        this._translate.use(this._pantallaServicio.idioma);

        this._translate.get('calendarioTranslate').subscribe((translated: string) => {  
            this.calendarioTranslate = this._translate.instant('calendarioTranslate');
            this.facturaTranslate = this._translate.instant('facturaTranslate');
            this.sessionTraslate = this._translate.instant('sessionTraslate');
            this.reporteVentaProductoTranslate = this._translate.instant('reporteVentaProductoTranslate');
            this.reporteVentasTranslate = this._translate.instant('reporteVentasTranslate');
            this.consultaAjustesTranslate = this._translate.instant('consultaAjustesTranslate');
            this.consultaFacturaSerieTranslate = this._translate.instant('consultaFacturaSerieTranslate');
            this.agendaTranslate = this._translate.instant('agendaTranslate');
            this.ventaProducto_inicializarCalendario();
        });

        this.matIconRegistry.addSvgIcon('iconCasa1', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Casa1-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconFlecha1DerechaPeque', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/FlechaDerechaPequena-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconCalendarioEditar', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/CalendarioEditar-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconFlechaAbajoPeque', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/FlechaAbajoPequena-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconEstrella', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Estrella-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconBuscar', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Buscar-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconCruzCirculo', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/10-2-TiposdeExcepcion-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconExcel', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Excel-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconCsv', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/CSV-icon.svg"));
    }

    ngOnInit(): void {
        this.cargarPestanias();
        this.ventaProducto_inicio();        
        this.dataConsultaFacturaSeries();
        this.crearModales();
        this._pantallaServicio.ocultarSpinner();
    }

    public crearModales() {
        if ($('body').find('.modal-Varios').length > 1) {
            $('body').find('.modal-Varios')[1].remove();
        }
        this.modales.modalVarios = new bootstrap.Modal($("#modal-Varios").appendTo("body"), {
            backdrop: "static", 
            keyboard: false,
        });

        if ($('body').find('.modal-Personal').length > 1) {
            $('body').find('.modal-Personal')[1].remove();
        }
        this.modales.modalPersonal = new bootstrap.Modal($("#modal-Personal").appendTo("body"), {
            backdrop: "static", 
            keyboard: false,
        });

        if ($('body').find('.modal-Alert').length > 1) {
            $('body').find('.modal-Alert')[1].remove();
        }
        this.modales.modalAlert = new bootstrap.Modal($("#modal-Alert").appendTo("body"), {
            backdrop: "static", 
            keyboard: false,
        });

        if ($('body').find('.modal-noDatos').length > 1) {
            $('body').find('.modal-noDatos')[1].remove();
        }
        this.modales.modalNoDatos = new bootstrap.Modal($("#modal-noDatos").appendTo("body"), {
            backdrop: "static", 
            keyboard: false,
        });

        /*if ($('body').find('.modalInformacionFactura').length > 1) {
            $('body').find('.modalInformacionFactura')[1].remove();
        }
        this.modales.modalInformacionFactura = new bootstrap.Modal($("#modalInformacionFactura").appendTo("body"), {
            backdrop: "static", 
            keyboard: false,
        });*/

        if ($('body').find('.modal-confirmarEliminar').length > 1) {
            $('body').find('.modal-confirmarEliminar')[1].remove();
        }
        this.modales.modalConfirmarEliminar = new bootstrap.Modal($("#modal-confirmarEliminar").appendTo("body"), {
            backdrop: "static", 
            keyboard: false,
        });

        if ($('body').find('.modal-confirmarEliminarVentaDirecta').length > 1) {
            $('body').find('.modal-confirmarEliminarVentaDirecta')[1].remove();
        }
        this.modales.modalConfirmarEliminarVentaDirecta = new bootstrap.Modal($("#modal-confirmarEliminarVentaDirecta").appendTo("body"), {
            backdrop: "static", 
            keyboard: false,
        });

        if ($('body').find('.ticket-cita').length > 1) {
            $('body').find('.ticket-cita')[1].remove();
        }
        this.modales.modalTicketCita = new bootstrap.Modal($("#ticket-cita").appendTo("body"), {
            backdrop: "static", 
            keyboard: false,
        });

        if ($('body').find('.modal-factura').length > 1) {
            $('body').find('.modal-factura')[1].remove();
        }
        this.modales.modalFactura = new bootstrap.Modal($("#modal-factura").appendTo("body"), {
            backdrop: "static", 
            keyboard: false,
        });

        if ($('body').find('.modalSerie').length > 1) {
            $('body').find('.modalSerie')[1].remove();
        }
        this.modales.modalSerie = new bootstrap.Modal($("#modalSerie").appendTo("body"), {
            backdrop: "static", 
            keyboard: false,
        });

        if ($('body').find('.modal-confirm').length > 1) {
            $('body').find('.modal-confirm')[1].remove();
        }
        this.modales.modalConfirm = new bootstrap.Modal($("#modal-confirm").appendTo("body"), {
            backdrop: "static", 
            keyboard: false,
        });

        if ($('body').find('.modalMetodoPago').length > 1) {
            $('body').find('.modalMetodoPago')[1].remove();
        }
        this.modales.modalMetodoPago = new bootstrap.Modal($("#modalMetodoPago").appendTo("body"), {
            backdrop: "static", 
            keyboard: false,
        });

        if ($('body').find('.modalPropinasPorPersonal').length > 1) {
            $('body').find('.modalPropinasPorPersonal')[1].remove();
        }
        this.modales.modalPropinasPorPersonal = new bootstrap.Modal($("#modalPropinasPorPersonal").appendTo("body"), {
            backdrop: "static", 
            keyboard: false,
        });

        if ($('body').find('.modalCancelaciones').length > 1) {
            $('body').find('.modalCancelaciones')[1].remove();
        }
        this.modales.modalCancelaciones = new bootstrap.Modal($("#modalCancelaciones").appendTo("body"), {
            backdrop: "static", 
            keyboard: false,
        });
        
        if ($('body').find('.modalVentasEliminadas').length > 1) {
            $('body').find('.modalVentasEliminadas')[1].remove();
        }
        this.modales.modalVentasEliminadas = new bootstrap.Modal($("#modalVentasEliminadas").appendTo("body"), {
            backdrop: "static", 
            keyboard: false,
        });

        if ($('body').find('.ModalRetiroEfectivo').length > 1) {
            $('body').find('.ModalRetiroEfectivo')[1].remove();
        }
        this.modales.modalRetiroEfectivo = new bootstrap.Modal($("#ModalRetiroEfectivo").appendTo("body"), {
            backdrop: "static", 
            keyboard: false,
        });

        if ($('body').find('.modalVentasDevoluciones').length > 1) {
            $('body').find('.modalVentasDevoluciones')[1].remove();
        }
        this.modales.modalVentasDevoluciones = new bootstrap.Modal($("#modalVentasDevoluciones").appendTo("body"), {
            backdrop: "static", 
            keyboard: false,
        });
        
        /*if ($('body').find('.modalGlobalTicketPago').length > 1) {
            $('body').find('.modalGlobalTicketPago')[1].remove();
        }
        this.modales.modalGlobalTicketPago = new bootstrap.Modal($("#modalGlobalTicketPago").appendTo("body"), {
            backdrop: "static", 
            keyboard: false,
        });

        if ($('body').find('.modalGlobalTicketVenta').length > 1) {
            $('body').find('.modalGlobalTicketVenta')[1].remove();
        }
        this.modales.modalGlobalTicketVenta = new bootstrap.Modal($("#modalGlobalTicketVenta").appendTo("body"), {
            backdrop: "static", 
            keyboard: false,
        });

        if ($('body').find('.modalGlobalTicketRetiro').length > 1) {
            $('body').find('.modalGlobalTicketRetiro')[1].remove();
        }
        this.modales.modalGlobalTicketRetiro = new bootstrap.Modal($("#modalGlobalTicketRetiro").appendTo("body"), {
            backdrop: "static", 
            keyboard: false,
        });*/
    }

    // ------------------------------------------------------------------------------------------- //
    // --------------------------------------- REPORTE DE INGRESOS ------------------------------- //
    // ------------------------------------------------------------------------------------------- //
    // -------------------------------------- Declaración de variables --------------------------- //
    @ViewChild('tabGroup', {static: false}) tab: MatTabGroup; // Se usa esta variable para controlar las pestañas JC
    @ViewChild('tabGroup2', {static: false}) tab2: MatTabGroup; // Se usa esta variable para controlar las pestañas del gráfico JC
    displayedColumns_TablaProductos: string[] = ["Producto", "Marca", "Presentacion", "Cantidad Vendida", "Total Venta", "Existencia"];
    displayedColumns_TablaServicios: string[] = ["Servicio", "Personal", "Cantidad", "Total"];
    displayedColumns_ModalTabla01: string[] = ["tipo", "folio", "fecha", "fechaCita", "personal", "cliente", "referencia", "producto", "presentacion", "servicio", 
                                               "numPaquete", "cantidad", "ventaTotal", "totalAbono", "comision", "costo", "utilidad"];
    displayedColumns_ModalTabla02: string[] = ["vendedor", "cantidad", "ventaTotal", "comision", "utilidad"];
    displayedColumns_ModalTabla03: string[] = ["marca", "producto", "presentacion", "fecha", "cliente", "vendedor", "cantidad", "ventaTotal", "totalAbono", 
                                               "comision", "costo", "utilidad"];
    displayedColumns_ModalTabla04: string[] = ["marca", "producto", "fecha", "cliente", "vendedor", "cantidad", "ventaTotal", "totalAbono", 
                                               "comision", "costo", "utilidad"];
    displayedColumns_ModalTabla05: string[] = ["folioServicio", "fechaCita", "Personal", "cliente", "Servicio", "Total", "totalAbono", "promocion", 
                                               "descPromocion", "descManual", "comision", "utilidad"];
    displayedColumns_ModalTabla06: string[] = ["cliente", "telefono", "saldopendiente", "folio_caja_original", "fecha", "usuario"];
    displayedColumns_ModalTabla07: string[] = ["marca", "producto", "servicio", "presentacion", "fecha", "cliente", "cantidad", "ventaTotal", "totalAbono", "comision", "utilidad"];
    displayedColumns_ModalTabla08: string[] = ["descripcion", "folio", "fechaPago", "Cliente", "Pago"];
    displayedColumns_ModalTabla09: string[] = ["nombre", "propina"];
    displayedColumns_ModalTabla10: string[] = ["tipo", "folio", "fecha", "personal", "cliente", "producto", "presentacion", "servicio", 
                                               "numPaquete", "cantidad", "ventaTotal", "totalAbono", "comision", "costo", "utilidad"];
    displayedColumns_ModalTabla11: string[] = ["folio_caja", "fechaPago", "nombreCliente", "montoTotal", "realizoBaja", "motivoBaja"];
    displayedColumns_ModalTabla12: string[] = ["Fecha", "Folio", "Monto", "Motivo", "NombreGerente"];
    displayedColumns_ModalTabla13: string[] = ["folio_caja", "fechaDevolucion", "descripcion", "montoDevolucion", "cantidad"];
    dataSourceProductos = new MatTableDataSource<any>([]);
    dataSourceServicios = new MatTableDataSource<any>([]);
    dataSourceVentasGrid = new MatTableDataSource<any>([]);
    dataSourceComisiones = new MatTableDataSource<any>([]);
    dataSourceMarca = new MatTableDataSource<any>([]);
    dataSourceProductoModal = new MatTableDataSource<any>([]);
    dataSourceDescuentos = new MatTableDataSource<any>([]);
    dataSourceCuentasxCobrar = new MatTableDataSource<any>([]);
    dataSourceComisionesPersonal = new MatTableDataSource<any>([]);
    dataSourceMetodoPago = new MatTableDataSource<any>([]);
    dataSourcePropinasPorPersonal = new MatTableDataSource<any>([]);
    dataSourceCancelaciones = new MatTableDataSource<any>([]);
    dataSourceVentasEliminadas = new MatTableDataSource<any>([]);
    dataSourceRetiroEfectivo = new MatTableDataSource<any>([]);
    dataSourceDevolucionesDetalle = new MatTableDataSource<any>([]);
    @ViewChild('matSort01') sort01 = new MatSort();
    @ViewChild('matSort02') sort02 = new MatSort();
    @ViewChild('matSort03') sort03 = new MatSort();
    @ViewChild('matSort04') sort04 = new MatSort();
    @ViewChild('matSort05') sort05 = new MatSort();
    @ViewChild('matSort06') sort06 = new MatSort();
    @ViewChild('matSort07') sort07 = new MatSort();
    @ViewChild('matSort08') sort08 = new MatSort();
    @ViewChild('matSort09') sort09 = new MatSort();
    @ViewChild('matSort10') sort10 = new MatSort();
    @ViewChild('matSort11') sort11 = new MatSort();
    @ViewChild('matSort12') sort12 = new MatSort();
    @ViewChild('matSort13') sort13 = new MatSort();
    @ViewChild('matSort14') sort14 = new MatSort();
    @ViewChild('matSort15') sort15 = new MatSort();
    rootScope_fromState = "reporteIngresos"; 
    rootScope_cargarCalendario = false;
    rootScope_dataTicket: any;
    ventaProducto: any = {
        dataServicios: [],
        dataProductos: [],
        dataVentasGrid: [],
        dataMarca: [],
        dataProductoModal: [],
        dataComisiones: [],
        dataComisionesPersonal: [],
        dataDescuentos: [],
        dataPropinasPorPersonal: [],
        dataCancelaciones: [],
        dataDevolucionesDetalle: [],
        dataVentasEliminadas: [],
        dataRetiroEfectivo: [],
        dataCuentasxCobrar: [],
        ventasTotal: 0,
        ventasEgresos: 0,
        ventasIngresos: 0,
        dataVentas: [],
        fechaInicio: moment(new Date()).startOf('month').format('DD/MM/YYYY'),
        fechaFin: moment(new Date()).endOf('month').format('DD/MM/YYYY'),
        fechas: {
            // startDate: moment(new Date()).startOf('month').format('DD/MM/YYYY'), 
            // endDate: moment(new Date()).endOf('month').format('DD/MM/YYYY')
            startDate: dayjs().startOf('month'),
            endDate: dayjs().endOf('month')
        },
        abierto: 0,
        dataGraficaDia: {
            lunes: 0,
            martes: 0,
            miercoles: 0,
            jueves: 0,
            viernes: 0,
            sabado: 0,
            domingo: 0,
            sinDia: 0,
        },
        dataGraficaHora: {
            antesOcho: 0,
            ochoADiez: 0,
            diezADoce: 0,
            doceACatorce: 0,
            catorceADieciseis: 0,
            dieciseisADieciocho: 0,
            dieciochoAVenite: 0,
            despuesVeinte: 0
        },
        comisiones: {
            productosTotal: 0,
            productosCantidad: 0,
            serviciosTotal: 0,
            serviciosCantidad: 0,
            paquetesTotal: 0,
            paquetesCantidad: 0,
            comisionesTotales: 0,
        },
        cuentascobrar: {
            clientesTotal: 0,
            clientesCantidad: 0
        }
    };
    fechaCompleta: any;
    ticket: any = {
        cargos: [],
        promocion: [],
        total: 0,
        fecha: "",
        fechaSF: "",
        cliente: "",
        idCliente: 0,
        folio: "",
        productos: [],
        paquetes: [],
    };
    widthGrafica: any;
    heigthGrafica: any;
    producto: any = {}
    ranges: any;
    alturaComisiones: any;
    alturaProductos: any;
    alturaServicios: any;
    alturaVentas: any;
    alturaMarca: any;
    alturaProductoModal: any;
    alturaComisionesPersonal: any;
    widthModalVarios: any;
    heightModalVarios: any;
    widthModalPersonal: any;
    heightModalPersonal: any;
    gridHeight: any;
    gridPersonal: any;
    idPagoClienteProducto: any;
    idCita: any;
    dataMetodoPago: any = [];
    headers: any;
    dataGridOptionsExport: any;
    myChart: any;
    myChart2: any;
    datosGenerales = false;
    conceptos = true;
    ocultarGuardar = false;
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
        ivaGeneral: 0.0,
        aplicaIVA: true
    };
    contadoEntradas = 0;
    dataSucursales = [];
    dataformasDePago = [];
    datametodosDePago = [];
    dataCFDI = [];
    dataRegimen = [];
    dataSerie = [];
    datosFiscales: any = [];
    sinSeries = false;
    nuevosDatosEmisor: any;
    citaFacturar: any;
    dataFactura: any;
    idFactura: any;
    dataFacturaDetalle : any;
    dataConceptos: any;
    dataUnidadMedida: any;
    dataCveProdServ: any;
    dataImpuestoIva: any;
    facturaSeries: any = {
        idSerie: "",
        nombre: "",
        descripcion: "",
        contador: "",
        minimo: "",
        maximo: "",
        nombreValido: false,
        contadorValido: false,
        minimoValido: false,
        maximoValido: false,
        guardar: false
    };
    checked: any;
    msgErrorNombre: any;
    msgErrorContador: any;
    msgErrorMinimo: any;
    msgErrorMaximo: any;
    invalidDates: moment.Moment[] = [moment().add(2, 'days'), moment().add(3, 'days'), moment().add(5, 'days')]; 
    primerCargaPantalla = true;
    primerCargaPantallaCount = 0;
    bandera = 0;
    dataExportar: any;
    gridProductos: any;
    gridServicios: any;
    gridVentas: any;
    gridComisiones: any;
    gridMarca: any;
    gridProductoModal: any;
    gridComisionesPersonal: any;
    gridDescuentos: any;
    gridMetodoPago: any;
    gridCuentasCobrar: any;
    locale: any = {
        format: 'DD/MM/YYYY'
    }
    // ----------------------------- Variables Globales -------------------------------- //
    moduloFactura: any = {
        datosGenerales: false,
        conceptos: true,
        ocultarGuardar: false,
        facturacion: {
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
            ivaGeneral: 0,
            aplicaIVA: true,
        },
        dataSucursales: [],
        dataformasDePago: [],
        datametodosDePago: [],
        dataCFDI: [],
        dataRegimen: [],
        dataSerie: [],
        datosFiscales: [],
        sinSeries: false,
        validarestatusfactura: true
    };
    caja: any = {
        venta: {
            ticket: {
                cargos: [],
                promocion: [],
                productos: [],
                paquetes: [],
                certificadosRegalo: [],
                propina: [],
                total: 0,
                cliente: "",
                idCliente: 0,
                folio: "",
                emailCliente: "",
                folio_pago: "",
                descuento: {
                    pago: 0
                },
                totalDescuento: 0,
            },
            ticketVenta: {
                cargos: [],
                promocion: [],
                productos: [],
                paquetes: [],
                certificadosRegalo: [],
                propina: [],
                total: 0,
                cliente: "",
                idCliente: 0,
                folio: "",
                emailCliente: "",
                folio_pago: "",
                descuento: 0,
                totalDescuento: 0,
                devoluciones: []
            }
        },
        retiroEfectivo: {
            ticket: {
                Usuario: "",
                Folio: "",
                Fecha: "",
                motivoRetiro: "",
                Monto: "",
            }
        }
    };
    dataTicket: any;
    global: any = {}


    // ------------------------------------------------------------------------------------------------------ //
    // -------------------------------------- Declaracion de funciones -------------------------------------- //
    ventaProducto_declararGrids(){
        this.gridProductos = {
            columnDefs: [
                { name: "Producto", header: this.reporteVentaProductoTranslate.producto},
                { name: "Marca", header: this.reporteVentaProductoTranslate.marca},
                { name: "Presentacion", header: "Presentacion"},
                { name: "Cantidad Vendida", header: "Cantidad Vendida"},
                { name: "Total Venta", header: "Total Venta"},
                { name: "Existencia", header: "Existencia"},
            ]
        };
        this.gridServicios = {
            columnDefs: [
                { name: 'Servicio',  header: 'Servicio'}, 
                { name: 'Personal',  header: 'Personal'}, 
                { name: 'Cantidad',  header: 'Cantidad'}, 
                { name: 'Total',     header:  'Total'} 
            ]
        };
        this.gridVentas = { 
            columnDefs: [
                { name: 'tipo',  header: 'Tipo'}, 
                { name: 'folio',  header: 'Folio'}, 
                { name: 'fecha',  header: 'Fecha'}, 
                { name: 'personal',     header:  'Personal'},
                { name: 'cliente',  header: 'Cliente'}, 
                { name: 'referencia',  header: 'Referencia'}, 
                { name: 'producto',  header: 'Producto'}, 
                { name: 'presentacion',     header:  'Presentación'},
                { name: 'servicio',  header: 'Servicio'}, 
                { name: 'numPaquete',  header: 'Paquete'}, 
                { name: 'cantidad',  header: 'Cantidad'}, 
                { name: 'ventaTotal',     header:  'Venta Total'},
                { name: 'totalAbono',  header: 'Total Abono'}, 
                { name: 'comision',     header: 'Comisión'},
                { name: 'costo',  header: 'Costo'}, 
                { name: 'utilidad',  header: 'Utilidad'}, 
            ]
        };
        this.gridComisiones = { 
            columnDefs: [
                { name: 'vendedor',  header: 'Vendedor'}, 
                { name: 'cantidad',  header: 'Cantidad'}, 
                { name: 'ventaTotal',  header: 'Venta Total'}, 
                { name: 'comision',     header: 'Comisión'},
                { name: 'utilidad',  header: 'Utilidad'}
            ]
        };
        this.gridMarca = { 
            columnDefs: [
                { name: 'marca',  header: 'Marca'}, 
                { name: 'producto',  header: 'Producto'}, 
                { name: 'presentacion',  header: 'Presentación'}, 
                { name: 'fecha',     header: 'Fecha'},
                { name: 'cliente',  header: 'Cliente'},
                { name: 'vendedor',  header: 'Vendedor'}, 
                { name: 'cantidad',  header: 'Cantidad'}, 
                { name: 'ventaTotal',  header: 'Venta Total'}, 
                { name: 'totalAbono',  header: 'Total Abono'}, 
                { name: 'comision',     header: 'Comisión'},
                { name: 'costo',     header:  'Costo'},
                { name: 'utilidad',  header: 'Utilidad'}
            ]
        };
        this.gridProductoModal = { 
            columnDefs: [
                { name: 'marca',  header: 'Marca'}, 
                { name: 'producto',  header: 'Producto'}, 
                { name: 'fecha',     header: 'Fecha'},
                { name: 'cliente',  header: 'Cliente'},
                { name: 'vendedor',  header: 'Vendedor'}, 
                { name: 'cantidad',  header: 'Cantidad'}, 
                { name: 'ventaTotal',  header: 'Venta Total'}, 
                { name: 'totalAbono',  header: 'Total Abono'}, 
                { name: 'comision',     header: 'Comisión'},
                { name: 'costo',     header:  'Costo'},
                { name: 'utilidad',  header: 'Utilidad'}
            ]
        };
        this.gridComisionesPersonal = { 
            columnDefs: [
                { name: 'marca',  header: 'Marca'}, 
                { name: 'producto',  header: 'Producto'}, 
                { name: 'servicio',  header: 'Servicio'}, 
                { name: 'presentacion',  header: 'Presentación'}, 
                { name: 'fecha',     header: 'Fecha'},
                { name: 'cliente',  header: 'Cliente'},
                { name: 'cantidad',  header: 'Cantidad'}, 
                { name: 'ventaTotal',  header: 'Venta Total'}, 
                { name: 'totalAbono',  header: 'Total Abono'}, 
                { name: 'comision',     header: 'Comisión'},
                { name: 'utilidad',  header: 'Utilidad'}
            ]
        };
        this.gridDescuentos = { 
            columnDefs: [
                { name: 'folioServicio',  header: 'Folio'}, 
                { name: 'fechaCita',  header: 'Fecha'}, 
                { name: 'Personal',  header: 'Personal'}, 
                { name: 'cliente',  header: 'Cliente'}, 
                { name: 'Servicio',     header:  'Servicio'},
                { name: 'Total',  header: 'Total'},
                { name: 'totalAbono',  header: 'Total Abonado'}, 
                { name: 'promocion',  header: 'Promoción'}, 
                { name: 'descPromocion',  header: 'Descuento Promoción'}, 
                { name: 'descManual',     header:  'Descuento Manual'},
                { name: 'comision',     header: 'Comisión'},
                { name: 'utilidad',  header: 'Utilidad'}
            ]
        };
        this.gridMetodoPago = { 
            columnDefs: [
                { name: 'descripcion',  header: 'Descripción'}, 
                { name: 'folio',  header: 'Folio'}, 
                { name: 'fechaPago',  header: 'Fecha de Pago'}, 
                { name: 'Cliente',  header: 'Cliente'}, 
                { name: 'Pago',     header:  'Pago'}
            ]
        };
        this.gridCuentasCobrar = { 
            columnDefs: [
                { name: 'cliente',  header: 'Cliente'}, 
                { name: 'telefono',  header: 'Teléfono'}, 
                { name: 'saldopendiente',  header: 'Saldo Pendiente'}, 
                { name: 'folio_caja_original',  header: 'Folio'}, 
                { name: 'fecha',     header: 'Fecha'},
                { name: 'usuario',     header:  'Usuario'}
            ]
        };

    }

    // ----------------------------------- Declaracion de funciones ----------------------------------- //
    cargarPestanias = async() => {  
        const x = await this.cargarPestaniasDetalle();
    }

    cargarPestaniasDetalle(){
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                this.tab.selectedIndex = 0;
                setTimeout(() => {
                    this.tab.selectedIndex = 1;
                    setTimeout(() => {
                        this.tab2.selectedIndex = 0;
                        setTimeout(() => {
                            this.tab2.selectedIndex = 1;
                            setTimeout(() => {
                                this.tab.selectedIndex = 0;
                                resolve(true);
                            }, 1);
                        }, 1);
                    }, 1);
                }, 1);
            }, 1);
        });
    }

    ventaProducto_selectPestana(padre: any, idHijo: any){
        if(idHijo == 'a1'){
            $('#productos').show();
            $('#servicios').hide();
        }else{
            $("#servicios").show();
            $("#productos").hide();
            var ebi_bbb : any = document.getElementById("bbb");
            this.widthGrafica = ebi_bbb.offsetWidth;
            this.heigthGrafica = this.widthGrafica * .6;
            this.ventaProducto_graficaHora();
            this.ventaProducto_graficaDia();
        }
    };

    ventaProducto_selectPestana2(padre: any, idHijo: any){
        if(idHijo == 'a3'){
            $("#lblCantidad").attr("style", "color: #064a59; cursor: pointer;");
            $("#lblMonto").attr("style", "color: black; cursor: pointer;");

            for(var i = 0; i< this.ventaProducto.dataTopProductos.length; i++){
                $("#cantidad" + i).show();
                $("#nombreCantidad" + i).show();
                $("#precio" + i).hide();
                $("#nombrePrecio" + i).hide();
            }
            $('#trTotal').hide();
        }else{
            $("#lblCantidad").attr("style", "color: black; cursor: pointer;");
            $("#lblMonto").attr("style", "color: #064a59; cursor: pointer;");

            for(var i = 0; i< 5; i++){
                $("#precio" + i).show();
                $("#nombrePrecio" + i).show();
                $("#cantidad" + i).hide();
                $("#nombreCantidad" + i).hide();
            }
            $('#trTotal').show();
        }
    };  

    ventaProducto_selectPestana3(padre: any, idHijo: any){
        if(idHijo == 'a5'){
            $("#lblServicios").attr("style", "color: #064a59; cursor: pointer;");
            $("#lblMonto2").attr("style", "color: black; cursor: pointer;");

            for(var i = 0; i< this.ventaProducto.dataTopServicios.length; i++){
                $("#servicioss" + i).show();
                $("#nombreCantidadServicio" + i).show();
                $("#nombreCantidadServicio2" + i).show();
                $("#sucursales" + i).hide();
                $("#nombrePrecioServicio" + i).hide();
                $("#nombrePrecioServicio2" + i).hide();
            }
            $('#trTotalServicio').hide();
        }else{
            $("#lblServicios").attr("style", "color: black; cursor: pointer;");
            $("#lblMonto2").attr("style", "color: #064a59; cursor: pointer;");

            for(var i = 0; i< 5; i++){
                $("#sucursales" + i).show();
                $("#nombrePrecioServicio" + i).show();
                $("#nombrePrecioServicio2" + i).show();
                $("#servicioss" + i).hide();
                $("#nombreCantidadServicio" + i).hide();
                $("#nombreCantidadServicio2" + i).hide();
            }
            $('#trTotalServicio').show();
        }
    };  
    
    ventaProducto_selectPestana4(padre: any, idHijo: any){
        // CAMBIAR PESTAÑAS GRAFICA DIA / HORA
        $('#listaLink4 li').children().removeClass('pestana');
        $('#listaLink4 li #'+padre).addClass('active');
        $('#' + idHijo).addClass('pestana');
        if(idHijo == 'a7'){
            this.ventaProducto_obtenerGraficaDia();
            $("#citasDia").show();
            $("#citas").hide();
                
        }else{
            this.ventaProducto_obtenerGraficaHora();
            $("#citas").show();
            $("#citasDia").hide();  
        }
    };

    // -------------------- APARTADO DE GRAFICAS -----------------------------------
    ventaProducto_graficaHora(){
        var citasHora = this.reporteVentaProductoTranslate.citasHora;
        var antes = this.reporteVentaProductoTranslate.antes;
        var despues = this.reporteVentaProductoTranslate.despues;
        var  sinDia = this.reporteVentaProductoTranslate.sinDia;

        const ebi_citas: any = document.getElementById('citas') as HTMLCanvasElement;
        if (this.myChart) {
            this.myChart.destroy();
        }
        
        var dataGraficaPorHoras: any = {
            name: [
                antes,
                '8:00 - 10:00',
                '10:00 - 12:00',
                '12:00 - 14:00',
                '14:00 - 16:00',
                '16:00 - 18:00',
                '18:00 - 20:00',
                despues,
                sinDia
            ], 
            y: [
                this.ventaProducto.dataGraficaHora.antesOcho, 
                this.ventaProducto.dataGraficaHora.ochoADiez, 
                this.ventaProducto.dataGraficaHora.diezADoce, 
                this.ventaProducto.dataGraficaHora.doceACatorce, 
                this.ventaProducto.dataGraficaHora.catorceADieciseis, 
                this.ventaProducto.dataGraficaHora.dieciseisADieciocho, 
                this.ventaProducto.dataGraficaHora.dieciochoAVenite, 
                this.ventaProducto.dataGraficaHora.despuesVeinte, 
                this.ventaProducto.dataGraficaHora.sinHora
            ] 
        };

        this.myChart = new Chart(ebi_citas, {
            type: 'pie',
            data: {
                labels: dataGraficaPorHoras.name, // Nombre de los labels
                datasets: [{
                    label: this.reporteVentasTranslate.citas, // Nombre del hover de cada parte del Pie
                    data: dataGraficaPorHoras.y, // Valores de las barras
                    borderWidth: 1
                }]
            },
            options: {
                plugins: {
                    title: { // Titulo del Gráfico
                        text: citasHora,
                        display: true
                    },
                    legend: {
                        position: 'right',
                    },
                },
            },
        });
    };

    ventaProducto_graficaDia(){
        var citasDia = this.reporteVentaProductoTranslate.citasDia;
        var  lunes = this.reporteVentaProductoTranslate.lunes;
        var  martes	= this.reporteVentaProductoTranslate.martes;
        var  miercoles = this.reporteVentaProductoTranslate.miercoles;
        var  jueves	= this.reporteVentaProductoTranslate.jueves;
        var  viernes = this.reporteVentaProductoTranslate.viernes;
        var  sabado	= this.reporteVentaProductoTranslate.sabado;
        var  domingo = this.reporteVentaProductoTranslate.domingo;
        var  sinDia = this.reporteVentaProductoTranslate.sinDia;

        const ebi_citasDia: any = document.getElementById('citasDia') as HTMLCanvasElement;
        if (this.myChart2) {
            this.myChart2.destroy();
        }

        var dataGraficaPorDia: any = {
            name: [
                lunes,
                martes,
                miercoles,
                jueves,
                viernes, 
                sabado,
                domingo, 
                sinDia,
            ], 
            y: [
                this.ventaProducto.dataGraficaDia.lunes,
                this.ventaProducto.dataGraficaDia.martes,
                this.ventaProducto.dataGraficaDia.miercoles, 
                this.ventaProducto.dataGraficaDia.jueves,
                this.ventaProducto.dataGraficaDia.viernes,
                this.ventaProducto.dataGraficaDia.sabado,
                this.ventaProducto.dataGraficaDia.domingo,
                this.ventaProducto.dataGraficaDia.sinDia
            ] 
        };

        this.myChart2 = new Chart(ebi_citasDia, {
            type: 'pie',
            data: {
                labels: dataGraficaPorDia.name, // Nombre de los labels
                datasets: [{
                    label: this.reporteVentasTranslate.citas, // Nombre del hover de cada parte del Pie
                    data: dataGraficaPorDia.y, // Valores de las barras
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: { // Titulo del Gráfico
                        text: citasDia,
                        display: true
                    },
                    legend: {
                        position: 'right'
                    },
                },
            },
        });
    };

    ventaProducto_obtenerGraficaDia(){
        this.ventaProducto.dataGraficaDia.lunes = null;
        this.ventaProducto.dataGraficaDia.martes = null;
        this.ventaProducto.dataGraficaDia.miercoles = null;
        this.ventaProducto.dataGraficaDia.jueves = null;
        this.ventaProducto.dataGraficaDia.viernes = null;
        this.ventaProducto.dataGraficaDia.sabado = null;
        this.ventaProducto.dataGraficaDia.domingo = null;
        this.ventaProducto.dataGraficaDia.sinDia = null;

        if(this.ventaProducto.dataDia.length != 0) {
            for(var i=0; i<this.ventaProducto.dataDia.length;i++){
                if(this.ventaProducto.dataDia[i].range == "Lunes") {
                    this.ventaProducto.dataGraficaDia.lunes = this.ventaProducto.dataDia[i].count;
                }
                if(this.ventaProducto.dataDia[i].range == "Martes") {
                    this.ventaProducto.dataGraficaDia.martes = this.ventaProducto.dataDia[i].count;
                }
                if(this.ventaProducto.dataDia[i].range == "Miércoles") {
                    this.ventaProducto.dataGraficaDia.miercoles = this.ventaProducto.dataDia[i].count;
                }
                if(this.ventaProducto.dataDia[i].range == "Jueves") {
                    this.ventaProducto.dataGraficaDia.jueves = this.ventaProducto.dataDia[i].count;
                }
                if(this.ventaProducto.dataDia[i].range == "Viernes") {
                    this.ventaProducto.dataGraficaDia.viernes = this.ventaProducto.dataDia[i].count;
                }
                if(this.ventaProducto.dataDia[i].range == "Sábado") {
                    this.ventaProducto.dataGraficaDia.sabado = this.ventaProducto.dataDia[i].count;
                }
                if(this.ventaProducto.dataDia[i].range == "Domingo") {
                    this.ventaProducto.dataGraficaDia.domingo = this.ventaProducto.dataDia[i].count;
                }
            }
        } else {
            this.ventaProducto.dataGraficaDia.sinDia = 1;
        }

        this.ventaProducto_graficaDia();
    };

    ventaProducto_obtenerGraficaHora(){
        this.ventaProducto.dataGraficaHora.antesOcho = 0;
        this.ventaProducto.dataGraficaHora.ochoADiez = 0;
        this.ventaProducto.dataGraficaHora.diezADoce = 0;
        this.ventaProducto.dataGraficaHora.doceACatorce = 0;
        this.ventaProducto.dataGraficaHora.catorceADieciseis = 0;
        this.ventaProducto.dataGraficaHora.dieciseisADieciocho = 0;
        this.ventaProducto.dataGraficaHora.dieciochoAVenite = 0;
        this.ventaProducto.dataGraficaHora.despuesVeinte = 0;
        this.ventaProducto.dataGraficaHora.sinHora = 0;

        if(this.ventaProducto.dataHora.length != 0) {
            for(var i=0; i<this.ventaProducto.dataHora.length; i++){
                if(this.ventaProducto.dataHora[i].range == "0-8") {
                    this.ventaProducto.dataGraficaHora.antesOcho = this.ventaProducto.dataHora[i].count;
                }
                if(this.ventaProducto.dataHora[i].range == "8-10") {
                    this.ventaProducto.dataGraficaHora.ochoADiez = this.ventaProducto.dataHora[i].count;
                }
                if(this.ventaProducto.dataHora[i].range == "10-12") {
                    this.ventaProducto.dataGraficaHora.diezADoce = this.ventaProducto.dataHora[i].count;
                }
                if(this.ventaProducto.dataHora[i].range == "12-14") {
                    this.ventaProducto.dataGraficaHora.doceACatorce = this.ventaProducto.dataHora[i].count;
                }
                if(this.ventaProducto.dataHora[i].range == "14-16") {
                    this.ventaProducto.dataGraficaHora.catorceADieciseis = this.ventaProducto.dataHora[i].count;
                }
                if(this.ventaProducto.dataHora[i].range == "16-18") {
                    this.ventaProducto.dataGraficaHora.dieciseisADieciocho = this.ventaProducto.dataHora[i].count;
                }
                if(this.ventaProducto.dataHora[i].range == "18-20") {
                    this.ventaProducto.dataGraficaHora.dieciochoAVenite = this.ventaProducto.dataHora[i].count;
                }
                if(this.ventaProducto.dataHora[i].range == "20-0") {
                    this.ventaProducto.dataGraficaHora.despuesVeinte = this.ventaProducto.dataHora[i].count;
                }
            }
        } else {
            this.ventaProducto.dataGraficaHora.sinHora = 1;
        }

        this.ventaProducto_graficaHora();
    };
        
    // SACAR OPERACIONES DE COMISIONES Y VENTAS 
    ventaProducto_sacarTop5(dataTemp5: any, dataTemp6: any, dataTemp7: any, dataTemp8: any) {     
        var TopProductosMonto: any = 0;
        var TopProductosVendido: any = 0;
        TopProductosMonto = dataTemp5;
        TopProductosVendido = dataTemp6;
        var arreglo = [];

        if(!(TopProductosMonto.length == 0 && TopProductosVendido.length == 0)) {
            for(var i=0; i<TopProductosMonto.length;i++){
                var Objeto: any = {};
                Objeto.nombreC = TopProductosVendido[i].nombre;
                Objeto.cantidad = TopProductosVendido[i].contador;
                Objeto.nombreM = TopProductosVendido[i].marca + " - ";
                Objeto.nombrePro = TopProductosVendido[i].producto + " - ";
                Objeto.nombreP = TopProductosMonto[i].nombre;
                Objeto.precio = TopProductosMonto[i].contador;
                Objeto.nombreMP = TopProductosMonto[i].marca + " - ";
                Objeto.nombreProP = TopProductosMonto[i].producto + " - ";

                arreglo.push(Objeto);
            }
        } else {
            var Objeto: any = {};
            Objeto.nombreC = "Sin Productos";
            Objeto.nombreP = "Sin Productos";

            arreglo.push(Objeto);
        }
        while(arreglo.length < 5){	                
            var Objeto: any = {};
            Objeto.nombreC = "";
            Objeto.nombreP = "";

            arreglo.push(Objeto);
        }

        this.ventaProducto.dataTopProductos = arreglo;
        this.ventaProducto.totalTopProducto = 0;
        for (var i = 0; i < this.ventaProducto.dataTopProductos.length; i++) {
            if (this.ventaProducto.dataTopProductos[i].nombreC != "") {
                this.ventaProducto.totalTopProducto += this.ventaProducto.dataTopProductos[i].precio;            
            }
        }
        
        var TopServiciosMonto: any = 0;
        var TopServiciosVendido: any = 0;
        TopServiciosMonto = dataTemp8;
        TopServiciosVendido = dataTemp7;
        var arreglo = [];

        if(!(TopServiciosMonto==0 && TopServiciosVendido == 0) ) {
            for(var i=0; i<TopServiciosMonto.length;i++){
                var Objeto: any = {};
                Objeto.nombreC = TopServiciosVendido[i].servicio;
                Objeto.cantidad = TopServiciosVendido[i].cantidad;
                Objeto.nombreP = TopServiciosMonto[i].servicio;
                Objeto.precio = TopServiciosMonto[i].total;

                arreglo.push(Objeto);
            }
        } else {
            var Objeto: any = {};
            Objeto.nombreC = "Sin Servicios";
            Objeto.nombreP = "Sin Servicios";

            arreglo.push(Objeto);
        }

        while(arreglo.length < 5){	                
            var Objeto: any = {};
            Objeto.nombreC = "";
            Objeto.nombreP = "";

            arreglo.push(Objeto);
        }

        this.ventaProducto.dataTopServicios = arreglo;
        this.ventaProducto.totalTopServicio = 0;

        for (var i = 0; i < this.ventaProducto.dataTopServicios.length; i++) {
            if (this.ventaProducto.dataTopServicios[i].nombreC != "") {
                this.ventaProducto.totalTopServicio += this.ventaProducto.dataTopServicios[i].precio;
            }
        }
    };

    ventaProducto_obtenerDataVentasGrid(){
        var arreglo = [];
        this.ventaProducto.ventasModalTotal = 0;
        this.ventaProducto.ventasModalComisionTotal = 0;
        this.ventaProducto.ventasModalCosto = 0;
        this.ventaProducto.ventasModalUtilidadTotal = 0;

        for(var i = 0; i < this.ventaProducto.auxVentasProductos.length; i++) {
            var Objeto: any = {};
            if(this.ventaProducto.auxVentasProductos[i].Presentacion === null){
                Objeto.tipo = "Paquete";
            }
            else{
                Objeto.tipo = "Producto";
            }
            if(this.ventaProducto.auxVentasProductos[i].idCita){
                Objeto.folio = this.ventaProducto.auxVentasProductos[i].folio || "-";
                Objeto.esProducto = false;
            }
            else{
                Objeto.folio = "P" + this.ventaProducto.auxVentasProductos[i].folio || "-";
                Objeto.esProducto = true;
            }
            Objeto.fecha = this.ventaProducto.auxVentasProductos[i].fecha.substr(0,10) || "-";
            Objeto.personal = this.ventaProducto.auxVentasProductos[i].Personal || "-";
            Objeto.cliente = this.ventaProducto.auxVentasProductos[i].cliente || "-";
            Objeto.producto = this.ventaProducto.auxVentasProductos[i].Producto || "-";
            Objeto.presentacion = this.ventaProducto.auxVentasProductos[i].Presentacion || "-";
            Objeto.servicio = this.ventaProducto.auxVentasProductos[i].servicio || "-";
            Objeto.cantidad = this.ventaProducto.auxVentasProductos[i].CantidadVendida || "-";
            Objeto.ventaTotal = this.ventaProducto.auxVentasProductos[i].TotalVenta || 0;
            Objeto.comision = this.ventaProducto.auxVentasProductos[i].comisionProducto || 0;	                
            if( this.ventaProducto.auxVentasProductos[i].costo === null){
                Objeto.costo = this.ventaProducto.auxVentasProductos[i].costoalta;
            }
            else{
                Objeto.costo = this.ventaProducto.auxVentasProductos[i].costo;
            }	                   
            Objeto.utilidad = (this.ventaProducto.auxVentasProductos[i].TotalVenta - (this.ventaProducto.auxVentasProductos[i].costo || 0) - (this.ventaProducto.auxVentasProductos[i].comisionProducto)) || this.ventaProducto.auxVentasProductos[i].TotalVenta;
            Objeto.idPersonal = this.ventaProducto.auxVentasProductos[i].idPersonal;
            Objeto.idPagoClienteProducto = this.ventaProducto.auxVentasProductos[i].idPagoClienteProducto;
            Objeto.idCita = this.ventaProducto.auxVentasProductos[i].idCita || null;
            Objeto.numPaquete = "-";
            Objeto.totalAbono = this.ventaProducto.auxVentasProductos[i].totalAbono || 0;
            Objeto.folioPago = this.ventaProducto.auxVentasProductos[i].folioOriginalPago;
            Objeto.referencia = this.ventaProducto.auxVentasProductos[i].referencia || "-";
            Objeto.fechaCita = null;
            arreglo.push(Objeto);
        }
        
        for(var i = 0; i < this.ventaProducto.auxVentasServicios.length; i++) {
            var Objeto: any = {};
                
            if(this.ventaProducto.auxVentasServicios[i].Servicio) {
                Objeto.tipo = this.ventaProducto.auxVentasServicios[i].Servicio.substring(0,5);
            } else {
                Objeto.tipo = "";
            }

            if(Objeto.tipo == "Cargo"){
                Objeto.tipo = "Cargo";
            }
            else{
                Objeto.tipo = "Servicio";
            }
                                
            Objeto.folio = this.ventaProducto.auxVentasServicios[i].folioServicio || "-";
            Objeto.fecha = this.ventaProducto.auxVentasServicios[i].fechaCita.substr(0,10) || "-";
            Objeto.personal = this.ventaProducto.auxVentasServicios[i].Personal || "-"; 
            Objeto.cliente = this.ventaProducto.auxVentasServicios[i].cliente || "-";
            Objeto.producto = this.ventaProducto.auxVentasServicios[i].Producto || "-";
            Objeto.presentacion = this.ventaProducto.auxVentasServicios[i].Presentacion || "-";
            Objeto.servicio = this.ventaProducto.auxVentasServicios[i].Servicio || "-";
            Objeto.cantidad = this.ventaProducto.auxVentasServicios[i].Cantidad || "-";
            Objeto.ventaTotal = this.ventaProducto.auxVentasServicios[i].Total || 0;
            Objeto.comision = this.ventaProducto.auxVentasServicios[i].comisionServicio;
            Objeto.costo = this.ventaProducto.auxVentasServicios[i].costo || "-";
            Objeto.utilidad = (this.ventaProducto.auxVentasServicios[i].Total - this.ventaProducto.auxVentasServicios[i].comisionServicio) || this.ventaProducto.auxVentasServicios[i].Total;
            Objeto.idPersonal = this.ventaProducto.auxVentasServicios[i].idPersonal;
            Objeto.idPagoClienteProducto = "-";
            Objeto.esProducto = false;
            Objeto.idCita = this.ventaProducto.auxVentasServicios[i].idCita || null;
            Objeto.numPaquete = this.ventaProducto.auxVentasServicios[i].numPaquete || null;

            Objeto.totalAbono = this.ventaProducto.auxVentasServicios[i].totalAbono || 0;

            Objeto.folioPago = this.ventaProducto.auxVentasServicios[i].folioOriginalPago;
            Objeto.referencia = this.ventaProducto.auxVentasServicios[i].referencia || "-";
            Objeto.fechaCita = this.ventaProducto.auxVentasServicios[i].fechaCitaOriginal;
            arreglo.push(Objeto);
        }

        for(var i = 0; i < this.ventaProducto.auxVentasCertificadosRegalo.length; i++) {
            if(((this.ventaProducto.auxVentasCertificadosRegalo[i].TotalVenta)*1) > 0){
                var Objeto: any = {};
                Objeto.tipo = "Certificados Regalo";
                if(this.ventaProducto.auxVentasCertificadosRegalo[i].idCita){
                    Objeto.folio = this.ventaProducto.auxVentasCertificadosRegalo[i].folio || "-";
                    Objeto.esProducto = false;
                }
                else{
                    Objeto.folio = "P" + this.ventaProducto.auxVentasCertificadosRegalo[i].folio || "-";
                    Objeto.esProducto = true;
                }
                Objeto.fecha = this.ventaProducto.auxVentasCertificadosRegalo[i].fecha.substr(0,10) || "-";
                Objeto.personal = this.ventaProducto.auxVentasCertificadosRegalo[i].Personal || "-";
                Objeto.cliente = this.ventaProducto.auxVentasCertificadosRegalo[i].cliente || "-";
                Objeto.producto = this.ventaProducto.auxVentasCertificadosRegalo[i].Producto || "-";
                Objeto.presentacion = this.ventaProducto.auxVentasCertificadosRegalo[i].Presentacion || "-";
                Objeto.servicio = this.ventaProducto.auxVentasCertificadosRegalo[i].servicio || "-";
                Objeto.cantidad = this.ventaProducto.auxVentasCertificadosRegalo[i].CantidadVendida || "-";
                Objeto.ventaTotal = this.ventaProducto.auxVentasCertificadosRegalo[i].TotalVenta || 0;
                Objeto.comision = this.ventaProducto.auxVentasCertificadosRegalo[i].comisionProducto || 0;
                Objeto.costo = this.ventaProducto.auxVentasCertificadosRegalo[i].costo || 0;
                Objeto.utilidad = (this.ventaProducto.auxVentasCertificadosRegalo[i].TotalVenta - (this.ventaProducto.auxVentasCertificadosRegalo[i].costo || 0) - (this.ventaProducto.auxVentasCertificadosRegalo[i].comisionProducto)) || this.ventaProducto.auxVentasCertificadosRegalo[i].TotalVenta;
                Objeto.idPersonal = this.ventaProducto.auxVentasCertificadosRegalo[i].idPersonal;
                Objeto.idPagoClienteProducto = this.ventaProducto.auxVentasCertificadosRegalo[i].idPagoClienteProducto;
                Objeto.idCita = this.ventaProducto.auxVentasCertificadosRegalo[i].idCita || null;
                Objeto.numPaquete = "-";
                Objeto.folioPago = this.ventaProducto.auxVentasCertificadosRegalo[i].folioOriginalPago;
                Objeto.referencia = "-";
                Objeto.fechaCita = null;
                arreglo.push(Objeto);
            }
        }

        this.ventaProducto.dataVentasGrid = arreglo;
        this.dataSourceVentasGrid.data = this.ventaProducto.dataVentasGrid;
		this.dataSourceVentasGrid.sort = this.sort03;
        for(var i = 0; i<this.ventaProducto.dataVentasGrid.length; i++) {
            this.ventaProducto.ventasModalTotal = this.ventaProducto.ventasModalTotal + this.ventaProducto.dataVentasGrid[i].ventaTotal;
            this.ventaProducto.ventasModalComisionTotal = this.ventaProducto.ventasModalComisionTotal + this.ventaProducto.dataVentasGrid[i].comision;
            if(this.ventaProducto.dataVentasGrid[i].costo != "-"){
                this.ventaProducto.ventasModalCosto = this.ventaProducto.ventasModalCosto + this.ventaProducto.dataVentasGrid[i].costo;
            }
            this.ventaProducto.ventasModalUtilidadTotal = this.ventaProducto.ventasModalUtilidadTotal + this.ventaProducto.dataVentasGrid[i].utilidad;
        }

        function compareProperty(a: any, b: any) {
            return (a || b) ? (!a ? -1 : !b ? 1 : a.localeCompare(b)) : 0;
        }

        function compare(a: any, b: any) {
            return compareProperty(a.fecha, b.fecha) || compareProperty(a.folio, b.folio);
        }
    }

    ventaProducto_obtenerDataMarca(){
        var arreglo = [];
        this.ventaProducto.marcaModalCantidad = 0;
        this.ventaProducto.marcaModalTotal = 0;
        this.ventaProducto.marcaModalComisionTotal = 0;
        this.ventaProducto.marcaModalCosto = 0;
        this.ventaProducto.marcaModalUtilidadTotal = 0;

        for(var i=0; i<this.ventaProducto.auxMarca[0].length; i++) {
            var Objeto: any = {};
            Objeto.marca = this.ventaProducto.auxMarca[0][i].Marca || "-";
            Objeto.producto = this.ventaProducto.auxMarca[0][i].Producto || "-";
            Objeto.presentacion = this.ventaProducto.auxMarca[0][i].Presentacion || "-";
            Objeto.fecha = this.ventaProducto.auxMarca[0][i].fechaPago.substr(0,10) || "-";
            Objeto.cliente = this.ventaProducto.auxMarca[0][i].cliente || "-";
            Objeto.vendedor = this.ventaProducto.auxMarca[0][i].Vendedor || "-";
            Objeto.cantidad = this.ventaProducto.auxMarca[0][i].Cantidad || "-";
            Objeto.ventaTotal = this.ventaProducto.auxMarca[0][i].Pago || 0;
            Objeto.comision = this.ventaProducto.auxMarca[0][i].comisionProducto  || 0;
            Objeto.costo = this.ventaProducto.auxMarca[0][i].costo || 0;
            Objeto.utilidad = (this.ventaProducto.auxMarca[0][i].Pago - (this.ventaProducto.auxMarca[0][i].costo || 0) - (this.ventaProducto.auxMarca[0][i].comisionProducto)) || this.ventaProducto.auxMarca[0][i].Pago;
            Objeto.totalAbono = this.ventaProducto.auxMarca[0][i].totalAbono || 0;

            arreglo.push(Objeto);
        }

        this.ventaProducto.dataMarca = arreglo;
        this.dataSourceMarca.data = this.ventaProducto.dataMarca;
		this.dataSourceMarca.sort = this.sort05;
        for(var i = 0; i < this.ventaProducto.dataMarca.length; i++) {
            this.ventaProducto.marcaModalCantidad += this.ventaProducto.dataMarca[i].cantidad;
            this.ventaProducto.marcaModalTotal += this.ventaProducto.dataMarca[i].ventaTotal;
            this.ventaProducto.marcaModalComisionTotal += this.ventaProducto.dataMarca[i].comision;
            this.ventaProducto.marcaModalCosto += this.ventaProducto.dataMarca[i].costo;
            this.ventaProducto.marcaModalUtilidadTotal += this.ventaProducto.dataMarca[i].utilidad;
        }

    };

    ventaProducto_obtenerDataProductoModal(){
        var arreglo = [];
        this.ventaProducto.productoModalCantidad = 0;
        this.ventaProducto.productoModalTotal = 0;
        this.ventaProducto.productoModalComisionTotal = 0;
        this.ventaProducto.productoModalCsoto = 0;
        this.ventaProducto.productoModalUtilidadTotal = 0;

        for(var i=0; i<this.ventaProducto.auxProductoModal[0].length; i++) {
            var Objeto: any = {};
            Objeto.marca = this.ventaProducto.auxProductoModal[0][i].Marca || "-";
            Objeto.producto = this.ventaProducto.auxProductoModal[0][i].Producto || "-";
            Objeto.fecha = this.ventaProducto.auxProductoModal[0][i].fechaPago.substr(0,10) || "-";
            Objeto.cliente = this.ventaProducto.auxProductoModal[0][i].cliente || "-";
            Objeto.vendedor = this.ventaProducto.auxProductoModal[0][i].Vendedor || "-";
            Objeto.cantidad = this.ventaProducto.auxProductoModal[0][i].Cantidad || "-";
            Objeto.ventaTotal = this.ventaProducto.auxProductoModal[0][i].Pago || 0;
            Objeto.comision = (this.ventaProducto.auxProductoModal[0][i].comisionProducto) || 0;
            Objeto.costo = this.ventaProducto.auxProductoModal[0][i].costo || 0;
            Objeto.utilidad = (this.ventaProducto.auxProductoModal[0][i].Pago - (this.ventaProducto.auxProductoModal[0][i].costo || 0) - (this.ventaProducto.auxProductoModal[0][i].comisionProducto)) || this.ventaProducto.auxProductoModal[0][i].Pago;
            Objeto.totalAbono = this.ventaProducto.auxProductoModal[0][i].totalAbono || 0;

            arreglo.push(Objeto);
        }

        this.ventaProducto.dataProductoModal = arreglo;
        this.dataSourceProductoModal.data = this.ventaProducto.dataProductoModal;
		this.dataSourceProductoModal.sort = this.sort06;
        for(var i = 0; i < this.ventaProducto.dataProductoModal.length; i++) {
            this.ventaProducto.productoModalCantidad += this.ventaProducto.dataProductoModal[i].cantidad;
            this.ventaProducto.productoModalTotal +=  this.ventaProducto.dataProductoModal[i].ventaTotal;
            this.ventaProducto.productoModalComisionTotal += this.ventaProducto.dataProductoModal[i].comision;
            this.ventaProducto.productoModalCsoto += this.ventaProducto.dataProductoModal[i].costo;
            this.ventaProducto.productoModalUtilidadTotal +=  this.ventaProducto.dataProductoModal[i].utilidad;
        }
    };

    ventaProducto_obtenerDataComisiones(n: any) {
        var arreglo = [];
        for(var i = 0; i < this.ventaProducto.auxComisionesProductos.length; i++) {
            var Objeto: any = {};
            Objeto.vendedor = this.ventaProducto.auxComisionesProductos[i].Personal || "-";
            Objeto.cantidad = this.ventaProducto.auxComisionesProductos[i].CantidadVendida || "-";
            Objeto.ventaTotal = this.ventaProducto.auxComisionesProductos[i].TotalVenta || 0;
            Objeto.comision = this.ventaProducto.auxComisionesProductos[i].comisionProducto || 0;
            Objeto.utilidad = (this.ventaProducto.auxComisionesProductos[i].TotalVenta - this.ventaProducto.auxComisionesProductos[i].comisionProducto) || this.ventaProducto.auxComisionesProductos[i].TotalVenta;
            Objeto.idPersonal = this.ventaProducto.auxComisionesProductos[i].idPersonal;
    
            arreglo.push(Objeto);
        }

        for(var i = 0; i < this.ventaProducto.auxComisionesServicios.length; i++) {
            var Objeto: any = {};
            var found = false;
            var contadorEncontrado: any;
            
            for(var j=0; j< arreglo.length; j++){
                if(arreglo[j].idPersonal == this.ventaProducto.auxComisionesServicios[i].idPersonal){
                    found = true;
                    contadorEncontrado = j;
                }
            }

            if(found) {
                arreglo[contadorEncontrado].cantidad = arreglo[contadorEncontrado].cantidad + this.ventaProducto.auxComisionesServicios[i].Cantidad;
                arreglo[contadorEncontrado].ventaTotal = arreglo[contadorEncontrado].ventaTotal + this.ventaProducto.auxComisionesServicios[i].Total;
                arreglo[contadorEncontrado].comision = arreglo[contadorEncontrado].comision + (this.ventaProducto.auxComisionesServicios[i].comisionServicio)
                arreglo[contadorEncontrado].utilidad = arreglo[contadorEncontrado].utilidad + (this.ventaProducto.auxComisionesServicios[i].Total - this.ventaProducto.auxComisionesServicios[i].comisionServicio);
            } else {
                Objeto.vendedor = this.ventaProducto.auxComisionesServicios[i].Personal || "-";
                Objeto.cantidad = this.ventaProducto.auxComisionesServicios[i].Cantidad || "-";
                Objeto.ventaTotal = this.ventaProducto.auxComisionesServicios[i].Total || 0;
                Objeto.comision = this.ventaProducto.auxComisionesServicios[i].comisionServicio || 0;
                Objeto.utilidad = ((this.ventaProducto.auxComisionesServicios[i].Total - (this.ventaProducto.auxComisionesServicios[i].comisionServicio || 0)) || this.ventaProducto.auxComisionesServicios[i].Total);
                Objeto.idPersonal = this.ventaProducto.auxComisionesServicios[i].idPersonal;
                arreglo.push(Objeto);
            }
        }
        this.ventaProducto.dataComisiones = arreglo;
        this.dataSourceComisiones.data = this.ventaProducto.dataComisiones;
		this.dataSourceComisiones.sort = this.sort04;
        this.alturaComisiones = this.ventaProducto.dataComisiones.length * 30 + 45;

        this.ventaProducto_modalVarios(n);
    }

    ventaProducto_obtenerDataCuentasporCobrar(n: any) {
        var arreglo = [];
        for(var i = 0; i < this.ventaProducto.auxCuentasCobrar.length; i++) {
            var Objeto: any = {};	                
            Objeto.cliente = this.ventaProducto.auxCuentasCobrar[i].nombre_cliente || "-";
            Objeto.telefono = this.ventaProducto.auxCuentasCobrar[i].telefono || "-";
            Objeto.saldopendiente = this.ventaProducto.auxCuentasCobrar[i].saldo || 0;
            Objeto.folio = this.ventaProducto.auxCuentasCobrar[i].folio_venta || "-";
            Objeto.folio_caja = this.ventaProducto.auxCuentasCobrar[i].folio_caja || "-";
            Objeto.folio_caja_original = this.ventaProducto.auxCuentasCobrar[i].folio_caja_original || "-";
            Objeto.fecha = this.ventaProducto.auxCuentasCobrar[i].fecha_pago || "-";	                
            Objeto.usuario = this.ventaProducto.auxCuentasCobrar[i].nombre_usuario || "-";
    
            arreglo.push(Objeto);
        }

        this.ventaProducto.dataCuentasxCobrar = arreglo;
        this.dataSourceCuentasxCobrar.data = this.ventaProducto.dataCuentasxCobrar;
		this.dataSourceCuentasxCobrar.sort = this.sort08;
        this.alturaComisiones = this.ventaProducto.dataCuentasxCobrar.length * 30 + 45;

        this.ventaProducto_modalVarios(n);

    }        

    ventaProducto_obtenerDataComisionesPersonal(){
        var arreglo = [];
        this.ventaProducto.personalModalCantidad = 0;
        this.ventaProducto.personalModalTotal = 0;
        this.ventaProducto.personalModalComisionTotal = 0;
        this.ventaProducto.personalModalUtilidadTotal = 0;

        for(var i=0; i<this.ventaProducto.auxPersonal[0].length; i++) {
            var Objeto: any = {};
            Objeto.marca = this.ventaProducto.auxPersonal[0][i].Marca || "-";
            Objeto.producto = this.ventaProducto.auxPersonal[0][i].Producto || "-";
            Objeto.servicio = this.ventaProducto.auxPersonal[0][i].Servicio || "-";
            Objeto.presentacion = this.ventaProducto.auxPersonal[0][i].Presentacion || "-";
            Objeto.fecha = this.ventaProducto.auxPersonal[0][i].fecha.substr(0,10) || "-";
            Objeto.cliente = this.ventaProducto.auxPersonal[0][i].cliente || "-";
            Objeto.cantidad = this.ventaProducto.auxPersonal[0][i].cantidadVendida || 0;
            Objeto.ventaTotal = this.ventaProducto.auxPersonal[0][i].totalVenta || 0;
            Objeto.comision = (this.ventaProducto.auxPersonal[0][i].comisionProducto) || 0;
            Objeto.utilidad = (this.ventaProducto.auxPersonal[0][i].totalVenta - (this.ventaProducto.auxPersonal[0][i].comisionProducto)) || this.ventaProducto.auxPersonal[0][i].totalVenta;
            Objeto.totalAbono = (this.ventaProducto.auxPersonal[0][i].totalAbono) || 0;

            arreglo.push(Objeto);
        }

        for(var i=0; i<this.ventaProducto.auxPersonal[1].length; i++) {
            var Objeto: any = {};
            Objeto.marca = this.ventaProducto.auxPersonal[1][i].Marca || "-";
            Objeto.producto = this.ventaProducto.auxPersonal[1][i].Producto || "-";
            Objeto.servicio = this.ventaProducto.auxPersonal[1][i].Servicio || "-";
            Objeto.presentacion = this.ventaProducto.auxPersonal[1][i].Presentacion || "-";
            Objeto.fecha = this.ventaProducto.auxPersonal[1][i].fechaCita.substr(0,10) || "-";
            Objeto.cliente = this.ventaProducto.auxPersonal[1][i].cliente || "-";
            Objeto.cantidad = this.ventaProducto.auxPersonal[1][i].Cantidad || 0;
            Objeto.ventaTotal = this.ventaProducto.auxPersonal[1][i].Total || 0;
            Objeto.comision = this.ventaProducto.auxPersonal[1][i].comisionServicio;
            Objeto.utilidad = (this.ventaProducto.auxPersonal[1][i].Total - this.ventaProducto.auxPersonal[1][i].comisionServicio) || this.ventaProducto.auxPersonal[1][i].Total;
            Objeto.totalAbono = this.ventaProducto.auxPersonal[1][i].totalAbono || 0;

            arreglo.push(Objeto);
        }

        this.ventaProducto.dataComisionesPersonal = arreglo;
        this.dataSourceComisionesPersonal.data = this.ventaProducto.dataComisionesPersonal;
		this.dataSourceComisionesPersonal.sort = this.sort09;

        for(var i = 0; i < this.ventaProducto.dataComisionesPersonal.length; i++) {
            this.ventaProducto.personalModalCantidad = this.ventaProducto.personalModalCantidad + this.ventaProducto.dataComisionesPersonal[i].cantidad;
            this.ventaProducto.personalModalTotal =  this.ventaProducto.personalModalTotal + this.ventaProducto.dataComisionesPersonal[i].ventaTotal;
            this.ventaProducto.personalModalComisionTotal = parseFloat(this.ventaProducto.personalModalComisionTotal) + parseFloat(this.ventaProducto.dataComisionesPersonal[i].comision);
            this.ventaProducto.personalModalUtilidadTotal = this.ventaProducto.personalModalUtilidadTotal + this.ventaProducto.dataComisionesPersonal[i].utilidad;

        }
    }

    ventaProducto_obtenerDataDescuentos(){
        var arreglo = [];

        for(var i = 0; i<this.ventaProducto.dataDescuentos.length; i++){
            var obj: any = {};
            obj.Cantidad = this.ventaProducto.dataDescuentos[i].Cantidad || 0;
            obj.Pago = this.ventaProducto.dataDescuentos[i].Pago || 0;
            obj.Personal = this.ventaProducto.dataDescuentos[i].Personal || "-";
            obj.Servicio = this.ventaProducto.dataDescuentos[i].Servicio || "-";
            obj.Total = this.ventaProducto.dataDescuentos[i].Total || 0;
            obj.cliente = this.ventaProducto.dataDescuentos[i].cliente || "-";
            obj.comision = this.ventaProducto.dataDescuentos[i].comision || 0;
            obj.comisionServicio = this.ventaProducto.dataDescuentos[i].comisionServicio || 0;
            obj.descManual = this.ventaProducto.dataDescuentos[i].descManual || 0;
            obj.descPromocion = this.ventaProducto.dataDescuentos[i].descPromocion || 0;
            obj.fechaCita = this.ventaProducto.dataDescuentos[i].fechaCita || "-";
            obj.folioServicio = this.ventaProducto.dataDescuentos[i].folioServicio || "-";
            obj.idCita = this.ventaProducto.dataDescuentos[i].idCita || 0;
            obj.idPersonal = this.ventaProducto.dataDescuentos[i].idPersonal || 0;
            obj.promocion = this.ventaProducto.dataDescuentos[i].promocion || "-";
            obj.utilidad = this.ventaProducto.dataDescuentos[i].utilidad || 0;
            obj.totalAbono = this.ventaProducto.dataDescuentos[i].totalAbono || 0;

            arreglo.push(obj);
        }

        this.ventaProducto.dataDescuentos = arreglo;
        this.dataSourceDescuentos.data = this.ventaProducto.dataDescuentos;
		this.dataSourceDescuentos.sort = this.sort07;
    };

    // ----------------------------------------------- BUSQUEDA DE PROD Y SERV ------------------------------------------------
    ventaProducto_busquedaProductos(){
        if (this.ventaProducto.dataProductos.length != undefined) {
            if (this.ventaProducto.buscarProductos != "" && this.ventaProducto.buscarProductos != undefined) {
                var busqueda = this.ventaProducto.buscarProductos;
                var array: any = [];
                array = busqueda.split(',');
                // this.ventaProducto.dataProductosCopia = this.ventaProducto.dataProductos;
                var foundItem = this.ventaProducto.dataProductosCopia;
                for (var i = 0; i < array.length; i++) {
                    foundItem = foundItem.filter((item: any) => { 
                        if (array[i][0] == " ") {
                            array[i] = array[i].substr(1);
                        }
                        if (item.Producto.toUpperCase().match(array[i].toUpperCase()) != null) {
                            return item;
                        }
                        if (item.Marca.toUpperCase().match(array[i].toUpperCase()) != null) {
                            return item;
                        }
                        if (item.Presentacion.toUpperCase().match(array[i].toUpperCase()) != null) {     
                            return item;                   
                        }
                    });
                }
                if (foundItem.length != 0) {
                    this.ventaProducto.buscarProductos = "";
                    this.ventaProducto.dataProductos = JSON.parse(JSON.stringify(foundItem));

                    this.dataSourceProductos.data = this.ventaProducto.dataProductos;
                } else { //No se encontraron resultados
                    this.ventaProducto.buscarProductos = "";
                    var msj = this.consultaAjustesTranslate.errorBusqueda;
                    this.ventaProducto_modalAlert(msj);

                    this.ventaProducto.dataProductos = JSON.parse(JSON.stringify(this.ventaProducto.dataProductosCopia));

                    this.dataSourceProductos.data = this.ventaProducto.dataProductos;
                }
                this.alturaProductos = this.ventaProducto.dataProductos.length * 30 + 45;
            } else {
                if(this.ventaProducto.buscarProductos == "") {
                    this.ventaProducto.dataProductos = JSON.parse(JSON.stringify(this.ventaProducto.dataProductosCopia));
                    this.alturaProductos = this.ventaProducto.dataProductos.length * 30 + 45;

                    this.dataSourceProductos.data = this.ventaProducto.dataProductos;
                }
            }
        }
    };

    ventaProducto_busquedaServicio(){
        if (this.ventaProducto.dataServicios.length != undefined) {
            if (this.ventaProducto.buscarServicios != "" && this.ventaProducto.buscarServicios != undefined) {
                var busqueda = this.ventaProducto.buscarServicios;
                var array: any = [];
                array = busqueda.split(',');
                // this.ventaProducto.dataServiciosCopia = this.ventaProducto.dataServicios;
                var foundItem = this.ventaProducto.dataServiciosCopia;
                for (var i = 0; i < array.length; i++) {
                    foundItem = foundItem.filter((item: any) => { 
                        if (array[i][0] == " ") {
                            array[i] = array[i].substr(1);
                        }
                        if (item.Servicio.toUpperCase().match(array[i].toUpperCase()) != null) {
                            return item;
                        }
                        if (item.Personal.toUpperCase().match(array[i].toUpperCase()) != null) {
                            return item;
                        }
                    });
                }
                if (foundItem.length != 0) {
                    this.ventaProducto.buscarServicios = "";
                    this.ventaProducto.dataServicios = JSON.parse(JSON.stringify(foundItem));

                    this.dataSourceServicios.data = this.ventaProducto.dataServicios;
                } else { //No se encontraron resultados
                    this.ventaProducto.buscarServicios = "";
                    var msj = this.consultaAjustesTranslate.errorBusqueda;
                    this.ventaProducto_modalAlert(msj);

                    this.ventaProducto.dataServicios = JSON.parse(JSON.stringify(this.ventaProducto.dataServiciosCopia));

                    this.dataSourceServicios.data = this.ventaProducto.dataServicios;
                }
                this.alturaServicios = this.ventaProducto.dataServicios.length * 30 + 45;
            } else {
                if(this.ventaProducto.buscarServicios == "") {
                    this.ventaProducto.dataServicios = JSON.parse(JSON.stringify(this.ventaProducto.dataServiciosCopia));
                    this.alturaServicios = this.ventaProducto.dataServicios.length * 30 + 45;

                    this.dataSourceServicios.data = this.ventaProducto.dataServicios;
                }
            }
        }
    };

    // ------------------------------------------------------ CONSULTAS -------------------------------------------------------
    ventaProducto_consultaGeneral(){
        var params: any = {};
        
        var fechaBusquedaSplit = [this.ventaProducto.fechas.startDate, this.ventaProducto.fechas.endDate];
        params.fechaInicio = (moment(JSON.parse(JSON.stringify(fechaBusquedaSplit[0])), 'DD/MM/YYYY').startOf('day')).format('YYYY-MM-DD HH:mm:ss');
        params.fechaFin = (moment(JSON.parse(JSON.stringify(fechaBusquedaSplit[1])), 'DD/MM/YYYY').endOf('day')).format('YYYY-MM-DD HH:mm:ss');
        
        //Fecha Utilizada Para el Título de los Modales
        this.fechaCompleta = this.ventaProducto.fechas.startDate + " - " + this.ventaProducto.fechas.endDate;

        if(params.fechaInicio == "Invalid date" || params.fechaFin == "Invalid date"){
            params.fechaInicio = moment(new Date( this.ventaProducto.fechas.startDate['$y'], this.ventaProducto.fechas.startDate['$M'], this.ventaProducto.fechas.startDate['$D'] )).startOf('day').format('YYYY-MM-DD HH:mm:ss');
            params.fechaFin = moment(new Date( this.ventaProducto.fechas.endDate['$y'], this.ventaProducto.fechas.endDate['$M'], this.ventaProducto.fechas.endDate['$D'] )).endOf('day').format('YYYY-MM-DD HH:mm:ss');
        
            //Fecha Utilizada Para el Título de los Modales
            var fechaInicioGeneralModales = format(new Date(this.ventaProducto.fechas.startDate['$y'], this.ventaProducto.fechas.startDate['$M'], this.ventaProducto.fechas.startDate['$D']), 'dd/MM/yyyy');
            var fechaFinGeneralModales = format(new Date( this.ventaProducto.fechas.endDate['$y'], this.ventaProducto.fechas.endDate['$M'], this.ventaProducto.fechas.endDate['$D'] ), 'dd/MM/yyyy' );
            this.fechaCompleta = fechaInicioGeneralModales + " - " + fechaFinGeneralModales;
        }

        this.contadoEntradas++;
        params.idPersonal = null;
        params.idMarca = null;
        params.idPresentacion = null;

        this._backService.HttpPost("consultas/ventaProducto/consultarDatos", {}, params).subscribe((response: string) => {
            var dataTemp = eval(response);
            // [0] - Grid Productos (Abajo)
            // [1] - Grid Servicios (Abajo)
            // [2] - Tabla Ventas
            // [3] - Tabla Comisiones Productos
            // [4] - Tabla Comisiones Servicios
            // [5] - Top 5 Prodcutos por Monto
            // [6] - Top 5 Productos Vendido
            // [7] - Top 5 Servicios Usados
            // [8] - Top 5 Servicios por Monto
            // [9] - Grafica Por Dia
            // [10] - Grafica por Hora
            // [11] - Ventas Servicios (Modal)
            // [12] - Ventas Productos (Modal)
            // [13] - Comisiones Servicios (Modal)
            // [14] - Comisiones Producto (Modal)
            // [15] - Descuentos 
            // [16] - Descuentos (Modal)

            this.ventaProducto.dataProductos = dataTemp[0];
            this.ventaProducto.dataProductosCopia = JSON.parse(JSON.stringify(this.ventaProducto.dataProductos));
            this.dataSourceProductos.data = this.ventaProducto.dataProductos;
		    this.dataSourceProductos.sort = this.sort01;

            this.ventaProducto.totalProductos = 0;
            for (var i = 0; i < this.ventaProducto.dataProductos.length; i++) {
                this.ventaProducto.totalProductos += this.ventaProducto.dataProductos[i]["Total Venta"];
            }
            this.ventaProducto.dataServicios = dataTemp[1];
            this.ventaProducto.dataServiciosCopia = JSON.parse(JSON.stringify(this.ventaProducto.dataServicios));
            this.dataSourceServicios.data = this.ventaProducto.dataServicios;
		    this.dataSourceServicios.sort = this.sort02;
            this.ventaProducto.totalServicios = 0;
            for (var i = 0; i < this.ventaProducto.dataServicios.length; i++) {
                this.ventaProducto.totalServicios += this.ventaProducto.dataServicios[i].Total;
            }
            this.ventaProducto.dataVentas = dataTemp[2];

            this.ventaProducto.comisiones = {};
            this.ventaProducto.comisiones.productosTotal = dataTemp[3][0].Comision || 0;
            this.ventaProducto.comisiones.productosCantidad = dataTemp[3][0].Cant || 0;
            this.ventaProducto.comisiones.serviciosTotal = dataTemp[4][0].Comision || 0;
            this.ventaProducto.comisiones.serviciosCantidad = dataTemp[4][0].Cant || 0;
            this.ventaProducto.comisiones.paquetesTotal = dataTemp[17][0].Comision || 0;
            this.ventaProducto.comisiones.paquetesCantidad = dataTemp[17][0].Cant || 0;
            this.ventaProducto.comisiones.comisionesTotales = this.ventaProducto.comisiones.serviciosTotal + this.ventaProducto.comisiones.productosTotal + this.ventaProducto.comisiones.paquetesTotal;

            this.ventaProducto_sacarTop5(dataTemp[5], dataTemp[6], dataTemp[7], dataTemp[8]);

            this.ventaProducto.dataDia = dataTemp[9];

            this.ventaProducto_obtenerGraficaDia();

            this.ventaProducto.dataHora = dataTemp[10];

            this.ventaProducto_obtenerGraficaHora();

            this.ventaProducto.auxVentasServicios = dataTemp[11];
            this.ventaProducto.auxVentasProductos = dataTemp[12];
            this.ventaProducto.auxVentasCertificadosRegalo = dataTemp[21];

            this.ventaProducto_obtenerDataVentasGrid();
        
            this.ventaProducto.auxComisionesServicios = dataTemp[13];
            this.ventaProducto.auxComisionesProductos = dataTemp[14];

            // Alturas
            this.alturaServicios = this.ventaProducto.dataServicios.length * 30 + 45;
            this.alturaProductos = this.ventaProducto.dataProductos.length * 30 + 45;
            this.alturaVentas = this.ventaProducto.dataVentasGrid.length * 30 + 45;

            // Ventas Ingresos
            this.ventaProducto.ventasIngresos = 0;
            for(var i = 0; i<this.ventaProducto.dataVentas.length; i++){
                if(this.ventaProducto.dataVentas[i].idSucursal != null || this.ventaProducto.dataVentas[i].idSucursal == null || this.ventaProducto.dataVentas[i].isPaypal){
                    this.ventaProducto.ventasIngresos = this.ventaProducto.ventasIngresos + this.ventaProducto.dataVentas[i].Dinero;
                }
            }
    
            // Propinas totales
            this.ventaProducto.propinasTotales = (dataTemp[15][2] == undefined)?0:dataTemp[15][2].Cantidad;
            this.ventaProducto.propinasPagoTotal = (dataTemp[15][2] == undefined)?0:dataTemp[15][2].pago;

            // Cancelaciones
            this.ventaProducto.cancelacionesTotales = dataTemp[18][0].cantidad;
            this.ventaProducto.cancelacionesPagoTotal = dataTemp[18][0].monto;

            // Devoluciones
            this.ventaProducto.devolucionesTotales = dataTemp[19][0].cantidad;
            this.ventaProducto.devolucionesPagoTotal = dataTemp[19][0].monto;

            // Ventas Eliminadas
            this.ventaProducto.ventasEliminadasTotales = dataTemp[20][0].cantidad;
            this.ventaProducto.ventasEliminadasPagoTotal = dataTemp[20][0].monto;

            // Descuentos totales                 
            var descuentoDos = (dataTemp[15][0] == undefined)?0:dataTemp[15][0].Cantidad;
            var descuentoTres = (dataTemp[15][1] == undefined)?0:dataTemp[15][1].Cantidad;
            this.ventaProducto.descuentosTotales = descuentoDos + descuentoTres;
            var pagoDos = (dataTemp[15][0] == undefined)?0:dataTemp[15][0].pago;
            var pagoTres = (dataTemp[15][1] == undefined)?0:dataTemp[15][1].pago;
            this.ventaProducto.descuentosPagoTotal = pagoDos + pagoTres;

            // Descuentos
            this.ventaProducto.descuentosModalTotal = 0;
            this.ventaProducto.descuentosModalMontoP = 0;
            this.ventaProducto.descuentosModalMontoD = 0;
            this.ventaProducto.descuentosModalTotalP = 0;
            this.ventaProducto.descuentosModalComision = 0;
            this.ventaProducto.descuentosModalUtilidad = 0;
            this.ventaProducto.dataDescuentos = dataTemp[16];
            this.dataSourceDescuentos.data = this.ventaProducto.dataDescuentos;
		    this.dataSourceDescuentos.sort = this.sort07;
            this.ventaProducto_obtenerDataDescuentos();
            for(var i = 0; i<this.ventaProducto.dataDescuentos.length; i++) {
                this.ventaProducto.descuentosModalTotal = this.ventaProducto.descuentosModalTotal + this.ventaProducto.dataDescuentos[i].Total;
                this.ventaProducto.descuentosModalMontoP = this.ventaProducto.descuentosModalMontoP + this.ventaProducto.dataDescuentos[i].descPromocion;
                this.ventaProducto.descuentosModalMontoD = this.ventaProducto.descuentosModalMontoD + this.ventaProducto.dataDescuentos[i].descManual;
                this.ventaProducto.descuentosModalComision = this.ventaProducto.descuentosModalComision + this.ventaProducto.dataDescuentos[i].comision;
                this.ventaProducto.descuentosModalUtilidad = this.ventaProducto.descuentosModalUtilidad + this.ventaProducto.dataDescuentos[i].utilidad;
            }
            this.ventaProducto.descuentosModalTotalP = this.ventaProducto.descuentosModalTotal - this.ventaProducto.descuentosModalMontoP - this.ventaProducto.descuentosModalMontoD;

            //Retiro Efectivo
            this.ventaProducto.RetiroEfectivoTotales = (dataTemp[22][0] == undefined)?0:dataTemp[22][0].cantidad_retiros;
            this.ventaProducto.RetiroEfectivoPagoTotal = (dataTemp[22][0] == undefined)?0:dataTemp[22][0].monto_retiroefectivo;

            //Cuentas por Cobrar	             
            this.ventaProducto.cuentascobrar = {};
            this.ventaProducto.cuentascobrar.clientesTotal = (dataTemp[23][0] == undefined)?0:dataTemp[23][0].total_clientes;
            this.ventaProducto.cuentascobrar.clientesCantidad = (dataTemp[23][0] == undefined)?0:dataTemp[23][0].cantidad_clientes;

            this.ventaProducto.auxCuentasCobrar = dataTemp[24]; 
            
            //Egresos
            this.ventaProducto.ventasEgresos = this.ventaProducto.propinasPagoTotal + this.ventaProducto.cancelacionesPagoTotal + this.ventaProducto.devolucionesPagoTotal + this.ventaProducto.ventasEliminadasPagoTotal + this.ventaProducto.RetiroEfectivoPagoTotal;

            //Totales
            this.ventaProducto.ventasTotal = this.ventaProducto.ventasIngresos - this.ventaProducto.ventasEgresos;

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
            this._toaster.error(this.sessionTraslate.errorEliminar);
        });
    }

    ventaProducto_consultaMarca(entity: any, n: any) {
        var params: any = {};
        
        var fechaBusquedaSplit = [this.ventaProducto.fechas.startDate, this.ventaProducto.fechas.endDate];
        params.fechaInicio = (moment(JSON.parse(JSON.stringify(fechaBusquedaSplit[0])), 'DD/MM/YYYY').startOf('day')).format('YYYY-MM-DD HH:mm:ss');
        params.fechaFin = (moment(JSON.parse(JSON.stringify(fechaBusquedaSplit[1])), 'DD/MM/YYYY').endOf('day')).format('YYYY-MM-DD HH:mm:ss');
        
        //Fecha Utilizada Para el Título de los Modales
        this.fechaCompleta = this.ventaProducto.fechas.startDate + " - " + this.ventaProducto.fechas.endDate;

        if(params.fechaInicio == "Invalid date" || params.fechaFin == "Invalid date"){
            params.fechaInicio = moment(new Date( this.ventaProducto.fechas.startDate['$y'], this.ventaProducto.fechas.startDate['$M'], this.ventaProducto.fechas.startDate['$D'] )).startOf('day').format('YYYY-MM-DD HH:mm:ss');
            params.fechaFin = moment(new Date( this.ventaProducto.fechas.endDate['$y'], this.ventaProducto.fechas.endDate['$M'], this.ventaProducto.fechas.endDate['$D'] )).endOf('day').format('YYYY-MM-DD HH:mm:ss');
        
            //Fecha Utilizada Para el Título de los Modales
            var fechaInicioGeneralModales = format(new Date(this.ventaProducto.fechas.startDate['$y'], this.ventaProducto.fechas.startDate['$M'], this.ventaProducto.fechas.startDate['$D']), 'dd/MM/yyyy');
            var fechaFinGeneralModales = format(new Date( this.ventaProducto.fechas.endDate['$y'], this.ventaProducto.fechas.endDate['$M'], this.ventaProducto.fechas.endDate['$D'] ), 'dd/MM/yyyy' );
            this.fechaCompleta = fechaInicioGeneralModales + " - " + fechaFinGeneralModales;
        }

        params.idPersonal = null;
        params.idMarca = entity.idInventarioMarca;
        params.idPresentacion = null;

        this._backService.HttpPost("consultas/ventaProducto/consultarDatos", {}, params).subscribe((response: string) => {
            var dataTempMarca = eval(response);
            this.ventaProducto.auxMarca = dataTempMarca;

            this.ventaProducto_obtenerDataMarca();

            this.alturaMarca = this.ventaProducto.dataMarca.length * 30 + 45;

            this.ventaProducto_modalVarios(n);
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

    ventaProducto_consultaProducto(entity: any, n: any) {
        var params: any = {};
        
        var fechaBusquedaSplit = [this.ventaProducto.fechas.startDate, this.ventaProducto.fechas.endDate];
        params.fechaInicio = (moment(JSON.parse(JSON.stringify(fechaBusquedaSplit[0])), 'DD/MM/YYYY').startOf('day')).format('YYYY-MM-DD HH:mm:ss');
        params.fechaFin = (moment(JSON.parse(JSON.stringify(fechaBusquedaSplit[1])), 'DD/MM/YYYY').endOf('day')).format('YYYY-MM-DD HH:mm:ss');
        
        //Fecha Utilizada Para el Título de los Modales
        this.fechaCompleta = this.ventaProducto.fechas.startDate + " - " + this.ventaProducto.fechas.endDate;

        if(params.fechaInicio == "Invalid date" || params.fechaFin == "Invalid date"){
            params.fechaInicio = moment(new Date( this.ventaProducto.fechas.startDate['$y'], this.ventaProducto.fechas.startDate['$M'], this.ventaProducto.fechas.startDate['$D'] )).startOf('day').format('YYYY-MM-DD HH:mm:ss');
            params.fechaFin = moment(new Date( this.ventaProducto.fechas.endDate['$y'], this.ventaProducto.fechas.endDate['$M'], this.ventaProducto.fechas.endDate['$D'] )).endOf('day').format('YYYY-MM-DD HH:mm:ss');
        
            //Fecha Utilizada Para el Título de los Modales
            var fechaInicioGeneralModales = format(new Date(this.ventaProducto.fechas.startDate['$y'], this.ventaProducto.fechas.startDate['$M'], this.ventaProducto.fechas.startDate['$D']), 'dd/MM/yyyy');
            var fechaFinGeneralModales = format(new Date( this.ventaProducto.fechas.endDate['$y'], this.ventaProducto.fechas.endDate['$M'], this.ventaProducto.fechas.endDate['$D'] ), 'dd/MM/yyyy' );
            this.fechaCompleta = fechaInicioGeneralModales + " - " + fechaFinGeneralModales;
        }

        params.idPersonal = null;
        params.idMarca = null;
        params.idPresentacion = entity.idInventarioProducto;

        this._backService.HttpPost("consultas/ventaProducto/consultarDatos", {}, params).subscribe((response: string) => {
            var dataTempMarca = eval(response);
            this.ventaProducto.auxProductoModal = dataTempMarca;

            this.ventaProducto_obtenerDataProductoModal();

            this.alturaProductoModal = this.ventaProducto.dataProductoModal.length * 30 + 45;
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

        this.ventaProducto_modalVarios(n);
    }

    ventaProducto_consultaComisionPersonal(entity: any) {
        var params: any = {};
        
        var fechaBusquedaSplit = [this.ventaProducto.fechas.startDate, this.ventaProducto.fechas.endDate];
        params.fechaInicio = (moment(JSON.parse(JSON.stringify(fechaBusquedaSplit[0])), 'DD/MM/YYYY').startOf('day')).format('YYYY-MM-DD HH:mm:ss');
        params.fechaFin = (moment(JSON.parse(JSON.stringify(fechaBusquedaSplit[1])), 'DD/MM/YYYY').endOf('day')).format('YYYY-MM-DD HH:mm:ss');
        
        //Fecha Utilizada Para el Título de los Modales
        this.fechaCompleta = this.ventaProducto.fechas.startDate + " - " + this.ventaProducto.fechas.endDate;

        if(params.fechaInicio == "Invalid date" || params.fechaFin == "Invalid date"){
            params.fechaInicio = moment(new Date( this.ventaProducto.fechas.startDate['$y'], this.ventaProducto.fechas.startDate['$M'], this.ventaProducto.fechas.startDate['$D'] )).startOf('day').format('YYYY-MM-DD HH:mm:ss');
            params.fechaFin = moment(new Date( this.ventaProducto.fechas.endDate['$y'], this.ventaProducto.fechas.endDate['$M'], this.ventaProducto.fechas.endDate['$D'] )).endOf('day').format('YYYY-MM-DD HH:mm:ss');
        
            //Fecha Utilizada Para el Título de los Modales
            var fechaInicioGeneralModales = format(new Date(this.ventaProducto.fechas.startDate['$y'], this.ventaProducto.fechas.startDate['$M'], this.ventaProducto.fechas.startDate['$D']), 'dd/MM/yyyy');
            var fechaFinGeneralModales = format(new Date( this.ventaProducto.fechas.endDate['$y'], this.ventaProducto.fechas.endDate['$M'], this.ventaProducto.fechas.endDate['$D'] ), 'dd/MM/yyyy' );
            this.fechaCompleta = fechaInicioGeneralModales + " - " + fechaFinGeneralModales;
        }

        params.idPersonal = entity.idPersonal;
        params.idMarca = null;
        params.idPresentacion = null;

        this._backService.HttpPost("consultas/ventaProducto/consultarDatos", {}, params).subscribe((response: string) => {
            var dataTempPersonal = eval(response);
            this.ventaProducto.auxPersonal = dataTempPersonal;
            this.ventaProducto.personalNombre = entity.vendedor;
                
            this.ventaProducto_obtenerDataComisionesPersonal();

            this.ventaProducto_modalPersonal();

            this.alturaComisionesPersonal = this.ventaProducto.dataComisionesPersonal.length * 30 + 45;
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
    
    ventaProducto_cambioFecha(bandera: any){
        this._pantallaServicio.mostrarSpinner();
        if(this.primerCargaPantallaCount == 2){
            this.bandera = bandera;
        }
        this.primerCargaPantallaCount++;
        this.ventaProducto_consultaGeneral();
    }

    ventaProducto_consultarPropinasPorPersonal(){
        this.ventaProducto.dataPropinasPorPersonal = [];
        this.dataSourcePropinasPorPersonal.data = this.ventaProducto.dataPropinasPorPersonal;
		this.dataSourcePropinasPorPersonal.sort = this.sort11;

        this._pantallaServicio.mostrarSpinner();
        var params: any = {};
        
        var fechaBusquedaSplit = [this.ventaProducto.fechas.startDate, this.ventaProducto.fechas.endDate];
        params.fechaInicio = (moment(JSON.parse(JSON.stringify(fechaBusquedaSplit[0])), 'DD/MM/YYYY').startOf('day')).format('YYYY-MM-DD HH:mm:ss');
        params.fechaFin = (moment(JSON.parse(JSON.stringify(fechaBusquedaSplit[1])), 'DD/MM/YYYY').endOf('day')).format('YYYY-MM-DD HH:mm:ss');
        
        //Fecha Utilizada Para el Título de los Modales
        this.fechaCompleta = this.ventaProducto.fechas.startDate + " - " + this.ventaProducto.fechas.endDate;

        if(params.fechaInicio == "Invalid date" || params.fechaFin == "Invalid date"){
            params.fechaInicio = moment(new Date( this.ventaProducto.fechas.startDate['$y'], this.ventaProducto.fechas.startDate['$M'], this.ventaProducto.fechas.startDate['$D'] )).startOf('day').format('YYYY-MM-DD HH:mm:ss');
            params.fechaFin = moment(new Date( this.ventaProducto.fechas.endDate['$y'], this.ventaProducto.fechas.endDate['$M'], this.ventaProducto.fechas.endDate['$D'] )).endOf('day').format('YYYY-MM-DD HH:mm:ss');
        
            //Fecha Utilizada Para el Título de los Modales
            var fechaInicioGeneralModales = format(new Date(this.ventaProducto.fechas.startDate['$y'], this.ventaProducto.fechas.startDate['$M'], this.ventaProducto.fechas.startDate['$D']), 'dd/MM/yyyy');
            var fechaFinGeneralModales = format(new Date( this.ventaProducto.fechas.endDate['$y'], this.ventaProducto.fechas.endDate['$M'], this.ventaProducto.fechas.endDate['$D'] ), 'dd/MM/yyyy' );
            this.fechaCompleta = fechaInicioGeneralModales + " - " + fechaFinGeneralModales;
        }

        this._backService.HttpPost("consultas/ventaProducto/consultarPropinasPorPersonal", {}, params).subscribe((response: string) => {
            this.ventaProducto.dataPropinasPorPersonal = eval(response);
            this.dataSourcePropinasPorPersonal.data = this.ventaProducto.dataPropinasPorPersonal;
		    this.dataSourcePropinasPorPersonal.sort = this.sort11;

            this.modales.modalPropinasPorPersonal.show();
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
            this._toaster.error(this.sessionTraslate.errorEliminar);
        });
    }

    ventaProducto_consultarCancelaciones(){
        this.ventaProducto.dataCancelaciones = [];
        this.dataSourceCancelaciones.data = this.ventaProducto.dataCancelaciones;
		this.dataSourceCancelaciones.sort = this.sort12;

        this._pantallaServicio.mostrarSpinner();

        var params: any = {};
        
        var fechaBusquedaSplit = [this.ventaProducto.fechas.startDate, this.ventaProducto.fechas.endDate];
        params.fechaInicio = (moment(JSON.parse(JSON.stringify(fechaBusquedaSplit[0])), 'DD/MM/YYYY').startOf('day')).format('YYYY-MM-DD HH:mm:ss');
        params.fechaFin = (moment(JSON.parse(JSON.stringify(fechaBusquedaSplit[1])), 'DD/MM/YYYY').endOf('day')).format('YYYY-MM-DD HH:mm:ss');
        
        //Fecha Utilizada Para el Título de los Modales
        this.fechaCompleta = this.ventaProducto.fechas.startDate + " - " + this.ventaProducto.fechas.endDate;

        if(params.fechaInicio == "Invalid date" || params.fechaFin == "Invalid date"){
            params.fechaInicio = moment(new Date( this.ventaProducto.fechas.startDate['$y'], this.ventaProducto.fechas.startDate['$M'], this.ventaProducto.fechas.startDate['$D'] )).startOf('day').format('YYYY-MM-DD HH:mm:ss');
            params.fechaFin = moment(new Date( this.ventaProducto.fechas.endDate['$y'], this.ventaProducto.fechas.endDate['$M'], this.ventaProducto.fechas.endDate['$D'] )).endOf('day').format('YYYY-MM-DD HH:mm:ss');
        
            //Fecha Utilizada Para el Título de los Modales
            var fechaInicioGeneralModales = format(new Date(this.ventaProducto.fechas.startDate['$y'], this.ventaProducto.fechas.startDate['$M'], this.ventaProducto.fechas.startDate['$D']), 'dd/MM/yyyy');
            var fechaFinGeneralModales = format(new Date( this.ventaProducto.fechas.endDate['$y'], this.ventaProducto.fechas.endDate['$M'], this.ventaProducto.fechas.endDate['$D'] ), 'dd/MM/yyyy' );
            this.fechaCompleta = fechaInicioGeneralModales + " - " + fechaFinGeneralModales;
        }

        this._backService.HttpPost("consultas/ventaProducto/consultarCancelaciones", {}, params).subscribe((response: string) => {
            var temp = eval(response);
            var arreglo = [];

            for(var i = 0; i < temp[0].length; i++) {
                var Objeto: any = {};
                Objeto.tipo = "Servicio";
                Objeto.folio = temp[0][i].folioServicio || "-";
                Objeto.fecha = temp[0][i].fechaCita.substr(0,10) || "-";
                Objeto.personal = temp[0][i].Personal || "-"; 
                Objeto.cliente = temp[0][i].cliente || "-";
                Objeto.producto = temp[0][i].Producto || "-";
                Objeto.presentacion = temp[0][i].Presentacion || "-";
                Objeto.servicio = temp[0][i].Servicio || "-";
                Objeto.cantidad = temp[0][i].Cantidad || "-";
                Objeto.ventaTotal = temp[0][i].Total || 0;
                Objeto.comision = temp[0][i].comisionServicio;
                Objeto.costo = temp[0][i].costo || "-";
                Objeto.utilidad = (temp[0][i].Total - temp[0][i].comisionServicio) || temp[0][i].Total;
                Objeto.idPersonal = temp[0][i].idPersonal;
                Objeto.idPagoClienteProducto = "-";
                Objeto.esProducto = false;
                Objeto.idCita = temp[0][i].idCita || null;
                Objeto.numPaquete = temp[0][i].numPaquete || null;
                Objeto.totalAbono = temp[0][i].totalAbono || 0;
                Objeto.folioPago = temp[0][i].folioOriginalPago;

                arreglo.push(Objeto);
            }

            for(var i = 0; i < temp[1].length; i++) {
                var Objeto: any = {};
                if(temp[1][i].Presentacion === null){
                    Objeto.tipo = "Paquete";
                }
                else{
                    Objeto.tipo = "Producto";
                }
                if(temp[1][i].idCita){
                    Objeto.folio = temp[1][i].folio || "-";
                    Objeto.esProducto = false;
                }
                else{
                    Objeto.folio = "P" + temp[1][i].folio || "-";
                    Objeto.esProducto = true;
                }
                Objeto.fecha = temp[1][i].fecha.substr(0,10) || "-";
                Objeto.personal = temp[1][i].Personal || "-";
                Objeto.cliente = temp[1][i].cliente || "-";
                Objeto.producto = temp[1][i].Producto || "-";
                Objeto.presentacion = temp[1][i].Presentacion || "-";
                Objeto.servicio = temp[1][i].servicio || "-";
                Objeto.cantidad = temp[1][i].CantidadVendida || "-";
                Objeto.ventaTotal = temp[1][i].TotalVenta || 0;
                Objeto.comision = temp[1][i].comisionProducto || 0;
                Objeto.costo = temp[1][i].costo || 0;
                Objeto.utilidad = (temp[1][i].TotalVenta - (temp[1][i].costo || 0) - (temp[1][i].comisionProducto)) || temp[1][i].TotalVenta;
                Objeto.idPersonal = temp[1][i].idPersonal;
                Objeto.idPagoClienteProducto = temp[1][i].idPagoClienteProducto;
                Objeto.idCita = temp[1][i].idCita || null;
                Objeto.numPaquete = "-";
                Objeto.folioPago = temp[1][i].folioOriginalPago;

                arreglo.push(Objeto);
            }

            this.ventaProducto.dataCancelaciones = arreglo;
            this.dataSourceCancelaciones.data = this.ventaProducto.dataCancelaciones;
            this.dataSourceCancelaciones.sort = this.sort12;

            this.modales.modalCancelaciones.show();
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
            this._toaster.error(this.sessionTraslate.errorEliminar);
        });
    }

    ventaProducto_consultarDevoluciones(){
        this.ventaProducto.dataDevolucionesDetalle = [];
        this.dataSourceDevolucionesDetalle.data = this.ventaProducto.dataDevolucionesDetalle;
		this.dataSourceDevolucionesDetalle.sort = this.sort15;

        this._pantallaServicio.mostrarSpinner();

        var params: any = {};
        
        var fechaBusquedaSplit = [this.ventaProducto.fechas.startDate, this.ventaProducto.fechas.endDate];
        params.fechaInicio = (moment(JSON.parse(JSON.stringify(fechaBusquedaSplit[0])), 'DD/MM/YYYY').startOf('day')).format('YYYY-MM-DD HH:mm:ss');
        params.fechaFin = (moment(JSON.parse(JSON.stringify(fechaBusquedaSplit[1])), 'DD/MM/YYYY').endOf('day')).format('YYYY-MM-DD HH:mm:ss');
        
        //Fecha Utilizada Para el Título de los Modales
        this.fechaCompleta = this.ventaProducto.fechas.startDate + " - " + this.ventaProducto.fechas.endDate;

        if(params.fechaInicio == "Invalid date" || params.fechaFin == "Invalid date"){
            params.fechaInicio = moment(new Date( this.ventaProducto.fechas.startDate['$y'], this.ventaProducto.fechas.startDate['$M'], this.ventaProducto.fechas.startDate['$D'] )).startOf('day').format('YYYY-MM-DD HH:mm:ss');
            params.fechaFin = moment(new Date( this.ventaProducto.fechas.endDate['$y'], this.ventaProducto.fechas.endDate['$M'], this.ventaProducto.fechas.endDate['$D'] )).endOf('day').format('YYYY-MM-DD HH:mm:ss');
        
            //Fecha Utilizada Para el Título de los Modales
            var fechaInicioGeneralModales = format(new Date(this.ventaProducto.fechas.startDate['$y'], this.ventaProducto.fechas.startDate['$M'], this.ventaProducto.fechas.startDate['$D']), 'dd/MM/yyyy');
            var fechaFinGeneralModales = format(new Date( this.ventaProducto.fechas.endDate['$y'], this.ventaProducto.fechas.endDate['$M'], this.ventaProducto.fechas.endDate['$D'] ), 'dd/MM/yyyy' );
            this.fechaCompleta = fechaInicioGeneralModales + " - " + fechaFinGeneralModales;
        }

        this._backService.HttpPost("consultas/ventaProducto/consultarDevoluciones", {}, params).subscribe((response: string) => {
            this.ventaProducto.dataDevolucionesDetalle = eval(response);
            this.dataSourceDevolucionesDetalle.data = this.ventaProducto.dataDevolucionesDetalle;
		    this.dataSourceDevolucionesDetalle.sort = this.sort15;

            this.modales.modalVentasDevoluciones.show();
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
            this._toaster.error(this.sessionTraslate.errorEliminar);
        });
    }

    ventaProducto_consultarVentasEliminadas(){
        this.ventaProducto.dataVentasEliminadas = [];
        this.dataSourceVentasEliminadas.data = this.ventaProducto.dataVentasEliminadas;
		this.dataSourceVentasEliminadas.sort = this.sort13;

        this._pantallaServicio.mostrarSpinner();

        var params: any = {};
        
        var fechaBusquedaSplit = [this.ventaProducto.fechas.startDate, this.ventaProducto.fechas.endDate];
        params.fechaInicio = (moment(JSON.parse(JSON.stringify(fechaBusquedaSplit[0])), 'DD/MM/YYYY').startOf('day')).format('YYYY-MM-DD HH:mm:ss');
        params.fechaFin = (moment(JSON.parse(JSON.stringify(fechaBusquedaSplit[1])), 'DD/MM/YYYY').endOf('day')).format('YYYY-MM-DD HH:mm:ss');
        
        //Fecha Utilizada Para el Título de los Modales
        this.fechaCompleta = this.ventaProducto.fechas.startDate + " - " + this.ventaProducto.fechas.endDate;

        if(params.fechaInicio == "Invalid date" || params.fechaFin == "Invalid date"){
            params.fechaInicio = moment(new Date( this.ventaProducto.fechas.startDate['$y'], this.ventaProducto.fechas.startDate['$M'], this.ventaProducto.fechas.startDate['$D'] )).startOf('day').format('YYYY-MM-DD HH:mm:ss');
            params.fechaFin = moment(new Date( this.ventaProducto.fechas.endDate['$y'], this.ventaProducto.fechas.endDate['$M'], this.ventaProducto.fechas.endDate['$D'] )).endOf('day').format('YYYY-MM-DD HH:mm:ss');
        
            //Fecha Utilizada Para el Título de los Modales
            var fechaInicioGeneralModales = format(new Date(this.ventaProducto.fechas.startDate['$y'], this.ventaProducto.fechas.startDate['$M'], this.ventaProducto.fechas.startDate['$D']), 'dd/MM/yyyy');
            var fechaFinGeneralModales = format(new Date( this.ventaProducto.fechas.endDate['$y'], this.ventaProducto.fechas.endDate['$M'], this.ventaProducto.fechas.endDate['$D'] ), 'dd/MM/yyyy' );
            this.fechaCompleta = fechaInicioGeneralModales + " - " + fechaFinGeneralModales;
        }

        this._backService.HttpPost("consultas/ventaProducto/consultarVentasEliminadas", {}, params).subscribe((response: string) => {
            this.ventaProducto.dataVentasEliminadas = eval(response);
            this.dataSourceVentasEliminadas.data = this.ventaProducto.dataVentasEliminadas;
		    this.dataSourceVentasEliminadas.sort = this.sort13;
            
            this.modales.modalVentasEliminadas.show();
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
            this._toaster.error(this.sessionTraslate.errorEliminar);
        });
    }

    ventaProducto_consultarRetiroEfectivo(){
        this.ventaProducto.dataRetiroEfectivo = [];
        this.dataSourceRetiroEfectivo.data = this.ventaProducto.dataRetiroEfectivo;
		this.dataSourceRetiroEfectivo.sort = this.sort14;

        this._pantallaServicio.mostrarSpinner();

        var params: any = {};
        
        var fechaBusquedaSplit = [this.ventaProducto.fechas.startDate, this.ventaProducto.fechas.endDate];
        params.fechaInicio = (moment(JSON.parse(JSON.stringify(fechaBusquedaSplit[0])), 'DD/MM/YYYY').startOf('day')).format('YYYY-MM-DD HH:mm:ss');
        params.fechaFin = (moment(JSON.parse(JSON.stringify(fechaBusquedaSplit[1])), 'DD/MM/YYYY').endOf('day')).format('YYYY-MM-DD HH:mm:ss');
        
        //Fecha Utilizada Para el Título de los Modales
        this.fechaCompleta = this.ventaProducto.fechas.startDate + " - " + this.ventaProducto.fechas.endDate;

        if(params.fechaInicio == "Invalid date" || params.fechaFin == "Invalid date"){
            params.fechaInicio = moment(new Date( this.ventaProducto.fechas.startDate['$y'], this.ventaProducto.fechas.startDate['$M'], this.ventaProducto.fechas.startDate['$D'] )).startOf('day').format('YYYY-MM-DD HH:mm:ss');
            params.fechaFin = moment(new Date( this.ventaProducto.fechas.endDate['$y'], this.ventaProducto.fechas.endDate['$M'], this.ventaProducto.fechas.endDate['$D'] )).endOf('day').format('YYYY-MM-DD HH:mm:ss');
        
            //Fecha Utilizada Para el Título de los Modales
            var fechaInicioGeneralModales = format(new Date(this.ventaProducto.fechas.startDate['$y'], this.ventaProducto.fechas.startDate['$M'], this.ventaProducto.fechas.startDate['$D']), 'dd/MM/yyyy' );
            var fechaFinGeneralModales = format(new Date( this.ventaProducto.fechas.endDate['$y'], this.ventaProducto.fechas.endDate['$M'], this.ventaProducto.fechas.endDate['$D'] ), 'dd/MM/yyyy' );
            this.fechaCompleta = fechaInicioGeneralModales + " - " + fechaFinGeneralModales;
        }

        this._backService.HttpPost("consultas/ventaProducto/consultarRetiroEfectivo", {}, params).subscribe((response: string) => {
            this.ventaProducto.dataRetiroEfectivo = eval(response);	 
            this.dataSourceRetiroEfectivo.data = this.ventaProducto.dataRetiroEfectivo;
		    this.dataSourceRetiroEfectivo.sort = this.sort14;
            
            this.modales.modalRetiroEfectivo.show();
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
            this._toaster.error(this.sessionTraslate.errorEliminar);
        });
    }

    // ------------------------------------------------------- MODALES --------------------------------------------------------
    ventaProducto_modalVarios(n: any) {
        this.modales.modalVarios.show();
        this.ventaProducto.abierto = n;
        setTimeout(() => {
            this.inicializarSort();
        },50);
    };


    ventaProducto_modalPersonal() {
        this.modales.modalPersonal.show();
        $('#modal-Varios').addClass("modal-open");
        $('#modal-Personal').addClass("modalGrey");
    };

    ventaProducto_modalAlert(msj: any) {
        this.modales.modalAlert.show();
        $("#modal-Alert .modal-body").html('<span class="title">' + msj + '</span>');
    }

    ventaProducto_modalNoDatos(msj: any) {
        this.modales.modalNoDatos.show();
        $("#modal-noDatos .modal-body").html('<span class="title">' + msj + '</span>');
    }

    ventaProducto_cerrarModalVarios(){
        this.modales.modalVarios.hide();
        this.ventaProducto.abierto = 0;
    }

    ventaProducto_cerrarModalPersonal(){
        this.modales.modalPersonal.hide();
    }

    // ------------------------------------------------------- INICIO ---------------------------------------------------------
    ventaProducto_inicio(){
        this._pantallaServicio.mostrarSpinner();
        // setTimeout(() => {
        //     this.ventaProducto_consultaGeneral();
        // },300);
        
        if(window.innerWidth < 780){
            this.widthModalVarios = "auto";
        }
        else{
            this.widthModalVarios = window.innerWidth * .85;
        }

        this.heightModalVarios = window.innerHeight * .60;

        if(window.innerWidth < 780){
            this.widthModalPersonal = "auto";
        }
        else{
            this.widthModalPersonal = window.innerWidth * .65;
        }

        this.heightModalPersonal = window.innerHeight * .60;
        this.gridHeight = window.innerHeight * .40;
        this.gridPersonal = window.innerHeight * .40;
    };

    ventaProducto_inicializarCalendario(){
        var dias = this.calendarioTranslate.dias7;
        var meses = this.calendarioTranslate.ultimoMes;
        var años = this.calendarioTranslate.ultimoAnio;
        var domingo = this.calendarioTranslate.domingo;
        var lunes = this.calendarioTranslate.lunes;
        var martes = this.calendarioTranslate.martes;
        var miercoles = this.calendarioTranslate.miercoles;
        var jueves = this.calendarioTranslate.jueves;
        var viernes = this.calendarioTranslate.viernes;
        var sabado = this.calendarioTranslate.sabado;
        var eneroS = this.calendarioTranslate.eneroS;
        var febreroS = this.calendarioTranslate.febreroS;
        var marzoS = this.calendarioTranslate.marzoS;
        var abrilS = this.calendarioTranslate.abrilS;
        var mayoS = this.calendarioTranslate.mayoS;
        var junioS = this.calendarioTranslate.junioS;
        var julioS = this.calendarioTranslate.julioS;
        var agostoS = this.calendarioTranslate.agostoS;
        var septiembreS = this.calendarioTranslate.septiembreS;
        var octubreS = this.calendarioTranslate.octubreS;
        var noviembreS = this.calendarioTranslate.noviembreS;
        var diciembreS = this.calendarioTranslate.diciembreS;
        var rango = this.calendarioTranslate.rango;
        var aceptar = this.calendarioTranslate.aceptar;
        var cancelar = this.calendarioTranslate.cancelar;

        this.ranges = {
            [dias]:  [moment().subtract(6, 'days'), moment()], //subtract
            [meses]: [moment().startOf('month'), moment().endOf('month')],
            [años]:  [moment().startOf('year'), moment().endOf('year')]
        }
        this.locale = {
            format: 'DD/MM/YYYY',
            "daysOfWeek": [
                [domingo],
                [lunes],
                [martes],
                [miercoles],
                [jueves],
                [viernes],
                [sabado]
            ],
            "monthNames": [
                [eneroS],
                [febreroS],
                [marzoS],
                [abrilS],
                [mayoS],
                [junioS],
                [julioS],
                [agostoS],
                [septiembreS],
                [octubreS],
                [noviembreS],
                [diciembreS]
            ],
            applyLabel: aceptar,
            cancelLabel: cancelar,
            customRangeLabel: rango
        }    

        //var fechaInicial = this.ventaProducto.fechaInicio + " - " + this.ventaProducto.fechaFin;
        // this.ventaProducto.fechas = {startDate: null, endDate: null}
        // this.ventaProducto.fechas.startDate = this.ventaProducto.fechaInicio;
        // this.ventaProducto.fechas.endDate = this.ventaProducto.fechaFin;
    };

    // ------------------------------------------------- APARTADO DE TICKETS --------------------------------------------------
    verNotaVenta(row: any){
        var params: any = {};
        this.idPagoClienteProducto = row.idPagoClienteProducto;
        params.idPagoClienteProducto = row.idPagoClienteProducto;

        this._backService.HttpPost("procesos/agenda/Agenda/selectTicketVenta", {}, params).subscribe((response: string) => {
            var temp = eval(response);
            this.ticket.cargos = [];
            this.ticket.promocion = [];
            this.ticket.total = 0;
            this.ticket.fecha = moment(temp[0].fecha).format("DD MMM YYYY HH:mm");
            this.ticket.fechaSF = moment(temp[0].fecha);
            this.ticket.cliente = temp[0].nombreCliente;
            this.ticket.idCliente = temp[0].idCliente;
            this.ticket.folio = temp[0].folio;
            this.ticket.productos = [];
            this.ticket.paquetes = [];
            var idPagoClienteDetalleAux = 0;
            
            for (var i = 0; i < temp.length; i++) {
                if (idPagoClienteDetalleAux != temp[i].idPagoClienteDetalle) {
                    switch (temp[i].idPagoClienteTipo) {
                        case 1: this.ticket.cargos.push(temp[i]);
                            break;
                        case 2: this.ticket.descuento = temp[i];
                            break;
                        case 3: this.ticket.promocion.push(temp[i]);
                            break;
                        case 4: this.ticket.propina = temp[i];
                            break;
                        case 5: this.ticket.productos.push(temp[i]);
                            break;
                        case 6: this.ticket.paquetes.push(temp[i]);
                            break;
                    }
                    this.ticket.total += temp[i].idPagoClienteTipo != 4 ? temp[i].pago : 0;
                }
                idPagoClienteDetalleAux = temp[i].idPagoClienteDetalle;
            }
            if (this.ticket.propina != undefined) {
                this.ticket.total = this.ticket.total + this.ticket.propina.pago;
            }
            var params: any = {};
            params.idCita = 0;
            params.idPagoClienteProducto = row.idPagoClienteProducto;

            this._backService.HttpPost("procesos/agenda/Agenda/selectTicketMetodoPago", {}, params).subscribe((response: string) => {
                var temp = eval(response);
                this.ticket.metodoPago = [];
                for (i = 0; i < temp.length; i++) {
                    this.ticket.metodoPago.push(temp[i]);
                }

                this.rootScope_dataTicket = this.ticket;
                this.ticketVentaModal();
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

    verNotaCita(row: any){
        var params: any = {};
        this.idCita = row.idCita;
        params.idCita = row.idCita;

        this._backService.HttpPost("procesos/agenda/Agenda/selectTicketInfo", {}, params).subscribe((response: string) => {
            var temp = eval(response);
            this.ticket = {};
            this.ticket.cargos = [];
            this.ticket.promocion = [];
            this.ticket.total = 0;
            this.ticket.fecha = moment(temp[0].fecha).format("DD MMM YYYY HH:mm");
            this.ticket.fechaSF = moment(temp[0].fecha);
            this.ticket.cliente = temp[0].nombreCliente;
            this.ticket.idCliente = temp[0].idCliente;
            this.ticket.folio = temp[0].folio;
            this.ticket.productos = [];
            this.ticket.paquetes = [];

            for (var i = 0; i < temp.length; i++) {
                switch (temp[i].idPagoClienteTipo) {
                    case 1: this.ticket.cargos.push(temp[i]);
                        break;
                    case 2: this.ticket.descuento = temp[i];
                        break;
                    case 3: this.ticket.promocion.push(temp[i]);
                        break;
                    case 4: this.ticket.propina = temp[i];
                        break;
                    case 5: this.ticket.productos.push(temp[i]);
                        break;
                    case 6: this.ticket.paquetes.push(temp[i]);
                        break;
                }
                this.ticket.total += temp[i].idPagoClienteTipo != 4 ? temp[i].pago : 0;
            }

            if (this.ticket.propina != undefined) {
                this.ticket.total = this.ticket.total + this.ticket.propina.pago;
            }

            this.ticket.idCita = row.idCita;
            var params: any = {};
            params.idCita = row.idCita;
            params.idPagoClienteProducto = 0;

            this._backService.HttpPost("procesos/agenda/Agenda/selectTicketMetodoPago", {}, params).subscribe((response: string) => {
                var temp = eval(response);
                this.ticket.metodoPago = [];
                for (i = 0; i < temp.length; i++) {
                    this.ticket.metodoPago.push(temp[i]);
                }

                this.rootScope_dataTicket = this.ticket;
                this.ticketCitaModal();
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

    ticketVentaModal(){
        this.modales.modalGlobalTicketVenta.show();
    };

    ticketCitaModal(){
        this.modales.modalTicketCita.show();
    };

    // ---------------------------------------------------- EXPORTAR A EXCEL ---------------------------------------------------
    exportToExcel(n: any) {
        // 1 - Grid Productos
        // 2 - Grid Servicios
        // 3 - Modal Ventas
        // 4 - Modal Comisiones
        // 5 - Modal Marca
        // 6 - Modal Producto
        // 7 - Modal Personal
        // 8 - Modal Descuentos
        // 9 - Modal Método pagos
        // 10 - Modal Cuentas x Cobrar
        this.ventaProducto_declararGrids();

        if(n==1){
            var titulo = this.reporteVentaProductoTranslate.reporteVP;
            var dataCopy = JSON.parse(JSON.stringify(this.ventaProducto.dataProductos));
            
            this.formatearGridReporteIngresos(dataCopy, n);
            this.exportXlsTableView(dataCopy, this.gridProductos.columnDefs, titulo);
        }
        if(n==2){
            var titulo = this.reporteVentaProductoTranslate.reporteS;
            var dataCopy = JSON.parse(JSON.stringify(this.ventaProducto.dataServicios));
                        
            this.formatearGridReporteIngresos(dataCopy, n);
            this.exportXlsTableView(dataCopy, this.gridServicios.columnDefs, titulo);
        }
        if(n==3){
            function compareProperty(a: any, b: any) {
                return (a || b) ? (!a ? -1 : !b ? 1 : a.localeCompare(b)) : 0;
            }

            function compare(a: any, b: any) {
                return compareProperty(a.fecha, b.fecha) || compareProperty(a.folio, b.folio);
            }

            var titulo = this.reporteVentaProductoTranslate.reporteV;
            var dataCopy = JSON.parse(JSON.stringify(this.ventaProducto.dataVentasGrid));
            
            dataCopy.push({cantidad:"", cliente : "", comision : "", costo : "", esProducto : "", fecha : "", folio : "", idCita : "", idPersonal : "",
                personal : "", presentacion : "", producto : "", servicio : "", tipo : "", utilidad : "", ventaTotal : ""
            });

            dataCopy.push({cantidad:" ", cliente : " ", comision : this.reporteVentaProductoTranslate.comision, costo : this.producto.costo, esProducto : " ", fecha : " ", folio : " ", idCita : " ", idPersonal : " ",
                personal : " ", presentacion : " ", producto : " ", servicio : " ", tipo : " ", utilidad : this.reporteVentaProductoTranslate.utilidad, ventaTotal : this.reporteVentaProductoTranslate.total
            });

            dataCopy.push({cantidad:" ", cliente : " ", comision : this.ventaProducto.ventasModalComisionTotal, costo : this.ventaProducto.ventasModalCosto, esProducto: " ", fecha : " ", folio : " ", idCita : " ", idPersonal : " ",
                personal : " ", presentacion : " ", producto : " ", servicio : " ", tipo : " ", utilidad : this.ventaProducto.ventasModalUtilidadTotal, ventaTotal : this.ventaProducto.ventasModalTotal
            });
            
            this.formatearGridReporteIngresos(dataCopy, n);
            this.exportXlsTableView(dataCopy, this.gridVentas.columnDefs, titulo);
        }
        if(n==4){
            var titulo = this.reporteVentaProductoTranslate.reporteC;
            var dataCopy = JSON.parse(JSON.stringify(this.ventaProducto.dataComisiones));
                        
            this.formatearGridReporteIngresos(dataCopy, n);
            this.exportXlsTableView(dataCopy, this.gridComisiones.columnDefs, titulo);
        }
        if(n==5){
            var titulo = this.reporteVentaProductoTranslate.reporteM;
            var dataCopy = JSON.parse(JSON.stringify(this.ventaProducto.dataMarca));
                        
            this.formatearGridReporteIngresos(dataCopy, n);
            this.exportXlsTableView(dataCopy, this.gridMarca.columnDefs, titulo);
        }
        if(n==6){
            var titulo = this.reporteVentaProductoTranslate.reporteP;
            var dataCopy = JSON.parse(JSON.stringify(this.ventaProducto.dataProductoModal));
                        
            this.formatearGridReporteIngresos(dataCopy, n);
            this.exportXlsTableView(dataCopy, this.gridProductoModal.columnDefs, titulo);
        }
        if(n==7){
            var titulo = this.reporteVentaProductoTranslate.reportePersonal;
            var dataCopy = JSON.parse(JSON.stringify(this.ventaProducto.dataComisionesPersonal));
                        
            this.formatearGridReporteIngresos(dataCopy, n);
            this.exportXlsTableView(dataCopy, this.gridComisionesPersonal.columnDefs, titulo);
        }
        if(n==8){
            var titulo = this.reporteVentaProductoTranslate.reporteD;
            var dataCopy = JSON.parse(JSON.stringify(this.ventaProducto.dataDescuentos));
                        
            this.formatearGridReporteIngresos(dataCopy, n);
            this.exportXlsTableView(dataCopy, this.gridDescuentos.columnDefs, titulo);
        }
        if(n==9){
            var titulo: any = "Método de Pagos";
            var dataCopy = JSON.parse(JSON.stringify(this.dataMetodoPago));
                        
            this.formatearGridReporteIngresos(dataCopy, n);
            this.exportXlsTableView(dataCopy, this.gridMetodoPago.columnDefs, titulo);
        }
        if(n==10){
            var titulo: any = "Cuentas por Cobrar";
            var dataCopy = JSON.parse(JSON.stringify(this.ventaProducto.dataCuentasxCobrar));
                        
            this.formatearGridReporteIngresos(dataCopy, n);
            this.exportXlsTableView(dataCopy, this.gridCuentasCobrar.columnDefs, titulo);
        }
    };

    exportXlsTableView(dataArray: any, columnas: any, nameExcel: any) {
        if (dataArray.length > 0) {
            var dataGridOptionsExport = this.formatJSONData(columnas, dataArray);
            this.drawTable(dataGridOptionsExport, nameExcel);
        } else {
            var msj = this.reporteVentaProductoTranslate.noDatos;
            this.ventaProducto_modalNoDatos(msj); 
        }
    };

    formatJSONData(columns: any, data: any) {
        var i = 0;
        var lenght = 0;
        var str = "";
        this.ventaProducto.headers = [];
        this.ventaProducto.dataGridOptionsExport = [];
        columns.forEach((col: any) =>{
            var colString = "";
            var element: any = {};
            if (col.name != undefined) {
                element.name = col.name;
                element.displayName = col.header;
                this.ventaProducto.headers.push(element);
            }
        });

        data.forEach((evento: any) => {
            var reg = '{';
            var colIndex = 0;
            columns.forEach((col: any) => {
                if (evento[col.name] !== undefined || evento[col.name] == null) {
                    if(evento[col.name] == null){
                        var espaciovacio = " ";
                        reg += "\"" + col.header + "\"" + ":" + "\"" + espaciovacio.toString().split('"').join('\'') + "\",";
                    }else{
                        reg += "\"" + col.header + "\"" + ":" + "\"" + evento[col.name.toString()].toString().split('"').join('\'') + "\",";
                    }
                        
                }
            });
            reg = reg.substring(0, reg.length - 1);
            if ((lenght + 1) != data.length && (lenght + 1) != 0) {
                reg += "},";
            }
            else {
                reg += "}";
            }
            str += reg;
            lenght++;
        });
        var jsonObj = $.parseJSON('[' + str.replace(/(?:\r\n|\r|\n)/g, ' ') + ']');
        return jsonObj;
    };

    drawTable(data: any, nameExcel: any) {
        var table = '<table><tr>';
        var headersString = "";
        this.ventaProducto.headers.forEach((header: any) => {
            if (header.name != "Acciones") {
                headersString += '<th>' + header.displayName + '</th>';
            }
        });
        table += headersString + "</tr>";
        var index = 0;
        data.forEach((row: any) => {
            var dataRow = this.drawRow(index, row);
            table += dataRow;
        });
        table += "</table>";
        var ebi_excelTable: any = document.getElementById("excelTable");
        ebi_excelTable.innerHTML = table;
        var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        //var isFirefox = typeof InstallTrigger !== 'undefined'; DUDA
        if (isSafari) {
            var blob = new Blob([table], { type: "application/vnd.ms-excel  charset=UTF-8" });
            saveAs(blob, nameExcel);
        } else {
            var blob = new Blob(["\ufeff", table]);
            //var blob = new Blob([table], { type: "text/html;  charset=UTF-8" });
            saveAs(blob, nameExcel + ".xls");
        }
    };

    drawRow(i: any, dataRow: any) {
        var value = '';
        var row = "<tr>";
        if ((i % 2) == 0) {
            this.ventaProducto.headers.forEach((elem: any) => {
                if (dataRow[elem.displayName] == undefined) {
                    value = '';
                }
                else {
                    value = dataRow[elem.displayName];
                }
                if (value.length > 0) {
                    row += '<td>' + value + '</td>';
                }
            });
        } else {
            this.ventaProducto.headers.forEach((elem: any) => {
                if (dataRow[elem.displayName] == undefined) {
                    value = '';
                }
                else {
                    value = dataRow[elem.displayName];
                }
                row += '<td>' + value + '</td>';
            });
        }
        row += "</tr>";
        return row;
    };

    // ----------------------------------------------------- EXPORTAR A CSV ----------------------------------------------------
    exportToCSV(n: any) {
        //Cambiar las siguientes lineas acorde a la pantalla que requiera esta funcionalidad
        // 1 - Grid Productos
        // 2 - Grid Servicios
        // 3 - Modal Ventas
        // 4 - Modal Comisiones
        // 5 - Modal Marca
        // 6 - Modal Producto
        // 7 - Modal Personal
        // 8 - Modal Descuentos
        // 9 - Modal Método Pago
        // 10 - Modal Cuentas x Cobrar
        this.ventaProducto_declararGrids();

        if(n==1){
            var titulo = this.reporteVentaProductoTranslate.reporteVP;
            var dataCopy = JSON.parse(JSON.stringify(this.ventaProducto.dataProductos));

            this.formatearGridReporteIngresos(dataCopy, n);
            this.exportCsvTableView(dataCopy, this.gridProductos.columnDefs, titulo);
        }
        if(n==2){
            var titulo = this.reporteVentaProductoTranslate.reporteS;
            var dataCopy = JSON.parse(JSON.stringify(this.ventaProducto.dataServicios));

            this.formatearGridReporteIngresos(dataCopy, n);
            this.exportCsvTableView(dataCopy, this.gridServicios.columnDefs, titulo);
        }
        if(n==3){
            function compareProperty(a: any, b: any) {
                return (a || b) ? (!a ? -1 : !b ? 1 : a.localeCompare(b)) : 0;
            }

            function compare(a: any, b: any) {
                return compareProperty(a.fecha, b.fecha) || compareProperty(a.folio, b.folio);
            }

            var titulo = this.reporteVentaProductoTranslate.reporteV;
            var dataCopy = JSON.parse(JSON.stringify(this.ventaProducto.dataVentasGrid));
            
            dataCopy.push({cantidad:"", cliente : "", comision : "", costo : "", esProducto : "", fecha : "", folio : "", idCita : "", idPersonal : "",
                personal : "", presentacion : "", producto : "", servicio : "", tipo : "", utilidad : "", ventaTotal : "" 
            });

            dataCopy.push({cantidad:" ", cliente : " ", comision : this.reporteVentaProductoTranslate.comision, costo : this.producto.costo, esProducto : " ", fecha : " ", folio : " ", idCita : " ", idPersonal : " ",
                personal : " ",  presentacion : " ", producto : " ", servicio : " ", tipo : " ", utilidad : this.reporteVentaProductoTranslate.utilidad, ventaTotal : this.reporteVentaProductoTranslate.total 
            });

            dataCopy.push({cantidad:" ", cliente : " ", comision : this.ventaProducto.ventasModalComisionTotal, costo : this.ventaProducto.ventasModalCosto, esProducto: " ", fecha : " ", folio : " ", idCita : " ", idPersonal : " ",
                personal : " ", presentacion : " ", producto : " ", servicio : " ", tipo : " ", utilidad : this.ventaProducto.ventasModalUtilidadTotal, ventaTotal : this.ventaProducto.ventasModalTotal 
            });

            this.formatearGridReporteIngresos(dataCopy, n);
            this.exportCsvTableView(dataCopy, this.gridVentas.columnDefs, titulo);
        }
        if(n==4){
            var titulo = this.reporteVentaProductoTranslate.reporteC;
            var dataCopy = JSON.parse(JSON.stringify(this.ventaProducto.dataComisiones));

            this.formatearGridReporteIngresos(dataCopy, n);
            this.exportCsvTableView(dataCopy, this.gridComisiones.columnDefs, titulo);
        }
        if(n==5){
            var titulo = this.reporteVentaProductoTranslate.reporteM;
            var dataCopy = JSON.parse(JSON.stringify(this.ventaProducto.dataMarca));

            this.formatearGridReporteIngresos(dataCopy, n);
            this.exportCsvTableView(dataCopy, this.gridMarca.columnDefs, titulo);
        }
        if(n==6){
            var titulo = this.reporteVentaProductoTranslate.reporteP;
            var dataCopy = JSON.parse(JSON.stringify(this.ventaProducto.dataProductoModal));

            this.formatearGridReporteIngresos(dataCopy, n);
            this.exportCsvTableView(dataCopy, this.gridProductoModal.columnDefs, titulo);
        }
        if(n==7){
            var titulo = this.reporteVentaProductoTranslate.reportePersonal;
            var dataCopy = JSON.parse(JSON.stringify(this.ventaProducto.dataComisionesPersonal));
            
            this.formatearGridReporteIngresos(dataCopy, n);
            this.exportCsvTableView(dataCopy, this.gridComisionesPersonal.columnDefs, titulo);
        }
        if(n==8){
            var titulo = this.reporteVentaProductoTranslate.reporteD;
            var dataCopy = JSON.parse(JSON.stringify(this.ventaProducto.dataDescuentos));

            this.formatearGridReporteIngresos(dataCopy, n);
            this.exportCsvTableView(dataCopy, this.gridDescuentos.columnDefs, titulo);
        }
        if(n==9){
            var titulo: any = "Método de pagos";
            var dataCopy = JSON.parse(JSON.stringify(this.dataMetodoPago));

            this.formatearGridReporteIngresos(dataCopy, n);
            this.exportCsvTableView(dataCopy, this.gridMetodoPago.columnDefs, titulo);
        }
        if(n==10){
            var titulo: any = "Cuentas por Cobrar";
            var dataCopy = JSON.parse(JSON.stringify(this.ventaProducto.dataCuentasxCobrar));
            
            this.formatearGridReporteIngresos(dataCopy, n);
            this.exportCsvTableView(dataCopy, this.gridCuentasCobrar.columnDefs, titulo);
        }
    };

    formatearGridReporteIngresos(data: any, localizacion: any) {
        this.dataExportar = [];

        if (data.length == 0) {
            var msj = this.reporteVentaProductoTranslate.noDatos;
            this.ventaProducto_modalNoDatos(msj);
            return;
        } 

        switch (localizacion){
            case 1:
                var nombreColumnas = Object.keys(this.ventaProducto.dataProductos[0]);

                for (var i = 0; i < data.length; i++) {
                    var Objeto: any = {};
                    Objeto.producto = data[i].Producto || " ";
                    Objeto.marca = data[i].Marca || " ";
                    Objeto.presentacion = data[i].Presentacion || " ";
                    Objeto.cantidad = data[i]["Cantidad Vendida"] || " ";
                    Objeto.total = data[i]["Total Venta"] || " ";
                    Objeto.existencia = data[i].Existencia || " ";
        
                    var j: any;
                    for (j in nombreColumnas) {
                        if (j > 11) { 
                            if (data[i][nombreColumnas[j]] == null || data[i][nombreColumnas[j]] == undefined) {
                                Objeto[nombreColumnas[j]] = " ";
                            } else {
                                Objeto[nombreColumnas[j]] = data[i][nombreColumnas[j]];
                            }                        
                        }
                    }
                    this.dataExportar.push(Objeto);
                }
            break;
            case 2:
                var nombreColumnas = Object.keys(this.ventaProducto.dataServicios[0]);
                for (var i = 0; i < data.length; i++) {
                    var Objeto: any = {};
                    Objeto.Servicio = data[i].Servicio || " ";
                    Objeto.Personal = data[i].Personal || " ";
                    Objeto.Cantidad = data[i].Cantidad || " ";
                    Objeto.Total = data[i]["Total"] || " ";
        
                    var j: any;
                    for (j in nombreColumnas) {
                        if (j > 11) { 
                            if (data[i][nombreColumnas[j]] == null || data[i][nombreColumnas[j]] == undefined) {
                                Objeto[nombreColumnas[j]] = " ";
                            } else {
                                Objeto[nombreColumnas[j]] = data[i][nombreColumnas[j]];
                            }                        
                        }
                    }
                    this.dataExportar.push(Objeto);
                }
            break;
            case 3:
                var nombreColumnas = Object.keys(this.ventaProducto.dataVentasGrid[0]);
                for (var i = 0; i < data.length; i++) { 
                    var Objeto: any = {};
                    Objeto.tipo = data[i].tipo || " ";
                    Objeto.folio = data[i].folio || " ";
                    Objeto.fecha = data[i].fecha || " ";
                    Objeto.personal = data[i].personal || " ";
                    Objeto.cliente = data[i].cliente || " ";
                    Objeto.referencia = data[i].referencia || " ";
                    Objeto.producto = data[i].producto || " ";
                    Objeto.presentacion = data[i].presentacion || " ";
                    Objeto.servicio = data[i].servicio || " ";
                    Objeto.numPaquete = data[i].numPaquete || " ";
                    Objeto.cantidad = data[i].cantidad || " ";
                    Objeto.ventaTotal = data[i].ventaTotal || " ";
                    Objeto.totalAbono = data[i].totalAbono || " ";
                    Objeto.comision = data[i].comision || " ";
                    Objeto.costo = data[i].costo || " ";
                    Objeto.utilidad = data[i].utilidad || " ";
        
                    var j: any;
                    for (j in nombreColumnas) {
                        if (j > 11) { 
                            if (data[i][nombreColumnas[j]] == null || data[i][nombreColumnas[j]] == undefined) {
                                Objeto[nombreColumnas[j]] = " ";
                            } else {
                                Objeto[nombreColumnas[j]] = data[i][nombreColumnas[j]];
                            }                        
                        }
                    }
                    this.dataExportar.push(Objeto);
                }
            break;
            case 4:
                var nombreColumnas = Object.keys(this.ventaProducto.dataComisiones[0]);
                for (var i = 0; i < data.length; i++) {
                    var Objeto: any = {};
                    Objeto.vendedor = data[i].vendedor || " ";
                    Objeto.cantidad = data[i].cantidad || " ";
                    Objeto.ventaTotal = data[i].ventaTotal || " ";
                    Objeto.comision = data[i].comision || " ";
                    Objeto.utilidad = data[i].utilidad || " ";
        
                    var j: any;
                    for (j in nombreColumnas) {
                        if (j > 11) { 
                            if (data[i][nombreColumnas[j]] == null || data[i][nombreColumnas[j]] == undefined) {
                                Objeto[nombreColumnas[j]] = " ";
                            } else {
                                Objeto[nombreColumnas[j]] = data[i][nombreColumnas[j]];
                            }                        
                        }
                    }
                    this.dataExportar.push(Objeto);
                }
            break;
            case 5:
                var nombreColumnas = Object.keys(this.ventaProducto.dataMarca[0]);
                for (var i = 0; i < data.length; i++) {
                    var Objeto: any = {};
                    Objeto.marca = data[i].marca || " ";
                    Objeto.producto = data[i].producto || " ";
                    Objeto.presentacion = data[i].presentacion || " ";
                    Objeto.fecha = data[i].fecha || " ";
                    Objeto.cliente = data[i].cliente || " ";
                    Objeto.vendedor = data[i].vendedor || " ";
                    Objeto.cantidad = data[i].cantidad || " ";
                    Objeto.ventaTotal = data[i].ventaTotal || " ";
                    Objeto.totalAbono = data[i].totalAbono || " ";
                    Objeto.comision = data[i].comision || " ";
                    Objeto.costo = data[i].costo || " ";
                    Objeto.utilidad = data[i].utilidad || " ";
        
                    var j: any;
                    for (j in nombreColumnas) {
                        if (j > 11) { 
                            if (data[i][nombreColumnas[j]] == null || data[i][nombreColumnas[j]] == undefined) {
                                Objeto[nombreColumnas[j]] = " ";
                            } else {
                                Objeto[nombreColumnas[j]] = data[i][nombreColumnas[j]];
                            }                        
                        }
                    }
                    this.dataExportar.push(Objeto);
                }
            break;
            case 6:
                var nombreColumnas = Object.keys(this.ventaProducto.dataProductoModal[0]);
                for (var i = 0; i < data.length; i++) {
                    var Objeto: any = {};
                    Objeto.marca = data[i].marca || " ";
                    Objeto.producto = data[i].producto || " ";
                    Objeto.fecha = data[i].fecha || " ";
                    Objeto.cliente = data[i].cliente || " ";
                    Objeto.vendedor = data[i].vendedor || " ";
                    Objeto.cantidad = data[i].cantidad || " ";
                    Objeto.ventaTotal = data[i].ventaTotal || " ";
                    Objeto.totalAbono = data[i].totalAbono || " ";
                    Objeto.comision = data[i].comision || " ";
                    Objeto.costo = data[i].costo || " ";
                    Objeto.utilidad = data[i].utilidad || " ";
        
                    var j: any;
                    for (j in nombreColumnas) {
                        if (j > 11) { 
                            if (data[i][nombreColumnas[j]] == null || data[i][nombreColumnas[j]] == undefined) {
                                Objeto[nombreColumnas[j]] = " ";
                            } else {
                                Objeto[nombreColumnas[j]] = data[i][nombreColumnas[j]];
                            }                        
                        }
                    }
                    this.dataExportar.push(Objeto);
                }
            break;
            case 7:
                var nombreColumnas = Object.keys(this.ventaProducto.dataComisionesPersonal[0]);
                //var nombreColumnas = ["Marca", "Producto", "Servicio", "Presentación", "Fecha", "Cliente", "Cantidad", "Unidades Vendidas", "Total", "Total Abono", "Comisión", "Utilidad"];
                for (var i = 0; i < data.length; i++) {
                    var Objeto: any = {};
                    Objeto.marca = data[i].marca || " ";
                    Objeto.producto = data[i].producto || " ";
                    Objeto.servicio = data[i].servicio || " ";
                    Objeto.presentacion = data[i].presentacion || " ";
                    Objeto.fecha = data[i].fecha || " ";
                    Objeto.cliente = data[i].cliente || " ";
                    Objeto.cantidad = data[i].cantidad || " ";
                    Objeto.ventaTotal = data[i].ventaTotal || " ";
                    Objeto.totalAbono = data[i].totalAbono || " ";
                    Objeto.comision = data[i].comision || " ";
                    Objeto.utilidad = data[i].utilidad || " ";
        
                    var j: any;
                    for (j in nombreColumnas) {
                        if (j > 11) { 
                            if (data[i][nombreColumnas[j]] == null || data[i][nombreColumnas[j]] == undefined) {
                                Objeto[nombreColumnas[j]] = " ";
                            } else {
                                Objeto[nombreColumnas[j]] = data[i][nombreColumnas[j]];
                            }                        
                        }
                    }
                    this.dataExportar.push(Objeto);
                }
            break;
            case 8:
                var nombreColumnas = Object.keys(this.ventaProducto.dataDescuentos[0]);
                for (var i = 0; i < data.length; i++) {
                    var Objeto: any = {};
                    Objeto.folioServicio = data[i].folioServicio || " ";
                    Objeto.fechaCita = data[i].fechaCita || " ";
                    Objeto.Personal = data[i].Personal || " ";
                    Objeto.cliente = data[i].cliente || " ";
                    Objeto.Servicio = data[i].Servicio || " ";
                    Objeto.Total = data[i].Total || " ";
                    Objeto.totalAbono = data[i].totalAbono || " ";
                    Objeto.promocion = data[i].promocion || " ";
                    Objeto.descPromocion = data[i].descPromocion || " ";
                    Objeto.descManual = data[i].descManual || " ";
                    Objeto.comision = data[i].comision || " ";
                    Objeto.utilidad = data[i].utilidad || " ";
        
                    var j: any;
                    for (j in nombreColumnas) {
                        if (j > 11) { 
                            if (data[i][nombreColumnas[j]] == null || data[i][nombreColumnas[j]] == undefined) {
                                Objeto[nombreColumnas[j]] = " ";
                            } else {
                                Objeto[nombreColumnas[j]] = data[i][nombreColumnas[j]];
                            }                        
                        }
                    }
                    this.dataExportar.push(Objeto);
                }
            break;
            case 9:
                var nombreColumnas = Object.keys(this.dataMetodoPago[0]);
                for (var i = 0; i < data.length; i++) {
                    var Objeto: any = {};
                    Objeto.descripcion = data[i].descripcion || " ";
                    Objeto.folio = data[i].folio || " ";
                    Objeto.fechaPago = data[i].fechaPago || " ";
                    Objeto.Cliente = data[i].Cliente || " ";
                    Objeto.Pago = data[i].Pago || " ";
        
                    var j: any;
                    for (j in nombreColumnas) {
                        if (j > 11) { 
                            if (data[i][nombreColumnas[j]] == null || data[i][nombreColumnas[j]] == undefined) {
                                Objeto[nombreColumnas[j]] = " ";
                            } else {
                                Objeto[nombreColumnas[j]] = data[i][nombreColumnas[j]];
                            }                        
                        }
                    }
                    this.dataExportar.push(Objeto);
                }
            break;
            case 10:
                var nombreColumnas = Object.keys(this.ventaProducto.dataCuentasxCobrar[0]);
                for (var i = 0; i < data.length; i++) {
                    var Objeto: any = {};
                    Objeto.cliente = data[i].cliente || " ";
                    Objeto.telefono = data[i].telefono || " ";
                    Objeto.saldopendiente = data[i].saldopendiente || " ";
                    Objeto.folio_caja_original = data[i].folio_caja_original || " ";
                    Objeto.fecha = data[i].fecha || " ";
                    Objeto.usuario = data[i].usuario || " ";
        
                    var j: any;
                    for (j in nombreColumnas) {
                        if (j > 11) { 
                            if (data[i][nombreColumnas[j]] == null || data[i][nombreColumnas[j]] == undefined) {
                                Objeto[nombreColumnas[j]] = " ";
                            } else {
                                Objeto[nombreColumnas[j]] = data[i][nombreColumnas[j]];
                            }                        
                        }
                    }
                    this.dataExportar.push(Objeto);
                }
            break;
        }

    }

    exportCsvTableView(dataArray: any, columnas: any, nameCSV: any) {
        if (dataArray.length > 0) {
            var dataGridOptionsExport = this.formatJSONDataCSV(columnas, dataArray);
            this.drawTableCSV(dataGridOptionsExport, nameCSV);
        } else {
            var msj = this.reporteVentaProductoTranslate.noDatos;
            this.ventaProducto_modalNoDatos(msj);
        }
    };

    formatJSONDataCSV(columns: any, data: any) {
        var i = 0;
        var lenght = 0;
        var str = "";
        this.headers = [];
        this.dataGridOptionsExport = [];
        columns.forEach((col: any) => {
            var colString = "";
            var element: any = {};
            if (col.name != undefined) {
                element.name = col.name;
                element.displayName = col.header;
                this.headers.push(element);
            }
        });

        data.forEach((evento: any) => {
            var reg = '{';
            var colIndex = 0;
            columns.forEach((col: any) => {
                if (evento[col.name] !== undefined || evento[col.name] == null) {
                    if(evento[col.name] == null){
                        var espaciovacio = " ";
                        reg += "\"" + col.header + "\"" + ":" + "\"" + espaciovacio.toString().split('"').join('\'') + "\",";
                    }else{
                        reg += "\"" + col.header + "\"" + ":" + "\"" + evento[col.name.toString()].toString().split('"').join('\'') + "\",";
                    }
                        
                }
            });
            reg = reg.substring(0, reg.length - 1);
            if ((lenght + 1) != data.length && (lenght + 1) != 0) {
                reg += "},";
            }
            else {
                reg += "}";
            }
            str += reg;
            lenght++;
        });
        var jsonObj = $.parseJSON('[' + str.replace(/(?:\r\n|\r|\n)/g, ' ') + ']');
        return jsonObj;
    };

    drawTableCSV(data: any, nameCSV: any) {
        var table = '';
        var headersString = "";
        var contador = 1;
        var longitudCol = this.headers.length;
        this.headers.forEach((header: any) => {
            if (contador != longitudCol) {
                headersString += header.displayName + ',';
            }else{
                headersString += header.displayName;
            }
            contador++;
        });
        table += headersString + "\r\n";
        var index = 0;
        data.forEach((row: any) => {
            var dataRow = this.drawRowCSV(index, row);
            table += dataRow;
        });
        //No hay problema si se usa el mismo div, CAMBIAR EL ID POR EL DIV USADO EN SU PANTALLA
        var ebi_excelTable : any = document.getElementById("excelTable");
        ebi_excelTable.innerHTML = table;
        var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        //var isFirefox = typeof InstallTrigger !== 'undefined'; DUDA
        var blob = new Blob(["\ufeff", table]);
        //var blob = new Blob([table], { type: "text/plain; charset=utf8;" });
        saveAs(blob, nameCSV + ".csv");
    };

    drawRowCSV(i: any, dataRow: any) {
        var value = '';
        var row = "";		            
        if ((i % 2) == 0) {
            var contador1 = 1;
            var longitudCol1 = this.headers.length;
            this.headers.forEach((elem: any) => {		                    
                if (contador1 != longitudCol1) {
                    if (dataRow[elem.displayName] == undefined) {
                        value = '';
                    }
                    else {
                        value = dataRow[elem.displayName];
                    }
                    if (value.length > 0) {
                        row += value + ',';
                    }
                }else{
                    if (dataRow[elem.displayName] == undefined) {
                        value = '';
                    }
                    else {
                        value = dataRow[elem.displayName];
                    }
                    if (value.length > 0) {
                        row += value;
                    }
                }
                contador1++;
            });
        } else {
            var contador2 = 1;
            var longitudCol2 = this.headers.length;
            this.headers.forEach((elem: any) => {
                if (contador2 != longitudCol2) {		                        
                    if (dataRow[elem.displayName] == undefined) {
                        value = '';
                    }
                    else {
                        value = dataRow[elem.displayName];
                    }
                    row += value + ',';
                }else{		                        
                    if (dataRow[elem.displayName] == undefined) {
                        value = '';
                    }
                    else {
                        value = dataRow[elem.displayName];
                    }
                    row += value;
                }
                contador2++;
            });
        }
        row += "\r\n";
        return row;
    };

    // ----------------------------------------------------- ELIMINAR CITA -----------------------------------------------------
    confirmarEliminar(){
        //$('#hide-popover').off().click();
        this.modales.modalConfirmarEliminar.show();
        $("#modal-confirmarEliminar .modal-body").html('<span class="title">' + "¿Está seguro de dar de baja esta cita?" + '</span>');
    }

    eliminarCita(){
        var params: any = {};
        params.idCita = this.idCita;
        params.observaciones = "Ajuste por Eliminación de Cita";

        this._backService.HttpPost("procesos/agenda/Agenda/eliminarCita", {}, params).subscribe((response: string) => {
            // $('.modal').modal('hide');
            // $('.modal-backdrop').remove();
            this.ventaProducto_consultaGeneral();
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

    // ------------------------------------------------- ELIMINAR VENTA DIRECTA ------------------------------------------------
    confirmarEliminarVentaProducto(){
        //$('#hide-popover').off().click();
        this.modales.modalConfirmarEliminarVentaDirecta.show();
        $("#modal-confirmarEliminarVentaDirecta .modal-body").html('<span class="title">' + "¿Está seguro de eliminar está venta?" + '</span>');
    }

    eliminarVentaProducto(){
        this._pantallaServicio.mostrarSpinner();
        var params: any = {};
        params.idPagoClienteProducto = this.idPagoClienteProducto;

        this._backService.HttpPost("procesos/agenda/Agenda/eliminarVentaProductoDirecta", {}, params).subscribe((response: string) => {
            if(response == "0"){
                this._toaster.error("La venta no puede ser eliminada porque el Paquete tiene citas asignadas");
            }
            if(response == "1"){
                // $('.modal').modal('hide');
                // $('.modal-backdrop').remove();
                this.ventaProducto_consultaGeneral();
            }

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
            this._toaster.error(this.sessionTraslate.errorEliminar);
        });
    }

    // ----------------------------------------------------- FACTURACIÓN ----------------------------
    // Carga de opciones del dropdown list de las sucursales
    cargarSucursales(opcion: any) {
        this._backService.HttpPost("catalogos/factura/consultaSucursal", {}, {}).subscribe((response: string) => {
            this.dataSucursales = eval(response);
            if (opcion == 1) {
                this.setearDatosFiscales();
            } else {
                this.setearFactura();
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
    };

    // Carga de opciones del dropdown list de regimen fiscal 
    cargarRegimenFiscal(fisica: any, moral: any) {
        var params: any = {};
        params.fisica = fisica;
        params.moral = moral;

        this._backService.HttpPost("catalogos/factura/cargarRegimenFiscal", {}, params).subscribe((response: string) => {
            this.dataRegimen = eval(response);
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

    //Carga los regimenes fiscales en base a la sucursal seleccionada
    actualizarSucursal(idSucursal: any) {
        var params: any = {};
        params.idSucursal = idSucursal;

        this._backService.HttpPost("catalogos/factura/cargarEmisor", {}, params).subscribe((response: string) => {
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

    factura(){
        this.idPagoClienteProducto = "";
        this.citaFacturar = this.ticket.idCita;
        var params: any = {};
        params.idCita = this.ticket.idCita;
        this._pantallaServicio.mostrarSpinner();

        this._backService.HttpPost("catalogos/factura/datosFiscales", {}, params).subscribe((response: string) => {
            switch (response) {
                case "NIFC":
                    var idCliente = this.ticket.idCliente;
                    var w = 1000;
                    var h = 530;
                    var left = Number((screen.width / 2) - (w / 2));
                    var tops = Number((screen.height / 2) - (h / 2));
                    var lang = this._pantallaServicio.idioma;
                    var caracteristicas = "height=" + h + ",width=" + w + ",scrollTo,resizable=0,scrollbars=1,location=1," + "top=" + tops + ", left=" + left;
                    var nueva = window.open('/informacionFiscalCliente.html#/' + idCliente + '&' + this.ticket.idCita + '&' + lang, 'Popup', caracteristicas);
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
                        this.dataFacturaDetalle = [];
                        this.dataConceptos = null;
                        this.cargarSucursales(2);
                    } else {
                        this.idFactura = null;
                        this.dataFactura = null;
                        this.dataFacturaDetalle = null;
                        this.dataConceptos = null;
                        this.cargarSucursales(1);
                    }
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
    };

    facturaProducto(){
        if (this.ticket.idCliente != null && this.ticket.idCliente != undefined && this.ticket.idCliente != "") {
            var params: any = {};
            params.idPagoClienteProducto = this.idPagoClienteProducto;
            this._pantallaServicio.mostrarSpinner();

            this._backService.HttpPost("catalogos/factura/datosFiscalesProducto", {}, params).subscribe((response: string) => {
                switch (response) {
                    case "NIFC":
                        var idCliente = this.ticket.idCliente;
                        var w = 1000;
                        var h = 530;
                        var left = Number((screen.width / 2) - (w / 2));
                        var tops = Number((screen.height / 2) - (h / 2));
                        var lang = this._pantallaServicio.idioma;
                        var caracteristicas = "height=" + h + ",width=" + w + ",scrollTo,resizable=0,scrollbars=1,location=1," + "top=" + tops + ", left=" + left;
                        var nueva = window.open('/informacionFiscalCliente.html#/' + idCliente + '&' + '0' + '&' + lang, 'Popup', caracteristicas);
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
                            this.dataFacturaDetalle = [];
                            this.dataConceptos = null;
                            this.cargarSucursales(2);
                        } else {
                            this.idFactura = null;
                            this.dataFactura = null;
                            this.dataFacturaDetalle = null;
                            this.dataConceptos = null;
                            this.cargarSucursales(1);
                        }
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
        else {
            this.modalInformacionFactura(this.agendaTranslate.noClienteVenta);
            this._pantallaServicio.ocultarSpinner();
        }
    };

    editarFactura(){
        var params: any = {};
        params.idCita = this.citaFacturar;
        params.idFactura = this.idFactura;
        this._pantallaServicio.mostrarSpinner();

        this._backService.HttpPost("catalogos/factura/datosFactura", {}, params).subscribe((response: string) => {
            this.dataFactura = eval(response)[0];
            this.dataFacturaDetalle = eval(response)[1];
            this.dataConceptos = eval(response)[2];
            this.cargarSucursales(2);
            setTimeout(() => {
                this.modales.modalFactura.show();
                this._pantallaServicio.ocultarSpinner();
            }, 5);
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

    conceptosFacturar(){
        if (this.idPagoClienteProducto == null || this.idPagoClienteProducto == undefined || this.idPagoClienteProducto == "") {
            var params: any = {};
            params.idCita = this.citaFacturar;

            this._backService.HttpPost("catalogos/factura/cargarConceptosFacturar", {}, params).subscribe((response: string) => {
                this.dataConceptos = eval(response);
                this.setearConceptos();
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
        else {
            var params: any = {};
            params.idPagoClienteProducto = this.idPagoClienteProducto;

            this._backService.HttpPost("catalogos/factura/cargarConceptosFacturarProducto", {}, params).subscribe((response: string) => {
                this.dataConceptos = eval(response);
                this.setearConceptos();
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
    };

    setearConceptos(){
        this.facturacion.listaFacturar = [];
        this.facturacion.subtotal = 0.0;
        this.facturacion.total = 0.0;
        this.facturacion.impuestoIva = 0.0;
        this.facturacion.subtotalMostrar = 0.0;
        this.facturacion.totalMostrar = 0.0;
        this.facturacion.impuestoIvaMostrar = 0.0;
        this.facturacion.ivaGeneral = (this.dataFactura) ? this.dataFactura[0].factor_iva : null;
        if (this.facturacion.ivaGeneral) {
            this.facturacion.aplicaIVA = false;
        }
        var contadorFacturados = 0;
        for (var i = 0 ; i < this.dataConceptos.length; i++) {
            if (this.dataConceptos[i].idServicio !== null) {
                var index = this.facturacion.listaFacturar.filter((item: any) => { 
                    idServicio: this.dataConceptos[i].idServicio 
                })[0];
                /*var index = $filter('filter')(this.facturacion.listaFacturar, { 
                    idServicio: this.dataConceptos[i].idServicio 
                }, true)[0];*/
                //if (index) {  //Se oculta porque tiene error la funcionalidad de acumular los renglones iguales sobre todo cuando el monto total es distinto en cada uno
                if (false) {
                    this.facturacion.listaFacturar[this.facturacion.listaFacturar.indexOf(index)].cantidad++;
                    this.facturacion.listaFacturar[this.facturacion.listaFacturar.indexOf(index)].importe =
                            parseFloat((this.facturacion.listaFacturar[this.facturacion.listaFacturar.indexOf(index)].cantidad *
                            this.facturacion.listaFacturar[this.facturacion.listaFacturar.indexOf(index)].valorU).toFixed(6));
                    this.facturacion.listaFacturar[this.facturacion.listaFacturar.indexOf(index)].importeMostrar = Math.round(this.facturacion.listaFacturar[this.facturacion.listaFacturar.indexOf(index)].importe * 100) / 100
                    this.facturacion.listaFacturar[this.facturacion.listaFacturar.indexOf(index)].totalImporte = this.facturacion.listaFacturar[this.facturacion.listaFacturar.indexOf(index)].importeMostrar;
                    this.facturacion.subtotal += (this.facturacion.listaFacturar[this.facturacion.listaFacturar.indexOf(index)].yaFacturado || !this.facturacion.listaFacturar[this.facturacion.listaFacturar.indexOf(index)].seFactura) ? 0 : this.facturacion.listaFacturar[this.facturacion.listaFacturar.indexOf(index)].valorU;
                    this.facturacion.subtotalMostrar += (this.facturacion.listaFacturar[this.facturacion.listaFacturar.indexOf(index)].yaFacturado || !this.facturacion.listaFacturar[this.facturacion.listaFacturar.indexOf(index)].seFactura) ? 0 : this.facturacion.listaFacturar[this.facturacion.listaFacturar.indexOf(index)].valorU;
                } else {
                    var yaFacturado = false;
                    var seFactura = false;
                    var facturado = undefined;
                    if (this.dataFacturaDetalle) {
                        facturado = this.dataFacturaDetalle.filter((item: any) => { 
                            idServicio: this.dataConceptos[i].idServicio
                        })[0];
                        /*facturado = $filter('filter')(this.dataFacturaDetalle, { 
                            idServicio: this.dataConceptos[i].idServicio 
                        }, true)[0];*/
                        if (facturado) {
                            seFactura = true;
                            if (facturado.facturado != 0) {
                                contadorFacturados++;
                            }
                            (facturado.facturado != 0 || (parseFloat(this.dataConceptos[i].montoTotal) < 0.01)) ? yaFacturado = true : yaFacturado = false;
                        }
                        else {
                            (parseFloat(this.dataConceptos[i].montoTotal) < 0.01) ? yaFacturado = true : yaFacturado = false;
                        }
                    }
                    else {
                        seFactura = true;
                    }
                    this.facturacion.listaFacturar.push({
                        id: i,
                        idServicio: (facturado) ? facturado.idServicio : this.dataConceptos[i].idServicio,
                        descripcion: (facturado) ? facturado.descripcion : this.dataConceptos[i].nombreServicio,
                        cveUnidad: (facturado) ? facturado.idUnidadMedida : this.dataConceptos[i].idUnidadMedidaServicio,
                        cveProdServ: (facturado) ? facturado.idClaveProdServ : this.dataConceptos[i].idClaveProdServServicio,
                        cantidad: 1,
                        valorU: (facturado) ? parseFloat(((facturado.importe + facturado.monto_iva) / facturado.cantidad).toFixed(6)) : parseFloat((this.dataConceptos[i].montoTotal).toFixed(6)),
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
                        totalImporte: (facturado) ? parseFloat((facturado.importe + facturado.monto_iva).toFixed(6)) : parseFloat((this.dataConceptos[i].montoTotal).toFixed(6)),
                        yaFacturado: yaFacturado,
                        idInventarioPresentacion: "",
                        idInventarioProducto: "",
                        aplicaIVA: (facturado) ? ((facturado.factor_iva > 0.000000) ? true : false) : false
                    });
                    var servicioId = this.facturacion.listaFacturar.filter((item: any) => { 
                        id: i
                    })[0];
                    /*var servicioId = $filter('filter')(this.facturacion.listaFacturar, { 
                        id: i 
                    }, true)[0];*/
                    this.facturacion.subtotal += (servicioId.yaFacturado || !servicioId.seFactura) ? 0 : servicioId.importe;
                    this.facturacion.impuestoIva += (servicioId.yaFacturado || !servicioId.seFactura) ? 0 : servicioId.ivaImporte;
                    this.facturacion.subtotalMostrar += (servicioId.yaFacturado || !servicioId.seFactura) ? 0 : servicioId.importeMostrar;
                    this.facturacion.impuestoIvaMostrar += (servicioId.yaFacturado || !servicioId.seFactura) ? 0 : servicioId.ivaImporteMostrar;
                }
            } else if (this.dataConceptos[i].idInventarioPresentacion !== null) {
                var yaFacturado = false;
                var seFactura = false;
                var facturado = undefined;
                if (this.dataFacturaDetalle) {
                    facturado = this.dataFacturaDetalle.filter((item: any) => { 
                        idInventarioPresentacion: this.dataConceptos[i].idInventarioPresentacion
                    })[0];
                    /*facturado = $filter('filter')(this.dataFacturaDetalle, { 
                        idInventarioPresentacion: this.dataConceptos[i].idInventarioPresentacion 
                    }, true)[0];*/
                    if (facturado) {
                        seFactura = true;
                        if (facturado.facturado != 0) {
                            contadorFacturados++;
                        }
                        (facturado.facturado != 0 || (parseFloat(this.dataConceptos[i].montoTotal) < 0.01)) ? yaFacturado = true : yaFacturado = false;
                    }
                    else {
                        (parseFloat(this.dataConceptos[i].montoTotal) < 0.01) ? yaFacturado = true : yaFacturado = false;
                    }
                }
                else {
                    seFactura = true;
                }
                this.facturacion.listaFacturar.push({
                    id: i,
                    idInventarioPresentacion: (facturado) ? facturado.idInventarioPresentacion : this.dataConceptos[i].idInventarioPresentacion,
                    idInventarioProducto: (facturado) ? facturado.idInventarioProducto : this.dataConceptos[i].idInventarioProducto,
                    descripcion: (facturado) ? facturado.descripcion : this.dataConceptos[i].nombreProducto,
                    cveUnidad: (facturado) ? facturado.idUnidadMedida : this.dataConceptos[i].idUnidadMedidaProducto,
                    cveProdServ: (facturado) ? facturado.idClaveProdServ : this.dataConceptos[i].idClaveProdServProducto,
                    cantidad: (facturado) ? facturado.cantidad : this.dataConceptos[i].cantidadProducto,
                    valorU: (facturado) ? parseFloat(((facturado.importe + facturado.monto_iva) / facturado.cantidad).toFixed(6)) : parseFloat((this.dataConceptos[i].montoTotal / this.dataConceptos[i].cantidadProducto).toFixed(6)),
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
                    totalImporte: (facturado) ? parseFloat((facturado.importe + facturado.monto_iva).toFixed(6)) : parseFloat((this.dataConceptos[i].montoTotal).toFixed(6)),
                    yaFacturado: yaFacturado,
                    idServicio: "",
                    aplicaIVA: (facturado) ? ((facturado.factor_iva > 0.000000) ? true : false) : false
                });
                this.facturacion.subtotal += (this.facturacion.listaFacturar[i].yaFacturado || !this.facturacion.listaFacturar[i].seFactura) ? 0 : this.facturacion.listaFacturar[i].importe;
                this.facturacion.impuestoIva += (this.facturacion.listaFacturar[i].yaFacturado || !this.facturacion.listaFacturar[i].seFactura) ? 0 : this.facturacion.listaFacturar[i].ivaImporte;
                this.facturacion.subtotalMostrar += (this.facturacion.listaFacturar[i].yaFacturado || !this.facturacion.listaFacturar[i].seFactura) ? 0 : this.facturacion.listaFacturar[i].importeMostrar;
                this.facturacion.impuestoIvaMostrar += (this.facturacion.listaFacturar[i].yaFacturado || !this.facturacion.listaFacturar[i].seFactura) ? 0 : this.facturacion.listaFacturar[i].ivaImporteMostrar;
            }

            if (!this.facturacion.listaFacturar[i].seFactura || this.facturacion.listaFacturar[i].yaFacturado) {
                contadorFacturados++;
            }
        }
        this.facturacion.total = (this.facturacion.subtotal + this.facturacion.impuestoIva);
        this.facturacion.totalMostrar = (this.facturacion.subtotalMostrar + this.facturacion.impuestoIvaMostrar);
        if (this.facturacion.listaFacturar.length == contadorFacturados) {//Quiere decir que todos los conceptos de la cita ya han sido facturados
            this.ocultarGuardar = true;
        }
        else {
            this.ocultarGuardar = false;
        }
    }; //Seteamos los conceptos que estan y seran facturados

    setearDatosFiscales(){ //Setea los datos cuando se abren desde la agenda y no cuenta con ninguna factura
        this._backService.HttpPost("catalogos/factura/cargarDatos", {}, {}).subscribe((response: string) => {
            this.dataImpuestoIva = eval(response)[6];
            this.dataformasDePago = eval(response)[2];
            this.datametodosDePago = eval(response)[1];
            this.dataCFDI = eval(response)[0];
            this.dataSerie = eval(response)[4];
            (this.dataSerie.length == 0) ? this.sinSeries = true : this.sinSeries = false;
            this.dataCveProdServ = eval(response)[5];
            this.dataUnidadMedida = eval(response)[3];
            var fisica, moral = 0;
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
            // this.facturacion.receptorCFDI = (this.datosFiscales[1].idDatosFiscalesUsoCFDI == null) ? $filter('filter')(this.dataCFDI, { descripcion: 'Por definir' }, true)[0].idDatosFiscalesUsoCFDI : this.datosFiscales[1].idDatosFiscalesUsoCFDI; DUDA CON ESTOS TRES FILTER
            // this.facturacion.receptorFormaPago = (this.datosFiscales[1].idDatosFiscalesFormaPago == null) ? $filter('filter')(this.dataformasDePago, { descripcion: 'Por definir' }, true)[0].idDatosFiscalesFormaPago : this.datosFiscales[1].idDatosFiscalesFormaPago;
            // this.facturacion.receptorMetodoPago = (this.datosFiscales[1].idDatosFiscalesMetodoPago == null) ? $filter('filter')(this.datametodosDePago, { descripcion: 'Pago en una sola exhibición' }, true)[0].idDatosFiscalesMetodoPago : this.datosFiscales[1].idDatosFiscalesMetodoPago;
            //Datos del emisor y generales
            this.facturacion.emisorSucursal = (this.datosFiscales[0].idSucursal == null) ? "" : this.datosFiscales[0].idSucursal;
            this.facturacion.antiguoemisorSucursal = this.facturacion.emisorSucursal;
            this.facturacion.emisorRegimenFiscal = (this.datosFiscales[0].regimenFiscal == null) ? "" : this.datosFiscales[0].regimenFiscal;
            
            this.modales.modalFactura.show();
            this._pantallaServicio.ocultarSpinner();
            this.conceptosFacturar();
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

    setearFactura(){
        this._backService.HttpPost("catalogos/factura/cargarDatos", {}, {}).subscribe((response: string) => {
            this.dataImpuestoIva = eval(response)[6];
            this.dataformasDePago = eval(response)[2];
            this.datametodosDePago = eval(response)[1];
            this.dataCFDI = eval(response)[0];
            this.dataSerie = eval(response)[4];
            (this.dataSerie.length == 0) ? this.sinSeries = true : this.sinSeries = false;
            this.dataCveProdServ = eval(response)[5];
            this.dataUnidadMedida = eval(response)[3];
            var fisica, moral = 0;
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
    }; //Setea los datos cuando se abren desde listado de documento, o ya existen facturas relacionadas a la cita

    regresarDatosGenerales(){
        this.datosGenerales = false;
        this.conceptos = true;
    };

    next(){
        this.conceptos = false;
        this.datosGenerales = true;
    };

    guardarFacturas(){
        this._pantallaServicio.mostrarSpinner();
        var llevaIVA = false;
        var params: any = {};
        if (this.idPagoClienteProducto == null || this.idPagoClienteProducto == undefined || this.idPagoClienteProducto == "") {
            params.idCita = this.citaFacturar;
        }
        else {
            params.idPagoClienteProducto = this.idPagoClienteProducto;
        }
        params.fechaCreacion = moment().format('YYYY-MM-DD HH:mm:ss');
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
        for (var i = 0; i < this.facturacion.listaFacturar.length; i++) {
            if (this.facturacion.listaFacturar[i].seFactura && !this.facturacion.listaFacturar[i].yaFacturado) {
                params.conceptos.push(this.facturacion.listaFacturar[i]);
            }
        }
        params.factor_iva = (this.facturacion.ivaGeneral) ? this.facturacion.ivaGeneral : "";
        params.guardar = (this.idFactura) ? 0 : 1;//1 = guardar Primera vez, 0 = Cuando edita la factura
        params.idFactura = (this.idFactura) ? this.idFactura : "";

        if (this.idPagoClienteProducto == null || this.idPagoClienteProducto == undefined || this.idPagoClienteProducto == "") {
            this._backService.HttpPost("catalogos/factura/guardarFactura", {}, params).subscribe((response: string) => {
                this._pantallaServicio.ocultarSpinner();
                this.cerrarModalFactura();
                this.modalInformacionFactura("La factura se guardó exitosamente");
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
        else {
            this._backService.HttpPost("catalogos/factura/guardarFacturaProducto", {}, params).subscribe((response: string) => {
                this._pantallaServicio.ocultarSpinner();
                this.cerrarModalFactura();
                this.modalInformacionFactura("La factura se guardó exitosamente");
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
    };

    timbrarFacturas(){
        this._pantallaServicio.mostrarSpinner();
        var llevaIVA = false;
        var params: any = {};

        if (this.idPagoClienteProducto == null || this.idPagoClienteProducto == undefined || this.idPagoClienteProducto == "") {
            params.idCita = this.citaFacturar;
        }
        else {
            params.idPagoClienteProducto = this.idPagoClienteProducto;
        }
        params.fechaCreacion = moment().format('YYYY-MM-DD HH:mm:ss');
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
        params.totalIva = 0.0;
        params.subTotalAntesImpuestos = 0.0;
        for (var i = 0; i < this.facturacion.listaFacturar.length; i++) {
            if (this.facturacion.listaFacturar[i].seFactura && !this.facturacion.listaFacturar[i].yaFacturado) {
                params.conceptos.push(this.facturacion.listaFacturar[i]);

                params.totalIva += Math.round(this.facturacion.listaFacturar[i].ivaImporte * 100) / 100;
                params.subTotalAntesImpuestos += Math.round(this.facturacion.listaFacturar[i].importe * 100) / 100;
            }
        }
        params.factor_iva = (this.facturacion.ivaGeneral) ? this.facturacion.ivaGeneral : "";
        params.guardar = (this.idFactura) ? 0 : 1;//1 = guardar Primera vez, 0 = Cuando edita la factura
        params.idFactura = (this.idFactura) ? this.idFactura : "";

        if (this.idPagoClienteProducto == null || this.idPagoClienteProducto == undefined || this.idPagoClienteProducto == "") {
            this._backService.HttpPost("catalogos/factura/generarFactura", {}, params).subscribe((response: string) => {
                this._pantallaServicio.ocultarSpinner();
                if (response == "True" || response == "true") {
                    this.cerrarModalFactura();
                    this.modalInformacionFactura("La factura se timbró exitosamente");
                } else {
                    this.cerrarModalFactura();
                    this.modalInformacionFactura(response);
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
        else {
            this._backService.HttpPost("catalogos/factura/generarFacturaProducto", {}, params).subscribe((response: string) => {
                this._pantallaServicio.ocultarSpinner();
                if (response == "True" || response == "true") {
                    this.cerrarModalFactura();
                    this.modalInformacionFactura("La factura se timbró exitosamente");
                } else {
                    this.cerrarModalFactura();
                    this.modalInformacionFactura(response);
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
    };

    calcularTotalFactura(index: any, seFactura: any) {
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
    deshabilitarIvaDropDown(index: any) {
        //Aplica iva (Están volteados)
        //True -> No aplica iva
        //False -> Aplica IVA

        //Checar si hay al menos uno seleccionado para saber si habilitar o deshabilitar el dropdown
        this.facturacion.aplicaIVA = true;
        for (var i = 0; i < this.facturacion.listaFacturar.length; i++) {
            if (this.facturacion.listaFacturar[i].aplicaIVA) {
                this.facturacion.aplicaIVA = false;
                break;
            }
        }

        //Si ya no hay ninguno seleccionado, settear el ivaGeneral
        if (this.facturacion.aplicaIVA) {
            this.facturacion.ivaGeneral = null;
        }

        //Cálculos para el subtotal y el total
        //Index para buscar el elemento en el arreglo que seleccionó y aplicarle o desaplicarle el iva
        if (this.facturacion.listaFacturar[index].aplicaIVA) {
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
                this.facturacion.subtotal -= this.facturacion.listaFacturar[index].ivaImporte;
                this.facturacion.impuestoIva += this.facturacion.listaFacturar[index].ivaImporte;
                this.facturacion.total = (this.facturacion.subtotal + this.facturacion.impuestoIva);
                this.facturacion.subtotalMostrar -= this.facturacion.listaFacturar[index].ivaImporteMostrar;
                this.facturacion.impuestoIvaMostrar += this.facturacion.listaFacturar[index].ivaImporteMostrar;
                this.facturacion.totalMostrar = (this.facturacion.subtotalMostrar + this.facturacion.impuestoIvaMostrar);
            }
        }
            //Le quitó el iva
        else {
            var valor = 0.00;
            this.facturacion.listaFacturar[index].factor_iva = "";
            this.facturacion.subtotal += this.facturacion.listaFacturar[index].ivaImporte;
            this.facturacion.subtotalMostrar += this.facturacion.listaFacturar[index].ivaImporteMostrar;
            this.facturacion.listaFacturar[index].importe += this.facturacion.listaFacturar[index].ivaImporte
            this.facturacion.listaFacturar[index].importeMostrar += (Math.round(this.facturacion.listaFacturar[index].ivaImporte * 100) / 100);
            this.facturacion.impuestoIva -= this.facturacion.listaFacturar[index].ivaImporte;
            this.facturacion.impuestoIvaMostrar -= this.facturacion.listaFacturar[index].ivaImporteMostrar;
            this.facturacion.listaFacturar[index].ivaImporte = 0.000000;
            this.facturacion.listaFacturar[index].ivaImporteMostrar = 0.000000;
            this.facturacion.listaFacturar[index].totalImporte = (this.facturacion.listaFacturar[index].importeMostrar + this.facturacion.listaFacturar[index].ivaImporteMostrar);
            this.facturacion.total = (this.facturacion.subtotal + this.facturacion.impuestoIva);
            this.facturacion.totalMostrar = (this.facturacion.subtotalMostrar + this.facturacion.impuestoIvaMostrar);
        }
    }

    changeIvaGeneral(){
        //Checar cada uno de los detalles a ver si se les aplica el IVA y si no se les calculó ya
        for (var i = 0; i < this.facturacion.listaFacturar.length; i++) {
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

    validarCamposGenerales(){
        var isValid = true;

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

    validarConceptos(opcion: any) {
        var isValid = true;
        for (var i = 0; i < this.facturacion.listaFacturar.length; i++) {
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
            }
        }

        $("#ddlIvaGeneral > div:first-child").attr("style", "outline: none");
        //Validar que haya seleccionado un iva general
        if (!this.facturacion.aplicaIVA) {
            if (!this.facturacion.ivaGeneral) {
                isValid = false;
                $("#ddlIvaGeneral > div:first-child").attr("style", "outline: red solid 1px !important");
                this._toaster.success(this.facturaTranslate.ivaMensaje);
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

    cerrarModalFactura(){
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
        this.sinSeries = false;
        $("#sucursalInput").removeClass("errorCampo");
        $("#regimenFiscalInput").removeClass("errorCampo");
        $("#rfcInput").removeClass("errorCampo");
        $("#formasDePagoSelect").removeClass("errorCampo");
        $("#metodosDePagoSelect").removeClass("errorCampo");
        $("#CFDIInput").removeClass("errorCampo");
        $("#serieFolioInput").removeClass("errorCampo");

        for (var i = 0; i < this.facturacion.listaFacturar.length; i++) {
            if (this.facturacion.listaFacturar[i].seFactura) {
                $("#cveProdServ" + i).removeClass("errorCampo");
                $("#unidad" + i).removeClass("errorCampo");
                $("#impuestos" + i).removeClass("errorCampo");
            }
        }
    }

    modalInformacionFactura(message: any) {
        this.modales.modalInformacionFactura.show();
        $("#modalInformacionFactura .modal-body").html('<span class="title">' + message + '</span>');
    };

    nuevaSerie(){
        this.modales.modalSerie.show();
    };

    // --------------------------------------------------------------------------------- FACTURA SERIE ---------------------------------------------------------------------------------
    dataConsultaFacturaSeries(){
        this._backService.HttpPost("catalogos/factura/consultarFacturaSeries", {}, {}).subscribe((response: string) => {
            this.facturaSeries.data = eval(response);
            for (var i = 0; i < this.facturaSeries.data.length; i++) {
                this.facturaSeries.contador = this.facturaSeries.data[0].contador == '0' ? '1' : this.facturaSeries.data[0].contador;
                this.facturaSeries.minimo = this.facturaSeries.data[0].minimo == null ? "1" : this.facturaSeries.data[0].minimo;
                this.facturaSeries.maximo = this.facturaSeries.data[0].maximo == null ? "100000" : this.facturaSeries.data[0].maximo;
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
    };

    insertarSerie(){
        if (!this.checked) {
            this.facturaSeries.bandGuardar = true;
            this.validarGuardar();
            if (this.facturaSeries.guardar) {
                var existe = this.facturaSeries.data.filter((item: any) => { 
                    nombre: (this.facturaSeries.nombre).toUpperCase() 
                });
                /*var existe = $filter('filter')(this.facturaSeries.data, { 
                    nombre: (this.facturaSeries.nombre).toUpperCase() 
                }, true);*/
                if (existe != 0) {
                    var camposValidos = false;
                    this.facturaSeries.guardar = false;
                    this._toaster.error("La serie ya esta en uso");
                } else {
                    this.checked = true;
                    var params: any = {};
                    params.nombre = this.facturaSeries.nombre;
                    params.descripcion = this.facturaSeries.descripcion;
                    params.contador = this.facturaSeries.contador;
                    params.minimo = parseInt(this.facturaSeries.minimo);
                    params.maximo = parseInt(this.facturaSeries.maximo);

                    this._backService.HttpPost("catalogos/factura/insertarFacturaSeries", {}, params).subscribe((response: string) => {
                        this._backService.HttpPost("catalogos/factura/consultarFacturaSeries", {}, {}).subscribe((response: string) => {
                            this.sinSeries = false;
                                this.dataSerie = eval(response);
                                this.facturaSeries.nombre = "";
                                this.facturaSeries.descripcion = "";
                                this.facturaSeries.contador = "";
                                this.facturaSeries.minimo = "";
                                this.facturaSeries.maximo = "";
                                this.facturaSeries.nombreValido = false;
                                this.facturaSeries.contadorValido = false;
                                this.facturaSeries.minimoValido = false;
                                this.facturaSeries.maximoValido = false;
                                this.facturaSeries.guardar = false;

                                this.modales.modalSerie.hide();
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
            }
        }
    };

    guardar(){
        this.insertarSerie();
    }

    irAAgenda(){
        this._router.navigate(['/procesos/agenda']);
    }

    validarCampos(){
        var valNum = /^-?[0-9]+(?:\.[0-9]+)?$/;
        var valNom = RegExp("^[a-zA-Z áéíóúñÁÉÍÓÚÑüÜ\s]*$");
        var nombre = valNom.test(this.facturaSeries.nombre);
        var contador = valNum.test(this.facturaSeries.contador);
        var minimo = valNum.test(this.facturaSeries.minimo);
        var maximo = valNum.test(this.facturaSeries.maximo);

        //Nombre
        if (!nombre || this.facturaSeries.nombre == "") {
            this.facturaSeries.nombreValido = false;
        }
        else {
            this.facturaSeries.nombreValido = true;
        }

        //Contador
        if (!contador || this.facturaSeries.contador == "") {
            this.facturaSeries.contadorValido = false;
        }
        else {
            this.facturaSeries.contadorValido = true;
        }
        //Minimo
        if (!minimo || this.facturaSeries.minimo == "") {
            this.facturaSeries.minimoValido = false;
        }
        else {
            this.facturaSeries.minimoValido = true;
        }
        //Maximo
        if (!maximo || this.facturaSeries.maximo == "") {
            this.facturaSeries.maximoValido = false;
        }
        else {
            this.facturaSeries.maximoValido = true;
        }
    }

    validarGuardar(){
        this.validarCampos();

        if (this.facturaSeries.contadorValido && this.facturaSeries.minimoValido && this.facturaSeries.maximoValido && this.facturaSeries.nombreValido) {
            if (this.facturaSeries.nombreValido) {
                $("#nombre").removeClass("errorCampo");
                this.msgErrorNombre = "";

                if (this.facturaSeries.contadorValido) {
                    $("#contador").removeClass("errorCampo");
                    this.msgErrorContador = "";

                    if (this.facturaSeries.minimoValido) {
                        $("#minimo").removeClass("errorCampo");
                        this.msgErrorMinimo = "";

                        if (this.facturaSeries.maximoValido) {
                            $("#maximo").removeClass("errorCampo");
                            this.msgErrorMaximo = "";
                            this.facturaSeries.guardar = true;
                        }
                    }
                }
            }
        } else {

            //Nombre
            if (this.facturaSeries.nombre == "" || this.facturaSeries.nombre == null) {
                $("#nombre").addClass("errorCampo");
                this.facturaSeries.ErrorNombre = false;
                this.msgErrorNombre = "";
            }
            else {
                if (!this.facturaSeries.nombreValido) {
                    $("#nombre").addClass("errorCampo");
                    this.facturaSeries.ErrorNombre = true;
                    if (this.facturaSeries.nombre) {
                        this.msgErrorNombre = this.consultaFacturaSerieTranslate.errorNombre;
                    } else {
                        this.msgErrorNombre = "";
                    }
                }
                else {
                    $("#nombre").removeClass("errorCampo");
                    this.facturaSeries.ErrorNombre = false;
                    this.msgErrorNombre = "";
                }
            }

            //Contador
            if (this.facturaSeries.contador == "" || this.facturaSeries.contador == null) {
                $("#contador").addClass("errorCampo");
                this.facturaSeries.ErrorContador = false;
                this.msgErrorContador = "";
            }
            else {
                if (!this.facturaSeries.contadorValido) {
                    $("#contador").addClass("errorCampo");
                    this.facturaSeries.ErrorContador = true;
                    if (this.facturaSeries.contador) {
                        this.msgErrorContador = this.consultaFacturaSerieTranslate.errorContador;
                    } else {
                        this.msgErrorContador = "";
                    }
                }
                else {
                    $("#contador").removeClass("errorCampo");
                    this.facturaSeries.ErrorContador = false;
                    this.msgErrorContador = "";
                }
            }

            //Minimo
            if (this.facturaSeries.minimo == "" || this.facturaSeries.minimo == null) {
                $("#minimo").addClass("errorCampo");
                this.facturaSeries.ErrorMinimo = false;
                this.msgErrorMinimo = "";
            }
            else {
                if (!this.facturaSeries.minimoValido) {
                    $("#minimo").addClass("errorCampo");
                    this.facturaSeries.ErrorMinimo = true;
                    if (this.facturaSeries.minimo) {
                        this.msgErrorMinimo = this.consultaFacturaSerieTranslate.errorMinimo;
                    } else {
                        this.msgErrorMinimo = "";
                    }
                }
                else {
                    $("#minimo").removeClass("errorCampo");
                    this.facturaSeries.ErrorMinimo = false;
                    this.msgErrorMinimo = "";
                }
            }


            //Maximo
            if (this.facturaSeries.maximo == "" || this.facturaSeries.maximo == null) {
                $("#maximo").addClass("errorCampo");
                this.facturaSeries.ErrorMaximo = false;
                this.msgErrorMaximo = "";
            }
            else {
                if (!this.facturaSeries.maximoValido) {
                    $("#maximo").addClass("errorCampo");
                    this.facturaSeries.ErrorMaximo = true;
                    if (this.facturaSeries.maximo) {
                        this.msgErrorMaximo = this.consultaFacturaSerieTranslate.errorMaximo;
                    } else {
                        this.msgErrorMaximo = "";
                    }
                }
                else {
                    $("#maximo").removeClass("errorCampo");
                    this.facturaSeries.ErrorMaximo = false;
                    this.msgErrorMaximo = "";
                }
            }
        }
    };

    regresarConsulta(){
        this.facturaSeries.nombre = "";
        this.facturaSeries.descripcion = "";
        this.facturaSeries.contador = "";
        this.facturaSeries.minimo = "";
        this.facturaSeries.maximo = "";
        this.facturaSeries.nombreValido = false;
        this.facturaSeries.contadorValido = false;
        this.facturaSeries.minimoValido = false;
        this.facturaSeries.maximoValido = false;
        this.facturaSeries.guardar = false;

        this.modales.modalSerie.hide();
    }

    cancelarPantalla() {
        if (this.facturaSeries.nombre == "" && this.facturaSeries.descripcion == "" && this.facturaSeries.contador == ""
            && this.facturaSeries.minimo == "" && this.facturaSeries.maximo == "") {
            this.facturaSeries.nombre = "";
            this.facturaSeries.descripcion = "";
            this.facturaSeries.contador = "";
            this.facturaSeries.minimo = "";
            this.facturaSeries.maximo = "";
            this.facturaSeries.nombreValido = false;
            this.facturaSeries.contadorValido = false;
            this.facturaSeries.minimoValido = false;
            this.facturaSeries.maximoValido = false;
            this.facturaSeries.guardar = false;

            this.modales.modalSerie.hide();
        }
        else {
            this.modalDescartar();
        }
    }

    modalDescartar(){
        this.modales.modalConfirm.show();
        $("#modal-confirm .modal-body").html('<span class="title">' + this.consultaFacturaSerieTranslate.descartar + '</span>');
    }

    onBlurTxt(elemento: any) {
        if (this.facturaSeries.bandGuardar) {
            switch (elemento) {
                case "nombre":
                    if (!this.facturaSeries.ErrorNombre) {
                        if (this.facturaSeries.nombre == "" || this.facturaSeries.nombre === null) {
                            $("#" + elemento).addClass("errorCampo");
                        }
                    }
                    break;
                case "contador":
                    if (!this.facturaSeries.ErrorContador) {
                        if (this.facturaSeries.contador == "" || this.facturaSeries.contador === null) {
                            $("#" + elemento).addClass("errorCampo");
                        }
                    }
                    break;
                case "minimo":
                    if (!this.facturaSeries.ErrorMinimo) {
                        if (this.facturaSeries.minimo == "" || this.facturaSeries.minimo === null) {
                            $("#" + elemento).addClass("errorCampo");
                        }
                    }
                    break;
                case "maximo":
                    if (!this.facturaSeries.ErrorMaximo) {
                        if (this.facturaSeries.maximo == "" || this.facturaSeries.maximo === null) {
                            $("#" + elemento).addClass("errorCampo");
                        }
                    }
                    break;
            }
        }
    }

    onFocusTxt(elemento: any) {
        if (this.facturaSeries.bandGuardar) {
            switch (elemento) {
                case "nombre":
                    if (!this.facturaSeries.ErrorNombre) {
                        $("#" + elemento).removeClass("errorCampo");
                    }
                    break;
                case "contador":
                    if (!this.facturaSeries.ErrorContador) {
                        $("#" + elemento).removeClass("errorCampo");
                    }
                    break;
                case "minimo":
                    if (!this.facturaSeries.ErrorMinimo) {
                        $("#" + elemento).removeClass("errorCampo");
                    }
                    break;
                case "maximo":
                    if (!this.facturaSeries.ErrorMaximo) {
                        $("#" + elemento).removeClass("errorCampo");
                    }
                    break;
            }
        }
    }

    // -------------------------------------------------------------------------------- MÉTODOS DE PAGO --------------------------------------------------------------------------------
    ventaProducto_consultarMetodosPago(x: any) {
        var params: any = {};
        
        var fechaBusquedaSplit = [this.ventaProducto.fechas.startDate, this.ventaProducto.fechas.endDate];
        params.fechaInicio = (moment(JSON.parse(JSON.stringify(fechaBusquedaSplit[0])), 'DD/MM/YYYY').startOf('day')).format('YYYY-MM-DD HH:mm:ss');
        params.fechaFin = (moment(JSON.parse(JSON.stringify(fechaBusquedaSplit[1])), 'DD/MM/YYYY').endOf('day')).format('YYYY-MM-DD HH:mm:ss');
        
        //Fecha Utilizada Para el Título de los Modales
        this.fechaCompleta = this.ventaProducto.fechas.startDate + " - " + this.ventaProducto.fechas.endDate;

        if(params.fechaInicio == "Invalid date" || params.fechaFin == "Invalid date"){
            params.fechaInicio = moment(new Date( this.ventaProducto.fechas.startDate['$y'], this.ventaProducto.fechas.startDate['$M'], this.ventaProducto.fechas.startDate['$D'] )).startOf('day').format('YYYY-MM-DD HH:mm:ss');
            params.fechaFin = moment(new Date( this.ventaProducto.fechas.endDate['$y'], this.ventaProducto.fechas.endDate['$M'], this.ventaProducto.fechas.endDate['$D'] )).endOf('day').format('YYYY-MM-DD HH:mm:ss');
        
            //Fecha Utilizada Para el Título de los Modales
            var fechaInicioGeneralModales = format(new Date(this.ventaProducto.fechas.startDate['$y'], this.ventaProducto.fechas.startDate['$M'], this.ventaProducto.fechas.startDate['$D']), 'dd/MM/yyyy');
            var fechaFinGeneralModales = format(new Date( this.ventaProducto.fechas.endDate['$y'], this.ventaProducto.fechas.endDate['$M'], this.ventaProducto.fechas.endDate['$D'] ), 'dd/MM/yyyy' );
            this.fechaCompleta = fechaInicioGeneralModales + " - " + fechaFinGeneralModales;
        }

        params.idMetodoPagoSucursal = x.idMetodoPagoSucursal;

        this._backService.HttpPost("consultas/ventaProducto/consultarMetodosPago", {}, params).subscribe((response: string) => {
            this.dataMetodoPago = eval(response);
            this.dataSourceMetodoPago.data = this.dataMetodoPago;
		    this.dataSourceMetodoPago.sort = this.sort10;

            this.modales.modalMetodoPago.show();
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

    ventaProducto_cerrarModalMetodoPago(){
        this.modales.modalMetodoPago.hide();
    }

    isInvalidDate = (m: moment.Moment) =>  {
        return this.invalidDates.some(d => d.isSame(m, 'day') )
    }

    inicializarSort() {
        this.dataSourceProductos.sort = this.sort01;
        this.dataSourceServicios.sort = this.sort02;
        this.dataSourceVentasGrid.sort = this.sort03;
        this.dataSourceComisiones.sort = this.sort04
        this.dataSourceMarca.sort = this.sort05
        this.dataSourceProductoModal.sort = this.sort06
        this.dataSourceDescuentos.sort = this.sort07
        this.dataSourceCuentasxCobrar.sort = this.sort08
        this.dataSourceComisionesPersonal.sort = this.sort09
        this.dataSourceMetodoPago.sort = this.sort10
        this.dataSourcePropinasPorPersonal.sort = this.sort11
        this.dataSourceCancelaciones.sort = this.sort12
        this.dataSourceVentasEliminadas.sort = this.sort13
        this.dataSourceRetiroEfectivo.sort = this.sort14
        this.dataSourceDevolucionesDetalle.sort = this.sort15;
    }

    // ------------------------------------------ Funciones Globales ------------------------------------- //
    moduloFactura_nuevaSerie() {
        this.modales.modalSerie.show();
    }

    moduloFactura_changeIvaGeneral() {
        //Checar cada uno de los detalles a ver si se les aplica el IVA y si no se les calculó ya
        for (var i = 0; i < this.moduloFactura.facturacion.listaFacturar.length; i++) {
            if (this.moduloFactura.facturacion.listaFacturar[i].aplicaIVA && (this.moduloFactura.facturacion.listaFacturar[i].factor_iva != this.moduloFactura.facturacion.ivaGeneral)) {
                this.moduloFactura.facturacion.listaFacturar[i].factor_iva = this.moduloFactura.facturacion.ivaGeneral;
                //Importe e importe Mostrar regresan a su estado original para poder hacer de nuevo los cálculos
                this.moduloFactura.facturacion.listaFacturar[i].importe = this.moduloFactura.facturacion.listaFacturar[i].importeMostrar + this.moduloFactura.facturacion.listaFacturar[i].ivaImporteMostrar;
                this.moduloFactura.facturacion.listaFacturar[i].importeMostrar = parseFloat((this.moduloFactura.facturacion.listaFacturar[i].importeMostrar + this.moduloFactura.facturacion.listaFacturar[i].ivaImporteMostrar).toFixed(6));
                this.moduloFactura.facturacion.subtotal += this.moduloFactura.facturacion.listaFacturar[i].ivaImporte;
                this.moduloFactura.facturacion.impuestoIva -= this.moduloFactura.facturacion.listaFacturar[i].ivaImporte;
                this.moduloFactura.facturacion.subtotalMostrar += this.moduloFactura.facturacion.listaFacturar[i].ivaImporteMostrar;
                this.moduloFactura.facturacion.impuestoIvaMostrar -= this.moduloFactura.facturacion.listaFacturar[i].ivaImporteMostrar;

                this.moduloFactura.facturacion.listaFacturar[i].ivaImporte = parseFloat((this.moduloFactura.facturacion.listaFacturar[i].importe - (this.moduloFactura.facturacion.listaFacturar[i].importe / (1 + this.moduloFactura.facturacion.ivaGeneral))).toFixed(6));
                this.moduloFactura.facturacion.listaFacturar[i].ivaImporteMostrar = (Math.round(this.moduloFactura.facturacion.listaFacturar[i].ivaImporte * 100) / 100);
                this.moduloFactura.facturacion.listaFacturar[i].importe = parseFloat((this.moduloFactura.facturacion.listaFacturar[i].importe / (1 + this.moduloFactura.facturacion.ivaGeneral)).toFixed(6));
                this.moduloFactura.facturacion.listaFacturar[i].importeMostrar = (Math.round(this.moduloFactura.facturacion.listaFacturar[i].importe * 100) / 100);
                this.moduloFactura.facturacion.listaFacturar[i].totalImporte = (this.moduloFactura.facturacion.listaFacturar[i].importeMostrar + this.moduloFactura.facturacion.listaFacturar[i].ivaImporteMostrar);
                this.moduloFactura.facturacion.subtotal -= this.moduloFactura.facturacion.listaFacturar[i].ivaImporte;
                this.moduloFactura.facturacion.impuestoIva += this.moduloFactura.facturacion.listaFacturar[i].ivaImporte;
                this.moduloFactura.facturacion.total = (this.moduloFactura.facturacion.subtotal + this.moduloFactura.facturacion.impuestoIva);
                this.moduloFactura.facturacion.subtotalMostrar -= this.moduloFactura.facturacion.listaFacturar[i].ivaImporteMostrar;
                this.moduloFactura.facturacion.impuestoIvaMostrar += this.moduloFactura.facturacion.listaFacturar[i].ivaImporteMostrar;
                this.moduloFactura.facturacion.totalMostrar = (this.moduloFactura.facturacion.subtotalMostrar + this.moduloFactura.facturacion.impuestoIvaMostrar);
            }
        }
    }

    moduloFactura_validarConceptos(opcion: any) {
        var isValid = true;
        for (var i = 0; i < this.moduloFactura.facturacion.listaFacturar.length; i++) {
            $("#cveProdServ" + i + " .select2-choice").removeClass("error-input");
            $("#unidad" + i + " .select2-choice").removeClass("error-input");
            if (this.moduloFactura.facturacion.listaFacturar[i].seFactura && !this.moduloFactura.facturacion.listaFacturar[i].yaFacturado) {
                if (this.moduloFactura.facturacion.listaFacturar[i].cveProdServ == "" || this.moduloFactura.facturacion.listaFacturar[i].cveProdServ == null) {
                    $("#cveProdServ" + i + " .select2-choice").addClass("error-input");
                    isValid = false;
                }
                if (this.moduloFactura.facturacion.listaFacturar[i].cveUnidad == "" || this.moduloFactura.facturacion.listaFacturar[i].cveUnidad == null) {
                    $("#unidad" + i + " .select2-choice").addClass("error-input");
                    isValid = false;
                }
                if (this.moduloFactura.facturacion.listaFacturar[i].tipo == 5) {
                    if (this.moduloFactura.facturacion.listaFacturar[i].cantidad == 0 || this.moduloFactura.facturacion.listaFacturar[i].cantidad == "" || this.moduloFactura.facturacion.listaFacturar[i].cantidad == null) {
                        this._toaster.error(this.sessionTraslate.sesionCaducada);
                        this._toaster.error('No se puede facturar cantidades en 0');
                        isValid = false;
                    }
                    if (this.moduloFactura.facturacion.listaFacturar[i].montoTotal == 0 || this.moduloFactura.facturacion.listaFacturar[i].montoTotal == "" || this.moduloFactura.facturacion.listaFacturar[i].montoTotal == null) {
                        this._toaster.error('No se puede facturar montos en 0');
                        isValid = false;
                    }
                }
            }
        }

        $("#ddlIvaGeneral").removeClass("error-input");
        //Validar que haya seleccionado un iva general
        if (!this.moduloFactura.facturacion.aplicaIVA) {
            if (!this.moduloFactura.facturacion.ivaGeneral) {
                isValid = false;
                $("#ddlIvaGeneral").addClass("error-input");
                this._toaster.error(this.facturaTranslate.ivaMensaje);
            }
        }

        if (isValid) {
            if (opcion == 1) {
                this.moduloFactura_guardarFacturas();
            } else {
                this.moduloFactura_timbrarFacturas();
            }
        }
    }

    moduloFactura_guardarFacturas() {
        this._pantallaServicio.mostrarSpinner();
        var llevaIVA = false;
        var params: any = {};
        params.folioPago = this.caja.venta.ticket.folio_pago;
        params.idPagoClienteProducto = null;
        params.serie = this.moduloFactura.facturacion.serieyFolioFactura;
        params.totalIva = this.moduloFactura.facturacion.impuestoIva;
        params.subTotalAntesImpuestos = this.moduloFactura.facturacion.subtotal;
        params.idCliente = this.moduloFactura.facturacion.receptorIdCliente;
        params.clienteNombre = this.moduloFactura.facturacion.receptorNombre;
        params.clienteRFC = this.moduloFactura.facturacion.receptorRFC;
        params.receptorFormaPago = this.moduloFactura.facturacion.receptorFormaPago;
        params.receptorMetodoDePago = this.moduloFactura.facturacion.receptorMetodoPago;
        params.receptorusoCFDI = this.moduloFactura.facturacion.receptorCFDI;
        params.regimenFiscal = this.moduloFactura.facturacion.emisorRegimenFiscal;
        params.conceptos = [];
        for (var i = 0; i < this.moduloFactura.facturacion.listaFacturar.length; i++) {
            if (this.moduloFactura.facturacion.listaFacturar[i].seFactura && !this.moduloFactura.facturacion.listaFacturar[i].yaFacturado) {
                params.conceptos.push(this.moduloFactura.facturacion.listaFacturar[i]);
            }
        }
        params.factor_iva = (this.moduloFactura.facturacion.ivaGeneral) ? this.moduloFactura.facturacion.ivaGeneral : "";
        params.guardar = (this.moduloFactura.idFactura) ? 0 : 1;//1 = guardar Primera vez, 0 = Cuando edita la factura
        params.idFactura = (this.moduloFactura.idFactura) ? this.moduloFactura.idFactura : "";

        this._backService.HttpPost("catalogos/factura/guardarFactura", {}, params).subscribe((response: string) => {
            this._pantallaServicio.ocultarSpinner();
            this.cerrarModalFactura();
            this._toaster.success('La factura se guardó exitosamente');
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

    moduloFactura_timbrarFacturas() {
        this._pantallaServicio.mostrarSpinner();
        var llevaIVA = false;

        var params: any = {};
        params.folioPago = this.caja.venta.ticket.folio_pago;
        params.idPagoClienteProducto = null;
        params.serie = this.moduloFactura.facturacion.serieyFolioFactura;
        params.totalIva = this.moduloFactura.facturacion.impuestoIva;
        params.subTotalAntesImpuestos = this.moduloFactura.facturacion.subtotal;
        params.idCliente = this.moduloFactura.facturacion.receptorIdCliente;
        params.clienteNombre = this.moduloFactura.facturacion.receptorNombre;
        params.clienteRFC = this.moduloFactura.facturacion.receptorRFC;
        params.receptorFormaPago = this.moduloFactura.facturacion.receptorFormaPago;
        params.receptorMetodoDePago = this.moduloFactura.facturacion.receptorMetodoPago;
        params.receptorusoCFDI = this.moduloFactura.facturacion.receptorCFDI;
        params.regimenFiscal = this.moduloFactura.facturacion.emisorRegimenFiscal;
        params.conceptos = [];
        params.totalIva = 0.0;
        params.subTotalAntesImpuestos = 0.0
        for (var i = 0; i < this.moduloFactura.facturacion.listaFacturar.length; i++) {
            if (this.moduloFactura.facturacion.listaFacturar[i].seFactura && !this.moduloFactura.facturacion.listaFacturar[i].yaFacturado) {
                params.conceptos.push(this.moduloFactura.facturacion.listaFacturar[i]);

                params.totalIva += Math.round(this.moduloFactura.facturacion.listaFacturar[i].ivaImporte * 100) / 100;
                params.subTotalAntesImpuestos += Math.round(this.moduloFactura.facturacion.listaFacturar[i].importe * 100) / 100;
            }
        }
        params.factor_iva = (this.moduloFactura.facturacion.ivaGeneral) ? this.moduloFactura.facturacion.ivaGeneral : "";
        params.guardar = (this.moduloFactura.idFactura) ? 0 : 1;//1 = guardar Primera vez, 0 = Cuando edita la factura
        params.idFactura = (this.moduloFactura.idFactura) ? this.moduloFactura.idFactura : "";

        this._backService.HttpPost("catalogos/factura/generarFactura", {}, params, String).subscribe((response: string) => {
            this._pantallaServicio.ocultarSpinner();

            if (response == "True" || response == "true") {
                this.cerrarModalFactura();
                this._toaster.success('La factura se timbró exitosamente');
            } else {
                this.cerrarModalFactura();
                this.modalInformacionFactura(response);
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

    moduloFactura_validarCamposGenerales() {
        var isValid = true;

        if (this.moduloFactura.facturacion.emisorSucursal == "") {
            isValid = false;
            $("#sucursalInput").addClass("error-input");
        } else {
            $("#sucursalInput").removeClass("error-input");
        }

        if (this.moduloFactura.facturacion.emisorRegimenFiscal == "" || this.moduloFactura.facturacion.emisorRegimenFiscal == null) {
            isValid = false;
            $("#regimenFiscalInput").addClass("error-input");
        } else {
            $("#regimenFiscalInput").removeClass("error-input");
        }

        if (this.moduloFactura.facturacion.receptorRFC == "") {
            isValid = false;
            $("#rfcInput").addClass("error-input");
        } else {
            $("#rfcInput").removeClass("error-input");
        }

        if (this.moduloFactura.facturacion.receptorFormaPago == "") {
            isValid = false;
            $("#formasDePagoSelect").addClass("error-input");
        } else {
            $("#formasDePagoSelect").removeClass("error-input");
        }

        if (this.moduloFactura.facturacion.receptorMetodoPago == "" || this.moduloFactura.facturacion.receptorMetodoPago == null) {
            isValid = false;
            $("#metodosDePagoSelect").addClass("error-input");
        } else {
            $("#metodosDePagoSelect").removeClass("error-input");
        }

        if (this.moduloFactura.facturacion.receptorCFDI == "") {
            isValid = false;
            $("#CFDIInput").addClass("error-input");
        } else {
            $("#CFDIInput").removeClass("error-input");
        }

        if (this.moduloFactura.facturacion.serieyFolioFactura == "") {
            isValid = false;
            $("#serieFolioInput").addClass("error-input");
        } else {
            $("#serieFolioInput").removeClass("error-input");
        }

        if (isValid) {
            this.next();
        }
    }

    //Funcion para Validar el estatus de la factura, para que no se pueda mandar a timbrar el folio pago, si esta asignado a una factura.
    /*validarestatusfactura() {
        var params: any = {};
        params.idFactura = '';
        params.folioPago = this.caja.venta.ticket.folio_pago;

        this._backService.HttpPost("catalogos/factura/consultarFacturas", {}, params).subscribe((response: string) => {
            var datosFactura = eval(response);
            if (datosFactura.length > 0) {
                this._toaster.error("El Folio Pago esta relacionado a una Factura:" + datosFactura[0].folio);
                return true;
            }
            else {                   
                this.moduloFactura_factura();
                return false;
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
    }*/

    moduloFactura_factura() {
        this.moduloFactura.idPagoClienteProducto = "";

        var params: any = {};
        params.idCliente = this.caja.venta.ticket.idCliente;
        params.folioPago = this.caja.venta.ticket.folio_pago;
        this._pantallaServicio.mostrarSpinner();

        this._backService.HttpPost("catalogos/factura/datosFiscales", {}, params, 'string').subscribe((response: string) => {
            switch (response) {
                case "NIFC":
                    var idCliente = this.caja.venta.ticket.idCliente;
                    var w = 1000;
                    var h = 530;
                    var left = Number((screen.width / 2) - (w / 2));
                    var tops = Number((screen.height / 2) - (h / 2));
                    var lang = this._translate.getDefaultLang();
                    var caracteristicas = "height=" + h + ",width=" + w + ",scrollTo,resizable=0,scrollbars=1,location=1," + "top=" + tops + ", left=" + left;
                    var nueva = window.open('/bookipp/informacionFiscalCliente.html#/' + idCliente + '&' + this.caja.venta.ticket.folio_pago + '&' + lang, 'Popup', caracteristicas);
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
                    this.moduloFactura.datosFiscales = eval(response);
                    if (this.moduloFactura.datosFiscales.length == 3) {
                        this.moduloFactura.dataFactura = this.moduloFactura.datosFiscales[0];
                        this.moduloFactura.idFactura = this.moduloFactura.dataFactura[0].idFactura;
                        this.moduloFactura.dataFacturaDetalle = this.moduloFactura.datosFiscales[1];
                        this.moduloFactura.dataConceptos = this.moduloFactura.datosFiscales[2];
                        this.cargarSucursales(2);
                    } else if (this.moduloFactura.datosFiscales.length == 1) {
                        this.moduloFactura.dataFactura = this.moduloFactura.datosFiscales[0];
                        this.moduloFactura.idFactura = this.moduloFactura.dataFactura[0].idFactura;
                        this.moduloFactura.dataFacturaDetalle = [];
                        this.moduloFactura.dataConceptos = null;
                        this.cargarSucursales(2);
                    } else {
                        this.moduloFactura.idFactura = null;
                        this.moduloFactura.dataFactura = null;
                        this.moduloFactura.dataFacturaDetalle = null;
                        this.moduloFactura.dataConceptos = null;
                        this.cargarSucursales(1);
                    }
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


    moduloFactura_regresarDatosGenerales() {
        this.moduloFactura.datosGenerales = false;
        this.moduloFactura.conceptos = true;
    }

    /*caja_movimientos_mostrarTicketFolioPago(folio: any) { 
        this.modales.modalGlobalTicketPago.show();
        this._pantallaServicio.mostrarSpinner();

        var params: any = {};
        params.folioPago = folio;
        params.opcion = 1;

        this._backService.HttpPost("procesos/agenda/Agenda/consultarTicketPagoCaja", {}, params).subscribe((response: string) => {
            var temp = eval(response);
            this.caja.venta.ticket = {};
            this.caja.venta.ticket.cargos = [];
            this.caja.venta.ticket.promocion = [];
            this.caja.venta.ticket.productos = [];
            this.caja.venta.ticket.paquetes = [];
            this.caja.venta.ticket.certificadosRegalo = [];
            this.caja.venta.ticket.propina = [];
            this.caja.venta.ticket.total = 0;
            this.caja.venta.ticket.cliente = temp[0].nombreCliente;
            this.caja.venta.ticket.idCliente = temp[0].idCliente;
            this.caja.venta.ticket.folio = temp[0].folio_nuevo;
            this.caja.venta.ticket.emailCliente = temp[0].emailCliente;
            this.caja.venta.ticket.folio_pago = temp[0].folio_pago_original;
            this.caja.venta.ticket.totalDescuento = 0;

            var propinaTemp = 0;
            for (var i = 0; i < temp.length; i++) {
                switch (temp[i].idPagoClienteTipo) {
                    case 1: 
                        this.caja.venta.ticket.cargos.push(temp[i]);
                        if(temp[i].idPromocionSucursal == null){
                            this.caja.venta.ticket.totalDescuento += temp[i].pago - temp[i].montoTotal;
                        }
                        else{
                            if(temp[i].tipoPromocion == 1){
                                this.caja.venta.ticket.promocion.push({
                                    descripcion: temp[i].descripcionPromocion + " - " + temp[i].descripcion,
                                    pago: Number(temp[i].valorPromocion)
                                });
                            }
                            else{
                                this.caja.venta.ticket.promocion.push({
                                    descripcion: temp[i].descripcionPromocion + " - " + temp[i].descripcion,
                                    pago: temp[i].pago * (1 - (Number(temp[i].valorPromocion) / 100))
                                });
                            }
                        }
                        break;

                    case 4: 
                        propinaTemp = propinaTemp + temp[i].pago;
                        break;

                    case 5: 
                        this.caja.venta.ticket.productos.push(temp[i]);
                        this.caja.venta.ticket.totalDescuento += temp[i].pago - temp[i].montoTotal;
                        break;

                    case 6: 
                        this.caja.venta.ticket.paquetes.push(temp[i]);
                        this.caja.venta.ticket.totalDescuento += temp[i].pago - temp[i].montoTotal;
                        break;

                    case 8: 
                        this.caja.venta.ticket.certificadosRegalo.push(temp[i]);
                        this.caja.venta.ticket.totalDescuento += temp[i].pago - temp[i].montoTotal;
                        break;
                }
                this.caja.venta.ticket.total += temp[i].idPagoClienteTipo != 4 ? temp[i].montoTotal : 0;
            }

            if (propinaTemp != 0) {
                this.caja.venta.ticket.propina = {};
                this.caja.venta.ticket.propina.pago = propinaTemp;
                this.caja.venta.ticket.propina.descripcion = "Propina";
                this.caja.venta.ticket.total = this.caja.venta.ticket.total + this.caja.venta.ticket.propina.pago;
            }

            params.opcion = 2;

            this._backService.HttpPost("procesos/agenda/Agenda/consultarTicketPagoCaja", {}, params).subscribe((response: string) => {
                var temp = eval(response);

                this.caja.venta.ticket.fecha = moment(temp[0].fechaPago).format("DD MMM YYYY HH:mm");
                this.caja.venta.ticket.fechaSF = moment(temp[0].fechaPago);
                this.caja.venta.ticket.metodoPago = [];
                this.caja.venta.ticket.totalPagado = 0;
                for (var i = 0; i < temp.length; i++) {
                    this.caja.venta.ticket.metodoPago.push(temp[i]);
                    this.caja.venta.ticket.totalPagado += temp[i].pago;
                }
                this.dataTicket = this.caja.venta.ticket;

                this.global = this.caja.venta;
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
                this._toaster.error(this.sessionTraslate.errorEliminar);
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
            this._toaster.error(this.sessionTraslate.errorEliminar);
        });
    }*/

    /*caja_movimientos_mostrarTicketFolioVenta(folio: any) {
        this.modales.modalGlobalTicketVenta.show();
        //this.caja.venta.ticketVenta = {};
        this._pantallaServicio.mostrarSpinner();

        var params: any = {};
        params.folioVenta = folio;
        params.opcion = 1;

        this._backService.HttpPost("procesos/agenda/Agenda/consultarTicketVenta", {}, params).subscribe((response: string) => {
            var temp = eval(response);

            this.caja.venta.ticketVenta = {};
            this.caja.venta.ticketVenta.folioVenta = temp[0].folio_caja;
            this.caja.venta.ticketVenta.fecha = moment(temp[0].fechaPago).format("DD MMM YYYY HH:mm");
            this.caja.venta.ticketVenta.cargos = [];
            this.caja.venta.ticketVenta.promocion = [];
            this.caja.venta.ticketVenta.productos = [];
            this.caja.venta.ticketVenta.paquetes = [];
            this.caja.venta.ticketVenta.devoluciones = [];
            this.caja.venta.ticketVenta.certificadosRegalo = [];
            this.caja.venta.ticketVenta.descuento = 0;

            for (var i = 0; i < temp.length; i++) {
                if(temp[i].nombreCliente){
                    this.caja.venta.ticketVenta.cliente = temp[i].nombreCliente;
                }

                switch (temp[i].idPagoClienteTipo) {
                    case 1: 
                        this.caja.venta.ticketVenta.cargos.push(temp[i]);
                        if(temp[i].idPromocionSucursal == null){
                            this.caja.venta.ticketVenta.descuento += temp[i].pago - temp[i].montoTotal;
                        }
                        break;
                    case 3: 
                        this.caja.venta.ticketVenta.promocion.push(temp[i]);
                        break;
                    case 5: 
                        this.caja.venta.ticketVenta.productos.push(temp[i]);
                        this.caja.venta.ticketVenta.descuento += temp[i].pago - temp[i].montoTotal;
                        break;
                    case 6: 
                        this.caja.venta.ticketVenta.paquetes.push(temp[i]);
                        this.caja.venta.ticketVenta.descuento += temp[i].pago - temp[i].montoTotal;
                        break;
                    case 8: 
                        this.caja.venta.ticketVenta.certificadosRegalo.push(temp[i]);
                        this.caja.venta.ticketVenta.descuento += temp[i].pago - temp[i].montoTotal;
                        break;
                }
            }
            params.opcion = 2;

            this._backService.HttpPost("procesos/agenda/Agenda/consultarTicketVenta", {}, params).subscribe((response: string) => {
                this.caja.venta.ticketVenta.devoluciones = eval(response);

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
                this._toaster.error(this.sessionTraslate.errorEliminar);
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
            this._toaster.error(this.sessionTraslate.errorEliminar);
        });
    }*/

    /*caja_movimientos_mostrarTicketFolioRetiroEfectivo(folio: any) {
        this.modales.modalGlobalTicketRetiro.show();
        this._pantallaServicio.mostrarSpinner();

        var params: any = {};
        params.folio = folio;

        this._backService.HttpPost("procesos/movimientos/consultarRetiroEfectivo", {}, params).subscribe((response: string) => {
            var DatosRetiroEfectivo = (eval(response));

            this.caja.retiroEfectivo.imprimirFacturabtn = 1;
            this.caja.retiroEfectivo.nombreUsuario = DatosRetiroEfectivo[0]['NombreUsuario'];
            this.caja.retiroEfectivo.ticket = {};
            this.caja.retiroEfectivo.ticket.Usuario = DatosRetiroEfectivo[0]['NombreUsuario'];
            this.caja.retiroEfectivo.ticket.Folio = "000000" + DatosRetiroEfectivo[0]['Folio'];
            this.caja.retiroEfectivo.ticket.Fecha = moment(DatosRetiroEfectivo[0]['Fecha']).format('DD/MM/YYYY');
            this.caja.retiroEfectivo.ticket.motivoRetiro = DatosRetiroEfectivo[0].Motivo;
            this.caja.retiroEfectivo.ticket.Monto = DatosRetiroEfectivo[0]['Monto'];
            this.dataTicket = {};
            this.dataTicket.retiroEfectivo = this.caja.retiroEfectivo.ticket;

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
            this._toaster.error(this.sessionTraslate.errorEliminar);
        });
    }*/
}