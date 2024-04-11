import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MethodsService } from 'src/app/core/services/methods.service';
import { PantallaService } from 'src/app/core/services/pantalla.service';
import { ToasterService } from 'src/shared/toaster/toaster.service';
declare var $: any; // JQUERY
import * as bootstrap from 'bootstrap'; // BOOTSTRAP
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'app-cambio-tipo-creacion-edicion',
    templateUrl: './cambio-tipo-creacion-edicion.component.html',
    styleUrls: ['./cambio-tipo-creacion-edicion.component.scss', '../../../page.component.scss']
})
export class CambioTipoCreacionEdicionComponent implements OnInit {

    // Variables de Translate
    cambioTipoTranslate: any = {};

    // Modales
    modales: any = {};

    constructor(private _translate: TranslateService,
        private _backService: MethodsService,
        public _pantallaServicio: PantallaService,
        private _dialog: MatDialog,
        private _router: Router,
        private _toaster: ToasterService,
        private _route: ActivatedRoute,
        private matIconRegistry: MatIconRegistry, 
        private domSanitizer: DomSanitizer) {

        this._translate.setDefaultLang(this._pantallaServicio.idioma);
        this._translate.use(this._pantallaServicio.idioma);

        this._translate.get('cambioTipoTranslate').subscribe((translated) => {
            this.cambioTipoTranslate = this._translate.instant('cambioTipoTranslate');
        });

        this.matIconRegistry.addSvgIcon('iconCasa1', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Casa1-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconFlecha1DerechaPeque', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/FlechaDerechaPequena-icon.svg"));
    }

    ngOnInit(): void {
        this._route.queryParams.subscribe(params => {
            this.stateParams_idCambioTipo = params["idCambioTipo"];
        });
        this.cambio_tipo = this.stateParams_idCambioTipo;

        if (this.cambio_tipo == 'N')
            $('#bodyCambioTipo').css('display', 'none');

        // if (document.getElementById("styleGeneral") != null)
        //     $("#styleGeneral").remove();
        // var style = document.createElement('style');
        // style.type = 'text/css';
        // style.id = 'styleGeneral';
        // style.innerHTML = ".alignCenter{text-align:center}.alignLeft{text-align:left}.alignRight{text-align:right}.alignCenter2{text-align:center;cursor:default}.modal-footer{border-top:none!important}.hideScroll .ngViewport{overflow-y:auto;overflow-x:hidden}.modal{overflow:auto!important}";
        // document.getElementsByTagName('head')[0].appendChild(style);

        this.consultaCambio_tipo();
        this.iniciarPantalla();
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

        if ($("body").find(".modal-confirm").length > 1) {
            $("body").find(".modal-confirm")[1].remove();
        }
        this.modales.modalConfirm = new bootstrap.Modal($("#modal-confirm").appendTo("body"), {
            backdrop: "static",
            keyboard: false,
        });

        if ($("body").find(".modal-montos").length > 1) {
            $("body").find(".modal-montos")[1].remove();
        }
        this.modales.modalMontos = new bootstrap.Modal($("#modal-montos").appendTo("body"), {
            backdrop: "static",
            keyboard: false,
        });

    }

    rootScope_fromState = "";
    stateParams_idCambioTipo: any;

    //Variables utilizadas
    cambio = {
        tipoMonedaSeleccionada: null
    };
    cambio_tipo: any;

    monto = "";
    prefijo = "";

    mensaje = "";
    guardar = false;
    montoVacio = true;
    prefijoVacio = true;
    estaActivo = true;
    monedaBase = false;
    dataCambio_tipo: any = [];
    dataMonedaTipo = [];

    //Diseño de las notificaciones
    paramsNotifi8 = {
        life: 3000,
        theme: "lime",
        sticky: false
    }

    consultaExitosa = true;

    accesoTotal: any;
    dataGrid: any;
    consultaCambio_tipo() {            
        this._backService.HttpPost("catalogos/Cambio_tipo/consultaCambio_tipo", {}, {}).subscribe((data: any) => {
            this.dataGrid = eval(data);
            if (this.dataGrid.length != 0) {
                this.consultaExitosa = false;
            }
        }, error => {

        });
    }

    inhabilitar1: any;
    inhabilitar2: any;
    //Si cambia el primer switch también cambia el segundo
    validacionMonedaBase() {
        if (this.estaActivo == true) {
            this.inhabilitar2 = false;
            $('#onoffswitch2').removeClass('onoffswitch-inner-disable');
        }
        else {
            this.monedaBase = false;
            this.inhabilitar2 = true;
            $('#onoffswitch2').addClass('onoffswitch-inner-disable');
        }
    }

    titulo: any;
    //Función que verifica si es uno nuevo o si se va a actualizar y carga la pantalla 
    iniciarPantalla() {
        var valExp1 = RegExp("^[0-9]*$");
        var valExp2 = RegExp("^[0-9N]*$");

        //Verifica si el parámetro son números o N
        if (valExp2.test(this.cambio_tipo)) {
            if (valExp1.test(this.cambio_tipo)) {
                this.titulo = this.cambioTipoTranslate.actualizar;
                this.cargarCambio_tipo();
            }
            else {
                if (this.cambio_tipo == "N") {
                    this.consultaMonedaTipo();

                    this.titulo = this.cambioTipoTranslate.nuevo;
                }
                else {
                    this._router.navigate(["/configuraciones/consultaCambioTipo"]);
                }
            }
        }
        else {
            this._router.navigate(["/configuraciones/consultaCambioTipo"]);
        }
    }

    //Función que carga un registro para actualizar
    cargarCambio_tipo() {
        var params: any = {};
        params.idCambioTipo = this.cambio_tipo;

        this._backService.HttpPost("catalogos/Cambio_tipo/cargarCambio_tipo", {}, params).subscribe((data: any) => {
            this.dataCambio_tipo = eval(data);
            if (this.dataCambio_tipo == 0) {
                this._router.navigate(["/configuraciones/consultaCambioTipo"]);
            }
            else {
                this.monto = this.dataCambio_tipo[0].monto;
                this.cambio.tipoMonedaSeleccionada = this.dataCambio_tipo[0].idMonedaTipo;
                this.estaActivo = this.dataCambio_tipo[0].estaActivo;
                this.monedaBase = this.dataCambio_tipo[0].esMonedaBase;
                this.prefijo = this.dataCambio_tipo[0].prefijo;
                this.consultaMonedaTipo();
                if (this.monedaBase == true) {
                    this.inhabilitar1 = true;
                    this.inhabilitar2 = true;
                    $('#onoffswitch1').addClass('onoffswitch-inner-disable');
                    $('#onoffswitch2').addClass('onoffswitch-inner-disable');
                }
                else {
                    if (this.estaActivo == false) {
                        this.inhabilitar2 = true;
                        $('#onoffswitch2').addClass('onoffswitch-inner-disable');
                    }
                    else {
                        this.inhabilitar1 = false;
                        this.inhabilitar2 = false;
                    }
                }
            }
        }, error => {

        });
    }

    consultaMonedaTipo() {
        this._backService.HttpPost("catalogos/Cambio_tipo/consultaMonedaTipo", {}, {}).subscribe((data: any) => {
            this.dataMonedaTipo = eval(data);
            if (this.cambio_tipo == 'N')
                $('#bodyCambioTipo').css('display', 'block');
        }, error => {

        });
    }

    error: any;
    
    // Función que también verifica si se va a agregar o actualizar y lo manda a la función correspondiente.
    accionGuardar() {
        this.guardar = true;
        this.error = true;
        if (this.cambio_tipo == "N") {
            this.guardarCambio_tipo();
        }
        if (this.cambio_tipo != "N") {
            this.actualizarCambio_tipo();
        }
    }

    direccion: any;

    //Función que verifica si al actualizar se hicieron cambios pero se cancelaron
    accionCancelar(direccion: any) {
        this.direccion = direccion;
        if (this.cambio_tipo == "N") {
            if (this.monto != "" || this.cambio.tipoMonedaSeleccionada != "" || this.prefijo != "") {
                this.confirm(this.cambioTipoTranslate.deseaDescartar);
            }
            else {
                if (this.estaActivo != true || this.monedaBase != false) {
                    this.confirm(this.cambioTipoTranslate.deseaDescartar);
                }
                else {
                    this._router.navigate(["/" + this.direccion]);
                }
            }
        }
        if (this.cambio_tipo != "N") {

            if (this.dataCambio_tipo[0].monto != this.monto || this.dataCambio_tipo[0].idMonedaTipo != this.cambio.tipoMonedaSeleccionada ||
                this.dataCambio_tipo[0].prefijo != this.prefijo) {
                this.confirm(this.cambioTipoTranslate.deseaDescartar);
            }
            else {
                if (this.dataCambio_tipo[0].estaActivo != this.estaActivo || this.dataCambio_tipo[0].esMonedaBase != this.monedaBase) {
                    this.confirm(this.cambioTipoTranslate.deseaDescartar);
                }
                else {
                    this._router.navigate(["/" + this.direccion]);
                }
            }
        }
    }

    redireccion() {
        this._router.navigate(["/" + this.direccion]);
    }

    camposVacios: any;
    camposIncorrectos: any;
    mensajePrefijo: any;
    exito: any;

    //Función que verifica que la información sea correcta y guarda un registro
    guardarCambio_tipo() {
        $("#botonGuardar").addClass("disabled");
        var params: any = {};

        params.monto = this.monto;
        params.idMonedaTipo = this.cambio.tipoMonedaSeleccionada;
        params.estaActivo = this.estaActivo;
        params.esMonedaBase = this.monedaBase;
        params.prefijo = this.prefijo;

        var valExp = RegExp("^[0-9.,]*$");
        var valExp2 = RegExp("^([0-9,]{0,6})([,\.][0-9]{0,4})?$");


        this.camposVacios = 0;
        this.camposIncorrectos = 0;

        if (!this.cambio.tipoMonedaSeleccionada) {
            //$("#ddlMoneda").addClass("errorCampo");
            $("#ddlMoneda > div:first-child").attr("style", "outline: red solid 1px !important;");
            this.camposVacios++;
        }

        if (this.monto == "") {
            $("#txtMonto").addClass("errorCampo");
            this.mensaje = "";
            this.camposVacios++;
            this.montoVacio = true;
        }
        else {
            if (!valExp.test(this.monto) || this.monto == ".") {
                $("#txtMonto").addClass("errorCampo");
                this.mensaje = this.cambioTipoTranslate.montoNumerico;
                this.camposIncorrectos++;
                this.montoVacio = false;
            }
            else {
                if (!valExp2.test(this.monto)) {
                    $("#txtMonto").addClass("errorCampo");
                    this.mensaje = this.cambioTipoTranslate.montoDecimales;
                    this.camposIncorrectos++;
                    this.montoVacio = false;
                }
                else {
                    $("#txtMonto").removeClass("errorCampo");
                    this.mensaje = "";
                }
            }
        }

        if (this.prefijo == "") {
            $("#txtPrefijo").addClass("errorCampo");
            this.mensajePrefijo = "";
            this.camposVacios++;
            this.prefijoVacio = true;
        }

        if (this.camposVacios == 0 && this.camposIncorrectos == 0) {
            this._backService.HttpPost("catalogos/Cambio_tipo/guardarCambio_tipo", {}, params, "text").subscribe((data: any) => {
                this.exito = data;
                $("#botonGuardar").removeClass("disabled");
                if (this.exito == "0") {
                    if (params.esMonedaBase == true) {
                        this.modalCambiarMontos(this.cambioTipoTranslate.recuerdeCambiar);
                    }
                    else {
                        this._router.navigate(["/configuraciones/consultaCambioTipo"]);
                    }
                }
                else {
                    if (this.exito == "1") {
                        $("#txtMonto").addClass("errorCampo");
                        this.mensaje = this.cambioTipoTranslate.yaExisteMonto;
                        this.montoVacio = false;
                    }
                    else {
                        $("#txtMonto").addClass("errorCampo");
                        this.mensaje = this.cambioTipoTranslate.montoMayor;
                        this.montoVacio = false;
                    }
                }
            }, error => {

            });
        }
        else {
            $("#botonGuardar").removeClass("disabled");
        }
    }

    //Función que verifica que la información sea correcta y actualiza un registro
    actualizarCambio_tipo() {
        $("#botonGuardar").addClass("disabled");
        var params: any = {};

        params.idCambioTipo = this.cambio_tipo;
        params.monto = this.monto;
        params.idMonedaTipo = this.cambio.tipoMonedaSeleccionada;
        params.estaActivo = this.estaActivo;
        params.esMonedaBase = this.monedaBase;
        params.prefijo = this.prefijo;

        var valExp = RegExp("^[0-9.,]*$");
        var valExp2 = RegExp("^([0-9,]{0,6})([,\.][0-9]{0,4})?$");

        this.camposVacios = 0;
        this.camposIncorrectos = 0;

        if (!this.cambio.tipoMonedaSeleccionada) {
            //$("#ddlMoneda").addClass("errorCampo");
            $("#ddlMoneda > div:first-child").attr("style", "outline: red solid 1px !important;");
            this.camposVacios++;
        }

        if (this.monto == "") {
            $("#txtMonto").addClass("errorCampo");
            this.mensaje = "";
            this.camposVacios++;
            this.montoVacio = true;
        }
        else {
            if (!valExp.test(this.monto) || this.monto == ".") {
                $("#txtMonto").addClass("errorCampo");
                this.mensaje = this.cambioTipoTranslate.montoNumerico;
                this.camposIncorrectos++;
                this.montoVacio = false;
            }
            else {
                if (!valExp2.test(this.monto)) {
                    $("#txtMonto").addClass("errorCampo");
                    this.mensaje = this.cambioTipoTranslate.montoDecimales;
                    this.camposIncorrectos++;
                    this.montoVacio = false;
                }
                else {
                    $("#txtMonto").removeClass("errorCampo");
                    this.mensaje = "";
                }
            }
        }
        if (this.prefijo == "") {
            $("#txtPrefijo").addClass("errorCampo");
            this.mensajePrefijo = "";
            this.camposVacios++;
            this.prefijoVacio = true;
        }

        if (this.camposVacios == 0 && this.camposIncorrectos == 0) {
            this._backService.HttpPost("catalogos/Cambio_tipo/actualizarCambio_tipo", {}, params, "text").subscribe((data: any) => {
                this.exito = data;
                $("#botonGuardar").removeClass("disabled");
                if (this.exito == "0") {
                    if (params.esMonedaBase == true) {
                        this.modalCambiarMontos(this.cambioTipoTranslate.recuerdeCambiar);
                    }
                    else {
                        this._router.navigate(["/configuraciones/consultaCambioTipo"]);
                    }
                }
                else {
                    if (this.exito == "1") {
                        $("#txtMonto").addClass("errorCampo");
                        this.mensaje = this.cambioTipoTranslate.yaExisteMonto;
                        this.montoVacio = false;
                    }
                    else {
                        $("#txtMonto").addClass("errorCampo");
                        this.mensaje = this.cambioTipoTranslate.montoMayor;
                        this.montoVacio = false;
                    }
                }
            }, error => {

            });
        }
        else {
            $("#botonGuardar").removeClass("disabled");
        }
    }

    redireccionConsulta() {
        this._router.navigate(["/configuraciones/consultaCambioTipo"]);
    }

    focus(id: any) {
        if (this.guardar) {
            switch (id) {
                case 'txtMonto':
                    if (this.monto == "" && this.montoVacio) {
                        $("#" + id).removeClass("errorCampo");
                    }
                    break;
                case 'txtPrefijo':
                    if (this.prefijoVacio) {
                        $("#" + id).removeClass("errorCampo");
                    }
                    break;
            }
        }
    }

    blur(id: any) {
        if (this.guardar) {
            var x: any = document.getElementById(id);
            if (x.value == "" || x.value == undefined) {
                $("#" + id).addClass("errorCampo");
            }
        }
    }

    confirm(message: any) {
        $("#modal-confirm .modal-body").html('<span class="title">' + message + '</span>');
        this.modales.modalConfirm.show();
    };

    mostrarModal(message: any) {
        $("#modal-alert .modal-body").html('<span class="title">' + message + '</span>');
        this.modales.modalAlert.show();
    };

    modalCambiarMontos(message: any) {
        $("#modal-montos .modal-body").html('<span class="title">' + message + '</span>');
        this.modales.modalMontos.show();
    };

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

    onClickDdl(elemento: any) {
        if (this.guardar) {
            //$("#" + elemento).removeClass('errorCampo');     
            $("#" + elemento + " > div:first-child").attr("style", "outline: none;");
        }
    }

    irAAgenda(){
        this._router.navigate(['/procesos/agenda']);
    }

    irACambioTipo(){
        this._router.navigate(['/configuraciones/consultaCambioTipo']);
    }
}
