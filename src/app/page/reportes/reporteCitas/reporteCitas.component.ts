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
    selector: 'app-reporteCitas',
    templateUrl: './reporteCitas.component.html',
    styleUrls: ['./reporteCitas.component.scss', '../../page.component.scss'],
})

export class ReporteCitasComponent implements OnInit {
    // Variables de Translate
    reporteProductividadTranslate: any = {};
    reporteVentasTranslate: any = {};
    calendarioTranslate: any = {};
    sessionTraslate: any = {};

    // Modales
    modales: any = {}; 

    constructor(private _translate: TranslateService, private _backService: MethodsService, public _pantallaServicio: PantallaService, private _dialog: MatDialog, private _router: Router, private _toaster: ToasterService, private matIconRegistry: MatIconRegistry, private domSanitizer: DomSanitizer) {
        this._translate.setDefaultLang(this._pantallaServicio.idioma);
        this._translate.use(this._pantallaServicio.idioma);

        this._translate.get('calendarioTranslate').subscribe((translated: string) => {  
            this.calendarioTranslate = this._translate.instant('calendarioTranslate');
            this.sessionTraslate = this._translate.instant('sessionTraslate');
            this.reporteVentasTranslate = this._translate.instant('reporteVentasTranslate');
            this.reporteProductividadTranslate = this._translate.instant('reporteProductividad');
        });

        this.matIconRegistry.addSvgIcon('iconCasa1', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Casa1-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconFlecha1DerechaPeque', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/FlechaDerechaPequena-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconCalendarioEditar', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/CalendarioEditar-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconFlechaAbajoPeque', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/FlechaAbajoPequena-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconUsuario', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/06-Clientes-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconSucursal', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/03-Sucursal-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconServicios', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/04-Servicios-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconTiposCambio', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/10-3-TiposdeCambios-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconPersonal', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/05-Personal-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconFiltro', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Filtros-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconMenuHamburguesa', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Menu-Hamburguesa-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconCruzCirculo', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/10-2-TiposdeExcepcion-icon.svg"));
    }

    ngOnInit(): void {
        this._pantallaServicio.mostrarSpinner();
        this.cargarPestanias(); // Se cargan las pestañas y posteriormente se invocan: reporte_inicializarCalendario(), cargarMetaVenta(), buscar().
        this.crearModales();
    }

    crearModales() {
        if ($('body').find('.modal-filtrar').length > 1) {
            $('body').find('.modal-filtrar')[1].remove();
        }
        this.modales.modalFiltrar = new bootstrap.Modal($("#modal-filtrar").appendTo("body"), {
            backdrop: "static", 
            keyboard: false,
        });
    }

    // ------------------------------------------------------------------------------------------- //
    // ----------------------------------------- REPORTE DE CITAS -------------------------------- //
    // ------------------------------------------------------------------------------------------- //

    // -------------------------------------- Declaración de variables --------------------------- //
    @ViewChild('tabGroup', {static: false}) tab: MatTabGroup; // Se usa esta variable para controlar las pestañas JC
    displayedColumns_Sucursal: string[] = ["nombre", "cantidadCitas", "propina", "pago"];
    displayedColumns_Personal: string[] = ["nombre", "cantidadCitas", "pago"];
    displayedColumns_Servicio: string[] = ["nombre", "pago"];
    displayedColumns_MetodoPago: string[] = ["nombre", "pMetodoPago", "total"];
    displayedColumns_Clientes: string[] = ["nombre", "cantidadCitas", "total"];
    dataSource = new MatTableDataSource<any>([]);
    
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
        tablaSucursal: [],
        tablaPersonal: [],
        tablaServicio: [],
        tablaPago: [],
        tablaClientes: [],
        primeraCarga: true
    };
    sucursal: any = {
        dataSucursal: [''],
        dataFiltro: [],
        total: ""
    };
    personal: any = {
        dataPersonal: [],
        dataFiltro: [],
        total: ""
    };
    servicio: any = {
        dataServicio: [],
        dataFiltro: [],
        total: ""
    };
    metodoPago: any = {
        dataMetodoPago: [],
        dataFiltro: [],
        total: ""
    };
    clientes: any = {
        dataClientes: [],
        dataFiltro: [],
        total: ""
    };
    dataFiltro: any = {
        data: [],
        select: []
    };
    registroOculto: any = {
        sucursal: [],
        personal: [],
        servicio: [],
        metodoPago: [],
        clientes: []
    };
    formatNumber: any = {
        separador: ",",
        sepDecimal: '.',
        formatear: function (num: any) {
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
        new: function (num: any, simbol: any) {
            this.simbol = simbol || '';
            return this.formatear(num);
        }
    }
    carga = false;
    mostrarGraph = true;
    graficaActiva = true;
    eventInfo = false;
    tabActiveOld = 1;
    tabActive = 1;
    btnFiltrar = [true, true, true, true, true];
    dataPantalla = "";
    margin = "0";
    nombreTab = "Sucursal";
    mensajesPos = "bottom";
    invalidDates: moment.Moment[] = [moment().add(2, 'days'), moment().add(3, 'days'), moment().add(5, 'days')];
    ranges: any;
    locale: any = {
        format: 'DD/MM/YYYY'
    }
    contadorAux = 0;
    myChart: any;
    myChartGeneralLineas: any;
    myChartPastel: any;
    myChartSucursal: any;
    myChartPersonal: any;
    myChartMetodoP: any;
    myChartServicio: any;
    myChartClientes: any;
    colores = [
        "#7cb5ec",
        "#8bf87a",
        "#1fe654",
        "#fff23a",
        "#6164ff",
        "#5A5A5A",
        "#0A2A38",
        "#58b578",
        "#B32032",
        "#054353",
        "#FCDD1A",
        "#24557D",
        "#4B296B",
        "#99244A",
        "#EC6351",
        "#377D7B",
        "#0dcaf0",
    ];
    contadoEntradas = 0;
    
    
    // ----------------------------------- Declaracion de funciones ----------------------------------- //
    cargarPestanias = async() => {  
        const x = await this.cargarPestaniasDetalle();
        this.reporte_inicializarCalendario();
        this.cargarMetaVenta();
        this.buscar();
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
                                this.tab.selectedIndex = 4;
                                setTimeout(() => {
                                    this.tab.selectedIndex = 0;
                                    resolve(true);
                                }, 3);
                            }, 3);
                        }, 3);
                    }, 3);
                }, 3);
            }, 3);
        });
    }

    //Función que carga la meta de venta
    cargarMetaVenta() {
        var params: any = {};
        var fi = this.reporte.fechaInicio.substring(0,10);
        var ff = this.reporte.fechaFin.substring(0,10);
        params.fechaInicio = fi.split("-").reverse().join("/");
        params.fechaFin = ff.split("-").reverse().join("/");

        this._backService.HttpPost("consultas/reporteVentas/consultarVenta", {}, params).subscribe((response: string) => {
            var dataTemp = eval(response);

            this.dataGraph(dataTemp);
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

        function formatDate(date: any) {
            var d = new Date(date),
                month = '' + (d.getMonth() + 1),
                day = '' + d.getDate(),
                year = d.getFullYear();

            if (month.length < 2) month = '0' + month;
            if (day.length < 2) day = '0' + day;

            return [year, month, day].join('-');
        }
    }

    graph(valueMaxMin: any, valueP: any, data: any) {
        var porcentaje = 0;
        var mensaje = "";

        if(valueMaxMin.max < data[0]){
            porcentaje = valueMaxMin.max;
            mensaje = "¡Error!"
        }else{
            porcentaje = (valueMaxMin.max - data[0]);
            mensaje = "$" + data[0];
        }

        const ebi_gMeta: any = document.getElementById('gMeta') as HTMLCanvasElement;

        if (this.myChart) {
            this.myChart.destroy();
        }

        this.myChart = new Chart(ebi_gMeta, {
            type: 'doughnut',
            data: {
                //labels: [valueMaxMin.min + "K"],
                datasets: [{
                    backgroundColor: ['#eeeeee','green'],
                    borderColor: "#c2c2c2",
                    data: [valueMaxMin.min, data[0], porcentaje],
                }]
            },
            options: {
                circumference: 180,
                rotation: -1.0 * 90,
                responsive: true,
                scales: {
                    x: {
                        border: { 
                            display: false
                        },
                        display: true,
                        title: {
                            display: true,
                            padding: {top: -65},
                            text: [mensaje, "Venta del Mes"]
                        }
                    },
                    y: {
                        border: { 
                            display: false
                        },
                        display: false,
                    }
                },
                plugins: {
                    legend: {
                        display: false,
                    },
                    title: {
                        display: true,
                        text: [valueMaxMin.title.text, "$"+valueMaxMin.max],
                        font: {
                            size: 14,
                        },
                        //padding: {top: 70},
                        position: "top"
                    }
                }
            },
        });
          
        //var ctx = document.getElementById('myChart').getContext('2d');
          
        //   this.myChart = new Chart(ebi_gMeta, {
        //       type: 'doughnut',
        //       data: {
        //           labels: [
        //             [minVal + "K"]
        //           ],
        //           datasets: [{
        //               backgroundColor: [
        //                 '#8b0000',
        //                 'green'
        //               ],
        //               data: [0, value, (100 - value)] //Tomarlo como una resta
        //           }],
        //       },
        //     showDatapoints: true,
        //       options: {
        //         tooltips: {
        //           // enabled: false
        //         },
        //         legend: {
        //           display: false,
        //         },
        //           layout: {
        //           padding: {
        //               left: 50,
        //               right: 50,
        //               top: 50,
        //               bottom: 50
        //           }
        //         },
        //         plugins: {
        //           datalabels: {
        //             color: '#000',
        //             align: 'end',
        //             anchor: 'end',
        //             formatter: function(value, context) {
        //               return context.chart.data.labels[context.dataIndex];
        //             },
        //             font: {
        //               size: 12,
        //               style: 'bold',
        //             }
        //           },
        //         },
        //         rotation: -1.0 * Math.PI,
        //         circumference: Math.PI,
        //       },
        //   });



        //------------ ORIGINAL
        // this.myChart = new Chart(ebi_gMeta, {
        //     type: 'bar',
        //     data: {
        //         labels: cat, // Nombre de las barras
        //         datasets: [{
        //             label: "Data",
        //             data: dat, // Valores de las barras
        //             borderWidth: 1
        //         }]
        //     },
        //     options: {
        //         responsive: true,
        //         plugins: {
        //             title: { // Titulo del Gráfico
        //                 text: 'Citas por Personal',
        //                 display: true
        //             },
        //             legend: {
        //                 display: false
        //             },
        //         },
        //         scales: {
        //             x: {
        //                 stacked: true,
        //             },
        //             y: {
        //                 stacked: true,
        //                 title: {
        //                     display: true,
        //                     text: this.reporteProductividadTranslate.citas
        //                   }
        //             }
        //         }
        //     },
        // });

        // var gaugeOptions = {
        //     chart: {
        //         backgroundColor: 'rgba(255, 255, 255, 0)',
        //         type: 'solidgauge'
        //     },
        //     title: null,
        //     exporting: {
        //         backgroundColor: 'rgba(255, 255, 255, 0)',
        //         enabled: false
        //     },
        //     pane: {
        //         center: ['50%', '85%'],
        //         size: '140%',
        //         startAngle: -90,
        //         endAngle: 90,
        //         background: {
        //             backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || '#EEE',
        //             innerRadius: '70%',
        //             outerRadius: '100%',
        //             shape: 'arc'
        //         }
        //     },
        //     tooltip: {
        //         enabled: false
        //     },
        //     yAxis: {
        //         stops: [
        //             [0.1, '#DF5353'], // red
        //             [0.5, '#DDDF0D'], // yellow
        //             [0.9, '#55BF3B'] // green
        //         ],
        //         lineWidth: 0,
        //         minorTickInterval: null,
        //         tickAmount: 2,
        //         title: {
        //             y: -60
        //         },
        //         labels: {
        //             y: 16
        //         }
        //     },
        //     plotOptions: {
        //         solidgauge: {
        //             innerRadius: '70%',
        //             dataLabels: {
        //                 y: 5,
        //                 borderWidth: 0,
        //                 useHTML: true
        //             }
        //         }
        //     }
        // };
        // $('#container-meta').highcharts(Highcharts.merge(gaugeOptions, {
        //     yAxis: valueMaxMin,
        //     credits: {
        //         enabled: false
        //     },
        //     series: [{
        //         name: 'Speed',
        //         data: data,
        //         dataLabels: {
        //             format: '<div style="text-align:center"><span style="font-size:15px;color:' +
        //                 ((Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black') + '">' + valueP + '</span><br/>' +
        //                    '<span style="font-size:12px;color:silver">' + this.reporteVentasTranslate.ventaDelMes') + '</span></div>'
        //         },
        //         tooltip: {
        //             valueSuffix: ' km/h'
        //         }
        //     }]
        // }));
    };
    
    dataGraph(dataIn: any) {
        var reporteMeta = this.reporte.metaVenta;
        if (this.reporte.primeraCarga) {
            this.reporte.primeraCarga = false;
            reporteMeta = dataIn[0].meta;
            this.reporte.metaVenta = reporteMeta;
        }
        var valueMax = { min: 0, max: parseInt(reporteMeta), tickPositions: [0, parseInt(reporteMeta)], title: { text: this.reporteVentasTranslate.metaDeVentas } };
        var valueP = dataIn[0].totalPagos;
        var data = [valueP];
        valueP = this.formatNumber.new(valueP, "$");

        this.graph(valueMax, valueP, data);
    };      

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

        //this.reporte.fechas = {startDate: null, endDate: null};
        // this.reporte.fechas.startDate = this.reporte.fechaInicio;
        // this.reporte.fechas.endDate = this.reporte.fechaFin;
    };

    reporte_cambioFecha(){
        this._pantallaServicio.mostrarSpinner();
        
        this.sucursal.dataFiltro = [];
        this.personal.dataFiltro = [];
        this.servicio.dataFiltro = [];
        this.metodoPago.dataFiltro = [];
        this.clientes.dataFiltro = [];

        var fechaBusquedaSplit = [this.reporte.fechas.startDate, this.reporte.fechas.endDate];
        this.reporte.fechaInicio = (moment(JSON.parse(JSON.stringify(fechaBusquedaSplit[0])), 'DD/MM/YYYY').startOf('day')).format('YYYY-MM-DD HH:mm:ss');
        this.reporte.fechaFin = (moment(JSON.parse(JSON.stringify(fechaBusquedaSplit[1])), 'DD/MM/YYYY').endOf('day')).format('YYYY-MM-DD HH:mm:ss');

        if(this.reporte.fechaInicio == "Invalid date" || this.reporte.fechaFin == "Invalid date"){
            this.reporte.fechaInicio = moment(new Date( this.reporte.fechas.startDate['$y'], this.reporte.fechas.startDate['$M'], this.reporte.fechas.startDate['$D'] )).startOf('day').format('YYYY-MM-DD HH:mm:ss');
            this.reporte.fechaFin = moment(new Date( this.reporte.fechas.endDate['$y'], this.reporte.fechas.endDate['$M'], this.reporte.fechas.endDate['$D'] )).endOf('day').format('YYYY-MM-DD HH:mm:ss');
        }

        this.buscar();
    }

    //Función que guarda la meta de venta
    guardarMeta() {
        var params: any = {};
        params.codigo = 'WSTOVEESMESSU';
        params.valor = this.reporte.metaVenta;

        this._backService.HttpPost("configuracion/configuracionSucursal/guardarParametro", {}, params).subscribe((response: string) => {
            // No retorna nada
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

    //Función que busca los registros en las fechas determinadas
    buscar() {
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
            valido = false;
        }
        else {
            $("#fechaInicio").removeClass("errorCampo");
        }
        if (this.reporte.fechaFin == "" || this.reporte.fechaFin == undefined) {
            $("#fechaFin").addClass("errorCampo");
            valido = false;
        } else {
            if (this.reporte.fechaFin < this.reporte.fechaInicio) {
                $("#fechaFin").addClass("errorCampo");
                valido = false;
            } else {
                $("#fechaFin").removeClass("errorCampo");
            }
        }

        if (valido) {
            this.cargarPersonal(this.reporte.fechaInicio, this.reporte.fechaFin, undefined);
            this.cargarServicio(this.reporte.fechaInicio, this.reporte.fechaFin, undefined);
            this.cargarMetodoPago(this.reporte.fechaInicio, this.reporte.fechaFin, undefined);
            this.cargarClientes(this.reporte.fechaInicio, this.reporte.fechaFin, undefined);
            this.cargarSucursal(this.reporte.fechaInicio, this.reporte.fechaFin, undefined);
            this.carga = true;

            setTimeout(() => {
                $('#myTabContent').show();
                $('#myTabContent').click();
            }, 200);
        }
    };

    //Carga los datos de sucursal
    cargarSucursal(fechaInicio: any, fechaFin: any, data: any) {
        if (data == undefined) {
            var params: any = {};
            params.tipo = 1;

            params.fechaInicio = fechaInicio;
            params.fechaFin = fechaFin;

            this._backService.HttpPost("consultas/reporteVentas/consultarDatos", {}, params).subscribe((response: string) => {
                this._pantallaServicio.ocultarSpinner();
                var dataTemp = eval(response);
                if (dataTemp.length > 0) {
                    this.btnFiltrar[0] = false;
                } else {
                    this.btnFiltrar[0] = true;
                }
                this.sucursal.dataSucursal = dataTemp;
                this.reporte.tablaSucursal = JSON.parse(JSON.stringify(dataTemp));
                this.dataGraph02(dataTemp);
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
            this.sucursal.dataSucursal = data;
            this.dataGraph02(data);
        }
        
    };

    dataGraph02(dataIn: any) { // Gráfico Pestaña Sucursal
        var labels = [];
        var datos = [];
        var total = 0;

        for (i = 0; i < dataIn.length; i++) {
            labels.push(dataIn[i].nombre);
            datos.push(dataIn[i].pago);
            total += dataIn[i].pago;
        }
        for (var i = 0; i < this.sucursal.dataSucursal.length; i++) {
            this.registroOculto.sucursal[this.sucursal.dataSucursal[i].id] = true;
        }
        this.sucursal.total = this.formatNumber.new(total, "$");
        this.graficaLineas('gSucursal', labels, datos);
    };

    //Carga los datos del personal
    cargarPersonal(fechaInicio: any, fechaFin: any, data: any) {
        if (data == undefined) {
            var params: any = {};
            params.tipo = 2;

            params.fechaInicio = fechaInicio;
            params.fechaFin = fechaFin;

            this._backService.HttpPost("consultas/reporteVentas/consultarDatos", {}, params).subscribe((response: string) => {
                var dataTemp = eval(response);

                if (dataTemp.length > 0) {
                    this.btnFiltrar[1] = false;
                } else {
                    this.btnFiltrar[1] = true;
                }
                this.personal.dataPersonal = dataTemp;
                this.reporte.tablaPersonal = JSON.parse(JSON.stringify(dataTemp));

                this.dataGraph03(dataTemp);
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
            this.personal.dataPersonal = data;
            this.dataGraph03(data);
        }
    };

    graph03(labels: any, data: any) { // Gráfico Pestaña Personal
        const ebi_gPersonal: any = document.getElementById('gPersonal') as HTMLCanvasElement;

        if (this.myChartPersonal) {
            this.myChartPersonal.destroy();
        }
        
        this.myChartPersonal = new Chart(ebi_gPersonal, {
            type: 'bar',
            data: {
                labels: labels, // Nombre de las barras
                datasets: [{
                    label: "Data",
                    data: data, // Valores de las barras
                    borderWidth: 1,
                    backgroundColor: this.colores
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: { // Titulo del Gráfico
                        text: "",
                        display: false
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
                            text: this.reporteVentasTranslate.ventas
                          }
                    }
                }
            },
        });
    };

    dataGraph03(dataIn: any) {
        var labels = [];
        var datos = [];
        var total = 0;

        for (i = 0; i < dataIn.length; i++) {
            labels.push(dataIn[i].nombre);
            datos.push(dataIn[i].pago);
            total += dataIn[i].pago;
        }

        for (var i = 0; i < this.personal.dataPersonal.length; i++) {
            this.registroOculto.personal[this.personal.dataPersonal[i].id] = true;
        }
        this.personal.total = this.formatNumber.new(total, "$");

        this.graph03(labels, datos);
    };

    //Función que carga los datos de método de pago
    cargarMetodoPago(fechaInicio: any, fechaFin: any, data: any) {
        if (data == undefined) {
            var params: any = {};
            params.tipo = 4;

            params.fechaInicio = fechaInicio;
            params.fechaFin = fechaFin;

            this._backService.HttpPost("consultas/reporteVentas/consultarDatos", {}, params).subscribe((response: string) => {
                var dataTemp = eval(response);

                if (dataTemp.length > 0) {
                    this.btnFiltrar[3] = false;
                } else {
                    this.btnFiltrar[3] = true;
                }
                this.metodoPago.dataMetodoPago = dataTemp;
                this.reporte.tablaPago = JSON.parse(JSON.stringify(dataTemp));

                this.dataGraph04(dataTemp);
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
            this.metodoPago.dataMetodoPago = data;
            this.dataGraph04(data);
        }
    };

    graph04(labels: any, data: any) { // Gráfico de Pestaña Método Pago
        const ebi_gpPago: any = document.getElementById('gpPago') as HTMLCanvasElement;

        if (this.myChartMetodoP) {
            this.myChartMetodoP.destroy();
        }
        
        this.myChartMetodoP = new Chart(ebi_gpPago, {
            type: 'pie',
            data: {
                labels: labels, // Nombre de los labels
                datasets: [{
                    data: data, // Valores de las barras
                    borderWidth: 1,
                }]
            },
            options: {
                plugins: {
                    title: { // Titulo del Gráfico
                        text: "",
                        display: false
                    },
                    legend: {
                        position: 'bottom'
                    },
                },
            },
        });
    };


    dataGraph04(dataIn: any) {
        var labels = [];
        var datos = [];
        var total = 0;
        
        for (var i = 0; i < dataIn.length; i++) {
            labels.push(dataIn[i].nombre);
            datos.push(dataIn[i].total);//pMetodoPago;
            total += dataIn[i].total;
        }
        
        for (var i = 0; i < this.metodoPago.dataMetodoPago.length; i++) {
            this.registroOculto.metodoPago[this.metodoPago.dataMetodoPago[i].id] = true;
        }
        this.metodoPago.total = this.formatNumber.new(total, "$");

        this.graph04(labels, datos);
    };

    //Función que carga los datos de servicio
    cargarServicio(fechaInicio: any, fechaFin: any, data: any) {
        if (data == undefined) {
            var params: any = {};
            params.tipo = 3;

            params.fechaInicio = fechaInicio;
            params.fechaFin = fechaFin;

            this._backService.HttpPost("consultas/reporteVentas/consultarDatos", {}, params).subscribe((response: string) => {
                var dataTemp = eval(response);
                
                if (dataTemp.length > 0) {
                    this.btnFiltrar[2] = false;
                } else {
                    this.btnFiltrar[2] = true;
                }
                if (dataTemp.length != 0) {
                    var st = 0;
                    for (var a = 0; a < dataTemp.length; a++) {
                        st += dataTemp[a].pago;
                    }
                    if (st != dataTemp[0].total) {
                        dataTemp.push({ fechaBaja: null, id: null, idSucursal: dataTemp[0].idSucursal, nombre: this.reporteProductividadTranslate.otros, pago: dataTemp[0].total - st, total: st });
                    }
                }

                this.servicio.dataServicio = dataTemp;
                this.reporte.tablaServicio = JSON.parse(JSON.stringify(dataTemp));

                this.dataGraph05(dataTemp);
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
            this.servicio.dataServicio = data;
            this.dataGraph05(data);
        }
    };

    graph05(labels: any, data: any) { //Gráfico de Pestaña de Servicio
        const ebi_gServicio: any = document.getElementById('gServicio') as HTMLCanvasElement;

        if (this.myChartServicio) {
            this.myChartServicio.destroy();
        }
        
        this.myChartServicio = new Chart(ebi_gServicio, {
            type: 'bar',
            data: {
                labels: labels, // Nombre de las barras
                datasets: [{
                    label: "Data",
                    data: data, // Valores de las barras
                    borderWidth: 1,
                    backgroundColor: this.colores
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: { // Titulo del Gráfico
                        text: "",
                        display: false
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
                            text: this.reporteVentasTranslate.ventas
                          }
                    }
                }
            },
        });
    };

    dataGraph05(dataIn: any) {
        var labels = [];
        var datos = [];
        var total = 0;

        for (var i = 0; i < dataIn.length; i++) {
            total += dataIn[i].pago;

            if (dataIn[i].nombre == null) {
                labels.push(this.reporteProductividadTranslate.otros);
            }else{
                labels.push(dataIn[i].nombre);
            }
            datos.push(dataIn[i].pago);
        }
        for (var i = 0; i < this.servicio.dataServicio.length; i++) {
            this.registroOculto.servicio[this.servicio.dataServicio[i].id] = true;
        }
        this.servicio.total = this.formatNumber.new(total, "$");
        this.graph05(labels, datos);
    };

    //Carga los datos de los clientes
    cargarClientes(fechaInicio: any, fechaFin: any, data: any) {
        if (data == undefined) {
            var params: any = {};
            params.tipo = 5;

            params.fechaInicio = fechaInicio;
            params.fechaFin = fechaFin;

            this._backService.HttpPost("consultas/reporteVentas/consultarDatos", {}, params).subscribe((response: string) => {
                var dataTemp = eval(response);
                if (dataTemp.length > 0) {
                    this.btnFiltrar[4] = false;
                } else {
                    this.btnFiltrar[4] = true;
                }
                this.clientes.dataClientes = dataTemp;
                this.reporte.tablaClientes = JSON.parse(JSON.stringify(dataTemp));
                this.dataGraph06(dataTemp);
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
            this.clientes.dataClientes = data;
            this.dataGraph06(data);
        }
    };

    graph06(labels: any, datos: any) { //Gráfico de Pestaña de Clientes
        const ebi_gClientes: any = document.getElementById('gClientes') as HTMLCanvasElement;

        if (this.myChartClientes) {
            this.myChartClientes.destroy();
        }
        
        this.myChartClientes = new Chart(ebi_gClientes, {
            type: 'bar',
            data: {
                labels: labels, // Nombre de las barras
                datasets: [{
                    label: "Data",
                    data: datos, // Valores de las barras
                    borderWidth: 1,
                    backgroundColor: this.colores
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: { // Titulo del Gráfico
                        text: "",
                        display: false
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
                            text: this.reporteVentasTranslate.totalVentas
                          }
                    }
                }
            },
        });
    };

    dataGraph06(dataIn: any) {
        var labels = [];
        var datos = [];
        var total = 0;

        for (i = 0; i < dataIn.length; i++) {
            labels.push(dataIn[i].nombre);
            datos.push(dataIn[i].total);
            total += dataIn[i].total;
        }
        for (var i = 0; i < this.clientes.dataClientes.length; i++) {
            this.registroOculto.clientes[this.clientes.dataClientes[i].id] = true;
        }
        this.clientes.total = this.formatNumber.new(total, "$");

        this.graph06(labels, datos);
    };

    //Función para filtrar las graficas
    filtrar() {
        if (this.dataFiltro.select.length > 0) {
            switch (this.tabActive) {
                case 0:
                    var data = this.getDataFilter(this.reporte.tablaSucursal);
                    var dataTemp = JSON.parse(JSON.stringify(data));
                    this.sucursal.dataFiltro = JSON.parse(JSON.stringify(this.dataFiltro.select));
                    this.dataFiltro.select = [];
                    this.cargarSucursal(this.reporte.fechaInicio, this.reporte.fechaFin, dataTemp);
                    break;
                case 1:
                    var data = this.getDataFilter(this.reporte.tablaPersonal);
                    this.personal.dataFiltro = JSON.parse(JSON.stringify(this.dataFiltro.select));
                    this.dataFiltro.select = [];
                    this.cargarPersonal(this.reporte.fechaInicio, this.reporte.fechaFin, data);
                    break;
                case 2:
                    var data = this.getDataFilter(this.reporte.tablaServicio);
                    this.servicio.dataFiltro = JSON.parse(JSON.stringify(this.dataFiltro.select));
                    this.dataFiltro.select = [];
                    this.cargarServicio(this.reporte.fechaInicio, this.reporte.fechaFin, data);
                    break;
                case 3:
                    var data = this.getDataFilter(this.reporte.tablaPago);
                    this.metodoPago.dataFiltro = JSON.parse(JSON.stringify(this.dataFiltro.select));
                    this.dataFiltro.select = [];
                    this.cargarMetodoPago(this.reporte.fechaInicio, this.reporte.fechaFin, data);
                    break;
                case 4:
                    var data = this.getDataFilter(this.reporte.tablaClientes);
                    this.clientes.dataFiltro = JSON.parse(JSON.stringify(this.dataFiltro.select));
                    this.dataFiltro.select = [];
                    this.cargarClientes(this.reporte.fechaInicio, this.reporte.fechaFin, data);
                    break;
            }
            
            this.modales.modalFiltrar.hide();
        } else {
            switch (this.tabActive) {
                case 0:
                    $('#ddlSucursal > div:first-child').attr("style", "outline: red solid 1px !important");
                    break;
                case 1:
                    $('#ddlPersonal > div:first-child').attr("style", "outline: red solid 1px !important");
                    break;
                case 2:
                    $('#ddlServicios > div:first-child').attr("style", "outline: red solid 1px !important");
                    break;
                case 3:
                    $('#ddlPago > div:first-child').attr("style", "outline: red solid 1px !important");
                    break;
                case 4:
                    $('#ddlClientes > div:first-child').attr("style", "outline: red solid 1px !important");
                    break;
            }
        }
    };

    getDataFilter(input: any) {
        var data = [];

        for (var i = 0; i < input.length; i++) {
            for (var j = 0; j < this.dataFiltro.select.length; j++) {
                if (input[i].id == this.dataFiltro.select[j]) {
                    data.push(input[i]);
                }
            }
        }

        return data;
    };

    //Función que valida las fechas antes de buscar
    actualizarTabActiva(tab: any) {
        if(this.contadorAux > 3){
            var nombres = ['Sucursal', 'Personal', 'Servicios', 'Método de Pago', 'Clientes'];
            this.nombreTab = nombres[tab];
            this.tabActiveOld = JSON.parse(JSON.stringify(this.tabActive));
            this.tabActive = tab;
    
            if (this.reporte.fechaInicio == "" && this.reporte.fechaFin == "") {
                $('#fechaInicio').addClass("errorCampo");
                $('#fechaFin').addClass("errorCampo");
            }
        }
        this.contadorAux++;
    };

    //Modal de filtrar
    modalFiltrar() {
        this.modales.modalFiltrar.show();

        switch (this.tabActive) {
            case 0:
                this.dataFiltro.select = [];
                this.dataFiltro.select = JSON.parse(JSON.stringify(this.sucursal.dataFiltro));
                if (this.dataFiltro.select.length == 0) {
                    this.reporte.tablaSucursal.unshift({ nombre: "  " + this.reporteVentasTranslate.quitar, id: 'dropAll', s: 'text-align:center', c: 'glyphicon glyphicon-remove', t: 'com' });
                    this.dataFiltro.select = getId(this.reporte.tablaSucursal);
                } else {
                    this.reporte.tablaSucursal.unshift({ nombre: "  " + this.reporteVentasTranslate.todos, id: 'all', s: 'text-align:center', c: 'glyphicon glyphicon-ok', t: 'com' });
                }
                break;
            case 1:
                this.dataFiltro.select = [];
                this.dataFiltro.select = JSON.parse(JSON.stringify(this.personal.dataFiltro));
                if (this.dataFiltro.select.length == 0) {
                    this.reporte.tablaPersonal.unshift({ nombre: "  " + this.reporteVentasTranslate.quitar, id: 'dropAll', s: 'text-align:center', c: 'glyphicon glyphicon-remove', t: 'com' });
                    this.dataFiltro.select = getId(this.reporte.tablaPersonal);
                } else {
                    this.reporte.tablaPersonal.unshift({ nombre: "  " + this.reporteVentasTranslate.todos, id: 'all', s: 'text-align:center', c: 'glyphicon glyphicon-ok', t: 'com' });
                }
                break;
            case 2:
                this.dataFiltro.select = [];
                this.dataFiltro.select = JSON.parse(JSON.stringify(this.servicio.dataFiltro));
                if (this.dataFiltro.select.length == 0) {
                    this.reporte.tablaServicio.unshift({ nombre: "  " + this.reporteVentasTranslate.quitar, id: 'dropAll', s: 'text-align:center', c: 'glyphicon glyphicon-remove', t: 'com' });
                    this.dataFiltro.select = getId(this.reporte.tablaServicio);
                } else {
                    this.reporte.tablaServicio.unshift({ nombre: "  " + this.reporteVentasTranslate.todos, id: 'all', s: 'text-align:center', c: 'glyphicon glyphicon-ok', t: 'com' });
                }
                break;
            case 3:
                this.dataFiltro.select = [];
                this.dataFiltro.select = JSON.parse(JSON.stringify(this.metodoPago.dataFiltro));
                if (this.dataFiltro.select.length == 0) {
                    this.reporte.tablaPago.unshift({ nombre: "  " + this.reporteVentasTranslate.quitar, id: 'dropAll', s: 'text-align:center', c: 'glyphicon glyphicon-remove', t: 'com' });
                    this.dataFiltro.select = getId(this.reporte.tablaPago);
                } else {
                    this.reporte.tablaPago.unshift({ nombre: "  " + this.reporteVentasTranslate.todos, id: 'all', s: 'text-align:center', c: 'glyphicon glyphicon-ok', t: 'com' });
                }
                break;
            case 4:
                this.dataFiltro.select = [];
                this.dataFiltro.select = JSON.parse(JSON.stringify(this.clientes.dataFiltro));
                if (this.dataFiltro.select.length == 0) {
                    this.reporte.tablaClientes.unshift({ nombre: "  " + this.reporteVentasTranslate.quitar, id: 'dropAll', s: 'text-align:center', c: 'glyphicon glyphicon-remove', t: 'com' });
                    this.dataFiltro.select = getId(this.reporte.tablaClientes);
                } else {
                    this.reporte.tablaClientes.unshift({ nombre: "  " + this.reporteVentasTranslate.todos, id: 'all', s: 'text-align:center', c: 'glyphicon glyphicon-ok', t: 'com' });
                }
                break;
        };
        function getId(input: any) {
            var data = [];
            for (var i = 0; i < input.length; i++) {
                if (input[i].id != 'all' && input[i].id != 'dropAll')
                    data.push(input[i].id);
            }
            return data;
        }

        this.alMostrarModalFiltrar();
    };

    //Función que crea la gráfica de lineas
    graficaLineas(name: any, cat: any, data: any) { // Gráficas del PopOver
        if (cat != undefined) {
            try {
                if (this.graficaActiva && this.tabActive == 4) {
                    var ebi_mensaje: any = document.getElementById('mensaje' + this.tabActive);
                    ebi_mensaje.style.marginTop = '109px';
                }
            } catch (Exception) {

            }

            this.mostrarGraph = true;
            this.graficaActiva = true;
            if(name == "gSucursal"){
                const ebi_gSucursal: any = document.getElementById('gSucursal') as HTMLCanvasElement;

                if (this.myChartSucursal) {
                    this.myChartSucursal.destroy();
                }
                
                this.myChartSucursal = new Chart(ebi_gSucursal, {
                    type: 'line',
                    data: {
                        labels: cat, // Nombre de las barras
                        datasets: [
                          {
                            label: 'Dataset',
                            data: data, // Valores de las barras
                            pointStyle: 'circle',
                            pointRadius: 2,
                            pointHoverRadius: 6,
                            borderColor: this.colores[0],
                            backgroundColor: this.colores[16],
                          }
                        ]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            title: { // Titulo del Gráfico
                                text: "",
                                display: false
                            },
                            legend: {
                                display: false
                            },
                        },
                    }
                });
            }else{
                const ebi_gGeneralLineas: any = document.getElementById(name) as HTMLCanvasElement;

                if (this.myChartGeneralLineas) {
                    this.myChartGeneralLineas.destroy();
                }
                
                this.myChartGeneralLineas = new Chart(ebi_gGeneralLineas, {
                    type: 'line',
                    data: {
                        labels: cat, // Nombre de las barras
                        datasets: [
                          {
                            label: 'Dataset',
                            data: data, // Valores de las barras
                          }
                        ]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            title: { // Titulo del Gráfico
                                text: "",
                                display: false
                            },
                            legend: {
                                display: false
                            },
                        },
                    }
                });
            }
            // $('#' + name).highcharts({
            //     chart: {
            //         backgroundColor: 'rgba(255, 255, 255, 0)'
            //     },
            //     title: {
            //         text: ''
            //     },
            //     credits: {
            //         enabled: false
            //     },
            //     xAxis: {
            //         categories: cat
            //     },
            //     yAxis: {
            //         gridLineWidth: 1,
            //         gridLineColor: '#696767',
            //         labels: {
            //             formatter: function () {
            //                 return '$' + this.value;
            //             }
            //         },
            //         title: {
            //             text: this.reporteVentasTranslate.ventas
            //         },
            //         plotLines: [{
            //             value: 0,
            //             width: 1,
            //             color: '#808080'
            //         }]
            //     },
            //     legend: {
            //         enabled: false
            //     },
            //     series: [{
            //         name: "$",
            //         data: data
            //     }],
            //     exporting: {
            //         buttons: {
            //             contextButton: {
            //                 symbolStroke: "#666666",
            //                 theme: {
            //                     fill: "rgba(255,255,255,0)"
            //                 },
            //                 menuItems: [{
            //                     textKey: 'printChart',
            //                     text: this.reporteVentasTranslate.imprimirGrafica'),
            //                     onclick: function () {
            //                         this.print();
            //                     }
            //                 }, {
            //                     separator: true
            //                 }, {
            //                     textKey: 'downloadPNG',
            //                     text: this.reporteVentasTranslate.descargarPNG'),
            //                     onclick: function () {
            //                         this.exportChart();
            //                     }
            //                 }, {
            //                     textKey: 'downloadJPEG',
            //                     text: this.reporteVentasTranslate.descargarJPG'),
            //                     onclick: function () {
            //                         this.exportChart({
            //                             type: 'image/jpeg'
            //                         });
            //                     }
            //                 }, {
            //                     textKey: 'downloadPDF',
            //                     text: this.reporteVentasTranslate.descargarPDF'),
            //                     onclick: function () {
            //                         this.exportChart({
            //                             type: 'application/pdf'
            //                         });
            //                     }
            //                 }]
            //             }
            //         }
            //     }
            // });
        } else {
            this.graficaActiva = false;
        }
    };

    //Función que crea la gráfica de pastel
    graficaPastel(name: any, data: any) {
        const ebi_name: any = document.getElementById(name) as HTMLCanvasElement;
        
        if (this.myChartPastel) {
            this.myChartPastel.destroy();
        }
        
        this.myChartPastel = new Chart(ebi_name, {
            type: 'pie',
            data: {
                labels: data.name, // Nombre de los labels
                datasets: [{
                    data: data.y, // Valores de las barras
                    borderWidth: 1,
                }]
            },
            options: {
                plugins: {
                    title: { // Titulo del Gráfico
                        text: "",
                        display: false
                    },
                    legend: {
                        position: 'bottom',
                    },
                },
            },
        });

        // $('#' + name).highcharts({
        //     chart: {
        //         plotBackgroundColor: null,
        //         plotBorderWidth: null,
        //         plotShadow: false,
        //         type: 'pie',
        //         options3d: {
        //             enabled: true,
        //             alpha: 45,
        //             beta: 0
        //         }
        //     },
        //     title: {
        //         text: ''
        //     },
        //     credits: {
        //         enabled: false
        //     },
        //     tooltip: {
        //         headerFormat: '<span style="font-size:10px"></span><table>',
        //         pointFormat: '<tr><td style="color:{point.color};padding:0;text-align:center;"><b>{point.name} {point.percentage:.1f}%</b></td></tr>' +
        //             '<tr><td style="padding:0">Total: ${point.y}</td></tr>',
        //         footerFormat: '</table>',
        //         useHTML: true
        //     },
        //     legend: {
        //         enabled: false
        //     },
        //     plotOptions: {
        //         pie: {
        //             allowPointSelect: true,
        //             slicedOffset: false,
        //             cursor: 'pointer',
        //             depth: 35,

        //             dataLabels: {
        //                 enabled: true,
        //                 format: '<b>{point.name}</b>: ${point.y}',
        //                 style: {
        //                     color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
        //                 }
        //             },
        //             showInLegend: true
        //         }
        //     },
        //     series: [{
        //         name: this.reporteVentasTranslate.ventas'),
        //         colorByPoint: true,
        //         data: data
        //     }],
        //     exporting: {
        //         buttons: {
        //             contextButton: {
        //                 symbolStroke: "#666666",
        //                 theme: {
        //                     fill: "rgba(255,255,255,0)"
        //                 },
        //                 menuItems: [{
        //                     textKey: 'printChart',
        //                     text: this.reporteVentasTranslate.imprimirGrafica'),
        //                     onclick: function () {
        //                         this.print();
        //                     }
        //                 }, {
        //                     separator: true
        //                 }, {
        //                     textKey: 'downloadPNG',
        //                     text: this.reporteVentasTranslate.descargarPNG'),
        //                     onclick: function () {
        //                         this.exportChart();
        //                     }
        //                 }, {
        //                     textKey: 'downloadJPEG',
        //                     text: this.reporteVentasTranslate.descargarJPG'),
        //                     onclick: function () {
        //                         this.exportChart({
        //                             type: 'image/jpeg'
        //                         });
        //                     }
        //                 }, {
        //                     textKey: 'downloadPDF',
        //                     text: this.reporteVentasTranslate.descargarPDF'),
        //                     onclick: function () {
        //                         this.exportChart({
        //                             type: 'application/pdf'
        //                         });
        //                     }
        //                 }]
        //             }
        //         }
        //     }
        // });
    };

    //Función que cierra el Popover
    cerrarPopover() {
        this.eventInfo = false;
    };

    //Función que genera la gráfica para cada Popover
    mostrarDetalle(id: any, total: any, index: any) {
        var t = total;
        var params: any = {};
        params.tipo = this.tabActive+1;
        params.idFiltro = id;

        if (params.idFiltro == null) {
            params.idFiltro = 0;
        }
    
        params.fechaInicio = this.reporte.fechaInicio.split("/").reverse().join("-");
        params.fechaFin = this.reporte.fechaFin.split("/").reverse().join("-");

        this._backService.HttpPost("consultas/reporteVentas/consultarDetalle", {}, params).subscribe((response: string) => {
            var dataTemp = eval(response);
            
            if (dataTemp.length != 0) {
                if (id != null) {
                    var categorias = [];
                    var data = [];
                    for (var i = 0 ; i < dataTemp.length; i++) {
                        categorias.push(dataTemp[i].categoria);
                        data.push(dataTemp[i].dato);
                    }

                    switch (this.tabActive){
                        case 0:
                            this.graficaLineas('gPopoverSc' + index, categorias, data);
                            break
                        case 1:
                            this.graficaLineas('gPopoverPs' + index, categorias, data);
                            break
                        case 2:
                            this.graficaLineas('gPopoverSv' + index, categorias, data);
                            break
                        case 3:
                            this.graficaLineas('gPopoverMd' + index, categorias, data);
                            break
                        case 4:
                            this.graficaLineas('gPopoverCl' + index, categorias, data);
                            break
                    }
                }
                else {
                    var data = [];
                    for (var i = 0; i < dataTemp.length; i++) {
                        var obj: any = {};
                        obj.name = dataTemp[i].descripcion;
                        if (obj.name == null) {
                            obj.name = this.reporteProductividadTranslate.otros;
                        }
                        var cantidadT = dataTemp[i].pago;
                        obj.y = cantidadT;
                        obj.cantidad = (cantidadT / (this.servicio.dataServicio[this.servicio.dataServicio.length - 1].pago)) * 100;
                        data.push(obj);
                    }
                    this.graficaPastel('gPopoverMd' + index, data);
                }
            } else {
                this.graficaLineas('gPopover' + this.tabActive, undefined, undefined);
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

        this.eventInfo = true;
    };

    buscarDivInit(op: any) {
        if (this.carga) {
            try {
                switch (op) {
                    case 0:
                        this.cargarSucursal(this.reporte.fechaInicio, this.reporte.fechaFin, undefined);
                        break;
                    case 1:
                        this.cargarPersonal(this.reporte.fechaInicio, this.reporte.fechaFin, undefined);
                        break;
                    case 2:
                        this.cargarServicio(this.reporte.fechaInicio, this.reporte.fechaFin, undefined);
                        break;
                    case 3:
                        this.cargarMetodoPago(this.reporte.fechaInicio, this.reporte.fechaFin, undefined);
                        break;
                    case 4:
                        this.cargarClientes(this.reporte.fechaInicio, this.reporte.fechaFin, undefined);
                        break;
                }
            } catch (Exception) { }
        }
    };

    onlyUnique(value: any, index: any, self: any) {
        return self.indexOf(value) === index;
    };

    alMostrarModalFiltrar() {
        switch (this.tabActive) {
            case 0:
                setTimeout(() => {
                    $('#ddlSucursal').click();
                }, 200);
                break;
            case 1:
                setTimeout(() => {
                    $('#ddlPersonal').click();
                }, 200);
                break;
            case 2:
                setTimeout(() => {
                    $('#ddlServicios').click();
                }, 200);
                break;
            case 3:
                setTimeout(() => {
                    $('#ddlPago').click();
                }, 200);
                break;
            case 4:
                setTimeout(() => {
                    $('#ddlClientes').click();
                }, 200);
                break;
        }
    };

    // this.$watch('dataFiltro.select', function (newValue, oldValue) { DUDA
    //     if (this.dataFiltro.select[this.dataFiltro.select.length - 1] == 'all') {
    //         switch (this.tabActive) {
    //             case 1:
    //                 setData(this.reporte.tablaSucursal, 'dropAll');
    //                 break;
    //             case 2:
    //                 setData(this.reporte.tablaPersonal, 'dropAll');
    //                 break;
    //             case 3:
    //                 setData(this.reporte.tablaServicio, 'dropAll');
    //                 break;
    //             case 4:
    //                 setData(this.reporte.tablaPago, 'dropAll');
    //                 break;
    //             case 5:
    //                 setData(this.reporte.tablaClientes, 'dropAll');
    //                 break;
    //         };
    //     } else {
    //         if (oldValue.length == 0 && newValue.length > 0) {
    //             switch (this.tabActive) {
    //                 case 1:
    //                     this.reporte.tablaSucursal.splice(0, 1);
    //                     this.reporte.tablaSucursal.unshift({ nombre: "  " + this.reporteVentasTranslate.quitar'), id: 'dropAll', s: 'text-align:center', c: 'glyphicon glyphicon-remove', t: 'com' });
    //                     break;
    //                 case 2:
    //                     this.reporte.tablaPersonal.splice(0, 1);
    //                     this.reporte.tablaPersonal.unshift({ nombre: "  " + this.reporteVentasTranslate.quitar'), id: 'dropAll', s: 'text-align:center', c: 'glyphicon glyphicon-remove', t: 'com' });
    //                     break;
    //                 case 3:
    //                     this.reporte.tablaServicio.splice(0, 1);
    //                     this.reporte.tablaServicio.unshift({ nombre: "  " + this.reporteVentasTranslate.quitar'), id: 'dropAll', s: 'text-align:center', c: 'glyphicon glyphicon-remove', t: 'com' });
    //                     break;
    //                 case 4:
    //                     this.reporte.tablaPago.splice(0, 1);
    //                     this.reporte.tablaPago.unshift({ nombre: "  " + this.reporteVentasTranslate.quitar'), id: 'dropAll', s: 'text-align:center', c: 'glyphicon glyphicon-remove', t: 'com' });
    //                     break;
    //                 case 5:
    //                     this.reporte.tablaClientes.splice(0, 1);
    //                     this.reporte.tablaClientes.unshift({ nombre: "  " + this.reporteVentasTranslate.quitar'), id: 'dropAll', s: 'text-align:center', c: 'glyphicon glyphicon-remove', t: 'com' });
    //                     break;
    //             }
    //         }
    //         if (oldValue.length == 1 && newValue.length == 0) {
    //             switch (this.tabActive) {
    //                 case 1:
    //                     setData(this.reporte.tablaSucursal, 'all');
    //                     break;
    //                 case 2:
    //                     setData(this.reporte.tablaPersonal, 'all');
    //                     break;
    //                 case 3:
    //                     setData(this.reporte.tablaServicio, 'all');
    //                     break;
    //                 case 4:
    //                     setData(this.reporte.tablaPago, 'all');
    //                     break;
    //                 case 5:
    //                     setData(this.reporte.tablaClientes, 'all');
    //                     break;
    //             }
    //         }
    //     }
    //     if (this.dataFiltro.select[this.dataFiltro.select.length - 1] == 'dropAll') {
    //         switch (this.tabActive) {
    //             case 1:
    //                 setData(this.reporte.tablaSucursal, 'all');
    //                 break;
    //             case 2:
    //                 setData(this.reporte.tablaPersonal, 'all');
    //                 break;
    //             case 3:
    //                 setData(this.reporte.tablaServicio, 'all');
    //                 break;
    //             case 4:
    //                 setData(this.reporte.tablaPago, 'all');
    //                 break;
    //             case 5:
    //                 setData(this.reporte.tablaClientes, 'all');
    //                 break;
    //         };
    //     }
    //     function setData(input, tipo) {
    //         if (tipo == 'all') {
    //             this.dataFiltro.select = [];
    //             if (input[0].id == 'all' || input[0].id == 'dropAll') {
    //                 //if (input.length > 1) {
    //                 input.splice(0, 1);
    //                 input.unshift({ nombre: "  " + this.reporteVentasTranslate.todos'), id: 'all', s: 'text-align:center', c: 'glyphicon glyphicon-ok', t: 'com' });
    //                 // }
    //             }
    //         } else {
    //             this.dataFiltro.select = idSelected(input);
    //             if (input[0].id == 'all' || input[0].id == 'dropAll') {
    //                 //if (input.length > 1) {
    //                 input.splice(0, 1);
    //                 input.unshift({ nombre: "  " + this.reporteVentasTranslate.quitar'), id: 'dropAll', s: 'text-align:center', c: 'glyphicon glyphicon-remove', t: 'com' });
    //                 //}
    //             }
    //         }
    //     };
    //     function idSelected(input) {
    //         var data = [];
    //         for (var i = 0; i < input.length; i++) {
    //             if (input[i].id != "all") {
    //                 data.push(input[i].id);
    //             }
    //         };
    //         return data;
    //     };
    // });

    resetColorCampoModal() {
        switch (this.tabActive) {
            case 0:
                $('#ddlSucursal> div:first-child').attr("style", "outline: none");
                this.drop(this.reporte.tablaSucursal);
                break;
            case 1:
                $('#ddlPersonal> div:first-child').attr("style", "outline: none");
                this.drop(this.reporte.tablaPersonal);
                break;
            case 2:
                $('#ddlServicios> div:first-child').attr("style", "outline: none");
                this.drop(this.reporte.tablaServicio);
                break;
            case 3:
                $('#ddlPago> div:first-child').attr("style", "outline: none");
                this.drop(this.reporte.tablaPago);
                break;
            case 4:
                $('#ddlClientes> div:first-child').attr("style", "outline: none");
                this.drop(this.reporte.tablaClientes);
                break;
        };
    };

    drop(input: any) {
        if (input[0].id == 'all' || input[0].id == 'dropAll') {
            input.splice(0, 1)
        }
        this.dataFiltro.select = [];
    };

    // Funcion para validar que la entrada solo sean números
    validarNum(e: any) {
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

    isInvalidDate = (m: moment.Moment) =>  {
        return this.invalidDates.some(d => d.isSame(m, 'day') )
    }

    irAAgenda(){
        this._router.navigate(['/procesos/agenda']);
    }

    descargarGraficoSc(opcion: any) {
        var image = this.myChartSucursal.toBase64Image();
        var a = document.createElement('a');
        a.href = this.myChartSucursal.toBase64Image();

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

    descargarGraficoPs(opcion: any) {
        var image = this.myChartPersonal.toBase64Image();
        var a = document.createElement('a');
        a.href = this.myChartPersonal.toBase64Image();

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

    descargarGraficoSv(opcion: any) {
        var image = this.myChartServicio.toBase64Image();
        var a = document.createElement('a');
        a.href = this.myChartServicio.toBase64Image();

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

    descargarGraficoMp(opcion: any) {
        var image = this.myChartMetodoP.toBase64Image();
        var a = document.createElement('a');
        a.href = this.myChartMetodoP.toBase64Image();
        
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

    descargarGraficoCl(opcion: any) {
        var image = this.myChartClientes.toBase64Image();
        var a = document.createElement('a');
        a.href = this.myChartClientes.toBase64Image();
        
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
}