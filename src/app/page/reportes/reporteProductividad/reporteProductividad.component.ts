import { Component, OnInit, ViewChild } from '@angular/core';
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
import { MatSort } from '@angular/material/sort';
import { Chart, CategoryScale } from 'chart.js/auto';
import { retry } from 'rxjs';
import { MatTabGroup } from '@angular/material/tabs';
import { jsPDF } from 'jspdf';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import dayjs from 'dayjs';

@Component({
    selector: 'app-reporteProductividad',
    templateUrl: './reporteProductividad.component.html',
    styleUrls: ['./reporteProductividad.component.scss', '../../page.component.scss'],
})

export class ReporteProductividadComponent implements OnInit {
    // Variables de Translate
    reporteProductividadTranslate: any = {};
    calendarioTranslate: any = {};
    promocionTranslate: any = {};
    sessionTraslate: any = {};
    agendaTranslate: any = {};

    // Modales
    modales: any = {}; 

    constructor(private _translate: TranslateService, private _backService: MethodsService, public _pantallaServicio: PantallaService, private _dialog: MatDialog, private _router: Router, private _toaster: ToasterService, private matIconRegistry: MatIconRegistry, private domSanitizer: DomSanitizer) {
        this._translate.setDefaultLang(this._pantallaServicio.idioma);
        this._translate.use(this._pantallaServicio.idioma);

        this._translate.get('calendarioTranslate').subscribe((translated: string) => {  
            this.calendarioTranslate = this._translate.instant('calendarioTranslate');
            this.sessionTraslate = this._translate.instant('sessionTraslate');
            this.agendaTranslate = this._translate.instant('agendaTranslate');
            this.reporteProductividadTranslate = this._translate.instant('reporteProductividad');
            this.promocionTranslate = this._translate.instant('promocionTranslate');
            this.reporte_inicializarCalendario();
        });

        this.matIconRegistry.addSvgIcon('iconCasa1', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Casa1-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconFlecha1DerechaPeque', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/FlechaDerechaPequena-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconCalendarioEditar', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/CalendarioEditar-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconFlechaAbajoPeque', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/FlechaAbajoPequena-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconUsuario', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/06-Clientes-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconCalendarioCancelar', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/CalendarioCancelar-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconInfoCirculo', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/InfoCirculo-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconCelular', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Celular-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconFiltro', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Filtros-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconMenuHamburguesa', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Menu-Hamburguesa-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconCruzCirculo', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/10-2-TiposdeExcepcion-icon.svg"));
    }

    ngOnInit(): void {
        this._pantallaServicio.mostrarSpinner();
        this.crearModales();
        this.cargarPestanias();
    }

    crearModales() {
        if ($('body').find('.modal-filtrar').length > 1) {
            $('body').find('.modal-filtrar')[1].remove();
        }
        this.modales.modalFiltrar = new bootstrap.Modal($("#modal-filtrar").appendTo("body"), {
            backdrop: "static", 
            keyboard: false,
        });

        if ($('body').find('.estatus-cita').length > 1) {
            $('body').find('.estatus-cita')[1].remove();
        }
        this.modales.modalEstatusCita = new bootstrap.Modal($("#estatus-cita").appendTo("body"), {
            backdrop: "static", 
            keyboard: false,
        });

    }

    // ------------------------------------------------------------------------------------------- //
    // ----------------------------------- REPORTE DE PRODUCTIVIDAD ------------------------------ //
    // ------------------------------------------------------------------------------------------- //

    // -------------------------------------- Declaración de variables --------------------------- //
    @ViewChild('tabGroup', {static: false}) tab: MatTabGroup; // Se usa esta variable para controlar las pestañas JC
    displayedColumns_CitasPersonal: string[] = ["nombre", "cantidadCitas"];
    displayedColumns_CitasCancel: string[] = ["nombre", "citasCanceladas"];
    displayedColumns_CitasEstatus: string[] = ["nombre", "cantidadCitas"];
    displayedColumns_CitasOrigen: string[] = ["nombre", "cantidadCitas"];
    displayedColumns_ModalCitasEstatus: string[] = ["fechaCita", "cliente", "telefono", "servicio", "personal", "nota", "descripcion", "usuarioCancelacion"];
    dataSource = new MatTableDataSource<any>([]);
    @ViewChild(MatSort) sort!: MatSort;
    rootScope_fromState = "";
    tabActiveName = this.reporteProductividadTranslate.citasPersonal;
    reporte: any = {
        metaVenta: "",
        fechaInicio: moment(new Date()).startOf('month').format('DD/MM/YYYY'),
        fechaFin: moment(new Date()).endOf('month').format('DD/MM/YYYY'),
        fechas: {
            // startDate: moment(new Date()).startOf('month').format('DD/MM/YYYY'), 
            // endDate: moment(new Date()).endOf('month').format('DD/MM/YYYY')
            startDate: dayjs().startOf('month'),
            endDate: dayjs().endOf('month')
        },
        tablaPersonal: [],
        tablaCitasCanceladas: [],
        tablaCitasEstatus: [],
        tablaCitasOrigen: [],
        errorFecha: ""
    };
    personal: any = {
        dataPersonalFiltrada: [],
        dataPersonal: [],
        dataPersonalDetalle: [],
        dataPersonalCopia: [],
        total: ""
    };
    citasCanceladas: any = {
        dataCitasCanceladasFiltrada: [],
        dataCitasCanceladas: [],
        dataCanceladasMotivo: [],
        total: ""
    };
    citasEstatus: any = {
        dataCitasEstatusFiltrada: [],
        dataCitasEstatus: [],
        total: ""
    };
    citasOrigen: any = {
        dataCitasOrigenFiltrada: [],
        dataCitasOrigen: [],
        total: ""
    };
    // Copias de los filtros, para poder definir los filtros seleccionados al abrir los modals aunque se cambie de tab
    copias: any = {
        personal: [],
        citasCanceladas: [],
        citasEstatus: [],
        citasOrigen: []
    };
    dataFiltro: any = {
        data: [],
        select: []
    };
    registroOculto: any = {
        personal: [],
        citasCanceladas: [],
        citasEstatus: [],
        citasOrigen: []
    };
    formatNumber = {
        separador: " ",
        sepDecimal: '.',
        formatear: (num: string) => {
            num += '';
            var splitStr = num.split('.');
            var splitLeft = splitStr[0];
            var splitRight = splitStr.length > 1 ? this.sepDecimal + splitStr[1] : '';
            var regx = /(\d+)(\d{3})/;
            while (regx.test(splitLeft)) {
                splitLeft = splitLeft.replace(regx, '$1' + this.separador + '$2');
            }
            return this.simbol + splitLeft + splitRight;
        },
        new: (num: any, simbol: string) => {
            this.simbol = simbol || '';
            return this.formatear(num);
        }
    }
    historial: any = {
        //Declaración del grid
        gridOptionsEstatus: {
            enableSorting: true,
            enableColumnMenus: false,
            columnDefs: [
                { displayName: this.reporteProductividadTranslate.fechaCita, name: 'fechaCita', width: '100', field: 'fechaCita', headerCellClass: 'alignCenter', cellClass: 'alignCenter', cellFilter: 'date:\'dd/MM/yyyy\''},
                { displayName: this.reporteProductividadTranslate.cliente, name: 'Cliente', minWidth: '200', field: 'cliente', headerCellClass: 'alignCenter', cellClass: 'alignCenter', cellTemplate: '<div class="ui-grid-cell-contents ng-binding ng-scope" style="margin-top:0px; "><a style="text-decoration: underline; color: #357ec1 !important; cursor:pointer" ng-click="grid.appScope.irACliente(row.entity)">{{COL_FIELD}}</a></div>'},
                { displayName: this.reporteProductividadTranslate.telefono, name: 'Telefono', width: '100', field: 'telefono', headerCellClass: 'alignCenter', cellClass: 'alignCenter' },
                { displayName: this.reporteProductividadTranslate.servicio, name: 'Servicio', width: '140', field: 'servicio', headerCellClass: 'alignCenter', cellClass: 'alignCenter' },
                { displayName: this.reporteProductividadTranslate.personal, name: 'Atendido', width: '200', field: 'personal', headerCellClass: 'alignCenter', cellClass: 'alignCenter' },
                { displayName: this.reporteProductividadTranslate.nota, name: 'Producto', minWidth: '100', field: 'nota', headerCellClass: 'alignCenter', cellClass: 'alignCenter' },
                { displayName: this.reporteProductividadTranslate.estatus, name: 'Estatus Cita', width: '90', field: 'descripcion', headerCellClass: 'alignCenter', cellClass: 'alignCenter'},
                { displayName: this.reporteProductividadTranslate.usuario, name: 'Usuario', width: '90', field: 'usuarioCancelacion', headerCellClass: 'alignCenter', cellClass: 'alignCenter'}
            ],
            data: 'this.historial.dataHistorial',
            enableVerticalScrollbar: 1,
            enableHorizontalScrollbar: 0
        }
    };
    carga = false;
    tabActive = 0;
    mostrarGraph = false;
    eventInfo = false;
    hayRegistros: any = [false, false, false, false];
    primeraCarga = true;
    msgSinCitas: any = [];
    anchoGrafica: any;
    ocultarBarraDireccion = false;
    params: any = {};
    // Variables necesarias para la tabla
    ANCHO_MINIMO = 100;
    anchoTablaPersonal = $('#tablaPersonal').width();
    anchoTablaCitasCanceladas = $('#tablaCitasCanceladas').width();
    anchoTablaCitasEstatus = $('#tablaCitasEstatus').width();
    anchoTablaCitasOrigen = $('#tablaCitasOrigen').width();
    anchoTabla: any;
    dataSelect: any;
    arreglo: any;
    simbol: any;
    sepDecimal: any = " ";
    separador: any = '.';
    ranges: any;
    invalidDates: moment.Moment[] = [moment().add(2, 'days'), moment().add(3, 'days'), moment().add(5, 'days')]; 
    value: any;
    myChartPopOver: any;
    myChart: any;
    myChart2: any;
    myChart3: any;
    myChart4: any;
    daysOfWeek: any;
    monthNames: any;
    locale: any = {
        format: 'DD/MM/YYYY'
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
                        this.tab.selectedIndex = 2;
                        setTimeout(() => {
                            this.tab.selectedIndex = 3;
                            setTimeout(() => {
                                this.tab.selectedIndex = 0;
                                resolve(true);
                            }, 3);
                        }, 3);
                    }, 3);
                }, 3);
            }, 3);
        });
    }

    // Función que cambia el color de los nombres de personal a rojo si están dados de baja
    pintarPersonalRojos() {
        for (var i = 0; i < this.personal.dataPersonal.length; i++) {
            if (this.personal.dataPersonal[i].dadoBaja) {
                $("#linkGridPersonal" + this.personal.dataPersonal[i].id).attr("style", "text-decoration: underline; color: #b32032;");
            }
        }
        this.cargarCitasCanceladas(this.reporte.fechaInicio, this.reporte.fechaFin, undefined);
    }

    // Función para el mouseleave del link del grid
    cambiarColorLeave(id: any) {
        for (var i = 0; i < this.personal.dataPersonal.length; i++) {
            if (this.personal.dataPersonal[i].id == id) {
                if (this.personal.dataPersonal[i].dadoBaja) {
                    $("#linkGridPersonal" + id).attr("style", "text-decoration: underline; color: #b32032;");
                } else {
                    $("#linkGridPersonal" + id).attr("style", "text-decoration: underline; color: #357ec1;");
                }
            }
        }
    };

    cancelarPantalla(){
        this._router.navigate(['/procesos/agenda']);
    }

    // Función que valida si el ancho de la tabla es menor al ancho mínimo establecido.
    menorAnchoMinimo() {
        return this.anchoTabla < this.ANCHO_MINIMO;
    };

    // Función que colapsa un registro de la tabla
    colapsarRegistro(idRegistro: any) {
        switch (this.tabActive) {
            case 0:
                colapsar(this.registroOculto.personal, idRegistro, 'olPersonal', 'btnPersonal');
                break;
            case 1:
                colapsar(this.registroOculto.citasCanceladas, idRegistro, 'olCitasCanceladas', 'btnCitasCanceladas');
                break;
            case 2:
                colapsar(this.registroOculto.citasEstatus, idRegistro, 'olCitasEstatus', 'btnCitasEstatus');
                break;
            case 3:
                colapsar(this.registroOculto.citasOrigen, idRegistro, 'olCitasOrigen', 'btnCitasOrigen');
                break;
        };

        function colapsar(dataIn: any, idRegistro: any, olName: any, btnName: any) {
            if (dataIn[idRegistro]) {
                dataIn[idRegistro] = false;
                $("#" + olName + idRegistro).show("blind");
                let ebi_btnIdRe: any = document.getElementById(btnName + idRegistro);
                ebi_btnIdRe.setAttribute('class', 'fa fa-minus');
            } else {
                dataIn[idRegistro] = true;
                $("#" + olName + idRegistro).hide("blind");
                let ebi_btnIdRe: any = document.getElementById(btnName + idRegistro);
                ebi_btnIdRe.setAttribute('class', 'fa fa-plus');
            }
        }
    };

    // Función que  actualiza el valor del ancho de la tabla
    actualizarAncho() {
        this.anchoTabla = $('#tablaCitasCanceladas').width();
        this.anchoTablaPersonal = $('#tablaPersonal').width();
    };

    //Carga los datos del personal
    cargarPersonal(fechaInicio: any, fechaFin: any, data: any) {
        if (data == undefined) {
            var params: any = {};
            params.tipo = 1;
            params.idPersonal = "0";
            params.idServicio = "0";
            params.motivoCancelacion = "";
            params.fechaInicio = this.reporte.fechaInicio;
            params.fechaFin = this.reporte.fechaFin;

            this._backService.HttpPost("consultas/reporteProductividad/consultarDatos", {}, params).subscribe((response: string) => {
                var dataTemp = eval(response);
                
                this.personal.dataPersonal = dataTemp;
                this.personal.dataPersonalFiltrada = JSON.parse(JSON.stringify(dataTemp));
                this.dataGraph(dataTemp);

                this.reporte.tablaPersonal = eval(response);
                for (var i = 0; i < this.reporte.tablaPersonal.length; i++) {
                    this.ccc('Personal', this.reporte.tablaPersonal[i].id, undefined);
                }

                this.validarRegistrosTab();
                $("#gPersonal").attr('style', 'width:100%');

                // Se cambian de color los nombres del personal dado de baja
                this.pintarPersonalRojos();
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
        } else {
            this.dataGraph(data);
        }
    };
    
    graph(cat: any, dat: any) { // PRIMER GRAFICO
        const ebi_gPersonal: any = document.getElementById('gPersonal') as HTMLCanvasElement;
        if (this.myChart) {
            this.myChart.destroy();
        }
        
        this.myChart = new Chart(ebi_gPersonal, {
            type: 'bar',
            data: {
                labels: cat, // Nombre de las barras
                datasets: [{
                    label: "Data",
                    data: dat, // Valores de las barras
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: { // Titulo del Gráfico
                        text: 'Citas por Personal',
                        display: true
                    },
                    legend: {
                        display: false
                    },
                },
                scales: {
                    x: {
                        stacked: true,
                    },
                    y: {
                        stacked: true,
                        title: {
                            display: true,
                            text: this.reporteProductividadTranslate.citas
                          }
                    }
                }
            },
        });
    };

    dataGraph(dataIn: any) {
        var cat = [];
        var dat = [];
        var total = 0;
        for (i = 0; i < dataIn.length; i++) {
            cat.push(dataIn[i].nombre);
            dat.push(dataIn[i].cantidadCitas);
            total += dataIn[i].cantidadCitas;
        }
        for (var i = 0; i < this.personal.dataPersonal.length; i++) {
            this.registroOculto.personal[this.personal.dataPersonal[i].id] = true;
        }
        this.personal.total = total;//formatNumber.new(total, "$");
        this.graph(cat, dat);
    };

    //Carga los datos del personal específico para el detalle
    cargarDetallePersonal(fechaInicio: any, fechaFin: any, data: any, idPersonal: any) {
        if (data == undefined) {
            var params: any = {};
            params.tipo = 1;
            params.idPersonal = idPersonal;
            params.idServicio = "0";
            params.motivoCancelacion = "";
            params.fechaInicio = this.reporte.fechaInicio;
            params.fechaFin = this.reporte.fechaFin;

            this._backService.HttpPost("consultas/reporteProductividad/consultarDatos", {}, params).subscribe((response: string) => {
                var dataTemp = eval(response);
                
                this.personal.dataPersonalDetalle = dataTemp;
                this.dataGraph2(dataTemp);
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
        } else {
            this.dataGraph2(data);
        }

        this.eventInfo = true;
    };

    graph2(cat: any, dat: any) {
        const ebi_gPopPersonal: any = document.getElementById('gPopPersonal') as HTMLCanvasElement;
        if (this.myChartPopOver) {
            this.myChartPopOver.destroy();
        }
        
        this.myChartPopOver = new Chart(ebi_gPopPersonal, {
            type: 'bar',
            data: {
                labels: cat, // Nombre de las barras
                datasets: [{
                    label: "Data",
                    data: dat, // Valores de las barras
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: { // Titulo del Gráfico
                        text: this.reporteProductividadTranslate.detalle,
                        display: true
                    },
                    legend: {
                        display: false
                    },
                },
                scales: {
                    x: {
                        stacked: true,
                        title: {
                            display: true,
                            text: this.reporteProductividadTranslate.servicio
                        }
                    },
                    y: {
                        stacked: true,
                        title: {
                            display: true,
                            text: this.reporteProductividadTranslate.citas
                        }
                    }
                }
            },
        });
    };

    dataGraph2(dataIn: any) {
        var cat = [];
        var dat = [];
        var total = 0;
        for (i = 0; i < dataIn.length; i++) {
            cat.push(dataIn[i].servicio);
            dat.push(dataIn[i].cantidadCitas);
            total += dataIn[i].cantidadCitas;
        }
        for (var i = 0; i < this.personal.dataPersonal.length; i++) {
            this.registroOculto.personal[this.personal.dataPersonal[i].id] = true;
        }
        this.graph2(cat, dat);
    };
    
    //Carga los datos de citas canceladas (sucursal)
    cargarCitasCanceladas(fechaInicio: any, fechaFin: any, data: any) {
        if (data == undefined) {
            var params: any = {};
            params.tipo = 2;
            params.idPersonal = "0";
            params.idServicio = "0";
            params.motivoCancelacion = "";
            params.fechaInicio = this.reporte.fechaInicio;
            params.fechaFin = this.reporte.fechaFin;

            this._backService.HttpPost("consultas/reporteProductividad/consultarDatos", {}, params).subscribe((response: string) => {
                var dataTemp = eval(response);

                this.citasCanceladas.dataCitasCanceladas = dataTemp;
                this.dataSelect = JSON.parse(JSON.stringify(this.citasCanceladas.dataCitasCanceladas));
                this.dataGraph3(dataTemp);

                var params: any = {};
                params.tipo = 2;
                params.idPersonal = "0";
                params.idServicio = "0";
                params.motivoCancelacion = "";
                params.fechaInicio = this.reporte.fechaInicio;
                params.fechaFin = this.reporte.fechaFin;

                this.reporte.tablaCitasCanceladas = eval(response);
                for (var i = 0; i < this.reporte.tablaCitasCanceladas.length; i++) {
                    this.ccc('Citas Canceladas', this.reporte.tablaCitasCanceladas[i].id, undefined);
                }

                this.validarRegistrosTab();
                this.cargarCitasEstatus(this.reporte.fechaInicio, this.reporte.fechaFin, undefined);
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
        } else {
            this.dataGraph3(data);
        }
    };

    graph3(cat: any, dat: any) {
        setTimeout(() => {
            const ebi_gCitasCanceladas: any = document.getElementById('gCitasCanceladas') as HTMLCanvasElement;
            if (this.myChart2) {
                this.myChart2.destroy();
            }
            
            this.myChart2 = new Chart(ebi_gCitasCanceladas, {
                type: 'bar',
                data: {
                    labels: cat, // Nombre de las barras
                    datasets: [{
                        data: dat, // Valores de las barras
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: { // Titulo del Gráfico
                            text: this.reporteProductividadTranslate.citasCanceladas3,
                            display: true
                        },
                        legend: {
                            display: false
                        },
                    },
                    scales: {
                        x: {
                            stacked: true,
                        },
                        y: {
                            stacked: true,
                            title: {
                                display: true,
                                text: this.reporteProductividadTranslate.citas
                            }
                        }
                    }
                },
            });
        }, 20);
    };

    dataGraph3(dataIn: any) {
        var cat = [];
        var dat = [];
        var total = 0;
        for (i = 0; i < dataIn.length; i++) {
            cat.push(dataIn[i].nombre);
            dat.push(dataIn[i].citasCanceladas);
            total += dataIn[i].citasCanceladas;
        }
        for (var i = 0; i < this.citasCanceladas.dataCitasCanceladas.length; i++) {
            this.registroOculto.citasCanceladas[this.citasCanceladas.dataCitasCanceladas[i].id] = true;
        }
        this.citasCanceladas.total = total;
        this.graph3(cat, dat);        
    };

    // Carga los datos de las citas canceladas según el motivo de cancelación, index es el índice correspondiente en el arreglo de dataCitasCanceladas
    cargarCitasCanceladasPorMotivo(idServicio: any, motivoCancelacion: any, index: any) {
        var params: any = {};
        params.tipo = 5;
        params.idPersonal = "0";
        params.idServicio = idServicio;
        params.motivoCancelacion = motivoCancelacion;
        params.fechaInicio = this.reporte.fechaInicio;
        params.fechaFin = this.reporte.fechaFin;

        this._backService.HttpPost("consultas/reporteProductividad/consultarDatos", {}, params).subscribe((response: string) => {
            var dataTemp = eval(response);

            switch (motivoCancelacion) {
                case "Baja de Servicio":
                    this.citasCanceladas.dataCanceladasMotivo[index].bajaServicio = dataTemp[0] == undefined ? 0 : dataTemp[0].cantidadCitas;
                    break;
                case "Cancelación Web":
                    this.citasCanceladas.dataCanceladasMotivo[index].web = dataTemp[0] == undefined ? 0 : dataTemp[0].cantidadCitas;
                    break;
                case "Ninguno":
                    this.citasCanceladas.dataCanceladasMotivo[index].sinMotivo = dataTemp[0] == undefined ? 0 : dataTemp[0].cantidadCitas;
                    break;
                case "Cancelación Móvil":
                    this.citasCanceladas.dataCanceladasMotivo[index].movil = dataTemp[0] == undefined ? 0 : dataTemp[0].cantidadCitas;
                    break;
                case "Cancelación desde móvil":
                    this.citasCanceladas.dataCanceladasMotivo[index].desdeMovil = dataTemp[0] == undefined ? 0 : dataTemp[0].cantidadCitas;
                    break;
                case "Baja de Personal":
                    this.citasCanceladas.dataCanceladasMotivo[index].bajaPersonal = dataTemp[0] == undefined ? 0 : dataTemp[0].cantidadCitas;
                    break;
                case "Excepción Personal":
                    this.citasCanceladas.dataCanceladasMotivo[index].excepcionPersonal = dataTemp[0] == undefined ? 0 : dataTemp[0].cantidadCitas;
                    break;
                default:
                    break;
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

    //Función que carga los datos de citas por estatus (servicio)
    cargarCitasEstatus(fechaInicio: any, fechaFin: any, data: any) {
        if (data == undefined) {
            var params: any = {};
            params.tipo = 3;
            params.idPersonal = "0";
            params.idServicio = "0";
            params.motivoCancelacion = "";
            params.fechaInicio = this.reporte.fechaInicio;
            params.fechaFin = this.reporte.fechaFin;

            this._backService.HttpPost("consultas/reporteProductividad/consultarDatos", {}, params).subscribe((response: string) => {
                var dataTemp = eval(response);
                
                for (var a = 0; a < dataTemp.length; a++) {
                    switch ((dataTemp[a].nombre).toLowerCase()) {
                        case 'pendiente':
                            dataTemp[a].nombre = this.agendaTranslate.pendiente;
                            break;
                        case 'terminada':
                            dataTemp[a].nombre = this.agendaTranslate.terminada;
                            break;
                        case 'en proceso':
                            dataTemp[a].nombre = this.agendaTranslate.enProceso;
                            break;
                        case 'cancelada':
                            dataTemp[a].nombre = this.agendaTranslate.cancelada;
                            break;
                        case 'confirmada':
                            dataTemp[a].nombre = this.agendaTranslate.confirmada;
                            break;
                        case null:
                            dataTemp[a].nombre = "Otros";
                            break;
                    }
                }

                this.citasEstatus.dataCitasEstatus = dataTemp;
                this.dataGraph4(dataTemp);
                var params: any = {};
                params.tipo = 3;
                params.idPersonal = "0";
                params.idServicio = "0";
                params.motivoCancelacion = "";
                params.fechaInicio = this.reporte.fechaInicio;
                params.fechaFin = this.reporte.fechaFin;

                this.reporte.tablaServicio = eval(response);
                if (this.reporte.tablaCitasEstatus.length == 0) {
                    for (var i = 0; i < this.citasEstatus.dataCitasEstatus.length; i++) {
                        this.ccc('Citas Estatus', this.citasEstatus.dataCitasEstatus[i].id, null);
                    }
                } else {
                    for (var i = 0; i < this.reporte.tablaCitasEstatus.length; i++) {
                        this.ccc('Citas Estatus', this.reporte.tablaCitasEstatus[i].id, undefined);
                    }
                }

                this.validarRegistrosTab();
                this.cargarCitasOrigen(this.reporte.fechaInicio, this.reporte.fechaFin, undefined);
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
        } else {
            this.dataGraph4(data);
        }
    };

    graph4(cat: any, data: any) {
        //this.tab.selectedIndex = 2;
        setTimeout(() => {
            const ebi_gCitasEstatus: any = document.getElementById('gCitasEstatus') as HTMLCanvasElement;
            if (this.myChart3) {
                this.myChart3.destroy();
            }

            this.myChart3 = new Chart(ebi_gCitasEstatus, {
                type: 'pie',
                data: {
                    labels: cat, // Nombre de los labels
                    datasets: [{
                        label: this.reporteProductividadTranslate.citas, // Nombre del hover de cada parte del Pie
                        data: data, // Valores de las barras
                        borderWidth: 1
                    }]
                },
                options: {
                    plugins: {
                        title: { // Titulo del Gráfico
                            text: this.reporteProductividadTranslate.citasEstatus3,
                            display: true
                        },
                        legend: {
                            position: 'top',
                        },
                    },
                },
            });
        }, 30);
    };

    dataGraph4(dataIn: any) {
        var cat = [];
        var dat = [];
        var total = 0;
        for (i = 0; i < dataIn.length; i++) {
            if (dataIn[i].nombre == null){
                cat.push("Otros");
            }else{
                cat.push(dataIn[i].nombre);
            }
            dat.push(dataIn[i].cantidadCitas);
            total += dataIn[i].cantidadCitas;
        }

        for (var i = 0; i < this.citasEstatus.dataCitasEstatus.length; i++) {
            this.registroOculto.citasEstatus[this.citasEstatus.dataCitasEstatus[i].id] = true;
        }

        this.citasEstatus.total = total;
        this.graph4(cat, dat);
    };
    
    //Función que carga los datos de citas por origen (método de pago)
    cargarCitasOrigen(fechaInicio: any, fechaFin: any, data: any) {
        if (data == undefined) {
            var params: any = {};
            params.tipo = 4;
            params.idPersonal = "0";
            params.idServicio = "0";
            params.motivoCancelacion = "";
            params.fechaInicio = this.reporte.fechaInicio;
            params.fechaFin = this.reporte.fechaFin;

            this._backService.HttpPost("consultas/reporteProductividad/consultarDatos", {}, params).subscribe((response: string) => {
                var dataTemp = eval(response);
                
                this.citasOrigen.dataCitasOrigen = dataTemp;
                for (var i = 0; i < this.citasOrigen.dataCitasOrigen.length; i++) {
                    if (this.citasOrigen.dataCitasOrigen[i].nombre == "Móvil") {
                        this.citasOrigen.dataCitasOrigen[i].nombre = this.reporteProductividadTranslate.movil;
                    }
                    if (this.citasOrigen.dataCitasOrigen[i].nombre == "Web") {
                        this.citasOrigen.dataCitasOrigen[i].nombre = this.reporteProductividadTranslate.web;
                    }
                    if (this.citasOrigen.dataCitasOrigen[i].nombre == "Facebook") {
                        this.citasOrigen.dataCitasOrigen[i].nombre = this.reporteProductividadTranslate.facebook;
                    }
                    if (this.citasOrigen.dataCitasOrigen[i].nombre == "Web cliente") {
                        this.citasOrigen.dataCitasOrigen[i].nombre = this.reporteProductividadTranslate.clienteWeb;
                    }
                }
                this.dataGraph5(dataTemp);
                var params: any = {};
                params.tipo = 4;
                params.idPersonal = "0";
                params.idServicio = "0";
                params.motivoCancelacion = "";
                params.fechaInicio = this.reporte.fechaInicio;
                params.fechaFin = this.reporte.fechaFin;

                this.reporte.tablaCitasOrigen = eval(response);
                for (var i = 0; i < this.reporte.tablaCitasOrigen.length; i++) {
                    this.ccc('Citas Origen', this.reporte.tablaCitasOrigen[i].id, undefined);
                }

                this.validarRegistrosTab();

                $("#gCitasOrigen").attr('style', 'width:100%');

                // Se copian las datas sin fitrar a las filtradas para que haya datos por default
                this.personal.dataPersonalFiltrada = this.personal.dataPersonal;
                this.citasCanceladas.dataCitasCanceladasFiltrada = this.citasCanceladas.dataCitasCanceladas;
                this.citasEstatus.dataCitasEstatusFiltrada = this.citasEstatus.dataCitasEstatus;
                this.citasOrigen.dataCitasOrigenFiltrada = this.citasOrigen.dataCitasOrigen;
                this.msgSinCitas = [
                    this.reporteProductividadTranslate.sinCitas,
                    this.reporteProductividadTranslate.sinCitasCanceladas
                ];
                this.primeraCarga = false;

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
        } else {
            this.dataGraph5(data);
        }
    };

    graph5(cat: any, dat: any) {
        //this.tab.selectedIndex = 3;
        setTimeout(() => {
            const ebi_gCitasOrigen: any = document.getElementById('gCitasOrigen') as HTMLCanvasElement;
            if (this.myChart4) {
                this.myChart4.destroy();
            }
            
            this.myChart4 = new Chart(ebi_gCitasOrigen, {
                type: 'bar',
                data: {
                    labels: cat, // Nombre de las barras
                    datasets: [{
                        label: "Data",
                        data: dat, // Valores de las barras
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: { // Titulo del Gráfico
                            text: this.reporteProductividadTranslate.citasOrigen3,
                            display: true
                        },
                        legend: {
                            display: false
                        },
                    },
                    scales: {
                        x: {
                            stacked: true,
                        },
                        y: {
                            stacked: true,
                            title: {
                                display: true,
                                text: this.reporteProductividadTranslate.citas
                            }
                        }
                    }
                },
            });
        }, 40);
    };

    dataGraph5(dataIn: any) {
        var cat = [];
        var dat = [];
        var total = 0;
        for (i = 0; i < dataIn.length; i++) {
            cat.push(dataIn[i].nombre);
            dat.push(dataIn[i].cantidadCitas);
            total += dataIn[i].cantidadCitas;
        }
        for (var i = 0; i < this.citasOrigen.dataCitasOrigen.length; i++) {
            this.registroOculto.citasOrigen[this.citasOrigen.dataCitasOrigen[i].id] = true;
        }
        this.citasOrigen.total = total;
        this.graph5(cat, dat);
    };

    descargarGraficoCP(opcion: any) {
        var image = this.myChart.toBase64Image();
        var a = document.createElement('a');
        a.href = this.myChart.toBase64Image();

        switch(opcion){
            case "impresion":
                const pdf0 = new jsPDF();
                pdf0.addImage(image, 'PNG', 15, 10, 170, 85);
                pdf0.autoPrint();
                window.open(pdf0.output("bloburl"));
                break;

            case "png":
                a.download = 'citasPorPersonal.png';
                a.click();
                break;

            case "jpg":
                a.download = 'citasPorPersonal.jpg';
                a.click();
                break;
                
            case "pdf":
                const pdf = new jsPDF();
                pdf.addImage(image, 'PNG', 15, 10, 170, 85);
                pdf.save('citasPorPersonal.pdf');
                break;
        }
    }

    descargarGraficoCC(opcion: any) {
        var image = this.myChart2.toBase64Image();
        var a = document.createElement('a');
        a.href = this.myChart2.toBase64Image();

        switch(opcion){
            case "impresion":
                const pdf0 = new jsPDF();
                pdf0.addImage(image, 'PNG', 15, 10, 170, 85);
                pdf0.autoPrint();
                window.open(pdf0.output("bloburl"));
                break;

            case "png":
                a.download = 'citasCanceladas.png';
                a.click();
                break;

            case "jpg":
                a.download = 'citasCanceladas.jpg';
                a.click();
                break;
                
            case "pdf":
                const pdf = new jsPDF();
                pdf.addImage(image, 'PNG', 15, 10, 170, 85);
                pdf.save('citasCanceladas.pdf');
                break;
        }
    }

    descargarGraficoCE(opcion: any) {
        var image = this.myChart3.toBase64Image();
        var a = document.createElement('a');
        a.href = this.myChart3.toBase64Image();

        switch(opcion){
            case "impresion":
                const pdf0 = new jsPDF();
                pdf0.addImage(image, 'PNG', 15, 10, 170, 85);
                pdf0.autoPrint();
                window.open(pdf0.output("bloburl"));
                break;

            case "png":
                a.download = 'citasPorEstatus.png';
                a.click();
                break;

            case "jpg":
                a.download = 'citasPorEstatus.jpg';
                a.click();
                break;

            case "pdf":
                const pdf = new jsPDF();
                pdf.addImage(image, 'PNG', 15, 10, 170, 85);
                pdf.save('citasPorEstatus.pdf');
                break;
        }
    }

    descargarGraficoCO(opcion: any) {
        var image = this.myChart4.toBase64Image();
        var a = document.createElement('a');
        a.href = this.myChart4.toBase64Image();
        
        switch(opcion){
            case "impresion":
                const pdf0 = new jsPDF();
                pdf0.addImage(image, 'PNG', 15, 10, 170, 85);
                pdf0.autoPrint();
                window.open(pdf0.output("bloburl"));
                break;

            case "png":
                a.download = 'citasPorOrigen.png';
                a.click();
                break;

            case "jpg":
                a.download = 'citasPorOrigen.jpg';
                a.click();
                break;

            case "pdf":
                const pdf = new jsPDF();
                pdf.addImage(image, 'PNG', 15, 10, 170, 85);
                pdf.save('citasPorOrigen.pdf');
                break;
        }
    }

    // Función que valida si hay registros para mostrar en el tab actual. Si coincide el tab con que no hay registros para ese tab entonces devuelve false.
    validarRegistrosTab() {
        this.hayRegistros = [false, false, false, false];
        if(this.personal.dataPersonal.length > 0){
            this.hayRegistros[0] = true;
        }
        if(this.citasCanceladas.dataCitasCanceladas.length > 0){
            this.hayRegistros[1] = true;
        }
        if(this.citasEstatus.dataCitasEstatus.length > 0){
            this.hayRegistros[2] = true;
        }
        if(this.citasOrigen.dataCitasOrigen.length > 0){
            this.hayRegistros[3] = true;
        }
    };

    //Función para filtrar las graficas
    filtrar() {
        if (this.dataFiltro.select.length != 0) {
            switch (this.tabActive) {
                case 0:
                    this.copias.personal = this.dataFiltro.select;
                    var data = this.getDataFilter(this.personal.dataPersonal);
                    this.dataFiltro.select = [];
                    this.cargarPersonal(this.reporte.fechaInicio, this.reporte.fechaFin, data);

                    // PRUEBA
                    this.personal.dataPersonalFiltrada = data;
                    $("#ddlPersonal> div:first-child").attr("style", "outline: none");
                    break;
                case 1:
                    this.copias.citasCanceladas = this.dataFiltro.select;
                    var data = this.getDataFilter(this.citasCanceladas.dataCitasCanceladas);
                    var dataTemp = JSON.parse(JSON.stringify(data));
                    this.dataFiltro.select = [];
                    this.cargarCitasCanceladas(this.reporte.fechaInicio, this.reporte.fechaFin, dataTemp);

                    this.citasCanceladas.dataCitasCanceladasFiltrada = data;

                    $("#ddlCitasCanceladas> div:first-child").attr("style", "outline: none");
                    break;
                case 2:
                    this.copias.citasEstatus = this.dataFiltro.select;
                    var data = this.getDataFilter(this.citasEstatus.dataCitasEstatus);
                    this.dataFiltro.select = [];
                    this.cargarCitasEstatus(this.reporte.fechaInicio, this.reporte.fechaFin, data);

                    this.citasEstatus.dataCitasEstatusFiltrada = data;

                    $("#ddlCitasEstatus> div:first-child").attr("style", "outline: none");
                    break;
                case 3:
                    this.copias.citasOrigen = this.dataFiltro.select;
                    var data = this.getDataFilter(this.citasOrigen.dataCitasOrigen);
                    this.dataFiltro.select = [];
                    this.cargarCitasOrigen(this.reporte.fechaInicio, this.reporte.fechaFin, data);

                    this.citasOrigen.dataCitasOrigenFiltrada = data;
                    $("#ddlCitasOrigen> div:first-child").attr("style", "outline: none");
                    break;
            }

            // Cerrar el modal
            $("#ddlPersonal> div:first-child").attr("style", "outline: none");
            this.modales.modalFiltrar.hide();
            switch (this.tabActive) {
                case 0:
                    this.drop(this.personal.dataPersonal);
                    break;
                case 1:
                    this.drop(this.citasCanceladas.dataCitasCanceladas);
                    break;
                case 2:
                    this.drop(this.citasEstatus.dataCitasEstatus);
                    break;
                case 3:
                    this.drop(this.citasOrigen.dataCitasOrigen);
                    break;
            };
            //$('#modal-filtrar').modal('toggle');
        } else {
            switch (this.tabActive) {
                case 0:
                    $("#ddlPersonal> div:first-child").attr("style", "outline: red solid 1px !important");
                    break;
                case 1:
                    $("#ddlCitasCanceladas> div:first-child").attr("style", "outline: red solid 1px !important");
                    break;
                case 2:
                    $("#ddlCitasEstatus> div:first-child").attr("style", "outline: red solid 1px !important");
                    break;
                case 3:
                    $("#ddlCitasOrigen> div:first-child").attr("style", "outline: red solid 1px !important");
                    break;
            }
        }
    };

    drop(input: any) {
        if (input[0].id == 'all' || input[0].id == 'dropAll') {
            input.splice(0, 1)
        }
        this.dataFiltro.select = [];
    };

    getDataFilter(input: any) {
        var data = [];
        for (var i = 0; i < input.length; i++) {
            for (let j = 0; j < this.dataFiltro.select.length; j++) {
                if (input[i].id == this.dataFiltro.select[j]) {
                    data.push(input[i]);
                }
            }
        }
        return data;
    };

    //Función que valida las fechas antes de buscar
    tabclick(tab: any) {
        this.tabActive = tab;

        switch (this.tabActive) {
            case 0:
                this.tabActiveName = this.reporteProductividadTranslate.citasPersonal;
                break;
            case 1:
                this.tabActiveName = this.reporteProductividadTranslate.citasCanceladas2;
                break;
            case 2:
                this.tabActiveName = this.reporteProductividadTranslate.citasEstatus;
                break;
            case 3:
                this.tabActiveName = this.reporteProductividadTranslate.citasOrigen;
                break;
        }

        this.msgSinCitas = [
            this.reporteProductividadTranslate.sinCitas,
            this.reporteProductividadTranslate.sinCitasCanceladas
        ];
        
        setTimeout(() => {
            this.validarRegistrosTab();
        }, 100);

        if (this.reporte.fechaInicio == "" && this.reporte.fechaFin == "") {
            $('#fechaInicio').css("border", "1px solid red");
            $('#fechaFin').css("border", "1px solid red");
        }
    };

    //Función que busca los registros en las fechas determinadas
    buscar() {
        this.tabclick(this.tabActive);
        var valido = true;
        var fechaLimiteInferiro = new Date(99, 1, 1);
        if (this.reporte.fechaInicio < fechaLimiteInferiro) {
            $("#fechaInicio").addClass("errorCampo");
            valido = false;
        }
        if (this.reporte.fechaFin < fechaLimiteInferiro) {
            $("#fechaFin").addClass("errorCampo");
            valido = false;
        }

        if (this.reporte.fechaInicio == "" || this.reporte.fechaInicio == undefined) {
            $("#fechaInicio").addClass("errorCampo");
            this.reporte.errorFecha = "";
            valido = false;
        }
        else {
            $("#fechaInicio").removeClass("errorCampo");
            this.reporte.errorFecha = "";
        }
        if (this.reporte.fechaFin == "" || this.reporte.fechaFin == undefined) {
            $("#fechaFin").addClass("errorCampo");
            this.reporte.errorFecha = "";
            valido = false;
        } else {
            if (this.reporte.fechaFin < this.reporte.fechaInicio) {
                $("#fechaFin").addClass("errorCampo");
                this.reporte.errorFecha = this.promocionTranslate.mensaje10;
                valido = false;
            } else {
                $("#fechaFin").removeClass("errorCampo");
                this.reporte.errorFecha = "";
            }
        }
        if (valido) {
            this.cargarPersonal(this.reporte.fechaInicio, this.reporte.fechaFin, undefined);
            this.carga = true;
        }
    };

    //Modal de filtrar
    modalFiltrar(tabActiva: any) {
        if (this.hayRegistros) {
            this.tabclick(tabActiva);
            this.tabActive = tabActiva;
            $('#ddlCitasCanceladas').click();
            this.modales.modalFiltrar.show();
            switch (tabActiva) {
                case 0:
                    this.seleccionarFiltrosDefault(this.personal.dataPersonal, this.copias.personal);
                    this.personal.dataPersonal.unshift({ nombre: "  " + this.reporteProductividadTranslate.todos, id: 'all', s: 'text-align:center', c: 'glyphicon glyphicon-ok', t: 'com' });
                    break;
                case 1:
                    this.seleccionarFiltrosDefault(this.citasCanceladas.dataCitasCanceladas, this.copias.citasCanceladas);
                    this.citasCanceladas.dataCitasCanceladas.unshift({ nombre: "  " + this.reporteProductividadTranslate.todos, id: 'all', s: 'text-align:center', c: 'glyphicon glyphicon-ok', t: 'com' });
                    break;
                case 2:
                    this.seleccionarFiltrosDefault(this.citasEstatus.dataCitasEstatus, this.copias.citasEstatus);
                    this.citasEstatus.dataCitasEstatus.unshift({ nombre: "  " + this.reporteProductividadTranslate.todos, id: 'all', s: 'text-align:center', c: 'glyphicon glyphicon-ok', t: 'com' });
                    break;
                case 3:
                    this.seleccionarFiltrosDefault(this.citasOrigen.dataCitasOrigen, this.copias.citasOrigen);
                    this.citasOrigen.dataCitasOrigen.unshift({ nombre: "  " + this.reporteProductividadTranslate.todos, id: 'all', s: 'text-align:center', c: 'glyphicon glyphicon-ok', t: 'com' });
                    break;
            };
        }
    };

    // Función que resetea el color del campo en el modal
    resetColorCampoModal() {
        switch (this.tabActive) {
            case 0:
                $("#ddlPersonal> div:first-child").attr("style", "outline: none");
                break;
            case 1:
                $("#ddlCitasCanceladas> div:first-child").attr("style", "outline: none");
                break;
            case 2:
                $("#ddlCitasEstatus> div:first-child").attr("style", "outline: none");
                break;
            case 3:
                $("#ddlCitasOrigen> div:first-child").attr("style", "outline: none");
                break;
        }
    };

    // Función que selecciona por default los filtros según el tab actual, o para mantener los filtros seleccionados al abrir y cerrar los modals
    seleccionarFiltrosDefault(datos: any, filtrosSeleccionados: any) {
        this.arreglo = [];
        if (filtrosSeleccionados.length == 0) {
            for (var i = 0; i < datos.length; i++) {
                if (datos[i].id != "all" && datos[i].id != "dropAll") {
                    this.arreglo.push(datos[i].id);
                }
            }
            this.dataFiltro.select = this.arreglo;
        } else {
            for (var i = 0; i < filtrosSeleccionados.length; i++) {
                this.arreglo.push(filtrosSeleccionados[i]);
            }
            this.dataFiltro.select = this.arreglo;
        }
        // Se hacen las copias de los filtros según el tab activo
        switch (this.tabActive) {
            case 0:
                this.copias.personal = this.dataFiltro.select;
                break;
            case 1:
                this.copias.citasCanceladas = this.dataFiltro.select;
                break;
            case 2:
                this.copias.citasEstatus = this.dataFiltro.select;
                break;
            case 3:
                this.copias.citasOrigen = this.dataFiltro.select;
                break;
        }
    };

    onlyUnique(value: any, index: any, self: any) {
        return self.indexOf(value) === index;
    };

    /*$("#modal-filtrar").on('shown.bs.modal', function () { DUDA
        $('#ddlCitasCanceladas').click();
    });*/

    cambio() {
        let ebi_progressBar: any = document.getElementById('progressBar');
        ebi_progressBar.style.width = this.reporte.metaVenta + '%';
    };

    /*$watch('dataFiltro.select', function (newValue: any, oldValue: any) { PARTE DEL DROPALL Y SELECTALL
        if (this.dataFiltro.select[this.dataFiltro.select.length - 1] == 'all') {
            switch (this.tabActive) {
                case 1:
                    setData(this.personal.dataPersonal, 'dropAll');
                    break;
                case 2:
                    setData(this.citasCanceladas.dataCitasCanceladas, 'dropAll');
                    break;
                case 3:
                    setData(this.citasEstatus.dataCitasEstatus, 'dropAll');
                    break;
                case 4:
                    setData(this.citasOrigen.dataCitasOrigen, 'dropAll');
                    break;
            };
        }
        if (this.dataFiltro.select[this.dataFiltro.select.length - 1] == 'dropAll') {
            switch (this.tabActive) {
                case 1:
                    setData(this.personal.dataPersonal, 'all');
                    break;
                case 2:
                    setData(this.citasCanceladas.dataCitasCanceladas, 'all');
                    break;
                case 3:
                    setData(this.citasEstatus.dataCitasEstatus, 'all');
                    break;
                case 4:
                    setData(this.citasOrigen.dataCitasOrigen, 'all');
                    break;
            };
        }
        function setData(this: any, input: number[], tipo: string) {
            if (tipo == 'all') {
                this.dataFiltro.select = [];
                input.splice(0, 1);
                input.unshift({ nombre: "  " + this.reporteProductividadTranslate.todos, id: 'all', s: 'text-align:center', c: 'glyphicon glyphicon-ok', t: 'com' });
            } else {
                this.dataFiltro.select = idSelected(input);
                input.splice(0, 1);
                input.unshift({ nombre: "  " + this.reporteProductividadTranslate.quitar, id: 'dropAll', s: 'text-align:center', c: 'glyphicon glyphicon-remove', t: 'com' });
            }
        };
        function idSelected(input: string | any[]) {
            var data = [];
            for (var i = 0; i < input.length; i++) {
                if (input[i].id != "all") {
                    data.push(input[i].id);
                }
            };
            return data;
        };
    });*/

    // Muestra el detalle
    mostrarDetalle(id: any) {
        this.cargarDetallePersonal(this.reporte.fechaInicio, this.reporte.fechaFin, undefined, id);
    };

    // Función que verifica si hay seleccionado algo en el campo del modal filtrar
    verificarSeleccionFiltros(datos: any) {
        // Si no hay nada seleccionado, se borra el elemento "Quitar" y se agrega el elemento "Todos"
        if (this.dataFiltro.select.length == 0) {
            for (var i = 0; i < datos.length; i++) {
                if (datos[i].id == 'dropAll') {
                    datos.splice(i, 1);
                    datos.unshift({ nombre: "  " + this.reporteProductividadTranslate.todos, id: 'all', s: 'text-align:center', c: 'glyphicon glyphicon-ok', t: 'com' });
                }
            }
        }
        // Si todos ya han sido seleccionados, se borra el elemento "Todos" y se agrega el elemento "Quitar"
        if (this.dataFiltro.select.length == datos.length - 1 || this.dataFiltro.select.length > 0) {
            for (var i = 0; i < datos.length; i++) {
                if (datos[i].id == 'all') {
                    datos.splice(i, 1);
                    datos.unshift({ nombre: "  " + this.reporteProductividadTranslate.quitar, id: 'dropAll', s: 'text-align:center', c: 'glyphicon glyphicon-remove', t: 'com' });
                }
            }
        }
    };

    formatear(num: any){
        num += '';
        var splitStr = num.split('.');
        var splitLeft = splitStr[0];
        var splitRight = splitStr.length > 1 ? this.sepDecimal + splitStr[1] : '';
        var regx = /(\d+)(\d{3})/;
        while (regx.test(splitLeft)) {
            splitLeft = splitLeft.replace(regx, '$1' + this.separador + '$2');
        }
        return this.simbol + splitLeft + splitRight;
    }

    ccc(name: any, id: any, ctrl: any) {
        if (ctrl == undefined) {
            var s = "";
            switch (this.tabActive) {
                case 0:
                    s = this.formatText(this.reporte.tablaPersonal, 1, id);
                    break;
                case 1:
                    s = this.formatText(this.reporte.tablaCitasCanceladas, 1, id);
                    break;
                case 2:
                    if (ctrl == null) {
                        s = this.formatText(this.citasEstatus.dataCitasEstatus, 0, id);
                    } else {
                        s = this.formatText(this.reporte.tablaCitasEstatus, 0, id);
                    }
                    break;
                case 3:
                    s = this.formatText(this.reporte.tablaCitasOrigen, 2, id);
                    break;
            }
            $("#pop" + name + id).popover({
                html: true,
                animation: false,
                content: s,
                placement: "right"
            });
        } else {
            $("#pop" + name + id).popover('show');
        }
    };

    formatText(input: any, t: any, id: any){
        var text = "";
        for (var i = 0; i < input.length; i++) {
            if (input[i].id == id) {
                text = '<center><span style="color:#428bca;font-weight:bold;">' + this.reporteProductividadTranslate.ventaDiaria + '</span></center>';
                if (t == 0) {
                    text += '<div>Total:$0</div>';
                } else {
                    if (t == 1) {
                        text += '<div>' + this.reporteProductividadTranslate.cantidadCitas2 + input[i].cantidadCitas + '</div>';
                    }
                    if (t == 2) {
                        text += '<div>' + this.reporteProductividadTranslate.cantidadPagos + input[i].pMetodoPago + '</div>';
                        text += '<div>' + this.reporteProductividadTranslate.total + ((input[i].total == null) ? '$0' : input[i].total) + '</div>';
                    } else {
                        text += '<div>' + this.reporteProductividadTranslate.total + ((input[i].pago == null) ? '$0' : input[i].pago) + '</div>';
                    }
                }
            }
        }
        return text;
    }

    reporte_inicializarCalendario() {
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
        
        // this.reporte.fechas = {startDate: null, endDate: null};
        // this.reporte.fechas = {startDate: this.reporte.fechaInicio, endDate: this.reporte.fechaFin};
    };

    reporte_cambioFecha(){
        this._pantallaServicio.mostrarSpinner();

        this.copias.personal = [];
        this.copias.citasCanceladas = [];
        this.copias.citasEstatus = [];
        this.copias.citasOrigen = [];

        var fechaBusquedaSplit = [this.reporte.fechas.startDate, this.reporte.fechas.endDate];
        this.reporte.fechaInicio = (moment(JSON.parse(JSON.stringify(fechaBusquedaSplit[0])), 'DD/MM/YYYY').startOf('day')).format('YYYY-MM-DD HH:mm:ss');
        this.reporte.fechaFin = (moment(JSON.parse(JSON.stringify(fechaBusquedaSplit[1])), 'DD/MM/YYYY').endOf('day')).format('YYYY-MM-DD HH:mm:ss');

        if(this.reporte.fechaInicio == "Invalid date" || this.reporte.fechaFin == "Invalid date"){
            this.reporte.fechaInicio = moment(new Date( this.reporte.fechas.startDate['$y'], this.reporte.fechas.startDate['$M'], this.reporte.fechas.startDate['$D'] )).startOf('day').format('YYYY-MM-DD HH:mm:ss');
            this.reporte.fechaFin = moment(new Date( this.reporte.fechas.endDate['$y'], this.reporte.fechas.endDate['$M'], this.reporte.fechas.endDate['$D'] )).endOf('day').format('YYYY-MM-DD HH:mm:ss');
        }
        
        this.buscar();
    }

    //----------------------------------------- Grid estatus Cita ------------------------------------//
    // Función que redirecciona a Cliente JC
    irACliente(cliente: any) {
        this.modales.modalEstatusCita.hide();
        this._router.navigate(['catalogos/cliente-creacion-edicion'], {
            queryParams: { idCliente: cliente.idCliente},
        });
    }

    //Consulta de informacion para el grid, obtiene el id del estatus cita
    consultaEstatusCita(i: any) {
        this._pantallaServicio.mostrarSpinner();
        var params: any = {};
        params.idEstatusCita = i;
        params.fechaInicio = this.reporte.fechaInicio;
        params.fechaFin = this.reporte.fechaFin;

        this._backService.HttpPost("consultas/reporteProductividad/obtenerCitasPorEstatus", {}, params).subscribe((response: string) => {
            this.historial.dataHistorial = eval(response);

            if (this.historial.dataHistorial == 0) {
                this._pantallaServicio.ocultarSpinner();
                this._toaster.error("No existen registros en el lapso de tiempo seleccionado");
            }
            else {
                this.dataSource.data = this.historial.dataHistorial;
                this.dataSource.sort = this.sort;
                this.modales.modalEstatusCita.show();
                $('.ui-grid-viewport').css('overflow-anchor', 'none');
                this._pantallaServicio.ocultarSpinner();
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

    isInvalidDate = (m: moment.Moment) =>  {
        return this.invalidDates.some(d => d.isSame(m, 'day') )
    }
}