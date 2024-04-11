import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MethodsService } from 'src/app/core/services/methods.service';
import { PantallaService } from 'src/app/core/services/pantalla.service';
import { ToasterService } from 'src/shared/toaster/toaster.service';
declare var $: any; // JQUERY
import * as bootstrap from 'bootstrap'; // BOOTSTRAP
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'app-perfil-usuario',
    templateUrl: './perfil-usuario.component.html',
    styleUrls: ['./perfil-usuario.component.scss', '../../page.component.scss']
})
export class PerfilUsuarioComponent implements OnInit {

    // Variables de Translate
    consultaUsuarioTranslate: any = {};

    // Modales
    modales: any = {};

    displayedColumns: any[] = ['acciones', "nombre", "fecha"];

    dataSource = new MatTableDataSource<any>([]);
    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

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

        this._translate.get('consultaUsuarioTranslate').subscribe((translated) => {
            this.consultaUsuarioTranslate = this._translate.instant('consultaUsuarioTranslate');
        });

        this.matIconRegistry.addSvgIcon('iconAgregar', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Agregar-1-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconCasa1', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Casa1-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconFlecha1DerechaPeque', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/FlechaDerechaPequena-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconEditar', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Editar-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconBasura', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Basura-icon.svg"));
    }

    ngOnInit(): void {
        /*Catalogo de perfiles por defecto  para pruebas*/
        var ArrayCatalogosPerfiles = [];
        var text1 = { "idCatalogoPerfil": "1", "nombreCatalogo": "Asistente" };
        ArrayCatalogosPerfiles.push(text1);
        var text2 = { "idCatalogoPerfil": "2", "nombreCatalogo": "Gerente General" };
        ArrayCatalogosPerfiles.push(text2);
        this.configPerfilUsuarios.perfilesDefecto = ArrayCatalogosPerfiles;


        this.configPerfilUsuarios_declararGrid();
        this.configPerfilUsuarios_consultarPerfilesUsuarios();

        this.configPerfilUsuarios.nombrePerfil = "";
        this.configPerfilUsuarios.modulosSeleccionados = [];
        this.configPerfilUsuarios.idModulosSeleccionados = [];
        this.configPerfilUsuarios.visTablaEncabezados = 0;

        this.configPerfilUsuarios.editarPerfilVal = 0;
        this.configPerfilUsuarios.idPerfilSucursalTipo = null;

        this.configPerfilUsuarios_cargarInformacionCatalogoPerfiles();
        this.crearModales();
    }

    crearModales() {

        if ($("body").find(".modalEliminarPerfilUsuario").length > 1) {
            $("body").find(".modalEliminarPerfilUsuario")[1].remove();
        }
        this.modales.modalEliminarPerfilUsuario = new bootstrap.Modal($("#modalEliminarPerfilUsuario").appendTo("body"), {
            backdrop: "static",
            keyboard: false,
        });

    }

    ngAfterViewInit() {
        setTimeout(() => {
            this.paginator._intl.itemsPerPageLabel = 'Filas por página';
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
        });
    }


    configPerfilUsuarios: any = {
        verApartadoPerfiles: 0
    };

    rootScope_fromState = "perfiles";

    configPerfilUsuarios_declararGrid() {
        this.configPerfilUsuarios.gridOptions = {
            enableColumnMenus: false,
            enableSorting: true,
            paginationPageSizes: [15, 50, 100],
            paginationPageSize: 15,
            columnDefs: [
                { field: 'idPerfilSucursal', displayName: "Acciones", width: '150', enableSorting: false, cellClass: 'alignCenter', headerCellClass: 'alignCenter2', cellTemplate: '<div class="ui-grid-cell-contents" style="color:#337dc0;">	<li style="margin-left: 0px;font-size: 1.5em; cursor:pointer;"  class="iconos fa fa-pencil" ng-click="grid.appScope.configPerfilUsuarios.editarPerfilUsuario(row.entity.idPerfilSucursal,row.entity.Nombre)" ></li>	<li style="margin-left:19.5px;font-size: 1.5em; cursor:pointer;" class="iconos fa fa-trash-o" ng-click="grid.appScope.configPerfilUsuarios.validarEliminarPerfilUsuario(row.entity.idPerfilSucursal,row.entity.Nombre)"></li>	</div>' },
                { field: 'Nombre', displayName: "Nombre", width: '300', headerCellClass: 'alignCenter', cellClass: 'alignLeft2' },
                { field: 'Fecha', displayName: "Fecha", minWidth: '240', headerCellClass: 'alignCenter', cellClass: 'alignCenter', type: 'date', cellFilter: 'date:"dd/MM/yyyy hh:mm a"' }

            ],
            data: 'configPerfilUsuarios.perfilesUsuarios',
        };
    }

    //Cargar la tabla
    configPerfilUsuarios_consultarPerfilesUsuarios() {

        this._backService.HttpPost("catalogos/ConfiguracionPerfil/consultarPerfilesUsuarioNAdmin", {}, {}).subscribe((data: any) => {
            this._pantallaServicio.ocultarSpinner();
            this.configPerfilUsuarios.verApartadoPerfiles = 0;
            this.configPerfilUsuarios.perfilesUsuarios = eval(data);
            this.dataSource.data = data;
        }, error => {
            this._router.navigate(['/login']);
        });

        this._backService.HttpPost("catalogos/ConfiguracionPerfil/consultarTiposPerfilesUsuarios", {}, {}).subscribe((data: any) => {
            this.configPerfilUsuarios.tipoPerfilesUsuarios = eval(data);
        }, error => {
            this._router.navigate(['/login']);
        });

    }

    configPerfilUsuarios_cambioTipoPerfil() {

        var params: any = {};
        params.opcion = 5;
        if (this.configPerfilUsuarios.idPerfilSucursalTipo == undefined || this.configPerfilUsuarios.idPerfilSucursalTipo == null) {
            params.idPerfilSucursal = null;
        } else {
            params.idPerfilSucursal = this.configPerfilUsuarios.idPerfilSucursalTipo;
        }

        this._backService.HttpPost("catalogos/ConfiguracionPerfil/consultarModulosSeleccionables", {}, params).subscribe((data: any) => {
            var modulosSeleccionables = (eval(data));
            this.configPerfilUsuarios.idModulosSeleccionados = [];
            this.configPerfilUsuarios.modulosSeleccionables = [];
            this.configPerfilUsuarios.modulosSeleccionables = modulosSeleccionables;

            this.configPerfilUsuarios.totalCatalogoModulos = [];
            this.configPerfilUsuarios.totalCatalogoModulos = this.configPerfilUsuarios.modulosSeleccionables;

            //agrega la opcion "todos" a cada uno de los accesos
            for (var j = 0; j < this.configPerfilUsuarios.totalCatalogoModulos.length; j++) {
                var aregloAccesos: any = [];
                this.configPerfilUsuarios.totalCatalogoModulos[j].idModulo = j + 1;
                this.configPerfilUsuarios.totalCatalogoModulos[j].accesos = aregloAccesos;
                this.configPerfilUsuarios.totalCatalogoModulos[j].visualizar = 0;
            }

            var params: any = {};
            params.opcion = 6;
            if (this.configPerfilUsuarios.idPerfilSucursalTipo == undefined || this.configPerfilUsuarios.idPerfilSucursalTipo == null) {
                params.idPerfilSucursal = null;
            } else {
                params.idPerfilSucursal = this.configPerfilUsuarios.idPerfilSucursalTipo;
            }


            this._backService.HttpPost("catalogos/ConfiguracionPerfil/consultarModulosSeleccionables", {}, params).subscribe((data: any) => {
                var Accesos = (eval(data));

                //agrega los accesos de acuerdo al arreglo de parametros ocupados en la tabla
                for (var i = 0; i < Accesos.length; i++) {
                    for (var j = 0; j < this.configPerfilUsuarios.totalCatalogoModulos.length; j++) {
                        if (Accesos[i].modulo == this.configPerfilUsuarios.totalCatalogoModulos[j].nombreModulo) {
                            var arregloAcceso: any = { "contador": "0", "idAccesoSucursal": "1", "nombreAcceso": "Todo", "valor": "0", "tipoBordesAccesos": "2px dashed #f2f2f2", "checkboxSi": false, "checkboxNo": true, "codigo": "" };
                            arregloAcceso.idAccesoSucursal = Accesos[i].idAccesoSucursal;
                            arregloAcceso.nombreAcceso = Accesos[i].nombre;
                            arregloAcceso.valor = Accesos[i].valor;
                            arregloAcceso.codigo = Accesos[i].codigo;
                            if (Accesos[i].valor == 1) {
                                arregloAcceso.checkboxSi = 1;
                                arregloAcceso.checkboxNo = 0;
                            }
                            this.configPerfilUsuarios.totalCatalogoModulos[j].accesos.push(arregloAcceso);
                        }
                    }
                }

                //agrega el contador para cada acceso y tambien quita el estilo para el ultimo dato reistrado del arreglo
                for (var i = 0; i < this.configPerfilUsuarios.totalCatalogoModulos.length; i++) {
                    var validacion = 0;
                    var validacion2 = 0;
                    for (var j = 1; j < this.configPerfilUsuarios.totalCatalogoModulos[i].accesos.length; j++) {
                        this.configPerfilUsuarios.totalCatalogoModulos[i].accesos[j].contador = (this.configPerfilUsuarios.totalCatalogoModulos[i].accesos[j - 1].contador * 1) + 1;
                        if (j == this.configPerfilUsuarios.totalCatalogoModulos[i].accesos.length - 1) {
                            this.configPerfilUsuarios.totalCatalogoModulos[i].accesos[j].tipoBordesAccesos = "";
                        }
                        if (this.configPerfilUsuarios.totalCatalogoModulos[i].accesos[j].valor == 1) {
                            validacion++;
                        }
                        if (this.configPerfilUsuarios.totalCatalogoModulos[i].accesos[j].valor == 0) {
                            validacion2++;
                        }
                        if (validacion > 0 && validacion2 > 0) {
                            this.configPerfilUsuarios.totalCatalogoModulos[i].accesos[0].checkboxSi = 0;
                            this.configPerfilUsuarios.totalCatalogoModulos[i].accesos[0].checkboxNo = 0;
                        }
                        if (validacion == this.configPerfilUsuarios.totalCatalogoModulos[i].accesos.length - 1) {
                            this.configPerfilUsuarios.totalCatalogoModulos[i].accesos[0].checkboxSi = 1;
                            this.configPerfilUsuarios.totalCatalogoModulos[i].accesos[0].checkboxNo = 0;
                        }
                    }
                }


                var contadorValidacion = 0;

                for (var i = 0; i < this.configPerfilUsuarios.totalCatalogoModulos.length; i++) {
                    if (this.configPerfilUsuarios.totalCatalogoModulos[i].valor == 1) {

                        this.configPerfilUsuarios.idModulosSeleccionados.push(this.configPerfilUsuarios.totalCatalogoModulos[i]);
                        this.configPerfilUsuarios.totalCatalogoModulos[i].visualizar = 1;
                        this.configPerfilUsuarios.totalCatalogoModulos[i].visualizarLista = 0;
                        if (contadorValidacion == 0) {
                            this.configPerfilUsuarios.totalCatalogoModulos[i].visualizarLista = 1;
                            contadorValidacion = 1;
                        }

                    }
                }

                this.configPerfilUsuarios.visTablaEncabezados = this.configPerfilUsuarios.idModulosSeleccionados.length;
                this._pantallaServicio.ocultarSpinner();
                this.configPerfilUsuarios_traducirTabla();
            }, error => {
                this._router.navigate(['/login']);
            });

        }, error => {
            this._router.navigate(['/login']);
        });

    }

    configPerfilUsuarios_cambioPerfil() {
        var params: any = {};
        params.opcion = 0;
        if (this.configPerfilUsuarios.editarPerfilVal == 0) {
            params.idPerfilSucursal = null;
        } else {
            params.idPerfilSucursal = this.configPerfilUsuarios.idPerfilSucursal;
        }

        this._backService.HttpPost("catalogos/ConfiguracionPerfil/consultarModulosSeleccionables", {}, params).subscribe((data: any) => {
            var modulosSeleccionables = (eval(data));
            this.configPerfilUsuarios.idModulosSeleccionados = [];
            this.configPerfilUsuarios.modulosSeleccionables = [];
            this.configPerfilUsuarios.modulosSeleccionables = modulosSeleccionables;

            this.configPerfilUsuarios.totalCatalogoModulos = [];
            this.configPerfilUsuarios.totalCatalogoModulos = this.configPerfilUsuarios.modulosSeleccionables;

            //agrega la opcion "todos" a cada uno de los accesos
            for (var j = 0; j < this.configPerfilUsuarios.totalCatalogoModulos.length; j++) {
                var aregloAccesos: any = [];
                this.configPerfilUsuarios.totalCatalogoModulos[j].idModulo = j + 1;
                this.configPerfilUsuarios.totalCatalogoModulos[j].accesos = aregloAccesos;
                this.configPerfilUsuarios.totalCatalogoModulos[j].visualizar = 0;
            }

            var params: any = {};
            params.opcion = 1;
            if (this.configPerfilUsuarios.editarPerfilVal == 0) {
                params.idPerfilSucursal = null;
            } else {
                params.idPerfilSucursal = this.configPerfilUsuarios.idPerfilSucursal;
            }


            this._backService.HttpPost("catalogos/ConfiguracionPerfil/consultarModulosSeleccionables", {}, params).subscribe((data: any) => {
                var Accesos = (eval(data));

                //agrega los accesos de acuerdo al arreglo de parametros ocupados en la tabla
                for (var i = 0; i < Accesos.length; i++) {
                    for (var j = 0; j < this.configPerfilUsuarios.totalCatalogoModulos.length; j++) {
                        if (Accesos[i].modulo == this.configPerfilUsuarios.totalCatalogoModulos[j].nombreModulo) {
                            var arregloInvAcceso = { "contador": "0", "idAccesoSucursal": "1", "nombreAcceso": "Todo", "valor": "0", "tipoBordesAccesos": "2px dashed #f2f2f2", "checkboxSi": 0, "checkboxNo": 1, "codigo": "" };
                            arregloInvAcceso.idAccesoSucursal = Accesos[i].idAccesoSucursal;
                            arregloInvAcceso.nombreAcceso = Accesos[i].nombre;
                            arregloInvAcceso.valor = Accesos[i].valor;
                            arregloInvAcceso.codigo = Accesos[i].codigo;
                            if (Accesos[i].valor == 1) {
                                arregloInvAcceso.checkboxSi = 1;
                                arregloInvAcceso.checkboxNo = 0;
                            }
                            this.configPerfilUsuarios.totalCatalogoModulos[j].accesos.push(arregloInvAcceso);
                        }
                    }
                }

                //agrega el contador para cada acceso y tambien quita el estilo para el ultimo dato reistrado del arreglo
                for (var i = 0; i < this.configPerfilUsuarios.totalCatalogoModulos.length; i++) {
                    var validacion = 0;
                    var validacion2 = 0;
                    for (var j = 1; j < this.configPerfilUsuarios.totalCatalogoModulos[i].accesos.length; j++) {
                        this.configPerfilUsuarios.totalCatalogoModulos[i].accesos[j].contador = (this.configPerfilUsuarios.totalCatalogoModulos[i].accesos[j - 1].contador * 1) + 1;
                        if (j == this.configPerfilUsuarios.totalCatalogoModulos[i].accesos.length - 1) {
                            this.configPerfilUsuarios.totalCatalogoModulos[i].accesos[j].tipoBordesAccesos = "";
                        }
                        if (this.configPerfilUsuarios.totalCatalogoModulos[i].accesos[j].valor == 1) {
                            validacion++;
                        }
                        if (this.configPerfilUsuarios.totalCatalogoModulos[i].accesos[j].valor == 0) {
                            validacion2++;
                        }
                        if (validacion > 0 && validacion2 > 0) {
                            this.configPerfilUsuarios.totalCatalogoModulos[i].accesos[0].checkboxSi = 0;
                            this.configPerfilUsuarios.totalCatalogoModulos[i].accesos[0].checkboxNo = 0;
                        }
                        if (validacion == this.configPerfilUsuarios.totalCatalogoModulos[i].accesos.length - 1) {
                            this.configPerfilUsuarios.totalCatalogoModulos[i].accesos[0].checkboxSi = 1;
                            this.configPerfilUsuarios.totalCatalogoModulos[i].accesos[0].checkboxNo = 0;
                        }
                    }
                }

                var contadorValidacion = 0;

                for (var i = 0; i < this.configPerfilUsuarios.totalCatalogoModulos.length; i++) {
                    if (this.configPerfilUsuarios.totalCatalogoModulos[i].valor == 1) {

                        this.configPerfilUsuarios.idModulosSeleccionados.push(this.configPerfilUsuarios.totalCatalogoModulos[i].idModulo);
                        this.configPerfilUsuarios.totalCatalogoModulos[i].visualizar = 1;
                        this.configPerfilUsuarios.totalCatalogoModulos[i].visualizarLista = 0;
                        if (contadorValidacion == 0) {
                            this.configPerfilUsuarios.totalCatalogoModulos[i].visualizarLista = 1;
                            contadorValidacion = 1;
                        }
                    }
                }

                this.configPerfilUsuarios.visTablaEncabezados = this.configPerfilUsuarios.idModulosSeleccionados.length;

                this.configPerfilUsuarios_traducirTabla();
                this._pantallaServicio.ocultarSpinner();
                this.configPerfilUsuarios.verApartadoPerfiles = 1;
            }, error => {
                this._router.navigate(['/login']);
            });
        }, error => {
            this._router.navigate(['/login']);
        });

    }

    configPerfilUsuarios_editarPerfilUsuario(idPerfilSucursal: any, nombrePerfil: any) {
        this._pantallaServicio.mostrarSpinner();
        this.configPerfilUsuarios.idPerfilSucursal = idPerfilSucursal;
        this.configPerfilUsuarios.nombrePerfil = nombrePerfil;

        this.configPerfilUsuarios.modulosSeleccionados = [];
        this.configPerfilUsuarios.idModulosSeleccionados = [];
        this.configPerfilUsuarios.visTablaEncabezados = 0;

        this.configPerfilUsuarios.editarPerfilVal = 1;
        this.configPerfilUsuarios.idPerfilSucursalTipo = null;
        this.configPerfilUsuarios_cambioPerfil();

    }

    /*Cargar la informacion del catalogo de porfiles*/
    configPerfilUsuarios_cargarInformacionCatalogoPerfiles() {
        /*Tabla Catalogo de modulos que el usuario puede seleccionar para pruebas*/
        var params: any = {};

        params.opcion = 0;
        params.idPerfilSucursal = null;
        //busca los modulos seleccionables para la configuracion del perfil
        this._backService.HttpPost("catalogos/ConfiguracionPerfil/consultarModulosSeleccionables", {}, params).subscribe((data: any) => {
            var modulosSeleccionables = (eval(data));
            this.configPerfilUsuarios.modulosSeleccionables = [];
            this.configPerfilUsuarios.modulosSeleccionables = modulosSeleccionables;
            this.configPerfilUsuarios.totalCatalogoModulos = [];
            this.configPerfilUsuarios.totalCatalogoModulos = this.configPerfilUsuarios.modulosSeleccionables;

            //agrega la opcion "todos" a cada uno de los accesos
            for (var j = 0; j < this.configPerfilUsuarios.totalCatalogoModulos.length; j++) {
                var aregloAccesos: any = [];
                this.configPerfilUsuarios.totalCatalogoModulos[j].idModulo = j + 1;
                this.configPerfilUsuarios.totalCatalogoModulos[j].accesos = aregloAccesos;
                this.configPerfilUsuarios.totalCatalogoModulos[j].visualizar = 0;
            }

            var params: any = {};
            params.opcion = 1;
            params.idPerfilSucursal = null;
            //busca los accessos para la configuracion del perfil
            this._backService.HttpPost("catalogos/ConfiguracionPerfil/consultarModulosSeleccionables", {}, params).subscribe((data: any) => {
                var Accesos = (eval(data));
                //agrega los accesos de acuerdo al arreglo de parametros ocupados en la tabla
                var validacionSuscripcion = this.configPerfilUsuarios.totalCatalogoModulos.length;
                for (var i = 0; i < Accesos.length; i++) {
                    var arregloAcceso = { "contador": "0", "idAccesoSucursal": "1", "nombreAcceso": "Todo", "valor": "0", "tipoBordesAccesos": "2px dashed #f2f2f2", "checkboxSi": false, "checkboxNo": true, "codigo": "" };
                    arregloAcceso.idAccesoSucursal = Accesos[i].idAccesoSucursal;
                    arregloAcceso.nombreAcceso = Accesos[i].nombre;
                    arregloAcceso.valor = Accesos[i].valor;
                    arregloAcceso.codigo = Accesos[i].codigo;
                    if (Accesos[i].valor == 1) {
                        arregloAcceso.checkboxSi = true;
                        arregloAcceso.checkboxNo = false;
                    }
                    if (validacionSuscripcion > 11) {
                        switch (Accesos[i].modulo) {
                            case 'Agenda': this.configPerfilUsuarios.totalCatalogoModulos[0].accesos.push(arregloAcceso); break;
                            case 'Punto de Venta (Caja)': this.configPerfilUsuarios.totalCatalogoModulos[1].accesos.push(arregloAcceso); break;
                            case 'Servicios y Paquetes': this.configPerfilUsuarios.totalCatalogoModulos[2].accesos.push(arregloAcceso); break;
                            case 'Personal': this.configPerfilUsuarios.totalCatalogoModulos[3].accesos.push(arregloAcceso); break;
                            case 'Clientes': this.configPerfilUsuarios.totalCatalogoModulos[4].accesos.push(arregloAcceso); break;
                            case 'Facturacion': this.configPerfilUsuarios.totalCatalogoModulos[5].accesos.push(arregloAcceso); break;
                            case 'Promociones': this.configPerfilUsuarios.totalCatalogoModulos[6].accesos.push(arregloAcceso); break;
                            case 'Reportes': this.configPerfilUsuarios.totalCatalogoModulos[7].accesos.push(arregloAcceso); break;
                            case 'Configuracion': this.configPerfilUsuarios.totalCatalogoModulos[8].accesos.push(arregloAcceso); break;
                            case 'Inventario': this.configPerfilUsuarios.totalCatalogoModulos[9].accesos.push(arregloAcceso); break;
                            case 'Acceso App Negocio': this.configPerfilUsuarios.totalCatalogoModulos[10].accesos.push(arregloAcceso); break;
                            case 'Sucursal': this.configPerfilUsuarios.totalCatalogoModulos[11].accesos.push(arregloAcceso); break;
                            case 'Suscripción': this.configPerfilUsuarios.totalCatalogoModulos[12].accesos.push(arregloAcceso); break;
                        }
                    } else {
                        switch (Accesos[i].modulo) {
                            case 'Agenda': this.configPerfilUsuarios.totalCatalogoModulos[0].accesos.push(arregloAcceso); break;
                            case 'Punto de Venta (Caja)': this.configPerfilUsuarios.totalCatalogoModulos[1].accesos.push(arregloAcceso); break;
                            case 'Servicios y Paquetes': this.configPerfilUsuarios.totalCatalogoModulos[2].accesos.push(arregloAcceso); break;
                            case 'Personal': this.configPerfilUsuarios.totalCatalogoModulos[3].accesos.push(arregloAcceso); break;
                            case 'Clientes': this.configPerfilUsuarios.totalCatalogoModulos[4].accesos.push(arregloAcceso); break;
                            case 'Promociones': this.configPerfilUsuarios.totalCatalogoModulos[5].accesos.push(arregloAcceso); break;
                            case 'Reportes': this.configPerfilUsuarios.totalCatalogoModulos[6].accesos.push(arregloAcceso); break;
                            case 'Configuracion': this.configPerfilUsuarios.totalCatalogoModulos[7].accesos.push(arregloAcceso); break;
                            case 'Acceso App Negocio': this.configPerfilUsuarios.totalCatalogoModulos[8].accesos.push(arregloAcceso); break;
                            case 'Sucursal': this.configPerfilUsuarios.totalCatalogoModulos[9].accesos.push(arregloAcceso); break;
                            case 'Suscripción': this.configPerfilUsuarios.totalCatalogoModulos[10].accesos.push(arregloAcceso); break;
                        }
                    }

                }

                //agrega el contador para cada acceso y tambien quita el estilo para el ultimo dato reistrado del arreglo
                for (var i = 0; i < this.configPerfilUsuarios.totalCatalogoModulos.length; i++) {
                    var validacion = 0;
                    var validacion2 = 0;
                    for (var j = 1; j < this.configPerfilUsuarios.totalCatalogoModulos[i].accesos.length; j++) {
                        this.configPerfilUsuarios.totalCatalogoModulos[i].accesos[j].contador = (this.configPerfilUsuarios.totalCatalogoModulos[i].accesos[j - 1].contador * 1) + 1;

                        switch (this.configPerfilUsuarios.totalCatalogoModulos[i].accesos[j].valor) {
                            case 1:
                                validacion = 1;
                                break;
                            case 0:
                                validacion2 = 1;
                                break;
                        }
                        if (validacion > 0 && validacion2 > 0) {
                            this.configPerfilUsuarios.totalCatalogoModulos[i].accesos[0].checkboxSi = 0;
                            this.configPerfilUsuarios.totalCatalogoModulos[i].accesos[0].checkboxNo = 0;
                        }

                        if (j == this.configPerfilUsuarios.totalCatalogoModulos[i].accesos.length - 1) {
                            this.configPerfilUsuarios.totalCatalogoModulos[i].accesos[j].tipoBordesAccesos = "";
                            if (validacion == this.configPerfilUsuarios.totalCatalogoModulos[i].accesos.length - 1) {
                                this.configPerfilUsuarios.totalCatalogoModulos[i].accesos[0].checkboxSi = 1;
                                this.configPerfilUsuarios.totalCatalogoModulos[i].accesos[0].checkboxNo = 0;
                            }
                        }

                    }
                }

                this.configPerfilUsuarios.visTablaEncabezados = this.configPerfilUsuarios.idModulosSeleccionados.length;

                this.configPerfilUsuarios_traducirTabla();
            }, error => {
                this._router.navigate(['/login']);
            });
        }, error => {
            this._router.navigate(['/login']);
        });
    }

    configPerfilUsuarios_omitSelected(Modulo: any) {
        return this.configPerfilUsuarios.idModulosSeleccionados.indexOf(Modulo) == -1;
    }

    configPerfilUsuarios_verListadoModulo(idModulo: any) {

        for (var i = 0; i < this.configPerfilUsuarios.totalCatalogoModulos.length; i++) {
            if (this.configPerfilUsuarios.totalCatalogoModulos[i].idModulo == (idModulo * 1)) {
                if (this.configPerfilUsuarios.totalCatalogoModulos[i].visualizarLista == 0) {
                    this.configPerfilUsuarios.totalCatalogoModulos[i].visualizarLista = 1;
                } else {
                    this.configPerfilUsuarios.totalCatalogoModulos[i].visualizarLista = 0;
                }
                break;
            }
        }
    }

    /*Muestra los modulos seleccionados por el usuario */
    configPerfilUsuarios_mostrarModulosSeleccionados() {

        var ultimoModulo = this.configPerfilUsuarios.idModulosSeleccionados[this.configPerfilUsuarios.idModulosSeleccionados.length - 1];
        for (var i = 0; i < this.configPerfilUsuarios.totalCatalogoModulos.length; i++) {
            this.configPerfilUsuarios.totalCatalogoModulos[i].visualizar = 0;
            this.configPerfilUsuarios.totalCatalogoModulos[i].visualizarLista = 0;
            for (var m = 0; m < this.configPerfilUsuarios.idModulosSeleccionados.length; m++) {

                if (this.configPerfilUsuarios.totalCatalogoModulos[i].idModulo == this.configPerfilUsuarios.idModulosSeleccionados[m]) {
                    this.configPerfilUsuarios.totalCatalogoModulos[i].visualizar = 1;
                    this.configPerfilUsuarios.totalCatalogoModulos[i].visualizarLista = 0;
                    if (this.configPerfilUsuarios.idModulosSeleccionados[m] == ultimoModulo) {
                        this.configPerfilUsuarios.totalCatalogoModulos[i].visualizarLista = 1;
                    }
                }
            }
        }

        this.configPerfilUsuarios.visTablaEncabezados = this.configPerfilUsuarios.idModulosSeleccionados.length;
    }

    /*Mostrar un apartado de creacion y edicion, con sus cambios para cada caso*/
    configPerfilUsuarios_nuevoPerfilUsuario() {
        this._pantallaServicio.mostrarSpinner();
        this.configPerfilUsuarios.nombrePerfil = "";
        this.configPerfilUsuarios.modulosSeleccionados = [];
        this.configPerfilUsuarios.idModulosSeleccionados = [];
        this.configPerfilUsuarios.visTablaEncabezados = 0;

        this.configPerfilUsuarios.editarPerfilVal = 0;
        this.configPerfilUsuarios.idPerfilSucursalTipo = null;
        this.configPerfilUsuarios_cambioPerfil();
    }

    /*Cambia los checkbox a si de acuerdo del caso, incluyendo su valor*/
    configPerfilUsuarios_cambiarCheckboxSi(idModulo: any, idAccesoSucursal: any) {
        var contadorSi = 0;
        var moduloPosicionArreglo: any;
        var accesoPosicionArreglo: any;

        for (var i = 0; i < this.configPerfilUsuarios.totalCatalogoModulos.length; i++) {
            if (this.configPerfilUsuarios.totalCatalogoModulos[i].idModulo == (idModulo * 1)) {
                moduloPosicionArreglo = i;
                break;
            }
        }

        for (var j = 0; j < this.configPerfilUsuarios.totalCatalogoModulos[moduloPosicionArreglo].accesos.length; j++) {
            if (this.configPerfilUsuarios.totalCatalogoModulos[moduloPosicionArreglo].accesos[j].idAccesoSucursal == (idAccesoSucursal * 1)) {
                accesoPosicionArreglo = j;
                break;
            }
        }

        if (accesoPosicionArreglo == 0) {

            for (var j = 0; j < this.configPerfilUsuarios.totalCatalogoModulos[moduloPosicionArreglo].accesos.length; j++) {

                this.configPerfilUsuarios.totalCatalogoModulos[moduloPosicionArreglo].accesos[j].checkboxSi = 1;
                this.configPerfilUsuarios.totalCatalogoModulos[moduloPosicionArreglo].accesos[j].checkboxNo = 0;

                this.configPerfilUsuarios.totalCatalogoModulos[moduloPosicionArreglo].accesos[j].valor = 1;
            }

        } else {
            if (this.configPerfilUsuarios.totalCatalogoModulos[moduloPosicionArreglo].accesos[accesoPosicionArreglo].checkboxSi == 1) {
                this.configPerfilUsuarios.totalCatalogoModulos[moduloPosicionArreglo].accesos[0].checkboxSi = 0;
                this.configPerfilUsuarios.totalCatalogoModulos[moduloPosicionArreglo].accesos[0].checkboxNo = 0;
                this.configPerfilUsuarios.totalCatalogoModulos[moduloPosicionArreglo].accesos[0].valor = 0;
            }
            this.configPerfilUsuarios.totalCatalogoModulos[moduloPosicionArreglo].accesos[accesoPosicionArreglo].checkboxSi = 1;
            this.configPerfilUsuarios.totalCatalogoModulos[moduloPosicionArreglo].accesos[accesoPosicionArreglo].checkboxNo = 0;

            this.configPerfilUsuarios.totalCatalogoModulos[moduloPosicionArreglo].accesos[accesoPosicionArreglo].valor = 1;
        }
        for (var j = 0; j < this.configPerfilUsuarios.totalCatalogoModulos[moduloPosicionArreglo].accesos.length; j++) {
            if (this.configPerfilUsuarios.totalCatalogoModulos[moduloPosicionArreglo].accesos[j].valor == 1) {
                contadorSi = contadorSi + 1;
            }
        }

        if (contadorSi >= this.configPerfilUsuarios.totalCatalogoModulos[moduloPosicionArreglo].accesos.length - 1) {
            this.configPerfilUsuarios.totalCatalogoModulos[moduloPosicionArreglo].accesos[0].checkboxSi = 1;
            this.configPerfilUsuarios.totalCatalogoModulos[moduloPosicionArreglo].accesos[0].checkboxNo = 0;
            this.configPerfilUsuarios.totalCatalogoModulos[moduloPosicionArreglo].accesos[0].valor = 1;
        }
    }

    /*Cambia los checkbox a no de acuerdo del caso, incluyendo su valor*/
    configPerfilUsuarios_cambiarCheckboxNo(idModulo: any, idAccesoSucursal: any) {
        var contadorNo = 0;
        var moduloPosicionArreglo: any;
        var accesoPosicionArreglo: any;

        for (var i = 0; i < this.configPerfilUsuarios.totalCatalogoModulos.length; i++) {
            if (this.configPerfilUsuarios.totalCatalogoModulos[i].idModulo == (idModulo * 1)) {
                moduloPosicionArreglo = i;
                break;
            }
        }

        for (var j = 0; j < this.configPerfilUsuarios.totalCatalogoModulos[moduloPosicionArreglo].accesos.length; j++) {
            if (this.configPerfilUsuarios.totalCatalogoModulos[moduloPosicionArreglo].accesos[j].idAccesoSucursal == (idAccesoSucursal * 1)) {
                accesoPosicionArreglo = j;
                break;
            }
        }

        if (accesoPosicionArreglo == 0) {

            for (var j = 0; j < this.configPerfilUsuarios.totalCatalogoModulos[moduloPosicionArreglo].accesos.length; j++) {

                this.configPerfilUsuarios.totalCatalogoModulos[moduloPosicionArreglo].accesos[j].checkboxSi = 0;
                this.configPerfilUsuarios.totalCatalogoModulos[moduloPosicionArreglo].accesos[j].checkboxNo = 1;
                this.configPerfilUsuarios.totalCatalogoModulos[moduloPosicionArreglo].accesos[j].valor = 0;
            }
        } else {


            if (this.configPerfilUsuarios.totalCatalogoModulos[moduloPosicionArreglo].accesos[accesoPosicionArreglo].checkboxNo == 1) {
                this.configPerfilUsuarios.totalCatalogoModulos[moduloPosicionArreglo].accesos[0].checkboxSi = 0;
                this.configPerfilUsuarios.totalCatalogoModulos[moduloPosicionArreglo].accesos[0].checkboxNo = 0;
                this.configPerfilUsuarios.totalCatalogoModulos[moduloPosicionArreglo].accesos[0].valor = 0;
            }

            this.configPerfilUsuarios.totalCatalogoModulos[moduloPosicionArreglo].accesos[accesoPosicionArreglo].checkboxSi = 0;
            this.configPerfilUsuarios.totalCatalogoModulos[moduloPosicionArreglo].accesos[accesoPosicionArreglo].checkboxNo = 1;

            this.configPerfilUsuarios.totalCatalogoModulos[moduloPosicionArreglo].accesos[accesoPosicionArreglo].valor = 0;
        }

        for (var j = 0; j < this.configPerfilUsuarios.totalCatalogoModulos[moduloPosicionArreglo].accesos.length; j++) {
            if (this.configPerfilUsuarios.totalCatalogoModulos[moduloPosicionArreglo].accesos[j].valor == 0) {
                contadorNo = contadorNo + 1;
            }
        }

        if (contadorNo >= this.configPerfilUsuarios.totalCatalogoModulos[moduloPosicionArreglo].accesos.length) {
            this.configPerfilUsuarios.totalCatalogoModulos[moduloPosicionArreglo].accesos[0].checkboxSi = 0;
            this.configPerfilUsuarios.totalCatalogoModulos[moduloPosicionArreglo].accesos[0].checkboxNo = 1;
            this.configPerfilUsuarios.totalCatalogoModulos[moduloPosicionArreglo].accesos[0].valor = 0;
        }

    }

    /*Recorre el arreglo e inserta el acceso de acuerdo a su valor*/
    configPerfilUsuarios_agregarPerfil() {
        this._pantallaServicio.mostrarSpinner();
        var validarPerfil = 1;
        $("#txtPerfilNombre").removeClass("errorCampo");
        $("#ddlModulos").removeClass("errorCampo");

        if (this.configPerfilUsuarios.nombrePerfil == "" || this.configPerfilUsuarios.nombrePerfil == null) {
            $("#txtPerfilNombre").addClass("errorCampo");
            this._toaster.error('Se debe de asignar un nombre al perfil');
            validarPerfil = 0;
        } else {
            if (this.configPerfilUsuarios.nombrePerfil == "Super admin") {
                $("#txtPerfilNombre").addClass("errorCampo");
                this._toaster.error('El nombre ya esta en uso');
                validarPerfil = 0;
            }
            for (var j = 0; j < this.configPerfilUsuarios.perfilesUsuarios.length; j++) {
                if (this.configPerfilUsuarios.perfilesUsuarios[j].Nombre == this.configPerfilUsuarios.nombrePerfil) {
                    $("#txtPerfilNombre").addClass("errorCampo");
                    this._toaster.error('El nombre ya esta en uso');
                    validarPerfil = 0;
                }
            }
        }

        if (this.configPerfilUsuarios.idModulosSeleccionados != null) {
            if (this.configPerfilUsuarios.idModulosSeleccionados.length <= 0) {
                $("#ddlModulos").addClass("errorCampo");
                this._toaster.error('Se debe de asignar al menos un módulo')
                validarPerfil = 0;
            }
        } else {
            $("#ddlModulos").addClass("errorCampo");
            this._toaster.error('Se debe de asignar al menos un módulo')
            validarPerfil = 0;
        }
        if (validarPerfil == 1) {

            var params: any = {};
            params.nombrePerfil = this.configPerfilUsuarios.nombrePerfil;
            params.opcion = 0;

            //inserta el perfil y los accesos realcionados al mismo
            this._backService.HttpPost("catalogos/ConfiguracionPerfil/insertarPerfilSucursal", {}, params).subscribe((data: any) => {
                var Sucursal = (eval(data));

                for (var i = 0; i < this.configPerfilUsuarios.totalCatalogoModulos.length; i++) {
                    for (var j = 0; j < this.configPerfilUsuarios.totalCatalogoModulos[i].accesos.length; j++) {
                        if (this.configPerfilUsuarios.totalCatalogoModulos[i].accesos[j].valor == 1 && this.configPerfilUsuarios.totalCatalogoModulos[i].visualizar == 1) {
                            /*Insertar por ws*/

                            var params: any = {};
                            params.idPerfilSucursal = Sucursal[0].idPerfilSucursal;
                            params.idAccesoSucursal = this.configPerfilUsuarios.totalCatalogoModulos[i].accesos[j].idAccesoSucursal;
                            params.opcion = 1;

                            this._backService.HttpPost("catalogos/ConfiguracionPerfil/insertarAccesosPerfilSucursal", {}, params).subscribe((data: any) => {

                            }, error => {
                                this._router.navigate(['/login']);
                            });
                        }
                    }
                }
                this.configPerfilUsuarios_consultarPerfilesUsuarios();
            }, error => {
                this._router.navigate(['/login']);
            });
        }
        /*inicializa valores a 0 una vez terminada la funcion o regresa a la consulta de parfiles con un mensaje de exito o falla*/
    }

    configPerfilUsuarios_editarPerfil() {
        this._pantallaServicio.mostrarSpinner();
        var validarPerfil = 1;
        $("#txtPerfilNombre").removeClass("errorCampo");
        $("#ddlModulos").removeClass("errorCampo");

        if (this.configPerfilUsuarios.nombrePerfil == "" || this.configPerfilUsuarios.nombrePerfil == null) {
            $("#txtPerfilNombre").addClass("errorCampo");
            this._toaster.error('Se debe de asignar un nombre al perfil');
            validarPerfil = 0;
        }

        if (this.configPerfilUsuarios.idModulosSeleccionados != null) {
            if (this.configPerfilUsuarios.idModulosSeleccionados.length <= 0) {
                $("#ddlModulos").addClass("errorCampo");
                this._toaster.error('Se debe de asignar al menos un módulo');
                validarPerfil = 0;
            }
        } else {
            $("#ddlModulos").addClass("errorCampo");
            this._toaster.error('Se debe de asignar al menos un módulo');
            validarPerfil = 0;
        }
        if (validarPerfil == 1) {

            var params: any = {};
            params.idPerfilSucursal = this.configPerfilUsuarios.idPerfilSucursal;
            params.nombrePerfil = this.configPerfilUsuarios.nombrePerfil;
            params.opcion = 0;

            //inserta el perfil y los accesos realcionados al mismo
            this._backService.HttpPost("catalogos/ConfiguracionPerfil/updatePerfilSucursal", {}, params).subscribe((data: any) => {
                var Sucursal = (eval(data));

                for (var i = 0; i < this.configPerfilUsuarios.totalCatalogoModulos.length; i++) {
                    for (var j = 0; j < this.configPerfilUsuarios.totalCatalogoModulos[i].accesos.length; j++) {
                        if (this.configPerfilUsuarios.totalCatalogoModulos[i].accesos[j].valor == 1 && this.configPerfilUsuarios.totalCatalogoModulos[i].visualizar == 1) {
                            /*Insertar por ws*/

                            var params: any = {};
                            params.idPerfilSucursal = this.configPerfilUsuarios.idPerfilSucursal;
                            params.idAccesoSucursal = this.configPerfilUsuarios.totalCatalogoModulos[i].accesos[j].idAccesoSucursal;
                            params.opcion = 1;

                            this._backService.HttpPost("catalogos/ConfiguracionPerfil/insertarAccesosPerfilSucursal", {}, params).subscribe((data: any) => {

                            }, error => {
                                this._router.navigate(['/login']);
                            });
                        }
                    }
                }
                this.configPerfilUsuarios_consultarPerfilesUsuarios();
            }, error => {
                this._router.navigate(['/login']);
            });
        }
        /*inicializa valores a 0 una vez terminada la funcion o regresa a la consulta de parfiles con un mensaje de exito o falla*/
    }

    /*Pendiente por validar nombre y funcionalidad*/
    configPerfilUsuarios_regresarfuncion() {
        /*regresa a el listado de perfiles*/
        this.configPerfilUsuarios_consultarPerfilesUsuarios();
    }

    configPerfilUsuarios_limpiarValidacionesPerfil() {
        $("#txtPerfilNombre").removeClass("errorCampo");
    }

    configPerfilUsuarios_limpiarValidacionesModulos() {
        $("#ddlModulos").removeClass("errorCampo");
    }

    rootScope_mobileBrowser: any;
    configPerfilUsuarios_validarEliminarPerfilUsuario(idPerfilSucursal: any, nombrePerfil: any) {
        this.configPerfilUsuarios.idPerfilSucursal = idPerfilSucursal;
        this.configPerfilUsuarios.nombrePerfilEliminar = nombrePerfil;
        var params: any = {};
        params.idPerfilSucursal = this.configPerfilUsuarios.idPerfilSucursal;

        //busca los modulos seleccionables para la configuracion del perfil
        this._backService.HttpPost("catalogos/ConfiguracionPerfil/validarEliminarPerfilUsuario", {}, params).subscribe((data: any) => {
            var UsuariosAsignados = (eval(data));
            if (UsuariosAsignados.length == 0) {
                this.modales.modalEliminarPerfilUsuario.show();
            } else {
                this._toaster.error('No se puede eliminar el perfil debido a que un usuario tiene asignado este perfil')
            }
        }, error => {
            this._router.navigate(['/login']);
        });
    }

    configPerfilUsuarios_eliminarPerfilUsuario() {

        this._pantallaServicio.mostrarSpinner();
        var params: any = {};
        params.idPerfilSucursal = this.configPerfilUsuarios.idPerfilSucursal;
        //busca los modulos seleccionables para la configuracion del perfil
        this._backService.HttpPost("catalogos/ConfiguracionPerfil/eliminarPerfilUsuario", {}, params).subscribe((data: any) => {
            this.configPerfilUsuarios_consultarPerfilesUsuarios();
            this._toaster.error('Se realizo con exito la eliminacion del perfil');
            $("#modalEliminarPerfilUsuario").modal("hide");
            this.modales.modalEliminarPerfilUsuario.hide()
        }, error => {
            this._router.navigate(['/login']);
        });
    }

    configPerfilUsuarios_traducirTabla() {

        var validacionSuscipcion = this.configPerfilUsuarios.totalCatalogoModulos.length;
        for (var i = 0; i < this.configPerfilUsuarios.totalCatalogoModulos.length; i++) {
            if (validacionSuscipcion > 11) {
                switch (this.configPerfilUsuarios.totalCatalogoModulos[i].idModulo) {

                    case 1: this.configPerfilUsuarios.totalCatalogoModulos[i].nombreModulo = "Agenda"; break;
                    case 2: this.configPerfilUsuarios.totalCatalogoModulos[i].nombreModulo = "Punto de Venta (Caja)"; break;
                    case 3: this.configPerfilUsuarios.totalCatalogoModulos[i].nombreModulo = "Servicios y Paquetes"; break;
                    case 4: this.configPerfilUsuarios.totalCatalogoModulos[i].nombreModulo = "Personal"; break;
                    case 5: this.configPerfilUsuarios.totalCatalogoModulos[i].nombreModulo = "Clientes"; break;
                    case 6: this.configPerfilUsuarios.totalCatalogoModulos[i].nombreModulo = "Facturación"; break;
                    case 7: this.configPerfilUsuarios.totalCatalogoModulos[i].nombreModulo = "Promociones"; break;
                    case 8: this.configPerfilUsuarios.totalCatalogoModulos[i].nombreModulo = "Reportes"; break;
                    case 9: this.configPerfilUsuarios.totalCatalogoModulos[i].nombreModulo = "Configuración"; break;
                    case 10: this.configPerfilUsuarios.totalCatalogoModulos[i].nombreModulo = "Inventario"; break;
                    case 11: this.configPerfilUsuarios.totalCatalogoModulos[i].nombreModulo = "Acceso App Negocio"; break;
                    case 12: this.configPerfilUsuarios.totalCatalogoModulos[i].nombreModulo = "Sucursal"; break;
                    case 13: this.configPerfilUsuarios.totalCatalogoModulos[i].nombreModulo = "Suscripción"; break;

                }
            } else {
                switch (this.configPerfilUsuarios.totalCatalogoModulos[i].idModulo) {

                    case 1: this.configPerfilUsuarios.totalCatalogoModulos[i].nombreModulo = "Agenda"; break;
                    case 2: this.configPerfilUsuarios.totalCatalogoModulos[i].nombreModulo = "Punto de Venta (Caja)"; break;
                    case 3: this.configPerfilUsuarios.totalCatalogoModulos[i].nombreModulo = "Servicios y Paquetes"; break;
                    case 4: this.configPerfilUsuarios.totalCatalogoModulos[i].nombreModulo = "Personal"; break;
                    case 5: this.configPerfilUsuarios.totalCatalogoModulos[i].nombreModulo = "Clientes"; break;
                    case 6: this.configPerfilUsuarios.totalCatalogoModulos[i].nombreModulo = "Promociones"; break;
                    case 7: this.configPerfilUsuarios.totalCatalogoModulos[i].nombreModulo = "Reportes"; break;
                    case 8: this.configPerfilUsuarios.totalCatalogoModulos[i].nombreModulo = "Configuración"; break;
                    case 9: this.configPerfilUsuarios.totalCatalogoModulos[i].nombreModulo = "Acceso App Negocio"; break;
                    case 10: this.configPerfilUsuarios.totalCatalogoModulos[i].nombreModulo = "Sucursal"; break;
                    case 11: this.configPerfilUsuarios.totalCatalogoModulos[i].nombreModulo = "Suscripción"; break;

                }
            }

            for (var j = 0; j < this.configPerfilUsuarios.totalCatalogoModulos[i].accesos.length; j++) {
                switch (this.configPerfilUsuarios.totalCatalogoModulos[i].accesos[j].idAccesoSucursal) {
                    case 'AGENCAT000': this.configPerfilUsuarios.totalCatalogoModulos[i].accesos[j].nombreAcceso = "Todo"; break;
                    case 'AGENCAT001': this.configPerfilUsuarios.totalCatalogoModulos[i].accesos[j].nombreAcceso = "Ver Indicadores"; break;
                    case 'AGENCAT002': this.configPerfilUsuarios.totalCatalogoModulos[i].accesos[j].nombreAcceso = "Todas las Agendas"; break;
                    case 'AGENCAT003': this.configPerfilUsuarios.totalCatalogoModulos[i].accesos[j].nombreAcceso = "Descargar Agenda a Excel"; break;
                    case 'AGENCAT004': this.configPerfilUsuarios.totalCatalogoModulos[i].accesos[j].nombreAcceso = "Solo Visualizar Agenda "; break;
                    case 'AGENCAT005': this.configPerfilUsuarios.totalCatalogoModulos[i].accesos[j].nombreAcceso = "Visualizar Agenda y Agendar"; break;
                    case 'AGENCAT006': this.configPerfilUsuarios.totalCatalogoModulos[i].accesos[j].nombreAcceso = "Cambiar Estatus de cita "; break;
                    case 'AGENCAT007': this.configPerfilUsuarios.totalCatalogoModulos[i].accesos[j].nombreAcceso = "Opcion Nuevo en Referencia"; break;
                    case 'CAJACAT000': this.configPerfilUsuarios.totalCatalogoModulos[i].accesos[j].nombreAcceso = "Todo"; break;
                    case 'CAJACAT001': this.configPerfilUsuarios.totalCatalogoModulos[i].accesos[j].nombreAcceso = "Venta "; break;
                    case 'CAJACAT002': this.configPerfilUsuarios.totalCatalogoModulos[i].accesos[j].nombreAcceso = "Historial del Cliente - Venta "; break;
                    case 'CAJACAT003': this.configPerfilUsuarios.totalCatalogoModulos[i].accesos[j].nombreAcceso = "Eliminar Venta "; break;
                    case 'CAJACAT004': this.configPerfilUsuarios.totalCatalogoModulos[i].accesos[j].nombreAcceso = "Corte de Caja"; break;
                    case 'CAJACAT005': this.configPerfilUsuarios.totalCatalogoModulos[i].accesos[j].nombreAcceso = "Historial - Corte de Caja "; break;
                    case 'CAJACAT006': this.configPerfilUsuarios.totalCatalogoModulos[i].accesos[j].nombreAcceso = "Corte de Caja de días anteriores"; break;
                    case 'CAJACAT007': this.configPerfilUsuarios.totalCatalogoModulos[i].accesos[j].nombreAcceso = "Firma de Autorización - Corte de Caja "; break;
                    case 'CAJACAT008': this.configPerfilUsuarios.totalCatalogoModulos[i].accesos[j].nombreAcceso = "Movimientos"; break;
                    case 'CAJACAT009': this.configPerfilUsuarios.totalCatalogoModulos[i].accesos[j].nombreAcceso = "Firma de Autorización - Devolución "; break;
                    case 'CAJACAT010': this.configPerfilUsuarios.totalCatalogoModulos[i].accesos[j].nombreAcceso = "Firma de Autorización - Cancelación "; break;
                    case 'CAJACAT011': this.configPerfilUsuarios.totalCatalogoModulos[i].accesos[j].nombreAcceso = "Retiro de Efectivo"; break;
                    case 'CAJACAT012': this.configPerfilUsuarios.totalCatalogoModulos[i].accesos[j].nombreAcceso = "Firma de Autorización - Retiro de Efectivo"; break;
                    case 'SERPAQCT000': this.configPerfilUsuarios.totalCatalogoModulos[i].accesos[j].nombreAcceso = "Todo"; break;
                    case 'SERPAQCT001': this.configPerfilUsuarios.totalCatalogoModulos[i].accesos[j].nombreAcceso = "Acceso"; break;
                    case 'PERSCAT000': this.configPerfilUsuarios.totalCatalogoModulos[i].accesos[j].nombreAcceso = "Todo"; break;
                    case 'PERSCAT001': this.configPerfilUsuarios.totalCatalogoModulos[i].accesos[j].nombreAcceso = "Acceso"; break;
                    case 'PERSCAT002': this.configPerfilUsuarios.totalCatalogoModulos[i].accesos[j].nombreAcceso = "Categorías"; break;
                    case 'PERSCAT003': this.configPerfilUsuarios.totalCatalogoModulos[i].accesos[j].nombreAcceso = "Configuración de Comisiones"; break;
                    case 'CLIENCAT000': this.configPerfilUsuarios.totalCatalogoModulos[i].accesos[j].nombreAcceso = "Todo"; break;
                    case 'CLIENCAT001': this.configPerfilUsuarios.totalCatalogoModulos[i].accesos[j].nombreAcceso = "Clientes - Lectura"; break;
                    case 'CLIENCAT002': this.configPerfilUsuarios.totalCatalogoModulos[i].accesos[j].nombreAcceso = "Clientes - Acción"; break;
                    case 'CLIENCAT003': this.configPerfilUsuarios.totalCatalogoModulos[i].accesos[j].nombreAcceso = "Descargar Clientes"; break;
                    case 'FACTUCAT000': this.configPerfilUsuarios.totalCatalogoModulos[i].accesos[j].nombreAcceso = "Todo"; break;
                    case 'FACTUCAT001': this.configPerfilUsuarios.totalCatalogoModulos[i].accesos[j].nombreAcceso = "Poder Facturar"; break;
                    case 'PROMCAT000': this.configPerfilUsuarios.totalCatalogoModulos[i].accesos[j].nombreAcceso = "Todo"; break;
                    case 'PROMCAT001': this.configPerfilUsuarios.totalCatalogoModulos[i].accesos[j].nombreAcceso = "Visualizar Promociones"; break;
                    case 'PROMCAT002': this.configPerfilUsuarios.totalCatalogoModulos[i].accesos[j].nombreAcceso = "Crear y Editar nuevas Promociones"; break;
                    case 'REPORCAT000': this.configPerfilUsuarios.totalCatalogoModulos[i].accesos[j].nombreAcceso = "Todo"; break;
                    case 'REPORCAT001': this.configPerfilUsuarios.totalCatalogoModulos[i].accesos[j].nombreAcceso = "Reporte de Productividad"; break;
                    case 'REPORCAT002': this.configPerfilUsuarios.totalCatalogoModulos[i].accesos[j].nombreAcceso = "Reporte de Citas"; break;
                    case 'REPORCAT003': this.configPerfilUsuarios.totalCatalogoModulos[i].accesos[j].nombreAcceso = "Reporte de Ingresos"; break;
                    case 'REPORCAT004': this.configPerfilUsuarios.totalCatalogoModulos[i].accesos[j].nombreAcceso = "Consulta de Clientes"; break;
                    case 'CONFIGCT000': this.configPerfilUsuarios.totalCatalogoModulos[i].accesos[j].nombreAcceso = "Todo"; break;
                    case 'CONFIGCT001': this.configPerfilUsuarios.totalCatalogoModulos[i].accesos[j].nombreAcceso = "Equipos - Lectura"; break;
                    case 'CONFIGCT002': this.configPerfilUsuarios.totalCatalogoModulos[i].accesos[j].nombreAcceso = "Equipos - Acción"; break;
                    case 'CONFIGCT003': this.configPerfilUsuarios.totalCatalogoModulos[i].accesos[j].nombreAcceso = "Tipo de Excepcion - Lectura"; break;
                    case 'CONFIGCT004': this.configPerfilUsuarios.totalCatalogoModulos[i].accesos[j].nombreAcceso = "Tipo de Excepcion - Acción"; break;
                    case 'CONFIGCT005': this.configPerfilUsuarios.totalCatalogoModulos[i].accesos[j].nombreAcceso = "Tipo de Cambio - Lectura"; break;
                    case 'CONFIGCT006': this.configPerfilUsuarios.totalCatalogoModulos[i].accesos[j].nombreAcceso = "Tipo de Cambio - Acción"; break;
                    case 'CONFIGCT007': this.configPerfilUsuarios.totalCatalogoModulos[i].accesos[j].nombreAcceso = "Usuario - Lectura"; break;
                    case 'CONFIGCT008': this.configPerfilUsuarios.totalCatalogoModulos[i].accesos[j].nombreAcceso = "Usuario - Acción"; break;
                    case 'CONFIGCT009': this.configPerfilUsuarios.totalCatalogoModulos[i].accesos[j].nombreAcceso = "Configuración de Ticket - Lectura"; break;
                    case 'CONFIGCT010': this.configPerfilUsuarios.totalCatalogoModulos[i].accesos[j].nombreAcceso = "Configuración de Ticket - Acción"; break;
                    case 'CONFIGCT011': this.configPerfilUsuarios.totalCatalogoModulos[i].accesos[j].nombreAcceso = "Configuración de Parametros - Lectura"; break;
                    case 'CONFIGCT012': this.configPerfilUsuarios.totalCatalogoModulos[i].accesos[j].nombreAcceso = "Configuración de Parametros - Acción"; break;
                    case 'CONFIGCT013': this.configPerfilUsuarios.totalCatalogoModulos[i].accesos[j].nombreAcceso = "Configuración de Recetas - Lectura"; break;
                    case 'CONFIGCT014': this.configPerfilUsuarios.totalCatalogoModulos[i].accesos[j].nombreAcceso = "Configuración de Recetas - Acción"; break;
                    case 'CONFIGCT015': this.configPerfilUsuarios.totalCatalogoModulos[i].accesos[j].nombreAcceso = "Configuración de Recetas Electronicas - Lectura"; break;
                    case 'INVENTCT000': this.configPerfilUsuarios.totalCatalogoModulos[i].accesos[j].nombreAcceso = "Todo"; break;
                    case 'INVENTCT001': this.configPerfilUsuarios.totalCatalogoModulos[i].accesos[j].nombreAcceso = "Lectura Inventario "; break;
                    case 'INVENTCT002': this.configPerfilUsuarios.totalCatalogoModulos[i].accesos[j].nombreAcceso = "Acción Inventario "; break;
                    case 'INVENTCT003': this.configPerfilUsuarios.totalCatalogoModulos[i].accesos[j].nombreAcceso = "Lectura Recepción de Producto "; break;
                    case 'INVENTCT004': this.configPerfilUsuarios.totalCatalogoModulos[i].accesos[j].nombreAcceso = "Acción Recepción de Producto "; break;
                    case 'APPNEGCT000': this.configPerfilUsuarios.totalCatalogoModulos[i].accesos[j].nombreAcceso = "Todo"; break;
                    case 'APPNEGCT001': this.configPerfilUsuarios.totalCatalogoModulos[i].accesos[j].nombreAcceso = "Lectura de citas "; break;
                    case 'SUCURSA000': this.configPerfilUsuarios.totalCatalogoModulos[i].accesos[j].nombreAcceso = "Todo"; break;
                    case 'SUCURSA001': this.configPerfilUsuarios.totalCatalogoModulos[i].accesos[j].nombreAcceso = "Acceso"; break;
                    case 'SUSCRIP000': this.configPerfilUsuarios.totalCatalogoModulos[i].accesos[j].nombreAcceso = "Todo"; break;
                    case 'SUSCRIP001': this.configPerfilUsuarios.totalCatalogoModulos[i].accesos[j].nombreAcceso = "Acceso"; break;
                }
            }
        }
    }

    accesosPantalla: any = {
        lecturaUsuario: null,
        accionUsuario: null,
    };
    consultaPrincipal() {
        var params: any = {};
        params.modulo = "Configuración";

        this._backService.HttpPost("catalogos/ConfiguracionPerfil/consultarAccesosUsuario2", {}, params).subscribe((data: any) => {
            this.accesosPantalla = {};
            var dataTemp = eval(data);

            for (var i = 0; i < dataTemp.length; i++) {
                switch (dataTemp[i].codigo) {
                    case 'CONFIGCT007':
                        this.accesosPantalla.lecturaUsuario = dataTemp[i].valor;
                        break;
                    case 'CONFIGCT008':
                        this.accesosPantalla.accionUsuario = dataTemp[i].valor;
                        break;
                }
            }
        }, error => {
            this._router.navigate(['/login']);
        });

    }

    irAAgenda(){
        this._router.navigate(['/procesos/agenda']);
    }

    irAPerfilUsuario(){
        location.reload();
    }
}