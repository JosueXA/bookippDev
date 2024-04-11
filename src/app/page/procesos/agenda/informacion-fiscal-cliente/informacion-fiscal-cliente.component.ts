import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MethodsService } from 'src/app/core/services/methods.service';
import { PantallaService } from 'src/app/core/services/pantalla.service';
import { ToasterService } from 'src/shared/toaster/toaster.service';
declare var $: any; // JQUERY

@Component({
    selector: 'app-informacion-fiscal-cliente',
    templateUrl: './informacion-fiscal-cliente.component.html',
    styleUrls: ['./informacion-fiscal-cliente.component.scss', '../../../page.component.scss']
})
export class InformacionFiscalClienteComponent implements OnInit {
    // Variables de traduccion
    sessionTraslate: any = {};
    informacionFiscalClienteTranslate: any = {};

    constructor(private matIconRegistry: MatIconRegistry,
        private domSanitizer: DomSanitizer, private _backService: MethodsService,
        private _pantallaServicio: PantallaService,
        private _toaster: ToasterService,
        private _router: Router,
        private _translate: TranslateService,
        @Inject(MAT_DIALOG_DATA) public dataDialog: {idCliente: string, folioPago: string},
        public dialogRef: MatDialogRef<InformacionFiscalClienteComponent>) {

        this._translate.setDefaultLang(this._pantallaServicio.idioma);
        this._translate.use(this._pantallaServicio.idioma);

        this._translate.get('sucursalTranslate').subscribe((translated: string) => {
            this.sessionTraslate = this._translate.instant('sessionTraslate');
            this.informacionFiscalClienteTranslate = this._translate.instant('informacionFiscalClienteTranslate');
        });

        this.matIconRegistry.addSvgIcon('iconCerrarModal', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../../assets/icons/finales/10-2-TiposdeExcepcion-icon.svg"));
    }

    ngOnInit(): void {
        this.cargarFormasDePago();
        this.cargarMetodosDePago();
        this.cargarUsoCFDI();
        this.cargarRegimen();
        this.validarPerfilUsuario();
        this.cargarPaises();
        this.cargarInformacionFiscalSucursal();
    }

    // ----------------- letiables -----------------------------------------
    informacionFiscalSucursal: any = {
        esGerenteGeneral: 0,
        idRegistroActualizar: 0,
        nombre: "",
        RFC: "",
        pais: 0,
        calle: "",
        estado: 0,
        colonia: "",
        ciudad: "",
        codigoPostal: "",
        numeroInterior: "",
        numero: "",
        telefono: "",
        email: "",
        radioTipo: '0',
        idSucursal: 0,
        idCliente: 0,
        tamanioRFC: 13,
        dataInformacionFiscalSucursal: [],
        dataSucursales: [],
        dataEstados: [],
        dataPaises: [],
        dataRegimen: [],
        existeInformacion: false,
        regimenFiscalReceptor: "",
        personaMoral: 1,
        personaFisica: 1,
    };

    informacionFiscalSucursalSinCambios: any = {};

    nombrePais = "";
    nombreEstado = "";
    paramidCita = "";

    valido = true;
    guardar = false;
    pantallaCargada: any = null;

	pantallaDatosIn: boolean = true;
	pantallaDatosOut: boolean = false;
	pantallacliente: boolean = false;


    // ----------------- Funciones -----------------------------------------
    // Función que valida el perfil del usuario, si es gerente general se habilita el campo sucursal
    validarPerfilUsuario() {
        let params: any = {};
        params.validarGteSuc = 0;

        this._backService.HttpPost('procesos/informacionFiscalCliente/informacionFiscalCliente/validarPerfilUsuario', {}, params).subscribe(
            response => {
                let responseTemp = [];
                responseTemp = eval(response);
                this.informacionFiscalSucursal.esGerenteGeneral = responseTemp[0];
                if (responseTemp != null) {
                    if (this.informacionFiscalSucursal.esGerenteGeneral == 0) {
                        this.informacionFiscalSucursal.idSucursal = responseTemp[1];
                        this.informacionFiscalSucursal.cargarInformacionFiscalSucursal();
                    }
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
    };

    // Carga la lista de paises para el dropdown del campo Pais
    cargarPaises() {
        this._backService.HttpPost('catalogos/pais/getPaises', {}, {}).subscribe(
            response => {
                this.informacionFiscalSucursal.dataPaises = eval(response);
                if (this.informacionFiscalSucursal.dataPaises != null) {
                    this.informacionFiscalSucursal.pais = this.informacionFiscalSucursal.dataPaises[0].idPais;
                    this.cargarEstados();
                } else {
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
    };

    // Carga la lista de estados para el dropdown del campo Pais
    cargarEstados(cambio?: any) {
        let params: any = {};
        params.idPais = this.informacionFiscalSucursal.pais;
        this._backService.HttpPost('catalogos/estado/cargarEstadosEnPais', {}, params).subscribe(
            response => {
                this.pantallaCargada = false;
                this.informacionFiscalSucursal.dataEstados = eval(response);
                if (this.informacionFiscalSucursal.dataEstados != null) {
                    if (cambio != undefined) {
                        this.informacionFiscalSucursal.estado = this.informacionFiscalSucursal.dataEstados[0].idEstado;
                    }
                } else {
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
    };

    // Cargar información 
    cargarInformacionFiscalSucursal() {
        let idCliente = this.getParameter();
        if (idCliente != null || idCliente != undefined || this.informacionFiscalSucursal.idRegistroActualizar != 0) {
            let params: any = {};
            params.idCliente = idCliente;//this.informacionFiscalSucursal.idSucursal;
            this._pantallaServicio.mostrarSpinner();

            this._backService.HttpPost('procesos/informacionFiscalCliente/informacionFiscalCliente/cargarInformacionFiscalCliente', {}, params).subscribe(
                response => {
                    this.informacionFiscalSucursal.dataInformacionFiscalSucursal = eval(response);

                    this.informacionFiscalSucursal.existeInformacion =
                        !(this.informacionFiscalSucursal.dataInformacionFiscalSucursal.length == 0 ||
                            this.informacionFiscalSucursal.dataInformacionFiscalSucursal == null ||
                            this.informacionFiscalSucursal.dataInformacionFiscalSucursal == undefined);

                    if (this.informacionFiscalSucursal.existeInformacion) {
                        this.informacionFiscalSucursal.idRegistroActualizar = this.informacionFiscalSucursal.dataInformacionFiscalSucursal[0].idInformacionFiscalSucursal;
                        this.informacionFiscalSucursal.RFC = this.informacionFiscalSucursal.dataInformacionFiscalSucursal[0].RFC;
                        this.informacionFiscalSucursal.pais = this.informacionFiscalSucursal.dataInformacionFiscalSucursal[0].idPais;
                        this.informacionFiscalSucursal.calle = this.informacionFiscalSucursal.dataInformacionFiscalSucursal[0].calle;
                        this.informacionFiscalSucursal.estado = this.informacionFiscalSucursal.dataInformacionFiscalSucursal[0].idEstado;
                        this.cargarEstados();
                        this.informacionFiscalSucursal.colonia = this.informacionFiscalSucursal.dataInformacionFiscalSucursal[0].colonia;
                        this.informacionFiscalSucursal.ciudad = this.informacionFiscalSucursal.dataInformacionFiscalSucursal[0].ciudad;
                        this.informacionFiscalSucursal.codigoPostal = this.informacionFiscalSucursal.dataInformacionFiscalSucursal[0].codigoPostal;
                        this.informacionFiscalSucursal.numeroInterior = this.informacionFiscalSucursal.dataInformacionFiscalSucursal[0].numeroInterior;
                        this.informacionFiscalSucursal.numero = this.informacionFiscalSucursal.dataInformacionFiscalSucursal[0].numero;
                        this.informacionFiscalSucursal.telefono = this.informacionFiscalSucursal.dataInformacionFiscalSucursal[0].telefono;
                        this.informacionFiscalSucursal.email = this.informacionFiscalSucursal.dataInformacionFiscalSucursal[0].email;

                        if (this.informacionFiscalSucursal.dataInformacionFiscalSucursal[0].tipo == "Física") {
                            this.informacionFiscalSucursal.radioTipo = '0';
                            (document.getElementById("fisicaInput") as any).checked = true;
                            (document.getElementById("moralInput") as any).checked = false;
                            this.informacionFiscalSucursal.tamanioRFC = 13;
                            this.informacionFiscalSucursal.nombre = this.informacionFiscalSucursal.dataInformacionFiscalSucursal[0].nombre;
                        } else {
                            this.informacionFiscalSucursal.radioTipo = '1';
                            (document.getElementById("fisicaInput") as any).checked = false;
                            (document.getElementById("moralInput") as any).checked = true;
                            this.informacionFiscalSucursal.tamanioRFC = 12;
                            this.informacionFiscalSucursal.nombre = this.informacionFiscalSucursal.dataInformacionFiscalSucursal[0].nombre;
                        }

                        this.informacionFiscalSucursal.idSucursal = this.informacionFiscalSucursal.dataInformacionFiscalSucursal[0].idSucursal;
                        this.informacionFiscalSucursal.idCliente = this.informacionFiscalSucursal.dataInformacionFiscalSucursal[0].idCliente;
                        this.informacionFiscalSucursal.metodoPago = this.informacionFiscalSucursal.dataInformacionFiscalSucursal[0].idDatosFiscalesMetodoPago;
                        if (this.informacionFiscalSucursal.metodoPago == "" || this.informacionFiscalSucursal.metodoPago == undefined) {
                            this.informacionFiscalSucursal.metodoPago = 1;
                        }
                        this.informacionFiscalSucursal.formaPago = this.informacionFiscalSucursal.dataInformacionFiscalSucursal[0].idDatosFiscalesFormaPago;
                        if (this.informacionFiscalSucursal.formaPago == "" || this.informacionFiscalSucursal.formaPago == undefined) {
                            this.informacionFiscalSucursal.formaPago = 23;
                        }
                        this.informacionFiscalSucursal.cfdi = this.informacionFiscalSucursal.dataInformacionFiscalSucursal[0].idDatosFiscalesUsoCFDI;
                        if (this.informacionFiscalSucursal.cfdi == "" || this.informacionFiscalSucursal.cfdi == undefined) {
                            this.informacionFiscalSucursal.cfdi = 22;
                        }
                        // Se realiza una copia del objeto usuario para validar después si hubo cambios
                        this.informacionFiscalSucursalSinCambios = JSON.parse(JSON.stringify(this.informacionFiscalSucursal));
                    }
                    if (this.informacionFiscalSucursal.metodoPago == "" || this.informacionFiscalSucursal.metodoPago == undefined) {
                        this.informacionFiscalSucursal.metodoPago = 1;
                    }
                    if (this.informacionFiscalSucursal.formaPago == "" || this.informacionFiscalSucursal.formaPago == undefined) {
                        this.informacionFiscalSucursal.formaPago = 23;
                    }
                    if (this.informacionFiscalSucursal.cfdi == "" || this.informacionFiscalSucursal.cfdi == undefined) {
                        this.informacionFiscalSucursal.cfdi = 22;
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
        }

        if (this.informacionFiscalSucursal.metodoPago == "" || this.informacionFiscalSucursal.metodoPago == undefined) {
            this.informacionFiscalSucursal.metodoPago = 1;
        }
        if (this.informacionFiscalSucursal.formaPago == "" || this.informacionFiscalSucursal.formaPago == undefined) {
            this.informacionFiscalSucursal.formaPago = 23;
        }
        if (this.informacionFiscalSucursal.cfdi == "" || this.informacionFiscalSucursal.cfdi == undefined) {
            this.informacionFiscalSucursal.cfdi = 22;
        }
    };

    getParameter(idCita_s?: any) {
        let idCliente = this.dataDialog.idCliente;
        let idCita = this.dataDialog.folioPago;
        if (idCita_s == undefined) {
            return parseInt(idCliente);
        } else {
            return parseInt(idCita);
        }
    }

    // Función que inicializa la fecha actual
    obtenerFechaActual() {
        let today = new Date();
        let dd: any = today.getDate();
        let mm: any = today.getMonth();
        let yyyy = today.getFullYear();
        if (dd < 10) {
            dd = '0' + dd
        }
        if (mm < 10) {
            mm = '0' + mm
        }
        today = new Date(yyyy, mm, dd);
        return today;
    };

    // Función que verifica si un valor está contenido en un arreglo
    valorEnArreglo(valor?: any, arreglo?: any) {
        for (let i = 0; i < arreglo.length; i++) {
            if (valor == arreglo[i]) return true;
        }
        return false;
    };

    // Función que limpia los campos
    limpiarCampos() {
        this.informacionFiscalSucursal.nombre = "";
        this.informacionFiscalSucursal.RFC = "";
        this.informacionFiscalSucursal.pais = 0;
        this.informacionFiscalSucursal.calle = "";
        this.informacionFiscalSucursal.estado = 0;
        this.informacionFiscalSucursal.colonia = "";
        this.informacionFiscalSucursal.ciudad = "";
        this.informacionFiscalSucursal.codigoPostal = "";
        this.informacionFiscalSucursal.numeroInterior = "";
        this.informacionFiscalSucursal.numero = "";
        this.informacionFiscalSucursal.telefono = "";
        this.informacionFiscalSucursal.email = "";
        this.informacionFiscalSucursal.tipo = "";
        this.informacionFiscalSucursal.radioTipo = '0';
        this.informacionFiscalSucursal.idSucursal = 0;
        this.informacionFiscalSucursal.idCliente = 0;
    };

    // Función que guarda la información usando los valores de los campos como parámetros
    guardarInformacionFiscalSucursal() {
        this.guardar = true;
        this.valido = true;
        this.validadParametros();
        if (this.valido) {
            let params: any = {};
            if (this.informacionFiscalSucursal.existeInformacion) {
                params.idInformacionFiscalSucursal = this.informacionFiscalSucursal.idRegistroActualizar;
            } else {
                params.idInformacionFiscalSucursal = 0;
            }
            params.nombre = this.informacionFiscalSucursal.nombre;
            params.RFC = this.informacionFiscalSucursal.RFC;
            params.pais = this.informacionFiscalSucursal.pais;
            params.calle = this.informacionFiscalSucursal.calle;
            params.estado = this.informacionFiscalSucursal.estado;
            if (params.estado == null) {
                params.estado = 0;
            }
            params.colonia = this.informacionFiscalSucursal.colonia;
            params.ciudad = this.informacionFiscalSucursal.ciudad;
            params.codigoPostal = this.informacionFiscalSucursal.codigoPostal;
            params.numeroInterior = this.informacionFiscalSucursal.numeroInterior;
            params.numero = this.informacionFiscalSucursal.numero;
            params.telefono = this.informacionFiscalSucursal.telefono;
            params.email = this.informacionFiscalSucursal.email;
            if (Number(this.informacionFiscalSucursal.radioTipo) == 0) {
                params.tipo = "Física";
            } else {
                params.tipo = "Moral";
            }
            params.idSucursal = this.informacionFiscalSucursal.idSucursal;
            params.idCliente = this.getParameter();
            // Se obtiene la fecha actual
            params.fechaActualizacion = this.obtenerFechaActual();
            params.cfdi = this.informacionFiscalSucursal.cfdi;
            params.metodoPago = this.informacionFiscalSucursal.metodoPago;
            params.formaPago = this.informacionFiscalSucursal.formaPago;
            params.regimenFiscalReceptor = this.informacionFiscalSucursal.regimenFiscalReceptor;
            this._pantallaServicio.mostrarSpinner();

            this._backService.HttpPost('procesos/informacionFiscalCliente/informacionFiscalCliente/guardarInformacionFiscalCliente', {}, params).subscribe(
                response => {
                    let dataTemp = eval(response);
                    this.informacionFiscalSucursal.idRegistroActualizar = dataTemp;
                    this.informacionFiscalSucursal.existeInformacion = true;
                    this.informacionFiscalSucursalSinCambios = JSON.parse(JSON.stringify(this.informacionFiscalSucursal));
                    // (document.getElementById('pantallaDatosIn') as any).style.display = 'none';
					this.pantallaDatosIn = false;
                    // (document.getElementById('pantallaDatosOut') as any).style.display = 'block';
					this.pantallaDatosOut = true;
                    let params: any = {};
                    params.idPais = this.informacionFiscalSucursal.pais;

                    this._backService.HttpPost('catalogos/pais/getPais', {}, params).subscribe(
                        response => {
                            let dataTemp = eval(response);
                            this.nombrePais = dataTemp[0].nombre;
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
    };

    // OJO VALIDAR OTRO DATO AQUI
    // Función que muestra el mensaje correspondiente al cancelar la operación, redireccionando a home
    cancelarHome() {
        let sinCambios = this.informacionFiscalSucursal.nombre === this.informacionFiscalSucursalSinCambios.nombre &&
            this.informacionFiscalSucursal.RFC === this.informacionFiscalSucursalSinCambios.RFC &&
            this.informacionFiscalSucursal.pais === this.informacionFiscalSucursalSinCambios.pais &&
            this.informacionFiscalSucursal.calle === this.informacionFiscalSucursalSinCambios.calle &&
            this.informacionFiscalSucursal.estado === this.informacionFiscalSucursalSinCambios.estado &&
            this.informacionFiscalSucursal.colonia === this.informacionFiscalSucursalSinCambios.colonia &&
            this.informacionFiscalSucursal.ciudad === this.informacionFiscalSucursalSinCambios.ciudad &&
            this.informacionFiscalSucursal.codigoPostal === this.informacionFiscalSucursalSinCambios.codigoPostal &&
            this.informacionFiscalSucursal.numeroInterior === this.informacionFiscalSucursalSinCambios.numeroInterior &&
            this.informacionFiscalSucursal.numero === this.informacionFiscalSucursalSinCambios.numero &&
            this.informacionFiscalSucursal.telefono === this.informacionFiscalSucursalSinCambios.telefono &&
            this.informacionFiscalSucursal.email === this.informacionFiscalSucursalSinCambios.email &&
            this.informacionFiscalSucursal.radioTipo === this.informacionFiscalSucursalSinCambios.radioTipo &&
            this.informacionFiscalSucursal.idSucursal === this.informacionFiscalSucursalSinCambios.idSucursal &&
            this.informacionFiscalSucursal.idCliente === this.informacionFiscalSucursalSinCambios.idCliente;

        if (sinCambios) {
            this.informacionFiscalSucursal.limpiarCampos();
            //$location.path("/home"); redirecciona al home pero creo que mejor se deberia cerrar modal
        } else {
            this.modalDiscardHome(this.informacionFiscalClienteTranslate.deseaDescartar);
        }
    };

    // OJO VALIDAR OTRO DATO AQUI
    // Función que se ejecuta al dar aceptar en el mensaje de confirmación para descartar los cambios hechos en el formulario, yendo a home
    descartarCambiosHome() {
        this.informacionFiscalSucursal.limpiarCampos();
        //$location.path("/home");
    };

    // Función que cambia el color del borde del componente al default si se hace focus en él, recibe el id del componente
    cambiarColorBorde(idComponente?: any) {
        let x = $('#error' + idComponente).text();
        if (x.trim() == '') {
            $('#' + idComponente).removeClass("errorCampo");
        }
    };

    // Función que checkea o descheckea el radio correspondiente, modifica el valor de radioTipo
    checkRadio() {
        this.informacionFiscalSucursal.RFC = "";
        if (Number(this.informacionFiscalSucursal.radioTipo) == 0) {
            (document.getElementById("rfcInputFiscal") as any).maxLength = 13;
            this.informacionFiscalSucursal.tamanioRFC = 13;
            this.informacionFiscalSucursal.personaMoral = 0;
            this.informacionFiscalSucursal.personaFisica = 1;

        } else {
            (document.getElementById("rfcInputFiscal") as any).maxLength = 12;
            this.informacionFiscalSucursal.tamanioRFC = 12;
            this.informacionFiscalSucursal.personaMoral = 0;
            this.informacionFiscalSucursal.personaFisica = 1;

        }
    };

    // Función que devuelve el borde de los campos al color default
    devolverColorBorde() {
        (document.getElementById('rfcInputFiscal') as any).style.borderColor = "#e5e5e5";
        (document.getElementById('coloniaInput') as any).style.borderColor = "#e5e5e5";
        (document.getElementById('nombreInputFiscal') as any).style.borderColor = "#e5e5e5";
        (document.getElementById('codigoPostalInput') as any).style.borderColor = "#e5e5e5";
        (document.getElementById('calleInput') as any).style.borderColor = "#e5e5e5";
        (document.getElementById('numeroInteriorInput') as any).style.borderColor = "#e5e5e5";
        (document.getElementById('telefonoInput') as any).style.borderColor = "#e5e5e5";
        (document.getElementById('ciudadInput') as any).style.borderColor = "#e5e5e5";
        (document.getElementById('emailInput') as any).style.borderColor = "#e5e5e5";
    };

    //Función que permite editar los datos
    regresar() {
		this.pantallaDatosIn = true;
        //(document.getElementById('pantallaDatosIn') as any).style.display = 'block';
        //(document.getElementById('pantallaDatosOut') as any).style.display = 'none';
		this.pantallaDatosOut = false;
    };

    // Modal Alert
    modalAlert(message?: any) {
        $('#modal-alert').modal({ backdrop: 'static', keyboard: false });
        $("#modal-alert .modal-body").html('<span class="title">' + message + '</span>');
    };

    // Modal Discard home
    modalDiscardHome(message?: any) {
        $('#modal-discard').modal({ backdrop: 'static', keyboard: false });
        $("#modal-discard .modal-body").html('<span class="title">' + message + '</span>');
    };

    facturar() {
        //window.close();
		this.dialogRef.close();
    };

    //Función que valida los campos
    validadParametros() {
        const xCamp = [{ scope: this.informacionFiscalSucursal.RFC, name: 'rfcInputFiscal', tValid: 'rfc' },
        { scope: this.informacionFiscalSucursal.nombre, name: 'nombreInputFiscal', tValid: 'nombre' },
        { scope: this.informacionFiscalSucursal.codigoPostal, name: 'codigoPostalInput', tValid: 'codigoPostal' }
        ];
        for (let i = 0; i < xCamp.length; i++) {
            $('#' + xCamp[i].name).removeClass("errorCampo");
            $('#error' + xCamp[i].name).text('');

            if (i != 6) {
                if ((document.getElementById(xCamp[i].name) as any).value == "") {
                    this.valido = false;
                }
            }

            if ((document.getElementById(xCamp[i].name) as any).value != "") {
                this.validarCampos(xCamp[i].scope, xCamp[i].name, xCamp[i].tValid, 1);
            } else {
                if (i != 6) {
                    $('#' + xCamp[i].name).addClass("errorCampo");
                    $('#error' + xCamp[i].name).text('');
                }
            }
        }
    };

    txtfocus(v?: any, event?: any, t?: any) {
        if (t == 'f') {
            if (this.guardar) {
                let txt = (document.getElementById(event.target.id) as any).value;
                let error = (document.getElementById('error' + event.target.id) as any).innerHTML;
                if (error == '' || error == undefined) {
                    $("#" + event.target.id).removeClass("errorCampo");
                }
            }
        } else {
            if (this.guardar) {
                let txt = (document.getElementById(event.target.id) as any).value;
                if (txt == "" || txt == undefined) {
                    $("#" + event.target.id).addClass("errorCampo");

                } else {
                    let error = (document.getElementById('error' + event.target.id) as any).innerHTML;
                    if (error == '' || error == undefined) {
                        $("#" + event.target.id).removeClass("errorCampo");
                    }
                }
            }
        }
    };

    validarCampos(campo?: any, name?: any, tipo?: any, v?: any) {
        let numExp = RegExp("^[0-9]*$");

        let regexRazonSocial = /^[A-Za-z\sÀ-ÖØ-öø-ÿ]{1,}[\.]{0,1}[A-Za-z\sÀ-ÖØ-öø-ÿ]{0,}$/;
        let regexnombres = /^[A-Za-z\s][0-9]{1,}[\.]{0,1}[A-Za-z\s][0-9]{0,}$/;
        let regexCalle = /^[a-zA-Z1-9À-ÖØ-öø-ÿ]+\.?(( |\-)[a-zA-Z1-9À-ÖØ-öø-ÿ]+\.?)*$/;
        let regexCodigoPostal = /^([1-9]{2}|[0-9][1-9]|[1-9][0-9])[0-9]{3}$/;
        let regexTelefono = new RegExp("^(\\(\\d{2}\\)|\\d{2})?-?(\\d{2})?-?\\d{2}-?\\d{2}-?\\d{2}-?\\d{2}$");
        let regexNumero = /^\d{0,15}$/;
        let regexNumeroLetras = /^[a-zA-Z0-9]+\.?(( |\-)[a-zA-Z0-9]+\.?)*$/;
        let regexMovil = new RegExp("^(\\(\\d{3}\\)|\\d{3})?-?((\\d{3}-?\\d{3}-?\\d{2}-?\\d{2})|(\\d{2}-?\\d{2}-?\\d{2}-?\\d{2}-?\\d{2}))$");
        let regexEmail = /^[_a-z0-9-]+(.[_a-z0-9-]+)*@[a-z0-9-]+(.[a-z0-9-]+)*(.[a-z]{2,4})$/;
        //let regexRFC = /^([A-Z|a-z|&amp;]{3})(([0-9]{2})([0][13456789]|[1][012])([0][1-9]|[12][\d]|[3][0])|([0-9]{2})([0][13578]|[1][02])([0][1-9]|[12][\d]|[3][01])|([02468][048]|[13579][26])([0][2])([0][1-9]|[12][\d])|([1-9]{2})([0][2])([0][1-9]|[12][0-8]))(\w{2}[A|a|0-9]{1})$|^([A-Z|a-z]{4})(([0-9]{2})([0][13456789]|[1][012])([0][1-9]|[12][\d]|[3][0])|([0-9]{2})([0][13578]|[1][02])([0][1-9]|[12][\d]|[3][01])|([02468][048]|[13579][26])([0][2])([0][1-9]|[12][\d])|([1-9]{2})([0][2])([0][1-9]|[12][0-8]))((\w{2})([A|a|0-9]{1})){0,3}$/;
        //let regexRFC = /^[a-zA-Z]{3,4}(\d{6})((\D|\d){3})?$/;
        let rfcFisica = /^[A-ZÑ&]{4}[0-9]{2}[0-1][0-9][0-3][0-9][A-Z0-9]{3}$/i;
        let rfcMoral = /^[A-ZÑ&]{3}[0-9]{2}[0-1][0-9][0-3][0-9][A-Z0-9]{3}$/i;

        let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (tipo == 'razonSocial') {
            if (campo != "") {
                if (!regexRazonSocial.test(campo)) {
                    $("#" + name).addClass("errorCampo");
                    $('#error' + name).text(this.informacionFiscalClienteTranslate.nombreFormato);
                    this.setFalseValidos(v);
                } else {
                    $("#" + name).removeClass("errorCampo");
                    $('#error' + name).text('');
                }
            } else {
                $("#" + name).addClass("errorCampo");
                $('#error' + name).text('');
                this.setFalseValidos(v);
            }
        }
        if (tipo == 'numLetras') {
            if (campo != "") {
                if (!regexNumeroLetras.test(campo)) {
                    $("#" + name).addClass("errorCampo");
                    $('#error' + name).text(this.informacionFiscalClienteTranslate.numeroFormato);
                    this.setFalseValidos(v);
                } else {
                    $("#" + name).removeClass("errorCampo");
                    $('#error' + name).text('');
                }
            } else {
                $("#" + name).addClass("errorCampo");
                $('#error' + name).text('');
                this.setFalseValidos(v);
            }
        }
        if (tipo == 'numInteriorLetras') {
            if (campo != "") {
                if (!regexNumeroLetras.test(campo)) {
                    $("#" + name).addClass("errorCampo");
                    $('#error' + name).text(this.informacionFiscalClienteTranslate.numeroInterFormato);
                    this.setFalseValidos(v);
                } else {
                    $("#" + name).removeClass("errorCampo");
                    $('#error' + name).text('');
                }
            }
        }
        if (tipo == 'telefono') {
            if (campo != "") {
                if (!regexTelefono.test(campo)) {
                    $("#" + name).addClass("errorCampo");
                    $('#error' + name).text(this.informacionFiscalClienteTranslate.telefonoFormato);
                    this.setFalseValidos(v);
                } else {
                    $("#" + name).removeClass("errorCampo");
                    $('#error' + name).text('');
                }
            } else {
                $("#" + name).addClass("errorCampo");
                $('#error' + name).text('');
                this.setFalseValidos(v);
            }
        }
        if (tipo == 'rfc') {
            if (campo != "") {
                if (Number(this.informacionFiscalSucursal.radioTipo) == 0) { //fisico
                    if (!rfcFisica.test(campo)) {
                        $("#" + name).addClass("errorCampo");
                        $('#error' + name).text(this.informacionFiscalClienteTranslate.rfcFormato);
                        this.setFalseValidos(v);
                    } else {
                        $("#" + name).removeClass("errorCampo");
                        $('#error' + name).text('');
                    }
                } else { //moral
                    if (!rfcMoral.test(campo)) {
                        $("#" + name).addClass("errorCampo");
                        $('#error' + name).text(this.informacionFiscalClienteTranslate.rfcFormato);
                        this.setFalseValidos(v);
                    } else {
                        $("#" + name).removeClass("errorCampo");
                        $('#error' + name).text('');
                    }
                }

            } else {
                $("#" + name).addClass("errorCampo");
                $('#error' + name).text('');
                this.setFalseValidos(v);
            }
        }
        if (tipo == 'numero') {
            if (campo != "") {
                if (!numExp.test(campo)) {
                    $("#" + name).addClass("errorCampo");
                    $('#error' + name).text(this.informacionFiscalClienteTranslate.soloEnteros);
                    this.setFalseValidos(v);
                } else {
                    $("#" + name).removeClass("errorCampo");
                    $('#error' + name).text('');
                }
            } else {
                $("#" + name).addClass("errorCampo");
                $('#error' + name).text('');
            }
        }
        if (tipo == 'nombre') {
            if (campo != "") {
                if (!regexRazonSocial.test(campo)) {
                    $("#" + name).addClass("errorCampo");
                    $('#error' + name).text(this.informacionFiscalClienteTranslate.nombreFormato);
                    this.setFalseValidos(v);
                } else {
                    $("#" + name).removeClass("errorCampo");
                    $('#error' + name).text('');
                }
            } else {
                $("#" + name).addClass("errorCampo");
                $('#error' + name).text('');
                this.setFalseValidos(v);
            }
        }
        if (tipo == 'colonia') {
            if (campo != "") {
                if (!regexRazonSocial.test(campo)) {
                    $("#" + name).addClass("errorCampo");
                    $('#error' + name).text(this.informacionFiscalClienteTranslate.coloniaFormato);
                    this.setFalseValidos(v);
                } else {
                    $("#" + name).removeClass("errorCampo");
                    $('#error' + name).text('');
                }
            } else {
                $("#" + name).addClass("errorCampo");
                $('#error' + name).text('');
                this.setFalseValidos(v);
            }
        }
        if (tipo == 'ciudad') {
            if (campo != "") {
                if (!regexRazonSocial.test(campo)) {
                    $("#" + name).addClass("errorCampo");
                    $('#error' + name).text(this.informacionFiscalClienteTranslate.ciudadFormato);
                    this.setFalseValidos(v);
                } else {
                    $("#" + name).removeClass("errorCampo");
                    $('#error' + name).text('');
                }
            } else {
                $("#" + name).addClass("errorCampo");
                $('#error' + name).text('');
                this.setFalseValidos(v);
            }
        }
        if (tipo == 'calle') {
            if (campo != "") {
                if (!regexCalle.test(campo)) {
                    $("#" + name).addClass("errorCampo");
                    $('#error' + name).text(this.informacionFiscalClienteTranslate.calleFormato);
                    this.setFalseValidos(v);
                } else {
                    $("#" + name).removeClass("errorCampo");
                    $('#error' + name).text('');
                }
            } else {
                $("#" + name).addClass("errorCampo");
                $('#error' + name).text('');
                this.setFalseValidos(v);
            }
        }
        if (tipo == 'codigoPostal') {
            if (campo != "") {
                if (!regexCodigoPostal.test(campo)) {
                    $("#" + name).addClass("errorCampo");
                    $('#error' + name).text(this.informacionFiscalClienteTranslate.codigoPostalFormato);
                    this.setFalseValidos(v);
                } else {
                    $("#" + name).removeClass("errorCampo");
                    $('#error' + name).text('');
                }
            } else {
                $("#" + name).addClass("errorCampo");
                $('#error' + name).text('');
                this.setFalseValidos(v);
            }
        }
        if (tipo == 'correo') {
            if (campo != "") {
                if (!re.test(campo)) {
                    $("#" + name).addClass("errorCampo");
                    $('#error' + name).text(this.informacionFiscalClienteTranslate.emailFormato);
                    this.setFalseValidos(v);
                } else {
                    $("#" + name).removeClass("errorCampo");
                    $('#error' + name).text('');
                }
            } else {
                $("#" + name).addClass("errorCampo");
                $('#error' + name).text('');
                this.setFalseValidos(v);
            }
        }
        if (tipo == 'requerido') {
            if (campo == "") {
                $("#" + name).addClass("errorCampo");
                $('#error' + name).text('');
                this.setFalseValidos(v);
            } else {
                $("#" + name).removeClass("errorCampo");
                $('#error' + name).text('');
            }
        }
        if (tipo == 'otro') {
            $("#" + name).addClass("errorCampo");
            $('#error' + name).text(campo);
            this.setFalseValidos(v);
        }
    }

    setFalseValidos(v?: any) {
        this.valido = false;
    }

    // Carga de opciones del dropdown list de usoCFDI 
    cargarUsoCFDI() {
        this._backService.HttpPost('configuracion/configuracionSucursal/cargarUsoCFDI', {}, {}).subscribe(
            response => {
                this.informacionFiscalSucursal.usosCFDI = eval(response);
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

    // Carga de opciones del dropdown list de metodo de pago
    cargarMetodosDePago() {
        this._backService.HttpPost('configuracion/configuracionSucursal/cargarMetodosDePago', {}, {}).subscribe(
            response => {
                this.informacionFiscalSucursal.metodosDePago = eval(response);
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

    // Carga de opciones del dropdown list de forma de pago
    cargarFormasDePago() {
        this._backService.HttpPost('configuracion/configuracionSucursal/cargarFormasDePago', {}, {}).subscribe(
            response => {
                this.informacionFiscalSucursal.formasDePago = eval(response);
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

    //Funcion que carga el regimen fiscal Receptor
    cargarRegimen() {
        let params: any = {};
        params.moral = this.informacionFiscalSucursal.personaMoral;
        params.fisica = this.informacionFiscalSucursal.personaFisica;
        this._backService.HttpPost('configuracion/configuracionSucursal/cargarRegimen', {}, params).subscribe(
            response => {
                this.informacionFiscalSucursal.dataRegimen = eval(response);
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

    closeModalInformacion(){
        this.dialogRef.close();
    }
}
