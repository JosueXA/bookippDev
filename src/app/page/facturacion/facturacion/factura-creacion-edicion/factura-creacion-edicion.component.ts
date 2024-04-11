import { Component, OnInit } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MethodsService } from 'src/app/core/services/methods.service';
import { PantallaService } from 'src/app/core/services/pantalla.service';
import { ToasterService } from 'src/shared/toaster/toaster.service';
declare var $: any; // JQUERY
import * as bootstrap from 'bootstrap'; // BOOTSTRAP

@Component({
    selector: 'app-factura-creacion-edicion',
    templateUrl: './factura-creacion-edicion.component.html',
    styleUrls: ['./factura-creacion-edicion.component.scss', '../../../page.component.scss']
})
export class FacturaCreacionEdicionComponent implements OnInit {

    //Translate variable
    consultaFacturaSerieTranslate: any = {};
    sessionTraslate: any = {};

    modales: any = {};
    messageModal: any = "";

    constructor(private _translate: TranslateService,
        private _backService: MethodsService,
        public _pantallaServicio: PantallaService,
        private matIconRegistry: MatIconRegistry,
        private domSanitizer: DomSanitizer,
        private _toaster: ToasterService,
        private _router: Router,
        private _route: ActivatedRoute) {
        this._translate.setDefaultLang(this._pantallaServicio.idioma);
        this._translate.use(this._pantallaServicio.idioma);

        this._translate.get('consultaFacturaSerieTranslate').subscribe((translated) => {
            this.consultaFacturaSerieTranslate = this._translate.instant('consultaFacturaSerieTranslate');
        });
        this.sessionTraslate = this._translate.instant('sessionTraslate');

        this.matIconRegistry.addSvgIcon('iconFlechaDerecha', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../../assets/icons/finales/FlechaDerechaPequena-icon.svg"));
		this.matIconRegistry.addSvgIcon('iconCasita', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../../assets/icons/finales/Casa1-icon.svg"));
    }

    ngOnInit(): void {
        this.crearModales();
        this._route.queryParams.subscribe((params) => {
            this.facturaSeries.tipoPantalla = params['idFactura'];
            this.dataConsulta();
        });
    }

    // ******************** VARIABLES ******************
    facturaSeries: any = {
        idSerie: "",
        nombre: "",
        descripcion: "",
        contador: "1",
        minimo: "",
        maximo: "",
        idSerieAux: "",
        nombreAux: "",
        descripcionAux: "",
        contadorAux: "",
        minimoAux: "",
        maximoAux: "",
        tipoPantalla: "",
        nombreValido: false,
        contadorValido: false,
        minimoValido: false,
        maximoValido: false,
        guardar: false,
    };
    camposValidos: any = false;
    checked: any = false;
    msgErrorNombre: any = "";
    msgErrorContador: any = "";
    msgErrorMinimo: any = "";
    msgErrorMaximo: any = "";

    //*************************************************** FUNCIONES *****************************

    dataConsulta() {
        this._pantallaServicio.mostrarSpinner();
        this._backService.HttpPost('catalogos/factura/consultarFacturaSeries', {}, {}).subscribe(
            response => {
                this.facturaSeries.data = eval(response);
                if (this.facturaSeries.tipoPantalla != 'N') {
                    const serie = this.facturaSeries.data.filter((e: any) => e.idSerie === parseInt(this.facturaSeries.tipoPantalla));
                    this.facturaSeries.idSerie = serie[0].idSerie;
                    this.facturaSeries.nombre = (serie[0].nombre).toUpperCase();
                    this.facturaSeries.descripcion = serie[0].descripcion;
                    this.facturaSeries.contador = serie[0].contador == '0' ? '1' : serie[0].contador;
                    this.facturaSeries.minimo = serie[0].minimo == null ? "1" : serie[0].minimo;
                    this.facturaSeries.maximo = serie[0].maximo == null ? "100000" : serie[0].maximo;
                    this.facturaSeries.idSerieAux = this.facturaSeries.idSerie;
                    this.facturaSeries.nombreAux = this.facturaSeries.nombre;
                    this.facturaSeries.descripcionAux = this.facturaSeries.descripcion;
                    this.facturaSeries.contadorAux = this.facturaSeries.contador;
                    this.facturaSeries.minimoAux = this.facturaSeries.minimo;
                    this.facturaSeries.maximoAux = this.facturaSeries.max;
                }
                this._pantallaServicio.ocultarSpinner();
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
    };

    insertarSerie() {
        if (!this.checked) {
            this.facturaSeries.bandGuardar = true;
            this.validarGuardar();
            if (this.facturaSeries.guardar) {
                let existe = this.facturaSeries.data.filter((e: any) => e.nombre === (this.facturaSeries.nombre).toUpperCase());
                if (existe != 0) {
                    this.camposValidos = false;
                    this.facturaSeries.guardar = false;
                    this._toaster.error('La serie ya esta en uso')
                } else {
                    this._pantallaServicio.mostrarSpinner();
                    this.checked = true;
                    let params: any = {};
                    params.nombre = this.facturaSeries.nombre;
                    params.descripcion = this.facturaSeries.descripcion;
                    params.contador = this.facturaSeries.contador;
                    params.minimo = parseInt(this.facturaSeries.minimo);
                    params.maximo = parseInt(this.facturaSeries.maximo);

                    this._backService.HttpPost('catalogos/factura/insertarFacturaSeries', {}, params).subscribe(
                        response => {
                            this.camposValidos = false;
                            this.facturaSeries.guardar = false;
                            this._pantallaServicio.ocultarSpinner();
                            this._router.navigate(["facturacion/facturacionSerie"]);
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
            }
        }
    };

    actualizarSerie() {
        if (this.facturaSeries.nombreAux != this.facturaSeries.nombre || this.facturaSeries.descripcionAux != this.facturaSeries.descripcion ||
            this.facturaSeries.contadorAux != this.facturaSeries.contador || this.facturaSeries.minimoAux != this.facturaSeries.minimo ||
            this.facturaSeries.maximoAux != this.facturaSeries.max) {
            if (!this.checked) {
                this.facturaSeries.bandGuardar = true;
                this.validarGuardar();
                if (this.facturaSeries.guardar) {
                    //Verificar si el nombre no se esta usando
                    let existe = this.facturaSeries.data.filter((e: any) => e.nombre === (this.facturaSeries.nombre).toUpperCase());

                    //Si existe una serie, se usara para excluirla al momento de actualizar
                    if (existe != 0) {
                        if ((existe[0].idSerie).toString() == this.facturaSeries.tipoPantalla) {
                            this.checked = true;
                            let params: any = {};
                            params.idSerie = this.facturaSeries.tipoPantalla;
                            params.nombre = this.facturaSeries.nombre;
                            params.descripcion = this.facturaSeries.descripcion;
                            params.contador = this.facturaSeries.contador;
                            params.minimo = parseInt(this.facturaSeries.minimo);
                            params.maximo = parseInt(this.facturaSeries.maximo);
                            this._pantallaServicio.mostrarSpinner();

                            this._backService.HttpPost('catalogos/factura/actualizarFacturaSeries', {}, params).subscribe(
                                response => {
                                    this._pantallaServicio.ocultarSpinner();
                                    this._router.navigate(["facturacion/facturacionSerie"])
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

                        } else {
                            this._toaster.error('La serie ya esta en uso');
                        }
                    } else {
                        this.checked = true;
                        let params: any = {};
                        params.idSerie = this.facturaSeries.tipoPantalla;
                        params.nombre = this.facturaSeries.nombre;
                        params.descripcion = this.facturaSeries.descripcion;
                        params.contador = this.facturaSeries.contador;
                        params.minimo = parseInt(this.facturaSeries.minimo);
                        params.maximo = parseInt(this.facturaSeries.maximo);
                        this._pantallaServicio.mostrarSpinner();

                        this._backService.HttpPost('catalogos/factura/actualizarFacturaSeries', {}, params).subscribe(
                            response => {
                                this._pantallaServicio.ocultarSpinner();
                                this._router.navigate(["facturacion/facturacionSerie"])
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
                }

            }
        } else {
            this._router.navigate(["facturacion/facturacionSerie"])
        }

    };//Fin de la funcion actualizar

    guardar() {

        if (this.facturaSeries.tipoPantalla != 'N') {
            this.actualizarSerie();
        } else {
            this.insertarSerie();
        }
    }

    validarCampos() {

        var valNum = /^-?[0-9]+(?:\.[0-9]+)?$/;
        var valNom = RegExp("^[a-zA-Z áéíóúñÁÉÍÓÚÑüÜ\s]*$");
        var nombre = valNom.test(this.facturaSeries.nombre);
        var contador = valNum.test(this.facturaSeries.contador);
        var minimo = valNum.test(this.facturaSeries.minimo);
        var maximo = valNum.test(this.facturaSeries.maximo);

        //Nombre
        if (!nombre || this.facturaSeries.nombre == "") {
            this.facturaSeries.nombreValido = false;
        }
        else {
            this.facturaSeries.nombreValido = true;
        }

        //Contador
        if (!contador || this.facturaSeries.contador == "") {
            this.facturaSeries.contadorValido = false;
        }
        else {
            this.facturaSeries.contadorValido = true;
        }
        //Minimo
        if (!minimo || this.facturaSeries.minimo == "") {
            this.facturaSeries.minimoValido = false;
        }
        else {
            this.facturaSeries.minimoValido = true;
        }
        //Maximo
        if (!maximo || this.facturaSeries.maximo == "") {
            this.facturaSeries.maximoValido = false;
        }
        else {
            this.facturaSeries.maximoValido = true;
        }
    }

    validarGuardar() {

        this.validarCampos();

        if (this.facturaSeries.contadorValido && this.facturaSeries.minimoValido && this.facturaSeries.maximoValido && this.facturaSeries.nombreValido) {

            if (this.facturaSeries.nombreValido) {
                $("#nombre").removeClass("errorCampo");
                this.msgErrorNombre = "";

                if (this.facturaSeries.contadorValido) {
                    $("#contador").removeClass("errorCampo");
                    this.msgErrorContador = "";

                    if (this.facturaSeries.minimoValido) {
                        $("#minimo").removeClass("errorCampo");
                        this.msgErrorMinimo = "";

                        if (this.facturaSeries.maximoValido) {
                            $("#maximo").removeClass("errorCampo");
                            this.msgErrorMaximo = "";
                            this.facturaSeries.guardar = true;
                        }
                    }
                }
            }
        } else {

            //Nombre
            if (this.facturaSeries.nombre == "" || this.facturaSeries.nombre == null) {
                $("#nombre").addClass("errorCampo");
                this.facturaSeries.ErrorNombre = false;
                this.msgErrorNombre = "";
            }
            else {
                if (!this.facturaSeries.nombreValido) {
                    $("#nombre").addClass("errorCampo");
                    this.facturaSeries.ErrorNombre = true;
                    if (this.facturaSeries.nombre) {
                        this.msgErrorNombre = this.consultaFacturaSerieTranslate.errorNombre;
                    } else {
                        this.msgErrorNombre = "";
                    }
                }
                else {
                    $("#nombre").removeClass("errorCampo");
                    this.facturaSeries.ErrorNombre = false;
                    this.msgErrorNombre = "";
                }
            }

            //Contador
            if (this.facturaSeries.contador == "" || this.facturaSeries.contador == null) {
                $("#contador").addClass("errorCampo");
                this.facturaSeries.ErrorContador = false;
                this.msgErrorContador = "";
            }
            else {
                if (!this.facturaSeries.contadorValido) {
                    $("#contador").addClass("errorCampo");
                    this.facturaSeries.ErrorContador = true;
                    if (this.facturaSeries.contador) {
                        this.msgErrorContador = this.consultaFacturaSerieTranslate.errorContador;
                    } else {
                        this.msgErrorContador = "";
                    }
                }
                else {
                    $("#contador").removeClass("errorCampo");
                    this.facturaSeries.ErrorContador = false;
                    this.msgErrorContador = "";
                }
            }

            //Minimo
            if (this.facturaSeries.minimo == "" || this.facturaSeries.minimo == null) {
                $("#minimo").addClass("errorCampo");
                this.facturaSeries.ErrorMinimo = false;
                this.msgErrorMinimo = "";
            }
            else {
                if (!this.facturaSeries.minimoValido) {
                    $("#minimo").addClass("errorCampo");
                    this.facturaSeries.ErrorMinimo = true;
                    if (this.facturaSeries.minimo) {
                        this.msgErrorMinimo = this.consultaFacturaSerieTranslate.errorMinimo;
                    } else {
                        this.msgErrorMinimo = "";
                    }
                }
                else {
                    $("#minimo").removeClass("errorCampo");
                    this.facturaSeries.ErrorMinimo = false;
                    this.msgErrorMinimo = "";
                }
            }


            //Maximo
            if (this.facturaSeries.maximo == "" || this.facturaSeries.maximo == null) {
                $("#maximo").addClass("errorCampo");
                this.facturaSeries.ErrorMaximo = false;
                this.msgErrorMaximo = "";
            }
            else {
                if (!this.facturaSeries.maximoValido) {
                    $("#maximo").addClass("errorCampo");
                    this.facturaSeries.ErrorMaximo = true;
                    if (this.facturaSeries.maximo) {
                        this.msgErrorMaximo = this.consultaFacturaSerieTranslate.errorMaximo;
                    } else {
                        this.msgErrorMaximo = "";
                    }
                }
                else {
                    $("#maximo").removeClass("errorCampo");
                    this.facturaSeries.ErrorMaximo = false;
                    this.msgErrorMaximo = "";
                }
            }
        }
    };

    regresarConsulta() {
        this._router.navigate(['facturacion/facturacionSerie']);
    }

    cancelarPantalla(direccion?: any) {
        if (this.facturaSeries.nombre == "" && this.facturaSeries.descripcion == "" && this.facturaSeries.contador == ""
            && this.facturaSeries.minimo == "" && this.facturaSeries.maximo == "") {
            this._router.navigate(['facturacion/facturacionSerien']);
        }
        else {
            this.modalDescartar();
        }
    }

    modalDescartar() {
        this.messageModal = this.consultaFacturaSerieTranslate.descartar;
        this.modales.modalConfirm.show();
    }

    onBlurTxt(elemento?: any) {
        if (this.facturaSeries.bandGuardar) {
            switch (elemento) {
                case "nombre":
                    if (!this.facturaSeries.ErrorNombre) {
                        if (this.facturaSeries.nombre == "" || this.facturaSeries.nombre === null) {
                            $("#" + elemento).addClass("errorCampo");
                        }

                    }
                    break;

                case "contador":
                    if (!this.facturaSeries.ErrorContador) {
                        if (this.facturaSeries.contador == "" || this.facturaSeries.contador === null) {
                            $("#" + elemento).addClass("errorCampo");
                        }
                    }
                    break;

                case "minimo":

                    if (!this.facturaSeries.ErrorMinimo) {
                        if (this.facturaSeries.minimo == "" || this.facturaSeries.minimo === null) {
                            $("#" + elemento).addClass("errorCampo");
                        }
                    }

                    break;

                case "maximo":

                    if (!this.facturaSeries.ErrorMaximo) {
                        if (this.facturaSeries.maximo == "" || this.facturaSeries.maximo === null) {
                            $("#" + elemento).addClass("errorCampo");
                        }
                    }

                    break;


            }
        }
    }

    onFocusTxt(elemento?: any) {
        if (this.facturaSeries.bandGuardar) {
            switch (elemento) {
                case "nombre":
                    if (!this.facturaSeries.ErrorNombre) {
                        $("#" + elemento).removeClass("errorCampo");
                    }
                    break;
                case "contador":
                    if (!this.facturaSeries.ErrorContador) {
                        $("#" + elemento).removeClass("errorCampo");
                    }
                    break;
                case "minimo":
                    if (!this.facturaSeries.ErrorMinimo) {
                        $("#" + elemento).removeClass("errorCampo");
                    }
                    break;
                case "maximo":
                    if (!this.facturaSeries.ErrorMaximo) {
                        $("#" + elemento).removeClass("errorCampo");
                    }
                    break;
            }
        }
    }

    /**** Funciones que ya no se utilizaron ****/
    validarCamposVacios() {

        let cantCamposVal = 0;

        if (this.facturaSeries.nombre != "" && this.facturaSeries.nombre != undefined) {
            cantCamposVal += 1;
        } else {
            $("#nombre").addClass("errorCampo");
        }

        if (this.facturaSeries.contador != "" && this.facturaSeries.contador != undefined) {
            cantCamposVal += 1;
        } else {
            $("#contador").addClass("errorCampo");
        }

        if (this.facturaSeries.minimo != "" && this.facturaSeries.minimo != undefined) {
            cantCamposVal += 1;
        } else {
            $("#minimo").addClass("errorCampo");
        }

        if (this.facturaSeries.maximo != "" && this.facturaSeries.maximo != undefined) {
            cantCamposVal += 1;
        } else {
            $("#maximo").addClass("errorCampo");
        }

        if (cantCamposVal == 4) {
            this.camposValidos = true;
        }

    }

    consultarFacturaSerie() {
        if (this.facturaSeries.tipoPantalla != 'N') {
            let params: any = {};
            params.idSerie = this.facturaSeries.tipoPantalla;

            this._backService.HttpPost('catalogos/factura/consultarFacturaSeries', {}, params).subscribe(
                response => {
                    this.facturaSeries.data = eval(response);
                    this.facturaSeries.idSerie = this.facturaSeries.data[0].idSerie;
                    this.facturaSeries.nombre = this.facturaSeries.data[0].nombre;
                    this.facturaSeries.descripcion = this.facturaSeries.data[0].descripcion;
                    this.facturaSeries.contador = this.facturaSeries.data[0].contador;
                    this.facturaSeries.minimo = this.facturaSeries.data[0].minimo == null ? "1" : this.facturaSeries.data[0].minimo;
                    this.facturaSeries.maximo = this.facturaSeries.data[0].maximo == null ? "100000" : this.facturaSeries.data[0].maximo;
                },
                error => {

                }
            )
        }
    }

    // Crear modales
	crearModales() {
		if ($('body').find('.modalConfirm').length > 1) {
			$('body').find('.modalConfirm')[1].remove();
		}

		this.modales.modalConfirm = new bootstrap.Modal(
			$('#modalConfirm').appendTo('body'),
			{
				backdrop: 'static',
				keyboard: false,
			}
		);
	}
}
