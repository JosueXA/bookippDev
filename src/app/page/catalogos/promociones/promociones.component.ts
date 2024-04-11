import { Component, OnInit, ViewChild } from '@angular/core';
import { MethodsService } from 'src/app/core/services/methods.service';
import { PantallaService } from "src/app/core/services/pantalla.service";
import { MatDialog } from '@angular/material/dialog';
import { Router } from "@angular/router";
import { TranslateService } from '@ngx-translate/core'; // TRANSLATE
declare var $: any; // JQUERY
import * as bootstrap from 'bootstrap'; // BOOTSTRAP
import { ToasterService } from "src/shared/toaster/toaster.service";
import moment from 'moment'; // MOMENT
import { format, set } from 'date-fns';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { retry } from 'rxjs';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import dayjs from 'dayjs';

@Component({
    selector: 'app-promociones',
    templateUrl: './promociones.component.html',
    styleUrls: ['./promociones.component.scss', '../../page.component.scss'],
})

export class PromocionesComponent implements OnInit {
    // Variables de Translate
    promocionesTranslate: any = {};
    calendarioTranslate: any = {};
    sessionTraslate: any = {};
    agendaTranslate: any = {};

    // Modales
    modales: any = {}; 

    constructor(private _translate: TranslateService, private _backService: MethodsService, public _pantallaServicio: PantallaService, private _dialog: MatDialog, private _router: Router, private _toaster: ToasterService, private matIconRegistry: MatIconRegistry, private domSanitizer: DomSanitizer) {
        this._translate.setDefaultLang(this._pantallaServicio.idioma);
        this._translate.use(this._pantallaServicio.idioma);

        this._translate.get('calendarioTranslate').subscribe((translated: string) => {  
            this.calendarioTranslate = this._translate.instant('calendarioTranslate');
            this.sessionTraslate = this._translate.instant('sessionTraslate');
            this.agendaTranslate = this._translate.instant('agendaTranslate');
            this.promocionesTranslate = this._translate.instant('promociones');
            this.reporte_inicializarCalendario();
        });

        this.matIconRegistry.addSvgIcon('iconAgregar', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Agregar-1-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconCasa1', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Casa1-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconFlecha1DerechaPeque', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/FlechaDerechaPequena-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconCalendarioEditar', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/CalendarioEditar-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconFlechaAbajoPeque', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/FlechaAbajoPequena-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconBuscar', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Buscar-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconEditar1', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Editar-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconBasura', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Basura-icon.svg"));
    }

    ngOnInit(): void {
        this.crearModales();
        this.funcionPrincipal();
    }

    crearModales() {
        if ($('body').find('.modal-alert').length > 1) {
            $('body').find('.modal-alert')[1].remove();
        }
        this.modales.modalAlert = new bootstrap.Modal($("#modal-alert").appendTo("body"), {
            backdrop: "static", 
            keyboard: false,
        });

        if ($('body').find('.modalEliminarPromocion').length > 1) {
            $('body').find('.modalEliminarPromocion')[1].remove();
        }
        this.modales.modalEliminarPromocion = new bootstrap.Modal($("#modalEliminarPromocion").appendTo("body"), {
            backdrop: "static", 
            keyboard: false,
        });
    }

    // ------------------------------------------------------------------------------------------- //
    // ------------------------------------------ PROMOCIONES ------------------------------------ //
    // ------------------------------------------------------------------------------------------- //

    // -------------------------------------- Declaración de variables --------------------------- //
    dataSource = new MatTableDataSource<any>([]);
    @ViewChild(MatPaginator) paginator!: MatPaginator;
	@ViewChild(MatSort) sort!: MatSort;
    displayedColumns_listadoPromociones: string[] = ["idPromocion", "nombrePromocion", "tipoPromocion", "tipoVigencia", "fechaInicio", "fechaFin",
                                                     "difusionPromocion", "tipoDifusion", "activa", "esBorrador", "fechaAlta"];
    rootScope_fromState = "ListadoPromociones";
    primeraCarga = true;
    accesosPantalla: any = {};
    filtro = {
        textoFiltro: ""
    };
    invalidDates: moment.Moment[] = [moment().add(2, 'days'), moment().add(3, 'days'), moment().add(5, 'days')];
    fechaInicio = moment(new Date()).startOf('month').format('DD/MM/YYYY');
    fechaFin = moment(new Date()).format('DD/MM/YYYY');
    //fechaCalendario: any = this.fechaInicio + " - " + this.fechaFin;
    fechaCalendario: any = {
        // startDate: moment(new Date()).startOf('month').format('DD/MM/YYYY'), 
        // endDate: moment(new Date()).endOf('month').format('DD/MM/YYYY')
        startDate: dayjs().startOf('month'),
        endDate: dayjs().endOf('month')
    };
    dataPromociones = [];
    dataPromocionesOriginal = [];
    gridPromociones = {};
    pageSize = 15;
    gridPromocionesAltura = this.pageSize * 30 + 77;
    promocionSeleccionada: any = "";
    locale: any = {
        format: 'DD/MM/YYYY'
    }
    ranges: any;
    bandera = 0;
    banderaDesdeEliminar = 0;


    // ------------------------------------------------------------------------------------------------ //
    // ----------------------------------- Declaracion de funciones ----------------------------------- //
    reporte_inicializarCalendario() {
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
            [dias]:  [moment().subtract(6, 'days'), moment()], //subtract
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

    consultarPromocionesPorSucursal() {
        this._pantallaServicio.mostrarSpinner();

        var params: any = {};

        var fechaBusquedaSplit = [this.fechaCalendario.startDate, this.fechaCalendario.endDate];

        params.fechaInicio = (moment(JSON.parse(JSON.stringify(fechaBusquedaSplit[0])), 'DD/MM/YYYY').startOf('day')).format('YYYY-MM-DD HH:mm:ss');
        params.fechaFin = (moment(JSON.parse(JSON.stringify(fechaBusquedaSplit[1])), 'DD/MM/YYYY').endOf('day')).format('YYYY-MM-DD HH:mm:ss');

        if(params.fechaInicio == "Invalid date" && params.fechaFin == "Invalid date"){
            params.fechaInicio = moment(new Date(this.fechaCalendario.startDate['$y'], this.fechaCalendario.startDate['$M'],this.fechaCalendario.startDate['$D'] )).startOf('day').format('YYYY-MM-DD HH:mm:ss');
            params.fechaFin = moment(new Date(this.fechaCalendario.endDate['$y'], this.fechaCalendario.endDate['$M'], this.fechaCalendario.endDate['$D'] )).endOf('day').format('YYYY-MM-DD HH:mm:ss');
        }
        
        this._backService.HttpPost("catalogos/promocion/consultarPromocionesPorSucursal", {}, params).subscribe((response: string) => {
            var dataTemp = eval(response);
            this.dataPromociones = dataTemp;
            this.dataPromocionesOriginal = JSON.parse(JSON.stringify(this.dataPromociones));

            this.dataSource.data = this.dataPromociones;
            this.dataSource.paginator = this.paginator;
            this.paginator._intl.itemsPerPageLabel = (this._pantallaServicio.idioma == "es-mx" ? 'Filas por página' : 'Items per Page');
		    this.dataSource.sort = this.sort;

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

    buscarPromociones(){
        var filtroTexto = this.filtro.textoFiltro.toUpperCase();

        if(filtroTexto){
            var elementosFiltrados = this.dataPromocionesOriginal.filter((prom: any)  =>{
                if (prom.nombrePromocion.toUpperCase().match(filtroTexto) != null) {
                    return prom;
                }
            })
            this.dataPromociones = JSON.parse(JSON.stringify(elementosFiltrados));
            this.dataSource.data = this.dataPromociones;
        }
        else{
            this.dataPromociones = JSON.parse(JSON.stringify(this.dataPromocionesOriginal));
            this.dataSource.data = this.dataPromociones;
        }
    }

    crearPromocion() {
        this._router.navigate(
            ['/catalogos/promociones-creacion-edicion'],
            {queryParams: { idPromocion: 'N' }}
        );
    }

    actualizarPromocion(entity: any) {
        this._router.navigate(
            ['/catalogos/promociones-creacion-edicion'],
            {queryParams: { idPromocion: entity.idPromocionSucursalNueva }}
        );
    }

    preparacionBorrarPromocion(entity: any) {
        this.promocionSeleccionada = entity;
        this.abrirModalEliminarPromocion("¿Está seguro que desea borrar la Promoción '" + this.promocionSeleccionada.nombrePromocion + "'?");
    };

    eliminarPromocion() {
        this._pantallaServicio.mostrarSpinner();

        var params: any = {};
        params.idPromocionSucursalNueva = this.promocionSeleccionada.idPromocionSucursalNueva;

        this._backService.HttpPost("catalogos/promocion/eliminarPromocionSucursal", {}, params).subscribe((response: string) => {
            this.consultarPromocionesPorSucursal();
        }, 
        (error) => {
            this._pantallaServicio.ocultarSpinner();
            //this.mostrarModal(eval(response)); //DUDA
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
    };

    abrirModalEliminarPromocion(mensaje: any){
        this.modales.modalEliminarPromocion.show();
        $("#modalEliminarPromocion .modal-body").html('<span class="title">' + mensaje + '</span>');
    }

    funcionPrincipal() {
        this._pantallaServicio.mostrarSpinner();

        this._backService.HttpPost("catalogos/configuracionPerfil/ConsultaVariblesSession", {}, {}).subscribe((response: string) => {
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

            setTimeout(() => {
                this.consultarPromocionesPorSucursal();
            }, 50);
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

    isInvalidDate = (m: moment.Moment) =>  {
        return this.invalidDates.some(d => d.isSame(m, 'day') )
    }

    irAAgenda(){
        this._router.navigate(['/procesos/agenda']);
    }
}