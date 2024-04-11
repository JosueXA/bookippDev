import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MethodsService } from 'src/app/core/services/methods.service';
import { PantallaService } from 'src/app/core/services/pantalla.service';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { ToasterService } from 'src/shared/toaster/toaster.service';
declare var $: any; // JQUERY
import * as bootstrap from 'bootstrap'; // BOOTSTRAP
import moment from 'moment';
import { format } from 'date-fns';
import { saveAs } from 'file-saver';
import { MatTabGroup } from '@angular/material/tabs';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { environment } from 'src/environments/environment';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { TicketService } from 'src/app/core/services/ticket.service';
import { URLEncruptService } from 'src/app/core/services/urlencrypt.service';
import { NgSignaturePadOptions, SignaturePadComponent } from '@almothafar/angular-signature-pad';
import { Clipboard } from '@angular/cdk/clipboard';

declare const InstallTrigger: any;


@Component({
  selector: 'app-cliente-creacion-edicion',
  templateUrl: './cliente-creacion-edicion.component.html',
  styleUrls: ['./cliente-creacion-edicion.component.scss', '../../../page.component.scss']
})
export class ClienteCreacionEdicionComponent implements OnInit {
  BTN_CLICK_RESPONDER_FORM: boolean = false;
  BTN_CLICK_COPIAR_LINK: boolean = false;
  public signaturePadOptions: NgSignaturePadOptions = {
    minWidth: 5,
    canvasWidth: 350,
    canvasHeight: 170
  };

  @ViewChild('signature') signature: ElementRef;
  public signaturePad: SignaturePadComponent;
  @ViewChild('tabGroup', { static: false }) tab: MatTabGroup; // Se usa esta variable para controlar las pestañas

  formulario_cliente: any = [];
  formularios: any = [];
  campos_detalle_cliente_om: any = [];
  campos_detalle_cliente_ld: any = [];
  campos_detalle_cliente_check: any = [];
  opciones_cliente_check: any = [];
  secciones_cliente_formulario: any = [];
  campos_cliente: any = [];
  textoACopiar: string = "";
  opciones: any = [];
  opciones_list: any = [];
  respuesta: any = [];
  errorValidacion: string = "";
  opciones_check: any = [];
  idFormulario: number = 0;
  linkVisible: boolean = false;
  mostrarLiga: boolean = false;

  rootScope_nSucursal: any = "";
  rootScope_dataTicket: any;
  rootScope_clientePestaniaActual: any = "#aDatosGenerales";
  rootScope_img: any = "data:image/png;base64,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…";

  //Variables de Translate
  clienteTranslate: any = {};
  informacionFiscalClienteTranslate: any = {};
  consultaClienteTranslate: any = {};
  sucursalTranslate: any = {};
  calendarioTranslate: any = {};
  reporteVentaProductoTranslate: any = {};

  cargaDatosConfigurablesHecha: any = false;

  // Modales
  modales: any = {};
  borrarNotaMsg: any;
  regresarConfirmMsg: any;

  displayedColumnsNotas: any[] = ['acciones', "fecha", "notas", "origen", "archivosRelacionados", "formulario"];
  displayedColumnsServicio: any[] = ["fechaCita", "nombreSucursal", "folio", "nombreServicio", "montoTotal", "pago", "porPagar", "nombrePersonal", "nota", "detalleCita", "receta", "archivos"];
  displayedColumnsProductos: any[] = ["fechaVenta", "nombreSucursal", "folio", "nombreProducto", "cantidadProducto", "montoTotal", "pago", "porPagar", "nombrePersonal"];
  displayedColumnsPaquetes: any[] = ["fechaVenta", "nombreSucursal", "folio", "nombrePaquete", "montoTotal", "pago", "porPagar", "nombrePersonal"];

  permisos: any = {};

  dataSourceNotas = new MatTableDataSource<any>([]);
  dataSourceServicio = new MatTableDataSource<any>([]);
  dataSourceProductos = new MatTableDataSource<any>([]);
  dataSourcePaquetes = new MatTableDataSource<any>([]);
  @ViewChild("paginacionNotas") paginator!: MatPaginator;
  @ViewChild("matSortNotas") sort!: MatSort;

  @ViewChild("paginacionServicio") paginacionServicio!: MatPaginator;
  @ViewChild("matSortServicio") matSortServicio!: MatSort;
  @ViewChild("paginacionProductos") paginacionProductos!: MatPaginator;
  @ViewChild("matSortProductos") matSortProductos!: MatSort;
  @ViewChild("paginacionPaquetes") paginacionPaquetes!: MatPaginator;
  @ViewChild("matSortPaquetes") matSortPaquetes!: MatSort;


  constructor(private _translate: TranslateService,
    private _backService: MethodsService,
    public _pantallaServicio: PantallaService,
    private _dialog: MatDialog,
    private _router: Router,
    private _toaster: ToasterService,
    private _route: ActivatedRoute,
    private matIconRegistry: MatIconRegistry,
    private clipboard: Clipboard,
    private domSanitizer: DomSanitizer,
    public _ticketService: TicketService,
    public _urlEncrypt: URLEncruptService) {
    this._translate.setDefaultLang(this._pantallaServicio.idioma);
    this._translate.use(this._pantallaServicio.idioma);

    this._translate.get('consultaClienteTranslate').subscribe((translated) => {
      this.clienteTranslate = this._translate.instant('clienteTranslate');
      this.informacionFiscalClienteTranslate = this._translate.instant('informacionFiscalClienteTranslate');
      this.consultaClienteTranslate = this._translate.instant('consultaClienteTranslate');
      this.sucursalTranslate = this._translate.instant('sucursalTranslate');
      this.calendarioTranslate = this._translate.instant('calendarioTranslate');
      this.reporteVentaProductoTranslate = this._translate.instant('reporteVentaProductoTranslate');


      this.historial.gridOptionsHistorial.columnDefs = [
        { displayName: this.consultaClienteTranslate.fechaCita, name: 'fecha', width: '100', field: 'fechaCita', headerCellClass: 'alignCenter', cellClass: 'alignCenter' },
        { displayName: this.sucursalTranslate.sucursal, name: 'sucursal', minWidth: '150', field: 'nombreSucursal', headerCellClass: 'alignCenter', cellClass: 'alignCenter' },
        { displayName: "Folio Venta", name: 'Folio', width: '100', field: 'folio', headerCellClass: 'alignCenter', cellClass: 'alignCenter', cellTemplate: '<div class="ui-grid-cell-contents ng-binding ng-scope" style="margin-top:0px;"><a class="nwLink2" href="javascript:void(0);" ng-click="$root.caja.movimientos.mostrarTicketFolioVenta(row.entity.folioOriginal)">{{COL_FIELD}}</a></div>' },
        { displayName: this.consultaClienteTranslate.servicio, name: 'Servicio', width: '200', field: 'nombreServicio', headerCellClass: 'alignCenter', cellClass: 'alignCenter' },
        { displayName: this.consultaClienteTranslate.costoCita, name: 'Costo', width: '100', field: 'montoTotal', headerCellClass: 'alignCenter', cellClass: 'alignCenter', cellFilter: 'currency' },
        { displayName: "Total Pagado", name: 'Pago', width: '100', field: 'pago', headerCellClass: 'alignCenter', cellClass: 'alignCenter', cellFilter: 'currency' },
        { displayName: "Total Por Pagar", name: 'Por Pagar', width: '100', field: 'porPagar', headerCellClass: 'alignCenter', cellClass: 'alignCenter', cellFilter: 'currency' },
        { displayName: this.consultaClienteTranslate.atendidoPor, name: 'Atendido', width: '200', field: 'nombrePersonal', headerCellClass: 'alignCenter', cellClass: 'alignCenter' },
        { displayName: "Nota", name: 'nota', minWidth: '150', field: 'nota', headerCellClass: 'alignCenter', cellClass: 'alignCenter' },
        { displayName: this.clienteTranslate.añadirServicio, name: 'DetalleCita', width: '100', field: 'idCita', headerCellClass: 'alignCenter', cellClass: 'alignCenter', cellTemplate: '<div class="ui-grid-cell-contents"><li style="cursor:pointer; color:#337dc0;" class="fa fa-edit" ng-click="grid.appScope.historial.modalPorPagar(row.entity)"  ng-if="row.entity.idCitaEstatus != 3 && row.entity.idCitaEstatus != 4"></li></div>' },
        { displayName: this.consultaClienteTranslate.receta, name: 'Receta', width: '70', field: '', headerCellClass: 'alignCenter', cellClass: 'alignCenter', cellTemplate: '<div class="ui-grid-cell-contents"><a style="cursor:pointer; color:#337dc0;" ng-click="grid.appScope.historial.receta(row.entity)">Ver</a></div>' },
        { displayName: this.consultaClienteTranslate.archivos, name: 'Archivos', width: '70', enableSorting: false, cellClass: 'alignCenter', headerCellClass: 'alignCenter2', cellTemplate: '<div class="ui-grid-cell-contents"><li id="gris{{row.entity.idCita}}" style="font-size: 1.5em; cursor:pointer; color:#cbc5c5;" class="fa fa-paperclip clip" ng-show="row.entity.archivos == 0" ng-click="grid.appScope.historial.darClicArchivos(row.entity)"></li><li id="gris{{row.entity.idCita}}" style="font-size: 1.5em; cursor:pointer; color:rgb(51, 125, 192);" class="fa fa-paperclip clip" ng-show="row.entity.archivos != 0" ng-click="grid.appScope.historial.consultaArchivos(row.entity,2)"></li></div>' }
      ];

      this.cliente_inicializarCalendario();
    });

    this.matIconRegistry.addSvgIcon('iconCasa1', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Casa1-icon.svg"));
    this.matIconRegistry.addSvgIcon('iconFlecha1DerechaPeque', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/FlechaDerechaPequena-icon.svg"));
    this.matIconRegistry.addSvgIcon('iconAgregar', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Agregar-1-icon.svg"));
    this.matIconRegistry.addSvgIcon('iconNubeSubir', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/NubeSubir-icon.svg"));
    this.matIconRegistry.addSvgIcon('iconCalendarPlus', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/CalendarioMas-icon.svg"));
    this.matIconRegistry.addSvgIcon('iconArchivo', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Archivo-icon.svg"));
    this.matIconRegistry.addSvgIcon('iconBasura', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Basura-icon.svg"));
    this.matIconRegistry.addSvgIcon('iconEditar3', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Editar3-icon.svg"));
    this.matIconRegistry.addSvgIcon('iconBuscar', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Buscar-icon.svg"));
    this.matIconRegistry.addSvgIcon('iconCalendarioEditar', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/CalendarioEditar-icon.svg"));
    this.matIconRegistry.addSvgIcon('iconFlechaAbajo', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/FlechaAbajo-icon.svg"));
    this.matIconRegistry.addSvgIcon('iconCitasDia', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/D-CitasdelDiaColor-icon.svg"));
    this.matIconRegistry.addSvgIcon('iconCitasHoy', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/D-CitasRealizadasHoyColor-icon.svg"));
    this.matIconRegistry.addSvgIcon('iconIngresosDia', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/D-IngresosdelDiaColor-icon.svg"));
    this.matIconRegistry.addSvgIcon('iconCitasCanceladas', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/D-CitasCanceladasHoyColor-icon.svg"));
    this.matIconRegistry.addSvgIcon('iconAdjuntar', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Adjuntar-icon.svg"));
    this.matIconRegistry.addSvgIcon('iconCamara', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Fotografia-icon.svg"));
    this.matIconRegistry.addSvgIcon('iconExcel', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Excel-icon.svg"));
    this.matIconRegistry.addSvgIcon('iconCruzCirculo', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/10-2-TiposdeExcepcion-icon.svg"));
    this.matIconRegistry.addSvgIcon('iconCruzCudrado', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/CruzCuadrado-icon.svg"));
    this.matIconRegistry.addSvgIcon('iconCopy', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/iconCopy.svg"));

  }

  ngOnInit(): void {
    this._route.queryParams.subscribe(params => {
      this.clienteSeleccionado = params["idCliente"];
      this.notas.idCliente = params["idCliente"];
    });

    // Permiso Acciones
    if (Object.prototype.hasOwnProperty.call(this._pantallaServicio.session, 'FORMS003')) {
      if (this._pantallaServicio.session['FORMS003'] === '1' || this._pantallaServicio.session['FORMS003'] === 'True') {
        this.permisos.responderFormulario = true;
      } else {
        this.permisos.responderFormulario = false;
      }
    } else {
      this.permisos.responderFormulario = false;
    }

    this._pantallaServicio.mostrarSpinner();

    //if ($rootScope.clientePestaniaActual == undefined) {
    if (this.rootScope_clientePestaniaActual == undefined) {
      this.rootScope_clientePestaniaActual = "#aDatosGenerales";
    }

    this.consultaPrincipal1();
    //this.primeraPestaniaActiva();
    this.consultaPrincipal();
    this.informacionFiscalSucursal_cargarFormasDePago();
    this.informacionFiscalSucursal_cargarMetodosDePago();
    this.informacionFiscalSucursal_cargarUsoCFDI();
    this.informacionFiscalSucursal_cargarRegimen();


    this.notas_consultaNotas();
    this.historial_consultaHistorial();
    this.getIndicadores();

    this.crearModales();

    this.validarSeleccionFecha();

    this.cargarPestanias();

    this.cargarFormulariosCreados();
  }

  limpiarDibujo(campo: any) {
    campo.imagenPath = '';
  }

  drawComplete(event: MouseEvent | Touch, base64: any, campo: any) {
    campo.imagenPath = base64;
  }

  drawStart(event: MouseEvent | Touch) {
  }



  cargarPestanias = async () => {
    const x = await this.cargarPestaniasDetalle();
  }

  cargarPestaniasDetalle() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        this.tab.selectedIndex = 0;
        setTimeout(() => {
          this.tab.selectedIndex = 1;
          setTimeout(() => {
            this.tab.selectedIndex = 2;
            setTimeout(() => {
              this.tab.selectedIndex = 3;
              setTimeout(() => {
                this.tab.selectedIndex = 0;
                resolve(true);
              }, 1);
            }, 1);
          }, 1);
        }, 1);
      }, 1);
    });
  }




  crearModales() {

    if ($("body").find(".modalEtiquetas").length > 1) {
      $("body").find(".modalEtiquetas")[1].remove();
    }
    this.modales.modalEtiquetas = new bootstrap.Modal($("#modalEtiquetas").appendTo("body"), {
      backdrop: "static",
      keyboard: false,
    });

    if ($("body").find(".modalEliminarEtiqueta").length > 1) {
      $("body").find(".modalEliminarEtiqueta")[1].remove();
    }
    this.modales.modalEliminarEtiqueta = new bootstrap.Modal($("#modalEliminarEtiqueta").appendTo("body"), {
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


    if ($("body").find(".modal-confirmFormularioRespuesta").length > 1) {
      $("body").find(".modal-confirmFormularioRespuesta")[1].remove();
    }
    this.modales.modalConfirmFormularioRespuesta = new bootstrap.Modal($("#modal-confirmFormularioRespuesta").appendTo("body"), {
      backdrop: "static",
      keyboard: false,
    });

    if ($("body").find(".regresar-confirm").length > 1) {
      $("body").find(".regresar-confirm")[1].remove();
    }
    this.modales.regresarConfirm = new bootstrap.Modal($("#regresar-confirm").appendTo("body"), {
      backdrop: "static",
      keyboard: false,
    });

    if ($("body").find(".modal-alert").length > 1) {
      $("body").find(".modal-alert")[1].remove();
    }
    this.modales.modalAlert = new bootstrap.Modal($("#modal-alert").appendTo("body"), {
      backdrop: "static",
      keyboard: false,
    });

    if ($("body").find(".borrar-confirm").length > 1) {
      $("body").find(".borrar-confirm")[1].remove();
    }
    this.modales.borrarConfirm = new bootstrap.Modal($("#borrar-confirm").appendTo("body"), {
      backdrop: "static",
      keyboard: false,
    });

    if ($("body").find(".ligar-clienteApp").length > 1) {
      $("body").find(".ligar-clienteApp")[1].remove();
    }
    this.modales.ligarClienteApp = new bootstrap.Modal($("#ligar-clienteApp").appendTo("body"), {
      backdrop: "static",
      keyboard: false,
    });

    if ($("body").find(".modal-historial").length > 1) {
      $("body").find(".modal-historial")[1].remove();
    }
    this.modales.modalHistorial = new bootstrap.Modal($("#modal-historial").appendTo("body"), {
      backdrop: "static",
      keyboard: false,
    });

    if ($("body").find(".modal-porPagar").length > 1) {
      $("body").find(".modal-porPagar")[1].remove();
    }
    this.modales.modalPorPagar = new bootstrap.Modal($("#modal-porPagar").appendTo("body"), {
      backdrop: "static",
      keyboard: false,
    });

    if ($("body").find(".borrar-nota").length > 1) {
      $("body").find(".borrar-nota")[1].remove();
    }
    this.modales.borrarNota = new bootstrap.Modal($("#borrar-nota").appendTo("body"), {
      backdrop: "static",
      keyboard: false,
    });

    if ($("body").find(".modalNuevaNota").length > 1) {
      $("body").find(".modalNuevaNota")[1].remove();
    }

    this.modales.modalNuevaNota = new bootstrap.Modal($("#modalNuevaNota").appendTo("body"), {
      backdrop: "static",
      keyboard: false,
    });

    if ($("body").find(".modalFormularioRespuesta").length > 1) {
      $("body").find(".modalFormularioRespuesta")[1].remove();
    }

    this.modales.modalFormularioRespuesta = new bootstrap.Modal($("#modalFormularioRespuesta").appendTo("body"), {
      backdrop: "static",
      keyboard: false,
    });

    if ($("body").find(".modalFormularioResponderUsuario").length > 1) {
      $("body").find(".modalFormularioResponderUsuario")[1].remove();
    }

    this.modales.modalFormularioResponderUsuario = new bootstrap.Modal($("#modalFormularioResponderUsuario").appendTo("body"), {
      backdrop: "static",
      keyboard: false,
    });

    if ($("body").find(".modalFotos").length > 1) {
      $("body").find(".modalFotos")[1].remove();
    }
    this.modales.modalFotos = new bootstrap.Modal($("#modalFotos").appendTo("body"), {
      backdrop: "static",
      keyboard: false,
    });

    if ($("body").find(".modalImagen").length > 1) {
      $("body").find(".modalImagen")[1].remove();
    }
    this.modales.modalImagen = new bootstrap.Modal($("#modalImagen").appendTo("body"), {
      backdrop: "static",
      keyboard: false,
    });

    if ($("body").find(".cerrarModalConfirm").length > 1) {
      $("body").find(".cerrarModalConfirm")[1].remove();
    }
    this.modales.cerrarModalConfirm = new bootstrap.Modal($("#cerrarModalConfirm").appendTo("body"), {
      backdrop: "static",
      keyboard: false,
    });

    if ($("body").find(".modal-archivos").length > 1) {
      $("body").find(".modal-archivos")[1].remove();
    }
    this.modales.modalArchivos = new bootstrap.Modal($("#modal-archivos").appendTo("body"), {
      backdrop: "static",
      keyboard: false,
    });

    if ($("body").find(".modalDocumento").length > 1) {
      $("body").find(".modalDocumento")[1].remove();
    }
    this.modales.modalDocumento = new bootstrap.Modal($("#modalDocumento").appendTo("body"), {
      backdrop: "static",
      keyboard: false,
    });

    if ($("body").find(".ticket-venta").length > 1) {
      $("body").find(".ticket-venta")[1].remove();
    }
    this.modales.ticketVenta = new bootstrap.Modal($("#ticket-venta").appendTo("body"), {
      backdrop: "static",
      keyboard: false,
    });

    if ($("body").find(".ticket-cita").length > 1) {
      $("body").find(".ticket-cita")[1].remove();
    }
    this.modales.ticketCita = new bootstrap.Modal($("#ticket-cita").appendTo("body"), {
      backdrop: "static",
      keyboard: false,
    });

    if ($("body").find(".modalEditarCampoConfigurable").length > 1) {
      $("body").find(".modalEditarCampoConfigurable")[1].remove();
    }
    this.modales.modalEditarCampoConfigurable = new bootstrap.Modal($("#modalEditarCampoConfigurable").appendTo("body"), {
      backdrop: "static",
      keyboard: false,
    });

    if ($("body").find(".modal-confirmEliminarSeccion").length > 1) {
      $("body").find(".modal-confirmEliminarSeccion")[1].remove();
    }
    this.modales.modalConfirmEliminarSeccion = new bootstrap.Modal($("#modal-confirmEliminarSeccion").appendTo("body"), {
      backdrop: "static",
      keyboard: false,
    });

    if ($("body").find(".modal-confirmEliminarCampo").length > 1) {
      $("body").find(".modal-confirmEliminarCampo")[1].remove();
    }
    this.modales.modalConfirmEliminarCampo = new bootstrap.Modal($("#modal-confirmEliminarCampo").appendTo("body"), {
      backdrop: "static",
      keyboard: false,
    });

  }

  ngAfterViewInit() {

    this.paginator._intl.itemsPerPageLabel = 'filas por pagina';
    this.dataSourceNotas.paginator = this.paginator;
    this.dataSourceNotas.sort = this.sort;

    this.paginacionServicio._intl.itemsPerPageLabel = 'filas por pagina';
    this.dataSourceServicio.paginator = this.paginacionServicio;
    this.dataSourceServicio.sort = this.matSortServicio;
    // this.dataSourceServicio.sortingDataAccessor = (item, property) => {
    //     return item[property];
    // };

    this.paginacionProductos._intl.itemsPerPageLabel = 'filas por pagina';
    this.dataSourceProductos.paginator = this.paginacionProductos;
    this.dataSourceProductos.sort = this.matSortProductos;

    this.paginacionPaquetes._intl.itemsPerPageLabel = 'filas por pagina';
    this.dataSourcePaquetes.paginator = this.paginacionPaquetes;
    this.dataSourcePaquetes.sort = this.matSortPaquetes;
    this.signaturePad.set('minWidth', 5);
    this.signaturePad.clear();
  }

  // ------------------------------------------------------------------------------------------- //
  // ---------------------------------------- Servicios ---------------------------------------- //
  // ------------------------------------------------------------------------------------------- //


  // ----------------------------------- Declaracion de variables -----------------------------------

  rootScope_fromState = "";
  fromState = this.rootScope_fromState;

  clienteSeleccionado: any;

  nombreCliente = "";
  telefonoCliente = "";
  emailCliente = "";
  fechaNacimiento = "";
  informacionFiscalSucursal: any = {};
  nota = "";
  esAlerta = false;

  activo = false;

  validNombreCliente = false;
  validTelefonoCliente = false;
  validEmailCliente = false;

  guardar = false;
  notaVacia = true;
  dataServicios = [];
  dataPersonal = [];
  aPagar: any = [];
  dataCliente: any = [];
  clienteNuevo = false;
  clienteRepetido = "";
  msgConsultaExitosa = "";
  botonAceptarConsulta = true;

  consultaExitosa = false;

  consultaHistorialExitosa = false;

  // if ($rootScope.clientePestaniaActual == undefined) {
  //     $rootScope.clientePestaniaActual = "#aDatosGenerales";
  // }    ************** Duda con esto ***********************************************

  // cargaPantallaTermianda = false;
  deshabilitarReferencia = false;
  dataClientesConfigurables: any = [];

  //MAGP 22/01/2022 Confirmación de eliminación de sección y campo configurable
  seccionSeleccionado = -1;
  campoSeleccionado = -1;
  ranges: any;
  locale: any = {
    format: 'DD/MM/YYYY'
  }
  invalidDates: moment.Moment[] = [moment().add(2, 'days'), moment().add(3, 'days'), moment().add(5, 'days')];

  hoy: any;

  //---------------------------------------------------------------------------------- Nuevo desarrollo ----------------------------------------------------------------------------------

  //Primera pestaña activa
  primeraPestaniaActiva() {
    if (this.fromState != "receta") {
      var elem1: any = document.getElementById('datosGenerales');
      var elem2: any = document.getElementById('datosFiscales');
      var elem3: any = document.getElementById('notas');
      var elem4: any = document.getElementById('historial');

      elem1.style.display = "block";
      elem2.style.display = "none";
      elem3.style.display = "none";
      elem4.style.display = "none";
      $('#liDatosGenerales').addClass('tab-pane fade in active');
      $('#liDatosFiscales').removeClass('active');
      $('#liNotas').removeClass('active');
      $('#liHistorial').removeClass('active');
    }
  }

  //Definición de las variables de cliente
  consultaPrincipal() {
    this._backService.HttpPost("procesos/agenda/Agenda/consultareferenciaAgenda", {}, {}).subscribe((data: any) => {
      this.referencia.dataReferencia = eval(data);
    }, error => {
      this._router.navigate(['/login']);
    });
  }

  // --------------- Referencias de clientes ---------------
  referencia: any = {
    id_referencia: null
  };
  dataReferencia: any = [];

  fechaInicioFil = moment(new Date()).add(-365, 'days').format('DD/MM/YYYY');
  fechaFinFil = moment(new Date()).format('DD/MM/YYYY');
  fechaInicial = this.fechaInicioFil + " - " + this.fechaFinFil;
  cliente: any = {
    imagen: "",
    activo: 1,
    nombre: "",
    prefijoPaisTelefono: "52",
    telefono: "",
    email: "",
    fechaNacimiento: "",
    observaciones: "",
    calificacion: "",
    telefonoCasa: "",
    edad: "",
    id_referencia: "",
    fechaInicioFil: moment(new Date()).add(-365, 'days').format('DD/MM/YYYY'),
    fechaFinFil: moment(new Date()).format('DD/MM/YYYY'),
    fechaInicio: moment(new Date()).add(-365, 'days').format('DD/MM/YYYY'),
    fechaFin: moment(new Date()).format('DD/MM/YYYY'),
    fechas: this.fechaInicial
  };

  completados: any = [];

  fechasAux = this.cliente.fechas.split(" - ");

  f1 = this.fechasAux[0].split('/'); //Fecha de inicio de busqueda
  f2 = this.fechasAux[1].split('/'); //Fecha de fin de busqueda

  // fechaInicio = format(new Date( this.f1[2] + "-" + this.f1[1] + "-" +  ( parseInt(this.f1[0]) + 1) ).setHours(0, 0, 0, 0), 'yyyy-MM-dd' );
  // fechaFin = format(new Date( this.f2[2] + "-" + this.f2[1] + "-" +  (parseInt(this.f2[0]) + 1) ).setHours(23, 59, 59, 0), 'yyyy-MM-dd' );

  fechaInicio = format(new Date().setFullYear(this.f1[2], this.f1[1] - 1, this.f1[0]), 'yyyy-MM-dd');
  fechaFin = format(new Date().setFullYear(this.f2[2], this.f2[1] - 1, this.f2[0]), 'yyyy-MM-dd');

  //Definición de las variables los datos configurables
  configurables: any = {};

  //Definición de las variables de las etiquetas
  etiqueta: any = {
    dataEtiquetas: [],
    dataClienteEtiquetas: [],
    etiquetaSeleccionada: "",
  };

  //Definición de las variables de los datos fiscales
  datosFiscales: any = {
    tipoPersona: 0,
    rfc: "",
    curp: "",
    nombre: "",
    pais: null,
    estado: null,
    ciudad: null,
    email: "",
    colonia: "",
    codigoPostal: "",
    calle: "",
    numero: "",
    numeroInterior: "",
    telefono: "",
    metodoPago: null,
    cfdi: null,
    formaPago: null,
    regimenFiscalReceptor: null,
    personaMoral: 1,
    personaFisica: 1,
    dataPaises: [],
    dataEstados: [],
    dataRegimen: [],
    informacionCorrecta: true
  };

  //Definicón de otras variables
  params = undefined;
  clienteConCitaRealizada = false;
  bandGuardarDatosFiscales = false;
  mostrarBotonAgregarEtiqueta = true;

  onTelefonoKeyDown(event: any) {
    const regex = /[0-9]/;
    const key = event.key || event.which;
    if (key === 'Backspace' || key === 'Space' || key === ' ' || key === 'Delete' || key === 'Tab') {
      return true;
    }
    if (!regex.test(key)) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  nuevoCliente() {
    this._router.navigate(['catalogos/cliente-creacion-edicion'], {
      queryParams: { idCliente: 'N' },
    }).then(() => {
      location.reload();
    });
  }

  // //IMAGEN
  fileFotoChange(event: any) {
    var reader = new FileReader();

    reader.onload = (e: any) => {
      var tipo = [];
      var image = new Image();
      image.src = e.target.result;
      tipo = image.src.split(";");
      if (tipo[0].toLowerCase().indexOf("png") != -1 || tipo[0].toLowerCase().indexOf("jpg") != -1 || tipo[0].toLowerCase().indexOf("jpeg") != -1) {

        setTimeout(() => {
          this.cliente.imagen = image.src;
          (document.getElementById("clienteFoto") as any).src = this.cliente.imagen;

          if ((document.getElementById("fileFoto") as any).files[0].size / 1024 > 2030) {
            this.cliente.imagen = "";
            (document.getElementById("fileFoto") as any).value = "";
            (document.getElementById("clienteFoto") as any).style.border = "3px red solid";
            (document.getElementById("clienteFoto") as any).src = "img/system/iconoPersona.png";
            $('#txtImagen').text(this.clienteTranslate.foto2MB);
          }
          else {
            // $("#btnBorrarImagen").css("display", "inline");
            (document.getElementById("clienteFoto") as any).style.border = "";
            $('#txtImagen').text("");
          }
        });
      }
      else {
        setTimeout(() => {
          this.cliente.imagen = "";
          (document.getElementById("fileFoto") as any).value = "";
          (document.getElementById("clienteFoto") as any).style.border = "3px red solid";
          (document.getElementById("clienteFoto") as any).src = "img/system/iconoPersona.png";
          $('#txtImagen').text(this.clienteTranslate.formatoImagen);
          // $("#btnBorrarImagen").css("display", "none");
        });
      }
    };

    reader.readAsDataURL(event.target.files[0]);
  };



  //Ultima función que se manda llamar cuando vas a actualizar un cliente
  cargaPantallaTermianda: any;
  secciones: any;
  cargarImagen() {
    var params: any = {};
    params.idCliente = this.clienteSeleccionado;

    this._backService.HttpPost("catalogos/Cliente/cargarImagen", {}, params).subscribe((data: any) => {
      if (data != null) {
        var evalData = "data:image/jpeg;base64," + data;
        this.dataCliente[0].imagen = evalData;
        this.cliente.imagen = evalData;

        var x: any = document.getElementById("clienteFoto");
        x.src = this.cliente.imagen;

        // $("#btnBorrarImagen").css("display", "inline");

        if (this.fromState == "receta") {
          this.cargaPantallaTermianda = true;
          //$($rootScope.clientePestaniaActual).click();
        }
        else {
          this.cargaPantallaTermianda = true;
        }
      }
      else {
        this.dataCliente[0].imagen = "";
        if (this.fromState == "receta") {
          this.cargaPantallaTermianda = true;
          //$($rootScope.clientePestaniaActual).click();
        }
        else {
          this.cargaPantallaTermianda = true;
        }
      }

      setTimeout(() => {
        for (var i = 0; i < this.secciones.length; i++) {
          for (var j = 0; j < this.secciones[i].camposConfigurables.length; j++) {
            this.cambiarAlturaDatosConfigurables(this.secciones[i].camposConfigurables[j]);
          }
        }
      }, 100);
    }, error => {
      console.log(error);
    });
  }

  borrarImagen() {
    this.cliente.imagen = "";
    var elem: any = document.getElementById("fileFoto");
    elem.value = "";
    var elem1: any = document.getElementById("clienteFoto");
    elem1.src = "assets/images/system/iconoPersona.png";
    $('#txtImagen').text("");
    var elem2: any = document.getElementById("clienteFoto");
    elem2.style.border = "";
    $("#btnBorrarImagen").css("display", "none");
  }

  // CONFIGURABLES
  consultaConfigurables() {
    this._backService.HttpPost("catalogos/Cliente/consultaConfigurables", {}, {}).subscribe((data: any) => {
      var dataConfigurables = eval(data);
      var x: any;

      for (var i = 0; i < dataConfigurables.length; i++) {
        var idSeccion = 0;
        for (var j = 0; j < this.secciones.length; j++) {
          if (dataConfigurables[i].idCampoSeccion == this.secciones[j].idCampoSeccion) {
            this.secciones[j].camposConfigurables.push(dataConfigurables[i]);
          }
        }
      }

      if (dataConfigurables.length >= 20) {
        this.configurables.limite = true;
      } else {
        this.configurables.limite = false;
      }

      //this.secciones = JSON.parse(JSON.stringify(this.secciones));

      if (this.clienteSeleccionado == "N") {
        this.consultaEtiquetas();
        //this.cargaDatosConfigurablesHecha = true;
      } else {
        this.cargarDatosConfigurables();
      }

    }, error => {

    });
  }

  guardarConfigurables(s: any) {
    var campoIgual = false;
    var params: any = {};
    params.nombre = s.nombreNuevoCampoConfigurable;
    params.idCampoSeccion = s.idCampoSeccion;

    if (s.nombreNuevoCampoConfigurable != "") {
      for (var i = 0; i < this.secciones.length; i++) {
        for (var j = 0; j < this.secciones[i].camposConfigurables.length; j++) {
          if (this.secciones[i].camposConfigurables[j].nombre.toUpperCase() == s.nombreNuevoCampoConfigurable.toUpperCase()) {
            campoIgual = true;
          }
        }
      }
    }

    if (campoIgual == true || s.nombreNuevoCampoConfigurable == "") {
      if (campoIgual == true) {
        this._toaster.error("Ya existe un Dato Configurable con ese nombre");
      }
      else {
        $("#inputCampoConfigurable" + s.idCampoSeccion).addClass("errorCampo");
      }
    }
    else {
      this._backService.HttpPost("catalogos/Cliente/guardarConfigurables", {}, params).subscribe((data: any) => {
        var evalData = eval(data);
        if (evalData.length != 0) {

          for (var j = 0; j < this.secciones.length; j++) {
            if (evalData[0].idCampoSeccion == this.secciones[j].idCampoSeccion) {
              this.secciones[j].camposConfigurables.push(evalData[0]);
            }
          }

          s.nombreNuevoCampoConfigurable = "";
          $("#inputCampoConfigurable" + s.idCampoSeccion).removeClass("errorCampo");

          var contCampConfig = 0;
          for (var i = 0; i < this.secciones.length; i++) {
            for (var j = 0; j < this.secciones[i].camposConfigurables.length; j++) {
              contCampConfig++;
            }
          }

          if (contCampConfig >= 20) {
            this.configurables.limite = true;
          }
          else {
            this.configurables.limite = false;
          }

        }
        else {
          s.nombreNuevoCampoConfigurable = "";
          this.consultaConfigurables();
        }
      }, error => {

      }, () => {
        // this.consultarSecciones();
      });
    }
  }

  eliminarConfigurables(c: any) {

    //MAGP 22/01/2022 Confirmar eliminar sección y campo
    c = this.campoSeleccionado;

    var params: any = {};
    params.idCampo = c.idCampo;

    this._backService.HttpPost("catalogos/Cliente/eliminarConfigurables", {}, params).subscribe((data: any) => {
      for (var j = 0; j < this.secciones.length; j++) {
        if (c.idCampoSeccion == this.secciones[j].idCampoSeccion) {
          for (var k = 0; k < this.secciones[j].camposConfigurables.length; k++) {
            if (this.secciones[j].camposConfigurables[k].idCampo == c.idCampo) {
              this.secciones[j].camposConfigurables.splice(k, 1);
              k--;
            }
          }
        }
      }

      var contCampConfig = 0;
      for (var i = 0; i < this.secciones.length; i++) {
        for (var j = 0; j < this.secciones[i].camposConfigurables.length; j++) {
          contCampConfig++;
        }
      }

      if (contCampConfig >= 20) {
        this.configurables.limite = true;
      }
      else {
        this.configurables.limite = false;
      }
    }, error => {

    });
  }

  //Función para obtener los valores
  cargarDatosConfigurables() {
    var params: any = {};
    params.idCliente = this.clienteSeleccionado;

    this._backService.HttpPost("catalogos/Cliente/cargarConfigurables", {}, params).subscribe((data: any) => {
      var evalData = eval(data);

      for (var i = 0; i < this.secciones.length; i++) {

        for (var j = 0; j < this.secciones[i].camposConfigurables.length; j++) {

          for (var k = 0; k < evalData.length; k++) {
            if (this.secciones[i].camposConfigurables[j].idCampo == evalData[k].idCampo) {
              this.secciones[i].camposConfigurables[j].valor = evalData[k].valor;
            }
          }

        }

      }
      this.dataClientesConfigurables = JSON.parse(JSON.stringify(evalData));

      //this.cargaDatosConfigurablesHecha = true;

      this.consultaEtiquetas();
    }, error => {

    });
  }

  cambiarAlturaDatosConfigurables(dc: any) {

    $("#txtCampoValor" + dc.idCampo)[0].style.height = "32px";
    if (dc.valor != undefined) {
      if (dc.valor.length != 0) {
        var x: any = document.getElementById("txtCampoValor" + dc.idCampo);
        $("#txtCampoValor" + dc.idCampo)[0].style.height = x.scrollHeight + "px";
      }
    }
  }

  //ETIQUETAS
  consultaEtiquetas() {
    this._backService.HttpPost("catalogos/Cliente/consultaEtiquetas", {}, {}).subscribe((data: any) => {
      this.etiqueta.dataEtiquetas = eval(data);
      this.etiqueta.dataEtiquetasCopia = JSON.parse(JSON.stringify(this.etiqueta.dataEtiquetas));

      if (this.etiqueta.dataEtiquetasCopia.length % 2 == 0) {
        var len = this.etiqueta.dataEtiquetasCopia.length;
      }
      else {
        var len = this.etiqueta.dataEtiquetasCopia.length + 1;
      }
      this.etiqueta.modalStyle = {
        "height": (((len / 2) * 30) + 30).toString() + "px"
      }
      if (this.clienteSeleccionado != "N") {
        this.consultaClienteEtiquetas();
      }
      else {
        this.cargarPaises();
      }
    }, error => {

    });
  }

  consultaClienteEtiquetas() {
    var params: any = {};
    params.idCliente = this.clienteSeleccionado;
    this._backService.HttpPost("catalogos/Cliente/consultaClienteEtiquetas", {}, params).subscribe((data: any) => {
      this.etiqueta.dataClienteEtiquetas = eval(data);
      var copia = JSON.parse(JSON.stringify(this.etiqueta.dataClienteEtiquetas));

      for (var i = 0; i < this.etiqueta.dataEtiquetas.length; i++) {
        for (var j = 0; j < copia.length; j++) {
          if (this.etiqueta.dataEtiquetas[i].idEtiqueta == copia[j].idEtiqueta) {
            this.etiqueta.dataEtiquetas.splice(i, 1);
            copia.splice(j, 1);
          }
        }
      }

      if (this.etiqueta.dataClienteEtiquetas.length < 10) {
        this.mostrarBotonAgregarEtiqueta = true;
      }
      else {
        this.mostrarBotonAgregarEtiqueta = false;
      }
      this.etiqueta.dataClienteEtiquetasCopia = JSON.parse(JSON.stringify(this.etiqueta.dataClienteEtiquetas));

      this.cargarPaises();
    }, error => {

    });
  }

  idEtiquetaSeleccionada: any;
  guardarEtiqueta() {
    this.idEtiquetaSeleccionada = "";

    if (this.etiqueta.dataClienteEtiquetas.length < 10) {
      if (typeof this.etiqueta.etiquetaSeleccionada === 'object') {
        for (var i = 0; i < this.etiqueta.dataEtiquetas.length; i++) {
          if (this.etiqueta.dataEtiquetas[i].idEtiqueta == this.etiqueta.etiquetaSeleccionada.idEtiqueta) {
            this.etiqueta.dataClienteEtiquetas.push({ idCliente: this.clienteSeleccionado, idEtiqueta: this.etiqueta.dataEtiquetas[i].idEtiqueta, nombre: this.etiqueta.dataEtiquetas[i].nombre });
            this.etiqueta.dataEtiquetas.splice(i, 1);
            this.etiqueta.etiquetaSeleccionada = "";
          }
        }
      }
      else {
        var campoIgual = false;
        for (var i = 0; i < this.etiqueta.dataEtiquetas.length; i++) {
          if (this.etiqueta.dataEtiquetas[i].nombre.toUpperCase() == this.etiqueta.etiquetaSeleccionada.toUpperCase()) {
            campoIgual = true;
            this.idEtiquetaSeleccionada = this.etiqueta.dataEtiquetas[i].idEtiqueta;
          }
        }
        if (campoIgual) {
          for (var i = 0; i < this.etiqueta.dataEtiquetas.length; i++) {
            if (this.etiqueta.dataEtiquetas[i].idEtiqueta == this.idEtiquetaSeleccionada) {
              this.etiqueta.dataClienteEtiquetas.push({ idCliente: this.clienteSeleccionado, idEtiqueta: this.etiqueta.dataEtiquetas[i].idEtiqueta, nombre: this.etiqueta.dataEtiquetas[i].nombre });
              this.etiqueta.dataEtiquetas.splice(i, 1);
              this.etiqueta.etiquetaSeleccionada = "";
            }
          }
        }
        else {
          var params: any = {};
          params.nombre = this.etiqueta.etiquetaSeleccionada;
          if (this.etiqueta.etiquetaSeleccionada != "") {
            this._backService.HttpPost("catalogos/Cliente/guardarEtiqueta", {}, params).subscribe((data: any) => {
              var evalData = eval(data);
              if (evalData != 0) {
                this.etiqueta.dataEtiquetasCopia.push(evalData[0]);
                this.etiqueta.dataClienteEtiquetas.push({ idCliente: this.clienteSeleccionado, idEtiqueta: evalData[0].idEtiqueta, nombre: evalData[0].nombre });
                this.etiqueta.etiquetaSeleccionada = "";
              }
              if (this.etiqueta.dataClienteEtiquetas.length < 10) {
                this.mostrarBotonAgregarEtiqueta = true;
              }
              else {
                this.mostrarBotonAgregarEtiqueta = false;
              }

              if (this.etiqueta.dataEtiquetasCopia.length % 2 == 0) {
                var len = this.etiqueta.dataEtiquetasCopia.length;
              }
              else {
                var len = this.etiqueta.dataEtiquetasCopia.length + 1;
              }
              this.etiqueta.modalStyle = {
                "height": (((len / 2) * 30) + 30).toString() + "px"
              }
            }, error => {

            });
          }
        }

      }

      if (this.etiqueta.dataClienteEtiquetas.length < 10) {
        this.mostrarBotonAgregarEtiqueta = true;
      }
      else {
        this.mostrarBotonAgregarEtiqueta = false;
      }

    }
    else {
      this.etiqueta.etiquetaSeleccionada = "";
    }
  }

  eliminarEtiqueta() {
    var params: any = {};
    params.idEtiqueta = this.etiqueta.etiquetaSeleccionadaEliminar;
    this._backService.HttpPost("catalogos/Cliente/eliminarEtiqueta", {}, params).subscribe((data: any) => {
      for (var i = 0; i < this.etiqueta.dataEtiquetasCopia.length; i++) {
        if (this.etiqueta.dataEtiquetasCopia[i].idEtiqueta == this.etiqueta.etiquetaSeleccionadaEliminar) {
          this.etiqueta.dataEtiquetasCopia.splice(i, 1);
        }
      }
      for (var i = 0; i < this.etiqueta.dataEtiquetas.length; i++) {
        if (this.etiqueta.dataEtiquetas[i].idEtiqueta == this.etiqueta.etiquetaSeleccionadaEliminar) {
          this.etiqueta.dataEtiquetas.splice(i, 1);
        }
      }
      for (var i = 0; i < this.etiqueta.dataClienteEtiquetas.length; i++) {
        if (this.etiqueta.dataClienteEtiquetas[i].idEtiqueta == this.etiqueta.etiquetaSeleccionadaEliminar) {
          this.etiqueta.dataClienteEtiquetas.splice(i, 1);
        }
      }
      if (this.etiqueta.dataEtiquetasCopia.length % 2 == 0) {
        var len = this.etiqueta.dataEtiquetasCopia.length;
      }
      else {
        var len = this.etiqueta.dataEtiquetasCopia.length + 1;
      }
      this.etiqueta.modalStyle = {
        "height": (((len / 2) * 30) + 30).toString() + "px"
      }
    }, error => {

    });
  }

  eliminarEtiquetaCliente(idEtiqueta: any) {
    for (var i = 0; i < this.etiqueta.dataEtiquetasCopia.length; i++) {
      if (this.etiqueta.dataEtiquetasCopia[i].idEtiqueta == idEtiqueta) {
        this.etiqueta.dataEtiquetas.push(this.etiqueta.dataEtiquetasCopia[i]);
      }
    }
    for (var i = 0; i < this.etiqueta.dataClienteEtiquetas.length; i++) {
      if (this.etiqueta.dataClienteEtiquetas[i].idEtiqueta == idEtiqueta) {
        this.etiqueta.dataClienteEtiquetas.splice(i, 1);
      }
    }

    if (this.etiqueta.dataClienteEtiquetas.length < 10) {
      this.mostrarBotonAgregarEtiqueta = true;
    }
    else {
      this.mostrarBotonAgregarEtiqueta = false;
    }
  }

  abrirModalEtiquetas() {
    this.modales.modalEtiquetas.show();
  }

  cerrarModalEtiquetas() {
    this.modales.modalEtiquetas.hide();
  }

  modalEliminarEtiqueta(idEtiqueta: any) {
    this.etiqueta.etiquetaSeleccionadaEliminar = idEtiqueta;
    $("#modalEliminarEtiqueta .modal-body").html('<span class="title">' + "¿Desea eliminar la etiqueta?" + '</span>');
    this.modales.modalEliminarEtiqueta.show();
  }

  //PAISES
  cargarPaises() {
    this._backService.HttpPost("catalogos/Pais/getPaises", {}, {}).subscribe((data: any) => {
      this.datosFiscales.dataPaises = eval(data);
      if (this.clienteSeleccionado != "N") {
        this.cargarDatosFiscales();
      }
    }, error => {

    });
  }

  //ESTADOS
  cargarEstadosPorPais() {
    if (this.datosFiscales.pais != "") {
      var params: any = {};
      params.idPais = this.datosFiscales.pais;
      this._backService.HttpPost("catalogos/Estado/cargarEstadosEnPais", {}, {}).subscribe((data: any) => {
        this.datosFiscales.dataEstados = eval(data);
      }, error => {

      });
    }
  }

  camposVacios: any;
  camposIncorrectos: any;
  //CLIENTES
  validarCamposCliente() {
    this.camposVacios = 0;
    this.camposIncorrectos = 0;
    var valExp = RegExp("^[a-zA-Z áéíóúñÁÉÍÓÚÑüÜ\s\r\n]*$");
    var telefonoExp = new RegExp("^[0-9 ()+-\sa-zA-Z áéíóúñÁÉÍÓÚÑüÜ\s\r\n]*$");
    var eMailExp = new RegExp('^(.+\@.+\..+)$');

    this.datosFiscales.informacionCorrecta = true;
    this.validarDatosFiscales();

    if (this.datosFiscales.informacionCorrecta) {
      if (this.clienteSeleccionado == "N") {
        if (this.cliente.nombre == "" || this.cliente.nombre == undefined || this.cliente.nombre == null) {
          $("#txtNombre").addClass("errorCampo");
          this.validNombreCliente = false;
        } else {
          $("#txtNombre").removeClass("errorCampo");
          this.validNombreCliente = true;
        }
        if (this.cliente.telefono == "" || this.cliente.telefono == undefined || this.cliente.telefono == null) {
          $("#txtTelefono").addClass("errorCampo");
          this.validTelefonoCliente = false;
        } else {
          var telefono = this.cliente.telefono;
          if (telefono.length >= 8) {
            $("#txtTelefono").removeClass("errorCampo");
            this.validTelefonoCliente = true;
          }
          else {
            this._toaster.error("Se requiere minimo 8 caracteres en el Telefono");
            $("#txtTelefono").addClass("errorCampo");
            this.validTelefonoCliente = false;
          }
        }

        if (this.validNombreCliente == true && this.validTelefonoCliente == true) {
          this.guardarCliente();
        }
      }
      else {
        this.actualizarCliente();
      }
    }
    else {
      this.validarDatosFiscales();

      // var elem:any = document.getElementById('datosFiscales');
      // elem.style.display = "none";
      // var elem1:any = document.getElementById('notas');
      // elem1.style.display = "none";
      // var elem2:any = document.getElementById('historial');
      // elem2.style.display = "none";
      // var elem3:any = document.getElementById('datosGenerales');
      // elem3.style.display = "block";

      // $('#liDatosGenerales').addClass('tab-pane fade in active');
      // $('#liDatosFiscales').removeClass('active');
      // $('#liNotas').removeClass('active');
      // $('#liHistorial').removeClass('active');
      $(window).scrollTop(0);
      // $("#botonGuardar").removeClass("disabled");
    }
  }

  resetCliente() {
    var inputs = document.getElementsByTagName('input');
    for (var i = 0; i < inputs.length; i += 1) {
      inputs[i].value = "";
    }
  }

  guardarCliente() {
    var params: any = {};

    params.nombre = this.cliente.nombre;
    params.activo = this.cliente.activo ? 1 : 0;
    params.prefijoPaisTelefono = Number(this.cliente.prefijoPaisTelefono).toString();
    if (params.prefijoPaisTelefono == "0") {
      params.prefijoPaisTelefono = null;
    }
    (this.cliente.telefono == "") ? params.telefono = null : params.telefono = this.cliente.telefono;
    (this.cliente.email == "") ? params.email = null : params.email = this.cliente.email;
    (this.cliente.fechaNacimiento == "") ? params.fechaNacimiento = null : params.fechaNacimiento = this.cliente.fechaNacimiento;
    (this.cliente.observaciones == "") ? params.observaciones = null : params.observaciones = this.cliente.observaciones;
    (this.cliente.telefonoCasa == "") ? params.telefonoCasa = null : params.telefonoCasa = this.cliente.telefonoCasa;
    params.idReferencia = this.referencia.id_referencia;
    if (params.idReferencia == "" || params.idReferencia == null) {
      params.idReferencia = null;
    }

    params.idCampo = [];
    params.valorCampo = [];

    for (var i = 0; i < this.secciones.length; i++) {
      for (var j = 0; j < this.secciones[i].camposConfigurables.length; j++) {
        params.idCampo.push(this.secciones[i].camposConfigurables[j].idCampo);
        if (this.secciones[i].camposConfigurables[j].valor == undefined || this.secciones[i].camposConfigurables[j].valor == null) {
          params.valorCampo.push("");
        }
        else {
          params.valorCampo.push(this.secciones[i].camposConfigurables[j].valor);
        }

      }
    }

    params.etiquetas = [];
    for (var i = 0; i < this.etiqueta.dataClienteEtiquetas.length; i++) {
      params.etiquetas[i] = this.etiqueta.dataClienteEtiquetas[i].idEtiqueta;
    }
    (this.cliente.imagen == "") ? params.baseImagen = "" : params.baseImagen = this.cliente.imagen.split(',')[1];
    if (this._pantallaServicio.idSucursal == 290) {
      this._backService.HttpPost("catalogos/Cliente/guardarCliente", {}, params).subscribe((data: any) => {
        var idCliente = eval(data);
        if (idCliente > 0 && this.bandGuardarDatosFiscales) {
          this.guardarDatosFiscales(idCliente);
        }
        else {
          if (idCliente > 0) {
            $("#botonGuardar").removeClass("disabled");
            this._toaster.success(this.clienteTranslate.registroAgrego);
            this.cliente.nombre = "";
            this.cliente.telefono = "";
            this.cliente.fechaNacimiento = "";
            this.cliente.observaciones = "";
            this.cliente.calificacion = "";
            this.cliente.edad = "";
            this.referencia.id_referencia = "";
            this.resetCliente();
            this._router.navigate(['catalogos/cliente-creacion-edicion'], {
              queryParams: { idCliente: 'N' },
            });
          }
          else {
            if (idCliente == -1) {
              this.modalDeAlerta(this.clienteTranslate.clienteTelefonoEmail);
              $("#botonGuardar").removeClass("disabled");
            }
            else {
              if (idCliente == -2) {
                this.modalDeAlerta(this.clienteTranslate.clienteRegistrCorreo);
                $("#botonGuardar").removeClass("disabled");
              }
            }
          }
        }
      }, error => {

      });
    }
    else {
      params.nombre = this.cliente.nombre;
      params.telefono = this.cliente.telefono;
      this._backService.HttpPost("catalogos/Cliente/consultarClientes", {}, params).subscribe((data: any) => {
        var datosCliente = eval(data);
        if (datosCliente.length > 0) {
          this._toaster.error("Existe un cliente con el mismo Nombre");
        }
        else {
          this._backService.HttpPost("catalogos/Cliente/guardarCliente", {}, params).subscribe((data: any) => {
            var idCliente = eval(data);
            if (idCliente > 0 && this.bandGuardarDatosFiscales) {
              this.guardarDatosFiscales(idCliente);
            }
            else {
              if (idCliente > 0) {
                $("#botonGuardar").removeClass("disabled");
                this._toaster.success(this.clienteTranslate.registroAgrego);
                this.cliente.nombre = "";
                this.cliente.telefono = "";
                this.cliente.fechaNacimiento = "";
                this.cliente.observaciones = "";
                this.cliente.calificacion = "";
                this.cliente.edad = "";
                this.referencia.id_referencia = "";
                this.resetCliente();
                this._router.navigate(['catalogos/cliente-creacion-edicion'], {
                  queryParams: { idCliente: 'N' },
                });
              }
              else {
                if (idCliente == -1) {
                  this.modalDeAlerta(this.clienteTranslate.clienteTelefonoEmail);
                  $("#botonGuardar").removeClass("disabled");
                }
                else {
                  if (idCliente == -2) {
                    this.modalDeAlerta(this.clienteTranslate.clienteRegistrCorreo);
                    $("#botonGuardar").removeClass("disabled");
                  }
                }
              }
            }
          }, error => {

          });
        }
      }, error => {

      });
    }
  }

  dataDatosFiscales: any;
  actualizarCliente() {
    var params: any = {};

    params.idCliente = this.clienteSeleccionado;
    params.nombre = this.cliente.nombre;
    params.activo = this.cliente.activo ? 1 : 0;
    params.prefijoPaisTelefono = Number(this.cliente.prefijoPaisTelefono).toString();
    if (params.prefijoPaisTelefono == "0") {
      params.prefijoPaisTelefono = null;
    }
    this.cliente.telefono == "" ? params.telefono = null : params.telefono = this.cliente.telefono;
    this.cliente.email == "" ? params.email = null : params.email = this.cliente.email;
    this.cliente.fechaNacimiento == "" ? params.fechaNacimiento = null : params.fechaNacimiento = this.cliente.fechaNacimiento;
    this.cliente.observaciones == "" ? params.observaciones = null : params.observaciones = this.cliente.observaciones;
    this.cliente.telefonoCasa == "" ? params.telefonoCasa = null : params.telefonoCasa = this.cliente.telefonoCasa;
    params.idReferencia = this.referencia.id_referencia;
    if (params.idReferencia == "" || params.idReferencia == null) {
      params.idReferencia = null;
    }
    params.idCampo = [];
    params.valorCampo = [];
    for (var i = 0; i < this.secciones.length; i++) {
      for (var j = 0; j < this.secciones[i].camposConfigurables.length; j++) {
        params.idCampo.push(this.secciones[i].camposConfigurables[j].idCampo);
        if (this.secciones[i].camposConfigurables[j].valor == undefined || this.secciones[i].camposConfigurables[j].valor == null) {
          params.valorCampo.push("");
        }
        else {
          params.valorCampo.push(this.secciones[i].camposConfigurables[j].valor);
        }

      }
    }
    params.etiquetas = [];
    for (var i = 0; i < this.etiqueta.dataClienteEtiquetas.length; i++) {
      params.etiquetas[i] = this.etiqueta.dataClienteEtiquetas[i].idEtiqueta;
    }
    this.cliente.imagen == "" ? params.baseImagen = "" : params.baseImagen = this.cliente.imagen.split(',')[1];
    this.cliente.calificacion == "" ? params.calificacion = null : params.calificacion = this.cliente.calificacion;
    params.idCalificacionCliente = this.dataCliente[0].idCalificacionCliente;
    params.metodoPago = this.datosFiscales.metodoPago;
    params.cfdi = this.datosFiscales.cfdi;
    params.formaPago = this.datosFiscales.formaPago;

    if (this.cliente.nombre == "" || this.cliente.nombre == undefined || this.cliente.nombre == null) {
      $("#txtNombre").addClass("errorCampo");
      this.validNombreCliente = false;
    } else {
      $("#txtNombre").removeClass("errorCampo");
      this.validNombreCliente = true;
    }
    if (this.cliente.telefono == "" || this.cliente.telefono == undefined || this.cliente.telefono == null) {
      $("#txtTelefono").addClass("errorCampo");
      this.validTelefonoCliente = false;
    } else {
      var telefono = this.cliente.telefono;
      if (telefono.length >= 8) {
        $("#txtTelefono").removeClass("errorCampo");
        this.validTelefonoCliente = true;
      }
      else {
        $("#txtTelefono").addClass("errorCampo");
        this.validTelefonoCliente = false;
        this._toaster.error("Se requiere minimo 8 caracteres en el Telefono");
      }
    }

    if (this.validNombreCliente == true && this.validTelefonoCliente == true) {
      if (this._pantallaServicio.idSucursal == 290) {
        this._backService.HttpPost("catalogos/Cliente/actualizarCliente", {}, params).subscribe((data: any) => {
          var idCliente = eval(data);
          if (idCliente > 0 && this.bandGuardarDatosFiscales) {
            if (this.dataDatosFiscales.length != 0) {
              this.actualizarDatosFiscales(idCliente);
            }
            else {
              this.guardarDatosFiscales(idCliente);
            }
          }
          else {
            if (idCliente > 0) {
              location.reload();
            }
            else {
              if (idCliente == -1) {
                this.modalDeAlerta(this.clienteTranslate.clienteTelefonoEmail);
                $("#botonGuardar").removeClass("disabled");
              }
              else {
                if (idCliente == -2) {
                  this.modalDeAlerta(this.clienteTranslate.clienteRegistrCorreo);
                  $("#botonGuardar").removeClass("disabled");
                }
              }
            }
          }
        }, error => {

        });

      }
      else {
        params.nombre = this.cliente.nombre;
        params.telefono = this.cliente.telefono;

        this._backService.HttpPost("catalogos/Cliente/consultarClientes", {}, params).subscribe((data: any) => {
          var datosCliente = eval(data);
          if (datosCliente.length > 0) {
            if (parseInt(this.clienteSeleccionado) != datosCliente[0].idCliente && this.cliente.nombre == datosCliente[0].nombre && this.cliente.telefono == datosCliente[0].telefono) {
              this._toaster.error("Existe un cliente con el mismo Nombre");
            }
            else {
              this._backService.HttpPost("catalogos/Cliente/actualizarCliente", {}, params).subscribe((data: any) => {
                var idCliente = eval(data);
                if (idCliente > 0 && this.bandGuardarDatosFiscales) {
                  if (this.dataDatosFiscales.length != 0) {
                    this.actualizarDatosFiscales(idCliente);
                  }
                  else {
                    this.guardarDatosFiscales(idCliente);
                  }
                }
                else {
                  if (idCliente > 0) {
                    location.reload();
                  }
                  else {
                    if (idCliente == -1) {
                      this.modalDeAlerta(this.clienteTranslate.clienteTelefonoEmail);
                      $("#botonGuardar").removeClass("disabled");
                    }
                    else {
                      if (idCliente == -2) {
                        this.modalDeAlerta(this.clienteTranslate.clienteRegistrCorreo);
                        $("#botonGuardar").removeClass("disabled");
                      }
                    }
                  }
                }
              }, error => {

              });
            }
          }
          else {

            this._backService.HttpPost("catalogos/Cliente/actualizarCliente", {}, params).subscribe((data: any) => {
              var idCliente = eval(data);
              if (idCliente > 0 && this.bandGuardarDatosFiscales) {
                if (this.dataDatosFiscales.length != 0) {
                  this.actualizarDatosFiscales(idCliente);
                }
                else {
                  this.guardarDatosFiscales(idCliente);
                }
              }
              else {
                if (idCliente > 0) {
                  location.reload();
                }
                else {
                  if (idCliente == -1) {
                    this.modalDeAlerta(this.clienteTranslate.clienteTelefonoEmail);
                    $("#botonGuardar").removeClass("disabled");
                  }
                  else {
                    if (idCliente == -2) {
                      this.modalDeAlerta(this.clienteTranslate.clienteRegistrCorreo);
                      $("#botonGuardar").removeClass("disabled");
                    }
                  }
                }
              }
            }, error => {

            });
          }
        }, error => {

        });

      }
    }
  }

  d: any;
  cargarCliente() {
    var params: any = {};
    params.idCliente = this.clienteSeleccionado;

    this._backService.HttpPost("catalogos/Cliente/cargarCliente", {}, params).subscribe((data: any) => {
      this.dataCliente = eval(data);

      if (this.dataCliente[0].activo == null) {
        this.cliente.activo = false;
      }
      else {
        this.cliente.activo = this.dataCliente[0].activo == 1 ? true : false;
      }

      this.cliente.nombre = this.dataCliente[0].nombre;

      if (this.cliente.prefijoPaisTelefono) {
        this.cliente.prefijoPaisTelefono = this.dataCliente[0].prefijoPaisTelefono;
      }
      else {
        this.cliente.prefijoPaisTelefono = "";
      }

      if (this.dataCliente[0].telefono == null) {
        this.dataCliente[0].telefono = "";
      }
      this.cliente.telefono = this.dataCliente[0].telefono;

      if (this.dataCliente[0].email == null) {
        this.dataCliente[0].email = "";
      }
      this.cliente.email = this.dataCliente[0].email;

      if (this.dataCliente[0].observaciones == null) {
        this.dataCliente[0].observaciones = "";
      }
      this.cliente.observaciones = this.dataCliente[0].observaciones;

      if (this.dataCliente[0].telefonoCasa == null) {
        this.dataCliente[0].telefonoCasa = "";
      }
      this.cliente.telefonoCasa = this.dataCliente[0].telefonoCasa;

      if (this.dataCliente[0].fechaNacimiento != null) {
        this.d = new Date(this.dataCliente[0].fechaNacimiento);
        this.d.setMinutes(this.d.getMinutes() + this.d.getTimezoneOffset());
        this.cliente.fechaNacimiento = format(new Date(this.d), "yyyy-MM-dd");

        this.cliente.edad = moment().diff(moment(this.cliente.fechaNacimiento), 'years');

        if (parseInt(this.cliente.edad) < 0) {
          this.cliente.edad = "";
        }

        if (parseInt(this.cliente.edad) < 1) {
          this.cliente.edad = moment().diff(moment(this.cliente.fechaNacimiento), 'months') + " Meses";
        } else {
          if (parseInt(this.cliente.edad) < 2) {
            var meses = (moment().diff(moment(this.cliente.fechaNacimiento), 'months') - 12);
            this.cliente.edad = "1 Año " + (moment().diff(moment(this.cliente.fechaNacimiento), 'months') - 12) + " Meses";
          }
        }
      }
      else {
        this.d = "";
        this.dataCliente[0].fechaNacimiento = this.d;
        this.cliente.fechaNacimiento = "";
      }
      if (this.dataCliente[0].idCita != null) {
        this.clienteConCitaRealizada = true;
      }
      else {
        this.clienteConCitaRealizada = false;
      }

      if (this.dataCliente[0].calificacion == null) {
        this.cliente.calificacion = "";
        this.dataCliente[0].calificacion = "";
      }
      else {
        this.cliente.calificacion = this.dataCliente[0].calificacion;
      }
      params.idCliente = this.clienteSeleccionado;

      this._backService.HttpPost("procesos/agenda/Agenda/consultaReferenciaAgendaCliente", {}, params).subscribe((data: any) => {
        this.referencia.dataReferenciaCliente = eval(data);
        if (this.referencia.dataReferenciaCliente.length > 0) {
          this.referencia.dataReferencia = this.referencia.dataReferenciaCliente;
          this.referencia.id_referencia = this.dataCliente[0].id_referencia
          this.deshabilitarReferencia = true;
        }
      }, error => {
        this._router.navigate(['/login']);
      });

      this.consultarSecciones();
    }, error => {

    });
  }

  //DATOS FISCALES
  checkRadio(tipo: any) {
    this.datosFiscales.tipoPersona = tipo;
    this.datosFiscales.rfc = "";

    if (tipo == 0) {
      (document.getElementById("dfMoral") as any).checked = false;
      (document.getElementById("txtRFCDF") as any).maxLength = 13;
      this.datosFiscales.tamanioRFC = 13;
      this.datosFiscales.personaMoral = 0;
      this.datosFiscales.personaFisica = 1;

    }
    else {
      (document.getElementById("dfFisica") as any).checked = false;
      (document.getElementById("txtRFCDF") as any).maxLength = 12;
      this.datosFiscales.tamanioRFC = 12;
      this.datosFiscales.personaMoral = 1;
      this.datosFiscales.personaFisica = 0;
    }
  };

  validarDatosFiscales() {
    // console.log(this.tab._tabs.toArray())
    this.datosFiscales.cantCamposSinContestar = 0;
    var xCamp = [{ scope: this.datosFiscales.rfc, name: 'txtRFCDF', tValid: 'rfc' },
    { scope: this.datosFiscales.nombre, name: 'txtNombreDF', tValid: 'nombre' },
    { scope: this.datosFiscales.codigoPostal, name: 'txtCodigoPostalDF', tValid: 'codigoPostal' },
    { scope: this.datosFiscales.pais, name: 'txtPaisDF', tValid: 'numero' },
    ];
    //Quita las marcas de error
    for (var i = 0; i < xCamp.length; i++) {
      if (i < 3) {
        $('#' + xCamp[i].name).removeClass("errorCampo");
        $('#error' + xCamp[i].name).text('');
      }
      else {
        $('#' + xCamp[i].name).removeClass("errorCampo");
      }
    }

    //Valida si se agregaron datos fiscales
    for (var i = 0; i < xCamp.length; i++) {
      if (i < 3) {
        if ((document.getElementById(xCamp[i].name) as any).value === "") {
          this.datosFiscales.cantCamposSinContestar++;
        }
      }
      else {
        if (xCamp[i].scope === "" || xCamp[i].scope === null) {
          this.datosFiscales.cantCamposSinContestar++;
        }
      }
    }

    //Si no se meten datos no hace validaciones
    if (this.datosFiscales.cantCamposSinContestar == xCamp.length) {
      this.bandGuardarDatosFiscales = false;
    }
    else {
      this.bandGuardarDatosFiscales = true;
      for (var i = 0; i < xCamp.length; i++) {
        if (i < 3) {
          if (xCamp[i].scope === "") {
            this.datosFiscales.informacionCorrecta = false;
          }
        }
        else {
          var x: any = document.getElementById(xCamp[i].name);
          var elem: any = document.getElementById(xCamp[i].name);
          if (x.value === "" || elem.value === null) {
            this.datosFiscales.informacionCorrecta = false;
          }
        }
      }
      for (var i = 0; i < xCamp.length; i++) {
        var elem: any = document.getElementById(xCamp[i].name);
        if (elem.value != "") {
          this.validarCampos(xCamp[i].scope, xCamp[i].name, xCamp[i].tValid, 1);
        } else {
          if (xCamp[i].scope === "" || xCamp[i].scope === null) {
            $('#' + xCamp[i].name).addClass("errorCampo");
            $('#error' + xCamp[i].name).text('');
          }
        }
      }
    }
  };

  validarCampos(campo: any, name: any, tipo: any, v: any): void {
    var numExp = RegExp("^[0-9]*$");
    var regexRazonSocial = /^[A-Za-z\sÀ-ÖØ-öø-ÿ]{1,}[\.]{0,1}[A-Za-z\sÀ-ÖØ-öø-ÿ]{0,}$/;
    var regexnombres = /^[A-Za-z\s][0-9]{1,}[\.]{0,1}[A-Za-z\s][0-9]{0,}$/;
    var regexCalle = /^[a-zA-Z1-9À-ÖØ-öø-ÿ]+\.?(( |\-)[a-zA-Z1-9À-ÖØ-öø-ÿ]+\.?)*$/;
    var regexCodigoPostal = /^([1-9]{2}|[0-9][1-9]|[1-9][0-9])[0-9]{3}$/;
    var regexTelefono = new RegExp("^(\\(\\d{2}\\)|\\d{2})?-?(\\d{2})?-?\\d{2}-?\\d{2}-?\\d{2}-?\\d{2}$");
    var regexNumero = /^\d{0,15}$/;
    var regexNumeroLetras = /^[a-zA-Z0-9]+\.?(( |\-)[a-zA-Z0-9]+\.?)*$/;
    var regexMovil = new RegExp("^(\\(\\d{3}\\)|\\d{3})?-?((\\d{3}-?\\d{3}-?\\d{2}-?\\d{2})|(\\d{2}-?\\d{2}-?\\d{2}-?\\d{2}-?\\d{2}))$");
    var regexEmail = /^[_a-z0-9-]+(.[_a-z0-9-]+)*@[a-z0-9-]+(.[a-z0-9-]+)*(.[a-z]{2,4})$/;
    var rfcFisica = /^[A-ZÑ&]{4}[0-9]{2}[0-1][0-9][0-3][0-9][A-Z0-9]{3}$/i;
    var rfcMoral = /^[A-ZÑ&]{3}[0-9]{2}[0-1][0-9][0-3][0-9][A-Z0-9]{3}$/i;

    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
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
        if (this.datosFiscales.tipoPersona == 0) { //fisico
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
      if (campo != "" && campo != null) {
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

  setFalseValidos(v: any) {
    this.datosFiscales.informacionCorrecta = false;
  }

  guardarDatosFiscales(idCliente: any) {
    var params: any = {};
    params.idInformacionFiscalSucursal = 0;
    params.nombre = this.datosFiscales.nombre;
    params.RFC = this.datosFiscales.rfc;
    params.CURP = this.datosFiscales.curp;
    if (this.datosFiscales.pais == "") {
      params.pais = 0;
    }
    else {
      params.pais = this.datosFiscales.pais;
    }
    params.calle = this.datosFiscales.calle;
    if (this.datosFiscales.estado == "" || this.datosFiscales.estado == null || this.datosFiscales.estado == undefined) {
      params.estado = 0;
    }
    else {
      params.estado = this.datosFiscales.estado;
    }
    params.colonia = this.datosFiscales.colonia;
    params.ciudad = this.datosFiscales.ciudad;
    params.codigoPostal = this.datosFiscales.codigoPostal;
    params.numeroInterior = this.datosFiscales.numeroInterior;
    params.numero = this.datosFiscales.numero;
    params.telefono = this.datosFiscales.telefono;
    params.email = this.datosFiscales.email;
    if (this.datosFiscales.tipoPersona == 0) {
      params.tipo = "Física";
    } else {
      params.tipo = "Moral";
    }
    params.idCliente = idCliente;
    params.metodoPago = this.datosFiscales.metodoPago;
    if (params.metodoPago == "" || params.metodoPago == undefined) {
      params.metodoPago = 1;
    }
    params.cfdi = this.datosFiscales.cfdi;
    if (params.cfdi == "" || params.cfdi == undefined) {
      params.cfdi = 22;
    }
    params.formaPago = this.datosFiscales.formaPago;
    if (params.formaPago == "" || params.formaPago == undefined) {
      params.formaPago = 23;
    }
    params.regimenFiscalReceptor = this.datosFiscales.regimenFiscalReceptor == null ? "" : this.datosFiscales.regimenFiscalReceptor;

    this._backService.HttpPost("procesos/informacionFiscalCliente/InformacionFiscalCliente/guardarInformacionFiscalCliente", {}, params).subscribe((data: any) => {
      // if ($stateParams.idCliente == "N") {
      if (this.clienteSeleccionado == "N") {
        this._router.navigate(['catalogos/cliente-creacion-edicion'], {
          queryParams: { idCliente: idCliente },
        }).then(() => {
          location.reload();
        });
      }
      else {
        location.reload();
      }
    }, error => {
      console.log(error);

    });
  };

  cargarDatosFiscales() {
    var params: any = {};
    params.idCliente = this.clienteSeleccionado;

    this._backService.HttpPost("procesos/informacionFiscalCliente/InformacionFiscalCliente/cargarInformacionFiscalCliente", {}, params).subscribe((data: any) => {
      this.dataDatosFiscales = eval(data);
      if (this.dataDatosFiscales.length != 0) {
        if (this.dataDatosFiscales[0].tipo == "Física") {
          this.checkRadio(0);
        }
        else {
          this.checkRadio(1);
        }
        this.datosFiscales.rfc = this.dataDatosFiscales[0].RFC;
        this.datosFiscales.nombre = this.dataDatosFiscales[0].nombre;
        this.datosFiscales.pais = this.dataDatosFiscales[0].idPais;
        this.cargarEstadosPorPais();
        this.datosFiscales.estado = this.dataDatosFiscales[0].idEstado;
        this.datosFiscales.ciudad = this.dataDatosFiscales[0].ciudad;
        this.datosFiscales.email = this.dataDatosFiscales[0].email;
        this.datosFiscales.colonia = this.dataDatosFiscales[0].colonia;
        this.datosFiscales.codigoPostal = this.dataDatosFiscales[0].codigoPostal;
        this.datosFiscales.calle = this.dataDatosFiscales[0].calle;
        this.datosFiscales.numero = this.dataDatosFiscales[0].numero;
        this.datosFiscales.numeroInterior = this.dataDatosFiscales[0].numeroInterior;
        this.datosFiscales.telefono = this.dataDatosFiscales[0].telefono;
        this.datosFiscales.metodoPago = this.dataDatosFiscales[0].idDatosFiscalesMetodoPago;
        if (this.datosFiscales.metodoPago == "" || this.datosFiscales.metodoPago == undefined) {
          this.datosFiscales.metodoPago = 1;
        }
        this.datosFiscales.formaPago = this.dataDatosFiscales[0].idDatosFiscalesFormaPago;
        if (this.datosFiscales.formaPago == "" || this.datosFiscales.formaPago == undefined) {
          this.datosFiscales.formaPago = 23;
        }
        this.datosFiscales.cfdi = this.dataDatosFiscales[0].idDatosFiscalesUsoCFDI;
        if (this.datosFiscales.cfdi == "" || this.datosFiscales.cfdi == undefined) {
          this.datosFiscales.cfdi = 22;
        }
        this.datosFiscales.regimenFiscalReceptor = this.dataDatosFiscales[0].regimenFiscalReceptor;
      }
      if (this.datosFiscales.metodoPago == "" || this.datosFiscales.metodoPago == undefined) {
        this.datosFiscales.metodoPago = 1;
      }
      if (this.datosFiscales.formaPago == "" || this.datosFiscales.formaPago == undefined) {
        this.datosFiscales.formaPago = 23;
      }
      if (this.datosFiscales.cfdi == "" || this.datosFiscales.cfdi == undefined) {
        this.datosFiscales.cfdi = 22;
      }
      if (this.datosFiscales.regimenFiscalReceptor == "" || this.datosFiscales.regimenFiscalReceptor == undefined) {
        this.datosFiscales.regimenFiscalReceptor = 1;
      }

      this.cargarImagen();
      this.onChangeDdlEstado();
    }, error => {

    });
  }

  actualizarDatosFiscales(idCliente: any) {
    var params: any = {};
    params.idInformacionFiscalSucursal = this.dataDatosFiscales[0].idInformacionFiscalSucursal;
    params.nombre = this.datosFiscales.nombre;
    params.RFC = this.datosFiscales.rfc;
    if (this.datosFiscales.pais == "" || this.datosFiscales.pais == null || this.datosFiscales.pais == undefined) {
      params.pais = 0;
    }
    else {
      params.pais = this.datosFiscales.pais;
    }
    params.calle = this.datosFiscales.calle;
    if (this.datosFiscales.estado == "" || this.datosFiscales.estado == null || this.datosFiscales.estado == undefined) {
      params.estado = 0;
    }
    else {
      params.estado = this.datosFiscales.estado;
    }
    params.colonia = this.datosFiscales.colonia;
    params.ciudad = this.datosFiscales.ciudad;
    params.codigoPostal = this.datosFiscales.codigoPostal;
    params.numeroInterior = this.datosFiscales.numeroInterior;
    params.numero = this.datosFiscales.numero;
    params.telefono = this.datosFiscales.telefono;
    params.email = this.datosFiscales.email;
    params.metodoPago = this.datosFiscales.metodoPago;
    params.cfdi = this.datosFiscales.cfdi;
    params.formaPago = this.datosFiscales.formaPago;
    params.regimenFiscalReceptor = this.datosFiscales.regimenFiscalReceptor == null ? "" : this.datosFiscales.regimenFiscalReceptor;
    if (this.datosFiscales.tipoPersona == 0) {
      params.tipo = "Física";
    } else {
      params.tipo = "Moral";
    }
    params.idCliente = idCliente;

    this._backService.HttpPost("procesos/informacionFiscalCliente/InformacionFiscalCliente/guardarInformacionFiscalCliente", {}, params).subscribe((data: any) => {
      location.reload();
    }, error => {

    });
  }

  //Obtiene las ciudades
  onChangeDdlEstado() {
    var params: any = {};
    params.idEstado = this.datosFiscales.estado;

    this._backService.HttpPost("catalogos/Ciudad/consultaCiudadesEnEstado", {}, params).subscribe((data: any) => {
      this.datosFiscales.dataCiudad = eval(data);
    }, error => {

    })
  }

  //OTRAS FUNCIONES
  txtfocus(ob: any, evento: any, tipo: any) {
    if (tipo == 'f') {
      if (this.guardar) {
        var elem: any = document.getElementById(evento.target.id);
        var txt = elem.value;
        var elem1: any = document.getElementById('error' + evento.target.id);
        var error = elem1.innerHTML;
        if (error == '' || error == undefined) {
          $("#" + evento.target.id).removeClass("errorCampo");
        }
      }
    } else {
      if (this.guardar) {
        var elem: any = document.getElementById(evento.target.id);
        var txt = elem.value;
        if (txt == "" || txt == undefined) {
          if (ob == 1) {
            $("#" + evento.target.id).addClass("errorCampo");
          }
        } else {
          var elem: any = document.getElementById('error' + evento.target.id);
          var error = elem.innerHTML;
          if (error == '' || error == undefined) {
            $("#" + evento.target.id).removeClass("errorCampo");
          }
        }
      }
    }
  };

  direccionPantalla: any;
  descartarCambios(direccion: any) {
    var cambiosEnDatosGenerales = false;
    var cambiosEnConfigurables = false;
    var cambiosEnDatosFiscales = false;
    var camposCliente: any;
    var camposDatosFiscales: any;
    if (this.clienteSeleccionado == "N") {

      // ------------------------------------ Nuevo cliente ------------------------------------

      //Cambios en Datos Generales
      camposCliente = [{ scope: this.cliente.imagen },
      { scope: this.cliente.activo },
      { scope: this.cliente.nombre },
      { scope: this.cliente.telefono },
      { scope: this.cliente.telefonoCasa },
      { scope: this.cliente.email },
      { scope: this.cliente.fechaNacimiento },
      { scope: this.cliente.observaciones },
      { scope: this.referencia.id_referencia }];

      for (var i = 0; i < camposCliente.length; i++) {
        if (i != 1) {
          if (camposCliente[i].scope != "") {
            cambiosEnDatosGenerales = true;
          }
        }
        else {
          if (camposCliente[i].scope != true) {
            cambiosEnDatosGenerales = true;
          }
        }
      }

      for (var i = 0; i < this.secciones.length; i++) {
        for (var j = 0; j < this.secciones[i].camposConfigurables.length; j++) {
          if (this.secciones[i].camposConfigurables[j].valor != undefined || this.secciones[i].camposConfigurables[j].valor != null) {
            cambiosEnConfigurables = true;
          }
        }
      }

      //Cambios en datos fiscales
      camposDatosFiscales = [{ scope: this.datosFiscales.tipoPersona },
      { scope: this.datosFiscales.rfc },
      { scope: this.datosFiscales.nombre },
      { scope: this.datosFiscales.pais },
      { scope: this.datosFiscales.estado },
      { scope: this.datosFiscales.ciudad },
      { scope: this.datosFiscales.email },
      { scope: this.datosFiscales.colonia },
      { scope: this.datosFiscales.codigoPostal },
      { scope: this.datosFiscales.calle },
      { scope: this.datosFiscales.numero },
      { scope: this.datosFiscales.numeroInterior },
      { scope: this.datosFiscales.telefono }];

      for (var i = 0; i < camposDatosFiscales.length; i++) {
        if (i != 0) {
          if (camposDatosFiscales[i].scope != "") {
            cambiosEnDatosFiscales = true;
          }
        }
        else {
          if (camposDatosFiscales[i].scope != 0) {
            cambiosEnDatosFiscales = true;
          }
        }
      }

      if (!cambiosEnDatosGenerales && !cambiosEnConfigurables && this.etiqueta.dataClienteEtiquetas.length == 0 && !cambiosEnDatosFiscales) {
        //$location.path("/" + direccion + "/N");
        this._router.navigate(['catalogos/' + direccion], {
          queryParams: { idEtiqueta: "N" },
        });
      }
      else {
        //mostrar modal para descartar cambios
        this.direccionPantalla = direccion;
        this.regresarConfirm(this.clienteTranslate.deseaDescartar);
      }
    }
    else {

      // ------------------------------------ Editar cliente ------------------------------------

      //Cambios en datos generales
      camposCliente = [{ scope: this.cliente.imagen, scope2: this.dataCliente[0].imagen },
      { scope: this.cliente.calificacion, scope2: this.dataCliente[0].calificacion },
      { scope: this.cliente.activo, scope2: this.dataCliente[0].activo },
      { scope: this.cliente.nombre, scope2: this.dataCliente[0].nombre },
      { scope: this.cliente.telefono, scope2: this.dataCliente[0].telefono },
      { scope: this.cliente.telefonoCasa, scope2: this.dataCliente[0].telefonoCasa },
      { scope: this.cliente.email, scope2: this.dataCliente[0].email },
      { scope: this.cliente.fechaNacimiento, scope2: this.d },
      { scope: this.cliente.observaciones, scope2: this.dataCliente[0].observaciones },
      { scope: this.referencia.id_referencia, scope2: this.dataCliente[0].id_referencia }];

      for (var i = 0; i < camposCliente.length; i++) {
        if (camposCliente[i].scope != camposCliente[i].scope2) {
          cambiosEnDatosGenerales = true;
        }
      }

      if (this.dataClientesConfigurables.length > 0) {
        for (var i = 0; i < this.secciones.length; i++) {
          for (var j = 0; j < this.secciones[i].camposConfigurables.length; j++) {
            if (this.secciones[i].camposConfigurables[j].idCampo != this.dataClientesConfigurables[j].idCampo) {
              if (this.secciones[i].camposConfigurables[j].valor != this.dataClientesConfigurables[j].valor) {
                cambiosEnConfigurables = true;
              }
            }
            else {
              (this.secciones[i].camposConfigurables[j].idCampo == this.dataClientesConfigurables[j].idCampo)
              if (this.secciones[i].camposConfigurables[j].valor != this.dataClientesConfigurables[j].valor) {
                cambiosEnConfigurables = true;
              }
            }
          }
        }
      }
      else {
        for (var c = 0; c < this.secciones.length; c++) {
          for (var d = 0; d < this.secciones[c].camposConfigurables.length; d++) {
            if (this.secciones[c].camposConfigurables[d].valor) {
              cambiosEnConfigurables = true
            }
          }
        }
      }

      var tipoPersona: any;
      //Cambios en datos fiscales
      if (this.dataDatosFiscales.length != 0) {

        if (this.dataDatosFiscales[0].tipo == "Física") {
          tipoPersona = 0;
        }
        else {
          tipoPersona = 1;
        }
        camposDatosFiscales = [{ scope: this.datosFiscales.tipoPersona, scope2: tipoPersona },
        { scope: this.datosFiscales.rfc, scope2: this.dataDatosFiscales[0].RFC },
        { scope: this.datosFiscales.nombre, scope2: this.dataDatosFiscales[0].nombre },
        { scope: this.datosFiscales.pais, scope2: this.dataDatosFiscales[0].idPais },
        { scope: this.datosFiscales.estado, scope2: this.dataDatosFiscales[0].idEstado },
        { scope: this.datosFiscales.ciudad, scope2: this.dataDatosFiscales[0].ciudad },
        { scope: this.datosFiscales.email, scope2: this.dataDatosFiscales[0].email },
        { scope: this.datosFiscales.colonia, scope2: this.dataDatosFiscales[0].colonia },
        { scope: this.datosFiscales.codigoPostal, scope2: this.dataDatosFiscales[0].codigoPostal },
        { scope: this.datosFiscales.calle, scope2: this.dataDatosFiscales[0].calle },
        { scope: this.datosFiscales.numero, scope2: this.dataDatosFiscales[0].numero },
        { scope: this.datosFiscales.numeroInterior, scope2: this.dataDatosFiscales[0].numeroInterior },
        { scope: this.datosFiscales.telefono, scope2: this.dataDatosFiscales[0].telefono }];

        for (var i = 0; i < camposDatosFiscales.length; i++) {
          if (camposDatosFiscales[i].scope != camposDatosFiscales[i].scope2) {
            cambiosEnDatosFiscales = true;
          }
        }
      }
      else {
        camposDatosFiscales = [{ scope: this.datosFiscales.tipoPersona },
        { scope: this.datosFiscales.rfc },
        { scope: this.datosFiscales.nombre },
        { scope: this.datosFiscales.pais },
        { scope: this.datosFiscales.estado },
        { scope: this.datosFiscales.ciudad },
        { scope: this.datosFiscales.email },
        { scope: this.datosFiscales.colonia },
        { scope: this.datosFiscales.codigoPostal },
        { scope: this.datosFiscales.calle },
        { scope: this.datosFiscales.numero },
        { scope: this.datosFiscales.numeroInterior },
        { scope: this.datosFiscales.telefono }];

        for (var i = 0; i < camposDatosFiscales.length; i++) {
          if (i != 0) {
            if (camposDatosFiscales[i].scope != "") {
              cambiosEnDatosFiscales = true;
            }
          }
          else {
            if (camposDatosFiscales[i].scope != 0) {
              cambiosEnDatosFiscales = true;
            }
          }
        }
      }

      if (!cambiosEnDatosGenerales && !cambiosEnConfigurables && this.etiqueta.dataClienteEtiquetas.length == this.etiqueta.dataClienteEtiquetasCopia.length && !cambiosEnDatosFiscales) {
        //$location.path("/" + direccion + "/N");
        this._router.navigate(['catalogos/' + direccion], {
          queryParams: { idCliente: "N" },
        });
      }
      else {
        //mostrar modal para descartar cambios.
        this.direccionPantalla = direccion;
        this.regresarConfirm(this.clienteTranslate.deseaDescartar);
      }
    }
  }

  redireccion() {
    this._router.navigate(['catalogos/' + this.direccionPantalla], {
      queryParams: { idEtiqueta: "N" },
    });
  }

  regresarConfirm(message: any) {
    this.regresarConfirmMsg = message;
    this.modales.regresarConfirm.show();
  };

  cambioAConsultaClientes(idEtiqueta: any) {
    this.descartarCambios("cliente/" + idEtiqueta);
  }

  modalDeAlerta(message: any) {
    $("#modal-alert .modal-body").html('<span class="title">' + message + '</span>');
    this.modales.modalAlert.show();
  }

  elementoDdl: any;
  onClickDdl(elemento: any) {
    this.elementoDdl = elemento;
    if (this.guardar) {
      $("#" + elemento).removeClass("errorCampo");
    }
  }

  openImg() {
    $("#fileFoto").click();
  }

  accionImportador() {
    //$location.path("/importador/1");
    this._router.navigate(['catalogos/importar-clientes/'/* + this.direccionPantalla*/]);
  }

  selectUltimaCita() {
    var params: any = {};
    params.idCliente = this.clienteSeleccionado;
    params.hora_inicio = moment().format("HH:mm");
    params.fechaInicioCita = moment().format("YYYY-MM-DD");

    this._backService.HttpPost("catalogos/Cliente/selectUltimaCita", {}, params).subscribe((data: any) => {
      var data = eval(data);
      if (data.length > 0) {
        this._router.navigate(["catalogos/receta"], {
          queryParams: {
            idCita: data[0].idCita,
            idServicio: data[0].idServicio,
            idCliente: data[0].idCliente
          },
        });
      }
      else {
        this._toaster.error("El cliente no cuenta con una cita agendada en el ultimo mes");
      }
    }, error => {

    });
  }

  calcularEdad() {
    if (this.cliente.fechaNacimiento) {
      this.cliente.edad = moment().diff(moment(this.cliente.fechaNacimiento), 'years');

      if (parseInt(this.cliente.edad) < 0) {
        this.cliente.edad = "";
      }

      if (parseInt(this.cliente.edad) < 1) {
        this.cliente.edad = moment().diff(moment(this.cliente.fechaNacimiento), 'months') + " Meses";
      } else {
        if (parseInt(this.cliente.edad) < 2) {
          var meses = (moment().diff(moment(this.cliente.fechaNacimiento), 'months') - 12);
          this.cliente.edad = "1 Año " + (moment().diff(moment(this.cliente.fechaNacimiento), 'months') - 12) + " Meses";
        }
      }
    }
    else {
      this.cliente.edad = "";
    }
  }

  isClienteNuevo: any;
  styleLiCliente: any;
  // ---------------- Función principal (La que carga primero) ----------------
  cargarPantallaCliente() {
    if (this.clienteSeleccionado == "N") {
      this.isClienteNuevo = true;
      this.styleLiCliente = {
        "width": "50%"
      };
      this.clienteConCitaRealizada = false;
      this.cargaPantallaTermianda = true;
      this.consultarSecciones();
    }
    else {
      this.isClienteNuevo = false;
      this.styleLiCliente = {
        "width": "25%"
      };
      this.cargarCliente();
    }
  }

  // -------------------------------------------------------------------------------- Notas ---------------------------------------------------------------------------------
  notas: any = {
    nuevaNota: true,
    esAlerta: false,
    showPics: false,
    showFiles: false,
    nombreCliente: "",
    comentario: "",
    idCliente: null,
    dataNotasVacia: true,
    consultaDataNotasCompleta: false,
    restanteFotos: 10485760, //Solo se permite el uso de 10 MB en disco
    restanteArchivos: 10485760, //Solo se permite el uso de 10 MB en disco
    gridOptionsNotas: {
      enableSorting: true,
      enableColumnMenus: false,
      columnDefs: [
        { name: this.consultaClienteTranslate.acciones, width: '140', enableSorting: false, cellClass: 'alignCenter', headerCellClass: 'alignCenter2', cellTemplate: '<div class="ui-grid-cell-contents" style="color:#337dc0;"><li ng-hide="row.entity.origen" style="margin-right: 30px; font-size: 1.5em; cursor:pointer;" class="fa fa-pencil" ng-click="grid.appScope.notas.cargarNota(row.entity)"></li><li ng-hide="row.entity.origen" style="font-size: 1.5em; cursor:pointer;" class="iconos fa fa-trash-o" ng-click="grid.appScope.notas.preparacionBorrarNota(row.entity)"></li></div>' },
        { displayName: this.consultaClienteTranslate.fecha, minWidth: '160', field: 'fechaAlta', headerCellClass: 'alignCenter', cellClass: 'alignCenter', type: 'date', cellFilter: 'date:"dd/MM/yyyy"' },
        { name: this.consultaClienteTranslate.notas, minWidth: '240', field: 'comentario', headerCellClass: 'alignCenter', cellClass: 'alignCenter' },
        { displayName: this.consultaClienteTranslate.origen, width: '80', field: 'origen', headerCellClass: 'alignCenter', cellClass: 'alignCenter', cellTemplate: '<div class="ui-grid-cell-contents" style=" text-align:center;"><li style="font-size: 1.5em; cursor:not-allowed;" class="fa fa-mobile" ng-show="row.entity.origen"></li></div>' },
        { name: this.consultaClienteTranslate.archivosRelacionados, width: '320', enableSorting: false, cellClass: 'alignCenter', headerCellClass: 'alignCenter2', cellTemplate: '<div class="ui-grid-cell-contents"><li id="camara{{row.entity.idNota}}" style="margin-right: 50px;color:#cbc5c5;font-size: 1.5em; cursor:pointer;" class="fa fa-camera" ng-show="row.entity.fotos == 0" ng-click="grid.appScope.notas.fotosMultiples(row.entity.idNota)"></li><li id="botonFotos{{row.entity.idNota}}" style="margin-right: 50px;color:#337dc0;font-size: 1.5em; cursor:pointer;" class="fa fa-camera" ng-show="row.entity.fotos != 0" ng-click="grid.appScope.notas.accionAbrirFotos(row.entity.idNota,2)"></li><li id="documentos{{row.entity.idCita}}" style="color:#cbc5c5;font-size: 1.5em; cursor:pointer;" class="fa fa-paperclip" ng-show="row.entity.archivos == 0" ng-click="grid.appScope.notas.archivosMultiples(row.entity.idNota)"></li><li id="botonArchivos{{row.entity.idCita}}" style="color:#337dc0;font-size: 1.5em; cursor:pointer;" class="fa fa-paperclip" ng-show="row.entity.archivos != 0" ng-click="grid.appScope.notas.accionAbrirArchivos(row.entity.idNota,2)"></li><input style=" margin-left: 10%; display: none;" type="file" id="file1" name="file[]"  accept="image/*" multiple/><input style="display: none;" type="file" id="file2" name="file[]" accept=".docx,.DOCX,.doc,.PDF,.pdf,.pptx,.PPTX,.ppt,.xlsx,.XLSX,.xls,.txt"/></div>' }
      ],
      data: 'notas.dataNotas',
      enableVerticalScrollbar: 0,
      enableHorizontalScrollbar: 2
    },
    gridOptionsArchivos: {
      enableSorting: false,
      enableColumnMenus: false,
      columnDefs: [
        { displayName: 'Descripcion', width: '440', field: 'nombre', headerCellClass: 'alignCenter', cellClass: 'alignCenter' },
        { name: this.consultaClienteTranslate.acciones, minWidth: '70', enableSorting: false, cellClass: 'alignCenter', headerCellClass: 'header-no-color', headerCellTemplate: '<div class="ui-grid-cell-contents" style="color:#337dc0;background-color: #dce6ea;"></div>', cellTemplate: '<div class="ui-grid-cell-contents" style="color:#337dc0;background-color: #dce6ea;"><li id="basura{{row.entity.idCitaArchivo}}" style="margin-left: 10.5px; font-size: 1.5em; cursor:pointer;" class="fa fa-trash-o" ng-show="!row.entity.realizoAlta" ng-click="grid.appScope.notas.deleteArchivo(row.entity)"></li></div>' }
      ],
      data: 'notas.dataArchivos',
      enableVerticalScrollbar: 0,
      enableHorizontalScrollbar: 0
    }
  };

  notas_preparacionBorrarNota(entity: any) {
    this.notas.notaParaBorrar = entity.idNota;
    this.notas_borrarConfirm(this.consultaClienteTranslate.borrarNota);
  }

  notas_borrarNota(accion: any) {
    if (accion == "si") {
      var params: any = {};
      params.idNota = this.notas.notaParaBorrar;

      this._backService.HttpPost("catalogos/Cliente/borrarNota", {}, params).subscribe((data: any) => {
        this.notas_consultaNotas();
        this.modales.borrarNota.hide();
      }, error => {

      });

    }
    else {
      this.modales.borrarNota.hide();
    }
  }

  notas_archivosMultiples(idNota: any) {
    var x: any = document.getElementById("file2");
    x.value = "";

    this.notas.idNota = idNota;
    $('#file2').click();

    var elem: any = document.getElementById("file2");
    elem.onchange = () => {
      this._pantallaServicio.mostrarSpinner();
      this.notas_readmultifiles(this.notas.idNota);
    }
  };

  notas_fotosMultiples(idNota: any) {
    (document.getElementById("file1") as any).value = "";
    this.notas.idNota = idNota;
    $('#file1').click();
    (document.getElementById("file1") as any).onchange = () => {
      this._pantallaServicio.mostrarSpinner();
      this.notas_readmultiPics(this.notas.idNota);
    }
  };

  notas_cargarFotos(idNota: any) {
    this.notas.showPics = true;
    this.notas_fotosMultiples(idNota);
    this.notas_consultaNotas();
  }

  notas_cargarArchivos(idNota: any) {
    this.notas.showFiles = true;
    this.notas_archivosMultiples(idNota);
    this.notas_consultaNotas();
  }

  notas_readmultifiles(idNota: any) {
    var infoFiles = new Array();
    this.notas.files = document.getElementById('file2');
    var nombreArchivos = new Array();
    var tamañoArchivos = new Array();
    var contador = 0;
    var idTipo = 2;
    var size = 0;
    for (var i = 0; i < this.notas.files.files.length; i++) {
      size = this.notas.files.files[i].size + size;
    }
    for (var i = 0; i < this.notas.files.files.length; i++) {

      var file = this.notas.files.files[i];
      nombreArchivos[i] = file.name;
      tamañoArchivos[i] = file.size;
      var extension = nombreArchivos[i].split('.');

      switch (extension[extension.length - 1].toLowerCase()) {
        case "docx":
        case "doc":
        case "pptx":
        case "ppt":
        case "xlsx":
        case "xls":
        case "txt":
        case "pdf":
          if (size > 4500500) {
            this.notas_alertMessage(this.consultaClienteTranslate.archivo4MB);
            i = this.notas.files.length + 1;
            this._pantallaServicio.ocultarSpinner();
          } else {
            if (size < this.notas.restanteArchivos) {
              // setup_reader(file);
              var name = file.name;
              var reader: any = new FileReader();

              var base: any;

              reader.onload = (e: any) => {
                var bin = e.target.result;
                base = reader.result.split(",");
                infoFiles[contador] = base[1];
                contador++;
                if (contador >= this.notas.files.files.length) {
                  var params: any = {};
                  // params.archivo = {
                  params.nombre = nombreArchivos[0];
                  params.contenido = infoFiles[0];
                  params.idNota = idNota;
                  params.idTipo = idTipo;
                  params.peso = tamañoArchivos[0];
                  // };

                  this._backService.HttpPost("catalogos/Cliente/addArchivo", {}, params).subscribe((data: any) => {
                    this.notas_consultaNotas();
                    if (this.notas.showFiles == true) {
                      this.notas_consultarArchivos(idNota, null);
                    }
                    else {
                      this._pantallaServicio.ocultarSpinner();
                    }
                  });


                }
              }
              reader.readAsDataURL(file);

            } else {
              this.notas_alertMessage(this.consultaClienteTranslate.sinEspacioSuficiente);
              this._pantallaServicio.ocultarSpinner();
            }
          }
          break;
        default:

          this.notas_alertMessage(this.consultaClienteTranslate.extensionInvalida);
          this._pantallaServicio.ocultarSpinner();
          i = this.notas.files.length;

          break;
      }
    }
    // function setup_reader(file:any) {

    // }
  };

  notas_readmultiPics(idNota: any) {
    var infoFiles = new Array();
    this.notas.files = document.getElementById('file1');
    var nombreArchivos = new Array();
    var tamañoArchivos = new Array();
    var contador = 0;
    var idTipo = 1;
    var size = 0;
    var loteSize = 0;
    this.completados = [];

    for (var i = 0; i < this.notas.files.files.length; i++) {
      loteSize = this.notas.files.files[i].size + loteSize;
    }
    if (loteSize > 10485760) {
      this.notas_alertMessage("No se permite subir más de 10 MB a la vez");
      this._pantallaServicio.ocultarSpinner();
    }
    else {
      for (var i = 0; i < this.notas.files.files.length; i++) {
        size = this.notas.files.files[i].size;
        var file = this.notas.files.files[i];
        nombreArchivos[i] = file.name;
        tamañoArchivos[i] = file.size;
        var extension = nombreArchivos[i].split('.');
        var exte = extension[extension.length - 1].toLowerCase();

        switch (extension[extension.length - 1].toLowerCase()) {
          case "jpg":
          case "jpeg":
          case "png":
          case "gif":
            if (size > 3145728) { //Limite de 3 MB por archivo
              this.notas_alertMessage(this.consultaClienteTranslate.archivo3MB + ". Verifique el archivo: " + file.name + "\n\n Los archivos que se completaron son: \n\n" + this.completados.toString());
              i = this.notas.files.files.length + 1;
              this._pantallaServicio.ocultarSpinner();
            } else {
              if (size < this.notas.restanteFotos) {
                // setup_reader(file);
                var name = file.name;
                var reader: any = new FileReader();
                var base;

                reader.onload = (e: any) => {
                  var bin = e.target.result;
                  base = reader.result.split(",");
                  infoFiles[contador] = base[1];
                  var comprimido = infoFiles[contador];
                  var params: any = {};
                  // params.archivo = {
                  params.nombre = nombreArchivos[contador];
                  params.contenido = comprimido;
                  params.idNota = idNota;
                  params.idTipo = idTipo;
                  params.peso = tamañoArchivos[contador];
                  // };

                  this._backService.HttpPost("catalogos/Cliente/addArchivo", {}, params).subscribe((data: any) => {
                    this.notas_consultaNotas();
                    this._pantallaServicio.ocultarSpinner();
                    if (this.notas.showPics == true) {
                      this.notas_consultarFotos(idNota, idTipo);
                    }
                  }/*, error => {
                                        this._toaster.error("Ocurrio un error durante la carga del archivo");
                                    }*/);

                  this.completados[contador] = nombreArchivos[contador];

                  contador++;
                }
                reader.readAsDataURL(file);
              } else {
                this.notas_alertMessage(this.consultaClienteTranslate.sinEspacioSuficiente);
                this._pantallaServicio.ocultarSpinner();
              }
            }
            break;
          default:
            this.notas_alertMessage(this.consultaClienteTranslate.extensionInvalida);
            i = this.notas.files.files.length;
            this._pantallaServicio.ocultarSpinner();
            break;
        }
      }
    }
    // function setup_reader(file: any) {

    // }
  };

  notas_accionNuevo() {
    this.notas_modalNotas();
  };

  notas_accionAbrirFotos(idNota: any, tipo: any) {
    this._pantallaServicio.mostrarSpinner();
    this.notas.idNota = idNota;
    this.notas_consultarFotos(idNota, tipo);
  };

  notas_accionAbrirArchivos(idNota: any, tipo: any) {
    this._pantallaServicio.mostrarSpinner();
    this.notas.idNota = idNota;
    this.notas_consultarArchivos(idNota, tipo);
  };

  notas_modalNotas() {
    this.modales.modalNuevaNota.show();
  };

  notas_modalDeFotos() {
    this._pantallaServicio.ocultarSpinner();
    this.modales.modalFotos.show();
  };

  notas_modalDeArchivos() {
    this._pantallaServicio.ocultarSpinner();
    this.modales.modalArchivos.show();
  };

  notas_cerrarModalConfirm(message: any) {
    $("#cerrarModalConfirm .modal-body").html('<span class="title">' + message + '</span>');
    this.modales.cerrarModalConfirm.hide();
  };

  notas_confirmCerrarModalNotas() {
    if (this.notas.nuevaNota == true) {
      if (this.notas.notaExistente) {
        if (this.notas.dataNota[0].esAlerta != this.notas.esAlertaNota || this.notas.dataNota[0].comentario != this.notas.comentarioNota) {
          this.notas_cerrarModalConfirm(this.consultaClienteTranslate.deseaDescartar);
        }
        else {
          this.modales.modalNuevaNota.hide();
          $("#txtComentarioNota").removeClass("errorCampo");
          this.notas.notaExistente = false;
          this.notas.agregar = false;
          this.notas.vistaPrevia = false;
          $('#onoffswitch1').removeClass('onoffswitch-inner-disable');
        }
      }
      else {
        if (this.notas.nuevaNota) {
          if (this.notas.comentarioNota != "" || this.notas.esAlertaNota != false) {
            this.notas_cerrarModalConfirm(this.consultaClienteTranslate.deseaDescartar);
          }
          else {
            this.modales.modalNuevaNota.hide();
            $("#txtComentarioNota").removeClass("errorCampo");
            this.notas.agregar = false;
          }
        }
      }
    }
    else {
      this.modales.modalNuevaNota.hide();
    }
  };

  notas_consultaNotas() {
    var params: any = {};
    //idNota se refiere al id de la nota de la cual se quieren obtener los archivos
    params.idCliente = this.clienteSeleccionado;
    //Llamada al web service para traer los nombres de los archivos
    this._backService.HttpPost("catalogos/Cliente/consultaNotas", {}, params).subscribe((data: any) => {
      this.notas.dataNotas = data != 0 ? eval(data) : []
      this.dataSourceNotas.data = data;

      this.notas.altura2 = this.notas.dataNotas.length * 30 + 45;

      this._backService.HttpPost("catalogos/Cliente/cargarCliente", {}, params).subscribe((data: any) => {
        this.notas.dataCliente = data != 0 ? eval(data) : []
        this.notas.nombreCliente = this.notas.dataCliente[0].nombre;

        this.notas.consultaDataNotasCompleta = true;

        if (this.notas.dataNotas == 0) {
          this.notas.dataNotasVacia = true;
        }
        else {
          this.notas.dataNotasVacia = false;
        }
      }, error => {

      });

    }, error => {

    });
  };

  notas_accionCancelar() {
    if (this.notas.nuevaNota == true) {
      if (this.notas.comentario != "" || this.notas.esAlerta != false) {
        this.notas_cerrarModalConfirm(this.consultaClienteTranslate.deseaDescartar);
      }
      else {
        this.notas_cerrarModal();
      }
    }
    else {
      if (this.notas.dataNota[0].esAlerta != this.notas.esAlerta || this.notas.dataNota[0].comentario != this.notas.comentario) {
        this.notas_cerrarModalConfirm(this.consultaClienteTranslate.deseaDescartar);
      }
      else {
        this.notas_cerrarModal();
      }
    }
  };

  notas_accionSalir() {
    this.notas.showPics = false;
    this.notas.showFiles = false;
    this.notas_consultaNotas();
    this.notas.dataConsultarFotos = [];
    this.notas.dataConsultarArchivos = [];
    this.notas_cerrarModal();
  };

  notas_cerrarModal() {
    this.notas.esAlerta = false;
    this.notas.comentario = "";
    this.notas.restanteFotos = 10485760; //Solo se permite el uso de 10 MB en disco
    this.notas.restanteArchivos = 10485760; //Solo se permite el uso de 10 MB en disco
    this.modales.modalNuevaNota.hide();
    this.modales.modalFotos.hide();
    this.modales.modalArchivos.hide();
    $("#txtComentarioNota").removeClass("errorCampo");
    this.notas.nuevaNota = true;
  }

  notas_cerrarModalHistorial() {
    this.modales.modalArchivos.hide();
    this.notas_consultaNotas();
    $('.ui-grid-header').css('border-bottom', '1px solid #d4d4d4');
  }

  notas_accionGuardar() {
    this.notas.agregar = true;
    if (this.notas.comentario == "") {
      $("#txtComentarioNota").addClass("errorCampo");
    }
    else {
      this.notas_guardarNota();
    }
  };

  notas_guardarNota() {
    var params: any = {};
    params.comentario = this.notas.comentario;
    params.esAlerta = this.notas.esAlerta ? 1 : 0;
    params.idCliente = this.notas.idCliente;

    this._backService.HttpPost("catalogos/Cliente/guardarNota", {}, params).subscribe((data: any) => {
      this.notas.esAlerta = false;
      this.notas.comentario = "";
      this.notas_consultaNotas();
      $("#txtComentarioNota").removeClass("errorCampo");
      this.modales.modalNuevaNota.hide();
      this.notas.agregar = false;
    }, error => {

    });
  };

  notas_consultarFotos(idNota: any, tipo: any) {
    var params: any = {};
    params.idNota = idNota;

    this._backService.HttpPost("catalogos/Cliente/fotosParaModal", {}, params).subscribe((data: any) => {
      var img = "";
      var imgReplace = "";
      var datatemp = data != 0 ? eval(data) : [];
      this.notas.restanteFotos = 10485760; //Solo se permite el uso de 10 MB en disco
      this.notas.largoGaleria = (180) * datatemp.length + 16; //Se calcula el ancho del modal para el scrollbar en x mediante la multiplicacion de 180(px que ocupa cada foto) * el numero de fotos
      this.notas.dataConsultarFotos = datatemp;
      this.notas.dataTemp = datatemp;
      for (var i = 0; i < this.notas.dataConsultarFotos.length; i++) {
        this.notas.dataConsultarFotos[i].source = "data:image/jpeg;base64," + this.notas.dataConsultarFotos[i].source;
      }
      // var isfirefox = typeof installtrigger !== 'undefined';
      // var ischrome = !!window.chrome && !!window.chrome.webstore;
      if (datatemp.length > 0 && tipo == 2) {
        this.notas_modalDeFotos();
      } else {
        if (datatemp == 0) {
          $('#modalFotos .modal-body .row-md-12').css('overflow-x', 'hidden');
        } else {
          $('#modalFotos .modal-body .row-md-12').css('overflow-x', 'auto');
        }
      }
      for (var i = 0; i < this.notas.dataTemp.length; i++) {
        this.notas.restanteFotos = this.notas.restanteFotos - this.notas.dataTemp[i].peso;
      }
      this._pantallaServicio.ocultarSpinner();
    }, error => {

    });
  };

  notas_imagenes(accion: any, id: any, item: any) {
    this._pantallaServicio.mostrarSpinner();

    if (accion == 'd') {
      window.open(environment.URL + 'handler?idImg=' + id);
      this._pantallaServicio.ocultarSpinner();
    } else {
      var params: any = {};
      params.idNotaArchivos = id;


      this._backService.HttpPost("catalogos/Cliente/fotosZoom", {}, params).subscribe((data: any) => {
        this.notas.dataFotoOriginal = eval(data);
        var anchoModal = parseInt(this.notas.dataFotoOriginal[0].ancho) + 35;
        var altoModal = parseInt(this.notas.dataFotoOriginal[0].alto) + 2;
        if (anchoModal < (screen.availWidth - 20) && altoModal < (screen.availHeight - 100)) {
          $("#imagenZoom").css({
            width: anchoModal + "px",
            height: altoModal + "px",
            margin: "auto"
          });
        } else {
          $("#imagenZoom").css({
            width: 100 + "%",
            height: 100 + "%",
            margin: "auto"
          });
          $("#imgCompleta").css({
            width: 90 + "%",
            height: 90 + "%"
          });
          $("#imgCompleta .modal-body").css({
            'max-height': (screen.availHeight - 163) + "px",
            overflow: "auto"
          });
        }
        $("#imgCompleta")[0].src = "data:image/jpeg;base64," + this.notas.dataFotoOriginal[0].source;

        this.modales.modalImagen.show();

        this._pantallaServicio.ocultarSpinner();
      }, error => (status: any) => {
        alert(status);
      });
    }
  };

  notas_documentos(accion: any, id: any) {
    if (accion == 'd') {
      // var window:any = window.open('handlers/handlerFileRequest.ashx?idImg=' + id);
      window.open(environment.URL + 'handler?idImg=' + id);
      this._pantallaServicio.ocultarSpinner();
    } else if (accion == 'v') {
      var params: any = {};
      params.idNotaArchivos = id;

      this._backService.HttpPost("catalogos/Cliente/mostrarArchivos", {}, params).subscribe((data: any) => {
        this.notas.dataArchivo = eval(data);
        // $("#documentoZoom").css({
        //     width: 100 + "%",
        //     height: 100 + "%",
        //     margin: "auto"
        // });
        // $("#documentoCompleto").css({
        //     width: 90 + "%",
        //     height: 97 + "%",
        //     backgroundColor: "white"
        // });
        var path = this.notas.dataArchivo[0].direccion.replace(/\\/g, "/");
        var extension = this.notas.dataArchivo[0].nombre.split(".");
        switch (extension[extension.length - 1].toLowerCase()) {
          case "pdf":
            $("#documentoCompleto")[0].src = "data:application/pdf;base64," + this.notas.dataArchivo[0].source;
            $("#documentoCompleto")[0].type = "application/pdf";
            break;
          case "txt":
            $("#documentoCompleto")[0].src = "data:text/plain;base64," + this.notas.dataArchivo[0].source;
            $("#documentoCompleto")[0].type = "application/txt";
            break;
          case "doc":
          case "docx":
          case "pptx":
          case "ppt":
          case "xlsx":
          case "xls":

            break;
        }

        this.modales.modalDocumento.show();

        this._pantallaServicio.ocultarSpinner();
      }, error => (status: any) => {
        alert(status);
      });

    }
  };

  notas_consultarArchivos(idNota: any, tipo: any) {
    var params: any = {};
    params.idNota = idNota;

    this._backService.HttpPost("catalogos/Cliente/archivosParaModal", {}, params).subscribe((data: any) => {
      var img = "";
      var sourceFile = "";
      var imgReplace = "";
      var dataTemp = data != 0 ? eval(data) : [];;
      this.notas.restanteArchivos = 10485760; //Solo se permite el uso de 10 MB en disco
      this.notas.dataTemp = dataTemp;
      this.notas.dataConsultarArchivos = dataTemp;

      // var isFirefox = typeof InstallTrigger !== 'undefined';
      // var isChrome = !!window.chrome && !!window.chrome.webstore;
      if (dataTemp.length > 0 && tipo == 2) {
        this.notas_modalDeArchivos();
      } else {
        this.notas_consultaNotas();
      }
      for (var i = 0; i < this.notas.dataTemp.length; i++) {
        this.notas.restanteArchivos = this.notas.restanteArchivos - this.notas.dataTemp[i].peso;

        var extension = this.notas.dataConsultarArchivos[i].nombre.split(".");
        switch (extension[extension.length - 1].toLowerCase()) {
          case "pdf":
          case "txt":
            this.notas.dataConsultarArchivos[i].permitirZoom = true;//Es pdf o txt
            break;
          default:
            this.notas.dataConsultarArchivos[i].permitirZoom = false;//No es pdf ni txt
            break;
        }
      }

      this._pantallaServicio.ocultarSpinner();
    }, error => {

    });
  };

  notas_deleteArchivo(id: any, i: any, tipo: any) {
    this._pantallaServicio.mostrarSpinner();
    var params: any = {};
    params.idNotasArchivos = id;//idNotasArchivo
    params.direccion = this.notas.dataTemp[i].direccion;//direccion path

    this._backService.HttpPost("catalogos/Cliente/deleteArchivo", {}, params).subscribe((data: any) => {
      if (tipo == 1) {
        this.notas_consultarFotos(this.notas.idNota, tipo);
      }
      else {
        this.notas_consultarArchivos(this.notas.idNota, tipo);
      }
    }, error => {

    });
  }

  notas_focus(id: any) {
    if (this.notas.agregar) {
      if (this.notas.comentarioVacio) {
        $("#" + id).removeClass("errorCampo");
      }
    }
  }

  notas_blur(id: any) {
    if (this.notas.agregar) {
      var x: any = document.getElementById(id);
      if (x.value == "" || x.value == undefined) {
        $("#" + id).addClass("errorCampo");
      }
    }
  }

  notas_borrarConfirm(message: any) {
    this.borrarNotaMsg = message;
    this.modales.borrarNota.show();
  };

  notas_alertMessage(message: any) {
    this.modales.modalAlert.show();
  }

  notas_cargarNota(entity: any) {
    //Esto es para que se pueda actualizar la nota
    this.notas.nuevaNota = false;

    var params: any = {};
    params.idCliente = this.clienteSeleccionado;
    this.notas.notaSeleccionada = entity.idNota;
    params.idNota = entity.idNota;

    this._backService.HttpPost("catalogos/Cliente/cargarNota", {}, params).subscribe((data: any) => {
      this.notas.dataNota = eval(data);
      this.notas.esAlerta = this.notas.dataNota[0].esAlerta;
      this.notas.comentario = this.notas.dataNota[0].comentario;

      this.notas_modalNotas();
    }, error => {

    });
  }

  notas_accionActualizar() {
    this.notas.agregar = true;
    if (this.notas.comentario == "") {
      $("#txtComentarioNota").addClass("errorCampo");
    }
    else {
      this.notas_actualizarNota();
    }
  };

  notas_actualizarNota() {
    var params: any = {};
    params.idNota = this.notas.notaSeleccionada;
    params.comentario = this.notas.comentario;
    params.esAlerta = this.notas.esAlerta ? 1 : 0;

    this._backService.HttpPost("catalogos/Cliente/actualizarNota", {}, params).subscribe((data: any) => {
      this.notas.esAlerta = false;
      this.notas.comentario = "";
      this.notas_consultaNotas();
      $("#txtComentarioNota").removeClass("errorCampo");
      this.modales.modalNuevaNota.hide();
      this.notas.agregar = false;
      this.notas.nuevaNota = true;
    }, error => {

    })
  }

  // -------------------------------------------------------------- Historial de citas --------------------------------------------------------------

  gridApi: any;
  altura2!: any;
  historial: any = {
    mostrarHistorial: true,
    restante: 10485760, //Solo se permite el uso de 10 MB en disco
    altura2: this.altura2,
    mostrarProductos: true,
    //Declaración del grid
    gridOptionsHistorial: {
      paginationPageSizes: [15, 50, 100],
      paginationPageSize: 15,
      enableSorting: true,
      enableColumnMenus: false,
      enableVerticalScrollbar: 0,
      enableHorizontalScrollbar: 2,
      // columnDefs: [
      //   { displayName: this.consultaClienteTranslate.fechaCita, name: 'fecha', width: '100', field: 'fechaCita', headerCellClass: 'alignCenter', cellClass: 'alignCenter' },
      //   { displayName: this.sucursalTranslate.sucursal, name: 'sucursal', minWidth: '150', field: 'nombreSucursal', headerCellClass: 'alignCenter', cellClass: 'alignCenter' },
      //   { displayName: "Folio Venta", name: 'Folio', width: '100', field: 'folio', headerCellClass: 'alignCenter', cellClass: 'alignCenter', cellTemplate: '<div class="ui-grid-cell-contents ng-binding ng-scope" style="margin-top:0px;"><a class="nwLink2" href="javascript:void(0);" ng-click="$root.caja.movimientos.mostrarTicketFolioVenta(row.entity.folioOriginal)">{{COL_FIELD}}</a></div>' },
      //   { displayName: this.consultaClienteTranslate.servicio, name: 'Servicio', width: '200', field: 'nombreServicio', headerCellClass: 'alignCenter', cellClass: 'alignCenter' },
      //   { displayName: this.consultaClienteTranslate.costoCita, name: 'Costo', width: '100', field: 'montoTotal', headerCellClass: 'alignCenter', cellClass: 'alignCenter', cellFilter: 'currency' },
      //   { displayName: "Total Pagado", name: 'Pago', width: '100', field: 'pago', headerCellClass: 'alignCenter', cellClass: 'alignCenter', cellFilter: 'currency' },
      //   { displayName: "Total Por Pagar", name: 'Por Pagar', width: '100', field: 'porPagar', headerCellClass: 'alignCenter', cellClass: 'alignCenter', cellFilter: 'currency' },
      //   { displayName: this.consultaClienteTranslate.atendidoPor, name: 'Atendido', width: '200', field: 'nombrePersonal', headerCellClass: 'alignCenter', cellClass: 'alignCenter' },
      //   { displayName: "Nota", name: 'nota', minWidth: '150', field: 'nota', headerCellClass: 'alignCenter', cellClass: 'alignCenter' },
      //   { displayName: this.clienteTranslate.añadirServicio, name: 'DetalleCita', width: '100', field: 'idCita', headerCellClass: 'alignCenter', cellClass: 'alignCenter', cellTemplate: '<div class="ui-grid-cell-contents"><li style="cursor:pointer; color:#337dc0;" class="fa fa-edit" ng-click="grid.appScope.historial.modalPorPagar(row.entity)"  ng-if="row.entity.idCitaEstatus != 3 && row.entity.idCitaEstatus != 4"></li></div>' },
      //   { displayName: this.consultaClienteTranslate.receta, name: 'Receta', width: '70', field: '', headerCellClass: 'alignCenter', cellClass: 'alignCenter', cellTemplate: '<div class="ui-grid-cell-contents"><a style="cursor:pointer; color:#337dc0;" ng-click="grid.appScope.historial.receta(row.entity)">Ver</a></div>' },
      //   { displayName: this.consultaClienteTranslate.archivos, name: 'Archivos', width: '70', enableSorting: false, cellClass: 'alignCenter', headerCellClass: 'alignCenter2', cellTemplate: '<div class="ui-grid-cell-contents"><li id="gris{{row.entity.idCita}}" style="font-size: 1.5em; cursor:pointer; color:#cbc5c5;" class="fa fa-paperclip clip" ng-show="row.entity.archivos == 0" ng-click="grid.appScope.historial.darClicArchivos(row.entity)"></li><li id="gris{{row.entity.idCita}}" style="font-size: 1.5em; cursor:pointer; color:rgb(51, 125, 192);" class="fa fa-paperclip clip" ng-show="row.entity.archivos != 0" ng-click="grid.appScope.historial.consultaArchivos(row.entity,2)"></li></div>' }
      // ],
      data: 'historial.dataHistorial',
      onRegisterApi: (gridApi: any) => {
        this.gridApi = gridApi;
        gridApi.pagination.on.paginationChanged((newPage: any, pageSize: any) => {
          this.pageSize = pageSize;
          this.historial.altura2 = this.pageSize * 30 + 77;
        });
      }
    },
    gridOptionsArchivos: {
      enableSorting: false,
      enableColumnMenus: false,
      enableVerticalScrollbar: 0,
      enableHorizontalScrollbar: 0,
      columnDefs: [
        { displayName: 'Descripcion', width: '440', field: 'nombre', headerCellClass: 'alignCenter', cellClass: 'alignCenter' },
        { name: 'Acciones', minWidth: '70', enableSorting: false, cellClass: 'alignCenter', headerCellClass: 'header-no-color', headerCellTemplate: '<div class="ui-grid-cell-contents" style="color:#337dc0;background-color: #dce6ea;"></div>', cellTemplate: '<div class="ui-grid-cell-contents" style="color:#337dc0;background-color: #dce6ea;"><li id="basura{{row.entity.idCitaArchivo}}" style="margin-left: 10.5px; font-size: 1.5em; cursor:pointer;" class="fa fa-trash-o" ng-show="!row.entity.realizoAlta" ng-click="grid.appScope.historial.deleteArchivo(row.entity)"></li></div>' }
      ],
      data: 'historial.dataArchivos'
    },
    entityTemp: null,
    idCitaModal: null,
    gridProductos: {
      paginationPageSizes: [15, 50, 100],
      paginationPageSize: 15,
      enableSorting: true,
      enableColumnMenus: false,
      layout: 'fit',
      columnDefs: [
        { displayName: 'Fecha', name: 'fechaVenta', width: '100', field: 'fechaVenta', headerCellClass: 'alignCenter', cellClass: 'alignCenter' },
        { displayName: "Sucursal", name: "sucursal", width: '150', field: 'nombreSucursal', headerCellClass: 'alignCenter', cellClass: 'alignCenter' },
        { displayName: "Folio Venta", name: 'Folio', width: '100', field: 'folio', headerCellClass: 'alignCenter', cellClass: 'alignCenter', cellTemplate: '<div class="ui-grid-cell-contents ng-binding ng-scope" style="margin-top:0px;"><a class="nwLink2" href="javascript:void(0);" ng-click="$root.caja.movimientos.mostrarTicketFolioVenta(row.entity.folioOriginal)">{{COL_FIELD}}</a></div>' },
        { displayName: 'Producto', name: 'Producto', minWidth: '200', field: 'nombreProducto', headerCellClass: 'alignCenter', cellClass: 'alignCenter' },
        { displayName: 'Cantidad', name: 'CantidadVendida', width: '100', field: 'cantidadProducto', headerCellClass: 'alignCenter', cellClass: 'alignCenter' },
        { displayName: "Costo Producto", name: 'CostoProducto', width: '100', field: 'montoTotal', headerCellClass: 'alignCenter', cellClass: 'alignCenter', cellFilter: 'currency' },
        { displayName: "Total Pagado", name: 'TotalPagado', width: '100', field: 'pago', headerCellClass: 'alignCenter', cellClass: 'alignCenter', cellFilter: 'currency' },
        { displayName: "Total Por Pagar", name: 'TotalPorPagar', width: '100', field: 'porPagar', headerCellClass: 'alignCenter', cellClass: 'alignCenter', cellFilter: 'currency' },
        { displayName: 'Vendido Por', name: 'Personal', width: '200', field: 'nombrePersonal', headerCellClass: 'alignCenter', cellClass: 'alignCenter' }
      ],
      data: 'dataProductos',
      onRegisterApi: (gridApi: any) => {
        this.gridApi = gridApi;
        gridApi.pagination.on.paginationChanged((newPage: any, pageSize: any) => {
          this.pageSize = pageSize;
          this.historial.gridProductos = this.pageSize * 30 + 77;
        });
      },
      enableVerticalScrollbar: 0,
      enableHorizontalScrollbar: 2
    },
    gridPaquetes: {
      paginationPageSizes: [15, 50, 100],
      paginationPageSize: 15,
      enableSorting: true,
      enableColumnMenus: false,
      layout: 'fit',
      columnDefs: [
        { displayName: 'Fecha Pago', name: 'fechaVenta', width: '100', field: 'fechaVenta', headerCellClass: 'alignCenter', cellClass: 'alignCenter', type: 'date', cellFilter: 'date:"dd/MM/yyyy"' },
        { displayName: "Sucursal", name: "nombreSucursal", width: '200', field: 'nombreSucursal', headerCellClass: 'alignCenter', cellClass: 'alignCenter' },
        { displayName: "Folio Venta", name: 'Folio', width: '100', field: 'folio', headerCellClass: 'alignCenter', cellClass: 'alignCenter', cellTemplate: '<div class="ui-grid-cell-contents ng-binding ng-scope" style="margin-top:0px;"><a class="nwLink2" href="javascript:void(0);" ng-click="$root.caja.movimientos.mostrarTicketFolioVenta(row.entity.folioOriginal)">{{COL_FIELD}}</a></div>' },
        { displayName: 'Paquete', name: 'nombrePaquete', width: '200', field: 'nombrePaquete', headerCellClass: 'alignCenter', cellClass: 'alignCenter' },
        { displayName: "Costo Producto", name: 'CostoProducto', width: '100', field: 'montoTotal', headerCellClass: 'alignCenter', cellClass: 'alignCenter', cellFilter: 'currency' },
        { displayName: "Total Pagado", name: 'Total Pagado', width: '100', field: 'pago', headerCellClass: 'alignCenter', cellClass: 'alignCenter', cellFilter: 'currency' },
        { displayName: "Total Por Pagar", name: 'TotalPorPagar', width: '100', field: 'porPagar', headerCellClass: 'alignCenter', cellClass: 'alignCenter', cellFilter: 'currency' },
        { displayName: 'Vendido Por', name: 'nombrePersonal', width: '*', field: 'nombrePersonal', headerCellClass: 'alignCenter', cellClass: 'alignCenter' }
      ],
      data: 'dataPquetes',
      onRegisterApi: (gridApi: any) => {
        this.gridApi = gridApi;
        gridApi.pagination.on.paginationChanged((newPage: any, pageSize: any) => {
          this.pageSize = pageSize;
          this.historial.alturaGridPaquetes = this.pageSize * 30 + 77;
        });
      }
    }
  };
  pageSize = 15;

  fileHistorialOnchange(event: any) {
    this._pantallaServicio.mostrarSpinner();
    this.historial_readmultifiles();
  }

  historial_darClicArchivos(entity: any) {
    this.historial.entityTemp = entity;
    this.historial.idCitaModal = entity.idCita;
    this.historial_archivosMultiples();
  }

  historial_archivosMultiples() {
    $('#fileHistorial').click();
  };

  columnasOriginalesServicios: any;
  historial_consultaHistorial() {
    // var fechaSplit = this.cliente.fechas.split(" - ");

    var params: any = {};
    params.idCliente = this.clienteSeleccionado;
    // params.fechaInicio = (moment(JSON.parse(JSON.stringify(fechaSplit[0])), 'DD/MM/YYYY').endOf('day')).format('YYYY-MM-DD HH:mm:ss');
    // params.fechaFin = (moment(JSON.parse(JSON.stringify(fechaSplit[1])), 'DD/MM/YYYY').endOf('day')).format('YYYY-MM-DD HH:mm:ss');
    if (this.fechaInicio.length <= 10) {
      params.fechaInicio = this.fechaInicio + " 00:00:00";
    }
    else {
      params.fechaInicio = this.fechaInicio;
    }

    if (this.fechaFin.length <= 10) {
      params.fechaFin = this.fechaFin + " 23:59:59";
    }
    else {
      params.fechaFin = this.fechaFin;
    }

    this._backService.HttpPost("catalogos/Cliente/obtenerCitasDeCliente", {}, params).subscribe((data: any) => {
      this.historial.dataHistorial = eval(data);
      this.dataSourceServicio.data = data;
      this.historial.dataHistorialOr = JSON.parse(JSON.stringify(this.historial.dataHistorial));
      this.columnasOriginalesServicios = this.historial.dataHistorial.length > 0 ? JSON.parse(JSON.stringify(this.historial.dataHistorial[0])) : null;
      if (this.historial.dataHistorial == 0) {
        this.consultaHistorialExitosa = false;
        this.historial.mostrarHistorial = false;
        this._pantallaServicio.ocultarSpinner();
      }
      else {
        this.historial.altura2 = this.pageSize * 30 + 77;
        $('.ui-grid-viewport').css('overflow-anchor', 'none');
        this.consultaHistorialExitosa = true;
        this.historial.mostrarHistorial = true;
        this._pantallaServicio.ocultarSpinner();
      }

      this.historial_consultaHistorialPaquetes();
      this.cargarProductos();
    }, error => {
      this._pantallaServicio.ocultarSpinner();

    });
  }

  historial_consultaArchivos(entity: any, tipo: any) {
    var params: any = {};
    params.idCita = entity.idCita;
    this.historial.idCitaModal = entity.idCita;


    this._backService.HttpPost("catalogos/Cliente/archivosDeCita", {}, params).subscribe((data: any) => {
      var img = "";
      var sourceFile = "";
      var imgReplace = "";
      var dataTemp = [];
      if (data != 0) {
        dataTemp = eval(data);
      }
      else {
        dataTemp = [];
      }
      this.historial.restante = 10485760; //Solo se permite el uso de 10 MB en disco
      this.historial.dataTemp = dataTemp;
      this.historial.dataConsultarArchivos = dataTemp;
      // var isFirefox = typeof InstallTrigger !== 'undefined';
      // var isChrome = !!window.chrome && !!window.chrome.webstore;

      this.historial_modalArchivos(entity);
      this._pantallaServicio.ocultarSpinner();
      //Para obtener el peso de todos los archivos
      for (var i = 0; i < this.historial.dataTemp.length; i++) {
        this.historial.restante = this.historial.restante - this.historial.dataTemp[i].peso;
      }
    }, error => {

    });
  };

  historial_modalArchivos(entity: any) {
    this.historial.entityTemp = entity;
    this.modales.modalHistorial.show();
  };

  cargos: any;
  citaDetalles: any;
  historial_modalPorPagar(entity: any) {
    this.historial.entityTemp = entity;
    this.getServicios();
    var evento = this.historial.entityTemp;
    this.cargos = [];
    this.aPagar = [];
    var params: any = {};
    params.idCita = evento.idCita;

    this._backService.HttpPost("procesos/agenda/Agenda/getServiciosCita", {}, params).subscribe((data: any) => {
      this.citaDetalles = eval(data);
      for (var i = 0; i < this.citaDetalles.length; i++) {
        if (this.citaDetalles[i].invisibleCalendario == 0) {
          this.aPagar.push({
            id: i,
            cita: this.citaDetalles[i].idCita, citaDetalle: this.citaDetalles[i].idCitaDetalle,
            idPersonal: this.citaDetalles[i].idPersonal,
            costo: this.citaDetalles[i].montoTotal,
            idServicio: this.citaDetalles[i].idServicio,
            eliminar: false,
            servicio: this.citaDetalles[i].nombre,
            costoMinimo: this.citaDetalles[i].costoMinimo
          });
        } else {
          this.aPagar.push({
            id: i,
            cita: this.citaDetalles[i].idCita, citaDetalle: -1,
            idPersonal: this.citaDetalles[i].idPersonal,
            costo: this.citaDetalles[i].montoTotal,
            idServicio: this.citaDetalles[i].idServicio,
            eliminar: true,
            servicio: this.citaDetalles[i].nombre,
            costoMinimo: this.citaDetalles[i].costoMinimo
          });
        }
      }

      for (var i = 0; i < this.aPagar.length; i++) {
        this.getServicioModalTCarga(i);
        this.getPersonalModalTCarga(i);
      }

      this.modales.modalPorPagar.show();
    }, error => {
      this._router.navigate(['/login']);
    });
  };

  dataServiciosPago: any;
  getServicioPago() {
    var params: any = {};
    params.idPersonal = null;
    params.idCita = this.aPagar.idCita;

    this._backService.HttpPost("procesos/agenda/Agenda/selectServicioCita", {}, params).subscribe((data: any) => {
      this.dataServiciosPago = eval(data);
    }, error => {
      this._router.navigate(['/login']);
    });
  };

  historial_readmultifiles() {
    var infoFiles = new Array();
    this.historial.files = document.getElementById('fileHistorial');
    var nombreArchivos = new Array();
    var tamañoArchivos = new Array();
    var contador = 0;
    var flag = false;
    for (var i = 0; i < this.historial.files.files.length; i++) {
      var size = 0;

      var file = this.historial.files.files[i];
      nombreArchivos[i] = file.name;
      tamañoArchivos[i] = file.size;
      var extension = nombreArchivos[i].split('.');

      for (var j = 0; j < this.historial.files.files.length; j++) {
        size = this.historial.files.files[j].size + size;
      }

      if (!(extension[extension.length - 1] == "doc" || extension[extension.length - 1] == "docx" || extension[extension.length - 1] == "xls" || extension[extension.length - 1] == "xlsx" || extension[extension.length - 1] == "ppt" || extension[extension.length - 1] == "pptx" || extension[extension.length - 1] == "txt" || extension[extension.length - 1] == "pdf")) {

        this.historial_modalAlert(this.consultaClienteTranslate.extensionInvalida);
        flag = true;

        i = this.historial.files.files.length;
        var elem: any = document.getElementById("fileHistorial");
        elem.value = "";
        this._pantallaServicio.ocultarSpinner();
      } else {
        if (size > 4500500 && flag == false) {
          this.historial_modalAlert(this.consultaClienteTranslate.archivo4MB);
          flag = true;
          var elem: any = document.getElementById("fileHistorial");
          elem.value = "";
          this._pantallaServicio.ocultarSpinner();
        } else {
          if (size < this.historial.restante) {
            // setup_reader(file);
            var name = file.name;
            var reader: any = new FileReader();

            var base: any;

            reader.onload = (e: any) => {
              var bin = e.target.result;
              base = reader.result.split(",");
              infoFiles[contador] = base[1];
              contador++;
              if (contador >= this.historial.files.files.length) {
                var params: any = {};
                // params.archivo = {
                params.nombre = nombreArchivos;
                params.contenido = infoFiles;
                params.idCita = this.historial.idCitaModal;
                params.peso = tamañoArchivos;
                // };

                this._backService.HttpPost("catalogos/Cliente/addCitaArchivos", {}, params).subscribe((data: any) => {
                  this.historial_consultaArchivos(this.historial.entityTemp, 1);
                  var x: any = document.getElementById("fileHistorial");
                  x.value = "";
                });
              }
            }
            reader.readAsDataURL(file);

          } else {
            this.historial_modalAlert(this.consultaClienteTranslate.sinEspacioSuficiente);
            var elem: any = document.getElementById("fileHistorial");
            elem.value = "";
            this._pantallaServicio.ocultarSpinner();
          }
        }
      }
    }
    // setup_reader = (file:any) => {

    // }
  };

  historial_deleteArchivo(idCitaArchivo: any, i: any) {
    this._pantallaServicio.mostrarSpinner();
    var params: any = {};
    params.id = idCitaArchivo;
    params.direccion = this.historial.dataTemp[i].direccion;
    // params.archivo = {
    //     "id": idCitaArchivo,
    //     "direccion": this.historial.dataTemp[i].direccion
    // };

    this._backService.HttpPost("catalogos/Cliente/deleteCitaArchivos", {}, params).subscribe((data: any) => {
      this.historial_consultaArchivos(this.historial.entityTemp, 1);
    }, error => {

    });
  }

  historial_cerrarModalHistorial() {
    this.historial_consultaHistorial();
    $('.ui-grid-header').css('border-bottom', '1px solid #d4d4d4');
    this.modales.modalHistorial.hide();
  }

  historial_cerrarModalPorPagar() {
    this.historial_consultaHistorial();
    $('.ui-grid-header').css('border-bottom', '1px solid #d4d4d4');
    this.modales.modalPorPagar.hide();
  }

  historial_documentos(accion: any, id: any) {
    if (accion == 'd') {
      // var window:any = window.open('handlers/handlerFileRequest.ashx?idArchivo=' + id);
      window.open(environment.URL + 'handler?idArchivo=' + id);
    }
  };

  historial_modalAlert(msj: any) {
    this.modales.modalAlert.show();
  }

  historial_receta(row: any) {
    this._router.navigate(["catalogos/receta"], {
      queryParams: {
        idCita: row.idCita,
        idServicio: row.idServicio,
        idCliente: this.clienteSeleccionado
      },
    });
  }

  idPersonalPush: any;
  //Funciones para el modal de  servicios por pagar
  getServicioModalT(c: any) {
    var params: any = {};
    params.idPersonal = c.idPersonal ? c.idPersonal : null;
    params.idCita = c.cita ? c.cita : null;

    this._backService.HttpPost("procesos/agenda/Agenda/selectServicioCita", {}, params).subscribe((data: any) => {
      c.dataSelectServ = eval(data);
      this.idPersonalPush = params.idPersonal;
    }, error => {
      this._router.navigate(['/login']);
    });
  };

  getServicioModalTCarga(i: any) {
    var c = this.aPagar[i];
    var params: any = {};
    params.idPersonal = c.idPersonal ? c.idPersonal : null;
    params.idCita = c.cita ? c.cita : null;

    this._backService.HttpPost("procesos/agenda/Agenda/selectServicioCita", {}, params).subscribe((data: any) => {
      this.aPagar[i].dataSelectServ = eval(data);
      this.idPersonalPush = params.idPersonal;
    }, error => {
      this._router.navigate(['/login']);
    });
  };


  selectIdModal: any;
  selectClickedModal(id: any) {
    this.selectIdModal = id
    $("#" + id).removeClass("errorCampo");
  };

  cambiarPrecioTerminar(servicio: any, actualServicio: any) {
    if (actualServicio.id == this.aPagar[this.aPagar.length - 1].id) {
      $(".servicio-input").last().removeClass("error-focus");
    }
    actualServicio.costo = Number(servicio.costoMinimo);
    actualServicio.costoMinimo = Number(servicio.costoMinimo);
    actualServicio.costoMaximo = Number(servicio.costoMaximo);
    actualServicio.idServicio = servicio.idServicio;
    actualServicio.esPromocional = false;
    actualServicio.servicio = servicio.nombre;
  };

  removerServicioTerminar(id: any) {
    this.aPagar.splice(id, 1);
    for (let i = 0; i < this.aPagar.length; i++) {
      this.aPagar[i].id = i;
    };
  };

  getPersonalModalT(c: any) {
    var params: any = {};
    params.idServicio = c.idServicio;

    this._backService.HttpPost("procesos/agenda/Agenda/selectPersonal", {}, params).subscribe((data: any) => {
      var tmpArray = eval(data);
      if (!c.idServicio || c.idServicio < 0) {
        tmpArray.forEach((elem: any, index: any, array: any) => {
          if (!elem.realizoBaja)
            c.dataSelectPers.push(elem);
        });
      } else {
        c.dataSelectPers = tmpArray;
      }
    }, error => {
      this._router.navigate(['/login']);
    });
  };

  getPersonalModalTCarga(i: any) {
    var c = this.aPagar[i];
    var params: any = {};
    params.idServicio = c.idServicio;

    this._backService.HttpPost("procesos/agenda/Agenda/selectPersonal", {}, params).subscribe((data: any) => {
      var tmpArray = eval(data);
      if (!c.idServicio || c.idServicio < 0) {
        tmpArray.forEach((elem: any, index: any, array: any) => {
          if (!elem.realizoBaja)
            this.aPagar[i].dataSelectPers.push(elem);
        });
      } else {
        c.dataSelectPers = tmpArray;
      }
    }, error => {
      this._router.navigate(['/login']);
    });
  };

  getServicios() {
    var params: any = { idPersonal: null };

    this._backService.HttpPost("procesos/agenda/Agenda/selectServicio", {}, params).subscribe((data: any) => {
      this.dataServicios = eval(data);
    }, error => {
      this._router.navigate(['/login']);
    });
  };

  agregarServicioTerminar() {
    if (this.aPagar.length && this.aPagar[this.aPagar.length - 1].idServicio == -1) {
      $(".servicio-input").last().addClass("error-focus");
    }
    else {
      this.aPagar.push({
        id: this.aPagar.length,
        cita: this.aPagar[0].cita,
        //Se establece en uno para marcar que es un servicio añadido al finalizar la cita
        citaDetalle: -1,
        costo: null,
        costoMaximo: null,
        costoMinimo: null,
        idPersonal: this.idPersonalPush,
        servicio: null,
        idServicio: -1,
        dataSelectPers: this.dataPersonal,
        filterBy: null,
        eliminar: true
      });
    }
  }

  btnEfectuarPagoTerminar: any;
  pagar: any = {
    submitted: null
  };
  serviciosPorPagar() {
    this.btnEfectuarPagoTerminar = true;

    var params: any = {};
    params.conceptos = [];
    for (let i = 0; i < this.aPagar.length; i++) {
      params.conceptos.push({
        pago: 0,
        idCita: this.aPagar[i].cita,
        idCitaDetalle: -1,
        fecha: moment().format("HH:mm"),
        idPersonal: this.aPagar[i].idPersonal,
        idServicio: this.aPagar[i].idServicio,
        descripcion: this.aPagar[i].servicio,
        personal: this.aPagar[i].personal,
        idPagoClienteTipo: 1,
        montoTotal: this.aPagar[i].costo === null || this.aPagar[i].costo == "" ? this.aPagar[i].costoMinimo : Number(this.aPagar[i].costo),
        invisibleCalendario: this.aPagar[i].eliminar
      });
    }
    params.idCita = this.aPagar[0].cita;


    this._backService.HttpPost("catalogos/Cliente/agregarServicios", {}, params).subscribe((data: any) => {
      if (data < 0) {
        // $("#btnPorPagar").prop('disabled', false);
        this._toaster.error("Error al añadir servicios");
        this._pantallaServicio.ocultarSpinner();
      }
      else {
        this._toaster.success(this.clienteTranslate.servicioAñadidoExito);
        // $("#btnPorPagar").prop('disabled', false);
        this.historial_cerrarModalPorPagar();
      }
      this.pagar.submitted = false;
    }, error => {
      this._router.navigate(['/login']);
    });
  }

  // Carga de opciones del dropdown list de usoCFDI
  informacionFiscalSucursal_cargarUsoCFDI() {
    this._backService.HttpPost("configuracion/ConfiguracionSucursal/cargarUsoCFDI", {}, {}).subscribe((data: any) => {
      this.informacionFiscalSucursal.usosCFDI = eval(data);
    }, error => {

    });
  };

  // Carga de opciones del dropdown list de metodo de pago
  informacionFiscalSucursal_cargarMetodosDePago() {
    this._backService.HttpPost("configuracion/ConfiguracionSucursal/cargarMetodosDePago", {}, {}).subscribe((data: any) => {
      this.informacionFiscalSucursal.metodosDePago = eval(data);
    }, error => {

    });
  };

  // Carga de opciones del dropdown list de forma de pago
  informacionFiscalSucursal_cargarFormasDePago() {
    this._backService.HttpPost("configuracion/ConfiguracionSucursal/cargarFormasDePago", {}, {}).subscribe((data: any) => {
      this.informacionFiscalSucursal.formasDePago = eval(data);
    }, error => {

    });
  };

  //Funcion que carga el regimen fiscal Receptor
  informacionFiscalSucursal_cargarRegimen() {
    var params: any = {};
    params.moral = this.datosFiscales.personaMoral;
    params.fisica = this.datosFiscales.personaFisica;

    this._backService.HttpPost("configuracion/ConfiguracionSucursal/cargarRegimen", {}, params).subscribe((data: any) => {
      this.datosFiscales.dataRegimen = eval(data);
    }, error => {

    });
  }

  // $scope.informacionFiscalSucursal.cargarFormasDePago();
  // $scope.informacionFiscalSucursal.cargarMetodosDePago();
  // $scope.informacionFiscalSucursal.cargarUsoCFDI();
  // $scope.informacionFiscalSucursal.cargarRegimen ();

  // -------------------------------------------------------- Estado de Cuenta --------------------------------------------------------

  cliente_inicializarCalendario() {

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
    //     startDate:  this.cliente.fechaInicio,
    //     endDate: this.cliente.fechaFin,

    //     ranges: {
    //        [dias]: [moment().subtract(6, 'days'), moment()],
    //        [meses]: [moment().startOf('month'), moment().endOf('month')],
    //        [años]: [moment().startOf('year'), moment().endOf('year')]
    //     },
    //     locale:{
    //         "daysOfWeek": [
    //             [domingo],
    //             [lunes],
    //             [martes],
    //             [miercoles],
    //             [jueves],
    //             [viernes],
    //             [sabado]
    //         ],
    //         "monthNames": [
    //             [eneroS],
    //             [febreroS],
    //             [marzoS],
    //             [abrilS],
    //             [mayoS],
    //             [junioS],
    //             [julioS],
    //             [agostoS],
    //             [septiembreS],
    //             [octubreS],
    //             [noviembreS],
    //             [diciembreS]
    //         ],
    //         applyLabel: aceptar,
    //         cancelLabel: cancelar,
    //         customRangeLabel: rango

    //     }
    // });
    this.ranges = {
      "Ultimos 7 Dias": [moment().subtract(6, 'days'), moment()], //subtract
      "Ultimo Mes": [moment().startOf('month'), moment().endOf('month')],
      "Ultimo Año": [moment().startOf('year'), moment().endOf('year')]
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
  };

  isInvalidDate = (m: moment.Moment) => {
    return this.invalidDates.some(d => d.isSame(m, 'day'))
  }

  primerCargaPantalla = true;
  cliente_cambioFecha() {
    this._pantallaServicio.mostrarSpinner();

    if (this.primerCargaPantalla) {
      // var fechasAux = this.cliente.fechas.split(" - ");
      // var f1 = fechasAux[0].split('/'); //Fecha de inicio de busqueda
      // var f2 = fechasAux[1].split('/'); //Fecha de fin de busqueda

      // var fechaInicio:any = fechaInicio.setFullYear(f1[2], f1[1]-1, f1[0]).setHours(0, 0, 0, 0);
      // var fechaFin:any = fechaFin.setFullYear(f2[2], f2[1]-1, f2[0]).setHours(0, 0, 0, 0);

      // var fechaInicio = new Date();
      // var fechaFin = new Date();

      // fechaInicio.setFullYear(f1[2], f1[1]-1, f1[0]);
      // fechaFin.setFullYear(f2[2], f2[1]-1, f2[0]);

      // fechaInicio.setHours(0, 0, 0, 0);
      // fechaFin.setHours(0, 0, 0, 0);

      // this.cliente.fechaInicioFil = format(fechaInicio, "dd/MM/yyyy");
      // this.cliente.fechaFinFil = format(fechaFin, "dd/MM/yyyy");
      var fechasAux = this.cliente.fechas.split(" - ");
      var f1 = fechasAux[0].split('/'); //Fecha de inicio de busqueda
      var f2 = fechasAux[1].split('/'); //Fecha de fin de busqueda

      this.fechaInicio = format(new Date().setFullYear(f1[2], f1[1] - 1, f1[0]), 'yyyy-MM-dd');
      this.fechaInicio = this.fechaInicio + " 00:00:00";
      this.fechaFin = format(new Date().setFullYear(f2[2], f2[1] - 1, f2[0]), 'yyyy-MM-dd');
      this.fechaFin = this.fechaFin + " 23:59:00";
    } else {
      this.fechaInicio = moment(new Date(this.cliente.fechas.startDate['$y'], this.cliente.fechas.startDate['$M'], this.cliente.fechas.startDate['$D'])).startOf('day').format('YYYY-MM-DD HH:mm:ss');
      this.fechaFin = moment(new Date(this.cliente.fechas.endDate['$y'], this.cliente.fechas.endDate['$M'], this.cliente.fechas.endDate['$D'])).endOf('day').format('YYYY-MM-DD HH:mm:ss');
    }

    this.primerCargaPantalla = false;

    this.cliente.fechaInicioFil = this.fechaInicio;
    this.cliente.fechaFinFil = this.fechaFin;

    this.buscar();
  }

  carga: any;
  buscar() {
    var valido = true;
    $("#fechaInicio").removeClass("errorCampo");
    this.cliente.errorFecha = "";
    $("#fechaFin").removeClass("errorCampo");
    this.cliente.errorFecha = "";
    if (valido) {
      this.historial_consultaHistorial();
      this.cargarProductos();
      this.getIndicadores();
      this.historial_consultaHistorialPaquetes();
      this.carga = true;
    }
  };

  // $scope.cliente.inicializarCalendario();

  // document.getElementById("aServicios").onclick = function () {
  //     $("#servicios").show();
  //     $("#productos").hide();
  //     $("#paquetes").hide();
  //     $("#txtErrorServicios").show();
  //     $("#txtErrorProductos").hide();
  //     $("#busquedaServicio").show();
  //     $("#busquedaProductos").hide();
  // }

  // document.getElementById("aProductos").onclick = function () {
  //     $("#servicios").hide();
  //     $("#productos").show();
  //     $("#paquetes").hide();
  //     $("#txtErrorServicios").hide();
  //     $("#txtErrorProductos").show();
  //     $("#busquedaServicio").hide();
  //     $("#busquedaProductos").show();
  // }

  // document.getElementById("aPaquetes").onclick = function () {
  //     $("#servicios").hide();
  //     $("#productos").hide();
  //     $("#paquetes").show();
  // }

  dataProductos: any;
  dataProductosOr: any;
  columnasOriginalesProductos: any
  cargarProductos() {
    // var fechaSplit = this.cliente.fechas.split(" - ");

    var params: any = {};
    params.idCliente = this.clienteSeleccionado;
    // params.fechaInicio = (moment(JSON.parse(JSON.stringify(fechaSplit[0])), 'DD/MM/YYYY').startOf('day')).format('YYYY-MM-DD HH:mm:ss');
    // params.fechaFin = (moment(JSON.parse(JSON.stringify(fechaSplit[1])), 'DD/MM/YYYY').endOf('day')).format('YYYY-MM-DD HH:mm:ss');
    if (this.fechaInicio.length <= 10) {
      params.fechaInicio = this.fechaInicio + " 00:00:00";
    }
    else {
      params.fechaInicio = this.fechaInicio;
    }

    if (this.fechaFin.length <= 10) {
      params.fechaFin = this.fechaFin + " 23:59:59";
    }
    else {
      params.fechaFin = this.fechaFin;
    }

    this._backService.HttpPost("catalogos/Cliente/cargarProductos", {}, params).subscribe((data: any) => {
      if (data != 0) {
        this.dataProductos = eval(data);
      }
      else {
        this.dataProductos = [];
      }
      this.dataSourceProductos = data;
      if (this.dataProductos.length > 0) {
        this.historial.mostrarProductos = true;
      } else {
        this.historial.mostrarProductos = false;
      }
      this.dataProductosOr = JSON.parse(JSON.stringify(this.dataProductos));

      this.columnasOriginalesProductos = this.dataProductos.length > 0 ? JSON.parse(JSON.stringify(this.dataProductos[0])) : null;
    }, error => {
      this._pantallaServicio.ocultarSpinner();
      this._toaster.error("No se pudieron cargar los productos.");
    });
  }

  citasDia: any;
  citasCanceladasDia: any;
  citasCompletadasDia: any;
  ingresos: any;
  getIndicadores() {
    // var fechaSplit = this.cliente.fechas.split(" - ");

    var params: any = {};
    params.idCliente = this.clienteSeleccionado;
    // params.fechaInicio = (moment(JSON.parse(JSON.stringify(fechaSplit[0])), 'DD/MM/YYYY').startOf('day')).format('YYYY-MM-DD HH:mm:ss');
    // params.fechaFin = (moment(JSON.parse(JSON.stringify(fechaSplit[1])), 'DD/MM/YYYY').endOf('day')).format('YYYY-MM-DD HH:mm:ss');
    if (this.fechaInicio.length <= 10) {
      params.fechaInicio = this.fechaInicio + " 00:00:00";
    }
    else {
      params.fechaInicio = this.fechaInicio;
    }

    if (this.fechaFin.length <= 10) {
      params.fechaFin = this.fechaFin + " 23:59:59";
    }
    else {
      params.fechaFin = this.fechaFin;
    }

    this._backService.HttpPost("catalogos/Cliente/getIndicadores", {}, params).subscribe((data: any) => {
      var info = eval(data)[0];
      this.citasDia = info.citas;
      this.citasCanceladasDia = info.citasCanceladas;
      this.citasCompletadasDia = info.citasTerminadas;
      this.ingresos = info.ingresos ? info.ingresos : 0;
    }, error => {
      this._toaster.error("Error al cargar los indicadores.");
    });
  };

  pruebaNombre: any;
  keyNames: any;
  altura: any;
  pruebaNombreProductos: any;
  busquedaCliente(valor: any) {
    if (this.pruebaNombre != "") {
      if (valor == 1) {
        var foundItem = this.historial.dataHistorialOr.filter((item: any) => {
          if (item.nombrePersonal.toUpperCase().match(this.pruebaNombre.toUpperCase()) != null) {
            return item;
          }
          if (item.nombreServicio.toUpperCase().match(this.pruebaNombre.toUpperCase()) != null) {
            return item;
          }
          if (item.nombreSucursal.toUpperCase().match(this.pruebaNombre.toUpperCase()) != null) {
            return item;
          }
          if (item.nota != "" && item.nota != null) {
            if (item.nota.toLowerCase().match(this.pruebaNombre.toLowerCase()) != null) {
              return item;
            }
          }
          var i: any;
          for (i in this.keyNames) {
            if (i > 13) {
              if (item[this.keyNames[i]] != "" && item[this.keyNames[i]] != null) {
                if (item[this.keyNames[i]].toLowerCase().match(this.pruebaNombre.toLowerCase()) != null) {
                  return item;
                }
              }
            }
          }
        },
          true);

        this.historial.dataHistorial = JSON.parse(JSON.stringify(foundItem));
        this.dataSourceServicio.data = JSON.parse(JSON.stringify(foundItem));
        // this.altura = this.historial.dataProductos.length * 30 + 45;
      } //Fin servicios
    }
    else {
      this.historial.dataHistorial = JSON.parse(JSON.stringify(this.historial.dataHistorialOr));
      this.dataSourceServicio.data = JSON.parse(JSON.stringify(this.historial.dataHistorialOr));
      // this.altura = this.historial.dataHistorial.length * 30 + 45;
      this.dataProductos = JSON.parse(JSON.stringify(this.dataProductosOr));
    }
    if (this.pruebaNombreProductos != "") {
      if (valor == 2) {
        var foundItem = this.dataProductosOr.filter((item: any) => {
          if (item.Personal.toUpperCase().match(this.pruebaNombre.toUpperCase()) != null) {
            return item;
          }
          if (item.Producto.toUpperCase().match(this.pruebaNombre.toUpperCase()) != null) {
            return item;
          }
          if (item.folio != "" && item.folio != null) {
            if (item.folio.match(this.pruebaNombre) != null) {
              return item;
            }
          }
          var i: any;
          for (i in this.keyNames) {
            if (i > 13) {
              if (item[this.keyNames[i]] != "" && item[this.keyNames[i]] != null) {
                if (item[this.keyNames[i]].toLowerCase().match(this.pruebaNombre.toLowerCase()) != null) {
                  return item;
                }
              }
            }
          }
        },
          true);

        this.dataProductos = JSON.parse(JSON.stringify(foundItem));
        // this.altura = this.dataProductos.length * 30 + 45;
      }//Fin if productos
    }
    else {
      this.dataProductos = JSON.parse(JSON.stringify(this.dataProductosOr));
      // this.altura = this.dataProductos.length * 30 + 45;
    }
  };

  toggleIndicadores: any;
  ocultarIndicadores() {
    this.toggleIndicadores = !this.toggleIndicadores;
    if (this.toggleIndicadores) {
      $('.fa-sort-asc').toggleClass('fa-sort-desc', true);
      $('.fa-sort-desc').toggleClass('fa-sort-asc', false);
      $(".indicador-toggle").hide("blind");
    }
    else {
      $('.fa-sort-desc').toggleClass('fa-sort-asc', true);
      $('.fa-sort-asc').toggleClass('fa-sort-desc', false);
      $(".indicador-toggle").show("blind");
    }
  };

  //--------------------------------------------Funciones para exportar-------------------------------------------//

  dataExportar: any;
  dataPquetes: any;
  exportToExcel(n: any) {
    // 1 - Servicios
    // 2 - Productos
    // 3 - Paquetes
    var date = new Date().toJSON().slice(0, 10).replace(/-/g, '/');
    if (n == 1) {
      var titulo = "Servicios" + "_" + date;
      var dataCopy = JSON.parse(JSON.stringify(this.historial.dataHistorial));
      this.formatearGrid(dataCopy, n);
      this.historial.gridOptionsHistorial.columnDefs2 = [];

      for (var i = 0; i < 9; i++) {
        this.historial.gridOptionsHistorial.columnDefs2.push(this.historial.gridOptionsHistorial.columnDefs[i]);
      }
      this.exportXlsTableView(this.dataExportar, this.historial.gridOptionsHistorial.columnDefs2, titulo);
    }
    if (n == 2) {
      var titulo = "Productos" + "_" + date;
      var dataCopy = JSON.parse(JSON.stringify(this.dataProductos));
      this.formatearGrid(dataCopy, n);
      this.exportXlsTableView(this.dataExportar, this.historial.gridProductos.columnDefs, titulo);
    }
    if (n == 3) {
      var titulo = "Paquetes" + "_" + date;
      var dataCopy = JSON.parse(JSON.stringify(this.dataPquetes));
      this.formatearGrid(dataCopy, n);
      this.exportXlsTableView(this.dataExportar, this.historial.gridPaquetes.columnDefs, titulo);
    }
  };

  columnasOriginalesPaquetes: any;
  formatearGrid(data: any, opcion: any) {
    this.dataExportar = [];

    if (opcion == 1) {
      var nombreColumnas = Object.keys(this.columnasOriginalesServicios);
      for (var i = 0; i < data.length; i++) {
        var Objeto: any = {};
        if (data[i].nombreSucursal == null || data[i].nombreSucursal == undefined) {
          Objeto.nombreSucursal = " ";
        } else {
          Objeto.nombreSucursal = data[i].nombreSucursal;
        }
        if (data[i].folio == null || data[i].folio == undefined) {
          Objeto.folio = " ";
        } else {
          Objeto.folio = data[i].folio;
        }
        if (data[i].fechaCita == null || data[i].fechaCita == undefined) {
          Objeto.fechaCita = " ";
        } else {
          Objeto.fechaCita = data[i].fechaCita.substr(0, 10).replace("-", "/");
        }
        if (data[i].nombrePersonal == null || data[i].nombrePersonal == undefined) {
          Objeto.nombrePersonal = " ";
        } else {
          Objeto.nombrePersonal = data[i].nombrePersonal;
        }
        if (data[i].montoTotal == null || data[i].montoTotal == undefined) {
          Objeto.montoTotal = " ";
        } else {
          Objeto.montoTotal = data[i].montoTotal;
        }
        if (data[i].pago == null || data[i].pago == undefined) {
          Objeto.pago = " ";
        } else {
          Objeto.pago = data[i].pago;
        }
        if (data[i].porPagar == null || data[i].porPagar == undefined) {
          Objeto.porPagar = " ";
        } else {
          Objeto.porPagar = data[i].porPagar;
        }
        if (data[i].nombreServicio == null || data[i].nombreServicio == undefined) {
          Objeto.nombreServicio = " ";
        } else {
          Objeto.nombreServicio = data[i].nombreServicio;
        }
        if (data[i].nota == null || data[i].nota == undefined) {
          Objeto.nota = " ";
        } else {
          Objeto.nota = data[i].nota;
        }
        this.dataExportar.push(Objeto);
      }
    }

    if (opcion == 2) {
      var nombreColumnas = Object.keys(this.columnasOriginalesProductos);

      for (var i = 0; i < data.length; i++) {
        var Objeto: any = {};

        if (data[i].folio == null || data[i].folio == undefined) {
          Objeto.folio = " ";
        } else {
          Objeto.folio = data[i].folio;
        }
        if (data[i].fechaVenta == null || data[i].fechaVenta == undefined) {
          Objeto.fechaVenta = " ";
        } else {
          Objeto.fechaVenta = data[i].fechaVenta;
        }
        if (data[i].nombreProducto == 0 || data[i].nombreProducto == undefined) {
          Objeto.nombreProducto = " ";
        } else {
          Objeto.nombreProducto = data[i].nombreProducto;
        }
        if (data[i].cantidadProducto == 0 || data[i].cantidadProducto == undefined) {
          Objeto.cantidadProducto = " ";
        } else {
          Objeto.cantidadProducto = data[i].cantidadProducto;
        }
        if (data[i].montoTotal == 0 || data[i].montoTotal == undefined) {
          Objeto.montoTotal = " ";
        } else {
          Objeto.montoTotal = data[i].montoTotal;
        }
        if (data[i].pago == 0 || data[i].pago == undefined) {
          Objeto.pago = " ";
        } else {
          Objeto.pago = data[i].pago;
        }
        if (data[i].porPagar == 0 || data[i].porPagar == undefined) {
          Objeto.porPagar = " ";
        } else {
          Objeto.porPagar = data[i].porPagar;
        }
        if (data[i].nombrePersonal == 0 || data[i].nombrePersonal == undefined) {
          Objeto.nombrePersonal = " ";
        } else {
          Objeto.nombrePersonal = data[i].nombrePersonal;
        }
        if (data[i].nombreSucursal == null || data[i].nombreSucursal == undefined) {
          Objeto.nombreSucursal = " ";
        } else {
          Objeto.nombreSucursal = data[i].nombreSucursal;
        }
        this.dataExportar.push(Objeto);
      }
    }
    if (opcion == 3) {
      var nombreColumnas = Object.keys(this.columnasOriginalesPaquetes);

      for (var i = 0; i < data.length; i++) {
        var Objeto: any = {};

        if (data[i].folio == null || data[i].folio == undefined) {
          Objeto.folio = " ";
        } else {
          Objeto.folio = data[i].folio;
        }
        if (data[i].fechaVenta == null || data[i].fechaVenta == undefined) {
          Objeto.fechaVenta = " ";
        } else {
          Objeto.fechaVenta = data[i].fechaVenta;
        }
        if (data[i].nombrePaquete == 0 || data[i].nombrePaquete == undefined) {
          Objeto.nombrePaquete = " ";
        } else {
          Objeto.nombrePaquete = data[i].nombrePaquete;
        }
        if (data[i].cantidadProducto == 0 || data[i].cantidadProducto == undefined) {
          Objeto.cantidadProducto = " ";
        } else {
          Objeto.cantidadProducto = data[i].cantidadProducto;
        }
        if (data[i].montoTotal == 0 || data[i].montoTotal == undefined) {
          Objeto.montoTotal = " ";
        } else {
          Objeto.montoTotal = data[i].montoTotal;
        }
        if (data[i].pago == 0 || data[i].pago == undefined) {
          Objeto.pago = " ";
        } else {
          Objeto.pago = data[i].pago;
        }
        if (data[i].porPagar == 0 || data[i].porPagar == undefined) {
          Objeto.porPagar = " ";
        } else {
          Objeto.porPagar = data[i].porPagar;
        }
        if (data[i].nombrePersonal == 0 || data[i].nombrePersonal == undefined) {
          Objeto.nombrePersonal = " ";
        } else {
          Objeto.nombrePersonal = data[i].nombrePersonal;
        }
        if (data[i].nombreSucursal == null || data[i].nombreSucursal == undefined) {
          Objeto.nombreSucursal = " ";
        } else {
          Objeto.nombreSucursal = data[i].nombreSucursal;
        }
        this.dataExportar.push(Objeto);
      }
    }
  };

  exportXlsTableView(dataArray: any, columnas: any, nameExcel: any) {
    if (dataArray.length > 0) {
      var dataGridOptionsExport = this.formatJSONData(columnas, dataArray);
      this.drawTable(dataGridOptionsExport, nameExcel);
    } else {
      var msj = this.reporteVentaProductoTranslate.noDatos;
      this.modalNoDatos(msj);
    }
  };

  headers: any;
  /*Crea un string que tendrá el formato de una tabla HTML y luego la convierte con un plugin*/
  drawTable(data: any, nameExcel: any) {
    var table = '<table><tr>';
    var headersString = "";
    this.headers.forEach((header: any) => {
      if (header.name != "Acciones" && header.name != "Actions") {
        headersString += '<th>' + header.displayName + '</th>';
      }
    });
    table += headersString + "</tr>";
    var index = 0;
    data.forEach((row: any) => {
      var dataRow = this.drawRow(index, row);
      table += dataRow;
    });
    table += "</table>";
    var x: any = document.getElementById("excelTable");
    x.innerHTML = table;
    var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    // var isFirefox = typeof InstallTrigger !== 'undefined';
    if (isSafari) {
      var blob = new Blob(["\ufeff", table], { type: "application/vnd.ms-excel" });
      saveAs(blob, nameExcel);
    } else {
      var blob = new Blob(["\ufeff", table], { type: "text/plain;charset=utf-8" });
      saveAs(blob, nameExcel + ".xls");
    }
  };

  drawRow(i: any, dataRow: any) {
    var value = '';
    var row = "<tr>";
    if ((i % 2) == 0) {
      this.headers.forEach((elem: any) => {
        if (dataRow[elem.displayName] == undefined) {
          value = '';
        }
        else {
          value = dataRow[elem.displayName];
        }
        if (value.length > 0) {
          row += '<td>' + value + '</td>';
        }
      });
    } else {
      this.headers.forEach((elem: any) => {
        if (dataRow[elem.displayName] == undefined) {
          value = '';
        }
        else {
          value = dataRow[elem.displayName];
        }
        row += '<td>' + value + '</td>';
      });
    }
    row += "</tr>";
    return row;
  };

  modalNoDatos(msj: any) {
    $("#modal-noDatos .modal-body").html('<span class="title">' + msj + '</span>');
    this.modales.modalNoDatos.show();
  }

  dataGridOptionsExport: any;
  formatJSONData(columns: any, data: any) {
    var i = 0;
    var lenght = 0;
    var str = "";
    this.headers = [];
    this.dataGridOptionsExport = [];
    columns.forEach((col: any) => {
      var colString = "";
      var element: any = {};
      if (col.field != undefined) {
        element.name = col.field;
        element.displayName = col.name;
        this.headers.push(element);
      }
    });

    data.forEach((evento: any) => {
      var reg = '{';
      var colIndex = 0;
      columns.forEach((col: any) => {
        if (evento[col.field] !== undefined || evento[col.field] == null) {
          if (evento[col.field] == null || evento[col.field] == "") {
            var espaciovacio = " ";
            reg += "\"" + col.name + "\"" + ":" + "\"" + espaciovacio.toString().split('"').join('\'') + "\",";
          } else {
            reg += "\"" + col.name + "\"" + ":" + "\"" + evento[col.field.toString()].toString().split('"').join('\'') + "\",";
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

  //-------------------------------------- Ticket -----------------------------------//
  idPagoClienteProducto: any;
  ticket: any = {
    cliente: null,
    folio: null,
    fecha: null,
    paquetes: [],
    productos: [],
    descuento: [],
    promocion: [],
    propina: [],
    total: null,
    metodoPago: null,
    cargos: []
  };
  verNotaVenta(row: any) {
    var params: any = {};
    this.idPagoClienteProducto = row.idPagoClienteProducto;
    params.idPagoClienteProducto = row.idPagoClienteProducto;

    this._backService.HttpPost("procesos/agenda/Agenda/selectTicketVenta", {}, params).subscribe((data: any) => {
      var temp = eval(data);
      this.ticket = {};
      this.ticket.cargos = [];
      this.ticket.promocion = [];
      this.ticket.total = 0;
      this.ticket.fecha = moment(temp[0].fecha).format("DD MMM YYYY HH:mm");
      this.ticket.fechaSF = moment(temp[0].fecha);
      this.ticket.cliente = temp[0].nombreCliente;
      this.ticket.idCliente = temp[0].idCliente;
      this.ticket.folio = temp[0].folio;
      this.ticket.productos = [];
      this.ticket.paquetes = [];

      var idPagoClienteDetalleAux = 0;

      for (var i = 0; i < temp.length; i++) {
        if (idPagoClienteDetalleAux != temp[i].idPagoClienteDetalle) {
          if (temp[i].idPagoClienteTipo == 1) {
            this.ticket.cargos.push(temp[i]);
          }
          else if (temp[i].idPagoClienteTipo == 2) {
            this.ticket.descuento = temp[i];
          }
          else if (temp[i].idPagoClienteTipo == 3) {
            this.ticket.promocion.push(temp[i]);
          }
          else {
            if (temp[i].idPagoClienteTipo == 5) {
              this.ticket.productos.push(temp[i]);
            } else {
              if (temp[i].idPagoClienteTipo == 6) {
                this.ticket.paquetes.push(temp[i]);
              }
              else {
                this.ticket.propina = temp[i];
              }
            }
          }
          this.ticket.total += temp[i].idPagoClienteTipo != 4 ? temp[i].pago : 0;

        }
        idPagoClienteDetalleAux = temp[i].idPagoClienteDetalle;
      }
      if (this.ticket.propina != undefined) {
        this.ticket.total = this.ticket.total + this.ticket.propina.pago;
      }
      var params: any = {};
      params.idCita = 0;
      params.idPagoClienteProducto = row.idPagoClienteProducto;


      this._backService.HttpPost("procesos/agenda/Agenda/selectTicketMetodoPago", {}, params).subscribe((data: any) => {
        var temp = eval(data);
        this.ticket.metodoPago = [];
        for (var i = 0; i < temp.length; i++) {
          this.ticket.metodoPago.push(temp[i]);
        }

        //$rootScope.dataTicket = this.ticket;
        this.rootScope_dataTicket = this.ticket;
        this.ticketVentaModal();
      }, error => {
        this._router.navigate(['/login']);
      });
    }, error => {
      this._router.navigate(['/login']);
    });
  }

  ticketVentaModal() {
    this.modales.ticketVenta.show();
  };

  idCita: any;
  verNotaCita(row: any) {
    var params: any = {};
    this.idCita = row.idCita;
    params.idCita = row.idCita;

    this._backService.HttpPost("procesos/agenda/Agenda/selectTicketInfo", {}, params).subscribe((data: any) => {
      var temp = eval(data);
      this.ticket = {};
      this.ticket.cargos = [];
      this.ticket.promocion = [];
      this.ticket.total = 0;
      this.ticket.fecha = moment(temp[0].fecha).format("DD MMM YYYY HH:mm");
      this.ticket.fechaSF = moment(temp[0].fecha);
      this.ticket.cliente = temp[0].nombreCliente;
      this.ticket.idCliente = temp[0].idCliente;
      this.ticket.folio = temp[0].folio;
      this.ticket.productos = [];
      this.ticket.paquetes = [];

      for (var i = 0; i < temp.length; i++) {
        switch (temp[i].idPagoClienteTipo) {
          case 1: this.ticket.cargos.push(temp[i]);
            break;

          case 2: this.ticket.descuento = temp[i];
            break;

          case 3: this.ticket.promocion.push(temp[i]);
            break;

          case 4: this.ticket.propina = temp[i];
            break;

          case 5: this.ticket.productos.push(temp[i]);
            break;

          case 6: this.ticket.paquetes.push(temp[i]);
            break;

        }
        this.ticket.total += temp[i].idPagoClienteTipo != 4 ? temp[i].pago : 0;
      }

      if (this.ticket.propina != undefined) {
        this.ticket.total = this.ticket.total + this.ticket.propina.pago;
      }
      this.ticket.idCita = row.idCita;
      var params: any = {};
      params.idCita = row.idCita;
      params.idPagoClienteProducto = 0;


      this._backService.HttpPost("procesos/agenda/Agenda/selectTicketMetodoPago", {}, params).subscribe((data: any) => {
        var temp = eval(data);
        this.ticket.metodoPago = [];
        for (var i = 0; i < temp.length; i++) {
          this.ticket.metodoPago.push(temp[i]);
        }

        //$rootScope.dataTicket = this.ticket;
        this.rootScope_dataTicket = this.ticket;
        this.ticketCitaModal();
      }, error => {
        this._router.navigate(['/login']);
      });


    }, error => {
      this._router.navigate(['/login']);
    });
  }

  ticketCitaModal() {
    this.modales.ticketCita.show();
  };

  // --------------------- Paquetes ---------------------
  historial_consultaHistorialPaquetes() {
    // var fechaSplit = this.cliente.fechas.split(" - ");

    var params: any = {};
    params.idCliente = this.clienteSeleccionado;
    // params.fechaInicio = (moment(JSON.parse(JSON.stringify(fechaSplit[0])), 'DD/MM/YYYY').startOf('day')).format('YYYY-MM-DD HH:mm:ss');
    // params.fechaFin = (moment(JSON.parse(JSON.stringify(fechaSplit[1])), 'DD/MM/YYYY').endOf('day')).format('YYYY-MM-DD HH:mm:ss');
    if (this.fechaInicio.length <= 10) {
      params.fechaInicio = this.fechaInicio + " 00:00:00";
    }
    else {
      params.fechaInicio = this.fechaInicio;
    }

    if (this.fechaFin.length <= 10) {
      params.fechaFin = this.fechaFin + " 23:59:59";
    }
    else {
      params.fechaFin = this.fechaFin;
    }

    this._backService.HttpPost("catalogos/Cliente/consultaHistorialPaquetes", {}, params).subscribe((data: any) => {
      this.dataPquetes = eval(data);
      this.dataSourcePaquetes.data = data;
      this.columnasOriginalesPaquetes = this.dataPquetes.length > 0 ? JSON.parse(JSON.stringify(this.dataPquetes[0])) : null;
    }, error => {

    });
  }

  verNotaVentaPaquete(row: any) {
    if (row.idCita != null) {
      this.verNotaCita(row);
    }
    else {
      if (row.idPagoClienteProducto != null) {
        this.verNotaVenta(row);
      }
    }
  }

  // --------------------------------------------------------------- Exportar PDF ---------------------------------------------------------------
  direccionPDFCliente: any;
  exportarPDF() {
    this._pantallaServicio.mostrarSpinner();
    var params: any = {};
    params.infoGeneral = [];
    params.infoGeneral[0] = {};
    // params.infoGeneral[0].nombreSucursal = $rootScope.nSucursal;
    params.infoGeneral[0].nombreSucursal = this.rootScope_nSucursal;
    params.infoGeneral[0].nombreCliente = this.cliente.nombre;
    if (this.cliente.fechaNacimiento != null && this.cliente.fechaNacimiento != undefined && this.cliente.fechaNacimiento != "") {
      params.infoGeneral[0].fechaNacimientoCliente = this.cliente.fechaNacimiento;
    }
    else {
      params.infoGeneral[0].fechaNacimientoCliente = "";
    }
    params.infoGeneral[0].edadCliente = this.cliente.edad;
    params.infoGeneral[0].telefonoCasaCliente = this.cliente.telefono;
    params.infoGeneral[0].telefonoCelularCliente = this.cliente.telefonoCasa;
    params.infoGeneral[0].srcImgSucursal = this.rootScope_img;
    params.infoGeneral[0].srcImgCliente = this.cliente.imagen;
    params.infoGeneral[0].emailCliente = this.cliente.email;
    params.infoGeneral[0].observaciones = this.cliente.observaciones;
    var elem: any = document.getElementById("txtObservaciones");
    params.infoGeneral[0].alturaObservaciones = (elem.scrollHeight + 25) + "px";

    params.camposConfigurables = [];

    var cont = 0;
    for (var i = 0; i < this.secciones.length; i++) {
      for (var j = 0; j < this.secciones[i].camposConfigurables.length; j++) {
        params.camposConfigurables[cont] = {};
        params.camposConfigurables[cont].descripcion = this.secciones[i].camposConfigurables[j].nombre;
        if (this.secciones[i].camposConfigurables[j].valor == undefined) {
          params.camposConfigurables[cont].valor = "";
        }
        else {
          params.camposConfigurables[cont].valor = this.secciones[i].camposConfigurables[j].valor;
        }
        if (this.secciones[i].camposConfigurables[j].idCampoSeccion != null) {
          params.camposConfigurables[cont].idCampoSeccion = this.secciones[i].camposConfigurables[j].idCampoSeccion;
        }
        else {
          params.camposConfigurables[cont].idCampoSeccion = -1;
        }
        var elem: any = document.getElementById("txtCampoValor" + this.secciones[i].camposConfigurables[j].idCampo);
        params.camposConfigurables[cont].altura = (elem.scrollHeight + 25) + "px";
        cont++;
      }
    }

    params.idioma = "ESP";

    params.secciones = [];

    for (var i = 0; i < this.secciones.length; i++) {
      params.secciones[i] = {};
      if (this.secciones[i].idCampoSeccion != null) {
        params.secciones[i].idCampoSeccion = this.secciones[i].idCampoSeccion;
      }
      else {
        params.secciones[i].idCampoSeccion = -1;
      }
      params.secciones[i].descripcion = this.secciones[i].nombre;
    }


    this._backService.HttpPost("catalogos/Cliente/exportarPDF", {}, params, "text").subscribe((data: any) => {
      this.direccionPDFCliente = data;
      this._pantallaServicio.ocultarSpinner();
      if (this.direccionPDFCliente != "false") {
        // var isFirefox:boolean = typeof InstallTrigger !== 'undefined';
        // if (isFirefox) {
        //     // window.open('handlers/handlerFileRequest.ashx?idRecetaPdf=' + this.direccionPDFCliente);
        //     window.open(environment.URL + 'handler?idRecetaPdf=' + this.direccionPDFCliente);
        // } else {
        //     var direccion = "../../../../bookipp/archivos/recetaArchivos/" + this.direccionPDFCliente;
        //     this.printPdf(direccion);
        // }
        window.open(environment.URL + 'handler?idRecetaPdf=' + this.direccionPDFCliente);
      }
    }, error => {
      this._pantallaServicio.ocultarSpinner();
    });
  }

  _printIframe: any;
  printPdf(url: any) {
    var iframe: any = undefined;
    this._printIframe = undefined;
    iframe = this._printIframe;
    if (!this._printIframe) {
      iframe = this._printIframe = document.createElement('iframe');
      document.body.appendChild(iframe);

      iframe.style.display = 'none';
      iframe.onload = () => {

        setTimeout(() => {

          setTimeout(() => {
            iframe.focus();
            iframe.contentWindow.print();
            setTimeout(() => {
              if (this.direccionPDFCliente != "false") {
                var params: any = {};
                params.nombreArchivo = this.direccionPDFCliente;

                this._backService.HttpPost("catalogos/Cliente/borrarClientePdf", {}, params).subscribe((data: any) => {

                }, error => {

                });
              }
            }, 500);
          }, 1);
        });
      }
    }
    iframe.src = url;
  }

  // --------------------------------------------------- Secciones datos configurables ---------------------------------------------------
  nombreSeccion = "";
  bandMostrarAgregarSeccion = false;

  consultarSecciones() {
    this.secciones = [];

    this._backService.HttpPost("catalogos/Cliente/consultarSecciones", {}, {}).subscribe((data: any) => {
      this.secciones = eval(data);

      this.secciones.push({ idCampoSeccion: null, nombre: "Datos configurables" });

      for (var i = 0; i < this.secciones.length; i++) {
        this.secciones[i].camposConfigurables = [];
        this.secciones[i].nombreNuevoCampoConfigurable = "";
      }

      this.consultaConfigurables();
    }, error => {

    });
  }

  mostrarAgregarSeccion() {
    this.nombreSeccion = "";
    this.bandMostrarAgregarSeccion = true;
  }

  guardarSeccion() {
    if (this.nombreSeccion != "") {
      var params: any = {};
      params.nombre = this.nombreSeccion;

      this._backService.HttpPost("catalogos/Cliente/guardarSeccion", {}, params).subscribe((data: any) => {
        var dataAux = eval(data);
        if (dataAux != undefined && dataAux != null) {
          var indexSinSeccion = 0;
          for (var i = 0; i < this.secciones.length; i++) {
            if (this.secciones[i].idCampoSeccion == null) {
              indexSinSeccion = i;
            }
          }

          this.secciones.splice(indexSinSeccion, 0, { idCampoSeccion: dataAux[0].idCampoSeccion, nombre: this.nombreSeccion, camposConfigurables: [] });
          this.nombreSeccion = "";
        }
        else {
          //Ocurrió un error
        }
      }, error => {

      });
    }
    else {
      //Poner el input en rojo
    }
  }

  eliminarSeccion(s: any) {
    //MAGP 22/01/2022 Confirmar eliminar sección y campo
    s = this.seccionSeleccionado;

    var params: any = {};
    params.idCampoSeccion = s.idCampoSeccion;

    this._backService.HttpPost("catalogos/Cliente/eliminarSeccion", {}, params).subscribe((data: any) => {
      var indexSinSeccion = 0;
      for (var i = 0; i < this.secciones.length; i++) {
        if (this.secciones[i].idCampoSeccion == null) {
          indexSinSeccion = i;
        }
      }

      for (var i = 0; i < this.secciones.length; i++) {
        if (this.secciones[i].idCampoSeccion == s.idCampoSeccion) {
          for (var j = 0; j < this.secciones[i].camposConfigurables.length; j++) {
            this.secciones[i].camposConfigurables[j].idCampoSeccion = null;
            this.secciones[indexSinSeccion].camposConfigurables.push(JSON.parse(JSON.stringify(this.secciones[i].camposConfigurables[j])));
          }

          this.secciones.splice(i, 1);
          i--;
        }
      }
    }, error => {

    });
  }

  campoAEditar: any = {
    // idCampoSeccion: []
  };
  mostrarModalEditarCampoConfigurable(x: any, campo: any) {
    // this.campoAEditar = JSON.parse(JSON.stringify(campo));
    this.campoAEditar = {
      idCampoSeccion: campo.idCampoSeccion,
      nombre: campo.nombre,
      camposConfigurables: [],
      fechaAlta: x.fechaAlta,
      fechaBaja: x.fechaBaja,
      nombreNuevoCampoConfigurable: x.nombreNuevoCampoConfigurable,
      realizoAlta: x.realizoAlta,
      realizoBaja: x.realizoBaja,
      idCampo: campo.idCampo
    }

    this.modales.modalEditarCampoConfigurable.show();
  }

  cerrarModalEditarCampoConfigurable() {
    this.modales.modalEditarCampoConfigurable.hide();
  }

  editarCampoConfigurable() {

    var nombreRepetido = false;
    for (var i = 0; i < this.secciones.length; i++) {
      for (var j = 0; j < this.secciones[i].camposConfigurables.length; j++) {
        if (this.secciones[i].camposConfigurables[j].idCampo != this.campoAEditar.idCampo) {
          if (this.secciones[i].camposConfigurables[j].nombre.toUpperCase() == this.campoAEditar.nombre.toUpperCase()) {
            nombreRepetido = true;
          }
        }
      }
    }

    if (nombreRepetido == true || this.campoAEditar.nombre == "") {
      if (nombreRepetido == true) {
        this._toaster.error("Ya existe un Dato Configurable con ese nombre");
      }
    }
    else {

      var params: any = {};
      params.idCampo = this.campoAEditar.idCampo;
      params.nombre = this.campoAEditar.nombre;
      params.idCampoSeccion = this.campoAEditar.idCampoSeccion;

      this._backService.HttpPost("catalogos/Cliente/editarCampoConfigurable", {}, params).subscribe((data: any) => {
        var indexNuevaSeccion = 0;
        for (var i = 0; i < this.secciones.length; i++) {
          if (this.secciones[i].idCampoSeccion == this.campoAEditar.idCampoSeccion) {
            indexNuevaSeccion = i;
          }
        }

        var cambioHecho = false;
        for (var i = 0; i < this.secciones.length; i++) {
          for (var j = 0; j < this.secciones[i].camposConfigurables.length; j++) {
            if (this.secciones[i].camposConfigurables[j].idCampo == this.campoAEditar.idCampo) {

              this.secciones[i].camposConfigurables[j].nombre = this.campoAEditar.nombre
              this.secciones[i].camposConfigurables[j].idCampoSeccion = this.campoAEditar.idCampoSeccion;

              this.secciones[indexNuevaSeccion].camposConfigurables.push(JSON.parse(JSON.stringify(this.secciones[i].camposConfigurables[j])));

              this.secciones[i].camposConfigurables.splice(j, 1);
              j = this.secciones[i].camposConfigurables.length;
              cambioHecho = true;
            }
          }
          if (cambioHecho) {
            i = this.secciones.length;
          }
        }

        this.modales.modalEditarCampoConfigurable.hide();
      }, error => {

      });
    }
  }

  //MAGP 22/01/2022 Confirmación de eliminación de sección y campo configurable
  //Funcion que confirma el borrado de la sección
  confirmarBorrarSeccion(seccion: any) {
    this.seccionSeleccionado = seccion;

    $("#modal-confirmEliminarSeccion .modal-body").html('<span style="font-weight: 400;">' + this.clienteTranslate.deseaBorrarSeccion + '</span>');
    this.modales.modalConfirmEliminarSeccion.show();
  }

  confirmarEliminarConfigurables(campo: any) {
    this.campoSeleccionado = campo;

    $("#modal-confirmEliminarCampo .modal-body").html('<span style="font-weight: 400;">' + this.clienteTranslate.deseaBorrarCampo + '</span>');
    this.modales.modalConfirmEliminarCampo.show();
  }

  // ---------------------------- Se manda llamar la función principal de carga de toda la pantalla ----------------------------

  accesosPantalla: any = {
    clientesLectura: false,
    clientesAccion: false,
    descargarClientes: false,
  };
  consultaPrincipal1() {

    this._backService.HttpPost("catalogos/ConfiguracionPerfil/ConsultaVariblesSession", {}, {}).subscribe((data: any) => {
      this.accesosPantalla = {};
      var dataTemp = eval(data);

      for (var i = 0; i < dataTemp.length; i++) {
        switch (dataTemp[i].Codigo) {
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
      this.cargarPantallaCliente();
    }, error => {
      this._router.navigate(['/login']);
    });
  }

  validarSeleccionFecha() {
    var aux = new Date(), month = '' + (aux.getMonth() + 1), day = '' + aux.getDate(), year = aux.getFullYear();

    if (month.length < 2) {
      month = '0' + month;
    }
    if (day.length < 2) {
      day = '0' + day;
    }

    this.hoy = [year, month, day].join('-');
  }

  filtroEtiquetas() {
    if (typeof this.etiqueta.etiquetaSeleccionada !== 'string') {
      return;
    }

    this.etiqueta.dataEtiquetasFiltro = this.etiqueta.dataEtiquetas.filter(
      (eti: any) => {
        if (eti.nombre.toUpperCase().match(this.etiqueta.etiquetaSeleccionada.toUpperCase()) != null) {
          return eti;
        }
      }
    );
  }

  displayEtiquetas(item: any) {
    return item ? item.nombre : '';
  }

  irAAgenda() {
    this._router.navigate(['/procesos/agenda']);
  }

  irAClientes() {
    this._router.navigate(['/catalogos/cliente'], {
      queryParams: { idEtiqueta: 'N' }
    });
  }

  verFormularioRespuestas(item: any) {

    this.cargarFormulario(item.idFormulario, item.idFormularioRespuesta);
    this.notas_modalFormularioRespuesta();
  }

  cargarFormulario(idFormularo: number, idFormularioRespuesta: number) {
    console.log('formularo')
    this.formulario_cliente = [];
    this.secciones_cliente_formulario = [];
    this.campos_cliente = [];
    this.campos_detalle_cliente_check = [];
    this.campos_detalle_cliente_om = [];
    this.campos_detalle_cliente_ld = [];


    this._pantallaServicio.mostrarSpinner();
    this._backService.HttpPost("aspxs/FormularioRespuesta/cargarFormularioRespuesta", {}, { idFormulario: idFormularo, idFormularioRespuesta: idFormularioRespuesta }).subscribe(
      response => {
        console.log(response)
        this.formulario_cliente = response.Formularios;
        this.secciones_cliente_formulario = response.Secciones;
        this.campos_cliente = response.Campos;
        for (let i = 0; i < this.campos_cliente.length; i++) {
          if (this.campos_cliente[i].idTipoElementoFormulario === 8) {
            this.campos_cliente[i].dibujo = SignaturePadComponent;
          }
        }

        this.campos_detalle_cliente_check = response.OpcionesCheck;
        this.campos_detalle_cliente_om = response.Opciones;
        this.campos_detalle_cliente_ld = response.Listas;
        this._pantallaServicio.ocultarSpinner();
      },
      error => {
        this._toaster.error("Ha ocurrido un error");
        this._pantallaServicio.ocultarSpinner();
      }
    );
  }
  notas_modalFormularioRespuesta() {
    this.modales.modalFormularioRespuesta.show();
  };

  notas_cerrarModalFormularioRespuesta() {

    this.modales.modalFormularioRespuesta.hide();

  }

  notas_cerrarModalFormularioRespuestaUsuario() {
    console.log('entro')
    if (this.validarRegistrosCerrar()) {
      $("#modal-confirmFormularioRespuesta .modal-body").html('<span style="font-weight: 400;">' + '¿Desea descartar los cambios?' + '</span>');
      this.modales.modalConfirmFormularioRespuesta.show();
    } else {
      this.modales.modalFormularioResponderUsuario.hide();
      this.limpiarFomulario();
    }
  }

  validarRegistrosCerrar(): boolean {

    let resultado = false;
    this.respuesta = [];
    this.opciones = [];
    this.opciones_check = [];
    this.opciones_list = [];
    this.errorValidacion = "";

    for (let i = 0; i < this.campos_cliente.length; i++) {


      if (this.campos_cliente[i].idTipoElementoFormulario == 1) {//Opción Multiple - Respuesta Multiple

        this.opciones_check = this.campos_detalle_cliente_check.filter((e: any) => e.idFormularioElemento == this.campos_cliente[i].idFormularioElemento);

        for (let j = 0; j < this.opciones_check.length; j++) {

          var element = <HTMLInputElement>document.getElementById('OM-' + this.opciones_check[j].idFormularioOpcion);
          if (element.checked == true) {
            resultado = true;
            break;
          }

        }

      }

      if (this.campos_cliente[i].idTipoElementoFormulario == 2) {//Opción Multiple - Respuesta Sencilla

        this.opciones = this.campos_detalle_cliente_om.filter((e: any) => e.idFormularioElemento == this.campos_cliente[i].idFormularioElemento);

        for (let j = 0; j < this.opciones.length; j++) {
          var respuesta_sencilla = <HTMLInputElement>document.getElementById('OP-' + this.opciones[j].idFormularioOpcion);
          if (respuesta_sencilla.checked == true) {
            resultado = true;
            break;
          }
        }

      }

      if (this.campos_cliente[i].idTipoElementoFormulario == 3) {//Texto

        var respuesta = (<HTMLInputElement>document.getElementById('TEXT-' + this.campos_cliente[i].idFormularioElemento)).value;

        if (respuesta.trim() != '') {
          resultado = true;
          break;
        }

      }

      if (this.campos_cliente[i].idTipoElementoFormulario == 4) {//Lista

        var list = (<HTMLInputElement>document.getElementById('LIST-' + this.campos_cliente[i].idFormularioElemento)).value;
        if (list != "0") {
          resultado = true;
          break;
        }

      }

    }

    return resultado;

  }

  cerrarFormularioRespuesta() {
    this.modales.modalFormularioRespuesta.hide();
    this.limpiarFomulario()
  }

  cancelarFormularioRespuesta() {
    this.modales.modalConfirmFormularioRespuesta.hide();
    // this.modales.modalFormularioResponderUsuario.show();
  }

  cargarFormulariosCreados() {
    this._backService.HttpPost("catalogos/Formulario/consultaFormularios", {}, {}).subscribe((response: any) => {
      this.formularios = response.Formularios;
    }, error => {
    });
  }

  onChangeFormulario(valorSeleccionado: any) {
    this.idFormulario = 0;
    this.idFormulario = valorSeleccionado.target.value;
  }

  /* Validamos los campos para poder camiar los colores
  y advertencias de los campos faltantes */

  onChangeOpcionMultiple(event: any[], requerido: number) {

    let seleccionados = 0;
    var a = <HTMLInputElement>document.getElementById('error' + event);

    var checksSeleccionados = this.campos_detalle_cliente_check.filter((e: any) => e.idFormularioElemento == event);

    for (let j = 0; j < checksSeleccionados.length; j++) {

      var element = <HTMLInputElement>document.getElementById('OM-' + checksSeleccionados[j].idFormularioOpcion);
      if (element.checked == true) {
        seleccionados++;
      }
    }

    if (requerido == 0) {
      a.innerHTML = "";
    } else {
      if (seleccionados > 0) {
        a.innerHTML = "";
      } else {
        a.innerHTML = "  * Requerido. ";
      }

    }

  }

  onChangeOpcion(event: any[], requerido: number) {
    let opciones = 0;
    var a = <HTMLInputElement>document.getElementById('error' + event);

    var opcionesSeleccionadas = this.campos_detalle_cliente_om.filter((e: any) => e.idFormularioElemento == event);

    for (let j = 0; j < opcionesSeleccionadas.length; j++) {
      var respuesta_sencilla = <HTMLInputElement>document.getElementById('OP-' + opcionesSeleccionadas[j].idFormularioOpcion);
      if (respuesta_sencilla.checked == true) {
        opciones++;
      }
    }

    if (requerido == 0) {
      a.innerHTML = "";
    }
    else {
      if (opciones > 0) {
        a.innerHTML = "";
      } else {
        a.innerHTML = "  * Requerido. ";
      }
    }

  }

  onChangeText(event: any[], requerido: number) {
    var respuesta = (<HTMLInputElement>document.getElementById('TEXT-' + event)).value;

    if (respuesta.trim() != '') {
      $("#" + 'TEXT-' + event).removeClass("errorCampo");

    } else {
      if (requerido == 0) {
        $("#" + 'TEXT-' + event).removeClass("errorCampo");
      } else {
        $("#" + 'TEXT-' + event).addClass("errorCampo");
      }

    }
  }

  onChangeTextSinInput(event: any[], requerido: number) {
    var respuesta = (<HTMLInputElement>document.getElementById('TEXTSI-' + event)).value;

    if (respuesta.trim() != '') {
      $("#" + 'TEXTSI-' + event).removeClass("errorCampo");

    } else {
      if (requerido == 0) {
        $("#" + 'TEXTSI-' + event).removeClass("errorCampo");
      } else {
        $("#" + 'TEXTSI-' + event).addClass("errorCampo");
      }

    }
  }
  onChangeLista(event: any[], requerido: number) {
    var list = (<HTMLInputElement>document.getElementById('LIST-' + event)).value;
    var pregunta = <HTMLInputElement>document.getElementById('LIST-' + event);

    if (list != "0")
      pregunta.style.outline = "1px solid #ced4da";
    else {
      if (requerido == 0) {
        pregunta.style.outline = "1px solid #ced4da";
      } else {
        pregunta.style.outline = "1px solid red";
      }

    }
  }

  guardarRespuesta(opcion: number) {
    this.BTN_CLICK_RESPONDER_FORM = true;
    this.respuesta = [];
    this.opciones = [];
    this.opciones_check = [];
    this.opciones_list = [];
    this.errorValidacion = "";

    for (let i = 0; i < this.campos_cliente.length; i++) {
      console.log(this.campos_cliente);
      if (this.campos_cliente[i].idTipoElementoFormulario == 1) {//Opción Multiple - Respuesta Multiple

        let contador_resmu = 0;

        this.opciones_check = this.campos_detalle_cliente_check.filter((e: any) => e.idFormularioElemento == this.campos_cliente[i].idFormularioElemento);

        for (let j = 0; j < this.opciones_check.length; j++) {

          var element = <HTMLInputElement>document.getElementById('OM-' + this.opciones_check[j].idFormularioOpcion);
          if (element.checked == true) {
            this.respuesta.push({ "idFormularioElemento": this.campos_cliente[i].idFormularioElemento, "respuestaLibre": "", "idFormularioOpcion": this.opciones_check[j].idFormularioOpcion });
            contador_resmu++;
          }

        }

        if (contador_resmu == 0 && this.campos_cliente[i].esRequerido === 1) {
          // $("#txtTelefono").addClass("errorCampo");
          if (opcion == 1) {
            var error = <HTMLInputElement>document.getElementById('error' + this.campos_cliente[i].idFormularioElemento);
            error.innerHTML = "  * Requerido. ";
          }

          this.errorValidacion += "\n" + this.campos_cliente[i].descripcion + " * ";
        } else {
          if (opcion == 1) {
            var error = <HTMLInputElement>document.getElementById('error' + this.campos_cliente[i].idFormularioElemento);
            error.innerHTML = "";
          }


        }

      }

      if (this.campos_cliente[i].idTipoElementoFormulario == 2) {//Opción Multiple - Respuesta Sencilla
        let contador_resop = 0;

        this.opciones = this.campos_detalle_cliente_om.filter((e: any) => e.idFormularioElemento == this.campos_cliente[i].idFormularioElemento);

        for (let j = 0; j < this.opciones.length; j++) {
          var respuesta_sencilla = <HTMLInputElement>document.getElementById('OP-' + this.opciones[j].idFormularioOpcion);
          if (respuesta_sencilla.checked == true) {
            this.respuesta.push({ "idFormularioElemento": this.campos_cliente[i].idFormularioElemento, "respuestaLibre": "", "idFormularioOpcion": this.opciones[j].idFormularioOpcion });
            contador_resop++;
          }
        }

        if (contador_resop == 0 && this.campos_cliente[i].esRequerido === 1) {
          if (opcion == 1) {
            var error = <HTMLInputElement>document.getElementById('error' + this.campos_cliente[i].idFormularioElemento);
            error.innerHTML = "  * Requerido. ";

            this.errorValidacion += "\n" + this.campos_cliente[i].descripcion + " * ";
          }
        }

      }

      if (this.campos_cliente[i].idTipoElementoFormulario == 3) {//Texto

        var respuesta = (<HTMLInputElement>document.getElementById('TEXT-' + this.campos_cliente[i].idFormularioElemento)).value;

        if (respuesta.trim() != '') {
          $("#" + 'TEXT-' + this.campos_cliente[i].idFormularioElemento).removeClass("errorCampo");
          this.respuesta.push({ "idFormularioElemento": this.campos_cliente[i].idFormularioElemento, "respuestaLibre": respuesta.trim(), "idFormularioOpcion": 0 });
        }
        else {

          if (this.campos_cliente[i].esRequerido === 1) {
            if (opcion == 1) {
              var preguntatex = <HTMLInputElement>document.getElementById('TEXT-' + this.campos_cliente[i].idFormularioElemento);
              preguntatex.style.outline = "1px solid red";


              $("#" + 'TEXT-' + this.campos_cliente[i].idFormularioElemento).addClass("errorCampo");
              this.errorValidacion += "\n" + this.campos_cliente[i].descripcion + " * ";
            }
          }

        }


      }

      if (this.campos_cliente[i].idTipoElementoFormulario == 4) {//Lista

        this.opciones_list = this.campos_detalle_cliente_ld.filter((e: any) => e.idFormularioElemento == this.campos_cliente[i].idFormularioElemento);
        var list = (<HTMLInputElement>document.getElementById('LIST-' + this.campos_cliente[i].idFormularioElemento)).value;

        if (list != "0" && this.campos_cliente[i].esRequerido === 1) {
          console.log(list)
          this.respuesta.push({ "idFormularioElemento": this.campos_cliente[i].idFormularioElemento, "respuestaLibre": "", "idFormularioOpcion": list });

        }
        else {
          if (this.campos_cliente[i].esRequerido === 1) {
            if (opcion == 1) {
              var pregunta = <HTMLInputElement>document.getElementById('LIST-' + this.campos_cliente[i].idFormularioElemento);

              pregunta.style.outline = "1px solid red";
              this.errorValidacion += "\n" + this.campos_cliente[i].descripcion + " * ";
            }
          }
        }

        if (list != "0" && this.campos_cliente[i].esRequerido === 0) {
          this.respuesta.push({ "idFormularioElemento": this.campos_cliente[i].idFormularioElemento, "respuestaLibre": "", "idFormularioOpcion": list });

        }


      }

      if (this.campos_cliente[i].idTipoElementoFormulario == 6) {//Texto

        var respuesta = (<HTMLInputElement>document.getElementById('TEXTSI-' + this.campos_cliente[i].idFormularioElemento)).value;
        if (respuesta.trim() != '') {
          $("#" + 'TEXTSI-' + this.campos_cliente[i].idFormularioElemento).removeClass("errorCampo");
          this.respuesta.push({ "idFormularioElemento": this.campos_cliente[i].idFormularioElemento, "respuestaLibre": respuesta.trim(), "idFormularioOpcion": 0 });
        }
        else {

          if (this.campos_cliente[i].esRequerido === 1) {
            if (opcion == 1) {
              var preguntatex = <HTMLInputElement>document.getElementById('TEXTSI-' + this.campos_cliente[i].idFormularioElemento);
              preguntatex.style.outline = "1px solid red";


              $("#" + 'TEXTSI-' + this.campos_cliente[i].idFormularioElemento).addClass("errorCampo");
              this.errorValidacion += "\n" + this.campos_cliente[i].descripcion + " * ";
            }
          }

        }


      }

      if (this.campos_cliente[i].idTipoElementoFormulario === 7) {
        if ((this.campos_cliente[i].imagenPath?.lenght === 0 || !this.campos_cliente[i].imagenPath) && this.campos_cliente[i].esRequerido === 1) {
          this.errorValidacion += "\n" + this.campos_cliente[i].descripcion + " * ";
        } else {
          this.respuesta.push({ "idFormularioElemento": this.campos_cliente[i].idFormularioElemento, "respuestaLibre": ``, "idFormularioOpcion": 0, imagenPath: this.campos_cliente[i].imagenPath });

        }
      }
      if (this.campos_cliente[i].idTipoElementoFormulario === 8) {
        if ((this.campos_cliente[i].imagenPath?.lenght === 0 || !this.campos_cliente[i].imagenPath) && this.campos_cliente[i].esRequerido === 1) {
          this.errorValidacion += "\n" + this.campos_cliente[i].descripcion + " * ";
        } else {
          this.respuesta.push({ "idFormularioElemento": this.campos_cliente[i].idFormularioElemento, "respuestaLibre": ``, "idFormularioOpcion": 0, imagenPath: this.campos_cliente[i].imagenPath });

        }
      }



    }

    if (opcion === 1) {
      if (this.errorValidacion != "") {
        console.log(this.campos_cliente);
        //this._toaster.error("Campos Incompletos");
      } else {
        this._pantallaServicio.mostrarSpinner();
        var params = {
          idFormulario: this.formulario_cliente[0].idFormulario,
          idCliente: this.notas.idCliente,
          fechaVigencia: '',
          respuestas: this.respuesta
        }

        this._backService.HttpPost("catalogos/Formulario/guardarFormulario", {}, params).subscribe(
          response => {
            if (response > 0) {

              this._pantallaServicio.ocultarSpinner();
              this._toaster.success("Las respuestas fueron guardadas.");
              //limpiamos los arrreglos
              this.limpiarFomulario();
              this.notas_consultaNotas()

            }
            else {
              if (response == 0) {
                this._toaster.error("Ha ocurrido un error interno comunicar al Administrador");
              }
              else if (response == -1) {
                this._toaster.error("Ya no se cumple con la fecha de Vigencia");
              }

              this._pantallaServicio.ocultarSpinner();
            }


          },
          error => {
            this._toaster.error("Ha ocurrido un error");
            this._pantallaServicio.ocultarSpinner();
          }
        );
      }

    }
  }


  guardarRespuestaImprimir(opcion: number) {
    this.respuesta = [];
    this.opciones = [];
    this.opciones_check = [];
    this.opciones_list = [];
    this.errorValidacion = "";

    for (let i = 0; i < this.campos_cliente.length; i++) {
      console.log(this.campos_cliente);
      if (this.campos_cliente[i].idTipoElementoFormulario == 1) {//Opción Multiple - Respuesta Multiple

        let contador_resmu = 0;

        this.opciones_check = this.campos_detalle_cliente_check.filter((e: any) => e.idFormularioElemento == this.campos_cliente[i].idFormularioElemento);

        for (let j = 0; j < this.opciones_check.length; j++) {

          var element = <HTMLInputElement>document.getElementById('OMRES-' + this.opciones_check[j].idFormularioOpcion);
          if (element.checked == true) {
            this.respuesta.push({ "idFormularioElemento": this.campos_cliente[i].idFormularioElemento, "respuestaLibre": "", "idFormularioOpcion": this.opciones_check[j].idFormularioOpcion });
            contador_resmu++;
          }

        }

        if (contador_resmu == 0 && this.campos_cliente[i].esRequerido === 1) {
          // $("#txtTelefono").addClass("errorCampo");
          if (opcion == 1) {
            var error = <HTMLInputElement>document.getElementById('error' + this.campos_cliente[i].idFormularioElemento);
            error.innerHTML = "  * Requerido. ";
          }

          this.errorValidacion += "\n" + this.campos_cliente[i].descripcion + " * ";
        } else {
          if (opcion == 1) {
            var error = <HTMLInputElement>document.getElementById('error' + this.campos_cliente[i].idFormularioElemento);
            error.innerHTML = "";
          }


        }

      }

      if (this.campos_cliente[i].idTipoElementoFormulario == 2) {//Opción Multiple - Respuesta Sencilla
        let contador_resop = 0;

        this.opciones = this.campos_detalle_cliente_om.filter((e: any) => e.idFormularioElemento == this.campos_cliente[i].idFormularioElemento);

        for (let j = 0; j < this.opciones.length; j++) {
          var respuesta_sencilla = <HTMLInputElement>document.getElementById('OPRES-' + this.opciones[j].idFormularioOpcion);
          if (respuesta_sencilla.checked == true) {
            this.respuesta.push({ "idFormularioElemento": this.campos_cliente[i].idFormularioElemento, "respuestaLibre": "", "idFormularioOpcion": this.opciones[j].idFormularioOpcion });
            contador_resop++;
          }
        }

        if (contador_resop == 0 && this.campos_cliente[i].esRequerido === 1) {
          if (opcion == 1) {
            var error = <HTMLInputElement>document.getElementById('error' + this.campos_cliente[i].idFormularioElemento);
            error.innerHTML = "  * Requerido. ";

            this.errorValidacion += "\n" + this.campos_cliente[i].descripcion + " * ";
          }
        }

      }

      if (this.campos_cliente[i].idTipoElementoFormulario == 3) {//Texto

        var respuesta = (<HTMLInputElement>document.getElementById('TEXTRES-' + this.campos_cliente[i].idFormularioElemento)).value;

        if (respuesta.trim() != '') {
          $("#" + 'TEXTRES-' + this.campos_cliente[i].idFormularioElemento).removeClass("errorCampo");
          this.respuesta.push({ "idFormularioElemento": this.campos_cliente[i].idFormularioElemento, "respuestaLibre": respuesta.trim(), "idFormularioOpcion": 0 });
        }
        else {

          if (this.campos_cliente[i].esRequerido === 1) {
            if (opcion == 1) {
              var preguntatex = <HTMLInputElement>document.getElementById('TEXTRES-' + this.campos_cliente[i].idFormularioElemento);
              preguntatex.style.outline = "1px solid red";


              $("#" + 'TEXTRES-' + this.campos_cliente[i].idFormularioElemento).addClass("errorCampo");
              this.errorValidacion += "\n" + this.campos_cliente[i].descripcion + " * ";
            }
          }

        }


      }

      if (this.campos_cliente[i].idTipoElementoFormulario == 4) {//Lista

        this.opciones_list = this.campos_detalle_cliente_ld.filter((e: any) => e.idFormularioElemento == this.campos_cliente[i].idFormularioElemento);
        var list = (<HTMLInputElement>document.getElementById('LISTRES-' + this.campos_cliente[i].idFormularioElemento)).value;

        if (list != "0" && this.campos_cliente[i].esRequerido === 1) {
          console.log(list)
          this.respuesta.push({ "idFormularioElemento": this.campos_cliente[i].idFormularioElemento, "respuestaLibre": "", "idFormularioOpcion": list });

        }
        else {
          if (this.campos_cliente[i].esRequerido === 1) {
            if (opcion == 1) {
              var pregunta = <HTMLInputElement>document.getElementById('LISTRES-' + this.campos_cliente[i].idFormularioElemento);

              pregunta.style.outline = "1px solid red";
              this.errorValidacion += "\n" + this.campos_cliente[i].descripcion + " * ";
            }
          }
        }

        if (list != "0" && this.campos_cliente[i].esRequerido === 0) {
          this.respuesta.push({ "idFormularioElemento": this.campos_cliente[i].idFormularioElemento, "respuestaLibre": "", "idFormularioOpcion": list });

        }


      }

      if (this.campos_cliente[i].idTipoElementoFormulario == 6) {//Texto

        var respuesta = (<HTMLInputElement>document.getElementById('TEXTRES-' + this.campos_cliente[i].idFormularioElemento)).value;
        console.log(this.campos_cliente[i])
        console.log(respuesta);
        if (respuesta.trim() != '') {
          $("#" + 'TEXTRES-' + this.campos_cliente[i].idFormularioElemento).removeClass("errorCampo");
          this.respuesta.push({ "idFormularioElemento": this.campos_cliente[i].idFormularioElemento, "respuestaLibre": respuesta.trim(), "idFormularioOpcion": 0 });
        }
        else {

          if (this.campos_cliente[i].esRequerido === 1) {
            if (opcion == 1) {
              var preguntatex = <HTMLInputElement>document.getElementById('TEXTRES-' + this.campos_cliente[i].idFormularioElemento);
              preguntatex.style.outline = "1px solid red";


              $("#" + 'TEXTRES-' + this.campos_cliente[i].idFormularioElemento).addClass("errorCampo");
              this.errorValidacion += "\n" + this.campos_cliente[i].descripcion + " * ";
            }
          }

        }


      }

      if (this.campos_cliente[i].idTipoElementoFormulario === 7) {

        let respuesta = (<HTMLImageElement>document.getElementById('img-elemento-' + this.campos_cliente[i].idFormularioElemento));
        this.respuesta.push({ "idFormularioElemento": this.campos_cliente[i].idFormularioElemento, "respuestaLibre": ``, "idFormularioOpcion": 0, imagenPath: this.campos_cliente[i].imagenPath });
      }

      if (this.campos_cliente[i].idTipoElementoFormulario === 8) {
        this.respuesta.push({ "idFormularioElemento": this.campos_cliente[i].idFormularioElemento, "respuestaLibre": ``, "idFormularioOpcion": 0, imagenPath: this.campos_cliente[i].imagenPath });

      }


    }

  }

  imprimirFormularioRespuesta() {

    this._pantallaServicio.mostrarSpinner();
    this.guardarRespuestaImprimir(0);
    var params = {
      idFormulario: this.formulario_cliente[0].idFormulario,
      respuestas: this.respuesta
    }

    this._backService.HttpPost("catalogos/Formulario/imprimirFormulario", {}, params).subscribe(
      response => {
        if (response != "") {
          const path = 'data:application/pdf;base64,' + response;
          const dowloand = document.createElement('a');
          dowloand.href = path;
          dowloand.download = this.formulario_cliente[0].nombre + ".pdf";

          dowloand.click();
          this._pantallaServicio.ocultarSpinner();
        }

        this._pantallaServicio.ocultarSpinner();


      },
      error => {
        this._toaster.error("Ha ocurrido un error");
        this._pantallaServicio.ocultarSpinner();
      }
    );

    console.log(this.respuesta);
  }


  imprimirFormulario() {

    this._pantallaServicio.mostrarSpinner();
    this.guardarRespuesta(0);
    var params = {
      idFormulario: this.formulario_cliente[0].idFormulario,
      respuestas: this.respuesta
    }

    this._backService.HttpPost("catalogos/Formulario/imprimirFormulario", {}, params).subscribe(
      response => {
        if (response != "") {
          const path = 'data:application/pdf;base64,' + response;
          const dowloand = document.createElement('a');
          dowloand.href = path;
          dowloand.download = this.formulario_cliente[0].nombre + ".pdf";

          dowloand.click();
          this._pantallaServicio.ocultarSpinner();
        }

        this._pantallaServicio.ocultarSpinner();


      },
      error => {
        this._toaster.error("Ha ocurrido un error");
        this._pantallaServicio.ocultarSpinner();
      }
    );

  }

  limpiarFomulario() {
    this.formularios = [];
    this.cargarFormulariosCreados();
    this.idFormulario = 0;
    this.BTN_CLICK_RESPONDER_FORM = false;
    this.modales.modalFormularioResponderUsuario.hide();
  }

  contestarFormularioUsuario(id: number) {
    this.formulario_cliente = [];
    this.secciones_cliente_formulario = [];
    this.campos_cliente = [];
    this.campos_detalle_cliente_check = [];
    this.campos_detalle_cliente_om = [];
    this.campos_detalle_cliente_ld = [];

    if (id > 0) {
      var params = {
        idFormulario: id,
      }
      this._pantallaServicio.mostrarSpinner();
      this._backService.HttpPost("catalogos/Formulario/consultaFormulario", {}, params).subscribe((response: any) => {
        console.log(response);
        this.formulario_cliente = response.Formularios;
        this.secciones_cliente_formulario = response.Secciones;
        this.campos_cliente = response.Campos;
        this.campos_detalle_cliente_check = response.OpcionesCheck;
        this.campos_detalle_cliente_om = response.Opciones;
        this.campos_detalle_cliente_ld = response.Listas;
        console.log(response)
        this._pantallaServicio.ocultarSpinner();
      }, error => {
        this._pantallaServicio.ocultarSpinner();
      });
      this.idFormulario = 0;
      this.modales.modalFormularioResponderUsuario.show();

    }
  }


  imagePreview(e: any, campo: any) {
    const file: File = e.target.files[0];
    // const filev = file;
    const render = new FileReader();
    render.onload = () => {
      campo.imagenPath = render.result as string;
    };
    render.readAsDataURL(file);
    e.srcElement.value = null;
  }


  copiarLinkFormulario() {
    this.BTN_CLICK_COPIAR_LINK = true;
    let el: any = document.getElementById('textoACopiar');

    if (navigator.userAgent.match(/ipad|ipod|iphone/i)) {
      var oldContentEditable = el.contentEditable,
      oldReadOnly = el.readOnly,
      range = document.createRange();

      el.contentEditable = true;
      el.readOnly = false;
      range.selectNodeContents(el);

      let s: any = window.getSelection();
      s.removeAllRanges();
      s.addRange(range);

      el.setSelectionRange(0, 999999); // A big number, to cover anything that could be inside the element.

      el.contentEditable = oldContentEditable;
      el.readOnly = oldReadOnly;

      document.execCommand('copy');

    } else {
      this.clipboard.copy(this.textoACopiar);
    }
  }

  generarLinkFormulario() {
    this.BTN_CLICK_COPIAR_LINK = false;

    let fechaActual = new Date();


    if (this.idFormulario > 0) {

      this.mostrarLiga = true;

      this._backService.HttpPost("catalogos/Formulario/fechaFormulario", {}, {}).subscribe((response: any) => {
        var param = this._urlEncrypt.encrypt(this.idFormulario + "," + this.clienteSeleccionado + "," + response);
        this.textoACopiar = environment.urlMigracion + "formulario?param=" + param;
      }, error => {
      });

      //     var param = this._urlEncrypt.encrypt(this.idFormulario + "," + this.clienteSeleccionado + "," );
      // this.textoACopiar = ;

      /*var params = {
          link : environment.urlMigracion + "formulario?param=" + this.idFormulario + "," + this.clienteSeleccionado + "," + fechaActual.getFullYear() + ((fechaActual.getMonth() + 1) <= 9 ? "0" + (fechaActual.getMonth() + 1) : (fechaActual.getMonth() + 1))  + (fechaActual.getDate() <= 9 ? "0" + fechaActual.getDate() : fechaActual.getDate())
      }*/

      /*   this._backService.HttpPost("catalogos/Formulario/generarLinkFormulario", {}, params).subscribe((response: any) => {
             console.log(response);
             this.textoACopiar = response;
         }, error => {
         });*/
    }
    else
      this.mostrarLiga = false;
    // console.log('eggeelink');

    // this.modales.generarLinkFormulario.show();
  }

}
