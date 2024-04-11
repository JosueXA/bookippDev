import { Component, OnInit, OnDestroy, ViewContainerRef, ElementRef } from '@angular/core';

import { MethodsService } from 'src/app/core/services/methods.service';
import { ToasterService } from "src/shared/toaster/toaster.service";

// TRANSLATE
import { TranslateService } from '@ngx-translate/core';
import { PantallaService } from 'src/app/core/services/pantalla.service';

// OTROS
import moment from 'moment';
import { Router } from '@angular/router';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { TicketService } from 'src/app/core/services/ticket.service';
import { saveAs } from 'file-saver';
import * as bootstrap from 'bootstrap'; // BOOTSTRAP
import { format, set } from 'date-fns';
declare var $: any; // JQUERY

// FULLCALENDAR
import { CalendarOptions } from '@fullcalendar/angular'; // useful for typechecking
import { FullCalendarModule } from '@fullcalendar/angular';
import { Calendar, parseClassNames } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import resourceTimeGridPlugin from '@fullcalendar/resource-timegrid';
import interactionPlugin, { Draggable } from '@fullcalendar/interaction';
import scrollGridPlugin, { ScrollGrid } from '@fullcalendar/scrollgrid';
import * as momentPlugin from '@fullcalendar/moment'
import allLocales from '@fullcalendar/core/locales-all';
import { environment } from 'src/environments/environment';

// EXTRA
import { TemplateRef, ViewChild } from '@angular/core';
import { CajaService } from 'src/app/core/services/caja.service';
import { CajaComponent } from 'src/app/page/procesos/caja/caja.component';
import { concat, Observable, of, Subject, throwError } from 'rxjs';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatTabGroup } from '@angular/material/tabs';

@Component({
    selector: 'app-agenda',
    templateUrl: './agenda.component.html',
    styleUrls: ['./agenda.component.scss', '../../page.component.scss'],
})
export class AgendaComponent implements OnInit, OnDestroy {
    // Variables de Translate
    agendaTranslate: any = {};
    sessionTraslate: any = {};
    calendarioTranslate: any = {};
    sucursalTranslate: any = {};
    facturaTranslate: any = {};
    langsTranslate: any = {};
    equiposTranslate: any = {};

    calendar: any;

    // Modales
    modales: any = {};

    // Popover
    @ViewChild('popoverContenido') popoverContenido: TemplateRef<any>;

    // Interval
    interval: any;

    // Mat autocomplete
    @ViewChild(CdkVirtualScrollViewport) virtualScroll: CdkVirtualScrollViewport;
    @ViewChild(MatAutocompleteTrigger) autocompleteTrigger: MatAutocompleteTrigger;
    @ViewChild('autoListClientesInput') autoListClientesInput: ElementRef;

    // Control de las Pestañas
    @ViewChild('tabGroup', {static: false}) tab: MatTabGroup;

    constructor(private _translate: TranslateService, private _pantallaServicio: PantallaService, private domSanitizer: DomSanitizer, private matIconRegistry: MatIconRegistry, private _backService: MethodsService, private _toaster: ToasterService, private _router: Router, public _ticketService: TicketService, public _viewContainerRef: ViewContainerRef, private _serviceCaja: CajaService) {
        this._translate.setDefaultLang(this._pantallaServicio.idioma);
        this._translate.use(this._pantallaServicio.idioma);

        this._translate.get('agendaTranslate').subscribe((translated: string) => {
            this.agendaTranslate = this._translate.instant('agendaTranslate');
            this.sessionTraslate = this._translate.instant('sessionTraslate');
            this.calendarioTranslate = this._translate.instant('calendarioTranslate');
            this.sucursalTranslate = this._translate.instant('sucursalTranslate');
            this.facturaTranslate = this._translate.instant('facturaTranslate');
            this.langsTranslate = this._translate.instant('LANGS');
            this.equiposTranslate = this._translate.instant('equiposTranslate');

            this.recurrencias = {
                frecuencias: [
                    { id: 1, name: this.agendaTranslate.diaria },
                    { id: 2, name: this.agendaTranslate.semanal },
                    { id: 3, name: this.agendaTranslate.Mensual }
                ],

                repeticionDiaria: [
                    { id: 1, name: this.agendaTranslate.dia1 },
                    { id: 2, name: this.agendaTranslate.dias2 },
                    { id: 3, name: this.agendaTranslate.dias3 },
                    { id: 4, name: this.agendaTranslate.dias4 },
                    { id: 5, name: this.agendaTranslate.dias5 },
                    { id: 6, name: this.agendaTranslate.dias6 }
                ],

                repeticionSemanal: [
                    { id: 1, name: this.agendaTranslate.semana1 },
                    { id: 2, name: this.agendaTranslate.semanas2 },
                    { id: 3, name: this.agendaTranslate.semanas3 },
                    { id: 4, name: this.agendaTranslate.semanas4 }
                ],

                repeticionMensual: [
                    { id: 1, name: this.agendaTranslate.mes1 },
                    { id: 2, name: this.agendaTranslate.meses2 },
                    { id: 3, name: this.agendaTranslate.meses3 },
                    { id: 4, name: this.agendaTranslate.meses4 },
                    { id: 5, name: this.agendaTranslate.meses5 },
                    { id: 6, name: this.agendaTranslate.meses6 }
                ]
            };

            // --------------- Traducciones ---------------
            this.traducion = {
                notas: this.agendaTranslate.nota,
                frecuencia: ""
            };
        });
        this.indicadores_ingresosDetalle_inicializarCalendario();

        // ICONOS
        this.matIconRegistry.addSvgIcon('iconChrevronUpSmall', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/outline/outline-chevron-up-small-Modifi.svg"));
        this.matIconRegistry.addSvgIcon('iconCitasDia', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/D-CitasdelDiaColor-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconEditar', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Editar-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconBasura', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Basura-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconBuscar', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Buscar-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconCitasHoy', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/D-CitasRealizadasHoyColor-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconIngresosDia', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/D-IngresosdelDiaColor-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconCitasCanceladas', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/D-CitasCanceladasHoyColor-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconExcel', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Excel-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconCruzCirculo', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/10-2-TiposdeExcepcion-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconAgregar', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Agregar-1-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconDeshacer', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Deshacer-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconGuardar', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Guardar-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconCruzCuadrado', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/CruzCuadrado-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconCalendarioMas', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/CalendarioMas-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconCalendar', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/outline/outline-calendar.svg"));
        this.matIconRegistry.addSvgIcon('iconCalendarioEditar', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/CalendarioEditar-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconFlechaAbajo', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/FlechaAbajo-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconArchivo', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Archivo-icon.svg"));
    }

    ngOnInit(): void {
        if(this._pantallaServicio.refreshAgenda){
            this._pantallaServicio.refreshAgenda = false;
            window.location.reload();
        }

        this.declararGridReferencia();
        this.funcionPrincipal();
        this.crearModales();
    }

    ngOnDestroy() {
        if (this.interval) {
            clearInterval(this.interval);
        }
    }

    crearModales() {
        if ($('body').find('.nueva-cita').length > 1) {
            $('body').find('.nueva-cita')[1].remove();
        }
        this.modales.modalNuevaCita = new bootstrap.Modal($("#nueva-cita").appendTo("body"), {
            backdrop: "static",
            keyboard: false,
        });

        if ($('body').find('.editar-cita').length > 1) {
            $('body').find('.editar-cita')[1].remove();
        }
        this.modales.modalEditarCita = new bootstrap.Modal($("#editar-cita").appendTo("body"), {
            backdrop: "static",
            keyboard: false,
        });

        if ($('body').find('.modal-referencia-agenda').length > 1) {
            $('body').find('.modal-referencia-agenda')[1].remove();
        }
        this.modales.modalReferenciaAgenda = new bootstrap.Modal($("#modal-referencia-agenda").appendTo("body"), {
            backdrop: "static",
            keyboard: false,
        });

        if ($('body').find('.modal-alert-referencia').length > 1) {
            $('body').find('.modal-alert-referencia')[1].remove();
        }
        this.modales.modalAlertReferencia = new bootstrap.Modal($("#modal-alert-referencia").appendTo("body"), {
            backdrop: "static",
            keyboard: false,
        });

        if ($('body').find('.borrar-referencia').length > 1) {
            $('body').find('.borrar-referencia')[1].remove();
        }
        this.modales.modalBorrarReferencia = new bootstrap.Modal($("#borrar-referencia").appendTo("body"), {
            backdrop: "static",
            keyboard: false,
        });

        if ($('body').find('.modal-corteDia').length > 1) {
            $('body').find('.modal-corteDia')[1].remove();
        }
        this.modales.modalCorteDia = new bootstrap.Modal($("#modal-corteDia").appendTo("body"), {
            backdrop: "static",
            keyboard: false,
        });

        if ($('body').find('.modalCancelarServicio').length > 1) {
            $('body').find('.modalCancelarServicio')[1].remove();
        }
        this.modales.modalCancelarServicio = new bootstrap.Modal($("#modalCancelarServicio").appendTo("body"), {
            backdrop: "static",
            keyboard: false,
        });

        if ($('body').find('.modalCancelarCita').length > 1) {
            $('body').find('.modalCancelarCita')[1].remove();
        }
        this.modales.modalCancelarCita = new bootstrap.Modal($("#modalCancelarCita").appendTo("body"), {
            backdrop: "static",
            keyboard: false,
        });

        if ($('body').find('.modalConfirmarCancelacionRecurrencia').length > 1) {
            $('body').find('.modalConfirmarCancelacionRecurrencia')[1].remove();
        }
        this.modales.modalConfirmarCancelacionRecurrencia = new bootstrap.Modal($("#modalConfirmarCancelacionRecurrencia").appendTo("body"), {
            backdrop: "static",
            keyboard: false,
        });

        if ($('body').find('.notas-cliente').length > 1) {
            $('body').find('.notas-cliente')[1].remove();
        }
        this.modales.modalNotasCliente = new bootstrap.Modal($("#notas-cliente").appendTo("body"), {
            backdrop: "static",
            keyboard: false,
        });

        if ($('body').find('.notas-cliente-borrar-confirm').length > 1) {
            $('body').find('.notas-cliente-borrar-confirm')[1].remove();
        }
        this.modales.modalNotasClienteBorrarConfirm = new bootstrap.Modal($("#notas-cliente-borrar-confirm").appendTo("body"), {
            backdrop: "static",
            keyboard: false,
        });
    }

    // ----------------------------------------------------------- Declaración de variables -----------------------------------------------------------
    displayedColumns: any [] = ['acciones', "nombre"];
    displayedColumns02: any [] = ['acciones', "comentario", "esAlerta", "origen", "nombre"];
    primeraCargaFinalizada: any = false;
    rootScope_cargarCalendario: any;
    rootScope_fromState: any;

    // --------------- Personales ---------------
    dataPersonal: any = [];
    dataPersonalImagenes: any = [];
    idPersonales: any = "";
    cargaImagenesRealizadas: any = false;

    // --------------- Horarios del Personal ---------------
    horarioPersonales: any = [];

    // --------------- Cabinas ---------------
    cabina: any = {
        listadoCabinas: [],
        serviciosBuffer: []
    };

    // --------------- Resources ---------------
    resources: any = [];
    resourceSemana: any = "";

    // --------------- Resources Filtros ---------------
    resourcesFiltros: any = {
        filtros: {
            opciones: [],
            modelo: []
        },
        textos: {
            checkAll: this.agendaTranslate.verTodos,
            uncheckAll: this.agendaTranslate.quitarTodos,
            buttonDefaultText: this.agendaTranslate.personal
        },
        settings: {
            dynamicTitle: false,
            scrollableHeight: '300px',
            scrollable: true
        },
        eventos: {}
    };

    // --------------- Servicios ---------------
    dataServicios: any = [];

    // --------------- Clientes ---------------
    dataClientes: any = [];
    rootScope_dataClientes: any = [];
    dataClienteBuscador: any = [];
    dataClienteBuscadorBuffer: any = [];
    dataClienteBuscadorOriginal: any = [];

    // --------------- Eventos ---------------
    events: any = [];
    citas: any = [];
    excepciones: any = [];
    coloresCitas: any = [];

    // --------------- Navegador móvil ---------------
    navegador: any = {
        // movil = window.mobileAndTabletcheck()
    };

    ultimoFiltro: any = "";

    // --------------- Infinite Scroll ---------------
    infiniteScroll: any = {
        numToAdd: 20
    };

    dataClientesBuffer = [];
    rootScope_dataClientesBuffer = [];

    bufferSize = 40;
    numberOfItemsFromEndBeforeFetchingMore = 10;
    loading = false;

    AgendaBuscadorClientesObs: Observable<any>;
    AgendaNuevaCitaClientesObs: Observable<any>;
    typeaheadSubject = new Subject<string>();

    listaDeBusqueda: any = [];
    contadorKeyPress: any;
    contadorRetroceso: any;

    resetDdl(){
        this.listaDeBusqueda = [];
    }

    buscarEnScroll(id: any, idDDL: any, indexArreglo: any) {
        this.listaDeBusqueda = [];
        if(id != 'AgendaNuevaCitaNuevoCliente'){ // Se valida que no sea el Mat-AutoComplete
            var valor = $("#" + idDDL + " input")[0].value;
        }else if(this.cita.clienteNuevo.nombre != ""){
            for(var i = 0; i < this.dataClienteBuscador.length; i++){
                this.dataClienteBuscador[i].toUpperCase().includes(this.cita.clienteNuevo.nombre.toUpperCase()) ? this.listaDeBusqueda.push(this.dataClienteBuscador[i]) : null;
            }
        }

        if(id == 'AgendaBuscadorClientes' && valor != ""){
            for(var i = 0; i < this.rootScope_dataClientes.length; i++){
                this.rootScope_dataClientes[i].nombreBuscar.toUpperCase().includes(valor.toUpperCase()) ? this.listaDeBusqueda.push(this.rootScope_dataClientes[i]) : null;
            }
        }

        if(id == 'AgendaNuevaCitaClientes' && valor != ""){
            for(var i = 0; i < this.dataClientes.length; i++){
                this.dataClientes[i].nombreBuscar.toUpperCase().includes(valor.toUpperCase()) ? this.listaDeBusqueda.push(this.dataClientes[i]) : null;
            }
        }

        if(id == 'AgendaNuevaCitaServicios' && valor != ""){
            for(var j = 0; j < this.cita.servicios[indexArreglo].listadoServicios.length; j++){
                this.cita.servicios[indexArreglo].listadoServicios[j].nombre.toUpperCase().includes(valor.toUpperCase()) ? this.listaDeBusqueda.push(this.cita.servicios[indexArreglo].listadoServicios[j]) : null;
            }
        }

        if(id == 'AgendaNuevaCitaServiciosCabina' && valor != ""){
            for(var i = 0; i < this.cabina.servicios.length; i++){
                this.cabina.servicios[i].nombre.toUpperCase().includes(valor.toUpperCase()) ? this.listaDeBusqueda.push(this.cabina.servicios[i]) : null;
            }
        }

        if(id == 'AgendaEditarCitaServicios' && valor != ""){
            for(var j = 0; j < this.citaEditar.servicios[indexArreglo].listadoServicios.length; j++){
                this.citaEditar.servicios[indexArreglo].listadoServicios[j].nombre.toUpperCase().includes(valor.toUpperCase()) ? this.listaDeBusqueda.push(this.citaEditar.servicios[indexArreglo].listadoServicios[j]) : null;
            }
        }

        if(id == 'AgendaEditarCitaServiciosCabina' && valor != ""){
            for(var i = 0; i < this.cabina.servicios.length; i++){
                this.cabina.servicios[i].nombre.toUpperCase().includes(valor.toUpperCase()) ? this.listaDeBusqueda.push(this.cabina.servicios[i]) : null;
            }
        }

        this.resetInfScroll(id, indexArreglo);
    }

    resetInfScroll(id: any, indexArreglo: any) {
        if(id == 'AgendaBuscadorClientes'){
            if(this.listaDeBusqueda.length > 0){
                this.rootScope_dataClientesBuffer = this.listaDeBusqueda.slice(0, this.infiniteScroll.numToAdd);
            }
            else{
                this.rootScope_dataClientesBuffer = this.rootScope_dataClientes.slice(0, this.infiniteScroll.numToAdd);
            }
        }

        if(id == 'AgendaNuevaCitaClientes'){
            if(this.listaDeBusqueda.length > 0){
                this.dataClientesBuffer = this.listaDeBusqueda.slice(0, this.infiniteScroll.numToAdd);
            }
            else{
                this.dataClientesBuffer = this.dataClientes.slice(0, this.infiniteScroll.numToAdd);
            }
        }

        if(id == 'AgendaNuevaCitaServicios'){
            if(this.listaDeBusqueda.length > 0){
                this.cita.servicios[indexArreglo].listadoServiciosBuffer = this.listaDeBusqueda.slice(0, this.infiniteScroll.numToAdd);
            }
            else{
                this.cita.servicios[indexArreglo].listadoServiciosBuffer = this.cita.servicios[indexArreglo].listadoServicios.slice(0, this.infiniteScroll.numToAdd);
            }
        }

        if(id == 'AgendaNuevaCitaServiciosCabina'){
            if(this.listaDeBusqueda.length > 0){
               this.cabina.serviciosBuffer = this.listaDeBusqueda.slice(0, this.infiniteScroll.numToAdd);
            }
            else{
                this.cabina.serviciosBuffer = this.cabina.servicios.slice(0, this.infiniteScroll.numToAdd);
            }
        }

        if(id == 'AgendaEditarCitaServicios'){
            if(this.listaDeBusqueda.length > 0){
                this.citaEditar.servicios[indexArreglo].listadoServiciosBuffer = this.listaDeBusqueda.slice(0, this.infiniteScroll.numToAdd);
            }
            else{
                this.citaEditar.servicios[indexArreglo].listadoServiciosBuffer = this.citaEditar.servicios[indexArreglo].listadoServicios.slice(0, this.infiniteScroll.numToAdd);
            }
        }

        if(id == 'AgendaEditarCitaServiciosCabina'){
            if(this.listaDeBusqueda.length > 0){
               this.cabina.serviciosBuffer = this.listaDeBusqueda.slice(0, this.infiniteScroll.numToAdd);
            }
            else{
                this.cabina.serviciosBuffer = this.cabina.servicios.slice(0, this.infiniteScroll.numToAdd);
            }
        }

        if(id == 'AgendaNuevaCitaNuevoCliente'){
            if(this.listaDeBusqueda.length > 0){
                this.dataClienteBuscadorBuffer = this.listaDeBusqueda.slice(0, this.infiniteScroll.numToAdd);
            }
            else{
                this.dataClienteBuscadorBuffer = this.dataClienteBuscador.slice(0, this.infiniteScroll.numToAdd);
            }
        }
    }

    onScroll(id: any, event: any, indexArreglo: any) {
        var dataTotal: any = [];
        var dataBuffer: any = [];
        if(id == 'AgendaBuscadorClientes'){
            if(this.listaDeBusqueda.length > 0){
                dataTotal = this.listaDeBusqueda;
            }
            else{
                dataTotal = this.rootScope_dataClientes;
            }
            dataBuffer = this.rootScope_dataClientesBuffer;
        }

        if(id == 'AgendaNuevaCitaClientes'){
            if(this.listaDeBusqueda.length > 0){
                dataTotal = this.listaDeBusqueda;
            }
            else{
                dataTotal = this.dataClientes;
            }
            dataBuffer = this.dataClientesBuffer;
        }

        if(id == 'AgendaNuevaCitaServicios'){
            if(this.listaDeBusqueda.length > 0){
                dataTotal = this.listaDeBusqueda;
            }
            else{
                dataTotal = this.cita.servicios[indexArreglo].listadoServicios;
            }
            dataBuffer = this.cita.servicios[indexArreglo].listadoServiciosBuffer;
        }

        if(id == 'AgendaNuevaCitaServiciosCabina'){
            if(this.listaDeBusqueda.length > 0){
                dataTotal = this.listaDeBusqueda;
            }
            else{
                dataTotal = this.cabina.servicios;
            }
            dataBuffer = this.cabina.serviciosBuffer;
        }

        if(id == 'AgendaEditarCitaServicios'){
            if(this.listaDeBusqueda.length > 0){
                dataTotal = this.listaDeBusqueda;
            }
            else{
                dataTotal = this.citaEditar.servicios[indexArreglo].listadoServicios;
            }
            dataBuffer = this.citaEditar.servicios[indexArreglo].listadoServiciosBuffer;
        }

        if(id == 'AgendaEditarCitaServiciosCabina'){
            if(this.listaDeBusqueda.length > 0){
                dataTotal = this.listaDeBusqueda;
            }
            else{
                dataTotal = this.cabina.servicios;
            }
            dataBuffer = this.cabina.serviciosBuffer;
        }

        if(id == 'AgendaNuevaCitaNuevoCliente'){
            if(this.listaDeBusqueda.length > 0){
                dataTotal = this.listaDeBusqueda;
            }
            else{
                dataTotal = this.dataClienteBuscador;
            }
            dataBuffer = this.dataClienteBuscadorBuffer;

            if (this.loading || dataTotal.length <= dataBuffer.length) {
                return;
            }

            if (this.virtualScroll.getRenderedRange().end == this.dataClienteBuscadorBuffer.length && this.autocompleteTrigger.panelOpen) {
                const len = this.dataClienteBuscadorBuffer.length;

                let more: any = [];
                if(this.listaDeBusqueda.length > 0){
                    more = this.listaDeBusqueda.slice(len, this.bufferSize + len);
                }
                else{
                    more = this.dataClienteBuscador.slice(len, this.bufferSize + len);
                }

                this.dataClienteBuscadorBuffer = this.dataClienteBuscadorBuffer.concat(more);
            }else{
                return;
            }
        }

        if (this.loading || dataTotal.length <= dataBuffer.length) {
            return;
        }

        if (event.end + this.numberOfItemsFromEndBeforeFetchingMore > dataBuffer.length) {
            if(id == 'AgendaBuscadorClientes'){
                const len = this.rootScope_dataClientesBuffer.length;

                let more: any = [];
                if(this.listaDeBusqueda.length > 0){
                    more = this.listaDeBusqueda.slice(len, this.bufferSize + len);
                }
                else{
                    more = this.rootScope_dataClientes.slice(len, this.bufferSize + len);
                }

                this.rootScope_dataClientesBuffer = this.rootScope_dataClientesBuffer.concat(more);
            }

            if(id == 'AgendaNuevaCitaClientes'){
                const len = this.dataClientesBuffer.length;

                let more: any = [];
                if(this.listaDeBusqueda.length > 0){
                    more = this.listaDeBusqueda.slice(len, this.bufferSize + len);
                }
                else{
                    more = this.dataClientes.slice(len, this.bufferSize + len);
                }

                this.dataClientesBuffer = this.dataClientesBuffer.concat(more);
            }

            if(id == 'AgendaNuevaCitaServicios'){
                let len = 0;
                len = this.cita.servicios[indexArreglo].listadoServiciosBuffer.length;

                let more: any = [];
                if(this.listaDeBusqueda.length > 0){
                    more = this.listaDeBusqueda.slice(len, this.bufferSize + len);
                }
                else{
                    more = this.cita.servicios[indexArreglo].listadoServicios.slice(len, this.bufferSize + len);
                }

                this.cita.servicios[indexArreglo].listadoServiciosBuffer = this.cita.servicios[indexArreglo].listadoServiciosBuffer.concat(more);
            }

            if(id == 'AgendaNuevaCitaServiciosCabina'){
                const len = this.cabina.serviciosBuffer.length;

                let more: any = [];
                if(this.listaDeBusqueda.length > 0){
                    more = this.listaDeBusqueda.slice(len, this.bufferSize + len);
                }
                else{
                    more = this.cabina.servicios.slice(len, this.bufferSize + len);
                }

                this.cabina.serviciosBuffer = this.cabina.serviciosBuffer.concat(more);
            }

            if(id == 'AgendaEditarCitaServicios'){
                let len = 0;
                len = this.citaEditar.servicios[indexArreglo].listadoServiciosBuffer.length;

                let more: any = [];
                if(this.listaDeBusqueda.length > 0){
                    more = this.listaDeBusqueda.slice(len, this.bufferSize + len);
                }
                else{
                    more = this.citaEditar.servicios[indexArreglo].listadoServicios.slice(len, this.bufferSize + len);
                }

                this.citaEditar.servicios[indexArreglo].listadoServiciosBuffer = this.citaEditar.servicios[indexArreglo].listadoServiciosBuffer.concat(more);
            }

            if(id == 'AgendaEditarCitaServiciosCabina'){
                const len = this.cabina.serviciosBuffer.length;

                let more: any = [];
                if(this.listaDeBusqueda.length > 0){
                    more = this.listaDeBusqueda.slice(len, this.bufferSize + len);
                }
                else{
                    more = this.cabina.servicios.slice(len, this.bufferSize + len);
                }

                this.cabina.serviciosBuffer = this.cabina.serviciosBuffer.concat(more);
            }
        }
    }

    // --------------- Calendario ---------------
    calendario: any = {
        fechaActualCalendario: new Date(),

        viewActual: "resourceDay",
        viewAnterior: "",

        titleActual: "",
        titleAnterior: "",

        esCreacionCalendario: true,
        renderSimple: false,
        esCambioView: false,

        mostrarHeaderHorarios: false,

        propiedades: {},
        horarios: {},

        filtro: {
            personales: []
        },

        timeout: {
            timeoutCalendario: "",
            calendarioTitle: ""
        },

        clickedEvent: {
            start: moment(),
            end: moment(),
            idCliente: null,
            cliente: null,
            emailCliente: null,
            telefono: null,
            citasRelacionadas: [],
            realizoAlta: null,
            fechaCreacion: moment(),
            estatus: null,
            esRecurrente: null,
            nota: null
        },
        mostrarEventPopup: false,

        idCitaActualizar: ""
    };

    // --------------- Modales de Cita ---------------
    cita: any = {
        clienteInfo: {
            nombre: ''
        },
        servicios: {
            listadoServiciosBuffer: []
        }
    };
    citaEditar: any = {};

    // --------------- Indicadores ---------------
    indicadores: any = {
        citasDia: 0,
        citasCanceladasDia: 0,
        citasCompletadasDia: 0,
        ingresos: 0,

        ingresosDetalle: {
            total: 0,
            fechaCalendario: "",
            fechaInicio: moment(new Date()).format('DD/MM/YYYY'),
            fechaFin: moment(new Date()).format('DD/MM/YYYY'),
            fechas: {
                startDate: moment(new Date()).startOf('month').format('DD/MM/YYYY'),
                endDate: moment(new Date()).endOf('month').format('DD/MM/YYYY')
            },
            dataMetodosPago: [],
            dataDevoluciones: [],
            dataRetiroEfectivo: [],
        }
    };

    // --------------- Estatus de Citas ---------------
    estatusCitas: any = [];

    // --------------- Exportación ---------------
    exportar: any = {
        data: [],
        dataExportar: [],
        dataPrimerRegistro: {},
        dataColumnas: {},
        dataJSON: "",

        excel: {
            headers: []
        }
    };

    // --------------- Notificaciones ---------------
    notificaciones: any = {
        error: { life: 6000, theme: "ruby", sticky: false },
        success: { life: 6000, theme: "lime", sticky: false }
    };
    paramsNotifi8: any = { life: 6000, theme: "ruby", sticky: false };

    // --------------- Correo ---------------
    correo: any = {};

    // --------------- Ticket ---------------
    ticketPago: any = {
        ticketSelecionado: "",
        dataTickets: []
    };

    // --------------- Nota ---------------
    nota: any = {
        esEditarNota: false
    };

    // --------------- Paquetes ---------------
    paqueteSucursal: any = {
        agendar: {
            primeraCarga: true
        },
        editar: {}
    };

    // --------------- Recurrencias ---------------
    recurrencias: any = {
    };

    // --------------- Traducciones ---------------
    traducion: any = {};

    // --------------- Validaciones ---------------
    validaciones: any = {};

    // --------------- Referencias de clientes ---------------format('YYYY-MM-DD HH:mm:ss')
    referencia: any = {
        id_referencia: ""
    };
    dataReferencia: any = [];
    deshabilitarReferencia: any = false;

    mostrarNuevaReferenciaAgenda: any = false;
    mostrarActualizarReferenciaAgendaReferencia: any = false;
    nombreReferencia: any = "";

    // --------------- Historial de Clientes ---------------
    historialClientes: any = {
        citaSeleccionada: {},
        mostrarEdicion: false,
        mostrarTicket: false
    };

    // --------------- Faltantes ---------------
    fotoPersonal: any = [];
    recurrencia: any = {};
    citaParams: any = {};
    submitted: any = false;
    temp: any = {};

    mostrarActualizarReferenciaAgenda: any;
    referenciaABorrar: any;
    accesosPantallaAgenda: any = {
        indicadores: 0
    };
    rootScope_caja: any = {
        venta: {
            servicios: {
                listaServiciosPorCobrar: ""
            }
        }
    };
    rootScope_dataTicket: any;
    dataReferenciaCliente: any;
    dataCitaTemporal: any;
    promociones: any;
    nSucursal: any;
    toggleIndicadores: any;
    ranges: any;
    locale: any = {
        format: 'DD/MM/YYYY'
    }
    rootScope_isAgenda = true;
    consultaCitasExitosa = false;
    idCliente = null;
    sinHistorialCitas = false;
    dataHistorialCitas: any;
    alturaDivAgendaHistorial: any;
    dataAlgo: any;
    notasClientes: any = {
        funciones: {},
        dataNotas: [],
        vistaPrevia: false,
        grid: {
            enableSorting: true,
            enableColumnMenus: false,
            columnDefs: [
                { name: this.agendaTranslate.acciones, width: '20%', enableSorting: false, headerCellClass: 'alignCenter2', cellTemplate: '<div class="ui-grid-cell-contents" style=" color:#337dc0;"><li style="margin-left:5px; margin-right: 15px; font-size: 1.5em; cursor:pointer;" class="fa fa-search" ng-click="grid.appScope.notasClientes_funciones_cargarVistaPrevia(row.entity)"></li><li ng-hide="row.entity.origen" style="margin-right: 15px; font-size: 1.5em; cursor:pointer;" class="fa fa-pencil" ng-click="grid.appScope.notasClientes_funciones_cargarNota(row.entity)"></li><li ng-hide="row.entity.origen" style=" font-size: 1.5em; cursor:pointer;" class="fa fa-trash-o" ng-click="grid.appScope.notasClientes_funciones_preparacionBorrarNota(row.entity)"></li></div>' },
                { name: this.agendaTranslate.nota, width: '30%', field: 'comentario', headerCellClass: 'alignCenter', cellClass: 'alignCenter' },
                { displayName: this.agendaTranslate.esAlertaGrid, width: '15%', field: 'esAlerta', headerCellClass: 'alignCenter', cellClass: 'alignCenter', cellTemplate: '<div class="ui-grid-cell-contents" ng-show="row.entity.esAlerta" style="text-align:center">Si</div><div class="ui-grid-cell-contents" ng-show="!row.entity.esAlerta" style="text-align:center">No</div>' },
                { displayName: this.agendaTranslate.origen, width: '15%', field: 'origen', headerCellClass: 'alignCenter', cellClass: 'alignCenter', cellTemplate: '<div class="ui-grid-cell-contents" style=" text-align:center;"><li style="margin-right: 10%; font-size: 1.5em; cursor:not-allowed;" class="fa fa-mobile" ng-show="row.entity.origen"></li></div>' },
                { displayName: this.agendaTranslate.realizoUltCambio, field: 'nombre', headerCellClass: 'alignCenter', cellClass: 'alignCenter' }
            ],
            enableHorizontalScrollbar: 0,
            enableVerticalScrollbar: 0,
            data: 'notasClientes.dataNotas'
        },
        vista: 0,
        submittedNotas: false,
        alerta: false,
        comentario: null,
        idNota: ""
    };
    timeoutAux: any;
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
            ivaGeneral: 0.0,
            aplicaIVA: true,
            seFactura: true,
            yaFacturado: false,
            cveUnidad: '',
            dataUnidadMedida: '',
            descripcion: '',
            cantidad: '',
            valorU: '',
            importeMostrar: '',
            ivaImporteMostrar: '',
            totalImporte: ''
        },
        dataSucursales: [],
        dataformasDePago: [],
        datametodosDePago: [],
        dataCFDI: [],
        dataRegimen: [],
        dataSerie: [],
        datosFiscales: [],
        sinSeries: false,
        validarestatusfactura: true,
        seFactura: true,
        yaFacturado: false,
        cveUnidad: '',
        dataUnidadMedida: '',
        descripcion: '',
        cantidad: '',
        valorU: '',
        importeMostrar: '',
        aplicaIVA: '',
        ivaImporteMostrar: '',
        totalImporte: ''
    };
    nueva: any;
    invalidDates: moment.Moment[] = [moment().add(2, 'days'), moment().add(3, 'days'), moment().add(5, 'days')];

    // --------------- Calendario ---------------
    noLaboral: any = [];
    agendaElementoHtml: any;
    agenda: any;
    popoverContenteElement: any;

    // --------------- Referencia ---------------
    gridReferenciaAgenda: any;


    // --------------------------------------------------------------- FUNCIONES DE CARGA ---------------------------------------------------------------
    cargarAgenda(){
        var calendarDate = moment(this.calendario.fechaActualCalendario);
        let fechaI = (calendarDate.startOf('day')).format('YYYY-MM-DD HH:mm:ss');
        let fechaF = (calendarDate.endOf('day')).format('YYYY-MM-DD HH:mm:ss');
        var params = {
            fechaInicio: fechaI,
            fechaFin: fechaF
        }

        this._backService.HttpPost("procesos/agenda/Agenda/cargarAgenda", {}, params).subscribe((response: string) => {

            var dataTemp = eval(response);

            // ------------------ LISTADO DE PERSONALES ------------------
            for (var i = 0; i < dataTemp[0].length; i++) {
                var elem = dataTemp[0][i];

                if (!elem.idUsuarioSucursalPersonal) {
                    this.resources.push({ id: elem.idPersonal, name: elem.nombre, label: elem.nombre, color: elem.color, index: this.resources.length, baja: elem.realizoBaja, esCabina: elem.esCabina });
                    //this.resourcesOriginal.push({ id: elem.idPersonal, name: elem.nombre, color: elem.color, index: i, baja: elem.realizoBaja, esCabina: elem.esCabina });

                    this.resourcesFiltros.filtros.opciones.push({  id: elem.idPersonal, name: elem.nombre, label: elem.nombre, color: elem.color, index: this.resourcesFiltros.filtros.opciones.length, baja: elem.realizoBaja, esCabina: elem.esCabina });
                    this.resourcesFiltros.filtros.modelo.push({  id: elem.idPersonal, name: elem.nombre, label: elem.nombre, color: elem.color, index: this.resourcesFiltros.filtros.modelo.length, baja: elem.realizoBaja, esCabina: elem.esCabina });

                    this.idPersonales += elem.idPersonal + ",";
                }
                if (!elem.realizoBaja) {
                    if (!elem.esCabina) {
                        this.dataPersonal.push(elem);
                    }
                    else {
                        this.cabina.listadoCabinas.push(elem);
                    }
                }
            }

            if(this.resources.length != 0){
                this.resourceSemana = this.resources[0].id;
            }

            // ------------------ LISTADO DE HORARIOS ------------------
            this.horarioPersonales = dataTemp[1];

            // ------------------ LISTADO DE CITAS ------------------
            for (var i = 0; i < dataTemp[2].length; i++) {
                var elem = dataTemp[2][i];

                var citasRelacionadas = [];
                var inicio = elem.horaInicio.split(':');
                var fin = elem.horaFin.split(':');
                if (elem.fechaCita == "2018-10-28T00:00:00") {
                    var start = moment(elem.fechaCita).add(Number(inicio[0] * 60) + Number(inicio[1]) + 60, 'm');
                    var end = moment(elem.fechaCita).add(Number(fin[0] * 60) + Number(fin[1]) + 60, 'm');
                }
                else {
                    if (elem.fechaCita == "2019-04-07T00:00:00") {
                        var start = moment(elem.fechaCita).add(Number(inicio[0] * 60) + Number(inicio[1]) - 60, 'm');
                        var end = moment(elem.fechaCita).add(Number(fin[0] * 60) + Number(fin[1]) - 60, 'm');
                    }
                    else {
                        var start = moment(elem.fechaCita).add(Number(inicio[0] * 60) + Number(inicio[1]), 'm');
                        var end = moment(elem.fechaCita).add(Number(fin[0] * 60) + Number(fin[1]), 'm');
                    }
                }
                if (moment.duration(end.diff(start)).asMinutes() < 10) {
                    end = moment(elem.fechaCita).add(Number(inicio[0] * 60) + Number(inicio[1]), 'm').add(10, 'm');
                }

                var ev: any = {}
                ev.title = elem.nombreCliente + '\n' + elem.nombreServicio + '\n' + (elem.telefonoCliente ? elem.telefonoCliente : '');
                ev.start = start;
                ev.end = end;
                ev.overlap = true;
                ev.eventOverlap = true;
                ev.id = elem.idCitaDetalle;

                // Información extra
                ev.cita = elem.idCita;
                ev.fechaCita = elem.fechaCita;
                ev.horaInicio = elem.horaInicio;
                ev.horaFin = elem.horaFin;
                ev.idServicio = elem.idServicio;
                ev.servicio = elem.nombreServicio;
                ev.idPersonal = elem.idPersonal;
                ev.personal = elem.nombrePersonal;
                ev.idCabina = elem.idCabina;
                ev.nombreCabina = elem.nombreCabina;
                ev.idCliente = elem.idCliente;
                ev.cliente = elem.nombreCliente;
                ev.emailCliente = elem.emailCliente;
                ev.telefonoCliente = elem.telefonoCliente
                ev.estatus = elem.idCitaEstatus;
                //ev.esRecurrente = elem.recurrencias > 0 ? true : false;
                //ev.editable = (elem.idCitaEstatus == 3 || elem.idCitaEstatus == 6) ? false : true;
                ev.startEditable = (elem.idCitaEstatus == 3 || elem.idCitaEstatus == 6) ? false : true;
                ev.resourceEditable = (elem.idCitaEstatus == 3 || elem.idCitaEstatus == 6) ? false : true;

                ev.esCita = true;
                ev.esDescanso = false;
                ev.esFueraDeHorario = false;
                ev.esExcepcionesPersonal = false;
                ev.costoMinimo = elem.costoMinimo;
                ev.costoMaximo = elem.costoMaximo,
                ev.duracion = elem.duracion;
                ev.telefono = elem.telefonoCliente;
                ev.origen = elem.origen;
                ev.color = elem.color;
                ev.confirmada = elem.confirmada;
                ev.nota = elem.nota;
                ev.notasCliente = elem.notasCliente ? 1 : 0;
                ev.paqueteNota = elem.paqueteNota;
                ev.realizoAlta = elem.nombreRealizoAlta;
                ev.fechaCreacion = elem.fechaCitaAlta;
                ev.pagado = elem.pagado;
                ev.paqueteNota = elem.paqueteNota;
                ev.idPagoClienteDetalle = elem.idPagoClienteDetalle;
                ev.montoTotalPagoPaypal = elem.montoTotalPagoPaypal;
                ev.idPaqueteSucursalClienteServicioDetalle = elem.idPaqueteSucursalClienteServicioDetalle;
                ev.idPaqueteSucursalCliente = elem.idPaqueteSucursalCliente;
                ev.idPaqueteSucursalClienteServicio = elem.idPaqueteSucursalClienteServicio;
                ev.citasRelacionadas = [];
                ev.esUnicoServicio = true;
                ev.citaPrepagada = elem.idPagoClienteDetalle ? true : false;

                for(var j = 0; j < dataTemp[2].length; j++){
                    var elem2 = dataTemp[2][j];

                    var hora = elem2.horaInicio.split(':');
                    var nombrePersonal = elem2.nombrePersonal;
                    var estatusCita = elem2.idCitaEstatus;
                    var nombreCabina = elem2.nombreCabina;

                    if(elem.idCita == elem2.idCita && i != j){
                        ev.citasRelacionadas.push({ cita: elem2, horaInicio: hora[0] + ':' + hora[1], personal: nombrePersonal, estatus: estatusCita, nombreCabina: nombreCabina });

                        if(elem2.idPagoClienteDetalle){
                            ev.citaPrepagada = true;
                        }

                        if (estatusCita != 4) {
                            ev.esUnicoServicio = false;
                        }
                    }
                }

                if(elem.idPersonal != null){
                    ev.resourceId = elem.idPersonal;
                    ev.eventoCabina = false;

                    this.citas.push(JSON.parse(JSON.stringify(ev)));
                    this.events.push(JSON.parse(JSON.stringify(ev)));
                }

                if(elem.idCabina != null){
                    ev.resourceId = elem.idCabina;
                    ev.eventoCabina = true;

                    this.citas.push(JSON.parse(JSON.stringify(ev)));
                    this.events.push(JSON.parse(JSON.stringify(ev)));
                }
            }

            // ------------------ LISTADO DE EXCEPCIONES ------------------
            for (var i = 0; i < dataTemp[3].length; i++) {
                var elem = dataTemp[3][i];

                var fechaInicio = moment(elem.fechaInicio).local();
                var fechaFin = moment(elem.fechaFin).local();

                var horaInicio = moment(elem.fechaInicio).local();
                var horaFin = moment(elem.fechaInicio).local();

                if (elem.horaInicio != null) {
                    horaInicio.add(elem.horaInicio.split(":")[0], "hours");
                    horaInicio.add(elem.horaInicio.split(":")[1], "minutes");
                }
                else {
                    horaInicio.add(0, "hours");
                    horaInicio.add(0, "minutes");
                }

                if (elem.horaFin != null) {
                    horaFin.add(elem.horaFin.split(":")[0], "hours");
                    horaFin.add(elem.horaFin.split(":")[1], "minutes");
                }
                else {
                    horaFin.add(23, "hours");
                    horaFin.add(59, "minutes");
                }

                var cont = 0;
                while (fechaInicio <= fechaFin) {

                    var ex = {
                        resourceId: elem.idPersonal,
                        title: elem.descripcion,
                        start: JSON.parse(JSON.stringify(horaInicio)),
                        end: JSON.parse(JSON.stringify(horaFin)),
                        esCita: false,
                        esDescanso: false,
                        esFueraDeHorario: false,
                        esExcepcionesPersonal: true,
                        horaInicio: JSON.parse(JSON.stringify(horaInicio)),
                        horaFin: JSON.parse(JSON.stringify(horaFin)),
                        index: i + "_" + cont,

                        startEditable: false,
                        resourceEditable: false,
                    }

                    this.excepciones.push(ex);
                    this.events.push(ex);

                    fechaInicio.add(1, "days");
                    horaInicio.add(1, "days");
                    horaFin.add(1, "days");
                    cont++;
                }
            }

            // ------------------ LISTADO DE CLIENTES ------------------
            this.dataClientes = dataTemp[4];

            for (var i = 0; i < this.dataClientes.length; i++) {
                if (this.dataClientes[i].telefono !== null && this.dataClientes[i].telefono != "" && this.dataClientes[i].telefono !== undefined) {

                    this.dataClientes[i].nombreBuscar = JSON.parse(JSON.stringify(this.dataClientes[i].nombre)) + " - " + JSON.parse(JSON.stringify(this.dataClientes[i].telefono));
                }
                else {
                    this.dataClientes[i].nombreBuscar = JSON.parse(JSON.stringify(this.dataClientes[i].nombre));
                }
                this.dataClienteBuscador.push(this.dataClientes[i].nombreBuscar);
                this.dataClienteBuscadorBuffer.push(this.dataClientes[i].nombreBuscar);
                this.dataClienteBuscadorOriginal.push(this.dataClientes[i].nombreBuscar);
            }

            this.rootScope_dataClientes = JSON.parse(JSON.stringify(this.dataClientes));

            // ------------------ LISTADO DE SERVICIOS ------------------
            this.dataServicios = dataTemp[5];

            // ------------------ LISTADO DE ESTATUS ------------------
            this.estatusCitas = dataTemp[6];
            this.estatusCitas[0].translate = this.agendaTranslate.pendiente;
            this.estatusCitas[1].translate = this.agendaTranslate.confirmada;
            this.estatusCitas[2].translate = this.agendaTranslate.enProceso;
            this.estatusCitas[3].translate = this.agendaTranslate.terminada;
            this.estatusCitas[4].translate = this.agendaTranslate.cancelada;
            this.estatusCitas[5].translate = "No Asistió";

            // ------------------ LISTADO DE COLORES DE CITAS ------------------
            this.coloresCitas = dataTemp[7];
            for(var i = 0; i < this.coloresCitas.length; i++){
                switch(this.coloresCitas[i].codigo){
                    case 'WSCOLORCITAPEN':
                        this.coloresCitas[i].estatus = 1;
                        break;
                    case 'WSCOLORCITAPROC':
                        this.coloresCitas[i].estatus = 2;
                        break;
                    case 'WSCOLORCITATER':
                        this.coloresCitas[i].estatus = 3;
                        break;
                    case 'WSCOLORCITACAN':
                        this.coloresCitas[i].estatus = 4;
                        break;
                    case 'WSCOLORCITACONF':
                        this.coloresCitas[i].estatus = 5;
                        break;
                    case 'WSCOLORCITANOAS':
                        this.coloresCitas[i].estatus = 6;
                        break;
                }
            }

            // ------------------ HORAS ANTICIPACIÓN CITAS ------------------
            this.correo.hrsAnticipacionCitas = parseInt(dataTemp[8][0].valor);

            // ------------------ ASC OR DESC PERSONAL ORDER ------------------
            var object = this.dataPersonal;

            var array = Object.keys(this.dataPersonal).map(function(key) {
                return { personal: object[key] };
            });
            let perData = array.map( (personal) => personal.personal );
            let filterData = perData.reverse();
            this.dataPersonal = filterData;
            console.log( this.dataPersonal );


            // --------- CREAR CALENDARIO ---------
            if(this.resources.length != 0){
                // Se crea el calendario si hay personales disponibles
                this._pantallaServicio.ocultarSpinner();
                this.calendario_crearCalendario();

                // Está consulta se manda llamar después de la creación y render del calendario
                // (Esta serie de funciones se mandan llamar después de todo porque no importa cuanto se tarden)
                this.rootScope_consultarIndicadores();

                // Creación del interval
                this.crearInterval();
            }
            else {
                this._pantallaServicio.ocultarSpinner();
            }
            this.primeraCargaFinalizada = true;


        }, error => {
            this._router.navigate(['/login']);
        });
    }

    consultarCitas(){
        this._pantallaServicio.mostrarSpinner();
        this.events = [];
        this.citas = [];
        this.excepciones = [];
        this.exportar.data = [];

        if(this.calendario.fechaActualCalendario._f == "YYYY-MM-DD" || this.calendario.fechaActualCalendario._f == "YYYY-MM-DDTHH:mm:ss" || this.calendario.fechaActualCalendario._f == undefined) {
            var calendarDate = moment(this.calendario.fechaActualCalendario);
        } else {
            var calendarDate = moment(this.calendario.fechaActualCalendario.split("/").reverse().join("-"));
        }

        var params: any = {};
        params.fechaInicio = calendarDate.clone();
        params.fechaFin = calendarDate.clone();

        if (this.calendario.viewActual == 'resourceDay') {
            params.fechaInicio.startOf('day');
            params.fechaFin.endOf('day');
        }
        else {
            if (this.calendario.viewActual == 'agendaWeek') {
                params.fechaInicio.startOf('isoWeek');
                params.fechaFin.endOf('isoWeek');
            }
            else {
                if (this.calendario.viewActual == 'month') {
                    params.fechaInicio.startOf("month").add("d", -7);
                    params.fechaFin.startOf("month").add("d", 42);
                }
            }
        }

        if(this.calendario.fechaActualCalendario._f == "YYYY-MM-DD" || this.calendario.fechaActualCalendario._f == "YYYY-MM-DDTHH:mm:ss" || this.calendario.fechaActualCalendario._f == undefined) {
            var calendarDate = moment(this.calendario.fechaActualCalendario);
        } else {
            var calendarDate = moment(this.calendario.fechaActualCalendario.split("/").reverse().join("-"));
        }

        params.fechaInicio = params.fechaInicio.format('YYYY-MM-DD HH:mm:ss');
        params.fechaFin = params.fechaFin.format('YYYY-MM-DD HH:mm:ss');

        this._backService.HttpPost("procesos/agenda/Agenda/cargarCitas", {}, params).subscribe((response: string) => {

            var dataTemp = eval(response);

            // ------------------ LISTADO DE CITAS ------------------
            for (var i = 0; i < dataTemp[0].length; i++) {
                var elem = dataTemp[0][i];

                if(this.calendario.viewActual == "resourceDay" || this.calendario.viewActual == "agendaWeek"){
                    var inicio = elem.horaInicio.split(':');
                    var fin = elem.horaFin.split(':');
                    if (elem.fechaCita == "2018-10-28T00:00:00") {
                        var start = moment(elem.fechaCita).add(Number(inicio[0] * 60) + Number(inicio[1]) + 60, 'm');
                        var end = moment(elem.fechaCita).add(Number(fin[0] * 60) + Number(fin[1]) + 60, 'm');
                    }
                    else {
                        if (elem.fechaCita == "2019-04-07T00:00:00") {
                            var start = moment(elem.fechaCita).add(Number(inicio[0] * 60) + Number(inicio[1]) - 60, 'm');
                            var end = moment(elem.fechaCita).add(Number(fin[0] * 60) + Number(fin[1]) - 60, 'm');
                        }
                        else {
                            var start = moment(elem.fechaCita).add(Number(inicio[0] * 60) + Number(inicio[1]), 'm');
                            var end = moment(elem.fechaCita).add(Number(fin[0] * 60) + Number(fin[1]), 'm');
                        }
                    }
                    if (moment.duration(end.diff(start)).asMinutes() < 10) {
                        end = moment(elem.fechaCita).add(Number(inicio[0] * 60) + Number(inicio[1]), 'm').add(10, 'm');
                    }

                    var ev: any = {}
                    ev.title = elem.nombreCliente + '\n' + elem.nombreServicio + '\n' + (elem.telefonoCliente ? elem.telefonoCliente : '');
                    ev.start = start;
                    ev.end = end;
                    ev.overlap = true;
                    ev.eventOverlap = true
                    ev.id = elem.idCitaDetalle;

                    // Información extra
                    ev.cita = elem.idCita;
                    ev.fechaCita = elem.fechaCita;
                    ev.horaInicio = elem.horaInicio;
                    ev.horaFin = elem.horaFin;
                    ev.idServicio = elem.idServicio;
                    ev.servicio = elem.nombreServicio;
                    ev.idPersonal = elem.idPersonal;
                    ev.personal = elem.nombrePersonal;
                    ev.idCabina = elem.idCabina;
                    ev.nombreCabina = elem.nombreCabina;
                    ev.idCliente = elem.idCliente;
                    ev.cliente = elem.nombreCliente;
                    ev.emailCliente = elem.emailCliente;
                    ev.telefonoCliente = elem.telefonoCliente
                    ev.estatus = elem.idCitaEstatus;
                    //ev.esRecurrente = elem.recurrencias > 0 ? true : false;
                    //ev.editable = (elem.idCitaEstatus == 3 || elem.idCitaEstatus == 6) ? false : true;
                    ev.startEditable = (elem.idCitaEstatus == 3 || elem.idCitaEstatus == 6) ? false : true;
                    ev.resourceEditable = (elem.idCitaEstatus == 3 || elem.idCitaEstatus == 6) ? false : true;
                    ev.esCita = true;
                    ev.esDescanso = false;
                    ev.esFueraDeHorario = false;
                    ev.esExcepcionesPersonal = false;
                    ev.costoMinimo = elem.costoMinimo;
                    ev.costoMaximo = elem.costoMaximo,
                    ev.duracion = elem.duracion;
                    ev.telefono = elem.telefonoCliente;
                    ev.origen = elem.origen;
                    ev.color = elem.color;
                    ev.confirmada = elem.confirmada;
                    ev.nota = elem.nota;
                    ev.notasCliente = elem.notasCliente ? 1 : 0;
                    ev.paqueteNota = elem.paqueteNota;
                    ev.realizoAlta = elem.nombreRealizoAlta;
                    ev.fechaCreacion = elem.fechaCitaAlta;
                    ev.pagado = elem.pagado;
                    ev.paqueteNota = elem.paqueteNota;
                    ev.idPagoClienteDetalle = elem.idPagoClienteDetalle;
                    ev.montoTotalPagoPaypal = elem.montoTotalPagoPaypal;
                    ev.idPaqueteSucursalClienteServicioDetalle = elem.idPaqueteSucursalClienteServicioDetalle;
                    ev.idPaqueteSucursalCliente = elem.idPaqueteSucursalCliente;
                    ev.idPaqueteSucursalClienteServicio = elem.idPaqueteSucursalClienteServicio;
                    ev.citasRelacionadas = [];
                    ev.esUnicoServicio = true;
                    ev.citaPrepagada = elem.idPagoClienteDetalle ? true : false;

                    for(var j = 0; j < dataTemp[0].length; j++){
                        var elem2 = dataTemp[0][j];

                        var hora = elem2.horaInicio.split(':');
                        var nombrePersonal = elem2.nombrePersonal;
                        var estatusCita = elem2.idCitaEstatus;
                        var nombreCabina = elem2.nombreCabina;

                        if(elem.idCita == elem2.idCita && i != j){
                            ev.citasRelacionadas.push({ cita: elem2, horaInicio: hora[0] + ':' + hora[1], personal: nombrePersonal, estatus: estatusCita, nombreCabina: nombreCabina });

                            if(elem2.idPagoClienteDetalle){
                                ev.citaPrepagada = true;
                            }

                            if (estatusCita != 4) {
                                ev.esUnicoServicio = false;
                            }
                        }
                    }

                    if(elem.idPersonal != null){
                        ev.resourceId = elem.idPersonal;
                        ev.eventoCabina = false;

                        if(this.calendario.viewActual == "resourceDay"){
                            this.citas.push(JSON.parse(JSON.stringify(ev)));
                            this.events.push(JSON.parse(JSON.stringify(ev)));
                        }
                        else{
                            if(this.calendario.viewActual == "agendaWeek"){
                                if(ev.resourceId == this.resourceSemana){
                                    this.events.push(JSON.parse(JSON.stringify(ev)));
                                }
                                this.citas.push(JSON.parse(JSON.stringify(ev)));
                            }
                        }
                    }

                    if(elem.idCabina != null){
                        ev.resourceId = elem.idCabina;
                        ev.eventoCabina = true;

                        if(this.calendario.viewActual == "resourceDay"){
                            this.citas.push(JSON.parse(JSON.stringify(ev)));
                            this.events.push(JSON.parse(JSON.stringify(ev)));
                        }
                        else{
                            if(this.calendario.viewActual == "agendaWeek"){
                                if(ev.resourceId == this.resourceSemana){
                                    this.events.push(JSON.parse(JSON.stringify(ev)));
                                }
                                this.citas.push(JSON.parse(JSON.stringify(ev)));
                            }
                        }
                    }
                }
                else{
                    if(this.calendario.viewActual == "month"){
                        var evnt = {
                            title: elem.nombrePersonalCabina + '\n' + ' ' + this.agendaTranslate.citasPuntos + ' ' + elem.citas,
                            start: moment(elem.fechaCita),
                            //end: end,
                            overlap: false,
                            eventOverlap: false,
                            resourceId: elem.idPersonalCabina,
                            id: elem.idPersonalCabina,
                            color: elem.color ? elem.color : '#ddd',
                            // editable: false
                            startEditable: false,
                            resourceEditable: false
                        };
                        this.events.push(JSON.parse(JSON.stringify(evnt)));
                    }
                }
            }

            // ------------------ LISTADO DE EXCEPCIONES ------------------
            for (var i = 0; i < dataTemp[1].length; i++) {
                var elem = dataTemp[1][i];

                var fechaInicio = moment(elem.fechaInicio).local();
                var fechaFin = moment(elem.fechaFin).local();

                var horaInicio = moment(elem.fechaInicio).local();
                var horaFin = moment(elem.fechaInicio).local();

                if (elem.horaInicio != null) {
                    horaInicio.add(elem.horaInicio.split(":")[0], "hours");
                    horaInicio.add(elem.horaInicio.split(":")[1], "minutes");
                }
                else {
                    horaInicio.add(0, "hours");
                    horaInicio.add(0, "minutes");
                }

                if (elem.horaFin != null) {
                    horaFin.add(elem.horaFin.split(":")[0], "hours");
                    horaFin.add(elem.horaFin.split(":")[1], "minutes");
                }
                else {
                    horaFin.add(23, "hours");
                    horaFin.add(59, "minutes");
                }

                var cont = 0;
                while (fechaInicio <= fechaFin) {
                    var ev: any = {};
                    ev.resourceId = elem.idPersonal;
                    ev.title = elem.descripcion;
                    ev.start = JSON.parse(JSON.stringify(horaInicio));
                    ev.end = JSON.parse(JSON.stringify(horaFin));
                    ev.esCita = false;
                    ev.esDescanso = false;
                    ev.esFueraDeHorario = false;
                    ev.esExcepcionesPersonal = true;
                    ev.horaInicio = JSON.parse(JSON.stringify(horaInicio));
                    ev.horaFin = JSON.parse(JSON.stringify(horaFin));
                    ev.index = i + "_" + cont;

                    if(this.calendario.viewActual == "resourceDay"){
                        this.events.push(JSON.parse(JSON.stringify(ev)));
                        this.excepciones.push(JSON.parse(JSON.stringify(ev)));
                    }
                    else{
                        if(this.calendario.viewActual == "agendaWeek"){
                            if(ev.resourceId == this.resourceSemana){
                                this.events.push(JSON.parse(JSON.stringify(ev)));
                            }
                            this.excepciones.push(JSON.parse(JSON.stringify(ev)));
                        }
                    }

                    fechaInicio.add(1, "days");
                    horaInicio.add(1, "days");
                    horaFin.add(1, "days");
                    cont++;
                }
            }

            // Se destruye la agenda y se vuelve a crear con los nuevos eventos y excepciones
            this._pantallaServicio.ocultarSpinner();
            // // $('#calendar').fullCalendar('destroy'); // migración
            this.calendario_crearCalendario();

            //this.rootScope_consultarIndicadores();

        }, error => {
            this._router.navigate(['/login']);
        });
    }

    rootScope_consultarIndicadores(){
        var params: any = {};
        params.fecha = moment().local().format("YYYY-MM-DD");

        this._backService.HttpPost("procesos/agenda/Agenda/selectIndicadoresAgenda", {}, params).subscribe((response: string) => {

            var info: any = eval(response)[0];
            this.indicadores.citasDia = info.citas_dia;
            this.indicadores.citasCanceladasDia = info.bajas_dia;
            this.indicadores.citasCompletadasDia = info.terminadas_dia;
            this.indicadores.ingresos = info.ingresos_mes ? info.ingresos_mes : 0;

            this.consultarImagenesPersonales();

        }, error => {
            this._router.navigate(['/login']);
        });

    }

    consultarImagenesPersonales(){
        var params: any = {};
        params.idPersonales = this.idPersonales;

        this._backService.HttpPost("procesos/agenda/Agenda/imagenesPersonal", {}, params).subscribe((response: string) => {

            this.dataPersonalImagenes = eval(response);
            for (var i = 0; i < this.dataPersonalImagenes.length; i++) {
                for (var j = 0; j < this.resources.length; j++) {
                    if (this.dataPersonalImagenes[i].idPersonal == this.resources[j].id) {
                        this.resources[j].photo = this.dataPersonalImagenes[i].codigo;
                        this.resourcesFiltros.filtros.opciones[j].photo = this.dataPersonalImagenes[i].codigo;
                        this.resourcesFiltros.filtros.modelo[j].photo = this.dataPersonalImagenes[i].codigo;
                        break;
                    }
                }
            }

            this.agenda.render();

        }, error => {

        });
    }

    rootScope_consultarCitaIndividual(){
        if(this.calendario.clickedEvent.cita){
            this.calendario.idCitaActualizar = this.calendario.clickedEvent.cita;
            this.consultarCitaIndividual();
        }
    }

    consultarCitaIndividual(){
        var params: any = {};
        params.idCita = this.calendario.idCitaActualizar;
        this._backService.HttpPost("procesos/agenda/Agenda/consultarCitaIndividual", {}, params).subscribe((response: string) => {

            var dataTemp = eval(response);

            for(var k = 0; k < this.citas.length; k++){
                if(this.citas[k].cita == this.calendario.idCitaActualizar){
                    this.citas.splice(k, 1);
                    k--;
                }
            }

            for (var i = 0; i < dataTemp.length; i++) {
                var elem = dataTemp[i];

                var citasRelacionadas = [];
                var inicio = elem.horaInicio.split(':');
                var fin = elem.horaFin.split(':');
                if (elem.fechaCita == "2018-10-28T00:00:00") {
                    var start = moment(elem.fechaCita).add(Number(inicio[0] * 60) + Number(inicio[1]) + 60, 'm');
                    var end = moment(elem.fechaCita).add(Number(fin[0] * 60) + Number(fin[1]) + 60, 'm');
                }
                else {
                    if (elem.fechaCita == "2019-04-07T00:00:00") {
                        var start = moment(elem.fechaCita).add(Number(inicio[0] * 60) + Number(inicio[1]) - 60, 'm');
                        var end = moment(elem.fechaCita).add(Number(fin[0] * 60) + Number(fin[1]) - 60, 'm');
                    }
                    else {
                        var start = moment(elem.fechaCita).add(Number(inicio[0] * 60) + Number(inicio[1]), 'm');
                        var end = moment(elem.fechaCita).add(Number(fin[0] * 60) + Number(fin[1]), 'm');
                    }
                }
                if (moment.duration(end.diff(start)).asMinutes() < 10) {
                    end = moment(elem.fechaCita).add(Number(inicio[0] * 60) + Number(inicio[1]), 'm').add(10, 'm');
                }

                var ev: any = {}
                ev.title = elem.nombreCliente + '\n' + elem.nombreServicio + '\n' + (elem.telefonoCliente ? elem.telefonoCliente : '');
                ev.start = start;
                ev.end = end;
                ev.overlap = true;
                ev.eventOverlap = true
                ev.id = elem.idCitaDetalle;

                // Información extra
                ev.cita = elem.idCita;
                ev.fechaCita = elem.fechaCita;
                ev.horaInicio = elem.horaInicio;
                ev.horaFin = elem.horaFin;
                ev.idServicio = elem.idServicio;
                ev.servicio = elem.nombreServicio;
                ev.idPersonal = elem.idPersonal;
                ev.personal = elem.nombrePersonal;
                ev.idCabina = elem.idCabina;
                ev.nombreCabina = elem.nombreCabina;
                ev.idCliente = elem.idCliente;
                ev.cliente = elem.nombreCliente;
                ev.emailCliente = elem.emailCliente;
                ev.telefonoCliente = elem.telefonoCliente
                ev.estatus = elem.idCitaEstatus;
                //ev.esRecurrente = elem.recurrencias > 0 ? true : false;
                // ev.editable = (elem.idCitaEstatus == 3 || elem.idCitaEstatus == 6) ? false : true;
                ev.startEditable = (elem.idCitaEstatus == 3 || elem.idCitaEstatus == 6) ? false : true;
                ev.resourceEditable = (elem.idCitaEstatus == 3 || elem.idCitaEstatus == 6) ? false : true;
                ev.esCita = true;
                ev.esDescanso = false;
                ev.esFueraDeHorario = false;
                ev.esExcepcionesPersonal = false;
                ev.costoMinimo = elem.costoMinimo;
                ev.costoMaximo = elem.costoMaximo,
                ev.duracion = elem.duracion;
                ev.telefono = elem.telefonoCliente;
                ev.origen = elem.origen;
                ev.color = elem.color;
                ev.confirmada = elem.confirmada;
                ev.nota = elem.nota;
                ev.notasCliente = elem.notasCliente ? 1 : 0;
                ev.paqueteNota = elem.paqueteNota;
                ev.realizoAlta = elem.nombreRealizoAlta;
                ev.fechaCreacion = elem.fechaCitaAlta;
                ev.pagado = elem.pagado;
                ev.paqueteNota = elem.paqueteNota;
                ev.idPagoClienteDetalle = elem.idPagoClienteDetalle;
                ev.montoTotalPagoPaypal = elem.montoTotalPagoPaypal;
                ev.idPaqueteSucursalClienteServicioDetalle = elem.idPaqueteSucursalClienteServicioDetalle;
                ev.idPaqueteSucursalCliente = elem.idPaqueteSucursalCliente;
                ev.idPaqueteSucursalClienteServicio = elem.idPaqueteSucursalClienteServicio;
                ev.citasRelacionadas = [];
                ev.esUnicoServicio = true;
                ev.citaPrepagada = elem.idPagoClienteDetalle ? true : false;

                for(var j = 0; j < dataTemp.length; j++){
                    var elem2 = dataTemp[j];

                    var hora = elem2.horaInicio.split(':');
                    var nombrePersonal = elem2.nombrePersonal;
                    var estatusCita = elem2.idCitaEstatus;
                    var nombreCabina = elem2.nombreCabina;

                    if(elem.idCita == elem2.idCita && i != j){
                        ev.citasRelacionadas.push({ cita: elem2, horaInicio: hora[0] + ':' + hora[1], personal: nombrePersonal, estatus: estatusCita, nombreCabina: nombreCabina });

                        if(elem2.idPagoClienteDetalle){
                            ev.citaPrepagada = true;
                        }

                        if (estatusCita != 4) {
                            ev.esUnicoServicio = false;
                        }
                    }
                }

                if(elem.idPersonal != null){
                    ev.resourceId = elem.idPersonal;
                    ev.eventoCabina = false;

                    this.citas.push(JSON.parse(JSON.stringify(ev)));
                }

                if(elem.idCabina != null){
                    ev.resourceId = elem.idCabina;
                    ev.eventoCabina = true;

                    this.citas.push(JSON.parse(JSON.stringify(ev)));
                }
            }

            this.events = [];
            for(var i = 0; i < this.citas.length; i++){
                if(this.calendario.viewActual == "resourceDay"){
                    this.events.push(this.citas[i]);
                }
                if(this.calendario.viewActual == "agendaWeek"){
                    if(this.citas[i].resourceId == this.resourceSemana){
                        this.events.push(this.citas[i]);
                    }
                }
            }

            for(var i = 0; i < this.excepciones.length; i++){
                if(this.calendario.viewActual == "resourceDay"){
                    this.events.push(this.excepciones[i]);
                }
                if(this.calendario.viewActual == "agendaWeek"){
                    if(this.excepciones[i].resourceId == this.resourceSemana){
                        this.events.push(this.excepciones[i]);
                    }
                }
            }

            // this.calendario.clickedEvent = {};
            this.calendario.clickedEvent = {
                start: moment(),
                end: moment(),
                idCliente: null,
                cliente: null,
                emailCliente: null,
                telefono: null,
                citasRelacionadas: [],
                realizoAlta: null,
                fechaCreacion: moment(),
                estatus: null,
                esRecurrente: null,
                nota: null
            };
            this.calendario.idCitaActualizar = "";

            this._pantallaServicio.ocultarSpinner();
            // // $('#calendar').fullCalendar('destroy'); // migración

            this.calendario_crearCalendario();

            //this.rootScope_consultarIndicadores();

        }, error => {
            this._router.navigate(['/login']);
        });
    }


    // ------------------------------------------------------- FUNCIONES DE CREACIÓN DE CALENDARIO ------------------------------------------------------
    calendario_crearCalendario(){
        setTimeout(()=>{
            this.popoverContenteElement = this.createPopoverContentElement();

            this.calendario.esCambioView = false;
            this.calendario.esCreacionCalendario = true;

            this.calendario.propiedades = this.calendario_calcularHorariosDisponibles();
            this.calendario_crearEventosDescansosFuerasDeHorario();

            var tamanioVentana = window.innerWidth;

            this.agendaElementoHtml = document.getElementById('calendar');
            this.agenda = new Calendar(this.agendaElementoHtml, {
                plugins: [ interactionPlugin, scrollGridPlugin, dayGridPlugin ],
                height: "auto",
                contentHeight: "auto",
                headerToolbar: {
                    left: tamanioVentana < 900 ? "title,prev,next,today" : "prev,next,today",
                    center: tamanioVentana < 900 ? "" : "title",
                    right: "month,agendaWeek,resourceDay"
                },
                views: {
                    month: {
                        type: 'dayGridMonth',
                        buttonText: this.agendaTranslate.mes,
                        dayHeaderContent: (ev: any) => {
                            if(ev.date.getDay() == 6){
                                return this.agendaTranslate.diasSemana[0];
                            }
                            else{
                                return this.agendaTranslate.diasSemana[ev.date.getDay() + 1];
                            }
                        },
                        dayHeaderDidMount: (ev: any) => {
                            ev.el.children[0].children[0].style.color = 'black';
                            ev.el.children[0].children[0].style.textDecoration = 'none';
                        }
                    },
                    agendaWeek: {
                        type: 'timeGridWeek',
                        buttonText: this.agendaTranslate.semana,
                        dayHeaderContent: (ev: any) => {
                            var dia = ev.date.getDate();
                            var mes = ev.date.getMonth() + 1;
                            var anio = ev.date.getFullYear();
                            return this.agendaTranslate.diasSemana[ev.date.getDay()] + " - " + (dia < 10 ? "0" + dia : dia) + "/" + (mes < 10 ? "0" + mes : mes) + "/" + anio;
                        },
                        dayHeaderDidMount: (ev: any) => {
                            ev.el.children[0].children[0].style.color = 'black';
                            ev.el.children[0].children[0].style.textDecoration = 'none';
                        }
                    },
                    resourceDay: {
                        type: 'resourceTimeGridDay',
                        buttonText: this.agendaTranslate.dia,
                    }
                },
                buttonText:{
                    today: this.agendaTranslate.hoy
                },
                locales: allLocales,
                locale: this.langsTranslate.using,
                titleFormat: "dddd DD MMMM YYYY",
                slotLabelFormat: {
                    hour: "2-digit",
                    minute: "2-digit",
                    meridiem: "lowercase",
                    hourCycle: 'h12',
                },
                eventTimeFormat: {
                    hour: "2-digit",
                    minute: "2-digit",
                    meridiem: "lowercase",
                    hourCycle: 'h12',
                },

                datesAboveResources: (this.calendario.viewActual != 'month'),
                // displayEventTime: (this.calendario.viewActual != 'month'),
                displayEventTime: false,
                allDaySlot: false,
                slotDuration: "00:15:00",

                editable: false,
                eventStartEditable: true,
                eventResourceEditable: true,
                eventOverlap: false,

                selectable: true,
                selectLongPressDelay: 500,

                initialView: this.calendario.viewActual,
                initialDate: this.calendario.fechaActualCalendario,
                slotMinTime: this.calendario.propiedades.horaInicio,
                slotMaxTime: this.calendario.propiedades.horaFin,
                firstDay: 1,

                resourceOrder: 'index',
                resources: this.resources,
                dayMinWidth: (this.calendario.viewActual == 'resourceDay' ?  125: 125),
                events: this.events,

                datesSet: (ev: any) => {
                    this.calendario.mostrarEventPopup = false;
                    $('.popover').remove();

                    if (this.calendario.esCreacionCalendario) {
                        // Se entra en este apartado cuando se está creando el calendario
                        this.calendario.esCreacionCalendario = false;

                        this.calendario_marcarDiasNoLaborales();
                        this.calendario_historialClientesAccion();
                    }
                    else {
                        // Se entra en este apartado si se está cambiando de día/semana/mes
                        clearTimeout(this.calendario.timeout.timeoutCalendario);

                        // Se cancelan las consultas de los días/semanas/meses pasados que fueron necesarios para llegar al nuevo día/semana/mes seleccionado,
                        // pues solo es necesario hacer la consulta del ultimo cambio
                        this.events = [];
                        this.calendario.esCambioView = true;

                        // Se crea un timeout para verificar que el calendario cumpla 1.2 seg en el mismo día/semana/mes
                        this.calendario.timeout.timeoutCalendario = setTimeout(() => {
                            // Después de pasados 1.2 segundos el mismo día/semana/mes se procede a consultar las citas de la nueva fecha/s seleccionada/s
                            this.calendario.viewActual = ev.view.type;

                            if(ev.view.type == "resourceDay"){
                                this.calendario.fechaActualCalendario = ev.start;
                            }

                            if(ev.view.type == "agendaWeek" || ev.view.type == "month"){
                                var fci = moment(ev.start);
                                var fcf = moment(ev.end);

                                var diasEntreFechas = fcf.diff(fci, 'days');
                                var diaDeEnMedio = Math.trunc(diasEntreFechas/2);
                                var fechaCalendario = fci.clone().add("d", diaDeEnMedio);

                                if(ev.view.type == "agendaWeek"){
                                    this.calendario.fechaActualCalendario = fechaCalendario.startOf('isoWeek').toDate();
                                }

                                if(ev.view.type == "month"){
                                    this.calendario.fechaActualCalendario = fechaCalendario.startOf('month').toDate();
                                }
                            }

                            this.consultarCitas();

                        }, 1200);
                    }
                },
                resourceLabelContent: (ev: any) => {
                    var objectSelect = ev.resource.extendedProps;
                    var idx = objectSelect.index;
                    // var index = ev.resource.extendedProps.index;
                    // console.log(objectSelect);
                    var arrayObject = Array();
                    arrayObject.push(objectSelect);
                    console.log(arrayObject);



                    var src: any = "";
                    var backgroundColor: any = "";
                    if(this.resources[idx].photo){
                        src = this.resources[idx].photo;
                    }
                    else {
                        src = "assets/images/system/iconoPersonaBN.png";
                    }

                    // ------------------ ASC OR DESC PERSONAL ORDER ------------------
                    /*
                    var objectSelect = ev.resource.extendedProps;
                    */
                    var arraySelect = Object.keys(objectSelect);
                    console.log(arraySelect);

                    var arrayFilter = Object.values(objectSelect);
                    console.log(arrayFilter);

                    var arrayEntries = Object.entries(objectSelect);
                    console.log(arrayEntries);

                    let perData = arraySelect.map( ( personal ) => {
                        console.log(`personal: ${personal}`);

                    } );
                    /*
                    let filterData = perData.reverse();
                    ev.resource.extendedProps = filterData;
                    console.log( this.dataPersonal );
                    */

                    if(objectSelect.color){
                        backgroundColor = objectSelect.color;
                    }
                    else {
                        backgroundColor = "#ddd";
                    }

                    var html = "" +
                    "<div class='row mx-auto' style='min-height: 50px;'> " +
                        " <div class='col-lg-12' style='display: flex;'> " +
                            " <img class='img-thumbnail' " +
                                " src='" + src + "' " +
                                " style='cursor:pointer; border-radius: 300px !important; width: 50px; margin: auto auto; background-color: " + backgroundColor + ";'/> " +
                        " </div> " +
                        " <div class='col-lg-12' style='display: flex;'> " +
                            " <label style='margin: auto auto;'> " + objectSelect.name + " </label> " +
                        " </div> " +
                    " </div>"

                    return { html: html }
                },
                resourceLabelDidMount: (ev: any) => {
                    var index = ev.resource.extendedProps.index;

                    ev.el.addEventListener("click", () => {
                        this.calendario_cargarCatalogoPersonal(this.resources[index].id, this.resources[index].baja);
                    });
                },
                eventDidMount: (ev: any) =>  {
                    var event: any = {};
                    var keys = Object.keys(ev.event.extendedProps);
                    keys.forEach(k => {
                        event[k] = ev.event.extendedProps[k];
                    });
                    event.id = ev.event.id;
                    var elem = ev.el;
                    var view = ev.view;

                    // -- Notas/Iconos de un Evento --
                    if (event.esCita) {
                        // Si el evento es una cita
                        var cssConfirmada = "";
                        var tamanio = "15px";

                        elem.setAttribute('id', "c" + event.id);

                        // Se coloca la nota, se cambia el tamaño de la letra y se crea un icono para determinar el origen de la cita
                        if (event.nota) {
                            if(!event.eventoCabina){
                                $(elem).find('.fc-event-main-frame').prepend('<label id="label-nota-' + event.id + '" class="fc-nota-label puntosSuspensivosNota" style="float: right; margin-top: 1px; margin-right: 3px;text-align:right; font-size: 11px;">' + (event.paqueteNota ? event.paqueteNota : "")  + (event.nota ? event.nota.replace("<", "[").replace(">", "]") : '') + '</label>');
                            }
                            else{
                                $(elem).find('.fc-event-main-frame').prepend('<label id="label-nota-cabina-' + event.id + '" class="fc-nota-label puntosSuspensivosNota" style="float: right; margin-top: 1px; margin-right: 3px;text-align:right; font-size: 11px;">' + (event.paqueteNota ? event.paqueteNota : "")  + (event.nota ? event.nota.replace("<", "[").replace(">", "]") : '') + '</label>');
                            }
                        }
                        else {
                            if (event.paqueteNota) {
                                if(!event.eventoCabina){
                                    $(elem).find('.fc-event-main-frame').prepend('<label id="label-nota-' + event.id + '" class="fc-nota-label puntosSuspensivosNota" style="float: right; margin-top: 1px; margin-right: 3px;text-align:right; font-size: 11px;">' + event.paqueteNota.replace("-", "") + '</label>');
                                }
                                else{
                                    $(elem).find('.fc-event-main-frame').prepend('<label id="label-nota-cabina-' + event.id + '" class="fc-nota-label puntosSuspensivosNota" style="float: right; margin-top: 1px; margin-right: 3px;text-align:right; font-size: 11px;">' + event.paqueteNota.replace("-", "") + '</label>');
                                }
                            }
                            else{
                                $(elem).find('.fc-event-main-frame').prepend('<label id="label-nota-' + event.id + '" class="fc-nota-label puntosSuspensivosNota" style="float: right; margin-top: 1px; margin-right: 3px;text-align:right; font-size:11px;"></label>');
                            }
                        }

                        // Se pone la opción de ver las notas del cliente si tiene una nota con alerta
                        if (event.notasCliente) {
                            $(elem).find('.fc-event-main-frame').prepend('<i id="notaCliente-' + event.id + '" class="fa-solid fa-triangle-exclamation" style="float: right;font-size: ' + tamanio + '; margin-right: 5px;' + cssConfirmada + '"></i>');
                            $("#notaCliente-" + event.id).on( "click", () => {
                                this.notasClientes_funciones_prepararNotasCliente();
                            });
                        }

                        if (event.duracion < 15) {
                            $(elem).find('.fc-event-title').css("font-size", "8px");
                            tamanio = "10px";
                        }

                        if (event.confirmada) {
                            cssConfirmada = "color: white;"
                        }

                        switch (event.origen) {
                            case 'movil':
                                $(elem).find('.fc-event-main-frame').prepend('<i class="fa-solid fa-mobile" style="float: right;font-size: ' + tamanio + '; margin-right: 5px;' + cssConfirmada + '"></i>');
                                break;
                            case 'facebook':
                                $(elem).find('.fc-event-main-frame').prepend('<i class="fa-brands fa-facebook" style="float: right;font-size: ' + tamanio + '; margin-right: 5px;' + cssConfirmada + '"></i>');
                                break;
                            case 'movilNegocio':
                                $(elem).find('.fc-event-main-frame').prepend('<i class="fa-solid fa-circle-check" style="float: right;font-size: ' + tamanio + '; margin-right: 5px;' + cssConfirmada + '"></i>');
                                break;
                            case 'webc':
                                $(elem).find('.fc-event-main-frame').prepend('<i class="fa-solid fa-globe" style="float: right;font-size: ' + tamanio + '; margin-right: 5px;' + cssConfirmada + '"></i>');
                                break;
                            case 'faceb':
                                $(elem).find('.fc-event-main-frame').prepend('<i class="fa-brands fa-facebook" style="float: right;font-size: ' + tamanio + '; margin-right: 5px;' + cssConfirmada + '"></i>');
                                break;
                            default:
                                break;
                        }

                        // Se pone la letra p si el detalle (servicio) fue pagado con paypal
                        if(event.montoTotalPagoPaypal != 0){
                            $(elem).find('.fc-event-main-frame').prepend('<i class="fa-brands fa-paypal" style="float: right;font-size: ' + tamanio + '; margin-right: 5px;' + cssConfirmada + '"></i>');
                        }
                    }
                    else {
                        elem.setAttribute('id', "dfh" + event.id);
                    }

                    // -- Popover --
                    if (event.esCita) {

                        // $('#' + elem.id).attr('#target-c' + event.id, 'test');

                        // let popoverContenidoCloneEliminar: any = document.getElementById("popoverContenidoClone");
                        // if(popoverContenidoCloneEliminar){
                        //     popoverContenidoCloneEliminar.remove();
                        // }

                        // let popoverContenido: any = document.querySelector('#popoverContenido');
                        // let popoverContenidoClone: any = popoverContenido.cloneNode(true);
                        // popoverContenidoClone.id = 'popoverContenidoClone';
                        // popoverContenido.after(popoverContenidoClone)

                        new bootstrap.Popover(elem, {
                            container: '#agendaMatCard',
                            trigger: 'click',
                            title: "Cita",
                            // content: $("#popoverContenido"),
                            content: () => this.popoverContenteElement,

                            html: true,
                            //sanitize: false
                        });

                        // this._NgbPopover.
                    }
                },
                select: (ev: any) => {
                    var jsEvent: any = ev.jsEvent;
                    var date: any = ev.start;
                    var dateStr: any = ev.startStr;
                    var dateMoment = moment(date);
                    var view: any = ev.view;
                    var resource: any = ev.resource;

                    this._pantallaServicio.mostrarSpinner();
                    this.calendario.mostrarEventPopup = false;
                    $(".fc-timegrid-event").popover('hide');

                    if(this.calendario.viewActual == "resourceDay" || this.calendario.viewActual == "agendaWeek"){
                        var dia: any = dateMoment.isoWeekday();
                        var idPersonal: any = null;
                        var idCabina: any = null;
                        var laboral: any = null;

                        if(this.accesosPantallaAgenda.agendar){

                            if(this.calendario.viewActual == "resourceDay"){
                                if (!resource.extendedProps.esCabina) {
                                    idPersonal = resource.extendedProps.baja ? null : resource.id;
                                    idCabina = null;
                                }
                                else {
                                    idPersonal = null;
                                    idCabina = resource.extendedProps.baja ? null : resource.id;
                                }

                                laboral = true;
                                for(var i = 0; i < this.noLaboral.length; i++){
                                    if(this.noLaboral[i].dia == dia && this.noLaboral[i].idPersonal == resource.id){
                                        laboral = false;
                                        break;
                                    }
                                }
                            }
                            if(this.calendario.viewActual == "agendaWeek"){
                                for (var i = 0; i < this.resources.length; i++) {
                                    if (this.resources[i].id == this.resourceSemana) {
                                        if (this.resources[i].esCabina) {
                                            idPersonal = null;
                                            idCabina = this.resourceSemana;
                                        }
                                        else {
                                            idPersonal = this.resourceSemana;
                                            idCabina = null;
                                        }
                                    }
                                }

                                laboral = true;
                                for(var i = 0; i < this.noLaboral.length; i++){
                                    if(this.noLaboral[i].dia == dia && this.noLaboral[i].idPersonal == this.resourceSemana){
                                        laboral = false;
                                        break;
                                    }
                                }
                            }

                            if (laboral) {
                                this.cita = {};
                                this.cita.clienteInfo = {
                                    nombre: "",
                                    email: "",
                                    telefono: "",
                                    cumpleanios: ""
                                };
                                this.cita.fecha = dateMoment.format("YYYY-MM-DDTHH:mm:ssZ").substring(0, 10);
                                this.cita.hora = dateMoment.format("YYYY-MM-DDTHH:mm:ssZ").substring(11, 16);

                                if(idCabina){
                                    var params: any = {
                                        idCabina: idCabina
                                    }
                                    this._backService.HttpPost("procesos/agenda/Agenda/consultarServiciosPersonalCabina", {}, {}).subscribe((response: string) => {
                                        var dataTemp = eval(response);

                                        this.cabina.servicios = dataTemp[0];
                                        this.cabina.serviciosBuffer = JSON.parse(JSON.stringify(this.cabina.servicios));
                                        this.cabina.personales = dataTemp[1];

                                        if(this.cabina.servicios.length == 0){
                                            this.cabina.servicios = this.dataServicios;
                                            this.cabina.serviciosBuffer = JSON.parse(JSON.stringify(this.cabina.servicios));
                                        }

                                        if(this.cabina.personales.length == 0){
                                            this.cabina.personales = this.dataPersonal;
                                        }

                                        this.crearNuevaCita(idPersonal, idCabina);
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
                                    });
                                }
                                else{
                                    this.crearNuevaCita(idPersonal, idCabina);
                                    this._pantallaServicio.ocultarSpinner();
                                }
                            }
                            else {
                                this._pantallaServicio.ocultarSpinner();
                                this._toaster.error(this.agendaTranslate.personalNoDisponible);
                            }
                        }
                        else{
                            this._pantallaServicio.ocultarSpinner();
                        }
                    }
                    else{
                        if(this.calendario.viewActual == "month"){
                            this.calendario.viewActual = "resourceDay";
                            this.calendario.fechaActualCalendario = date;

                            this.consultarCitas();
                        }
                    }
                },
                eventClick: (ev: any) => {
                    var event: any = {};
                    var keys = Object.keys(ev.event.extendedProps);
                    keys.forEach(k => {
                        event[k] = ev.event.extendedProps[k];
                    });
                    event.id = Number(ev.event.id);
                    event.title = ev.event.title;
                    event.start = ev.event.start;
                    event.end = ev.event.end;
                    event.overlap = ev.event.overlap;
                    event.color = ev.event.textColor;
                    event.editable = ev.event.startEditable;

                    var elem = ev.el;
                    var view = ev.view;
                    var jsEvent = ev.jsEvent;

                    if (event.esCita) {
                        if($("#" + $('#' + elem.id)[0].getAttribute("aria-describedby")).length == 0){
                            this.calendario.mostrarEventPopup = false;
                            $(".fc-timegrid-event").popover('hide');

                            if(this.calendario.viewActual == "resourceDay" || this.calendario.viewActual == "agendaWeek"){
                                this.calendario.clickedEvent = {
                                    title: JSON.parse(JSON.stringify(event.title)),
                                    start: moment(JSON.parse(JSON.stringify(event.start))),
                                    end: moment(JSON.parse(JSON.stringify(event.end))),
                                    overlap: JSON.parse(JSON.stringify(event.overlap)),
                                    id: JSON.parse(JSON.stringify(event.id)),
                                    cita: JSON.parse(JSON.stringify(event.cita)),
                                    fechaCita: JSON.parse(JSON.stringify(event.fechaCita)),
                                    horaInicio: JSON.parse(JSON.stringify(event.horaInicio)),
                                    horaFin: JSON.parse(JSON.stringify(event.horaFin)),
                                    idServicio: JSON.parse(JSON.stringify(event.idServicio)),
                                    servicio: JSON.parse(JSON.stringify(event.servicio)),
                                    idPersonal: JSON.parse(JSON.stringify(event.idPersonal)),
                                    personal: JSON.parse(JSON.stringify(event.personal)),
                                    idCabina: JSON.parse(JSON.stringify(event.idCabina)),
                                    nombreCabina: JSON.parse(JSON.stringify(event.nombreCabina)),
                                    idCliente: JSON.parse(JSON.stringify(event.idCliente)),
                                    cliente: JSON.parse(JSON.stringify(event.cliente)),
                                    emailCliente: JSON.parse(JSON.stringify(event.emailCliente)),
                                    telefonoCliente: JSON.parse(JSON.stringify(event.telefonoCliente)),
                                    estatus: JSON.parse(JSON.stringify(event.estatus)),
                                    editable: event.editable ? JSON.parse(JSON.stringify(event.editable)) : undefined,
                                    esCita: JSON.parse(JSON.stringify(event.esCita)),
                                    esDescanso: JSON.parse(JSON.stringify(event.esDescanso)),
                                    esFueraDeHorario: JSON.parse(JSON.stringify(event.esFueraDeHorario)),
                                    esExcepcionesPersonal: JSON.parse(JSON.stringify(event.esExcepcionesPersonal)),
                                    costoMinimo: JSON.parse(JSON.stringify(event.costoMinimo)),
                                    costoMaximo: JSON.parse(JSON.stringify(event.costoMaximo)),
                                    duracion: JSON.parse(JSON.stringify(event.duracion)),
                                    telefono: JSON.parse(JSON.stringify(event.telefono)),
                                    origen: JSON.parse(JSON.stringify(event.origen)),
                                    color: event.color ? JSON.parse(JSON.stringify(event.color)) : undefined,
                                    confirmada: JSON.parse(JSON.stringify(event.confirmada)),
                                    nota: JSON.parse(JSON.stringify(event.nota)),
                                    notasCliente: JSON.parse(JSON.stringify(event.notasCliente)),
                                    paqueteNota: JSON.parse(JSON.stringify(event.paqueteNota)),
                                    realizoAlta: JSON.parse(JSON.stringify(event.realizoAlta)),
                                    fechaCreacion: JSON.parse(JSON.stringify(event.fechaCreacion)),
                                    pagado: event.pagado ? JSON.parse(JSON.stringify(event.pagado)) : undefined,
                                    idPagoClienteDetalle: JSON.parse(JSON.stringify(event.idPagoClienteDetalle)),
                                    montoTotalPagoPaypal: JSON.parse(JSON.stringify(event.montoTotalPagoPaypal)),
                                    idPaqueteSucursalClienteServicioDetalle: JSON.parse(JSON.stringify(event.idPaqueteSucursalClienteServicioDetalle)),
                                    idPaqueteSucursalCliente: JSON.parse(JSON.stringify(event.idPaqueteSucursalCliente)),
                                    idPaqueteSucursalClienteServicio: JSON.parse(JSON.stringify(event.idPaqueteSucursalClienteServicio)),
                                    citasRelacionadas: JSON.parse(JSON.stringify(event.citasRelacionadas)),
                                    esUnicoServicio: JSON.parse(JSON.stringify(event.esUnicoServicio)),
                                    citaPrepagada: JSON.parse(JSON.stringify(event.citaPrepagada))
                                }

                                this.calendario.clickedEvent.fechaCreacion = moment(this.calendario.clickedEvent.fechaCreacion);
                                this.calendario.clickedEvent.estatusOriginal = JSON.parse(JSON.stringify(this.calendario.clickedEvent.estatus));
                                this.calendario.clickedEvent.notaOriginal = JSON.parse(JSON.stringify(this.calendario.clickedEvent.nota));
                                this.calendario.mostrarEventPopup = true;

                                var params: any = {};
                                params.idCita = this.calendario.clickedEvent.cita;
                                this._backService.HttpPost("procesos/agenda/Agenda/verificarRecurrencia", {}, params, "text").subscribe((response: string) => {

                                    var numeroRecurrencias = response;

                                    if(Number(numeroRecurrencias) > 0){
                                        this.calendario.clickedEvent.esRecurrente = true;
                                    }
                                    else{
                                        this.calendario.clickedEvent.esRecurrente = false;
                                    }

                                    //$('#' + elem.id).popover('show');

                                }, error => {
                                    this._router.navigate(['/login']);
                                });
                            }
                            else{
                                if(this.calendario.viewActual == "month"){
                                    this.calendario.viewActual = "resourceDay";
                                    this.calendario.fechaActualCalendario = ev.event.start;

                                    this.consultarCitas();
                                }
                            }
                        }
                        else{
                            this.calendario.mostrarEventPopup = false;
                            $('#' + elem.id).popover('hide');
                        }
                    }
                },
                eventDragStart: (ev: any) => {
                    this.calendario.mostrarEventPopup = false;
                    $(".fc-timegrid-event").popover('hide');
                },
                eventDrop: (ev: any) => {
                    this._pantallaServicio.mostrarSpinner();
                    var event: any = {};
                    var keys = Object.keys(ev.event.extendedProps);
                    keys.forEach(k => {
                        event[k] = ev.event.extendedProps[k];
                    });
                    event.id = Number(ev.event.id);
                    event.title = ev.event.title;
                    event.start = ev.event.start;
                    event.end = ev.event.end;
                    event.overlap = ev.event.overlap;
                    event.color = ev.event.textColor;
                    event.editable = false;

                    if(ev.newResource){
                        event.resource =  Number(ev.newResource.id);
                    }
                    else{
                        if (!event.eventoCabina) {
                            event.resource = event.idPersonal;
                        }
                        else{
                            event.resource = event.idCabina;
                        }
                    }

                    // Detecta si la cita se está moviendo de un personal
                    var startEnPersonal = true;
                    if (event.eventoCabina) {
                        startEnPersonal = false;
                    }

                    // Detecta si el resource donde se va a mover la cita es una cabina
                    var dropEnPersonal = true;
                    for (var i = 0; i < this.resources.length; i++) {
                        if (this.resources[i].id == event.resource) {
                            if (this.resources[i].esCabina) {
                                dropEnPersonal = false;
                            }
                        }
                    }

                    if (startEnPersonal) {
                        if (dropEnPersonal) {

                            // Se cambia de un personal a otro
                            var params: any = {};
                            params.idCita = event.cita;
                            params.idCitaDetalle = event.id;
                            params.horaInicio = moment(event.start).format('HH:mm:ss');
                            params.horaFin = moment(event.end).format('HH:mm:ss');
                            params.fechaCita = moment(event.start).format('YYYY/MM/DD');
                            params.idPersonal = event.resource;
                            params.idPromocionSucursal = null;
                            params.valorPromocion = null;
                            params.tipoPromocion = null;
                            params.origen = "web";
                            params.idServicio = event.idServicio;
                            params.idCabina = event.idCabina;

                            this._backService.HttpPost("procesos/agenda/Agenda/actualizarCitaDetalle2", {}, params, "text").subscribe((response: string) => {
                                switch (Number(response)) {
                                    //Estos son los diferentes resultados que te puede regresar la función de actualizar el detalle de la cita
                                    case -1:
                                        event.editable = true;
                                        this._toaster.error(this.agendaTranslate.personalNoLabora);
                                        ev.revert();
                                        this._pantallaServicio.ocultarSpinner();
                                        break;
                                    case -2:
                                        event.editable = true;
                                        this._toaster.error(this.agendaTranslate.personalTieneDescanso);
                                        ev.revert();
                                        this._pantallaServicio.ocultarSpinner();
                                        break;
                                    case -3:
                                        event.editable = true;
                                        this._toaster.error(this.agendaTranslate.horaFueraHorario);
                                        ev.revert();
                                        this._pantallaServicio.ocultarSpinner();
                                        break;
                                    case -4:
                                        event.editable = true;
                                        this._toaster.error(this.agendaTranslate.horaNoDisponible);
                                        ev.revert();
                                        this._pantallaServicio.ocultarSpinner();
                                        break;
                                    case -5:
                                        event.editable = true;
                                        this._toaster.error(this.agendaTranslate.equipoNoDisponible);
                                        ev.revert();
                                        this._pantallaServicio.ocultarSpinner();
                                        break;
                                    case -6:
                                        event.editable = true;
                                        this._toaster.error("El personal al que se quiere cambiar, no se encuentra asignado a la Cabina de la cita");
                                        ev.revert();
                                        this._pantallaServicio.ocultarSpinner();
                                        break;
                                    default:
                                        event.editable = true;
                                        event.idCabina = event.resource;

                                        var fechaInicioAnteriorHM = event.horaInicio.split(":");
                                        var fechaFinAnteriorHM = event.horaFin.split(":");

                                        let minutosTemp = Math.floor(ev.delta.milliseconds / 60000);
                                        let horasTemp = Math.floor(minutosTemp / 60);
                                        minutosTemp = minutosTemp % 60;

                                        var horasAgregadas = horasTemp;
                                        var minutosAgregados = minutosTemp;

                                        // -------------
                                        var horasInicio: any = Number(fechaInicioAnteriorHM[0]) + horasAgregadas;
                                        var minutosInicio: any = Number(fechaInicioAnteriorHM[1]) + minutosAgregados
                                        if(minutosInicio >= 60){
                                            horasInicio = horasInicio + 1;
                                            minutosInicio = minutosInicio - 60;
                                        }
                                        if(minutosInicio < 0){
                                            horasInicio = horasInicio - 1;
                                            minutosInicio = minutosInicio + 60;
                                        }
                                        horasInicio = horasInicio.toString();
                                        minutosInicio = minutosInicio.toString();

                                        // -------------
                                        var horasFin: any = Number(fechaFinAnteriorHM[0]) + horasAgregadas;
                                        var minutosFin: any = Number(fechaFinAnteriorHM[1]) + minutosAgregados;
                                        if(minutosFin >= 60){
                                            horasFin = horasFin + 1;
                                            minutosFin = minutosFin - 60;
                                        }
                                        if(minutosFin < 0){
                                            horasFin = horasFin - 1;
                                            minutosFin = minutosFin + 60;
                                        }
                                        horasFin = horasFin.toString();
                                        minutosFin = minutosFin.toString();

                                        // -------------
                                        var fechaInicioNuevaHM = (horasInicio.length > 1 ? horasInicio : "0" + horasInicio)  + ":" + (minutosInicio.length > 1 ? minutosInicio : "0" + minutosInicio);
                                        var fechaFinNuevaHM = (horasFin.length > 1 ? horasFin : "0" + horasFin)  + ":" + (minutosFin.length > 1 ? minutosFin : "0" + minutosFin);

                                        event.horaInicio = fechaInicioNuevaHM;
                                        event.horaFin = fechaFinNuevaHM;

                                        var inicio = event.horaInicio.split(':');
                                        var fin = event.horaFin.split(':');
                                        if (event.fechaCita == "2018-10-28T00:00:00") {
                                            var start = moment(event.fechaCita).add(Number(inicio[0] * 60) + Number(inicio[1]) + 60, 'm');
                                            var end = moment(event.fechaCita).add(Number(fin[0] * 60) + Number(fin[1]) + 60, 'm');
                                        }
                                        else {
                                            if (event.fechaCita == "2019-04-07T00:00:00") {
                                                var start = moment(event.fechaCita).add(Number(inicio[0] * 60) + Number(inicio[1]) - 60, 'm');
                                                var end = moment(event.fechaCita).add(Number(fin[0] * 60) + Number(fin[1]) - 60, 'm');
                                            }
                                            else {
                                                var start = moment(event.fechaCita).add(Number(inicio[0] * 60) + Number(inicio[1]), 'm');
                                                var end = moment(event.fechaCita).add(Number(fin[0] * 60) + Number(fin[1]), 'm');
                                            }
                                        }
                                        if (moment.duration(end.diff(start)).asMinutes() < 10) {
                                            end = moment(event.fechaCita).add(Number(inicio[0] * 60) + Number(inicio[1]), 'm').add(10, 'm');
                                        }

                                        event.start = start;
                                        event.end = end;

                                        if(!event.esUnicoServicio){
                                            for(var i = 0; i < this.events.length; i++){
                                                if(this.events[i].esCita){
                                                    if(this.events[i].cita == event.cita && this.events[i].id != event.id){
                                                        for(var j = 0; j < this.events[i].citasRelacionadas.length; j++){
                                                            if(this.events[i].citasRelacionadas[j].cita.idCitaDetalle == event.id){
                                                                this.events[i].citasRelacionadas[j].cita.idPersonal = event.resource;
                                                                this.events[i].citasRelacionadas[j].cita.horaInicio = fechaInicioNuevaHM;
                                                                this.events[i].citasRelacionadas[j].cita.horaFin = fechaFinNuevaHM;
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                            for(var i = 0; i < this.citas.length; i++){
                                                if(this.citas[i].cita == event.cita && this.citas[i].id != event.id){
                                                    for(var j = 0; j < this.citas[i].citasRelacionadas.length; j++){
                                                        if(this.citas[i].citasRelacionadas[j].cita.idCitaDetalle == event.id){
                                                            this.citas[i].citasRelacionadas[j].cita.idPersonal = event.resource;
                                                            this.citas[i].citasRelacionadas[j].cita.horaInicio = fechaInicioNuevaHM;
                                                            this.citas[i].citasRelacionadas[j].cita.horaFin = fechaFinNuevaHM;
                                                        }
                                                    }
                                                }
                                                if(this.citas[i].cita == event.cita && this.citas[i].id == event.id){
                                                    this.citas[i].idPersonal = event.resource;
                                                    this.citas[i].resources = event.resource;
                                                    this.citas[i].horaInicio = fechaInicioNuevaHM;
                                                    this.citas[i].horaFin = fechaFinNuevaHM;

                                                    var inicio = this.citas[i].horaInicio.split(':');
                                                    var fin = this.citas[i].horaFin.split(':');
                                                    if (this.citas[i].fechaCita == "2018-10-28T00:00:00") {
                                                        var start = moment(this.citas[i].fechaCita).add(Number(inicio[0] * 60) + Number(inicio[1]) + 60, 'm');
                                                        var end = moment(this.citas[i].fechaCita).add(Number(fin[0] * 60) + Number(fin[1]) + 60, 'm');
                                                    }
                                                    else {
                                                        if (this.citas[i].fechaCita == "2019-04-07T00:00:00") {
                                                            var start = moment(this.citas[i].fechaCita).add(Number(inicio[0] * 60) + Number(inicio[1]) - 60, 'm');
                                                            var end = moment(this.citas[i].fechaCita).add(Number(fin[0] * 60) + Number(fin[1]) - 60, 'm');
                                                        }
                                                        else {
                                                            var start = moment(this.citas[i].fechaCita).add(Number(inicio[0] * 60) + Number(inicio[1]), 'm');
                                                            var end = moment(this.citas[i].fechaCita).add(Number(fin[0] * 60) + Number(fin[1]), 'm');
                                                        }
                                                    }
                                                    if (moment.duration(end.diff(start)).asMinutes() < 10) {
                                                        end = moment(this.citas[i].fechaCita).add(Number(inicio[0] * 60) + Number(inicio[1]), 'm').add(10, 'm');
                                                    }

                                                    this.citas[i].start = start;
                                                    this.citas[i].end = end;
                                                }
                                            }
                                        }
                                        else{
                                            for(var i = 0; i < this.citas.length; i++){
                                                if(this.citas[i].cita == event.cita && this.citas[i].id == event.id){
                                                    this.citas[i].idPersonal = event.resource;
                                                    this.citas[i].resources = event.resource;
                                                    this.citas[i].horaInicio = fechaInicioNuevaHM;
                                                    this.citas[i].horaFin = fechaFinNuevaHM;

                                                    var inicio = this.citas[i].horaInicio.split(':');
                                                    var fin = this.citas[i].horaFin.split(':');
                                                    if (this.citas[i].fechaCita == "2018-10-28T00:00:00") {
                                                        var start = moment(this.citas[i].fechaCita).add(Number(inicio[0] * 60) + Number(inicio[1]) + 60, 'm');
                                                        var end = moment(this.citas[i].fechaCita).add(Number(fin[0] * 60) + Number(fin[1]) + 60, 'm');
                                                    }
                                                    else {
                                                        if (this.citas[i].fechaCita == "2019-04-07T00:00:00") {
                                                            var start = moment(this.citas[i].fechaCita).add(Number(inicio[0] * 60) + Number(inicio[1]) - 60, 'm');
                                                            var end = moment(this.citas[i].fechaCita).add(Number(fin[0] * 60) + Number(fin[1]) - 60, 'm');
                                                        }
                                                        else {
                                                            var start = moment(this.citas[i].fechaCita).add(Number(inicio[0] * 60) + Number(inicio[1]), 'm');
                                                            var end = moment(this.citas[i].fechaCita).add(Number(fin[0] * 60) + Number(fin[1]), 'm');
                                                        }
                                                    }
                                                    if (moment.duration(end.diff(start)).asMinutes() < 10) {
                                                        end = moment(this.citas[i].fechaCita).add(Number(inicio[0] * 60) + Number(inicio[1]), 'm').add(10, 'm');
                                                    }

                                                    this.citas[i].start = start;
                                                    this.citas[i].end = end;
                                                }
                                            }
                                        }
                                        this._pantallaServicio.ocultarSpinner();
                                        this.consultarCitas();
                                }
                            }, error => {
                                this._router.navigate(['/login']);
                            });
                        }
                        else {
                            // Si se cambia de un personal a cabina
                            event.editable = true;
                            this._toaster.error("No se puede cambiar de un Personal a Cabina");
                            ev.revert();
                            this._pantallaServicio.ocultarSpinner();
                        }
                    }
                    else {
                        if (dropEnPersonal) {
                            // Si se cambia de una cabina a personal
                            event.editable = true;
                            this._toaster.error("No se puede cambiar de una Cabina a Personal");
                            ev.revert();
                            this._pantallaServicio.ocultarSpinner();
                        }
                        else {
                            // Se cambia de una cabina a cabina
                            var params: any = {};
                            params.idCita = event.cita;
                            params.idCitaDetalle = event.id;
                            params.horaInicio = moment(event.start).format('HH:mm:ss');
                            params.horaFin = moment(event.end).format('HH:mm:ss');
                            params.fechaCita = moment(event.start).format('YYYY/MM/DD');
                            params.idCabina = event.resource;
                            params.idPromocionSucursal = null;
                            params.valorPromocion = null;
                            params.tipoPromocion = null;
                            params.origen = "web";
                            params.idServicio = event.idServicio;
                            params.idPersonal = event.idPersonal;

                            this._backService.HttpPost("procesos/agenda/Agenda/actualizarCitaDetalleCabina", {}, params).subscribe((response: string) => {
                                switch (Number(response)) {
                                    //Estos son los diferentes resultados que te puede regresar la función de actualizar el detalle de la cita
                                    case -1:
                                        event.editable = true;
                                        this._toaster.error("La Cabina tiene una excepción a esa hora");
                                        ev.revert();
                                        this._pantallaServicio.ocultarSpinner();
                                        break;
                                    case -2:
                                        event.editable = true;
                                        this._toaster.error("La Cabina tiene un descanso a esa hora");
                                        ev.revert();
                                        this._pantallaServicio.ocultarSpinner();
                                        break;
                                    case -3:
                                        event.editable = true;
                                        this._toaster.error("La Cabina no labora en esa hora");
                                        ev.revert();
                                        this._pantallaServicio.ocultarSpinner();
                                        break;
                                    case -4:
                                        event.editable = true;
                                        this._toaster.error("La Cabina ya cuenta con otra cita");
                                        ev.revert();
                                        this._pantallaServicio.ocultarSpinner();
                                        break;
                                    case -5:
                                        event.editable = true;
                                        this._toaster.error(this.equiposTranslate.equipoNoDisponible);
                                        ev.revert();
                                        this._pantallaServicio.ocultarSpinner();
                                        break;
                                    case -6:
                                        event.editable = true;
                                        this._toaster.error("La Cabina a la que se quiere cambiar no tiene asginado el personal de la cita");
                                        ev.revert();
                                        this._pantallaServicio.ocultarSpinner();
                                        break;
                                    case -7:
                                        event.editable = true;
                                        this._toaster.error("La Cabina a la que se quiere cambiar no tiene asginado el servicio de la cita");
                                        ev.revert();
                                        this._pantallaServicio.ocultarSpinner();
                                        break;
                                    default:
                                        event.editable = true;
                                        event.idCabina = event.resource;

                                        var fechaInicioAnteriorHM = event.horaInicio.split(":");
                                        var fechaFinAnteriorHM = event.horaFin.split(":");

                                        let minutosTemp = Math.floor(ev.delta.milliseconds / 60000);
                                        let horasTemp = Math.floor(minutosTemp / 60);
                                        minutosTemp = minutosTemp % 60;

                                        var horasAgregadas = horasTemp;
                                        var minutosAgregados = minutosTemp;

                                        // -------------
                                        var horasInicio: any = Number(fechaInicioAnteriorHM[0]) + horasAgregadas;
                                        var minutosInicio: any = Number(fechaInicioAnteriorHM[1]) + minutosAgregados
                                        if(minutosInicio >= 60){
                                            horasInicio = horasInicio + 1;
                                            minutosInicio = minutosInicio - 60;
                                        }
                                        if(minutosInicio < 0){
                                            horasInicio = horasInicio - 1;
                                            minutosInicio = minutosInicio + 60;
                                        }
                                        horasInicio = horasInicio.toString();
                                        minutosInicio = minutosInicio.toString();

                                        // -------------
                                        var horasFin: any = Number(fechaFinAnteriorHM[0]) + horasAgregadas;
                                        var minutosFin: any = Number(fechaFinAnteriorHM[1]) + minutosAgregados;
                                        if(minutosFin >= 60){
                                            horasFin = horasFin + 1;
                                            minutosFin = minutosFin - 60;
                                        }
                                        if(minutosFin < 0){
                                            horasFin = horasFin - 1;
                                            minutosFin = minutosFin + 60;
                                        }
                                        horasFin = horasFin.toString();
                                        minutosFin = minutosFin.toString();

                                        // -------------
                                        var fechaInicioNuevaHM = (horasInicio.length > 1 ? horasInicio : "0" + horasInicio)  + ":" + (minutosInicio.length > 1 ? minutosInicio : "0" + minutosInicio);
                                        var fechaFinNuevaHM = (horasFin.length > 1 ? horasFin : "0" + horasFin)  + ":" + (minutosFin.length > 1 ? minutosFin : "0" + minutosFin);

                                        event.horaInicio = fechaInicioNuevaHM;
                                        event.horaFin = fechaFinNuevaHM;

                                        var inicio = event.horaInicio.split(':');
                                        var fin = event.horaFin.split(':');
                                        if (event.fechaCita == "2018-10-28T00:00:00") {
                                            var start = moment(event.fechaCita).add(Number(inicio[0] * 60) + Number(inicio[1]) + 60, 'm');
                                            var end = moment(event.fechaCita).add(Number(fin[0] * 60) + Number(fin[1]) + 60, 'm');
                                        }
                                        else {
                                            if (event.fechaCita == "2019-04-07T00:00:00") {
                                                var start = moment(event.fechaCita).add(Number(inicio[0] * 60) + Number(inicio[1]) - 60, 'm');
                                                var end = moment(event.fechaCita).add(Number(fin[0] * 60) + Number(fin[1]) - 60, 'm');
                                            }
                                            else {
                                                var start = moment(event.fechaCita).add(Number(inicio[0] * 60) + Number(inicio[1]), 'm');
                                                var end = moment(event.fechaCita).add(Number(fin[0] * 60) + Number(fin[1]), 'm');
                                            }
                                        }
                                        if (moment.duration(end.diff(start)).asMinutes() < 10) {
                                            end = moment(event.fechaCita).add(Number(inicio[0] * 60) + Number(inicio[1]), 'm').add(10, 'm');
                                        }

                                        event.start = start;
                                        event.end = end;

                                        if(!event.esUnicoServicio){
                                            for(var i = 0; i < this.events.length; i++){
                                                if(this.events[i].esCita){
                                                    if(this.events[i].cita == event.cita && this.events[i].id != event.id){
                                                        for(var j = 0; j < this.events[i].citasRelacionadas.length; j++){
                                                            if(this.events[i].citasRelacionadas[j].cita.idCitaDetalle == event.id){
                                                                this.events[i].citasRelacionadas[j].cita.idCabina = event.resource;
                                                                this.events[i].citasRelacionadas[j].cita.horaInicio = fechaInicioNuevaHM;
                                                                this.events[i].citasRelacionadas[j].cita.horaFin = fechaFinNuevaHM;
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                            for(var i = 0; i < this.citas.length; i++){
                                                if(this.citas[i].cita == event.cita && this.citas[i].id != event.id){
                                                    for(var j = 0; j < this.citas[i].citasRelacionadas.length; j++){
                                                        if(this.citas[i].citasRelacionadas[j].cita.idCitaDetalle == event.id){
                                                            this.citas[i].citasRelacionadas[j].cita.idCabina = event.resource;
                                                            this.citas[i].citasRelacionadas[j].cita.horaInicio = fechaInicioNuevaHM;
                                                            this.citas[i].citasRelacionadas[j].cita.horaFin = fechaFinNuevaHM;
                                                        }
                                                    }
                                                }
                                                if(this.citas[i].cita == event.cita && this.citas[i].id == event.id){
                                                    this.citas[i].idPersonal = event.resource;
                                                    this.citas[i].resources = event.resource;
                                                    this.citas[i].horaInicio = fechaInicioNuevaHM;
                                                    this.citas[i].horaFin = fechaFinNuevaHM;

                                                    var inicio = this.citas[i].horaInicio.split(':');
                                                    var fin = this.citas[i].horaFin.split(':');
                                                    if (this.citas[i].fechaCita == "2018-10-28T00:00:00") {
                                                        var start = moment(this.citas[i].fechaCita).add(Number(inicio[0] * 60) + Number(inicio[1]) + 60, 'm');
                                                        var end = moment(this.citas[i].fechaCita).add(Number(fin[0] * 60) + Number(fin[1]) + 60, 'm');
                                                    }
                                                    else {
                                                        if (this.citas[i].fechaCita == "2019-04-07T00:00:00") {
                                                            var start = moment(this.citas[i].fechaCita).add(Number(inicio[0] * 60) + Number(inicio[1]) - 60, 'm');
                                                            var end = moment(this.citas[i].fechaCita).add(Number(fin[0] * 60) + Number(fin[1]) - 60, 'm');
                                                        }
                                                        else {
                                                            var start = moment(this.citas[i].fechaCita).add(Number(inicio[0] * 60) + Number(inicio[1]), 'm');
                                                            var end = moment(this.citas[i].fechaCita).add(Number(fin[0] * 60) + Number(fin[1]), 'm');
                                                        }
                                                    }
                                                    if (moment.duration(end.diff(start)).asMinutes() < 10) {
                                                        end = moment(this.citas[i].fechaCita).add(Number(inicio[0] * 60) + Number(inicio[1]), 'm').add(10, 'm');
                                                    }

                                                    this.citas[i].start = start;
                                                    this.citas[i].end = end;
                                                }
                                            }
                                        }
                                        else{
                                            for(var i = 0; i < this.citas.length; i++){
                                                if(this.citas[i].cita == event.cita && this.citas[i].id == event.id){
                                                    this.citas[i].idPersonal = event.resource;
                                                    this.citas[i].resources = event.resource;
                                                    this.citas[i].horaInicio = fechaInicioNuevaHM;
                                                    this.citas[i].horaFin = fechaFinNuevaHM;

                                                    var inicio = this.citas[i].horaInicio.split(':');
                                                    var fin = this.citas[i].horaFin.split(':');
                                                    if (this.citas[i].fechaCita == "2018-10-28T00:00:00") {
                                                        var start = moment(this.citas[i].fechaCita).add(Number(inicio[0] * 60) + Number(inicio[1]) + 60, 'm');
                                                        var end = moment(this.citas[i].fechaCita).add(Number(fin[0] * 60) + Number(fin[1]) + 60, 'm');
                                                    }
                                                    else {
                                                        if (this.citas[i].fechaCita == "2019-04-07T00:00:00") {
                                                            var start = moment(this.citas[i].fechaCita).add(Number(inicio[0] * 60) + Number(inicio[1]) - 60, 'm');
                                                            var end = moment(this.citas[i].fechaCita).add(Number(fin[0] * 60) + Number(fin[1]) - 60, 'm');
                                                        }
                                                        else {
                                                            var start = moment(this.citas[i].fechaCita).add(Number(inicio[0] * 60) + Number(inicio[1]), 'm');
                                                            var end = moment(this.citas[i].fechaCita).add(Number(fin[0] * 60) + Number(fin[1]), 'm');
                                                        }
                                                    }
                                                    if (moment.duration(end.diff(start)).asMinutes() < 10) {
                                                        end = moment(this.citas[i].fechaCita).add(Number(inicio[0] * 60) + Number(inicio[1]), 'm').add(10, 'm');
                                                    }

                                                    this.citas[i].start = start;
                                                    this.citas[i].end = end;

                                                }
                                            }
                                        }
                                        this._pantallaServicio.ocultarSpinner();
                                        this.consultarCitas();
                                }
                            }, error => {
                                this._router.navigate(['/login']);
                            });
                        }
                    }
                },

                schedulerLicenseKey: 'CC-Attribution-NonCommercial-NoDerivatives',
            });

            this.agenda.render();
        }, 10);
    }

    createPopoverContentElement(): HTMLElement {
        const containerElement: any = document.createElement("div");
        containerElement.style.display = "none";
        const embeddedView = this.popoverContenido.createEmbeddedView(null);
        this._viewContainerRef.insert(embeddedView);

        embeddedView.detectChanges();

        const popoverContentElement = embeddedView.rootNodes[0] as HTMLElement;
        containerElement.appendChild(popoverContentElement);

        return popoverContentElement;
    }

    calendario_calcularHorariosDisponibles() {
        var altura = 0;

        var horaInicio = "";
        var horaFin = "";

        var horaInicioMenor = "24:00:00";
        var horaFinMayor = "00:00:00";

        var horaInicioEnMinutos = 0;
        var horaFinEnMinutos = 0;

        var horaInicioMenorEnMinutos = 1440;
        var horaFinMayorEnMinutos = 0;

        // Calcula la hora inicio y fin en base a los horarios laborales de los personales
        for (var i = 0; i < this.horarioPersonales.length; i++) {
            var elem = this.horarioPersonales[i];

            if(this.calendario.viewActual == "resourceDay"){
                var dia = moment(this.calendario.fechaActualCalendario).isoWeekday();

                if (elem.dia == dia && !elem.esDescanso) {
                    horaInicio = elem.horaInicio.split(':');
                    horaFin = elem.horaFin.split(':');

                    horaInicioEnMinutos = (Number(horaInicio[0]) * 60) + Number(horaInicio[1]);
                    horaFinEnMinutos = (Number(horaFin[0]) * 60) + Number(horaFin[1]);

                    if (horaInicioEnMinutos < horaInicioMenorEnMinutos) {
                        horaInicioMenorEnMinutos = horaInicioEnMinutos;
                        horaInicioMenor = elem.horaInicio;
                    }

                    if (horaFinEnMinutos > horaFinMayorEnMinutos) {
                        horaFinMayorEnMinutos = horaFinEnMinutos;
                        horaFinMayor = elem.horaFin;
                    }
                }
            }
            else{
                if(this.calendario.viewActual == "agendaWeek"){
                    if (elem.idPersonal == this.resourceSemana && !elem.esDescanso) {
                        horaInicio = elem.horaInicio.split(':');
                        horaFin = elem.horaFin.split(':');

                        horaInicioEnMinutos = (Number(horaInicio[0]) * 60) + Number(horaInicio[1]);
                        horaFinEnMinutos = (Number(horaFin[0]) * 60) + Number(horaFin[1]);

                        if (horaInicioEnMinutos < horaInicioMenorEnMinutos) {
                            horaInicioMenorEnMinutos = horaInicioEnMinutos;
                            horaInicioMenor = elem.horaInicio;
                        }

                        if (horaFinEnMinutos > horaFinMayorEnMinutos) {
                            horaFinMayorEnMinutos = horaFinEnMinutos;
                            horaFinMayor = elem.horaFin;
                        }
                    }
                }
            }
        }

        // Después de obtener el horario en base a los personales, se verifica que no haya citas que no estén
        // en los horarios de los personales (se crearon antes de modificar el horario del personal)
        if(this.calendario.viewActual == "resourceDay" || this.calendario.viewActual == "agendaWeek"){
            for (var i = 0; i < this.events.length; i++) {
                var elem = this.events[i];

                if (elem.esCita) {
                    var horaInicioAux = new Date(elem.start);
                    var horaFinAux = new Date(elem.end);

                    let horaInicio:any = moment(elem.start).format("HH:mm").split(":");
                    let horaFin:any = moment(elem.end).format("HH:mm").split(":");

                    horaInicioEnMinutos = (Number(horaInicio[0]) * 60) + Number(horaInicio[1]);
                    horaFinEnMinutos = (Number(horaFin[0]) * 60) + Number(horaFin[1]);

                    if (horaInicioEnMinutos < horaInicioMenorEnMinutos) {
                        horaInicioMenorEnMinutos = horaInicioEnMinutos;
                        horaInicioMenor = moment(elem.start).format("HH:mm");
                    }

                    if (horaFinEnMinutos > horaFinMayorEnMinutos) {
                        horaFinMayorEnMinutos = horaFinEnMinutos;
                        horaFinMayor = moment(elem.end).format("HH:mm");
                    }
                }
            }
        }

        if(horaFinMayor == "23:59:00"){
            horaFinMayor = "24:00:00"
        }

        // Calcular los minutos para cuando la hora inicio o fin empiezan en un horario no multiplo de 15
        let minutosValidosInicio:any = horaInicioMenor.split(':')[1];
        if (minutosValidosInicio >= 0 && minutosValidosInicio < 15) {
            minutosValidosInicio = 0;
        }
        else if (minutosValidosInicio >= 15 && minutosValidosInicio < 30) {
            minutosValidosInicio = 15;
        }
        else if (minutosValidosInicio >= 30 && minutosValidosInicio < 45) {
            minutosValidosInicio = 30;
        }
        else if (minutosValidosInicio >= 45) {
            minutosValidosInicio = 45;
        }

        let minutosValidosFin:any = horaFinMayor.split(':')[1];
        if (minutosValidosFin >= 0 && minutosValidosFin < 15) {
            minutosValidosFin = 0;
        }
        else if (minutosValidosFin >= 15 && minutosValidosFin < 30) {
            minutosValidosFin = 15;
        }
        else if (minutosValidosFin >= 30 && minutosValidosFin < 45) {
            minutosValidosFin = 30;
        }
        else if (minutosValidosFin >= 45) {
            minutosValidosFin = 45;
        }

        // Se calcula la altura del calendario en base al horario
        if (this.calendario.viewActual == "" || this.calendario.viewActual == "resourceDay") {
            altura = ((((horaFinMayorEnMinutos - horaInicioMenorEnMinutos) / 15) - 1) * 21) + 137;
        }

        if (this.calendario.viewActual == "agendaWeek") {
            altura = ((((horaFinMayorEnMinutos - horaInicioMenorEnMinutos) / 15) - 1) * 23);
        }

        var propiedades = {
            altura: altura,
            horaInicio: horaInicioMenor.split(':')[0] + ':' + (minutosValidosInicio < 10 ? '0' + minutosValidosInicio : minutosValidosInicio) + ':00',
            horaFin: horaFinMayor.split(':')[0] + ':' + (minutosValidosFin < 10 ? '0' + minutosValidosFin : minutosValidosFin) + ':00'
        }

        return propiedades;
    }

    calendario_crearEventosDescansosFuerasDeHorario() {
        if(this.calendario.viewActual == "resourceDay" || this.calendario.viewActual == "agendaWeek"){
            var fechaInicioSemana = moment(this.calendario.fechaActualCalendario);
            fechaInicioSemana.local().startOf("isoWeek");

            this.noLaboral = [];

            for (var i = 0; i < this.horarioPersonales.length; i++) {
                var elem = this.horarioPersonales[i];

                if (!elem.esLaboral && !elem.esDescanso) {
                    // Horario no laboral del personal
                    var evnt: any = {};
                    evnt.id = elem.idPersonalHorario;
                    evnt.title = this.agendaTranslate.noLaboral;
                    evnt.dia = elem.dia;
                    evnt.idPersonal = elem.idPersonal;

                    if(this.calendario.viewActual == "resourceDay"){
                        this.noLaboral.push(evnt);
                    }
                    if(this.calendario.viewActual == "agendaWeek"){
                        if(evnt.idPersonal == this.resourceSemana){
                            this.noLaboral.push(JSON.parse(JSON.stringify(evnt)));
                        }
                    }
                }
                else {
                    if (elem.esDescanso) {
                        // Descanso de un personal
                        var inicio = elem.horaInicio.split(':');
                        var fin = elem.horaFin.split(':');

                        var evnt: any = {};
                        evnt.id = elem.idPersonalHorario;
                        evnt.title = this.agendaTranslate.descanso;
                        evnt.start = (fechaInicioSemana.clone()).add("d", elem.dia - 1).add(Number(inicio[0] * 60) + Number(inicio[1]), 'm');
                        evnt.end = (fechaInicioSemana.clone()).add("d", elem.dia - 1).add(Number(fin[0] * 60) + Number(fin[1]), 'm');
                        evnt.resourceId = elem.idPersonal;
                        evnt.color = 'cadetblue';
                        evnt.overlap = false;
                        evnt.eventOverlap = false;
                        // evnt.editable = false;
                        evnt.startEditable = false;
                        evnt.resourceEditable = false;

                        evnt.esCita = false;
                        evnt.esDescanso = true;
                        evnt.esFueraDeHorario = false;
                        evnt.esExcepcionesPersonal = false;

                        if(this.calendario.viewActual == "resourceDay"){
                            this.events.push(JSON.parse(JSON.stringify(evnt)));
                        }
                        if(this.calendario.viewActual == "agendaWeek"){
                            if(evnt.resourceId == this.resourceSemana){
                                this.events.push(JSON.parse(JSON.stringify(evnt)));
                            }
                        }
                    }

                    if (elem.esLaboral) {
                        // Horario no laboral de un personal
                        if (elem.horaInicio > this.calendario.propiedades.horaInicio) {
                            var inicio = this.calendario.propiedades.horaInicio.split(':');
                            var fin = elem.horaInicio.split(':');

                            var evnt: any = {};
                            evnt.id = elem.idPersonalHorario;
                            evnt.title = this.agendaTranslate.fueraHorario;
                            evnt.start = (fechaInicioSemana.clone()).add("d", elem.dia - 1).add(Number(inicio[0] * 60) + Number(inicio[1]), 'm');
                            evnt.end = (fechaInicioSemana.clone()).add("d", elem.dia - 1).add(Number(fin[0] * 60) + Number(fin[1]), 'm');
                            evnt.resourceId = elem.idPersonal;
                            evnt.color = '#ddd';
                            evnt.overlap = false;
                            evnt.eventOverlap = false;
                            // evnt.editable = false;
                            evnt.startEditable = false;
                            evnt.resourceEditable = false;
                            evnt.textColor = 'black';

                            evnt.esCita = false;
                            evnt.esDescanso = false;
                            evnt.esFueraDeHorario = true;
                            evnt.esExcepcionesPersonal = false;

                            if(this.calendario.viewActual == "resourceDay"){
                                this.events.push(JSON.parse(JSON.stringify(evnt)));
                            }
                            if(this.calendario.viewActual == "agendaWeek"){
                                if(evnt.resourceId == this.resourceSemana){
                                    this.events.push(JSON.parse(JSON.stringify(evnt)));
                                }
                            }
                        }

                        if (elem.horaFin < this.calendario.propiedades.horaFin) {
                            var inicio = elem.horaFin.split(':');
                            var fin = this.calendario.propiedades.horaFin.split(':');

                            var evnt: any = {};
                            evnt.id = elem.idPersonalHorario;
                            evnt.title = this.agendaTranslate.fueraHorario;
                            evnt.start = (fechaInicioSemana.clone()).add("d", elem.dia - 1).add(Number(inicio[0] * 60) + Number(inicio[1]), 'm');
                            evnt.end = (fechaInicioSemana.clone()).add("d", elem.dia - 1).add(Number(fin[0] * 60) + Number(fin[1]), 'm');
                            evnt.resourceId = elem.idPersonal;
                            evnt.color = '#ddd';
                            evnt.overlap = false;
                            evnt.eventOverlap = false;
                            // evnt.editable = false;
                            evnt.startEditable = false;
                            evnt.resourceEditable = false;
                            evnt.textColor = 'black';

                            evnt.esCita = false;
                            evnt.esDescanso = false;
                            evnt.esFueraDeHorario = true;
                            evnt.esExcepcionesPersonal = false;

                            if(this.calendario.viewActual == "resourceDay"){
                                this.events.push(JSON.parse(JSON.stringify(evnt)));
                            }
                            if(this.calendario.viewActual == "agendaWeek"){
                                if(evnt.resourceId == this.resourceSemana){
                                    this.events.push(JSON.parse(JSON.stringify(evnt)));
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    calendario_cargarCatalogoPersonal(id: any, esBaja: any) {
        if (!esBaja) {
            this._pantallaServicio.global_IdPersonal = id;
            this._router.navigate(['/catalogos/personal']);
        } else {
            this._toaster.error(this.agendaTranslate.personalDadoBaja);
        }
    }

    calendario_marcarDiasNoLaborales() {
        $(".fc-dia-deshabilitado").removeClass("fc-dia-deshabilitado");

        var diaSemana = moment(this.calendario.fechaActualCalendario).isoWeekday();

        if (this.calendario.viewActual == "resourceDay") {
            for (var i = 0; i < this.resources.length; i++) {
                for (var j = 0; j < this.noLaboral.length; j++) {
                    if (this.resources[i].id == this.noLaboral[j].idPersonal) {
                        if (diaSemana == this.noLaboral[j].dia) {
                            // document.getElementsByClassName("fc-timegrid-col")[this.resources[i].index].getAttribute("data-resource-id");
                            document.getElementsByClassName("fc-timegrid-col")[this.resources[i].index].className += " fc-dia-deshabilitado";
                        }
                    }
                }
            }
        }
        else{
            if (this.calendario.viewActual == "agendaWeek") {
                for (var j = 0; j < this.noLaboral.length; j++) {
                    switch (Number(this.noLaboral[j].dia)) {
                        case 1:
                            document.getElementsByClassName("fc-day-mon")[1].className += " fc-dia-deshabilitado";
                            break;
                        case 2:
                            document.getElementsByClassName("fc-day-tue")[1].className += " fc-dia-deshabilitado";
                            break;
                        case 3:
                            document.getElementsByClassName("fc-day-wed")[1].className += " fc-dia-deshabilitado";
                            break;
                        case 4:
                            document.getElementsByClassName("fc-day-thu")[1].className += " fc-dia-deshabilitado";
                            break;
                        case 5:
                            document.getElementsByClassName("fc-day-fri")[1].className += " fc-dia-deshabilitado";
                            break;
                        case 6:
                            document.getElementsByClassName("fc-day-sat")[1].className += " fc-dia-deshabilitado";
                            break;
                        case 7:
                            document.getElementsByClassName("fc-day-sun")[1].className += " fc-dia-deshabilitado";
                            break;
                    }
                }
            }
        }
    }

    calendario_historialClientesAccion(){
        setTimeout(() => {
            if (this.historialClientes.mostrarEdicion) {
                let eventosCalendario = this.agenda.getEvents();
                for (var i = 0; i < eventosCalendario.length; i++) {
                    var ev = JSON.parse(JSON.stringify(eventosCalendario[i]));

                    var event: any = {};
                    var keys = Object.keys(ev.extendedProps);
                    keys.forEach(k => {
                        event[k] = ev.extendedProps[k];
                    });
                    event.id = Number(ev.id);
                    event.title = ev.title;
                    event.start = ev.start;
                    event.end = ev.end;
                    event.overlap = ev.overlap;
                    event.color = ev.backgroundColor;
                    event.editable = ev.startEditable;

                    if (event.cita == this.historialClientes.citaSeleccionada.idCita) {
                        this.historialClientes.mostrarEdicion = false;

                        this.calendario.clickedEvent = {
                            title: event.title,
                            start: moment(event.start),
                            end: moment(event.end),
                            overlap: event.overlap,
                            id: event.id,
                            cita: event.cita,
                            fechaCita: event.fechaCita,
                            horaInicio: event.horaInicio,
                            horaFin: event.horaFin,
                            idServicio: event.idServicio,
                            servicio: event.servicio,
                            idPersonal: event.idPersonal,
                            personal: event.personal,
                            idCabina: event.idCabina,
                            nombreCabina: event.nombreCabina,
                            idCliente: event.idCliente,
                            cliente: event.cliente,
                            emailCliente: event.emailCliente,
                            telefonoCliente: event.telefonoCliente,
                            estatus: event.estatus,
                            editable: event.editable,
                            esCita: event.esCita,
                            esDescanso: event.esDescanso,
                            esFueraDeHorario: event.esFueraDeHorario,
                            esExcepcionesPersonal: event.esExcepcionesPersonal,
                            costoMinimo: event.costoMinimo,
                            costoMaximo: event.costoMaximo,
                            duracion: event.duracion,
                            telefono: event.telefono,
                            origen: event.origen,
                            color: event.color,
                            confirmada: event.confirmada,
                            nota: event.nota,
                            notasCliente: event.notasCliente,
                            paqueteNota: event.paqueteNota,
                            realizoAlta: event.realizoAlta,
                            fechaCreacion: event.fechaCreacion,
                            pagado: event.pagado,
                            idPagoClienteDetalle: event.idPagoClienteDetalle,
                            montoTotalPagoPaypal: event.montoTotalPagoPaypal,
                            idPaqueteSucursalClienteServicioDetalle: event.idPaqueteSucursalClienteServicioDetalle,
                            idPaqueteSucursalCliente: event.idPaqueteSucursalCliente,
                            idPaqueteSucursalClienteServicio: event.idPaqueteSucursalClienteServicio,
                            citasRelacionadas: event.citasRelacionadas,
                            esUnicoServicio: event.esUnicoServicio,
                            citaPrepagada: event.citaPrepagada
                        }

                        this.calendario.clickedEvent.fechaCreacion = moment(this.calendario.clickedEvent.fechaCreacion);
                        this.calendario.clickedEvent.estatusOriginal = JSON.parse(JSON.stringify(this.calendario.clickedEvent.estatus));
                        this.calendario.clickedEvent.notaOriginal = JSON.parse(JSON.stringify(this.calendario.clickedEvent.nota));

                        if(this.accesosPantallaAgenda.cambiarEstatusCita){
                            this.editarCita();
                        }
                        i = eventosCalendario.length;
                    }
                }
            }

            if(this.historialClientes.mostrarTicket){
                let eventosCalendario = this.agenda.getEvents();
                for (var i = 0; i < eventosCalendario.length; i++) {
                    var ev = JSON.parse(JSON.stringify(eventosCalendario[i]));

                    var event: any = {};
                    var keys = Object.keys(ev.extendedProps);
                    keys.forEach(k => {
                        event[k] = ev.extendedProps[k];
                    });
                    event.id = Number(ev.id);
                    event.title = ev.title;
                    event.start = ev.start;
                    event.end = ev.end;
                    event.overlap = ev.overlap;
                    event.color = ev.textColor;
                    event.editable = ev.startEditable;

                    if (event.cita == this.historialClientes.citaSeleccionada.idCita) {
                        this.historialClientes.mostrarTicket = false;

                        this.calendario.clickedEvent = {
                            title: event.title,
                            start: moment(event.start),
                            end: moment(event.end),
                            overlap: event.overlap,
                            id: event.id,
                            cita: event.cita,
                            fechaCita: event.fechaCita,
                            horaInicio: event.horaInicio,
                            horaFin: event.horaFin,
                            idServicio: event.idServicio,
                            servicio: event.servicio,
                            idPersonal: event.idPersonal,
                            personal: event.personal,
                            idCabina: event.idCabina,
                            nombreCabina: event.nombreCabina,
                            idCliente: event.idCliente,
                            cliente: event.cliente,
                            emailCliente: event.emailCliente,
                            telefonoCliente: event.telefonoCliente,
                            estatus: event.estatus,
                            editable: event.editable,
                            esCita: event.esCita,
                            esDescanso: event.esDescanso,
                            esFueraDeHorario: event.esFueraDeHorario,
                            esExcepcionesPersonal: event.esExcepcionesPersonal,
                            costoMinimo: event.costoMinimo,
                            costoMaximo: event.costoMaximo,
                            duracion: event.duracion,
                            telefono: event.telefono,
                            origen: event.origen,
                            color: event.color,
                            confirmada: event.confirmada,
                            nota: event.nota,
                            notasCliente: event.notasCliente,
                            paqueteNota: event.paqueteNota,
                            realizoAlta: event.realizoAlta,
                            fechaCreacion: event.fechaCreacion,
                            pagado: event.pagado,
                            idPagoClienteDetalle: event.idPagoClienteDetalle,
                            montoTotalPagoPaypal: event.montoTotalPagoPaypal,
                            idPaqueteSucursalClienteServicioDetalle: event.idPaqueteSucursalClienteServicioDetalle,
                            idPaqueteSucursalCliente: event.idPaqueteSucursalCliente,
                            idPaqueteSucursalClienteServicio: event.idPaqueteSucursalClienteServicio,
                            citasRelacionadas: event.citasRelacionadas,
                            esUnicoServicio: event.esUnicoServicio,
                            citaPrepagada: event.citaPrepagada
                        }

                        this.calendario.clickedEvent.fechaCreacion = moment(this.calendario.clickedEvent.fechaCreacion);
                        this.calendario.clickedEvent.estatusOriginal = JSON.parse(JSON.stringify(this.calendario.clickedEvent.estatus));
                        this.calendario.clickedEvent.notaOriginal = JSON.parse(JSON.stringify(this.calendario.clickedEvent.nota));

                        this.ticketPago_mostrarModalTicketPago();
                        i = eventosCalendario.length;
                    }
                }
            }
        }, 1000);
    }

    crearInterval(){
        this.interval = setInterval(() => {
            if(!this._pantallaServicio.enCaja){
                if(this.resources.length != 0){
                    this._pantallaServicio.mostrarSpinner();
                    $(".fc-timegrid-event").popover('hide');
                    this.consultarCitas();

                    this.rootScope_consultarIndicadores();
                }
            }
        }, 600000);
    }


    // ---------------------------------------------------------- FUNCIONES FILTROS CALENDARIO ----------------------------------------------------------
    calendario_aplicarFiltrosVistaResources(opcion: any){

        // Se agrega o quita un solo resource
        if(opcion == 1){
            // Si se quita el ultimo resource seleccionado, se deja el primero
            if(this.resourcesFiltros.filtros.modelo.length == 0){
                this.resourcesFiltros.filtros.modelo.push(this.resourcesFiltros.filtros.opciones[0]);
            }

            this.resources = [];
            for(var i = 0; i < this.resourcesFiltros.filtros.opciones.length; i++){
                for(var j = 0; j < this.resourcesFiltros.filtros.modelo.length; j++){
                    if(this.resourcesFiltros.filtros.opciones[i].id == this.resourcesFiltros.filtros.modelo[j].id){
                        this.resources.push(this.resourcesFiltros.filtros.opciones[i]);
                    }
                }
            }
            this.resourceSemana = this.resources[0].id;

            for(var i = 0; i < this.resources.length; i++){
                this.resources[i].index = i;
            }

            this.events = [];
            for(var i = 0; i < this.citas.length; i++){
                this.events.push(this.citas[i]);
            }

            for(var i = 0; i < this.excepciones.length; i++){
                this.events.push(this.excepciones[i]);
            }
        }

        // Se ponen todos los resource
        if(opcion == 2){
            this.resourcesFiltros.filtros.modelo = [];
            this.resources = [];
            for(var i = 0; i < this.resourcesFiltros.filtros.opciones.length; i++){
                this.resourcesFiltros.filtros.modelo.push(this.resourcesFiltros.filtros.opciones[i]);
                this.resources.push(this.resourcesFiltros.filtros.opciones[i]);
            }
            this.resourceSemana = this.resources[0].id;

            for(var i = 0; i < this.resources.length; i++){
                this.resources[i].index = i;
            }

            this.events = [];
            for(var i = 0; i < this.citas.length; i++){
                this.events.push(this.citas[i]);
            }

            for(var i = 0; i < this.excepciones.length; i++){
                this.events.push(this.excepciones[i]);
            }
        }

        // Se quitan todos los resource (aunque se quiten del ddl, se deja siempre el primer resource en la agenda)
        if(opcion == 3){
            this.resourcesFiltros.filtros.modelo = [];
            this.resources = [];
            // this.resourcesFiltros.filtros.modelo.push(this.resourcesFiltros.filtros.opciones[0]);
            this.resources.push(this.resourcesFiltros.filtros.opciones[0]);
            this.resourceSemana = this.resources[0].id;

            for(var i = 0; i < this.resources.length; i++){
                this.resources[i].index = i;
            }

            this.events = [];
            for(var i = 0; i < this.citas.length; i++){
                this.events.push(this.citas[i]);
            }

            for(var i = 0; i < this.excepciones.length; i++){
                this.events.push(this.excepciones[i]);
            }
        }

        // $('#calendar').fullCalendar('destroy');
        this.calendario_crearCalendario();
    }

    calendario_aplicarFiltrosVistaSemana(res: any){
        //this.resourceSemana = res.id;

        this.events = [];
        for(var i = 0; i < this.citas.length; i++){
            if(this.citas[i].resourceId == this.resourceSemana){
                this.events.push(this.citas[i]);
            }
        }

        for(var i = 0; i < this.excepciones.length; i++){
            if(this.excepciones[i].resourceId == this.resourceSemana){
                this.events.push(this.excepciones[i]);
            }
        }

        // $('#calendar').fullCalendar('destroy');
        this.calendario_crearCalendario();
    }


    // ---------------------------------------------------------- FUNCIONES GENERALES DE CITA -----------------------------------------------------------
    crearNuevaCita(idPersonal: any, idCabina: any) {
        this.cita.cliente = null;
        this.cita.esClienteNuevo = false;
        this.cita.cabina = idCabina;
        var temp: any = {
            servicio: null,
            personal: idPersonal == null ? null : Number(idPersonal),
            id: 0,
            listadoPersonales: this.dataPersonal,
            listadoServicios: this.dataServicios,
            listadoServiciosBuffer: JSON.parse(JSON.stringify(this.dataServicios)),
            filterBy: null,
            esDePaquete: false
        }
        this.cita.servicios = [];
        this.cita.servicios.push(temp);
        this.cita.listadoHoras = [];
        if (idPersonal) {
            this.consultarServiciosPorPersonal(this.cita.servicios[0]);
        }
        this.calcularHorasDisponiblesEnCita();

        this.cita.recurrencia = false;
        this.limpiarRecurrencia();

        this.consultaReferenciaAgenda();

        this.mostrarModalNuevaCita();
    }

    editarCita(){
        this.calendario.mostrarEventPopup = false;
        $(".fc-timegrid-event").popover('hide');
        this._pantallaServicio.mostrarSpinner();

        this.citaEditar = {};
        this.citaEditar.cabina = this.calendario.clickedEvent.idCabina;
        this.citaEditar.fecha = this.calendario.clickedEvent.start.clone().format("YYYY-MM-DDTHH:mm:ssZ").substring(0, 10);
        this.calcularHorasDisponiblesEnEditarCita();

        var personal = null;
        for (var i = 0; i < this.dataPersonal.length; i++) {
            if (this.dataPersonal[i].idPersonal == this.calendario.clickedEvent.idPersonal) {
                personal = this.dataPersonal[i].idPersonal;
                break;
            }
        }

        // Primer servicio
        this.citaEditar.servicios = [{
            id: 0,
            servicio: this.calendario.clickedEvent.idServicio,
            personal: personal,
            listadoPersonales: [],
            listadoServicios: [],
            listadoServiciosBuffer: [],
            filterBy: null,
            inicio: this.calendario.clickedEvent.start.format("HH:mm"),
            fin: this.calendario.clickedEvent.end.format("HH:mm"),
            duracion: this.calendario.clickedEvent.duracion,
            esDePaquete: false,
            idPaqueteSucursalCliente: this.calendario.clickedEvent.idPaqueteSucursalCliente,
            idPaqueteSucursalClienteServicio: this.calendario.clickedEvent.idPaqueteSucursalClienteServicio,
            idPagoClienteDetalle: this.calendario.clickedEvent.idPagoClienteDetalle,
            montoTotalPagoPaypal: this.calendario.clickedEvent.montoTotalPagoPaypal
        }];

        if (this.citaEditar.servicios[0].idPaqueteSucursalCliente == null) {
            // Se consultan los servicios que puede realizar el personal
            this.citaEditar.servicios[0].listadoPersonales = JSON.parse(JSON.stringify(this.dataPersonal));
            this.consultarServiciosPorPersonal(this.citaEditar.servicios[0]);
        }
        else {
            // Si es servicio de paquete se consulta los personales que pueden realizar el servicio porque no se puede cambiar el servicio
            this.citaEditar.servicios[0].esDePaquete = true;
            this.citaEditar.servicios[0].listadoServicios = JSON.parse(JSON.stringify(this.dataServicios));
            this.citaEditar.servicios[0].listadoServiciosBuffer = JSON.parse(JSON.stringify(this.dataServicios));
            this.consultarPersonalesPorServicio(this.citaEditar.servicios[0]);
        }

        // Servicios restantes
        var j = 1;
        for (var i = 0; i < this.calendario.clickedEvent.citasRelacionadas.length; i++) {
            if (this.calendario.clickedEvent.citasRelacionadas[i].estatus != 4) {

                var personal = null;
                for (var k = 0; k < this.dataPersonal.length; k++) {
                    if (this.dataPersonal[k].idPersonal == this.calendario.clickedEvent.citasRelacionadas[i].cita.idPersonal) {
                        personal = this.dataPersonal[k].idPersonal;
                        break;
                    }
                }

                this.citaEditar.servicios.push({
                    id: this.citaEditar.servicios.length,
                    servicio: this.calendario.clickedEvent.citasRelacionadas[i].cita.idServicio,
                    personal: personal,
                    listadoPersonales: [],
                    listadoServicios: [],
                    listadoServiciosBuffer: [],
                    filterBy: null,
                    inicio: this.calendario.clickedEvent.citasRelacionadas[i].horaInicio,
                    fin: this.calendario.clickedEvent.end.format("HH:mm"),
                    duracion: this.calendario.clickedEvent.citasRelacionadas[i].cita.duracion,
                    esDePaquete: false,
                    idPaqueteSucursalCliente: this.calendario.clickedEvent.citasRelacionadas[i].cita.idPaqueteSucursalCliente,
                    idPaqueteSucursalClienteServicio: this.calendario.clickedEvent.citasRelacionadas[i].cita.idPaqueteSucursalClienteServicio,
                    idPagoClienteDetalle: this.calendario.clickedEvent.citasRelacionadas[i].cita.idPagoClienteDetalle,
                    montoTotalPagoPaypal: this.calendario.clickedEvent.citasRelacionadas[i].cita.montoTotalPagoPaypal
                });

                if (this.citaEditar.servicios[j].idPaqueteSucursalCliente == null) {
                    // Se consultan los servicios que puede realizar el personal
                    this.citaEditar.servicios[j].listadoPersonales = JSON.parse(JSON.stringify(this.dataPersonal));
                    this.consultarServiciosPorPersonal(this.citaEditar.servicios[j]);
                }
                else {
                    // Si es servicio de paquete se consulta los personales que pueden realizar el servicio porque no se puede cambiar el servicio
                    this.citaEditar.servicios[j].esDePaquete = true;
                    this.citaEditar.servicios[j].listadoServicios = JSON.parse(JSON.stringify(this.dataServicios));
                    this.citaEditar.servicios[j].listadoServiciosBuffer = JSON.parse(JSON.stringify(this.dataServicios));
                    this.consultarPersonalesPorServicio(this.citaEditar.servicios[j]);
                }

                j++;
            }
        }

        //Ordenar por hora los servicios
        this.citaEditar.servicios.sort(function (a: any, b: any) {
            if (a.inicio < b.inicio) {
                return -1;
            }
            else if (a.inicio > b.inicio) {
                return 1;
            }
            else {
                return 0;
            }
        });

        this.citaEditar.hora = JSON.parse(JSON.stringify(this.citaEditar.servicios[0].inicio));

        if(this.citaEditar.cabina){
            var params: any = {};
            params.idCabina = this.citaEditar.cabina;

            this._backService.HttpPost("procesos/agenda/Agenda/consultarServiciosPersonalCabina", {}, params).subscribe((response: string) => {

                var dataTemp = eval(response)
                this.cabina.servicios = dataTemp[0];
                this.cabina.serviciosBuffer = JSON.parse(JSON.stringify(this.cabina.servicios));
                this.cabina.personales = dataTemp[1];

                if(this.cabina.servicios.length == 0){
                    this.cabina.servicios = this.dataServicios;
                    this.cabina.serviciosBuffer = JSON.parse(JSON.stringify(this.cabina.servicios));
                }

                if(this.cabina.personales.length == 0){
                    this.cabina.personales = this.dataPersonal;
                }

                for (var i = 0; i < this.citaEditar.servicios.length; i++) {
                    var band = false;
                    for (var j = 0; j < this.cabina.servicios.length; j++) {
                        if(this.cabina.servicios[j].idServicio == this.citaEditar.servicios[i].servicio){
                            band = true;
                        }
                    }
                    if(!band){
                        this.citaEditar.servicios[i].servicio = null;
                    }
                }

                for (var i = 0; i < this.citaEditar.servicios.length; i++) {
                    var band = false;
                    for (var j = 0; j < this.cabina.personales.length; j++) {
                        if(this.cabina.personales[j].idPersonal == this.citaEditar.servicios[i].personal){
                            band = true;
                        }
                    }
                    if(!band){
                        this.citaEditar.servicios[i].personal = null;
                    }
                }

                this.mostrarModalEditarCita();
                this._pantallaServicio.ocultarSpinner();

            }, error => {
                this._router.navigate(['/login']);
            });
        }
        else{
            this.mostrarModalEditarCita();
            this._pantallaServicio.ocultarSpinner();
        }

    }

    cambiarEstatusCita(){
        if(this.calendario.clickedEvent.estatus == 1 || this.calendario.clickedEvent.estatus == 2 || this.calendario.clickedEvent.estatus == 5){
            this.cambiarCitaEstatus();
        }
        else{
            if(this.calendario.clickedEvent.estatus == 3){
                this.terminarCita();
            }
            else{
                if(this.calendario.clickedEvent.estatus == 4){
                    if(!this.calendario.clickedEvent.citaPrepagada){
                        if (this.calendario.clickedEvent.esUnicoServicio){
                            this.mostrarModalCancelarCita(this.agendaTranslate.cancelarCitaSeguro);
                        }
                        else{
                            this.mostrarModalCancelarServicio(this.agendaTranslate.cancelarServicio);
                        }
                    }
                    else{
                        $(".fc-timegrid-event").popover('hide');
                        this._toaster.error("No se puede cancelar la cita debido a que un servicio fue pagado con paypal");
                    }
                }
                else{
                    if(this.calendario.clickedEvent.estatus == 6){
                        if(!this.calendario.clickedEvent.citaPrepagada){
                            this.cambiarEstatusNoAsistio();
                        }
                        else{
                            $(".fc-timegrid-event").popover('hide');
                            this._toaster.error("No se puede cambiar el estatus de la cita debido a que un servicio fue pagado con paypal");
                        }
                    }
                }
            }
        }
    }


    // ------------------------------------------------------------------- CITA NUEVA -------------------------------------------------------------------
    mostrarModalNuevaCita(){
        this.cita.vista = 1;

        //Tabs
        var liTabs = $("#cita-tabs").children("li");
        liTabs.removeClass("active");
        liTabs.first().addClass("active");

        //Contenido de los tabs
        var contentTabs = $("#content-tabs-cita").children(".tab-pane");
        contentTabs.removeClass("active in");
        contentTabs.first().addClass("active in");

        this.modales.modalNuevaCita.show();
    }

    cerrarModalNuevaCita(){
        if (this.navegador.movil) {
            $("body").css("overflow-x", "auto");
            $("body").css("overflow-y", "auto");
        }
    }

    cambiarVistaCita(v: any) {
        this.cita.vista = v;
    }

    calcularHorasDisponiblesEnCita(){

        var horaInicio = "";
        var horaFin = "";

        var horaInicioMenor = "24:00:00";
        var horaFinMayor = "00:00:00";

        var horaInicioEnMinutos = 0;
        var horaFinEnMinutos = 0;

        var horaInicioMenorEnMinutos = 1440;
        var horaFinMayorEnMinutos = 0;

        for (var i = 0; i < this.horarioPersonales.length; i++) {
            var elem = this.horarioPersonales[i];

            var dia = moment(JSON.parse(JSON.stringify(this.cita.fecha))).isoWeekday();

            if (elem.dia == dia && !elem.esDescanso) {
                horaInicio = elem.horaInicio.split(':');
                horaFin = elem.horaFin.split(':');

                horaInicioEnMinutos = (Number(horaInicio[0]) * 60) + Number(horaInicio[1]);
                horaFinEnMinutos = (Number(horaFin[0]) * 60) + Number(horaFin[1]);

                if (horaInicioEnMinutos < horaInicioMenorEnMinutos) {
                    horaInicioMenorEnMinutos = horaInicioEnMinutos;
                    horaInicioMenor = elem.horaInicio;
                }

                if (horaFinEnMinutos > horaFinMayorEnMinutos) {
                    horaFinMayorEnMinutos = horaFinEnMinutos;
                    horaFinMayor = elem.horaFin;
                }
            }
        }

        if(horaFinMayor == "23:59:00"){
            horaFinMayor = "24:00:00"
        }

        // Calcular los minutos para cuando la hora inicio o fin empiezan en un horario no multiplo de 15
        var minutosValidosInicio: any = horaInicioMenor.split(':')[1];
        if (minutosValidosInicio >= 0 && minutosValidosInicio < 15) {
            minutosValidosInicio = 0;
        }
        else if (minutosValidosInicio >= 15 && minutosValidosInicio < 30) {
            minutosValidosInicio = 15;
        }
        else if (minutosValidosInicio >= 30 && minutosValidosInicio < 45) {
            minutosValidosInicio = 30;
        }
        else if (minutosValidosInicio >= 45) {
            minutosValidosInicio = 45;
        }

        var minutosValidosFin: any = horaFinMayor.split(':')[1];
        if (minutosValidosFin >= 0 && minutosValidosFin < 15) {
            minutosValidosFin = 0;
        }
        else if (minutosValidosFin >= 15 && minutosValidosFin < 30) {
            minutosValidosFin = 15;
        }
        else if (minutosValidosFin >= 30 && minutosValidosFin < 45) {
            minutosValidosFin = 30;
        }
        else if (minutosValidosFin >= 45) {
            minutosValidosFin = 45;
        }

        var fechaCitaHoraInicio = (horaInicioMenor.split(':')[0] + ':' + (minutosValidosInicio < 10 ? '0' + minutosValidosInicio : minutosValidosInicio) + ':00').split(':');
        var fechaCitaHoraFin = (horaFinMayor.split(':')[0] + ':' + (minutosValidosFin < 10 ? '0' + minutosValidosFin : minutosValidosFin) + ':00').split(':');

        var inicio = moment().startOf("day");
        inicio.set({ "hour": Number(fechaCitaHoraInicio[0]), "minute": Number(fechaCitaHoraInicio[1]), "milliseconds": 0 });
        var fin = moment().endOf("day");
        fin.set({ "hour": Number(fechaCitaHoraFin[0]), "minute": Number(fechaCitaHoraFin[1]), "milliseconds": 0 })

        this.cita.listadoHoras = [];
        if (!this.navegador.movil) {
            for(inicio; inicio < fin ; inicio.add(5, "m")){
                this.cita.listadoHoras.push(inicio.format("HH:mm"));
            }
        }
        else {
            for(inicio; inicio < fin ; inicio.add(15, "m")){
                this.cita.listadoHoras.push(inicio.format("HH:mm"));
            }
        }
    }

    cambiarPestaniaNuevaCita(ev:any){
        if(ev.index == 1){
            this.paqueteSucursal_agendar_consultarPaqueteSucursalCliente();
        }
    }

    // ---- CLIENTE ----
    mostrarNuevoCliente(){
        this.cita.cliente = null;
        this.cita.esClienteNuevo = true;

        this.cita.clienteNuevo = {};
        this.cita.clienteNuevo.nacimiento = null;

        this.paqueteSucursal_agendar_removerServiciosPaqueteSucursal();

        this.referencia.id_referencia = null;
        this.deshabilitarReferencia = false;
    }

    ocultarNuevoCliente(){
        this.cita.cliente = null;
        this.cita.esClienteNuevo = false;

        this.cita.clienteNuevo = {};
        this.referencia.id_referencia = null;
        this.deshabilitarReferencia = false;
    }

    cambiarCliente(c: any) {
        if (c.idCliente == -1) {
            c.idCliente = "";

            this.referencia.id_referencia = null;
            this.deshabilitarReferencia = false;
        }
        else {
            this.cita.clienteInfo = c;

            this.paqueteSucursal.agendar.primeraCarga = true;
            this.paqueteSucursal.agendar.dataPaqueteSucursalCliente = [];
            this.paqueteSucursal_agendar_removerServiciosPaqueteSucursal();

            this.consultaReferenciaAgendaCliente();
        }
    }

    filtroClienteNuevo(){
        //var aux = this.cita.clienteNuevo.nombre.split("-");
        this.cita.clienteNuevo.nombre; //= aux[0];

        this.dataClienteBuscador = this.dataClienteBuscadorOriginal.filter(
            (eti: any) => {
                if (eti.toUpperCase().match(this.cita.clienteNuevo.nombre.toUpperCase()) != null) {
                    return eti;
                }
            }
        );
    }

    // ---- CABINA ----
    cambiarCabina(){

        //Se quita los servicios del paquete
        if(this.paqueteSucursal.agendar.dataPaqueteSucursalCliente){
            for (var i = 0; i < this.cita.servicios.length; i++) {
                for (var j = 0; j < this.paqueteSucursal.agendar.dataPaqueteSucursalCliente.length; j++) {
                    if(this.paqueteSucursal.agendar.dataPaqueteSucursalCliente[j].idPaqueteSucursalCliente == this.cita.servicios[i].idPaqueteSucursalCliente){
                        for (var k = 0; k < this.paqueteSucursal.agendar.dataPaqueteSucursalCliente[j].servicios.length; k++) {
                            if(this.paqueteSucursal.agendar.dataPaqueteSucursalCliente[j].servicios[k].idServicio == this.cita.servicios[i].servicio){
                                this.paqueteSucursal.agendar.dataPaqueteSucursalCliente[j].servicios[k].cantServicioRealizado--;
                            }
                        }
                    }
                }
            }
        }

        this.cita.servicios = [];
        this.cita.servicios = [{
            servicio: null,
            personal: null,
            id: 0,
            listadoPersonales: this.dataPersonal,
            listadoServicios: this.dataServicios,
            listadoServiciosBuffer: JSON.parse(JSON.stringify(this.dataServicios)),
            filterBy: null,
            esDePaquete: false
        }];

        if(this.cita.cabina){
            this.consultarServiciosPersonalCabina();
        }

    }

    consultarServiciosPersonalCabina(){
        this._pantallaServicio.mostrarSpinner();
        var params = {
            idCabina: this.cita.cabina
        }
        this._backService.HttpPost("procesos/agenda/Agenda/consultarServiciosPersonalCabina", {}, params).subscribe((response: string) => {
            var dataTemp = eval(response)
            this.cabina.servicios = dataTemp[0];
            this.cabina.serviciosBuffer = JSON.parse(JSON.stringify(this.cabina.servicios));
            this.cabina.personales = dataTemp[1];

            if(this.cabina.servicios.length == 0){
                this.cabina.servicios = this.dataServicios;
                this.cabina.serviciosBuffer = JSON.parse(JSON.stringify(this.cabina.servicios));
            }

            if(this.cabina.personales.length == 0){
                this.cabina.personales = this.dataPersonal;
            }

            this._pantallaServicio.ocultarSpinner();

        }, error => {
            this._router.navigate(['/login']);
        });
    }

    // ---- SERVICIOS ----
    agregarServicio(){
        $("#personal-modal-" + (this.cita.servicios.length - 1)).removeClass("errorCampo");
        $("#servicio-modal-" + (this.cita.servicios.length - 1)).removeClass("errorCampo");

        if (this.cita.servicios.length < 10 && this.cita.servicios[this.cita.servicios.length - 1].personal && this.cita.servicios[this.cita.servicios.length - 1].servicio) {
            this.cita.servicios.push({
                servicio: null,
                personal: null,
                id: this.cita.servicios.length,
                listadoPersonales: this.dataPersonal,
                listadoServicios: this.dataServicios,
                listadoServiciosBuffer: JSON.parse(JSON.stringify(this.dataServicios)),
                filterBy: null,
                esDePaquete: false
            });
        }
        else {
            if (this.cita.cabina) {
                if (this.cita.servicios.length < 10 && this.cita.servicios[this.cita.servicios.length - 1].servicio) {
                    this.cita.servicios.push({
                        servicio: null,
                        personal: null,
                        id: this.cita.servicios.length,
                        listadoPersonales: this.dataPersonal,
                        listadoServicios: this.dataServicios,
                        listadoServiciosBuffer: JSON.parse(JSON.stringify(this.dataServicios)),
                        filterBy: null,
                        esDePaquete: false
                    });
                }
                else {
                    if (!this.cita.servicios[this.cita.servicios.length - 1].servicio) {
                        $("#servicio-modal-" + (this.cita.servicios.length - 1)).addClass("errorCampo");
                    }
                }
            }
            else {
                if (!this.cita.servicios[this.cita.servicios.length - 1].personal) {
                    $("#personal-modal-" + (this.cita.servicios.length - 1)).addClass("errorCampo");
                }
                if (!this.cita.servicios[this.cita.servicios.length - 1].servicio) {
                    $("#servicio-modal-" + (this.cita.servicios.length - 1)).addClass("errorCampo");
                }
            }

        }
    }

    removerServicio(s: any) {
        if (s.esDePaquete) {
            for (var j = 0; j < this.paqueteSucursal.agendar.dataPaqueteSucursalCliente.length; j++) {
                if(this.paqueteSucursal.agendar.dataPaqueteSucursalCliente[j].idPaqueteSucursalCliente == s.idPaqueteSucursalCliente){
                    for (var k = 0; k < this.paqueteSucursal.agendar.dataPaqueteSucursalCliente[j].servicios.length; k++) {
                        if(this.paqueteSucursal.agendar.dataPaqueteSucursalCliente[j].servicios[k].idServicio == s.servicio){
                            this.paqueteSucursal.agendar.dataPaqueteSucursalCliente[j].servicios[k].cantServicioRealizado--;
                        }
                    }
                }
            }
        }

        this.cita.servicios.splice(s.id, 1);

        for (var i = 0; i < this.cita.servicios.length; i++) {
            this.cita.servicios[i].id = i;
        }

        for(var i = 0; i < this.cita.servicios.length; i++){
            if(this.cita.servicios[i].esDePaquete){
                this.cita.ocultarBotonRecurrencia = true;
                this.cita.recurrencia = false;
                this.limpiarRecurrencia();
                i = this.cita.servicios.length;
            }
        }
    }

    consultarServiciosPorPersonal(s: any) {
        if (!s.esDePaquete) {
            var params: any = {};
            params.idPersonal = s.personal;
            params.idCita = null;

            this._backService.HttpPost("procesos/agenda/Agenda/selectServicioCita", {}, params).subscribe((response: string) => {
                s.listadoServicios = eval(response);
                s.listadoServiciosBuffer = eval(response);
            }, error => {
                this._router.navigate(['/login']);
            });
        }
    }

    consultarPersonalesPorServicio(s: any) {
        for (var i = 0; i < this.dataServicios.length; i++) {
            if (s.servicio == this.dataServicios[i].idServicio) {
                s.duracion = this.dataServicios[i].duracion;
                break;
            }
        }

        var params: any = {};
        params.idServicio = s.servicio;
        this._backService.HttpPost("procesos/agenda/Agenda/selectPersonal", {}, params).subscribe((response: string) => {
            s.listadoPersonales = eval(response);
        }, error => {
            this._router.navigate(['/login']);
        });
    }

    getDuracionServicioCabina(s: any){
        for (var i = 0; i < this.dataServicios.length; i++) {
            if (s.servicio == this.dataServicios[i].idServicio) {
                s.duracion = this.dataServicios[i].duracion;
                break;
            }
        }
    }

    // ---- RECURRENCIA ----
    mostrarRecurrencia(){
        if(this.cita.recurrencia){
            this.limpiarRecurrencia();
        }
    }

    limpiarRecurrencia(){
        this.cita.rFrecuencia = null;
        this.cita.rRepeticion = null;

        var d: any = moment(JSON.parse(JSON.stringify(this.cita.fecha)));
        this.cita.rFechaInicio = d.clone().format("YYYY-MM-DDTHH:mm:ssZ").substring(0, 10);
        d.add(1, "M");
        this.cita.rFechaFin = d.clone().format("YYYY-MM-DDTHH:mm:ssZ").substring(0, 10);

        this.recurrencia = {};
        this.recurrencia.lun = false;
        this.recurrencia.mar = false;
        this.recurrencia.mie = false;
        this.recurrencia.jue = false;
        this.recurrencia.vie = false;
        this.recurrencia.sab = false;
        this.recurrencia.dom = false;

        this.recurrencia.fechaInicio = JSON.parse(JSON.stringify(this.cita.fecha));
        this.recurrencia.fechaFin = moment(this.cita.fecha).add(1, 'd');

        this.traducion.frecuencia = "";
    }

    ajustarFechaRecurrencia(){
        if (this.cita.fecha) {
            if (this.cita.recurrencia) {
                this.limpiarRecurrencia();
            }
        }
    }

    obtenerRepeticiones(ev: any) {
        var frecuencia: any = ev.name;
        this.cita.rRepeticion = null;

        if (frecuencia == this.agendaTranslate.diaria) {
            this.recurrencias.repeticiones = this.recurrencias.repeticionDiaria;
            this.traducion.frecuencia = 'Diaria';
        }
        else {
            if (frecuencia == this.agendaTranslate.semanal) {
                this.recurrencias.repeticiones = this.recurrencias.repeticionSemanal;
                this.traducion.frecuencia = 'Semanal';
            }
            else{
                if (frecuencia == this.agendaTranslate.Mensual) {
                    this.recurrencias.repeticiones = this.recurrencias.repeticionMensual;
                    this.traducion.frecuencia = 'Mensual';
                }
            }
        }
    }

    marcarDiaRecurrencia(day: any) {
        switch (day) {
            case 1:
                this.recurrencia.lun = !this.recurrencia.lun;
                if (this.recurrencia.lun) {
                    var docElemLunes: any = document.getElementById("modal-lun");
                    docElemLunes.children[0].children[0].style.color = "#FFFFFF"
                    docElemLunes.children[0].children[0].style.background = "#20c4e6"
                }
                else {
                    var docElemLunes: any = document.getElementById("modal-lun");
                    docElemLunes.children[0].children[0].style.color = ""
                    docElemLunes.children[0].children[0].style.background = ""
                }
                break;
            case 2:
                this.recurrencia.mar = !this.recurrencia.mar;
                if (this.recurrencia.mar) {
                    var docElemMartes: any = document.getElementById("modal-mar");
                    docElemMartes.children[0].children[0].style.color = "#FFFFFF"
                    docElemMartes.children[0].children[0].style.background = "#20c4e6"
                }
                else {
                    var docElemMartes: any = document.getElementById("modal-mar");
                    docElemMartes.children[0].children[0].style.color = ""
                    docElemMartes.children[0].children[0].style.background = ""
                }
                break;
            case 3:
                this.recurrencia.mie = !this.recurrencia.mie;
                if (this.recurrencia.mie) {
                    var docElemMiercoles: any = document.getElementById("modal-mie");
                    docElemMiercoles.children[0].children[0].style.color = "#FFFFFF"
                    docElemMiercoles.children[0].children[0].style.background = "#20c4e6"
                }
                else {
                    var docElemMiercoles: any = document.getElementById("modal-mie");
                    docElemMiercoles.children[0].children[0].style.color = ""
                    docElemMiercoles.children[0].children[0].style.background = ""
                }
                break;
            case 4:
                this.recurrencia.jue = !this.recurrencia.jue;
                if (this.recurrencia.jue) {
                    var docElemJueves: any = document.getElementById("modal-jue");
                    docElemJueves.children[0].children[0].style.color = "#FFFFFF"
                    docElemJueves.children[0].children[0].style.background = "#20c4e6"
                }
                else {
                    var docElemJueves: any = document.getElementById("modal-jue");
                    docElemJueves.children[0].children[0].style.color = ""
                    docElemJueves.children[0].children[0].style.background = ""
                }
                break;
            case 5:
                this.recurrencia.vie = !this.recurrencia.vie;
                if (this.recurrencia.vie) {
                    var docElemViernes: any = document.getElementById("modal-vie");
                    docElemViernes.children[0].children[0].style.color = "#FFFFFF"
                    docElemViernes.children[0].children[0].style.background = "#20c4e6"
                }
                else {
                    var docElemViernes: any = document.getElementById("modal-vie");
                    docElemViernes.children[0].children[0].style.color = ""
                    docElemViernes.children[0].children[0].style.background = ""
                }
                break;
            case 6:
                this.recurrencia.sab = !this.recurrencia.sab;
                if (this.recurrencia.sab) {
                    var docElemSabado: any = document.getElementById("modal-sab");
                    docElemSabado.children[0].children[0].style.color = "#FFFFFF"
                    docElemSabado.children[0].children[0].style.background = "#20c4e6"
                }
                else {
                    var docElemSabado: any = document.getElementById("modal-sab");
                    docElemSabado.children[0].children[0].style.color = ""
                    docElemSabado.children[0].children[0].style.background = ""
                }
                break;
            case 7:
                this.recurrencia.dom = !this.recurrencia.dom;
                if (this.recurrencia.dom) {
                    var docElemDomingo: any = document.getElementById("modal-dom");
                    docElemDomingo.children[0].children[0].style.color = "#FFFFFF"
                    docElemDomingo.children[0].children[0].style.background = "#20c4e6"
                }
                else {
                    var docElemDomingo: any = document.getElementById("modal-dom");
                    docElemDomingo.children[0].children[0].style.color = ""
                    docElemDomingo.children[0].children[0].style.background = ""
                }
                break;
        }
    }

    // ---- PAQUETE ----
    paqueteSucursal_agendar_consultarPaqueteSucursalCliente(){

        if (this.paqueteSucursal.agendar.primeraCarga) {

            var params: any = {};
            params.idCliente = this.cita.cliente;

            this.paqueteSucursal.agendar.dataPaqueteSucursalCliente = [];

            this._backService.HttpPost("procesos/agenda/Agenda/consultarPaqueteSucursalCliente", {}, params).subscribe((response: string) => {
                var data = eval(response);
                var idPaqueteSucursalCliente = 0;
                var i = 0;
                var paquete = 0;

                while (i < data.length) {
                    if (idPaqueteSucursalCliente != data[i].idPaqueteSucursalCliente) {
                        paquete++;

                        idPaqueteSucursalCliente = data[i].idPaqueteSucursalCliente;
                        this.paqueteSucursal.agendar.dataPaqueteSucursalCliente[paquete - 1] = {};

                        this.paqueteSucursal.agendar.dataPaqueteSucursalCliente[paquete - 1].idPaqueteSucursal = data[i].idPaqueteSucursal;
                        this.paqueteSucursal.agendar.dataPaqueteSucursalCliente[paquete - 1].nombrePaqueteSucursal = data[i].nombrePaqueteSucursal;
                        this.paqueteSucursal.agendar.dataPaqueteSucursalCliente[paquete - 1].idPaqueteSucursalCliente = data[i].idPaqueteSucursalCliente;
                        this.paqueteSucursal.agendar.dataPaqueteSucursalCliente[paquete - 1].fechaVigencia = data[i].fechaVigencia;
                        this.paqueteSucursal.agendar.dataPaqueteSucursalCliente[paquete - 1].servicios = [];
                        this.paqueteSucursal.agendar.dataPaqueteSucursalCliente[paquete - 1].productos = [];

                        if (data[i].tipo == "Servicio") {
                            this.paqueteSucursal.agendar.dataPaqueteSucursalCliente[paquete - 1].servicios.push({
                                idServicio: data[i].idServicioProducto,
                                nombreServicio: data[i].nombreServicioProducto,
                                cantServicio: data[i].cantServicioProducto,
                                cantServicioRealizado: data[i].cantServicioProductoRealizado,
                                idPaqueteSucursalClienteServicio: data[i].idPaqueteSucursalClienteServProd
                            });
                        }
                        if (data[i].tipo == "Producto") {
                            this.paqueteSucursal.agendar.dataPaqueteSucursalCliente[paquete - 1].productos.push({
                                idProducto: data[i].idServicioProducto,
                                nombreProducto: data[i].nombreServicioProducto,
                                cantProducto: data[i].cantServicioProducto,
                                cantProductoRealizado: data[i].cantServicioProductoRealizado,
                                idPaqueteSucursalClienteProducto: data[i].idPaqueteSucursalClienteServProd
                            });
                        }

                    }
                    else {

                        if (data[i].tipo == "Servicio") {
                            this.paqueteSucursal.agendar.dataPaqueteSucursalCliente[paquete - 1].servicios.push({
                                idServicio: data[i].idServicioProducto,
                                nombreServicio: data[i].nombreServicioProducto,
                                cantServicio: data[i].cantServicioProducto,
                                cantServicioRealizado: data[i].cantServicioProductoRealizado,
                                idPaqueteSucursalClienteServicio: data[i].idPaqueteSucursalClienteServProd
                            });
                        }
                        if (data[i].tipo == "Producto") {
                            this.paqueteSucursal.agendar.dataPaqueteSucursalCliente[paquete - 1].productos.push({
                                idProducto: data[i].idServicioProducto,
                                nombreProducto: data[i].nombreServicioProducto,
                                cantProducto: data[i].cantServicioProducto,
                                cantProductoRealizado: data[i].cantServicioProductoRealizado,
                                idPaqueteSucursalClienteProducto: data[i].idPaqueteSucursalClienteServProd
                            });
                        }

                    }
                    i++;
                }

                this.paqueteSucursal.agendar.primeraCarga = false;
            }, error => {
                this._router.navigate(['/login']);
            });
        }

    }

    paqueteSucursal_agendar_agendarServiciosPaqueteSucursalCliente(dps: any) {
        if (this.cita.servicios.length == 1){
            if (!this.cita.servicios[0].esDePaquete && (this.cita.servicios[0].personal == null && this.cita.servicios[0].servicio == null)) {
                this.cita.servicios = [];
            }
        }

        var serviciosDisp = 0;
        for (var i = 0; i < dps.servicios.length; i++) {
            if (dps.servicios[i].cantServicio != dps.servicios[i].cantServicioRealizado) {
                serviciosDisp++;
            }
        }

        if ((this.cita.servicios.length + serviciosDisp) < 10) {
            for (var i = 0; i < dps.servicios.length; i++) {
                if (dps.servicios[i].cantServicio != dps.servicios[i].cantServicioRealizado) {

                    if(this.cita.cabina){

                        var estaEnCabina = false;

                        for (var s = 0; s < this.cabina.servicios.length; s++) {
                            if(dps.servicios[i].idServicio == this.cabina.servicios[s].idServicio){
                                estaEnCabina = true;
                            }
                        }

                        if(estaEnCabina){
                            this.cita.servicios.push({
                                servicio: dps.servicios[i].idServicio,
                                personal: null,
                                id: this.cita.servicios.length,
                                listadoPersonales: null,
                                listadoServicios: this.dataServicios,
                                listadoServiciosBuffer: JSON.parse(JSON.stringify(this.dataServicios)),
                                filterBy: 1,
                                esDePaquete: true,
                                idPaqueteSucursalCliente: dps.idPaqueteSucursalCliente,
                                idPaqueteSucursalClienteServicio: dps.servicios[i].idPaqueteSucursalClienteServicio
                            });
                            for (var j = 0; j < this.dataServicios.length; j++) {
                                if (dps.servicios[i].idServicio == this.dataServicios[j].idServicio) {
                                    this.cita.servicios[this.cita.servicios.length - 1].duracion = this.dataServicios[j].duracion;
                                    break;
                                }
                            }
                            this.paqueteSucursal_agendar_cargarPersonalServicio(dps.servicios[i].idServicio, (this.cita.servicios.length - 1));
                            dps.servicios[i].cantServicioRealizado++;
                        }

                    }
                    else{

                        this.cita.servicios.push({
                            servicio: dps.servicios[i].idServicio,
                            personal: null,
                            id: this.cita.servicios.length,
                            listadoPersonales: null,
                            listadoServicios: this.dataServicios,
                            listadoServiciosBuffer: JSON.parse(JSON.stringify(this.dataServicios)),
                            filterBy: 1,
                            esDePaquete: true,
                            idPaqueteSucursalCliente: dps.idPaqueteSucursalCliente,
                            idPaqueteSucursalClienteServicio: dps.servicios[i].idPaqueteSucursalClienteServicio
                        });
                        for (var j = 0; j < this.dataServicios.length; j++) {
                            if (dps.servicios[i].idServicio == this.dataServicios[j].idServicio) {
                                this.cita.servicios[this.cita.servicios.length - 1].duracion = this.dataServicios[j].duracion;
                                break;
                            }
                        }
                        this.paqueteSucursal_agendar_cargarPersonalServicio(dps.servicios[i].idServicio, (this.cita.servicios.length - 1));
                        dps.servicios[i].cantServicioRealizado++;

                    }

                }
            }

            if(this.cita.servicios.length == 0){
                this.cita.servicios = [{
                    servicio: null,
                    personal: null,
                    id: 0,
                    listadoPersonales: this.dataPersonal,
                    listadoServicios: this.dataServicios,
                    listadoServiciosBuffer: JSON.parse(JSON.stringify(this.dataServicios)),
                    filterBy: null,
                    esDePaquete: false
                }];
            }
            else{
                for(var i = 0; i < this.cita.servicios.length; i++){
                    if(this.cita.servicios[i].esDePaquete){
                        this.cita.ocultarBotonRecurrencia = true;
                        this.cita.recurrencia = false;
                        this.limpiarRecurrencia();
                        i = this.cita.servicios.length;
                    }
                }
            }

            this.cita.vista = 1;

            //Tabs
            var liTabs = $("#cita-tabs").children("li");
            liTabs.removeClass("active");
            liTabs.first().addClass("active");

            //Contenido de los tabs
            var contentTabs = $("#content-tabs-cita").children(".tab-pane");
            contentTabs.removeClass("active in");
            contentTabs.first().addClass("active in");

            this.tab.selectedIndex = 0;
        }
        else {
            if (this.cita.servicios.length > 10) {
                this._toaster.error(this.agendaTranslate.noAgregar3Servicios);
            }
        }
    }

    paqueteSucursal_agendar_cargarPersonalServicio(idServicio: any, index: any) {
        var params: any = {};
        params.idServicio = idServicio;
        this._backService.HttpPost("procesos/agenda/Agenda/selectPersonal", {}, params).subscribe((response: string) => {
            this.cita.servicios[index].listadoPersonales = eval(response);
        }, error => {
            this._router.navigate(['/login']);
        });
    }

    paqueteSucursal_agendar_removerServiciosPaqueteSucursal(){
        this.paqueteSucursal.agendar.dataPaqueteSucursalCliente = [];

        for (var i = 0; i < this.cita.servicios.length; i++) {
            if (this.cita.servicios[i].esDePaquete) {
                this.cita.servicios.splice(i, 1);
                i--;
            }
        }
        for (var i = 0; i < this.cita.servicios.length; i++) {
            this.cita.servicios[i].id = i;
        }

        if(this.cita.servicios.length == 0){
            this.cita.servicios.push({
                servicio: null,
                personal: null,
                id: this.cita.servicios.length,
                listadoPersonales: this.dataPersonal,
                listadoServicios: this.dataServicios,
                listadoServiciosBuffer: JSON.parse(JSON.stringify(this.dataServicios)),
                filterBy: null,
                esDePaquete: false
            });
        }

        this.cita.ocultarBotonRecurrencia = false;
    }

    // ---- GUARDAR CITA ----
    agendarCita(){
        this._backService.HttpPost("procesos/agenda/Agenda/correoVerificado", {}, {}).subscribe((response: string) => {
            if (eval(response)) {
                if (this.cita.esClienteNuevo) {
                    this.guardarCliente();
                }
                else {
                    this.guardarCita();
                }
            }
            else {
                this._toaster.error(this.agendaTranslate.paraAgendar);
            }
        }, error => {

        });
    }

    guardarCita(){
        this._pantallaServicio.mostrarSpinner();
        var isValid = true;

        //Se crea una variable con la hora de la cita para un mejor manejo
        var h = this.cita.hora.split(":");
        var hora: any = moment().set({ "hour": Number(h[0]), "minute": Number(h[1]) });

        //Los siguientes 3 if, son validaciones de la pantalla para saber si el cliente, los servicios y las fechas están bien y te deje agenda
        if (!this.cita.cliente) {
            $("#cliente-modal").addClass("errorCampo");
            isValid = false;
        }
        if (!this.validarServicios()) {
            isValid = false;
        }
        var fecha = moment(this.cita.fecha);
        if (!this.cita.fecha) {
            $("#cita-fecha").addClass("errorCampo");
            isValid = false;
        }
        else {
            var fecha = moment(this.cita.fecha);
        }

        //Paramétros y validaciones de la recurrencia
        if (this.cita.recurrencia) {
            if (!this.cita.rFechaInicio) {
                $("#modal-recurrencia-inicio").addClass("errorCampo");
                isValid = false;
            }
            if (!this.cita.rFechaFin) {
                $("#modal-recurrencia-fin").addClass("errorCampo");
                isValid = false;
            }
            if (this.cita.rFechaInicio && this.cita.rFechaFin) {
                var inicioRecurrencia = moment(this.cita.rFechaInicio);
                var finRecurrencia = moment(this.cita.rFechaFin);
                if (finRecurrencia < inicioRecurrencia) {
                    this._toaster.error(this.agendaTranslate.fechaFinMenor);
                    isValid = false;
                }
                else if (inicioRecurrencia < fecha) {
                    this._toaster.error(this.agendaTranslate.fechaInicioMenor);
                    isValid = false;
                }

                var opcRep = 0;
                switch (this.cita.rFrecuencia) {
                    case 1:
                        var opcRep = 1;
                        break;
                    case 2:
                        var opcRep = 7;
                        break;
                    case 3:
                        var opcRep = 30;
                        break;
                }

                var aux1 = finRecurrencia.diff(inicioRecurrencia, 'days');
                var aux2 = opcRep * this.cita.rRepeticion;

                if (aux2 > aux1) {
                    //Verifique que el rango de fechas de la recurrencia sea mayor que la frecuencia escogida
                    this._toaster.error("Verifique que el rango de fechas de la recurrencia sea mayor que la frecuencia escogida");
                    isValid = false;
                }

            }

            if (!this.cita.rFrecuencia) {
                $("#modal-frecuencia").addClass("errorCampo");
                isValid = false;
            }
            if (!this.cita.rRepeticion) {
                $("#modal-repeticion").addClass("errorCampo");
                isValid = false;
            }
            if (!this.recurrencia.lun && !this.recurrencia.mar && !this.recurrencia.mie && !this.recurrencia.jue
                && !this.recurrencia.vie && !this.recurrencia.sab && !this.recurrencia.dom && this.cita.rFrecuencia == 2) {
                this._toaster.error(this.agendaTranslate.seleccioneDiaSemana);
                isValid = false;
            }
        }

        //Si todo lo checado anteriormente es válido, se procede a agenda
        if (isValid) {

            // Variables necesarias para agenda una cita (la mayoría se maneja con arrelgos)
            var params: any = {};
            params.cliente = this.cita.cliente;
            params.fecha = fecha.format("YYYY-MM-DD");
            params.servicios = [];
            params.personal = [];
            params.horaInicioServicio = [];
            params.horaInicio = hora.format("HH:mm");
            var horasServicio = [];
            var horaFinServicios = [];
            var horaFinMayor = hora.clone();

            var personalRepetido = false;

            //For encargado de generar la hora de inicio y fin de los servicios de la cita
            for(var i = 0; i < this.cita.servicios.length; i++) {

                //Variable aux la cual contendrá la hora inicio del servicio actual que a su vez es la hora inicio de la cita
                horasServicio[i] = hora.clone();

                //Se agregan en los parámetros el servicio actual junto con el personal encargado de realizarlo
                params.servicios.push(this.cita.servicios[i].servicio);
                if (this.cita.servicios[i].personal) {
                    params.personal.push(this.cita.servicios[i].personal);
                }
                else {
                    params.personal.push("");
                }

                //En la primera iteración del ciclo no se hace nada
                var indexPersonalRepetido = -1;
                if (i != 0) {

                    if (!this.cita.cabina) {
                        //En las siguientes iteraciones a partir de la segunda, se checará si el personal del servicio actual ya ha sido puesto en otro servicio anterior
                        personalRepetido = false;
                        //El ciclo se recorré desde el ultimo servicio ingresado hasta el primero
                        for (var j = i - 1; j >= 0; j--) {
                            //Si hay un personal con más de un servicio por cita
                            if (this.cita.servicios[i].personal == this.cita.servicios[j].personal) {
                                //se guarda en una variable auxiliar el index del ultimo servicio del personal del servicio actual
                                personalRepetido = true;
                                indexPersonalRepetido = j;
                                j = -1;
                            }
                        }
                        //Si el personal ya había sido puesto en otro servicio anterior
                        if (personalRepetido) {
                            //La hora inicio del servicio actual es igual a la hora de inicio del ultimo servicio del personal más la duración de ese mismo servicio (horaFin del ultimo servicio del personal del servicio actual)
                            horasServicio[i] = horasServicio[indexPersonalRepetido].clone().add(this.cita.servicios[indexPersonalRepetido].duracion, "m");
                        }
                    }
                    else {
                        horasServicio[i] = horasServicio[i - 1].clone().add(this.cita.servicios[i - 1].duracion, "m");
                    }
                }

                // Se agrega a los parámetros la hora inicio del servicio
                params.horaInicioServicio.push(horasServicio[i].format("HH:mm"));

                //La hora fin del servicio es igual a la hora inicio del mismo más su duración
                horaFinServicios.push(horasServicio[i].clone().add(this.cita.servicios[i].duracion, "m"));

                //Si la hora fin del servicio actual es mayor a la horaFin registrada de la cita, se actualiza
                if (horaFinServicios[i] > horaFinMayor) {
                    horaFinMayor = horaFinServicios[i];
                }
            }

            // Se agrega a los parámetros la hora fin de la cita
            params.horaFin = horaFinMayor.format("HH:mm");

            //Valores de recurrencia
            params.recurrencia = this.cita.recurrencia;

            if (this.cita.rFrecuencia == 1) {
                params.frecuencia = "Diaria";
            }
            else {
                if (this.cita.rFrecuencia == 2) {
                    params.frecuencia = "Semanal";
                }
                else {
                    if (this.cita.rFrecuencia == 3) {
                        params.frecuencia = "Mensual";
                    }
                    else {
                        params.frecuencia = null;
                    }
                }
            }

            params.repeticion = params.recurrencia ? this.cita.rRepeticion : null;

            var inicioRecurrencia = moment(this.cita.rFechaInicio);
            var finRecurrencia = moment(this.cita.rFechaFin);

            if (params.frecuencia == "Semanal") {
                if (fecha.isSame(inicioRecurrencia, 'week')) {
                    inicioRecurrencia.add('days', (params.repeticion * 7));
                    params.recInicio = inicioRecurrencia;
                }
            }

            params.recInicio = params.recurrencia ? inicioRecurrencia.format("YYYY-MM-DD") : null;
            params.recFin = params.recurrencia ? finRecurrencia.format("YYYY-MM-DD") : null;

            params.lun = this.recurrencia.lun;
            params.mar = this.recurrencia.mar;
            params.mie = this.recurrencia.mie;
            params.jue = this.recurrencia.jue;
            params.vie = this.recurrencia.vie;
            params.sab = this.recurrencia.sab;
            params.dom = this.recurrencia.dom;

            //valores por default
            params.realizoAlta = null;
            params.idSucursal = null;
            params.origen = "web";
            params.idCita = 0;
            params.confirmada = 1;
            params.idPromocionSucursal = [];
            params.tipoPromocion = [];
            params.valorPromocion = [];
            params.costoTotal = [];
            this.citaParams = params;

            params.paqueteClienteServicio = [];

            for(var i = 0; i < this.cita.servicios.length; i++) {
                if (this.cita.servicios[i].esDePaquete) {
                    params.paqueteClienteServicio[i] = this.cita.servicios[i].idPaqueteSucursalClienteServicio;
                }
                else {
                    params.paqueteClienteServicio[i] = "";
                }
            }

            if (this.cita.cabina) {
                params.idCabina = this.cita.cabina;
            }
            else {
                params.idCabina = "";
            }

            params.idReferencia = this.referencia.id_referencia;

            //Llamada a la función para agenda la cita
            this._backService.HttpPost("procesos/agenda/Agenda/insertCita", {}, params, "text").subscribe((response: string) => {
                this.submitted = false;
                switch (Number(response)) {
                    //Estos son los diferentes resultados que te puede regresar la función de agendar
                    case -1:
                        if (!this.cita.cabina) {
                            this._toaster.error(this.agendaTranslate.personalNoLabora);
                            this._pantallaServicio.ocultarSpinner();
                        }
                        else {
                            this._toaster.error("La Cabina tiene una excepción a esa hora");
                            this._pantallaServicio.ocultarSpinner();
                        }
                        break;

                    case -2:
                        if (!this.cita.cabina) {
                            this._toaster.error(this.agendaTranslate.personalTieneDescanso);
                            this._pantallaServicio.ocultarSpinner();
                        }
                        else {
                            this._toaster.error("La Cabina tiene un descanso a esa hora");
                            this._pantallaServicio.ocultarSpinner();
                        }
                        break;

                    case -3:
                        if (!this.cita.cabina) {
                            this._toaster.error(this.agendaTranslate.horaFueraHorario);
                            this._pantallaServicio.ocultarSpinner();
                        }
                        else {
                            this._toaster.error("La Cabina no labora en esa hora");
                            this._pantallaServicio.ocultarSpinner();
                        }
                        break;

                    case -4:
                        if (!this.cita.cabina) {
                            this._toaster.error(this.agendaTranslate.horaNoDisponible);
                            this._pantallaServicio.ocultarSpinner();
                        }
                        else {
                            this._toaster.error("La Cabina ya cuenta con otra cita");
                            this._pantallaServicio.ocultarSpinner();
                        }
                        break;

                    case -5:
                        this._toaster.error(this.agendaTranslate.equipoNoDisponible);
                        this._pantallaServicio.ocultarSpinner();
                        break;

                    case -6:
                        this._toaster.error('El personal No Labora en el horario seleccionado');
                        this._pantallaServicio.ocultarSpinner();
                        break;

                    case -7:
                        this._toaster.error('El personal tiene un descanso en el horario seleccionado');
                        this._pantallaServicio.ocultarSpinner();
                        break;

                    default:
                        this.cita.cabina = "";
                        this.citaParams.idCita = Number(response);
                        if (this.citaParams.recurrencia) {
                            this.correo_correoCitaRecurrencia(this.citaParams);
                        }
                        else {
                            this.correo_correoCitaNueva(this.citaParams);
                        }

                        this.calendario.idCitaActualizar = Number(response);
                        this.consultarCitaIndividual();
                        this.modales.modalNuevaCita.hide();
                        break;
                }
            }, error => {
                this._router.navigate(['/login']);
            });
        }
        else{
            this._pantallaServicio.ocultarSpinner();
        }
    }

    // ---- GUARDAR CLIENTE ----
    guardarCliente(){
        var isValid = true;

        if (!this.cita.clienteNuevo.nombre) {
            $("#modal-nombre").addClass("errorCampo");
            isValid = false;
        }
        else {
            this.validarNombreModal(this.cita.clienteNuevo.nombre);
        }

        if (this.cita.clienteNuevo.email) {
            this.validarEmailModal(this.cita.clienteNuevo.email);
        }
        else{
            this.validaciones.validEmailModal = true;
            $("#modal-email").removeClass("errorCampo");
        }

        if (this.cita.clienteNuevo.telefono) {
            if(this.cita.clienteNuevo.telefono.length >= 8){
                this.validarTelefonoModal(this.cita.clienteNuevo.telefono);
            }
            else{
                $("#modal-telefono").addClass("errorCampo");
                this.validaciones.validTelefonoModal = false;
                this._toaster.error("Se requiere minimo 8 caracteres en el Telefono");
            }
        }
        else {
            this.validaciones.validTelefonoModal = false;
            $("#modal-telefono").addClass("errorCampo");
        }

        if (this.cita.clienteNuevo.nacimiento != null) {
            if (this.cita.clienteNuevo.nacimiento) {
                $("#idFecha").removeClass("errorCampo");
            }
            else {
                $("#idFecha").addClass("errorCampo");
                isValid = false;
            }
        }
        else {
            $("#idFecha").removeClass("errorCampo");
        }

        if (!(this.validaciones.validNombreModal && this.validaciones.validEmailModal && this.validaciones.validTelefonoModal)) {
            isValid = false;
        }

        if (!this.validarServicios()) {
            isValid = false;
        }

        if (isValid) {

            var params: any = {};
            params.nombre = this.cita.clienteNuevo.nombre;
            params.telefono = this.cita.clienteNuevo.telefono;
            this._backService.HttpPost("catalogos/Cliente/consultarClientes", {}, params).subscribe((response: string) => {
                var datosCliente = eval(response);

                if(datosCliente.length > 0){
                    this._toaster.error("Existe un cliente con el mismo Nombre");
                }
                else{

                    var params: any = {};
                    params.nombre = this.cita.clienteNuevo.nombre;
                    if (this.cita.clienteNuevo.email == undefined || this.cita.clienteNuevo.email == "") {
                        params.email = null;
                    }
                    else {
                        params.email = this.cita.clienteNuevo.email;
                    }
                    params.telefono = this.cita.clienteNuevo.telefono ? this.cita.clienteNuevo.telefono : null;
                    params.nacimiento = this.cita.clienteNuevo.nacimiento ? moment(this.cita.clienteNuevo.nacimiento).format("YYYY-MM-DD") : null;
                    params.idReferencia = this.referencia.id_referencia;

                    this._backService.HttpPost("procesos/agenda/Agenda/insertCliente", {}, params, "text").subscribe((response2: string) => {
                        if (Number(response2) == -1 || Number(response2) == -4) {
                            this._toaster.error(this.agendaTranslate.clienteExiste);
                        }
                        else{
                            if (Number(response2) == -2) {
                                this._toaster.error(this.agendaTranslate.emailRegistrado);
                            }
                            else {

                                // Se actualizan los clientes
                                this.dataClientes.push({
                                    idCliente: parseInt(response),
                                    telefono: this.cita.clienteNuevo.telefono ? JSON.parse(JSON.stringify(this.cita.clienteNuevo.telefono)) : null,
                                    email: this.cita.clienteNuevo.email ? JSON.parse(JSON.stringify(this.cita.clienteNuevo.email)) : null,
                                    nombre: JSON.parse(JSON.stringify(this.cita.clienteNuevo.nombre)),
                                    fechaNacimiento: this.cita.clienteNuevo.nacimiento ? moment(JSON.parse(JSON.stringify(this.cita.clienteNuevo.nacimiento))).format("YYYY-MM-DD") : null,
                                    nombreBuscar: this.cita.clienteNuevo.telefono ? (JSON.parse(JSON.stringify(this.cita.clienteNuevo.nombre)) + " - " + JSON.parse(JSON.stringify(this.cita.clienteNuevo.telefono))) : (JSON.parse(JSON.stringify(this.cita.clienteNuevo.nombre)))
                                });
                                this.rootScope_dataClientes = JSON.parse(JSON.stringify(this.dataClientes));

                                this.dataClienteBuscador.push(this.cita.clienteNuevo.telefono ? (JSON.parse(JSON.stringify(this.cita.clienteNuevo.nombre)) + " - " + JSON.parse(JSON.stringify(this.cita.clienteNuevo.telefono))) : ( JSON.parse(JSON.stringify(this.cita.clienteNuevo.nombre))));
                                this.dataClienteBuscadorBuffer.push(this.cita.clienteNuevo.telefono ? (JSON.parse(JSON.stringify(this.cita.clienteNuevo.nombre)) + " - " + JSON.parse(JSON.stringify(this.cita.clienteNuevo.telefono))) : ( JSON.parse(JSON.stringify(this.cita.clienteNuevo.nombre))));
                                this.dataClienteBuscadorOriginal.push(this.cita.clienteNuevo.telefono ? (JSON.parse(JSON.stringify(this.cita.clienteNuevo.nombre)) + " - " + JSON.parse(JSON.stringify(this.cita.clienteNuevo.telefono))) : ( JSON.parse(JSON.stringify(this.cita.clienteNuevo.nombre))));

                                this.cita.cliente = Number(response2);
                                this.cita.esClienteNuevo = false;
                                this.cita.clienteNuevo = {};

                                this.guardarCita();

                            }
                        }
                    }, error => {
                        this._router.navigate(['/login']);
                    });
                }
            }, error => {

            });
        }
    }

    // ---- VALIDACIONES ----
    validarNombreModal(val: any) {
        var letrasExp = RegExp("^[a-zA-Z áéíóúñÁÉÍÓÚÑüÜ\s]*$");

        if (!letrasExp.test(val)) {
            this.validaciones.validNombreModal = false;
            $("#modal-nombre").addClass("errorCampo");
        }
        else {
            this.validaciones.validNombreModal = true;
            $("#modal-nombre").removeClass("errorCampo");
        }
    }

    validarEmailModal(val: any) {
        var eMailExp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);

        if (!eMailExp.test(val)) {
            this.validaciones.validEmailModal = false;
            $("#modal-email").addClass("errorCampo");
        }
        else {
            this.validaciones.validEmailModal = true;
            $("#modal-email").removeClass("errorCampo");
        }
    }

    validarTelefonoModal(val: any) {
        var telefonoExp = new RegExp("^[0-9 ()+-\sa-zA-Z áéíóúñÁÉÍÓÚÑüÜ\s\r\n]*$");
        var telMovilExp = new RegExp("^[0-9 ()+-\sa-zA-Z áéíóúñÁÉÍÓÚÑüÜ\s\r\n]*$");

        if (telefonoExp.test(val) || telMovilExp.test(val)) {
            this.validaciones.validTelefonoModal = true;
            $("#modal-telefono").removeClass("errorCampo");
        }
        else {
            this.validaciones.validTelefonoModal = false;
            $("#modal-telefono").addClass("errorCampo");
        }
    }

    validarServicios(){
        var isValid = true;
        for(var i = 0; i < this.cita.servicios.length; i++) {
            $("#personal-modal-" + i).removeClass("errorCampo");
            $("#servicio-modal-" + i).removeClass("errorCampo");

            if (!this.cita.servicios[i].servicio) {
                if(!this.cita.cabina){
                    $("#servicio-modal-" + this.cita.servicios[i].id).addClass("errorCampo");
                }
                else{
                    $("#servicio-modal-cabina-" + this.cita.servicios[i].id).addClass("errorCampo");
                }
                isValid = false;
            }

            if(!this.cita.cabina){
                if (!this.cita.servicios[i].personal) {
                    $("#personal-modal-" + this.cita.servicios[i].id).addClass("errorCampo");
                    isValid = false;
                }
            }

        }
        return isValid;
    }

    removerEstiloValidacion(id: any, valor: any){
        if(valor){
            $("#" + id).removeClass("errorCampo");
        }
    }


    // ------------------------------------------------------------------ EDITAR CITA -------------------------------------------------------------------
    mostrarModalEditarCita(){
        this.modales.modalEditarCita.show();
    }

    agregarServicioEditar(){
        if (this.citaEditar.servicios.length < 10 && this.citaEditar.servicios[this.citaEditar.servicios.length - 1].personal && this.citaEditar.servicios[this.citaEditar.servicios.length - 1].servicio) {
            this.citaEditar.servicios.push({
                servicio: null,
                personal: null,
                listadoPersonales: this.dataPersonal,
                listadoServicios: this.dataServicios,
                listadoServiciosBuffer: JSON.parse(JSON.stringify(this.dataServicios)),
                filterBy: null,
                esDePaquete: false,
                idPaqueteSucursalCliente: null,
                idPaqueteSucursalClienteServicio: null,
                idPagoClienteDetalle: null,
                montoTotalPagoPaypal: 0
            });
        }
        else {
            if (!this.citaEditar.servicios[this.citaEditar.servicios.length - 1].personal) {
                $(".editar-personal").last().addClass("errorCampo");
            }
            if (!this.citaEditar.servicios[this.citaEditar.servicios.length - 1].servicio) {
                $(".editar-servicio").last().addClass("errorCampo");
            }
            if (this.citaEditar.servicios.length >= 10) {
                this._toaster.error(this.agendaTranslate.noAgregar3Servicios);
            }
        }
    }

    removerServicioEditar(index: any) {
        this.citaEditar.servicios.splice(index, 1);
    }

    calcularHorasDisponiblesEnEditarCita(){

        var horaInicio = "";
        var horaFin = "";

        var horaInicioMenor = "24:00:00";
        var horaFinMayor = "00:00:00";

        var horaInicioEnMinutos = 0;
        var horaFinEnMinutos = 0;

        var horaInicioMenorEnMinutos = 1440;
        var horaFinMayorEnMinutos = 0;

        for (var i = 0; i < this.horarioPersonales.length; i++) {
            var elem = this.horarioPersonales[i];

            var dia = moment(JSON.parse(JSON.stringify(this.citaEditar.fecha))).isoWeekday();

            if (elem.dia == dia && !elem.esDescanso) {
                horaInicio = elem.horaInicio.split(':');
                horaFin = elem.horaFin.split(':');

                horaInicioEnMinutos = (Number(horaInicio[0]) * 60) + Number(horaInicio[1]);
                horaFinEnMinutos = (Number(horaFin[0]) * 60) + Number(horaFin[1]);

                if (horaInicioEnMinutos < horaInicioMenorEnMinutos) {
                    horaInicioMenorEnMinutos = horaInicioEnMinutos;
                    horaInicioMenor = elem.horaInicio;
                }

                if (horaFinEnMinutos > horaFinMayorEnMinutos) {
                    horaFinMayorEnMinutos = horaFinEnMinutos;
                    horaFinMayor = elem.horaFin;
                }
            }
        }

        if(horaFinMayor == "23:59:00"){
            horaFinMayor = "24:00:00"
        }

        // Calcular los minutos para cuando la hora inicio o fin empiezan en un horario no multiplo de 15
        var minutosValidosInicio = Number(horaInicioMenor.split(':')[1]);
        if (minutosValidosInicio >= 0 && minutosValidosInicio < 15) {
            minutosValidosInicio = 0;
        }
        else if (minutosValidosInicio >= 15 && minutosValidosInicio < 30) {
            minutosValidosInicio = 15;
        }
        else if (minutosValidosInicio >= 30 && minutosValidosInicio < 45) {
            minutosValidosInicio = 30;
        }
        else if (minutosValidosInicio >= 45) {
            minutosValidosInicio = 45;
        }

        var minutosValidosFin = Number(horaFinMayor.split(':')[1]);
        if (minutosValidosFin >= 0 && minutosValidosFin < 15) {
            minutosValidosFin = 0;
        }
        else if (minutosValidosFin >= 15 && minutosValidosFin < 30) {
            minutosValidosFin = 15;
        }
        else if (minutosValidosFin >= 30 && minutosValidosFin < 45) {
            minutosValidosFin = 30;
        }
        else if (minutosValidosFin >= 45) {
            minutosValidosFin = 45;
        }

        var fechaCitaHoraInicio = (horaInicioMenor.split(':')[0] + ':' + (minutosValidosInicio < 10 ? '0' + minutosValidosInicio : minutosValidosInicio) + ':00').split(':');
        var fechaCitaHoraFin = (horaFinMayor.split(':')[0] + ':' + (minutosValidosFin < 10 ? '0' + minutosValidosFin : minutosValidosFin) + ':00').split(':');

        var inicio = moment().startOf("day");
        inicio.set({ "hour": Number(fechaCitaHoraInicio[0]), "minute": Number(fechaCitaHoraInicio[1]), "milliseconds": 0 });
        var fin = moment().endOf("day");
        fin.set({ "hour": Number(fechaCitaHoraFin[0]), "minute": Number(fechaCitaHoraFin[1]), "milliseconds": 0 })

        this.citaEditar.listadoHoras = [];
        if (!this.navegador.movil) {
            for(inicio; inicio < fin ; inicio.add(5, "m")){
                this.citaEditar.listadoHoras.push(inicio.format("HH:mm"));
            }
        }
        else {
            for(inicio; inicio < fin ; inicio.add(15, "m")){
                this.citaEditar.listadoHoras.push(inicio.format("HH:mm"));
            }
        }
    }

    // ---- CABINA ----
    cambiarCabinaEditar(){

        if(this.calendario.clickedEvent.idPersonal > 0 && this.citaEditar.cabina > 0 && (this.calendario.clickedEvent.idCabina > 0) == false){
            for(var i = 0; i < this.citaEditar.servicios.length; i++){
                if(!this.citaEditar.servicios[i].idPagoClienteDetalle){
                    this.citaEditar.servicios.splice(i, 1);
                    i--;
                }
                else{
                    this.citaEditar.servicios[i].servicio = null;
                    this.citaEditar.servicios[i].personal = null;
                    this.citaEditar.servicios[i].listadoPersonales = this.dataPersonal;
                    this.citaEditar.servicios[i].listadoServicios = this.dataServicios;
                    this.citaEditar.servicios[i].listadoServiciosBuffer = JSON.parse(JSON.stringify(this.dataServicios));
                    this.citaEditar.servicios[i].filterBy = null;
                    this.citaEditar.servicios[i].esDePaquete = false;
                    this.citaEditar.servicios[i].idPaqueteSucursalCliente = null;
                    this.citaEditar.servicios[i].idPaqueteSucursalClienteServicio = null;
                }
            }

            var seleccionocabina = true ;
            this._toaster.error("No se puede cambiar de un Personal a Cabina");
            return;
        }

        if(this.calendario.clickedEvent.idCabina > 0 && (this.citaEditar.cabina > 0) == false){
            this._toaster.error("No se puede cambiar una Cabina a Personal");
            return;
        }

        if(this.citaEditar.cabina){
            this.consultarServiciosPersonalCabinaEditar()
        }
        else{
            this.citaEditar.servicios = [];
            this.citaEditar.servicios.push({
                servicio: null,
                personal: null,
                listadoPersonales: this.dataPersonal,
                listadoServicios: this.dataServicios,
                listadoServiciosBuffer: JSON.parse(JSON.stringify(this.dataServicios)),
                filterBy: null,
                esDePaquete: false,
                idPaqueteSucursalCliente: null,
                idPaqueteSucursalClienteServicio: null,
                idPagoClienteDetalle: null,
                montoTotalPagoPaypal: 0
            });
        }

    }

    consultarServiciosPersonalCabinaEditar(){
        this._pantallaServicio.mostrarSpinner();
        var params = {
            idCabina: this.citaEditar.cabina
        }
        this._backService.HttpPost("procesos/agenda/Agenda/consultarServiciosPersonalCabina", {}, params).subscribe((response: string) => {
            var dataTemp = eval(response)
            this.cabina.servicios = dataTemp[0];
            this.cabina.serviciosBuffer = JSON.parse(JSON.stringify(this.cabina.servicios));
            this.cabina.personales = dataTemp[1];

            if(this.cabina.servicios.length == 0){
                this.cabina.servicios = this.dataServicios;
                this.cabina.serviciosBuffer = JSON.parse(JSON.stringify(this.cabina.servicios));
            }

            if(this.cabina.personales.length == 0){
                this.cabina.personales = this.dataPersonal;
            }

            this._pantallaServicio.ocultarSpinner();
        }, error => {
            this._router.navigate(['/login']);
        });
    }

    // ---- MODIFICAR CITA ----
    modificarCita(){
        this._pantallaServicio.mostrarSpinner();

        if(this.calendario.clickedEvent.idPersonal > 0 && this.citaEditar.cabina > 0 && (this.calendario.clickedEvent.idCabina > 0) == false){
            this._toaster.error("No se puede cambiar de un Personal a Cabina");
            this._pantallaServicio.ocultarSpinner();
            return;
        }

        if(this.calendario.clickedEvent.idCabina > 0 && (this.citaEditar.cabina > 0) == false){
            this._toaster.error("No se puede cambiar una Cabina a Personal");
            this._pantallaServicio.ocultarSpinner();
            return;
        }

        var isValid = true;
        var fecha: any = "";
        if (!this.citaEditar.fecha) {
            $("#editar-fecha").addClass("errorCampo");
            isValid = false;
        }
        else {
            fecha = moment(this.citaEditar.fecha);
        }

        if (!this.validarServiciosEditar()){
            isValid = false;
        }

        if (isValid) {
            var params: any = {};
            var h = this.citaEditar.hora.split(":");
            var hora = moment().set({ "hour": Number(h[0]), "minute": Number(h[1]) });
            var horasServicio = [];
            var horaFinServicios = [];
            var horaFinMayor = hora.clone();
            var personalRepetido = false;

            params.idCita = this.calendario.clickedEvent.cita;
            params.fecha = fecha.format("YYYY-MM-DD");
            //params.horaInicioServicio = [];
            params.horaInicio = hora.format("HH:mm");

            //Recorres los servicios
            var indexPersonalRepetido = -1;
            for(var i = 0; i < this.citaEditar.servicios.length; i++) {
                var s = this.citaEditar.servicios[i];
                //Siempre trae la hora del inicio de la cita por default
                horasServicio[i] = hora.clone();

                //Si no es la primera iteración
                if (i != 0) {
                    if (!this.citaEditar.cabina) {
                        personalRepetido = false;
                        for (var j = i - 1; j >= 0; j--) {
                            //Si hay un personal con más de un servicio por cita
                            if (this.citaEditar.servicios[i].personal == this.citaEditar.servicios[j].personal) {
                                personalRepetido = true;
                                indexPersonalRepetido = j;
                                j = -1;
                            }
                        }
                        if (personalRepetido) {
                            //La hora inicio del servicio de un personal repetido es igual a la hora de inicio del servicio anterior hecho por el personal, más la duración del mismo
                            horasServicio[i] = horasServicio[indexPersonalRepetido].clone().add(this.citaEditar.servicios[indexPersonalRepetido].duracion, "m");
                        }
                    }
                    else {
                        horasServicio[i] = horasServicio[i - 1].clone().add(this.citaEditar.servicios[i - 1].duracion, "m");
                    }
                }
                s.inicio = horasServicio[i].format("HH:mm");

                //La hora fin del servicio es igual a la hora inicio del mismo, más su duración
                horaFinServicios.push(horasServicio[i].clone().add(this.citaEditar.servicios[i].duracion, "m"));

                s.fin = horaFinServicios[i].format("HH:mm");

                if (horaFinServicios[i] > horaFinMayor) {
                    horaFinMayor = horaFinServicios[i];
                }
            }

            params.servicios = JSON.parse(JSON.stringify(this.citaEditar.servicios));

            for(var i = 0; i < params.servicios.length; i++) {
                if (!params.servicios[i].idPersonal) {
                    params.servicios[i].idPersonal = "";
                }
                if (!params.servicios[i].personal) {
                    params.servicios[i].personal = "";
                }
            }

            params.horaFin = horaFinMayor.format("HH:mm");
            params.idCabina = this.citaEditar.cabina ? this.citaEditar.cabina : "";

            //Correo cita modificada
            this.temp = JSON.parse(JSON.stringify(params));
            this.temp.momentFecha = fecha;
            this._backService.HttpPost("procesos/agenda/Agenda/modificarCita", {}, params, "text").subscribe((response: string) => {
                this._pantallaServicio.ocultarSpinner();
                $('#botonEditarCita').removeClass("disabled");
                switch (Number(response)) {
                    case -1:
                        this._toaster.error(this.agendaTranslate.personalNoLabora);
                        break;
                    case -2:
                        this._toaster.error(this.agendaTranslate.personalTieneDescanso);
                        break;
                    case -3:
                        this._toaster.error(this.agendaTranslate.horaFueraHorario);
                        break;
                    case -4:
                        this._toaster.error(this.agendaTranslate.horaNoDisponible);
                        break;
                    case -5:
                        this._toaster.error(this.agendaTranslate.equipoNoDisponible);
                        break;
                    case -6:
                        this._toaster.error('Horario del Personal fuera de Horario');
                        break;
                    case -7:
                        this._toaster.error("La Cabina a la que se quiere cambiar no tiene asginado el personal de la cita");
                        break;
                    case -8:
                        this._toaster.error("La Cabina a la que se quiere cambiar no tiene asginado el servicio de la cita");
                        break;
                    default:
                        this.modales.modalEditarCita.hide();
                        this.correo_correoCitaModificada(this.temp);

                        this.calendario.idCitaActualizar = this.calendario.clickedEvent.cita;
                        this.consultarCitaIndividual();
                }
            }, error => {
                this._pantallaServicio.ocultarSpinner();
            });
        }
        else {
            this._pantallaServicio.ocultarSpinner();
            $('#botonEditarCita').removeClass("disabled");
        }
    }

    validarServiciosEditar(){
        var isValid = true;
        for(var i = 0; i < this.citaEditar.servicios.length; i++) {
            if (!this.citaEditar.servicios[i].servicio) {
                if(!this.citaEditar.cabina){
                    $("#editar-servicio-" + i).addClass("errorCampo");
                }
                else{
                    $("#editar-servicio-cabina-" + i).addClass("errorCampo");
                }
                isValid = false;
            }

            if (!this.citaEditar.cabina) {
                if (!this.citaEditar.servicios[i].personal) {
                    $("#editar-personal-" + i).addClass("errorCampo");
                    isValid = false;
                }
            }
        }
        return isValid;
    }


    // ------------------------------------------------------ FUNCIONES DEL CAMBIO ESTATUS DE CITA ------------------------------------------------------
    cambiarCitaEstatus(){
        this._pantallaServicio.mostrarSpinner();
        var params: any = {};
        params.cita = this.calendario.clickedEvent.cita;
        params.citaDetalle = this.calendario.clickedEvent.id;
        params.estatus = this.calendario.clickedEvent.estatus;
        params.horaInicio = null;
        params.horaFin = null;
        params.fechaCita = null;
        params.personal = null;
        params.origen = "web";
        params.idPromocionSucursal = null;
        params.valorPromocion = null;
        params.tipoPromocion = null;

        this._backService.HttpPost("procesos/agenda/Agenda/updateCita", {}, params).subscribe((response: string) => {
            this.calendario.mostrarEventPopup = false;
            $(".fc-timegrid-event").popover('hide');

            for(var i = 0; i< this.citas.length; i++){
                if(this.citas[i].id == this.calendario.clickedEvent.id){
                    this.citas[i].estatus = JSON.parse(JSON.stringify(this.calendario.clickedEvent.estatus));
                    // Solo se cambia el color si no fue pagado con paypal
                    if(this.citas[i].montoTotalPagoPaypal == 0){
                        for(var j = 0; j < this.coloresCitas.length; j++){
                            if(this.coloresCitas[j].estatus == this.citas[i].estatus){
                                this.citas[i].color = this.coloresCitas[j].valor;
                            }
                        }
                    }
                }
            }

            this.events = [];
            for(var i = 0; i < this.citas.length; i++){
                if(this.calendario.viewActual == "resourceDay"){
                    this.events.push(this.citas[i]);
                }
                if(this.calendario.viewActual == "agendaWeek"){
                    if(this.citas[i].resourceId == this.resourceSemana){
                        this.events.push(this.citas[i]);
                    }
                }
            }

            for(var i = 0; i < this.excepciones.length; i++){
                if(this.calendario.viewActual == "resourceDay"){
                    this.events.push(this.excepciones[i]);
                }
                if(this.calendario.viewActual == "agendaWeek"){
                    if(this.excepciones[i].resourceId == this.resourceSemana){
                        this.events.push(this.excepciones[i]);
                    }
                }
            }

            this._pantallaServicio.ocultarSpinner();
            // $('#calendar').fullCalendar('destroy');
            this.calendario_crearCalendario();
        }, error => {
            this._router.navigate(['/login']);
        });
    }

    async terminarCita(){
        this._pantallaServicio.mostrarSpinner();
        // this.rootScope_caja.venta.limpiarVenta();

        var evento = this.calendario.clickedEvent;
        this.moduloFactura.clickedEvent = JSON.parse(JSON.stringify(this.calendario.clickedEvent));

        this.rootScope_caja = {
            venta: {
                servicios: {
                    listaServiciosPorCobrar: []
                },
                paquetes: {
                    listaPaquetesPorCobrar: []
                }
            }
        }
        this.rootScope_caja.venta.servicios.listaServiciosPorCobrar.push({
            idServicio: evento.idServicio,
            nombreServicio: evento.servicio,
            listadoServicio: [],
            idPersonal: evento.idPersonal,
            nombrePersonal: evento.personal,

            costoMinimo: evento.costoMinimo,
            costoMaximo: evento.costoMaximo,

            costoElegido: evento.idPagoClienteDetalle ? 0 : evento.costoMinimo,
            costoDescuento: evento.idPagoClienteDetalle ? 0 : evento.costoMinimo,

            mostrarBotonDescuento: true,
            mostrarDescuento: false,
            descuentoP: 0,
            descuentoF: 0,

            esVenta: true,
            esCuentaPagar: false,

            idPagoClienteDetalle: evento.idPagoClienteDetalle,
            montoPrepagado: evento.idPagoClienteDetalle ? evento.montoTotalPagoPaypal : 0,

            idCita: evento.cita,
            idCitaDetalle: evento.id,
            idPaqueteSucursalCliente: evento.idPaqueteSucursalCliente,
            idPaqueteSucursalClienteServicioDetalle: evento.idPaqueteSucursalClienteServicioDetalle,
            idCabina: evento.idCabina
        });

        if(evento.idPagoClienteDetalle){
            this.rootScope_caja.venta.servicios.titulosConPrepago = true;
        }
        else{
            this.rootScope_caja.venta.servicios.titulosConPrepago = false;
        }

        for (var i = 0; i < evento.citasRelacionadas.length; i++) {
            var ev = evento.citasRelacionadas[i].cita;

            this.rootScope_caja.venta.servicios.listaServiciosPorCobrar.push({
                idServicio: ev.idServicio,
                nombreServicio: ev.nombreServicio,
                listadoServicio: [],
                idPersonal: ev.idPersonal,
                nombrePersonal: ev.nombrePersonal,

                costoMinimo: ev.costoMinimo,
                costoMaximo: ev.costoMaximo,

                costoElegido: ev.idPagoClienteDetalle ? 0 : ev.costoMinimo,
                costoDescuento: ev.idPagoClienteDetalle ? 0 : ev.costoMinimo,

                mostrarBotonDescuento: true,
                mostrarDescuento: false,
                descuentoP: 0,
                descuentoF: 0,

                esVenta: true,
                esCuentaPagar: false,

                idPagoClienteDetalle: ev.idPagoClienteDetalle,
                montoPrepagado: ev.idPagoClienteDetalle ? ev.montoTotalPagoPaypal : 0,

                idCita: ev.idCita,
                idCitaDetalle: ev.idCitaDetalle,
                idPaqueteSucursalCliente: ev.idPaqueteSucursalCliente,
                idPaqueteSucursalClienteServicioDetalle: ev.idPaqueteSucursalClienteServicioDetalle,
                idCabina: ev.idCabina
            });

            if(ev.idPagoClienteDetalle){
                this.rootScope_caja.venta.servicios.titulosConPrepago = true;
            }

        }

        var noAplicablePromociones = false;
        for (var i = 0; i < this.rootScope_caja.venta.servicios.listaServiciosPorCobrar.length; i++) {
            if(this.rootScope_caja.venta.servicios.listaServiciosPorCobrar[i].idPagoClienteDetalle){
                noAplicablePromociones = true;
            }
        }

        if(noAplicablePromociones){
            for (var i = 0; i < this.rootScope_caja.venta.servicios.listaServiciosPorCobrar.length; i++) {
                this.rootScope_caja.venta.servicios.listaServiciosPorCobrar[i].noAplicablePromociones = true;
            }
        }

        this.rootScope_caja.venta.cliente = this.calendario.clickedEvent.idCliente;
        this.rootScope_caja.venta.nombreCliente = this.calendario.clickedEvent.cliente;
        this.rootScope_caja.venta.permitirCambioCliente = false;
        this.rootScope_caja.venta.idCita = this.calendario.clickedEvent.cita;

        var contServPaq = 0;
        var idpsc = "";
        for (var i = 0; i < this.rootScope_caja.venta.servicios.listaServiciosPorCobrar.length; i++) {
            if (this.rootScope_caja.venta.servicios.listaServiciosPorCobrar[i].idPaqueteSucursalCliente != null) {
                contServPaq++;
                idpsc = idpsc + this.rootScope_caja.venta.servicios.listaServiciosPorCobrar[i].idPaqueteSucursalCliente.toString() + ",";
            }
        }

        if (contServPaq != 0) {
            idpsc = idpsc.slice(0, -1);
            var params: any = {};
            params.idPaqueteSucursalCliente = idpsc;
            params.idCita = this.calendario.clickedEvent.cita;

            this._backService.HttpPost("procesos/agenda/Agenda/consultarPaqueteSucursalClienteSaldo", {}, params).subscribe(async (response: string) => {
                var dataPaquete = eval(response);
                for (var i = 0; i < dataPaquete.length; i++) {
                    this.rootScope_caja.venta.paquetes.listaPaquetesPorCobrar.push({
                        idPersonal: dataPaquete[i].idPersonal,
                        nombrePersonal: dataPaquete[i].nombrePersonal,
                        idPaqueteSucursal: dataPaquete[i].idPaqueteSucursal,
                        nombrePaquete: dataPaquete[i].descripcion,
                        costoElegido: dataPaquete[i].saldo,
                        costoElegidoEditable: true,
                        costoDescuento: dataPaquete[i].saldo,
                        mostrarBotonDescuento: false,
                        mostrarDescuento: false,
                        descuentoP: 0,
                        descuentoF: 0,
                        costoVenta: null,

                        esVenta: false,
                        esCuentaPagar: true,

                        idPagoClienteDetalle: dataPaquete[i].idPagoClienteDetalle,

                        idPaqueteSucursalCliente: dataPaquete[i].idPaqueteSucursalCliente,
                        costoPorPagar: null,
                        montoPagado: null,
                        idCita: this.calendario.clickedEvent.cita
                    });
                }

                this.calendario.mostrarEventPopup = false;
                $(".fc-timegrid-event").popover('hide');

                var params: any = {};
                params.data = JSON.parse(JSON.stringify(this.rootScope_caja));
                params.opc = 2;
                var resultModalCaja = await this._serviceCaja.openModalCaja(CajaComponent, params);
                if(resultModalCaja){
                    this.calendario.idCitaActualizar = this.calendario.clickedEvent.cita;
                    this.consultarCitaIndividual();
                }

                $("#tabVenta").addClass("active");
                $("#tabRetiro").removeClass("active");
                $("#tabCorte").removeClass("active");
                $("#tabMovimientos").removeClass("active");
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
            this.calendario.mostrarEventPopup = false;
            $(".fc-timegrid-event").popover('hide');

            var params: any = {};
            params.data = JSON.parse(JSON.stringify(this.rootScope_caja));
            params.opc = 2;
            var resultModalCaja = await this._serviceCaja.openModalCaja(CajaComponent, params);
            if(resultModalCaja){
                this.calendario.idCitaActualizar = this.calendario.clickedEvent.cita;
                this.consultarCitaIndividual();
            }
        }
    }

    cambiarEstatusNoAsistio(){
        this._pantallaServicio.mostrarSpinner();
        var params: any = {};
        params.idCita = this.calendario.clickedEvent.cita;

        this._backService.HttpPost("procesos/agenda/Agenda/cambiarEstatusNoAsistio", {}, params).subscribe((response: string) => {
            this.calendario.mostrarEventPopup = false;
            $(".fc-timegrid-event").popover('hide');

            this.calendario.idCitaActualizar = this.calendario.clickedEvent.cita;
            this.consultarCitaIndividual();
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

    cancelarServicio(){
        this._pantallaServicio.mostrarSpinner();
        var params: any = {};
        params.cita = this.calendario.clickedEvent.cita;
        params.citaDetalle = this.calendario.clickedEvent.id;
        params.estatus = this.calendario.clickedEvent.estatus;
        params.horaInicio = null;
        params.horaFin = null;
        params.fechaCita = null;
        params.personal = null;
        params.origen = "web";
        params.idPromocionSucursal = null;
        params.valorPromocion = null;
        params.tipoPromocion = null;

        this._backService.HttpPost("procesos/agenda/Agenda/updateCita", {}, params).subscribe((response: string) => {
            this.correo_correoCitaReprogramada(this.calendario.clickedEvent);
            this.calendario.mostrarEventPopup = false;
            $(".fc-timegrid-event").popover('hide');

            for(var i = 0; i< this.citas.length; i++){
                if(this.citas[i].id == this.calendario.clickedEvent.id){
                    this.citas.splice(i, 1);
                    i--;
                }
            }

            this.events = [];
            for(var i = 0; i < this.citas.length; i++){
                if(this.calendario.viewActual == "resourceDay"){
                    this.events.push(this.citas[i]);
                }
                if(this.calendario.viewActual == "agendaWeek"){
                    if(this.citas[i].resourceId == this.resourceSemana){
                        this.events.push(this.citas[i]);
                    }
                }
            }

            for(var i = 0; i < this.excepciones.length; i++){
                if(this.calendario.viewActual == "resourceDay"){
                    this.events.push(this.excepciones[i]);
                }
                if(this.calendario.viewActual == "agendaWeek"){
                    if(this.excepciones[i].resourceId == this.resourceSemana){
                        this.events.push(this.excepciones[i]);
                    }
                }
            }

            this._pantallaServicio.ocultarSpinner();
            // $('#calendar').fullCalendar('destroy');
            this.calendario_crearCalendario();
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

    cancelarCita(){
        this._pantallaServicio.mostrarSpinner();
        var params: any = {};
        params.cita = this.calendario.clickedEvent.cita;

        this._backService.HttpPost("procesos/agenda/Agenda/cancelCita", {}, params).subscribe((response: string) => {
            this.correo_correoCitaCancelada(this.calendario.clickedEvent);

            this.calendario.mostrarEventPopup = false;
            $(".fc-timegrid-event").popover('hide');

            for(var i = 0; i< this.citas.length; i++){
                if(this.citas[i].cita == this.calendario.clickedEvent.cita){
                    this.citas.splice(i, 1);
                    i--;
                }
            }

            this.events = [];
            for(var i = 0; i < this.citas.length; i++){
                if(this.calendario.viewActual == "resourceDay"){
                    this.events.push(this.citas[i]);
                }
                if(this.calendario.viewActual == "agendaWeek"){
                    if(this.citas[i].resourceId == this.resourceSemana){
                        this.events.push(this.citas[i]);
                    }
                }
            }

            for(var i = 0; i < this.excepciones.length; i++){
                if(this.calendario.viewActual == "resourceDay"){
                    this.events.push(this.excepciones[i]);
                }
                if(this.calendario.viewActual == "agendaWeek"){
                    if(this.excepciones[i].resourceId == this.resourceSemana){
                        this.events.push(this.excepciones[i]);
                    }
                }
            }

            this._pantallaServicio.ocultarSpinner();
            // $('#calendar').fullCalendar('destroy');
            this.calendario_crearCalendario();
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

    mostrarModalCancelarServicio(mensaje: any) {
        $(".fc-timegrid-event").popover('hide');

        this.modales.modalCancelarServicio.show();
        $("#modalCancelarServicio .modal-body").html('<span class="title">' + mensaje + '</span>');
    }

    mostrarModalCancelarCita(mensaje: any) {
        $(".fc-timegrid-event").popover('hide');

        this.modales.modalCancelarCita.show();
        $("#modalCancelarCita .modal-body").html('<span class="title">' + mensaje + '</span>');
    }

    regresarEstatus(){
        this.calendario.clickedEvent.estatus = JSON.parse(JSON.stringify(this.calendario.clickedEvent.estatusOriginal));
    }


    // -------------------------------------------------------------- FUNCIONES REFERENCIA --------------------------------------------------------------
    declararGridReferencia(){
        this.gridReferenciaAgenda = {
            enableSorting: true,
            enableColumnMenus: false,
            columnDefs: [
                {
                    name: "acciones", width: '100', enableSorting: false, headerCellClass: 'alignCenter2',
                    cellTemplate: '<div class="ui-grid-cell-contents" ng-if="row.entity.nombre" style="text-align:center; color:#337dc0;">'
                    + '<li style="margin-right: 15px; font-size: 1.5em; cursor:pointer;" class="fa fa-pencil" ng-click="grid.appScope.mostrarEdicionReferencia(row.entity)"></li>'
                    + '<li style="font-size: 1.5em; cursor:pointer;" class="fa fa-trash-o" ng-click="grid.appScope.preparacionBorrarReferenciaAgenda(row.entity)"></li>'
                    + '<li style="font-size: 1.5em; cursor:pointer; width: 15.33px; display: inline-block;"></li>'
                    + '</div>'
                    + '<div class="ui-grid-cell-contents" ng-if="!row.entity.nombre" style="text-align:center; color:#337dc0;">'
                    + '<div ng-if="!grid.appScope.mostrarNuevaReferenciaAgenda&&row.entity.nuevo">'
                    + '<li style="font-size: 1.5em; cursor:pointer;" class="fa fa-plus" ng-click="grid.appScope.mostrarAgregarReferencia()"></li>'
                    + '</div>'
                    + '<div ng-if="grid.appScope.mostrarActualizarReferenciaAgenda&&!row.entity.nuevo">'
                    + '<li style="margin-right: 15px; font-size: 1.5em; cursor:pointer;" class="fa fa-undo" ng-click="grid.appScope.cerrarAgregarReferencia()"></li>'
                    + '<li style="font-size: 1.5em; cursor:pointer;" class="fa fa-floppy-o" ng-click="grid.appScope.actualizarReferencia(row.entity)"></li>'
                    + '</div>'
                    + '<div ng-if="grid.appScope.mostrarNuevaReferenciaAgenda">'
                    + '<li style="margin-right: 15px; font-size: 1.5em; cursor:pointer;"class="fa fa-undo" ng-click="grid.appScope.cerrarAgregarReferencia()"></li>'
                    + '<li style="font-size: 1.5em; cursor:pointer;"class="fa fa-floppy-o" ng-click="grid.appScope.agregarReferenciaAgenda()"></li>'
                    + '</div>'
                    + '</div>'
                },
                {
                    displayName:"Nombre", minWidth: '220', enableSorting: false, field: 'nombre', headerCellClass: 'alignCenter', cellClass: 'alignCenter',
                    cellTemplate: '<div style="margin-top: 5px;" ng-if="row.entity.nombre">'
                    + '{{COL_FIELD}} '
                    + '</div>'
                    + '<div style="width: 100%; height:100%;" ng-if="!row.entity.nombre">'
                    + '<div style="margin:2px; width: 100%; height:100%;" ng-if="grid.appScope.mostrarActualizarReferenciaAgenda">'
                    + '<input id="txtNombreReferenciaAgenda" ng-if="!row.entity.nuevo" ng-model="grid.appScope.nombreReferencia" style="width: 98.5%; height:85%; margin:1px;" type="text" class="form-control" maxlength="100"/>'
                    + '</div>'
                    + '<div style="margin:2px; width: 100%; height:100%;" ng-if="grid.appScope.mostrarNuevaReferenciaAgenda">'
                    + '<input id="txtNombreReferenciaAgenda" ng-model="grid.appScope.nombreReferencia" style="width: 98.5%; height:85%; margin:1px;" type="text" class="form-control" maxlength="100"/>'
                    + '</div>'
                    + '</div>'
                },
            ],
            data: 'referencia.dataReferencia'
        }
    }

    // ---- LISTADO REFERENCIA ----
    cargarReferenciaAgenda (entity: any) {
        this.dataReferencia = [];
        this.referencia.id_referencia = null;

        this._backService.HttpPost("procesos/agenda/Agenda/consultareferenciaAgenda", {}, {}).subscribe((response: string) => {
            this.referencia.dataReferencia = eval(response);

            for (var i = 0 ; i < this.referencia.dataReferencia.length; i++) {
                this.referencia.dataReferencia[i].nuevo = false;
                this.referencia.dataReferencia[i].id = i;
                this.referencia.dataReferencia[i].nombreOriginal = this.referencia.dataReferencia[i].nombre;
            }

            this.referencia.dataReferencia.push({nombre: false, nuevo: true})

            this.mostrarNuevaReferenciaAgenda = false;
            this.mostrarActualizarReferenciaAgenda = false;

            $("#txtNombreReferenciaAgenda").removeClass("errorCampo");
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

    mostrarAgregarReferencia () {
        for (var i = 0 ; i < this.referencia.dataReferencia.length - 1; i++) {
            this.referencia.dataReferencia[i].nombre = this.referencia.dataReferencia[i].nombreOriginal;
        }
        this.nombreReferencia = "";
        this.mostrarNuevaReferenciaAgenda = true;
        this.mostrarActualizarReferenciaAgenda = false;
        $("#txtNombreReferenciaAgenda").removeClass("errorCampo");
    }

    cerrarAgregarReferencia () {
        for (var i = 0 ; i < this.referencia.dataReferencia.length - 1; i++) {
            this.referencia.dataReferencia[i].nombre = this.referencia.dataReferencia[i].nombreOriginal;
        }
        this.nombreReferencia = "";
        this.mostrarNuevaReferenciaAgenda = false;
        this.mostrarActualizarReferenciaAgenda = false;
        $("#txtNombreReferenciaAgenda").removeClass("errorCampo");
    }

    mostrarEdicionReferencia(entity: any){
        for (var i = 0 ; i < this.referencia.dataReferencia.length - 1; i++) {
            this.referencia.dataReferencia[i].nombre = this.referencia.dataReferencia[i].nombreOriginal;
        }
        this.nombreReferencia = entity.nombre;
        this.mostrarNuevaReferenciaAgenda = false;
        this.mostrarActualizarReferenciaAgenda = true;
        this.referencia.dataReferencia[entity.id].nombre = false;
    }

    agregarReferenciaAgenda () {
        if (this.nombreReferencia != "") {
            var valExp = RegExp("^[a-zA-Z áéíóúñÁÉÍÓÚÑ0üÜ.]*$");
            var nombreRepetido: any;
            if (valExp.test(this.nombreReferencia)) {
                for (var i = 0; i < this.referencia.dataReferencia.length; i++) {
                    if (!this.referencia.dataReferencia[i].nuevo) {
                        if (this.referencia.dataReferencia[i].nombre ==  this.nombreReferencia) {
                            nombreRepetido = true;
                        }
                    }
                }
                if (!nombreRepetido) {
                    var params: any = {};
                    params.nombre = this.nombreReferencia;

                    this._backService.HttpPost("procesos/agenda/Agenda/guardarReferenciaAgenda", {}, params).subscribe((response: string) => {
                        this.cargarReferenciaAgenda(undefined);
                        this.nombreReferencia = "";
                        this.mostrarNuevaReferenciaAgenda = false;
                        $("#txtDescripcionMetodoPago").removeClass("errorCampo");
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
                    this.mostrarModalErrorReferenciaAgenda("El Nombre de la referencia ya existe");
                }
            }
            else {
                this.mostrarModalErrorReferenciaAgenda("La referencia solo debe contener letras");
            }
        }
        else {
            $("#txtNombreReferenciaAgenda").addClass("errorCampo");
        }
    }

    actualizarReferencia (entity: any) {
        if (this.nombreReferencia != "") {
            var valExp = RegExp("^[a-zA-Z áéíóúñÁÉÍÓÚÑ0üÜ.]*$");
            var nombreRepetido: any;
            if (valExp.test(this.nombreReferencia)) {
                for (var i = 0; i < this.referencia.dataReferencia.length; i++) {
                    if (!this.referencia.dataReferencia[i].nuevo) {
                        if (this.referencia.dataReferencia[i].nombre == this.nombreReferencia) {
                            nombreRepetido = true;
                        }
                    }
                }
                if (!nombreRepetido) {
                    var params: any = {};
                    params.nombre = this.nombreReferencia;
                    params.idReferencia = entity.id_referencia;

                    this._backService.HttpPost("procesos/agenda/Agenda/actualizarReferenciaAgenda", {}, params).subscribe((response: string) => {
                        this.cargarReferenciaAgenda(undefined);
                        this.nombreReferencia = "";
                        this.mostrarNuevaReferenciaAgenda = false;
                        $("#txtNombreReferenciaAgenda").removeClass("errorCampo");
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
                    this.mostrarModalErrorReferenciaAgenda("La referencia ya existe");
                }
            }
            else {
                this.mostrarModalErrorReferenciaAgenda("La referencia solo debe contener letras");
            }
        }
        else {
            $("#txtNombreReferenciaAgenda").addClass("errorCampo");
        }
    }

    preparacionBorrarReferenciaAgenda (entity: any) {
        this.referenciaABorrar = entity.id_referencia;
        this.modalBorrarReferencia("¿Desea borrar la Referencia?");
    }

    borrarReferencia () {
        var params: any = {};
        params.idReferencia =  this.referenciaABorrar;

        this._backService.HttpPost("procesos/agenda/Agenda/borrarReferenciaAgenda", {}, params).subscribe((response: string) => {
            this.cargarReferenciaAgenda(undefined);
            this.modales.modalBorrarReferencia.hide();
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

    modalReferenciaAgenda () {
        this.modales.modalReferenciaAgenda.show();
    }

    salirModalReferenciaAgenda () {
        this.modales.modalReferenciaAgenda.hide();
        this.consultaReferenciaAgenda();
    }

    modalBorrarReferencia (message: any) {
        this.modales.modalBorrarReferencia.show();
        $("#borrar-referencia .modal-body").html('<span class="title">' + message + '</span>');
    }

    mostrarModalErrorReferenciaAgenda (message: any) {
        this.modales.modalAlertReferencia.show();
        $("#modal-alert-referencia .modal-body").html('<span class="title">' + message + '</span>');
    }

    // ----- REFERENCIA DEL CLIENTE ----
    consultaReferenciaAgenda () {
        this.dataReferencia = [];
        this.referencia.id_referencia = null;

        this._backService.HttpPost("procesos/agenda/Agenda/consultareferenciaAgenda", {}, {}).subscribe((response: string) => {
            if(parseInt(this.accesosPantallaAgenda.OpcionNuevoReferencia) == 0){
                this.referencia.dataReferencia = eval(response);
            }
            else{
                this.referencia.dataReferencia = eval(response);
                this.referencia.dataReferencia.push({ id_referencia: -1, nombre: "Nuevo..."});
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

    consultaReferenciaAgendaCliente () {
        var dataReferenciaCliente = [];
        this.dataReferenciaCliente = [];
        this.referencia.id_referencia = null;
        this.deshabilitarReferencia = false;

        var params: any = {};
        params.idCliente = this.cita.cliente;

        this._backService.HttpPost("procesos/agenda/Agenda/consultaReferenciaAgendaCliente", {}, params).subscribe((response: string) => {
            this.referencia.dataReferenciaCliente = eval(response);

            if(this.referencia.dataReferenciaCliente.length > 0){
                this.referencia.dataReferencia = this.referencia.dataReferenciaCliente;
                this.referencia.id_referencia = this.referencia.dataReferenciaCliente[0].id_referencia;
                this.deshabilitarReferencia = true;
            }
            else {
                this.consultaReferenciaAgenda();
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

    cambioReferenciaAgenda () {
        if(parseInt(this.referencia.id_referencia) == -1 ){
            this.referencia.id_referencia = 2089;
            this.referencia.id_referencia = null;
            this.modalReferenciaAgenda();
            this.cargarReferenciaAgenda(undefined);
            this.modales.modalReferenciaAgenda.hide();
        }
        else{
            this.modales.modalReferenciaAgenda.hide();
        }
    }


    // --------------------------------------------------------- FUNCIONES CANCELAR RECURRENCIA ---------------------------------------------------------
    confirmarCancelacionRecurrencia () {
        this.modales.modalConfirmarCancelacionRecurrencia.show();
        $("#modalConfirmarCancelacionRecurrencia .modal-body").html('<span class="title">' + this.agendaTranslate.cancelarRecurrencia + '</span>');
    }

    cancelarRecurrencia () {
        this._pantallaServicio.mostrarSpinner();
        var params: any = {};
        params.cita = this.calendario.clickedEvent.cita;

        this._backService.HttpPost("procesos/agenda/Agenda/cancelRecurrencia", {}, params).subscribe((response: string) => {
            //this._pantallaServicio.mostrarSpinner();
            this.calendario.mostrarEventPopup = false;
            $(".fc-timegrid-event").popover('hide');

            this.consultarCitas();
            this.correo_correoCancelacionRecurrencia(this.calendario.clickedEvent);
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


    // -------------------------------------------------------------- FUNCIONES DE NOTAS ----------------------------------------------------------------
    nota_mostrarEdicion(){
        this.nota.esEditarNota = true;
        setTimeout(function () { $("#inputEditarNota").focus(); }, 50);
    }

    nota_editarNota () {
        this.nota.esEditarNota = false;

        var params: any = {};
        // Es idCita pero en la función del ws/br/dal está como idCitaDetalle
        params.idCitaDetalle = this.calendario.clickedEvent.cita;
        params.nota = this.calendario.clickedEvent.nota;

        this._backService.HttpPost("procesos/agenda/Agenda/updateNotaDetalle", {}, params).subscribe((response: string) => {
            this.calendario.clickedEvent.notaOriginal = JSON.parse(JSON.stringify(this.calendario.clickedEvent.nota));
            for(var i = 0; i < this.events.length; i++){
                if(this.events[i].esCita){
                    if(this.events[i].cita == this.calendario.clickedEvent.cita){
                        this.events[i].nota = JSON.parse(JSON.stringify(this.calendario.clickedEvent.nota));
                        if(!this.citas[i].eventoCabina){
                            var ebi_labelNota: any = document.getElementById("label-nota-" + this.citas[i].id);
                            ebi_labelNota.innerHTML = (this.calendario.clickedEvent.paqueteNota ? this.calendario.clickedEvent.paqueteNota : "")  + (this.calendario.clickedEvent.nota ? this.calendario.clickedEvent.nota.replace("<", "[").replace(">", "]") : '');
                        }
                        else{
                            var ebi_labelNotaCabina: any = document.getElementById("label-nota-cabina-" + this.citas[i].id);
                            ebi_labelNotaCabina.innerHTML = (this.calendario.clickedEvent.paqueteNota ? this.calendario.clickedEvent.paqueteNota : "")  + (this.calendario.clickedEvent.nota ? this.calendario.clickedEvent.nota.replace("<", "[").replace(">", "]") : '');
                        }
                    }
                }
            }
            for(var i = 0; i < this.citas.length; i++){
                if(this.citas[i].cita == this.calendario.clickedEvent.cita){
                    this.citas[i].nota = JSON.parse(JSON.stringify(this.calendario.clickedEvent.nota));
                }
            }

            this.events = [];
            for(var i = 0; i < this.citas.length; i++){
                if(this.calendario.viewActual == "resourceDay"){
                    this.events.push(this.citas[i]);
                }
                if(this.calendario.viewActual == "agendaWeek"){
                    if(this.citas[i].resourceId == this.resourceSemana){
                        this.events.push(this.citas[i]);
                    }
                }
            }

            for(var i = 0; i < this.excepciones.length; i++){
                if(this.calendario.viewActual == "resourceDay"){
                    this.events.push(this.excepciones[i]);
                }
                if(this.calendario.viewActual == "agendaWeek"){
                    if(this.excepciones[i].resourceId == this.resourceSemana){
                        this.events.push(this.excepciones[i]);
                    }
                }
            }

            this.calendario.mostrarEventPopup = false;
            $(".fc-timegrid-event").popover('hide');

            // $('#calendar').fullCalendar('destroy');
            this.calendario_crearCalendario();
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

    nota_revertirEdicion () {
        this.calendario.clickedEvent.nota = JSON.parse(JSON.stringify(this.calendario.clickedEvent.notaOriginal));
        this.nota.esEditarNota = false;
    }


    // -------------------------------------------------------------- FUNCIONES DE TICKET ---------------------------------------------------------------
    ticketPago_mostrarModalTicketPago () {
        this.calendario.mostrarEventPopup = false;
        $(".fc-timegrid-event").popover('hide');

        this.ticketPago.ticketSelecionado = "";
        this.ticketPago.dataTickets = [];
        this.rootScope_caja.venta.ticket = {};
        this.rootScope_dataTicket = {};

        var params: any = {};
        params.idCita = this.calendario.clickedEvent.cita;

        this._backService.HttpPost("procesos/agenda/Agenda/consultarFoliosPagoCita", {}, params).subscribe((response: string) => {
            this.ticketPago.dataTickets = eval(response);
            this._ticketService.recibirListaTickets(this.ticketPago.dataTickets);
            this._ticketService.caja_movimientos_mostrarTicketFolioPagoAgenda();
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


    // --------------------------------------------------------- FUNCIONES DE ENVÍO DE CORREOS ----------------------------------------------------------
    correo_correoCitaNueva (c: any) {
        var params: any = {};
        params.idCita = c.idCita;

        this._backService.HttpPost("movil/AgendaMovil/datosReprogramar", {}, params).subscribe((response: string) => {
            this.dataCitaTemporal = eval(response);
            var params: any = {};
            params.idCliente = this.cita.cliente;
            params.idCita = c.idCita;

            this._backService.HttpPost("procesos/agenda/Agenda/selectPromociones", {}, params).subscribe((response: string) => {
                this.promociones = [];
                this.promociones = eval(response);
                var dataCita = this.dataCitaTemporal;
                var fechaCita = moment(dataCita[0].fechaCita);
                var correoParams: any = {};
                var fechaCorreoCita = new Date(fechaCita.format("MM/DD/YY") + " " + dataCita[0].horaInicioServicio.substring(0, 5));
                var fechaEnvioCorreos = new Date();
                fechaEnvioCorreos.setHours(fechaEnvioCorreos.getHours() + this.correo.hrsAnticipacionCitas)

                var costoMin = 0;
                var costoMax = 0;
                var direccion = dataCita[0].calle + " #" + dataCita[0].numero + ", Col. " + dataCita[0].colonia + ", " + dataCita[0].nombre;
                correoParams.horaInicio = dataCita[0].horaInicioServicio.substring(0, 5);
                correoParams.fechaCita = fechaCita.format("DD/MM/YY");
                correoParams.sucursal = dataCita[0].nombreSucursal;
                correoParams.nombre = dataCita[0].nombreCliente;
                if (dataCita[0].emailCliente == null || dataCita[0].emailCliente == undefined) {
                    correoParams.email = "";
                }
                else {
                    correoParams.email = dataCita[0].emailCliente;
                }

                correoParams.servicios = "<tr><td style='width: 60px;text-align: center;'>" +
                                         `<img src='${environment.urlMigracion}assets/images/system/servicio_correo.png' width='32' height='55' alt='Logo Servicio Correo'></td>` +
                                         "<td>Servicio:</td><td>";

                var costoMinOriginal = 0;
                var costoMaxOriginal = 0;
                for(var i = 0; i < dataCita.length; i++) {
                    correoParams.servicios += dataCita[i].nombreServicio;

                    if (i == (dataCita.length - 1)) {
                        correoParams.servicios += "</td></tr>";
                    } else {
                        correoParams.servicios += ",";
                    }

                    costoMin += dataCita[i].costoMinimo;
                    costoMax += dataCita[i].costoMaximo ? dataCita[i].costoMaximo : dataCita[i].costoMinimo;

                    costoMinOriginal += dataCita[i].costoMinimo;
                    costoMaxOriginal += dataCita[i].costoMaximo ? dataCita[i].costoMaximo : dataCita[i].costoMinimo;

                    var costoMinPromo = 0;
                    var costoMaxPromo = 0;
                    var menorCostoConPromo = 0;
                    var mayorCostoConPromo = 0;

                    for (var j = 0; j < this.promociones.length; j++) {
                        if (this.promociones[j].idServicio == dataCita[i].idServicio) {
                            if (this.promociones[j].idDescuentoTipo == 1) {
                                costoMinPromo = parseFloat(this.promociones[j].valor);
                                costoMaxPromo = parseFloat(this.promociones[j].valor);
                            }
                            else {
                                costoMinPromo = (dataCita[i].costoMinimo * (parseFloat(this.promociones[j].valor) / 100));
                                costoMaxPromo = (dataCita[i].costoMaximo ? dataCita[i].costoMaximo : (dataCita[i].costoMinimo * parseFloat(this.promociones[j].valor)) / 100);
                            }

                            if (costoMinPromo > menorCostoConPromo) {
                                menorCostoConPromo = costoMinPromo;
                                mayorCostoConPromo = costoMaxPromo;
                            }
                        }
                    }
                    costoMin = costoMin - ((menorCostoConPromo > dataCita[i].costoMinimo) ? dataCita[i].costoMinimo : menorCostoConPromo);
                    costoMax = costoMax - ((mayorCostoConPromo > (dataCita[i].costoMaximo ? dataCita[i].costoMaximo : dataCita[i].costoMinimo)) ? (dataCita[i].costoMaximo ? dataCita[i].costoMaximo : dataCita[i].costoMinimo) : mayorCostoConPromo);
                }
                correoParams.servicios += "<tr bgcolor='#e6e6e6'><td style='width: 60px;text-align: center;'>" +
                                          `<img src='${environment.urlMigracion}assets/images/system/ubicacion_correo.png' width='43' height='55' alt='Logo Ubicacion Correo'></td>` +
                                          "<td>Ubicación:</td><td>" + direccion + "</td></tr>" +
                                          "<tr><td style='width: 60px;text-align: center;'>" +
                                          `<img src='${environment.urlMigracion}assets/images/system/telefono_correo.png' width='34' height='55' alt='Logo Telefono Correo'></td>` +
                                          "<td>Teléfono:</td><td>" + dataCita[0].telefono + "</td></tr>";

                if (this.promociones.length > 0) {
                    if (costoMinOriginal != costoMin) {
                        correoParams.costo = "<strike> (" + (costoMinOriginal == costoMaxOriginal ? "$" + costoMinOriginal.toFixed(2) : "$" + costoMinOriginal.toFixed(2) + " - " + "$" + costoMaxOriginal.toFixed(2)) + ")</strike><br>" + (costoMin == costoMax ? "$" + costoMin.toFixed(2) : "$" + costoMin.toFixed(2) + " - " + "$" + costoMax.toFixed(2));
                    }
                    else {
                        correoParams.costo = (costoMin == costoMax ? "$" + costoMin.toFixed(2) : "$" + costoMin.toFixed(2) + " - " + "$" + costoMax.toFixed(2));
                    }
                }
                else {
                    correoParams.costo = (costoMin == costoMax ? "$" + costoMin.toFixed(2) : "$" + costoMin.toFixed(2) + " - " + "$" + costoMax.toFixed(2));
                }
                correoParams.idioma = "ESP";
                correoParams.id_sucursal = null;

                if (fechaCorreoCita > fechaEnvioCorreos) {
                    // Envío de Correo
                    this._backService.HttpPost("movil/UsuarioMovil/correoResumen", {}, correoParams, "text").subscribe((response: string) => {

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

                    // Envío de SMS
                    var paramsSms: any = {};
                    paramsSms.idCita = c.idCita;

                    this._backService.HttpPost("procesos/agenda/Agenda/enviarSms", {}, paramsSms, "text").subscribe((response: string) => {

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

        var notificacion = {
            idCita: c.idCita,
            tipoNotificacion: 1,
            fecha: moment().format("YYYY-MM-DD"),
            hora: moment().format("HH:mm")
        };

        this._backService.HttpPost("procesos/notificaciones/Notificaciones/enviarNotificacionCita", {}, notificacion, "text").subscribe((response: string) => {

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

        this._backService.HttpPost("movilNegocio/MovilNegocio/consultarTokenUsuario", {}, notificacion).subscribe((response: string) => {
            var dataUsuario = eval(response);
            for(var i = 0; i < dataUsuario.length; i++) {
                $.ajax({
                    type: "POST",
                    url: "https://cp.pushwoosh.com/json/1.3/createMessage",
                    data: JSON.stringify({
                        "request": {
                            "application": "93E98-097A5",
                            "auth": "nVnow9x8tTuq9EoKYbtya1X99D7Ag1kB8qyQLT9KvRpSy2WHqSbo4e9NJFt3WviIR4EfnN86e1bsJscjobRf",
                            "notifications": [{
                                "send_date": "now",
                                "ignore_user_timezone": true,
                                "timezone": "America/Mexico_City",
                                "content": ""+dataUsuario[i].mensaje,
                                "devices": [
                                  ""+dataUsuario[i].uuid
                                ],
                                "filter": ""
                            }]
                        }
                    }),
                    dataType: "json"
                }).done(function(data: any) {

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

    correo_correoCitaRecurrencia (c: any) {
        var params: any = {};
        params.idCita = c.idCita;

        this._backService.HttpPost("movil/AgendaMovil/datosReprogramar", {}, params).subscribe((response: string) => {
            var dataCita = eval(response);
            var fechaCita = moment(dataCita[0].fechaCita);
            var correoParams: any = {};

            var fechaCorreoCita = new Date(fechaCita.format("MM/DD/YY") + " " + dataCita[0].horaInicioServicio.substring(0, 5));

            var fechaEnvioCorreos = new Date();
            fechaEnvioCorreos.setHours(fechaEnvioCorreos.getHours() + this.correo.hrsAnticipacionCitas)

            var costoMin = 0;
            var costoMax = 0;
            var direccion = dataCita[0].calle + " #" + dataCita[0].numero + ", Col. " + dataCita[0].colonia + ", " + dataCita[0].nombre;
            var frecuencia = this.citaParams.frecuencia;
            var repeticion = this.citaParams.repeticion;
            correoParams.horaInicio = dataCita[0].horaInicioServicio.substring(0, 5);
            correoParams.fechaCita = fechaCita.format("DD/MM/YY");
            correoParams.sucursal = dataCita[0].nombreSucursal;
            correoParams.nombre = dataCita[0].nombreCliente;
            if (dataCita[0].emailCliente == null || dataCita[0].emailCliente == undefined) {
                correoParams.email = "";
            }
            else {
                correoParams.email = dataCita[0].emailCliente;
            }

            correoParams.servicios = "<tr><td style='width: 60px;text-align: center;'>" +
                                        `<img src='${environment.urlMigracion}assets/images/system/servicio_correo.png' width='32' height='55' alt='Logo Servicio Correo'></td>` +
                                        "<td>Servicio:</td><td>";

            //Servicios
            for(var i = 0; i < dataCita.length; i++) {
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
                                        `<img src='${environment.urlMigracion}assets/images/system/ubicacion_correo.png' width='43' height='55' alt='Logo Ubicacion Correo'></td>` +
                                        "<td>Ubicación:</td><td>" + direccion + "</td></tr>" +
                                        "<tr><td style='width: 60px;text-align: center;'>" +
                                        `<img src='${environment.urlMigracion}assets/images/system/telefono_correo.png' width='34' height='55' alt='Logo Telefono Correo'></td>` +
                                        "<td>Teléfono:</td><td>" + dataCita[0].telefono + "</td></tr>";


            correoParams.servicios += "<tr bgcolor='#e6e6e6'><td style='width: 60px;text-align: center;'>" +
                                        `<img src='${environment.urlMigracion}assets/images/system/horario_correo.png' width='34' height='50' alt='Logo Horario Correo'></td>` +
                                        "<td>Recurrencia:</td><td>";

            //Recurrencia
            switch (frecuencia) {
                case 'Diaria':

                    if (repeticion > 1) {
                        repeticion = "Cada " + String(repeticion) + " Días";
                    } else {
                        repeticion = "Cada día";
                    }

                    break;
                case 'Semanal':

                    if (repeticion > 1) {
                        repeticion = String(repeticion) + " Semanas";
                    } else {
                        repeticion = "Cada semana";
                    }

                    break;
                case 'Mensual':

                    if (repeticion > 1) {
                        repeticion = String(repeticion) + " Meses";
                    } else {
                        repeticion = "Cada mes";
                    }
                    break;
            }

            if (frecuencia == "Semanal") {
                frecuencia += "(";
                if (this.citaParams.lun) {
                    frecuencia += "Lun-";
                }
                if (this.citaParams.mar) {
                    frecuencia += "Mar-";
                }
                if (this.citaParams.mie) {
                    frecuencia += "Mie-";
                }
                if (this.citaParams.jue) {
                    frecuencia += "Jue-";
                }
                if (this.citaParams.vie) {
                    frecuencia += "Vie-";
                }
                if (this.citaParams.sab) {
                    frecuencia += "Sab-";
                }
                if (this.citaParams.dom) {
                    frecuencia += "Dom-";
                }
                frecuencia = frecuencia.slice(0, -1);
                frecuencia += ")";
            }

            correoParams.servicios += "<span>De: </span>" +
                                        "<span>" + moment(this.citaParams.recInicio).format("DD/MM/YYYY") + " a " + moment(this.citaParams.recFin).format("DD/MM/YYYY") + "</span>" +
                                        "<br><br>";
            if (frecuencia == 'Diaria') {
                correoParams.servicios += "<span>" + repeticion + "</span>" +
                                            "</td></tr>";
            }
            else {
                correoParams.servicios += "<span>" + frecuencia + "</span>" +
                                            "<br><br>" +
                                            "<span>" + repeticion + "</span>" +
                                            "</td></tr>";
            }

            correoParams.costo = costoMin == costoMax ? "$" + costoMin.toFixed(2) : "$" + costoMin.toFixed(2) + " - " + "$" + costoMax.toFixed(2);
            correoParams.idioma = "ESP";
            correoParams.id_sucursal = null;

            if (fechaCorreoCita > fechaEnvioCorreos) {
                this._backService.HttpPost("movil/UsuarioMovil/correoResumen", {}, correoParams, "text").subscribe((response: string) => {

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

        var notificacion = {
            idCita: c.idCita,
            tipoNotificacion: 1,
            fecha: moment().format("YYYY-MM-DD"),
            hora: moment().format("HH:mm")
        };

        this._backService.HttpPost("procesos/notificaciones/Notificaciones/enviarNotificacionCita", {}, notificacion, "text").subscribe((response: string) => {

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

        this._backService.HttpPost("movilNegocio/MovilNegocio/consultarTokenUsuario", {}, notificacion).subscribe((response: string) => {
            var dataUsuario = eval(response);
            for(var i = 0; i < dataUsuario.length; i++) {
                $.ajax({
                    type: "POST",
                    url: "https://cp.pushwoosh.com/json/1.3/createMessage",
                    data: JSON.stringify({
                        "request": {
                            "application": "93E98-097A5",
                            "auth": "nVnow9x8tTuq9EoKYbtya1X99D7Ag1kB8qyQLT9KvRpSy2WHqSbo4e9NJFt3WviIR4EfnN86e1bsJscjobRf",
                            "notifications": [{
                                "send_date": "now",
                                "ignore_user_timezone": true,
                                "timezone": "America/Mexico_City",
                                "content": ""+dataUsuario[i].mensaje,
                                "devices": [
                                  ""+dataUsuario[i].uuid
                                ],
                                "filter": ""
                            }]
                        }
                    }),
                    dataType: "json"
                }).done(function(data: any) {

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

    correo_correoCitaModificada (c: any) {
        var params: any = {};
        params.idCita = c.idCita;

        this._backService.HttpPost("movil/AgendaMovil/datosReprogramar", {}, params).subscribe((response: string) => {
            var dataCita = eval(response);
            var fechaCita = moment(dataCita[0].fechaCita);
            var correoParams: any = {};

            var fechaCorreoCita = new Date(fechaCita.format("MM/DD/YY") + " " + dataCita[0].horaInicioServicio.substring(0, 5));
            var fechaEnvioCorreos = new Date();
            fechaEnvioCorreos.setHours(fechaEnvioCorreos.getHours() + this.correo.hrsAnticipacionCitas)

            var costoMin = 0;
            var costoMax = 0;
            var direccion = dataCita[0].calle + " #" + dataCita[0].numero + ", Col. " + dataCita[0].colonia + ", " + dataCita[0].nombre;
            correoParams.horaInicio = dataCita[0].horaInicioServicio.substring(0, 5);
            correoParams.fechaCita = fechaCita.format("DD/MM/YY");
            correoParams.sucursal = dataCita[0].nombreSucursal;
            correoParams.nombre = dataCita[0].nombreCliente;
            if (dataCita[0].emailCliente == null || dataCita[0].emailCliente == undefined) {
                correoParams.email = "";
            }
            else {
                correoParams.email = dataCita[0].emailCliente;
            }

            correoParams.servicios = "<tr><td style='width: 60px;text-align: center;'>" +
                                        `<img src='${environment.urlMigracion}assets/images/system/servicio_correo.png'  width='32' height='55'></td>` +
                                        "<td>Servicio:</td><td>";

            for(var i = 0; i < dataCita.length; i++) {
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
                                        `<img src='${environment.urlMigracion}assets/images/system/ubicacion_correo.png'  width='42' height='55'></td>` +
                                        "<td>Ubicación:</td><td>" + direccion + "</td></tr>" +
                                        "<tr><td style='width: 60px;text-align: center;'>" +
                                        `<img src='${environment.urlMigracion}assets/images/system/telefono_correo.png'  width='34' height='55'></td>` +
                                        "<td>Teléfono:</td><td>" + dataCita[0].telefono + "</td></tr>";
            correoParams.costo = costoMin == costoMax ? "$" + costoMin.toFixed(2) : "$" + costoMin.toFixed(2) + " - " + "$" + costoMax.toFixed(2);
            correoParams.idioma = "ESP";
            correoParams.id_sucursal = null;

            if (fechaCorreoCita > fechaEnvioCorreos) {
                this._backService.HttpPost("movil/UsuarioMovil/correoCitaReprogramada", {}, correoParams, "text").subscribe((response: string) => {

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

        var notificacion = {
            idCita: this.calendario.clickedEvent.cita,
            tipoNotificacion: 2,
            fecha: moment().format("YYYY-MM-DD"),
            hora: moment().format("HH:mm")
        };

        this._backService.HttpPost("procesos/notificaciones/Notificaciones/enviarNotificacionCita", {}, notificacion, "text").subscribe((response: string) => {

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

        this._backService.HttpPost("movilNegocio/MovilNegocio/consultarTokenUsuario", {}, notificacion).subscribe((response: string) => {
            var dataUsuario = eval(response);
            for(var i = 0; i < dataUsuario.length; i++) {
                $.ajax({
                    type: "POST",
                    url: "https://cp.pushwoosh.com/json/1.3/createMessage",
                    data: JSON.stringify({
                        "request": {
                            "application": "93E98-097A5",
                            "auth": "nVnow9x8tTuq9EoKYbtya1X99D7Ag1kB8qyQLT9KvRpSy2WHqSbo4e9NJFt3WviIR4EfnN86e1bsJscjobRf",
                            "notifications": [{
                                "send_date": "now",
                                "ignore_user_timezone": true,
                                "timezone": "America/Mexico_City",
                                "content": ""+dataUsuario[i].mensaje,
                                "devices": [
                                  ""+dataUsuario[i].uuid
                                ],
                                "filter": ""
                            }]
                        }
                    }),
                    dataType: "json"
                }).done(function(data: any) {
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

    correo_correoCitaReprogramada (clickedEvent: any) {
        var params: any = {};
        params.idCita = clickedEvent.cita;

        this._backService.HttpPost("movil/AgendaMovil/datosReprogramar", {}, params).subscribe((response: string) => {
            var dataCita = eval(response);
            var fechaCita = moment(dataCita[0].fechaCita);
            var correoParams: any = {};

            var fechaCorreoCita = new Date(fechaCita.format("MM/DD/YY") + " " + dataCita[0].horaInicioServicio.substring(0, 5));
            var fechaEnvioCorreos = new Date();
            fechaEnvioCorreos.setHours(fechaEnvioCorreos.getHours() + this.correo.hrsAnticipacionCitas);

            var costoMin = 0;
            var costoMax = 0;
            var direccion = dataCita[0].calle + " #" + dataCita[0].numero + ", Col. " + dataCita[0].colonia + ", " + dataCita[0].nombre;
            correoParams.horaInicio = dataCita[0].horaInicioServicio.substring(0, 5);
            correoParams.fechaCita = fechaCita.format("DD/MM/YY");
            correoParams.sucursal = dataCita[0].nombreSucursal;
            correoParams.nombre = dataCita[0].nombreCliente;
            if (dataCita[0].emailCliente == null || dataCita[0].emailCliente == undefined) {
                correoParams.email = "";
            }
            else {
                correoParams.email = dataCita[0].emailCliente;
            }

            correoParams.servicios = "<tr><td style='width: 60px;text-align: center;'>" +
                                     `<img src='${environment.urlMigracion}assets/images/system/servicio_correo.png' width='32' height='55' alt='Logo Servicio Correo'></td>` +
                                     "<td>Servicio:</td><td>";

            for (var i = 0; i < dataCita.length; i++) {
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
                                      `<img src='${environment.urlMigracion}assets/images/system/ubicacion_correo.png' width='43' height='55' alt='Logo Ubicacion Correo'></td>` +
                                      "<td>Ubicación:</td><td>" + direccion + "</td></tr>" +
                                      "<tr><td style='width: 60px;text-align: center;'>" +
                                      `<img src='${environment.urlMigracion}assets/images/system/telefono_correo.png' width='34' height='55' alt='Logo Telefono Correo'></td>` +
                                      "<td>Teléfono:</td><td>" + dataCita[0].telefono + "</td></tr>";

            correoParams.costo = costoMin == costoMax ? "$" + costoMin.toFixed(2) : "$" + costoMin.toFixed(2) + " - " + "$" + costoMax.toFixed(2);
            correoParams.idioma = "ESP";
            correoParams.id_sucursal = null;

            if (fechaCorreoCita > fechaEnvioCorreos) {
                this._backService.HttpPost("movil/UsuarioMovil/correoCitaReprogramada", {}, correoParams, "text").subscribe((response: string) => {

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

        var notificacion: any = {};
        notificacion.idCita = clickedEvent.cita;
        notificacion.tipoNotificacion = 2;
        notificacion.fecha = moment().format("YYYY-MM-DD");
        notificacion.hora = moment().format("HH:mm");

        this._backService.HttpPost("procesos/notificaciones/Notificaciones/enviarNotificacionCita", {}, notificacion, "text").subscribe((response: string) => {

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

        this._backService.HttpPost("movilNegocio/MovilNegocio/consultarTokenUsuario", {}, notificacion).subscribe((response: string) => {
            var dataUsuario = eval(response);
            for (var i = 0; i < dataUsuario.length; i++) {
                $.ajax({
                    type: "POST",
                    url: "https://cp.pushwoosh.com/json/1.3/createMessage",
                    data: JSON.stringify({
                        "request": {
                            "application": "93E98-097A5",
                            "auth": "nVnow9x8tTuq9EoKYbtya1X99D7Ag1kB8qyQLT9KvRpSy2WHqSbo4e9NJFt3WviIR4EfnN86e1bsJscjobRf",
                            "notifications": [{
                                "send_date": "now",
                                "ignore_user_timezone": true,
                                "timezone": "America/Mexico_City",
                                "content": ""+dataUsuario[i].mensaje,
                                "devices": [
                                  ""+dataUsuario[i].uuid
                                ],
                                "filter": ""
                            }]
                        }
                    }),
                    dataType: "json"
                }).done(function(data: any) {

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

    correo_correoCitaCancelada (clickedEvent: any) {
        var params: any = {};
        params.idCita = clickedEvent.cita;

        this._backService.HttpPost("procesos/agenda/Agenda/consultarDatosCorreo", {}, params).subscribe((response: string) => {
            var dataCita = eval(response);
            var fechaCita = moment(dataCita[0].fechaCita);

            var correoParams: any = {};
            var fechaCorreoCita = new Date(fechaCita.format("MM/DD/YY") + " " + dataCita[0].horaInicioServicio.substring(0, 5));
            var fechaEnvioCorreos = new Date();
            fechaEnvioCorreos.setHours(fechaEnvioCorreos.getHours() + this.correo.hrsAnticipacionCitas);

            var costoMin = 0;
            var costoMax = 0;
            var direccion = dataCita[0].calle + " #" + dataCita[0].numero + ", Col. " + dataCita[0].colonia + ", " + dataCita[0].nombre;
            correoParams.horaInicio = dataCita[0].horaInicioServicio.substring(0, 5);
            correoParams.fechaCita = fechaCita.format("DD/MM/YY");
            correoParams.sucursal = dataCita[0].nombreSucursal;
            correoParams.nombre = dataCita[0].nombreCliente;
            if (dataCita[0].emailCliente == null || dataCita[0].emailCliente == undefined) {
                correoParams.email = "";
            }
            else {
                correoParams.email = dataCita[0].emailCliente;
            }

            correoParams.servicios = "<tr><td style='width: 60px;text-align: center;'>" +
                                     `<img src='${environment.urlMigracion}assets/images/system/servicio_correo.png' width='32' height='55' alt='Logo Servicio Correo'></td>` +
                                     "<td>Servicio:</td><td>";

            for (var i = 0; i < dataCita.length; i++) {
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
                                      `<img src='${environment.urlMigracion}assets/images/system/ubicacion_correo.png' width='43' height='55' alt='Logo Ubicacion Correo'></td>` +
                                      "<td>Ubicación:</td><td>" + direccion + "</td></tr>" +
                                      "<tr><td style='width: 60px;text-align: center;'>" +
                                      `<img src='${environment.urlMigracion}assets/images/system/telefono_correo.png' width='34' height='55' alt='Logo Telefono Correo'></td>` +
                                      "<td>Teléfono:</td><td>" + dataCita[0].telefono + "</td></tr>";

            correoParams.costo = costoMin == costoMax ? "$" + costoMin.toFixed(2) : "$" + costoMin.toFixed(2) + " - " + "$" + costoMax.toFixed(2);
            correoParams.idioma = "ESP";
            correoParams.id_sucursal = null;

            if (fechaCorreoCita > fechaEnvioCorreos) {
                this._backService.HttpPost("movil/UsuarioMovil/correoCitaCancelada", {}, correoParams, "text").subscribe((response: string) => {

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

        var notificacion: any = {};
        notificacion.idCita = clickedEvent.cita;
        notificacion.tipoNotificacion = 3;
        notificacion.fecha = moment().format("YYYY-MM-DD");
        notificacion.hora = moment().format("HH:mm");

        this._backService.HttpPost("procesos/notificaciones/Notificaciones/enviarNotificacionCita", {}, notificacion, "text").subscribe((response: string) => {

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

        this._backService.HttpPost("movilNegocio/MovilNegocio/consultarTokenUsuario", {}, notificacion).subscribe((response: string) => {
            var dataUsuario = eval(response);
            for (var i = 0; i < dataUsuario.length; i++) {
                $.ajax({
                    type: "POST",
                    url: "https://cp.pushwoosh.com/json/1.3/createMessage",
                    data: JSON.stringify({
                        "request": {
                            "application": "93E98-097A5",
                            "auth": "nVnow9x8tTuq9EoKYbtya1X99D7Ag1kB8qyQLT9KvRpSy2WHqSbo4e9NJFt3WviIR4EfnN86e1bsJscjobRf",
                            "notifications": [{
                                "send_date": "now",
                                "ignore_user_timezone": true,
                                "timezone": "America/Mexico_City",
                                "content": ""+dataUsuario[i].mensaje,
                                "devices": [
                                  ""+dataUsuario[i].uuid
                                ],
                                "filter": ""
                            }]
                        }
                    }),
                    dataType: "json"
                }).done(function(data: any) {

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

    correo_correoCancelacionRecurrencia (c: any) {
        var params: any = {};
        params.idCita = c.cita
        params.fecha = c.start.format("YYYY-MM-DD");

        this._backService.HttpPost("movil/AgendaMovil/datosCancelarRecurrencia", {}, params).subscribe((response: string) => {
            if(response != "0"){
                var dataRecurrencia = eval(response);
                var recParams: any = {};
                var fechaCita = moment(dataRecurrencia[0].fechaCita);
                var fechaCorreoCita = new Date(fechaCita.format("MM/DD/YY") + " " + dataRecurrencia[0].horaInicio.substring(0, 5));
                var fechaEnvioCorreos = new Date();
                fechaEnvioCorreos.setHours(fechaEnvioCorreos.getHours() + this.correo.hrsAnticipacionCitas)

                var inicio = moment(dataRecurrencia[0].fechaInicio);
                var fin = moment(dataRecurrencia[0].fechaFin);
                var frecuencia = dataRecurrencia[0].frecuencia;
                var repeticion: any = parseInt(dataRecurrencia[0].repeticion);
                var tel = dataRecurrencia[0].telefono;
                var dir = dataRecurrencia[0].direccion;
                if (c.email == null || c.email == undefined) {
                    recParams.email = "";
                }
                else {
                    recParams.email = c.email;
                }
                recParams.sucursal = dataRecurrencia[0].nombre;
                recParams.nombre = c.cliente;

                recParams.fecha = inicio.format("DD/MM/YYYY");

                switch (frecuencia) {
                    case 'Diaria':

                        if (repeticion > 1) {
                            repeticion = "Cada " + String(repeticion) + " Días";
                        } else {
                            repeticion = "Cada día";
                        }

                        break;
                    case 'Semanal':

                        if (repeticion > 1) {
                            repeticion = String(repeticion) + " Semanas";
                        } else {
                            repeticion = "Cada semana";
                        }

                        break;
                    case 'Mensual':

                        if (repeticion > 1) {
                            repeticion = String(repeticion) + " Meses";
                        } else {
                            repeticion = "Cada mes";
                        }
                        break;
                }

                if (frecuencia == "Semanal") {
                    frecuencia += "(";
                    if (dataRecurrencia[0].lunes == "1") {
                        frecuencia += "Lun-";
                    }
                    if (dataRecurrencia[0].martes == "1") {
                        frecuencia += "Mar-";
                    }
                    if (dataRecurrencia[0].miercoles == "1") {
                        frecuencia += "Mie-";
                    }
                    if (dataRecurrencia[0].jueves == "1") {
                        frecuencia += "Jue-";
                    }
                    if (dataRecurrencia[0].viernes == "1") {
                        frecuencia += "Vie-";
                    }
                    if (dataRecurrencia[0].sabado == "1") {
                        frecuencia += "Sab-";
                    }
                    if (dataRecurrencia[0].domingo == "1") {
                        frecuencia += "Dom-";
                    }
                    frecuencia = frecuencia.slice(0, -1);
                    frecuencia += ")";
                }

                recParams.recurrencia = '<span>De: </span>' +
                                            '<span>' + inicio.format("DD/MM/YYYY") + ' a ' + fin.format("DD/MM/YYYY") + '</span>' +
                                            '<br><br>';
                if (frecuencia == 'Diaria') {
                    recParams.recurrencia += '<span>' + repeticion + '</span>' +
                                        '</div>'
                }
                else {
                    recParams.recurrencia += '<span>' + frecuencia + '</span>' +
                                            '<br><br>' +
                                            '<span>' + repeticion + '</span>' +
                                        '</div>'
                }

                var direccion = `<tr><td style='width: 60px;text-align: center;'><img src='${environment.urlMigracion}assets/images/system/ubicacion_correo.png' width='43' height='55' alt='Logo Ubicacion Correo'></td>` +
                                "<td>Ubicación:</td><td>" + dir + "</td></tr>"
                                + "<tr bgcolor='#e6e6e6'><td style='width: 60px;text-align: center;'>" +
                                `<img src='${environment.urlMigracion}assets/images/system/telefono_correo.png' width='34' height='55' alt='Logo Telefono Correo'></td>` +
                                "<td>Teléfono:</td><td>" + tel + "</td></tr>";

                recParams.direccion = direccion;
                recParams.idioma = "ESP";
                recParams.id_sucursal = null;

                if (fechaCorreoCita > fechaEnvioCorreos) {
                    this._backService.HttpPost("movil/UsuarioMovil/correoCancelacionCitaRecurrencia", {}, recParams, "text").subscribe((response: string) => {

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

        var notificacion = {
            idCita: c.cita,
            tipoNotificacion: 3,
            fecha: moment().format("YYYY-MM-DD"),
            hora: moment().format("HH:mm")
        };

        this._backService.HttpPost("procesos/notificaciones/Notificaciones/enviarNotificacionCita", {}, notificacion, "text").subscribe((response: string) => {

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

        this._backService.HttpPost("movilNegocio/MovilNegocio/consultarTokenUsuario", {}, notificacion).subscribe((response: string) => {
            var dataUsuario = eval(response);
            for(var i = 0; i < dataUsuario.length; i++) {
                $.ajax({
                    type: "POST",
                    url: "https://cp.pushwoosh.com/json/1.3/createMessage",
                    data: JSON.stringify({
                        "request": {
                            "application": "93E98-097A5",
                            "auth": "nVnow9x8tTuq9EoKYbtya1X99D7Ag1kB8qyQLT9KvRpSy2WHqSbo4e9NJFt3WviIR4EfnN86e1bsJscjobRf",
                            "notifications": [{
                                "send_date": "now",
                                "ignore_user_timezone": true,
                                "timezone": "America/Mexico_City",
                                "content": ""+dataUsuario[i].mensaje,
                                "devices": [
                                  ""+dataUsuario[i].uuid
                                ],
                                "filter": ""
                            }]
                        }
                    }),
                    dataType: "json"
                }).done(function(data: any) {
                    console.log(data);
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

    rootScope_funcionMandarCorreoTicket (data: any) {
        // if (this.rootScope_caja.venta.ticket.emailCliente) {
        //     this._pantallaServicio.mostrarSpinner();
        //     var params: any = {};
        //     params.data = data;
        //     params.email = this.rootScope_caja.venta.ticket.emailCliente;
        //     params.sucursal = this.nSucursal.toString();

        //     this._backService.HttpPost("movil/UsuarioMovil/enviarCorreoTicket", {}, params, "text").subscribe((response: string) => {
        //         this._pantallaServicio.ocultarSpinner();
        //         this._toaster.success(this.agendaTranslate.reciboCorreoEnviado);
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
        //     this._toaster.error(this.agendaTranslate.reciboClienteSinEmail);
        // }
    }

    rootScope_funcionMandarCorreoTicketCorteCaja (data: any) {
        // var params: any = {};
        // params.data = data;

        // this._backService.HttpPost("procesos/agenda/Agenda/consultarUsuariosAdministradores", {}, params).subscribe((response: string) => {
        //     var usuariosadmin = eval(response);
        //     if (usuariosadmin.length > 0) {
        //         params.email = usuariosadmin[0].email;
        //         params.sucursal = this.nSucursal.toString();

        //         this._backService.HttpPost("movil/UsuarioMovil/enviarCorreoTicket", {}, params, "text").subscribe((response: string) => {
        //             this._pantallaServicio.ocultarSpinner();
        //             this._toaster.success(this.agendaTranslate.reciboCorreoEnviado);
        //         },
        //         (error) => {
        //             this._pantallaServicio.ocultarSpinner();
        //             if (error == 'SinSesion' || error == 'SesionCaducada') {
        //                 if (error == 'SinSesion') {
        //                 this._toaster.error(this.sessionTraslate.favorIniciarSesion);
        //                 }
        //                 if (error == 'SesionCaducada') {
        //                 this._toaster.error(this.sessionTraslate.sesionCaducada);
        //                 }
        //                 this._router.navigate(['/login']);
        //                 return;
        //             }
        //             this._toaster.error(this.sessionTraslate.errorEliminar);
        //         });
        //     }
        //     else {
        //         this._toaster.error(this.agendaTranslate.reciboClienteSinEmail);
        //     }
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
        //     this._toaster.error(this.sessionTraslate.errorEliminar);
        // });
    }


    // ---------------------------------------------------------- FUNCIONES DE LA EXPORTACIÓN -----------------------------------------------------------
    exportar_exportarAgenda(){
        var nombreExcel = "Agenda" + "_" + JSON.parse(JSON.stringify(moment(this.calendario.fechaActualCalendario).format('DD-MM-YYYY')));

        this.exportar.data = [];
        var idCitaDetalleAux = "";
        for(var i = 0; i < this.citas.length; i++){
            if(idCitaDetalleAux != this.citas[i].id){
                idCitaDetalleAux = this.citas[i].id;
                this.exportar.data.push(JSON.parse(JSON.stringify(this.citas[i])));
            }
        }

        if(this.exportar.data.length != 0){
            this.exportar.dataPrimerRegistro = JSON.parse(JSON.stringify(this.exportar.data[0]));
        }

        // Se obtiene el nombre de las columnas que se van a exportar
        this.exportar.dataColumnas = [];
        var columnas = Object.keys(this.exportar.dataPrimerRegistro);
        for (var i = 0; i < columnas.length; i++) {
            if(columnas[i] == "personal" || columnas[i] == "servicio" || columnas[i] == "fechaCita"
                || columnas[i] == "costoMinimo" || columnas[i] == "costoMaximo" || columnas[i] == "duracion"
                || columnas[i] == "horaInicio" || columnas[i] == "horaFin" || columnas[i] == "estatus"
                || columnas[i] == "cliente" || columnas[i] == "emailCliente" || columnas[i] == "telefonoCliente"
                || columnas[i] == "nota" || columnas[i] == "paqueteNota"){
                this.exportar.dataColumnas.push(columnas[i]);
            }
        }

        // Se le da formato a los datos de la información a exportar
        var dataCopia = JSON.parse(JSON.stringify(this.exportar.data));
        this.exportar_formatearDataAExportar(dataCopia);

        // Se crea el excel solo si hay datos a exportar
        if (this.exportar.dataExportar.length > 0) {
            this.exportar_formatearDataJson(this.exportar.dataColumnas, this.exportar.dataExportar);
            this.exportar_crearExcel(this.exportar.dataColumnas, this.exportar.dataJSON, nombreExcel);
        }
        else {
            this._toaster.error("No hay citas para descargar en el rango seleccionado");
        }
    }

    exportar_formatearDataAExportar(data: any){
        this.exportar.dataExportar = [];

        for (var i = 0; i < data.length; i++) {
            var Objeto: any = {};
            if (data[i].personal == null || data[i].personal == undefined) {
                Objeto.personal = " ";
            } else {
                Objeto.personal = data[i].personal;
            }
            if (data[i].servicio == null || data[i].servicio == undefined) {
                Objeto.servicio = " ";
            } else {
                Objeto.servicio = data[i].servicio;
            }
            if (data[i].fechaCita == null || data[i].fechaCita == undefined) {
                Objeto.fechaCita = " ";
            } else {
                Objeto.fechaCita = data[i].fechaCita.substr(0, 10).replace("-", "/");
            }
            if (data[i].costoMinimo == null || data[i].costoMinimo == undefined) {
                Objeto.costoMinimo = " ";
            } else {
                Objeto.costoMinimo = data[i].costoMinimo;
            }
            if (data[i].costoMaximo == null || data[i].costoMaximo == undefined) {
                Objeto.costoMaximo = " ";
            } else {
                Objeto.costoMaximo = data[i].costoMaximo;
            }
            if (data[i].duracion == null || data[i].duracion == undefined) {
                Objeto.duracion = " ";
            } else {
                Objeto.duracion = data[i].duracion;
            }
            if (data[i].horaInicio == null || data[i].horaInicio == undefined) {
                Objeto.horaInicio = " ";
            } else {
                Objeto.horaInicio = data[i].horaInicio;
            }
            if (data[i].horaFin == null || data[i].horaFin == undefined) {
                Objeto.horaFin = " ";
            } else {
                Objeto.horaFin = data[i].horaFin;
            }
            if (data[i].estatus == null || data[i].estatus == undefined) {
                Objeto.estatus = " ";
            } else {
                switch (data[i].estatus) {
                    case 1:
                        Objeto.estatus = "Pendiente";
                        break;
                    case 2:
                        Objeto.estatus = "En proceso";
                        break;
                    case 3:
                        Objeto.estatus = "Terminada";
                        break;
                    case 4:
                        Objeto.estatus = "Cancelada";
                        break;
                    case 5:
                        Objeto.estatus = "Confirmada";
                        break;
                    case 6:
                        Objeto.estatus = "No Asistio";
                        break;
                }
            }
            if (data[i].cliente == null || data[i].cliente == undefined) {
                Objeto.cliente = " ";
            } else {
                Objeto.cliente = data[i].cliente;
            }
            if (data[i].emailCliente == null || data[i].emailCliente == undefined) {
                Objeto.emailCliente = " ";
            } else {
                Objeto.emailCliente = data[i].emailCliente;
            }
            if (data[i].telefonoCliente == null || data[i].telefonoCliente == undefined) {
                Objeto.telefonoCliente = " ";
            } else {
                Objeto.telefonoCliente = data[i].telefonoCliente;
            }
            if (data[i].nota == null || data[i].nota == undefined) {
                Objeto.nota = " ";
            } else {
                Objeto.nota = data[i].nota;
            }
            if (data[i].paqueteNota == null || data[i].paqueteNota == undefined || data[i].paqueteNota == "") {
                Objeto.paqueteNota = " ";
            } else {
                Objeto.paqueteNota = '"' + data[i].paqueteNota + '"';
            }
            this.exportar.dataExportar.push(Objeto);
        }
    }

    exportar_formatearDataJson (columnas: any, data: any) {
        var dataJson = "";

        for(var i = 0; i < data.length; i++){
            var evento = data[i];
            var registro = '{';

            for(var j = 0; j < columnas.length; j++){
                var col = columnas[j];

                if (evento[col] !== undefined || evento[col] == null) {
                    if (evento[col] == null || evento[col] == "") {
                        var espaciovacio = " ";
                        registro += "\"" + col + "\"" + ":" + "\"" + espaciovacio.toString().split('"').join('\'') + "\",";
                    } else {
                        registro += "\"" + col + "\"" + ":" + "\"" + evento[col.toString()].toString().split('"').join('\'') + "\",";
                    }
                }
            }

            registro = registro.substring(0, registro.length - 1);
            if(i != (data.length - 1)){
                registro += "},";
            }
            else{
                registro += "}";
            }
            dataJson += registro;
        }

        this.exportar.dataJSON = $.parseJSON('[' + dataJson.replace(/(?:\r\n|\r|\n)/g, ' ') + ']');
    }

    exportar_crearExcel (columnas: any, dataJson: any, nombreExcel: any) {
        this.exportar_crearExcelHeaders(columnas);
        var tabla = '<table><tr>';
        var headersString = "";
        for(var i = 0; i < this.exportar.excel.headers.length; i++){
            var header = this.exportar.excel.headers[i];
            if (header.name != "Acciones" && header.name != "Actions") {
                headersString += '<th>' + header.displayName + '</th>';
            }
        }

        tabla += headersString + "</tr>";

        for(var i = 0; i < dataJson.length; i++){
            var row = dataJson[i];

            var dataRow = this.exportar_crearExcelRow(row);
            tabla += dataRow;
        }

        tabla += "</table>";
        var ebi_excelTable : any = document.getElementById("excelTable");
        ebi_excelTable.innerHTML = tabla;

        var blob = new Blob(["\ufeff", tabla], { type: "text/plain;charset=utf-8" });
        //var blob = new Blob([tabla], { type: "text/plain;charset=utf-8" });
        saveAs(blob, nombreExcel + ".xls");
    }

    exportar_crearExcelHeaders (columnas: any) {
        this.exportar.excel.headers = [];

        for(var i = 0; i < columnas.length; i++){
            var col = columnas[i];

            var element: any = {};
            if (col != undefined) {
                element.name = JSON.parse(JSON.stringify(col));
                element.displayName = JSON.parse(JSON.stringify(col));
                element.displayName = element.displayName.charAt(0).toUpperCase() + element.displayName.substr(1);
                element.displayName = element.displayName.match(/[A-Z][a-z]+|[0-9]+/g).join(" ");
                this.exportar.excel.headers.push(element);
            }
        }
    }

    exportar_crearExcelRow (dataRow: any) {
        var value = '';
        var row = "<tr>";
        for(var i = 0; i < this.exportar.excel.headers.length; i++){
            var elem = this.exportar.excel.headers[i];
            if (dataRow[elem.name] == undefined) {
                value = '';
            }
            else {
                value = dataRow[elem.name];
            }
            if (value.length > 0) {
                row += '<td>' + value + '</td>';
            }
        }
        row += "</tr>";
        return row;
    }


    // -------------------------------------------------------------- FUNCIONES INDICADORES -------------------------------------------------------------
    ocultarIndicadores () {
        this.toggleIndicadores = !this.toggleIndicadores;
        if (this.toggleIndicadores) {
            $('.fa-sort-asc').toggleClass('fa-sort-desc', true);
            $('.fa-sort-desc').toggleClass('fa-sort-asc', false);
            $(".indicador-toggle").hide("blind");
        }
        else {
            $('.fa-sort-desc').toggleClass('fa-sort-asc', true);
            $('.fa-sort-asc').toggleClass('fa-sort-desc', false);
            $(".indicador-toggle").show("blind");
        }
    }

    indicadores_ingresosDetalle_mostrarIngresosDetalle () {
        this._pantallaServicio.mostrarSpinner();
        this.indicadores.ingresosDetalle.fechaInicio = moment(new Date()).format('DD/MM/YYYY');
        this.indicadores.ingresosDetalle.fechaFin = moment(new Date()).format('DD/MM/YYYY');

        this.indicadores_ingresosDetalle_inicializarCalendario();
        this.indicadores_ingresosDetalle_consultaCorteDiaAgenda();
        this.modales.modalCorteDia.show();
    }

    indicadores_ingresosDetalle_inicializarCalendario() {
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
            [dias]: [moment().subtract(6, 'days'), moment()], //subtract
            [meses]: [moment().startOf('month'), moment().endOf('month')],
            [años]: [moment().startOf('year'), moment().endOf('year')]
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
        //this.reporte.fechas = {startDate: this.corteDiaAgendaFechaInicio, endDate: this.corteDiaAgendaFechaFin};

        // $('input[name="calendarioCorteDiaAgenda"]').daterangepicker({
        //     startDate: this.corteDiaAgendaFechaInicio,
        //     endDate: this.corteDiaAgendaFechaFin,

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

        var fechaC = this.indicadores.ingresosDetalle.fechaInicio + " - " + this.indicadores.ingresosDetalle.fechaFin;
        this.indicadores.ingresosDetalle.fechas.startDate = this.indicadores.ingresosDetalle.fechaInicio;
        this.indicadores.ingresosDetalle.fechas.endDate = this.indicadores.ingresosDetalle.fechaFin
        this.indicadores.ingresosDetalle.fechaCalendario = fechaC;
    }

    indicadores_ingresosDetalle_consultaCorteDiaAgenda () {
        this.indicadores.ingresosDetalle.dataMetodosPago = [];
        this.indicadores.ingresosDetalle.dataDevoluciones = [];
        this.indicadores.ingresosDetalle.dataRetiroEfectivo = [];
        this.indicadores.ingresosDetalle.total = 0;

        this._pantallaServicio.mostrarSpinner();
        var params: any = {};

        /*var fechasAux = this.indicadores.ingresosDetalle.fechaCalendario.split(" - ");
        var f1 = fechasAux[0].split('/');
        var f2 = fechasAux[1].split('/');

        params.fechaInicio = new Date();
        params.fechaFin = new Date();
        params.fechaInicio.setFullYear(f1[2], f1[1]-1, f1[0]);
        params.fechaFin.setFullYear(f2[2], f2[1]-1, f2[0]);
        params.fechaInicio.setHours(0, 0, 0, 0);
        params.fechaFin.setHours(0, 0, 0, 0);*/

        var fechaBusquedaSplit = [this.indicadores.ingresosDetalle.fechas.startDate, this.indicadores.ingresosDetalle.fechas.endDate];
        params.fechaInicio = (moment(JSON.parse(JSON.stringify(fechaBusquedaSplit[0])), 'DD/MM/YYYY').startOf('day')).format('YYYY-MM-DD HH:mm:ss');
        params.fechaFin = (moment(JSON.parse(JSON.stringify(fechaBusquedaSplit[1])), 'DD/MM/YYYY').endOf('day')).format('YYYY-MM-DD HH:mm:ss');

        if(params.fechaInicio == "Invalid date" || params.fechaFin == "Invalid date"){
            params.fechaInicio = moment(new Date( this.indicadores.ingresosDetalle.fechas.startDate['$y'], this.indicadores.ingresosDetalle.fechas.startDate['$M'],this.indicadores.ingresosDetalle.fechas.startDate['$D'] )).startOf('day').format('YYYY-MM-DD HH:mm:ss');
            params.fechaFin = moment(new Date( this.indicadores.ingresosDetalle.fechas.endDate['$y'], this.indicadores.ingresosDetalle.fechas.endDate['$M'], this.indicadores.ingresosDetalle.fechas.endDate['$D'] )).endOf('day').format('YYYY-MM-DD HH:mm:ss');
        }

        this._backService.HttpPost("procesos/agenda/Agenda/consultaCorteDia", {}, params).subscribe((response: string) => {
            var dataTemp = eval(response);
            this.indicadores.ingresosDetalle.dataMetodosPago = dataTemp[0];
            this.indicadores.ingresosDetalle.dataDevoluciones = dataTemp[1];
            this.indicadores.ingresosDetalle.dataRetiroEfectivo = dataTemp[2];

            this.indicadores.ingresosDetalle.total = 0;
            for (var i = 0; i < this.indicadores.ingresosDetalle.dataMetodosPago.length; i++) {
                this.indicadores.ingresosDetalle.total = this.indicadores.ingresosDetalle.total + this.indicadores.ingresosDetalle.dataMetodosPago[i].total;
            }

            for (var i = 0; i < this.indicadores.ingresosDetalle.dataDevoluciones.length; i++) {
                this.indicadores.ingresosDetalle.total = this.indicadores.ingresosDetalle.total - this.indicadores.ingresosDetalle.dataDevoluciones[i].total;
            }

            for (var i = 0; i < this.indicadores.ingresosDetalle.dataRetiroEfectivo.length; i++) {
                this.indicadores.ingresosDetalle.total = this.indicadores.ingresosDetalle.total - this.indicadores.ingresosDetalle.dataRetiroEfectivo[i].total;
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


    // ---------------------------------------------------------- FUNCIONES BUSCADOR CLIENTES  ----------------------------------------------------------
    consultaHistorialCitasCliente() {
        var params: any = {};
        params.idCliente = this.idCliente;
        params.fechaReferencia = new Date();
        if (this.idCliente) {
            this._backService.HttpPost("procesos/agenda/Agenda/selectProximaCita", {}, params).subscribe((response: string) => {
                this.dataHistorialCitas = eval(response);
                this.alturaDivAgendaHistorial = (this.dataHistorialCitas.length * 72) + 30;
                this.consultaCitasExitosa = true;

                if (this.dataHistorialCitas.length != 0) {
                    this.sinHistorialCitas = false;
                    var weekdays = new Array(7);
                    weekdays[0] = this.sucursalTranslate.domingo;
                    weekdays[1] = this.sucursalTranslate.lunes;
                    weekdays[2] = this.sucursalTranslate.martes;
                    weekdays[3] = this.sucursalTranslate.miercoles;
                    weekdays[4] = this.sucursalTranslate.jueves;
                    weekdays[5] = this.sucursalTranslate.viernes;
                    weekdays[6] = this.sucursalTranslate.sabado;

                    for (var i = 0; i < this.dataHistorialCitas.length; i++) {
                        var newdate = this.dataHistorialCitas[i].fechaCita.split("/").reverse().join("-");
                        var d = moment(newdate);
                        this.dataHistorialCitas[i].fechaMostrar = moment(this.dataHistorialCitas[i].fechaCita).format("DD/MM/yyyy");
                        this.dataHistorialCitas[i].fechaMostrar = weekdays[d.day()] + " " + this.dataHistorialCitas[i].fechaMostrar;
                        this.dataHistorialCitas[i].horaInicio = this.dataHistorialCitas[i].horaInicio.substring(0, 5);
                        this.dataHistorialCitas[i].fechaCita = moment(this.dataHistorialCitas[i].fechaCita).format("yyyy-MM-DD");
                        var fechaHoy = new Date();
                        fechaHoy.setHours(0, 0, 0, 0)
                        if (this.dataHistorialCitas[i].idCitaEstatus == 3) {
                            this.dataHistorialCitas[i].citaPasada = true;
                        }
                        else {
                            this.dataHistorialCitas[i].citaPasada = false;
                        }

                        // this.dataHistorialCitas[i].costoMinimo = "$ " + this.dataHistorialCitas[i].costoMinimo;
                    }
                }
                else {
                    this.sinHistorialCitas = true;
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
            this.consultaCitasExitosa = false;
            this.dataAlgo = [];
            this.idCliente = null;
        }
    }

    verDatosCliente() {
        var historial = this.idCliente;
        this._router.navigate(['catalogos/cliente-creacion-edicion'], {
            queryParams: { idCliente: historial},
        });
    }

    seleccionarCitaHistorial(infoCita: any) {
        this.historialClientes.citaSeleccionada = infoCita;

        this.calendario.viewActual = "resourceDay";
        this.calendario.fechaActualCalendario = this.historialClientes.citaSeleccionada.fechaCita;

        this.historialClientes.mostrarEdicion = false;
        this.historialClientes.mostrarTicket = false;

        if (this.historialClientes.citaSeleccionada.idCitaEstatus == 3) {
            this.historialClientes.mostrarEdicion = false;
            this.historialClientes.mostrarTicket = true;
        }
        else{

            if (this.historialClientes.citaSeleccionada.idCitaEstatus == 6) {
                this.historialClientes.mostrarEdicion = false;
                this.historialClientes.mostrarTicket = false;
            }
            else{
                this.historialClientes.mostrarEdicion = true;
                this.historialClientes.mostrarTicket = false;
            }
        }

        this.consultarCitas();
    }

    mouseEnterHistorial(x: any) {
        $("#citaHistorial" + x).css("opacity", ".6");
    }

    mouseLeaveHistorial(x: any) {
        $("#citaHistorial" + x).css("opacity", "1");
    }

    irAlCliente(idClienteAux: any) {
        $(".fc-timegrid-event").popover('hide');
        this._router.navigate(['catalogos/cliente-creacion-edicion'], {
            queryParams: { idCliente: idClienteAux},
        });
    }

    focusUiSelectCliente() {
        // setTimeout(function () {
        //     $("#uiSelectClienteBuscador")[0].children[1].children[0].children[0].id = "search-uiSelectCliente";
        //     $("#search-uiSelectCliente").focus();
        // }, 10);
    }


    // ---------------------------------------------------------------- NOTAS DEL CLIENTE ---------------------------------------------------------------
    notasClientes_funciones_prepararNotasCliente () {
        this.timeoutAux = setTimeout(() => {
            this._pantallaServicio.mostrarSpinner();
            this.calendario.mostrarEventPopup = false;
            $(".fc-timegrid-event").popover('hide');

            this.notasClientes_funciones_abrirNotas();
        }, 100);
    }

    notasClientes_funciones_abrirNotas () {
        this.notasClientes.vista = 0; //0: Consulta, 1:Nueva, 2:Editar
        this.notasClientes.submittedNotas = false;

        this.notasClientes_funciones_consultaNotas();
        this.notasClientes_funciones_abrirModal();
    }

    notasClientes_funciones_consultaNotas () {
        var params: any = {};
        params.idCliente = this.calendario.clickedEvent.idCliente;

        this._backService.HttpPost("catalogos/Cliente/consultaNotas", {}, params).subscribe((response: string) => {
            this.notasClientes.dataNotas = eval(response);
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

    notasClientes_funciones_nuevaNota () {
        this.notasClientes.vista = 1;
        this.notasClientes.alerta = false;
        this.notasClientes.comentario = null;
        $("#notas-comentario").removeClass("errorCampo");
    }

    notasClientes_funciones_guardarNota () {
        this.notasClientes.submittedNotas = true;

        var isValid = true;
        if (!this.notasClientes.comentario) {
            $("#notas-comentario").addClass("errorCampo");
            isValid = false;
        }
        if (isValid) {
            var params: any = {};
            params.comentario = this.notasClientes.comentario;
            params.esAlerta = this.notasClientes.alerta ? 1 : 0;
            params.idCliente = this.calendario.clickedEvent.idCliente;

            this._backService.HttpPost("catalogos/Cliente/guardarNota", {}, params).subscribe((response: string) => {
                this.notasClientes_funciones_volverConsultaNotas();
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

    notasClientes_funciones_cargarVistaPrevia (entity: any) {
        this.notasClientes.vistaPrevia = true;
        $('#onoffswitch1').addClass('onoffswitch-inner-disable');
        this.notasClientes_funciones_cargarNota(entity);
    }

    notasClientes_funciones_cargarNota (row: any) {
        var params: any = {};
        this.notasClientes.idNota = row.idNota;
        params.idCliente = this.calendario.clickedEvent.idCliente;
        params.idNota = row.idNota;

        this._backService.HttpPost("catalogos/Cliente/cargarNota", {}, params).subscribe((response: string) => {
            var temp = eval(response)[0];
            $("#notas-comentario").removeClass("errorCampo");
            this.notasClientes.comentario = temp.comentario;
            this.notasClientes.alerta = temp.esAlerta;
            this.notasClientes.vista = 2;
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

    notasClientes_funciones_actualizarNota () {
        this.notasClientes.submittedNotas = true;

        var isValid = true;
        if (!this.notasClientes.comentario) {
            $("#notas-comentario").addClass("errorCampo");
            isValid = false;
        }
        if (isValid) {
            var params: any = {};
            params.idNota = this.notasClientes.idNota;
            params.comentario = this.notasClientes.comentario;
            params.esAlerta = this.notasClientes.alerta ? 1 : 0;

            this._backService.HttpPost("catalogos/Cliente/actualizarNota", {}, params).subscribe((response: string) => {
                this.notasClientes_funciones_volverConsultaNotas();
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

    notasClientes_funciones_preparacionBorrarNota (row: any) {
        this.notasClientes.idNota = row.idNota;
        this.notasClientes_funciones_borrarNotaConfirm(this.agendaTranslate.borrarNota);
    }

    notasClientes_funciones_borrarNota () {
        var params: any = {};
        params.idNota = this.notasClientes.idNota;

        this._backService.HttpPost("catalogos/Cliente/borrarNota", {}, params).subscribe((response: string) => {
            this.notasClientes_funciones_volverConsultaNotas();
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

    notasClientes_funciones_volverConsultaNotas () {
        this.notasClientes_funciones_consultaNotas();
        this.notasClientes.submittedNotas = false;
        this.notasClientes.comentario = null;
        this.notasClientes.alerta = null;
        this.notasClientes.vista = 0;
        this.notasClientes.vistaPrevia = false;
        $('#onoffswitch1').removeClass('onoffswitch-inner-disable');
    }

    notasClientes_funciones_cerrarModalNotasX () {
        this.notasClientes.vistaPrevia = false;
        $('#onoffswitch1').removeClass('onoffswitch-inner-disable');

        // Verificar que haya notas de cliente con alerta
        var esAlert = false;
        for(var i = 0; i < this.notasClientes.dataNotas.length; i++){
            var elem = JSON.parse(JSON.stringify(this.notasClientes.dataNotas[i]));
            if(elem.esAlerta){
                esAlert = true;
            }
        }

        // Si no hay notas en alerta
        if(!esAlert){

            // Se recorren todas las citas y se marca que el cliente ya no cuenta con notas en alerta
            for(var i = 0; i < this.citas.length; i++){
                var elem = this.citas[i];
                if(elem.idCliente == this.calendario.clickedEvent.idCliente){
                    elem.notasCliente = 0;
                }
            }

            // Se vuelve a crear el calendario con la nueva información de citas
            this.events = [];
            for(var i = 0; i < this.citas.length; i++){
                if(this.calendario.viewActual == "resourceDay"){
                    this.events.push(this.citas[i]);
                }
                if(this.calendario.viewActual == "agendaWeek"){
                    if(this.citas[i].resourceId == this.resourceSemana){
                        this.events.push(this.citas[i]);
                    }
                }
            }

            for(var i = 0; i < this.excepciones.length; i++){
                if(this.calendario.viewActual == "resourceDay"){
                    this.events.push(this.excepciones[i]);
                }
                if(this.calendario.viewActual == "agendaWeek"){
                    if(this.excepciones[i].resourceId == this.resourceSemana){
                        this.events.push(this.excepciones[i]);
                    }
                }
            }

            this.calendario.clickedEvent = {};
            this.calendario.clickedEvent = {
                start: moment(),
                end: moment(),
                idCliente: null,
                cliente: null,
                emailCliente: null,
                telefono: null,
                citasRelacionadas: [],
                realizoAlta: null,
                fechaCreacion: moment(),
                estatus: null,
                esRecurrente: null,
                nota: null
            };
            this.calendario.idCitaActualizar = "";

            this._pantallaServicio.ocultarSpinner();
            // $('#calendar').fullCalendar('destroy');

            this.calendario_crearCalendario();
        }
    }

    notasClientes_funciones_inputFocus (val: any, id: any, /*esInvalido: any*/) {
        if (/*!esInvalido*/ val != undefined){
            $("#" + id).removeClass("errorCampo");
        }
    }

    notasClientes_funciones_inputBlurNotas (val: any, id: any) {
        if (this.notasClientes.submittedNotas) {
            switch (id) {
                case "notas-comentario":
                    if (val)
                        $("#" + id).removeClass("errorCampo");
                    else {
                        $("#" + id).addClass("errorCampo");
                    }
                    break;
            }
        }
    }

    notasClientes_funciones_abrirModal () {
        this.modales.modalNotasCliente.show();
    }

    notasClientes_funciones_borrarNotaConfirm (message: any) {
        this.modales.modalNotasClienteBorrarConfirm.show();
        $("#notas-cliente-borrar-confirm .modal-body").html('<span class="title">' + message + '</span>');
    }

    //FUNCION PARA OCULTAR NS POPOVER DE CITA
    cerrarPopoverDetalleCita () {
        this.calendario.mostrarEventPopup = false;
        $(".fc-timegrid-event").popover('hide');
    }


    // ---------------------------------------------------------------- FUNCIONES EXTRA ---------------------------------------------------------------
    displayAutoListaCliente(item: any) {
        return item ? item.nombre : '';
    }

    valFecha(e: any) {
        var key;
        if (window.event) // IE
        {
            key = e.keyCode;
        }
        else if (e.which) // Netscape/Firefox/Opera
        {
            key = e.which;
        }
        if (key < 47 || key > 57) {
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

    isInvalidDate = (m: moment.Moment) =>  {
        return this.invalidDates.some(d => d.isSame(m, 'day') )
    }

    cerrarModalCorteDia(){
        this.modales.modalCorteDia.hide();
    }

    onScrollTest(ev: any) {
        if (this.virtualScroll.getRenderedRange().end === this.dataClienteBuscadorBuffer.length && !this.autocompleteTrigger.panelOpen) {
            // Load more options if needed
            console.log('Reached end of scroll. Load more options here.');
        }
    }


    // ----------------------------------------------------------- FUNCIÓN PRINCIPAL DE CARGA -----------------------------------------------------------
    funcionPrincipal(){
        this._pantallaServicio.mostrarSpinner();

        this._backService.HttpPost("catalogos/ConfiguracionPerfil/ConsultaVariblesSession", {}, {}).subscribe((response: string) => {
            this.accesosPantallaAgenda = {};
            var dataTemp = eval(response);

            for (var i = 0; i < dataTemp.length; i++) {
                switch(dataTemp[i].Codigo){
                    case 'AGENCAT001':
                        this.accesosPantallaAgenda.indicadores = Number(dataTemp[i].Valor);
                        break;

                    case 'AGENCAT002':
                        this.accesosPantallaAgenda.todasLasAgendas = Number(dataTemp[i].Valor);
                        break;

                    case 'AGENCAT003':
                        this.accesosPantallaAgenda.descargarExcel = Number(dataTemp[i].Valor);
                        break;

                    case 'AGENCAT004':
                        this.accesosPantallaAgenda.visualizarAgenda = Number(dataTemp[i].Valor);
                        break;

                    case 'AGENCAT005':
                        this.accesosPantallaAgenda.agendar = Number(dataTemp[i].Valor);
                        break;

                    case 'AGENCAT006':
                        this.accesosPantallaAgenda.cambiarEstatusCita = Number(dataTemp[i].Valor);
                        break;

                    case 'AGENCAT007':
                        this.accesosPantallaAgenda.OpcionNuevoReferencia = dataTemp[i].Valor;
                        break;
                }
            }

            this.cargarAgenda();
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
