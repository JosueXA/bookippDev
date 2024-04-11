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
import { format } from 'date-fns';
import { saveAs } from 'file-saver';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatIconRegistry } from '@angular/material/icon'; // ICONS
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'app-excepciones-personal',
    templateUrl: './excepciones-personal.component.html',
    styleUrls: ['./excepciones-personal.component.scss', '../../page.component.scss'],
})

export class Excepciones_PersonalComponent implements OnInit {
    // Variables de Translate
    consultaExcepcionesTranslate: any = {};
    calendarioTranslate: any = {};
    promocionTranslate: any = {};
    sessionTraslate: any = {};

    // Modales
    modales: any = {}; 

    constructor(private _translate: TranslateService, private _backService: MethodsService, public _pantallaServicio: PantallaService, private _dialog: MatDialog, private _router: Router, private _toaster: ToasterService, private matIconRegistry: MatIconRegistry, private domSanitizer: DomSanitizer) {
        this._translate.setDefaultLang(this._pantallaServicio.idioma);
        this._translate.use(this._pantallaServicio.idioma);

        this._translate.get('calendarioTranslate').subscribe((translated: string) => {  
            this.calendarioTranslate = this._translate.instant('calendarioTranslate');
            this.consultaExcepcionesTranslate = this._translate.instant('consultaExcepcionesTranslate');
            this.promocionTranslate = this._translate.instant('promocionTranslate');
            this.sessionTraslate = this._translate.instant('sessionTraslate');

            this.personalexcepciones_inicializarCalendario();
        });

        this.matIconRegistry.addSvgIcon('iconAgregar', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Agregar-1-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconFlecha1DerechaPeque', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/FlechaDerechaPequena-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconCasa1', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Casa1-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconCalendarioEditar', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/CalendarioEditar-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconFlechaAbajoPeque', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/FlechaAbajoPequena-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconCruz', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Cruz-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconInfoCirculo', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/InfoCirculo-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconBasura', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Basura-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconEditar1', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Editar-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconBuscar', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Buscar-icon.svg"));
    }

    ngOnInit(): void {
        this._pantallaServicio.mostrarSpinner();
        this.crearModales();
        // setTimeout(() => {
        //     this.personalexcepciones_inicializarCalendario();
        // },300);
        setTimeout(() => {
            this.consultarExcepciones();
            this.inicializarComisiones();
            this.cargarServicios();
            this.cargarProductos();
            this.cargarPaquetes();
            this.cargarTipoComision();
            this.cargarListadoCategorias();
        }, 310);
    }

    crearModales() {
        if ($('body').find('.modal-alert').length > 1) {
            $('body').find('.modal-alert')[1].remove();
        }
        this.modales.modalAlert = new bootstrap.Modal($("#modal-alert").appendTo("body"), {
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

        if ($('body').find('.modal-alertError').length > 1) {
            $('body').find('.modal-alertError')[1].remove();
        }
        this.modales.modalAlertError = new bootstrap.Modal($("#modal-alertError").appendTo("body"), {
            backdrop: "static", 
            keyboard: false,
        });
    }

    // ------------------------------------------------------------------------------------------- //
    // --------------------------------------- EXCEPCIONES PERSONAL ------------------------------ //
    // ------------------------------------------------------------------------------------------- //

    // -------------------------------------- Declaración de variables --------------------------- //
    displayedColumns: string[] = ["idExcepcion", "nombres", "descripcion", "fechaInicio", "fechaFin"];
    dataSource = new MatTableDataSource<any>([]);
    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;
    rootScope_fromState = "";
    dateRange: any;
    dataExcepcion = [];
    excepcionSelec: any = "";
    PersonalExcepcionesBusqueda = ""; //Función de Busqueda de Personal en Seccion en Excepciones 		        
    msgConsultaExitosa = "";
    screenGridStyle = 'none';
    consultaExitosa = false;
    eventInfo: any = false;
    altura: any;
    dataSelect: any;
    //Funciones para el Calendario en Personal-Seccion-Excepciones
    personalexcepciones: any = {
        fechaFinFil: moment().format('DD/MM/YYYY'),
        fechaInicioFil: moment().format('DD/MM/YYYY'), //Para que aparezca el Grid con el dia actual.('DD/MM/YYYY') 
        fechaInicio: moment().format('DD/MM/YYYY'), //Para que aparezca el Grid con el dia actual .('DD/MM/YYYY')
        fechaFin: moment().format('DD/MM/YYYY'),
        fechas: {
            startDate: moment(new Date()).startOf('month').format('DD/MM/YYYY'), 
            endDate: moment(new Date()).endOf('month').format('DD/MM/YYYY')
        }
    };
    f1: any;
    f2: any;
    fechaInicio: any;
    fechaFin: any;
    fechaInicioFil: any;
    fechaFinFil: any;

    fechaInicial: any = this.personalexcepciones.fechaInicioFil + " - " + this.personalexcepciones.fechaFinFil;
    //fechasAux: any = this.personalexcepciones.fechas.split(" - ");
    
    noPin = " <div style=\"margin: 5px auto\" class=\"ngHeaderText\">{{col.displayName}}</div>\r" +
            "\n" +
            " <div ng-class=\"{ ngPinnedIcon: col.pinned, ngUnPinnedIcon: !col.pinned }\"  ng-show=\"col.pinnable\"></div>\r" +
            "\n";

    comisiones: any = {
        colores: [
            "#5A5A5A",
            "#0A2A38",
            "#58b578",
            "#357EC1",
            "#B32032",
            "#054353",
            "#FCDD1A",
            "#24557D",
            "#4B296B",
            "#99244A",
            "#EC6351",
            "#377D7B",
        ],
        claseColor: [
            "color0",
            "color1",
            "color2",
            "color3",
            "color4",
            "color5",
            "color6",
            "color7",
            "color8",
            "color9",
            "color10",
            "color11"
        ],
    };
    camposValidos: any = false;
    dataServPaquete: any;
    dataProdServ: any;
    dataPaqCat: any;
    dataCategorias: any;
    dataCategoriasOr: any;
    respuesta: any;
    dataCategorias2: any;
    inputBusquedaPaquete: any;
    startDate: any;
    endDate: any;
    ranges: any;
    locale: any = {
        format: 'DD/MM/YYYY'
    }
    daterangeOptions: any;
    banderaChckServicios: any;
    banderaChckProductos: any;
    banderaChckPaquetes: any;
    alwaysShowCalendars: boolean;
    invalidDates: moment.Moment[] = [moment().add(2, 'days'), moment().add(3, 'days'), moment().add(5, 'days')]; 
    habilitarBtnNuevaCategoria = false;


    // ----------------------------------- Declaracion de funciones ----------------------------------- //
	//Funcion de Calendario Personal en Seccion en Excepciones
    personalexcepciones_inicializarCalendario() {
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
        var fechaInicial = this.personalexcepciones.fechaInicio + " - " + this.personalexcepciones.fechaFin;
        // Se pone la fecha del día actual
        this.personalexcepciones.fechas = {startDate: null, endDate: null}
        this.personalexcepciones.fechas.startDate = this.personalexcepciones.fechaInicio;
        this.personalexcepciones.fechas.endDate = this.personalexcepciones.fechaFin;

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
    };

    alertError(message: any) {
        $("#modal-alertError .modal-body").html('<span class="title">' + message + '</span>');
        this.modales.modalAlertError.show();
    }

    personalexcepciones_cambioFecha(e: any){
        this._pantallaServicio.mostrarSpinner();

        var fechaBusquedaSplit = [this.personalexcepciones.fechas.startDate, this.personalexcepciones.fechas.endDate];
        this.fechaInicio = (moment(JSON.parse(JSON.stringify(fechaBusquedaSplit[0])), 'DD/MM/YYYY')).startOf("day").format('YYYY-MM-DD HH:mm:ss');
        this.fechaFin = (moment(JSON.parse(JSON.stringify(fechaBusquedaSplit[1])), 'DD/MM/YYYY')).endOf("day").format('YYYY-MM-DD HH:mm:ss');

        if(this.fechaInicio == "Invalid date" || this.fechaFin == "Invalid date"){
            this.fechaInicio = moment(new Date( this.personalexcepciones.fechas.startDate['$y'], this.personalexcepciones.fechas.startDate['$M'],this.personalexcepciones.fechas.startDate['$D'] )).startOf("day").format('YYYY-MM-DD HH:mm:ss');
            this.fechaFin = moment(new Date( this.personalexcepciones.fechas.endDate['$y'], this.personalexcepciones.fechas.endDate['$M'], this.personalexcepciones.fechas.endDate['$D'] )).endOf("day").format('YYYY-MM-DD HH:mm:ss');
        }
        
        this.personalexcepciones.fechaInicioFil = this.fechaInicio;
        this.personalexcepciones.fechaFinFil = this.fechaFin;

        this.buscar();
    }

    buscar() {
        var valido = true;
        var fechaLimiteInferiro = new Date(99, 1, 1);
        if (this.personalexcepciones.fechaInicio < fechaLimiteInferiro) {
            $("#fechaInicio").addClass("errorCampo");
            valido = false;
        }
        if (this.personalexcepciones.fechaFin < fechaLimiteInferiro) {
            $("#fechaFin").addClass("errorCampo");
            valido = false;
        }
        if (this.personalexcepciones.fechaInicio == "" || this.personalexcepciones.fechaInicio == undefined) {
            $("#fechaInicio").addClass("errorCampo");
            this.personalexcepciones.errorFecha = "";
            valido = false;
        }
        else {
            $("#fechaInicio").removeClass("errorCampo");
            this.personalexcepciones.errorFecha = "";
        }
        if (this.personalexcepciones.fechaFin == "" || this.personalexcepciones.fechaFin == undefined) {
            $("#fechaFin").addClass("errorCampo");
            this.personalexcepciones.errorFecha = "";
            valido = false;
        } else {
            if (this.personalexcepciones.fechaFin < this.personalexcepciones.fechaInicio) {
                $("#fechaFin").addClass("errorCampo");
                this.personalexcepciones.errorFecha = this.promocionTranslate.mensaje10;
                valido = false;
            } else {
                $("#fechaFin").removeClass("errorCampo");
                this.personalexcepciones.errorFecha = "";
            }
        }
        if (valido) {
            this.consultarExcepciones(); 
        }
    }; 

    //Función que carga los datos del grid
    consultarExcepciones () {
        var params: any = {};
        params.fechaInicio = this.personalexcepciones.fechaInicioFil;
        params.fechaFin = this.personalexcepciones.fechaFinFil;
        this._backService.HttpPost("catalogos/excepciones/consultarExcepciones", {}, params).subscribe((response: string) => {
            let listaExcepciones = eval(response);
            this.dataSource.data = listaExcepciones;
            this.dataSource.paginator = this.paginator;
		    this.dataSource.sort = this.sort;

            this.altura = this.dataExcepcion.length * 30 + 57;
            this.dataSelect = JSON.parse(JSON.stringify(this.dataExcepcion));
            this.screenGridStyle = 'block';
            this.consultaExitosa = true;
            this.msgConsultaExitosa = "";

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

    crearNuevaExcepcion() {
        this._router.navigate(
            ['/catalogos/excepcionesPersonal-creacion-edicion'],
            {
                queryParams: { idExcepcionTipo: 'N' },
                skipLocationChange: false, replaceUrl: true
            }
        );
    }

    editarExcepcion(excepcion: any) {
        var fechaInicioAux = excepcion.fechaInicio;
        var fechaFinAux = excepcion.fechaFin;
        this._router.navigate(
            ['/catalogos/excepcionesPersonal-creacion-edicion'],
            {
                queryParams: { 
                    idExcepcionTipo: excepcion.idExcepcion,
                    fechaInicio: fechaInicioAux,
                    fechaFin: fechaFinAux
                },
                skipLocationChange: false, replaceUrl: true
            }
        );
    }

    //Función que borra un registro del grid
    borrarExcepcion() {
        this.modales.modalConfirm.hide();
        var params: any = {};
        params.idExcepcion = this.excepcionSelec.idExcepcion;

        this._backService.HttpPost("catalogos/excepciones/borrarExcepciones", {}, params).subscribe((response: string) => { 
                this.consultarExcepciones();
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

    //Función que muestra  un modal 
    modalBorrar(row: any) {
        this.excepcionSelec = row;
        this.modales.modalConfirm.show();
        $("#modal-confirm .modal-body").html('<span class="title">' + this.consultaExcepcionesTranslate.deseaBorrar + '</span>');
    };

    //Función que muestra  un modal
    mostrarModal(message: any) {
        this.modales.modalAlert.show();
        $("#modal-alert .modal-body").html('<span class="title">' + message + '</span>');
    };

    cerrarPopover() {
        this.eventInfo = false;
    }

    mostrarDetalle() {
        this.eventInfo = true;
    }

    //------------------Comisiones------------------////
    inicializarComisiones() {
        this.comisiones.nombre = "";
        this.comisiones.productos = []; //Contiene el id de los productos
        this.comisiones.servicios = []; //Contiene el id de los servicios
        this.comisiones.paquetes = []; //contiene el id de los paquetes
        this.comisiones.idCategoria = 0;
        this.comisiones.tipoComision = 0;

        this.dataServPaquete = [];
        this.dataProdServ = [];
        this.dataPaqCat = [];

        this.comisiones.factor = 0;
        this.banderaChckServicios = false;
        this.banderaChckProductos = false;
        this.banderaChckPaquetes = false;
        this.habilitarBtnNuevaCategoria = false;
        $("#txtDescripcion").removeClass("errorCampo");
        $("#ddlProductos").removeClass("errorCampo");
        $("#ddlServicio").removeClass("errorCampo");
        $("#ddlPaquetes").removeClass("errorCampo");
        $("#ddlTipoComision").removeClass("errorCampo");
        $("#txtFactor").removeClass("errorCampo");
    }

    cargarServicios() {
        var params: any = {};
        params.sucursal = null;
        this._backService.HttpPost("catalogos/servicio/consultarServicio", {}, params).subscribe((response: string) => { 
            this.comisiones.dataServicios = eval(response);
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

    cargarProductos() {
        this._backService.HttpPost("catalogos/excepciones/consultarProductos", {}, {}).subscribe((response: string) => { 
            this.comisiones.dataProductos = eval(response);
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

    cargarPaquetes() {
        this._backService.HttpPost("catalogos/excepciones/consultarPaquetes", {}, {}).subscribe((response: string) => { 
            this.comisiones.dataPaquetes = eval(response);
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

    cargarTipoComision() {
        this._backService.HttpPost("catalogos/excepciones/obtenerTipoComision", {}, {}).subscribe((response: string) => { 
            this.comisiones.dataTipoComision = eval(response);
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

    cargarListadoCategorias() {
        this._backService.HttpPost("catalogos/excepciones/cargarListadoCategorias", {}, {}).subscribe((response: string) => { 
            this.dataCategorias = eval(response);
            //Asigna el color a cada categoria
            var j = 0;
            for (var i = 0; i < this.dataCategorias.length; i++) {
                this.dataCategorias[i].nombre = (this.dataCategorias[i].nombre).replace(/&lt;/g, "<");
                if (j < this.comisiones.claseColor.length) {
                    this.dataCategorias[i].claseColor = this.comisiones.claseColor[j];
                    j++;
                } else {
                    j = 0;
                    this.dataCategorias[i].claseColor = this.comisiones.claseColor[j];
                    j++;
                }
            }
            this.dataCategoriasOr = JSON.parse(JSON.stringify(this.dataCategorias));
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

    irAAgenda(){
        this._router.navigate(['/procesos/agenda']);
    }

    editarCategoria(idCategoria: any) {
        this._pantallaServicio.mostrarSpinner();
        this.inicializarComisiones();
        this.habilitarBtnNuevaCategoria = true;
        this.comisiones.idCategoria = idCategoria;
        var params: any = {};
        params.idComisionCategoria = idCategoria;
        this._backService.HttpPost("catalogos/excepciones/cargarServCategoria", {}, params).subscribe((response: string) => { 
            this.dataServPaquete = eval(response);

            var dsAux = [];
            for (var i = 0; i < this.dataServPaquete.length; i++) {
                if (this.dataServPaquete[i].idServicio != null) {
                    dsAux.push(this.dataServPaquete[i].idServicio);
                }
                else {
                    if (this.dataServPaquete[i].idServicio == null) {
                        this.banderaChckServicios = true;
                    }
                }
            }
            this.comisiones.servicios = dsAux;

            if (this.dataServPaquete.length > 0) {
                this.comisiones.tipoComision = this.dataServPaquete[0].idTipoComision;
                this.comisiones.factor = this.dataServPaquete[0].valor;
            }

            this._backService.HttpPost("catalogos/excepciones/cargarProdCategoria", {}, params).subscribe((response: string) => { 
                this.dataProdServ = eval(response);

                var dPrAux = [];
                for (var i = 0; i < this.dataProdServ.length; i++) {
                    if (this.dataProdServ[i].idInventarioPresentacion != null) {
                        dPrAux.push(this.dataProdServ[i].idInventarioPresentacion);
                    }
                    else {
                        if (this.dataProdServ[i].idInventarioPresentacion == null) {
                            this.banderaChckProductos = true;
                        }
                    }
                }
                this.comisiones.productos = dPrAux;

                if (this.dataProdServ.length > 0) {
                    this.comisiones.tipoComision = this.dataProdServ[0].idTipoComision;
                    this.comisiones.factor = this.dataProdServ[0].valor;
                }

                this._backService.HttpPost("catalogos/excepciones/cargarPaqCategoria", {}, params).subscribe((response: string) => { 
                    this.dataPaqCat = eval(response);

                    var dPaAux = [];
                    for (var i = 0; i < this.dataPaqCat.length; i++) {
                        if (this.dataPaqCat[i].idPaqueteSucursal != null) {
                            dPaAux.push(this.dataPaqCat[i].idPaqueteSucursal);
                        }
                        else {
                            if (this.dataPaqCat[i].idPaqueteSucursal == null) {
                                this.banderaChckPaquetes = true;
                            }
                        }
                    }
                    this.comisiones.paquetes = dPaAux;

                    if (this.dataPaqCat.length > 0) {
                        this.comisiones.tipoComision = this.dataPaqCat[0].idComisionTipo;
                        this.comisiones.factor = this.dataPaqCat[0].valor;
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

        for (var i = 0; i < this.dataCategorias.length; i++) {
            if (this.dataCategorias[i].idComisionCategoria == idCategoria) {
                this.comisiones.nombre = this.dataCategorias[i].nombre;
            }
        }

        this._pantallaServicio.ocultarSpinner();
    }

    guardarCategoria() {
        this._pantallaServicio.mostrarSpinner();
        $('#btnGuardarCat').addClass('disabled');
        var params: any = {};
        //Validaciones
        this.validarCampos();
        if (this.camposValidos) {
            if (this.comisiones.idCategoria != 0) {
                this.inputBusquedaPaquete = "";
                this.actualizarCategoria();
            } else {
                this.inputBusquedaPaquete = "";
                params.nombre = this.comisiones.nombre;
                params.servicios = this.comisiones.servicios;
                params.productos = this.comisiones.productos;
                params.paquetes = this.comisiones.paquetes;
                params.idComisionTipo = this.comisiones.tipoComision;
                params.factor = this.comisiones.factor;
                params.chckServicios = this.banderaChckServicios;
                params.chckProductos = this.banderaChckProductos;
                params.chckPaquetes = this.banderaChckPaquetes;
                
                this._backService.HttpPost("catalogos/excepciones/guardarCategoria", {}, params).subscribe((response: string) => { 
                    this.respuesta = response;

                    if (this.respuesta == 'Guardado') {
                        this.inicializarComisiones();
                        this._toaster.success(this.consultaExcepcionesTranslate.categoriaGuardada);
                        this._pantallaServicio.ocultarSpinner();
                        $('#btnGuardarCat').removeClass('disabled');
                        this.cargarListadoCategorias();
                    } else {
                        this._pantallaServicio.ocultarSpinner();
                        this.alertError(this.respuesta);
                        $('#btnGuardarCat').removeClass('disabled');
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
        } else {
            this._pantallaServicio.ocultarSpinner();
            $('#btnGuardarCat').removeClass('disabled');
        }
    }

    actualizarCategoria() {
        this._pantallaServicio.mostrarSpinner();
        $('#btnGuardarCat').addClass('disabled');
        var params: any = {};
        params.nombre = this.comisiones.nombre;
        params.servicios = this.comisiones.servicios;
        params.productos = this.comisiones.productos;
        params.paquetes = this.comisiones.paquetes;
        params.idComisionTipo = this.comisiones.tipoComision;
        params.factor = this.comisiones.factor;
        params.idComisionCategoria = this.comisiones.idCategoria;
        params.chckServicios = this.banderaChckServicios;
        params.chckProductos = this.banderaChckProductos;
        params.chckPaquetes = this.banderaChckPaquetes;
        this._backService.HttpPost("catalogos/excepciones/actualizarCategoria", {}, params).subscribe((response: string) => { 
            this.respuesta = response;

            if (this.respuesta == 'Guardado') {
                this.inicializarComisiones();
                this._toaster.success(this.consultaExcepcionesTranslate.categoriaActualizada);
                this._pantallaServicio.ocultarSpinner();
                $('#btnGuardarCat').removeClass('disabled');
                this.cargarListadoCategorias();
            } else {
                this._pantallaServicio.ocultarSpinner();
                this.alertError(this.respuesta);
                $('#btnGuardarCat').removeClass('disabled');
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

        $('#btnGuardarCat').removeClass('disabled');
    }

    borrarCategoria(idComisionCategoria: any) {
        var params: any = {}
        params.idComisionCategoria = idComisionCategoria.toString();
        this._backService.HttpPost("catalogos/excepciones/borrarCategoria", {}, params).subscribe((response: string) => { 
            if (response == "Baja") {
                this._toaster.success(this.consultaExcepcionesTranslate.categoriaEliminada);
                this.inicializarComisiones();
                this._pantallaServicio.ocultarSpinner();
                this.cargarListadoCategorias();
            } else {
                this.alertError(this.consultaExcepcionesTranslate.errorEliminar + response);
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

    validarCampos() {
        var vacios = 0;
        $("#txtDescripcion").removeClass("errorCampo");
        $("#ddlProductos").removeClass("errorCampo");
        $("#ddlServicio").removeClass("errorCampo");
        $("#ddlPaquetes").removeClass("errorCampo");
        $("#ddlTipoComision").removeClass("errorCampo");
        $("#txtFactor").removeClass("errorCampo");

        if (this.comisiones.nombre == "") {
            $("#txtDescripcion").addClass("errorCampo");
            vacios += 1;
        } else if(this.comisiones.idCategoria == 0) {
            for (var i = 0; i < this.dataCategoriasOr.length; i++) {
                if (this.comisiones.nombre == this.dataCategoriasOr[i].nombre) {
                    this._toaster.error(this.consultaExcepcionesTranslate.errorExistente);
                    $("#txtDescripcion").addClass("errorCampo");
                    vacios += 1;
                }
            }
        }

        if ((this.comisiones.productos.length == 0 && this.banderaChckProductos == false)
            && (this.comisiones.servicios.length == 0 && this.banderaChckServicios == false)
            && (this.comisiones.paquetes.length == 0 && this.banderaChckPaquetes == false)) {
            $("#ddlProductos").addClass("errorCampo");
            $("#ddlServicio").addClass("errorCampo");
            $("#ddlPaquetes").addClass("errorCampo");
            vacios += 1;
        }
        if (this.comisiones.tipoComision == 0) {
            $("#ddlTipoComision").addClass("errorCampo");
            vacios += 1;
        }
        if (this.comisiones.factor == 0) {
            $("#txtFactor").addClass("errorCampo");
            vacios += 1;
        }
        if (vacios == 0) {
            this.camposValidos = true;
        }else {
            this.camposValidos = false;
        }
    }

    busquedaPaquete() {
        this.dataCategorias2 = JSON.parse(JSON.stringify(this.dataCategoriasOr));
        if (this.inputBusquedaPaquete != "") {
            var foundItem = this.dataCategorias2.filter((item: any) => {
                    if (item.nombre.toUpperCase().match(this.inputBusquedaPaquete.toUpperCase()) != null) {
                        return item;
                    }
                },
                true);
            this.dataCategorias = JSON.parse(JSON.stringify(foundItem));
        }
        else {
            this.dataCategorias = JSON.parse(JSON.stringify(this.dataCategoriasOr));
        }
    }

    //Funcion de Busqueda de Personal en Seccion en Excepciones
    BusquedaPersonalExcepciones() {
        if (this.PersonalExcepcionesBusqueda != "" && this.PersonalExcepcionesBusqueda != undefined) {
            var elementos = this.PersonalExcepcionesBusqueda.toUpperCase().split(",");
            elementos = elementos.filter((element: any) => {
                return element != "";
            });

            var foundItem = this.dataExcepcion.filter((e: any) => {
                var found = e.some((item: any, index: any) => {
                    if (e.nombres.toUpperCase().match(item) != null) {
                        return true;
                    }else{
                        return false;
                    }
                });

                return found;
            }, elementos);

            this.dataExcepcion = JSON.parse(JSON.stringify(foundItem));
        } else {
            this.dataExcepcion = JSON.parse(JSON.stringify(this.dataSelect)); //Se iguala con el dataSelect
            this.altura = this.dataExcepcion.length * 30 + 57;
        }
    };

    isInvalidDate = (m: moment.Moment) =>  {
        return this.invalidDates.some(d => d.isSame(m, 'day') )
    }
}