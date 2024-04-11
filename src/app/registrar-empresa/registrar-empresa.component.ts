import { Component, OnInit } from '@angular/core';
import { MethodsService } from '../core/services/methods.service';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from "../core/services/auth.service";
import { PantallaService } from '../core/services/pantalla.service';
import { ResponseData } from '../core/models/response-data.model';
import { Router } from '@angular/router';
import { ToasterService } from 'src/shared/toaster/toaster.service';
declare var $: any; // JQUERY
import * as bootstrap from 'bootstrap'; // BOOTSTRAP
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'app-registrar-empresa',
    templateUrl: './registrar-empresa.component.html',
    styleUrls: [
        './registrar-empresa.component.scss',
        '../page/page.component.scss',
    ],
})
export class RegistrarEmpresaComponent implements OnInit {
    // Variable de translate de sucursal
    registroEmpresaTranslate: any = {};
    sessionTraslate: any = {};
    sucursalTranslate: any = {};
    loginTranslate: any = {};

    // Modales
    modales: any = {};

    //variable para las pestañas
    tabSelect = 0;

    constructor(
        private _backService: MethodsService,
        private _translate: TranslateService,
        private _pantallaServicio: PantallaService,
        private _router: Router,
        private _toaster: ToasterService,
        private _authService: AuthService,
        private matIconRegistry: MatIconRegistry,
        private domSanitizer: DomSanitizer
    ) {
        const userLang = (navigator.language).toLocaleLowerCase();
        let lang = userLang.substring(0, 2) == 'en' ? 'en-us' : 'es-mx';

        this._translate.setDefaultLang(lang);
        this._translate.use(lang);

        this._translate.get('registroEmpresaTranslate').subscribe((translated: string) => {
            this.registroEmpresaTranslate = this._translate.instant('registroEmpresaTranslate');
            this.sessionTraslate = this._translate.instant('sessionTraslate');
            this.sessionTraslate = this._translate.instant('sucursalTranslate');
            this.loginTranslate = this._translate.instant('loginTranslate');
        });

        this.matIconRegistry.addSvgIcon('iconSucursal', this.domSanitizer.bypassSecurityTrustResourceUrl("../../assets/icons/finales/03-Sucursal-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconUsuarios', this.domSanitizer.bypassSecurityTrustResourceUrl("../../assets/icons/finales/05-Personal-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconServicios', this.domSanitizer.bypassSecurityTrustResourceUrl("../../assets/icons/finales/04-Servicios-icon.svg"));

		this.matIconRegistry.addSvgIcon('iconAgregar', this.domSanitizer.bypassSecurityTrustResourceUrl("../../assets/icons/finales/Agregar-1-icon.svg"));
		this.matIconRegistry.addSvgIcon('iconEliminar', this.domSanitizer.bypassSecurityTrustResourceUrl("../../assets/icons/finales/Basura-icon.svg"));
    }

    ngOnInit(): void {
        this.crearModales();
        this.inicializador();
        this.cargarCategoria();
        this.getLocation();
        this.cargarPais();
        this.consultarMotivos();
        this.cargarUsuario();
    }

    // ---------------------------  Variables ------------------------------- //

    mError: any = false;
    error: any = false;
    mErrorMapa: any = false;
    errorMapa: any = false;
    mapaCargado: any = false;

    //Mensajes de error
    mensaje: any = [];
    mensaje2: any = [];
    mensaje3: any = [];

    bAcceso: any = 1;

    //validaciones de botones de siguiente
    next1: any = 1;
    next2: any = 0;
    next3: any = 1;
    next4: any = 1;
    next5: any = 1;

    //tab en la que esta posicionada y el progreso de la barra
    tab: any = 1;
    bar: any = 33;

    registro: any = {
        alta: 1,
        dataUsuario: {},
        selectMotivo: "",
        selectPromotor: "",
        dataMedios: [],
        dataPromotores: [],
        isPromotor: false,
        idUsuario: "",
        idPromotor: "",
    };
    //informacion de la parte superior del mapa (empresa)
    empresa: any = {
        nombre: "",
        categoria: [],
        subcategoria: [],
        carga: false,
    };
    //informacion del mapa
    sucursal: any = {
        pais: null,
        estado: null,
        ciudad: null,
        colonia: "",
        calle: "",
        numero: "",
        numeroInterior: "",
        entreCalles: "",
        codigoPostal: "",
        direccion: "",
        desabilitarCampos: false,
        showMapa: true,
        dataPais: [],
        dataEstado: [],
        dataCiudad: [],
        markersArray: [],
        zoom: 15,
    };
    //informacion de la tab de personal
    personal: any = {
        nombre: [],
        email: [],
        telefono: [],
        cuenta: 0,
        cambioTel: false,
        color: [],
        colores: [],
    };
    personalTemp: any = [];
    //informacion de la tab de s "#E1E1E1";ervicio
    servicio: any = {
        nombre: [],
        costo: [],
        duracion: [],
        cuenta: 0,
    };
    servicioTemp: any = [{
        nombre: "",
        costo: "",
        duracion: "",
    }];
    validRangoDuracion: any = true;
    latitud: any = null;
    longitud: any = null;
    rowSelected: any = null;
    accuracy: any = null;
    showMap: any = null;
    establecida: any = null;
    calle: any = null;
    numero: any = null;
    colonia: any = null;
    codigoPostal: any = null;
    ciudad: any = null;
    pais: any = null;
    estado: any = null;
    validMaxCategorias: any = null;
    msgCategorias: any = null;
    validCosto: any = null;
    mensajeConfirmadoEnviado: any = "";

    // ---------------------------  Funciones ------------------------------- //

    //Funcion para cargar los modales
    crearModales() {
        if ($('body').find('.modalConocerMas').length > 1) {
            $('body').find('.modalConocerMas')[1].remove();
        }
        this.modales.modalConocerMas = new bootstrap.Modal(
            $('#modalConocerMas').appendTo('body'), { backdrop: 'static', keyboard: false, }
        );

        if ($('body').find('.modalCorreoEnviado').length > 1) {
            $('body').find('.modalCorreoEnviado')[1].remove();
        }
        this.modales.modalCorreoEnviado = new bootstrap.Modal(
            $('#modalCorreoEnviado').appendTo('body'), { backdrop: 'static', keyboard: false, }
        );
    }

    inicializador() {
        this.mensaje[0] = "";
        this.mensaje[1] = "";
        this.mensaje[2] = "";
        this.mensaje[3] = "";
        this.mensaje[4] = "";
        this.mensaje[5] = "";
        //colores de personal
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
    }

    //Boton que agrega un nuevo servicio a la lista
    agregarServicio() {
        if (this.servicio.cuenta < 4) {
            this.servicio.cuenta++;
            this.servicioTemp.push({
                nombre: '',
                costo: '',
                duracion: '',
            })
        }

        this.error = false;
        for (let i = 0; i < this.servicioTemp.length; i++) {
            $("#txtNombreS" + i).removeClass("errorCampo");
        }

        for (let i = 0; i < this.servicioTemp.length; i++) {
            $("#txtDuracion" + i).removeClass("errorCampo");
            if (this.mensaje2[i] != "" && this.mensaje2[i] != undefined) {
                $("#txtDuracion" + i).addClass("errorCampo");
            }
        }

        for (let i = 0; i < this.servicioTemp.length; i++) {
            $("#txtCosto" + i).removeClass("errorCampo");
            if (this.mensaje[i] != "" && this.mensaje[i] != undefined) {
                $("#txtCosto" + i).addClass("errorCampo");
            }
        }

        if (this.error && this.servicio.cuenta > 0) {
            $("#txtNombreS" + this.servicio.cuenta).removeClass("errorCampo");
            $("#txtCosto" + this.servicio.cuenta).removeClass("errorCampo");
            $("#txtDuracion" + this.servicio.cuenta).removeClass("errorCampo");
        }
        if (!this.error) {
            $("#txtNombreS" + this.servicio.cuenta).removeClass("errorCampo");
            $("#txtCosto" + this.servicio.cuenta).removeClass("errorCampo");
            $("#txtDuracion" + this.servicio.cuenta).removeClass("errorCampo");
        }

        $("#txtNombreS" + this.servicio.cuenta).focus();

    }

    //Boton que elimina un nuevo servicio de la lista
    eliminarServicio(posicion?: any) {
        this.servicioTemp.splice(posicion, 1);
        this.mensaje.splice(posicion, 1);
        this.mensaje2.splice(posicion, 1);

        this.error = false;
        for (let i = 0; i < this.servicioTemp.length; i++) {
            $("#txtNombreS" + i).removeClass("errorCampo");
        }

        for (let i = 0; i < this.servicioTemp.length; i++) {
            $("#txtDuracion" + i).removeClass("errorCampo");
            if (this.mensaje2[i] != "" && this.mensaje2[i] != undefined) {
                $("#txtDuracion" + i).addClass("errorCampo");
            }
        }

        for (let i = 0; i < this.servicioTemp.length; i++) {
            $("#txtCosto" + i).removeClass("errorCampo");
            if (this.mensaje[i] != "" && this.mensaje[i] != undefined) {
                $("#txtCosto" + i).addClass("errorCampo");
            }
        }

        if (this.servicio.cuenta > 0)
            this.servicio.cuenta--;
    }

    //Boton que agrega un nuevo personal a la lista
    agregarPersonal() {
        if (this.personal.cuenta < 4) {
            this.personal.cuenta++;
            this.personalTemp.push({
                nombre: '',
                email: '',
                telefono: '',
                color: '',
            })
        }

        this.error = false;
        for (let i = 0; i < this.personalTemp.length; i++) {
            $("#txtNombreP" + i).removeClass("errorCampo");
            if (this.mensaje2[i] != "" && this.mensaje2[i] != undefined) {
                $("#txtNombreP" + i).addClass("errorCampo");
            }
        }

        for (let i = 0; i < this.personalTemp.length; i++) {
            $("#txtEmailP" + i).removeClass("errorCampo");
            if (this.mensaje[i] != "" && this.mensaje[i] != undefined) {
                $("#txtEmailP" + i).addClass("errorCampo");
            }
        }

        for (let i = 0; i < this.personalTemp.length; i++) {
            $("#txtTelefonoP" + i).removeClass("errorCampo");
            if (this.mensaje3[i] != "" && this.mensaje3[i] != undefined) {
                $("#txtTelefonoP" + i).addClass("errorCampo");
            }
        }

        if (this.error && this.personal.cuenta > 0) {
            $("#txtNombreP" + this.personal.cuenta).removeClass("errorCampo");
            $("#txtEmailP" + this.personal.cuenta).removeClass("errorCampo");
            $("#txtTelefonoP" + this.personal.cuenta).removeClass("errorCampo");
        }
        if (!this.error) {
            $("#txtNombreP" + this.personal.cuenta).removeClass("errorCampo");
            $("#txtEmailP" + this.personal.cuenta).removeClass("errorCampo");
            $("#txtTelefonoP" + this.personal.cuenta).removeClass("errorCampo");
        }
        $("#txtNombreP" + this.personal.cuenta).focus();
    }

    //Boton que elimina un nuevo personal de la lista
    eliminarPersonal(posicion?: any) {
        this.personalTemp.splice(posicion, 1);
        this.mensaje.splice(posicion, 1);
        this.mensaje2.splice(posicion, 1);
        this.mensaje3.splice(posicion, 1);

        this.error = false;
        for (let i = 0; i < 4; i++) {
            $("#txtNombreP" + i).removeClass("errorCampo");
            if (this.mensaje2[i] != "" && this.mensaje2[i] != undefined) {
                $("#txtNombreP" + i).addClass("errorCampo");
            }
        }

        for (let i = 0; i < 5; i++) {
            $("#txtEmailP" + i).removeClass("errorCampo");
            if (this.mensaje[i] != "" && this.mensaje[i] != undefined) {
                $("#txtEmailP" + i).addClass("errorCampo");
            }
        }

        for (let i = 0; i < 5; i++) {
            $("#txtTelefonoP" + i).removeClass("errorCampo");
            if (this.mensaje3[i] != "" && this.mensaje3[i] != undefined) {
                $("#txtTelefonoP" + i).addClass("errorCampo");
            }
        }

        if (this.personal.cuenta > 0)
            this.personal.cuenta--;
    }

    descartarUbicacion() {
        $('#modal-confirmUbicacion').modal('hide');
        $('body').css('overflow', 'auto');
        $('#establecerUbicacion').modal('hide');
        this.sucursal.lat = this.latitud;
        this.sucursal.lon = this.longitud;
    }

    //manda a llamar a la funcion que abre el modal de confirmar ubicacion
    modalConfirmUbicacion(message?: any) {
        if (this.sucursal.lat != this.latitud || this.sucursal.lon != this.longitud) {
            this.modalConfUb(message);

        } else {
            $('body').css('overflow', 'auto');
            $('#establecerUbicacion').modal('hide');
        }
    };

    modalConfirmUbicacion2() {
        if (this.sucursal.lat != this.latitud || this.sucursal.lon != this.longitud) {
            this.modalConfUb(this.registroEmpresaTranslate.descartarCambios);

        } else {
            $('body').css('overflow', 'auto');
            $('#establecerUbicacion').modal('hide');
        }
    };

    //abre el modal de confirmar ubicacion
    modalConfUb(message?: any) {
        $('#modal-confirmUbicacion').modal({ backdrop: 'static', keyboard: false });
        $("#modal-confirmUbicacion .modal-body").html('<span class="title">' + message + '</span>');
        $('body').css('overflow', 'hidden');
    }

    //Boton de la X para cerrar el modal de ubicacion
    cerrarModalUbicacion() {
        $('#modal-confirmUbicacion').modal('hide');
        $('#establecerUbicacion').css('overflow', 'auto'); // addClass('modal-open');
    }

    cerrarLogin() {
        $('#modalLogin').modal('hide');
    }

    //Carga las categorias
    cargarCategoria() {
        this._backService.HttpPost("catalogos/categoria/consultaCategorias", {}, {}).subscribe(
            response => {
                this.empresa.dataCategoria = eval(response);
                let cont = 0;
                for (let j = 0; j < this.empresa.dataCategoria.length; j++) {
                    if (this.empresa.dataCategoria[j].nombre.toLowerCase().indexOf('otros') != -1 || this.empresa.dataCategoria[j].nombre.toLowerCase().indexOf('otro') != -1) {
                        cont++;
                    }
                }
                let j = 0;
                for (let i = 0; i < this.empresa.dataCategoria.length; i++) {
                    if (this.empresa.dataCategoria[i].nombre.toLowerCase().indexOf('otros') != -1 || this.empresa.dataCategoria[i].nombre.toLowerCase().indexOf('otro') != -1) {
                        if (cont >= j) {
                            this.rowSelected = JSON.parse(JSON.stringify(this.empresa.dataCategoria[i]));
                            this.empresa.dataCategoria.splice(i, 1);
                            this.empresa.dataCategoria.push(this.rowSelected);
                            j++;
                            i--
                        }
                    }

                }
            },
            error => {
            })
    }

    dynamicSort(property?: any) {
        let sortOrder = 1; if (property[0] == "-") { sortOrder = -1; property = property.substr(1); } return (a?: any, b?: any) => { let result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0; return result * sortOrder; }
    }

    //Carga las subcategorias dependiendo de las categorias
    cargarSubcategoria() {
        if (this.mError) {
            $("#txtSubCategoriaE").addClass("errorCampo");
        }
        this.empresa.aux2 = JSON.parse(JSON.stringify(this.empresa.subcategoria));
        this.empresa.subcategoria = [];
        this.empresa.aux = [];
        this.empresa.carga = true;
        let params: any = {};
        params.idCategoria = this.empresa.categoria.slice();

        this._pantallaServicio.mostrarSpinner();
        this._backService.HttpPost("catalogos/subcategoria/getSubcategoriasEnCategoria", {}, params).subscribe(
            response => {
                this.empresa.dataSubcategoria = eval(response);
                this.empresa.dataSubcategoria = this.empresa.dataSubcategoria.sort(this.dynamicSort("nombre"));

                let cont = 0;
                for (let j = 0; j < this.empresa.dataSubcategoria.length; j++) {
                    if (this.empresa.dataSubcategoria[j].nombre.toLowerCase().indexOf("otros") != -1 || this.empresa.dataSubcategoria[j].nombre.toLowerCase().indexOf("otro") != -1) {
                        cont++;
                    }
                }
                let j = 0;
                for (let i = 0; i < this.empresa.dataSubcategoria.length; i++) {
                    if (this.empresa.dataSubcategoria[i].nombre.toLowerCase().indexOf("otros") != -1 || this.empresa.dataSubcategoria[i].nombre.toLowerCase().indexOf("otro") != -1) {
                        if (cont >= j) {
                            this.rowSelected = JSON.parse(JSON.stringify(this.empresa.dataSubcategoria[i]));
                            this.empresa.dataSubcategoria.splice(i, 1);
                            this.empresa.dataSubcategoria.push(this.rowSelected);
                            j++;
                            i--
                        }
                    }

                }
                for (let j = 0; j < this.empresa.dataSubcategoria.length; j++) {
                    for (let h = 0; h < this.empresa.aux2.length; h++) {
                        if (this.empresa.aux2[h] == this.empresa.dataSubcategoria[j].idSubcategoria) {
                            this.empresa.aux.push(JSON.parse(JSON.stringify(this.empresa.aux2[h])));
                        }
                    }
                }
                this.empresa.carga = false;
                this.empresa.subcategoria = [];
                this.empresa.subcategoria = JSON.parse(JSON.stringify(this.empresa.aux));
                if (this.error && this.empresa.subcategoria.length == 0) {
                    $("#txtSubCategoriaE").addClass("errorCampo");
                } else {
                    $("#txtSubCategoriaE").removeClass("errorCampo");
                }
                this._pantallaServicio.ocultarSpinner();
            },
            error => {
                this._pantallaServicio.ocultarSpinner();
            }
        );
    }

    //muestra la posicion de la direccion seleccionada
    showPosition(position?: any) {
        this.sucursal.lat = position.coords.latitude;
        this.sucursal.lon = position.coords.longitude;
        this.accuracy = position.coords.accuracy;

    }

    //muestra los errores en el mapa
    showError(error?: any) {
        switch (error.code) {
            case error.PERMISSION_DENIED:
                this.error = "User denied the request for Geolocation."
                $('#modalHabilitarUbicacion').modal({ backdrop: 'static', keyboard: false });
                break;
            case error.POSITION_UNAVAILABLE:
                this.error = "Location information is unavailable."
                break;
            case error.TIMEOUT:
                this.error = "The request to get user location timed out."
                break;
            case error.UNKNOWN_ERROR:
                this.error = "An unknown error occurred."
                break;
        }
    }

    //toma la localizacion
    getLocation() {
        if (navigator.geolocation) {

            if (location.protocol != 'https:') {
                this.sucursal.lat = "21.016060";
                this.sucursal.lon = "-101.253419";
                this.sucursal.zoom = 5;
            }
            else {
                navigator.geolocation.getCurrentPosition(this.showPosition, this.showError);
                this.sucursal.zoom = 15;
            }
        }
        else {
            this.error = this.registroEmpresaTranslate.geolocalizacion;
        }
    }

    //guarda la direccion del mapa en las variables
    establecerUbicacion() {
    } //Fin funcion

    //valida que las variables de dieccion esten llenas
    definirDireccion() {
        $('body').css('overflow', 'auto');
        $("#txtDireccion").removeClass("errorCampo");
        this.establecida = true;
        this.sucursal.calle = this.calle;
        this.sucursal.numero = this.numero;
        this.sucursal.colonia = this.colonia;
        this.sucursal.codigoPostal = this.codigoPostal;
        if ((this.calle != undefined || this.numero != undefined || this.colonia != undefined || this.codigoPostal != undefined) &&
            (this.calle != "" || this.numero != "" || this.colonia != "" || this.codigoPostal != "")) {
            this.sucursal.desabilitarCampos = false;
            this.sucursal.showMapa = true;
            this.mensaje2[0] = "";

        }
        this.cargarPaisPorNombre();

        if (this.error && (this.sucursal.pais == "" || this.sucursal.pais == undefined)) {
            $("#txtPaisS").addClass("errorCampo");
        }
        if (this.error && (this.sucursal.estado == "" || this.sucursal.estado == undefined)) {
            $("#txtEstadoS").addClass("errorCampo");
        }
        if (this.error && (this.sucursal.ciudad == "" || this.sucursal.ciudad == undefined)) {
            $("#txtCiudadS").addClass("errorCampo");
        }
        if (this.error && (this.sucursal.colonia == "" || this.sucursal.colonia == undefined)) {
            $("#txtColoniaS").addClass("errorCampo");
        }
        if (this.error && (this.sucursal.calle == "" || this.sucursal.calle == undefined)) {
            $("#txtCalleS").addClass("errorCampo");
        }
        if (this.error && (this.sucursal.numero == "" || this.sucursal.numero == undefined)) {
            $("#txtNumeroS").addClass("errorCampo");
        }
        if (this.error && (this.sucursal.codigoPostal == "" || this.sucursal.codigoPostal == undefined)) {
            $("#txtCodigoPostalS").addClass("errorCampo");
        }

    }

    //Quita los acentos de un texto
    omitirAcentos(text?: any) {
        let acentos = "ÃÀÁÄÂÈÉËÊÌÍÏÎÒÓÖÔÙÚÜÛãàáäâèéëêìíïîòóöôùúüûÑñÇç";
        let original = "AAAAAEEEEIIIIOOOOUUUUaaaaaeeeeiiiioooouuuunncc";
        for (let i = 0; i < acentos.length; i++) {
            text = text.replace(acentos.charAt(i), original.charAt(i));
        }
        return text;
    }

    //busca la cuidad por el nombre
    consultaCiudadPorNombre() {
        let params = {};
        let encontrado = false;

        this._backService.HttpPost("catalogos/ciudad/cargarCiudades", {}, params).subscribe(
            response => {
                this.sucursal.dataCiudad = eval(response);
                for (let i = 0; i < this.sucursal.dataCiudad.length; i++) {
                    if (this.omitirAcentos(this.ciudad).toLowerCase() == this.omitirAcentos(this.sucursal.dataCiudad[i].nomCiudad).toLowerCase()) {
                        encontrado = true;
                        this.sucursal.estado = this.sucursal.dataCiudad[i].idEstado;
                        this.sucursal.ciudad = this.sucursal.dataCiudad[i].idCiudad;
                        this.consultaCiudadesEnEstado();
                        this.cargarEstado();
                        this.consultaPaises();

                        break;
                    }
                }
                if (encontrado == false) {
                    this.consultaPaises();
                    this.sucursal.pais = null;
                    this.sucursal.estado = null;
                    this.sucursal.ciudad = null;
                    this.sucursal.dataCiudad = [];
                    this.sucursal.dataEstado = [];
                    this.sucursal.dataEstadoSeleccionado = [];
                }
            },
            error => {
            }
        )
    }

    //busca el pais por el nombre
    cargarPaisPorNombre() {
        let params: any = {};
        params.nombre = this.pais;

        this._backService.HttpPost("catalogos/pais/getPaisNombre", {}, params).subscribe(
            response => {
                this.sucursal.dataPaisSeleccionado = eval(response);
                if (this.sucursal.dataPaisSeleccionado.length > 0) {
                    if (this.sucursal.dataPaisSeleccionado[0].idPais != undefined) {
                        this.sucursal.pais = this.sucursal.dataPaisSeleccionado[0].idPais;
                    } else {
                        this.sucursal.pais = null;
                    }
                } else {
                    this.sucursal.pais = null;
                    this.sucursal.estado = null;
                    this.sucursal.ciudad = null;
                }
                this.cargarEstados();
            },
            error => {
            }
        );
    }

    //carga los paises
    cargarPais() {
        this._backService.HttpPost("catalogos/pais/getPaises", {}, {}).subscribe(
            response => {
                this.sucursal.pais = null;
                this.sucursal.dataPais = eval(response);
            },
            error => {
            }
        );
    }

    //carga el data de ciudades
    cargarCiudad() {
        let params: any = {};
        params.idEstado = this.sucursal.estado;
        $("#txtEstadoS").removeClass("errorCampo");

        if (this.mError) {
            $("#txtCiudadS").addClass("errorCampo");
        }

        this._backService.HttpPost("catalogos/ciudad/consultaCiudadesEnEstado", {}, params).subscribe(
            response => {
                this.sucursal.ciudad = null;
                this.sucursal.dataCiudad = eval(response);
            },
            error => {
            }
        )
    }

    //carga el data de estados
    cargarEstado() {
        let params: any = {};
        params.idPais = this.sucursal.pais;

        this._pantallaServicio.mostrarSpinner();
        this._backService.HttpPost("catalogos/estado/cargarEstadosEnPais", {}, params).subscribe(
            response => {
                this.sucursal.estado = this.sucursal.estado;
                this.sucursal.dataEstado = eval(response);
                this.sucursal.estado = null;
                this.sucursal.ciudad = null;
                this.sucursal.dataCiudad = [];

                if (this.mError) {
                    $("#txtEstadoS").addClass("errorCampo");
                    $("#txtCiudadS").addClass("errorCampo");
                }
                this._pantallaServicio.ocultarSpinner();
            },
            error => {
                this._pantallaServicio.ocultarSpinner();
            }
        )
    }

    //busca el estado sin acentos
    cargarEstados() {
        let flag = 0;
        if (this.error && (this.sucursal.pais != "" || this.sucursal.pais != undefined)) {
            $("#txtPaisS").removeClass("errorCampo");
        }

        this._backService.HttpPost("catalogos/estado/consultaEstados", {}, {}).subscribe(
            response => {
                this.sucursal.dataEstado = eval(response);
                for (let i = 0; i < this.sucursal.dataEstado.length; i++) {
                    if (this.omitirAcentos(this.estado).toLowerCase() == this.omitirAcentos(this.sucursal.dataEstado[i].nombre).toLowerCase()) {
                        this.sucursal.estado = this.sucursal.dataEstado[i].idEstado;
                        this.sucursal.pais = this.sucursal.dataEstado[i].idPais;
                        this.consultaPaises();
                        this.consultaEstados();
                        this.consultaCiudadesEnEstado();
                        this.consultaCiudadPorEstadoYNombre();
                        flag++
                    }
                }
                if (flag == 0) {
                    this.sucursal.estado = null;
                    this.sucursal.ciudad = null;
                }
            },
            error => {
            }
        )
    }

    //busca la ciudad por el estado y su nombre
    consultaCiudadPorEstadoYNombre() {
        if (this.ciudad != undefined) {
            let params: any = {};
            params.idEstado = this.sucursal.estado;
            params.nombre = this.ciudad;

            this._backService.HttpPost("catalogos/ciudad/consultaCiudadPorEstadoYNombre", {}, params).subscribe(
                response => {
                    this.sucursal.dataCiudadSeleccionada = eval(response);
                    if (this.sucursal.dataCiudadSeleccionada.length > 0) {
                        this.sucursal.ciudad = this.sucursal.dataCiudadSeleccionada[0].idCiudad;
                    }
                    else {
                        this.sucursal.ciudad = null;
                    }

                    if (this.sucursal.pais != "" && this.sucursal.pais != undefined) {
                        $("#txtPaisS").removeClass("errorCampo");
                    }
                    if (this.sucursal.estado != "" && this.sucursal.estado != undefined) {
                        $("#txtEstadoS").removeClass("errorCampo");
                    }
                    if (this.sucursal.ciudad != "" && this.sucursal.ciudad != undefined) {
                        $("#txtCiudadS").removeClass("errorCampo");
                    }
                },
                error => {
                }
            )
        }
    }

    //busca las ciudades en un estado
    consultaCiudadesEnEstado() {
        let params: any = {};
        params.idEstado = this.sucursal.estado;
        this._pantallaServicio.mostrarSpinner();
        this._backService.HttpPost("catalogos/ciudad/consultaCiudadesEnEstado", {}, params).subscribe(
            response => {
                this.sucursal.dataCiudad = eval(response);
                this._pantallaServicio.ocultarSpinner();
            },
            error => {
                this._pantallaServicio.ocultarSpinner();
            }
        )
    }

    //carga el data de esados
    consultaEstados() {
        if (this.sucursal.pais != "") {
            let params: any = {};
            params.idPais = this.sucursal.pais
            this._backService.HttpPost("catalogos/estado/cargarEstadosEnPais", {}, params).subscribe(
                response => {
                    this.sucursal.dataEstado = eval(response);
                },
                error => {
                }
            )
        } else {
            this.sucursal.dataEstado = "";
        }
    }

    //carga el data de paises
    consultaPaises() {
        this._backService.HttpPost("catalogos/pais/getPaises", {}, {}).subscribe(
            response => {
                this.sucursal.dataPais = eval(response);
            },
            error => {
            }
        )
    }

    //valida que los datos de la empresa esten bien y pasa a la siguiente seccion
    guardarEmpresa() {
        let flag = 0;
        this.mError = false;
        this.error = false;

        this.mensaje = [];
        this.mensaje2 = [];
        this.mensaje3 = [];
        $("#mTelefonoE").show();

        let expReg = new RegExp("^[_a-z0-9-]+(.[_a-z0-9-]+)*@[a-z0-9-]+(.[a-z0-9-]+)*(.[a-z]{2,4})$");
        let expTelefono = new RegExp("^(\\(\\d{2}\\)|\\d{2})?-?(\\d{2})?-?\\d{2}-?\\d{2}-?\\d{2}-?\\d{2}$");
        let expTelMovil = new RegExp("^(\\(\\d{3}\\)|\\d{3})?-?((\\d{3}-?\\d{3}-?\\d{2}-?\\d{2})|(\\d{2}-?\\d{2}-?\\d{2}-?\\d{2}-?\\d{2}))$");


        if (this.empresa.nombre == "" || this.empresa.nombre == undefined) {
            $("#txtNombreE").addClass("errorCampo");
            flag++;
        }
        else {
            $("#txtNombreE").removeClass("errorCampo");
        }


        if (this.empresa.telefono == "" || this.empresa.telefono == undefined) {
            $("#txtTelefonoE").addClass("errorCampo");
            flag++;
        }
        else {

            if (!expTelefono.test(this.empresa.telefono) && !expTelMovil.test(this.empresa.telefono)) {
                $("#txtTelefonoE").addClass("errorCampo");
                this.mensaje[0] = this.registroEmpresaTranslate.telefonoFormato;
                this.mError = true;
                flag++;
            }
            else {
                $("#txtTelefonoE").removeClass("errorCampo");
            }
        }

        if (this.empresa.categoria == "" || this.empresa.categoria == null) {
            $("#txtCategoriaE").addClass("errorCampo");
            flag++;
        }
        else {
            $("#txtCategoriaE").removeClass("errorCampo");
        }

        if (this.empresa.subcategoria == "" || this.empresa.subcategoria == undefined) {
            $("#txtSubCategoriaE").addClass("errorCampo");
            flag++;
        }
        else {
            $("#txtSubCategoriaE").removeClass("errorCampo");
        }

        flag += this.guardarSucursal();

        if (!this.sucursal.showMapa && this.guardarSucursal() == 1) {
            this.mensaje2[0] = this.registroEmpresaTranslate.ubicacionRequerida;
        }

        if (flag == 0) {
            $("#txtPaisS").removeClass("errorCampo");
            $("#txtEstadoS").removeClass("errorCampo");
            $("#txtCiudadS").removeClass("errorCampo");
            $("#txtColoniaS").removeClass("errorCampo");
            $("#txtCalleS").removeClass("errorCampo");
            $("#txtNumeroS").removeClass("errorCampo");
            $("#txtCodigoPostalS").removeClass("errorCampo");

            for (let i = 1; i < 6; i++) {
                if (i == 1) {
                    $("#txtNombreP").removeClass("errorCampo");
                    $("#txtEmailP").removeClass("errorCampo");
                    $("#txtTelefonoP").removeClass("errorCampo");
                    $("#txtNombreS").removeClass("errorCampo");
                    $("#txtDuracion").removeClass("errorCampo");
                    $("#txtCosto").removeClass("errorCampo");
                } else {
                    $("#txtNombreP" + i).removeClass("errorCampo");
                    $("#txtEmailP" + i).removeClass("errorCampo");
                    $("#txtTelefonoP" + i).removeClass("errorCampo");
                    $("#txtNombreS" + i).removeClass("errorCampo");
                    $("#txtDuracion" + i).removeClass("errorCampo");
                    $("#txtCosto" + i).removeClass("errorCampo");
                }
            }



            if (!this.personal.cambioTel) {
                this.personalTemp[0].telefono = JSON.parse(JSON.stringify(this.empresa.telefono));
                this.personal.cambioTel = true;
            }

            this.registro.alta = 2;
            this.next();
        } else {
            this.error = true;
        }


    }

    //valida que los datos de la sucursal esten bien y pasa a la siguiente seccion
    guardarSucursal() {
        let flag2 = 0;

        if (this.sucursal.pais == "" || this.sucursal.pais == undefined) {
            $("#txtPaisS").addClass("errorCampo");
            flag2++;
        }
        else {
            $("#txtPaisS").removeClass("errorCampo");
        }

        if (this.sucursal.estado == "" || this.sucursal.estado == undefined) {
            $("#txtEstadoS").addClass("errorCampo");
            flag2++;
        }
        else {
            $("#txtEstadoS").removeClass("errorCampo");
        }

        if (this.sucursal.ciudad == "" || this.sucursal.ciudad == undefined) {
            $("#txtCiudadS").addClass("errorCampo");
            flag2++;
        }
        else {
            $("#txtCiudadS").removeClass("errorCampo");
        }

        if (this.sucursal.colonia == "" || this.sucursal.colonia == undefined) {
            $("#txtColoniaS").addClass("errorCampo");
            flag2++;
        }
        else {
            $("#txtColoniaS").removeClass("errorCampo");
        }

        if (this.sucursal.calle == "" || this.sucursal.calle == undefined) {
            $("#txtCalleS").addClass("errorCampo");
            flag2++;
        }
        else {
            $("#txtCalleS").removeClass("errorCampo");
        }

        if (this.sucursal.numero == "" || this.sucursal.numero == undefined || this.sucursal.numero.length > 10) {
            $("#txtNumeroS").addClass("errorCampo");
            flag2++;
        }
        else {
            $("#txtNumeroS").removeClass("errorCampo");
        }

        if (this.sucursal.numeroInterior != "") {
            $("#txtNumeroInteriorS").removeClass("errorCampo");

        }


        if (this.sucursal.codigoPostal == "" || this.sucursal.codigoPostal == undefined) {
            $("#txtCodigoPostalS").addClass("errorCampo");
            flag2++;
        }
        else {
            $("#txtCodigoPostalS").removeClass("errorCampo");

        }

        if (flag2 == 0)
            return 0;
        else
            return 1;

    }

    //valida que los datos del personal esten bien y pasa a la siguiente seccion
    guardarPersonal() {
        let flag = 0;
        this.mensaje = [];
        this.mensaje2 = [];
        this.mensaje3 = [];
        this.mError = false;
        this.error = false;
        let expReg = new RegExp("^[_a-z0-9-]+(.[_a-z0-9-]+)*@[a-z0-9-]+(.[a-z0-9-]+)*(.[a-z]{2,4})$");
        let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        let expTelefono = new RegExp("^(\\(\\d{2}\\)|\\d{2})?-?(\\d{2})?-?\\d{2}-?\\d{2}-?\\d{2}-?\\d{2}$");
        let expTelMovil = new RegExp("^(\\(\\d{3}\\)|\\d{3})?-?((\\d{3}-?\\d{3}-?\\d{2}-?\\d{2})|(\\d{2}-?\\d{2}-?\\d{2}-?\\d{2}-?\\d{2}))$");
        let expRegNombre = new RegExp("^[a-z A-ZáéíóúüñÁÉÍÓÚÜÑ\s]*$");

        for (let i = 0; i < this.personalTemp.length; i++) {
            if (this.personalTemp[i].nombre == "" || this.personalTemp[i].nombre == undefined) {
                $("#txtNombreP" + i).addClass("errorCampo");
                flag++;
                this.error = true;
            } else {
                if (!expRegNombre.test(this.personalTemp[i].nombre)) {
                    $("#txtNombreP" + i).addClass("errorCampo");

                    this.mensaje2[i] = this.registroEmpresaTranslate.nombreLetras;
                    this.mError = true;
                    flag++;
                }
                else {
                    $("#txtNombreP" + i).removeClass("errorCampo");
                }
            }
        }

        for (let i = 0; i < this.personalTemp.length; i++) {

            if (this.personalTemp[i].email == "" || this.personalTemp[i].email == undefined) {
                $("#txtEmailP" + i).removeClass("errorCampo");
            }
            else {
                if (!re.test(this.personalTemp[i].email)) {
                    $("#txtEmailP" + i).addClass("errorCampo");
                    this.mensaje[i] = this.registroEmpresaTranslate.correoFormato;
                    this.mError = true;
                    flag++;
                }
                else {
                    $("#txtEmailP" + i).removeClass("errorCampo");
                }
            }
        }

        for (let i = 0; i < this.personalTemp.length; i++) {

            if (this.personalTemp[i].telefono == "" || this.personalTemp[i].telefono == undefined) {
                $("#txtTelefonoP" + i).removeClass("errorCampo");
            }
            else {
                if (!expTelefono.test(this.personalTemp[i].telefono) && !expTelMovil.test(this.personalTemp[i].telefono)) {
                    $("#txtTelefonoP" + i).addClass("errorCampo");
                    this.mensaje3[i] = this.registroEmpresaTranslate.telefonoFormato;
                    this.mError = true;
                    flag++;
                }
                else {
                    $("#txtTelefonoP" + i).removeClass("errorCampo");
                }
            }
        }

        if (flag == 0) {

            for (let i = 1; i < 6; i++) {
                $("#txtNombreS" + i).removeClass("errorCampo");
                $("#txtCosto" + i).removeClass("errorCampo");
                $("#txtDuracion" + i).removeClass("errorCampo");
            }

            this.registro.alta = 3;
            this.error = false;
            this.next();
        }

    }

    //valida que los datos del servicio esten bien y pasa a la siguiente seccion
    guardarServicio() {
        let flag = 0;
        this.mensaje = [];
        this.mensaje2 = [];
        this.mError = false;
        this.error = false;

        for (let i = 0; i < this.servicioTemp.length; i++) {
            if (this.servicioTemp[i].nombre == "" || this.servicioTemp[i].nombre == undefined) {
                $("#txtNombreS" + i).addClass("errorCampo");
                flag++;
                this.error = true;
            } else {
                $("#txtNombreS" + i).removeClass("errorCampo");
            }
        }

        for (let i = 0; i < this.servicioTemp.length; i++) {
            if (this.servicioTemp[i].duracion == "" || this.servicioTemp[i].duracion == undefined) {
                $("#txtDuracion" + i).addClass("errorCampo");
                flag++;
                this.error = true;
            } else {
                $("#txtDuracion" + i).removeClass("errorCampo");
            }
        }

        if (this.servicioTemp.length != 0) {
            let mensajeError = false;
            for (let i = 0; i < this.servicioTemp.length; i++) {
                flag += this.validarRangoDuracion(i);
                if (this.mError) {
                    mensajeError = true;
                    this.error = true;
                }
            }

            this.mError = mensajeError;
        }

        for (let i = 0; i < this.servicioTemp.length; i++) {
            if (String(this.servicioTemp[i].costo || '') == "" || this.servicioTemp[i].costo == undefined) {
                $("#txtCosto" + i).addClass("errorCampo");
                flag++;
                this.error = true;
            } else {
                $("#txtCosto" + i).removeClass("errorCampo");
            }
        }

        if (this.servicioTemp.length != 0) {
            let mensajeError = false;
            for (let i = 0; i < this.servicioTemp.length; i++) {
                flag += this.validFlotantes(i);
                if (String(this.servicioTemp[i].costo || '') == "" || this.servicioTemp[i].costo == undefined) {
                    $("#txtCosto" + i).addClass("errorCampo");
                }
                if (this.mError) {
                    mensajeError = true;
                }
            }

            this.mError = mensajeError;
        }

        if (flag == 0) {
            this.guardarConfirmar();

        } else {
            this.error = true;
        }

    }

    //hace el guardado general y manda a llamar al WS para guardar la informacion
    guardarConfirmar() {
        this._pantallaServicio.mostrarSpinner();
        this.empresa.nombre = this.empresa.nombre.replace(/</g, "&lt;");
        this.empresa.telefono = this.empresa.telefono.replace(/</g, "&lt;");
        this.sucursal.colonia = this.sucursal.colonia.replace(/</g, "&lt;");
        this.sucursal.numero = this.sucursal.numero.replace(/</g, "&lt;");
        this.sucursal.calle = this.sucursal.calle.replace(/</g, "&lt;");
        if (this.sucursal.numeroInterior != undefined && this.sucursal.numeroInterior != "") {
            this.sucursal.numeroInterior = this.sucursal.numeroInterior.replace(/</g, "&lt;");
        }
        this.sucursal.codigoPostal = this.sucursal.codigoPostal.replace(/</g, "&lt;");

        //let dat = []
        for (let i = 0; i < this.servicioTemp.length; i++) {
            this.servicioTemp[i].nombre = this.servicioTemp[i].nombre.replace(/</g, "&lt;");
        }
        //this.servicioTemp = dat.slice();

        let numRandom;
        let limite = 11;
        for (let i = 0; i < this.personalTemp.length; i++) {
            numRandom = this.getRandomInt(0, limite);
            this.personalTemp[i].color = this.personal.colores[numRandom];
            this.personal.colores.splice(numRandom, 1);
            limite--;
        }

        let params: any = {};
        params.idUsuario = this.registro.dataUsuario[0].id;
        params.email = this.registro.dataUsuario[0].email;
        params.empresaNombre = this.empresa.nombre;
        params.empresaTelefono = this.empresa.telefono;
        params.empresaCategoria = this.empresa.categoria.slice();
        params.empresaSubcategoria = this.empresa.subcategoria.slice();
        params.sucCiudad = this.sucursal.ciudad;
        params.sucColonia = this.sucursal.colonia;
        params.sucCalle = this.sucursal.calle;
        params.sucNumero = this.sucursal.numero;
        params.sucNumeroInterior = this.sucursal.numeroInterior;
        params.sucEntreCalles = this.sucursal.entreCalles;
        params.sucCodigopostal = this.sucursal.codigoPostal;
        params.sucLat = this.sucursal.lat;
        params.sucLon = this.sucursal.lon;

        params.serNombre = this.servicioTemp.map((e: any) => e.nombre);
        params.serDuracion = this.servicioTemp.map((e: any) => e.duracion);
        params.serCosto = this.servicioTemp.map((e: any) => e.costo);

        params.perNombre = this.personalTemp.map((e: any) => e.nombre);
        params.perEmail = this.personalTemp.map((e: any) => e.email);
        params.perTelefono = this.personalTemp.map((e: any) => e.telefono);
        params.perColor = this.personalTemp.map((e: any) => e.color);

        params.idEmpresaMotivoRegistro = this.registro.selectMotivo;
        params.idPromotor = this.registro.selectPromotor;

        this._backService.HttpPost("registroEmpresa/guardarConfirmar", {}, params).subscribe(
            response => {
                if (this.registro.dataUsuario[0].idFacebook == "" || this.registro.dataUsuario[0].idFacebook == undefined) {
                    //SE LOGGEO NORMALMENTE
                    let params: any = {};
                    params.email = this.registro.dataUsuario[0].email;
                    params.idUsuario = this.registro.dataUsuario[0].id;
                    params.codigo = "MSJCONFCORREO";

                    this._backService.HttpPost("configuracion/enviarCorreo/enviarEmailConfirmacion", {}, params).subscribe(
                        response => {
                            if (response == true || response == false || response == null) {
                                let params: any = {};
                                params.email = this.registro.dataUsuario[0].email;
                                params.contrasenia = this.registro.dataUsuario[0].contrasenia;
                                params.registroUsuario = 1;
                                this._backService.HttpPost("Login/Login", {}, params).subscribe((response: ResponseData<string>) => {
                                    this._authService.CargarSession(response.data);
                                    this._pantallaServicio.ObtenerSession();
                                    this._pantallaServicio.ocultarSpinner();
                                    this.modalCorreo(this.registroEmpresaTranslate.ingreseCorreo);
                                }, error => {
                                    this._pantallaServicio.ocultarSpinner();
                                    this._toaster.error(this.loginTranslate.error);
                                });
                            } else {
                                this._pantallaServicio.ocultarSpinner();
                            }
                        },
                        error => {
                            this._pantallaServicio.ocultarSpinner();
                        }
                    )
                } else {
                    //SE LOGGEO POR FACEBOOK
                    let params: any = {};
                    params.email = this.registro.dataUsuario[0].email;
                    params.codigo = "MSJREGISTROEMPE";

                    this._backService.HttpPost("registroEmpresa/enviarEmail", {}, params).subscribe(
                        response => {
                            if (response) {
                                if (this.registro.dataUsuario[0].isCorreoFB) {
                                    this.modalCorreo(this.registroEmpresaTranslate.seEnvioCorreo);
                                } else {

                                    let params: any = {};
                                    params.i = this.registro.dataUsuario[0].id;
                                    params.c = this.registro.dataUsuario[0].email;

                                    this._backService.HttpPost("registroEmpresa/verificarUsuario", {}, params).subscribe(
                                        response => {
                                            let params: any = {};
                                            params.email = this.registro.dataUsuario[0].email;
                                            params.contrasenia = this.registro.dataUsuario[0].contrasenia;
                                            params.registroUsuario = 1;
                                            this._backService.HttpPost("Login/Login", {}, params).subscribe((response: ResponseData<string>) => {
                                                this._authService.CargarSession(response.data);
                                                this._pantallaServicio.ObtenerSession();
                                                this._pantallaServicio.ocultarSpinner();
                                                this.modalCorreo(this.registroEmpresaTranslate.ingreseCorreo);
                                            }, error => {
                                                this._pantallaServicio.ocultarSpinner();
                                                this._toaster.error(this.loginTranslate.error);
                                            });
                                        },
                                        error => {
                                            this._pantallaServicio.ocultarSpinner();
                                        }
                                    )
                                }
                            } else {
                                this._pantallaServicio.ocultarSpinner();
                            }
                        },
                        error => {
                            this._pantallaServicio.ocultarSpinner();
                        }
                    )
                }//CIERRA IF DE LOGGEO CON FACEBOOK
            },
            error => {
                this._pantallaServicio.ocultarSpinner();
            }
        )
    }

    getRandomInt(min?: any, max?: any) {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    //valida la cantidad de flotantes en Servicio - Costo
    validFlotantes(posicion?: any) {
        this.validCosto = true;
        this.mError = false;
        let valExp = RegExp("^([0-9]{0,5})([,\.][0-9]{0,2})?$");
        let valExp2 = RegExp("^[0-9.,]*$");

        if (this.servicio.costo != "" && this.servicio.costo.length > 0) {
            if (valExp2.test(this.servicio.costo[posicion])) {
                this.validCosto = true;
                this.mensaje[posicion] = "";
                if ((posicion + 1) == 1) {
                    $("#txtCosto").removeClass("errorCampo");
                } else {
                    $("#txtCosto" + (posicion + 1)).removeClass("errorCampo");
                }

            } else {

                if (this.servicio.costo[posicion] != "" && this.servicio.costo[posicion] != undefined) {
                    this.validCosto = false;
                    this.mError = true;
                    this.mensaje[posicion] = this.registroEmpresaTranslate.precioNumerico;
                    if ((posicion + 1) == 1) {
                        $("#txtCosto").addClass("errorCampo");
                    } else {
                        $("#txtCosto" + (posicion + 1)).addClass("errorCampo");
                    }
                }
            }

            if (this.validCosto) {
                if (valExp.test(this.servicio.costo[posicion])) {
                    if (this.servicio.costo[posicion] != ".") {
                        this.validCosto = true;
                        this.mensaje[posicion] = "";
                        if ((posicion + 1) == 1) {
                            $("#txtCosto").removeClass("errorCampo");
                        } else {
                            $("#txtCosto" + (posicion + 1)).removeClass("errorCampo");
                        }
                    } else {
                        if (this.servicio.costo[posicion] != "" && this.servicio.costo[posicion] != undefined) {
                            this.validCosto = false;
                            this.mError = true;
                            this.mensaje[posicion] = this.registroEmpresaTranslate.precioFormato;
                            if ((posicion + 1) == 1) {
                                $("#txtCosto").addClass("errorCampo");
                            } else {
                                $("#txtCosto" + (posicion + 1)).addClass("errorCampo");
                            }
                        }
                    }

                } else {
                    if (this.servicio.costo[posicion] != "" && this.servicio.costo[posicion] != undefined) {
                        this.validCosto = false;
                        this.mError = true;
                        this.mensaje[posicion] = this.registroEmpresaTranslate.precioFormato;
                        if ((posicion + 1) == 1) {
                            $("#txtCosto").addClass("errorCampo");
                        } else {
                            $("#txtCosto" + (posicion + 1)).addClass("errorCampo");
                        }
                    }
                }
            }
        }

        if (this.mError) {
            return 1;
        }
        else {
            return 0;
        }
    }

    //valida la duracion de Servicio - Duracion
    validarRangoDuracion(posicion?: any) {
        this.validRangoDuracion = true;
        this.mError = false;
        if (this.servicio.duracion[posicion] != "" && this.servicio.duracion[posicion] != undefined) {
            if (parseInt(this.servicio.duracion[posicion], 10) >= 10 && parseInt(this.servicio.duracion[posicion], 10) <= 480) {
                this.mensaje2[posicion] = "";
                this.validRangoDuracion = true;
                if (posicion == 0) {
                    $("#txtDuracion").removeClass("errorCampo");
                } else {
                    $("#txtDuracion" + (posicion + 1)).removeClass("errorCampo");
                }
            } else {
                this.mError = true;
                this.mensaje2[posicion] = this.registroEmpresaTranslate.duracionRango;
                this.validRangoDuracion = false;
                if (posicion == 0) {
                    $("#txtDuracion").addClass("errorCampo");
                } else {
                    $("#txtDuracion" + (posicion + 1)).addClass("errorCampo");
                }
            }
        }

        if (this.mError) {
            return 1;
        }
        else {
            return 0;
        }
    }

    //Valida los campos en el ng-focus
    validar(texto?: any, mensaje?: any) {
        if (this.error && (this.mensaje[mensaje] == "" || this.mensaje[mensaje] == undefined)) {
            $("#" + texto).removeClass("errorCampo");
        }

        for (let i = 0; i < 6; i++) {
            if (this.mError && (texto == ("txtDuracion" + i) || texto == ("txtDuracion")) && (this.mensaje2[mensaje] != "" && this.mensaje2[mensaje] != undefined)) {
                $("#" + texto).addClass("errorCampo");
            }

            if (this.mError && (texto == ("txtDuracion" + i) || texto == ("txtDuracion")) && (this.mensaje2[mensaje] == "" || this.mensaje2[mensaje] == undefined)) {
                $("#" + texto).removeClass("errorCampo");
            }
        }

        for (let i = 0; i < 6; i++) {
            if ((texto == ("txtDuracion" + i) || texto == ("txtDuracion")) && (this.mensaje2[mensaje] != "" && this.mensaje2[mensaje] != undefined)) {
                $("#" + texto).addClass("errorCampo");
            }
        }

        for (let i = 0; i < 6; i++) {
            if (this.mError && (texto == ("txtNombreP" + i) || texto == ("txtNombreP")) && (this.mensaje2[mensaje] != "" && this.mensaje2[mensaje] != undefined)) {
                $("#" + texto).addClass("errorCampo");
            }

            if (this.mError && (texto == ("txtNombreP" + i) || texto == ("txtNombreP")) && (this.mensaje2[mensaje] == "" || this.mensaje2[mensaje] == undefined)) {
                $("#" + texto).removeClass("errorCampo");
            }
        }

        if (this.error && texto == "txtCategoriaE" && this.empresa.categoria.length == 0) {
            $("#" + texto).addClass("errorCampo");
            $("#txtSubCategoriaE").addClass("errorCampo");
        } else {
            $("#txtCategoriaE").removeClass("errorCampo");
            if (this.error && (this.empresa.subcategoria == "" || this.empresa.subcategoria == undefined || this.empresa.subcategoria.length == 0) && !this.empresa.carga) {
                $("#txtSubCategoriaE").addClass("errorCampo");
            }
        }

        if (this.error && texto == "txtSubCategoriaE" && this.empresa.subcategoria.length == 0) {
            $("#" + texto).addClass("errorCampo");
        } else {
            $("#txtSubCategoriaE").removeClass("errorCampo");
        }

        if (this.errorMapa && this.sucursal.direccion == "") {
            $("#" + texto).removeClass("errorCampo");
        } else {
            $("#txtDireccion").removeClass("errorCampo");
        }

        if (this.mErrorMapa) {
            $("#txtDireccion").addClass("errorCampo");
        }
    }

    validarMaxCategorias() {
        if (this.sucursal.categorias.length > 3) {
            this.validMaxCategorias = false;
            this.msgCategorias = this.sucursalTranslate.maxCategorias;
            $("#ddlCategorias").addClass("errorCampo");
        } else {
            this.validMaxCategorias = true;
            this.msgCategorias = "";
            $("#ddlCategorias").removeClass("errorCampo");
        }
    }


    //valida los campos en el ng-blur
    validarBlur(texto?: any, mensaje?: any, valor?: any) {
        if (this.error && (valor == "" || valor == undefined)) {
            $("#" + texto).addClass("errorCampo");
        }

        if (this.error && valor == "" && this.mensaje[mensaje] != "") {
            $("#" + texto).addClass("errorCampo");
        }

        if (texto == "txtDireccion" && valor == "" && valor != 0 && this.errorMapa) {
            $("#" + texto).addClass("errorCampo");
        }
        else {
            $("#txtDireccion").removeClass("errorCampo");
        }

        if (texto == "txtNumeroS" && valor != "" && valor.length > 10 && this.error) {
            $("#txtNumeroS").addClass("errorCampo");
        }

        if (this.errorMapa && valor == "") {
            $("#" + texto).addClass("errorCampo");
        } else {
            $("#txtDireccion").removeClass("errorCampo");
        }

        if (this.mErrorMapa) {
            $("#txtDireccion").addClass("errorCampo");
        }

    }

    //cambia a la tab de personal en la parte superior del wizard
    tabPersonal() {
        if (this.tab == 1) {
            this.empresa.guardarEmpresa();
            if (this.tab != 2) {
                setTimeout(function () {
                    (document.getElementById("Tab1") as any).className += " active";
                    (document.getElementById("Tab2") as any).className = (document.getElementById("Tab2") as any).className.replace(/(?:^|\s)active(?!\S)/g, '');
                }, 1)

            }
        }

        if (this.tab == 3) {
            this.back();
        }

    }

    //cambia a la tab de empresa en la parte superior del wizard
    tabEmpresa() {
        if (this.tab == 2) {
            this.back();
        }
        if (this.tab == 3) {
            this.back();
            this.back();
        }
    }

    //cambia a la tab de servicio en la parte superior del wizard
    tabServicio() {
        if (this.tab == 1) {
            this.empresa.guardarEmpresa();
            if (this.tab != 2) {
                setTimeout(function () {
                    (document.getElementById("Tab1") as any).className += " active";
                    (document.getElementById("Tab3") as any).className = (document.getElementById("Tab3") as any).className.replace(/(?:^|\s)active(?!\S)/g, '');
                }, 1)

            }
        }

        if (this.tab == 2) {
            this.personal.guardarPersonal();
            if (this.tab != 3) {
                setTimeout(function () {
                    (document.getElementById("Tab1") as any).className += " active";
                    (document.getElementById("Tab2") as any).className += " active";
                    (document.getElementById("Tab3") as any).className = (document.getElementById("Tab3") as any).className.replace(/(?:^|\s)active(?!\S)/g, '');
                }, 1)

            }
        }
    }

    //Modal de correo que se muestra al terminar el wizard
    modalCorreo(mensaje?: any) {
        this.modales.modalCorreoEnviado.show();
        this.mensajeConfirmadoEnviado = mensaje;
        $('#modalCorreoEnviado').modal({ backdrop: 'static', keyboard: false });
        $("#modalCorreoEnviado .modal-body").html('<span class="title">' + mensaje + '</span>');
    }

    login() {

        if (
            (this.empresa.nombre != "" && this.empresa.nombre != undefined) ||
            (this.empresa.telefono != "" && this.empresa.telefono != undefined) ||
            this.empresa.categoria.length != 0 ||
            this.empresa.subcategoria.length != 0 ||
            (this.sucursal.pais != "" && this.sucursal.pais != undefined) ||
            (this.sucursal.estado != "" && this.sucursal.estado != undefined) ||
            this.sucursal.ciudad != undefined ||
            (this.sucursal.colonia != "" && this.sucursal.colonia != undefined) ||
            (this.sucursal.calle != "" && this.sucursal.calle != undefined) ||
            (this.sucursal.numero != "" && this.sucursal.numero != undefined) ||
            (this.sucursal.numeroInterior != "" && this.sucursal.numeroInterior != undefined) ||
            (this.sucursal.entreCalles != "" && this.sucursal.entreCalles != undefined) ||
            (this.sucursal.codigoPostal != "" && this.sucursal.codigoPostal != undefined) ||
            (this.sucursal.direccion != "" && this.sucursal.direccion != undefined) ||
            (this.servicio.costo != "" && this.servicio.costo != undefined) ||
            (this.servicio.duracion != "" && this.servicio.duracion != undefined) ||
            (this.servicio.nombre != "" && this.servicio.nombre != undefined)
        ) {

            $('#modalLogin').modal();
            $("#modalLogin .modal-body").html('<span class="title">' + this.registroEmpresaTranslate.descartarCambios + '</span>');

            $('#modalLogin').on('hidden.bs.modal', (e: any) => {
                $('#modal-responsive').addClass('modal-open');
                $('body').css('overflow', 'hidden');
            });
        } else {
            location.href = "Login.html";
        }


    }

    //Cambia a la siguiente tab (boton de siguiente)
    next() {
        const nextTabProcess = this.tabSelect + 1;
        this.bAcceso = 0;

        if (nextTabProcess < 3) {
            this.tabSelect = nextTabProcess;
        }
    }

    //Cambia a la tab anterior (boton de regreso)
    back() {
        this.mError = false;
        this.error = false;
        this.mErrorMapa = false;

        const afterTabProcess = this.tabSelect - 1;

        if (afterTabProcess > -1) {
            this.mensaje = [];
            this.mensaje2 = [];
            this.tabSelect = afterTabProcess;
            this.registro.alta--;
        }
    }

    //Carga el data de Medios
    consultarMotivos() {
        this._backService.HttpPost("registroEmpresa/getMotivosRegistro", {}, {}).subscribe(
            response => {
                this.registro.dataMotivos = eval(response);
                this.registro.alturaModal = 205;
            },
            error => {
            }
        )
    }

    //Carga el data de Promotores
    consultarPromotores(idMotivo?: any) {
        this.registro.selectPromotor = "";
        let params = {};
        if (idMotivo == 1) {
            this._pantallaServicio.mostrarSpinner();
            $("#motivos").removeClass("errorCampo");
            this._backService.HttpPost("registroEmpresa/getPromotores", {}, {}).subscribe(
                response => {
                    this.registro.dataPromotores = eval(response);
                    this.registro.alturaModal = 270;
                    this.registro.isPromotor = true;
                    this._pantallaServicio.ocultarSpinner();
                },
                error => {
                    this._pantallaServicio.ocultarSpinner();
                }
            )
        } else {
            $("#motivos").removeClass("errorCampo");
            this.registro.alturaModal = 205;
            this.registro.isPromotor = false;
        }
    };

    //Valida el select de promotores con un onchange
    quitarError(idPromotor?: any) {
        if (idPromotor != undefined) {
            $("#nombrePromotor").removeClass("errorCampo");
        }
    };

    //Cierra el modal de Conocer Mas
    cerrarModalConocerMas() {
        this.modales.modalConocerMas.hide();
    };

    //Valida si el usuario esta ligado a un promotor, de lo contrario lanza el modal para tratar de ligarlo a uno.
    validarPromotorLigado() {
        let params: any = {};
        params.idUsuario = this.registro.idUsuario;
        this._backService.HttpPost("RegistroEmpresa/validarPromotorLigado", {}, params).subscribe(
            response => {
                if (response != 0) {
                    this.registro.selectPromotor = response;
                    this.registro.selectMotivo = 1;
                } else {
                    this.registro.alturaModal = 205;
                    this.modales.modalConocerMas.show();
                }
                this._pantallaServicio.ocultarSpinner();
            },
            error => {
                this._pantallaServicio.ocultarSpinner();
            }
        )
    };

    //Registra la respuesta del usuario, tanto del motivo como del promotor en su caso
    registrarRespuesta() {
        if (this.registro.isPromotor) {
            $("#motivos").removeClass("errorCampo");
            if (this.registro.selectPromotor == "" || this.registro.selectPromotor == undefined) {
                $("#nombrePromotor").addClass("errorCampo");
            } else {
                $("#nombrePromotor").removeClass("errorCampo");
                $("#motivos").removeClass("errorCampo");
                this.modales.modalConocerMas.hide();
            }
        } else {
            if (this.registro.selectMotivo == "" || this.registro.selectMotivo == undefined) {
                $("#motivos").addClass("errorCampo");
            } else {
                $("#nombrePromotor").removeClass("errorCampo");
                $("#motivos").removeClass("errorCampo");
                this.modales.modalConocerMas.hide();
            }
        }
    };

    validarNum(e: any) {
        let key;
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

    nextTab() {
        if (this.tabSelect == 0) {
            this.guardarEmpresa()
            return;
        }
        if (this.tabSelect == 1) {
            this.guardarPersonal()
            return;
        }
        if (this.tabSelect == 2) {
            this.guardarServicio()
            return;
        }
    }

    cargarUsuario() {
        this._pantallaServicio.mostrarSpinner();
        this._backService.HttpPost("RegistroEmpresa/getIdRegistroUsuario", {}, {}).subscribe(
            response => {
                if (response == undefined || response == "" || response == null || response == "[]")
                    this._router.navigate(["/login"]);
                else {
                    $("#divBienvenida").show();
                    $("#wizardBody").show();
                    this.registro.dataUsuario = eval(response);
                    this.registro.idUsuario = this.registro.dataUsuario[0].id;
                    this.personalTemp.push({
                        nombre: JSON.parse(JSON.stringify(this.registro.dataUsuario[0].nombre)),
                        email: JSON.parse(JSON.stringify(this.registro.dataUsuario[0].email)),
                        telefono: JSON.parse(JSON.stringify(this.registro.dataUsuario[0].telefono)),
                        color: '',
                    })

                    this._backService.HttpPost("RegistroEmpresa/getCorreoFB", {}, {}).subscribe(
                        response => {
                            this.registro.dataUsuario[0].isCorreoFB = response;
                            this.validarPromotorLigado();
                        },
                        error => {
                            this._pantallaServicio.ocultarSpinner();
                        }
                    );
                }
            },
            error => {
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
            }
        )
    }

    redirectHome() {
        this.modales.modalCorreoEnviado.hide();
        this._pantallaServicio.CargaPrincipalDelSistema(2);
        this._router.navigate(['/procesos/agenda']);
    }
}
