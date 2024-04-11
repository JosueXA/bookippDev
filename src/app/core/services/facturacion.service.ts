import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Type } from '@angular/core'; 
import { PantallaService } from './pantalla.service';
import { MethodsService } from './methods.service';
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment';
import { Router } from '@angular/router';
import { ToasterService } from 'src/shared/toaster/toaster.service';
import { CurrencyPipe } from '@angular/common';
import * as bootstrap from 'bootstrap'; // BOOTSTRAP
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material/icon';
import jsPDF from 'jspdf';
declare var $: any; // JQUERY
import pdfMake from 'pdfmake/build/pdfmake';
import { vfsFontObject } from '../../../assets/fonts/vfs_fonts';
pdfMake.vfs = vfsFontObject;

import { InformacionFiscalClienteService } from 'src/app/core/services/informacionFiscalCliente.service';
import { InformacionFiscalClienteComponent } from '../../page/procesos/agenda/informacion-fiscal-cliente/informacion-fiscal-cliente.component';


@Injectable({
  providedIn: 'root'
})

export class FacturacionService {
    // Variables de Translate
    sessionTraslate: any = {};
    configuracionSucursalTranslate: any = {};
    informacionFiscalClienteTranslate: any = {};
    imprimirTicketTranslate: any = {};
    consultaAjustesTranslate: any = {};
    consultaClienteTranslate: any = {};
    reporteVentaProductoTranslate: any = {};
    agendaTranslate: any = {};
    facturaTranslate: any = {};

    constructor(private dialog: MatDialog, private domSanitizer: DomSanitizer, private matIconRegistry: MatIconRegistry, private _translate: TranslateService, private _backService: MethodsService, public _pantallaServicio: PantallaService, private _dialog: MatDialog, private _router: Router, private _toaster: ToasterService, private _informacionFiscalClienteService: InformacionFiscalClienteService) { 
        //this._translate.setDefaultLang(this._pantallaServicio.idioma);
        //this._translate.use(this._pantallaServicio.idioma);
        this._translate.setDefaultLang('es-mx');
        this._translate.use('es-mx');

        this._translate.get('calendarioTranslate').subscribe((translated: string) => {  
            this.sessionTraslate = this._translate.instant('sessionTraslate');
            this.configuracionSucursalTranslate = this._translate.instant('configuracionSucursalTranslate');
            this.informacionFiscalClienteTranslate = this._translate.instant('informacionFiscalClienteTranslate');
            this.imprimirTicketTranslate = this._translate.instant('imprimirTicketTranslate');
            this.consultaAjustesTranslate = this._translate.instant('consultaAjustesTranslate');
            this.consultaClienteTranslate = this._translate.instant('consultaClienteTranslate');
            this.reporteVentaProductoTranslate = this._translate.instant('reporteVentaProductoTranslate');
            this.agendaTranslate = this._translate.instant('agendaTranslate');
            this.facturaTranslate = this._translate.instant('facturaTranslate');
        });

        this.matIconRegistry.addSvgIcon('iconCruzCirculo', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/10-2-TiposdeExcepcion-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconImprimir', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Imprimir-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconCorreo', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Correo-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconArchivo', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Archivo-icon.svg"));

        setTimeout(() => {
            this.crearModales();
        }, 100);
    }

    // ------------------------ Creación de modales -------------------------
    public crearModales(){
        if ($('body').find('.modalGlobalInformacionFactura').length > 1) {
            $('body').find('.modalGlobalInformacionFactura')[1].remove();
        }
        this.modales.modalGlobalInformacionFactura = new bootstrap.Modal($("#modalGlobalInformacionFactura").appendTo("body"), {
            backdrop: "static", 
            keyboard: false,
        });

        if ($('body').find('.modalGlobalFactura').length > 1) { //modal-factura
            $('body').find('.modalGlobalFactura')[1].remove();
        }
        this.modales.modalGlobalFactura = new bootstrap.Modal($("#modalGlobalFactura").appendTo("body"), {
            backdrop: "static", 
            keyboard: false,
        });

        if ($('body').find('.modalGlobalSerie').length > 1) { //modal-factura
            $('body').find('.modalGlobalSerie')[1].remove();
        }
        this.modales.modalGlobalSerie = new bootstrap.Modal($("#modalGlobalSerie").appendTo("body"), {
            backdrop: "static", 
            keyboard: false,
        });
    }

    // ----------------------------------------------------------------------------------------------------------------------------------------- //
    // ------------------------------------------------------------- DECLARACIÓN DE VARIABLES -------------------------------------------------- //
    currencyPipe: CurrencyPipe;
    modales: any = {};
    global: any = {};
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
            aplicaResico: true,
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
        aplicaIVA: true,
        aplicaResico: true
    };
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
    idPagoClienteProducto: any;
    ocultarGuardar = false;
    caja: any = {
        venta: {
            ticket:{}
        }
    };
    idCliente: any;
    folioPago: any;
    datosGenerales: any;
    conceptos: any = true;


    // ----------------------------------------------------------------------------------------------------------------------------------------- //
    // ------------------------------------------------------------- DECLARACIÓN DE FUNCIONES -------------------------------------------------- //
    //Funcion para Validar el estatus de la factura, para que no se pueda mandar a timbrar el folio pago, si esta asignado a una factura.
    validarestatusfactura(id_Cliente: any ,folio_Pago: any) {
        this.idCliente = id_Cliente;
        this.folioPago = folio_Pago;
        var params: any = {};
        params.idFactura = '';
        params.folioPago = this.folioPago;
        //params.folioPago = this.caja.venta.ticket.folio_pago;

        this._backService.HttpPost("catalogos/factura/consultarFacturas", {}, params).subscribe((response: string) => {
            var datosFactura = eval(response);
            if (datosFactura.length > 0) {
                this._toaster.error("El Folio Pago esta relacionado a una Factura:" + datosFactura[0].folio);
                return true;
            }
            else {                   
                this.factura();
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
    }

    async factura() {   
        this._pantallaServicio.mostrarSpinner();
        
        this.moduloFactura.idPagoClienteProducto = "";
        var params: any = {};
        params.idCliente = this.idCliente;
        params.folioPago = this.folioPago;
        // params.idCliente = this.caja.venta.ticket.idCliente;
        // params.folioPago = this.caja.venta.ticket.folio_pago;

        this._backService.HttpPost("catalogos/factura/datosFiscales", {}, params, 'text').subscribe(async (response: string) => {
            switch (response) {
                case "NIFC":

                    $("#ddlTicketPagoCita>div>div>div>input").prop('disabled', true);
					let params: any = {};
					params.idCliente = this.idCliente;
					params.folioPago = this.folioPago;
                    this._pantallaServicio.ocultarSpinner();
                    var resultModalFC = await this._informacionFiscalClienteService.openModal(InformacionFiscalClienteComponent, params);
                    if(resultModalFC){
                        $("#ddlTicketPagoCita>div>div>div>input").prop('disabled', false);
                    }
                    
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
    }

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
    }

    conceptosFacturar(){
        var params: any = {};
        params.folioPago = this.folioPago;

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
        });

        // if (this.idPagoClienteProducto == null || this.idPagoClienteProducto == undefined || this.idPagoClienteProducto == "") {
        //     var params: any = {};
        //     params.idCita = this.citaFacturar;

        //     this._backService.HttpPost("catalogos/factura/cargarConceptosFacturar", {}, params).subscribe((response: string) => {
        //         this.dataConceptos = eval(response);
        //         this.setearConceptos();
        //     }, 
        //     (error) => {
        //         this._pantallaServicio.ocultarSpinner();
        //         if (error == 'SinSesion' || error == 'SesionCaducada') {
        //             if (error == 'SinSesion') {
        //             this._toaster.error(this.sessionTraslate.favorIniciarSesion);
        //             }
        //             if (error == 'SesionCaducada') {
        //             this._toaster.error(this.sessionTraslate.sesionCaducada);
        //             }
        //             this._router.navigate(['/login']);
        //             return;
        //         }
        //         this._toaster.error(this.sessionTraslate.errorEliminar);
        //     });
        // }
        // else {
        //     var params: any = {};
        //     params.idPagoClienteProducto = this.idPagoClienteProducto;

        //     this._backService.HttpPost("catalogos/factura/cargarConceptosFacturarProducto", {}, params).subscribe((response: string) => {
        //         this.dataConceptos = eval(response);
        //         this.setearConceptos();
        //     }, 
        //     (error) => {
        //         this._pantallaServicio.ocultarSpinner();
        //         if (error == 'SinSesion' || error == 'SesionCaducada') {
        //             if (error == 'SinSesion') {
        //             this._toaster.error(this.sessionTraslate.favorIniciarSesion);
        //             }
        //             if (error == 'SesionCaducada') {
        //             this._toaster.error(this.sessionTraslate.sesionCaducada);
        //             }
        //             this._router.navigate(['/login']);
        //             return;
        //         }
        //         this._toaster.error(this.sessionTraslate.errorEliminar);
        //     });
        // }
    }

    //Seteamos los conceptos que estan y seran facturados
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
        this.facturacion.impuestoRetencionISR = 0.0;
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
                        aplicaIVA: (facturado) ? ((facturado.factor_iva > 0.000000) ? true : false) : false,
                        retencionISRMostrar: 0
                    });
                    var servicioId = this.facturacion.listaFacturar.filter((item: any) => { 
                        if(item.id == i){
                            return item;
                        }
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
                    aplicaIVA: (facturado) ? ((facturado.factor_iva > 0.000000) ? true : false) : false,
                    retencionISRMostrar:0
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
    }
    
    //Setea los datos cuando se abren desde la agenda y no cuenta con ninguna factura
    setearDatosFiscales(){ 
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
            if (this.moduloFactura.datosFiscales[0].tipo == "Física") {
                fisica = 1;
                moral = 0;
            } else {
                fisica = 0;
                moral = 1;
            }
            this.cargarRegimenFiscal(fisica, moral);
            //Datos del receptor
            this.facturacion.receptorIdCliente = (this.moduloFactura.datosFiscales[1].idCliente == null) ? "" : this.moduloFactura.datosFiscales[1].idCliente;
            this.facturacion.receptorNombre = (this.moduloFactura.datosFiscales[1].nombre == null) ? "" : this.moduloFactura.datosFiscales[1].nombre;
            this.facturacion.receptorRFC = (this.moduloFactura.datosFiscales[1].RFC == null) ? "" : this.moduloFactura.datosFiscales[1].RFC;

            this.facturacion.receptorCFDI = (this.moduloFactura.datosFiscales[1].idDatosFiscalesUsoCFDI == null) ? this.dataCFDI.filter((filter: any)=> { descripcion: 'Por definir' })[0] : this.moduloFactura.datosFiscales[1].idDatosFiscalesUsoCFDI;
            this.facturacion.receptorFormaPago = (this.moduloFactura.datosFiscales[1].idDatosFiscalesFormaPago == null) ? this.dataformasDePago.filter((filter: any)=>  { descripcion: 'Por definir' })[0] : this.moduloFactura.datosFiscales[1].idDatosFiscalesFormaPago;
            this.facturacion.receptorMetodoPago = (this.moduloFactura.datosFiscales[1].idDatosFiscalesMetodoPago == null) ? this.datametodosDePago.filter((filter: any)=> { descripcion: 'Pago en una sola exhibición' })[0] : this.moduloFactura.datosFiscales[1].idDatosFiscalesMetodoPago;
            
            // this.facturacion.receptorCFDI = (this.moduloFactura.datosFiscales[1].idDatosFiscalesUsoCFDI == null) ? $filter('filter')(this.dataCFDI, { descripcion: 'Por definir' }, true)[0].idDatosFiscalesUsoCFDI : this.moduloFactura.datosFiscales[1].idDatosFiscalesUsoCFDI; DUDA CON ESTOS TRES FILTER
            // this.facturacion.receptorFormaPago = (this.moduloFactura.datosFiscales[1].idDatosFiscalesFormaPago == null) ? $filter('filter')(this.dataformasDePago, { descripcion: 'Por definir' }, true)[0].idDatosFiscalesFormaPago : this.moduloFactura.datosFiscales[1].idDatosFiscalesFormaPago;
            // this.facturacion.receptorMetodoPago = (this.moduloFactura.datosFiscales[1].idDatosFiscalesMetodoPago == null) ? $filter('filter')(this.datametodosDePago, { descripcion: 'Pago en una sola exhibición' }, true)[0].idDatosFiscalesMetodoPago : this.moduloFactura.datosFiscales[1].idDatosFiscalesMetodoPago;
            //Datos del emisor y generales
            this.facturacion.emisorSucursal = (this.moduloFactura.datosFiscales[0].idSucursal == null) ? "" : this.moduloFactura.datosFiscales[0].idSucursal;
            this.facturacion.antiguoemisorSucursal = this.facturacion.emisorSucursal;
            this.facturacion.emisorRegimenFiscal = (this.moduloFactura.datosFiscales[0].regimenFiscal == null) ? "" : this.moduloFactura.datosFiscales[0].regimenFiscal;
            
            this.modales.modalGlobalFactura.show();
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
    }

    //Setea los datos cuando se abren desde listado de documento, o ya existen facturas relacionadas a la cita
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
            this.facturacion.serieyFolioFactura = (this.dataFactura[0].idSerie == null) ? null : this.dataFactura[0].idSerie;
            this.modales.modalGlobalFactura.show();
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
    }

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
        });
    }

    editarFactura() {
        this._pantallaServicio.mostrarSpinner();

        var params: any = {}; 
        // params.folioPago = //$rootScope.caja.venta.ticket.folio_pago; DUDA RESUELTO
        params.folioPago = this.folioPago;
        params.idFactura = this.idFactura;
        
        this._backService.HttpPost("catalogos/factura/datosFactura", {}, params).subscribe((response: string) => {
            this.dataFactura = eval(response)[0];
            this.dataFacturaDetalle = eval(response)[1];
            this.dataConceptos = eval(response)[2];
            this.cargarSucursales(2);
            setTimeout(() => {
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
        });
    }

    regresarDatosGenerales() {
        this.datosGenerales = false;
        this.conceptos = true;
    }

    next() {
        this.conceptos = false;
        this.datosGenerales = true;
    }

    guardarFacturas() {
        this._pantallaServicio.mostrarSpinner();

        var llevaIVA = false;
        var params: any = {};
        // params.folioPago = //$rootScope.caja.venta.ticket.folio_pago; DUDA RESUELTO
        params.folioPago = this.folioPago;
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
        for (var i = 0; i < this.facturacion.listaFacturar.length; i++) {
            if (this.facturacion.listaFacturar[i].seFactura && !this.facturacion.listaFacturar[i].yaFacturado) {
                params.conceptos.push(this.facturacion.listaFacturar[i]);
            }
        }
        params.factor_iva = (this.facturacion.ivaGeneral) ? this.facturacion.ivaGeneral : "";
        params.guardar = (this.idFactura) ? 0 : 1;//1 = guardar Primera vez, 0 = Cuando edita la factura
        params.idFactura = (this.idFactura) ? this.idFactura : "";
        params.timbrado = "0";
        params.retencionISRMostrar = 0.0;

        this._backService.HttpPost("catalogos/factura/guardarFactura", {}, params, "text").subscribe((response: string) => {
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
        });
    }

    timbrarFacturas() {
        this._pantallaServicio.mostrarSpinner();
        var llevaIVA = false;
        var params: any = {};

        //params.folioPago = //$rootScope.caja.venta.ticket.folio_pago; DUDA RESUELTO
        params.folioPago = this.folioPago;
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

        params.totalIva = 0.0;
        params.subTotalAntesImpuestos = 0.0
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
        params.timbrado = "1";

        this._backService.HttpPost("catalogos/factura/generarFactura", {}, params, "text").subscribe((response: any) => {
            this._pantallaServicio.ocultarSpinner();
            if (response == "True" || response == "true" || response == true) {
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
        });
    }

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

    changeIvaGeneral() {
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
    }

    validarCamposGenerales() {
        var isValid = true;

        if (this.facturacion.emisorSucursal == "") {
            isValid = false;
            $("#sucursalInput > div:first-child").attr("style", "outline: red solid 1px !important");
            $("#sucursalInput > div:first-child").attr("style", "outline: red solid 1px !important");
        } else {
            $("#sucursalInput > div:first-child").attr("style", "outline: none");
        }

        if (this.facturacion.emisorRegimenFiscal == "" || this.facturacion.emisorRegimenFiscal == null) {
            isValid = false;
            $("#regimenFiscalInput > div:first-child").attr("style", "outline: red solid 1px !important");
        } else {
            $("#regimenFiscalInput > div:first-child").attr("style", "outline: none");
        }

        if (this.facturacion.receptorRFC == "") {
            isValid = false;
            $("#rfcInput").addClass("errorCampo");
        } else {
            $("#rfcInput").removeClass("errorCampo");
        }

        if (this.facturacion.receptorFormaPago == "") {
            isValid = false;
            $("#formasDePagoSelect > div:first-child").attr("style", "outline: red solid 1px !important");
        } else {
            $("#formasDePagoSelect > div:first-child").attr("style", "outline: none");
        }

        if (this.facturacion.receptorMetodoPago == "" || this.facturacion.receptorMetodoPago == null) {
            isValid = false;
            $("#metodosDePagoSelect > div:first-child").attr("style", "outline: red solid 1px !important");
        } else {
            $("#metodosDePagoSelect > div:first-child").attr("style", "outline: none");
        }

        if (this.facturacion.receptorCFDI == "") {
            isValid = false;
            $("#CFDIInput > div:first-child").attr("style", "outline: red solid 1px !important");
        } else {
            $("#CFDIInput > div:first-child").attr("style", "outline: none");
        }

        if (this.facturacion.serieyFolioFactura == "" || this.facturacion.serieyFolioFactura == null) {
            isValid = false;
            $("#serieFolioInput > div:first-child").attr("style", "outline: red solid 1px !important");
        } else {
            $("#serieFolioInput > div:first-child").attr("style", "outline: none");
        }


        if (isValid) {
            this.next();
        }
    }

    validarConceptos(opcion: any) {
        var isValid = true;
        for (var i = 0; i < this.facturacion.listaFacturar.length; i++) {
            $("#cveProdServ" + i + " .select2-choice > div:first-child").attr("style", "outline: none");
            $("#unidad" + i + " .select2-choice > div:first-child").attr("style", "outline: none");
            if (this.facturacion.listaFacturar[i].seFactura && !this.facturacion.listaFacturar[i].yaFacturado) {
                if (this.facturacion.listaFacturar[i].cveProdServ == "" || this.facturacion.listaFacturar[i].cveProdServ == null) {
                    $("#cveProdServ" + i + " .select2-choice > div:first-child").attr("style", "outline: red solid 1px !important");
                    isValid = false;
                }
                if (this.facturacion.listaFacturar[i].cveUnidad == "" || this.facturacion.listaFacturar[i].cveUnidad == null) {
                    $("#unidad" + i + " .select2-choice > div:first-child").attr("style", "outline: red solid 1px !important");
                    isValid = false;
                }
                if (this.facturacion.listaFacturar[i].tipo == 5) {
                    if (this.facturacion.listaFacturar[i].cantidad == 0 || this.facturacion.listaFacturar[i].cantidad == "" || this.facturacion.listaFacturar[i].cantidad == null) {
                        this._toaster.error('No se puede facturar cantidades en 0',);
                        isValid = false;
                    }
                    if (this.facturacion.listaFacturar[i].montoTotal == 0 || this.facturacion.listaFacturar[i].montoTotal == "" || this.facturacion.listaFacturar[i].montoTotal == null) {
                        this._toaster.error('No se puede facturar montos en 0');
                        isValid = false;
                    }
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

    cerrarModalFactura() {
        this.modales.modalGlobalFactura.hide()
        $('body').css('overflow', 'auto');
        this.datosGenerales = false;
        this.conceptos = true;
        this.facturacion.emisorSucursal = null;
        this.facturacion.emisorRegimenFiscal = null;
        this.facturacion.receptorCFDI = null;
        this.facturacion.receptorFormaPago = null;
        this.facturacion.receptorMetodoPago = null;
        this.facturacion.receptorNombre = "";
        this.facturacion.receptorRFC = "";
        this.facturacion.serieyFolioFactura = null;
        this.dataSucursales = [];
        this.dataformasDePago = [];
        this.datametodosDePago = [];
        this.dataCFDI = [];
        this.dataRegimen = [];
        this.dataSerie = [];
        this.datosFiscales = [];
        this.sinSeries = false;
        $("#sucursalInput > div:first-child").attr("style", "outline: none");
        $("#regimenFiscalInput > div:first-child").attr("style", "outline: none");
        $("#rfcInput > div:first-child").attr("style", "outline: none");
        $("#formasDePagoSelect > div:first-child").attr("style", "outline: none");
        $("#metodosDePagoSelect > div:first-child").attr("style", "outline: none");
        $("#CFDIInput > div:first-child").attr("style", "outline: none");
        $("#serieFolioInput > div:first-child").attr("style", "outline: none");
        for (var i = 0; i < this.facturacion.listaFacturar.length; i++) {
            if (this.facturacion.listaFacturar[i].seFactura) {
                $("#cveProdServ" + i + "> div:first-child").attr("style", "outline: none");
                $("#unidad" + i + "> div:first-child").attr("style", "outline: none");
                $("#impuestos" + i + "> div:first-child").attr("style", "outline: none");
            }
        }
    }

    modalInformacionFactura(message: any) {
        this.modales.modalGlobalInformacionFactura.show();
        $("#modalGlobalInformacionFactura .modal-body").html('<span class="title">' + message + '</span>');
    }

    nuevaSerie() {
        this.modales.modalGlobalSerie.show();
        //$('#modalSerie').modal({ backdrop: 'static', keyboard: false });
    }

    onBlurTxt(elemento: any) {
        if (this.facturaSeries.bandGuardar) {
            switch (elemento) {
                case "nombre":
                    if (!this.facturaSeries.ErrorNombre) {
                        if (this.facturaSeries.nombre == "" || this.facturaSeries.nombre === null) {
                            $("#" + elemento).addClass("error-input");
                        }

                    }
                    break;

                case "contador":
                    if (!this.facturaSeries.ErrorContador) {
                        if (this.facturaSeries.contador == "" || this.facturaSeries.contador === null) {
                            $("#" + elemento).addClass("error-input");
                        }
                    }
                    break;

                case "minimo":

                    if (!this.facturaSeries.ErrorMinimo) {
                        if (this.facturaSeries.minimo == "" || this.facturaSeries.minimo === null) {
                            $("#" + elemento).addClass("error-input");
                        }
                    }

                    break;

                case "maximo":

                    if (!this.facturaSeries.ErrorMaximo) {
                        if (this.facturaSeries.maximo == "" || this.facturaSeries.maximo === null) {
                            $("#" + elemento).addClass("error-input");
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
                        $("#" + elemento).removeClass("error-input");
                    }
                    break;
                case "contador":
                    if (!this.facturaSeries.ErrorContador) {
                        $("#" + elemento).removeClass("error-input");
                    }
                    break;
                case "minimo":
                    if (!this.facturaSeries.ErrorMinimo) {
                        $("#" + elemento).removeClass("error-input");
                    }
                    break;
                case "maximo":
                    if (!this.facturaSeries.ErrorMaximo) {
                        $("#" + elemento).removeClass("error-input");
                    }
                    break;
            }
        }
    }
}