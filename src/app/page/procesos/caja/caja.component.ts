import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MethodsService } from 'src/app/core/services/methods.service';
import { PantallaService } from 'src/app/core/services/pantalla.service';
import { ToasterService } from 'src/shared/toaster/toaster.service';
declare var $: any; // JQUERY
import * as bootstrap from 'bootstrap'; // BOOTSTRAP
import moment from 'moment';
declare const InstallTrigger: any;
import { saveAs } from 'file-saver';
import { format } from 'date-fns';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import dayjs from 'dayjs';
import { TicketService } from 'src/app/core/services/ticket.service';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material/icon';
import { FacturacionService } from 'src/app/core/services/facturacion.service';

import { NgSelectComponent } from '@ng-select/ng-select'

@Component({
  selector: 'app-caja',
  templateUrl: './caja.component.html',
  styleUrls: ['./caja.component.scss', '../../page.component.scss']
})
export class CajaComponent implements OnInit {

    calendarioTranslate: any = {};
    agendaTranslate: any = {};

    // Modales
    modales: any = {};

    hoy:any;
    esPremium: any;

    displayedColumnsMovimientos: any [] = ['acciones', "datoFecha", "datoFolioVenta", "datoFolioPago", "datoEstatus", "datoCliente", "datoCargo", "datoAbono", "datoSaldo"];
    displayedColumnsCuentasPorCobrar: any [] = ["tipoCuenta","folio_caja","nombreCuenta","fecha","monto","porPagar"];
    displayedColumnsClienteHistorialVentas: any [] = ["acciones","folio_caja","fechaPago","montoTotal"];
    displayedColumnsCorteHistorial: any [] = ["folioTicket","nombreCorteTipo","nombreCorteAccion","nombreUsuario","fechaAlta","fondoCaja","montoPromociones","montoDiferencia","totalRetirosEfectivo","totalDevoluciones","nombreRealizoAlta","nombreVerifico"];
    displayedColumnsCortePromociones: any [] = ["folio_caja","fechaAlta","nombrePersonal","nombreCliente","descripcion","total","pago","descuento","promocion"];
    displayedColumnsMetodoPago: any [] = ["acciones","descripcion","comision","comisionPorcentual","efectivo"];
    
    dataSourceMovimientos = new MatTableDataSource<any>([]);
    dataSourceCuentasPorCobrar = new MatTableDataSource<any>([]);
    dataSourceClienteHistorialVentas = new MatTableDataSource<any>([]);
    dataSourceCorteHistorial = new MatTableDataSource<any>([]);
    dataSourceCortePromociones = new MatTableDataSource<any>([]);
    dataSourceMetodoPago = new MatTableDataSource<any>([]);

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild("paginacionCuentasPorCobrar") paginacionCuentasPorCobrar!: MatPaginator;
    @ViewChild("paginacionClienteHistorialVentas") paginacionClienteHistorialVentas!: MatPaginator;
    @ViewChild("paginacionCorteHistorial") paginacionCorteHistorial!: MatPaginator;
    @ViewChild("paginacionCortePromociones") paginacionCortePromociones!: MatPaginator;
    @ViewChild("paginacionMetodoPago") paginacionMetodoPago!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;
    
    constructor(private _translate: TranslateService, 
        private _backService: MethodsService, 
        public _pantallaServicio: PantallaService, 
        private _dialog: MatDialog,
        private _router: Router,
        private _toaster: ToasterService,
        private _route: ActivatedRoute,
        private domSanitizer: DomSanitizer, 
        private matIconRegistry: MatIconRegistry,
        @Inject(MAT_DIALOG_DATA) public dataDialog: any,
        private dialogRef: MatDialogRef<CajaComponent>,
        public _facturacionService: FacturacionService,
        public _ticketService: TicketService) { 

        this._translate.setDefaultLang(this._pantallaServicio.idioma);
        this._translate.use(this._pantallaServicio.idioma);
        
        this._translate.get('calendarioTranslate').subscribe((translated) => {             
            this.calendarioTranslate = this._translate.instant('calendarioTranslate');
            this.agendaTranslate = this._translate.instant('agendaTranslate');
        });

        this.matIconRegistry.addSvgIcon('iconAgregar', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Agregar-1-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconEditar', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Editar-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconCruzCirculo', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/10-2-TiposdeExcepcion-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconDeshacer', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Deshacer-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconCruzCuadrado', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/CruzCuadrado-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconPorcentaje', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Porcentaje-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconExcel', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Excel-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconBasura', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Basura-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconGuardar', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Guardar-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconCalendarioEditar', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/CalendarioEditar-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconFlechaAbajo', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/FlechaAbajo-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconCheckCirculo', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/CheckCirculo-icon-Relleno.svg"));
        this.matIconRegistry.addSvgIcon('iconBuscar', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Buscar-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconArchivo', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Archivo-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconCorreo', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Correo-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconTiposCambio', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/10-3-TiposdeCambios-icon.svg"));
    }

    ngOnInit(): void {

        this.esPremium = this._pantallaServicio.esPremium;

        this.caja.venta.metodosDePago.push({idCertificadoRegalo: null});
        this.caja.venta.metodosDePago.push({codigoRegalo: null});        

        this.validarSeleccionFecha();
        this.caja_abrirModalCaja(this.dataDialog);
        this.caja_venta_clienteHistorial_declararGridsHistorialCliente();
        this.caja_venta_cargarVarGridMetodosPago();
        this.caja_corte_declararGridPromociones();
        this.caja_corte_declararGridHistorial();
        this.caja_movimientos_declararVariables();
        this.caja_movimientos_declararGrid();
        this.caja_retiroEfectivo_mostarModalRetiro();

        this.crearModales();
    }

    crearModales() {

        if($("body").find(".mdlCertifidicadoRegaloCodigoIngresar").length > 1){
            $("body").find(".mdlCertifidicadoRegaloCodigoIngresar")[1].remove();
        }
        this.modales.mdlCertifidicadoRegaloCodigoIngresar = new bootstrap.Modal($("#mdlCertifidicadoRegaloCodigoIngresar").appendTo("body"), {
            backdrop: "static", 
            keyboard: false,
        });

        if($("body").find(".modalServiciosCobrar").length > 1){
            $("body").find(".modalServiciosCobrar")[1].remove();
        }
        this.modales.modalServiciosCobrar = new bootstrap.Modal($("#modalServiciosCobrar").appendTo("body"), {
            backdrop: "static", 
            keyboard: false,
        });

        if($("body").find(".modalMetodoPago").length > 1){
            $("body").find(".modalMetodoPago")[1].remove();
        }
        this.modales.modalMetodoPago = new bootstrap.Modal($("#modalMetodoPago").appendTo("body"), {
            backdrop: "static", 
            keyboard: false,
        });

        if($("body").find(".borrarMetodoPago").length > 1){
            $("body").find(".borrarMetodoPago")[1].remove();
        }
        this.modales.borrarMetodoPago = new bootstrap.Modal($("#borrarMetodoPago").appendTo("body"), {
            backdrop: "static", 
            keyboard: false,
        });

        if($("body").find(".ticketPago").length > 1){
            $("body").find(".ticketPago")[1].remove();
        }
        this.modales.ticketPago = new bootstrap.Modal($("#ticketPago").appendTo("body"), {
            backdrop: "static", 
            keyboard: false,
        });

        if($("body").find(".ticketVenta").length > 1){
            $("body").find(".ticketVenta")[1].remove();
        }
        this.modales.ticketVenta = new bootstrap.Modal($("#ticketVenta").appendTo("body"), {
            backdrop: "static", 
            keyboard: false,
        });

        if($("body").find(".modalConfirmarEliminarVenta").length > 1){
            $("body").find(".modalConfirmarEliminarVenta")[1].remove();
        }
        this.modales.modalConfirmarEliminarVenta = new bootstrap.Modal($("#modalConfirmarEliminarVenta").appendTo("body"), {
            backdrop: "static", 
            keyboard: false,
        });

        if($("body").find(".modalPromociones").length > 1){
            $("body").find(".modalPromociones")[1].remove();
        }
        this.modales.modalPromociones = new bootstrap.Modal($("#modalPromociones").appendTo("body"), {
            backdrop: "static", 
            keyboard: false,
        });

        if($("body").find(".ticket-retiro").length > 1){
            $("body").find(".ticket-retiro")[1].remove();
        }
        this.modales.ticketRetiro = new bootstrap.Modal($("#ticket-retiro").appendTo("body"), {
            backdrop: "static", 
            keyboard: false,
        });

        if($("body").find(".modalCortePromociones").length > 1){
            $("body").find(".modalCortePromociones")[1].remove();
        }
        this.modales.modalCortePromociones = new bootstrap.Modal($("#modalCortePromociones").appendTo("body"), {
            backdrop: "static", 
            keyboard: false,
        });

        if($("body").find(".modalRealizarCorte").length > 1){
            $("body").find(".modalRealizarCorte")[1].remove();
        }
        this.modales.modalRealizarCorte = new bootstrap.Modal($("#modalRealizarCorte").appendTo("body"), {
            backdrop: "static", 
            keyboard: false,
        });

        if($("body").find(".modalCorteHistorial").length > 1){
            $("body").find(".modalCorteHistorial")[1].remove();
        }
        this.modales.modalCorteHistorial = new bootstrap.Modal($("#modalCorteHistorial").appendTo("body"), {
            backdrop: "static", 
            keyboard: false,
        });

        if($("body").find(".ticketCorteCaja").length > 1){
            $("body").find(".ticketCorteCaja")[1].remove();
        }
        this.modales.ticketCorteCaja = new bootstrap.Modal($("#ticketCorteCaja").appendTo("body"), {
            backdrop: "static", 
            keyboard: false,
        });

        if($("body").find(".modalDevoluciones").length > 1){
            $("body").find(".modalDevoluciones")[1].remove();
        }
        this.modales.modalDevoluciones = new bootstrap.Modal($("#modalDevoluciones").appendTo("body"), {
            backdrop: "static", 
            keyboard: false,
        });

        if($("body").find(".modalCancelarPago").length > 1){
            $("body").find(".modalCancelarPago")[1].remove();
        }
        this.modales.modalCancelarPago = new bootstrap.Modal($("#modalCancelarPago").appendTo("body"), {
            backdrop: "static", 
            keyboard: false,
        });

        if($("body").find(".modal-Firma-Autorizacion").length > 1){
            $("body").find(".modal-Firma-Autorizacion")[1].remove();
        }
        this.modales.modalFirmaAutorizacion = new bootstrap.Modal($("#modal-Firma-Autorizacion").appendTo("body"), {
            backdrop: "static", 
            keyboard: false,
        });

    }

    ngAfterViewInit() {
		this.paginator._intl.itemsPerPageLabel = 'filas por pagina';
		this.dataSourceMovimientos.paginator = this.paginator;
		this.dataSourceMovimientos.sort = this.sort;

        this.dataSourceCuentasPorCobrar.paginator = this.paginacionCuentasPorCobrar;
		this.dataSourceCuentasPorCobrar.sort = this.sort;

        this.paginacionClienteHistorialVentas._intl.itemsPerPageLabel = 'filas por pagina';
        this.dataSourceClienteHistorialVentas.paginator = this.paginacionClienteHistorialVentas;
		this.dataSourceClienteHistorialVentas.sort = this.sort;

        this.paginacionCorteHistorial._intl.itemsPerPageLabel = 'filas por pagina';
        this.dataSourceCorteHistorial.paginator = this.paginacionCorteHistorial;
		this.dataSourceCorteHistorial.sort = this.sort;

        this.paginacionCortePromociones._intl.itemsPerPageLabel = 'filas por pagina';
        this.dataSourceCortePromociones.paginator = this.paginacionCortePromociones;
		this.dataSourceCortePromociones.sort = this.sort;

        this.paginacionMetodoPago._intl.itemsPerPageLabel = 'filas por pagina';
        this.dataSourceMetodoPago.paginator = this.paginacionMetodoPago;
		this.dataSourceMetodoPago.sort = this.sort;
	}

    guardarError (data:any, status:any, nombreAcceso:any){
        var params:any = {};
        params.error = nombreAcceso + " @NL";

        if(typeof data === 'object'){
            var keyNames = Object.keys(data);
            for (var i = 0; i < keyNames.length; i++) {
                params.error = params.error + "-- " + keyNames[i] + ": " + data[keyNames[i]] + " @NL";
            }
        }
        else{
            if(typeof data === 'string'){
                params.error = params.error + data;
            }
            else{
                if(typeof data.toString() === 'string'){
                    params.error = params.error + data.toString();
                }
            }
        }

        this._backService.HttpPost("procesos/agenda/Agenda/guardarError", {}, params).subscribe((data:any) => {
            this._router.navigate(["/login"]);
        }, error => {
            this._router.navigate(["/login"]);
        });
    }

    // ---------------------------------- Accesos de Pantalla Agenda y Caja ----------------------------------
    accesosPantalla:any = {
        caja: {
            venta: null,
            ventaHistorial: null,
            ventaEliminar: null,
            corteCaja: null,
            corteCajaHistorial: null,
            corteCajaDiasAnteriores: null,
            corteCajaFirmaAutorizacion: null,
            movimientos: null,
            movimientosFirmaAutorizacionDevolucion: null,
            movimientosFirmaAutorizacionCancelacion: null,
            retiroEfectivo: null,
            retiroEfectivoFirmaAutorizacion: null,
        }        
    }

    // -------------------------------------- Funciones Infinite Scroll --------------------------------------
    infiniteScrollCaja:any = {
        numToAdd: 20,
        currentItems: 20,
    }
    
    infiniteScrollCaja_addMoreItems () {
        this.infiniteScrollCaja.currentItems += this.infiniteScrollCaja.numToAdd;
        if(event){
            event.stopPropagation();
        }
    }

    infiniteScrollCaja_resetInfScroll (id: any) {
        $("#" + id).scrollTop(0);
        this.infiniteScrollCaja.currentItems = this.infiniteScrollCaja.numToAdd;
        if(event){
            event.stopPropagation();
        }
    }


    // ---------------------------------------------------------------------------------------------- CAJA --------------------------------------------------------------------------------------------------------

    // -------------------------------------- Declaración de variables ---------------------------------------
    paramsNotifi8 = { life: 6000, theme: "ruby", sticky: false };
    successNotific8 = { life: 6000, theme: "lime", sticky: false };
    caja:any = {
        cajaAbierta: 0,
        ocultaravisoinventario: false,
        ocultarguardarcaja: false,
        retiroEfectivo: {
            validarModRetiro: {},
            validarModRetiroFirma: {},
            ticket: {
                Usuario: null,
                Folio: null,
                Fecha: null,
                motivoRetiro: null,
                Monto: null,
            }
        },
        venta: { 
            cliente: null,
            listadoClientesBuffer: [],
            totales: {
                totalVenta: null,
            },
            servicios: {
                titulosConPrepago: false,
                listaServiciosPorCobrar: [{
                    listadoServicio: [], 
                    listadoServicioBuffer: []
                }],                
            },
            productos: {
                listaProductosPorCobrar: []
            },
            certificadoRegalo: {
                listaCertificadosPorCobrar: [],
                indexMetodoPagoCR: 0,
            },
            paquetes: {
                listaPaquetesPorCobrar: []
            },
            cargos: {
                listaCargosPorCobrar: []
            },
            promociones: {
                listaPromocionesAplicadas: []
            },
            promocionesNuevas: {
                codigo: "",
                editarPromociones: {
                    promocionesPosibles: []
                }
            },
            clienteNuevo: {
                mostrarNuevoCliente: false,
                nombre: "",
                email: "",
                telefono: "",
                fechaNacimiento: null,
            },
            clienteHistorial: {
                dataCuentasPorCobrar: [],
                dataVentas: [],
            },
            metodoPago: {
                mostrarNuevoMetodoPago: false,
                mostrarActualizarMetodoPago: false,
                descripcionMetodoPago: "",
            },
            ticket: {
                cliente: null,
                totalDescuento: null,
                total: null,
                paquetes: [],
                cargos: [],
                productos: [],
                certificadosRegalo: [],                
                promocion: [],                
                descuento: {
                    pago: null
                },
                propina: {
                    pago: null
                },                
            },
            ticketVenta: {
                cliente: null,
                folioVenta: null,
                fecha: null,
                paquetes: [],
                cargos: [],
                productos: [],
                promocion: [],
                certificadosRegalo: [],
                descuento: [],
                devoluciones: [],
            },
            metodosDePago: []
        },
        corte: {
            fechaAltaCorte: new Date(),
            dataTipoCorte: [],
            ticket: {
                corte: {
                    folioTicket: null,
                    nombreCorteTipo: null,
                    nombreUsuarioCorte: null,
                    fechaAlta: null,
                    fondoCaja: null,
                    montoPromociones: null,
                    montoDiferencia: null,
                    totalPropinas: null,
                    totalRetirosEfectivo: null,
                    totalDevoluciones: null,                    
                    nombreCorteAccion: null,
                    nombreRealizoAlta: null,
                    nombreUsuarioVerificacion: null,
                    metodosPago: null,
                    ingresos: [],
                },                
            },
            historial: {
                fechaCalendario: null
            }
        },
        movimientos: {
            fechas: {
                startDate: moment(new Date()).startOf('month').format('DD/MM/YYYY'), 
                endDate: moment(new Date()).endOf('month').format('DD/MM/YYYY')
            }
        }
    }

    // ----------------------------------------------- Infinite Scroll --------------------------------------------------- //
    infiniteScroll: any = {
        numToAdd: 20
    };
    listaDeBusqueda: any = [];
    loading = false;
    bufferSize = 40;
    numberOfItemsFromEndBeforeFetchingMore = 10;

    resetDdl(){
        this.listaDeBusqueda = [];
    }

    buscarEnScroll(id: any, idDDL: any, indexArreglo: any, select: any) {
        this.listaDeBusqueda = [];
        var valor = $("#" + idDDL + " input")[0].value;

        var esCodigoBarras = false;

        if(id == 'CajaVentaClientes' && valor != ""){
            for(var i = 0; i < this.caja.venta.listadoClientes.length; i++){
                this.caja.venta.listadoClientes[i].nombreBuscar.toUpperCase().includes(valor.toUpperCase()) ? this.listaDeBusqueda.push(this.caja.venta.listadoClientes[i]) : null;
            }
        }

        if(id == 'CajaVentaServicio' && valor != ""){
            for(var j = 0; j < this.caja.venta.servicios.listaServiciosPorCobrar[indexArreglo].listadoServicio.length; j++){
                this.caja.venta.servicios.listaServiciosPorCobrar[indexArreglo].listadoServicio[j].nombre.toUpperCase().includes(valor.toUpperCase()) ? this.listaDeBusqueda.push(this.caja.venta.servicios.listaServiciosPorCobrar[indexArreglo].listadoServicio[j]) : null;
            }
        }

        if(id == 'CajaVentaProducto' && valor != ""){

            // Verificar primero si lo que se ingresó concuerda con un código de barra
            for(var j = 0; j < this.caja.venta.productos.listaProductosPorCobrar[indexArreglo].listadoPresentaciones.length; j++){
                if(this.caja.venta.productos.listaProductosPorCobrar[indexArreglo].listadoPresentaciones[j].codigoBarras == valor){
                    var select2: NgSelectComponent = select;
                    select2.close();

                    this.caja.venta.productos.listaProductosPorCobrar[indexArreglo].idInventarioPresentacion = this.caja.venta.productos.listaProductosPorCobrar[indexArreglo].listadoPresentaciones[j].idInventarioPresentacion;

                    this.caja.venta.productos.listaProductosPorCobrar[indexArreglo].listadoPresentacionesBuffer = JSON.parse(JSON.stringify(this.caja.venta.productos.listaProductosPorCobrar[indexArreglo].listadoPresentaciones));
                    this.caja_venta_productos_elegirPresentacion(this.caja.venta.productos.listaProductosPorCobrar[indexArreglo], this.caja.venta.productos.listaProductosPorCobrar[indexArreglo].listadoPresentaciones[j], indexArreglo);

                    j = this.caja.venta.productos.listaProductosPorCobrar[indexArreglo].listadoPresentaciones.length;
                    esCodigoBarras = true;
                }
            }

            if(!esCodigoBarras){
                for(var j = 0; j < this.caja.venta.productos.listaProductosPorCobrar[indexArreglo].listadoPresentaciones.length; j++){
                    if(this.caja.venta.productos.listaProductosPorCobrar[indexArreglo].listadoPresentaciones[j].nombreProducto.toUpperCase().includes(valor.toUpperCase())){
                        this.listaDeBusqueda.push(this.caja.venta.productos.listaProductosPorCobrar[indexArreglo].listadoPresentaciones[j]);
                    }
                }
            }
        }

        if(!esCodigoBarras){
            this.resetInfScroll(id, indexArreglo);
        }
        else{
            
        }
    }

    resetInfScroll(id: any, indexArreglo: any) {
        if(id == 'CajaVentaClientes'){
            if(this.listaDeBusqueda.length > 0){
                this.caja.venta.listadoClientesBuffer = this.listaDeBusqueda.slice(0, this.infiniteScroll.numToAdd);   
            }
            else{
                this.caja.venta.listadoClientesBuffer = this.caja.venta.listadoClientes.slice(0, this.infiniteScroll.numToAdd);
            }
        }

        if(id == 'CajaVentaServicio'){
            if(this.listaDeBusqueda.length > 0){
                this.caja.venta.servicios.listaServiciosPorCobrar[indexArreglo].listadoServicioBuffer = this.listaDeBusqueda.slice(0, this.infiniteScroll.numToAdd);
            }
            else{
                this.caja.venta.servicios.listaServiciosPorCobrar[indexArreglo].listadoServicioBuffer = this.caja.venta.servicios.listaServiciosPorCobrar[indexArreglo].listadoServicio.slice(0, this.infiniteScroll.numToAdd);
            }
        }

        if(id == 'CajaVentaProducto'){
            if(this.listaDeBusqueda.length > 0){
                this.caja.venta.productos.listaProductosPorCobrar[indexArreglo].listadoPresentacionesBuffer = this.listaDeBusqueda.slice(0, this.infiniteScroll.numToAdd);
            }
            else{
                this.caja.venta.productos.listaProductosPorCobrar[indexArreglo].listadoPresentacionesBuffer = this.caja.venta.productos.listaProductosPorCobrar[indexArreglo].listadoPresentaciones.slice(0, this.infiniteScroll.numToAdd);
            }
        }
    }

    onScroll(id: any, event: any, indexArreglo: any) {
        var dataTotal: any = [];
        var dataBuffer: any = [];
        if(id == 'CajaVentaClientes'){
            if(this.listaDeBusqueda.length > 0){
                dataTotal = this.listaDeBusqueda;
            }
            else{
                dataTotal = this.caja.venta.listadoClientes;
            }
            dataBuffer = this.caja.venta.listadoClientesBuffer;
        }

        if(id == 'CajaVentaServicio'){
            if(this.listaDeBusqueda.length > 0){
                dataTotal = this.listaDeBusqueda;
            }
            else{
                dataTotal = this.caja.venta.servicios.listaServiciosPorCobrar[indexArreglo].listadoServicio;
            }
            dataBuffer = this.caja.venta.servicios.listaServiciosPorCobrar[indexArreglo].listadoServicioBuffer;
        }
        
        if(id == 'CajaVentaProducto'){
            if(this.listaDeBusqueda.length > 0){
                dataTotal = this.listaDeBusqueda;
            }
            else{
                dataTotal = this.caja.venta.productos.listaProductosPorCobrar[indexArreglo].listadoPresentaciones;
            }
            dataBuffer = this.caja.venta.productos.listaProductosPorCobrar[indexArreglo].listadoPresentacionesBuffer;
        }

        if (this.loading || dataTotal.length <= dataBuffer.length) {
            return;
        }

        if (event.end + this.numberOfItemsFromEndBeforeFetchingMore > dataBuffer.length) {
            if(id == 'CajaVentaClientes'){
                const len = this.caja.venta.listadoClientesBuffer.length;
    
                let more: any = [];
                if(this.listaDeBusqueda.length > 0){
                    more = this.listaDeBusqueda.slice(len, this.bufferSize + len);
                }
                else{
                    more = this.caja.venta.listadoClientes.slice(len, this.bufferSize + len);
                }
    
                this.caja.venta.listadoClientesBuffer = this.caja.venta.listadoClientesBuffer.concat(more);
            }

            if(id == 'CajaVentaServicio'){
                let len = 0;
                len = this.caja.venta.servicios.listaServiciosPorCobrar[indexArreglo].listadoServicioBuffer.length;
    
                let more: any = [];
                if(this.listaDeBusqueda.length > 0){
                    more = this.listaDeBusqueda.slice(len, this.bufferSize + len);
                }
                else{
                    more = this.caja.venta.servicios.listaServiciosPorCobrar[indexArreglo].listadoServicio.slice(len, this.bufferSize + len);
                }
                
                this.caja.venta.servicios.listaServiciosPorCobrar[indexArreglo].listadoServicioBuffer = this.caja.venta.servicios.listaServiciosPorCobrar[indexArreglo].listadoServicioBuffer.concat(more);
            }

            if(id == 'CajaVentaProducto'){
                let len = 0;
                len = this.caja.venta.productos.listaProductosPorCobrar[indexArreglo].listadoPresentacionesBuffer.length;
    
                let more: any = [];
                if(this.listaDeBusqueda.length > 0){
                    more = this.listaDeBusqueda.slice(len, this.bufferSize + len);
                }
                else{
                    more = this.caja.venta.productos.listaProductosPorCobrar[indexArreglo].listadoPresentaciones.slice(len, this.bufferSize + len);
                }
                
                this.caja.venta.productos.listaProductosPorCobrar[indexArreglo].listadoPresentacionesBuffer = this.caja.venta.productos.listaProductosPorCobrar[indexArreglo].listadoPresentacionesBuffer.concat(more);
            }
        }
    }

    caja_ocultarCuentasCobrar () {
        if(this._pantallaServicio.idSucursal == 402 || this._pantallaServicio.idSucursal == 407 || this._pantallaServicio.idSucursal == 465 || this._pantallaServicio.idSucursal == 543 || this._pantallaServicio.idSucursal == 560 || this._pantallaServicio.idSucursal == 685 || this._pantallaServicio.idSucursal == 380){
            $('#GuardarCaja').hide();  
            $('#txtFechaPago').attr('disabled', 'disabled');
            this.caja.ocultaravisoinventario = true;
            this.caja.ocultarguardarcaja = true;
        }
        else{
            $('#GuardarCaja').show();
            $('#txtFechaPago').removeAttr('disabled');
        }
    }

    // ----------------------------- Función principal que abre el modal de caja -----------------------------
    caja_abrirModalCaja (dataDialogP: any) {
        this._pantallaServicio.mostrarSpinner();

        var params:any = {};
        params.nombre = "AGENCAT004"; // No importa que código de state se mande

        this._backService.HttpPost("Seguridad/getAccesoPrincipal", {}, params).subscribe( (data: any) => {
            // La función regresa tres campos:
            // 1- te indica si existe el state o no
            // 2- te indica si tiene paquete vigente o no
            // 3- te indica si tiene vista a inventario 
            var dataAux = data.split("-");

            // Se verifica si el paquete está vigente o no
            if (dataAux[1] == "True") {

                this._backService.HttpPost("catalogos/ConfiguracionPerfil/ConsultaVariblesSession", {}, {}).subscribe( (data:any) => {
                    this.accesosPantalla.caja = {};
                    var dataTemp = eval(data);

                    for (var i = 0; i < dataTemp.length; i++) {
                        switch(dataTemp[i].Codigo){
                            case 'CAJACAT001':
                                this.accesosPantalla.caja.venta = Number(dataTemp[i].Valor);
                                break;

                            case 'CAJACAT002':
                                this.accesosPantalla.caja.ventaHistorial = Number(dataTemp[i].Valor);
                                break;

                            case 'CAJACAT003':
                                this.accesosPantalla.caja.ventaEliminar = Number(dataTemp[i].Valor);
                                break;

                            case 'CAJACAT004':
                                this.accesosPantalla.caja.corteCaja = Number(dataTemp[i].Valor);
                                break;

                            case 'CAJACAT005':
                                this.accesosPantalla.caja.corteCajaHistorial = Number(dataTemp[i].Valor);
                                break;

                            case 'CAJACAT006':
                                this.accesosPantalla.caja.corteCajaDiasAnteriores = Number(dataTemp[i].Valor);
                                break;

                            case 'CAJACAT007':
                                this.accesosPantalla.caja.corteCajaFirmaAutorizacion = Number(dataTemp[i].Valor);
                                break;

                            case 'CAJACAT008':
                                this.accesosPantalla.caja.movimientos = Number(dataTemp[i].Valor);
                                break;

                            case 'CAJACAT009':
                                this.accesosPantalla.caja.movimientosFirmaAutorizacionDevolucion = Number(dataTemp[i].Valor);
                                break;

                            case 'CAJACAT010':
                                this.accesosPantalla.caja.movimientosFirmaAutorizacionCancelacion = Number(dataTemp[i].Valor);
                                break;

                            case 'CAJACAT011':
                                this.accesosPantalla.caja.retiroEfectivo = Number(dataTemp[i].Valor);
                                break;

                            case 'CAJACAT012':
                                this.accesosPantalla.caja.retiroEfectivoFirmaAutorizacion = Number(dataTemp[i].Valor);
                                break;
                        }
                    }
    
                    if(this.accesosPantalla.caja.venta || this.accesosPantalla.caja.corteCaja || this.accesosPantalla.caja.movimientos || this.accesosPantalla.caja.retiroEfectivo){
                        this.caja.cajaAbierta = 1;
                        // this.caja.corte.fechaAltaCorte = new Date();
                        this.caja.corte.fechaAltaCorte = format(new Date(), "yyyy-MM-dd");
                        
                        // Se abre caja normalmente
                        setTimeout( () => {
                            if(dataDialogP.opc == 1){
                                setTimeout( () => {
                   
                                    if(this.accesosPantalla.caja.venta){
                                        this._pantallaServicio.mostrarSpinner();

                                        this.caja.venta.primeraVez = true;
                                        this.caja_venta_limpiarVenta();
                                        this.caja_venta_pasarPrimerVenta();

                                        setTimeout( () => {
                                            this.caja_ocultarCuentasCobrar();                                         
                                            $("#navCajaVenta").click();
                                        }, 200);

                                        $("#tabVenta").addClass("active");
                                        $("#tabRetiro").removeClass("active");
                                        $("#tabCorte").removeClass("active");
                                        $("#tabMovimientos").removeClass("active");
                                    }
                                    else{

                                        if(this.accesosPantalla.caja.retiroEfectivo){
                                            this._pantallaServicio.mostrarSpinner();
                                            this.caja_retiroEfectivo_mostarModalRetiro();

                                            setTimeout( () => {
                                                $("#navCajaRetiro").click();
                                            }, 200);

                                            $("#tabVenta").removeClass("active");
                                            $("#tabRetiro").addClass("active");
                                            $("#tabCorte").removeClass("active");
                                            $("#tabMovimientos").removeClass("active");

                                        }
                                        else{

                                            if(this.accesosPantalla.caja.corteCaja){
                                                this._pantallaServicio.mostrarSpinner();
                                                this.caja_corte_pasarCorteCaja();

                                                setTimeout( () => {
                                                    $("#navCajaCorte").click();
                                                }, 200);

                                                $("#tabVenta").removeClass("active");
                                                $("#tabRetiro").removeClass("active");
                                                $("#tabCorte").addClass("active");
                                                $("#tabMovimientos").removeClass("active");
                                            }
                                            else{
                                                if(this.accesosPantalla.caja.movimientos){
                                                    this._pantallaServicio.mostrarSpinner();

                                                    this.caja_movimientos_pasarMovimientos();

                                                    setTimeout( () => {
                                                        $("#navCajaMovimientos").click();
                                                    }, 200);

                                                    $("#tabVenta").removeClass("active");
                                                    $("#tabRetiro").removeClass("active");
                                                    $("#tabCorte").removeClass("active");
                                                    $("#tabMovimientos").addClass("active");
                                                }
                                            }
                                        }

                                    }
                                }, 200);
                            }

                            // Se abre caja por terminar cita
                            if(dataDialogP.opc == 2){
                                if(this.accesosPantalla.caja.venta){

                                    this.caja.venta.primeraVez = true;
                                    this.caja_venta_limpiarVenta();

                                    this.caja.venta.cliente = dataDialogP.data.venta.cliente;
                                    this.caja.venta.nombreCliente = dataDialogP.data.venta.nombreCliente;
                                    this.caja.venta.permitirCambioCliente = dataDialogP.data.venta.permitirCambioCliente;
                                    this.caja.venta.idCita = dataDialogP.data.venta.idCita;

                                    this.caja.venta.servicios.titulosConPrepago = JSON.parse(JSON.stringify(dataDialogP.data.venta.servicios.titulosConPrepago));
                                    this.caja.venta.servicios.listaServiciosPorCobrar = JSON.parse(JSON.stringify(dataDialogP.data.venta.servicios.listaServiciosPorCobrar));
                                    for (var i = 0; i < this.caja.venta.servicios.listaServiciosPorCobrar.length; i++) {
                                        this.caja_venta_servicios_consultarServiciosPorPersonal3(i);
                                    }
                                    this.caja.venta.paquetes.listaPaquetesPorCobrar = JSON.parse(JSON.stringify(dataDialogP.data.venta.paquetes.listaPaquetesPorCobrar));
                                    
                                    setTimeout( () => {
                                        this.caja_ocultarCuentasCobrar();
                                        $("#navCajaVenta").click();
                                    }, 200);

                                    $("#tabVenta").addClass("active");
                                    $("#tabRetiro").removeClass("active");
                                    $("#tabCorte").removeClass("active");
                                    $("#tabMovimientos").removeClass("active");
                                }
                                else{
                                    this._pantallaServicio.ocultarSpinner();
                                }
                            }

                        }, 100);
                    }
                    else{
                        this._pantallaServicio.ocultarSpinner();
                    }
                }, error => {
                    this.guardarError(error.error ? error.error.message : error.message, error.status, "Abrir caja");
                });
            }
            else{
                this._pantallaServicio.ocultarSpinner();
            }
        }, error => {
            this._router.navigate(["/login"]);
        });

    }

    fromState:any;
    caja_cerrarModalCaja () {
        // this.caja.venta.servicios.titulosConPrepago = false;
        // if(this.fromState == "agenda"){
        //     // this.consultarCitaIndividual();
        // }
        // $('#modalCaja').modal('hide');
        // this.caja.cajaAbierta = 0;
        // this.consultarIndicadores();

        //Cerrar el modal 
        this.dialogRef.close();
    }

    // ------------------------------------------------------------------------------ APARTADO DE VENTAS ------------------------------------------------------------------------------
    
    // ------------------------------------------- Funcion carga -------------------------------------------
    caja_venta_pasarPrimerVenta (){
        this._pantallaServicio.mostrarSpinner();
        
        this.caja.venta.listadoClientes = [];
        this.caja.venta.listadoPersonal = [];
        this.caja.venta.listadoPresentaciones = [];
        this.caja.venta.listadoPresentacionesCopia = [];
        this.caja.venta.listadoPaquetes = [];
        
        this._backService.HttpPost("procesos/agenda/Agenda/selectClientes", {}, {}).subscribe( (data:any) => {
            this.caja.venta.dataClienteBuscador = [];
            this.caja.venta.listadoClientes = eval(data);
            for (var i = 0; i < this.caja.venta.listadoClientes.length; i++) {
                if (this.caja.venta.listadoClientes[i].telefono !== null && this.caja.venta.listadoClientes[i].telefono != "" && this.caja.venta.listadoClientes[i].telefono !== undefined) {
                    this.caja.venta.listadoClientes[i].nombreBuscar = JSON.parse(JSON.stringify(this.caja.venta.listadoClientes[i].nombre)) + " - " + JSON.parse(JSON.stringify(this.caja.venta.listadoClientes[i].telefono));
                }
                else {
                    this.caja.venta.listadoClientes[i].nombreBuscar = JSON.parse(JSON.stringify(this.caja.venta.listadoClientes[i].nombre));
                }

                this.caja.venta.dataClienteBuscador[i] = JSON.parse(JSON.stringify(this.caja.venta.listadoClientes[i].nombreBuscar));
            }
            this.caja.venta.listadoClientesBuffer = JSON.parse(JSON.stringify(this.caja.venta.listadoClientes));

            var params:any = {};
            params.idServicio = -1;

            this._backService.HttpPost("procesos/agenda/Agenda/selectPersonal", {}, params).subscribe( (data:any) => {
                var dataPersonalAux = eval(data);
                this.caja.venta.listadoPersonal = [];
                for (var i = 0; i < dataPersonalAux.length; i++) {
                    if (!dataPersonalAux[i].realizoBaja) {
                        if(!dataPersonalAux[i].esCabina){
                            this.caja.venta.listadoPersonal.push(dataPersonalAux[i]);
                        }
                    }
                }

                this._backService.HttpPost("catalogos/Producto/cargarPresentacionesExistentes", {}, {}).subscribe( (data:any) => {
                    var dataPresentacionesAux = eval(data);
                    this.caja.venta.listadoPresentaciones = JSON.parse(JSON.stringify(dataPresentacionesAux));
                    this.caja.venta.listadoPresentaciones.forEach((elem: any) => {
                        if(elem.codigoBarras){
                            elem.nombreProducto = elem.nombreProducto + " - CB:" + elem.codigoBarras;
                        }
                    });
                    this.caja.venta.listadoPresentacionesCopia = JSON.parse(JSON.stringify(this.caja.venta.listadoPresentaciones));

                    this._backService.HttpPost("procesos/agenda/Agenda/consultarPaqueteSucursal", {}, {}).subscribe( (data:any) => {
                        this.caja.venta.listadoPaquetes = eval(data);

                        this._backService.HttpPost("procesos/agenda/Agenda/consultaIvaSucursal", {}, {}).subscribe( (data:any) => {
                            this.caja.venta.ivaSucursal = (parseFloat(eval(data)[0].valor) / 100).toString();

                            this.caja.venta.primeraVez = false;

                            if (this.caja.venta.cliente) {
                                var params:any = {};
                                params.idCliente = this.caja.venta.cliente;

                                this._backService.HttpPost("procesos/agenda/Agenda/consultarClienteAdeudo", {}, params).subscribe( (data:any) => {
                                    this.caja.venta.totales.totalCuentasCobrar = data;
                                    this.infiniteScroll.currentItems = this.caja.venta.listadoClientes.length;
                                    this.caja_venta_certificadoRegalo_consultarCertificados();

                                    // -- PROMOCIONES NUEVAS --
                                    this.caja_venta_promocionesNuevas_consultarPromocionesActivasSucursal();
                                }, error => {
                                    this.guardarError(error.error ? error.error.message : error.message, error.status, "Consultar cliente adeudo");
                                });
                            }
                            else {
                                this.caja_venta_certificadoRegalo_consultarCertificados();

                                // -- PROMOCIONES NUEVAS --
                                this.caja_venta_promocionesNuevas_consultarPromocionesActivasSucursal();
                            }
                        }, error => {
                            this.guardarError(error.error ? error.error.message : error.message, error.status, "Consultar IVA");
                        });

                    }, error => {
                        this.guardarError(error.error ? error.error.message : error.message, error.status, "Consultar paquetes de la sucursal");
                    });

                }, error => {
                    this.guardarError(error.error ? error.error.message : error.message, error.status, "Consultar productos");
                });

            }, error => {
                this.guardarError(error.error ? error.error.message : error.message, error.status, "Consultar personal");
            });

        }, error => {
            this.guardarError(error.error ? error.error.message : error.message, error.status, "Consultar clientes caja");
        }); 
    }

    //-----------------------------------------------------------------------------------------------------
    caja_venta_limpiarVenta () {
        this.caja.venta.cliente = null;
        this.caja.venta.nombreCliente = "";
        this.caja.venta.permitirCambioCliente = true;

        this.caja.venta.totales = {};
        this.caja.venta.totales.totalCuentasCobrar = 0;
        this.caja.venta.totales.totalServicios = 0;
        this.caja.venta.totales.totalCargos = 0;
        this.caja.venta.totales.totalProductos = 0;
        this.caja.venta.totales.totalPaquetes = 0;

        this.caja.venta.totales.totalVenta = 0;
        this.caja.venta.totales.totalVentaParaDescuento = 0;
        this.caja.venta.totales.totalPago = 0;
        this.caja.venta.totales.subtotal = 0;
        this.caja.venta.totales.totalDescuentoGeneral = 0;
        this.caja.venta.totales.totalPromocion = 0;
        this.caja.venta.totales.iva = 0;
        this.caja.venta.totales.total = 0;
        this.caja.venta.totales.descuentoP = 0;
        this.caja.venta.totales.descuentoF = 0;

        this.caja.venta.totales.totalCobro = 0;

        this.caja.venta.totales.feriaEfectivo = 0;

        this.caja.venta.totales.propina = 0;
        this.caja.venta.totales.propinaConComision = 0;

        this.caja.venta.totales.comisionCobro = 0;
        this.caja.venta.totales.comisionPropina = 0;

        this.caja.venta.servicios.listaServiciosPorCobrar = [];
        this.caja.venta.productos.listaProductosPorCobrar = [];
        this.caja.venta.paquetes.listaPaquetesPorCobrar = [];
        this.caja.venta.cargos.listaCargosPorCobrar = [];        
        this.caja.venta.certificadoRegalo.listaCertificadosPorCobrar = [];

        this.caja.venta.clienteNuevo.mostrarNuevoCliente = false;
        this.caja.venta.clienteNuevo.nombre = "";
        this.caja.venta.clienteNuevo.email = "";
        this.caja.venta.clienteNuevo.telefono = "";
        this.caja.venta.clienteNuevo.fechaNacimiento = null;
        this.caja.venta.estiloListado = 480;
        
        this.caja.venta.parte = 1;
        this.caja.venta.primerPasarAPagar = true;
        this.caja.venta.servicios.mostrarTitulos = false;
        this.caja.venta.propinas = [];

        this.caja.venta.consultaMetodosPagoHecha = false;
        this.caja.venta.fechaPago = format(new Date(), "yyyy-MM-dd")

        // Promociones Nuevas
        this.caja.venta.promocionesNuevas.promocionesAplicadas = [];
        this.caja.venta.promocionesNuevas.codigo = "";

        setTimeout( () => {
            this.caja_ocultarCuentasCobrar();
        }, 10);

        //MAGP 28/03/2022
        this.caja.venta.paquetes.paqueteAplicado = false;
    }

    dtlimpiarmetodosDePago:any = [];
    caja_venta_pasarApartadoVenta () {
        if(this.caja.venta.servicios.listaServiciosPorCobrar.length == 0 && this.caja.venta.productos.listaProductosPorCobrar.length == 0 && 
            this.caja.venta.paquetes.listaPaquetesPorCobrar.length == 0 && this.caja.venta.cargos.listaCargosPorCobrar.length == 0 && this.caja.venta.certificadoRegalo.listaCertificadosPorCobrar.length == 0){
            if(!this.caja.venta.primeraVez){
                this.caja_venta_limpiarVenta();
                this.caja_venta_pasarPrimerVenta();
                this.caja_venta_promocionesNuevas_consultarPromocionesActivasSucursal();                
            }
        }
        for (var i = 0; i < this.dtlimpiarmetodosDePago.length; i++) {
            // $("#DDMetododePagoSelect"+i).removeClass("errorCampo");
            $("#DDMetododePagoSelect" + i + " > div:first-child").attr("style", "outline: none;");
        }        
    }

    // ---------------------------------------------- Cliente ----------------------------------------------
    caja_venta_cambiarCliente () {

        if (this.caja.venta.cliente) {

            for (var i = 0; i < this.caja.venta.listadoClientes.length; i++) {
                if (this.caja.venta.listadoClientes[i].idCliente == this.caja.venta.cliente) {
                    this.caja.venta.nombreCliente = this.caja.venta.listadoClientes[i].nombreBuscar;
                }
            }

            var params:any = {};
            params.idCliente = this.caja.venta.cliente;

            this._backService.HttpPost("procesos/agenda/Agenda/consultarClienteAdeudo", {}, params).subscribe( (data:any) => {
                this.caja.venta.totales.totalCuentasCobrar = data;

                for (var i = 0; i < this.caja.venta.servicios.listaServiciosPorCobrar.length; i++) {
                    if (this.caja.venta.servicios.listaServiciosPorCobrar[i].esCuentaPagar) {
                        this.caja.venta.servicios.listaServiciosPorCobrar.splice(i, 1);
                        i--;
                    }
                }

                for (var i = 0; i < this.caja.venta.productos.listaProductosPorCobrar.length; i++) {
                    if (this.caja.venta.productos.listaProductosPorCobrar[i].esCuentaPagar) {
                        this.caja.venta.productos.listaProductosPorCobrar.splice(i, 1);
                        i--;
                    }
                }

                for (var i = 0; i < this.caja.venta.paquetes.listaPaquetesPorCobrar.length; i++) {
                    if (this.caja.venta.paquetes.listaPaquetesPorCobrar[i].esCuentaPagar) {
                        this.caja.venta.paquetes.listaPaquetesPorCobrar.splice(i, 1);
                        i--;
                    }
                }

                for (var i = 0; i < this.caja.venta.cargos.listaCargosPorCobrar.length; i++) {
                    if (this.caja.venta.cargos.listaCargosPorCobrar[i].esCuentaPagar) {
                        this.caja.venta.cargos.listaCargosPorCobrar.splice(i, 1);
                        i--;
                    }
                }

                for (var i = 0; i < this.caja.venta.certificadoRegalo.listaCertificadosPorCobrar.length; i++) {
                    if (this.caja.venta.certificadoRegalo.listaCertificadosPorCobrar[i].esCuentaPagar) {
                        this.caja.venta.certificadoRegalo.listaCertificadosPorCobrar.splice(i, 1);
                        i--;
                    }
                }

                this.caja_venta_promocionesNuevas_consultarPromocionesActivasSucursal();
            }, error => {
                this._router.navigate(["/login"]);                
            });

        }
        else {
            this.caja.venta.nombreCliente = "";
            this.caja.venta.totales.totalCuentasCobrar = 0;

            for (var i = 0; i < this.caja.venta.servicios.listaServiciosPorCobrar.length; i++) {
                if (this.caja.venta.servicios.listaServiciosPorCobrar[i].esCuentaPagar) {
                    this.caja.venta.servicios.listaServiciosPorCobrar.splice(i, 1);
                    i--;
                }
            }

            for (var i = 0; i < this.caja.venta.productos.listaProductosPorCobrar.length; i++) {
                if (this.caja.venta.productos.listaProductosPorCobrar[i].esCuentaPagar) {
                    this.caja.venta.productos.listaProductosPorCobrar.splice(i, 1);
                    i--;
                }
            }

            for (var i = 0; i < this.caja.venta.paquetes.listaPaquetesPorCobrar.length; i++) {
                if (this.caja.venta.paquetes.listaPaquetesPorCobrar[i].esCuentaPagar) {
                    this.caja.venta.paquetes.listaPaquetesPorCobrar.splice(i, 1);
                    i--;
                }
            }

            for (var i = 0; i < this.caja.venta.cargos.listaCargosPorCobrar.length; i++) {
                if (this.caja.venta.cargos.listaCargosPorCobrar[i].esCuentaPagar) {
                    this.caja.venta.cargos.listaCargosPorCobrar.splice(i, 1);
                    i--;
                }
            }

            for (var i = 0; i < this.caja.venta.certificadoRegalo.listaCertificadosPorCobrar.length; i++) {
                if (this.caja.venta.certificadoRegalo.listaCertificadosPorCobrar[i].esCuentaPagar) {
                    this.caja.venta.certificadoRegalo.listaCertificadosPorCobrar.splice(i, 1);
                    i--;
                }
            }

            this.caja_venta_promocionesNuevas_consultarPromocionesActivasSucursal();
        }

    }
    
    caja_venta_clienteNuevo_nuevoCliente () {
        this.caja.venta.clienteNuevo.mostrarNuevoCliente = true;
        this.caja.venta.cliente = null;
        this.caja.venta.estiloListado = 364;
        this.caja_venta_promocionesNuevas_consultarPromocionesActivasSucursal();
    }

    caja_venta_clienteNuevo_quitarNuevoCliente () {
        this.caja.venta.clienteNuevo.mostrarNuevoCliente = false;
        this.caja.venta.clienteNuevo.nombre = "";
        this.caja.venta.clienteNuevo.email = "";
        this.caja.venta.clienteNuevo.telefono = "";
        this.caja.venta.clienteNuevo.fechaNacimiento = null;
        this.caja.venta.estiloListado = 480;
    }

    caja_venta_clienteNuevo_cambiarFechaNacimiento () {
        if(!this.caja.venta.clienteNuevo.fechaNacimiento){
            this.caja.venta.clienteNuevo.fechaNacimiento = null;
        }
        this.caja_venta_promocionesNuevas_consultarPromocionesActivasSucursal();
    }

    // ----------------------------------------- Cliente Historial -----------------------------------------    
    caja_venta_clienteHistorial_declararGridsHistorialCliente () {
        this.caja.venta.clienteHistorial.gridOptionsCuentasPorCobrar = {
            enableColumnMenus: false,
            enableSorting: true,
            paginationPageSizes: [15, 50, 100],
            paginationPageSize: 15,
            columnDefs: [
                { name: "Tipo", minWidth: '120', field: 'tipoCuenta', headerCellClass: 'alignCenter', cellClass: 'alignCenter', cellTemplate: '<div style="margin-top: 6px;" ng-if="row.entity.tipoCuenta == 1 && row.entity.idServicio_idInventarioPresentacion_idPaqueteSucursal != null"> Servicio </div> <div style="margin-top: 6px;" ng-if="row.entity.tipoCuenta == 1 && row.entity.idServicio_idInventarioPresentacion_idPaqueteSucursal == null"> Cargo </div> <div style="margin-top: 6px;" ng-if="row.entity.tipoCuenta == 2"> Producto </div> <div style="margin-top: 6px;" ng-if="row.entity.tipoCuenta == 3"> Paquete </div>' },
                { name: "Folio de Venta", minWidth: '120', field: 'folio_caja', headerCellClass: 'alignCenter', cellClass: 'alignCenter' },
                { name: "Descripcion", minWidth: '180', field: 'nombreCuenta', headerCellClass: 'alignCenter', cellClass: 'alignCenter' },
                { name: "Fecha", minWidth: '110', displayName: "Fecha", field: 'fecha', headerCellClass: 'alignCenter', cellClass: 'alignCenter', type: 'date', cellFilter: 'date:"dd/MM/yyyy"' },
                { name: "Monto", minWidth: '120', field: 'monto', headerCellClass: 'alignCenter', cellClass: 'alignCenter', cellFilter: 'currency' },
                { name: 'Pagar', minWidth: '80', field: 'porPagar', enableSorting: false, cellClass: 'alignCenter', headerCellClass: 'alignCenter2', cellTemplate: '<div class="ui-grid-cell-contents" style="color:#337dc0;"> <input type="checkbox" style="margin-top: 4px;" ng-model="row.entity.porPagar" ng-disabled="row.entity.bloqueado"/> </div>' },
            ],
            data: "caja.venta.clienteHistorial.dataCuentasPorCobrar",
        };

        this.caja.venta.clienteHistorial.gridOptionsClienteHistorialVentas = {
            enableColumnMenus: false,
            enableSorting: true,
            paginationPageSizes: [15, 50, 100],
            paginationPageSize: 15,
            columnDefs: [
                { name: "Acciones", width: '120', field: 'folio_caja', headerCellClass: 'alignCenter', cellClass: 'alignCenter', cellTemplate: '<div class="ui-grid-cell-contents" style="color:#337dc0;"><li style=" margin-left:19.5px;font-size: 1.5em; cursor:pointer;" class="iconos fa fa-trash-o" ng-click="$root.caja.venta.clienteHistorial.confirmacionEliminarVenta(row.entity)" ng-if="$root.accesosPantalla.caja.ventaEliminar && row.entity.montoTotalPagoPaypal == 0" ></li></div>' },
                { name: "Folio de Venta", minWidth: '120', field: 'folio_caja', headerCellClass: 'alignCenter', cellClass: 'alignCenter', cellTemplate: '<div class="ui-grid-cell-contents ng-binding ng-scope" style="margin-top:0px;"><a class="nwLink2" href="javascript:void(0);"  ng-click="$root.caja.movimientos.mostrarTicketFolioVenta(row.entity.folio_caja_original)">{{row.entity.folio_caja}}</a></div>' },
                { name: "Fecha Venta", minWidth: '120', displayName: "Fecha", field: 'fechaPago', headerCellClass: 'alignCenter', cellClass: 'alignCenter', type: 'date', cellFilter: 'date:"dd/MM/yyyy"' },
                { name: "Monto", minWidth: '120', field: 'montoTotal', headerCellClass: 'alignCenter', cellClass: 'alignCenter', cellFilter: 'currency' },
            ],
            data: "caja.venta.clienteHistorial.dataVentas",
        };
    }

    caja_venta_clienteHistorial_abrirModalClienteHistorial () {
        this._pantallaServicio.mostrarSpinner();
        this.caja.venta.clienteHistorial.dataCuentasPorCobrar = [];
        this.caja.venta.clienteHistorial.dataVentas = [];
        
        this.caja.venta.clienteHistorial.fechaInicio = moment(new Date()).add(-365, 'days').format('DD/MM/YYYY');
        this.caja.venta.clienteHistorial.fechaFin = moment(new Date()).format('DD/MM/YYYY');

        this.caja_venta_clienteHistorial_inicializarCalendario();
        this.caja_venta_clienteHistorial_consultaClienteHistorial();

        this.modales.modalServiciosCobrar.show();
    }

    caja_venta_clienteHistorial_inicializarCalendario () {
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
        // $('input[name="calendarioClienteHistorial"]').daterangepicker({
        //     startDate:  this.caja.venta.clienteHistorial.fechaInicio,
        //     endDate: this.caja.venta.clienteHistorial.fechaFin,
                    
        //     ranges: {
        //         [dias]: [moment().subtract(6, 'days'), moment()],
        //         [meses]: [moment().startOf('month'), moment().endOf('month')],
        //         [años]: [moment().startOf('year'), moment().endOf('year')]
        //     },
        //     locale:{
        //         "daysOfWeek": [
        //             [domingo],
        //             [lunes],
        //             [martes],
        //             [miercoles],
        //             [jueves],
        //             [viernes],
        //             [sabado]
        //         ],
        //         "monthNames": [
        //             [eneroS],
        //             [febreroS],
        //             [marzoS],
        //             [abrilS],
        //             [mayoS],
        //             [junioS],
        //             [julioS],
        //             [agostoS],
        //             [septiembreS],
        //             [octubreS],
        //             [noviembreS],
        //             [diciembreS]
        //         ],
        //         applyLabel: aceptar,
        //         cancelLabel: cancelar,
        //         customRangeLabel: rango                        
        //     }                   
        // });

        var fechaC = this.caja.venta.clienteHistorial.fechaInicio + " - " + this.caja.venta.clienteHistorial.fechaFin;
        this.caja.venta.clienteHistorial.fechaCalendario = fechaC;
        this.primerCargaModalHistorial = 0;
    }

    primerCargaModalHistorial = 0;
    primerCargaModalHistorialOpen = 0;
    caja_venta_clienteHistorial_consultaClienteHistorial () {
        if(this.primerCargaModalHistorialOpen >= 1){
            this._pantallaServicio.mostrarSpinner();
            var params:any = {};
        
            if(this.primerCargaModalHistorial < 2 && this.caja.venta.clienteHistorial.fechaCalendario.split != undefined){
                var fechasAux = this.caja.venta.clienteHistorial.fechaCalendario.split(" - ");
                var f1 = fechasAux[0].split('/'); 
                var f2 = fechasAux[1].split('/');

                params.fechaInicio = new Date();
                params.fechaFin = new Date();
                params.fechaInicio.setFullYear(f1[2], f1[1]-1, f1[0]);
                params.fechaFin.setFullYear(f2[2], f2[1]-1, f2[0]);
                params.fechaInicio.setHours(0, 0, 0, 0);
                params.fechaFin.setHours(0, 0, 0, 0);

                this.caja.venta.clienteHistorial.fechaCalendario = {
                    endDate: dayjs(`${f2[2]}/${f2[1]}/${f2[0]}`),
                    startDate: dayjs(`${f1[2]}/${f1[1]}/${f1[0]}`),
                };
            }else{
                params.fechaInicio = new Date();
                params.fechaFin = new Date();
                params.fechaInicio.setFullYear(this.caja.venta.clienteHistorial.fechaCalendario.startDate['$y'], (this.caja.venta.clienteHistorial.fechaCalendario.startDate['$M']), this.caja.venta.clienteHistorial.fechaCalendario.startDate['$D']);
                params.fechaFin.setFullYear(this.caja.venta.clienteHistorial.fechaCalendario.endDate['$y'], (this.caja.venta.clienteHistorial.fechaCalendario.endDate['$M']), this.caja.venta.clienteHistorial.fechaCalendario.endDate['$D']);
                params.fechaInicio.setHours(0, 0, 0, 0);
                params.fechaFin.setHours(0, 0, 0, 0);
            }        

            this.primerCargaModalHistorial += 1;

            params.idCliente = this.caja.venta.cliente;

            this._backService.HttpPost("procesos/agenda/Agenda/consultarCuentasPorCobrar", {}, params).subscribe( (data:any) => {
                this.caja.venta.clienteHistorial.dataCuentasPorCobrar = eval(data);                

                for (var i = 0; i < this.caja.venta.clienteHistorial.dataCuentasPorCobrar.length; i++) {
                    this.caja.venta.clienteHistorial.dataCuentasPorCobrar[i].porPagar = false;
                    this.caja.venta.clienteHistorial.dataCuentasPorCobrar[i].bloqueado = false;
                }

                for (var i = 0; i < this.caja.venta.servicios.listaServiciosPorCobrar.length; i++) {
                    if (this.caja.venta.servicios.listaServiciosPorCobrar[i].esCuentaPagar) {
                        for (var j = 0; j < this.caja.venta.clienteHistorial.dataCuentasPorCobrar.length; j++) {
                            if (this.caja.venta.servicios.listaServiciosPorCobrar[i].idPagoClienteDetalle == this.caja.venta.clienteHistorial.dataCuentasPorCobrar[j].idPagoClienteDetalle) {
                                this.caja.venta.clienteHistorial.dataCuentasPorCobrar[j].porPagar = true;
                                this.caja.venta.clienteHistorial.dataCuentasPorCobrar[j].bloqueado = true;
                            }
                        }
                    }
                }
                for (var i = 0; i < this.caja.venta.productos.listaProductosPorCobrar.length; i++) {
                    if (this.caja.venta.productos.listaProductosPorCobrar[i].esCuentaPagar) {
                        for (var j = 0; j < this.caja.venta.clienteHistorial.dataCuentasPorCobrar.length; j++) {
                            if (this.caja.venta.productos.listaProductosPorCobrar[i].idPagoClienteDetalle == this.caja.venta.clienteHistorial.dataCuentasPorCobrar[j].idPagoClienteDetalle) {
                                this.caja.venta.clienteHistorial.dataCuentasPorCobrar[j].porPagar = true;
                                this.caja.venta.clienteHistorial.dataCuentasPorCobrar[j].bloqueado = true;
                            }
                        }
                    }
                }
                for (var i = 0; i < this.caja.venta.paquetes.listaPaquetesPorCobrar.length; i++) {
                    if (this.caja.venta.paquetes.listaPaquetesPorCobrar[i].esCuentaPagar) {
                        for (var j = 0; j < this.caja.venta.clienteHistorial.dataCuentasPorCobrar.length; j++) {
                            if (this.caja.venta.paquetes.listaPaquetesPorCobrar[i].idPagoClienteDetalle == this.caja.venta.clienteHistorial.dataCuentasPorCobrar[j].idPagoClienteDetalle) {
                                this.caja.venta.clienteHistorial.dataCuentasPorCobrar[j].porPagar = true;
                                this.caja.venta.clienteHistorial.dataCuentasPorCobrar[j].bloqueado = true;
                            }
                        }
                    }
                }
                for (var i = 0; i < this.caja.venta.cargos.listaCargosPorCobrar.length; i++) {
                    if (this.caja.venta.cargos.listaCargosPorCobrar[i].esCuentaPagar) {
                        for (var j = 0; j < this.caja.venta.clienteHistorial.dataCuentasPorCobrar.length; j++) {
                            if (this.caja.venta.cargos.listaCargosPorCobrar[i].idPagoClienteDetalle == this.caja.venta.clienteHistorial.dataCuentasPorCobrar[j].idPagoClienteDetalle) {
                                this.caja.venta.clienteHistorial.dataCuentasPorCobrar[j].porPagar = true;
                                this.caja.venta.clienteHistorial.dataCuentasPorCobrar[j].bloqueado = true;
                            }
                        }
                    }
                }

                this.dataSourceCuentasPorCobrar.data = this.caja.venta.clienteHistorial.dataCuentasPorCobrar;
                this.dataSourceCuentasPorCobrar.paginator = this.paginacionCuentasPorCobrar;
		        this.dataSourceCuentasPorCobrar.sort = this.sort;

                this._backService.HttpPost("procesos/agenda/Agenda/consultarVentaClienteHistorial", {}, params).subscribe( (data:any) => {
                    this.caja.venta.clienteHistorial.dataVentas = eval(data);
                    this.dataSourceClienteHistorialVentas.data = data;
                    this.dataSourceClienteHistorialVentas.paginator = this.paginacionClienteHistorialVentas;
		            this.dataSourceClienteHistorialVentas.sort = this.sort;

                    this._pantallaServicio.ocultarSpinner();
                }, error => {
                    this._router.navigate(["/login"]);
                });
            }, error => {
                this._router.navigate(["/login"]);
            });
        }

        this.primerCargaModalHistorialOpen += 1;
    }

    caja_venta_clienteHistorial_agregarCuentasPorCobrar () {
        for (var i = 0; i < this.caja.venta.clienteHistorial.dataCuentasPorCobrar.length; i++) {
            if (this.caja.venta.clienteHistorial.dataCuentasPorCobrar[i].porPagar && !this.caja.venta.clienteHistorial.dataCuentasPorCobrar[i].bloqueado) {

                if (this.caja.venta.clienteHistorial.dataCuentasPorCobrar[i].tipoCuenta == 1) {
                    if (this.caja.venta.clienteHistorial.dataCuentasPorCobrar[i].idServicio_idInventarioPresentacion_idPaqueteSucursal != null) {
                        // Se agrega un servicio por pagar
                        this.caja.venta.servicios.listaServiciosPorCobrar.unshift({
                            idServicio: this.caja.venta.clienteHistorial.dataCuentasPorCobrar[i].idServicio_idInventarioPresentacion_idPaqueteSucursal,
                            nombreServicio: this.caja.venta.clienteHistorial.dataCuentasPorCobrar[i].nombreCuenta,
                            listadoServicio: [],
                            idPersonal: this.caja.venta.clienteHistorial.dataCuentasPorCobrar[i].idPersonal,
                            nombrePersonal: this.caja.venta.clienteHistorial.dataCuentasPorCobrar[i].nombrePersonal,

                            costoMinimo: 0,
                            costoMaximo: 0,

                            costoElegido: this.caja.venta.clienteHistorial.dataCuentasPorCobrar[i].monto,
                            costoDescuento: this.caja.venta.clienteHistorial.dataCuentasPorCobrar[i].monto,

                            mostrarBotonDescuento: false,
                            mostrarDescuento: false,
                            descuentoP: 0,
                            descuentoF: 0,

                            esVenta: false,
                            esCuentaPagar: true,

                            idPagoClienteDetalle: this.caja.venta.clienteHistorial.dataCuentasPorCobrar[i].idPagoClienteDetalle,
                            montoPrepagado: 0,

                            idCita: null, 
                            idCitaDetalle: null,
                            idPaqueteSucursalCliente: null,
                            idPaqueteSucursalClienteServicioDetalle: null,

                            noAplicablePromociones: true
                        });

                    }
                    if (this.caja.venta.clienteHistorial.dataCuentasPorCobrar[i].idServicio_idInventarioPresentacion_idPaqueteSucursal == null) {
                        // Se agrega un cargo por pagar
                        this.caja.venta.cargos.listaCargosPorCobrar.unshift({
                            descripcion: this.caja.venta.clienteHistorial.dataCuentasPorCobrar[i].nombreCuenta,
                            costoElegido: this.caja.venta.clienteHistorial.dataCuentasPorCobrar[i].monto,
                            esVenta: false,
                            esCuentaPagar: true,
                            idPagoClienteDetalle: this.caja.venta.clienteHistorial.dataCuentasPorCobrar[i].idPagoClienteDetalle
                        });
                    }
                }

                if (this.caja.venta.clienteHistorial.dataCuentasPorCobrar[i].tipoCuenta == 2) {
                    this.caja.venta.productos.listaProductosPorCobrar.unshift({
                        idPersonal: this.caja.venta.clienteHistorial.dataCuentasPorCobrar[i].idPersonal,
                        nombrePersonal: this.caja.venta.clienteHistorial.dataCuentasPorCobrar[i].nombrePersonal,
                        idInventarioPresentacion: this.caja.venta.clienteHistorial.dataCuentasPorCobrar[i].idServicio_idInventarioPresentacion_idPaqueteSucursal,
                        nombrePresentacion: this.caja.venta.clienteHistorial.dataCuentasPorCobrar[i].nombreCuenta,
                        listadoPresentaciones: JSON.parse(JSON.stringify(this.caja.venta.listadoPresentacionesCopia)),
                        cantidad: this.caja.venta.clienteHistorial.dataCuentasPorCobrar[i].cantidadProducto,
                        precioUnitario: 0,
                        cantidadMaxima: 1,
                        iva: "",
                        costoElegido: this.caja.venta.clienteHistorial.dataCuentasPorCobrar[i].monto,
                        costoDescuento: this.caja.venta.clienteHistorial.dataCuentasPorCobrar[i].monto,
                        mostrarBotonDescuento: false,
                        mostrarDescuento: false,
                        descuentoP: 0,
                        descuentoF: 0,

                        esVenta: false,
                        esCuentaPagar: true,

                        idPagoClienteDetalle: this.caja.venta.clienteHistorial.dataCuentasPorCobrar[i].idPagoClienteDetalle
                    });
                }

                if (this.caja.venta.clienteHistorial.dataCuentasPorCobrar[i].tipoCuenta == 3) {
                    this.caja.venta.paquetes.listaPaquetesPorCobrar.unshift({
                        idPersonal: this.caja.venta.clienteHistorial.dataCuentasPorCobrar[i].idPersonal,
                        nombrePersonal: this.caja.venta.clienteHistorial.dataCuentasPorCobrar[i].nombrePersonal,
                        idPaqueteSucursal: this.caja.venta.clienteHistorial.dataCuentasPorCobrar[i].idServicio_idInventarioPresentacion_idPaqueteSucursal,
                        nombrePaquete: this.caja.venta.clienteHistorial.dataCuentasPorCobrar[i].nombreCuenta,
                        costoElegido: this.caja.venta.clienteHistorial.dataCuentasPorCobrar[i].monto,
                        costoElegidoEditable: true,
                        costoDescuento: this.caja.venta.clienteHistorial.dataCuentasPorCobrar[i].monto,
                        mostrarBotonDescuento: false,
                        mostrarDescuento: false,
                        descuentoP: 0,
                        descuentoF: 0,
                        costoVenta: null,

                        esVenta: false,
                        esCuentaPagar: true,

                        idPagoClienteDetalle: this.caja.venta.clienteHistorial.dataCuentasPorCobrar[i].idPagoClienteDetalle,

                        idPaqueteSucursalCliente: this.caja.venta.clienteHistorial.dataCuentasPorCobrar[i].idPaqueteSucursalCliente,
                        costoPorPagar: null,
                        montoPagado: null,
                        idCita: null
                    });
                }
                
            }
        }

        this.caja_venta_calcularTotales();

        this.modales.modalServiciosCobrar.hide();
    }

    caja_venta_clienteHistorial_confirmacionEliminarVenta (entity:any) {
        this.caja.venta.clienteHistorial.folioVentaSeleccionado = entity.folio_caja_original;
        this.caja.venta.clienteHistorial.motivoBaja = "";
        this.modales.modalConfirmarEliminarVenta.show();
    }

    caja_venta_clienteHistorial_cancelarEliminacion () {
        $("#textAreaMotivoBaja").removeClass("errorCampo");
    }

    caja_venta_clienteHistorial_eliminarVenta () {

        $("#textAreaMotivoBaja").removeClass("errorCampo");

        if(this.caja.venta.clienteHistorial.motivoBaja){

            // $('#modalConfirmarEliminarVenta').modal("hide");
            this.modales.modalConfirmarEliminarVenta.hide();
            this._pantallaServicio.mostrarSpinner();

            var params:any = {};
            params.folioVenta = this.caja.venta.clienteHistorial.folioVentaSeleccionado;
            params.observaciones = "Eliminación de Venta";
            params.motivoBaja = this.caja.venta.clienteHistorial.motivoBaja;

            this._backService.HttpPost("procesos/agenda/Agenda/eliminarClienteVenta", {}, params).subscribe( (data:any) => {
                switch(data){
                    case "-1": {
                        this._pantallaServicio.ocultarSpinner();
                        this._toaster.error("No se puede realizar la Eliminación de la Venta debido a que ya cuenta con una Devolución de productos");                        
                        break;
                    }

                    case "-2": {
                        this._pantallaServicio.ocultarSpinner();
                        this._toaster.error("No se puede realizar la Eliminación de la Venta debido a que hay Citas agendadas que contienen servicios de los Paquetes de esta venta");                        
                        break;
                    }

                    case "-3": {
                        this._pantallaServicio.ocultarSpinner();
                        this._toaster.error("No se puede realizar la Eliminación de la Venta debido a que ya se realizó al menos un pago con un Certificado de Regalo vendido");                        
                        break;
                    }

                    default: {

                        // Se eliminan todas las ventas que eran cuentas por pagar para que se vuelvan a elegir
                        for (var i = 0; i < this.caja.venta.servicios.listaServiciosPorCobrar.length; i++) {
                            if (this.caja.venta.servicios.listaServiciosPorCobrar[i].esCuentaPagar) {
                                this.caja.venta.servicios.listaServiciosPorCobrar.splice(i, 1);
                                i--;
                            }
                        }

                        for (var i = 0; i < this.caja.venta.productos.listaProductosPorCobrar.length; i++) {
                            if (this.caja.venta.productos.listaProductosPorCobrar[i].esCuentaPagar) {
                                this.caja.venta.productos.listaProductosPorCobrar.splice(i, 1);
                                i--;
                            }
                        }

                        for (var i = 0; i < this.caja.venta.paquetes.listaPaquetesPorCobrar.length; i++) {
                            if (this.caja.venta.paquetes.listaPaquetesPorCobrar[i].esCuentaPagar) {
                                this.caja.venta.paquetes.listaPaquetesPorCobrar.splice(i, 1);
                                i--;
                            }
                        }

                        for (var i = 0; i < this.caja.venta.cargos.listaCargosPorCobrar.length; i++) {
                            if (this.caja.venta.cargos.listaCargosPorCobrar[i].esCuentaPagar) {
                                this.caja.venta.cargos.listaCargosPorCobrar.splice(i, 1);
                                i--;
                            }
                        }

                        var params:any = {};
                        params.idCliente = this.caja.venta.cliente;

                        this._backService.HttpPost("procesos/agenda/Agenda/consultarClienteAdeudo", {}, params).subscribe( (data:any) => {
                            this.caja.venta.totales.totalCuentasCobrar = data;
                            this.caja_venta_clienteHistorial_consultaClienteHistorial();
                        }, error => {
                            this._router.navigate(["/login"]);
                        });
                        break;
                    }
                }
            }, error => {
                this._router.navigate(["/login"]);
            });
        }
        else{
            $("#textAreaMotivoBaja").addClass("errorCampo");
            this._pantallaServicio.ocultarSpinner();
        }

    }

    // --------------------------------------- Apartado de servicios ---------------------------------------
    
    caja_venta_servicios_agregarServicio () {        
        var error = 0;
        for (var i = 0; i < this.caja.venta.servicios.listaServiciosPorCobrar.length; i++) {

            // $("#servicioDDLPersonal" + i).removeClass("errorCampo");
            // $("#servicioDDLServicio" + i).removeClass("errorCampo");

            $("#servicioDDLPersonal"+ i +" > div:first-child").attr("style", "outline: none;");
            $("#servicioDDLServicio"+ i +" > div:first-child").attr("style", "outline: none;");

            if (this.caja.venta.servicios.listaServiciosPorCobrar[i].esVenta) {
                if (!this.caja.venta.servicios.listaServiciosPorCobrar[i].idPersonal) {
                    error++;
                    // $("#servicioDDLPersonal" + i).addClass("errorCampo");
                    $("#servicioDDLPersonal"+ i +" > div:first-child").attr("style", "outline: red solid 1px !important;");
                }
                if (!this.caja.venta.servicios.listaServiciosPorCobrar[i].idServicio) {
                    error++;
                    // $("#servicioDDLServicio" + i).addClass("errorCampo");
                    $("#servicioDDLServicio"+ i +" > div:first-child").attr("style", "outline: red solid 1px !important;");
                }
            }

        }

        if(error == 0){
            this.caja.venta.servicios.listaServiciosPorCobrar.push({
                idServicio: null,
                nombreServicio: null,
                listadoServicio: [],
                idPersonal: null,

                costoMinimo: 0,
                costoMaximo: 0,

                costoElegido: 0,
                costoDescuento: 0,

                mostrarBotonDescuento: false,
                mostrarDescuento: false,
                descuentoP: 0,
                descuentoF: 0,

                esVenta: true,
                esCuentaPagar: false,

                idPagoClienteDetalle: null,
                montoPrepagado: 0,

                idCita: null,
                idCitaDetalle: null,
                idPaqueteSucursalCliente: null,
                idPaqueteSucursalClienteServicioDetalle: null,

                noAplicablePromociones: false
            });
        }
    }

    caja_venta_servicios_limpiarServicio (s:any) {
        s.idServicio = "";
        s.costoMinimo = 0;
        s.costoMaximo = 0; 
        s.costoElegido = 0;
        s.costoDescuento = 0;
        s.mostrarBotonDescuento = false;
        s.mostrarDescuento = false;
        s.descuentoP = 0;
        s.descuentoF = 0;
        s.montoPrepagado = 0;
    }

    caja_venta_servicios_consultarServiciosPorPersonal (s:any) {
        this.caja_venta_servicios_limpiarServicio(s);
        this.caja_venta_promocionesNuevas_aplicarPromociones();
        this.caja_venta_calcularTotales();
        var params:any = {};
        params.idPersonal = s.idPersonal;
        params.idCita = null;

        this._backService.HttpPost("procesos/agenda/Agenda/selectServicioCita", {}, params).subscribe( (data:any) => {
            s.listadoServicio = eval(data);
            this.caja.venta.servicios.listaServiciosPorCobrar.listadoServicioBuffer = JSON.parse(JSON.stringify(s.listadoServicio));
        }, error => {
            this._router.navigate(["/login"]);
        });
    }

    caja_venta_servicios_consultarServiciosPorPersonal2 (s:any) {
        var params:any = {};
        params.idPersonal = s.idPersonal;
        params.idCita = null;

        this._backService.HttpPost("procesos/agenda/Agenda/selectServicioCita", {}, params).subscribe( (data:any) => {
            s.listadoServicio = eval(data);
            this.caja.venta.servicios.listaServiciosPorCobrar.listadoServicioBuffer = JSON.parse(JSON.stringify(s.listadoServicio));
        }, error => {
            this._router.navigate(["/login"]);
        });
    }

    caja_venta_servicios_consultarServiciosPorPersonal3 (i:any) {
        var params: any = {};
        params.idPersonal = this.caja.venta.servicios.listaServiciosPorCobrar[i].idPersonal;
        params.idCita = null;
        this._backService.HttpPost("procesos/agenda/Agenda/selectServicioCita", {}, params).subscribe( (data:any) => {
            this.caja.venta.servicios.listaServiciosPorCobrar[i].listadoServicio = eval(data);
            this.caja.venta.servicios.listaServiciosPorCobrar[i].listadoServicioBuffer = JSON.parse(JSON.stringify(this.caja.venta.servicios.listaServiciosPorCobrar[i].listadoServicio));
            if (this.caja.venta.servicios.listaServiciosPorCobrar[i].esVenta) {
                var tipoServicio = "";
                var serviciosListado = this.caja.venta.servicios.listaServiciosPorCobrar[i].listadoServicio;
                serviciosListado.forEach( (service:any) => {
                    if (service.idServicio == this.caja.venta.servicios.listaServiciosPorCobrar[i].idServicio) {
                        tipoServicio = service.descripcion
                    }
                });
                if (tipoServicio == "Rango" || tipoServicio == "Aproximado") {
                    this.caja.venta.servicios.listaServiciosPorCobrar[i].costoElegido = "";
                } else if (tipoServicio == "Fijo") {
                    this.caja.venta.servicios.listaServiciosPorCobrar[i].costoMaximo = this.caja.venta.servicios.listaServiciosPorCobrar[i].costoMinimo;
                }
            }

            if(i == (this.caja.venta.servicios.listaServiciosPorCobrar.length - 1)){
                this.caja_venta_calcularTotales();
                this.caja_venta_pasarPrimerVenta();
            }
        }, error => {
            this._router.navigate(["/login"]);
        });
    }

    caja_venta_servicios_actualizarCostoPorServicio (s:any, ser:any, index:any) {
        s.nombreServicio = ser.nombre;
        s.costoMinimo = Number(ser.costoMinimo);
        if (ser.costoMaximo != null) {
            s.costoMaximo = Number(ser.costoMaximo);
        }
        else {
            s.costoMaximo = Number(ser.costoMinimo);
        }

        if (s.costoMinimo != 0 && s.costoMaximo != "" && s.costoMaximo != 0 && s.costoMaximo != null) {
            if (s.costoMaximo != s.costoMinimo) {
                s.costoElegido = "";
                if(this._pantallaServicio.idSucursal == 301){
                    $("#servicioInputCosto" + index).removeAttr('disabled');
                }
               
            } else {
                s.costoElegido = s.costoMinimo;
                if(this._pantallaServicio.idSucursal == 301){
                    $("#servicioInputCosto" + index).attr('disabled', 'disabled');
                }
                  
            }
        } else {
            s.costoMaximo = s.costoMinimo;
            s.costoElegido = s.costoMinimo;
            if(this._pantallaServicio.idSucursal == 301){
                $("#servicioInputCosto" + index).removeAttr('disabled');
            }
           
        }
        s.costoDescuento = 0;

        s.mostrarBotonDescuento = true;
        s.descuentoP = 0;
        s.descuentoF = 0;

        this.caja_venta_promocionesNuevas_aplicarPromociones();
        this.caja_venta_calcularTotales();
        this.caja_venta_servicios_cambiarCostoServicio(s, index);
    }

    caja_venta_servicios_cambiarCostoServicio (s:any, index:any) {
        var floatRegex = RegExp("^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$");
        if (s.costoElegido != "") {
            if (floatRegex.test(s.costoElegido)) {
                s.costoDescuento = Number(s.costoElegido);
                s.descuentoP = 0;
                s.descuentoF = 0;
                this.caja_venta_promocionesNuevas_aplicarPromociones();
                this.caja_venta_calcularTotales();
            }
            else {
                s.costoElegido = 0;
                s.costoDescuento = 0;
                s.descuentoP = 0;
                s.descuentoF = 0;
                this.caja_venta_promocionesNuevas_aplicarPromociones();
                this.caja_venta_calcularTotales();
            }
        }
    }

    caja_venta_servicios_prevenirCostoVacio (s:any, index:any) {
        if (s.costoElegido == "") {
            s.costoElegido = 0;
            s.costoDescuento = Number(s.costoElegido);
            s.descuentoP = 0;
            s.descuentoF = 0;
            this.caja_venta_promocionesNuevas_aplicarPromociones();
            this.caja_venta_calcularTotales();
        }
    }

    caja_venta_servicios_mostrarDescuento (s:any) {
        s.costoDescuento = JSON.parse(JSON.stringify(s.costoElegido));

        s.descuentoP = 0;
        s.descuentoF = 0;

        if (s.mostrarDescuento) {
            s.mostrarDescuento = false;
        }
        else {
            s.mostrarDescuento = true;
        }
    }

    caja_venta_servicios_calcularDescuentoServicio (s:any, opc:any, index:any) {
        var floatRegex = RegExp("^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$");
        if (opc == 1) {
            if (s.descuentoP !== "") {
                if (floatRegex.test(s.descuentoP)) {
                    if (parseFloat(s.descuentoP) > 100) {
                        s.descuentoP = 100;
                    }
                    s.costoDescuento = Number((parseFloat(s.costoElegido) * (1 - (parseFloat(s.descuentoP) / 100))).toFixed(2));
                    s.descuentoF = Number((parseFloat(s.costoElegido) * (parseFloat(s.descuentoP) / 100)).toFixed(2));
                    this.caja_venta_promocionesNuevas_aplicarPromociones();
                    this.caja_venta_calcularTotales();
                }
                else {
                    s.descuentoP = 0;
                    s.costoDescuento = parseFloat(s.costoElegido);
                    s.descuentoF = 0;
                    this.caja_venta_promocionesNuevas_aplicarPromociones();
                    this.caja_venta_calcularTotales();
                }
            }
        }
        if (opc == 2) {
            if (s.descuentoF !== "") {
                if (floatRegex.test(s.descuentoF)) {
                    if (parseFloat(s.descuentoF) > s.costoElegido) {
                        s.descuentoF = s.costoElegido;
                    }
                    s.costoDescuento = Number((parseFloat(s.costoElegido) - parseFloat(s.descuentoF)).toFixed(2));
                    s.descuentoP = Number((parseFloat(s.descuentoF) * 100 / parseFloat(s.costoElegido)).toFixed(2));
                    this.caja_venta_promocionesNuevas_aplicarPromociones();
                    this.caja_venta_calcularTotales();
                }
                else {
                    s.descuentoP = 0;
                    s.costoDescuento = parseFloat(s.costoElegido);
                    s.descuentoF = 0;
                    this.caja_venta_promocionesNuevas_aplicarPromociones();
                    this.caja_venta_calcularTotales();
                }
            }
        }
    }

    caja_venta_servicios_quitarCerosServicios (s:any, opc:any) {
        if (opc == 1) {
            if (s.descuentoP == 0) {
                s.descuentoP = "";
            }
        }
        if (opc == 2) {
            if (s.descuentoF == 0) {
                s.descuentoF = "";
            }
        }
    }

    caja_venta_servicios_ponerCerosServicios (s:any, opc:any, index:any) {
        if (opc == 1) {
            if (s.descuentoP == "") {
                s.descuentoP = 0;
                this.caja_venta_servicios_calcularDescuentoServicio(s, opc, index);
            }
        }
        if (opc == 2) {
            if (s.descuentoF == "") {
                s.descuentoF = 0;
                this.caja_venta_servicios_calcularDescuentoServicio(s, opc, index);
            }
        }
    }

    //MAGP 25/03/2022
    caja_venta_servicios_removerServicio (index:any) {
        var serviciosCitaCantidad = 0;
        for (var i = 0; i < this.caja.venta.servicios.listaServiciosPorCobrar.length; i++) {
            if (this.caja.venta.servicios.listaServiciosPorCobrar[i].idCita != null) {
                serviciosCitaCantidad++;
            }
        }
        if (this.caja.venta.servicios.listaServiciosPorCobrar[index].idCita != null && serviciosCitaCantidad <= 1) { //Si es el último servicio con cita no se puede borrar
            this._toaster.error("No se puede eliminar el servicio, debe haber al menos un servicio para terminar la cita");            
        }
        else if (this.caja.venta.servicios.listaServiciosPorCobrar[index].idPagoClienteDetalle != null) { //Si está prepagado no se puede borrar desde aquí
            this._toaster.error("No se puede eliminar el servicio de la venta, es un servicio por pagar o pre pagado");            
        }
        else {
            this.caja.venta.servicios.listaServiciosPorCobrar.splice(index, 1);
            this.caja_venta_promocionesNuevas_aplicarPromociones();
            this.caja_venta_calcularTotales();
        }
    }

    // --------------------------------------- Apartado de productos ---------------------------------------
    caja_venta_productos_agregarProductos () {
        if (this.caja.venta.productos.listaProductosPorCobrar.length != 0) {
            if (this.caja.venta.productos.listaProductosPorCobrar[this.caja.venta.productos.listaProductosPorCobrar.length - 1].idInventarioPresentacion != "" && this.caja.venta.productos.listaProductosPorCobrar[this.caja.venta.productos.listaProductosPorCobrar.length - 1].idInventarioPresentacion != null) {
                // $("#productoDDLPresentacion" + (this.caja.venta.productos.listaProductosPorCobrar.length - 1)).removeClass("errorCampo");
                $("#productoDDLPresentacion" + (this.caja.venta.productos.listaProductosPorCobrar.length - 1) + " > div:first-child").attr("style", "outline: none;");
                this.caja.venta.productos.listaProductosPorCobrar.push({
                    idPersonal: null,
                    idInventarioPresentacion: null,
                    nombrePresentacion: "",
                    listadoPresentaciones: JSON.parse(JSON.stringify(this.caja.venta.listadoPresentacionesCopia)),
                    cantidad: 0,
                    precioUnitario: 0,
                    cantidadMaxima: 1,
                    iva: "",
                    costoElegido: 0,
                    costoDescuento: 0,
                    mostrarBotonDescuento: false,
                    mostrarDescuento: false,
                    descuentoP: 0,
                    descuentoF: 0,
                    esVenta: true,
                    esCuentaPagar: false,
                    idPagoClienteDetalle: null
                });

                setTimeout( () => {
                    // $("#productoDDLPresentacion" + (this.caja.venta.productos.listaProductosPorCobrar.length - 1))[0].children[0].click();
                    setTimeout( () => {
                        const target = $("#productoDDLPresentacion" + (this.caja.venta.productos.listaProductosPorCobrar.length - 1))[0].firstElementChild.firstElementChild.lastElementChild.firstElementChild;
                        target.focus();
                    }, 10);
                }, 10);

            }
            else {
                // $("#productoDDLPresentacion" + (this.caja.venta.productos.listaProductosPorCobrar.length - 1)).addClass("errorCampo");
                $("#productoDDLPresentacion" + (this.caja.venta.productos.listaProductosPorCobrar.length - 1) + " > div:first-child").attr("style", "outline: red solid 1px !important;");

            }

        }
        else {
            this.caja.venta.productos.listaProductosPorCobrar.push({
                idPersonal: null,
                idInventarioPresentacion: null,
                nombrePresentacion: "",
                listadoPresentaciones: JSON.parse(JSON.stringify(this.caja.venta.listadoPresentaciones)),
                cantidad: 0,
                precioUnitario: 0,
                cantidadMaxima: 1,
                iva: "",
                costoElegido: 0,
                costoDescuento: 0,
                mostrarBotonDescuento: false,
                mostrarDescuento: false,
                descuentoP: 0,
                descuentoF: 0,
                esVenta: true,
                esCuentaPagar: false,
                idPagoClienteDetalle: null
            });

            setTimeout( () => {
                // $("#productoDDLPresentacion" + (this.caja.venta.productos.listaProductosPorCobrar.length - 1))[0].children[0].click();
                setTimeout( () => {
                    const target = $("#productoDDLPresentacion" + (this.caja.venta.productos.listaProductosPorCobrar.length - 1))[0].firstElementChild.firstElementChild.lastElementChild.firstElementChild;
                    target.focus();
                }, 10);
            }, 10);
        }
    }

    caja_venta_productos_elegirPresentacion (p:any, prod:any, indexProducto:any) {
        p.nombrePresentacion = prod.nombreProducto;
        p.cantidadMaxima = Number(prod.existencia);
        p.cantidad = 1;
        if (prod.aplicaIva) {
            p.iva = Number(this.caja.venta.ivaSucursal);
            p.costoElegido = Number((Number(prod.precioVenta) + ( Number(prod.precioVenta) * ( Number(p.iva)))).toFixed(2));
        }
        else {
            p.iva = 0;
            p.costoElegido = Number(prod.precioVenta);
        }
        p.precioUnitario = Number(prod.precioVenta)
        p.mostrarBotonDescuento = true;
        p.costoDescuento = Number(p.costoElegido);
        p.descuentoP = 0;
        p.descuentoF = 0;

        this.caja_venta_promocionesNuevas_aplicarPromociones();
        this.caja_venta_calcularTotales();

        this.caja.venta.listadoPresentacionesCopia = JSON.parse(JSON.stringify(this.caja.venta.listadoPresentaciones));
        for (var i = 0; i < this.caja.venta.productos.listaProductosPorCobrar.length; i++) {
            this.caja.venta.productos.listaProductosPorCobrar[i].listadoPresentaciones = JSON.parse(JSON.stringify(this.caja.venta.listadoPresentaciones));
            this.caja.venta.productos.listaProductosPorCobrar[i].listadoPresentacionesBuffer = JSON.parse(JSON.stringify(this.caja.venta.listadoPresentaciones));
        }

        // Se recorren todos los listados de presentaciones de los demás productos, para quitar la presentación que se eligió 
        for (var i = 0; i < this.caja.venta.productos.listaProductosPorCobrar.length; i++) {
            for (var j = 0; j < this.caja.venta.productos.listaProductosPorCobrar.length; j++) {
                if (i != j) {
                    for (var k = 0; k < this.caja.venta.productos.listaProductosPorCobrar[j].listadoPresentaciones.length; k++) {
                        if (this.caja.venta.productos.listaProductosPorCobrar[j].listadoPresentaciones[k].idInventarioPresentacion == this.caja.venta.productos.listaProductosPorCobrar[i].idInventarioPresentacion) {
                            this.caja.venta.productos.listaProductosPorCobrar[j].listadoPresentaciones.splice(k, 1);
                            k--;
                        }
                    }
                }
            }
        }

        for (var i = 0; i < this.caja.venta.productos.listaProductosPorCobrar.length; i++) {
            for (var j = 0; j < this.caja.venta.listadoPresentacionesCopia.length; j++) {
                if (this.caja.venta.listadoPresentacionesCopia[j].idInventarioPresentacion == this.caja.venta.productos.listaProductosPorCobrar[i].idInventarioPresentacion) {
                    this.caja.venta.listadoPresentacionesCopia.splice(j, 1);
                    j--;
                }
            }
        }

        // validación cuando agregas un nuevo producto
        this.caja_venta_productos_agregarProductos();
    }

    caja_venta_productos_prevenirValorCantidad (p:any) {
        if (p.cantidad == null) {
            p.cantidad = 1;
            this.caja_venta_productos_calcularCostoPorCantidad(p);
        }
    }

    caja_venta_productos_calcularCostoPorCantidad (p:any) {
        if (p.cantidad != null) {
            if (p.iva != 0) {
                p.costoElegido = (Number(p.precioUnitario) + (Number(p.precioUnitario) * Number(p.iva))) * Number(p.cantidad);
            }
            else {
                p.costoElegido = Number(p.precioUnitario) * Number(p.cantidad);
            }
            p.costoDescuento = Number(p.costoElegido);
            p.descuentoP = 0;
            p.descuentoF = 0;
            this.caja_venta_promocionesNuevas_aplicarPromociones();
            this.caja_venta_calcularTotales();
        }
    }    

    caja_venta_productos_cambiarCostoProducto (p:any) {
        var floatRegex = RegExp("^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$");
        if (p.costoElegido != "") {
            if (floatRegex.test(p.costoElegido)) {
                p.costoDescuento = Number(p.costoElegido);
                p.descuentoP = 0;
                p.descuentoF = 0;
                this.caja_venta_promocionesNuevas_aplicarPromociones();
                this.caja_venta_calcularTotales();
            }
            else {
                p.costoElegido = 0;
                p.costoDescuento = 0;
                p.descuentoP = 0;
                p.descuentoF = 0;
                this.caja_venta_promocionesNuevas_aplicarPromociones();
                this.caja_venta_calcularTotales();
            }
        }
    }

    caja_venta_productos_prevenirCostoVacio (p:any) {
        if (p.costoElegido == "") {
            p.costoElegido = 0;
            p.costoDescuento = Number(p.costoElegido);
            p.descuentoP = 0;
            p.descuentoF = 0;
            this.caja_venta_promocionesNuevas_aplicarPromociones();
            this.caja_venta_calcularTotales();
        }
    }

    caja_venta_productos_mostrarDescuento (p:any) {
        p.costoDescuento = JSON.parse(JSON.stringify(p.costoElegido));

        p.descuentoP = 0;
        p.descuentoF = 0;

        if (p.mostrarDescuento) {
            p.mostrarDescuento = false;
        }
        else {
            p.mostrarDescuento = true;
        }
    }

    caja_venta_productos_calcularDescuento (p:any, opc:any) {
        var floatRegex = RegExp("^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$");
        if (opc == 1) {
            if (p.descuentoP !== "") {
                if (floatRegex.test(p.descuentoP)) {
                    if (parseFloat(p.descuentoP) > 100) {
                        p.descuentoP = 100;
                    }
                    p.costoDescuento = Number((parseFloat(p.costoElegido) * (1 - (parseFloat(p.descuentoP) / 100))).toFixed(2));
                    p.descuentoF = Number((parseFloat(p.costoElegido) * (parseFloat(p.descuentoP) / 100)).toFixed(2));
                    this.caja_venta_promocionesNuevas_aplicarPromociones();
                    this.caja_venta_calcularTotales();
                }
                else {
                    p.descuentoP = 0;
                    p.costoDescuento = parseFloat(p.costoElegido);
                    p.descuentoF = 0;
                    this.caja_venta_promocionesNuevas_aplicarPromociones();
                    this.caja_venta_calcularTotales();
                }
            }
        }
        if (opc == 2) {
            if (p.descuentoF !== "") {
                if (floatRegex.test(p.descuentoF)) {
                    if (parseFloat(p.descuentoF) > p.costoElegido) {
                        p.descuentoF = parseFloat(p.costoElegido);
                    }
                    p.costoDescuento = Number((parseFloat(p.costoElegido) - parseFloat(p.descuentoF)).toFixed(2));
                    p.descuentoP = Number((parseFloat(p.descuentoF) * 100 / parseFloat(p.costoElegido)).toFixed(2));
                    this.caja_venta_promocionesNuevas_aplicarPromociones();
                    this.caja_venta_calcularTotales();
                }
                else {
                    p.descuentoP = 0;
                    p.costoDescuento = parseFloat(p.costoElegido);
                    p.descuentoF = 0;
                    this.caja_venta_promocionesNuevas_aplicarPromociones();
                    this.caja_venta_calcularTotales();
                }
            }
        }
    }

    caja_venta_productos_quitarCeros (p:any, opc:any) {
        if (opc == 1) {
            if (p.descuentoP == 0) {
                p.descuentoP = "";
            }
        }
        if (opc == 2) {
            if (p.descuentoF == 0) {
                p.descuentoF = "";
            }
        }
    }

    caja_venta_productos_ponerCeros (p:any, opc:any) {
        if (opc == 1) {
            if (p.descuentoP == "") {
                p.descuentoP = 0;
                this.caja_venta_productos_calcularDescuento(p, opc);
            }
        }
        if (opc == 2) {
            if (p.descuentoF == "") {
                p.descuentoF = 0;
                this.caja_venta_productos_calcularDescuento(p, opc);
            }
        }
    }

    caja_venta_productos_removerProducto (index:any) {
        this.caja.venta.productos.listaProductosPorCobrar.splice(index, 1);
        this.caja_venta_promocionesNuevas_aplicarPromociones();
        this.caja_venta_calcularTotales();
    }

    // ---------------------------------------- Apartado de paquetes ---------------------------------------
    caja_venta_paquetes_agregarPaquetes () {
        if (this.caja.venta.paquetes.listaPaquetesPorCobrar.length != 0) {
            if (this.caja.venta.paquetes.listaPaquetesPorCobrar[this.caja.venta.paquetes.listaPaquetesPorCobrar.length - 1].idPaqueteSucursal != "") {
                // $("#paqueteDDLPaquete" + (this.caja.venta.paquetes.listaPaquetesPorCobrar.length - 1)).removeClass("errorCampo");
                $("#paqueteDDLPaquete" + (this.caja.venta.paquetes.listaPaquetesPorCobrar.length - 1) + " > div:first-child").attr("style", "outline: none;");
                this.caja.venta.paquetes.listaPaquetesPorCobrar.push({
                    idPersonal: null,
                    idPaqueteSucursal: null,
                    nombrePaquete: "",
                    costoElegido: 0,
                    costoElegidoEditable: true,
                    costoDescuento: 0,
                    mostrarBotonDescuento: false,
                    mostrarDescuento: false,
                    descuentoP: 0,
                    descuentoF: 0,
                    costoVenta: null,
                    esVenta: true,
                    esCuentaPagar: false,
                    idPagoClienteDetalle: null,
                    idPaqueteSucursalCliente: null,
                    costoPorPagar: null,
                    montoPagado: null,
                    idCita: null
                });
            }
            else {
                // $("#paqueteDDLPaquete" + (this.caja.venta.paquetes.listaPaquetesPorCobrar.length - 1)).addClass("errorCampo");
                $("#paqueteDDLPaquete" + (this.caja.venta.paquetes.listaPaquetesPorCobrar.length - 1) + " > div:first-child").attr("style", "outline: red solid 1px !important;");
            }
        }
        else {
            this.caja.venta.paquetes.listaPaquetesPorCobrar.push({
                idPersonal: null,
                idPaqueteSucursal: null,
                nombrePaquete: "",
                costoElegido: 0,
                costoElegidoEditable: true,
                costoDescuento: 0,
                mostrarBotonDescuento: false,
                mostrarDescuento: false,
                descuentoP: 0,
                descuentoF: 0,
                costoVenta: null,
                esVenta: true,
                esCuentaPagar: false,
                idPagoClienteDetalle: null,
                idPaqueteSucursalCliente: null,
                costoPorPagar: null,
                montoPagado: null,
                idCita: null
            });
        }
    }

    caja_venta_paquetes_elegirPaquete (p:any, paq:any) {
        p.nombrePaquete = paq.nombre;
        p.costoVenta = Number(paq.precioParcial);
        p.costoElegido = Number(paq.precioParcial);
        p.costoDescuento = Number(paq.precioParcial);

        if (paq.idPaqueteCostoTipo == 1) {
            p.costoElegidoEditable = true;
        }
        if (paq.idPaqueteCostoTipo == 2) {
            p.costoElegidoEditable = false;
        }
        
        p.mostrarBotonDescuento = true;
        p.descuentoP = 0;
        p.descuentoF = 0;
        this.caja_venta_calcularTotales();

    }

    caja_venta_paquetes_cambiarCostoPaquete (p:any) {
        var floatRegex = RegExp("^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$");
        if (p.costoElegido != "") {
            if (floatRegex.test(p.costoElegido)) {                
                p.costoDescuento = Number(p.costoElegido);
                p.descuentoP = 0;
                p.descuentoF = 0;
                this.caja_venta_calcularTotales();
            }
            else {
                p.costoElegido = 0;
                p.costoDescuento = 0;
                p.descuentoP = 0;
                p.descuentoF = 0;
                this.caja_venta_calcularTotales();
            }
        }
    }

    caja_venta_paquetes_cambiarPagoPaqueteCita (p:any) {
        var floatRegex = RegExp("^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$");
        if (p.costoElegido != "") {
            if (floatRegex.test(p.costoElegido)) {
                if (Number(p.costoElegido) > p.costoPorPagar) {
                    p.costoElegido = p.costoPorPagar;
                }
                p.costoDescuento = Number(p.costoElegido);
                p.descuentoP = 0;
                p.descuentoF = 0;
                this.caja_venta_calcularTotales();
            }
            else {
                p.costoElegido = 0;
                p.costoDescuento = 0;
                p.descuentoP = 0;
                p.descuentoF = 0;
                this.caja_venta_calcularTotales();
            }
        }
    }

    caja_venta_paquetes_prevenirCostoVacio (p:any) {
        if (p.costoElegido == "") {
            p.costoElegido = 0;
            p.costoDescuento = Number(p.costoElegido);
            p.descuentoP = 0;
            p.descuentoF = 0;
            this.caja_venta_calcularTotales();
        }
    }

    caja_venta_paquetes_mostrarDescuento (p:any) {
        p.costoDescuento = JSON.parse(JSON.stringify(p.costoElegido));

        p.descuentoP = 0;
        p.descuentoF = 0;

        if (p.mostrarDescuento) {
            p.mostrarDescuento = false;
        }
        else {
            p.mostrarDescuento = true;
        }
    }

    caja_venta_paquetes_calcularDescuento (p:any, opc:any) {
        var floatRegex = RegExp("^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$");
        if (opc == 1) {
            if (p.descuentoP !== "") {
                if (floatRegex.test(p.descuentoP)) {
                    if (parseFloat(p.descuentoP) > 100) {
                        p.descuentoP = 100;
                    }
                    p.costoDescuento = Number((parseFloat(p.costoElegido) * (1 - (parseFloat(p.descuentoP) / 100))).toFixed(2));
                    p.descuentoF = Number((parseFloat(p.costoElegido) * (parseFloat(p.descuentoP) / 100)).toFixed(2));
                    this.caja_venta_calcularTotales();
                }
                else {
                    p.descuentoP = 0;
                    p.costoDescuento = parseFloat(p.costoElegido);
                    p.descuentoF = 0;
                    this.caja_venta_calcularTotales();
                }
            }
        }
        if (opc == 2) {
            if (p.descuentoF !== "") {
                if (floatRegex.test(p.descuentoF)) {
                    if (parseFloat(p.descuentoF) > p.costoElegido) {
                        p.descuentoF = parseFloat(p.costoElegido);
                    }
                    p.costoDescuento = Number((parseFloat(p.costoElegido) - parseFloat(p.descuentoF)).toFixed(2));
                    p.descuentoP = Number((parseFloat(p.descuentoF) * 100 / parseFloat(p.costoElegido)).toFixed(2));
                    this.caja_venta_calcularTotales();
                }
                else {
                    p.descuentoP = 0;
                    p.costoDescuento = parseFloat(p.costoElegido);
                    p.descuentoF = 0;
                    this.caja_venta_calcularTotales();
                }
            }
        }
    }

    caja_venta_paquetes_quitarCeros (p:any, opc:any) {
        if (opc == 1) {
            if (p.descuentoP == 0) {
                p.descuentoP = "";
            }
        }
        if (opc == 2) {
            if (p.descuentoF == 0) {
                p.descuentoF = "";
            }
        }
    }

    caja_venta_paquetes_ponerCeros (p:any, opc:any) {
        if (opc == 1) {
            if (p.descuentoP == "") {
                p.descuentoP = 0;
                this.caja_venta_productos_calcularDescuento(p, opc);
            }
        }
        if (opc == 2) {
            if (p.descuentoF == "") {
                p.descuentoF = 0;
                this.caja_venta_productos_calcularDescuento(p, opc);
            }
        }
    }

    caja_venta_paquetes_removerPaquetes (index:any) {
        this.caja.venta.paquetes.listaPaquetesPorCobrar.splice(index, 1);
        this.caja_venta_calcularTotales();
    }

    //MAGP 26/03/2022 Aplicar paquetes
    caja_venta_paquetes_aplicarPaqueteVenta (p:any,index:any) {
        //Se recorren los servicios y los que sean de cita o venta agregados manuales, sin pagos previos ni paquetes previos se aplican de ser posible al paquete
        //Para esto primero se consultan los servicios del paquete
        var params:any = {};
        params.idPaqueteSucursal = p.idPaqueteSucursal;

        this._backService.HttpPost("catalogos/Promocion/cargarServPaquete", {}, params).subscribe( (data:any) => {
            if (this.caja.venta.paquetes.listaPaquetesPorCobrar[index].dataServPaquete == null || this.caja.venta.paquetes.listaPaquetesPorCobrar[index].dataServPaquete == undefined
                || this.caja.venta.paquetes.listaPaquetesPorCobrar[index].dataServPaquete.length == 0) {
                this.caja.venta.paquetes.listaPaquetesPorCobrar[index].dataServPaquete = [];
                var dataServPaquete = eval(data);
                this.caja.venta.paquetes.listaPaquetesPorCobrar[index].dataServPaquete = JSON.parse(JSON.stringify(dataServPaquete));
            }
            var aplicados = 0;
            
            for (var i = 0; i < this.caja.venta.servicios.listaServiciosPorCobrar.length; i++) {
                if (this.caja.venta.servicios.listaServiciosPorCobrar[i].idServicio != "" && this.caja.venta.servicios.listaServiciosPorCobrar[i].idServicio != null
                    && this.caja.venta.servicios.listaServiciosPorCobrar[i].esVenta && !this.caja.venta.servicios.listaServiciosPorCobrar[i].esCuentaPagar &&
                    this.caja.venta.servicios.listaServiciosPorCobrar[i].idPagoClienteDetalle == null && this.caja.venta.servicios.listaServiciosPorCobrar[i].idPaqueteSucursalCliente == null)
                {  //Si no es de paquete previo, o cuentas por cobrar o prepagado se busca el servicio en el paquete a aplicar para ver si es candidato

                    var indexServPaquete = this.caja.venta.paquetes.listaPaquetesPorCobrar[index].dataServPaquete.findIndex( (x:any) => x.text > 0 && x.idServicio == this.caja.venta.servicios.listaServiciosPorCobrar[i].idServicio);
                    if (indexServPaquete >= 0) {
                        this.caja.venta.paquetes.listaPaquetesPorCobrar[index].dataServPaquete[indexServPaquete].text--;

                        this.caja.venta.servicios.listaServiciosPorCobrar[i].idPaqueteSucursalCliente = (index * -1) - 1; //Si es 0 dara -1, si es posición 1 tendra -2 etc
                        this.caja.venta.servicios.listaServiciosPorCobrar[i].idPaqueteSucursalClienteAplicado = (index * -1) - 1; //Si es 0 dara -1, si es posición 1 tendra -2 etc
                        this.caja.venta.paquetes.listaPaquetesPorCobrar[index].idPaqueteSucursalClienteAplicado = (index * -1) - 1; //Si es 0 dara -1, si es posición 1 tendra -2 etc

                        this.caja.venta.servicios.listaServiciosPorCobrar[i].costoMinimo = 0;
                        this.caja.venta.servicios.listaServiciosPorCobrar[i].costoMaximo = 0;
                        this.caja.venta.servicios.listaServiciosPorCobrar[i].costoElegido = 0;
                        this.caja.venta.servicios.listaServiciosPorCobrar[i].costoDescuento = 0;
                        this.caja.venta.servicios.listaServiciosPorCobrar[i].mostrarBoronDescuento = false;
                        this.caja.venta.servicios.listaServiciosPorCobrar[i].descuentoP = 0;
                        this.caja.venta.servicios.listaServiciosPorCobrar[i].descuentoF = 0;
                        
                        aplicados++;
                    }

                }
                
            }
            if (aplicados > 0) {
                this._toaster.success("Paquete aplicado correctamente en los servicios correspondientes.");                
                this.caja.venta.paquetes.paqueteAplicado = true;
                this.caja_venta_calcularTotales();
            }
            else {
                this._toaster.error("No se encontraron servicios para aplicar el paquete.");                                
            }
        }, error => {

        });        
    }

    // ---------------------------------------- Apartado de cargos -----------------------------------------
    caja_venta_cargos_agregarCargo () {
        if (this.caja.venta.cargos.listaCargosPorCobrar.length != 0) {
            if (this.caja.venta.cargos.listaCargosPorCobrar[this.caja.venta.cargos.listaCargosPorCobrar.length - 1].descripcion != "") {
                $("#cargosInputDescripcion" + (this.caja.venta.cargos.listaCargosPorCobrar.length - 1)).removeClass("errorCampo");
                this.caja.venta.cargos.listaCargosPorCobrar.push({
                    descripcion: "",
                    costoElegido: 0,
                    esVenta: true,
                    esCuentaPagar: false,
                    idPagoClienteDetalle: null
                });
            }
            else {
                $("#cargosInputDescripcion" + (this.caja.venta.cargos.listaCargosPorCobrar.length - 1)).addClass("errorCampo");
            }
        }
        else {
            this.caja.venta.cargos.listaCargosPorCobrar.push({
                descripcion: "",
                costoElegido: 0,
                esVenta: true,
                esCuentaPagar: false,
                idPagoClienteDetalle: null
            });
        }
    }

    caja_venta_cargos_prevenirCostoVacio (c:any) {
        if (c.costoElegido == "") {
            c.costoElegido = 0;
            this.caja_venta_calcularTotales();
        }
    }

    caja_venta_cargos_cambioCosto (c:any) {
        var floatRegex = RegExp("^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$");
        if (c.costoElegido != "") {
            if (!floatRegex.test(c.costoElegido)) {
                c.costoElegido = 0;
            }
            this.caja_venta_calcularTotales();
        }
    }

    caja_venta_cargos_removerCargo (index:any) {
        this.caja.venta.cargos.listaCargosPorCobrar.splice(index, 1);
        this.caja_venta_calcularTotales();
    }

    // ---------------------------------- Venta de certificado de regalo ----------------------------------
    caja_venta_certificadoRegalo_consultarCertificados (){        
        this.caja.venta.certificadoRegalo.dataCertificadoRegalo = [];
        this.caja.venta.certificadoRegalo.listadoCertificadosCopia = [];
        this.caja.venta.certificadoRegalo.catalogoCertificadosRegalo = [];

        var dartaOrigen = {};

        var params:any = {};
        params.opcion = 5;
        params.fecha = '';

        this._backService.HttpPost("catalogos/CertificadoRegalo/consultarCertificadoRegalo", {}, params).subscribe( (data:any) => {
            var dataOrigen = eval(data);

            for(var i = 0; i < dataOrigen.length; i++){
                dataOrigen[i].cantidadDisponible = dataOrigen[i].cantidad - dataOrigen[i].cantidadUsada;
            }

            this.caja.venta.certificadoRegalo.dataCertificadoRegalo = JSON.parse(JSON.stringify(dataOrigen));
            this.caja.venta.certificadoRegalo.listadoCertificadosCopia = JSON.parse(JSON.stringify(dataOrigen));
            this.caja.venta.certificadoRegalo.catalogoCertificadosRegalo = JSON.parse(JSON.stringify(dataOrigen));

            this._pantallaServicio.ocultarSpinner();
        }, error => {
            this._router.navigate(["/login"])            
        });        
    }

    caja_venta_certificadoRegalo_agregarCertificados (){
        if (this.caja.venta.certificadoRegalo.listaCertificadosPorCobrar.length != 0) {

            var errorCertificadoRegalo = false;
            if (!this.caja.venta.certificadoRegalo.listaCertificadosPorCobrar[this.caja.venta.certificadoRegalo.listaCertificadosPorCobrar.length - 1].idCertificadoRegalo) {
                // $("#certificadoRegaloDDLcertificadoRegalo" + (this.caja.venta.certificadoRegalo.listaCertificadosPorCobrar.length - 1)).addClass("errorCampo");
                $("#certificadoRegaloDDLcertificadoRegalo" + (this.caja.venta.certificadoRegalo.listaCertificadosPorCobrar.length - 1) + " > div:first-child").attr("style", "outline: red solid 1px !important;");
                errorCertificadoRegalo = true;
            }

            if (!this.caja.venta.certificadoRegalo.listaCertificadosPorCobrar[this.caja.venta.certificadoRegalo.listaCertificadosPorCobrar.length - 1].costoElegido) {
                $("#certificadoRegaloDDLcertificadoRegaloCosto" + (this.caja.venta.certificadoRegalo.listaCertificadosPorCobrar.length - 1)).addClass("errorCampo");
                errorCertificadoRegalo = true;
            }

            if (!this.caja.venta.certificadoRegalo.listaCertificadosPorCobrar[this.caja.venta.certificadoRegalo.listaCertificadosPorCobrar.length - 1].codigo) {
                $("#certificadoRegaloDDLcertificadoRegaloCodigo" + (this.caja.venta.certificadoRegalo.listaCertificadosPorCobrar.length - 1)).addClass("errorCampo");
                errorCertificadoRegalo = true;
            }

            if (!this.caja.venta.certificadoRegalo.listaCertificadosPorCobrar[this.caja.venta.certificadoRegalo.listaCertificadosPorCobrar.length - 1].vigencia) {
                $("#certificadoRegaloDDLcertificadoRegaloVigencia" + (this.caja.venta.certificadoRegalo.listaCertificadosPorCobrar.length - 1)).addClass("errorCampo");
                errorCertificadoRegalo = true;
            }

            
            if (!errorCertificadoRegalo) {
                // $("#certificadoRegaloDDLcertificadoRegalo" + (this.caja.venta.certificadoRegalo.listaCertificadosPorCobrar.length - 1)).removeClass("errorCampo");        
                $("#certificadoRegaloDDLcertificadoRegalo" + (this.caja.venta.certificadoRegalo.listaCertificadosPorCobrar.length - 1) + " > div:first-child").attr("style", "outline: none;");        
                $("#certificadoRegaloDDLcertificadoRegaloCosto" + (this.caja.venta.certificadoRegalo.listaCertificadosPorCobrar.length - 1)).removeClass("errorCampo");
                $("#certificadoRegaloDDLcertificadoRegaloCodigo" + (this.caja.venta.certificadoRegalo.listaCertificadosPorCobrar.length - 1)).removeClass("errorCampo");
                $("#certificadoRegaloDDLcertificadoRegaloVigencia" + (this.caja.venta.certificadoRegalo.listaCertificadosPorCobrar.length - 1)).removeClass("errorCampo");                
                
               
                this.caja.venta.certificadoRegalo.listaCertificadosPorCobrar.push({
                    idPersonal: null,
                    idCertificadoRegalo: 0,
                    nombreCertificado: "",
                    listadoCertificados: JSON.parse(JSON.stringify(this.caja.venta.certificadoRegalo.listadoCertificadosCopia)),
                    cantidad: "",
                    cantidadMaxima: 0,
                    cantidadUsada: 0,
                    costoElegido: 0,
                    costoDescuento: 0,
                    saldo: 0,
                    codigo: "",
                    vigencia: "",
                    observaciones: "",
                    montoPorAbonar: 0,
                    esVenta: true,
                    esCuentaPagar: false,
                    idPagoClienteDetalle: null
                });

            }

        }
        else {
            this.caja.venta.certificadoRegalo.listaCertificadosPorCobrar.push({
                idPersonal: null,
                idCertificadoRegalo: 0,
                nombreCertificado: "",
                listadoCertificados: JSON.parse(JSON.stringify(this.caja.venta.certificadoRegalo.listadoCertificadosCopia)),
                cantidad: "",
                cantidadMaxima: 0,
                cantidadUsada: 0,
                costoElegido: 0,
                costoDescuento: 0,
                saldo: 0,
                codigo: "",
                vigencia: "",
                observaciones: "",
                montoPorAbonar: 0,
                esVenta: true,
                esCuentaPagar: false,
                idPagoClienteDetalle: null
              
            });
        }
    }

    caja_venta_certificadoRegalo_elegirCertificados (c:any, cert:any, indexCertificado:any){
        c.costoElegido = 0;
        c.costoDescuento = 0;
        c.codigo = "";
        c.vigencia = "";
        c.mostrarCertificadoRegaloDatos = 1;
        c.nombreCertificado = cert.nombre;

        this.caja.venta.certificadoRegalo.listadoCertificadosCopia = JSON.parse(JSON.stringify(this.caja.venta.certificadoRegalo.dataCertificadoRegalo));
        for (var i = 0; i < this.caja.venta.certificadoRegalo.listaCertificadosPorCobrar.length; i++) {
            if(this.caja.venta.certificadoRegalo.listaCertificadosPorCobrar[i].idCertificadoRegalo){
                for (var j = 0; j < this.caja.venta.certificadoRegalo.listadoCertificadosCopia.length; j++) {
                    if(this.caja.venta.certificadoRegalo.listadoCertificadosCopia[j].idCertificadoRegalo == this.caja.venta.certificadoRegalo.listaCertificadosPorCobrar[i].idCertificadoRegalo){
                        this.caja.venta.certificadoRegalo.listadoCertificadosCopia[j].cantidadDisponible--;
                        this.caja.venta.certificadoRegalo.listaCertificadosPorCobrar[i].cantidadDisponible = this.caja.venta.certificadoRegalo.listadoCertificadosCopia[j].cantidadDisponible;
                    }
                }
            }
        }

        for (var j = 0; j < this.caja.venta.certificadoRegalo.listadoCertificadosCopia.length; j++) {
            if(this.caja.venta.certificadoRegalo.listadoCertificadosCopia[j].cantidadDisponible == 0){
                this.caja.venta.certificadoRegalo.listadoCertificadosCopia.splice(j, 1);
                j--;
            }
        }
    }

    caja_venta_certificadoRegalo_validarCodigo (c:any,index:any) {
        $('#certificadoRegaloDDLcertificadoRegaloCodigo'+index).removeClass("errorCampo");
        
        for (var i = 0; i < this.caja.venta.certificadoRegalo.listaCertificadosPorCobrar.length; i++) {
            if(i != index){
                if(this.caja.venta.certificadoRegalo.listaCertificadosPorCobrar[i].idCertificadoRegalo == c.idCertificadoRegalo){
                    if(this.caja.venta.certificadoRegalo.listaCertificadosPorCobrar[i].codigo == c.codigo){
                        $('#certificadoRegaloDDLcertificadoRegaloCodigo'+index).addClass("errorCampo");
                        c.codigo = "";
                        this._toaster.error("El Código de Certificado Regalo ya se ingresó");                        
                    }
                }
            }
        }
    }

    caja_venta_certificadoRegalo_cambiarCostoCertificado (c:any,index:any) {
        $('#certificadoRegaloDDLcertificadoRegaloCosto'+index).removeClass("errorCampo");
        var floatRegex = RegExp("^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$");
        if (c.costoElegido != "") {
            if (floatRegex.test(c.costoElegido)) {
                c.costoDescuento = c.costoElegido;
                this.caja_venta_calcularTotales();
            }
            else {
                c.costoElegido = 0;
                c.costoDescuento = 0;
                this.caja_venta_calcularTotales();
            }
        }
    }

    caja_venta_certificadoRegalo_prevenirCostoVacio (c:any) {
        if (c.costoElegido == "") {
            c.costoElegido = 0;
            c.costoDescuento = 0;
            this.caja_venta_calcularTotales();
        }
    }

    caja_venta_certificadoRegalo_quitarValidacion (index:any){
        $('#certificadoregaloddlcertificadoregalovigencia'+index).removeClass("errorCampo");
    }

    caja_venta_certificadoRegalo_removerCertificado (c:any,index:any) {
        $('#certificadoRegaloDDLcertificadoRegaloCodigo'+index).removeClass("errorCampo");
        $('#certificadoRegaloDDLcertificadoRegaloVigencia'+index).removeClass("errorCampo");

        this.caja.venta.certificadoRegalo.listaCertificadosPorCobrar.splice(index, 1);

        this.caja.venta.certificadoRegalo.listadoCertificadosCopia = JSON.parse(JSON.stringify(this.caja.venta.certificadoRegalo.dataCertificadoRegalo));
        for (var i = 0; i < this.caja.venta.certificadoRegalo.listaCertificadosPorCobrar.length; i++) {
            if(this.caja.venta.certificadoRegalo.listaCertificadosPorCobrar[i].idCertificadoRegalo){
                for (var j = 0; j < this.caja.venta.certificadoRegalo.listadoCertificadosCopia.length; j++) {
                    if(this.caja.venta.certificadoRegalo.listadoCertificadosCopia[j].idCertificadoRegalo == this.caja.venta.certificadoRegalo.listaCertificadosPorCobrar[i].idCertificadoRegalo){
                        this.caja.venta.certificadoRegalo.listadoCertificadosCopia[j].cantidadDisponible--;
                        this.caja.venta.certificadoRegalo.listaCertificadosPorCobrar[i].cantidadDisponible = this.caja.venta.certificadoRegalo.listadoCertificadosCopia[j].cantidadDisponible;
                    }
                }
            }
        }

        for (var j = 0; j < this.caja.venta.certificadoRegalo.listadoCertificadosCopia.length; j++) {
            if(this.caja.venta.certificadoRegalo.listadoCertificadosCopia[j].cantidadDisponible == 0){
                this.caja.venta.certificadoRegalo.listadoCertificadosCopia.splice(j, 1);
                j--;
            }
        }

        this.caja_venta_calcularTotales();
    }

    // --------------------------------------------- Totales ----------------------------------------------
    caja_venta_calcularTotales (opc:any = undefined) {

        this.caja.venta.totales.totalVenta = 0;
        this.caja.venta.totales.totalVentaParaDescuento = 0;
        this.caja.venta.totales.totalPago = 0;
        this.caja.venta.totales.totalPromocion = 0;

        this.caja.venta.servicios.mostrarTitulos = false;
        for (var i = 0; i < this.caja.venta.servicios.listaServiciosPorCobrar.length; i++) {
            if (this.caja.venta.servicios.listaServiciosPorCobrar[i].esVenta) {
                if (this.caja.venta.servicios.listaServiciosPorCobrar[i].idPaqueteSucursalCliente == null) {
                    this.caja.venta.totales.totalVenta += Number(this.caja.venta.servicios.listaServiciosPorCobrar[i].costoDescuento);
                    this.caja.venta.servicios.mostrarTitulos = true;
                    if (this.caja.venta.servicios.listaServiciosPorCobrar[i].idPagoClienteDetalle == null) {
                        this.caja.venta.totales.totalVentaParaDescuento += Number(this.caja.venta.servicios.listaServiciosPorCobrar[i].costoDescuento);
                    }
                }
            }
            else {
                this.caja.venta.totales.totalPago += Number(this.caja.venta.servicios.listaServiciosPorCobrar[i].costoDescuento);
            }
        }

        for (var i = 0; i < this.caja.venta.productos.listaProductosPorCobrar.length; i++) {
            if (this.caja.venta.productos.listaProductosPorCobrar[i].esVenta) {
                this.caja.venta.totales.totalVenta += Number(this.caja.venta.productos.listaProductosPorCobrar[i].costoDescuento);
                this.caja.venta.totales.totalVentaParaDescuento += Number(this.caja.venta.productos.listaProductosPorCobrar[i].costoDescuento);
            }
            else {
                this.caja.venta.totales.totalPago += Number(this.caja.venta.productos.listaProductosPorCobrar[i].costoDescuento);
            }
        }

        for (var i = 0; i < this.caja.venta.paquetes.listaPaquetesPorCobrar.length; i++) {
            if (this.caja.venta.paquetes.listaPaquetesPorCobrar[i].esVenta) {
                this.caja.venta.totales.totalVenta += Number(this.caja.venta.paquetes.listaPaquetesPorCobrar[i].costoDescuento);
                this.caja.venta.totales.totalVentaParaDescuento += Number(this.caja.venta.paquetes.listaPaquetesPorCobrar[i].costoDescuento);
            }
            else {
                this.caja.venta.totales.totalPago += Number(this.caja.venta.paquetes.listaPaquetesPorCobrar[i].costoDescuento);
            }
        }

        for (var i = 0; i < this.caja.venta.cargos.listaCargosPorCobrar.length; i++) {
            if (this.caja.venta.cargos.listaCargosPorCobrar[i].esVenta) {
                this.caja.venta.totales.totalVenta += Number(this.caja.venta.cargos.listaCargosPorCobrar[i].costoElegido);
                this.caja.venta.totales.totalVentaParaDescuento += Number(this.caja.venta.cargos.listaCargosPorCobrar[i].costoElegido);
            }
            else {
                this.caja.venta.totales.totalPago += Number(this.caja.venta.cargos.listaCargosPorCobrar[i].costoElegido);
            }
        }

        for (var i = 0; i < this.caja.venta.certificadoRegalo.listaCertificadosPorCobrar.length; i++) {
            if (this.caja.venta.certificadoRegalo.listaCertificadosPorCobrar[i].esVenta) {
                this.caja.venta.totales.totalVenta += Number(this.caja.venta.certificadoRegalo.listaCertificadosPorCobrar[i].costoElegido);
                this.caja.venta.totales.totalVentaParaDescuento += Number(this.caja.venta.certificadoRegalo.listaCertificadosPorCobrar[i].costoElegido);
            }
            else {
                this.caja.venta.totales.totalPago += Number(this.caja.venta.certificadoRegalo.listaCertificadosPorCobrar[i].costoElegido);
            }
        }

        for (var i = 0; i < this.caja.venta.promocionesNuevas.promocionesAplicadas.length; i++) {
            this.caja.venta.totales.totalPromocion += Number(Number(this.caja.venta.promocionesNuevas.promocionesAplicadas[i].pago).toFixed(2));
        }
        
        this.caja.venta.totales.subtotal = this.caja.venta.totales.totalVenta + this.caja.venta.totales.totalPago;
        this.caja.venta.totales.total = Number((this.caja.venta.totales.totalVenta + this.caja.venta.totales.totalPago - this.caja.venta.totales.totalPromocion).toFixed(2));

        this.caja_venta_calcularTotalDescuento(opc ? opc : 1);
    }

    // ---------------------------------------- Descuento General -----------------------------------------
    caja_venta_calcularTotalDescuento (opc:any) {
        var floatRegex = RegExp("^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$");
        
        if (opc == 1) {
            if (this.caja.venta.totales.descuentoP !== "") {
                if (floatRegex.test(this.caja.venta.totales.descuentoP)) {
                    if (parseFloat(this.caja.venta.totales.descuentoP) > 100) {
                        this.caja.venta.totales.descuentoP = 100;
                    }
                    this.caja.venta.totales.descuentoF = Number(((this.caja.venta.totales.totalVentaParaDescuento - this.caja.venta.totales.totalPromocion) * (parseFloat(this.caja.venta.totales.descuentoP) / 100)).toFixed(2));
                    this.caja.venta.totales.totalDescuentoGeneral = this.caja.venta.totales.descuentoF;
                }
                else {
                    this.caja.venta.totales.descuentoP = 0;
                    this.caja.venta.totales.descuentoF = 0;
                    this.caja.venta.totales.totalDescuentoGeneral = 0;
                }
            }
        }
        if (opc == 2) {
            if (this.caja.venta.totales.descuentoF !== "") {
                if (floatRegex.test(this.caja.venta.totales.descuentoF)) {
                    if (parseFloat(this.caja.venta.totales.descuentoF) > (this.caja.venta.totales.totalVentaParaDescuento - this.caja.venta.totales.totalPromocion)) {
                        this.caja.venta.totales.descuentoF = (this.caja.venta.totales.totalVentaParaDescuento - this.caja.venta.totales.totalPromocion);
                    }
                    this.caja.venta.totales.descuentoP = Number((parseFloat(this.caja.venta.totales.descuentoF) * 100 / (this.caja.venta.totales.totalVentaParaDescuento - this.caja.venta.totales.totalPromocion)).toFixed(2));
                    this.caja.venta.totales.totalDescuentoGeneral = Number(this.caja.venta.totales.descuentoF);
                }
                else {
                    this.caja.venta.totales.descuentoP = 0;
                    this.caja.venta.totales.descuentoF = 0;
                    this.caja.venta.totales.totalDescuentoGeneral = 0;
                }
            }
        }
    }

    caja_venta_quitarCerosTotalDescuento (opc:any) {
        if (opc == 1) {
            if (this.caja.venta.totales.descuentoP == 0) {
                this.caja.venta.totales.descuentoP = "";
            }
        }
        if (opc == 2) {
            if (this.caja.venta.totales.descuentoF == 0) {
                this.caja.venta.totales.descuentoF = "";
            }
        }
    }

    caja_venta_ponerCerosTotalDescuento (opc:any) {
        if (opc == 1) {
            if (this.caja.venta.totales.descuentoP == "") {
                this.caja.venta.totales.descuentoP = 0;
                this.caja_venta_calcularTotalDescuento(opc);
            }
        }
        if (opc == 2) {
            if (this.caja.venta.totales.descuentoF == "") {
                this.caja.venta.totales.descuentoF = 0;
                this.caja_venta_calcularTotalDescuento(opc);
            }
        }
    }

    // ---------------------------------------- Promociones Nuevas ----------------------------------------
    caja_venta_promocionesNuevas_consultarPromocionesActivasSucursal () {
        this._pantallaServicio.mostrarSpinner();

        this.caja.venta.promocionesNuevas.codigo = "";

        var params:any = {};
        params.fechaPago = moment(this.caja.venta.fechaPago).format('YYYY-MM-DD HH:mm:ss');
        params.idCliente = this.caja.venta.cliente ? this.caja.venta.cliente : null;
        params.idCita = this.caja.venta.idCita ? this.caja.venta.idCita : null;
        params.fechaNacimientoClienteNuevo = null;
        if(!this.caja.venta.cliente){
            if(this.caja.venta.clienteNuevo.fechaNacimiento){
                params.fechaNacimientoClienteNuevo = moment(this.caja.venta.clienteNuevo.fechaNacimiento).format('YYYY-MM-DD HH:mm:ss');
            }
        }

        this._backService.HttpPost("procesos/agenda/Agenda/consultarPromocionesActivasSucursal", {}, params).subscribe( (data:any) => {
            var dataTemp = eval(data);

            this.caja.venta.promocionesNuevas.dataOriginal = dataTemp;

            this.caja_venta_promocionesNuevas_aplicarPromociones();
            this.caja_venta_calcularTotales();

            if(dataTemp.length > 0){
                // ------ De pruebas --------
                // console.clear();
                //console.log("---------------------------------------------");
                //console.log("PROMOCIONES");
                //console.log("---------------------------------------------");

                for(var i = 0; i < this.caja.venta.promocionesNuevas.dataOriginal[0].length; i++){
                    var promo = this.caja.venta.promocionesNuevas.dataOriginal[0][i];
                    //console.log("Id: " + promo.idPromocionSucursalNueva);
                    //console.log("Nombre: " + promo.nombre);
                    if(promo.idPromocionSucursalNuevaTipo == 1){
                        //console.log("Tipo: General");
                    }
                    if(promo.idPromocionSucursalNuevaTipo == 2){
                        //console.log("Tipo: Combo");
                    }
                    //console.log("Código: " + promo.codigo);
                    //console.log("Cantidad Usos: " + promo.cantidadUsos);
                    //console.log("Cantidad Usos Reales: " + promo.cantidadUsosReal);
                    //console.log("---------------------------------------------");
                }

                //console.log("---------------------------------------------");
                //console.log("CANJES");
                //console.log("---------------------------------------------");

                for(var i = 0; i < this.caja.venta.promocionesNuevas.dataOriginal[3].length; i++){
                    var canje = this.caja.venta.promocionesNuevas.dataOriginal[3][i];
                    //console.log("Id: " + canje.idPromocionSucursalNueva);
                    //console.log("Nombre: " + canje.nombre);
                    //console.log("Tipo: Canje");
                    //console.log("---------------------------------------------");
                }
            }

            this._pantallaServicio.ocultarSpinner();
        }, error => {
            this._router.navigate(["/login"]);
        });
    }

    // ----- Aplicar promociones -----
    caja_venta_promocionesNuevas_limpiarPromocionesDataOriginal (){
        
        var dataTemp = JSON.parse(JSON.stringify(this.caja.venta.promocionesNuevas.dataOriginal));

        this.caja.venta.promocionesNuevas.promocionGeneral = {};
        this.caja.venta.promocionesNuevas.promocionGeneral.conCodigo = [];
        this.caja.venta.promocionesNuevas.promocionGeneral.sinCodigo = [];

        this.caja.venta.promocionesNuevas.promocionCombos = {};
        this.caja.venta.promocionesNuevas.promocionCombos.conCodigo = [];
        this.caja.venta.promocionesNuevas.promocionCombos.sinCodigo = [];

        this.caja.venta.promocionesNuevas.serviciosProductosPendientes = [];

        if(dataTemp.length > 0) {
            for(var i = 0; i < dataTemp[0].length; i++){

                var requisitos = [];
                var valor = [];

                // Obtener los requisitos de la promoción
                for(var j = 0; j < dataTemp[1].length; j++){
                    if(dataTemp[0][i].idPromocionSucursalNueva == dataTemp[1][j].idPromocionSucursalNueva){
                        requisitos.push({
                            todosServicios: dataTemp[1][j].todosServicios,
                            idServicio: dataTemp[1][j].idServicio,
                            todasPresentaciones: dataTemp[1][j].todasPresentaciones,
                            idInventarioPresentacion: dataTemp[1][j].idInventarioPresentacion,
                            cantidad: dataTemp[1][j].cantidad ? dataTemp[1][j].cantidad : 1
                        });
                    }
                }

                // Obtener el valor de la promoción
                for(var j = 0; j < dataTemp[2].length; j++){
                    if(dataTemp[0][i].idPromocionSucursalNueva == dataTemp[2][j].idPromocionSucursalNueva){
                        valor.push({
                            todosServicios: dataTemp[2][j].todosServicios,
                            idServicio: dataTemp[2][j].idServicio,
                            todasPresentaciones: dataTemp[2][j].todasPresentaciones,
                            idInventarioPresentacion: dataTemp[2][j].idInventarioPresentacion,
                            idPromocionSucursalNuevaAplicacionValorTipo: dataTemp[2][j].idPromocionSucursalNuevaAplicacionValorTipo,
                            valor: dataTemp[2][j].valor
                        });
                    }
                }

                // Promociónes Generales
                if(dataTemp[0][i].idPromocionSucursalNuevaTipo == 1){
                    if(dataTemp[0][i].aplicacionPorCodigo){
                        this.caja.venta.promocionesNuevas.promocionGeneral.conCodigo.push({
                            idPromocionSucursalNueva: dataTemp[0][i].idPromocionSucursalNueva,
                            nombre: dataTemp[0][i].nombre,
                            idPromocionSucursalNuevaTipo: dataTemp[0][i].idPromocionSucursalNuevaTipo,
                            aplicacionPorCodigo: dataTemp[0][i].aplicacionPorCodigo,
                            codigo: dataTemp[0][i].codigo,
                            usoLimitado: dataTemp[0][i].usoLimitado,
                            cantidadUsos: dataTemp[0][i].cantidadUsos ? dataTemp[0][i].cantidadUsos : 0,
                            cantidadUsosReal: dataTemp[0][i].cantidadUsosReal,
                            requisitos: requisitos,
                            valor: valor,
                            aplicable: false
                        });
                    }
                    else{
                        this.caja.venta.promocionesNuevas.promocionGeneral.sinCodigo.push({
                            idPromocionSucursalNueva: dataTemp[0][i].idPromocionSucursalNueva,
                            nombre: dataTemp[0][i].nombre,
                            idPromocionSucursalNuevaTipo: dataTemp[0][i].idPromocionSucursalNuevaTipo,
                            aplicacionPorCodigo: dataTemp[0][i].aplicacionPorCodigo,
                            codigo: dataTemp[0][i].codigo,
                            usoLimitado: dataTemp[0][i].usoLimitado,
                            cantidadUsos: dataTemp[0][i].cantidadUsos ? dataTemp[0][i].cantidadUsos : 0,
                            cantidadUsosReal: dataTemp[0][i].cantidadUsosReal,
                            requisitos: requisitos,
                            valor: valor
                        });
                    }
                }

                // Promociones de Combos
                if(dataTemp[0][i].idPromocionSucursalNuevaTipo == 2){
                    if(dataTemp[0][i].aplicacionPorCodigo){
                        this.caja.venta.promocionesNuevas.promocionCombos.conCodigo.push({
                            idPromocionSucursalNueva: dataTemp[0][i].idPromocionSucursalNueva,
                            nombre: dataTemp[0][i].nombre,
                            idPromocionSucursalNuevaTipo: dataTemp[0][i].idPromocionSucursalNuevaTipo,
                            aplicacionPorCodigo: dataTemp[0][i].aplicacionPorCodigo,
                            codigo: dataTemp[0][i].codigo,
                            usoLimitado: dataTemp[0][i].usoLimitado,
                            cantidadUsos: dataTemp[0][i].cantidadUsos,
                            cantidadUsosReal: dataTemp[0][i].cantidadUsosReal,
                            requisitos: requisitos,
                            valor: valor,
                            aplicable: false
                        });
                    }
                    else{
                        this.caja.venta.promocionesNuevas.promocionCombos.sinCodigo.push({
                            idPromocionSucursalNueva: dataTemp[0][i].idPromocionSucursalNueva,
                            nombre: dataTemp[0][i].nombre,
                            idPromocionSucursalNuevaTipo: dataTemp[0][i].idPromocionSucursalNuevaTipo,
                            aplicacionPorCodigo: dataTemp[0][i].aplicacionPorCodigo,
                            codigo: dataTemp[0][i].codigo,
                            usoLimitado: dataTemp[0][i].usoLimitado,
                            cantidadUsos: dataTemp[0][i].cantidadUsos,
                            cantidadUsosReal: dataTemp[0][i].cantidadUsosReal,
                            requisitos: requisitos,
                            valor: valor
                        });
                    }
                }
            }
            this.caja.venta.promocionesNuevas.serviciosProductosPendientes = dataTemp[3];
        }
    }

    caja_venta_promocionesNuevas_aplicarPromociones () {

        // 1.- Limpiar promociones 
        this.caja_venta_promocionesNuevas_limpiarPromocionesDataOriginal();
        this.caja.venta.promocionesNuevas.promocionesAplicadas = [];

        // 2.- Quitar la promoción y volver a activar los servicios y productos para que tomen en cuenta en las promociones
        for(var i = 0; i < this.caja.venta.servicios.listaServiciosPorCobrar.length; i++){
            this.caja.venta.servicios.listaServiciosPorCobrar[i].promociones = [];
            this.caja.venta.servicios.listaServiciosPorCobrar[i].aplicableEnPromocion = true;
        }

        for(var i = 0; i < this.caja.venta.productos.listaProductosPorCobrar.length; i++){
            this.caja.venta.productos.listaProductosPorCobrar[i].promociones = [];
            this.caja.venta.productos.listaProductosPorCobrar[i].promocionCantidadDisponible = this.caja.venta.productos.listaProductosPorCobrar[i].cantidad;
        }

        // 3.- Checar si hay un código para aplicar la promoción
        if(this.caja.venta.promocionesNuevas.codigo){
            this.caja_venta_promocionesNuevas_verificarCodigo();
        }
        
        // 4.- Aplicar las promociones por el orden establecido
        this.caja_venta_promocionesNuevas_aplicarPromocionesCombosConCodigo();
        this.caja_venta_promocionesNuevas_aplicarPromocionesGeneralesConCodigo();
        this.caja_venta_promocionesNuevas_aplicarServiciosProductosPendientes();
        this.caja_venta_promocionesNuevas_aplicarPromocionesCombosSinCodigo();
        this.caja_venta_promocionesNuevas_aplicarPromocionesGeneralesSinCodigo();
    }

    caja_venta_promocionesNuevas_aplicarPromocionesCombosConCodigo (){

        for(var i = 0; i < this.caja.venta.promocionesNuevas.promocionCombos.conCodigo.length; i++){
            var promocionCombo = this.caja.venta.promocionesNuevas.promocionCombos.conCodigo[i];

            // Se verifica que se haya ingresado el código en el modal de punto de venta
            if(promocionCombo.aplicable){

                // Primero se calcula la cantidad de veces que el combo puede aplicarse en la venta 
                var cantidadServiciosProductosDisponibles = 0;
                var cantidadServiciosProductosRequeridos = 0;

                // Para calcular las veces que puede aplicarse el combo primero se cuentan los servicios y productos disponibles para la promocion
                for(var j = 0; j < this.caja.venta.servicios.listaServiciosPorCobrar.length; j++){
                    var servicioVenta = this.caja.venta.servicios.listaServiciosPorCobrar[j];

                    // Se cuentan solo los servicios que no estén aplicados en otras promociones, que no sean cuentas por cobrar ni vengan de paquete, ni sean servicios prepagados(paypal)
                    if(servicioVenta.aplicableEnPromocion && servicioVenta.esVenta && !servicioVenta.noAplicablePromociones && servicioVenta.idPaqueteSucursalCliente == null){
                        cantidadServiciosProductosDisponibles++;
                    }
                }

                for(var j = 0; j < this.caja.venta.productos.listaProductosPorCobrar.length; j++){
                    var productoVenta = this.caja.venta.productos.listaProductosPorCobrar[j];

                    // Solo se cuentan los productos que tengan cantidades disponibles y no sean cuentas por pagar
                    if(productoVenta.promocionCantidadDisponible > 0 && productoVenta.esVenta){
                        cantidadServiciosProductosDisponibles = cantidadServiciosProductosDisponibles + productoVenta.promocionCantidadDisponible;
                    }
                }

                // Después se calculan la cantidad de servicios y productos requeridos para el combo
                for(var j = 0; j < promocionCombo.requisitos.length; j++){
                    var requisito = promocionCombo.requisitos[j];

                    cantidadServiciosProductosRequeridos = cantidadServiciosProductosRequeridos + requisito.cantidad;
                }

                // Se calcula la cantidad de aplicaciones del combo posibles tomando que un servicio y cantidad de producto solo puede aplicar para un combo
                var comboAplicacionesPosibles = Math.floor(cantidadServiciosProductosDisponibles / cantidadServiciosProductosRequeridos);

                // Se ejecutan todas las aplicaciones posibles del combo para checar cuantas veces aplica
                for(var p = 0; p < comboAplicacionesPosibles; p++){

                    // Se verifica que la promoción no tenga uso limitado o si tiene que la cantidad de uso real sea menor a la configurada
                    if(!promocionCombo.usoLimitado || (promocionCombo.usoLimitado && promocionCombo.cantidadUsosReal < promocionCombo.cantidadUsos)){

                        // Se crea la promoción aplicada ya que tiene que ir ligada con todos los servicio y productos y después se verifica que se 
                        // cumplan sus requisitos
                        var idPromocionAplicada = this.caja.venta.promocionesNuevas.promocionesAplicadas.length + 1;

                        this.caja.venta.promocionesNuevas.promocionesAplicadas.push({
                            id: idPromocionAplicada,
                            idPromocionSucursalNueva: promocionCombo.idPromocionSucursalNueva,
                            descripcion: promocionCombo.nombre
                        });

                        promocionCombo.cantidadUsosReal++;

                        var requisitosCumplidosCombo = 0;
                        var valorComboOriginal = 0;

                        // Se recorren todos los requisitos para verificar que se cumplan todos y aplque la promoción
                        for(var j = 0; j < promocionCombo.requisitos.length; j++){
                            var requisito = promocionCombo.requisitos[j];

                            // Se verifica si el requisito es servicio
                            if(requisito.idServicio){

                                var servicioCantidadDisponiblePromocion = 0;

                                // Se recorren todos los servicios de la venta 
                                for(var k = 0; k < this.caja.venta.servicios.listaServiciosPorCobrar.length; k++){
                                    var servicioVenta = this.caja.venta.servicios.listaServiciosPorCobrar[k];

                                    // Se cuentan todos los servicios que estén libres para aplicar en promoción, no sean cuantas por cobrar ni vengan de paquete y que
                                    // sean igual al requisito
                                    if(servicioVenta.aplicableEnPromocion && servicioVenta.esVenta && !servicioVenta.noAplicablePromociones && servicioVenta.idPaqueteSucursalCliente == null){
                                        if(servicioVenta.idServicio == requisito.idServicio){
                                            servicioCantidadDisponiblePromocion++;
                                        }
                                    }
                                }

                                // Se verifica que se tienen servicios para cumplir con la cantidad de servicios del requisito
                                if(servicioCantidadDisponiblePromocion >= requisito.cantidad){

                                    // Si los servicios disponibles son mayor o igual a la cantidad pedida por el requisito significa que si se cumple con el requisito
                                    requisitosCumplidosCombo++;

                                    // Se recorren todos los servicios de la venta y se bloquean solo hasta que los servicios bloqueados 
                                    // sean igual a la cantidad de servicios del requisito
                                    var servicioCantidadAplicadaRequisito = 0;

                                    for(var k = 0; k < this.caja.venta.servicios.listaServiciosPorCobrar.length; k++){
                                        var servicioVenta = this.caja.venta.servicios.listaServiciosPorCobrar[k];

                                        if(servicioVenta.aplicableEnPromocion && servicioVenta.esVenta && !servicioVenta.noAplicablePromociones && servicioVenta.idPaqueteSucursalCliente == null){
                                            if(servicioVenta.idServicio == requisito.idServicio){

                                                // Se bloquea el servicio y se liga con la promoción en la que aplicó
                                                servicioVenta.aplicableEnPromocion = false;
                                                servicioVenta.promociones.push({
                                                    idPromocionAplicada: idPromocionAplicada
                                                });

                                                // Se calcula cuanto sería la suma del costo de los servicios y productos sin aplicar la promoción de combos
                                                valorComboOriginal = valorComboOriginal + Number(servicioVenta.costoDescuento);
                                                servicioCantidadAplicadaRequisito++;

                                                // Una vez que ya bloqueo solo los servicios necesarios para cumplir con el requisito, ya no recorre los demás servicios
                                                if(servicioCantidadAplicadaRequisito == requisito.cantidad){
                                                    k = this.caja.venta.servicios.listaServiciosPorCobrar.length;
                                                }

                                            }
                                        }
                                    }

                                }

                            }

                            // Se verifica si el requisito es producto
                            if(requisito.idInventarioPresentacion){
            
                                // Se recorren todos los productos de la venta
                                for(var k = 0; k < this.caja.venta.productos.listaProductosPorCobrar.length; k++){
                                    var productoVenta = this.caja.venta.productos.listaProductosPorCobrar[k];

                                    // Se verifica que el producto no sea cuenta por pagar
                                    if(productoVenta.esVenta){

                                        // Se verifica que el producto de la venta sea igual al del requisito
                                        if(productoVenta.idInventarioPresentacion == requisito.idInventarioPresentacion){
                        
                                            // Se verifica que haya suficiente cantidad de productos para cumplir con el requisito
                                            if(productoVenta.promocionCantidadDisponible >= requisito.cantidad){

                                                // Si cumple con el requisito se aumenta la cantidad de requisitos cumplidos
                                                requisitosCumplidosCombo++;

                                                // Se resta a la cantidad del producto la cantidad usada en el requisito
                                                productoVenta.promocionCantidadDisponible -= requisito.cantidad;

                                                // El producto de la venta se liga con la promoción en la que aplico y la cantidad que se aplico en esa promoción
                                                productoVenta.promociones.push({
                                                    idPromocionAplicada: idPromocionAplicada,
                                                    cantidadProductos: requisito.cantidad
                                                });

                                                // Se calcula cuanto sería la suma del costo de los servicios y productos sin aplicar la promoción de combos
                                                valorComboOriginal += ((Number(productoVenta.costoDescuento) / productoVenta.cantidad) * requisito.cantidad);

                                            }
                        
                                        }
                                    }

                                }

                            }

                        }

                        // Se verifica que los requisitos cumplidos sean igual a los requisitos pedidos por la promoción de combo
                        if(requisitosCumplidosCombo == promocionCombo.requisitos.length){

                            // Si se puede aplicar la promoción

                            // Se obtiene el valor de la promoción
                            var valorComboPromocion = Number(promocionCombo.valor[0].valor);

                            // Se checa si el valor original del combo es mayor a la promoción
                            if(valorComboOriginal > valorComboPromocion){

                                // Se resta el valor de la promoción al valor del combo original, esto es el valor que tendrá la promoción
                                // y es lo que se le va a descontar a todos los servicios y productos de la venta que aplicaron en la promoción
        
                                var descuentoCombo = valorComboOriginal - valorComboPromocion;
                                descuentoCombo = Number(descuentoCombo.toFixed(2));

                                this.caja.venta.promocionesNuevas.promocionesAplicadas[idPromocionAplicada - 1].pago = descuentoCombo;

                                // Se calcula el porcentaje que se le descontó al valor del combo original
                                var porcentajePromocionDescuento = Number(((descuentoCombo * 100) / valorComboOriginal).toFixed(2));

                                // Se recorren los servicios de la venta
                                for(var k = 0; k < this.caja.venta.servicios.listaServiciosPorCobrar.length; k++){
                                    var servicioVenta = this.caja.venta.servicios.listaServiciosPorCobrar[k];

                                    // Se recorren las promociones en las que aplico el servicio (solo es 1 pero se hizo igual que la estructura de productos)
                                    for(var l = 0; l < servicioVenta.promociones.length; l++){
                                        var promocion = servicioVenta.promociones[l];

                                        // Se calcula el descuento que tendrá el servicio en base al porcentaje que se le descontó del precio original
                                        if(promocion.idPromocionAplicada == idPromocionAplicada){
                                            promocion.descuento = Number((Number(servicioVenta.costoDescuento) * (porcentajePromocionDescuento / 100)).toFixed(2));
                                        }
                                    }
                                }

                                // Se recorren los productos de la venta
                                for(var k = 0; k < this.caja.venta.productos.listaProductosPorCobrar.length; k++){
                                    var productoVenta = this.caja.venta.productos.listaProductosPorCobrar[k];

                                    // Se recorren las promociones en las que aplico el producto
                                    for(var l = 0; l < productoVenta.promociones.length; l++){
                                        var promocion = productoVenta.promociones[l];

                                        // Se calcula el descuento que tendrá el producto en base al porcentaje que se le descontó del precio original
                                        if(promocion.idPromocionAplicada == idPromocionAplicada){
                                            promocion.descuento = Number((((Number(productoVenta.costoDescuento) / productoVenta.cantidad ) * promocion.cantidadProductos) * (porcentajePromocionDescuento / 100)).toFixed(2));
                                        }
                                    }
                                }

                            }
                            else{
        
                                // El valor de la promoción es 0 ya que el valor original es menor al valor de la promoción
                                this.caja.venta.promocionesNuevas.promocionesAplicadas[idPromocionAplicada - 1].pago = 0;

                                // El descuento que tendrán los servicios y productos serán de 0
                                for(var k = 0; k < this.caja.venta.servicios.listaServiciosPorCobrar.length; k++){
                                    var servicioVenta = this.caja.venta.servicios.listaServiciosPorCobrar[k];

                                    for(var l = 0; l < servicioVenta.promociones.length; l++){
                                        var promocion = servicioVenta.promociones[l];

                                        if(promocion.idPromocionAplicada == idPromocionAplicada){
                                            promocion.descuento = 0;
                                        }
                                    }
                                }

                                for(var k = 0; k < this.caja.venta.productos.listaProductosPorCobrar.length; k++){
                                    var productoVenta = this.caja.venta.productos.listaProductosPorCobrar[k];

                                    for(var l = 0; l < productoVenta.promociones.length; l++){
                                        var promocion = productoVenta.promociones[l];

                                        if(promocion.idPromocionAplicada == idPromocionAplicada){
                                            promocion.descuento = 0;
                                        }
                                    }
                                }

                            }

                        }
                        else{

                            // No se puede aplicar la promoción porque faltaron requisitos por cumplir

                            // Se regresa el uso real de la cantidad de la promoción y se quita de las promociones aplicadas
                            promocionCombo.cantidadUsosReal--;
                            this.caja.venta.promocionesNuevas.promocionesAplicadas.splice((idPromocionAplicada - 1), 1);

                            // Se recorren los servicios
                            for(var k = 0; k < this.caja.venta.servicios.listaServiciosPorCobrar.length; k++){
                                var servicioVenta = this.caja.venta.servicios.listaServiciosPorCobrar[k];

                                // Se recorren todas las promociones en las que aplicó el servicio
                                for(var l = 0; l < servicioVenta.promociones.length; l++){
                                    var promocion = servicioVenta.promociones[l];

                                    // Se detectan los servicios que tenían relación con la promoción que no se pudo cumplir y se vuelven a activar para otras promociones y se 
                                    // quita la relación con la promoción que no se cumplió
                                    if(promocion.idPromocionAplicada == idPromocionAplicada){
                                        servicioVenta.aplicableEnPromocion = true;
                                        servicioVenta.promociones.splice(l, 1);
                                        l--;
                                    }
                                }
                            }

                            // Se recorren los productos
                            for(var k = 0; k < this.caja.venta.productos.listaProductosPorCobrar.length; k++){
                                var productoVenta = this.caja.venta.productos.listaProductosPorCobrar[k];

                                // Se recorren todas las promociones en las que aplico el producto
                                for(var l = 0; l < productoVenta.promociones.length; l++){
                                    var promocion = productoVenta.promociones[l];

                                    // Se detectan los productos que tenían relación con la promoción que no se pudo cumplir y se le regresan los productos que se habían utilizado para 
                                    // la promoción y se quita la relación con la misma
                                    if(promocion.idPromocionAplicada == idPromocionAplicada){
                                        productoVenta.promocionCantidadDisponible += promocion.cantidadProductos;
                                        productoVenta.promociones.splice(l, 1);
                                        l--;
                                    }
                                }
                            }

                        }
                    }
                }
            }
        }
    }

    caja_venta_promocionesNuevas_aplicarPromocionesCombosSinCodigo (){

        for(var i = 0; i < this.caja.venta.promocionesNuevas.promocionCombos.sinCodigo.length; i++){
            var promocionCombo = this.caja.venta.promocionesNuevas.promocionCombos.sinCodigo[i];

            // Primero se calcula la cantidad de veces que el combo puede aplicarse en la venta 
            var cantidadServiciosProductosDisponibles = 0;
            var cantidadServiciosProductosRequeridos = 0;

            // Para calcular las veces que puede aplicarse el combo primero se cuentan los servicios y productos disponibles para la promocion
            for(var j = 0; j < this.caja.venta.servicios.listaServiciosPorCobrar.length; j++){
                var servicioVenta = this.caja.venta.servicios.listaServiciosPorCobrar[j];

                // Se cuentan solo los servicios que no estén aplicados en otras promociones, que no sean cuentas por cobrar ni vengan de paquete ni servicios prepagados(paypal)
                if(servicioVenta.aplicableEnPromocion && servicioVenta.esVenta && !servicioVenta.noAplicablePromociones && servicioVenta.idPaqueteSucursalCliente == null){
                    cantidadServiciosProductosDisponibles++;
                }
            }

            for(var j = 0; j < this.caja.venta.productos.listaProductosPorCobrar.length; j++){
                var productoVenta = this.caja.venta.productos.listaProductosPorCobrar[j];

                // Solo se cuentan los productos que tengan cantidades disponibles y no sean cuentas por pagar
                if(productoVenta.promocionCantidadDisponible > 0 && productoVenta.esVenta){
                    cantidadServiciosProductosDisponibles = cantidadServiciosProductosDisponibles + productoVenta.promocionCantidadDisponible;
                }
            }

            // Después se calculan la cantidad de servicios y productos requeridos para el combo
            for(var j = 0; j < promocionCombo.requisitos.length; j++){
                var requisito = promocionCombo.requisitos[j];

                cantidadServiciosProductosRequeridos = cantidadServiciosProductosRequeridos + requisito.cantidad;
            }

            // Se calcula la cantidad de aplicaciones del combo posibles tomando que un servicio y cantidad de producto solo puede aplicar para un combo
            var comboAplicacionesPosibles = Math.floor(cantidadServiciosProductosDisponibles / cantidadServiciosProductosRequeridos);

            // Se ejecutan todas las aplicaciones posibles del combo para checar cuantas veces aplica
            for(var p = 0; p < comboAplicacionesPosibles; p++){

                // Se verifica que la promoción no tenga uso limitado o si tiene que la cantidad de uso real sea menor a la configurada
                if(!promocionCombo.usoLimitado || (promocionCombo.usoLimitado && promocionCombo.cantidadUsosReal < promocionCombo.cantidadUsos)){

                    // Se crea la promoción aplicada ya que tiene que ir ligada con todos los servicio y productos y después se verifica que se 
                    // cumplan sus requisitos
                    var idPromocionAplicada = this.caja.venta.promocionesNuevas.promocionesAplicadas.length + 1;

                    this.caja.venta.promocionesNuevas.promocionesAplicadas.push({
                        id: idPromocionAplicada,
                        idPromocionSucursalNueva: promocionCombo.idPromocionSucursalNueva,
                        descripcion: promocionCombo.nombre
                    });

                    promocionCombo.cantidadUsosReal++;

                    var requisitosCumplidosCombo = 0;
                    var valorComboOriginal = 0;

                    // Se recorren todos los requisitos para verificar que se cumplan todos y aplque la promoción
                    for(var j = 0; j < promocionCombo.requisitos.length; j++){
                        var requisito = promocionCombo.requisitos[j];

                        // Se verifica si el requisito es servicio
                        if(requisito.idServicio){

                            var servicioCantidadDisponiblePromocion = 0;

                            // Se recorren todos los servicios de la venta 
                            for(var k = 0; k < this.caja.venta.servicios.listaServiciosPorCobrar.length; k++){
                                var servicioVenta = this.caja.venta.servicios.listaServiciosPorCobrar[k];

                                // Se cuentan todos los servicios que estén libres para aplicar en promoción, no sean cuantas por cobrar ni vengan de paquete ni sean servicios prepagados(paypal)
                                // y que sean igual al requisito
                                if(servicioVenta.aplicableEnPromocion && servicioVenta.esVenta && !servicioVenta.noAplicablePromociones && servicioVenta.idPaqueteSucursalCliente == null){
                                    if(servicioVenta.idServicio == requisito.idServicio){
                                        servicioCantidadDisponiblePromocion++;
                                    }
                                }
                            }

                            // Se verifica que se tienen servicios para cumplir con la cantidad de servicios del requisito
                            if(servicioCantidadDisponiblePromocion >= requisito.cantidad){

                                // Si los servicios disponibles son mayor o igual a la cantidad pedida por el requisito significa que si se cumple con el requisito
                                requisitosCumplidosCombo++;

                                // Se recorren todos los servicios de la venta y se bloquean solo hasta que los servicios bloqueados 
                                // sean igual a la cantidad de servicios del requisito
                                var servicioCantidadAplicadaRequisito = 0;

                                for(var k = 0; k < this.caja.venta.servicios.listaServiciosPorCobrar.length; k++){
                                    var servicioVenta = this.caja.venta.servicios.listaServiciosPorCobrar[k];

                                    if(servicioVenta.aplicableEnPromocion && servicioVenta.esVenta && !servicioVenta.noAplicablePromociones && servicioVenta.idPaqueteSucursalCliente == null){
                                        if(servicioVenta.idServicio == requisito.idServicio){

                                            // Se bloquea el servicio y se liga con la promoción en la que aplicó
                                            servicioVenta.aplicableEnPromocion = false;
                                            servicioVenta.promociones.push({
                                                idPromocionAplicada: idPromocionAplicada
                                            });

                                            // Se calcula cuanto sería la suma del costo de los servicios y productos sin aplicar la promoción de combos
                                            valorComboOriginal = valorComboOriginal + Number(servicioVenta.costoDescuento);
                                            servicioCantidadAplicadaRequisito++;

                                            // Una vez que ya bloqueo solo los servicios necesarios para cumplir con el requisito, ya no recorre los demás servicios
                                            if(servicioCantidadAplicadaRequisito == requisito.cantidad){
                                                k = this.caja.venta.servicios.listaServiciosPorCobrar.length;
                                            }

                                        }
                                    }
                                }

                            }

                        }

                        // Se verifica si el requisito es producto
                        if(requisito.idInventarioPresentacion){
            
                            // Se recorren todos los productos de la venta
                            for(var k = 0; k < this.caja.venta.productos.listaProductosPorCobrar.length; k++){
                                var productoVenta = this.caja.venta.productos.listaProductosPorCobrar[k];

                                // Se verifica que el producto no sea cuenta por pagar
                                if(productoVenta.esVenta){

                                    // Se verifica que el producto de la venta sea igual al del requisito
                                    if(productoVenta.idInventarioPresentacion == requisito.idInventarioPresentacion){
                        
                                        // Se verifica que haya suficiente cantidad de productos para cumplir con el requisito
                                        if(productoVenta.promocionCantidadDisponible >= requisito.cantidad){

                                            // Si cumple con el requisito se aumenta la cantidad de requisitos cumplidos
                                            requisitosCumplidosCombo++;

                                            // Se resta a la cantidad del producto la cantidad usada en el requisito
                                            productoVenta.promocionCantidadDisponible -= requisito.cantidad;

                                            // El producto de la venta se liga con la promoción en la que aplico y la cantidad que se aplico en esa promoción
                                            productoVenta.promociones.push({
                                                idPromocionAplicada: idPromocionAplicada,
                                                cantidadProductos: requisito.cantidad
                                            });

                                            // Se calcula cuanto sería la suma del costo de los servicios y productos sin aplicar la promoción de combos
                                            valorComboOriginal += ((Number(productoVenta.costoDescuento) / productoVenta.cantidad) * requisito.cantidad);

                                        }
                        
                                    }
                                }

                            }

                        }

                    }

                    // Se verifica que los requisitos cumplidos sean igual a los requisitos pedidos por la promoción de combo
                    if(requisitosCumplidosCombo == promocionCombo.requisitos.length){

                        // Si se puede aplicar la promoción

                        // Se obtiene el valor de la promoción
                        var valorComboPromocion = Number(promocionCombo.valor[0].valor);

                        // Se checa si el valor original del combo es mayor a la promoción
                        if(valorComboOriginal > valorComboPromocion){

                            // Se resta el valor de la promoción al valor del combo original, esto es el valor que tendrá la promoción
                            // y es lo que se le va a descontar a todos los servicios y productos de la venta que aplicaron en la promoción
        
                            var descuentoCombo = valorComboOriginal - valorComboPromocion;
                            descuentoCombo = Number(descuentoCombo.toFixed(2));

                            this.caja.venta.promocionesNuevas.promocionesAplicadas[idPromocionAplicada - 1].pago = descuentoCombo;

                            // Se calcula el porcentaje que se le descontó al valor del combo original
                            var porcentajePromocionDescuento = Number(((descuentoCombo * 100) / valorComboOriginal).toFixed(2));

                            // Se recorren los servicios de la venta
                            for(var k = 0; k < this.caja.venta.servicios.listaServiciosPorCobrar.length; k++){
                                var servicioVenta = this.caja.venta.servicios.listaServiciosPorCobrar[k];

                                // Se recorren las promociones en las que aplico el servicio (solo es 1 pero se hizo igual que la estructura de productos)
                                for(var l = 0; l < servicioVenta.promociones.length; l++){
                                    var promocion = servicioVenta.promociones[l];

                                    // Se calcula el descuento que tendrá el servicio en base al porcentaje que se le descontó del precio original
                                    if(promocion.idPromocionAplicada == idPromocionAplicada){
                                        promocion.descuento = Number((Number(servicioVenta.costoDescuento) * (porcentajePromocionDescuento / 100)).toFixed(2));
                                    }
                                }
                            }

                            // Se recorren los productos de la venta
                            for(var k = 0; k < this.caja.venta.productos.listaProductosPorCobrar.length; k++){
                                var productoVenta = this.caja.venta.productos.listaProductosPorCobrar[k];

                                // Se recorren las promociones en las que aplico el producto
                                for(var l = 0; l < productoVenta.promociones.length; l++){
                                    var promocion = productoVenta.promociones[l];

                                    // Se calcula el descuento que tendrá el producto en base al porcentaje que se le descontó del precio original
                                    if(promocion.idPromocionAplicada == idPromocionAplicada){
                                        promocion.descuento = Number((((Number(productoVenta.costoDescuento) / productoVenta.cantidad ) * promocion.cantidadProductos) * (porcentajePromocionDescuento / 100)).toFixed(2));
                                    }
                                }
                            }

                        }
                        else{
        
                            // El valor de la promoción es 0 ya que el valor original es menor al valor de la promoción
                            this.caja.venta.promocionesNuevas.promocionesAplicadas[idPromocionAplicada - 1].pago = 0;

                            // El descuento que tendrán los servicios y productos serán de 0
                            for(var k = 0; k < this.caja.venta.servicios.listaServiciosPorCobrar.length; k++){
                                var servicioVenta = this.caja.venta.servicios.listaServiciosPorCobrar[k];

                                for(var l = 0; l < servicioVenta.promociones.length; l++){
                                    var promocion = servicioVenta.promociones[l];

                                    if(promocion.idPromocionAplicada == idPromocionAplicada){
                                        promocion.descuento = 0;
                                    }
                                }
                            }

                            for(var k = 0; k < this.caja.venta.productos.listaProductosPorCobrar.length; k++){
                                var productoVenta = this.caja.venta.productos.listaProductosPorCobrar[k];

                                for(var l = 0; l < productoVenta.promociones.length; l++){
                                    var promocion = productoVenta.promociones[l];

                                    if(promocion.idPromocionAplicada == idPromocionAplicada){
                                        promocion.descuento = 0;
                                    }
                                }
                            }

                        }

                    }
                    else{

                        // No se puede aplicar la promoción porque faltaron requisitos por cumplir

                        // Se regresa el uso real de la cantidad de la promoción y se quita de las promociones aplicadas
                        promocionCombo.cantidadUsosReal--;
                        this.caja.venta.promocionesNuevas.promocionesAplicadas.splice((idPromocionAplicada - 1), 1);

                        // Se recorren los servicios
                        for(var k = 0; k < this.caja.venta.servicios.listaServiciosPorCobrar.length; k++){
                            var servicioVenta = this.caja.venta.servicios.listaServiciosPorCobrar[k];

                            // Se recorren todas las promociones en las que aplicó el servicio
                            for(var l = 0; l < servicioVenta.promociones.length; l++){
                                var promocion = servicioVenta.promociones[l];

                                // Se detectan los servicios que tenían relación con la promoción que no se pudo cumplir y se vuelven a activar para otras promociones y se 
                                // quita la relación con la promoción que no se cumplió
                                if(promocion.idPromocionAplicada == idPromocionAplicada){
                                    servicioVenta.aplicableEnPromocion = true;
                                    servicioVenta.promociones.splice(l, 1);
                                    l--;
                                }
                            }
                        }

                        // Se recorren los productos
                        for(var k = 0; k < this.caja.venta.productos.listaProductosPorCobrar.length; k++){
                            var productoVenta = this.caja.venta.productos.listaProductosPorCobrar[k];

                            // Se recorren todas las promociones en las que aplico el producto
                            for(var l = 0; l < productoVenta.promociones.length; l++){
                                var promocion = productoVenta.promociones[l];

                                // Se detectan los productos que tenían relación con la promoción que no se pudo cumplir y se le regresan los productos que se habían utilizado para 
                                // la promoción y se quita la relación con la misma
                                if(promocion.idPromocionAplicada == idPromocionAplicada){
                                    productoVenta.promocionCantidadDisponible += promocion.cantidadProductos;
                                    productoVenta.promociones.splice(l, 1);
                                    l--;
                                }
                            }
                        }

                    }
                }
            }

        }

    }

    caja_venta_promocionesNuevas_aplicarPromocionesGeneralesConCodigo (){

        for(var i = 0; i < this.caja.venta.promocionesNuevas.promocionGeneral.conCodigo.length; i++){
            var promocionGeneral = this.caja.venta.promocionesNuevas.promocionGeneral.conCodigo[i];

            // Se verifica que tenga el código ingresado en el modal de caja para poder aplicar la promoción
            if(promocionGeneral.aplicable){

                // Se recorren todos los requisitos
                for(var j = 0; j < promocionGeneral.requisitos.length; j++){
                    var requisito = promocionGeneral.requisitos[j];

                    // Se verifica que el requisito sea de tipo servicio (1 o todos)
                    if(requisito.idServicio || requisito.todosServicios){

                        // Se recorren todos los servicios de la venta
                        for(var k = 0; k < this.caja.venta.servicios.listaServiciosPorCobrar.length; k++){
                            var servicioVenta = this.caja.venta.servicios.listaServiciosPorCobrar[k];

                            // Se verifica que el servicio esté disponible para aplicar en promoción, no sea cuenta por pagar ni sea servicio de paquete ni servicios prepagado(paypal)
                            if(servicioVenta.aplicableEnPromocion && servicioVenta.esVenta && !servicioVenta.noAplicablePromociones && servicioVenta.idPaqueteSucursalCliente == null){

                                // Si verifica que el requisito sean todos los servicios y si no son todos, que el servicio del requisito se encuentre en la venta
                                if(requisito.todosServicios || !requisito.todosServicios && servicioVenta.idServicio == requisito.idServicio){

                                    // Se verifica que la promoción no sea de uso limitado o si lo es que la cantidad de usos reales sea menor a la configurada
                                    if(!promocionGeneral.usoLimitado || promocionGeneral.usoLimitado && promocionGeneral.cantidadUsosReal < promocionGeneral.cantidadUsos){

                                        // Si aplica la promoción por lo cual se agrega la promoción a las promociones aplicadas 
                                        var idPromocionAplicada = this.caja.venta.promocionesNuevas.promocionesAplicadas.length + 1;
                                        this.caja.venta.promocionesNuevas.promocionesAplicadas.push({
                                            id: idPromocionAplicada,
                                            idPromocionSucursalNueva: promocionGeneral.idPromocionSucursalNueva,
                                            descripcion: promocionGeneral.nombre
                                        });

                                        // Se registra el uso de la promoción y se bloquea el servicio para que no aplique en otra promoción
                                        promocionGeneral.cantidadUsosReal++;
                                        servicioVenta.aplicableEnPromocion = false;

                                        // Se recorren todos los valores de las promoción
                                        for(var l = 0; l < promocionGeneral.valor.length; l++){
                                            var valor = promocionGeneral.valor[l];

                                            // Se checa si el valor es para todas los servicios o si no, que el servicio del valor sea igual al de la venta (requisito)
                                            if(valor.todosServicios || !valor.todosServicios && valor.idServicio == servicioVenta.idServicio){

                                                // Se verifica que el tipo del valor es fijo 
                                                if(valor.idPromocionSucursalNuevaAplicacionValorTipo == 1){

                                                    // Se calcula el descuento que tendrá la promoción y el servicio 
                                                    if(valor.valor > Number(servicioVenta.costoDescuento)){
                                                        var descuentoPromocionGeneral:any = Number(servicioVenta.costoDescuento);
                                                    }
                                                    else{
                                                        var descuentoPromocionGeneral:any = valor.valor;
                                                    }
                                                }

                                                // Se verifica que el tipo del valor es fijo 
                                                if(valor.idPromocionSucursalNuevaAplicacionValorTipo == 2){
                                                    // Se calcula el descuento que tendrá la promoción y el servicio 
                                                    var descuentoPromocionGeneral:any = Number(servicioVenta.costoDescuento) * (valor.valor / 100);
                                                }

                                                descuentoPromocionGeneral = Number(descuentoPromocionGeneral.toFixed(2));

                                                // El valor de la promoción es el descuento que tendrá el servicio
                                                this.caja.venta.promocionesNuevas.promocionesAplicadas[idPromocionAplicada - 1].pago = descuentoPromocionGeneral;

                                                // Se liga el servicio con la promoción en la que aplicó
                                                servicioVenta.promociones.push({
                                                    idPromocionAplicada: idPromocionAplicada,
                                                    descuento: descuentoPromocionGeneral
                                                });

                                                // Si ya se encontró el valor se deja de checar los demás ya que solo hay un valor por servicio
                                                l = promocionGeneral.valor.length;

                                            }

                                        }
                                    }

                                }

                            }
                        }

                    }

                    // Se verifica que el requisito sea de tipo producto (1 o todos)
                    if(requisito.idInventarioPresentacion || requisito.todasPresentaciones){

                        // Se recorren todos los productos de la venta
                        for(var k = 0; k < this.caja.venta.productos.listaProductosPorCobrar.length; k++){
                            var productoVenta = this.caja.venta.productos.listaProductosPorCobrar[k];

                            // Se verifica que el producto no sea cuenta por pagar
                            if(productoVenta.esVenta){

                                // Se verifica que el requisito sea todas las promociones o si no lo es que el producto del requisito esté en la venta
                                if(requisito.todasPresentaciones || !requisito.todasPresentaciones && productoVenta.idInventarioPresentacion == requisito.idInventarioPresentacion){

                                    // Recorrer todos las cantidades posibles que tiene el producto para aplicar en promoción
                                    for(var l = 0; l < productoVenta.promocionCantidadDisponible; l++){

                                        // Se verifica que la promoción no sea de uso limitado o si lo es que la cantidad de usos reales sea menor a la configurada
                                        if(!promocionGeneral.usoLimitado || promocionGeneral.usoLimitado && promocionGeneral.cantidadUsosReal < promocionGeneral.cantidadUsos){

                                            // Si aplica la promoción por lo cual se agrega la promoción a las promociones aplicadas 
                                            var idPromocionAplicada = this.caja.venta.promocionesNuevas.promocionesAplicadas.length + 1;
                                            this.caja.venta.promocionesNuevas.promocionesAplicadas.push({
                                                id: idPromocionAplicada,
                                                idPromocionSucursalNueva: promocionGeneral.idPromocionSucursalNueva,
                                                descripcion: promocionGeneral.nombre
                                            });

                                            // Se registra el uso de la promoción
                                            promocionGeneral.cantidadUsosReal++;

                                            // Se resta el uso del producto por la promoción de la cantidad de productos disponibles para aplicar en promoción
                                            // se resta el index para no perder la siguiente cantidad del producto de venta
                                            productoVenta.promocionCantidadDisponible--;
                                            l--;

                                            // Se recorren todos los valores de la promoción
                                            for(var m = 0; m < promocionGeneral.valor.length; m++){
                                                var valor = promocionGeneral.valor[m];

                                                // Se verifica que el valor sea para todos los productos o si no que el producto del valor sea igual al de la venta 
                                                if(valor.todasPresentaciones || !valor.todasPresentaciones && valor.idInventarioPresentacion == productoVenta.idInventarioPresentacion){

                                                    // Se verifica que el tipo del valor de la promoción es fijo
                                                    if(valor.idPromocionSucursalNuevaAplicacionValorTipo == 1){

                                                        // Se calcula el descuento que tendrá la promoción y el producto
                                                        if(valor.valor > (Number(productoVenta.costoDescuento) / productoVenta.cantidad)){
                                                            var descuentoPromocionGeneral:any = (Number(productoVenta.costoDescuento) / productoVenta.cantidad);
                                                        }
                                                        else{
                                                            var descuentoPromocionGeneral = valor.valor;
                                                        }

                                                    }

                                                    // Se verifica que el tipo del valor de la promoción es porcentaje
                                                    if(valor.idPromocionSucursalNuevaAplicacionValorTipo == 2){

                                                        // Se calcula el descuento que tendrá la promoción y el producto
                                                        var descuentoPromocionGeneral:any = (Number(productoVenta.costoDescuento) / productoVenta.cantidad) * (valor.valor / 100);
                                                    }

                                                    descuentoPromocionGeneral = Number(descuentoPromocionGeneral.toFixed(2));

                                                    // El valor de la promoción es el descuento que tendrá el producto
                                                    this.caja.venta.promocionesNuevas.promocionesAplicadas[idPromocionAplicada - 1].pago = descuentoPromocionGeneral;

                                                    // Se liga el producto con la promoción en la que aplicó y se agrega también la cantidad que se utilizó
                                                    this.caja.venta.productos.listaProductosPorCobrar[k].promociones.push({
                                                        idPromocionAplicada: idPromocionAplicada,
                                                        cantidadProductos: 1,
                                                        descuento: descuentoPromocionGeneral
                                                    });

                                                    // Si ya se encontró el valor se deja de checar los demás ya que solo hay un valor por producto
                                                    m = promocionGeneral.valor.length;

                                                }

                                            }
                                        }

                                    }

                                }
                            }

                        }

                    }

                }
            }
        }

    }

    caja_venta_promocionesNuevas_aplicarPromocionesGeneralesSinCodigo (){

        for(var i = 0; i < this.caja.venta.promocionesNuevas.promocionGeneral.sinCodigo.length; i++){
            var promocionGeneral = this.caja.venta.promocionesNuevas.promocionGeneral.sinCodigo[i];

            // Se recorren todos los requisitos
            for(var j = 0; j < promocionGeneral.requisitos.length; j++){
                var requisito = promocionGeneral.requisitos[j];

                // Se verifica que el requisito sea de tipo servicio (1 o todos)
                if(requisito.idServicio || requisito.todosServicios){

                    // Se recorren todos los servicios de la venta
                    for(var k = 0; k < this.caja.venta.servicios.listaServiciosPorCobrar.length; k++){
                        var servicioVenta = this.caja.venta.servicios.listaServiciosPorCobrar[k];

                        // Se verifica que el servicio esté disponible para aplicar en promoción, no sea cuenta por pagar ni sea servicio de paquete ni servicios prepagado(paypal)
                        if(servicioVenta.aplicableEnPromocion && servicioVenta.esVenta && !servicioVenta.noAplicablePromociones && servicioVenta.idPaqueteSucursalCliente == null){

                            // Si verifica que el requisito sean todos los servicios y si no son todos, que el servicio del requisito se encuentre en la venta
                            if(requisito.todosServicios || !requisito.todosServicios && servicioVenta.idServicio == requisito.idServicio){

                                // Se verifica que la promoción no sea de uso limitado o si lo es que la cantidad de usos reales sea menor a la configurada
                                if(!promocionGeneral.usoLimitado || promocionGeneral.usoLimitado && promocionGeneral.cantidadUsosReal < promocionGeneral.cantidadUsos){

                                    // Si aplica la promoción por lo cual se agrega la promoción a las promociones aplicadas 
                                    var idPromocionAplicada = this.caja.venta.promocionesNuevas.promocionesAplicadas.length + 1;
                                    this.caja.venta.promocionesNuevas.promocionesAplicadas.push({
                                        id: idPromocionAplicada,
                                        idPromocionSucursalNueva: promocionGeneral.idPromocionSucursalNueva,
                                        descripcion: promocionGeneral.nombre
                                    });

                                    // Se registra el uso de la promoción y se bloquea el servicio para que no aplique en otra promoción
                                    promocionGeneral.cantidadUsosReal++;
                                    servicioVenta.aplicableEnPromocion = false;

                                    // Se recorren todos los valores de las promoción
                                    for(var l = 0; l < promocionGeneral.valor.length; l++){
                                        var valor = promocionGeneral.valor[l];

                                        // Se checa si el valor es para todas los servicios o si no, que el servicio del valor sea igual al de la venta (requisito)
                                        if(valor.todosServicios || !valor.todosServicios && valor.idServicio == servicioVenta.idServicio){

                                            // Se verifica que el tipo del valor es fijo 
                                            if(valor.idPromocionSucursalNuevaAplicacionValorTipo == 1){

                                                // Se calcula el descuento que tendrá la promoción y el servicio 
                                                if(valor.valor > Number(servicioVenta.costoDescuento)){
                                                    var descuentoPromocionGeneral:any = Number(servicioVenta.costoDescuento);
                                                }
                                                else{
                                                    var descuentoPromocionGeneral:any = valor.valor;
                                                }
                                            }

                                            // Se verifica que el tipo del valor es fijo 
                                            if(valor.idPromocionSucursalNuevaAplicacionValorTipo == 2){
                                                // Se calcula el descuento que tendrá la promoción y el servicio 
                                                var descuentoPromocionGeneral:any = Number(servicioVenta.costoDescuento) * (valor.valor / 100);
                                            }

                                            descuentoPromocionGeneral = Number(descuentoPromocionGeneral.toFixed(2));

                                            // El valor de la promoción es el descuento que tendrá el servicio
                                            this.caja.venta.promocionesNuevas.promocionesAplicadas[idPromocionAplicada - 1].pago = descuentoPromocionGeneral;

                                            // Se liga el servicio con la promoción en la que aplicó
                                            servicioVenta.promociones.push({
                                                idPromocionAplicada: idPromocionAplicada,
                                                descuento: descuentoPromocionGeneral
                                            });

                                            // Si ya se encontró el valor se deja de checar los demás ya que solo hay un valor por servicio
                                            l = promocionGeneral.valor.length;

                                        }

                                    }
                                }

                            }

                        }
                    }

                }

                // Se verifica que el requisito sea de tipo producto (1 o todos)
                if(requisito.idInventarioPresentacion || requisito.todasPresentaciones){

                    // Se recorren todos los productos de la venta
                    for(var k = 0; k < this.caja.venta.productos.listaProductosPorCobrar.length; k++){
                        var productoVenta = this.caja.venta.productos.listaProductosPorCobrar[k];

                        // Se verifica que el producto no sea cuenta por pagar
                        if(productoVenta.esVenta){

                            // Se verifica que el requisito sea todas las promociones o si no lo es que el producto del requisito esté en la venta
                            if(requisito.todasPresentaciones || !requisito.todasPresentaciones && productoVenta.idInventarioPresentacion == requisito.idInventarioPresentacion){

                                // Recorrer todos las cantidades posibles que tiene el producto para aplicar en promoción
                                for(var l = 0; l < productoVenta.promocionCantidadDisponible; l++){

                                    // Se verifica que la promoción no sea de uso limitado o si lo es que la cantidad de usos reales sea menor a la configurada
                                    if(!promocionGeneral.usoLimitado || promocionGeneral.usoLimitado && promocionGeneral.cantidadUsosReal < promocionGeneral.cantidadUsos){

                                        // Si aplica la promoción por lo cual se agrega la promoción a las promociones aplicadas 
                                        var idPromocionAplicada = this.caja.venta.promocionesNuevas.promocionesAplicadas.length + 1;
                                        this.caja.venta.promocionesNuevas.promocionesAplicadas.push({
                                            id: idPromocionAplicada,
                                            idPromocionSucursalNueva: promocionGeneral.idPromocionSucursalNueva,
                                            descripcion: promocionGeneral.nombre
                                        });

                                        // Se registra el uso de la promoción
                                        promocionGeneral.cantidadUsosReal++;

                                        // Se resta el uso del producto por la promoción de la cantidad de productos disponibles para aplicar en promoción
                                        // se resta el index para no perder la siguiente cantidad del producto de venta
                                        productoVenta.promocionCantidadDisponible--;
                                        l--;

                                        // Se recorren todos los valores de la promoción
                                        for(var m = 0; m < promocionGeneral.valor.length; m++){
                                            var valor = promocionGeneral.valor[m];

                                            // Se verifica que el valor sea para todos los productos o si no que el producto del valor sea igual al de la venta 
                                            if(valor.todasPresentaciones || !valor.todasPresentaciones && valor.idInventarioPresentacion == productoVenta.idInventarioPresentacion){

                                                // Se verifica que el tipo del valor de la promoción es fijo
                                                if(valor.idPromocionSucursalNuevaAplicacionValorTipo == 1){

                                                    // Se calcula el descuento que tendrá la promoción y el producto
                                                    if(valor.valor > (Number(productoVenta.costoDescuento) / productoVenta.cantidad)){
                                                        var descuentoPromocionGeneral:any = (Number(productoVenta.costoDescuento) / productoVenta.cantidad);
                                                    }
                                                    else{
                                                        var descuentoPromocionGeneral:any = valor.valor;
                                                    }

                                                }

                                                // Se verifica que el tipo del valor de la promoción es porcentaje
                                                if(valor.idPromocionSucursalNuevaAplicacionValorTipo == 2){

                                                    // Se calcula el descuento que tendrá la promoción y el producto
                                                    var descuentoPromocionGeneral:any = (Number(productoVenta.costoDescuento) / productoVenta.cantidad) * (valor.valor / 100);
                                                }

                                                descuentoPromocionGeneral = Number(descuentoPromocionGeneral.toFixed(2));

                                                // El valor de la promoción es el descuento que tendrá el producto
                                                this.caja.venta.promocionesNuevas.promocionesAplicadas[idPromocionAplicada - 1].pago = descuentoPromocionGeneral;

                                                // Se liga el producto con la promoción en la que aplicó y se agrega también la cantidad que se utilizó
                                                this.caja.venta.productos.listaProductosPorCobrar[k].promociones.push({
                                                    idPromocionAplicada: idPromocionAplicada,
                                                    cantidadProductos: 1,
                                                    descuento: descuentoPromocionGeneral
                                                });

                                                // Si ya se encontró el valor se deja de checar los demás ya que solo hay un valor por producto
                                                m = promocionGeneral.valor.length;

                                            }

                                        }
                                    }

                                }

                            }
                        }

                    }

                }

            }
        }
        
    }

    caja_venta_promocionesNuevas_aplicarServiciosProductosPendientes (){

        // Se recorren todos los servicios y productos pendientes de canje que tiene el cliente
        for(var i = 0; i < this.caja.venta.promocionesNuevas.serviciosProductosPendientes.length; i++){
            var promocionCanjePendiente = this.caja.venta.promocionesNuevas.serviciosProductosPendientes[i];
           
            // Se verifica que el canje pendiente sea un servicio
            if(promocionCanjePendiente.idServicio){

                // Se recorren todos los servicios de la venta
                for(var j = 0; j < this.caja.venta.servicios.listaServiciosPorCobrar.length; j++){
                    var servicioVenta = this.caja.venta.servicios.listaServiciosPorCobrar[j];

                    // Se verifica que el servicio de la venta esté libre para aplicar en promoción, no sea cuenta por pagar ni sea un servicio de paquete ni servicios prepagado(paypal)
                    if(servicioVenta.aplicableEnPromocion && servicioVenta.esVenta && !servicioVenta.noAplicablePromociones && servicioVenta.idPaqueteSucursalCliente == null){

                        // Se verifica que el canje pendiente se encuentra en la venta
                        if(servicioVenta.idServicio == promocionCanjePendiente.idServicio){

                            // Se agrega la promoción aplicada nueva
                            var idPromocionAplicada = this.caja.venta.promocionesNuevas.promocionesAplicadas.length + 1;

                            this.caja.venta.promocionesNuevas.promocionesAplicadas.push({
                                id: idPromocionAplicada,
                                idPromocionSucursalNueva: promocionCanjePendiente.idPromocionSucursalNueva,
                                descripcion: promocionCanjePendiente.nombre,
                                idPromocionSucursalNuevaAplicacionValorPendienteCliente: promocionCanjePendiente.idPromocionSucursalNuevaAplicacionValorPendienteCliente
                            });

                            // El servicio se bloquea para las demás promociones
                            servicioVenta.aplicableEnPromocion = false;

                            // Se verifica el tipo de valor del canje para calcular el descuento que tendrá la promoción
                            if(promocionCanjePendiente.idPromocionSucursalNuevaAplicacionValorTipo == 1){
                                if(promocionCanjePendiente.valor > Number(servicioVenta.costoDescuento)){
                                    var descuentoPromocionGeneral:any = Number(servicioVenta.costoDescuento);
                                }
                                else{
                                    var descuentoPromocionGeneral:any = promocionCanjePendiente.valor;
                                }
                            }

                            if(promocionCanjePendiente.idPromocionSucursalNuevaAplicacionValorTipo == 2){
                                var descuentoPromocionGeneral:any = Number(servicioVenta.costoDescuento) * (promocionCanjePendiente.valor / 100);
                            }

                            descuentoPromocionGeneral = Number(descuentoPromocionGeneral.toFixed(2));

                            // El descuento calculado es el valor de la promoción y es lo que se le descontará al servicio
                            this.caja.venta.promocionesNuevas.promocionesAplicadas[idPromocionAplicada - 1].pago = descuentoPromocionGeneral;

                            // El servicio se ligará con su promoción en la que aplico y el id del canje del servicio gratis
                            servicioVenta.promociones.push({
                                idPromocionAplicada: idPromocionAplicada,
                                descuento: descuentoPromocionGeneral,
                                idPromocionSucursalNuevaAplicacionValorPendienteCliente: promocionCanjePendiente.idPromocionSucursalNuevaAplicacionValorPendienteCliente
                            });

                            j = this.caja.venta.servicios.listaServiciosPorCobrar.length;

                        }

                    }

                }

            }

            // Se verifica que el canje pendiente sea un producto
            if(promocionCanjePendiente.idInventarioPresentacion){

                // Se recorren todos los productos vendidos
                for(var j = 0; j < this.caja.venta.productos.listaProductosPorCobrar.length; j++){
                    var productoVenta = this.caja.venta.productos.listaProductosPorCobrar[j];

                    // Se verifica que el producto no sea una cuenta por pagar
                    if(productoVenta.esVenta){

                        // Se verifica que el producto del canje esté en la venta
                        if(productoVenta.idInventarioPresentacion == promocionCanjePendiente.idInventarioPresentacion){

                            // Se verifica si hay productos a aplicar en promoción
                            if(productoVenta.promocionCantidadDisponible > 0){

                                // Se canjea el producto

                                // Se agrega la promoción aplicada nueva
                                var idPromocionAplicada = this.caja.venta.promocionesNuevas.promocionesAplicadas.length + 1;

                                this.caja.venta.promocionesNuevas.promocionesAplicadas.push({
                                    id: idPromocionAplicada,
                                    idPromocionSucursalNueva: promocionCanjePendiente.idPromocionSucursalNueva,
                                    descripcion: promocionCanjePendiente.nombre,
                                    idPromocionSucursalNuevaAplicacionValorPendienteCliente: promocionCanjePendiente.idPromocionSucursalNuevaAplicacionValorPendienteCliente
                                });

                                // Se disminuye la cantidad de productos disponibles para las siguientes promociones
                                // (** No se aplica para todas las cantidades pendientes pues se supone el canje solo aplica para una cantidad **)
                                productoVenta.promocionCantidadDisponible--;

                                // Se verifica el tipo de valor del canje para calcular el descuento que tendrá la promoción y el producto
                                if(promocionCanjePendiente.idPromocionSucursalNuevaAplicacionValorTipo == 1){
                                    if(promocionCanjePendiente.valor > (Number(productoVenta.costoDescuento) / productoVenta.cantidad)){
                                        var descuentoPromocionGeneral:any = (Number(productoVenta.costoDescuento) / productoVenta.cantidad);
                                    }
                                    else{
                                        var descuentoPromocionGeneral:any = promocionCanjePendiente.valor;
                                    }
                                }

                                if(promocionCanjePendiente.idPromocionSucursalNuevaAplicacionValorTipo == 2){
                                    var descuentoPromocionGeneral:any = (Number(productoVenta.costoDescuento) / productoVenta.cantidad) * (promocionCanjePendiente.valor / 100);
                                }

                                descuentoPromocionGeneral = Number(descuentoPromocionGeneral.toFixed(2));

                                // El descuento calculado es el valor de la promoción y es lo que se le descontará al producto también
                                this.caja.venta.promocionesNuevas.promocionesAplicadas[idPromocionAplicada - 1].pago = descuentoPromocionGeneral;

                                // El producto se ligará con su promoción en la que aplico y el id del canje del producto gratis, además de agregarle la cantidad 
                                // que se utilizo para esta promoción y canje
                                productoVenta.promociones.push({
                                    idPromocionAplicada: idPromocionAplicada,
                                    descuento: descuentoPromocionGeneral,
                                    idPromocionSucursalNuevaAplicacionValorPendienteCliente: promocionCanjePendiente.idPromocionSucursalNuevaAplicacionValorPendienteCliente, 
                                    cantidadProductos: 1
                                });

                                j = this.caja.venta.productos.listaProductosPorCobrar.length;
                            }

                        }

                    }

                }

            }

        }

    }

    caja_venta_promocionesNuevas_verificarCodigo () {

        var aplicacionCodigo = false;

        for(var i = 0; i < this.caja.venta.promocionesNuevas.promocionCombos.conCodigo.length; i++){
            if(this.caja.venta.promocionesNuevas.promocionCombos.conCodigo[i].codigo == this.caja.venta.promocionesNuevas.codigo){
                aplicacionCodigo = true;
                this.caja.venta.promocionesNuevas.promocionCombos.conCodigo[i].aplicable = true;
                i = this.caja.venta.promocionesNuevas.promocionCombos.conCodigo.length;
            }
        }

        for(var i = 0; i < this.caja.venta.promocionesNuevas.promocionGeneral.conCodigo.length; i++){
            if(this.caja.venta.promocionesNuevas.promocionGeneral.conCodigo[i].codigo == this.caja.venta.promocionesNuevas.codigo){
                aplicacionCodigo = true;
                this.caja.venta.promocionesNuevas.promocionGeneral.conCodigo[i].aplicable = true;
                i = this.caja.venta.promocionesNuevas.promocionGeneral.conCodigo.length;
            }
        }

        if(!aplicacionCodigo){
            this._toaster.error("El Código ingresado no aplica para niguna de las Promociones Vigentes");            
            this.caja.venta.promocionesNuevas.codigo = "";
        }
    }

    // ----- Eliminar promociones -----
    caja_venta_promocionesNuevas_eliminarPromocionAplicada (id:any) {

        // Recorrer todas las promociones
        for(var i = 0; i < this.caja.venta.promocionesNuevas.promocionesAplicadas.length; i++){
            var promocionAplicada = this.caja.venta.promocionesNuevas.promocionesAplicadas[i];

            // Encontrar la promoción que se quiere borrar
            if(promocionAplicada.id == id){

                // Eliminar la relación de la promoción con los servicios y volver a activarlos para que apliquen en otras promociones
                for(var j = 0; j < this.caja.venta.servicios.listaServiciosPorCobrar.length; j++){
                    var servicioVenta = this.caja.venta.servicios.listaServiciosPorCobrar[j];

                    for(var k = 0; k < servicioVenta.promociones.length; k++){
                        var promocion = servicioVenta.promociones[k];

                        if(promocion.idPromocionAplicada == promocionAplicada.id){
                            servicioVenta.promociones.splice(k, 1);
                            k--;
                        }
                    }

                    if(servicioVenta.promociones.length == 0){
                        servicioVenta.aplicableEnPromocion = true;
                    }
                }

                // Eliminar la relación de la promoción con los productos y aumentar las cantidades disponibles para las demás promociones
                for(var j = 0; j < this.caja.venta.productos.listaProductosPorCobrar.length; j++){
                    var productoVenta = this.caja.venta.productos.listaProductosPorCobrar[j];
                    
                    for(var k = 0; k < productoVenta.promociones.length; k++){
                        var promocion = productoVenta.promociones[k];

                        if(promocion.idPromocionAplicada == promocionAplicada.id){
                            productoVenta.promocionCantidadDisponible += promocion.cantidadProductos;
                            productoVenta.promociones.splice(k, 1);
                            k--;
                        }
                    }

                }

                // Eliminar la promoción 
                this.caja.venta.promocionesNuevas.promocionesAplicadas.splice(i, 1);
                i = this.caja.venta.promocionesNuevas.promocionesAplicadas.length;
            }
        }

        // Se recorren las promociones que quedaron
        for(var i = 0; i < this.caja.venta.promocionesNuevas.promocionesAplicadas.length; i++){
            // Se calcula el nuevo id que deben de tener y se remplaza tanto en el arreglo de promociones
            // como en la relación de los servicios y productos con las promociones
            var idNuevo = i + 1;
            var idAnterior = this.caja.venta.promocionesNuevas.promocionesAplicadas[i].id;
            this.caja.venta.promocionesNuevas.promocionesAplicadas[i].id = idNuevo;

            for(var j = 0; j < this.caja.venta.servicios.listaServiciosPorCobrar.length; j++){
                var servicioVenta = this.caja.venta.servicios.listaServiciosPorCobrar[j];

                for(var k = 0; k < servicioVenta.promociones.length; k++){
                    var promocion = servicioVenta.promociones[k];

                    if(promocion.idPromocionAplicada == idAnterior){
                        promocion.idPromocionAplicada = idNuevo;
                    }
                }

            }

            for(var j = 0; j < this.caja.venta.productos.listaProductosPorCobrar.length; j++){
                var productoVenta = this.caja.venta.productos.listaProductosPorCobrar[j];
                    
                for(var k = 0; k < productoVenta.promociones.length; k++){
                    var promocion = productoVenta.promociones[k];

                    if(promocion.idPromocionAplicada == idAnterior){
                        promocion.idPromocionAplicada = idNuevo;
                    }
                }

            }
            
        }

        // Se vuelven a calcular los totales
        this.caja_venta_calcularTotales();
    }

    // ----- Editar promociones -----
    caja_venta_promocionesNuevas_abrirModalEdicionPromociones () {
        this.modales.modalPromociones.show();

        this.caja.venta.promocionesNuevas.editarPromociones = {};
        this.caja.venta.promocionesNuevas.editarPromociones.promocionesPosibles = [];
        this.caja.venta.promocionesNuevas.editarPromociones.promocionesAplicadas = [];

        this.caja_venta_promocionesNuevas_limpiarPromocionesEditarDataOriginal();
        this.caja_venta_promocionesNuevas_verificarCodigoEditar();

        this.caja.venta.promocionesNuevas.editarPromociones.serviciosVenta = JSON.parse(JSON.stringify(this.caja.venta.servicios.listaServiciosPorCobrar));
        this.caja.venta.promocionesNuevas.editarPromociones.productosVenta = JSON.parse(JSON.stringify(this.caja.venta.productos.listaProductosPorCobrar));

        for(var i = 0; i < this.caja.venta.promocionesNuevas.editarPromociones.serviciosVenta.length; i++){
            this.caja.venta.promocionesNuevas.editarPromociones.serviciosVenta[i].promociones = [];
            this.caja.venta.promocionesNuevas.editarPromociones.serviciosVenta[i].aplicableEnPromocion = true;
        }

        for(var i = 0; i < this.caja.venta.promocionesNuevas.editarPromociones.productosVenta.length; i++){
            this.caja.venta.promocionesNuevas.editarPromociones.productosVenta[i].promociones = [];
            this.caja.venta.promocionesNuevas.editarPromociones.productosVenta[i].promocionCantidadDisponible = this.caja.venta.promocionesNuevas.editarPromociones.productosVenta[i].cantidad;
        }

        this.caja_venta_promocionesNuevas_calcularPromocionesPosibles();
    }

    caja_venta_promocionesNuevas_verificarCodigoEditar (){

        var aplicacionCodigo = false;

        for(var i = 0; i < this.caja.venta.promocionesNuevas.editarPromociones.promocionCombos.conCodigo.length; i++){
            if(this.caja.venta.promocionesNuevas.editarPromociones.promocionCombos.conCodigo[i].codigo == this.caja.venta.promocionesNuevas.codigo){
                aplicacionCodigo = true;
                this.caja.venta.promocionesNuevas.editarPromociones.promocionCombos.conCodigo[i].aplicable = true;
                i = this.caja.venta.promocionesNuevas.editarPromociones.promocionCombos.conCodigo.length;
            }
        }

        for(var i = 0; i < this.caja.venta.promocionesNuevas.editarPromociones.promocionGeneral.conCodigo.length; i++){
            if(this.caja.venta.promocionesNuevas.editarPromociones.promocionGeneral.conCodigo[i].codigo == this.caja.venta.promocionesNuevas.codigo){
                aplicacionCodigo = true;
                this.caja.venta.promocionesNuevas.editarPromociones.promocionGeneral.conCodigo[i].aplicable = true;
                i = this.caja.venta.promocionesNuevas.editarPromociones.promocionGeneral.conCodigo.length;
            }
        }

    }

    caja_venta_promocionesNuevas_limpiarPromocionesEditarDataOriginal (){
        
        var dataTemp = JSON.parse(JSON.stringify(this.caja.venta.promocionesNuevas.dataOriginal));

        this.caja.venta.promocionesNuevas.editarPromociones.promocionGeneral = {};
        this.caja.venta.promocionesNuevas.editarPromociones.promocionGeneral.conCodigo = [];
        this.caja.venta.promocionesNuevas.editarPromociones.promocionGeneral.sinCodigo = [];

        this.caja.venta.promocionesNuevas.editarPromociones.promocionCombos = {};
        this.caja.venta.promocionesNuevas.editarPromociones.promocionCombos.conCodigo = [];
        this.caja.venta.promocionesNuevas.editarPromociones.promocionCombos.sinCodigo = [];

        this.caja.venta.promocionesNuevas.editarPromociones.serviciosProductosPendientes = [];

        for(var i = 0; i < dataTemp[0].length; i++){

            var requisitos = [];
            var valor = [];

            // Obtener los requisitos de la promoción
            for(var j = 0; j < dataTemp[1].length; j++){
                if(dataTemp[0][i].idPromocionSucursalNueva == dataTemp[1][j].idPromocionSucursalNueva){
                    requisitos.push({
                        todosServicios: dataTemp[1][j].todosServicios,
                        idServicio: dataTemp[1][j].idServicio,
                        todasPresentaciones: dataTemp[1][j].todasPresentaciones,
                        idInventarioPresentacion: dataTemp[1][j].idInventarioPresentacion,
                        cantidad: dataTemp[1][j].cantidad ? dataTemp[1][j].cantidad : 1
                    });
                }
            }

            // Obtener el valor de la promoción
            for(var j = 0; j < dataTemp[2].length; j++){
                if(dataTemp[0][i].idPromocionSucursalNueva == dataTemp[2][j].idPromocionSucursalNueva){
                    valor.push({
                        todosServicios: dataTemp[2][j].todosServicios,
                        idServicio: dataTemp[2][j].idServicio,
                        todasPresentaciones: dataTemp[2][j].todasPresentaciones,
                        idInventarioPresentacion: dataTemp[2][j].idInventarioPresentacion,
                        idPromocionSucursalNuevaAplicacionValorTipo: dataTemp[2][j].idPromocionSucursalNuevaAplicacionValorTipo,
                        valor: dataTemp[2][j].valor
                    });
                }
            }

            // Promociónes Generales
            if(dataTemp[0][i].idPromocionSucursalNuevaTipo == 1){
                if(dataTemp[0][i].aplicacionPorCodigo){
                    this.caja.venta.promocionesNuevas.editarPromociones.promocionGeneral.conCodigo.push({
                        idPromocionSucursalNueva: dataTemp[0][i].idPromocionSucursalNueva,
                        nombre: dataTemp[0][i].nombre,
                        idPromocionSucursalNuevaTipo: dataTemp[0][i].idPromocionSucursalNuevaTipo,
                        aplicacionPorCodigo: dataTemp[0][i].aplicacionPorCodigo,
                        codigo: dataTemp[0][i].codigo,
                        usoLimitado: dataTemp[0][i].usoLimitado,
                        cantidadUsos: dataTemp[0][i].cantidadUsos ? dataTemp[0][i].cantidadUsos : 0,
                        cantidadUsosReal: dataTemp[0][i].cantidadUsosReal,
                        requisitos: requisitos,
                        valor: valor,
                        aplicable: false
                    });
                }
                else{
                    this.caja.venta.promocionesNuevas.editarPromociones.promocionGeneral.sinCodigo.push({
                        idPromocionSucursalNueva: dataTemp[0][i].idPromocionSucursalNueva,
                        nombre: dataTemp[0][i].nombre,
                        idPromocionSucursalNuevaTipo: dataTemp[0][i].idPromocionSucursalNuevaTipo,
                        aplicacionPorCodigo: dataTemp[0][i].aplicacionPorCodigo,
                        codigo: dataTemp[0][i].codigo,
                        usoLimitado: dataTemp[0][i].usoLimitado,
                        cantidadUsos: dataTemp[0][i].cantidadUsos ? dataTemp[0][i].cantidadUsos : 0,
                        cantidadUsosReal: dataTemp[0][i].cantidadUsosReal,
                        requisitos: requisitos,
                        valor: valor
                    });
                }
            }

            // Promociones de Combos
            if(dataTemp[0][i].idPromocionSucursalNuevaTipo == 2){
                if(dataTemp[0][i].aplicacionPorCodigo){
                    this.caja.venta.promocionesNuevas.editarPromociones.promocionCombos.conCodigo.push({
                        idPromocionSucursalNueva: dataTemp[0][i].idPromocionSucursalNueva,
                        nombre: dataTemp[0][i].nombre,
                        idPromocionSucursalNuevaTipo: dataTemp[0][i].idPromocionSucursalNuevaTipo,
                        aplicacionPorCodigo: dataTemp[0][i].aplicacionPorCodigo,
                        codigo: dataTemp[0][i].codigo,
                        usoLimitado: dataTemp[0][i].usoLimitado,
                        cantidadUsos: dataTemp[0][i].cantidadUsos,
                        cantidadUsosReal: dataTemp[0][i].cantidadUsosReal,
                        requisitos: requisitos,
                        valor: valor,
                        aplicable: false
                    });
                }
                else{
                    this.caja.venta.promocionesNuevas.editarPromociones.promocionCombos.sinCodigo.push({
                        idPromocionSucursalNueva: dataTemp[0][i].idPromocionSucursalNueva,
                        nombre: dataTemp[0][i].nombre,
                        idPromocionSucursalNuevaTipo: dataTemp[0][i].idPromocionSucursalNuevaTipo,
                        aplicacionPorCodigo: dataTemp[0][i].aplicacionPorCodigo,
                        codigo: dataTemp[0][i].codigo,
                        usoLimitado: dataTemp[0][i].usoLimitado,
                        cantidadUsos: dataTemp[0][i].cantidadUsos,
                        cantidadUsosReal: dataTemp[0][i].cantidadUsosReal,
                        requisitos: requisitos,
                        valor: valor
                    });
                }
            }
        }

        this.caja.venta.promocionesNuevas.editarPromociones.serviciosProductosPendientes = dataTemp[3];

    }

    // ----- Promociones posibles -----
    caja_venta_promocionesNuevas_calcularPromocionesPosibles () {
        this.caja.venta.promocionesNuevas.editarPromociones.promocionesPosibles = [];

        this.caja_venta_promocionesNuevas_calcularPosiblesPromocionesCombosConCodigo();
        this.caja_venta_promocionesNuevas_calcularPosiblesPromocionesGeneralesConCodigo();
        this.caja_venta_promocionesNuevas_calcularPosiblesServiciosProductosPendientes();
        this.caja_venta_promocionesNuevas_calcularPosiblesPromocionesCombosSinCodigo();
        this.caja_venta_promocionesNuevas_calcularPosiblesPromocionesGeneralesSinCodigo();
    }

    caja_venta_promocionesNuevas_calcularPosiblesPromocionesCombosConCodigo (){

        for(var i = 0; i < this.caja.venta.promocionesNuevas.editarPromociones.promocionCombos.conCodigo.length; i++){
            var promocionCombo = this.caja.venta.promocionesNuevas.editarPromociones.promocionCombos.conCodigo[i];

            if(promocionCombo.aplicable){
                
                // Se verifica que la promoción no tenga uso limitado o si tiene que la cantidad de uso real sea menor a la configurada
                if(!promocionCombo.usoLimitado || (promocionCombo.usoLimitado && promocionCombo.cantidadUsosReal < promocionCombo.cantidadUsos)){

                    // Se crea la promoción posible ya que tiene que ir ligada con todos los servicio y productos y después se verifica que se 
                    // cumplan sus requisitos
                    var idPromocionPosible = this.caja.venta.promocionesNuevas.editarPromociones.promocionesPosibles.length + 1;

                    this.caja.venta.promocionesNuevas.editarPromociones.promocionesPosibles.push({
                        id: idPromocionPosible,
                        idPromocionSucursalNueva: promocionCombo.idPromocionSucursalNueva,
                        descripcion: promocionCombo.nombre,
                        idPromocionSucursalNuevaTipo: promocionCombo.idPromocionSucursalNuevaTipo,
                        aplicacionPorCodigo: promocionCombo.aplicacionPorCodigo
                    });

                    var requisitosCumplidosCombo = 0;
                    var valorComboOriginal = 0;

                    // Se recorren todos los requisitos para verificar que se cumplan todos y aplque la promoción
                    for(var j = 0; j < promocionCombo.requisitos.length; j++){
                        var requisito = promocionCombo.requisitos[j];

                        // Se verifica si el requisito es servicio
                        if(requisito.idServicio){

                            var servicioCantidadDisponiblePromocion = 0;

                            // Se recorren todos los servicios de la venta 
                            for(var k = 0; k < this.caja.venta.promocionesNuevas.editarPromociones.serviciosVenta.length; k++){
                                var servicioVenta = this.caja.venta.promocionesNuevas.editarPromociones.serviciosVenta[k];

                                // Se cuentan todos los servicios que estén libres para aplicar en promoción, no sean cuantas por cobrar ni vengan de paquete y que
                                // sean igual al requisito
                                if(servicioVenta.aplicableEnPromocion && servicioVenta.esVenta && !servicioVenta.noAplicablePromociones && servicioVenta.idPaqueteSucursalCliente == null){
                                    if(servicioVenta.idServicio == requisito.idServicio){
                                        servicioCantidadDisponiblePromocion++;
                                    }
                                }
                            }

                            // Se verifica que se tienen servicios para cumplir con la cantidad de servicios del requisito
                            if(servicioCantidadDisponiblePromocion >= requisito.cantidad){

                                // Si los servicios disponibles son mayor o igual a la cantidad pedida por el requisito significa que si se cumple con el requisito
                                requisitosCumplidosCombo++;

                                // Se recorren todos los servicios de la venta que van a ser del requisito
                                var servicioCantidadAplicadaRequisito = 0;

                                for(var k = 0; k < this.caja.venta.promocionesNuevas.editarPromociones.serviciosVenta.length; k++){
                                    var servicioVenta = this.caja.venta.promocionesNuevas.editarPromociones.serviciosVenta[k];

                                    if(servicioVenta.aplicableEnPromocion && servicioVenta.esVenta && !servicioVenta.noAplicablePromociones && servicioVenta.idPaqueteSucursalCliente == null){
                                        if(servicioVenta.idServicio == requisito.idServicio){

                                            // Se calcula cuanto sería la suma del costo de los servicios y productos sin aplicar la promoción de combos
                                            valorComboOriginal = valorComboOriginal + Number(servicioVenta.costoDescuento);
                                            servicioCantidadAplicadaRequisito++;

                                            if(servicioCantidadAplicadaRequisito == requisito.cantidad){
                                                k = this.caja.venta.promocionesNuevas.editarPromociones.serviciosVenta.length;
                                            }

                                        }
                                    }
                                }

                            }

                        }

                        // Se verifica si el requisito es producto
                        if(requisito.idInventarioPresentacion){
    
                            // Se recorren todos los productos de la venta
                            for(var k = 0; k < this.caja.venta.promocionesNuevas.editarPromociones.productosVenta.length; k++){
                                var productoVenta = this.caja.venta.promocionesNuevas.editarPromociones.productosVenta[k];

                                // Se verifica que el producto no sea cuenta por pagar
                                if(productoVenta.esVenta){

                                    // Se verifica que el producto de la venta sea igual al del requisito
                                    if(productoVenta.idInventarioPresentacion == requisito.idInventarioPresentacion){
                
                                        // Se verifica que haya suficiente cantidad de productos para cumplir con el requisito
                                        if(productoVenta.promocionCantidadDisponible >= requisito.cantidad){

                                            // Si cumple con el requisito se aumenta la cantidad de requisitos cumplidos
                                            requisitosCumplidosCombo++;

                                            // Se calcula cuanto sería la suma del costo de los servicios y productos sin aplicar la promoción de combos
                                            valorComboOriginal += ((Number(productoVenta.costoDescuento) / productoVenta.cantidad) * requisito.cantidad);

                                        }
                
                                    }
                                }

                            }

                        }

                    }

                    // Se verifica que los requisitos cumplidos sean igual a los requisitos pedidos por la promoción de combo
                    if(requisitosCumplidosCombo == promocionCombo.requisitos.length){

                        // Si se puede aplicar la promoción

                        // Se obtiene el valor de la promoción
                        var valorComboPromocion = Number(promocionCombo.valor[0].valor);

                        // Se checa si el valor original del combo es mayor a la promoción
                        if(valorComboOriginal > valorComboPromocion){

                            // Se resta el valor de la promoción al valor del combo original, esto es el valor que tendrá la promoción
                            var descuentoCombo = valorComboOriginal - valorComboPromocion;
                            this.caja.venta.promocionesNuevas.editarPromociones.promocionesPosibles[idPromocionPosible - 1].pago = descuentoCombo;

                        }
                        else{

                            // El valor de la promoción es 0 ya que el valor original es menor al valor de la promoción
                            this.caja.venta.promocionesNuevas.editarPromociones.promocionesPosibles[idPromocionPosible - 1].pago = 0;

                        }

                    }
                    else{

                        // No se puede aplicar la promoción porque faltaron requisitos por cumplir

                        // Se quita la promoción aplicada
                        this.caja.venta.promocionesNuevas.editarPromociones.promocionesPosibles.splice((idPromocionPosible - 1), 1);

                    }
                }

            }

        }

    }

    caja_venta_promocionesNuevas_calcularPosiblesPromocionesCombosSinCodigo (){

        for(var i = 0; i < this.caja.venta.promocionesNuevas.editarPromociones.promocionCombos.sinCodigo.length; i++){
            var promocionCombo = this.caja.venta.promocionesNuevas.editarPromociones.promocionCombos.sinCodigo[i];

            // Se verifica que la promoción no tenga uso limitado o si tiene que la cantidad de uso real sea menor a la configurada
            if(!promocionCombo.usoLimitado || (promocionCombo.usoLimitado && promocionCombo.cantidadUsosReal < promocionCombo.cantidadUsos)){

                // Se crea la promoción posible ya que tiene que ir ligada con todos los servicio y productos y después se verifica que se 
                // cumplan sus requisitos
                var idPromocionPosible = this.caja.venta.promocionesNuevas.editarPromociones.promocionesPosibles.length + 1;

                this.caja.venta.promocionesNuevas.editarPromociones.promocionesPosibles.push({
                    id: idPromocionPosible,
                    idPromocionSucursalNueva: promocionCombo.idPromocionSucursalNueva,
                    descripcion: promocionCombo.nombre,
                    idPromocionSucursalNuevaTipo: promocionCombo.idPromocionSucursalNuevaTipo,
                    aplicacionPorCodigo: promocionCombo.aplicacionPorCodigo
                });

                var requisitosCumplidosCombo = 0;
                var valorComboOriginal = 0;

                // Se recorren todos los requisitos para verificar que se cumplan todos y aplque la promoción
                for(var j = 0; j < promocionCombo.requisitos.length; j++){
                    var requisito = promocionCombo.requisitos[j];

                    // Se verifica si el requisito es servicio
                    if(requisito.idServicio){

                        var servicioCantidadDisponiblePromocion = 0;

                        // Se recorren todos los servicios de la venta 
                        for(var k = 0; k < this.caja.venta.promocionesNuevas.editarPromociones.serviciosVenta.length; k++){
                            var servicioVenta = this.caja.venta.promocionesNuevas.editarPromociones.serviciosVenta[k];

                            // Se cuentan todos los servicios que estén libres para aplicar en promoción, no sean cuantas por cobrar ni vengan de paquete y que
                            // sean igual al requisito y tampoco que sean ventas prepagadas
                            if(servicioVenta.aplicableEnPromocion && servicioVenta.esVenta && !servicioVenta.noAplicablePromociones && servicioVenta.idPaqueteSucursalCliente == null){
                                if(servicioVenta.idServicio == requisito.idServicio){
                                    servicioCantidadDisponiblePromocion++;
                                }
                            }
                        }

                        // Se verifica que se tienen servicios para cumplir con la cantidad de servicios del requisito
                        if(servicioCantidadDisponiblePromocion >= requisito.cantidad){

                            // Si los servicios disponibles son mayor o igual a la cantidad pedida por el requisito significa que si se cumple con el requisito
                            requisitosCumplidosCombo++;

                            // Se recorren todos los servicios de la venta que van a ser del requisito
                            var servicioCantidadAplicadaRequisito = 0;

                            for(var k = 0; k < this.caja.venta.promocionesNuevas.editarPromociones.serviciosVenta.length; k++){
                                var servicioVenta = this.caja.venta.promocionesNuevas.editarPromociones.serviciosVenta[k];

                                if(servicioVenta.aplicableEnPromocion && servicioVenta.esVenta && !servicioVenta.noAplicablePromociones && servicioVenta.idPaqueteSucursalCliente == null){
                                    if(servicioVenta.idServicio == requisito.idServicio){

                                        // Se calcula cuanto sería la suma del costo de los servicios y productos sin aplicar la promoción de combos
                                        valorComboOriginal = valorComboOriginal + Number(servicioVenta.costoDescuento);
                                        servicioCantidadAplicadaRequisito++;

                                        if(servicioCantidadAplicadaRequisito == requisito.cantidad){
                                            k = this.caja.venta.promocionesNuevas.editarPromociones.serviciosVenta.length;
                                        }

                                    }
                                }
                            }

                        }

                    }

                    // Se verifica si el requisito es producto
                    if(requisito.idInventarioPresentacion){
    
                        // Se recorren todos los productos de la venta
                        for(var k = 0; k < this.caja.venta.promocionesNuevas.editarPromociones.productosVenta.length; k++){
                            var productoVenta = this.caja.venta.promocionesNuevas.editarPromociones.productosVenta[k];

                            // Se verifica que el producto no sea cuenta por pagar
                            if(productoVenta.esVenta){

                                // Se verifica que el producto de la venta sea igual al del requisito
                                if(productoVenta.idInventarioPresentacion == requisito.idInventarioPresentacion){
                
                                    // Se verifica que haya suficiente cantidad de productos para cumplir con el requisito
                                    if(productoVenta.promocionCantidadDisponible >= requisito.cantidad){

                                        // Si cumple con el requisito se aumenta la cantidad de requisitos cumplidos
                                        requisitosCumplidosCombo++;

                                        // Se calcula cuanto sería la suma del costo de los servicios y productos sin aplicar la promoción de combos
                                        valorComboOriginal += ((Number(productoVenta.costoDescuento) / productoVenta.cantidad) * requisito.cantidad);

                                    }
                
                                }
                            }

                        }

                    }

                }

                // Se verifica que los requisitos cumplidos sean igual a los requisitos pedidos por la promoción de combo
                if(requisitosCumplidosCombo == promocionCombo.requisitos.length){

                    // Si se puede aplicar la promoción

                    // Se obtiene el valor de la promoción
                    var valorComboPromocion = Number(promocionCombo.valor[0].valor);

                    // Se checa si el valor original del combo es mayor a la promoción
                    if(valorComboOriginal > valorComboPromocion){

                        // Se resta el valor de la promoción al valor del combo original, esto es el valor que tendrá la promoción
                        var descuentoCombo = valorComboOriginal - valorComboPromocion;
                        this.caja.venta.promocionesNuevas.editarPromociones.promocionesPosibles[idPromocionPosible - 1].pago = descuentoCombo;

                    }
                    else{

                        // El valor de la promoción es 0 ya que el valor original es menor al valor de la promoción
                        this.caja.venta.promocionesNuevas.editarPromociones.promocionesPosibles[idPromocionPosible - 1].pago = 0;

                    }

                }
                else{

                    // No se puede aplicar la promoción porque faltaron requisitos por cumplir

                    // Se quita la promoción aplicada
                    this.caja.venta.promocionesNuevas.editarPromociones.promocionesPosibles.splice((idPromocionPosible - 1), 1);

                }
            }

        }

    }

    caja_venta_promocionesNuevas_calcularPosiblesPromocionesGeneralesConCodigo (){

        for(var i = 0; i < this.caja.venta.promocionesNuevas.editarPromociones.promocionGeneral.conCodigo.length; i++){
            var promocionGeneral = this.caja.venta.promocionesNuevas.editarPromociones.promocionGeneral.conCodigo[i];

            if(promocionGeneral.aplicable){
                // Se recorren todos los requisitos
                for(var j = 0; j < promocionGeneral.requisitos.length; j++){
                    var requisito = promocionGeneral.requisitos[j];

                    // Se verifica que el requisito sea de tipo servicio (1 o todos)
                    if(requisito.idServicio || requisito.todosServicios){

                        // Se recorren todos los servicios de la venta
                        for(var k = 0; k < this.caja.venta.promocionesNuevas.editarPromociones.serviciosVenta.length; k++){
                            var servicioVenta = this.caja.venta.promocionesNuevas.editarPromociones.serviciosVenta[k];

                            // Se verifica que el servicio esté disponible para aplicar en promoción, no sea cuenta por pagar ni sea servicio de paquete ni venta prepagada
                            if(servicioVenta.aplicableEnPromocion && servicioVenta.esVenta && !servicioVenta.noAplicablePromociones && servicioVenta.idPaqueteSucursalCliente == null){

                                // Si verifica que el requisito sean todos los servicios y si no son todos, que el servicio del requisito se encuentre en la venta
                                if(requisito.todosServicios || !requisito.todosServicios && servicioVenta.idServicio == requisito.idServicio){

                                    // Se verifica que la promoción no sea de uso limitado o si lo es que la cantidad de usos reales sea menor a la configurada
                                    if(!promocionGeneral.usoLimitado || promocionGeneral.usoLimitado && promocionGeneral.cantidadUsosReal < promocionGeneral.cantidadUsos){

                                        // Si aplica la promoción por lo cual se agrega la promoción a las promociones aplicadas 
                                        var idPromocionPosible = this.caja.venta.promocionesNuevas.editarPromociones.promocionesPosibles.length + 1;
                                        this.caja.venta.promocionesNuevas.editarPromociones.promocionesPosibles.push({
                                            id: idPromocionPosible,
                                            idPromocionSucursalNueva: promocionGeneral.idPromocionSucursalNueva,
                                            descripcion: promocionGeneral.nombre,
                                            idPromocionSucursalNuevaTipo: promocionGeneral.idPromocionSucursalNuevaTipo,
                                            aplicacionPorCodigo: promocionGeneral.aplicacionPorCodigo
                                        });

                                        // Se recorren todos los valores de las promoción
                                        for(var l = 0; l < promocionGeneral.valor.length; l++){
                                            var valor = promocionGeneral.valor[l];

                                            // Se checa si el valor es para todas los servicios o si no, que el servicio del valor sea igual al de la venta (requisito)
                                            if(valor.todosServicios || !valor.todosServicios && valor.idServicio == servicioVenta.idServicio){

                                                // Se verifica que el tipo del valor es fijo 
                                                if(valor.idPromocionSucursalNuevaAplicacionValorTipo == 1){

                                                    // Se calcula el descuento que tendrá la promoción y el servicio 
                                                    if(valor.valor > Number(servicioVenta.costoDescuento)){
                                                        var descuentoPromocionGeneral:any = Number(servicioVenta.costoDescuento);
                                                    }
                                                    else{
                                                        var descuentoPromocionGeneral:any = valor.valor;
                                                    }
                                                }

                                                // Se verifica que el tipo del valor es fijo 
                                                if(valor.idPromocionSucursalNuevaAplicacionValorTipo == 2){
                                                    // Se calcula el descuento que tendrá la promoción y el servicio 
                                                    var descuentoPromocionGeneral:any = Number(servicioVenta.costoDescuento) * (valor.valor / 100);
                                                }

                                                descuentoPromocionGeneral = Number(descuentoPromocionGeneral.toFixed(2));

                                                // El valor de la promoción es el descuento que tendrá el servicio
                                                this.caja.venta.promocionesNuevas.editarPromociones.promocionesPosibles[idPromocionPosible - 1].pago = descuentoPromocionGeneral;

                                                // Si ya se encontró el valor se deja de checar los demás ya que solo hay un valor por servicio
                                                l = promocionGeneral.valor.length;
                                        
                                            }

                                            k = this.caja.venta.promocionesNuevas.editarPromociones.serviciosVenta.length;
                                            j = promocionGeneral.requisitos.length;

                                        }

                                    }

                                }

                            }
                        }

                    }

                    // Se verifica que el requisito sea de tipo producto (1 o todos)
                    if(requisito.idInventarioPresentacion || requisito.todasPresentaciones){

                        // Se recorren todos los productos de la venta
                        for(var k = 0; k < this.caja.venta.promocionesNuevas.editarPromociones.productosVenta.length; k++){
                            var productoVenta = this.caja.venta.promocionesNuevas.editarPromociones.productosVenta[k];

                            // Se verifica que el producto no sea cuenta por pagar
                            if(productoVenta.esVenta){

                                // Se verifica que el requisito sea todas las promociones o si no lo es que el producto del requisito esté en la venta
                                if(requisito.todasPresentaciones || !requisito.todasPresentaciones && productoVenta.idInventarioPresentacion == requisito.idInventarioPresentacion){

                                    // Se verifica que tenga cantidades para aplicar en la promoción
                                    if(productoVenta.promocionCantidadDisponible > 0){

                                        // Se verifica que la promoción no sea de uso limitado o si lo es que la cantidad de usos reales sea menor a la configurada
                                        if(!promocionGeneral.usoLimitado || promocionGeneral.usoLimitado && promocionGeneral.cantidadUsosReal < promocionGeneral.cantidadUsos){

                                            // Si aplica la promoción por lo cual se agrega la promoción a las promociones aplicadas 
                                            var idPromocionPosible = this.caja.venta.promocionesNuevas.editarPromociones.promocionesPosibles.length + 1;
                                            this.caja.venta.promocionesNuevas.editarPromociones.promocionesPosibles.push({
                                                id: idPromocionPosible,
                                                idPromocionSucursalNueva: promocionGeneral.idPromocionSucursalNueva,
                                                descripcion: promocionGeneral.nombre,
                                                idPromocionSucursalNuevaTipo: promocionGeneral.idPromocionSucursalNuevaTipo,
                                                aplicacionPorCodigo: promocionGeneral.aplicacionPorCodigo
                                            });

                                            // Se recorren todos los valores de la promoción
                                            for(var l = 0; l < promocionGeneral.valor.length; l++){
                                                var valor = promocionGeneral.valor[l];

                                                // Se verifica que el valor sea para todos los productos o si no que el producto del valor sea igual al de la venta 
                                                if(valor.todasPresentaciones || !valor.todasPresentaciones && valor.idInventarioPresentacion == productoVenta.idInventarioPresentacion){

                                                    // Se verifica que el tipo del valor de la promoción es fijo
                                                    if(valor.idPromocionSucursalNuevaAplicacionValorTipo == 1){

                                                        // Se calcula el descuento que tendrá la promoción y el producto
                                                        if(valor.valor > (Number(productoVenta.costoDescuento) / productoVenta.cantidad)){
                                                            var descuentoPromocionGeneral:any = (Number(productoVenta.costoDescuento) / productoVenta.cantidad);
                                                        }
                                                        else{
                                                            var descuentoPromocionGeneral:any = valor.valor;
                                                        }

                                                    }

                                                    // Se verifica que el tipo del valor de la promoción es porcentaje
                                                    if(valor.idPromocionSucursalNuevaAplicacionValorTipo == 2){

                                                        // Se calcula el descuento que tendrá la promoción y el producto
                                                        var descuentoPromocionGeneral:any = (Number(productoVenta.costoDescuento) / productoVenta.cantidad) * (valor.valor / 100);
                                                    }

                                                    descuentoPromocionGeneral = Number(descuentoPromocionGeneral.toFixed(2));

                                                    // El valor de la promoción es el descuento que tendrá el producto
                                                    this.caja.venta.promocionesNuevas.editarPromociones.promocionesPosibles[idPromocionPosible - 1].pago = descuentoPromocionGeneral;

                                                    // Si ya se encontró el valor se deja de checar los demás ya que solo hay un valor por producto
                                                    l = promocionGeneral.valor.length;

                                                }

                                            }

                                            k = this.caja.venta.promocionesNuevas.editarPromociones.productosVenta;
                                            j = promocionGeneral.requisitos.length;
                                        }

                                    }

                                }
                            }

                        }

                    }

                }
            }
        }
    
    }

    caja_venta_promocionesNuevas_calcularPosiblesPromocionesGeneralesSinCodigo (){

        for(var i = 0; i < this.caja.venta.promocionesNuevas.editarPromociones.promocionGeneral.sinCodigo.length; i++){
            var promocionGeneral = this.caja.venta.promocionesNuevas.editarPromociones.promocionGeneral.sinCodigo[i];

            // Se recorren todos los requisitos
            for(var j = 0; j < promocionGeneral.requisitos.length; j++){
                var requisito = promocionGeneral.requisitos[j];

                // Se verifica que el requisito sea de tipo servicio (1 o todos)
                if(requisito.idServicio || requisito.todosServicios){

                    // Se recorren todos los servicios de la venta
                    for(var k = 0; k < this.caja.venta.promocionesNuevas.editarPromociones.serviciosVenta.length; k++){
                        var servicioVenta = this.caja.venta.promocionesNuevas.editarPromociones.serviciosVenta[k];

                        // Se verifica que el servicio esté disponible para aplicar en promoción, no sea cuenta por pagar ni sea servicio de paquete ni venta prepagada
                        if(servicioVenta.aplicableEnPromocion && servicioVenta.esVenta && !servicioVenta.noAplicablePromociones && servicioVenta.idPaqueteSucursalCliente == null){

                            // Si verifica que el requisito sean todos los servicios y si no son todos, que el servicio del requisito se encuentre en la venta
                            if(requisito.todosServicios || !requisito.todosServicios && servicioVenta.idServicio == requisito.idServicio){

                                // Se verifica que la promoción no sea de uso limitado o si lo es que la cantidad de usos reales sea menor a la configurada
                                if(!promocionGeneral.usoLimitado || promocionGeneral.usoLimitado && promocionGeneral.cantidadUsosReal < promocionGeneral.cantidadUsos){

                                    // Si aplica la promoción por lo cual se agrega la promoción a las promociones aplicadas 
                                    var idPromocionPosible = this.caja.venta.promocionesNuevas.editarPromociones.promocionesPosibles.length + 1;
                                    this.caja.venta.promocionesNuevas.editarPromociones.promocionesPosibles.push({
                                        id: idPromocionPosible,
                                        idPromocionSucursalNueva: promocionGeneral.idPromocionSucursalNueva,
                                        descripcion: promocionGeneral.nombre,
                                        idPromocionSucursalNuevaTipo: promocionGeneral.idPromocionSucursalNuevaTipo,
                                        aplicacionPorCodigo: promocionGeneral.aplicacionPorCodigo
                                    });

                                    // Se recorren todos los valores de las promoción
                                    for(var l = 0; l < promocionGeneral.valor.length; l++){
                                        var valor = promocionGeneral.valor[l];

                                        // Se checa si el valor es para todas los servicios o si no, que el servicio del valor sea igual al de la venta (requisito)
                                        if(valor.todosServicios || !valor.todosServicios && valor.idServicio == servicioVenta.idServicio){

                                            // Se verifica que el tipo del valor es fijo 
                                            if(valor.idPromocionSucursalNuevaAplicacionValorTipo == 1){

                                                // Se calcula el descuento que tendrá la promoción y el servicio 
                                                if(valor.valor > Number(servicioVenta.costoDescuento)){
                                                    var descuentoPromocionGeneral:any = Number(servicioVenta.costoDescuento);
                                                }
                                                else{
                                                    var descuentoPromocionGeneral:any = valor.valor;
                                                }
                                            }

                                            // Se verifica que el tipo del valor es fijo 
                                            if(valor.idPromocionSucursalNuevaAplicacionValorTipo == 2){
                                                // Se calcula el descuento que tendrá la promoción y el servicio 
                                                var descuentoPromocionGeneral:any = Number(servicioVenta.costoDescuento) * (valor.valor / 100);
                                            }

                                            descuentoPromocionGeneral = Number(descuentoPromocionGeneral.toFixed(2));

                                            // El valor de la promoción es el descuento que tendrá el servicio
                                            this.caja.venta.promocionesNuevas.editarPromociones.promocionesPosibles[idPromocionPosible - 1].pago = descuentoPromocionGeneral;

                                            // Si ya se encontró el valor se deja de checar los demás ya que solo hay un valor por servicio
                                            l = promocionGeneral.valor.length;
                                        
                                        }

                                        k = this.caja.venta.promocionesNuevas.editarPromociones.serviciosVenta.length;
                                        j = promocionGeneral.requisitos.length;

                                    }

                                }

                            }

                        }
                    }

                }

                // Se verifica que el requisito sea de tipo producto (1 o todos)
                if(requisito.idInventarioPresentacion || requisito.todasPresentaciones){

                    // Se recorren todos los productos de la venta
                    for(var k = 0; k < this.caja.venta.promocionesNuevas.editarPromociones.productosVenta.length; k++){
                        var productoVenta = this.caja.venta.promocionesNuevas.editarPromociones.productosVenta[k];

                        // Se verifica que el producto no sea cuenta por pagar
                        if(productoVenta.esVenta){

                            // Se verifica que el requisito sea todas las promociones o si no lo es que el producto del requisito esté en la venta
                            if(requisito.todasPresentaciones || !requisito.todasPresentaciones && productoVenta.idInventarioPresentacion == requisito.idInventarioPresentacion){

                                // Se verifica que tenga cantidades para aplicar en la promoción
                                if(productoVenta.promocionCantidadDisponible > 0){

                                    // Se verifica que la promoción no sea de uso limitado o si lo es que la cantidad de usos reales sea menor a la configurada
                                    if(!promocionGeneral.usoLimitado || promocionGeneral.usoLimitado && promocionGeneral.cantidadUsosReal < promocionGeneral.cantidadUsos){

                                        // Si aplica la promoción por lo cual se agrega la promoción a las promociones aplicadas 
                                        var idPromocionPosible = this.caja.venta.promocionesNuevas.editarPromociones.promocionesPosibles.length + 1;
                                        this.caja.venta.promocionesNuevas.editarPromociones.promocionesPosibles.push({
                                            id: idPromocionPosible,
                                            idPromocionSucursalNueva: promocionGeneral.idPromocionSucursalNueva,
                                            descripcion: promocionGeneral.nombre,
                                            idPromocionSucursalNuevaTipo: promocionGeneral.idPromocionSucursalNuevaTipo,
                                            aplicacionPorCodigo: promocionGeneral.aplicacionPorCodigo
                                        });

                                        // Se recorren todos los valores de la promoción
                                        for(var l = 0; l < promocionGeneral.valor.length; l++){
                                            var valor = promocionGeneral.valor[l];

                                            // Se verifica que el valor sea para todos los productos o si no que el producto del valor sea igual al de la venta 
                                            if(valor.todasPresentaciones || !valor.todasPresentaciones && valor.idInventarioPresentacion == productoVenta.idInventarioPresentacion){

                                                // Se verifica que el tipo del valor de la promoción es fijo
                                                if(valor.idPromocionSucursalNuevaAplicacionValorTipo == 1){

                                                    // Se calcula el descuento que tendrá la promoción y el producto
                                                    if(valor.valor > (Number(productoVenta.costoDescuento) / productoVenta.cantidad)){
                                                        var descuentoPromocionGeneral:any = (Number(productoVenta.costoDescuento) / productoVenta.cantidad);
                                                    }
                                                    else{
                                                        var descuentoPromocionGeneral:any = valor.valor;
                                                    }

                                                }

                                                // Se verifica que el tipo del valor de la promoción es porcentaje
                                                if(valor.idPromocionSucursalNuevaAplicacionValorTipo == 2){

                                                    // Se calcula el descuento que tendrá la promoción y el producto
                                                    var descuentoPromocionGeneral:any = (Number(productoVenta.costoDescuento) / productoVenta.cantidad) * (valor.valor / 100);
                                                }

                                                descuentoPromocionGeneral = Number(descuentoPromocionGeneral.toFixed(2));

                                                // El valor de la promoción es el descuento que tendrá el producto
                                                this.caja.venta.promocionesNuevas.editarPromociones.promocionesPosibles[idPromocionPosible - 1].pago = descuentoPromocionGeneral;

                                                // Si ya se encontró el valor se deja de checar los demás ya que solo hay un valor por producto
                                                l = promocionGeneral.valor.length;

                                            }

                                        }

                                        k = this.caja.venta.promocionesNuevas.editarPromociones.productosVenta;
                                        j = promocionGeneral.requisitos.length;
                                    }

                                }

                            }
                        }

                    }

                }

            }
        }
    
    }

    caja_venta_promocionesNuevas_calcularPosiblesServiciosProductosPendientes (){

        // Se recorren todos los servicios y productos pendientes de canje que tiene el cliente
        for(var i = 0; i < this.caja.venta.promocionesNuevas.editarPromociones.serviciosProductosPendientes.length; i++){
            var promocionCanjePendiente = this.caja.venta.promocionesNuevas.editarPromociones.serviciosProductosPendientes[i];

            // Verificar que no haya sido canjeado ya
            var canjeado = false;
            for(var j = 0; j < this.caja.venta.promocionesNuevas.editarPromociones.promocionesAplicadas.length; j++){
                var canje = this.caja.venta.promocionesNuevas.editarPromociones.promocionesAplicadas[j];

                if(canje.idPromocionSucursalNuevaAplicacionValorPendienteCliente){

                    if(canje.idPromocionSucursalNuevaAplicacionValorPendienteCliente == promocionCanjePendiente.idPromocionSucursalNuevaAplicacionValorPendienteCliente){
                        canjeado = true;
                    }

                }
            }
            
            if(!canjeado){
                // Se verifica que el canje pendiente sea un servicio
                if(promocionCanjePendiente.idServicio){

                    // Se recorren todos los servicios de la venta
                    for(var j = 0; j < this.caja.venta.promocionesNuevas.editarPromociones.serviciosVenta.length; j++){
                        var servicioVenta = this.caja.venta.promocionesNuevas.editarPromociones.serviciosVenta[j];

                        // Se verifica que el servicio de la venta esté libre para aplicar en promoción, no sea cuenta por pagar ni sea un servicio de paquete ni venta prepagada
                        if(servicioVenta.aplicableEnPromocion && servicioVenta.esVenta && !servicioVenta.noAplicablePromociones && servicioVenta.idPaqueteSucursalCliente == null){

                            // Se verifica que el canje pendiente se encuentra en la venta
                            if(servicioVenta.idServicio == promocionCanjePendiente.idServicio){

                                // Se agrega la promoción posible
                                var idPromocionPosible = this.caja.venta.promocionesNuevas.editarPromociones.promocionesPosibles.length + 1;

                                this.caja.venta.promocionesNuevas.editarPromociones.promocionesPosibles.push({
                                    id: idPromocionPosible,
                                    idPromocionSucursalNueva: promocionCanjePendiente.idPromocionSucursalNueva,
                                    descripcion: promocionCanjePendiente.nombre,
                                    idPromocionSucursalNuevaTipo: promocionCanjePendiente.idPromocionSucursalNuevaTipo,
                                    idPromocionSucursalNuevaAplicacionValorPendienteCliente: promocionCanjePendiente.idPromocionSucursalNuevaAplicacionValorPendienteCliente
                                });

                                // Se verifica el tipo de valor del canje para calcular el descuento que tendrá la promoción
                                if(promocionCanjePendiente.idPromocionSucursalNuevaAplicacionValorTipo == 1){
                                    if(promocionCanjePendiente.valor > Number(servicioVenta.costoDescuento)){
                                        var descuentoPromocionGeneral:any = Number(servicioVenta.costoDescuento);
                                    }
                                    else{
                                        var descuentoPromocionGeneral:any = promocionCanjePendiente.valor;
                                    }
                                }

                                if(promocionCanjePendiente.idPromocionSucursalNuevaAplicacionValorTipo == 2){
                                    var descuentoPromocionGeneral:any = Number(servicioVenta.costoDescuento) * (promocionCanjePendiente.valor / 100);
                                }

                                descuentoPromocionGeneral = Number(descuentoPromocionGeneral.toFixed(2));

                                // El descuento calculado es el valor de la promoción y es lo que se le descontará al servicio
                                this.caja.venta.promocionesNuevas.editarPromociones.promocionesPosibles[idPromocionPosible - 1].pago = descuentoPromocionGeneral;

                                j = this.caja.venta.promocionesNuevas.editarPromociones.serviciosVenta.length;

                            }

                        }

                    }

                }

                // Se verifica que el canje pendiente sea un producto
                if(promocionCanjePendiente.idInventarioPresentacion){

                    // Se recorren todos los productos vendidos
                    for(var j = 0; j < this.caja.venta.promocionesNuevas.editarPromociones.productosVenta.length; j++){
                        var productoVenta = this.caja.venta.promocionesNuevas.editarPromociones.productosVenta[j];

                        // Se verifica que el producto no sea una cuenta por pagar
                        if(productoVenta.esVenta){

                            // Se verifica que el producto del canje esté en la venta
                            if(productoVenta.idInventarioPresentacion == promocionCanjePendiente.idInventarioPresentacion){

                                // Se verifica si hay productos a aplicar en promoción
                                if(productoVenta.promocionCantidadDisponible > 0){

                                    // Se canjea el producto

                                    // Se agrega la promoción posible
                                    var idPromocionPosible = this.caja.venta.promocionesNuevas.editarPromociones.promocionesPosibles.length + 1;

                                    this.caja.venta.promocionesNuevas.editarPromociones.promocionesPosibles.push({
                                        id: idPromocionPosible,
                                        idPromocionSucursalNueva: promocionCanjePendiente.idPromocionSucursalNueva,
                                        descripcion: promocionCanjePendiente.nombre,
                                        idPromocionSucursalNuevaTipo: promocionCanjePendiente.idPromocionSucursalNuevaTipo,
                                        idPromocionSucursalNuevaAplicacionValorPendienteCliente: promocionCanjePendiente.idPromocionSucursalNuevaAplicacionValorPendienteCliente
                                    });

                                    // Se verifica el tipo de valor del canje para calcular el descuento que tendrá la promoción y el producto
                                    if(promocionCanjePendiente.idPromocionSucursalNuevaAplicacionValorTipo == 1){
                                        if(promocionCanjePendiente.valor > (Number(productoVenta.costoDescuento) / productoVenta.cantidad)){
                                            var descuentoPromocionGeneral:any = (Number(productoVenta.costoDescuento) / productoVenta.cantidad);
                                        }
                                        else{
                                            var descuentoPromocionGeneral:any = promocionCanjePendiente.valor;
                                        }
                                    }

                                    if(promocionCanjePendiente.idPromocionSucursalNuevaAplicacionValorTipo == 2){
                                        var descuentoPromocionGeneral:any = (Number(productoVenta.costoDescuento) / productoVenta.cantidad) * (promocionCanjePendiente.valor / 100);
                                    }

                                    descuentoPromocionGeneral = Number(descuentoPromocionGeneral.toFixed(2));

                                    // El descuento calculado es el valor de la promoción
                                    this.caja.venta.promocionesNuevas.editarPromociones.promocionesPosibles[idPromocionPosible - 1].pago = descuentoPromocionGeneral;

                                    j = this.caja.venta.promocionesNuevas.editarPromociones.productosVenta.length;
                                }

                            }

                        }

                    }

                }
            }

        }

    }

    // ----- Promociones elegidas -----
    caja_venta_promocionesNuevas_aplicarPromocionElegida (promocion:any){
        // Aplicar la promoción elegida según el tipo de promoción y si tiene código o no
        if(promocion.idPromocionSucursalNuevaTipo == 1){
            if(promocion.aplicacionPorCodigo){
                this.caja_venta_promocionesNuevas_aplicarPromocionElegidaGeneralesConCodigo(promocion);
            }
            else{
                this.caja_venta_promocionesNuevas_aplicarPromocionElegidaGeneralesSinCodigo(promocion);
            }
        }
        if(promocion.idPromocionSucursalNuevaTipo == 2){
            if(promocion.aplicacionPorCodigo){
                this.caja_venta_promocionesNuevas_aplicarPromocionElegidaCombosConCodigo(promocion);
            }
            else{
                this.caja_venta_promocionesNuevas_aplicarPromocionElegidaCombosSinCodigo(promocion);
            }
        }
        if(promocion.idPromocionSucursalNuevaTipo == 3){
            this.caja_venta_promocionesNuevas_aplicarServiciosProductosPendientesElegidos(promocion);
        }

        // Calcular las nuevas promociones posibles una vez aplicada la promoción elegida
        this.caja_venta_promocionesNuevas_calcularPromocionesPosibles();
    }

    caja_venta_promocionesNuevas_aplicarPromocionElegidaCombosConCodigo (promocion:any){

        for(var i = 0; i < this.caja.venta.promocionesNuevas.editarPromociones.promocionCombos.conCodigo.length; i++){
            var promocionCombo = this.caja.venta.promocionesNuevas.editarPromociones.promocionCombos.conCodigo[i];

            // Se verifica que sea la promoción que se eligió
            if(promocionCombo.idPromocionSucursalNueva == promocion.idPromocionSucursalNueva){

                // Se crea la promoción aplicada ya que tiene que ir ligada con todos los servicio y productos y después se verifica que se 
                // cumplan sus requisitos
                var idPromocionAplicada = this.caja.venta.promocionesNuevas.editarPromociones.promocionesAplicadas.length + 1;

                this.caja.venta.promocionesNuevas.editarPromociones.promocionesAplicadas.push({
                    id: idPromocionAplicada,
                    idPromocionSucursalNueva: promocionCombo.idPromocionSucursalNueva,
                    descripcion: promocionCombo.nombre
                });

                promocionCombo.cantidadUsosReal++;

                var requisitosCumplidosCombo = 0;
                var valorComboOriginal = 0;

                // Se recorren todos los requisitos para bloquear los servicios y productos que se utilicen en la promoción y calcular el costo original que tendría
                // el combo sin la promoción
                for(var j = 0; j < promocionCombo.requisitos.length; j++){
                    var requisito = promocionCombo.requisitos[j];

                    // Se verifica si el requisito es servicio
                    if(requisito.idServicio){

                        var servicioCantidadAplicadaRequisito = 0;

                        for(var k = 0; k < this.caja.venta.promocionesNuevas.editarPromociones.serviciosVenta.length; k++){
                            var servicioVenta = this.caja.venta.promocionesNuevas.editarPromociones.serviciosVenta[k];

                            if(servicioVenta.aplicableEnPromocion && servicioVenta.esVenta && !servicioVenta.noAplicablePromociones && servicioVenta.idPaqueteSucursalCliente == null){
                                if(servicioVenta.idServicio == requisito.idServicio){

                                    // Se bloquea el servicio y se liga con la promoción en la que aplicó
                                    servicioVenta.aplicableEnPromocion = false;
                                    servicioVenta.promociones.push({
                                        idPromocionAplicada: idPromocionAplicada
                                    });

                                    // Se calcula cuanto sería la suma del costo de los servicios sin aplicar la promoción de combos
                                    valorComboOriginal = valorComboOriginal + Number(servicioVenta.costoDescuento);
                                    servicioCantidadAplicadaRequisito++;

                                    // Una vez que ya bloqueo solo los servicios necesarios para cumplir con el requisito, ya no recorre los demás servicios
                                    if(servicioCantidadAplicadaRequisito == requisito.cantidad){
                                        k = this.caja.venta.promocionesNuevas.editarPromociones.serviciosVenta.length;
                                    }

                                }
                            }
                        }

                    }

                    // Se verifica si el requisito es producto
                    if(requisito.idInventarioPresentacion){
    
                        // Se recorren todos los productos de la venta
                        for(var k = 0; k < this.caja.venta.promocionesNuevas.editarPromociones.productosVenta.length; k++){
                            var productoVenta = this.caja.venta.promocionesNuevas.editarPromociones.productosVenta[k];

                            // Se verifica que el producto no sea cuenta por pagar
                            if(productoVenta.esVenta){

                                // Se verifica que el producto de la venta sea igual al del requisito
                                if(productoVenta.idInventarioPresentacion == requisito.idInventarioPresentacion){
                
                                    // No se verifica si tiene el producto cantidad disponible ya que al ser uno solo debe estar disponible
                                    // para que se haya podido elegir
                                    requisitosCumplidosCombo++;

                                    // Se resta a la cantidad del producto la cantidad usada en el requisito
                                    productoVenta.promocionCantidadDisponible -= requisito.cantidad;

                                    // El producto de la venta se liga con la promoción en la que aplico y la cantidad que se aplico en esa promoción
                                    productoVenta.promociones.push({
                                        idPromocionAplicada: idPromocionAplicada,
                                        cantidadProductos: requisito.cantidad
                                    });

                                    // Se calcula cuanto sería la suma del costo de los productos sin aplicar la promoción de combos
                                    valorComboOriginal += ((Number(productoVenta.costoDescuento) / productoVenta.cantidad) * requisito.cantidad);
                                }
                            }

                        }

                    }

                }

                // Después de bloquear los productos y servicios y calcular el costo orignal del combo, se procede a calcular el
                // descuento que tendrá la promoción y el descuento que se le quitará al servicio y producto

                // Se obtiene el valor de la promoción
                var valorComboPromocion = Number(promocionCombo.valor[0].valor);

                // Se checa si el valor original del combo es mayor a la promoción
                if(valorComboOriginal > valorComboPromocion){

                    // Se resta el valor de la promoción al valor del combo original, esto es el valor que tendrá la promoción
                    // y es lo que se le va a descontar a todos los servicios y productos de la venta que aplicaron en la promoción

                    var descuentoCombo = valorComboOriginal - valorComboPromocion;

                    this.caja.venta.promocionesNuevas.editarPromociones.promocionesAplicadas[idPromocionAplicada - 1].pago = descuentoCombo;

                    // Se calcula el porcentaje que se le descontó al valor del combo original
                    var porcentajePromocionDescuento = ((descuentoCombo * 100) / valorComboOriginal);

                    // Se recorren los servicios de la venta
                    for(var k = 0; k < this.caja.venta.promocionesNuevas.editarPromociones.serviciosVenta.length; k++){
                        var servicioVenta = this.caja.venta.promocionesNuevas.editarPromociones.serviciosVenta[k];

                        // Se recorren las promociones en las que aplico el servicio (solo es 1 pero se hizo igual que la estructura de productos)
                        for(var l = 0; l < servicioVenta.promociones.length; l++){
                            var promocion = servicioVenta.promociones[l];

                            // Se calcula el descuento que tendrá el servicio en base al porcentaje que se le descontó del precio original
                            if(promocion.idPromocionAplicada == idPromocionAplicada){
                                promocion.descuento = Number((Number(servicioVenta.costoDescuento) * (porcentajePromocionDescuento / 100)).toFixed(2));
                            }
                        }
                    }

                    // Se recorren los productos de la venta
                    for(var k = 0; k < this.caja.venta.promocionesNuevas.editarPromociones.productosVenta.length; k++){
                        var productoVenta = this.caja.venta.promocionesNuevas.editarPromociones.productosVenta[k];

                        // Se recorren las promociones en las que aplico el producto
                        for(var l = 0; l < productoVenta.promociones.length; l++){
                            var promocion = productoVenta.promociones[l];

                            // Se calcula el descuento que tendrá el producto en base al porcentaje que se le descontó del precio original
                            if(promocion.idPromocionAplicada == idPromocionAplicada){
                                promocion.descuento = Number((((Number(productoVenta.costoDescuento) / productoVenta.cantidad ) * promocion.cantidadProductos) * (porcentajePromocionDescuento / 100)).toFixed(2));
                            }
                        }
                    }

                }
                else{

                    // El valor de la promoción es 0 ya que el valor original es menor al valor de la promoción
                    this.caja.venta.promocionesNuevas.editarPromociones.promocionesAplicadas[idPromocionAplicada - 1].pago = 0;

                    // El descuento que tendrán los servicios y productos serán de 0
                    for(var k = 0; k < this.caja.venta.promocionesNuevas.editarPromociones.serviciosVenta.length; k++){
                        var servicioVenta = this.caja.venta.promocionesNuevas.editarPromociones.serviciosVenta[k];

                        for(var l = 0; l < servicioVenta.promociones.length; l++){
                            var promocion = servicioVenta.promociones[l];

                            if(promocion.idPromocionAplicada == idPromocionAplicada){
                                promocion.descuento = 0;
                            }
                        }
                    }

                    for(var k = 0; k < this.caja.venta.promocionesNuevas.editarPromociones.productosVenta.length; k++){
                        var productoVenta = this.caja.venta.promocionesNuevas.editarPromociones.productosVenta[k];

                        for(var l = 0; l < productoVenta.promociones.length; l++){
                            var promocion = productoVenta.promociones[l];

                            if(promocion.idPromocionAplicada == idPromocionAplicada){
                                promocion.descuento = 0;
                            }
                        }
                    }

                }
            
            }

        }

    }

    caja_venta_promocionesNuevas_aplicarPromocionElegidaCombosSinCodigo (promocion:any){

        for(var i = 0; i < this.caja.venta.promocionesNuevas.editarPromociones.promocionCombos.sinCodigo.length; i++){
            var promocionCombo = this.caja.venta.promocionesNuevas.editarPromociones.promocionCombos.sinCodigo[i];

            // Se verifica que sea la promoción que se eligió
            if(promocionCombo.idPromocionSucursalNueva == promocion.idPromocionSucursalNueva){

                // Se crea la promoción aplicada ya que tiene que ir ligada con todos los servicio y productos y después se verifica que se 
                // cumplan sus requisitos
                var idPromocionAplicada = this.caja.venta.promocionesNuevas.editarPromociones.promocionesAplicadas.length + 1;

                this.caja.venta.promocionesNuevas.editarPromociones.promocionesAplicadas.push({
                    id: idPromocionAplicada,
                    idPromocionSucursalNueva: promocionCombo.idPromocionSucursalNueva,
                    descripcion: promocionCombo.nombre
                });

                promocionCombo.cantidadUsosReal++;

                var requisitosCumplidosCombo = 0;
                var valorComboOriginal = 0;

                // Se recorren todos los requisitos para bloquear los servicios y productos que se utilicen en la promoción y calcular el costo original que tendría
                // el combo sin la promoción
                for(var j = 0; j < promocionCombo.requisitos.length; j++){
                    var requisito = promocionCombo.requisitos[j];

                    // Se verifica si el requisito es servicio
                    if(requisito.idServicio){

                        var servicioCantidadAplicadaRequisito = 0;

                        for(var k = 0; k < this.caja.venta.promocionesNuevas.editarPromociones.serviciosVenta.length; k++){
                            var servicioVenta = this.caja.venta.promocionesNuevas.editarPromociones.serviciosVenta[k];

                            if(servicioVenta.aplicableEnPromocion && servicioVenta.esVenta && !servicioVenta.noAplicablePromociones && servicioVenta.idPaqueteSucursalCliente == null){
                                if(servicioVenta.idServicio == requisito.idServicio){

                                    // Se bloquea el servicio y se liga con la promoción en la que aplicó
                                    servicioVenta.aplicableEnPromocion = false;
                                    servicioVenta.promociones.push({
                                        idPromocionAplicada: idPromocionAplicada
                                    });

                                    // Se calcula cuanto sería la suma del costo de los servicios sin aplicar la promoción de combos
                                    valorComboOriginal = valorComboOriginal + Number(servicioVenta.costoDescuento);
                                    servicioCantidadAplicadaRequisito++;

                                    // Una vez que ya bloqueo solo los servicios necesarios para cumplir con el requisito, ya no recorre los demás servicios
                                    if(servicioCantidadAplicadaRequisito == requisito.cantidad){
                                        k = this.caja.venta.promocionesNuevas.editarPromociones.serviciosVenta.length;
                                    }

                                }
                            }
                        }

                    }

                    // Se verifica si el requisito es producto
                    if(requisito.idInventarioPresentacion){
    
                        // Se recorren todos los productos de la venta
                        for(var k = 0; k < this.caja.venta.promocionesNuevas.editarPromociones.productosVenta.length; k++){
                            var productoVenta = this.caja.venta.promocionesNuevas.editarPromociones.productosVenta[k];

                            // Se verifica que el producto no sea cuenta por pagar
                            if(productoVenta.esVenta){

                                // Se verifica que el producto de la venta sea igual al del requisito
                                if(productoVenta.idInventarioPresentacion == requisito.idInventarioPresentacion){
                
                                    // No se verifica si tiene el producto cantidad disponible ya que al ser uno solo debe estar disponible
                                    // para que se haya podido elegir
                                    requisitosCumplidosCombo++;

                                    // Se resta a la cantidad del producto la cantidad usada en el requisito
                                    productoVenta.promocionCantidadDisponible -= requisito.cantidad;

                                    // El producto de la venta se liga con la promoción en la que aplico y la cantidad que se aplico en esa promoción
                                    productoVenta.promociones.push({
                                        idPromocionAplicada: idPromocionAplicada,
                                        cantidadProductos: requisito.cantidad
                                    });

                                    // Se calcula cuanto sería la suma del costo de los productos sin aplicar la promoción de combos
                                    valorComboOriginal += ((Number(productoVenta.costoDescuento) / productoVenta.cantidad) * requisito.cantidad);
                                }
                            }

                        }

                    }

                }

                // Después de bloquear los productos y servicios y calcular el costo orignal del combo, se procede a calcular el
                // descuento que tendrá la promoción y el descuento que se le quitará al servicio y producto

                // Se obtiene el valor de la promoción
                var valorComboPromocion = Number(promocionCombo.valor[0].valor);

                // Se checa si el valor original del combo es mayor a la promoción
                if(valorComboOriginal > valorComboPromocion){

                    // Se resta el valor de la promoción al valor del combo original, esto es el valor que tendrá la promoción
                    // y es lo que se le va a descontar a todos los servicios y productos de la venta que aplicaron en la promoción

                    var descuentoCombo = valorComboOriginal - valorComboPromocion;

                    this.caja.venta.promocionesNuevas.editarPromociones.promocionesAplicadas[idPromocionAplicada - 1].pago = descuentoCombo;

                    // Se calcula el porcentaje que se le descontó al valor del combo original
                    var porcentajePromocionDescuento = ((descuentoCombo * 100) / valorComboOriginal);

                    // Se recorren los servicios de la venta
                    for(var k = 0; k < this.caja.venta.promocionesNuevas.editarPromociones.serviciosVenta.length; k++){
                        var servicioVenta = this.caja.venta.promocionesNuevas.editarPromociones.serviciosVenta[k];

                        // Se recorren las promociones en las que aplico el servicio (solo es 1 pero se hizo igual que la estructura de productos)
                        for(var l = 0; l < servicioVenta.promociones.length; l++){
                            var promocion = servicioVenta.promociones[l];

                            // Se calcula el descuento que tendrá el servicio en base al porcentaje que se le descontó del precio original
                            if(promocion.idPromocionAplicada == idPromocionAplicada){
                                promocion.descuento = Number((Number(servicioVenta.costoDescuento) * (porcentajePromocionDescuento / 100)).toFixed(2));
                            }
                        }
                    }

                    // Se recorren los productos de la venta
                    for(var k = 0; k < this.caja.venta.promocionesNuevas.editarPromociones.productosVenta.length; k++){
                        var productoVenta = this.caja.venta.promocionesNuevas.editarPromociones.productosVenta[k];

                        // Se recorren las promociones en las que aplico el producto
                        for(var l = 0; l < productoVenta.promociones.length; l++){
                            var promocion = productoVenta.promociones[l];

                            // Se calcula el descuento que tendrá el producto en base al porcentaje que se le descontó del precio original
                            if(promocion.idPromocionAplicada == idPromocionAplicada){
                                promocion.descuento = Number((((Number(productoVenta.costoDescuento) / productoVenta.cantidad ) * promocion.cantidadProductos) * (porcentajePromocionDescuento / 100)).toFixed(2));
                            }
                        }
                    }

                }
                else{

                    // El valor de la promoción es 0 ya que el valor original es menor al valor de la promoción
                    this.caja.venta.promocionesNuevas.editarPromociones.promocionesAplicadas[idPromocionAplicada - 1].pago = 0;

                    // El descuento que tendrán los servicios y productos serán de 0
                    for(var k = 0; k < this.caja.venta.promocionesNuevas.editarPromociones.serviciosVenta.length; k++){
                        var servicioVenta = this.caja.venta.promocionesNuevas.editarPromociones.serviciosVenta[k];

                        for(var l = 0; l < servicioVenta.promociones.length; l++){
                            var promocion = servicioVenta.promociones[l];

                            if(promocion.idPromocionAplicada == idPromocionAplicada){
                                promocion.descuento = 0;
                            }
                        }
                    }

                    for(var k = 0; k < this.caja.venta.promocionesNuevas.editarPromociones.productosVenta.length; k++){
                        var productoVenta = this.caja.venta.promocionesNuevas.editarPromociones.productosVenta[k];

                        for(var l = 0; l < productoVenta.promociones.length; l++){
                            var promocion = productoVenta.promociones[l];

                            if(promocion.idPromocionAplicada == idPromocionAplicada){
                                promocion.descuento = 0;
                            }
                        }
                    }

                }
            
            }

        }

    }

    caja_venta_promocionesNuevas_aplicarPromocionElegidaGeneralesConCodigo (promocion:any){

        for(var i = 0; i < this.caja.venta.promocionesNuevas.editarPromociones.promocionGeneral.conCodigo.length; i++){
            var promocionGeneral = this.caja.venta.promocionesNuevas.editarPromociones.promocionGeneral.conCodigo[i];

            // Se verifica que sea la promoción que se eligió
            if(promocionGeneral.idPromocionSucursalNueva == promocion.idPromocionSucursalNueva){

                // Se recorren todos los requisitos
                for(var j = 0; j < promocionGeneral.requisitos.length; j++){
                    var requisito = promocionGeneral.requisitos[j];

                    // Se verifica que el requisito sea de tipo servicio (1 o todos)
                    if(requisito.idServicio || requisito.todosServicios){

                        // Se recorren todos los servicios de la venta
                        for(var k = 0; k < this.caja.venta.promocionesNuevas.editarPromociones.serviciosVenta.length; k++){
                            var servicioVenta = this.caja.venta.promocionesNuevas.editarPromociones.serviciosVenta[k];

                            // Se verifica que el servicio esté disponible para aplicar en promoción, no sea cuenta por pagar ni sea servicio de paquete ni venta prepagada
                            if(servicioVenta.aplicableEnPromocion && servicioVenta.esVenta && !servicioVenta.noAplicablePromociones && servicioVenta.idPaqueteSucursalCliente == null){

                                // Si verifica que el requisito sean todos los servicios y si no son todos, que el servicio del requisito se encuentre en la venta
                                if(requisito.todosServicios || !requisito.todosServicios && servicioVenta.idServicio == requisito.idServicio){

                                    // Si aplica la promoción por lo cual se agrega la promoción a las promociones aplicadas 
                                    var idPromocionAplicada = this.caja.venta.promocionesNuevas.editarPromociones.promocionesAplicadas.length + 1;
                                    this.caja.venta.promocionesNuevas.editarPromociones.promocionesAplicadas.push({
                                        id: idPromocionAplicada,
                                        idPromocionSucursalNueva: promocionGeneral.idPromocionSucursalNueva,
                                        descripcion: promocionGeneral.nombre
                                    });

                                    // Se registra el uso de la promoción y se bloquea el servicio para que no aplique en otra promoción
                                    promocionGeneral.cantidadUsosReal++;
                                    servicioVenta.aplicableEnPromocion = false;

                                    // Se recorren todos los valores de las promoción
                                    for(var l = 0; l < promocionGeneral.valor.length; l++){
                                        var valor = promocionGeneral.valor[l];

                                        // Se checa si el valor es para todas los servicios o si no, que el servicio del valor sea igual al de la venta (requisito)
                                        if(valor.todosServicios || !valor.todosServicios && valor.idServicio == servicioVenta.idServicio){

                                            // Se verifica que el tipo del valor es fijo 
                                            if(valor.idPromocionSucursalNuevaAplicacionValorTipo == 1){

                                                // Se calcula el descuento que tendrá la promoción y el servicio 
                                                if(valor.valor > Number(servicioVenta.costoDescuento)){
                                                    var descuentoPromocionGeneral:any = Number(servicioVenta.costoDescuento);
                                                }
                                                else{
                                                    var descuentoPromocionGeneral:any = valor.valor;
                                                }
                                            }

                                            // Se verifica que el tipo del valor es fijo 
                                            if(valor.idPromocionSucursalNuevaAplicacionValorTipo == 2){
                                                // Se calcula el descuento que tendrá la promoción y el servicio 
                                                var descuentoPromocionGeneral:any = Number(servicioVenta.costoDescuento) * (valor.valor / 100);
                                            }

                                            descuentoPromocionGeneral = Number(descuentoPromocionGeneral.toFixed(2));

                                            // El valor de la promoción es el descuento que tendrá el servicio
                                            this.caja.venta.promocionesNuevas.editarPromociones.promocionesAplicadas[idPromocionAplicada - 1].pago = descuentoPromocionGeneral;

                                            // Se liga el servicio con la promoción en la que aplicó
                                            servicioVenta.promociones.push({
                                                idPromocionAplicada: idPromocionAplicada,
                                                descuento: descuentoPromocionGeneral
                                            });

                                            // Si ya se encontró el valor se deja de checar los demás ya que solo hay un valor por servicio
                                            l = promocionGeneral.valor.length;

                                        }

                                    }

                                    k = this.caja.venta.promocionesNuevas.editarPromociones.serviciosVenta.length;
                                    j = promocionGeneral.requisitos.length;

                                }

                            }
                        }

                    }

                    // Se verifica que el requisito sea de tipo producto (1 o todos)
                    if(requisito.idInventarioPresentacion || requisito.todasPresentaciones){

                        // Se recorren todos los productos de la venta
                        for(var k = 0; k < this.caja.venta.promocionesNuevas.editarPromociones.productosVenta.length; k++){
                            var productoVenta = this.caja.venta.promocionesNuevas.editarPromociones.productosVenta[k];

                            // Se verifica que el producto no sea cuenta por pagar
                            if(productoVenta.esVenta){

                                // Se verifica que el requisito sea todas las promociones o si no lo es que el producto del requisito esté en la venta
                                if(requisito.todasPresentaciones || !requisito.todasPresentaciones && productoVenta.idInventarioPresentacion == requisito.idInventarioPresentacion){

                                    // Se verifica que el producto tenga más de 1 cantidad para aplicar en la promoción
                                    if(productoVenta.promocionCantidadDisponible > 0){

                                        // Si aplica la promoción por lo cual se agrega la promoción a las promociones aplicadas 
                                        var idPromocionAplicada = this.caja.venta.promocionesNuevas.editarPromociones.promocionesAplicadas.length + 1;
                                        this.caja.venta.promocionesNuevas.editarPromociones.promocionesAplicadas.push({
                                            id: idPromocionAplicada,
                                            idPromocionSucursalNueva: promocionGeneral.idPromocionSucursalNueva,
                                            descripcion: promocionGeneral.nombre
                                        });

                                        // Se registra el uso de la promoción
                                        promocionGeneral.cantidadUsosReal++;

                                        // Se resta el uso del producto por la promoción de la cantidad de productos disponibles para aplicar en promoción
                                        productoVenta.promocionCantidadDisponible--;

                                        // Se recorren todos los valores de la promoción
                                        for(var l = 0; l < promocionGeneral.valor.length; l++){
                                            var valor = promocionGeneral.valor[l];

                                            // Se verifica que el valor sea para todos los productos o si no que el producto del valor sea igual al de la venta 
                                            if(valor.todasPresentaciones || !valor.todasPresentaciones && valor.idInventarioPresentacion == productoVenta.idInventarioPresentacion){

                                                // Se verifica que el tipo del valor de la promoción es fijo
                                                if(valor.idPromocionSucursalNuevaAplicacionValorTipo == 1){

                                                    // Se calcula el descuento que tendrá la promoción y el producto
                                                    if(valor.valor > (Number(productoVenta.costoDescuento) / productoVenta.cantidad)){
                                                        var descuentoPromocionGeneral:any = (Number(productoVenta.costoDescuento) / productoVenta.cantidad);
                                                    }
                                                    else{
                                                        var descuentoPromocionGeneral:any = valor.valor;
                                                    }

                                                }

                                                // Se verifica que el tipo del valor de la promoción es porcentaje
                                                if(valor.idPromocionSucursalNuevaAplicacionValorTipo == 2){

                                                    // Se calcula el descuento que tendrá la promoción y el producto
                                                    var descuentoPromocionGeneral:any = (Number(productoVenta.costoDescuento) / productoVenta.cantidad) * (valor.valor / 100);
                                                }

                                                descuentoPromocionGeneral = Number(descuentoPromocionGeneral.toFixed(2));

                                                // El valor de la promoción es el descuento que tendrá el producto
                                                this.caja.venta.promocionesNuevas.editarPromociones.promocionesAplicadas[idPromocionAplicada - 1].pago = descuentoPromocionGeneral;

                                                // Se liga el producto con la promoción en la que aplicó y se agrega también la cantidad que se utilizó
                                                this.caja.venta.promocionesNuevas.editarPromociones.productosVenta[k].promociones.push({
                                                    idPromocionAplicada: idPromocionAplicada,
                                                    cantidadProductos: 1,
                                                    descuento: descuentoPromocionGeneral
                                                });

                                                // Si ya se encontró el valor se deja de checar los demás ya que solo hay un valor por producto
                                                l = promocionGeneral.valor.length;

                                            }

                                        }

                                        k = this.caja.venta.promocionesNuevas.editarPromociones.productosVenta.length;
                                        j = promocionGeneral.requisitos.length;

                                    }

                                }
                            }

                        }

                    }

                }
            }
        }

    }

    caja_venta_promocionesNuevas_aplicarPromocionElegidaGeneralesSinCodigo (promocion:any){

        for(var i = 0; i < this.caja.venta.promocionesNuevas.editarPromociones.promocionGeneral.sinCodigo.length; i++){
            var promocionGeneral = this.caja.venta.promocionesNuevas.editarPromociones.promocionGeneral.sinCodigo[i];

            // Se verifica que sea la promoción que se eligió
            if(promocionGeneral.idPromocionSucursalNueva == promocion.idPromocionSucursalNueva){

                // Se recorren todos los requisitos
                for(var j = 0; j < promocionGeneral.requisitos.length; j++){
                    var requisito = promocionGeneral.requisitos[j];

                    // Se verifica que el requisito sea de tipo servicio (1 o todos)
                    if(requisito.idServicio || requisito.todosServicios){

                        // Se recorren todos los servicios de la venta
                        for(var k = 0; k < this.caja.venta.promocionesNuevas.editarPromociones.serviciosVenta.length; k++){
                            var servicioVenta = this.caja.venta.promocionesNuevas.editarPromociones.serviciosVenta[k];

                            // Se verifica que el servicio esté disponible para aplicar en promoción, no sea cuenta por pagar ni sea servicio de paquete ni venta prepagada
                            if(servicioVenta.aplicableEnPromocion && servicioVenta.esVenta && !servicioVenta.noAplicablePromociones && servicioVenta.idPaqueteSucursalCliente == null){

                                // Si verifica que el requisito sean todos los servicios y si no son todos, que el servicio del requisito se encuentre en la venta
                                if(requisito.todosServicios || !requisito.todosServicios && servicioVenta.idServicio == requisito.idServicio){

                                    // Si aplica la promoción por lo cual se agrega la promoción a las promociones aplicadas 
                                    var idPromocionAplicada = this.caja.venta.promocionesNuevas.editarPromociones.promocionesAplicadas.length + 1;
                                    this.caja.venta.promocionesNuevas.editarPromociones.promocionesAplicadas.push({
                                        id: idPromocionAplicada,
                                        idPromocionSucursalNueva: promocionGeneral.idPromocionSucursalNueva,
                                        descripcion: promocionGeneral.nombre
                                    });

                                    // Se registra el uso de la promoción y se bloquea el servicio para que no aplique en otra promoción
                                    promocionGeneral.cantidadUsosReal++;
                                    servicioVenta.aplicableEnPromocion = false;

                                    // Se recorren todos los valores de las promoción
                                    for(var l = 0; l < promocionGeneral.valor.length; l++){
                                        var valor = promocionGeneral.valor[l];

                                        // Se checa si el valor es para todas los servicios o si no, que el servicio del valor sea igual al de la venta (requisito)
                                        if(valor.todosServicios || !valor.todosServicios && valor.idServicio == servicioVenta.idServicio){

                                            // Se verifica que el tipo del valor es fijo 
                                            if(valor.idPromocionSucursalNuevaAplicacionValorTipo == 1){

                                                // Se calcula el descuento que tendrá la promoción y el servicio 
                                                if(valor.valor > Number(servicioVenta.costoDescuento)){
                                                    var descuentoPromocionGeneral:any = Number(servicioVenta.costoDescuento);
                                                }
                                                else{
                                                    var descuentoPromocionGeneral:any = valor.valor;
                                                }
                                            }

                                            // Se verifica que el tipo del valor es fijo 
                                            if(valor.idPromocionSucursalNuevaAplicacionValorTipo == 2){
                                                // Se calcula el descuento que tendrá la promoción y el servicio 
                                                var descuentoPromocionGeneral:any = Number(servicioVenta.costoDescuento) * (valor.valor / 100);
                                            }

                                            descuentoPromocionGeneral = Number(descuentoPromocionGeneral.toFixed(2));

                                            // El valor de la promoción es el descuento que tendrá el servicio
                                            this.caja.venta.promocionesNuevas.editarPromociones.promocionesAplicadas[idPromocionAplicada - 1].pago = descuentoPromocionGeneral;

                                            // Se liga el servicio con la promoción en la que aplicó
                                            servicioVenta.promociones.push({
                                                idPromocionAplicada: idPromocionAplicada,
                                                descuento: descuentoPromocionGeneral
                                            });

                                            // Si ya se encontró el valor se deja de checar los demás ya que solo hay un valor por servicio
                                            l = promocionGeneral.valor.length;

                                        }

                                    }

                                    k = this.caja.venta.promocionesNuevas.editarPromociones.serviciosVenta.length;
                                    j = promocionGeneral.requisitos.length;

                                }

                            }
                        }

                    }

                    // Se verifica que el requisito sea de tipo producto (1 o todos)
                    if(requisito.idInventarioPresentacion || requisito.todasPresentaciones){

                        // Se recorren todos los productos de la venta
                        for(var k = 0; k < this.caja.venta.promocionesNuevas.editarPromociones.productosVenta.length; k++){
                            var productoVenta = this.caja.venta.promocionesNuevas.editarPromociones.productosVenta[k];

                            // Se verifica que el producto no sea cuenta por pagar
                            if(productoVenta.esVenta){

                                // Se verifica que el requisito sea todas las promociones o si no lo es que el producto del requisito esté en la venta
                                if(requisito.todasPresentaciones || !requisito.todasPresentaciones && productoVenta.idInventarioPresentacion == requisito.idInventarioPresentacion){

                                    // Se verifica que el producto tenga más de 1 cantidad para aplicar en la promoción
                                    if(productoVenta.promocionCantidadDisponible > 0){

                                        // Si aplica la promoción por lo cual se agrega la promoción a las promociones aplicadas 
                                        var idPromocionAplicada = this.caja.venta.promocionesNuevas.editarPromociones.promocionesAplicadas.length + 1;
                                        this.caja.venta.promocionesNuevas.editarPromociones.promocionesAplicadas.push({
                                            id: idPromocionAplicada,
                                            idPromocionSucursalNueva: promocionGeneral.idPromocionSucursalNueva,
                                            descripcion: promocionGeneral.nombre
                                        });

                                        // Se registra el uso de la promoción
                                        promocionGeneral.cantidadUsosReal++;

                                        // Se resta el uso del producto por la promoción de la cantidad de productos disponibles para aplicar en promoción
                                        productoVenta.promocionCantidadDisponible--;

                                        // Se recorren todos los valores de la promoción
                                        for(var l = 0; l < promocionGeneral.valor.length; l++){
                                            var valor = promocionGeneral.valor[l];

                                            // Se verifica que el valor sea para todos los productos o si no que el producto del valor sea igual al de la venta 
                                            if(valor.todasPresentaciones || !valor.todasPresentaciones && valor.idInventarioPresentacion == productoVenta.idInventarioPresentacion){

                                                // Se verifica que el tipo del valor de la promoción es fijo
                                                if(valor.idPromocionSucursalNuevaAplicacionValorTipo == 1){

                                                    // Se calcula el descuento que tendrá la promoción y el producto
                                                    if(valor.valor > (Number(productoVenta.costoDescuento) / productoVenta.cantidad)){
                                                        var descuentoPromocionGeneral:any = (Number(productoVenta.costoDescuento) / productoVenta.cantidad);
                                                    }
                                                    else{
                                                        var descuentoPromocionGeneral:any = valor.valor;
                                                    }

                                                }

                                                // Se verifica que el tipo del valor de la promoción es porcentaje
                                                if(valor.idPromocionSucursalNuevaAplicacionValorTipo == 2){

                                                    // Se calcula el descuento que tendrá la promoción y el producto
                                                    var descuentoPromocionGeneral:any = (Number(productoVenta.costoDescuento) / productoVenta.cantidad) * (valor.valor / 100);
                                                }

                                                descuentoPromocionGeneral = Number(descuentoPromocionGeneral.toFixed(2));

                                                // El valor de la promoción es el descuento que tendrá el producto
                                                this.caja.venta.promocionesNuevas.editarPromociones.promocionesAplicadas[idPromocionAplicada - 1].pago = descuentoPromocionGeneral;

                                                // Se liga el producto con la promoción en la que aplicó y se agrega también la cantidad que se utilizó
                                                this.caja.venta.promocionesNuevas.editarPromociones.productosVenta[k].promociones.push({
                                                    idPromocionAplicada: idPromocionAplicada,
                                                    cantidadProductos: 1,
                                                    descuento: descuentoPromocionGeneral
                                                });

                                                // Si ya se encontró el valor se deja de checar los demás ya que solo hay un valor por producto
                                                l = promocionGeneral.valor.length;

                                            }

                                        }

                                        k = this.caja.venta.promocionesNuevas.editarPromociones.productosVenta.length;
                                        j = promocionGeneral.requisitos.length;

                                    }

                                }
                            }

                        }

                    }

                }
            }
        }

    }

    caja_venta_promocionesNuevas_aplicarServiciosProductosPendientesElegidos (promocion:any){

        // Se recorren todos los servicios y productos pendientes de canje que tiene el cliente
        for(var i = 0; i < this.caja.venta.promocionesNuevas.editarPromociones.serviciosProductosPendientes.length; i++){
            var promocionCanjePendiente = this.caja.venta.promocionesNuevas.editarPromociones.serviciosProductosPendientes[i];

            if(promocionCanjePendiente.idPromocionSucursalNuevaAplicacionValorPendienteCliente == promocion.idPromocionSucursalNuevaAplicacionValorPendienteCliente){
           
                // Se verifica que el canje pendiente sea un servicio
                if(promocionCanjePendiente.idServicio){

                    // Se recorren todos los servicios de la venta
                    for(var j = 0; j < this.caja.venta.promocionesNuevas.editarPromociones.serviciosVenta.length; j++){
                        var servicioVenta = this.caja.venta.promocionesNuevas.editarPromociones.serviciosVenta[j];

                        // Se verifica que el servicio de la venta esté libre para aplicar en promoción, no sea cuenta por pagar ni sea un servicio de paquete ni venta prepagada
                        if(servicioVenta.aplicableEnPromocion && servicioVenta.esVenta && !servicioVenta.noAplicablePromociones && servicioVenta.idPaqueteSucursalCliente == null){

                            // Se verifica que el canje pendiente se encuentra en la venta
                            if(servicioVenta.idServicio == promocionCanjePendiente.idServicio){

                                // Se agrega la promoción aplicada nueva
                                var idPromocionAplicada = this.caja.venta.promocionesNuevas.editarPromociones.promocionesAplicadas.length + 1;

                                this.caja.venta.promocionesNuevas.editarPromociones.promocionesAplicadas.push({
                                    id: idPromocionAplicada,
                                    idPromocionSucursalNueva: promocionCanjePendiente.idPromocionSucursalNueva,
                                    descripcion: promocionCanjePendiente.nombre,
                                    idPromocionSucursalNuevaAplicacionValorPendienteCliente: promocionCanjePendiente.idPromocionSucursalNuevaAplicacionValorPendienteCliente
                                });

                                // El servicio se bloquea para las demás promociones
                                servicioVenta.aplicableEnPromocion = false;

                                // Se verifica el tipo de valor del canje para calcular el descuento que tendrá la promoción
                                if(promocionCanjePendiente.idPromocionSucursalNuevaAplicacionValorTipo == 1){
                                    if(promocionCanjePendiente.valor > Number(servicioVenta.costoDescuento)){
                                        var descuentoPromocionGeneral:any = Number(servicioVenta.costoDescuento);
                                    }
                                    else{
                                        var descuentoPromocionGeneral:any = promocionCanjePendiente.valor;
                                    }
                                }

                                if(promocionCanjePendiente.idPromocionSucursalNuevaAplicacionValorTipo == 2){
                                    var descuentoPromocionGeneral:any = Number(servicioVenta.costoDescuento) * (promocionCanjePendiente.valor / 100);
                                }

                                descuentoPromocionGeneral = Number(descuentoPromocionGeneral.toFixed(2));

                                // El descuento calculado es el valor de la promoción y es lo que se le descontará al servicio
                                this.caja.venta.promocionesNuevas.editarPromociones.promocionesAplicadas[idPromocionAplicada - 1].pago = descuentoPromocionGeneral;

                                // El servicio se ligará con su promoción en la que aplico y el id del canje del servicio gratis
                                servicioVenta.promociones.push({
                                    idPromocionAplicada: idPromocionAplicada,
                                    descuento: descuentoPromocionGeneral,
                                    idPromocionSucursalNuevaAplicacionValorPendienteCliente: promocionCanjePendiente.idPromocionSucursalNuevaAplicacionValorPendienteCliente
                                });

                                j = this.caja.venta.promocionesNuevas.editarPromociones.serviciosVenta.length;
                                i = this.caja.venta.promocionesNuevas.editarPromociones.serviciosProductosPendientes.length;

                            }

                        }

                    }

                }

                // Se verifica que el canje pendiente sea un producto
                if(promocionCanjePendiente.idInventarioPresentacion){

                    // Se recorren todos los productos vendidos
                    for(var j = 0; j < this.caja.venta.promocionesNuevas.editarPromociones.productosVenta.length; j++){
                        var productoVenta = this.caja.venta.promocionesNuevas.editarPromociones.productosVenta[j];

                        // Se verifica que el producto no sea una cuenta por pagar
                        if(productoVenta.esVenta){

                            // Se verifica que el producto del canje esté en la venta
                            if(productoVenta.idInventarioPresentacion == promocionCanjePendiente.idInventarioPresentacion){

                                // No se verifia si hay cantidad disponible ya que al ser elegida debe de tener

                                // Se agrega la promoción aplicada nueva
                                var idPromocionAplicada = this.caja.venta.promocionesNuevas.editarPromociones.promocionesAplicadas.length + 1;

                                this.caja.venta.promocionesNuevas.editarPromociones.promocionesAplicadas.push({
                                    id: idPromocionAplicada,
                                    idPromocionSucursalNueva: promocionCanjePendiente.idPromocionSucursalNueva,
                                    descripcion: promocionCanjePendiente.nombre,
                                    idPromocionSucursalNuevaAplicacionValorPendienteCliente: promocionCanjePendiente.idPromocionSucursalNuevaAplicacionValorPendienteCliente
                                });

                                // Se disminuye la cantidad de productos disponibles para las siguientes promociones
                                // (** No se aplica para todas las cantidades pendientes pues se supone el canje solo aplica para una cantidad **)
                                productoVenta.promocionCantidadDisponible--;

                                // Se verifica el tipo de valor del canje para calcular el descuento que tendrá la promoción y el producto
                                if(promocionCanjePendiente.idPromocionSucursalNuevaAplicacionValorTipo == 1){
                                    if(promocionCanjePendiente.valor > (Number(productoVenta.costoDescuento) / productoVenta.cantidad)){
                                        var descuentoPromocionGeneral:any = (Number(productoVenta.costoDescuento) / productoVenta.cantidad);
                                    }
                                    else{
                                        var descuentoPromocionGeneral:any = promocionCanjePendiente.valor;
                                    }
                                }

                                if(promocionCanjePendiente.idPromocionSucursalNuevaAplicacionValorTipo == 2){
                                    var descuentoPromocionGeneral:any = (Number(productoVenta.costoDescuento) / productoVenta.cantidad) * (promocionCanjePendiente.valor / 100);
                                }

                                descuentoPromocionGeneral = Number(descuentoPromocionGeneral.toFixed(2));

                                // El descuento calculado es el valor de la promoción y es lo que se le descontará al producto también
                                this.caja.venta.promocionesNuevas.editarPromociones.promocionesAplicadas[idPromocionAplicada - 1].pago = descuentoPromocionGeneral;

                                // El producto se ligará con su promoción en la que aplico y el id del canje del producto gratis, además de agregarle la cantidad 
                                // que se utilizo para esta promoción y canje
                                productoVenta.promociones.push({
                                    idPromocionAplicada: idPromocionAplicada,
                                    descuento: descuentoPromocionGeneral,
                                    idPromocionSucursalNuevaAplicacionValorPendienteCliente: promocionCanjePendiente.idPromocionSucursalNuevaAplicacionValorPendienteCliente, 
                                    cantidadProductos: 1
                                });

                                j = this.caja.venta.promocionesNuevas.editarPromociones.productosVenta.length;
                                i = this.caja.venta.promocionesNuevas.editarPromociones.serviciosProductosPendientes.length;
                            }

                        }

                    }

                }

            }

        }

    }

    caja_venta_promocionesNuevas_eliminarPromocionElegida (promocion:any){

        // Se resta 1 uso a la promoción que se eligió
        for(var i = 0; i < this.caja.venta.promocionesNuevas.editarPromociones.promocionGeneral.conCodigo.length; i++){
            var promocionGeneral = this.caja.venta.promocionesNuevas.editarPromociones.promocionGeneral.conCodigo[i];

            if(promocionGeneral.idPromocionSucursalNueva == promocion.idPromocionSucursalNueva){
                promocionGeneral.cantidadUsosReal--;
            }
        }
        for(var i = 0; i < this.caja.venta.promocionesNuevas.editarPromociones.promocionGeneral.sinCodigo.length; i++){
            var promocionGeneral = this.caja.venta.promocionesNuevas.editarPromociones.promocionGeneral.sinCodigo[i];

            if(promocionGeneral.idPromocionSucursalNueva == promocion.idPromocionSucursalNueva){
                promocionGeneral.cantidadUsosReal--;
            }
        }
        for(var i = 0; i < this.caja.venta.promocionesNuevas.editarPromociones.promocionCombos.conCodigo.length; i++){
            var promocionCombo = this.caja.venta.promocionesNuevas.editarPromociones.promocionCombos.conCodigo[i];

            if(promocionCombo.idPromocionSucursalNueva == promocion.idPromocionSucursalNueva){
                promocionCombo.cantidadUsosReal--;
            }
        }
        for(var i = 0; i < this.caja.venta.promocionesNuevas.editarPromociones.promocionCombos.sinCodigo.length; i++){
            var promocionCombo = this.caja.venta.promocionesNuevas.editarPromociones.promocionCombos.sinCodigo[i];

            if(promocionCombo.idPromocionSucursalNueva == promocion.idPromocionSucursalNueva){
                promocionCombo.cantidadUsosReal--;
            }
        }

        // Recorrer todas las promociones aplicadas elegidas
        for(var i = 0; i < this.caja.venta.promocionesNuevas.editarPromociones.promocionesAplicadas.length; i++){
            var promocionAplicada = this.caja.venta.promocionesNuevas.editarPromociones.promocionesAplicadas[i];

            // Encontrar la promoción que se quiere borrar
            if(promocionAplicada.id == promocion.id){

                // Eliminar la relación de la promoción con los servicios y volver a activarlos para que apliquen en otras promociones
                for(var j = 0; j < this.caja.venta.promocionesNuevas.editarPromociones.serviciosVenta.length; j++){
                    var servicioVenta = this.caja.venta.promocionesNuevas.editarPromociones.serviciosVenta[j];

                    for(var k = 0; k < servicioVenta.promociones.length; k++){
                        var promocion = servicioVenta.promociones[k];

                        if(promocion.idPromocionAplicada == promocionAplicada.id){
                            servicioVenta.promociones.splice(k, 1);
                            k--;
                        }
                    }

                    if(servicioVenta.promociones.length == 0){
                        servicioVenta.aplicableEnPromocion = true;
                    }
                }

                // Eliminar la relación de la promoción con los productos y aumentar las cantidades disponibles para las demás promociones
                for(var j = 0; j < this.caja.venta.promocionesNuevas.editarPromociones.productosVenta.length; j++){
                    var productoVenta = this.caja.venta.promocionesNuevas.editarPromociones.productosVenta[j];
                
                    for(var k = 0; k < productoVenta.promociones.length; k++){
                        var promocion = productoVenta.promociones[k];

                        if(promocion.idPromocionAplicada == promocionAplicada.id){
                            productoVenta.promocionCantidadDisponible += promocion.cantidadProductos;
                            productoVenta.promociones.splice(k, 1);
                            k--;
                        }
                    }

                }

                // Eliminar la promoción 
                this.caja.venta.promocionesNuevas.editarPromociones.promocionesAplicadas.splice(i, 1);
                i = this.caja.venta.promocionesNuevas.editarPromociones.promocionesAplicadas.length;
            }
        }

        // Se recorren las promociones que quedaron
        for(var i = 0; i < this.caja.venta.promocionesNuevas.editarPromociones.promocionesAplicadas.length; i++){
            // Se calcula el nuevo id que deben de tener y se remplaza tanto en el arreglo de promociones
            // como en la relación de los servicios y productos con las promociones
            var idNuevo = i + 1;
            var idAnterior = this.caja.venta.promocionesNuevas.editarPromociones.promocionesAplicadas[i].id;
            this.caja.venta.promocionesNuevas.editarPromociones.promocionesAplicadas[i].id = idNuevo;

            for(var j = 0; j < this.caja.venta.promocionesNuevas.editarPromociones.serviciosVenta.length; j++){
                var servicioVenta = this.caja.venta.promocionesNuevas.editarPromociones.serviciosVenta[j];

                for(var k = 0; k < servicioVenta.promociones.length; k++){
                    var promocion = servicioVenta.promociones[k];

                    if(promocion.idPromocionAplicada == idAnterior){
                        promocion.idPromocionAplicada = idNuevo;
                    }
                }

            }

            for(var j = 0; j < this.caja.venta.promocionesNuevas.editarPromociones.productosVenta.length; j++){
                var productoVenta = this.caja.venta.promocionesNuevas.editarPromociones.productosVenta[j];
            
                for(var k = 0; k < productoVenta.promociones.length; k++){
                    var promocion = productoVenta.promociones[k];

                    if(promocion.idPromocionAplicada == idAnterior){
                        promocion.idPromocionAplicada = idNuevo;
                    }
                }

            }
    
        }

        // Calcular las nuevas promociones posibles una vez aplicada la promoción elegida
        this.caja_venta_promocionesNuevas_calcularPromocionesPosibles();
    }

    caja_venta_promocionesNuevas_aplicarEnVentaPromocionesActivas (promocion:any){

        // Se pasan como quedaron las promociones después de editarlar (su cantidad de uso)
        this.caja.venta.promocionesNuevas.promocionGeneral.conCodigo = JSON.parse(JSON.stringify(this.caja.venta.promocionesNuevas.editarPromociones.promocionGeneral.conCodigo));
        this.caja.venta.promocionesNuevas.promocionGeneral.sinCodigo = JSON.parse(JSON.stringify(this.caja.venta.promocionesNuevas.editarPromociones.promocionGeneral.sinCodigo));

        this.caja.venta.promocionesNuevas.promocionCombos.conCodigo = JSON.parse(JSON.stringify(this.caja.venta.promocionesNuevas.editarPromociones.promocionCombos.conCodigo));
        this.caja.venta.promocionesNuevas.promocionCombos.sinCodigo = JSON.parse(JSON.stringify(this.caja.venta.promocionesNuevas.editarPromociones.promocionCombos.sinCodigo));

        this.caja.venta.promocionesNuevas.serviciosProductosPendientes = JSON.parse(JSON.stringify(this.caja.venta.promocionesNuevas.editarPromociones.serviciosProductosPendientes));
    
        // Se pasan como quedaron los servicios y productos (si están bloqueados para otras promociones, las cantidades disponibles y sobretodo su relación
        // con las promociones y cuanto se descontó de cada uno)
        this.caja.venta.servicios.listaServiciosPorCobrar = JSON.parse(JSON.stringify(this.caja.venta.promocionesNuevas.editarPromociones.serviciosVenta));
        this.caja.venta.productos.listaProductosPorCobrar = JSON.parse(JSON.stringify(this.caja.venta.promocionesNuevas.editarPromociones.productosVenta));

        // Se pasan las promociones que se quiere que se apliquen
        this.caja.venta.promocionesNuevas.promocionesAplicadas = JSON.parse(JSON.stringify(this.caja.venta.promocionesNuevas.editarPromociones.promocionesAplicadas));

        // Se vuelven a calcular los totales
        this.caja_venta_calcularTotales();

        this.modales.modalPromociones.hide();
    }

    // ------------------------------------------ Pasar a Pagar ------------------------------------------- 
    caja_venta_pasarAPagar () {
        this._pantallaServicio.mostrarSpinner();
        var error = 0;
        var letrasExp = RegExp("^[a-zA-Z áéíóúñÁÉÍÓÚÑüÜ\s]*$");
        var eMailExp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
        var telefonoExp = new RegExp("^[0-9 ()+-\sa-zA-Z áéíóúñÁÉÍÓÚÑüÜ\s\r\n]*$");
        var telMovilExp = new RegExp("^[0-9 ()+-\sa-zA-Z áéíóúñÁÉÍÓÚÑüÜ\s\r\n]*$");

        for (var i = 0; i < this.caja.venta.servicios.listaServiciosPorCobrar.length; i++) {
            if (this.caja.venta.servicios.listaServiciosPorCobrar[i].esVenta) {
                if (!this.caja.venta.servicios.listaServiciosPorCobrar[i].idPersonal) {
                    error++;
                    // $("#servicioDDLPersonal" + i).addClass("errorCampo");
                    $("#servicioDDLPersonal" + i +" > div:first-child").attr("style", "outline: red solid 1px !important;");
                }
                if (!this.caja.venta.servicios.listaServiciosPorCobrar[i].idServicio) {
                    error++;
                    // $("#servicioDDLServicio" + i).addClass("errorCampo");
                    $("#servicioDDLServicio" + i +" > div:first-child").attr("style", "outline: red solid 1px !important;");
                }
                if (this.caja.venta.servicios.listaServiciosPorCobrar[i].costoMaximo == null) {
                    this.caja.venta.servicios.listaServiciosPorCobrar[i].costoMaximo = this.caja.venta.servicios.listaServiciosPorCobrar[i].costoMinimo
                }                
            }
        }

        for (var i = 0; i < this.caja.venta.productos.listaProductosPorCobrar.length; i++) {
            if (this.caja.venta.productos.listaProductosPorCobrar[i].esVenta) {
                if (!this.caja.venta.productos.listaProductosPorCobrar[i].idInventarioPresentacion) {
                    //error++;
                    //$("#productoDDLPresentacion" + i).addClass("errorCampo");
                    this.caja.venta.productos.listaProductosPorCobrar.splice(i, 1);
                }
            }
        }

        for (var i = 0; i < this.caja.venta.paquetes.listaPaquetesPorCobrar.length; i++) {
            if (this.caja.venta.paquetes.listaPaquetesPorCobrar[i].esVenta) {
                if (this.caja.venta.paquetes.listaPaquetesPorCobrar[i].idPaqueteSucursalCliente == null) {
                    if (!this.caja.venta.paquetes.listaPaquetesPorCobrar[i].idPaqueteSucursal) {
                        error++;
                        // $("#paqueteDDLPaquete" + i).addClass("errorCampo");
                        $("#paqueteDDLPaquete" + i + " > div:first-child").attr("style", "outline: red solid 1px !important;");
                    }
                }
            }
        }

        for (var i = 0; i < this.caja.venta.cargos.listaCargosPorCobrar.length; i++) {
            if (this.caja.venta.cargos.listaCargosPorCobrar[i].esVenta) {
                if (this.caja.venta.cargos.listaCargosPorCobrar[i].descripcion == "") {
                    error++;
                    $("#cargosInputDescripcion" + i).addClass("errorCampo");
                }
            }
        }

        //----------------------------------------CERTIFICADO REGALO CAMBIOS PAGO  ------------------------------------------------------//
        for (var i = 0; i < this.caja.venta.certificadoRegalo.listaCertificadosPorCobrar.length; i++) {

            if (!this.caja.venta.certificadoRegalo.listaCertificadosPorCobrar[i].idCertificadoRegalo) {
                // $('#certificadoRegaloDDLcertificadoRegalo' + i).addClass("errorCampo");
                $("#certificadoRegaloDDLcertificadoRegalo" + i + " > div:first-child").attr("style", "outline: red solid 1px !important;");
                error++;
            }

            if (this.caja.venta.certificadoRegalo.listaCertificadosPorCobrar[i].codigo == "") {
                $('#certificadoRegaloDDLcertificadoRegaloCodigo' + i).addClass("errorCampo");
                error++;
            }

            if (!this.caja.venta.certificadoRegalo.listaCertificadosPorCobrar[i].vigencia) {
                $('#certificadoRegaloDDLcertificadoRegaloVigencia' + i).addClass("errorCampo");
                error++;
            }

            if (this.caja.venta.certificadoRegalo.listaCertificadosPorCobrar[i].costoElegido == "" || Number(this.caja.venta.certificadoRegalo.listaCertificadosPorCobrar[i].costoElegido) <= 0) {
                $('#certificadoRegaloDDLcertificadoRegaloCosto' + i).addClass("errorCampo");
                error++;
            }

        }

        if (this.caja.venta.servicios.listaServiciosPorCobrar.length == 0 && this.caja.venta.productos.listaProductosPorCobrar.length == 0 &&
            this.caja.venta.paquetes.listaPaquetesPorCobrar.length == 0 && this.caja.venta.cargos.listaCargosPorCobrar.length == 0 &&
            this.caja.venta.certificadoRegalo.listaCertificadosPorCobrar.length == 0) {
            error++;
            this._toaster.error("Para pasar a realizar el Pago, se debe seleccionar al menos un Servicio, Paquete, Producto, Cargo o Certificado de Regalo");
        }

        if (!this.caja.venta.cliente) {
            if (!this.caja.venta.clienteNuevo.mostrarNuevoCliente) {
                error++;
                // $("#uiSelectClienteCaja").addClass("errorCampo");
                $("#uiSelectClienteCaja > div:first-child").attr("style", "outline: red solid 1px !important;");
            }
            else {
                if (this.caja.venta.clienteNuevo.nombre != "") {
                    if (letrasExp.test(this.caja.venta.clienteNuevo.nombre)) {
                        $("#cajaCNNombre").removeClass("errorCampo");
                    }
                    else {
                        $("#cajaCNNombre").addClass("errorCampo");
                        error++;
                    }
                }
                else {
                    $("#cajaCNNombre").addClass("errorCampo");
                    error++;
                }

                if (this.caja.venta.clienteNuevo.email != "") {
                    if (eMailExp.test(this.caja.venta.clienteNuevo.email)) {
                        $("#cajaCNEmail").removeClass("errorCampo");
                    }
                    else {
                        $("#cajaCNEmail").addClass("errorCampo");
                        error++;
                    }
                }

                if (this.caja.venta.clienteNuevo.telefono != "") {
                    if (telefonoExp.test(this.caja.venta.clienteNuevo.telefono) || telMovilExp.test(this.caja.venta.clienteNuevo.telefono)) {
                        $("#cajaCNTelefono").removeClass("errorCampo");
                    }
                    else {
                        $("#cajaCNTelefono").addClass("errorCampo");
                        error++;
                    }
                }

                if (this.caja.venta.clienteNuevo.fechaNacimiento !== null) {
                    // if (this.caja.venta.clienteNuevo.fechaNacimiento instanceof Date) {
                    //     $("#cajaCNFechaNacimiento").removeClass("errorCampo");
                    // }
                    // else {
                    //     $("#cajaCNFechaNacimiento").addClass("errorCampo");
                    //     error++;
                    // }
                }
                else {
                    $("#cajaCNFechaNacimiento").removeClass("errorCampo");
                }

            }

        }

        if (error == 0) {
            this.caja.venta.parte = 2;
            this.caja_venta_getMetodoPago();
            this.caja.venta.primerPasarAPagar = false;           
        }
        else {
            this._pantallaServicio.ocultarSpinner();
        }

    }

    caja_venta_regresarACuentas () {
        this.caja.venta.parte = 1;
    }

    caja_venta_getMetodoPago () {

        this._backService.HttpPost("procesos/agenda/Agenda/selectMetodoPagoCertificadoRegalo", {}, {}).subscribe( (data:any) => {
            this.caja.venta.dataMetodoPago = [];
			this.caja.venta.certificadoRegalo.indexMetodoPagoCR = 0;
            this.caja.venta.dataMetodoPago = JSON.parse(JSON.stringify(eval(data)));
            this.caja.venta.dataMetodoPago.push({ descripcion: this.agendaTranslate.nuevoPuntos, idMetodoPagoSucursal: -1 });

            this.caja.venta.dataMetodoPagoPropinas = [];
            this.caja.venta.dataMetodoPagoPropinas = JSON.parse(JSON.stringify(eval(data)));

            for(var i = 0; i < this.caja.venta.dataMetodoPagoPropinas.length; i++){
                if(this.caja.venta.dataMetodoPagoPropinas[i].idSucursal == null){
                    this.caja.venta.dataMetodoPagoPropinas.splice(i,1);
                    i--;
                }
            }

            // declaración del primer registro de métodos de pago de la venta
            var mp = JSON.parse(JSON.stringify(this.caja.venta.dataMetodoPago[0]));
            mp.idMetodoPagoSucursal = null;
            mp.monto = Number(this.caja.venta.totales.total - this.caja.venta.totales.totalDescuentoGeneral);
            
            mp.pagoComision = 0;
            if(Number(this.caja.venta.dataMetodoPago[0].comision) != 0){
                mp.pagoComision = Number(this.caja.venta.dataMetodoPago[0].comision);
            }
            if(Number(this.caja.venta.dataMetodoPago[0].comisionPorcentual) != 0){
                mp.pagoComision = mp.monto * (Number(this.caja.venta.dataMetodoPago[0].comisionPorcentual) / 100);
            }

            mp.digitos = "";
            mp.codigoRegalo = "";
            mp.idCertificadoRegalo = 0;
            mp.idCertificadoRegaloUso = 0;
            mp.montoaUtilizar = 0;
            this.caja.venta.metodosDePago = [];
            this.caja.venta.metodosDePago.push(mp);
            this.dtlimpiarmetodosDePago = JSON.parse(JSON.stringify(this.caja.venta.metodosDePago));
            this.caja_venta_calcularTotalCobro();
            this.caja.venta.consultaMetodosPagoHecha = true;

            this._pantallaServicio.ocultarSpinner();

            if(mp.descripcion == "Dolares" && this._pantallaServicio.idSucursal == 689 || mp.descripcion == "Dolares" && this._pantallaServicio.idSucursal == 269){
                $("#TipoCambio").show();
            }
            else{
                $("#TipoCambio").hide();
            }
            this.caja_venta_convertirpesos();
        }, error => {
            this.guardarError(error.error ? error.error.message : error.message, error.status, "Consultar método pago");
        });
    }

    // ------------------------------------- Métodos de Pago (Cobro) -------------------------------------- 
    caja_venta_agregarMetodoDePago () {

        var cant = 0;
        if (this.caja.venta.totales.totalCobro < (this.caja.venta.totales.total - this.caja.venta.totales.totalDescuentoGeneral)) {
            cant = Number((this.caja.venta.totales.total - this.caja.venta.totales.totalCobro).toFixed(2));
        }
        else{
            cant = 0;
        }

        var mp = JSON.parse(JSON.stringify(this.caja.venta.dataMetodoPago[0]));
        mp.idMetodoPagoSucursal = null;
        mp.monto = cant;
        mp.pagoComision = 0;
        if(Number(mp.comision) != 0){
            mp.pagoComision = Number(mp.comision);
        }
        if(Number(mp.comisionPorcentual) != 0){
            mp.pagoComision = Number((Number(mp.monto) * (Number(mp.comisionPorcentual) / 100)).toFixed(2));
        }
        mp.digitos = "";
        mp.codigoRegalo = "";
        mp.idCertificadoRegalo = 0;
        mp.idCertificadoRegaloUso = 0;
        mp.montoaUtilizar = 0;
        this.caja.venta.metodosDePago.push(mp);
        this.dtlimpiarmetodosDePago = JSON.parse(JSON.stringify(this.caja.venta.metodosDePago));
        this.caja_venta_calcularTotalCobro();
    }

    caja_venta_eliminarMetodoDePago (mp:any,index:any) {
        // $('#DDMetododePagoSelect'+index).removeClass('errorCampo');
        $("#DDMetododePagoSelect" + index + " > div:first-child").attr("style", "outline: none;");

		this.caja.venta.certificadoRegalo.indexMetodoPagoCR = 0;
        this.caja.venta.metodosDePago.splice(index, 1);
        this.caja_venta_calcularTotalCobro();
    }

    caja_venta_cambiarCobro (mp:any, index:any) {
        var floatRegex = RegExp("^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$");
        if(mp.idSucursal == null){
            if (!floatRegex.test(mp.monto)) {
                mp.monto = 0;
                mp.pagoComision = 0;
                this.caja_venta_calcularTotalCobro();
            }
            else {
                mp.pagoComision = 0;
                if(Number(mp.monto) > Number(mp.montoaUtilizar)) {
                    mp.monto = Number(mp.montoaUtilizar);
                }
                this.caja_venta_calcularTotalCobro();
            }
        }
        if (mp.monto != "") {
            if (!floatRegex.test(mp.monto)) {
                mp.monto = 0;
                mp.pagoComision = 0;
                this.caja_venta_calcularTotalCobro();
            }
            else {
                mp.pagoComision = 0;
                if(Number(mp.comision) != 0){
                    mp.pagoComision = Number(mp.comision);
                }
                if(Number(mp.comisionPorcentual) != 0){
                    mp.pagoComision = Number((Number(mp.monto) * (Number(mp.comisionPorcentual) / 100)).toFixed(2));
                }
                this.caja_venta_calcularTotalCobro();
            }
        }
        this.caja_venta_convertirpesos();
    }

    caja_venta_prevenirCobroVacio (mp:any) {
        if (mp.monto == "") {
            mp.monto = 0;
            mp.pagoComision = 0;
            this.caja_venta_calcularTotalCobro();
            this.caja_venta_convertirpesos();
        }
    }

    caja_venta_calcularTotalCobro () {
        var totalCobroEnEfectivo = 0;
        this.caja.venta.totales.totalCobro = 0;
        this.caja.venta.totales.comisionCobro = 0;

        for (var i = 0; i < this.caja.venta.metodosDePago.length; i++) {

            this.caja.venta.totales.totalCobro += Number(this.caja.venta.metodosDePago[i].monto);
            this.caja.venta.totales.comisionCobro += Number(this.caja.venta.metodosDePago[i].pagoComision);
            
            if (this.caja.venta.metodosDePago[i].isEfectivo) {
                totalCobroEnEfectivo = totalCobroEnEfectivo + Number(this.caja.venta.metodosDePago[i].monto);
            }

        }

        this.caja.venta.totales.feriaEfectivo = this.caja.venta.totales.totalCobro - this.caja.venta.totales.total + this.caja.venta.totales.totalDescuentoGeneral;

        if (this.caja.venta.totales.feriaEfectivo < 0) {
            this.caja.venta.totales.feriaEfectivo = 0;
        }
        else {
            if (this.caja.venta.totales.feriaEfectivo > totalCobroEnEfectivo) {
                this.caja.venta.totales.feriaEfectivo = totalCobroEnEfectivo;
            }
        }
    }

    caja_venta_cambiarCodigoCertificadoPagar (mp:any, index:any) {
        this.caja.venta.certificadoRegalo.indexMetodoPagoCR = index;

        // $('#DDMetododePagoSelect'+index).removeClass('errorCampo');
        $("#DDMetododePagoSelect" + index + " > div:first-child").attr("style", "outline: none;");
        $('#codigoCanjeable').removeClass('errorCampo');
        this.modales.mdlCertifidicadoRegaloCodigoIngresar.show();
    }

    caja_venta_cambiarPagoTerminar (mp:any, index:any, dm:any) {
                
        // $('#DDMetododePagoSelect'+index).removeClass('errorCampo');
        $("#DDMetododePagoSelect" + index + " > div:first-child").attr("style", "outline: none;");
        if (mp.idMetodoPagoSucursal == -1) {
            this.caja.venta.metodosDePago = [{idCertificadoRegalo: null, codigoRegalo: null}];
			this.caja.venta.certificadoRegalo.indexMetodoPagoCR = 0;
            this.caja_venta_metodoPago_consultaMetodosPago();
            this.modales.modalMetodoPago.show();
        }
        else {
            if(dm.idSucursal == null){

                this.caja.venta.certificadoRegalo.idCertificadoRegaloIngreado = 0;
                this.caja.venta.certificadoRegalo.codigoCertificadoRegaloIngreado = "";

                mp.montoaUtilizar = 0;
                mp.descripcion = "Certificado de Regalo - ";
                mp.idCertificadoRegalo = 0;
                mp.idCertificadoRegaloUso = 0;
                mp.codigoRegalo = "";
                mp.idSucursal = null;

                this.caja.venta.certificadoRegalo.indexMetodoPagoCR = Number(index);

                this.modales.mdlCertifidicadoRegaloCodigoIngresar.show();
            }
            else{
                for (var i = 0; i < this.caja.venta.dataMetodoPago.length; i++) {
                    if (mp.idMetodoPagoSucursal == this.caja.venta.dataMetodoPago[i].idMetodoPagoSucursal) {
                        mp.descripcion = this.caja.venta.dataMetodoPago[i].descripcion;
                        mp.isEfectivo = this.caja.venta.dataMetodoPago[i].isEfectivo;
                        mp.comision = this.caja.venta.dataMetodoPago[i].comision;
                        mp.comisionPorcentual = this.caja.venta.dataMetodoPago[i].comisionPorcentual;
                        mp.montoaUtilizar = 0;
                        mp.idCertificadoRegalo = 0;
                        mp.idCertificadoRegaloUso = 0;
                        mp.codigoRegalo = "";
                        mp.idSucursal = this.caja.venta.dataMetodoPago[i].idSucursal;

                        mp.pagoComision = 0;
                        if(Number(mp.comision) != 0){
                            mp.pagoComision = Number(mp.comision);
                        }
                        if(Number(mp.comisionPorcentual) != 0){
                            mp.pagoComision = Number(mp.monto) * (Number(mp.comisionPorcentual) / 100);
                        }

                        this.caja_venta_calcularTotalCobro();

                    }
                }
            }
        }

        if(mp.descripcion == "Dolares" && this._pantallaServicio.idSucursal == 689 || mp.descripcion == "Dolares" && this._pantallaServicio.idSucursal == 269){
            $('#TipoCambio').show();  
            $('#Comision').hide();
        }          
        else{
            $('#TipoCambio').hide();  
            $('#Comision').show();
        }
        this.caja_venta_convertirpesos();
    }

    // --------------------------------------- Tipo Cambio ---------------------------------------
    // montotipocambio:any = 0;
    caja_venta_convertirpesos () {
        var valormonedaUSA = $("#camptipocambio").val() == "" ? 0:$("#camptipocambio").val(); 
        var valormonedaPeso = $("#camptipocambio2").val();

        if(parseFloat(valormonedaPeso) > 0){
            var totalconvertiraUSA = (valormonedaPeso / parseFloat(this._pantallaServicio.montotipocambio)).toFixed(2);

            $("#camptipocambio").val(totalconvertiraUSA); 
        }
        else{
            $("#camptipocambio").val("0.00");
            $("#camptipocambio2").val("0.00");
        }

    }

    // --------------------------------------- Propina ---------------------------------------
    caja_venta_agregarPropina () {
        this.caja.venta.propinas.push({
            id: this.caja.venta.propinas.length,
            idPersonal: null,
            idMetodoPagoSucursal: null,
            descuentoP: 0,
            descuentoF: 0,
            total: 0,
            propinaComision: 0
        });
    }

    caja_venta_validacionesPropina () {
        var valido = true;
        for( var i = 0; i < this.caja.venta.propinas.length; i++) {
            if (!this.caja.venta.propinas[i].idPersonal) {
                // $("#propinaPersonal" + (i)).addClass("errorCampo");
                $("#propinaPersonal" + i + " > div:first-child").attr("style", "outline: red solid 1px !important;");
                valido = false;
            }
            if (!this.caja.venta.propinas[i].idMetodoPagoSucursal) {
                // $("#propinaMetodoPago" + (i)).addClass("errorCampo");
                $("#propinaMetodoPago" + i + " > div:first-child").attr("style", "outline: red solid 1px !important;");
                valido = false;
            }
            if (this.caja.venta.propinas[i].total == 0) {
                $("#propinaDescuentoP" + (i)).addClass("errorCampo");
                $("#propinaDescuentoF" + (i)).addClass("errorCampo");
                valido = false;
            }
        }
        return valido;
    }

    caja_venta_calcularPropina (p:any, opc:any) {
        var floatRegex = RegExp("^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$");
        if (opc == 1) {
            if (p.descuentoP !== "") {
                if (floatRegex.test(p.descuentoP)) {
                    if (parseFloat(p.descuentoP) > 100) {
                        p.descuentoP = 100;
                    }
                    p.total = Number((this.caja.venta.totales.total * (parseFloat(p.descuentoP) / 100)).toFixed(2));
                    p.descuentoF = Number((this.caja.venta.totales.total * (parseFloat(p.descuentoP) / 100)).toFixed(2));
                    
                    p.propinaComision = 0;
                    for (var i = 0; i < this.caja.venta.dataMetodoPagoPropinas.length; i++) {
                        if(this.caja.venta.dataMetodoPagoPropinas[i].idMetodoPagoSucursal == p.idMetodoPagoSucursal){

                            if(Number(this.caja.venta.dataMetodoPagoPropinas[i].comision) != 0){
                                p.propinaComision = Number(this.caja.venta.dataMetodoPagoPropinas[i].comision);
                            }

                            if(Number(this.caja.venta.dataMetodoPagoPropinas[i].comisionPorcentual) != 0){
                                p.propinaComision = Number((Number(p.total) * (Number(this.caja.venta.dataMetodoPagoPropinas[i].comisionPorcentual) / 100)).toFixed(2));
                            }

                            i = this.caja.venta.dataMetodoPagoPropinas.length;
                        }
                    }

                    this.caja_venta_calcularTotalPropina();
                }
                else {
                    p.descuentoP = 0;
                    p.total = 0;
                    p.descuentoF = 0;
                    p.propinaComision = 0;
                    this.caja_venta_calcularTotalPropina();
                }
            }
        }
        if (opc == 2) {
            if (p.descuentoF !== "") {
                if (floatRegex.test(p.descuentoF)) {
                    if (parseFloat(p.descuentoF) > this.caja.venta.totales.total) {
                        p.descuentoF = this.caja.venta.totales.total;
                    }
                    p.total = Number(parseFloat(p.descuentoF)).toFixed(2);
                    p.descuentoP = Number((parseFloat(p.descuentoF) * 100 / this.caja.venta.totales.total).toFixed(2));

                    p.propinaComision = 0;
                    for (var i = 0; i < this.caja.venta.dataMetodoPagoPropinas.length; i++) {
                        if(this.caja.venta.dataMetodoPagoPropinas[i].idMetodoPagoSucursal == p.idMetodoPagoSucursal){

                            if(Number(this.caja.venta.dataMetodoPagoPropinas[i].comision) != 0){
                                p.propinaComision = Number(this.caja.venta.dataMetodoPagoPropinas[i].comision);
                            }
                            if(Number(this.caja.venta.dataMetodoPagoPropinas[i].comisionPorcentual) != 0){
                                p.propinaComision = Number((Number(p.total) * (Number(this.caja.venta.dataMetodoPagoPropinas[i].comisionPorcentual) / 100)).toFixed(2));
                            }
                            i = this.caja.venta.dataMetodoPagoPropinas.length;
                        }
                    }

                    this.caja_venta_calcularTotalPropina();
                }
                else {
                    p.descuentoP = 0;
                    p.total = 0;
                    p.descuentoF = 0;
                    p.propinaComision = 0;
                    this.caja_venta_calcularTotalPropina();
                }
            }
        }
        
    }

    caja_venta_calcularTotalPropina () {
        this.caja.venta.totales.propina = 0;
        this.caja.venta.totales.comisionPropina = 0;

        for (var i = 0; i < this.caja.venta.propinas.length; i++) {
            this.caja.venta.totales.propina = this.caja.venta.totales.propina + Number(this.caja.venta.propinas[i].total);
            this.caja.venta.totales.comisionPropina = this.caja.venta.totales.comisionPropina + Number(this.caja.venta.propinas[i].propinaComision);
        }

    }

    caja_venta_calcularCambioComisionPropina (p:any) {
        p.propinaComision = 0;
        for (var i = 0; i < this.caja.venta.dataMetodoPagoPropinas.length; i++) {
            if(this.caja.venta.dataMetodoPagoPropinas[i].idMetodoPagoSucursal == p.idMetodoPagoSucursal){

                if(Number(this.caja.venta.dataMetodoPagoPropinas[i].comision) != 0){
                    p.propinaComision = Number(this.caja.venta.dataMetodoPagoPropinas[i].comision);
                }
                if(Number(this.caja.venta.dataMetodoPagoPropinas[i].comisionPorcentual) != 0){
                    p.propinaComision = Number((Number(p.total) * (Number(this.caja.venta.dataMetodoPagoPropinas[i].comisionPorcentual) / 100)).toFixed(2));
                }
                i = this.caja.venta.dataMetodoPagoPropinas.length;
            }
        }
        this.caja.venta.calcularTotalPropina();
    }

    caja_venta_removerPropina (index:any) {
        this.caja.venta.propinas.splice(index, 1);
        this.caja_venta_calcularTotalPropina();
    }

    // ----------------------------- Canje Certificado de Regalo -----------------------------
    caja_venta_certificadoRegalo_elegirCertificadosRegaloIngresado (){
        this.caja.venta.certificadoRegalo.codigoCertificadoRegaloIngreado = "";
        $('#codigoCanjeable').removeClass('errorCampo');
    }

    caja_venta_certificadoRegalo_canjearCodigoCertificadoRegalo (mp:any){
        var codigoCertificadoRegalo = mp.codigoRegalo;
        var idCertificadoRegalo = mp.idCertificadoRegalo;
        var index = this.caja.venta.certificadoRegalo.indexMetodoPagoCR;
     
        var validacion = true;

        for(var i = 0; i<this.caja.venta.metodosDePago.length; i++){
            if(this.caja.venta.metodosDePago[i].idSucursal == null){
                if(this.caja.venta.metodosDePago[i].codigoRegalo == codigoCertificadoRegalo && this.caja.venta.metodosDePago[i].idCertificadoRegalo == idCertificadoRegalo && i != index){
                    $('#codigoCanjeable').addClass('errorCampo');
                    this._toaster.error("El código ya se está utilizando");
                    var validacion = false;
                }
            }
        }

        if(validacion == true){
            var params:any = {};
            params.codigo = codigoCertificadoRegalo;
            params.idCertificadoRegalo = idCertificadoRegalo;

            this._backService.HttpPost("catalogos/certificadoRegalo/consultarCodigo", {}, params).subscribe( (data:any) => {
                this.caja.venta.certificadoRegalo.resCertificadoRegalo = eval(data);

                $('#codigoCanjeable').removeClass('errorCampo');
                var validar = true;

                if(this.caja.venta.certificadoRegalo.resCertificadoRegalo.length > 0){

                    if(this.caja.venta.certificadoRegalo.resCertificadoRegalo[0].saldo == 0){
                        mp.idCertificadoRegalo = "";
                        mp.codigoRegalo = "";
                        $('#codigoCanjeable').addClass('errorCampo');
                        this._toaster.error("El código ingresado ya se utilizó en su totalidad");
                        validar = false;
                    }
                    
                    var fechaHoy = new Date(this.caja.venta.fechaPago);
                    var fechaVigencia = new Date(this.caja.venta.certificadoRegalo.resCertificadoRegalo[0].fechaVigencia);

                    fechaHoy.setHours(0,0,0,0);
                    fechaVigencia.setHours(0,0,0,0);

                    if(fechaHoy > fechaVigencia){
                        mp.idCertificadoRegalo = "";
                        mp.codigoRegalo = "";
                        $('#codigoCanjeable').addClass('errorCampo');
                        this._toaster.error("El código ingresado no se encuentra vigente");
                        validar = false;
                    }
                    
                }
                else{
                    mp.idCertificadoRegalo = "";
                    mp.codigoRegalo = "";
                    $('#codigoCanjeable').addClass('errorCampo');
                    this._toaster.error("El código no se encuentra en ese Certificado de Regalo");

                    validar = false;
                }

                if(validar == true){
                    
                    if(Number(mp.monto) > Number(this.caja.venta.certificadoRegalo.resCertificadoRegalo[0].saldo)){
                        mp.monto = Number(this.caja.venta.certificadoRegalo.resCertificadoRegalo[0].saldo);
                    }
              
                    mp.montoaUtilizar = Number(this.caja.venta.certificadoRegalo.resCertificadoRegalo[0].saldo);
                    mp.descripcion = mp.descripcion + mp.codigoRegalo;
                    mp.idCertificadoRegaloUso = this.caja.venta.certificadoRegalo.resCertificadoRegalo[0].idCertificadoRegaloUso;
                 
                    // $('#mdlCertifidicadoRegaloCodigoIngresar').hide();
                    // $('body').removeClass('modal-open');
                    // $('.modal-backdrop').remove();
                    this.modales.mdlCertifidicadoRegaloCodigoIngresar.hide();
                    this.caja_venta_cambiarCobro(mp, index);
                }
            }, error  => {

            });
        }

    }

    // ------------------------------------------- Guardar Pago ------------------------------------------- 
    caja_venta_guardarPago () {
        this._pantallaServicio.mostrarSpinner();
        var error = 0;
        var letrasExp = RegExp("^[a-zA-Z áéíóúñÁÉÍÓÚÑüÜ\s]*$");
        var eMailExp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
        var telefonoExp = new RegExp("^[0-9 ()+-\sa-zA-Z áéíóúñÁÉÍÓÚÑüÜ\s\r\n]*$");
        var telMovilExp = new RegExp("^[0-9 ()+-\sa-zA-Z áéíóúñÁÉÍÓÚÑüÜ\s\r\n]*$");

        // Validar Servicios
        for (var i = 0; i < this.caja.venta.servicios.listaServiciosPorCobrar.length; i++) {
            if (this.caja.venta.servicios.listaServiciosPorCobrar[i].esVenta) {
                if (!this.caja.venta.servicios.listaServiciosPorCobrar[i].idPersonal) {
                    error++;
                    // $("#servicioDDLPersonal" + (this.caja.venta.servicios.listaServiciosPorCobrar.length - 1)).addClass("errorCampo");
                    $("#servicioDDLPersonal" + (this.caja.venta.servicios.listaServiciosPorCobrar.length - 1) +" > div:first-child").attr("style", "outline: red solid 1px !important;");
                }
                if (!this.caja.venta.servicios.listaServiciosPorCobrar[i].idServicio) {
                    error++;
                    // $("#servicioDDLServicio" + (this.caja.venta.servicios.listaServiciosPorCobrar.length - 1)).addClass("errorCampo");
                    $("#servicioDDLServicio" + (this.caja.venta.servicios.listaServiciosPorCobrar.length - 1) +" > div:first-child").attr("style", "outline: red solid 1px !important;");
                }
            }
        }

        // Validar Productos
        for (var i = 0; i < this.caja.venta.productos.listaProductosPorCobrar.length; i++) {
            if (this.caja.venta.productos.listaProductosPorCobrar[i].esVenta) {
                if (!this.caja.venta.productos.listaProductosPorCobrar[i].idInventarioPresentacion) {
                    error++;
                    // $("#productoDDLPresentacion" + (this.caja.venta.productos.listaProductosPorCobrar.length - 1)).addClass("errorCampo");
                    $("#productoDDLPresentacion" + (this.caja.venta.productos.listaProductosPorCobrar.length - 1) + " > div:first-child").attr("style", "outline: red solid 1px !important;");
                }
            }
        }

        // Validar Paquetes
        for (var i = 0; i < this.caja.venta.paquetes.listaPaquetesPorCobrar.length; i++) {
            if (this.caja.venta.paquetes.listaPaquetesPorCobrar[i].esVenta) {
                if (this.caja.venta.paquetes.listaPaquetesPorCobrar[i].idPaqueteSucursalCliente == null) {
                    if (!this.caja.venta.paquetes.listaPaquetesPorCobrar[i].idPaqueteSucursal) {
                        error++;
                        // $("#paqueteDDLPaquete" + (this.caja.venta.paquetes.listaPaquetesPorCobrar.length - 1)).addClass("errorCampo");
                        $("#paqueteDDLPaquete" + (this.caja.venta.paquetes.listaPaquetesPorCobrar.length - 1) + " > div:first-child").attr("style", "outline: red solid 1px !important;");
                    }
                }
            }
        }

        // Validar Cargos
        for (var i = 0; i < this.caja.venta.cargos.listaCargosPorCobrar.length; i++) {
            if (this.caja.venta.cargos.listaCargosPorCobrar[i].esVenta) {
                if (this.caja.venta.cargos.listaCargosPorCobrar[i].descripcion == "") {
                    error++;
                    $("#cargosInputDescripcion" + (this.caja.venta.cargos.listaCargosPorCobrar.length - 1)).addClass("errorCampo");
                }
            }
        }

        // Validar que haya al menos un servicios, producto, cargo o paquete pero no un certificado de regalo
        if ((this.caja.venta.servicios.listaServiciosPorCobrar.length == 0 && this.caja.venta.productos.listaProductosPorCobrar.length == 0 &&
            this.caja.venta.paquetes.listaPaquetesPorCobrar.length == 0 && this.caja.venta.cargos.listaCargosPorCobrar.length == 0) || this.caja.venta.certificadoRegalo.listaCertificadosPorCobrar.length != 0) {
            error++;
            this._toaster.error("Para Guardar se debe seleccionar al menos un Servicio, Paquete, Producto o Cargo y no se debe de seleccionar Certificado de Regalo");
        }

        // Validaciones de cliente
        if (!this.caja.venta.cliente) {
            if (!this.caja.venta.clienteNuevo.mostrarNuevoCliente) {
                error++;
                // $("#uiSelectClienteCaja").addClass("errorCampo");
                $("#uiSelectClienteCaja > div:first-child").attr("style", "outline: red solid 1px !important;");
            }
            else {
                if (this.caja.venta.clienteNuevo.nombre != "") {
                    if (letrasExp.test(this.caja.venta.clienteNuevo.nombre)) {
                        $("#cajaCNNombre").removeClass("errorCampo");
                    }
                    else {
                        $("#cajaCNNombre").addClass("errorCampo");
                        error++;
                    }
                }
                else {
                    $("#cajaCNNombre").addClass("errorCampo");
                    error++;
                }

                if (this.caja.venta.clienteNuevo.email != "") {
                    if (eMailExp.test(this.caja.venta.clienteNuevo.email)) {
                        $("#cajaCNEmail").removeClass("errorCampo");
                    }
                    else {
                        $("#cajaCNEmail").addClass("errorCampo");
                        error++;
                    }
                }

                if (this.caja.venta.clienteNuevo.telefono != "") {
                    if (telefonoExp.test(this.caja.venta.clienteNuevo.telefono) || telMovilExp.test(this.caja.venta.clienteNuevo.telefono)) {
                        $("#cajaCNTelefono").removeClass("errorCampo");
                    }
                    else {
                        $("#cajaCNTelefono").addClass("errorCampo");
                        error++;
                    }
                }

                if (this.caja.venta.clienteNuevo.fechaNacimiento !== null) {
                    if (this.caja.venta.clienteNuevo.fechaNacimiento instanceof Date) {
                        $("#cajaCNFechaNacimiento").removeClass("errorCampo");
                    }
                    else {
                        $("#cajaCNFechaNacimiento").addClass("errorCampo");
                        error++;
                    }
                }
                else {
                    $("#cajaCNFechaNacimiento").removeClass("errorCampo");
                }

            }
        }

        if (error == 0) {
            // ------------------ Declaración de parametros -----------------
            var params:any = {};
            params.origen = "web";
            params.listaServicios = JSON.parse(JSON.stringify(this.caja.venta.servicios.listaServiciosPorCobrar));
            params.listaCargos = JSON.parse(JSON.stringify(this.caja.venta.cargos.listaCargosPorCobrar));
            params.listaPaquetes = JSON.parse(JSON.stringify(this.caja.venta.paquetes.listaPaquetesPorCobrar));
            params.listaProductos = JSON.parse(JSON.stringify(this.caja.venta.productos.listaProductosPorCobrar));
            params.listaPromociones = this.caja.venta.promocionesNuevas.promocionesAplicadas;
            params.fechaPagoHoraCliente = moment(this.caja.venta.fechaPago).format('YYYYMMDD HH:mm:ss');

            // ------------------- Validación de cliente --------------------
            if (this.caja.venta.cliente) {
                params.idCliente = this.caja.venta.cliente;
                params.nombreCliente = null;
                params.emailCliente = null;
                params.telefonoCliente = null;
                params.fechaNacimientoCliente = null;
            }
            else {
                params.idCliente = null;
                params.nombreCliente = this.caja.venta.clienteNuevo.nombre ? this.caja.venta.clienteNuevo.nombre : null;
                params.emailCliente = this.caja.venta.clienteNuevo.email ? this.caja.venta.clienteNuevo.email : null;
                params.telefonoCliente = this.caja.venta.clienteNuevo.telefono ? this.caja.venta.clienteNuevo.telefono : null;
                params.fechaNacimientoCliente = this.caja.venta.clienteNuevo.fechaNacimiento ? moment(this.caja.venta.clienteNuevo.fechaNacimiento).format("YYYY-MM-DD") : null;
            }

            // ----------------- Obtener el costo original de cada venta ----------------
            for (var i = 0; i < params.listaServicios.length; i++) {
                if (params.listaServicios[i].esVenta) {
                    params.listaServicios[i].costoOriginal = params.listaServicios[i].costoElegido;
                    params.listaServicios[i].descuentoPromocion = 0;
                }
            }
            for (var i = 0; i < params.listaPaquetes.length; i++) {
                if (params.listaPaquetes[i].esVenta) {
                    params.listaPaquetes[i].costoOriginal = params.listaPaquetes[i].costoElegido;
                    params.listaPaquetes[i].descuentoPromocion = 0;
                }
            }
            for (var i = 0; i < params.listaProductos.length; i++) {
                if (params.listaProductos[i].esVenta) {
                    params.listaProductos[i].costoOriginal = params.listaProductos[i].costoElegido;
                    params.listaProductos[i].descuentoPromocion = 0;
                }
            }
            for (var i = 0; i < params.listaCargos.length; i++) {
                if (params.listaCargos[i].esVenta) {
                    params.listaCargos[i].costoOriginal = params.listaCargos[i].costoElegido;
                    params.listaCargos[i].descuentoPromocion = 0;
                }
            }

            // ------- Aplicación del descuento en Servicios y Productos de las Promociones y obtención del total de descuento por promociones -------
            for(var i = 0; i < params.listaServicios.length; i++){
                if (params.listaServicios[i].esVenta) {
                    if (params.listaServicios[i].idPagoClienteDetalle == null) {
                        params.listaServicios[i].promocionesAplicadas = "";
                        params.listaServicios[i].canjes = "";

                        // Es un arreglo pero solo trae un registro si se aplicó promoción en servicio ya que solo puede aplciar una por servicio
                        if(params.listaServicios[i].promociones !== undefined && params.listaServicios[i].promociones !== null) {
                            for(var j = 0; j < params.listaServicios[i].promociones.length; j++){
                                params.listaServicios[i].costoDescuento -= params.listaServicios[i].promociones[j].descuento;
                                params.listaServicios[i].descuentoPromocion += params.listaServicios[i].promociones[j].descuento;
                                params.listaServicios[i].promocionesAplicadas += params.listaServicios[i].promociones[j].idPromocionAplicada + ",";
                                if(params.listaServicios[i].promociones[j].idPromocionSucursalNuevaAplicacionValorPendienteCliente){
                                    params.listaServicios[i].canjes += params.listaServicios[i].promociones[j].idPromocionSucursalNuevaAplicacionValorPendienteCliente + ",";
                                }
                            } 
                        }
                    }
                    else{
                        params.listaServicios[i].promocionesAplicadas = "";
                        params.listaServicios[i].canjes = "";
                    }
                }
            }

            for(var i = 0; i < params.listaProductos.length; i++){
                if (params.listaProductos[i].esVenta) {
                    params.listaProductos[i].promocionesAplicadas = "";
                    params.listaProductos[i].promocionesAplicadasCantidadProducto = "";
                    params.listaProductos[i].canjes = "";
                    for(var j = 0; j < params.listaProductos[i].promociones.length; j++){
                        params.listaProductos[i].costoDescuento -= params.listaProductos[i].promociones[j].descuento;
                        params.listaProductos[i].descuentoPromocion += params.listaProductos[i].promociones[j].descuento;
                        params.listaProductos[i].promocionesAplicadas += params.listaProductos[i].promociones[j].idPromocionAplicada + ",";
                        params.listaProductos[i].promocionesAplicadasCantidadProducto += params.listaProductos[i].promociones[j].cantidadProductos + ",";
                        if(params.listaProductos[i].promociones[j].idPromocionSucursalNuevaAplicacionValorPendienteCliente){
                            params.listaProductos[i].canjes += params.listaProductos[i].promociones[j].idPromocionSucursalNuevaAplicacionValorPendienteCliente + ",";
                        }
                    }
                }
            }

            // ---------------------- Descuento General ---------------------
            if (this.caja.venta.totales.descuentoF.toString() != "0") {

                // -- Como el descuento se hace sobre el total, se tiene que determinar cuanto descuento 
                // -- se le quitara a cada servicio, cargo, paquete y producto que formen parte de la venta
                var cuentasCaja = 0;
                for (var i = 0; i < params.listaServicios.length; i++) {
                    if (params.listaServicios[i].esVenta) {
                        if (params.listaServicios[i].idPagoClienteDetalle == null) {
                            cuentasCaja++;
                        }
                    }
                }
                for (var i = 0; i < params.listaPaquetes.length; i++) {
                    if (params.listaPaquetes[i].esVenta) {
                        cuentasCaja++;
                    }
                }
                for (var i = 0; i < params.listaProductos.length; i++) {
                    if (params.listaProductos[i].esVenta) {
                        cuentasCaja++;
                    }
                }
                for (var i = 0; i < params.listaCargos.length; i++) {
                    if (params.listaCargos[i].esVenta) {
                        cuentasCaja++;
                    }
                }
                var descuentoGeneral = Number((Number(this.caja.venta.totales.descuentoF) / cuentasCaja).toFixed(2));
                var descuentoNoAplicado = Number((Number(this.caja.venta.totales.descuentoF) - (descuentoGeneral * cuentasCaja)).toFixed(2));

                // -- Se descuenta lo calculado en la parte de servicios.
                // -- Si el descuento calculado para cada registro es mayor al monto del registro en sí, se suma en una variable para 
                // -- descontarlo en el siguiente registro, si este proceso continua, el faltante se irá sumando y restando en donde 
                // -- sea posible.

                // -- Parte de Servicios
                for (var i = 0; i < params.listaServicios.length; i++) {
                    if (params.listaServicios[i].esVenta) {

                        if (params.listaServicios[i].idPagoClienteDetalle == null) {

                            params.listaServicios[i].costoDescuento = Number(params.listaServicios[i].costoDescuento);

                            if (Number((params.listaServicios[i].costoDescuento - descuentoGeneral).toFixed(2)) < 0) {
                                descuentoNoAplicado = Number((descuentoNoAplicado + descuentoGeneral - params.listaServicios[i].costoDescuento).toFixed(2));
                                params.listaServicios[i].costoDescuento = 0;
                            }
                            else {
                                params.listaServicios[i].costoDescuento = Number((params.listaServicios[i].costoDescuento - descuentoGeneral).toFixed(2));
                                if (descuentoNoAplicado != 0) {
                                    if (Number((params.listaServicios[i].costoDescuento - descuentoNoAplicado).toFixed(2)) < 0) {
                                        descuentoNoAplicado = Number((descuentoNoAplicado - params.listaServicios[i].costoDescuento).toFixed(2));
                                        params.listaServicios[i].costoDescuento = 0;
                                    }
                                    else {
                                        params.listaServicios[i].costoDescuento = Number((params.listaServicios[i].costoDescuento - descuentoNoAplicado).toFixed(2));
                                        descuentoNoAplicado = 0;
                                    }
                                }
                            }

                        }
                    }
                }

                // -- Parte de Paquetes
                for (var i = 0; i < params.listaPaquetes.length; i++) {
                    if (params.listaPaquetes[i].esVenta) {

                        params.listaPaquetes[i].costoDescuento = Number(params.listaPaquetes[i].costoDescuento);

                        if (Number((params.listaPaquetes[i].costoDescuento - descuentoGeneral).toFixed(2)) < 0) {
                            descuentoNoAplicado = Number((descuentoNoAplicado + descuentoGeneral - params.listaPaquetes[i].costoDescuento).toFixed(2));
                            params.listaPaquetes[i].costoDescuento = 0;
                        }
                        else {
                            params.listaPaquetes[i].costoDescuento = Number((params.listaPaquetes[i].costoDescuento - descuentoGeneral).toFixed(2));
                            if (descuentoNoAplicado != 0) {
                                if (Number((params.listaPaquetes[i].costoDescuento - descuentoNoAplicado).toFixed(2)) < 0) {
                                    descuentoNoAplicado = Number((descuentoNoAplicado - params.listaPaquetes[i].costoDescuento).toFixed(2));
                                    params.listaPaquetes[i].costoDescuento = 0;
                                }
                                else {
                                    params.listaPaquetes[i].costoDescuento = Number((params.listaPaquetes[i].costoDescuento - descuentoNoAplicado).toFixed(2));
                                    descuentoNoAplicado = 0;
                                }
                            }
                        }
                    }
                }

                // -- Parte de Productos
                for (var i = 0; i < params.listaProductos.length; i++) {
                    if (params.listaProductos[i].esVenta) {

                        params.listaProductos[i].costoDescuento = Number(params.listaProductos[i].costoDescuento);

                        if (Number((params.listaProductos[i].costoDescuento - descuentoGeneral).toFixed(2)) < 0) {
                            descuentoNoAplicado = Number((descuentoNoAplicado + descuentoGeneral - params.listaProductos[i].costoDescuento).toFixed(2));
                            params.listaProductos[i].costoDescuento = 0;
                        }
                        else {
                            params.listaProductos[i].costoDescuento = Number((params.listaProductos[i].costoDescuento - descuentoGeneral).toFixed(2));
                            if (descuentoNoAplicado != 0) {
                                if (Number((params.listaProductos[i].costoDescuento - descuentoNoAplicado).toFixed(2)) < 0) {
                                    descuentoNoAplicado = Number((descuentoNoAplicado - params.listaProductos[i].costoDescuento).toFixed(2));
                                    params.listaProductos[i].costoDescuento = 0;
                                }
                                else {
                                    params.listaProductos[i].costoDescuento = Number((params.listaProductos[i].costoDescuento - descuentoNoAplicado).toFixed(2));
                                    descuentoNoAplicado = 0;
                                }
                            }
                        }
                    }
                }

                // -- Parte de Cargos
                for (var i = 0; i < params.listaCargos.length; i++) {
                    if (params.listaCargos[i].esVenta) {

                        params.listaCargos[i].costoElegido = Number(params.listaCargos[i].costoElegido);

                        if (Number((params.listaCargos[i].costoElegido - descuentoGeneral).toFixed(2)) < 0) {
                            descuentoNoAplicado = Number((descuentoNoAplicado + descuentoGeneral - params.listaCargos[i].costoElegido).toFixed(2));
                            params.listaCargos[i].costoElegido = 0;
                        }
                        else {
                            params.listaCargos[i].costoElegido = Number((params.listaCargos[i].costoElegido - descuentoGeneral).toFixed(2));
                            if (descuentoNoAplicado != 0) {
                                if (Number((params.listaCargos[i].costoElegido - descuentoNoAplicado).toFixed(2)) < 0) {
                                    descuentoNoAplicado = Number((descuentoNoAplicado - params.listaCargos[i].costoElegido).toFixed(2));
                                    params.listaCargos[i].costoElegido = 0;
                                }
                                else {
                                    params.listaCargos[i].costoElegido = Number((params.listaCargos[i].costoElegido - descuentoNoAplicado).toFixed(2));                                        
                                    descuentoNoAplicado = 0;
                                }
                            }
                        }
                    }
                }

                // Si aun quedaron descuentos no aplicados, se vuelve a reccorrer todo y se descuenta en la primera venta posible
                if (descuentoNoAplicado != 0) {
                    for (var i = 0; i < params.listaServicios.length; i++) {
                        if (params.listaServicios[i].esVenta) {
                            if (params.listaServicios[i].idPagoClienteDetalle == null) {
                                if (Number((params.listaServicios[i].costoDescuento - descuentoNoAplicado).toFixed(2)) < 0) {
                                    descuentoNoAplicado = Number((descuentoNoAplicado - params.listaServicios[i].costoDescuento).toFixed(2));
                                    params.listaServicios[i].costoDescuento = 0;
                                }
                                else {
                                    params.listaServicios[i].costoDescuento = Number((params.listaServicios[i].costoDescuento - descuentoNoAplicado).toFixed(2));
                                    descuentoNoAplicado = 0;
                                }
                            }
                        }
                    }
                }

                if (descuentoNoAplicado != 0) {
                    for (var i = 0; i < params.listaPaquetes.length; i++) {
                        if (params.listaPaquetes[i].esVenta) {
                            if (Number((params.listaPaquetes[i].costoDescuento - descuentoNoAplicado).toFixed(2)) < 0) {
                                descuentoNoAplicado = Number((descuentoNoAplicado - params.listaPaquetes[i].costoDescuento).toFixed(2));
                                params.listaPaquetes[i].costoDescuento = 0;
                            }
                            else {
                                params.listaPaquetes[i].costoDescuento = Number((params.listaPaquetes[i].costoDescuento - descuentoNoAplicado).toFixed(2));
                                descuentoNoAplicado = 0;
                            }
                        }
                    }
                }

                if (descuentoNoAplicado != 0) {
                    for (var i = 0; i < params.listaProductos.length; i++) {
                        if (params.listaProductos[i].esVenta) {
                            if (Number((params.listaProductos[i].costoDescuento - descuentoNoAplicado).toFixed(2)) < 0) {
                                descuentoNoAplicado = Number((descuentoNoAplicado - params.listaProductos[i].costoDescuento).toFixed(2));
                                params.listaProductos[i].costoDescuento = 0;
                            }
                            else {
                                params.listaProductos[i].costoDescuento = Number((params.listaProductos[i].costoDescuento - descuentoNoAplicado).toFixed(2));
                                descuentoNoAplicado = 0;
                            }
                        }
                    }
                }

                if (descuentoNoAplicado != 0) {
                    for (var i = 0; i < params.listaCargos.length; i++) {
                        if (params.listaCargos[i].esVenta) {
                            if (Number((params.listaCargos[i].costoElegido - descuentoNoAplicado).toFixed(2)) < 0) {
                                descuentoNoAplicado = Number((descuentoNoAplicado - params.listaCargos[i].costoElegido).toFixed(2));
                                params.listaCargos[i].costoElegido = 0;
                            }
                            else {
                                params.listaCargos[i].costoElegido = Number((params.listaCargos[i].costoElegido - descuentoNoAplicado).toFixed(2));
                                descuentoNoAplicado = 0;
                            }
                        }
                    }
                }

            }

            // ----------------- Obtener el descuento Manual y General de las ventas ----------------
            for (var i = 0; i < params.listaServicios.length; i++) {
                if (params.listaServicios[i].esVenta) {
                    if (params.listaServicios[i].idPagoClienteDetalle == null) {
                        if (params.listaServicios[i].idPaqueteSucursalCliente == null) {
                            params.listaServicios[i].descuentoManual = Number(params.listaServicios[i].costoOriginal) - params.listaServicios[i].costoDescuento - Number(params.listaServicios[i].descuentoPromocion);
                            params.listaServicios[i].descuentoManual = Number(params.listaServicios[i].descuentoManual.toFixed(2));
                        }
                        else{
                            params.listaServicios[i].descuentoManual = 0;
                        }
                    }
                    else{
                        params.listaServicios[i].descuentoManual = 0;
                    }
                }
            }
            for (var i = 0; i < params.listaPaquetes.length; i++) {
                if (params.listaPaquetes[i].esVenta) {
                    params.listaPaquetes[i].descuentoManual = Number(params.listaPaquetes[i].costoOriginal) - params.listaPaquetes[i].costoDescuento - Number(params.listaPaquetes[i].descuentoPromocion);
                    params.listaPaquetes[i].descuentoManual = Number(params.listaPaquetes[i].descuentoManual.toFixed(2));
                }
            }
            for (var i = 0; i < params.listaProductos.length; i++) {
                if (params.listaProductos[i].esVenta) {
                    params.listaProductos[i].descuentoManual = Number(params.listaProductos[i].costoOriginal) - params.listaProductos[i].costoDescuento - Number(params.listaProductos[i].descuentoPromocion);
                    params.listaProductos[i].descuentoManual = Number(params.listaProductos[i].descuentoManual.toFixed(2));
                }
            }
            for (var i = 0; i < params.listaCargos.length; i++) {
                if (params.listaCargos[i].esVenta) {
                    params.listaCargos[i].descuentoManual = Number(params.listaCargos[i].costoOriginal) - params.listaCargos[i].costoElegido - Number(params.listaCargos[i].descuentoPromocion);
                    params.listaCargos[i].descuentoManual = Number(params.listaCargos[i].descuentoManual.toFixed(2));
                }
            }

            if (!this.caja.venta.fechaPago) {
                params.fechaPago = new Date();
            }
            else{
                if(this.caja.venta.fechaPago instanceof Date){
                    var dateFinal = moment(this.caja.venta.fechaPago).utc();

                    params.fechaPago = dateFinal;
                }
                else{
                    //console.log("PRUEBA IPAD 1: ENTRO EN ELSE");
                    var currentDate = new Date();
                    var currentTime = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    
                    //console.log("PRUEBA IPAD - CURRENTDATE:" + currentDate);
                    //console.log("PRUEBA IPAD - CURRENTTIME:" + currentTime);
                    
                    var fechaPagoMoment = moment(this.caja.venta.fechaPago);
                    var dateTimeString = fechaPagoMoment.format('YYYY-MM-DD') + " " + currentTime;

                    //console.log("PRUEBA IPAD - FECHAPAGOMOMENT:" + fechaPagoMoment);
                    //console.log("PRUEBA IPAD - DATETIMESTRING:" + dateTimeString);

                    // var date = new Date(dateTimeString);
                    var dateFinal = moment(dateTimeString).utc();

                    params.fechaPago = dateFinal;

                    //console.log("PRUEBA IPAD - DATEFINAL:" + dateFinal);
                }
            }

            // ---------------- Función que Guarda la venta -----------------
            this._backService.HttpPost("procesos/agenda/Agenda/guardarPagoCaja", {}, params).subscribe( (data:any) => {
                switch(data){

                    case "-1":
                        this._toaster.error("Una(s) de la(s) Promociones ya fue canjeada a la máxima cantidad posible");   
                        this._pantallaServicio.ocultarSpinner();
                        break;

                    case "-1":
                        this._toaster.error("La cita ya fue terminada o cancelada, favor de recargar la pantalla");
   
                        this._pantallaServicio.ocultarSpinner();
                        break;

                    default:
                        this._backService.HttpPost("procesos/agenda/Agenda/selectClientes", {}, {}).subscribe( (data:any) => {
                            this.caja.venta.listadoClientes = eval(data);
                            for (var i = 0; i < this.caja.venta.listadoClientes.length; i++) {
                                if (this.caja.venta.listadoClientes[i].telefono !== null && this.caja.venta.listadoClientes[i].telefono != "" && this.caja.venta.listadoClientes[i].telefono !== undefined) {
                                    this.caja.venta.listadoClientes[i].nombreBuscar = JSON.parse(JSON.stringify(this.caja.venta.listadoClientes[i].nombre)) + " - " + JSON.parse(JSON.stringify(this.caja.venta.listadoClientes[i].telefono));
                                }
                                else {
                                    this.caja.venta.listadoClientes[i].nombreBuscar = JSON.parse(JSON.stringify(this.caja.venta.listadoClientes[i].nombre));
                                }
                            }
                            this.caja.venta.listadoClientesBuffer = JSON.parse(JSON.stringify(this.caja.venta.listadoClientes));
                            this.caja_venta_limpiarVenta();
                            this.caja.venta.servicios.titulosConPrepago = false;

                            this._pantallaServicio.ocultarSpinner();
                        }, error => {
                            this.guardarError(error.error ? error.error.message : error.message, error.status, "Consultar clientes al guardar");
                        });
                }
            }, error => {
                this.guardarError(error.error ? error.error.message : error.message, error.status, "Guardar pago caja");
            });
        }
        else{
            this._pantallaServicio.ocultarSpinner();
        }
    }

    // ------------------------------------------- Realizar Pago ------------------------------------------
    dataTicket:any;
    caja_venta_pagar () {
        this._pantallaServicio.mostrarSpinner();

        var errorCertificadoRegalo = false;
        //-----Eliminar Metodos de Pago certificacion regalo donde no tenga monto --------//
        for (var i = 0; i < this.caja.venta.metodosDePago.length; i++) {
            // $("#DDMetododePagoSelect"+i).removeClass('errorCampo');
            $("#DDMetododePagoSelect" + i + " > div:first-child").attr("style", "outline: none;");
            if(this.caja.venta.metodosDePago[i].idSucursal == null){
                if(!this.caja.venta.metodosDePago[i].codigoRegalo || !this.caja.venta.metodosDePago[i].idCertificadoRegalo || !this.caja.venta.metodosDePago[i].idCertificadoRegaloUso || Number(this.caja.venta.metodosDePago[i].monto) <= 0){
                    // $("#DDMetododePagoSelect"+i).addClass("errorCampo");
                    $("#DDMetododePagoSelect" + i + " > div:first-child").attr("style", "outline: red solid 1px !important;");
                    errorCertificadoRegalo = true;
                }
            }
        }

        var errorMetodoPago = false;
        var dtprueba1 = JSON.parse(JSON.stringify(this.caja.venta.metodosDePago));
        for (var i = 0; i < this.caja.venta.metodosDePago.length; i++) {
            if(this.caja.venta.metodosDePago[i].idMetodoPagoSucursal == "" || this.caja.venta.metodosDePago[i].idMetodoPagoSucursal == null){
                // $("#DDMetododePagoSelect"+i).addClass("errorCampo");
                $("#DDMetododePagoSelect" + i + " > div:first-child").attr("style", "outline: red solid 1px !important;");
                errorMetodoPago = true;
            }
            else{
                // $("#DDMetododePagoSelect"+i).removeClass("errorCampo");
                $("#DDMetododePagoSelect" + i + " > div:first-child").attr("style", "outline: none;");
            }                       
        }

        if(errorMetodoPago == false){

            if(errorCertificadoRegalo == false){

                if(this._pantallaServicio.idSucursal == 402 || this._pantallaServicio.idSucursal == 407 || this._pantallaServicio.idSucursal == 465 || this._pantallaServicio.idSucursal == 543){

                    if ((this.caja.venta.totales.totalCobro - this.caja.venta.totales.feriaEfectivo) < (this.caja.venta.totales.total - Number(this.caja.venta.totales.totalDescuentoGeneral))) {
                        this._toaster.error("Tiene que pagar el costo total del Producto) ( " + (this.caja.venta.totales.total - this.caja.venta.totales.totalDescuentoGeneral) + " )");
                        this._pantallaServicio.ocultarSpinner();
                    }

                    else {

                        if (this.caja_venta_validacionesPropina()) {

                            // ------------------ Declaración de parámetros -----------------
                            var params:any = {};
                            params.origen = "web";
                            params.listaServicios = JSON.parse(JSON.stringify(this.caja.venta.servicios.listaServiciosPorCobrar));
                            params.listaCargos = JSON.parse(JSON.stringify(this.caja.venta.cargos.listaCargosPorCobrar));
                            params.listaPaquetes = JSON.parse(JSON.stringify(this.caja.venta.paquetes.listaPaquetesPorCobrar));
                            params.listaProductos = JSON.parse(JSON.stringify(this.caja.venta.productos.listaProductosPorCobrar));
                            params.listaCertificadosRegalo = JSON.parse(JSON.stringify(this.caja.venta.certificadoRegalo.listaCertificadosPorCobrar));
                            params.listaMetodosDePago = JSON.parse(JSON.stringify(this.caja.venta.metodosDePago));
                            params.listaPropinas = JSON.parse(JSON.stringify(this.caja.venta.propinas));
                            params.listaPromociones = this.caja.venta.promocionesNuevas.promocionesAplicadas;
                            params.fechaPagoHoraCliente = moment(this.caja.venta.fechaPago).format('YYYYMMDD HH:mm:ss');

                            //cambiar valor pesos por dolares en monto
                            if(this._pantallaServicio.idSucursal == 689 || this._pantallaServicio.idSucursal == 269){
                                for (var i = 0; i < params.listaMetodosDePago.length; i++) {
                                    if (params.listaMetodosDePago[i].descripcion == "Dolares") {
                                        params.listaMetodosDePago[i].monto = parseFloat($('#camptipocambio').val());
                                    }
                                }
                            }

                            // ------------------- Validación de cliente --------------------
                            if (this.caja.venta.cliente) {
                                params.idCliente = this.caja.venta.cliente;
                                params.nombreCliente = null;
                                params.emailCliente = null;
                                params.telefonoCliente = null;
                                params.fechaNacimientoCliente = null;
                            }
                            else {
                                params.idCliente = null;
                                params.nombreCliente = this.caja.venta.clienteNuevo.nombre ? this.caja.venta.clienteNuevo.nombre : null;
                                params.emailCliente = this.caja.venta.clienteNuevo.email ? this.caja.venta.clienteNuevo.email : null;
                                params.telefonoCliente = this.caja.venta.clienteNuevo.telefono ? this.caja.venta.clienteNuevo.telefono : null;
                                params.fechaNacimientoCliente = this.caja.venta.clienteNuevo.fechaNacimiento ? moment(this.caja.venta.clienteNuevo.fechaNacimiento).format("YYYY-MM-DD") : null;
                            }

                            // ----------------- Obtener el costo original de cada venta y declaración del descuento por promoción ----------------
                            for (var i = 0; i < params.listaServicios.length; i++) {
                                if (params.listaServicios[i].esVenta) {
                                    params.listaServicios[i].costoOriginal = params.listaServicios[i].costoElegido;
                                    params.listaServicios[i].descuentoPromocion = 0;
                                }
                            }

                            for (var i = 0; i < params.listaPaquetes.length; i++) {
                                if (params.listaPaquetes[i].esVenta) {
                                    params.listaPaquetes[i].costoOriginal = params.listaPaquetes[i].costoElegido;
                                    params.listaPaquetes[i].descuentoPromocion = 0;
                                }
                            }

                            for (var i = 0; i < params.listaProductos.length; i++) {
                                if (params.listaProductos[i].esVenta) {
                                    params.listaProductos[i].costoOriginal = params.listaProductos[i].costoElegido;
                                    params.listaProductos[i].descuentoPromocion = 0;
                                }
                            }

                            for (var i = 0; i < params.listaCargos.length; i++) {
                                if (params.listaCargos[i].esVenta) {
                                    params.listaCargos[i].costoOriginal = params.listaCargos[i].costoElegido;
                                    params.listaCargos[i].descuentoPromocion = 0;
                                }
                            }

                            for (var i = 0; i < params.listaCertificadosRegalo.length; i++) {
                                if (params.listaCertificadosRegalo[i].esVenta) {
                                    params.listaCertificadosRegalo[i].costoOriginal = params.listaCertificadosRegalo[i].costoElegido;
                                    params.listaCertificadosRegalo[i].descuentoPromocion = 0;
                                }
                            }

                            // ------- Aplicación del descuento en Servicios y Productos de las Promociones y obtención del total de descuento por promociones -------
                            for(var i = 0; i < params.listaServicios.length; i++){
                                if (params.listaServicios[i].esVenta) {
                                    if (params.listaServicios[i].idPagoClienteDetalle == null) {
                                        params.listaServicios[i].promocionesAplicadas = "";
                                        params.listaServicios[i].canjes = "";
                                        for(var j = 0; j < params.listaServicios[i].promociones.length; j++){
                                            params.listaServicios[i].costoDescuento -= params.listaServicios[i].promociones[j].descuento;
                                            params.listaServicios[i].costoDescuento = Number(params.listaServicios[i].costoDescuento.toFixed(2));
                                            params.listaServicios[i].descuentoPromocion += params.listaServicios[i].promociones[j].descuento;
                                            params.listaServicios[i].descuentoPromocion = Number(params.listaServicios[i].descuentoPromocion.toFixed(2));
                                            params.listaServicios[i].promocionesAplicadas += params.listaServicios[i].promociones[j].idPromocionAplicada + ",";
                                            if(params.listaServicios[i].promociones[j].idPromocionSucursalNuevaAplicacionValorPendienteCliente){
                                                params.listaServicios[i].canjes += params.listaServicios[i].promociones[j].idPromocionSucursalNuevaAplicacionValorPendienteCliente + ",";
                                            }
                                        }
                                    }
                                    else{
                                        params.listaServicios[i].promocionesAplicadas = "";
                                        params.listaServicios[i].canjes = "";
                                    }
                                }
                            }

                            for(var i = 0; i < params.listaProductos.length; i++){
                                if (params.listaProductos[i].esVenta) {
                                    params.listaProductos[i].promocionesAplicadas = "";
                                    params.listaProductos[i].promocionesAplicadasCantidadProducto = "";
                                    params.listaProductos[i].canjes = "";
                                    for(var j = 0; j < params.listaProductos[i].promociones.length; j++){
                                        params.listaProductos[i].costoDescuento -= params.listaProductos[i].promociones[j].descuento;
                                        params.listaProductos[i].costoDescuento = Number(params.listaProductos[i].costoDescuento.toFixed(2));
                                        params.listaProductos[i].descuentoPromocion += params.listaProductos[i].promociones[j].descuento;
                                        params.listaProductos[i].descuentoPromocion = Number(params.listaProductos[i].descuentoPromocion.toFixed(2));
                                        params.listaProductos[i].promocionesAplicadas += params.listaProductos[i].promociones[j].idPromocionAplicada + ",";
                                        params.listaProductos[i].promocionesAplicadasCantidadProducto += params.listaProductos[i].promociones[j].cantidadProductos + ",";
                                        if(params.listaProductos[i].promociones[j].idPromocionSucursalNuevaAplicacionValorPendienteCliente){
                                            params.listaProductos[i].canjes += params.listaProductos[i].promociones[j].idPromocionSucursalNuevaAplicacionValorPendienteCliente + ",";
                                        }
                                    }
                                }
                            }

                            // ---------------------- Descuento General ---------------------
                            if (this.caja.venta.totales.descuentoF.toString() != "0") {

                                // -- Como el descuento se hace sobre el total, se tiene que determinar cuanto descuento 
                                // -- se le quitara a cada servicio, cargo, paquete y producto que formen parte de la venta
                                var cuentasCaja = 0;
                                for (var i = 0; i < params.listaServicios.length; i++) {
                                    if (params.listaServicios[i].esVenta) {
                                        if (params.listaServicios[i].idPagoClienteDetalle == null) {
                                            cuentasCaja++;
                                        }
                                    }
                                }
                                for (var i = 0; i < params.listaPaquetes.length; i++) {
                                    if (params.listaPaquetes[i].esVenta) {
                                        cuentasCaja++;
                                    }
                                }
                                for (var i = 0; i < params.listaProductos.length; i++) {
                                    if (params.listaProductos[i].esVenta) {
                                        cuentasCaja++;
                                    }
                                }
                                for (var i = 0; i < params.listaCargos.length; i++) {
                                    if (params.listaCargos[i].esVenta) {
                                        cuentasCaja++;
                                    }
                                }
                                for (var i = 0; i < params.listaCertificadosRegalo.length; i++) {
                                    if (params.listaCertificadosRegalo[i].esVenta) {
                                        cuentasCaja++;
                                    }
                                }
                                var descuentoGeneral = Number((Number(this.caja.venta.totales.descuentoF) / cuentasCaja).toFixed(2));
                                var descuentoNoAplicado = Number((Number(this.caja.venta.totales.descuentoF) - (descuentoGeneral * cuentasCaja)).toFixed(2));

                                // -- Se descuenta lo calculado en la parte de servicios.
                                // -- Si el descuento calculado para cada registro es mayor al monto del registro en sí, se suma en una variable para 
                                // -- descontarlo en el siguiente registro, si este proceso continua, el faltante se irá sumando y restando en donde 
                                // -- sea posible.

                                // -- Parte de Servicios
                                for (var i = 0; i < params.listaServicios.length; i++) {
                                    if (params.listaServicios[i].esVenta) {
                                        if (params.listaServicios[i].idPagoClienteDetalle == null) {
                                            params.listaServicios[i].costoDescuento = Number(params.listaServicios[i].costoDescuento);

                                            if (Number((params.listaServicios[i].costoDescuento - descuentoGeneral).toFixed(2)) < 0) {
                                                descuentoNoAplicado = Number((descuentoNoAplicado + descuentoGeneral - params.listaServicios[i].costoDescuento).toFixed(2));
                                                params.listaServicios[i].costoDescuento = 0;
                                            }
                                            else {
                                                params.listaServicios[i].costoDescuento = Number((params.listaServicios[i].costoDescuento - descuentoGeneral).toFixed(2));
                                                if (descuentoNoAplicado != 0) {
                                                    if (Number((params.listaServicios[i].costoDescuento - descuentoNoAplicado).toFixed(2)) < 0) {
                                                        descuentoNoAplicado = Number((descuentoNoAplicado - params.listaServicios[i].costoDescuento).toFixed(2));
                                                        params.listaServicios[i].costoDescuento = 0;
                                                    }
                                                    else {
                                                        params.listaServicios[i].costoDescuento = Number((params.listaServicios[i].costoDescuento - descuentoNoAplicado).toFixed(2));
                                                        descuentoNoAplicado = 0;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }

                                // -- Parte de Paquetes
                                for (var i = 0; i < params.listaPaquetes.length; i++) {
                                    if (params.listaPaquetes[i].esVenta) {

                                        params.listaPaquetes[i].costoDescuento = Number(params.listaPaquetes[i].costoDescuento);

                                        if (Number((params.listaPaquetes[i].costoDescuento - descuentoGeneral).toFixed(2)) < 0) {
                                            descuentoNoAplicado = Number((descuentoNoAplicado + descuentoGeneral - params.listaPaquetes[i].costoDescuento).toFixed(2));
                                            params.listaPaquetes[i].costoDescuento = 0;
                                        }
                                        else {
                                            params.listaPaquetes[i].costoDescuento = Number((params.listaPaquetes[i].costoDescuento - descuentoGeneral).toFixed(2));
                                            if (descuentoNoAplicado != 0) {
                                                if (Number((params.listaPaquetes[i].costoDescuento - descuentoNoAplicado).toFixed(2)) < 0) {
                                                    descuentoNoAplicado = Number((descuentoNoAplicado - params.listaPaquetes[i].costoDescuento).toFixed(2));
                                                    params.listaPaquetes[i].costoDescuento = 0;
                                                }
                                                else {
                                                    params.listaPaquetes[i].costoDescuento = Number((params.listaPaquetes[i].costoDescuento - descuentoNoAplicado).toFixed(2));
                                                    descuentoNoAplicado = 0;
                                                }
                                            }
                                        }
                                    }
                                }

                                // -- Parte de Productos
                                for (var i = 0; i < params.listaProductos.length; i++) {
                                    if (params.listaProductos[i].esVenta) {

                                        params.listaProductos[i].costoDescuento = Number(params.listaProductos[i].costoDescuento);

                                        if (Number((params.listaProductos[i].costoDescuento - descuentoGeneral).toFixed(2)) < 0) {
                                            descuentoNoAplicado = Number((descuentoNoAplicado + descuentoGeneral - params.listaProductos[i].costoDescuento).toFixed(2));
                                            params.listaProductos[i].costoDescuento = 0;
                                        }
                                        else {
                                            params.listaProductos[i].costoDescuento = Number((params.listaProductos[i].costoDescuento - descuentoGeneral).toFixed(2));
                                            if (descuentoNoAplicado != 0) {
                                                if (Number((params.listaProductos[i].costoDescuento - descuentoNoAplicado).toFixed(2)) < 0) {
                                                    descuentoNoAplicado = Number((descuentoNoAplicado - params.listaProductos[i].costoDescuento).toFixed(2));
                                                    params.listaProductos[i].costoDescuento = 0;
                                                }
                                                else {
                                                    params.listaProductos[i].costoDescuento = Number((params.listaProductos[i].costoDescuento - descuentoNoAplicado).toFixed(2));
                                                    descuentoNoAplicado = 0;
                                                }
                                            }
                                        }
                                    }
                                }

                                // -- Parte de Cargos
                                for (var i = 0; i < params.listaCargos.length; i++) {
                                    if (params.listaCargos[i].esVenta) {

                                        params.listaCargos[i].costoElegido = Number(params.listaCargos[i].costoElegido);

                                        if (Number((params.listaCargos[i].costoElegido - descuentoGeneral).toFixed(2)) < 0) {
                                            descuentoNoAplicado = Number((descuentoNoAplicado + descuentoGeneral - params.listaCargos[i].costoElegido).toFixed(2));
                                            params.listaCargos[i].costoElegido = 0;
                                        }
                                        else {
                                            params.listaCargos[i].costoElegido = Number((params.listaCargos[i].costoElegido - descuentoGeneral).toFixed(2));
                                            if (descuentoNoAplicado != 0) {
                                                if (Number((params.listaCargos[i].costoElegido - descuentoNoAplicado).toFixed(2)) < 0) {
                                                    descuentoNoAplicado = Number((descuentoNoAplicado - params.listaCargos[i].costoElegido).toFixed(2));
                                                    params.listaCargos[i].costoElegido = 0;
                                                }
                                                else {
                                                    params.listaCargos[i].costoElegido = Number((params.listaCargos[i].costoElegido - descuentoNoAplicado).toFixed(2));                                        
                                                    descuentoNoAplicado = 0;
                                                }
                                            }
                                        }
                                    }
                                }

                                // -- Parte de Certificados Regalo
                                for (var i = 0; i < params.listaCertificadosRegalo.length; i++) {
                                    if (params.listaCertificadosRegalo[i].esVenta) {

                                        params.listaCertificadosRegalo[i].costoDescuento = Number(params.listaCertificadosRegalo[i].costoDescuento);

                                        if (Number((params.listaCertificadosRegalo[i].costoDescuento - descuentoGeneral).toFixed(2)) < 0) {
                                            descuentoNoAplicado = Number((descuentoNoAplicado + descuentoGeneral - params.listaCertificadosRegalo[i].costoDescuento).toFixed(2));
                                            params.listaCertificadosRegalo[i].costoDescuento = 0;
                                        }
                                        else {
                                            params.listaCertificadosRegalo[i].costoDescuento = Number((params.listaCertificadosRegalo[i].costoDescuento - descuentoGeneral).toFixed(2));
                                            if (descuentoNoAplicado != 0) {
                                                if (Number((params.listaCertificadosRegalo[i].costoDescuento - descuentoNoAplicado).toFixed(2)) < 0) {
                                                    descuentoNoAplicado = Number((descuentoNoAplicado - params.listaCertificadosRegalo[i].costoDescuento).toFixed(2));
                                                    params.listaCertificadosRegalo[i].costoDescuento = 0;
                                                }
                                                else {
                                                    params.listaCertificadosRegalo[i].costoDescuento = Number((params.listaCertificadosRegalo[i].costoDescuento - descuentoNoAplicado).toFixed(2));
                                                    descuentoNoAplicado = 0;
                                                }
                                            }
                                        }
                                    }
                                }

                                // Si aun quedaron descuentos no aplicados, se vuelve a reccorrer todo y se descuenta en la primera venta posible
                                if (descuentoNoAplicado != 0) {
                                    for (var i = 0; i < params.listaServicios.length; i++) {
                                        if (params.listaServicios[i].esVenta) {
                                            if (params.listaServicios[i].idPagoClienteDetalle == null) {
                                                if (Number((params.listaServicios[i].costoDescuento - descuentoNoAplicado).toFixed(2)) < 0) {
                                                    descuentoNoAplicado = Number((descuentoNoAplicado - params.listaServicios[i].costoDescuento).toFixed(2));
                                                    params.listaServicios[i].costoDescuento = 0;
                                                }
                                                else {
                                                    params.listaServicios[i].costoDescuento = Number((params.listaServicios[i].costoDescuento - descuentoNoAplicado).toFixed(2));
                                                    descuentoNoAplicado = 0;
                                                }
                                            }
                                        }
                                    }
                                }

                                if (descuentoNoAplicado != 0) {
                                    for (var i = 0; i < params.listaPaquetes.length; i++) {
                                        if (params.listaPaquetes[i].esVenta) {
                                            if (Number((params.listaPaquetes[i].costoDescuento - descuentoNoAplicado).toFixed(2)) < 0) {
                                                descuentoNoAplicado = Number((descuentoNoAplicado - params.listaPaquetes[i].costoDescuento).toFixed(2));
                                                params.listaPaquetes[i].costoDescuento = 0;
                                            }
                                            else {
                                                params.listaPaquetes[i].costoDescuento = Number((params.listaPaquetes[i].costoDescuento - descuentoNoAplicado).toFixed(2));
                                                descuentoNoAplicado = 0;
                                            }
                                        }
                                    }
                                }

                                if (descuentoNoAplicado != 0) {
                                    for (var i = 0; i < params.listaProductos.length; i++) {
                                        if (params.listaProductos[i].esVenta) {
                                            if (Number((params.listaProductos[i].costoDescuento - descuentoNoAplicado).toFixed(2)) < 0) {
                                                descuentoNoAplicado = Number((descuentoNoAplicado - params.listaProductos[i].costoDescuento).toFixed(2));
                                                params.listaProductos[i].costoDescuento = 0;
                                            }
                                            else {
                                                params.listaProductos[i].costoDescuento = Number((params.listaProductos[i].costoDescuento - descuentoNoAplicado).toFixed(2));
                                                descuentoNoAplicado = 0;
                                            }
                                        }
                                    }
                                }

                                if (descuentoNoAplicado != 0) {
                                    for (var i = 0; i < params.listaCargos.length; i++) {
                                        if (params.listaCargos[i].esVenta) {
                                            if (Number((params.listaCargos[i].costoElegido - descuentoNoAplicado).toFixed(2)) < 0) {
                                                descuentoNoAplicado = Number((descuentoNoAplicado - params.listaCargos[i].costoElegido).toFixed(2));
                                                params.listaCargos[i].costoElegido = 0;
                                            }
                                            else {
                                                params.listaCargos[i].costoElegido = Number((params.listaCargos[i].costoElegido - descuentoNoAplicado).toFixed(2));
                                                descuentoNoAplicado = 0;
                                            }
                                        }
                                    }
                                }

                                if (descuentoNoAplicado != 0) {
                                    for (var i = 0; i < params.listaCertificadosRegalo.length; i++) {
                                        if (params.listaCertificadosRegalo[i].esVenta) {
                                            if (Number((params.listaCertificadosRegalo[i].costoDescuento - descuentoNoAplicado).toFixed(2)) < 0) {
                                                descuentoNoAplicado = Number((descuentoNoAplicado - params.listaCertificadosRegalo[i].costoDescuento).toFixed(2));
                                                params.listaCertificadosRegalo[i].costoDescuento = 0;
                                            }
                                            else {
                                                params.listaCertificadosRegalo[i].costoDescuento = Number((params.listaCertificadosRegalo[i].costoDescuento - descuentoNoAplicado).toFixed(2));
                                                descuentoNoAplicado = 0;
                                            }
                                        }
                                    }
                                }

                            }

                            // ----------------- Obtener el descuento Manual y General de las ventas ----------------
                            for (var i = 0; i < params.listaServicios.length; i++) {
                                if (params.listaServicios[i].esVenta) {
                                    if (params.listaServicios[i].idPagoClienteDetalle == null) {
                                        if (params.listaServicios[i].idPaqueteSucursalCliente == null) {
                                            params.listaServicios[i].descuentoManual = Number(params.listaServicios[i].costoOriginal) - params.listaServicios[i].costoDescuento - Number(params.listaServicios[i].descuentoPromocion);
                                            params.listaServicios[i].descuentoManual = Number(params.listaServicios[i].descuentoManual.toFixed(2));
                                        }
                                        else{
                                            params.listaServicios[i].descuentoManual = 0;
                                        }
                                    }
                                    else{
                                        params.listaServicios[i].descuentoManual = 0;
                                    }
                                }
                            }

                            for (var i = 0; i < params.listaPaquetes.length; i++) {
                                if (params.listaPaquetes[i].esVenta) {
                                    params.listaPaquetes[i].descuentoManual = Number(params.listaPaquetes[i].costoOriginal) - params.listaPaquetes[i].costoDescuento - Number(params.listaPaquetes[i].descuentoPromocion);
                                    params.listaPaquetes[i].descuentoManual = Number(params.listaPaquetes[i].descuentoManual.toFixed(2));
                                }
                            }

                            for (var i = 0; i < params.listaProductos.length; i++) {
                                if (params.listaProductos[i].esVenta) {
                                    params.listaProductos[i].descuentoManual = Number(params.listaProductos[i].costoOriginal) - params.listaProductos[i].costoDescuento - Number(params.listaProductos[i].descuentoPromocion);
                                    params.listaProductos[i].descuentoManual = Number(params.listaProductos[i].descuentoManual.toFixed(2));
                                }
                            }

                            for (var i = 0; i < params.listaCargos.length; i++) {
                                if (params.listaCargos[i].esVenta) {
                                    params.listaCargos[i].descuentoManual = Number(params.listaCargos[i].costoOriginal) - params.listaCargos[i].costoElegido - Number(params.listaCargos[i].descuentoPromocion);
                                    params.listaCargos[i].descuentoManual = Number(params.listaCargos[i].descuentoManual.toFixed(2));
                                }
                            }

                            for (var i = 0; i < params.listaCertificadosRegalo.length; i++) {
                                if (params.listaCertificadosRegalo[i].esVenta) {
                                    params.listaCertificadosRegalo[i].descuentoManual = Number(params.listaCertificadosRegalo[i].costoOriginal) - params.listaCertificadosRegalo[i].costoDescuento - Number(params.listaCertificadosRegalo[i].descuentoPromocion);
                                    params.listaCertificadosRegalo[i].descuentoManual = Number(params.listaCertificadosRegalo[i].descuentoManual.toFixed(2));
                                }
                            }

                            // --------------------- Apartado de Feria ----------------------
                            // Resta la cantidad de feria de los montos y montos con comisiones de métodos de pago
                            var totalCobrado = 0;
                            var feriaRestante = Number(this.caja.venta.totales.feriaEfectivo);

                            for (var i = 0; i < params.listaMetodosDePago.length; i++) {
                                if (params.listaMetodosDePago[i].isEfectivo) {
                                    if(Number((Number(params.listaMetodosDePago[i].monto) - feriaRestante).toFixed(2)) < 0){
                                        feriaRestante = Number((feriaRestante - Number(params.listaMetodosDePago[i].monto)).toFixed(2));
                                        params.listaMetodosDePago[i].monto = 0;
                                        params.listaMetodosDePago[i].pagoComision = 0;
                                    }
                                    else{
                                        params.listaMetodosDePago[i].monto = Number((Number(params.listaMetodosDePago[i].monto) - feriaRestante).toFixed(2));
                                        params.listaMetodosDePago[i].pagoComision = 0;

                                        if(Number(params.listaMetodosDePago[i].comision) != 0){
                                            params.listaMetodosDePago[i].pagoComision = Number(params.listaMetodosDePago[i].comision);
                                        }

                                        if(Number(params.listaMetodosDePago[i].comisionPorcentual) != 0){
                                            params.listaMetodosDePago[i].pagoComision = Number((Number(params.listaMetodosDePago[i].monto) * (Number(params.listaMetodosDePago[i].comisionPorcentual) / 100)).toFixed(2));
                                        }

                                        feriaRestante = 0;
                                    }
                                }
                            }

                            // -------------- Liquidación de cuentas por cobrar -------------
                            // No se utiliza la var que está en totales porque se tiene que tomar en cuenta lo de la propina que se quito en el apartado anterior
                            for (var i = 0; i < params.listaMetodosDePago.length; i++) {
                                totalCobrado = Number((totalCobrado + Number(params.listaMetodosDePago[i].monto)).toFixed(2));
                            }

                            for (var i = 0; i < params.listaServicios.length; i++) {
                                if (params.listaServicios[i].esCuentaPagar) {
                                    if (Number((totalCobrado - Number(params.listaServicios[i].costoDescuento)).toFixed(2)) < 0) {
                                        params.listaServicios[i].saldo = Number((Number(params.listaServicios[i].costoDescuento) - totalCobrado).toFixed(2));
                                        totalCobrado = 0;
                                        params.listaServicios[i].montoPorAbonar = Number((Number(params.listaServicios[i].costoDescuento) - params.listaServicios[i].saldo).toFixed(2));
                                    }
                                    else {
                                        params.listaServicios[i].saldo = 0;
                                        totalCobrado = Number((totalCobrado - Number(params.listaServicios[i].costoDescuento)).toFixed(2));
                                        params.listaServicios[i].montoPorAbonar = Number(params.listaServicios[i].costoDescuento);
                                    }
                                }
                            }

                            for (var i = 0; i < params.listaPaquetes.length; i++) {
                                if (params.listaPaquetes[i].esCuentaPagar) {
                                    if (Number((totalCobrado - Number(params.listaPaquetes[i].costoDescuento)).toFixed(2)) < 0) {
                                        params.listaPaquetes[i].saldo = Number((Number(params.listaPaquetes[i].costoDescuento) - totalCobrado).toFixed(2));
                                        totalCobrado = 0;
                                        params.listaPaquetes[i].montoPorAbonar = Number((Number(params.listaPaquetes[i].costoDescuento) - params.listaPaquetes[i].saldo).toFixed(2));
                                    }
                                    else {
                                        params.listaPaquetes[i].saldo = 0;
                                        totalCobrado = Number((totalCobrado - Number(params.listaPaquetes[i].costoDescuento)).toFixed(2));
                                        params.listaPaquetes[i].montoPorAbonar = Number(params.listaPaquetes[i].costoDescuento);
                                    }
                                }
                            }

                            for (var i = 0; i < params.listaProductos.length; i++) {
                                if (params.listaProductos[i].esCuentaPagar) {
                                    if (Number((totalCobrado - Number(params.listaProductos[i].costoDescuento)).toFixed(2)) < 0) {
                                        params.listaProductos[i].saldo = Number((Number(params.listaProductos[i].costoDescuento) - totalCobrado).toFixed(2));
                                        totalCobrado = 0;
                                        params.listaProductos[i].montoPorAbonar = Number((Number(params.listaProductos[i].costoDescuento) - params.listaProductos[i].saldo).toFixed(2));
                                    }
                                    else {
                                        params.listaProductos[i].saldo = 0;
                                        totalCobrado = Number((totalCobrado - Number(params.listaProductos[i].costoDescuento)).toFixed(2));
                                        params.listaProductos[i].montoPorAbonar = Number(params.listaProductos[i].costoDescuento);
                                    }
                                }
                            }

                            for (var i = 0; i < params.listaCargos.length; i++) {
                                if (params.listaCargos[i].esCuentaPagar) {
                                    if (Number((totalCobrado - Number(params.listaCargos[i].costoElegido)).toFixed(2)) < 0) {
                                        params.listaCargos[i].saldo = Number((Number(params.listaCargos[i].costoElegido) - totalCobrado).toFixed(2));
                                        totalCobrado = 0;
                                        params.listaCargos[i].montoPorAbonar = Number((Number(params.listaCargos[i].costoElegido) - params.listaCargos[i].saldo).toFixed(2));
                                    }
                                    else {
                                        params.listaCargos[i].saldo = 0;
                                        totalCobrado = Number((totalCobrado - Number(params.listaCargos[i].costoElegido)).toFixed(2));
                                        params.listaCargos[i].montoPorAbonar = Number(params.listaCargos[i].costoElegido);
                                    }
                                }
                            }

                            // -------------------- Liquidación de ventas -------------------

                            // -- Para Certificado de Regalo
                            for (var i = 0; i < params.listaCertificadosRegalo.length; i++) {
                                if (params.listaCertificadosRegalo[i].esVenta) {
                                    if (Number((totalCobrado - Number(params.listaCertificadosRegalo[i].costoDescuento)).toFixed(2)) < 0) {
                                        params.listaCertificadosRegalo[i].saldo = Number((Number(params.listaCertificadosRegalo[i].costoDescuento) - totalCobrado).toFixed(2));
                                        totalCobrado = 0;
                                        params.listaCertificadosRegalo[i].montoPorAbonar = Number((Number(params.listaCertificadosRegalo[i].costoDescuento) - params.listaCertificadosRegalo[i].saldo).toFixed(2));
                                    }
                                    else {
                                        params.listaCertificadosRegalo[i].saldo = 0;
                                        totalCobrado = Number((totalCobrado - Number(params.listaCertificadosRegalo[i].costoDescuento)).toFixed(2));
                                        params.listaCertificadosRegalo[i].montoPorAbonar = Number(params.listaCertificadosRegalo[i].costoDescuento);
                                    }
                                }
                            }

                            for (var i = 0; i < params.listaServicios.length; i++) {
                                if (params.listaServicios[i].esVenta) {
                                    if (params.listaServicios[i].idPaqueteSucursalCliente == null) {
                                        if (Number((totalCobrado - Number(params.listaServicios[i].costoDescuento)).toFixed(2)) < 0) {
                                            params.listaServicios[i].saldo = Number((Number(params.listaServicios[i].costoDescuento) - totalCobrado).toFixed(2));
                                            totalCobrado = 0;
                                            params.listaServicios[i].montoPorAbonar = Number((Number(params.listaServicios[i].costoDescuento) - params.listaServicios[i].saldo).toFixed(2));
                                        }
                                        else {
                                            params.listaServicios[i].saldo = 0;
                                            totalCobrado = Number((totalCobrado - Number(params.listaServicios[i].costoDescuento)).toFixed(2));
                                            params.listaServicios[i].montoPorAbonar = Number(params.listaServicios[i].costoDescuento);
                                        }
                                    }
                                    else{
                                        params.listaServicios[i].saldo = 0;
                                        params.listaServicios[i].montoPorAbonar = 0;
                                    }
                                }
                            }

                            for (var i = 0; i < params.listaPaquetes.length; i++) {
                                if (params.listaPaquetes[i].esVenta) {
                                    if (Number((totalCobrado - Number(params.listaPaquetes[i].costoDescuento)).toFixed(2)) < 0) {
                                        params.listaPaquetes[i].saldo = Number((Number(params.listaPaquetes[i].costoDescuento) - totalCobrado).toFixed(2));
                                        totalCobrado = 0;
                                        params.listaPaquetes[i].montoPorAbonar = Number((Number(params.listaPaquetes[i].costoDescuento) - params.listaPaquetes[i].saldo).toFixed(2));
                                    }
                                    else {
                                        params.listaPaquetes[i].saldo = 0;
                                        totalCobrado = Number((totalCobrado - Number(params.listaPaquetes[i].costoDescuento)).toFixed(2));
                                        params.listaPaquetes[i].montoPorAbonar = Number(params.listaPaquetes[i].costoDescuento);
                                    }
                                }
                            }

                            for (var i = 0; i < params.listaProductos.length; i++) {
                                if (params.listaProductos[i].esVenta) {
                                    if (Number((totalCobrado - Number(params.listaProductos[i].costoDescuento)).toFixed(2)) < 0) {
                                        params.listaProductos[i].saldo = Number((Number(params.listaProductos[i].costoDescuento) - totalCobrado).toFixed(2));
                                        totalCobrado = 0;
                                        params.listaProductos[i].montoPorAbonar = Number((Number(params.listaProductos[i].costoDescuento) - params.listaProductos[i].saldo).toFixed(2));
                                    }
                                    else {
                                        params.listaProductos[i].saldo = 0;
                                        totalCobrado = Number((totalCobrado - Number(params.listaProductos[i].costoDescuento)).toFixed(2));
                                        params.listaProductos[i].montoPorAbonar = Number(params.listaProductos[i].costoDescuento);
                                    }
                                }
                            }

                            for (var i = 0; i < params.listaCargos.length; i++) {
                                if (params.listaCargos[i].esVenta) {
                                    if (Number((totalCobrado - Number(params.listaCargos[i].costoElegido)).toFixed(2)) < 0) {
                                        params.listaCargos[i].saldo = Number((Number(params.listaCargos[i].costoElegido) - Number(totalCobrado)).toFixed(2));
                                        totalCobrado = 0;
                                        params.listaCargos[i].montoPorAbonar = Number((Number(params.listaCargos[i].costoElegido) - params.listaCargos[i].saldo).toFixed(2));
                                    }
                                    else {
                                        params.listaCargos[i].saldo = 0;
                                        totalCobrado = Number((totalCobrado - Number(params.listaCargos[i].costoElegido)).toFixed(2));
                                        params.listaCargos[i].montoPorAbonar = Number(params.listaCargos[i].costoElegido);
                                    }
                                }
                            }

                            // --------------- Propinas como Métodos de Pagos ---------------
                            for (var i = 0; i < params.listaPropinas.length; i++) {
                                params.listaMetodosDePago.push({
                                    monto: params.listaPropinas[i].total,
                                    idMetodoPagoSucursal: params.listaPropinas[i].idMetodoPagoSucursal,
                                    digitos: "",
                                    pagoComision: params.listaPropinas[i].propinaComision,
                                    idCertificadoRegaloUso: ""
                                });
                            }

                            // ------------------ Cargo concepto comisiones -----------------
                            var diferenciaComision = 0;
                            for (var i = 0; i < params.listaMetodosDePago.length; i++) {
                                diferenciaComision = Number((diferenciaComision + Number(params.listaMetodosDePago[i].pagoComision)).toFixed(2));
                            }

                            if(diferenciaComision != 0){
                                params.listaCargos.push({
                                    descripcion: "Comisión por Métodos de Pago/Propinas",
                                    costoElegido: diferenciaComision,
                                    esVenta: true,
                                    esCuentaPagar: false,
                                    idPagoClienteDetalle: null,
                                    saldo: 0,
                                    montoPorAbonar: diferenciaComision,
                                    descuentoManual: 0,
                                    descuentoPromocion: 0
                                });
                            }

                            if (!this.caja.venta.fechaPago) {
                                params.fechaPago = moment(new Date()).utc();
                            }
                            else{
                                if(this.caja.venta.fechaPago instanceof Date){
                                    var dateFinal = moment(this.caja.venta.fechaPago).utc();
                
                                    params.fechaPago = dateFinal;
                                }
                                else{
                                    //console.log("PRUEBA IPAD 2: ENTRO EN ELSE");
                                    var currentDate = new Date();
                                    var currentTime = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                    
                                    //console.log("PRUEBA IPAD - CURRENTDATE:" + currentDate);
                                    //console.log("PRUEBA IPAD - CURRENTTIME:" + currentTime);
                                    
                                    var fechaPagoMoment = moment(this.caja.venta.fechaPago);
                                    var dateTimeString = fechaPagoMoment.format('YYYY-MM-DD') + " " + currentTime;

                                    //console.log("PRUEBA IPAD - FECHAPAGOMOMENT:" + fechaPagoMoment);
                                    //console.log("PRUEBA IPAD - DATETIMESTRING:" + dateTimeString);

                                    // var date = new Date(dateTimeString);
                                    var dateFinal = moment(dateTimeString).utc();

                                    params.fechaPago = dateFinal;

                                    //console.log("PRUEBA IPAD - DATEFINAL:" + dateFinal);
                                }
                            }

                            // -------------- Pago total certificado de regalo --------------
                            var errorValidacionPago = true;
                            for (var i = 0; i < params.listaCertificadosRegalo.length; i++) {
                                if(params.listaCertificadosRegalo[i].saldo > 0){
                                    errorValidacionPago = false;
                                }
                            }

                            // ------------------- Tipo de Cambio ---------------------- //
                            params.valortipocambio = 0; 
                            if(this._pantallaServicio.idSucursal == 689 && params.listaMetodosDePago[0].descripcion == "Dolares" || this._pantallaServicio.idSucursal == 269 && params.listaMetodosDePago[0].descripcion == "Dolares"){
                                params.valortipocambio = $("#camptipocambio2").val(); 
                            }

                            if(errorValidacionPago){
                                // ------------------- Función que hace el Pago -----------------
                                this._backService.HttpPost("procesos/agenda/Agenda/pagarCaja", {}, params).subscribe( (data:any) => {
                                    this.caja.venta.folioAux = data;

                                    switch(this.caja.venta.folioAux){

                                        case "-1":
                                            this._toaster.error("Una(s) de la(s) Promociones ya fue canjeada a la máxima cantidad posible");

                                            this._pantallaServicio.ocultarSpinner();
                                            break;

                                        case "-2":
                                            this._toaster.error("La cita ya está terminada o cancelada, favor de recargar la pantalla");

                                            this._pantallaServicio.ocultarSpinner();
                                            break;

                                        case "-1e":
                                            this._toaster.error("No hay certificados disponibles para vender, favor de recargar la pantalla");

                                            this._pantallaServicio.ocultarSpinner();
                                            break;

                                        case "-2e":
                                            this._toaster.error("Uno de los códigos de Certificado de Regalo ya se encuentra en uso");

                                            this._pantallaServicio.ocultarSpinner();
                                            break;

                                        default:
                                            this._backService.HttpPost("procesos/agenda/Agenda/selectClientes", {}, {}).subscribe( (data:any) => {
                                                this.caja.venta.listadoClientes = eval(data);
                                                for (var i = 0; i < this.caja.venta.listadoClientes.length; i++) {
                                                    if (this.caja.venta.listadoClientes[i].telefono !== null && this.caja.venta.listadoClientes[i].telefono != "" && this.caja.venta.listadoClientes[i].telefono !== undefined) {
                                                        this.caja.venta.listadoClientes[i].nombreBuscar = JSON.parse(JSON.stringify(this.caja.venta.listadoClientes[i].nombre)) + " - " + JSON.parse(JSON.stringify(this.caja.venta.listadoClientes[i].telefono));
                                                    }
                                                    else {
                                                        this.caja.venta.listadoClientes[i].nombreBuscar = JSON.parse(JSON.stringify(this.caja.venta.listadoClientes[i].nombre));
                                                    }
                                                }
                                                this.caja.venta.listadoClientesBuffer = JSON.parse(JSON.stringify(this.caja.venta.listadoClientes));

                                                this._ticketService.caja_movimientos_mostrarTicketFolioPago(this.caja.venta.folioAux);
                                            }, error => {
                                                this.guardarError(error.error ? error.error.message : error.message, error.status, "Consultar clientes al pagar");
                                            });
                                            break;
                                    }
                                }, error => {
                                    this.guardarError(error.error ? error.error.message : error.message, error.status, "Pagar caja");
                                    this._pantallaServicio.ocultarSpinner();
                                });
                            }
                            else{
                                this._toaster.error("No se realizó la venta debido a que no se completó el pago de uno/s de los Certificados de Regalo ");
                                this._pantallaServicio.ocultarSpinner();
                            }
                        }
                        else{
                            this._pantallaServicio.ocultarSpinner();
                        }

                    }

                }

                else {

                    if ((this.caja.venta.totales.totalCobro - this.caja.venta.totales.feriaEfectivo) > (this.caja.venta.totales.total - Number(this.caja.venta.totales.totalDescuentoGeneral))) {
                        this._toaster.error("El Cobro(menos Cambio) no puede ser mayor al Total (menos Propina y Comisiones) ( " + (this.caja.venta.totales.total - this.caja.venta.totales.totalDescuentoGeneral) + " )");
                        this._pantallaServicio.ocultarSpinner();
                    }
                    else {

                        if (this.caja_venta_validacionesPropina()) {

                            // ------------------ Declaración de parámetros -----------------
                            var params:any = {};
                            params.origen = "web";
                            params.listaServicios = JSON.parse(JSON.stringify(this.caja.venta.servicios.listaServiciosPorCobrar));
                            params.listaCargos = JSON.parse(JSON.stringify(this.caja.venta.cargos.listaCargosPorCobrar));
                            params.listaPaquetes = JSON.parse(JSON.stringify(this.caja.venta.paquetes.listaPaquetesPorCobrar));
                            params.listaProductos = JSON.parse(JSON.stringify(this.caja.venta.productos.listaProductosPorCobrar));
                            params.listaCertificadosRegalo = JSON.parse(JSON.stringify(this.caja.venta.certificadoRegalo.listaCertificadosPorCobrar));
                            params.listaMetodosDePago = JSON.parse(JSON.stringify(this.caja.venta.metodosDePago));
                            params.listaPropinas = JSON.parse(JSON.stringify(this.caja.venta.propinas));
                            params.listaPromociones = this.caja.venta.promocionesNuevas.promocionesAplicadas;
                            params.fechaPagoHoraCliente = moment(this.caja.venta.fechaPago).format('YYYYMMDD HH:mm:ss');


                            //cambiar valor pesos por dolares en monto
                            if(this._pantallaServicio.idSucursal == 689 || this._pantallaServicio.idSucursal == 269){
                                for (var i = 0; i < params.listaMetodosDePago.length; i++) {
                                    if (params.listaMetodosDePago[i].descripcion == "Dolares") {
                                        params.listaMetodosDePago[i].monto = parseFloat($('#camptipocambio').val());
                                    }
                                }
                            }

                            // ------------------- Validación de cliente --------------------
                            if (this.caja.venta.cliente) {
                                params.idCliente = this.caja.venta.cliente;
                                params.nombreCliente = null;
                                params.emailCliente = null;
                                params.telefonoCliente = null;
                                params.fechaNacimientoCliente = null;
                            }
                            else {
                                params.idCliente = null;
                                params.nombreCliente = this.caja.venta.clienteNuevo.nombre ? this.caja.venta.clienteNuevo.nombre : null;
                                params.emailCliente = this.caja.venta.clienteNuevo.email ? this.caja.venta.clienteNuevo.email : null;
                                params.telefonoCliente = this.caja.venta.clienteNuevo.telefono ? this.caja.venta.clienteNuevo.telefono : null;
                                params.fechaNacimientoCliente = this.caja.venta.clienteNuevo.fechaNacimiento ? moment(this.caja.venta.clienteNuevo.fechaNacimiento).format("YYYY-MM-DD") : null;
                            }

                            // ----------------- Obtener el costo original de cada venta ----------------
                            for (var i = 0; i < params.listaServicios.length; i++) {
                                if (params.listaServicios[i].esVenta) {
                                    params.listaServicios[i].costoOriginal = params.listaServicios[i].costoElegido;
                                    params.listaServicios[i].descuentoPromocion = 0;
                                }
                            }

                            for (var i = 0; i < params.listaPaquetes.length; i++) {
                                if (params.listaPaquetes[i].esVenta) {
                                    params.listaPaquetes[i].costoOriginal = params.listaPaquetes[i].costoElegido;
                                    params.listaPaquetes[i].descuentoPromocion = 0;
                                }
                            }

                            for (var i = 0; i < params.listaProductos.length; i++) {
                                if (params.listaProductos[i].esVenta) {
                                    params.listaProductos[i].costoOriginal = params.listaProductos[i].costoElegido;
                                    params.listaProductos[i].descuentoPromocion = 0;
                                }
                            }

                            for (var i = 0; i < params.listaCargos.length; i++) {
                                if (params.listaCargos[i].esVenta) {
                                    params.listaCargos[i].costoOriginal = params.listaCargos[i].costoElegido;
                                    params.listaCargos[i].descuentoPromocion = 0;
                                }
                            }

                            for (var i = 0; i < params.listaCertificadosRegalo.length; i++) {
                                if (params.listaCertificadosRegalo[i].esVenta) {
                                    params.listaCertificadosRegalo[i].costoOriginal = params.listaCertificadosRegalo[i].costoElegido;
                                    params.listaCertificadosRegalo[i].descuentoPromocion = 0;
                                }
                            }

                            // ------- Aplicación del descuento en Servicios y Productos de las Promociones y obtención del total de descuento por promociones -------
                            for(var i = 0; i < params.listaServicios.length; i++){
                                if (params.listaServicios[i].esVenta) {
                                    if (params.listaServicios[i].idPagoClienteDetalle == null) {
                                        params.listaServicios[i].promocionesAplicadas = "";
                                        params.listaServicios[i].canjes = "";
                                        for(var j = 0; j < params.listaServicios[i].promociones.length; j++){
                                            params.listaServicios[i].costoDescuento -= params.listaServicios[i].promociones[j].descuento;
                                            params.listaServicios[i].costoDescuento = Number(params.listaServicios[i].costoDescuento.toFixed(2));
                                            params.listaServicios[i].descuentoPromocion += params.listaServicios[i].promociones[j].descuento;
                                            params.listaServicios[i].descuentoPromocion = Number(params.listaServicios[i].descuentoPromocion.toFixed(2));
                                            params.listaServicios[i].promocionesAplicadas += params.listaServicios[i].promociones[j].idPromocionAplicada + ",";
                                            if(params.listaServicios[i].promociones[j].idPromocionSucursalNuevaAplicacionValorPendienteCliente){
                                                params.listaServicios[i].canjes += params.listaServicios[i].promociones[j].idPromocionSucursalNuevaAplicacionValorPendienteCliente + ",";
                                            }
                                        }
                                    }
                                    else{
                                        params.listaServicios[i].promocionesAplicadas = "";
                                        params.listaServicios[i].canjes = "";
                                    }
                                }
                            }

                            for(var i = 0; i < params.listaProductos.length; i++){
                                if (params.listaProductos[i].esVenta) {
                                    params.listaProductos[i].promocionesAplicadas = "";
                                    params.listaProductos[i].promocionesAplicadasCantidadProducto = "";
                                    params.listaProductos[i].canjes = "";
                                    for(var j = 0; j < params.listaProductos[i].promociones.length; j++){
                                        params.listaProductos[i].costoDescuento -= params.listaProductos[i].promociones[j].descuento;
                                        params.listaProductos[i].costoDescuento = Number(params.listaProductos[i].costoDescuento.toFixed(2));
                                        params.listaProductos[i].descuentoPromocion += params.listaProductos[i].promociones[j].descuento;
                                        params.listaProductos[i].descuentoPromocion = Number(params.listaProductos[i].descuentoPromocion.toFixed(2));
                                        params.listaProductos[i].promocionesAplicadas += params.listaProductos[i].promociones[j].idPromocionAplicada + ",";
                                        params.listaProductos[i].promocionesAplicadasCantidadProducto += params.listaProductos[i].promociones[j].cantidadProductos + ",";
                                        if(params.listaProductos[i].promociones[j].idPromocionSucursalNuevaAplicacionValorPendienteCliente){
                                            params.listaProductos[i].canjes += params.listaProductos[i].promociones[j].idPromocionSucursalNuevaAplicacionValorPendienteCliente + ",";
                                        }
                                    }
                                }
                            }

                            // ---------------------- Descuento General ---------------------
                            if (this.caja.venta.totales.descuentoF.toString() != "0") {

                                // -- Como el descuento se hace sobre el total, se tiene que determinar cuanto descuento 
                                // -- se le quitara a cada servicio, cargo, paquete y producto que formen parte de la venta
                                var cuentasCaja = 0;
                                for (var i = 0; i < params.listaServicios.length; i++) {
                                    if (params.listaServicios[i].esVenta) {
                                        if (params.listaServicios[i].idPagoClienteDetalle == null) {
                                            cuentasCaja++;
                                        }
                                    }
                                }

                                for (var i = 0; i < params.listaPaquetes.length; i++) {
                                    if (params.listaPaquetes[i].esVenta) {
                                        cuentasCaja++;
                                    }
                                }

                                for (var i = 0; i < params.listaProductos.length; i++) {
                                    if (params.listaProductos[i].esVenta) {
                                        cuentasCaja++;
                                    }
                                }

                                for (var i = 0; i < params.listaCargos.length; i++) {
                                    if (params.listaCargos[i].esVenta) {
                                        cuentasCaja++;
                                    }
                                }

                                for (var i = 0; i < params.listaCertificadosRegalo.length; i++) {
                                    if (params.listaCertificadosRegalo[i].esVenta) {
                                        cuentasCaja++;
                                    }
                                }
                                var descuentoGeneral = Number((Number(this.caja.venta.totales.descuentoF) / cuentasCaja).toFixed(2));
                                var descuentoNoAplicado = Number((Number(this.caja.venta.totales.descuentoF) - (descuentoGeneral * cuentasCaja)).toFixed(2));

                                // -- Se descuenta lo calculado en la parte de servicios.
                                // -- Si el descuento calculado para cada registro es mayor al monto del registro en sí, se suma en una variable para 
                                // -- descontarlo en el siguiente registro, si este proceso continua, el faltante se irá sumando y restando en donde 
                                // -- sea posible.

                                // -- Parte de Servicios
                                for (var i = 0; i < params.listaServicios.length; i++) {
                                    if (params.listaServicios[i].esVenta) {
                                        if (params.listaServicios[i].idPagoClienteDetalle == null) {
                                            params.listaServicios[i].costoDescuento = Number(params.listaServicios[i].costoDescuento);

                                            if (Number((params.listaServicios[i].costoDescuento - descuentoGeneral).toFixed(2)) < 0) {
                                                descuentoNoAplicado = Number((descuentoNoAplicado + descuentoGeneral - params.listaServicios[i].costoDescuento).toFixed(2));
                                                params.listaServicios[i].costoDescuento = 0;
                                            }
                                            else {
                                                params.listaServicios[i].costoDescuento = Number((params.listaServicios[i].costoDescuento - descuentoGeneral).toFixed(2));
                                                if (descuentoNoAplicado != 0) {
                                                    if (Number((params.listaServicios[i].costoDescuento - descuentoNoAplicado).toFixed(2)) < 0) {
                                                        descuentoNoAplicado = Number((descuentoNoAplicado - params.listaServicios[i].costoDescuento).toFixed(2));
                                                        params.listaServicios[i].costoDescuento = 0;
                                                    }
                                                    else {
                                                        params.listaServicios[i].costoDescuento = Number((params.listaServicios[i].costoDescuento - descuentoNoAplicado).toFixed(2));
                                                        descuentoNoAplicado = 0;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }

                                // -- Parte de Paquetes
                                for (var i = 0; i < params.listaPaquetes.length; i++) {
                                    if (params.listaPaquetes[i].esVenta) {

                                        params.listaPaquetes[i].costoDescuento = Number(params.listaPaquetes[i].costoDescuento);

                                        if (Number((params.listaPaquetes[i].costoDescuento - descuentoGeneral).toFixed(2)) < 0) {
                                            descuentoNoAplicado = Number((descuentoNoAplicado + descuentoGeneral - params.listaPaquetes[i].costoDescuento).toFixed(2));
                                            params.listaPaquetes[i].costoDescuento = 0;
                                        }
                                        else {
                                            params.listaPaquetes[i].costoDescuento = Number((params.listaPaquetes[i].costoDescuento - descuentoGeneral).toFixed(2));
                                            if (descuentoNoAplicado != 0) {
                                                if (Number((params.listaPaquetes[i].costoDescuento - descuentoNoAplicado).toFixed(2)) < 0) {
                                                    descuentoNoAplicado = Number((descuentoNoAplicado - params.listaPaquetes[i].costoDescuento).toFixed(2));
                                                    params.listaPaquetes[i].costoDescuento = 0;
                                                }
                                                else {
                                                    params.listaPaquetes[i].costoDescuento = Number((params.listaPaquetes[i].costoDescuento - descuentoNoAplicado).toFixed(2));
                                                    descuentoNoAplicado = 0;
                                                }
                                            }
                                        }
                                    }
                                }

                                // -- Parte de Productos
                                for (var i = 0; i < params.listaProductos.length; i++) {
                                    if (params.listaProductos[i].esVenta) {

                                        params.listaProductos[i].costoDescuento = Number(params.listaProductos[i].costoDescuento);

                                        if (Number((params.listaProductos[i].costoDescuento - descuentoGeneral).toFixed(2)) < 0) {
                                            descuentoNoAplicado = Number((descuentoNoAplicado + descuentoGeneral - params.listaProductos[i].costoDescuento).toFixed(2));
                                            params.listaProductos[i].costoDescuento = 0;
                                        }
                                        else {
                                            params.listaProductos[i].costoDescuento = Number((params.listaProductos[i].costoDescuento - descuentoGeneral).toFixed(2));
                                            if (descuentoNoAplicado != 0) {
                                                if (Number((params.listaProductos[i].costoDescuento - descuentoNoAplicado).toFixed(2)) < 0) {
                                                    descuentoNoAplicado = Number((descuentoNoAplicado - params.listaProductos[i].costoDescuento).toFixed(2));
                                                    params.listaProductos[i].costoDescuento = 0;
                                                }
                                                else {
                                                    params.listaProductos[i].costoDescuento = Number((params.listaProductos[i].costoDescuento - descuentoNoAplicado).toFixed(2));
                                                    descuentoNoAplicado = 0;
                                                }
                                            }
                                        }
                                    }
                                }

                                // -- Parte de Cargos
                                for (var i = 0; i < params.listaCargos.length; i++) {
                                    if (params.listaCargos[i].esVenta) {

                                        params.listaCargos[i].costoElegido = Number(params.listaCargos[i].costoElegido);

                                        if (Number((params.listaCargos[i].costoElegido - descuentoGeneral).toFixed(2)) < 0) {
                                            descuentoNoAplicado = Number((descuentoNoAplicado + descuentoGeneral - params.listaCargos[i].costoElegido).toFixed(2));
                                            params.listaCargos[i].costoElegido = 0;
                                        }
                                        else {
                                            params.listaCargos[i].costoElegido = Number((params.listaCargos[i].costoElegido - descuentoGeneral).toFixed(2));
                                            if (descuentoNoAplicado != 0) {
                                                if (Number((params.listaCargos[i].costoElegido - descuentoNoAplicado).toFixed(2)) < 0) {
                                                    descuentoNoAplicado = Number((descuentoNoAplicado - params.listaCargos[i].costoElegido).toFixed(2));
                                                    params.listaCargos[i].costoElegido = 0;
                                                }
                                                else {
                                                    params.listaCargos[i].costoElegido = Number((params.listaCargos[i].costoElegido - descuentoNoAplicado).toFixed(2));                                        
                                                    descuentoNoAplicado = 0;
                                                }
                                            }
                                        }
                                    }
                                }

                                // -- Parte de Certificados Regalo
                                for (var i = 0; i < params.listaCertificadosRegalo.length; i++) {
                                    if (params.listaCertificadosRegalo[i].esVenta) {

                                        params.listaCertificadosRegalo[i].costoDescuento = Number(params.listaCertificadosRegalo[i].costoDescuento);

                                        if (Number((params.listaCertificadosRegalo[i].costoDescuento - descuentoGeneral).toFixed(2)) < 0) {
                                            descuentoNoAplicado = Number((descuentoNoAplicado + descuentoGeneral - params.listaCertificadosRegalo[i].costoDescuento).toFixed(2));
                                            params.listaCertificadosRegalo[i].costoDescuento = 0;
                                        }
                                        else {
                                            params.listaCertificadosRegalo[i].costoDescuento = Number((params.listaCertificadosRegalo[i].costoDescuento - descuentoGeneral).toFixed(2));
                                            if (descuentoNoAplicado != 0) {
                                                if (Number((params.listaCertificadosRegalo[i].costoDescuento - descuentoNoAplicado).toFixed(2)) < 0) {
                                                    descuentoNoAplicado = Number((descuentoNoAplicado - params.listaCertificadosRegalo[i].costoDescuento).toFixed(2));
                                                    params.listaCertificadosRegalo[i].costoDescuento = 0;
                                                }
                                                else {
                                                    params.listaCertificadosRegalo[i].costoDescuento = Number((params.listaCertificadosRegalo[i].costoDescuento - descuentoNoAplicado).toFixed(2));
                                                    descuentoNoAplicado = 0;
                                                }
                                            }
                                        }
                                    }
                                }

                                // Si aun quedaron descuentos no aplicados, se vuelve a reccorrer todo y se descuenta en la primera venta posible
                                if (descuentoNoAplicado != 0) {
                                    for (var i = 0; i < params.listaServicios.length; i++) {
                                        if (params.listaServicios[i].esVenta) {
                                            if (params.listaServicios[i].idPagoClienteDetalle == null) {
                                                if (Number((params.listaServicios[i].costoDescuento - descuentoNoAplicado).toFixed(2)) < 0) {
                                                    descuentoNoAplicado = Number((descuentoNoAplicado - params.listaServicios[i].costoDescuento).toFixed(2));
                                                    params.listaServicios[i].costoDescuento = 0;
                                                }
                                                else {
                                                    params.listaServicios[i].costoDescuento = Number((params.listaServicios[i].costoDescuento - descuentoNoAplicado).toFixed(2));
                                                    descuentoNoAplicado = 0;
                                                }
                                            }
                                        }
                                    }
                                }

                                if (descuentoNoAplicado != 0) {
                                    for (var i = 0; i < params.listaPaquetes.length; i++) {
                                        if (params.listaPaquetes[i].esVenta) {
                                            if (Number((params.listaPaquetes[i].costoDescuento - descuentoNoAplicado).toFixed(2)) < 0) {
                                                descuentoNoAplicado = Number((descuentoNoAplicado - params.listaPaquetes[i].costoDescuento).toFixed(2));
                                                params.listaPaquetes[i].costoDescuento = 0;
                                            }
                                            else {
                                                params.listaPaquetes[i].costoDescuento = Number((params.listaPaquetes[i].costoDescuento - descuentoNoAplicado).toFixed(2));
                                                descuentoNoAplicado = 0;
                                            }
                                        }
                                    }
                                }

                                if (descuentoNoAplicado != 0) {
                                    for (var i = 0; i < params.listaProductos.length; i++) {
                                        if (params.listaProductos[i].esVenta) {
                                            if (Number((params.listaProductos[i].costoDescuento - descuentoNoAplicado).toFixed(2)) < 0) {
                                                descuentoNoAplicado = Number((descuentoNoAplicado - params.listaProductos[i].costoDescuento).toFixed(2));
                                                params.listaProductos[i].costoDescuento = 0;
                                            }
                                            else {
                                                params.listaProductos[i].costoDescuento = Number((params.listaProductos[i].costoDescuento - descuentoNoAplicado).toFixed(2));
                                                descuentoNoAplicado = 0;
                                            }
                                        }
                                    }
                                }

                                if (descuentoNoAplicado != 0) {
                                    for (var i = 0; i < params.listaCargos.length; i++) {
                                        if (params.listaCargos[i].esVenta) {
                                            if (Number((params.listaCargos[i].costoElegido - descuentoNoAplicado).toFixed(2)) < 0) {
                                                descuentoNoAplicado = Number((descuentoNoAplicado - params.listaCargos[i].costoElegido).toFixed(2));
                                                params.listaCargos[i].costoElegido = 0;
                                            }
                                            else {
                                                params.listaCargos[i].costoElegido = Number((params.listaCargos[i].costoElegido - descuentoNoAplicado).toFixed(2));
                                                descuentoNoAplicado = 0;
                                            }
                                        }
                                    }
                                }

                                if (descuentoNoAplicado != 0) {
                                    for (var i = 0; i < params.listaCertificadosRegalo.length; i++) {
                                        if (params.listaCertificadosRegalo[i].esVenta) {
                                            if (Number((params.listaCertificadosRegalo[i].costoDescuento - descuentoNoAplicado).toFixed(2)) < 0) {
                                                descuentoNoAplicado = Number((descuentoNoAplicado - params.listaCertificadosRegalo[i].costoDescuento).toFixed(2));
                                                params.listaCertificadosRegalo[i].costoDescuento = 0;
                                            }
                                            else {
                                                params.listaCertificadosRegalo[i].costoDescuento = Number((params.listaCertificadosRegalo[i].costoDescuento - descuentoNoAplicado).toFixed(2));
                                                descuentoNoAplicado = 0;
                                            }
                                        }
                                    }
                                }

                            }

                            // ----------------- Obtener el descuento Manual y General de las ventas ----------------
                            for (var i = 0; i < params.listaServicios.length; i++) {
                                if (params.listaServicios[i].esVenta) {
                                    if (params.listaServicios[i].idPagoClienteDetalle == null) {
                                        if (params.listaServicios[i].idPaqueteSucursalCliente == null) {
                                            params.listaServicios[i].descuentoManual = Number(params.listaServicios[i].costoOriginal) - params.listaServicios[i].costoDescuento - Number(params.listaServicios[i].descuentoPromocion);
                                            params.listaServicios[i].descuentoManual = Number(params.listaServicios[i].descuentoManual.toFixed(2));
                                        }
                                        else{
                                            params.listaServicios[i].descuentoManual = 0;
                                        }
                                    }
                                    else{
                                        params.listaServicios[i].descuentoManual = 0;
                                    }
                                }
                            }

                            for (var i = 0; i < params.listaPaquetes.length; i++) {
                                if (params.listaPaquetes[i].esVenta) {
                                    params.listaPaquetes[i].descuentoManual = Number(params.listaPaquetes[i].costoOriginal) - params.listaPaquetes[i].costoDescuento - Number(params.listaPaquetes[i].descuentoPromocion);
                                    params.listaPaquetes[i].descuentoManual = Number(params.listaPaquetes[i].descuentoManual.toFixed(2));
                                }
                            }

                            for (var i = 0; i < params.listaProductos.length; i++) {
                                if (params.listaProductos[i].esVenta) {
                                    params.listaProductos[i].descuentoManual = Number(params.listaProductos[i].costoOriginal) - params.listaProductos[i].costoDescuento - Number(params.listaProductos[i].descuentoPromocion);
                                    params.listaProductos[i].descuentoManual = Number(params.listaProductos[i].descuentoManual.toFixed(2));
                                }
                            }

                            for (var i = 0; i < params.listaCargos.length; i++) {
                                if (params.listaCargos[i].esVenta) {
                                    params.listaCargos[i].descuentoManual = Number(params.listaCargos[i].costoOriginal) - params.listaCargos[i].costoElegido - Number(params.listaCargos[i].descuentoPromocion);
                                    params.listaCargos[i].descuentoManual = Number(params.listaCargos[i].descuentoManual.toFixed(2));
                                }
                            }

                            for (var i = 0; i < params.listaCertificadosRegalo.length; i++) {
                                if (params.listaCertificadosRegalo[i].esVenta) {
                                    params.listaCertificadosRegalo[i].descuentoManual = Number(params.listaCertificadosRegalo[i].costoOriginal) - params.listaCertificadosRegalo[i].costoDescuento - Number(params.listaCertificadosRegalo[i].descuentoPromocion);
                                    params.listaCertificadosRegalo[i].descuentoManual = Number(params.listaCertificadosRegalo[i].descuentoManual.toFixed(2));
                                }
                            }

                            // --------------------- Apartado de Feria ----------------------
                            // Resta la cantidad de feria de los montos y montos con comisiones de métodos de pago
                            var totalCobrado = 0;
                            var feriaRestante = Number(this.caja.venta.totales.feriaEfectivo);

                            for (var i = 0; i < params.listaMetodosDePago.length; i++) {
                                if (params.listaMetodosDePago[i].isEfectivo) {
                                    if(Number((Number(params.listaMetodosDePago[i].monto) - feriaRestante).toFixed(2)) < 0){
                                        feriaRestante = Number((feriaRestante - Number(params.listaMetodosDePago[i].monto)).toFixed(2));
                                        params.listaMetodosDePago[i].monto = 0;
                                        params.listaMetodosDePago[i].pagoComision = 0;
                                    }
                                    else{
                                        params.listaMetodosDePago[i].monto = Number((Number(params.listaMetodosDePago[i].monto) - feriaRestante).toFixed(2));
                                        params.listaMetodosDePago[i].pagoComision = 0;

                                        if(Number(params.listaMetodosDePago[i].comision) != 0){
                                            params.listaMetodosDePago[i].pagoComision = Number(params.listaMetodosDePago[i].comision);
                                        }

                                        if(Number(params.listaMetodosDePago[i].comisionPorcentual) != 0){
                                            params.listaMetodosDePago[i].pagoComision = Number((Number(params.listaMetodosDePago[i].monto) * (Number(params.listaMetodosDePago[i].comisionPorcentual) / 100)).toFixed(2));
                                        }

                                        feriaRestante = 0;
                                    }
                                }
                            }

                            // -------------- Liquidación de cuentas por cobrar -------------
                            // No se utiliza la var que está en totales porque se tiene que tomar en cuenta lo de la propina que se quito en el apartado anterior
                            for (var i = 0; i < params.listaMetodosDePago.length; i++) {
                                totalCobrado = Number((totalCobrado + Number(params.listaMetodosDePago[i].monto)).toFixed(2));
                            }

                            for (var i = 0; i < params.listaServicios.length; i++) {
                                if (params.listaServicios[i].esCuentaPagar) {
                                    if (Number((totalCobrado - Number(params.listaServicios[i].costoDescuento)).toFixed(2)) < 0) {
                                        params.listaServicios[i].saldo = Number((Number(params.listaServicios[i].costoDescuento) - totalCobrado).toFixed(2));
                                        totalCobrado = 0;
                                        params.listaServicios[i].montoPorAbonar = Number((Number(params.listaServicios[i].costoDescuento) - params.listaServicios[i].saldo).toFixed(2));
                                    }
                                    else {
                                        params.listaServicios[i].saldo = 0;
                                        totalCobrado = Number((totalCobrado - Number(params.listaServicios[i].costoDescuento)).toFixed(2));
                                        params.listaServicios[i].montoPorAbonar = Number(params.listaServicios[i].costoDescuento);
                                    }
                                }
                            }

                            for (var i = 0; i < params.listaPaquetes.length; i++) {
                                if (params.listaPaquetes[i].esCuentaPagar) {
                                    if (Number((totalCobrado - Number(params.listaPaquetes[i].costoDescuento)).toFixed(2)) < 0) {
                                        params.listaPaquetes[i].saldo = Number((Number(params.listaPaquetes[i].costoDescuento) - totalCobrado).toFixed(2));
                                        totalCobrado = 0;
                                        params.listaPaquetes[i].montoPorAbonar = Number((Number(params.listaPaquetes[i].costoDescuento) - params.listaPaquetes[i].saldo).toFixed(2));
                                    }
                                    else {
                                        params.listaPaquetes[i].saldo = 0;
                                        totalCobrado = Number((totalCobrado - Number(params.listaPaquetes[i].costoDescuento)).toFixed(2));
                                        params.listaPaquetes[i].montoPorAbonar = Number(params.listaPaquetes[i].costoDescuento);
                                    }
                                }
                            }

                            for (var i = 0; i < params.listaProductos.length; i++) {
                                if (params.listaProductos[i].esCuentaPagar) {
                                    if (Number((totalCobrado - Number(params.listaProductos[i].costoDescuento)).toFixed(2)) < 0) {
                                        params.listaProductos[i].saldo = Number((Number(params.listaProductos[i].costoDescuento) - totalCobrado).toFixed(2));
                                        totalCobrado = 0;
                                        params.listaProductos[i].montoPorAbonar = Number((Number(params.listaProductos[i].costoDescuento) - params.listaProductos[i].saldo).toFixed(2));
                                    }
                                    else {
                                        params.listaProductos[i].saldo = 0;
                                        totalCobrado = Number((totalCobrado - Number(params.listaProductos[i].costoDescuento)).toFixed(2));
                                        params.listaProductos[i].montoPorAbonar = Number(params.listaProductos[i].costoDescuento);
                                    }
                                }
                            }

                            for (var i = 0; i < params.listaCargos.length; i++) {
                                if (params.listaCargos[i].esCuentaPagar) {
                                    if (Number((totalCobrado - Number(params.listaCargos[i].costoElegido)).toFixed(2)) < 0) {
                                        params.listaCargos[i].saldo = Number((Number(params.listaCargos[i].costoElegido) - totalCobrado).toFixed(2));
                                        totalCobrado = 0;
                                        params.listaCargos[i].montoPorAbonar = Number((Number(params.listaCargos[i].costoElegido) - params.listaCargos[i].saldo).toFixed(2));
                                    }
                                    else {
                                        params.listaCargos[i].saldo = 0;
                                        totalCobrado = Number((totalCobrado - Number(params.listaCargos[i].costoElegido)).toFixed(2));
                                        params.listaCargos[i].montoPorAbonar = Number(params.listaCargos[i].costoElegido);
                                    }
                                }
                            }

                            // -------------------- Liquidación de ventas -------------------

                            // -- Para Certificado de Regalo
                            for (var i = 0; i < params.listaCertificadosRegalo.length; i++) {
                                if (params.listaCertificadosRegalo[i].esVenta) {
                                    if (Number((totalCobrado - Number(params.listaCertificadosRegalo[i].costoDescuento)).toFixed(2)) < 0) {
                                        params.listaCertificadosRegalo[i].saldo = Number((Number(params.listaCertificadosRegalo[i].costoDescuento) - totalCobrado).toFixed(2));
                                        totalCobrado = 0;
                                        params.listaCertificadosRegalo[i].montoPorAbonar = Number((Number(params.listaCertificadosRegalo[i].costoDescuento) - params.listaCertificadosRegalo[i].saldo).toFixed(2));
                                    }
                                    else {
                                        params.listaCertificadosRegalo[i].saldo = 0;
                                        totalCobrado = Number((totalCobrado - Number(params.listaCertificadosRegalo[i].costoDescuento)).toFixed(2));
                                        params.listaCertificadosRegalo[i].montoPorAbonar = Number(params.listaCertificadosRegalo[i].costoDescuento);
                                    }
                                }
                            }

                            for (var i = 0; i < params.listaServicios.length; i++) {
                                if (params.listaServicios[i].esVenta) {
                                    if (params.listaServicios[i].idPaqueteSucursalCliente == null) {
                                        if (Number((totalCobrado - Number(params.listaServicios[i].costoDescuento)).toFixed(2)) < 0) {
                                            params.listaServicios[i].saldo = Number((Number(params.listaServicios[i].costoDescuento) - totalCobrado).toFixed(2));
                                            totalCobrado = 0;
                                            params.listaServicios[i].montoPorAbonar = Number((Number(params.listaServicios[i].costoDescuento) - params.listaServicios[i].saldo).toFixed(2));
                                        }
                                        else {
                                            params.listaServicios[i].saldo = 0;
                                            totalCobrado = Number((totalCobrado - Number(params.listaServicios[i].costoDescuento)).toFixed(2));
                                            params.listaServicios[i].montoPorAbonar = Number(params.listaServicios[i].costoDescuento);
                                        }
                                    }
                                    else{
                                        params.listaServicios[i].saldo = 0;
                                        params.listaServicios[i].montoPorAbonar = 0;
                                    }
                                }
                            }

                            for (var i = 0; i < params.listaPaquetes.length; i++) {
                                if (params.listaPaquetes[i].esVenta) {
                                    if (Number((totalCobrado - Number(params.listaPaquetes[i].costoDescuento)).toFixed(2)) < 0) {
                                        params.listaPaquetes[i].saldo = Number((Number(params.listaPaquetes[i].costoDescuento) - totalCobrado).toFixed(2));
                                        totalCobrado = 0;
                                        params.listaPaquetes[i].montoPorAbonar = Number((Number(params.listaPaquetes[i].costoDescuento) - params.listaPaquetes[i].saldo).toFixed(2));
                                    }
                                    else {
                                        params.listaPaquetes[i].saldo = 0;
                                        totalCobrado = Number((totalCobrado - Number(params.listaPaquetes[i].costoDescuento)).toFixed(2));
                                        params.listaPaquetes[i].montoPorAbonar = Number(params.listaPaquetes[i].costoDescuento);
                                    }
                                }
                            }

                            for (var i = 0; i < params.listaProductos.length; i++) {
                                if (params.listaProductos[i].esVenta) {
                                    if (Number((totalCobrado - Number(params.listaProductos[i].costoDescuento)).toFixed(2)) < 0) {
                                        params.listaProductos[i].saldo = Number((Number(params.listaProductos[i].costoDescuento) - totalCobrado).toFixed(2));
                                        totalCobrado = 0;
                                        params.listaProductos[i].montoPorAbonar = Number((Number(params.listaProductos[i].costoDescuento) - params.listaProductos[i].saldo).toFixed(2));
                                    }
                                    else {
                                        params.listaProductos[i].saldo = 0;
                                        totalCobrado = Number((totalCobrado - Number(params.listaProductos[i].costoDescuento)).toFixed(2));
                                        params.listaProductos[i].montoPorAbonar = Number(params.listaProductos[i].costoDescuento);
                                    }
                                }
                            }

                            for (var i = 0; i < params.listaCargos.length; i++) {
                                if (params.listaCargos[i].esVenta) {
                                    if (Number((totalCobrado - Number(params.listaCargos[i].costoElegido)).toFixed(2)) < 0) {
                                        params.listaCargos[i].saldo = Number((Number(params.listaCargos[i].costoElegido) - Number(totalCobrado)).toFixed(2));
                                        totalCobrado = 0;
                                        params.listaCargos[i].montoPorAbonar = Number((Number(params.listaCargos[i].costoElegido) - params.listaCargos[i].saldo).toFixed(2));
                                    }
                                    else {
                                        params.listaCargos[i].saldo = 0;
                                        totalCobrado = Number((totalCobrado - Number(params.listaCargos[i].costoElegido)).toFixed(2));
                                        params.listaCargos[i].montoPorAbonar = Number(params.listaCargos[i].costoElegido);
                                    }
                                }
                            }

                            // --------------- Propinas como Métodos de Pagos ---------------
                            for (var i = 0; i < params.listaPropinas.length; i++) {
                                params.listaMetodosDePago.push({
                                    monto: params.listaPropinas[i].total,
                                    idMetodoPagoSucursal: params.listaPropinas[i].idMetodoPagoSucursal,
                                    digitos: "",
                                    pagoComision: params.listaPropinas[i].propinaComision,
                                    idCertificadoRegaloUso: ""
                                });
                            }

                            // ------------------ Cargo concepto comisiones -----------------
                            var diferenciaComision = 0;
                            for (var i = 0; i < params.listaMetodosDePago.length; i++) {
                                diferenciaComision = Number((diferenciaComision + Number(params.listaMetodosDePago[i].pagoComision)).toFixed(2));
                            }

                            if(diferenciaComision != 0){
                                params.listaCargos.push({
                                    descripcion: "Comisión por Métodos de Pago/Propinas",
                                    costoElegido: diferenciaComision,
                                    esVenta: true,
                                    esCuentaPagar: false,
                                    idPagoClienteDetalle: null,
                                    saldo: 0,
                                    montoPorAbonar: diferenciaComision,
                                    descuentoManual: 0,
                                    descuentoPromocion: 0
                                });
                            }

                            if (!this.caja.venta.fechaPago) {
                                params.fechaPago = moment(new Date()).utc();
                            }
                            else{
                                if(this.caja.venta.fechaPago instanceof Date){
                                    var dateFinal = moment(this.caja.venta.fechaPago).utc();
                
                                    params.fechaPago = dateFinal;
                                }
                                else{
                                    // console.log("PRUEBA IPAD 3: ENTRO EN ELSE");
                                    var currentDate = new Date();
                                    // var currentTime = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                    var currentTime = format(currentDate, 'HH:mm');
                                    
                                    //console.log("PRUEBA IPAD - CURRENTDATE:" + currentDate);
                                    //console.log("PRUEBA IPAD - CURRENTTIME:" + currentTime);
                                    
                                    var fechaPagoMoment = moment(this.caja.venta.fechaPago);
                                    var dateTimeString = fechaPagoMoment.format('YYYY-MM-DD') + " " + currentTime;

                                    //console.log("PRUEBA IPAD - FECHAPAGOMOMENT:" + fechaPagoMoment);
                                    //console.log("PRUEBA IPAD - DATETIMESTRING:" + dateTimeString);

                                    // var date = new Date(dateTimeString);
                                    var dateFinal = moment(dateTimeString).utc();

                                    params.fechaPago = dateFinal;

                                    //console.log("PRUEBA IPAD - DATEFINAL:" + dateFinal);

                                    //alert("PRUEBA IPAD - DATETIMESTRING:" + dateTimeString);
                                }
                            }
                            

                            // -------------- Pago total certificado de regalo --------------
                            var errorValidacionPago = true;
                            for (var i = 0; i < params.listaCertificadosRegalo.length; i++) {
                                if(params.listaCertificadosRegalo[i].saldo > 0){
                                    errorValidacionPago = false;
                                }
                            }

                            // ------------------- Tipo de Cambio ---------------------- //
                            params.valortipocambio = 0;
                            
                            if(this._pantallaServicio.idSucursal == 689 && params.listaMetodosDePago[0].descripcion == "Dolares" || this._pantallaServicio.idSucursal == 269 && params.listaMetodosDePago[0].descripcion == "Dolares"){
                                params.valortipocambio = $("#camptipocambio2").val();
                            }

                            if(errorValidacionPago){
                                // ------------------- Función que hace el Pago -----------------
                                this._backService.HttpPost("procesos/agenda/Agenda/pagarCaja", {}, params).subscribe( (data:any) => {
                                    this.caja.venta.folioAux = data;

                                    switch(this.caja.venta.folioAux){

                                        case "-1":
                                            this._toaster.error("Una(s) de la(s) Promociones ya fue canjeada a la máxima cantidad posible");

                                            this._pantallaServicio.ocultarSpinner();
                                            break;

                                        case "-1e":
                                            this._toaster.error("No hay certificados disponibles para vender, favor de recargar la pantalla");

                                            this._pantallaServicio.ocultarSpinner();
                                            break;

                                        case "-2e":
                                            this._toaster.error("Uno de los códigos de Certificado de Regalo ya se encuentra en uso");

                                            this._pantallaServicio.ocultarSpinner();
                                            break;

                                        default:
                                            this._backService.HttpPost("procesos/agenda/Agenda/selectClientes", {}, {}).subscribe( (data:any) => {
                                                this.caja.venta.listadoClientes = eval(data);
                                                for (var i = 0; i < this.caja.venta.listadoClientes.length; i++) {
                                                    if (this.caja.venta.listadoClientes[i].telefono !== null && this.caja.venta.listadoClientes[i].telefono != "" && this.caja.venta.listadoClientes[i].telefono !== undefined) {
                                                        this.caja.venta.listadoClientes[i].nombreBuscar = JSON.parse(JSON.stringify(this.caja.venta.listadoClientes[i].nombre)) + " - " + JSON.parse(JSON.stringify(this.caja.venta.listadoClientes[i].telefono));
                                                    }
                                                    else {
                                                        this.caja.venta.listadoClientes[i].nombreBuscar = JSON.parse(JSON.stringify(this.caja.venta.listadoClientes[i].nombre));
                                                    }
                                                }
                                                this.caja.venta.listadoClientesBuffer = JSON.parse(JSON.stringify(this.caja.venta.listadoClientes));
                                                this.caja_venta_limpiarVenta();
                                                this._ticketService.caja_movimientos_mostrarTicketFolioPago(this.caja.venta.folioAux);
                                            }, error => {
                                                this.guardarError(error.error ? error.error.message : error.message, error.status, "Consultar clientes al pagar");
                                            });
                                            break;
                                    }
                                }, error => {
                                    // alert("PRUEBA IPAD - Error: " + error.error ? error.error.message : error.message);
                                    // alert("PRUEBA IPAD - Error Status: " + error.status);
                                    this.guardarError(error.error ? error.error.message : error.message, error.status, "Pagar caja");
                                    this._pantallaServicio.ocultarSpinner();
                                });
                            }
                            else{
                                this._toaster.error("No se realizó la venta debido a que no se completó el pago de uno/s de los Certificados de Regalo ");
                                this._pantallaServicio.ocultarSpinner();
                            }
                        }
                        else{
                            this._pantallaServicio.ocultarSpinner();
                        }

                    }

                } 
            }
            else{
                this._toaster.error("Uno de los Certificados de Regalo no ha sido ingresado");
                this._pantallaServicio.ocultarSpinner();
            }

        }
        else{
            this._toaster.error("Selecciona un Metodo de Pago");
            this._pantallaServicio.ocultarSpinner();
        }
    }

    caja_venta_prevenirFechaPago (){
        if (!this.caja.venta.fechaPago) {
            // this.caja.venta.fechaPago = new Date();
            // this.caja.venta.fechaPago = format(new Date(), "yyyy-MM-dd");
            this.caja.venta.fechaPago = format(new Date(), "yyyy-MM-dd");
        }
    }

    // ------------------------------------- Catálogo Métodos de Pago -------------------------------------
    caja_venta_cargarVarGridMetodosPago () {
        this.caja.venta.gridMetodosPago = {
            enableSorting: true,
            enableColumnMenus: false,
            columnDefs: [
                {
                    name: "Acciones", width: '100', enableSorting: false, headerCellClass: 'alignCenter2',
                    cellTemplate: '<div class="ui-grid-cell-contents" ng-if="row.entity.descripcion" style="text-align:center; color:#337dc0;">'
                    + '<li style="margin-right: 15px; font-size: 1.5em; cursor:pointer;" class="fa fa-pencil" ng-if="!$root.caja.venta.metodoPago.mostrarActualizarMetodoPago" ng-click="$root.caja.venta.metodoPago.cargarMetodoPago(row.entity)"></li>'
                    + '<li style="margin-right: 15px; font-size: 1.5em; cursor:pointer;" class="fa fa-money" ng-click="$root.caja.venta.metodoPago.metodoEsEfectivo(row.entity)"></li>'
                    + '<li ng-if="!row.entity.isEfectivo" style="font-size: 1.5em; cursor:pointer;" class="fa fa-trash-o" ng-click="$root.caja.venta.metodoPago.preparacionBorrarMetodoPago(row.entity)"></li>'
                    + '<li ng-if="row.entity.isEfectivo" style="font-size: 1.5em; cursor:pointer; width: 15.33px; display: inline-block;"></li>'
                    + '</div>'
                    + '<div class="ui-grid-cell-contents" ng-if="!row.entity.descripcion" style="text-align:center; color:#337dc0;">'
                    + '<div ng-if="!$root.caja.venta.metodoPago.mostrarNuevoMetodoPago && row.entity.nuevo && !$root.caja.venta.metodoPago.mostrarActualizarMetodoPago">'
                    + '<li style="font-size: 1.5em; cursor:pointer;" class="fa fa-plus" ng-click="$root.caja.venta.metodoPago.mostrarAgregar()"></li>'
                    + '</div>'
                    + '<div ng-if="$root.caja.venta.metodoPago.mostrarActualizarMetodoPago&&!row.entity.nuevo">'
                    + '<li style="margin-right: 15px; font-size: 1.5em; cursor:pointer;" class="fa fa-undo" ng-click="$root.caja.venta.metodoPago.cerrarAgregar()"></li>'
                    + '<li style="font-size: 1.5em; cursor:pointer;" class="fa fa-floppy-o" ng-click="$root.caja.venta.metodoPago.actualizarMetodoPago(row.entity)"></li>'
                    + '</div>'
                    + '<div ng-if="$root.caja.venta.metodoPago.mostrarNuevoMetodoPago">'
                    + '<li style="margin-right: 15px; font-size: 1.5em; cursor:pointer;"class="fa fa-undo" ng-click="$root.caja.venta.metodoPago.cerrarAgregar()"></li>'
                    + '<li style="font-size: 1.5em; cursor:pointer;"class="fa fa-floppy-o" ng-click="$root.caja.venta.metodoPago.agregarMetodoPago()"></li>'
                    + '</div>'
                    + '</div>'
                },
                {
                    displayName: "Métodos de Pago", minWidth: '150', field: 'descripcion', headerCellClass: 'alignCenter', cellClass: 'alignCenter',
                    cellTemplate: '<div style="margin-top: 5px;" ng-if="row.entity.descripcion">'
                    + '{{COL_FIELD}} '
                    + '</div>'
                    + '<div style="width: 100%; height:100%;" ng-if="!row.entity.descripcion">'
                    + '<div style="margin:2px; width: 100%; height:100%;" ng-if="$root.caja.venta.metodoPago.mostrarActualizarMetodoPago">'
                    + '<input id="txtDescripcionMetodoPago" ng-if="!row.entity.nuevo" ng-model="$root.caja.venta.metodoPago.descripcionMetodoPago" style="width: 98.5%; height:85%; margin:1px; padding-left: 10px; padding-right: 10px;" type="text" class="form-control" maxlength="100"/>'
                    + '</div>'
                    + '<div style="margin:2px; width: 100%; height:100%;" ng-if="$root.caja.venta.metodoPago.mostrarNuevoMetodoPago">'
                    + '<input id="txtDescripcionMetodoPago" ng-model="$root.caja.venta.metodoPago.descripcionMetodoPago" style="width: 98.5%; height:85%; margin:1px; padding-left: 10px; padding-right: 10px;" type="text" class="form-control" maxlength="100"/>'
                    + '</div>'
                    + '</div>'
                },
                {
                    displayName: 'Comisión Fija', width: '150', field: 'comision', headerCellClass: 'alignCenter', cellClass: 'alignCenter',
                    cellTemplate: 
                    '<div style="margin-top: 5px;" ng-if="row.entity.mostrarComision">' +
                        '{{COL_FIELD | currency }} ' +
                    '</div>' +
                    '<div style="width: 100%; height:100%;" ng-if="!row.entity.mostrarComision">' +
                        '<div style="margin:2px; width: 100%; height:100%;" ng-if="$root.caja.venta.metodoPago.mostrarActualizarMetodoPago">' +
                            '<input id="txtComisionMetodoPago" ng-if="!row.entity.nuevo" ng-model="$root.caja.venta.metodoPago.comisionMetodoPago" ng-change="$root.caja.venta.metodoPago.actualizarComision(1)" style="width: 95.5%; height:85%; margin:1px; padding-left: 10px; padding-right: 10px;" type="text" class="form-control" maxlength="100"/>' +
                        '</div>' +
                        '<div style="margin:2px; width: 100%; height:100%;" ng-if="$root.caja.venta.metodoPago.mostrarNuevoMetodoPago">' +
                            '<input id="txtComisionMetodoPago" ng-model="$root.caja.venta.metodoPago.comisionMetodoPago" ng-change="$root.caja.venta.metodoPago.actualizarComision(1)" style="width: 95.5%; height:85%; margin:1px; padding-left: 10px; padding-right: 10px;" type="text" class="form-control" maxlength="8" decimals-only/>' +
                        '</div>' +
                    '</div>'

                },
                {
                    displayName: 'Comisión Porcentual', width: '150', field: 'comisionPorcentual', headerCellClass: 'alignCenter', cellClass: 'alignCenter',
                    cellTemplate: 
                    '<div style="margin-top: 5px;" ng-if="row.entity.mostrarComision">' +
                        '{{ COL_FIELD }} % ' +
                    '</div>' +
                    '<div style="width: 100%; height:100%;" ng-if="!row.entity.mostrarComision">' +
                        '<div style="margin:2px; width: 100%; height:100%;" ng-if="$root.caja.venta.metodoPago.mostrarActualizarMetodoPago">' +
                            '<input id="txtComisionPorcentualMetodoPago" ng-if="!row.entity.nuevo" ng-model="$root.caja.venta.metodoPago.comisionPorcentualMetodoPago" ng-change="$root.caja.venta.metodoPago.actualizarComision(2)" style="width: 95.5%; height:85%; margin:1px; padding-left: 10px; padding-right: 10px;" type="text" class="form-control" maxlength="100"/>' +
                        '</div>' +
                        '<div style="margin:2px; width: 100%; height:100%;" ng-if="$root.caja.venta.metodoPago.mostrarNuevoMetodoPago">' +
                            '<input id="txtComisionPorcentualMetodoPago" ng-model="$root.caja.venta.metodoPago.comisionPorcentualMetodoPago" ng-change="$root.caja.venta.metodoPago.actualizarComision(2)" style="width: 95.5%; height:85%; margin:1px; padding-left: 10px; padding-right: 10px;" type="text" class="form-control" maxlength="8" decimals-only/>' +
                        '</div>' +
                    '</div>'

                },
                {
                    displayName: 'Efectivo', width: '100', field: 'descripcion', headerCellClass: 'alignCenter', cellClass: 'alignCenter',
                    cellTemplate: '<div style="margin-top: 5px;" ng-if="row.entity.isEfectivo">'
                    + '$'
                    + '</div>'
                },
            ],
            data: '$root.caja.venta.dataMetodoPago'
        }
    }

    caja_venta_metodoPago_consultaMetodosPago () {
        this._backService.HttpPost("catalogos/Metodo_pago_sucursal/consultaMetodosPagoSucursal", {}, {}).subscribe( (data:any) => {
            this.caja.venta.dataMetodoPago = eval(data);

            for (var i = 0 ; i < this.caja.venta.dataMetodoPago.length; i++) {
                this.caja.venta.dataMetodoPago[i].nuevo = false;
                this.caja.venta.dataMetodoPago[i].id = i;
                this.caja.venta.dataMetodoPago[i].mostrarComision = true;
            }

            this.caja.venta.dataMetodoPago.push({ descripcion: false, mostrarComision: false, nuevo: true });
            this.dataSourceMetodoPago.data = this.caja.venta.dataMetodoPago;
            this.dataSourceMetodoPago.paginator = this.paginacionMetodoPago;
		    this.dataSourceMetodoPago.sort = this.sort;
        }, error => {
            this.guardarError(error.error ? error.error.message : error.message, error.status, "Consultar métodos pago sucursal catálogo");
        });
    }

    caja_venta_metodoPago_mostrarAgregar () {        
        this.caja.venta.metodoPago.descripcionMetodoPago = "";
        this.caja.venta.metodoPago.comisionMetodoPago = 0;
        this.caja.venta.metodoPago.comisionPorcentualMetodoPago = 0;
        this.caja.venta.metodoPago.tipoComisionMetodoPago = "";
        this.caja.venta.metodoPago.mostrarNuevoMetodoPago = true;
        this.caja.venta.metodoPago.mostrarActualizarMetodoPago = false;
        $("#txtDescripcionMetodoPago").removeClass("errorCampo");
    }

    caja_venta_metodoPago_cerrarAgregar () {
        this.caja_venta_metodoPago_consultaMetodosPago();
        this.caja.venta.metodoPago.descripcionMetodoPago = "";
        this.caja.venta.metodoPago.mostrarNuevoMetodoPago = false;
        this.caja.venta.metodoPago.mostrarActualizarMetodoPago = false;
        $("#txtDescripcionMetodoPago").removeClass("errorCampo");

        for (var i = 0 ; i < this.caja.venta.dataMetodoPago.length; i++) {
            if(!this.caja.venta.dataMetodoPago[i].nuevo){
                this.caja.venta.dataMetodoPago[i].mostrarComision = true;
            }
            else{
                this.caja.venta.dataMetodoPago[i].mostrarComision = false;
            }
        }

    }

    caja_venta_metodoPago_agregarMetodoPago () {
        $("#txtDescripcionMetodoPago").removeClass("errorCampo");
        $("#txtComisionMetodoPago").removeClass("errorCampo");

        if (this.caja.venta.metodoPago.descripcionMetodoPago != "") {

            var valExp = RegExp("^[a-zA-Z áéíóúñÁÉÍÓÚÑ0üÜ0-9]*$");
            var floatRegex = RegExp("^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$");

            if(this.caja.venta.metodoPago.comisionMetodoPago == ""){
                this.caja.venta.metodoPago.comisionMetodoPago = 0;
            }

            if(this.caja.venta.metodoPago.comisionPorcentualMetodoPago == ""){
                this.caja.venta.metodoPago.comisionPorcentualMetodoPago = 0;
            }

            if (valExp.test(this.caja.venta.metodoPago.descripcionMetodoPago) && floatRegex.test(this.caja.venta.metodoPago.comisionMetodoPago) && floatRegex.test(this.caja.venta.metodoPago.comisionPorcentualMetodoPago)) {

                for (var i = 0; i < this.caja.venta.dataMetodoPago.length; i++) {
                    if (!this.caja.venta.dataMetodoPago[i].nuevo) {
                        if (this.caja.venta.dataMetodoPago[i].descripcion == this.caja.venta.metodoPago.descripcionMetodoPago) {
                            var descripcionRepetida:any = true;
                        }
                    }
                }

                if (!descripcionRepetida) {
                    var params:any = {};
                    params.descripcion = this.caja.venta.metodoPago.descripcionMetodoPago;
                    params.comision = this.caja.venta.metodoPago.comisionMetodoPago;
                    params.comisionPorcentual = this.caja.venta.metodoPago.comisionPorcentualMetodoPago;

                    this._backService.HttpPost("catalogos/Metodo_pago_sucursal/guardarMetodoPagoSucursal", {}, params).subscribe( (data:any) => {
                        this.caja_venta_metodoPago_consultaMetodosPago();
                        this.caja.venta.metodoPago.descripcionMetodoPago = "";
                        this.caja.venta.metodoPago.mostrarNuevoMetodoPago = false;
                        $("#txtDescripcionMetodoPago").removeClass("errorCampo");
                    }, error => {
                        this._router.navigate(["/login"]);
                    });

                }
                else {
                    this._toaster.error(this.agendaTranslate.metodoPagoExiste);
                }
            }
            else {
                if(!valExp.test(this.caja.venta.metodoPago.descripcionMetodoPago)){
                    this._toaster.error(this.agendaTranslate.metodoPagoFormato);
                }

                if(!floatRegex.test(this.caja.venta.metodoPago.comisionMetodoPago)){
                    this._toaster.error("El formato de la Comisión Fija es incorrecto");
                }

                if(!floatRegex.test(this.caja.venta.metodoPago.comisionPorcentualMetodoPago)){
                    this._toaster.error("El formato de la Comisión Porcentual es incorrecto");
                }
            }
        }
        else {

            if(this.caja.venta.metodoPago.descripcionMetodoPago == ""){
                $("#txtDescripcionMetodoPago").addClass("errorCampo");               
            }

            if(this.caja.venta.metodoPago.comisionMetodoPago == ""){
                this.caja.venta.metodoPago.comisionMetodoPago = 0;
            }

            if(this.caja.venta.metodoPago.comisionPorcentualMetodoPago == ""){
                this.caja.venta.metodoPago.comisionPorcentualMetodoPago = 0;
            }
        }
    }

    caja_venta_metodoPago_cargarMetodoPago (entity:any) {        
        this.caja.venta.metodoPago.mostrarActualizarMetodoPago = true;
        this.caja.venta.metodoPago.mostrarNuevoMetodoPago = false;
        this.caja.venta.metodoPago.descripcionMetodoPago = entity.descripcion;
        this.caja.venta.metodoPago.comisionMetodoPago = entity.comision;
        this.caja.venta.metodoPago.comisionPorcentualMetodoPago = entity.comisionPorcentual;
        this.caja.venta.dataMetodoPago[entity.id].descripcion = false;
        this.caja.venta.dataMetodoPago[entity.id].mostrarComision = false;
        $("#txtDescripcionMetodoPago").removeClass("errorCampo");
    }

    caja_venta_metodoPago_actualizarMetodoPago (entity:any) {
        if (this.caja.venta.metodoPago.descripcionMetodoPago != "") {

            var valExp = RegExp("^[a-zA-Z áéíóúñÁÉÍÓÚÑ0üÜ0-9]*$");
            var floatRegex = RegExp("^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$");

            if(this.caja.venta.metodoPago.comisionMetodoPago == ""){
                this.caja.venta.metodoPago.comisionMetodoPago = 0;
            }

            if(this.caja.venta.metodoPago.comisionPorcentualMetodoPago == ""){
                this.caja.venta.metodoPago.comisionPorcentualMetodoPago = 0;
            }

            if (valExp.test(this.caja.venta.metodoPago.descripcionMetodoPago) && floatRegex.test(this.caja.venta.metodoPago.comisionMetodoPago) && floatRegex.test(this.caja.venta.metodoPago.comisionPorcentualMetodoPago)) {

                for (var i = 0; i < this.caja.venta.dataMetodoPago.length; i++) {
                    if (!this.caja.venta.dataMetodoPago[i].nuevo) {
                        if (this.caja.venta.dataMetodoPago[i].descripcion == this.caja.venta.metodoPago.descripcionMetodoPago) {
                            var descripcionRepetida:any = true;
                        }
                    }
                }
                if (!descripcionRepetida) {
                    var params:any = {};
                    params.descripcion = this.caja.venta.metodoPago.descripcionMetodoPago;
                    params.idMetodoPagoSucursal = entity.idMetodoPagoSucursal;
                    params.isEfectivo = entity.isEfectivo;
                    params.comision = this.caja.venta.metodoPago.comisionMetodoPago;
                    params.comisionPorcentual = this.caja.venta.metodoPago.comisionPorcentualMetodoPago;

                    this._backService.HttpPost("catalogos/Metodo_pago_sucursal/actualizarMetodoPagoSucursal", {}, params).subscribe( (data:any) => {
                        this.caja_venta_metodoPago_consultaMetodosPago();
                        this.caja.venta.metodoPago.descripcionMetodoPago = "";
                        this.caja.venta.metodoPago.mostrarNuevoMetodoPago = false;
                        this.caja.venta.metodoPago.mostrarActualizarMetodoPago = false;
                        $("#txtDescripcionMetodoPago").removeClass("errorCampo");
                    }, error => {
                        this._router.navigate(["/login"]);
                    });
                }
                else {
                    this._toaster.error(this.agendaTranslate.metodoPagoExiste);
                }
            }
            else {
                if(!valExp.test(this.caja.venta.metodoPago.descripcionMetodoPago)){
                    this._toaster.error(this.agendaTranslate.metodoPagoFormato);
                }

                if(!floatRegex.test(this.caja.venta.metodoPago.comisionMetodoPago)){
                    this._toaster.error("El formato de la Comisión es incorrecto");
                }

                if(!floatRegex.test(this.caja.venta.metodoPago.comisionPorcentualMetodoPago)){
                    this._toaster.error("El formato de la Comisión es incorrecto");
                }

            }
        }
        else {
            if(this.caja.venta.metodoPago.descripcionMetodoPago == ""){
                $("#txtDescripcionMetodoPago").addClass("errorCampo");
            }

            if(this.caja.venta.metodoPago.comisionMetodoPago == ""){
                this.caja.venta.metodoPago.comisionMetodoPago = 0;
            }

            if(this.caja.venta.metodoPago.comisionPorcentualMetodoPago == ""){
                this.caja.venta.metodoPago.comisionPorcentualMetodoPago = 0;
            }
        }
    }

    caja_venta_metodoPago_metodoEsEfectivo (entity:any) {
        var params:any = {};
        params.descripcion = entity.descripcion;
        params.idMetodoPagoSucursal = entity.idMetodoPagoSucursal;
        params.isEfectivo = 1;
        params.comision = entity.comision;
        params.comision = entity.comisionPorcentual;

        this._backService.HttpPost("catalogos/Metodo_pago_sucursal/actualizarMetodoPagoSucursal", {}, params).subscribe( (data:any) => {
            this.caja_venta_metodoPago_consultaMetodosPago();
            this.caja.venta.metodoPago.descripcionMetodoPago = "";
            this.caja.venta.metodoPago.mostrarNuevoMetodoPago = false;
            this.caja.venta.metodoPago.mostrarActualizarMetodoPago = false;
            $("#txtDescripcionMetodoPago").removeClass("errorCampo");
        }, error => {
            this._router.navigate(["/login"]);
        });
    }

    caja_venta_metodoPago_preparacionBorrarMetodoPago (entity:any) {
        this.caja.venta.metodoPago.metodoPagoABorrar = entity.idMetodoPagoSucursal;        
        this.caja_venta_metodoPago_modalBorrarMetodoPago(this.agendaTranslate.borrarMetodoPago);
    }

    caja_venta_metodoPago_borrarMetodoPago () {
        if (this.caja.venta.dataMetodoPago.length != 2) {
            var params:any = {};
            params.idMetodoPagoSucursal = this.caja.venta.metodoPago.metodoPagoABorrar;

            this._backService.HttpPost("catalogos/Metodo_pago_sucursal/borrarMetodoPagoSucursal", {}, params).subscribe( (data:any) => {
                this.caja_venta_metodoPago_consultaMetodosPago();
                this.modales.borrarMetodoPago.hide();
            }, error => {
                this._router.navigate(["/login"]);
            });
        }
        else {
            this.modales.borrarMetodoPago.hide();
            this._toaster.error(this.agendaTranslate.existieMetodoPago);
        }
    }

    caja_venta_metodoPago_modalBorrarMetodoPago (message:any) {
        this.modales.borrarMetodoPago.show();
    };

    caja_venta_metodoPago_salirModalMetodoPagos () {
        this._pantallaServicio.mostrarSpinner();
        this.modales.modalMetodoPago.hide();
        this.caja.venta.metodoPago.descripcionMetodoPago = "";
        this.caja.venta.metodoPago.mostrarNuevoMetodoPago = false;
        this.caja.venta.metodoPago.mostrarActualizarMetodoPago = false;
        this.caja_venta_getMetodoPago();        
    }

    caja_venta_metodoPago_actualizarComision (tipo:any){
        if(tipo == 1){
            this.caja.venta.metodoPago.comisionPorcentualMetodoPago = 0;
        }
        if(tipo == 2){
            this.caja.venta.metodoPago.comisionMetodoPago = 0;

            if(Number(this.caja.venta.metodoPago.comisionPorcentualMetodoPago) > 100){
                this.caja.venta.metodoPago.comisionPorcentualMetodoPago = 100;
            }
        }
    }

    caja_venta_getMetodoPagoCerrarCatalogo () {
        // Función que carga el listado de los metodos de pago y quita de los metodos de caja, los que se quitaron del listado 
        this._backService.HttpPost("procesos/agenda/Agenda/selectMetodoPago", {}, {}).subscribe( (data:any) => {
            this.caja.venta.dataMetodoPago = [];
            this.caja.venta.dataMetodoPago = eval(data);
            this.caja.venta.dataMetodoPago.push({ descripcion: this.agendaTranslate.nuevoPuntos, idMetodoPagoSucursal: -1 });

            for( var i = 0; i < this.caja.venta.metodosDePago.length; i++) {
                var existe = false;
                for (var j = 0; j < this.caja.venta.dataMetodoPago.length; j++) {
                    if (this.caja.venta.metodosDePago[i].idMetodoPagoSucursal == this.caja.venta.dataMetodoPago[j].idMetodoPagoSucursal) {
                        this.caja.venta.metodosDePago[i].isEfectivo = this.caja.venta.dataMetodoPago[j].isEfectivo;
                        existe = true;
                    }
                }
                if (!existe) {
                    this.caja.venta.metodosDePago.splice(i, 1);
                    i--;
                }
            }

            this.dataSourceMetodoPago.data = this.caja.venta.dataMetodoPago;
            this.dataSourceMetodoPago.paginator = this.paginacionMetodoPago;
		    this.dataSourceMetodoPago.sort = this.sort;
            this.caja_venta_calcularTotalCobro();
        }, error => {
            this._router.navigate(["/login"]);
        });
    }

    // ------------------------------------------------------------------------ APARTADO DE RETIRO DE EFECTIVO -------------------------------------------------------------------------
    // nombreUsuario:any;
    caja_retiroEfectivo_mostarModalRetiro () {
        this.caja_retiroEfectivo_limpiarValidacionesRetiro();

        this.caja.retiroEfectivo.imprimirFacturabtn = 0; //quitar el if y quitar el valor
        
        this.caja.retiroEfectivo.msgUsuarioRetiro = "Usuario: " + this._pantallaServicio.datos_pantalla.nombreUsuario;


        this.caja.retiroEfectivo.motivoRetiro = "";
        this.caja.retiroEfectivo.montoRetiro = "";

        this.caja.retiroEfectivo.UsuarioFirma = "";
        this.caja.retiroEfectivo.ContraFirma = "";

        this.caja.retiroEfectivo.montoRetiroMaximo = 0;

        this._backService.HttpPost("procesos/Movimientos/calcularTopeRetiro", {}, {}).subscribe( (data:any) => {
            var datosUsuario = eval(data);
            this.caja.retiroEfectivo.montoRetiroMaximo = datosUsuario[0].TopeRetiro;
        }, error => {
            this._router.navigate(["/login"]);
        });

        this.caja.retiroEfectivo.date = new Date();

        this._pantallaServicio.ocultarSpinner();
    }

    caja_retiroEfectivo_FirmaAutorizacion () {
        this.caja_retiroEfectivo_limpiarValidacionesRetiro();
        this.caja.retiroEfectivo.montoRetiroFloat = Number(this.caja.retiroEfectivo.montoRetiro);
        this.caja_retiroEfectivo_validarModRetiro();
        this.caja_retiroEfectivo_validarModRetiroFirma();

        if (this.caja.retiroEfectivo.validarModRetiro.validacion == true && this.caja.retiroEfectivo.validarModRetiroFirma.validacion == true) {                
            this.caja_retiroEfectivo_validarFirmaUsuario();
        }
    }

    caja_retiroEfectivo_validarModRetiro () {
        this.caja.retiroEfectivo.validarModRetiro.validacion = true;

        if (this.caja.retiroEfectivo.motivoRetiro == "") {
            $("#txtMotivoRetiro").addClass("errorCampo");
            this.caja.retiroEfectivo.validarModRetiro.validacion = false;
        }

        if (this.caja.retiroEfectivo.montoRetiro == "" || this.caja.retiroEfectivo.montoRetiroFloat <= 0) {
            $("#txtMontoRetiro").addClass("errorCampo");
            
            this.caja.retiroEfectivo.validarModRetiro.validacion = false;
        }
    }

    caja_retiroEfectivo_validarModRetiroFirma () {
        this.caja.retiroEfectivo.validarModRetiroFirma.validacion = true;

        if (this.caja.retiroEfectivo.UsuarioFirma == "") {
            $("#txtUsuarioFirmaRetiro").addClass("errorCampo");
            this.caja.retiroEfectivo.validarModRetiroFirma.validacion = false;
        }

        if (this.caja.retiroEfectivo.ContraFirma == "") {
            $("#txtContraFirmaRetiro").addClass("errorCampo");
            this.caja.retiroEfectivo.validarModRetiroFirma.validacion = false;
        }
    }

    caja_retiroEfectivo_validarFirmaUsuario () {
      
        var params:any = {};
        params.UsuarioFirma = this.caja.retiroEfectivo.UsuarioFirma;
        params.Contra = this.caja.retiroEfectivo.ContraFirma;
        params.idSucursal = this._pantallaServicio.idSucursal;
        params.opcion = 1;

        this._backService.HttpPost("procesos/Movimientos/validarFirmaRetiro", {}, params).subscribe( (data:any) => {
            var datosUsuario = eval(data);

            if (datosUsuario.length == 0) {
                $("#txtUsuarioFirmaRetiro").addClass("errorCampo");
                $("#txtContraFirmaRetiro").addClass("errorCampo");
                this._toaster.error('El usuario y/o contraseña son incorrectos o no tiene la autorización correspondiente');
            } 
            else {

                this._backService.HttpPost("procesos/Movimientos/calcularTopeRetiro", {}, {}).subscribe( (data:any) => {
                    var datosUsuario2 = eval(data);
                    this.caja.retiroEfectivo.montoRetiroMaximo = datosUsuario2[0].TopeRetiro;


                    if(this.caja.retiroEfectivo.montoRetiro > this.caja.retiroEfectivo.montoRetiroMaximo){
                        this._toaster.error('El monto ingresado excede el limite permitido a retirar');
                    }else{
                        this.caja.retiroEfectivo.idGerenteUsuarioFirma = datosUsuario[0]['idUsuarioSucursal'];
                        this.caja.retiroEfectivo.validacionFirmaAutorizacion = 1;
                        this.caja_retiroEfectivo_insertarRetiroEfectivo();
                    }
                }, error => {
                    this._router.navigate(["/login"]);
                });
            }
        }, error => {
            this._router.navigate(["/login"]);
        });
           
    }

    caja_retiroEfectivo_insertarRetiroEfectivo () {
      
        var params:any = {};
        params.UsuarioFirma = this.caja.retiroEfectivo.UsuarioFirma;
        params.Contra = this.caja.retiroEfectivo.ContraFirma;

        params.nombreUsuario = this._pantallaServicio.datos_pantalla.nombreUsuario;
        params.idSucursal = this._pantallaServicio.idSucursal;
                
        params.idGerenteUsuarioFirma = this.caja.retiroEfectivo.idGerenteUsuarioFirma;
        params.motivoRetiro = this.caja.retiroEfectivo.motivoRetiro;
        params.montoRetiro = this.caja.retiroEfectivo.montoRetiro;
        params.diaHoy = this.caja.retiroEfectivo.date;

        this._backService.HttpPost("procesos/Movimientos/insertarRetiroEfectivo", {}, params).subscribe( (data:any) => {
            var idsReporte = (eval(data));

            var folioReal = idsReporte[0]['folio'];
            params.folio = folioReal;

            this._backService.HttpPost("procesos/Movimientos/consultarRetiroEfectivo", {}, params).subscribe( (data:any) => {
                var DatosRetiroEfectivo = (eval(data));

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

                this.caja_retiroEfectivo_limpiarValidacionesRetiro();
                this.caja.retiroEfectivo.motivoRetiro = "";
                this.caja.retiroEfectivo.montoRetiro = "";

                this.caja.retiroEfectivo.UsuarioFirma = "";
                this.caja.retiroEfectivo.ContraFirma = "";

                this.modales.ticketRetiro.show();
            }, error => {
                this._router.navigate(["/login"]);
            });
        }, error => {
            this._router.navigate(["/login"]);
        });
  
    }

    caja_retiroEfectivo_limpiarValidacionesRetiro () {
        //validaciones modal retiro efectivo
        $("#txtMotivoRetiro").removeClass("errorCampo");
        $("#txtMontoRetiro").removeClass("errorCampo");
        $("#txtUsuarioFirmaRetiro").removeClass("errorCampo");
        $("#txtContraFirmaRetiro").removeClass("errorCampo");
    }

    caja_retiroEfectivo_validarMonto (){
        $("#btnFirmaAutorizacion").prop( "disabled", false );
        if(this.caja.retiroEfectivo.montoRetiro > this.caja.retiroEfectivo.montoRetiroMaximo){
            this._toaster.error('El monto ingresado excede el limite permitido a retirar (Max. $'+this.caja.retiroEfectivo.montoRetiroMaximo+')');
            $("#btnFirmaAutorizacion").prop( "disabled", true );            
        }
    }

    // --------------------------------------------------------------------------- APARTADO DE CORTE DE CAJA ---------------------------------------------------------------------------

    // ---------------------------------- Funciones de Carga ----------------------------------
    caja_corte_pasarCorteCaja () {
        this._pantallaServicio.mostrarSpinner();

        this.caja.corte.primeraConsultaHecha = false;
        this.caja.corte.seccionCorte = 1;

        this.caja.corte.pageSize = 15;

        this.caja.corte.dataTipoCorte = [];
        this.caja.corte.tipoCorte = null;

        this.caja.corte.dataTiposAccion = [];
        this.caja.corte.tipoAccion = null;

        this.caja.corte.dataUsuario = [];
        this.caja.corte.usuario = null;

        this.caja.corte.dataMovimientos = [];
        this.caja.corte.totalDataMovimientos = 0;

        this.caja.corte.montosEfectivo = [];
        this.caja.corte.totalMontoEfectivo = 0;

        this.caja.corte.totalVoucher = 0;
        this.caja.corte.totalIngresos = 0;

        this.caja.corte.totalFondoCaja = 0;
        this.caja.corte.dataPromociones = [];
        this.caja.corte.totalPromociones = 0;
        this.caja.corte.totalDiferenciaCaja = 0;

        this.caja.corte.totalFaltante = 0;

        this.caja.corte.totalRetirosEfectivo = 0;
        this.caja.corte.totalDevoluciones = 0;
        this.caja.corte.totalPropinas = 0;

        // Corte
        this.caja.corte.nombreTipoCorte = "";
        this.caja.corte.nombreUsuario = "";
        this.caja.corte.fechaCorte = "";
        this.caja.corte.mostrarAutorizacion = false;
        this.caja.corte.autorizacionUsuario = "";
        this.caja.corte.autorizacionContra = "";

        //
        this.caja.corte.considerarFondo = true;

        this.caja_corte_declararMontosEfectivo();
        this.caja_corte_declararTiposAccion();

        this.caja_corte_consultaTiposCorte();        
    }

    caja_corte_prevenirFechaCorte (){
        if (!this.caja.corte.fechaAltaCorte) {
            this.caja.corte.fechaAltaCorte = new Date();
        }
    }

    caja_corte_declararMontosEfectivo () {

        this.caja.corte.montosEfectivo[0] = {};
        this.caja.corte.montosEfectivo[0].id = 1;
        this.caja.corte.montosEfectivo[0].monto = 500;
        this.caja.corte.montosEfectivo[0].cantidad = 0;

        this.caja.corte.montosEfectivo[1] = {};
        this.caja.corte.montosEfectivo[1].id = 2;
        this.caja.corte.montosEfectivo[1].monto = 200;
        this.caja.corte.montosEfectivo[1].cantidad = 0;

        this.caja.corte.montosEfectivo[2] = {};
        this.caja.corte.montosEfectivo[2].id = 3;
        this.caja.corte.montosEfectivo[2].monto = 100;
        this.caja.corte.montosEfectivo[2].cantidad = 0;

        this.caja.corte.montosEfectivo[3] = {};
        this.caja.corte.montosEfectivo[3].id = 4;
        this.caja.corte.montosEfectivo[3].monto = 50;
        this.caja.corte.montosEfectivo[3].cantidad = 0;

        this.caja.corte.montosEfectivo[4] = {};
        this.caja.corte.montosEfectivo[4].id = 5;
        this.caja.corte.montosEfectivo[4].monto = 20;
        this.caja.corte.montosEfectivo[4].cantidad = 0;

        this.caja.corte.montosEfectivo[5] = {};
        this.caja.corte.montosEfectivo[5].id = 6;
        this.caja.corte.montosEfectivo[5].monto = 10;
        this.caja.corte.montosEfectivo[5].cantidad = 0;

        this.caja.corte.montosEfectivo[6] = {};
        this.caja.corte.montosEfectivo[6].id = 7;
        this.caja.corte.montosEfectivo[6].monto = 5;
        this.caja.corte.montosEfectivo[6].cantidad = 0;

        this.caja.corte.montosEfectivo[7] = {};
        this.caja.corte.montosEfectivo[7].id = 8;
        this.caja.corte.montosEfectivo[7].monto = 2;
        this.caja.corte.montosEfectivo[7].cantidad = 0;

        this.caja.corte.montosEfectivo[8] = {};
        this.caja.corte.montosEfectivo[8].id = 9;
        this.caja.corte.montosEfectivo[8].monto = 1;
        this.caja.corte.montosEfectivo[8].cantidad = 0;
    }

    caja_corte_declararTiposAccion () {
        this.caja.corte.dataTiposAccion[0] = {};
        this.caja.corte.dataTiposAccion[0].id = 1;
        this.caja.corte.dataTiposAccion[0].descripcion = "Diferencia";

        this.caja.corte.dataTiposAccion[1] = {};
        this.caja.corte.dataTiposAccion[1].id = 2;
        this.caja.corte.dataTiposAccion[1].descripcion = "Condonar";
    }

    caja_corte_consultaTiposCorte () {
        this.caja.corte.dataUsuario = [];
        this.caja.corte.usuario = null;
        this.caja.corte.dataMovimientos = [];
        this.caja.corte.totalDataMovimientos = 0;
        this.caja_corte_calcularTotalDiferenciaCaja();

        var params:any = {};

        if (!this.caja.corte.fechaAltaCorte) {
            params.fecha = new Date();
        }
        else{
            // params.fecha = this.caja.corte.fechaAltaCorte;
            var f1 = this.caja.corte.fechaAltaCorte.split("-");            

            params.fecha = new Date();            
            params.fecha.setFullYear(f1[0], f1[1]-1, f1[2]);            
            params.fecha.setHours(0, 0, 0, 0);
        }

        this._backService.HttpPost("procesos/agenda/Agenda/corteConsultaTipoCorte", {}, params).subscribe( (data:any) => {
            this.caja.corte.dataTipoCorte = eval(data);
            this.caja.corte.primeraConsultaHecha = true;
            this.caja_corte_consultarPromociones();
        }, error => {
            this._router.navigate(["/login"]);
        });
    }

    // --------------------------------- Apartado de Usuarios ---------------------------------
    caja_corte_consultaUsuarios () {
        this._pantallaServicio.mostrarSpinner();
        this.caja.corte.dataMovimientos = [];
        this.caja.corte.totalDataMovimientos = 0;
        this.caja_corte_calcularTotalDiferenciaCaja();
        if (this.caja.corte.tipoCorte != 3) {
            this.caja.corte.usuario = null;
            var params:any = {};
            params.idCajaCorteTipo = this.caja.corte.tipoCorte;
            if (!this.caja.corte.fechaAltaCorte) {
                params.fecha = new Date();
            }
            else{
                // params.fecha = this.caja.corte.fechaAltaCorte;
                var f1 = this.caja.corte.fechaAltaCorte.split("-");            

                params.fecha = new Date();            
                params.fecha.setFullYear(f1[0], f1[1]-1, f1[2]);            
                params.fecha.setHours(0, 0, 0, 0);
            }

            this._backService.HttpPost("procesos/agenda/Agenda/corteConsultaUsuarios", {}, params).subscribe( (data:any) => {
                this.caja.corte.dataUsuario = eval(data);
                this._pantallaServicio.ocultarSpinner();
            }, error => {
                this._router.navigate(["/login"]);
            });
        }
        else {
            this.caja_corte_consultaMovimientosUsuario();
        }
    }

    // ------------------------------- Movimientos de Usuarios --------------------------------
    caja_corte_consultaMovimientosUsuario () {
        this._pantallaServicio.mostrarSpinner();
        var params:any = {};
        if (this.caja.corte.tipoCorte != 3) {
            params.idUsuarioSucursal = this.caja.corte.usuario;
        }
        else {
            params.idUsuarioSucursal = null;
        }
        if (!this.caja.corte.fechaAltaCorte) {
            params.fecha = new Date();
        }
        else{
            // params.fecha = new Date(this.caja.corte.fechaAltaCorte);
            var f1 = this.caja.corte.fechaAltaCorte.split("-");            

            params.fecha = new Date();            
            params.fecha.setFullYear(f1[0], f1[1]-1, f1[2]);            
            params.fecha.setHours(0, 0, 0, 0);            
        }

        this._backService.HttpPost("procesos/agenda/Agenda/corteConsultaMovimientosUsuario", {}, params).subscribe( (data:any) => {
            this.caja.corte.dataMovimientos = eval(data);
            

            this.caja.corte.totalDataMovimientos = 0;
            for (var i = 0; i < this.caja.corte.dataMovimientos.length; i++) {
                if(this.caja.corte.dataMovimientos[i].idSucursal != null){
                    this.caja.corte.totalDataMovimientos += Number(this.caja.corte.dataMovimientos[i].sumaPago);
                }
            }

            this.caja_corte_consultaRetirosEfectivoUsuario();
        }, error => {
            this._router.navigate(["/login"]);
        });
    }

    // -------------------------- Devoluciones y Retiros de Efectivo --------------------------
    caja_corte_consultaRetirosEfectivoUsuario () {
        var params:any = {};
        if (this.caja.corte.tipoCorte != 3) {
            params.idUsuarioSucursal = this.caja.corte.usuario;
        }
        else {
            params.idUsuarioSucursal = null;
        }
        if (!this.caja.corte.fechaAltaCorte) {
            params.fecha = new Date();
        }
        else{
            // params.fecha = this.caja.corte.fechaAltaCorte;
            var f1 = this.caja.corte.fechaAltaCorte.split("-");            

            params.fecha = new Date();            
            params.fecha.setFullYear(f1[0], f1[1]-1, f1[2]);            
            params.fecha.setHours(0, 0, 0, 0);
        }

        this._backService.HttpPost("procesos/agenda/Agenda/corteConsultaRetirosEfectivoUsuario", {}, params).subscribe( (data:any) => {
            this.caja.corte.totalRetirosEfectivo = Number(data);
            this.caja.corte.totalDataMovimientos = this.caja.corte.totalDataMovimientos - Number(this.caja.corte.totalRetirosEfectivo);
            if(this.caja.corte.totalDataMovimientos < 0){
                this.caja.corte.totalDataMovimientos = 0;
            }

            this.caja_corte_consultaDevolucionesUsuario();
        }, error => {
            this._router.navigate(["/login"]);
        });
    }

    caja_corte_consultaDevolucionesUsuario () {
        var params:any = {};
        if (this.caja.corte.tipoCorte != 3) {
            params.idUsuarioSucursal = this.caja.corte.usuario;
        }
        else {
            params.idUsuarioSucursal = null;
        }
        if (!this.caja.corte.fechaAltaCorte) {
            params.fecha = new Date();
        }
        else{
            // params.fecha = this.caja.corte.fechaAltaCorte;
            var f1 = this.caja.corte.fechaAltaCorte.split("-");            

            params.fecha = new Date();            
            params.fecha.setFullYear(f1[0], f1[1]-1, f1[2]);            
            params.fecha.setHours(0, 0, 0, 0);
        }

        this._backService.HttpPost("procesos/agenda/Agenda/corteConsultaDevolucionesUsuario", {}, params).subscribe( (data:any) => {
            this.caja.corte.totalDevoluciones = Number(data);
            this.caja.corte.totalDataMovimientos = this.caja.corte.totalDataMovimientos - Number(this.caja.corte.totalDevoluciones);
            if(this.caja.corte.totalDataMovimientos < 0){
                this.caja.corte.totalDataMovimientos = 0;
            }

            this.caja_corte_consultaPropinas();
        }, error => {
            this._router.navigate(["/login"]);
        });
    }

    caja_corte_consultaPropinas () {
        var params:any = {};
        if (this.caja.corte.tipoCorte != 3) {
            params.idUsuarioSucursal = this.caja.corte.usuario;
        }
        else {
            params.idUsuarioSucursal = null;
        }
        if (!this.caja.corte.fechaAltaCorte) {
            params.fecha = new Date();
        }
        else{
            // params.fecha = this.caja.corte.fechaAltaCorte;
            var f1 = this.caja.corte.fechaAltaCorte.split("-");            

            params.fecha = new Date();            
            params.fecha.setFullYear(f1[0], f1[1]-1, f1[2]);            
            params.fecha.setHours(0, 0, 0, 0);
        }

        this._backService.HttpPost("procesos/agenda/Agenda/corteConsultaPropinas", {}, params).subscribe( (data:any) => {
            this.caja.corte.totalPropinas = Number(data);

            this.caja_corte_calcularTotalDiferenciaCaja();

            this._pantallaServicio.ocultarSpinner();
        }, error => {
            this._router.navigate(["/login"]);
        });
    }

    // -------------------------------- Ingresos de Cantidades --------------------------------
    caja_corte_quitarCerosMontoEfectivo (me:any) {
        if (me.cantidad == 0) {
            me.cantidad = "";
        }
    }

    caja_corte_ponerCerosMontoEfectivo (me:any) {
        if (me.cantidad == "") {
            me.cantidad = 0;
            this.caja_corte_calcularTotalMontoEfectivo(me);
        }
    }

    caja_corte_quitarCerosTotalVoucher () {
        if (this.caja.corte.totalVoucher == 0) {
            this.caja.corte.totalVoucher = "";
        }
    }

    caja_corte_ponerCerosTotalVoucher () {
        if (this.caja.corte.totalVoucher == "") {
            this.caja.corte.totalVoucher = 0;
            this.caja_corte_calcularTotalIngresos();
        }
    }

    // --------------------------------- Totales de Ingresos ----------------------------------
    caja_corte_calcularTotalMontoEfectivo (me:any) {

        var floatRegex = RegExp("^[0-9]*$");

        if (me.cantidad !== "") {
            if (!floatRegex.test(me.cantidad)) {
                me.cantidad = 0;
            }

            this.caja.corte.totalMontoEfectivo = 0;
            for (var i = 0; i < this.caja.corte.montosEfectivo.length; i++) {
                this.caja.corte.totalMontoEfectivo += (Number(this.caja.corte.montosEfectivo[i].monto) * Number(this.caja.corte.montosEfectivo[i].cantidad));
            }
            this.caja_corte_calcularTotalIngresos();
        }
    }

    caja_corte_validarTotalVoucher () {
        var floatRegex = RegExp("^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$");

        if (this.caja.corte.totalVoucher !== "") {
            if (!floatRegex.test(this.caja.corte.totalVoucher)) {
                this.caja.corte.totalVoucher = 0;
            }
            this.caja_corte_calcularTotalIngresos();
        }
    }

    caja_corte_calcularTotalIngresos () {
        this.caja.corte.totalIngresos = 0;
        this.caja.corte.totalIngresos = this.caja.corte.totalMontoEfectivo + Number(this.caja.corte.totalVoucher);
        this.caja_corte_calcularTotalDiferenciaCaja();
    }

    // ------------------------------------- Promociones --------------------------------------
    caja_corte_consultarPromociones () {
        var params:any = {};

        if (!this.caja.corte.fechaAltaCorte) {
            params.fecha = new Date();
        }
        else{
            // params.fecha = this.caja.corte.fechaAltaCorte;
            var f1 = this.caja.corte.fechaAltaCorte.split("-");            

            params.fecha = new Date();            
            params.fecha.setFullYear(f1[0], f1[1]-1, f1[2]);            
            params.fecha.setHours(6, 0, 0, 0);
        }

        this._backService.HttpPost("procesos/agenda/Agenda/corteConsultaPromociones", {}, params).subscribe( (data:any) => {
            this.caja.corte.dataPromociones = eval(data);

            this.caja.corte.totalPromociones = 0;
            for (var i = 0; i < this.caja.corte.dataPromociones.length; i++) {
                if (this.caja.corte.dataPromociones[i].idPagoClienteTipo != 3) {
                    this.caja.corte.totalPromociones += Number(this.caja.corte.dataPromociones[i].descuento);
                }
                else {
                    this.caja.corte.totalPromociones += Number(this.caja.corte.dataPromociones[i].promocion);
                }
            }

            this.dataSourceCortePromociones.data = this.caja.corte.dataPromociones;
            this.dataSourceCortePromociones.paginator = this.paginacionCortePromociones;
		    this.dataSourceCortePromociones.sort = this.sort;
            this.caja_corte_consultaFondoCaja();
        }, error => {
            this._router.navigate(["/login"]);
        });
    }

    caja_corte_declararGridPromociones () {
        this.caja.corte.gridOptionsCortePromociones = {
            paginationPageSizes: [15, 50, 100],
            paginationPageSize: 15,
            enableSorting: true,
            enableColumnMenus: false,
            columnDefs: [
                { field: 'folio_caja', displayName: "Folio", minWidth: '100', headerCellClass: 'alignCenter', cellClass: 'alignCenter' },
                { field: 'fechaAlta', displayName: "Fecha", width: '150', headerCellClass: 'alignCenter', cellClass: 'alignCenter', cellFilter: 'date:\'dd-MM-yyyy hh:mm a\'' },
                { field: 'nombrePersonal', displayName: "Personal", width: '150', headerCellClass: 'alignCenter', cellClass: 'alignCenter' },
                { field: 'nombreCliente', displayName: "Cliente", width: '150', headerCellClass: 'alignCenter', cellClass: 'alignCenter' },
                { field: 'descripcion', displayName: "Descripcion", width: '200', headerCellClass: 'alignCenter', cellClass: 'alignCenter' },
                { field: 'total', displayName: "Total", width: '120', headerCellClass: 'alignCenter', cellClass: 'alignCenter', cellFilter: 'currency' },
                { field: 'pago', displayName: "Pago", width: '120', headerCellClass: 'alignCenter', cellClass: 'alignCenter', cellFilter: 'currency' },
                { field: 'descuento', displayName: "Descuento", width: '120', headerCellClass: 'alignCenter', cellClass: 'alignLeft2', cellFilter: 'currency' },
                { field: 'promocion', displayName: "Promoción", minWidth: '120', headerCellClass: 'alignCenter', cellClass: 'alignLeft2', cellFilter: 'currency'}
            ],
            data: '$root.caja.corte.dataPromociones'
            ,
            onRegisterApi: (gridApi:any) => {
                // this.gridApi = gridApi;
                // gridApi.pagination.on.paginationChanged($scope, (newPage, pageSize) => {
                //     this.caja.corte.pageSize = pageSize;
                // });
            }
        };
    };
    
    caja_corte_abrirModalCortePromociones () {
        this.modales.modalCortePromociones.show();
    }

    // ----------------------------------- Fondo de Caja --------------------------------------
    caja_corte_consultaFondoCaja () {
        this._backService.HttpPost("procesos/agenda/Agenda/corteConsultaFondoCaja", {}, {}).subscribe( (data:any) => {
            this.caja.corte.totalFondoCaja = Number(eval(data)[0].valor);
            this.caja_corte_calcularTotalDiferenciaCaja();
            
            this._pantallaServicio.ocultarSpinner();
        }, error => {
            this._router.navigate(["/login"]);
        });
    }

    caja_corte_cambiarFondoCaja () {
        var floatRegex = RegExp("^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$");

        if (this.caja.corte.totalFondoCaja !== "") {
            if (!floatRegex.test(this.caja.corte.totalFondoCaja)) {
                this.caja.corte.totalFondoCaja = 0;
            }
            this.caja_corte_calcularTotalDiferenciaCaja();
        }
    }

    caja_corte_cambiarConsideracionFondoCaja () {
        if(this.caja.corte.considerarFondo){
            this.caja_corte_calcularTotalDiferenciaCaja();
        }else{
            this.caja.corte.totalDiferenciaCaja = 0;
            this.caja_corte_calcularTotalDiferenciaCaja();
        }
    }

    caja_corte_quitarCeroFondoCaja () {
        if(this.caja.corte.totalFondoCaja == 0){
            this.caja.corte.totalFondoCaja = "";
        }
    }

    caja_corte_prevenirCeroFondoCaja () {
        if(this.caja.corte.totalFondoCaja == ""){
            this.caja.corte.totalFondoCaja = 0;
            this.caja_corte_calcularTotalDiferenciaCaja();
        }
    }

    // --------------------------------- Diferencia en Caja -----------------------------------
    caja_corte_calcularTotalDiferenciaCaja () {

        this.caja.corte.totalDiferenciaCaja = 0;
        this.caja.corte.totalFaltante = 0;

        if(this._pantallaServicio.idSucursal == 410){
            if(this.caja.corte.considerarFondo){
                this.caja.corte.totalDiferenciaCaja = Number(this.caja.corte.totalIngresos) - (Number(this.caja.corte.totalDataMovimientos) + Number(this.caja.corte.totalFondoCaja));
            }
            else{
                this.caja.corte.totalDiferenciaCaja = Number(this.caja.corte.totalIngresos) - (Number(this.caja.corte.totalDataMovimientos));            
            }

            if (this.caja.corte.totalDiferenciaCaja < 0) {
                this.caja.corte.totalFaltante = this.caja.corte.totalDiferenciaCaja * (-1);
            }

        }
        else {
            if(this.caja.corte.considerarFondo){
                this.caja.corte.totalDiferenciaCaja = Number(this.caja.corte.totalMontoEfectivo) + Number(this.caja.corte.totalFondoCaja) - Number(this.caja.corte.totalDevoluciones);
            }
            else{
                this.caja.corte.totalDiferenciaCaja = Number(this.caja.corte.totalMontoEfectivo) - Number(this.caja.corte.totalDevoluciones);            
            }

            if (this.caja.corte.totalDiferenciaCaja < 0) {
                this.caja.corte.totalFaltante = this.caja.corte.totalDiferenciaCaja * (-1);
            }
        }
    }

    // ----------------------------------- Realizar Corte -------------------------------------
    caja_corte_pasarARealizarCorte () {
        var realizarCorte = true;

        // $("#ddlCorteUsuario").removeClass("errorCampo");
        $("#ddlCorteUsuario > div:first-child").attr("style", "outline: none;");
        // $("#ddlTipoCorte").removeClass("errorCampo");
        $("#ddlTipoCorte > div:first-child").attr("style", "outline: none;");
        $("#uiSelectCorteTipoAccion").removeClass("errorCampo");

        if (this.caja.corte.tipoCorte) {
            if (this.caja.corte.tipoCorte == 1 || this.caja.corte.tipoCorte == 2) {
                if (!this.caja.corte.usuario) {
                    // $("#ddlCorteUsuario").addClass("errorCampo");
                    $("#ddlCorteUsuario > div:first-child").attr("style", "outline: red solid 1px !important;");
                    realizarCorte = false;
                }
            }
        }
        else {
            // $("#ddlTipoCorte").addClass("errorCampo");
            $("#ddlTipoCorte > div:first-child").attr("style", "outline: red solid 1px !important;");
            realizarCorte = false;
        }
        if (this.caja.corte.totalDiferenciaCaja < 0) {
            if (!this.caja.corte.tipoAccion) {
                $("#uiSelectCorteTipoAccion").addClass("errorCampo");
                realizarCorte = false;
            }
        }

        if (realizarCorte) {

            this.caja.corte.nombreTipoCorte = "";
            this.caja.corte.nombreUsuario = "";
            this.caja.corte.fechaCorte = "";
            
            for (var i = 0; i < this.caja.corte.dataTipoCorte.length; i++) {
                if (this.caja.corte.dataTipoCorte[i].idCajaCorteTipo == this.caja.corte.tipoCorte) {
                    this.caja.corte.nombreTipoCorte = this.caja.corte.dataTipoCorte[i].descripcion;
                }
            }

            for (var i = 0; i < this.caja.corte.dataUsuario.length; i++) {
                if (this.caja.corte.dataUsuario[i].idUsuarioSucursal == this.caja.corte.usuario) {
                    this.caja.corte.nombreUsuario = this.caja.corte.dataUsuario[i].nombre;
                }
            }

            var d = new Date();
            // this.caja.corte.fechaCorte = ("0" + d.getDate()).slice(-2) + " / " + ("0"+(d.getMonth()+1)).slice(-2) + " / " + d.getFullYear() + " - " + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
            this.caja.corte.fechaCorte = d;
            
            this.modales.modalRealizarCorte.show();
        }
        
    }

    caja_corte_mostrarFirmaAutorizacion () {
        if (this.caja.corte.mostrarAutorizacion) {
            this.caja.corte.mostrarAutorizacion = false;
        }
        else {
            this.caja.corte.mostrarAutorizacion = true;
        }        
    }

    caja_corte_realizarCorte () {
        this._pantallaServicio.mostrarSpinner();

        $("#corteUsuario").removeClass("errorCampo");
        $("#corteContra").removeClass("errorCampo");

        if (this.caja.corte.autorizacionUsuario != "" && this.caja.corte.autorizacionContra != "") {
            var params:any = {};

            params.idCajaCorteTipo = this.caja.corte.tipoCorte;
            if (this.caja.corte.tipoCorte != 3) {
                params.idUsuarioSucursal = this.caja.corte.usuario;
            }
            else {
                params.idUsuarioSucursal = null;
            }
            if (this.caja.corte.totalDiferenciaCaja < 0) {
                params.idCajaCorteAccion = this.caja.corte.tipoAccion;
            }
            else {
                params.idCajaCorteAccion = null;
            }
            params.fondoCaja = this.caja.corte.totalFondoCaja;
            params.montoPromociones = this.caja.corte.totalPromociones;
            params.montoDiferencia = this.caja.corte.totalDiferenciaCaja;
            params.montoDescuentos = this.caja.corte.totalPromociones;

            var montoIngresoMP = 0;
            var montoIngresoEfectivo = 0;
            var idMP = 0;
            for (var i = 0; i < this.caja.corte.dataMovimientos.length; i++) {
                if (this.caja.corte.dataMovimientos[i].isEfectivo) {
                    montoIngresoEfectivo = Number(this.caja.corte.dataMovimientos[i].sumaPago);            
                    idMP = this.caja.corte.dataMovimientos[i].idMetodoPagoSucursal;
                }
                else {
                    montoIngresoMP = montoIngresoMP + Number(this.caja.corte.dataMovimientos[i].sumaPago)
                }
            }
            
            params.listaDetalle = [];
            params.listaDetalle.push({
                idMetodoPagoSucursal: idMP,
                montoIngreso: montoIngresoEfectivo,
                montoCaja: this.caja.corte.totalMontoEfectivo
            })

            params.listaDetalle.push({
                idMetodoPagoSucursal: null,
                montoIngreso: montoIngresoMP,
                montoCaja: this.caja.corte.totalVoucher
            })

            params.totalDevoluciones = this.caja.corte.totalDevoluciones;
            params.totalRetirosEfectivo = this.caja.corte.totalRetirosEfectivo;

            params.user = this.caja.corte.autorizacionUsuario;
            params.pass = this.caja.corte.autorizacionContra;

            if (!this.caja.corte.fechaAltaCorte) {
                params.fecha = new Date();
            }
            else{
                // params.fecha = this.caja.corte.fechaAltaCorte;
                var f1 = this.caja.corte.fechaAltaCorte.split("-");            

                params.fecha = new Date();            
                params.fecha.setFullYear(f1[0], f1[1]-1, f1[2]);            
                params.fecha.setHours(0, 0, 0, 0);
            }

            params.totalPropinas = this.caja.corte.totalPropinas;
            params.listaIngresos = JSON.parse(JSON.stringify(this.caja.corte.montosEfectivo));

            this._backService.HttpPost("procesos/agenda/Agenda/realizarCorteCaja", {}, params).subscribe( (data:any) => {
                if (Number(data) > 0) {

                    this.modales.modalRealizarCorte.hide();

                    var params:any = {};
                    params.idCajaCorte = data;
                    params.opc = 1;

                    this._backService.HttpPost("procesos/agenda/Agenda/corteConsultaTicket", {}, params).subscribe( (data:any) => {
                        var temp = eval(data);

                        this.caja.corte.ticket = {};
                        this.caja.corte.ticket.corte = {};

                        this.caja.corte.ticket.corte = temp[0];
                        this.caja.corte.ticket.corte.ingresos = [];

                        this.caja.corte.ticket.corte.fechaAlta = moment(this.caja.corte.ticket.corte.fechaAlta).format("DD MMM YYYY hh:mm A");

                        if(this.caja.corte.ticket.corte.idCajaCorteTipo == 1){
                            this.caja.corte.ticket.corte.nombreCorteTipo = "Parcial";
                        }
                        if(this.caja.corte.ticket.corte.idCajaCorteTipo == 2){
                            this.caja.corte.ticket.corte.nombreCorteTipo = "Término de Turno";
                        }
                        if(this.caja.corte.ticket.corte.idCajaCorteTipo == 3){
                            this.caja.corte.ticket.corte.nombreCorteTipo = "Cierre del día";
                        }

                        if(this.caja.corte.ticket.corte.idCajaCorteAccion == 1){
                            this.caja.corte.ticket.corte.nombreCorteAccion = "Diferencia";
                        }
                        if(this.caja.corte.ticket.corte.idCajaCorteAccion == 2){
                            this.caja.corte.ticket.corte.nombreCorteAccion = "Condonar";
                        }

                        params.opc = 2;

                        this._backService.HttpPost("procesos/agenda/Agenda/corteConsultaTicket", {}, params).subscribe( (data:any) => {
                            var temp = eval(data);
                            
                            this.caja.corte.ticket.corte.metodosPago = {};
                            this.caja.corte.ticket.corte.metodosPago = temp;

                            this.caja.corte.ticket.corte.totalMontoIngresos = 0;
                            this.caja.corte.ticket.corte.totalMontoCaja = 0;
                            
                            for (var i = 0; i < temp.length; i++) {
                                this.caja.corte.ticket.corte.totalMontoIngresos = this.caja.corte.ticket.corte.totalMontoIngresos + Number(temp[i].montoIngreso);
                                this.caja.corte.ticket.corte.totalMontoCaja = this.caja.corte.ticket.corte.totalMontoCaja + Number(temp[i].montoCaja);
                            }

                            params.opc = 3;

                            this._backService.HttpPost("procesos/agenda/Agenda/corteConsultaTicket", {}, params).subscribe( (data:any) => {
                                var temp = eval(data);
                            
                                this.caja.corte.ticket.corte.ingresos = {};
                                this.caja.corte.ticket.corte.ingresos = temp;

                                this.dataTicket = this.caja.corte.ticket;

                                this.caja_corte_pasarCorteCaja();

                                this.modales.ticketCorteCaja.show();
                            }, error => {
                                this.guardarError(error.error ? error.error.message : error.message, error.status, "Consultar ticket corte ingresos");
                            });
                        }, error => {
                            this.guardarError(error.error ? error.error.message : error.message, error.status, "Consultar ticket corte valores");
                        });
                    }, error => {
                        this.guardarError(error.error ? error.error.message : error.message, error.status, "Consultar ticket corte general");
                    });

                }
                else {
                    if(Number(data) == 0){
                        this._toaster.error("El usuario y/o contraseña son incorrectos");
                        this._pantallaServicio.ocultarSpinner();
                    }
                    if(Number(data) == -1){
                        this._toaster.error("El usuario no tiene la autorización correspondiente");
                        this._pantallaServicio.ocultarSpinner();
                    }
                }
            }, error => {
                this.guardarError(error.error ? error.error.message : error.message, error.status, "Corte de caja");
            });
        }
        else {
            this.caja.corte.mostrarAutorizacion = true;

            if (this.caja.corte.autorizacionUsuario == "") {
                $("#corteUsuario").addClass("errorCampo");
            }

            if (this.caja.corte.autorizacionContra == "") {
                $("#corteContra").addClass("errorCampo");
            }

            this._pantallaServicio.ocultarSpinner();
        }

    }

    mandarDataTicket(opc: any){
        this._ticketService.recibirParametrosGlobales(this.dataTicket);

        if(opc == 1){
            this._ticketService.imprimir_control_imprimirTicketCorteCaja();
        }

        if(opc == 2){
            this._ticketService.imprimir_control_mandarCorreoTicketCorteCaja();
        }
        
    }

    // --------------------------------- Apartado de Historial --------------------------------
    caja_corte_abrirHistorial () {
        this._pantallaServicio.mostrarSpinner();
        this.caja.corte.historial = {};
        this.caja.corte.historial.dataHistorial = [];
        this.caja.corte.historial.fechaInicio = moment().startOf('month').format('DD/MM/YYYY');
        this.caja.corte.historial.fechaFin = moment().endOf('month').format('DD/MM/YYYY');

        this.caja_corte_inicializarCalendario();
        this.caja_corte_consultaHistorial();

        this.modales.modalCorteHistorial.show();
    }

    caja_corte_inicializarCalendario () {
		        
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
        
        var fechaC = this.caja.corte.historial.fechaInicio + " - " +this.caja.corte.historial.fechaFin;
        this.caja.corte.historial.fechaCalendario = fechaC;
        this.primerCargaCorteCaja = 0;
    }

    primerCargaCorteCaja = 0;
    primerCargaCorteCajaOpen = 0;
    caja_corte_consultaHistorial () {
        if(this.primerCargaCorteCajaOpen >= 1){            
            this._pantallaServicio.mostrarSpinner();
            var params:any = {};

            if(this.primerCargaCorteCaja < 2){
                var fechasAux = this.caja.corte.historial.fechaCalendario.split(" - ");
                var f1 = fechasAux[0].split('/'); 
                var f2 = fechasAux[1].split('/');

                params.fechaInicio = new Date();
                params.fechaFin = new Date();
                params.fechaInicio.setFullYear(f1[2], f1[1]-1, f1[0]);
                params.fechaFin.setFullYear(f2[2], f2[1]-1, f2[0]);
                params.fechaInicio.setHours(0, 0, 0, 0);
                params.fechaFin.setHours(0, 0, 0, 0);

                // this.caja.corte.historial.fechaCalendario = format(new Date(params.fechaInicio), "dd/MM/yyyy") + " - " + format(new Date(params.fechaFin), "dd/MM/yyyy");
            }else{
                params.fechaInicio = new Date();
                params.fechaFin = new Date();
                params.fechaInicio.setFullYear(this.caja.corte.historial.fechaCalendario.startDate['$y'], (this.caja.corte.historial.fechaCalendario.startDate['$M']), this.caja.corte.historial.fechaCalendario.startDate['$D']);
                params.fechaFin.setFullYear(this.caja.corte.historial.fechaCalendario.endDate['$y'], (this.caja.corte.historial.fechaCalendario.endDate['$M']), this.caja.corte.historial.fechaCalendario.endDate['$D']);
                params.fechaInicio.setHours(0, 0, 0, 0);
                params.fechaFin.setHours(0, 0, 0, 0);
            }

            this.primerCargaCorteCaja += 1;

            this._backService.HttpPost("procesos/agenda/Agenda/corteConsultaHistorial", {}, params).subscribe( (data:any) => {
                this.caja.corte.historial.dataHistorial = eval(data);

                for( var i = 0; i < this.caja.corte.historial.dataHistorial.length; i++){
                    if(this.caja.corte.historial.dataHistorial[i].idCajaCorteTipo == 1){
                        this.caja.corte.historial.dataHistorial[i].nombreCorteTipo = "Parcial";
                    }
                    if(this.caja.corte.historial.dataHistorial[i].idCajaCorteTipo == 2){
                        this.caja.corte.historial.dataHistorial[i].nombreCorteTipo = "Término de Turno";
                    }
                    if(this.caja.corte.historial.dataHistorial[i].idCajaCorteTipo == 3){
                        this.caja.corte.historial.dataHistorial[i].nombreCorteTipo = "Cierre del día";
                    }

                    if(this.caja.corte.historial.dataHistorial[i].idCajaCorteAccion == 1){
                        this.caja.corte.historial.dataHistorial[i].nombreCorteAccion = "Diferencia";
                    }
                    if(this.caja.corte.historial.dataHistorial[i].idCajaCorteAccion == 2){
                        this.caja.corte.historial.dataHistorial[i].nombreCorteAccion = "Condonar";
                    }
                }

                this.dataSourceCorteHistorial.data = this.caja.corte.historial.dataHistorial;
                this.dataSourceCorteHistorial.paginator = this.paginacionCorteHistorial;
		        this.dataSourceCorteHistorial.sort = this.sort;
                this._pantallaServicio.ocultarSpinner();
            }, error => {
                this._router.navigate(["/login"]);
            });
        }
        this.primerCargaCorteCajaOpen += 1;
    }

    caja_corte_declararGridHistorial () {
        this.caja.corte.gridHistorial = {
            enableColumnMenus: false,
            enableSorting: true,
            paginationPageSizes: [15, 50, 100],
            paginationPageSize: 15,
            columnDefs: [
                { name: "Folio",            minWidth: '100', field: 'folioTicket',          headerCellClass: 'alignCenter', cellClass: 'alignCenter', cellTemplate: '<div class="ui-grid-cell-contents ng-binding ng-scope" style="margin-top:0px;"><a class="nwLink2"  href="javascript:void(0);" ng-click="$root.caja.corte.abrirTicketCorte(row.entity.idCajaCorte)">{{COL_FIELD}}</a></div>' },
                { name: "Tipo de Corte",    minWidth: '120', field: 'nombreCorteTipo',      headerCellClass: 'alignCenter', cellClass: 'alignCenter' },
                { name: "Acción",           minWidth: '120', field: 'nombreCorteAccion',    headerCellClass: 'alignCenter', cellClass: 'alignCenter' },
                { name: "Usuario Corte",    minWidth: '150', field: 'nombreUsuario',        headerCellClass: 'alignCenter', cellClass: 'alignCenter' },
                { name: "Fecha",            minWidth: '140', field: 'fechaAlta',            headerCellClass: 'alignCenter', cellClass: 'alignCenter', type: 'date', cellFilter: 'date:"dd/MM/yyyy hh:mm a"' },
                { name: "Fondo de Caja",    minWidth: '100', field: 'fondoCaja',            headerCellClass: 'alignCenter', cellClass: 'alignCenter', cellFilter: 'currency' },
                { name: "Promociones",      minWidth: '100', field: 'montoPromociones',     headerCellClass: 'alignCenter', cellClass: 'alignCenter', cellFilter: 'currency' },
                { name: "Diferencia",       minWidth: '100', field: 'montoDiferencia',      headerCellClass: 'alignCenter', cellClass: 'alignCenter', cellFilter: 'currency' },
                { name: "Retiros Efectivo", minWidth: '100', field: 'totalRetirosEfectivo', headerCellClass: 'alignCenter', cellClass: 'alignCenter', cellFilter: 'currency' },
                { name: "Devoluciones",     minWidth: '100', field: 'totalDevoluciones',    headerCellClass: 'alignCenter', cellClass: 'alignCenter', cellFilter: 'currency' },
                { name: "Dió de Alta",      minWidth: '150', field: 'nombreRealizoAlta',    headerCellClass: 'alignCenter', cellClass: 'alignCenter' },
                { name: "Autorizó",         minWidth: '150', field: 'nombreVerifico',       headerCellClass: 'alignCenter', cellClass: 'alignCenter' }
            ],
            data: "$root.caja.corte.historial.dataHistorial",
        };
    }

    // ----------------------------------- Ticket Corte Caja ----------------------------------
    caja_corte_abrirTicketCorte (idCajaCorte:any) {
        var params:any = {};
        params.idCajaCorte = idCajaCorte;
        params.opc = 1;

        this._backService.HttpPost("procesos/agenda/Agenda/corteConsultaTicket", {}, params).subscribe( (data:any) => {
            var temp = eval(data);

            this.caja.corte.ticket = {};
            this.caja.corte.ticket.corte = {};            

            this.caja.corte.ticket.corte = temp[0];
            this.caja.corte.ticket.corte.ingresos = [];

            this.caja.corte.ticket.corte.fechaAlta = moment(this.caja.corte.ticket.corte.fechaAlta).format("DD MMM YYYY hh:mm A");

            if(this.caja.corte.ticket.corte.idCajaCorteTipo == 1){
                this.caja.corte.ticket.corte.nombreCorteTipo = "Parcial";
            }
            if(this.caja.corte.ticket.corte.idCajaCorteTipo == 2){
                this.caja.corte.ticket.corte.nombreCorteTipo = "Término de Turno";
            }
            if(this.caja.corte.ticket.corte.idCajaCorteTipo == 3){
                this.caja.corte.ticket.corte.nombreCorteTipo = "Cierre del día";
            }

            if(this.caja.corte.ticket.corte.idCajaCorteAccion == 1){
                this.caja.corte.ticket.corte.nombreCorteAccion = "Diferencia";
            }
            if(this.caja.corte.ticket.corte.idCajaCorteAccion == 2){
                this.caja.corte.ticket.corte.nombreCorteAccion = "Condonar";
            }

            params.opc = 2;

            this._backService.HttpPost("procesos/agenda/Agenda/corteConsultaTicket", {}, params).subscribe( (data:any) => {
                var temp = eval(data);
                            
                this.caja.corte.ticket.corte.metodosPago = {};
                this.caja.corte.ticket.corte.metodosPago = temp;
                
                this.caja.corte.ticket.corte.totalMontoIngresos = 0;
                this.caja.corte.ticket.corte.totalMontoCaja = 0;
                            
                for (var i = 0; i < temp.length; i++) {
                    this.caja.corte.ticket.corte.totalMontoIngresos = this.caja.corte.ticket.corte.totalMontoIngresos + Number(temp[i].montoIngreso);
                    this.caja.corte.ticket.corte.totalMontoCaja = this.caja.corte.ticket.corte.totalMontoCaja + Number(temp[i].montoCaja);
                }

                params.opc = 3;

                this._backService.HttpPost("procesos/agenda/Agenda/corteConsultaTicket", {}, params).subscribe( (data:any) => {
                    var temp = eval(data);
                            
                    // this.caja.corte.ticket.corte.ingresos = {};
                    this.caja.corte.ticket.corte.ingresos = temp;

                    this.dataTicket = this.caja.corte.ticket;

                    this.caja_corte_pasarCorteCaja();

                    this.modales.ticketCorteCaja.show();
                }, error => {
                    this._router.navigate(["/login"]);
                });
            }, error => {
                this._router.navigate(["/login"]);
            });
        }, error => {
            this._router.navigate(["/login"]);
        });
    }

    // ---------------------------------------------------------------------------- APARTADO DE MOVIMIENTOS ----------------------------------------------------------------------------    

    // -------------------------------- Declaración de variables ------------------------------
    caja_movimientos_declararVariables (){

        this.caja.movimientos.pruebaNombre = "";

        this.caja.movimientos.movimientosGridOptions = [];

        this.caja.movimientos.ArregloProductosDevoluciones = [];
        this.caja.movimientos.Cantidad = [];
       
        this.caja.movimientos.fechaFinFil = moment().format('DD/MM/YYYY');
        this.caja.movimientos.fechaInicioFil = moment().format('DD/MM/YYYY');
        this.caja.movimientos.fechaInicio = moment().format('DD/MM/YYYY');
        this.caja.movimientos.fechaFin = moment().format('DD/MM/YYYY');
        this.caja.movimientos.primerConsulta = true;
        this.caja.movimientos.fechaInicial = this.caja.movimientos.fechaInicioFil + " - " + this.caja.movimientos.fechaFinFil;
        this.caja.movimientos.fechas = {startDate: this.caja.movimientos.fechaInicioFil, endDate: this.caja.movimientos.fechaFinFil}; //this.caja.movimientos.fechaInicial; JeoC

        /*this.caja.movimientos.fechasAux = this.caja.movimientos.fechas.split(" - "); JeoC
        this.caja.movimientos.f1 = this.caja.movimientos.fechasAux[0].split('/');
        this.caja.movimientos.f2 = this.caja.movimientos.fechasAux[1].split('/');*/
        this.caja.movimientos.fechaInicioIn = new Date();
        this.caja.movimientos.fechaFinIn = new Date();

        /*this.caja.movimientos.fechaInicioIn.setFullYear(this.caja.movimientos.f1[2], this.caja.movimientos.f1[1] - 1, this.caja.movimientos.f1[0]); JeoC
        this.caja.movimientos.fechaFinIn.setFullYear(this.caja.movimientos.f2[2], this.caja.movimientos.f2[1] - 1, this.caja.movimientos.f2[0]);

        this.caja.movimientos.fechaInicioIn.setHours(0, 0, 0, 0);
        this.caja.movimientos.fechaFinIn.setHours(0, 0, 0, 0);*/

        this.caja.movimientos.fechaInicioFiltro = this.caja.movimientos.fechaInicioIn;
        this.caja.movimientos.fechaFinFiltro = this.caja.movimientos.fechaFinIn;
        
        this.caja.movimientos.paginationOptions = {
            pageNumber: 1,
            pageSize: 20,
        };

        this.caja.movimientos.currentPage = 1;

        this.caja.movimientos.pageSize = this.caja.movimientos.paginationOptions.pageSize;        
    }

    caja_movimientos_inicializarCalendario () {   
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

        var fechaInicial = this.caja.movimientos.fechaInicio + " - " + this.caja.movimientos.fechaFin;
        this.caja.movimientos.fechas = {startDate: this.caja.movimientos.fechaInicio, endDate: this.caja.movimientos.fechaFin}; //JeoC
        //this.caja.movimientos.fechas = fechaInicial;
        this.primerCargaPantalla1 = 0;
    }

    caja_movimientos_declararGrid (){
        this.caja.movimientos.gridOptions = {
            enableColumnMenus: false,
            enableSorting: true,
            paginationPageSizes: [15, 50, 100],
            paginationPageSize: 15,
            columnDefs: [
                { field: 'datoAcciones', displayName:  "Acciones" , width: '150', enableSorting:false, cellClass: 'alignCenter', headerCellClass: 'alignCenter2', cellTemplate: '<div class="ui-grid-cell-contents" style="color:#337dc0;" ng-if="row.entity.montoTotalPagoPaypal == 0"><li style="margin-left: 0px;font-size: 1.5em; cursor:pointer;color:#85e085;" ng-show="row.entity.estado != 0 && row.entity.estado != 3 && row.entity.Cantidad > 0 && row.entity.datoSaldo <=0" class="iconos fa fa-history" ng-click="$root.caja.movimientos.abrirModalDevolucionProducto(row.entity.datoFolioVenta,row.entity.datoSaldo)"></li><li style="margin-left: 0px;font-size: 1.5em; cursor:pointer;color:gainsboro;" ng-show="row.entity.estado == 0 || row.entity.estado == 3 || row.entity.Cantidad == 0 || row.entity.datoSaldo > 0" class="iconos fa fa-history" ></li><li style="margin-left:19.5px;font-size: 1.5em; cursor:pointer;color:#ff8080" class="iconos fa fa-ban" ng-show="row.entity.estado != 0 && row.entity.estado != 3 && row.entity.estado != 4 && row.entity.devolucion <= 0 " ng-click="$root.caja.movimientos.preparacionCancelarCita(row.entity.datoFolioPago,row.entity.devolucion)"></li><li style="margin-left:19.5px;font-size: 1.5em; cursor:pointer;color:gainsboro" ng-show="row.entity.estado == 0 || row.entity.estado == 3 || row.entity.estado == 4 || row.entity.devolucion > 0" class="iconos fa fa-ban" ></li></div>' } ,
                { field: 'datoFecha', displayName:  "Fecha", minWidth: '240', headerCellClass:'alignCenter', cellClass: 'alignCenter', type: 'date', cellFilter: 'date:"dd/MM/yyyy hh:mm a"' },
                { field: 'datoFolioVenta', displayName: "Folio Venta", width: '120', headerCellClass: 'alignCenter', cellClass: 'alignCenter', cellTemplate: '<div class="ui-grid-cell-contents ng-binding ng-scope" style="margin-top:0px;"><a class="nwLink2"  href="javascript:void(0);" ng-show="row.entity.estado == 4" ng-click="$root.caja.movimientos.mostrarTicketFolioRetiroEfectivo(row.entity.datoFolioVenta)">R-{{row.entity.folioVentaFormato}}</a><a class="nwLink2" href="javascript:void(0);" ng-show="row.entity.estado != 4" ng-click="$root.caja.movimientos.mostrarTicketFolioVenta(row.entity.datoFolioVenta)">{{row.entity.folioVentaFormato}}</a></div>' },
                { field: 'datoFolioPago', displayName: "Folio Pago", width: '120', headerCellClass: 'alignCenter', cellClass: 'alignCenter', cellTemplate: '<div class="ui-grid-cell-contents ng-binding ng-scope" style="margin-top:0px;"><a class="nwLink2"  href="javascript:void(0);" ng-show="row.entity.estado != 0 && row.entity.estado != 3 && row.entity.estado != 4" ng-click="$root.caja.movimientos.mostrarTicketFolioPago(row.entity.datoFolioPago)">{{row.entity.folioPagoFormato}}</a><a ng-show="row.entity.estado == 0  || row.entity.estado == 4">{{row.entity.folioPagoFormato}}</a><a class="nwLink2"  ng-show=" row.entity.estado == 3" ng-click="$root.caja.movimientos.mostrarTicketFolioRetiroEfectivo(row.entity.datoFolioPago, row.entity.datoFolioVenta)"></a></div>'},
                { field: 'datoEstatus', displayName: "Estatus", width: '100', headerCellClass:'alignCenter', cellClass: 'alignCenter' },
                { field: 'datoCliente', displayName: "Cliente", width: '300', headerCellClass:'alignCenter', cellClass: 'alignCenter'},
                { field: 'datoCargo', displayName: "Cargo",cellFilter: 'currency', width: '150', headerCellClass: 'alignCenter', cellClass: 'alignLeft2' },
                { field: 'datoAbono', displayName: "Abono",cellFilter: 'currency', width: '150', headerCellClass: 'alignCenter', cellClass: 'alignLeft2' },
                { field: 'datoSaldo', displayName: "Saldo",cellFilter: 'currency', width: '150', headerCellClass: 'alignCenter', cellClass: 'alignLeft2' }
            ],
            data: 'caja.movimientos.movimientosGridOptions',
        };
    }
    
    // ----------------------------------- Funciones de Carga ---------------------------------
    caja_movimientos_pasarMovimientos (){
        this._pantallaServicio.mostrarSpinner();
        this.caja_movimientos_inicializarCalendario();
        this.caja_movimientos_consultarMovimientos();
    }

    primerCargaPantalla1:any = 0;
    caja_movimientos_consultarMovimientos () {
        this._pantallaServicio.mostrarSpinner();

        var params:any = {};

        var fechaBusquedaSplit = [this.caja.movimientos.fechas.startDate, this.caja.movimientos.fechas.endDate];

        params.fechaInicioFil = (moment(JSON.parse(JSON.stringify(fechaBusquedaSplit[0])), 'DD/MM/YYYY').startOf('day')).format('YYYY-MM-DD HH:mm:ss');
        params.fechaFinFil = (moment(JSON.parse(JSON.stringify(fechaBusquedaSplit[1])), 'DD/MM/YYYY').endOf('day')).format('YYYY-MM-DD HH:mm:ss');

        if(params.fechaInicioFil == "Invalid date" && params.fechaFinFil == "Invalid date"){
            params.fechaInicioFil = moment(new Date(this.caja.movimientos.fechas.startDate['$y'], this.caja.movimientos.fechas.startDate['$M'],this.caja.movimientos.fechas.startDate['$D'] )).startOf('day').format('YYYY-MM-DD HH:mm:ss');
            params.fechaFinFil = moment(new Date(this.caja.movimientos.fechas.endDate['$y'], this.caja.movimientos.fechas.endDate['$M'], this.caja.movimientos.fechas.endDate['$D'] )).endOf('day').format('YYYY-MM-DD HH:mm:ss');
        }

        /*if (this.primerCargaPantalla1 < 1) { //JeoC CAMBIÉ LA FORMA DE VALIDAR LA FECHA;
            var fechasAux = this.caja.movimientos.fechas.split(" - ");
            var f1 = fechasAux[0].split('/'); 
            var f2 = fechasAux[1].split('/');

            params.fechaInicioFil = new Date();
            params.fechaFinFil = new Date();
            params.fechaInicioFil.setFullYear(f1[2], f1[1]-1, f1[0]);
            params.fechaFinFil.setFullYear(f2[2], f2[1]-1, f2[0]);
            params.fechaInicioFil.setHours(0, 0, 0, 0);
            params.fechaFinFil.setHours(0, 0, 0, 0);
        }else{
            params.fechaInicioFil = new Date();
            params.fechaFinFil = new Date();
            params.fechaInicioFil.setFullYear(this.caja.movimientos.fechas.startDate['$y'], (this.caja.movimientos.fechas.startDate['$M']), this.caja.movimientos.fechas.startDate['$D']);
            params.fechaFinFil.setFullYear(this.caja.movimientos.fechas.endDate['$y'], (this.caja.movimientos.fechas.endDate['$M']), this.caja.movimientos.fechas.endDate['$D']);
            params.fechaInicioFil.setHours(0, 0, 0, 0);
            params.fechaFinFil.setHours(0, 0, 0, 0);

            // params.fechaInicioIn = new Date( this.caja.movimientos.fechas.startDate['$y'], this.caja.movimientos.fechas.startDate['$M'],this.caja.movimientos.fechas.startDate['$D'] );
            // params.fechaFinIn = new Date( this.caja.movimientos.fechas.endDate['$y'], this.caja.movimientos.fechas.endDate['$M'], this.caja.movimientos.fechas.endDate['$D'] );
        }*/

        this.primerCargaPantalla1 += 1;
                
        this._backService.HttpPost("procesos/Movimientos/obtenerClientes", {}, params).subscribe( (data:any) => {
            this.caja.movimientos.movimientosGridOptions = eval(data);
            this.dataSourceMovimientos.data = data;
            this.dataSourceMovimientos.paginator =  this.paginator;
            this.dataSourceMovimientos.sort = this.sort;
            this.caja.movimientos.movimientosGridOptionsOriginal = eval(data);
            this.caja_movimientos_calcularIndicadores(this.caja.movimientos.movimientosGridOptions);
        }, error => {

        });
    }

    caja_movimientos_calcularIndicadores (data:any) {
 
        var totalMovimientos = data.length;
        var totalDevoluciones = 0;
        var totalPromociones = 0;
        var TotalIngresos = 0;
        var totalCanceladas = 0;
        var totalRetiro = 0;
        var montoRetiro = 0;
 
        var x;
        for (x = 0;x<data.length;x++){
 
            if(data[x]['datoEstatus'] != "Devolucion" && data[x]['datoEstatus'] != "Cancelada" && data[x]['datoEstatus'] != "Retiro"){
                if(data[x]['datoAbono'] == "" || data[x]['datoAbono'] == null){
                    TotalIngresos = TotalIngresos + 0;
                }
                else {
                    TotalIngresos = TotalIngresos + data[x]['datoAbono'];
                }
            }
            if(data[x]['datoEstatus'] == "Cancelada"){
                totalCanceladas = totalCanceladas + 1;
            }
 
            if(data[x]['datoEstatus'] == "Devolucion"){
                totalDevoluciones = totalDevoluciones + 1;
                if(data[x]['datoAbono'] == "" || data[x]['datoAbono'] == null){
                    TotalIngresos = TotalIngresos - 0;
                }
                else {
                    TotalIngresos = TotalIngresos + data[x]['datoAbono'];
                }
            }
 
            if(data[x]['datoEstatus'] == "Retiro"){
                totalRetiro = totalRetiro + 1;
                if(data[x]['datoAbono'] == "" || data[x]['datoAbono'] == null){
                    TotalIngresos = TotalIngresos - 0;
                }
                else {
                    TotalIngresos = TotalIngresos - data[x]['datoAbono'];                   
                    montoRetiro = montoRetiro + data[x]['datoAbono'];                                      
                }
            }
        }
 
        this.caja.movimientos.totalMovimientos = totalMovimientos;
        this.caja.movimientos.devoluciones = totalDevoluciones;
        this.caja.movimientos.totalIngresos = TotalIngresos;
        this.caja.movimientos.canceladas = totalCanceladas;
        this.caja.movimientos.retiros = totalRetiro;
        this.caja.movimientos.montosRetiros = montoRetiro;
 
        this._pantallaServicio.ocultarSpinner(); 
    }

    // ---------------------------------- Busqueda y Filtros ----------------------------------
    caja_movimientos_busquedaTabla () {
        if (this.caja.movimientos.pruebaNombre != "") {
            var foundItem = this.caja.movimientos.movimientosGridOptionsOriginal.filter( (item:any) => {

                    if (item.datoCliente != "" && item.datoCliente != null) {
                        if (item.datoCliente.toString().toUpperCase().match(this.caja.movimientos.pruebaNombre.toUpperCase()) != null) {
                            return item;
                        }
                    }
                    if (item.datoNumCita != "" && item.datoNumCita != null) {
                        if (item.datoNumCita.toString().toUpperCase().match(this.caja.movimientos.pruebaNombre.toUpperCase()) != null) {
                            return item;
                        }
                    }

                    if (item.datoPersonal != "" && item.datoPersonal != null) {
                        if (item.datoPersonal.toUpperCase().match(this.caja.movimientos.pruebaNombre.toUpperCase()) != null) {
                            return item;
                        }
                    }

                    if (item.datoConcepto != "" && item.datoConcepto != null) {
                        if (item.datoConcepto.toUpperCase().match(this.caja.movimientos.pruebaNombre.toUpperCase()) != null) {
                            return item;
                        }
                    }
                        
                    if (item.datoFolioVenta.toString() != "" && item.datoFolioVenta != null) {
                        if ((item.datoFolioVenta.toString()).toUpperCase().match(this.caja.movimientos.pruebaNombre.toUpperCase()) != null) {
                            return item;
                        }
                    }
                        
                },
                true);

            this.caja.movimientos.movimientosGridOptions = JSON.parse(JSON.stringify(foundItem));
            this.dataSourceMovimientos.data = JSON.parse(JSON.stringify(foundItem));
            this.dataSourceMovimientos.paginator =  this.paginator;
            this.dataSourceMovimientos.sort = this.sort;
            // this.caja.movimientos.consultarDatosGenralesCitas(this.caja.movimientos.movimientosGridOptions);
        }
        else {
            this.caja.movimientos.movimientosGridOptions = JSON.parse(JSON.stringify(this.caja.movimientos.movimientosGridOptionsOriginal));
            this.dataSourceMovimientos.data = JSON.parse(JSON.stringify(this.caja.movimientos.movimientosGridOptionsOriginal));
            this.dataSourceMovimientos.paginator =  this.paginator;
            this.dataSourceMovimientos.sort = this.sort;
            // this.caja.movimientos.consultarDatosGenralesCitas(this.caja.movimientos.movimientosGridOptions);
        }
    }

    primerCargaPantalla = true;
    caja_movimientos_cambioFecha () {
        var fechaBusquedaSplit = [this.caja.movimientos.fechas.startDate, this.caja.movimientos.fechas.endDate];

        this.caja.movimientos.fechaInicioIn = (moment(JSON.parse(JSON.stringify(fechaBusquedaSplit[0])), 'DD/MM/YYYY').startOf('day')).format('YYYY-MM-DD HH:mm:ss');
        this.caja.movimientos.fechaFinIn = (moment(JSON.parse(JSON.stringify(fechaBusquedaSplit[1])), 'DD/MM/YYYY').endOf('day')).format('YYYY-MM-DD HH:mm:ss');

        if(this.caja.movimientos.fechaInicioIn == "Invalid date" && this.caja.movimientos.fechaFinIn == "Invalid date"){
            this.caja.movimientos.fechaInicioIn = moment(new Date(this.caja.movimientos.fechas.startDate['$y'], this.caja.movimientos.fechas.startDate['$M'],this.caja.movimientos.fechas.startDate['$D'] )).startOf('day').format('YYYY-MM-DD HH:mm:ss');
            this.caja.movimientos.fechaFinIn = moment(new Date(this.caja.movimientos.fechas.endDate['$y'], this.caja.movimientos.fechas.endDate['$M'], this.caja.movimientos.fechas.endDate['$D'] )).endOf('day').format('YYYY-MM-DD HH:mm:ss');
        }


        /*if (this.primerCargaPantalla) {
            var fechasAux = this.caja.movimientos.fechas.split(" - ");
            var f1 = fechasAux[0].split('/'); //Fecha de inicio de busqueda
            var f2 = fechasAux[1].split('/'); //Fecha de fin de busqueda
            
            this.caja.movimientos.fechaInicioIn.setFullYear(f1[2], f1[1] - 1, f1[0]);
            this.caja.movimientos.fechaFinIn.setFullYear(f2[2], f2[1] - 1, f2[0]);
            this.caja.movimientos.fechaInicioIn.setHours(0, 0, 0, 0);
            this.caja.movimientos.fechaFinIn.setHours(0, 0, 0, 0);
        }else{
            this.caja.movimientos.fechaInicioIn = format(new Date( this.caja.movimientos.fechas.startDate['$y'], this.caja.movimientos.fechas.startDate['$M'],this.caja.movimientos.fechas.startDate['$D'] ), 'yyyy-MM-dd' );
            this.caja.movimientos.fechaFinIn = format(new Date( this.caja.movimientos.fechas.endDate['$y'], this.caja.movimientos.fechas.endDate['$M'], this.caja.movimientos.fechas.endDate['$D'] ), 'yyyy-MM-dd' );
        }*/

        this.primerCargaPantalla = false;

        this.caja.movimientos.fechaInicioFil =  this.caja.movimientos.fechaInicioIn;
        this.caja.movimientos.fechaFinFil = this.caja.movimientos.fechaFinIn;

        this.caja_movimientos_buscar();
    }    

    caja_movimientos_buscar () {
        var valido = true;
        var fechaLimiteInferiro = new Date(99, 1, 1);
        if (this.caja.movimientos.fechaInicio < fechaLimiteInferiro) {
            $("#fechaInicio").addClass("errorCampo");
            valido = false;
        }
        if (this.caja.movimientos.fechaFin < fechaLimiteInferiro) {
            $("#fechaFin").addClass("errorCampo");
            valido = false;
        }
        if (this.caja.movimientos.fechaInicio == "" || this.caja.movimientos.fechaInicio == undefined) {
            //$("#fechaInicio").css("border", "1px solid red");
            $("#fechaInicio").addClass("errorCampo");
            this.caja.movimientos.errorFecha = "";
            valido = false;
        }
        else {
            //$("#fechaInicio").css("border", "");
            $("#fechaInicio").removeClass("errorCampo");
            this.caja.movimientos.errorFecha = "";
        }
        if (this.caja.movimientos.fechaFin == "" || this.caja.movimientos.fechaFin == undefined) {
            //$("#fechaFin").css("border", "1px solid red");
            $("#fechaFin").addClass("errorCampo");
            this.caja.movimientos.errorFecha = "";
            valido = false;
        } else {
            if (this.caja.movimientos.fechaFin < this.caja.movimientos.fechaInicio) {
                //$("#fechaFin").css("border", "1px solid red");
                $("#fechaFin").addClass("errorCampo");
                this.caja.movimientos.errorFecha = "Error en la fecha";
                valido = false;
            } else {
                //$("#fechaFin").css("border", "");
                $("#fechaFin").removeClass("errorCampo");
                this.caja.movimientos.errorFecha = "";
            }
        }
        if (valido) {

            this.caja.movimientos.primerConsulta = false;
            this.caja_movimientos_consultaFiltroCitas();             
        }
    }

    caja_movimientos_consultaFiltroCitas () {
        $('#loading-spinner').show();
        this.caja_movimientos_consultarMovimientos();       
    }

    // ------------------------------------ Exportar a Excel ----------------------------------
    caja_movimientos_exportToExcel () {
 
        function compareProperty(a:any, b:any) {
            return (a || b) ? (!a ? -1 : !b ? 1 : a.localeCompare(b)) : 0;
        }
 
        function compare(a:any, b:any) {
            return compareProperty(a.fecha, b.fecha) || compareProperty(a.folio, b.folio);
        }
 
        var titulo = 'Movimientos Caja';
        var dataCopy = JSON.parse(JSON.stringify(this.caja.movimientos.movimientosGridOptionsOriginal));
 
        var ArregloColumnas = [];
        var text1={"field":"datoFecha","displayName":"Fecha Alta","name":"Fecha Alta"};
        ArregloColumnas.push(text1);
        var text2={"field":"datoFolioPago","displayName":"Folio Pago","name":"Folio Pago"};
        ArregloColumnas.push(text2);
        var text3={"field":"datoFolioVenta","displayName":"Folio Venta","name":"Folio Venta"};
        ArregloColumnas.push(text3);
        var text4={"field":"datoEstatus","displayName":"Estatus","name":"Estatus"};
        ArregloColumnas.push(text4);
        var text5={"field":"datoCliente","displayName":"Cliente","name":"Cliente"};
        ArregloColumnas.push(text5);
        var text6={"field":"datoConcepto","displayName":"Concepto","name":"Concepto"};
        ArregloColumnas.push(text6);
        var text7={"field":"datoPersonal","displayName":"Personal","name":"Personal"};
        ArregloColumnas.push(text7);
        var text8={"field":"datoCargo","displayName":"Cargo","name":"Cargo"};
        ArregloColumnas.push(text8);
        var text9={"field":"datoAbono","displayName":"Abono","name":"Abono"};
        ArregloColumnas.push(text9);
        var text10={"field":"datoSaldo","displayName":"Saldo","name":"Saldo"};
        ArregloColumnas.push(text10);
        this.caja.movimientos.columnasExcel = ArregloColumnas;
        
 
        this.caja_movimientos_exportXlsTableView(dataCopy, this.caja.movimientos.columnasExcel, titulo);       
    }

    caja_movimientos_exportXlsTableView (dataArray:any, columnas:any, nameExcel:any) {
        if (dataArray.length > 0) {
            var dataGridOptionsExport = this.caja_movimientos_formatJSONData(columnas, dataArray);
            this.caja_movimientos_drawTable(dataGridOptionsExport, nameExcel);
        }
    }

    caja_movimientos_formatJSONData (columns:any, data:any) {
        var i = 0;
        var lenght = 0;
        var str = "";
        this.caja.movimientos.headers = [];
        this.caja.movimientos.dataGridOptionsExport = [];
        columns.forEach( (col:any) => {
            var colString = "";
            var element:any = {};
            if (col.field != undefined) {
                element.name = col.displayName;
                element.displayName = col.name;
                this.caja.movimientos.headers.push(element);
            }
        });
 
        data.forEach( (evento:any) => {
            var reg = '{';
            var colIndex = 0;
            columns.forEach( (col:any) => {
                if (evento[col.field] !== undefined || evento[col.field] == null) {
                    if(evento[col.field] == null){
                        var espaciovacio = " ";
                        reg += "\"" + col.name + "\"" + ":" + "\"" + espaciovacio.toString().split('"').join('\'') + "\",";
                    }else{
                        reg += "\"" + col.name + "\"" + ":" + "\"" + evento[col.field.toString()].toString().split('"').join('\'') + "\",";
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
    }

    caja_movimientos_drawTable (data:any, nameExcel:any) {
        var table = '<table><tr>';
        var headersString = "";
        this.caja.movimientos.headers.forEach( (header:any) => {
            if (header.name != "Acciones") {
                headersString += '<th>' + header.name + '</th>';
            }
        });
        table += headersString + "</tr>";
        var index = 0;
        data.forEach( (row:any) => {
            var dataRow = this.caja_movimientos_drawRow(index, row);
            table += dataRow;
        });
        table += "</table>";
        (document.getElementById("excelTable") as any).innerHTML = table;
        var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        var isFirefox = typeof InstallTrigger !== 'undefined';
        if (isSafari) {
            var blob = new Blob([table], { type: "application/vnd.ms-excel" });
            saveAs(blob, nameExcel);
        } else {
            var blob = new Blob([table], { type: "text/plain;charset=utf-8" });
            saveAs(blob, nameExcel + ".xls");
        }
    }

    caja_movimientos_drawRow (i:any, dataRow:any) {
        var value = '';
        var row = "<tr>";
        if ((i % 2) == 0) {
            this.caja.movimientos.headers.forEach( (elem:any) => {
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
            this.caja.movimientos.headers.forEach( (elem:any) => {
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
    }

    // ------------------------------------- Devoluciones -------------------------------------   
    mobileBrowser:any;
    caja_movimientos_abrirModalDevolucionProducto (idFolio:any, idCita:any, idPago:any){
        //inicializa valores para el insert
        this.caja.movimientos.idFolioNuevoDev = idFolio;
        this.caja.movimientos.idPagoDetalleDevoluciones = idPago;
        this.caja.movimientos.idTipoDevolucionActivo = 1;

        //Genera la tabla de tipo de devolucion
        this.caja.movimientos.dataCmboCaja = [];
        this.caja.movimientos.dataCmboCaja.push({
            idTipoDevolucion: 1,
            descripcion: "Dev. a Inventario"
        });

        //Variable con la que se identifica que tipo de movimiento es
        this.caja.movimientos.intAccionRealizar = 2;

        // Se cargan los productos de la venta
        this.caja_movimientos_obtenerProductosDevolucion();

        this.modales.modalDevoluciones.show();
    }

    caja_movimientos_obtenerProductosDevolucion (){
         
        var params:any = {};
        params.idFolioCaja =  this.caja.movimientos.idFolioNuevoDev;

        this._backService.HttpPost("procesos/Movimientos/obtenerDatosProducto", {}, params).subscribe((data:any) => {
            //Se inicializa el arreglo de cantidades y productos a devolver
            this.caja.movimientos.ArregloProductosDevoluciones = eval(data);
            this.caja.movimientos.Cantidad = [];

            //Advertencia en caso de no obtener ningun producto
            if(this.caja.movimientos.ArregloProductosDevoluciones.length == 0){
                this._toaster.error('No se encontraron productos en la venta');
                this.modales.modalDevoluciones.hide();
            }
            else{
           
                this.caja.movimientos.totalCantidad = 0; //(Se dejo por si se utiliza en algun momento)
                this.caja.movimientos.totalMonto = 0;

                //Se le agrega el arreglo de cantidades de acuerdo a la cantidad de productos vendidos por cada uno de los productos
                for(var i=0; i < this.caja.movimientos.ArregloProductosDevoluciones.length; i++){
                    var productoCantidadRestante = this.caja.movimientos.ArregloProductosDevoluciones[i].Cantidad;
            
                    if(productoCantidadRestante != 0){

                        // Se crea el arreglo de la cantidad de los productos
                        var ArrayCombos = [];
                        for(var cont = 1; cont <= productoCantidadRestante; cont++){
                            ArrayCombos.push({
                                "idValor": i + "-" + cont, 
                                "Valor": cont
                            });
                        }
                    
                        // Se inicializan los valores del producto
                        this.caja.movimientos.ArregloProductosDevoluciones[i].Cantidad = ArrayCombos;
                        this.caja.movimientos.ArregloProductosDevoluciones[i].Valor = this.caja.movimientos.ArregloProductosDevoluciones[i].Cantidad[0];
                        this.caja.movimientos.ArregloProductosDevoluciones[i].TipoDevolucion = 1;
                        this.caja.movimientos.ArregloProductosDevoluciones[i].precio = (this.caja.movimientos.ArregloProductosDevoluciones[i].precioProducto);
                        this.caja.movimientos.ArregloProductosDevoluciones[i].monto = (this.caja.movimientos.ArregloProductosDevoluciones[i].precioProducto);
                        this.caja.movimientos.ArregloProductosDevoluciones[i].montoLimite = (this.caja.movimientos.ArregloProductosDevoluciones[i].precioVentaTotal);
                        this.caja.movimientos.ArregloProductosDevoluciones[i].Devolver = true;

                        this.caja.movimientos.Cantidad[i] = 1;

                        // Se suma el producto a los contadores generales
                        this.caja.movimientos.totalCantidad = this.caja.movimientos.totalCantidad + 1;
                        this.caja.movimientos.totalMonto = this.caja.movimientos.totalMonto + this.caja.movimientos.ArregloProductosDevoluciones[i].precio;
                    }
                    else{
                        this.caja.movimientos.ArregloProductosDevoluciones.splice(i,1);
                        i--;
                    }
                }

                // Se manda el arreglo al repiter de productos
                this.caja.movimientos.Productos = this.caja.movimientos.ArregloProductosDevoluciones;

                this.modales.modalDevoluciones.show();
            }
        }, error => {
            this._router.navigate(["/login"]);
        });      
    }

    caja_movimientos_cambiarCantidadProductoADevolver (indexCantidad:any) {    
        var index = Number(indexCantidad.split("-")[0]);
        var cantidad = Number(indexCantidad.split("-")[1]);

        // Se actualiza el monto de acuerdo al precio y cantidad nueva
        this.caja.movimientos.ArregloProductosDevoluciones[index].monto = Number((this.caja.movimientos.ArregloProductosDevoluciones[index].precio * cantidad).toFixed(2));

        // Se actualiza la cantidad ingresada
        this.caja.movimientos.Cantidad[index] = cantidad;
    
        // Se actualiza el total de las cantidades
        this.caja.movimientos.totalCantidad = 0;
        for(var i = 0; i < this.caja.movimientos.Cantidad.length; i++){
            this.caja.movimientos.totalCantidad = this.caja.movimientos.totalCantidad + this.caja.movimientos.Cantidad[i];
        }

        // Se actualiza el total del monto
        this.caja.movimientos.totalMonto = 0;
        for(var i = 0; i < this.caja.movimientos.ArregloProductosDevoluciones.length; i++){
            this.caja.movimientos.totalMonto = Number(this.caja.movimientos.totalMonto) + Number(this.caja.movimientos.ArregloProductosDevoluciones[i].monto);
        }
        this.caja.movimientos.totalMonto = Number(this.caja.movimientos.totalMonto.toFixed(2));
    }

    caja_movimientos_cambiarMontoProductoADevolver (idPagoClienteDetalle:any, monto:any, limite:any) {

        // Se obtiene el index del producto que se editó el monto
        var idProductoArreglo = 0;
        for(var i = 0; i <this.caja.movimientos.ArregloProductosDevoluciones.length * 1;i++){
            if(this.caja.movimientos.ArregloProductosDevoluciones[i].idPagoClienteDetalle == idPagoClienteDetalle){
                idProductoArreglo = i;
            }
        }

        // Se verifica que lo ingresado esté correcto
        var floatRegex = RegExp("^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$");
        if (this.caja.movimientos.ArregloProductosDevoluciones[idProductoArreglo].monto != "") {
            if (!floatRegex.test(this.caja.movimientos.ArregloProductosDevoluciones[idProductoArreglo].monto)) {
                this.caja.movimientos.ArregloProductosDevoluciones[idProductoArreglo].monto = 0;
            }

            // Si valida que solo se ingrese el limite, si es más se iguala al limite
            if(monto >= limite){
                this.caja.movimientos.ArregloProductosDevoluciones[idProductoArreglo].monto = limite;
            }
    
            // Se actualiza el monto total
            this.caja.movimientos.totalMonto = 0;
            for(var i = 0; i < this.caja.movimientos.ArregloProductosDevoluciones.length; i++){
                this.caja.movimientos.totalMonto = Number(this.caja.movimientos.totalMonto) + Number(this.caja.movimientos.ArregloProductosDevoluciones[i].monto);
            }
            this.caja.movimientos.totalMonto = Number(this.caja.movimientos.totalMonto.toFixed(2));
        }
    }

    caja_movimientos_cambiarEstatusDevolucionProducto (idPagoClienteDetalle:any) {
    
        // Se obtiene el index del producto que se cambiara su estatus de devolución
        var idProductoArreglo = 0;
        for(var i = 0; i < this.caja.movimientos.ArregloProductosDevoluciones.length; i++){
            if(this.caja.movimientos.ArregloProductosDevoluciones[i].idPagoClienteDetalle == idPagoClienteDetalle){
                idProductoArreglo = i;
            }
        }

        // Se verifica si se está cambiando para devolver o para quitar la devolución de ese producto
        if(this.caja.movimientos.ArregloProductosDevoluciones[idProductoArreglo].Devolver){
            this.caja.movimientos.ArregloProductosDevoluciones[idProductoArreglo].Visible = 1;
            this.caja.movimientos.ArregloProductosDevoluciones[idProductoArreglo].Valor = this.caja.movimientos.ArregloProductosDevoluciones[idProductoArreglo].Cantidad[0];
            this.caja.movimientos.ArregloProductosDevoluciones[idProductoArreglo].monto = this.caja.movimientos.ArregloProductosDevoluciones[idProductoArreglo].precioProducto;

            this.caja.movimientos.Cantidad[idProductoArreglo] = 1;

        }
        else{
            this.caja.movimientos.ArregloProductosDevoluciones[idProductoArreglo].Visible = 0;
            this.caja.movimientos.ArregloProductosDevoluciones[idProductoArreglo].Valor = 0;
            this.caja.movimientos.ArregloProductosDevoluciones[idProductoArreglo].monto = 0; 

            this.caja.movimientos.Cantidad[idProductoArreglo] = 0;
        }

        // Se actualiza el total de las cantidades
        this.caja.movimientos.totalCantidad = 0;
        for(var i = 0; i < this.caja.movimientos.Cantidad.length; i++){
            this.caja.movimientos.totalCantidad = this.caja.movimientos.totalCantidad + this.caja.movimientos.Cantidad[i];
        }

        // Se actualiza el total del monto
        this.caja.movimientos.totalMonto = 0;
        for(var i = 0; i < this.caja.movimientos.ArregloProductosDevoluciones.length; i++){
            this.caja.movimientos.totalMonto = Number(this.caja.movimientos.totalMonto) + Number(this.caja.movimientos.ArregloProductosDevoluciones[i].monto);
        }
        this.caja.movimientos.totalMonto = Number(this.caja.movimientos.totalMonto.toFixed(2));
    }

    caja_movimientos_quitarCerosMontoEfectivoDevolucion (idPagoClienteDetalle:any) {
    
        // Se obtiene el index del producto
        var idProductoArreglo = 0;
        for(var i = 0; i < this.caja.movimientos.ArregloProductosDevoluciones.length; i++){
            if(this.caja.movimientos.ArregloProductosDevoluciones[i].idPagoClienteDetalle == idPagoClienteDetalle){
                idProductoArreglo = i;
            }
        }

        if (this.caja.movimientos.ArregloProductosDevoluciones[idProductoArreglo].monto == 0) {
            this.caja.movimientos.ArregloProductosDevoluciones[idProductoArreglo].monto = "";
        }
    }

    caja_movimientos_ponerCerosMontoEfectivoDevolucion (idPagoClienteDetalle:any) {
        // Se obtiene el index del producto
        var idProductoArreglo = 0;
        for(var i = 0; i <this.caja.movimientos.ArregloProductosDevoluciones.length * 1;i++){
            if(this.caja.movimientos.ArregloProductosDevoluciones[i].idPagoClienteDetalle == idPagoClienteDetalle){
                idProductoArreglo = i;
            }
        }

        if (this.caja.movimientos.ArregloProductosDevoluciones[idProductoArreglo].monto == "") {
            this.caja.movimientos.ArregloProductosDevoluciones[idProductoArreglo].monto = 0;
        }

        // Se actualiza el total del monto
        this.caja.movimientos.totalMonto = 0;
        for(var i = 0; i < this.caja.movimientos.ArregloProductosDevoluciones.length; i++){
            this.caja.movimientos.totalMonto = Number(this.caja.movimientos.totalMonto) + Number(this.caja.movimientos.ArregloProductosDevoluciones[i].monto);
        }
        this.caja.movimientos.totalMonto = Number(this.caja.movimientos.totalMonto.toFixed(2));
    }

    caja_movimientos_validarDevolucion (){
        var validarDevolucion = 0;
        for(var i = 0; i < this.caja.movimientos.ArregloProductosDevoluciones.length; i++){
            if(this.caja.movimientos.ArregloProductosDevoluciones[i].Devolver == true){
                validarDevolucion = 1;
            }
        }

        if(validarDevolucion == 1){
            this.caja.movimientos.UsuarioFirma = "";
            this.caja.movimientos.ContraFirma = "";
            this.caja_movimientos_limpiarValidacionesFirma();
            this.caja.movimientos.opcion = 2;
            this.modales.modalFirmaAutorizacion.show();
        }
        else{
            this._toaster.error('Se debe de seleccionar al menos un Producto para devolver');
        }
    }

    // ------------------------------------- Cancelar Pago ------------------------------------
    caja_movimientos_validarFacturaCancelacion (idFolioPago:any){
        var params:any = {};
        params.idFolioNuevo = this.caja.movimientos.idFolioCancelar;

        this._backService.HttpPost("procesos/Movimientos/validarUsosCertificadoRegalo", {}, params).subscribe((data:any) => {
            var Cantidades = eval(data);

            if(Cantidades[0].cant == 0){
                this.caja.movimientos.UsuarioFirma = "";
                this.caja.movimientos.ContraFirma = "";
                this.caja_movimientos_limpiarValidacionesFirma();
       
                this.caja.movimientos.opcion = 3;
                this.modales.modalFirmaAutorizacion.show();
            }else{
                this._toaster.error('No se puede cancelar la venta debido a que cuenta con al menos un Certificados de Regalo');
            }
        }, error => {
            this._router.navigate(["/login"]);
        });        
    }

    caja_movimientos_preparacionCancelarCita (idFolio:any, idCita:any){
        this.caja.movimientos.idFolioCancelar = idFolio;
        this.caja.movimientos.idCitaCancelar = idCita;
        this.caja.movimientos.intAccionRealizar = 3;

        this.modales.modalCancelarPago.show();
    }

    caja_movimientos_accionAceptarFirma () {
        this.caja_movimientos_limpiarValidacionesFirma();
        this.caja_movimientos_validarModFirma();
        if (this.caja.movimientos.validacionFirma == true) {
            this.caja_movimientos_validarFirmaUsuario();
        } 
    }
    
    msgUsuarioFirma:any;
    msgContraFirma:any;
    caja_movimientos_limpiarValidacionesFirma () {
        $("#txtUsuarioFirma").removeClass("errorCampo");
        this.msgUsuarioFirma = "";
        $("#txtContraFirma").removeClass("errorCampo");
        this.msgContraFirma = "";
    }

    caja_movimientos_validarModFirma () {

        this.caja.movimientos.validacionFirma = true;

        if (this.caja.movimientos.UsuarioFirma == "") {
            $("#txtUsuarioFirma").addClass("errorCampo");            
            this.caja.movimientos.validacionFirma = false;
        }

        if (this.caja.movimientos.ContraFirma == "") {
            $("#txtContraFirma").addClass("errorCampo");            
            this.caja.movimientos.validacionFirma = false;
        }
    }

    caja_movimientos_validarFirmaUsuario () {
        var params:any = {};
        params.UsuarioFirma = this.caja.movimientos.UsuarioFirma;
        params.Contra = this.caja.movimientos.ContraFirma;
        params.idSucursal = this._pantallaServicio.idSucursal; //id sucursal
        params.opcion = this.caja.movimientos.opcion;

        this._backService.HttpPost("procesos/Movimientos/validarFirmaRetiro", {}, params).subscribe((data:any) => {
            var datosUsuario = eval(data);

            if (datosUsuario.length == 0) {
                $("#txtUsuarioFirma").addClass("errorCampo");                
                $("#txtContraFirma").addClass("errorCampo");                
                this._toaster.error('El usuario y/o contraseña son incorrectos o no tiene la autorización correspondiente');
            } else {
                this.caja.movimientos.idGerenteUsuarioFirma = datosUsuario[0]['idUsuarioSucursal'];
                this.caja_movimientos_insertarMovimientoAccion();
            }
        }, error => {
            this._router.navigate(["/login"]);
        });
           
    }

    caja_movimientos_insertarMovimientoAccion () {
        var accion = this.caja.movimientos.intAccionRealizar;

        if(accion == 2){
            var params:any = {};
            params.idPagoClienteDetalle =  null;
            params.idInventarioPresentacion = null;
            params.idrealizoDevolucion = this.caja.movimientos.idGerenteUsuarioFirma;
            params.intCantidad = this.caja.movimientos.totalCantidad;
            params.ftmontoTotal =  this.caja.movimientos.totalMonto;
            params.ftmontoProducto =  null;
            params.folioCaja = this.caja.movimientos.idFolioNuevoDev;
            params.idPagoClienteDetalleDevolucion = null;
            params.observaciones = "Ajuste por Devolucion";
            params.opcion = 0;

            this._backService.HttpPost("procesos/Movimientos/devolverProducto", {}, params).subscribe((data:any) => {
                var idDevolucion = eval(data);
                for(var i = 0; i <this.caja.movimientos.ArregloProductosDevoluciones.length;i++){
                    if(this.caja.movimientos.ArregloProductosDevoluciones[i].Devolver == true){
                        var params:any = {};
                        params.idPagoClienteDetalle =  this.caja.movimientos.ArregloProductosDevoluciones[i].idPagoClienteDetalle;
                        params.idInventarioPresentacion = this.caja.movimientos.ArregloProductosDevoluciones[i].idInventarioPresentacion;
                        params.idrealizoDevolucion = this.caja.movimientos.idGerenteUsuarioFirma;
                        params.intCantidad = this.caja.movimientos.Cantidad[i];
                        params.ftmontoTotal =  null;
                        params.ftmontoProducto =  this.caja.movimientos.ArregloProductosDevoluciones[i].monto;
                        params.folioCaja = this.caja.movimientos.idFolioNuevoDev;
                        params.idPagoClienteDetalleDevolucion = idDevolucion[0].idPagoClienteDetalleDevolucion;
                        params.observaciones = null;
                        params.opcion = 1;

                        this._backService.HttpPost("procesos/Movimientos/devolverProducto", {}, params).subscribe((data:any) => {
                            
                        }, error => {
                            this._router.navigate(["/login"]);
                        });
                    }
                }
                $('#modal-Firma-Autorizacion').modal('toggle');
                $('#txtMotivoRetiro').attr("disabled", true);
                $('#txtMontoRetiro').attr("disabled", true);

                setTimeout( () => {
                    this._toaster.success('La devolucion fue exitosa');
                
                    this.caja_movimientos_consultarMovimientos();                
                    // $("#modalDevoluciones").modal("hide");
                    this.modales.modalFirmaAutorizacion.hide();
                    this.modales.modalDevoluciones.hide();
                },50);
            }, error => {
                this._router.navigate(["/login"]);
            });
        }

        if(accion == 3){
            var params:any = {};
            params.idFolioNuevo =  this.caja.movimientos.idFolioCancelar;
            params.idrealizoCancelacion = this.caja.movimientos.idGerenteUsuarioFirma;

            this._backService.HttpPost("procesos/Movimientos/cancelarCita", {}, params).subscribe((data:any) => {
                $('#modal-Firma-Autorizacion').modal('toggle');
                this._toaster.success('El movimiento fue exitoso veríficalo en Cuentas por Cobrar');
             
                this.caja_movimientos_consultarMovimientos();            
                // $("#modalCancelarPago").modal("hide");
                this.modales.modalFirmaAutorizacion.hide();
                this.modales.modalCancelarPago.hide();
            }, error  => {
                this._router.navigate(["/login"]);
            });
        }
    }

    // ---------------------------------------- Tickets ---------------------------------------
    /*caja_movimientos_mostrarTicketFolioRetiroEfectivo (folio:any) { REEMPLAZADO POR ticket.Service
        // $('#ticket-retiro').modal({ backdrop: 'static', keyboard: false });
        this.modales.ticketRetiro.show();
        this._pantallaServicio.mostrarSpinner();

        var params:any = {};
        params.folio = folio;

        this._backService.HttpPost("procesos/Movimientos/consultarRetiroEfectivo", {}, params).subscribe((data:any) => {
            var DatosRetiroEfectivo = (eval(data));

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
        }, error => {
            this._router.navigate(["/login"]);
        });
    }*/

    /*caja_movimientos_mostrarTicketFolioPago (folio:any) { REEMPLAZADO POR ticket.Service
        // $('#ticketPago').modal({ backdrop: 'static', keyboard: false });
        this.modales.ticketPago.show();
        this._pantallaServicio.mostrarSpinner();

        var params:any = {};
        params.folioPago = folio;
        params.opcion = 1;

        this._backService.HttpPost("procesos/agenda/Agenda/consultarTicketPagoCaja",{},params).subscribe((data:any) => {
            var temp = eval(data);
            this.caja.venta.ticket = {};
            this.caja.venta.ticket.cargos = [];
            this.caja.venta.ticket.promocion = [];
            this.caja.venta.ticket.productos = [];
            this.caja.venta.ticket.paquetes = [];
            this.caja.venta.ticket.certificadosRegalo = [];
            this.caja.venta.ticket.propina = {pago: null};
            this.caja.venta.ticket.descuento = {pago: null};
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

            this._backService.HttpPost("procesos/agenda/Agenda/consultarTicketPagoCaja", {},params).subscribe((data:any) => {
                var temp = eval(data);
                this.caja.venta.ticket.fecha = moment(temp[0].fechaPago).format("DD MMM YYYY HH:mm");
                this.caja.venta.ticket.fechaSF = moment(temp[0].fechaPago);
                this.caja.venta.ticket.metodoPago = [];
                this.caja.venta.ticket.totalPagado = 0;
                for (var i = 0; i < temp.length; i++) {
                    this.caja.venta.ticket.metodoPago.push(temp[i]);
                    this.caja.venta.ticket.totalPagado += temp[i].pago;
                }
                this.dataTicket = this.caja.venta.ticket;

                this._pantallaServicio.ocultarSpinner();
            }, error => {
                this._router.navigate(["/login"]);
            });
        }, error => {
            this._router.navigate(["/login"]);
        });
    }*/

    /*caja_movimientos_mostrarTicketFolioVenta (folio:any) { REEMPLAZADO POR ticket.Service
        this.caja.venta.ticketVenta = {};
        // $('#ticketVenta').modal({ backdrop: 'static', keyboard: false });
        this.modales.ticketVenta.show();
        this._pantallaServicio.mostrarSpinner();

        var params:any = {};
        params.folioVenta = folio;
        params.opcion = 1;

        this._backService.HttpPost("procesos/agenda/Agenda/consultarTicketVenta",{},params).subscribe((data:any) => {
            var temp = eval(data);
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

            this._backService.HttpPost("procesos/agenda/Agenda/consultarTicketVenta", {}, params).subscribe((data:any) => {
                this.caja.venta.ticketVenta.devoluciones = eval(data);                
                this._pantallaServicio.ocultarSpinner();
            }, error => {
                this._router.navigate(["/login"]);
            });
        }, error => {
            this._router.navigate(["/login"]);
        });
    }*/
    
    validarSeleccionFecha(){
        var aux = new Date(), month = '' + (aux.getMonth() + 1), day = '' + aux.getDate(), year = aux.getFullYear();

        if (month.length < 2) {
            month = '0' + month;
        }
        if (day.length < 2){ 
            day = '0' + day;
        }

        this.hoy = [year, month, day].join('-');
    }    

    filtroNombre() {
        if (typeof this.caja.venta.clienteNuevo.nombre !== 'string') {
            return;
        }
      
        this.caja.venta.dataClienteBuscadorFiltro = this.caja.venta.dataClienteBuscador.filter(
            (eti: any) => {
                if (eti.toUpperCase().match(this.caja.venta.clienteNuevo.nombre.toUpperCase()) != null) {
                    return eti;
                }
            }
        );
    }

    displayOptions(item: any) {
        return item ? item.nombre : '';
    }

    cambiarPestana(event: any) {
        switch (event) {
            case 0:
                this.caja_venta_pasarApartadoVenta()
            break;
            case 1:
                this.caja_retiroEfectivo_mostarModalRetiro()
            break;
            case 2:
                this.caja_corte_pasarCorteCaja()
            break;
            case 3:
                this.caja_movimientos_pasarMovimientos()
            break;
        }
    }

    // date range picker
    ranges: any = {};/* JeoC
        'Ultimos 7 Dias': [moment().subtract(6, 'days'), moment()], //subtract
        'Ultimo Mes': [moment().startOf('month'), moment().endOf('month')],
        'Ultimo Año': [moment().startOf('year'), moment().endOf('year')],
    };*/
    locale: any = {
        format: 'DD/MM/YYYY'
    }
    invalidDates: moment.Moment[] = [
        moment().add(2, 'days'),
        moment().add(3, 'days'),
        moment().add(5, 'days'),
    ];

    isInvalidDate = (m: moment.Moment) => {
        return this.invalidDates.some((d) => d.isSame(m, 'day'));
    };
}