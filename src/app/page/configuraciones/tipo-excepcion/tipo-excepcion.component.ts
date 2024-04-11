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
    selector: 'app-tipo-excepcion',
    templateUrl: './tipo-excepcion.component.html',
    styleUrls: ['./tipo-excepcion.component.scss', '../../page.component.scss']
})
export class TipoExcepcionComponent implements OnInit {

    // Variables de Translate
    consultaTipoExcepcionTranslate: any = {};

    // Modales
    modales: any = {};

    displayedColumns: any[] = ['acciones', 'descripcion'];

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

        this._translate.get('consultaTipoExcepcionTranslate').subscribe((translated) => {
            this.consultaTipoExcepcionTranslate = this._translate.instant('consultaTipoExcepcionTranslate');
        });

        this.matIconRegistry.addSvgIcon('iconAgregar', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Agregar-1-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconCasa1', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Casa1-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconFlecha1DerechaPeque', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/FlechaDerechaPequena-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconEditar', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Editar-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconBasura', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Basura-icon.svg"));
    }

    ngOnInit(): void {
        //if (document.getElementById("styleGeneral") != null)
        //     $("#styleGeneral").remove();
        // var style = document.createElement('style');
        // style.type = 'text/css';
        // style.id = 'styleGeneral';
        // style.innerHTML = ".center{text-align:center}.alignCenter{text-align:center}.alignLeft{text-align:left}.alignRight{text-align:right}.alignCenter2{text-align:center;cursor:default}.page-title-breadcrumb .page-header .page-title{font-size:25px;font-weight:700;display:inline-block;padding-top:10px}.modal-footer{border-top:none!important}.link-B{color:#357ec1}.link-B:hover{color:#b32032}a{white-space:nowrap;text-overflow:ellipsis;background:0 0}";
        // document.getElementsByTagName('head')[0].appendChild(style);

        this.crearModales();
        this.consultaPrincipal();
    }

    ngAfterViewInit() {
        this.paginator._intl.itemsPerPageLabel = 'filas por pagina';
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
    }

    crearModales() {

        if ($("body").find(".modal-confirm").length > 1) {
            $("body").find(".modal-confirm")[1].remove();
        }
        this.modales.modalConfirm = new bootstrap.Modal($("#modal-confirm").appendTo("body"), {
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

    }

    rootScope_fromState = "";
    consultaTipoExcepcion: any = {
        confirm: false,
    }
    consultaExitosa = true;

    paramsNotifi8 = {
        life: 3000,
        theme: "lime",
        sticky: false
    };

    gridOptions = {
        enableSorting: true,
        enableHiding: false,
        enableColumnMenus: false,
        enableColumnResizing: true,
        paginationPageSizes: [5, 10],
        paginationPageSize: 5,
        enableVerticalScrollbar: 0,
        enableHorizontalScrollbar: 2,
        columnDefs: [
            {
                name: this.consultaTipoExcepcionTranslate.acciones,
                width: '130',
                minWidth: '100', visible: true,
                cellClass: "alignCenter",
                headerCellClass: 'alignCenter',
                enableSorting: false,
                cellTemplate: '<a ng-if="grid.appScope.accesosPantalla.accionTipoExcepcion" ui-sref="tipoExcepcion({idTipoExcepcion: row.entity.idExcepcionTipo})"> <li style="margin-right: 10%; font-size: 1.5em; cursor:pointer; color: #337dc0; margin-top: 2%;" class="iconos fa fa-pencil"  ng-show="1"></li></a>  <a ng-if="grid.appScope.accesosPantalla.accionTipoExcepcion" ng-click="grid.appScope.consultaTipoExcepcion.eliminarOP(row.entity.idExcepcionTipo)"><li class="iconos fa fa-trash-o" style="font-size: 1.5em; cursor:pointer; color: #337dc0; margin-top: 2%;" ng-show="1" ></li></a></div>'
            },

            {
                name: this.consultaTipoExcepcionTranslate.descripcion,
                field: 'descripcion',
                minWidth: '100',
                groupingShowAggregationMenu: false,
                headerCellClass: "alignCenter",
                cellClass: "alignCenter",
                cellTemplate: '<div style="margin-top: 8px;"><a  class="ls-link-b" ui-sref="tipoExcepcion({idTipoExcepcion: row.entity.idExcepcionTipo})">{{row.entity.descripcion}}</a></div>'
            }
        ],
        data: 'dataGrid'
    };

    consultaTipoExcepcion_eliminarOP(eliminar: any) {
        this.consultaTipoExcepcion.confirm = $("#modal-confirm .modal-body").html('<span style="font-weight: 400;">' + this.consultaTipoExcepcionTranslate.darDeBaja + '</span>');
        this.consultaTipoExcepcion.eliminarVar = eliminar;
        this.modales.modalConfirm.show();
    };

    consultaTipoExcepcion_eliminar() {
        //ELIMINAR
        var param: any = {};
        param.idTipoExcepcion = this.consultaTipoExcepcion.eliminarVar;

        this._backService.HttpPost("catalogos/TipoExcepcion/bajaTipoExcepciones", {}, param).subscribe((data: any) => {
            if (data == 1) {
                this.consultaTipoExcepcion_consultarTipoExcepciones();
            }
            else {
                $("#modal-alert .modal-body").html('<span style="font-weight: 400;">' + this.consultaTipoExcepcionTranslate.excepcionUtilizada + '</span>');
                this.modales.modalAlert.show();
            }
        }, error => {

        });
    };

    dataGrid: any;
    altura: any;
    consultaTipoExcepcion_consultarTipoExcepciones() {
        this._backService.HttpPost("catalogos/TipoExcepcion/consultarTipoExcepciones", {}, {}).subscribe((data: any) => {
            this.dataGrid = eval(data);
            this.dataSource.data = this.dataGrid;

            this.altura = this.dataGrid.length * 30 + 57;
            this.consultaExitosa = false;
        }, error => {

        });
    };

    accesosPantalla: any = {
        lecturaTipoExcepcion: null,
        accionTipoExcepcion: null,
    };
    consultaPrincipal() {

        this._backService.HttpPost("catalogos/ConfiguracionPerfil/ConsultaVariblesSession", {}, {}).subscribe((data) => {
            this.accesosPantalla = {};
            var dataTemp = eval(data);

            for (var i = 0; i < dataTemp.length; i++) {
                switch (dataTemp[i].Codigo) {

                    case "CONFIGCT003":
                        this.accesosPantalla.lecturaTipoExcepcion = dataTemp[i].Valor;
                        break;
                    case "CONFIGCT004":
                        this.accesosPantalla.accionTipoExcepcion = dataTemp[i].Valor;
                        break;

                }
            }
            this.consultaTipoExcepcion_consultarTipoExcepciones();
        }, error => {
            this._router.navigate(['/login']);
        });
    }

    irAAgenda(){
        this._router.navigate(['/procesos/agenda']);
    }
}