import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MethodsService } from 'src/app/core/services/methods.service';
import { PantallaService } from 'src/app/core/services/pantalla.service';
import { ToasterService } from 'src/shared/toaster/toaster.service';
declare var $: any; // JQUERY
import * as bootstrap from 'bootstrap'; // BOOTSTRAP
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'app-usuario',
    templateUrl: './usuario.component.html',
    styleUrls: ['./usuario.component.scss', '../../page.component.scss']
})
export class UsuarioComponent implements OnInit {

    // Variables de Translate
    consultaUsuarioTranslate: any = {};

    // Modales
    modales: any = {};

    displayedColumns: any[] = ['acciones', "nombre", "telefono", "email"];

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
        // if (document.getElementById("styleGeneral") != null)
        //     $("#styleGeneral").remove();
        // var style = document.createElement('style');
        // style.type = 'text/css';
        // style.id = 'styleGeneral';
        // style.innerHTML = ".alignCenter{text-align:center}.alignLeft{text-align:left}.alignRight{text-align:right}.alignCenter2{text-align:center;cursor:default}.ui-grid-invisible{display:none}.modal-footer{border-top:none!important}.breadcrumb{background:none;margin-bottom:0!important}a{white-space:nowrap;text-overflow:ellipsis;background:0 0}";
        // document.getElementsByTagName('head')[0].appendChild(style);

        this.consultaPrincipal();
        this.crearModales();
    }

    ngAfterViewInit() {
        this.paginator._intl.itemsPerPageLabel = 'filas por pagina';
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
    }

    crearModales() {

        if ($("body").find(".modal-alert").length > 1) {
            $("body").find(".modal-alert")[1].remove();
        }
        this.modales.modalAlert = new bootstrap.Modal($("#modal-alert").appendTo("body"), {
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

    }

    rootScope_fromState = "";
    consultaUsuario: any = {
        idUsuarioEliminar: undefined,
        datosOrdenados: false,
        permisoEditar: false,
        permisoConsultar: false,
        CONSULTAR: 0,
        EDITAR: 1,
        usuarioActual: {
            isGerenteGeneral: true,
        },
        dataUsuarios: [],
        columnDefs: [
            {
                name: this.consultaUsuarioTranslate.acciones,
                minWidth: '220',
                enableSorting: false,
                headerCellClass: 'alignCenter2',
                cellTemplate: '<div class="ui-grid-cell-contents" style="text-align:center; color:#337dc0;" ng-if="grid.appScope.accesosPantalla.accionUsuario">' +
                    '<li style="margin-right: 10%; font-size: 1.5em; cursor:pointer;" class="iconos fa fa-pencil" ng-click="grid.appScope.consultaUsuario.actualizarUsuario(row.entity.id)"></li>' +
                    '<li style="font-size: 1.5em; cursor:pointer;" class="iconos fa fa-trash-o" ng-click="grid.appScope.consultaUsuario.eliminarUsuario(row.entity.nombre, row.entity.id)" ng-if="!row.entity.idEmpresa"></li> ' +
                    '</div>'
            },
            {
                field: 'nombre',
                displayName: this.consultaUsuarioTranslate.nombre,
                minWidth: '200',
                cellClass: 'alignLeft',
                enableFocusedCellEdit: false,
                enableHiding: false,
                visible: true
            },
            {
                field: 'telefono',
                displayName: this.consultaUsuarioTranslate.telefono,
                minWidth: '100',
                enableFocusedCellEdit: false,
                enableHiding: false,
                visible: true
            },
            {
                field: 'email',
                displayName: this.consultaUsuarioTranslate.email,
                minWidth: '150',
                cellClass: 'alignLeft',
                enableFocusedCellEdit: false,
                enableHiding: false,
                visible: true
            }
        ],
        gridOptions: {
            enableSorting: true,
            enableColumnMenus: false,
            // columnDefs: $scope.consultaUsuario.columnDefs,
            // onRegisterApi: function (gridApi) {
            //     this.grid1Api = gridApi;
            // },
            enableVerticalScrollbar: 0,
            enableHorizontalScrollbar: 2
        }
    };
    // $location.$$search = {};    

    mostrarGrid = false;

    altura = 30;
    reenviar: any = {
        verifico: 'none'
    };

    paramsNotific8Alta = {
        life: 3000,
        theme: "lime",
        sticky: false
    };

    paramsNotific8Error = {
        life: 3000,
        theme: "ruby",
        sticky: false
    };

    accesoTotal: any = {};
    // Función que obtiene los permisos del usuario actual
    consultaUsuario_obtenerPermisos() {
        this._backService.HttpPost("catalogos/Usuario/obtenerPermisos", {}, {}).subscribe((data: any) => {
            var permisos = eval(data);
            if (permisos) {
                this.consultaUsuario.permisoConsultar = permisos[this.consultaUsuario.CONSULTAR];
                this.consultaUsuario.permisoEditar = permisos[this.consultaUsuario.EDITAR];
            } else {
                this.consultaUsuario.permisoConsultar = false;
                this.consultaUsuario.permisoEditar = false;
            }

            var params: any = {};
            params.validarGteSuc = 0;

            this._backService.HttpPost("catalogos/Usuario/validarPerfilUsuario", {}, params).subscribe((data: any) => {
                var response = [];
                response = eval(data);
                this.consultaUsuario.usuarioActual.isGerenteGeneral = response[0] == 1;
            }, error => {
                this.modalAlert(data.Message);
            });
        }, error => {

        });
    };

    // Función que agrega un campo 'Acciones'
    consultaUsuario_agregarAcciones() {
        if (this.consultaUsuario.dataUsuarios.length > 0) {
            for (var i = 0; i < this.consultaUsuario.dataUsuarios.length; i++) {
                this.consultaUsuario.dataUsuarios[i].acciones = ' ';
            }
        }
    };

    // Función que inicializa la fecha actual
    consultaUsuario_obtenerFechaActual() {
        var today = new Date();
        var dd: any = today.getDate();
        var mm: any = today.getMonth();
        var yyyy = today.getFullYear();
        if (dd < 10) {
            dd = '0' + dd
        }
        if (mm < 10) {
            mm = '0' + mm
        }
        today = new Date(yyyy, mm, dd);
        return today;
    };

    // Consultar usuarios 
    consultaUsuario_consultarUsuarios() {
        this._backService.HttpPost("catalogos/Usuario/consultarUsuarios", {}, {}).subscribe((data: any) => {
            this.consultaUsuario.dataUsuarios = eval(data);
            this.dataSource.data = data;

            this.reenviar.verifico = ((this.consultaUsuario.dataUsuarios[0].verifico) ? 'none' : 'initial');
            this.reenviar.idUsuario = this.consultaUsuario.dataUsuarios[0].idUsuarioRC;
            this.reenviar.email = this.consultaUsuario.dataUsuarios[0].emailRC;
            this.altura = this.consultaUsuario.dataUsuarios.length * 30 + 57;
            this.consultaUsuario_agregarAcciones();
            this.consultaUsuario.gridOptions.data = this.consultaUsuario.dataUsuarios;
            this.consultaUsuario.datosOrdenados = false;
            this.mostrarGrid = true;
            if (this.consultaUsuario.dataUsuarios.length == 0) {
                this._router.navigate(['/usuario/1/0/'], {
                    queryParams: {
                        esConsultaIndividual: "1",
                        idUsuarioActualizar: "0",
                        idUsuarioConsultar: "",
                    }
                })
            }
        }, error => {

        });
    };

    // Función que inicia la pantalla
    consultaUsuario_iniciarPantalla() {
        this._router.navigate(['/configuraciones/consultaUsuario']);
    };

    // Función que despliega la pantalla de nuevo usuario
    consultaUsuario_nuevoUsuario() {
        this._router.navigate(['/configuraciones/usuario'], {
            queryParams: {
                esConsultaIndividual: "",
                idUsuarioActualizar: "0",
                idUsuarioConsultar: "",
            }
        });
    };

    // Función que muestra un mensaje de confirmación para eliminar el usuario
    consultaUsuario_eliminarUsuario(nombreUsuario: any, idUsuario: any) {
        this.consultaUsuario.idUsuarioEliminar = idUsuario;
        this.modalConfirm(this.consultaUsuarioTranslate.borrarUsuario);
    };

    // Función que determina si el usuario tiene un idEmpresa asociado, devuelve true si es así
    consultaUsuario_tieneIdEmpresa(idUsuarioSucursal: any) {
        var tieneIdEmpresa = false;
        for (var i = 0; i < this.consultaUsuario.dataUsuarios.length; i++) {
            if (idUsuarioSucursal == this.consultaUsuario.dataUsuarios[i].id) {
                tieneIdEmpresa = this.consultaUsuario.dataUsuarios[i].idEmpresa != null;
                break;
            }
        }
        return tieneIdEmpresa;
    };

    // Función que elimina el usuario indicado después de confirmar en el modal
    consultaUsuario_confirmarEliminacion(idUsuarioSucursal: any) {
        if (!this.consultaUsuario_tieneIdEmpresa(idUsuarioSucursal)) {
            var params: any = {};
            params.fechaBaja = this.consultaUsuario_obtenerFechaActual();
            params.idUsuarioSucursal = idUsuarioSucursal;

            this._backService.HttpPost("catalogos/Usuario/eliminarUsuario", {}, params).subscribe((data: any) => {
                var success = eval(data);
                if (success) {

                } else {
                    this._toaster.error(this.consultaUsuarioTranslate.noPudoEliminarse);
                }
                this.consultaUsuario_consultarUsuarios();
            }, error => {

            });
        } else {
            this._toaster.error(this.consultaUsuarioTranslate.usuarioEmpresa);
        }
    };

    // Función que despliega la pantalla de actualizar usuario, recibe como parámetro el id del usuario a actualizar
    consultaUsuario_actualizarUsuario(idUsuarioSucursal: any) {
        this._router.navigate(['/configuraciones/usuario'], {
            queryParams: {
                esConsultaIndividual: "0",
                idUsuarioActualizar: idUsuarioSucursal,
                idUsuarioConsultar: "0",
            }
        });
    };

    // Función que despliega la pantalla de consulta individual de usuario, recibe como parámetro el id del usuario a consultar
    consultaUsuario_consultaIndividualUsuario(idUsuario: any) {
        this._router.navigate(['/configuraciones/usuario'], {
            queryParams: {
                esConsultaIndividual: "1",
                idUsuarioActualizar: "0",
                idUsuarioConsultar: idUsuario,
            }
        });
    };

    reenviarCorreo() {
        var params: any = {};
        params.email = this.reenviar.email;
        params.idUsuario = this.reenviar.idUsuario;
        params.codigo = "MSJCONFCORREO";

        this._backService.HttpPost("configuracion/EnviarCorreo/enviarEmailConfirmacion", {}, params).subscribe((data: any) => {
            if (data) {
                this.reenviar.verifico = 'none';
            }
        }, error => {

        });
    };

    // Modal Alert
    modalAlert(message: any) {
        $("#modal-alert .modal-body").html('<span class="title">' + message + '</span>');
        this.modales.modalAlert.show();
    };

    // Modal Confirm
    modalConfirm(message: any) {
        $("#modal-confirm .modal-body").html('<span class="title">' + message + '</span>');
        this.modales.modalConfirm.show();
    };

    accesosPantalla: any = {
        lecturaUsuario: null,
        accionUsuario: null,
    };
    consultaPrincipal() {
        this._backService.HttpPost("catalogos/ConfiguracionPerfil/ConsultaVariblesSession", {}, {}).subscribe((data) => {
            this.accesosPantalla = {};
            var dataTemp = eval(data);

            for (var i = 0; i < dataTemp.length; i++) {
                switch (dataTemp[i].Codigo) {

                    case 'CONFIGCT007':
                        this.accesosPantalla.lecturaUsuario = dataTemp[i].Valor;
                        break;
                    case 'CONFIGCT008':
                        this.accesosPantalla.accionUsuario = dataTemp[i].Valor;
                        break;
                }
            }

            this.consultaUsuario_consultarUsuarios();
        }, error => {
            this._router.navigate(['/login']);
        });
    }

    irAAgenda(){
        this._router.navigate(['/procesos/agenda']);
    }
}
