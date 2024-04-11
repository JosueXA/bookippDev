import { Component, OnInit, ViewChild } from '@angular/core';
import { ResponseData } from 'src/app/core/models/response-data.model';
import { MethodsService } from 'src/app/core/services/methods.service';
import { PantallaService } from "src/app/core/services/pantalla.service";
import { MatDialog } from '@angular/material/dialog';
import { Router } from "@angular/router";
import { TranslateService } from '@ngx-translate/core'; // TRANSLATE
declare var $: any; // JQUERY
import * as bootstrap from 'bootstrap'; // BOOTSTRAP
import { ToasterService } from "src/shared/toaster/toaster.service";
import moment from 'moment'; // MOMENT
import Croppie from 'croppie';
import { MatTabGroup } from '@angular/material/tabs'; // TABS
import { MatIconRegistry } from '@angular/material/icon'; // ICONS
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'app-personal',
    templateUrl: './personal.component.html',
    styleUrls: ['./personal.component.scss', '../../page.component.scss'],
})

export class PersonalComponent implements OnInit {
    // Variables de Translate
    personalTranslate: any = {};

    // Modales
    modales: any = {};

    constructor(private _translate: TranslateService, private _backService: MethodsService, public _pantallaServicio: PantallaService, private _dialog: MatDialog, private _router: Router, private _toaster: ToasterService, private matIconRegistry: MatIconRegistry, private domSanitizer: DomSanitizer) {
        this._translate.setDefaultLang(this._pantallaServicio.idioma);
        this._translate.use(this._pantallaServicio.idioma);

        this._translate.get('personalTranslate').subscribe((translated: string) => {  
            this.personalTranslate = this._translate.instant('personalTranslate');
        });

        this.matIconRegistry.addSvgIcon('iconAgregar', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Agregar-1-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconConfiguracion', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/10-Configuracion-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconCasa1', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Casa1-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconFlecha1DerechaPeque', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/FlechaDerechaPequena-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconCruz', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Cruz-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconInfoCirculo', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/InfoCirculo-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconBasura', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Basura-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconCruzCirculo', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/10-2-TiposdeExcepcion-icon.svg"));
    }

    ngOnInit(): void {
        this._pantallaServicio.mostrarSpinner();
        this.crearModales();
        this.cargarHorarioSelect();
        setTimeout(() => {
            this.consultarPersonal();
            this.consultarAccesosPersonal();
            $('#btnRecortarFoto').css('display', 'inline');
        }, 100);
        setTimeout(() => {
            if(this._pantallaServicio.global_IdPersonal != null){
                this.personal_cargarPersonalEditarPersonal(this._pantallaServicio.global_IdPersonal);
            }
        }, 150);
    }

    crearModales() {
        if ($('body').find('.modal-reprog').length > 1) {
            $('body').find('.modal-reprog')[1].remove();
        }
        this.modales.modalReprog = new bootstrap.Modal($("#modal-reprog").appendTo("body"), {
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

        if ($('body').find('.modal-confirm').length > 1) {
            $('body').find('.modal-confirm')[1].remove();
        }
        this.modales.modalConfirm = new bootstrap.Modal($("#modal-confirm").appendTo("body"), {
            backdrop: "static", 
            keyboard: false,
        });

        if ($('body').find('.modal-confirmSwithCabina').length > 1) {
            $('body').find('.modal-confirmSwithCabina')[1].remove();
        }
        this.modales.modalConfirmSwithCabina = new bootstrap.Modal($("#modal-confirmSwithCabina").appendTo("body"), {
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

        if ($('body').find('.modal-confirmServicios').length > 1) {
            $('body').find('.modal-confirmServicios')[1].remove();
        }
        this.modales.modalConfirmServicios = new bootstrap.Modal($("#modal-confirmServicios").appendTo("body"), {
            backdrop: "static", 
            keyboard: false,
        });

        if ($('body').find('.modal-confirmUbicacion').length > 1) {
            $('body').find('.modal-confirmUbicacion')[1].remove();
        }
        this.modales.modalConfirmUbicacion = new bootstrap.Modal($("#modal-confirmUbicacion").appendTo("body"), {
            backdrop: "static", 
            keyboard: false,
        });

        if ($('body').find('.modal-alertBorrado').length > 1) {
            $('body').find('.modal-alertBorrado')[1].remove();
        }
        this.modales.modalAlertBorrado = new bootstrap.Modal($("#modal-alertBorrado").appendTo("body"), {
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

        if ($('body').find('.modalCancelarCitas').length > 1) {
            $('body').find('.modalCancelarCitas')[1].remove();
        }
        this.modales.modalCancelarCitas = new bootstrap.Modal($("#modalCancelarCitas").appendTo("body"), {
            backdrop: "static", 
            keyboard: false,
        });

        if ($('body').find('.modalCargarImagen').length > 1) {
            $('body').find('.modalCargarImagen')[1].remove();
        }
        this.modales.modalCargarImagen = new bootstrap.Modal($("#modalCargarImagen").appendTo("body"), {
            backdrop: "static", 
            keyboard: false,
        });
    }

    // ------------------------------------------------------------------------------------------- //
    // ----------------------------------------- PERSONAL ---------------------------------------- //
    // ------------------------------------------------------------------------------------------- //

    // -------------------------------------- Declaración de variables --------------------------- //
    @ViewChild('tabGroup', {static: false}) tab: MatTabGroup; // Se usa esta variable para controlar las pestañas JC
    rootScope_fromState = "personal";
    rootScope_accionPersonal = "Actualizar";
    //rootScope_cantidadPersonales: any = "";
    rootScope_agendaPersonal: any;
    //rootScope_mobileBrowser: false;
    rootScope_stopChange: any = false;
    rootScope_toState: any;
    rootScope_listeners_stateChangeStart: any;
    msg_modalConfirmEliminar: any = "";
    personal: any = {
        sucursal: "",
        tipoUsuario: 0,
        servicio: [],
        nombre: "",
        telefono: "",
        email: "",
        comisionServicio: "0",
        comisionProducto: "0",
        vendedor: false,
        imagenRecortada: "",
        imagen: "",
        imagenCargada: "",
        lunesCargado: true,
        martesCargado: true,
        miercolesCargado: true,
        juevesCargado: true,
        viernesCargado: true,
        sabadoCargado: false,
        domingoCargado: false,
        lunes: true,
        martes: true,
        miercoles: true,
        jueves: true,
        viernes: true,
        sabado: false,
        domingo: false,
        visibleLimiteCabina: true,
        limitecabina: 0,
        dataImagen: [],
        dataHorariosLaborales: [],
        dataHorariosDescansos: [],
        dataPersonalServicio: [],
        dataServicio: [],
        dataSucursal: [],
        dataPersonal: [],
        dataFotosPersonal: [],
        dataPersonales: [],
        contadorLunes: 0,
        contadorMartes: 0,
        contadorMiercoles: 0,
        contadorJueves: 0,
        contadorViernes: 0,
        contadorSabado: 0,
        contadorDomingo: 0,
        objetoLunes: [],
        objetoMartes: [],
        objetoMiercoles: [],
        objetoJueves: [],
        objetoViernes: [],
        objetoSabado: [],
        objetoDomingo: [],
        validDescansosEnLunes: [],
        validDescansosEnMartes: [],
        validDescansosEnMiercoles: [],
        validDescansosEnJueves: [],
        validDescansosEnViernes: [],
        validDescansosEnSabado: [],
        validDescansosEnDomingo: [],
        validRangosDescansosLunes: [],
        validRangosDescansosMartes: [],
        validRangosDescansosMiercoles: [],
        validRangosDescansosJueves: [],
        validRangosDescansosViernes: [],
        validRangosDescansosSabado: [],
        validRangosDescansosDomingo: [],
        tipoContenidoLogo: "",
        lunesValidDescartar: [],
        martesValidDescartar: [],
        miercolesValidDescartar: [],
        juevesValidDescartar: [],
        viernesValidDescartar: [],
        sabadoValidDescartar: [],
        domingoValidDescartar: [],
        visibleAgenda: 1,
        idBoton: 0,
        cabina: {
            isCabina: false,
            servicios: [],
            personales: [],
        }
    };
    sucursal: any = {
        dataHorariosLaborales: [],
        dataHorariosDescansos: []
    }
    citas: any = {
        idPersonal: "",
        pendientes: [],
        dataPersonal: []
    };
    listarHora: any = [];
    imagenCompleta: any;
    guardarSinRecortar = false;
    accion = "Actualizar";
    primeraCarga = true;
    cargarDatosGenerales = true;
    msgImagen = "";
    validImagen = true;
    validEmail = true;
    validTelefono = true;
    sucursalSeleccionada = false;
    esGerenteGeneral = false;
    esGerenteSucursal = false;
    msgLunesDescansos: any = [];
    msgMartesDescansos: any = [];
    msgMiercolesDescansos: any = [];
    msgJuevesDescansos: any = [];
    msgViernesDescansos: any = [];
    msgSabadoDescansos: any = [];
    msgDomingoDescansos: any = [];
    validContadorLunes = true;
    validContadorMartes = true;
    validContadorMiercoles = true;
    validContadorJueves = true;
    validContadorViernes = true;
    validContadorSabado = true;
    validContadorDomingo = true;
    validEmpalmeLunes: any = [];
    validEmpalmeMartes: any = [];
    validEmpalmeMiercoles: any = [];
    validEmpalmeJueves: any = [];
    validEmpalmeViernes: any = [];
    validEmpalmeSabado: any = [];
    validEmpalmeDomingo: any = [];
    reprogramar = {};
    citasFinPendientes: any = [];
    idCitasRepro: any = [];
    idCitasReproRecu = [];
    Citas = 0;
    estaSeleccionada = true;
    validDescartar = false;
    agenda = "";
    stopChange = false;
    guardar = true;
    hora: any;
    hgthImage: any;
    wdthImage: any;
    imgSrcImagen: any;
    imageCroppie: any;
    numRandom: any;
    msgHorariosLaboral: any;
    validTabDatosGenerales: any;
    validLunes:any;
    validMartes:any;
    validMiercoles:any;
    validJueves:any;
    validViernes:any;
    validSabado:any;
    validDomingo:any;
    validarRangoHorasCitasPersonal: any;
    idPersonalToActualizar: any;
    toActualizar: any;
    accesoTotal: any;
    validHorarios: any;
    validHorariosDescansos: any;
    validDescansos: any;
    cambioPersonal: any;
    validServicios: any;
    msgNombre: any;
    msgEmail: any;
    msgTelefono: any;
    msgComisionServicio: any;
    msgComisionProducto: any;
    validNombre: any;
    validComisionServicio: any;
    validComisionProducto: any;
    validRangos: any;
    msgLunes: any;
    msgMartes: any;
    msgHora: any;
    msgMiercoles: any;
    msgJueves: any;
    msgViernes: any;
    msgSabado: any;
    msgDomingo: any;
    guardarDescansos: any;
    contDescansosRequeridos: any;
    validFormatoDescansos: any;
    validRangoDescansos: any;
    validRangoDescansosEnDia: any;
    validEmpalme: any;
    validEmpalme2: any;
    validEmpalme3: any;
    validRango2: any;
    validRangoDescansoEnDia: any;
    contHorasRequeridas: any;
    validRangosCita: any;
    datalimitecabina: any;
    idPersonales: any = "";
    chkValidLunes: any;
    chkValidMartes: any;
    chkValidMiercoles: any;
    chkValidJueves: any;
    chkValidViernes: any;
    chkValidSabado: any;
    chkValidDomingo: any;
    validCitas: any;
    dataCitasDetalle: any;
    validarCitas: any;
    UsuarioCabinaDeMomento: any;
    nCitas: any = 0;
    dataCitas: any;
    numCitas: any;
    fecha: any;
    categoria: any = {
        categoriaSeleccionada: "",
        dataCategorias: [],
        dataCategoriasMostrar: [],
        categoriasDelPersonal: [],
        productos: {}
    };
    accesosPantalla: any = {
        personal: {}
    };
    color: any = "#ffffff";
    elementoDdl: any;
    aux01: any = null;

    // ----------------------------------- Declaracion de funciones ----------------------------------- //
    // --------------------------------------- Funciones de pestañas  --------------------------------------- 
    clickaDatosGenerales() {
        this.limpiarcampos();
        window.onload = () => { // SE AGREGA EL WINDOW.ONLOAD PARA ESPERAR LA CARGA DEL HTML
            this.tab.selectedIndex = 0;
        }
    }

    consultarPersonal() {
        this._pantallaServicio.mostrarSpinner();

        this._backService.HttpPost("catalogos/personal/consultaPersonal", {}, {}).subscribe((response: string) => {
            var dataTemp = eval(response);
            var dataPersonales = [];
            var dataServiciosCabina = [];
            var dataPersonalesCabina = [];

            dataPersonales = dataTemp[0];
            dataServiciosCabina = dataTemp[1];
            dataPersonalesCabina = dataTemp[2];

            this.idPersonales = "";
            
            for (var i = 0; i < dataPersonales.length; i++) {
                dataPersonales[i].codigoFoto = "assets/images/migracion/Imagen-PersonaGris-300x300.png";
                this.idPersonales += dataPersonales[i].idPersonal + ",";

                if (dataPersonales[i].visibleAgenda == 1) {
                    dataPersonales[i].visibleAgenda = true;
                }
                if (dataPersonales[i].visibleAgenda == 0) {
                    dataPersonales[i].visibleAgenda = false;
                }
            }
            this.personal.dataPersonales = dataPersonales;

            if (this.personal.dataPersonales.length >= this._pantallaServicio.empresaPremium_configuracion.cantidadPersonales) {
                $("#btnNuevo").css("display", "none");
            } else {
                $("#btnNuevo").css("display", "inline");
            }

            if (this.personal.dataPersonales.length >= 9) {
                $("#navlist").css("float", "left");
            } else {
                $("#navlist").css("float", "right");
            }

            if (this.personal.dataPersonales.length != 0) {
                this.personal.idPersonal = this.personal.dataPersonales[0].idPersonal;
                this.personal_cargarPersonalPrimeraCarga(this.personal.dataPersonales[0], dataServiciosCabina, dataPersonalesCabina);
            }
            else {
                this.nuevoPersonal();
            }
            //this._pantallaServicio.ocultarSpinner();
        }, 
        (error) => {
            this._pantallaServicio.ocultarSpinner();
            if (error == 'SinSesion' || error == 'SesionCaducada') {
              if (error == 'SinSesion') {
                this._toaster.error(this.personalTranslate.favorIniciarSesion);
              }
              if (error == 'SesionCaducada') {
                this._toaster.error(this.personalTranslate.sesionCaducada);
              }
              this._router.navigate(['/login']);
              return;
            }
            this._toaster.error(this.personalTranslate.errorEliminar);
        });
    }

    personal_cargarPersonalPrimeraCarga(dataPersonal: any, dataServiciosCabina: any, dataPersonalesCabina: any) {
        this.personal.dataPersonal = [];
        this.personal.dataPersonal.push(dataPersonal);

        if (this.personal.dataPersonal[0].esCabina == false) {
            this.personal.dataPersonal[0].esCabina = 0;
        }

        if (this.personal.dataPersonal[0].esCabina == true) {
            this.personal.dataPersonal[0].esCabina = 1;
        }

        if (this.personal.dataPersonal[0].visibleAgenda == true) {
            this.personal.dataPersonal[0].visibleAgenda = 1;
        }
        if (this.personal.dataPersonal[0].visibleAgenda == false) {
            this.personal.dataPersonal[0].visibleAgenda = 0;
        }

        if (this.personal.dataPersonales.length >= 9) {
            $("#navlist").css("float", "left");
        } else {
            $("#navlist").css("float", "right");
        }

        this.rootScope_agendaPersonal = undefined;
        this.inicializarValoresPrimeraCarga(dataServiciosCabina, dataPersonalesCabina);
    }

    inicializarValoresPrimeraCarga(dataServiciosCabina: any, dataPersonalesCabina: any) {
        // ---------------- Limpiar valores ----------------
        this.guardarSinRecortar = false;
        this.personal.sucursal = "";
        this.personal.servicio = [];
        this.personal.nombre = "";
        this.personal.telefono = "";
        this.personal.email = "";
        this.personal.imagen = "";
        this.personal.tipoContenidoLogo = "";
        this.personal.imagenRecortada = "";
        this.personal.imagenCargada = "";
        this.personal.lunesCargado = true;
        this.personal.martesCargado = true;
        this.personal.miercolesCargado = true;
        this.personal.juevesCargado = true;
        this.personal.viernesCargado = true;
        this.personal.sabadoCargado = false;
        this.personal.domingoCargado = false;

        this.guardar = false;
        this.accion = "";
        this.rootScope_accionPersonal = "";

        this.personal.cabina.isPersonalNuevo = false;
        
        this.stopChange = false;
        this.agenda = "";
        this.validDescartar = false;

        this.msgImagen = "";
        this.validImagen = true;
        this.validEmail = true;
        this.validTelefono = true;
        this.personal.contadorLunes = 0;
        this.personal.contadorMartes = 0;
        this.personal.contadorMiercoles = 0;
        this.personal.contadorJueves = 0;
        this.personal.contadorViernes = 0;
        this.personal.contadorSabado = 0;
        this.personal.contadorDomingo = 0;

        this.personal.objetoLunes = [];
        this.personal.objetoMartes = [];
        this.personal.objetoMiercoles = [];
        this.personal.objetoJueves = [];
        this.personal.objetoViernes = [];
        this.personal.objetoSabado = [];
        this.personal.objetoDomingo = [];

        this.msgLunesDescansos = [];
        this.msgMartesDescansos = [];
        this.msgMiercolesDescansos = [];
        this.msgJuevesDescansos = [];
        this.msgViernesDescansos = [];
        this.msgSabadoDescansos = [];
        this.msgDomingoDescansos = [];

        this.validContadorLunes = true;
        this.validContadorMartes = true;
        this.validContadorMiercoles = true;
        this.validContadorJueves = true;
        this.validContadorViernes = true;
        this.validContadorSabado = true;
        this.validContadorDomingo = true;

        this.personal.validDescansosEnLunes = [];
        this.personal.validDescansosEnMartes = [];
        this.personal.validDescansosEnMiercoles = [];
        this.personal.validDescansosEnJueves = [];
        this.personal.validDescansosEnViernes = [];
        this.personal.validDescansosEnSabado = [];
        this.personal.validDescansosEnDomingo = [];

        this.personal.validRangosDescansosLunes = [];
        this.personal.validRangosDescansosMartes = [];
        this.personal.validRangosDescansosMiercoles = [];
        this.personal.validRangosDescansosJueves = [];
        this.personal.validRangosDescansosViernes = [];
        this.personal.validRangosDescansosSabado = [];
        this.personal.validRangosDescansosDomingo = [];

        this.validEmpalmeLunes = [];
        this.validEmpalmeMartes = [];
        this.validEmpalmeMiercoles = [];
        this.validEmpalmeJueves = [];
        this.validEmpalmeViernes = [];
        this.validEmpalmeSabado = [];
        this.validEmpalmeDomingo = [];

        this.personal.lunesValidDescartar = []
        this.personal.martesValidDescartar = [];
        this.personal.miercolesValidDescartar = [];
        this.personal.juevesValidDescartar = [];
        this.personal.viernesValidDescartar = [];
        this.personal.sabadoValidDescartar = [];
        this.personal.domingoValidDescartar = [];

        this.estaSeleccionada = true;

        var c: any = document.getElementById("txtImagen");
        c.src = "assets/images/migracion/Imagen-Foto-300x300.png";
        $("#btnBorrarImagen").css("display", "none");

        // ---------------- Darle los valores correspondientes ----------------
        this.personal.nombre = this.personal.dataPersonal[0].nombre;
        if (this.personal.dataPersonal[0].email != null) {
            this.personal.email = this.personal.dataPersonal[0].email;
        }
        else {
            this.personal.dataPersonal[0].email = "";
            this.personal.email = "";
        }

        if (this.personal.dataPersonal[0].telefono != null) {
            this.personal.telefono = this.personal.dataPersonal[0].telefono;
        }
        else {
            this.personal.dataPersonal[0].telefono = "";
            this.personal.telefono = "";
        }

        if (this.personal.dataPersonal[0].comisionServicio != null) {
            this.personal.comisionServicio = this.personal.dataPersonal[0].comisionServicio;
        }
        else {
            this.personal.dataPersonal[0].comisionServicio = "";
            this.personal.comisionServicio = "";
        }

        if (this.personal.dataPersonal[0].comisionProducto != null) {
            this.personal.comisionProducto = this.personal.dataPersonal[0].comisionProducto;
        }
        else {
            this.personal.dataPersonal[0].comisionProducto = "";
            this.personal.comisionProducto = "";
        }

        if (this.personal.dataPersonal[0].vendedor == 1) {
            this.personal.vendedor = true
        }
        else {
            this.personal.vendedor = false;
        }

        if (this.personal.dataPersonal[0].color != null) {
            this.color = this.personal.dataPersonal[0].color;
            //$('select[name="colorpicker-picker-longlist"]').simplecolorpicker('selectColor', this.personal.dataPersonal[0].color);
        }
        else {
            this.personal.dataPersonal[0].color = "";
        }

        this.personal.visibleAgenda = this.personal.dataPersonal[0].visibleAgenda;

        // -- Apartado de Cabina
        this.personal.cabina.isCabina = this.personal.dataPersonal[0].esCabina;

        if (this.personal.cabina.isCabina) {
            this.personal_consultarPersonalesNuevaCabina();
        }

        for (var i = 0; i < dataServiciosCabina.length; i++) {
            this.personal.cabina.servicios.push(dataServiciosCabina[i].idServicio)
        }

        for (var i = 0; i < dataPersonalesCabina.length; i++) {
            this.personal.cabina.personales.push(dataServiciosCabina[i].idPersonal)
        }

        this.personal.idImagen = this.personal.dataPersonal[0].idImagen;
        this.personal.sucursal = this.personal.dataPersonal[0].idSucursal;

        this.personal_consultaServiciosPrimeraCarga();
    }

    personal_consultaServiciosPrimeraCarga() {
        var params = {
            sucursal: this.personal.sucursal
        };

        this._backService.HttpPost("catalogos/servicio/consultarServicio", {}, params).subscribe((response: string) => {
            this.personal.dataServicio = eval(response);

            if (this.personal.dataServicio.length > 0) {
                $('#img' + this.personal.idPersonal).addClass('imgActive');
                $('#lbl' + this.personal.idPersonal).addClass('lblActive');

                if (this.cargarDatosGenerales) {
                    this.cargarDatosGenerales = false;
                    $("#datosGenerales").show();
                    $("#btnGuardar").show();
                }

                this.personal_cargarServiciosPersonalPrimeraCarga();
            }
            else {
                // Muestra un mensaje en un modal para indicar que la sucursal no cuenta con ningún servicio
                this.modales.modalConfirmServicios.show();
                $("#modal-confirmServicios .modal-body").html('<span style="font-weight: 400;">' + this.personalTranslate.msgNAServ + '</span>');
                this._pantallaServicio.ocultarSpinner();
            }
        }, 
        (error) => {
            this._pantallaServicio.ocultarSpinner();
            if (error == 'SinSesion' || error == 'SesionCaducada') {
              if (error == 'SinSesion') {
                this._toaster.error(this.personalTranslate.favorIniciarSesion);
              }
              if (error == 'SesionCaducada') {
                this._toaster.error(this.personalTranslate.sesionCaducada);
              }
              this._router.navigate(['/login']);
              return;
            }
            this._toaster.error(this.personalTranslate.errorEliminar);
        });
    }

    personal_cargarServiciosPersonalPrimeraCarga() {
        this.personal.idPersonalServicio = [];
        this.personal.servicio = [];
        this.personal.serviciosSelected = [];
        var params = {
            idPersonal: this.personal.idPersonal
        };

        this._backService.HttpPost("catalogos/personal/cargarServicioPersonal", {}, params).subscribe((response: string) => {
            this.personal.dataPersonalServicio = eval(response);
            var k = 0;

            for (var i = 0; i < this.personal.dataPersonalServicio.length; i++) {
                for (var j = 0; j < this.personal.dataServicio.length; j++) {

                    if (this.personal.dataPersonalServicio[i].idServicio == this.personal.dataServicio[j].idServicio) {

                        this.personal.serviciosSelected[k] = this.personal.dataServicio[j].idServicio;

                        this.personal.idPersonalServicio[k] = this.personal.dataPersonalServicio[i].idPersonalServicio;
                        k++;
                        break;
                    }
                }
            }
            this.personal.servicio = this.personal.serviciosSelected;
            this.personal.serviciosSeleccionados = JSON.parse(JSON.stringify(this.personal.servicio));

            //this._pantallaServicio.ocultarSpinner();

            this.personal.funcionesRestantesCargadas = false;
            this.sucursal_cargarSucursalHorariosLaboralesPrimeraCarga();
        }, 
        (error) => {
            this._pantallaServicio.ocultarSpinner();
            if (error == 'SinSesion' || error == 'SesionCaducada') {
              if (error == 'SinSesion') {
                this._toaster.error(this.personalTranslate.favorIniciarSesion);
              }
              if (error == 'SesionCaducada') {
                this._toaster.error(this.personalTranslate.sesionCaducada);
              }
              this._router.navigate(['/login']);
              return;
            }
            this._toaster.error(this.personalTranslate.errorEliminar);
        });
    }

    abrirConfiguracion() {
        this._router.navigate(
            ['/catalogos/excepciones-personal'],
            {queryParams: { 
                idPersonal: 0 
            }}
        );
    }

    sucursal_cargarSucursalHorariosLaboralesPrimeraCarga() {
        var params = {
            idSucursal: this.personal.sucursal
        };

        this._backService.HttpPost("catalogos/sucursal/cargarSucursalHorariosLaborales", {}, params).subscribe((response: string) => {
            this.sucursal.dataHorariosLaborales = eval(response);
            this.sucursal.dataHorariosLaboralesCopy = JSON.parse(JSON.stringify(this.sucursal.dataHorariosLaborales));

            for (var i = 0; i < this.sucursal.dataHorariosLaborales.length; i++) {
                var horaInicio = this.sucursal.dataHorariosLaborales[i].horaInicio;
                var minutosInicio = this.sucursal.dataHorariosLaborales[i].minutosInicio;
                var horaFin = this.sucursal.dataHorariosLaborales[i].horaFin;
                var minutosFin = this.sucursal.dataHorariosLaborales[i].minutosFin;
                switch (this.sucursal.dataHorariosLaborales[i].dia) {
                    case 1:
                        this.sucursal.lunes = this.sucursal.dataHorariosLaborales[i].esLaboral;
                        this.sucursal.lunesCargado = JSON.parse(JSON.stringify(this.personal.lunes));
                        this.personal.lunes = this.sucursal.dataHorariosLaborales[i].esLaboral;
                        this.personal.lunesCargado = JSON.parse(JSON.stringify(this.personal.lunes));
                        this.personal.horaInicioLunes = moment(new Date(0, 0, 0, horaInicio, minutosInicio, 0, 0)).format('HH:mm');
                        this.personal.horaFinLunes = moment(new Date(0, 0, 0, horaFin, minutosFin, 0, 0)).format('HH:mm');
                        this.personal.horaIniLu = JSON.parse(JSON.stringify(this.personal.horaInicioLunes));
                        this.personal.horaFiLu = JSON.parse(JSON.stringify(this.personal.horaFinLunes));
                        break;
                    case 2:
                        this.sucursal.martes = this.sucursal.dataHorariosLaborales[i].esLaboral;
                        this.sucursal.martesCargado = JSON.parse(JSON.stringify(this.personal.martes));
                        this.personal.martes = this.sucursal.dataHorariosLaborales[i].esLaboral;
                        this.personal.martesCargado = JSON.parse(JSON.stringify(this.personal.martes));
                        this.personal.horaInicioMartes = moment(new Date(0, 0, 0, horaInicio, minutosInicio, 0, 0)).format('HH:mm');
                        this.personal.horaFinMartes = moment(new Date(0, 0, 0, horaFin, minutosFin, 0, 0)).format('HH:mm');
                        this.personal.horaIniMa = JSON.parse(JSON.stringify(this.personal.horaInicioMartes));
                        this.personal.horaFiMa = JSON.parse(JSON.stringify(this.personal.horaFinMartes));
                        break;
                    case 3:
                        this.sucursal.miercoles = this.sucursal.dataHorariosLaborales[i].esLaboral;
                        this.sucursal.miercolesCargado = JSON.parse(JSON.stringify(this.personal.miercoles));
                        this.personal.miercoles = this.sucursal.dataHorariosLaborales[i].esLaboral;
                        this.personal.miercolesCargado = JSON.parse(JSON.stringify(this.personal.miercoles));
                        this.personal.horaInicioMiercoles = moment(new Date(0, 0, 0, horaInicio, minutosInicio, 0, 0)).format('HH:mm');
                        this.personal.horaFinMiercoles = moment(new Date(0, 0, 0, horaFin, minutosFin, 0, 0)).format('HH:mm');
                        this.personal.horaIniMi = JSON.parse(JSON.stringify(this.personal.horaInicioMiercoles));
                        this.personal.horaFiMi = JSON.parse(JSON.stringify(this.personal.horaFinMiercoles));
                        break;
                    case 4:
                        this.sucursal.jueves = this.sucursal.dataHorariosLaborales[i].esLaboral;
                        this.sucursal.juevesCargado = JSON.parse(JSON.stringify(this.personal.jueves));
                        this.personal.jueves = this.sucursal.dataHorariosLaborales[i].esLaboral;
                        this.personal.juevesCargado = JSON.parse(JSON.stringify(this.personal.jueves));
                        this.personal.horaInicioJueves = moment(new Date(0, 0, 0, horaInicio, minutosInicio, 0, 0)).format('HH:mm');
                        this.personal.horaFinJueves = moment(new Date(0, 0, 0, horaFin, minutosFin, 0, 0)).format('HH:mm');
                        this.personal.horaIniJu = JSON.parse(JSON.stringify(this.personal.horaInicioJueves));
                        this.personal.horaFiJu = JSON.parse(JSON.stringify(this.personal.horaFinJueves));
                        break;
                    case 5:
                        this.sucursal.viernes = this.sucursal.dataHorariosLaborales[i].esLaboral;
                        this.sucursal.viernesCargado = JSON.parse(JSON.stringify(this.personal.viernes));
                        this.personal.viernes = this.sucursal.dataHorariosLaborales[i].esLaboral;
                        this.personal.viernesCargado = JSON.parse(JSON.stringify(this.personal.viernes));
                        this.personal.horaInicioViernes = moment(new Date(0, 0, 0, horaInicio, minutosInicio, 0, 0)).format('HH:mm');
                        this.personal.horaFinViernes = moment(new Date(0, 0, 0, horaFin, minutosFin, 0, 0)).format('HH:mm');
                        this.personal.horaIniVi = JSON.parse(JSON.stringify(this.personal.horaInicioViernes));
                        this.personal.horaFiVi = JSON.parse(JSON.stringify(this.personal.horaFinViernes));
                        break;
                    case 6:
                        this.sucursal.sabado = this.sucursal.dataHorariosLaborales[i].esLaboral;
                        this.sucursal.sabadoCargado = JSON.parse(JSON.stringify(this.personal.sabado));
                        this.personal.sabado = this.sucursal.dataHorariosLaborales[i].esLaboral;
                        this.personal.sabadoCargado = JSON.parse(JSON.stringify(this.personal.sabado));
                        this.personal.horaInicioSabado = moment(new Date(0, 0, 0, horaInicio, minutosInicio, 0, 0)).format('HH:mm');
                        this.personal.horaFinSabado = moment(new Date(0, 0, 0, horaFin, minutosFin, 0, 0)).format('HH:mm');
                        this.personal.horaIniSa = JSON.parse(JSON.stringify(this.personal.horaInicioSabado));
                        this.personal.horaFiSa = JSON.parse(JSON.stringify(this.personal.horaFinSabado));
                        break;
                    case 7:
                        this.sucursal.domingo = this.sucursal.dataHorariosLaborales[i].esLaboral;
                        this.sucursal.domingoCargado = JSON.parse(JSON.stringify(this.personal.domingo));
                        this.personal.domingo = this.sucursal.dataHorariosLaborales[i].esLaboral;
                        this.personal.domingoCargado = JSON.parse(JSON.stringify(this.personal.domingo));
                        this.personal.horaInicioDomingo = moment(new Date(0, 0, 0, horaInicio, minutosInicio, 0, 0)).format('HH:mm');
                        this.personal.horaFinDomingo = moment(new Date(0, 0, 0, horaFin, minutosFin, 0, 0)).format('HH:mm');
                        this.personal.horaIniDo = JSON.parse(JSON.stringify(this.personal.horaInicioDomingo));
                        this.personal.horaFiDo = JSON.parse(JSON.stringify(this.personal.horaFinDomingo));
                        break;
                }
            }

            this.personal_cargarPersonalHorariosLaboralesPrimeraCarga();
        }, 
        (error) => {
            this._pantallaServicio.ocultarSpinner();
            if (error == 'SinSesion' || error == 'SesionCaducada') {
              if (error == 'SinSesion') {
                this._toaster.error(this.personalTranslate.favorIniciarSesion);
              }
              if (error == 'SesionCaducada') {
                this._toaster.error(this.personalTranslate.sesionCaducada);
              }
              this._router.navigate(['/login']);
              return;
            }
            this._toaster.error(this.personalTranslate.errorEliminar);
        });
    }

    personal_cargarPersonalHorariosLaboralesPrimeraCarga() {
        var params = {
            idPersonal: this.personal.idPersonal
        };

        this._backService.HttpPost("catalogos/personal/cargarPersonalHorariosLaborales", {}, params).subscribe((response: string) => {
            this.personal.dataHorariosLaborales = eval(response);
            this.personal.dataHorariosLaboralesCopy = JSON.parse(JSON.stringify(this.personal.dataHorariosLaborales));

            for (var i = 0; i < this.personal.dataHorariosLaborales.length; i++) {
                var horaInicio = this.personal.dataHorariosLaborales[i].horaInicio;
                var minutosInicio = this.personal.dataHorariosLaborales[i].minutosInicio;
                var horaFin = this.personal.dataHorariosLaborales[i].horaFin;
                var minutosFin = this.personal.dataHorariosLaborales[i].minutosFin;
                switch (this.personal.dataHorariosLaborales[i].dia) {
                    case 1:
                        this.personal.lunes = this.personal.dataHorariosLaborales[i].esLaboral;
                        this.personal.horaInicioLunes = moment(new Date(0, 0, 0, horaInicio, minutosInicio, 0, 0)).format('HH:mm');
                        this.personal.horaFinLunes = moment(new Date(0, 0, 0, horaFin, minutosFin, 0, 0)).format('HH:mm');
                        this.personal.horaIniLu = JSON.parse(JSON.stringify(this.personal.horaInicioLunes));
                        this.personal.horaFiLu = JSON.parse(JSON.stringify(this.personal.horaFinLunes));
                        break;
                    case 2:
                        this.personal.martes = this.personal.dataHorariosLaborales[i].esLaboral;
                        this.personal.horaInicioMartes = moment(new Date(0, 0, 0, horaInicio, minutosInicio, 0, 0)).format('HH:mm');
                        this.personal.horaFinMartes = moment(new Date(0, 0, 0, horaFin, minutosFin, 0, 0)).format('HH:mm');
                        this.personal.horaIniMa = JSON.parse(JSON.stringify(this.personal.horaInicioMartes));
                        this.personal.horaFiMa = JSON.parse(JSON.stringify(this.personal.horaFinMartes));
                        break;
                    case 3:
                        this.personal.miercoles = this.personal.dataHorariosLaborales[i].esLaboral;
                        this.personal.horaInicioMiercoles = moment(new Date(0, 0, 0, horaInicio, minutosInicio, 0, 0)).format('HH:mm');
                        this.personal.horaFinMiercoles = moment(new Date(0, 0, 0, horaFin, minutosFin, 0, 0)).format('HH:mm');
                        this.personal.horaIniMi = JSON.parse(JSON.stringify(this.personal.horaInicioMiercoles));
                        this.personal.horaFiMi = JSON.parse(JSON.stringify(this.personal.horaFinMiercoles));
                        break;
                    case 4:
                        this.personal.jueves = this.personal.dataHorariosLaborales[i].esLaboral;
                        this.personal.horaInicioJueves = moment(new Date(0, 0, 0, horaInicio, minutosInicio, 0, 0)).format('HH:mm');
                        this.personal.horaFinJueves = moment(new Date(0, 0, 0, horaFin, minutosFin, 0, 0)).format('HH:mm');
                        this.personal.horaIniJu = JSON.parse(JSON.stringify(this.personal.horaInicioJueves));
                        this.personal.horaFiJu = JSON.parse(JSON.stringify(this.personal.horaFinJueves));
                        break;
                    case 5:
                        this.personal.viernes = this.personal.dataHorariosLaborales[i].esLaboral;
                        this.personal.horaInicioViernes = moment(new Date(0, 0, 0, horaInicio, minutosInicio, 0, 0)).format('HH:mm');
                        this.personal.horaFinViernes = moment(new Date(0, 0, 0, horaFin, minutosFin, 0, 0)).format('HH:mm');
                        this.personal.horaIniVi = JSON.parse(JSON.stringify(this.personal.horaInicioViernes));
                        this.personal.horaFiVi = JSON.parse(JSON.stringify(this.personal.horaFinViernes));
                        break;
                    case 6:
                        this.personal.sabado = this.personal.dataHorariosLaborales[i].esLaboral;
                        this.personal.horaInicioSabado = moment(new Date(0, 0, 0, horaInicio, minutosInicio, 0, 0)).format('HH:mm');
                        this.personal.horaFinSabado = moment(new Date(0, 0, 0, horaFin, minutosFin, 0, 0)).format('HH:mm');
                        this.personal.horaIniSa = JSON.parse(JSON.stringify(this.personal.horaInicioSabado));
                        this.personal.horaFiSa = JSON.parse(JSON.stringify(this.personal.horaFinSabado));
                        break;
                    case 7:
                        this.personal.domingo = this.personal.dataHorariosLaborales[i].esLaboral;
                        this.personal.horaInicioDomingo = moment(new Date(0, 0, 0, horaInicio, minutosInicio, 0, 0)).format('HH:mm');
                        this.personal.horaFinDomingo = moment(new Date(0, 0, 0, horaFin, minutosFin, 0, 0)).format('HH:mm');
                        this.personal.horaIniDo = JSON.parse(JSON.stringify(this.personal.horaInicioDomingo));
                        this.personal.horaFiDo = JSON.parse(JSON.stringify(this.personal.horaFinDomingo));
                        break;
                }
            }

            this.personal_cargarPersonalHorariosDescansosPrimeraCarga();
        }, 
        (error) => {
            this._pantallaServicio.ocultarSpinner();
            if (error == 'SinSesion' || error == 'SesionCaducada') {
              if (error == 'SinSesion') {
                this._toaster.error(this.personalTranslate.favorIniciarSesion);
              }
              if (error == 'SesionCaducada') {
                this._toaster.error(this.personalTranslate.sesionCaducada);
              }
              this._router.navigate(['/login']);
              return;
            }
            this._toaster.error(this.personalTranslate.errorEliminar);
        });
    }
    
    personal_cargarPersonalHorariosDescansosPrimeraCarga() {
        var params = {
            idPersonal: this.personal.idPersonal
        };

        this._backService.HttpPost("catalogos/personal/cargarPersonalHorariosDescansos", {}, params).subscribe((response: string) => {
            this.personal.dataHorariosDescansos = eval(response);
            $('#img' + this.personal.idPersonal).addClass('imgActive');
            $('#lbl' + this.personal.idPersonal).addClass('lblActive');
            //this._pantallaServicio.ocultarSpinner();
            
            if (this.cargarDatosGenerales) {
                this.cargarDatosGenerales = false;
                $("#datosGenerales").show();
                $("#btnGuardar").show();
            }
            for (var i = 0; i < this.personal.dataHorariosDescansos.length; i++) {
                var horaInicio = this.personal.dataHorariosDescansos[i].horaInicio;
                var minutosInicio = this.personal.dataHorariosDescansos[i].minutosInicio;
                var horaFin = this.personal.dataHorariosDescansos[i].horaFin;
                var minutosFin = this.personal.dataHorariosDescansos[i].minutosFin;
                switch (this.personal.dataHorariosDescansos[i].dia) {
                    case 1:
                        this.personal.contadorLunes++;
                        this.personal.objetoLunes.push({ horaInicio: moment(new Date(0, 0, 0, horaInicio, minutosInicio, 0, 0)).format('HH:mm'), horaFin: moment(new Date(0, 0, 0, horaFin, minutosFin, 0, 0)).format('HH:mm') });
                        break;
                    case 2:
                        this.personal.contadorMartes++;
                        this.personal.objetoMartes.push({ horaInicio: moment(new Date(0, 0, 0, horaInicio, minutosInicio, 0, 0)).format('HH:mm'), horaFin: moment(new Date(0, 0, 0, horaFin, minutosFin, 0, 0)).format('HH:mm') })
                        break;
                    case 3:
                        this.personal.contadorMiercoles++;
                        this.personal.objetoMiercoles.push({ horaInicio: moment(new Date(0, 0, 0, horaInicio, minutosInicio, 0, 0)).format('HH:mm'), horaFin: moment(new Date(0, 0, 0, horaFin, minutosFin, 0, 0)).format('HH:mm') })
                        break;
                    case 4:
                        this.personal.contadorJueves++;
                        this.personal.objetoJueves.push({ horaInicio: moment(new Date(0, 0, 0, horaInicio, minutosInicio, 0, 0)).format('HH:mm'), horaFin: moment(new Date(0, 0, 0, horaFin, minutosFin, 0, 0)).format('HH:mm') })
                        break;
                    case 5:
                        this.personal.contadorViernes++;
                        this.personal.objetoViernes.push({ horaInicio: moment(new Date(0, 0, 0, horaInicio, minutosInicio, 0, 0)).format('HH:mm'), horaFin: moment(new Date(0, 0, 0, horaFin, minutosFin, 0, 0)).format('HH:mm') })
                        break;
                    case 6:
                        this.personal.contadorSabado++;
                        this.personal.objetoSabado.push({ horaInicio: moment(new Date(0, 0, 0, horaInicio, minutosInicio, 0, 0)).format('HH:mm'), horaFin: moment(new Date(0, 0, 0, horaFin, minutosFin, 0, 0)).format('HH:mm') })
                        break;
                    case 7:
                        this.personal.contadorDomingo++;
                        this.personal.objetoDomingo.push({ horaInicio: moment(new Date(0, 0, 0, horaInicio, minutosInicio, 0, 0)).format('HH:mm'), horaFin: moment(new Date(0, 0, 0, horaFin, minutosFin, 0, 0)).format('HH:mm') })
                        break;
                }
            }

            this.personal.objetoLu = JSON.parse(JSON.stringify(this.personal.objetoLunes));
            this.personal.objetoMa = JSON.parse(JSON.stringify(this.personal.objetoMartes));
            this.personal.objetoMi = JSON.parse(JSON.stringify(this.personal.objetoMiercoles));
            this.personal.objetoJu = JSON.parse(JSON.stringify(this.personal.objetoJueves));
            this.personal.objetoVi = JSON.parse(JSON.stringify(this.personal.objetoViernes));
            this.personal.objetoSa = JSON.parse(JSON.stringify(this.personal.objetoSabado));
            this.personal.objetoDo = JSON.parse(JSON.stringify(this.personal.objetoDomingo));

            $('#divPersonales').css('pointer-events', 'visible');
            $('#btnNuevo').css('pointer-events', 'visible');

            this.consultarCategoriasPrimeraCarga();
        }, 
        (error) => {
            this._pantallaServicio.ocultarSpinner();
            if (error == 'SinSesion' || error == 'SesionCaducada') {
              if (error == 'SinSesion') {
                this._toaster.error(this.personalTranslate.favorIniciarSesion);
              }
              if (error == 'SesionCaducada') {
                this._toaster.error(this.personalTranslate.sesionCaducada);
              }
              this._router.navigate(['/login']);
              return;
            }
            this._toaster.error(this.personalTranslate.errorEliminar);
        });
    }

    consultarCategoriasPrimeraCarga () {
        this.categoria.dataCategorias = [];
        this.categoria.dataCategoriasMostrar = [];
        this.categoria.categoriasDelPersonal = [];
        this._backService.HttpPost("catalogos/personal/consultarCategorias", {}, {}).subscribe((response: string) => { 
            var dataAux = eval(response);

            var idComisionCategoriaAux = 0;
            var i = 0;
            var cat = 0;

            while (i < dataAux.length) {
                if (idComisionCategoriaAux != dataAux[i].idComisionCategoria) {
                    cat++;
                    idComisionCategoriaAux = dataAux[i].idComisionCategoria;
                    this.categoria.dataCategorias[cat - 1] = {};
                    this.categoria.dataCategorias[cat - 1].idCategoria = dataAux[i].idComisionCategoria;
                    this.categoria.dataCategorias[cat - 1].descripcion = dataAux[i].nombreCategoria;
                    this.categoria.dataCategorias[cat - 1].ver = false;
                    this.categoria.dataCategorias[cat - 1].activa = true;
                    this.categoria.dataCategorias[cat - 1].servicios = [];
                    this.categoria.dataCategorias[cat - 1].productos = [];
                    this.categoria.dataCategorias[cat - 1].paquetes = [];

                    if (dataAux[i].comision == 'Servicio') {
                        this.categoria.dataCategorias[cat - 1].servicios.push({ "idServicio": dataAux[i].idProductoServicio, "descripcion": dataAux[i].nombreProductoServicio, "tipo": dataAux[i].tipoComision, "cantidad": dataAux[i].valorComision });
                    }
                    if (dataAux[i].comision == 'Producto') {
                        this.categoria.dataCategorias[cat - 1].productos.push({ "idProducto": dataAux[i].idProductoServicio, "descripcion": dataAux[i].nombreProductoServicio, "tipo": dataAux[i].tipoComision, "cantidad": dataAux[i].valorComision });
                    }
                    if (dataAux[i].comision == 'Paquete') {
                        this.categoria.dataCategorias[cat - 1].paquetes.push({ "idPaqueteSucursal": dataAux[i].idProductoServicio, "descripcion": dataAux[i].nombreProductoServicio, "tipo": dataAux[i].tipoComision, "cantidad": dataAux[i].valorComision });
                    }
                }
                else {
                    if (dataAux[i].comision == 'Servicio') {
                        this.categoria.dataCategorias[cat - 1].servicios.push({ "idServicio": dataAux[i].idProductoServicio, "descripcion": dataAux[i].nombreProductoServicio, "tipo": dataAux[i].tipoComision, "cantidad": dataAux[i].valorComision });
                    }
                    if (dataAux[i].comision == 'Producto') {
                        this.categoria.dataCategorias[cat - 1].productos.push({ "idProducto": dataAux[i].idProductoServicio, "descripcion": dataAux[i].nombreProductoServicio, "tipo": dataAux[i].tipoComision, "cantidad": dataAux[i].valorComision });
                    }
                    if (dataAux[i].comision == 'Paquete') {
                        this.categoria.dataCategorias[cat - 1].paquetes.push({ "idPaqueteSucursal": dataAux[i].idProductoServicio, "descripcion": dataAux[i].nombreProductoServicio, "tipo": dataAux[i].tipoComision, "cantidad": dataAux[i].valorComision });
                    }
                }
                i++;
            }
            this.categoria.dataCategoriasMostrar = JSON.parse(JSON.stringify(this.categoria.dataCategorias));

            this.consultarCategoriasPorPersonalPrimeraCarga();
        }, 
        (error) => {
            this._pantallaServicio.ocultarSpinner();
            if (error == 'SinSesion' || error == 'SesionCaducada') {
              if (error == 'SinSesion') {
                this._toaster.error(this.personalTranslate.favorIniciarSesion);
              }
              if (error == 'SesionCaducada') {
                this._toaster.error(this.personalTranslate.sesionCaducada);
              }
              this._router.navigate(['/login']);
              return;
            }
            this._toaster.error(this.personalTranslate.errorEliminar);
        });
    }

    consultarCategoriasPorPersonalPrimeraCarga () {
        this.categoria.categoriasDelPersonal = [];
        var params = {
            idPersonal: this.personal.dataPersonal[0].idPersonal
        };

        this._backService.HttpPost("catalogos/personal/consultarCategoriasPorPersonal", {}, params).subscribe((response: string) => { 
            var dataAux = eval(response);

            for (var i = 0; i < dataAux.length; i++) {
                for (var j = 0; j < this.categoria.dataCategoriasMostrar.length; j++) {
                    if (dataAux[i].idComisionCategoria == this.categoria.dataCategoriasMostrar[j].idCategoria) {
                        this.categoria.categoriasDelPersonal.push(this.categoria.dataCategoriasMostrar[j]);
                        this.categoria.dataCategoriasMostrar.splice(j, 1);
                        j--;
                    }
                }
            }

            this.personal_consultarFotosPersonalPrimeraCarga();
        }, 
        (error) => {
            this._pantallaServicio.ocultarSpinner();
            if (error == 'SinSesion' || error == 'SesionCaducada') {
              if (error == 'SinSesion') {
                this._toaster.error(this.personalTranslate.favorIniciarSesion);
              }
              if (error == 'SesionCaducada') {
                this._toaster.error(this.personalTranslate.sesionCaducada);
              }
              this._router.navigate(['/login']);
              return;
            }
            this._toaster.error(this.personalTranslate.errorEliminar);
        });
    }

    personal_consultarFotosPersonalPrimeraCarga () {
        this._pantallaServicio.mostrarSpinner();
        var params = {
            idPersonales: this.idPersonales
        };

        this._backService.HttpPost("catalogos/personal/consultarFotosPersonal", {}, params).subscribe((response: string) => {
            this.personal.dataFotosPersonal = eval(response);

            for (var i = 0; i < this.personal.dataFotosPersonal.length; i++) {
                for (var j = 0; j < this.personal.dataPersonales.length; j++) {
                    if (this.personal.dataFotosPersonal[i].idImagen == this.personal.dataPersonales[j].idImagen) {
                        this.personal.dataPersonales[j].codigoFoto = this.personal.dataFotosPersonal[i].codigo;
                        if (document.getElementById('img' + this.personal.dataPersonales[j].idPersonal))
                            var ebi_Img: any = document.getElementById('img' + this.personal.dataPersonales[j].idPersonal);
                            ebi_Img.src = this.personal.dataFotosPersonal[i].codigo;
                        break;
                    }
                }
            }

            this.personal_cargarImagenPrimeraCarga();
        }, 
        (error) => {
            this._pantallaServicio.ocultarSpinner();
            if (error == 'SinSesion' || error == 'SesionCaducada') {
              if (error == 'SinSesion') {
                this._toaster.error(this.personalTranslate.favorIniciarSesion);
              }
              if (error == 'SesionCaducada') {
                this._toaster.error(this.personalTranslate.sesionCaducada);
              }
              this._router.navigate(['/login']);
              return;
            }
            this._toaster.error(this.personalTranslate.errorEliminar);
        });
    }

    personal_cargarImagenPrimeraCarga() {
        if (this.personal.idImagen != null) {
            var params = {
                idImagen: this.personal.idImagen
            };

            this._backService.HttpPost("catalogos/imagen/cargarImagen", {}, params).subscribe((response: string) => { 
                this.personal.dataImagen = eval(response);
                this.personal.imagenRecortada = this.personal.dataImagen[0].codigo;
                this.personal.imagenCargada = JSON.parse(JSON.stringify(this.personal.imagenRecortada));
                this.imagenCompleta = JSON.parse(JSON.stringify(this.personal.imagenRecortada));

                if (this.personal.dataImagen[0].tipoContenido != null || this.personal.dataImagen[0].tipoContenido != undefined) {
                    this.personal.tipoContenidoLogo = this.personal.dataImagen[0].tipoContenido;
                }
                else {
                    this.personal.tipoContenidoLogo = "";
                }

                if (document.getElementById("txtImagen")) {
                    var ebi_txtImagen: any = document.getElementById("txtImagen");
                    ebi_txtImagen.src = this.personal.imagenRecortada; 
                }

                $("#btnBorrarImagen").css("display", "block");
                this.personal.permitirCargarDescansos = true;
                this.hora = [];
                $('#btnGuardar').css('pointer-events', 'visible');
                $("#btnGuardar").removeClass("loading");
                var horaInicio = moment().startOf("day");
                var horaFin = moment().endOf("day");

                for (horaInicio; horaInicio < horaFin; horaInicio.add("m", 15)) {
                    this.hora.push(horaInicio.format("HH:mm"));
                }

                this.hora.push(moment().hour(23).minute(59).format("HH:mm"));
                this._pantallaServicio.ocultarSpinner();
            }, 
            (error) => {
                this._pantallaServicio.ocultarSpinner();
                if (error == 'SinSesion' || error == 'SesionCaducada') {
                  if (error == 'SinSesion') {
                    this._toaster.error(this.personalTranslate.favorIniciarSesion);
                  }
                  if (error == 'SesionCaducada') {
                    this._toaster.error(this.personalTranslate.sesionCaducada);
                  }
                  this._router.navigate(['/login']);
                  return;
                }
                this._toaster.error(this.personalTranslate.errorEliminar);
            });
        }
        else {
            if (document.getElementById("txtImagen")) {
                var ebi_txtImagen: any = document.getElementById("txtImagen");
                ebi_txtImagen.src = "assets/images/migracion/Imagen-Foto-300x300.png";
            }

            this.personal.imagenRecortada = "";
            this.personal.imagenCargada = JSON.parse(JSON.stringify(this.personal.imagenRecortada));
            $('#btnGuardar').css('pointer-events', 'visible');
            $("#btnGuardar").removeClass("loading");
            this.hora = [];
            var horaInicio = moment().startOf("day");
            var horaFin = moment().endOf("day");

            for (horaInicio; horaInicio < horaFin; horaInicio.add("m", 15)) {
                this.hora.push(horaInicio.format("HH:mm"));
            }

            this.hora.push(moment().hour(23).minute(59).format("HH:mm"));
            this._pantallaServicio.ocultarSpinner();
        }
    }

    // ---------------------------------------------- Imagenes ---------------------------------------------- 
    borrarImagen() {
        $("#btnBorrarImagen").css("display", "none");
        var txtImagenVar: any = document.getElementById("txtImagen");
        txtImagenVar.src = "assets/images/migracion/Imagen-Foto-300x300.png";
        var ebi_files: any = document.getElementById("files");
        ebi_files.value = ""; 
        this.personal.imagenRecortada = "";
        this.personal.imagenSinRecortar = "";
    }

    onchangeImg (e2: any) {
        let reader = new FileReader();
        let tipo = [];

        reader.onload = (e: any) => {
            var image: any = new Image();
            image.src = e.target.result;
            this.imagenCompleta = image.src;
            this.hgthImage = image.height;
            this.wdthImage = image.width;
            tipo = image.src.split(";");

            if (tipo[0].toLowerCase().indexOf("png") != -1 || tipo[0].toLowerCase().indexOf("jpg") != -1 || tipo[0].toLowerCase().indexOf("jpeg") != -1) {
                this.imgSrcImagen = image.src;
                const canvas1 = document.getElementById('Canvas1');
                const context = (canvas1 as HTMLCanvasElement).getContext('2d');
                if (context) {
                    context.drawImage(image, 0, 0, 300, 300);
                }

                var canvas: any  = document.getElementById("Canvas1");
                this.personal.imagenSinRecortar = canvas.toDataURL("image/png"); 
                this.personal.imagen = canvas.toDataURL("image/png");
                $("#btnBorrarImagen").css("display", "block");

                this.validImagen = true;
                tipo = this.personal.imagen.split(";");
                if (tipo[0].toLowerCase().indexOf("jpg") != -1) {
                    this.personal.tipoContenidoLogo = "jpg";
                }
                if (tipo[0].toLowerCase().indexOf("jpeg") != -1) {
                    this.personal.tipoContenidoLogo = "jpeg";
                }
                if (tipo[0].toLowerCase().indexOf("png") != -1) {
                    this.personal.tipoContenidoLogo = "png";

                    var c: any = document.getElementById("Canvas1");
                    var ctx: any = c.getContext("2d");
                    ctx.clearRect(0, 0, 300, 300);
                }
                
                $("#btnBorrarImagen").css("display", "block");
                $("#txtImagen").removeClass('errorCampo');
                var ebi_files: any = document.getElementById("files");
                ebi_files.value = "";

                setTimeout(() => {
                    this.imageCroppie = new Croppie(
                      document.getElementById('cropImage') as HTMLElement,
                      {
                        boundary: {
                          width: 400,
                          height: 400,
                        },
                        viewport: {
                          width: 300,
                          height: 300,
                        },
                      }
                    );
                    this.imageCroppie.bind({
                      url: e.target.result,
                    });
                    $('#btnRecortarFoto').css('display', 'inline');
                }, 500);

                $('#btnRecortarFoto').css('display', 'inline');
                this.modales.modalCargarImagen.show();
            } else {
                setTimeout(() => {
                    this.validImagen = false;
                    this.personal.imagen = "";
                    this.msgImagen = this.personalTranslate.msgImagen;

                    var ebi_files: any = document.getElementById("files");
                    ebi_files.value = "";
                    var ebi_txtImagen: any = document.getElementById("txtImagen");
                    ebi_txtImagen.src = "assets/images/migracion/Imagen-Foto-300x300.png";
                    
                    $("#txtImagen").css("outline", "3px solid red");
                    $("#btnBorrarImagen").css("display", "none");
                }, 10);
            }
        };
        reader.readAsDataURL(e2.target.files[0]);
    };

    recortarImagen() {
        this.imageCroppie.result({ type: 'base64' }).then((imagenCortada: any) => {
            var ebi_txtImagen: any = document.getElementById('txtImagen');
            ebi_txtImagen.src = imagenCortada;
            this.personal.imagenRecortada = imagenCortada;

            var c: any = document.getElementById("Canvas1");
            var ctx: any = c.getContext("2d");
            ctx.clearRect(0, 0, 300, 300);
            /*$("#Canvas1").drawImage({
                layer: true, //don't forget to include this
                source: imagenCortada,
                x: 0, y: 0,
                width: 300,
                height: 300,
                fromCenter: false
            });*/
            const canvas1 = document.getElementById('Canvas1') as HTMLCanvasElement;
            const context = canvas1.getContext('2d');
            if (context) {
                context.clearRect(0, 0, 300, 300);
                context.drawImage(imagenCortada, 0, 0, 300, 300);
            }
            setTimeout(() => {
                var canvas: any  = document.getElementById("Canvas1");
                var ebi_txtImagen: any = document.getElementById("txtImagen");
                ebi_txtImagen.src = canvas.toDataURL("image/png");
                this.personal.imagenRecortada = canvas.toDataURL("image/png");
                this.guardarSinRecortar = false;
            }, 500);

        });
        
        $("#btnRecortarFoto").css("display", "none");
        this.imageCroppie.destroy();
    }

    cancelarRecortadoImagen () {
        this.imageCroppie.destroy();
        this.guardarSinRecortar = false;
        $("#btnRecortarFoto").css("display", "none");
    }

    // --------------------------------------- Cargar Nuevo personal ---------------------------------------- 
    nuevoPersonal(){
        this.tab.selectedIndex = 0;

        $("#blockScreen").show();
        $('#btnNuevo').css("display", "none");
        $('#divPersonales').css('pointer-events', 'none');
        $('#btnGuardar').css('pointer-events', 'none');
        $('#btnDescartar').css('pointer-events', 'none');
        $('#img' + this.personal.idPersonal).removeClass("imgActive");
        $('#img' + this.personal.idPersonal).removeClass("itemActiveCircle");
        $('#lbl' + this.personal.idPersonal).removeClass("lblActive");
        
        this.validPestañaDatosGenerales();
        
        this.limpiarValidaciones();
        this.personal.sucursal = "";
        this.personal.servicio = [];
        this.personal.nombre = "";
        this.guardarSinRecortar = false;
        this.personal.tipoContenidoLogo = "";
        this.personal.telefono = "";
        this.personal.email = "";
        this.personal.comisionServicio = "0";
        this.personal.comisionProducto = "0";
        this.personal.vendedor = false;
        this.personal.imagen = "";
        this.personal.imagenRecortada = "";
        this.personal.imagenCargada = "";
        this.personal.lunesCargado = true;
        this.personal.martesCargado = true;
        this.personal.miercolesCargado = true;
        this.personal.juevesCargado = true;
        this.personal.viernesCargado = true;
        this.personal.sabadoCargado = false;
        this.personal.domingoCargado = false;
        this.personal.lunes = true;
        this.personal.martes = true;
        this.personal.miercoles = true;
        this.personal.jueves = true;
        this.personal.viernes = true;
        this.personal.sabado = false;
        this.personal.domingo = false;
        this.personal.visibleAgenda = true;

        this.personal.cabina.isPersonalNuevo = true;
        this.personal.cabina.isCabina = false;
        this.personal.cabina.servicios = [];
        this.personal.cabina.personales = [];

        this.guardar = false;
        this.accion = "Nuevo";
        this.rootScope_accionPersonal = "Nuevo";
        this.primeraCarga = false;

        this.msgImagen = "";
        this.validImagen = true;
        this.validEmail = true;
        this.validTelefono = true;
        this.stopChange = false;
        this.agenda = "";
        this.validDescartar = false

        this.personal.contadorLunes = 0;
        this.personal.contadorMartes = 0;
        this.personal.contadorMiercoles = 0;
        this.personal.contadorJueves = 0;
        this.personal.contadorViernes = 0;
        this.personal.contadorSabado = 0;
        this.personal.contadorDomingo = 0;

        this.personal.objetoLunes = [];
        this.personal.objetoMartes = [];
        this.personal.objetoMiercoles = [];
        this.personal.objetoJueves = [];
        this.personal.objetoViernes = [];
        this.personal.objetoSabado = [];
        this.personal.objetoDomingo = [];

        this.msgLunesDescansos = [];
        this.msgMartesDescansos = [];
        this.msgMiercolesDescansos = [];
        this.msgJuevesDescansos = [];
        this.msgViernesDescansos = [];
        this.msgSabadoDescansos = [];
        this.msgDomingoDescansos = [];

        this.validContadorLunes = true;
        this.validContadorMartes = true;
        this.validContadorMiercoles = true;
        this.validContadorJueves = true;
        this.validContadorViernes = true;
        this.validContadorSabado = true;
        this.validContadorDomingo = true;

        this.personal.validDescansosEnLunes = [];
        this.personal.validDescansosEnMartes = [];
        this.personal.validDescansosEnMiercoles = [];
        this.personal.validDescansosEnJueves = [];
        this.personal.validDescansosEnViernes = [];
        this.personal.validDescansosEnSabado = [];
        this.personal.validDescansosEnDomingo = [];

        this.personal.validRangosDescansosLunes = [];
        this.personal.validRangosDescansosMartes = [];
        this.personal.validRangosDescansosMiercoles = [];
        this.personal.validRangosDescansosJueves = [];
        this.personal.validRangosDescansosViernes = [];
        this.personal.validRangosDescansosSabado = [];
        this.personal.validRangosDescansosDomingo = [];

        this.validEmpalmeLunes = [];
        this.validEmpalmeMartes = [];
        this.validEmpalmeMiercoles = [];
        this.validEmpalmeJueves = [];
        this.validEmpalmeViernes = [];
        this.validEmpalmeSabado = [];
        this.validEmpalmeDomingo = [];

        this.personal.lunesValidDescartar = []
        this.personal.martesValidDescartar = [];
        this.personal.miercolesValidDescartar = [];
        this.personal.juevesValidDescartar = [];
        this.personal.viernesValidDescartar = [];
        this.personal.sabadoValidDescartar = [];
        this.personal.domingoValidDescartar = [];

        if(document.getElementById("txtImagen")){
            var ebi_txtImagen: any = document.getElementById("txtImagen");
            ebi_txtImagen.src = "assets/images/migracion/Imagen-Foto-300x300.png";
        }
        
        this.personal.horaInicioLunes = "09:00";
        this.personal.horaFinLunes = "18:00";
        this.personal.horaInicioMartes = "09:00";
        this.personal.horaFinMartes = "18:00";
        this.personal.horaInicioMiercoles = "09:00";
        this.personal.horaFinMiercoles = "18:00";
        this.personal.horaInicioJueves = "09:00";
        this.personal.horaFinJueves = "18:00";
        this.personal.horaInicioViernes = "09:00";
        this.personal.horaFinViernes = "18:00";
        this.personal.horaInicioSabado = "09:00";
        this.personal.horaFinSabado = "18:00";
        this.personal.horaInicioDomingo = "09:00";
        this.personal.horaFinDomingo = "18:00";
        var b: any = document.getElementById("txtImagen");
        b.src = "assets/images/migracion/Imagen-Foto-300x300.png";
        $("#btnBorrarImagen").css("display", "none");
        this.personal.colores = [];
        this.personal.colores[0] = "#5A5A5A";
        this.personal.colores[1] = "#0A2A38";
        this.personal.colores[2] = "#58b578";
        this.personal.colores[3] = "#357EC1";
        this.personal.colores[4] = "#B32032";
        this.personal.colores[5] = "#054353";
        this.personal.colores[6] = "#FCDD1A";
        this.personal.colores[7] = "#24557D";
        this.personal.colores[8] = "#4B296B";
        this.personal.colores[9] = "#99244A";
        this.personal.colores[10] = "#EC6351";
        this.personal.colores[11] = "#377D7B";
        this.personal.colores[12] = "#E1E1E1";

        this.numRandom = this.getRandomInt(0, 12);
        this.color = this.personal.colores[this.numRandom];
        //$('select[name="colorpicker-picker-longlist"]').simplecolorpicker('selectColor', this.personal.colores[this.numRandom]);

        this._backService.HttpPost("catalogos/personal/cargarIdSucursal", {}, {}).subscribe((response: string) => {
            this.personal.sucursal = eval(response);
            this.personal.sucursalCargada = JSON.parse(JSON.stringify(this.personal.sucursal));
            this.personal_consultaServicioNuevoPersonal();
        }, 
        (error) => {
            this._pantallaServicio.ocultarSpinner();
            if (error == 'SinSesion' || error == 'SesionCaducada') {
              if (error == 'SinSesion') {
                this._toaster.error(this.personalTranslate.favorIniciarSesion);
              }
              if (error == 'SesionCaducada') {
                this._toaster.error(this.personalTranslate.sesionCaducada);
              }
              this._router.navigate(['/login']);
              return;
            }
            this._toaster.error(this.personalTranslate.errorEliminar);
        });
    }

    personal_consultaServicioNuevoPersonal() {
        var params = {
            sucursal: this.personal.sucursal
        };

        this._backService.HttpPost("catalogos/servicio/consultarServicio", {}, params).subscribe((response: string) => {
            this.personal.dataServicio = eval(response);
            
            if (this.personal.dataServicio.length > 0) {

                this.cargarDatosGenerales = false;
                this.clickaDatosGenerales();

                this.sucursal_cargarSucursalHorariosLaboralesNuevoPersonal();
            }
            else {
                // Muestra un mensaje en un modal para indicar que la sucursal no cuenta con ningún servicio
                this.modales.modalConfirmServicios.show();
                $("#modal-confirmServicios .modal-body").html('<span style="font-weight: 400;">' + this.personalTranslate.msgNAServ + '</span>');
                this._pantallaServicio.ocultarSpinner();
                //
            }
        }, 
        (error) => {
            this._pantallaServicio.ocultarSpinner();
            if (error == 'SinSesion' || error == 'SesionCaducada') {
              if (error == 'SinSesion') {
                this._toaster.error(this.personalTranslate.favorIniciarSesion);
              }
              if (error == 'SesionCaducada') {
                this._toaster.error(this.personalTranslate.sesionCaducada);
              }
              this._router.navigate(['/login']);
              return;
            }
            this._toaster.error(this.personalTranslate.errorEliminar);
        });
    }

    sucursal_cargarSucursalHorariosLaboralesNuevoPersonal() {
        var params = {
            idSucursal: this.personal.sucursal
        };
        this._backService.HttpPost("catalogos/sucursal/cargarSucursalHorariosLaborales", {}, params).subscribe((response: string) => {
            this.sucursal.dataHorariosLaborales = eval(response);
            this.sucursal.dataHorariosLaboralesCopy = JSON.parse(JSON.stringify(this.sucursal.dataHorariosLaborales));
            for (var i = 0; i < this.sucursal.dataHorariosLaborales.length; i++) {
                var horaInicio = this.sucursal.dataHorariosLaborales[i].horaInicio;
                var minutosInicio = this.sucursal.dataHorariosLaborales[i].minutosInicio;
                var horaFin = this.sucursal.dataHorariosLaborales[i].horaFin;
                var minutosFin = this.sucursal.dataHorariosLaborales[i].minutosFin;
                switch (this.sucursal.dataHorariosLaborales[i].dia) {
                    case 1:
                        this.sucursal.lunes = this.sucursal.dataHorariosLaborales[i].esLaboral;
                        this.sucursal.lunesCargado = JSON.parse(JSON.stringify(this.personal.lunes));
                        this.personal.lunes = this.sucursal.dataHorariosLaborales[i].esLaboral;
                        this.personal.lunesCargado = JSON.parse(JSON.stringify(this.personal.lunes));
                        this.personal.horaInicioLunes = moment(new Date(0, 0, 0, horaInicio, minutosInicio, 0, 0)).format('HH:mm');
                        this.personal.horaFinLunes = moment(new Date(0, 0, 0, horaFin, minutosFin, 0, 0)).format('HH:mm');
                        this.personal.horaIniLu = JSON.parse(JSON.stringify(this.personal.horaInicioLunes));
                        this.personal.horaFiLu = JSON.parse(JSON.stringify(this.personal.horaFinLunes));
                        break;
                    case 2:
                        this.sucursal.martes = this.sucursal.dataHorariosLaborales[i].esLaboral;
                        this.sucursal.martesCargado = JSON.parse(JSON.stringify(this.personal.martes));
                        this.personal.martes = this.sucursal.dataHorariosLaborales[i].esLaboral;
                        this.personal.martesCargado = JSON.parse(JSON.stringify(this.personal.martes));
                        this.personal.horaInicioMartes = moment(new Date(0, 0, 0, horaInicio, minutosInicio, 0, 0)).format('HH:mm');
                        this.personal.horaFinMartes = moment(new Date(0, 0, 0, horaFin, minutosFin, 0, 0)).format('HH:mm');
                        this.personal.horaIniMa = JSON.parse(JSON.stringify(this.personal.horaInicioMartes));
                        this.personal.horaFiMa = JSON.parse(JSON.stringify(this.personal.horaFinMartes));
                        break;
                    case 3:
                        this.sucursal.miercoles = this.sucursal.dataHorariosLaborales[i].esLaboral;
                        this.sucursal.miercolesCargado = JSON.parse(JSON.stringify(this.personal.miercoles));
                        this.personal.miercoles = this.sucursal.dataHorariosLaborales[i].esLaboral;
                        this.personal.miercolesCargado = JSON.parse(JSON.stringify(this.personal.miercoles));
                        this.personal.horaInicioMiercoles = moment(new Date(0, 0, 0, horaInicio, minutosInicio, 0, 0)).format('HH:mm');
                        this.personal.horaFinMiercoles = moment(new Date(0, 0, 0, horaFin, minutosFin, 0, 0)).format('HH:mm');
                        this.personal.horaIniMi = JSON.parse(JSON.stringify(this.personal.horaInicioMiercoles));
                        this.personal.horaFiMi = JSON.parse(JSON.stringify(this.personal.horaFinMiercoles));
                        break;
                    case 4:
                        this.sucursal.jueves = this.sucursal.dataHorariosLaborales[i].esLaboral;
                        this.sucursal.juevesCargado = JSON.parse(JSON.stringify(this.personal.jueves));
                        this.personal.jueves = this.sucursal.dataHorariosLaborales[i].esLaboral;
                        this.personal.juevesCargado = JSON.parse(JSON.stringify(this.personal.jueves));
                        this.personal.horaInicioJueves = moment(new Date(0, 0, 0, horaInicio, minutosInicio, 0, 0)).format('HH:mm');
                        this.personal.horaFinJueves = moment(new Date(0, 0, 0, horaFin, minutosFin, 0, 0)).format('HH:mm');
                        this.personal.horaIniJu = JSON.parse(JSON.stringify(this.personal.horaInicioJueves));
                        this.personal.horaFiJu = JSON.parse(JSON.stringify(this.personal.horaFinJueves));
                        break;
                    case 5:
                        this.sucursal.viernes = this.sucursal.dataHorariosLaborales[i].esLaboral;
                        this.sucursal.viernesCargado = JSON.parse(JSON.stringify(this.personal.viernes));
                        this.personal.viernes = this.sucursal.dataHorariosLaborales[i].esLaboral;
                        this.personal.viernesCargado = JSON.parse(JSON.stringify(this.personal.viernes));
                        this.personal.horaInicioViernes = moment(new Date(0, 0, 0, horaInicio, minutosInicio, 0, 0)).format('HH:mm');
                        this.personal.horaFinViernes = moment(new Date(0, 0, 0, horaFin, minutosFin, 0, 0)).format('HH:mm');
                        this.personal.horaIniVi = JSON.parse(JSON.stringify(this.personal.horaInicioViernes));
                        this.personal.horaFiVi = JSON.parse(JSON.stringify(this.personal.horaFinViernes));
                        break;
                    case 6:
                        this.sucursal.sabado = this.sucursal.dataHorariosLaborales[i].esLaboral;
                        this.sucursal.sabadoCargado = JSON.parse(JSON.stringify(this.personal.sabado));
                        this.personal.sabado = this.sucursal.dataHorariosLaborales[i].esLaboral;
                        this.personal.sabadoCargado = JSON.parse(JSON.stringify(this.personal.sabado));
                        this.personal.horaInicioSabado = moment(new Date(0, 0, 0, horaInicio, minutosInicio, 0, 0)).format('HH:mm');
                        this.personal.horaFinSabado = moment(new Date(0, 0, 0, horaFin, minutosFin, 0, 0)).format('HH:mm');
                        this.personal.horaIniSa = JSON.parse(JSON.stringify(this.personal.horaInicioSabado));
                        this.personal.horaFiSa = JSON.parse(JSON.stringify(this.personal.horaFinSabado));
                        break;
                    case 7:
                        this.sucursal.domingo = this.sucursal.dataHorariosLaborales[i].esLaboral;
                        this.sucursal.domingoCargado = JSON.parse(JSON.stringify(this.personal.domingo));
                        this.personal.domingo = this.sucursal.dataHorariosLaborales[i].esLaboral;
                        this.personal.domingoCargado = JSON.parse(JSON.stringify(this.personal.domingo));
                        this.personal.horaInicioDomingo = moment(new Date(0, 0, 0, horaInicio, minutosInicio, 0, 0)).format('HH:mm');
                        this.personal.horaFinDomingo = moment(new Date(0, 0, 0, horaFin, minutosFin, 0, 0)).format('HH:mm');
                        this.personal.horaIniDo = JSON.parse(JSON.stringify(this.personal.horaInicioDomingo));
                        this.personal.horaFiDo = JSON.parse(JSON.stringify(this.personal.horaFinDomingo));
                        break;
                }
            }

            this.sucursal_cargarSucursalHorariosDescansosNuevoPersonal();
        }, 
        (error) => {
            this._pantallaServicio.ocultarSpinner();
            if (error == 'SinSesion' || error == 'SesionCaducada') {
              if (error == 'SinSesion') {
                this._toaster.error(this.personalTranslate.favorIniciarSesion);
              }
              if (error == 'SesionCaducada') {
                this._toaster.error(this.personalTranslate.sesionCaducada);
              }
              this._router.navigate(['/login']);
              return;
            }
            this._toaster.error(this.personalTranslate.errorEliminar);
        });
    }

    sucursal_cargarSucursalHorariosDescansosNuevoPersonal() {
        var params = {
            idSucursal: this.personal.sucursal
        };
        this._backService.HttpPost("catalogos/sucursal/cargarSucursalHorariosDescansos", {}, params).subscribe((response: string) => {
            this.sucursal.dataHorariosDescansos = eval(response);
            for (var i = 0; i < this.sucursal.dataHorariosDescansos.length; i++) {
                var horaInicio = this.sucursal.dataHorariosDescansos[i].horaInicio;
                var minutosInicio = this.sucursal.dataHorariosDescansos[i].minutosInicio;
                var horaFin = this.sucursal.dataHorariosDescansos[i].horaFin;
                var minutosFin = this.sucursal.dataHorariosDescansos[i].minutosFin;
                switch (this.sucursal.dataHorariosDescansos[i].dia) {
                    case 1:
                        this.personal.contadorLunes++;
                        this.personal.objetoLunes.push({ horaInicio: moment(new Date(0, 0, 0, horaInicio, minutosInicio, 0, 0)).format('HH:mm'), horaFin: moment(new Date(0, 0, 0, horaFin, minutosFin, 0, 0)).format('HH:mm') });
                        break;
                    case 2:
                        this.personal.contadorMartes++;
                        this.personal.objetoMartes.push({ horaInicio: moment(new Date(0, 0, 0, horaInicio, minutosInicio, 0, 0)).format('HH:mm'), horaFin: moment(new Date(0, 0, 0, horaFin, minutosFin, 0, 0)).format('HH:mm') })
                        break;
                    case 3:
                        this.personal.contadorMiercoles++;
                        this.personal.objetoMiercoles.push({ horaInicio: moment(new Date(0, 0, 0, horaInicio, minutosInicio, 0, 0)).format('HH:mm'), horaFin: moment(new Date(0, 0, 0, horaFin, minutosFin, 0, 0)).format('HH:mm') })
                        break;
                    case 4:
                        this.personal.contadorJueves++;
                        this.personal.objetoJueves.push({ horaInicio: moment(new Date(0, 0, 0, horaInicio, minutosInicio, 0, 0)).format('HH:mm'), horaFin: moment(new Date(0, 0, 0, horaFin, minutosFin, 0, 0)).format('HH:mm') })
                        break;
                    case 5:
                        this.personal.contadorViernes++;
                        this.personal.objetoViernes.push({ horaInicio: moment(new Date(0, 0, 0, horaInicio, minutosInicio, 0, 0)).format('HH:mm'), horaFin: moment(new Date(0, 0, 0, horaFin, minutosFin, 0, 0)).format('HH:mm') })
                        break;
                    case 6:
                        this.personal.contadorSabado++;
                        this.personal.objetoSabado.push({ horaInicio: moment(new Date(0, 0, 0, horaInicio, minutosInicio, 0, 0)).format('HH:mm'), horaFin: moment(new Date(0, 0, 0, horaFin, minutosFin, 0, 0)).format('HH:mm') })
                        break;
                    case 7:
                        this.personal.contadorDomingo++;
                        this.personal.objetoDomingo.push({ horaInicio: moment(new Date(0, 0, 0, horaInicio, minutosInicio, 0, 0)).format('HH:mm'), horaFin: moment(new Date(0, 0, 0, horaFin, minutosFin, 0, 0)).format('HH:mm') })
                        break;
                }
            }

            this.personal.objetoLu = JSON.parse(JSON.stringify(this.personal.objetoLunes));
            this.personal.objetoMa = JSON.parse(JSON.stringify(this.personal.objetoMartes));
            this.personal.objetoMi = JSON.parse(JSON.stringify(this.personal.objetoMiercoles));
            this.personal.objetoJu = JSON.parse(JSON.stringify(this.personal.objetoJueves));
            this.personal.objetoVi = JSON.parse(JSON.stringify(this.personal.objetoViernes));
            this.personal.objetoSa = JSON.parse(JSON.stringify(this.personal.objetoSabado));
            this.personal.objetoDo = JSON.parse(JSON.stringify(this.personal.objetoDomingo));

            $("#btnGuardar").removeClass("loading");
            if (this.cargarDatosGenerales) {
                this.cargarDatosGenerales = false;
                $("#datosGenerales").show();
                $("#btnGuardar").show();
            }
            $('#divPersonales').css('pointer-events', 'visible');
            $('#btnGuardar').css('pointer-events', 'visible');
            $('#btnDescartar').css('pointer-events', 'visible');
            
            this.hora = [];

            horaInicio = moment().startOf("day");
            horaFin = moment().endOf("day");
            for (horaInicio; horaInicio < horaFin; horaInicio.add("m", 15)) {
                this.hora.push(horaInicio.format("HH:mm"));
            }
            this.hora.push(moment().hour(23).minute(59).format("HH:mm"));

            this.consultarCategoriasNuevoPersonal();
        }, 
        (error) => {
            this._pantallaServicio.ocultarSpinner();
            if (error == 'SinSesion' || error == 'SesionCaducada') {
              if (error == 'SinSesion') {
                this._toaster.error(this.personalTranslate.favorIniciarSesion);
              }
              if (error == 'SesionCaducada') {
                this._toaster.error(this.personalTranslate.sesionCaducada);
              }
              this._router.navigate(['/login']);
              return;
            }
            this._toaster.error(this.personalTranslate.errorEliminar);
        });
    }

    consultarCategoriasNuevoPersonal() {
        this.categoria.dataCategorias = [];
        this.categoria.dataCategoriasMostrar = [];
        this.categoria.categoriasDelPersonal = [];

        this._backService.HttpPost("catalogos/personal/consultarCategorias", {}, {}).subscribe((response: string) => {
            var dataAux = eval(response);
            var idComisionCategoriaAux = 0;
            var i = 0;
            var cat = 0;

            while (i < dataAux.length) {
                if (idComisionCategoriaAux != dataAux[i].idComisionCategoria) {
                    cat++;
                    idComisionCategoriaAux = dataAux[i].idComisionCategoria;
                    this.categoria.dataCategorias[cat - 1] = {};
                    this.categoria.dataCategorias[cat - 1].idCategoria = dataAux[i].idComisionCategoria;
                    this.categoria.dataCategorias[cat - 1].descripcion = dataAux[i].nombreCategoria;
                    this.categoria.dataCategorias[cat - 1].ver = false;
                    this.categoria.dataCategorias[cat - 1].activa = true;
                    this.categoria.dataCategorias[cat - 1].servicios = [];
                    this.categoria.dataCategorias[cat - 1].productos = [];
                    this.categoria.dataCategorias[cat - 1].paquetes = [];

                    if (dataAux[i].comision == 'Servicio') {
                        this.categoria.dataCategorias[cat - 1].servicios.push({ "idServicio": dataAux[i].idProductoServicio, "descripcion": dataAux[i].nombreProductoServicio, "tipo": dataAux[i].tipoComision, "cantidad": dataAux[i].valorComision });
                    }
                    if (dataAux[i].comision == 'Producto') {
                        this.categoria.dataCategorias[cat - 1].productos.push({ "idProducto": dataAux[i].idProductoServicio, "descripcion": dataAux[i].nombreProductoServicio, "tipo": dataAux[i].tipoComision, "cantidad": dataAux[i].valorComision });
                    }
                    if (dataAux[i].comision == 'Paquete') {
                        this.categoria.dataCategorias[cat - 1].paquetes.push({ "idPaqueteSucursal": dataAux[i].idProductoServicio, "descripcion": dataAux[i].nombreProductoServicio, "tipo": dataAux[i].tipoComision, "cantidad": dataAux[i].valorComision });
                    }
                }
                else {
                    if (dataAux[i].comision == 'Servicio') {
                        this.categoria.dataCategorias[cat - 1].servicios.push({ "idServicio": dataAux[i].idProductoServicio, "descripcion": dataAux[i].nombreProductoServicio, "tipo": dataAux[i].tipoComision, "cantidad": dataAux[i].valorComision });
                    }
                    if (dataAux[i].comision == 'Producto') {
                        this.categoria.dataCategorias[cat - 1].productos.push({ "idProducto": dataAux[i].idProductoServicio, "descripcion": dataAux[i].nombreProductoServicio, "tipo": dataAux[i].tipoComision, "cantidad": dataAux[i].valorComision });
                    }
                    if (dataAux[i].comision == 'Paquete') {
                        this.categoria.dataCategorias[cat - 1].paquetes.push({ "idPaqueteSucursal": dataAux[i].idProductoServicio, "descripcion": dataAux[i].nombreProductoServicio, "tipo": dataAux[i].tipoComision, "cantidad": dataAux[i].valorComision });
                    }
                }
                i++;
            }
            this.categoria.dataCategoriasMostrar = JSON.parse(JSON.stringify(this.categoria.dataCategorias));
            this._pantallaServicio.ocultarSpinner();
        }, 
        (error) => {
            this._pantallaServicio.ocultarSpinner();
            if (error == 'SinSesion' || error == 'SesionCaducada') {
              if (error == 'SinSesion') {
                this._toaster.error(this.personalTranslate.favorIniciarSesion);
              }
              if (error == 'SesionCaducada') {
                this._toaster.error(this.personalTranslate.sesionCaducada);
              }
              this._router.navigate(['/login']);
              return;
            }
            this._toaster.error(this.personalTranslate.errorEliminar);
        });
    }
    // ------------------------------------------- Guardar Personal ------------------------------------------
    // Función que guarda el personal
    personal_guardarPersonal (idPersonal: any) {
        this._pantallaServicio.mostrarSpinner();

        setTimeout(() => {
            this.guardar = true;
            this.msgHorariosLaboral = "";
            this.personal_validarCamposRequeridos();
            if (this.validTabDatosGenerales) {
                this.validarRangoHoras();

                if (this.validLunes && this.validMartes && this.validMiercoles && this.validJueves && this.validViernes && this.validSabado && this.validDomingo) {
                    if (this.personal.lunes || this.personal.martes || this.personal.miercoles || this.personal.jueves || this.personal.viernes || this.personal.sabado || this.personal.domingo) {
                        this.personal_aceptarDescansos();

                        if (this.personal.DescansosValidados) {
                            this.personal_guardarHorariosLaboral();
                            this.personal_guardarHorariosDescansos();
                            var params: any = {};
                            //Guardar Logo
                            if (this.personal.imagenRecortada != "" || this.personal.imagenSinRecortar != "") {
                                if (!this.guardarSinRecortar) {
                                    params.codigo = this.personal.imagenRecortada;
                                } else {
                                    params.codigo = this.personal.imagenSinRecortar;
                                }
                                params.tipoContenido = this.personal.tipoContenidoLogo;
                            } else {
                                params.tipoContenido = "";
                                params.codigo = "";
                            }

                            //----------
                            //Guardar Horario Laboral
                            params.horaInicio = this.personal.horarioLaboralInicio.slice();
                            params.horaFin = this.personal.horarioLaboralFin.slice();
                            params.esLaboral = this.personal.laboral.slice();

                            //----------
                            //Guardar Horario Descansos
                            params.descansoDia = this.personal.descansoDia.slice();
                            params.descansoHoraInicio = this.personal.descansoHoraInicio.slice();
                            params.descansoHoraFin = this.personal.descansoHoraFin.slice();

                            //----------
                            //Guardar Servicio Personal
                            params.idServicio = this.personal.servicio.slice();

                            //---------
                            //Guardar Personal
                            params.tipoUsuario = this.personal.tipoUsuario;
                            params.nombre = this.personal.nombre.replace(/</g, "&lt;");;
                            params.email = this.personal.email.replace(/</g, "&lt;");;
                            params.telefono = this.personal.telefono;

                            if (this.personal.sucursal != "") {
                                params.sucursal = this.personal.sucursal;
                            }
                            else {
                                params.sucursal = "";
                            }

                            params.comisionServicio = this.personal.comisionServicio;
                            params.comisionProducto = this.personal.comisionProducto;

                            params.color = this.color;//$('select[name="colorpicker-picker-longlist"]').val();
                            params.vendedor = this.personal.vendedor;

                            params.categoriasComision = [];
                            for (var k = 0; k < this.categoria.categoriasDelPersonal.length; k++) {
                                params.categoriasComision.push(this.categoria.categoriasDelPersonal[k].idCategoria);
                            }

                            params.visibleAgenda = this.personal.visibleAgenda == 1 ? true : false;

                            params.esCabina = this.personal.cabina.isCabina == 1 ? true : false;
                            params.serviciosCabina = this.personal.cabina.servicios;
                            params.personalesCabina = this.personal.cabina.personales;

                            //---------
                            this._backService.HttpPost("catalogos/personal/guardarPersonal", {}, params).subscribe((response: string) => {
                                var dataPersonal = eval(response);

                                if (dataPersonal != -1) {
                                    //$('#switchActivo2').attr("disabled", "disabled");
                                    $('#Span2').addClass('onoffswitch-inner-disable');
                                    this.personal.idPersonal = dataPersonal;

                                    this.validPestañaDatosGenerales();
                                    $('#btnGuardar').css('pointer-events', 'visible');
                                    $('#btnDescartar').css('pointer-events', 'visible');

                                    this.consultarPersonalEditarPersonal(dataPersonal);
                                }
                                else {
                                    $("#btnGuardar").removeClass("loading");
                                    this._pantallaServicio.ocultarSpinner();
                                    

                                    $('#divPersonales').css('pointer-events', 'visible');
                                    $('#btnGuardar').css('pointer-events', 'visible');
                                    $('#btnDescartar').css('pointer-events', 'visible');
                                    this.validDescartar = true;

                                    this._toaster.error("Ya existe un personal con ese nombre");
                                    $("#txtNombre").addClass('errorCampo');
                                    $("#ddlCategorias > div:first-child").attr("style", "outline: red solid 1px !important");
                                }
                            }, 
                            (error) => {
                                this._pantallaServicio.ocultarSpinner();
                                if (error == 'SinSesion' || error == 'SesionCaducada') {
                                if (error == 'SinSesion') {
                                    this._toaster.error(this.personalTranslate.favorIniciarSesion);
                                }
                                if (error == 'SesionCaducada') {
                                    this._toaster.error(this.personalTranslate.sesionCaducada);
                                }
                                this._router.navigate(['/login']);
                                return;
                                }
                                this._toaster.error(this.personalTranslate.errorEliminar);
                            });
                        }
                        else {
                            setTimeout(() =>{
                                this.personal.validGuardarPersonal = false;
                                this.validPestañaDescansos();
                                $('#divPersonales').css('pointer-events', 'visible');
                                $('#btnGuardar').css('pointer-events', 'visible');
                                $('#btnDescartar').css('pointer-events', 'visible');
                                this._pantallaServicio.ocultarSpinner();
                                
                                $("#btnGuardar").removeClass("loading");
                            }, 50);
                            
                        }
                    }
                    else {
                        setTimeout(() =>{
                            this.personal.validGuardarPersonal = false;
                            this.validPestañaHorarios();
                            this.msgHorariosLaboral = this.personalTranslate.horariolb;
                            $('#divPersonales').css('pointer-events', 'visible');
                            $('#btnGuardar').css('pointer-events', 'visible');
                            $('#btnDescartar').css('pointer-events', 'visible');
                            this._pantallaServicio.ocultarSpinner();
                            
                            $("#btnGuardar").removeClass("loading");
                        }, 50);
                        
                    }
                }
                else {
                    setTimeout(() =>{
                        this.validPestañaHorarios();
                        this.personal.validGuardarPersonal = false;
                        $('#divPersonales').css('pointer-events', 'visible');
                        $('#btnGuardar').css('pointer-events', 'visible');
                        $('#btnDescartar').css('pointer-events', 'visible');
                        this._pantallaServicio.ocultarSpinner();
                        
                        $("#btnGuardar").removeClass("loading");
                    }, 50);
                }
            }
            else {
                $('#divPersonales').css('pointer-events', 'visible');
                $('#btnGuardar').css('pointer-events', 'visible');
                $('#btnDescartar').css('pointer-events', 'visible');
                this._pantallaServicio.ocultarSpinner();
                
                $("#btnGuardar").removeClass("loading");
            }  
        }, 50);
    }

    // --------------------------------------- Cargar Editar Personal ----------------------------------------
    personal_cargarPersonalEditarPersonal (idPersonal: any) {
        this._pantallaServicio.mostrarSpinner();
        this.tab.selectedIndex = 0;
        this.limpiarcampos();

        $("#liDatosGenerales").show();
        this.clickaDatosGenerales();

        if(this.aux01 != null){
            $('#img' + this.aux01).removeClass("imgActive");
            $('#img' + this.aux01).removeClass("itemActiveCircle");
            $('#lbl' + this.aux01).removeClass("lblActive");
            this.aux01 = null;
        }

        $('#img' + this.personal.idPersonal).addClass("imgActive");
        $('#img' + this.personal.idPersonal).addClass("itemActiveCircle");
        $('#lbl' + this.personal.idPersonal).addClass("lblActive");
        
        this.personal.idPersonal = parseInt(idPersonal, 10);
        var params: any = {};
        params.idPersonal = parseInt(idPersonal, 10);

        this._backService.HttpPost("catalogos/personal/cargarPersonal", {}, params).subscribe((response: string) => {
            //$('#switchActivo2').attr("disabled", "disabled");
            $('#Span2').addClass('onoffswitch-inner-disable');

            if(this._pantallaServicio.global_IdPersonal != null){
                $('#img' + this.personal.idPersonal).removeClass("imgActive");
                $('#img' + this.personal.idPersonal).removeClass("itemActiveCircle");
                $('#lbl' + this.personal.idPersonal).removeClass("lblActive");

                $('#img' + this._pantallaServicio.global_IdPersonal).addClass("imgActive");
                $('#img' + this._pantallaServicio.global_IdPersonal).addClass("itemActiveCircle");
                $('#lbl' + this._pantallaServicio.global_IdPersonal).addClass("lblActive");
                this.aux01 =  this._pantallaServicio.global_IdPersonal;
                this._pantallaServicio.global_IdPersonal = null;
            }

            if (this.rootScope_fromState == "personal") {
                if (this.personal.dataPersonales.length >= this._pantallaServicio.empresaPremium_configuracion.cantidadPersonales) {
                    $("#btnNuevo").css("display", "none");
                }
                else {
                    $("#btnNuevo").css("display", "inline");
                }

                var dataTemp = [];
                var dataPersonales = [];
                var dataServiciosCabina: any = [];
                var dataPersonalesCabina: any = [];

                dataTemp = eval(response);
                this.personal.dataPersonal = dataTemp[0];
                dataServiciosCabina = dataTemp[1];
                dataPersonalesCabina = dataTemp[2];

                if (this.personal.dataPersonal[0].esCabina == 0) {
                    this.personal.dataPersonal[0].esCabina = false;
                }
                if (this.personal.dataPersonal[0].esCabina == 1) {
                    this.personal.dataPersonal[0].esCabina = true;
                }
                if (this.personal.dataPersonal[0].visibleAgenda == 1) {
                    this.personal.dataPersonal[0].visibleAgenda = true;
                }
                if (this.personal.dataPersonal[0].visibleAgenda == 0) {
                    this.personal.dataPersonal[0].visibleAgenda = false;
                }
                if (this.personal.dataPersonales.length >= 9) {
                    $("#navlist").css("float", "left");
                } else {
                    $("#navlist").css("float", "right");
                }
                this.personal.limitecabina = this.personal.dataPersonal[0].limite_cabina;

                this.limpiarValidaciones();
                setTimeout(() => {
                    this.inicializarValoresEditarPersonal(dataServiciosCabina, dataPersonalesCabina);
                    this.rootScope_agendaPersonal = undefined;
                }, 1000);
            }else{
                this._pantallaServicio.ocultarSpinner();
            }
        }, 
        (error) => {
            this._pantallaServicio.ocultarSpinner();
            if (error == 'SinSesion' || error == 'SesionCaducada') {
              if (error == 'SinSesion') {
                this._toaster.error(this.personalTranslate.favorIniciarSesion);
              }
              if (error == 'SesionCaducada') {
                this._toaster.error(this.personalTranslate.sesionCaducada);
              }
              this._router.navigate(['/login']);
              return;
            }
            this._toaster.error(this.personalTranslate.errorEliminar);
        });
    }

    inicializarValoresEditarPersonal (dataServiciosCabina: any, dataPersonalesCabina: any) {
        this.guardarSinRecortar = false;
        this.personal.sucursal = "";
        this.personal.servicio = [];
        this.personal.nombre = "";
        this.personal.telefono = "";
        this.personal.email = "";
        this.personal.imagen = "";
        this.personal.tipoContenidoLogo = "";
        this.personal.imagenRecortada = "";
        this.personal.imagenCargada = "";
        this.personal.lunesCargado = true;
        this.personal.martesCargado = true;
        this.personal.miercolesCargado = true;
        this.personal.juevesCargado = true;
        this.personal.viernesCargado = true;
        this.personal.sabadoCargado = false;
        this.personal.domingoCargado = false;

        this.guardar = false;

        this.accion = "";
        this.rootScope_accionPersonal = "";

        this.stopChange = false;
        this.agenda = "";
        this.validDescartar = false;

        this.personal.cabina.isPersonalNuevo = false;
        this.personal.cabina.isCabina = false;
        this.personal.cabina.servicios = [];
        this.personal.cabina.personales = [];

        this.msgImagen = "";
        this.validImagen = true;
        this.validEmail = true;
        this.validTelefono = true;
        this.personal.contadorLunes = 0;
        this.personal.contadorMartes = 0;
        this.personal.contadorMiercoles = 0;
        this.personal.contadorJueves = 0;
        this.personal.contadorViernes = 0;
        this.personal.contadorSabado = 0;
        this.personal.contadorDomingo = 0;

        this.personal.objetoLunes = [];
        this.personal.objetoMartes = [];
        this.personal.objetoMiercoles = [];
        this.personal.objetoJueves = [];
        this.personal.objetoViernes = [];
        this.personal.objetoSabado = [];
        this.personal.objetoDomingo = [];

        this.msgLunesDescansos = [];
        this.msgMartesDescansos = [];
        this.msgMiercolesDescansos = [];
        this.msgJuevesDescansos = [];
        this.msgViernesDescansos = [];
        this.msgSabadoDescansos = [];
        this.msgDomingoDescansos = [];

        this.validContadorLunes = true;
        this.validContadorMartes = true;
        this.validContadorMiercoles = true;
        this.validContadorJueves = true;
        this.validContadorViernes = true;
        this.validContadorSabado = true;
        this.validContadorDomingo = true;

        this.personal.validDescansosEnLunes = [];
        this.personal.validDescansosEnMartes = [];
        this.personal.validDescansosEnMiercoles = [];
        this.personal.validDescansosEnJueves = [];
        this.personal.validDescansosEnViernes = [];
        this.personal.validDescansosEnSabado = [];
        this.personal.validDescansosEnDomingo = [];

        this.personal.validRangosDescansosLunes = [];
        this.personal.validRangosDescansosMartes = [];
        this.personal.validRangosDescansosMiercoles = [];
        this.personal.validRangosDescansosJueves = [];
        this.personal.validRangosDescansosViernes = [];
        this.personal.validRangosDescansosSabado = [];
        this.personal.validRangosDescansosDomingo = [];

        this.validEmpalmeLunes = [];
        this.validEmpalmeMartes = [];
        this.validEmpalmeMiercoles = [];
        this.validEmpalmeJueves = [];
        this.validEmpalmeViernes = [];
        this.validEmpalmeSabado = [];
        this.validEmpalmeDomingo = [];

        this.personal.lunesValidDescartar = []
        this.personal.martesValidDescartar = [];
        this.personal.miercolesValidDescartar = [];
        this.personal.juevesValidDescartar = [];
        this.personal.viernesValidDescartar = [];
        this.personal.sabadoValidDescartar = [];
        this.personal.domingoValidDescartar = [];

        this.estaSeleccionada = true;

        if(document.getElementById("txtImagen")){
            var ebi_txtImagen: any = document.getElementById("txtImagen");
            ebi_txtImagen.src = "assets/images/migracion/Imagen-Foto-300x300.png";
            $("#btnBorrarImagen").css("display", "none");
        }


        this.personal.nombre = this.personal.dataPersonal[0].nombre;
        if (this.personal.dataPersonal[0].email != null) {
            this.personal.email = this.personal.dataPersonal[0].email;
        }
        else {
            this.personal.dataPersonal[0].email = "";
            this.personal.email = "";
        }

        if (this.personal.dataPersonal[0].telefono != null) {
            this.personal.telefono = this.personal.dataPersonal[0].telefono;
        }
        else {
            this.personal.dataPersonal[0].telefono = "";
            this.personal.telefono = "";
        }

        if (this.personal.dataPersonal[0].comisionServicio != null) {
            this.personal.comisionServicio = this.personal.dataPersonal[0].comisionServicio;
        }
        else {
            this.personal.dataPersonal[0].comisionServicio = "";
            this.personal.comisionServicio = "";
        }

        if (this.personal.dataPersonal[0].comisionProducto != null) {
            this.personal.comisionProducto = this.personal.dataPersonal[0].comisionProducto;
        }
        else {
            this.personal.dataPersonal[0].comisionProducto = "";
            this.personal.comisionProducto = "";
        }

        if (this.personal.dataPersonal[0].vendedor == 1) {
            this.personal.vendedor = true
        }
        else {
            this.personal.vendedor = false;
        }

        if (this.personal.dataPersonal[0].color != null) {
            this.color = this.personal.dataPersonal[0].color;
        }
        else {
            this.personal.dataPersonal[0].color = "";
        }

        this.personal.visibleAgenda = this.personal.dataPersonal[0].visibleAgenda == true ? 1 : 0;
        this.personal.cabina.isCabina = this.personal.dataPersonal[0].esCabina == true ? 1 : 0;

        if (this.personal.cabina.isCabina == 1) {
            this.personal_consultarPersonalesNuevaCabina();
        }

        for (var i = 0; i < dataServiciosCabina.length; i++) {
            this.personal.cabina.servicios.push(dataServiciosCabina[i].idServicio)
        }

        for (var i = 0; i < dataPersonalesCabina.length; i++) {
            this.personal.cabina.personales.push(dataPersonalesCabina[i].idPersonal)
        }

        this.personal.idImagen = this.personal.dataPersonal[0].idImagen;
        this.personal.sucursal = this.personal.dataPersonal[0].idSucursal;

        this.personal_consultaServiciosEditarPersonal();
    }

    personal_consultaServiciosEditarPersonal () {
        var params: any = {};
        params.sucursal = this.personal.sucursal;

        this._backService.HttpPost("catalogos/servicio/consultarServicio", {}, params).subscribe((response: string) => {
            this.personal.dataServicio = eval(response);
            var servicioRepetido = false;
            var dataServicioTemp = [];

            for (var i = 0; i < this.personal.dataServicio.length; i++) {
                servicioRepetido = false;
                for (var j = 0; j < this.personal.cabina.servicios.length; j++) {
                    if (this.personal.cabina.servicios[j] == this.personal.dataServicio[i].idServicio) {
                        servicioRepetido = true;
                    }
                }
                if (!servicioRepetido) {
                    dataServicioTemp.push(this.personal.dataServicio[i]);
                }
            }

            this.personal.dataServicio = dataServicioTemp;

            if (this.personal.dataServicio.length > 0) {
                $('#img' + this.personal.idPersonal).addClass('imgActive');
                $('#lbl' + this.personal.idPersonal).addClass('lblActive');

                this.personal_cargarServiciosPersonalEditarPersonal();
            }
            else {
                // Muestra un mensaje en un modal para indicar que la sucursal no cuenta con ningún servicio
                $("#modal-confirmServicios .modal-body").html('<span style="font-weight: 400;">' + this.personalTranslate.msgNAServ + '</span>');
                this.modales.modalConfirmServicios.show();
                this._pantallaServicio.ocultarSpinner();                
            }
        }, 
        (error) => {
            this._pantallaServicio.ocultarSpinner();
            if (error == 'SinSesion' || error == 'SesionCaducada') {
              if (error == 'SinSesion') {
                this._toaster.error(this.personalTranslate.favorIniciarSesion);
              }
              if (error == 'SesionCaducada') {
                this._toaster.error(this.personalTranslate.sesionCaducada);
              }
              this._router.navigate(['/login']);
              return;
            }
            this._toaster.error(this.personalTranslate.errorEliminar);
        });
    }
    
    personal_cargarServiciosPersonalEditarPersonal () {
        this.personal.idPersonalServicio = [];
        this.personal.servicio = [];
        this.personal.serviciosSelected = [];
        var params: any = {};
        params.idPersonal = this.personal.idPersonal;

        this._backService.HttpPost("catalogos/personal/cargarServicioPersonal", {}, params).subscribe((response: string) => {
            this.personal.dataPersonalServicio = eval(response);
            var k = 0;

            for (var i = 0; i < this.personal.dataPersonalServicio.length; i++) {
                for (var j = 0; j < this.personal.dataServicio.length; j++) {
                    if (this.personal.dataPersonalServicio[i].idServicio == this.personal.dataServicio[j].idServicio) {
                        this.personal.serviciosSelected[k] = this.personal.dataServicio[j].idServicio;
                        this.personal.idPersonalServicio[k] = this.personal.dataPersonalServicio[i].idPersonalServicio;
                        k++;

                        break;
                    }
                }
            }
            this.personal.servicio = this.personal.serviciosSelected;
            this.personal.serviciosSeleccionados = JSON.parse(JSON.stringify(this.personal.servicio));

            //this._pantallaServicio.ocultarSpinner(); 30/03
            

            this.personal.funcionesRestantesCargadas = false;
            this.sucursal_cargarSucursalHorariosLaboralesEditarPersonal();
        }, 
        (error) => {
            this._pantallaServicio.ocultarSpinner();
            if (error == 'SinSesion' || error == 'SesionCaducada') {
              if (error == 'SinSesion') {
                this._toaster.error(this.personalTranslate.favorIniciarSesion);
              }
              if (error == 'SesionCaducada') {
                this._toaster.error(this.personalTranslate.sesionCaducada);
              }
              this._router.navigate(['/login']);
              return;
            }
            this._toaster.error(this.personalTranslate.errorEliminar);
        });
    }

    sucursal_cargarSucursalHorariosLaboralesEditarPersonal () {
        var params: any = {};
        params.idSucursal = this.personal.sucursal

        this._backService.HttpPost("catalogos/sucursal/cargarSucursalHorariosLaborales", {}, params).subscribe((response: string) => {
            this.sucursal.dataHorariosLaborales = eval(response);
            this.sucursal.dataHorariosLaboralesCopy = JSON.parse(JSON.stringify(this.sucursal.dataHorariosLaborales));
            for (var i = 0; i < this.sucursal.dataHorariosLaborales.length; i++) {
                var horaInicio = this.sucursal.dataHorariosLaborales[i].horaInicio;
                var minutosInicio = this.sucursal.dataHorariosLaborales[i].minutosInicio;
                var horaFin = this.sucursal.dataHorariosLaborales[i].horaFin;
                var minutosFin = this.sucursal.dataHorariosLaborales[i].minutosFin;
                switch (this.sucursal.dataHorariosLaborales[i].dia) {
                    case 1:
                        this.sucursal.lunes = this.sucursal.dataHorariosLaborales[i].esLaboral;
                        this.sucursal.lunesCargado = JSON.parse(JSON.stringify(this.personal.lunes));
                        this.personal.lunes = this.sucursal.dataHorariosLaborales[i].esLaboral;
                        this.personal.lunesCargado = JSON.parse(JSON.stringify(this.personal.lunes));
                        this.personal.horaInicioLunes = moment(new Date(0, 0, 0, horaInicio, minutosInicio, 0, 0)).format('HH:mm');
                        this.personal.horaFinLunes = moment(new Date(0, 0, 0, horaFin, minutosFin, 0, 0)).format('HH:mm');
                        this.personal.horaIniLu = JSON.parse(JSON.stringify(this.personal.horaInicioLunes));
                        this.personal.horaFiLu = JSON.parse(JSON.stringify(this.personal.horaFinLunes));
                        break;
                    case 2:
                        this.sucursal.martes = this.sucursal.dataHorariosLaborales[i].esLaboral;
                        this.sucursal.martesCargado = JSON.parse(JSON.stringify(this.personal.martes));
                        this.personal.martes = this.sucursal.dataHorariosLaborales[i].esLaboral;
                        this.personal.martesCargado = JSON.parse(JSON.stringify(this.personal.martes));
                        this.personal.horaInicioMartes = moment(new Date(0, 0, 0, horaInicio, minutosInicio, 0, 0)).format('HH:mm');
                        this.personal.horaFinMartes = moment(new Date(0, 0, 0, horaFin, minutosFin, 0, 0)).format('HH:mm');
                        this.personal.horaIniMa = JSON.parse(JSON.stringify(this.personal.horaInicioMartes));
                        this.personal.horaFiMa = JSON.parse(JSON.stringify(this.personal.horaFinMartes));
                        break;
                    case 3:
                        this.sucursal.miercoles = this.sucursal.dataHorariosLaborales[i].esLaboral;
                        this.sucursal.miercolesCargado = JSON.parse(JSON.stringify(this.personal.miercoles));
                        this.personal.miercoles = this.sucursal.dataHorariosLaborales[i].esLaboral;
                        this.personal.miercolesCargado = JSON.parse(JSON.stringify(this.personal.miercoles));
                        this.personal.horaInicioMiercoles = moment(new Date(0, 0, 0, horaInicio, minutosInicio, 0, 0)).format('HH:mm');
                        this.personal.horaFinMiercoles = moment(new Date(0, 0, 0, horaFin, minutosFin, 0, 0)).format('HH:mm');
                        this.personal.horaIniMi = JSON.parse(JSON.stringify(this.personal.horaInicioMiercoles));
                        this.personal.horaFiMi = JSON.parse(JSON.stringify(this.personal.horaFinMiercoles));
                        break;
                    case 4:
                        this.sucursal.jueves = this.sucursal.dataHorariosLaborales[i].esLaboral;
                        this.sucursal.juevesCargado = JSON.parse(JSON.stringify(this.personal.jueves));
                        this.personal.jueves = this.sucursal.dataHorariosLaborales[i].esLaboral;
                        this.personal.juevesCargado = JSON.parse(JSON.stringify(this.personal.jueves));
                        this.personal.horaInicioJueves = moment(new Date(0, 0, 0, horaInicio, minutosInicio, 0, 0)).format('HH:mm');
                        this.personal.horaFinJueves = moment(new Date(0, 0, 0, horaFin, minutosFin, 0, 0)).format('HH:mm');
                        this.personal.horaIniJu = JSON.parse(JSON.stringify(this.personal.horaInicioJueves));
                        this.personal.horaFiJu = JSON.parse(JSON.stringify(this.personal.horaFinJueves));
                        break;
                    case 5:
                        this.sucursal.viernes = this.sucursal.dataHorariosLaborales[i].esLaboral;
                        this.sucursal.viernesCargado = JSON.parse(JSON.stringify(this.personal.viernes));
                        this.personal.viernes = this.sucursal.dataHorariosLaborales[i].esLaboral;
                        this.personal.viernesCargado = JSON.parse(JSON.stringify(this.personal.viernes));
                        this.personal.horaInicioViernes = moment(new Date(0, 0, 0, horaInicio, minutosInicio, 0, 0)).format('HH:mm');
                        this.personal.horaFinViernes = moment(new Date(0, 0, 0, horaFin, minutosFin, 0, 0)).format('HH:mm');
                        this.personal.horaIniVi = JSON.parse(JSON.stringify(this.personal.horaInicioViernes));
                        this.personal.horaFiVi = JSON.parse(JSON.stringify(this.personal.horaFinViernes));
                        break;
                    case 6:
                        this.sucursal.sabado = this.sucursal.dataHorariosLaborales[i].esLaboral;
                        this.sucursal.sabadoCargado = JSON.parse(JSON.stringify(this.personal.sabado));
                        this.personal.sabado = this.sucursal.dataHorariosLaborales[i].esLaboral;
                        this.personal.sabadoCargado = JSON.parse(JSON.stringify(this.personal.sabado));
                        this.personal.horaInicioSabado = moment(new Date(0, 0, 0, horaInicio, minutosInicio, 0, 0)).format('HH:mm');
                        this.personal.horaFinSabado = moment(new Date(0, 0, 0, horaFin, minutosFin, 0, 0)).format('HH:mm');
                        this.personal.horaIniSa = JSON.parse(JSON.stringify(this.personal.horaInicioSabado));
                        this.personal.horaFiSa = JSON.parse(JSON.stringify(this.personal.horaFinSabado));
                        break;
                    case 7:
                        this.sucursal.domingo = this.sucursal.dataHorariosLaborales[i].esLaboral;
                        this.sucursal.domingoCargado = JSON.parse(JSON.stringify(this.personal.domingo));
                        this.personal.domingo = this.sucursal.dataHorariosLaborales[i].esLaboral;
                        this.personal.domingoCargado = JSON.parse(JSON.stringify(this.personal.domingo));
                        this.personal.horaInicioDomingo = moment(new Date(0, 0, 0, horaInicio, minutosInicio, 0, 0)).format('HH:mm');
                        this.personal.horaFinDomingo = moment(new Date(0, 0, 0, horaFin, minutosFin, 0, 0)).format('HH:mm');
                        this.personal.horaIniDo = JSON.parse(JSON.stringify(this.personal.horaInicioDomingo));
                        this.personal.horaFiDo = JSON.parse(JSON.stringify(this.personal.horaFinDomingo));
                        break;
                }
            }

            this.personal_cargarPersonalHorariosLaboralesEditarPersonal();
        }, 
        (error) => {
            this._pantallaServicio.ocultarSpinner();
            if (error == 'SinSesion' || error == 'SesionCaducada') {
              if (error == 'SinSesion') {
                this._toaster.error(this.personalTranslate.favorIniciarSesion);
              }
              if (error == 'SesionCaducada') {
                this._toaster.error(this.personalTranslate.sesionCaducada);
              }
              this._router.navigate(['/login']);
              return;
            }
            this._toaster.error(this.personalTranslate.errorEliminar);
        });
    }

    personal_cargarPersonalHorariosLaboralesEditarPersonal () {
        var params: any = {};
        params.idPersonal = this.personal.idPersonal;

        this._backService.HttpPost("catalogos/personal/cargarPersonalHorariosLaborales", {}, params).subscribe((response: string) => {
            this.personal.dataHorariosLaborales = eval(response);
            this.personal.dataHorariosLaboralesCopy = JSON.parse(JSON.stringify(this.personal.dataHorariosLaborales));
            for (var i = 0; i < this.personal.dataHorariosLaborales.length; i++) {
                var horaInicio = this.personal.dataHorariosLaborales[i].horaInicio;
                var minutosInicio = this.personal.dataHorariosLaborales[i].minutosInicio;
                var horaFin = this.personal.dataHorariosLaborales[i].horaFin;
                var minutosFin = this.personal.dataHorariosLaborales[i].minutosFin;
                switch (this.personal.dataHorariosLaborales[i].dia) {
                    case 1:
                        this.personal.lunes = this.personal.dataHorariosLaborales[i].esLaboral;
                        this.personal.horaInicioLunes = moment(new Date(0, 0, 0, horaInicio, minutosInicio, 0, 0)).format('HH:mm');
                        this.personal.horaFinLunes = moment(new Date(0, 0, 0, horaFin, minutosFin, 0, 0)).format('HH:mm');
                        this.personal.horaIniLu = JSON.parse(JSON.stringify(this.personal.horaInicioLunes));
                        this.personal.horaFiLu = JSON.parse(JSON.stringify(this.personal.horaFinLunes));
                        break;
                    case 2:
                        this.personal.martes = this.personal.dataHorariosLaborales[i].esLaboral;
                        this.personal.horaInicioMartes = moment(new Date(0, 0, 0, horaInicio, minutosInicio, 0, 0)).format('HH:mm');
                        this.personal.horaFinMartes = moment(new Date(0, 0, 0, horaFin, minutosFin, 0, 0)).format('HH:mm');
                        this.personal.horaIniMa = JSON.parse(JSON.stringify(this.personal.horaInicioMartes));
                        this.personal.horaFiMa = JSON.parse(JSON.stringify(this.personal.horaFinMartes));
                        break;
                    case 3:
                        this.personal.miercoles = this.personal.dataHorariosLaborales[i].esLaboral;
                        this.personal.horaInicioMiercoles = moment(new Date(0, 0, 0, horaInicio, minutosInicio, 0, 0)).format('HH:mm');
                        this.personal.horaFinMiercoles = moment(new Date(0, 0, 0, horaFin, minutosFin, 0, 0)).format('HH:mm');
                        this.personal.horaIniMi = JSON.parse(JSON.stringify(this.personal.horaInicioMiercoles));
                        this.personal.horaFiMi = JSON.parse(JSON.stringify(this.personal.horaFinMiercoles));
                        break;
                    case 4:
                        this.personal.jueves = this.personal.dataHorariosLaborales[i].esLaboral;
                        this.personal.horaInicioJueves = moment(new Date(0, 0, 0, horaInicio, minutosInicio, 0, 0)).format('HH:mm');
                        this.personal.horaFinJueves = moment(new Date(0, 0, 0, horaFin, minutosFin, 0, 0)).format('HH:mm');
                        this.personal.horaIniJu = JSON.parse(JSON.stringify(this.personal.horaInicioJueves));
                        this.personal.horaFiJu = JSON.parse(JSON.stringify(this.personal.horaFinJueves));
                        break;
                    case 5:
                        this.personal.viernes = this.personal.dataHorariosLaborales[i].esLaboral;
                        this.personal.horaInicioViernes = moment(new Date(0, 0, 0, horaInicio, minutosInicio, 0, 0)).format('HH:mm');
                        this.personal.horaFinViernes = moment(new Date(0, 0, 0, horaFin, minutosFin, 0, 0)).format('HH:mm');
                        this.personal.horaIniVi = JSON.parse(JSON.stringify(this.personal.horaInicioViernes));
                        this.personal.horaFiVi = JSON.parse(JSON.stringify(this.personal.horaFinViernes));
                        break;
                    case 6:
                        this.personal.sabado = this.personal.dataHorariosLaborales[i].esLaboral;
                        this.personal.horaInicioSabado = moment(new Date(0, 0, 0, horaInicio, minutosInicio, 0, 0)).format('HH:mm');
                        this.personal.horaFinSabado = moment(new Date(0, 0, 0, horaFin, minutosFin, 0, 0)).format('HH:mm');
                        this.personal.horaIniSa = JSON.parse(JSON.stringify(this.personal.horaInicioSabado));
                        this.personal.horaFiSa = JSON.parse(JSON.stringify(this.personal.horaFinSabado));
                        break;
                    case 7:
                        this.personal.domingo = this.personal.dataHorariosLaborales[i].esLaboral;
                        this.personal.horaInicioDomingo = moment(new Date(0, 0, 0, horaInicio, minutosInicio, 0, 0)).format('HH:mm');
                        this.personal.horaFinDomingo = moment(new Date(0, 0, 0, horaFin, minutosFin, 0, 0)).format('HH:mm');
                        this.personal.horaIniDo = JSON.parse(JSON.stringify(this.personal.horaInicioDomingo));
                        this.personal.horaFiDo = JSON.parse(JSON.stringify(this.personal.horaFinDomingo));
                        break;
                }
            }

            this.personal_cargarPersonalHorariosDescansosEditarPersonal();
        }, 
        (error) => {
            this._pantallaServicio.ocultarSpinner();
            if (error == 'SinSesion' || error == 'SesionCaducada') {
              if (error == 'SinSesion') {
                this._toaster.error(this.personalTranslate.favorIniciarSesion);
              }
              if (error == 'SesionCaducada') {
                this._toaster.error(this.personalTranslate.sesionCaducada);
              }
              this._router.navigate(['/login']);
              return;
            }
            this._toaster.error(this.personalTranslate.errorEliminar);
        });
    }

    personal_cargarPersonalHorariosDescansosEditarPersonal () {
        var params: any = {};
        params.idPersonal = this.personal.idPersonal;

        this._backService.HttpPost("catalogos/personal/cargarPersonalHorariosDescansos", {}, params).subscribe((response: string) => {
            this.personal.dataHorariosDescansos = eval(response);
            $('#img' + this.personal.idPersonal).addClass('imgActive');
            $('#lbl' + this.personal.idPersonal).addClass('lblActive');
            //this._pantallaServicio.ocultarSpinner(); 30/03
            
            if (this.cargarDatosGenerales) {
                this.cargarDatosGenerales = false;
                $("#datosGenerales").show();
                $("#btnGuardar").show();
            }
            for (var i = 0; i < this.personal.dataHorariosDescansos.length; i++) {
                var horaInicio = this.personal.dataHorariosDescansos[i].horaInicio;
                var minutosInicio = this.personal.dataHorariosDescansos[i].minutosInicio;
                var horaFin = this.personal.dataHorariosDescansos[i].horaFin;
                var minutosFin = this.personal.dataHorariosDescansos[i].minutosFin;
                switch (this.personal.dataHorariosDescansos[i].dia) {
                    case 1:
                        this.personal.contadorLunes++;
                        this.personal.objetoLunes.push({ horaInicio: moment(new Date(0, 0, 0, horaInicio, minutosInicio, 0, 0)).format('HH:mm'), horaFin: moment(new Date(0, 0, 0, horaFin, minutosFin, 0, 0)).format('HH:mm') });
                        break;
                    case 2:
                        this.personal.contadorMartes++;
                        this.personal.objetoMartes.push({ horaInicio: moment(new Date(0, 0, 0, horaInicio, minutosInicio, 0, 0)).format('HH:mm'), horaFin: moment(new Date(0, 0, 0, horaFin, minutosFin, 0, 0)).format('HH:mm') })
                        break;
                    case 3:
                        this.personal.contadorMiercoles++;
                        this.personal.objetoMiercoles.push({ horaInicio: moment(new Date(0, 0, 0, horaInicio, minutosInicio, 0, 0)).format('HH:mm'), horaFin: moment(new Date(0, 0, 0, horaFin, minutosFin, 0, 0)).format('HH:mm') })
                        break;
                    case 4:
                        this.personal.contadorJueves++;
                        this.personal.objetoJueves.push({ horaInicio: moment(new Date(0, 0, 0, horaInicio, minutosInicio, 0, 0)).format('HH:mm'), horaFin: moment(new Date(0, 0, 0, horaFin, minutosFin, 0, 0)).format('HH:mm') })
                        break;
                    case 5:
                        this.personal.contadorViernes++;
                        this.personal.objetoViernes.push({ horaInicio: moment(new Date(0, 0, 0, horaInicio, minutosInicio, 0, 0)).format('HH:mm'), horaFin: moment(new Date(0, 0, 0, horaFin, minutosFin, 0, 0)).format('HH:mm') })
                        break;
                    case 6:
                        this.personal.contadorSabado++;
                        this.personal.objetoSabado.push({ horaInicio: moment(new Date(0, 0, 0, horaInicio, minutosInicio, 0, 0)).format('HH:mm'), horaFin: moment(new Date(0, 0, 0, horaFin, minutosFin, 0, 0)).format('HH:mm') })
                        break;
                    case 7:
                        this.personal.contadorDomingo++;
                        this.personal.objetoDomingo.push({ horaInicio: moment(new Date(0, 0, 0, horaInicio, minutosInicio, 0, 0)).format('HH:mm'), horaFin: moment(new Date(0, 0, 0, horaFin, minutosFin, 0, 0)).format('HH:mm') })
                        break;
                }
            }

            this.personal.objetoLu = JSON.parse(JSON.stringify(this.personal.objetoLunes));
            this.personal.objetoMa = JSON.parse(JSON.stringify(this.personal.objetoMartes));
            this.personal.objetoMi = JSON.parse(JSON.stringify(this.personal.objetoMiercoles));
            this.personal.objetoJu = JSON.parse(JSON.stringify(this.personal.objetoJueves));
            this.personal.objetoVi = JSON.parse(JSON.stringify(this.personal.objetoViernes));
            this.personal.objetoSa = JSON.parse(JSON.stringify(this.personal.objetoSabado));
            this.personal.objetoDo = JSON.parse(JSON.stringify(this.personal.objetoDomingo));

            $('#divPersonales').css('pointer-events', 'visible');
            $('#btnNuevo').css('pointer-events', 'visible');

            this.consultarCategoriasEditarPersonal();
        }, 
        (error) => {
            this._pantallaServicio.ocultarSpinner();
            if (error == 'SinSesion' || error == 'SesionCaducada') {
              if (error == 'SinSesion') {
                this._toaster.error(this.personalTranslate.favorIniciarSesion);
              }
              if (error == 'SesionCaducada') {
                this._toaster.error(this.personalTranslate.sesionCaducada);
              }
              this._router.navigate(['/login']);
              return;
            }
            this._toaster.error(this.personalTranslate.errorEliminar);
        });
    }

    consultarCategoriasEditarPersonal() {
        this.categoria.dataCategorias = [];
        this.categoria.dataCategoriasMostrar = [];
        this.categoria.categoriasDelPersonal = [];

        this._backService.HttpPost("catalogos/personal/consultarCategorias", {}, {}).subscribe((response: string) => {
            var dataAux = eval(response);
            var idComisionCategoriaAux = 0;
            var i = 0;
            var cat = 0;

            while (i < dataAux.length) {
                if (idComisionCategoriaAux != dataAux[i].idComisionCategoria) {
                    cat++;
                    idComisionCategoriaAux = dataAux[i].idComisionCategoria;
                    this.categoria.dataCategorias[cat - 1] = {};
                    this.categoria.dataCategorias[cat - 1].idCategoria = dataAux[i].idComisionCategoria;
                    this.categoria.dataCategorias[cat - 1].descripcion = dataAux[i].nombreCategoria;
                    this.categoria.dataCategorias[cat - 1].ver = false;
                    this.categoria.dataCategorias[cat - 1].activa = true;
                    this.categoria.dataCategorias[cat - 1].servicios = [];
                    this.categoria.dataCategorias[cat - 1].productos = [];
                    this.categoria.dataCategorias[cat - 1].paquetes = [];

                    if (dataAux[i].comision == 'Servicio') {
                        this.categoria.dataCategorias[cat - 1].servicios.push({ "idServicio": dataAux[i].idProductoServicio, "descripcion": dataAux[i].nombreProductoServicio, "tipo": dataAux[i].tipoComision, "cantidad": dataAux[i].valorComision });
                    }
                    if (dataAux[i].comision == 'Producto') {
                        this.categoria.dataCategorias[cat - 1].productos.push({ "idProducto": dataAux[i].idProductoServicio, "descripcion": dataAux[i].nombreProductoServicio, "tipo": dataAux[i].tipoComision, "cantidad": dataAux[i].valorComision });
                    }
                    if (dataAux[i].comision == 'Paquete') {
                        this.categoria.dataCategorias[cat - 1].paquetes.push({ "idPaqueteSucursal": dataAux[i].idProductoServicio, "descripcion": dataAux[i].nombreProductoServicio, "tipo": dataAux[i].tipoComision, "cantidad": dataAux[i].valorComision });
                    }
                }
                else {
                    if (dataAux[i].comision == 'Servicio') {
                        this.categoria.dataCategorias[cat - 1].servicios.push({ "idServicio": dataAux[i].idProductoServicio, "descripcion": dataAux[i].nombreProductoServicio, "tipo": dataAux[i].tipoComision, "cantidad": dataAux[i].valorComision });
                    }
                    if (dataAux[i].comision == 'Producto') {
                        this.categoria.dataCategorias[cat - 1].productos.push({ "idProducto": dataAux[i].idProductoServicio, "descripcion": dataAux[i].nombreProductoServicio, "tipo": dataAux[i].tipoComision, "cantidad": dataAux[i].valorComision });
                    }
                    if (dataAux[i].comision == 'Paquete') {
                        this.categoria.dataCategorias[cat - 1].paquetes.push({ "idPaqueteSucursal": dataAux[i].idProductoServicio, "descripcion": dataAux[i].nombreProductoServicio, "tipo": dataAux[i].tipoComision, "cantidad": dataAux[i].valorComision });
                    }
                }
                i++;
            }
            this.categoria.dataCategoriasMostrar = JSON.parse(JSON.stringify(this.categoria.dataCategorias));

            this.consultarCategoriasPorPersonalEditarPersonal();
        }, 
        (error) => {
            this._pantallaServicio.ocultarSpinner();
            if (error == 'SinSesion' || error == 'SesionCaducada') {
              if (error == 'SinSesion') {
                this._toaster.error(this.personalTranslate.favorIniciarSesion);
              }
              if (error == 'SesionCaducada') {
                this._toaster.error(this.personalTranslate.sesionCaducada);
              }
              this._router.navigate(['/login']);
              return;
            }
            this._toaster.error(this.personalTranslate.errorEliminar);
        });
    }

    consultarCategoriasPorPersonalEditarPersonal() {
        this.categoria.categoriasDelPersonal = [];
        var params: any = {};
        params.idPersonal = this.personal.dataPersonal[0].idPersonal;

        this._backService.HttpPost("catalogos/personal/consultarCategoriasPorPersonal", {}, params).subscribe((response: string) => {
            var dataAux = eval(response);
            for (var i = 0; i < dataAux.length; i++) {
                for (var j = 0; j < this.categoria.dataCategoriasMostrar.length; j++) {
                    if (dataAux[i].idComisionCategoria == this.categoria.dataCategoriasMostrar[j].idCategoria) {
                        this.categoria.categoriasDelPersonal.push(this.categoria.dataCategoriasMostrar[j]);
                        this.categoria.dataCategoriasMostrar.splice(j, 1);
                        j--;
                    }
                }
            }

            this.personal_consultarFotosPersonalEditarPersonal();
        }, 
        (error) => {
            this._pantallaServicio.ocultarSpinner();
            if (error == 'SinSesion' || error == 'SesionCaducada') {
              if (error == 'SinSesion') {
                this._toaster.error(this.personalTranslate.favorIniciarSesion);
              }
              if (error == 'SesionCaducada') {
                this._toaster.error(this.personalTranslate.sesionCaducada);
              }
              this._router.navigate(['/login']);
              return;
            }
            this._toaster.error(this.personalTranslate.errorEliminar);
        });
    }
    
    personal_consultarFotosPersonalEditarPersonal() {
        var params: any = {};
        params.idPersonales = this.idPersonales;

        this._backService.HttpPost("catalogos/personal/consultarFotosPersonal", {}, params).subscribe((response: string) => {
            this.personal.dataFotosPersonal = eval(response);
            for (var i = 0; i < this.personal.dataFotosPersonal.length; i++) {
                for (var j = 0; j < this.personal.dataPersonales.length; j++) {
                    if (this.personal.dataFotosPersonal[i].idImagen == this.personal.dataPersonales[j].idImagen) {
                        this.personal.dataPersonales[j].codigoFoto = this.personal.dataFotosPersonal[i].codigo;
                        if (document.getElementById('img' + this.personal.dataPersonales[j].idPersonal))
                            var ebi_ImagenDatosGenerales: any = document.getElementById('img' + this.personal.dataPersonales[j].idPersonal);
                            ebi_ImagenDatosGenerales.src = this.personal.dataFotosPersonal[i].codigo;
                            break;
                    }
                }
            }

            this.personal_cargarImagenEditarPersonal();
        }, 
        (error) => {
            this._pantallaServicio.ocultarSpinner();
            if (error == 'SinSesion' || error == 'SesionCaducada') {
              if (error == 'SinSesion') {
                this._toaster.error(this.personalTranslate.favorIniciarSesion);
              }
              if (error == 'SesionCaducada') {
                this._toaster.error(this.personalTranslate.sesionCaducada);
              }
              this._router.navigate(['/login']);
              return;
            }
            this._toaster.error(this.personalTranslate.errorEliminar);
        });
    }
    
    personal_cargarImagenEditarPersonal () {
        if (this.personal.idImagen != null) {
            var params: any = {};
            params.idImagen = this.personal.idImagen;

            this._backService.HttpPost("catalogos/imagen/cargarImagen", {}, params).subscribe((response: string) => {
                this.personal.dataImagen = eval(response);
                this.personal.imagenRecortada = this.personal.dataImagen[0].codigo;
                this.personal.imagenCargada = JSON.parse(JSON.stringify(this.personal.imagenRecortada));
                this.imagenCompleta = JSON.parse(JSON.stringify(this.personal.imagenRecortada));

                if (this.personal.dataImagen[0].tipoContenido != null || this.personal.dataImagen[0].tipoContenido != undefined) {
                    this.personal.tipoContenidoLogo = this.personal.dataImagen[0].tipoContenido;
                }
                else {
                    this.personal.tipoContenidoLogo = "";
                }

                if (document.getElementById("txtImagen")) {
                    var ebi_txtImagen: any = document.getElementById("txtImagen");
                    ebi_txtImagen.src = this.personal.imagenRecortada;
                }

                $("#btnBorrarImagen").css("display", "block");
                this.personal.permitirCargarDescansos = true;
                this.hora = [];
                $('#btnGuardar').css('pointer-events', 'visible');
                $("#btnGuardar").removeClass("loading");
                var horaInicio = moment().startOf("day");
                var horaFin = moment().endOf("day");

                for (horaInicio; horaInicio < horaFin; horaInicio.add("m", 15)) {
                    this.hora.push(horaInicio.format("HH:mm"));
                }

                this.hora.push(moment().hour(23).minute(59).format("HH:mm"));
                this._pantallaServicio.ocultarSpinner();
            }, 
            (error) => {
                this._pantallaServicio.ocultarSpinner();
                if (error == 'SinSesion' || error == 'SesionCaducada') {
                  if (error == 'SinSesion') {
                    this._toaster.error(this.personalTranslate.favorIniciarSesion);
                  }
                  if (error == 'SesionCaducada') {
                    this._toaster.error(this.personalTranslate.sesionCaducada);
                  }
                  this._router.navigate(['/login']);
                  return;
                }
                this._toaster.error(this.personalTranslate.errorEliminar);
            });
        }
        else {
            if (document.getElementById("txtImagen")) {
                var ebi_txtImagen: any = document.getElementById("txtImagen");
                ebi_txtImagen.src = "assets/images/migracion/Imagen-Foto-300x300.png";
            }

            this.personal.imagenRecortada = "";
            this.personal.imagenCargada = JSON.parse(JSON.stringify(this.personal.imagenRecortada));
            $('#btnGuardar').css('pointer-events', 'visible');
            $("#btnGuardar").removeClass("loading");
            this.hora = [];
            var horaInicio = moment().startOf("day");
            var horaFin = moment().endOf("day");

            for (horaInicio; horaInicio < horaFin; horaInicio.add("m", 15)) {
                this.hora.push(horaInicio.format("HH:mm"));
            }

            this.hora.push(moment().hour(23).minute(59).format("HH:mm"));
            this._pantallaServicio.ocultarSpinner();
        }
    }

    // ---------------------------------------- Actualizar Personal ----------------------------------------- 
    // Función que actualiza un personal
    personal_actualizarPersonal(idPersonal: any) {
        //this.tab.selectedIndex = 0;
        this._pantallaServicio.mostrarSpinner();

        setTimeout(() => {
            this.guardar = true;
            this.personal_validarCamposRequeridos();
            this.msgHorariosLaboral = "";
            $('#btnNuevo').css("pointer-events", "none");
            if (this.validTabDatosGenerales) {
                this.validarRangoHoras();
                if (this.validLunes && this.validMartes && this.validMiercoles && this.validJueves && this.validViernes && this.validSabado && this.validDomingo) {
                    if (this.personal.lunes || this.personal.martes || this.personal.miercoles || this.personal.jueves || this.personal.viernes || this.personal.sabado || this.personal.domingo) {
                        this.personal_aceptarDescansos();
                        if (this.personal.DescansosValidados) {
                            this.validarRangoHorasCitasPersonal = true; //Funcion para la validacion de los horarios de personal
                            this.validarRangoHorasCitasPersonalf(); //Funcion para la validacion de los horarios de personal
                            this.actualizarContadorCabina(); //Funcion para la validacion de Cabina
                        } else {
                            $('#divPersonales').css('pointer-events', 'visible');
                            $('#btnNuevo').css('pointer-events', 'visible');
                            $('#btnGuardar').css('pointer-events', 'visible');
                            $('#btnDescartar').css('pointer-events', 'visible');
                            this._pantallaServicio.ocultarSpinner();
                            
                            this.rootScope_stopChange = true;
                            $("#btnGuardar").removeClass("loading");
                        }
                    }
                    else {
                        setTimeout(() =>{
                            this.validPestañaHorarios();
                            this.msgHorariosLaboral = this.personalTranslate.horariolb;
                            $('#divPersonales').css('pointer-events', 'visible');
                            $('#btnNuevo').css('pointer-events', 'visible');
                            $('#btnGuardar').css('pointer-events', 'visible');
                            $('#btnDescartar').css('pointer-events', 'visible');
                            this._pantallaServicio.ocultarSpinner();
                            
                            this.rootScope_stopChange = true;
                            $("#btnGuardar").removeClass("loading");
                        }, 50);
                    }
                }
                else {
                    setTimeout(() =>{
                        this.validPestañaHorarios();
                        $('#divPersonales').css('pointer-events', 'visible');
                        $('#btnNuevo').css('pointer-events', 'visible');
                        $('#btnGuardar').css('pointer-events', 'visible');
                        $('#btnDescartar').css('pointer-events', 'visible');
                        this._pantallaServicio.ocultarSpinner();
                        
                        this.rootScope_stopChange = true;
                        $("#btnGuardar").removeClass("loading");
                    }, 50);
                }
            }
            else {
                $('#divPersonales').css('pointer-events', 'visible');
                $('#btnNuevo').css('pointer-events', 'visible');
                $('#btnGuardar').css('pointer-events', 'visible');
                $('#btnDescartar').css('pointer-events', 'visible');
                this._pantallaServicio.ocultarSpinner();
                
                this.rootScope_stopChange = true;
                $("#btnGuardar").removeClass("loading");
            }
        }, 50);
    }

    consultarPersonalEditarPersonal(idPersonal: any) {
        this._pantallaServicio.mostrarSpinner();

        this._backService.HttpPost("catalogos/personal/consultaPersonal", {}, {}).subscribe((response: string) => {
            var dataTemp = [];
            var dataPersonales = [];
            var dataServiciosCabina = [];
            var dataPersonalesCabina = [];

            dataTemp = eval(response);
            dataPersonales = dataTemp[0];
            dataServiciosCabina = dataTemp[1];
            dataPersonalesCabina = dataTemp[2];

            this.idPersonales = "";

            for (var i = 0; i < dataPersonales.length; i++) {
                dataPersonales[i].codigoFoto = "assets/images/migracion/Imagen-PersonaGris-300x300.png";
                this.idPersonales += dataPersonales[i].idPersonal + ",";

                if (dataPersonales[i].visibleAgenda == 1) {
                    dataPersonales[i].visibleAgenda = true;
                }
                if (dataPersonales[i].visibleAgenda == 0) {
                    dataPersonales[i].visibleAgenda = false;
                }
            }
            this.personal.dataPersonales = dataPersonales;

            if (this.personal.dataPersonales.length >= this._pantallaServicio.empresaPremium_configuracion.cantidadPersonales) {
                $("#btnNuevo").css("display", "none");
            } else {
                $("#btnNuevo").css("display", "inline");
            }

            if (this.personal.dataPersonales.length >= 9) {
                $("#navlist").css("float", "left");
            } else {
                $("#navlist").css("float", "right");
            }

            this.personal.idPersonal = idPersonal;
            this.personal_cargarPersonalEditarPersonal(idPersonal);
            this.personal_consultarFotosPersonalEditarPersonal();
        }, 
        (error) => {
            this._pantallaServicio.ocultarSpinner();
            if (error == 'SinSesion' || error == 'SesionCaducada') {
              if (error == 'SinSesion') {
                this._toaster.error(this.personalTranslate.favorIniciarSesion);
              }
              if (error == 'SesionCaducada') {
                this._toaster.error(this.personalTranslate.sesionCaducada);
              }
              this._router.navigate(['/login']);
              return;
            }
            this._toaster.error(this.personalTranslate.errorEliminar);
        });
    }

    /*personal_consultarFotosPersonalEditarPersonal () { //REPETIDA
        var params: any = {};
        params.idPersonales = this.idPersonales;
        fcPersonal.consultarFotosPersonal(params).success(function (data) {
            this.personal.dataFotosPersonal = eval(data.d);
            for (var i = 0; i < this.personal.dataFotosPersonal.length; i++) {
                for (var j = 0; j < this.personal.dataPersonales.length; j++) {
                    if (this.personal.dataFotosPersonal[i].idImagen == this.personal.dataPersonales[j].idImagen) {
                        this.personal.dataPersonales[j].codigoFoto = this.personal.dataFotosPersonal[i].codigo;
                        if (document.getElementById('img' + this.personal.dataPersonales[j].idPersonal))
                            document.getElementById('img' + this.personal.dataPersonales[j].idPersonal).src = this.personal.dataFotosPersonal[i].codigo;

                        break;
                    }
                }
            }

            this.personal_cargarImagenPrimeraCarga();

        }).error(function (data, status) {
        });
    }*/
    // ----------------------------------------------- Cabina ----------------------------------------------- 
    transformarPersonalCabina() { 
        setTimeout(() => {
            if (this.personal.cabina.isCabina) {
                this.nuevoPersonalCabina();
            }
            else {
                this.nuevoPersonal();
            }
        }, 50);
    }
    
    nuevoPersonalCabina() {
        $('#btnNuevo').css("display", "none");
        $('#divPersonales').css('pointer-events', 'none');
        $('#btnGuardar').css('pointer-events', 'none');
        $('#btnDescartar').css('pointer-events', 'none');
        $('#img' + this.personal.idPersonal).removeClass("imgActive");
        $('#lbl' + this.personal.idPersonal).removeClass("lblActive");

        this.validPestañaDatosGenerales();

        this.limpiarValidaciones();
        this.personal.sucursal = "";
        this.personal.servicio = [];
        this.personal.nombre = "";
        this.guardarSinRecortar = false;
        this.personal.tipoContenidoLogo = "";
        this.personal.telefono = "";
        this.personal.email = "";
        this.personal.comisionServicio = "0";
        this.personal.comisionProducto = "0";
        this.personal.vendedor = false;
        this.personal.imagen = "";
        this.personal.imagenRecortada = "";
        this.personal.imagenCargada = "";
        this.personal.lunesCargado = true;
        this.personal.martesCargado = true;
        this.personal.miercolesCargado = true;
        this.personal.juevesCargado = true;
        this.personal.viernesCargado = true;
        this.personal.sabadoCargado = false;
        this.personal.domingoCargado = false;
        this.personal.lunes = true;
        this.personal.martes = true;
        this.personal.miercoles = true;
        this.personal.jueves = true;
        this.personal.viernes = true;
        this.personal.sabado = false;
        this.personal.domingo = false;
        this.personal.visibleAgenda = true;

        this.personal.cabina.isPersonalNuevo = true;
        this.personal.cabina.servicios = [];
        this.personal.cabina.personales = [];

        this.guardar = false;
        this.accion = "Nuevo";
        this.rootScope_accionPersonal = "Nuevo";
        this.primeraCarga = false;

        this.msgImagen = "";
        this.validImagen = true;
        this.validEmail = true;
        this.validTelefono = true;
        this.stopChange = false;
        this.agenda = "";
        this.validDescartar = false

        this.personal.contadorLunes = 0;
        this.personal.contadorMartes = 0;
        this.personal.contadorMiercoles = 0;
        this.personal.contadorJueves = 0;
        this.personal.contadorViernes = 0;
        this.personal.contadorSabado = 0;
        this.personal.contadorDomingo = 0;

        this.personal.objetoLunes = [];
        this.personal.objetoMartes = [];
        this.personal.objetoMiercoles = [];
        this.personal.objetoJueves = [];
        this.personal.objetoViernes = [];
        this.personal.objetoSabado = [];
        this.personal.objetoDomingo = [];

        this.msgLunesDescansos = [];
        this.msgMartesDescansos = [];
        this.msgMiercolesDescansos = [];
        this.msgJuevesDescansos = [];
        this.msgViernesDescansos = [];
        this.msgSabadoDescansos = [];
        this.msgDomingoDescansos = [];

        this.validContadorLunes = true;
        this.validContadorMartes = true;
        this.validContadorMiercoles = true;
        this.validContadorJueves = true;
        this.validContadorViernes = true;
        this.validContadorSabado = true;
        this.validContadorDomingo = true;

        this.personal.validDescansosEnLunes = [];
        this.personal.validDescansosEnMartes = [];
        this.personal.validDescansosEnMiercoles = [];
        this.personal.validDescansosEnJueves = [];
        this.personal.validDescansosEnViernes = [];
        this.personal.validDescansosEnSabado = [];
        this.personal.validDescansosEnDomingo = [];

        this.personal.validRangosDescansosLunes = [];
        this.personal.validRangosDescansosMartes = [];
        this.personal.validRangosDescansosMiercoles = [];
        this.personal.validRangosDescansosJueves = [];
        this.personal.validRangosDescansosViernes = [];
        this.personal.validRangosDescansosSabado = [];
        this.personal.validRangosDescansosDomingo = [];

        this.validEmpalmeLunes = [];
        this.validEmpalmeMartes = [];
        this.validEmpalmeMiercoles = [];
        this.validEmpalmeJueves = [];
        this.validEmpalmeViernes = [];
        this.validEmpalmeSabado = [];
        this.validEmpalmeDomingo = [];

        this.personal.lunesValidDescartar = []
        this.personal.martesValidDescartar = [];
        this.personal.miercolesValidDescartar = [];
        this.personal.juevesValidDescartar = [];
        this.personal.viernesValidDescartar = [];
        this.personal.sabadoValidDescartar = [];
        this.personal.domingoValidDescartar = [];

        var ebi_txtImagen: any = document.getElementById("txtImagen");
        ebi_txtImagen.src = "assets/images/migracion/Imagen-Foto-300x300.png";
        this.personal.horaInicioLunes = "09:00";
        this.personal.horaFinLunes = "18:00";
        this.personal.horaInicioMartes = "09:00";
        this.personal.horaFinMartes = "18:00";
        this.personal.horaInicioMiercoles = "09:00";
        this.personal.horaFinMiercoles = "18:00";
        this.personal.horaInicioJueves = "09:00";
        this.personal.horaFinJueves = "18:00";
        this.personal.horaInicioViernes = "09:00";
        this.personal.horaFinViernes = "18:00";
        this.personal.horaInicioSabado = "09:00";
        this.personal.horaFinSabado = "18:00";
        this.personal.horaInicioDomingo = "09:00";
        this.personal.horaFinDomingo = "18:00";
        ebi_txtImagen.src = "assets/images/migracion/Imagen-Foto-300x300.png";
        $("#btnBorrarImagen").css("display", "none");

        this.personal.colores = [];
        this.personal.colores[0] = "#5A5A5A";
        this.personal.colores[1] = "#0A2A38";
        this.personal.colores[2] = "#58b578";
        this.personal.colores[3] = "#357EC1";
        this.personal.colores[4] = "#B32032";
        this.personal.colores[5] = "#054353";
        this.personal.colores[6] = "#FCDD1A";
        this.personal.colores[7] = "#24557D";
        this.personal.colores[8] = "#4B296B";
        this.personal.colores[9] = "#99244A";
        this.personal.colores[10] = "#EC6351";
        this.personal.colores[11] = "#377D7B";
        this.personal.colores[12] = "#E1E1E1";

        this.numRandom = this.getRandomInt(0, 12);
        this.color =  this.personal.colores[this.numRandom];
        this._backService.HttpPost("catalogos/personal/cargarIdSucursal", {}, {}).subscribe((response: string) => {
            this.personal.sucursal = eval(response);
            this.personal.sucursalCargada = JSON.parse(JSON.stringify(this.personal.sucursal));
            this.personal_consultaServiciosNuevaCabina();
        }, 
        (error) => {
            this._pantallaServicio.ocultarSpinner();
            if (error == 'SinSesion' || error == 'SesionCaducada') {
              if (error == 'SinSesion') {
                this._toaster.error(this.personalTranslate.favorIniciarSesion);
              }
              if (error == 'SesionCaducada') {
                this._toaster.error(this.personalTranslate.sesionCaducada);
              }
              this._router.navigate(['/login']);
              return;
            }
            this._toaster.error(this.personalTranslate.errorEliminar);
        });
    }

    personal_consultaServiciosNuevaCabina() {
        var params: any = {};
        params.sucursal = this.personal.sucursal;

        this._backService.HttpPost("catalogos/servicio/consultarServicio", {}, params).subscribe((response: string) => {
            this.personal.dataServicio = eval(response);

            if (this.personal.dataServicio.length > 0) {
                if (this.cargarDatosGenerales) {
                    this.cargarDatosGenerales = false;
                    $("#datosGenerales").show();
                    $("#btnGuardar").show();
                }

                this.personal_consultarPersonalesNuevaCabina();
            }
            else {
                // Muestra un mensaje en un modal para indicar que la sucursal no cuenta con ningún servicio
                this.modales.modalConfirmServicios.show();
                $("#modal-confirmServicios .modal-body").html('<span style="font-weight: 400;">' + this.personalTranslate.msgNAServ + '</span>');
                this._pantallaServicio.ocultarSpinner();
                
            }
        }, 
        (error) => {
            this._pantallaServicio.ocultarSpinner();
            if (error == 'SinSesion' || error == 'SesionCaducada') {
              if (error == 'SinSesion') {
                this._toaster.error(this.personalTranslate.favorIniciarSesion);
              }
              if (error == 'SesionCaducada') {
                this._toaster.error(this.personalTranslate.sesionCaducada);
              }
              this._router.navigate(['/login']);
              return;
            }
            this._toaster.error(this.personalTranslate.errorEliminar);
        });
    }

    personal_consultarPersonalesNuevaCabina() {
        this.personal.dataPersonalesCabina = [];
        for (var i = 0; i < this.personal.dataPersonales.length; i++) {
            if (!this.personal.dataPersonales[i].esCabina) {
                this.personal.dataPersonalesCabina.push(this.personal.dataPersonales[i]);
            }
        }
        this.sucursal_cargarSucursalHorariosLaboralesNuevaCabina();
    }

    sucursal_cargarSucursalHorariosLaboralesNuevaCabina() {
        var params: any = {};
        params.idSucursal = this.personal.sucursal;

        this._backService.HttpPost("catalogos/sucursal/cargarSucursalHorariosLaborales", {}, params).subscribe((response: string) => {
            this.sucursal.dataHorariosLaborales = eval(response);
            this.sucursal.dataHorariosLaboralesCopy = JSON.parse(JSON.stringify(this.sucursal.dataHorariosLaborales));
            for (var i = 0; i < this.sucursal.dataHorariosLaborales.length; i++) {
                var horaInicio = this.sucursal.dataHorariosLaborales[i].horaInicio;
                var minutosInicio = this.sucursal.dataHorariosLaborales[i].minutosInicio;
                var horaFin = this.sucursal.dataHorariosLaborales[i].horaFin;
                var minutosFin = this.sucursal.dataHorariosLaborales[i].minutosFin;
                switch (this.sucursal.dataHorariosLaborales[i].dia) {
                    case 1:
                        this.sucursal.lunes = this.sucursal.dataHorariosLaborales[i].esLaboral;
                        this.sucursal.lunesCargado = JSON.parse(JSON.stringify(this.personal.lunes));
                        this.personal.lunes = this.sucursal.dataHorariosLaborales[i].esLaboral;
                        this.personal.lunesCargado = JSON.parse(JSON.stringify(this.personal.lunes));
                        this.personal.horaInicioLunes = moment(new Date(0, 0, 0, horaInicio, minutosInicio, 0, 0)).format('HH:mm');
                        this.personal.horaFinLunes = moment(new Date(0, 0, 0, horaFin, minutosFin, 0, 0)).format('HH:mm');
                        this.personal.horaIniLu = JSON.parse(JSON.stringify(this.personal.horaInicioLunes));
                        this.personal.horaFiLu = JSON.parse(JSON.stringify(this.personal.horaFinLunes));
                        break;
                    case 2:
                        this.sucursal.martes = this.sucursal.dataHorariosLaborales[i].esLaboral;
                        this.sucursal.martesCargado = JSON.parse(JSON.stringify(this.personal.martes));
                        this.personal.martes = this.sucursal.dataHorariosLaborales[i].esLaboral;
                        this.personal.martesCargado = JSON.parse(JSON.stringify(this.personal.martes));
                        this.personal.horaInicioMartes = moment(new Date(0, 0, 0, horaInicio, minutosInicio, 0, 0)).format('HH:mm');
                        this.personal.horaFinMartes = moment(new Date(0, 0, 0, horaFin, minutosFin, 0, 0)).format('HH:mm');
                        this.personal.horaIniMa = JSON.parse(JSON.stringify(this.personal.horaInicioMartes));
                        this.personal.horaFiMa = JSON.parse(JSON.stringify(this.personal.horaFinMartes));
                        break;
                    case 3:
                        this.sucursal.miercoles = this.sucursal.dataHorariosLaborales[i].esLaboral;
                        this.sucursal.miercolesCargado = JSON.parse(JSON.stringify(this.personal.miercoles));
                        this.personal.miercoles = this.sucursal.dataHorariosLaborales[i].esLaboral;
                        this.personal.miercolesCargado = JSON.parse(JSON.stringify(this.personal.miercoles));
                        this.personal.horaInicioMiercoles = moment(new Date(0, 0, 0, horaInicio, minutosInicio, 0, 0)).format('HH:mm');
                        this.personal.horaFinMiercoles = moment(new Date(0, 0, 0, horaFin, minutosFin, 0, 0)).format('HH:mm');
                        this.personal.horaIniMi = JSON.parse(JSON.stringify(this.personal.horaInicioMiercoles));
                        this.personal.horaFiMi = JSON.parse(JSON.stringify(this.personal.horaFinMiercoles));
                        break;
                    case 4:
                        this.sucursal.jueves = this.sucursal.dataHorariosLaborales[i].esLaboral;
                        this.sucursal.juevesCargado = JSON.parse(JSON.stringify(this.personal.jueves));
                        this.personal.jueves = this.sucursal.dataHorariosLaborales[i].esLaboral;
                        this.personal.juevesCargado = JSON.parse(JSON.stringify(this.personal.jueves));
                        this.personal.horaInicioJueves = moment(new Date(0, 0, 0, horaInicio, minutosInicio, 0, 0)).format('HH:mm');
                        this.personal.horaFinJueves = moment(new Date(0, 0, 0, horaFin, minutosFin, 0, 0)).format('HH:mm');
                        this.personal.horaIniJu = JSON.parse(JSON.stringify(this.personal.horaInicioJueves));
                        this.personal.horaFiJu = JSON.parse(JSON.stringify(this.personal.horaFinJueves));
                        break;
                    case 5:
                        this.sucursal.viernes = this.sucursal.dataHorariosLaborales[i].esLaboral;
                        this.sucursal.viernesCargado = JSON.parse(JSON.stringify(this.personal.viernes));
                        this.personal.viernes = this.sucursal.dataHorariosLaborales[i].esLaboral;
                        this.personal.viernesCargado = JSON.parse(JSON.stringify(this.personal.viernes));
                        this.personal.horaInicioViernes = moment(new Date(0, 0, 0, horaInicio, minutosInicio, 0, 0)).format('HH:mm');
                        this.personal.horaFinViernes = moment(new Date(0, 0, 0, horaFin, minutosFin, 0, 0)).format('HH:mm');
                        this.personal.horaIniVi = JSON.parse(JSON.stringify(this.personal.horaInicioViernes));
                        this.personal.horaFiVi = JSON.parse(JSON.stringify(this.personal.horaFinViernes));
                        break;
                    case 6:
                        this.sucursal.sabado = this.sucursal.dataHorariosLaborales[i].esLaboral;
                        this.sucursal.sabadoCargado = JSON.parse(JSON.stringify(this.personal.sabado));
                        this.personal.sabado = this.sucursal.dataHorariosLaborales[i].esLaboral;
                        this.personal.sabadoCargado = JSON.parse(JSON.stringify(this.personal.sabado));
                        this.personal.horaInicioSabado = moment(new Date(0, 0, 0, horaInicio, minutosInicio, 0, 0)).format('HH:mm');
                        this.personal.horaFinSabado = moment(new Date(0, 0, 0, horaFin, minutosFin, 0, 0)).format('HH:mm');
                        this.personal.horaIniSa = JSON.parse(JSON.stringify(this.personal.horaInicioSabado));
                        this.personal.horaFiSa = JSON.parse(JSON.stringify(this.personal.horaFinSabado));
                        break;
                    case 7:
                        this.sucursal.domingo = this.sucursal.dataHorariosLaborales[i].esLaboral;
                        this.sucursal.domingoCargado = JSON.parse(JSON.stringify(this.personal.domingo));
                        this.personal.domingo = this.sucursal.dataHorariosLaborales[i].esLaboral;
                        this.personal.domingoCargado = JSON.parse(JSON.stringify(this.personal.domingo));
                        this.personal.horaInicioDomingo = moment(new Date(0, 0, 0, horaInicio, minutosInicio, 0, 0)).format('HH:mm');
                        this.personal.horaFinDomingo = moment(new Date(0, 0, 0, horaFin, minutosFin, 0, 0)).format('HH:mm');
                        this.personal.horaIniDo = JSON.parse(JSON.stringify(this.personal.horaInicioDomingo));
                        this.personal.horaFiDo = JSON.parse(JSON.stringify(this.personal.horaFinDomingo));
                        break;
                }
            }

            this.sucursal_cargarSucursalHorariosDescansosNuevoPersonal();
        }, 
        (error) => {
            this._pantallaServicio.ocultarSpinner();
            if (error == 'SinSesion' || error == 'SesionCaducada') {
              if (error == 'SinSesion') {
                this._toaster.error(this.personalTranslate.favorIniciarSesion);
              }
              if (error == 'SesionCaducada') {
                this._toaster.error(this.personalTranslate.sesionCaducada);
              }
              this._router.navigate(['/login']);
              return;
            }
            this._toaster.error(this.personalTranslate.errorEliminar);
        });
    }
    
    // ------------------------------------------ Otras funciones ------------------------------------------- 
    personal_agregarServicio() {
        this.validDescartar = true;
        this._router.navigate(['/servicio']);
    }

    personal_home() {
        this.validDescartar = true;
        this._router.navigate(['/personal']);
    }

    personal_consultarSucursal() {
        var params: any = {};
        params.consultaMain = null;

        this._backService.HttpPost("catalogos/sucursal/consultarSucursal", {}, params).subscribe((response: string) => {
            this.personal.dataSucursal = eval(response);

            if (this.accion == "Actualizar") {
                this.personal.consultaServicio();
            } else if (this.accion == "Nuevo") {
                this.personal_cargarIdSucursal();
            }
        }, 
        (error) => {
            this._pantallaServicio.ocultarSpinner();
            if (error == 'SinSesion' || error == 'SesionCaducada') {
              if (error == 'SinSesion') {
                this._toaster.error(this.personalTranslate.favorIniciarSesion);
              }
              if (error == 'SesionCaducada') {
                this._toaster.error(this.personalTranslate.sesionCaducada);
              }
              this._router.navigate(['/login']);
              return;
            }
            this._toaster.error(this.personalTranslate.errorEliminar);
        });
    }
    
    personal_onChangeDdlSucursal() {
        this.personal.consultaServicio();
        this.sucursalSeleccionada = true;
        this.personal.contadorLunes = 0;
        this.personal.contadorMartes = 0;
        this.personal.contadorMiercoles = 0;
        this.personal.contadorJueves = 0;
        this.personal.contadorViernes = 0;
        this.personal.contadorSabado = 0;
        this.personal.contadorDomingo = 0;

        this.personal.objetoLunes = [];
        this.personal.objetoMartes = [];
        this.personal.objetoMiercoles = [];
        this.personal.objetoJueves = [];
        this.personal.objetoViernes = [];
        this.personal.objetoSabado = [];
        this.personal.objetoDomingo = [];
    }

    getRandomInt(min: any, max: any) {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    personal_cargarIdSucursal() {
        this._backService.HttpPost("catalogos/personal/cargarIdSucursal", {}, {}).subscribe((response: string) => {
            this.personal.sucursal = eval(response);
            this.personal.sucursalCargada = JSON.parse(JSON.stringify(this.personal.sucursal));
            this.personal.consultaServicio();
        }, 
        (error) => {
            this._pantallaServicio.ocultarSpinner();
            if (error == 'SinSesion' || error == 'SesionCaducada') {
              if (error == 'SinSesion') {
                this._toaster.error(this.personalTranslate.favorIniciarSesion);
              }
              if (error == 'SesionCaducada') {
                this._toaster.error(this.personalTranslate.sesionCaducada);
              }
              this._router.navigate(['/login']);
              return;
            }
            this._toaster.error(this.personalTranslate.errorEliminar);
        });
    }
    
    confirmDescartarCabina() {
        if (this.agenda == "" && this.personal.idPersonalDescarta == undefined) {
            this.rootScope_fromState = "";
            this._router.navigate(['/' + this.rootScope_toState]);
        }
        else {
            if (this.agenda == "agenda") {
                this.agenda = "";
                this.rootScope_fromState = "";
                this._router.navigate(['/agenda']);
            }
            else {
                if (this.personal.idPersonalDescarta == 'Nuevo') {
                    this.nuevoPersonalCabina();
                } else {
                    $('#img' + this.personal.idPersonal).removeClass("imgActive");
                    $('#lbl' + this.personal.idPersonal).removeClass("lblActive");
                    this.personal.cargarPersonal(this.personal.idPersonalDescarta);
                }
            }
        }
    }

    confirmDescartarActualizar() {
        setTimeout(() => {
            //$("#switchActivo2").removeAttr("disabled");
            $('#Span2').removeClass('onoffswitch-inner-disable');
            $("#NombrePersona").css("display", "block");
            $("#NombreCabina").css("display", "none");
            $("#hdntxtTelefono").css("display", "block");
            $("#hdntxtEmail").css("display", "block");
            $("#serviciosMostrar").css("display", "block");
            $("#descanso").css("display", "table-column");
            $("#categoria").css("display", "table-column");
            this.personal.UsuarioCabina = false;
            if (this.agenda == "" && this.personal.idPersonalDescarta == undefined) {
                this.rootScope_fromState = "";
                this._router.navigate(['/' + this.rootScope_toState]);
            } else if (this.agenda == "agenda") {
                this.agenda = "";
                this.rootScope_fromState = "";
                this._router.navigate(['procesos/agenda']);
            } else if (this.personal.idPersonalDescarta == 'Nuevo') {
                this.nuevoPersonal();
            } else {
                $('#img' + this.personal.idPersonal).removeClass("imgActive");
                $('#lbl' + this.personal.idPersonal).removeClass("lblActive");
    
                this.personal.cargarPersonal(this.personal.idPersonalDescarta);
            }
        }, 50);
    }

    cancelarDescartarActualizar() {
        this.agenda = "";
        this.toActualizar = "";
        this.modales.modalConfirmDescartarActualizar.hide();
    }

    cancelarDescartarCabina() {
        this.agenda = "";
        this.toActualizar = "";
        this.personal.UsuarioCabina = false;
        this.modales.modalConfirmSwithCabina.show();
    }

    confirmDescartar() {
        if (this.toActualizar == "toActualizar") {
            this.personal.cargarPersonal(this.idPersonalToActualizar);
        } else if (this.agenda == "") {
            this.rootScope_fromState = "";
            this._router.navigate(['/' + this.rootScope_toState]);
        } else if (this.agenda == "agenda") {
            this.agenda = "";
            this.rootScope_fromState = "";
            this._router.navigate(['procesos/agenda']);
        }
    }

    cancelarDescartar() {
        this.agenda = "";
        this.toActualizar = "";
        this.modales.modalConfirm.hide();
    }
    
    descartar(agenda: any) {
        this.agenda = agenda;
        if (this.accion == 'Nuevo') {
            this.personal_descartaNuevo(undefined);
        } else if (this.accion == 'Actualizar') {
            this.personal_descartaActualizar(undefined);
        }
    }

    personal_descartaNuevo(cambio: any) {
        if (this.personal.nombre != "" || this.personal.email != "" || this.personal.telefono != ""
            || this.personal.lunes != this.personal.lunesCargado || this.personal.martes != this.personal.martesCargado ||
            this.personal.miercoles != this.personal.miercolesCargado || this.personal.jueves != this.personal.juevesCargado
            || this.personal.viernes != this.personal.viernesCargado || this.personal.sabado != this.personal.sabadoCargado ||
            this.personal.domingo != this.personal.domingoCargado || this.personal.imagenRecortada != "" || (this.personal.sucursal != this.personal.sucursalCargada)
            || this.personal.servicio.length > 0 || this.color != this.personal.colores[this.numRandom]) {
            if (cambio == undefined) {
                this.modales.modalConfirm.show();
                $("#modal-confirm .modal-body").html('<span style="font-weight: 400;">' + this.personalTranslate.descartar + '</span>');
            }
        } else {
            this.personal_validarHorariosNuevo();
            if (!this.validHorarios) {
                if (cambio == undefined) {
                    this.modales.modalConfirm.show();
                    $("#modal-confirm .modal-body").html('<span style="font-weight: 400;">' + this.personalTranslate.descartar + '</span>');
                }
            } else {
                this.validHorariosDescansos = [];
                this.personal_validHorariosDescansosActualizar();
                this.validDescansos = true;
                for (var i = 0; i < this.validHorariosDescansos.length; i++) {
                    if (!this.validHorariosDescansos[i]) {
                        if (cambio == undefined) {
                            this.modales.modalConfirm.show();
                            $("#modal-confirm .modal-body").html('<span style="font-weight: 400;">' + this.personalTranslate.descartar + '</span>');
                            this.validDescansos = false;
                            break;
                        } else if (i == this.validHorariosDescansos.length - 1) {
                            this.validDescansos = true;
                        }
                    }
                }
                if (this.validDescansos) {
                    if (cambio == "CambioPersonal") {
                        this.cambioPersonal = true;
                        this.limpiarValidaciones();
                    } else {
                        if (this.toActualizar == "toActualizar") {
                            this.personal.cargarPersonal(this.idPersonalToActualizar);
                        } else if (this.agenda == "") {
                            this.validDescartar = true;
                            this.rootScope_fromState = "";
                            this._router.navigate(['/' + this.rootScope_toState]);
                            this.rootScope_listeners_stateChangeStart = [];
                        } else if (this.agenda == "agenda") {
                            this.agenda = "";
                            this.rootScope_fromState = "";
                            this.validDescartar = true;
                            this._router.navigate(['/agenda']);
                        }
                    }
                }
            }
        }
    }

    rootScope_descartaNuevoPersonal(cambio: any) {
        if (this.personal.nombre != "" || this.personal.email != "" || this.personal.telefono != ""
            || this.personal.lunes != this.personal.lunesCargado || this.personal.martes != this.personal.martesCargado ||
            this.personal.miercoles != this.personal.miercolesCargado || this.personal.jueves != this.personal.juevesCargado
            || this.personal.viernes != this.personal.viernesCargado || this.personal.sabado != this.personal.sabadoCargado ||
            this.personal.domingo != this.personal.domingoCargado || this.personal.imagenRecortada != "" || (this.personal.sucursal != this.personal.sucursalCargada)
            || this.personal.servicio.length > 0 || this.color != this.personal.colores[this.numRandom]) {
            if (cambio == undefined) {
                $("#modal-confirm .modal-body").html('<span style="font-weight: 400;">' + this.personalTranslate.descartar + '</span>');
                this.modales.modalConfirm.show();
            }
        } else {
            this.personal_validarHorariosNuevo();
            if (!this.validHorarios) {
                if (cambio == undefined) {
                    $("#modal-confirm .modal-body").html('<span style="font-weight: 400;">' + this.personalTranslate.descartar + '</span>');
                    this.modales.modalConfirm.show();
                }
            } else {
                this.validHorariosDescansos = [];
                this.personal_validHorariosDescansosActualizar();
                this.validDescansos = true;
                for (var i = 0; i < this.validHorariosDescansos.length; i++) {

                    if (!this.validHorariosDescansos[i]) {
                        if (cambio == undefined) {
                            $("#modal-confirm .modal-body").html('<span style="font-weight: 400;">' + this.personalTranslate.descartar + '</span>');
                            this.modales.modalConfirm.show();
                            this.validDescansos = false;
                            break;
                        } else if (i == this.validHorariosDescansos.length - 1) {
                            this.validDescansos = true;
                        }
                    }
                }
                if (this.validDescansos) {
                    if (cambio == "CambioPersonal") {
                        this.cambioPersonal = true;
                        this.limpiarValidaciones();
                    } else {
                        if (this.agenda == "") {
                            this.validDescartar = true;
                            this._router.navigate(['/' + this.rootScope_toState]);
                            this.rootScope_listeners_stateChangeStart = [];
                        } else if (this.agenda == "agenda") {
                            this.agenda = "";
                            this.validDescartar = true;
                            this._router.navigate(['/agenda']);
                        }
                    }
                }
            }
        }
    }

    personal_validarHorariosNuevo() {
        var horaInicio = moment(new Date(0, 0, 0, 9, 0, 0, 0)).format('HH:mm');
        var horaFin = moment(new Date(0, 0, 0, 18, 0, 0, 0)).format('HH:mm');
        if (this.personal.horaInicioLunes != this.personal.horaIniLu || this.personal.horaFinLunes != this.personal.horaFiLu || this.personal.horaInicioMartes != this.personal.horaIniMa || this.personal.horaFinMartes != this.personal.horaFiMa || this.personal.horaInicioMiercoles != this.personal.horaIniMi || this.personal.horaFinMiercoles != this.personal.horaFiMi
            || this.personal.horaInicioJueves != this.personal.horaIniJu || this.personal.horaFinJueves != this.personal.horaFiJu || this.personal.horaInicioViernes != this.personal.horaIniVi || this.personal.horaFinViernes != this.personal.horaFiVi || this.personal.horaInicioSabado != this.personal.horaIniSa || this.personal.horaFinSabado != this.personal.horaFiSa
            || this.personal.horaInicioDomingo != this.personal.horaIniDo || this.personal.horaFinDomingo != this.personal.horaFiDo) {
            this.validHorarios = false;
        } else {
            this.validHorarios = true;
        }
    }

    personal_validHorariosDescansosNuevo() {
        this.personal_validarHorariosDescansosActualizar(this.personal.objetoLunes, this.personal.objetoLu);
        this.personal_validarHorariosDescansosActualizar(this.personal.objetoMartes, this.personal.objetoMa);
        this.personal_validarHorariosDescansosActualizar(this.personal.objetoMiercoles, this.personal.objetoMi);
        this.personal_validarHorariosDescansosActualizar(this.personal.objetoJueves, this.personal.objetoJu);
        this.personal_validarHorariosDescansosActualizar(this.personal.objetoViernes, this.personal.objetoVi);
        this.personal_validarHorariosDescansosActualizar(this.personal.objetoSabado, this.personal.objetoSa);
        this.personal_validarHorariosDescansosActualizar(this.personal.objetoDomingo, this.personal.objetoDo);
    }

    personal_validarHorariosDescansosNuevoConParametros(objetoDia: any, objetoDia2: any) {
        if (objetoDia.length != objetoDia2.length) {
            this.validHorariosDescansos.push(false);
        } else {
            for (var i = 0; i < objetoDia.length; i++) {
                if (objetoDia[i].horaInicio != objetoDia2[i].horaInicio || objetoDia[i].horaFin != objetoDia2[i].horaFin) {
                    this.validHorariosDescansos.push(false);
                    break;
                } else if (i == objetoDia.length - 1) {
                    this.validHorariosDescansos.push(true);
                }
            }
        }
    }

    personal_validarHorariosDescansosNuevo() {
        if (this.personal.contadorLunes > 0 || this.personal.contadorMartes > 0 || this.personal.contadorMiercoles > 0 || this.personal.contadorJueves > 0 || this.personal.contadorViernes > 0 || this.personal.contadorSabado > 0 || this.personal.contadorDomingo > 0) {
            this.validHorarios = false;
        } else {
            this.validHorarios = true;
        }
    }

    personal_validarServiciosActualizar() {
        this.validServicios = true;
        if (this.personal.servicio.length != this.personal.serviciosSeleccionados.length) {
            this.validServicios = false;
        }
        if (this.validServicios) {
            for (var i = 0; i < this.personal.servicio.length; i++) {
                if (this.personal.servicio[i] != this.personal.serviciosSeleccionados[i]) {
                    this.validServicios = false;
                    break;
                } else {
                    this.validServicios = true;
                }
            }
        }
    }

    personal_validarHorariosActualizar() {
        for (var i = 0; i < this.personal.dataHorariosLaborales.length; i++) {
            switch (this.personal.dataHorariosLaborales[i].dia) {
                case 1:
                    if (this.personal.lunes != this.personal.dataHorariosLaborales[i].esLaboral) {
                        this.validHorarios = false;
                    } else {
                        this.validHorarios = true;
                    }
                    break;
                case 2:
                    if (this.personal.martes != this.personal.dataHorariosLaborales[i].esLaboral) {
                        this.validHorarios = false;
                    } else {
                        this.validHorarios = true;
                    }
                    break;
                case 3:
                    if (this.personal.miercoles != this.personal.dataHorariosLaborales[i].esLaboral) {
                        this.validHorarios = false;
                    } else {
                        this.validHorarios = true;
                    }
                    break;
                case 4:
                    if (this.personal.jueves != this.personal.dataHorariosLaborales[i].esLaboral) {
                        this.validHorarios = false;
                    } else {
                        this.validHorarios = true;
                    }
                    break;
                case 5:
                    if (this.personal.viernes != this.personal.dataHorariosLaborales[i].esLaboral) {
                        this.validHorarios = false;
                    } else {
                        this.validHorarios = true;
                    }
                    break;
                case 6:
                    if (this.personal.sabado != this.personal.dataHorariosLaborales[i].esLaboral) {
                        this.validHorarios = false;
                    } else {
                        this.validHorarios = true;
                    }
                    break;
                case 7:
                    if (this.personal.domingo != this.personal.dataHorariosLaborales[i].esLaboral) {
                        this.validHorarios = false;
                    } else {
                        this.validHorarios = true;
                    }
                    break;
            }
            if (!this.validHorarios) {
                break;
            }
        }

        if (this.validHorarios) {
            if (this.personal.horaInicioLunes != this.personal.horaIniLu
                        || this.personal.horaFinLunes != this.personal.horaFiLu
                        || this.personal.horaInicioMartes != this.personal.horaIniMa
                        || this.personal.horaFinMartes != this.personal.horaFiMa
                        || this.personal.horaInicioMiercoles != this.personal.horaIniMi
                        || this.personal.horaFinMiercoles != this.personal.horaFiMi
                        || this.personal.horaInicioJueves != this.personal.horaIniJu
                        || this.personal.horaFinJueves != this.personal.horaFiJu
                        || this.personal.horaInicioViernes != this.personal.horaIniVi
                        || this.personal.horaFinViernes != this.personal.horaFiVi
                        || this.personal.horaInicioSabado != this.personal.horaIniSa
                        || this.personal.horaFinSabado != this.personal.horaFiSa
                        || this.personal.horaInicioDomingo != this.personal.horaIniDo
                        || this.personal.horaFinDomingo != this.personal.horaFiDo) {

                this.validHorarios = false;
            } else {
                this.validHorarios = true;
            }
        }
    }
    
    personal_validHorariosDescansosActualizar() {
        this.personal_validarHorariosDescansosActualizar(this.personal.objetoLunes, this.personal.objetoLu);
        this.personal_validarHorariosDescansosActualizar(this.personal.objetoMartes, this.personal.objetoMa);
        this.personal_validarHorariosDescansosActualizar(this.personal.objetoMiercoles, this.personal.objetoMi);
        this.personal_validarHorariosDescansosActualizar(this.personal.objetoJueves, this.personal.objetoJu);
        this.personal_validarHorariosDescansosActualizar(this.personal.objetoViernes, this.personal.objetoVi);
        this.personal_validarHorariosDescansosActualizar(this.personal.objetoSabado, this.personal.objetoSa);
        this.personal_validarHorariosDescansosActualizar(this.personal.objetoDomingo, this.personal.objetoDo);
    }

    personal_validarHorariosDescansosActualizar(objetoDia: any, objetoDia2: any) {
        try {
            if (objetoDia.length != objetoDia2.length) {
                this.validHorariosDescansos.push(false);
            } else {
                for (var i = 0; i < objetoDia.length; i++) {
                    if (objetoDia[i].horaInicio != objetoDia2[i].horaInicio || objetoDia[i].horaFin != objetoDia2[i].horaFin) {
                        this.validHorariosDescansos.push(false);
                        break;
                    } else if (i == objetoDia.length - 1) {
                        this.validHorariosDescansos.push(true);
                    }
                }
            }
        } catch (ex) {
        }
    }

    personal_descartaActualizar(idPersonal: any) {
        this.personal.idPersonalDescarta = idPersonal;

        if (this.personal.nombre != this.personal.dataPersonal[0].nombre || this.personal.email != this.personal.dataPersonal[0].email
            || this.personal.telefono != this.personal.dataPersonal[0].telefono
            || this.personal.imagenRecortada != this.personal.imagenCargada || this.color != this.personal.dataPersonal[0].color) {
                
            this.modales.modalConfirmDescartarActualizar.show();
            $("#modal-confirmDescartarActualizar .modal-body").html('<span style="font-weight: 400;">' + this.personalTranslate.descartar + '</span>');
        } else {
            //$("#switchActivo2").removeAttr("disabled");
            $('#Span2').removeClass('onoffswitch-inner-disable');
            $("#NombrePersona").css("display", "block");
            $("#NombreCabina").css("display", "none");
            $("#hdntxtTelefono").css("display", "block");
            $("#hdntxtEmail").css("display", "block");
            $("#serviciosMostrar").css("display", "block");
            $("#descanso").css("display", "table-column");
            $("#categoria").css("display", "table-column");
            this.personal.UsuarioCabina = false;
            // this.personal.idBoton = 0;
            this.personal_validarHorariosActualizar();
            if (!this.validHorarios) {
                this.modales.modalConfirmDescartarActualizar.show();
                $("#modal-confirmDescartarActualizar .modal-body").html('<span style="font-weight: 400;">' + this.personalTranslate.descartar + '</span>');
            } else {
                this.validHorariosDescansos = [];
                this.personal_validHorariosDescansosActualizar();
                this.validDescansos = true;
                for (var i = 0; i < this.validHorariosDescansos.length; i++) {
                    if (!this.validHorariosDescansos[i]) {
                        this.modales.modalConfirmDescartarActualizar.show();
                        $("#modal-confirmDescartarActualizar .modal-body").html('<span style="font-weight: 400;">' + this.personalTranslate.descartar + '</span>');
                        this.validDescansos = false;
                        break;
                    } else if (i == this.validHorariosDescansos.length - 1) {
                        this.validDescansos = true;
                    }
                } if (this.validDescansos) {
                    this.personal_validarServiciosActualizar()
                    if (!this.validServicios) {
                        this.modales.modalConfirmDescartarActualizar.show();
                        $("#modal-confirmDescartarActualizar .modal-body").html('<span style="font-weight: 400;">' + this.personalTranslate.descartar + '</span>');
                    } else {
                        if (this.agenda == "" && idPersonal == undefined) {
                            this.validDescartar = true;
                            this.rootScope_fromState = "";
                            this._router.navigate(['/' + this.rootScope_toState]);
                            this.rootScope_listeners_stateChangeStart = [];
                        } else if (this.agenda == "agenda") {
                            this.agenda = "";
                            this.rootScope_fromState = "";
                            this.validDescartar = true;
                            this._router.navigate(['/agenda']);
                        } else if (idPersonal == 'Nuevo') {
                            this.nuevoPersonal();
                        } else {
                            $('#img' + this.personal.idPersonal).removeClass("imgActive");
                            $('#lbl' + this.personal.idPersonal).removeClass("lblActive");
                            //$('#switchActivo2').attr("disabled", "disabled");
                            $('#Span2').addClass('onoffswitch-inner-disable');
                            this.personal.cargarPersonal(idPersonal);
                        }
                    }
                }
            }
        }
    }

    rootScope_descartaActualizarPersonal() {
        this.personal.idPersonalDescarta = undefined;
        if (this.personal.dataPersonal[0] != undefined) {
            if (this.personal.nombre != this.personal.dataPersonal[0].nombre || this.personal.email != this.personal.dataPersonal[0].email
                || this.personal.telefono != this.personal.dataPersonal[0].telefono
                || this.personal.imagenRecortada != this.personal.imagenCargada || this.color/*$('select[name="colorpicker-picker-longlist"]').val()*/ != this.personal.dataPersonal[0].color) {
                
                this.modales.modalConfirmDescartarActualizar.show();
                $("#modal-confirmDescartarActualizar .modal-body").html('<span style="font-weight: 400;">' + this.personalTranslate.descartar + '</span>');
            } else {
                this.personal_validarHorariosActualizar();
                if (!this.validHorarios) {
                    this.modales.modalConfirmDescartarActualizar.show();
                    $("#modal-confirmDescartarActualizar .modal-body").html('<span style="font-weight: 400;">' + this.personalTranslate.descartar + '</span>');
                } else {
                    this.validHorariosDescansos = [];
                    this.personal_validHorariosDescansosActualizar();
                    this.validDescansos = true;
                    for (var i = 0; i < this.validHorariosDescansos.length; i++) {
                        if (!this.validHorariosDescansos[i]) {
                            this.modales.modalConfirmDescartarActualizar.show();
                            $("#modal-confirmDescartarActualizar .modal-body").html('<span style="font-weight: 400;">' + this.personalTranslate.descartar + '</span>');
                            this.validDescansos = false;
                            break;
                        } else if (i == this.validHorariosDescansos.length - 1) {
                            this.validDescansos = true;
                        }
                    } if (this.validDescansos) {
                        this.personal_validarServiciosActualizar()
                        if (!this.validServicios) {
                            this.modales.modalConfirmDescartarActualizar.show();
                            $("#modal-confirmDescartarActualizar .modal-body").html('<span style="font-weight: 400;">' + this.personalTranslate.descartar + '</span>');
                        } else {
                            this.validDescartar = true;
                            this.rootScope_fromState = "";
                            this._router.navigate(['/' + this.rootScope_toState]);
                            this.rootScope_listeners_stateChangeStart = [];
                        }
                    }
                }
            }
        } else {
            this.validDescartar = true;
            this.rootScope_fromState = "";
            this._router.navigate(['/' + this.rootScope_toState]);
            this.rootScope_listeners_stateChangeStart = [];
        }
    }

    rootScope_actualizarPersonal(idPersonal: any) {
        this.guardar = true;
        this.personal_validarCamposRequeridos();
        this.msgHorariosLaboral = "";
        $("#blockScreen").show();
        $('#btnNuevo').css("pointer-events", "none");
        if (this.validTabDatosGenerales) {
            this.validarRangoHoras();
            if (this.validLunes && this.validMartes && this.validMiercoles && this.validJueves && this.validViernes && this.validSabado && this.validDomingo) {
                if (this.personal.lunes || this.personal.martes || this.personal.miercoles || this.personal.jueves || this.personal.viernes || this.personal.sabado || this.personal.domingo) {
                    this.personal_aceptarDescansos();
                    if (this.personal.DescansosValidados) {
                        this.personal_guardarHorariosLaboral();
                        this.personal_guardarHorariosDescansos();
                        var params: any = {};
                        //Guardar Logo
                        if (this.personal.idImagen != null) {
                            params.idImagen = this.personal.idImagen;
                        } else
                            params.idImagen = "";
                        if (this.personal.imagenRecortada != "" || this.personal.imagenSinRecortar != "") {
                            if (!this.guardarSinRecortar) {
                                params.codigo = this.personal.imagenRecortada;
                            } else {
                                params.codigo = this.personal.imagenSinRecortar;
                            }
                            params.tipoContenido = this.personal.tipoContenidoLogo;
                        } else {
                            params.tipoContenido = "";
                            params.codigo = "";
                        }
                        //----------
                        //Guardar Horario Laboral
                        params.horaInicio = this.personal.horarioLaboralInicio.slice();
                        params.horaFin = this.personal.horarioLaboralFin.slice();
                        params.esLaboral = this.personal.laboral.slice();
                        //----------
                        //Guardar Horario Descansos
                        params.descansoDia = this.personal.descansoDia.slice();
                        params.descansoHoraInicio = this.personal.descansoHoraInicio.slice();
                        params.descansoHoraFin = this.personal.descansoHoraFin.slice();
                        //----------
                        //Guardar Servicio Personal
                        params.idPersonalServicio = this.personal.idPersonalServicio.slice();
                        params.idServicio = this.personal.servicio.slice();
                        //---------

                        params.tipoUsuario = this.personal.tipoUsuario;
                        params.idPersonal = this.personal.idPersonal;
                        params.nombre = this.personal.nombre.replace(/</g, "&lt;");;
                        params.email = this.personal.email.replace(/</g, "&lt;");;

                        params.telefono = this.personal.telefono;
                        if (this.personal.sucursal != "") {
                            params.sucursal = this.personal.sucursal;
                        } else {
                            params.sucursal = "";
                        }

                        params.comisionServicio = this.personal.comisionServicio;
                        params.comisionProducto = this.personal.comisionProducto;

                        params.color = this.color//$('select[name="colorpicker-picker-longlist"]').val()
                        params.vendedor = this.personal.vendedor;
                        this._backService.HttpPost("catalogos/personal/actualizarPersonal", {}, params).subscribe((response: string) => {
                            if (idPersonal == "changeState") {
                                this.validDescartar = true;
                                this._pantallaServicio.ocultarSpinner();
                                
                                this.rootScope_fromState = "";
                                $("#btnGuardar").removeClass("loading");
                                this._router.navigate(['/' + this.rootScope_toState]);
                            }
                        }, 
                        (error) => {
                            this._pantallaServicio.ocultarSpinner();
                            if (error == 'SinSesion' || error == 'SesionCaducada') {
                              if (error == 'SinSesion') {
                                this._toaster.error(this.personalTranslate.favorIniciarSesion);
                              }
                              if (error == 'SesionCaducada') {
                                this._toaster.error(this.personalTranslate.sesionCaducada);
                              }
                              this._router.navigate(['/login']);
                              return;
                            }
                            this._toaster.error(this.personalTranslate.errorEliminar);
                        });
                    } else {
                        $('#divPersonales').css('pointer-events', 'visible');
                        $('#btnNuevo').css('pointer-events', 'visible');
                        $('#btnGuardar').css('pointer-events', 'visible');
                        $('#btnDescartar').css('pointer-events', 'visible');
                        this._pantallaServicio.ocultarSpinner();
                        
                        this.stopChange = true;
                        $("#btnGuardar").removeClass("loading");
                    }
                } else {
                    setTimeout(() =>{
                        this.validPestañaHorarios();
                        this.msgHorariosLaboral = this.personalTranslate.horariolb;
                        $('#divPersonales').css('pointer-events', 'visible');
                        $('#btnNuevo').css('pointer-events', 'visible');
                        $('#btnGuardar').css('pointer-events', 'visible');
                        $('#btnDescartar').css('pointer-events', 'visible');
                        this._pantallaServicio.ocultarSpinner();
                        
                        this.stopChange = true;
                        $("#btnGuardar").removeClass("loading");
                    }, 50);

                }
            } else {
                setTimeout(() =>{
                    this.validPestañaHorarios();
                    $('#divPersonales').css('pointer-events', 'visible');
                    $('#btnNuevo').css('pointer-events', 'visible');
                    $('#btnGuardar').css('pointer-events', 'visible');
                    $('#btnDescartar').css('pointer-events', 'visible');
                    this._pantallaServicio.ocultarSpinner();
                    
                    this.stopChange = true;
                    $("#btnGuardar").removeClass("loading");
                }, 50);

            }
        } else {
            $('#divPersonales').css('pointer-events', 'visible');
            $('#btnNuevo').css('pointer-events', 'visible');
            $('#btnGuardar').css('pointer-events', 'visible');
            $('#btnDescartar').css('pointer-events', 'visible');
            this._pantallaServicio.ocultarSpinner();
            
            this.stopChange = true;
            $("#btnGuardar").removeClass("loading");
        }
    }

    personal_guardarHorariosLaboral() {
        this.personal.horarioLaboralInicio = [];
        this.personal.horarioLaboralFin = [];
        this.personal.laboral = [];

        this.personal.horarioLaboralInicio[0] = this.personal.horaInicioLunes;
        this.personal.horarioLaboralFin[0] = this.personal.horaFinLunes;
        this.personal.laboral[0] = this.personal.lunes == true ? 1 : 0;

        this.personal.horarioLaboralInicio[1] = this.personal.horaInicioMartes;
        this.personal.horarioLaboralFin[1] = this.personal.horaFinMartes;
        this.personal.laboral[1] = this.personal.martes == true ? 1 : 0;

        this.personal.horarioLaboralInicio[2] = this.personal.horaInicioMiercoles;
        this.personal.horarioLaboralFin[2] = this.personal.horaFinMiercoles;
        this.personal.laboral[2] = this.personal.miercoles == true ? 1 : 0;

        this.personal.horarioLaboralInicio[3] = this.personal.horaInicioJueves;
        this.personal.horarioLaboralFin[3] = this.personal.horaFinJueves;
        this.personal.laboral[3] = this.personal.jueves == true ? 1 : 0;

        this.personal.horarioLaboralInicio[4] = this.personal.horaInicioViernes;
        this.personal.horarioLaboralFin[4] = this.personal.horaFinViernes;
        this.personal.laboral[4] = this.personal.viernes == true ? 1 : 0;

        this.personal.horarioLaboralInicio[5] = this.personal.horaInicioSabado;
        this.personal.horarioLaboralFin[5] = this.personal.horaFinSabado;
        this.personal.laboral[5] = this.personal.sabado == true ? 1 : 0;

        this.personal.horarioLaboralInicio[6] = this.personal.horaInicioDomingo;
        this.personal.horarioLaboralFin[6] = this.personal.horaFinDomingo;
        this.personal.laboral[6] = this.personal.domingo == true ? 1 : 0;
    }

    personal_guardarHorariosDescansos () {
        this.personal.descansoDia = [];
        this.personal.descansoHoraInicio = [];
        this.personal.descansoHoraFin = [];
        var i = 0;


        for (var j = 0; j < this.personal.objetoLunes.length; j++) {
            this.personal.descansoDia[i] = 1;
            this.personal.descansoHoraInicio[i] = this.personal.objetoLunes[j].horaInicio;
            this.personal.descansoHoraFin[i] = this.personal.objetoLunes[j].horaFin;
            i++;
        }

        for (var j = 0; j < this.personal.objetoMartes.length; j++) {
            this.personal.descansoDia[i] = 2;
            this.personal.descansoHoraInicio[i] = this.personal.objetoMartes[j].horaInicio;
            this.personal.descansoHoraFin[i] = this.personal.objetoMartes[j].horaFin;
            i++;
        }

        for (var j = 0; j < this.personal.objetoMiercoles.length; j++) {
            this.personal.descansoDia[i] = 3;
            this.personal.descansoHoraInicio[i] = this.personal.objetoMiercoles[j].horaInicio;
            this.personal.descansoHoraFin[i] = this.personal.objetoMiercoles[j].horaFin;
            i++;
        }

        for (var j = 0; j < this.personal.objetoJueves.length; j++) {
            this.personal.descansoDia[i] = 4;
            this.personal.descansoHoraInicio[i] = this.personal.objetoJueves[j].horaInicio;
            this.personal.descansoHoraFin[i] = this.personal.objetoJueves[j].horaFin;
            i++;
        }

        for (var j = 0; j < this.personal.objetoViernes.length; j++) {
            this.personal.descansoDia[i] = 5;
            this.personal.descansoHoraInicio[i] = this.personal.objetoViernes[j].horaInicio;
            this.personal.descansoHoraFin[i] = this.personal.objetoViernes[j].horaFin;
            i++;
        }

        for (var j = 0; j < this.personal.objetoSabado.length; j++) {
            this.personal.descansoDia[i] = 6;
            this.personal.descansoHoraInicio[i] = this.personal.objetoSabado[j].horaInicio;
            this.personal.descansoHoraFin[i] = this.personal.objetoSabado[j].horaFin;
            i++;
        }

        for (var j = 0; j < this.personal.objetoDomingo.length; j++) {
            this.personal.descansoDia[i] = 7;
            this.personal.descansoHoraInicio[i] = this.personal.objetoDomingo[j].horaInicio;
            this.personal.descansoHoraFin[i] = this.personal.objetoDomingo[j].horaFin;
            i++;
        }
    }

    validarLetras() {
        var letrasExp = RegExp("^[a-zA-Z áéíóúñÁÉÍÓÚÑüÜ\s]*$");
        this.msgNombre = "";
        this.validNombre = true;
        if (this.personal.nombre != "") {
            if (!letrasExp.test(this.personal.nombre)) {
                this.validNombre = false;
                this.msgNombre = this.personalTranslate.nomPersonal;
                $("#txtNombre").addClass('errorCampo');
                this._pantallaServicio.ocultarSpinner();
            } else {
                this.msgNombre = "";
                this.validNombre = true;
                $("#txtNombre").removeClass('errorCampo');
            }
        } else {
            if (this.personal.UsuarioCabina == 1) {
                this.validNombre = false;
                this.msgNombre = this.personalTranslate.nomCabina;
                $("#txtNombre").addClass('errorCampo');
                this._pantallaServicio.ocultarSpinner();
            }
        }
    }

    limpiarValidaciones() {
        this.msgNombre = "";
        $("#txtNombre").removeClass('errorCampo');
        $("#ddlSucursal > div:first-child").attr("style", "outline: none");
        $("#ddlServicio > div:first-child").attr("style", "outline: none");
        this.msgEmail = "";
        $("#txtEmail").removeClass('errorCampo');
        this.msgTelefono = "";
        $("#txtTelefono").removeClass('errorCampo');

        this.msgComisionServicio = "";
        $("#inputComisionServicio").removeClass('errorCampo');

        this.msgComisionProducto = "";
        $("#inputComisionProducto").removeClass('errorCampo');

        $("#txtHoraInicioLunes> div:first-child").attr("style", "outline: none");
        $("#txtHoraFinLunes> div:first-child").attr("style", "outline: none");
        $("#txtHoraInicioMartes> div:first-child").attr("style", "outline: none");
        $("#txtHoraFinMartes> div:first-child").attr("style", "outline: none");
        $("#txtHoraInicioMiercoles> div:first-child").attr("style", "outline: none");
        $("#txtHoraFinMiercoles> div:first-child").attr("style", "outline: none");
        $("#txtHoraInicioJueves> div:first-child").attr("style", "outline: none");
        $("#txtHoraFinJueves> div:first-child").attr("style", "outline: none");
        $("#txtHoraInicioViernes> div:first-child").attr("style", "outline: none");
        $("#txtHoraInicioViernes> div:first-child").attr("style", "outline: none");
        $("#txtHoraInicioSabado> div:first-child").attr("style", "outline: none");
        $("#txtHoraFinSabado> div:first-child").attr("style", "outline: none");
        $("#txtHoraInicioDomingo> div:first-child").attr("style", "outline: none");
        $("#txtHoraFinDomingo> div:first-child").attr("style", "outline: none");

        for (var i = 0; i < 2; i++) {
            $("#txtLunesDescansoFin" + i + "> div:first-child").attr("style", "outline: none");
            $("#txtLunesDescansoInicio" + i + "> div:first-child").attr("style", "outline: none");
        }
        for (var i = 0; i < 2; i++) {
            this.msgLunesDescansos[i] = "";
        }
        for (var i = 0; i < 2; i++) {
            $("#txtMartesDescansoFin" + i + "> div:first-child").attr("style", "outline: none");
            $("#txtMartesDescansoInicio" + i + "> div:first-child").attr("style", "outline: none");
        }
        for (var i = 0; i < 2; i++) {
            this.msgMartesDescansos[i] = "";
        }
        for (var i = 0; i < 2; i++) {
            $("#txtMiercolesDescansoFin" + i + "> div:first-child").attr("style", "outline: none");
            $("#txtMiercolesDescansoInicio" + i + "> div:first-child").attr("style", "outline: none");
        }
        for (var i = 0; i < 2; i++) {
            this.msgMiercolesDescansos[i] = "";
        }
        for (var i = 0; i < 2; i++) {
            $("#txtJuevesDescansoFin" + i + "> div:first-child").attr("style", "outline: none");
            $("#txtJuevesDescansoInicio" + i + "> div:first-child").attr("style", "outline: none");
        }
        for (var i = 0; i < 2; i++) {
            this.msgJuevesDescansos[i] = "";
        }
        for (var i = 0; i < 2; i++) {
            $("#txtViernesDescansoFin" + i + "> div:first-child").attr("style", "outline: none");
            $("#txtViernesDescansoInicio" + i + "> div:first-child").attr("style", "outline: none");
        }
        for (var i = 0; i < 2; i++) {
            this.msgViernesDescansos[i] = "";
        }
        for (var i = 0; i < 2; i++) {
            $("#txtSabadoDescansoFin" + i + "> div:first-child").attr("style", "outline: none");
            $("#txtSabadoDescansoInicio" + i + "> div:first-child").attr("style", "outline: none");
        }
        for (var i = 0; i < 2; i++) {
            this.msgSabadoDescansos[i] = "";
        }
        for (var i = 0; i < 2; i++) {
            $("#txtDomingoDescansoFin" + i + "> div:first-child").attr("style", "outline: none");
            $("#txtDomingoDescansoInicio" + i + "> div:first-child").attr("style", "outline: none");
        }
        for (var i = 0; i < 2; i++) {
            this.msgDomingoDescansos[i] = "";
        }
    }
    
    personal_validarCamposRequeridos() {
        this.personal.contRequeridos = 0;
        if (this.personal.nombre == "" || this.personal.nombre == undefined) {
            $("#txtNombre").addClass('errorCampo');
            this.personal.contRequeridos++;
        } else {
            $("#txtNombre").removeClass('errorCampo');
        }
        if (!this.personal.cabina.isCabina) {
            if (this.personal.servicio == "" || this.personal.servicio == undefined) {
                $("#ddlServicio > div:first-child").attr("style", "outline: red solid 1px !important");
                this.personal.contRequeridos++;
            } else {
                $("#ddlServicio > div:first-child").attr("style", "outline: none");
            }
        }
        else {

        }
        this.validarLetras();
        this.validarEmail();
        this.validarTelefono();
        this.validComisiones();

        if (!this.validEmail || !this.validTelefono || !this.validNombre || this.personal.contRequeridos > 0 || !this.validComisionServicio || !this.validComisionProducto) {
            this.validTabDatosGenerales = false;
            this.tab.selectedIndex = 0;
        }
        else {
            this.validTabDatosGenerales = true;
        }
    };

    validarEmail() {
        var eMailExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (this.personal.email != "") {
            if (!eMailExp.test(this.personal.email)) {
                this.validEmail = false;
                this.msgEmail = this.personalTranslate.valEmail;
                $("#txtEmail").addClass('errorCampo');
            } else {
                this.msgEmail = "";
                this.validEmail = true;
                $("#txtEmail").removeClass('errorCampo');
            }
        } else {
            this.msgEmail = "";
            this.validEmail = true;
            $("#txtEmail").removeClass('errorCampo');
        }
    }

    validarTelefono() {
        var telefonoExp = new RegExp("^(\\(\\d{2}\\)|\\d{2})?-?(\\d{2})?-?\\d{2}-?\\d{2}-?\\d{2}-?\\d{2}$");
        var telMovilExp = new RegExp("^(\\(\\d{3}\\)|\\d{3})?-?((\\d{3}-?\\d{3}-?\\d{2}-?\\d{2})|(\\d{2}-?\\d{2}-?\\d{2}-?\\d{2}-?\\d{2}))$");
        if (this.personal.telefono != "") {
            if (telefonoExp.test(this.personal.telefono) || telMovilExp.test(this.personal.telefono)) {
                this.msgTelefono = "";
                this.validTelefono = true;
                $("#txtTelefono").removeClass('errorCampo');
            } else {
                this.msgTelefono = this.personalTranslate.valTelefono;
                this.validTelefono = false;
                $("#txtTelefono").addClass('errorCampo');
            }
        } else {
            this.msgTelefono = "";
            this.validTelefono = true;
            $("#txtTelefono").removeClass('errorCampo');
        }
    }

    validComisiones() {
        if (this.personal.comisionServicio != "") {
            if (this.personal.comisionServicio >= 0 && this.personal.comisionServicio <= 100) {
                this.msgComisionServicio = "";
                this.validComisionServicio = true;
                $("#inputComisionServicio").removeClass('errorCampo');
            }
            else {
                this.msgComisionServicio = this.personalTranslate.comisionCien;
                this.validComisionServicio = false;
                $("#inputComisionServicio").addClass('errorCampo');
            }
        }
        else {
            this.msgComisionServicio = "";
            this.validComisionServicio = true;
            $("#inputComisionServicio").removeClass('errorCampo');
        }
        if (this.personal.comisionProducto != "") {
            if (this.personal.comisionProducto >= 0 && this.personal.comisionProducto <= 100) {
                this.msgComisionProducto = "";
                this.validComisionProducto = true;
                $("#inputComisionProducto").removeClass('errorCampo');
            }
            else {
                this.msgComisionProducto = this.personalTranslate.comisionCien;
                this.validComisionProducto = false;
                $("#inputComisionProducto").addClass('errorCampo');
            }
        }
        else {
            this.msgComisionProducto = "";
            this.validComisionProducto = true;
            $("#inputComisionProducto").removeClass('errorCampo');
        }
    }

    validPestañaDescansos () {
        this.tab.selectedIndex = 2;
    }

    validPestañaHorarios () {
        this.tab.selectedIndex = 1;
    }

    validPestañaDatosGenerales() {
        window.onload = () => {
            this.tab.selectedIndex = 0;
        }
    }

    validarRangoHoras() {
        var validRangos;
        this.rangoHoras(this.personal.horaInicioLunes, this.personal.horaFinLunes);

        validRangos = this.validRangos;
        this.validLunes = validRangos;
        this.msgLunes = this.msgHora;
        if (this.msgLunes != "") {
            $("#txtHoraInicioLunes > div:first-child").attr("style", "outline: red solid 1px !important");
            $("#txtHoraFinLunes > div:first-child").attr("style", "outline: red solid 1px !important");
        } else {
            $("#txtHoraFinLunes> div:first-child").attr("style", "outline: none");
            $("#txtHoraInicioLunes> div:first-child").attr("style", "outline: none");
        }

        this.rangoHoras(this.personal.horaInicioMartes, this.personal.horaFinMartes);
        validRangos = this.validRangos;
        this.validMartes = validRangos;
        this.msgMartes = this.msgHora;
        if (this.msgMartes != "") {
            $("#txtHoraInicioMartes> div:first-child").attr("style", "outline: red solid 1px !important");
            $("#txtHoraFinMartes> div:first-child").attr("style", "outline: red solid 1px !important");
        } else {
            $("#txtHoraFinMartes> div:first-child").attr("style", "outline: none");
            $("#txtHoraInicioMartes> div:first-child").attr("style", "outline: none");
        }

        this.rangoHoras(this.personal.horaInicioMiercoles, this.personal.horaFinMiercoles);
        validRangos = this.validRangos;
        this.validMiercoles = validRangos;
        this.msgMiercoles = this.msgHora;
        if (this.msgMiercoles != "") {
            $("#txtHoraInicioMiercoles> div:first-child").attr("style", "outline: red solid 1px !important");
            $("#txtHoraFinMiercoles> div:first-child").attr("style", "outline: red solid 1px !important");
        } else {
            $("#txtHoraFinMiercoles> div:first-child").attr("style", "outline: none");
            $("#txtHoraInicioMiercoles> div:first-child").attr("style", "outline: none");
        }

        this.rangoHoras(this.personal.horaInicioJueves, this.personal.horaFinJueves);
        validRangos = this.validRangos;
        this.validJueves = validRangos;
        this.msgJueves = this.msgHora;
        if (this.msgJueves != "") {
            $("#txtHoraInicioJueves> div:first-child").attr("style", "outline: red solid 1px !important");
            $("#txtHoraFinJueves> div:first-child").attr("style", "outline: red solid 1px !important");
        } else {
            $("#txtHoraFinJueves> div:first-child").attr("style", "outline: none");
            $("#txtHoraInicioJueves> div:first-child").attr("style", "outline: none");
        }

        this.rangoHoras(this.personal.horaInicioViernes, this.personal.horaFinViernes);
        validRangos = this.validRangos;
        this.validViernes = validRangos;
        this.msgViernes = this.msgHora
        if (this.msgViernes != "") {
            $("#txtHoraInicioViernes> div:first-child").attr("style", "outline: red solid 1px !important");
            $("#txtHoraFinViernes> div:first-child").attr("style", "outline: red solid 1px !important");
        } else {
            $("#txtHoraFinViernes> div:first-child").attr("style", "outline: none");
            $("#txtHoraInicioViernes> div:first-child").attr("style", "outline: none");
        };

        this.rangoHoras(this.personal.horaInicioSabado, this.personal.horaFinSabado);
        validRangos = this.validRangos;
        this.validSabado = validRangos;
        this.msgSabado = this.msgHora;
        if (this.msgSabado != "") {
            $("#txtHoraInicioSabado> div:first-child").attr("style", "outline: red solid 1px !important");
            $("#txtHoraFinSabado> div:first-child").attr("style", "outline: red solid 1px !important");
        } else {
            $("#txtHoraFinSabado> div:first-child").attr("style", "outline: none");
            $("#txtHoraInicioSabado> div:first-child").attr("style", "outline: none");
        }

        this.rangoHoras(this.personal.horaInicioDomingo, this.personal.horaFinDomingo);
        validRangos = this.validRangos;
        this.validDomingo = validRangos;
        this.msgDomingo = this.msgHora;
        if (this.msgDomingo != "") {
            $("#txtHoraInicioDomingo> div:first-child").attr("style", "outline: red solid 1px !important");
            $("#txtHoraFinDomingo> div:first-child").attr("style", "outline: red solid 1px !important");
        } else {
            $("#txtHoraFinDomingo> div:first-child").attr("style", "outline: none");
            $("#txtHoraInicioDomingo> div:first-child").attr("style", "outline: none");
        }
    }

    rangoHoras(horaInicio: any, horaFin: any) {
        this.validRangos = true;
        this.msgHora = "";
        if (horaInicio >= horaFin) {
            this.msgHora = this.personalTranslate.msgHora;
            this.validRangos = false;
        }
    }

    personal_sumarContadorLunes() {
        if (this.personal.contadorLunes < 3) {
            this.personal.contadorLunes++;
        } else {
            this.validContadorLunes = false;
        }

        if (this.personal.contadorLunes == 1) {
            $("#txtLunesDescansoInicio0> div:first-child").attr("style", "outline: none");
            $("#txtLunesDescansoFin0> div:first-child").attr("style", "outline: none");
            this.personal.objetoLunes.push({ horaInicio: JSON.parse(JSON.stringify(this.personal.horaInicioLunes)), horaFin: JSON.parse(JSON.stringify(this.personal.horaFinLunes)) });
        }

        if (this.personal.contadorLunes == 2) {
            $("#txtLunesDescansoInicio1> div:first-child").attr("style", "outline: none");
            $("#txtLunesDescansoFin1> div:first-child").attr("style", "outline: none");
            this.personal.objetoLunes.push({ horaInicio: JSON.parse(JSON.stringify(this.personal.horaInicioLunes)), horaFin: JSON.parse(JSON.stringify(this.personal.horaFinLunes)) })
        }

        if (this.personal.contadorLunes == 3 && this.personal.objetoLunes.length != 3) {
            $("#txtLunesDescansoInicio2> div:first-child").attr("style", "outline: none");
            $("#txtLunesDescansoFin2> div:first-child").attr("style", "outline: none");
            this.personal.objetoLunes.push({ horaInicio: JSON.parse(JSON.stringify(this.personal.horaInicioLunes)), horaFin: JSON.parse(JSON.stringify(this.personal.horaFinLunes)) })
        }
    };

    personal_sumarContadorMartes() {
        if (this.personal.contadorMartes < 3) {
            this.personal.contadorMartes++;
        } else {
            this.validContadorMartes = false;
        }

        if (this.personal.contadorMartes == 1) {
            $("#txtMartesDescansoInicio0> div:first-child").attr("style", "outline: none");
            $("#txtMartesDescansoFin0> div:first-child").attr("style", "outline: none");
            this.personal.objetoMartes.push({ horaInicio: JSON.parse(JSON.stringify(this.personal.horaInicioMartes)), horaFin: JSON.parse(JSON.stringify(this.personal.horaFinMartes)) })
        }

        if (this.personal.contadorMartes == 2) {
            $("#txtMartesDescansoInicio1> div:first-child").attr("style", "outline: none");
            $("#txtMartesDescansoFin1> div:first-child").attr("style", "outline: none");
            this.personal.objetoMartes.push({ horaInicio: JSON.parse(JSON.stringify(this.personal.horaInicioMartes)), horaFin: JSON.parse(JSON.stringify(this.personal.horaFinMartes)) })
        }

        if (this.personal.contadorMartes == 3 && this.personal.objetoMartes.length != 3) {
            $("#txtMartesDescansoInicio2> div:first-child").attr("style", "outline: none");
            $("#txtMartesDescansoFin2> div:first-child").attr("style", "outline: none");
            this.personal.objetoMartes.push({ horaInicio: JSON.parse(JSON.stringify(this.personal.horaInicioMartes)), horaFin: JSON.parse(JSON.stringify(this.personal.horaFinMartes)) })
        }
    };

    personal_sumarContadorMiercoles() {
        if (this.personal.contadorMiercoles < 3) {
            this.personal.contadorMiercoles++;
        } else {
            this.validContadorMiercoles = false;
        }

        if (this.personal.contadorMiercoles == 1) {
            $("#txtMiercolesDescansoInicio0> div:first-child").attr("style", "outline: none");
            $("#txtMiercolesDescansoFin0> div:first-child").attr("style", "outline: none");
            this.personal.objetoMiercoles.push({ horaInicio: JSON.parse(JSON.stringify(this.personal.horaInicioMiercoles)), horaFin: JSON.parse(JSON.stringify(this.personal.horaFinMiercoles)) })
        }

        if (this.personal.contadorMiercoles == 2) {
            $("#txtMiercolesDescansoInicio1> div:first-child").attr("style", "outline: none");
            $("#txtMiercolesDescansoFin1> div:first-child").attr("style", "outline: none");
            this.personal.objetoMiercoles.push({ horaInicio: JSON.parse(JSON.stringify(this.personal.horaInicioMiercoles)), horaFin: JSON.parse(JSON.stringify(this.personal.horaFinMiercoles)) })
        }

        if (this.personal.contadorMiercoles == 3 && this.personal.objetoMiercoles.length != 3) {
            $("#txtMiercolesDescansoInicio2> div:first-child").attr("style", "outline: none");
            $("#txtMiercolesDescansoFin2> div:first-child").attr("style", "outline: none");
            this.personal.objetoMiercoles.push({ horaInicio: JSON.parse(JSON.stringify(this.personal.horaInicioMiercoles)), horaFin: JSON.parse(JSON.stringify(this.personal.horaFinMiercoles)) })
        }
    };

    personal_sumarContadorJueves() {
        if (this.personal.contadorJueves < 3) {
            this.personal.contadorJueves++;
        } else {
            this.validContadorJueves = false;
        }

        if (this.personal.contadorJueves == 1) {
            $("#txtJuevesDescansoInicio0> div:first-child").attr("style", "outline: none");
            $("#txtJuevesDescansoFin0> div:first-child").attr("style", "outline: none");
            this.personal.objetoJueves.push({ horaInicio: JSON.parse(JSON.stringify(this.personal.horaInicioJueves)), horaFin: JSON.parse(JSON.stringify(this.personal.horaFinJueves)) })
        }

        if (this.personal.contadorJueves == 2) {
            $("#txtJuevesDescansoInicio1> div:first-child").attr("style", "outline: none");
            $("#txtJuevesDescansoFin1> div:first-child").attr("style", "outline: none");
            this.personal.objetoJueves.push({ horaInicio: JSON.parse(JSON.stringify(this.personal.horaInicioJueves)), horaFin: JSON.parse(JSON.stringify(this.personal.horaFinJueves)) })
        }

        if (this.personal.contadorJueves == 3 && this.personal.objetoJueves.length != 3) {
            $("#txtJuevesDescansoInicio2> div:first-child").attr("style", "outline: none");
            $("#txtJuevesDescansoFin2> div:first-child").attr("style", "outline: none");
            this.personal.objetoJueves.push({ horaInicio: JSON.parse(JSON.stringify(this.personal.horaInicioJueves)), horaFin: JSON.parse(JSON.stringify(this.personal.horaFinJueves)) })
        }
    };

    personal_sumarContadorViernes() {
        if (this.personal.contadorViernes < 3) {
            this.personal.contadorViernes++;
        } else {
            this.validContadorViernes = false;
        }

        if (this.personal.contadorViernes == 1) {
            $("#txtViernesDescansoInicio0> div:first-child").attr("style", "outline: none");
            $("#txtViernesDescansoFin0> div:first-child").attr("style", "outline: none");
            this.personal.objetoViernes.push({ horaInicio: JSON.parse(JSON.stringify(this.personal.horaInicioViernes)), horaFin: JSON.parse(JSON.stringify(this.personal.horaFinViernes)) })
        }

        if (this.personal.contadorViernes == 2) {
            $("#txtViernesDescansoInicio1> div:first-child").attr("style", "outline: none");
            $("#txtViernesDescansoFin1> div:first-child").attr("style", "outline: none");
            this.personal.objetoViernes.push({ horaInicio: JSON.parse(JSON.stringify(this.personal.horaInicioViernes)), horaFin: JSON.parse(JSON.stringify(this.personal.horaFinViernes)) })
        }

        if (this.personal.contadorViernes == 3 && this.personal.objetoViernes.length != 3) {
            $("#txtViernesDescansoInicio2> div:first-child").attr("style", "outline: none");
            $("#txtViernesDescansoFin2> div:first-child").attr("style", "outline: none");
            this.personal.objetoViernes.push({ horaInicio: JSON.parse(JSON.stringify(this.personal.horaInicioViernes)), horaFin: JSON.parse(JSON.stringify(this.personal.horaFinViernes)) })
        }
    };

    personal_sumarContadorSabado() {
        if (this.personal.contadorSabado < 3) {
            this.personal.contadorSabado++;
        } else {
            this.validContadorSabado = false;
        }

        if (this.personal.contadorSabado == 1) {
            $("#txtSabadoDescansoInicio0> div:first-child").attr("style", "outline: none");
            $("#txtSabadoDescansoFin0> div:first-child").attr("style", "outline: none");
            this.personal.objetoSabado.push({ horaInicio: JSON.parse(JSON.stringify(this.personal.horaInicioSabado)), horaFin: JSON.parse(JSON.stringify(this.personal.horaFinSabado)) })
        }

        if (this.personal.contadorSabado == 2) {
            $("#txtSabadoDescansoInicio1> div:first-child").attr("style", "outline: none");
            $("#txtSabadoDescansoFin1> div:first-child").attr("style", "outline: none");
            this.personal.objetoSabado.push({ horaInicio: JSON.parse(JSON.stringify(this.personal.horaInicioSabado)), horaFin: JSON.parse(JSON.stringify(this.personal.horaFinSabado)) })
        }

        if (this.personal.contadorSabado == 3 && this.personal.objetoSabado.length != 3) {
            $("#txtSabadoDescansoInicio2> div:first-child").attr("style", "outline: none");
            $("#txtSabadoDescansoFin2> div:first-child").attr("style", "outline: none");
            this.personal.objetoSabado.push({ horaInicio: JSON.parse(JSON.stringify(this.personal.horaInicioSabado)), horaFin: JSON.parse(JSON.stringify(this.personal.horaFinSabado)) })
        }
    };

    personal_sumarContadorDomingo() {
        if (this.personal.contadorDomingo < 3) {
            this.personal.contadorDomingo++;
        } else {
            this.validContadorDomingo = false;
        }

        if (this.personal.contadorDomingo == 1) {
            $("#txtDomingoDescansoInicio0> div:first-child").attr("style", "outline: none");
            $("#txtDomingoDescansoFin0> div:first-child").attr("style", "outline: none");
            this.personal.objetoDomingo.push({ horaInicio: JSON.parse(JSON.stringify(this.personal.horaInicioDomingo)), horaFin: JSON.parse(JSON.stringify(this.personal.horaFinDomingo)) })
        }

        if (this.personal.contadorDomingo == 2) {
            $("#txtDomingoDescansoInicio1> div:first-child").attr("style", "outline: none");
            $("#txtDomingoDescansoFin1> div:first-child").attr("style", "outline: none");
            this.personal.objetoDomingo.push({ horaInicio: JSON.parse(JSON.stringify(this.personal.horaInicioDomingo)), horaFin: JSON.parse(JSON.stringify(this.personal.horaFinDomingo)) })
        }

        if (this.personal.contadorDomingo == 3 && this.personal.objetoDomingo.length != 3) {
            $("#txtDomingoDescansoInicio2> div:first-child").attr("style", "outline: none");
            $("#txtDomingoDescansoFin2> div:first-child").attr("style", "outline: none");
            this.personal.objetoDomingo.push({ horaInicio: JSON.parse(JSON.stringify(this.personal.horaInicioDomingo)), horaFin: JSON.parse(JSON.stringify(this.personal.horaFinDomingo)) })
        }
    };

    validarValidaciones() {
        this.guardarDescansos = true;
        if (this.contDescansosRequeridos == 0) {
            if (this.validFormatoDescansos) {
                this.personal_validarRangosDescansos();
                if (this.validRangoDescansos) {
                    this.personal_validarDescansosEnDia();
                    if (this.validRangoDescansosEnDia) {
                        this.personal_validarDescansosEmpalmados();
                    }
                }
            }
        }
    };

    personal_restarContadorLunes(id: any) {
        delete this.personal.objetoLunes[id];
        this.personal.validDescansosEnLunes.splice(id, 1);
        for (var i = 0; i < 2; i++) {
            this.msgLunesDescansos[i] = "";
        }
        this.msgLunesDescansos.splice(id, 1);
        for (var i = 0; i < 2; i++) {
            $("#txtLunesDescansoFin" + i + "> div:first-child").attr("style", "outline: none");
            $("#txtLunesDescansoInicio" + i + "> div:first-child").attr("style", "outline: none");
        }
        this.personal.contadorLunes--;
        this.personal.objetoLunes.splice(id, 1);
        this.validarValidaciones();

        if (this.personal.contadorLunes < 3) {
            this.validContadorLunes = true;
        }
    };

    personal_restarContadorMartes(id: any) {
        delete this.personal.objetoMartes[id];
        this.personal.validDescansosEnMartes.splice(id, 1);
        for (var i = 0; i < 2; i++) {
            this.msgMartesDescansos[i] = "";
        }
        this.msgMartesDescansos.splice(id, 1);
        for (var i = 0; i < 2; i++) {
            $("#txtMartesDescansoInicio" + i + "> div:first-child").attr("style", "outline: none");
            $("#txtMartesDescansoFin" + i + "> div:first-child").attr("style", "outline: none");
        }

        this.personal.contadorMartes--;
        this.personal.objetoMartes.splice(id, 1);
        this.validarValidaciones();

        if (this.personal.contadorMartes < 3) {
            this.validContadorMartes = true;
        }
    };

    personal_restarContadorMiercoles(id: any) {
        delete this.personal.objetoMiercoles[id];
        this.personal.validDescansosEnMiercoles.splice(id, 1);
        for (var i = 0; i < 2; i++) {
            this.msgMiercolesDescansos[i] = "";
        }
        this.msgMiercolesDescansos.splice(id, 1);
        for (var i = 0; i < 2; i++) {
            $("#txtMiercolesDescansoInicio" + i + "> div:first-child").attr("style", "outline: none");
            $("#txtMiercolesDescansoFin" + i + "> div:first-child").attr("style", "outline: none");
        }

        this.personal.contadorMiercoles--;
        this.personal.objetoMiercoles.splice(id, 1);
        this.validarValidaciones();
        if (this.personal.contadorMiercoles < 3) {
            this.validContadorMiercoles = true;
        }
    };
    
    personal_restarContadorJueves(id: any) {
        delete this.personal.objetoJueves[id];
        this.personal.validDescansosEnJueves.splice(id, 1);
        for (var i = 0; i < 2; i++) {
            this.msgJuevesDescansos[i] = "";
        }
        this.msgJuevesDescansos.splice(id, 1);
        for (var i = 0; i < 2; i++) {
            $("#txtJuevesDescansoInicio" + i + "> div:first-child").attr("style", "outline: none");
            $("#txtJuevesDescansoFin" + i + "> div:first-child").attr("style", "outline: none");
        }
        this.personal.contadorJueves--;
        this.personal.objetoJueves.splice(id, 1);
        this.validarValidaciones();

        if (this.personal.contadorJueves < 3) {
            this.validContadorJueves = true;
        }
    };

    personal_restarContadorViernes(id: any) {
        delete this.personal.objetoViernes[id];
        this.personal.validDescansosEnViernes.splice(id, 1);
        for (var i = 0; i < 2; i++) {
            this.msgViernesDescansos[i] = "";
        }
        this.msgViernesDescansos.splice(id, 1);
        for (var i = 0; i < 2; i++) {
            $("#txtViernesDescansoInicio" + i + "> div:first-child").attr("style", "outline: none");
            $("#txtViernesDescansoFin" + i + "> div:first-child").attr("style", "outline: none");
        }

        this.personal.contadorViernes--;
        this.personal.objetoViernes.splice(id, 1);
        this.validarValidaciones();

        if (this.personal.contadorViernes < 3) {
            this.validContadorViernes = true;
        }
    };

    personal_restarContadorSabado(id: any) {
        delete this.personal.objetoSabado[id];
        this.personal.validDescansosEnSabado.splice(id, 1);
        for (var i = 0; i < 2; i++) {
            this.msgSabadoDescansos[i] = "";
        }
        this.msgSabadoDescansos.splice(id, 1);
        for (var i = 0; i < 2; i++) {
            $("#txtSabadoDescansoInicio" + i + "> div:first-child").attr("style", "outline: none");
            $("#txtSabadoDescansoFin" + i + "> div:first-child").attr("style", "outline: none");
        }

        this.personal.contadorSabado--;
        this.personal.objetoSabado.splice(id, 1);
        this.validarValidaciones();
        if (this.personal.contadorSabado < 3) {
            this.validContadorSabado = true;
        }
    };

    personal_restarContadorDomingo(id: any) {
        delete this.personal.objetoDomingo[id];

        this.personal.validDescansosEnDomingo.splice(id, 1);
        for (var i = 0; i < 2; i++) {
            this.msgDomingoDescansos[i] = "";
        }
        this.msgDomingoDescansos.splice(id, 1);
        for (var i = 0; i < 2; i++) {
            $("#txtDomingoDescansoInicio" + i + "> div:first-child").attr("style", "outline: none");
            $("#txtDomingoDescansoFin" + i + "> div:first-child").attr("style", "outline: none");
        }
        this.personal.contadorDomingo--;
        this.personal.objetoDomingo.splice(id, 1);
        this.validarValidaciones();
        if (this.personal.contadorDomingo < 3) {
            this.validContadorDomingo = true;
        }
    };

    personal_validarRangosDescansos() {
        for (var i = 0; i < this.personal.objetoLunes.length; i++) {
            this.rangoHoras(this.personal.objetoLunes[i].horaInicio, this.personal.objetoLunes[i].horaFin);
            this.msgLunesDescansos[i] = JSON.parse(JSON.stringify(this.msgHora));
            this.personal.validRangosDescansosLunes[i] = JSON.parse(JSON.stringify(this.validRangos));

            if (this.msgLunesDescansos[i] != "") {
                $("#txtLunesDescansoFin" + i + "> div:first-child").attr("style", "outline: red solid 1px !important");
                $("#txtLunesDescansoInicio" + i + "> div:first-child").attr("style", "outline: red solid 1px !important");
                this.tab.selectedIndex = 2;
            } else {
                $("#txtLunesDescansoInicio" + i + "> div:first-child").attr("style", "outline: none");
                $("#txtLunesDescansoFin" + i + "> div:first-child").attr("style", "outline: none");
            }
        }

        for (var i = 0; i < this.personal.objetoMartes.length; i++) {
            this.rangoHoras(this.personal.objetoMartes[i].horaInicio, this.personal.objetoMartes[i].horaFin);
            this.msgMartesDescansos[i] = JSON.parse(JSON.stringify(this.msgHora));
            this.personal.validRangosDescansosMartes[i] = JSON.parse(JSON.stringify(this.validRangos));

            if (this.msgMartesDescansos[i] != "") {
                $("#txtMartesDescansoFin" + i + "> div:first-child").attr("style", "outline: red solid 1px !important");
                $("#txtMartesDescansoInicio" + i + "> div:first-child").attr("style", "outline: red solid 1px !important");
                this.tab.selectedIndex = 2;
            } else {
                $("#txtMartesDescansoInicio" + i + "> div:first-child").attr("style", "outline: none");
                $("#txtMartesDescansoFin" + i + "> div:first-child").attr("style", "outline: none");
            }
        }

        for (var i = 0; i < this.personal.objetoMiercoles.length; i++) {
            this.rangoHoras(this.personal.objetoMiercoles[i].horaInicio, this.personal.objetoMiercoles[i].horaFin);
            this.msgMiercolesDescansos[i] = JSON.parse(JSON.stringify(this.msgHora));
            this.personal.validRangosDescansosMiercoles[i] = JSON.parse(JSON.stringify(this.validRangos));

            if (this.msgMiercolesDescansos[i] != "") {
                $("#txtMiercolesDescansoFin" + i + "> div:first-child").attr("style", "outline: red solid 1px !important");
                $("#txtMiercolesDescansoInicio" + i + "> div:first-child").attr("style", "outline: red solid 1px !important");
                this.tab.selectedIndex = 2;
            } else {
                $("#txtMiercolesDescansoInicio" + i + "> div:first-child").attr("style", "outline: none");
                $("#txtMiercolesDescansoFin" + i + "> div:first-child").attr("style", "outline: none");
            }
        }

        for (var i = 0; i < this.personal.objetoJueves.length; i++) {
            this.rangoHoras(this.personal.objetoJueves[i].horaInicio, this.personal.objetoJueves[i].horaFin);
            this.msgJuevesDescansos[i] = JSON.parse(JSON.stringify(this.msgHora));
            this.personal.validRangosDescansosJueves[i] = JSON.parse(JSON.stringify(this.validRangos));

            if (this.msgJuevesDescansos[i] != "") {
                $("#txtJuevesDescansoFin" + i + "> div:first-child").attr("style", "outline: red solid 1px !important");
                $("#txtJuevesDescansoInicio" + i + "> div:first-child").attr("style", "outline: red solid 1px !important");
                this.tab.selectedIndex = 2;
            } else {
                $("#txtJuevesDescansoInicio" + i + "> div:first-child").attr("style", "outline: none");
                $("#txtJuevesDescansoFin" + i + "> div:first-child").attr("style", "outline: none");
            }
        }

        for (var i = 0; i < this.personal.objetoViernes.length; i++) {
            this.rangoHoras(this.personal.objetoViernes[i].horaInicio, this.personal.objetoViernes[i].horaFin);
            this.msgViernesDescansos[i] = JSON.parse(JSON.stringify(this.msgHora));
            this.personal.validRangosDescansosViernes[i] = JSON.parse(JSON.stringify(this.validRangos));

            if (this.msgViernesDescansos[i] != "") {
                $("#txtViernesDescansoFin" + i + "> div:first-child").attr("style", "outline: red solid 1px !important");
                $("#txtViernesDescansoInicio" + i + "> div:first-child").attr("style", "outline: red solid 1px !important");
                this.tab.selectedIndex = 2;
            } else {
                $("#txtViernesDescansoInicio" + i + "> div:first-child").attr("style", "outline: none");
                $("#txtViernesDescansoFin" + i + "> div:first-child").attr("style", "outline: none");
            }
        }

        for (var i = 0; i < this.personal.objetoSabado.length; i++) {
            this.rangoHoras(this.personal.objetoSabado[i].horaInicio, this.personal.objetoSabado[i].horaFin);
            this.msgSabadoDescansos[i] = JSON.parse(JSON.stringify(this.msgHora));
            this.personal.validRangosDescansosSabado[i] = JSON.parse(JSON.stringify(this.validRangos));

            if (this.msgSabadoDescansos[i] != "") {
                $("#txtSabadoDescansoFin" + i + "> div:first-child").attr("style", "outline: red solid 1px !important");
                $("#txtSabadoDescansoInicio" + i + "> div:first-child").attr("style", "outline: red solid 1px !important");
                this.tab.selectedIndex = 2;
            } else {
                $("#txtSabadoDescansoInicio" + i + "> div:first-child").attr("style", "outline: none");
                $("#txtSabadoDescansoFin" + i + "> div:first-child").attr("style", "outline: none");
            }
        }

        for (var i = 0; i < this.personal.objetoDomingo.length; i++) {
            this.rangoHoras(this.personal.objetoDomingo[i].horaInicio, this.personal.objetoDomingo[i].horaFin);
            this.msgDomingoDescansos[i] = JSON.parse(JSON.stringify(this.msgHora));
            this.personal.validRangosDescansosDomingo[i] = JSON.parse(JSON.stringify(this.validRangos));

            if (this.msgDomingoDescansos[i] != "") {
                $("#txtDomingoDescansoFin" + i + "> div:first-child").attr("style", "outline: red solid 1px !important");
                $("#txtDomingoDescansoInicio" + i + "> div:first-child").attr("style", "outline: red solid 1px !important");
                this.tab.selectedIndex = 2;
            } else {
                $("#txtDomingoDescansoInicio" + i + "> div:first-child").attr("style", "outline: none");
                $("#txtDomingoDescansoFin" + i + "> div:first-child").attr("style", "outline: none");
            }
        }

        var validRango = [];
        this.validRangoDescansos = false;
        for (var i = 0; i < 7; i++) {
            validRango[i] = true;
        }

        for (var i = 0; i < this.personal.validRangosDescansosLunes.length; i++) {
            if (!this.personal.validRangosDescansosLunes[i]) {
                validRango[0] = false;
                i = this.personal.validRangosDescansosLunes.length;
            }
        }

        for (var i = 0; i < this.personal.validRangosDescansosMartes.length; i++) {
            if (!this.personal.validRangosDescansosMartes[i]) {
                validRango[1] = false;
                i = this.personal.validRangosDescansosMartes.length;
            }
        }

        for (var i = 0; i < this.personal.validRangosDescansosMiercoles.length; i++) {
            if (!this.personal.validRangosDescansosMiercoles[i]) {
                validRango[2] = false;
                i = this.personal.validRangosDescansosMiercoles.length;
            }
        }


        for (var i = 0; i < this.personal.validRangosDescansosJueves.length; i++) {
            if (!this.personal.validRangosDescansosJueves[i]) {
                validRango[3] = false;
                i = this.personal.validRangosDescansosJueves.length;
            }
        }


        for (var i = 0; i < this.personal.validRangosDescansosViernes.length; i++) {
            if (!this.personal.validRangosDescansosViernes[i]) {
                validRango[4] = false;
                i = this.personal.validRangosDescansosViernes.length;
            }
        }


        for (var i = 0; i < this.personal.validRangosDescansosSabado.length; i++) {
            if (!this.personal.validRangosDescansosSabado[i]) {
                validRango[5] = false;
                i = this.personal.validRangosDescansosSabado.length;
            }
        }


        for (var i = 0; i < this.personal.validRangosDescansosDomingo.length; i++) {
            if (!this.personal.validRangosDescansosDomingo[i]) {
                validRango[6] = false;
                i = this.personal.validRangosDescansosDomingo.length;
            }
        }

        if (validRango[0] && validRango[1] && validRango[2] && validRango[3] && validRango[4] && validRango[5] && validRango[6]) {
            this.validRangoDescansos = true;
        }
    }

    personal_validarDescansosEmpalmados() {
        this.validEmpalmeLunes = [];
        this.validEmpalmeMartes = [];
        this.validEmpalmeMiercoles = [];
        this.validEmpalmeJueves = [];
        this.validEmpalmeViernes = [];
        this.validEmpalmeSabado = [];
        this.validEmpalmeDomingo = [];
        // Lunes
        if (this.personal.objetoLunes.length == 2) {
            this.personal_validDescansosEmpalmados(this.personal.objetoLunes[0].horaInicio, this.personal.objetoLunes[0].horaFin, this.personal.objetoLunes[1].horaInicio, this.personal.objetoLunes[1].horaFin, null, null);
            if (this.validEmpalme2) {
                this.msgLunesDescansos[1] = this.msgHora;
                this.validEmpalmeLunes[1] = JSON.parse(JSON.stringify(this.validEmpalme2));
                $("#txtLunesDescansoFin1> div:first-child").attr("style", "outline:  red solid 1px !important");
                $("#txtLunesDescansoInicio1> div:first-child").attr("style", "outline:  red solid 1px !important");
                this.tab.selectedIndex = 2;
            } else {
                this.msgLunesDescansos[1] = "";
                this.validEmpalmeLunes[1] = JSON.parse(JSON.stringify(this.validEmpalme2));
                $("#txtLunesDescansoInicio1> div:first-child").attr("style", "outline: none");
                $("#txtLunesDescansoFin1> div:first-child").attr("style", "outline: none");
            }
        } else if (this.personal.objetoLunes.length == 3) {
            this.personal_validDescansosEmpalmados(this.personal.objetoLunes[0].horaInicio, this.personal.objetoLunes[0].horaFin, this.personal.objetoLunes[1].horaInicio, this.personal.objetoLunes[1].horaFin, this.personal.objetoLunes[2].horaInicio, this.personal.objetoLunes[2].horaFin);
            if (this.validEmpalme2) {
                this.msgLunesDescansos[1] = this.msgHora;
                this.validEmpalmeLunes[1] = JSON.parse(JSON.stringify(this.validEmpalme2));
                $("#txtLunesDescansoFin1> div:first-child").attr("style", "outline:  red solid 1px !important");
                $("#txtLunesDescansoInicio1> div:first-child").attr("style", "outline:  red solid 1px !important");
                this.tab.selectedIndex = 2;
            } else if (this.validEmpalme3) {
                this.msgLunesDescansos[1] = "";
                this.validEmpalmeLunes[1] = JSON.parse(JSON.stringify(this.validEmpalme2));
                $("#txtLunesDescansoInicio1> div:first-child").attr("style", "outline: none");
                $("#txtLunesDescansoFin1> div:first-child").attr("style", "outline: none");
                this.msgLunesDescansos[2] = this.msgHora;
                this.validEmpalmeLunes[2] = JSON.parse(JSON.stringify(this.validEmpalme3));
                $("#txtLunesDescansoFin2> div:first-child").attr("style", "outline:  red solid 1px !important");
                $("#txtLunesDescansoInicio2> div:first-child").attr("style", "outline:  red solid 1px !important");
                this.tab.selectedIndex = 2;
            } else {
                $("#txtLunesDescansoInicio2> div:first-child").attr("style", "outline: none");
                $("#txtLunesDescansoFin2> div:first-child").attr("style", "outline: none");
                this.msgLunesDescansos[2] = "";
                this.validEmpalmeLunes[2] = JSON.parse(JSON.stringify(this.validEmpalme3));
            }
        }

        if (this.personal.objetoMartes.length == 2) {
            this.personal_validDescansosEmpalmados(this.personal.objetoMartes[0].horaInicio, this.personal.objetoMartes[0].horaFin, this.personal.objetoMartes[1].horaInicio, this.personal.objetoMartes[1].horaFin, null, null);
            if (this.validEmpalme2) {
                this.msgMartesDescansos[1] = this.msgHora;
                this.validEmpalmeMartes[1] = JSON.parse(JSON.stringify(this.validEmpalme2));
                $("#txtMartesDescansoFin1> div:first-child").attr("style", "outline:  red solid 1px !important");
                $("#txtMartesDescansoInicio1> div:first-child").attr("style", "outline:  red solid 1px !important");
                this.tab.selectedIndex = 2;
            } else {
                this.msgMartesDescansos[1] = "";
                this.validEmpalmeMartes[1] = JSON.parse(JSON.stringify(this.validEmpalme2));
                $("#txtMartesDescansoInicio1> div:first-child").attr("style", "outline: none");
                $("#txtMartesDescansoFin1> div:first-child").attr("style", "outline: none");
            }
        } else if (this.personal.objetoMartes.length == 3) {
            this.personal_validDescansosEmpalmados(this.personal.objetoMartes[0].horaInicio, this.personal.objetoMartes[0].horaFin, this.personal.objetoMartes[1].horaInicio, this.personal.objetoMartes[1].horaFin, this.personal.objetoMartes[2].horaInicio, this.personal.objetoMartes[2].horaFin);
            if (this.validEmpalme2) {
                this.msgMartesDescansos[1] = this.msgHora;
                this.validEmpalmeMartes[1] = JSON.parse(JSON.stringify(this.validEmpalme2));
                $("#txtMartesDescansoFin1> div:first-child").attr("style", "outline:  red solid 1px !important");
                $("#txtMartesDescansoInicio1> div:first-child").attr("style", "outline:  red solid 1px !important");
                this.tab.selectedIndex = 2;
            } else if (this.validEmpalme3) {
                this.msgMartesDescansos[1] = "";
                this.validEmpalmeMartes[1] = JSON.parse(JSON.stringify(this.validEmpalme2));
                $("#txtMartesDescansoInicio1> div:first-child").attr("style", "outline: none");
                $("#txtMartesDescansoFin1> div:first-child").attr("style", "outline: none");
                this.msgMartesDescansos[2] = this.msgHora;
                this.validEmpalmeMartes[2] = JSON.parse(JSON.stringify(this.validEmpalme3));
                $("#txtMartesDescansoFin2> div:first-child").attr("style", "outline:  red solid 1px !important");
                $("#txtMartesDescansoInicio2> div:first-child").attr("style", "outline:  red solid 1px !important");
                this.tab.selectedIndex = 2;
            } else {
                $("#txtMartesDescansoInicio2> div:first-child").attr("style", "outline: none");
                $("#txtMartesDescansoFin2> div:first-child").attr("style", "outline: none");
                this.msgMartesDescansos[2] = "";
                this.validEmpalmeMartes[2] = JSON.parse(JSON.stringify(this.validEmpalme3));
            }
        }

        if (this.personal.objetoMiercoles.length == 2) {
            this.personal_validDescansosEmpalmados(this.personal.objetoMiercoles[0].horaInicio, this.personal.objetoMiercoles[0].horaFin, this.personal.objetoMiercoles[1].horaInicio, this.personal.objetoMiercoles[1].horaFin, null, null);
            if (this.validEmpalme2) {
                this.msgMiercolesDescansos[1] = this.msgHora;
                this.validEmpalmeMiercoles[1] = JSON.parse(JSON.stringify(this.validEmpalme2));
                $("#txtMiercolesDescansoFin1> div:first-child").attr("style", "outline:  red solid 1px !important");
                $("#txtMiercolesDescansoInicio1> div:first-child").attr("style", "outline:  red solid 1px !important");
                this.tab.selectedIndex = 2;
            } else {
                this.msgMiercolesDescansos[1] = "";
                this.validEmpalmeMiercoles[1] = JSON.parse(JSON.stringify(this.validEmpalme2));
                $("#txtMiercolesDescansoInicio1> div:first-child").attr("style", "outline: none");
                $("#txtMiercolesDescansoFin1> div:first-child").attr("style", "outline: none");
            }
        } else if (this.personal.objetoMiercoles.length == 3) {
            this.personal_validDescansosEmpalmados(this.personal.objetoMiercoles[0].horaInicio, this.personal.objetoMiercoles[0].horaFin, this.personal.objetoMiercoles[1].horaInicio, this.personal.objetoMiercoles[1].horaFin, this.personal.objetoMiercoles[2].horaInicio, this.personal.objetoMiercoles[2].horaFin);
            if (this.validEmpalme2) {
                this.msgMiercolesDescansos[1] = this.msgHora;
                this.validEmpalmeMiercoles[1] = JSON.parse(JSON.stringify(this.validEmpalme2));
                $("#txtMiercolesDescansoFin1> div:first-child").attr("style", "outline:  red solid 1px !important");
                $("#txtMiercolesDescansoInicio1> div:first-child").attr("style", "outline:  red solid 1px !important");
                this.tab.selectedIndex = 2;
            } else if (this.validEmpalme3) {
                this.msgMiercolesDescansos[1] = "";
                this.validEmpalmeMiercoles[1] = JSON.parse(JSON.stringify(this.validEmpalme2));
                $("#txtMiercolesDescansoInicio1> div:first-child").attr("style", "outline: none");
                $("#txtMiercolesDescansoFin1> div:first-child").attr("style", "outline: none");
                this.msgMiercolesDescansos[2] = this.msgHora;
                this.validEmpalmeMiercoles[2] = JSON.parse(JSON.stringify(this.validEmpalme3));
                $("#txtMiercolesDescansoFin2> div:first-child").attr("style", "outline:  red solid 1px !important");
                $("#txtMiercolesDescansoInicio2> div:first-child").attr("style", "outline:  red solid 1px !important");
                this.tab.selectedIndex = 2;
            } else {
                $("#txtMiercolesDescansoInicio2> div:first-child").attr("style", "outline: none");
                $("#txtMiercolesDescansoFin2> div:first-child").attr("style", "outline: none");
                this.msgMiercolesDescansos[2] = "";
                this.validEmpalmeMiercoles[2] = JSON.parse(JSON.stringify(this.validEmpalme3));
            }
        }

        if (this.personal.objetoJueves.length == 2) {
            this.personal_validDescansosEmpalmados(this.personal.objetoJueves[0].horaInicio, this.personal.objetoJueves[0].horaFin, this.personal.objetoJueves[1].horaInicio, this.personal.objetoJueves[1].horaFin, null, null);
            if (this.validEmpalme2) {
                this.msgJuevesDescansos[1] = this.msgHora;
                this.validEmpalmeJueves[1] = JSON.parse(JSON.stringify(this.validEmpalme2));
                $("#txtJuevesDescansoFin1> div:first-child").attr("style", "outline:  red solid 1px !important");
                $("#txtJuevesDescansoInicio1> div:first-child").attr("style", "outline:  red solid 1px !important");
                this.tab.selectedIndex = 2;
            } else {
                this.msgJuevesDescansos[1] = "";
                this.validEmpalmeJueves[1] = JSON.parse(JSON.stringify(this.validEmpalme2));
                $("#txtJuevesDescansoInicio1> div:first-child").attr("style", "outline: none");
                $("#txtJuevesDescansoFin1> div:first-child").attr("style", "outline: none");
            }
        } else if (this.personal.objetoJueves.length == 3) {
            this.personal_validDescansosEmpalmados(this.personal.objetoJueves[0].horaInicio, this.personal.objetoJueves[0].horaFin, this.personal.objetoJueves[1].horaInicio, this.personal.objetoJueves[1].horaFin, this.personal.objetoJueves[2].horaInicio, this.personal.objetoJueves[2].horaFin);
            if (this.validEmpalme2) {
                this.msgJuevesDescansos[1] = this.msgHora;
                this.validEmpalmeJueves[1] = JSON.parse(JSON.stringify(this.validEmpalme2));
                $("#txtJuevesDescansoFin1> div:first-child").attr("style", "outline:  red solid 1px !important");
                $("#txtJuevesDescansoInicio1> div:first-child").attr("style", "outline:  red solid 1px !important");
                this.tab.selectedIndex = 2;
            } else if (this.validEmpalme3) {
                this.msgJuevesDescansos[1] = "";
                this.validEmpalmeJueves[1] = JSON.parse(JSON.stringify(this.validEmpalme2));
                $("#txtJuevesDescansoInicio1> div:first-child").attr("style", "outline: none");
                $("#txtJuevesDescansoFin1> div:first-child").attr("style", "outline: none");
                this.msgJuevesDescansos[2] = this.msgHora;
                this.validEmpalmeJueves[2] = JSON.parse(JSON.stringify(this.validEmpalme3));
                $("#txtJuevesDescansoFin2> div:first-child").attr("style", "outline:  red solid 1px !important");
                $("#txtJuevesDescansoInicio2> div:first-child").attr("style", "outline:  red solid 1px !important");
                this.tab.selectedIndex = 2;
            } else {
                $("#txtJuevesDescansoInicio2> div:first-child").attr("style", "outline: none");
                $("#txtJuevesDescansoFin2> div:first-child").attr("style", "outline: none");
                this.msgJuevesDescansos[2] = "";
                this.validEmpalmeJueves[2] = JSON.parse(JSON.stringify(this.validEmpalme3));
            }
        }

        if (this.personal.objetoViernes.length == 2) {
            this.personal_validDescansosEmpalmados(this.personal.objetoViernes[0].horaInicio, this.personal.objetoViernes[0].horaFin, this.personal.objetoViernes[1].horaInicio, this.personal.objetoViernes[1].horaFin, null, null);
            if (this.validEmpalme2) {
                this.msgViernesDescansos[1] = this.msgHora;
                this.validEmpalmeViernes[1] = JSON.parse(JSON.stringify(this.validEmpalme2));
                $("#txtViernesDescansoFin1> div:first-child").attr("style", "outline:  red solid 1px !important");
                $("#txtViernesDescansoInicio1> div:first-child").attr("style", "outline:  red solid 1px !important");
                this.tab.selectedIndex = 2;
            } else {
                this.msgViernesDescansos[1] = "";
                this.validEmpalmeViernes[1] = JSON.parse(JSON.stringify(this.validEmpalme2));
                $("#txtViernesDescansoInicio1> div:first-child").attr("style", "outline: none");
                $("#txtViernesDescansoFin1> div:first-child").attr("style", "outline: none");
            }
        } else if (this.personal.objetoViernes.length == 3) {
            this.personal_validDescansosEmpalmados(this.personal.objetoViernes[0].horaInicio, this.personal.objetoViernes[0].horaFin, this.personal.objetoViernes[1].horaInicio, this.personal.objetoViernes[1].horaFin, this.personal.objetoViernes[2].horaInicio, this.personal.objetoViernes[2].horaFin);
            if (this.validEmpalme2) {
                this.msgViernesDescansos[1] = this.msgHora;
                this.validEmpalmeViernes[1] = JSON.parse(JSON.stringify(this.validEmpalme2));
                $("#txtViernesDescansoFin1> div:first-child").attr("style", "outline:  red solid 1px !important");
                $("#txtViernesDescansoInicio1> div:first-child").attr("style", "outline:  red solid 1px !important");
                this.tab.selectedIndex = 2;
            } else if (this.validEmpalme3) {
                this.msgViernesDescansos[1] = "";
                this.validEmpalmeViernes[1] = JSON.parse(JSON.stringify(this.validEmpalme2));
                $("#txtViernesDescansoInicio1> div:first-child").attr("style", "outline: none");
                $("#txtViernesDescansoFin1> div:first-child").attr("style", "outline: none");
                this.msgViernesDescansos[2] = this.msgHora;
                this.validEmpalmeViernes[2] = JSON.parse(JSON.stringify(this.validEmpalme3));
                $("#txtViernesDescansoFin2> div:first-child").attr("style", "outline:  red solid 1px !important");
                $("#txtViernesDescansoInicio2> div:first-child").attr("style", "outline:  red solid 1px !important");
                this.tab.selectedIndex = 2;
            } else {
                $("#txtViernesDescansoInicio2> div:first-child").attr("style", "outline: none");
                $("#txtViernesDescansoFin2> div:first-child").attr("style", "outline: none");
                this.msgViernesDescansos[2] = "";
                this.validEmpalmeViernes[2] = JSON.parse(JSON.stringify(this.validEmpalme3));
            }
        }

        if (this.personal.objetoSabado.length == 2) {
            this.personal_validDescansosEmpalmados(this.personal.objetoSabado[0].horaInicio, this.personal.objetoSabado[0].horaFin, this.personal.objetoSabado[1].horaInicio, this.personal.objetoSabado[1].horaFin, null, null);
            if (this.validEmpalme2) {
                this.msgSabadoDescansos[1] = this.msgHora;
                this.validEmpalmeSabado[1] = JSON.parse(JSON.stringify(this.validEmpalme2));
                $("#txtSabadoDescansoFin1> div:first-child").attr("style", "outline:  red solid 1px !important");
                $("#txtSabadoDescansoInicio1> div:first-child").attr("style", "outline:  red solid 1px !important");
                this.tab.selectedIndex = 2;
            } else {
                this.msgSabadoDescansos[1] = "";
                this.validEmpalmeSabado[1] = JSON.parse(JSON.stringify(this.validEmpalme2));
                $("#txtSabadoDescansoInicio1> div:first-child").attr("style", "outline: none");
                $("#txtSabadoDescansoFin1> div:first-child").attr("style", "outline: none");
            }
        } else if (this.personal.objetoSabado.length == 3) {
            this.personal_validDescansosEmpalmados(this.personal.objetoSabado[0].horaInicio, this.personal.objetoSabado[0].horaFin, this.personal.objetoSabado[1].horaInicio, this.personal.objetoSabado[1].horaFin, this.personal.objetoSabado[2].horaInicio, this.personal.objetoSabado[2].horaFin);
            if (this.validEmpalme2) {
                this.msgSabadoDescansos[1] = this.msgHora;
                this.validEmpalmeSabado[1] = JSON.parse(JSON.stringify(this.validEmpalme2));
                $("#txtSabadoDescansoFin1> div:first-child").attr("style", "outline:  red solid 1px !important");
                $("#txtSabadoDescansoInicio1> div:first-child").attr("style", "outline:  red solid 1px !important");
                this.tab.selectedIndex = 2;
            } else if (this.validEmpalme3) {
                this.msgSabadoDescansos[1] = "";
                this.validEmpalmeSabado[1] = JSON.parse(JSON.stringify(this.validEmpalme2));
                $("#txtSabadoDescansoInicio1> div:first-child").attr("style", "outline: none");
                $("#txtSabadoDescansoFin1> div:first-child").attr("style", "outline: none");
                this.msgSabadoDescansos[2] = this.msgHora;
                this.validEmpalmeSabado[2] = JSON.parse(JSON.stringify(this.validEmpalme3));
                $("#txtSabadoDescansoFin2> div:first-child").attr("style", "outline:  red solid 1px !important");
                $("#txtSabadoDescansoInicio2> div:first-child").attr("style", "outline:  red solid 1px !important");
                this.tab.selectedIndex = 2;
            } else {
                $("#txtSabadoDescansoInicio2> div:first-child").attr("style", "outline: none");
                $("#txtSabadoDescansoFin2> div:first-child").attr("style", "outline: none");
                this.msgSabadoDescansos[2] = "";
                this.validEmpalmeSabado[2] = JSON.parse(JSON.stringify(this.validEmpalme3));
            }
        }

        if (this.personal.objetoDomingo.length == 2) {
            this.personal_validDescansosEmpalmados(this.personal.objetoDomingo[0].horaInicio, this.personal.objetoDomingo[0].horaFin, this.personal.objetoDomingo[1].horaInicio, this.personal.objetoDomingo[1].horaFin, null, null);
            if (this.validEmpalme2) {
                this.msgDomingoDescansos[1] = this.msgHora;
                this.validEmpalmeDomingo[1] = JSON.parse(JSON.stringify(this.validEmpalme2));
                $("#txtDomingoDescansoFin1> div:first-child").attr("style", "outline:  red solid 1px !important");
                $("#txtDomingoDescansoInicio1> div:first-child").attr("style", "outline:  red solid 1px !important");
                this.tab.selectedIndex = 2;
            } else {
                this.msgDomingoDescansos[1] = "";
                this.validEmpalmeDomingo[1] = JSON.parse(JSON.stringify(this.validEmpalme2));
                $("#txtDomingoDescansoInicio1> div:first-child").attr("style", "outline: none");
                $("#txtDomingoDescansoFin1> div:first-child").attr("style", "outline: none");
            }
        } else if (this.personal.objetoDomingo.length == 3) {
            this.personal_validDescansosEmpalmados(this.personal.objetoDomingo[0].horaInicio, this.personal.objetoDomingo[0].horaFin, this.personal.objetoDomingo[1].horaInicio, this.personal.objetoDomingo[1].horaFin, this.personal.objetoDomingo[2].horaInicio, this.personal.objetoDomingo[2].horaFin);
            if (this.validEmpalme2) {
                this.msgDomingoDescansos[1] = this.msgHora;
                this.validEmpalmeDomingo[1] = JSON.parse(JSON.stringify(this.validEmpalme2));
                $("#txtDomingoDescansoFin1> div:first-child").attr("style", "outline:  red solid 1px !important");
                $("#txtDomingoDescansoInicio1> div:first-child").attr("style", "outline:  red solid 1px !important");
                this.tab.selectedIndex = 2;
            } else if (this.validEmpalme3) {
                this.msgDomingoDescansos[1] = "";
                this.validEmpalmeDomingo[1] = JSON.parse(JSON.stringify(this.validEmpalme2));
                $("#txtDomingoDescansoInicio1> div:first-child").attr("style", "outline: none");
                $("#txtDomingoDescansoFin1> div:first-child").attr("style", "outline: none");
                this.msgDomingoDescansos[2] = this.msgHora;
                this.validEmpalmeDomingo[2] = JSON.parse(JSON.stringify(this.validEmpalme3));
                $("#txtDomingoDescansoFin2> div:first-child").attr("style", "outline:  red solid 1px !important");
                $("#txtDomingoDescansoInicio2> div:first-child").attr("style", "outline:  red solid 1px !important");
                this.tab.selectedIndex = 2;
            } else {
                $("#txtDomingoDescansoInicio2> div:first-child").attr("style", "outline: none");
                $("#txtDomingoDescansoFin2> div:first-child").attr("style", "outline: none");
                this.msgDomingoDescansos[2] = "";
                this.validEmpalmeDomingo[2] = JSON.parse(JSON.stringify(this.validEmpalme3));
            }
        }
    }
    
    personal_validDescansosEmpalmados(horaInicio1: any, horaFin1: any, horaInicio2: any, horaFin2: any, horaInicio3: any, horaFin3: any) {
        this.validEmpalme = false;
        this.validEmpalme2 = false;
        if (horaInicio3 != null && horaFin3 != null) {
            this.validEmpalme3 = false;
            if ((horaInicio1 < horaFin2 && horaInicio1 > horaInicio2) || (horaFin1 < horaFin2 && horaFin1 > horaInicio2) || (horaInicio2 < horaFin1 && horaInicio2 > horaInicio1) || (horaFin2 < horaFin1 && horaFin2 > horaInicio1) || (horaFin1 == horaFin2 && horaInicio1 == horaInicio2)) {
                this.validEmpalme2 = true;
                this.msgHora = this.personalTranslate.msgHora2;
            } else if ((horaInicio1 < horaFin3 && horaInicio1 > horaInicio3) || (horaFin1 < horaFin3 && horaFin1 > horaInicio3) || (horaInicio3 < horaFin1 && horaInicio3 > horaInicio1) || (horaFin3 < horaFin1 && horaFin3 > horaInicio1) || (horaFin1 == horaFin3 && horaInicio1 == horaInicio3)) {
                this.validEmpalme3 = true;
                this.msgHora = this.personalTranslate.msgHora2;
            } else if ((horaInicio2 < horaFin3 && horaInicio2 > horaInicio3) || (horaFin2 < horaFin3 && horaFin2 > horaInicio3) || (horaInicio3 < horaFin2 && horaInicio3 > horaInicio2) || (horaFin3 < horaFin2 && horaFin3 > horaInicio2) || (horaFin2 == horaFin3 && horaInicio2 == horaInicio3)) {
                this.validEmpalme3 = true;
                this.msgHora = this.personalTranslate.msgHora2;
            }
        } else {
            if ((horaInicio1 < horaFin2 && horaInicio1 > horaInicio2) || (horaFin1 < horaFin2 && horaFin1 > horaInicio2) || (horaInicio2 < horaFin1 && horaInicio2 > horaInicio1) || (horaFin2 < horaFin1 && horaFin2 > horaInicio1) || (horaFin1 == horaFin2 && horaInicio1 == horaInicio2)) {
                this.validEmpalme2 = true;
                this.msgHora = this.personalTranslate.msgHora2;
            }
        }
    }

    personal_validarDescansosEnDia() {
        this.personal.validDescansosEnLunes = [];
        this.personal.validDescansosEnMartes = [];
        this.personal.validDescansosEnMiercoles = [];
        this.personal.validDescansosEnJueves = [];
        this.personal.validDescansosEnViernes = [];
        this.personal.validDescansosEnSabado = [];
        this.personal.validDescansosEnDomingo = [];
        this.validRango2 = [];
        this.validRangoDescansosEnDia = false;
        for (var i = 0; i < 7; i++) {
            this.validRango2[i] = true;
        }

        if (this.personal.lunes) {
            for (var i = 0; i < this.personal.objetoLunes.length; i++) {
                this.personal_validDescansosEnDia(this.personal.objetoLunes[i].horaInicio, this.personal.objetoLunes[i].horaFin, this.personal.horaInicioLunes, this.personal.horaFinLunes)
                this.msgLunesDescansos[i] = JSON.parse(JSON.stringify(this.msgHora));
                this.personal.validDescansosEnLunes[i] = JSON.parse(JSON.stringify(this.validRangoDescansoEnDia));
                if (this.msgLunesDescansos[i] != "") {
                    $("#txtLunesDescansoFin" + i + "> div:first-child").attr("style", "outline: red solid 1px !important");
                    $("#txtLunesDescansoInicio" + i + "> div:first-child").attr("style", "outline: red solid 1px !important");
                    this.tab.selectedIndex = 2;
                } else {
                    $("#txtLunesDescansoInicio" + i + "> div:first-child").attr("style", "outline: none");
                    $("#txtLunesDescansoFin" + i + "> div:first-child").attr("style", "outline: none");
                }
            }

            for (var i = 0; i < this.personal.validDescansosEnLunes.length; i++) {
                if (!this.personal.validDescansosEnLunes[i]) {
                    this.validRango2[0] = false;
                }
            }
        }
        if (this.personal.martes) {
            for (var i = 0; i < this.personal.objetoMartes.length; i++) {
                this.personal_validDescansosEnDia(this.personal.objetoMartes[i].horaInicio, this.personal.objetoMartes[i].horaFin, this.personal.horaInicioMartes, this.personal.horaFinMartes)
                this.msgMartesDescansos[i] = JSON.parse(JSON.stringify(this.msgHora));
                this.personal.validDescansosEnMartes[i] = JSON.parse(JSON.stringify(this.validRangoDescansoEnDia));
                if (this.msgMartesDescansos[i] != "") {
                    $("#txtMartesDescansoFin" + i + "> div:first-child").attr("style", "outline: red solid 1px !important");
                    $("#txtMartesDescansoInicio" + i + "> div:first-child").attr("style", "outline: red solid 1px !important");
                    this.tab.selectedIndex = 2;
                } else {
                    $("#txtMartesDescansoInicio" + i + "> div:first-child").attr("style", "outline: none");
                    $("#txtMartesDescansoFin" + i + "> div:first-child").attr("style", "outline: none");
                }
            }

            for (var i = 0; i < this.personal.validDescansosEnMartes.length; i++) {
                if (!this.personal.validDescansosEnMartes[i]) {
                    this.validRango2[1] = false;
                }
            }
        }

        if (this.personal.miercoles) {
            for (var i = 0; i < this.personal.objetoMiercoles.length; i++) {
                this.personal_validDescansosEnDia(this.personal.objetoMiercoles[i].horaInicio, this.personal.objetoMiercoles[i].horaFin, this.personal.horaInicioMiercoles, this.personal.horaFinMiercoles)
                this.msgMiercolesDescansos[i] = JSON.parse(JSON.stringify(this.msgHora));
                this.personal.validDescansosEnMiercoles[i] = JSON.parse(JSON.stringify(this.validRangoDescansoEnDia));
                if (this.msgMiercolesDescansos[i] != "") {
                    $("#txtMiercolesDescansoFin" + i + "> div:first-child").attr("style", "outline: red solid 1px !important");
                    $("#txtMiercolesDescansoInicio" + i + "> div:first-child").attr("style", "outline: red solid 1px !important");
                    this.tab.selectedIndex = 2;
                } else {
                    $("#txtMiercolesDescansoInicio" + i + "> div:first-child").attr("style", "outline: none");
                    $("#txtMiercolesDescansoFin" + i + "> div:first-child").attr("style", "outline: none");
                }
            }

            for (var i = 0; i < this.personal.validDescansosEnMiercoles.length; i++) {
                if (!this.personal.validDescansosEnMiercoles[i]) {
                    this.validRango2[2] = false;
                }
            }
        }

        if (this.personal.jueves) {
            for (var i = 0; i < this.personal.objetoJueves.length; i++) {
                this.personal_validDescansosEnDia(this.personal.objetoJueves[i].horaInicio, this.personal.objetoJueves[i].horaFin, this.personal.horaInicioJueves, this.personal.horaFinJueves)
                this.msgJuevesDescansos[i] = JSON.parse(JSON.stringify(this.msgHora));
                this.personal.validDescansosEnJueves[i] = JSON.parse(JSON.stringify(this.validRangoDescansoEnDia));
                if (this.msgJuevesDescansos[i] != "") {
                    $("#txtJuevesDescansoFin" + i + "> div:first-child").attr("style", "outline: red solid 1px !important");
                    $("#txtJuevesDescansoInicio" + i + "> div:first-child").attr("style", "outline: red solid 1px !important");
                    this.tab.selectedIndex = 2;
                } else {
                    $("#txtJuevesDescansoInicio" + i + "> div:first-child").attr("style", "outline: none");
                    $("#txtJuevesDescansoFin" + i + "> div:first-child").attr("style", "outline: none");
                }
            }

            for (var i = 0; i < this.personal.validDescansosEnJueves.length; i++) {
                if (!this.personal.validDescansosEnJueves[i]) {
                    this.validRango2[3] = false;
                }
            }
        }

        if (this.personal.viernes) {
            for (var i = 0; i < this.personal.objetoViernes.length; i++) {
                this.personal_validDescansosEnDia(this.personal.objetoViernes[i].horaInicio, this.personal.objetoViernes[i].horaFin, this.personal.horaInicioViernes, this.personal.horaFinViernes)
                this.msgViernesDescansos[i] = JSON.parse(JSON.stringify(this.msgHora));
                this.personal.validDescansosEnViernes[i] = JSON.parse(JSON.stringify(this.validRangoDescansoEnDia));
                if (this.msgViernesDescansos[i] != "") {
                    $("#txtViernesDescansoFin" + i + "> div:first-child").attr("style", "outline: red solid 1px !important");
                    $("#txtViernesDescansoInicio" + i + "> div:first-child").attr("style", "outline: red solid 1px !important");
                    this.tab.selectedIndex = 2;
                } else {
                    $("#txtViernesDescansoInicio" + i + "> div:first-child").attr("style", "outline: none");
                    $("#txtViernesDescansoFin" + i + "> div:first-child").attr("style", "outline: none");
                }
            }

            for (var i = 0; i < this.personal.validDescansosEnViernes.length; i++) {
                if (!this.personal.validDescansosEnViernes[i]) {
                    this.validRango2[4] = false;
                }
            }

        }

        if (this.personal.sabado) {
            for (var i = 0; i < this.personal.objetoSabado.length; i++) {
                this.personal_validDescansosEnDia(this.personal.objetoSabado[i].horaInicio, this.personal.objetoSabado[i].horaFin, this.personal.horaInicioSabado, this.personal.horaFinSabado)
                this.msgSabadoDescansos[i] = JSON.parse(JSON.stringify(this.msgHora));
                this.personal.validDescansosEnSabado[i] = JSON.parse(JSON.stringify(this.validRangoDescansoEnDia));
                if (this.msgSabadoDescansos[i] != "") {
                    $("#txtSabadoDescansoFin" + i + "> div:first-child").attr("style", "outline: red solid 1px !important");
                    $("#txtSabadoDescansoInicio" + i + "> div:first-child").attr("style", "outline: red solid 1px !important");
                    this.tab.selectedIndex = 2;
                } else {
                    $("#txtSabadoDescansoInicio" + i + "> div:first-child").attr("style", "outline: none");
                    $("#txtSabadoDescansoFin" + i + "> div:first-child").attr("style", "outline: none");
                }
            }

            for (var i = 0; i < this.personal.validDescansosEnSabado.length; i++) {
                if (!this.personal.validDescansosEnSabado[i]) {
                    this.validRango2[5] = false;
                }
            }
        }

        if (this.personal.domingo) {
            for (var i = 0; i < this.personal.objetoDomingo.length; i++) {
                this.personal_validDescansosEnDia(this.personal.objetoDomingo[i].horaInicio, this.personal.objetoDomingo[i].horaFin, this.personal.horaInicioDomingo, this.personal.horaFinDomingo)
                this.msgDomingoDescansos[i] = JSON.parse(JSON.stringify(this.msgHora));
                this.personal.validDescansosEnDomingo[i] = JSON.parse(JSON.stringify(this.validRangoDescansoEnDia));
                if (this.msgDomingoDescansos[i] != "") {
                    $("#txtDomingoDescansoFin" + i + "> div:first-child").attr("style", "outline: red solid 1px !important");
                    $("#txtDomingoDescansoInicio" + i + "> div:first-child").attr("style", "outline: red solid 1px !important");
                    this.tab.selectedIndex = 2;
                } else {
                    $("#txtDomingoDescansoInicio" + i + "> div:first-child").attr("style", "outline: none");
                    $("#txtDomingoDescansoFin" + i + "> div:first-child").attr("style", "outline: none");
                }
            }

            for (var i = 0; i < this.personal.validDescansosEnDomingo.length; i++) {
                if (!this.personal.validDescansosEnDomingo[i]) {
                    this.validRango2[6] = false;
                }
            }
        }

        if (this.validRango2[0] && this.validRango2[1] && this.validRango2[2] && this.validRango2[3] && this.validRango2[4] && this.validRango2[5] && this.validRango2[6]) {
            this.validRangoDescansosEnDia = true;
        }
    }

    personal_validDescansosEnDia(horaInicioDescanso: any, horaFinDescanso: any, horaInicioDia: any, horaFinDia: any) {
        if (horaInicioDescanso < horaInicioDia || horaInicioDescanso > horaFinDia || horaFinDescanso > horaFinDia) {
            this.validRangoDescansoEnDia = false;
            this.msgHora = this.personalTranslate.msgHora3;
        } else {
            this.validRangoDescansoEnDia = true;
            this.msgHora = "";
        }
    }

    personal_aceptarDescansos() {
        this.personal.validDescansosEnLunes = [];
        this.personal.validDescansosEnMartes = [];
        this.personal.validDescansosEnMiercoles = [];
        this.personal.validDescansosEnJueves = [];
        this.personal.validDescansosEnViernes = [];
        this.personal.validDescansosEnSabado = [];
        this.personal.validDescansosEnDomingo = [];

        this.personal.validRangosDescansosLunes = [];
        this.personal.validRangosDescansosMartes = [];
        this.personal.validRangosDescansosMiercoles = [];
        this.personal.validRangosDescansosJueves = [];
        this.personal.validRangosDescansosViernes = [];
        this.personal.validRangosDescansosSabado = [];
        this.personal.validRangosDescansosDomingo = [];

        this.validEmpalmeLunes = [];
        this.validEmpalmeMartes = [];
        this.validEmpalmeMiercoles = [];
        this.validEmpalmeJueves = [];
        this.validEmpalmeViernes = [];
        this.validEmpalmeSabado = [];
        this.validEmpalmeDomingo = [];
        this.personal.DescansosValidados = false;

        this.personal_validarRangosDescansos();
        if (this.validRangoDescansos) {
            this.personal_validarDescansosEnDia();
            if (this.validRangoDescansosEnDia) {
                this.personal_validarDescansosEmpalmados();
                if (!this.validEmpalmeLunes[1] && !this.validEmpalmeLunes[2] && !this.validEmpalmeMartes[1] && !this.validEmpalmeMartes[2] && !this.validEmpalmeMiercoles[1] && !this.validEmpalmeMiercoles[2] && !this.validEmpalmeJueves[1] && !this.validEmpalmeJueves[2] && !this.validEmpalmeViernes[1] && !this.validEmpalmeViernes[2] && !this.validEmpalmeSabado[1] && !this.validEmpalmeSabado[2] && !this.validEmpalmeDomingo[1] && !this.validEmpalmeDomingo[2]) {
                    this.personal.DescansosValidados = true;
                } else {
                    setTimeout(() =>{
                        this.validPestañaDescansos();
                    }, 50);
                }
            } else {
                setTimeout(() =>{
                    this.validPestañaDescansos();
                }, 50);
            }
        } else {
            setTimeout(() =>{
                this.validPestañaDescansos();
            }, 50);
        }
    }

    validDescansosRequeridos() {
        this.contDescansosRequeridos = 0;
        for (var i = 0; i < this.personal.objetoLunes.length; i++) {
            if (this.personal.objetoLunes[i].horaInicio == "" || this.personal.objetoLunes[i].horaInicio == undefined) {
                $("#txtLunesDescansoInicio" + i + "> div:first-child").attr("style", "outline: red solid 1px !important");
                this.contDescansosRequeridos++;
            } else {
                $("#txtLunesDescansoInicio" + i + "> div:first-child").attr("style", "outline: none");
            }
            if (this.personal.objetoLunes[i].horaFin == "" || this.personal.objetoLunes[i].horaFin == undefined) {
                $("#txtLunesDescansoFin" + i + "> div:first-child").attr("style", "outline: red solid 1px !important");
                this.contDescansosRequeridos++;
            } else {
                $("#txtLunesDescansoFin" + i + "> div:first-child").attr("style", "outline: none");
            }
        }

        for (var i = 0; i < this.personal.objetoMartes.length; i++) {
            if (this.personal.objetoMartes[i].horaInicio == "" || this.personal.objetoMartes[i].horaInicio == undefined) {
                $("#txtMartesDescansoInicio" + i + "> div:first-child").attr("style", "outline: red solid 1px !important");
                this.contDescansosRequeridos++;
            } else {
                $("#txtMartesDescansoInicio" + i + "> div:first-child").attr("style", "outline: none");
            }
            if (this.personal.objetoMartes[i].horaFin == "" || this.personal.objetoMartes[i].horaFin == undefined) {
                $("#txtMartesDescansoFin" + i + "> div:first-child").attr("style", "outline: red solid 1px !important");
                this.contDescansosRequeridos++;
            } else {
                $("#txtMartesDescansoFin" + i + "> div:first-child").attr("style", "outline: none");
            }
        }

        for (var i = 0; i < this.personal.objetoMiercoles.length; i++) {
            if (this.personal.objetoMiercoles[i].horaInicio == "" || this.personal.objetoMiercoles[i].horaInicio == undefined) {
                $("#txtMiercolesDescansoInicio" + i + "> div:first-child").attr("style", "outline: red solid 1px !important");
                this.contDescansosRequeridos++;
            } else {
                $("#txtMiercolesDescansoInicio" + i + "> div:first-child").attr("style", "outline: none");
            }
            if (this.personal.objetoMiercoles[i].horaFin == "" || this.personal.objetoMiercoles[i].horaFin == undefined) {
                $("#txtMiercolesDescansoFin" + i + "> div:first-child").attr("style", "outline: red solid 1px !important");
                this.contDescansosRequeridos++;
            } else {
                $("#txtMiercolesDescansoFin" + i + "> div:first-child").attr("style", "outline: none");
            }
        }

        for (var i = 0; i < this.personal.objetoJueves.length; i++) {
            if (this.personal.objetoJueves[i].horaInicio == "" || this.personal.objetoJueves[i].horaInicio == undefined) {
                $("#txtJuevesDescansoInicio" + i + "> div:first-child").attr("style", "outline: red solid 1px !important");
                this.contDescansosRequeridos++;
            } else {
                $("#txtJuevesDescansoInicio" + i + "> div:first-child").attr("style", "outline: none");
            }
            if (this.personal.objetoJueves[i].horaFin == "" || this.personal.objetoJueves[i].horaFin == undefined) {
                $("#txtJuevesDescansoFin" + i + "> div:first-child").attr("style", "outline: red solid 1px !important");
                this.contDescansosRequeridos++;
            } else {
                $("#txtJuevesDescansoFin" + i + "> div:first-child").attr("style", "outline: none");
            }
        }

        for (var i = 0; i < this.personal.objetoViernes.length; i++) {
            if (this.personal.objetoViernes[i].horaInicio == "" || this.personal.objetoViernes[i].horaInicio == undefined) {
                $("#txtViernesDescansoInicio" + i + "> div:first-child").attr("style", "outline: red solid 1px !important");
                this.contDescansosRequeridos++;
            } else {
                $("#txtViernesDescansoInicio" + i + "> div:first-child").attr("style", "outline: none");
            }
            if (this.personal.objetoViernes[i].horaFin == "" || this.personal.objetoViernes[i].horaFin == undefined) {
                $("#txtViernesDescansoFin" + i + "> div:first-child").attr("style", "outline: red solid 1px !important");
                this.contDescansosRequeridos++;
            } else {
                $("#txtViernesDescansoFin" + i + "> div:first-child").attr("style", "outline: none");
            }
        }

        for (var i = 0; i < this.personal.objetoSabado.length; i++) {
            if (this.personal.objetoSabado[i].horaInicio == "" || this.personal.objetoSabado[i].horaInicio == undefined) {
                $("#txtSabadoDescansoInicio" + i + "> div:first-child").attr("style", "outline: red solid 1px !important");
                this.contDescansosRequeridos++;
            } else {
                $("#txtSabadoDescansoInicio" + i + "> div:first-child").attr("style", "outline: none");
            }
            if (this.personal.objetoSabado[i].horaFin == "" || this.personal.objetoSabado[i].horaFin == undefined) {
                $("#txtSabadoDescansoFin" + i + "> div:first-child").attr("style", "outline: red solid 1px !important");
                this.contDescansosRequeridos++;
            } else {
                $("#txtSabadoDescansoFin" + i + "> div:first-child").attr("style", "outline: none");
            }
        }
        for (var i = 0; i < this.personal.objetoDomingo.length; i++) {
            if (this.personal.objetoDomingo[i].horaInicio == "" || this.personal.objetoDomingo[i].horaInicio == undefined) {
                $("#txtDomingoDescansoInicio" + i + "> div:first-child").attr("style", "outline: red solid 1px !important");
                this.contDescansosRequeridos++;
            } else {
                $("#txtDomingoDescansoInicio" + i + "> div:first-child").attr("style", "outline: none");
            }
            if (this.personal.objetoDomingo[i].horaFin == "" || this.personal.objetoDomingo[i].horaFin == undefined) {
                $("#txtDomingoDescansoFin" + i + "> div:first-child").attr("style", "outline: red solid 1px !important");
                this.contDescansosRequeridos++;
            } else {
                $("#txtDomingoDescansoFin" + i + "> div:first-child").attr("style", "outline: none");
            }
        }
    }

    validHorasRequeridas() {
        this.contHorasRequeridas = 0;
        var elem01: any = document.getElementById("txtHoraInicioLunes");
        var elem02: any = document.getElementById("txtHoraFinLunes");
        var elem03: any = document.getElementById("txtHoraInicioMartes");
        var elem04: any = document.getElementById("txtHoraFinMartes");
        var elem05: any = document.getElementById("txtHoraInicioMiercoles");
        var elem06: any = document.getElementById("txtHoraFinMiercoles");
        var elem07: any = document.getElementById("txtHoraInicioJueves");
        var elem08: any = document.getElementById("txtHoraFinJueves");
        var elem09: any = document.getElementById("txtHoraInicioViernes");
        var elem10: any = document.getElementById("txtHoraFinViernes");
        var elem11: any = document.getElementById("txtHoraInicioSabado");
        var elem12: any = document.getElementById("txtHoraFinSabado");
        var elem13: any = document.getElementById("txtHoraInicioDomingo");
        var elem14: any = document.getElementById("txtHoraFinDomingo");

        if (elem01.value == "" || elem01.value == undefined) {
            $("#txtHoraInicioLunes > div:first-child").attr("style", "outline: red solid 1px !important");
            this.contHorasRequeridas++;
        } else {
            $("#txtHoraInicioLunes> div:first-child").attr("style", "outline: none");
        }
        if (elem02.value == "" || elem02.value == undefined) {
            $("#txtHoraFinLunes> div:first-child").attr("style", "outline: red solid 1px !important");
            this.contHorasRequeridas++;
        } else {
            $("#txtHoraFinLunes> div:first-child").attr("style", "outline: none");
        }
        if (elem03.value == "" || elem03.value == undefined) {
            $("#txtHoraInicioMartes> div:first-child").attr("style", "outline: red solid 1px !important");
            this.contHorasRequeridas++;
        } else {
            $("#txtHoraInicioMartes> div:first-child").attr("style", "outline: none");
        }
        if (elem04.value == "" || elem04.value == undefined) {
            $("#txtHoraFinMartes> div:first-child").attr("style", "outline: red solid 1px !important");
            this.contHorasRequeridas++;
        } else {
            $("#txtHoraFinMartes> div:first-child").attr("style", "outline: none");
        }
        if (elem05.value == "" || elem05.value == undefined) {
            $("#txtHoraInicioMiercoles> div:first-child").attr("style", "outline: red solid 1px !important");
            this.contHorasRequeridas++;
        } else {
            $("#txtHoraInicioMiercoles> div:first-child").attr("style", "outline: none");
        }
        if (elem06.value == "" || elem06.value == undefined) {
            $("#txtHoraFinMiercoles> div:first-child").attr("style", "outline: red solid 1px !important");
            this.contHorasRequeridas++;
        } else {
            $("#txtHoraFinMiercoles> div:first-child").attr("style", "outline: none");
        }
        if (elem07.value == "" || elem07.value == undefined) {
            $("#txtHoraInicioJueves> div:first-child").attr("style", "outline: red solid 1px !important");
            this.contHorasRequeridas++;
        } else {
            $("#txtHoraInicioJueves> div:first-child").attr("style", "outline: none");
        }
        if (elem08.value == "" || elem08.value == undefined) {
            $("#txtHoraFinJueves> div:first-child").attr("style", "outline: red solid 1px !important");
            this.contHorasRequeridas++;
        } else {
            $("#txtHoraFinJueves> div:first-child").attr("style", "outline: none");
        }
        if (elem09.value == "" || elem09.value == undefined) {
            $("#txtHoraInicioViernes> div:first-child").attr("style", "outline: red solid 1px !important");
            this.contHorasRequeridas++;
        } else {
            $("#txtHoraInicioViernes> div:first-child").attr("style", "outline: none");
        }
        if (elem10.value == "" || elem10.value == undefined) {
            $("#txtHoraFinViernes> div:first-child").attr("style", "outline: red solid 1px !important");
            this.contHorasRequeridas++;
        } else {
            $("#txtHoraFinViernes> div:first-child").attr("style", "outline: none");
        }
        if (elem11.value == "" || elem11.value == undefined) {
            $("#txtHoraInicioSabado> div:first-child").attr("style", "outline: red solid 1px !important");
            this.contHorasRequeridas++;
        } else {
            $("#txtHoraInicioSabado> div:first-child").attr("style", "outline: none");
        }
        if (elem12.value == "" || elem12.value == undefined) {
            $("#txtHoraFinSabado> div:first-child").attr("style", "outline: red solid 1px !important");
            this.contHorasRequeridas++;
        } else {
            $("#txtHoraFinSabado> div:first-child").attr("style", "outline: none");
        }
        if (elem13.value == "" || elem13.value == undefined) {
            $("#txtHoraInicioDomingo> div:first-child").attr("style", "outline: red solid 1px !important");
            this.contHorasRequeridas++;
        } else {
            $("#txtHoraInicioDomingo> div:first-child").attr("style", "outline: none");
        }
        if (elem14.value == "" || elem14.value == undefined) {
            $("#txtHoraFinDomingo> div:first-child").attr("style", "outline: red solid 1px !important");
            this.contHorasRequeridas++;
        } else {
            $("#txtHoraFinDomingo> div:first-child").attr("style", "outline: none");
        }
    }

    onFocusTxt (elemento: any) {
        if (this.guardar || this.guardarDescansos) {
            switch (elemento) {
                case "txtNombre":
                    if (this.validNombre || this.validNombre == undefined) {
                        $("#" + elemento).removeClass('errorCampo');
                    }
                    break;
                case "txtEmail":
                    if (this.validEmail || this.validEmail == undefined) {
                        $("#" + elemento).removeClass('errorCampo');
                    }
                    break;
                case "txtTelefono":
                    if (this.validTelefono || this.validTelefono == undefined) {
                        $("#" + elemento).removeClass('errorCampo');
                    }
                    break;
                case "txtHoraInicioLunes":
                    if (this.validLunes || this.validLunes == undefined) {
                        $("#" + elemento).removeClass('errorCampo');
                    }
                    break;
                case "txtHoraFinLunes":
                    if (this.validLunes || this.validLunes == undefined) {
                        $("#" + elemento + "> div:first-child").attr("style", "outline:  none");
                    }
                    break;
                case "txtHoraInicioMartes":
                    if (this.validMartes || this.validMartes == undefined) {
                        $("#" + elemento + "> div:first-child").attr("style", "outline:  none");
                    }
                    break;
                case "txtHoraFinMartes":
                    if (this.validMartes || this.validMartes == undefined) {
                        $("#" + elemento + "> div:first-child").attr("style", "outline:  none");
                    }
                    break;
                case "txtHoraInicioMiercoles":
                    if (this.validMiercoles || this.validMiercoles == undefined) {
                        $("#" + elemento + "> div:first-child").attr("style", "outline:  none");
                    }
                    break;
                case "txtHoraFinMiercoles":
                    if (this.validMiercoles || this.validMiercoles == undefined) {
                        $("#" + elemento + "> div:first-child").attr("style", "outline:  none");
                    }
                    break;
                case "txtHoraInicioJueves":
                    if (this.validJueves || this.validJueves == undefined) {
                        $("#" + elemento + "> div:first-child").attr("style", "outline:  none");
                    }
                    break;
                case "txtHoraFinJueves":
                    if (this.validJueves || this.validJueves == undefined) {
                        $("#" + elemento + "> div:first-child").attr("style", "outline:  none");
                    }
                    break;
                case "txtHoraInicioViernes ":
                    if (this.validViernes || this.validViernes == undefined) {
                        $("#" + elemento + "> div:first-child").attr("style", "outline:  none");
                    }
                    break;
                case "txtHoraFinViernes ":
                    if (this.validViernes || this.validViernes == undefined) {
                        $("#" + elemento + "> div:first-child").attr("style", "outline:  none");
                    }
                    break;
                case "txtHoraInicioSabado ":
                    if (this.validSabado || this.validSabado == undefined) {
                        $("#" + elemento + "> div:first-child").attr("style", "outline:  none");
                    }
                    break;
                case "txtHoraFinSabado ":
                    if (this.validSabado || this.validSabado == undefined) {
                        $("#" + elemento + "> div:first-child").attr("style", "outline:  none");
                    }
                    break;
                case "txtHoraInicioDomingo ":
                    if (this.validDomingo || this.validDomingo == undefined) {
                        $("#" + elemento + "> div:first-child").attr("style", "outline:  none");
                    }
                    break;
                case "txtHoraFinDomingo ":
                    if (this.validDomingo || this.validDomingo == undefined) {
                        $("#" + elemento + "> div:first-child").attr("style", "outline:  none");
                    }
                    break;
                case "txtLunesDescansoInicio0":
                    if (this.personal.validFormatDescansosLunes[0] || this.personal.validFormatDescansosLunes[0] == undefined) {
                        if (this.personal.validRangosDescansosLunes[0] || this.personal.validRangosDescansosLunes[0] == undefined) {
                            if (this.personal.validDescansosEnLunes[0] || this.personal.validDescansosEnLunes[0] == undefined) {
                                $("#" + elemento + "> div:first-child").attr("style", "outline:  none");
                            }
                        }
                    }
                    break;
                case "txtLunesDescansoFin0":
                    if (this.personal.validFormatDescansosLunes[0] || this.personal.validFormatDescansosLunes[0] == undefined) {
                        if (this.personal.validRangosDescansosLunes[0] || this.personal.validRangosDescansosLunes[0] == undefined) {
                            if (this.personal.validDescansosEnLunes[0] || this.personal.validDescansosEnLunes[0] == undefined) {
                                $("#" + elemento + "> div:first-child").attr("style", "outline:  none");
                            }
                        }
                    }
                    break;
                case "txtLunesDescansoInicio1":
                    if (this.personal.validFormatDescansosLunes[1] || this.personal.validFormatDescansosLunes[1] == undefined) {
                        if (this.personal.validRangosDescansosLunes[1] || this.personal.validRangosDescansosLunes[1] == undefined) {
                            if (this.personal.validDescansosEnLunes[1] || this.personal.validDescansosEnLunes[1] == undefined) {
                                if (!this.validEmpalmeLunes[1] || this.validEmpalmeLunes[1] == undefined) {
                                    $("#" + elemento + "> div:first-child").attr("style", "outline:  none");
                                }
                            }
                        }
                    }
                    break;
                case "txtLunesDescansoFin1":
                    if (this.personal.validFormatDescansosLunes[1] || this.personal.validFormatDescansosLunes[1] == undefined) {
                        if (this.personal.validRangosDescansosLunes[1] || this.personal.validRangosDescansosLunes[1] == undefined) {
                            if (this.personal.validDescansosEnLunes[1] || this.personal.validDescansosEnLunes[1] == undefined) {
                                if (!this.validEmpalmeLunes[1] || this.validEmpalmeLunes[1] == undefined) {
                                    $("#" + elemento + "> div:first-child").attr("style", "outline:  none");
                                }
                            }
                        }
                    }
                    break;
                case "txtLunesDescansoInicio2":
                    if (this.personal.validFormatDescansosLunes[2] || this.personal.validFormatDescansosLunes[2] == undefined) {
                        if (this.personal.validRangosDescansosLunes[2] || this.personal.validRangosDescansosLunes[2] == undefined) {
                            if (this.personal.validDescansosEnLunes[2] || this.personal.validDescansosEnLunes[2] == undefined) {
                                if (!this.validEmpalmeLunes[2] || this.validEmpalmeLunes[2] == undefined) {
                                    $("#" + elemento + "> div:first-child").attr("style", "outline:  none");
                                }
                            }
                        }
                    }
                    break;
                case "txtLunesDescansoFin2":
                    if (this.personal.validFormatDescansosLunes[2] || this.personal.validFormatDescansosLunes[2] == undefined) {
                        if (this.personal.validRangosDescansosLunes[2] || this.personal.validRangosDescansosLunes[2] == undefined) {
                            if (this.personal.validDescansosEnLunes[2] || this.personal.validDescansosEnLunes[2] == undefined) {
                                if (!this.validEmpalmeLunes[2] || this.validEmpalmeLunes[2] == undefined) {
                                    $("#" + elemento + "> div:first-child").attr("style", "outline:  none");
                                }
                            }
                        }
                    }
                    break;
                case "txtMartesDescansoInicio0":
                    if (this.personal.validFormatDescansosMartes[0] || this.personal.validFormatDescansosMartes[0] == undefined) {
                        if (this.personal.validRangosDescansosMartes[0] || this.personal.validRangosDescansosMartes[0] == undefined) {
                            if (this.personal.validDescansosEnMartes[0] || this.personal.validDescansosEnMartes[0] == undefined) {
                                $("#" + elemento + "> div:first-child").attr("style", "outline:  none");
                            }
                        }
                    }
                    break;
                case "txtMartesDescansoFin0":
                    if (this.personal.validFormatDescansosMartes[0] || this.personal.validFormatDescansosMartes[0] == undefined) {
                        if (this.personal.validRangosDescansosMartes[0] || this.personal.validRangosDescansosMartes[0] == undefined) {
                            if (this.personal.validDescansosEnMartes[0] || this.personal.validDescansosEnMartes[0] == undefined) {
                                $("#" + elemento + "> div:first-child").attr("style", "outline:  none");
                            }
                        }
                    }
                    break;
                case "txtMartesDescansoInicio1":
                    if (this.personal.validFormatDescansosMartes[1] || this.personal.validFormatDescansosMartes[1] == undefined) {
                        if (this.personal.validRangosDescansosMartes[1] || this.personal.validRangosDescansosMartes[1] == undefined) {
                            if (this.personal.validDescansosEnMartes[1] || this.personal.validDescansosEnMartes[1] == undefined) {
                                if (!this.validEmpalmeMartes[1] || this.validEmpalmeMartes[1] == undefined) {
                                    $("#" + elemento + "> div:first-child").attr("style", "outline:  none");
                                }
                            }
                        }
                    }
                    break;
                case "txtMartesDescansoFin1":
                    if (this.personal.validFormatDescansosMartes[1] || this.personal.validFormatDescansosMartes[1] == undefined) {
                        if (this.personal.validRangosDescansosMartes[1] || this.personal.validRangosDescansosMartes[1] == undefined) {
                            if (this.personal.validDescansosEnMartes[1] || this.personal.validDescansosEnMartes[1] == undefined) {
                                if (!this.validEmpalmeMartes[1] || this.validEmpalmeMartes[1] == undefined) {
                                    $("#" + elemento + "> div:first-child").attr("style", "outline:  none");
                                }
                            }
                        }
                    }
                    break;
                case "txtMartesDescansoInicio2":
                    if (this.personal.validFormatDescansosMartes[2] || this.personal.validFormatDescansosMartes[2] == undefined) {
                        if (this.personal.validRangosDescansosMartes[2] || this.personal.validRangosDescansosMartes[2] == undefined) {
                            if (this.personal.validDescansosEnMartes[2] || this.personal.validDescansosEnMartes[2] == undefined) {
                                if (!this.validEmpalmeMartes[2] || this.validEmpalmeMartes[2] == undefined) {
                                    $("#" + elemento + "> div:first-child").attr("style", "outline:  none");
                                }
                            }
                        }
                    }
                    break;
                case "txtMartesDescansoFin2":
                    if (this.personal.validFormatDescansosMartes[2] || this.personal.validFormatDescansosMartes[2] == undefined) {
                        if (this.personal.validRangosDescansosMartes[2] || this.personal.validRangosDescansosMartes[2] == undefined) {
                            if (this.personal.validDescansosEnMartes[2] || this.personal.validDescansosEnMartes[2] == undefined) {
                                if (!this.validEmpalmeMartes[2] || this.validEmpalmeMartes[2] == undefined) {
                                    $("#" + elemento + "> div:first-child").attr("style", "outline:  none");
                                }
                            }
                        }
                    }
                    break;
                case "txtMiercolesDescansoInicio0":
                    if (this.personal.validFormatDescansosMiercoles[0] || this.personal.validFormatDescansosMiercoles[0] == undefined) {
                        if (this.personal.validRangosDescansosMiercoles[0] || this.personal.validRangosDescansosMiercoles[0] == undefined) {
                            if (this.personal.validDescansosEnMiercoles[0] || this.personal.validDescansosEnMiercoles[0] == undefined) {
                                $("#" + elemento + "> div:first-child").attr("style", "outline:  none");
                            }
                        }
                    }
                    break;
                case "txtMiercolesDescansoFin0":
                    if (this.personal.validFormatDescansosMiercoles[0] || this.personal.validFormatDescansosMiercoles[0] == undefined) {
                        if (this.personal.validRangosDescansosMiercoles[0] || this.personal.validRangosDescansosMiercoles[0] == undefined) {
                            if (this.personal.validDescansosEnMiercoles[0] || this.personal.validDescansosEnMiercoles[0] == undefined) {
                                $("#" + elemento + "> div:first-child").attr("style", "outline:  none");
                            }
                        }
                    }
                    break;
                case "txtMiercolesDescansoInicio1":
                    if (this.personal.validFormatDescansosMiercoles[1] || this.personal.validFormatDescansosMiercoles[1] == undefined) {
                        if (this.personal.validRangosDescansosMiercoles[1] || this.personal.validRangosDescansosMiercoles[1] == undefined) {
                            if (this.personal.validDescansosEnMiercoles[1] || this.personal.validDescansosEnMiercoles[1] == undefined) {
                                if (!this.validEmpalmeMiercoles[1] || this.validEmpalmeMiercoles[1] == undefined) {
                                    $("#" + elemento + "> div:first-child").attr("style", "outline:  none");
                                }
                            }
                        }
                    }
                    break;
                case "txtMiercolesDescansoFin1":
                    if (this.personal.validFormatDescansosMiercoles[1] || this.personal.validFormatDescansosMiercoles[1] == undefined) {
                        if (this.personal.validRangosDescansosMiercoles[1] || this.personal.validRangosDescansosMiercoles[1] == undefined) {
                            if (this.personal.validDescansosEnMiercoles[1] || this.personal.validDescansosEnMiercoles[1] == undefined) {
                                if (!this.validEmpalmeMiercoles[1] || this.validEmpalmeMiercoles[1] == undefined) {
                                    $("#" + elemento + "> div:first-child").attr("style", "outline:  none");
                                }
                            }
                        }
                    }
                    break;
                case "txtMiercolesDescansoInicio2":
                    if (this.personal.validFormatDescansosMiercoles[2] || this.personal.validFormatDescansosMiercoles[2] == undefined) {
                        if (this.personal.validRangosDescansosMiercoles[2] || this.personal.validRangosDescansosMiercoles[2] == undefined) {
                            if (this.personal.validDescansosEnMiercoles[2] || this.personal.validDescansosEnMiercoles[2] == undefined) {
                                if (!this.validEmpalmeMiercoles[2] || this.validEmpalmeMiercoles[2] == undefined) {
                                    $("#" + elemento + "> div:first-child").attr("style", "outline:  none");
                                }
                            }
                        }
                    }
                    break;
                case "txtMiercolesDescansoFin2":
                    if (this.personal.validFormatDescansosMiercoles[2] || this.personal.validFormatDescansosMiercoles[2] == undefined) {
                        if (this.personal.validRangosDescansosMiercoles[2] || this.personal.validRangosDescansosMiercoles[2] == undefined) {
                            if (this.personal.validDescansosEnMiercoles[2] || this.personal.validDescansosEnMiercoles[2] == undefined) {
                                if (!this.validEmpalmeMiercoles[2] || this.validEmpalmeMiercoles[2] == undefined) {
                                    $("#" + elemento + "> div:first-child").attr("style", "outline:  none");
                                }
                            }
                        }
                    }
                    break;
                case "txtJuevesDescansoInicio0":
                    if (this.personal.validFormatDescansosJueves[0] || this.personal.validFormatDescansosJueves[0] == undefined) {
                        if (this.personal.validRangosDescansosJueves[0] || this.personal.validRangosDescansosJueves[0] == undefined) {
                            if (this.personal.validDescansosEnJueves[0] || this.personal.validDescansosEnJueves[0] == undefined) {
                                $("#" + elemento + "> div:first-child").attr("style", "outline:  none");
                            }
                        }
                    }
                    break;
                case "txtJuevesDescansoFin0":
                    if (this.personal.validFormatDescansosJueves[0] || this.personal.validFormatDescansosJueves[0] == undefined) {
                        if (this.personal.validRangosDescansosJueves[0] || this.personal.validRangosDescansosJueves[0] == undefined) {
                            if (this.personal.validDescansosEnJueves[0] || this.personal.validDescansosEnJueves[0] == undefined) {
                                $("#" + elemento + "> div:first-child").attr("style", "outline:  none");
                            }
                        }
                    }
                    break;
                case "txtJuevesDescansoInicio1":
                    if (this.personal.validFormatDescansosJueves[1] || this.personal.validFormatDescansosJueves[1] == undefined) {
                        if (this.personal.validRangosDescansosJueves[1] || this.personal.validRangosDescansosJueves[1] == undefined) {
                            if (this.personal.validDescansosEnJueves[1] || this.personal.validDescansosEnJueves[1] == undefined) {
                                if (!this.validEmpalmeJueves[1] || this.validEmpalmeJueves[1] == undefined) {
                                    $("#" + elemento + "> div:first-child").attr("style", "outline:  none");
                                }
                            }
                        }
                    }
                    break;
                case "txtJuevesDescansoFin1":
                    if (this.personal.validFormatDescansosJueves[1] || this.personal.validFormatDescansosJueves[1] == undefined) {
                        if (this.personal.validRangosDescansosJueves[1] || this.personal.validRangosDescansosJueves[1] == undefined) {
                            if (this.personal.validDescansosEnJueves[1] || this.personal.validDescansosEnJueves[1] == undefined) {
                                if (!this.validEmpalmeJueves[1] || this.validEmpalmeJueves[1] == undefined) {
                                    $("#" + elemento + "> div:first-child").attr("style", "outline:  none");
                                }
                            }
                        }
                    }
                    break;
                case "txtJuevesDescansoInicio2":
                    if (this.personal.validFormatDescansosJueves[2] || this.personal.validFormatDescansosJueves[2] == undefined) {
                        if (this.personal.validRangosDescansosJueves[2] || this.personal.validRangosDescansosJueves[2] == undefined) {
                            if (this.personal.validDescansosEnJueves[2] || this.personal.validDescansosEnJueves[2] == undefined) {
                                if (!this.validEmpalmeJueves[2] || this.validEmpalmeJueves[2] == undefined) {
                                    $("#" + elemento + "> div:first-child").attr("style", "outline:  none");
                                }
                            }
                        }
                    }
                    break;
                case "txtJuevesDescansoFin2":
                    if (this.personal.validFormatDescansosJueves[2] || this.personal.validFormatDescansosJueves[2] == undefined) {
                        if (this.personal.validRangosDescansosJueves[2] || this.personal.validRangosDescansosJueves[2] == undefined) {
                            if (this.personal.validDescansosEnJueves[2] || this.personal.validDescansosEnJueves[2] == undefined) {
                                if (!this.validEmpalmeJueves[2] || this.validEmpalmeJueves[2] == undefined) {
                                    $("#" + elemento + "> div:first-child").attr("style", "outline:  none");
                                }
                            }
                        }
                    }
                    break;
                case "txtViernesDescansoInicio0":
                    if (this.personal.validFormatDescansosViernes[0] || this.personal.validFormatDescansosViernes[0] == undefined) {
                        if (this.personal.validRangosDescansosViernes[0] || this.personal.validRangosDescansosViernes[0] == undefined) {
                            if (this.personal.validDescansosEnViernes[0] || this.personal.validDescansosEnViernes[0] == undefined) {
                                $("#" + elemento + "> div:first-child").attr("style", "outline:  none");
                            }
                        }
                    }
                    break;
                case "txtViernesDescansoFin0":
                    if (this.personal.validFormatDescansosViernes[0] || this.personal.validFormatDescansosViernes[0] == undefined) {
                        if (this.personal.validRangosDescansosViernes[0] || this.personal.validRangosDescansosViernes[0] == undefined) {
                            if (this.personal.validDescansosEnViernes[0] || this.personal.validDescansosEnViernes[0] == undefined) {
                                $("#" + elemento + "> div:first-child").attr("style", "outline:  none");
                            }
                        }
                    }
                    break;
                case "txtViernesDescansoInicio1":
                    if (this.personal.validFormatDescansosViernes[1] || this.personal.validFormatDescansosViernes[1] == undefined) {
                        if (this.personal.validRangosDescansosViernes[1] || this.personal.validRangosDescansosViernes[1] == undefined) {
                            if (this.personal.validDescansosEnViernes[1] || this.personal.validDescansosEnViernes[1] == undefined) {
                                if (!this.validEmpalmeViernes[1] || this.validEmpalmeViernes[1] == undefined) {
                                    $("#" + elemento + "> div:first-child").attr("style", "outline:  none");
                                }
                            }
                        }
                    }
                    break;
                case "txtViernesDescansoFin1":
                    if (this.personal.validFormatDescansosViernes[1] || this.personal.validFormatDescansosViernes[1] == undefined) {
                        if (this.personal.validRangosDescansosViernes[1] || this.personal.validRangosDescansosViernes[1] == undefined) {
                            if (this.personal.validDescansosEnViernes[1] || this.personal.validDescansosEnViernes[1] == undefined) {
                                if (!this.validEmpalmeViernes[1] || this.validEmpalmeViernes[1] == undefined) {
                                    $("#" + elemento + "> div:first-child").attr("style", "outline:  none");
                                }
                            }
                        }
                    }
                    break;
                case "txtViernesDescansoInicio2":
                    if (this.personal.validFormatDescansosViernes[2] || this.personal.validFormatDescansosViernes[2] == undefined) {
                        if (this.personal.validRangosDescansosViernes[2] || this.personal.validRangosDescansosViernes[2] == undefined) {
                            if (this.personal.validDescansosEnViernes[2] || this.personal.validDescansosEnViernes[2] == undefined) {
                                if (!this.validEmpalmeViernes[2] || this.validEmpalmeViernes[2] == undefined) {
                                    $("#" + elemento + "> div:first-child").attr("style", "outline:  none");
                                }
                            }
                        }
                    }
                    break;
                case "txtViernesDescansoFin2":
                    if (this.personal.validFormatDescansosViernes[2] || this.personal.validFormatDescansosViernes[2] == undefined) {
                        if (this.personal.validRangosDescansosViernes[2] || this.personal.validRangosDescansosViernes[2] == undefined) {
                            if (this.personal.validDescansosEnViernes[2] || this.personal.validDescansosEnViernes[2] == undefined) {
                                if (!this.validEmpalmeViernes[2] || this.validEmpalmeViernes[2] == undefined) {
                                    $("#" + elemento + "> div:first-child").attr("style", "outline:  none");
                                }
                            }
                        }
                    }
                    break;
                case "txtSabadoDescansoInicio0":
                    if (this.personal.validFormatDescansosSabado[0] || this.personal.validFormatDescansosSabado[0] == undefined) {
                        if (this.personal.validRangosDescansosSabado[0] || this.personal.validRangosDescansosSabado[0] == undefined) {
                            if (this.personal.validDescansosEnSabado[0] || this.personal.validDescansosEnSabado[0] == undefined) {
                                $("#" + elemento + "> div:first-child").attr("style", "outline:  none");
                            }
                        }
                    }
                    break;
                case "txtSabadoDescansoFin0":
                    if (this.personal.validFormatDescansosSabado[0] || this.personal.validFormatDescansosSabado[0] == undefined) {
                        if (this.personal.validRangosDescansosSabado[0] || this.personal.validRangosDescansosSabado[0] == undefined) {
                            if (this.personal.validDescansosEnSabado[0] || this.personal.validDescansosEnSabado[0] == undefined) {
                                $("#" + elemento + "> div:first-child").attr("style", "outline:  none");
                            }
                        }
                    }
                    break;
                case "txtSabadoDescansoInicio1":
                    if (this.personal.validFormatDescansosSabado[1] || this.personal.validFormatDescansosSabado[1] == undefined) {
                        if (this.personal.validRangosDescansosSabado[1] || this.personal.validRangosDescansosSabado[1] == undefined) {
                            if (this.personal.validDescansosEnSabado[1] || this.personal.validDescansosEnSabado[1] == undefined) {
                                if (!this.validEmpalmeSabado[1] || this.validEmpalmeSabado[1] == undefined) {
                                    $("#" + elemento + "> div:first-child").attr("style", "outline:  none");
                                }
                            }
                        }
                    }
                    break;
                case "txtSabadoDescansoFin1":
                    if (this.personal.validFormatDescansosSabado[1] || this.personal.validFormatDescansosSabado[1] == undefined) {
                        if (this.personal.validRangosDescansosSabado[1] || this.personal.validRangosDescansosSabado[1] == undefined) {
                            if (this.personal.validDescansosEnSabado[1] || this.personal.validDescansosEnSabado[1] == undefined) {
                                if (!this.validEmpalmeSabado[1] || this.validEmpalmeSabado[1] == undefined) {
                                    $("#" + elemento + "> div:first-child").attr("style", "outline:  none");
                                }
                            }
                        }
                    }
                    break;
                case "txtSabadoDescansoInicio2":
                    if (this.personal.validFormatDescansosSabado[2] || this.personal.validFormatDescansosSabado[2] == undefined) {
                        if (this.personal.validRangosDescansosSabado[2] || this.personal.validRangosDescansosSabado[2] == undefined) {
                            if (this.personal.validDescansosEnSabado[2] || this.personal.validDescansosEnSabado[2] == undefined) {
                                if (!this.validEmpalmeSabado[2] || this.validEmpalmeSabado[2] == undefined) {
                                    $("#" + elemento + "> div:first-child").attr("style", "outline:  none");
                                }
                            }
                        }
                    }
                    break;
                case "txtSabadoDescansoFin2":
                    if (this.personal.validFormatDescansosSabado[2] || this.personal.validFormatDescansosSabado[2] == undefined) {
                        if (this.personal.validRangosDescansosSabado[2] || this.personal.validRangosDescansosSabado[2] == undefined) {
                            if (this.personal.validDescansosEnSabado[2] || this.personal.validDescansosEnSabado[2] == undefined) {
                                if (!this.validEmpalmeSabado[2] || this.validEmpalmeSabado[2] == undefined) {
                                    $("#" + elemento + "> div:first-child").attr("style", "outline:  none");
                                }
                            }
                        }
                    }
                    break;
                case "txtDomingoDescansoInicio0":
                    if (this.personal.validFormatDescansosDomingo[0] || this.personal.validFormatDescansosDomingo[0] == undefined) {
                        if (this.personal.validRangosDescansosDomingo[0] || this.personal.validRangosDescansosDomingo[0] == undefined) {
                            if (this.personal.validDescansosEnDomingo[0] || this.personal.validDescansosEnDomingo[0] == undefined) {
                                $("#" + elemento + "> div:first-child").attr("style", "outline:  none");
                            }
                        }
                    }
                    break;
                case "txtDomingoDescansoFin0":
                    if (this.personal.validFormatDescansosDomingo[0] || this.personal.validFormatDescansosDomingo[0] == undefined) {
                        if (this.personal.validRangosDescansosDomingo[0] || this.personal.validRangosDescansosDomingo[0] == undefined) {
                            if (this.personal.validDescansosEnDomingo[0] || this.personal.validDescansosEnDomingo[0] == undefined) {
                                $("#" + elemento + "> div:first-child").attr("style", "outline:  none");
                            }
                        }
                    }
                    break;
                case "txtDomingoDescansoInicio1":
                    if (this.personal.validFormatDescansosDomingo[1] || this.personal.validFormatDescansosDomingo[1] == undefined) {
                        if (this.personal.validRangosDescansosDomingo[1] || this.personal.validRangosDescansosDomingo[1] == undefined) {
                            if (this.personal.validDescansosEnDomingo[1] || this.personal.validDescansosEnDomingo[1] == undefined) {
                                if (!this.validEmpalmeDomingo[1] || this.validEmpalmeDomingo[1] == undefined) {
                                    $("#" + elemento + "> div:first-child").attr("style", "outline:  none");
                                }
                            }
                        }
                    }
                    break;
                case "txtDomingoDescansoFin1":
                    if (this.personal.validFormatDescansosDomingo[1] || this.personal.validFormatDescansosDomingo[1] == undefined) {
                        if (this.personal.validRangosDescansosDomingo[1] || this.personal.validRangosDescansosDomingo[1] == undefined) {
                            if (this.personal.validDescansosEnDomingo[1] || this.personal.validDescansosEnDomingo[1] == undefined) {
                                if (!this.validEmpalmeDomingo[1] || this.validEmpalmeDomingo[1] == undefined) {
                                    $("#" + elemento + "> div:first-child").attr("style", "outline:  none");
                                }
                            }
                        }
                    }
                    break;
                case "txtDomingoDescansoInicio2":
                    if (this.personal.validFormatDescansosDomingo[2] || this.personal.validFormatDescansosDomingo[2] == undefined) {
                        if (this.personal.validRangosDescansosDomingo[2] || this.personal.validRangosDescansosDomingo[2] == undefined) {
                            if (this.personal.validDescansosEnDomingo[2] || this.personal.validDescansosEnDomingo[2] == undefined) {
                                if (!this.validEmpalmeDomingo[2] || this.validEmpalmeDomingo[2] == undefined) {
                                    $("#" + elemento + "> div:first-child").attr("style", "outline:  none");
                                }
                            }
                        }
                    }
                    break;
                case "txtDomingoDescansoFin2":
                    if (this.personal.validFormatDescansosDomingo[2] || this.personal.validFormatDescansosDomingo[2] == undefined) {
                        if (this.personal.validRangosDescansosDomingo[2] || this.personal.validRangosDescansosDomingo[2] == undefined) {
                            if (this.personal.validDescansosEnDomingo[2] || this.personal.validDescansosEnDomingo[2] == undefined) {
                                if (!this.validEmpalmeDomingo[2] || this.validEmpalmeDomingo[2] == undefined) {
                                    $("#" + elemento + "> div:first-child").attr("style", "outline:  none");
                                }
                            }
                        }
                    }
                    break;
                default:
                    $("#" + elemento).removeClass('errorCampo');
                    break;
            }
        }
    }

    validarHorariosParaDescansos () {
        this.validarRangoHoras();
        if (this.validLunes && this.validMartes && this.validMiercoles && this.validJueves && this.validViernes && this.validSabado && this.validDomingo) {
            if (this.personal.lunes || this.personal.martes || this.personal.miercoles || this.personal.jueves || this.personal.viernes || this.personal.sabado || this.personal.domingo) {
                $("#aDescansos").css('pointer-events', '');
            } else {
                $("#aDescansos").css('pointer-events', 'none');
            }
        } else {
            $("#aDescansos").css('pointer-events', 'none');
        }
    }
            
    //--------------------------------Funcion Validar Horario Citas Personal ---------------------------
    validarRangoHorasCitasPersonalf(){
        var validaRangosCita = true;
        this.validarRangoHorasCita();
    }

    validarRangoHorasCita(){
        this.validRangosCita = true;
        var params: any = {};
        if (this.personal.lunes == false) {
            params.horaInicio = '00:00';
            params.horaFin = '00:00';
            params.dia = 2;
            params.idPersonal = this.personal.idPersonal;
        } else {
            params.horaInicio = this.personal.horaInicioLunes;
            params.horaFin = this.personal.horaFinLunes;
            params.dia = 2;
            params.idPersonal = this.personal.idPersonal;
        }

        this._backService.HttpPost("catalogos/personal/ConsultarHorarioPersonal", {}, params).subscribe((response: string) => {
            var validacionHorario = eval(response);
            $("#txtHoraFinLunes> div:first-child").attr("style", "outline: none");
            $("#txtHoraInicioLunes> div:first-child").attr("style", "outline: none");
            switch (validacionHorario[0].msgError) {
                //Estos son los diferentes resultados que te puede regresar la función de actualizar el Horario de Personal
                case -1:
                    this._toaster.error("Personal Tiene Descanso");
                    this.validarRangoHorasCitasPersonal = false;
                    this.validRangosCita = false;
                    $("#txtHoraInicioLunes > div:first-child").attr("style", "outline: red solid 1px !important");
                    $("#txtHoraFinLunes> div:first-child").attr("style", "outline: red solid 1px !important");
                    break;
                case -2:
                    this._toaster.error('Favor de re-programar citas del personal, antes de cambiar su horario');
                    
                    this.validarRangoHorasCitasPersonal = false;
                    this.validRangosCita = false;
                    $("#txtHoraInicioLunes > div:first-child").attr("style", "outline: red solid 1px !important");
                    $("#txtHoraFinLunes> div:first-child").attr("style", "outline: red solid 1px !important");
                    break;                   
            }
            
            var params: any = {};
            if (this.personal.martes == false) {
                params.horaInicio = '00:00';
                params.horaFin = '00:00';
                params.dia = 3;
                params.idPersonal = this.personal.idPersonal;
            } else {
                params.horaInicio = this.personal.horaInicioMartes;
                params.horaFin = this.personal.horaFinMartes;
                params.dia = 3;
                params.idPersonal = this.personal.idPersonal;
            }
            this._backService.HttpPost("catalogos/personal/ConsultarHorarioPersonal", {}, params).subscribe((response: string) => {
                $("#txtHoraFinMartes> div:first-child").attr("style", "outline: none");
                $("#txtHoraInicioMartes> div:first-child").attr("style", "outline: none");

                var validacionHorario = eval(response);
                switch (validacionHorario[0].msgError) {
                    //Estos son los diferentes resultados que te puede regresar la función de actualizar el Horario de Personal
                    case -1:
                        this._toaster.error("Personal Tiene Descanso");
                        this.validarRangoHorasCitasPersonal = false;
                        this.validRangosCita = false;
                        $("#txtHoraInicioMartes> div:first-child").attr("style", "outline: red solid 1px !important");
                        $("#txtHoraFinMartes> div:first-child").attr("style", "outline: red solid 1px !important");
                        break;
                    case -2:
                        this._toaster.error('Favor de re-programar citas del personal, antes de cambiar su horario');
                        this.validarRangoHorasCitasPersonal = false;
                        this.validRangosCita = false;
                        $("#txtHoraInicioMartes> div:first-child").attr("style", "outline: red solid 1px !important");
                        $("#txtHoraFinMartes> div:first-child").attr("style", "outline: red solid 1px !important");
                        break;
                }

                var params: any = {};
                if (this.personal.miercoles == false) {
                    params.horaInicio = '00:00';
                    params.horaFin = '00:00';
                    params.dia = 4;
                    params.idPersonal = this.personal.idPersonal;
                } else {
                    params.horaInicio = this.personal.horaInicioMiercoles;
                    params.horaFin = this.personal.horaFinMiercoles;
                    params.dia = 4;
                    params.idPersonal = this.personal.idPersonal;
                }

                this._backService.HttpPost("catalogos/personal/ConsultarHorarioPersonal", {}, params).subscribe((response: string) => {
                    $("#txtHoraFinMiercoles> div:first-child").attr("style", "outline: none");
                    $("#txtHoraInicioMiercoles> div:first-child").attr("style", "outline: none");
                    var validacionHorario = eval(response);
                    switch (validacionHorario[0].msgError) {
                        //Estos son los diferentes resultados que te puede regresar la función de actualizar el Horario de Personal
                        case -1:
                            this._toaster.error("Personal Tiene Descanso");
                            this.validarRangoHorasCitasPersonal = false;
                            this.validRangosCita = false;
                            $("#txtHoraInicioMiercoles> div:first-child").attr("style", "outline: red solid 1px !important");
                            $("#txtHoraFinMiercoles> div:first-child").attr("style", "outline: red solid 1px !important");
                            break;
                        case -2:
                            this._toaster.error('Favor de re-programar citas del personal, antes de cambiar su horario');
                            this.validarRangoHorasCitasPersonal = false;
                            this.validRangosCita = false;
                            $("#txtHoraInicioMiercoles> div:first-child").attr("style", "outline: red solid 1px !important");
                            $("#txtHoraFinMiercoles> div:first-child").attr("style", "outline: red solid 1px !important");
                            break;
                    }

                    var params: any = {};
                    if (this.personal.jueves == false) {
                        params.horaInicio = '00:00';
                        params.horaFin = '00:00';
                        params.dia = 5;
                        params.idPersonal = this.personal.idPersonal;
                    } else {
                        params.horaInicio = this.personal.horaInicioJueves;
                        params.horaFin = this.personal.horaFinJueves;
                        params.dia = 5;
                        params.idPersonal = this.personal.idPersonal;
                    }

                    this._backService.HttpPost("catalogos/personal/ConsultarHorarioPersonal", {}, params).subscribe((response: string) => {
                        $("#txtHoraFinJueves> div:first-child").attr("style", "outline: none");
                        $("#txtHoraInicioJueves> div:first-child").attr("style", "outline: none");
                        var validacionHorario = eval(response);

                        switch (validacionHorario[0].msgError) {
                            //Estos son los diferentes resultados que te puede regresar la función de actualizar el Horario de Personal
                            case -1:
                                this._toaster.error("Personal Tiene Descanso");
                                this.validarRangoHorasCitasPersonal = false;
                                this.validRangosCita = false;
                                $("#txtHoraInicioJueves> div:first-child").attr("style", "outline: red solid 1px !important");
                                $("#txtHoraFinJueves> div:first-child").attr("style", "outline: red solid 1px !important");
                                break;
                            case -2:
                                this._toaster.error('Favor de re-programar citas del personal, antes de cambiar su horario');

                                this.validarRangoHorasCitasPersonal = false;
                                this.validRangosCita = false;
                                $("#txtHoraInicioJueves> div:first-child").attr("style", "outline: red solid 1px !important");
                                $("#txtHoraFinJueves> div:first-child").attr("style", "outline: red solid 1px !important");
                                break;
                        }

                        var params: any = {};
                        if (this.personal.viernes == false) {
                            params.horaInicio = '00:00';
                            params.horaFin = '00:00';
                            params.dia = 6;
                            params.idPersonal = this.personal.idPersonal;
                        } else {
                            params.horaInicio = this.personal.horaInicioViernes;
                            params.horaFin = this.personal.horaFinViernes;
                            params.dia = 6;
                            params.idPersonal = this.personal.idPersonal;
                        }

                        this._backService.HttpPost("catalogos/personal/ConsultarHorarioPersonal", {}, params).subscribe((response: string) => {
                            $("#txtHoraFinViernes> div:first-child").attr("style", "outline: none");
                            $("#txtHoraInicioViernes> div:first-child").attr("style", "outline: none");

                            var validacionHorario = eval(response);
                            switch (validacionHorario[0].msgError) {
                                //Estos son los diferentes resultados que te puede regresar la función de actualizar el Horario de Personal
                                case -1:
                                    this._toaster.error("Personal Tiene Descanso");
                                    this.validarRangoHorasCitasPersonal = false;
                                    this.validRangosCita = false;
                                    $("#txtHoraInicioViernes> div:first-child").attr("style", "outline: red solid 1px !important");
                                    $("#txtHoraFinViernes> div:first-child").attr("style", "outline: red solid 1px !important");                           
                                    break;
                                case -2:
                                    this._toaster.error('Favor de re-programar citas del personal, antes de cambiar su horario');

                                    this.validarRangoHorasCitasPersonal = false;
                                    this.validRangosCita = false;
                                    $("#txtHoraInicioViernes> div:first-child").attr("style", "outline: red solid 1px !important");
                                    $("#txtHoraFinViernes> div:first-child").attr("style", "outline: red solid 1px !important");
                                    break;
                            }

                            var params: any = {};
                            if (this.personal.sabado == false) {
                                params.horaInicio = '00:00';
                                params.horaFin = '00:00';
                                params.dia = 7;
                                params.idPersonal = this.personal.idPersonal;
                            } else {
                                params.horaInicio = this.personal.horaInicioSabado;
                                params.horaFin = this.personal.horaFinSabado;
                                params.dia = 7;
                                params.idPersonal = this.personal.idPersonal;
                            }

                            this._backService.HttpPost("catalogos/personal/ConsultarHorarioPersonal", {}, params).subscribe((response: string) => {
                                $("#txtHoraFinSabado> div:first-child").attr("style", "outline: none");
                                $("#txtHoraInicioSabado> div:first-child").attr("style", "outline: none");
                                var validacionHorario = eval(response);
                    
                                switch (validacionHorario[0].msgError) {
                                    //Estos son los diferentes resultados que te puede regresar la función de actualizar el Horario de Personal
                                    case -1:
                                        this._toaster.error("Personal Tiene Descanso");
                                        this.validarRangoHorasCitasPersonal = false;
                                        this.validRangosCita = false;
                                        $("#txtHoraInicioSabado> div:first-child").attr("style", "outline: red solid 1px !important");
                                        $("#txtHoraFinSabado> div:first-child").attr("style", "outline: red solid 1px !important");
                                        break;
                                    case -2:
                                        this._toaster.error('Favor de re-programar citas del personal, antes de cambiar su horario');

                                        this.validarRangoHorasCitasPersonal = false;
                                        this.validRangosCita = false;
                                        $("#txtHoraInicioSabado> div:first-child").attr("style", "outline: red solid 1px !important");
                                        $("#txtHoraFinSabado> div:first-child").attr("style", "outline: red solid 1px !important");
                                        break;
                                }


                                var params: any = {};
                                if (this.personal.domingo == false) {
                                    params.horaInicio = '00:00';
                                    params.horaFin = '00:00';
                                    params.dia = 1;
                                    params.idPersonal = this.personal.idPersonal;
                                } else {
                                    params.horaInicio = this.personal.horaInicioDomingo;
                                    params.horaFin = this.personal.horaFinDomingo;
                                    params.dia = 1;
                                    params.idPersonal = this.personal.idPersonal;
                                }

                                this._backService.HttpPost("catalogos/personal/ConsultarHorarioPersonal", {}, params).subscribe((response: string) => {
                                    $("#txtHoraFinDomingo> div:first-child").attr("style", "outline: none");
                                    $("#txtHoraInicioDomingo> div:first-child").attr("style", "outline: none");

                                    var validacionHorario = eval(response);
                        
                                    switch (validacionHorario[0].msgError) {
                                        //Estos son los diferentes resultados que te puede regresar la función de actualizar el Horario de Personal
                                        case -1:
                                            this._toaster.error("Personal Tiene Descanso");
                                            this.validarRangoHorasCitasPersonal = false;
                                            this.validRangosCita = false;
                                            $("#txtHoraInicioDomingo> div:first-child").attr("style", "outline: red solid 1px !important");
                                            $("#txtHoraFinDomingo> div:first-child").attr("style", "outline: red solid 1px !important");
                                            break;
                                        case -2:
                                            this._toaster.error('Favor de re-programar citas del personal, antes de cambiar su horario');

                                            this.validarRangoHorasCitasPersonal = false;
                                            this.validRangosCita = false;
                                            $("#txtHoraInicioDomingo> div:first-child").attr("style", "outline: red solid 1px !important");
                                            $("#txtHoraFinDomingo> div:first-child").attr("style", "outline: red solid 1px !important");
                                            break;
                                    }

                                    if (validacionHorario[0].dia == 1 && this.validarRangoHorasCitasPersonal != false) {
                                        if (this.validarRangoHorasCitasPersonal) { //generar funcion de validacion rango permitido de citas    
                                            this.personal_guardarHorariosLaboral();
                                            this.personal_guardarHorariosDescansos();
                                            console.log("entre al validacion");

                                            var params: any = {};

                                            //Guardar Logo
                                            if (this.personal.idImagen != null) {
                                                params.idImagen = this.personal.idImagen;
                                            }
                                            else
                                                params.idImagen = "";

                                            if (this.personal.imagenRecortada != "" || this.personal.imagenSinRecortar != "") {
                                                if (!this.guardarSinRecortar) {
                                                    params.codigo = this.personal.imagenRecortada;
                                                }
                                                else {
                                                    params.codigo = this.personal.imagenSinRecortar;
                                                }
                                                params.tipoContenido = this.personal.tipoContenidoLogo;
                                            }
                                            else {
                                                params.tipoContenido = "";
                                                params.codigo = "";
                                            }

                                            //----------
                                            //Guardar Horario Laboral
                                            params.horaInicio = this.personal.horarioLaboralInicio.slice();
                                            params.horaFin = this.personal.horarioLaboralFin.slice();
                                            params.esLaboral = this.personal.laboral.slice();

                                            //----------
                                            //Guardar Horario Descansos
                                            params.descansoDia = this.personal.descansoDia.slice();
                                            params.descansoHoraInicio = this.personal.descansoHoraInicio.slice();
                                            params.descansoHoraFin = this.personal.descansoHoraFin.slice();

                                            //----------
                                            //Guardar Servicio Personal
                                            params.idPersonalServicio = this.personal.idPersonalServicio.slice();
                                            params.idServicio = this.personal.servicio.slice();

                                            //---------
                                            params.tipoUsuario = this.personal.tipoUsuario;
                                            params.idPersonal = this.personal.idPersonal;
                                            params.nombre = this.personal.nombre.replace(/</g, "&lt;");;
                                            params.email = this.personal.email.replace(/</g, "&lt;");;

                                            params.telefono = this.personal.telefono;
                                            if (this.personal.sucursal != "") {
                                                params.sucursal = this.personal.sucursal;
                                            }
                                            else {
                                                params.sucursal = "";
                                            }

                                            params.comisionServicio = this.personal.comisionServicio;
                                            params.comisionProducto = this.personal.comisionProducto;

                                            params.color = this.color//$('select[name="colorpicker-picker-longlist"]').val()
                                            params.vendedor = this.personal.vendedor;

                                            params.categoriasComision = [];
                                            for (var k = 0; k < this.categoria.categoriasDelPersonal.length; k++) {
                                                params.categoriasComision.push(this.categoria.categoriasDelPersonal[k].idCategoria);
                                            }

                                            params.visibleAgenda = this.personal.visibleAgenda == 1 ? true : false;

                                            params.esCabina = this.personal.cabina.isCabina == 1 ? true : false;
                                            params.serviciosCabina = this.personal.cabina.servicios;
                                            params.personalesCabina = this.personal.cabina.personales;

                                            this._backService.HttpPost("catalogos/personal/actualizarPersonal", {}, params).subscribe((response: string) => {
                                                var dataPersonal = eval(response);
                                                if (dataPersonal != -1) {

                                                    for (var i = 0; i < this.personal.dataPersonales.length; i++) {
                                                        if (this.personal.dataPersonales[i].idPersonal == this.personal.idPersonal) {
                                                            this.personal.dataPersonales[i].nombre = this.personal.nombre;
                                                            if (this.personal.imagenRecortada != "") {
                                                                if (!this.guardarSinRecortar) {
                                                                    this.personal.dataPersonales[i].codigoFoto = JSON.parse(JSON.stringify(this.personal.imagenRecortada));
                                                                    var ebi_Img: any = document.getElementById('img' + this.personal.dataPersonales[i].idPersonal);
                                                                    ebi_Img.src = this.personal.imagenRecortada;
                                                                } else {
                                                                    this.personal.dataPersonales[i].codigoFoto = JSON.parse(JSON.stringify(this.personal.imagenSinRecortar));
                                                                    var b: any = document.getElementById('img' + this.personal.dataPersonales[i].idPersonal);
                                                                    b.src = this.personal.imagenSinRecortar;
                                                                }
                                                            }
                                                            break;
                                                        }
                                                    }

                                                    this.consultarPersonalEditarPersonal(dataPersonal);
                                                }
                                                else {

                                                    $("#btnGuardar").removeClass("loading");
                                                    this._pantallaServicio.ocultarSpinner();
                                                    

                                                    $('#divPersonales').css('pointer-events', 'visible');
                                                    $('#btnGuardar').css('pointer-events', 'visible');
                                                    $('#btnDescartar').css('pointer-events', 'visible');
                                                    this.validDescartar = true;

                                                    this._toaster.error("Ya existe un personal con ese nombre");
                                                    $("#txtNombre").addClass('errorCampo');
                                                }
                                            }, 
                                            (error) => {
                                                this._pantallaServicio.ocultarSpinner();
                                                if (error == 'SinSesion' || error == 'SesionCaducada') {
                                                  if (error == 'SinSesion') {
                                                    this._toaster.error(this.personalTranslate.favorIniciarSesion);
                                                  }
                                                  if (error == 'SesionCaducada') {
                                                    this._toaster.error(this.personalTranslate.sesionCaducada);
                                                  }
                                                  this._router.navigate(['/login']);
                                                  return;
                                                }
                                                this._toaster.error(this.personalTranslate.errorEliminar);
                                            });
                                        }
                                        else {
                                            $('#divPersonales').css('pointer-events', 'visible');
                                            $('#btnNuevo').css('pointer-events', 'visible');
                                            $('#btnGuardar').css('pointer-events', 'visible');
                                            $('#btnDescartar').css('pointer-events', 'visible');
                                            this._pantallaServicio.ocultarSpinner();
                                            
                                            this.rootScope_stopChange = true;
                                            $("#btnGuardar").removeClass("loading");
                                        }
                                    } else {
                                        this._pantallaServicio.ocultarSpinner();
                                    }
                                //Termina Domingo
                                }, 
                                (error) => {
                                    this._pantallaServicio.ocultarSpinner();
                                    if (error == 'SinSesion' || error == 'SesionCaducada') {
                                      if (error == 'SinSesion') {
                                        this._toaster.error(this.personalTranslate.favorIniciarSesion);
                                      }
                                      if (error == 'SesionCaducada') {
                                        this._toaster.error(this.personalTranslate.sesionCaducada);
                                      }
                                      this._router.navigate(['/login']);
                                      return;
                                    }
                                    this._toaster.error(this.personalTranslate.errorEliminar);
                                });
                            //Termina Sabado
                            }, 
                            (error) => {
                                this._pantallaServicio.ocultarSpinner();
                                if (error == 'SinSesion' || error == 'SesionCaducada') {
                                  if (error == 'SinSesion') {
                                    this._toaster.error(this.personalTranslate.favorIniciarSesion);
                                  }
                                  if (error == 'SesionCaducada') {
                                    this._toaster.error(this.personalTranslate.sesionCaducada);
                                  }
                                  this._router.navigate(['/login']);
                                  return;
                                }
                                this._toaster.error(this.personalTranslate.errorEliminar);
                            });
                        //Termina Viernes
                        }, 
                        (error) => {
                            this._pantallaServicio.ocultarSpinner();
                            if (error == 'SinSesion' || error == 'SesionCaducada') {
                              if (error == 'SinSesion') {
                                this._toaster.error(this.personalTranslate.favorIniciarSesion);
                              }
                              if (error == 'SesionCaducada') {
                                this._toaster.error(this.personalTranslate.sesionCaducada);
                              }
                              this._router.navigate(['/login']);
                              return;
                            }
                            this._toaster.error(this.personalTranslate.errorEliminar);
                        });
                    //Termina Jueves
                    }, 
                    (error) => {
                        this._pantallaServicio.ocultarSpinner();
                        if (error == 'SinSesion' || error == 'SesionCaducada') {
                          if (error == 'SinSesion') {
                            this._toaster.error(this.personalTranslate.favorIniciarSesion);
                          }
                          if (error == 'SesionCaducada') {
                            this._toaster.error(this.personalTranslate.sesionCaducada);
                          }
                          this._router.navigate(['/login']);
                          return;
                        }
                        this._toaster.error(this.personalTranslate.errorEliminar);
                    });
                //Termina Miercoles
                }, 
                (error) => {
                    this._pantallaServicio.ocultarSpinner();
                    if (error == 'SinSesion' || error == 'SesionCaducada') {
                      if (error == 'SinSesion') {
                        this._toaster.error(this.personalTranslate.favorIniciarSesion);
                      }
                      if (error == 'SesionCaducada') {
                        this._toaster.error(this.personalTranslate.sesionCaducada);
                      }
                      this._router.navigate(['/login']);
                      return;
                    }
                    this._toaster.error(this.personalTranslate.errorEliminar);
                });
            //Termina martes
            }, 
            (error) => {
                this._pantallaServicio.ocultarSpinner();
                if (error == 'SinSesion' || error == 'SesionCaducada') {
                  if (error == 'SinSesion') {
                    this._toaster.error(this.personalTranslate.favorIniciarSesion);
                  }
                  if (error == 'SesionCaducada') {
                    this._toaster.error(this.personalTranslate.sesionCaducada);
                  }
                  this._router.navigate(['/login']);
                  return;
                }
                this._toaster.error(this.personalTranslate.errorEliminar);
            });
        //Termina lunes
        }, 
        (error) => {
            this._pantallaServicio.ocultarSpinner();
            if (error == 'SinSesion' || error == 'SesionCaducada') {
              if (error == 'SinSesion') {
                this._toaster.error(this.personalTranslate.favorIniciarSesion);
              }
              if (error == 'SesionCaducada') {
                this._toaster.error(this.personalTranslate.sesionCaducada);
              }
              this._router.navigate(['/login']);
              return;
            }
            this._toaster.error(this.personalTranslate.errorEliminar);
        });
    }
    
    ////////////////////////////////////Funcion Limite Servicio Cabina ///////////////////////////////////
    actualizarContadorCabina() {
        if (this.personal.visibleLimiteCabina) {
            var params: any = {};
            params.idPersonal = this.personal.idPersonal;
            params.limitecabina = this.personal.limitecabina;
            params.contienelimitecabina = this.personal.visibleLimiteCabina;
            this._backService.HttpPost("catalogos/personal/ConsultarLimiteCabina", {}, params).subscribe((response: string) => {
                this.datalimitecabina = eval(response);
                if (this.datalimitecabina.length > 0) {  

                    var validacionlimitecabina = eval(response);
                    switch (validacionlimitecabina[0].msgError) {
                        //Estos son los diferentes resultados que te puede regresar la función 
                        case 1:
                            this._toaster.error('Se ingreso un Limite de Cabina menor al registrado anteriormente');                                
                            break;
                    }
                }
                else {
                }
            }, 
            (error) => {
                this._pantallaServicio.ocultarSpinner();
                if (error == 'SinSesion' || error == 'SesionCaducada') {
                  if (error == 'SinSesion') {
                    this._toaster.error(this.personalTranslate.favorIniciarSesion);
                  }
                  if (error == 'SesionCaducada') {
                    this._toaster.error(this.personalTranslate.sesionCaducada);
                  }
                  this._router.navigate(['/login']);
                  return;
                }
                this._toaster.error(this.personalTranslate.errorEliminar);
            });
        }
        else {
        }       
    }

    onBlurTxt(elemento: any) {
        this.validarHorariosParaDescansos();
        if (this.guardar) {
            var elem: any = document.getElementById(elemento);
            if (elem.value == "") {
                $("#" + elemento).addClass('errorCampo');
            }
        }
    }

    onClickDdl(elemento: any) {
        if (this.guardar) {
            $("#" + elemento).removeClass('errorCampo');
            //$("#"+elemento+" > div:first-child").attr("style", "outline: none");
            this.elementoDdl = elemento;
        }
    }

    onChangeChkLunes() {
        this.validarHorariosParaDescansos();
        this.chkValidLunes = this.personal.lunes;
        var validarExpresionTiempo = new RegExp("^([0-1][0-9]| [2][0-3])(:[0-5][0-9])$");  //Expresion regular para validar formato de horas
        if (this.chkValidLunes == false) {
            this.personal.lunesValidDescartar = []
            $("#txtHoraInicioLunes> div:first-child").attr("style", "outline: none");
            $("#txtHoraFinLunes> div:first-child").attr("style", "outline: none");
            var contador = JSON.parse(JSON.stringify(this.personal.contadorLunes));
            for (var i = 0; i <= contador; i++) {
                this.personal_restarContadorLunes(0);
            }
            this.sucursal.contadorLunes = 0;
            var ebi_txtHoraInicioLunes: any = document.getElementById('txtHoraInicioLunes');
            if (!validarExpresionTiempo.test(ebi_txtHoraInicioLunes.value)) {
                this.msgLunes = "";
            } else {
                this.msgLunes = "";
            }
            var b: any = document.getElementById('txtHoraFinLunes');
            if (!validarExpresionTiempo.test(b.value)) {
                this.msgLunes = "";
            } else {
                this.msgLunes = "";
            }

            this.personal.horaInicioLunes = "09:00";
            this.personal.horaFinLunes = "18:00";
        }
    }

    onChangeChkMartes() {
        this.validarHorariosParaDescansos();
        this.chkValidMartes = this.personal.martes;
        var validarExpresionTiempo = new RegExp("^([0-1][0-9]| [2][0-3])(:[0-5][0-9])$");
        if (this.chkValidMartes == false) {
            this.personal.martesValidDescartar = [];

            $("#txtHoraInicioMartes> div:first-child").attr("style", "outline: none");
            $("#txtHoraFinMartes> div:first-child").attr("style", "outline: none");
            var contador = JSON.parse(JSON.stringify(this.personal.contadorMartes));
            for (var i = 0; i <= contador; i++) {
                this.personal_restarContadorMartes(0);
                $("#txtMartesDescansoInicio" + i + "> div:first-child").attr("style", "outline: none");
                $("#txtMartesDescansoFin" + i + "> div:first-child").attr("style", "outline: none");
            }
            this.personal.contadorMartes = 0;
            var ebi_txtHoraInicioMartes: any = document.getElementById('txtHoraInicioMartes');
            if (!validarExpresionTiempo.test(ebi_txtHoraInicioMartes.value)) {
                this.msgMartes = "";
            } else {
                this.msgMartes = "";
            }
            var b: any = document.getElementById('txtHoraFinMartes');
            if (!validarExpresionTiempo.test(b.value)) {
                this.msgMartes = "";
            } else {
                this.msgMartes = "";
            }

            this.personal.horaInicioMartes = "09:00";
            this.personal.horaFinMartes = "18:00";
        }
    }

    onChangeChkMiercoles() {
        this.validarHorariosParaDescansos();
        this.chkValidMiercoles = this.personal.miercoles;
        var validarExpresionTiempo = new RegExp("^([0-1][0-9]| [2][0-3])(:[0-5][0-9])$");
        if (this.chkValidMiercoles == false) {
            this.personal.miercolesValidDescartar = [];

            $("#txtHoraInicioMiercoles> div:first-child").attr("style", "outline: none");
            $("#txtHoraFinMiercoles> div:first-child").attr("style", "outline: none");
            var contador = JSON.parse(JSON.stringify(this.personal.contadorMiercoles));
            for (var i = 0; i <= contador; i++) {
                this.personal_restarContadorMiercoles(0);
                $("#txtMiercolesDescansoInicio" + i + "> div:first-child").attr("style", "outline: none");
                $("#txtMiercolesDescansoFin" + i + "> div:first-child").attr("style", "outline: none");
            }
            this.personal.contadorMiercoles = 0;
            var ebi_txtHoraInicioMiercoles: any = document.getElementById('txtHoraInicioMiercoles')
            if (!validarExpresionTiempo.test(ebi_txtHoraInicioMiercoles.value)) {
                this.msgMiercoles = "";
            } else {
                this.msgMiercoles = "";
            }
            var b: any = document.getElementById('txtHoraFinMiercoles')
            if (!validarExpresionTiempo.test(b.value)) {
                this.msgMiercoles = "";
            } else {
                this.msgMiercoles = "";
            }

            this.personal.horaInicioMiercoles = "09:00";
            this.personal.horaFinMiercoles = "18:00";
        }
    }

    onChangeChkJueves () {
        this.validarHorariosParaDescansos();
        this.chkValidJueves = this.personal.jueves;
        var validarExpresionTiempo = new RegExp("^([0-1][0-9]| [2][0-3])(:[0-5][0-9])$");
        if (this.chkValidJueves == false) {
            this.personal.juevesValidDescartar = [];
            $("#txtHoraInicioJueves> div:first-child").attr("style", "outline: none");
            $("#txtHoraFinJueves> div:first-child").attr("style", "outline: none");
            var contador = JSON.parse(JSON.stringify(this.personal.contadorJueves));
            for (var i = 0; i <= contador; i++) {
                this.personal_restarContadorJueves(0);
                $("#txtJuevesDescansoInicio" + i + "> div:first-child").attr("style", "outline: none");
                $("#txtJuevesDescansoFin" + i + "> div:first-child").attr("style", "outline: none");
            }
            this.personal.contadorJueves = 0;
            var ebi_txtHoraInicioJueves: any = document.getElementById('txtHoraInicioJueves');
            var b: any = document.getElementById('txtHoraFinJueves');
            if (!validarExpresionTiempo.test(ebi_txtHoraInicioJueves.value)) {
                this.msgJueves = "";
            } else {
                this.msgJueves = "";
            }

            if (!validarExpresionTiempo.test(b.value)) {
                this.msgJueves = "";
            } else {
                this.msgJueves = "";
            }

            this.personal.horaInicioJueves = "09:00";
            this.personal.horaFinJueves = "18:00";
        }
    }

    onChangeChkViernes () {
        this.validarHorariosParaDescansos();
        this.chkValidViernes = this.personal.viernes;
        var validarExpresionTiempo = new RegExp("^([0-1][0-9]| [2][0-3])(:[0-5][0-9])$");
        if (this.chkValidViernes == false) {
            this.personal.viernesValidDescartar = [];

            $("#txtHoraInicioViernes> div:first-child").attr("style", "outline: none");
            $("#txtHoraFinViernes> div:first-child").attr("style", "outline: none");
            var contador = JSON.parse(JSON.stringify(this.personal.contadorViernes));
            for (var i = 0; i <= contador; i++) {
                this.personal_restarContadorViernes(0);
                $("#txtViernesDescansoInicio" + i + "> div:first-child").attr("style", "outline: none");
                $("#txtViernesDescansoFin" + i + "> div:first-child").attr("style", "outline: none");
            }
            this.personal.contadorViernes = 0;
            var ebi_txtHoraInicioViernes: any = document.getElementById('txtHoraInicioViernes');
            var b: any = document.getElementById('txtHoraFinViernes');
            if (!validarExpresionTiempo.test(ebi_txtHoraInicioViernes.value)) {
                this.msgViernes = "";
            } else {
                this.msgViernes = "";
            }

            if (!validarExpresionTiempo.test(b.value)) {
                this.msgViernes = "";
            } else {
                this.msgViernes = "";
            }

            this.personal.horaInicioViernes = "09:00";
            this.personal.horaFinViernes = "18:00";
        }
    }

    onChangeChkSabado () {
        this.validarHorariosParaDescansos();
        this.chkValidSabado = this.personal.sabado;
        var validarExpresionTiempo = new RegExp("^([0-1][0-9]| [2][0-3])(:[0-5][0-9])$");
        if (this.chkValidSabado == false) {
            this.personal.sabadoValidDescartar = [];

            $("#txtHoraInicioSabado> div:first-child").attr("style", "outline: none");
            $("#txtHoraFinSabado> div:first-child").attr("style", "outline: none");

            var contador = JSON.parse(JSON.stringify(this.personal.contadorSabado));
            for (var i = 0; i <= contador; i++) {
                this.personal_restarContadorSabado(0);
                $("#txtSabadoDescansoInicio" + i + "> div:first-child").attr("style", "outline: none");
                $("#txtSabadoDescansoFin" + i + "> div:first-child").attr("style", "outline: none");
            }
            this.personal.contadorSabado = 0;
            var ebi_txtHoraInicioSabado: any = document.getElementById('txtHoraInicioSabado');
            var b: any = document.getElementById('txtHoraFinSabado');
            if (!validarExpresionTiempo.test(ebi_txtHoraInicioSabado.value)) {
                this.msgSabado = "";
            } else {
                this.msgSabado = "";
            }

            if (!validarExpresionTiempo.test(b.value)) {
                this.msgSabado = "";
            } else {
                this.msgSabado = "";
            }

            this.personal.horaInicioSabado = "09:00";
            this.personal.horaFinSabado = "18:00";
        }
    }

    onChangeChkDomingo () {
        this.validarHorariosParaDescansos();
        this.chkValidDomingo = this.personal.domingo;
        var validarExpresionTiempo = new RegExp("^([0-1][0-9]| [2][0-3])(:[0-5][0-9])$");
        if (this.chkValidDomingo == false) {
            this.personal.domingoValidDescartar = [];
            $("#txtHoraInicioDomingo> div:first-child").attr("style", "outline: none");
            $("#txtHoraFinDomingo> div:first-child").attr("style", "outline: none");
            var contador = JSON.parse(JSON.stringify(this.personal.contadorDomingo));
            for (var i = 0; i <= contador; i++) {
                this.personal_restarContadorDomingo(0);
                $("#txtDomingoDescansoInicio" + i + "> div:first-child").attr("style", "outline: none");
                $("#txtDomingoDescansoFin" + i + "> div:first-child").attr("style", "outline: none");
            }
            this.personal.contadorDomingo = 0;
            var ebi_txtHoraInicioDomingo: any = document.getElementById('txtHoraInicioDomingo');
            var b: any = document.getElementById('txtHoraFinDomingo');
            if (!validarExpresionTiempo.test(ebi_txtHoraInicioDomingo.value)) {
                this.msgDomingo = "";
            } else {
                this.msgDomingo = "";
            }

            if (!validarExpresionTiempo.test(b.value)) {
                this.msgDomingo = "";
            } else {
                this.msgDomingo = "";
            }

            this.personal.horaInicioDomingo = "09:00";
            this.personal.horaFinDomingo = "18:00";
        }
    }
    
    // ----------------------------------------------------------------------- Eliminar Personal ----------------------------------------------------------------------
    personal_preparacionBorrar(row: any) {
        this.personal.personalSeleccionado = row;
        this.personal_eliminar();
    };

    personal_eliminar() {
        this.confirm(this.personalTranslate.deseaBorrarPersonal)
    };

    cerrarModalUbicacion(){
        this.modales.modalConfirmUbicacion.hide();
    }

    confirm(message: any) {
        if (this.personal.dataPersonales.length > 1) {
            this.modales.modalConfirmEliminar.show();
            this.msg_modalConfirmEliminar = message;
        } else {
            this.modales.modalAlertBorrado.show();
            $("#modal-alertBorrado .modal-body").html('<span style="font-weight: 400;">' + this.personalTranslate.minPersonal + '</span>');
        }
    };

    personal_validarCitasDetalle() {
        this.validCitas = false;
        var params: any = {};
        params.idPersonal = this.personal.personalSeleccionado;

        this._backService.HttpPost("catalogos/personal/validarCitasDetalle", {}, params).subscribe((response: string) => {
            this.dataCitasDetalle = eval(response);
            if (this.dataCitasDetalle.length > 0) {
                this.validarCitas = false;
                this.modalReprogramar();
            }
            else {
                this.validCitas = true;
                this.personal_borrarPersonal(false);
            }
        }, 
        (error) => {
            this._pantallaServicio.ocultarSpinner();
            if (error == 'SinSesion' || error == 'SesionCaducada') {
              if (error == 'SinSesion') {
                this._toaster.error(this.personalTranslate.favorIniciarSesion);
              }
              if (error == 'SesionCaducada') {
                this._toaster.error(this.personalTranslate.sesionCaducada);
              }
              this._router.navigate(['/login']);
              return;
            }
            this._toaster.error(this.personalTranslate.errorEliminar);
        });
    }

    personal_borrarPersonal(bajaCita: any) {
        $('#btnNuevo').css('pointer-events', 'none');
        if (bajaCita == undefined || bajaCita == "") {
            bajaCita = false;
        }
        var params: any = {};
        params.bajaCita = bajaCita;
        params.personal = this.personal.personalSeleccionado;

        this._backService.HttpPost("catalogos/personal/borrarPersonal", {}, params).subscribe((response: string) => {
            this.personal.exito = eval(response);
            var index;

            if (this.personal.exito == "0") {
                setTimeout(() =>{
                    this.consultarPersonal();
                }, 50);
            }
            else {
                this.mostrarModal(this.personalTranslate.usoPersonal);
            }
        }, 
        (error) => {
            this._pantallaServicio.ocultarSpinner();
            if (error == 'SinSesion' || error == 'SesionCaducada') {
              if (error == 'SinSesion') {
                this._toaster.error(this.personalTranslate.favorIniciarSesion);
              }
              if (error == 'SesionCaducada') {
                this._toaster.error(this.personalTranslate.sesionCaducada);
              }
              this._router.navigate(['/login']);
              return;
            }
            this._toaster.error(this.personalTranslate.errorEliminar);
        });
    };

    mostrarModal(message: any) {
        this.modales.modalAlertBorrado.show();
        $("#modal-alertBorrado .modal-body").html('<span class="title">' + message + '</span>');
    };

    modalReprogramar() {
        this.citas.dataPersonal = JSON.parse(JSON.stringify(this.personal.dataPersonales));
        var tamDataPersonal = this.citas.dataPersonal.length;
        var PersonalaBorrar = [];

        // Detecta si el personal que se va a eliminar es cabino o un personal normal
        for (var i = 0; i < tamDataPersonal; i++) {
            if (this.citas.dataPersonal[i].idPersonal == this.personal.personalSeleccionado) {
                var UsuarioCabina = this.citas.dataPersonal[i].esCabina;
            }
        }

        // Recorre los arreglos de personal para eliminar las cabinas o personales en base al personal seleccionado a eliminar
        for (var i = 0; i < tamDataPersonal; i++) {
            if (UsuarioCabina) {
                if (this.citas.dataPersonal[i].idPersonal == this.personal.personalSeleccionado) {
                    PersonalaBorrar.push(this.citas.dataPersonal[i]);
                }
                if (this.citas.dataPersonal[i].esCabina != 1) {
                    PersonalaBorrar.push(this.citas.dataPersonal[i]);
                }
            } else {
                if (this.citas.dataPersonal[i].idPersonal == this.personal.personalSeleccionado) {
                    PersonalaBorrar.push(this.citas.dataPersonal[i]);
                }
                if (this.citas.dataPersonal[i].esCabina == 1) {
                    PersonalaBorrar.push(this.citas.dataPersonal[i]);
                }
            }
        }

        // si es tipo cabina, solo aparecen los tipo cabina para reprogramar
        // si es un personal normal, solo aparecen los personales normales para reprogramar
        for (var i = 0; i < PersonalaBorrar.length; i++) {
            var index = this.citas.dataPersonal.indexOf(PersonalaBorrar[i]);
            this.citas.dataPersonal.splice(index, 1);
        }

        this.UsuarioCabinaDeMomento = UsuarioCabina;
        var params: any = {};
        params.idPersonal = this.personal.personalSeleccionado;

        // Si el usuario es tipo Cabina, se consulta las citas en base a cabina
        if (UsuarioCabina) {
            this._backService.HttpPost("catalogos/personal/consultarCitasCabina", {}, params).subscribe((response: string) => {
                var dataTemp = eval(response);
                dataTemp.reverse();
                this.nCitas = dataTemp.length - 1;
                this.citas.pendientes = dataTemp;
                this.showModalReporgramar();
            }, 
            (error) => {
                this._pantallaServicio.ocultarSpinner();
                if (error == 'SinSesion' || error == 'SesionCaducada') {
                  if (error == 'SinSesion') {
                    this._toaster.error(this.personalTranslate.favorIniciarSesion);
                  }
                  if (error == 'SesionCaducada') {
                    this._toaster.error(this.personalTranslate.sesionCaducada);
                  }
                  this._router.navigate(['/login']);
                  return;
                }
                this._toaster.error(this.personalTranslate.errorEliminar);
            });
        }
        else {
            this._backService.HttpPost("catalogos/personal/consultarCitasPersonal", {}, params).subscribe((response: string) => {
                var dataTemp = eval(response);
                dataTemp.reverse();
                this.nCitas = dataTemp.length - 1;
                this.citas.pendientes = dataTemp;
                this.showModalReporgramar();
            }, 
            (error) => {
                this._pantallaServicio.ocultarSpinner();
                if (error == 'SinSesion' || error == 'SesionCaducada') {
                  if (error == 'SinSesion') {
                    this._toaster.error(this.personalTranslate.favorIniciarSesion);
                  }
                  if (error == 'SesionCaducada') {
                    this._toaster.error(this.personalTranslate.sesionCaducada);
                  }
                  this._router.navigate(['/login']);
                  return;
                }
                this._toaster.error(this.personalTranslate.errorEliminar);
            });
        }
    };

    modalCancelarCitas() {
        this.modales.modalCancelarCitas.show();
        $("#modalCancelarCitas .modal-body").html('<span class="title">' + this.personalTranslate.deseaCancelarCotas + '</span>');

        this.personal_validarCitas();
    }
    
    personal_validarCitas() {
        for (var i = 0; i < this.dataCitasDetalle.length; i++) {
            var params: any = {};
            params.idPersonal = this.personal.personalSeleccionado;
            params.idCita = this.dataCitasDetalle[i].idCita;

            this._backService.HttpPost("catalogos/personal/validarCitas", {}, params).subscribe((response: string) => {
                this.dataCitas = eval(response);
                this.numCitas = this.dataCitas.length;
                this.personal_cancelarCitas();
            }, 
            (error) => {
                this._pantallaServicio.ocultarSpinner();
                if (error == 'SinSesion' || error == 'SesionCaducada') {
                  if (error == 'SinSesion') {
                    this._toaster.error(this.personalTranslate.favorIniciarSesion);
                  }
                  if (error == 'SesionCaducada') {
                    this._toaster.error(this.personalTranslate.sesionCaducada);
                  }
                  this._router.navigate(['/login']);
                  return;
                }
                this._toaster.error(this.personalTranslate.errorEliminar);
            });
        }
        this.personal_borrarPersonal(true);
    }

    personal_cancelarCitas() {
        if (this.numCitas == 1) {
            var params: any = {};
            params.idPersonal = this.personal.personalSeleccionado;

            this._backService.HttpPost("catalogos/personal/cancelarCitas", {}, params).subscribe((response: string) => {
            }, 
            (error) => {
                this._pantallaServicio.ocultarSpinner();
                if (error == 'SinSesion' || error == 'SesionCaducada') {
                  if (error == 'SinSesion') {
                    this._toaster.error(this.personalTranslate.favorIniciarSesion);
                  }
                  if (error == 'SesionCaducada') {
                    this._toaster.error(this.personalTranslate.sesionCaducada);
                  }
                  this._router.navigate(['/login']);
                  return;
                }
                this._toaster.error(this.personalTranslate.errorEliminar);
            });
        }
    }

    citasNada() {
        this.personal_borrarPersonal(false);
    }

    reprogramarManual() {
        this.personal_borrarPersonal(false);
        this._router.navigate(['/agenda']);
    }

    reprogramarCitas() {
        var array = [7, 1, 2, 3, 4, 5, 6];

        if (this.citas.idPersonal != "") {
            //Cambiar estatus eliminado a las citas con la fecha menor a la actual
            var idCitas = [];
            var idCitaDetalles = [];
            var fechaActual = moment().startOf('day');
            for (var i = 0; i < this.citas.pendientes.length; i++) {
                var params: any = {};
                var fechaCita = moment(this.citas.pendientes[i].fechaCita).startOf('day');
                if (fechaCita.isBefore(fechaActual)) {
                    idCitas.push(this.citas.pendientes[i].idCita);
                }
            }

            var params: any = {};
            params.idCita = idCitas;
            params.idPersonal = this.personal.personalSeleccionado;

            if (this.UsuarioCabinaDeMomento == false) {
                this._backService.HttpPost("catalogos/personal/cancelarCitasPersonal", {}, params).subscribe((response: string) => {
                    var dataTemp = eval(response);
                    dataTemp.reverse();
                    this.nCitas = dataTemp.length - 1;
                    this.citas.pendientes = dataTemp;

                    for (var i = 0; i < this.citas.pendientes.length; i++) {
                        for (var j = 0; j < this.citasFinPendientes.length; j++) {
                            if (this.citas.pendientes[i].idCitaDetalle == this.citasFinPendientes[j].idCitaDetalle) {
                                this.citas.pendientes.splice(i, 1);
                                i--;
                                j = this.citasFinPendientes.length;
                            }
                        }
                    }

                    this.nCitas = this.citas.pendientes.length - 1;

                    //Consulta las citas despues de haber dado de baja las citas que son menores a la fecha actual
                    //if (this.nCitas != -1){
                    if (this.nCitas >= 0) {
                        var strFecha = (this.citas.pendientes[this.nCitas].fechaCita.substring(0, 10)).split("/");
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
                                this._backService.HttpPost("catalogos/excepciones/updateCita", {}, params).subscribe((response: string) => {
                                    var dataTemp = eval(response);
                                    this.idCitasRepro.push(dataTemp);
                                    this.nCitas -= 1;

                                    this.reprogramarCitas();
                                }, 
                                (error) => {
                                    this._pantallaServicio.ocultarSpinner();
                                    if (error == 'SinSesion' || error == 'SesionCaducada') {
                                      if (error == 'SinSesion') {
                                        this._toaster.error(this.personalTranslate.favorIniciarSesion);
                                      }
                                      if (error == 'SesionCaducada') {
                                        this._toaster.error(this.personalTranslate.sesionCaducada);
                                      }
                                      this._router.navigate(['/login']);
                                      return;
                                    }
                                    this._toaster.error(this.personalTranslate.errorEliminar);
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
                                this._toaster.error(this.personalTranslate.favorIniciarSesion);
                              }
                              if (error == 'SesionCaducada') {
                                this._toaster.error(this.personalTranslate.sesionCaducada);
                              }
                              this._router.navigate(['/login']);
                              return;
                            }
                            this._toaster.error(this.personalTranslate.errorEliminar);
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
                        } else {
                            if (this.citasFinPendientes.length > 0) {
                                this.modales.modalReprog.hide();
                                this.citas.idPersonal = [];
                            }
                            else {
                                this.modales.modalReprog.hide();
                                this.citas.idPersonal = [];
                            }
                        }
                    }
                }, 
                (error) => {
                    this._pantallaServicio.ocultarSpinner();
                    if (error == 'SinSesion' || error == 'SesionCaducada') {
                      if (error == 'SinSesion') {
                        this._toaster.error(this.personalTranslate.favorIniciarSesion);
                      }
                      if (error == 'SesionCaducada') {
                        this._toaster.error(this.personalTranslate.sesionCaducada);
                      }
                      this._router.navigate(['/login']);
                      return;
                    }
                    this._toaster.error(this.personalTranslate.errorEliminar);
                });
            }
            else {
                this._backService.HttpPost("catalogos/personal/cancelarCitasCabina", {}, params).subscribe((response: string) => {
                    var dataTemp = eval(response);
                    dataTemp.reverse();
                    this.nCitas = dataTemp.length - 1;
                    this.citas.pendientes = dataTemp;

                    for (var i = 0; i < this.citas.pendientes.length; i++) {
                        for (var j = 0; j < this.citasFinPendientes.length; j++) {
                            if (this.citas.pendientes[i].idCitaDetalle == this.citasFinPendientes[j].idCitaDetalle) {
                                this.citas.pendientes.splice(i, 1);
                                i--;
                                j = this.citasFinPendientes.length;
                            }
                        }
                    }
                    this.nCitas = this.citas.pendientes.length - 1;
                    //Consulta las citas despues de haber dado de baja las citas que son menores a la fecha actual
                    //if (this.nCitas != -1){
                    if (this.nCitas >= 0) {
                        var strFecha = (this.citas.pendientes[this.nCitas].fechaCita.substring(0, 10)).split("/");
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
                                this._backService.HttpPost("catalogos/excepciones/updateCitaCabina", {}, params).subscribe((response: string) => {
                                    var dataTemp = eval(response);
                        
                                    this.idCitasRepro.push(dataTemp);
                                    this.nCitas -= 1;
                                    this.reprogramarCitas();
                                }, 
                                (error) => {
                                    this._pantallaServicio.ocultarSpinner();
                                    if (error == 'SinSesion' || error == 'SesionCaducada') {
                                      if (error == 'SinSesion') {
                                        this._toaster.error(this.personalTranslate.favorIniciarSesion);
                                      }
                                      if (error == 'SesionCaducada') {
                                        this._toaster.error(this.personalTranslate.sesionCaducada);
                                      }
                                      this._router.navigate(['/login']);
                                      return;
                                    }
                                    this._toaster.error(this.personalTranslate.errorEliminar);
                                });
                            }
                            else {
                                this.citasFinPendientes.push(this.citas.pendientes[this.nCitas]);
                                this.nCitas -= 1;
                                this.reprogramarCitas();
                            }
                        },
                        (error) => {
                            this._pantallaServicio.ocultarSpinner();
                            if (error == 'SinSesion' || error == 'SesionCaducada') {
                              if (error == 'SinSesion') {
                                this._toaster.error(this.personalTranslate.favorIniciarSesion);
                              }
                              if (error == 'SesionCaducada') {
                                this._toaster.error(this.personalTranslate.sesionCaducada);
                              }
                              this._router.navigate(['/login']);
                              return;
                            }
                            this._toaster.error(this.personalTranslate.errorEliminar);
                        });
                    }
                    else {
                        if (this.idCitasRepro.length > 0) {
                            var params: any = {};
                            params.idCitasRepro = JSON.parse(JSON.stringify(this.idCitasRepro));
                            params.idCitasRepro = params.idCitasRepro.filter(function (elem: any, pos: any) {
                                return params.idCitasRepro.indexOf(elem) == pos;
                            });
                            this.idCitasRepro = [];
                            this._pantallaServicio.mostrarSpinner();
                            this._backService.HttpPost("catalogos/excepciones/correoCitaReprogramada", {}, params).subscribe((response: string) => {
                                this._pantallaServicio.ocultarSpinner();
                                
                                if (this.citasFinPendientes.length > 0) {
                                    this.modales.modalReprog.hide();
                                    this.citas.idPersonal = [];
                                } else {
                                    this.modales.modalReprog.hide();
                                    this.citas.idPersonal = [];
                                }
                            }, 
                            (error) => {
                                this._pantallaServicio.ocultarSpinner();
                                if (error == 'SinSesion' || error == 'SesionCaducada') {
                                  if (error == 'SinSesion') {
                                    this._toaster.error(this.personalTranslate.favorIniciarSesion);
                                  }
                                  if (error == 'SesionCaducada') {
                                    this._toaster.error(this.personalTranslate.sesionCaducada);
                                  }
                                  this._router.navigate(['/login']);
                                  return;
                                }
                                this._toaster.error(this.personalTranslate.errorEliminar);
                            });
                        }
                        else {
                            if (this.citasFinPendientes.length > 0) {
                                this.modales.modalReprog.hide();
                                this.citas.idPersonal = [];
                            }
                            else {
                                this.modales.modalReprog.hide();
                                this.citas.idPersonal = [];
                            }
                        }
                    }
                }, 
                (error) => {
                    this._pantallaServicio.ocultarSpinner();
                    if (error == 'SinSesion' || error == 'SesionCaducada') {
                      if (error == 'SinSesion') {
                        this._toaster.error(this.personalTranslate.favorIniciarSesion);
                      }
                      if (error == 'SesionCaducada') {
                        this._toaster.error(this.personalTranslate.sesionCaducada);
                      }
                      this._router.navigate(['/login']);
                      return;
                    }
                    this._toaster.error(this.personalTranslate.errorEliminar);
                });
            }
        }
        else {
            $("#ddlPersonalRepro > div:first-child").attr("style", "outline: red solid 1px !important");
        }
    }

    cancelarCitas() {
        var idCC: any = [];

        if (this.citasFinPendientes.length == 0) {
            for (var i = 0; i < this.citas.pendientes.length; i++) {
                idCC.push(this.citas.pendientes[i].idCita + ',' + this.citas.pendientes[i].idCitaRecu);
            }
            var params: any = {};
            params.idCitasCancel = idCC;
            params.idCitasCancel.sort(function (a: any, b: any) { return (a.split(',')[0]) - (b.split(',')[0]) });
            params.idCitasCancel = params.idCitasCancel.filter(function (elem: any, pos: any) {
                return params.idCitasCancel.indexOf(elem) == pos;
            });
            this._pantallaServicio.mostrarSpinner();

            this._backService.HttpPost("catalogos/excepciones/correoCitaCancelada", {}, params).subscribe((response: string) => {
                var params: any = {};
                params.idCita = idCC;
                params.motivo = 'Baja de personal';

                this._backService.HttpPost("catalogos/excepciones/cancelarCita", {}, params).subscribe((response: string) => {
                    this._pantallaServicio.ocultarSpinner();
                    
                    $("#btnCerrarModal").click();
                    this.personal_borrarPersonal(true);
                }, 
                (error) => {
                    this._pantallaServicio.ocultarSpinner();
                    if (error == 'SinSesion' || error == 'SesionCaducada') {
                      if (error == 'SinSesion') {
                        this._toaster.error(this.personalTranslate.favorIniciarSesion);
                      }
                      if (error == 'SesionCaducada') {
                        this._toaster.error(this.personalTranslate.sesionCaducada);
                      }
                      this._router.navigate(['/login']);
                      return;
                    }
                    this._toaster.error(this.personalTranslate.errorEliminar);
                });
            }, 
            (error) => {
                this._pantallaServicio.ocultarSpinner();
                if (error == 'SinSesion' || error == 'SesionCaducada') {
                  if (error == 'SinSesion') {
                    this._toaster.error(this.personalTranslate.favorIniciarSesion);
                  }
                  if (error == 'SesionCaducada') {
                    this._toaster.error(this.personalTranslate.sesionCaducada);
                  }
                  this._router.navigate(['/login']);
                  return;
                }
                this._toaster.error(this.personalTranslate.errorEliminar);
            });
        } else {
            for (i = 0; i < this.citasFinPendientes.length; i++) {
                idCC.push(this.citasFinPendientes[i].idCita + ',' + this.citas.pendientes[i].idCitaRecu);
            }
            var params: any = {};
            params.idCitasCancel = idCC;
            params.idCitasCancel.sort(function (a: any, b: any) { return (a.split(',')[0]) - (b.split(',')[0]) });
            params.idCitasCancel = params.idCitasCancel.filter(function (elem: any, pos: any) {
                return params.idCitasCancel.indexOf(elem) == pos;
            });
            this._pantallaServicio.mostrarSpinner();

            this._backService.HttpPost("catalogos/excepciones/correoCitaCancelada", {}, params).subscribe((response: string) => {
                var params: any = {};
                params.idCita = idCC;
                params.motivo = 'Baja de personal';

                this._backService.HttpPost("catalogos/excepciones/cancelarCita", {}, params).subscribe((response: string) => {
                    this._pantallaServicio.ocultarSpinner();
                    
                    this.modales.modalCitasP.hide();
                    this.citasFinPendientes = [];
                    this.personal_borrarPersonal(true);
                }, 
                (error) => {
                    this._pantallaServicio.ocultarSpinner();
                    if (error == 'SinSesion' || error == 'SesionCaducada') {
                      if (error == 'SinSesion') {
                        this._toaster.error(this.personalTranslate.favorIniciarSesion);
                      }
                      if (error == 'SesionCaducada') {
                        this._toaster.error(this.personalTranslate.sesionCaducada);
                      }
                      this._router.navigate(['/login']);
                      return;
                    }
                    this._toaster.error(this.personalTranslate.errorEliminar);
                });
            }, 
            (error) => {
                this._pantallaServicio.ocultarSpinner();
                if (error == 'SinSesion' || error == 'SesionCaducada') {
                  if (error == 'SinSesion') {
                    this._toaster.error(this.personalTranslate.favorIniciarSesion);
                  }
                  if (error == 'SesionCaducada') {
                    this._toaster.error(this.personalTranslate.sesionCaducada);
                  }
                  this._router.navigate(['/login']);
                  return;
                }
                this._toaster.error(this.personalTranslate.errorEliminar);
            });
        }
    }

    showModalReporgramar() {
        this.modales.modalReprog.show();
    };

    showModalCitasP() {
        this.modales.modalCitasP.show();
    };

    abrirModalRecortar() {
        $('#btnRecortarFoto').css('display', 'inline');
        this.modales.modalCargarImagen.show();
    }
    
    // ----------------------------------------------- Categorías ------------------------------------------------------
    agregarCategoriasPersonal() {
        for(var i = 0; i < this.categoria.dataCategoriasMostrar.length; i++){
            if(this.categoria.dataCategoriasMostrar[i].idCategoria == this.categoria.categoriaSeleccionada){
                this.categoria.categoriaSeleccionada = this.categoria.dataCategoriasMostrar[i];
                break;
            }
        }
        if (this.categoria.categoriaSeleccionada != undefined && this.categoria.categoriaSeleccionada != "") {
            // Validación para que no se agregue una categoría con un producto o servicio igual a una categoría ingresada anteriormente
            var agregar = true;
            var validacionCategoriaMensaje = 0; //1 producto, 2 servicio, 3 paquete
            for (var i = 0; i < this.categoria.categoriasDelPersonal.length; i++) {

                for (var j = 0; j < this.categoria.categoriasDelPersonal[i].productos.length; j++) {
                    for (var k = 0; k < this.categoria.categoriaSeleccionada.productos.length; k++) {
                        if ((this.categoria.categoriasDelPersonal[i].productos[j].idProducto == this.categoria.categoriaSeleccionada.productos[k].idProducto)) {
                            agregar = false;
                            validacionCategoriaMensaje = 1;
                        }
                    }
                }

                for (var j = 0; j < this.categoria.categoriasDelPersonal[i].servicios.length; j++) {
                    for (var k = 0; k < this.categoria.categoriaSeleccionada.servicios.length; k++) {
                        if ((this.categoria.categoriasDelPersonal[i].servicios[j].idServicio == this.categoria.categoriaSeleccionada.servicios[k].idServicio)) {
                            agregar = false;
                            validacionCategoriaMensaje = 2;
                        }
                    }
                }

                for (var j = 0; j < this.categoria.categoriasDelPersonal[i].paquetes.length; j++) {
                    for (var k = 0; k < this.categoria.categoriaSeleccionada.paquetes.length; k++) {
                        if ((this.categoria.categoriasDelPersonal[i].paquetes[j].idPaqueteSucursal == this.categoria.categoriaSeleccionada.paquetes[k].idPaqueteSucursal)) {
                            agregar = false;
                            validacionCategoriaMensaje = 3;
                        }
                    }
                }

            }

            if (agregar) {
                this.categoria.categoriasDelPersonal.push(this.categoria.categoriaSeleccionada);
                for (var i = 0; i < this.categoria.dataCategoriasMostrar.length; i++) {
                    if (this.categoria.categoriaSeleccionada.idCategoria == this.categoria.dataCategoriasMostrar[i].idCategoria) {
                        this.categoria.dataCategoriasMostrar.splice(i, 1);
                        this.categoria.dataCategoriasMostrar = this.categoria.dataCategoriasMostrar.slice(); // Con el slice hace que se vea el cambio reflejado en [items]
                        i--;
                    }
                }
            }
            else {
                switch (validacionCategoriaMensaje) {
                    case 1:
                        this._toaster.error("La categoria ingresada ya contiene un producto ingresado con anterioridad al personal");
                        break;
                    case 2:
                        this._toaster.error("La categoria ingresada ya contiene un servicio ingresado con anterioridad al personal");
                        break;
                    case 3:
                        this._toaster.error("La categoria ingresada ya contiene un paquete ingresado con anterioridad al personal");
                        break;
                }
                this._toaster.error("No se puede agregar la categoría");
            }
            this.categoria.categoriaSeleccionada = "";
            $("#ddlCategoria > div:first-child").attr("style", "outline: none");
        }
        else {
            $("#ddlCategoria > div:first-child").attr("style", "outline: red solid 1px !important");
        }
    }

    verInfoCategoria(cat: any) {
        for (var i = 0; i < this.categoria.categoriasDelPersonal.length; i++) {
            this.categoria.categoriasDelPersonal[i].ver = false;
            if (cat.idCategoria == this.categoria.categoriasDelPersonal[i].idCategoria) {
                this.categoria.categoriasDelPersonal[i].ver = true;
            }
        }
    }

    eliminarCategoriaPersonal(cat: any) {
        for (var i = 0; i < this.categoria.categoriasDelPersonal.length; i++) {
            if (cat.idCategoria == this.categoria.categoriasDelPersonal[i].idCategoria) {
                this.categoria.categoriasDelPersonal.splice(i, 1);
            }
        }
        this.categoria.dataCategoriasMostrar = JSON.parse(JSON.stringify(this.categoria.dataCategorias));

        for (var i = 0; i < this.categoria.dataCategoriasMostrar.length; i++) {
            for (var j = 0; j < this.categoria.categoriasDelPersonal.length; j++) {
                if (this.categoria.dataCategoriasMostrar[i].idCategoria == this.categoria.categoriasDelPersonal[j].idCategoria) {
                    this.categoria.dataCategoriasMostrar.splice(i, 1);
                    i--;
                }
            }
        }
    }

    toState(state: any){
        this.rootScope_toState = state;
    }

    // --------------------------------------------- Función Principal -------------------------------------------
    consultarAccesosPersonal () {
        this._pantallaServicio.mostrarSpinner();
        this._backService.HttpPost("catalogos/configuracionPerfil/ConsultaVariblesSession", {}, {}).subscribe((response: string) => { 
            var dataTemp = eval(response);
            for (var i = 0; i < dataTemp.length; i++) {
                switch (dataTemp[i].Codigo) {
                    case 'PERSCAT002':
                        this.accesosPantalla.personal.categorias = dataTemp[i].Valor;
                        break;

                    case 'PERSCAT003':
                        this.accesosPantalla.personal.configuracionPersonal = dataTemp[i].Valor;
                        break;
                }
            }
            this.consultarPersonal();
        }, 
        (error) => {
            this._pantallaServicio.ocultarSpinner();
            if (error == 'SinSesion' || error == 'SesionCaducada') {
              if (error == 'SinSesion') {
                this._toaster.error(this.personalTranslate.favorIniciarSesion);
              }
              if (error == 'SesionCaducada') {
                this._toaster.error(this.personalTranslate.sesionCaducada);
              }
              this._router.navigate(['/login']);
              return;
            }
            this._toaster.error(this.personalTranslate.errorEliminar);
        });
    }

    //---------------------------------------- Función para Limpiar los campos de Personal --------------------------------------//
    limpiarcampos () {   
        $("#txtHoraFinLunes> div:first-child").attr("style", "outline: none");
        $("#txtHoraInicioLunes> div:first-child").attr("style", "outline: none");
        $("#txtHoraFinMartes> div:first-child").attr("style", "outline: none");
        $("#txtHoraInicioMartes> div:first-child").attr("style", "outline: none");
        $("#txtHoraFinMiercoles> div:first-child").attr("style", "outline: none");
        $("#txtHoraInicioMiercoles> div:first-child").attr("style", "outline: none");
        $("#txtHoraFinJueves> div:first-child").attr("style", "outline: none");
        $("#txtHoraInicioJueves> div:first-child").attr("style", "outline: none");
        $("#txtHoraFinViernes> div:first-child").attr("style", "outline: none");
        $("#txtHoraInicioViernes> div:first-child").attr("style", "outline: none");
        $("#txtHoraFinSabado> div:first-child").attr("style", "outline: none");
        $("#txtHoraInicioSabado> div:first-child").attr("style", "outline: none");
        $("#txtHoraFinDomingo> div:first-child").attr("style", "outline: none");
        $("#txtHoraInicioDomingo> div:first-child").attr("style", "outline: none");
    }

    validate(e: any) {
        var key;
        if (window.event) // IE
        {
            key = e.keyCode;
        }
        else if (e.which) // Netscape/Firefox/Opera
        {
            key = e.which;
        }
        if ((key < 46 || key > 57) || key == 47) {
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

    // Cargar la hora de los selects del horario
    cargarHorarioSelect() {
        const horaInicio = moment().startOf("day");
        const horaFin = moment().endOf("day");

        for (horaInicio; horaInicio < horaFin; horaInicio.add(15, "m")) {
            this.listarHora.push({ label: horaInicio.format("HH:mm"), value: horaInicio.format("HH:mm") });
        }
        this.listarHora.push({ label: moment().hour(23).minute(59).format("HH:mm"), value: moment().hour(23).minute(59).format("HH:mm") });
    }

    openImg() {
        $("#files").click();
    }
}