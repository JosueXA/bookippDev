import { Component, OnInit, ViewChild } from '@angular/core';
import { MethodsService } from 'src/app/core/services/methods.service';
import { PantallaService } from "src/app/core/services/pantalla.service";
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from "@angular/router";
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
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'app-excepcionesPersonal-creacion-edicion',
    templateUrl: './excepcionesPersonal-creacion-edicion.component.html',
    styleUrls: ['./excepcionesPersonal-creacion-edicion.component.scss', '../../../page.component.scss'],
})

export class ExcepcionesPersonalCreacionEdicionComponent implements OnInit {
    // Variables de Translate
    excepcionesTranslate: any = {};
    sessionTraslate: any = {};

    // Modales
    modales: any = {}; 

    constructor(private _translate: TranslateService, private _backService: MethodsService, public _pantallaServicio: PantallaService, private _dialog: MatDialog, private _router: Router, private _toaster: ToasterService,private _route: ActivatedRoute, private matIconRegistry: MatIconRegistry, private domSanitizer: DomSanitizer) {
        this._translate.setDefaultLang(this._pantallaServicio.idioma);
        this._translate.use(this._pantallaServicio.idioma);

        this._translate.get('excepcionesTranslate').subscribe((translated: string) => {  
            this.excepcionesTranslate = this._translate.instant('excepcionesTranslate');
            this.tipoPantalla = this.excepcionesTranslate.nueva;
            this.sessionTraslate = this._translate.instant('sessionTraslate');
        });

        this.matIconRegistry.addSvgIcon('iconFlecha1DerechaPeque', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/FlechaDerechaPequena-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconCasa1', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Casa1-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconCruzCirculo', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/10-2-TiposdeExcepcion-icon.svg"));
    }

    ngOnInit(): void {
        this._route.queryParams.subscribe(params => {
            this.paramIdExcepcion = params["idExcepcionTipo"];
            this._pantallaServicio.mostrarSpinner();
            this.crearModales();
            this.cargarPersonal();
            this.cargarHorarioSelect()

            if (this.paramIdExcepcion == 'N'){
                this.excepcion.todoElDia = true;
                this.tipoPantalla = this.excepcionesTranslate.nueva;
            }else{
                this.paramFechaInicio = params["fechaInicio"];
                this.paramFechaFin = params["fechaFin"];
                this.excepcion.todoElDia = false;
                this.tipoPantalla = this.excepcionesTranslate.actualizar;
            }
        });
    }

    crearModales(){
        if ($('body').find('.modal-reprog').length > 1) {
            $('body').find('.modal-reprog')[1].remove();
        }
        this.modales.modalReprog = new bootstrap.Modal($("#modal-reprog").appendTo("body"), {
            backdrop: "static", 
            keyboard: false,
        });

        if ($('body').find('.modal-citasP').length > 1) {
            $('body').find('.modal-citasP')[1].remove();
        }
        this.modales.modalCitasP = new bootstrap.Modal($("#modal-citasP").appendTo("body"), {
            backdrop: "static", 
            keyboard: false,
        });

        if ($('body').find('.modal-confirm1').length > 1) {
            $('body').find('.modal-confirm1')[1].remove();
        }
        this.modales.modalConfirm1 = new bootstrap.Modal($("#modal-confirm1").appendTo("body"), {
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
    }

    // ------------------------------------------------------------------------------------------- //
    // ----------------------------------------- EXCEPCIONES ------------------------------------- //
    // ------------------------------------------------------------------------------------------- //

    // -------------------------------------- Declaración de variables --------------------------- //
    rootScope_fromState = "";
    tipoPantalla = "";
    excepcion: any = {
        personal: [],
        tipoExcepcion: "",
        fechaInicio: "",
        fechaFin: "",
        horaInicio: "",
        horaFin: "",
        descripcion: "",
        dataPersonal: [],
        dataExcepcion: [],
        cargaExcepcion: []
    };
    citas: any = {
        idPersonal: "",
        pendientes: [],
        dataPersonal: []
    };
    citasFinPendientes: any = [];
    idCitasRepro: any = [];
    idCitasReproRecu = [];
    dataOriginal: any = [];
    dataCancel = [];
    ddlPersonal = false;
    change = false;
    ddl = "";
    direccion = "";
    paramIdExcepcion: any;
    paramFechaInicio: any;
    paramFechaFin: any;
    valido = true;
    cg = 0;
    nCitas: any = 0;
    guardar = false;
    error = true;
    hora: any;
    fecha: any;
    listarHora: any = [];
    msgError_fechaFin: any;
    msgError_horaInicio: any;
    msgError_horaFin: any;

    // ----------------------------------- Declaracion de funciones ----------------------------------- //
    consultarExcepciones(){
        var params: any = {};
        var f1 = this.paramFechaInicio.split('/'); //Fecha:Inicio y Fin
        var f2 = this.paramFechaFin.split('/'); //Fecha:Inicio y Fin
        params.fechaInicio = (f1[1] + '/' + f1[0] + '/' + f1[2]); //Fecha:Inicio y Fin
        params.fechaFin = (f2[1] + '/' + f2[0] + '/' + f2[2]); //Fecha:Inicio y Fin
        this._backService.HttpPost("catalogos/excepciones/consultarExcepciones", {}, params).subscribe((response: string) => {
            var dataTemp = eval(response);
            if (dataTemp.length != 0) {
                $('#dir2').hide();
                $('#dir1').show();

                this.cargarPantalla();
                $("#btnCancelar").removeAttr("disabled");
            } else {
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

    //Función que carga el personal
    cargarPersonal(){
        this._backService.HttpPost("catalogos/excepciones/consultarPersonal", {}, {}).subscribe((response: string) => {
            this.excepcion.dataPersonal = eval(response);

            this.cargarTipoExcepcion();
            this.excepcion_cargarHorarios();
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

    //Función que carga los tipos de excepciones
    cargarTipoExcepcion(){
        this._backService.HttpPost("catalogos/excepciones/consultarTipoExcepciones", {}, {}).subscribe((response: string) => {
            this.excepcion.dataExcepcion = eval(response);

            if(this.paramIdExcepcion != 'N'){
                this.consultarExcepciones();
            }else{
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

    excepcion_cargarHorarios(){
        this.hora = [];
        $('#btnGuardar').css('pointer-events', 'visible');
        $("#btnGuardar").removeClass("loading");
        var horaInicio = moment().startOf("day");
        var horaFin = moment().endOf("day");
        for (horaInicio; horaInicio < horaFin; horaInicio.add("m", 30)) {
            this.hora.push(horaInicio.format("HH:mm"));
        }
        this.hora.push(moment().hour(23).minute(59).format("HH:mm"));
    }

    //Función que carga la pantalla
    cargarPantalla(){
        if (this.paramIdExcepcion != 'N') {
            this.tipoPantalla = this.excepcionesTranslate.actualizar;
            var params: any = {};
            params.tipoExcepcion = this.paramIdExcepcion;
            this.ddlPersonal = true;
            this._backService.HttpPost("catalogos/excepciones/consultaExcepcion", {}, params).subscribe((response: string) => {
                this.excepcion.cargaExcepcion = eval(response);
                var dataTemp = eval(response);

                var fechaI = format(new Date(dataTemp[0].fechaInicio), "yyyy-MM-dd");
                var fechaF = format(new Date(dataTemp[0].fechaFin), "yyyy-MM-dd");
                if (dataTemp[0].horaInicio == null) {
                    horaI = ("00:00").split(":");
                } else {
                    var horaI = (dataTemp[0].horaInicio).split(":");
                }
                if (dataTemp[0].horaFin == null) {
                    horaF = ("23:59").split(":");
                }
                else {
                    var horaF = (dataTemp[0].horaFin).split(":");
                }

                this.excepcion.personal = ((dataTemp[0].idPersonal).split(',')).map(Number);
                this.excepcion.tipoExcepcion = dataTemp[0].idExcepcionTipo;
                this.excepcion.descripcion = dataTemp[0].descripcion;
                this.excepcion.fechaInicio = fechaI;
                this.excepcion.fechaFin = fechaF;
                this.dataOriginal = dataTemp;
                this.dataOriginal.fechaInicio = fechaI[2] + "/" + fechaI[1] + "/" + fechaI[0];
                this.dataOriginal.fechaFin = fechaF[2] + "/" + fechaF[1] + "/" + fechaF[0];
                this.dataOriginal.horaInicio = horaI;
                this.dataOriginal.horaFin = horaF;
                var horaInicio = horaI[0];
                var minutosInicio = horaI[1];
                var horaFin = horaF[0];
                var minutosFin = horaF[1];
                this.excepcion.horaInicio = moment(new Date(0, 0, 0, horaInicio, minutosInicio, 0, 0)).format('HH:mm');
                this.excepcion.horaFin = moment(new Date(0, 0, 0, horaFin, minutosFin, 0, 0)).format('HH:mm');

                if (this.excepcion.horaInicio == "00:00" && this.excepcion.horaFin == "23:59") {
                    this.excepcion.todoElDia = true;
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
        }else{
            this._pantallaServicio.ocultarSpinner();
        }
    };

    //Función que verifica que la fecha de fin sea mayor a la fecha fin de la excepción 
    seleccionarFechaFin(){ //VALIDACIÓN
        if (this.excepcion.fechaFin < this.excepcion.fechaInicio) {
            $("#fechaFin").addClass("errorCampo")
            this.msgError_fechaFin = this.excepcionesTranslate.fechaFinMayor;
            this.valido = false;
        } else {
            $("#fechaFin").removeClass("errorCampo");
            this.msgError_fechaFin = '';
        }
    }

    seleccionarHoraFin(){ //VALIDACIÓN
        if (this.excepcion.horaFin < this.excepcion.horaInicio) {
            $("#txtHoraFin").addClass("errorCampo");
            this.msgError_horaFin = this.excepcionesTranslate.horaFinMayor;
            this.valido = false;
        } else {
            $("#txtHoraFin").removeClass("errorCampo");
            this.msgError_horaFin = '';
        }
    }

    //Función que guarda una excepción 
    guardarExcepcion(){
        this.guardar = true;
        this.valido = true;
        if (this.excepcion.personal == "") {
            $("#ddlPersonal").addClass("errorCampo")
            this.valido = false;
        }
        if (this.excepcion.tipoExcepcion == "") {
            $("#ddlExcepcion").addClass("errorCampo")
            this.valido = false;
        }
        if (this.excepcion.fechaInicio == "" || this.excepcion.fechaInicio == undefined) {
            $("#fechaInicio").addClass("errorCampo")
            this.valido = false;
        }
        if (this.excepcion.fechaFin == "" || this.excepcion.fechaFin == undefined) {
            $("#fechaFin").addClass("errorCampo")
            this.msgError_fechaFin = "";
            this.valido = false;
        } else {
            this.seleccionarFechaFin();
        }
        if (this.excepcion.horaInicio == "" || this.excepcion.horaInicio == undefined) {
            $("#horaInicio").addClass("errorCampo");
            this.msgError_horaInicio = "";
            this.valido = false;
        }
        if (this.excepcion.horaFin == "" || this.excepcion.horaFin == undefined) {
            $("#horaFin").addClass("errorCampo");
            this.msgError_horaFin = "";
            this.valido = false;
        } else {
            this.seleccionarHoraFin();
        }
        
        if (this.valido) {
            if (this.paramIdExcepcion == 'N') {
                var params: any = {};
                params.idPersonal = this.excepcion.personal;
                params.tipoExcepcion = this.excepcion.tipoExcepcion;
                params.fechaInicio = this.excepcion.fechaInicio;
                params.fechaFin = this.excepcion.fechaFin;
                params.horaInicio = this.excepcion.horaInicio;
                params.horaFin = this.excepcion.horaFin;
                params.descripcion = this.excepcion.descripcion;
                this._backService.HttpPost("catalogos/excepciones/guardarExcepciones", {}, params).subscribe((response: string) => {
                    this._router.navigate(['/catalogos/excepciones-personal'], {skipLocationChange: false, replaceUrl: true});                    
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
                var params: any = {};
                params.idExcepcion = this.paramIdExcepcion;
                params.idPersonal = this.excepcion.personal;
                params.tipoExcepcion = this.excepcion.tipoExcepcion;
                params.fechaInicio = this.excepcion.fechaInicio;
                params.fechaFin = this.excepcion.fechaFin;
                params.horaInicio = this.excepcion.horaInicio;
                params.horaFin = this.excepcion.horaFin;
                params.descripcion = (this.excepcion.descripcion == null) ? " " : this.excepcion.descripcion;
                this._backService.HttpPost("catalogos/excepciones/actualizarExcepcion", {}, params).subscribe((response: string) => {
                    this._router.navigate(['/catalogos/excepciones-personal'], {skipLocationChange: false, replaceUrl: true});
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

    guardarDatos(){
        this.guardar = true;
        if (this.valido) {
            var params: any = {};
            params.idPersonal = this.excepcion.personal;
            params.fechaInicio = this.excepcion.fechaInicio;
            params.fechaFin = this.excepcion.fechaFin;
            params.horaInicio = this.excepcion.horaInicio;
            params.horaFin = this.excepcion.horaFin;

            this._backService.HttpPost("catalogos/excepciones/consultarCitasPersonal", {}, params).subscribe((response: string) => {
                var dataTemp = eval(response);

                dataTemp.reverse();
                this.citas.pendientes = dataTemp;
                this.nCitas = this.citas.pendientes.length;
                if (this.nCitas > 0) {
                    this.reprog();
                } else {
                    this.guardarExcepcion();
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

    //Función para reprogramar citas 
    reprogramarCitas(){
        var array = [7, 1, 2, 3, 4, 5, 6];
        if (this.citas.idPersonal != "") {
            if (this.nCitas >= 0) {
                var strFecha = (this.citas.pendientes[this.nCitas].fechaCita.substring(0, 10)).split("-");
                this.fecha = new Date(strFecha[0], (strFecha[1] - 1), strFecha[2]);
                var params: any = {};
                params.idPersonal = this.citas.idPersonal;
                params.horaInicio = this.citas.pendientes[this.nCitas].horaInicio;
                params.horaFin = this.citas.pendientes[this.nCitas].horaFin;
                params.fechaCita = this.fecha;
                params.idServicio = this.citas.pendientes[this.nCitas].idServicio;
                params.horaInicioServicio = this.citas.pendientes[this.nCitas].horaInicioServicio;

                //Verifica que al personal al reprogramar no tenga citas pendientes 
                this._backService.HttpPost("catalogos/excepciones/consultarCitasReprogramar", {}, params).subscribe((response: string) => {
                    var citasPersonal = eval(response);

                    if (citasPersonal.length > 0) {
                        var params: any = {};
                        params.cita = this.citas.pendientes[this.nCitas].idCita + ',' + this.citas.pendientes[this.nCitas].idCitaRecu;
                        params.citaDetalle = this.citas.pendientes[this.nCitas].idCitaDetalle;
                        params.horaInicio = this.citas.pendientes[this.nCitas].horaInicioServicio;
                        params.horaFin = this.citas.pendientes[this.nCitas].horaFin;
                        params.fechaCita = this.fecha;
                        params.personal = this.citas.idPersonal;
                        
                        //Realiza la reprogramación de la cita
                        this._backService.HttpPost("catalogos/excepciones/updateCita", {}, params, 'string').subscribe((response: string) => {
                            var dataTemp = response;

                            this.idCitasRepro.push(dataTemp);
                            this.nCitas -= 1;
                            this.reprogramarCitas();
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
                        this.citasFinPendientes.push(this.citas.pendientes[this.nCitas]);
                        this.nCitas -= 1;
                        this.reprogramarCitas();
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
            } else {
                if (this.idCitasRepro.length > 0) {
                    var params: any = {};
                    params.idCitasRepro = JSON.parse(JSON.stringify(this.idCitasRepro));
                    params.idCitasRepro = params.idCitasRepro.filter(function (elem: any, pos: any) {
                        return params.idCitasRepro.indexOf(elem) == pos;
                    });
                    this.idCitasRepro = [];
                    this._pantallaServicio.mostrarSpinner();

                    // this._backService.HttpPost("catalogos/excepciones/correoCitaReprogramar", {}, params).subscribe((response: string) => { JeoC: No existe como tal esta función en el back.
                        this._pantallaServicio.ocultarSpinner();
                        if (this.citasFinPendientes.length > 0) {
                            this.modales.modalReprog.hide();
                            this.showModalCitasP();
                        } else {
                            this.modales.modalReprog.hide();
                            this.guardarExcepcion();
                        }
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
                } else {
                    if (this.citasFinPendientes.length > 0) {
                        this.modales.modalReprog.hide();
                        this.showModalCitasP();
                    }
                }
            }
        } else {
            $("#ddlPersonalRepro").addClass("errorCampo")
        }
    }

    //Función para el modal cancelar citas
    modalCancelarCitas(){
        this.confirm(this.excepcionesTranslate.cancelarCitas);
    }

    //Función para cancelar citas
    cancelarCitas(){
        var idCC: any = [];
        if (this.citasFinPendientes.length == 0) {
            for (i = 0; i < this.citas.pendientes.length; i++) {
                idCC.push(this.citas.pendientes[i].idCita + ',' + this.citas.pendientes[i].idCitaRecu);
            }
            var params: any = {};
            params.idCitasCancel = idCC;
            params.idCitasCancel.sort((a: any, b: any) => { return (a.split(',')[0]) - (b.split(',')[0]) });
            params.idCitasCancel = params.idCitasCancel.filter((elem: any, pos: any) => {
                return params.idCitasCancel.indexOf(elem) == pos;
            });
            this._pantallaServicio.mostrarSpinner();

            this._backService.HttpPost("catalogos/excepciones/correoCitaCancelada", {}, params).subscribe((response: string) => {
                var params: any = {};
                params.idCita = idCC;
                params.motivo = 'Excepción Personal';

                this._backService.HttpPost("catalogos/excepciones/cancelarCita", {}, params).subscribe((response: string) => {
                    this.guardarExcepcion();
                    this._pantallaServicio.ocultarSpinner();
                    this.modales.modalReprog.hide();
                    this._router.navigate(['/catalogos/excepciones-personal'], {skipLocationChange: false, replaceUrl: true});
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
        } else {
            for (var i = 0; i < this.citasFinPendientes.length; i++) {
                idCC.push(this.citasFinPendientes[i].idCita + ',' + this.citas.pendientes[i].idCitaRecu);
            }
            var params: any = {};
            params.idCitasCancel = idCC;
            params.idCitasCancel.sort((a: any, b: any) => { return (a.split(',')[0]) - (b.split(',')[0]) });
            params.idCitasCancel = params.idCitasCancel.filter((elem: any, pos: any) => {
                return params.idCitasCancel.indexOf(elem) == pos;
            });
            this._pantallaServicio.mostrarSpinner();

            this._backService.HttpPost("catalogos/excepciones/correoCitaCancelada", {}, params).subscribe((response: string) => {
                var params: any = {};
                params.idCita = idCC;
                params.motivo = 'Excepción Personal';

                this._backService.HttpPost("catalogos/excepciones/cancelarCita", {}, params).subscribe((response: string) => {
                    this.guardarExcepcion();
                    this._pantallaServicio.ocultarSpinner();
                    this._router.navigate(['/catalogos/excepciones-personal'], {skipLocationChange: false, replaceUrl: true});
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

    //Función para cancelar la alta o edición de registros
    cancelarPantalla(direccion: any) {
        var direccion = direccion;
        if (this.paramIdExcepcion == "N") {
            if (this.excepcion.personal.length > 0 || this.excepcion.tipoExcepcion != "" || this.excepcion.fechaInicio != "" || this.excepcion.fechaFin != "") {
                this.direccion = direccion;
                this.confirm1(this.excepcionesTranslate.deseaDescartar);
            }
            else {
                this._router.navigate(['/' + direccion], {skipLocationChange: false, replaceUrl: false});
            }
        } else {
            var x = this.dataOriginal.fechaFin;
            var y = this.excepcion.fechaFin;
            var xx = (x == y);
            var dbi_fechaInicio = this.excepcion.fechaInicio;

            if (!xx || this.dataOriginal.fechaInicio != dbi_fechaInicio || this.dataOriginal[0].idExcepcionTipo != this.excepcion.tipoExcepcion) {
                this.direccion = direccion;
                this.confirm1(this.excepcionesTranslate.deseaDescartar);
            }
            else {
                this._router.navigate(['/' + direccion], {skipLocationChange: false, replaceUrl: true});
            }
        }
    }

    //Redirecciona la pantalla
    redirecTo(){
        if (this.direccion != "") {
            this.modales.modalConfirm1.hide();
            this._router.navigate(['/' + this.direccion], {skipLocationChange: false, replaceUrl: true});
        }
    }

    //Función que guarda la excepción sin realizar cambios en las citas pendientes
    citasNada(){
        this.guardarExcepcion();
    }

    //Función para reprogramar manualmente una cita 
    reprogramarManual(){
        if (this.paramIdExcepcion == 'N') {
            var params: any = {};
            params.idPersonal = this.excepcion.personal;
            params.tipoExcepcion = this.excepcion.tipoExcepcion;
            params.fechaInicio = this.excepcion.fechaInicio;
            params.fechaFin = this.excepcion.fechaFin;

            this._backService.HttpPost("catalogos/excepciones/guardarExcepciones", {}, params).subscribe((response: string) => {
                this._router.navigate(['/agenda']);
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
            var params: any = {};
            params.idExcepcion = this.paramIdExcepcion;
            params.idPersonal = this.excepcion.personal;
            params.tipoExcepcion = this.excepcion.tipoExcepcion;
            params.fechaInicio = this.excepcion.fechaInicio;
            params.fechaFin = this.excepcion.fechaFin;

            this._backService.HttpPost("catalogos/excepciones/actualizarExcepcion", {}, params).subscribe((response: string) => {
                this._router.navigate(['/agenda']);
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

    //Modal para confirmar cancelación de alta o edición
    confirm1(message: any) {
        this.modales.modalConfirm1.show();
        $("#modal-confirm1 .modal-body").html('<span class="title">' + message + '</span>');
    };

    //Modal para confirmar cancelación de alta o edición
    confirm1Cancelar() {
        this.modales.modalConfirm1.hide();
    };

    //Modal para confirmar cancelación
    confirm(message: any) {
        this.modales.modalConfirm2.show();
        $("#modal-confirm2 .modal-body").html('<span class="title">' + message + '</span>');
    };

    //Modal reprogramar citas
    reprog(){
        this.nCitas -= 1;
        this.showModalReporgramar();
        $("#ddlPersonalRepro").removeClass("errorCampo");
        this.citas.dataPersonal = JSON.parse(JSON.stringify(this.excepcion.dataPersonal));
        this.citas.idPersonal = "";
        for (var i = 0 ; i < this.excepcion.personal.length; i++) {
            for (var j = 0 ; j < this.citas.dataPersonal.length; j++) {
                var x = this.citas.dataPersonal[j].idPersonal;
                if (this.excepcion.personal[i] == x) {
                    this.citas.dataPersonal.splice(j, 1);
                }
            }
        }
    };

    //Función que muestra el modal
    showModalReporgramar(){
        this.modales.modalReprog.show();
    };

    //Función que muestra el modal
    showModalCitasP(){
        this.modales.modalCitasP.show();
    };

    ddlClick(id: any) {
        if (id == 'ddlPersonal') {
            $("#" + id).removeClass("errorCampo");
            this.ddl = id;
        }
        if (id != undefined) {
            if (this.change) {
                $("#" + id).removeClass("errorCampo");
                this.ddl = id;
            }
            this.change = true;
        }
    };

    txtFocus(id: any) {
        if (this.guardar) {
            var msgE = "";
            if (id == "fechaFin") {
                var ebi_fechaFinError: any = document.getElementById('fechaFinError');
                msgE = ebi_fechaFinError.innerHTML;
            }
            if (msgE == "") {
                $("#" + id).removeClass("errorCampo");
            }
        }
    }

    txtBlur(id: any) {
        if (this.guardar) {
            if (this.error) {
                switch (id) {
                    case 'fechaFin':
                        var ebi_fechaFinError: any = document.getElementById('fechaFinError');
                        var msgE = ebi_fechaFinError.innerHTML;
                        if (this.excepcion.fechaFin == "" || this.excepcion.fechaFin == undefined || msgE != "") {
                            $("#fechaFin").addClass("errorCampo")
                        } else {
                            $("#fechaFin").removeClass("errorCampo");
                        }
                        break;
                    case 'fechaInicio':
                        if (this.excepcion.fechaInicio == "" || this.excepcion.fechaInicio == undefined) {
                            $("#fechaInicio").addClass("errorCampo")
                        } else {
                            $("#fechaInicio").removeClass("errorCampo");
                        }
                        break;
                }
            }
        }
    }

    bloo(){
        setTimeout(() => {
            this.valido = true;
            var fechaLimiteInferiro = format(new Date(89, 1, 1), 'yyyy-MM-dd');

            if (this.excepcion.todoElDia) {
                this.excepcion.horaInicio = "00:00";
                this.excepcion.horaFin = "23:59";
            }
            if (this.excepcion.fechaInicio < fechaLimiteInferiro) {
                $("#fechaInicio").addClass("errorCampo");
                this.valido = false;
            }
            if (this.excepcion.fechaFin < fechaLimiteInferiro) {
                $("#fechaFin").addClass("errorCampo");
                this.msgError_fechaFin = "";
                this.valido = false;
            }
            if (this.excepcion.personal == "") {
                $("#ddlPersonal").addClass("errorCampo");
                this.valido = false;
            }
            if (this.excepcion.tipoExcepcion == "") {
                $("#ddlExcepcion").addClass("errorCampo");
                this.valido = false;
            }
            if (this.excepcion.fechaInicio == "" || this.excepcion.fechaInicio == undefined) {
                $("#fechaInicio").addClass("errorCampo");
                this.valido = false;
            }
            if (this.excepcion.fechaFin == "" || this.excepcion.fechaFin == undefined) {
                $("#fechaFin").addClass("errorCampo");
                this.msgError_fechaFin = "";
                this.valido = false;
            } else {
                this.seleccionarFechaFin();
            }
            if (this.excepcion.horaInicio == "" || this.excepcion.horaInicio == undefined) {
                $("#horaInicio").addClass("errorCampo");
                this.msgError_horaInicio = "";
                this.valido = false;
            }
            if (this.excepcion.horaFin == "" || this.excepcion.horaFin == undefined) {
                $("#horaFin").addClass("errorCampo");
                this.msgError_horaFin = "";
                this.valido = false;
            } else {
                this.seleccionarHoraFin();
            }
            if (this.valido) {
                if (this.cg == 0) {
                    this.guardarDatos();
                }
                this.cg++;
            }
        }, 150);
    }

    btnLock(tipo: any){
        if (tipo == 1 && this.citas.idPersonal != "") {
            $('#btnRep').attr("disabled", true);
            $('#btnNad').attr("disabled", true);
            $('#btnCan').attr("disabled", true);
        }
        switch (tipo) {
            case 1:
                this.reprogramarCitas();
                break;
            case 2:
                this.modalCancelarCitas();
                break;
        }

        setTimeout(() => {
            $('#btnRep').removeAttr("disabled", false);
            $('#btnNad').removeAttr("disabled", false);
            $('#btnCan').removeAttr("disabled", false);
        }, 1000);
    }

    // Cargar la hora de los selects del horario
    cargarHorarioSelect(){
        const horaInicio = moment().startOf("day");
        const horaFin = moment().endOf("day");

        for (horaInicio; horaInicio < horaFin; horaInicio.add(15, "m")) {
            this.listarHora.push({ label: horaInicio.format("HH:mm"), value: horaInicio.format("HH:mm") });
        }
        this.listarHora.push({ label: moment().hour(23).minute(59).format("HH:mm"), value: moment().hour(23).minute(59).format("HH:mm") });
    }
}