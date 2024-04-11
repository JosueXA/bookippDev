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


@Injectable({
  providedIn: 'root'
})

export class TicketService {
    // Variables de Translate
    sessionTraslate: any = {};
    configuracionSucursalTranslate: any = {};
    informacionFiscalClienteTranslate: any = {};
    imprimirTicketTranslate: any = {};
    consultaAjustesTranslate: any = {};
    consultaClienteTranslate: any = {};
    reporteVentaProductoTranslate: any = {};
    agendaTranslate: any = {};

    constructor(private dialog: MatDialog, private domSanitizer: DomSanitizer, private matIconRegistry: MatIconRegistry, private _translate: TranslateService, private _backService: MethodsService, public _pantallaServicio: PantallaService, private _dialog: MatDialog, private _router: Router, private _toaster: ToasterService) { 
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
        });

        this.matIconRegistry.addSvgIcon('iconCruzCirculo', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/10-2-TiposdeExcepcion-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconImprimir', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Imprimir-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconCorreo', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Correo-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconArchivo', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Archivo-icon.svg"));

        this.declaraciones();
        setTimeout(() => {
            this.crearModales();
        },100);
    }

    // ------------------------ Creación de modales -------------------------
    public crearModales(){
        if ($('body').find('.modalGlobalTicketPago').length > 1) {
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
        });

        // if ($('body').find('.modalGlobalInformacionFactura').length > 1) {
        //     $('body').find('.modalGlobalInformacionFactura')[1].remove();
        // }
        // this.modales.modalGlobalInformacionFactura = new bootstrap.Modal($("#modalGlobalInformacionFactura").appendTo("body"), {
        //     backdrop: "static", 
        //     keyboard: false,
        // });

        if ($('body').find('.modalGlobalTicketPagoAgenda').length > 1) {
            $('body').find('.modalGlobalTicketPagoAgenda')[1].remove();
        }
        this.modales.modalGlobalTicketPagoAgenda = new bootstrap.Modal($("#modalGlobalTicketPagoAgenda").appendTo("body"), {
            backdrop: "static", 
            keyboard: false,
        });
    }

    // ----------------------------------------------------------------------------------------------------------------------------------------- //
    // ------------------------------------------------------------- DECLARACIÓN DE VARIABLES -------------------------------------------------- //
    currencyPipe: CurrencyPipe;
    imprimir: any = {
        control: {},
        ticket: {
            dataLineas: [],
            dataTipoHoja: '',
            margenExtra: 0,
            dataIva: .16,
            contenido: {},
            margen: [
                { id: 1, pageSize: 'A7', dftFontSize: 6, mgnIzquierdo: 12, mgnDerecho: 10, mgnSuperior: 10, mgnInferior: 5 },
                { id: 2, pageSize: 'A8', dftFontSize: 5, mgnIzquierdo: 12, mgnDerecho: 10, mgnSuperior: 10, mgnInferior: 5 },
                { id: 3, pageSize: 'A9', dftFontSize: 3, mgnIzquierdo: 5, mgnDerecho: 5, mgnSuperior: 5, mgnInferior: 5 },
                { id: 4, pageSize: 'A10', dftFontSize: 2, mgnIzquierdo: 5, mgnDerecho: 5, mgnSuperior: 3, mgnInferior: 3 },
            ],
            separador: [
                { id: 'A7', texto: '- - - - - - - - - - - - - - - - - - - - - - - - - - - - -' },
                { id: 'A8', texto: '- - - - - - - - - - - - - - - - - - - - - - -' },
                { id: 'A9', texto: '- - - - - - - - - - - - - - - - - - - - - - - - - - - - -' },
                { id: 'A10', texto: '- - - - - - - - - - - - - - - - - - - - - - - - - - - - -' }
            ],
            isIva: false
        },
        dataTicket: {},
        //output: [],
        output: {
            separador: "",
            cabecera: [],
            pieDePagina: [],
            hoja: {
                dftFontSize: 6,
                pageSize: 1,
                pageMargins: 1,
            },
            folio: '',
            fechaHora: '',
            dataServicios: [],
            subtotal: 0,
            total: 0,
            iva: 0,
            descuento: 0,
            promocion: 0,
            propina: 0,
        }
    };
    mandarTicketCorreo: any = false;
    mandarTicketCorreoVentaDirecta: any = false;
    mandarTicketCorteCaja: any  = false;
    dataTicket: any;
    //caja: any;
    pdfMake: any = {
        fonts: {}
    }
    _printIframe: any;
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
    ticketPago: any = {
        dataTickets: [],
        ticketSelecionado: null
    }


    // ----------------------------------------------------------------------------------------------------------------------------------------- //
    // ------------------------------------------------------------- DECLARACIÓN DE FUNCIONES -------------------------------------------------- //

    caja_movimientos_mostrarTicketFolioPago(folio: any) {
        this._pantallaServicio.mostrarSpinner();

        var params: any = {};

        if(this.ticketPago.ticketSelecionado != '' && this.ticketPago.ticketSelecionado != null && folio == 'agenda'){
            params.folioPago = this.ticketPago.ticketSelecionado;
        }else{
            this.modales.modalGlobalTicketPago.show();
            params.folioPago = folio;
        }
        //params.folioPago = folio;
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
    }

    caja_movimientos_mostrarTicketFolioVenta(folio: any) {
        this.modales.modalGlobalTicketVenta.show();
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
    }

    caja_movimientos_mostrarTicketFolioRetiroEfectivo(folio: any) {
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
    }

    caja_movimientos_mostrarTicketFolioPagoAgenda() {
        this.modales.modalGlobalTicketPagoAgenda.show();
    }

    caja_movimientos_ocultarTicketFolioPagoAgenda() {
        this.ticketPago.ticketSelecionado = null;
        this.modales.modalGlobalTicketPagoAgenda.hide();
    }

    declaraciones(){
        //this.imprimir.output = [];
        this.imprimir.output.separador = this.imprimir.ticket.separador[0].texto;
        this.imprimir.output.cabecera = [];
        this.imprimir.output.pieDePagina = [];
        this.imprimir.output.hoja = {};
        this.imprimir.output.hoja.dftFontSize = this.imprimir.ticket.margen[0].dftFontSize;
        this.imprimir.output.hoja.pageSize = '';
        this.imprimir.output.hoja.pageMargins = [(this.imprimir.ticket.margen[0].mgnIzquierdo + this.imprimir.ticket.margenExtra), this.imprimir.ticket.margen[0].mgnSuperior,
                                            (this.imprimir.ticket.margen[0].mgnDerecho + this.imprimir.ticket.margenExtra), this.imprimir.ticket.margen[0].mgnInferior];
        this.imprimir.output.folio = '';
        this.imprimir.output.fechaHora = '';
        this.imprimir.output.dataServicios = [];
    
        this.imprimir.ticket.isIva = false;
        this.imprimir.output.subtotal = 0;
        this.imprimir.output.total = 0;
        this.imprimir.output.iva = 0;
        this.imprimir.output.descuento = 0;
        this.imprimir.output.promocion = 0;
        this.imprimir.output.propina = 0;
        this.imprimir.output.dataServicios = [];
    }

    imprimir_modalAlert(message: any) {
        //$('#modal-alert').modal({ backdrop: 'static', keyboard: false });
        //$("#modal-alert .modal-body").html('<span class="title">' + message + '</span>');
    };

    imprimir_negativeCurrency(val: any) {
        var result = '';
        val = (val * -1.00).toFixed(2);
        result = '- ' + val;

        return result;
    }

    imprimir_control_mandarCorreoTicket() {
        this.mandarTicketCorreo = true;
        this.mandarTicketCorreoVentaDirecta = false;
        this.mandarTicketCorteCaja = false;
        this.imprimir_control_imprimirTicket();
    }

    imprimir_control_mandarCorreoTicketVentaDirecta() {
        this.mandarTicketCorreo = false;
        this.mandarTicketCorreoVentaDirecta = true;
        this.mandarTicketCorteCaja = false;
        this.imprimir_control_imprimirTicket();
    }

    imprimir_control_mandarCorreoTicketCorteCaja() {
        this.mandarTicketCorreo = false;
        this.mandarTicketCorreoVentaDirecta = false;
        this.mandarTicketCorteCaja = true
        this.imprimir_control_imprimirTicketCorteCaja();
    }

    //FUNCIONES QUE ACCESAN A LA B.D.--------------------------------------------------------------------------------------------------------------
    /* Establece la configuracion inicial de la hoja para una sucursal en específico */
    imprimir_control_setHoja() {
        var tipoHoja = this.imprimir.ticket.dataTipoHoja;

        switch (tipoHoja) {
            case 'A7':
                this.imprimir.output.hoja.pageSize = this.imprimir.ticket.dataTipoHoja;
                this.imprimir.output.hoja.dftFontSize = this.imprimir.ticket.margen[0].dftFontSize;
                this.imprimir.output.separador = this.imprimir.ticket.separador[0].texto;
                this.imprimir.output.hoja.pageMargins = [(this.imprimir.ticket.margen[0].mgnIzquierdo + this.imprimir.ticket.margenExtra), this.imprimir.ticket.margen[0].mgnSuperior,
                                                (this.imprimir.ticket.margen[0].mgnDerecho + this.imprimir.ticket.margenExtra), this.imprimir.ticket.margen[0].mgnInferior];
                break;
            case 'A8':
                this.imprimir.output.hoja.pageSize = this.imprimir.ticket.dataTipoHoja;
                this.imprimir.output.hoja.dftFontSize = this.imprimir.ticket.margen[1].dftFontSize;
                this.imprimir.output.separador = this.imprimir.ticket.separador[1].texto;
                this.imprimir.output.hoja.pageMargins = [(this.imprimir.ticket.margen[1].mgnIzquierdo + this.imprimir.ticket.margenExtra), this.imprimir.ticket.margen[1].mgnSuperior,
                                                (this.imprimir.ticket.margen[1].mgnDerecho + this.imprimir.ticket.margenExtra), this.imprimir.ticket.margen[1].mgnInferior];
                break;
            case 'A9':
                this.imprimir.output.hoja.pageSize = this.imprimir.ticket.dataTipoHoja;
                this.imprimir.output.hoja.dftFontSize = this.imprimir.ticket.margen[2].dftFontSize;
                this.imprimir.output.separador = this.imprimir.ticket.separador[2].texto;
                this.imprimir.output.hoja.pageMargins = [(this.imprimir.ticket.margen[2].mgnIzquierdo + this.imprimir.ticket.margenExtra), this.imprimir.ticket.margen[2].mgnSuperior,
                                                (this.imprimir.ticket.margen[2].mgnDerecho + this.imprimir.ticket.margenExtra), this.imprimir.ticket.margen[2].mgnInferior];
                break;
            case 'A10':
                this.imprimir.output.hoja.pageSize = this.imprimir.ticket.dataTipoHoja;
                this.imprimir.output.hoja.dftFontSize = this.imprimir.ticket.margen[3].dftFontSize;
                this.imprimir.output.separador = this.imprimir.ticket.separador[3].texto;
                this.imprimir.output.hoja.pageMargins = [(this.imprimir.ticket.margen[3].mgnIzquierdo + this.imprimir.ticket.margenExtra), this.imprimir.ticket.margen[3].mgnSuperior,
                                                (this.imprimir.ticket.margen[3].mgnDerecho + this.imprimir.ticket.margenExtra), this.imprimir.ticket.margen[3].mgnInferior];
                break;
            case 'A7Continua':
                this.imprimir.output.hoja.pageSize = 'A7';
                this.imprimir.output.hoja.dftFontSize = this.imprimir.ticket.margen[0].dftFontSize;
                this.imprimir.output.separador = this.imprimir.ticket.separador[0].texto;
                this.imprimir.output.hoja.pageMargins = [(this.imprimir.ticket.margen[0].mgnIzquierdo + this.imprimir.ticket.margenExtra), 0,
                                                (this.imprimir.ticket.margen[0].mgnDerecho + this.imprimir.ticket.margenExtra), 0];
                break;
            case 'A8Continua':
                this.imprimir.output.hoja.pageSize = 'A8';
                this.imprimir.output.hoja.dftFontSize = this.imprimir.ticket.margen[1].dftFontSize;
                this.imprimir.output.separador = this.imprimir.ticket.separador[1].texto;
                this.imprimir.output.hoja.pageMargins = [(this.imprimir.ticket.margen[1].mgnIzquierdo + this.imprimir.ticket.margenExtra), 0,
                                                (this.imprimir.ticket.margen[1].mgnDerecho + this.imprimir.ticket.margenExtra), 0];
                break;
            case 'A9Continua':
                this.imprimir.output.hoja.pageSize = 'A9';
                this.imprimir.output.hoja.dftFontSize = this.imprimir.ticket.margen[2].dftFontSize;
                this.imprimir.output.separador = this.imprimir.ticket.separador[2].texto;
                this.imprimir.output.hoja.pageMargins = [(this.imprimir.ticket.margen[2].mgnIzquierdo + this.imprimir.ticket.margenExtra), 0,
                                                (this.imprimir.ticket.margen[2].mgnDerecho + this.imprimir.ticket.margenExtra), 0];
                break;
            case 'A10Continua':
                this.imprimir.output.hoja.pageSize = 'A10';
                this.imprimir.output.hoja.dftFontSize = this.imprimir.ticket.margen[3].dftFontSize;
                this.imprimir.output.separador = this.imprimir.ticket.separador[3].texto;
                this.imprimir.output.hoja.pageMargins = [(this.imprimir.ticket.margen[3].mgnIzquierdo + this.imprimir.ticket.margenExtra), 0,
                                                (this.imprimir.ticket.margen[3].mgnDerecho + this.imprimir.ticket.margenExtra), 0];
                break;
        }
    }

    /* Asigna las lineas obtenidas de la B.D. al arreglo final de cabecera y pie de página */
    imprimir_control_setLineas() {
        this.imprimir.output.cabecera = [];
        this.imprimir.output.pieDePagina = [];
        this.imprimir.ticket.dataLineas.forEach((row: any, index: any) => {
            var objeto = {};
            if (row.tipoTexto == 'cabecera') {
                objeto = {
                    text: row.valor,
                    style: {
                        fontSize: 10,
                        bold: row.esBold,
                        italics: row.esItalic,
                        alignment: 'center',
                        lineHeight: 1.2
                    }
                }
                this.imprimir.output.cabecera.push(objeto);
            } else {
                objeto = {
                    text: row.valor,
                    style: {
                        fontSize: 10,
                        bold: row.esBold,
                        italics: row.esItalic,
                        alignment: row.alineacion,
                        lineHeight: 1.2
                    }
                }
                this.imprimir.output.pieDePagina.push(objeto);
            }
        });
    }

    //FUNCIONES PROCESOS DE TICKET ---------------------------------------------------------------------------------------------------------------- 
    /* Obtiene datos de tipo de hoja y lineas previamente almacenadas en la B.D. */
    imprimir_control_imprimirTicket() {
        //Se obtiene el tipo de hoja primero
        //$("#btnImprimirTicket").prop('disabled', true);
        this._pantallaServicio.mostrarSpinner();

        this._backService.HttpPost("catalogos/configurarTicket/getConfigHoja", {}, {}).subscribe((response: string) => {
            this.imprimir.ticket.dataTipoHoja = response;

            if (this.imprimir.ticket.dataTipoHoja != null || this.imprimir.ticket.dataTipoHoja != '' || this.imprimir.ticket.dataTipoHoja != ' ') {   
                //Si existen, se obtiene las líneas de texto previamente almacenadas
                this._backService.HttpPost("catalogos/configurarTicket/getLineas", {}, {}).subscribe((response: string) => {
                    this.imprimir.ticket.dataLineas = eval(response);
                                
                    this.imprimir_control_setHoja();
                    if (this.imprimir.ticket.dataLineas == null || this.imprimir.ticket.dataLineas.length == 0) {
                        this.imprimir.ticket.dataLineas = [];
                        this.imprimir.ticket.margenExtra = 0;
                    } else {
                        this.imprimir.ticket.margenExtra = this.imprimir.ticket.dataLineas[0].margenExtra;
                        this.imprimir_control_setLineas();
                    }
                    var params: any = {};
                    params.idCliente = this.dataTicket.idCliente;

                    this._backService.HttpPost("procesos/informacionFiscalCliente/informacionFiscalCliente/cargarInformacionFiscalClienteTicket", {}, params).subscribe((response: string) => {
                        var objData = eval(response);

                        if (objData.length > 0) {
                            var arreglo2: any = [];
                            this.imprimir.keyNames = Object.values(objData[0]);
                            this.imprimir.output.dataFiscales = [];

                            for (var i = 0; i < this.imprimir.keyNames.length; i++) {
                                arreglo2.push({ valor: this.imprimir.keyNames[i] });
                            }

                            arreglo2[0].nombre = this.configuracionSucursalTranslate.rfc;
                            arreglo2[1].nombre = this.configuracionSucursalTranslate.tipoPersona;
                            arreglo2[2].nombre = this.informacionFiscalClienteTranslate.telefono;
                            arreglo2[3].nombre = this.informacionFiscalClienteTranslate.email;
                            arreglo2[4].nombre = this.informacionFiscalClienteTranslate.calle;
                            arreglo2[5].nombre = this.informacionFiscalClienteTranslate.numero;
                            arreglo2[6].nombre = this.informacionFiscalClienteTranslate.numeroInterior;
                            arreglo2[7].nombre = this.informacionFiscalClienteTranslate.colonia;
                            arreglo2[8].nombre = this.informacionFiscalClienteTranslate.codigoPostal;
                            arreglo2[9].nombre = this.informacionFiscalClienteTranslate.ciudad;
                            arreglo2[10].nombre = this.informacionFiscalClienteTranslate.estado;
                            arreglo2[11].nombre = this.informacionFiscalClienteTranslate.pais;
                            
                            for (var i = 0; i < arreglo2.length; i++) {
                                if (arreglo2[i].valor !== "" && arreglo2[i].valor !== undefined && arreglo2[i].valor !== null) {
                                    this.imprimir.output.dataFiscales.push(arreglo2[i]);
                                }
                            }
                        } else {
                            this.imprimir.output.dataFiscales = [];
                        }

                        this.imprimir_control_configTicket();
                        this._pantallaServicio.ocultarSpinner();
                        //$("#btnImprimirTicket").prop('disabled', false);
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
            else {}
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

    imprimir_control_configTicket() {
        var idioma: any = this._translate.use(this._pantallaServicio.idioma);
        //idioma = idioma.split("-");
        this.imprimir.output.folio = '';
        this.imprimir.output.fechaHora = '';
        this.imprimir.output.descuento = 0;
        this.imprimir.output.promocion = 0;
        this.imprimir.output.propina = 0;
        this.imprimir.output.dataServicios = {};

        this.imprimir.output.folio = this.global.ticket.folio;
        this.imprimir.output.cliente = this.global.ticket.cliente;

        this.imprimir.output.fechaHora = moment(this.global.ticket.fechaSF).format("DD MM YYYY HH:mm");
        if (idioma[0] == 'en') {
            this.imprimir.output.fechaHora = moment(this.global.ticket.fechaSF).format("MM DD YYYY HH:mm");
        }

        this.imprimir.output.descuento = this.global.ticket.descuento;
        this.imprimir.output.promocion = this.global.ticket.promocion;
        this.imprimir.output.propina = this.global.ticket.propina;
        this.imprimir.output.dataServicios = this.global.ticket.cargos;
        this.imprimir.output.productos = this.global.ticket.productos;
        this.imprimir.output.paquetes = this.global.ticket.paquetes;
        this.imprimir.output.certificadosRegalo = this.global.ticket.certificadosRegalo;
        this.imprimir.output.metodoPago = this.global.ticket.metodoPago;

        this.imprimir.output.totalDescuento = this.global.ticket.totalDescuento;
        this.imprimir.output.totalPagado = this.global.ticket.totalPagado;

        this.imprimir_control_procesarCantidades();

        pdfMake.fonts = {
            Anonymous_Pro: {
                normal: 'Anonymous_Pro.ttf',
                bold: 'Anonymous_Pro_B.ttf',
                italics: 'Anonymous_Pro_I.ttf',
                bolditalics: 'Anonymous_Pro_BI.ttf'
            }
        }

        const contenidoPDF: any = {
            pageSize: {
                height: (4.13 * 72),
                width: (2.91 * 72)

            },
            pageMargins: this.imprimir.output.hoja.pageMargins,
            content: [
                this.imprimir_control_crearContenido()
            ],

            defaultStyle: {
                font: 'Anonymous_Pro',
                fontSize: 10,
                lineHeight: .6
            },

            styles: {
                gralColumnas: {
                    lineHeight: 1.3,//1.5,//1.6,
                    columnGap: 5
                },
                titulos: {
                    fontSize: 9,
                    alignment: 'left',
                    lineHeight: 1.3
                },
                cantidad: {
                    alignment: 'center',
                    lineHeight: 1.3
                },
                descripcion: {
                    alignment: 'left',
                    lineHeight: 1.3
                },
                importe: {
                    alignment: 'right',
                    lineHeight: 1.3
                },
                centrado: {
                    alignment: 'center',
                    lineHeight: 1.3
                },
                separador: {
                    fontSize: this.imprimir.output.hoja.dftFontSize,
                    alignment: 'center',
                    margin: 0,
                    lineHeight: 1.6,
                    bold: true
                },
                totalesCompraDesc: {
                    alignment: 'right',
                    lineHeight: 1.3
                },
                totalesCompraCant: {
                    alignment: 'right',
                    lineHeight: 1.3
                },
                fechaHora: {
                    alignment: 'center',
                    bold: true,
                    lineHeight: 1.3
                }
            }
        }

        contenidoPDF.pageSize.height = (this.imprimir.varAux.length * 20);//(this.imprimir.varAux.length * 11);

        if (this.mandarTicketCorreo || this.mandarTicketCorreoVentaDirecta) {
            pdfMake.createPdf(contenidoPDF).getBase64((encodedString: any) => {
                var data;
                data = encodedString;
                if (this.mandarTicketCorreo) {
                    this.mandarTicketCorreo = false;
                    this.funcionMandarCorreoTicket(data);
                }
                else {
                    this.mandarTicketCorreoVentaDirecta = false;
                }
            });
        }
        else {
            pdfMake.createPdf(contenidoPDF).print();
        }
    }

    imprimir_control_procesarCantidades() {
        this.imprimir.output.subtotal = 0;
        this.imprimir.output.total = 0;
        this.imprimir.output.iva = 0;
        var subtotal = 0;

        this.imprimir.output.dataServicios.forEach((row: any, index: any) => {
            subtotal += row.pago;
        });

        this.imprimir.output.productos.forEach((row: any, index: any) => {
            subtotal += row.pago;
        });

        this.imprimir.output.certificadosRegalo.forEach((row: any, index: any) => {
            subtotal += row.pago;
        });


        if (this.imprimir.output.descuento) {
            if (Array.isArray(this.imprimir.output.descuento)) {
                if (this.imprimir.output.descuento.length > 0) {
                    this.imprimir.output.descuento.forEach((row: any, index: any) => {
                        subtotal += row.pago;
                    });
                }
            }
            else {
                subtotal += this.imprimir.output.descuento.pago;

            }
        }

        if (this.imprimir.output.promocion) {
            if (Array.isArray(this.imprimir.output.promocion)) {
                if (this.imprimir.output.promocion.length > 0) {
                    this.imprimir.output.promocion.forEach((row: any, index: any) => {
                        subtotal -= row.pago;
                    });
                }
            }
            else {
                subtotal -= this.imprimir.output.promocion.pago;

            }
        }

        if (this.imprimir.output.propina) {
            if (Array.isArray(this.imprimir.output.propina)) {
                if (this.imprimir.output.propina.length > 0) {
                    this.imprimir.output.propina.forEach((row: any, index: any) => {
                        subtotal += row.pago;
                    });
                }
            }
            else {
                subtotal += this.imprimir.output.propina.pago;
            }
        }

        this.imprimir.output.paquetes.forEach((row: any, index: any) => {
            subtotal += row.pago;
        });

        if (this.imprimir.output.totalDescuento) {
            subtotal -= this.imprimir.output.totalDescuento;
        }

        this.imprimir.output.subtotal = subtotal;
        this.imprimir.output.iva = this.imprimir.output.subtotal * this.imprimir.ticket.dataIva;
        this.imprimir.output.total = this.imprimir.output.subtotal + this.imprimir.output.iva;
    }

    imprimir_control_crearContenido() {
        var totalContenido = [];
        //Si el margen superior es 0, insertar primera línea en blanco
        if (this.imprimir.output.hoja.pageMargins[1] == 0) {
            totalContenido.push({
                style: 'gralColumnas',
                columns: [
                    {
                        text: ' '
                    }
                ]
            });
        }

        // INSERTAR SEPARADOR
        totalContenido.push({
            style: 'gralColumnas',
            columns: [
                {
                    width: '100%',
                    style: 'separador',
                    text: this.imprimir.output.separador
                }
            ]
        });

        // INSERTAR CABECERA
        this.imprimir.output.cabecera.forEach((row: any, index: any) => {
            totalContenido.push({
                style: 'gralColumnas',
                columns: [
                    {
                        width: '100%',
                        style: row.style,
                        text: row.text
                    }
                ]
            });
        });

        // INSERTAR SEPARADOR
        totalContenido.push({
            style: 'gralColumnas',
            columns: [
                {
                    width: '100%',
                    style: 'separador',
                    text: this.imprimir.output.separador
                }
            ]
        });

        // INSERTAR ID TICKET, FECHA Y HORA
        totalContenido.push({
            style: 'gralColumnas',
            columns: [
                {
                    width: '100%',
                    style: 'fechaHora',
                    alignment: 'left',
                    text: this.imprimirTicketTranslate.folio + this.imprimir.output.folio
                }
            ]
        });

        totalContenido.push({
            style: 'gralColumnas',
            columns: [
                {
                    width: '100%',
                    style: 'fechaHora',
                    alignment: 'left',
                    text: this.consultaAjustesTranslate.fecha + ": " + this.imprimir.output.fechaHora
                }
            ]
        });

        // INSERTAR SEPARADOR
        totalContenido.push({
            style: 'gralColumnas',
            columns: [
                {
                    width: '100%',
                    style: 'separador',
                    text: this.imprimir.output.separador
                }
            ]
        });

        // INSERTAR EL NOMBRE DEL CLIENTE
        totalContenido.push({
            style: 'gralColumnas',
            columns: [
                {
                    width: '100%',
                    style: 'descripcion',
                    text: this.consultaClienteTranslate.cliente + ': '
                }
            ]
        });
        totalContenido.push({
            style: 'gralColumnas',
            columns: [
                {
                    width: '100%',
                    style: 'descripcion',
                    text: this.imprimir.output.cliente
                }
            ]
        });

        this.imprimir.output.dataFiscales.forEach((row: any, index: any) => {
            totalContenido.push({
                style: 'gralColumnas',
                columns: [
                    {
                        width: '100%',
                        style: 'descripcion',
                        text: row.nombre + ": " + row.valor
                    }
                ]
            });
        });

        // INSERTAR SEPARADOR
        totalContenido.push({
            style: 'gralColumnas',
            columns: [
                {
                    width: '100%',
                    style: 'separador',
                    text: this.imprimir.output.separador
                }
            ]
        });

        // INSERTAR CABECERA DE CONCEPTOS
        totalContenido.push({
            style: 'gralColumnas',
            columns: [
                {
                    width: '12%',
                    style: 'titulos',
                    text: this.reporteVentaProductoTranslate.cant
                },
                {
                    width: '53%',
                    style: 'titulos',
                    text: this.imprimirTicketTranslate.descripcion
                },
                {
                    width: '35%',
                    style: 'importe',
                    text: this.imprimirTicketTranslate.importe
                }
            ]
        });

        //INSERTAR CONCEPTOS
        this.imprimir.output.dataServicios.forEach((row: any, index: any) => {
            totalContenido.push({
                style: 'gralColumnas',
                columns: [
                    {
                        width: '12%',
                        style: 'cantidad',
                        text: '1'
                    },
                    {
                        width: '53%',
                        style: 'descripcion',
                        text: row.descripcion
                    },
                    {
                        width: '35%',
                        style: 'importe',
                        text: row.pago.toFixed(2)
                    }
                ]
            });
        });

        this.imprimir.output.productos.forEach((row: any, index: any) => {
            totalContenido.push({
                style: 'gralColumnas',
                columns: [
                    {
                        width: '12%',
                        style: 'cantidad',
                        text: row.cantidadProducto.toString()
                    },
                    {
                        width: '53%',
                        style: 'descripcion',
                        text: row.descripcion
                    },
                    {
                        width: '35%',
                        style: 'importe',
                        text: row.pago.toFixed(2)
                    }
                ]
            });
        });

        this.imprimir.output.certificadosRegalo.forEach((row: any, index: any) => {
            totalContenido.push({
                style: 'gralColumnas',
                columns: [
                    {
                        width: '12%',
                        style: 'cantidad',
                        text: 1
                    },
                    {
                        width: '53%',
                        style: 'descripcion',
                        text: row.descripcion
                    },
                    {
                        width: '35%',
                        style: 'importe',
                        text: row.pago.toFixed(2)
                    }
                ]
            });
        });

        this.imprimir.output.paquetes.forEach((row: any, index: any) => {
            totalContenido.push({
                style: 'gralColumnas',
                columns: [
                    {
                        width: '12%',
                        style: 'cantidad',
                        text: "1"
                    },
                    {
                        width: '53%',
                        style: 'descripcion',
                        text: "Paquete - " + row.descripcion
                    },
                    {
                        width: '35%',
                        style: 'importe',
                        text: row.pago.toFixed(2)
                    }
                ]
            });
        });

        //INSERTAR DESCUENTOS (SI EXISTEN)
        if (this.imprimir.output.descuento != undefined) {
            if (Array.isArray(this.imprimir.output.descuento)) {
                if (this.imprimir.output.descuento.length > 0) {
                    this.imprimir.output.descuento.forEach((row: any, index: any) => {

                        if (row.pago < 0) {
                            totalContenido.push({
                                style: 'gralColumnas',
                                columns: [
                                    {
                                        width: '12%',
                                        style: 'cantidad',
                                        text: ' '
                                    },
                                    {
                                        width: '53%',
                                        style: 'descripcion',
                                        text: row.descripcion
                                    },
                                    {
                                        width: '35%',
                                        style: 'importe',
                                        text: this.imprimir_negativeCurrency(row.pago)
                                    }
                                ]
                            });
                        }
                    });
                }
            }
            else {
                if (this.imprimir.output.descuento.pago < 0) {
                    totalContenido.push({
                        style: 'gralColumnas',
                        columns: [
                            {
                                width: '12%',
                                style: 'cantidad',
                                text: ' '
                            },
                            {
                                width: '53%',
                                style: 'descripcion',
                                text: this.imprimir.output.descuento.descripcion
                            },
                            {
                                width: '35%',
                                style: 'importe',
                                text: this.imprimir_negativeCurrency(this.imprimir.output.descuento.pago)
                            }
                        ]
                    });
                }
            }
        }

        //INSERTAR PROPINAS (SI EXISTEN)
        if (this.imprimir.output.propina != undefined) {
            if (Array.isArray(this.imprimir.output.propina)) {
                if (this.imprimir.output.propina.length) {
                    this.imprimir.output.propina.forEach((row: any, index: any) => {
                        if (row.pago > 0) {
                            totalContenido.push({
                                style: 'gralColumnas',
                                columns: [
                                    {
                                        width: '12%',
                                        style: 'cantidad',
                                        text: ' '
                                    },
                                    {
                                        width: '53%',
                                        style: 'descripcion',
                                        text: row.descripcion
                                    },
                                    {
                                        width: '35%',
                                        style: 'importe',
                                        text: row.pago.toFixed(2)
                                    }
                                ]
                            });
                        }
                    });
                }
            }
            else {
                if (this.imprimir.output.propina.pago > 0) {
                    totalContenido.push({
                        style: 'gralColumnas',
                        columns: [
                            {
                                width: '12%',
                                style: 'cantidad',
                                text: ' '
                            },
                            {
                                width: '53%',
                                style: 'descripcion',
                                text: this.imprimir.output.propina.descripcion
                            },
                            {
                                width: '35%',
                                style: 'importe',
                                text: this.imprimir.output.propina.pago.toFixed(2)
                            }
                        ]
                    });
                }
            }

        }

        //INSERTAR PROMOCIONES (SI EXISTEN)
        if (this.imprimir.output.promocion != undefined) {
            if (Array.isArray(this.imprimir.output.promocion)) {
                if (this.imprimir.output.promocion.length) {
                    this.imprimir.output.promocion.forEach((row: any, index: any) => {
                        if ((row.pago * -1) < 0) {
                            totalContenido.push({
                                style: 'gralColumnas',
                                columns: [
                                    {
                                        width: '12%',
                                        style: 'cantidad',
                                        text: ' '
                                    },
                                    {
                                        width: '53%',
                                        style: 'descripcion',
                                        text: row.descripcion
                                    },
                                    {
                                        width: '35%',
                                        style: 'importe',
                                        text: this.imprimir_negativeCurrency(row.pago)
                                    }
                                ]
                            });
                        }
                    });
                }
            }
            else {
                if (this.imprimir.output.promocion.pago < 0) {
                    totalContenido.push({
                        style: 'gralColumnas',
                        columns: [
                            {
                                width: '12%',
                                style: 'cantidad',
                                text: ' '
                            },
                            {
                                width: '53%',
                                style: 'descripcion',
                                text: this.imprimir.output.promocion.descripcion
                            },
                            {
                                width: '35%',
                                style: 'importe',
                                text: this.imprimir_negativeCurrency(this.imprimir.output.promocion.pago)
                            }
                        ]
                    });
                }
            }

        }

        if (this.imprimir.output.totalDescuento != 0) {
            totalContenido.push({
                style: 'gralColumnas',
                columns: [
                    {
                        width: '12%',
                        style: 'cantidad',
                        text: ' '
                    },
                    {
                        width: '53%',
                        style: 'descripcion',
                        text: "Descuento"
                    },
                    {
                        width: '35%',
                        style: 'importe',
                        text: this.imprimir_negativeCurrency(this.imprimir.output.totalDescuento)
                    }
                ]
            });
        }

        // INSERTAR SEPARADOR
        totalContenido.push({
            style: 'gralColumnas',
            columns: [
                {
                    width: '100%',
                    style: 'separador',
                    text: this.imprimir.output.separador
                }
            ]
        });

        // INSERTAR TOTALES COMPRA
        // SI TICKET INCLUYE IVA
        if (this.imprimir.ticket.isIva) {
            //SUBTOTAL
            totalContenido.push({
                style: 'gralColumnas',
                columns: [
                    {
                        width: '12%',
                        style: 'cantidad',
                        text: ' '
                    },
                    {
                        width: '53%',
                        style: 'totalesCompraDesc',
                        text: this.imprimirTicketTranslate.subtotal
                    },
                    {
                        width: '35%',
                        style: 'totalesCompraCant',
                        text: this.imprimir.output.subtotal.toFixed(2)
                    }
                ]
            });
            //IVA
            totalContenido.push({
                style: 'gralColumnas',
                columns: [
                    {
                        width: '12%',
                        style: 'cantidad',
                        text: ' '
                    },
                    {
                        width: '53%',
                        style: 'totalesCompraDesc',
                        text: this.imprimirTicketTranslate.iva
                    },
                    {
                        width: '35%',
                        style: 'totalesCompraCant',
                        text: this.imprimir.output.iva.toFixed(2)
                    }
                ]
            });
            //TOTAL
            totalContenido.push({
                style: 'gralColumnas',
                columns: [
                    {
                        width: '12%',
                        style: 'cantidad',
                        text: ' '
                    },
                    {
                        width: '53%',
                        style: 'totalesCompraDesc',
                        text: this.imprimirTicketTranslate.total
                    },
                    {
                        width: '35%',
                        style: 'totalesCompraCant',
                        text: this.imprimir.output.total.toFixed(2)
                    }
                ]
            });
        } else { //SI NO, SOLO INCLUIR TOTAL
            //SOLO TOTAL
            totalContenido.push({
                style: 'gralColumnas',
                columns: [
                    {
                        width: '12%',
                        style: 'cantidad',
                        text: ' '
                    },
                    {
                        width: '53%',
                        style: 'totalesCompraDesc',
                        text: this.imprimirTicketTranslate.total
                    },
                    {
                        width: '35%',
                        style: 'totalesCompraCant',
                        text: this.imprimir.output.subtotal.toFixed(2)
                    }
                ]
            });
        }

        // INSERTAR SEPARADOR
        totalContenido.push({
            style: 'gralColumnas',
            columns: [
                {
                    width: '100%',
                    style: 'separador',
                    text: this.imprimir.output.separador
                }
            ]
        });

        //TOTAL
        totalContenido.push({
            style: 'gralColumnas',
            columns: [
                {
                    width: '100%',
                    style: 'descripcion',
                    text: "Método de pago"
                }
            ]
        });

        this.imprimir.output.metodoPago.forEach((row: any, index: any) => {
            if (row.digitos) {
                totalContenido.push({
                    style: 'gralColumnas',
                    columns: [
                        {
                            width: '70%',
                            style: 'descripcion',
                            text: row.descripcion + " (" + row.digitos + ")"
                        },
                        {
                            width: '30%',
                            style: 'importe',
                            text: row.pago.toFixed(2)
                        }
                    ]
                });
            }
            else {
                totalContenido.push({
                    style: 'gralColumnas',
                    columns: [
                        {
                            width: '70%',
                            style: 'descripcion',
                            text: row.descripcion
                        },
                        {
                            width: '30%',
                            style: 'importe',
                            text: row.pago.toFixed(2)
                        }
                    ]
                });
            }
        });

        // INSERTAR SEPARADOR
        totalContenido.push({
            style: 'gralColumnas',
            columns: [
                {
                    width: '100%',
                    style: 'separador',
                    text: this.imprimir.output.separador
                }
            ]
        });

        totalContenido.push({
            style: 'gralColumnas',
            columns: [
                {
                    width: '12%',
                    style: 'cantidad',
                    text: ' '
                },
                {
                    width: '53%',
                    style: 'totalesCompraDesc',
                    text: "Total Pagado"
                },
                {
                    width: '35%',
                    style: 'importe',
                    text: this.imprimir.output.totalPagado.toFixed(2)
                }
            ]
        });

        // INSERTAR SEPARADOR
        totalContenido.push({
            style: 'gralColumnas',
            columns: [
                {
                    width: '100%',
                    style: 'separador',
                    text: this.imprimir.output.separador
                }
            ]
        });

        // INSERTAR PIE DE PAGINA
        this.imprimir.output.pieDePagina.forEach((row: any, index: any) => {
            totalContenido.push({
                style: 'gralColumnas',
                columns: [
                    {
                        width: '100%',
                        style: row.style,
                        text: row.text
                    }
                ]
            });
        });
        this.imprimir.varAux = totalContenido;
        return totalContenido;
    }

    // --------------------------------------------------------------------------- CORTE DE CAJA ---------------------------------------------------------------------------
    imprimir_control_imprimirTicketCorteCaja() {
        //$("#btnImprimirTicket").prop('disabled', true);
        this._pantallaServicio.mostrarSpinner();

        this._backService.HttpPost("catalogos/configurarTicket/getConfigHoja", {}, {}).subscribe((response: string) => {
            this.imprimir.ticket.dataTipoHoja = response;

            if (this.imprimir.ticket.dataTipoHoja != null || this.imprimir.ticket.dataTipoHoja != '' || this.imprimir.ticket.dataTipoHoja != ' ') {
                this._backService.HttpPost("catalogos/configurarTicket/getLineas", {}, {}).subscribe((response: string) => {
                    this.imprimir.ticket.dataLineas = eval(response);

                    this.imprimir_control_setHoja();
                    if (this.imprimir.ticket.dataLineas == null || this.imprimir.ticket.dataLineas.length == 0) {
                        this.imprimir.ticket.dataLineas = [];
                        this.imprimir.ticket.margenExtra = 0;
                    }
                    else {
                        this.imprimir.ticket.margenExtra = this.imprimir.ticket.dataLineas[0].margenExtra;
                        this.imprimir_control_setLineas();
                    }

                    this.imprimir_control_configTicketCorteCaja();
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

    imprimir_control_configTicketCorteCaja() {
        this.dataTicket = this.global; // Se pasa el DataTicket desde Caja
        var idioma: any= this._translate.use(this._pantallaServicio.idioma);
        //idioma = idioma.split("-");

        this.imprimir.output.folioTicket = this.dataTicket.corte.folioTicket;
        this.imprimir.output.nombreCorteTipo = this.dataTicket.corte.nombreCorteTipo;
        this.imprimir.output.nombreUsuarioCorte = this.dataTicket.corte.nombreUsuarioCorte;
        this.imprimir.output.fechaAlta = this.dataTicket.corte.fechaAlta;
        this.imprimir.output.fondoCaja = this.dataTicket.corte.fondoCaja;
        this.imprimir.output.montoPromociones = this.dataTicket.corte.montoPromociones;
        this.imprimir.output.montoDiferencia = this.dataTicket.corte.montoDiferencia;
        this.imprimir.output.nombreCorteAccion = this.dataTicket.corte.nombreCorteAccion;
        this.imprimir.output.nombreRealizoAlta = this.dataTicket.corte.nombreRealizoAlta;
        this.imprimir.output.nombreUsuarioVerificacion = this.dataTicket.corte.nombreUsuarioVerificacion;
        this.imprimir.output.totalRetirosEfectivo = this.dataTicket.corte.totalRetirosEfectivo;
        this.imprimir.output.totalDevoluciones = this.dataTicket.corte.totalDevoluciones;
        this.imprimir.output.totalPropinas = this.dataTicket.corte.totalPropinas;

        this.imprimir.output.metodosPago = this.dataTicket.corte.metodosPago;
        this.imprimir.output.ingresos = this.dataTicket.corte.ingresos;

        this.imprimir.output.totalMontoIngresos = this.dataTicket.corte.totalMontoIngresos;
        this.imprimir.output.totalMontoCaja = this.dataTicket.corte.totalMontoCaja;

        pdfMake.fonts = {
            Anonymous_Pro: {
                normal: 'Anonymous_Pro.ttf',
                bold: 'Anonymous_Pro_B.ttf',
                italics: 'Anonymous_Pro_I.ttf',
                bolditalics: 'Anonymous_Pro_BI.ttf'
            }
        }

        var contenidoPDF: any = {
            pageSize: {
                height: (4.13 * 72),
                width: (2.91 * 72)

            },
            pageMargins: this.imprimir.output.hoja.pageMargins,
            content: [
                this.imprimir_control_crearContenidoCorteCaja()
            ],
            defaultStyle: {
                font: 'Anonymous_Pro',
                fontSize: 10,
                lineHeight: .6
            },
            styles: {
                gralColumnas: {
                    lineHeight: 1.3,
                    columnGap: 5
                },
                titulos: {
                    fontSize: 9,
                    alignment: 'left',
                    lineHeight: 1.3
                },
                cantidad: {
                    alignment: 'center',
                    lineHeight: 1.3
                },
                descripcion: {
                    alignment: 'left',
                    lineHeight: 1.3
                },
                importe: {
                    alignment: 'right',
                    lineHeight: 1.3
                },
                centrado: {
                    alignment: 'center',
                    lineHeight: 1.3
                },
                separador: {
                    fontSize: this.imprimir.output.hoja.dftFontSize,
                    alignment: 'center',
                    margin: 0,
                    lineHeight: 1.6,
                    bold: true
                },
                totalesCompraDesc: {
                    alignment: 'right',
                    lineHeight: 1.3
                },
                totalesCompraCant: {
                    alignment: 'right',
                    lineHeight: 1.3
                },
                fechaHora: {
                    alignment: 'center',
                    bold: true,
                    lineHeight: 1.3
                }
            }
        }

        contenidoPDF.pageSize.height = (this.imprimir.varAux.length * 20);

        if (this.mandarTicketCorteCaja) {
            pdfMake.createPdf(contenidoPDF).getBase64((encodedString: any) => {
                var data;
                data = encodedString;
                this.mandarTicketCorteCaja = false;
                this.funcionMandarCorreoTicketCorteCaja(data);
            });
        }
        else {
            pdfMake.createPdf(contenidoPDF).print();
        }
    }

    imprimir_control_crearContenidoCorteCaja() {
        var totalContenido = [];

        // --------------------------------------------------------------------- //
        if (this.imprimir.output.hoja.pageMargins[1] == 0) {
            totalContenido.push({
                style: 'gralColumnas',
                columns: [
                    {
                        text: ' '
                    }
                ]
            });
        }
        // INSERTAR SEPARADOR
        totalContenido.push({
            style: 'gralColumnas',
            columns: [
                {
                    width: '100%',
                    style: 'separador',
                    text: this.imprimir.output.separador
                }
            ]
        });
        // INSERTAR CABECERA
        this.imprimir.output.cabecera.forEach((row: any, index: any) => {
            totalContenido.push({
                style: 'gralColumnas',
                columns: [
                    {
                        width: '100%',
                        style: row.style,
                        text: row.text
                    }
                ]
            });
        });

        // --------------------------------------------------------------------- //
        // INSERTAR SEPARADOR
        totalContenido.push({
            style: 'gralColumnas',
            columns: [
                {
                    width: '100%',
                    style: 'separador',
                    text: this.imprimir.output.separador
                }
            ]
        });
        // INSERTAR FOLIO
        totalContenido.push({
            style: 'gralColumnas',
            columns: [
                {
                    width: '100%',
                    style: 'fechaHora',
                    alignment: 'left',
                    text: "FOLIO: " + this.imprimir.output.folioTicket
                }
            ]
        });
        // INSERTAR TIPO DE CORTE
        totalContenido.push({
            style: 'gralColumnas',
            columns: [
                {
                    width: '100%',
                    style: 'fechaHora',
                    alignment: 'left',
                    text: "TIPO DE CORTE: " + this.imprimir.output.nombreCorteTipo
                }
            ]
        });
        // INSERTAR USUARIO CORTE
        totalContenido.push({
            style: 'gralColumnas',
            columns: [
                {
                    width: '100%',
                    style: 'fechaHora',
                    alignment: 'left',
                    text: "USUARIO CORTE: " + this.imprimir.output.nombreUsuarioCorte
                }
            ]
        });
        // INSERTAR FECHA
        totalContenido.push({
            style: 'gralColumnas',
            columns: [
                {
                    width: '100%',
                    style: 'fechaHora',
                    alignment: 'left',
                    text: "FECHA: " + this.imprimir.output.fechaAlta
                }
            ]
        });

        // --------------------------------------------------------------------- //
        // INSERTAR SEPARADOR
        totalContenido.push({
            style: 'gralColumnas',
            columns: [
                {
                    width: '100%',
                    style: 'separador',
                    text: this.imprimir.output.separador
                }
            ]
        });
        // INSERTAR FONDO DE CAJA
        totalContenido.push({
            style: 'gralColumnas',
            columns: [
                {
                    width: '100%',
                    style: 'fechaHora',
                    alignment: 'left',
                    text: "FONDO DE CAJA: " + this.imprimir.output.fondoCaja
                }
            ]
        });
        // INSERTAR PROMOCIONES
        totalContenido.push({
            style: 'gralColumnas',
            columns: [
                {
                    width: '100%',
                    style: 'fechaHora',
                    alignment: 'left',
                    text: "PROMOCIONES: " + this.imprimir.output.montoPromociones
                }
            ]
        });
        // INSERTAR DIFERENCIA
        totalContenido.push({
            style: 'gralColumnas',
            columns: [
                {
                    width: '100%',
                    style: 'fechaHora',
                    alignment: 'left',
                    text: "DIFERENCIA: " + this.imprimir.output.montoDiferencia
                }
            ]
        });
        // INSERTAR RETIROS DE EFECTIVO
        totalContenido.push({
            style: 'gralColumnas',
            columns: [
                {
                    width: '100%',
                    style: 'fechaHora',
                    alignment: 'left',
                    text: "RETIROS DE EFECTIVO: " + this.imprimir.output.totalRetirosEfectivo
                }
            ]
        });
        // INSERTAR DEVOLUCIONES
        totalContenido.push({
            style: 'gralColumnas',
            columns: [
                {
                    width: '100%',
                    style: 'fechaHora',
                    alignment: 'left',
                    text: "DEVOLUCIONES: " + this.imprimir.output.totalDevoluciones
                }
            ]
        });
        // INSERTAR PROPINAS
        totalContenido.push({
            style: 'gralColumnas',
            columns: [
                {
                    width: '100%',
                    style: 'fechaHora',
                    alignment: 'left',
                    text: "PROPINAS: " + this.imprimir.output.totalPropinas
                }
            ]
        });
        if (this.imprimir.output.nombreCorteAccion) {
            // INSERTAR ACCION
            totalContenido.push({
                style: 'gralColumnas',
                columns: [
                    {
                        width: '100%',
                        style: 'fechaHora',
                        alignment: 'left',
                        text: "ACCIÓN: " + this.imprimir.output.nombreCorteAccion
                    }
                ]
            });
        }
        // INSERTAR DIO ALTA
        totalContenido.push({
            style: 'gralColumnas',
            columns: [
                {
                    width: '100%',
                    style: 'fechaHora',
                    alignment: 'left',
                    text: "DIÓ DE ALTA: " + (this.imprimir.output.nombreRealizoAlta)
                }
            ]
        });
        // INSERTAR DIO ALTA
        totalContenido.push({
            style: 'gralColumnas',
            columns: [
                {
                    width: '100%',
                    style: 'fechaHora',
                    alignment: 'left',
                    text: "AUTORIZÓ: " + (this.imprimir.output.nombreUsuarioVerificacion)
                }
            ]
        });

        // --------------------------------------------------------------------- //
        // INSERTAR SEPARADOR
        totalContenido.push({
            style: 'gralColumnas',
            columns: [
                {
                    width: '100%',
                    style: 'separador',
                    text: this.imprimir.output.separador
                }
            ]
        });
        // INSERTAR NOMBRE DETALLE
        totalContenido.push({
            style: 'gralColumnas',
            columns: [
                {
                    width: '100%',
                    style: 'fechaHora',
                    alignment: 'left',
                    text: "DETALLE CORTE"
                }
            ]
        });
        //INSERTAR METODOS DE PAGO
        this.imprimir.output.metodosPago.forEach((row: any, index: any) => {
            totalContenido.push({
                style: 'gralColumnas',
                columns: [
                    {
                        width: '100%',
                        style: 'fechaHora',
                        alignment: 'left',
                        text: row.nombreMetodoPago ? row.nombreMetodoPago : "Voucher"
                    }
                ]
            });

            totalContenido.push({
                style: 'gralColumnas',
                columns: [
                    {
                        width: '10%',
                        style: 'cantidad',
                        text: ''
                    },
                    {
                        width: '55%',
                        style: 'descripcion',
                        text: "Monto Ingreso"
                    },
                    {
                        width: '35%',
                        style: 'importe',
                        text: row.montoIngreso.toFixed(2)
                    }
                ]
            });

            totalContenido.push({
                style: 'gralColumnas',
                columns: [
                    {
                        width: '10%',
                        style: 'cantidad',
                        text: ''
                    },
                    {
                        width: '55%',
                        style: 'descripcion',
                        text: "Monto Caja"
                    },
                    {
                        width: '35%',
                        style: 'importe',
                        text: row.montoCaja.toFixed(2)
                    }
                ]
            });

        });

        // --------------------------------------------------------------------- //
        // INSERTAR SEPARADOR
        totalContenido.push({
            style: 'gralColumnas',
            columns: [
                {
                    width: '100%',
                    style: 'separador',
                    text: this.imprimir.output.separador
                }
            ]
        });
        // INSERTAR INGRESOS DETALLE
        totalContenido.push({
            style: 'gralColumnas',
            columns: [
                {
                    width: '100%',
                    style: 'fechaHora',
                    alignment: 'left',
                    text: "DETALLE INGRESOS"
                }
            ]
        });
        //INSERTAR INGRESOS
        this.imprimir.output.ingresos.forEach((row: any, index: any) => {
            totalContenido.push({
                style: 'gralColumnas',
                columns: [
                    {
                        width: '10%',
                        style: 'cantidad',
                        text: ''
                    },
                    {
                        width: '55%',
                        style: 'descripcion',
                        text: row.valor.toFixed(2)
                    },
                    {
                        width: '35%',
                        style: 'cantidad',
                        text: row.cantidad.toString()
                    }
                ]
            });

        });

        // --------------------------------------------------------------------- //
        // INSERTAR SEPARADOR
        totalContenido.push({
            style: 'gralColumnas',
            columns: [
                {
                    width: '100%',
                    style: 'separador',
                    text: this.imprimir.output.separador
                }
            ]
        });
        // INSERTAR TOTAL MONTO INGRESO
        totalContenido.push({
            style: 'gralColumnas',
            columns: [
                {
                    width: '100%',
                    style: 'fechaHora',
                    alignment: 'left',
                    text: "TOTAL MONTO INGRESO: " + this.imprimir.output.totalMontoIngresos
                }
            ]
        });

        // --------------------------------------------------------------------- //
        // INSERTAR SEPARADOR
        totalContenido.push({
            style: 'gralColumnas',
            columns: [
                {
                    width: '100%',
                    style: 'separador',
                    text: this.imprimir.output.separador
                }
            ]
        });
        // INSERTAR TOTAL MONTO CAJA
        totalContenido.push({
            style: 'gralColumnas',
            columns: [
                {
                    width: '100%',
                    style: 'fechaHora',
                    alignment: 'left',
                    text: "TOTAL MONTO CAJA: " + this.imprimir.output.totalMontoCaja
                }
            ]
        });

        // --------------------------------------------------------------------- //
        // INSERTAR SEPARADOR
        totalContenido.push({
            style: 'gralColumnas',
            columns: [
                {
                    width: '100%',
                    style: 'separador',
                    text: this.imprimir.output.separador
                }
            ]
        });
        // INSERTAR PIE DE PAGINA
        this.imprimir.output.pieDePagina.forEach((row: any, index: any) => {
            totalContenido.push({
                style: 'gralColumnas',
                columns: [
                    {
                        width: '100%',
                        style: row.style,
                        text: row.text
                    }
                ]
            });
        });
        
        this.imprimir.varAux = totalContenido;
        return totalContenido;
    }

    // -------------------------------------------------------------------------- RETIRO EFECTIVO --------------------------------------------------------------------------
    imprimir_control_imprimirTicketRetiroEfectivo() {
        //$("#btnImprimirTicket").prop('disabled', true);
        this._pantallaServicio.mostrarSpinner();

        this._backService.HttpPost("catalogos/configurarTicket/getConfigHoja", {}, {}).subscribe((response: string) => {
            this.imprimir.ticket.dataTipoHoja = response;

            if (this.imprimir.ticket.dataTipoHoja != null || this.imprimir.ticket.dataTipoHoja != '' || this.imprimir.ticket.dataTipoHoja != ' ') {
                this._backService.HttpPost("catalogos/configurarTicket/getLineas", {}, {}).subscribe((response: string) => {
                    this.imprimir.ticket.dataLineas = eval(response);

                    this.imprimir_control_setHoja();
                    if (this.imprimir.ticket.dataLineas == null || this.imprimir.ticket.dataLineas.length == 0) {
                        this.imprimir.ticket.dataLineas = [];
                        this.imprimir.ticket.margenExtra = 0;
                    }
                    else {
                        this.imprimir.ticket.margenExtra = this.imprimir.ticket.dataLineas[0].margenExtra;
                        this.imprimir_control_setLineas();
                    }

                    this.imprimir_control_configTicketRetiroEfectivo();
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

    imprimir_control_configTicketRetiroEfectivo() {
        var idioma: any= this._translate.use(this._pantallaServicio.idioma);
        //idioma = idioma.split("-");

        this.imprimir.output.fecha = this.dataTicket.retiroEfectivo.Fecha;
        this.imprimir.output.folioTicket = this.dataTicket.retiroEfectivo.Folio;
        this.imprimir.output.usuario = this.dataTicket.retiroEfectivo.Usuario;
        this.imprimir.output.motivoRetiro = this.dataTicket.retiroEfectivo.motivoRetiro;
        this.imprimir.output.monto = this.dataTicket.retiroEfectivo.Monto;
        pdfMake.fonts = {
            Anonymous_Pro: {
                normal: 'Anonymous_Pro.ttf',
                bold: 'Anonymous_Pro_B.ttf',
                italics: 'Anonymous_Pro_I.ttf',
                bolditalics: 'Anonymous_Pro_BI.ttf'
            }
        }
        var contenidoPDF: any = {
            pageSize: {
                height: (4.13 * 72),
                width: (2.91 * 72)

            },
            pageMargins: this.imprimir.output.hoja.pageMargins,
            content: [
                this.imprimir_control_crearContenidoRetiroEfectivo()
            ],

            defaultStyle: {
                font: 'Anonymous_Pro',
                fontSize: 10,
                lineHeight: .6
            },

            styles: {

                gralColumnas: {
                    lineHeight: 1.3,
                    columnGap: 5
                },
                titulos: {
                    fontSize: 9,
                    alignment: 'left',
                    lineHeight: 1.3
                },
                cantidad: {
                    alignment: 'center',
                    lineHeight: 1.3
                },
                descripcion: {
                    alignment: 'left',
                    lineHeight: 1.3
                },
                importe: {
                    alignment: 'right',
                    lineHeight: 1.3
                },
                centrado: {
                    alignment: 'center',
                    lineHeight: 1.3
                },
                separador: {
                    fontSize: this.imprimir.output.hoja.dftFontSize,
                    alignment: 'center',
                    margin: 0,
                    lineHeight: 1.6,
                    bold: true
                },
                totalesCompraDesc: {
                    alignment: 'right',
                    lineHeight: 1.3
                },
                totalesCompraCant: {
                    alignment: 'right',
                    lineHeight: 1.3
                },
                fechaHora: {
                    alignment: 'center',
                    bold: true,
                    lineHeight: 1.3
                }
            }
        }

        contenidoPDF.pageSize.height = (this.imprimir.varAux.length * 20);

        pdfMake.createPdf(contenidoPDF).print();
    }

    imprimir_control_crearContenidoRetiroEfectivo() {
        var totalContenido = [];

        // --------------------------------------------------------------------- //
        if (this.imprimir.output.hoja.pageMargins[1] == 0) {
            totalContenido.push({
                style: 'gralColumnas',
                columns: [
                    {
                        text: ' '
                    }
                ]
            });
        }

        // INSERTAR SEPARADOR
        totalContenido.push({
            style: 'gralColumnas',
            columns: [
                {
                    width: '100%',
                    style: 'separador',
                    text: this.imprimir.output.separador
                }
            ]
        });

        // INSERTAR CABECERA
        this.imprimir.output.cabecera.forEach((row: any, index: any) => {
            totalContenido.push({
                style: 'gralColumnas',
                columns: [
                    {
                        width: '100%',
                        style: row.style,
                        text: row.text
                    }
                ]
            });
        });

        // --------------------------------------------------------------------- //

        // INSERTAR SEPARADOR
        totalContenido.push({
            style: 'gralColumnas',
            columns: [
                {
                    width: '100%',
                    style: 'separador',
                    text: this.imprimir.output.separador
                }
            ]
        });

        // INSERTAR FOLIO
        totalContenido.push({
            style: 'gralColumnas',
            columns: [
                {
                    width: '100%',
                    style: 'fechaHora',
                    alignment: 'left',
                    text: "FOLIO: " + this.imprimir.output.folioTicket
                }
            ]
        });

        // INSERTAR FECHA
        totalContenido.push({
            style: 'gralColumnas',
            columns: [
                {
                    width: '100%',
                    style: 'fechaHora',
                    alignment: 'left',
                    text: "FECHA: " + this.imprimir.output.fecha
                }
            ]
        });

        // INSERTAR USUARIO
        totalContenido.push({
            style: 'gralColumnas',
            columns: [
                {
                    width: '100%',
                    style: 'fechaHora',
                    alignment: 'left',
                    text: "USUARIO: " + this.imprimir.output.usuario
                }
            ]
        });

        // --------------------------------------------------------------------- //

        // INSERTAR SEPARADOR
        totalContenido.push({
            style: 'gralColumnas',
            columns: [
                {
                    width: '100%',
                    style: 'separador',
                    text: this.imprimir.output.separador
                }
            ]
        });

        // INSERTAR DETALLES
        totalContenido.push({
            style: 'gralColumnas',
            columns: [
                {
                    width: '10%',
                    style: 'cantidad',
                    text: ''
                },
                {
                    width: '60%',
                    style: 'descripcion',
                    text: "MOTIVO"
                },
                {
                    width: '30%',
                    style: 'importe',
                    text: "IMPORTE"
                }
            ]
        });

        totalContenido.push({
            style: 'gralColumnas',
            columns: [
                {
                    width: '10%',
                    style: 'cantidad',
                    text: ''
                },
                {
                    width: '60%',
                    style: 'descripcion',
                    text: this.imprimir.output.motivoRetiro
                },
                {
                    width: '30%',
                    style: 'importe',
                    text: this.imprimir.output.monto.toFixed(2)
                }
            ]
        });

        // --------------------------------------------------------------------- //

        // INSERTAR SEPARADOR
        totalContenido.push({
            style: 'gralColumnas',
            columns: [
                {
                    width: '100%',
                    style: 'separador',
                    text: this.imprimir.output.separador
                }
            ]
        });

        // INSERTAR PIE DE PAGINA
        this.imprimir.output.pieDePagina.forEach((row: any, index: any) => {
            totalContenido.push({
                style: 'gralColumnas',
                columns: [
                    {
                        width: '100%',
                        style: row.style,
                        text: row.text
                    }
                ]
            });
        });
        this.imprimir.varAux = totalContenido;
        return totalContenido;
    }

    // -------------------------------------------------------------------------- ENVÍO DE CORREOS -------------------------------------------------------------------------
    funcionMandarCorreoTicket(data: any) {
        if (this.caja.venta.ticket.emailCliente) {
            this._pantallaServicio.mostrarSpinner();
            var params: any = {};
            params.data = data;
            params.email = this.caja.venta.ticket.emailCliente;
            params.sucursal = this._pantallaServicio.idSucursal;

            this._backService.HttpPost("movil/usuarioMovil/enviarCorreoTicket", {}, params).subscribe((response: string) => {
                this._pantallaServicio.ocultarSpinner();
                this._toaster.success(this.agendaTranslate.reciboCorreoEnviado);
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
            this._toaster.error(this.agendaTranslate.reciboClienteSinEmail);
        }
    }

    funcionMandarCorreoTicketCorteCaja(data: any) {
        var params: any = {};
        params.data = data;

        this._backService.HttpPost("procesos/agenda/Agenda/consultarUsuariosAdministradores", {}, params).subscribe((response: string) => {
            var usuariosadmin = eval(response);
            if (usuariosadmin.length > 0) {                        
                params.email = usuariosadmin[0].email;
                params.sucursal = this._pantallaServicio.idSucursal;

                this._backService.HttpPost("movil/usuarioMovil/enviarCorreoTicket", {}, params).subscribe((response: string) => {
                    this._pantallaServicio.ocultarSpinner();
                    this._toaster.success('agendaTranslate.reciboCorreoEnviado');
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
                this._toaster.error('agendaTranslate.reciboClienteSinEmail');
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


    // -------------------------------------------------------------------------- FACTURACIÓN --------------------------------------------------------------------------
    //Funcion para Validar el estatus de la factura, para que no se pueda mandar a timbrar el folio pago, si esta asignado a una factura.
    // validarestatusfactura() {
    //     var params: any = {};
    //     params.idFactura = '';
    //     params.folioPago = this.caja.venta.ticket.folio_pago;

    //     this._backService.HttpPost("catalogos/factura/consultarFacturas", {}, params).subscribe((response: string) => {
    //         var datosFactura = eval(response);
    //         if (datosFactura.length > 0) {
    //             this._toaster.error("El Folio Pago esta relacionado a una Factura:" + datosFactura[0].folio);
    //             return true;
    //         }
    //         else {                   
    //             this.moduloFactura_factura();
    //             return false;
    //         }
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

    // moduloFactura_factura() {
    //     this.moduloFactura.idPagoClienteProducto = "";

    //     var params: any = {};
    //     params.idCliente = this.caja.venta.ticket.idCliente;
    //     params.folioPago = this.caja.venta.ticket.folio_pago;
    //     this._pantallaServicio.mostrarSpinner();

    //     this._backService.HttpPost("catalogos/factura/datosFiscales", {}, params, 'string').subscribe((response: string) => {
    //         switch (response) {
    //             case "NIFC":
    //                 var idCliente = this.caja.venta.ticket.idCliente;
    //                 var w = 1000;
    //                 var h = 530;
    //                 var left = Number((screen.width / 2) - (w / 2));
    //                 var tops = Number((screen.height / 2) - (h / 2));
    //                 var lang = this._translate.getDefaultLang();
    //                 var caracteristicas = "height=" + h + ",width=" + w + ",scrollTo,resizable=0,scrollbars=1,location=1," + "top=" + tops + ", left=" + left;
    //                 var nueva = window.open('/bookipp/informacionFiscalCliente.html#/' + idCliente + '&' + this.caja.venta.ticket.folio_pago + '&' + lang, 'Popup', caracteristicas);
    //                 this._pantallaServicio.ocultarSpinner();
    //                 break;
    //             case "NIFS":
    //                 this.modalInformacionFactura(this.agendaTranslate.noInfoSucursal);
    //                 this._pantallaServicio.ocultarSpinner();
    //                 break;
    //             case "NICE":
    //                 this.modalInformacionFactura(this.agendaTranslate.noCertiEmpresa);
    //                 this._pantallaServicio.ocultarSpinner();
    //                 break;
    //             case "FND":
    //                 this.modalInformacionFactura("No cuenta con facturas disponibles");
    //                 this._pantallaServicio.ocultarSpinner();
    //                 break;
    //             default:
    //                 this.moduloFactura.datosFiscales = eval(response);
    //                 if (this.moduloFactura.datosFiscales.length == 3) {
    //                     this.moduloFactura.dataFactura = this.moduloFactura.datosFiscales[0];
    //                     this.moduloFactura.idFactura = this.moduloFactura.dataFactura[0].idFactura;
    //                     this.moduloFactura.dataFacturaDetalle = this.moduloFactura.datosFiscales[1];
    //                     this.moduloFactura.dataConceptos = this.moduloFactura.datosFiscales[2];
    //                     this.cargarSucursales(2);
    //                 } else if (this.moduloFactura.datosFiscales.length == 1) {
    //                     this.moduloFactura.dataFactura = this.moduloFactura.datosFiscales[0];
    //                     this.moduloFactura.idFactura = this.moduloFactura.dataFactura[0].idFactura;
    //                     this.moduloFactura.dataFacturaDetalle = [];
    //                     this.moduloFactura.dataConceptos = null;
    //                     this.cargarSucursales(2);
    //                 } else {
    //                     this.moduloFactura.idFactura = null;
    //                     this.moduloFactura.dataFactura = null;
    //                     this.moduloFactura.dataFacturaDetalle = null;
    //                     this.moduloFactura.dataConceptos = null;
    //                     this.cargarSucursales(1);
    //                 }
    //         }
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

    // modalInformacionFactura(message: any) {
    //     this.modales.modalGlobalInformacionFactura.show();
    //     $("#modalGlobalInformacionFactura .modal-body").html('<span class="title">' + message + '</span>');
    // }

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
            // this.facturacion.receptorCFDI = (this.moduloFactura.datosFiscales[1].idDatosFiscalesUsoCFDI == null) ? $filter('filter')(this.dataCFDI, { descripcion: 'Por definir' }, true)[0].idDatosFiscalesUsoCFDI : this.moduloFactura.datosFiscales[1].idDatosFiscalesUsoCFDI; DUDA CON ESTOS TRES FILTER
            // this.facturacion.receptorFormaPago = (this.moduloFactura.datosFiscales[1].idDatosFiscalesFormaPago == null) ? $filter('filter')(this.dataformasDePago, { descripcion: 'Por definir' }, true)[0].idDatosFiscalesFormaPago : this.moduloFactura.datosFiscales[1].idDatosFiscalesFormaPago;
            // this.facturacion.receptorMetodoPago = (this.moduloFactura.datosFiscales[1].idDatosFiscalesMetodoPago == null) ? $filter('filter')(this.datametodosDePago, { descripcion: 'Pago en una sola exhibición' }, true)[0].idDatosFiscalesMetodoPago : this.moduloFactura.datosFiscales[1].idDatosFiscalesMetodoPago;
            //Datos del emisor y generales
            this.facturacion.emisorSucursal = (this.moduloFactura.datosFiscales[0].idSucursal == null) ? "" : this.moduloFactura.datosFiscales[0].idSucursal;
            this.facturacion.antiguoemisorSucursal = this.facturacion.emisorSucursal;
            this.facturacion.emisorRegimenFiscal = (this.moduloFactura.datosFiscales[0].regimenFiscal == null) ? "" : this.moduloFactura.datosFiscales[0].regimenFiscal;
            
            this.modales.modalFactura.show();
            /*$('#modal-factura').modal({ backdrop: 'static', keyboard: false })
            .on('hidden.bs.modal', (e: any) => {
                $("body").addClass("modal-open");
            });*/
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
            this.facturacion.serieyFolioFactura = (this.dataFactura[0].idSerie == null) ? "" : this.dataFactura[0].idSerie;
            this.modales.modalFactura.show();
            /*$('#modal-factura').modal({ backdrop: 'static', keyboard: false })
            .on('hidden.bs.modal', (e: any) => {
                $("body").addClass("modal-open");
            });*/

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
    }

    // -------------------------------------------------------------------------- RECIBIR PARAMS -------------------------------------------------------------------------
    recibirParametrosGlobales(globalParam: any){
        this.global = globalParam;
    }

    recibirListaTickets(globalParam: any){
        this.ticketPago.dataTickets = globalParam;
    }
}