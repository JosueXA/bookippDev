import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToasterService } from 'src/shared/toaster/toaster.service';
import { ResponseData } from '../core/models/response-data.model';
import { LoginService } from './login.service';
import { AuthService } from "../core/services/auth.service";
import { PantallaService } from "src/app/core/services/pantalla.service";
import { TranslateService } from '@ngx-translate/core'; // TRANSLATE
declare var $: any; // JQUERY
import * as bootstrap from 'bootstrap'; // BOOTSTRAP
import { environment } from 'src/environments/environment';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material/icon';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss', '../page/page.component.scss']
})
export class LoginComponent implements OnInit {
    showPass: boolean = false;
    isApiLoading: boolean = false;
    sessionValues: UntypedFormGroup;
    modales: any = {};
    mError: any = false;
    recContra: any = "";
    mensaje: any = [];
    loginTranslate: any = {};
    registro: any = {
        nombre: "",
        email: "",
        contrasenia: "",
        confContrasenia: ""
    };

    constructor(private _fb: UntypedFormBuilder,private domSanitizer: DomSanitizer, private matIconRegistry: MatIconRegistry, private _router: Router, private _toaster: ToasterService, private _backService: LoginService, private _authService: AuthService, public _pantallaService: PantallaService, private _translate: TranslateService) {
        var userLang = (navigator.language).toLocaleLowerCase();
        switch (userLang.substring(0, 2)) {
            case 'en': userLang = 'en-us'; break;
            default: userLang = 'es-mx'; break;
        }
        var lang = userLang;

        this._translate.setDefaultLang(lang);
        this._translate.use(lang);

        this._translate.get('servicioTranslate.inicio').subscribe((translated: string) => {
            this.loginTranslate = this._translate.instant('loginTranslate');
        });

        this.sessionValues = this._fb.group({
            email: [null, [Validators.required, Validators.email]],
            contrasenia: [null, [Validators.required]]
        });

        this.matIconRegistry.addSvgIcon('iconCorreo', this.domSanitizer.bypassSecurityTrustResourceUrl("../assets/icons/finales/Correo-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconCandado', this.domSanitizer.bypassSecurityTrustResourceUrl("../assets/icons/finales/Candado-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconFacebook', this.domSanitizer.bypassSecurityTrustResourceUrl("../assets/icons/finales/LogIn-icon.svg")); // FALTA ICONO
        this.matIconRegistry.addSvgIcon('iconCruzCirculo', this.domSanitizer.bypassSecurityTrustResourceUrl("../assets/icons/finales/10-2-TiposdeExcepcion-icon.svg"));
    }

    ngOnInit(): void {
        if(localStorage.getItem('tokenBookipp')){
            this._pantallaService.session = {};
            this._pantallaService.permisos_visualizacion = {};
            this._authService.CerrarSession();
            location.reload();
        }
        else{
            this._pantallaService.ocultarSpinner();
            this.crearModales();
        }
    }

    // ---------------- CREAR MODALES ----------------
    crearModales() {
        if ($('body').find('.recuperarContra').length > 1) {
            $('body').find('.recuperarContra')[1].remove();
        }
        this.modales.recuperarContra = new bootstrap.Modal($("#recuperarContra").appendTo("body"), {
            backdrop: "static",
            keyboard: false,
        });

        if ($('body').find('.registro').length > 1) {
            $('body').find('.registro')[1].remove();
        }
        this.modales.registro = new bootstrap.Modal($("#registro").appendTo("body"), {
            backdrop: "static",
            keyboard: false,
        });
    }

    // ---------------- INICIAR SESIÓN ----------------
    signIn() {
        if (this.sessionValues.valid) {
            this._pantallaService.mostrarSpinner();
			var params: any = {};
			params = this.sessionValues.value;
			params.registroUsuario = 0;
            this._backService.HttpPost("Login/Login", {}, params).subscribe((response: ResponseData<string>) => {
                this._authService.CargarSession(response.data);
                this._pantallaService.ObtenerSession();
                this._pantallaService.ocultarSpinner();

                if(this._pantallaService.session.rs == "True"){
                    this._pantallaService.CargaPrincipalDelSistema(2);
                    this._router.navigate(['/procesos/agenda']);
                }

                if(this._pantallaService.session.rs == "Wizard"){
                    this._router.navigate(['/registro-empresa']);
                }
            }, error => {
                this._pantallaService.ocultarSpinner();
                this._toaster.error(this.loginTranslate.error);
            });
            return;
        }
        // this._toaster.error('Verificar los campos requeridos');
    }

    cerrarModalCorreoFBI() {
    //   this.mError = false;
    //   this.limpiarDatos("1");
    //   $('#loginBtn').removeClass('disabled');
    //   $('#correoFBI').modal('hide');
  }

    // ---------------- RECUPERAR CONTRASEÑA ----------------
    correoModal() {
        this.mError = false;
        this.recContra = "";
        this.mensaje = [];
        $("#txtRecContra").removeClass("errorCampo");
        this.modales.recuperarContra.show();
    }

    validar(texto: any, mensaje: any) {
        if (this.mensaje[mensaje] == "" || this.mensaje[mensaje] == undefined) {
            $("#" + texto).removeClass("errorCampo");
        }

        if (this.mError && mensaje == "") {
            this.validarBlur(texto, mensaje)
        }
    }

    validarBlur(texto: any, valor: any) {
        if (this.mError && valor == "") {
            $("#" + texto).addClass("errorCampo");
        }
    }

    recuperarContra() {
        this.mError = false;
        this.mensaje = [];
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        var flag = 0;

        if (this.recContra == "" || this.recContra == undefined) {
            $("#txtRecContra").addClass("errorCampo");
            this.mError = true;
            flag++;
        } else {
            if (!re.test(this.recContra)) {
                $("#txtRecContra").addClass("errorCampo");
                this.mensaje[0] = this.loginTranslate.correoErroneo;
                this.mError = true;
                flag++;
            } else {
                $("#txtRecContra").removeClass("errorCampo");
            }
        }

        if (flag == 0) {
            var params: any = {};
            params.email = this.recContra;
            this._backService.HttpPost("seguridad/validarCorreo", {}, params).subscribe((response: string) => {
                if (response) {
                    var params2: any = {};
                    params2.email = this.recContra;
                    params2.codigo = "MSJRECUCONWEB";
                    this._backService.HttpPost("configuracion/enviarCorreo/enviarNuevaContrasenia", {}, params2).subscribe((response2: string) => {
                        if (response2) {
                            this._toaster.success(this.loginTranslate.cuentaRecuperar);
                        }
                    }, error => {

                    });
                    this.modales.recuperarContra.hide();
                }
                else {
                    this._toaster.error(this.loginTranslate.correoInexistente);
                }

            }, error => {

            });
        }

    }

    cerrarModalContra() {
        this.mError = false;
        this.limpiarDatos("1");
        this.modales.recuperarContra.hide();
    }

    limpiarDatos(valor: any) {
        if (valor == 1) {
            this.mensaje = [];

            this.registro = {};
            this.registro.email = "";
            this.registro.contrasenia = "";
            this.registro.confContrasenia = "";
            this.registro.nombre = "";
            this.registro.nCorreoI;

            this.mError = false;
            $("#txtNombre").removeClass("errorCampo");
            $("#txtEmail").removeClass("errorCampo");
            $("#txtContrasenia").removeClass("errorCampo");
            $("#txtConfContrasenia").removeClass("errorCampo");
            $("#txtCorreoFB").removeClass("errorCampo");
            $("#txtCorreoFBI").removeClass("errorCampo");
        } else {
            if (this.registro.email != "" || this.registro.contrasenia != "" || this.registro.confContrasenia != "" || this.registro.nombre != "") {

            } else {
                this.mensaje = [];
                this.registro = {};
                this.registro.email = "";
                this.registro.contrasenia = "";
                this.registro.confContrasenia = "";
                this.registro.nombre = "";
                this.registro.nCorreoI;

                $("#txtNombre").removeClass("errorCampo");
                $("#txtEmail").removeClass("errorCampo");
                $("#txtContrasenia").removeClass("errorCampo");
                $("#txtConfContrasenia").removeClass("errorCampo");
                $("#txtCorreoFB").removeClass("errorCampo");
                $("#txtCorreoFBI").removeClass("errorCampo");
                this.mError = false;
            }
        }
    }

    // ---------------- TÉRMINOS Y CONDICIONES ----------------
    cargarTyC() {
        window.open(environment.URL + 'handler?idTerminosCondicionesLogin=pdfLoad');
    }

    // ---------------- REGISTRO EMPRESA ----------------
    registroModal() {
        this.modales.registro.show();
    }

    cerrarModalRegistro(){
        this.mError = false;
        this.limpiarDatos("1");
        this.modales.registro.hide();
    }

    validarPassword() {
        if (this.registro.contrasenia != this.registro.confContrasenia)
            return true;
        else
            return false;
    }

    registrarUsuario() {
        $('#btnEstablecer').addClass('disabled');
        $('#blockScreen').show();
        var correoValido = false;
        var params: any = {};
        params.email = this.registro.email;
        this.mensaje = [];
        var expRegNombre = new RegExp("^[a-z A-ZáéíóúüñÁÉÍÓÚÜÑ\s]*$");
        var expReg = new RegExp("^[_a-z0-9-]+(.[_a-z0-9-]+)*@[a-z0-9-]+(.[a-z0-9-]+)*(.[a-z]{2,4})$");
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        var flag = 0;

        this._backService.HttpPost("registroEmpresa/validarCorreo", {}, params).subscribe((response: string) => {
            if (response)
                correoValido = true;
            else
                correoValido = false;

            if (this.registro.nombre == "") {
                $("#txtNombre").addClass("errorCampo");
                flag++;
            }
            else {
                if (!expRegNombre.test(this.registro.nombre)) {
                    $("#txtNombre").addClass("errorCampo");
                    this.mensaje[0] = this.loginTranslate.ErrorLetras;
                    flag++;
                }
                else {
                    $("#txtNombre").removeClass("errorCampo");
                }

            }

            if (this.registro.email == "") {
                $("#txtEmail").addClass("errorCampo");
                flag++;
            }
            else {
                if (!re.test(this.registro.email)) {
                    $("#txtEmail").addClass("errorCampo");
                    this.mensaje[2] = this.loginTranslate.correoErroneo;
                    flag++;
                }
                else {
                    if (correoValido) {
                        $("#txtEmail").removeClass("errorCampo");
                    } else {
                        $("#txtEmail").addClass("errorCampo");
                        this.mensaje[2] = this.loginTranslate.correoExistente;
                        flag++;
                    }
                }
            }
            if (this.registro.contrasenia == "") {
                $("#txtContrasenia").addClass("errorCampo");
                flag++;
            }
            else {
                $("#txtContrasenia").removeClass("errorCampo");
            }

            if (this.registro.confContrasenia == "") {
                $("#txtConfContrasenia").addClass("errorCampo");
                flag++;
            }
            else {
                $("#txtConfContrasenia").removeClass("errorCampo");
            }

            if (this.validarPassword() && this.registro.contrasenia != "" && this.registro.confContrasenia != "") {
                $("#txtContrasenia").addClass("errorCampo");
                $("#txtConfContrasenia").addClass("errorCampo");
                this.mensaje[3] = this.loginTranslate.contrasenaError;
                flag++;
            }

            if (flag == 0) {
                params = {};
                params.nombre = this.registro.nombre;
                params.email = this.registro.email;
                params.contrasenia = this.registro.contrasenia;
                params.idFacebook = "";
                params.idPromotor = this.registro.idPromotor;

                setTimeout(() => {
                    this._backService.HttpPost("registroEmpresa/guardarUsuario", {}, params).subscribe((response: string) => {
                        params = {};
                        params.email = this.registro.email;
                        params.contrasenia = this.registro.contrasenia;
                        params.idFacebook = "";
                        params.logFacebook = 0;
                        params.nuevoCorreo = 0;
						params.registroUsuario = 0;

                        this._backService.HttpPost("Login/Login", {}, params).subscribe((response: ResponseData<string>) => {
                            this._authService.CargarSession(response.data);
                            this._pantallaService.ObtenerSession();
                            this.modales.registro.hide();
                            this.limpiarDatos(null);
                            this._router.navigate(['/registro-empresa']);
                        },
                        error => {
                            this._router.navigate(['/login']);
                        });
                    }

                )}, 1000)

            }
            else {
                this.mError = true;
                $('#btnEstablecer').removeClass('disabled');
            }

        }, error => {

        });

    }

    activarCheck(){
        $("#checkRecordar").click();
    }
}
