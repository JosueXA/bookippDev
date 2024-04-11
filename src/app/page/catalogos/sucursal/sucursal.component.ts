import { Component, OnInit } from '@angular/core';
import { MethodsService } from 'src/app/core/services/methods.service';
import moment from 'moment/moment';
import { TranslateService } from '@ngx-translate/core';
import { PantallaService } from 'src/app/core/services/pantalla.service';
import { Router } from '@angular/router';
import { ToasterService } from 'src/shared/toaster/toaster.service';
import * as bootstrap from 'bootstrap'; // BOOTSTRAP
declare var $: any; // JQUERY
import Croppie from 'croppie'; // Croppie
import '@angular/localize/init'; // carousel
import { OnExit } from '../../../guards/exit.guard';
import { DescartarCambiosServices } from 'src/app/core/services/descartar-cambios.service';
import { AuthService } from "../../../core/services/auth.service";
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'app-sucursal',
    templateUrl: './sucursal.component.html',
    styleUrls: ['./sucursal.component.scss', '../../page.component.scss'],
})
export class SucursalComponent implements OnInit, OnExit {
    // Variable de translate de sucursal
    sucursalTranslate: any = {};
    sessionTraslate: any = {};
    informacionFiscalCliente: any = {};

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
        private _descartarCambios: DescartarCambiosServices,
        private _authService: AuthService,
		private matIconRegistry: MatIconRegistry,
		private domSanitizer: DomSanitizer,
    ) {
        this._translate.setDefaultLang(this._pantallaServicio.idioma);
        this._translate.use(this._pantallaServicio.idioma);

        this._translate.get('sucursalTranslate').subscribe((translated: string) => {
            this.sucursalTranslate = this._translate.instant('sucursalTranslate');
            this.sessionTraslate = this._translate.instant('sessionTraslate');
            this.informacionFiscalCliente = this._translate.instant(
                'informacionFiscalCliente'
            );
        });

		this.matIconRegistry.addSvgIcon('Agregar-1-icon', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Agregar-1-icon.svg"));
		this.matIconRegistry.addSvgIcon('AlarmaCirculo-icon', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/AlarmaCirculo-icon.svg"));
		this.matIconRegistry.addSvgIcon('Casa1-icon', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Casa1-icon.svg"));
		this.matIconRegistry.addSvgIcon('03-Sucursal-icon', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/03-Sucursal-icon.svg"));
		this.matIconRegistry.addSvgIcon('timeClose', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/MasPequena-icon.svg"));
		this.matIconRegistry.addSvgIcon('Basura-icon', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Basura-icon.svg"));
		this.matIconRegistry.addSvgIcon('iconClose', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/10-2-TiposdeExcepcion-icon.svg"));
		this.matIconRegistry.addSvgIcon('iconFlechaDerecha', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/FlechaDerechaPequena-icon.svg"));
    }

    ngOnInit(): void {
        this._pantallaServicio.mostrarSpinner();
        this.crearModales();
        this.consultaIdioma();
        this.consultarSucursal();
        this.getLocation();
        this.cargarVentanas();
    }

    onExit() {
        const showExit = this.accion === 'Nuevo' ? this.validarDescartarNuevo() : this.validarDescartarActualizar();
        return this._descartarCambios.mostrarModal(showExit);
    }

    // -------------------------------------- Declaración de variables --------------------------- //
    nueva_sucursal: boolean = false;
    rootScope_fromState: any = 'sucursal';
    sucursal: any = {
        markersArray: [],
        dataCategorias: [],
        dataSubcategorias: [],
        lunes: true,
        martes: true,
        miercoles: true,
        jueves: true,
        viernes: true,
        sabado: false,
        domingo: false,
        esAlta: false,
        dataSucursalCategoria: [],
        dataSucursalSubcategoria: [],
        dataHorariosLaborales: [],
        dataHorariosLaboralesCopy: [],
        dataHorariosDescansos: [],
        dataFoto: [],
        dataLogo: [],
        dataFotosSucursales: [],
        nombre: '',
        email: '',
        telefono: '',
        telefono2: '',
        idioma: '',
        categorias: [],
        subcategoria: [],
        foto: [],
        logo: '',
        imagenRecortada: '',
        calle: '',
        entreCalles: '',
        numero: '',
        numeroInterior: '',
        colonia: '',
        codigoPostal: '',
        pais: '',
        estado: '',
        ciudad: '',
        paginaWeb: '',
        facebook: '',
        twitter: '',
        instagram: '',
        fotoCargada: '',
        logoCargado: '',
        direccion: '',
        idLogo: null,
        contadorLunes: 0,
        contadorMartes: 0,
        contadorMiercoles: 0,
        contadorJueves: 0,
        contadorViernes: 0,
        contadorSabado: 0,
        contadorDomingo: 0,
        tipoContenidoLogo: '',
        objetoLunes: [],
        objetoMartes: [],
        objetoMiercoles: [],
        objetoJueves: [],
        objetoViernes: [],
        objetoSabado: [],
        objetoDomingo: [],
        objetoLu: [],
        objetoMa: [],
        objetoMi: [],
        objetoJu: [],
        objetoVi: [],
        objetoSa: [],
        objetoDo: [],
        cargoLogo: false,
        cargoFoto: false,
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
        tipoContenidoFoto: [],
        categoriasSucursal1: [],
        subcategoriasSucursal1: [],
        logoSucursal1: '',
        nombreSucursales: [],
        fotosAgregadas: [],
        fotosCargadas: [],
        idImagenes: [],
        lunesValidDescartar: [],
        martesValidDescartar: [],
        miercolesValidDescartar: [],
        juevesValidDescartar: [],
        viernesValidDescartar: [],
        sabadoValidDescartar: [],
        domingoValidDescartar: [],
    };
    establecida = true;
    consulta = false;
    guardar = false;
    guardarDescansos = false;
    categoriaSelccionada = false;
    msgFoto = '';
    msgLogo = '';
    validFoto = true;
    validLogo = true;
    numImagen = 0;
    accion = 'Actualizar';
    rootScope_accionSucursal = 'Actualizar';
    msgLunesDescansos: any = [];
    msgMartesDescansos: any = [];
    msgMiercolesDescansos: any = [];
    msgJuevesDescansos: any = [];
    msgViernesDescansos: any = [];
    msgSabadoDescansos: any = [];
    msgDomingoDescansos: any = [];
    validContadorLunes = false;
    validContadorMartes = false;
    validContadorMiercoles = false;
    validContadorJueves = false;
    validContadorViernes = false;
    validContadorSabado = false;
    validContadorDomingo = false;
    cargada = false;
    primeraCarga = true;
    cont = 0;
    validar = 0;
    cargarDatosGenerales = true;
    deshabilitado = false;
    validEmpalmeLunes: any = [];
    validEmpalmeMartes: any = [];
    validEmpalmeMiercoles: any = [];
    validEmpalmeJueves: any = [];
    validEmpalmeViernes: any = [];
    validEmpalmeSabado: any = [];
    validEmpalmeDomingo: any = [];
    cargaFoto: any = [];
    cargaFoto0 = true;
    cargaFoto1 = false;
    cargaFoto2 = false;
    cargaFoto3 = false;
    cargaFoto4 = false;
    validarPrimeraCargaHorarios = false;
    descansosConsulta = false;
    bandera = true;
    validDescartar = false;
    agenda = '';
    stopChange = false;
    infiniteScroll: any = {
        numToAdd: 20,
        currentItems: 20,
    };
    mostrarBoton = false;
    imageCroppie: any = null;
    guardarSinRecortar: any = false;
    fotoCroppie: any = null;
    rowSelected: any = null;
    hora: any = [];
    //   rootScope_esGerenteGeneral: any = null; _pantallaServicio.esGerenteGeneral / _pantallaServicio.esGerenteSucursal
    //   rootScope_cantidadSucursales: any = null; _pantallaServicio.empresaPremium_configuracion.cantidadSucursales
    idSucursales: any = null;
    //   rootScope_dataSucursales: any = null;  _pantallaServicio.dataSucursales
    //   rootScope_validSucursales: any = null; _pantallaServicio.validSucursales
    btnEstablecer: any = '';
    dataEstado: any = '';
    nombrePantalla: any = '';
    descansos: any = '';
    cancelarModal: any = '';
    btnCancelarGeneral: any = '';
    chkValidLunes: any = '';
    chkValidMartes: any = '';
    chkValidMiercoles: any = '';
    chkValidJueves: any = '';
    chkValidViernes: any = '';
    chkValidSabado: any = '';
    chkValidDomingo: any = '';
    msgLunes: any = '';
    msgMartes: any = '';
    msgMiercoles: any = '';
    msgJueves: any = '';
    msgViernes: any = '';
    msgSabado: any = '';
    msgDomingo: any = '';
    idSucursalToActualizar: any = null;
    toActualizar: any = null;
    rootScope_toState: any = '';
    mapaCargado = false;
    calle: any = '';
    numero: any = '';
    colonia: any = '';
    codigoPostal: any = '';
    estadoSeleccionado: any = '';
    validHorarios: any = false;
    validCategorias: any = false;
    validSubcategorias: any = false;
    cambioSucursal: any = false;
    msgEmail: any = '';
    validEmail: any = false;
    msgTelefono: any = '';
    validTelefono: any = false;
    msgTelefono2: any = '';
    validTelefono2: any = false;
    msgDireccion: any = '';
    msgNumero: any = '';
    validHorariosDescansos: any = [];
    validDescartarFotos: any = false;
    validDescansos: any = false;
    validMaxCategorias: any = false;
    msgCategorias: any = '';
    contRequeridosHorarios: any = 0;
    contRequeridosDireccion: any = 0;
    contRequeridosDatosGenerales: any = 0;
    validTabDatosGenerales: any = false;
    msgImagen: any = '';
    guardadoValidado: any = false;
    msgHorariosLaboral: any = '';
    validLunes: any = '';
    validMartes: any = '';
    validMiercoles: any = '';
    validJueves: any = '';
    validViernes: any = '';
    validSabado: any = '';
    validDomingo: any = '';
    accesoTotal: any = false;
    varAux: any = null;
    rootScope_idSucursal: any = null; //_pantallaServicio.session
    actualizadoValidado: any = false;
    rootScope_nSucursal: any = ''; //_pantallaServicio.session
    rootScope_img: any = '';
    idiomaCargado: any = '';
    rootScope_stopChange: any = false;
    validCitas: any = false;
    dataCitasDetalle: any = null;
    validBorrar: any = null;
    validRangos: any = null;
    msgHora: any = null;
    showMap: any = false;
    elementoDdl: any = false;
    validRangoDescansos: any = false;
    validRangoDescansosEnDia: any = false;
    validRangoDescansoEnDia: any = false;
    validRango2: any = [];
    validEmpalme: any = false;
    validEmpalme2: any = false;
    validEmpalme3: any = false;
    contDescansosRequeridos: any = 0;
    validFormatoDescansos: any = 0;
    dataPais: any = null;
    ciudad: any = null;
    estado: any = null;
    pais: any = null;
    msgUbicacion: any = '';
    accuracy: any = '';
    error: any = '';
    aux: any = false;
    cerrada: boolean = false;
    lat: any = '';
    lon: any = '';
    map: any = null;
    long_name: any = '';
    types: any = [];
    msgCalle: any = '';
    msgEntreCalles: any = '';
    msgNumInterior: any = '';
    msgColonia: any = '';
    msgCPostal: any = '';
    showMap2: any = false;
    images: any = [];

    // ----------------------------------- Declaracion de funciones ----------------------------------- //

    //Funcion para cargar los modales
    crearModales() {
        if ($('body').find('.modalBorrarConfirm').length > 1) {
            $('body').find('.modalBorrarConfirm')[1].remove();
        }
        this.modales.modalBorrarConfirm = new bootstrap.Modal(
            $('#modalBorrarConfirm').appendTo('body'), { backdrop: 'static', keyboard: false, }
        );

        if ($('body').find('.modalConfirm').length > 1) {
            $('body').find('.modalConfirm')[1].remove();
        }
        this.modales.modalConfirm = new bootstrap.Modal(
            $('#modalConfirm').appendTo('body'), { backdrop: 'static', keyboard: false, }
        );

        if ($('body').find('.modalConfirmDescartarActualizar').length > 1) {
            $('body').find('.modalConfirmDescartarActualizar')[1].remove();
        }
        this.modales.modalConfirmDescartarActualizar = new bootstrap.Modal(
            $('#modalConfirmDescartarActualizar').appendTo('body'), { backdrop: 'static', keyboard: false, }
        );

        if ($('body').find('.modalConfirmServicios').length > 1) {
            $('body').find('.modalConfirmServicios')[1].remove();
        }
        this.modales.modalConfirmServicios = new bootstrap.Modal(
            $('#modalConfirmServicios').appendTo('body'),
            {
                backdrop: 'static',
                keyboard: false,
            }
        );

        if ($('body').find('.modalConfirmUbicacion').length > 1) {
            $('body').find('.modalConfirmUbicacion')[1].remove();
        }

        this.modales.modalConfirmUbicacion = new bootstrap.Modal(
            $('#modalConfirmUbicacion').appendTo('body'),
            {
                backdrop: 'static',
                keyboard: false,
            }
        );

        if ($('body').find('.modalAlertBorrado').length > 1) {
            $('body').find('.modalAlertBorrado')[1].remove();
        }

        this.modales.modalAlertBorrado = new bootstrap.Modal(
            $('#modalAlertBorrado').appendTo('body'),
            {
                backdrop: 'static',
                keyboard: false,
            }
        );

        if ($('body').find('.modalCargarFoto').length > 1) {
            $('body').find('.modalCargarFoto')[1].remove();
        }

        this.modales.modalCargarFoto = new bootstrap.Modal(
            $('#modalCargarFoto').appendTo('body'),
            {
                backdrop: 'static',
                keyboard: false,
            }
        );

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

        if ($('body').find('.establecerUbicacion').length > 1) {
            $('body').find('.establecerUbicacion')[1].remove();
        }

        this.modales.establecerUbicacion = new bootstrap.Modal(
            $('#establecerUbicacion').appendTo('body'),
            {
                backdrop: 'static',
                keyboard: false,
            }
        );
    }

    //Funcion para borrar la imagen del logo
    borrarImagenLogo() {
        this.sucursal.cargoLogo = true;
        $('#btnBorrarImagen').css('display', 'none');
        // (document.getElementById('txtImagen') as any)!.src =
        //     'assets/images/system/iconoCamara.png';
        (document.getElementById('filesLogo') as any)!.value = '';
        this.sucursal.imagenRecortada = '';
    }

    //Funcion para cargar la imagen del logo
    filesLogoOnchange(d: any) {
        let reader = new FileReader();
        let tipo = [];
        reader.onload = (e: any) => {
            let image: any = new Image();
            image.src = e.target.result;
            tipo = image.src.split(';');
            if (tipo[0].toLowerCase().indexOf('png') != -1 || tipo[0].toLowerCase().indexOf('jpg') != -1 || tipo[0].toLowerCase().indexOf('jpeg') != -1) {
                const canvas1 = document.getElementById('Canvas1');
                const context = (canvas1 as HTMLCanvasElement).getContext('2d');
                if (context) {
                    context.drawImage(image, 0, 0, 300, 300);
                }
                this.sucursal.logo = (document.getElementById('txtImagen') as any)!.src;
                this.sucursal.cargoLogo = true;
                $('#btnBorrarImagen').css('display', 'inline');
                this.validLogo = true;
                tipo = this.sucursal.logo.split(';');
                if (tipo[0].toLowerCase().indexOf('jpg') != -1) {
                    this.sucursal.tipoContenidoLogo = 'jpg';
                }
                if (tipo[0].toLowerCase().indexOf('jpeg') != -1) {
                    this.sucursal.tipoContenidoLogo = 'jpeg';
                }
                if (tipo[0].toLowerCase().indexOf('png') != -1) {
                    this.sucursal.tipoContenidoLogo = 'png';
                }
                (document.getElementById('filesLogo') as any)!.value = '';
                let c: any = document.getElementById('Canvas1');
                let ctx = c.getContext('2d');
                ctx.clearRect(0, 0, 300, 300);
                $('#btnBorrarImagen').css('display', 'inline');
                $('#txtImagen').removeClass('errorCampo');
                setTimeout(() => {
                    this.msgLogo = '';
                });
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
                    $('#btnRecortarLogo').css('display', 'inline');
                }, 500);
                this.modales.modalCargarImagen.show();
            } else {
                setTimeout(() => {
                    this.validLogo = false;
                    this.sucursal.logo = '';
                    this.msgLogo = 'Formato de archivo incorrecto';
                    (document.getElementById('filesLogo') as any)!.value = '';
                    (document.getElementById('txtImagen') as any)!.src =
                        '../../../../assets/images/migracion/Imagen-Foto-300x300.png';
                    $('#txtImagen').css('outline', '3px solid red');
                    $('#btnBorrarImagen').css('display', 'none');
                });
            }
        };
        reader.readAsDataURL(d.target.files[0]);
    }

    //Funcion para recortar imagen del logo
    recortarImagen() {
        this.imageCroppie.result({ type: 'base64' }).then((imagenCortada: string) => {
            let image = new Image();
            image.src = imagenCortada;
            image.onload = () => {
                const canvas = document.getElementById(
                    'Canvas1'
                ) as HTMLCanvasElement;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.clearRect(0, 0, 300, 300);
                    ctx.drawImage(image, 0, 0, 300, 300);
                }
                setTimeout(() => {
                    const canvas = document.getElementById(
                        'Canvas1'
                    ) as HTMLCanvasElement;
                    (document.getElementById('txtImagen') as any)!.src = '';
                    (document.getElementById('txtImagen') as any)!.src =
                        canvas.toDataURL('image/png');
                    this.sucursal.imagenRecortada = canvas.toDataURL('image/png');
                }, 500);
            };
        });
        $('#btnRecortarLogo').css('display', 'none');
        this.imageCroppie.destroy();
    }

    //Funcion para cerrar modal de recortado
    cancelarRecortadoImagen() {
        this.imageCroppie.destroy();
        this.guardarSinRecortar = false;
        $('#btnRecortarLogo').css('display', 'none');
    }

    //Funcion para borrar la imagen de la foto
    borrarImagenFoto(idImagen: any) {
        delete this.sucursal.foto[idImagen];
        this.sucursal.cargoFoto = true;
        this.sucursal.foto.splice(idImagen, 1);
        this.msgFoto = '';
        this.cargaFoto0 = true;
        this.cargaFoto1 = false;
        this.cargaFoto2 = false;
        this.cargaFoto3 = false;
        this.cargaFoto4 = false;
        for (let i = 0; i < this.numImagen; i++) {
            if (this.sucursal.foto[i] != undefined) {
                (document.getElementById('txtImagen' + i) as any)!.src = this.sucursal.foto[i];
            } else {
                (document.getElementById('txtImagen' + i) as any)!.src = '../../../../assets/images/migracion/Imagen-Foto-300x300.png';
                $('#btnBorrarImagen' + i).css('display', 'none');
            }
        }

        this.numImagen--;

        if (this.numImagen - 1 === 0) {
            this.cargaFoto0 = true;
            $('#liImagen0').addClass('active');
            $('#liImagen1').removeClass('active');
            $('#liImagen2').removeClass('active');
            $('#liImagen3').removeClass('active');
            $('#liImagen4').removeClass('active');

            $('#divImagen0').addClass('active');
            $('#divImagen1').removeClass('active');
            $('#divImagen2').removeClass('active');
            $('#divImagen3').removeClass('active');
            $('#divImagen4').removeClass('active');
        } else {
            for (let j = 0; j < this.numImagen; j++) {
                switch (j) {
                    case 1:
                        this.cargaFoto1 = true;
                        $('#liImagen1').addClass('active');
                        $('#liImagen0').removeClass('active');
                        $('#liImagen2').removeClass('active');
                        $('#liImagen3').removeClass('active');
                        $('#liImagen4').removeClass('active');
                        $('#divImagen1').addClass('active');
                        $('#divImagen0').removeClass('active');
                        $('#divImagen2').removeClass('active');
                        $('#divImagen3').removeClass('active');
                        $('#divImagen4').removeClass('active');
                        break;
                    case 2:
                        this.cargaFoto2 = true;
                        $('#liImagen2').addClass('active');
                        $('#liImagen1').removeClass('active');
                        $('#liImagen0').removeClass('active');
                        $('#liImagen3').removeClass('active');
                        $('#liImagen4').removeClass('active');
                        $('#divImagen2').addClass('active');
                        $('#divImagen1').removeClass('active');
                        $('#divImagen0').removeClass('active');
                        $('#divImagen3').removeClass('active');
                        $('#divImagen4').removeClass('active');
                        break;
                    case 3:
                        this.cargaFoto3 = true;
                        $('#liImagen3').addClass('active');
                        $('#liImagen1').removeClass('active');
                        $('#liImagen2').removeClass('active');
                        $('#liImagen0').removeClass('active');
                        $('#liImagen4').removeClass('active');
                        $('#divImagen3').addClass('active');
                        $('#divImagen1').removeClass('active');
                        $('#divImagen2').removeClass('active');
                        $('#divImagen0').removeClass('active');
                        $('#divImagen4').removeClass('active');
                        break;
                    case 4:
                        this.cargaFoto4 = true;
                        $('#liImagen4').addClass('active');
                        $('#liImagen1').removeClass('active');
                        $('#liImagen2').removeClass('active');
                        $('#liImagen3').removeClass('active');
                        $('#liImagen0').removeClass('active');
                        $('#divImagen4').addClass('active');
                        $('#divImagen1').removeClass('active');
                        $('#divImagen2').removeClass('active');
                        $('#divImagen3').removeClass('active');
                        $('#divImagen0').removeClass('active');
                        break;
                }
            }
        }
    }

    //Funcion para cargar la imagen de la foto
    filesFotoOnchange(d: any) {
        let reader = new FileReader();
        let tipo = [];
        reader.onload = (e: any) => {
            let image: any = new Image();
            image.src = e.target.result;
            tipo = image.src.split(';');
            if (tipo[0].toLowerCase().indexOf('png') != -1 || tipo[0].toLowerCase().indexOf('jpg') != -1 || tipo[0].toLowerCase().indexOf('jpeg') != -1) {
                const canvas1 = document.getElementById('Canvas1');
                const context = (canvas1 as HTMLCanvasElement).getContext('2d');
                if (context) {
                    context.drawImage(image, 0, 0, 300, 300);
                }
                let canvas = document.getElementById('Canvas1') as HTMLCanvasElement;
                //this.sucursal.foto[this.numImagen] = canvas.toDataURL('image/jpeg');
                const fotoTemp = canvas.toDataURL('image/jpeg');
                $('#btnBorrarImagen' + this.numImagen).css('display', 'inline');
                this.sucursal.cargoFoto = true;
                this.validFoto = true;
                tipo = fotoTemp.split(';');
                if (tipo[0].toLowerCase().indexOf('jpg') != -1) {
                    this.sucursal.tipoContenidoFoto[this.numImagen] = 'jpg';
                }
                if (tipo[0].toLowerCase().indexOf('jpeg') != -1) {
                    this.sucursal.tipoContenidoFoto[this.numImagen] = 'jpeg';
                }
                if (tipo[0].toLowerCase().indexOf('png') != -1) {
                    this.sucursal.tipoContenidoFoto[this.numImagen] = 'png';
                }
                (document.getElementById('filesFoto') as any).value = '';

                let c = document.getElementById('Canvas1') as HTMLCanvasElement;
                let ctx = c.getContext('2d');
                if (ctx) {
                    ctx.clearRect(0, 0, 300, 300);
                }

                setTimeout(() => {
                    this.fotoCroppie = new Croppie(
                        document.getElementById('cropFoto') as HTMLElement,
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
                    this.fotoCroppie.bind({
                        url: e.target.result,
                    });
                    $('#btnRecortarFoto').css('display', 'inline');
                }, 200);
                this.modales.modalCargarFoto.show();
                this.msgFoto = '';
            } else {
                setTimeout(() => {
                    this.validFoto = false;
                    this.msgFoto = 'Formato de archivo incorrecto';
                    (document.getElementById('filesFoto') as any).value = '';
                });
            }
        };
        reader.readAsDataURL(d.target.files[0]);
    }

    //Funcion para recortar imagen del logo
    recortarFoto() {
        this.fotoCroppie.result({ type: 'base64' }).then((fotoRecortada: any) => {
            let image = new Image();
            image.src = fotoRecortada;
            image.onload = () => {
                const canvas = document.getElementById('Canvas1') as HTMLCanvasElement;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.clearRect(0, 0, 300, 300);
                    ctx.drawImage(image, 0, 0, 300, 300);
                }
                switch (this.numImagen) {
                    case 0:
                        this.cargaFoto0 = true;
                        break;
                    case 1:
                        this.cargaFoto1 = true;
                        break;
                    case 2:
                        this.cargaFoto2 = true;
                        break;
                    case 3:
                        this.cargaFoto3 = true;
                        break;
                    case 4:
                        this.cargaFoto4 = true;
                        break;
                }
                setTimeout(() => {
                    const canvas = document.getElementById(
                        'Canvas1'
                    ) as HTMLCanvasElement;
                    (document.getElementById('txtImagen' + this.numImagen) as any).src =
                        canvas.toDataURL('image/jpeg');
                    this.sucursal.foto[this.numImagen] = canvas.toDataURL('image/jpeg');
                    this.numImagen++;
                }, 500);
            };
        });
        $('#btnRecortarFoto').css('display', 'none');
        this.fotoCroppie?.destroy();
    }

    //Funcion para cerrar modal de recortado
    cancelarRecortadoFotos() {
        //this.sucursal.foto.pop();
        this.sucursal.tipoContenidoFoto.pop();
        this.fotoCroppie?.destroy();
        $('#btnRecortarFoto').css('display', 'none');
    }

    //Funcion para cargar el ddl de categorias
    consultaCategoria(idSucursal?: any) {
        this._backService.HttpPost('catalogos/Sucursal/consultaCategoria', {}, {}).subscribe(
            (response: string) => {
                this.sucursal.dataCategorias = eval(response);
                let cont = 0;
                for (let j = 0; j < this.sucursal.dataCategorias.length; j++) {
                    if (
                        this.sucursal.dataCategorias[j].nombre
                            .toLowerCase()
                            .includes('otros') ||
                        this.sucursal.dataCategorias[j].nombre
                            .toLowerCase()
                            .includes('otro')
                    ) {
                        cont++;
                    }
                }
                let j = 0;
                for (let i = 0; i < this.sucursal.dataCategorias.length; i++) {
                    if (this.sucursal.dataCategorias[i].nombre.toLowerCase().includes('otros') || this.sucursal.dataCategorias[i].nombre.toLowerCase().includes('otro')) {
                        if (cont >= j) {
                            this.rowSelected = JSON.parse(
                                JSON.stringify(this.sucursal.dataCategorias[i])
                            );
                            this.sucursal.dataCategorias.splice(i, 1);
                            this.sucursal.dataCategorias.push(this.rowSelected);
                            j++;
                            i--;
                        }
                    }
                }
                if (idSucursal != undefined) {
                    this.cargarSucursalCategorias(idSucursal);
                } else if (this.accion === 'Actualizar') {
                    this.cargarSucursalCategorias();
                } else if (this.accion === 'Nuevo') {
                    this.hora = [];
                    const horaInicio = moment().startOf('day');
                    const horaFin = moment().endOf('day');
                    for (horaInicio; horaInicio < horaFin; horaInicio.add('m', 15)) {
                        this.hora.push(horaInicio.format('HH:mm'));
                    }
                    this.hora.push(moment().hour(23).minute(59).format('HH:mm'));
                }
            },
            (error) => {
                if (error === 'SinSesion' || error === 'SesionCaducada') {
                    if (error === 'SinSesion') {
                        this._toaster.error(this.sessionTraslate.favorIniciarSesion);
                    }
                    if (error === 'SesionCaducada') {
                        this._toaster.error(this.sessionTraslate.sesionCaducada);
                    }
                    this._pantallaServicio.ocultarSpinner();
                    this._router.navigate(['/login']);
                }
            }
        );
    }

    //Carga las subcategorias de la sucursal
    cargarSucursalSubcategorias(idSucursal: any) {
        this.sucursal.subcategoria = undefined;
        this.sucursal.subcategoriaSelected = [];
        this.sucursal.sucursalSubcategoria = [];
        this.sucursal.subcategoriasSeleccionadas = [];
        let params: any = {};
        if (idSucursal === undefined) {
            params.idSucursal = this.sucursal.idSucursal;
        } else {
            params.idSucursal = idSucursal;
        }
        this._backService.HttpPost('catalogos/Sucursal/cargarSucursalSubcategorias', {}, params).subscribe(
            (response: string) => {
                this.sucursal.dataSucursalSubcategoria = eval(response);
                this.sucursal.dataSucursalSubcategoria =
                    this.sucursal.dataSucursalSubcategoria.sort();
                for (
                    let j = 0;
                    j < this.sucursal.dataSucursalSubcategoria.length;
                    j++
                ) {
                    this.sucursal.subcategoriaSelected[j] =
                        this.sucursal.dataSucursalSubcategoria[j].idSubcategoria;
                    this.sucursal.sucursalSubcategoria[j] =
                        this.sucursal.dataSucursalSubcategoria[j].idSucursalSubcategoria;
                }
                if (this.cont === 1) {
                    this.cont++;
                    this.sucursal.subcategoriasSucursal1 = JSON.parse(
                        JSON.stringify(this.sucursal.subcategoriaSelected.slice())
                    );
                }
                this.sucursal.subcategoria =
                    this.sucursal.subcategoriaSelected.slice();
                this.sucursal.subcategoriasSeleccionadas = JSON.parse(
                    JSON.stringify(this.sucursal.subcategoria)
                );
                if (this.accion === 'Actualizar') {
                    this.cargarSucursalHorariosLaborales(idSucursal);
                    $('#img' + this.sucursal.idSucursal).addClass('imgActive');
                    $('#lbl' + this.sucursal.idSucursal).addClass('lblActive');
                    $('#loading-spinner').hide();
                    $('#blockScreen').hide();
                    this._pantallaServicio.ocultarSpinner();
                    if (this.cargarDatosGenerales) {
                        this.cargarDatosGenerales = false;
                        $('#datosGenerales').show();
                        $('#btnGuardar').show();
                    }
                } else {
                    if (this.cargarDatosGenerales) {
                        this.cargarDatosGenerales = false;
                        $('#datosGenerales').show();
                        $('#btnGuardar').show();
                    }
                }
            },
            (error) => {
                if (error === 'SinSesion' || error === 'SesionCaducada') {
                    if (error === 'SinSesion') {
                        this._toaster.error(this.sessionTraslate.favorIniciarSesion);
                    }
                    if (error === 'SesionCaducada') {
                        this._toaster.error(this.sessionTraslate.sesionCaducada);
                    }
                    this._pantallaServicio.ocultarSpinner();
                    this._router.navigate(['/login']);
                }
            }
        );
    }

    //Funcion para cargar el ddl con las subcategorias de las categorias seleccionadas
    cargarSubcategoriasPorCategorias(idSucursal: any) {
        this.sucursal.dataSubcategoriasEscogidas = [];
        this._backService.HttpPost('catalogos/Sucursal/consultaSubcategoria', {}, {}).subscribe(
            (response: string) => {
                this.sucursal.dataSubcategorias = eval(response);
                for (let i = 0; i < this.sucursal.dataSubcategorias.length; i++) {
                    for (let j = 0; j < this.sucursal.categorias.length; j++) {
                        if (
                            this.sucursal.dataSubcategorias[i].idCategoria ===
                            this.sucursal.categorias[j]
                        ) {
                            this.sucursal.dataSubcategoriasEscogidas.push(
                                this.sucursal.dataSubcategorias[i]
                            );
                        }
                    }
                }
                this.sucursal.dataSubcategorias =
                    this.sucursal.dataSubcategoriasEscogidas;
                this.sucursal.dataSubcategorias =
                    this.sucursal.dataSubcategorias.sort(this.dynamicSort('nombre'));
                let cont = 0;
                for (let j = 0; j < this.sucursal.dataSubcategorias.length; j++) {
                    if (
                        this.sucursal.dataSubcategorias[j].nombre
                            .toLowerCase()
                            .includes('otros') ||
                        this.sucursal.dataSubcategorias[j].nombre
                            .toLowerCase()
                            .includes('otro')
                    ) {
                        cont++;
                    }
                }
                let j = 0;
                for (let i = 0; i < this.sucursal.dataSubcategorias.length; i++) {
                    if (
                        this.sucursal.dataSubcategorias[i].nombre
                            .toLowerCase()
                            .includes('otros') ||
                        this.sucursal.dataSubcategorias[i].nombre
                            .toLowerCase()
                            .includes('otro')
                    ) {
                        if (cont >= j) {
                            this.rowSelected = JSON.parse(
                                JSON.stringify(this.sucursal.dataSubcategorias[i])
                            );
                            this.sucursal.dataSubcategorias.splice(i, 1);
                            this.sucursal.dataSubcategorias.push(this.rowSelected);
                            j++;
                            i--;
                        }
                    }
                }
                this.cargarSucursalSubcategorias(idSucursal);
            },
            (error) => {
                if (error === 'SinSesion' || error === 'SesionCaducada') {
                    if (error === 'SinSesion') {
                        this._toaster.error(this.sessionTraslate.favorIniciarSesion);
                    }
                    if (error === 'SesionCaducada') {
                        this._toaster.error(this.sessionTraslate.sesionCaducada);
                    }
                    this._pantallaServicio.ocultarSpinner();
                    this._router.navigate(['/login']);
                }
            }
        );
    }

    //Carga las categorias de las sucursal
    cargarSucursalCategorias(idSucursal?: any) {
        this.sucursal.categorias = undefined;
        this.sucursal.sucursalCategorias = [];
        this.sucursal.categoriasSelected = [];
        this.sucursal.categoriasSeleccionadas = [];
        let params: any = {};
        if (idSucursal === undefined) {
            params.idSucursal = this.sucursal.idSucursal;
        } else {
            params.idSucursal = idSucursal;
        }
        this._backService.HttpPost('catalogos/Sucursal/cargarSucursalCategorias', {}, params).subscribe(
            (response: string) => {
                this.sucursal.dataSucursalCategoria = eval(response);
                for (let i = 0; i < this.sucursal.dataSucursalCategoria.length; i++) {
                    for (let j = 0; j < this.sucursal.dataCategorias.length; j++) {
                        if (
                            this.sucursal.dataSucursalCategoria[i].idCategoria ===
                            this.sucursal.dataCategorias[j].idCategoria
                        ) {
                            this.sucursal.categoriasSelected[i] =
                                this.sucursal.dataCategorias[j].idCategoria;
                            this.sucursal.sucursalCategorias[i] =
                                this.sucursal.dataSucursalCategoria[i].idSucursalCategoria;
                            break;
                        }
                    }
                }
                this.sucursal.categorias = this.sucursal.categoriasSelected;
                this.sucursal.categoriasSeleccionadas = JSON.parse(
                    JSON.stringify(this.sucursal.categorias)
                );
                this.cargarSubcategoriasPorCategorias(idSucursal);
            },
            (error) => {
                if (error === 'SinSesion' || error === 'SesionCaducada') {
                    if (error === 'SinSesion') {
                        this._toaster.error(this.sessionTraslate.favorIniciarSesion);
                    }
                    if (error === 'SesionCaducada') {
                        this._toaster.error(this.sessionTraslate.sesionCaducada);
                    }
                    this._pantallaServicio.ocultarSpinner();
                    this._router.navigate(['/login']);
                }
            }
        );
    }

    //Funcion para cargar los horarios laborales de la sucursal
    cargarSucursalHorariosLaborales(idSucursal: any) {
        let params: any = {};
        params.idSucursal = this.sucursal.idSucursal;
        this._backService.HttpPost('catalogos/Sucursal/cargarSucursalHorariosLaborales', {}, params).subscribe(
            (response: string) => {
                this.sucursal.dataHorariosLaborales = eval(response);
                this.sucursal.dataHorariosLaboralesCopy = JSON.parse(
                    JSON.stringify(this.sucursal.dataHorariosLaborales)
                );
                this.cargarSucursalHorariosDescansos(idSucursal);
                for (let i = 0; i < this.sucursal.dataHorariosLaborales.length; i++) {
                    let horaInicio = this.sucursal.dataHorariosLaborales[i].horaInicio;
                    let minutosInicio =
                        this.sucursal.dataHorariosLaborales[i].minutosInicio;
                    let horaFin = this.sucursal.dataHorariosLaborales[i].horaFin;
                    let minutosFin = this.sucursal.dataHorariosLaborales[i].minutosFin;
                    switch (this.sucursal.dataHorariosLaborales[i].dia) {
                        case 1:
                            this.sucursal.lunes = this.sucursal.dataHorariosLaborales[i].esLaboral;
                            this.sucursal.horaInicioLunes = moment(new Date(0, 0, 0, horaInicio, minutosInicio, 0, 0)).format('HH:mm');
                            this.sucursal.horaFinLunes = moment(new Date(0, 0, 0, horaFin, minutosFin, 0, 0)).format('HH:mm');
                            this.sucursal.horaIniLu = JSON.parse(JSON.stringify(this.sucursal.horaInicioLunes));
                            this.sucursal.horaFiLu = JSON.parse(JSON.stringify(this.sucursal.horaFinLunes));
                            break;
                        case 2:
                            this.sucursal.martes =
                                this.sucursal.dataHorariosLaborales[i].esLaboral;
                            this.sucursal.horaInicioMartes = moment(
                                new Date(0, 0, 0, horaInicio, minutosInicio, 0, 0)
                            ).format('HH:mm');
                            this.sucursal.horaFinMartes = moment(
                                new Date(0, 0, 0, horaFin, minutosFin, 0, 0)
                            ).format('HH:mm');
                            this.sucursal.horaIniMa = JSON.parse(
                                JSON.stringify(this.sucursal.horaInicioMartes)
                            );
                            this.sucursal.horaFiMa = JSON.parse(
                                JSON.stringify(this.sucursal.horaFinMartes)
                            );
                            break;
                        case 3:
                            this.sucursal.miercoles =
                                this.sucursal.dataHorariosLaborales[i].esLaboral;
                            this.sucursal.horaInicioMiercoles = moment(
                                new Date(0, 0, 0, horaInicio, minutosInicio, 0, 0)
                            ).format('HH:mm');
                            this.sucursal.horaFinMiercoles = moment(
                                new Date(0, 0, 0, horaFin, minutosFin, 0, 0)
                            ).format('HH:mm');
                            this.sucursal.horaIniMi = JSON.parse(
                                JSON.stringify(this.sucursal.horaInicioMiercoles)
                            );
                            this.sucursal.horaFiMi = JSON.parse(
                                JSON.stringify(this.sucursal.horaFinMiercoles)
                            );
                            break;
                        case 4:
                            this.sucursal.jueves =
                                this.sucursal.dataHorariosLaborales[i].esLaboral;
                            this.sucursal.horaInicioJueves = moment(
                                new Date(0, 0, 0, horaInicio, minutosInicio, 0, 0)
                            ).format('HH:mm');
                            this.sucursal.horaFinJueves = moment(
                                new Date(0, 0, 0, horaFin, minutosFin, 0, 0)
                            ).format('HH:mm');
                            this.sucursal.horaIniJu = JSON.parse(
                                JSON.stringify(this.sucursal.horaInicioJueves)
                            );
                            this.sucursal.horaFiJu = JSON.parse(
                                JSON.stringify(this.sucursal.horaFinJueves)
                            );
                            break;
                        case 5:
                            this.sucursal.viernes =
                                this.sucursal.dataHorariosLaborales[i].esLaboral;
                            this.sucursal.horaInicioViernes = moment(
                                new Date(0, 0, 0, horaInicio, minutosInicio, 0, 0)
                            ).format('HH:mm');
                            this.sucursal.horaFinViernes = moment(
                                new Date(0, 0, 0, horaFin, minutosFin, 0, 0)
                            ).format('HH:mm');
                            this.sucursal.horaIniVi = JSON.parse(
                                JSON.stringify(this.sucursal.horaInicioViernes)
                            );
                            this.sucursal.horaFiVi = JSON.parse(
                                JSON.stringify(this.sucursal.horaFinViernes)
                            );
                            break;
                        case 6:
                            this.sucursal.sabado =
                                this.sucursal.dataHorariosLaborales[i].esLaboral;
                            this.sucursal.horaInicioSabado = moment(
                                new Date(0, 0, 0, horaInicio, minutosInicio, 0, 0)
                            ).format('HH:mm');
                            this.sucursal.horaFinSabado = moment(
                                new Date(0, 0, 0, horaFin, minutosFin, 0, 0)
                            ).format('HH:mm');
                            this.sucursal.horaIniSa = JSON.parse(
                                JSON.stringify(this.sucursal.horaInicioSabado)
                            );
                            this.sucursal.horaFiSa = JSON.parse(
                                JSON.stringify(this.sucursal.horaFinSabado)
                            );
                            break;
                        case 7:
                            this.sucursal.domingo =
                                this.sucursal.dataHorariosLaborales[i].esLaboral;
                            this.sucursal.horaInicioDomingo = moment(
                                new Date(0, 0, 0, horaInicio, minutosInicio, 0, 0)
                            ).format('HH:mm');
                            this.sucursal.horaFinDomingo = moment(
                                new Date(0, 0, 0, horaFin, minutosFin, 0, 0)
                            ).format('HH:mm');
                            this.sucursal.horaIniDo = JSON.parse(
                                JSON.stringify(this.sucursal.horaInicioDomingo)
                            );
                            this.sucursal.horaFiDo = JSON.parse(
                                JSON.stringify(this.sucursal.horaFinDomingo)
                            );
                            break;
                    }
                }
            },
            (error) => {
                if (error === 'SinSesion' || error === 'SesionCaducada') {
                    if (error === 'SinSesion') {
                        this._toaster.error(this.sessionTraslate.favorIniciarSesion);
                    }
                    if (error === 'SesionCaducada') {
                        this._toaster.error(this.sessionTraslate.sesionCaducada);
                    }
                    this._pantallaServicio.ocultarSpinner();
                    this._router.navigate(['/login']);
                }
            }
        );
    }

    //Funcion para cargar los descansos de la sucursal
    cargarSucursalHorariosDescansos(idSucursal: any) {
        let params: any = {};
        params.idSucursal = this.sucursal.idSucursal;
        this._backService
            .HttpPost(
                'catalogos/Sucursal/cargarSucursalHorariosDescansos',
                {},
                params
            )
            .subscribe(
                (response: string) => {
                    this.sucursal.dataHorariosDescansos = eval(response);
                    this.consultaPaises();
                    this.consultaEstados();
                    //this.consultaCiudadesEnEstado();
                    for (let i = 0; i < this.sucursal.dataHorariosDescansos.length; i++) {
                        let horaInicio = this.sucursal.dataHorariosDescansos[i].horaInicio;
                        let minutosInicio =
                            this.sucursal.dataHorariosDescansos[i].minutosInicio;
                        let horaFin = this.sucursal.dataHorariosDescansos[i].horaFin;
                        let minutosFin = this.sucursal.dataHorariosDescansos[i].minutosFin;
                        switch (this.sucursal.dataHorariosDescansos[i].dia) {
                            case 1:
                                this.sucursal.contadorLunes++;
                                this.sucursal.objetoLunes.push({
                                    horaInicio: moment(
                                        new Date(0, 0, 0, horaInicio, minutosInicio, 0, 0)
                                    ).format('HH:mm'),
                                    horaFin: moment(
                                        new Date(0, 0, 0, horaFin, minutosFin, 0, 0)
                                    ).format('HH:mm'),
                                });
                                break;
                            case 2:
                                this.sucursal.contadorMartes++;
                                this.sucursal.objetoMartes.push({
                                    horaInicio: moment(
                                        new Date(0, 0, 0, horaInicio, minutosInicio, 0, 0)
                                    ).format('HH:mm'),
                                    horaFin: moment(
                                        new Date(0, 0, 0, horaFin, minutosFin, 0, 0)
                                    ).format('HH:mm'),
                                });
                                break;
                            case 3:
                                this.sucursal.contadorMiercoles++;
                                this.sucursal.objetoMiercoles.push({
                                    horaInicio: moment(
                                        new Date(0, 0, 0, horaInicio, minutosInicio, 0, 0)
                                    ).format('HH:mm'),
                                    horaFin: moment(
                                        new Date(0, 0, 0, horaFin, minutosFin, 0, 0)
                                    ).format('HH:mm'),
                                });
                                break;
                            case 4:
                                this.sucursal.contadorJueves++;
                                this.sucursal.objetoJueves.push({
                                    horaInicio: moment(
                                        new Date(0, 0, 0, horaInicio, minutosInicio, 0, 0)
                                    ).format('HH:mm'),
                                    horaFin: moment(
                                        new Date(0, 0, 0, horaFin, minutosFin, 0, 0)
                                    ).format('HH:mm'),
                                });
                                break;
                            case 5:
                                this.sucursal.contadorViernes++;
                                this.sucursal.objetoViernes.push({
                                    horaInicio: moment(
                                        new Date(0, 0, 0, horaInicio, minutosInicio, 0, 0)
                                    ).format('HH:mm'),
                                    horaFin: moment(
                                        new Date(0, 0, 0, horaFin, minutosFin, 0, 0)
                                    ).format('HH:mm'),
                                });
                                break;
                            case 6:
                                this.sucursal.contadorSabado++;
                                this.sucursal.objetoSabado.push({
                                    horaInicio: moment(
                                        new Date(0, 0, 0, horaInicio, minutosInicio, 0, 0)
                                    ).format('HH:mm'),
                                    horaFin: moment(
                                        new Date(0, 0, 0, horaFin, minutosFin, 0, 0)
                                    ).format('HH:mm'),
                                });
                                break;
                            case 7:
                                this.sucursal.contadorDomingo++;
                                this.sucursal.objetoDomingo.push({
                                    horaInicio: moment(
                                        new Date(0, 0, 0, horaInicio, minutosInicio, 0, 0)
                                    ).format('HH:mm'),
                                    horaFin: moment(
                                        new Date(0, 0, 0, horaFin, minutosFin, 0, 0)
                                    ).format('HH:mm'),
                                });
                                break;
                        }
                    }
                    this.sucursal.objetoLu = JSON.parse(
                        JSON.stringify(this.sucursal.objetoLunes)
                    );
                    this.sucursal.objetoMa = JSON.parse(
                        JSON.stringify(this.sucursal.objetoMartes)
                    );
                    this.sucursal.objetoMi = JSON.parse(
                        JSON.stringify(this.sucursal.objetoMiercoles)
                    );
                    this.sucursal.objetoJu = JSON.parse(
                        JSON.stringify(this.sucursal.objetoJueves)
                    );
                    this.sucursal.objetoVi = JSON.parse(
                        JSON.stringify(this.sucursal.objetoViernes)
                    );
                    this.sucursal.objetoSa = JSON.parse(
                        JSON.stringify(this.sucursal.objetoSabado)
                    );
                    this.sucursal.objetoDo = JSON.parse(
                        JSON.stringify(this.sucursal.objetoDomingo)
                    );
                    this.validarDescansosConsulta();
                    setTimeout(function () {
                        $('#divSucursales').css('pointer-events', 'visible');
                    }, 1000);
                    $('#btnNuevo').css('pointer-events', 'visible');
                    $('#btnDescartar').css('pointer-events', 'visible');
                    this.consultarFotosSucursal(idSucursal);
                },
                (error) => {
                    $('#loading-spinner').hide();
                    $('#blockScreen').hide();
                    this._pantallaServicio.ocultarSpinner();
                    if (this.cargarDatosGenerales) {
                        this.cargarDatosGenerales = false;
                        $('#datosGenerales').show();
                        $('#btnGuardar').show();
                    }

                    if (error === 'SinSesion' || error === 'SesionCaducada') {
                        if (error === 'SinSesion') {
                            this._toaster.error(this.sessionTraslate.favorIniciarSesion);
                        }
                        if (error === 'SesionCaducada') {
                            this._toaster.error(this.sessionTraslate.sesionCaducada);
                        }
                        this._pantallaServicio.ocultarSpinner();
                        this._router.navigate(['/login']);
                    }
                }
            );
    }

    //Funcion para cargar las fotos de la sucursal
    cargarSucursalImagen() {
        let params: any = {};
        params.idSucursal = this.sucursal.idSucursal;
        this._backService
            .HttpPost('catalogos/Sucursal/cargarSucursalImagen', {}, params)
            .subscribe(
                (response: string) => {
                    this.sucursal.dataFoto = eval(response);
                    if (this.sucursal.dataFoto.length > 0) {
                        for (let i = 0; i < this.sucursal.dataFoto.length; i++) {
                            this.sucursal.idImagenes[i] = this.sucursal.dataFoto[i].idImagen;
                            this.sucursal.foto[i] = this.sucursal.dataFoto[i].codigo;
                            this.sucursal.tipoContenidoFoto[i] =
                                this.sucursal.dataFoto[i].tipoContenido;
                            this.sucursal.cargoFoto = false;
                            $('#btnBorrarImagen' + i).css('display', 'inline');
                            switch (i) {
                                case 0:
                                    this.cargaFoto0 = true;
                                    break;
                                case 1:
                                    this.cargaFoto1 = true;
                                    break;
                                case 2:
                                    this.cargaFoto2 = true;
                                    break;
                                case 3:
                                    this.cargaFoto3 = true;
                                    break;
                                case 4:
                                    this.cargaFoto4 = true;
                                    break;
                            }
                            this.numImagen = this.sucursal.dataFoto.length;
                        }
                    } else {
                        for (let i = 0; i < 5; i++) {
                            if (document.getElementById('txtImagen' + i))
                                (document.getElementById('txtImagen' + i) as any)!.src =
                                    '../../../../assets/images/migracion/Imagen-Foto-300x300.png';
                            this.sucursal.foto[i] = null;
                            $('#btnBorrarImagen' + i).css('display', 'none');
                        }
                        this.numImagen = this.sucursal.dataFoto.length;
                    }
                    this.sucursal.fotosCargadas = JSON.parse(
                        JSON.stringify(this.sucursal.foto)
                    );
                    this.cargarLogo();
                },
                (error) => {
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

    //Funcion para cargar el logo de la sucursal
    cargarLogo(idLogo?: any) {
        if (this.sucursal.idLogo != null || idLogo != undefined) {
            let params: any = {};
            if (idLogo === undefined) {
                params.idImagen = this.sucursal.idLogo;
            } else {
                params.idImagen = idLogo;
            }
            this._backService
                .HttpPost('catalogos/Imagen/cargarImagen', {}, params)
                .subscribe(
                    (response: string) => {
                        this.sucursal.dataLogo = eval(response);
                        this.sucursal.imagenRecortada = this.sucursal.dataLogo[0].codigo;
                        this.sucursal.logoCargado = JSON.parse(
                            JSON.stringify(this.sucursal.imagenRecortada)
                        );
                        this.sucursal.tipoContenidoLogo =
                            this.sucursal.dataLogo[0].tipoContenido;
                        if (this.sucursal.imagenRecortada != null) {
                            $('#btnBorrarImagen').css('display', 'inline');
                        }
                        this.sucursal.cargoLogo = false;
                        $('#btnGuardar').css('pointer-events', 'visible');
                        $('#btnGuardar').removeClass('loading');
                        this.hora = [];
                        let horaInicio = moment().startOf('day');
                        let horaFin = moment().endOf('day');
                        for (horaInicio; horaInicio < horaFin; horaInicio.add('m', 15)) {
                            this.hora.push(horaInicio.format('HH:mm'));
                        }
                        this.hora.push(moment().hour(23).minute(59).format('HH:mm'));
                    },
                    (error) => {
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
            $('#btnGuardar').css('pointer-events', 'visible');
            $('#btnGuardar').removeClass('loading');
            this.hora = [];
            let horaInicio = moment().startOf('day');
            let horaFin = moment().endOf('day');
            for (horaInicio; horaInicio < horaFin; horaInicio.add('m', 15)) {
                this.hora.push(horaInicio.format('HH:mm'));
            }
            this.hora.push(moment().hour(23).minute(59).format('HH:mm'));
        }
    }

    //Funcion para quitar disableds de los switch
    quitarDisabled() {
        if (this.consulta) {
            for (let i = 0; i < 8; i++) {
                $('#SwDia' + i).addClass('onoffswitch-inner-disable');
            }
        }
    }

    //Inicializa los campos con los valores de que se cargaron
    inicializarValores() {
        this.sucursal.markersArray = [];
        this.establecida = true;
        this.consulta = false;
        this.sucursal.dataCategorias = [];
        this.sucursal.dataSubcategorias = [];
        this.guardar = false;
        this.sucursal.tipoContenidoLogo = '';
        this.guardarDescansos = false;
        this.categoriaSelccionada = false;
        this.sucursal.nombre = '';
        this.sucursal.email = '';
        this.sucursal.telefono = '';
        this.sucursal.telefono2 = '';
        this.sucursal.idioma = '';
        this.sucursal.categorias = '';
        this.sucursal.subcategoria = '';
        this.sucursal.foto = [];
        this.sucursal.logo = '';
        this.sucursal.imagenRecortada = '';
        this.sucursal.calle = '';
        this.sucursal.entreCalles = '';
        this.sucursal.numero = '';
        this.sucursal.numeroInterior = '';
        this.sucursal.colonia = '';
        this.sucursal.codigoPostal = '';
        this.sucursal.pais = '';
        this.sucursal.estado = '';
        this.sucursal.ciudad = '';
        this.sucursal.paginaWeb = '';
        this.sucursal.facebook = '';
        this.sucursal.twitter = '';
        this.sucursal.instagram = '';
        this.msgFoto = '';
        this.msgLogo = '';
        this.validFoto = true;
        this.validLogo = true;
        this.sucursal.fotoCargada = '';
        this.sucursal.logoCargado = '';
        this.sucursal.direccion = '';
        this.numImagen = 0;
        this.sucursal.idLogo = null;
        this.accion = 'Actualizar';
        this.rootScope_accionSucursal = 'Actualizar';
        this.stopChange = false;
        this.agenda = '';
        this.sucursal.contadorLunes = 0;
        this.sucursal.contadorMartes = 0;
        this.sucursal.contadorMiercoles = 0;
        this.sucursal.contadorJueves = 0;
        this.sucursal.contadorViernes = 0;
        this.sucursal.contadorSabado = 0;
        this.sucursal.contadorDomingo = 0;
        this.sucursal.objetoLunes = [];
        this.sucursal.objetoMartes = [];
        this.sucursal.objetoMiercoles = [];
        this.sucursal.objetoJueves = [];
        this.sucursal.objetoViernes = [];
        this.sucursal.objetoSabado = [];
        this.sucursal.objetoDomingo = [];
        this.sucursal.objetoLu = [];
        this.sucursal.objetoMa = [];
        this.sucursal.objetoMi = [];
        this.sucursal.objetoJu = [];
        this.sucursal.objetoVi = [];
        this.sucursal.objetoSa = [];
        this.sucursal.objetoDo = [];
        this.msgLunesDescansos = [];
        this.msgMartesDescansos = [];
        this.msgMiercolesDescansos = [];
        this.msgJuevesDescansos = [];
        this.msgViernesDescansos = [];
        this.msgSabadoDescansos = [];
        this.msgDomingoDescansos = [];
        this.sucursal.cargoLogo = false;
        this.sucursal.cargoFoto = false;
        this.validContadorLunes = true;
        this.validContadorMartes = true;
        this.validContadorMiercoles = true;
        this.validContadorJueves = true;
        this.validContadorViernes = true;
        this.validContadorSabado = true;
        this.validContadorDomingo = true;
        this.sucursal.validDescansosEnLunes = [];
        this.sucursal.validDescansosEnMartes = [];
        this.sucursal.validDescansosEnMiercoles = [];
        this.sucursal.validDescansosEnJueves = [];
        this.sucursal.validDescansosEnViernes = [];
        this.sucursal.validDescansosEnSabado = [];
        this.sucursal.validDescansosEnDomingo = [];
        this.sucursal.validRangosDescansosLunes = [];
        this.sucursal.validRangosDescansosMartes = [];
        this.sucursal.validRangosDescansosMiercoles = [];
        this.sucursal.validRangosDescansosJueves = [];
        this.sucursal.validRangosDescansosViernes = [];
        this.sucursal.validRangosDescansosSabado = [];
        this.sucursal.validRangosDescansosDomingo = [];
        this.validEmpalmeLunes = [];
        this.validEmpalmeMartes = [];
        this.validEmpalmeMiercoles = [];
        this.validEmpalmeJueves = [];
        this.validEmpalmeViernes = [];
        this.validEmpalmeSabado = [];
        this.validEmpalmeDomingo = [];
        this.cargaFoto = [];
        this.cargaFoto0 = true;
        this.cargaFoto1 = false;
        this.cargaFoto2 = false;
        this.cargaFoto3 = false;
        this.cargaFoto4 = false;
        this.numImagen = 0;
        this.sucursal.tipoContenidoFoto = [];
        this.validarPrimeraCargaHorarios = false;
        this.sucursal.fotosAgregadas = [];
        this.sucursal.fotosCargadas = [];
        this.sucursal.idImagenes = [];
        this.descansosConsulta = false;
        this.validDescartar = false;
        if (document.getElementById('txtImagen'))
            (document.getElementById('txtImagen') as any)!.src =
                '../../../../assets/images/migracion/Imagen-Foto-300x300.png';
        $('#btnBorrarImagen').css('display', 'none');
        if (this.sucursal.dataSucursal.length > 0) {
            this.sucursal.nombre = this.sucursal.dataSucursal[0].nombre;
            this.sucursal.email = this.sucursal.dataSucursal[0].email;
            this.sucursal.telefono = this.sucursal.dataSucursal[0].telefono;
            if (this.sucursal.dataSucursal[0].telefono2 != null) {
                this.sucursal.telefono2 = this.sucursal.dataSucursal[0].telefono2;
            } else {
                this.sucursal.dataSucursal[0].telefono2 = '';
            }
            this.sucursal.codigoSucursal =
                this.sucursal.dataSucursal[0].codigoSucursal;
            this.sucursal.idioma = this.sucursal.dataSucursal[0].idIdioma;
            this.sucursal.idFoto = this.sucursal.dataSucursal[0].foto;
            this.sucursal.idLogo = this.sucursal.dataSucursal[0].logo;
            this.sucursal.calle = this.sucursal.dataSucursal[0].calle;
            this.sucursal.entreCalles = this.sucursal.dataSucursal[0].entreCalles;
            this.sucursal.numero = this.sucursal.dataSucursal[0].numero;
            this.sucursal.numeroInterior =
                this.sucursal.dataSucursal[0].numeroInterior;
            this.sucursal.colonia = this.sucursal.dataSucursal[0].colonia;
            this.sucursal.codigoPostal = this.sucursal.dataSucursal[0].codigoPostal;
            this.sucursal.pais = this.sucursal.dataSucursal[0].idPais;
            this.sucursal.estado = this.sucursal.dataSucursal[0].idEstado;
            this.sucursal.ciudad = this.sucursal.dataSucursal[0].idCiudad;
            this.sucursal.paginaWeb = this.sucursal.dataSucursal[0].paginaWeb;
            this.sucursal.facebook = this.sucursal.dataSucursal[0].facebook;
            this.sucursal.twitter = this.sucursal.dataSucursal[0].twitter;
            this.sucursal.instagram = this.sucursal.dataSucursal[0].instagram;
            this.sucursal.lat = this.sucursal.dataSucursal[0].latitud;
            this.sucursal.lon = this.sucursal.dataSucursal[0].longitud;
            this.sucursal.estaActiva =
                Number(this.sucursal.dataSucursal[0].estaActiva || '0') > 0;
        }
        this.quitarDisabled();
        this.consultaCategoria();
    }

    //Carga los datos de la sucursal para actualizarlos o consultarlos
    cargarSucursal(idSucursal?: any, esNuevo?: any) {
        $('#blockScreen').show();
        this._pantallaServicio.mostrarSpinner();
        if (this._pantallaServicio.esGerenteGeneral) {
            if (
                this.sucursal.dataSucursales.length >=
                this._pantallaServicio.empresaPremium_configuracion.cantidadSucursales
            ) {
                $('#btnNuevo').css('display', 'none');
                this.nueva_sucursal = false;
            } else {
                $('#btnNuevo').css('display', 'inline');
                this.nueva_sucursal = true;
            }
        }
        this.sucursal.idSucursal = parseInt(idSucursal, 10);
        let params: any = {};
        params.idSucursal = parseInt(idSucursal, 10);
        this._backService
            .HttpPost('catalogos/Sucursal/cargarSucursal', {}, params)
            .subscribe(
                (response: string) => {
                    this.sucursal.dataSucursal = eval(response);
                    if (esNuevo != undefined) {
                        if (document.getElementById('img' + idSucursal))
                            (document.getElementById('img' + idSucursal) as any)!.src = !this
                                .guardarSinRecortar
                                ? this.sucursal.imagenRecortada !== ''
                                    ? this.sucursal.imagenRecortada
                                    : '../../../../assets/images/system/logoSucursal.png'
                                : this.sucursal.imagenSinRecortar !== ''
                                    ? this.sucursal.imagenSinRecortar
                                    : '../../../../assets/images/system/logoSucursal.png';
                    }
                    this.inicializarValores();
                    this.limpiarValidaciones();
                    this._pantallaServicio.ocultarSpinner();
                },
                (error) => {
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

    //Carga el ddl de idiomas
    consultaIdioma() {
        this._backService
            .HttpPost('catalogos/Idioma/consultaIdioma', {}, {})
            .subscribe(
                (response: string) => {
                    this.sucursal.dataIdiomas = eval(response);
                },
                (error) => {
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

    //Valida la consulta de los descansos
    validarDescansosConsulta() {
        if (
            this.sucursal.contadorLunes > 0 ||
            this.sucursal.contadorMartes > 0 ||
            this.sucursal.contadorMiercoles > 0 ||
            this.sucursal.contadorJueves > 0 ||
            this.sucursal.contadorViernes > 0 ||
            this.sucursal.contadorSabado > 0 ||
            this.sucursal.contadorDomingo > 0
        ) {
            this.descansosConsulta = false;
        } else {
            this.descansosConsulta = true;
        }
    }

    consultarFotosSucursal(idSucursal: any) {
        let params: any = {};
        params.idSucursales = this.idSucursales;
        this._backService
            .HttpPost('catalogos/Sucursal/consultarFotosSucursal', {}, params)
            .subscribe(
                (response: string) => {
                    this.sucursal.dataFotosSucursales = eval(response);
                    for (let i = 0; i < this.sucursal.dataFotosSucursales.length; i++) {
                        for (let j = 0; j < this.sucursal.dataSucursales.length; j++) {
                            if (
                                this.sucursal.dataFotosSucursales[i].idImagen ===
                                this.sucursal.dataSucursales[j].logo
                            ) {
                                this.sucursal.dataSucursales[j].codigoLogo =
                                    this.sucursal.dataFotosSucursales[i].codigo;
                                if (
                                    document.getElementById(
                                        'img' + this.sucursal.dataSucursales[j].idSucursal
                                    )
                                ) {
                                    (document.getElementById(
                                        'img' + this.sucursal.dataSucursales[j].idSucursal
                                    ) as any)!.src = this.sucursal.dataFotosSucursales[i].codigo;
                                    break;
                                }
                            }
                        }
                    }
                    if (idSucursal === undefined) {
                        this.cargarSucursalImagen();
                    } else {
                        this.cargarLogo(this.sucursal.dataSucursales[0].logo);
                    }
                },
                (error) => {
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

    // ---------------------------------------- Cambio - Jesus(MRS) -Sucursal--------------------------------------------------

    consultarSucursal(idSucursal?: any) {
        this.sucursal.dataSucursal = [];
        this._backService
            .HttpPost(
                'catalogos/Sucursal/consultarListadoSucursalesCatalogoSucursales',
                {},
                {}
            )
            .subscribe(
                (response: string) => {
                    this.sucursal.dataSucursales = eval(response);
                    this._pantallaServicio.dataSucursales = this.sucursal.dataSucursales;
                    if (
                        this.sucursal.dataSucursales.length >=
                        this._pantallaServicio.empresaPremium_configuracion
                            .cantidadSucursales
                    ) {
                        $('#btnNuevo').css('display', 'none');
                        this.nueva_sucursal = false;
                    } else {
                        $('#btnNuevo').css('display', 'inline');
                        this.nueva_sucursal = true;
                    }

                    if (this.sucursal.dataSucursales.length >= 9) {
                        $('#navlist').css('float', 'left');
                    } else {
                        $('#navlist').css('float', 'right');
                    }

                    if (this.sucursal.dataSucursales.length === 1) {
                        this._pantallaServicio.validSucursales = false;
                    } else {
                        this._pantallaServicio.validSucursales = true;
                    }

                    this.idSucursales = '';
                    this.sucursal.dataSucursal[0] = JSON.parse(
                        JSON.stringify(this.sucursal.dataSucursales[0])
                    );
                    for (let i = 0; i < this.sucursal.dataSucursales.length; i++) {
                        this.sucursal.dataSucursales[i].codigoLogo =
                            '../../../../assets/images/system/logoSucursal.png';
                        this.idSucursales +=
                            this.sucursal.dataSucursales[i].idSucursal + ',';
                    }

                    if (this.primeraCarga) {
                        this.primeraCarga = false;
                        this.sucursal.idSucursal =
                            this.sucursal.dataSucursales[0].idSucursal;
                        this.sucursal.nombre = this.sucursal.dataSucursales[0].nombre;
                        this.sucursal.email = this.sucursal.dataSucursales[0].email;
                        this.sucursal.telefono = this.sucursal.dataSucursales[0].telefono;
                        this.sucursal.telefono2 = this.sucursal.dataSucursales[0].telefono2;
                        this.sucursal.codigoSucursal =
                            this.sucursal.dataSucursales[0].codigoSucursal;
                        this.sucursal.idioma = this.sucursal.dataSucursales[0].idIdioma;
                        this.sucursal.idLogo = this.sucursal.dataSucursales[0].logo;
                        this.sucursal.calle = this.sucursal.dataSucursales[0].calle;

                        this.sucursal.entreCalles =
                            this.sucursal.dataSucursales[0].entreCalles;

                        this.sucursal.numero = this.sucursal.dataSucursales[0].numero;
                        this.sucursal.numeroInterior =
                            this.sucursal.dataSucursales[0].numeroInterior;
                        this.sucursal.colonia = this.sucursal.dataSucursales[0].colonia;
                        this.sucursal.codigoPostal =
                            this.sucursal.dataSucursales[0].codigoPostal;
                        this.sucursal.pais = this.sucursal.dataSucursales[0].idPais;
                        this.sucursal.estado = this.sucursal.dataSucursales[0].idEstado;
                        this.sucursal.ciudad = this.sucursal.dataSucursales[0].idCiudad;
                        this.sucursal.paginaWeb = this.sucursal.dataSucursales[0].paginaWeb;
                        this.sucursal.facebook = this.sucursal.dataSucursales[0].facebook;
                        this.sucursal.twitter = this.sucursal.dataSucursales[0].twitter;
                        this.sucursal.instagram = this.sucursal.dataSucursales[0].instagram;
                        this.sucursal.lat = this.sucursal.dataSucursales[0].latitud;
                        this.sucursal.lon = this.sucursal.dataSucursales[0].longitud;
                        this.sucursal.estaActiva =
                            Number(this.sucursal.dataSucursales[0].estaActiva || '0') > 0;

                        this.consultaCategoria();

                        this.btnEstablecer = this.sucursalTranslate.actualizarUbicacion;
                        this.establecida = true;
                    } else {
                        if (idSucursal === 'Nueva') {
                            this.nuevaSucursal();
                        } else if (idSucursal === 'Borrar') {
                            this.cargarSucursal(this.sucursal.idSucursal);
                        } else if (idSucursal != null || idSucursal != undefined) {
                            this.cargarSucursal(idSucursal);
                        } else {
                            this.cargarSucursal(this.sucursal.idSucursal);
                        }
                    }
                },
                (error) => {
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

    nuevaSucursal() {
        $('#btnNuevo').css('poitner-events', 'none');
        $('#blockScreen').show();
        this._pantallaServicio.mostrarSpinner();
        $('#btnNuevo').css('display', 'none');
        this.nueva_sucursal = false;
        $('#divSucursales').css('pointer-events', 'none');
        $('#btnGuardar').css('pointer-events', 'none');
        $('#btnDescartar').css('pointer-events', 'none');
        $('#img' + this.sucursal.idSucursal).removeClass('imgActive');
        $('#lbl' + this.sucursal.idSucursal).removeClass('lblActive');
        this.sucursal.idSucursal = null;
        this.validPestañaDatosGenerales();
        this.sucursal.tipoContenidoLogo = '';
        this.limpiarValidaciones();
        this.sucursal.markersArray = [];
        this.consulta = false;
        this.sucursal.dataCategorias = [];
        this.sucursal.dataSubcategorias = [];
        this.guardar = false;
        this.guardarDescansos = false;
        this.categoriaSelccionada = false;
        this.sucursal.lunes = true;
        this.sucursal.martes = true;
        this.sucursal.miercoles = true;
        this.sucursal.jueves = true;
        this.sucursal.viernes = true;
        this.sucursal.sabado = false;
        this.sucursal.domingo = false;
        this.sucursal.esAlta = false;
        this.sucursal.nombre = '';
        this.sucursal.email = this.sucursal.dataSucursales[0].email;
        this.sucursal.telefono = '';
        this.sucursal.telefono2 = '';
        this.sucursal.idioma = this.sucursal.dataSucursales[0].idIdioma;
        this.sucursal.categoria = '';
        this.sucursal.subcategoria = '';
        this.sucursal.foto = [];
        this.sucursal.logo = '';
        this.sucursal.imagenRecortada = '';
        this.sucursal.calle = '';
        this.sucursal.entreCalles = '';
        this.sucursal.numero = '';
        this.sucursal.numeroInterior = '';
        this.sucursal.colonia = '';
        this.sucursal.codigoPostal = '';
        this.sucursal.pais = '';
        this.sucursal.estado = '';
        this.sucursal.ciudad = '';
        this.sucursal.paginaWeb = '';
        this.sucursal.facebook = '';
        this.sucursal.twitter = '';
        this.sucursal.instagram = '';
        this.msgFoto = '';
        this.msgLogo = '';
        this.validFoto = true;
        this.validLogo = true;
        this.sucursal.fotoCargada = '';
        this.sucursal.logoCargado = '';
        this.sucursal.direccion = '';
        this.numImagen = 0;
        this.sucursal.idLogo = null;
        this.accion = 'Nuevo';
        this.rootScope_accionSucursal = 'Nuevo';
        this.stopChange = false;
        this.agenda = '';
        this.sucursal.contadorLunes = 0;
        this.sucursal.contadorMartes = 0;
        this.sucursal.contadorMiercoles = 0;
        this.sucursal.contadorJueves = 0;
        this.sucursal.contadorViernes = 0;
        this.sucursal.contadorSabado = 0;
        this.sucursal.contadorDomingo = 0;
        this.dataEstado = [];
        this.sucursal.dataCiudad = [];
        this.sucursal.objetoLunes = [];
        this.sucursal.objetoMartes = [];
        this.sucursal.objetoMiercoles = [];
        this.sucursal.objetoJueves = [];
        this.sucursal.objetoViernes = [];
        this.sucursal.objetoSabado = [];
        this.sucursal.objetoDomingo = [];

        this.sucursal.objetoLu = [];
        this.sucursal.objetoMa = [];
        this.sucursal.objetoMi = [];
        this.sucursal.objetoJu = [];
        this.sucursal.objetoVi = [];
        this.sucursal.objetoSa = [];
        this.sucursal.objetoDo = [];

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

        this.sucursal.codigoSucursal = '';

        this.sucursal.validDescansosEnLunes = [];
        this.sucursal.validDescansosEnMartes = [];
        this.sucursal.validDescansosEnMiercoles = [];
        this.sucursal.validDescansosEnJueves = [];
        this.sucursal.validDescansosEnViernes = [];
        this.sucursal.validDescansosEnSabado = [];
        this.sucursal.validDescansosEnDomingo = [];

        this.sucursal.validRangosDescansosLunes = [];
        this.sucursal.validRangosDescansosMartes = [];
        this.sucursal.validRangosDescansosMiercoles = [];
        this.sucursal.validRangosDescansosJueves = [];
        this.sucursal.validRangosDescansosViernes = [];
        this.sucursal.validRangosDescansosSabado = [];
        this.sucursal.validRangosDescansosDomingo = [];
        this.sucursal.lat = '';
        this.sucursal.lon = '';
        this.validEmpalmeLunes = [];
        this.validEmpalmeMartes = [];
        this.validEmpalmeMiercoles = [];
        this.validEmpalmeJueves = [];
        this.validEmpalmeViernes = [];
        this.validEmpalmeSabado = [];
        this.validEmpalmeDomingo = [];
        this.cargaFoto = [];
        this.cargaFoto0 = true;
        this.cargaFoto1 = false;
        this.cargaFoto2 = false;
        this.cargaFoto3 = false;
        this.cargaFoto4 = false;
        this.numImagen = 0;
        this.sucursal.tipoContenidoFoto = [];
        this.validarPrimeraCargaHorarios = false;
        this.sucursal.fotosAgregadas = [];
        this.sucursal.fotosCargadas = [];
        this.sucursal.idImagenes = [];
        this.descansosConsulta = false;
        this.validDescartar = false;

        this.nombrePantalla = 'Sucursal';
        this.btnEstablecer = this.sucursalTranslate.actualizarUbicacion;
        this.descansos = 'Agregar Descansos';
        this.cancelarModal = 'Cancelar';
        this.btnCancelarGeneral = 'Cancelar';
        this.sucursal.imagen = 'logo';
        // (document.getElementById('txtImagen') as any)!.src =
        //   'assets/images/system/iconoCamara.png';
        this.sucursal.horaInicioLunes = '09:00';
        this.sucursal.horaFinLunes = '18:00';
        this.sucursal.horaInicioMartes = '09:00';
        this.sucursal.horaFinMartes = '18:00';
        this.sucursal.horaInicioMiercoles = '09:00';
        this.sucursal.horaFinMiercoles = '18:00';
        this.sucursal.horaInicioJueves = '09:00';
        this.sucursal.horaFinJueves = '18:00';
        this.sucursal.horaInicioViernes = '09:00';
        this.sucursal.horaFinViernes = '18:00';
        this.sucursal.horaInicioSabado = '09:00';
        this.sucursal.horaFinSabado = '18:00';
        this.sucursal.horaInicioDomingo = '09:00';
        this.sucursal.horaFinDomingo = '18:00';
        for (let i = 0; i < 5; i++) {
            //   (document.getElementById('txtImagen' + i) as any)!.src =
            //     'assets/images/system/iconoCamara.png';
            $('#btnBorrarImagen' + i).css('display', 'none');
        }
        $('#btnBorrarImagen').css('display', 'none');
        this.consultaCategoria(this.sucursal.dataSucursales[0].idSucursal);
        $('#divSucursales').css('pointer-events', 'visible');
        $('#btnGuardar').css('pointer-events', 'visible');
        $('#loading-spinner').hide();
        $('#blockScreen').hide();
        this._pantallaServicio.ocultarSpinner();
    }

    //Funciones para la pestaña de horario que valida cuando se activa o desactiva un dia laboral
    onChangeChkLunes() {
        this.validarHorariosParaDescansos();
        this.chkValidLunes = this.sucursal.lunes;
        let validarExpresionTiempo = new RegExp(
            '^([0-1][0-9]|[2][0-3])(:[0-5][0-9])$'
        ); //Expresion regular para validar formato de horas

        if (this.chkValidLunes === false) {
            this.sucursal.lunesValidDescartar = [];

            $('#txtHoraInicioLunes').removeClass('errorCampo');
            $('#txtHoraFinLunes').removeClass('errorCampo');
            let contador = JSON.parse(JSON.stringify(this.sucursal.contadorLunes));
            for (let i = 0; i <= contador; i++) {
                this.restarContadorLunes(0);
            }
            this.sucursal.contadorLunes = 0;
            if (
                !validarExpresionTiempo.test(
                    (document.getElementById('txtHoraInicioLunes') as any)!.value
                )
            ) {
                this.msgLunes = '';
                this.sucursal.horaInicioLunes = '09:00';
            } else {
                this.msgLunes = '';
                this.sucursal.horaInicioLunes = '09:00';
            }

            if (
                !validarExpresionTiempo.test(
                    (document.getElementById('txtHoraFinLunes') as any)!.value
                )
            ) {
                this.msgLunes = '';
                this.sucursal.horaFinLunes = '18:00';
            } else {
                this.msgLunes = '';
                this.sucursal.horaFinLunes = '18:00';
            }
        }
    }

    onChangeChkMartes() {
        this.validarHorariosParaDescansos();
        this.chkValidMartes = this.sucursal.martes;
        let validarExpresionTiempo = new RegExp(
            '^([0-1][0-9]|[2][0-3])(:[0-5][0-9])$'
        );
        if (this.chkValidMartes === false) {
            this.sucursal.martesValidDescartar = [];

            $('#txtHoraInicioMartes').removeClass('errorCampo');
            $('#txtHoraFinMartes').removeClass('errorCampo');
            let contador = this.sucursal.contadorMartes;
            for (let i = 0; i <= contador; i++) {
                this.restarContadorMartes(0);
                $('#txtMartesDescansoInicio' + i).removeClass('errorCampo');
                $('#txtMartesDescansoFin' + i).removeClass('errorCampo');
            }
            this.sucursal.contadorMartes = 0;
            if (
                !validarExpresionTiempo.test(
                    (document.getElementById('txtHoraInicioMartes') as any)!.value
                )
            ) {
                this.msgMartes = '';
                this.sucursal.horaInicioMartes = '09:00';
            } else {
                this.msgMartes = '';
                this.sucursal.horaInicioMartes = '09:00';
            }

            if (
                !validarExpresionTiempo.test(
                    (document.getElementById('txtHoraFinMartes') as any)!.value
                )
            ) {
                this.msgMartes = '';
                this.sucursal.horaFinMartes = '18:00';
            } else {
                this.msgMartes = '';
                this.sucursal.horaFinMartes = '18:00';
            }
        }
    }

    onChangeChkMiercoles() {
        this.validarHorariosParaDescansos();
        this.chkValidMiercoles = this.sucursal.miercoles;
        let validarExpresionTiempo = new RegExp(
            '^([0-1][0-9]|[2][0-3])(:[0-5][0-9])$'
        );
        if (this.chkValidMiercoles === false) {
            this.sucursal.miercolesValidDescartar = [];

            $('#txtHoraInicioMiercoles').removeClass('errorCampo');
            $('#txtHoraFinMiercoles').removeClass('errorCampo');
            let contador = this.sucursal.contadorMiercoles;
            for (let i = 0; i <= contador; i++) {
                this.restarContadorMiercoles(0);
                $('#txtMiercolesDescansoInicio' + i).removeClass('errorCampo');
                $('#txtMiercolesDescansoFin' + i).removeClass('errorCampo');
            }
            this.sucursal.contadorMiercoles = 0;

            if (
                !validarExpresionTiempo.test(
                    (document.getElementById('txtHoraInicioMiercoles') as any)!.value
                )
            ) {
                this.msgMiercoles = '';
                this.sucursal.horaInicioMiercoles = '09:00';
            } else {
                this.msgMiercoles = '';
                this.sucursal.horaInicioMiercoles = '09:00';
            }

            if (
                !validarExpresionTiempo.test(
                    (document.getElementById('txtHoraFinMiercoles') as any)!.value
                )
            ) {
                this.msgMiercoles = '';
                this.sucursal.horaFinMiercoles = '18:00';
            } else {
                this.msgMiercoles = '';
                this.sucursal.horaFinMiercoles = '18:00';
            }
        }
    }

    onChangeChkJueves() {
        this.validarHorariosParaDescansos();
        this.chkValidJueves = this.sucursal.jueves;
        let validarExpresionTiempo = new RegExp(
            '^([0-1][0-9]|[2][0-3])(:[0-5][0-9])$'
        );
        if (this.chkValidJueves === false) {
            this.sucursal.juevesValidDescartar = [];

            $('#txtHoraInicioJueves').removeClass('errorCampo');
            $('#txtHoraFinJueves').removeClass('errorCampo');
            let contador = this.sucursal.contadorJueves;
            for (let i = 0; i <= contador; i++) {
                this.restarContadorJueves(0);
                $('#txtJuevesDescansoInicio' + i).removeClass('errorCampo');
                $('#txtJuevesDescansoFin' + i).removeClass('errorCampo');
            }
            this.sucursal.contadorJueves = 0;
            if (
                !validarExpresionTiempo.test(
                    (document.getElementById('txtHoraInicioJueves') as any)!.value
                )
            ) {
                this.msgJueves = '';
                this.sucursal.horaInicioJueves = '09:00';
            } else {
                this.msgJueves = '';
                this.sucursal.horaInicioJueves = '09:00';
            }

            if (
                !validarExpresionTiempo.test(
                    (document.getElementById('txtHoraFinJueves') as any)!.value
                )
            ) {
                this.msgJueves = '';
                this.sucursal.horaFinJueves = '18:00';
            } else {
                this.msgJueves = '';
                this.sucursal.horaFinJueves = '18:00';
            }
        }
    }

    onChangeChkViernes() {
        this.validarHorariosParaDescansos();
        this.chkValidViernes = this.sucursal.viernes;
        let validarExpresionTiempo = new RegExp(
            '^([0-1][0-9]|[2][0-3])(:[0-5][0-9])$'
        );
        if (this.chkValidViernes === false) {
            this.sucursal.viernesValidDescartar = [];

            $('#txtHoraInicioViernes').removeClass('errorCampo');
            $('#txtHoraFinViernes').removeClass('errorCampo');
            let contador = this.sucursal.contadorViernes;
            for (let i = 0; i <= contador; i++) {
                this.restarContadorViernes(0);
                $('#txtViernesDescansoInicio' + i).removeClass('errorCampo');
                $('#txtViernesDescansoFin' + i).removeClass('errorCampo');
            }
            this.sucursal.contadorViernes = 0;
            if (
                !validarExpresionTiempo.test(
                    (document.getElementById('txtHoraInicioViernes') as any)!.value
                )
            ) {
                this.msgViernes = '';
                this.sucursal.horaInicioViernes = '09:00';
            } else {
                this.msgViernes = '';
                this.sucursal.horaInicioViernes = '09:00';
            }

            if (
                !validarExpresionTiempo.test(
                    (document.getElementById('txtHoraFinViernes') as any)!.value
                )
            ) {
                this.msgViernes = '';
                this.sucursal.horaFinViernes = '18:00';
            } else {
                this.msgViernes = '';
                this.sucursal.horaFinViernes = '18:00';
            }
        }
    }

    onChangeChkSabado() {
        this.validarHorariosParaDescansos();
        this.chkValidSabado = this.sucursal.sabado;
        let validarExpresionTiempo = new RegExp(
            '^([0-1][0-9]|[2][0-3])(:[0-5][0-9])$'
        );
        if (this.chkValidSabado === false) {
            this.sucursal.sabadoValidDescartar = [];

            $('#txtHoraInicioSabado').removeClass('errorCampo');
            $('#txtHoraFinSabado').removeClass('errorCampo');

            let contador = this.sucursal.contadorSabado;
            for (let i = 0; i <= contador; i++) {
                this.restarContadorSabado(0);
                $('#txtSabadoDescansoInicio' + i).removeClass('errorCampo');
                $('#txtSabadoDescansoFin' + i).removeClass('errorCampo');
            }
            this.sucursal.contadorSabado = 0;
            if (
                !validarExpresionTiempo.test(
                    (document.getElementById('txtHoraInicioSabado') as any)!.value
                )
            ) {
                this.msgSabado = '';
                this.sucursal.horaInicioSabado = '09:00';
            } else {
                this.msgSabado = '';
                this.sucursal.horaInicioSabado = '09:00';
            }

            if (
                !validarExpresionTiempo.test(
                    (document.getElementById('txtHoraFinSabado') as any)!.value
                )
            ) {
                this.msgSabado = '';
                this.sucursal.horaFinSabado = '18:00';
            } else {
                this.msgSabado = '';
                this.sucursal.horaFinSabado = '18:00';
            }
        }
    }

    onChangeChkDomingo() {
        this.validarHorariosParaDescansos();
        this.chkValidDomingo = this.sucursal.domingo;
        let validarExpresionTiempo = new RegExp(
            '^([0-1][0-9]|[2][0-3])(:[0-5][0-9])$'
        );
        if (this.chkValidDomingo === false) {
            this.sucursal.domingoValidDescartar = [];
            $('#txtHoraInicioDomingo').removeClass('errorCampo');
            $('#txtHoraFinDomingo').removeClass('errorCampo');
            let contador = this.sucursal.contadorDomingo;
            for (let i = 0; i <= contador; i++) {
                this.restarContadorDomingo(0);
                $('#txtDomingoDescansoInicio' + i).removeClass('errorCampo');
                $('#txtDomingoDescansoFin' + i).removeClass('errorCampo');
            }
            this.sucursal.contadorDomingo = 0;
            if (
                !validarExpresionTiempo.test(
                    (document.getElementById('txtHoraInicioDomingo') as any)!.value
                )
            ) {
                this.msgDomingo = '';
                this.sucursal.horaInicioDomingo = '09:00';
            } else {
                this.msgDomingo = '';
                this.sucursal.horaInicioDomingo = '09:00';
            }

            if (
                !validarExpresionTiempo.test(
                    (document.getElementById('txtHoraFinDomingo') as any)!.value
                )
            ) {
                this.msgDomingo = '';
                this.sucursal.horaFinDomingo = '18:00';
            } else {
                this.msgDomingo = '';
                this.sucursal.horaFinDomingo = '18:00';
            }
        }
    }

    //El botón guardar ejecuta la accion dependiendo de lo que se haya seleccionado
    accionBoton(idSucursal?: any, toActualizar?: any) {
        this._pantallaServicio.mostrarSpinner();
        if (this.accion === 'Actualizar') {
            if (idSucursal !== this.sucursal.idSucursal) {
                if (toActualizar === 'toActualizar') {
                    $('#btnGuardar').css('pointer-events', 'none');
                    this._pantallaServicio.ocultarSpinner();
                    this.descartaActualizar(idSucursal);
                } else {
                    $('#btnGuardar').addClass('loading');
                    $('#divSucursales').css('pointer-events', 'none');
                    $('#btnNuevo').css('pointer-events', 'none');
                    $('#btnGuardar').css('pointer-events', 'none');
                    $('#btnDescartar').css('pointer-events', 'none');
                    this.actualizarSucursal(idSucursal);
                }
            } else {
                this._pantallaServicio.ocultarSpinner();
            }
        } else if (this.accion === 'Nuevo') {
            $('#btnGuardar').addClass('loading');
            if (toActualizar != 'toActualizar') {
                $('#divSucursales').css('pointer-events', 'none');
                $('#btnGuardar').css('pointer-events', 'none');
                $('#btnDescartar').css('pointer-events', 'none');
                this.guardarSucursal(idSucursal);
            } else {
                this.idSucursalToActualizar = idSucursal;
                this.toActualizar = toActualizar;
                this._pantallaServicio.ocultarSpinner();
                this.descartaNuevo();
            }
        }
    }

    confirmDescartarActualizar() {
        if (this.agenda === '' && this.sucursal.idSucursalDescarta === undefined) {
            this.rootScope_fromState = '';
            this._router.navigate(['/' + this.rootScope_toState]);
        } else if (this.agenda === 'agenda') {
            this.agenda = '';
            this.rootScope_fromState = '';
            this._router.navigate(['/agenda']);
        } else if (this.sucursal.idSucursalDescarta === 'Nuevo') {
            this.nuevaSucursal();
        } else {
            $('#img' + this.sucursal.idSucursal).removeClass('imgActive');
            $('#lbl' + this.sucursal.idSucursal).removeClass('lblActive');
            this.cargarSucursal(this.sucursal.idSucursalDescarta);
        }
    }

    confirmDescartar() {
        if (this.toActualizar === 'toActualizar') {
            this.cargarSucursal(this.idSucursalToActualizar);
        } else if (this.agenda === '') {
            this.rootScope_fromState = '';
            this._router.navigate(['/' + this.rootScope_toState]);
        } else if (this.agenda === 'agenda') {
            this.agenda = '';
            this.rootScope_fromState = '';
            this._router.navigate(['/agenda']);
        }
    }

    cancelarDescartar() {
        this.agenda = '';
        this.toActualizar = '';
        this.modales.modalConfirm.hide();
    }

    cancelarDescartarActualizar() {
        this.agenda = '';
        this.toActualizar = '';
        this.modales.modalConfirmDescartarActualizar.hide();
        $('#btnGuardar').css('pointer-events', 'visible');
    }

    descartar(agenda: any) {
        this.agenda = agenda;
        if (this.accion === 'Nuevo') {
            this.descartaNuevo();
        } else if (this.accion === 'Actualizar') {
            this.descartaActualizar();
        }
    }

    descartaNuevo(cambio?: any) {
        if (this.validarDescartarNuevo()) {
            if (cambio === undefined) {
                $('#modalConfirm .modal-body').html(
                    '<span style="font-weight: 400;">' +
                    '¿Desea descartar los cambios realizados?' +
                    '</span>'
                );
                this.modales.modalConfirm.show();
            }
        } else {
            this.validarHorariosNuevo();
            if (!this.validHorarios) {
                if (cambio === undefined) {
                    $('#modalConfirm .modal-body').html(
                        '<span style="font-weight: 400;">' +
                        this.sucursalTranslate.deseaDescartar +
                        '</span>'
                    );
                    this.modales.modalConfirm.show();
                }
            } else {
                this.validarHorariosDescansosNuevo();
                if (!this.validHorarios) {
                    if (cambio === undefined) {
                        $('#modalConfirm .modal-body').html(
                            '<span style="font-weight: 400;">' +
                            this.sucursalTranslate.deseaDescartar +
                            '</span>'
                        );
                        this.modales.modalConfirm.show();
                    }
                } else {
                    this.validarCategoriasNuevo();
                    if (!this.validCategorias) {
                        if (cambio === undefined) {
                            $('#modalConfirm .modal-body').html(
                                '<span style="font-weight: 400;">' +
                                this.sucursalTranslate.deseaDescartar +
                                '</span>'
                            );
                            this.modales.modalConfirm.show();
                        }
                    } else {
                        this.validarSubcategoriasNuevo();
                        if (!this.validSubcategorias) {
                            if (cambio === undefined) {
                                $('#modalConfirm .modal-body').html(
                                    '<span style="font-weight: 400;">' +
                                    this.sucursalTranslate.deseaDescartar +
                                    '</span>'
                                );
                                this.modales.modalConfirm.show();
                            }
                        } else {
                            if (cambio === 'CambioSucursal') {
                                this.cambioSucursal = true;
                                this.limpiarValidaciones();
                            } else {
                                if (this.toActualizar === 'toActualizar') {
                                    this.cargarSucursal(this.idSucursalToActualizar);
                                } else if (this.agenda === '') {
                                    this.rootScope_fromState = '';
                                    this._router.navigate(['/' + this.rootScope_toState]);
                                } else if (this.agenda === 'agenda') {
                                    this.agenda = '';
                                    this.rootScope_fromState = '';
                                    this._router.navigate(['/agenda']);
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    rootScope_descartaNuevoSucursal(cambio: any) {
        if (
            this.sucursal.nombre != '' ||
            this.sucursal.email != this.sucursal.dataSucursales[0].email ||
            this.sucursal.telefono != '' ||
            this.sucursal.telefono2 != '' ||
            this.sucursal.idioma != this.sucursal.dataSucursales[0].idIdioma ||
            this.sucursal.calle != this.calle ||
            this.sucursal.entreCalles != '' ||
            this.sucursal.numero != this.numero ||
            this.sucursal.numeroInterior != '' ||
            this.sucursal.colonia != this.colonia ||
            this.sucursal.codigoPostal != this.codigoPostal ||
            this.sucursal.pais != this.sucursal.dataPaisSeleccionado[0].idPais ||
            this.sucursal.estado != this.estadoSeleccionado ||
            this.sucursal.ciudad !=
            this.sucursal.dataCiudadSeleccionada[0].idCiudad ||
            !this.sucursal.lunes ||
            !this.sucursal.martes ||
            !this.sucursal.miercoles ||
            !this.sucursal.jueves ||
            !this.sucursal.viernes ||
            this.sucursal.sabado ||
            this.sucursal.domingo ||
            this.sucursal.facebook != '' ||
            this.sucursal.twitter != '' ||
            this.sucursal.paginaWeb != '' ||
            this.sucursal.instagram != '' ||
            this.sucursal.imagenRecortada != this.sucursal.logoCargado ||
            this.sucursal.foto.length > 0
        ) {
            if (cambio === undefined) {
                $('#modalConfirm .modal-body').html(
                    '<span style="font-weight: 400;">' +
                    this.sucursalTranslate.deseaDescartar +
                    '</span>'
                );
                this.modales.modalConfirm.show();
            }
        } else {
            this.validarHorariosNuevo();
            if (!this.validHorarios) {
                if (cambio === undefined) {
                    $('#modalConfirm .modal-body').html(
                        '<span style="font-weight: 400;">' +
                        this.sucursalTranslate.deseaDescartar +
                        '</span>'
                    );
                    this.modales.modalConfirm.show();
                }
            } else {
                this.validarHorariosDescansosNuevo();
                if (!this.validHorarios) {
                    if (cambio === undefined) {
                        $('#modalConfirm .modal-body').html(
                            '<span style="font-weight: 400;">' +
                            this.sucursalTranslate.deseaDescartar +
                            '</span>'
                        );
                        this.modales.modalConfirm.show();
                    }
                } else {
                    this.validarCategoriasNuevo();
                    if (!this.validCategorias) {
                        if (cambio === undefined) {
                            $('#modalConfirm .modal-body').html(
                                '<span style="font-weight: 400;">' +
                                this.sucursalTranslate.deseaDescartar +
                                '</span>'
                            );
                            this.modales.modalConfirm.show();
                        }
                    } else {
                        this.validarSubcategoriasNuevo();
                        if (!this.validSubcategorias) {
                            if (cambio === undefined) {
                                $('#modalConfirm .modal-body').html(
                                    '<span style="font-weight: 400;">' +
                                    this.sucursalTranslate.deseaDescartar +
                                    '</span>'
                                );
                                this.modales.modalConfirm.show();
                            }
                        } else {
                            if (cambio === 'CambioSucursal') {
                                this.cambioSucursal = true;
                                this.limpiarValidaciones();
                            } else {
                                if (this.agenda === '') {
                                    this.validDescartar = true;
                                    this._router.navigate(['/' + this.rootScope_toState]);
                                } else if (this.agenda === 'agenda') {
                                    this.agenda = '';
                                    this.validDescartar = true;
                                    this._router.navigate(['/agenda']);
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    limpiarValidaciones() {
        this.msgEmail = '';
        this.validEmail = true;
        $('#txtEmail').removeClass('errorCampo');
        this.msgTelefono = '';
        this.validTelefono = true;
        $('#txtTelefono').removeClass('errorCampo');
        this.msgTelefono2 = '';
        this.validTelefono2 = true;
        $('#txtTelefono2').removeClass('errorCampo');

        $('#txtHoraInicioLunes').removeClass('errorCampo');
        $('#txtHoraFinLunes').removeClass('errorCampo');
        $('#txtHoraInicioMartes').removeClass('errorCampo');
        $('#txtHoraFinMartes').removeClass('errorCampo');
        $('#txtHoraInicioMiercoles').removeClass('errorCampo');
        $('#txtHoraFinMiercoles').removeClass('errorCampo');
        $('#txtHoraInicioJueves').removeClass('errorCampo');
        $('#txtHoraFinJueves').removeClass('errorCampo');
        $('#txtHoraInicioViernes').removeClass('errorCampo');
        $('#txtHoraInicioViernes').removeClass('errorCampo');
        $('#txtHoraInicioSabado').removeClass('errorCampo');
        $('#txtHoraFinSabado').removeClass('errorCampo');
        $('#txtHoraInicioDomingo').removeClass('errorCampo');
        $('#txtHoraFinDomingo').removeClass('errorCampo');

        $('#txtCalle').removeClass('errorCampo');
        $('#txtNumero').removeClass('errorCampo');
        $('#txtColonia').removeClass('errorCampo');
        $('#txtCodigoPostal').removeClass('errorCampo');
        $('#ddlPais').removeClass('errorCampo');
        $('#ddlEstado').removeClass('errorCampo');
        $('#ddlCiudad').removeClass('errorCampo');
        this.msgDireccion = '';

        $('#txtNombre').removeClass('errorCampo');
        $('#txtEmail').removeClass('errorCampo');
        $('#txtTelefono').removeClass('errorCampo');
        $('#ddlIdioma').removeClass('errorCampo');
        $('#ddlCategorias').removeClass('errorCampo');
        $('#ddlSubcategorias').removeClass('errorCampo');

        for (let i = 0; i < 2; i++) {
            $('#txtLunesDescansoFin' + i).removeClass('errorCampo');
            $('#txtLunesDescansoInicio' + i).removeClass('errorCampo');
        }
        for (let i = 0; i < 2; i++) {
            this.msgLunesDescansos[i] = '';
        }
        for (let i = 0; i < 2; i++) {
            $('#txtMartesDescansoFin' + i).removeClass('errorCampo');
            $('#txtMartesDescansoInicio' + i).removeClass('errorCampo');
        }
        for (let i = 0; i < 2; i++) {
            this.msgMartesDescansos[i] = '';
        }
        for (let i = 0; i < 2; i++) {
            $('#txtMiercolesDescansoFin' + i).removeClass('errorCampo');
            $('#txtMiercolesDescansoInicio' + i).removeClass('errorCampo');
        }
        for (let i = 0; i < 2; i++) {
            this.msgMiercolesDescansos[i] = '';
        }
        for (let i = 0; i < 2; i++) {
            $('#txtJuevesDescansoFin' + i).removeClass('errorCampo');
            $('#txtJuevesDescansoInicio' + i).removeClass('errorCampo');
        }
        for (let i = 0; i < 2; i++) {
            this.msgJuevesDescansos[i] = '';
        }
        for (let i = 0; i < 2; i++) {
            $('#txtViernesDescansoFin' + i).removeClass('errorCampo');
            $('#txtViernesDescansoInicio' + i).removeClass('errorCampo');
        }
        for (let i = 0; i < 2; i++) {
            this.msgViernesDescansos[i] = '';
        }
        for (let i = 0; i < 2; i++) {
            $('#txtSabadoDescansoFin' + i).removeClass('errorCampo');
            $('#txtSabadoDescansoInicio' + i).removeClass('errorCampo');
        }
        for (let i = 0; i < 2; i++) {
            this.msgSabadoDescansos[i] = '';
        }
        for (let i = 0; i < 2; i++) {
            $('#txtDomingoDescansoFin' + i).removeClass('errorCampo');
            $('#txtDomingoDescansoInicio' + i).removeClass('errorCampo');
        }
        for (let i = 0; i < 2; i++) {
            this.msgDomingoDescansos[i] = '';
        }
    }

    validarCategoriasNuevo() {
        for (let i = 0; i < this.sucursal.categorias.length; i++) {
            if (
                this.sucursal.categorias[i] != this.sucursal.categoriasSeleccionadas[i]
            ) {
                this.validCategorias = false;
                break;
            } else if (i === this.sucursal.categorias.length - 1) {
                this.validCategorias = true;
            }
        }
    }

    validarSubcategoriasNuevo() {
        for (let i = 0; i < this.sucursal.subcategoria.length; i++) {
            if (
                this.sucursal.subcategoria[i] !=
                this.sucursal.subcategoriasSeleccionadas[i]
            ) {
                this.validSubcategorias = false;
                break;
            } else if (i === this.sucursal.subcategoria.length - 1) {
                this.validSubcategorias = true;
            }
        }
    }

    validarHorariosNuevo() {
        let horaInicio = '09:00';
        let horaFin = '18:00';

        if (
            this.sucursal.horaInicioLunes != horaInicio ||
            this.sucursal.horaFinLunes != horaFin ||
            this.sucursal.horaInicioMartes != horaInicio ||
            this.sucursal.horaFinMartes != horaFin ||
            this.sucursal.horaInicioMiercoles != horaInicio ||
            this.sucursal.horaFinMiercoles != horaFin ||
            this.sucursal.horaInicioJueves != horaInicio ||
            this.sucursal.horaFinJueves != horaFin ||
            this.sucursal.horaInicioViernes != horaInicio ||
            this.sucursal.horaFinViernes != horaFin ||
            this.sucursal.horaInicioSabado != horaInicio ||
            this.sucursal.horaFinSabado != horaFin ||
            this.sucursal.horaInicioDomingo != horaInicio ||
            this.sucursal.horaFinDomingo != horaFin
        ) {
            this.validHorarios = false;
        } else {
            this.validHorarios = true;
        }
    }

    validarHorariosDescansosNuevo() {
        if (
            this.sucursal.contadorLunes > 0 ||
            this.sucursal.contadorMartes > 0 ||
            this.sucursal.contadorMiercoles > 0 ||
            this.sucursal.contadorJueves > 0 ||
            this.sucursal.contadorViernes > 0 ||
            this.sucursal.contadorSabado > 0 ||
            this.sucursal.contadorDomingo > 0
        ) {
            this.validHorarios = false;
        } else {
            this.validHorarios = true;
        }
    }

    validarHorariosActualizar() {
        for (let i = 0; i < this.sucursal.dataHorariosLaborales.length; i++) {
            switch (this.sucursal.dataHorariosLaborales[i].dia) {
                case 1:
                    if (
                        this.sucursal.lunes !=
                        this.sucursal.dataHorariosLaborales[i].esLaboral
                    ) {
                        this.validHorarios = false;
                    } else {
                        this.validHorarios = true;
                    }
                    break;
                case 2:
                    if (
                        this.sucursal.martes !=
                        this.sucursal.dataHorariosLaborales[i].esLaboral
                    ) {
                        this.validHorarios = false;
                    } else {
                        this.validHorarios = true;
                    }
                    break;
                case 3:
                    if (
                        this.sucursal.miercoles !=
                        this.sucursal.dataHorariosLaborales[i].esLaboral
                    ) {
                        this.validHorarios = false;
                    } else {
                        this.validHorarios = true;
                    }
                    break;
                case 4:
                    if (
                        this.sucursal.jueves !=
                        this.sucursal.dataHorariosLaborales[i].esLaboral
                    ) {
                        this.validHorarios = false;
                    } else {
                        this.validHorarios = true;
                    }
                    break;
                case 5:
                    if (
                        this.sucursal.viernes !=
                        this.sucursal.dataHorariosLaborales[i].esLaboral
                    ) {
                        this.validHorarios = false;
                    } else {
                        this.validHorarios = true;
                    }
                    break;
                case 6:
                    if (
                        this.sucursal.sabado !=
                        this.sucursal.dataHorariosLaborales[i].esLaboral
                    ) {
                        this.validHorarios = false;
                    } else {
                        this.validHorarios = true;
                    }
                    break;
                case 7:
                    if (
                        this.sucursal.domingo !=
                        this.sucursal.dataHorariosLaborales[i].esLaboral
                    ) {
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
            if (
                this.sucursal.horaInicioLunes != this.sucursal.horaIniLu ||
                this.sucursal.horaFinLunes != this.sucursal.horaFiLu ||
                this.sucursal.horaInicioMartes != this.sucursal.horaIniMa ||
                this.sucursal.horaFinMartes != this.sucursal.horaFiMa ||
                this.sucursal.horaInicioMiercoles != this.sucursal.horaIniMi ||
                this.sucursal.horaFinMiercoles != this.sucursal.horaFiMi ||
                this.sucursal.horaInicioJueves != this.sucursal.horaIniJu ||
                this.sucursal.horaFinJueves != this.sucursal.horaFiJu ||
                this.sucursal.horaInicioViernes != this.sucursal.horaIniVi ||
                this.sucursal.horaFinViernes != this.sucursal.horaFiVi ||
                this.sucursal.horaInicioSabado != this.sucursal.horaIniSa ||
                this.sucursal.horaFinSabado != this.sucursal.horaFiSa ||
                this.sucursal.horaInicioDomingo != this.sucursal.horaIniDo ||
                this.sucursal.horaFinDomingo != this.sucursal.horaFiDo
            ) {
                this.validHorarios = false;
            } else {
                this.validHorarios = true;
            }
        }
    }

    validHorariosDescansosActualizar() {
        this.validarHorariosDescansosActualizar(
            this.sucursal.objetoLunes,
            this.sucursal.objetoLu
        );
        this.validarHorariosDescansosActualizar(
            this.sucursal.objetoMartes,
            this.sucursal.objetoMa
        );
        this.validarHorariosDescansosActualizar(
            this.sucursal.objetoMiercoles,
            this.sucursal.objetoMi
        );
        this.validarHorariosDescansosActualizar(
            this.sucursal.objetoJueves,
            this.sucursal.objetoJu
        );
        this.validarHorariosDescansosActualizar(
            this.sucursal.objetoViernes,
            this.sucursal.objetoVi
        );
        this.validarHorariosDescansosActualizar(
            this.sucursal.objetoSabado,
            this.sucursal.objetoSa
        );
        this.validarHorariosDescansosActualizar(
            this.sucursal.objetoDomingo,
            this.sucursal.objetoDo
        );
    }

    validarHorariosDescansosActualizar(objetoDia: any, objetoDia2: any) {
        if (objetoDia.length != objetoDia2.length) {
            this.validHorariosDescansos.push(false);
        } else {
            for (let i = 0; i < objetoDia.length; i++) {
                if (
                    objetoDia[i].horaInicio != objetoDia2[i].horaInicio ||
                    objetoDia[i].horaFin != objetoDia2[i].horaFin
                ) {
                    this.validHorariosDescansos.push(false);
                    break;
                } else if (i === objetoDia.length - 1) {
                    this.validHorariosDescansos.push(true);
                }
            }
        }
    }

    validarCategoriasActualizar() {
        this.validCategorias = true;
        if (
            this.sucursal.categorias.length !=
            this.sucursal.categoriasSeleccionadas.length
        ) {
            this.validCategorias = false;
        }
        if (this.validCategorias) {
            for (let i = 0; i < this.sucursal.categorias.length; i++) {
                if (
                    this.sucursal.categorias[i] !=
                    this.sucursal.categoriasSeleccionadas[i]
                ) {
                    this.validCategorias = false;
                    break;
                } else {
                    this.validCategorias = true;
                }
            }
        }
    }

    validarSubcategoriasActualizar() {
        this.validSubcategorias = true;
        if (
            this.sucursal.subcategoria.length !=
            this.sucursal.subcategoriasSeleccionadas.length
        ) {
            this.validSubcategorias = false;
        }
        if (this.validSubcategorias) {
            for (let i = 0; i < this.sucursal.subcategoria.length; i++) {
                if (
                    this.sucursal.subcategoria[i] !=
                    this.sucursal.subcategoriasSeleccionadas[i]
                ) {
                    this.validSubcategorias = false;
                    break;
                } else {
                    this.validSubcategorias = true;
                }
            }
        }
    }

    validarFotosDescartarActualizar() {
        this.validDescartarFotos = true;
        for (let i = 0; i < this.sucursal.foto.length; i++) {
            if (this.sucursal.foto[i] != this.sucursal.fotosCargadas[i]) {
                this.validDescartarFotos = false;
                break;
            }
        }
    }

    descartaActualizar(idSucursal?: any) {
        this.sucursal.idSucursalDescarta = idSucursal;
        if (this.validarDescartarActualizar()) {
            $('#modalConfirmDescartarActualizar .modal-body').html(
                '<span style="font-weight: 400;">' +
                '¿Desea descartar los cambios realizados?' +
                '</span>'
            );
            this.modales.modalConfirmDescartarActualizar.show();
        } else {
            this.validarHorariosActualizar();
            if (!this.validHorarios) {
                $('#modalConfirmDescartarActualizar .modal-body').html(
                    '<span style="font-weight: 400;">' +
                    '¿Desea descartar los cambios realizados?' +
                    '</span>'
                );
                this.modales.modalConfirmDescartarActualizar.show();
            } else {
                this.validHorariosDescansos = [];
                this.validHorariosDescansosActualizar();
                this.validDescansos = true;
                for (let i = 0; i < this.validHorariosDescansos.length; i++) {
                    if (!this.validHorariosDescansos[i]) {
                        $('#modalConfirmDescartarActualizar .modal-body').html(
                            '<span style="font-weight: 400;">' +
                            '¿Desea descartar los cambios realizados?' +
                            '</span>'
                        );
                        this.modales.modalConfirmDescartarActualizar.show();
                        this.validDescansos = false;
                        break;
                    } else if (i === this.validHorariosDescansos.length - 1) {
                        this.validDescansos = true;
                    }
                }
                if (this.validDescansos) {
                    this.validarCategoriasActualizar();
                    if (!this.validCategorias) {
                        $('#modalConfirmDescartarActualizar .modal-body').html(
                            '<span style="font-weight: 400;">' +
                            '¿Desea descartar los cambios realizados?' +
                            '</span>'
                        );
                        this.modales.modalConfirmDescartarActualizar.show();
                    } else {
                        this.validarSubcategoriasActualizar();
                        if (!this.validSubcategorias) {
                            $('#modalConfirmDescartarActualizar .modal-body').html(
                                '<span style="font-weight: 400;">' +
                                '¿Desea descartar los cambios realizados?' +
                                '</span>'
                            );
                            this.modales.modalConfirmDescartarActualizar.show();
                        } else {
                            this.validarFotosDescartarActualizar();
                            if (!this.validDescartarFotos) {
                                $('#modalConfirmDescartarActualizar .modal-body').html(
                                    '<span style="font-weight: 400;">' +
                                    '¿Desea descartar los cambios realizados?' +
                                    '</span>'
                                );
                                this.modales.modalConfirmDescartarActualizar.show();
                            } else {
                                if (this.agenda === '' && idSucursal === undefined) {
                                    this.validDescartar = true;
                                    this.rootScope_fromState = '';
                                    this._router.navigate(['/' + this.rootScope_toState]);
                                    //this.rootScope_$$listeners.$stateChangeStart = [];
                                } else if (this.agenda === 'agenda') {
                                    this.agenda = '';
                                    this.rootScope_fromState = '';
                                    this.validDescartar = true;
                                    this._router.navigate(['/agenda']);
                                } else if (idSucursal === 'Nuevo') {
                                    this.nuevaSucursal();
                                } else {
                                    $('#img' + this.sucursal.idSucursal).removeClass('imgActive');
                                    $('#lbl' + this.sucursal.idSucursal).removeClass('lblActive');
                                    this.cargarSucursal(idSucursal);
                                    this.sucursal.idSucursalDescarta = undefined;
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    rootScope_descartaActualizarSucursal() {
        if (this.validarDescartarActualizar()) {
            $('#modalConfirmDescartarActualizar .modal-body').html(
                '<span style="font-weight: 400;">' +
                this.informacionFiscalCliente.descartar +
                '</span>'
            );
            this.modales.modalConfirmDescartarActualizar.show();
        } else {
            this.validarHorariosActualizar();
            if (!this.validHorarios) {
                $('#modalConfirmDescartarActualizar .modal-body').html(
                    '<span style="font-weight: 400;">' +
                    this.informacionFiscalCliente.descartar +
                    '</span>'
                );
                this.modales.modalConfirmDescartarActualizar.show();
            } else {
                this.validHorariosDescansos = [];
                this.validHorariosDescansosActualizar();
                this.validDescansos = true;
                for (let i = 0; i < this.validHorariosDescansos.length; i++) {
                    if (!this.validHorariosDescansos[i]) {
                        $('#modalConfirmDescartarActualizar .modal-body').html(
                            '<span style="font-weight: 400;">' +
                            this.informacionFiscalCliente.descartar +
                            '</span>'
                        );
                        this.modales.modalConfirmDescartarActualizar.show();
                        this.validDescansos = false;
                        break;
                    } else if (i === this.validHorariosDescansos.length - 1) {
                        this.validDescansos = true;
                    }
                }
                if (this.validDescansos) {
                    this.validarCategoriasActualizar();
                    if (!this.validCategorias) {
                        $('#modalConfirmDescartarActualizar .modal-body').html(
                            '<span style="font-weight: 400;">' +
                            this.informacionFiscalCliente.descartar +
                            '</span>'
                        );
                        this.modales.modalConfirmDescartarActualizar.show();
                    } else {
                        this.validarSubcategoriasActualizar();
                        if (!this.validSubcategorias) {
                            $('#modalConfirmDescartarActualizar .modal-body').html(
                                '<span style="font-weight: 400;">' +
                                this.informacionFiscalCliente.descartar +
                                '</span>'
                            );
                            this.modales.modalConfirmDescartarActualizar.show();
                        } else {
                            this.validarFotosDescartarActualizar();
                            if (!this.validDescartarFotos) {
                                $('#modalConfirmDescartarActualizar .modal-body').html(
                                    '<span style="font-weight: 400;">' +
                                    this.informacionFiscalCliente.descartar +
                                    '</span>'
                                );
                                this.modales.modalConfirmDescartarActualizar.show();
                            } else {
                                this.validDescartar = true;
                                this.rootScope_fromState = '';
                                this._router.navigate(['/' + this.rootScope_toState]);
                            }
                        }
                    }
                }
            }
        }
    }

    dynamicSort(property: any) {
        let sortOrder = 1;
        if (property[0] === '-') {
            sortOrder = -1;
            property = property.substr(1);
        }
        return function (a: any, b: any) {
            const result =
                a[property] < b[property] ? -1 : a[property] > b[property] ? 1 : 0;
            return result * sortOrder;
        };
    }

    onChangeDdlCategorias() {
        this.sucursal.aux2 = JSON.parse(
            JSON.stringify(this.sucursal.subcategoria || [])
        );
        this.sucursal.subcategoria = undefined;
        this.sucursal.aux = [];
        let params: any = {};
        params.idCategoria = this.sucursal.categorias.slice();
        this._backService
            .HttpPost(
                'catalogos/Sucursal/consultaSubcategoriaPorCategoria',
                {},
                params
            )
            .subscribe(
                (response) => {
                    this.sucursal.dataSubcategorias = eval(response);
                    this.sucursal.dataSubcategorias =
                        this.sucursal.dataSubcategorias.sort(this.dynamicSort('nombre'));

                    let cont = 0;
                    for (let j = 0; j < this.sucursal.dataSubcategorias.length; j++) {
                        if (
                            this.sucursal.dataSubcategorias[j].nombre
                                .toLowerCase()
                                .includes('otros') ||
                            this.sucursal.dataSubcategorias[j].nombre
                                .toLowerCase()
                                .includes('otro') ||
                            this.sucursal.dataSubcategorias[j].nombre
                                .toLowerCase()
                                .includes('otra') ||
                            this.sucursal.dataSubcategorias[j].nombre
                                .toLowerCase()
                                .includes('otras')
                        ) {
                            cont++;
                        }
                    }
                    let j = 0;
                    for (let i = 0; i < this.sucursal.dataSubcategorias.length; i++) {
                        if (
                            this.sucursal.dataSubcategorias[i].nombre
                                .toLowerCase()
                                .includes('otros') ||
                            this.sucursal.dataSubcategorias[i].nombre
                                .toLowerCase()
                                .includes('otro') ||
                            this.sucursal.dataSubcategorias[i].nombre
                                .toLowerCase()
                                .includes('otra') ||
                            this.sucursal.dataSubcategorias[i].nombre
                                .toLowerCase()
                                .includes('otras')
                        ) {
                            if (cont >= j) {
                                this.rowSelected = JSON.parse(
                                    JSON.stringify(this.sucursal.dataSubcategorias[i])
                                );
                                this.sucursal.dataSubcategorias.splice(i, 1);
                                this.sucursal.dataSubcategorias.push(this.rowSelected);
                                j++;
                                i--;
                            }
                        }
                    }

                    if (this.sucursal.dataSubcategorias.length != 0) {
                        this.categoriaSelccionada = true;
                    } else {
                        this.categoriaSelccionada = false;
                    }
                    for (let i = 0; i < this.sucursal.categorias.length; i++) {
                        for (let j = 0; j < this.sucursal.dataSubcategorias.length; j++) {
                            for (let h = 0; h < this.sucursal.aux2.length; h++) {
                                if (
                                    this.sucursal.categorias[i] ===
                                    this.sucursal.dataSubcategorias[j].idCategoria
                                ) {
                                    if (
                                        this.sucursal.aux2[h] ===
                                        this.sucursal.dataSubcategorias[j].idSubcategoria
                                    ) {
                                        this.sucursal.aux.push(
                                            JSON.parse(
                                                JSON.stringify(
                                                    this.sucursal.dataSubcategorias[j].idSubcategoria
                                                )
                                            )
                                        );
                                    }
                                }
                            }
                        }
                    }
                    this.sucursal.subcategoria = [];
                    this.sucursal.subcategoria = JSON.parse(
                        JSON.stringify(this.sucursal.aux)
                    );
                },
                (error) => {
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

    validarMaxCategorias() {
        if (this.sucursal.categorias.length > 3) {
            this.validMaxCategorias = false;
            this.msgCategorias = this.sucursalTranslate.maxCategorias;
            $('#ddlCategorias').addClass('errorCampo');
        } else {
            this.validMaxCategorias = true;
            this.msgCategorias = '';
            $('#ddlCategorias').removeClass('errorCampo');
        }
    }

    validarEmail() {
        let eMailExp =
            /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

        if (this.sucursal.email != '') {
            if (!eMailExp.test(this.sucursal.email)) {
                this.validEmail = false;
                this.msgEmail = this.sucursalTranslate.formatoEmail;
                $('#txtEmail').addClass('errorCampo');
            } else {
                this.msgEmail = '';
                this.validEmail = true;
                $('#txtEmail').removeClass('errorCampo');
            }
        }
    }

    validarTelefono() {
        let telefonoExp = new RegExp(
            '^(\\(\\d{2}\\)|\\d{2})?-?(\\d{2})?-?\\d{2}-?\\d{2}-?\\d{2}-?\\d{2}$'
        );
        let telMovilExp = new RegExp(
            '^(\\(\\d{3}\\)|\\d{3})?-?((\\d{3}-?\\d{3}-?\\d{2}-?\\d{2})|(\\d{2}-?\\d{2}-?\\d{2}-?\\d{2}-?\\d{2}))$'
        );
        if (this.sucursal.telefono != '') {
            if (
                telefonoExp.test(this.sucursal.telefono) ||
                telMovilExp.test(this.sucursal.telefono)
            ) {
                this.msgTelefono = '';
                this.validTelefono = true;
                $('#txtTelefono').removeClass('errorCampo');
            } else {
                this.msgTelefono = this.sucursalTranslate.formatoTelefono;
                this.validTelefono = false;
                $('#txtTelefono').addClass('errorCampo');
            }
        }
        this.validTelefono2 = true;
        if (this.sucursal.telefono2 != '' && this.sucursal.telefono2 != null) {
            if (
                telefonoExp.test(this.sucursal.telefono2) ||
                telMovilExp.test(this.sucursal.telefono2) ||
                this.sucursal.telefono2 === ''
            ) {
                this.msgTelefono2 = '';
                this.validTelefono2 = true;
                $('#txtTelefono2').removeClass('errorCampo');
            } else {
                this.msgTelefono2 = this.sucursalTranslate.formatoTelefono2;
                this.validTelefono2 = false;
                $('#txtTelefono2').addClass('errorCampo');
            }
        } else {
            this.msgTelefono2 = '';
            this.validTelefono2 = true;
            $('#txtTelefono2').removeClass('errorCampo');
        }
    }

    validarFormatoDireccion(valor: any) {
        let formatoExp = RegExp('^[a-zA-Z 0-9áéíóúñÁÉÍÓÚÑüÜs]*$');
        let validForm = false;
        if (formatoExp.test(valor)) {
            validForm = true;
        } else {
            validForm = false;
        }
        return validForm;
    }

    validarCamposRequeridosHorarios() {
        this.contRequeridosHorarios = 0;
        if (
            this.sucursal.horaInicioLunes === null ||
            this.sucursal.horaInicioLunes === undefined
        ) {
            $('#txtHoraInicioLunes').addClass('errorCampo');
            this.contRequeridosHorarios++;
        } else {
            $('#txtHoraInicioLunes').css('outline', null);
        }

        if (
            this.sucursal.horaFinLunes === null ||
            this.sucursal.horaFinLunes === undefined
        ) {
            $('#txtHoraFinLunes').addClass('errorCampo');
            this.contRequeridosHorarios++;
        } else {
            $('#txtHoraFinLunes').css('outline', null);
        }

        if (
            this.sucursal.horaInicioMartes === null ||
            this.sucursal.horaInicioMartes === undefined
        ) {
            $('#txtHoraInicioMartes').addClass('errorCampo');
            this.contRequeridosHorarios++;
        } else {
            $('#txtHoraInicioMartes').css('outline', null);
        }
        if (
            this.sucursal.horaFinMartes === null ||
            this.sucursal.horaFinMartes === undefined
        ) {
            $('#txtHoraFinMartes').addClass('errorCampo');
            this.contRequeridosHorarios++;
        } else {
            $('#txtHoraFinMartes').css('outline', null);
        }
        if (
            this.sucursal.horaInicioMiercoles === null ||
            this.sucursal.horaInicioMiercoles === undefined
        ) {
            $('#txtHoraInicioMiercoles').addClass('errorCampo');
            this.contRequeridosHorarios++;
        } else {
            $('#txtHoraInicioMiercoles').css('outline', null);
        }
        if (
            this.sucursal.horaFinMiercoles === null ||
            this.sucursal.horaFinMiercoles === undefined
        ) {
            $('#txtHoraFinMiercoles').addClass('errorCampo');
            this.contRequeridosHorarios++;
        } else {
            $('#txtHoraFinMiercoles').css('outline', null);
        }
        if (
            this.sucursal.horaInicioJueves === null ||
            this.sucursal.horaInicioJueves === undefined
        ) {
            $('#txtHoraInicioJueves').addClass('errorCampo');
            this.contRequeridosHorarios++;
        } else {
            $('#txtHoraInicioJueves').css('outline', null);
        }

        if (
            this.sucursal.horaFinJueves === null ||
            this.sucursal.horaFinJueves === undefined
        ) {
            $('#txtHoraFinJueves').addClass('errorCampo');
            this.contRequeridosHorarios++;
        } else {
            $('#txtHoraFinJueves').css('outline', null);
        }

        if (
            this.sucursal.horaInicioViernes === null ||
            this.sucursal.horaInicioViernes === undefined
        ) {
            $('#txtHoraInicioViernes').addClass('errorCampo');
            this.contRequeridosHorarios++;
        } else {
            $('#txtHoraInicioViernes').css('outline', null);
        }

        if (
            this.sucursal.horaFinViernes === null ||
            this.sucursal.horaFinViernes === undefined
        ) {
            $('#txtHoraFinViernes').addClass('errorCampo');
            this.contRequeridosHorarios++;
        } else {
            $('#txtHoraFinViernes').css('outline', null);
        }

        if (
            this.sucursal.horaInicioSabado === null ||
            this.sucursal.horaInicioSabado === undefined
        ) {
            $('#txtHoraInicioSabado').addClass('errorCampo');
            this.contRequeridosHorarios++;
        } else {
            $('#txtHoraInicioSabado').css('outline', null);
        }

        if (
            this.sucursal.horaFinSabado === null ||
            this.sucursal.horaFinSabado === undefined
        ) {
            $('#txtHoraFinSabado').addClass('errorCampo');
            this.contRequeridosHorarios++;
        } else {
            $('#txtHoraFinSabado').css('outline', null);
        }

        if (
            this.sucursal.horaInicioDomingo === null ||
            this.sucursal.horaInicioDomingo === undefined
        ) {
            $('#txtHoraInicioDomingo').addClass('errorCampo');
            this.contRequeridosHorarios++;
        } else {
            $('#txtHoraInicioDomingo').css('outline', null);
        }

        if (
            this.sucursal.horaFinDomingo === null ||
            this.sucursal.horaFinDomingo === undefined
        ) {
            $('#txtHoraFinDomingo').addClass('errorCampo');
            this.contRequeridosHorarios++;
        } else {
            $('#txtHoraFinDomingo').css('outline', null);
        }
    }

    validarCamposRequeridosDireccion() {
        this.contRequeridosDireccion = 0;
        this.msgDireccion = '';

        if (this.sucursal.calle === '' || this.sucursal.calle === undefined) {
            $('#txtCalle').addClass('errorCampo');
            this.contRequeridosDireccion++;
        } else {
            $('#txtCalle').removeClass('errorCampo');
        }

        if (this.sucursal.numero === '' || this.sucursal.numero === undefined) {
            $('#txtNumero').addClass('errorCampo');
            this.contRequeridosDireccion++;
        } else {
            $('#txtNumero').removeClass('errorCampo');
        }

        if (this.sucursal.colonia === '' || this.sucursal.colonia === undefined) {
            $('#txtColonia').addClass('errorCampo');
            this.contRequeridosDireccion++;
        } else {
            $('#txtColonia').removeClass('errorCampo');
        }

        if (
            this.sucursal.codigoPostal === '' ||
            this.sucursal.codigoPostal === undefined
        ) {
            $('#txtCodigoPostal').addClass('errorCampo');
            this.contRequeridosDireccion++;
        } else {
            $('#txtCodigoPostal').removeClass('errorCampo');
        }

        if (this.sucursal.pais === '' || this.sucursal.pais === undefined) {
            $('#ddlPais').addClass('errorCampo');
            this.contRequeridosDireccion++;
        } else {
            $('#ddlPais').removeClass('errorCampo');
        }

        if (this.sucursal.estado === '' || this.sucursal.estado === undefined) {
            $('#ddlEstado').addClass('errorCampo');
            this.contRequeridosDireccion++;
        } else {
            $('#ddlEstado').removeClass('errorCampo');
        }

        if (this.sucursal.ciudad === '' || this.sucursal.ciudad === undefined) {
            $('#ddlCiudad').addClass('errorCampo');
            this.contRequeridosDireccion++;
        } else {
            $('#ddlCiudad').removeClass('errorCampo');
        }
    }

    validarCamposRequeridosDatosGenerales() {
        this.contRequeridosDatosGenerales = 0;

        if (this.sucursal.nombre === '' || this.sucursal.nombre === undefined) {
            $('#txtNombre').addClass('errorCampo');
            this.contRequeridosDatosGenerales++;
        } else {
            $('#txtNombre').removeClass('errorCampo');
        }

        if (this.sucursal.email === '' || this.sucursal.email === undefined) {
            $('#txtEmail').addClass('errorCampo');
            this.contRequeridosDatosGenerales++;
        } else {
            $('#txtEmail').removeClass('errorCampo');
        }

        if (this.sucursal.telefono === '' || this.sucursal.telefono === undefined) {
            $('#txtTelefono').addClass('errorCampo');
            this.contRequeridosDatosGenerales++;
        } else {
            $('#txtTelefono').removeClass('errorCampo');
        }

        if (this.sucursal.idioma === '' || this.sucursal.idioma === undefined) {
            $('#ddlIdioma').addClass('errorCampo');
            this.contRequeridosDatosGenerales++;
        } else {
            $('#ddlIdioma').removeClass('errorCampo');
        }

        if (
            this.sucursal.categorias === '' ||
            this.sucursal.categorias === undefined ||
            this.sucursal.categorias.length < 1
        ) {
            $('#ddlCategorias').addClass('errorCampo');
            this.contRequeridosDatosGenerales++;
        } else {
            $('#ddlCategorias').removeClass('errorCampo');
        }

        if (
            this.sucursal.subcategoria === '' ||
            this.sucursal.subcategoria === undefined ||
            this.sucursal.subcategoria.length < 1
        ) {
            $('#ddlSubcategorias').addClass('errorCampo');
            this.contRequeridosDatosGenerales++;
        } else {
            $('#ddlSubcategorias').removeClass('errorCampo');
        }

        this.validarEmail();
        this.validarTelefono();
        this.validarMaxCategorias();

        if (
            !this.validEmail ||
            !this.validTelefono ||
            !this.validTelefono2 ||
            this.contRequeridosDatosGenerales > 0 ||
            !this.validMaxCategorias
        ) {
            this.validTabDatosGenerales = false;
        } else {
            this.validTabDatosGenerales = true;
        }
    }

    validPestañaHorarios() {
        this.tabSelect = 2;
    }

    validPestañaDireccion() {
        this.tabSelect = 1;
    }

    validPestañaDatosGenerales() {
        this.tabSelect = 0;
    }

    validPestañaDescansos() {
        this.tabSelect = 3;
    }

    accioImportarServicios(idSucursal?: any) {
        $('#blockScreen').show();
        this._pantallaServicio.mostrarSpinner();
        $('#divSucursales').css('pointer-events', 'none');
        $('#btnNuevo').css('pointer-events', 'none');
        $('#btnGuardar').css('pointer-events', 'none');
        $('#btnDescartar').css('pointer-events', 'none');

        if (this.accion === 'Nuevo') {
            this.guardar = true;
            if (!this.validLogo || !this.validFoto) {
                $('#txtImagen').removeClass('errorCampo');
                this.msgImagen = '';
                this.validLogo = true;
                this.validFoto = true;
                this.msgLogo = '';
                this.msgFoto = '';
            }
            $('#blockScreen').show();
            this._pantallaServicio.mostrarSpinner();
            this.cambioSucursal = false;
            if (idSucursal !== undefined) {
                this.descartaNuevo('CambioSucursal');
                if (this.cambioSucursal) {
                    this.cargarSucursal(idSucursal);
                }
            }
            if (!this.cambioSucursal) {
                this.guardadoValidado = false;
                this.msgHorariosLaboral = '';
                this.validarCamposRequeridosDatosGenerales();
                this.validarCamposRequeridosDireccion();
                this.validarCamposRequeridosHorarios();
                if (this.validTabDatosGenerales) {
                    if (this.contRequeridosDireccion === 0) {
                        if (this.contRequeridosHorarios === 0) {
                            this.validarRangoHoras();
                            if (
                                this.validLunes &&
                                this.validMartes &&
                                this.validMiercoles &&
                                this.validJueves &&
                                this.validViernes &&
                                this.validSabado &&
                                this.validDomingo
                            ) {
                                this.aceptarDescansos();
                                if (this.sucursal.DescansosValidados) {
                                    if (
                                        this.sucursal.lunes ||
                                        this.sucursal.martes ||
                                        this.sucursal.miercoles ||
                                        this.sucursal.jueves ||
                                        this.sucursal.viernes ||
                                        this.sucursal.sabado ||
                                        this.sucursal.domingo
                                    ) {
                                        $('#btnGuardar').removeClass('loading');
                                        $('#divSucursales').css('pointer-events', 'none');
                                        $('#btnNuevo').css('pointer-events', 'none');
                                        $('#btnGuardar').css('pointer-events', 'none');
                                        $('#btnDescartar').css('pointer-events', 'none');
                                        $('#blockScreen').hide();
                                        this._pantallaServicio.ocultarSpinner();
                                        this.accion = 'Actualizar';
                                        $('#modalConfirmServicios .modal-body').html(
                                            '<span style="font-weight: 400;">' +
                                            this.sucursalTranslate.deseaImportar +
                                            '</span>'
                                        );
                                        this.modales.modalConfirmServicios.show();
                                    } else {
                                        this.validPestañaHorarios();
                                        this.msgHorariosLaboral =
                                            this.sucursalTranslate.seleccioneHorario;
                                        $('#divSucursales').css('pointer-events', 'visible');
                                        $('#btnGuardar').css('pointer-events', 'visible');
                                        $('#btnDescartar').css('pointer-events', 'visible');
                                        $('#loading-spinner').hide();
                                        $('#blockScreen').hide();
                                        this._pantallaServicio.ocultarSpinner();
                                        $('#btnGuardar').removeClass('loading');
                                    }
                                } else {
                                    this.validPestañaDescansos();
                                    $('#divSucursales').css('pointer-events', 'visible');
                                    $('#btnGuardar').css('pointer-events', 'visible');
                                    $('#btnDescartar').css('pointer-events', 'visible');
                                    $('#loading-spinner').hide();
                                    $('#blockScreen').hide();
                                    this._pantallaServicio.ocultarSpinner();
                                    $('#btnGuardar').removeClass('loading');
                                }
                            } else {
                                this.validPestañaHorarios();
                                $('#divSucursales').css('pointer-events', 'visible');
                                $('#btnGuardar').css('pointer-events', 'visible');
                                $('#btnDescartar').css('pointer-events', 'visible');
                                $('#loading-spinner').hide();
                                $('#blockScreen').hide();
                                this._pantallaServicio.ocultarSpinner();
                                $('#btnGuardar').removeClass('loading');
                            }
                        } else {
                            this.validPestañaHorarios();
                            $('#divSucursales').css('pointer-events', 'visible');
                            $('#btnGuardar').css('pointer-events', 'visible');
                            $('#btnDescartar').css('pointer-events', 'visible');
                            $('#loading-spinner').hide();
                            $('#blockScreen').hide();
                            this._pantallaServicio.ocultarSpinner();
                            $('#btnGuardar').removeClass('loading');
                        }
                    } else {
                        this.validPestañaDireccion();
                        $('#divSucursales').css('pointer-events', 'visible');
                        $('#btnGuardar').css('pointer-events', 'visible');
                        $('#btnDescartar').css('pointer-events', 'visible');
                        $('#loading-spinner').hide();
                        $('#blockScreen').hide();
                        this._pantallaServicio.ocultarSpinner();
                        $('#btnGuardar').removeClass('loading');
                    }
                } else {
                    this.validPestañaDatosGenerales();
                    $('#divSucursales').css('pointer-events', 'visible');
                    $('#btnGuardar').css('pointer-events', 'visible');
                    $('#btnDescartar').css('pointer-events', 'visible');
                    $('#loading-spinner').hide();
                    $('#blockScreen').hide();
                    this._pantallaServicio.ocultarSpinner();
                    $('#btnGuardar').removeClass('loading');
                }
            } else {
                $('#btnGuardar').removeClass('loading');
                if (idSucursal === 'agenda') {
                    $('#loading-spinner').hide();
                    $('#blockScreen').hide();
                    this._pantallaServicio.ocultarSpinner();
                    this.validDescartar = true;
                    this._router.navigate(['/agenda']);
                }
            }
        } else {
            this.accion = 'Actualizar';
            this.accionBoton();
        }
    }

    guardarSucursal(idSucursal?: any, importarServicios?: any) {
        this._pantallaServicio.mostrarSpinner();
        this.guardar = true;
        this.guardarHorariosLaboral();
        this.guardarHorariosDescansos();
        let params: any = {};
        //Guardar Logo
        if (this.sucursal.imagenRecortada != '' || this.sucursal.imagenSinRecortar != '') {
            if (!this.guardarSinRecortar) {
                params.codigoLogo = this.sucursal.imagenRecortada;
            } else {
                params.codigoLogo = this.sucursal.imagenSinRecortar;
            }
            params.tipoContenidoLogo = this.sucursal.tipoContenidoLogo;
        } else {
            params.tipoContenidoLogo = '';
            params.codigoLogo = '';
        }

        //Guardar Fotos
        params.tipoContenidoFotos = this.sucursal.tipoContenidoFoto.slice();
        params.codigoFotos = this.sucursal.foto.filter((e: any) => e !== null).slice();

        //Guardar Sucursal
        params.nombre = this.sucursal.nombre.replace(/</g, '&lt;');
        params.latitud = this.sucursal.lat;
        params.longitud = this.sucursal.lon;
        params.email = this.sucursal.email.replace(/</g, '&lt;');
        params.calle = this.sucursal.calle.replace(/</g, '&lt;');
        if (this.sucursal.entreCalles != '' && this.sucursal.entreCalles != null) {
            params.entreCalles = this.sucursal.entreCalles.replace(/</g, '&lt;');
        } 
        else 
            params.entreCalles = '';

        params.numero = this.sucursal.numero.replace(/</g, '&lt;');
        if (this.sucursal.numeroInterior != '' && this.sucursal.numeroInterior != null) {
            params.numeroInterior = this.sucursal.numeroInterior.replace(
                /</g,
                '&lt;'
            );
        } else params.numeroInterior = '';
        params.colonia = this.sucursal.colonia.replace(/</g, '&lt;');
        params.codigoPostal = this.sucursal.codigoPostal.replace(/</g, '&lt;');
        params.telefono = this.sucursal.telefono;
        if (this.sucursal.telefono2 != '' && this.sucursal.telefono2 != null) {
            params.telefono2 = this.sucursal.telefono2;
        } else params.telefono2 = '';
        params.idCiudad = this.sucursal.ciudad;
        if (this.sucursal.facebook != '' && this.sucursal.facebook != null) {
            params.facebook = this.sucursal.facebook.replace(/</g, '&lt;');
        } else params.facebook = '';
        if (this.sucursal.twitter != '' && this.sucursal.twitter != null) {
            params.twitter = this.sucursal.twitter.replace(/</g, '&lt;');
        } else params.twitter = '';
        if (this.sucursal.instagram != '' && this.sucursal.instagram != null) {
            params.instagram = this.sucursal.instagram.replace(/</g, '&lt;');
        } else params.instagram = '';

        params.idIdioma = this.sucursal.idioma;

        if (this.sucursal.paginaWeb != '' && this.sucursal.paginaWeb != null) {
            params.paginaWeb = this.sucursal.paginaWeb.replace(/</g, '&lt;');
        } else params.paginaWeb = '';

        //Guardar Sucursal Categoria
        params.idCategoria = this.sucursal.categorias.slice();

        //Guardar Sucursal Subcategoria
        params.idSubcategoria = this.sucursal.subcategoria.slice();

        //Guardar Horarios Laborales
        params.horaInicio = this.sucursal.horarioLaboralInicio.slice();
        params.horaFin = this.sucursal.horarioLaboralFin.slice();
        params.esLaboral = this.sucursal.laboral.slice();

        //Guardar Horarios Descansos
        params.descansoDia = this.sucursal.descansoDia.slice();
        params.descansoHoraInicio = this.sucursal.descansoHoraInicio.slice();
        params.descansoHoraFin = this.sucursal.descansoHoraFin.slice();

        //Confirmacion para importar los servicios
        params.importarServicios = importarServicios;

        this._backService.HttpPost('catalogos/Sucursal/agregarSucursal', {}, params).subscribe(
                (response) => {
                    this.sucursal.idSucursal = eval(response);
                    // this.consultarSucursal(idSucursal);
                    this.validPestañaDatosGenerales();

                    this.sucursal.dataSucursales.push({
                        idSucursal: this.sucursal.idSucursal,
                        codigoLogo: !this.guardarSinRecortar
                            ? this.sucursal.imagenRecortada
                            : this.sucursal.imagenSinRecortar,
                        nombre: this.sucursal.nombre,
                    });

                    this.cargarSucursal(this.sucursal.idSucursal, 'nuevo');
                    $('#btnGuardar').css('pointer-events', 'visible');
                    $('#btnDescartar').css('pointer-events', 'visible');
                },
                (error) => {
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

    actualizarSucursal(idSucursal?: any) {
        this.guardar = true;
        $('#btnNuevo').css('pointer-events', 'none');
        if (!this.validLogo || !this.validFoto) {
            $('#txtImagen').removeClass('errorCampo');
            this.msgImagen = '';
            this.validLogo = true;
            this.validFoto = true;
            this.msgLogo = '';
            this.msgFoto = '';
        }

        if (idSucursal === 'changeState') {
            this.validDescartar = true;
        }
        // JNINO - SE COMENTAN ESTAS LINEA
        // this.varAux = this._pantallaServicio.idSucursal;
        // this._pantallaServicio.idSucursal = "";

        this.actualizadoValidado = false;
        this.msgHorariosLaboral = '';
        this.validarCamposRequeridosDatosGenerales();
        this.validarCamposRequeridosDireccion();
        this.validarCamposRequeridosHorarios();
        if (this.validTabDatosGenerales) {
            if (this.contRequeridosDireccion === 0) {
                if (this.contRequeridosHorarios === 0) {
                    this.validarRangoHoras();
                    if (this.validLunes && this.validMartes && this.validMiercoles && this.validJueves && this.validViernes && this.validSabado && this.validDomingo) {
                        this.aceptarDescansos();
                        if (this.sucursal.DescansosValidados) {
                            if (this.sucursal.lunes || this.sucursal.martes || this.sucursal.miercoles || this.sucursal.jueves || this.sucursal.viernes || this.sucursal.sabado || this.sucursal.domingo) {
                                this.actualizadoValidado = true;
                                let params: any = {};

                                this.guardarHorariosLaboral();
                                this.guardarHorariosDescansos();

                                //Logo
                                params.cargoLogo = this.sucursal.cargoLogo;
                                if (this.sucursal.cargoLogo) {
                                    if (this.sucursal.idLogo !== null) {
                                        params.idLogo = this.sucursal.idLogo;
                                    } else {
                                        params.idLogo = '';
                                    }
                                    if (this.sucursal.imagenRecortada !== '' || this.sucursal.imagenSinRecortar !== '') {
                                        if (!this.guardarSinRecortar) {
                                            params.codigoLogo = this.sucursal.imagenRecortada;
                                        } else {
                                            params.codigoLogo = this.sucursal.imagenSinRecortar;
                                        }
                                        params.tipoContenidoLogo = this.sucursal.tipoContenidoLogo;
                                    } else {
                                        params.tipoContenidoLogo = '';
                                        params.codigoLogo = '';
                                    }
                                } else {
                                    if (this.sucursal.idLogo !== null) {
                                        params.idLogo = this.sucursal.idLogo;
                                    } else {
                                        params.idLogo = '';
                                    }
                                    params.codigoLogo = '';
                                    params.tipoContenidoLogo = '';
                                }
                                //Fotos
                                params.cargoFoto = this.sucursal.cargoFoto;
                                if (this.sucursal.cargoFoto) {
                                    params.idFotos = this.sucursal.idImagenes.slice();
                                    params.tipoContenidoFotos = this.sucursal.tipoContenidoFoto.slice();
                                    params.codigoFotos = this.sucursal.foto.filter((e: any) => e !== null).slice();
                                } else {
                                    params.idFotos = [];
                                    params.tipoContenidoFotos = [];
                                    params.codigoFotos = [];
                                }

                                //Sucursal-------------------
                                params.idSucursal = this.sucursal.idSucursal;
                                params.nombre = this.sucursal.nombre.replace(/</g, '&lt;');
                                params.latitud = this.sucursal.lat;
                                params.longitud = this.sucursal.lon;
                                params.email = this.sucursal.email.replace(/</g, '&lt;');
                                params.calle = this.sucursal.calle.replace(/</g, '&lt;');
                                if (this.sucursal.entreCalles !== '' && this.sucursal.entreCalles !== null) {
                                    params.entreCalles = this.sucursal.entreCalles.replace(/</g,'&lt;');
                                }
                                else
                                    params.entreCalles = '';
                                
                                params.numero = this.sucursal.numero.replace(/</g, '&lt;');
                                if (this.sucursal.numeroInterior !== '' && this.sucursal.numeroInterior !== null) {
                                    params.numeroInterior = this.sucursal.numeroInterior.replace(/</g,'&lt;');
                                }
                                else
                                    params.numeroInterior = '';

                                params.colonia = this.sucursal.colonia.replace(/</g, '&lt;');
                                params.codigoPostal = this.sucursal.codigoPostal.replace(/</g, '&lt;');
                                params.telefono = this.sucursal.telefono;
                                if (this.sucursal.telefono2 !== '' && this.sucursal.telefono2 !== null) {
                                    params.telefono2 = this.sucursal.telefono2;
                                }
                                else
                                    params.telefono2 = '';

                                params.idCiudad = this.sucursal.ciudad;
                                if (this.sucursal.facebook !== '' && this.sucursal.facebook !== null) {
                                    params.facebook = this.sucursal.facebook.replace(/</g,'&lt;');
                                }
                                else
                                    params.facebook = '';

                                if (this.sucursal.twitter !== '' && this.sucursal.twitter !== null) {
                                    params.twitter = this.sucursal.twitter.replace(/</g, '&lt;');
                                }
                                else
                                    params.twitter = '';

                                if (this.sucursal.instagram !== '' && this.sucursal.instagram !== null) {
                                    params.instagram = this.sucursal.instagram.replace(/</g, '&lt;');
                                }
                                else params.instagram = '';

                                params.idIdioma = this.sucursal.idioma;

                                if (this.sucursal.paginaWeb !== '' && this.sucursal.paginaWeb !== null) {
                                    params.paginaWeb = this.sucursal.paginaWeb.replace(/</g,'&lt;');
                                }
                                else
                                    params.paginaWeb = '';

                                params.estaActiva = this.sucursal.estaActiva ? 1 : 0;

                                //Categoria
                                params.idSucursalCategoria = this.sucursal.sucursalCategorias.slice();
                                params.idCategoria = this.sucursal.categorias.slice();

                                //Subcategoria
                                params.idSucursalSubcategoria = this.sucursal.sucursalSubcategoria.slice();
                                params.idSubcategoria = this.sucursal.subcategoria.slice();

                                //Guardar Horarios Laborales
                                params.horaInicio = this.sucursal.horarioLaboralInicio.slice();
                                params.horaFin = this.sucursal.horarioLaboralFin.slice();
                                params.esLaboral = this.sucursal.laboral.slice();

                                //Guardar Horarios Descansos
                                params.descansoDia = this.sucursal.descansoDia.slice();
                                params.descansoHoraInicio = this.sucursal.descansoHoraInicio.slice();
                                params.descansoHoraFin = this.sucursal.descansoHoraFin.slice();

                                this._backService.HttpPost('catalogos/Sucursal/actualizarSucursal', {}, params).subscribe(
                                    (response) => {
                                        // JNINO - ACTUALIZACIÓN EN SUCURSAL DE SESIÓN
                                        if (this._pantallaServicio.idSucursal === this.sucursal.idSucursal) {
                                            if(this._pantallaServicio.idIdioma != this.sucursal.idioma){
                                                // Se tiene que actualizar el token para ponerle el nuevo idioma y recargar pantalla
                                                var paramsRegreshToken: any = {};
                                                paramsRegreshToken.idIdioma = this.sucursal.idioma;
                                                this._backService.HttpPost('Login/RefreshTokenCambioIdioma', {}, paramsRegreshToken).subscribe(
                                                    (response) => {
                                                        const dataTemp = eval(response);
                                                        this._authService.CargarSession(dataTemp.data);
                                                        //this._pantallaServicio.ObtenerSession(); // Esto no es necesario
                                                        window.location.reload();
                                                    },
                                                    (error) => {
                                                        this._pantallaServicio.ocultarSpinner();
                                                    }
                                                );
                                            }
                                            else {
                                                this._pantallaServicio.datos_pantalla.nSucursal = this.sucursal.nombre;
                                                if (this._pantallaServicio.datos_pantalla.img !== this.sucursal.imagenRecortada) {
                                                    if (this.sucursal.imagenRecortada !== '') {
                                                        this._pantallaServicio.datos_pantalla.img = this.sucursal.imagenRecortada;
                                                    } else {
                                                        this._pantallaServicio.datos_pantalla.img = '../../../../assets/images/migracion/Imagen-Foto-300x300.png';
                                                    }
                                                }

                                                this._pantallaServicio.ConsultarSucursales();

                                                for (let i = 0; i < this.sucursal.dataSucursales.length; i++) {
                                                    if (this.sucursal.dataSucursales[i].idSucursal === this.sucursal.idSucursal) {
                                                        this.sucursal.dataSucursales[i].nombre = this.sucursal.nombre;
    
                                                        if (!this.guardarSinRecortar) {
                                                            this.sucursal.dataSucursales[i].codigoLogo = JSON.parse(JSON.stringify(this.sucursal.imagenRecortada));
                                                            (document.getElementById('img' + this.sucursal.dataSucursales[i].idSucursal) as any).src = this.sucursal.imagenRecortada != '' ? this.sucursal.imagenRecortada : '../../../../assets/images/system/logoSucursal.png';
                                                        } else {
                                                            this.sucursal.dataSucursales[i].codigoLogo = JSON.parse(JSON.stringify(this.sucursal.imagenSinRecortar));
                                                            (document.getElementById('img' + this.sucursal.dataSucursales[i].idSucursal) as any).src = this.sucursal.imagenSinRecortar != '' ? this.sucursal.imagenSinRecortar : '../../../../assets/images/system/logoSucursal.png';
                                                        }
                                                        break;
                                                    }
                                                }
                                                this.cargarSucursal(this.sucursal.idSucursal);
                                            }
                                        }
                                        else {
                                            // JNINO - CAMBIO EN OTRA SUCURSAL QUE NO ES LA DE SESIÓN
                                            this._pantallaServicio.ConsultarSucursales();
                                            
                                            for (let i = 0; i < this.sucursal.dataSucursales.length; i++) {
                                                if (this.sucursal.dataSucursales[i].idSucursal === this.sucursal.idSucursal) {
                                                    this.sucursal.dataSucursales[i].nombre = this.sucursal.nombre;

                                                    if (!this.guardarSinRecortar) {
                                                        this.sucursal.dataSucursales[i].codigoLogo = JSON.parse(JSON.stringify(this.sucursal.imagenRecortada));
                                                        (document.getElementById('img' + this.sucursal.dataSucursales[i].idSucursal) as any).src = this.sucursal.imagenRecortada != '' ? this.sucursal.imagenRecortada : '../../../../assets/images/system/logoSucursal.png';
                                                    } else {
                                                        this.sucursal.dataSucursales[i].codigoLogo = JSON.parse(JSON.stringify(this.sucursal.imagenSinRecortar));
                                                        (document.getElementById('img' + this.sucursal.dataSucursales[i].idSucursal) as any).src = this.sucursal.imagenSinRecortar != '' ? this.sucursal.imagenSinRecortar : '../../../../assets/images/system/logoSucursal.png';
                                                    }
                                                    break;
                                                }
                                            }
                                            this.cargarSucursal(this.sucursal.idSucursal);
                                        }
                                    },
                                    (error) => {
                                        if (error === 'SinSesion' || error === 'SesionCaducada') {
                                            if (error === 'SinSesion') {
                                                this._toaster.error(
                                                    this.sessionTraslate.favorIniciarSesion
                                                );
                                            }
                                            if (error === 'SesionCaducada') {
                                                this._toaster.error(
                                                    this.sessionTraslate.sesionCaducada
                                                );
                                            }
                                            this._router.navigate(['/login']);
                                        }
                                    }
                                );
                            } else {
                                this.validPestañaHorarios();
                                this.msgHorariosLaboral =
                                    this.sucursalTranslate.seleccioneHorario;
                                $('#divSucursales').css('pointer-events', 'visible');
                                $('#btnNuevo').css('pointer-events', 'visible');
                                $('#btnGuardar').css('pointer-events', 'visible');
                                $('#btnDescartar').css('pointer-events', 'visible');
                                $('#loading-spinner').hide();
                                $('#blockScreen').hide();
                                this._pantallaServicio.ocultarSpinner();
                                this.rootScope_stopChange = true;
                                $('#btnGuardar').removeClass('loading');
                                //this._pantallaServicio.ConsultarSucursales();
                            }
                        } else {
                            this.validPestañaDescansos();
                            $('#divSucursales').css('pointer-events', 'visible');
                            $('#btnNuevo').css('pointer-events', 'visible');
                            $('#btnGuardar').css('pointer-events', 'visible');
                            $('#btnDescartar').css('pointer-events', 'visible');
                            $('#loading-spinner').hide();
                            $('#blockScreen').hide();
                            this._pantallaServicio.ocultarSpinner();
                            this.rootScope_stopChange = true;
                            $('#btnGuardar').removeClass('loading');
                            //this._pantallaServicio.ConsultarSucursales();
                        }
                    } else {
                        this.validPestañaHorarios();
                        $('#divSucursales').css('pointer-events', 'visible');
                        $('#btnNuevo').css('pointer-events', 'visible');
                        $('#btnGuardar').css('pointer-events', 'visible');
                        $('#btnDescartar').css('pointer-events', 'visible');
                        $('#loading-spinner').hide();
                        $('#blockScreen').hide();
                        this._pantallaServicio.ocultarSpinner();
                        this.rootScope_stopChange = true;
                        $('#btnGuardar').removeClass('loading');
                        //this._pantallaServicio.ConsultarSucursales();
                    }
                } else {
                    this.validPestañaHorarios();
                    $('#divSucursales').css('pointer-events', 'visible');
                    $('#btnNuevo').css('pointer-events', 'visible');
                    $('#btnGuardar').css('pointer-events', 'visible');
                    $('#btnDescartar').css('pointer-events', 'visible');
                    $('#loading-spinner').hide();
                    $('#blockScreen').hide();
                    this._pantallaServicio.ocultarSpinner();
                    this.rootScope_stopChange = true;
                    $('#btnGuardar').removeClass('loading');
                    //this._pantallaServicio.ConsultarSucursales();
                }
            } else {
                this.validPestañaDireccion();
                $('#divSucursales').css('pointer-events', 'visible');
                $('#btnNuevo').css('pointer-events', 'visible');
                $('#btnGuardar').css('pointer-events', 'visible');
                $('#btnDescartar').css('pointer-events', 'visible');
                $('#loading-spinner').hide();
                $('#blockScreen').hide();
                this._pantallaServicio.ocultarSpinner();
                this.rootScope_stopChange = true;
                $('#btnGuardar').removeClass('loading');
                //this._pantallaServicio.ConsultarSucursales();
            }
        } else {
            this.validPestañaDatosGenerales();
            $('#divSucursales').css('pointer-events', 'visible');
            $('#btnNuevo').css('pointer-events', 'visible');
            $('#btnGuardar').css('pointer-events', 'visible');
            $('#btnDescartar').css('pointer-events', 'visible');
            $('#loading-spinner').hide();
            $('#blockScreen').hide();
            this._pantallaServicio.ocultarSpinner();
            this.rootScope_stopChange = true;
            $('#btnGuardar').removeClass('loading');
            //this._pantallaServicio.ConsultarSucursales();
        }
    }

    //Validacion si el servicio a borrar tiene citas programadas
    validarCitasDetalle(idSucursal: any) {
        this.validCitas = false;
        let params: any = {};
        params.idSucursal = idSucursal;
        this._backService
            .HttpPost('catalogos/Sucursal/validarCitasDetalle', {}, params)
            .subscribe(
                (response) => {
                    this.dataCitasDetalle = eval(response);
                    this.confirmarBorrarSucursal(
                        idSucursal,
                        this.dataCitasDetalle.length
                    );
                },
                (error) => {
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

    confirmarBorrarSucursal(idSucursal: any, citasAgendadas: any) {
        this.sucursal.idSucursalaBorrar = idSucursal;
        this.sucursal.citasAgendadas = citasAgendadas;

        if (idSucursal != this.rootScope_idSucursal) {
            if (this.sucursal.dataSucursales.length === 1) {
                $('#modalAlertBorrado .modal-body').html('<span style="font-weight: 400;">' + this.sucursalTranslate.debeTenerAlmenos + '</span>');
                this.modales.modalAlertBorrado.show();
            } else if (citasAgendadas === 0) {
                $('#modalBorrarConfirm .modal-body').html('<span style="font-weight: 400;">' + this.sucursalTranslate.deseaBorrar + '</span>');
                this.modales.modalBorrarConfirm.show();
            } else {
                $('#modalBorrarConfirm .modal-body').html('<span style="font-weight: 400;">' + this.sucursalTranslate.estaSucursalTiene + '</span>');
                this.modales.modalBorrarConfirm.show();
            }
        } else {
            $('#modalAlertBorrado .modal-body').html('<span style="font-weight: 400;">' + this.sucursalTranslate.sucursalUtilizada + '</span>');
            this.modales.modalAlertBorrado.show();
        }
    }

    validarSucursalBase(idSucursal: any) {
        let params: any = {};
        this._backService
            .HttpPost('catalogos/Sucursal/validarSucursalBase', {}, params)
            .subscribe(
                (response) => {
                    this.sucursal.idSucursalBase = eval(response);
                    if (this.sucursal.idSucursalBase != idSucursal) {
                        this.validarCitasDetalle(idSucursal);
                    } else {
                        $('#modalAlertBorrado .modal-body').html(
                            '<span style="font-weight: 400;">' +
                            this.sucursalTranslate.noBorrarBase +
                            '</span>'
                        );
                        this.modales.modalAlertBorrado.show();
                    }
                },
                (error) => {
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

    borrarSucursal() {
        let params: any = {};
        $('#btnNuevo').css('pointer-events', 'none');
        params.idSucursal = this.sucursal.idSucursalaBorrar;
        this._backService
            .HttpPost('catalogos/Sucursal/borrarSucursal', {}, params)
            .subscribe(
                (response) => {
                    this.validBorrar = eval(response);
                    let index = 0;
                    $('#blockScreen').show();
                    this._pantallaServicio.mostrarSpinner();
                    if (this.validBorrar === 1) {
                        if (this.accion === 'Actualizar') {
                            for (let i = 0; i < this.sucursal.dataSucursales.length; i++) {
                                if (
                                    this.sucursal.dataSucursales[i].idSucursal ===
                                    this.sucursal.idSucursalaBorrar
                                ) {
                                    index = i;
                                    break;
                                }
                            }

                            this.sucursal.dataSucursales.splice(index, 1);

                            if (
                                this.sucursal.idSucursalaBorrar === this.sucursal.idSucursal
                            ) {
                                this.primeraCarga = true;
                                this.validPestañaDatosGenerales();
                                this.sucursal.idSucursal =
                                    this.sucursal.dataSucursales[0].idSucursal;
                            }
                            this.cargarSucursal(this.sucursal.idSucursal);
                            // this.consultarSucursal("Borrar");
                        }
                    }
                },
                (error) => {
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

    guardarHorariosLaboral() {
        this.sucursal.horarioLaboralInicio = [];
        this.sucursal.horarioLaboralFin = [];
        this.sucursal.laboral = [];

        this.sucursal.horarioLaboralInicio[0] = this.sucursal.horaInicioLunes;
        this.sucursal.horarioLaboralFin[0] = this.sucursal.horaFinLunes;
        this.sucursal.laboral[0] = this.sucursal.lunes ? 1 : 0;

        this.sucursal.horarioLaboralInicio[1] = this.sucursal.horaInicioMartes;
        this.sucursal.horarioLaboralFin[1] = this.sucursal.horaFinMartes;
        this.sucursal.laboral[1] = this.sucursal.martes ? 1 : 0;

        this.sucursal.horarioLaboralInicio[2] = this.sucursal.horaInicioMiercoles;
        this.sucursal.horarioLaboralFin[2] = this.sucursal.horaFinMiercoles;
        this.sucursal.laboral[2] = this.sucursal.miercoles ? 1 : 0;

        this.sucursal.horarioLaboralInicio[3] = this.sucursal.horaInicioJueves;
        this.sucursal.horarioLaboralFin[3] = this.sucursal.horaFinJueves;
        this.sucursal.laboral[3] = this.sucursal.jueves ? 1 : 0;

        this.sucursal.horarioLaboralInicio[4] = this.sucursal.horaInicioViernes;
        this.sucursal.horarioLaboralFin[4] = this.sucursal.horaFinViernes;
        this.sucursal.laboral[4] = this.sucursal.viernes ? 1 : 0;

        this.sucursal.horarioLaboralInicio[5] = this.sucursal.horaInicioSabado;
        this.sucursal.horarioLaboralFin[5] = this.sucursal.horaFinSabado;
        this.sucursal.laboral[5] = this.sucursal.sabado ? 1 : 0;

        this.sucursal.horarioLaboralInicio[6] = this.sucursal.horaInicioDomingo;
        this.sucursal.horarioLaboralFin[6] = this.sucursal.horaFinDomingo;
        this.sucursal.laboral[6] = this.sucursal.domingo ? 1 : 0;
    }

    guardarHorariosDescansos() {
        this.sucursal.descansoDia = [];
        this.sucursal.descansoHoraInicio = [];
        this.sucursal.descansoHoraFin = [];
        let i = 0;

        for (let j = 0; j < this.sucursal.objetoLunes.length; j++) {
            this.sucursal.descansoDia[i] = 1;
            this.sucursal.descansoHoraInicio[i] =
                this.sucursal.objetoLunes[j].horaInicio;
            this.sucursal.descansoHoraFin[i] = this.sucursal.objetoLunes[j].horaFin;
            i++;
        }

        for (let j = 0; j < this.sucursal.objetoMartes.length; j++) {
            this.sucursal.descansoDia[i] = 2;
            this.sucursal.descansoHoraInicio[i] =
                this.sucursal.objetoMartes[j].horaInicio;
            this.sucursal.descansoHoraFin[i] = this.sucursal.objetoMartes[j].horaFin;
            i++;
        }

        for (let j = 0; j < this.sucursal.objetoMiercoles.length; j++) {
            this.sucursal.descansoDia[i] = 3;
            this.sucursal.descansoHoraInicio[i] =
                this.sucursal.objetoMiercoles[j].horaInicio;
            this.sucursal.descansoHoraFin[i] =
                this.sucursal.objetoMiercoles[j].horaFin;
            i++;
        }

        for (let j = 0; j < this.sucursal.objetoJueves.length; j++) {
            this.sucursal.descansoDia[i] = 4;
            this.sucursal.descansoHoraInicio[i] =
                this.sucursal.objetoJueves[j].horaInicio;
            this.sucursal.descansoHoraFin[i] = this.sucursal.objetoJueves[j].horaFin;
            i++;
        }

        for (let j = 0; j < this.sucursal.objetoViernes.length; j++) {
            this.sucursal.descansoDia[i] = 5;
            this.sucursal.descansoHoraInicio[i] =
                this.sucursal.objetoViernes[j].horaInicio;
            this.sucursal.descansoHoraFin[i] = this.sucursal.objetoViernes[j].horaFin;
            i++;
        }

        for (let j = 0; j < this.sucursal.objetoSabado.length; j++) {
            this.sucursal.descansoDia[i] = 6;
            this.sucursal.descansoHoraInicio[i] =
                this.sucursal.objetoSabado[j].horaInicio;
            this.sucursal.descansoHoraFin[i] = this.sucursal.objetoSabado[j].horaFin;
            i++;
        }

        for (let j = 0; j < this.sucursal.objetoDomingo.length; j++) {
            this.sucursal.descansoDia[i] = 7;
            this.sucursal.descansoHoraInicio[i] =
                this.sucursal.objetoDomingo[j].horaInicio;
            this.sucursal.descansoHoraFin[i] = this.sucursal.objetoDomingo[j].horaFin;
            i++;
        }
    }

    validarRangoHoras() {
        let validRangos: any = null;
        this.rangoHoras(this.sucursal.horaInicioLunes, this.sucursal.horaFinLunes);
        validRangos = this.validRangos;
        this.validLunes = validRangos;

        this.msgLunes = this.msgHora;
        if (this.msgLunes != '') {
            $('#txtHoraInicioLunes').addClass('errorCampo');
        } else {
            $('#txtHoraInicioLunes').removeClass('errorCampo');
        }

        this.rangoHoras(
            this.sucursal.horaInicioMartes,
            this.sucursal.horaFinMartes
        );
        validRangos = this.validRangos;
        this.validMartes = validRangos;

        this.msgMartes = this.msgHora;
        if (this.msgMartes != '') {
            $('#txtHoraInicioMartes').addClass('errorCampo');
        } else {
            $('#txtHoraInicioMartes').removeClass('errorCampo');
        }

        this.rangoHoras(
            this.sucursal.horaInicioMiercoles,
            this.sucursal.horaFinMiercoles
        );
        validRangos = this.validRangos;
        this.validMiercoles = validRangos;

        this.msgMiercoles = this.msgHora;
        if (this.msgMiercoles != '') {
            $('#txtHoraInicioMiercoles').addClass('errorCampo');
        } else {
            $('#txtHoraInicioMiercoles').removeClass('errorCampo');
        }

        this.rangoHoras(
            this.sucursal.horaInicioJueves,
            this.sucursal.horaFinJueves
        );
        validRangos = this.validRangos;
        this.validJueves = validRangos;

        this.msgJueves = this.msgHora;
        if (this.msgJueves != '') {
            $('#txtHoraInicioJueves').addClass('errorCampo');
        } else {
            $('#txtHoraInicioJueves').removeClass('errorCampo');
        }

        this.rangoHoras(
            this.sucursal.horaInicioViernes,
            this.sucursal.horaFinViernes
        );
        validRangos = this.validRangos;
        this.validViernes = validRangos;

        this.msgViernes = this.msgHora;
        if (this.msgViernes != '') {
            $('#txtHoraInicioViernes').addClass('errorCampo');
        } else {
            $('#txtHoraInicioViernes').removeClass('errorCampo');
        }

        this.rangoHoras(
            this.sucursal.horaInicioSabado,
            this.sucursal.horaFinSabado
        );
        validRangos = this.validRangos;
        this.validSabado = validRangos;

        this.msgSabado = this.msgHora;
        if (this.msgSabado != '') {
            $('#txtHoraInicioSabado').addClass('errorCampo');
        } else {
            $('#txtHoraInicioSabado').removeClass('errorCampo');
        }

        this.rangoHoras(
            this.sucursal.horaInicioDomingo,
            this.sucursal.horaFinDomingo
        );
        validRangos = this.validRangos;
        this.validDomingo = validRangos;

        this.msgDomingo = this.msgHora;
        if (this.msgDomingo != '') {
            $('#txtHoraInicioDomingo').addClass('errorCampo');
        } else {
            $('#txtHoraInicioDomingo').removeClass('errorCampo');
        }
    }

    rangoHoras(horaInicio: any, horaFin: any) {
        this.validRangos = true;
        this.msgHora = '';
        if (horaInicio >= horaFin) {
            this.msgHora = this.sucursalTranslate.horaFinMayor;
            this.validRangos = false;
        }
    }

    cargarUbicacion() {
        // this.showMap = true;
        // let myOptions = {
        //   zoom: this.sucursal.zoom,
        //   center: new google.maps.LatLng(this.sucursal.lat, this.sucursal.lon),
        //   mapTypeId: google.maps.MapTypeId.ROADMAP,
        //   mapTypeControlOptions: {
        //     mapTypeIds: [
        //       google.maps.MapTypeId.ROADMAP,
        //       google.maps.MapTypeId.HYBRID,
        //       google.maps.MapTypeId.SATELLITE,
        //     ],
        //   },
        // };
        // setTimeout(() => {
        //   this.map = new google.maps.Map(
        //     document.getElementById('map_canvas'),
        //     myOptions
        //   );
        //   let geocoder = new google.maps.Geocoder();
        //   let infowindow = new google.maps.InfoWindow();
        //   geocodeLatLng(
        //     geocoder,
        //     this.map,
        //     new google.maps.LatLng(this.sucursal.lat, this.sucursal.lon)
        //   );
        // }, 2000);
    }

    geocodeLatLng(geocoder: any, map: any, position: any) {
        // geocoder.geocode({ location: position }, (results: any, status: any) => {
        //   if (status ==== google.maps.GeocoderStatus.OK) {
        //     //  placeMarker(position);
        //     $.each(results[0].address_components, () => {
        //       switch (this.types[0]) {
        //         case 'postal_code':
        //           this.codigoPostal = this.long_name;
        //           break;
        //         case 'route':
        //           this.calle = this.long_name;
        //           break;
        //         case 'administrative_area_level_1':
        //           this.estado = this.long_name;
        //           break;
        //         case 'locality':
        //           this.ciudad = this.long_name;
        //           break;
        //         case 'country':
        //           this.pais = this.long_name;
        //           break;
        //         case 'political':
        //           this.colonia = this.long_name;
        //           break;
        //       }
        //     });
        //     this.numero = results[0].address_components[0].long_name;
        //   } else {
        //     // window.alert('No results found');
        //   }
        //   this.definirDireccion();
        // });
    }

    definirDireccion() {
        this.establecida = true;
        this.sucursal.calle = this.calle;
        this.sucursal.numero = this.numero;
        this.sucursal.colonia = this.colonia;
        this.sucursal.codigoPostal = this.codigoPostal;
        this.sucursal.ciudad = '';
        $('#txtDireccion').removeClass('errorCampo');
        this.cargarPaisPorNombre();
        this.msgUbicacion = '';
        this.sucursal.direccion = '';
        $('#divSucursales').css('pointer-events', 'visible');
        $('#btnGuardar').css('pointer-events', 'visible');
        $('#btnDescartar').css('pointer-events', 'visible');
        $('#loading-spinner').hide();
        $('#blockScreen').hide();
        this._pantallaServicio.ocultarSpinner();
    }

    showPosition(position: any) {
        if (this.accion === 'Nuevo') {
            this.sucursal.lat = position.coords.latitude;
            this.sucursal.lon = position.coords.longitude;
            this.accuracy = position.coords.accuracy;
        }
    }

    showError(error: any) {
        switch (error.code) {
            case error.PERMISSION_DENIED:
                this.error = 'User denied the request for Geolocation.';
                break;
            case error.POSITION_UNAVAILABLE:
                this.error = 'Location information is unavailable.';
                break;
            case error.TIMEOUT:
                this.error = 'The request to get user location timed out.';
                break;
            case error.UNKNOWN_ERROR:
                this.error = 'An unknown error occurred.';
                break;
        }
        //this.$apply();
    }

    getLocation() {
        if (navigator.geolocation) {
            if (
                location.protocol != 'https:' &&
                (this.sucursal.lat === '' || this.sucursal.lat === undefined) &&
                (this.sucursal.lon === '' || this.sucursal.lon === undefined)
            ) {
                this.sucursal.lat = '21.016060';
                this.sucursal.lon = '-101.253419';
                this.sucursal.zoom = 5;
                this.consultaPaises();
                this.establecida = false;
            } else {
                navigator.geolocation.getCurrentPosition(
                    this.showPosition,
                    this.showError
                );
                this.sucursal.zoom = 15;
                if (this.accion === 'Nuevo') {
                    this.establecida = true;
                    this.cargarUbicacion();
                }
            }
        } else {
            $('#divSucursales').css('pointer-events', 'visible');
            $('#btnGuardar').css('pointer-events', 'visible');
            $('#loading-spinner').hide();
            $('#blockScreen').hide();
            this._pantallaServicio.ocultarSpinner();
            this.error = this.sucursalTranslate.geolocalizacion;
        }
    }

    descartarUbicacion() {
        this.modales.modalConfirmUbicacion.hide();
        this.aux = true;
        this.modales.establecerUbicacion.hide();
        this.msgDireccion = '';
        this.msgUbicacion = '';
        $('#txtDireccion').removeClass('errorCampo');
        this.sucursal.direccion = '';
        this.cerrada = true;
        this.sucursal.lat = this.lat;
        this.sucursal.lon = this.lon;
        this.showMap = false;
    }

    modalConfirmUbicacion() {
        if (
            this.sucursal.lat != this.lat ||
            this.sucursal.lon != this.lon ||
            this.sucursal.direccion != ''
        ) {
            $('#modalConfirmUbicacion .modal-body').html(
                '<span class="title">' +
                this.sucursalTranslate.deseaDescartar +
                '</span>'
            );
            this.modales.modalConfirmUbicacion.show();
        } else {
            this.msgUbicacion = '';
            $('#txtDireccion').removeClass('errorCampo');
            this.sucursal.direccion = '';
            this.modales.establecerUbicacion.hide();
        }
    }

    cerrarModalUbicacion() {
        this.modales.modalConfirmUbicacion.hide();
    }

    establecerUbicacion() {
        //Funcion que establece la longitud y latitud de la posicion escogida y los pone en los txt del modal de agergar Cliente
        // if (
        //   this.sucursal.lat === '' ||
        //   this.sucursal.lat === undefined ||
        //   this.sucursal.lon === '' ||
        //   this.sucursal.lon === undefined
        // ) {
        //   this.sucursal.lat = '21.016060';
        //   this.sucursal.lon = '-101.253419';
        //   this.sucursal.zoom = 5;
        // } else {
        //   if (
        //     this.sucursal.lat != '21.016060' &&
        //     this.sucursal.lon != '-101.253419'
        //   ) {
        //     this.sucursal.zoom = 15;
        //   }
        // }
        // if (this.rootScope_mobileBrowser) {
        //   if (window.innerWidth > 230) {
        //     $('#establecerUbicacion').css('width', window.innerWidth + 'px');
        //   } else {
        //     $('#establecerUbicacion').css('width', '230px');
        //   }
        //   $('body').scrollLeft(0);
        // }
        // $('#establecerUbicacion').modal({
        //   backdrop: 'static',
        //   keyboard: false,
        // });
        // //$('body').css('overflow', 'hidden');
        // this.showMap = true;
        // let myOptions = {
        //   zoom: this.sucursal.zoom,
        //   center: new google.maps.LatLng(this.sucursal.lat, this.sucursal.lon),
        //   mapTypeId: google.maps.MapTypeId.ROADMAP,
        //   mapTypeControlOptions: {
        //     mapTypeIds: [
        //       google.maps.MapTypeId.ROADMAP,
        //       google.maps.MapTypeId.HYBRID,
        //       google.maps.MapTypeId.SATELLITE,
        //     ],
        //   },
        // };
        // setTimeout(function () {
        //   this.map = new google.maps.Map(
        //     document.getElementById('map_canvas'),
        //     myOptions
        //   );
        //   let geocoder = new google.maps.Geocoder();
        //   let infowindow = new google.maps.InfoWindow();
        //   this.lat = angular.copy(this.sucursal.lat);
        //   this.lon = angular.copy(this.sucursal.lon);
        //   if (this.sucursal.lat != undefined && this.sucursal.lon != undefined) {
        //     placeMarker(
        //       new google.maps.LatLng(this.sucursal.lat, this.sucursal.lon)
        //     );
        //     geocodeLatLng(
        //       geocoder,
        //       this.map,
        //       new google.maps.LatLng(this.sucursal.lat, this.sucursal.lon)
        //     );
        //   }
        //   $('#txtDireccion').keypress(function (e) {
        //     if (e.which === 13) {
        //       if (
        //         this.sucursal.direccion != undefined &&
        //         this.sucursal.direccion != ''
        //       ) {
        //         $('#txtDireccion').removeClass('errorCampo');
        //         this.msgUbicacion = '';
        //         this.sucursal.zoom = 15;
        //         this.map.zoom = 15;
        //         geocodeAddress(geocoder, this.map);
        //         this.map.setZoom(this.map.getZoom());
        //       } else {
        //         $('#txtDireccion').addClass('errorCampo');
        //       }
        //     }
        //   });
        //   (document.getElementById('btnBuscar') as any)!.addEventListener(
        //     'click',
        //     () => {
        //       if (
        //         this.sucursal.direccion != undefined &&
        //         this.sucursal.direccion != ''
        //       ) {
        //         $('#txtDireccion').removeClass('errorCampo');
        //         this.msgUbicacion = '';
        //         this.sucursal.zoom = 15;
        //         this.map.zoom = 15;
        //         geocodeAddress(geocoder, this.map);
        //         this.map.setZoom(this.map.getZoom());
        //       } else {
        //         $('#txtDireccion').addClass('errorCampo');
        //       }
        //     }
        //   );
        //   google.maps.event.addListener(this.map, 'click', function (event) {
        //     this.sucursal.lat = event.latLng.lat();
        //     this.sucursal.lon = event.latLng.lng();
        //     geocodeLatLng(geocoder, this.map, event.latLng);
        //     this.$digest();
        //   }); //Fin de funcion
        //   function placeMarker(location: any) {
        //     //Funcion para poner los marcadores
        //     if (this.sucursal.markersArray.length > 0) {
        //       deleteOverlays();
        //     }
        //     let marker = new google.maps.Marker({
        //       position: location,
        //       map: this.map,
        //     });
        //     //Agregamos el marcador a un arreglo de marcadores
        //     this.sucursal.markersArray.push(marker);
        //   } //Fin funcion
        //   function deleteOverlays() {
        //     //Funcion para eliminar los marcadores, se ejecuta al dar click sobre el map cuanod ya hay algun marcador puesto
        //     if (this.sucursal.markersArray) {
        //       for (i in this.sucursal.markersArray) {
        //         this.sucursal.markersArray[i].setMap(null);
        //       }
        //       this.sucursal.markersArray.length = 0;
        //     }
        //   } //Fin de funcion
        //   function geocodeAddress(geocoder: any, resultsMap: any) {
        //     let address = this.sucursal.direccion;
        //     geocoder.geocode({ address: address }, function (results, status) {
        //       if (status ==== google.maps.GeocoderStatus.OK) {
        //         $timeout(function () {
        //           $('#txtDireccion').removeClass('errorCampo');
        //           this.msgUbicacion = '';
        //         }, 50);
        //         resultsMap.setCenter(results[0].geometry.location);
        //         //this.sucursal.direccion = results[0].formatted_address;
        //         geocodeLatLng(geocoder, this.map, results[0].geometry.location);
        //         this.sucursal.lat = results[0].geometry.location.lat();
        //         this.sucursal.lon = results[0].geometry.location.lng();
        //         placeMarker(results[0].geometry.location);
        //       } else {
        //         //alert('Geocode no fue exitoso por la siguiente razon: ' + status);
        //         $timeout(function () {
        //           $('#txtDireccion').addClass('errorCampo');
        //           this.msgUbicacion = this.sucursalTranslate.noEncontroDireccion;
        //           this.mErrorMapa = true;
        //         }, 50);
        //       }
        //     });
        //   }
        //   function geocodeLatLng(geocoder: any, map: any, position: any) {
        //     geocoder.geocode(
        //       { location: position },
        //       (results: any, status: any) => {
        //         if (status ==== google.maps.GeocoderStatus.OK) {
        //           placeMarker(position);
        //           $.each(results[0].address_components, () => {
        //             switch (this.types[0]) {
        //               case 'postal_code':
        //                 this.codigoPostal = this.long_name;
        //                 break;
        //               case 'route':
        //                 this.calle = this.long_name;
        //                 break;
        //               case 'administrative_area_level_1':
        //                 this.estado = this.long_name;
        //                 break;
        //               case 'administrative_area_level_2':
        //                 this.ciudad = this.long_name;
        //                 break;
        //               case 'country':
        //                 this.pais = this.long_name;
        //                 break;
        //               case 'political':
        //                 this.colonia = this.long_name;
        //                 break;
        //             }
        //           });
        //           this.numero = results[0].address_components[0].long_name;
        //         } else {
        //           // window.alert('No results found');
        //         }
        //       }
        //     );
        //   }
        // }, 800);
    } //Fin funcion

    omitirAcentos(text: any) {
        let acentos = 'ÃÀÁÄÂÈÉËÊÌÍÏÎÒÓÖÔÙÚÜÛãàáäâèéëêìíïîòóöôùúüûÑñÇç';
        let original = 'AAAAAEEEEIIIIOOOOUUUUaaaaaeeeeiiiioooouuuunncc';
        for (let i = 0; i < acentos.length; i++) {
            text = text.replace(acentos.charAt(i), original.charAt(i));
        }
        return text;
    }

    cargarPaisPorNombre() {
        let params: any = {};
        params.nombre = this.pais;
        this._backService
            .HttpPost('catalogos/Pais/getPaisNombre', {}, params)
            .subscribe(
                (response) => {
                    this.sucursal.dataPaisSeleccionado = eval(response);
                    if (this.sucursal.dataPaisSeleccionado.length > 0) {
                        if (this.sucursal.dataPaisSeleccionado[0].idPais != undefined) {
                            this.sucursal.pais = this.sucursal.dataPaisSeleccionado[0].idPais;
                        } else {
                            this.sucursal.pais = '';
                            this.sucursal.estado = '';
                            this.sucursal.ciudad = '';
                        }
                    } else {
                        this.sucursal.pais = '';
                        this.sucursal.estado = '';
                        this.sucursal.ciudad = '';
                    }
                    this.cargarEstados();
                },
                (error) => {
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

    consultaCiudadesEnEstado() {
        if (this.dataEstado != '') {
            let params: any = {};
            params.idEstado = this.sucursal.estado;
            this._backService
                .HttpPost('catalogos/Ciudad/consultaCiudadesEnEstado', {}, params)
                .subscribe(
                    (response) => {
                        this.sucursal.dataCiudad = eval(response);
                    },
                    (error) => {
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
            this.sucursal.dataCiudad = '';
        }
    }

    cargarEstados() {
        this._backService
            .HttpPost('catalogos/Estado/consultaEstados', {}, {})
            .subscribe(
                (response) => {
                    this.dataEstado = eval(response);
                    for (let i = 0; i < this.dataEstado.length; i++) {
                        if (
                            this.omitirAcentos(this.estado).toLowerCase() ===
                            this.omitirAcentos(this.dataEstado[i].nombre).toLowerCase()
                        ) {
                            this.estadoSeleccionado = this.dataEstado[i].idEstado;
                            this.sucursal.estado = this.dataEstado[i].idEstado;
                            this.sucursal.pais = this.dataEstado[i].idPais;
                            this.consultaPaises();
                            this.consultaEstados();
                            this.consultaCiudadesEnEstado();
                            this.consultaCiudadPorEstadoYNombre();
                        }
                    }
                },
                (error) => {
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

    consultaCiudadPorEstadoYNombre() {
        if (this.ciudad != undefined) {
            let params: any = {};
            params.idEstado = this.sucursal.estado;
            params.nombre = this.ciudad;
            this._backService
                .HttpPost('catalogos/Ciudad/consultaCiudadPorEstadoYNombre', {}, params)
                .subscribe(
                    (response) => {
                        this.sucursal.dataCiudadSeleccionada = eval(response);
                        $('#loading-spinner').hide();
                        $('#blockScreen').hide();
                        this._pantallaServicio.ocultarSpinner();
                        if (this.sucursal.dataCiudadSeleccionada.length > 0) {
                            this.sucursal.ciudad =
                                this.sucursal.dataCiudadSeleccionada[0].idCiudad;
                            this.validarCamposRequeridosDireccion();
                        } else {
                            this.sucursal.ciudad = '';
                        }
                    },
                    (error) => {
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

    consultaEstados() {
        if (this.sucursal.pais != '') {
            let params: any = {};
            params.idPais = this.sucursal.pais;
            this._backService
                .HttpPost('catalogos/Estado/cargarEstadosEnPais', {}, params)
                .subscribe(
                    (response) => {
                        this.dataEstado = eval(response);
                        this.consultaCiudadesEnEstado();
                    },
                    (error) => {
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
            this.dataEstado = '';
        }
    }

    consultaPaises() {
        this._backService.HttpPost('catalogos/Pais/getPaises', {}, {}).subscribe(
            (response) => {
                this.dataPais = eval(response);
                //this.sucursal.pais = "";
                if (this.accion === 'Nuevo') {
                    $('#loading-spinner').hide();
                    $('#blockScreen').hide();
                    this._pantallaServicio.ocultarSpinner();
                    $('#divSucursales').css('pointer-events', 'visible');
                    $('#btnGuardar').css('pointer-events', 'visible');
                }
            },
            (error) => {
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

    onChangeDdlPais() {
        let params: any = {};
        params.idPais = this.sucursal.pais;
        this._backService
            .HttpPost('catalogos/Estado/cargarEstadosEnPais', {}, params)
            .subscribe(
                (response) => {
                    this.dataEstado = eval(response);
                    this.sucursal.estado = '';
                    this.sucursal.ciudad = '';
                    this.sucursal.dataCiudad = [];
                    this.sucursal.dataCiudadSeleccionada = [];
                },
                (error) => {
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

    onChangeDdlEstado() {
        let params: any = {};
        params.idEstado = this.sucursal.estado;
        this._backService
            .HttpPost('catalogos/Ciudad/consultaCiudadesEnEstado', {}, params)
            .subscribe(
                (response) => {
                    this.sucursal.dataCiudad = eval(response);
                    this.sucursal.ciudad = '';
                    this.sucursal.dataCiudadSeleccionada = [];
                },
                (error) => {
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

    /*Suma el contador*/
    sumarContadorLunes() {
        if (this.sucursal.contadorLunes < 3) {
            this.sucursal.contadorLunes++;
            this.validContadorLunes = true;
        } else {
            this.validContadorLunes = false;
        }

        if (this.sucursal.contadorLunes === 1) {
            $('#txtLunesDescansoInicio0').removeClass('errorCampo');
            $('#txtLunesDescansoFin0').removeClass('errorCampo');
            this.sucursal.objetoLunes.push({
                horaInicio: this.sucursal.horaInicioLunes,
                horaFin: this.sucursal.horaFinLunes,
            });
        }

        if (this.sucursal.contadorLunes === 2) {
            $('#txtLunesDescansoInicio1').removeClass('errorCampo');
            $('#txtLunesDescansoFin1').removeClass('errorCampo');
            this.sucursal.objetoLunes.push({
                horaInicio: this.sucursal.horaInicioLunes,
                horaFin: this.sucursal.horaFinLunes,
            });
        }

        if (
            this.sucursal.contadorLunes === 3 &&
            this.sucursal.objetoLunes.length != 3
        ) {
            $('#txtLunesDescansoInicio2').removeClass('errorCampo');
            $('#txtLunesDescansoFin2').removeClass('errorCampo');
            this.sucursal.objetoLunes.push({
                horaInicio: this.sucursal.horaInicioLunes,
                horaFin: this.sucursal.horaFinLunes,
            });
        }
    }

    sumarContadorMartes() {
        if (this.sucursal.contadorMartes < 3) {
            this.sucursal.contadorMartes++;
            this.validContadorMartes = true;
        } else {
            this.validContadorMartes = false;
        }

        if (this.sucursal.contadorMartes === 1) {
            $('#txtMartesDescansoInicio0').removeClass('errorCampo');
            $('#txtMartesDescansoFin0').removeClass('errorCampo');
            this.sucursal.objetoMartes.push({
                horaInicio: this.sucursal.horaInicioMartes,
                horaFin: this.sucursal.horaFinMartes,
            });
        }

        if (this.sucursal.contadorMartes === 2) {
            $('#txtMartesDescansoInicio1').removeClass('errorCampo');
            $('#txtMartesDescansoFin1').removeClass('errorCampo');
            this.sucursal.objetoMartes.push({
                horaInicio: this.sucursal.horaInicioMartes,
                horaFin: this.sucursal.horaFinMartes,
            });
        }

        if (
            this.sucursal.contadorMartes === 3 &&
            this.sucursal.objetoMartes.length != 3
        ) {
            $('#txtMartesDescansoInicio2').removeClass('errorCampo');
            $('#txtMartesDescansoFin2').removeClass('errorCampo');
            this.sucursal.objetoMartes.push({
                horaInicio: this.sucursal.horaInicioMartes,
                horaFin: this.sucursal.horaFinMartes,
            });
        }
    }

    sumarContadorMiercoles() {
        if (this.sucursal.contadorMiercoles < 3) {
            this.sucursal.contadorMiercoles++;
            this.validContadorMiercoles = true;
        } else {
            this.validContadorMiercoles = false;
        }

        if (this.sucursal.contadorMiercoles === 1) {
            $('#txtMiercolesDescansoInicio0').removeClass('errorCampo');
            $('#txtMiercolesDescansoFin0').removeClass('errorCampo');
            this.sucursal.objetoMiercoles.push({
                horaInicio: this.sucursal.horaInicioMiercoles,
                horaFin: this.sucursal.horaFinMiercoles,
            });
        }

        if (this.sucursal.contadorMiercoles === 2) {
            $('#txtMiercolesDescansoInicio1').removeClass('errorCampo');
            $('#txtMiercolesDescansoFin1').removeClass('errorCampo');
            this.sucursal.objetoMiercoles.push({
                horaInicio: this.sucursal.horaInicioMiercoles,
                horaFin: this.sucursal.horaFinMiercoles,
            });
        }

        if (
            this.sucursal.contadorMiercoles === 3 &&
            this.sucursal.objetoMiercoles.length != 3
        ) {
            $('#txtMiercolesDescansoInicio2').removeClass('errorCampo');
            $('#txtMiercolesDescansoFin2').removeClass('errorCampo');
            this.sucursal.objetoMiercoles.push({
                horaInicio: this.sucursal.horaInicioMiercoles,
                horaFin: this.sucursal.horaFinMiercoles,
            });
        }
    }

    sumarContadorJueves() {
        if (this.sucursal.contadorJueves < 3) {
            this.sucursal.contadorJueves++;
            this.validContadorJueves = true;
        } else {
            this.validContadorJueves = false;
        }

        if (this.sucursal.contadorJueves === 1) {
            $('#txtJuevesDescansoInicio0').removeClass('errorCampo');
            $('#txtJuevesDescansoFin0').removeClass('errorCampo');
            this.sucursal.objetoJueves.push({
                horaInicio: this.sucursal.horaInicioJueves,
                horaFin: this.sucursal.horaFinJueves,
            });
        }

        if (this.sucursal.contadorJueves === 2) {
            $('#txtJuevesDescansoInicio1').removeClass('errorCampo');
            $('#txtJuevesDescansoFin1').removeClass('errorCampo');
            this.sucursal.objetoJueves.push({
                horaInicio: this.sucursal.horaInicioJueves,
                horaFin: this.sucursal.horaFinJueves,
            });
        }

        if (
            this.sucursal.contadorJueves === 3 &&
            this.sucursal.objetoJueves.length != 3
        ) {
            $('#txtJuevesDescansoInicio2').removeClass('errorCampo');
            $('#txtJuevesDescansoFin2').removeClass('errorCampo');
            this.sucursal.objetoJueves.push({
                horaInicio: this.sucursal.horaInicioJueves,
                horaFin: this.sucursal.horaFinJueves,
            });
        }
    }

    sumarContadorViernes() {
        if (this.sucursal.contadorViernes < 3) {
            this.sucursal.contadorViernes++;
            this.validContadorViernes = true;
        } else {
            this.validContadorViernes = false;
        }

        if (this.sucursal.contadorViernes === 1) {
            $('#txtViernesDescansoInicio0').removeClass('errorCampo');
            $('#txtViernesDescansoFin0').removeClass('errorCampo');
            this.sucursal.objetoViernes.push({
                horaInicio: this.sucursal.horaInicioViernes,
                horaFin: this.sucursal.horaFinViernes,
            });
        }

        if (this.sucursal.contadorViernes === 2) {
            $('#txtViernesDescansoInicio1').removeClass('errorCampo');
            $('#txtViernesDescansoFin1').removeClass('errorCampo');
            this.sucursal.objetoViernes.push({
                horaInicio: this.sucursal.horaInicioViernes,
                horaFin: this.sucursal.horaFinViernes,
            });
        }

        if (
            this.sucursal.contadorViernes === 3 &&
            this.sucursal.objetoViernes.length != 3
        ) {
            $('#txtViernesDescansoInicio2').removeClass('errorCampo');
            $('#txtViernesDescansoFin2').removeClass('errorCampo');
            this.sucursal.objetoViernes.push({
                horaInicio: this.sucursal.horaInicioViernes,
                horaFin: this.sucursal.horaFinViernes,
            });
        }
    }

    sumarContadorSabado() {
        if (this.sucursal.contadorSabado < 3) {
            this.sucursal.contadorSabado++;
            this.validContadorSabado = true;
        } else {
            this.validContadorSabado = false;
        }

        if (this.sucursal.contadorSabado === 1) {
            $('#txtSabadoDescansoInicio0').removeClass('errorCampo');
            $('#txtSabadoDescansoFin0').removeClass('errorCampo');
            this.sucursal.objetoSabado.push({
                horaInicio: this.sucursal.horaInicioSabado,
                horaFin: this.sucursal.horaFinSabado,
            });
        }

        if (this.sucursal.contadorSabado === 2) {
            $('#txtSabadoDescansoInicio1').removeClass('errorCampo');
            $('#txtSabadoDescansoFin1').removeClass('errorCampo');
            this.sucursal.objetoSabado.push({
                horaInicio: this.sucursal.horaInicioSabado,
                horaFin: this.sucursal.horaFinSabado,
            });
        }

        if (
            this.sucursal.contadorSabado === 3 &&
            this.sucursal.objetoSabado.length != 3
        ) {
            $('#txtSabadoDescansoInicio2').removeClass('errorCampo');
            $('#txtSabadoDescansoFin2').removeClass('errorCampo');
            this.sucursal.objetoSabado.push({
                horaInicio: this.sucursal.horaInicioSabado,
                horaFin: this.sucursal.horaFinSabado,
            });
        }
    }

    sumarContadorDomingo() {
        if (this.sucursal.contadorDomingo < 3) {
            this.sucursal.contadorDomingo++;
            this.validContadorDomingo = true;
        } else {
            this.validContadorDomingo = false;
        }

        if (this.sucursal.contadorDomingo === 1) {
            $('#txtDomingoDescansoInicio0').removeClass('errorCampo');
            $('#txtDomingoDescansoFin0').removeClass('errorCampo');
            this.sucursal.objetoDomingo.push({
                horaInicio: this.sucursal.horaInicioDomingo,
                horaFin: this.sucursal.horaFinDomingo,
            });
        }

        if (this.sucursal.contadorDomingo === 2) {
            $('#txtDomingoDescansoInicio1').removeClass('errorCampo');
            $('#txtDomingoDescansoFin1').removeClass('errorCampo');
            this.sucursal.objetoDomingo.push({
                horaInicio: this.sucursal.horaInicioDomingo,
                horaFin: this.sucursal.horaFinDomingo,
            });
        }

        if (
            this.sucursal.contadorDomingo === 3 &&
            this.sucursal.objetoDomingo.length != 3
        ) {
            $('#txtDomingoDescansoInicio2').removeClass('errorCampo');
            $('#txtDomingoDescansoFin2').removeClass('errorCampo');
            this.sucursal.objetoDomingo.push({
                horaInicio: this.sucursal.horaInicioDomingo,
                horaFin: this.sucursal.horaFinDomingo,
            });
        }
    }

    validarValidaciones() {
        this.guardarDescansos = true;
        if (this.contDescansosRequeridos === 0) {
            if (this.validFormatoDescansos) {
                this.sucursal.validarRangosDescansos();
                if (this.validRangoDescansos) {
                    this.sucursal.validarDescansosEnDia();
                    if (this.validRangoDescansosEnDia) {
                        this.sucursal.validarDescansosEmpalmados();
                    }
                }
            }
        }
    }

    /*Resta el contador*/
    restarContadorLunes(id: any) {
        delete this.sucursal.objetoLunes[id];

        this.sucursal.validDescansosEnLunes.splice(id, 1);
        for (let i = 0; i < 2; i++) {
            this.msgLunesDescansos[i] = '';
        }
        this.msgLunesDescansos.splice(id, 1);
        for (let i = 0; i < 2; i++) {
            $('#txtLunesDescansoFin' + i).removeClass('errorCampo');
            $('#txtLunesDescansoInicio' + i).removeClass('errorCampo');
        }
        this.sucursal.contadorLunes--;
        this.sucursal.objetoLunes.splice(id, 1);
        this.validarValidaciones();

        if (this.sucursal.contadorLunes < 3) {
            this.validContadorLunes = true;
        }
    }

    restarContadorMartes(id: any) {
        delete this.sucursal.objetoMartes[id];

        this.sucursal.validDescansosEnMartes.splice(id, 1);
        for (let i = 0; i < 2; i++) {
            this.msgMartesDescansos[i] = '';
        }
        this.msgMartesDescansos.splice(id, 1);
        for (let i = 0; i < 2; i++) {
            $('#txtMartesDescansoInicio' + i).removeClass('errorCampo');
            $('#txtMartesDescansoFin' + i).removeClass('errorCampo');
        }

        this.sucursal.contadorMartes--;
        this.sucursal.objetoMartes.splice(id, 1);
        this.validarValidaciones();

        if (this.sucursal.contadorMartes < 3) {
            this.validContadorMartes = true;
        }
    }

    restarContadorMiercoles(id: any) {
        delete this.sucursal.objetoMiercoles[id];

        this.sucursal.validDescansosEnMiercoles.splice(id, 1);
        for (let i = 0; i < 2; i++) {
            this.msgMiercolesDescansos[i] = '';
        }
        this.msgMiercolesDescansos.splice(id, 1);
        for (let i = 0; i < 2; i++) {
            $('#txtMiercolesDescansoInicio' + i).removeClass('errorCampo');
            $('#txtMiercolesDescansoFin' + i).removeClass('errorCampo');
        }

        this.sucursal.contadorMiercoles--;
        this.sucursal.objetoMiercoles.splice(id, 1);
        this.validarValidaciones();

        if (this.sucursal.contadorMiercoles < 3) {
            this.validContadorMiercoles = true;
        }
    }

    restarContadorJueves(id: any) {
        delete this.sucursal.objetoJueves[id];

        this.sucursal.validDescansosEnJueves.splice(id, 1);
        for (let i = 0; i < 2; i++) {
            this.msgJuevesDescansos[i] = '';
        }
        this.msgJuevesDescansos.splice(id, 1);
        for (let i = 0; i < 2; i++) {
            $('#txtJuevesDescansoInicio' + i).removeClass('errorCampo');
            $('#txtJuevesDescansoFin' + i).removeClass('errorCampo');
        }

        this.sucursal.contadorJueves--;
        this.sucursal.objetoJueves.splice(id, 1);
        this.validarValidaciones();

        if (this.sucursal.contadorJueves < 3) {
            this.validContadorJueves = true;
        }
    }

    restarContadorViernes(id: any) {
        delete this.sucursal.objetoViernes[id];

        this.sucursal.validDescansosEnViernes.splice(id, 1);
        for (let i = 0; i < 2; i++) {
            this.msgViernesDescansos[i] = '';
        }
        this.msgViernesDescansos.splice(id, 1);
        for (let i = 0; i < 2; i++) {
            $('#txtViernesDescansoInicio' + i).removeClass('errorCampo');
            $('#txtViernesDescansoFin' + i).removeClass('errorCampo');
        }

        this.sucursal.contadorViernes--;
        this.sucursal.objetoViernes.splice(id, 1);
        this.validarValidaciones();

        if (this.sucursal.contadorViernes < 3) {
            this.validContadorViernes = true;
        }
    }

    restarContadorSabado(id: any) {
        delete this.sucursal.objetoSabado[id];

        this.sucursal.validDescansosEnSabado.splice(id, 1);
        for (let i = 0; i < 2; i++) {
            this.msgSabadoDescansos[i] = '';
        }
        this.msgSabadoDescansos.splice(id, 1);
        for (let i = 0; i < 2; i++) {
            $('#txtSabadoDescansoInicio' + i).removeClass('errorCampo');
            $('#txtSabadoDescansoFin' + i).removeClass('errorCampo');
        }

        this.sucursal.contadorSabado--;
        this.sucursal.objetoSabado.splice(id, 1);
        this.validarValidaciones();
        if (this.sucursal.contadorSabado < 3) {
            this.validContadorSabado = true;
        }
    }

    restarContadorDomingo(id: any) {
        delete this.sucursal.objetoDomingo[id];

        this.sucursal.validDescansosEnDomingo.splice(id, 1);
        for (let i = 0; i < 2; i++) {
            this.msgDomingoDescansos[i] = '';
        }
        this.msgDomingoDescansos.splice(id, 1);
        for (let i = 0; i < 2; i++) {
            $('#txtDomingoDescansoInicio' + i).removeClass('errorCampo');
            $('#txtDomingoDescansoFin' + i).removeClass('errorCampo');
        }

        this.sucursal.contadorDomingo--;
        this.sucursal.objetoDomingo.splice(id, 1);
        this.validarValidaciones();
        if (this.sucursal.contadorDomingo < 3) {
            this.validContadorDomingo = true;
        }
    }

    validarRangosDescansos() {
        for (let i = 0; i < this.sucursal.objetoLunes.length; i++) {
            this.rangoHoras(
                this.sucursal.objetoLunes[i].horaInicio,
                this.sucursal.objetoLunes[i].horaFin
            );
            this.msgLunesDescansos[i] = this.msgHora;
            this.sucursal.validRangosDescansosLunes[i] = this.validRangos;

            if (this.msgLunesDescansos[i] != '') {
                $('#txtLunesDescansoFin' + i).addClass('errorCampo');
                $('#txtLunesDescansoInicio' + i).addClass('errorCampo');
            } else {
                $('#txtLunesDescansoInicio' + i).removeClass('errorCampo');
                $('#txtLunesDescansoFin' + i).removeClass('errorCampo');
            }
        }

        for (let i = 0; i < this.sucursal.objetoMartes.length; i++) {
            this.rangoHoras(
                this.sucursal.objetoMartes[i].horaInicio,
                this.sucursal.objetoMartes[i].horaFin
            );
            this.msgMartesDescansos[i] = this.msgHora;
            this.sucursal.validRangosDescansosMartes[i] = this.validRangos;

            if (this.msgMartesDescansos[i] != '') {
                $('#txtMartesDescansoFin' + i).addClass('errorCampo');
                $('#txtMartesDescansoInicio' + i).addClass('errorCampo');
            } else {
                $('#txtMartesDescansoInicio' + i).removeClass('errorCampo');
                $('#txtMartesDescansoFin' + i).removeClass('errorCampo');
            }
        }

        for (let i = 0; i < this.sucursal.objetoMiercoles.length; i++) {
            this.rangoHoras(
                this.sucursal.objetoMiercoles[i].horaInicio,
                this.sucursal.objetoMiercoles[i].horaFin
            );
            this.msgMiercolesDescansos[i] = this.msgHora;
            this.sucursal.validRangosDescansosMiercoles[i] = this.validRangos;

            if (this.msgMiercolesDescansos[i] != '') {
                $('#txtMiercolesDescansoFin' + i).addClass('errorCampo');
                $('#txtMiercolesDescansoInicio' + i).addClass('errorCampo');
            } else {
                $('#txtMiercolesDescansoInicio' + i).removeClass('errorCampo');
                $('#txtMiercolesDescansoFin' + i).removeClass('errorCampo');
            }
        }

        for (let i = 0; i < this.sucursal.objetoJueves.length; i++) {
            this.rangoHoras(
                this.sucursal.objetoJueves[i].horaInicio,
                this.sucursal.objetoJueves[i].horaFin
            );
            this.msgJuevesDescansos[i] = this.msgHora;
            this.sucursal.validRangosDescansosJueves[i] = this.validRangos;

            if (this.msgJuevesDescansos[i] != '') {
                $('#txtJuevesDescansoFin' + i).addClass('errorCampo');
                $('#txtJuevesDescansoInicio' + i).addClass('errorCampo');
            } else {
                $('#txtJuevesDescansoInicio' + i).removeClass('errorCampo');
                $('#txtJuevesDescansoFin' + i).removeClass('errorCampo');
            }
        }

        for (let i = 0; i < this.sucursal.objetoViernes.length; i++) {
            this.rangoHoras(
                this.sucursal.objetoViernes[i].horaInicio,
                this.sucursal.objetoViernes[i].horaFin
            );
            this.msgViernesDescansos[i] = this.msgHora;
            this.sucursal.validRangosDescansosViernes[i] = this.validRangos;

            if (this.msgViernesDescansos[i] != '') {
                $('#txtViernesDescansoFin' + i).addClass('errorCampo');
                $('#txtViernesDescansoInicio' + i).addClass('errorCampo');
            } else {
                $('#txtViernesDescansoInicio' + i).removeClass('errorCampo');
                $('#txtViernesDescansoFin' + i).removeClass('errorCampo');
            }
        }

        for (let i = 0; i < this.sucursal.objetoSabado.length; i++) {
            this.rangoHoras(
                this.sucursal.objetoSabado[i].horaInicio,
                this.sucursal.objetoSabado[i].horaFin
            );
            this.msgSabadoDescansos[i] = this.msgHora;
            this.sucursal.validRangosDescansosSabado[i] = this.validRangos;

            if (this.msgSabadoDescansos[i] != '') {
                $('#txtSabadoDescansoFin' + i).addClass('errorCampo');
                $('#txtSabadoDescansoInicio' + i).addClass('errorCampo');
            } else {
                $('#txtSabadoDescansoInicio' + i).removeClass('errorCampo');
                $('#txtSabadoDescansoFin' + i).removeClass('errorCampo');
            }
        }

        for (let i = 0; i < this.sucursal.objetoDomingo.length; i++) {
            this.rangoHoras(
                this.sucursal.objetoDomingo[i].horaInicio,
                this.sucursal.objetoDomingo[i].horaFin
            );
            this.msgDomingoDescansos[i] = this.msgHora;
            this.sucursal.validRangosDescansosDomingo[i] = this.validRangos;

            if (this.msgDomingoDescansos[i] != '') {
                $('#txtDomingoDescansoFin' + i).addClass('errorCampo');
                $('#txtDomingoDescansoInicio' + i).addClass('errorCampo');
            } else {
                $('#txtDomingoDescansoInicio' + i).removeClass('errorCampo');
                $('#txtDomingoDescansoFin' + i).removeClass('errorCampo');
            }
        }

        let validRango = [];
        this.validRangoDescansos = false;
        for (let i = 0; i < 7; i++) {
            validRango[i] = true;
        }

        for (let i = 0; i < this.sucursal.validRangosDescansosLunes.length; i++) {
            if (!this.sucursal.validRangosDescansosLunes[i]) {
                validRango[0] = false;
                i = this.sucursal.validRangosDescansosLunes.length;
            }
        }

        for (let i = 0; i < this.sucursal.validRangosDescansosMartes.length; i++) {
            if (!this.sucursal.validRangosDescansosMartes[i]) {
                validRango[1] = false;
                i = this.sucursal.validRangosDescansosMartes.length;
            }
        }

        for (
            let i = 0;
            i < this.sucursal.validRangosDescansosMiercoles.length;
            i++
        ) {
            if (!this.sucursal.validRangosDescansosMiercoles[i]) {
                validRango[2] = false;
                i = this.sucursal.validRangosDescansosMiercoles.length;
            }
        }

        for (let i = 0; i < this.sucursal.validRangosDescansosJueves.length; i++) {
            if (!this.sucursal.validRangosDescansosJueves[i]) {
                validRango[3] = false;
                i = this.sucursal.validRangosDescansosJueves.length;
            }
        }

        for (let i = 0; i < this.sucursal.validRangosDescansosViernes.length; i++) {
            if (!this.sucursal.validRangosDescansosViernes[i]) {
                validRango[4] = false;
                i = this.sucursal.validRangosDescansosViernes.length;
            }
        }

        for (let i = 0; i < this.sucursal.validRangosDescansosSabado.length; i++) {
            if (!this.sucursal.validRangosDescansosSabado[i]) {
                validRango[5] = false;
                i = this.sucursal.validRangosDescansosSabado.length;
            }
        }

        for (let i = 0; i < this.sucursal.validRangosDescansosDomingo.length; i++) {
            if (!this.sucursal.validRangosDescansosDomingo[i]) {
                validRango[6] = false;
                i = this.sucursal.validRangosDescansosDomingo.length;
            }
        }

        if (
            validRango[0] &&
            validRango[1] &&
            validRango[2] &&
            validRango[3] &&
            validRango[4] &&
            validRango[5] &&
            validRango[6]
        ) {
            this.validRangoDescansos = true;
        }
    }

    validarDescansosEmpalmados() {
        this.validEmpalmeLunes = [];
        this.validEmpalmeMartes = [];
        this.validEmpalmeMiercoles = [];
        this.validEmpalmeJueves = [];
        this.validEmpalmeViernes = [];
        this.validEmpalmeSabado = [];
        this.validEmpalmeDomingo = [];
        // Lunes
        if (this.sucursal.objetoLunes.length === 2) {
            this.validDescansosEmpalmados(
                this.sucursal.objetoLunes[0].horaInicio,
                this.sucursal.objetoLunes[0].horaFin,
                this.sucursal.objetoLunes[1].horaInicio,
                this.sucursal.objetoLunes[1].horaFin,
                null,
                null
            );
            if (this.validEmpalme2) {
                this.msgLunesDescansos[1] = this.msgHora;
                this.validEmpalmeLunes[1] = this.validEmpalme2;
                $('#txtLunesDescansoFin1').addClass('errorCampo');
                $('#txtLunesDescansoInicio1').addClass('errorCampo');
            } else {
                this.msgLunesDescansos[1] = '';
                this.validEmpalmeLunes[1] = this.validEmpalme2;
                $('#txtLunesDescansoInicio1').removeClass('errorCampo');
                $('#txtLunesDescansoFin1').removeClass('errorCampo');
            }
        } else if (this.sucursal.objetoLunes.length === 3) {
            this.validDescansosEmpalmados(
                this.sucursal.objetoLunes[0].horaInicio,
                this.sucursal.objetoLunes[0].horaFin,
                this.sucursal.objetoLunes[1].horaInicio,
                this.sucursal.objetoLunes[1].horaFin,
                this.sucursal.objetoLunes[2].horaInicio,
                this.sucursal.objetoLunes[2].horaFin
            );
            if (this.validEmpalme2) {
                this.msgLunesDescansos[1] = this.msgHora;
                this.validEmpalmeLunes[1] = this.validEmpalme2;
                $('#txtLunesDescansoFin1').addClass('errorCampo');
                $('#txtLunesDescansoInicio1').addClass('errorCampo');
            } else if (this.validEmpalme3) {
                this.msgLunesDescansos[1] = '';
                this.validEmpalmeLunes[1] = this.validEmpalme2;
                $('#txtLunesDescansoInicio1').removeClass('errorCampo');
                $('#txtLunesDescansoFin1').removeClass('errorCampo');
                this.msgLunesDescansos[2] = this.msgHora;
                this.validEmpalmeLunes[2] = this.validEmpalme3;
                $('#txtLunesDescansoFin2').addClass('errorCampo');
                $('#txtLunesDescansoInicio2').addClass('errorCampo');
            } else {
                $('#txtLunesDescansoInicio2').removeClass('errorCampo');
                $('#txtLunesDescansoFin2').removeClass('errorCampo');
                this.msgLunesDescansos[2] = '';
                this.validEmpalmeLunes[2] = this.validEmpalme3;
            }
        }

        if (this.sucursal.objetoMartes.length === 2) {
            this.validDescansosEmpalmados(
                this.sucursal.objetoMartes[0].horaInicio,
                this.sucursal.objetoMartes[0].horaFin,
                this.sucursal.objetoMartes[1].horaInicio,
                this.sucursal.objetoMartes[1].horaFin,
                null,
                null
            );
            if (this.validEmpalme2) {
                this.msgMartesDescansos[1] = this.msgHora;
                this.validEmpalmeMartes[1] = this.validEmpalme2;
                $('#txtMartesDescansoFin1').addClass('errorCampo');
                $('#txtMartesDescansoInicio1').addClass('errorCampo');
            } else {
                this.msgMartesDescansos[1] = '';
                this.validEmpalmeMartes[1] = this.validEmpalme2;
                $('#txtMartesDescansoInicio1').removeClass('errorCampo');
                $('#txtMartesDescansoFin1').removeClass('errorCampo');
            }
        } else if (this.sucursal.objetoMartes.length === 3) {
            this.validDescansosEmpalmados(
                this.sucursal.objetoMartes[0].horaInicio,
                this.sucursal.objetoMartes[0].horaFin,
                this.sucursal.objetoMartes[1].horaInicio,
                this.sucursal.objetoMartes[1].horaFin,
                this.sucursal.objetoMartes[2].horaInicio,
                this.sucursal.objetoMartes[2].horaFin
            );
            if (this.validEmpalme2) {
                this.msgMartesDescansos[1] = this.msgHora;
                this.validEmpalmeMartes[1] = this.validEmpalme2;
                $('#txtMartesDescansoFin1').addClass('errorCampo');
                $('#txtMartesDescansoInicio1').addClass('errorCampo');
            } else if (this.validEmpalme3) {
                this.msgMartesDescansos[1] = '';
                this.validEmpalmeMartes[1] = this.validEmpalme2;
                $('#txtMartesDescansoInicio1').removeClass('errorCampo');
                $('#txtMartesDescansoFin1').removeClass('errorCampo');
                this.msgMartesDescansos[2] = this.msgHora;
                this.validEmpalmeMartes[2] = this.validEmpalme3;
                $('#txtMartesDescansoFin2').addClass('errorCampo');
                $('#txtMartesDescansoInicio2').addClass('errorCampo');
            } else {
                $('#txtMartesDescansoInicio2').removeClass('errorCampo');
                $('#txtMartesDescansoFin2').removeClass('errorCampo');
                this.msgMartesDescansos[2] = '';
                this.validEmpalmeMartes[2] = this.validEmpalme3;
            }
        }

        if (this.sucursal.objetoMiercoles.length === 2) {
            this.validDescansosEmpalmados(
                this.sucursal.objetoMiercoles[0].horaInicio,
                this.sucursal.objetoMiercoles[0].horaFin,
                this.sucursal.objetoMiercoles[1].horaInicio,
                this.sucursal.objetoMiercoles[1].horaFin,
                null,
                null
            );
            if (this.validEmpalme2) {
                this.msgMiercolesDescansos[1] = this.msgHora;
                this.validEmpalmeMiercoles[1] = this.validEmpalme2;
                $('#txtMiercolesDescansoFin1').addClass('errorCampo');
                $('#txtMiercolesDescansoInicio1').addClass('errorCampo');
            } else {
                this.msgMiercolesDescansos[1] = '';
                this.validEmpalmeMiercoles[1] = this.validEmpalme2;
                $('#txtMiercolesDescansoInicio1').removeClass('errorCampo');
                $('#txtMiercolesDescansoFin1').removeClass('errorCampo');
            }
        } else if (this.sucursal.objetoMiercoles.length === 3) {
            this.validDescansosEmpalmados(
                this.sucursal.objetoMiercoles[0].horaInicio,
                this.sucursal.objetoMiercoles[0].horaFin,
                this.sucursal.objetoMiercoles[1].horaInicio,
                this.sucursal.objetoMiercoles[1].horaFin,
                this.sucursal.objetoMiercoles[2].horaInicio,
                this.sucursal.objetoMiercoles[2].horaFin
            );
            if (this.validEmpalme2) {
                this.msgMiercolesDescansos[1] = this.msgHora;
                this.validEmpalmeMiercoles[1] = this.validEmpalme2;
                $('#txtMiercolesDescansoFin1').addClass('errorCampo');
                $('#txtMiercolesDescansoInicio1').addClass('errorCampo');
            } else if (this.validEmpalme3) {
                this.msgMiercolesDescansos[1] = '';
                this.validEmpalmeMiercoles[1] = this.validEmpalme2;
                $('#txtMiercolesDescansoInicio1').removeClass('errorCampo');
                $('#txtMiercolesDescansoFin1').removeClass('errorCampo');
                this.msgMiercolesDescansos[2] = this.msgHora;
                this.validEmpalmeMiercoles[2] = this.validEmpalme3;
                $('#txtMiercolesDescansoFin2').addClass('errorCampo');
                $('#txtMiercolesDescansoInicio2').addClass('errorCampo');
            } else {
                $('#txtMiercolesDescansoInicio2').removeClass('errorCampo');
                $('#txtMiercolesDescansoFin2').removeClass('errorCampo');
                this.msgMiercolesDescansos[2] = '';
                this.validEmpalmeMiercoles[2] = this.validEmpalme3;
            }
        }

        if (this.sucursal.objetoJueves.length === 2) {
            this.validDescansosEmpalmados(
                this.sucursal.objetoJueves[0].horaInicio,
                this.sucursal.objetoJueves[0].horaFin,
                this.sucursal.objetoJueves[1].horaInicio,
                this.sucursal.objetoJueves[1].horaFin,
                null,
                null
            );
            if (this.validEmpalme2) {
                this.msgJuevesDescansos[1] = this.msgHora;
                this.validEmpalmeJueves[1] = this.validEmpalme2;
                $('#txtJuevesDescansoFin1').addClass('errorCampo');
                $('#txtJuevesDescansoInicio1').addClass('errorCampo');
            } else {
                this.msgJuevesDescansos[1] = '';
                this.validEmpalmeJueves[1] = this.validEmpalme2;
                $('#txtJuevesDescansoInicio1').removeClass('errorCampo');
                $('#txtJuevesDescansoFin1').removeClass('errorCampo');
            }
        } else if (this.sucursal.objetoJueves.length === 3) {
            this.validDescansosEmpalmados(
                this.sucursal.objetoJueves[0].horaInicio,
                this.sucursal.objetoJueves[0].horaFin,
                this.sucursal.objetoJueves[1].horaInicio,
                this.sucursal.objetoJueves[1].horaFin,
                this.sucursal.objetoJueves[2].horaInicio,
                this.sucursal.objetoJueves[2].horaFin
            );
            if (this.validEmpalme2) {
                this.msgJuevesDescansos[1] = this.msgHora;
                this.validEmpalmeJueves[1] = this.validEmpalme2;
                $('#txtJuevesDescansoFin1').addClass('errorCampo');
                $('#txtJuevesDescansoInicio1').addClass('errorCampo');
            } else if (this.validEmpalme3) {
                this.msgJuevesDescansos[1] = '';
                this.validEmpalmeJueves[1] = this.validEmpalme2;
                $('#txtJuevesDescansoInicio1').removeClass('errorCampo');
                $('#txtJuevesDescansoFin1').removeClass('errorCampo');
                this.msgJuevesDescansos[2] = this.msgHora;
                this.validEmpalmeJueves[2] = this.validEmpalme3;
                $('#txtJuevesDescansoFin2').addClass('errorCampo');
                $('#txtJuevesDescansoInicio2').addClass('errorCampo');
            } else {
                $('#txtJuevesDescansoInicio2').removeClass('errorCampo');
                $('#txtJuevesDescansoFin2').removeClass('errorCampo');
                this.msgJuevesDescansos[2] = '';
                this.validEmpalmeJueves[2] = this.validEmpalme3;
            }
        }

        if (this.sucursal.objetoViernes.length === 2) {
            this.validDescansosEmpalmados(
                this.sucursal.objetoViernes[0].horaInicio,
                this.sucursal.objetoViernes[0].horaFin,
                this.sucursal.objetoViernes[1].horaInicio,
                this.sucursal.objetoViernes[1].horaFin,
                null,
                null
            );
            if (this.validEmpalme2) {
                this.msgViernesDescansos[1] = this.msgHora;
                this.validEmpalmeViernes[1] = this.validEmpalme2;
                $('#txtViernesDescansoFin1').addClass('errorCampo');
                $('#txtViernesDescansoInicio1').addClass('errorCampo');
            } else {
                this.msgViernesDescansos[1] = '';
                this.validEmpalmeViernes[1] = this.validEmpalme2;
                $('#txtViernesDescansoInicio1').removeClass('errorCampo');
                $('#txtViernesDescansoFin1').removeClass('errorCampo');
            }
        } else if (this.sucursal.objetoViernes.length === 3) {
            this.validDescansosEmpalmados(
                this.sucursal.objetoViernes[0].horaInicio,
                this.sucursal.objetoViernes[0].horaFin,
                this.sucursal.objetoViernes[1].horaInicio,
                this.sucursal.objetoViernes[1].horaFin,
                this.sucursal.objetoViernes[2].horaInicio,
                this.sucursal.objetoViernes[2].horaFin
            );
            if (this.validEmpalme2) {
                this.msgViernesDescansos[1] = this.msgHora;
                this.validEmpalmeViernes[1] = this.validEmpalme2;
                $('#txtViernesDescansoFin1').addClass('errorCampo');
                $('#txtViernesDescansoInicio1').addClass('errorCampo');
            } else if (this.validEmpalme3) {
                this.msgViernesDescansos[1] = '';
                this.validEmpalmeViernes[1] = this.validEmpalme2;
                $('#txtViernesDescansoInicio1').removeClass('errorCampo');
                $('#txtViernesDescansoFin1').removeClass('errorCampo');
                this.msgViernesDescansos[2] = this.msgHora;
                this.validEmpalmeViernes[2] = this.validEmpalme3;
                $('#txtViernesDescansoFin2').addClass('errorCampo');
                $('#txtViernesDescansoInicio2').addClass('errorCampo');
            } else {
                $('#txtViernesDescansoInicio2').removeClass('errorCampo');
                $('#txtViernesDescansoFin2').removeClass('errorCampo');
                this.msgViernesDescansos[2] = '';
                this.validEmpalmeViernes[2] = this.validEmpalme3;
            }
        }

        if (this.sucursal.objetoSabado.length === 2) {
            this.validDescansosEmpalmados(
                this.sucursal.objetoSabado[0].horaInicio,
                this.sucursal.objetoSabado[0].horaFin,
                this.sucursal.objetoSabado[1].horaInicio,
                this.sucursal.objetoSabado[1].horaFin,
                null,
                null
            );
            if (this.validEmpalme2) {
                this.msgSabadoDescansos[1] = this.msgHora;
                this.validEmpalmeSabado[1] = this.validEmpalme2;
                $('#txtSabadoDescansoFin1').addClass('errorCampo');
                $('#txtSabadoDescansoInicio1').addClass('errorCampo');
            } else {
                this.msgSabadoDescansos[1] = '';
                this.validEmpalmeSabado[1] = this.validEmpalme2;
                $('#txtSabadoDescansoInicio1').removeClass('errorCampo');
                $('#txtSabadoDescansoFin1').removeClass('errorCampo');
            }
        } else if (this.sucursal.objetoSabado.length === 3) {
            this.validDescansosEmpalmados(
                this.sucursal.objetoSabado[0].horaInicio,
                this.sucursal.objetoSabado[0].horaFin,
                this.sucursal.objetoSabado[1].horaInicio,
                this.sucursal.objetoSabado[1].horaFin,
                this.sucursal.objetoSabado[2].horaInicio,
                this.sucursal.objetoSabado[2].horaFin
            );
            if (this.validEmpalme2) {
                this.msgSabadoDescansos[1] = this.msgHora;
                this.validEmpalmeSabado[1] = this.validEmpalme2;
                $('#txtSabadoDescansoFin1').addClass('errorCampo');
                $('#txtSabadoDescansoInicio1').addClass('errorCampo');
            } else if (this.validEmpalme3) {
                this.msgSabadoDescansos[1] = '';
                this.validEmpalmeSabado[1] = this.validEmpalme2;
                $('#txtSabadoDescansoInicio1').removeClass('errorCampo');
                $('#txtSabadoDescansoFin1').removeClass('errorCampo');
                this.msgSabadoDescansos[2] = this.msgHora;
                this.validEmpalmeSabado[2] = this.validEmpalme3;
                $('#txtSabadoDescansoFin2').addClass('errorCampo');
                $('#txtSabadoDescansoInicio2').addClass('errorCampo');
            } else {
                $('#txtSabadoDescansoInicio2').removeClass('errorCampo');
                $('#txtSabadoDescansoFin2').removeClass('errorCampo');
                this.msgSabadoDescansos[2] = '';
                this.validEmpalmeSabado[2] = this.validEmpalme3;
            }
        }

        if (this.sucursal.objetoDomingo.length === 2) {
            this.validDescansosEmpalmados(
                this.sucursal.objetoDomingo[0].horaInicio,
                this.sucursal.objetoDomingo[0].horaFin,
                this.sucursal.objetoDomingo[1].horaInicio,
                this.sucursal.objetoDomingo[1].horaFin,
                null,
                null
            );
            if (this.validEmpalme2) {
                this.msgDomingoDescansos[1] = this.msgHora;
                this.validEmpalmeDomingo[1] = this.validEmpalme2;
                $('#txtDomingoDescansoFin1').addClass('errorCampo');
                $('#txtDomingoDescansoInicio1').addClass('errorCampo');
            } else {
                this.msgDomingoDescansos[1] = '';
                this.validEmpalmeDomingo[1] = this.validEmpalme2;
                $('#txtDomingoDescansoInicio1').removeClass('errorCampo');
                $('#txtDomingoDescansoFin1').removeClass('errorCampo');
            }
        } else if (this.sucursal.objetoDomingo.length === 3) {
            this.validDescansosEmpalmados(
                this.sucursal.objetoDomingo[0].horaInicio,
                this.sucursal.objetoDomingo[0].horaFin,
                this.sucursal.objetoDomingo[1].horaInicio,
                this.sucursal.objetoDomingo[1].horaFin,
                this.sucursal.objetoDomingo[2].horaInicio,
                this.sucursal.objetoDomingo[2].horaFin
            );
            if (this.validEmpalme2) {
                this.msgDomingoDescansos[1] = this.msgHora;
                this.validEmpalmeDomingo[1] = this.validEmpalme2;
                $('#txtDomingoDescansoFin1').addClass('errorCampo');
                $('#txtDomingoDescansoInicio1').addClass('errorCampo');
            } else if (this.validEmpalme3) {
                this.msgDomingoDescansos[1] = '';
                this.validEmpalmeDomingo[1] = this.validEmpalme2;
                $('#txtDomingoDescansoInicio1').removeClass('errorCampo');
                $('#txtDomingoDescansoFin1').removeClass('errorCampo');
                this.msgDomingoDescansos[2] = this.msgHora;
                this.validEmpalmeDomingo[2] = this.validEmpalme3;
                $('#txtDomingoDescansoFin2').addClass('errorCampo');
                $('#txtDomingoDescansoInicio2').addClass('errorCampo');
            } else {
                $('#txtDomingoDescansoInicio2').removeClass('errorCampo');
                $('#txtDomingoDescansoFin2').removeClass('errorCampo');
                this.msgDomingoDescansos[2] = '';
                this.validEmpalmeDomingo[2] = this.validEmpalme3;
            }
        }
    }

    validDescansosEmpalmados(
        horaInicio1: any,
        horaFin1: any,
        horaInicio2: any,
        horaFin2: any,
        horaInicio3: any,
        horaFin3: any
    ) {
        this.validEmpalme = false;
        this.validEmpalme2 = false;
        if (horaInicio3 != null && horaFin3 != null) {
            this.validEmpalme3 = false;

            if (
                (horaInicio1 < horaFin2 && horaInicio1 > horaInicio2) ||
                (horaFin1 < horaFin2 && horaFin1 > horaInicio2) ||
                (horaInicio2 < horaFin1 && horaInicio2 > horaInicio1) ||
                (horaFin2 < horaFin1 && horaFin2 > horaInicio1) ||
                (horaFin1 === horaFin2 && horaInicio1 === horaInicio2)
            ) {
                this.validEmpalme2 = true;
                this.msgHora = this.sucursalTranslate.horasEmpalmadas;
            } else if (
                (horaInicio1 < horaFin3 && horaInicio1 > horaInicio3) ||
                (horaFin1 < horaFin3 && horaFin1 > horaInicio3) ||
                (horaInicio3 < horaFin1 && horaInicio3 > horaInicio1) ||
                (horaFin3 < horaFin1 && horaFin3 > horaInicio1) ||
                (horaFin1 === horaFin3 && horaInicio1 === horaInicio3)
            ) {
                this.validEmpalme3 = true;
                this.msgHora = this.sucursalTranslate.horasEmpalmadas;
            } else if (
                (horaInicio2 < horaFin3 && horaInicio2 > horaInicio3) ||
                (horaFin2 < horaFin3 && horaFin2 > horaInicio3) ||
                (horaInicio3 < horaFin2 && horaInicio3 > horaInicio2) ||
                (horaFin3 < horaFin2 && horaFin3 > horaInicio2) ||
                (horaFin2 === horaFin3 && horaInicio2 === horaInicio3)
            ) {
                this.validEmpalme3 = true;
                this.msgHora = this.sucursalTranslate.horasEmpalmadas;
            }
        } else {
            if (
                (horaInicio1 < horaFin2 && horaInicio1 > horaInicio2) ||
                (horaFin1 < horaFin2 && horaFin1 > horaInicio2) ||
                (horaInicio2 < horaFin1 && horaInicio2 > horaInicio1) ||
                (horaFin2 < horaFin1 && horaFin2 > horaInicio1) ||
                (horaFin1 === horaFin2 && horaInicio1 === horaInicio2)
            ) {
                this.validEmpalme2 = true;
                this.msgHora = this.sucursalTranslate.horasEmpalmadas;
            }
        }
    }

    validarDescansosEnDia() {
        this.sucursal.validDescansosEnLunes = [];
        this.sucursal.validDescansosEnMartes = [];
        this.sucursal.validDescansosEnMiercoles = [];
        this.sucursal.validDescansosEnJueves = [];
        this.sucursal.validDescansosEnViernes = [];
        this.sucursal.validDescansosEnSabado = [];
        this.sucursal.validDescansosEnDomingo = [];

        this.validRango2 = [];
        this.validRangoDescansosEnDia = false;
        for (let i = 0; i < 7; i++) {
            this.validRango2[i] = true;
        }

        if (this.sucursal.lunes) {
            for (let i = 0; i < this.sucursal.objetoLunes.length; i++) {
                this.validDescansosEnDia(
                    this.sucursal.objetoLunes[i].horaInicio,
                    this.sucursal.objetoLunes[i].horaFin,
                    this.sucursal.horaInicioLunes,
                    this.sucursal.horaFinLunes
                );
                this.msgLunesDescansos[i] = this.msgHora;
                this.sucursal.validDescansosEnLunes[i] = this.validRangoDescansoEnDia;
                if (this.msgLunesDescansos[i] != '') {
                    $('#txtLunesDescansoFin' + i).addClass('errorCampo');
                    $('#txtLunesDescansoInicio' + i).addClass('errorCampo');
                } else {
                    $('#txtLunesDescansoInicio' + i).removeClass('errorCampo');
                    $('#txtLunesDescansoFin' + i).removeClass('errorCampo');
                }
            }
            for (let i = 0; i < this.sucursal.validDescansosEnLunes.length; i++) {
                if (!this.sucursal.validDescansosEnLunes[i]) {
                    this.validRango2[0] = false;
                }
            }
        }
        if (this.sucursal.martes) {
            for (let i = 0; i < this.sucursal.objetoMartes.length; i++) {
                this.validDescansosEnDia(
                    this.sucursal.objetoMartes[i].horaInicio,
                    this.sucursal.objetoMartes[i].horaFin,
                    this.sucursal.horaInicioMartes,
                    this.sucursal.horaFinMartes
                );
                this.msgMartesDescansos[i] = this.msgHora;
                this.sucursal.validDescansosEnMartes[i] = this.validRangoDescansoEnDia;
                if (this.msgMartesDescansos[i] != '') {
                    $('#txtMartesDescansoFin' + i).addClass('errorCampo');
                    $('#txtMartesDescansoInicio' + i).addClass('errorCampo');
                } else {
                    $('#txtMartesDescansoInicio' + i).removeClass('errorCampo');
                    $('#txtMartesDescansoFin' + i).removeClass('errorCampo');
                }
            }

            for (let i = 0; i < this.sucursal.validDescansosEnMartes.length; i++) {
                if (!this.sucursal.validDescansosEnMartes[i]) {
                    this.validRango2[1] = false;
                }
            }
        }

        if (this.sucursal.miercoles) {
            for (let i = 0; i < this.sucursal.objetoMiercoles.length; i++) {
                this.validDescansosEnDia(
                    this.sucursal.objetoMiercoles[i].horaInicio,
                    this.sucursal.objetoMiercoles[i].horaFin,
                    this.sucursal.horaInicioMiercoles,
                    this.sucursal.horaFinMiercoles
                );
                this.msgMiercolesDescansos[i] = this.msgHora;
                this.sucursal.validDescansosEnMiercoles[i] =
                    this.validRangoDescansoEnDia;
                if (this.msgMiercolesDescansos[i] != '') {
                    $('#txtMiercolesDescansoFin' + i).addClass('errorCampo');
                    $('#txtMiercolesDescansoInicio' + i).addClass('errorCampo');
                } else {
                    $('#txtMiercolesDescansoInicio' + i).removeClass('errorCampo');
                    $('#txtMiercolesDescansoFin' + i).removeClass('errorCampo');
                }
            }

            for (let i = 0; i < this.sucursal.validDescansosEnMiercoles.length; i++) {
                if (!this.sucursal.validDescansosEnMiercoles[i]) {
                    this.validRango2[2] = false;
                }
            }
        }

        if (this.sucursal.jueves) {
            for (let i = 0; i < this.sucursal.objetoJueves.length; i++) {
                this.validDescansosEnDia(
                    this.sucursal.objetoJueves[i].horaInicio,
                    this.sucursal.objetoJueves[i].horaFin,
                    this.sucursal.horaInicioJueves,
                    this.sucursal.horaFinJueves
                );
                this.msgJuevesDescansos[i] = this.msgHora;
                this.sucursal.validDescansosEnJueves[i] = this.validRangoDescansoEnDia;
                if (this.msgJuevesDescansos[i] != '') {
                    $('#txtJuevesDescansoFin' + i).addClass('errorCampo');
                    $('#txtJuevesDescansoInicio' + i).addClass('errorCampo');
                } else {
                    $('#txtJuevesDescansoInicio' + i).removeClass('errorCampo');
                    $('#txtJuevesDescansoFin' + i).removeClass('errorCampo');
                }
            }

            for (let i = 0; i < this.sucursal.validDescansosEnJueves.length; i++) {
                if (!this.sucursal.validDescansosEnJueves[i]) {
                    this.validRango2[3] = false;
                }
            }
        }

        if (this.sucursal.viernes) {
            for (let i = 0; i < this.sucursal.objetoViernes.length; i++) {
                this.validDescansosEnDia(
                    this.sucursal.objetoViernes[i].horaInicio,
                    this.sucursal.objetoViernes[i].horaFin,
                    this.sucursal.horaInicioViernes,
                    this.sucursal.horaFinViernes
                );
                this.msgViernesDescansos[i] = this.msgHora;
                this.sucursal.validDescansosEnViernes[i] = this.validRangoDescansoEnDia;
                if (this.msgViernesDescansos[i] != '') {
                    $('#txtViernesDescansoFin' + i).addClass('errorCampo');
                    $('#txtViernesDescansoInicio' + i).addClass('errorCampo');
                } else {
                    $('#txtViernesDescansoInicio' + i).removeClass('errorCampo');
                    $('#txtViernesDescansoFin' + i).removeClass('errorCampo');
                }
            }

            for (let i = 0; i < this.sucursal.validDescansosEnViernes.length; i++) {
                if (!this.sucursal.validDescansosEnViernes[i]) {
                    this.validRango2[4] = false;
                }
            }
        }

        if (this.sucursal.sabado) {
            for (let i = 0; i < this.sucursal.objetoSabado.length; i++) {
                this.validDescansosEnDia(
                    this.sucursal.objetoSabado[i].horaInicio,
                    this.sucursal.objetoSabado[i].horaFin,
                    this.sucursal.horaInicioSabado,
                    this.sucursal.horaFinSabado
                );
                this.msgSabadoDescansos[i] = this.msgHora;
                this.sucursal.validDescansosEnSabado[i] = this.validRangoDescansoEnDia;
                if (this.msgSabadoDescansos[i] != '') {
                    $('#txtSabadoDescansoFin' + i).addClass('errorCampo');
                    $('#txtSabadoDescansoInicio' + i).addClass('errorCampo');
                } else {
                    $('#txtSabadoDescansoInicio' + i).removeClass('errorCampo');
                    $('#txtSabadoDescansoFin' + i).removeClass('errorCampo');
                }
            }

            for (let i = 0; i < this.sucursal.validDescansosEnSabado.length; i++) {
                if (!this.sucursal.validDescansosEnSabado[i]) {
                    this.validRango2[5] = false;
                }
            }
        }

        if (this.sucursal.domingo) {
            for (let i = 0; i < this.sucursal.objetoDomingo.length; i++) {
                this.validDescansosEnDia(
                    this.sucursal.objetoDomingo[i].horaInicio,
                    this.sucursal.objetoDomingo[i].horaFin,
                    this.sucursal.horaInicioDomingo,
                    this.sucursal.horaFinDomingo
                );
                this.msgDomingoDescansos[i] = this.msgHora;
                this.sucursal.validDescansosEnDomingo[i] = JSON.parse(
                    JSON.stringify(this.validRangoDescansoEnDia)
                );
                if (this.msgDomingoDescansos[i] != '') {
                    $('#txtDomingoDescansoFin' + i).addClass('errorCampo');
                    $('#txtDomingoDescansoInicio' + i).addClass('errorCampo');
                } else {
                    $('#txtDomingoDescansoInicio' + i).removeClass('errorCampo');
                    $('#txtDomingoDescansoFin' + i).removeClass('errorCampo');
                }
            }

            for (let i = 0; i < this.sucursal.validDescansosEnDomingo.length; i++) {
                if (!this.sucursal.validDescansosEnDomingo[i]) {
                    this.validRango2[6] = false;
                }
            }
        }

        if (
            this.validRango2[0] &&
            this.validRango2[1] &&
            this.validRango2[2] &&
            this.validRango2[3] &&
            this.validRango2[4] &&
            this.validRango2[5] &&
            this.validRango2[6]
        ) {
            this.validRangoDescansosEnDia = true;
        }
    }

    validDescansosEnDia(
        horaInicioDescanso: any,
        horaFinDescanso: any,
        horaInicioDia: any,
        horaFinDia: any
    ) {
        if (
            horaInicioDescanso < horaInicioDia ||
            horaInicioDescanso > horaFinDia ||
            horaFinDescanso > horaFinDia
        ) {
            this.validRangoDescansoEnDia = false;
            this.msgHora = this.sucursalTranslate.descansoFueraHorario;
        } else {
            this.validRangoDescansoEnDia = true;
            this.msgHora = '';
        }
    }

    aceptarDescansos() {
        this.sucursal.validDescansosEnLunes = [];
        this.sucursal.validDescansosEnMartes = [];
        this.sucursal.validDescansosEnMiercoles = [];
        this.sucursal.validDescansosEnJueves = [];
        this.sucursal.validDescansosEnViernes = [];
        this.sucursal.validDescansosEnSabado = [];
        this.sucursal.validDescansosEnDomingo = [];

        this.sucursal.validRangosDescansosLunes = [];
        this.sucursal.validRangosDescansosMartes = [];
        this.sucursal.validRangosDescansosMiercoles = [];
        this.sucursal.validRangosDescansosJueves = [];
        this.sucursal.validRangosDescansosViernes = [];
        this.sucursal.validRangosDescansosSabado = [];
        this.sucursal.validRangosDescansosDomingo = [];

        this.validEmpalmeLunes = [];
        this.validEmpalmeMartes = [];
        this.validEmpalmeMiercoles = [];
        this.validEmpalmeJueves = [];
        this.validEmpalmeViernes = [];
        this.validEmpalmeSabado = [];
        this.validEmpalmeDomingo = [];
        this.sucursal.DescansosValidados = false;
        this.validarRangosDescansos();
        if (this.validRangoDescansos) {
            this.validarDescansosEnDia();
            if (this.validRangoDescansosEnDia) {
                this.validarDescansosEmpalmados();

                if (
                    !this.validEmpalmeLunes[1] &&
                    !this.validEmpalmeLunes[2] &&
                    !this.validEmpalmeMartes[1] &&
                    !this.validEmpalmeMartes[2] &&
                    !this.validEmpalmeMiercoles[1] &&
                    !this.validEmpalmeMiercoles[2] &&
                    !this.validEmpalmeJueves[1] &&
                    !this.validEmpalmeJueves[2] &&
                    !this.validEmpalmeViernes[1] &&
                    !this.validEmpalmeViernes[2] &&
                    !this.validEmpalmeSabado[1] &&
                    !this.validEmpalmeSabado[2] &&
                    !this.validEmpalmeDomingo[1] &&
                    !this.validEmpalmeDomingo[2]
                ) {
                    this.sucursal.DescansosValidados = true;
                }
            } else {
                this.validPestañaDescansos();
            }
        }
    }

    validarHorariosParaDescansos() {
        this.validarRangoHoras();
        if (
            this.validLunes &&
            this.validMartes &&
            this.validMiercoles &&
            this.validJueves &&
            this.validViernes &&
            this.validSabado &&
            this.validDomingo
        ) {
            if (
                this.sucursal.lunes ||
                this.sucursal.martes ||
                this.sucursal.miercoles ||
                this.sucursal.jueves ||
                this.sucursal.viernes ||
                this.sucursal.sabado ||
                this.sucursal.domingo
            ) {
                $('#aDescansos').css('pointer-events', '');
            } else {
                $('#aDescansos').css('pointer-events', 'none');
            }
        } else {
            $('#aDescansos').css('pointer-events', 'none');
        }
    }

    onFocusTxt(elemento: any) {
        if (this.guardar || this.guardarDescansos) {
            switch (elemento) {
                case 'txtEmail':
                    if (this.validEmail || this.validEmail === undefined) {
                        $('#' + elemento).removeClass('errorCampo');
                    }
                    break;
                case 'txtTelefono':
                    if (this.validTelefono || this.validTelefono === undefined) {
                        $('#' + elemento).removeClass('errorCampo');
                    }
                    break;
                case 'txtTelefono2':
                    if (this.validTelefono2 || this.validTelefono2 === undefined) {
                        $('#' + elemento).removeClass('errorCampo');
                    }
                    break;
                case 'txtHoraInicioLunes':
                    if (this.validLunes || this.validLunes === undefined) {
                        $('#' + elemento).removeClass('errorCampo');
                    }
                    break;
                case 'txtHoraFinLunes':
                    if (this.validLunes || this.validLunes === undefined) {
                        $('#' + elemento).removeClass('errorCampo');
                    }
                    break;
                case 'txtHoraInicioMartes':
                    if (this.validMartes || this.validMartes === undefined) {
                        $('#' + elemento).removeClass('errorCampo');
                    }
                    break;
                case 'txtHoraFinMartes':
                    if (this.validMartes || this.validMartes === undefined) {
                        $('#' + elemento).removeClass('errorCampo');
                    }
                    break;
                case 'txtHoraInicioMiercoles':
                    if (this.validMiercoles || this.validMiercoles === undefined) {
                        $('#' + elemento).removeClass('errorCampo');
                    }
                    break;
                case 'txtHoraFinMiercoles':
                    if (this.validMiercoles || this.validMiercoles === undefined) {
                        $('#' + elemento).removeClass('errorCampo');
                    }
                    break;
                case 'txtHoraInicioJueves':
                    if (this.validJueves || this.validJueves === undefined) {
                        $('#' + elemento).removeClass('errorCampo');
                    }
                    break;
                case 'txtHoraFinJueves':
                    if (this.validJueves || this.validJueves === undefined) {
                        $('#' + elemento).removeClass('errorCampo');
                    }
                    break;
                case 'txtHoraInicioViernes ':
                    if (this.validViernes || this.validViernes === undefined) {
                        $('#' + elemento).removeClass('errorCampo');
                    }
                    break;
                case 'txtHoraFinViernes ':
                    if (this.validViernes || this.validViernes === undefined) {
                        $('#' + elemento).removeClass('errorCampo');
                    }
                    break;
                case 'txtHoraInicioSabado ':
                    if (this.validSabado || this.validSabado === undefined) {
                        $('#' + elemento).removeClass('errorCampo');
                    }
                    break;
                case 'txtHoraFinSabado ':
                    if (this.validSabado || this.validSabado === undefined) {
                        $('#' + elemento).removeClass('errorCampo');
                    }
                    break;
                case 'txtHoraInicioDomingo ':
                    if (this.validDomingo || this.validDomingo === undefined) {
                        $('#' + elemento).removeClass('errorCampo');
                    }
                    break;
                case 'txtHoraFinDomingo ':
                    if (this.validDomingo || this.validDomingo === undefined) {
                        $('#' + elemento).removeClass('errorCampo');
                    }
                    break;
                case 'txtLunesDescansoInicio0':
                    if (
                        this.sucursal.validFormatDescansosLunes[0] ||
                        this.sucursal.validFormatDescansosLunes[0] === undefined
                    ) {
                        if (
                            this.sucursal.validRangosDescansosLunes[0] ||
                            this.sucursal.validRangosDescansosLunes[0] === undefined
                        ) {
                            if (
                                this.sucursal.validDescansosEnLunes[0] ||
                                this.sucursal.validDescansosEnLunes[0] === undefined
                            ) {
                                $('#' + elemento).removeClass('errorCampo');
                            }
                        }
                    }
                    break;
                case 'txtLunesDescansoFin0':
                    if (
                        this.sucursal.validFormatDescansosLunes[0] ||
                        this.sucursal.validFormatDescansosLunes[0] === undefined
                    ) {
                        if (
                            this.sucursal.validRangosDescansosLunes[0] ||
                            this.sucursal.validRangosDescansosLunes[0] === undefined
                        ) {
                            if (
                                this.sucursal.validDescansosEnLunes[0] ||
                                this.sucursal.validDescansosEnLunes[0] === undefined
                            ) {
                                $('#' + elemento).removeClass('errorCampo');
                            }
                        }
                    }
                    break;
                case 'txtLunesDescansoInicio1':
                    if (
                        this.sucursal.validFormatDescansosLunes[1] ||
                        this.sucursal.validFormatDescansosLunes[1] === undefined
                    ) {
                        if (
                            this.sucursal.validRangosDescansosLunes[1] ||
                            this.sucursal.validRangosDescansosLunes[1] === undefined
                        ) {
                            if (
                                this.sucursal.validDescansosEnLunes[1] ||
                                this.sucursal.validDescansosEnLunes[1] === undefined
                            ) {
                                if (
                                    !this.validEmpalmeLunes[1] ||
                                    this.validEmpalmeLunes[1] === undefined
                                ) {
                                    $('#' + elemento).removeClass('errorCampo');
                                }
                            }
                        }
                    }
                    break;
                case 'txtLunesDescansoFin1':
                    if (
                        this.sucursal.validFormatDescansosLunes[1] ||
                        this.sucursal.validFormatDescansosLunes[1] === undefined
                    ) {
                        if (
                            this.sucursal.validRangosDescansosLunes[1] ||
                            this.sucursal.validRangosDescansosLunes[1] === undefined
                        ) {
                            if (
                                this.sucursal.validDescansosEnLunes[1] ||
                                this.sucursal.validDescansosEnLunes[1] === undefined
                            ) {
                                if (
                                    !this.validEmpalmeLunes[1] ||
                                    this.validEmpalmeLunes[1] === undefined
                                ) {
                                    $('#' + elemento).removeClass('errorCampo');
                                }
                            }
                        }
                    }
                    break;
                case 'txtLunesDescansoInicio2':
                    if (
                        this.sucursal.validFormatDescansosLunes[2] ||
                        this.sucursal.validFormatDescansosLunes[2] === undefined
                    ) {
                        if (
                            this.sucursal.validRangosDescansosLunes[2] ||
                            this.sucursal.validRangosDescansosLunes[2] === undefined
                        ) {
                            if (
                                this.sucursal.validDescansosEnLunes[2] ||
                                this.sucursal.validDescansosEnLunes[2] === undefined
                            ) {
                                if (
                                    !this.validEmpalmeLunes[2] ||
                                    this.validEmpalmeLunes[2] === undefined
                                ) {
                                    $('#' + elemento).removeClass('errorCampo');
                                }
                            }
                        }
                    }
                    break;
                case 'txtLunesDescansoFin2':
                    if (
                        this.sucursal.validFormatDescansosLunes[2] ||
                        this.sucursal.validFormatDescansosLunes[2] === undefined
                    ) {
                        if (
                            this.sucursal.validRangosDescansosLunes[2] ||
                            this.sucursal.validRangosDescansosLunes[2] === undefined
                        ) {
                            if (
                                this.sucursal.validDescansosEnLunes[2] ||
                                this.sucursal.validDescansosEnLunes[2] === undefined
                            ) {
                                if (
                                    !this.validEmpalmeLunes[2] ||
                                    this.validEmpalmeLunes[2] === undefined
                                ) {
                                    $('#' + elemento).removeClass('errorCampo');
                                }
                            }
                        }
                    }
                    break;
                case 'txtMartesDescansoInicio0':
                    if (
                        this.sucursal.validFormatDescansosMartes[0] ||
                        this.sucursal.validFormatDescansosMartes[0] === undefined
                    ) {
                        if (
                            this.sucursal.validRangosDescansosMartes[0] ||
                            this.sucursal.validRangosDescansosMartes[0] === undefined
                        ) {
                            if (
                                this.sucursal.validDescansosEnMartes[0] ||
                                this.sucursal.validDescansosEnMartes[0] === undefined
                            ) {
                                $('#' + elemento).removeClass('errorCampo');
                            }
                        }
                    }
                    break;
                case 'txtMartesDescansoFin0':
                    if (
                        this.sucursal.validFormatDescansosMartes[0] ||
                        this.sucursal.validFormatDescansosMartes[0] === undefined
                    ) {
                        if (
                            this.sucursal.validRangosDescansosMartes[0] ||
                            this.sucursal.validRangosDescansosMartes[0] === undefined
                        ) {
                            if (
                                this.sucursal.validDescansosEnMartes[0] ||
                                this.sucursal.validDescansosEnMartes[0] === undefined
                            ) {
                                $('#' + elemento).removeClass('errorCampo');
                            }
                        }
                    }
                    break;
                case 'txtMartesDescansoInicio1':
                    if (
                        this.sucursal.validFormatDescansosMartes[1] ||
                        this.sucursal.validFormatDescansosMartes[1] === undefined
                    ) {
                        if (
                            this.sucursal.validRangosDescansosMartes[1] ||
                            this.sucursal.validRangosDescansosMartes[1] === undefined
                        ) {
                            if (
                                this.sucursal.validDescansosEnMartes[1] ||
                                this.sucursal.validDescansosEnMartes[1] === undefined
                            ) {
                                if (
                                    !this.validEmpalmeMartes[1] ||
                                    this.validEmpalmeMartes[1] === undefined
                                ) {
                                    $('#' + elemento).removeClass('errorCampo');
                                }
                            }
                        }
                    }
                    break;
                case 'txtMartesDescansoFin1':
                    if (
                        this.sucursal.validFormatDescansosMartes[1] ||
                        this.sucursal.validFormatDescansosMartes[1] === undefined
                    ) {
                        if (
                            this.sucursal.validRangosDescansosMartes[1] ||
                            this.sucursal.validRangosDescansosMartes[1] === undefined
                        ) {
                            if (
                                this.sucursal.validDescansosEnMartes[1] ||
                                this.sucursal.validDescansosEnMartes[1] === undefined
                            ) {
                                if (
                                    !this.validEmpalmeMartes[1] ||
                                    this.validEmpalmeMartes[1] === undefined
                                ) {
                                    $('#' + elemento).removeClass('errorCampo');
                                }
                            }
                        }
                    }
                    break;
                case 'txtMartesDescansoInicio2':
                    if (
                        this.sucursal.validFormatDescansosMartes[2] ||
                        this.sucursal.validFormatDescansosMartes[2] === undefined
                    ) {
                        if (
                            this.sucursal.validRangosDescansosMartes[2] ||
                            this.sucursal.validRangosDescansosMartes[2] === undefined
                        ) {
                            if (
                                this.sucursal.validDescansosEnMartes[2] ||
                                this.sucursal.validDescansosEnMartes[2] === undefined
                            ) {
                                if (
                                    !this.validEmpalmeMartes[2] ||
                                    this.validEmpalmeMartes[2] === undefined
                                ) {
                                    $('#' + elemento).removeClass('errorCampo');
                                }
                            }
                        }
                    }
                    break;
                case 'txtMartesDescansoFin2':
                    if (
                        this.sucursal.validFormatDescansosMartes[2] ||
                        this.sucursal.validFormatDescansosMartes[2] === undefined
                    ) {
                        if (
                            this.sucursal.validRangosDescansosMartes[2] ||
                            this.sucursal.validRangosDescansosMartes[2] === undefined
                        ) {
                            if (
                                this.sucursal.validDescansosEnMartes[2] ||
                                this.sucursal.validDescansosEnMartes[2] === undefined
                            ) {
                                if (
                                    !this.validEmpalmeMartes[2] ||
                                    this.validEmpalmeMartes[2] === undefined
                                ) {
                                    $('#' + elemento).removeClass('errorCampo');
                                }
                            }
                        }
                    }
                    break;
                case 'txtMiercolesDescansoInicio0':
                    if (
                        this.sucursal.validFormatDescansosMiercoles[0] ||
                        this.sucursal.validFormatDescansosMiercoles[0] === undefined
                    ) {
                        if (
                            this.sucursal.validRangosDescansosMiercoles[0] ||
                            this.sucursal.validRangosDescansosMiercoles[0] === undefined
                        ) {
                            if (
                                this.sucursal.validDescansosEnMiercoles[0] ||
                                this.sucursal.validDescansosEnMiercoles[0] === undefined
                            ) {
                                $('#' + elemento).removeClass('errorCampo');
                            }
                        }
                    }
                    break;
                case 'txtMiercolesDescansoFin0':
                    if (
                        this.sucursal.validFormatDescansosMiercoles[0] ||
                        this.sucursal.validFormatDescansosMiercoles[0] === undefined
                    ) {
                        if (
                            this.sucursal.validRangosDescansosMiercoles[0] ||
                            this.sucursal.validRangosDescansosMiercoles[0] === undefined
                        ) {
                            if (
                                this.sucursal.validDescansosEnMiercoles[0] ||
                                this.sucursal.validDescansosEnMiercoles[0] === undefined
                            ) {
                                $('#' + elemento).removeClass('errorCampo');
                            }
                        }
                    }
                    break;
                case 'txtMiercolesDescansoInicio1':
                    if (
                        this.sucursal.validFormatDescansosMiercoles[1] ||
                        this.sucursal.validFormatDescansosMiercoles[1] === undefined
                    ) {
                        if (
                            this.sucursal.validRangosDescansosMiercoles[1] ||
                            this.sucursal.validRangosDescansosMiercoles[1] === undefined
                        ) {
                            if (
                                this.sucursal.validDescansosEnMiercoles[1] ||
                                this.sucursal.validDescansosEnMiercoles[1] === undefined
                            ) {
                                if (
                                    !this.validEmpalmeMiercoles[1] ||
                                    this.validEmpalmeMiercoles[1] === undefined
                                ) {
                                    $('#' + elemento).removeClass('errorCampo');
                                }
                            }
                        }
                    }
                    break;
                case 'txtMiercolesDescansoFin1':
                    if (
                        this.sucursal.validFormatDescansosMiercoles[1] ||
                        this.sucursal.validFormatDescansosMiercoles[1] === undefined
                    ) {
                        if (
                            this.sucursal.validRangosDescansosMiercoles[1] ||
                            this.sucursal.validRangosDescansosMiercoles[1] === undefined
                        ) {
                            if (
                                this.sucursal.validDescansosEnMiercoles[1] ||
                                this.sucursal.validDescansosEnMiercoles[1] === undefined
                            ) {
                                if (
                                    !this.validEmpalmeMiercoles[1] ||
                                    this.validEmpalmeMiercoles[1] === undefined
                                ) {
                                    $('#' + elemento).removeClass('errorCampo');
                                }
                            }
                        }
                    }
                    break;
                case 'txtMiercolesDescansoInicio2':
                    if (
                        this.sucursal.validFormatDescansosMiercoles[2] ||
                        this.sucursal.validFormatDescansosMiercoles[2] === undefined
                    ) {
                        if (
                            this.sucursal.validRangosDescansosMiercoles[2] ||
                            this.sucursal.validRangosDescansosMiercoles[2] === undefined
                        ) {
                            if (
                                this.sucursal.validDescansosEnMiercoles[2] ||
                                this.sucursal.validDescansosEnMiercoles[2] === undefined
                            ) {
                                if (
                                    !this.validEmpalmeMiercoles[2] ||
                                    this.validEmpalmeMiercoles[2] === undefined
                                ) {
                                    $('#' + elemento).removeClass('errorCampo');
                                }
                            }
                        }
                    }
                    break;
                case 'txtMiercolesDescansoFin2':
                    if (
                        this.sucursal.validFormatDescansosMiercoles[2] ||
                        this.sucursal.validFormatDescansosMiercoles[2] === undefined
                    ) {
                        if (
                            this.sucursal.validRangosDescansosMiercoles[2] ||
                            this.sucursal.validRangosDescansosMiercoles[2] === undefined
                        ) {
                            if (
                                this.sucursal.validDescansosEnMiercoles[2] ||
                                this.sucursal.validDescansosEnMiercoles[2] === undefined
                            ) {
                                if (
                                    !this.validEmpalmeMiercoles[2] ||
                                    this.validEmpalmeMiercoles[2] === undefined
                                ) {
                                    $('#' + elemento).removeClass('errorCampo');
                                }
                            }
                        }
                    }
                    break;
                case 'txtJuevesDescansoInicio0':
                    if (
                        this.sucursal.validFormatDescansosJueves[0] ||
                        this.sucursal.validFormatDescansosJueves[0] === undefined
                    ) {
                        if (
                            this.sucursal.validRangosDescansosJueves[0] ||
                            this.sucursal.validRangosDescansosJueves[0] === undefined
                        ) {
                            if (
                                this.sucursal.validDescansosEnJueves[0] ||
                                this.sucursal.validDescansosEnJueves[0] === undefined
                            ) {
                                $('#' + elemento).removeClass('errorCampo');
                            }
                        }
                    }
                    break;
                case 'txtJuevesDescansoFin0':
                    if (
                        this.sucursal.validFormatDescansosJueves[0] ||
                        this.sucursal.validFormatDescansosJueves[0] === undefined
                    ) {
                        if (
                            this.sucursal.validRangosDescansosJueves[0] ||
                            this.sucursal.validRangosDescansosJueves[0] === undefined
                        ) {
                            if (
                                this.sucursal.validDescansosEnJueves[0] ||
                                this.sucursal.validDescansosEnJueves[0] === undefined
                            ) {
                                $('#' + elemento).removeClass('errorCampo');
                            }
                        }
                    }
                    break;
                case 'txtJuevesDescansoInicio1':
                    if (
                        this.sucursal.validFormatDescansosJueves[1] ||
                        this.sucursal.validFormatDescansosJueves[1] === undefined
                    ) {
                        if (
                            this.sucursal.validRangosDescansosJueves[1] ||
                            this.sucursal.validRangosDescansosJueves[1] === undefined
                        ) {
                            if (
                                this.sucursal.validDescansosEnJueves[1] ||
                                this.sucursal.validDescansosEnJueves[1] === undefined
                            ) {
                                if (
                                    !this.validEmpalmeJueves[1] ||
                                    this.validEmpalmeJueves[1] === undefined
                                ) {
                                    $('#' + elemento).removeClass('errorCampo');
                                }
                            }
                        }
                    }
                    break;
                case 'txtJuevesDescansoFin1':
                    if (
                        this.sucursal.validFormatDescansosJueves[1] ||
                        this.sucursal.validFormatDescansosJueves[1] === undefined
                    ) {
                        if (
                            this.sucursal.validRangosDescansosJueves[1] ||
                            this.sucursal.validRangosDescansosJueves[1] === undefined
                        ) {
                            if (
                                this.sucursal.validDescansosEnJueves[1] ||
                                this.sucursal.validDescansosEnJueves[1] === undefined
                            ) {
                                if (
                                    !this.validEmpalmeJueves[1] ||
                                    this.validEmpalmeJueves[1] === undefined
                                ) {
                                    $('#' + elemento).removeClass('errorCampo');
                                }
                            }
                        }
                    }
                    break;
                case 'txtJuevesDescansoInicio2':
                    if (
                        this.sucursal.validFormatDescansosJueves[2] ||
                        this.sucursal.validFormatDescansosJueves[2] === undefined
                    ) {
                        if (
                            this.sucursal.validRangosDescansosJueves[2] ||
                            this.sucursal.validRangosDescansosJueves[2] === undefined
                        ) {
                            if (
                                this.sucursal.validDescansosEnJueves[2] ||
                                this.sucursal.validDescansosEnJueves[2] === undefined
                            ) {
                                if (
                                    !this.validEmpalmeJueves[2] ||
                                    this.validEmpalmeJueves[2] === undefined
                                ) {
                                    $('#' + elemento).removeClass('errorCampo');
                                }
                            }
                        }
                    }
                    break;
                case 'txtJuevesDescansoFin2':
                    if (
                        this.sucursal.validFormatDescansosJueves[2] ||
                        this.sucursal.validFormatDescansosJueves[2] === undefined
                    ) {
                        if (
                            this.sucursal.validRangosDescansosJueves[2] ||
                            this.sucursal.validRangosDescansosJueves[2] === undefined
                        ) {
                            if (
                                this.sucursal.validDescansosEnJueves[2] ||
                                this.sucursal.validDescansosEnJueves[2] === undefined
                            ) {
                                if (
                                    !this.validEmpalmeJueves[2] ||
                                    this.validEmpalmeJueves[2] === undefined
                                ) {
                                    $('#' + elemento).removeClass('errorCampo');
                                }
                            }
                        }
                    }
                    break;
                case 'txtViernesDescansoInicio0':
                    if (
                        this.sucursal.validFormatDescansosViernes[0] ||
                        this.sucursal.validFormatDescansosViernes[0] === undefined
                    ) {
                        if (
                            this.sucursal.validRangosDescansosViernes[0] ||
                            this.sucursal.validRangosDescansosViernes[0] === undefined
                        ) {
                            if (
                                this.sucursal.validDescansosEnViernes[0] ||
                                this.sucursal.validDescansosEnViernes[0] === undefined
                            ) {
                                $('#' + elemento).removeClass('errorCampo');
                            }
                        }
                    }
                    break;
                case 'txtViernesDescansoFin0':
                    if (
                        this.sucursal.validFormatDescansosViernes[0] ||
                        this.sucursal.validFormatDescansosViernes[0] === undefined
                    ) {
                        if (
                            this.sucursal.validRangosDescansosViernes[0] ||
                            this.sucursal.validRangosDescansosViernes[0] === undefined
                        ) {
                            if (
                                this.sucursal.validDescansosEnViernes[0] ||
                                this.sucursal.validDescansosEnViernes[0] === undefined
                            ) {
                                $('#' + elemento).removeClass('errorCampo');
                            }
                        }
                    }
                    break;
                case 'txtViernesDescansoInicio1':
                    if (
                        this.sucursal.validFormatDescansosViernes[1] ||
                        this.sucursal.validFormatDescansosViernes[1] === undefined
                    ) {
                        if (
                            this.sucursal.validRangosDescansosViernes[1] ||
                            this.sucursal.validRangosDescansosViernes[1] === undefined
                        ) {
                            if (
                                this.sucursal.validDescansosEnViernes[1] ||
                                this.sucursal.validDescansosEnViernes[1] === undefined
                            ) {
                                if (
                                    !this.validEmpalmeViernes[1] ||
                                    this.validEmpalmeViernes[1] === undefined
                                ) {
                                    $('#' + elemento).removeClass('errorCampo');
                                }
                            }
                        }
                    }
                    break;
                case 'txtViernesDescansoFin1':
                    if (
                        this.sucursal.validFormatDescansosViernes[1] ||
                        this.sucursal.validFormatDescansosViernes[1] === undefined
                    ) {
                        if (
                            this.sucursal.validRangosDescansosViernes[1] ||
                            this.sucursal.validRangosDescansosViernes[1] === undefined
                        ) {
                            if (
                                this.sucursal.validDescansosEnViernes[1] ||
                                this.sucursal.validDescansosEnViernes[1] === undefined
                            ) {
                                if (
                                    !this.validEmpalmeViernes[1] ||
                                    this.validEmpalmeViernes[1] === undefined
                                ) {
                                    $('#' + elemento).removeClass('errorCampo');
                                }
                            }
                        }
                    }
                    break;
                case 'txtViernesDescansoInicio2':
                    if (
                        this.sucursal.validFormatDescansosViernes[2] ||
                        this.sucursal.validFormatDescansosViernes[2] === undefined
                    ) {
                        if (
                            this.sucursal.validRangosDescansosViernes[2] ||
                            this.sucursal.validRangosDescansosViernes[2] === undefined
                        ) {
                            if (
                                this.sucursal.validDescansosEnViernes[2] ||
                                this.sucursal.validDescansosEnViernes[2] === undefined
                            ) {
                                if (
                                    !this.validEmpalmeViernes[2] ||
                                    this.validEmpalmeViernes[2] === undefined
                                ) {
                                    $('#' + elemento).removeClass('errorCampo');
                                }
                            }
                        }
                    }
                    break;
                case 'txtViernesDescansoFin2':
                    if (
                        this.sucursal.validFormatDescansosViernes[2] ||
                        this.sucursal.validFormatDescansosViernes[2] === undefined
                    ) {
                        if (
                            this.sucursal.validRangosDescansosViernes[2] ||
                            this.sucursal.validRangosDescansosViernes[2] === undefined
                        ) {
                            if (
                                this.sucursal.validDescansosEnViernes[2] ||
                                this.sucursal.validDescansosEnViernes[2] === undefined
                            ) {
                                if (
                                    !this.validEmpalmeViernes[2] ||
                                    this.validEmpalmeViernes[2] === undefined
                                ) {
                                    $('#' + elemento).removeClass('errorCampo');
                                }
                            }
                        }
                    }
                    break;
                case 'txtSabadoDescansoInicio0':
                    if (
                        this.sucursal.validFormatDescansosSabado[0] ||
                        this.sucursal.validFormatDescansosSabado[0] === undefined
                    ) {
                        if (
                            this.sucursal.validRangosDescansosSabado[0] ||
                            this.sucursal.validRangosDescansosSabado[0] === undefined
                        ) {
                            if (
                                this.sucursal.validDescansosEnSabado[0] ||
                                this.sucursal.validDescansosEnSabado[0] === undefined
                            ) {
                                $('#' + elemento).removeClass('errorCampo');
                            }
                        }
                    }
                    break;
                case 'txtSabadoDescansoFin0':
                    if (
                        this.sucursal.validFormatDescansosSabado[0] ||
                        this.sucursal.validFormatDescansosSabado[0] === undefined
                    ) {
                        if (
                            this.sucursal.validRangosDescansosSabado[0] ||
                            this.sucursal.validRangosDescansosSabado[0] === undefined
                        ) {
                            if (
                                this.sucursal.validDescansosEnSabado[0] ||
                                this.sucursal.validDescansosEnSabado[0] === undefined
                            ) {
                                $('#' + elemento).removeClass('errorCampo');
                            }
                        }
                    }
                    break;
                case 'txtSabadoDescansoInicio1':
                    if (
                        this.sucursal.validFormatDescansosSabado[1] ||
                        this.sucursal.validFormatDescansosSabado[1] === undefined
                    ) {
                        if (
                            this.sucursal.validRangosDescansosSabado[1] ||
                            this.sucursal.validRangosDescansosSabado[1] === undefined
                        ) {
                            if (
                                this.sucursal.validDescansosEnSabado[1] ||
                                this.sucursal.validDescansosEnSabado[1] === undefined
                            ) {
                                if (
                                    !this.validEmpalmeSabado[1] ||
                                    this.validEmpalmeSabado[1] === undefined
                                ) {
                                    $('#' + elemento).removeClass('errorCampo');
                                }
                            }
                        }
                    }
                    break;
                case 'txtSabadoDescansoFin1':
                    if (
                        this.sucursal.validFormatDescansosSabado[1] ||
                        this.sucursal.validFormatDescansosSabado[1] === undefined
                    ) {
                        if (
                            this.sucursal.validRangosDescansosSabado[1] ||
                            this.sucursal.validRangosDescansosSabado[1] === undefined
                        ) {
                            if (
                                this.sucursal.validDescansosEnSabado[1] ||
                                this.sucursal.validDescansosEnSabado[1] === undefined
                            ) {
                                if (
                                    !this.validEmpalmeSabado[1] ||
                                    this.validEmpalmeSabado[1] === undefined
                                ) {
                                    $('#' + elemento).removeClass('errorCampo');
                                }
                            }
                        }
                    }
                    break;
                case 'txtSabadoDescansoInicio2':
                    if (
                        this.sucursal.validFormatDescansosSabado[2] ||
                        this.sucursal.validFormatDescansosSabado[2] === undefined
                    ) {
                        if (
                            this.sucursal.validRangosDescansosSabado[2] ||
                            this.sucursal.validRangosDescansosSabado[2] === undefined
                        ) {
                            if (
                                this.sucursal.validDescansosEnSabado[2] ||
                                this.sucursal.validDescansosEnSabado[2] === undefined
                            ) {
                                if (
                                    !this.validEmpalmeSabado[2] ||
                                    this.validEmpalmeSabado[2] === undefined
                                ) {
                                    $('#' + elemento).removeClass('errorCampo');
                                }
                            }
                        }
                    }
                    break;
                case 'txtSabadoDescansoFin2':
                    if (
                        this.sucursal.validFormatDescansosSabado[2] ||
                        this.sucursal.validFormatDescansosSabado[2] === undefined
                    ) {
                        if (
                            this.sucursal.validRangosDescansosSabado[2] ||
                            this.sucursal.validRangosDescansosSabado[2] === undefined
                        ) {
                            if (
                                this.sucursal.validDescansosEnSabado[2] ||
                                this.sucursal.validDescansosEnSabado[2] === undefined
                            ) {
                                if (
                                    !this.validEmpalmeSabado[2] ||
                                    this.validEmpalmeSabado[2] === undefined
                                ) {
                                    $('#' + elemento).removeClass('errorCampo');
                                }
                            }
                        }
                    }
                    break;
                case 'txtDomingoDescansoInicio0':
                    if (
                        this.sucursal.validFormatDescansosDomingo[0] ||
                        this.sucursal.validFormatDescansosDomingo[0] === undefined
                    ) {
                        if (
                            this.sucursal.validRangosDescansosDomingo[0] ||
                            this.sucursal.validRangosDescansosDomingo[0] === undefined
                        ) {
                            if (
                                this.sucursal.validDescansosEnDomingo[0] ||
                                this.sucursal.validDescansosEnDomingo[0] === undefined
                            ) {
                                $('#' + elemento).removeClass('errorCampo');
                            }
                        }
                    }
                    break;
                case 'txtDomingoDescansoFin0':
                    if (
                        this.sucursal.validFormatDescansosDomingo[0] ||
                        this.sucursal.validFormatDescansosDomingo[0] === undefined
                    ) {
                        if (
                            this.sucursal.validRangosDescansosDomingo[0] ||
                            this.sucursal.validRangosDescansosDomingo[0] === undefined
                        ) {
                            if (
                                this.sucursal.validDescansosEnDomingo[0] ||
                                this.sucursal.validDescansosEnDomingo[0] === undefined
                            ) {
                                $('#' + elemento).removeClass('errorCampo');
                            }
                        }
                    }
                    break;
                case 'txtDomingoDescansoInicio1':
                    if (
                        this.sucursal.validFormatDescansosDomingo[1] ||
                        this.sucursal.validFormatDescansosDomingo[1] === undefined
                    ) {
                        if (
                            this.sucursal.validRangosDescansosDomingo[1] ||
                            this.sucursal.validRangosDescansosDomingo[1] === undefined
                        ) {
                            if (
                                this.sucursal.validDescansosEnDomingo[1] ||
                                this.sucursal.validDescansosEnDomingo[1] === undefined
                            ) {
                                if (
                                    !this.validEmpalmeDomingo[1] ||
                                    this.validEmpalmeDomingo[1] === undefined
                                ) {
                                    $('#' + elemento).removeClass('errorCampo');
                                }
                            }
                        }
                    }
                    break;
                case 'txtDomingoDescansoFin1':
                    if (
                        this.sucursal.validFormatDescansosDomingo[1] ||
                        this.sucursal.validFormatDescansosDomingo[1] === undefined
                    ) {
                        if (
                            this.sucursal.validRangosDescansosDomingo[1] ||
                            this.sucursal.validRangosDescansosDomingo[1] === undefined
                        ) {
                            if (
                                this.sucursal.validDescansosEnDomingo[1] ||
                                this.sucursal.validDescansosEnDomingo[1] === undefined
                            ) {
                                if (
                                    !this.validEmpalmeDomingo[1] ||
                                    this.validEmpalmeDomingo[1] === undefined
                                ) {
                                    $('#' + elemento).removeClass('errorCampo');
                                }
                            }
                        }
                    }
                    break;
                case 'txtDomingoDescansoInicio2':
                    if (
                        this.sucursal.validFormatDescansosDomingo[2] ||
                        this.sucursal.validFormatDescansosDomingo[2] === undefined
                    ) {
                        if (
                            this.sucursal.validRangosDescansosDomingo[2] ||
                            this.sucursal.validRangosDescansosDomingo[2] === undefined
                        ) {
                            if (
                                this.sucursal.validDescansosEnDomingo[2] ||
                                this.sucursal.validDescansosEnDomingo[2] === undefined
                            ) {
                                if (
                                    !this.validEmpalmeDomingo[2] ||
                                    this.validEmpalmeDomingo[2] === undefined
                                ) {
                                    $('#' + elemento).removeClass('errorCampo');
                                }
                            }
                        }
                    }
                    break;
                case 'txtDomingoDescansoFin2':
                    if (
                        this.sucursal.validFormatDescansosDomingo[2] ||
                        this.sucursal.validFormatDescansosDomingo[2] === undefined
                    ) {
                        if (
                            this.sucursal.validRangosDescansosDomingo[2] ||
                            this.sucursal.validRangosDescansosDomingo[2] === undefined
                        ) {
                            if (
                                this.sucursal.validDescansosEnDomingo[2] ||
                                this.sucursal.validDescansosEnDomingo[2] === undefined
                            ) {
                                if (
                                    !this.validEmpalmeDomingo[2] ||
                                    this.validEmpalmeDomingo[2] === undefined
                                ) {
                                    $('#' + elemento).removeClass('errorCampo');
                                }
                            }
                        }
                    }
                    break;
                default:
                    $('#' + elemento).removeClass('errorCampo');
                    break;
            }
        }
    }

    onBlurTxt(elemento: any) {
        this.validarHorariosParaDescansos();
        if (this.guardar) {
            if ((document.getElementById(elemento) as any)!.value === '') {
                $('#' + elemento).addClass('errorCampo');
            }
        }
    }

    onClickDdl(elemento: any) {
        this.elementoDdl = elemento;
        if (this.guardar) {
            if (elemento === 'ddlCategorias') {
                if (this.validMaxCategorias) {
                    $('#' + elemento).removeClass('errorCampo');
                }
            } else {
                $('#' + elemento).removeClass('errorCampo');
            }
        }
    }

    validarNum(e: any) {
        let key;
        if (window.event) {
            // IE
            key = e.keyCode;
        } else if (e.which) {
            // Netscape/Firefox/Opera
            key = e.which;
        }
        if (key < 48 || key > 57) {
            if (key == 8) {
                // Detectar backspace (retroceso)
                return true;
            } else {
                return false;
            }
        }
        return true;
    }

    validarDescartarActualizar(): boolean {
        return (
            this.sucursal.nombre != this.sucursal.dataSucursal[0].nombre ||
            this.sucursal.email != this.sucursal.dataSucursal[0].email ||
            this.sucursal.telefono != this.sucursal.dataSucursal[0].telefono ||
            this.sucursal.telefono2 != this.sucursal.dataSucursal[0].telefono2 ||
            this.sucursal.idioma != this.sucursal.dataSucursal[0].idIdioma ||
            this.sucursal.calle != this.sucursal.dataSucursal[0].calle ||
            this.sucursal.entreCalles != this.sucursal.dataSucursal[0].entreCalles ||
            this.sucursal.numero != this.sucursal.dataSucursal[0].numero ||
            this.sucursal.numeroInterior !=
            this.sucursal.dataSucursal[0].numeroInterior ||
            this.sucursal.colonia != this.sucursal.dataSucursal[0].colonia ||
            this.sucursal.codigoPostal !=
            this.sucursal.dataSucursal[0].codigoPostal ||
            this.sucursal.pais != this.sucursal.dataSucursal[0].idPais ||
            this.sucursal.estado != this.sucursal.dataSucursal[0].idEstado ||
            this.sucursal.ciudad != this.sucursal.dataSucursal[0].idCiudad ||
            this.sucursal.facebook != this.sucursal.dataSucursal[0].facebook ||
            this.sucursal.twitter != this.sucursal.dataSucursal[0].twitter ||
            this.sucursal.paginaWeb != this.sucursal.dataSucursal[0].paginaWeb ||
            this.sucursal.instagram != this.sucursal.dataSucursal[0].instagram ||
            this.sucursal.imagenRecortada != this.sucursal.logoCargado ||
            this.sucursal.estaActiva != this.sucursal.dataSucursal[0].estaActiva
        );
    }

    validarDescartarNuevo(): boolean {
        const idPais = this.sucursal.dataPaisSeleccionado
            ? this.sucursal.dataPaisSeleccionado[0].idPais
            : undefined;

        return (
            this.sucursal.nombre != '' ||
            this.sucursal.email != this.sucursal.dataSucursales[0].email ||
            this.sucursal.telefono != '' ||
            this.sucursal.telefono2 != '' ||
            this.sucursal.idioma != this.sucursal.dataSucursales[0].idIdioma ||
            this.sucursal.calle != this.calle ||
            this.sucursal.entreCalles != '' ||
            this.sucursal.numero != this.numero ||
            this.sucursal.numeroInterior != '' ||
            this.sucursal.colonia != this.colonia ||
            this.sucursal.codigoPostal != this.codigoPostal ||
            this.sucursal.pais != idPais ||
            idPais === undefined ||
            this.sucursal.estado != this.estadoSeleccionado ||
            this.estadoSeleccionado === undefined ||
            this.sucursal.ciudad !=
            this.sucursal.dataCiudadSeleccionada[0].idCiudad ||
            this.sucursal.dataCiudadSeleccionada[0].idCiudad === undefined ||
            !this.sucursal.lunes ||
            !this.sucursal.martes ||
            !this.sucursal.miercoles ||
            !this.sucursal.jueves ||
            !this.sucursal.viernes ||
            this.sucursal.sabado ||
            this.sucursal.domingo ||
            this.sucursal.facebook != '' ||
            this.sucursal.twitter != '' ||
            this.sucursal.paginaWeb != '' ||
            this.sucursal.instagram != '' ||
            this.sucursal.imagenRecortada != this.sucursal.logoCargado ||
            this.sucursal.foto.length > 0
        );
    }

    async cargarVentanas() {
        new Promise((reject) => {
            for (let index = 4; index >= 0; index--) {
                setTimeout(() => {
                    this.tabSelect = index;
                }, 3);
            }
        });
    }
}
