import { Component, OnInit } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { MatTableDataSource } from '@angular/material/table';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import dayjs from 'dayjs';
import moment from 'moment';
import { MethodsService } from 'src/app/core/services/methods.service';
import { PantallaService } from 'src/app/core/services/pantalla.service';
declare var $: any; // JQUERY

interface IColum {
    title: string;
    nameCol: string;
    styleCss?: string;
    styleCssRow?: string;
}

@Component({
    selector: 'app-recepcion-producto',
    templateUrl: './recepcion-producto.component.html',
    styleUrls: [
        './recepcion-producto.component.scss',
        '../../page.component.scss',
    ],
})
export class RecepcionProductoComponent implements OnInit {
    // Variable de translate
    consultaOrdenCompraTranslate: any = {};
    sessionTraslate: any = {};
    calendarioTranslate: any = {};

    //Permisos
    permisoAccionRecepcionProducto: any = null;

    constructor(
        private _backService: MethodsService,
        private _translate: TranslateService,
        private _pantallaServicio: PantallaService,
        private _router: Router,
        private matIconRegistry: MatIconRegistry,
        private domSanitizer: DomSanitizer,
    ) {
        this._translate.setDefaultLang(this._pantallaServicio.idioma);
        this._translate.use(this._pantallaServicio.idioma);
        this._translate
            .get('consultaOrdenCompraTranslate')
            .subscribe((translated: string) => {
                this.consultaOrdenCompraTranslate = this._translate.instant(
                    'consultaOrdenCompraTranslate'
                );
                this.sessionTraslate = this._translate.instant('sessionTraslate');
                this.calendarioTranslate = this._translate.instant(
                    'calendarioTranslate'
                );
                this.ranges = {
                    [this.calendarioTranslate['dias7']]: [
                        moment().subtract(6, 'days'),
                        moment(),
                    ], //subtract
                    [this.calendarioTranslate['ultimoMes']]: [
                        moment().startOf('month'),
                        moment().endOf('month'),
                    ],
                    [this.calendarioTranslate['ultimoAnio']]: [
                        moment().startOf('year'),
                        moment().endOf('year'),
                    ],
                };
                this.columnsTable = [
                    {
                        title: this.consultaOrdenCompraTranslate.numeroOrden,
                        nameCol: 'folio',
                        styleCss: 'text-align: center; min-width: 125px;',
                        styleCssRow: 'text-align: center; min-width: 125px;',
                    },
                    {
                        title: this.consultaOrdenCompraTranslate.producto,
                        nameCol: 'nombrePresentacion',
                        styleCss: 'text-align: center; min-width: 135px;',
                        styleCssRow: 'text-align: center; min-width: 135px;',
                    },
                    {
                        title: this.consultaOrdenCompraTranslate.proveedor,
                        nameCol: 'nombreProveedor',
                        styleCss: 'text-align: center;',
                        styleCssRow: 'text-align: center;',
                    },
                    {
                        title: this.consultaOrdenCompraTranslate.fechaOrden,
                        nameCol: 'fechaOrden',
                        styleCss: 'text-align: center; min-width: 120px;',
                        styleCssRow: 'text-align: center; min-width: 120px;',
                    },
                    {
                        title: this.consultaOrdenCompraTranslate.fechaRecibo,
                        nameCol: 'fechaRecibo',
                        styleCss: 'text-align: center; min-width: 120px;',
                        styleCssRow: 'text-align: center; min-width: 120px;',
                    },
                    {
                        title: this.consultaOrdenCompraTranslate.costo,
                        nameCol: 'costo',
                        styleCss: 'text-align: center;',
                        styleCssRow: 'text-align: center;',
                    },
                    {
                        title: this.consultaOrdenCompraTranslate.cantidadProducto,
                        nameCol: 'cantidad',
                        styleCss: 'text-align: center; min-width: 120px;',
                        styleCssRow: 'text-align: center; min-width: 120px;',
                    },
                    {
                        title: this.consultaOrdenCompraTranslate.observaciones,
                        nameCol: 'observaciones',
                        styleCss: 'text-align: center;',
                        styleCssRow: 'text-align: center;',
                    },
                    {
                        title: this.consultaOrdenCompraTranslate.registradoPor,
                        nameCol: 'realizoAlta',
                        styleCss: 'text-align: center; min-width: 100px;',
                        styleCssRow: 'text-align: center; min-width: 100px;',
                    },
                    {
                        title: this.consultaOrdenCompraTranslate.sucursal,
                        nameCol: 'nombreSucursal',
                        styleCss: 'text-align: center;',
                        styleCssRow: 'text-align: center;',
                    },
                ];
                this.displayedTable = this.columnsTable.map((e) => e.nameCol);
            });

        this.matIconRegistry.addSvgIcon('iconAgregar', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Agregar-1-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconAgenda', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/CalendarioEditar-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconFlechaAbajo', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Flecha1Abajo-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconBuscar', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Buscar-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconCasita', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Casa1-icon.svg"));
		this.matIconRegistry.addSvgIcon('iconFlechaDerecha', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/FlechaDerechaPequena-icon.svg"));
    }

    ngOnInit(): void {
        this.consultarPermisos();
        this.consultaOrdenCompra();
    }

    consultarPermisos() {
        this.permisoAccionRecepcionProducto = Number(
            this._pantallaServicio.session['INVENTCT004']
        );
    }

    ordenCompra: any = {
        dataGrid2: [],
        gridConsultaOrdenCompra: {},
        msgConsultaExitosa: '',
        consultaExitosa: false,
        dataTrue: false,
    };

    fechaCalendario = {
        startDate: dayjs().startOf('month'),
        endDate: dayjs().endOf('month'),
    };

    //TablecolumnsHistorico
    columnsTable: IColum[] = [];
    displayedTable: string[] = [];
    dataSourceTable: MatTableDataSource<any>;

    nuevaOrdenCompra(entity?: any) {
        if (entity !== undefined) {
            this._router.navigate(['/inventario/recepcion-producto'], {
                queryParams: { idOrden: entity.idInventarioOrdenCompra },
            });
        } else {
            this._router.navigate(['/inventario/recepcion-producto'], {
                queryParams: { idOrden: 'N' },
            });
        }
    }

    consultaOrdenCompra() {
        this._pantallaServicio.mostrarSpinner();
        let params: any = {};
        params.idInventarioOrdenCompra = null;

        params.fechaInicio = this.fechaCalendario.startDate
            .startOf('day')
            .format('YYYY-MM-DD HH:mm:ss');
        params.fechaFin = this.fechaCalendario.endDate
            .endOf('day')
            .format('YYYY-MM-DD HH:mm:ss');

        this._backService
            .HttpPost('catalogos/ordenCompra/consultaOrdenCompra', {}, params)
            .subscribe(
                (response) => {
                    this.ordenCompra.dataGrid = eval(response);
                    if (this.ordenCompra.dataGrid.length == 0) {
                        this._router.navigate(['/inventario/recepcion-producto'], {
                            queryParams: { idOrden: 'N' },
                        });
                    } else {
                        this.ordenCompra.altura =
                            this.ordenCompra.dataGrid.length * 30 + 45;
                        this.ordenCompra.dataGrid2 = JSON.parse(
                            JSON.stringify(this.ordenCompra.dataGrid)
                        );

                        this.dataSourceTable = new MatTableDataSource(
                            this.ordenCompra.dataGrid.map((e: any) => {
                                e.fechaOrden = moment(e.fechaOrden).format('DD/MM/YYYY');
                                e.fechaRecibo = moment(e.fechaRecibo).format('DD/MM/YYYY');
                                return e;
                            })
                        );
                    }
                    this._pantallaServicio.ocultarSpinner();
                },
                (error) => {
                    this._pantallaServicio.ocultarSpinner();
                }
            );
    }

    busquedaOrdenCompra() { }

    // otros datos
    ranges: any = {};
    invalidDates: moment.Moment[] = [
        moment().add(2, 'days'),
        moment().add(3, 'days'),
        moment().add(5, 'days'),
    ];
    isInvalidDate = (m: moment.Moment) => {
        return this.invalidDates.some((d) => d.isSame(m, 'day'));
    };
}
