import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MethodsService } from 'src/app/core/services/methods.service';
import { PantallaService } from 'src/app/core/services/pantalla.service';
import { ToasterService } from 'src/shared/toaster/toaster.service';
import pdfMake from 'pdfmake/build/pdfmake';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import moment from 'moment';
import { vfsFontObject } from '../../../../assets/fonts/vfs_fonts';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
declare var $: any; // JQUERY

pdfMake.vfs = vfsFontObject;

@Component({
    selector: 'app-configurar-ticket',
    templateUrl: './configurar-ticket.component.html',
    styleUrls: [
        './configurar-ticket.component.scss',
        '../../page.component.scss',
    ],
})
export class ConfigurarTicketComponent implements OnInit {
    // Variable de translate de sucursal
    configurarTicketTranslate: any = {};
    consultaClienteTranslate: any = {}
    informacionFiscalSucursalTranslate: any = {}
    sessionTraslate: any = {};
    
    // Modales
    modales: any = {};

    //Validacion de acceso de acciones
    permiso_accion: boolean = false;

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

        this._translate.get('configurarTicketTranslate').subscribe((translated: string) => {
            this.configurarTicketTranslate = this._translate.instant('configurarTicketTranslate');
            this.sessionTraslate = this._translate.instant('sessionTraslate');
            this.consultaClienteTranslate = this._translate.instant('consultaClienteTranslate');
            this.informacionFiscalSucursalTranslate = this._translate.instant('informacionFiscalSucursalTranslate');
            this.insertarVariable();
        });
        
        this.matIconRegistry.addSvgIcon('iconAgregar', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Agregar-1-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconEditar', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Editar-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconBasura', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Basura-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconGuardar', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Guardar-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconCerrar', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/MasPequena-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconInfo', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/AlarmaCirculo-icon.svg"));
		this.matIconRegistry.addSvgIcon('iconCasita', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Casa1-icon.svg"));
		this.matIconRegistry.addSvgIcon('iconFlechaDerecha', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/FlechaDerechaPequena-icon.svg"));

        this.permiso_accion = String(this._pantallaServicio.session['CONFIGCT010'] || '') === '1';
    }

    ngOnInit(): void {
    }

    //------------------------------ Variables -------------------------------------------------------------//

    /* Variable "control" almacena variables y funciones para realizar operaciones
    que procesen y validen el formulario en la vista configurarTicket*/
    control: any = {
        enValidacion: false,
        guardarDisabled: false,
        cambiosNoGuardados: false,
        primeraCarga: false,
        watchActivo: false,
        toStateTemp: {},
    };

    /* Definicion inicial de elementos que forman el ticket*/
    ticket: any = {
        cabecera: {
            textoTotal: [],
            maxLineas: 5,
            linea: '',
            bold: false,
            italic: false,
            tamanioLetra: '',
            alineacion: null
        },
        cabeceraTemp: {
            textoTotal: []
        },
        pieDePagina: {
            textoTotal: [],
            maxLineas: 5,
            linea: '',
            bold: false,
            italic: false,
            tamanioLetra: '',
            alineacion: null
        },
        pieDePaginaTemp: {
            textoTotal: []
        },
        dataLineas: [],
        ancho: [],
        dataTipoHoja: '',
        respTipoHoja: '',
        margenExtra: 0,
        waiting: false,
        contenido: {
            dataCompras: [],
        },
        tamaniosLetraA7: [
            { id: 1, tamanio: 6, maxLength: 57 },
            { id: 2, tamanio: 8, maxLength: 42 },
            { id: 3, tamanio: 10, maxLength: 34 },
            { id: 4, tamanio: 12, maxLength: 28 },
            { id: 5, tamanio: 14, maxLength: 24 }
        ],
        tamaniosLetraA8: [
            { id: 1, tamanio: 5, maxLength: 45 },
            { id: 2, tamanio: 8, maxLength: 28 },
            { id: 3, tamanio: 10, maxLength: 22 },
            { id: 4, tamanio: 12, maxLength: 19 },
            { id: 5, tamanio: 14, maxLength: 16 }
        ],
        tamaniosLetraA9: [
            { id: 1, tamanio: 3, maxLength: 57 },
            { id: 2, tamanio: 6, maxLength: 28 },
            { id: 3, tamanio: 8, maxLength: 21 },
            { id: 4, tamanio: 10, maxLength: 17 },
            { id: 5, tamanio: 12, maxLength: 14 }
        ],
        tamaniosLetraA10: [
            { id: 1, tamanio: 2, maxLength: 57 },
            { id: 2, tamanio: 3, maxLength: 38 },
            { id: 3, tamanio: 5, maxLength: 23 },
            { id: 4, tamanio: 6, maxLength: 19 },
            { id: 5, tamanio: 8, maxLength: 14 }
        ],
        alineacion: [],
        separador: [
            { id: 'Continua', texto: '- - - - - - - - - - - - - - - - - - - - - - - - - - - - -' },
            { id: 'A7', texto: '- - - - - - - - - - - - - - - - - - - - - - - - - - - - -' },
            { id: 'A8', texto: '- - - - - - - - - - - - - - - - - - - - - - -' },
            { id: 'A9', texto: '- - - - - - - - - - - - - - - - - - - - - - - -' },
            { id: 'A10', texto: '- - - - - - - - - - - - - - - - - - - - - - - -' }
        ],
        isIva: false,
        subtotal: 500.00,
        iva: .16,
        folio: '0000000000',
        tipo: {
            ancho: '',
        },
        tipoHoja: [],
        tamaniosLetra: '',
    };

    /* Almacena los datos finales despues de ser procesados para imprimir ticket */
    output: any = {
        cabecera: [],
        pieDePagina: [],
        hoja: {
            pageSize: 'none',
        },
    };

    hoy: any = null;
    tempTipo: any = null;
    tempTipoAncho: any = null;

    // Variables de migracion con el entorno actual
    tipoHojaSelect: any = "";
    anchoHojaSelect: any = "";

    //------------------------------ Funciones -------------------------------------------------------------//

    insertarVariable() {
        this.ticket.contenido.dataCompras = [
            { descripcion: this.configurarTicketTranslate.servicioPrueba, pago: '$100.00' },
            { descripcion: this.configurarTicketTranslate.servicioPrueba2, pago: '$100.00' },
            { descripcion: this.configurarTicketTranslate.servicioPrueba3, pago: '$300.00' }
        ],
            this.ticket.alineacion = [
                { id: 1, tipo: this.configurarTicketTranslate.izquierda, desc: 'left' },
                { id: 2, tipo: this.configurarTicketTranslate.centro, desc: 'center' },
                { id: 3, tipo: this.configurarTicketTranslate.derecha, desc: 'right' }
            ];
        this.ticket.tipoHoja = [
            { id: 0, tipo: this.configurarTicketTranslate.continua, pageSize: 'n', dftFontSize: this.ticket.tamaniosLetraA7[0].tamanio, mgnIzquierdo: 12, mgnDerecho: 10, mgnSuperior: 0, mgnInferior: 0 },
            { id: 1, tipo: 'A7 (7.4 X 10.5 cm)', pageSize: 'A7', dftFontSize: this.ticket.tamaniosLetraA7[0].tamanio, mgnIzquierdo: 12, mgnDerecho: 10, mgnSuperior: 10, mgnInferior: 5 },
            { id: 2, tipo: 'A8 (5.2 X 7.4 cm)', pageSize: 'A8', dftFontSize: this.ticket.tamaniosLetraA8[0].tamanio, mgnIzquierdo: 12, mgnDerecho: 10, mgnSuperior: 10, mgnInferior: 5 },
            { id: 3, tipo: 'A9 (3.7 X 5.2 cm)', pageSize: 'A9', dftFontSize: this.ticket.tamaniosLetraA9[0].tamanio, mgnIzquierdo: 5, mgnDerecho: 5, mgnSuperior: 5, mgnInferior: 5 },
            { id: 4, tipo: 'A10 (2.6 X 3.7 cm)', pageSize: 'A10', dftFontSize: this.ticket.tamaniosLetraA10[0].tamanio, mgnIzquierdo: 5, mgnDerecho: 5, mgnSuperior: 3, mgnInferior: 3 },
        ];
        this.ticket.ancho = [
            { id: 1, tipo: '7.4 cm', pageSize: 'A7', dftFontSize: this.ticket.tamaniosLetraA7[0].tamanio, mgnIzquierdo: 12, mgnDerecho: 10, mgnSuperior: 0, mgnInferior: 0 },
            { id: 2, tipo: '5.2 cm', pageSize: 'A8', dftFontSize: this.ticket.tamaniosLetraA8[0].tamanio, mgnIzquierdo: 12, mgnDerecho: 10, mgnSuperior: 0, mgnInferior: 0 },
            { id: 3, tipo: '3.7 cm', pageSize: 'A9', dftFontSize: this.ticket.tamaniosLetraA9[0].tamanio, mgnIzquierdo: 5, mgnDerecho: 5, mgnSuperior: 0, mgnInferior: 0 },
            { id: 4, tipo: '2.6 cm', pageSize: 'A10', dftFontSize: this.ticket.tamaniosLetraA10[0].tamanio, mgnIzquierdo: 5, mgnDerecho: 5, mgnSuperior: 0, mgnInferior: 0 },
        ];
        this.ticket.cabecera.alineacion = this.ticket.alineacion[0].id.toString();
        this.ticket.pieDePagina.alineacion = this.ticket.alineacion[0].id.toString();
        this.ticket.tamaniosLetra = this.ticket.tamaniosLetraA7;
        this.ticket.cabecera.tamanioLetra = this.ticket.tamaniosLetra[0];
        this.ticket.pieDePagina.tamanioLetra = this.ticket.tamaniosLetra[0];
        this.output.separador = this.ticket.separador[0].texto;
        this.output.hoja.dftFontSize = this.ticket.tipoHoja[0].dftFontSize;
        this.output.hoja.pageMargins = [(this.ticket.tipoHoja[0].mgnIzquierdo + this.ticket.margenExtra), this.ticket.tipoHoja[0].mgnSuperior,
        (this.ticket.tipoHoja[0].mgnDerecho + this.ticket.margenExtra), this.ticket.tipoHoja[0].mgnInferior];
        this.ticket.cabecera.tamanioLetraId = this.ticket.tamaniosLetra[0].id;
        this.ticket.pieDePagina.tamanioLetraId = this.ticket.tamaniosLetra[0].id;
        this.getAllData();
    }

    /* Si la variable watchAtivo es verdadera, permite al observador de cambios asignar en la variable "cambiosNoGuardados" si hubo cambios*/
    activarWatch() {
        this.control.watchActivo = true;
    }

    /* Si se desea descartar, se redirige a la url del estado previamente almacenado, si no, permanece en la página */
    descartar(resp: any) {
        if (resp === "SI") {
            this._router.navigate([this.control.toStateTemp.url])
            this.control.primeraCarga = true;
            this.control.cambiosNoGuardados = false;
        }
        else {
            this.control.cambiosNoGuardados = true;
            this._router.navigate(['/configurarTicket'])
        }
    }

    /* Establece la hora actual */
    getToday() {
        this.hoy = moment().format("MM d y HH:mm");
        if (this._pantallaServicio.idioma === "es-mx") {
            this.hoy = moment().format("d MM y HH:mm");
        }
    }

    /* Si el input a evaluar es requerido y está vacío, el contorno se establece en rojo */
    validarInput(id: any) {
        let input: any = $("#" + id);

        if (input[0].disabled === false) {
            if (input[0].value !== '') {
                this.control.enValidacion = false;
                input.removeClass("errorCampo");
            }
            else {
                this.control.enValidacion = true;
                input.addClass("errorCampo");
            }
        }
    }

    /* Input en cabecera y pie de pagina se establecen a su contorno original */
    inputsValidos() {
        this.control.enValidacion = false;
        $("#textoLineaCab").removeClass("errorCampo");
        $("#textoLineaPie").removeClass("errorCampo");
    }

    /* Al entrar en focus en el input el contorno se establece en su valor original */
    onFocusTxt(id: any) {
        let input = $("#" + id);
        input.removeClass("errorCampo");
    }

    /* Al entrar en blur en el input el contorno se establece en rojo si está vacío y ha sido marcado como requedido */
    onBlurTxt(id: any) {
        let input: any = $("#" + id);
        if (this.control.enValidacion) {
            if (input[0].value !== '') {
                input.removeClass("errorCampo");
            }
            else {
                input.addClass("errorCampo");
            }
        }
    }

    //FUNCIONES QUE ACCESAN A LA B.D.--------------------------------------------------------------------------------------------------------------
    /* Obtiene datos de tipo de hoja y lineas previamente almacenadas en la B.D.*/
    getAllData() {
        this._pantallaServicio.mostrarSpinner();
        this._backService.HttpPost('catalogos/ConfigurarTicket/getConfigHoja', {}, {}).subscribe(response => {
            this.ticket.dataTipoHoja = String(response);

            this._backService.HttpPost('catalogos/ConfigurarTicket/getLineas', {}, {}).subscribe(response => {
                this.ticket.dataLineas = eval(response);
                this.setHoja();

                if (this.ticket.dataLineas === null || this.ticket.dataLineas.length === 0) {
                    this.ticket.dataLineas = [];
                    this.ticket.margenExtra = "0";
                }
                else {
                    this.ticket.margenExtra = this.ticket.dataLineas[0].margenExtra;
                    this.setLineas();
                }
                this._pantallaServicio.ocultarSpinner();
            }, error => {
                this._pantallaServicio.ocultarSpinner();
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
            })
        }, error => {
            this._pantallaServicio.ocultarSpinner();
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
        })
    }

    /* Establece la configuracion inicial de la hoja para una sucursal en específico */
    setHoja() {
        const tipoHoja = this.ticket.dataTipoHoja;
        this.ticket.respTipoHoja = this.ticket.dataTipoHoja;
        this.ticket.tipo = this.ticket.tipoHoja[0];
        this.tipoHojaSelect = this.ticket.tipoHoja[0].id;
        switch (tipoHoja) {
            case 'A7':
                this.ticket.tipo = this.ticket.tipoHoja[1];
                this.tipoHojaSelect = this.ticket.tipoHoja[1].id;
                break;
            case 'A8':
                this.ticket.tipo = this.ticket.tipoHoja[2];
                this.tipoHojaSelect = this.ticket.tipoHoja[2].id;
                break;
            case 'A9':
                this.ticket.tipo = this.ticket.tipoHoja[3];
                this.tipoHojaSelect = this.ticket.tipoHoja[3].id;
                break;
            case 'A10':
                this.ticket.tipo = this.ticket.tipoHoja[4];
                this.tipoHojaSelect = this.ticket.tipoHoja[4].id;
                break;
            case 'A8Continua':
                this.ticket.tipo.ancho = this.ticket.ancho[1];
                this.anchoHojaSelect = this.ticket.ancho[1].id;
                break;
            case 'A9Continua':
                this.ticket.tipo.ancho = this.ticket.ancho[2];
                this.anchoHojaSelect = this.ticket.ancho[2].id;
                break;
            case 'A10Continua':
                this.ticket.tipo.ancho = this.ticket.ancho[3];
                this.anchoHojaSelect = this.ticket.ancho[3].id;
                break;
            default:
                this.ticket.tipo.ancho = this.ticket.ancho[0];
                this.anchoHojaSelect = this.ticket.ancho[0].id;
                break;
        }

        this.output.hoja.dftFontSize = this.ticket.tipo.dftFontSize;
        this.output.hoja.pageSize = this.ticket.tipo.pageSize;
        this.output.hoja.pageMargins = [(this.ticket.tipo.ancho.mgnIzquierdo + this.ticket.margenExtra), this.ticket.tipo.ancho.mgnSuperior, (this.ticket.tipo.ancho.mgnDerecho + +this.ticket.margenExtra), this.ticket.tipo.ancho.mgnInferior];
        this.output.separador = this.ticket.separador[this.ticket.tipo.id].texto;

        this.ticket.tamaniosLetra = [];

        switch (this.ticket.tipo.pageSize) {
            case "n":
                switch (this.ticket.tipo.ancho.pageSize) {
                    case "A7": this.ticket.tamaniosLetra = this.ticket.tamaniosLetraA7;
                        break;
                    case "A8": this.ticket.tamaniosLetra = this.ticket.tamaniosLetraA8;
                        break;
                    case "A9": this.ticket.tamaniosLetra = this.ticket.tamaniosLetraA9;
                        break;
                    case "A10": this.ticket.tamaniosLetra = this.ticket.tamaniosLetraA10;
                        break;
                };

                this.output.separador = this.ticket.separador[this.ticket.tipo.ancho.id].texto;
                this.output.hoja.pageSize = this.ticket.tipo.ancho.pageSize;
                this.output.hoja.dftFontSize = this.ticket.tipo.ancho.dftFontSize;
                this.output.hoja.pageMargins = [(this.ticket.tipo.ancho.mgnIzquierdo + this.ticket.margenExtra), this.ticket.tipo.ancho.mgnSuperior, (this.ticket.tipo.ancho.mgnDerecho + +this.ticket.margenExtra), this.ticket.tipo.ancho.mgnInferior];
                break;
            case "A7": this.ticket.tamaniosLetra = this.ticket.tamaniosLetraA7;
                break;
            case "A8": this.ticket.tamaniosLetra = this.ticket.tamaniosLetraA8;
                break;
            case "A9": this.ticket.tamaniosLetra = this.ticket.tamaniosLetraA9;
                break;
            case "A10": this.ticket.tamaniosLetra = this.ticket.tamaniosLetraA10;
                break;
        }

        this.ticket.cabecera.tamanioLetra = this.ticket.tamaniosLetra[0];
        this.ticket.pieDePagina.tamanioLetra = this.ticket.tamaniosLetra[0];

        this.ticket.cabecera.tamanioLetraId = this.ticket.tamaniosLetra[0].id;
        this.ticket.pieDePagina.tamanioLetraId = this.ticket.tamaniosLetra[0].id;

        this.output.cabecera = this.ticket.cabecera.textoTotal;
        this.output.pieDePagina = this.ticket.pieDePagina.textoTotal;
    }

    /* Asigna las lineas obtenidas de la B.D. a la tabla de cabecera o pie de página*/
    setLineas() {
        this.ticket.dataLineas.forEach((row: any, index?: any) => {
            let objeto: any = {};
            const arregloTamanio =
                this.ticket.tamaniosLetra.filter((item: any) => row.tamanio === item.tamanio);
            const alineacion = (this.ticket.alineacion.find((a: any) => a.desc === row.alineacion)?.id || '0').toString()

            if (row.tipoTexto === 'cabecera') {
                objeto = {
                    id: this.ticket.cabecera.textoTotal.length + 1,
                    texto: row.valor,
                    alineacion: alineacion,
                    bold: row.esBold,
                    italics: row.esItalic,
                    tamanioLetra: arregloTamanio[0],
                    tamanioLetraId: arregloTamanio[0].id,
                    maxLength: arregloTamanio[0].maxLength,
                    editar: false,
                }
                this.ticket.cabecera.textoTotal.push(JSON.parse(JSON.stringify(objeto)));
                this.ticket.cabeceraTemp.textoTotal.push(JSON.parse(JSON.stringify(objeto)));
            } else {
                objeto = {
                    id: this.ticket.pieDePagina.textoTotal.length + 1,
                    texto: row.valor,
                    alineacion: alineacion,
                    bold: row.esBold,
                    italics: row.esItalic,
                    tamanioLetra: arregloTamanio[0],
                    tamanioLetraId: arregloTamanio[0].id,
                    maxLength: arregloTamanio[0].maxLength,
                    editar: false,
                }
                this.ticket.pieDePagina.textoTotal.push(JSON.parse(JSON.stringify(objeto)));
                this.ticket.pieDePaginaTemp.textoTotal.push(JSON.parse(JSON.stringify(objeto)));
            }
        });
    }

    /* Inserta lineas de texto agregadas en el formulario */
    guardar() {
        this.inputsValidos();
        this.control.guardarDisabled = true;
        this.ticket.waiting = true;
        this._pantallaServicio.mostrarSpinner();

        this._backService.HttpPost('catalogos/configurarTicket/borrarLineas', {}, {}).subscribe(
            response => {
                this.control.cambiosNoGuardados = false;
                this.control.watchActivo = false;

                if (!(this.ticket.cabecera.textoTotal.length === 0 && this.ticket.pieDePagina.textoTotal.length === 0)) {
                    let params: any = {};
                    params.lista = [];
                    if (this.ticket.cabecera.textoTotal.length !== 0) {
                        this.ticket.cabecera.textoTotal.forEach((row: any, index: any) => {
                            const alineacion = this.ticket.alineacion.find((a: any) => a.id === Number(row.alineacion))?.desc;

                            let inserted: any = {};
                            inserted.tipoTexto = "cabecera";
                            inserted.consecutivo = index + 2;
                            inserted.valor = row.texto;
                            inserted.tamanio = row.tamanioLetra.tamanio;
                            inserted.alineacion = alineacion;
                            inserted.esBold = row.bold ? 1 : 0;
                            inserted.esItalic = row.italics ? 1 : 0;
                            if (this.ticket.margenExtra === '') {
                                inserted.margenExtra = 0;
                            } else {
                                if (parseInt(this.ticket.margenExtra) > 20) {
                                    inserted.margenExtra = parseInt('20');
                                } else {
                                    inserted.margenExtra = parseInt(this.ticket.margenExtra);
                                }
                            }
                            params.lista.push(inserted);
                        });
                    }
                    if (this.ticket.pieDePagina.textoTotal.length !== 0) {
                        this.ticket.pieDePagina.textoTotal.forEach((row: any, index: any) => {
                            const alineacion = this.ticket.alineacion.find((a: any) => a.id === Number(row.alineacion))?.desc;

                            let inserted: any = {};
                            inserted.tipoTexto = "pieDePagina";
                            inserted.consecutivo = index + 2;
                            inserted.valor = row.texto;
                            inserted.tamanio = row.tamanioLetra.tamanio;
                            inserted.alineacion = alineacion;
                            inserted.esBold = row.bold ? 1 : 0;
                            inserted.esItalic = row.italics ? 1 : 0;
                            if (this.ticket.margenExtra === '') {
                                inserted.margenExtra = 0;
                            } else {
                                if (parseInt(this.ticket.margenExtra) > 20) {
                                    inserted.margenExtra = parseInt('20');
                                } else {
                                    inserted.margenExtra = parseInt(this.ticket.margenExtra);
                                }
                            }
                            params.lista.push(inserted);
                        });
                    }

                    this._backService.HttpPost('catalogos/configurarTicket/agregarLineas', {}, params).subscribe(
                        response => {
                            let params: any = {};
                            params.valor = this.ticket.respTipoHoja;

                            this._backService.HttpPost('catalogos/configurarTicket/actualizarConfigHoja', {}, params).subscribe(
                                response => {
                                    this._toaster.success(this.configurarTicketTranslate.actualizoExito);
                                    this.recargar();
                                }, error => {
                                    this._pantallaServicio.ocultarSpinner();
                                    this._toaster.error(this.configurarTicketTranslate.errorActualizar)
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
                                })
                        }, error => {
                            this._pantallaServicio.ocultarSpinner();
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
                        })
                }
                else {
                    let params: any = {};
                    params.valor = this.ticket.respTipoHoja;

                    this._backService.HttpPost('catalogos/configurarTicket/actualizarConfigHoja', {}, params).subscribe(
                        response => {
                            this._toaster.success(this.configurarTicketTranslate.actualizoExito);
                            this.control.guardarDisabled = false;
                            this._pantallaServicio.ocultarSpinner();
                        },
                        error => {
                            this._pantallaServicio.ocultarSpinner();
                            this._toaster.error(this.configurarTicketTranslate.errorActualizar)
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
                    )
                }
            }, error => {
                this._pantallaServicio.ocultarSpinner();
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
            })

        this.ticket.waiting = false;
    }

    /* Restablece los valores obtenidos de la B.D*/
    recargar() {
        this.ticket.cabecera.alineacion = '1';
        this.ticket.cabecera.textoTotal = [];
        this.ticket.pieDePagina.textoTotal = [];
        this.ticket.cabecera.linea = '';
        this.ticket.pieDePagina.linea = '';
        this.getAllData();
    }

    //FUNCIONES PROCESOS DE FORMULARIO ----------------------------------------------------------------------------------------------------------------
    /* Remover línea de arreglo */
    removerLinea(index: any, seccion: any) {
        this.activarWatch();
        if (seccion === 'cabecera') {
            this.ticket.cabecera.textoTotal.splice(index, 1);
            this.ticket.cabeceraTemp.textoTotal.splice(index, 1);
        }
        else {
            this.ticket.pieDePagina.textoTotal.splice(index, 1);
            this.ticket.pieDePaginaTemp.textoTotal.splice(index, 1);
        }
    };

    /* Agregar línea a arreglo */
    agregarLinea(seccion: any) {
        this.activarWatch();

        if (seccion === 'cabecera') {
            if (this.ticket.cabecera.linea !== '') {
                const tamanioLetraTemp = this.ticket.tamaniosLetra.find((e: any) => e.id === this.ticket.cabecera.tamanioLetraId);
                this.control.inserted = {
                    id: this.ticket.cabecera.textoTotal.length + 1,
                    texto: this.ticket.cabecera.linea,
                    tamanioLetra: tamanioLetraTemp,
                    tamanioLetraId: tamanioLetraTemp.id,
                    alineacion: this.ticket.cabecera.alineacion,
                    bold: this.ticket.cabecera.bold,
                    italics: this.ticket.cabecera.italic,
                    maxLength: tamanioLetraTemp.maxLength,
                    editar: false,
                };
                this.ticket.cabecera.textoTotal.push(JSON.parse(JSON.stringify(this.control.inserted)));
                this.ticket.cabeceraTemp.textoTotal.push(JSON.parse(JSON.stringify(this.control.inserted)));
            }
        }
        else {
            if (this.ticket.pieDePagina.linea !== '') {
                const tamanioLetraTemp = this.ticket.tamaniosLetra.find((e: any) => e.id === this.ticket.pieDePagina.tamanioLetraId);
                this.control.inserted = {
                    id: this.ticket.pieDePagina.textoTotal.length + 1,
                    texto: this.ticket.pieDePagina.linea,
                    tamanioLetra: tamanioLetraTemp,
                    tamanioLetraId: tamanioLetraTemp.id,
                    alineacion: this.ticket.pieDePagina.alineacion,
                    bold: this.ticket.pieDePagina.bold,
                    italics: this.ticket.pieDePagina.italic,
                    maxLength: tamanioLetraTemp.maxLength,
                    editar: false,
                };
                this.ticket.pieDePagina.textoTotal.push(JSON.parse(JSON.stringify(this.control.inserted)));
                this.ticket.pieDePaginaTemp.textoTotal.push(JSON.parse(JSON.stringify(this.control.inserted)));
            }
        }
        this.ticket.cabecera.linea = "";
        this.ticket.pieDePagina.linea = "";
    };

    /* Cambia texto que se mostrará en radio buttons de alineación: tomado como "descripcion" por "tipo" */
    mostrarAlineacion(id: any): any {
        const selected = this.ticket.alineacion.filter((item: any) => item.id === Number(id));
        return (selected[0].tipo).replace(/(^|\s)([a-z])/g, (m: any, p1: any, p2: any) => { return p1 + p2.toUpperCase(); });
    };

    /* Cambia el tipo de hoja y tamaños de letra por default */
    cambioHoja() {
        const tipoHojaSelect = this.ticket.tipoHoja.find((e: any) => e.id === this.tipoHojaSelect);
        const anchoHojaSelect = this.ticket.ancho.find((e: any) => e.id === this.anchoHojaSelect);

        this.ticket.respTipoHoja = tipoHojaSelect.pageSize;
        this.output.hoja.dftFontSize = tipoHojaSelect.dftFontSize;
        this.output.hoja.pageSize = tipoHojaSelect.pageSize;
        this.output.hoja.pageMargins = [];
        this.output.hoja.pageMargins = [
            (anchoHojaSelect.mgnIzquierdo + this.ticket.margenExtra), anchoHojaSelect.mgnSuperior,
            (anchoHojaSelect.mgnDerecho + +this.ticket.margenExtra), anchoHojaSelect.mgnInferior];

        this.output.separador = this.ticket.separador[tipoHojaSelect.id].texto;
        this.ticket.tamaniosLetra = [];

        switch (tipoHojaSelect.pageSize) {
            case "n":
                switch (anchoHojaSelect.pageSize) {
                    case "A7": this.ticket.tamaniosLetra = this.ticket.tamaniosLetraA7;
                        break;
                    case "A8": this.ticket.tamaniosLetra = this.ticket.tamaniosLetraA8;
                        break;
                    case "A9": this.ticket.tamaniosLetra = this.ticket.tamaniosLetraA9;
                        break;
                    case "A10": this.ticket.tamaniosLetra = this.ticket.tamaniosLetraA10;
                        break;
                };

                this.ticket.respTipoHoja = anchoHojaSelect.pageSize + 'Continua';
                this.output.hoja.dftFontSize = anchoHojaSelect.dftFontSize;
                this.output.hoja.pageSize = anchoHojaSelect.pageSize;
                this.output.hoja.pageMargins = [];
                this.output.hoja.pageMargins = [
                    (anchoHojaSelect.mgnIzquierdo + this.ticket.margenExtra), anchoHojaSelect.mgnSuperior,
                    (anchoHojaSelect.mgnDerecho + +this.ticket.margenExtra), anchoHojaSelect.mgnInferior
                ];
                this.output.separador = this.ticket.separador[anchoHojaSelect.id].texto;
                break;
            case "A7": this.ticket.tamaniosLetra = this.ticket.tamaniosLetraA7;
                break;
            case "A8": this.ticket.tamaniosLetra = this.ticket.tamaniosLetraA8;
                break;
            case "A9": this.ticket.tamaniosLetra = this.ticket.tamaniosLetraA9;
                break;
            case "A10": this.ticket.tamaniosLetra = this.ticket.tamaniosLetraA10;
                break;
        }
        this.ticket.cabecera.tamanioLetra = this.ticket.tamaniosLetra[0];
        this.ticket.pieDePagina.tamanioLetra = this.ticket.tamaniosLetra[0];
        this.reordenarTamanios();
        this.output.cabecera = this.ticket.cabecera.textoTotal;
        this.output.pieDePagina = this.ticket.pieDePagina.textoTotal;
    }

    /* Alerta al usuario si desea continuar perdiendo los datos no guardados */
    observarCambioHoja() {
        this.control.cambiosNoGuardados = true;
        this.ticket.tipo = this.ticket.tipoHoja.filter((e: any) => e.id === this.tipoHojaSelect);
        this.ticket.tipo.ancho = this.ticket.ancho.filter((e: any) => e.id === this.anchoHojaSelect);
        this.tempTipo = this.ticket.tipo;
        this.tempTipoAncho = this.ticket.tipo.ancho;
        this.cambioHoja();
    }

    /* Limpia el texto al cambiar tamaño de texto en inputs dentro de la tabla */
    limpiarTexto(elemento: any) {
        //elemento.$$nextSibling.$data = '';
        const temp = elemento.$$nextSibling.$data;
        elemento.$$nextSibling.$data = temp.substr(0, elemento.$data.maxLength);
    }

    /* Recorta el texto cuando se hace cambio de hoja y el ancho es mas corto, cambia los tamaños de texto a tamaño escala */
    reordenarTamanios(hojaNueva?: any) {
        this.ticket.cabecera.textoTotal.forEach((objeto: any, index: any) => {
            const tamaniosLetraTemp = JSON.parse(JSON.stringify(this.ticket.tamaniosLetra[objeto.tamanioLetra.id - 1]));

            if (objeto.tamanioLetra.id === tamaniosLetraTemp.id) {
                objeto.tamanioLetra = tamaniosLetraTemp;
                objeto.maxLength = tamaniosLetraTemp.maxLength;
                objeto.tamanioLetraId = tamaniosLetraTemp.id;
            }
            objeto.texto = objeto.texto.substr(0, objeto.maxLength);
        });

        this.ticket.pieDePagina.textoTotal.forEach((objeto: any, index: any) => {
            const tamaniosLetraTemp = JSON.parse(JSON.stringify(this.ticket.tamaniosLetra[objeto.tamanioLetra.id - 1]));

            if (objeto.tamanioLetra.id === tamaniosLetraTemp.id) {
                objeto.tamanioLetra = tamaniosLetraTemp;
                objeto.maxLength = tamaniosLetraTemp.maxLength;
                objeto.tamanioLetraId = tamaniosLetraTemp.id;
            }

            objeto.texto = objeto.texto.substr(0, objeto.maxLength);
        });

        this.ticket.cabeceraTemp.textoTotal = JSON.parse(JSON.stringify(this.ticket.cabecera.textoTotal));
        this.ticket.pieDePaginaTemp.textoTotal = JSON.parse(JSON.stringify(this.ticket.pieDePagina.textoTotal));
    }

    //FUNCIONES PROCESOS DE TICKET ----------------------------------------------------------------------------------------------------------------
    /* Obtiene los datos de los arreglos temporales del formulario y los almacena en un arreglo 
       con un formato específico para ser impreso */
    estandarizarTexto() {
        let objetoEstandarizado: any = {};

        this.ticket.cabecera.textoTotal.forEach((row: any, index: any) => {
            objetoEstandarizado = {};
            objetoEstandarizado = {
                text: this.ticket.cabecera.textoTotal[index].texto,
                style: {
                    fontSize: this.ticket.cabecera.textoTotal[index].tamanioLetra.tamanio,
                    bold: this.ticket.cabecera.textoTotal[index].bold,
                    italics: this.ticket.cabecera.textoTotal[index].italics,
                    alignment: this.ticket.cabecera.textoTotal[index].alineacion,
                    lineHeight: 1.2

                }
            }
            this.output.cabecera.push(objetoEstandarizado);
        });

        this.ticket.pieDePagina.textoTotal.forEach((row: any, index: any) => {
            objetoEstandarizado = {};
            objetoEstandarizado = {
                text: this.ticket.pieDePagina.textoTotal[index].texto,
                style: {
                    fontSize: this.ticket.pieDePagina.textoTotal[index].tamanioLetra.tamanio,
                    bold: this.ticket.pieDePagina.textoTotal[index].bold,
                    italics: this.ticket.pieDePagina.textoTotal[index].italics,
                    alignment: this.ticket.pieDePagina.textoTotal[index].alineacion,
                    lineHeight: 1.2

                }
            }
            this.output.pieDePagina.push(objetoEstandarizado);
        });

    };

    /* Establece el contenido final para la impresion del Ticket en formato PDF */
    crearContenido(): any {
        let totalContenido: any = [];
        //Si el margen superior es 0, insertar primera línea en blanco
        if (this.output.hoja.pageMargins[1] === 0) {
            totalContenido.push({
                style: 'gralColumnas',
                columns: [
                    {
                        text: ' '
                    }
                ]
            });
        }

        // INSERTAR CABECERA
        this.output.cabecera.forEach((row: any, index: any) => {
            const alignment = this.ticket.alineacion.find((e: any) => e.id === Number(row.style.alignment)).desc;

            totalContenido.push({
                style: 'gralColumnas',
                columns: [
                    {
                        width: '100%',
                        style: { ...row.style, alignment },
                        text: row.text
                    }
                ]
            });
        });

        // INSERTAR SEPARADOR
        totalContenido.push({
            style: 'gralColumnas',
            columns: [
                {
                    width: '100%',
                    style: 'separador',
                    text: this.output.separador
                }
            ]
        });

        // INSERTAR FECHA Y HORA
        totalContenido.push({
            style: 'gralColumnas',
            columns: [
                {
                    width: '50%',
                    style: 'fechaHora',
                    text: this.configurarTicketTranslate.folio + this.ticket.folio
                },
                {
                    width: '50%',
                    style: 'fechaHora',
                    text: this.hoy
                }
            ]
        });

        // INSERTAR NOMBRE DEL CLIENTE
        totalContenido.push({
            style: 'gralColumnas',
            columns: [
                {
                    width: '50%',
                    style: 'nombreCliente',
                    text: this.consultaClienteTranslate.cliente + ' : ' + this.informacionFiscalSucursalTranslate.nombre
                }
            ]
        });

        // INSERTAR CABECERA DE CONCEPTOS
        totalContenido.push({
            style: 'gralColumnas',
            columns: [
                {
                    width: '65%',
                    style: 'descripcion',
                    text: this.configurarTicketTranslate.descripcion
                },
                {
                    width: '35%',
                    style: 'importe',
                    text: this.configurarTicketTranslate.importe
                }
            ]
        });

        //INSERTAR CONCEPTOS
        this.ticket.contenido.dataCompras.forEach((row: any, index: any) => {
            totalContenido.push({
                style: 'gralColumnas',
                columns: [
                    {
                        width: '65%',
                        style: 'descripcion',
                        text: row.descripcion
                    },
                    {
                        width: '35%',
                        style: 'importe',
                        text: row.pago
                    }
                ]
            });
        });

        // INSERTAR SEPARADOR
        totalContenido.push({
            style: 'gralColumnas',
            columns: [
                {
                    width: '100%',
                    style: 'separador',
                    text: this.output.separador
                }
            ]
        });

        // INSERTAR TOTALES COMPRA
        // SI TICKET INCLUYE IVA
        if (this.ticket.isIva) {
            //SUBTOTAL
            totalContenido.push({
                style: 'gralColumnas',
                columns: [
                    {
                        width: '65%',
                        style: 'totalesCompraDesc',
                        text: this.configurarTicketTranslate.subtotal
                    },
                    {
                        width: '35%',
                        style: 'totalesCompraCant',
                        text: '$' + this.ticket.subtotal.toFixed(2).toString()
                    }
                ]
            });
            //IVA
            totalContenido.push({
                style: 'gralColumnas',
                columns: [
                    {
                        width: '65%',
                        style: 'totalesCompraDesc',
                        text: this.configurarTicketTranslate.iva
                    },
                    {
                        width: '35%',
                        style: 'totalesCompraCant',
                        text: '$' + (this.ticket.subtotal * this.ticket.iva).toFixed(2).toString()
                    }
                ]
            });
            //TOTAL
            totalContenido.push({
                style: 'gralColumnas',
                columns: [
                    {
                        width: '65%',
                        style: 'totalesCompraDesc',
                        text: this.configurarTicketTranslate.total
                    },
                    {
                        width: '35%',
                        style: 'totalesCompraCant',
                        text: '$' + (this.ticket.subtotal + (this.ticket.subtotal * this.ticket.iva)).toFixed(2).toString()
                    }
                ]
            });
        }
        //SI NO, SOLO INCLUIR TOTAL
        else {
            //SOLO TOTAL
            totalContenido.push({
                style: 'gralColumnas',
                columns: [
                    {
                        width: '65%',
                        style: 'totalesCompraDesc',
                        text: this.configurarTicketTranslate.total
                    },
                    {
                        width: '35%',
                        style: 'totalesCompraCant',
                        text: this.ticket.subtotal.toFixed(2).toString()
                    }
                ]
            });
        }

        // INSERTAR SEPARADOR
        totalContenido.push({
            style: 'gralColumnas',
            columns: [
                {
                    width: '100%',
                    style: 'separador',
                    text: this.output.separador
                }
            ]
        });

        // INSERTAR PIE DE PAGINA
        this.output.pieDePagina.forEach((row: any, index: any) => {
            const alignment = this.ticket.alineacion.find((e: any) => e.id === Number(row.style.alignment)).desc;

            totalContenido.push({
                style: 'gralColumnas',
                columns: [
                    {
                        width: '100%',
                        style: { ...row.style, alignment },
                        text: row.text
                    }
                ]
            });
        });


        return totalContenido;
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
            if (key === 8) {
                // Detectar backspace (retroceso)
                return true;
            } else {
                return false;
            }
        }
        return true;
    }

    changeMargen() {
        if (Number(this.ticket.margenExtra) > 20) {
            this.ticket.margenExtra = 20;
        }
    }

    changeEdit(index: any, item: any, status: any) {
        this.ticket[item].textoTotal[index].editar = status;
        this.ticket[item + "Temp"].textoTotal = JSON.parse(JSON.stringify(this.ticket[item].textoTotal))
    }

    changeSaveEdit(index: any, item: any) {
        this.ticket[item + "Temp"].textoTotal[index].editar = false;

        const idTamanio = this.ticket[item + "Temp"].textoTotal[index].tamanioLetraId;
        const tamaniosLetraTemp = JSON.parse(JSON.stringify(this.ticket.tamaniosLetra.find((e: any) => e.id === idTamanio)));
        this.ticket[item + "Temp"].textoTotal[index].tamanioLetra = tamaniosLetraTemp;

        this.ticket[item].textoTotal = JSON.parse(JSON.stringify(this.ticket[item + "Temp"].textoTotal));
    }

    vistaPrevia() {
        this.output.hoja.pageMargins = [this.ticket.tipoHoja[0].mgnIzquierdo, this.ticket.tipoHoja[0].mgnSuperior,
        this.ticket.tipoHoja[0].mgnDerecho, this.ticket.tipoHoja[0].mgnInferior];

        this.inputsValidos();
        this.getToday();

        this.output.cabecera = [];
        this.output.pieDePagina = [];
        this.estandarizarTexto();

        pdfMake.fonts = {
            Anonymous_Pro: {
                normal: 'Anonymous_Pro.ttf',
                bold: 'Anonymous_Pro_B.ttf',
                italics: 'Anonymous_Pro_I.ttf',
                bolditalics: 'Anonymous_Pro_BI.ttf'
            }
        }
        if (this.ticket.margenExtra === '') {
            this.ticket.margenExtra = 0;
            this.output.hoja.pageMargins[0] = this.output.hoja.pageMargins[0] + 0;
            this.output.hoja.pageMargins[2] = this.output.hoja.pageMargins[2] + 0;
        } else {
            if (parseInt(this.ticket.margenExtra) > 20) {
                this.ticket.margenExtra = parseInt('20');
                this.output.hoja.pageMargins[0] = this.output.hoja.pageMargins[0] + parseInt('20');
                this.output.hoja.pageMargins[2] = this.output.hoja.pageMargins[2] + parseInt('20');
            } else {
                this.output.hoja.pageMargins[0] = this.output.hoja.pageMargins[0] + parseInt(this.ticket.margenExtra);
                this.output.hoja.pageMargins[2] = this.output.hoja.pageMargins[2] + parseInt(this.ticket.margenExtra);
            }
        }
        const contenidoPDF: TDocumentDefinitions = {
            pageSize: this.output.hoja.pageSize,
            pageMargins: this.output.hoja.pageMargins,
            content: [
                this.crearContenido()
            ],

            defaultStyle: {
                font: 'Anonymous_Pro',
                fontSize: this.output.hoja.dftFontSize,
                lineHeight: .6
            },

            styles: {
                gralColumnas: {
                    lineHeight: 1.6,
                    columnGap: 5
                },
                descripcion: {
                    alignment: 'left'
                },
                importe: {
                    alignment: 'right'
                },
                centrado: {
                    alignment: 'center'
                },
                separador: {
                    fontSize: this.output.hoja.dftFontSize,
                    alignment: 'center',
                    margin: 0,
                    color: '#BBB',
                    lineHeight: 1.6
                },
                totalesCompraDesc: {
                    alignment: 'right'
                },
                totalesCompraCant: {
                    alignment: 'right'
                },
                fechaHora: {
                    alignment: 'center',
                    bold: true
                },
                nombreCliente: {
                    alignment: 'left',
                    bold: false
                }
            }
        }


        const isSafari = navigator.vendor && navigator.vendor.indexOf('Apple') > -1 &&
            navigator.userAgent && !navigator.userAgent.match('CriOS');

        if (isSafari) {
            //Se verifica si es Internet Explorer o Safari
            pdfMake.createPdf(contenidoPDF).download('ticket.pdf');
        }
        else {
            //Cualquier otro explorador
            pdfMake.createPdf(contenidoPDF).print();
        }
    }
}
