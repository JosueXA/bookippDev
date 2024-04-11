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
    selector: 'app-cambio-tipo',
    templateUrl: './cambio-tipo.component.html',
    styleUrls: ['./cambio-tipo.component.scss', '../../page.component.scss']
})
export class CambioTipoComponent implements OnInit {

    // Variables de Translate
    consultaCambioTipoTranslate: any = {};

    // Modales
    modales: any = {};

    displayedColumns: any[] = ['acciones', "monto", "tipoMoneda", "monedaBase", "activa"];

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

        this._translate.get('consultaCambioTipoTranslate').subscribe((translated) => {
            this.consultaCambioTipoTranslate = this._translate.instant('consultaCambioTipoTranslate');
        });

        this.matIconRegistry.addSvgIcon('iconAgregar', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Agregar-1-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconCasa1', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Casa1-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconFlecha1DerechaPeque', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/FlechaDerechaPequena-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconEditar', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Editar-icon.svg"));
    }

    ngOnInit(): void {
        // if (document.getElementById("styleGeneral") != null)
        //     $("#styleGeneral").remove();
        // var style = document.createElement('style');
        // style.type = 'text/css';
        // style.id = 'styleGeneral';
        // style.innerHTML = ".alignCenter{text-align:center}.alignLeft{text-align:left}.alignRight{text-align:right}.alignCenter2{text-align:center;cursor:default}.ui-grid-invisible{display:none}a{white-space:nowrap;text-overflow:ellipsis;background:0 0}.modal-footer{border-top:none!important}.hideScroll .ngViewport{overflow-y:auto;overflow-x:hidden}.modal{overflow:auto!important}";
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

    consultaExitosa = true;

    //Diseño de las notificaciones
    paramsNotifi8 = {
        life: 3000,
        theme: "lime",
        sticky: false
    }

    //Declaración del Grid
    gridOptions = {
        enableSorting: true,
        enableColumnMenus: false,
        enableVerticalScrollbar: 0,
        enableHorizontalScrollbar: 2,
        columnDefs: [
            { name: this.consultaCambioTipoTranslate.acciones, width: '220', enableSorting: false, headerCellClass: 'alignCenter2', cellTemplate: '<div class="ui-grid-cell-contents" style="text-align:center; color:#337dc0;"><li style=" font-size: 1.5em; cursor:pointer;" class="iconos fa fa-pencil" ng-if="grid.appScope.accesosPantalla.accionTipoCambio" ng-click="grid.appScope.actualizar(row.entity.idCambioTipo)"></li></div>' },
            { name: this.consultaCambioTipoTranslate.monto, width: '221', field: 'monto', headerCellClass: 'alignCenter', cellClass: 'alignRight', type: 'numberStr' },
            { displayName: this.consultaCambioTipoTranslate.tipoMoneda, minWidth: '220', field: 'mdescripcion', headerCellClass: 'alignCenter', cellClass: 'alignCenter' },
            { name: this.consultaCambioTipoTranslate.monedaBase, width: '220', field: 'esMonedaBase', headerCellClass: 'alignCenter', cellClass: 'alignCenter', cellTemplate: '<div style="margin-top:5px;"> {{(row.entity.esMonedaBase ? "consultaCambioTipoTranslate.si" : "consultaCambioTipoTranslate.no") | translate}} </div>' },
            { name: this.consultaCambioTipoTranslate.activa, width: '220', field: 'estaActivo', headerCellClass: 'alignCenter', cellClass: 'alignCenter', cellTemplate: '<div style="margin-top:5px;"> {{ (row.entity.estaActivo ? "consultaCambioTipoTranslate.si" : "consultaCambioTipoTranslate.no") | translate}} </div>' }

        ],
        data: 'dataGrid'
    };

    accesoTotal: any;
    dataGrid: any;
    altura: any;
    //Consulta los registros para mostrarlos en la pantalla
    consultaCambio_tipo() {              
        this._backService.HttpPost("catalogos/Cambio_tipo/consultaCambio_tipo", {}, {}).subscribe((data: any) => {
            this.dataGrid = eval(data);
            this.dataSource.data = data;

            this.altura = this.dataGrid.length * 30 + 57;
            if (this.dataGrid.length == 0) {
                this._router.navigate(["/configuraciones/cambioTipo"], {
                    queryParams: { idCambioTipo: 'N' }
                });
            }
            else {
                this.consultaExitosa = false;
            }
        }, error => {

        });
    }

    nuevo() {
        this._router.navigate(["/configuraciones/cambioTipo"], {
            queryParams: { idCambioTipo: 'N' }
        });
    }

    actualizar(row: any) {             
        this._router.navigate(["/configuraciones/cambioTipo"], {
            queryParams: { idCambioTipo: row }
        });
    }

    confirm(message: any) {
        $("#modal-confirm .modal-body").html('<span class="title">' + message + '</span>');
        this.modales.modalConfirm.show();
    };

    mostrarModal(message: any) {
        $("#modal-alert .modal-body").html('<span class="title">' + message + '</span>');
        this.modales.modalAlert.show();
    };

    accesosPantalla: any = {
        lecturaTipoCambio: null,
        accionTipoCambio: null,
    };
    consultaPrincipal() {
        this._backService.HttpPost("catalogos/ConfiguracionPerfil/ConsultaVariblesSession", {}, {}).subscribe((data) => {
            this.accesosPantalla = {};
            var dataTemp = eval(data);

            for (var i = 0; i < dataTemp.length; i++) {
                switch (dataTemp[i].Codigo) {

                    case "CONFIGCT005":
                        this.accesosPantalla.lecturaTipoCambio = dataTemp[i].Valor;
                        break;
                    case "CONFIGCT006":
                        this.accesosPantalla.accionTipoCambio = dataTemp[i].Valor;
                        break;
                }
            }
            this.consultaCambio_tipo();
        }, error => {
            this._router.navigate(["/login"]);
        });
    }

    irAAgenda(){
        this._router.navigate(['/procesos/agenda']);
    }
}