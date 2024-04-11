import { Component, OnInit, ViewChild } from '@angular/core';
import { MethodsService } from 'src/app/core/services/methods.service';
import { PantallaService } from "src/app/core/services/pantalla.service";
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from "@angular/router";
import { TranslateService } from '@ngx-translate/core'; // TRANSLATE
declare var $: any; // JQUERY
import * as bootstrap from 'bootstrap'; // BOOTSTRAP
import { ToasterService } from "src/shared/toaster/toaster.service";
import moment from 'moment'; // MOMENT
import { MatChipInputEvent } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { format } from 'date-fns';
import { MatIconRegistry } from '@angular/material/icon'; // ICONOS SVG
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'app-promociones-creacion-edicion',
    templateUrl: './promociones-creacion-edicion.component.html',
    styleUrls: ['./promociones-creacion-edicion.component.scss', '../../../page.component.scss'],
})

export class PromocionesCreacionEdicionComponent implements OnInit {
    // Variables de Translate
    promocionesCreacionEdicionTranslate: any = {};
    calendarioTranslate: any = {};
    sessionTraslate: any = {};
    agendaTranslate: any = {};

    // Modales
    modales: any = {}; 

    constructor(private _translate: TranslateService, private _backService: MethodsService, public _pantallaServicio: PantallaService, private _dialog: MatDialog, private _router: Router, private _toaster: ToasterService, private _route: ActivatedRoute, private matIconRegistry: MatIconRegistry, private domSanitizer: DomSanitizer) {
        this._translate.setDefaultLang(this._pantallaServicio.idioma);
        this._translate.use(this._pantallaServicio.idioma);

        this._translate.get('calendarioTranslate').subscribe((translated: string) => {  
            this.calendarioTranslate = this._translate.instant('calendarioTranslate');
        });
        this._translate.get('sessionTraslate').subscribe((translated: string) => {  
            this.sessionTraslate = this._translate.instant('sessionTraslate');
        });
        this._translate.get('agendaTranslate').subscribe((translated: string) => {  
            this.agendaTranslate = this._translate.instant('agendaTranslate');
        });
        this._translate.get('promocionesCreacionEdicion').subscribe((translated: string) => {  
            this.promocionesCreacionEdicionTranslate = this._translate.instant('promocionesCreacionEdicion');
        });

        this.matIconRegistry.addSvgIcon('iconCasa1', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../../assets/icons/finales/Casa1-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconFlecha1DerechaPeque', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../../assets/icons/finales/FlechaDerechaPequena-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconFlechaAbajoPeque', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../../assets/icons/finales/FlechaAbajoPequena-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconCalendarioEditar', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../../assets/icons/finales/CalendarioEditar-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconAgregar', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../../assets/icons/finales/Agregar-1-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconInfoCirculo', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../../assets/icons/finales/InfoCirculo-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconCruzCuadrado', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/CruzCuadrado-icon.svg"));
    }

    ngOnInit(): void {
        this._route.queryParams.subscribe(params => {
            this.promocion.idPromocionSucursalNueva = params["idPromocion"];
            this.crearModales();
            setTimeout(() => {
                this.funciones_funcionPrincipal();
                this.validarSeleccionFecha();
            }, 100);
        });
    }

    crearModales() {
        if ($('body').find('.modalEnviarCorreo').length > 1) {
            $('body').find('.modalEnviarCorreo')[1].remove();
        }
        this.modales.modalEnviarCorreo = new bootstrap.Modal($("#modalEnviarCorreo").appendTo("body"), {
            backdrop: "static", 
            keyboard: false,
        });
    }

    // ------------------------------------------------------------------------------------------- //
    // ----------------------------- PROMOCIONES-CREACIÓN-EDICIÓN -------------------------------- //
    // ------------------------------------------------------------------------------------------- //

    // -------------------------------------- Declaración de variables --------------------------- //
    // Variables de Datos Generales
    paramIdPromocion: any;
    promocion: any = {
        idPromocionSucursalNueva: "",
        nombre: "",
        idPromocionSucursalNuevaTipo: 1,
        aplicacionPorCodigo: 0,
        codigo: "",
        usoLimitado: 0,
        cantidadUsos: "",
        activa: 1,
        esBorrador: 0,
        verCampos: 1,
        // Variables de Cliente objetivo
        clienteObjetivo: {
            todosClientes: 1,
            idClienteEstadoActividad: "",
            idClienteSexo: "",
            idClienteEdadRango: "",
            esVip: 0,
            verCampos: 1,
        },
        // Variables de Vigencia
        vigencia: {
            idPromocionSucursalNuevaVigenciaTipo: 1,
            idPromocionSucursalNuevaVigenciaTipoCumpleaniosRango: 1,
            fechaInicioTemp: moment(new Date()).startOf('month').format('DD/MM/YYYY'),
            fechaFinTemp: moment(new Date()).endOf('month').format('DD/MM/YYYY'),
            fechaVigencia: {
                startDate: moment(new Date()).startOf('month').format('DD/MM/YYYY'), 
                endDate: moment(new Date()).endOf('month').format('DD/MM/YYYY')
            },
            // fechaVigencia: {
            //     startDate: moment(new Date()).startOf('month').format('DD/MM/YYYY'), 
            //     endDate: moment(new Date()).endOf('month').format('DD/MM/YYYY')
            // },
            //fechaVigencia: moment(new Date()).startOf('month').format('DD/MM/YYYY') + " - " + moment(new Date()).endOf('month').format('DD/MM/YYYY'),
            restriccionHorario: 0,
            restriccionHorarioInicio: moment(new Date()).startOf('day').format('HH:mm'),
            restriccionHorarioFin: moment(new Date()).endOf('day').format('HH:mm'),
            restriccionDiasSemana: 0,
            lunes: 0,
            martes: 0,
            miercoles: 0,
            jueves: 0,
            viernes: 0,
            sabado: 0,
            domingo: 0,
            verCampos: 1,
        },
        // Variables de Aplicación de los tipos de Promoción
        aplicacion: {
            promocionGeneral: {
                valor: {
                    servicios: {
                        tipoDescuento: "",
                        descuento: ""
                    },
                    productos: {
                        tipoDescuento: "",
                        descuento: ""
                    }
                },
                requisitos: {
                    servicios: {
                        todosServicios: 0,
                        servicios: [],
                    },
                    productos: {
                        todosProductos: 0,
                        productos: [],
                    },
                },
            },
            combos: {
                requisitos: {
                    servicios: {
                        servicios: [],
                        cantidades: []
                    },
                    productos: {
                        productos: [],
                        cantidades: []
                    }
                },
                valor: {
                    valorCombo: ""
                }
            },
            numeroVisitaConsumo: {
                requisitos: {
                    tipo: 1,
                    numeroVisitaConsumo: "",
                    servicios: [],
                    productos: [],
                },
                valor: {
                    servicios: [{servicio: "", descuento: "100"}],
                    productos: [{producto: "", descuento: "100"}]
                }
            },
            verCampos: 1,
        },
        difusion: {
            difusionPromocion: 0,
            idPromocionSucursalNuevaDifusionTipo: "",
            fechaInicio: "",
            idPromocionSucursalNuevaDifusionTipoPosteriorPeriodo: "",
            difusionPosteriorPeriodo: {
                restriccionDiasMes: [],
                restriccionLunes: 0,
                restriccionMartes: 0,
                restriccionMiercoles: 0,
                restriccionJueves: 0,
                restriccionViernes: 0,
                restriccionSabado: 0,
                restriccionDomingo: 0,
            },
            difusionPosteriorAutomatica: 1,
            idPromocionSucursalNuevaDifusionTipoPosteriorAutorizacionTipo: "",
            idPromocionSucursalNuevaDifusionMedio: 1,
            imagenSrc: "",
            direccionImagen: "",
            difundirSoloImagen: 1,
            encabezado: "",
            piePagina: "",
            verCampos: 1,
        }
    };
    invalidDates: moment.Moment[] = [moment().add(2, 'days'), moment().add(3, 'days'), moment().add(5, 'days')]; 
    // Listados
    listadoClienteEstadoActividades = [];
    listadoClienteSexos = [];
    listadoClienteEdadRangos = [];
    listadoPromocionSucursalNuevaTipos = [];
    listadoPromocionSucursalNuevaVigenciaTipos = [];
    listadoPromocionSucursalNuevaVigenciaTipoCumpleaniosRangos = [];
    listadoPromocionSucursalNuevaAplicacionTipo = [];
    listadoPromocionSucursalNuevaAplicacionValorTipo = [];
    listadoPromocionSucursalNuevaDifusionTipos = [];
    listadoPromocionSucursalNuevaDifusionTipoPosteriorPeriodos = [];
    listadoPromocionSucursalNuevaDifusionTipoPosteriorAutorizacionTipos = [];
    listadoPromocionSucursalNuevaDifusionMedios = [];
    listadoServicios = [];
    listadoProductos = [];
    locale: any = {
        format: 'DD/MM/YYYY'
    }
    ranges: any;
    bandera = 0;
    files: any;
    accesosPantalla: any;
    hoy: any;
    contadorEntradas = 0;
    // Para los inputs multiples etiquetas
    readonly separatorKeysCodes = [ENTER, COMMA] as const;

    // ------------------------------------------------------------------------------------------------ //
    // ----------------------------------- Declaracion de funciones ----------------------------------- //
    promociones_inicializarCalendario() {
        var dias = this.calendarioTranslate.dias7;
        var meses = this.calendarioTranslate.ultimoMes;
        var años = this.calendarioTranslate.ultimoAnio;
        var domingo = this.calendarioTranslate.domingo;
        var lunes = this.calendarioTranslate.lunes;
        var martes = this.calendarioTranslate.martes;
        var miercoles = this.calendarioTranslate.miercoles;
        var jueves = this.calendarioTranslate.jueves;
        var viernes = this.calendarioTranslate.viernes;
        var sabado = this.calendarioTranslate.sabado;
        var eneroS = this.calendarioTranslate.eneroS;
        var febreroS = this.calendarioTranslate.febreroS;
        var marzoS = this.calendarioTranslate.marzoS;
        var abrilS = this.calendarioTranslate.abrilS;
        var mayoS = this.calendarioTranslate.mayoS;
        var junioS = this.calendarioTranslate.junioS;
        var julioS = this.calendarioTranslate.julioS;
        var agostoS = this.calendarioTranslate.agostoS;
        var septiembreS = this.calendarioTranslate.septiembreS;
        var octubreS = this.calendarioTranslate.octubreS;
        var noviembreS = this.calendarioTranslate.noviembreS;
        var diciembreS = this.calendarioTranslate.diciembreS;
        var rango = this.calendarioTranslate.rango;
        var aceptar = this.calendarioTranslate.aceptar;
        var cancelar = this.calendarioTranslate.cancelar;

        this.ranges = {
            [dias]:  [moment().subtract(6, 'days'), moment()],
            [meses]: [moment().startOf('month'), moment().endOf('month')],
            [años]:  [moment().startOf('year'), moment().endOf('year')]
        }

        this.locale = {
            format: 'DD/MM/YYYY',
            "daysOfWeek": [
                [domingo],
                [lunes],
                [martes],
                [miercoles],
                [jueves],
                [viernes],
                [sabado]
            ],
            "monthNames": [
                [eneroS],
                [febreroS],
                [marzoS],
                [abrilS],
                [mayoS],
                [junioS],
                [julioS],
                [agostoS],
                [septiembreS],
                [octubreS],
                [noviembreS],
                [diciembreS]
            ],
            applyLabel: aceptar,
            cancelLabel: cancelar,
            customRangeLabel: rango
        }
    };

    funciones_inicio_consultarListadosAtributosPromociones(){
        this._pantallaServicio.mostrarSpinner();

        this._backService.HttpPost("catalogos/promocion/consultarListadosAtributosPromociones", {}, {}).subscribe((response: string) => {
            var dataTemp = eval(response);

            this.listadoClienteEstadoActividades = dataTemp[0];
            this.listadoClienteSexos = dataTemp[1];
            this.listadoClienteEdadRangos = dataTemp[2];
            this.listadoPromocionSucursalNuevaTipos = dataTemp[3];
            this.listadoPromocionSucursalNuevaVigenciaTipos = dataTemp[4];
            this.listadoPromocionSucursalNuevaVigenciaTipoCumpleaniosRangos = dataTemp[5];
            this.listadoPromocionSucursalNuevaAplicacionTipo = dataTemp[6];
            this.listadoPromocionSucursalNuevaAplicacionValorTipo = dataTemp[7];
            this.listadoPromocionSucursalNuevaDifusionTipos = dataTemp[8];
            this.listadoPromocionSucursalNuevaDifusionTipoPosteriorPeriodos = dataTemp[9];
            this.listadoPromocionSucursalNuevaDifusionTipoPosteriorAutorizacionTipos = dataTemp[10];
            this.listadoPromocionSucursalNuevaDifusionMedios = dataTemp[11];
            this.listadoServicios = dataTemp[12];
            this.listadoProductos = dataTemp[13];

            if(this.promocion.idPromocionSucursalNueva != "N"){
                this.funciones_inicio_consultarPromocion();
            }
            else{
                this.promocion.vigencia.fechaVigencia = { startDate: null, endDate: null };
                this.promocion.vigencia.fechaVigencia.startDate = moment(new Date()).startOf('month').format('DD/MM/YYYY');
                this.promocion.vigencia.fechaVigencia.endDate = moment(new Date()).endOf('month').format('DD/MM/YYYY');

                this._pantallaServicio.ocultarSpinner();
            }
        }, 
        (error) => {
            this._pantallaServicio.ocultarSpinner();
            if (error == 'SinSesion' || error == 'SesionCaducada') {
                if (error == 'SinSesion') {
                this._toaster.error(this.sessionTraslate.favorIniciarSesion);
                }
                if (error == 'SesionCaducada') {
                this._toaster.error(this.sessionTraslate.sesionCaducada);
                }
                this._router.navigate(['/login']);
                return;
            }
            this._toaster.error(this.sessionTraslate.errorEliminar);
        });;
    }

    funciones_inicio_consultarPromocion(){
        var params: any = {};
        params.idPromocionSucursalNueva = this.promocion.idPromocionSucursalNueva;

        this._backService.HttpPost("catalogos/promocion/consultarPromocion", {}, params).subscribe((response: string) => {
            var dataTemp = eval(response);

            // Datos Generales
            this.promocion.nombre = dataTemp[0][0].nombre;
            this.promocion.idPromocionSucursalNuevaTipo = dataTemp[0][0].idPromocionSucursalNuevaTipo;
            this.promocion.aplicacionPorCodigo = dataTemp[0][0].aplicacionPorCodigo;
            if(this.promocion.aplicacionPorCodigo){
                this.promocion.codigo = dataTemp[0][0].codigo;
            }
            this.promocion.usoLimitado = dataTemp[0][0].usoLimitado == 1 ? true : false;
            if(this.promocion.usoLimitado){
                this.promocion.cantidadUsos = dataTemp[0][0].cantidadUsos;
            }
            this.promocion.activa = dataTemp[0][0].activa == 1 ? true : false;
            this.promocion.esBorrador = dataTemp[0][0].esBorrador;
            // Cliente objetivo
            this.promocion.clienteObjetivo.todosClientes = dataTemp[1][0].todosClientes == 1 ? true : false;
            if(!this.promocion.clienteObjetivo.todosClientes){
                this.promocion.clienteObjetivo.idClienteEstadoActividad = dataTemp[1][0].idClienteEstadoActividad;
                this.promocion.clienteObjetivo.idClienteSexo = dataTemp[1][0].idClienteSexo;
                this.promocion.clienteObjetivo.idClienteEdadRango = dataTemp[1][0].idClienteEdadRango;
                this.promocion.clienteObjetivo.esVip = dataTemp[1][0].esVip;
            }
            // Vigencia
            this.promocion.vigencia.idPromocionSucursalNuevaVigenciaTipo = dataTemp[2][0].idPromocionSucursalNuevaVigenciaTipo;
            if(this.promocion.vigencia.idPromocionSucursalNuevaVigenciaTipo == 2){
                this.promocion.vigencia.idPromocionSucursalNuevaVigenciaTipoCumpleaniosRango = dataTemp[2][0].idPromocionSucursalNuevaVigenciaTipoCumpleaniosRango;
            }
            if(this.promocion.vigencia.idPromocionSucursalNuevaVigenciaTipo == 1){
                var fechaInicio = moment(dataTemp[2][0].fechaInicio).format('DD/MM/YYYY');
                var fechaFin = moment(dataTemp[2][0].fechaFin).format('DD/MM/YYYY');
                
                this.promocion.vigencia.fechaVigencia = { startDate: null, endDate: null };
                this.promocion.vigencia.fechaVigencia.startDate = fechaInicio;
                this.promocion.vigencia.fechaVigencia.endDate = fechaFin;
            }
            this.promocion.vigencia.restriccionHorario = dataTemp[2][0].restriccionHorario;
            if(this.promocion.vigencia.restriccionHorario){
                this.promocion.vigencia.restriccionHorarioInicio = dataTemp[2][0].restriccionHorarioInicio ? dataTemp[2][0].restriccionHorarioInicio : moment(new Date()).startOf('day').format('HH:mm');
                this.promocion.vigencia.restriccionHorarioFin = dataTemp[2][0].restriccionHorarioFin ? dataTemp[2][0].restriccionHorarioFin : moment(new Date()).endOf('day').format('HH:mm');
            }
            this.promocion.vigencia.restriccionDiasSemana = dataTemp[2][0].restriccionDiasSemana;
            if(this.promocion.vigencia.restriccionDiasSemana){
                this.promocion.vigencia.lunes = dataTemp[2][0].lunes == 1 ? true : false;
                this.promocion.vigencia.martes = dataTemp[2][0].martes == 1 ? true : false;
                this.promocion.vigencia.miercoles = dataTemp[2][0].miercoles == 1 ? true : false;
                this.promocion.vigencia.jueves = dataTemp[2][0].jueves == 1 ? true : false;
                this.promocion.vigencia.viernes = dataTemp[2][0].viernes == 1 ? true : false;
                this.promocion.vigencia.sabado = dataTemp[2][0].sabado == 1 ? true : false;
                this.promocion.vigencia.domingo = dataTemp[2][0].domingo == 1 ? true : false;
            }

            // Aplicación Promoción General
            if(this.promocion.idPromocionSucursalNuevaTipo == 1){
                // Promoción General Requisitos
                this.promocion.aplicacion.promocionGeneral.requisitos.servicios.todosServicios = 0;
                this.promocion.aplicacion.promocionGeneral.requisitos.productos.todosProductos = 0;
                for(var i = 0; i < dataTemp[4].length; i++){
                    if(dataTemp[4][i].todosServicios){
                        this.promocion.aplicacion.promocionGeneral.requisitos.servicios.todosServicios = 1;
                    }
                    if(dataTemp[4][i].todasPresentaciones){
                        this.promocion.aplicacion.promocionGeneral.requisitos.productos.todosProductos = 1;
                    }
                }
                if(!this.promocion.aplicacion.promocionGeneral.requisitos.servicios.todosServicios){
                    this.promocion.aplicacion.promocionGeneral.requisitos.servicios.servicios = [];
                    for(var i = 0; i < dataTemp[4].length; i++){
                        if(dataTemp[4][i].idServicio){
                            this.promocion.aplicacion.promocionGeneral.requisitos.servicios.servicios.push(dataTemp[4][i].idServicio);
                        }
                    }
                }
                if(!this.promocion.aplicacion.promocionGeneral.requisitos.productos.todosProductos){
                    this.promocion.aplicacion.promocionGeneral.requisitos.productos.productos = [];
                    for(var i = 0; i < dataTemp[4].length; i++){
                        if(dataTemp[4][i].idInventarioPresentacion){
                            this.promocion.aplicacion.promocionGeneral.requisitos.productos.productos.push(dataTemp[4][i].idInventarioPresentacion);
                        }
                    }
                }
                // Promoción General Valor
                for(var i = 0; i < dataTemp[5].length; i++){
                    if(dataTemp[5][i].todosServicios || dataTemp[5][i].idServicio){
                        this.promocion.aplicacion.promocionGeneral.valor.servicios.tipoDescuento = dataTemp[5][i].idPromocionSucursalNuevaAplicacionValorTipo;
                        this.promocion.aplicacion.promocionGeneral.valor.servicios.descuento = dataTemp[5][i].valor;
                        i = dataTemp[5].length;
                    }
                }

                for(var i = 0; i < dataTemp[5].length; i++){
                    if(dataTemp[5][i].todasPresentaciones || dataTemp[5][i].idInventarioPresentacion){
                        this.promocion.aplicacion.promocionGeneral.valor.productos.tipoDescuento = dataTemp[5][i].idPromocionSucursalNuevaAplicacionValorTipo;
                        this.promocion.aplicacion.promocionGeneral.valor.productos.descuento = dataTemp[5][i].valor;
                        i = dataTemp[5].length;
                    }
                }
            }

            // Aplicación Promoción Combos
            if(this.promocion.idPromocionSucursalNuevaTipo == 2){
                // Requisitos
                for(var i = 0; i < dataTemp[4].length; i++){
                    if(dataTemp[4][i].idServicio){
                        this.promocion.aplicacion.combos.requisitos.servicios.servicios.push(dataTemp[4][i].idServicio);
                        this.promocion.aplicacion.combos.requisitos.servicios.cantidades.push({
                            id: this.promocion.aplicacion.combos.requisitos.servicios.cantidades.length,
                            text: dataTemp[4][i].cantidad
                        });
                    }
                }

                for(var i = 0; i < dataTemp[4].length; i++){
                    if(dataTemp[4][i].idInventarioPresentacion){
                        this.promocion.aplicacion.combos.requisitos.productos.productos.push(dataTemp[4][i].idInventarioPresentacion);
                        this.promocion.aplicacion.combos.requisitos.productos.cantidades.push({
                            id: this.promocion.aplicacion.combos.requisitos.productos.cantidades.length,
                            text: dataTemp[4][i].cantidad
                        });
                    }
                }
                // Valor
                this.promocion.aplicacion.combos.valor.valorCombo = dataTemp[5][0].valor;
            }

            // Aplicación Promoción Numero Visita/Consumo
            if(this.promocion.idPromocionSucursalNuevaTipo == 3){
                // Requisitos
                this.promocion.aplicacion.numeroVisitaConsumo.requisitos.tipo = dataTemp[3][0].idPromocionSucursalNuevaAplicacionTipo;
                this.promocion.aplicacion.numeroVisitaConsumo.requisitos.numeroVisitaConsumo = dataTemp[3][0].cantidadVisitaConsumo;
                this.promocion.aplicacion.numeroVisitaConsumo.requisitos.servicios = [];
                for(var i = 0; i < dataTemp[4].length; i++){
                    if(dataTemp[4][i].idServicio){
                        this.promocion.aplicacion.numeroVisitaConsumo.requisitos.servicios.push(dataTemp[4][i].idServicio);
                    }
                }
                this.promocion.aplicacion.numeroVisitaConsumo.requisitos.productos = [];
                for(var i = 0; i < dataTemp[4].length; i++){
                    if(dataTemp[4][i].idInventarioPresentacion){
                        this.promocion.aplicacion.numeroVisitaConsumo.requisitos.productos.push(dataTemp[4][i].idInventarioPresentacion);
                    }
                }

                // Valor
                this.promocion.aplicacion.numeroVisitaConsumo.valor.servicios = [];
                for(var i = 0; i < dataTemp[5].length; i++){
                    if(dataTemp[5][i].idServicio){
                        this.promocion.aplicacion.numeroVisitaConsumo.valor.servicios.push({
                            servicio: dataTemp[5][i].idServicio, descuento: dataTemp[5][i].valor
                        })
                    }
                }
                this.promocion.aplicacion.numeroVisitaConsumo.valor.productos = [];
                for(var i = 0; i < dataTemp[5].length; i++){
                    if(dataTemp[5][i].idInventarioPresentacion){
                        this.promocion.aplicacion.numeroVisitaConsumo.valor.productos.push({
                            producto: dataTemp[5][i].idInventarioPresentacion, descuento: dataTemp[5][i].valor
                        })
                    }
                }
            }

            this.promocion.difusion.difusionPromocion = dataTemp[6][0].difusionPromocion;
            if(this.promocion.difusion.difusionPromocion){
                this.promocion.difusion.idPromocionSucursalNuevaDifusionTipo = dataTemp[6][0].idPromocionSucursalNuevaDifusionTipo;
                this.promocion.difusion.fechaInicio = dataTemp[6][0].fechaInicio == null ? "" : dataTemp[6][0].fechaInicio.toString().substring(0, 10);
                this.promocion.difusion.idPromocionSucursalNuevaDifusionTipoPosteriorPeriodo = dataTemp[6][0].idPromocionSucursalNuevaDifusionTipoPosteriorPeriodo;
                this.promocion.difusion.idPromocionSucursalNuevaDifusionMedio = dataTemp[6][0].idPromocionSucursalNuevaDifusionMedio;
                this.promocion.difusion.direccionImagen = dataTemp[6][0].direccionImagen;
                this.promocion.difusion.difundirSoloImagen = dataTemp[6][0].difundirSoloImagen == 1 ? true : false;
                this.promocion.difusion.encabezado = dataTemp[6][0].encabezado;
                this.promocion.difusion.piePagina = dataTemp[6][0].piePagina;
            
                if(this.promocion.difusion.difusionPromocion){
                    if(this.promocion.difusion.idPromocionSucursalNuevaDifusionTipoPosteriorPeriodo == 2){
                        for(var i = 0; i < dataTemp[7].length; i++){
                            this.promocion.difusion.difusionPosteriorPeriodo.restriccionDiasMes.push(dataTemp[7][i].dia);
                        }
                    }
                    if(this.promocion.difusion.idPromocionSucursalNuevaDifusionTipoPosteriorPeriodo == 3){
                        this.promocion.difusion.difusionPosteriorPeriodo.restriccionLunes = dataTemp[8][0].lunes;
                        this.promocion.difusion.difusionPosteriorPeriodo.restriccionMartes = dataTemp[8][0].martes;
                        this.promocion.difusion.difusionPosteriorPeriodo.restriccionMiercoles = dataTemp[8][0].miercoles;
                        this.promocion.difusion.difusionPosteriorPeriodo.restriccionJueves = dataTemp[8][0].jueves;
                        this.promocion.difusion.difusionPosteriorPeriodo.restriccionViernes = dataTemp[8][0].viernes;
                        this.promocion.difusion.difusionPosteriorPeriodo.restriccionSabado = dataTemp[8][0].sabado;
                        this.promocion.difusion.difusionPosteriorPeriodo.restriccionDomingo = dataTemp[8][0].domingo;
                    }
                }
            }

            setTimeout(() => {
                if(this.promocion.vigencia.restriccionDiasSemana){
                    this.funciones_inicio_marcarVigenciaRestriccionDias();
                }
                if(this.promocion.difusion.idPromocionSucursalNuevaDifusionTipoPosteriorPeriodo == 2){
                    this.funciones_inicio_marcarDifusionRestriccionDiasMes();
                }
                if(this.promocion.difusion.idPromocionSucursalNuevaDifusionTipoPosteriorPeriodo == 3){
                    this.funciones_inicio_marcarDifusionRestriccionDiaSemana();
                }
                this.funciones_inicio_cargarImagenPromocion();
            }, 10);
        }, 
        (error) => {
            this._pantallaServicio.ocultarSpinner();
            if (error == 'SinSesion' || error == 'SesionCaducada') {
                if (error == 'SinSesion') {
                this._toaster.error(this.sessionTraslate.favorIniciarSesion);
                }
                if (error == 'SesionCaducada') {
                this._toaster.error(this.sessionTraslate.sesionCaducada);
                }
                this._router.navigate(['/login']);
                return;
            }
            this._toaster.error(this.sessionTraslate.errorEliminar);
        });
    }

    funciones_inicio_cargarImagenPromocion(){
        var params: any = {};
        params.idPromocionSucursalNueva = this.promocion.idPromocionSucursalNueva;

        this._backService.HttpPost("catalogos/promocion/cargarImagenPromocion", {}, params).subscribe((response: string) => {
            this.promocion.difusion.imagenSrc = "data:image/jpeg;base64," + response;

            if(this.promocion.difusion.difusionPromocion){
                $("#contenedorImagenPromocion").css("display", "flex");
                $("#botonImagenPromocion").css("display", "none");

                setTimeout(() => {
                    let dbi_imagenPromocion: any = document.getElementById('imagenPromocion');
                    dbi_imagenPromocion.src = this.promocion.difusion.imagenSrc;
                    $("#botonImagenPromocion").removeClass("errorCampo2");
                    this.funciones_difusion_declararFuncionCambioImagen(undefined);
                }, 50);
            }

            this._pantallaServicio.ocultarSpinner();
        }, 
        (error) => {
            this._pantallaServicio.ocultarSpinner();
            if (error == 'SinSesion' || error == 'SesionCaducada') {
                if (error == 'SinSesion') {
                this._toaster.error(this.sessionTraslate.favorIniciarSesion);
                }
                if (error == 'SesionCaducada') {
                this._toaster.error(this.sessionTraslate.sesionCaducada);
                }
                this._router.navigate(['/login']);
                return;
            }
            this._toaster.error(this.sessionTraslate.errorEliminar);
        });
    }

    funciones_inicio_marcarVigenciaRestriccionDias(){
        let ebi_restriccionPromocionLun: any = document.getElementById("restriccionPromocion-lun");
        let ebi_restriccionPromocionMar: any = document.getElementById("restriccionPromocion-mar");
        let ebi_restriccionPromocionMie: any = document.getElementById("restriccionPromocion-mie");
        let ebi_restriccionPromocionJue: any = document.getElementById("restriccionPromocion-jue");
        let ebi_restriccionPromocionVie: any = document.getElementById("restriccionPromocion-vie");
        let ebi_restriccionPromocionSab: any = document.getElementById("restriccionPromocion-sab");
        let ebi_restriccionPromocionDom: any = document.getElementById("restriccionPromocion-dom");
        if (this.promocion.vigencia.lunes) {
            ebi_restriccionPromocionLun.children[0].children[0].style.color = "#FFFFFF"
            ebi_restriccionPromocionLun.children[0].children[0].style.background = "#20c4e6"
        }
        else {
            ebi_restriccionPromocionLun.children[0].children[0].style.color = ""
            ebi_restriccionPromocionLun.children[0].children[0].style.background = ""
        }
        
        if (this.promocion.vigencia.martes) {
            ebi_restriccionPromocionMar.children[0].children[0].style.color = "#FFFFFF"
            ebi_restriccionPromocionMar.children[0].children[0].style.background = "#20c4e6"
        }
        else {
            ebi_restriccionPromocionMar.children[0].children[0].style.color = ""
            ebi_restriccionPromocionMar.children[0].children[0].style.background = ""
        }
   
        if (this.promocion.vigencia.miercoles) {
            ebi_restriccionPromocionMie.children[0].children[0].style.color = "#FFFFFF"
            ebi_restriccionPromocionMie.children[0].children[0].style.background = "#20c4e6"
        }
        else {
            ebi_restriccionPromocionMie.children[0].children[0].style.color = ""
            ebi_restriccionPromocionMie.children[0].children[0].style.background = ""
        }

        if (this.promocion.vigencia.jueves) {
            ebi_restriccionPromocionJue.children[0].children[0].style.color = "#FFFFFF"
            ebi_restriccionPromocionJue.children[0].children[0].style.background = "#20c4e6"
        }
        else {
            ebi_restriccionPromocionJue.children[0].children[0].style.color = ""
            ebi_restriccionPromocionJue.children[0].children[0].style.background = ""
        }

        if (this.promocion.vigencia.viernes) {
            ebi_restriccionPromocionVie.children[0].children[0].style.color = "#FFFFFF"
            ebi_restriccionPromocionVie.children[0].children[0].style.background = "#20c4e6"
        }
        else {
            ebi_restriccionPromocionVie.children[0].children[0].style.color = ""
            ebi_restriccionPromocionVie.children[0].children[0].style.background = ""
        }

        if (this.promocion.vigencia.sabado) {
            ebi_restriccionPromocionSab.children[0].children[0].style.color = "#FFFFFF"
            ebi_restriccionPromocionSab.children[0].children[0].style.background = "#20c4e6"
        }
        else {
            ebi_restriccionPromocionSab.children[0].children[0].style.color = ""
            ebi_restriccionPromocionSab.children[0].children[0].style.background = ""
        }

        if (this.promocion.vigencia.domingo) {
            ebi_restriccionPromocionDom.children[0].children[0].style.color = "#FFFFFF"
            ebi_restriccionPromocionDom.children[0].children[0].style.background = "#20c4e6"
        }
        else {
            ebi_restriccionPromocionDom.children[0].children[0].style.color = ""
            ebi_restriccionPromocionDom.children[0].children[0].style.background = ""
        }
    }

    funciones_inicio_marcarDifusionRestriccionDiasMes(){
        for(var i = 0; i < this.promocion.difusion.difusionPosteriorPeriodo.restriccionDiasMes.length; i++){
            var dia = this.promocion.difusion.difusionPosteriorPeriodo.restriccionDiasMes[i];
            let ebi_restriccionDifusionDiaMesDifusion: any = document.getElementById("restriccionDifusionDiaMesDifusion" + dia);

            ebi_restriccionDifusionDiaMesDifusion.children[0].children[0].style.color = "#FFFFFF";
            ebi_restriccionDifusionDiaMesDifusion.children[0].children[0].style.background = "#20c4e6";
        }
    }
    
    funciones_inicio_marcarDifusionRestriccionDiaSemana(){
        let ebi_restriccionDifusionDiaSemanaLunes: any = document.getElementById("restriccionDifusionDiaSemanaLunes");
        let ebi_restriccionDifusionDiaSemanaMartes: any = document.getElementById("restriccionDifusionDiaSemanaMartes");
        let ebi_restriccionDifusionDiaSemanaMiercoles: any = document.getElementById("restriccionDifusionDiaSemanaMiercoles");
        let ebi_restriccionDifusionDiaSemanaJueves: any = document.getElementById("restriccionDifusionDiaSemanaJueves");
        let ebi_restriccionDifusionDiaSemanaViernes: any = document.getElementById("restriccionDifusionDiaSemanaViernes");
        let ebi_restriccionDifusionDiaSemanaSabado: any = document.getElementById("restriccionDifusionDiaSemanaSabado");
        let ebi_restriccionDifusionDiaSemanaDomingo: any = document.getElementById("restriccionDifusionDiaSemanaDomingo");

        if (this.promocion.difusion.difusionPosteriorPeriodo.restriccionLunes) {
            ebi_restriccionDifusionDiaSemanaLunes.children[0].children[0].style.color = "#FFFFFF";
            ebi_restriccionDifusionDiaSemanaLunes.children[0].children[0].style.background = "#20c4e6";
        }
        else {
            ebi_restriccionDifusionDiaSemanaLunes.children[0].children[0].style.color = "";
            ebi_restriccionDifusionDiaSemanaLunes.children[0].children[0].style.background = "";
        }

        if (this.promocion.difusion.difusionPosteriorPeriodo.restriccionMartes) {
            ebi_restriccionDifusionDiaSemanaMartes.children[0].children[0].style.color = "#FFFFFF";
            ebi_restriccionDifusionDiaSemanaMartes.children[0].children[0].style.background = "#20c4e6";
        }
        else {
            ebi_restriccionDifusionDiaSemanaMartes.children[0].children[0].style.color = "";
            ebi_restriccionDifusionDiaSemanaMartes.children[0].children[0].style.background = "";
        }

        if (this.promocion.difusion.difusionPosteriorPeriodo.restriccionMiercoles) {
            ebi_restriccionDifusionDiaSemanaMiercoles.children[0].children[0].style.color = "#FFFFFF";
            ebi_restriccionDifusionDiaSemanaMiercoles.children[0].children[0].style.background = "#20c4e6";
        }
        else {
            ebi_restriccionDifusionDiaSemanaMiercoles.children[0].children[0].style.color = "";
            ebi_restriccionDifusionDiaSemanaMiercoles.children[0].children[0].style.background = "";
        }

        if (this.promocion.difusion.difusionPosteriorPeriodo.restriccionJueves) {
            ebi_restriccionDifusionDiaSemanaJueves.children[0].children[0].style.color = "#FFFFFF";
            ebi_restriccionDifusionDiaSemanaJueves.children[0].children[0].style.background = "#20c4e6";
        }
        else {
            ebi_restriccionDifusionDiaSemanaJueves.children[0].children[0].style.color = "";
            ebi_restriccionDifusionDiaSemanaJueves.children[0].children[0].style.background = "";
        }

        if (this.promocion.difusion.difusionPosteriorPeriodo.restriccionViernes) {
            ebi_restriccionDifusionDiaSemanaViernes.children[0].children[0].style.color = "#FFFFFF";
            ebi_restriccionDifusionDiaSemanaViernes.children[0].children[0].style.background = "#20c4e6";
        }
        else {
            ebi_restriccionDifusionDiaSemanaViernes.children[0].children[0].style.color = "";
            ebi_restriccionDifusionDiaSemanaViernes.children[0].children[0].style.background = "";
        }

        if (this.promocion.difusion.difusionPosteriorPeriodo.restriccionSabado) {
            ebi_restriccionDifusionDiaSemanaSabado.children[0].children[0].style.color = "#FFFFFF";
            ebi_restriccionDifusionDiaSemanaSabado.children[0].children[0].style.background = "#20c4e6";
        }
        else {
            ebi_restriccionDifusionDiaSemanaSabado.children[0].children[0].style.color = "";
            ebi_restriccionDifusionDiaSemanaSabado.children[0].children[0].style.background = "";
        }

        if (this.promocion.difusion.difusionPosteriorPeriodo.restriccionDomingo) {
            ebi_restriccionDifusionDiaSemanaDomingo.children[0].children[0].style.color = "#FFFFFF";
            ebi_restriccionDifusionDiaSemanaDomingo.children[0].children[0].style.background = "#20c4e6";
        }
        else {
            ebi_restriccionDifusionDiaSemanaDomingo.children[0].children[0].style.color = "";
            ebi_restriccionDifusionDiaSemanaDomingo.children[0].children[0].style.background = "";
        }
    }

    // Funciones generales
    funciones_generales_mostrarOcultarCampos(opc: any){
        switch(opc){
            case 1: 
                this.promocion.verCampos = this.promocion.verCampos ? false : true;
                break;

            case 2: 
                this.promocion.clienteObjetivo.verCampos = this.promocion.clienteObjetivo.verCampos ? false : true;
                break;

            case 3: 
                this.promocion.vigencia.verCampos = this.promocion.vigencia.verCampos ? false : true;
                break;

            case 4: 
                this.promocion.aplicacion.verCampos = this.promocion.aplicacion.verCampos ? false : true;
                break;

            case 5: 
                this.promocion.difusion.verCampos = this.promocion.difusion.verCampos ? false : true;
                break;
        }
    }

    funciones_generales_quitarValidacionEstilo(id: any){
        this.promocion.aplicacion.promocionGeneral.requisitos.servicios.servicios;
        this.promocion.aplicacion.promocionGeneral.requisitos.productos.productos
        $("#" + id + " > div:first-child").attr("style", "outline: none");
    }

    // Funciones de datos generales
    funciones_datosGenerales_cambiarTipoPromocion(){
        if(this.promocion.idPromocionSucursalNuevaTipo == 3){
            this.promocion.aplicacionPorCodigo = false;
            this.promocion.codigo = "";
            this.promocion.clienteObjetivo.idClienteEstadoActividad = null;
        }

        this.promocion.aplicacion.promocionGeneral = {};
        this.promocion.aplicacion.combos = {};
        this.promocion.aplicacion.numeroVisitaConsumo = {};

        // Variables de Promocion General
        this.promocion.aplicacion.promocionGeneral.requisitos = {};
        this.promocion.aplicacion.promocionGeneral.requisitos.servicios = {};
        this.promocion.aplicacion.promocionGeneral.requisitos.servicios.todosServicios = false;
        this.promocion.aplicacion.promocionGeneral.requisitos.servicios.servicios = [];
        this.promocion.aplicacion.promocionGeneral.requisitos.productos = {};
        this.promocion.aplicacion.promocionGeneral.requisitos.productos.todosProductos = false;
        this.promocion.aplicacion.promocionGeneral.requisitos.productos.productos = [];
        this.promocion.aplicacion.promocionGeneral.valor = {};
        this.promocion.aplicacion.promocionGeneral.valor.servicios = {};
        this.promocion.aplicacion.promocionGeneral.valor.servicios.tipoDescuento = "";
        this.promocion.aplicacion.promocionGeneral.valor.servicios.descuento = "";
        this.promocion.aplicacion.promocionGeneral.valor.productos = {};
        this.promocion.aplicacion.promocionGeneral.valor.productos.tipoDescuento = "";
        this.promocion.aplicacion.promocionGeneral.valor.productos.descuento = "";

        // Variables de Promocion de Combos
        this.promocion.aplicacion.combos.requisitos = {};
        this.promocion.aplicacion.combos.requisitos.servicios = {};
        this.promocion.aplicacion.combos.requisitos.servicios.servicios = [];
        this.promocion.aplicacion.combos.requisitos.servicios.cantidades = [];
        this.promocion.aplicacion.combos.requisitos.productos = {};
        this.promocion.aplicacion.combos.requisitos.productos.productos = [];
        this.promocion.aplicacion.combos.requisitos.productos.cantidades = [];
        this.promocion.aplicacion.combos.valor = {};
        this.promocion.aplicacion.combos.valor.valorCombo = "";

        // Variables de Promocion de Numero de Visita/Consumo
        this.promocion.aplicacion.numeroVisitaConsumo.requisitos = {};
        this.promocion.aplicacion.numeroVisitaConsumo.requisitos.tipo = 1;
        this.promocion.aplicacion.numeroVisitaConsumo.requisitos.numeroVisitaConsumo = "";
        this.promocion.aplicacion.numeroVisitaConsumo.requisitos.servicios = [];
        this.promocion.aplicacion.numeroVisitaConsumo.requisitos.productos = [];
        this.promocion.aplicacion.numeroVisitaConsumo.valor = {};
        this.promocion.aplicacion.numeroVisitaConsumo.valor.servicios = [{servicio: "", descuento: "100"}];
        this.promocion.aplicacion.numeroVisitaConsumo.valor.productos = [{producto: "", descuento: "100"}];
    }

    funciones_datosGenerales_limpiarCodigoPromocion(){
        this.promocion.codigo = "";
    }

    funciones_datosGenerales_limpiarCantidadUsosPromocion(){
        this.promocion.cantidadUsos = "";
    }

    funciones_datosGenerales_validarCantidadUsosPromocion(opc: any){
        let ebi_inputCantidadUsosPromocion: any = document.getElementById("inputCantidadUsosPromocion");
        if(opc == "change"){
            if(!this.promocion.cantidadUsos){
                
                var cantidadAux = Number(ebi_inputCantidadUsosPromocion.value);

                if(cantidadAux > 100000){
                    this.promocion.cantidadUsos = 100000;
                    ebi_inputCantidadUsosPromocion.value = this.promocion.cantidadUsos.toString();
                }
            }
        }

        if(opc == "blur"){
            if(!this.promocion.cantidadUsos){
                var cantidadAux = Number(ebi_inputCantidadUsosPromocion.value);

                if(cantidadAux == 0){
                    this.promocion.cantidadUsos = 1;
                    ebi_inputCantidadUsosPromocion.value = this.promocion.cantidadUsos.toString();
                    $("#inputCantidadUsosPromocion").removeClass("errorCampo");
                }
            }
        }
    }

    funciones_datosGenerales_cambiarEstatusPromocion(){
        this.promocion.esBorrador = false;
        if(!this.promocion.activa){
            // Si no está activa, no se puede difundir
            this.promocion.difusion.difusionPromocion = false;
            this.promocion.difusion.idPromocionSucursalNuevaDifusionTipo = "";
            this.promocion.difusion.fechaInicio = "";
            this.promocion.difusion.idPromocionSucursalNuevaDifusionTipoPosteriorPeriodo = "";
            this.promocion.difusion.difusionPosteriorPeriodo = {};
            this.promocion.difusion.difusionPosteriorPeriodo.restriccionDiasMes = [];
            this.promocion.difusion.difusionPosteriorPeriodo.restriccionLunes = false;
            this.promocion.difusion.difusionPosteriorPeriodo.restriccionMartes = false;
            this.promocion.difusion.difusionPosteriorPeriodo.restriccionMiercoles = false;
            this.promocion.difusion.difusionPosteriorPeriodo.restriccionJueves = false;
            this.promocion.difusion.difusionPosteriorPeriodo.restriccionViernes = false;
            this.promocion.difusion.difusionPosteriorPeriodo.restriccionSabado = false;
            this.promocion.difusion.difusionPosteriorPeriodo.restriccionDomingo = false;
            this.promocion.difusion.difusionPosteriorAutomatica = true;
            this.promocion.difusion.idPromocionSucursalNuevaDifusionTipoPosteriorAutorizacionTipo = "";
            this.promocion.difusion.idPromocionSucursalNuevaDifusionMedio = 1;
            this.promocion.difusion.imagenSrc = "";
            this.promocion.difusion.direccionImagen = "";
            this.promocion.difusion.difundirSoloImagen = true;
            this.promocion.difusion.encabezado = "";
            this.promocion.difusion.piePagina = "";
        }
    }
    
    // Funciones de clientes objetivo
    funciones_clientesObjetivo_cambiarEstatusTodosClientesObjetivo(){
        this.promocion.clienteObjetivo.idClienteEstadoActividad = null;
        this.promocion.clienteObjetivo.idClienteSexo = null;
        this.promocion.clienteObjetivo.idClienteEdadRango = null;
        this.promocion.clienteObjetivo.esVip = false;
    }

    // Funciones de vigencia
    funciones_vigencia_cambiarTipoVigencia(){
        if(this.promocion.vigencia.idPromocionSucursalNuevaVigenciaTipo == 1){
            this.promocion.vigencia.fechaVigencia = this.promocion.vigencia.fechaInicioTemp + " - " + this.promocion.vigencia.fechaFinTemp;
            setTimeout(() => { 
                $('[data-toggle="tooltipFechaVigencia"]').tooltip(); 
                //this.funciones_inicio_declararDatepickerVigencia();
                this.promociones_inicializarCalendario();
            }, 100);
        }

        if(this.promocion.vigencia.idPromocionSucursalNuevaVigenciaTipo == 2){
            this.promocion.vigencia.restriccionDiasSemana = false;
            this.promocion.vigencia.lunes = false;
            this.promocion.vigencia.martes = false;
            this.promocion.vigencia.miercoles = false;
            this.promocion.vigencia.jueves = false;
            this.promocion.vigencia.viernes = false;
            this.promocion.vigencia.sabado = false;
            this.promocion.vigencia.domingo = false;
            this.promocion.vigencia.idPromocionSucursalNuevaVigenciaTipoCumpleaniosRango = 1;
            this.promocion.difusion.fechaInicio = "";
            this.promocion.difusion.idPromocionSucursalNuevaDifusionTipoPosteriorPeriodo = "";
            this.promocion.difusion.difusionPosteriorPeriodo.restriccionDiasMes = [];
            this.promocion.difusion.difusionPosteriorPeriodo.restriccionLunes = false;
            this.promocion.difusion.difusionPosteriorPeriodo.restriccionMartes = false;
            this.promocion.difusion.difusionPosteriorPeriodo.restriccionMiercoles = false;
            this.promocion.difusion.difusionPosteriorPeriodo.restriccionJueves = false;
            this.promocion.difusion.difusionPosteriorPeriodo.restriccionViernes = false;
            this.promocion.difusion.difusionPosteriorPeriodo.restriccionSabado = false;
            this.promocion.difusion.difusionPosteriorPeriodo.restriccionDomingo = false;
        }
    }

    funciones_vigencia_cambiarRestriccionHorasVigencia(){
        this.promocion.vigencia.restriccionHorarioInicio = moment(new Date()).startOf('day').format('HH:mm');
        this.promocion.vigencia.restriccionHorarioFin = moment(new Date()).endOf('day').format('HH:mm');
    }

    funciones_vigencia_validarRestriccionHoraInicio(opc: any){
        if(opc == "change"){
            if(this.promocion.vigencia.restriccionHorarioInicio != ""){

                var horaInicio = this.promocion.vigencia.restriccionHorarioInicio.split(':');
                var horaFin = this.promocion.vigencia.restriccionHorarioFin.split(':');

                var inicio = new Date();
                inicio.setHours(horaInicio[0], horaInicio[1], 0);

                var fin = new Date();
                fin.setHours(horaFin[0], horaFin[1], 0);

                if(inicio >= fin){
                    this.promocion.vigencia.restriccionHorarioInicio = moment(fin).add(-1, 'minute').format('HH:mm');
                }
            }
        }

        if(opc == "blur"){
            if(this.promocion.vigencia.restriccionHorarioInicio == ""){
                var horaFin = this.promocion.vigencia.restriccionHorarioFin.split(':');
                var fin = new Date();
                fin.setHours(horaFin[0], horaFin[1], 0);
                this.promocion.vigencia.restriccionHorarioInicio = moment(fin).add(-1, 'minute').format('HH:mm');
            }
        }

    }

    funciones_vigencia_validarRestriccionHoraFin(opc: any){
        if(opc == "change"){
            if(this.promocion.vigencia.restriccionHorarioFin != ""){
                var horaInicio = this.promocion.vigencia.restriccionHorarioInicio.split(':');
                var horaFin = this.promocion.vigencia.restriccionHorarioFin.split(':');
                var inicio = new Date();
                inicio.setHours(horaInicio[0], horaInicio[1], 0);
                var fin = new Date();
                fin.setHours(horaFin[0], horaFin[1], 0);

                if(fin <= inicio){
                    this.promocion.vigencia.restriccionHorarioFin = moment(inicio).add(1, 'minute').format('HH:mm');
                }
            }
        }

        if(opc == "blur"){
            if(this.promocion.vigencia.restriccionHorarioFin == ""){
                var horaInicio = this.promocion.vigencia.restriccionHorarioInicio.split(':');
                var inicio = new Date();
                inicio.setHours(horaInicio[0], horaInicio[1], 0);
                this.promocion.vigencia.restriccionHorarioFin = moment(inicio).add(1, 'minute').format('HH:mm');
            }
        }
    }

    funciones_vigencia_cambiarRestriccionDiasSemana(){
        this.promocion.vigencia.lunes = false;
        this.promocion.vigencia.martes = false;
        this.promocion.vigencia.miercoles = false;
        this.promocion.vigencia.jueves = false;
        this.promocion.vigencia.viernes = false;
        this.promocion.vigencia.sabado = false;
        this.promocion.vigencia.domingo = false;

        if(this.promocion.vigencia.restriccionDiasSemana){
            this.promocion.vigencia.lunes = true;
            setTimeout(() => {
                let dbi_restriccionPromocionLun: any = document.getElementById("restriccionPromocion-lun");
                dbi_restriccionPromocionLun.children[0].children[0].style.color = "#FFFFFF";
                dbi_restriccionPromocionLun.children[0].children[0].style.background = "#20c4e6";
            }, 10);
        }
    }

    funciones_vigencia_marcarRestriccionDiasSemana(dia: any){
        $("#vigenciaRestriccionDiasSemana").removeClass("errorCampo");
        switch (dia) {
            case 1:
                this.promocion.vigencia.lunes = !this.promocion.vigencia.lunes;
                let dbi_restriccionPromocionLun: any = document.getElementById("restriccionPromocion-lun");
                if (this.promocion.vigencia.lunes) {
                    dbi_restriccionPromocionLun.children[0].children[0].style.color = "#FFFFFF";
                    dbi_restriccionPromocionLun.children[0].children[0].style.background = "#20c4e6";
                }
                else {
                    dbi_restriccionPromocionLun.children[0].children[0].style.color = "";
                    dbi_restriccionPromocionLun.children[0].children[0].style.background = "";
                }
                break;

            case 2:
                this.promocion.vigencia.martes = !this.promocion.vigencia.martes;
                let dbi_restriccionPromocionMar: any = document.getElementById("restriccionPromocion-mar");
                if (this.promocion.vigencia.martes) {
                    dbi_restriccionPromocionMar.children[0].children[0].style.color = "#FFFFFF";
                    dbi_restriccionPromocionMar.children[0].children[0].style.background = "#20c4e6";
                }
                else {
                    dbi_restriccionPromocionMar.children[0].children[0].style.color = "";
                    dbi_restriccionPromocionMar.children[0].children[0].style.background = "";
                }
                break;

            case 3:
                this.promocion.vigencia.miercoles = !this.promocion.vigencia.miercoles;
                let dbi_restriccionPromocionMie: any = document.getElementById("restriccionPromocion-mie");
                if (this.promocion.vigencia.miercoles) {
                    dbi_restriccionPromocionMie.children[0].children[0].style.color = "#FFFFFF";
                    dbi_restriccionPromocionMie.children[0].children[0].style.background = "#20c4e6";
                }
                else {
                    dbi_restriccionPromocionMie.children[0].children[0].style.color = "";
                    dbi_restriccionPromocionMie.children[0].children[0].style.background = "";
                }
                break;

            case 4:
                this.promocion.vigencia.jueves = !this.promocion.vigencia.jueves;
                let dbi_restriccionPromocionJue: any = document.getElementById("restriccionPromocion-jue");
                if (this.promocion.vigencia.jueves) {
                    dbi_restriccionPromocionJue.children[0].children[0].style.color = "#FFFFFF";
                    dbi_restriccionPromocionJue.children[0].children[0].style.background = "#20c4e6";
                }
                else {
                    dbi_restriccionPromocionJue.children[0].children[0].style.color = "";
                    dbi_restriccionPromocionJue.children[0].children[0].style.background = "";
                }
                break;

            case 5:
                this.promocion.vigencia.viernes = !this.promocion.vigencia.viernes;
                let dbi_restriccionPromocionVie: any = document.getElementById("restriccionPromocion-vie");
                if (this.promocion.vigencia.viernes) {
                    dbi_restriccionPromocionVie.children[0].children[0].style.color = "#FFFFFF";
                    dbi_restriccionPromocionVie.children[0].children[0].style.background = "#20c4e6";
                }
                else {
                    dbi_restriccionPromocionVie.children[0].children[0].style.color = "";
                    dbi_restriccionPromocionVie.children[0].children[0].style.background = "";
                }
                break;

            case 6:
                this.promocion.vigencia.sabado = !this.promocion.vigencia.sabado;
                let dbi_restriccionPromocionSab: any = document.getElementById("restriccionPromocion-sab");
                if (this.promocion.vigencia.sabado) {
                    dbi_restriccionPromocionSab.children[0].children[0].style.color = "#FFFFFF";
                    dbi_restriccionPromocionSab.children[0].children[0].style.background = "#20c4e6";
                }
                else {
                    dbi_restriccionPromocionSab.children[0].children[0].style.color = "";
                    dbi_restriccionPromocionSab.children[0].children[0].style.background = "";
                }
                break;

            case 7:
                this.promocion.vigencia.domingo = !this.promocion.vigencia.domingo;
                let dbi_restriccionPromocionDom: any = document.getElementById("restriccionPromocion-dom");
                if (this.promocion.vigencia.domingo) {
                    dbi_restriccionPromocionDom.children[0].children[0].style.color = "#FFFFFF";
                    dbi_restriccionPromocionDom.children[0].children[0].style.background = "#20c4e6";
                }
                else {
                    dbi_restriccionPromocionDom.children[0].children[0].style.color = "";
                    dbi_restriccionPromocionDom.children[0].children[0].style.background = "";
                }
                break;
        }
    }

    // Funciones de promoción general
    funciones_aplicacionPromocion_promocionGeneral_limpiarRequisitosServicios(){
        this.promocion.aplicacion.promocionGeneral.requisitos.servicios.servicios = [];
        if(!this.promocion.aplicacion.promocionGeneral.requisitos.servicios.todosServicios){
            this.promocion.aplicacion.promocionGeneral.valor.servicios.tipoDescuento = "";
            this.promocion.aplicacion.promocionGeneral.valor.servicios.descuento = "";
            //$("#ddlAplicacionPromocionGeneralValorServiciosTipoDescuento > div:first-child").attr("style", "outline: red solid 1px !important");
            $("#ddlAplicacionPromocionGeneralValorServiciosTipoDescuento > div:first-child").attr("style", "outline: none");
            $("#ddlAplicacionPromocionGeneralValorServiciosDescuento > div:first-child").attr("style", "outline: none");
        }

        $("#ddlAplicacionPromocionGeneralRequisitosServicios > div:first-child").attr("style", "outline: none");
        $("#ddlAplicacionPromocionGeneralRequisitosProductos > div:first-child").attr("style", "outline: none");
    }

    funciones_aplicacionPromocion_promocionGeneral_limpiarRequisitosProductos(){
        this.promocion.aplicacion.promocionGeneral.requisitos.productos.productos = [];
        if(!this.promocion.aplicacion.promocionGeneral.requisitos.productos.todosProductos){
            this.promocion.aplicacion.promocionGeneral.valor.productos.tipoDescuento = "";
            this.promocion.aplicacion.promocionGeneral.valor.productos.descuento = "";

            $("#ddlAplicacionPromocionGeneralValorProductosTipoDescuento > div:first-child").attr("style", "outline: none");
            $("#ddlAplicacionPromocionGeneralValorProductosDescuento > div:first-child").attr("style", "outline: none");
        }
        $("#ddlAplicacionPromocionGeneralRequisitosServicios > div:first-child").attr("style", "outline: none");
        $("#ddlAplicacionPromocionGeneralRequisitosProductos > div:first-child").attr("style", "outline: none");
    }

    funciones_aplicacionPromocion_promocionGeneral_cambiarValorServiciosTipoDescuento(){
        this.promocion.aplicacion.promocionGeneral.valor.servicios.descuento = "";
    }

    funciones_aplicacionPromocion_promocionGeneral_validarValorServiciosDescuento(opc: any){
        if(opc == "change"){
            if(this.promocion.aplicacion.promocionGeneral.valor.servicios.descuento != ""){
                var floatRegex = RegExp("^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$");

                if (!floatRegex.test(this.promocion.aplicacion.promocionGeneral.valor.servicios.descuento)) {
                    this.promocion.aplicacion.promocionGeneral.valor.servicios.descuento = "";
                }
                else{
                    if(this.promocion.aplicacion.promocionGeneral.valor.servicios.tipoDescuento == 2){
                        if(Number(this.promocion.aplicacion.promocionGeneral.valor.servicios.descuento) > 100){
                            this.promocion.aplicacion.promocionGeneral.valor.servicios.descuento = 100;
                        }
                    }
                }
            }
        }

        if(opc == "blur"){
            if(this.promocion.aplicacion.promocionGeneral.valor.servicios.descuento[this.promocion.aplicacion.promocionGeneral.valor.servicios.descuento.length -1] == "."){
                this.promocion.aplicacion.promocionGeneral.valor.servicios.descuento = this.promocion.aplicacion.promocionGeneral.valor.servicios.descuento.slice(0, -1);
            }
            if(this.promocion.aplicacion.promocionGeneral.valor.servicios.descuento == ""){
                this.promocion.aplicacion.promocionGeneral.valor.servicios.descuento = 0;
            }
        }
    }

    funciones_aplicacionPromocion_promocionGeneral_cambiarValorProductosTipoDescuento(){
        this.promocion.aplicacion.promocionGeneral.valor.productos.descuento = "";
    }

    funciones_aplicacionPromocion_promocionGeneral_validarValorProductosDescuento(opc: any){
        if(opc == "change"){
            if(this.promocion.aplicacion.promocionGeneral.valor.productos.descuento != ""){
                var floatRegex = RegExp("^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$");

                if (!floatRegex.test(this.promocion.aplicacion.promocionGeneral.valor.productos.descuento)) {
                    this.promocion.aplicacion.promocionGeneral.valor.productos.descuento = "";
                }
                else{
                    if(this.promocion.aplicacion.promocionGeneral.valor.productos.tipoDescuento == 2){
                        if(Number(this.promocion.aplicacion.promocionGeneral.valor.productos.descuento) > 100){
                            this.promocion.aplicacion.promocionGeneral.valor.productos.descuento = 100;
                        }
                    }
                }
            }
        }

        if(opc == "blur"){
            if(this.promocion.aplicacion.promocionGeneral.valor.productos.descuento[this.promocion.aplicacion.promocionGeneral.valor.productos.descuento.length -1] == "."){
                this.promocion.aplicacion.promocionGeneral.valor.productos.descuento = this.promocion.aplicacion.promocionGeneral.valor.productos.descuento.slice(0, -1);
            }
            if(this.promocion.aplicacion.promocionGeneral.valor.productos.descuento == ""){
                this.promocion.aplicacion.promocionGeneral.valor.productos.descuento = 0;
            }
        }
    }

    // Funciones de promoción combos
    funciones_aplicacionPromocion_promocionCombos_validarValorCombo(opc: any){
        if(opc == "change"){
            var floatRegex = RegExp("^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$");

            if (!floatRegex.test(this.promocion.aplicacion.combos.valor.valorCombo)) {
                this.promocion.aplicacion.combos.valor.valorCombo = "";
            }
        }

        if(opc == "blur"){
            if(this.promocion.aplicacion.combos.valor.valorCombo[this.promocion.aplicacion.combos.valor.valorCombo.length -1] == "."){
                this.promocion.aplicacion.combos.valor.valorCombo = this.promocion.aplicacion.combos.valor.valorCombo.slice(0, -1);
            }
        }
    }

    // Funciones de promoción visitas consumo
    funciones_aplicacionPromocion_promocionVisitaConsumo_validarRequisitosCantidadVisitaConsumo(opc: any){
        if(opc == "change"){
            let ebi_inputAplicacionPromocionVisitaConsumoRequisitosCantidadVisitaConsumo : any = document.getElementById("inputAplicacionPromocionVisitaConsumoRequisitosCantidadVisitaConsumo"); 

            if(!this.promocion.aplicacion.numeroVisitaConsumo.requisitos.numeroVisitaConsumo){
                var cantidadAux = Number(ebi_inputAplicacionPromocionVisitaConsumoRequisitosCantidadVisitaConsumo.value);

                if(cantidadAux > 1000){
                    this.promocion.aplicacion.numeroVisitaConsumo.requisitos.numeroVisitaConsumo = 1000;
                    ebi_inputAplicacionPromocionVisitaConsumoRequisitosCantidadVisitaConsumo.value = this.promocion.aplicacion.numeroVisitaConsumo.requisitos.numeroVisitaConsumo.toString();
                }
            }
        }

        if(opc == "blur"){
            let ebi_inputAplicacionPromocionVisitaConsumoRequisitosCantidadVisitaConsumo : any = document.getElementById("inputAplicacionPromocionVisitaConsumoRequisitosCantidadVisitaConsumo"); 

            if(!this.promocion.aplicacion.numeroVisitaConsumo.requisitos.numeroVisitaConsumo){
                var cantidadAux = Number(ebi_inputAplicacionPromocionVisitaConsumoRequisitosCantidadVisitaConsumo.value);

                if(cantidadAux == 0){
                    this.promocion.aplicacion.numeroVisitaConsumo.requisitos.numeroVisitaConsumo = 1;
                    ebi_inputAplicacionPromocionVisitaConsumoRequisitosCantidadVisitaConsumo.value = this.promocion.aplicacion.numeroVisitaConsumo.requisitos.numeroVisitaConsumo.toString();
                }
            }
        }
    }

    funciones_aplicacionPromocion_promocionVisitaConsumo_agregarValorServicios(){
        var tamanio = this.promocion.aplicacion.numeroVisitaConsumo.valor.servicios.length;

        if(tamanio > 0){
            if(this.promocion.aplicacion.numeroVisitaConsumo.valor.servicios[tamanio - 1].servicio && this.promocion.aplicacion.numeroVisitaConsumo.valor.servicios[tamanio - 1].descuento){
                this.promocion.aplicacion.numeroVisitaConsumo.valor.servicios.push({servicio: "", descuento: "100"});
            }
            else{
                if(!this.promocion.aplicacion.numeroVisitaConsumo.valor.servicios[tamanio - 1].servicio){
                    $("#ddlAplicacionPromocionVisitaConsumoValorServicio" + (tamanio - 1) + " > div:first-child").attr("style", "outline: red solid 1px !important");
                }
                if(!this.promocion.aplicacion.numeroVisitaConsumo.valor.servicios[tamanio - 1].descuento){
                    $("#inputAplicacionPromocionVisitaConsumoValorServicioDescuento" + (tamanio - 1)).addClass("errorCampo");
                }
            }
        }
        else{
            this.promocion.aplicacion.numeroVisitaConsumo.valor.servicios.push({servicio: "", descuento: "100"});
        }
    }

    funciones_aplicacionPromocion_promocionVisitaConsumo_validarValorServicioDescuento(s: any, opc: any){
        if(opc == "change"){
            var floatRegex = RegExp("^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$");

            if (!floatRegex.test(s.descuento)) {
                s.descuento = "";
            }
            else{
                if(Number(s.descuento) > 100){
                    s.descuento = 100
                }
            }
        }

        if(opc == "blur"){
            if(s.descuento[s.descuento.length -1] == "."){
                s.descuento = s.descuento.slice(0, -1);
            }
        }
    }

    funciones_aplicacionPromocion_promocionVisitaConsumo_removerValorServicios(index: any){
        this.promocion.aplicacion.numeroVisitaConsumo.valor.servicios.splice(index, 1);

        for(var i = 0; i < this.promocion.aplicacion.numeroVisitaConsumo.valor.servicios.length; i++){
            if(!this.promocion.aplicacion.numeroVisitaConsumo.valor.servicios[i].servicio){
                $("#ddlAplicacionPromocionVisitaConsumoValorServicio" + (i) + " > div:first-child").attr("style", "outline: red solid 1px !important");
            }
            if(!this.promocion.aplicacion.numeroVisitaConsumo.valor.servicios[i].descuento){
                $("#inputAplicacionPromocionVisitaConsumoValorServicioDescuento" + (i)).addClass("errorCampo");
            }
        }
    }

    funciones_aplicacionPromocion_promocionVisitaConsumo_agregarValorProductos(){
        var tamanio = this.promocion.aplicacion.numeroVisitaConsumo.valor.productos.length;

        if(tamanio > 0){
            if(this.promocion.aplicacion.numeroVisitaConsumo.valor.productos[tamanio - 1].producto && this.promocion.aplicacion.numeroVisitaConsumo.valor.productos[tamanio - 1].descuento){
                this.promocion.aplicacion.numeroVisitaConsumo.valor.productos.push({producto: "", descuento: "100"});
            }
            else{
                if(!this.promocion.aplicacion.numeroVisitaConsumo.valor.productos[tamanio - 1].producto){
                    $("#ddlAplicacionPromocionVisitaConsumoValorProducto" + (tamanio - 1) + " > div:first-child").attr("style", "outline: red solid 1px !important");
                }
                if(!this.promocion.aplicacion.numeroVisitaConsumo.valor.productos[tamanio - 1].descuento){
                    $("#inputAplicacionPromocionVisitaConsumoValorProductoDescuento" + (tamanio - 1)).addClass("errorCampo");
                }
            }
        }
        else{
            this.promocion.aplicacion.numeroVisitaConsumo.valor.productos.push({producto: "", descuento: "100"});
        }
    }

    funciones_aplicacionPromocion_promocionVisitaConsumo_validarValorProductoDescuento(p: any, opc: any){
        if(opc == "change"){
            var floatRegex = RegExp("^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$");

            if (!floatRegex.test(p.descuento)) {
                p.descuento = "";
            }
            else{
                if(Number(p.descuento) > 100){
                    p.descuento = 100
                }
            }
        }

        if(opc == "blur"){
            if(p.descuento[p.descuento.length -1] == "."){
                p.descuento = p.descuento.slice(0, -1);
            }
        }
    }

    funciones_aplicacionPromocion_promocionVisitaConsumo_removerValorProductos(index: any){
        this.promocion.aplicacion.numeroVisitaConsumo.valor.productos.splice(index, 1);

        for(var i = 0; i < this.promocion.aplicacion.numeroVisitaConsumo.valor.productos.length; i++){
            if(!this.promocion.aplicacion.numeroVisitaConsumo.valor.productos[i].producto){
                $("#ddlAplicacionPromocionVisitaConsumoValorProducto" + (i) + " > div:first-child").attr("style", "outline: red solid 1px !important");
            }
            if(!this.promocion.aplicacion.numeroVisitaConsumo.valor.productos[i].descuento){
                $("#inputAplicacionPromocionVisitaConsumoValorProductoDescuento" + (i)).addClass("errorCampo");
            }
        }
    }

    // Funciones de difusión
    funciones_difusion_cambiarEstatusDifusion(){
        this.promocion.difusion.idPromocionSucursalNuevaDifusionTipo = "";
        this.promocion.difusion.fechaInicio = "";
        this.promocion.difusion.idPromocionSucursalNuevaDifusionTipoPosteriorPeriodo = "";
        this.promocion.difusion.difusionPosteriorPeriodo = {};
        this.promocion.difusion.difusionPosteriorPeriodo.restriccionDiasMes = [];
        this.promocion.difusion.difusionPosteriorPeriodo.restriccionLunes = false;
        this.promocion.difusion.difusionPosteriorPeriodo.restriccionMartes = false;
        this.promocion.difusion.difusionPosteriorPeriodo.restriccionMiercoles = false;
        this.promocion.difusion.difusionPosteriorPeriodo.restriccionJueves = false;
        this.promocion.difusion.difusionPosteriorPeriodo.restriccionViernes = false;
        this.promocion.difusion.difusionPosteriorPeriodo.restriccionSabado = false;
        this.promocion.difusion.difusionPosteriorPeriodo.restriccionDomingo = false;
        this.promocion.difusion.difusionPosteriorAutomatica = true;
        this.promocion.difusion.idPromocionSucursalNuevaDifusionTipoPosteriorAutorizacionTipo = "";
        this.promocion.difusion.idPromocionSucursalNuevaDifusionMedio = 1;
        this.promocion.difusion.imagenSrc = "";
        this.promocion.difusion.direccionImagen = "";
        this.promocion.difusion.difundirSoloImagen = true;
        this.promocion.difusion.encabezado = "";
        this.promocion.difusion.piePagina = "";

        if(this.promocion.difusion.difusionPromocion){
            setTimeout(() => { 
                this.funciones_difusion_declararFuncionCambioImagen(undefined);
            }, 100);
        }
    }

    funciones_difusion_validarFechaInicio(){
        if(!this.promocion.difusion.fechaInicio){
            this.promocion.difusion.fechaInicio = "";
        }
    }

    funciones_difusion_cambiarTipoDifusion(){
        this.promocion.difusion.idPromocionSucursalNuevaDifusionTipoPosteriorPeriodo = "";
        this.promocion.difusion.difusionPosteriorPeriodo.restriccionDiasMes = [];
        this.promocion.difusion.difusionPosteriorPeriodo.restriccionLunes = false;
        this.promocion.difusion.difusionPosteriorPeriodo.restriccionMartes = false;
        this.promocion.difusion.difusionPosteriorPeriodo.restriccionMiercoles = false;
        this.promocion.difusion.difusionPosteriorPeriodo.restriccionJueves = false;
        this.promocion.difusion.difusionPosteriorPeriodo.restriccionViernes = false;
        this.promocion.difusion.difusionPosteriorPeriodo.restriccionSabado = false;
        this.promocion.difusion.difusionPosteriorPeriodo.restriccionDomingo = false;
    }

    funciones_difusion_cambiarPeriodoDifusionPosterior(){
        this.promocion.difusion.difusionPosteriorPeriodo.restriccionDiasMes = [];
        this.promocion.difusion.difusionPosteriorPeriodo.restriccionLunes = false;
        this.promocion.difusion.difusionPosteriorPeriodo.restriccionMartes = false;
        this.promocion.difusion.difusionPosteriorPeriodo.restriccionMiercoles = false;
        this.promocion.difusion.difusionPosteriorPeriodo.restriccionJueves = false;
        this.promocion.difusion.difusionPosteriorPeriodo.restriccionViernes = false;
        this.promocion.difusion.difusionPosteriorPeriodo.restriccionSabado = false;
        this.promocion.difusion.difusionPosteriorPeriodo.restriccionDomingo = false;

        if(this.promocion.difusion.idPromocionSucursalNuevaDifusionTipoPosteriorPeriodo == 2){
            this.promocion.difusion.difusionPosteriorPeriodo.restriccionDiasMes.push(1);
            setTimeout(() => { 
                let ebi_restriccionDifusionDiaMesDifusion1: any = document.getElementById("restriccionDifusionDiaMesDifusion1");
                ebi_restriccionDifusionDiaMesDifusion1.children[0].children[0].style.color = "#FFFFFF";
                ebi_restriccionDifusionDiaMesDifusion1.children[0].children[0].style.background = "#20c4e6";
            }, 10);
        }

        if(this.promocion.difusion.idPromocionSucursalNuevaDifusionTipoPosteriorPeriodo == 3){
            this.promocion.difusion.difusionPosteriorPeriodo.restriccionLunes = true;
            setTimeout(() => { 
                let ebi_restriccionDifusionDiaSemanaLunes: any = document.getElementById("restriccionDifusionDiaSemanaLunes");
                ebi_restriccionDifusionDiaSemanaLunes.children[0].children[0].style.color = "#FFFFFF";
                ebi_restriccionDifusionDiaSemanaLunes.children[0].children[0].style.background = "#20c4e6";
            }, 10);
        }
    }

    funciones_difusion_marcarRestriccionDiaMes(dia: any){
        $("#difusionRestriccionDiasMesCalendario").removeClass("errorCampo");

        var seleccionar = true;
        for(var i = 0; i < this.promocion.difusion.difusionPosteriorPeriodo.restriccionDiasMes.length; i++){
            if(this.promocion.difusion.difusionPosteriorPeriodo.restriccionDiasMes[i] == dia){
                seleccionar = false;
                this.promocion.difusion.difusionPosteriorPeriodo.restriccionDiasMes.splice(i, 1);                    
                i = this.promocion.difusion.difusionPosteriorPeriodo.restriccionDiasMes.length;
            }
        }

        if(seleccionar){
            this.promocion.difusion.difusionPosteriorPeriodo.restriccionDiasMes.push(dia);
            let ebi_restriccionDifusionDiaMesDifusionDia: any = document.getElementById("restriccionDifusionDiaMesDifusion" + dia);
            ebi_restriccionDifusionDiaMesDifusionDia.children[0].children[0].style.color = "#FFFFFF";
            ebi_restriccionDifusionDiaMesDifusionDia.children[0].children[0].style.background = "#20c4e6";
        }
        else{
            let ebi_restriccionDifusionDiaMesDifusionDia: any = document.getElementById("restriccionDifusionDiaMesDifusion" + dia);
            ebi_restriccionDifusionDiaMesDifusionDia.children[0].children[0].style.color = "";
            ebi_restriccionDifusionDiaMesDifusionDia.children[0].children[0].style.background = "";
        }
    }

    funciones_difusion_marcarRestriccionDiaSemana(dia: any){
        $("#difusionRestriccionDiasDeSemana").removeClass("errorCampo");
        switch (dia) {
            case 1:
                this.promocion.difusion.difusionPosteriorPeriodo.restriccionLunes = !this.promocion.difusion.difusionPosteriorPeriodo.restriccionLunes;
                let ebi_restriccionDifusionDiaSemanaLunes: any = document.getElementById("restriccionDifusionDiaSemanaLunes");
                if (this.promocion.difusion.difusionPosteriorPeriodo.restriccionLunes) {
                    ebi_restriccionDifusionDiaSemanaLunes.children[0].children[0].style.color = "#FFFFFF";
                    ebi_restriccionDifusionDiaSemanaLunes.children[0].children[0].style.background = "#20c4e6";
                }
                else {
                    ebi_restriccionDifusionDiaSemanaLunes.children[0].children[0].style.color = "";
                    ebi_restriccionDifusionDiaSemanaLunes.children[0].children[0].style.background = "";
                }
                break;

            case 2:
                this.promocion.difusion.difusionPosteriorPeriodo.restriccionMartes = !this.promocion.difusion.difusionPosteriorPeriodo.restriccionMartes;
                let ebi_restriccionDifusionDiaSemanaMartes: any = document.getElementById("restriccionDifusionDiaSemanaMartes");
                if (this.promocion.difusion.difusionPosteriorPeriodo.restriccionMartes) {
                    ebi_restriccionDifusionDiaSemanaMartes.children[0].children[0].style.color = "#FFFFFF";
                    ebi_restriccionDifusionDiaSemanaMartes.children[0].children[0].style.background = "#20c4e6";
                }
                else {
                    ebi_restriccionDifusionDiaSemanaMartes.children[0].children[0].style.color = "";
                    ebi_restriccionDifusionDiaSemanaMartes.children[0].children[0].style.background = "";
                }
                break;

            case 3:
                this.promocion.difusion.difusionPosteriorPeriodo.restriccionMiercoles = !this.promocion.difusion.difusionPosteriorPeriodo.restriccionMiercoles;
                let ebi_restriccionDifusionDiaSemanaMiercoles: any = document.getElementById("restriccionDifusionDiaSemanaMiercoles");
                if (this.promocion.difusion.difusionPosteriorPeriodo.restriccionMiercoles) {
                    ebi_restriccionDifusionDiaSemanaMiercoles.children[0].children[0].style.color = "#FFFFFF";
                    ebi_restriccionDifusionDiaSemanaMiercoles.children[0].children[0].style.background = "#20c4e6";
                }
                else {
                    ebi_restriccionDifusionDiaSemanaMiercoles.children[0].children[0].style.color = "";
                    ebi_restriccionDifusionDiaSemanaMiercoles.children[0].children[0].style.background = "";
                }
                break;

            case 4:
                this.promocion.difusion.difusionPosteriorPeriodo.restriccionJueves = !this.promocion.difusion.difusionPosteriorPeriodo.restriccionJueves;
                let ebi_restriccionDifusionDiaSemanaJueves: any = document.getElementById("restriccionDifusionDiaSemanaJueves");
                if (this.promocion. difusion.difusionPosteriorPeriodo.restriccionJueves) {
                    ebi_restriccionDifusionDiaSemanaJueves.children[0].children[0].style.color = "#FFFFFF";
                    ebi_restriccionDifusionDiaSemanaJueves.children[0].children[0].style.background = "#20c4e6";
                }
                else {
                    ebi_restriccionDifusionDiaSemanaJueves.children[0].children[0].style.color = "";
                    ebi_restriccionDifusionDiaSemanaJueves.children[0].children[0].style.background = "";
                }
                break;

            case 5:
                this.promocion.difusion.difusionPosteriorPeriodo.restriccionViernes = !this.promocion.difusion.difusionPosteriorPeriodo.restriccionViernes;
                let ebi_restriccionDifusionDiaSemanaViernes: any = document.getElementById("restriccionDifusionDiaSemanaViernes");
                if (this.promocion.difusion.difusionPosteriorPeriodo.restriccionViernes) {
                    ebi_restriccionDifusionDiaSemanaViernes.children[0].children[0].style.color = "#FFFFFF";
                    ebi_restriccionDifusionDiaSemanaViernes.children[0].children[0].style.background = "#20c4e6";
                }
                else {
                    ebi_restriccionDifusionDiaSemanaViernes.children[0].children[0].style.color = "";
                    ebi_restriccionDifusionDiaSemanaViernes.children[0].children[0].style.background = "";
                }
                break;

            case 6:
                this.promocion.difusion.difusionPosteriorPeriodo.restriccionSabado = !this.promocion.difusion.difusionPosteriorPeriodo.restriccionSabado;
                let ebi_restriccionDifusionDiaSemanaSabado: any = document.getElementById("restriccionDifusionDiaSemanaSabado");
                if (this.promocion.difusion.difusionPosteriorPeriodo.restriccionSabado) {
                    ebi_restriccionDifusionDiaSemanaSabado.children[0].children[0].style.color = "#FFFFFF";
                    ebi_restriccionDifusionDiaSemanaSabado.children[0].children[0].style.background = "#20c4e6";
                }
                else {
                    ebi_restriccionDifusionDiaSemanaSabado.children[0].children[0].style.color = "";
                    ebi_restriccionDifusionDiaSemanaSabado.children[0].children[0].style.background = "";
                }
                break;

            case 7:
                this.promocion.difusion.difusionPosteriorPeriodo.restriccionDomingo = !this.promocion.difusion.difusionPosteriorPeriodo.restriccionDomingo;
                let ebi_restriccionDifusionDiaSemanaDomingo: any = document.getElementById("restriccionDifusionDiaSemanaDomingo");
                if (this.promocion.difusion.difusionPosteriorPeriodo.restriccionDomingo) {
                    ebi_restriccionDifusionDiaSemanaDomingo.children[0].children[0].style.color = "#FFFFFF";
                    ebi_restriccionDifusionDiaSemanaDomingo.children[0].children[0].style.background = "#20c4e6";
                }
                else {
                    ebi_restriccionDifusionDiaSemanaDomingo.children[0].children[0].style.color = "";
                    ebi_restriccionDifusionDiaSemanaDomingo.children[0].children[0].style.background = "";
                }
                break;
        }
    }

    funciones_difusion_cambiarDifundirSoloImagen(){
        this.promocion.difusion.encabezado = "";
        this.promocion.difusion.piePagina = "";
    }

    funciones_difusion_declararFuncionCambioImagen(e2: any){ 
        //document.getElementById("archivoImagenPromocion").onchange () {
        let reader = new FileReader();
        let tipo = [];

        reader.onload = (e: any) => {
            var image = new Image();
            image.src = e.target.result;
            tipo = image.src.split(";");

            if (tipo[0].toLowerCase().indexOf("png") != -1 || tipo[0].toLowerCase().indexOf("jpg") != -1 || tipo[0].toLowerCase().indexOf("jpeg") != -1) {
                let ebi_archivoImagenPromocion: any = document.getElementById("archivoImagenPromocion");
                if ((ebi_archivoImagenPromocion.files[0].size / 1024) < 3072) {
                    $("#contenedorImagenPromocion").css("display", "flex");
                    $("#botonImagenPromocion").css("display", "none");

                    setTimeout(() => { 
                        this.promocion.difusion.imagenSrc = image.src;
                        let ebi_imagenPromocion: any = document.getElementById("imagenPromocion");
                        ebi_imagenPromocion.src = this.promocion.difusion.imagenSrc;
                        $("#botonImagenPromocion").removeClass("errorCampo2");
                    }, 10);
                }
                else{
                    $("#botonImagenPromocion").addClass("errorCampo2");
                    $("#botonImagenPromocion").css("display", "flex");
                    $("#contenedorImagenPromocion").css("display", "none");

                    this.promocion.difusion.imagenSrc = "";
                    let ebi_imagenPromocion: any = document.getElementById("imagenPromocion");
                    let ebi_archivoImagenPromocion: any = document.getElementById("archivoImagenPromocion");
                    ebi_imagenPromocion.src = "src"
                    ebi_archivoImagenPromocion.value = "";
                }
            } 
            else {
                setTimeout(() => { 
                    $("#botonImagenPromocion").css("display", "flex");
                    $("#contenedorImagenPromocion").css("display", "none");

                    this.promocion.difusion.imagenSrc = "";
                    let ebi_imagenPromocion: any = document.getElementById("imagenPromocion");
                    let ebi_archivoImagenPromocion: any = document.getElementById("archivoImagenPromocion");
                    ebi_imagenPromocion.src = "src"
                    ebi_archivoImagenPromocion.value = "";
                }, 10);
            }
        };
        if(e2 != undefined){
            reader.readAsDataURL(e2.target.files[0]);
        }
    }

    funciones_difusion_borrarImagen () {
        $("#botonImagenPromocion").css("display", "flex");
        $("#contenedorImagenPromocion").css("display", "none");

        this.promocion.difusion.imagenSrc = "";
        let ebi_imagenPromocion: any = document.getElementById("imagenPromocion");
        let ebi_archivoImagenPromocion: any = document.getElementById("archivoImagenPromocion");
        ebi_imagenPromocion.src = "src"
        ebi_archivoImagenPromocion.value = "";
    }

    // Funciones de creación y edición
    funciones_acciones_validarDatos(){
        var valida = true;
        // Validaciones de los datos Generales
        if(!this.promocion.nombre){
            valida = false;
            $("#inputNombrePromocion").addClass("errorCampo");
        }
        else{
            $("#inputNombrePromocion").removeClass("errorCampo");
        }

        if(!this.promocion.idPromocionSucursalNuevaTipo){
            valida = false;
            $("#ddlTipoPromocion > div:first-child").attr("style", "outline: red solid 1px !important");
        }
        else{
            $("#ddlTipoPromocion > div:first-child").attr("style", "outline: none");
        }
        if(this.promocion.idPromocionSucursalNuevaTipo != 3){
            if(this.promocion.aplicacionPorCodigo){
                if(!this.promocion.codigo){
                    valida = false;
                    $("#inputCodigoPromocion").addClass("errorCampo");
                }
                else{
                    $("#inputCodigoPromocion").removeClass("errorCampo");
                }
            }
        }

        if(this.promocion.usoLimitado){
            if(!this.promocion.cantidadUsos){
                valida = false;
                $("#inputCantidadUsosPromocion").addClass("errorCampo");
            }
            else{
                $("#inputCantidadUsosPromocion").removeClass("errorCampo");
            }
        }

        // ** No hay validaciones para el apartado de clientes objetivo(segmentacion de clientes) **
        // Validaciones de Vigencia
        if(!this.promocion.vigencia.idPromocionSucursalNuevaVigenciaTipo){
            valida = false;
            $("#ddlTipoVigencia > div:first-child").attr("style", "outline: red solid 1px !important");
        }
        else{
            $("#ddlTipoVigencia > div:first-child").attr("style", "outline: none");
        }

        if(this.promocion.vigencia.idPromocionSucursalNuevaVigenciaTipo == 1){
            if(!this.promocion.vigencia.fechaVigencia){
                valida = false;
                // Pintar de rojo el input de fecha
            }
            else{
                // Quitar el rojo del input de fecha
            }
        }

        if(this.promocion.vigencia.idPromocionSucursalNuevaVigenciaTipo == 2){
            if(!this.promocion.vigencia.idPromocionSucursalNuevaVigenciaTipoCumpleaniosRango){
                valida = false;
                $("#ddlRangoVigenciaCumpleanios > div:first-child").attr("style", "outline: red solid 1px !important");
            }
            else{
                $("#ddlRangoVigenciaCumpleanios > div:first-child").attr("style", "outline: none");
            }
        }

        if(this.promocion.vigencia.restriccionDiasSemana){
            if(!this.promocion.vigencia.lunes && !this.promocion.vigencia.martes && !this.promocion.vigencia.miercoles && !this.promocion.vigencia.jueves && !this.promocion.vigencia.viernes && !this.promocion.vigencia.sabado && !this.promocion.vigencia.domingo){
                valida = false;
                $("#vigenciaRestriccionDiasSemana").addClass("errorCampo");
            }
            else{
                $("#vigenciaRestriccionDiasSemana").removeClass("errorCampo");
            }
        }

        // Validaciones de Aplicación Promoción General
        if(this.promocion.idPromocionSucursalNuevaTipo == 1){

            if(!this.promocion.aplicacion.promocionGeneral.requisitos.servicios.todosServicios && 
                this.promocion.aplicacion.promocionGeneral.requisitos.servicios.servicios.length == 0 &&
                !this.promocion.aplicacion.promocionGeneral.requisitos.productos.todosProductos &&
                this.promocion.aplicacion.promocionGeneral.requisitos.productos.productos.length == 0){

                valida = false;
                $("#ddlAplicacionPromocionGeneralRequisitosServicios > div:first-child").attr("style", "outline: red solid 1px !important");
                $("#ddlAplicacionPromocionGeneralRequisitosProductos > div:first-child").attr("style", "outline: red solid 1px !important");
            }
            else{
                $("#ddlAplicacionPromocionGeneralRequisitosServicios > div:first-child").attr("style", "outline: none");
                $("#ddlAplicacionPromocionGeneralRequisitosProductos > div:first-child").attr("style", "outline: none");
            }

            if(this.promocion.aplicacion.promocionGeneral.requisitos.servicios.todosServicios || this.promocion.aplicacion.promocionGeneral.requisitos.servicios.servicios.length != 0){
                if(!this.promocion.aplicacion.promocionGeneral.valor.servicios.tipoDescuento){
                    valida = false;
                    $("#ddlAplicacionPromocionGeneralValorServiciosTipoDescuento > div:first-child").attr("style", "outline: red solid 1px !important");
                }
                else{
                    $("#ddlAplicacionPromocionGeneralValorServiciosTipoDescuento > div:first-child").attr("style", "outline: none");
                }

                if(!this.promocion.aplicacion.promocionGeneral.valor.servicios.descuento){
                    valida = false;
                    $("#ddlAplicacionPromocionGeneralValorServiciosDescuento > div:first-child").attr("style", "outline: red solid 1px !important");
                }
                else{
                    $("#ddlAplicacionPromocionGeneralValorServiciosDescuento > div:first-child").attr("style", "outline: none");
                }
            }

            if(this.promocion.aplicacion.promocionGeneral.requisitos.productos.todosProductos || this.promocion.aplicacion.promocionGeneral.requisitos.productos.productos.length != 0){
                if(!this.promocion.aplicacion.promocionGeneral.valor.productos.tipoDescuento){
                    valida = false;
                    $("#ddlAplicacionPromocionGeneralValorProductosTipoDescuento > div:first-child").attr("style", "outline: red solid 1px !important");
                }
                else{
                    $("#ddlAplicacionPromocionGeneralValorProductosTipoDescuento > div:first-child").attr("style", "outline: none");
                }

                if(!this.promocion.aplicacion.promocionGeneral.valor.productos.descuento){
                    valida = false;
                    $("#ddlAplicacionPromocionGeneralValorProductosDescuento > div:first-child").attr("style", "outline: red solid 1px !important");
                }
                else{
                    $("#ddlAplicacionPromocionGeneralValorProductosDescuento > div:first-child").attr("style", "outline: none");
                }
            }
        }

        // Validaciones de Aplicación Promoción Combos
        if(this.promocion.idPromocionSucursalNuevaTipo == 2){

            if(this.promocion.aplicacion.combos.requisitos.servicios.servicios.length == 0 && this.promocion.aplicacion.combos.requisitos.productos.productos.length == 0){
                valida = false;
                $("#ddlAplicacionPromocionCombosRequisitosServicios > div:first-child").attr("style", "outline: red solid 1px !important");
                $("#ddlAplicacionPromocionCombosRequisitosProductos > div:first-child").attr("style", "outline: red solid 1px !important");
                $("#inputAplicacionPromocionCombosRequisitosServiciosCantidades").addClass("errorCampo");
                $("#inputAplicacionPromocionCombosRequisitosProductosCantidades").addClass("errorCampo");
            }
            else{
                $("#ddlAplicacionPromocionCombosRequisitosServicios > div:first-child").attr("style", "outline: none");
                $("#ddlAplicacionPromocionCombosRequisitosProductos > div:first-child").attr("style", "outline: none");
                $("#inputAplicacionPromocionCombosRequisitosServiciosCantidades").removeClass("errorCampo");
                $("#inputAplicacionPromocionCombosRequisitosProductosCantidades").removeClass("errorCampo");

                if(this.promocion.aplicacion.combos.requisitos.servicios.servicios.length != this.promocion.aplicacion.combos.requisitos.servicios.cantidades.length){
                    valida = false;
                    $("#inputAplicacionPromocionCombosRequisitosServiciosCantidades").addClass("errorCampo");
                }
                else{
                    $("#inputAplicacionPromocionCombosRequisitosServiciosCantidades").removeClass("errorCampo");
                }

                if(this.promocion.aplicacion.combos.requisitos.productos.productos.length != this.promocion.aplicacion.combos.requisitos.productos.cantidades.length){
                    valida = false;
                    $("#inputAplicacionPromocionCombosRequisitosProductosCantidades").addClass("errorCampo");
                }
                else{
                    $("#inputAplicacionPromocionCombosRequisitosProductosCantidades").removeClass("errorCampo");
                }
            }

            if(!this.promocion.aplicacion.combos.valor.valorCombo){
                valida = false;
                $("#inputAplicacionPromocionCombosValorValorCombo").addClass("errorCampo");
            }
            else{
                $("#inputAplicacionPromocionCombosValorValorCombo").removeClass("errorCampo");
            }
        }

        // Validaciones de Aplicación Promoción Numero Visita/Consumo
        if(this.promocion.idPromocionSucursalNuevaTipo == 3){

            if(!this.promocion.aplicacion.numeroVisitaConsumo.requisitos.tipo){
                valida = false;
                $("#ddlAplicacionPromocionVisitaConsumoRequisitosTipoAplicación > div:first-child").attr("style", "outline: red solid 1px !important");
            }
            else{
                $("#ddlAplicacionPromocionVisitaConsumoRequisitosTipoAplicación > div:first-child").attr("style", "outline: none");
            }

            if(!this.promocion.aplicacion.numeroVisitaConsumo.requisitos.numeroVisitaConsumo){
                valida = false;
                $("#inputAplicacionPromocionVisitaConsumoRequisitosCantidadVisitaConsumo").addClass("errorCampo");
            }
            else{
                $("#inputAplicacionPromocionVisitaConsumoRequisitosCantidadVisitaConsumo").removeClass("errorCampo");
            }

            if(this.promocion.aplicacion.numeroVisitaConsumo.requisitos.servicios.length == 0 && this.promocion.aplicacion.numeroVisitaConsumo.requisitos.productos.length == 0){
                valida = false;
                $("#ddlAplicacionPromocionVisitaConsumoRequisitosServicios > div:first-child").attr("style", "outline: red solid 1px !important");
                $("#ddlAplicacionPromocionVisitaConsumoRequisitosProductos > div:first-child").attr("style", "outline: red solid 1px !important");
            }
            else{
                $("#ddlAplicacionPromocionVisitaConsumoRequisitosServicios > div:first-child").attr("style", "outline: none");
                $("#ddlAplicacionPromocionVisitaConsumoRequisitosProductos > div:first-child").attr("style", "outline: none");
            }

            if(this.promocion.aplicacion.numeroVisitaConsumo.valor.servicios.length == 0 && this.promocion.aplicacion.numeroVisitaConsumo.valor.productos.length == 0){
                valida = false;

                this.promocion.aplicacion.numeroVisitaConsumo.valor.servicios = [{servicio: "", descuento: "100"}];
                this.promocion.aplicacion.numeroVisitaConsumo.valor.productos = [{producto: "", descuento: "100"}];

                setTimeout(() => { 
                    $("#ddlAplicacionPromocionVisitaConsumoValorServicio0 > div:first-child").attr("style", "outline: red solid 1px !important");
                    $("#ddlAplicacionPromocionVisitaConsumoValorProducto0 > div:first-child").attr("style", "outline: red solid 1px !important");
                    $("#inputAplicacionPromocionVisitaConsumoValorServicioDescuento0").addClass("errorCampo");
                    $("#inputAplicacionPromocionVisitaConsumoValorProductoDescuento0").addClass("errorCampo");
                }, 100);
            }
            else{
                for(var i = 0; i < this.promocion.aplicacion.numeroVisitaConsumo.valor.servicios.length; i++){
                    if(!this.promocion.aplicacion.numeroVisitaConsumo.valor.servicios[i].servicio){
                        valida = false;
                        $("#ddlAplicacionPromocionVisitaConsumoValorServicio" + i +" > div:first-child").attr("style", "outline: red solid 1px !important");
                    }
                    else{
                        $("#ddlAplicacionPromocionVisitaConsumoValorServicio" + i +" > div:first-child").attr("style", "outline: none");
                    }

                    if(!this.promocion.aplicacion.numeroVisitaConsumo.valor.servicios[i].descuento){
                        valida = false;
                        $("#inputAplicacionPromocionVisitaConsumoValorServicioDescuento" + i).addClass("errorCampo");
                    }
                    else{
                        $("#inputAplicacionPromocionVisitaConsumoValorServicioDescuento" + i).removeClass("errorCampo");
                    }
                }

                for(var i = 0; i < this.promocion.aplicacion.numeroVisitaConsumo.valor.productos.length; i++){

                    if(!this.promocion.aplicacion.numeroVisitaConsumo.valor.productos[i].producto){
                        valida = false;
                        $("#ddlAplicacionPromocionVisitaConsumoValorProducto" + i +" > div:first-child").attr("style", "outline: red solid 1px !important");
                    }
                    else{
                        $("#ddlAplicacionPromocionVisitaConsumoValorProducto" + i +" > div:first-child").attr("style", "outline: none");
                    }

                    if(!this.promocion.aplicacion.numeroVisitaConsumo.valor.productos[i].descuento){
                        valida = false;
                        $("#inputAplicacionPromocionVisitaConsumoValorProductoDescuento" + i).addClass("errorCampo");
                    }
                    else{
                        $("#inputAplicacionPromocionVisitaConsumoValorProductoDescuento" + i).removeClass("errorCampo");
                    }
                }
            }
        }

        // Validaciones de Difusión (Envío)
        if(this.promocion.difusion.difusionPromocion){
            if(!this.promocion.difusion.idPromocionSucursalNuevaDifusionTipo){
                $("#ddlTipoDifusion > div:first-child").attr("style", "outline: red solid 1px !important");
                valida = false;
            }
            else{
                $("#ddlTipoDifusion > div:first-child").attr("style", "outline: none");
            }

            if(this.promocion.difusion.idPromocionSucursalNuevaDifusionTipo == 2 || this.promocion.difusion.idPromocionSucursalNuevaDifusionTipo == 3){
                if(this.promocion.vigencia.idPromocionSucursalNuevaVigenciaTipo == 1){
                    if(!this.promocion.difusion.fechaInicio){
                        $("#inputFechaInicioDifusion").addClass("errorCampo");
                        valida = false;
                    }
                    else{
                        $("#inputFechaInicioDifusion").removeClass("errorCampo");
                    }
                
                    if(!this.promocion.difusion.idPromocionSucursalNuevaDifusionTipoPosteriorPeriodo){
                        $("#ddlPeriodoDifusionPosterior > div:first-child").attr("style", "outline: red solid 1px !important");
                        valida = false;
                    }
                    else{
                        $("#ddlPeriodoDifusionPosterior > div:first-child").attr("style", "outline: none");
                    }

                    if(this.promocion.difusion.idPromocionSucursalNuevaDifusionTipoPosteriorPeriodo == 2){
                        if(this.promocion.difusion.difusionPosteriorPeriodo.restriccionDiasMes.length == 0){
                            $("#difusionRestriccionDiasMesCalendario").addClass("errorCampo");
                            valida = false;
                        }
                        else{
                            $("#difusionRestriccionDiasMesCalendario").removeClass("errorCampo");
                        }
                    }

                    if(this.promocion.difusion.idPromocionSucursalNuevaDifusionTipoPosteriorPeriodo == 3){
                        if(!this.promocion.difusion.difusionPosteriorPeriodo.restriccionLunes && !this.promocion.difusion.difusionPosteriorPeriodo.restriccionMartes
                        && !this.promocion.difusion.difusionPosteriorPeriodo.restriccionMiercoles && !this.promocion.difusion.difusionPosteriorPeriodo.restriccionJueves
                        && !this.promocion.difusion.difusionPosteriorPeriodo.restriccionViernes && !this.promocion.difusion.difusionPosteriorPeriodo.restriccionSabado
                        && !this.promocion.difusion.difusionPosteriorPeriodo.restriccionDomingo){
                            $("#difusionRestriccionDiasDeSemana").addClass("errorCampo");
                            valida = false;
                        }
                        else{
                            $("#difusionRestriccionDiasDeSemana").removeClass("errorCampo");
                        }
                    }
                }
            }

            if(!this.promocion.difusion.idPromocionSucursalNuevaDifusionMedio){
                $("#ddlDifusionMedio > div:first-child").attr("style", "outline: red solid 1px !important");
                valida = false;
            }
            else{
                $("#ddlDifusionMedio > div:first-child").attr("style", "outline: none");
            }

            if(!this.promocion.difusion.difundirSoloImagen){
                if(!this.promocion.difusion.encabezado && !this.promocion.difusion.piePagina){
                    $("#textAreaEncabezadoDifusion").addClass("errorCampo");
                    $("#textAreaPiePaginaDifusion").addClass("errorCampo");
                    valida = false;
                }
                else{
                    $("#textAreaEncabezadoDifusion").removeClass("errorCampo");
                    $("#textAreaPiePaginaDifusion").removeClass("errorCampo");
                }
            }

            if(!this.promocion.difusion.imagenSrc){
                $("#botonImagenPromocion").addClass("errorCampo2");
                valida = false;
            }
            else{
                $("#botonImagenPromocion").removeClass("errorCampo2");
            }
        }

        return valida;
    }

    funciones_acciones_crearPromocion(){
        this._pantallaServicio.mostrarSpinner();
        var valida = this.funciones_acciones_validarDatos();

        if(valida){
            // var fechaVigenciaSplit = this.promocion.vigencia.fechaVigencia.split(" - ");
            var fechaVigenciaSplit = [this.promocion.vigencia.fechaVigencia.startDate, this.promocion.vigencia.fechaVigencia.endDate];

            var params: any = {};
            // Datos Generales
            params.datosGenerales = {};
            params.datosGenerales.promocionNombre = this.promocion.nombre;
            params.datosGenerales.idPromocionSucursalNuevaTipo = this.promocion.idPromocionSucursalNuevaTipo;
            params.datosGenerales.promocionAplicacionPorCodigo = this.promocion.aplicacionPorCodigo ? 1 : 0;
            params.datosGenerales.promocionCodigo = this.promocion.codigo ? this.promocion.codigo : null;
            params.datosGenerales.promocionUsoLimitado = this.promocion.usoLimitado ? 1 : 0;
            params.datosGenerales.promocionCantidadUsos = this.promocion.cantidadUsos ? this.promocion.cantidadUsos : null;
            params.datosGenerales.promocionActiva = this.promocion.activa ? 1 : 0;

            // Cliente Objetivo
            params.clienteObjetivo = {};
            params.clienteObjetivo.todosClientes = this.promocion.clienteObjetivo.todosClientes? 1 : 0;
            params.clienteObjetivo.idClienteEstadoActividad = this.promocion.clienteObjetivo.idClienteEstadoActividad ? this.promocion.clienteObjetivo.idClienteEstadoActividad : null;
            params.clienteObjetivo.idClienteSexo = this.promocion.clienteObjetivo.idClienteSexo ? this.promocion.clienteObjetivo.idClienteSexo : null;
            params.clienteObjetivo.idClienteEdadRango = this.promocion.clienteObjetivo.idClienteEdadRango ? this.promocion.clienteObjetivo.idClienteEdadRango : null;
            params.clienteObjetivo.esVip = this.promocion.clienteObjetivo.esVip ? 1 : 0 ;

            // Vigencia
            params.vigencia = {};
            params.vigencia.idPromocionSucursalNuevaVigenciaTipo = this.promocion.vigencia.idPromocionSucursalNuevaVigenciaTipo;
            params.vigencia.idPromocionSucursalNuevaVigenciaTipoCumpleaniosRango = this.promocion.vigencia.idPromocionSucursalNuevaVigenciaTipoCumpleaniosRango;

            params.vigencia.fechaInicio = (moment(JSON.parse(JSON.stringify(fechaVigenciaSplit[0])), 'DD/MM/YYYY').startOf('day')).format('YYYY-MM-DD HH:mm:ss');
            params.vigencia.fechaFin = (moment(JSON.parse(JSON.stringify(fechaVigenciaSplit[1])), 'DD/MM/YYYY').endOf('day')).format('YYYY-MM-DD HH:mm:ss');
            
            if(params.vigencia.fechaInicio == "Invalid date" || params.vigencia.fechaFin == "Invalid date"){
                params.vigencia.fechaInicio = moment(new Date( fechaVigenciaSplit[0]['$y'], fechaVigenciaSplit[0]['$M'], fechaVigenciaSplit[0]['$D'] )).startOf('day').format('YYYY-MM-DD HH:mm:ss');
                params.vigencia.fechaFin = moment(new Date( fechaVigenciaSplit[1]['$y'], fechaVigenciaSplit[1]['$M'], fechaVigenciaSplit[1]['$D'] )).endOf('day').format('YYYY-MM-DD HH:mm:ss');
            }

            params.vigencia.restriccionHorario = this.promocion.vigencia.restriccionHorario ? 1 : 0 ;
            params.vigencia.restriccionHorarioInicio = this.promocion.vigencia.restriccionHorarioInicio;
            params.vigencia.restriccionHorarioFin = this.promocion.vigencia.restriccionHorarioFin;
            params.vigencia.restriccionDiasSemana = this.promocion.vigencia.restriccionDiasSemana ? 1 : 0 ;
            params.vigencia.lunes = this.promocion.vigencia.lunes;
            params.vigencia.martes = this.promocion.vigencia.martes;
            params.vigencia.miercoles = this.promocion.vigencia.miercoles;
            params.vigencia.jueves = this.promocion.vigencia.jueves;
            params.vigencia.viernes = this.promocion.vigencia.viernes;
            params.vigencia.sabado = this.promocion.vigencia.sabado;
            params.vigencia.domingo = this.promocion.vigencia.domingo;  

            // Aplicación Promoción General
            params.aplicacionPromocionGeneralRequisitosTodosServicios = this.promocion.aplicacion.promocionGeneral.requisitos.servicios.todosServicios == 1 ? "true" : "false";
            params.aplicacionPromocionGeneralRequisitosServicios = this.promocion.aplicacion.promocionGeneral.requisitos.servicios.servicios;
            params.aplicacionPromocionGeneralRequisitosTodosProductos = this.promocion.aplicacion.promocionGeneral.requisitos.productos.todosProductos == 1 ? "true" : "false";
            params.aplicacionPromocionGeneralRequisitosProductos = this.promocion.aplicacion.promocionGeneral.requisitos.productos.productos;
            params.aplicacionPromocionGeneralValorServiciosTipoDescuento = this.promocion.aplicacion.promocionGeneral.valor.servicios.tipoDescuento;
            params.aplicacionPromocionGeneralValorServiciosDescuento = this.promocion.aplicacion.promocionGeneral.valor.servicios.descuento;
            params.aplicacionPromocionGeneralValorProductosTipoDescuento = this.promocion.aplicacion.promocionGeneral.valor.productos.tipoDescuento;
            params.aplicacionPromocionGeneralValorProductosDescuento = this.promocion.aplicacion.promocionGeneral.valor.productos.descuento;

            // Aplicación Promoción Combos
            params.aplicacionPromocionComboRequisitosServicios = this.promocion.aplicacion.combos.requisitos.servicios.servicios;
            params.aplicacionPromocionComboRequisitosServiciosCantidades = [];
            for(var i = 0; i < this.promocion.aplicacion.combos.requisitos.servicios.cantidades.length; i++){
                params.aplicacionPromocionComboRequisitosServiciosCantidades.push(this.promocion.aplicacion.combos.requisitos.servicios.cantidades[i].text);
            }
            params.aplicacionPromocionComboRequisitosProductos = this.promocion.aplicacion.combos.requisitos.productos.productos;
            params.aplicacionPromocionComboRequisitosProductosCantidades = [];
            for(var i = 0; i < this.promocion.aplicacion.combos.requisitos.productos.cantidades.length; i++){
                params.aplicacionPromocionComboRequisitosProductosCantidades.push(this.promocion.aplicacion.combos.requisitos.productos.cantidades[i].text);
            }
            params.aplicacionPromocionComboValorCombo = this.promocion.aplicacion.combos.valor.valorCombo;

            // Aplicación Promoción Visita/Consumo
            params.aplicacionPromocionNumeroVisitaConsumoRequisitosTipo = this.promocion.aplicacion.numeroVisitaConsumo.requisitos.tipo;
            params.aplicacionPromocionNumeroVisitaConsumoRequisitosNumeroVisitaConsumo = this.promocion.aplicacion.numeroVisitaConsumo.requisitos.numeroVisitaConsumo;
            params.aplicacionPromocionNumeroVisitaConsumoRequisitosServicios = this.promocion.aplicacion.numeroVisitaConsumo.requisitos.servicios;
            params.aplicacionPromocionNumeroVisitaConsumoRequisitosProductos = this.promocion.aplicacion.numeroVisitaConsumo.requisitos.productos;
            params.aplicacionPromocionNumeroVisitaConsumoValorServicios = this.promocion.aplicacion.numeroVisitaConsumo.valor.servicios;
            params.aplicacionPromocionNumeroVisitaConsumoValorProductos = this.promocion.aplicacion.numeroVisitaConsumo.valor.productos;
            
            // Datos de Difusión
            params.difusion = {};
            params.difusion.difusionPromocion = this.promocion.difusion.difusionPromocion;
            params.difusion.idPromocionSucursalNuevaDifusionTipo = this.promocion.difusion.idPromocionSucursalNuevaDifusionTipo;
            params.difusion.fechaInicio = this.promocion.difusion.fechaInicio;
            params.difusion.idPromocionSucursalNuevaDifusionTipoPosteriorPeriodo = this.promocion.difusion.idPromocionSucursalNuevaDifusionTipoPosteriorPeriodo;
            params.difusion.difusionPosteriorAutomatica = this.promocion.difusion.difusionPosteriorAutomatica;
            params.difusion.idPromocionSucursalNuevaDifusionTipoPosteriorAutorizacionTipo = this.promocion.difusion.idPromocionSucursalNuevaDifusionTipoPosteriorAutorizacionTipo;
            params.difusion.idPromocionSucursalNuevaDifusionMedio = this.promocion.difusion.idPromocionSucursalNuevaDifusionMedio;
            params.difusion.direccionImagen = this.promocion.difusion.direccionImagen;
            params.difusion.difundirSoloImagen = this.promocion.difusion.difundirSoloImagen ? 1 : 0;
            params.difusion.encabezado = this.promocion.difusion.encabezado;
            params.difusion.piePagina = this.promocion.difusion.piePagina;
            params.difusionRestriccionDiasMes = this.promocion.difusion.difusionPosteriorPeriodo.restriccionDiasMes;
            params.difusionRestriccionDiasSemana = {};
            params.difusionRestriccionDiasSemana.lunes = this.promocion.difusion.difusionPosteriorPeriodo.restriccionLunes;
            params.difusionRestriccionDiasSemana.martes = this.promocion.difusion.difusionPosteriorPeriodo.restriccionMartes;
            params.difusionRestriccionDiasSemana.miercoles = this.promocion.difusion.difusionPosteriorPeriodo.restriccionMiercoles;
            params.difusionRestriccionDiasSemana.jueves = this.promocion.difusion.difusionPosteriorPeriodo.restriccionJueves;
            params.difusionRestriccionDiasSemana.viernes = this.promocion.difusion.difusionPosteriorPeriodo.restriccionViernes;
            params.difusionRestriccionDiasSemana.sabado = this.promocion.difusion.difusionPosteriorPeriodo.restriccionSabado;
            params.difusionRestriccionDiasSemana.domingo = this.promocion.difusion.difusionPosteriorPeriodo.restriccionDomingo;

            if(this.promocion.difusion.imagenSrc != ""){
                params.imagenSrc = this.promocion.difusion.imagenSrc.split(',')[1];
            }
            else{
                params.imagenSrc = "";
            }
            
            this._backService.HttpPost("catalogos/promocion/crearPromocion", {}, params).subscribe((response: string) => {
                switch (response) {
                    case "-1":
                        this._toaster.error("Ya hay una Promoción con ese nombre");
                        this._pantallaServicio.ocultarSpinner();
                        break;

                    case "-2":
                        this._toaster.error("Ya hay una Promoción con ese código");
                        this._pantallaServicio.ocultarSpinner();
                        break;

                    default:
                        if(this.promocion.difusion.idPromocionSucursalNuevaDifusionTipo == 1 || this.promocion.difusion.idPromocionSucursalNuevaDifusionTipo == 3){
                            this.funciones_acciones_enviarCorreos(response);
                        }
                        else{
                            this._pantallaServicio.ocultarSpinner();
                            this._router.navigate(['/catalogos/promociones']);
                        }
                        break;
                }
            }, 
            (error) => {
                this._pantallaServicio.ocultarSpinner();
                if (error == 'SinSesion' || error == 'SesionCaducada') {
                    if (error == 'SinSesion') {
                    this._toaster.error(this.sessionTraslate.favorIniciarSesion);
                    }
                    if (error == 'SesionCaducada') {
                    this._toaster.error(this.sessionTraslate.sesionCaducada);
                    }
                    this._router.navigate(['/login']);
                    return;
                }
                this._toaster.error(this.sessionTraslate.errorEliminar);
            });
        }
        else{
            this._pantallaServicio.ocultarSpinner();
        }
    }

    actualizarBandera(){
        this.contadorEntradas++;
    }
    
    funciones_acciones_editarPromocion(){
        this._pantallaServicio.mostrarSpinner();
        var valida = this.funciones_acciones_validarDatos();

        if(valida){
            //var fechaVigenciaSplit = this.promocion.vigencia.fechaVigencia.split(" - ");
            var fechaVigenciaSplit = [this.promocion.vigencia.fechaVigencia.startDate, this.promocion.vigencia.fechaVigencia.endDate];

            var params: any = {};
            // Datos Generales 
            params.datosGenerales = {};
            params.datosGenerales.idPromocionSucursalNueva = this.promocion.idPromocionSucursalNueva;
            params.datosGenerales.promocionNombre = this.promocion.nombre;
            params.datosGenerales.idPromocionSucursalNuevaTipo = this.promocion.idPromocionSucursalNuevaTipo;
            params.datosGenerales.promocionAplicacionPorCodigo = this.promocion.aplicacionPorCodigo ? 1 : 0;
            params.datosGenerales.promocionCodigo = this.promocion.codigo ? this.promocion.codigo : null;
            params.datosGenerales.promocionUsoLimitado = this.promocion.usoLimitado ? 1 : 0;
            params.datosGenerales.promocionCantidadUsos = this.promocion.cantidadUsos ? this.promocion.cantidadUsos : null;
            params.datosGenerales.promocionActiva = this.promocion.activa ? 1 : 0;

            // Cliente Objetivo
            params.clienteObjetivo = {};
            params.clienteObjetivo.todosClientes = this.promocion.clienteObjetivo.todosClientes? 1 : 0;
            params.clienteObjetivo.idClienteEstadoActividad = this.promocion.clienteObjetivo.idClienteEstadoActividad ? this.promocion.clienteObjetivo.idClienteEstadoActividad : null;
            params.clienteObjetivo.idClienteSexo = this.promocion.clienteObjetivo.idClienteSexo ? this.promocion.clienteObjetivo.idClienteSexo : null;
            params.clienteObjetivo.idClienteEdadRango = this.promocion.clienteObjetivo.idClienteEdadRango ? this.promocion.clienteObjetivo.idClienteEdadRango : null;
            params.clienteObjetivo.esVip = this.promocion.clienteObjetivo.esVip ? 1 : 0 ;

            // Vigencia
            params.vigencia = {};
            params.vigencia.idPromocionSucursalNuevaVigenciaTipo = this.promocion.vigencia.idPromocionSucursalNuevaVigenciaTipo;
            params.vigencia.idPromocionSucursalNuevaVigenciaTipoCumpleaniosRango = this.promocion.vigencia.idPromocionSucursalNuevaVigenciaTipoCumpleaniosRango;

            params.vigencia.fechaInicio = (moment(JSON.parse(JSON.stringify(fechaVigenciaSplit[0])), 'DD/MM/YYYY').startOf('day')).format('YYYY-MM-DD HH:mm:ss');
            params.vigencia.fechaFin = (moment(JSON.parse(JSON.stringify(fechaVigenciaSplit[1])), 'DD/MM/YYYY').endOf('day')).format('YYYY-MM-DD HH:mm:ss');
            
            if(params.vigencia.fechaInicio == "Invalid date" || params.vigencia.fechaFin == "Invalid date"){
                params.vigencia.fechaInicio = format(new Date( fechaVigenciaSplit[0]['$y'] + "-" + (fechaVigenciaSplit[0]['$M'] + 1) + "-" + fechaVigenciaSplit[0]['$D'] ), 'yyyy-MM-dd' )
                params.vigencia.fechaFin = format(new Date( fechaVigenciaSplit[1]['$y'] + "-" + (fechaVigenciaSplit[1]['$M'] + 1) + "-" + fechaVigenciaSplit[1]['$D'] ), 'yyyy-MM-dd' )
            }
            
            params.vigencia.restriccionHorario = this.promocion.vigencia.restriccionHorario ? 1 : 0 ;
            params.vigencia.restriccionHorarioInicio = this.promocion.vigencia.restriccionHorarioInicio;
            params.vigencia.restriccionHorarioFin = this.promocion.vigencia.restriccionHorarioFin;
            params.vigencia.restriccionDiasSemana = this.promocion.vigencia.restriccionDiasSemana ? 1 : 0 ;
            params.vigencia.lunes = this.promocion.vigencia.lunes;
            params.vigencia.martes = this.promocion.vigencia.martes;
            params.vigencia.miercoles = this.promocion.vigencia.miercoles;
            params.vigencia.jueves = this.promocion.vigencia.jueves;
            params.vigencia.viernes = this.promocion.vigencia.viernes;
            params.vigencia.sabado = this.promocion.vigencia.sabado;
            params.vigencia.domingo = this.promocion.vigencia.domingo;  

            // Aplicación Promoción General
            params.aplicacionPromocionGeneralRequisitosTodosServicios = this.promocion.aplicacion.promocionGeneral.requisitos.servicios.todosServicios == 1 ? "true" : "false";
            params.aplicacionPromocionGeneralRequisitosServicios = this.promocion.aplicacion.promocionGeneral.requisitos.servicios.servicios;
            params.aplicacionPromocionGeneralRequisitosTodosProductos = this.promocion.aplicacion.promocionGeneral.requisitos.productos.todosProductos == 1 ? "true" : "false";
            params.aplicacionPromocionGeneralRequisitosProductos = this.promocion.aplicacion.promocionGeneral.requisitos.productos.productos;
            params.aplicacionPromocionGeneralValorServiciosTipoDescuento = this.promocion.aplicacion.promocionGeneral.valor.servicios.tipoDescuento;
            params.aplicacionPromocionGeneralValorServiciosDescuento = this.promocion.aplicacion.promocionGeneral.valor.servicios.descuento;
            params.aplicacionPromocionGeneralValorProductosTipoDescuento = this.promocion.aplicacion.promocionGeneral.valor.productos.tipoDescuento;
            params.aplicacionPromocionGeneralValorProductosDescuento = this.promocion.aplicacion.promocionGeneral.valor.productos.descuento;

            // Aplicación Promoción Combos
            params.aplicacionPromocionComboRequisitosServicios = this.promocion.aplicacion.combos.requisitos.servicios.servicios;
            params.aplicacionPromocionComboRequisitosServiciosCantidades = [];
            for(var i = 0; i < this.promocion.aplicacion.combos.requisitos.servicios.cantidades.length; i++){
                params.aplicacionPromocionComboRequisitosServiciosCantidades.push(this.promocion.aplicacion.combos.requisitos.servicios.cantidades[i].text);
            }
            params.aplicacionPromocionComboRequisitosProductos = this.promocion.aplicacion.combos.requisitos.productos.productos;
            params.aplicacionPromocionComboRequisitosProductosCantidades = [];
            for(var i = 0; i < this.promocion.aplicacion.combos.requisitos.productos.cantidades.length; i++){
                params.aplicacionPromocionComboRequisitosProductosCantidades.push(this.promocion.aplicacion.combos.requisitos.productos.cantidades[i].text);
            }
            params.aplicacionPromocionComboValorCombo = this.promocion.aplicacion.combos.valor.valorCombo;

            // Aplicación Promoción Visita/Consumo
            params.aplicacionPromocionNumeroVisitaConsumoRequisitosTipo = this.promocion.aplicacion.numeroVisitaConsumo.requisitos.tipo;
            params.aplicacionPromocionNumeroVisitaConsumoRequisitosNumeroVisitaConsumo = this.promocion.aplicacion.numeroVisitaConsumo.requisitos.numeroVisitaConsumo;
            params.aplicacionPromocionNumeroVisitaConsumoRequisitosServicios = this.promocion.aplicacion.numeroVisitaConsumo.requisitos.servicios;
            params.aplicacionPromocionNumeroVisitaConsumoRequisitosProductos = this.promocion.aplicacion.numeroVisitaConsumo.requisitos.productos;
            params.aplicacionPromocionNumeroVisitaConsumoValorServicios = this.promocion.aplicacion.numeroVisitaConsumo.valor.servicios;
            params.aplicacionPromocionNumeroVisitaConsumoValorProductos = this.promocion.aplicacion.numeroVisitaConsumo.valor.productos;
            
            // Datos de Difusión
            params.difusion = {};
            params.difusion.difusionPromocion = this.promocion.difusion.difusionPromocion;
            params.difusion.idPromocionSucursalNuevaDifusionTipo = this.promocion.difusion.idPromocionSucursalNuevaDifusionTipo;
            params.difusion.fechaInicio = this.promocion.difusion.fechaInicio;
            params.difusion.idPromocionSucursalNuevaDifusionTipoPosteriorPeriodo = this.promocion.difusion.idPromocionSucursalNuevaDifusionTipoPosteriorPeriodo;
            params.difusion.difusionPosteriorAutomatica = this.promocion.difusion.difusionPosteriorAutomatica;
            params.difusion.idPromocionSucursalNuevaDifusionTipoPosteriorAutorizacionTipo = this.promocion.difusion.idPromocionSucursalNuevaDifusionTipoPosteriorAutorizacionTipo;
            params.difusion.idPromocionSucursalNuevaDifusionMedio = this.promocion.difusion.idPromocionSucursalNuevaDifusionMedio;
            params.difusion.direccionImagen = this.promocion.difusion.direccionImagen;
            params.difusion.difundirSoloImagen = this.promocion.difusion.difundirSoloImagen ? 1 : 0;
            params.difusion.encabezado = this.promocion.difusion.encabezado;
            params.difusion.piePagina = this.promocion.difusion.piePagina;
            params.difusionRestriccionDiasMes = this.promocion.difusion.difusionPosteriorPeriodo.restriccionDiasMes;
            params.difusionRestriccionDiasSemana = {};
            params.difusionRestriccionDiasSemana.lunes = this.promocion.difusion.difusionPosteriorPeriodo.restriccionLunes;
            params.difusionRestriccionDiasSemana.martes = this.promocion.difusion.difusionPosteriorPeriodo.restriccionMartes;
            params.difusionRestriccionDiasSemana.miercoles = this.promocion.difusion.difusionPosteriorPeriodo.restriccionMiercoles;
            params.difusionRestriccionDiasSemana.jueves = this.promocion.difusion.difusionPosteriorPeriodo.restriccionJueves;
            params.difusionRestriccionDiasSemana.viernes = this.promocion.difusion.difusionPosteriorPeriodo.restriccionViernes;
            params.difusionRestriccionDiasSemana.sabado = this.promocion.difusion.difusionPosteriorPeriodo.restriccionSabado;
            params.difusionRestriccionDiasSemana.domingo = this.promocion.difusion.difusionPosteriorPeriodo.restriccionDomingo;

            if(this.promocion.difusion.imagenSrc != ""){
                params.imagenSrc = this.promocion.difusion.imagenSrc.split(',')[1];
            }
            else{
                params.imagenSrc = "";
            }
            
            this._backService.HttpPost("catalogos/promocion/editarPromocion", {}, params).subscribe((response: string) => {
                switch (response) {
                    case "-1":
                        this._toaster.error("Ya hay una Promoción con ese nombre");
                        this._pantallaServicio.ocultarSpinner();
                        break;

                    case "-2":
                        this._toaster.error("Ya hay una Promoción con ese código");
                        this._pantallaServicio.ocultarSpinner();
                        break;

                    default:
                        if(this.promocion.difusion.idPromocionSucursalNuevaDifusionTipo == 1 || this.promocion.difusion.idPromocionSucursalNuevaDifusionTipo == 3){
                            this._pantallaServicio.ocultarSpinner();
                            this.funciones_acciones_abrirModalEnviarCorreos();
                        }
                        else{
                            this._pantallaServicio.ocultarSpinner();
                            this._router.navigate(['/catalogos/promociones']);
                        }
                        break;
                }
            }, 
            (error) => {
                this._pantallaServicio.ocultarSpinner();
                if (error == 'SinSesion' || error == 'SesionCaducada') {
                    if (error == 'SinSesion') {
                    this._toaster.error(this.sessionTraslate.favorIniciarSesion);
                    }
                    if (error == 'SesionCaducada') {
                    this._toaster.error(this.sessionTraslate.sesionCaducada);
                    }
                    this._router.navigate(['/login']);
                    return;
                }
                this._toaster.error(this.sessionTraslate.errorEliminar);
            });
        }
        else{
            this._pantallaServicio.ocultarSpinner();
        }
    }

    funciones_acciones_guardarBorradorPromocion(){
        this._pantallaServicio.mostrarSpinner();
        var valida = this.funciones_acciones_validarDatos();

        if(valida){
            // var fechaVigenciaSplit = this.promocion.vigencia.fechaVigencia.split(" - ");
            var fechaVigenciaSplit = [this.promocion.vigencia.fechaVigencia.startDate, this.promocion.vigencia.fechaVigencia.endDate];

            var params: any = {};
            // Datos Generales
            params.datosGenerales = {};
            if(this.promocion.idPromocionSucursalNueva != "N"){
                params.datosGenerales.idPromocionSucursalNueva = this.promocion.idPromocionSucursalNueva;
            }
            params.datosGenerales.promocionNombre = this.promocion.nombre;
            params.datosGenerales.idPromocionSucursalNuevaTipo = this.promocion.idPromocionSucursalNuevaTipo;
            params.datosGenerales.promocionAplicacionPorCodigo = this.promocion.aplicacionPorCodigo ? 1 : 0 ;
            params.datosGenerales.promocionCodigo = this.promocion.codigo ? this.promocion.codigo : null;
            params.datosGenerales.promocionUsoLimitado = this.promocion.usoLimitado ? 1 : 0;
            params.datosGenerales.promocionCantidadUsos = this.promocion.cantidadUsos ? this.promocion.cantidadUsos : null;
            params.datosGenerales.promocionActiva = this.promocion.activa ? 1 : 0;

            // Cliente Objetivo
            params.clienteObjetivo = {};
            params.clienteObjetivo.todosClientes = this.promocion.clienteObjetivo.todosClientes? 1 : 0;
            params.clienteObjetivo.idClienteEstadoActividad = this.promocion.clienteObjetivo.idClienteEstadoActividad ? this.promocion.clienteObjetivo.idClienteEstadoActividad : null;
            params.clienteObjetivo.idClienteSexo = this.promocion.clienteObjetivo.idClienteSexo ? this.promocion.clienteObjetivo.idClienteSexo : null;
            params.clienteObjetivo.idClienteEdadRango = this.promocion.clienteObjetivo.idClienteEdadRango ? this.promocion.clienteObjetivo.idClienteEdadRango : null;
            params.clienteObjetivo.esVip = this.promocion.clienteObjetivo.esVip ? 1 : 0 ;

            // Vigencia
            params.vigencia = {};
            params.vigencia.idPromocionSucursalNuevaVigenciaTipo = this.promocion.vigencia.idPromocionSucursalNuevaVigenciaTipo;
            params.vigencia.idPromocionSucursalNuevaVigenciaTipoCumpleaniosRango = this.promocion.vigencia.idPromocionSucursalNuevaVigenciaTipoCumpleaniosRango;

            params.vigencia.fechaInicio = (moment(JSON.parse(JSON.stringify(fechaVigenciaSplit[0])), 'DD/MM/YYYY').startOf('day')).format('YYYY-MM-DD HH:mm:ss');
            params.vigencia.fechaFin = (moment(JSON.parse(JSON.stringify(fechaVigenciaSplit[1])), 'DD/MM/YYYY').endOf('day')).format('YYYY-MM-DD HH:mm:ss');

            if(params.vigencia.fechaInicio == "Invalid date" || params.vigencia.fechaFin == "Invalid date"){
                params.vigencia.fechaInicio = format(new Date( fechaVigenciaSplit[0]['$y'] + "-" + (fechaVigenciaSplit[0]['$M'] + 1) + "-" + fechaVigenciaSplit[0]['$D'] ), 'yyyy-MM-dd' )
                params.vigencia.fechaFin = format(new Date( fechaVigenciaSplit[1]['$y'] + "-" + (fechaVigenciaSplit[1]['$M'] + 1) + "-" + fechaVigenciaSplit[1]['$D'] ), 'yyyy-MM-dd' )
            }
            
            params.vigencia.restriccionHorario = this.promocion.vigencia.restriccionHorario ? 1 : 0 ;
            params.vigencia.restriccionHorarioInicio = this.promocion.vigencia.restriccionHorarioInicio;
            params.vigencia.restriccionHorarioFin = this.promocion.vigencia.restriccionHorarioFin;
            params.vigencia.restriccionDiasSemana = this.promocion.vigencia.restriccionDiasSemana ? 1 : 0 ;
            params.vigencia.lunes = this.promocion.vigencia.lunes;
            params.vigencia.martes = this.promocion.vigencia.martes;
            params.vigencia.miercoles = this.promocion.vigencia.miercoles;
            params.vigencia.jueves = this.promocion.vigencia.jueves;
            params.vigencia.viernes = this.promocion.vigencia.viernes;
            params.vigencia.sabado = this.promocion.vigencia.sabado;
            params.vigencia.domingo = this.promocion.vigencia.domingo;  

            // Aplicación Promoción General
            params.aplicacionPromocionGeneralRequisitosTodosServicios = this.promocion.aplicacion.promocionGeneral.requisitos.servicios.todosServicios == 1 ? "true" : "false";
            params.aplicacionPromocionGeneralRequisitosServicios = this.promocion.aplicacion.promocionGeneral.requisitos.servicios.servicios;
            params.aplicacionPromocionGeneralRequisitosTodosProductos = this.promocion.aplicacion.promocionGeneral.requisitos.productos.todosProductos == 1 ? "true" : "false";
            params.aplicacionPromocionGeneralRequisitosProductos = this.promocion.aplicacion.promocionGeneral.requisitos.productos.productos;
            params.aplicacionPromocionGeneralValorServiciosTipoDescuento = this.promocion.aplicacion.promocionGeneral.valor.servicios.tipoDescuento;
            params.aplicacionPromocionGeneralValorServiciosDescuento = this.promocion.aplicacion.promocionGeneral.valor.servicios.descuento;
            params.aplicacionPromocionGeneralValorProductosTipoDescuento = this.promocion.aplicacion.promocionGeneral.valor.productos.tipoDescuento;
            params.aplicacionPromocionGeneralValorProductosDescuento = this.promocion.aplicacion.promocionGeneral.valor.productos.descuento;

            // Aplicación Promoción Combos
            params.aplicacionPromocionComboRequisitosServicios = this.promocion.aplicacion.combos.requisitos.servicios.servicios;
            params.aplicacionPromocionComboRequisitosServiciosCantidades = [];
            for(var i = 0; i < this.promocion.aplicacion.combos.requisitos.servicios.cantidades.length; i++){
                params.aplicacionPromocionComboRequisitosServiciosCantidades.push(this.promocion.aplicacion.combos.requisitos.servicios.cantidades[i].text);
            }
            params.aplicacionPromocionComboRequisitosProductos = this.promocion.aplicacion.combos.requisitos.productos.productos;
            params.aplicacionPromocionComboRequisitosProductosCantidades = [];
            for(var i = 0; i < this.promocion.aplicacion.combos.requisitos.productos.cantidades.length; i++){
                params.aplicacionPromocionComboRequisitosProductosCantidades.push(this.promocion.aplicacion.combos.requisitos.productos.cantidades[i].text);
            }
            params.aplicacionPromocionComboValorCombo = this.promocion.aplicacion.combos.valor.valorCombo;

            // Aplicación Promoción Visita/Consumo
            params.aplicacionPromocionNumeroVisitaConsumoRequisitosTipo = this.promocion.aplicacion.numeroVisitaConsumo.requisitos.tipo;
            params.aplicacionPromocionNumeroVisitaConsumoRequisitosNumeroVisitaConsumo = this.promocion.aplicacion.numeroVisitaConsumo.requisitos.numeroVisitaConsumo;
            params.aplicacionPromocionNumeroVisitaConsumoRequisitosServicios = this.promocion.aplicacion.numeroVisitaConsumo.requisitos.servicios;
            params.aplicacionPromocionNumeroVisitaConsumoRequisitosProductos = this.promocion.aplicacion.numeroVisitaConsumo.requisitos.productos;
            params.aplicacionPromocionNumeroVisitaConsumoValorServicios = this.promocion.aplicacion.numeroVisitaConsumo.valor.servicios;
            params.aplicacionPromocionNumeroVisitaConsumoValorProductos = this.promocion.aplicacion.numeroVisitaConsumo.valor.productos;
            
            // Datos de Difusión
            params.difusion = {};
            params.difusion.difusionPromocion = this.promocion.difusion.difusionPromocion;
            params.difusion.idPromocionSucursalNuevaDifusionTipo = this.promocion.difusion.idPromocionSucursalNuevaDifusionTipo;
            params.difusion.fechaInicio = this.promocion.difusion.fechaInicio;
            params.difusion.idPromocionSucursalNuevaDifusionTipoPosteriorPeriodo = this.promocion.difusion.idPromocionSucursalNuevaDifusionTipoPosteriorPeriodo;
            params.difusion.difusionPosteriorAutomatica = this.promocion.difusion.difusionPosteriorAutomatica;
            params.difusion.idPromocionSucursalNuevaDifusionTipoPosteriorAutorizacionTipo = this.promocion.difusion.idPromocionSucursalNuevaDifusionTipoPosteriorAutorizacionTipo;
            params.difusion.idPromocionSucursalNuevaDifusionMedio = this.promocion.difusion.idPromocionSucursalNuevaDifusionMedio;
            params.difusion.direccionImagen = this.promocion.difusion.direccionImagen;
            params.difusion.difundirSoloImagen = this.promocion.difusion.difundirSoloImagen ? 1 : 0;
            params.difusion.encabezado = this.promocion.difusion.encabezado;
            params.difusion.piePagina = this.promocion.difusion.piePagina;
            params.difusionRestriccionDiasMes = this.promocion.difusion.difusionPosteriorPeriodo.restriccionDiasMes;
            params.difusionRestriccionDiasSemana = {};
            params.difusionRestriccionDiasSemana.lunes = this.promocion.difusion.difusionPosteriorPeriodo.restriccionLunes;
            params.difusionRestriccionDiasSemana.martes = this.promocion.difusion.difusionPosteriorPeriodo.restriccionMartes;
            params.difusionRestriccionDiasSemana.miercoles = this.promocion.difusion.difusionPosteriorPeriodo.restriccionMiercoles;
            params.difusionRestriccionDiasSemana.jueves = this.promocion.difusion.difusionPosteriorPeriodo.restriccionJueves;
            params.difusionRestriccionDiasSemana.viernes = this.promocion.difusion.difusionPosteriorPeriodo.restriccionViernes;
            params.difusionRestriccionDiasSemana.sabado = this.promocion.difusion.difusionPosteriorPeriodo.restriccionSabado;
            params.difusionRestriccionDiasSemana.domingo = this.promocion.difusion.difusionPosteriorPeriodo.restriccionDomingo;

            if(this.promocion.difusion.imagenSrc != ""){
                params.imagenSrc = this.promocion.difusion.imagenSrc.split(',')[1];
            }
            else{
                params.imagenSrc = "";
            }
            
            this._backService.HttpPost("catalogos/promocion/guardarBorradorPromocion", {}, params).subscribe((response: string) => {
                switch (response) {
                    case "-1":
                        this._toaster.error("Ya hay una Promoción con ese nombre");
                        this._pantallaServicio.ocultarSpinner();
                        break;

                    case "-2":
                        this._toaster.error("Ya hay una Promoción con ese código");
                        this._pantallaServicio.ocultarSpinner();
                        break;

                    default:
                        this._pantallaServicio.ocultarSpinner();
                        this._router.navigate(['/catalogos/promociones']);
                        break;
                }
            }, 
            (error) => {
                this._pantallaServicio.ocultarSpinner();
                if (error == 'SinSesion' || error == 'SesionCaducada') {
                    if (error == 'SinSesion') {
                    this._toaster.error(this.sessionTraslate.favorIniciarSesion);
                    }
                    if (error == 'SesionCaducada') {
                    this._toaster.error(this.sessionTraslate.sesionCaducada);
                    }
                    this._router.navigate(['/login']);
                    return;
                }
                this._toaster.error(this.sessionTraslate.errorEliminar);
            });
        }
        else{
            this._pantallaServicio.ocultarSpinner();
        }
    }

    funciones_acciones_irListadoPromociones(){
        this._router.navigate(['/catalogos/promociones']);
    }
    
    // Función de correos
    funciones_acciones_enviarCorreos(idPromocionSucursalNueva: any){
        this._pantallaServicio.mostrarSpinner();
        var params: any = {};
        params.idPromocionSucursalNueva = idPromocionSucursalNueva;
        params.nombrePromocion = this.promocion.nombre;
        params.clienteObjetivo = {};
        params.clienteObjetivo.todosClientes = this.promocion.clienteObjetivo.todosClientes? 1 : 0;
        params.clienteObjetivo.idClienteEstadoActividad = this.promocion.clienteObjetivo.idClienteEstadoActividad ? this.promocion.clienteObjetivo.idClienteEstadoActividad : null;
        params.clienteObjetivo.idClienteSexo = this.promocion.clienteObjetivo.idClienteSexo ? this.promocion.clienteObjetivo.idClienteSexo : null;
        params.clienteObjetivo.idClienteEdadRango = this.promocion.clienteObjetivo.idClienteEdadRango ? this.promocion.clienteObjetivo.idClienteEdadRango : null;
        params.clienteObjetivo.esVip = this.promocion.clienteObjetivo.esVip ? 1 : 0 ;

        this._backService.HttpPost("catalogos/promocion/enviarCorreoPromocionNueva", {}, params).subscribe((response: string) => {
            this._pantallaServicio.ocultarSpinner();
            this._router.navigate(['/catalogos/promociones']);
        }, 
        (error) => {
            this._pantallaServicio.ocultarSpinner();
            if (error == 'SinSesion' || error == 'SesionCaducada') {
                if (error == 'SinSesion') {
                this._toaster.error(this.sessionTraslate.favorIniciarSesion);
                }
                if (error == 'SesionCaducada') {
                this._toaster.error(this.sessionTraslate.sesionCaducada);
                }
                this._router.navigate(['/login']);
                return;
            }
            this._toaster.error(this.sessionTraslate.errorEliminar);
        });
    }

    funciones_acciones_abrirModalEnviarCorreos(){
        this.modales.modalEnviarCorreo.show();
    }

    funciones_acciones_redireccionarListado(){
        this._router.navigate(['/catalogos/promociones']);
    }

    // FUNCIÓN PRINCIPAL
    funciones_funcionPrincipal(){
        this._backService.HttpPost("catalogos/configuracionPerfil/ConsultaVariblesSession", {}, {}).subscribe((response: string) => {
            this.accesosPantalla = {};
            var dataTemp = eval(response);

            for (var i = 0; i < dataTemp.length; i++) {
                switch (dataTemp[i].Codigo) {
                    case "PROMCAT001":
                        this.accesosPantalla.accesoVisualizar = dataTemp[i].Valor;
                        break;
                    case "PROMCAT002":
                        this.accesosPantalla.accesoCrearEditar = dataTemp[i].Valor;
                        break;
                }
            }
            this.promociones_inicializarCalendario();
            this.funciones_inicio_consultarListadosAtributosPromociones();
        }, 
        (error) => {
            this._pantallaServicio.ocultarSpinner();
            if (error == 'SinSesion' || error == 'SesionCaducada') {
                if (error == 'SinSesion') {
                this._toaster.error(this.sessionTraslate.favorIniciarSesion);
                }
                if (error == 'SesionCaducada') {
                this._toaster.error(this.sessionTraslate.sesionCaducada);
                }
                this._router.navigate(['/login']);
                return;
            }
            this._toaster.error(this.sessionTraslate.errorEliminar);
        });
    }

    // Para los inputs de multiples etiquetas
    add(event: MatChipInputEvent, array: any): void {
        const value = (event.value || '').trim();
        // Añadimos el número a la lista
        if (value) {
            if (array === 'serviciosCantidades') {
                this.promocion.aplicacion.combos.requisitos.servicios.cantidades.push({
                    id: this.promocion.aplicacion.combos.requisitos.servicios.cantidades.length,
                    text: value
                });
            }
            if (array === 'productosCantidades') {
                this.promocion.aplicacion.combos.requisitos.productos.cantidades.push({
                    id: this.promocion.aplicacion.combos.requisitos.productos.cantidades.length,
                    text: value
                });
            }
        }
        // Limpiamos el valor del Input
        event.chipInput!.clear();
    }

    remove(item: any, array: any): void {
        let index: any;
        if (array === 'serviciosCantidades') {
            index = this.promocion.aplicacion.combos.requisitos.servicios.cantidades.indexOf(item);
            if (index >= 0) {
                this.promocion.aplicacion.combos.requisitos.servicios.cantidades.splice(index, 1);
            }
        }
        if (array === 'productosCantidades') {
            index = this.promocion.aplicacion.combos.requisitos.productos.cantidades.indexOf(item);
            if (index >= 0) {
                this.promocion.aplicacion.combos.requisitos.productos.cantidades.splice(index, 1);
            }
        }
    }

    irAAgenda(){
        this._router.navigate(['/procesos/agenda']);
    }

    irAListadoPromociones(){
        this._router.navigate(['/catalogos/promociones']);
    }
    
    // -------------------------------------------------------------------------------- //
    // ------------------------------------- Validaciones ----------------------------- //


    validarEntradaNumeroFlotante(evt: any) {
        var theEvent = evt || window.event;

        // Handle paste
        if (theEvent.type === 'paste') {
            //key = event.clipboardData.getData('text/plain');
        } else {
            // Handle key press
            var key = theEvent.which;
            key = String.fromCharCode(key);
        }
        var regex = /^[0-9.]*$/;
        if (!regex.test(key)) {
            theEvent.returnValue = false;
            if (theEvent.preventDefault) {
                theEvent.preventDefault();
            }
        }
    }

    validarEntradaSoloNumeros(evt: any) {
        var theEvent = evt || window.event;

        // Handle paste
        if (theEvent.type === 'paste') {
            //key = event.clipboardData.getData('text/plain'); DUDA
        } else {
            // Handle key press
            var key = theEvent.keyCode || theEvent.which;
            key = String.fromCharCode(key);
        }
        var regex = /^[0-9]*$/;
        if (!regex.test(key)) {
            theEvent.returnValue = false;
            if (theEvent.preventDefault) theEvent.preventDefault();
        }
    }

    // Se valida que la fecha seleccionada no sea menor a la fecha actual
    validarSeleccionFecha(){
        var aux = new Date(), month = '' + (aux.getMonth() + 1), day = '' + aux.getDate(), year = aux.getFullYear();

        if (month.length < 2) {
            month = '0' + month;
        }
        if (day.length < 2){ 
            day = '0' + day;
        }

        this.hoy = [year, month, day].join('-');
    }
}