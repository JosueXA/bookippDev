import { Component, OnInit, ViewChild } from '@angular/core';
import { MethodsService } from 'src/app/core/services/methods.service';
import { PantallaService } from "src/app/core/services/pantalla.service";
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from "@angular/router";
import { TranslateService } from '@ngx-translate/core'; // TRANSLATE
declare var $: any; // JQUERY
import * as bootstrap from 'bootstrap'; // BOOTSTRAP
import { ToasterService } from "src/shared/toaster/toaster.service";
import moment from 'moment';
import { format } from 'date-fns';
import { saveAs } from 'file-saver';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-cliente',
  templateUrl: './cliente.component.html',
  styleUrls: ['./cliente.component.scss', '../../page.component.scss'],  
})
export class ClienteComponent implements OnInit {

    // Variables de Translate
    consultaClienteTranslate: any = {};
    clienteTranslate: any = {};        
    LANGS: any = {};
    notasTranslate: any = {};            
    agendaTranslate: any = {};
    reporteVentaProductoTranslate: any = {};    
    recepcionDirectaTraslate: any = {};    
    calendarioTranslate: any = {};    
    promocionTranslate: any = {};

    // Modales
    modales: any = {};
    modalAlertBorrado_mensaje = "";
        
    displayedColumns: any [] = [];
    displayedColumnsCompletas: string [] = [];        
      
	dataSource = new MatTableDataSource<any>([]);
	@ViewChild(MatPaginator) paginator!: MatPaginator;
	@ViewChild(MatSort) sort!: MatSort;    


    // date range picker
    selected: any;
    alwaysShowCalendars: boolean;
    ranges: any;
    locale: any = {
        format: 'DD/MM/YYYY'
    }
    // = {
    //     [this.calendarioTranslate.dias7 ]: [moment().subtract(6, 'days'), moment()],
        
    //     // "ultimoMes": [moment().startOf('month'), moment().endOf('month')],
    //     // "ultimoAnio": [moment().startOf('year'), moment().endOf('year')]
    //     // 'Today': [moment(), moment()],
    //     // 'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
    //     // 'Last 7 Days': [moment().subtract(6, 'days'), moment()],
    //     // 'Last 30 Days': [moment().subtract(29, 'days'), moment()],
    //     // 'This Month': [moment().startOf('month'), moment().endOf('month')],
    //     // 'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
    // }
    invalidDates: moment.Moment[] = [moment().add(2, 'days'), moment().add(3, 'days'), moment().add(5, 'days')];

    isInvalidDate = (m: moment.Moment) =>  {
        return this.invalidDates.some(d => d.isSame(m, 'day') )
    }


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

        this._translate.get('consultaClienteTranslate').subscribe((translated) => {                        
            this.consultaClienteTranslate = this._translate.instant('consultaClienteTranslate');
            this.clienteTranslate = this._translate.instant('clienteTranslate');                        
            this.LANGS = this._translate.instant('LANGS');
            this.notasTranslate = this._translate.instant('notasTranslate');
            this.agendaTranslate = this._translate.instant('agendaTranslate');                        
            this.reporteVentaProductoTranslate = this._translate.instant('reporteVentaProductoTranslate');                        
            this.recepcionDirectaTraslate = this._translate.instant('recepcionDirectaTraslate');
            this.calendarioTranslate = this._translate.instant('calendarioTranslate');            
            this.promocionTranslate = this._translate.instant('promocionTranslate');            
        });                
        
        this.matIconRegistry.addSvgIcon('iconCasa1', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Casa1-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconFlecha1DerechaPeque', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/FlechaDerechaPequena-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconAgregar', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Agregar-1-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconNubeSubir', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/NubeSubir-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconCalendarioEditar', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/CalendarioEditar-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconFlechaAbajo', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/FlechaAbajo-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconBuscar', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Buscar-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconExcel', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Excel-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconCsv', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/CSV-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconEditar', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Editar-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconBasura', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Basura-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconStrella', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Estrella-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconStrellaActivada', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Estrella-Activado-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconHombreActivado', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/GHombre-Activado-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconHombreDesactivado', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/GHombre-Desactivado-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconMujerActivada', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/GMujer-Activado-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconMujerDesactivada', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/GMujer-Desactivado-icon.svg"));
    }

    ngOnInit(): void {
        this._route.queryParams.subscribe(params => {
            this.etiquetaSeleccionada = params["idEtiqueta"];    

			this.fechaInicioFil = this.fechaInicio;        
			this.fechaFinFil = this.fechaFin;
			this.tituloPantalla = (this.etiquetaSeleccionada == "N") ? this.consultaClienteTranslate.clientes : this.clienteTranslate.clientesConfigurables ;
			
			this._pantallaServicio.mostrarSpinner();
			this.crearModales();                
			
			setTimeout(() => {
				this.mostrarcalendario();
				this.inicializarCalendario();
			}, 1000);
				this.consultaPrincipal();
        });
    }

    //--- Inicialicacion para el paginator
	ngAfterViewInit() {
		this.paginator._intl.itemsPerPageLabel = 'filas por pagina';
		this.dataSource.paginator = this.paginator;
		this.dataSource.sort = this.sort;
	}

    crearModales() {

        if($("body").find(".modal-confirm").length > 1){
            $("body").find(".modal-confirm")[1].remove();
        }
        this.modales.modalConfirm = new bootstrap.Modal($("#modal-confirm").appendTo("body"), {
            backdrop: "static", 
            keyboard: false,
        });

        if($("body").find(".modal-confirm-BorrarCliente").length > 1){
            $("body").find(".modal-confirm-BorrarCliente")[1].remove();
        }
        this.modales.modalConfirmBorrarCliente = new bootstrap.Modal($("#modal-confirm-BorrarCliente").appendTo("body"), {
            backdrop: "static", 
            keyboard: false,
        });

        if($("body").find(".calificarCliente").length > 1){
            $("body").find(".calificarCliente")[1].remove();
        }
        this.modales.calificarCliente = new bootstrap.Modal($("#calificarCliente").appendTo("body"), {
            backdrop: "static", 
            keyboard: false,
        });

        if($("body").find(".modalDescartarCambios").length > 1){
            $("body").find(".modalDescartarCambios")[1].remove();
        }
        this.modales.modalDescartarCambios = new bootstrap.Modal($("#modalDescartarCambios").appendTo("body"), {
            backdrop: "static", 
            keyboard: false,
        });
        
        if($("body").find(".cerrarModalConfirm").length > 1){
            $("body").find(".cerrarModalConfirm")[1].remove();
        }
        this.modales.cerrarModalConfirm = new bootstrap.Modal($("#cerrarModalConfirm").appendTo("body"), {
            backdrop: "static", 
            keyboard: false,
        });

        if($("body").find(".borrar-nota").length > 1){
            $("body").find(".borrar-nota")[1].remove();
        }
        this.modales.borrarNota = new bootstrap.Modal($("#borrar-nota").appendTo("body"), {
            backdrop: "static", 
            keyboard: false,
        });

        if($("body").find(".modal-noDatos").length > 1){
            $("body").find(".modal-noDatos")[1].remove();
        }
        this.modales.modalNoDatos = new bootstrap.Modal($("#modal-noDatos").appendTo("body"), {
            backdrop: "static", 
            keyboard: false,
        });

    }


    // ------------------------------------------------------------------------------------------- //
    // ---------------------------------------- Servicios ---------------------------------------- //
    // ------------------------------------------------------------------------------------------- //


    // ----------------------------------- Declaracion de variables ----------------------------------- 

    rootScope_fromState = "";
    msgConsultaExitosa = "";

    datosIncorrectos = 0;
    cambiosRealizados = 0;

    inhabilitar = false;
    comentarioVacio = true;

    horaCita = "";
    eventInfo = false;

    guardar = false;    
    consultaExitosa = true;
    vistaPrevia = false;

    dataFechaJSON = [ {dt: [{ fecha: "1", descripcion: 'Fecha Alta' }, { fecha: "2", descripcion: 'Última Visita'}]} ];
    dt = [{ fecha: "1", descripcion: 'Fecha Alta' }, { fecha: "2", descripcion: 'Última Visita'}];

    //Funcion para validar los errores
    onClickDdl(id: any) {
        //this.elementoDdl = id;
        if (this.guardar) {
            $("#" + id + " > div:first-child").attr("style", "outline: none;");
            //elem.removeClass("errorCampo");
        }
    }

    tipofechacliente() {
        this.consultaCliente();
    }

    pruebaNombre = "";
    fechaFinFil = moment().format('DD/MM/YYYY');
    fechaInicioFil = moment().subtract('month', 1).format('DD/MM/YYYY');
    fechaInicial = this.fechaInicioFil + " - " + this.fechaFinFil;
    cliente: any = {
        fechaFinFil: moment().format('DD/MM/YYYY'),
        fechaInicioFil: moment().subtract('month', 1).format('DD/MM/YYYY'),
        fechaInicio: moment().subtract('month', 1).format('DD/MM/YYYY'),
        fechaFin: moment().format('DD/MM/YYYY'),
        tipoFecha: { fecha: "1", descripcion: 'Fecha Alta' }, //Inicializar el parametro de Tipo Fecha.    
        fechas: this.fechaInicial
    }; 
    primerConsulta = true;    
        
    fechasAux = this.cliente.fechas.split(" - ");

    f1 = this.fechasAux[0].split('/'); //Fecha de inicio de busqueda
    f2 = this.fechasAux[1].split('/'); //Fecha de fin de busqueda

    // fechaInicio = format(new Date( this.f1[2] + "-" + this.f1[1] + "-" +  ( parseInt(this.f1[0]) ) ), 'yyyy-MM-dd' );        
    // fechaFin = format(new Date( this.f2[2] + "-" + this.f2[1] + "-" +  (parseInt(this.f2[0]) ) ), 'yyyy-MM-dd' );        
    fechaInicio:any = format(new Date().setFullYear(this.f1[2], this.f1[1]-1, this.f1[0]), 'yyyy-MM-dd' );
    fechaFin:any = format(new Date().setFullYear(this.f2[2], this.f2[1]-1, this.f2[0]), 'yyyy-MM-dd' );

    etiquetaSeleccionada: any;
    primeraCarga = 0;

    //Variables para las notas del cliente
    nombreClienteNota = "";
    esAlertaNota = false;
    comentarioNota = "";
    clienteSeleccionado = "";
    nuevaNota = false;
    notaExistente = false;
    notaParaBorrar = "";
    agregar = false;
    tituloPantalla: any;

    dataDetalles: any;

    mostrarcalendario() {
        if(this.etiquetaSeleccionada == "N"){
            $('#CalendarioCliente').show(); 
            $('#FechaCliente').show();                   
        }
        else{
            $('#CalendarioCliente').hide(); 
            $('#FechaCliente').hide();
        }
    }

    mostrarDetalleCita(entity: any) {
        this.eventInfo = true;
        if (!entity.fecha) {
            this.eventInfo = false;
        }
        else {
            var params: any = {};
            params.idCita = entity.idCita;

            this._backService.HttpPost("catalogos/cliente/consultaDetalleCita", {}, params).subscribe((response: any) => {
                this.dataDetalles = eval(response);
                for (var i = 0; i < this.dataDetalles.length; i++) {
                    this.dataDetalles[i].horaInicioServicio = this.dataDetalles[i].horaInicioServicio.substring(0, 5);
                    if (this.dataDetalles.length == 1) {
                        this.dataDetalles[i].mostrarLinea = false;
                    }
                    else {
                        if (i == this.dataDetalles.length - 1) {
                            this.dataDetalles[i].mostrarLinea = false;
                        }
                        else {
                            this.dataDetalles[i].mostrarLinea = true;
                        }
                    }
                }
                this.horaCita = this.dataDetalles[0].horaCita.substring(0, 5);
            }, error => {

            });            
        }
    }

    cerrarPopover() {
        this.eventInfo = false;
    }

    pageSize = 15;
    dataTrue = false;
    gridOptions: any ;

    traducir() {
        // if (this.primerConsulta == true) {
            this.displayedColumns = [];
            this.displayedColumnsCompletas = [];
            this.gridOptions = 
                // {
                // paginationPageSizes: [15, 50, 100],
                // paginationPageSize: 15,
                // enableSorting: true,
                // enableColumnMenus: false,
                // columnDefs: 
                [
                    { name: "acciones",             header: this.consultaClienteTranslate.acciones },
                    { name: "nombre",               header: this.consultaClienteTranslate.nombre },
                    { name: "telefono",             header: this.consultaClienteTranslate.telefono},
                    { name: "email",                header: this.consultaClienteTranslate.email},
                    { name: "fechaNacimiento",      header: this.consultaClienteTranslate.fechaNacimiento},
                    { name: "edad",                 header: this.consultaClienteTranslate.edad},
                    { name: "fecha",         header: this.consultaClienteTranslate.ultimaVisita},
                    { name: "realizoAltaUsuario",   header: this.consultaClienteTranslate.realizoAlta},
                    { name: "etiquetaNombre",       header: this.consultaClienteTranslate.etiquetaNombre},
                    { name: "fechaAlta",                                   header: 'Fecha Alta'}                
                ];                
            //     data: 'dataGrid2',
            //     // onRegisterApi: function (gridApi) {
            //     //     this.gridApi = gridApi;
            //     //     gridApi.pagination.on.paginationChanged(this, function (newPage, pageSize) {

            //     //         this.pageSize = pageSize;
            //     //     });
            //     // }
            // };    
            this.gridOptions.forEach( (x: any) => {
                x.name != 'acciones' ? this.displayedColumns.push({header: x.header, name: x.name}) : null;
                this.displayedColumnsCompletas.push(x.name);
            });            
        // }else {
        //     this.gridOptions = {
        //         paginationPageSizes: [15, 50, 100],
        //         paginationPageSize: 15,
        //         enableSorting: true,
        //         enableColumnMenus: false,
        //         columnDefs: [
        //             { name: this.consultaClienteTranslate.acciones, width: '150', enableSorting: false, cellClass: 'alignCenter', headerCellClass: 'alignCenter2', cellTemplate: '<div class="ui-grid-cell-contents" style="color:#337dc0; display: flex;"><li style="margin: auto auto; font-size: 1.5em; cursor:pointer;" class="iconos fa fa-pencil" ng-if="grid.appScope.accesosPantalla.clientesAccion" ng-click="grid.appScope.actualizarCliente(row.entity)"></li><li style="margin: auto auto; font-size: 1.5em; cursor:pointer;" class="iconos fa fa-trash-o" ng-if="grid.appScope.accesosPantalla.clientesAccion" ng-click="grid.appScope.preparacionBorrarCliente(row.entity.idCliente)"></li><li style="margin: auto auto; font-size: 1.5em; cursor:pointer; color: gold;" class="iconos fa fa-star" ng-if="grid.appScope.accesosPantalla.clientesAccion && row.entity.esVip" ng-click="grid.appScope.cambiarClienteVip(0, row.entity)"></li><li style="margin: auto auto; font-size: 1.5em; cursor:pointer; color: #c8ced4;" class="iconos fa fa-star" ng-if="grid.appScope.accesosPantalla.clientesAccion && !row.entity.esVip" ng-click="grid.appScope.cambiarClienteVip(1, row.entity)"></li><li style="margin: auto auto; font-size: 1.5em; cursor:pointer;" class="iconos fa fa-male" ng-if="grid.appScope.accesosPantalla.clientesAccion && row.entity.idClienteSexo == 1" ng-click="grid.appScope.cambiarClienteSexo(null, row.entity)"></li><li style="margin: auto auto; font-size: 1.5em; cursor:pointer; color: #c8ced4;" class="iconos fa fa-male" ng-if="grid.appScope.accesosPantalla.clientesAccion && row.entity.idClienteSexo != 1" ng-click="grid.appScope.cambiarClienteSexo(1, row.entity)"></li><li style="margin: auto auto; font-size: 1.5em; cursor:pointer;" class="iconos fa fa-female" ng-if="grid.appScope.accesosPantalla.clientesAccion && row.entity.idClienteSexo == 2" ng-click="grid.appScope.cambiarClienteSexo(null, row.entity)"></li><li style="margin: auto auto; font-size: 1.5em; cursor:pointer; color: #c8ced4;" class="iconos fa fa-female" ng-if="grid.appScope.accesosPantalla.clientesAccion && row.entity.idClienteSexo != 2" ng-click="grid.appScope.cambiarClienteSexo(2, row.entity)"></li></div>' },
        //             //{ name: "Estatus", width: '100', field: 'nuevo', cellClass: 'align-center',  headerCellClass: 'alignCenter', cellTemplate: '<div class="puntosSuspensivos" style="margin-top: 5px"><p ng-if="row.entity.nuevo == 1" style="text-align: center;">Nuevo</p><p ng-if="row.entity.nuevo == 0" style="text-align: center;">Subsecuente</p></div>'},
        //             { name: this.consultaClienteTranslate.nombre, minWidth: '280', field: 'nombre', headerCellClass: 'alignCenter', cellClass: 'alignCenter', cellTemplate: '<div class="puntosSuspensivos" style="margin-top: 5px;"><a class="ls-link-b" style="cursor:pointer;" ng-click="grid.appScope.actualizarCliente(row.entity)">{{COL_FIELD}}</a></div>' },
        //             { name: this.consultaClienteTranslate.telefono, width: '100', field: 'telefono', headerCellClass: 'alignCenter', cellClass: 'alignCenter' },
        //             { name: this.consultaClienteTranslate.email, width: '188', field: 'email', headerCellClass: 'alignCenter', cellClass: 'alignCenter' },
        //             { name: this.consultaClienteTranslate.fechaNacimiento, displayName: this.consultaClienteTranslate.fechaNacimiento, width: '120', field: 'fechaNacimiento', headerCellClass: 'alignCenter', cellClass: 'alignCenter', type: 'date', cellFilter: 'date:"dd/MM/yyyy"' },
        //             { name: this.consultaClienteTranslate.edad, displayName: this.consultaClienteTranslate.edad, width: '80', field: 'cliente_edad', headerCellClass: 'alignCenter', cellClass: 'alignCenter'},
        //             { name: this.consultaClienteTranslate.ultimaVisita, displayName: this.consultaClienteTranslate.ultimaVisita, width: '110', field: 'fecha', headerCellClass: 'alignCenter', cellClass: 'alignCenter', type: 'date', cellFilter: 'date:"dd/MM/yyyy"', cellTemplate: '<div style="margin-top: 5px;"><a class="ls-link-b" style="cursor:pointer;" ng-click="grid.appScope.mostrarDetalleCita(row.entity)">{{COL_FIELD | date :"dd/MM/yyyy"}}</a></div>' },
        //             { name: this.consultaClienteTranslate.realizoAlta, displayName: this.consultaClienteTranslate.realizoAlta, width: '120', field: 'realizoAltaUsuario', headerCellClass: 'alignCenter', cellClass: 'alignLeft2' },
        //             { name: this.consultaClienteTranslate.etiquetaNombre, minWidth: '157', field: 'etiquetas', headerCellClass: 'alignCenter', cellClass: 'alignLeft2' },
        //             { name: "fechaAlta",  width: '120', field: 'fechaAlta', headerCellClass: 'alignCenter', cellClass: 'alignCenter', type: 'date', cellFilter: 'date:"dd/MM/yyyy"' }

        //         ],
        //         data: 'dataGrid2',
        //         // onRegisterApi: function (gridApi) {
        //         //     this.gridApi = gridApi;
        //         //     gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {

        //         //         $scope.pageSize = pageSize;
        //         //     });
        //         // }
        //     };    
        // }

        // this.gridOptions.enableVerticalScrollbar = 0;
        // this.gridOptions.enableHorizontalScrollbar = 2;
    }
    
    mostrarDatosFacturacion(id: any) {
        var w = 1000;
        var h = 530;
        var left = Number((screen.width / 2) - (w / 2));
        var tops = Number((screen.height / 2) - (h / 2));
        var caracteristicas = "height=" + h + ",width=" + w + ",scrollTo,resizable=0,scrollbars=1,location=1," + "top=" + tops + ", left=" + left;
        var lang = this.LANGS.using;
        //nueva = $window.open('/informacionFiscalCliente.html#/' + id + '&N&' + lang, 'Popup', caracteristicas);
    }

    multiSelModel: any;
    multiSelResources: any;
    dataGrid: any;
    keyNames: any;
    columnasOriginales: any;
    altura: any;
    cantidadClientes: any;
    dataGrid2: any;
    //Consulta los registros para mostrarlos en la pantalla
    consultaCliente() {
        this._pantallaServicio.mostrarSpinner();
        this.traducir();
        var params: any = {};
        params.fechaInicioFil = this.fechaInicio;
        params.fechaFinFil = this.fechaFin;
        //envio de parametro para el tipo de fechas
        params.tipoFecha =  this.cliente.tipoFecha.fecha;
        if(this.cliente.tipoFecha.fecha == "1"){
            params.tipoFecha = 1;
        }
        else {
            params.tipoFecha = 2;
        }

        if (this.etiquetaSeleccionada != "N" && this.etiquetaSeleccionada != "C") {
            if (this.multiSelModel) {
                if (this.multiSelModel.length > 0 && this.multiSelResources.length != this.multiSelModel.length) {
                    var result = this.multiSelModel.map(function (a: any) { return a.id; });
                    params.listaEtiquetas = result;
                }
                else {
                    params.listaEtiquetas = null;
                }
            }
            else {
                params.listaEtiquetas = [];
                params.listaEtiquetas[0] = this.etiquetaSeleccionada;
            }
            
        }
        else {
            if (this.multiSelModel) {
                if (this.multiSelModel.length > 0 && this.multiSelResources.length != this.multiSelModel.length) {
                    var result = this.multiSelModel.map(function (a: any) { return a.id; });
                    params.listaEtiquetas = result;
                }
                else {
                    params.listaEtiquetas = null;
                }
            }
            else {
                params.listaEtiquetas = null;
            }
            
        }
        var igual = 0;
        var buscadorFiltroClientes = [];
        if (this.etiquetaSeleccionada == "C") {
            params.opcion = 1;

            this._backService.HttpPost("catalogos/cliente/consultaClienteConfigurables", {}, params).subscribe((data: any) => {            
                this.dataGrid = eval(data);
                // Número de columnDefs que ya hay en la data
                var camposAux = 10; 
                if (this.dataGrid.length != 0) {
                    // this.displayedColumns = [];
                    // this.displayedColumnsCompletas = ["acciones"];
                    this.traducir();        
                    this.keyNames = Object.keys(this.dataGrid[0]);
                    var i: any;
                    for (i in this.keyNames) {
                        // Parametros a partir de los cuales va a tomar que son datos config
                        if (i > 17) {
                            // if(this.keyNames[i] == "pagoServicios" || this.keyNames[i] == "pagoProductos" || this.keyNames[i] == "pagoPendientes"){
                            //     this.gridOptions.columnDefs[camposAux] = { name: this.keyNames[i], minWidth: '120', field: this.keyNames[i], headerCellClass: 'alignCenter', cellClass: 'alignCenter', cellFilter: 'currency' };
                            // }
                            // else{
                            //     this.gridOptions.columnDefs[camposAux] = { name: this.keyNames[i], minWidth: '100', field: this.keyNames[i], headerCellClass: 'alignCenter', cellClass: 'alignLeft2' };
                            // }
                            this.gridOptions[camposAux] = { name: this.keyNames[i],  header: this.keyNames[i]};
                            this.displayedColumns.push({ header: this.keyNames[i], name: this.keyNames[i] } );
                            this.displayedColumnsCompletas.push(this.keyNames[i]);

                            camposAux++;
                        }
                    }

                    this.columnasOriginales = JSON.parse(JSON.stringify(this.dataGrid[0]));
                }
                else {
                    this.keyNames = [];
                }
                
                this.altura = this.pageSize * 30 + 57;
                this.cantidadClientes = this.dataGrid.length + ' ' + this.notasTranslate.clientes;
                for (var x = 0; x < this.dataGrid.length; x++) {

                    if (this.dataGrid[x].fechaNacimiento) {
                        this.dataGrid[x].fechaNacimiento = format(new Date(this.dataGrid[x].fechaNacimiento), 'dd/MM/yyyy');                        
                    }
                    if (this.dataGrid[x].fechaCita) {
                        this.dataGrid[x].fechaCita = format(new Date(this.dataGrid[x].fechaCita), 'dd/MM/yyyy');
                    }
                    if (this.dataGrid[x].fechaAlta) {
                        this.dataGrid[x].fechaAlta = format(new Date(this.dataGrid[x].fechaAlta), 'dd/MM/yyyy'); 
                    }
                    if (this.dataGrid[x].fecha) {
                        this.dataGrid[x].fecha = format(new Date(this.dataGrid[x].fecha), 'dd/MM/yyyy'); 
                    }

                    if (this.dataGrid[x].comentario == null) {
                        this.dataGrid[x].comentario = "";
                    }
                    if (this.dataGrid[x].etiquetas != null) {
                        this.dataGrid[x].etiquetas = this.dataGrid[x].etiquetas;
                    }
                    if (this.dataGrid[x].cliente_edad != null) {
                        if (parseInt(this.dataGrid[x].cliente_edad) < 0) {
                            this.dataGrid[x].cliente_edad = "";
                        }
                    }

                    this.dataGrid[x].calificacionDeseada = this.dataGrid[x].calificacion;
                    this.dataGrid[x].idData = x;

                    // $("#tablaClientes div div div div.ui-grid-viewport").scroll(function () {
                    //     $timeout(function () {
                    //         $("#cerrar-popover").click();
                    //     });
                    // });
                }

                if (this.dataGrid.length == 0 && this.etiquetaSeleccionada == "C") {
                    this.dataTrue = false;
                    this.consultaExitosa = false;
                }
                else {
                    this.consultaExitosa = false;
                    this.dataTrue = true;
                }           
                this.dataSource.data = this.dataGrid;
                this.dataSource.paginator = this.paginator;
		        this.dataSource.sort = this.sort;

                this.dataGrid2 = JSON.parse(JSON.stringify(this.dataGrid));
                this.busquedaCliente();
                if (this.primeraCarga == 0) {
                    this.consultaEtiquetas();
                }                
                this._pantallaServicio.ocultarSpinner();
            }, error => {
                
            });
            
        } else {
            params.tipoFecha =  this.cliente.tipoFecha.fecha;
            if(this.cliente.tipoFecha.fecha == "1"){
                params.tipoFecha = 1;
            }
            else {
                params.tipoFecha = 2;
            }

            this._backService.HttpPost("catalogos/Cliente/consultaCliente", {}, params).subscribe((data) => {                
                this.dataGrid = eval(data);
                // Número de columnDefs que ya hay en la data
                var camposAux = 10; 
                if (this.dataGrid.length != 0) {
                    // this.displayedColumns = [];
                    // this.displayedColumnsCompletas = ["acciones"];
                    this.traducir();
                    this.keyNames = Object.keys(this.dataGrid[0]);
                    var i: any;
                    for (i in this.keyNames) {
                        // Parametros a partir de los cuales va a cambiar
                        if (i > 17) {
                            //this.gridOptions.columnDefs[camposAux] = { name: this.keyNames[i], minWidth: '100', field: this.keyNames[i], headerCellClass: 'alignCenter', cellClass: 'alignLeft2' };
                            this.gridOptions[camposAux] = { name: this.keyNames[i],  header: this.keyNames[i]};
                            this.displayedColumns.push({ header: this.keyNames[i], name: this.keyNames[i] } );
                            this.displayedColumnsCompletas.push(this.keyNames[i]);
                            camposAux++;
                        }
                    }

                    this.columnasOriginales = JSON.parse(JSON.stringify(this.dataGrid[0]));
                }
                else {
                    this.keyNames = [];
                }
                this.altura = this.pageSize * 30 + 57;
                this.cantidadClientes = this.dataGrid.length + ' ' + this.notasTranslate.clientes;
                for (var z = 0; z < this.dataGrid.length; z++) {

                    if (this.dataGrid[z].fechaNacimiento) {
                        this.dataGrid[z].fechaNacimiento = format(new Date(this.dataGrid[z].fechaNacimiento), 'dd/MM/yyyy');                        
                    }
                    if (this.dataGrid[z].fechaCita) {
                        this.dataGrid[z].fechaCita = format(new Date(this.dataGrid[z].fechaCita), 'dd/MM/yyyy');
                    }
                    if (this.dataGrid[z].fechaAlta) {
                        this.dataGrid[z].fechaAlta = format(new Date(this.dataGrid[z].fechaAlta), 'dd/MM/yyyy'); 
                    }
                    if (this.dataGrid[z].fecha) {
                        this.dataGrid[z].fecha = format(new Date(this.dataGrid[z].fecha), 'dd/MM/yyyy'); 
                    }

                    if (this.dataGrid[z].comentario == null) {
                        this.dataGrid[z].comentario = "";
                    }
                    if (this.dataGrid[z].etiquetas != null) {
                        this.dataGrid[z].etiquetas = this.dataGrid[z].etiquetas;
                    }
                    if (this.dataGrid[z].cliente_edad != null) {
                        if (parseInt(this.dataGrid[z].cliente_edad) < 0) {
                            this.dataGrid[z].cliente_edad = "";
                        }
                    }

                    this.dataGrid[z].calificacionDeseada = this.dataGrid[z].calificacion;
                    this.dataGrid[z].idData = z;                    
                }
                if (this.dataGrid.length == 0 && this.etiquetaSeleccionada == "N") {
                    this.dataTrue = false;
                    this.consultaExitosa = false;

                }
                else {
                    this.consultaExitosa = false;
                    this.dataTrue = true;
                }                
                this.dataSource.data = this.dataGrid;
                this.dataSource.paginator = this.paginator;
		        this.dataSource.sort = this.sort;

                this.dataGrid2 = JSON.parse(JSON.stringify(this.dataGrid));
                this.busquedaCliente();
                if (this.primeraCarga == 0) {
                    this.consultaEtiquetas();
                }
                this._pantallaServicio.ocultarSpinner();
            }, error => {
                console.log(error);
                
            });
        }
    }
    
    busquedaCliente() {
        if (this.pruebaNombre != "") {
            const foundItem = this.dataGrid.filter((item: any) => { 
                if (item.nombre.toUpperCase().match(this.pruebaNombre.toUpperCase()) != null) {
                  return item;
                }
                if (item.email != "" && item.email != null) {
                  if (item.email.toUpperCase().match(this.pruebaNombre.toUpperCase()) != null) {
                    return item;
                  }
                }
                if (item.telefono != "" && item.telefono != null) {
                  if (item.telefono.match(this.pruebaNombre) != null) {
                    return item;
                  }
                }
                if (item.etiquetas != "" && item.etiquetas != null) {
                  if (item.etiquetas.toLowerCase().match(this.pruebaNombre.toLowerCase()) != null) {
                    return item;
                  }
                }
                
                if (this.etiquetaSeleccionada == "C") {
                    var i: any;
                  for (i in this.keyNames) {
                    if (i > 17) {
                      if (this.keyNames[i] != "pagoServicios" && this.keyNames[i] != "pagoProductos" && this.keyNames[i] != "pagoPendientes") {
                        if (item[this.keyNames[i]] != "" && item[this.keyNames[i]] != null) {
                          if (item[this.keyNames[i]].toLowerCase().match(this.pruebaNombre.toLowerCase()) != null) {
                            return item;
                          }
                        }
                      }
                    }
                  }
                }
              }, true);
            
            this.dataSource.data = foundItem;
            this.dataSource.paginator = this.paginator;
		    this.dataSource.sort = this.sort;
                          
            this.dataGrid2 = JSON.parse(JSON.stringify(foundItem));
            this.altura = this.dataGrid2.length * 30 + 45;
        }
        else {            
            this.dataSource.data = this.dataGrid;
            this.dataSource.paginator = this.paginator;
		    this.dataSource.sort = this.sort;

            this.dataGrid2 = JSON.parse(JSON.stringify(this.dataGrid));
            this.altura = this.dataGrid2.length * 30 + 45;
        }
    }
    
    nuevoCliente() {
        this._router.navigate(['catalogos/cliente-creacion-edicion'], {
            queryParams: { idCliente: 'N' },            
          });                
    }

    actualizarCliente(entity: any) {
        this._router.navigate(['catalogos/cliente-creacion-edicion'], {
            queryParams: { idCliente: entity.idCliente },            
          });        
    }

    agregarNota(entity: any) {
        this.modalNotas();
    }

    cargarCalificacion(entity: any) {
        this.guardar = false;        
        if (entity.fecha == null) {
            this._toaster.error(this.consultaClienteTranslate.clienteNoCita);            
            this.consultaCliente();
        }
        else {            
            this.cliente = JSON.parse(JSON.stringify(entity));
            this.modalCalificarCliente();
        }
    }

    dataCalificacion: any;
    validarCampos() {
        this.guardar = true;
        let camposVacios = 0;

        var valExp = RegExp("^[a-zA-Z áéíóúñÁÉÍÓÚÑ\s\r\n]*$");

        if (this.cliente.calificacionDeseada == 0) {
            $('#inputStars').removeClass('.angular-input-stars > li .active');
            $('#inputStars').addClass('estrellas');
            camposVacios++;
        }
        else {
            $('#inputStars').removeClass('estrellas');
            $('#inputStars').addClass('.angular-input-stars > li .active');
        }

        if (camposVacios == 0) {
            var params: any = {};
            params.idCliente = this.cliente.idCliente;
            //Se verifica si hay una calificación para el cliente
            this._backService.HttpPost("catalogos/cliente/cargarCalificacion", {}, params).subscribe((data) => {
               this.dataCalificacion = eval(data);
                //Si no hay una calificación se guarda una nueva, si ya hay una solo se actualiza
                if (this.dataCalificacion[0].calificacion == null) {
                    this.guardarCalificacion();
                }
                else {
                    this.actualizarCalificacion(this.dataCalificacion[0].idCalificacionCliente);
                }
            }, error => {
                
            });            
        }
    }

    guardarCalificacion() {
        var params: any = {};
        params.calificacion = this.cliente.calificacionDeseada;
        params.comentario = this.cliente.comentario;
        params.idCliente = this.cliente.idCliente;

        this._backService.HttpPost("catalogos/cliente/guardarCalificacion", {}, params).subscribe( (data) => {
            this.consultaCliente();                    
            this.modales.calificarCliente.show();
            this._router.navigate(['/consultaCliente'], {
                queryParams: {idEtiqueta: 'N'}
            });
        }, error => {

        });
    }

    actualizarCalificacion(idCalificacionCliente: any) {
        var params: any = {};
        params.calificacion = this.cliente.calificacionDeseada;
        params.comentario = this.cliente.comentario;
        params.idCalificacionCliente = idCalificacionCliente;

        this._backService.HttpPost("catalogos/cliente/actualizarCalificacion", {}, params).subscribe((data) => {
            this.consultaCliente();                    
            this.modales.calificarCliente.show();
        }, error => {

        });              
    }

    entity: any;
    validarCancelar() {
        if (this.cliente.calificacionDeseada != this.entity.calificacion || this.cliente.comentario != this.entity.comentario) {
            this.confirm(this.consultaClienteTranslate.deseaDescartar);
        }
        else {
            this.consultaCliente();
            $("#txtComentarioNota").removeClass("error-input");                    
            this.modales.calificarCliente.show();
        }      
    }

    cancelar() {
        this.consultaCliente();
        $("#txtComentarioNota").removeClass("error-input");        
        this.modales.calificarCliente.show();
    }

    onClickEstrellas(entity: any) {
        this.cargarCalificacion(entity);
    }

    focus(id: any) {
        if (this.guardar) {
            if (this.comentarioVacio) {
                $("#" + id).removeClass("error-input");
            }
        }
    }

    blur(id: any) {
        if (this.guardar) {
            var elem: any = document.getElementById(id); 
            if (elem.value == "" || elem.value == undefined) {
                $("#" + id).addClass("error-input");
            }
        }
    }

    focusEstrellas() {
        if (this.guardar) {
            $('#inputStars').removeClass('estrellas');
            $('#inputStars').addClass('.angular-input-stars > li .active');
        }
    }

    blurEstrellas() {
        if (this.guardar) {
            if (this.cliente.calificacionDeseada == 0) {
                $('#inputStars').removeClass('.angular-input-stars > li .active');
                $('#inputStars').addClass('estrellas');
            }
        }
    }

    preparacionBorrarCliente(id: any) {
        this.clienteSeleccionado = id;
        this.confirmBorrarCliente(this.consultaClienteTranslate.deseaBorrarCliente);
    };

    borrarCliente() {
        var params: any = {};
        params.idCliente = this.clienteSeleccionado;

        this._backService.HttpPost("catalogos/cliente/borrarCliente", {}, params).subscribe((data) => {
            this.consultaCliente();
        }, error => {

        });
    }

    accionImportador() {
        // $location.path("/importador/1");
        this._router.navigate(['/catalogos/importar-clientes']);
    }

    cerrarBorrarCliente() {
        
    }

    //Modales
    confirmBorrarCliente(message: any) {
        this.modales.modalConfirmBorrarCliente.show();        
        $("#modal-confirm-BorrarCliente .modal-body").html('<span class="title">' + message + '</span>');
        
    }

    /*Segunda capa*/
    confirm(message: any) {
        $("#modal-confirm .modal-body").html('<span class="title">' + message + '</span>');  
        this.modales.modalConfirm.show();
    };

    /*Primera capa*/
    modalCalificarCliente() {
        this.modales.calificarCliente.show();
    };

    /*Primera capa*/
    modalNotas() {
        this.modales.modalNotas.show();
    };

    cambiarClienteVip(opc: any, entity: any){
        entity.esVip = opc;

        var params: any = {};
        params.idCliente = entity.idCliente;
        params.esVip = opc;

        this._backService.HttpPost("catalogos/cliente/cambiarClienteVip", {}, params).subscribe((data) => {

        }, error => {

        });        
    }

    cambiarClienteSexo(idClienteSexo: any, entity: any){
        entity.idClienteSexo = idClienteSexo;

        var params: any = {};
        params.idCliente = entity.idCliente;
        params.idClienteSexo = idClienteSexo;

        this._backService.HttpPost("catalogos/cliente/cambiarClienteSexo", {}, params).subscribe((data) => {

        }, error => {

        });        
    }

    // ---------------------------------------------------------- Etiquetas ----------------------------------------------------------
    allGrupos = true;            

    // $scope.$watch('multiSelModel', function () {
    //     if ($scope.primeraCarga != 0) {
    //         $scope.consultaCliente();
    //     }
    // }, true);

    // multiSelEvents = {
    //     onItemDeselect: function (item) {
    //         this.allGrupos = false;
    //     },
    //     onItemSelect: function (item) {
    //         this.allGrupos = false;
    //     },
    //     onSelectAll: function () {
    //         this.allGrupos = false;
    //     },
    //     onDeselectAll: function () {
    //         this.allGrupos = true;
    //     }
    // };

    // multiSelSettings = {
    //     dynamicTitle: false,
    //     scrollableHeight: '500px',
    //     scrollable: true,
    // };

    // multiSelTexts = {
    //     checkAll: this.agendaTranslate.verTodos,
    //     uncheckAll: this.agendaTranslate.quitarTodos,
    //     buttonDefaultText: this.consultaClienteTranslate.etiquetaNombre
    // };

    dataEtiquetas: any;
    dataEtiquetasCopia: any;
    consultaEtiquetas() {
        this._backService.HttpPost("catalogos/cliente/consultaEtiquetasConCliente", {}, {}).subscribe((data) => {
            this.dataEtiquetas = eval(data);            
            this.dataEtiquetasCopia = JSON.parse(JSON.stringify(this.dataEtiquetas));

            this.multiSelResources = [];
            this.multiSelModel = [];
            this.dataEtiquetas.forEach((elem: any, index: any, array: any) => {
                this.multiSelResources.push({ id: elem.idEtiqueta, label: elem.nombre, index: index });
            });

            if (this.etiquetaSeleccionada != "N") {
                for (var i = 0; i < this.multiSelResources.length; i++) {
                    if(this.multiSelResources[i].id.toString() == this.etiquetaSeleccionada){
                        this.multiSelModel.push({ id: this.multiSelResources[i].id, label: this.multiSelResources[i].label, index: this.multiSelResources[i].index });
                    }
                }
            }

            setTimeout(() => {
                this.primeraCarga = 1;
                if ($("span.ui-grid-pager-row-count-label")[0] != null) {
                    $("span.ui-grid-pager-row-count-label")[0].style.display = "none";
                    $("div.ui-grid-pager-count")[0].style.display = "none";
                }
            }, 50);            
        }, error => {

        });        
    }

    // ---------------------------------------------------------- Exportar a Excel y CSV ----------------------------------------------------------

    exportToCSV(n: any) {
        //Cambiar las siguientes lineas acorde a la pantalla que requiera esta funcionalidad
        //Para agregar mas dataGrid a exportar agregue If o en caso extremo un switch
        // 1 - Grid de Clientes
        if (n == 1) {
            var titulo = this.clienteTranslate.clientes;
            var dataCopy = JSON.parse(JSON.stringify(this.dataGrid2));
            this.formatearGridClientes(dataCopy);
            let columnas: any = [];
            this.gridOptions.forEach( (x:any) => {
                columnas.push(x.header);
            });
            this.exportCsvTableView(this.dataExportar, this.gridOptions, titulo);
        }
    };

    exportCsvTableView(dataArray: any, columnas: any, nameCSV: any) {        
        if (dataArray.length > 0) {
            var dataGridOptionsExport = this.formatJSONDataCSV(columnas, dataArray);
            this.drawTableCSV(dataGridOptionsExport, nameCSV);
        } else {
            //Cambiar las siguientes lineas acorde a la pantalla que requiera esta funcionalidad
            var msj = this.reporteVentaProductoTranslate.noDatos;
            this.modalNoDatos(msj);
        }
    };

    headers: any;
    dataGridOptionsExport: any;
    formatJSONDataCSV(columns: any, data: any) {
        var i = 0;
        var lenght = 0;
        var str = "";
        this.headers = [];
        this.dataGridOptionsExport = [];
        columns.forEach( (col: any) => {
            var colString = "";
            var element = {
                name: null,
                displayName: null
            };

            if (col.name != undefined) {
                element.name = col.name;
                element.displayName = col.header;
                this.headers.push(element);
            }
        });

        data.forEach( (evento: any) => {
            var reg = '{';
            var colIndex = 0;
            columns.forEach( (col: any) => {
                if (evento[col.name] !== undefined || evento[col.name] == null) {
                    if (evento[col.name] == null || evento[col.name] == "") {
                        var espaciovacio = " ";
                        reg += "\"" + col.name + "\"" + ":" + "\"" + espaciovacio.toString().split('"').join('\'') + "\",";
                    } else {
                        reg += "\"" + col.name + "\"" + ":" + "\"" + evento[col.name.toString()].toString().split('"').join('\'') + "\",";
                    }

                }
            });
            reg = reg.substring(0, reg.length - 1);
            if ((lenght + 1) != data.length && (lenght + 1) != 0) {
                reg += "},";
            }
            else {
                reg += "}";
            }
            str += reg;
            lenght++;
        });
        var jsonObj = $.parseJSON('[' + str.replace(/(?:\r\n|\r|\n)/g, ' ') + ']');
        return jsonObj;
    };

    /*Crea un string que tendrá el formato de una tabla HTML y luego la convierte con un plugin*/
    drawTableCSV(data: any, nameCSV: any) {
        var table = '';
        var headersString = "";
        var contador = 1;
        var longitudCol = this.headers.length;
        this.headers.forEach( (header: any) => {
            if (contador != longitudCol) {
                if (header.name != "Acciones" && header.name != "Actions") {
                    headersString += header.displayName + ',';
                }                    
            } else {
                if (header.name != "Acciones" && header.name != "Actions") {
                    headersString += header.displayName;
                }
            }
            contador++;
        });
        table += headersString + "\r\n";
        var index = 0;
        data.forEach( (row: any) => {
            var dataRow = this.drawRowCSV(index, row);
            table += dataRow;
        });
        //No hay problema si se usa el mismo div, CAMBIAR EL ID POR EL DIV USADO EN SU PANTALLA
        var elem: any = document.getElementById("excelTable");
        elem.innerHTML = table;

        var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        //var isFirefox = typeof InstallTrigger !== 'undefined';

        var blob = new Blob(["\ufeff", table], { type: "text/plain;charset=utf-8" });
        saveAs(blob, nameCSV + ".csv");
    }

    /*Crea una fila en la tabla en base a la información correspondiente al json-dataEventoOperadorRow[i]*/
    drawRowCSV(i: any, dataRow: any) {
        var value = '';
        var row = "";
        if ((i % 2) == 0) {
            var contador1 = 1;
            var longitudCol1 = this.headers.length;
            this.headers.forEach( (elem: any) => {
                if (contador1 != longitudCol1) {
                    if (dataRow[elem.name] == undefined) {
                        value = '';
                    }
                    else {
                        value = dataRow[elem.name];
                    }
                    if (value.length > 0) {
                        row += value + ',';
                    }
                } else {
                    if (dataRow[elem.name] == undefined) {
                        value = '';
                    }
                    else {
                        value = dataRow[elem.name];
                    }
                    if (value.length > 0) {
                        row += value;
                    }
                }
                contador1++;
            });
        } else {
            var contador2 = 1;
            var longitudCol2 = this.headers.length;
            this.headers.forEach( (elem: any) => {
                if (contador2 != longitudCol2) {
                    if (dataRow[elem.name] == undefined) {
                        value = '';
                    }
                    else {
                        value = dataRow[elem.name];
                    }
                    row += value + ',';
                } else {
                    if (dataRow[elem.name] == undefined) {
                        value = '';
                    }
                    else {
                        value = dataRow[elem.name];
                    }
                    row += value;
                }
                contador2++;
            });
        }
        row += "\r\n";
        return row;
    }

    modalNoDatos(msj: any) {
        this.modales.modalNoDatos.show();        
        $("#modal-noDatos .modal-body").html('<span class="title">' + msj + '</span>');
    }

    exportToExcel(n: any) {
        //Cambiar las siguientes lineas acorde a la pantalla que requiera esta funcionalidad
        //Para agregar mas dataGrid a exportar agregue If o en caso extremo un switch
        // 1 - Grid de Clientes

        if (n == 1) {
            var titulo = this.clienteTranslate.clientes;
            var dataCopy = JSON.parse(JSON.stringify(this.dataGrid2));
            this.formatearGridClientes(dataCopy);
            let columnas: any = [];            
            this.exportXlsTableView(this.dataExportar, this.gridOptions, titulo);
        }
    }

    exportXlsTableView(dataArray: any, columnas: any, nameExcel: any) {        
        if (dataArray.length > 0) {
            var dataGridOptionsExport = this.formatJSONData(columnas, dataArray);
            this.drawTable(dataGridOptionsExport, nameExcel);
        } else {
            var msj = this.reporteVentaProductoTranslate.noDatos;
            this.modalNoDatos(msj);
        }
    }

    formatJSONData(columns: any, data: any) {
        var i = 0;
        var lenght = 0;
        var str = "";
        this.headers = [];
        this.dataGridOptionsExport = [];
        columns.forEach( (col: any) => {
            var colString = "";
            var element = {
                name: null,
                displayName: null
            };
            if (col.name != undefined) {
                element.name = col.name;
                element.displayName = col.header;
                this.headers.push(element);
            }
        });

        data.forEach( (evento: any) => {
            var reg = '{';
            var colIndex = 0;
            columns.forEach( (col: any) => {
                if (evento[col.name] !== undefined || evento[col.name] == null) {
                    if (evento[col.name] == null || evento[col.name] == "") {
                        var espaciovacio = " ";
                        reg += "\"" + col.name + "\"" + ":" + "\"" + espaciovacio.toString().split('"').join('\'') + "\",";
                    } else {
                        reg += "\"" + col.name + "\"" + ":" + "\"" + evento[col.name.toString()].toString().split('"').join('\'') + "\",";
                    }

                }
            });
            reg = reg.substring(0, reg.length - 1);
            if ((lenght + 1) != data.length && (lenght + 1) != 0) {
                reg += "},";
            }
            else {
                reg += "}";
            }
            str += reg;
            lenght++;
        });
        var jsonObj = $.parseJSON('[' + str.replace(/(?:\r\n|\r|\n)/g, ' ') + ']');
        return jsonObj;
    }

    /*Crea un string que tendrá el formato de una tabla HTML y luego la convierte con un plugin*/
    drawTable(data: any, nameExcel: any) {
        var table = '<table><tr>';
        var headersString = "";
        this.headers.forEach( (header: any) => {
            if (header.name != "Acciones" && header.name != "Actions") {
                headersString += '<th>' + header.displayName + '</th>';
            }
        });
        table += headersString + "</tr>";
        var index = 0;
        data.forEach( (row: any) => {
            var dataRow = this.drawRow(index, row);
            table += dataRow;
        });
        table += "</table>";
        var elem: any = document.getElementById("excelTable");
        elem.innerHTML = table;        
        var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        //var isFirefox = typeof InstallTrigger !== 'undefined';

        if (isSafari) {
            var blob = new Blob(["\ufeff", table], { type: "application/vnd.ms-excel" });
            saveAs(blob, nameExcel);
        } else {
            var blob = new Blob(["\ufeff", table], { type: "text/plain;charset=utf-8" });
            //saveAs(blob, $translate.instant('recepcionDirectaTraslate.recepcionExport'));
            saveAs(blob, nameExcel + ".xls");
        }
    }

    /*Crea una fila en la tabla en base a la información correspondiente al json-dataEventoOperadorRow[i]*/
    drawRow(i: any, dataRow: any) {
        var value = '';
        var row = "<tr>";
        if ((i % 2) == 0) {
            this.headers.forEach( (elem: any) => {
                if (dataRow[elem.name] == undefined) {
                    value = '';
                }
                else {
                    value = dataRow[elem.name];
                }
                if (value.length > 0) {
                    row += '<td>' + value + '</td>';
                }
            });
        } else {
            this.headers.forEach( (elem: any) => {
                if (dataRow[elem.name] == undefined) {
                    value = '';
                }
                else {
                    value = dataRow[elem.name];
                }
                row += '<td>' + value + '</td>';
            });
        }
        row += "</tr>";
        return row;
    }

    dataExportar: any;
    formatearGridClientes(data: any) {
        this.dataExportar = [];
        var nombreColumnas = Object.keys(this.columnasOriginales);

        for (var i = 0; i < data.length; i++) {
            var Objeto: any = {};
            Objeto.nombre = data[i].nombre || " ";
            if (data[i].telefono == null || data[i].telefono == undefined) {
                Objeto.telefono = " ";                    
            } else {
                Objeto.telefono = data[i].telefono;                
            }
            if (data[i].email == null || data[i].email == undefined) {
                Objeto.email = " ";
            } else {
                Objeto.email = data[i].email;
            }
            if (data[i].fechaNacimiento == null || data[i].fechaNacimiento == undefined) {
                Objeto.fechaNacimiento = " ";
            } else {
                // Objeto.fechaNacimiento = moment(data[i].fechaNacimiento).format('DD/MM/YYYY').toString();
                Objeto.fechaNacimiento = data[i].fechaNacimiento;
            }
            if (data[i].fecha == null || data[i].fecha == undefined) {
                Objeto.fecha = " ";
            } else {
                Objeto.fecha = data[i].fecha.substr(0, 10).replace("-", "/");
            }
            if (data[i].etiquetas == null || data[i].etiquetas == undefined) {
                Objeto.etiquetas = " ";
            } else {
                Objeto.etiquetas = data[i].etiquetas.replace(",", " /");
            }
            if (data[i].calificacion == 0) {
                Objeto.calificacion = " ";
            } else {
                Objeto.calificacion = data[i].calificacion;
            }
            if (data[i].fechaAlta == null || data[i].fechaAlta == undefined) {
                Objeto.fechaAlta = " ";
            } else {
                Objeto.fechaAlta = moment(data[i].fechaAlta).format('DD/MM/YYYY').toString();                    
            }

            var j: any;
            for (j in nombreColumnas) {
                if (j > 11) { 
                    if (data[i][nombreColumnas[j]] == null || data[i][nombreColumnas[j]] == undefined) {
                        Objeto[nombreColumnas[j]] = " ";
                    } else {
                        Objeto[nombreColumnas[j]] = data[i][nombreColumnas[j]];
                    }                        
                }
            }
            this.dataExportar.push(Objeto);
        }
    }

    inicializarCalendario() {
		        
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

        // $('input[name="daterange"]').daterangepicker({
            // startDate:  this.cliente.fechaInicio,
            // endDate: this.cliente.fechaFin,
            
            this.ranges = {
               [dias]: [moment().subtract(6, 'days'), moment()],
               [meses]: [moment().startOf('month'), moment().endOf('month')],
               [años]: [moment().startOf('year'), moment().endOf('year')]
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

        var fechaInicial = this.cliente.fechaInicio + " - " + this.cliente.fechaFin;
        this.cliente.fechas = fechaInicial;
    }

    primerCarga = true;
    cambioFecha(){        
        this._pantallaServicio.mostrarSpinner();        
        
        if (this.primerCarga) {
            var fechasAux = this.cliente.fechas.split(" - ");
            var f1 = fechasAux[0].split('/'); //Fecha de inicio de busqueda
            var f2 = fechasAux[1].split('/'); //Fecha de fin de busqueda

            this.fechaInicio = format(new Date().setFullYear(f1[2], f1[1]-1, f1[0]), 'yyyy-MM-dd HH:mm:ss' );
            this.fechaFin = format(new Date().setFullYear(f2[2], f2[1]-1, f2[0]), 'yyyy-MM-dd HH:mm:ss' );
        }else{
            this.fechaInicio = moment(new Date( this.cliente.fechas.startDate['$y'], this.cliente.fechas.startDate['$M'], this.cliente.fechas.startDate['$D'] )).startOf('day').format('YYYY-MM-DD HH:mm:ss');
            this.fechaFin = moment(new Date( this.cliente.fechas.endDate['$y'], this.cliente.fechas.endDate['$M'], this.cliente.fechas.endDate['$D'] )).endOf('day').format('YYYY-MM-DD HH:mm:ss');
        }
        this.primerCarga = false;
                
        this.cliente.fechaInicioFil = this.fechaInicio;
        this.cliente.fechaFinFil = this.fechaFin;

        this.buscar();          
        // }      
        // this.primerCarga = false;
    }

    carga: any;
    buscar() {
        var valido = true;
        var fechaLimiteInferiro = new Date(99, 1, 1);
        
        $("#fechaInicio").removeClass("error-input");
        this.cliente.errorFecha = "";
        
        $("#fechaFin").removeClass("error-input");
        this.cliente.errorFecha = "";
        
        if (valido) {            
            this.primerConsulta = false;
            this.consultaCliente();
            this.carga = true;
        }
    }

    accesosPantalla: any = {
        clientesLectura: null,
        clientesAccion: null,
        descargarClientes: null,
    };
    consultaPrincipal(){
         //Funcion para LLamar las variables de Session
        this._backService.HttpPost("catalogos/ConfiguracionPerfil/ConsultaVariblesSession", {}, {}).subscribe((data) => {
            this.accesosPantalla = {};
            var dataTemp = eval(data);
            for (var i = 0; i < dataTemp.length; i++) {
                switch(dataTemp[i].Codigo){
                    case "CLIENCAT001":
                        this.accesosPantalla.clientesLectura = dataTemp[i].Valor;
                        break;
                    case "CLIENCAT002":
                        this.accesosPantalla.clientesAccion = dataTemp[i].Valor;
                        break;
                    case "CLIENCAT003":
                        this.accesosPantalla.descargarClientes = dataTemp[i].Valor;
                        break;
                }
            }
            this.consultaCliente();
        }, error => {
            this._router.navigate(['/login']);
        });                 
    }           

    // Funciones nuevas
    seleccionarGrupos(opcion: any) {
        if(opcion == 0){
            
        }
        if(opcion == 1){
            this.multiSelModel = [...this.multiSelResources];
        }

        if(opcion == 2){
            this.multiSelModel = [];
        }

        this.primeraCarga = 1;
        this.consultaCliente();
    }

    onGridReady(params: any) {
        
    }

    llamarMetodos(columna: string, entity: any){
        if (columna == 'nombre') {
            this.actualizarCliente(entity);
        }
        if (columna == 'fecha') {
            this.mostrarDetalleCita(entity);
        }
    }

    irAAgenda(){
        this._router.navigate(['/procesos/agenda']);
    }
}