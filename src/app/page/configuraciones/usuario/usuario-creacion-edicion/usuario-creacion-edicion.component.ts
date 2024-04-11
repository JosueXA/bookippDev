import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MethodsService } from 'src/app/core/services/methods.service';
import { PantallaService } from 'src/app/core/services/pantalla.service';
import { ToasterService } from 'src/shared/toaster/toaster.service';
declare var $: any; // JQUERY
import * as bootstrap from 'bootstrap'; // BOOTSTRAP
import moment from 'moment';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material/icon';

@Component({
    selector: 'app-usuario-creacion-edicion',
    templateUrl: './usuario-creacion-edicion.component.html',
    styleUrls: ['./usuario-creacion-edicion.component.scss', '../../../page.component.scss']
})
export class UsuarioCreacionEdicionComponent implements OnInit {

    // Variables de Translate
    usuarioTranslate: any = {};

    // Modales
    modales: any = {};

    constructor(private _translate: TranslateService,
        private _backService: MethodsService,
        public _pantallaServicio: PantallaService,
        private _dialog: MatDialog,
        private _router: Router,
        private _toaster: ToasterService,
        private domSanitizer: DomSanitizer, 
        private matIconRegistry: MatIconRegistry,
        private _route: ActivatedRoute) {

        this._translate.setDefaultLang(this._pantallaServicio.idioma);
        this._translate.use(this._pantallaServicio.idioma);

        this._translate.get('usuarioTranslate').subscribe((translated) => {
            this.usuarioTranslate = this._translate.instant('usuarioTranslate');
        });

        this.matIconRegistry.addSvgIcon('iconCasa1', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Casa1-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconFlecha1DerechaPeque', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/FlechaDerechaPequena-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconCruzCirculo', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/10-2-TiposdeExcepcion-icon.svg"));
    }

    ngOnInit(): void {
        this._route.queryParams.subscribe(params => {
            this.usuario.idUsuarioConsultar = params["idUsuarioConsultar"];
            this.usuario.idUsuarioActualizar = params["idUsuarioActualizar"];
            this.usuario.esConsultaIndividual = params["esConsultaIndividual"] == "0" || params["esConsultaIndividual"] == "" ? false : true;
            // this.usuario.directoNuevo = this.usuario.idUsuarioActualizar == "0" ? true : false;
            this.usuario.directoNuevo = this.usuario.esConsultaIndividual;
            this.usuario.esActualizacion = Number(this.usuario.idUsuarioActualizar) > 0 ? true : false;
        });

        // if (document.getElementById("styleGeneral") != null)
        //     $("#styleGeneral").remove();
        // var style = document.createElement('style');
        // style.type = 'text/css';
        // style.id = 'styleGeneral';
        // style.innerHTML = ".popover-content {width: 260px !important;}.hideScroll .ngViewport{overflow-y:auto;overflow-x:hidden}.dropdown-menu{width:93.5%;font-size:13px;height:32px;text-align:-webkit-left}.component-button{background-color:#fff;width:100%;overflow:hidden;text-overflow:ellipsis}.buttonCell{padding-top:2px;padding-left:7px}.grid{width:100%;height:520px}.btn-info{color:#fff;background-color:#58CAA3;border-color:#58CAA3}.page-content{padding:20px 20px 0;padding-bottom:0;clear:both}.modal-footer{border-top:none!important}.breadcrumb{background:none;margin-bottom:0!important}";
        // document.getElementsByTagName('head')[0].appendChild(style);

        this.usuario_validarCheckboxes();
        this.usuario_cargarPerfiles();
        this.usuario_cargarSucursal();
        this.usuario_getTituloVista();
        this.usuario_validarPerfilUsuario();
        this.usuario_iniciarConfiguracion();

        this.crearModales();
    }

    crearModales() {

        if ($("body").find(".modal-alert").length > 1) {
            $("body").find(".modal-alert")[1].remove();
        }
        this.modales.modalAlert = new bootstrap.Modal($("#modal-alert").appendTo("body"), {
            backdrop: "static",
            keyboard: false,
        });

        if ($("body").find(".modal-alert-redir").length > 1) {
            $("body").find(".modal-alert-redir")[1].remove();
        }
        this.modales.modalAlertRedir = new bootstrap.Modal($("#modal-alert-redir").appendTo("body"), {
            backdrop: "static",
            keyboard: false,
        });

        if ($("body").find(".modal-discard").length > 1) {
            $("body").find(".modal-discard")[1].remove();
        }
        this.modales.modalDiscard = new bootstrap.Modal($("#modal-discard").appendTo("body"), {
            backdrop: "static",
            keyboard: false,
        });

        if ($("body").find(".modal-discard-home").length > 1) {
            $("body").find(".modal-discard-home")[1].remove();
        }
        this.modales.modalDiscardHome = new bootstrap.Modal($("#modal-discard-home").appendTo("body"), {
            backdrop: "static",
            keyboard: false,
        });

        if ($("body").find(".modal-cambio-contrasenia").length > 1) {
            $("body").find(".modal-cambio-contrasenia")[1].remove();
        }
        this.modales.modalCambioContrasenia = new bootstrap.Modal($("#modal-cambio-contrasenia").appendTo("body"), {
            backdrop: "static",
            keyboard: false,
        });

        if ($("body").find(".modal-cambio-contrasenia").length > 1) {
            $("body").find(".modal-cambio-contrasenia")[1].remove();
        }
        this.modales.modalCambioContrasenia = new bootstrap.Modal($("#modal-cambio-contrasenia").appendTo("body"), {
            backdrop: "static",
            keyboard: false,
        });

    }

    rootScope_fromState = "usuario";

    usuario: any = {
        desSelectPerfilSucursal: 0,
        idUsuarioActualizar: "",
        idUsuarioConsultar: "",
        // El stateParam "esConsultaIndividual" aquí se usa para saber cuando se llegó a la 
        // pantalla de nuevo usuario cuando no hay registros en la tabla de usuarios
        directoNuevo: null,
        esActualizacion: null,

        botonVolver: this.usuarioTranslate.regresar,
        tituloVista: "",
        asistente: true,
        asistente2: true,
        nombre: "",
        telefono: "",
        email: "",
        contrasenia: "",
        contraseniaConfirmarNuevo: "",
        idPerfil: 0,
        idSucursalSelect: 0,
        idPersonal: undefined,
        usuarioActual: 0,
        idSucursal: 0,
        idEmpresa: 0,
        isChatAdmin: false,
        isGerenteGral: false,
        isGerenteSuc: false,
        isAccesoAppNegocio: false,
        fechaActual: undefined,
        dataPerfiles: [],
        dataPersonal: [],
        emailExistente: false,

        errorNombre: '',
        errorTelefono: '',
        errorPerfil: '',
        errorEmail: '',
        errorContrasenia: '',
        esGerenteGeneral: false,
        esGerenteSucursal: false,
        correoVerificado: false,
        clicGuardar: false,
        clicGuardarModal: false,
        mostrarChecksResponsivos: false,
        // Variables necesarias para el cambio de contraseña
        contraseniaAnteriorIngresada: "",
        contraseniaAnteriorEncriptada: "",
        contraseniaNueva: "",
        contraseniaConfirmar: "",
        errorContraseniaActualModal: '',
        errorContraseniaNuevaModal: '',
        errorContraseniaConfirmarModal: '',
        contraseniasCoinciden: false,
        generalCheckDesactivado: false,
        ADMINISTRADOR: 1,
        EMPLEADO: 2,
        isSoloAgendas: false,
        isSoloAgendaSucursal: false,
        restringirHorario: false,
    };

    usuarioSinCambios: any = {};
    dataUsuario: any = [];

    paramsNotific8Alta = {
        life: 3000,
        theme: "lime",
        sticky: false
    };

    paramsNotific8Error = {
        life: 3000,
        theme: "ruby",
        sticky: false
    };

    // Estas dos funciones escuchan el evento de cambio de tamaño de la ventana, cambian los atributos de los checkbox para que se acomoden bien cuando el width es menor a 992px.
    // $(window).on("resize.doResize", function () {
    //     $scope.$apply(function () {

    //         $scope.usuario.mostrarChecksResponsivos = window.innerWidth < 992;

    //         if (window.innerWidth <= 1130 && window.innerWidth >= 992) {
    //             $("#contraseniaLabel").attr("style", "font-size: 10px;");
    //             $("#confirmarContraseniaLabel").attr("style", "font-size: 10px;");
    //         } else {
    //             $("#contraseniaLabel").attr("style", "");
    //             $("#confirmarContraseniaLabel").attr("style", "");
    //         }

    //         // Para los labels de gerente sucursal y general
    //         if ($scope.usuario.mostrarChecksResponsivos) {
    //             if (window.innerWidth <= 370) {
    //                 $("#labelGeneral").attr("style", "font-size: 13px; height: 38px; width: 10px; margin-top: -17px; padding-left: 0px;");
    //                 $("#labelSucursal").attr("style", "font-size: 13px; height: 38px; width: 10px; margin-top: -17px; padding-left: 0px;");
    //             } else {
    //                 $("#labelGeneral").attr("style", "font-size: 13px; height: 18px; margin-top: -17px; padding-left: 0px;");
    //                 $("#labelSucursal").attr("style", "font-size: 13px; height: 18px; margin-top: -17px; padding-left: 0px;");
    //             }
    //         }
    //     });
    // });
    // $scope.$on("$destroy", function () {
    //     $(window).off("resize.doResize"); //remove the handler added earlier
    // });

    // Esta función define qué checkboxes se mostrarán, dependiendo del tamaño de la ventana
    usuario_validarCheckboxes() {
        this.usuario.mostrarChecksResponsivos = window.innerWidth <= 992;

        if (window.innerWidth <= 1130 && window.innerWidth >= 992) {
            $("#contraseniaLabel").attr("style", "font-size: 10px;");
            $("#confirmarContraseniaLabel").attr("style", "font-size: 10px;");
        } else {
            $("#contraseniaLabel").attr("style", "");
            $("#confirmarContraseniaLabel").attr("style", "");
        }

        // Para los labels de gerente sucursal y general
        if (this.usuario.mostrarChecksResponsivos) {
            if (window.innerWidth <= 370) {
                $("#labelGeneral").attr("style", "font-size: 13px; height: 38px; width: 10px; margin-top: -17px; padding-left: 0px;");
                $("#labelSucursal").attr("style", "font-size: 13px; height: 38px; width: 10px; margin-top: -17px; padding-left: 0px;");
            } else {
                $("#labelGeneral").attr("style", "font-size: 13px; height: 18px; margin-top: -17px; padding-left: 0px;");
                $("#labelSucursal").attr("style", "font-size: 13px; height: 18px; margin-top: -17px; padding-left: 0px;");
            }
        }
    };

    // Esta función simula el click sobre el checkbox, al hacer click sobre el label, ya que se sobrepone el último sobre el primero
    usuario_clickSobreLabel(label: any) {
        switch (label) {
            case "chat":
                $('#chatAdminCheck').click();
                break;
            case "general":
                $('#generalCheck').click();
                break;
            case "sucursal":
                $('#sucursalCheck').click();
                break;
            case "accesoAppNegocio":
                $('#accesoAppNegocioCheck').click();
                break;
            default:
                break;
        }
    };

    accesoTotal: any;
    // Función que carga los id de perfiles de administrador o empleado
    usuario_cargarPerfiles() {

        this._backService.HttpPost("catalogos/Usuario/consultaPerfiles", {}, {}).subscribe((data: any) => {
            var datos = [];
            datos = eval(data);
            if (datos != null) {
                // El primer registro es el de administrador
                this.usuario.ADMINISTRADOR = datos[0].idPerfilSucursal;
                // El segundo es para empleado
                this.usuario.EMPLEADO = datos[1].idPerfilSucursal;
            }
        }, error => {

        });
    };

    // Función que determina el título de la vista y carga los datos del usuario si es el caso
    usuario_getTituloVista() {
        var esActualizacion = this.usuario.idUsuarioActualizar > 0;
        var esConsulta = false;
        var params: any = {};
        if (esActualizacion || esConsulta) {
            
            params.idUsuarioSucursal = esActualizacion ? this.usuario.idUsuarioActualizar : (esConsulta ? this.usuario.idUsuarioConsultar : 0);
            this._backService.HttpPost("catalogos/Usuario/consultaUsuario", {}, params).subscribe((data: any) => {
                if (eval(data)) {
                    var registroUsuario = eval(data)[0];
                    this.dataUsuario = eval(data);
                    this.usuario.nombre = registroUsuario.nombre != null ? registroUsuario.nombre : "";
                    this.usuario.telefono = registroUsuario.telefono != null ? registroUsuario.telefono : "";
                    this.usuario.email = registroUsuario.email != null ? registroUsuario.email : "";
                    this.usuario.contrasenia = esActualizacion ? "" : registroUsuario.contrasenia;
                    this.usuario.contraseniaAnteriorEncriptada = registroUsuario.contrasenia;
                    this.usuario.idPerfil = registroUsuario.perfil;
                    this.usuario.idPerfilSucursal = registroUsuario.perfil;
                    this.usuario.idPersonal = registroUsuario.idPersonal != null ? registroUsuario.idPersonal : undefined;
                    this.usuario.idSucursal = registroUsuario.idSucursal;
                    this.usuario.idEmpresa = registroUsuario.idEmpresa;
                    this.usuario.isChatAdmin = registroUsuario.isChatAdmin;
                    this.usuario.isGerenteGral = registroUsuario.isGerenteGeneral;
                    this.usuario.isGerenteSuc = registroUsuario.isGerenteSucursal;
                    this.usuario.isAccesoAppNegocio = (registroUsuario.isAccesoAppNegocio == null) ? false : registroUsuario.isAccesoAppNegocio;
                    this.usuario.isSoloAgendas = (registroUsuario.isSoloAgendas == null) ? false : registroUsuario.isSoloAgendas;
                    this.usuario.isSoloAgendaSucursal = (registroUsuario.isSoloAgendaSucursal == null) ? false : registroUsuario.isSoloAgendaSucursal;
                    var restringcion = (registroUsuario.isHorarioRestringido == null) ? 0 : registroUsuario.isHorarioRestringido;

                    if (registroUsuario.id == registroUsuario.isAdminSurcursal) {
                        this.usuario.desSelectPerfilSucursal = 1;

                    }
                    this.usuario.restringirHorario = restringcion;
                    this.usuario.horaInicio = registroUsuario.horaInicio;
                    this.usuario.horaFin = registroUsuario.horaFinal;
                    JSON.parse(JSON.stringify(this.usuario, this.usuarioSinCambios));
                    if (this.usuario.isGerenteGral || this.usuario.isGerenteSuc) {
                        this.usuario.asistente = false;
                    }
                }
            }, error => {

            });          
        }
        esActualizacion ? this.usuario.tituloVista = this.usuarioTranslate.actualizar : (esConsulta ? this.usuario.tituloVista = this.usuarioTranslate.consultaIndividual : this.usuario.tituloVista = this.usuarioTranslate.nuevo);
    };

    // Función que limpia los campos
    usuario_limpiarCampos() {
        this.usuario.nombre = "";
        this.usuario.telefono = "";
        this.usuario.email = "";
        this.usuario.contrasenia = "";
        this.usuario.isChatAdmin = false;
        this.usuario.isGerenteGral = false;
        this.usuario.isGerenteSuc = false;
        this.usuario.isAccesoAppNegocio = false;
        this.usuario.desSelectPerfilSucursal = 0;
        // $location.$$search = {};
    };

    // Función que inicializa la fecha actual
    usuario_obtenerFechaActual() {
        var today = new Date();
        var dd: any = today.getDate();
        var mm: any = today.getMonth();
        var yyyy = today.getFullYear();
        if (dd < 10) {
            dd = '0' + dd
        }
        if (mm < 10) {
            mm = '0' + mm
        }
        today = new Date(yyyy, mm, dd);
        this.usuario.fechaActual = today;
    };

    // Función que inicia la pantalla
    usuario_iniciarPantalla() {
        this._router.navigate(["/usuario"]);
    };

    // Función que muestra el mensaje correspondiente al cancelar la operación
    usuario_cancelar() {
        this.usuarioSinCambios.nombre = this.usuarioSinCambios.nombre == undefined || this.usuarioSinCambios.nombre == null ? "" : this.usuarioSinCambios.nombre;
        this.usuarioSinCambios.telefono = this.usuarioSinCambios.telefono == undefined || this.usuarioSinCambios.telefono == null ? "" : this.usuarioSinCambios.telefono;
        this.usuarioSinCambios.email = this.usuarioSinCambios.email == undefined || this.usuarioSinCambios.email == null ? "" : this.usuarioSinCambios.email;

        this.usuarioSinCambios.isChatAdmin = this.usuarioSinCambios.isChatAdmin == undefined || this.usuarioSinCambios.isChatAdmin == null ? false : this.usuarioSinCambios.isChatAdmin;
        this.usuarioSinCambios.isGerenteGral = this.usuarioSinCambios.isGerenteGral == undefined || this.usuarioSinCambios.isGerenteGral == null ? false : this.usuarioSinCambios.isGerenteGral;
        this.usuarioSinCambios.isGerenteSuc = this.usuarioSinCambios.isGerenteSuc == undefined || this.usuarioSinCambios.isGerenteSuc == null ? false : this.usuarioSinCambios.isGerenteSuc;
        this.usuarioSinCambios.isAccesoAppNegocio = this.usuarioSinCambios.isAccesoAppNegocio == undefined || this.usuarioSinCambios.isAccesoAppNegocio == null ? false : this.usuarioSinCambios.isAccesoAppNegocio;

        var sinCambios = this.usuario.nombre == this.usuarioSinCambios.nombre &&
            this.usuario.telefono == this.usuarioSinCambios.telefono &&
            this.usuario.email == this.usuarioSinCambios.email &&
            this.usuario.isChatAdmin == this.usuarioSinCambios.isChatAdmin &&
            this.usuario.isGerenteGral == this.usuarioSinCambios.isGerenteGral &&
            this.usuario.isGerenteSuc == this.usuarioSinCambios.isGerenteSuc &&
            this.usuario.isAccesoAppNegocio == this.usuarioSinCambios.isAccesoAppNegocio;

        if (sinCambios) {
            this.usuario_limpiarCampos();
            this._router.navigate(["/configuraciones/consultaUsuario"]);
        } else {
            this.modalDiscard(this.usuarioTranslate.deseaDescartar);
        }
    };

    // Función que muestra el mensaje correspondiente al cancelar la operación, redireccionando a home
    usuario_cancelarHome() {
        this.usuarioSinCambios.nombre = this.usuarioSinCambios.nombre == undefined || this.usuarioSinCambios.nombre == null ? "" : this.usuarioSinCambios.nombre;
        this.usuarioSinCambios.telefono = this.usuarioSinCambios.telefono == undefined || this.usuarioSinCambios.telefono == null ? "" : this.usuarioSinCambios.telefono;
        this.usuarioSinCambios.email = this.usuarioSinCambios.email == undefined || this.usuarioSinCambios.email == null ? "" : this.usuarioSinCambios.email;
        this.usuarioSinCambios.contrasenia = this.usuarioSinCambios.contrasenia == undefined || this.usuarioSinCambios.contrasenia == null ? "" : this.usuarioSinCambios.contrasenia;
        this.usuarioSinCambios.isChatAdmin = this.usuarioSinCambios.isChatAdmin == undefined || this.usuarioSinCambios.isChatAdmin == null ? false : this.usuarioSinCambios.isChatAdmin;
        this.usuarioSinCambios.isGerenteGral = this.usuarioSinCambios.isGerenteGral == undefined || this.usuarioSinCambios.isGerenteGral == null ? false : this.usuarioSinCambios.isGerenteGral;
        this.usuarioSinCambios.isGerenteSuc = this.usuarioSinCambios.isGerenteSuc == undefined || this.usuarioSinCambios.isGerenteSuc == null ? false : this.usuarioSinCambios.isGerenteSuc;
        this.usuarioSinCambios.isAccesoAppNegocio = this.usuarioSinCambios.isAccesoAppNegocio == undefined || this.usuarioSinCambios.isAccesoAppNegocio == null ? false : this.usuarioSinCambios.isAccesoAppNegocio;

        var sinCambios = this.usuario.nombre == this.usuarioSinCambios.nombre &&
            this.usuario.telefono == this.usuarioSinCambios.telefono &&
            this.usuario.email == this.usuarioSinCambios.email &&
            this.usuario.contrasenia == this.usuarioSinCambios.contrasenia &&
            this.usuario.isChatAdmin == this.usuarioSinCambios.isChatAdmin &&
            this.usuario.isGerenteGral == this.usuarioSinCambios.isGerenteGral &&
            this.usuario.isGerenteSuc == this.usuarioSinCambios.isGerenteSuc
        this.usuario.isAccesoAppNegocio == this.usuarioSinCambios.isAccesoAppNegocio;

        if (sinCambios) {
            this.usuario_limpiarCampos();
            this._router.navigate(["/home"]);
        } else {
            this.modalDiscardHome(this.usuarioTranslate.deseaDescartar);
        }
    };

    // Función que valida los campos ingresados antes de enviarlos al fc, muestra el mensaje de error correspondiente y devuelve el booleano resultado de la validación
    usuario_validarCampos(params: any) {
        var cantidadCamposInvalidos = 0;
        var validaciones: any = [];
        var NOMBRE = 0, APELLIDO = 1, TELEFONO = 2, EMAIL = 3, CONTRASENIA = 4, PERFIL = 5;

        var regexNombreApellido = RegExp("^[a-zA-Z áéíóúñÁÉÍÓÚÑüÜ\s]*$");
        var regexTelefono = new RegExp("^(\\(\\d{2}\\)|\\d{2})?-?(\\d{2})?-?\\d{2}-?\\d{2}-?\\d{2}-?\\d{2}$");
        var regexMovil = new RegExp("^(\\(\\d{3}\\)|\\d{3})?-?((\\d{3}-?\\d{3}-?\\d{2}-?\\d{2})|(\\d{2}-?\\d{2}-?\\d{2}-?\\d{2}-?\\d{2}))$");
        var regexEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        var regexContrasenia = /(?=^.{6,40}$)(?=.*\d)(?![.\n])(?=.*[A-Za-z]).*$/;

        validaciones[NOMBRE] = {};
        validaciones[NOMBRE].valido = regexNombreApellido.test(params.nombre);
        validaciones[NOMBRE].vacio = params.nombre === undefined || params.nombre === "";
        validaciones[NOMBRE].campo = "nombre";

        validaciones[TELEFONO] = {};
        validaciones[TELEFONO].valido = regexTelefono.test(params.telefono) || regexMovil.test(params.telefono);
        validaciones[TELEFONO].vacio = params.telefono === undefined || params.telefono === "";
        validaciones[TELEFONO].campo = "teléfono";

        validaciones[EMAIL] = {};
        validaciones[EMAIL].valido = regexEmail.test(params.email);
        validaciones[EMAIL].vacio = params.email === undefined || params.email === "";
        validaciones[EMAIL].campo = "email";

        validaciones[CONTRASENIA] = {};
        validaciones[CONTRASENIA].valido = regexContrasenia.test(params.contrasenia) || this.usuario.esActualizacion;
        validaciones[CONTRASENIA].vacio = (params.contrasenia === undefined || params.contrasenia === "") && !this.usuario.esActualizacion;
        validaciones[CONTRASENIA].campo = "contraseña";

        validaciones[PERFIL] = {};
        validaciones[PERFIL].valido = params.idPerfil != 0;
        validaciones[PERFIL].vacio = params.idPerfil === undefined || params.idPerfil === "" || params.idPerfil == 0;
        validaciones[PERFIL].campo = "perfil";

        // Se validan los campos uno a uno, los mensajes se muestran y se colorean los bordes.
        // ---- Nombre
        if (validaciones[NOMBRE].vacio) {
            this.usuario.errorNombre = ' ';
            $("#nombreInput").addClass("errorCampo");
            cantidadCamposInvalidos++;
        } else {
            if (!validaciones[NOMBRE].valido) {
                this.usuario.errorNombre = this.usuarioTranslate.formatoNombre;
                $("#nombreInput").addClass("errorCampo");
                cantidadCamposInvalidos++;
            } else {
                this.usuario.errorNombre = '';
                $("#nombreInput").removeClass("errorCampo");
            }
        }
        // ---- Teléfono
        if (validaciones[TELEFONO].vacio) {
            this.usuario.errorTelefono = ' ';
            $("#telefonoInput").addClass("errorCampo");
            cantidadCamposInvalidos++;
        } else {
            if (!validaciones[TELEFONO].valido) {
                this.usuario.errorTelefono = this.usuarioTranslate.formatoTelefono;
                $("#telefonoInput").addClass("errorCampo");
                cantidadCamposInvalidos++;
            } else {
                this.usuario.errorTelefono = '';
                $("#telefonoInput").removeClass("errorCampo");
            }
        }
        // ---- Email
        if (validaciones[EMAIL].vacio) {
            this.usuario.errorEmail = ' ';
            $("#emailInput").addClass("errorCampo");
            cantidadCamposInvalidos++;
        } else {
            if (!validaciones[EMAIL].valido) {
                this.usuario.errorEmail = this.usuarioTranslate.formatoEmail;
                $("#emailInput").addClass("errorCampo");
                cantidadCamposInvalidos++;
            } else {
                this.usuario.errorEmail = '';
                $("#emailInput").removeClass("errorCampo");
            }
        }
        // ---- Contrasenia
        if (!this.usuario.esActualizacion) {
            if (params.contrasenia == this.usuario.contraseniaConfirmarNuevo) {
                if (validaciones[CONTRASENIA].vacio) {
                    this.usuario.errorContrasenia = ' ';
                    $('#contraseniaInput').addClass("errorCampo");
                    cantidadCamposInvalidos++;
                } else {
                    if (!validaciones[CONTRASENIA].valido) {
                        this.usuario.errorContrasenia = this.usuarioTranslate.formatoContrasenia;
                        $('#contraseniaInput').addClass("errorCampo");
                        cantidadCamposInvalidos++;
                    } else {
                        this.usuario.errorContrasenia = '';
                        if (!this.usuario.esActualizacion) {
                            $('#contraseniaInput').removeClass("errorCampo");
                            $('#contraseniaConfirmInput').removeClass("errorCampo");
                        }
                    }
                }
            } else {
                this.usuario.errorContrasenia = this.usuarioTranslate.contraseniasCoincidir;
                $('#contraseniaInput').addClass("errorCampo");
                $('#contraseniaConfirmInput').addClass("errorCampo");
                cantidadCamposInvalidos++;
            }
        }

        //Validaciones Configuracion 
        if (this.usuario.idPerfilSucursal == undefined || this.usuario.idPerfilSucursal == "" || this.usuario.idPerfilSucursal == null) {
            cantidadCamposInvalidos++;
            // $('#slctPerfilUsuarios').addClass("errorCampo");
            $("#slctPerfilUsuarios > div:first-child").attr("style", "outline: red solid 1px !important;");
        }

        if (this.usuario.validacionHorario != 1) {
            cantidadCamposInvalidos++;
        }

        return cantidadCamposInvalidos == 0;
    };

    // Función que valida el email para la operación guardar
    usuario_validarEmailGuardar() {
        var campos: any = {};
        campos.nombre = this.usuario.nombre;
        campos.telefono = this.usuario.telefono;
        campos.contrasenia = this.usuario.contrasenia;
        campos.email = this.usuario.email;
        campos.idPerfil = this.usuario.idPerfil;
        campos.isChat = this.usuario.isChatAdmin;
        campos.isGerenteGeneral = this.usuario.isGerenteGral;
        campos.isGerenteSucursal = this.usuario.isGerenteSuc;
        campos.isAccesoAppNegocio = this.usuario.isAccesoAppNegocio;

        var params: any = {};
        params.email = this.usuario.email;

        this._backService.HttpPost("catalogos/Usuario/validarEmail", {}, params).subscribe((data: any) => {
            if (eval(data)) {
                var registros = eval(data);
                if (registros != undefined || registros != null) {
                    if (registros.length > 0) {
                        this.usuario_validarCampos(campos);
                        if (this.usuario.email != "") {
                            this.usuario.errorEmail = this.usuarioTranslate.emailEnUso;
                        }
                        $("#emailInput").addClass("errorCampo");
                    } else {
                        this.usuario.errorEmail = '';
                        this.usuario_guardarUsuario();
                    }
                }
            }
        }, error => {

        });
    };

    // Función que valida el email para la operación actualizar
    usuario_validarEmailActualizar() {
        var campos: any = {};
        campos.nombre = this.usuario.nombre;
        campos.telefono = this.usuario.telefono;
        campos.contrasenia = this.usuario.contrasenia;
        campos.email = this.usuario.email;
        campos.idPerfil = this.usuario.idPerfil;
        campos.isChat = this.usuario.isChatAdmin;
        campos.isGerenteGeneral = this.usuario.isGerenteGral;
        campos.isGerenteSucursal = this.usuario.isGerenteSuc;
        campos.isAccesoAppNegocio = this.usuario.isAccesoAppNegocio;

        var params: any = {};
        params.email = this.usuario.email;

        this._backService.HttpPost("catalogos/Usuario/validarEmail", {}, params).subscribe((data: any) => {
            if (eval(data)) {
                var registros = eval(data);
                if (registros != undefined || registros != null) {
                    // Se recorre el arreglo de registros, se elimina el 
                    // registro del email asociado al id del usuario a actualizar
                    // para evitar problemas al realizar el cambio.
                    for (var i = 0; i < registros.length; i++) {
                        if (registros[i].idUsuarioSucursal == this.usuario.idUsuarioActualizar) {
                            registros.splice(i, 1);
                        }
                    }
                    // Se actualiza el usuario si el arreglo de registros quedó vacío
                    if (registros.length > 0) {
                        this.usuario_validarCampos(campos);
                        if (this.usuario.email != "") {
                            this.usuario.errorEmail = this.usuarioTranslate.emailEnUso;
                        }
                        $("#emailInput").addClass("errorCampo");
                    } else {
                        this.usuario.errorEmail = '';
                        this.usuario_actualizarUsuario();
                    }
                }
            }
        }, error => {

        });
    };

    // Carga la lista de sucursales para el dropdown del campo Sucursal
    usuario_cargarSucursales() {
        this._backService.HttpPost("catalogos/Sucursal/consultaSucursal", {}, {}).subscribe((data: any) => {
            this.usuario.dataSucursales = eval(data);
            if (this.usuario.dataSucursales != null) {
                this.usuario.idSucursalSelect = this.usuario.dataSucursales[0].idSucursal;
                this.usuario_cargarPersonal();
            } else {
                this.modalAlert(this.usuarioTranslate.noSucursales);
            }
        }, error => {

        });
    };

    // Función que carga el idSucursal de la sesión
    usuario_cargarSucursal() {
        this._backService.HttpPost("catalogos/Usuario/cargarSucursal", {}, {}).subscribe((data: any) => {
            var dato = eval(data);
            if (dato != null) {
                this.usuario.idSucursal = dato;
                this.usuario_cargarPersonal();
            }
        }, error => {

        });
    };

    // Función que valida el perfil del usuario, si es gerente sucursal se deshabilita el checkbox de gerente general
    usuario_validarPerfilUsuarioGerenteSucursal() {
        var params: any = {};
        params.validarGteSuc = 1;
        this._backService.HttpPost("catalogos/Usuario/validarPerfilUsuario", {}, params).subscribe((data: any) => {
            var response = [];
            response = eval(data);
            this.usuario.esGerenteSucursal = response[0];
            if (response != null) {
                if (this.usuario.esGerenteSucursal == 0) {
                    this.usuario.generalCheckDesactivado = false;
                } else {
                    this.usuario.generalCheckDesactivado = this.usuario.esGerenteGeneral != 1;
                }
            }
        }, error => {

        });
    };

    // Función que valida el perfil del usuario, si es gerente general se habilita el campo sucursal
    usuario_validarPerfilUsuario() {
        var params: any = {};
        params.validarGteSuc = 0;
        this._backService.HttpPost("catalogos/Usuario/validarPerfilUsuario", {}, params).subscribe((data: any) => {
            var response = [];
            response = eval(data);
            this.usuario.esGerenteGeneral = response[0];
            this.usuario.correoVerificado = response[2];
            this.usuario_validarPerfilUsuarioGerenteSucursal();
        }, error => {

        });
    };

    // Función que carga los datos de personal según la sucursal seleccionada
    usuario_cargarPersonal() {
        var params: any = {};
        params.idSucursal = this.usuario.idSucursal;
        params.idUsuarioSucursal = this.usuario.esActualizacion ? this.usuario.idUsuarioActualizar : 0;
        this._backService.HttpPost("catalogos/Usuario/consultaPersonal", {}, params).subscribe((data: any) => {
            this.usuario.dataPersonal = eval(data);
        }, error => {

        });
    };

    // Se cargan el nombre, el teléfono y el email según el personal seleccionado
    usuario_cargarDatosPersonal() {
        if (this.usuario.idPersonal == 0 || this.usuario.idPersonal == undefined || this.usuario.idPersonal == null) {
            this.usuario.nombre = "";
            this.usuario.telefono = "";
            this.usuario.email = "";

        } else {

            for (var i = 0; i < this.usuario.dataPersonal.length; i++) {
                if (this.usuario.dataPersonal[i].idPersonal == this.usuario.idPersonal) {
                    this.usuario.nombre = this.usuario.dataPersonal[i].nombre;
                    $("#nombreInput").removeClass("errorCampo");
                    this.usuario.telefono = this.usuario.dataPersonal[i].telefono;
                    $("#telefonoInput").removeClass("errorCampo");
                    this.usuario.email = this.usuario.dataPersonal[i].email;
                    $("#emailInput").removeClass("errorCampo");

                }
            }
        }
    };

    // Función que guarda el usuario usando los valores de los campos como parámetros
    usuario_guardarUsuario() {
        this.usuario.clicGuardar = true;

        var params: any = {};
        params.validarGteSuc = 0;
        this._backService.HttpPost("catalogos/Usuario/validarPerfilUsuario", {}, params).subscribe((data: any) => {
            var response = [];
            response = eval(data);
            this.usuario.esGerenteGeneral = response[0];
            this.usuario.correoVerificado = response[2];

            var params: any = {};
            params.validarGteSuc = 1;

            this._backService.HttpPost("catalogos/Usuario/validarPerfilUsuario", {}, params).subscribe((data: any) => {
                var response = [];
                response = eval(data);
                this.usuario.esGerenteSucursal = response[0];
                if (response != null) {
                    if (this.usuario.esGerenteSucursal == 0) {
                        this.usuario.generalCheckDesactivado = false;
                    } else {
                        this.usuario.generalCheckDesactivado = this.usuario.esGerenteGeneral != 1;
                    }
                }
            }, error => {

            });

            // Se realiza el guardado del usuario
            var params: any = {};
            params.nombre = this.usuario.nombre;
            params.telefono = this.usuario.telefono;
            params.contrasenia = this.usuario.contrasenia;
            params.email = this.usuario.email;
            // Se define qué perfil tiene el usuario a guardar
            if (this.usuario.isGerenteGral || this.usuario.isGerenteSuc) {
                this.usuario.idPerfil = this.usuario.ADMINISTRADOR;
            } else {
                this.usuario.idPerfil = this.usuario.EMPLEADO;
            }
            params.idPerfil = this.usuario.idPerfilSucursal;
            params.isChat = this.usuario.isChatAdmin;
            params.isGerenteGeneral = this.usuario.isGerenteGral;
            params.isGerenteSucursal = this.usuario.isGerenteSuc;
            params.isAccesoAppNegocio = this.usuario.isAccesoAppNegocio;
            params.idSucursal = this.usuario.idSucursal;
            params.idPersonal = (this.usuario.idPersonal == undefined || this.usuario.idPersonal == null) ? 0 : this.usuario.idPersonal;
            // Se obtiene la fecha actual
            this.usuario_obtenerFechaActual();
            params.fechaAlta = this.usuario.fechaActual;

            params.isSoloAgendas = this.usuario.isSoloAgendas;
            params.isSoloAgendaSucursal = this.usuario.isSoloAgendaSucursal;
            params.restringirHorario = this.usuario.restringirHorario == 1 ? true : false;
            if (params.restringirHorario == true) {
                params.horaInicio = this.usuario.horaInicio;
                params.horaFin = this.usuario.horaFin;
            } else {
                params.horaInicio = null;
                params.horaFin = null;
            }

            if (this.usuario.correoVerificado) {
                if (this.usuario_validarCampos(params)) {
                    this._backService.HttpPost("catalogos/Usuario/guardarUsuario", {}, params).subscribe((data: any) => {
                        this._router.navigate(['/configuraciones/consultaUsuario']);
                    }, error => {

                    });
                }
            } else {
                this.modalAlert(this.usuarioTranslate.paraAgregar);
            }
        }, error => {

        });
    };

    // Función que actualiza el usuario usando los valores de los campos como parámetros
    usuario_actualizarUsuario() {
        this.usuario.clicGuardar = true;

        var params: any = {};
        params.validarGteSuc = 0;

        this._backService.HttpPost("catalogos/Usuario/validarPerfilUsuario", {}, params).subscribe((data: any) => {
            var response = [];
            response = eval(data);
            this.usuario.esGerenteGeneral = response[0];
            this.usuario.correoVerificado = response[2];

            var params: any = {};
            params.validarGteSuc = 1;
            this._backService.HttpPost("catalogos/Usuario/validarPerfilUsuario", {}, params).subscribe((data: any) => {
                var response = [];
                response = eval(data);
                this.usuario.esGerenteSucursal = response[0];
                if (response != null) {
                    if (this.usuario.esGerenteSucursal == 0) {
                        this.usuario.generalCheckDesactivado = false;
                    } else {
                        this.usuario.generalCheckDesactivado = this.usuario.esGerenteGeneral != 1;
                    }
                }
            }, error => {

            });

            // Se realiza el update del usuario
            var params: any = {};
            params.idUsuarioSucursal = this.usuario.idUsuarioActualizar;
            params.nombre = this.usuario.nombre;
            params.telefono = this.usuario.telefono;
            params.contrasenia = this.usuario.contrasenia;
            params.email = this.usuario.email;
            // Se define qué perfil tiene el usuario a guardar
            if (this.usuario.isGerenteGral || this.usuario.isGerenteSuc) {
                this.usuario.idPerfil = this.usuario.ADMINISTRADOR;
            } else {
                this.usuario.idPerfil = this.usuario.EMPLEADO;
            }
            params.idPerfil = this.usuario.idPerfilSucursal;
            params.isChat = this.usuario.isChatAdmin;
            params.isGerenteGeneral = this.usuario.isGerenteGral;
            params.isGerenteSucursal = this.usuario.isGerenteSuc;
            params.isAccesoAppNegocio = this.usuario.isAccesoAppNegocio;
            params.idSucursal = this.usuario.idSucursal;
            params.idPersonal = (this.usuario.idPersonal == undefined || this.usuario.idPersonal == null) ? 0 : this.usuario.idPersonal;
            // Se obtiene la fecha actual
            this.usuario_obtenerFechaActual();
            params.fechaCambio = this.usuario.fechaActual;

            params.isSoloAgendas = this.usuario.isSoloAgendas;
            params.isSoloAgendaSucursal = this.usuario.isSoloAgendaSucursal;
            params.restringirHorario = (this.usuario.restringirHorario == 1) ? true : false;
            if (params.restringirHorario == true) {
                params.horaInicio = this.usuario.horaInicio;
                params.horaFin = this.usuario.horaFin;
            } else {
                params.horaInicio = null;
                params.horaFin = null;
            }

            if (this.usuario.correoVerificado) {
                if (this.usuario_validarCampos(params)) {
                    this._backService.HttpPost("catalogos/Usuario/actualizarUsuario", {}, params).subscribe((data: any) => {
                        this._router.navigate(['/configuraciones/consultaUsuario'])
                    }, error => {

                    });
                }
            } else {
                this.modalAlert(this.usuarioTranslate.paraModificar);
            }
        }, error => {

        });
    };

    // Función que actualiza el password del usuario usando los valores de los campos como parámetros
    usuario_actualizarUsuarioPassword() {
        var params: any = {};
        params.idUsuarioSucursal = this.usuario.idUsuarioActualizar;
        params.contrasenia = this.usuario.contrasenia;

        this._backService.HttpPost("catalogos/Usuario/actualizarUsuarioPassword", {}, params).subscribe((data: any) => {
            this._toaster.success("La contraseña se actualizó exitosamente");
        }, error => {
            this._router.navigate(['/login']);
        });
    };

    // Función que determina qué función ejecutar si se oprime el botón guardar
    usuario_realizarOperacion() {
        if (this.usuario.idUsuarioActualizar == 0) {
            this.usuario_validarEmailGuardar();
        } else {
            this.usuario_validarEmailActualizar();
        }
    };

    // Función que se ejecuta al dar aceptar en el mensaje de confirmación para descartar los cambios hechos en el formulario
    usuario_descartarCambios() {
        this.usuario_limpiarCampos();
        this._router.navigate(["/configuraciones/consultaUsuario"]);
    };

    // Función que se ejecuta al dar aceptar en el mensaje de confirmación para descartar los cambios hechos en el formulario, yendo a home
    usuario_descartarCambiosHome() {
        this.usuario_limpiarCampos();
        this._router.navigate(["/home"]);
    };

    // Función que cambia el color del borde del componente al default si se hace focus en él, recibe el id del componente
    usuario_cambiarColorBorde(idComponente: any, campo: any) {
        switch (campo) {
            case 'nombre':
                if (this.usuario.errorNombre != '' && this.usuario.errorNombre != ' ') {
                    $("#" + idComponente).addClass("errorCampo");
                } else {
                    $("#" + idComponente).removeClass("errorCampo");
                }
                break;
            case 'email':
                if (this.usuario.errorEmail != '' && this.usuario.errorEmail != ' ') {
                    $("#" + idComponente).addClass("errorCampo");
                } else {
                    $("#" + idComponente).removeClass("errorCampo");
                }
                break;
            case 'telefono':
                if (this.usuario.errorTelefono != '' && this.usuario.errorTelefono != ' ') {
                    $("#" + idComponente).addClass("errorCampo");
                } else {
                    $("#" + idComponente).removeClass("errorCampo");
                }
                break;
            case 'contrasenia':
                if (this.usuario.errorContrasenia != '' && this.usuario.errorContrasenia != ' ') {
                    $("#" + idComponente).addClass("errorCampo");
                } else {
                    $("#" + idComponente).removeClass("errorCampo");
                }
                break;
            case 'contraseniaActual':
                if (this.usuario.errorContraseniaActualModal != '' && this.usuario.errorContraseniaActualModal != ' ') {
                    $("#" + idComponente).addClass("errorCampo");
                } else {
                    $("#" + idComponente).removeClass("errorCampo");
                }
                break;
            case 'contraseniaNueva':
                if (this.usuario.errorContraseniaNuevaModal != '' && this.usuario.errorContraseniaNuevaModal != ' ') {
                    $("#" + idComponente).addClass("errorCampo");
                } else {
                    $("#" + idComponente).removeClass("errorCampo");
                }
                break;
            case 'contraseniaConfirmar':
                if (this.usuario.errorContraseniaConfirmarModal != '' && this.usuario.errorContraseniaConfirmarModal != ' ') {
                    $("#" + idComponente).addClass("errorCampo");
                } else {
                    $("#" + idComponente).removeClass("errorCampo");
                }
                break;
            default:
                break;
        }

        if (idComponente == 'perfilInput') {
            $("#" + idComponente).css("outline", "1px solid #e5e5e5");
        }
    };

    // Función que valida el campo en cuestión cuando pierde el focus, si es incorrecto lo deja en rojo, si no lo cambia a #e5e5e5
    usuario_cambiarColorBlur(campo: any, idComponente: any) {
        var validaciones: any = [];
        var NOMBRE = 0, APELLIDO = 1, TELEFONO = 2, EMAIL = 3, CONTRASENIA = 4, PERFIL = 5, CONTRASENIA_A = 6, CONTRASENIA_N = 7, CONTRASENIA_C = 8;

        var regexNombreApellido = /^[A-Za-z\s]{1,}[\.]{0,1}[A-Za-z\s]{0,}$/;
        var regexTelefono = new RegExp("^(\\(\\d{2}\\)|\\d{2})?-?(\\d{2})?-?\\d{2}-?\\d{2}-?\\d{2}-?\\d{2}$");
        var regexMovil = new RegExp("^(\\(\\d{3}\\)|\\d{3})?-?((\\d{3}-?\\d{3}-?\\d{2}-?\\d{2})|(\\d{2}-?\\d{2}-?\\d{2}-?\\d{2}-?\\d{2}))$");
        var regexEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        var regexContrasenia = /(?=^.{6,40}$)(?=.*\d)(?![.\n])(?=.*[A-Za-z]).*$/; // /^(?=.*[0-9])(?=.*)[a-zA-Z0-9*]{6,40}$/;

        if (this.usuario.clicGuardar) {
            switch (campo) {
                case 'nombre':
                    validaciones[NOMBRE] = {};
                    validaciones[NOMBRE].valido = regexNombreApellido.test(this.usuario.nombre);
                    validaciones[NOMBRE].vacio = this.usuario.nombre === undefined || this.usuario.nombre === "";
                    if (validaciones[NOMBRE].vacio) {
                        $("#" + idComponente).addClass("errorCampo");
                    } else {
                        if (this.usuario.errorNombre != '' && this.usuario.errorNombre != ' ') {
                            $("#" + idComponente).addClass("errorCampo");
                        } else {
                            $("#" + idComponente).removeClass("errorCampo");
                        }
                    }
                    break;
                case 'telefono':
                    validaciones[TELEFONO] = {};
                    validaciones[TELEFONO].valido = regexTelefono.test(this.usuario.telefono) || regexMovil.test(this.usuario.telefono);
                    validaciones[TELEFONO].vacio = this.usuario.telefono === undefined || this.usuario.telefono === "";
                    if (validaciones[TELEFONO].vacio) {
                        $("#" + idComponente).addClass("errorCampo");
                    } else {
                        if (this.usuario.errorTelefono != '' && this.usuario.errorTelefono != ' ') {
                            $("#" + idComponente).addClass("errorCampo");
                        } else {
                            $("#" + idComponente).removeClass("errorCampo");
                        }
                    }
                    break;
                case 'email':
                    validaciones[EMAIL] = {};
                    validaciones[EMAIL].valido = regexEmail.test(this.usuario.email);
                    validaciones[EMAIL].vacio = this.usuario.email === undefined || this.usuario.email === "";
                    if (validaciones[EMAIL].vacio) {
                        $("#" + idComponente).addClass("errorCampo");
                    } else {
                        if (this.usuario.errorEmail != '' && this.usuario.errorEmail != ' ') {
                            $("#" + idComponente).addClass("errorCampo");
                        } else {
                            $("#" + idComponente).removeClass("errorCampo");
                        }
                    }
                    break;
                case 'contrasenia':
                    validaciones[CONTRASENIA] = {};
                    validaciones[CONTRASENIA].valido = regexContrasenia.test(this.usuario.contrasenia);
                    validaciones[CONTRASENIA].vacio = this.usuario.contrasenia === undefined || this.usuario.contrasenia === "";
                    if (validaciones[CONTRASENIA].vacio) {
                        $("#" + idComponente).addClass("errorCampo");
                    } else {
                        if (this.usuario.errorContrasenia != '' && this.usuario.errorContrasenia != ' ') {
                            $("#" + idComponente).addClass("errorCampo");
                        } else {
                            $("#" + idComponente).removeClass("errorCampo");
                        }
                    }
                    break;
                case 'contraseniaActual':
                    validaciones[CONTRASENIA_A] = {};
                    validaciones[CONTRASENIA_A].valido = regexContrasenia.test(this.usuario.contraseniaAnteriorIngresada);
                    validaciones[CONTRASENIA_A].vacio = this.usuario.contraseniaAnteriorIngresada === undefined || this.usuario.contraseniaAnteriorIngresada === "";
                    if (validaciones[CONTRASENIA_A].vacio) {
                        $("#" + idComponente).addClass("errorCampo");
                    } else {
                        if (this.usuario.errorContraseniaActualModal != '' && this.usuario.errorContraseniaActualModal != ' ') {
                            $("#" + idComponente).addClass("errorCampo");
                        } else {
                            $("#" + idComponente).removeClass("errorCampo");
                        }
                    }
                    break;
                case 'contraseniaNueva':
                    validaciones[CONTRASENIA_N] = {};
                    validaciones[CONTRASENIA_N].valido = regexContrasenia.test(this.usuario.contraseniaNueva);
                    validaciones[CONTRASENIA_N].vacio = this.usuario.contraseniaNueva === undefined || this.usuario.contraseniaNueva === "";
                    if (validaciones[CONTRASENIA_N].vacio) {
                        $("#" + idComponente).addClass("errorCampo");
                    } else {
                        if (this.usuario.errorContraseniaModal != '' && this.usuario.errorContraseniaModal != ' ') {
                            $("#" + idComponente).addClass("errorCampo");
                        } else {
                            $("#" + idComponente).removeClass("errorCampo");
                        }
                    }
                    break;
                case 'contraseniaConfirmar':
                    validaciones[CONTRASENIA_C] = {};
                    validaciones[CONTRASENIA_C].vacio = this.usuario.contraseniaConfirmar === undefined || this.usuario.contraseniaConfirmar === "";
                    if (validaciones[CONTRASENIA_C].vacio) {
                        $("#" + idComponente).addClass("errorCampo");
                    } else {
                        if (this.usuario.errorContraseniaConfirmarModal != '' && this.usuario.errorContraseniaConfirmarModal != ' ') {
                            $("#" + idComponente).addClass("errorCampo");
                        } else {
                            $("#" + idComponente).removeClass("errorCampo");
                        }
                    }
                    break;
                default:
                    break;
            }
        }
    };

    // Función que valida el campo en cuestión cuando pierde el focus, si es incorrecto lo deja en rojo, si no lo cambia a #e5e5e5
    usuario_cambiarColorBlurModal(idComponente: any, campo: any) {
        var validaciones: any = [];
        var CONTRASENIA_A = 0, CONTRASENIA_N = 1, CONTRASENIA_C = 2;

        if (this.usuario.clicGuardarModal) {
            switch (campo) {
                case 'contraseniaActual':
                    validaciones[CONTRASENIA_A] = {};
                    validaciones[CONTRASENIA_A].vacio = this.usuario.contraseniaAnteriorIngresada === undefined || this.usuario.contraseniaAnteriorIngresada === "";
                    if (validaciones[CONTRASENIA_A].vacio) {
                        $("#" + idComponente).addClass("errorCampo");
                    } else {
                        if (this.usuario.errorContraseniaActualModal != '' && this.usuario.errorContraseniaActualModal != ' ') {
                            $("#" + idComponente).addClass("errorCampo");
                        } else {
                            $("#" + idComponente).removeClass("errorCampo");
                        }
                    }
                    break;
                case 'contraseniaNueva':
                    validaciones[CONTRASENIA_N] = {};
                    validaciones[CONTRASENIA_N].vacio = this.usuario.contraseniaNueva === undefined || this.usuario.contraseniaNueva === "";
                    if (validaciones[CONTRASENIA_N].vacio) {
                        $("#" + idComponente).addClass("errorCampo");
                    } else {
                        if (this.usuario.errorContraseniaNuevaModal != '' && this.usuario.errorContraseniaNuevaModal != ' ') {
                            $("#" + idComponente).addClass("errorCampo");
                        } else {
                            $("#" + idComponente).removeClass("errorCampo");
                        }
                    }
                    break;
                default:
                    break;
            }
        }
    };

    // Función que valida si el campo de la contraseña actual está vacío, devuelve el booleano resultado de la validación
    usuario_validarContraseniaActual() {
        var contraseniaVacia = (this.usuario.contraseniaAnteriorIngresada === undefined || this.usuario.contraseniaAnteriorIngresada === "");
        if (contraseniaVacia) {
            this.usuario.errorContraseniaActualModal = ' ';
            $("#contraseniaAnteriorInputModal").addClass("errorCampo");
        } else {
            this.usuario.errorContraseniaActualModal = '';
            $("#contraseniaAnteriorInputModal").removeClass("errorCampo");
        }
        return !contraseniaVacia;
    };

    // Función que valida el formato de la nueva contraseña, devuelve el booleano resultado de la validación
    usuario_validarContraseniaNueva() {
        var regexContrasenia = /(?=^.{6,40}$)(?=.*\d)(?![.\n])(?=.*[A-Za-z]).*$/; ///^(?=.*[0-9])(?=.*)[a-zA-Z0-9*]{6,40}$/;
        var contraseniaValida = regexContrasenia.test(this.usuario.contraseniaNueva);
        var contraseniaVacia = (this.usuario.contraseniaNueva === undefined || this.usuario.contraseniaNueva === "");
        var cantidadCamposInvalidos = 0;

        if (contraseniaVacia) {
            this.usuario.errorContraseniaNuevaModal = ' ';
            $("#contraseniaNuevaInputModal").addClass("errorCampo");
            cantidadCamposInvalidos++;
        } else {
            if (!contraseniaValida) {
                this.usuario.errorContraseniaNuevaModal = this.usuarioTranslate.formatoContrasenia;
                $("#contraseniaNuevaInputModal").addClass("errorCampo");
                cantidadCamposInvalidos++;
            } else {
                this.usuario.errorContraseniaNuevaModal = '';
                $("#contraseniaNuevaInputModal").removeClass("errorCampo");
            }
        }

        return cantidadCamposInvalidos == 0;
    };

    // Función que valida que las contraseñas nueva y de confirmación coincidan, devuelve el booleano resultado de la validación
    usuario_validarConfirmacionContrasenia() {
        if (this.usuario.contraseniaNueva != this.usuario.contraseniaConfirmar) {
            this.usuario.errorContraseniaConfirmarModal = this.usuarioTranslate.contraseniasCoincidir;
            $("#contraseniaNuevaInputModal").addClass("errorCampo");
            $("#contraseniaConfirmarInputModal").addClass("errorCampo");
        } else {
            this.usuario.errorContraseniaConfirmarModal = '';
            $("#contraseniaNuevaInputModal").removeClass("errorCampo");
            $("#contraseniaConfirmarInputModal").removeClass("errorCampo");
        }
        return this.usuario.contraseniaNueva == this.usuario.contraseniaConfirmar;
    };

    // Función que valida que la contraseña actual ingresada coincida con la que está en la BD, del lado del servidor
    usuario_validarContraseniaActualConcidencia() {
        var coinciden = false;

        var params: any = {};
        params.idUsuarioSucursal = this.usuario.idUsuarioActualizar;
        params.contraseniaAnterior = this.usuario.contraseniaAnteriorIngresada;
        params.contraseniaAnteriorEncriptada = this.usuario.contraseniaAnteriorEncriptada;

        this._backService.HttpPost("catalogos/Usuario/validarCambioContrasenia", {}, params).subscribe((data: any) => {
            var contraseniaActualVacia = !this.usuario_validarContraseniaActual();
            var contraseniaNuevaValida = this.usuario_validarContraseniaNueva();
            if (eval(data) != null && eval(data) != undefined) {
                coinciden = eval(data);
                this.usuario.contraseniasCoinciden = coinciden;
                if (coinciden) {
                    if (!contraseniaActualVacia && contraseniaNuevaValida) {
                        if (this.usuario_validarConfirmacionContrasenia()) {
                            this.usuario.contrasenia = this.usuario.contraseniaNueva;
                            // Cerrar el modal
                            this.usuario_actualizarUsuarioPassword();
                            $('#modal-cambio-contrasenia').modal('toggle');

                            this.usuario_cancelarModal();
                            this.usuario.errorContraseniaActualModal = '';
                            $("#contraseniaAnteriorInputModal").removeClass("errorCampo");
                        }
                    }
                } else {
                    if (!contraseniaActualVacia) {
                        this.usuario.errorContraseniaActualModal = this.usuarioTranslate.contraseniaActualInc;
                    }
                    $("#contraseniaAnteriorInputModal").addClass("errorCampo");
                }
            }
        }, error => {

        });
    };

    // Función que realiza el cambio de contraseña
    usuario_cambiarContrasenia() {
        this.usuario.clicGuardarModal = true;
        this.usuario_validarContraseniaActualConcidencia();
    };

    // Resetear variables del modal y cambiar color de los campos al default
    usuario_cancelarModal() {
        this.usuario.contraseniaAnteriorIngresada = "";
        $("#contraseniaAnteriorInputModal").removeClass("errorCampo");
        this.usuario.contraseniaNueva = "";
        $("#contraseniaNuevaInputModal").removeClass("errorCampo");
        this.usuario.contraseniaConfirmar = "";
        $("#contraseniaConfirmarInputModal").removeClass("errorCampo");
        this.usuario.errorContraseniaActualModal = '';
        this.usuario.errorContraseniaNuevaModal = '';
        this.usuario.errorContraseniaConfirmarModal = '';
        this.usuario.contraseniasCoinciden = false;
        this.usuario.clicGuardarModal = false;
    };

    // Modal Alert
    modalAlert(message: any) {
        $("#modal-alert .modal-body").html('<span class="title">' + message + '</span>');
        this.modales.modalAlert.show();
    };

    // Modal Alert Redir
    modalAlertRedir(message: any) {
        $("#modal-alert-redir .modal-body").html('<span class="title">' + message + '</span>');
        this.modales.modalAlertRedir.show();
    };

    // Modal Discard
    modalDiscard(message: any) {
        $("#modal-discard .modal-body").html('<span class="title">' + message + '</span>');
        this.modales.modalDiscard.show();
    };

    // Modal Discard home
    modalDiscardHome(message: any) {
        $("#modal-discard-home .modal-body").html('<span class="title">' + message + '</span>');
        this.modales.modalDiscardHome.show();
    };

    // Modal Cambio contraseña
    modalCambioContrasenia() {
        this.modales.modalCambioContrasenia.show();
    };

    cambioSwitch() {
        if (this.usuario.asistente) {
            this.usuario.isGerenteGral = false;
            this.usuario.isGerenteSuc = false;
        }
        else {
            this.usuario.isSoloAgendas = false;
            this.usuario.isSoloAgendaSucursal = false;
        }
    }

    cambioSwitchAgenda(opc: any) {
        if (opc == 1) {
            this.usuario.isSoloAgendas = false;
        }
        else {
            this.usuario.isSoloAgendaSucursal = false;
        }
    }

    // var pos = "right";
    // if ($(window).width() <= 503) {
    //     pos = "top";
    // }

    // $("#popchatAdmin").popover({
    //     html: true,
    //     animation: true,
    //     content: $translate.instant('usuarioTranslate.chatContent'),
    //     placement: "right"
    // });
    // $("#popAsistente").popover({
    //     html: true,
    //     animation: true,
    //     content: "Solo puede acceder a las siguientes pantallas:<li>Agenda</li><li>Servicios</li><li>Personal</li><li>Excepciones del Personal</li><li>Clientes</li><li>Promociones</li><li>Equipos</li>",
    //     placement: "right"
    // });
    // $("#popGerenteG").popover({
    //     html: true,
    //     animation: true,
    //     content: $translate.instant('usuarioTranslate.generalContent'),
    //     placement: "right"
    // });
    // $("#popGerenteS").popover({
    //     html: true,
    //     animation: true,
    //     content: $translate.instant('usuarioTranslate.sucursalContent'),
    //     placement: "right"
    // });
    // $("#popSoloAgendaSucursal").popover({
    //     html: true,
    //     animation: true,
    //     content: "Tendrá acceso únicamente a la Agenda de Citas",
    //     placement: "right"
    // });
    // $("#popSoloAgendas").popover({
    //     html: true,
    //     animation: true,
    //     content: "Tendrá acceso únicamente a la Agenda de Citas de todas las Sucursales",
    //     placement: "right"
    // });
    // $("#popAccesoAppNegocio").popover({
    //     html: true,
    //     animation: true,
    //     content: $translate.instant('usuarioTranslate.accesoAppNegocioContent'),
    //     placement: "right"
    // });

    // $("#popchatAdmin2").popover({
    //     html: true,
    //     animation: true,
    //     content: $translate.instant('usuarioTranslate.chatContent'),
    //     placement: "right"
    // });
    // $("#popAsistente2").popover({
    //     html: true,
    //     animation: true,
    //     content: "Solo puede acceder a las siguientes pantallas:<li>Agenda</li><li>Servicios</li><li>Personal</li><li>Excepciones del Personal</li><li>Clientes</li><li>Promociones</li><li>Equipos</li>",
    //     placement: "right"
    // });
    // $("#popGerenteG2").popover({
    //     html: true,
    //     animation: true,
    //     content: $translate.instant('usuarioTranslate.generalContent'),
    //     placement: "right"
    // });
    // $("#popGerenteS2").popover({
    //     html: true,
    //     animation: true,
    //     content: $translate.instant('usuarioTranslate.sucursalContent'),
    //     placement: "right"
    // });
    // $("#popAccesoAppNegocio2").popover({
    //     html: true,
    //     animation: true,
    //     content: $translate.instant('usuarioTranslate.accesoAppNegocioContent'),
    //     placement: "right"
    // });

    // $('html').on('mouseup', function (e) {
    //     if (!$(e.target).closest('.popover').length) {
    //         $('.popover').each(function () {
    //             $(this.previousSibling).popover('hide');
    //         });
    //     }
    // });

    //Configuracion Usuario Perfiles y Horarios
    usuario_iniciarConfiguracion() {
        // $('#slctPerfilUsuarios').removeClass("errorCampo");
        $("#slctPerfilUsuarios > div:first-child").attr("style", "outline: none;");

        this.usuario.hora = [];
        var horaInicio = moment().startOf("day");
        var horaFin = moment().endOf("day");
        for (horaInicio; horaInicio < horaFin; horaInicio.add("m", 15)) {
            this.usuario.hora.push(horaInicio.format("HH:mm"));
        }
        this.usuario.hora.push(moment().hour(23).minute(59).format("HH:mm"));

        this.usuario.validacionHorario = 1;

        this._backService.HttpPost("catalogos/ConfiguracionPerfil/consultarPerfilesUsuarios", {}, {}).subscribe((data: any) => {
            this.usuario.perfilesUsuarios = eval(data);
        }, error => {
            this._router.navigate(['/login']);
        });
    }

    usuario_HorarioCheck() {
        this.usuario.validacionHorario = 1;
        this._backService.HttpPost("catalogos/Usuario/consultarHorarioSucursal", {}, {}).subscribe((data: any) => {
            var horarios = eval(data);
            this.usuario.horaInicio = horarios[0].horaInicio;
            this.usuario.horaFin = horarios[0].horaFin;
        }, error => {
            this._router.navigate(['/login']);
        })

        $('#txtHoraInicio').removeClass('errorCampo');
        $('#txtHoraFin').removeClass('errorCampo');
    }

    usuario_valHorario() {
        this.usuario.validacionHorario = 1;
        $('#txtHoraInicio').removeClass('errorCampo');
        $('#txtHoraFin').removeClass('errorCampo');

        if (this.usuario.horaFin <= this.usuario.horaInicio) {
            $('#txtHoraInicio').addClass('errorCampo');
            $('#txtHoraFin').addClass('errorCampo');
            this.usuario.validacionHorario = 0;
        }
    }

    irAAgenda(){
        this._router.navigate(['/procesos/agenda']);
    }
    
    irAUsuarios(){
        this._router.navigate(['/configuraciones/consultaUsuario']);
    }
}