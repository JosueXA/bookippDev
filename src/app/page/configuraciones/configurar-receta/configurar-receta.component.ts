import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MethodsService } from 'src/app/core/services/methods.service';
import { PantallaService } from 'src/app/core/services/pantalla.service';
import { ToasterService } from 'src/shared/toaster/toaster.service';
import Croppie from 'croppie'; // Croppie
declare var $: any; // JQUERY
import * as bootstrap from 'bootstrap'; // BOOTSTRAP
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'app-configurar-receta',
    templateUrl: './configurar-receta.component.html',
    styleUrls: ['./configurar-receta.component.scss', '../../page.component.scss']
})
export class ConfigurarRecetaComponent implements OnInit {
    sessionTraslate: any = {}
    recetaMedicaTranslate: any = {}

    modales: any = {};

    messageConfirmGuardar: any = "";

    constructor(
        private _backService: MethodsService,
        private _translate: TranslateService,
        private _pantallaServicio: PantallaService,
        private _router: Router,
        private _toaster: ToasterService,
		private matIconRegistry: MatIconRegistry,
		private domSanitizer: DomSanitizer,
    ) {
        this._translate.setDefaultLang(this._pantallaServicio.idioma);
        this._translate.use(this._pantallaServicio.idioma);

        this._translate.get('recetaMedicaTranslate').subscribe((translated: string) => {
            this.recetaMedicaTranslate = this._translate.instant('recetaMedicaTranslate');
            this.sessionTraslate = this._translate.instant('sessionTraslate');
        });

		this.matIconRegistry.addSvgIcon('iconCasita', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Casa1-icon.svg"));
		this.matIconRegistry.addSvgIcon('iconFlechaDerecha', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/FlechaDerechaPequena-icon.svg"));
		this.matIconRegistry.addSvgIcon('iconCerrarModal', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/10-2-TiposdeExcepcion-icon.svg"));
    }

    ngOnInit(): void {
        this.crearModales();
        this.iniciarPantalla();
    }

    // ---------------------- Variables --------------------------------------//

    receta: any = {
        nomConsultorio: "",
        nomPrescribe: "",
        cedulaProfesional: "",
        especialidadMedica: "",
        direccion: "",
        selectPais: null,
        selectEstado: null,
        ciudad: "",
        cp: "",
        institutoCedula: "",
        cedulaEspecialidad: "",
        telefono: "",
        imagen: "",
        orientacion: false, //Significa que la orientacion por defaul es Vertical
        copia: false,
        dataPaises: [],
        dataEstados: [],
        guardar: false,
        botonGuardar: false,
        bandConfiguracionRecetaExistente: false,
    }; //Significa que por default solo es una receta.
    imagenCompleta: any = null;
    imageCroppie: any = null;
    camposVacios: any = null;
    camposIncorrectos: any = null;
    _printIframe: any = null;
    nArchivoData: any = null;
    InstallTrigger: any = null;

    // ---------------------- Funciones --------------------------------------//

    crearModales() {
        if ($('body').find('.modalCargarImagen').length > 1) {
            $('body').find('.modalCargarImagen')[1].remove();
        }

        this.modales.modalCargarImagen = new bootstrap.Modal(
            $('#modalCargarImagen').appendTo('body'),
            {
                backdrop: 'static',
                keyboard: false,
            }
        );

        if ($('body').find('.modalGuardar').length > 1) {
            $('body').find('.modalGuardar')[1].remove();
        }

        this.modales.modalGuardar = new bootstrap.Modal(
            $('#modalGuardar').appendTo('body'),
            {
                backdrop: 'static',
                keyboard: false,
            }
        );
    }

    //Carga de países y estados, y la pantalla en general
    consultarPaises() {
        this._backService.HttpPost("catalogos/pais/getPaises", {}, {}).subscribe(
            response => {
                this.receta.dataPaises = eval(response);
            },
            error => {
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
        );
    };

    consultarEstados(idPais?: any) {
        this.receta.selectEstado = "";
        let params: any = {};
        if (idPais !== undefined) {
            params.idPais = idPais;
        } else {
            this.receta.dataEstados = [];
            params.idPais = this.receta.selectPais;
        }
        if (params.idPais !== undefined) {
            this._pantallaServicio.mostrarSpinner();
            this._backService.HttpPost("catalogos/estado/cargarEstadosEnPais", {}, params).subscribe(
                response => {
                    this.receta.dataEstados = eval(response);
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
            );
        }
    };

    iniciarPantalla() {
        this.consultarPaises();
        this._pantallaServicio.mostrarSpinner();
        this._backService.HttpPost("catalogos/receta/getConfiguracionReceta", {}, {}).subscribe(
            response => {
                this.receta.datosConfiguracionReceta = eval(response);
                if (this.receta.datosConfiguracionReceta.length === 0) {
                    this.receta.bandConfiguracionRecetaExistente = false;
                    this._pantallaServicio.ocultarSpinner();
                } else {
                    this.receta.bandConfiguracionRecetaExistente = true;
                    this.receta.nomConsultorio = this.receta.datosConfiguracionReceta[0].nombreConsultorio;
                    this.receta.nomPrescribe = this.receta.datosConfiguracionReceta[0].nombrePrescribe;
                    this.receta.cedulaProfesional = this.receta.datosConfiguracionReceta[0].cedula;
                    this.receta.especialidadMedica = this.receta.datosConfiguracionReceta[0].especialidad;
                    this.receta.direccion = this.receta.datosConfiguracionReceta[0].direccion;
                    this.receta.selectPais = this.receta.datosConfiguracionReceta[0].idPais;
                    this.consultarEstados(this.receta.selectPais);
                    this.receta.selectEstado = this.receta.datosConfiguracionReceta[0].idEstado;
                    this.receta.ciudad = this.receta.datosConfiguracionReceta[0].ciudad;
                    this.receta.cp = this.receta.datosConfiguracionReceta[0].cp;
                    this.receta.institutoCedula = this.receta.datosConfiguracionReceta[0].institucionCedula;
                    this.receta.cedulaEspecialidad = this.receta.datosConfiguracionReceta[0].cedulaEspecialidad;
                    this.receta.telefono = this.receta.datosConfiguracionReceta[0].telefono;
                    this.receta.orientacion = this.receta.datosConfiguracionReceta[0].orientacion;
                    this.receta.copia = this.receta.datosConfiguracionReceta[0].copia;
                    if (this.receta.datosConfiguracionReceta[0].logotipo === "") {
                        (document.getElementById("clienteFoto") as any).src = "../../../../assets/images/migracion/Imagen-Foto-300x300.png";
                    } else {
                        this.receta.imagen = this.receta.datosConfiguracionReceta[0].logotipo;
                        (document.getElementById("clienteFoto") as any).src = "data:image/jpeg;base64," + this.receta.datosConfiguracionReceta[0].logotipo;
                        (document.getElementById("clienteFoto") as any).style.width = "240px";
                        //(document.getElementById("cajaInput") as any).style.width = "100%";
                        $("#btnBorrarImagen").css("display", "inline");
                    }
                    this.receta.cambio = false;
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
        );
    };

    //Funciones para la lectura y funcion de la imagen
    openImg() {
        $("#fileFoto").click();
    }

    fileFotoOnchange(file: any) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
            let tipo: any = [];
            let image: any = new Image();
            image.src = e.target.result;
            tipo = image.src.split(";");
            this.imagenCompleta = image.src;
            if (tipo[0].toLowerCase().indexOf("png") != -1 || tipo[0].toLowerCase().indexOf("jpg") != -1 || tipo[0].toLowerCase().indexOf("jpeg") != -1) {
                const canvas1: any = document.getElementById('Canvas1');
                const context: any = (canvas1 as HTMLCanvasElement).getContext('2d');
                context.drawImage(image, 0, 0, 550, 450);

                setTimeout(() => {
                    let canvas: any = document.getElementById("Canvas1");
                    canvas.toDataURL("image/png");
                    let c: any = document.getElementById("Canvas1");
                    let ctx = c.getContext("2d");
                    ctx.clearRect(0, 0, 550, 450);
                    if ((document.getElementById("fileFoto") as any).files[0].size / 1024 > 6090) {
                        this.receta.imagen = "";
                        (document.getElementById("fileFoto") as any).value = "";
                        (document.getElementById("clienteFoto") as any).style.border = "3px red solid";
                        (document.getElementById("clienteFoto") as any).src = "../../../../assets/images/migracion/Imagen-Foto-300x300.png";
                        (document.getElementById("clienteFoto") as any).style.width = "155px";
                        (document.getElementById("cajaInput") as any).style.width = "155px";
                        $('#txtImagen').text(this.recetaMedicaTranslate.errorTamImagen);
                        $("#btnBorrarImagen").css("display", "none");
                    }
                    else {
                        setTimeout(() => {
                            this.imageCroppie = new Croppie(
                                document.getElementById('cropImage') as HTMLElement,
                                {
                                    boundary: {
                                        width: 350,
                                        height: 350
                                    },
                                    viewport: {
										width: 300,
										height: 300,
                                    }
                                }
                            );
                            this.imageCroppie.bind({
                                url: e.target.result,
                            });
                            //$("#btnRecortarLogo").css("display", "inline");
                        }, 500);
                        this.modales.modalCargarImagen.show();
                    }
                })
            }
            else {
                this.receta.imagen = "";
                (document.getElementById("fileFoto") as any).value = "";
                (document.getElementById("clienteFoto") as any).style.border = "3px red solid";
                (document.getElementById("clienteFoto") as any).src = "img/system/iconoCamara.png";
                (document.getElementById("clienteFoto") as any).style.width = "155px";
                (document.getElementById("cajaInput") as any).style.width = "155px";
                $('#txtImagen').text(this.recetaMedicaTranslate.errorForImagen);
                $("#btnBorrarImagen").css("display", "none");
            }
        };

        reader.readAsDataURL(file.target.files[0]);
    };

    borrarImagen() {
        this.receta.imagen = "";
        (document.getElementById("fileFoto") as any).value = "";
        (document.getElementById("clienteFoto") as any).src = "../../../../assets/images/migracion/Imagen-Foto-300x300.png";
        (document.getElementById("clienteFoto") as any).style.width = "155px";
        //(document.getElementById("cajaInput") as any).style.width = "155px";
        $('#txtImagen').text("");
        (document.getElementById("clienteFoto") as any).style.border = "";
        $("#btnBorrarImagen").css("display", "none");
    }

    //Funcion para recortar imagen del logo
    recortarImagen() {
        this.imageCroppie
            .result({ type: 'base64' })
            .then((imagenCortada: string) => {
                let image = new Image();
                image.src = imagenCortada;
                image.onload = () => {
                    setTimeout(() => {
                        const canvas = document.getElementById(
                            'Canvas1'
                        ) as HTMLCanvasElement;
                        const ctx: any = canvas.getContext('2d');
                        ctx.clearRect(0, 0, 550, 450);
                        ctx.drawImage(image, 0, 0, 550, 450);
                        $('#txtImagen').text("");
                        (document.getElementById("clienteFoto") as any).style.border = "";
                        (document.getElementById("clienteFoto") as any).style.width = "240px";
                        (document.getElementById("clienteFoto") as any).style.height = "155px";
                        //(document.getElementById("cajaInput") as any).style.width = "240px";
                        (document.getElementById("clienteFoto") as any).src = canvas.toDataURL("image/png");
                        $("#btnBorrarImagen").css("display", "inline");
                        let base = canvas.toDataURL("image/png").split(",");
                        let comprimido = base[1];
                        this.receta.imagen = comprimido;
                    }, 500)
                }
            })

        //$("#btnRecortarLogo").css("display", "none");
        this.imageCroppie.destroy();
    }

    //Funcion para cerrar modal de recortado
    cancelarRecortadoImagen() {
        this.imageCroppie.croppie('destroy');
        //$("#btnRecortarLogo").css("display", "none");
        (document.getElementById("fileFoto") as any).value = "";
    }

    //VALIDACION
    validarCampos() {
        let nomynumExp = RegExp("^[a-zA-Z áéíóúñÁÉÍÓÚÑüÜ\\s\\d]*$");
        let insitutoExp = RegExp("^[a-zA-Z áéíóúñÁÉÍÓÚÑüÜ\\s\\d.\\/]*$");
        let direccionExp = RegExp("^[a-zA-Z áéíóúñÁÉÍÓÚÑüÜ\\s\\d.,#\\/]*$");
        let valExp = RegExp("^[a-zA-Z áéíóúñÁÉÍÓÚÑüÜ\\s\\r\\n]*$");
        let telefonoExp = new RegExp("^(\\(\\d{2}\\)|\\d{2})?-?(\\d{2})?-?\\d{2}-?\\d{2}-?\\d{2}-?\\d{2}$");
        let numerosExp = new RegExp("^([0-9])*$");
        let cp = new RegExp("^([0-9]){5,10}$");
        this.camposVacios = 0;
        this.camposIncorrectos = 0;
        this.receta.guardar = true;

        if (this.receta.nomConsultorio == "") {
            $("#nomConsultorio").addClass("errorCampo");
            $('#errornomConsultorio').text("");
            this.camposVacios++;
        } else {
            if (!nomynumExp.test(this.receta.nomConsultorio)) {
                $("#nomConsultorio").addClass("errorCampo");
                $('#errornomConsultorio').text(this.recetaMedicaTranslate.errornomConsultorio);
                this.camposIncorrectos++;
            }
            else {
                $("#nomConsultorio").removeClass("errorCampo");
                $('#errornomConsultorio').text("");
            }
        }

        if (this.receta.cedulaProfesional != "") {
            if (!numerosExp.test(this.receta.cedulaProfesional)) {
                $("#cedulaProfesional").addClass("errorCampo");
                $('#errorcedulaProfesional').text(this.recetaMedicaTranslate.errorcedulaProfesional);
                this.camposIncorrectos++;
            }
            else {
                $("#cedulaProfesional").removeClass("errorCampo");
                $('#errorcedulaProfesional').text("");
            }
        }

        if (this.receta.ciudad != "") {
            if (!valExp.test(this.receta.ciudad)) {
                $("#nomCiudad").addClass("errorCampo");
                $('#errornomCiudad').text(this.recetaMedicaTranslate.errornomCiudad);
                this.camposIncorrectos++;
            }
            else {
                $("#nomCiudad").removeClass("errorCampo");
                $('#errornomCiudad').text("");
            }
        }

        if (this.receta.cp != "") {
            if (!cp.test(this.receta.cp)) {
                $("#cp").addClass("errorCampo");
                $('#errorcp').text(this.recetaMedicaTranslate.errorcp);
                this.camposIncorrectos++;
            }
            else {
                $("#cp").removeClass("errorCampo");
                $('#errorcp').text("");
            }
        }

        if (this.receta.institutoCedula != "") {
            if (!insitutoExp.test(this.receta.institutoCedula)) {
                $("#nomInstituto").addClass("errorCampo");
                $('#errornomInstituto').text(this.recetaMedicaTranslate.errornomInstituto);
                this.camposIncorrectos++;
            }
            else {
                $("#nomInstituto").removeClass("errorCampo");
                $('#errornomInstituto').text("");
            }
        }

        if (this.receta.cedulaEspecialidad != "") {
            if (!numerosExp.test(this.receta.cedulaEspecialidad)) {
                $("#cedulaEsp").addClass("errorCampo");
                $('#errorcedulaEsp').text(this.recetaMedicaTranslate.errorcedulaEsp);
                this.camposIncorrectos++;
            }
            else {
                $("#cedulaEsp").removeClass("errorCampo");
                $('#errorcedulaEsp').text("");
            }
        }

        if (this.receta.telefono != "") {
            if (!telefonoExp.test(this.receta.telefono)) {
                $("#telefono").addClass("errorCampo");
                $('#errortelefono').text(this.recetaMedicaTranslate.errortelefono);
                this.camposIncorrectos++;
            }
            else {
                $("#telefono").removeClass("errorCampo");
                $('#errortelefono').text("");
            }
        }

        if (this.receta.direccion != "") {
            if (!direccionExp.test(this.receta.direccion)) {
                $("#direccion").addClass("errorCampo");
                $('#errordireccion').text(this.recetaMedicaTranslate.errordireccion);
                this.camposIncorrectos++;
            }
            else {
                $("#direccion").removeClass("errorCampo");
                $('#errordireccion').text("");
            }
        }

        if (this.receta.especialidadMedica != "") {
            if (!nomynumExp.test(this.receta.especialidadMedica)) {
                $("#especialidad").addClass("errorCampo");
                $('#errorespecialidad').text(this.recetaMedicaTranslate.errorespecialidad);
                this.camposIncorrectos++;
            }
            else {
                $("#especialidad").removeClass("errorCampo");
                $('#errorespecialidad').text("");
            }
        }

        if (this.receta.nomPrescribe != "") {
            if (!valExp.test(this.receta.nomPrescribe)) {
                $("#nomPrescribe").addClass("errorCampo");
                $('#errornomPrescribe').text(this.recetaMedicaTranslate.errornomPrescribe);
                this.camposIncorrectos++;
            }
            else {
                $("#nomPrescribe").removeClass("errorCampo");
                $('#errornomPrescribe').text("");
            }
        }
    }

    focus(id?: any) {
        $(id).removeClass("errorCampo");
    }

    txtfocus(ob?: any, evento?: any, tipo?: any) {
        if (tipo === 'f') {
            if (this.receta.guardar) {
                let txt = (document.getElementById(evento.target.id) as any).value;
                let error = (document.getElementById('error' + evento.target.id) as any).innerHTML;
                if (error === '' || error === undefined) {
                    $("#" + evento.target.id).removeClass("errorCampo");
                }
            }
        } else {
            if (this.receta.guardar) {
                let txt = (document.getElementById(evento.target.id) as any).value;
                if (txt === "" || txt === undefined) {
                    if (ob === 1) {
                        if (evento.target.id !== "cedulaEsp" && evento.target.id !== "nomCiudad" && evento.target.id !== "cp" && evento.target.id !== "telefono") {
                            $("#" + evento.target.id).addClass("errorCampo");
                        }
                    }
                } else {
                    let error = (document.getElementById('error' + evento.target.id) as any).innerHTML;
                    if (error === '' || error === undefined) {
                        $("#" + evento.target.id).removeClass("errorCampo");
                    }
                }
            }
        }
    };

    limpiarErrorMsg() {
        $("#nomConsultorio").removeClass("errorCampo");
        $('#errornomConsultorio').text("");
        $("#cedulaProfesional").removeClass("errorCampo");
        $('#errorcedulaProfesional').text("");
        $("#nomCiudad").removeClass("errorCampo");
        $('#errornomCiudad').text("");
        $("#cp").removeClass("errorCampo");
        $('#errorcp').text("");
        $("#nomInstituto").removeClass("errorCampo");
        $("#cedulaEsp").removeClass("errorCampo");
        $('#errorcedulaEsp').text("");
        $("#telefono").removeClass("errorCampo");
        $('#errortelefono').text("");
        $("#direccion").removeClass("errorCampo");
        $('#errordireccion').text("");
        $("#especialidad").removeClass("errorCampo");
        $('#errorespecialidad').text("");
        $("#nomPrescribe").removeClass("errorCampo");
        $('#errornomPrescribe').text("");
    };

    //Guardar datos configurables de la receta
    guardarReceta() {
        $("#botonGuardar").addClass("disabled");
        this.limpiarErrorMsg();
        this.validarCampos();
        if (this.camposIncorrectos === 0 && this.camposVacios === 0) {
            this._pantallaServicio.mostrarSpinner();
            let params: any = {};
            params.logotipo = this.receta.imagen;
            params.nombreConsultorio = this.receta.nomConsultorio;
            params.nombrePrescribe = this.receta.nomPrescribe;
            params.institucionCedula = this.receta.institutoCedula;
            params.cedula = this.receta.cedulaProfesional;
            params.cedulaEspecialidad = this.receta.cedulaEspecialidad;
            params.especialidad = this.receta.especialidadMedica;
            params.direccion = this.receta.direccion;
            params.ciudad = this.receta.ciudad;
            if (this.receta.selectEstado === undefined || this.receta.selectEstado === null) {
                params.idEstado = "";
            } else {
                params.idEstado = this.receta.selectEstado;
            }
            if (this.receta.selectPais === undefined || this.receta.selectPais === null) {
                params.idPais = "";
            } else {
                params.idPais = this.receta.selectPais;
            }
            params.cp = this.receta.cp;
            params.telefono = this.receta.telefono;
            params.orientacion = this.receta.orientacion ? 1 : 0;
            params.copia = this.receta.copia ? 1 : 0;
            if (this.receta.bandConfiguracionRecetaExistente) {
                params.editable = "1"; //Significa que ya era existente y se está editando

                this._backService.HttpPost("catalogos/receta/guardarConfiguracionReceta", {}, params).subscribe(
                    response => {
                        this._pantallaServicio.ocultarSpinner();
                        this.messageConfirmGuardar = this.recetaMedicaTranslate.msgGuardar;
                        this.modales.modalGuardar.show();
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
                );
            } else {
                params.editable = "2"; //Significa que no es el primer registro de la sucursal 
                this._backService.HttpPost("catalogos/receta/guardarConfiguracionReceta", {}, params).subscribe(
                    response => {
                        this.receta.bandConfiguracionRecetaExistente = true;
                        this._pantallaServicio.ocultarSpinner();
                        this.messageConfirmGuardar = this.recetaMedicaTranslate.msgGuardar;
                        this.modales.modalGuardar.show();
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
                );
            }
        }
        $("#botonGuardar").removeClass("disabled");
    }

    //Descartar los cambios hechos en la configuracion de la receta
    descartarCambios(direccion?: any) {
        if (direccion === "agenda") {
            this._router.navigate(["/" + direccion]);
        }
        if (direccion === "configurarReceta") {
            location.reload();
        }
    }

    verEjemplo() {
        this._pantallaServicio.mostrarSpinner();
        const d = new Date();
        let params: any = {};
        params.diaActual = d.getDate();
        params.mesActual = this.obtenerMes(d.getMonth());
        params.añoActual = d.getFullYear();

        this._backService.HttpPost("catalogos/receta/getPlantillaReceta", {}, params).subscribe(
            response => {
                const dataTemp = eval(response);
                if (dataTemp.archivo) {
                    const linkSource = `data:application/pdf;base64,${dataTemp.archivo}`;
                    const downloadLink = document.createElement("a");
                    const fileName = 'file.pdf';
                    downloadLink.href = linkSource;
                    downloadLink.download = fileName;
                    downloadLink.click();

                    let params: any = {};
                    params.nombreArchivo = dataTemp.nombreArchivo;

                    this._backService.HttpPost("catalogos/receta/borrarReceta", {}, params).subscribe(
                        response => {
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
                    );
                } else {
                    this._pantallaServicio.ocultarSpinner();
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
        );
    };

    printPdf(url?: any) {
        let iframe: any = this._printIframe;
        if (!this._printIframe) {
            iframe = this._printIframe = document.createElement('iframe');
            document.body.appendChild(iframe);

            iframe.style.display = 'none';
            iframe.onload = () => {
                setTimeout(() => {
                    iframe.focus();
                    iframe.contentWindow.print();
                    setTimeout(() => {
                        if (this.nArchivoData !== "false") {
                            let params: any = {};
                            params.nombreArchivo = this.nArchivoData;

                            this._backService.HttpPost("catalogos/receta/borrarReceta", {}, params).subscribe(
                                response => { },
                                error => {
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
                            );
                        }
                    }, 500);
                }, 1);
            };
        }

        iframe.src = url;
    }

    obtenerMes(fecha?: any) {
        var mes = "";
        switch (fecha) {
            case 0:
                mes = 'Enero';
                break;
            case 1:
                mes = 'Febrero';
                break;
            case 2:
                mes = 'Marzo';
                break;
            case 3:
                mes = 'Abril';
                break;
            case 4:
                mes = 'Mayo';
                break;
            case 5:
                mes = 'Junio';
                break;
            case 6:
                mes = 'Julio';
                break;
            case 7:
                mes = 'Agosto';
                break;
            case 8:
                mes = 'Septiembre';
                break;
            case 9:
                mes = 'Octubre';
                break;
            case 10:
                mes = 'Noviembre';
                break;
            case 11:
                mes = 'Diciembre';
                break;
        }
        return mes;
    }

}
