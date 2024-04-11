import { Component, OnInit } from '@angular/core';
import { ResponseData } from 'src/app/core/models/response-data.model';
import { MethodsService } from 'src/app/core/services/methods.service';
import { FormControl } from '@angular/forms';
import { PantallaService } from "src/app/core/services/pantalla.service";
import { MatDialog } from '@angular/material/dialog';
import { Router } from "@angular/router";
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { TranslateService } from '@ngx-translate/core'; // TRANSLATE
declare var $: any; // JQUERY
import * as bootstrap from 'bootstrap'; // BOOTSTRAP
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { ToasterService } from "src/shared/toaster/toaster.service";
import { DescartarCambiosServices } from 'src/app/core/services/descartar-cambios.service';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';


@Component({
    selector: 'app-servicio',
    templateUrl: './servicio.component.html',
    styleUrls: ['./servicio.component.scss', '../../page.component.scss'],
})
export class ServicioComponent implements OnInit {

    // Variables de Translate
    servicioTranslate_descartar: any = "";
    servicioTranslate_costoMinM1: any = "";
    servicioTranslate_costoMinM2: any = "";
    servicioTranslate_costoMaxM1: any = "";
    servicioTranslate_costoMaxM2: any = "";
    servicioTranslate_rangoDuracion: any = "";
    servicioTranslate_rangoCostos: any = "";
    servicioTranslate_tiempoDisponibleM: any = "";
    servicioTranslate_nombreRepetido: any = "";
    servicioTranslate_rangoTiempo: any = "";
    servicioTranslate_servicioTiene: any = "";
    servicioTranslate_citasProgramadas: any = "";
    servicioTranslate_deseaBorrar: any = "";
    servicioTranslate_seDebeTener: any = "";
    servicioTranslate_grupos: any = "";
    agendaTranslate_verTodos: any = "";
    agendaTranslate_quitarTodos: any = "";

    // Modales
    modales: any = {};
    modalAlertBorrado_mensaje = "";
    modalConfirm_mensaje = "";
    modalConfirmDescartarActualizar_mensaje = "";
    modalConfirmEliminar_mensaje = "";
    modalConfirm2_mensaje = "";
    modalEliminarEtiqueta_mensaje = "";
    modalConfirmEliminarPaquete_mensaje = "";
    modalActualizarservicio_mensaje = "";
    modalActualizarPaquete_mensaje = "";

    constructor(private _translate: TranslateService, private _backService: MethodsService, public _pantallaServicio: PantallaService, private _dialog: MatDialog, private _router: Router, private _toaster: ToasterService, private _descartarCambios: DescartarCambiosServices, private matIconRegistry: MatIconRegistry, private domSanitizer: DomSanitizer) {
        this._translate.setDefaultLang(this._pantallaServicio.idioma);
        this._translate.use(this._pantallaServicio.idioma);

        this._translate.get('servicioTranslate.inicio').subscribe((translated: string) => {            
            this.servicioTranslate_descartar = this._translate.instant('servicioTranslate.descartar');
            this.servicioTranslate_costoMinM1 = this._translate.instant('servicioTranslate.costoMinM1');
            this.servicioTranslate_costoMinM2 = this._translate.instant('servicioTranslate.costoMinM2');
            this.servicioTranslate_costoMaxM1 = this._translate.instant('servicioTranslate.costoMaxM1');
            this.servicioTranslate_costoMaxM2 = this._translate.instant('servicioTranslate.costoMaxM2');
            this.servicioTranslate_rangoDuracion = this._translate.instant('servicioTranslate.rangoDuracion');
            this.servicioTranslate_rangoCostos = this._translate.instant('servicioTranslate.rangoCostos');
            this.servicioTranslate_tiempoDisponibleM = this._translate.instant('servicioTranslate.tiempoDisponibleM');
            this.servicioTranslate_nombreRepetido = this._translate.instant('servicioTranslate.nombreRepetido');
            this.servicioTranslate_rangoTiempo = this._translate.instant('servicioTranslate.rangoTiempo');
            this.servicioTranslate_servicioTiene = this._translate.instant('servicioTranslate.servicioTiene');
            this.servicioTranslate_citasProgramadas = this._translate.instant('servicioTranslate.citasProgramadas');
            this.servicioTranslate_deseaBorrar = this._translate.instant('servicioTranslate.deseaBorrar');
            this.servicioTranslate_seDebeTener = this._translate.instant('servicioTranslate.seDebeTener');
            this.servicioTranslate_grupos = this._translate.instant('servicioTranslate.grupos');
            this.agendaTranslate_verTodos = this._translate.instant('agendaTranslate.verTodos');
            this.agendaTranslate_quitarTodos = this._translate.instant('agendaTranslate.quitarTodos');
        });

        this.matIconRegistry.addSvgIcon('iconPlusCircle', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Agregar-1-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconSearch', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Buscar-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconCross', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/MasPequena-icon.svg"));
		this.matIconRegistry.addSvgIcon('iconCasita', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Casa1-icon.svg"));
		this.matIconRegistry.addSvgIcon('iconFlechaDerecha', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/FlechaDerechaPequena-icon.svg"));
    }

    ngOnInit(): void {
        this._pantallaServicio.mostrarSpinner();
        this.crearModales();
        this.consultarServicios(null);
        this.consultaEtiquetas(true);
        this.inicializarPaquetes();
        this.consultaPaqueteCostoTipo();
        this.cargarListadoPaquetes();
        this.cargarServicios();
        this.cargarProductos();

        this.cargarCPS();
        this.cargarUnidadMedida();
    }

    onExit() {
        const showExit =
          this.accion === 'Nuevo'
            ? this.validarDescartarNuevo()
            : true;
        return this._descartarCambios.mostrarModal(showExit);
      }

    crearModales() {

        if ($('body').find('.modal-alertBorrado').length > 1) {
            $('body').find('.modal-alertBorrado')[1].remove();
        }
        this.modales.modalAlertBorrado = new bootstrap.Modal($("#modal-alertBorrado").appendTo("body"), {
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

        if ($('body').find('.modal-confirmDescartarActualizar').length > 1) {
            $('body').find('.modal-confirmDescartarActualizar')[1].remove();
        }
        this.modales.modalConfirmDescartarActualizar = new bootstrap.Modal($("#modal-confirmDescartarActualizar").appendTo("body"), {
            backdrop: "static", 
            keyboard: false,
        });

        if ($('body').find('.modal-confirmEliminar').length > 1) {
            $('body').find('.modal-confirmEliminar')[1].remove();
        }
        this.modales.modalConfirmEliminar = new bootstrap.Modal($("#modal-confirmEliminar").appendTo("body"), {
            backdrop: "static", 
            keyboard: false,
        });

        if ($('body').find('.modal-confirm2').length > 1) {
            $('body').find('.modal-confirm2')[1].remove();
        }
        this.modales.modalConfirm2 = new bootstrap.Modal($("#modal-confirm2").appendTo("body"), {
            backdrop: "static", 
            keyboard: false,
        });

        if ($('body').find('.modalEtiquetas').length > 1) {
            $('body').find('.modalEtiquetas')[1].remove();
        }
        this.modales.modalEtiquetas = new bootstrap.Modal($("#modalEtiquetas").appendTo("body"), {
            backdrop: "static", 
            keyboard: false,
        });

        if ($('body').find('.modalEliminarEtiqueta').length > 1) {
            $('body').find('.modalEliminarEtiqueta')[1].remove();
        }
        this.modales.modalEliminarEtiqueta = new bootstrap.Modal($("#modalEliminarEtiqueta").appendTo("body"), {
            backdrop: "static", 
            keyboard: false,
        });

        if ($('body').find('.modalConfirmEliminarPaquete').length > 1) {
            $('body').find('.modalConfirmEliminarPaquete')[1].remove();
        }
        this.modales.modalConfirmEliminarPaquete = new bootstrap.Modal($("#modalConfirmEliminarPaquete").appendTo("body"), {
            backdrop: "static", 
            keyboard: false,
        });

        if ($('body').find('.modalActualizarservicio').length > 1) {
            $('body').find('.modalActualizarservicio')[1].remove();
        }
        this.modales.modalActualizarservicio = new bootstrap.Modal($("#modalActualizarservicio").appendTo("body"), {
            backdrop: "static", 
            keyboard: false,
        });

        if ($('body').find('.modalActualizarPaquete').length > 1) {
            $('body').find('.modalActualizarPaquete')[1].remove();
        }
        this.modales.modalActualizarPaquete = new bootstrap.Modal($("#modalActualizarPaquete").appendTo("body"), {
            backdrop: "static", 
            keyboard: false,
        });
    }


    // ------------------------------------------------------------------------------------------- //
    // ---------------------------------------- Servicios ---------------------------------------- //
    // ------------------------------------------------------------------------------------------- //


    // ----------------------------------- Declaracion de variables ----------------------------------- 
    rootScope_fromState = "servicio";
    rootScope_accionServicio = "Actualizar";
    rootScope_toState: any = ""

    servicio: any = {
        esFrecuente: false,
        esPrivado: true,
        esLink: true,
        pagoPaypal: false,
        libre: 0,
        costoMaximo: 0,
        costoMinimo: 0,
        nombre: "",
        duracion: "",
        tiempoDisponible: "",
        costoTipo: null,
        idClaveProdServ: null,
        idUnidadMedida: null,

        dataServicio: [],
        dataUnidadMedida: [],

        colores: ["#5A5A5A","#0A2A38","#58b578","#357EC1","#B32032","#054353","#FCDD1A","#24557D","#4B296B","#99244A","#EC6351","#377D7B"],
	    claseColor: ["color0","color1","color2","color3","color4","color5","color6","color7","color8","color9","color10","color11"],
    };
    msgCostoMax = "";
    msgCostoMin = "";
    msgNombre = "";
    msgDuracion = "";
    msgTiempoDisponible = "";
    validRangoDuracion = true;
    validRangoTiempoDisponible = true;
    validRangoCostoMax = true;
    validMinimoTiempoDisponible = true;
    guardarTDisponible = false;
    guardarCostoTipo = false;
    guardar = false;
    accion = "Actualizar";
    stopChange = false;
    validDescartar = false;
    agenda = "";
    paramsNotifi8 = {
        life: 3000,
        theme: "lime",
        sticky: false
    };
    errorNotific = { 
        life: 3000, 
        theme: "ruby", 
        sticky: false 
    };
    successNotific8 = { 
        life: 3000, 
        theme: "lime", 
        sticky: false 
    };
    // this._pantallaServicio.mostrarSpinner();
    // $("#datosGenerales").hide();
    // $("#btnGuardar").hide();
    primeraCarga = true;
    inputBusquedaServicios = "";

    etiqueta: any = {
        dataEtiquetas: [],
        dataServicioEtiquetas: [],
        etiquetaGuardada: true,
        dataEtiquetasTemp: [],
        dataEtiquetasFiltro: []
    };
    multiSelResources: any = [];
    multiSelModel: any = [];

    // Variables que faltan
    idServicioToActualizar: any = "";
    toActualizar: any = "";
    cambioServicio: any = true;
    dataCostoTipo: any[] = [];
    validFrec: any = "";
    contRequeridos: any = 0;
    validCostoMin: any = true;
    validCostoMax: any = true;
    validNombre: any = true;
    validCitas: any = false;
    dataCitasDetalle: any[] = [];
    validarCitas: any = false;
    modalStyle: any = "";
    servicioSeleccionado: any = "";
    idEtiquetaSeleccionada: any = "";
    etiquetaAEliminar: any = "";
    dataCitas: any[] = [];
    numCitas: any = 0;
    dataCPS: any[] = [];
    dataUnidadMedida: any[] = [];
    elementoDdl: any = "";

    readonly separatorKeysCodes = [ENTER, COMMA] as const;

    
    // ----------------------------------- Declaracion de funciones ----------------------------------- 
    consultarServicios(idServicio: any) {
        this._pantallaServicio.mostrarSpinner();
        var params: any = {};
        params.sucursal = null;
        var j = 0;
        if (this.multiSelModel) {
            if (this.multiSelModel.length > 0 && this.multiSelResources.length != this.multiSelModel.length) {
                var result = this.multiSelModel.map(function (a: any) { return a.id; });
                params.listaEtiquetas = result;
            }
            else {
                params.listaEtiquetas = [];
            }
        }
        else {
            params.listaEtiquetas = [];
        }
        this._backService.HttpPost("catalogos/servicio/consultarServiciosFiltro", {}, params).subscribe((response: string) => {
	
            this.servicio.dataServicios = eval(response);
            
            function compare(b: any, a: any) {
                if (a.idServicio < b.idServicio)
                    return -1;
                if (a.idServicio > b.idServicio)
                    return 1;
                return 0;
            }

            this.servicio.dataServicios.sort(compare);
            
            //Asigna el color a cada servicio
            for (var i = 0; i < this.servicio.dataServicios.length; i++) {
                this.servicio.dataServicios[i].nombre = (this.servicio.dataServicios[i].nombre).replace(/&lt;/g, "<");
                if (j < this.servicio.claseColor.length) {
                    this.servicio.dataServicios[i].claseColor = this.servicio.claseColor[j];
                    j++;
                } else {
                    j = 0;
                    this.servicio.dataServicios[i].claseColor = this.servicio.claseColor[j];
                    j++;
                }
            }

            if (this.servicio.dataServicios.length > 0) {
                this.servicio.dataServicio[0] = Object.assign({}, this.servicio.dataServicios[0]);
                if (this.primeraCarga) {
                    this.primeraCarga = false;
                    this.servicio.idServicio = this.servicio.dataServicios[0].idServicio;
                    this.cargarServicio(this.servicio.idServicio);
                    // this.servicio.nombre = this.servicio.dataServicios[0].nombre;
                    // this.servicio.duracion = this.servicio.dataServicios[0].duracion;

                    // if (parseInt(this.servicio.dataServicios[0].tiempoDisponible, 10) != 0) {
                    //     this.servicio.tiempoDisponible = this.servicio.dataServicios[0].tiempoDisponible;
                    // } else {
                    //     this.servicio.tiempoDisponible = "";
                    // }
                    // if (parseInt(this.servicio.dataServicios[0].tiempoDisponible, 10) != null && parseInt(this.servicio.dataServicios[0].tiempoDisponible, 10) != 0) {
                    //     this.servicio.libre = true;
                    // } else {
                    //     this.servicio.libre = false;
                    // }
                    // this.servicio.esPrivado = this.servicio.dataServicios[0].esPrivado == 0 ? true : false;
                    // this.servicio.esFrecuente = this.servicio.dataServicios[0].esFrecuente == 1  ? true : false;
                    // this.servicio.esLink = this.servicio.dataServicios[0].esLink == 1 ? true : false;
                    // this.servicio.pagoPaypal = this.servicio.dataServicios[0].pagoPaypal == 1  ? true : false;
                    // this.servicio.iva = this.servicio.dataServicios[0].iva == 1  ? true : false;
                    
                    // this.servicio.costoTipo = this.servicio.dataServicios[0].idCostoTipo;
                    // this.servicio.costoMinimo = parseFloat(this.servicio.dataServicios[0].costoMinimo.replace(",", "")).toFixed(2);
                    // this.servicio.dataServicio[0].costoMinimo = parseFloat(this.servicio.dataServicios[0].costoMinimo.replace(",", "")).toFixed(2);
                    // if (this.servicio.dataServicios[0].costoMaximo != null) {
                    //     this.servicio.costoMaximo = parseFloat(this.servicio.dataServicios[0].costoMaximo.replace(",", "")).toFixed(2);
                    //     this.servicio.dataServicios[0].costoMaximo = parseFloat(this.servicio.dataServicios[0].costoMaximo.replace(",", "")).toFixed(2);
                    // } else {
                    //     this.servicio.costoMaximo = this.servicio.dataServicios[0].costoMaximo;
                    // }
                    // this.servicio.idClaveProdServ = this.servicio.dataServicio[0].idClaveProdServ;
                    // if (this.servicio.idClaveProdServ == "" || this.servicio.idClaveProdServ == undefined || this.servicio.idClaveProdServ == null) {
                    //     this.servicio.idClaveProdServ = 97;
                    // }
                    // this.servicio.idUnidadMedida = this.servicio.dataServicio[0].idUnidadMedida;
                    // if (this.servicio.idUnidadMedida == "" || this.servicio.idUnidadMedida == undefined || this.servicio.idUnidadMedida == null) {
                    //     this.servicio.idUnidadMedida = 1;
                    // }
                    
                    // this.validarFrecuentes();

                    // if (this.servicio.esPrivado == false) {
                    //     $('#swFrecuente').addClass('onoffswitch-inner-disable');
                    // } else {
                    //     $('#swFrecuente').removeClass('onoffswitch-inner-disable');
                    // }
                    // this.consultaServicioEtiquetas(this.servicio.idServicio);

                } else {
                    if (idServicio == "Nueva") {
                        this.nuevoServicio();
                    } else if (idServicio == "Borrar") {
                        this.cargarServicio(this.servicio.idServicio);
                    } else if (idServicio != null || idServicio != undefined) {
                        this.cargarServicio(idServicio);
                    } else {
                        this.cargarServicio(this.servicio.idServicio);
                    }
                }
            } else {
                this.nuevoServicio();
            }
            this.etiqueta.etiquetaGuardada = true;
            this.consultaCostoTipo();
            this.servicio.dataServicios2 = Object.assign([], this.servicio.dataServicios);
            this._pantallaServicio.ocultarSpinner();
        
        }, error => {
        
        });
       
    }

    //Inicializa todo en blanco para agergar un nuevo servicio
    nuevoServicio() {
        //$("#blockScreen").show();
        $('#btnNuevo').css("display", "none");
        $('#divServicios').css('pointer-events', 'none');
        $('#btnGuardar').css('pointer-events', 'none');
        $('#btnDescartar').css('pointer-events', 'none');
        $('#img' + this.servicio.idServicio).removeClass("imgActive");
        $('#lbl' + this.servicio.idServicio).css("color", "");

        this.msgCostoMax = "";
        this.msgCostoMin = "";
        this.msgNombre = "";
        this.msgDuracion = "";
        this.msgCostoMax = "";
        this.msgTiempoDisponible = "";

        this.servicio.nombre = "";
        this.servicio.duracion = "";
        this.servicio.costoTipo = null;
        this.servicio.costoMinimo = null;
        this.servicio.costoMaximo = null;
        this.servicio.idUnidadMedida = null;
        this.servicio.idClaveProdServ = null;

        this.servicio.libre = false;
        this.servicio.esPrivado = false;
        this.servicio.esLink = false;
        this.servicio.pagoPaypal = false;
        this.servicio.iva = false;
        this.servicio.esFrecuente = false;
        this.servicio.tiempoDisponible = "";

        this.validRangoDuracion = true;
        this.validRangoTiempoDisponible = true;
        this.validRangoCostoMax = true;
        this.validMinimoTiempoDisponible = true;
        this.guardarTDisponible = false;
        this.guardarCostoTipo = false;
        this.guardar = false;
        this.accion = "Nuevo";
        this.rootScope_accionServicio = "Nuevo";
        this.primeraCarga = false;
        this.validDescartar = false;
        this.agenda = "";
        this.stopChange = false;
        this.etiqueta.dataEtiquetas = this.etiqueta.dataEtiquetasTemp;
        this.etiqueta.dataServicioEtiquetas = [];

        this.consultaCostoTipo();
    }

    busquedaServicio() {
        if (this.inputBusquedaServicios != "") {
            var foundItem = this.servicio.dataServicios2.filter((e: any) => { 
                if (e.nombre.toUpperCase().match(this.inputBusquedaServicios.toUpperCase()) != null) {
                    return e;
                }
			});
            this.servicio.dataServicios = Object.assign([], foundItem);
        }
        else {
            this.servicio.dataServicios = Object.assign([], this.servicio.dataServicios2);
        }
    }

    //Inicializa los campos con los datos de la consulta
    inicializarValores() {
        this.msgCostoMax = "";
        this.msgCostoMin = "";
        this.msgNombre = "";
        this.msgDuracion = "";
        this.msgCostoMax = "";
        this.msgTiempoDisponible = "";

        this.servicio.nombre = "";
        this.servicio.duracion = "";
        this.servicio.costoTipo = null;
        this.servicio.costoMinimo = null;
        this.servicio.costoMaximo = null;

        this.servicio.libre = false;
        this.servicio.esPrivado = false;
        this.servicio.esLink = false;
        this.servicio.pagoPaypal = false;
        this.servicio.iva = false;
        this.servicio.esFrecuente = false;
        this.servicio.tiempoDisponible = "";

        this.validRangoDuracion = true;
        this.validRangoTiempoDisponible = true;
        this.validRangoCostoMax = true;
        this.validMinimoTiempoDisponible = true;
        this.guardarTDisponible = false;
        this.guardarCostoTipo = false;
        this.guardar = false;
        this.accion = "Actualizar";
        this.rootScope_accionServicio = "Actualizar";
        this.stopChange = false;
        this.validDescartar = false;
        this.agenda = "";

        this.servicio.nombre = this.servicio.dataServicio[0].nombre;
        this.servicio.duracion = this.servicio.dataServicio[0].duracion;

        if (parseInt(this.servicio.dataServicio[0].tiempoDisponible, 10) != 0) {
            this.servicio.tiempoDisponible = this.servicio.dataServicio[0].tiempoDisponible;
        } else {
            this.servicio.tiempoDisponible = "";
        }
        if (parseInt(this.servicio.dataServicio[0].tiempoDisponible, 10) != null && parseInt(this.servicio.dataServicio[0].tiempoDisponible, 10) != 0) {
            this.servicio.libre = true;
        }
        else{
            this.servicio.libre = false;
        }
        this.servicio.esPrivado = this.servicio.dataServicio[0].esPrivado == 0 ? true : false;        
        this.servicio.esLink = this.servicio.dataServicio[0].esLink == 1 ? true : false;
        this.servicio.pagoPaypal = this.servicio.dataServicio[0].pagoPaypal == 1  ? true : false;
        this.servicio.esFrecuente = this.servicio.dataServicio[0].esFrecuente == 1  ? true : false;
        this.servicio.iva = this.servicio.dataServicio[0].iva == 1  ? true : false;

        this.servicio.costoTipo = this.servicio.dataServicio[0].idCostoTipo;
        this.servicio.costoMinimo = this.servicio.dataServicio[0].costoMinimo;
        this.servicio.costoMaximo = this.servicio.dataServicio[0].costoMaximo;
        this.servicio.idClaveProdServ = this.servicio.dataServicio[0].idClaveProdServ;
        if (this.servicio.idClaveProdServ == "" || this.servicio.idClaveProdServ == undefined || this.servicio.idClaveProdServ == null) {
            this.servicio.idClaveProdServ = 97;
        }
        this.servicio.idUnidadMedida = this.servicio.dataServicio[0].idUnidadMedida;
        if (this.servicio.idUnidadMedida == "" || this.servicio.idUnidadMedida == undefined || this.servicio.idUnidadMedida == null) {
            this.servicio.idUnidadMedida = 1;
        }
        
        // if (this.servicio.esPrivado == false) {
        //     $('#swFrecuente').addClass('onoffswitch-inner-disable');
        // } else {
        //     $('#swFrecuente').removeClass('onoffswitch-inner-disable');
        // }

        this.validarFrecuentes();
        this.consultaCostoTipo();
    }

    //Se encarga de quitar todas los campos en rojo y mensajes de error
    limpiarValidaciones() {
        $("#txtNombre").removeClass("errorCampo");
        $("#txtDuracion").removeClass("errorCampo");
        $("#txtTiempoDisponible").removeClass("errorCampo");
        $("#ddlCostoTipo > div:first-child").attr("style", "outline: none;");
        $("#txtCostoMaximo").removeClass("errorCampo");
        $("#txtCostoMinimo").removeClass("errorCampo");
        $("#txtCPS").removeClass("errorCampo");
        $("#txtUnidadMedida").removeClass("errorCampo");

        this.msgNombre = "";
        this.msgDuracion = "";
        this.msgTiempoDisponible = "";
        this.msgCostoMin = "";
        this.msgCostoMax = "";
    }

    //Carga la informacion de el servicio seleccionado
    cargarServicio(idServicio: any) {
        //$("#blockScreen").show();
        $('#btnNuevo').css("display", "inline");
        this.servicio.idServicio = parseInt(idServicio, 10);
        var params: any = {};
        params.idServicio = parseInt(idServicio, 10);
        this._backService.HttpPost("catalogos/servicio/cargarServicio", {}, params).subscribe((response: string) => {
            this.servicio.dataServicio = eval(response);
            this.servicio.dataServicio[0].nombre = (this.servicio.dataServicio[0].nombre).replace(/&lt;/g, "<");
            this.inicializarValores();
            this.limpiarValidaciones();
            this.consultaServicioEtiquetas(this.servicio.idServicio);
        }, error => {
        
        });
    }

    //El botón guardar ejecuta la accion dependiendo de lo que se haya seleccionado 
    accionBoton(idServicio: any, toActualizar: any) {
        var params: any = {};
        var idEtiquetas: any = [];

        if (this.accion == 'Actualizar') {
            if (idServicio != this.servicio.idServicio) {
                if (toActualizar == "toActualizar") {
                    //$("#blockScreen").hide();
                    this.servicio_descartaActualizar(idServicio);
                } else {
                    $("#btnGuardar").addClass("loading");
                    $('#divServicios').css('pointer-events', 'none');
                    $('#btnNuevo').css('pointer-events', 'none');
                    $('#btnGuardar').css('pointer-events', 'none');
                    $('#btnDescartar').css('pointer-events', 'none');
                    var nombreServicioOld = this.servicio.dataServicio[0].nombre;
                    var nombreServicioUpd = this.servicio.nombre;
                    if (nombreServicioOld != nombreServicioUpd) {
                        this.modalActualizarservicio_mensaje = "Al editar el nombre del servicio,se editaran en todas las citas anteriores";
                        this.modales.modalActualizarservicio.show();
                    }
                    else {
                        this.servicio_actualizarServicio(idServicio);
                    }

                    var tam = this.etiqueta.dataServicioEtiquetas.length;
                    for (var i = 0; i < tam; i++) {
                        params.idEtiqueta = this.etiqueta.dataServicioEtiquetas[i].idEtiqueta;
                        idEtiquetas.push(params.idEtiqueta);
                        params = new Object();
                    }

                    this.leerEtiquetas(this.servicio.idServicio, idEtiquetas, false);
                    this.etiqueta.etiquetaGuardada = true;
                }

            } else {
                //$("#blockScreen").hide();
            }
        } else if (this.accion == 'Nuevo') {
            $("#btnGuardar").addClass("loading");
            if (toActualizar != "toActualizar") {
                $('#divServicios').css('pointer-events', 'none');
                $('#btnGuardar').css('pointer-events', 'none');
                $('#btnDescartar').css('pointer-events', 'none');
                this.servicio_guardarServicio(idServicio, true);

            } else {
                this.idServicioToActualizar = idServicio;
                this.toActualizar = toActualizar;
                this.servicio_descartaNuevo(undefined);
                //$("#blockScreen").hide();
            }
        }

    }

    //** funcion para poder mandar el idServicio y idEtiqueta a la tabla servicioEtiqueta
    leerEtiquetas(idServicio: any, idEtiqueta: any, tipo: any) {
        var params: any = {
            "idServicio": idServicio,
            "idEtiqueta": idEtiqueta
        }

        this._backService.HttpPost("catalogos/servicio/guardarServicioEtiquetas", {}, params).subscribe((response: string) => {
            var evalData = eval(response);
            this.etiqueta.etiquetaSeleccionada = "";
            this.consultaEtiquetas(tipo);
        }, error => {
        
        });
    }

    confirmDescartarActualizar() {
        $('#lbl' + this.servicio.idServicio).css("color", "");
        $('#img' + this.servicio.idServicio).removeClass("imgActive");
        this.cargarServicio(this.servicio.idServicioDescarta);
        this.etiqueta.etiquetaGuardada = true;
    }

    cancelarDescartarActualizar() {
        this.agenda = "";
        this.toActualizar = "";
        this.modales.modalConfirmDescartarActualizar.hide();
    }

    //Funcion que confirma el descartado de los datos
    confirmDescartar() {
        this.etiqueta.etiquetaGuardada = true;
        if (this.toActualizar == "toActualizar") {
            this.cargarServicio(this.idServicioToActualizar);
        } else if (this.agenda == "") {
            this.rootScope_fromState = "";
            this._router.navigate(['/' + this.rootScope_toState]);
        } else if (this.agenda == "agenda") {
            this.agenda = "";
            this.rootScope_fromState = "";
            this._router.navigate(['/procesos/agenda']);
        }
    }

    //Cancela el descarttado
    cancelarDescartar() {
        this.agenda = "";
        this.toActualizar = "";
        this.modales.modalConfirm.hide();
    }

    //Recibe el evento de descartar
    descartar(agenda: any) {
        this.agenda = agenda;
        if (this.accion == 'Nuevo') {
            this.servicio_descartaNuevo(undefined);
        } else if (this.accion == 'Actualizar') {
            this.servicio_actualizarServicio(agenda);
        }
    }

    //Funcion para descartar cambios cuando sea un nuevo servicio
    servicio_descartaNuevo(cambio: any) {
        if (this.servicio.nombre != "" || this.servicio.duracion != "" || this.servicio.tiempoDisponible != "" || this.servicio.costoMaximo != null || this.servicio.costoMinimo != null || this.servicio.costoTipo != null || this.servicio.esFrecuente != false || this.servicio.esPrivado != false || this.servicio.libre != false) {
            if (cambio == undefined) {
                this.modalConfirm_mensaje = this.servicioTranslate_descartar;
                this.modales.modalConfirm.show();
            }
        } else {
            if (cambio == "CambioServicio") {
                this.cambioServicio = true;
                this.limpiarValidaciones();
            } else {
                if (this.toActualizar == "toActualizar") {
                    this.cargarServicio(this.idServicioToActualizar);
                } else if (this.agenda == "") {
                    this.validDescartar = true;
                    this._router.navigate(['/' + this.rootScope_toState]);
                } else if (this.agenda == "agenda") {
                    this.agenda = "";
                    this.validDescartar = true;
                    this._router.navigate(['/procesos/agenda']);
                }
            }
        }
    }

    //Funcion que se utiliza en el main para descartar cambios
    rootScope_descartaNuevoServicio(cambio: any) {
        if (this.servicio.nombre != "" || this.servicio.duracion != "" || this.servicio.tiempoDisponible != "" || this.servicio.costoMaximo != null || this.servicio.costoMinimo != null || this.servicio.costoTipo != null || this.servicio.esFrecuente != false || this.servicio.esPrivado != false || this.servicio.libre != false) {
            if (cambio == undefined) {
                this.modalConfirm_mensaje = this.servicioTranslate_descartar;
                this.modales.modalConfirm.show();
            }
        } else {
            if (cambio == "CambioServicio") {
                this.cambioServicio = true;
                this.limpiarValidaciones();
            } else {
                if (this.agenda == "") {
                    this.validDescartar = true;
                    this._router.navigate(['/' + this.rootScope_toState]);
                } else if (this.agenda == "agenda") {
                    this.agenda = "";
                    this.validDescartar = true;
                    this._router.navigate(['/procesos/agenda']);
                }
            }
        }
    }

    //Funcion para descartar cambios cuando se actualice un servicio
    servicio_descartaActualizar(idServicio: any) {
        this.servicio.idServicioDescarta = idServicio;
        if (!this.etiqueta.etiquetaGuardada || this.servicio.nombre != this.servicio.dataServicio[0].nombre || this.servicio.duracion != this.servicio.dataServicio[0].duracion ||
            this.servicio.tiempoDisponible != this.servicio.dataServicio[0].tiempoDisponible || this.servicio.costoTipo != this.servicio.dataServicio[0].idCostoTipo ||
            this.servicio.costoMinimo != this.servicio.dataServicio[0].costoMinimo || this.servicio.costoMaximo != ((this.servicio.dataServicio[0].costoMaximo != null) ? this.servicio.dataServicio[0].costoMaximo.replace(',', '') : this.servicio.dataServicio[0].costoMaximo) ||
            this.servicio.esFrecuente != this.servicio.dataServicio[0].esFrecuente || this.servicio.esPrivado != !this.servicio.dataServicio[0].esPrivado) {
            this.modalConfirmDescartarActualizar_mensaje = this.servicioTranslate_descartar;
            this.modales.modalConfirmDescartarActualizar.show();

        } else {
            $('#lbl' + this.servicio.idServicio).css("color", "");
            $('#img' + this.servicio.idServicio).removeClass("imgActive");
            this.etiqueta.etiquetaGuardada = true;
            this.cargarServicio(idServicio);
        }
    }

    //Consulta de costo tipo
    consultaCostoTipo() {
        this._backService.HttpPost("catalogos/servicio/consultaCostoTipo", {}, {}).subscribe((response: string) => {
            this.dataCostoTipo = eval(response);
            var color: any = "";
            if (this.accion == "Actualizar") {
                $('#img' + this.servicio.idServicio).addClass('imgActive');
                for (var i = 0; i < this.servicio.dataServicios.length; i++) {
                    if (this.servicio.dataServicios[i].idServicio == this.servicio.idServicio) {
                        color = i;
                        break;
                    }
                }
                $('#lbl' + this.servicio.idServicio).css('color', this.servicio.colores[color]);
            }

            //$("#btn").removeClass("shine");
            $("#btnGuardar").removeClass("loading");

            this._pantallaServicio.ocultarSpinner();
            //$("#blockScreen").hide();
            $("#datosGenerales").show();
            $("#btnGuardar").show();
            setTimeout(function () { $('#divServicios').css('pointer-events', 'visible'); }, 1000)

            $('#btnNuevo').css('pointer-events', 'visible');
            $('#btnGuardar').css('pointer-events', 'visible');
            $('#btnDescartar').css('pointer-events', 'visible');
        
        }, error => {
        
        });
    }

    //Valida cuantos servicios estan como frecuentes para mostrar o no el switch 
    validarFrecuentes() {
        this._backService.HttpPost("catalogos/servicio/validarFrecuentes", {}, {}).subscribe((response: string) => {
            this.validFrec = eval(response);
            if (this.servicio.esFrecuente && this.validFrec) {
                this.validFrec = false;
            }
        }, error => {
        
        });
    }

    //En caso de cambiar el valor del checkbox de servicio privado
    onchangeChkServicioPrivado() {
        if (!this.servicio.esPrivado == true) {
            this.servicio.esFrecuente = false;
            //$('#swFrecuente').addClass('onoffswitch-inner-disable');
        } else {
            //$('#swFrecuente').removeClass('onoffswitch-inner-disable');
        }
    }

    //En caso de que el chk libre este habilitado se habilitara el txtTiempoDisponible
    onChangeChkLibre() {
        //var elemTiempoDispo: any = document.getElementById('txtTiempoDisponible');
        if (this.servicio.libre == false) {
            this.servicio.tiempoDisponible = null;
            //elemTiempoDispo.value = "";
            this.msgTiempoDisponible = "";
            this.validRangoTiempoDisponible = true;
            //$("#txtTiempoDisponible").removeClass("errorCampo");
        }
    }

    //En caso de que seleccione Fijo se habilitara el campo costo min, en caso de que selecione aproximado o rango, se habilitaran los campos costo Min y costo Max
    onChangeDdlTipoCosto() {
        if (!(this.servicio.costoTipo == 1 || this.servicio.costoTipo == 3)) {
            this.servicio.costoMaximo = null;
            $("#txtCostoMaximo").removeClass("errorCampo");
            this.msgCostoMax = "";
        }

        if (this.servicio.costoTipo != undefined && this.servicio.costoTipo != "" && this.servicio.costoTipo != null) {
            $("#ddlCostoTipo > div:first-child").attr("style", "outline: none;");
        }
    }

    //Se validaran los campos que sean requeridos para pintarlos de rojos en caso de que esten vacios al presionar el botón guardar
    validarCamposRequeridos() {
        this.contRequeridos = 0;
        if (this.servicio.nombre == "" || this.servicio.nombre == undefined) {
            $("#txtNombre").addClass("errorCampo");
            this.contRequeridos++;
        } else {
            $("#txtNombre").removeClass("errorCampo");
        }
        if (this.servicio.duracion == "" || this.servicio.duracion == undefined) {
            $("#txtDuracion").addClass("errorCampo");
            this.contRequeridos++;
        } else {
            $("#txtDuracion").removeClass("errorCampo");
        }
        if (this.servicio.costoTipo == null || this.servicio.costoTipo == undefined || this.servicio.costoTipo == null) {
            $("#ddlCostoTipo > div:first-child").attr("style", "outline: red solid 1px !important");
            this.contRequeridos++;
        } else {
            $("#ddlCostoTipo > div:first-child").attr("style", "outline: none;");
        }
        if (this.servicio.costoTipo != "" && this.servicio.costoTipo != null) {
            if (this.servicio.costoTipo == 1 || this.servicio.costoTipo == 3) {
                if (this.servicio.costoMaximo == "" || this.servicio.costoMaximo == undefined || this.servicio.costoMaximo == null) {
                    $("#txtCostoMaximo").addClass("errorCampo");
                    this.contRequeridos++;
                } else
                    $("#txtCostoMaximo").removeClass("errorCampo");

                if (this.servicio.costoMinimo == "" || this.servicio.costoMinimo == undefined || this.servicio.costoMinimo == null) {
                    $("#txtCostoMinimo").addClass("errorCampo");
                    this.contRequeridos++;
                } else {
                    $("#txtCostoMinimo").removeClass("errorCampo");
                }
            }
            if (this.servicio.costoMinimo == "" || this.servicio.costoMinimo == undefined || this.servicio.costoMinimo == null) {
                $("#txtCostoMinimo").addClass("errorCampo");
                this.contRequeridos++;
            } else{
                $("#txtCostoMinimo").removeClass("errorCampo");
            }
        }
    }

    //Funcion para validar numeros flotantes
    servicio_validFlotantes() {
        var costoMinimo = this.servicio.costoMinimo;
        costoMinimo = costoMinimo != null ? costoMinimo.toString() : "";
        var costoMaximo = this.servicio.costoMaximo;
        costoMaximo = costoMaximo != null ? costoMaximo.toString() : "";
        
        this.validCostoMin = true;
        this.validCostoMax = true;
        this.msgCostoMax = "";
        this.msgCostoMin = "";
        var valExp = RegExp("^([0-9]{0,7})([,\.][0-9]{0,2})?$");
        var valExp2 = RegExp("^[0-9.,]*$");

        if (this.servicio.costoTipo != "" && this.servicio.costoTipo != null) {
            if (costoMinimo != "") {
                if (valExp2.test(costoMinimo.replace(",", ""))) {
                    this.validCostoMin = true;
                    this.msgCostoMin = "";
                    $("#txtCostoMinimo").removeClass("errorCampo");
                } else {
                    this.validCostoMin = false;
                    this.msgCostoMin = this.servicioTranslate_costoMinM1;
                    $("#txtCostoMinimo").addClass("errorCampo");
                }

                if (this.validCostoMin) {
                    if (valExp.test(costoMinimo.replace(",", ""))) {
                        if (costoMinimo != ".") {
                            this.validCostoMin = true;
                            this.msgCostoMin = "";
                            $("#txtCostoMinimo").removeClass("errorCampo");
                        } else {
                            this.validCostoMin = false;
                            this.msgCostoMin = this.servicioTranslate_costoMinM2;
                            $("#txtCostoMinimo").addClass("errorCampo");
                        }

                    } else {
                        this.validCostoMin = false;
                        this.msgCostoMin = this.servicioTranslate_costoMinM2;
                        $("#txtCostoMinimo").addClass("errorCampo");
                    }
                }
            }

            if (this.servicio.costoTipo != 2) {
                if (costoMaximo != "") {
                    if (valExp2.test(costoMaximo.replace(",", ""))) {

                        this.validCostoMax = true;
                        $("#txtCostoMaximo").removeClass("errorCampo");
                        this.msgCostoMax = "";
                    } else {
                        this.validCostoMax = false;
                        this.msgCostoMax = this.servicioTranslate_costoMaxM1;
                        $("#txtCostoMaximo").addClass("errorCampo");
                    }
                }

                if (this.validCostoMax) {
                    if (costoMaximo != "") {
                        if (valExp.test(costoMaximo.replace(",", ""))) {
                            if (costoMaximo != ".") {
                                this.validCostoMax = true;
                                $("#txtCostoMaximo").removeClass("errorCampo");
                                this.msgCostoMax = "";
                            } else {
                                this.validCostoMax = false;
                                $("#txtCostoMaximo").addClass("errorCampo");
                                this.msgCostoMax = this.servicioTranslate_costoMaxM2;
                            }

                        } else {
                            this.validCostoMax = false;
                            $("#txtCostoMaximo").addClass("errorCampo");
                            this.msgCostoMax = this.servicioTranslate_costoMaxM2;
                        }
                    }

                }
            }

            if (this.validCostoMax && this.validCostoMin) {
                this.validarRangoCostos();
            }
        }
    }

    //Funcion para validar rangos del campo duracion
    validarRangoDuracion() {
        this.validRangoDuracion = true;
        if (this.servicio.duracion != "") {
            if (parseInt(this.servicio.duracion, 10) >= 10 && parseInt(this.servicio.duracion, 10) <= 480) {
                this.msgDuracion = "";
                this.validRangoDuracion = true;
                $("#txtDuracion").removeClass("errorCampo");
            } else {
                this.msgDuracion = this.servicioTranslate_rangoDuracion;
                this.validRangoDuracion = false;
                $("#txtDuracion").addClass("errorCampo");
            }
        } else {
            this.msgDuracion = "";
            this.validRangoDuracion = true;
        }
    }

    //Funcion para validar rangos del campo costos
    validarRangoCostos() {
        var costoMinimo = this.servicio.costoMinimo;
        costoMinimo = costoMinimo != null ? costoMinimo.toString() : "";
        var costoMaximo = this.servicio.costoMaximo;
        costoMaximo = costoMaximo != null ? costoMaximo.toString() : "";

        this.validRangoCostoMax = true;
        var validCostoMax = false;

        if (this.servicio.costoTipo == 2) {
            if (costoMaximo == "") {
                validCostoMax = true;
            } else {
                validCostoMax = false;
            }
        } else {
            validCostoMax = false;
        }
        if (this.servicio.costoTipo != 2){
            if (costoMinimo != "") {
                if (validCostoMax || (parseFloat(costoMaximo) > parseFloat(costoMinimo))) {
                    this.validRangoCostoMax = true;
                    this.msgCostoMax = "";
                    $("#txtCostoMaximo").removeClass("errorCampo");
                } else {
                    this.msgCostoMax = this.servicioTranslate_rangoCostos;
                    this.validRangoCostoMax = false;
                    $("#txtCostoMaximo").addClass("errorCampo");
                }
            }
        }
    }

    //Funcion para validar rangos del campo tiempo disponible
    validarRangoTiempoDisponible() {
        if (this.servicio.libre && this.servicio.tiempoDisponible !== "") {
            this.validRangoTiempoDisponible = true;
            if (this.servicio.tiempoDisponible == "" || (parseInt(this.servicio.duracion, 10) > parseInt(this.servicio.tiempoDisponible, 10))) {
                this.msgTiempoDisponible = "";
                this.validRangoTiempoDisponible = true;
                $("#txtTiempoDisponible").removeClass("errorCampo");
                this.validarMinimoTiempoDisponible();
            } else {
                this.msgTiempoDisponible = this.servicioTranslate_rangoTiempo;
                this.validRangoTiempoDisponible = false;
                $("#txtTiempoDisponible").addClass("errorCampo");
            }
        } else {
            this.msgTiempoDisponible = "";
            this.validRangoTiempoDisponible = true;
        }
    }

    //Funcion para validar valor minimo del tiempo disonible
    validarMinimoTiempoDisponible() {
        if (this.servicio.libre && parseInt(this.servicio.tiempoDisponible, 10) == 0) {
            this.msgTiempoDisponible = this.servicioTranslate_tiempoDisponibleM;
            this.validMinimoTiempoDisponible = false;
            $("#txtTiempoDisponible").addClass("errorCampo");
        } else {
            this.msgTiempoDisponible = "";
            this.validMinimoTiempoDisponible = true;
            $("#txtTiempoDisponible").removeClass("errorCampo");
        }
    }

    //Funcion para validar que no haya nombres repetidos
    validarNombreRepetido() {
        this.validNombre = true;
        if (this.servicio.nombre != "") {
            if (this.accion == "Nuevo") {
                for (var i = 0; i < this.servicio.dataServicios.length; i++) {
                    if (this.servicio.dataServicios[i].nombre == this.servicio.nombre) {
                        this.validNombre = false;
                        this.msgNombre = this.servicioTranslate_nombreRepetido;
                        $("#txtNombre").addClass("errorCampo");
                        break;
                    } else {
                        this.validNombre = true;
                    }
                }
            } else if (this.accion == "Actualizar") {
                for (var i = 0; i < this.servicio.dataServicios.length; i++) {
                    if (this.servicio.dataServicios[i].nombre == this.servicio.nombre && this.servicio.dataServicios[i].idServicio != this.servicio.idServicio) {
                        this.validNombre = false;
                        this.msgNombre = this.servicioTranslate_nombreRepetido;
                        $("#txtNombre").addClass("errorCampo");
                        break;
                    } else {
                        this.validNombre = true;
                    }
                }
            }
            if (this.validNombre) {
                this.msgNombre = "";
                $("#txtNombre").removeClass("errorCampo");
            }

        }
    }

    //Funcion para agregar un nuevo servicio
    servicio_guardarServicio(idServicio: any, tipo: any) {
        this._pantallaServicio.mostrarSpinner();
        
        this.guardar = true;
        //$("#blockScreen").show();
        if (this.servicio.libre) {
            this.guardarTDisponible = true;
        }
        if (this.servicio.costoTipo != "" && this.servicio.costoTipo != null) {
            this.guardarCostoTipo = true;
        }
        this.cambioServicio = false;
        if (idServicio != undefined) {
            this.servicio_descartaNuevo("CambioServicio");
            if (this.cambioServicio) {
                this.cargarServicio(idServicio);
            }
        }
        if (!this.cambioServicio) {

            this.validarCamposRequeridos();
            this.validarRangoDuracion();
            this.validarNombreRepetido();
            //this.validarRangoTiempoDisponible();
            this.servicio_validFlotantes();


            if (this.contRequeridos == 0 && this.validRangoDuracion && this.validCostoMax && this.validCostoMin && this.validNombre) {
                if (this.validRangoCostoMax && this.validRangoTiempoDisponible && this.validMinimoTiempoDisponible) {
                    var params: any = {};
                    params.nombre = this.servicio.nombre.replace(/</g, "&lt;");;
                    params.duracion = this.servicio.duracion;
                    params.costoTipo = this.servicio.costoTipo;
                    params.costoMin = this.servicio.costoMinimo;
                    if (this.servicio.costoMaximo != "") {
                        params.costoMax = this.servicio.costoMaximo;
                    } else {
                        params.costoMax = "";
                    }

                    params.idClaveProdServ = this.servicio.idClaveProdServ;
                    if (params.idClaveProdServ == "" || params.idClaveProdServ == undefined || params.idClaveProdServ == null) {
                        params.idClaveProdServ = 97;
                    }
                    params.idUnidadMedida = this.servicio.idUnidadMedida;
                    if (params.idUnidadMedida == "" || params.idUnidadMedida == undefined || params.idUnidadMedida == null) {
                        params.idUnidadMedida = 1;
                    }
                    
                    if (this.servicio.libre) {
                        params.tiempoDisponible = this.servicio.duracion;
                    } else {
                        params.tiempoDisponible = 0;
                    }
                    params.esPrivado = !this.servicio.esPrivado;
                    params.esLink = this.servicio.esLink;
                    params.pagoPaypal = this.servicio.pagoPaypal;
                    params.iva = this.servicio.iva;
                    params.esFrecuente = this.servicio.esFrecuente;

                    this._backService.HttpPost("catalogos/servicio/guardarServicio", {}, params).subscribe((response: string) => {
                        this.servicio.idServicio = eval(response);
                        if (tipo) {
                            var tam = this.etiqueta.dataServicioEtiquetas.length;
                            var idEtiquetas: any[] = [];

                            for (var i = 0; i < tam; i++) {
                                params.idEtiqueta = this.etiqueta.dataServicioEtiquetas[i].idEtiqueta;
                                idEtiquetas.push(params.idEtiqueta);
                                params = new Object();
                            }

                            this.leerEtiquetas(this.servicio.idServicio, idEtiquetas, false);
                            this.etiqueta.etiquetaGuardada = true;
                        }

                        if (idServicio == "agenda") {
                            this._pantallaServicio.ocultarSpinner();
                            this.validDescartar = true;
                            this._router.navigate(['/procesos/agenda']);
                        } else {
                            this._pantallaServicio.ocultarSpinner();
                            this.consultarServicios(idServicio);
                                    
                            $('#btnGuardar').css('pointer-events', 'visible');
                            $('#btnDescartar').css('pointer-events', 'visible');
                        }
                    
                    }, error => {
                        this._router.navigate(['/login']);
                    });
                } else {
                    $('#divServicios').css('pointer-events', 'visible');
                    $('#btnGuardar').css('pointer-events', 'visible');
                    $('#btnDescartar').css('pointer-events', 'visible');
                    $("#btnGuardar").removeClass("icon");
                    this._pantallaServicio.ocultarSpinner();
                    $("#btnGuardar").removeClass("loading");
                }
            } else {
                $('#divServicios').css('pointer-events', 'visible');
                $('#btnGuardar').css('pointer-events', 'visible');
                $('#btnDescartar').css('pointer-events', 'visible');
                $("#btnGuardar").removeClass("icon");
                this._pantallaServicio.ocultarSpinner();
                $("#btnGuardar").removeClass("loading");
            }
        } else {
            $("#btnGuardar").removeClass("loading");
            if (idServicio == "agenda") {
                $("#btnGuardar").removeClass("icon");
                this._pantallaServicio.ocultarSpinner();
                this.validDescartar = true;
                this._router.navigate(['/procesos/agenda']);
            }
        }
    }

    //Funcion para actualizar el servicio seleccionado
    servicio_actualizarServicio(idServicio: any) {
        this._pantallaServicio.mostrarSpinner();

        this.guardar = true;
        if (this.servicio.libre) {
            this.guardarTDisponible = true;
        }
        if (this.servicio.costoTipo != "" && this.servicio.costoTipo != null) {
            this.guardarCostoTipo = true;
        }
        $('#btnNuevo').css("pointer-events", "none");
        this.validarCamposRequeridos();
        this.validarRangoDuracion();
        this.validarNombreRepetido();
        this.servicio_validFlotantes();

        if (this.contRequeridos == 0 && this.validRangoDuracion && this.validCostoMax && this.validCostoMin && this.validNombre) {
            if (this.validRangoCostoMax && this.validRangoTiempoDisponible && this.validMinimoTiempoDisponible) {
                var params: any = {};
                params.idServicio = this.servicio.idServicio;
                params.nombre = this.servicio.nombre.replace(/</g, "&lt;");;
                params.duracion = this.servicio.duracion;
                params.costoTipo = this.servicio.costoTipo;
                params.costoMin = this.servicio.costoMinimo;
                params.costoMax = this.servicio.costoMaximo;

                params.idClaveProdServ = this.servicio.idClaveProdServ;
                if (params.idClaveProdServ == "" || params.idClaveProdServ == undefined || params.idClaveProdServ == null) {
                    params.idClaveProdServ = 97;
                }
                params.idUnidadMedida = this.servicio.idUnidadMedida;
                if (params.idUnidadMedida == "" || params.idUnidadMedida == undefined || params.idUnidadMedida == null) {
                    params.idUnidadMedida = 1;
                }

                if (this.servicio.libre) {
                    params.tiempoDisponible = this.servicio.duracion;
                } else {
                    params.tiempoDisponible = 0;
                }
                params.esPrivado = !this.servicio.esPrivado;
                params.esLink = this.servicio.esLink;
                params.pagoPaypal = this.servicio.pagoPaypal;
                params.iva = this.servicio.iva;
                params.esFrecuente = this.servicio.esFrecuente;

                this._backService.HttpPost("catalogos/servicio/actualizarServicio", {}, params).subscribe((response: string) => {
                    if (idServicio == "changeState") {
                        this.validDescartar = true;
                        this._pantallaServicio.ocultarSpinner();
                        $("#btnGuardar").removeClass("icon");
                        this._router.navigate(['/' + this.rootScope_toState]);
                    } else if (idServicio == "agenda") {
                        this._pantallaServicio.ocultarSpinner();
                        $("#btnGuardar").removeClass("icon");
                        this.validDescartar = true;
                        this._router.navigate(['/procesos/agenda']);
                    } else if (idServicio == "Nuevo") {
                        this._pantallaServicio.ocultarSpinner();
                        this.nuevoServicio();
                    } else {
                        this._pantallaServicio.ocultarSpinner();
                        this.consultarServicios(idServicio);
                    }
                    this._toaster.success("Servicio Actualizado");
                }, error => {
                    this._router.navigate(['/login']);
                });
            }
            else {
                $('#divServicios').css('pointer-events', 'visible');
                $('#btnNuevo').css('pointer-events', 'visible');
                $('#btnGuardar').css('pointer-events', 'visible');
                $('#btnDescartar').css('pointer-events', 'visible');
                $("#btnGuardar").removeClass("icon");
                this._pantallaServicio.ocultarSpinner();
                this.stopChange = true;
                $("#btnGuardar").removeClass("loading");
            }
        }
        else {
            $('#divServicios').css('pointer-events', 'visible');
            $('#btnNuevo').css('pointer-events', 'visible');
            $('#btnGuardar').css('pointer-events', 'visible');
            $('#btnDescartar').css('pointer-events', 'visible');
            $("#btnGuardar").removeClass("icon");
            this._pantallaServicio.ocultarSpinner();
            this.stopChange = true;
            $("#btnGuardar").removeClass("loading");
        }
    }

    //Funcion para actualizar el servicio seleccionado
    rootScope_actualizarServicio(idServicio: any) {
        this._pantallaServicio.mostrarSpinner();
        this.guardar = true;
        if (this.servicio.libre) {
            this.guardarTDisponible = true;
        }
        if (this.servicio.costoTipo != "" && this.servicio.costoTipo != null) {
            this.guardarCostoTipo = true;
        }
        $('#btnNuevo').css("pointer-events", "none");
        this.validarCamposRequeridos();
        this.validarRangoDuracion();
        this.validarNombreRepetido();
        this.servicio_validFlotantes();

        if (this.contRequeridos == 0 && this.validRangoDuracion && this.validCostoMax && this.validCostoMin && this.validNombre) {
            if (this.validRangoCostoMax && this.validRangoTiempoDisponible && this.validMinimoTiempoDisponible) {
                var params: any = {};
                params.idServicio = this.servicio.idServicio;
                params.nombre = this.servicio.nombre.replace(/</g, "&lt;");;
                params.duracion = this.servicio.duracion;
                params.costoTipo = this.servicio.costoTipo;
                params.costoMin = this.servicio.costoMinimo;
                params.costoMax = this.servicio.costoMaximo;

                params.idClaveProdServ = this.servicio.idClaveProdServ;
                if (params.idClaveProdServ == "" || params.idClaveProdServ == undefined || params.idClaveProdServ == null) {
                    params.idClaveProdServ = 97;
                }
                params.idUnidadMedida = this.servicio.idUnidadMedida;
                if (params.idUnidadMedida == "" || params.idUnidadMedida == undefined || params.idUnidadMedida == null) {
                    params.idUnidadMedida = 1;
                }

                if (this.servicio.libre) {
                    params.tiempoDisponible = this.servicio.duracion;
                } else {
                    params.tiempoDisponible = 0;
                }
                params.esPrivado = !this.servicio.esPrivado;
                params.esLink = this.servicio.esLink;
                params.pagoPaypal = this.servicio.pagoPaypal;
                params.iva = this.servicio.iva;
                params.esFrecuente = this.servicio.esFrecuente;

                this._backService.HttpPost("catalogos/servicio/actualizarServicio", {}, params).subscribe((response: string) => {
                    if (idServicio == "changeState") {
                        this.validDescartar = true;
                        this._pantallaServicio.ocultarSpinner();
                        $("#btnGuardar").removeClass("icon");
                        this._router.navigate(['/' + this.rootScope_toState]);
                    } else if (idServicio == "agenda") {
                        this._pantallaServicio.ocultarSpinner();
                        $("#btnGuardar").removeClass("icon");
                        this.validDescartar = true;
                        this._router.navigate(['/procesos/agenda']);
                    } else if (idServicio == "Nuevo") {
                        this._pantallaServicio.ocultarSpinner();
                        this.nuevoServicio();
                    } else {
                        this._pantallaServicio.ocultarSpinner();
                        this.consultarServicios(idServicio);
                    }
                }, error => {
                
                });
            }
            else {
                $('#divServicios').css('pointer-events', 'visible');
                $('#btnNuevo').css('pointer-events', 'visible');
                $('#btnGuardar').css('pointer-events', 'visible');
                $('#btnDescartar').css('pointer-events', 'visible');
                $("#btnGuardar").removeClass("icon");
                this._pantallaServicio.ocultarSpinner();
                this.stopChange = true;
                $("#btnGuardar").removeClass("loading");
            }
        }
        else {
            $('#divServicios').css('pointer-events', 'visible');
            $('#btnNuevo').css('pointer-events', 'visible');
            $('#btnGuardar').css('pointer-events', 'visible');
            $('#btnDescartar').css('pointer-events', 'visible');
            $("#btnGuardar").removeClass("icon");
            this._pantallaServicio.ocultarSpinner();
            this.stopChange = true;
            $("#btnGuardar").removeClass("loading");
        }
    }

    //Validacion si el servicio a borrar tiene citas programadas 
    servicio_validarCitasDetalle() {
        this.validCitas = false;
        var params: any = {};
        params.idServicio = this.servicio.idServicio;
        this._backService.HttpPost("catalogos/servicio/validarCitasDetalle", {}, params).subscribe((response: string) => {
            this.dataCitasDetalle = eval(response);
            if (this.dataCitasDetalle.length > 0) {
                this.validarCitas = false;
                this.modalConfirm2_mensaje = this.servicioTranslate_servicioTiene + this.dataCitasDetalle.length + this.servicioTranslate_citasProgramadas;
                this.modales.modalConfirm2.show();
            } else {
                this.validCitas = true;
                this.servicio_borrarServicio(false);
            }
        }, error => {
        
        });
    }

    //Funcion que confirma el borrado del servicio seleccionado
    confirmarBorrarServicio(idServicio: any) {
        if (this.servicio.dataServicios.length > 1) {
            this.servicio.idServicioSeleccionado = idServicio;
            this.modalConfirmEliminar_mensaje = this.servicioTranslate_deseaBorrar;
            this.modales.modalConfirmEliminar.show();
        } else {
            this.modalAlertBorrado_mensaje = this.servicioTranslate_seDebeTener;
            this.modales.modalAlertBorrado.show();
        }
    }

    //Funcion que da de baja el servicio seleccionado
    servicio_borrarServicio(bajaCita: any) {

        $('#btnNuevo').css('pointer-events', 'none');
        if (bajaCita == undefined || bajaCita == "") {
            bajaCita = false;
        }
        var params:any = {};
        params.idServicio = this.servicio.idServicioSeleccionado;
        params.bajaCita = bajaCita;
        
        if(bajaCita === true){
            this._backService.HttpPost("catalogos/servicio/borrarServicio", {}, params).subscribe((response: string) => {
                this.servicio_validarPromocionServicio();
                this.inicializarValores();
                if (this.accion == "Actualizar") {
                    if (this.servicio.idServicioSeleccionado == this.servicio.idServicio) {
    
                        this.primeraCarga = true;
                    }
                    this.consultarServicios("Borrar");
                } else if (this.accion == "Nuevo") {
                    this.consultarServicios("Nueva");
    
                }
            }, error => {
            
            });
        }
        
    }

    //ETIQUETAS
    consultaEtiquetas(tipo: any) {
        this._backService.HttpPost("catalogos/servicio/consultaEtiquetas", {}, {}).subscribe((response: string) => {
            this.etiqueta.dataEtiquetas = eval(response);
            this.etiqueta.dataEtiquetasTemp = Object.assign([], this.etiqueta.dataEtiquetas);
            this.etiqueta.dataEtiquetasCopia = Object.assign([], this.etiqueta.dataEtiquetas);

            if (this.etiqueta.dataEtiquetasCopia.length % 2 == 0) {
                var len = this.etiqueta.dataEtiquetasCopia.length;
            }
            else {
                var len = this.etiqueta.dataEtiquetasCopia.length + 1;
            }
            this.modalStyle = {
                "height": (((len / 2) * 30) + 30).toString() + "px"
            }

            if (tipo) {
                this.multiSelResources = [];
                this.multiSelModel = [];

                this.etiqueta.dataEtiquetas.forEach((elem: any, index: any, array: any) => {
                    if (elem.cantidad > 0) {
                        this.multiSelResources.push({ id: elem.idEtiqueta, label: elem.nombre, index: index });
                    }
                });

                // this.multiSelModel = Object.assign([], this.multiSelResources);
                this.multiSelModel = [...this.multiSelResources];
            }

            if (this.servicioSeleccionado != "N") {
                this.consultaServicioEtiquetas(this.servicio.idServicio);
            }
        }, error => {
        
        });
    }

    addFilter(idEtiqueta: any, nombre: any) {
        this.multiSelModel = [];
        // this.multiSelModel.push({ id: idEtiqueta });
        this.multiSelModel = [...this.multiSelModel, { id: idEtiqueta }];
    }

    consultaServicioEtiquetas(idServicio: any) {
        this.etiqueta.etiquetaSeleccionada = "";
        var params = {
            idServicio: null
        };
        params.idServicio = idServicio;
        if (idServicio != "Nuevo") {
    
            this._backService.HttpPost("catalogos/servicio/consultaServicioEtiquetas", {}, params).subscribe((response: string) => {
                
                this.etiqueta.dataServicioEtiquetas = eval(response);
                var copia = Object.assign([], this.etiqueta.dataServicioEtiquetas)
                //var copia = angular.copy(this.etiqueta.dataServicioEtiquetas);
    
                this.etiqueta.dataEtiquetas = this.etiqueta.dataEtiquetasTemp;
    
                this.etiqueta.dataEtiquetas = this.etiqueta.dataEtiquetas.filter((e: any) => { 
                    //return this.findIndex(i => i.idEtiqueta == e.idEtiqueta) < 0;
                    var found = this.etiqueta.dataServicioEtiquetas.some(function (item: any, index: any) {
                        return item.idEtiqueta == e.idEtiqueta;
                    });
    
                    if (found) {
                        return false;
                    }
                    else {
                        return true;
                    }
                });
    
                this.etiqueta.dataServicioEtiquetasCopia = Object.assign([], this.etiqueta.dataServicioEtiquetas);
                //this.etiqueta.dataServicioEtiquetasCopia = angular.copy(this.etiqueta.dataServicioEtiquetas);
                this.etiqueta.dataEtiquetasFiltro = Object.assign([], this.etiqueta.dataEtiquetas);
    
            }, error => {
            
            });
        }
        else {
            this.etiqueta.dataServicioEtiquetas = [];
        }
    }

    guardarEtiqueta() {
        this.idEtiquetaSeleccionada = "";

        if (typeof this.etiqueta.etiquetaSeleccionada === 'object') {
            for (var i = 0; i < this.etiqueta.dataEtiquetas.length; i++) {
                if (this.etiqueta.dataEtiquetas[i].idEtiqueta == this.etiqueta.etiquetaSeleccionada.idEtiqueta) {
                    this.etiqueta.dataServicioEtiquetas.push({ idServicio: this.servicio.idServicio, idEtiqueta: this.etiqueta.dataEtiquetas[i].idEtiqueta, nombre: this.etiqueta.dataEtiquetas[i].nombre });
                    this.etiqueta.dataEtiquetas.splice(i, 1);
                    this.etiqueta.etiquetaSeleccionada = "";
                    this.etiqueta.etiquetaGuardada = false;

                    this.etiqueta.dataEtiquetasFiltro = Object.assign([], this.etiqueta.dataEtiquetas);
                }
            }
        }
        else {
            var campoIgual = false;
            for (var i = 0; i < this.etiqueta.dataEtiquetas.length; i++) {
                if (this.etiqueta.dataEtiquetas[i].nombre.toUpperCase() == this.etiqueta.etiquetaSeleccionada.toUpperCase()) {
                    campoIgual = true;
                    this.idEtiquetaSeleccionada = this.etiqueta.dataEtiquetas[i].idEtiqueta;
                }
            }
            if (campoIgual) {
                for (var i = 0; i < this.etiqueta.dataEtiquetas.length; i++) {
                    if (this.etiqueta.dataEtiquetas[i].idEtiqueta == this.idEtiquetaSeleccionada) {
                        this.etiqueta.dataServicioEtiquetas.push({ idServicio: this.servicio.idServicio, idEtiqueta: this.etiqueta.dataEtiquetas[i].idEtiqueta, nombre: this.etiqueta.dataEtiquetas[i].nombre });
                        this.etiqueta.dataEtiquetas.splice(i, 1);
                        this.etiqueta.etiquetaGuardada = false;
                        this.etiqueta.etiquetaSeleccionada = "";

                        this.etiqueta.dataEtiquetasFiltro = Object.assign([], this.etiqueta.dataEtiquetas);
                    }
                }
            }
            else {
                if (this.etiqueta.etiquetaSeleccionada != "") {
                    var params: any = {};
                    params.nombre = this.etiqueta.etiquetaSeleccionada;
                    this._backService.HttpPost("catalogos/servicio/guardarEtiqueta", {}, params).subscribe((response: string) => {
                        var evalData = eval(response);
                        this.etiqueta.dataEtiquetasCopia.push(evalData[0]);
                        this.etiqueta.dataEtiquetasTemp.push({ idEtiqueta: evalData[0].idEtiqueta, nombre: evalData[0].nombre });
                        this.etiqueta.dataServicioEtiquetas.push({ idServicio: this.servicio.idServicio, idEtiqueta: evalData[0].idEtiqueta, nombre: evalData[0].nombre });
                        this.etiqueta.etiquetaSeleccionada = "";
                        this.etiqueta.etiquetaGuardada = false;
                        var index = 0;
                        if (this.multiSelResources.length > 1) {
                            index = this.multiSelResources[this.multiSelResources.length - 1].index + 1;
                        }
                        else {
                            index = 0;
                        }
                        this.multiSelResources.push({ id: evalData[0].idEtiqueta, label: evalData[0].nombre, index: index });
                        this.multiSelModel = [...this.multiSelResources];
                    
                    }, error => {
                    
                    });
                }
            }
        }
    }

    eliminarEtiquetaServicio(idEtiqueta: any) {
        for (var i = 0; i < this.etiqueta.dataServicioEtiquetas.length; i++) {
            if (this.etiqueta.dataServicioEtiquetas[i].idEtiqueta == idEtiqueta) {
                this.etiqueta.dataServicioEtiquetas.splice(i, 1);
            }
        }

        this.etiqueta.etiquetaGuardada = false;

        this.etiqueta.dataEtiquetas = this.etiqueta.dataEtiquetasTemp;
        this.etiqueta.dataEtiquetas = this.etiqueta.dataEtiquetas.filter((e: any) => { 
            //return this.findIndex(i => i.idEtiqueta == e.idEtiqueta) < 0;
            var found = this.etiqueta.dataServicioEtiquetas.some(function (item: any, index: any) {
                return item.idEtiqueta == e.idEtiqueta;
            });

            if (found) {
                return false;
            }
            else {
                return true;
            }
        });

        this.etiqueta.dataEtiquetasFiltro = Object.assign([], this.etiqueta.dataEtiquetas);
    }

    eliminarEtiqueta() {
        var params: any = {};
        params.idEtiqueta = this.etiquetaAEliminar;

        this._backService.HttpPost("catalogos/cliente/eliminarEtiqueta", {}, params).subscribe((response: string) => {
	
            for (var i = 0; i < this.etiqueta.dataEtiquetasCopia.length; i++) {
                if (this.etiqueta.dataEtiquetasCopia[i].idEtiqueta == this.etiquetaAEliminar) {
                    this.etiqueta.dataEtiquetasCopia.splice(i, 1);
                }
            }
            for (var i = 0; i < this.etiqueta.dataEtiquetas.length; i++) {
                if (this.etiqueta.dataEtiquetas[i].idEtiqueta == this.etiquetaAEliminar) {
                    this.etiqueta.dataEtiquetas.splice(i, 1);
                }
            }
            this.etiqueta.dataEtiquetasFiltro = Object.assign([], this.etiqueta.dataEtiquetas);
            for (var i = 0; i < this.etiqueta.dataEtiquetasTemp.length; i++) {
                if (this.etiqueta.dataEtiquetasTemp[i].idEtiqueta == this.etiquetaAEliminar) {
                    this.etiqueta.dataEtiquetasTemp.splice(i, 1);
                }
            }
            for (var i = 0; i < this.etiqueta.dataServicioEtiquetas.length; i++) {
                if (this.etiqueta.dataServicioEtiquetas[i].idEtiqueta == this.etiquetaAEliminar) {
                    this.etiqueta.dataServicioEtiquetas.splice(i, 1);
                }
            }
            if (this.etiqueta.dataEtiquetasCopia.length % 2 == 0) {
                var len = this.etiqueta.dataEtiquetasCopia.length;
            }
            else {
                var len = this.etiqueta.dataEtiquetasCopia.length + 1;
            }
            this.modalStyle = {
                "height": (((len / 2) * 30) + 30).toString() + "px"
            }

            this.multiSelResources = [];
            this.multiSelModel = [];

            this.etiqueta.dataEtiquetasCopia.forEach((elem: any, index: any, array: any) => {
                this.multiSelResources.push({ id: elem.idEtiqueta, label: elem.nombre, index: index });
            });

            //this.multiSelModel = Object.assign([], this.multiSelResources);
            this.multiSelModel = [...this.multiSelResources];
        
        }, error => {
        
        });
    }

    abrirModalEtiquetas() {
        this.modales.modalEtiquetas.show();
    }

    cerrarModalEtiquetas() {
        this.modales.modalEtiquetas.hide();
    }

    modalEliminarEtiqueta(idEtiqueta: any) {
        this.etiquetaAEliminar = idEtiqueta;
        this.modalEliminarEtiqueta_mensaje = "¿Desea eliminar el grupo?";
        this.modales.modalEliminarEtiqueta.show();
    }

    //Funcion para validar si el servicios a borrar tiene promociones 
    servicio_validarPromocionServicio() {
        var params: any = {};
        params.idServicio = this.servicio.idServicio;

        this._backService.HttpPost("catalogos/servicio/validarPromocionServicio", {}, params).subscribe((response: string) => {

        }, error => {
        
        });
    }

    //Valida el si el servicio es el unico que tiene la cita para cancelarla o no
    servicio_validarCitas() {
        for (var i = 0; i < this.dataCitasDetalle.length; i++) {
            var params: any = {};
            params.idServicio = this.servicio.idServicio;
            params.idCita = this.dataCitasDetalle[i].idCita;
            this._backService.HttpPost("catalogos/servicio/validarCitas", {}, params).subscribe((response: string) => {
                this.dataCitas = eval(response);
                this.numCitas = this.dataCitas.length;
                this.servicio_cancelarCitas();
            }, error => {
            
            });
        }
        this.servicio_borrarServicio(true);        
    }

    //Obtiene las clavesProductoServicio dependiendo del rubro de la empresa
    cargarCPS() {
        var params = {};
        this._backService.HttpPost("catalogos/servicio/cargarCPS", {}, params).subscribe((response: string) => {
            this.dataCPS = eval(response);
        }, error => {
        
        });
    }

    //Obtiene las unidades de medida
    cargarUnidadMedida() {
        var params = {};
        this._backService.HttpPost("catalogos/servicio/cargarUnidadMedida", {}, params).subscribe((response: string) => {
            this.dataUnidadMedida = eval(response);
        }, error => {
        
        });
    }

    //Ejecuta la cancelacion de la cita en caso de que el servicio a eliminar sea el unico asignado a esa cita 
    servicio_cancelarCitas() {
        if (this.numCitas == 1) {
            var params: any = {};
            params.idServicio = this.servicio.idServicio;

            this._backService.HttpPost("catalogos/servicio/cancelarCitas", {}, params).subscribe((response: string) => {

            }, error => {
            
            });
        }
    }

    //Funcion para validar los errores 
    onFocusTxt(elemento: any) {
        if (this.guardar) {
            switch (elemento) {
                case "txtNombre":
                    if (this.validNombre || this.validNombre == undefined) {
                        $("#" + elemento).removeClass("errorCampo");
                    }
                    break;
                case "txtDuracion":
                    if (this.validRangoDuracion || this.validRangoDuracion == undefined) {
                        $("#" + elemento).removeClass("errorCampo");
                    }
                    break;
                case "txtTiempoDisponible":
                    if (this.servicio.libre) {
                        if (this.validRangoTiempoDisponible || this.validRangoTiempoDisponible == undefined) {
                            if (this.validMinimoTiempoDisponible) {
                                $("#" + elemento).removeClass("errorCampo");
                            }
                        }
                    }
                    break;
                case "txtCostoMinimo":
                    if (this.servicio.costoTipo != "" && this.servicio.costoTipo != null) {
                        if (this.validCostoMin || this.validCostoMin == undefined) {
                            $("#" + elemento).removeClass("errorCampo");
                        }
                    }
                    break;
                case "txtCostoMaximo":
                    if (this.servicio.costoTipo == 1 || this.servicio.costoTipo == 3) {
                        if (this.validCostoMax || this.validCostoMax == undefined) {
                            if (this.validRangoCostoMax || this.validRangoCostoMax == undefined) {
                                $("#" + elemento).removeClass("errorCampo");
                            }
                        }
                    }
                    break;

                default:
                    $("#" + elemento).removeClass("errorCampo");
                    break;
            }
        }
    }

    //Funcion para validar los errores
    onBlurTxt(id: any) {
        if (this.guardar) {
            var elem: any = document.getElementById(id);
            if (elem.value == "") {
                if (id != "txtTiempoDisponible") {
                    if (id != "txtCostoMinimo") {
                        if (id != "txtCostoMaximo") {
                            $("#" + id).addClass("errorCampo");
                        } else if ((this.servicio.costoTipo == 1 || this.servicio.costoTipo == 3) && this.guardarCostoTipo) {
                            $("#" + id).addClass("errorCampo");
                        }
                    } else if (this.guardarCostoTipo) {
                        $("#" + id).addClass("errorCampo");
                    }
                } else if (this.guardarTDisponible) {
                    $("#" + id).addClass("errorCampo");
                }
            }
        }
    }

    //Funcion para validar los errores
    onClickDdl(id: any) {
        //this.elementoDdl = id;
        if (this.guardar) {
            $("#" + id + " > div:first-child").attr("style", "outline: none;");
            //elem.removeClass("errorCampo");
        }
    }

    // Funciones nuevas
    seleccionarGrupos(opcion: any) {
        if(opcion == 0){
            
        }

        if(opcion == 1){
            this.multiSelModel = [...this.multiSelResources];
        }

        if(opcion == 2){
            this.multiSelModel = [];
        }

        this.primeraCarga = true;
        this.consultarServicios(null);
    }

    filtroEtiquetas() {
        if (typeof this.etiqueta.etiquetaSeleccionada !== 'string') {
            return;
        }
      
        this.etiqueta.dataEtiquetasFiltro = this.etiqueta.dataEtiquetas.filter(
            (eti: any) => {
                if (eti.nombre.toUpperCase().match(this.etiqueta.etiquetaSeleccionada.toUpperCase()) != null) {
                    return eti;
                }
            }
        );
    }
  
    displayEtiquetas(item: any) {
        return item ? item.nombre : '';
    }

    //Funcion para validar los errores
    // $on('uiSelect:open', function (evt, opened) {
    //     if (this.guardar) {
    //         if (!opened) {
    //             if (this.servicio.costoTipo != null) {
    //                 $("#ddlCostoTipo > div:first-child").attr("style", "outline: none;");
    //             } else {
    //                 $("#ddlCostoTipo > div:first-child").attr("style", "outline: red solid 1px !important");
    //             }
    //         }
    //     }
    // });

    //Declaracion de popovers  ------------------------------------
    // $("#pop2").popover({
    //     html: true,
    //     animation: false,
    //     content: this.servicioTranslate_infTiempoDisponible'),
    //     placement: "right"
    // });

    // $("#pop3").popover({
    //     html: true,
    //     animation: false,
    //     content: this.servicioTranslate_serviciosMasReq'),
    //     placement: "right"
    // });
    //-----------------------------------------------------------------

    //Funcion para cerrar los popovers
    // $('html').on('mouseup', function (e) {
    //     if (!$(e.target).closest('.popover').length) {
    //         $('.popover').each(function () {
    //             $(this.previousSibling).popover('hide');
    //         });
    //     }
    // });


    // ------------------------------------------------------------------------------------------- //
    // ---------------------------------------- Paquetes ----------------------------------------- //
    // ------------------------------------------------------------------------------------------- //


    // ----------------------------------- Declaracion de variables ----------------------------------- 
    paquetes: any = {
        dataServicios: [],
        dataProductos: [],
        periodos: [
            { meses: 1 },
            { meses: 3 },
            { meses: 6 },
            { meses: 12 },
            { meses: 18 },
            { meses: 24 }
        ]
    };
    listCantServicios: any[] = []; 
    listCantProductos: any[] = []; 
    arrayCantServicios: any[] = []; 
    arrayCantProductos: any[] = []; 

    servValido: any = true;
    prodValido: any = true;
    camposCompletos: any = false;

    dataCostoTipoP: any[] = [];
    dataServPaquete: any[] = [];
    dataProdServ: any[] = [];
    dataPaquetes: any[] = [];
    dataPaquetesOr: any[] = [];
    dataPaquetes2: any[] = [];

    respuesta: any = {};
    inputBusquedaPaquete: any = "";

    // $('#promociones').show();
    // $('#paquetes').hide();
    // $('#liPromociones').addClass('tab-pane fade in active');
    // $('#liPaquetes').removeClass('active');

    // $("#aServicios").click(function () {
    //     rootScope_promocionPestaniaActual = "#aPromociones";
    //     $('#servicios').show();
    //     $('#paquetes').hide();
    //     $("#v").addClass('tab-pane fade in active');
    //     $("#liPaquetes").removeClass('active');
    // });
    // $("#aPaquetes").click(function () {
    //     rootScope_promocionPestaniaActual = "#aPaquetes";
    //     $('#servicios').hide();
    //     $('#paquetes').show();
    //     $("#liServicios").removeClass('active');
    //     $("#liPaquetes").addClass('tab-pane fade in active');
    // });


    // ----------------------------------- Declaracion de funciones ----------------------------------- 
    inicializarPaquetes() {
        this.paquetes.nombre = "";
        this.paquetes.precioParcial = null;
        this.paquetes.precioCompleto = null;
        this.paquetes.vigente = true;
        this.paquetes.periodoVigencia = 1;
        this.paquetes.idCostoTipo = null;
        this.paquetes.productos = []; //Contiene el id de los productos
        this.paquetes.servicios = []; //Contiene el id de los servicios
        this.paquetes.idPaquete = 0;
        this.listCantServicios = []; //Contiene cant por cada servicio
        this.listCantProductos = []; //Contiene cant por cada producto
        this.arrayCantServicios = []; //Arreglo que se manda al ws
        this.arrayCantProductos = []; //Arreglo que se manda al ws

        $("#txtDescripcion").removeClass("errorCampo");
        $("#ddlCostoTipoP > div:first-child").attr("style", "outline: none;");
        $("#txtCostoCompleto").removeClass("errorCampo");
        $("#txtCostoParcial").removeClass("errorCampo");
        $("#txtCostoParcial").removeClass("errorCampo");
        $("#txtCostoCompleto").removeClass("errorCampo");
        $("#txtErrorDdlServicios").hide();
        $("#txtErrorCantServicios").hide();
        $("#txtErrorDdlServicios").removeClass("errorCampo");
        $("#txtErrorCantServicios").removeClass("errorCampo");
        $("#txtErrorDdlProductos").hide();
        $("#txtErrorCantProd").hide();
        $("#txtErrorDdlProductos").removeClass("errorCampo");
        $("#txtErrorCantProd").removeClass("errorCampo");
    }

    //Consulta de costo tipo
    consultaPaqueteCostoTipo() {
        var params = {};
        this._backService.HttpPost("catalogos/promocion/consultarPaqueteCostoTipo", {}, params).subscribe((response: string) => {
            this.dataCostoTipoP = eval(response);
        }, error => {
        
        });
    }

    editarPaquete(idPaquete: any) {
        this.inicializarPaquetes();
        var params: any = {};
        params.idPaqueteSucursal = idPaquete;

        this._backService.HttpPost("catalogos/promocion/cargarServPaquete", {}, params).subscribe((response: string) => {
            this.dataServPaquete = eval(response);
            for (var i = 0; i < this.dataServPaquete.length; i++) {
                this.paquetes.servicios.push(this.dataServPaquete[i].idServicio);
                //this.listCantServicios.push(this.dataServPaquete[i].cantServ);
            }
            this.paquetes.servicios = [...this.paquetes.servicios];
            this.listCantServicios = Object.assign([], this.dataServPaquete);

            this._backService.HttpPost("catalogos/promocion/cargarProdPaquete", {}, params).subscribe((response: string) => {
                this.dataProdServ = eval(response);
                for (var i = 0; i < this.dataProdServ.length; i++) {
                    this.paquetes.productos.push(this.dataProdServ[i].idInventarioPresentacion);
                }
                this.listCantProductos = Object.assign([], this.dataProdServ);
            }, error => {
            
            });
        }, error => {
        
        });

        for (var i = 0; i < this.dataPaquetes.length; i++) {
            if (this.dataPaquetes[i].idPaqueteSucursal == idPaquete) {
                this.paquetes.idPaquete = idPaquete;
                this.paquetes.nombre = this.dataPaquetes[i].nombre;
                this.paquetes.precioCompleto = this.dataPaquetes[i].precioCompleto;
                this.paquetes.precioParcial = this.dataPaquetes[i].precioParcial;
                this.paquetes.vigente = this.dataPaquetes[i].vigente;
                this.paquetes.periodoVigencia = this.dataPaquetes[i].periodoVigencia;
                this.paquetes.idCostoTipo = this.dataPaquetes[i].idPaqueteCostoTipo;
            }
        }
    }

    cargarListadoPaquetes() {
        this._backService.HttpPost("catalogos/promocion/cargarPaquetes", {}, {}).subscribe((response: string) => {
            this.dataPaquetes = eval(response);
            var j = 0;
            for (var i = 0; i < this.dataPaquetes.length; i++) {
                this.dataPaquetes[i].nombre = (this.dataPaquetes[i].nombre).replace(/&lt;/g, "<");
                if (j < this.servicio.claseColor.length) {
                    this.dataPaquetes[i].claseColor = this.servicio.claseColor[j];
                    j++;
                } else {
                    j = 0;
                    this.dataPaquetes[i].claseColor = this.servicio.claseColor[j];
                    j++;
                }
            }
            this.dataPaquetesOr = Object.assign([], this.dataPaquetes);
        
        }, error => {
        
        });
    }
    
    guardarPaquete() {
        this._pantallaServicio.mostrarSpinner();
        $('#btnGuardarPaquetes').addClass('disabled');
        var params: any = {};
        //Validaciones
        this.validarServiciosProductos();
        this.validarCampos();
        if (this.servValido && this.prodValido && this.camposCompletos) {
            if (this.paquetes.idPaquete != 0) {
                this._pantallaServicio.ocultarSpinner();
                var nombrePaqueteOld = "";
                for (var i = 0; i < this.dataPaquetes.length; i++) {
                    if (this.dataPaquetes[i].idPaqueteSucursal == this.paquetes.idPaquete) {
                        nombrePaqueteOld = (this.dataPaquetes[i].nombre).replace(/&lt;/g, "<");
                    }
                }
                var nombrePaqueteUpd = this.paquetes.nombre;
                if (nombrePaqueteOld != nombrePaqueteUpd) {
                    this.modalActualizarPaquete_mensaje = "Al editar el nombre del Paquete,se editaran en todas las citas anteriores";
                    this.modales.modalActualizarPaquete.show();
                }
                else {
                    this.actualizarPaquete();
                }
            } else {
                if (this.paquetes.vigente == true) {
                    params.nombre = this.paquetes.nombre;
                    params.precioParcial = this.paquetes.precioParcial;
                    params.precioCompleto = this.paquetes.precioCompleto != null ? this.paquetes.precioCompleto : 0;
                    params.idCostoTipo = this.paquetes.idCostoTipo;
                    params.vigente = this.paquetes.vigente;
                    params.periodoVigencia = this.paquetes.periodoVigencia;
                    params.servicios = this.paquetes.servicios;
                    params.productos = this.paquetes.productos;

                    this.arrayCantServicios = [];
                    for (var i = 0; i < this.listCantServicios.length; i++) {
                        this.arrayCantServicios.push(this.listCantServicios[i].text);
                    }
                    this.arrayCantProductos = [];
                    for (var i = 0; i < this.listCantProductos.length; i++) {
                        this.arrayCantProductos.push(this.listCantProductos[i].text);
                    }
                    params.cantServicios = this.arrayCantServicios;
                    params.cantProductos = this.arrayCantProductos;

                    this._backService.HttpPost("catalogos/promocion/guardarPaquetes", {}, params, "text").subscribe((response: string) => {
                        this.respuesta = response;
                        if (this.respuesta == 'Guardado') {
                            this.inicializarPaquetes();
                            this._toaster.success("Paquete Guardado");
                            //$.notific8("Paquete Guardado", this.successNotific8);
                            this._pantallaServicio.ocultarSpinner();
                            this.cargarListadoPaquetes();
                        } else {
                            this._pantallaServicio.ocultarSpinner();
                        }
                    }, error => {
                        this._pantallaServicio.ocultarSpinner();
                    });
                } else {
                    this._pantallaServicio.ocultarSpinner();
                    this._toaster.error("El paquete debe estar vigente al momento de guardarlo.");
                    //$.notific8("El paquete debe estar vigente al momento de guardarlo.", this.errorNotific);
                }
            }
        } else {
            this._pantallaServicio.ocultarSpinner();
        }
    }

    actualizarPaquete() {
        this._pantallaServicio.mostrarSpinner();
        var params: any = {};
        params.nombre = this.paquetes.nombre;
        params.idPaqueteSucursal = this.paquetes.idPaquete;
        params.precioParcial = this.paquetes.precioParcial;
        params.precioCompleto = this.paquetes.precioCompleto;
        params.idCostoTipo = this.paquetes.idCostoTipo;
        params.vigente = this.paquetes.vigente;
        params.periodoVigencia = this.paquetes.periodoVigencia;
        params.servicios = this.paquetes.servicios;
        params.productos = this.paquetes.productos;
        for (var i = 0; i < this.listCantServicios.length; i++) {
            this.arrayCantServicios.push(this.listCantServicios[i].text);
        }
        for (var i = 0; i < this.listCantProductos.length; i++) {
            this.arrayCantProductos.push(this.listCantProductos[i].text);
        }
        for (var i = 0; i < this.arrayCantServicios.length; i++) {
            this.arrayCantServicios[i] = this.arrayCantServicios[i].toString();
        }
        for (var i = 0; i < this.arrayCantProductos.length; i++) {
            this.arrayCantProductos[i] = this.arrayCantProductos[i].toString();
        }
        params.cantServicios = this.arrayCantServicios;
        params.cantProductos = this.arrayCantProductos;

        this._backService.HttpPost("catalogos/promocion/actualizaPaquete", {}, params, "text").subscribe((response: string) => {
            if (response == "Actualizado") {
                this._toaster.success("Paquete Actualizado");
                //$.notific8("Paquete Actualizado", this.successNotific8);
                this.inicializarPaquetes();
                this.cargarListadoPaquetes();
                this._pantallaServicio.ocultarSpinner();
            } else {
                this._pantallaServicio.ocultarSpinner();
            }
        }, error => {
            this.inicializarPaquetes();
            this.cargarListadoPaquetes();
            this._pantallaServicio.ocultarSpinner();
        });
    }

    cargarServicios() {
        var params: any = {};
        params.sucursal = null;
        this._backService.HttpPost("catalogos/servicio/consultarServicio", {}, params).subscribe((response: string) => {
            this.paquetes.dataServicios = eval(response);
        }, error => {
        
        });
    }

    cargarProductos() {
        this._backService.HttpPost("catalogos/promocion/consultarProductos", {}, {}).subscribe((response: string) => {
            this.paquetes.dataProductos = eval(response);
        }, error => {
        
        });
    }
    
    validarServiciosProductos() {
        this.servValido = true;
        this.prodValido = true;
        if (this.paquetes.servicios.length != undefined && this.listCantServicios.length != undefined) {
            if (this.paquetes.servicios.length == this.listCantServicios.length) {
                this.servValido = true;
                $("#txtErrorDdlServicios").hide();
                $("#txtErrorCantServicios").hide();
            } else {
                this.servValido = false;
                $("#txtErrorDdlServicios").show();
                $("#txtErrorCantServicios").show();
            }
        }
        if (this.paquetes.productos.length != undefined && this.listCantProductos.length != undefined) {
            if (this.paquetes.productos.length == this.listCantProductos.length) {
                this.prodValido = true;
                $("#txtErrorDdlProductos").hide();
                $("#txtErrorCantProd").hide();
            } else {
                this.prodValido = false;
                $("#txtErrorDdlProductos").show();
                $("#txtErrorCantProd").show();
            }
        }
        if (this.paquetes.servicios.length == 0 && this.listCantServicios.length == 0 && this.paquetes.productos.length == 0 && this.listCantProductos.length == 0) {
            $("#txtErrorDdlProductos").show();
            $("#txtErrorCantProd").show();
            $("#txtErrorDdlServicios").show();
            $("#txtErrorCantServicios").show();
            //this.alertError("Al menos un servicio o un producto deben de ser ingresados");
        }
    }

    validarCampos() {
        var vacios = 0;
        this.camposCompletos = false;
        if (this.paquetes.nombre == "") {
            $("#txtDescripcion").addClass("errorCampo");
            vacios += 1;
        } else {
            $("#txtDescripcion").removeClass("errorCampo");
        }
        if (this.paquetes.idCostoTipo == '' || this.paquetes.idCostoTipo == undefined || this.paquetes.idCostoTipo == null) {
            $("#ddlCostoTipoP > div:first-child").attr("style", "outline: red solid 1px !important;");
            vacios += 1;
        } else {
            $("#ddlCostoTipoP > div:first-child").attr("style", "outline: none;");
        }
        if (this.paquetes.idCostoTipo == 1) {
            $("#txtCostoCompleto").removeClass("errorCampo");
            if (this.paquetes.precioParcial == null) {
                $("#txtCostoParcial").addClass("errorCampo");
                vacios += 1;
            } else {
                if (this.paquetes.precioParcial <= 0) {
                    $("#txtCostoParcial").addClass("errorCampo");
                    vacios += 1;
                } else {
                    $("#txtCostoParcial").removeClass("errorCampo");
                }
            }
        }
        if (this.paquetes.idCostoTipo == 2) {
            // $("#txtCostoParcial").removeClass("errorCampo");
            // if (this.paquetes.precioTotal == null || this.paquetes.precioTotal == undefined) {
            //     $("#txtCostoCompleto").addClass("errorCampo");
            //     vacios += 1;
            // } else {
            //     if (this.paquetes.precioTotal <= 0) {
            //         $("#txtCostoCompleto").addClass("errorCampo");
            //         vacios += 1;
            //     } else {
            //         $("#txtCostoCompleto").removeClass("errorCampo");
            //     }
            // }
            $("#txtCostoCompleto").removeClass("errorCampo");
            if (this.paquetes.precioParcial == null) {
                $("#txtCostoParcial").addClass("errorCampo");
                vacios += 1;
            } else {
                if (this.paquetes.precioParcial <= 0) {
                    $("#txtCostoParcial").addClass("errorCampo");
                    vacios += 1;
                } else {
                    $("#txtCostoParcial").removeClass("errorCampo");
                }
            }
        }
        if (vacios == 0) {
            this.camposCompletos = true;
        }
    }

    confirmBorrarPaquete(idPaqueteSucursal: any) {
        this.paquetes.idPaqueteSucursal = idPaqueteSucursal;
        this.modalConfirmEliminarPaquete_mensaje = "¿Desea eliminar el Paquete seleccionado?";
        this.modales.modalConfirmEliminarPaquete.show();
    }

    eliminarPaquete() {
        var params: any = {}
        params.idPaqueteSucursal = this.paquetes.idPaqueteSucursal;
        this._backService.HttpPost("catalogos/promocion/eliminarPaquetes", {}, params, "text").subscribe((response: string) => {
            if (response == "Baja") {
                this._toaster.success("Paquete Eliminado");
                //$.notific8("Paquete Eliminado", this.successNotific8);
                this.inicializarPaquetes();
                this._pantallaServicio.ocultarSpinner();
                this.cargarListadoPaquetes();
            } else {
                //this.alertError("Error al eliminar: " + data.d);
                this._pantallaServicio.ocultarSpinner();
            }
        }, error => {
        
        });
    }

    onChangeDdlTipoCostoPaquete() {
        if (this.paquetes.idCostoTipo == 2) {
            this.paquetes.precioCompleto = null;
        }
    }

    busquedaPaquete() {
        this.dataPaquetes2 = Object.assign([], this.dataPaquetesOr);
        if (this.inputBusquedaPaquete != "") {
            var foundItem = this.dataPaquetes2.filter((e: any) => { 
                if (e.nombre.toUpperCase().match(this.inputBusquedaPaquete.toUpperCase()) != null) {
                    return e;
                }
            });
            this.dataPaquetes = Object.assign([], foundItem);
        }
        else {
            this.dataPaquetes = Object.assign([], this.dataPaquetesOr);
        }
    }

    paqueteAgregarCantidadDeServicio(event: MatChipInputEvent): void {
        const value = (event.value || '').trim();

        if (value) {
            var regexSoloNumeros = RegExp("^[0-9]*$");
            if (regexSoloNumeros.test(value)) {
                this.listCantServicios.push({text: value});
            }
        }

        // Clear the input value
        event.chipInput!.clear();
    }

    paqueteEliminarCantidadDeServicio(registro: any): void {
        const index = this.listCantServicios.indexOf(registro);

        if (index >= 0) {
            this.listCantServicios.splice(index, 1);
        }
    }


    // Scripts
    servicio_validarNum(e: any) {
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

    validarDescartarNuevo(): boolean{
        return this.servicio.nombre != "" || this.servicio.duracion != "" || this.servicio.tiempoDisponible != "" || this.servicio.costoMaximo != null || this.servicio.costoMinimo != null || this.servicio.costoTipo != null || this.servicio.esFrecuente != false || this.servicio.esPrivado != false || this.servicio.libre != false;
    }
}

