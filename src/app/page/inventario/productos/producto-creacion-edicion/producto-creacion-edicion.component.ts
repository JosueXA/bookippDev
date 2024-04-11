import { Component, OnInit, ViewChild } from '@angular/core';
import { MethodsService } from 'src/app/core/services/methods.service';
import { TranslateService } from '@ngx-translate/core';
import { PantallaService } from 'src/app/core/services/pantalla.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToasterService } from 'src/shared/toaster/toaster.service';
declare var $: any; // JQUERY
import * as bootstrap from 'bootstrap'; // BOOTSTRAP
import { MatChipInputEvent } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { BarcodeFormat } from '@zxing/library';
import { ZXingScannerComponent } from '@zxing/ngx-scanner';
import html2canvas from 'html2canvas';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

interface IColum {
    title: string;
    nameCol: string;
    styleCss?: string;
    styleCssRow?: string;
}

@Component({
    selector: 'app-producto-creacion-edicion',
    templateUrl: './producto-creacion-edicion.component.html',
    styleUrls: [
        './producto-creacion-edicion.component.scss',
        '../../../page.component.scss',
    ],
})
export class ProductoCreacionEdicionComponent implements OnInit {
    productoTranslate: any = {};
    sessionTraslate: any = {};
    configuracionSucursalTranslate: any = {};

    // Modales
    modales: any = {};

    // Para los inputs multiples etiquetas
    addOnBlur = true;
    readonly separatorKeysCodes = [ENTER, COMMA] as const;

    // Declaración de variables para la tabla
    columnsTable: IColum[] = [];
    displayedTable: string[] = [];
    dataSourceTable: MatTableDataSource<any>;
    @ViewChild('paginatorTable') paginatorTable: MatPaginator;

    constructor(
        private _backService: MethodsService,
        private _translate: TranslateService,
        public _pantallaServicio: PantallaService,
        private _router: Router,
        private _toaster: ToasterService,
        private _route: ActivatedRoute,
        private matIconRegistry: MatIconRegistry,
		private domSanitizer: DomSanitizer,
    ) {
        this._translate.setDefaultLang(this._pantallaServicio.idioma);
        this._translate.use(this._pantallaServicio.idioma);
        this._translate.get('producto').subscribe((translated: string) => {
            this.productoTranslate = this._translate.instant('producto');
            this.sessionTraslate = this._translate.instant('sessionTraslate');
            this.configuracionSucursalTranslate = this._translate.instant(
                'configuracionSucursalTranslate'
            );

            this.columnsTable = [
                {
                    title: this.productoTranslate.descripcion,
                    nameCol: 'nombre',
                    styleCss: 'text-align: center;',
                    styleCssRow: 'text-align: center;',
                },
                {
                    title: '',
                    nameCol: 'acciones',
                    styleCss: 'width: 120px; text-align: center;',
                    styleCssRow: 'text-align: center;',
                },
            ];
            this.displayedTable = this.columnsTable.map((e) => e.nameCol);
        });

        this.matIconRegistry.addSvgIcon('iconAgregar', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../../assets/icons/finales/Agregar-1-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconConfigurar', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../../assets/icons/finales/10-Configuracion-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconBasura', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../../assets/icons/finales/Basura-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconCerrar', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../../assets/icons/finales/10-2-TiposdeExcepcion-icon.svg"));
		this.matIconRegistry.addSvgIcon('iconCasita', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../../assets/icons/finales/Casa1-icon.svg"));
		this.matIconRegistry.addSvgIcon('iconFlechaDerecha', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../../assets/icons/finales/FlechaDerechaPequena-icon.svg"));
    }

    ngOnInit(): void {
        this.crearModales();
        this._route.queryParams.subscribe((params) => {
            this.stateParamsId = params['idProducto'];
            this.cargarPantalla();

            this.cargarCPS();
            this.cargarUnidadMedida();
        });
    }

    //----------------------------- Variables ----------------------------------
    productoCargado: boolean = false;
    listProductos: any = [];
    listExistencia: any = [];
    listCosto: any = [];
    listCodigo: any = [];
    listPrecio: any = [];

    displayFilterProductos: any = [];
    displayFilterMarcas: any = [];
    displayFilterProveedores: any = [];

    producto: any = {
        activo: true,
        presentacion: '',
        unidadMedida: '',
        existencia: '',
        precio: '',
        proveedor: '',
        contactoProv: '',
        comision: '',
        iva: false,
        infoProducto: '',
        cbarras: '',
        costo: '',
        imagen: '',
        imagenAnte: '',
        select: '',
        dataProducto: [],
        dataProductoCopy: [],
        mostrarModal: 0,
        idEliminar: [],
        idClaveProdServ: '',
        idUnidadMedida: '',
    };

    clickSaveDisabled = false;

    configurables: any = {
        dataConfigurables: [],
        nombreCampoNuevo: '',
        limite: false,
    };

    marca: any = {
        select: '',
        dataMarca: [],
        dataMarcaCopy: [],
    };

    proveedor: any = {
        select: '',
        dataProveedor: [],
        dataProveedorCopy: [],
    };

    unidadMedida: any = {
        select: '',
        dataUnidadMedida: [],
        dataUnidadMedidaCopy: [],
    };

    altura: any = 0;
    guardar: any = false;
    files: any = null;
    clienteSeleccionado: any = null;
    stateParamsId: any = '';
    dataUM: any = [];
    dataCPS: any = [];
    isGerenteCosto: any = null;
    tipoFiltro: any = null;
    validarRepeticiones: any = null;
    tituloModal: string = '';

    //Variables de la camara o barcode
    @ViewChild('scanner') scanner: ZXingScannerComponent;
    scannerEnabled: boolean = false;
    availableDevices: MediaDeviceInfo[] = [];
    selectedDevice: any = null;
    imgCanvas: any = '';
    codigoBarrasCamara: any = '';
    allowedFormats: any = [
        BarcodeFormat.QR_CODE,
        BarcodeFormat.EAN_13,
        BarcodeFormat.CODE_128,
        BarcodeFormat.DATA_MATRIX,
    ];

    //----------------------------- Funciones ----------------------------------
    // Crear modales
    crearModales() {
        if ($('body').find('.modalConfirm').length > 1) {
            $('body').find('.modalConfirm')[1].remove();
        }

        this.modales.modalConfirm = new bootstrap.Modal(
            $('#modalConfirm').appendTo('body'),
            {
                backdrop: 'static',
                keyboard: false,
            }
        );

        if ($('body').find('.modalgrid').length > 1) {
            $('body').find('.modalgrid')[1].remove();
        }

        this.modales.modalgrid = new bootstrap.Modal(
            $('#modalgrid').appendTo('body'),
            {
                backdrop: 'static',
                keyboard: false,
            }
        );

        if ($('body').find('.modalBarCode').length > 1) {
            $('body').find('.modalBarCode')[1].remove();
        }

        this.modales.modalBarCode = new bootstrap.Modal(
            $('#modalBarCode').appendTo('body'),
            {
                backdrop: 'static',
                keyboard: false,
            }
        );
    }

    //IMAGEN
    openImg() {
        $('#fileFoto').click();
    }

    fileFotoChange(event: any) {
        let reader = new FileReader();

        reader.onload = (e: any) => {
            let tipo: any = [];
            let image: any = new Image();
            image.src = e.target.result;
            tipo = image.src.split(';');
            if (
                tipo[0].toLowerCase().indexOf('png') !== -1 ||
                tipo[0].toLowerCase().indexOf('jpg') !== -1 ||
                tipo[0].toLowerCase().indexOf('jpeg') !== -1
            ) {
                setTimeout(() => {
                    this.producto.imagen = image.src;
                    (document.getElementById('productoFoto') as any).src =
                        this.producto.imagen;

                    if (
                        (document.getElementById('fileFoto') as any).files[0].size / 1024 >
                        2030
                    ) {
                        this.producto.imagen = '';
                        (document.getElementById('fileFoto') as any).value = '';
                        (document.getElementById('productoFoto') as any).style.border =
                            '3px red solid';
                        (document.getElementById('productoFoto') as any).src =
                            'img/system/iconoCamara.png';
                        $('#txtImagen').text(this.productoTranslate.tamImagen);
                    } else {
                        $('#btnBorrarImagen').css('display', 'inline');
                        (document.getElementById('productoFoto') as any).style.border = '';
                        $('#txtImagen').text('');
                    }
                });
            } else {
                setTimeout(() => {
                    this.producto.imagen = '';
                    (document.getElementById('fileFoto') as any).value = '';
                    (document.getElementById('productoFoto') as any).style.border =
                        '3px red solid';
                    (document.getElementById('productoFoto') as any).src =
                        'img/system/iconoCamara.png';
                    $('#txtImagen').text(this.productoTranslate.errorImagen);
                    $('#btnBorrarImagen').css('display', 'none');
                });
            }
        };
        reader.readAsDataURL(event.target.files[0]);
    }

    cargarImagen() {
        let params: any = {};
        params.idCliente = this.clienteSeleccionado;

        this._backService
            .HttpPost('catalogos/Cliente/cargarImagen', {}, params)
            .subscribe(
                (response) => {
                    const responseTemp = eval(response);
                    if (responseTemp != '') {
                        let evalData = 'data:image/jpeg;base64,' + responseTemp;
                        //this.dataCliente[0].imagen = evalData;
                        this.producto.imagen = evalData;
                        (document.getElementById('productoFoto') as any).src =
                            this.producto.imagen;
                        $('#btnBorrarImagen').css('display', 'inline');
                    } else {
                        //this.dataCliente[0].imagen = "";
                    }
                },
                (error) => {
                    this._pantallaServicio.ocultarSpinner();
                    if (error === 'SinSesion' || error === 'SesionCaducada') {
                        if (error === 'SinSesion') {
                            this._toaster.error(this.sessionTraslate.favorIniciarSesion);
                        }
                        if (error === 'SesionCaducada') {
                            this._toaster.error(this.sessionTraslate.sesionCaducada);
                        }
                        this._router.navigate(['/login']);
                    }
                }
            );
    }

    borrarImagen() {
        this.producto.imagen = '';
        (document.getElementById('fileFoto') as any).value = '';
        (document.getElementById('productoFoto') as any).src =
            '../../../../../assets/images/migracion/Imagen-Foto-300x300.png';
        $('#txtImagen').text('');
        (document.getElementById('productoFoto') as any).style.border = '';
        $('#btnBorrarImagen').css('display', 'none');
    }

    //CONFIGURABLES
    consultaConfigurables() {
        this._pantallaServicio.mostrarSpinner();
        this._backService
            .HttpPost('catalogos/Producto/consultaConfigurables', {}, {})
            .subscribe(
                (response) => {
                    this.configurables.dataConfigurables = eval(response);
                    if (this.configurables.dataConfigurables.length === 10) {
                        this.configurables.limite = true;
                    } else {
                        this.configurables.limite = false;
                    }

                    if (this.stateParamsId === 'N') {
                        this.consultarFiltros();
                    } else {
                        let params: any = {};
                        params.idProducto = this.stateParamsId;

                        this._backService
                            .HttpPost('catalogos/Producto/cargarConfigurables', {}, params)
                            .subscribe(
                                (response) => {
                                    const evalData = eval(response);
                                    for (
                                        let i = 0;
                                        i < this.configurables.dataConfigurables.length;
                                        i++
                                    ) {
                                        for (let j = 0; j < evalData.length; j++) {
                                            if (
                                                this.configurables.dataConfigurables[i].idCampo ===
                                                evalData[j].idCampo
                                            ) {
                                                this.configurables.dataConfigurables[i].valor =
                                                    evalData[j].valor;
                                            }
                                        }
                                    }
                                    this.configurables.dataConfigurablesCopia = JSON.parse(
                                        JSON.stringify(this.configurables.dataConfigurables)
                                    );
                                    this._pantallaServicio.ocultarSpinner();
                                    this.consultarFiltros();
                                },
                                (error) => {
                                    this._pantallaServicio.ocultarSpinner();
                                    if (error === 'SinSesion' || error === 'SesionCaducada') {
                                        if (error === 'SinSesion') {
                                            this._toaster.error(
                                                this.sessionTraslate.favorIniciarSesion
                                            );
                                        }
                                        if (error === 'SesionCaducada') {
                                            this._toaster.error(this.sessionTraslate.sesionCaducada);
                                        }
                                        this._router.navigate(['/login']);
                                    }
                                }
                            );
                    }
                },
                (error) => {
                    this._pantallaServicio.ocultarSpinner();
                    if (error === 'SinSesion' || error === 'SesionCaducada') {
                        if (error === 'SinSesion') {
                            this._toaster.error(this.sessionTraslate.favorIniciarSesion);
                        }
                        if (error === 'SesionCaducada') {
                            this._toaster.error(this.sessionTraslate.sesionCaducada);
                        }
                        this._router.navigate(['/login']);
                    }
                }
            );
    }

    guardarConfigurables() {
        this._pantallaServicio.mostrarSpinner();
        let campoIgual = false;
        let params: any = {};
        params.nombre = this.configurables.nombreCampoNuevo;

        if (this.configurables.nombreCampoNuevo !== '') {
            $('#inputCampoConfigurable').removeClass('errorCampo');
            for (var i = 0; i < this.configurables.dataConfigurables.length; i++) {
                if (
                    this.configurables.dataConfigurables[i].nombre.toUpperCase() ===
                    this.configurables.nombreCampoNuevo.toUpperCase()
                ) {
                    campoIgual = true;
                }
            }
            if (campoIgual === true || this.configurables.nombreCampoNuevo === '') {
                if (campoIgual === true) {
                    this._toaster.error(this.productoTranslate.errorConfigurable);
                } else {
                    $('#inputCampoConfigurable').addClass('errorCampo');
                }
            } else {
                this._backService
                    .HttpPost('catalogos/Producto/guardarConfigurables', {}, params)
                    .subscribe(
                        (response) => {
                            const evalData = eval(response);
                            if (evalData.length !== 0) {
                                this.configurables.dataConfigurables.push(evalData[0]);
                                this.configurables.nombreCampoNuevo = '';
                                $('#inputCampoConfigurable').removeClass('errorCampo');
                                if (this.configurables.dataConfigurables.length === 10) {
                                    this.configurables.limite = true;
                                } else {
                                    this.configurables.limite = false;
                                }
                                this._pantallaServicio.ocultarSpinner();
                            } else {
                                this.configurables.nombreCampoNuevo = '';
                                this.consultaConfigurables();
                            }
                        },
                        (error) => {
                            this._pantallaServicio.ocultarSpinner();
                            if (error === 'SinSesion' || error === 'SesionCaducada') {
                                if (error === 'SinSesion') {
                                    this._toaster.error(this.sessionTraslate.favorIniciarSesion);
                                }
                                if (error === 'SesionCaducada') {
                                    this._toaster.error(this.sessionTraslate.sesionCaducada);
                                }
                                this._router.navigate(['/login']);
                            }
                        }
                    );
            }
        } else {
            $('#inputCampoConfigurable').addClass('errorCampo');
            this._pantallaServicio.ocultarSpinner();
        }
    }

    eliminarConfigurables(idCampo?: any) {
        this._pantallaServicio.mostrarSpinner();
        let params: any = {};
        params.idCampo = idCampo;

        this._backService
            .HttpPost('catalogos/Producto/eliminarConfigurables', {}, params)
            .subscribe(
                (response) => {
                    for (
                        let i = 0;
                        i < this.configurables.dataConfigurables.length;
                        i++
                    ) {
                        if (this.configurables.dataConfigurables[i].idCampo === idCampo) {
                            this.configurables.dataConfigurables.splice(i, 1);
                        }
                    }
                    if (this.configurables.dataConfigurables.length === 10) {
                        this.configurables.limite = true;
                    } else {
                        this.configurables.limite = false;
                    }
                    this._pantallaServicio.ocultarSpinner();
                },
                (error) => {
                    this._pantallaServicio.ocultarSpinner();
                    if (error === 'SinSesion' || error === 'SesionCaducada') {
                        if (error === 'SinSesion') {
                            this._toaster.error(this.sessionTraslate.favorIniciarSesion);
                        }
                        if (error === 'SesionCaducada') {
                            this._toaster.error(this.sessionTraslate.sesionCaducada);
                        }
                        this._router.navigate(['/login']);
                    }
                }
            );
    }

    //PRODUCTO
    cargarProducto() {
        this._pantallaServicio.mostrarSpinner();
        let params: any = {};
        params.idPresentacion = this.stateParamsId;

        this._backService
            .HttpPost('catalogos/Producto/cargarPresentacion', {}, params)
            .subscribe(
                (response) => {
                    let dataTemp = eval(response)[0];
                    let img = eval(response)[1];
                    this.marca.select = dataTemp[0].nombreMarca;
                    this.producto.select = dataTemp[0].nombreProducto;
                    this.producto.presentacion = dataTemp[0].descripcion;
                    this.producto.unidadMedida = dataTemp[0].um;
                    this.producto.existencia = dataTemp[0].existencia;
                    this.producto.costo = dataTemp[0].costo;
                    this.producto.precio = dataTemp[0].precioVenta;
                    this.proveedor.select =
                        dataTemp[0].nombreProveedor === null
                            ? ''
                            : dataTemp[0].nombreProveedor;
                    if (dataTemp[0].nombreProveedor === null) {
                        dataTemp[0].nombreProveedor = '';
                    }
                    this.producto.contactoProv = dataTemp[0].contactoProveedor;
                    this.producto.comision =
                        dataTemp[0].comision === null ? '' : dataTemp[0].comision;
                    this.producto.iva = dataTemp[0].aplicaIva === 1; //== "1") ? true : false;
                    this.producto.activo = dataTemp[0].estatus === 1; // == "1")? true: false;
                    this.producto.cbarras = dataTemp[0].codigoBarras;
                    this.producto.infoProducto = dataTemp[0].infoProducto;
                    this.producto.idClaveProdServ = dataTemp[0].idClaveProdServ;
                    if (
                        this.producto.idClaveProdServ === '' ||
                        this.producto.idClaveProdServ === undefined
                    ) {
                        this.producto.idClaveProdServ = 97;
                    }
                    this.producto.idUnidadMedida = dataTemp[0].idUnidadMedida;
                    if (
                        this.producto.idUnidadMedida === '' ||
                        this.producto.idUnidadMedida === undefined
                    ) {
                        this.producto.idUnidadMedida = 1;
                    }

                    if (img[0].length > 0) {
                        $('#btnBorrarImagen').css('display', 'inline');
                        this.producto.imagen = 'data:image/jpeg;base64,' + img[0];
                        (document.getElementById('productoFoto') as any).src =
                            this.producto.imagen;
                        this.producto.imagenAnte = JSON.parse(JSON.stringify(img[0]));
                    }

                    this.producto.dataPrincipal = [
                        dataTemp[0].nombreMarca,
                        dataTemp[0].nombreProducto,
                        dataTemp[0].descripcion,
                        dataTemp[0].um,
                        dataTemp[0].existencia,
                        dataTemp[0].costo,
                        dataTemp[0].precioVenta,
                        dataTemp[0].nombreProveedor,
                        dataTemp[0].contactoProveedor,
                        dataTemp[0].comision === null ? '' : dataTemp[0].comision,
                        dataTemp[0].aplicaIva,
                        dataTemp[0].estatus,
                        dataTemp[0].codigoBarras,
                        dataTemp[0].infoProducto,
                        JSON.parse(JSON.stringify(this.producto.imagen)),
                    ];

                    this._pantallaServicio.ocultarSpinner();
                    this.consultaConfigurables();
                },
                (error) => {
                    this._pantallaServicio.ocultarSpinner();
                    if (error === 'SinSesion' || error === 'SesionCaducada') {
                        if (error === 'SinSesion') {
                            this._toaster.error(this.sessionTraslate.favorIniciarSesion);
                        }
                        if (error === 'SesionCaducada') {
                            this._toaster.error(this.sessionTraslate.sesionCaducada);
                        }
                        this._router.navigate(['/login']);
                    }
                }
            );
    }

    consultarFiltros() {
        this._pantallaServicio.mostrarSpinner();
        this._backService
            .HttpPost('catalogos/Producto/consultarFiltros', {}, {})
            .subscribe(
                (response) => {
                    const dataTemp = eval(response);
                    this.marca.dataMarca = dataTemp[0];
                    this.marca.dataMarcaCopy = JSON.parse(JSON.stringify(dataTemp[0]));
                    this.producto.dataProducto = dataTemp[1];
                    this.producto.dataProductoCopy = JSON.parse(
                        JSON.stringify(dataTemp[1])
                    );
                    this.unidadMedida.dataUnidadMedida = dataTemp[2];
                    this.unidadMedida.dataUnidadMedidaCopy = JSON.parse(
                        JSON.stringify(dataTemp[2])
                    );
                    this.proveedor.dataProveedor = dataTemp[3];
                    this.proveedor.dataProveedorCopy = JSON.parse(
                        JSON.stringify(dataTemp[3])
                    );
                    this._pantallaServicio.ocultarSpinner();
                },
                (error) => {
                    this._pantallaServicio.ocultarSpinner();
                    if (error === 'SinSesion' || error === 'SesionCaducada') {
                        if (error === 'SinSesion') {
                            this._toaster.error(this.sessionTraslate.favorIniciarSesion);
                        }
                        if (error === 'SesionCaducada') {
                            this._toaster.error(this.sessionTraslate.sesionCaducada);
                        }
                        this._router.navigate(['/login']);
                    }
                }
            );
    }

    guardarProducto() {
        this._pantallaServicio.mostrarSpinner();
        $('#botonGuardar').addClass('disable');
        this.clickSaveDisabled = true;
        let val1 = this.validarTagsInput();
        let val2 = this.validarCampos();
        if (val1 && val2) {
            let arrayProductos = [];
            let arrayCodigo: any = [];
            let valido = true;
            let cantidadProductos = this.listProductos.length;
            let arrayPrecio = [];
            let arrayCosto = [];
            let arrayExistencia = [];
            for (let i = 0; i < cantidadProductos; i++) {
                arrayPrecio.push(this.listPrecio[i]);
                arrayCosto.push(this.listCosto[i]);
                arrayExistencia.push(this.listExistencia[i]);
                arrayProductos.push(this.listProductos[i]);
            }

            let imgSplit = this.producto.imagen.split(',')[1];
            let params: any = {};
            params.activo = this.producto.activo;
            params.marca = this.getDataFiltros(
                this.marca.dataMarca,
                this.marca.select
            );
            params.producto = this.getDataFiltros(
                this.producto.dataProducto,
                this.producto.select
            );
            if (!this.productoCargado) {
                params.presentacion = arrayProductos;
                params.existencia = arrayExistencia;
                params.precio = arrayPrecio;
                params.cbarras = arrayCodigo;
                params.costo = arrayCosto;
            } else {
                params.presentacion = this.producto.presentacion;
                params.existencia = this.producto.existencia;
                params.precio = this.producto.precio;
                params.cbarras = this.producto.cbarras;
                params.costo = this.producto.costo;
            }

            params.proveedor = this.getDataFiltros(
                this.proveedor.dataProveedor,
                this.proveedor.select
            );
            params.contactoProv = this.producto.contactoProv;
            params.comision = this.producto.comision;
            params.iva = this.producto.iva;

            params.infoProducto = this.producto.infoProducto;

            params.pImagen = imgSplit !== undefined ? imgSplit : '';
            params.idCampo = [];
            params.valorCampo = [];
            params.idClaveProdServ = this.producto.idClaveProdServ;
            params.idUnidadMedida = this.producto.idUnidadMedida;
            if (
                params.idClaveProdServ === '' ||
                params.idClaveProdServ === undefined
            ) {
                params.idClaveProdServ = 97;
            }
            if (params.idUnidadMedida === '' || params.idUnidadMedida === undefined) {
                params.idUnidadMedida = 1;
            }
            for (let i = 0; i < this.configurables.dataConfigurables.length; i++) {
                params.idCampo[i] = this.configurables.dataConfigurables[i].idCampo;
                params.valorCampo[i] = this.configurables.dataConfigurables[i].valor;
                if (params.valorCampo[i] === undefined) {
                    params.valorCampo[i] = '';
                }
            }
            let auxI = 0;
            if (this.stateParamsId === 'N') {
                let validarRepeticiones = true;
                let msjRepetidos = this.productoTranslate.errorRepeat1;
                for (let i = 0; i < params.presentacion.length; i++) {
                    let params2: any = {};
                    params2.presentacion = params.presentacion[i];
                    params2.marca = params.marca[0];
                    params2.producto = params.producto[0];

                    this._backService
                        .HttpPost('catalogos/Producto/validExistPresentacion', {}, params2)
                        .subscribe(
                            (response) => {
                                auxI++;
                                if (response !== '') {
                                    msjRepetidos += response + ', ';

                                    validarRepeticiones = false;
                                }
                                if (auxI === params.presentacion.length) {
                                    msjRepetidos = msjRepetidos.slice(0, -1);
                                    msjRepetidos = msjRepetidos.slice(0, -1);
                                    msjRepetidos += this.productoTranslate.errorRepeat2;
                                    if (validarRepeticiones) {
                                        this._backService
                                            .HttpPost(
                                                'catalogos/Producto/guardarProductos',
                                                {},
                                                params
                                            )
                                            .subscribe(
                                                (response) => {
                                                    this._pantallaServicio.ocultarSpinner();
                                                    this._router.navigate(['/inventario/productos']);
                                                },
                                                (error) => {
                                                    this._pantallaServicio.ocultarSpinner();
                                                    this.clickSaveDisabled = false;
                                                    if (
                                                        error === 'SinSesion' ||
                                                        error === 'SesionCaducada'
                                                    ) {
                                                        if (error === 'SinSesion') {
                                                            this._toaster.error(
                                                                this.sessionTraslate.favorIniciarSesion
                                                            );
                                                        }
                                                        if (error === 'SesionCaducada') {
                                                            this._toaster.error(
                                                                this.sessionTraslate.sesionCaducada
                                                            );
                                                        }
                                                        this._router.navigate(['/login']);
                                                    }
                                                }
                                            );
                                    } else {
                                        this._pantallaServicio.ocultarSpinner();
                                        this.clickSaveDisabled = false;
                                        this._toaster.error(msjRepetidos);
                                    }
                                }
                            },
                            (error) => {
                                this._pantallaServicio.ocultarSpinner();
                                if (error === 'SinSesion' || error === 'SesionCaducada') {
                                    if (error === 'SinSesion') {
                                        this._toaster.error(
                                            this.sessionTraslate.favorIniciarSesion
                                        );
                                    }
                                    if (error === 'SesionCaducada') {
                                        this._toaster.error(this.sessionTraslate.sesionCaducada);
                                    }
                                    this._router.navigate(['/login']);
                                }
                            }
                        );
                }
            } else {
                let msjRepetidos = this.productoTranslate.errorRepeat1;
                let params2: any = {};
                params2.presentacion = params.presentacion;
                params2.marca = params.marca[0];
                params2.producto = params.producto[0];
                params2.idPresentacion = this.stateParamsId;

                this._backService
                    .HttpPost(
                        'catalogos/Producto/validExistPresentacionActualizar',
                        {},
                        params2
                    )
                    .subscribe(
                        (response) => {
                            if (response !== '') {
                                msjRepetidos += response;
                                msjRepetidos += this.productoTranslate.errorRepeat2;
                                this.clickSaveDisabled = false;
                                this._toaster.error(msjRepetidos);
                                this.validarRepeticiones = false;
                            } else {
                                params.idPresentacion = this.stateParamsId;
                                this._backService
                                    .HttpPost('catalogos/Producto/actualizarProducto', {}, params)
                                    .subscribe(
                                        (response) => {
                                            this._pantallaServicio.ocultarSpinner();
                                            this._router.navigate(['/inventario/productos']);
                                        },
                                        (error) => {
                                            this._pantallaServicio.ocultarSpinner();
                                            this.clickSaveDisabled = false;
                                            if (error === 'SinSesion' || error === 'SesionCaducada') {
                                                if (error === 'SinSesion') {
                                                    this._toaster.error(
                                                        this.sessionTraslate.favorIniciarSesion
                                                    );
                                                }
                                                if (error === 'SesionCaducada') {
                                                    this._toaster.error(
                                                        this.sessionTraslate.sesionCaducada
                                                    );
                                                }
                                                this._router.navigate(['/login']);
                                            }
                                        }
                                    );
                            }
                        },
                        (error) => {
                            this._pantallaServicio.ocultarSpinner();
                            this.clickSaveDisabled = false;
                            if (error === 'SinSesion' || error === 'SesionCaducada') {
                                if (error === 'SinSesion') {
                                    this._toaster.error(this.sessionTraslate.favorIniciarSesion);
                                }
                                if (error === 'SesionCaducada') {
                                    this._toaster.error(this.sessionTraslate.sesionCaducada);
                                }
                                this._router.navigate(['/login']);
                            }
                        }
                    );
            }
        } else {
            this._pantallaServicio.ocultarSpinner();
            $('#botonGuardar').removeClass('disable');
            this.clickSaveDisabled = false;
        }
    }

    validarExistPresentacion(presentacion?: any, marca?: any, producto?: any) {
        let params: any = {};
        params.presentacion = presentacion;
        params.marca = marca;
        params.producto = producto;

        this._backService
            .HttpPost('catalogos/Producto/validExistPresentacion', {}, params)
            .subscribe(
                (response) => {
                    if (response === 'True') {
                        return true;
                    } else {
                        return false;
                    }
                },
                (error) => {
                    this._pantallaServicio.ocultarSpinner();
                    if (error === 'SinSesion' || error === 'SesionCaducada') {
                        if (error === 'SinSesion') {
                            this._toaster.error(this.sessionTraslate.favorIniciarSesion);
                        }
                        if (error === 'SesionCaducada') {
                            this._toaster.error(this.sessionTraslate.sesionCaducada);
                        }
                        this._router.navigate(['/login']);
                    }
                }
            );
    }

    validarCampos() {
        let valido = true;
        this.guardar = true;
        let regExTexto =
            /^[A-Za-z0-9\sÀ-ÖØ-öø-ÿ,]{1,}[\.]{0,1}[A-Za-z0-9\sÀ-ÖØ-öø-ÿ]{0,}$/;
        let regExNumero = /^\d{0,8}$/;
        let regExMoneda = /^\d{0,8}([.]\d{2})?([.]\d{1})?$/;
        let marca = this.getOnlyName(this.marca.select);
        let producto = this.getOnlyName(this.producto.select);
        let unidadMedida = this.getOnlyName(this.producto.unidadMedida);
        let proveedor = this.getOnlyName(this.proveedor.select);
        if (marca.length > 0) {
            $('#errortxtMarca').text('');
            $('#txtMarca').removeClass('errorCampo');
        } else {
            valido = false;
            $('#errortxtMarca').text('');
            $('#txtMarca').addClass('errorCampo');
        }
        if (producto.length > 0) {
            $('#errortxtProducto').text('');
            $('#txtProducto').removeClass('errorCampo');
        } else {
            valido = false;
            $('#errortxtProducto').text('');
            $('#txtProducto').addClass('errorCampo');
        }
        if (proveedor.length > 0) {
            if (regExTexto.test(proveedor)) {
                $('#errortxtProveedor').text('');
                $('#txtProveedor').removeClass('errorCampo');
            } else {
                valido = false;
                $('#errortxtProveedor').text(this.productoTranslate.errorProveedor);
                $('#txtProveedor').addClass('errorCampo');
            }
        }
        if (this.producto.contactoProv.length > 0) {
            if (regExTexto.test(this.producto.contactoProv)) {
                $('#errortxtContactoProv').text('');
                $('#txtContactoProv').removeClass('errorCampo');
            } else {
                valido = false;
                $('#errortxtContactoProv').text(
                    this.productoTranslate.errorContactoProv
                );
                $('#txtContactoProv').addClass('errorCampo');
            }
        } else {
            $('#errortxtContactoProv').text('');
            $('#txtContactoProv').removeClass('errorCampo');
        }
        if (this.producto.comision !== '') {
            if (regExNumero.test(this.producto.comision)) {
                $('#errortxtComision').text('');
                $('#txtComision').removeClass('errorCampo');
            } else {
                valido = false;
                $('#errortxtComision').text(this.productoTranslate.errorComision);
                $('#txtComision').addClass('errorCampo');
            }
        } else {
            $('#errortxtComision').text('');
            $('#txtComision').removeClass('errorCampo');
        }
        if (this.producto.infoProducto.length > 0) {
            if (regExTexto.test(this.producto.infoProducto)) {
                $('#errortxtInfoProducto').text('');
                $('#txtInfoProducto').removeClass('errorCampo');
            } else {
                valido = false;
                $('#errortxtInfoProducto').text(
                    this.productoTranslate.errorInfoProducto
                );
                $('#txtInfoProducto').addClass('errorCampo');
            }
        } else {
            $('#errortxtInfoProducto').text('');
            $('#txtInfoProducto').removeClass('errorCampo');
        }
        return valido;
    }

    validarTagsInput() {
        if (!this.productoCargado) {
            $('#errortxtCbarras').text('');
            $('#errortxtCosto').text('');
            $('#errortxtPrecio').text('');
            $('#errortxtExistencia').text('');
            $('#errortxtPresentacion').text('');
            $('#txtPresentacion .tag-input-ctn').removeClass('errorCampo');
            $('.txtPresentacion').removeClass('errorCampo');
            $('#txtCosto .tag-input-ctn').removeClass('errorCampo');
            $('.txtCosto').removeClass('errorCampo');
            $('#txtCbarras .tag-input-ctn').removeClass('errorCampo');
            $('#txtPrecio .tag-input-ctn').removeClass('errorCampo');
            $('.txtPrecio').removeClass('errorCampo');
            $('#txtExistencia .tag-input-ctn').removeClass('errorCampo');
            $('.txtExistencia').removeClass('errorCampo');
            let arrayProductos: any = [];
            let arrayCodigo: any = [];

            let valido = true;

            if (!this.isGerenteCosto) {
                this.listCosto = [];
                for (let i = 0; i < this.listProductos.length; i++) {
                    this.listCosto.push({ id: 0, text: '0' });
                }
                if (this.listPrecio.length === 1) {
                    for (let i = 0; i < this.listProductos.length - 1; i++) {
                        this.listPrecio.push({ id: i + 1, text: this.listPrecio[0].text });
                    }
                }
            }

            if (this.listCosto.length === 1 && this.listPrecio.length === 1) {
                for (let i = 0; i < this.listProductos.length - 1; i++) {
                    this.listCosto.push({ id: i + 1, text: this.listCosto[0].text });
                    this.listPrecio.push({ id: i + 1, text: this.listPrecio[0].text });
                }
            }

            if (
                this.listProductos !== '' &&
                this.listProductos !== undefined &&
                this.listProductos !== null &&
                this.listProductos.length !== 0
            ) {
                if (
                    this.listCodigo !== '' &&
                    this.listCodigo !== undefined &&
                    this.listCodigo !== null &&
                    this.listCodigo.length !== 0
                ) {
                    arrayCodigo = this.listCodigo;
                }
                arrayProductos = this.listProductos;

                if (
                    this.listExistencia !== undefined &&
                    this.listExistencia !== null &&
                    arrayProductos.length === this.listExistencia.length &&
                    this.listExistencia.length > 0
                ) {
                } else {
                    valido = false;
                    $('#errortxtExistencia').text(
                        this.productoTranslate.errorDatoPresetnacion
                    );
                    $('#txtExistencia .tag-input-ctn').addClass('errorCampo');
                    $('.txtExistencia').addClass('errorCampo');
                    //Error la existencia es diferente
                }

                if (
                    this.listPrecio !== undefined &&
                    this.listPrecio !== null &&
                    arrayProductos.length === this.listPrecio.length &&
                    this.listPrecio.length > 0
                ) {
                } else {
                    valido = false;
                    $('#errortxtPrecio').text(
                        this.productoTranslate.errorDatoPresetnacion
                    );
                    $('#txtPrecio .tag-input-ctn').addClass('errorCampo');
                    $('.txtPrecio').addClass('errorCampo');
                    //Error el precio es diferente
                }

                if (
                    this.listCosto !== undefined &&
                    this.listCosto !== null &&
                    arrayProductos.length === this.listCosto.length &&
                    this.listCosto.length > 0
                ) {
                } else {
                    valido = false;
                    $('#errortxtCosto').text(
                        this.productoTranslate.errorDatoPresetnacion
                    );
                    $('#txtCosto .tag-input-ctn').addClass('errorCampo');
                    $('.txtCosto').addClass('errorCampo');
                    //Error el costo es diferente
                }

                if (
                    arrayCodigo !== undefined &&
                    arrayCodigo !== null &&
                    arrayProductos.length === arrayCodigo.length &&
                    arrayCodigo.length > 0
                ) {
                } else {
                    if (arrayCodigo.length === 0) {
                    } else {
                        valido = false;
                        $('#errortxtCbarras').text(
                            this.productoTranslate.errorDatoPresetnacion
                        );
                        $('#txtCbarras .tag-input-ctn').addClass('errorCampo');
                    }
                    //error el codigo es diferente
                }

                if (valido) {
                    $('#errortxtCbarras').text('');
                    $('#errortxtCosto').text('');
                    $('#errortxtPrecio').text('');
                    $('#errortxtExistencia').text('');
                    $('#errortxtPresentacion').text('');
                    $('#txtPresentacion .tag-input-ctn').removeClass('errorCampo');
                    $('.txtPresentacion').removeClass('errorCampo');
                    $('#txtCosto .tag-input-ctn').removeClass('errorCampo');
                    $('.txtCosto').removeClass('errorCampo');
                    $('#txtCbarras .tag-input-ctn').removeClass('errorCampo');
                    $('#txtPrecio .tag-input-ctn').removeClass('errorCampo');
                    $('.txtPrecio').removeClass('errorCampo');
                    $('#txtExistencia .tag-input-ctn').removeClass('errorCampo');
                    $('.txtExistencia').removeClass('errorCampo');
                    return true;
                }
            } else {
                // $("#errortxtPresentacion").text($translate.instant('producto.errorFaltaPresentaciones')); //Falta agregar productos
                $('#txtPresentacion .tag-input-ctn').addClass('errorCampo');
                $('.txtPresentacion').addClass('errorCampo');
            }

            return false;
        } else {
            return true;
        }
    }

    isJson(str?: any) {
        if (str.id !== undefined) {
            return true;
        } else {
            return false;
        }
    }

    txtfocus(v?: any, event?: any, t?: any) {
        var camposValidar = [
            'txtMarca',
            'txtProducto',
            'txtPresentacion',
            'txtUnidadMedida',
            'txtExistencia',
            'txtCosto',
            'txtPrecio',
        ];
        if (t === 'f') {
            if (this.guardar) {
                let txt = (document.getElementById(event.target.id) as any).value;
                let error = (document.getElementById('error' + event.target.id) as any)
                    .innerHTML;
                if (error === '' || error === undefined) {
                    $('#' + event.target.id).removeClass('errorCampo');
                }
            }
        } else {
            if (this.guardar) {
                let txt = (document.getElementById(event.target.id) as any).value;
                if (txt === '' || txt === undefined) {
                    if (camposValidar.indexOf(event.target.id) >= 0) {
                        $('#' + event.target.id).addClass('errorCampo');
                    }
                } else {
                    let error = (
                        document.getElementById('error' + event.target.id) as any
                    ).innerHTML;
                    if (error === '' || error === undefined) {
                        $('#' + event.target.id).removeClass('errorCampo');
                    }
                }
            }
        }
    }

    mostrarGrid(op?: any) {
        switch (op) {
            case 1:
                this.tituloModal = this.productoTranslate.listadoMarcas;
                //$('#tituloModal').html(this.productoTranslate.listadoMarcas);
                this.altura = this.marca.dataMarcaCopy.length * 30 + 30;
                this.producto.mostrarModal = 1;
                this.dataSourceTable = new MatTableDataSource(this.marca.dataMarcaCopy);
                this.dataSourceTable.paginator = this.paginatorTable;
                this.modales.modalgrid.show();
                break;
            case 2:
                this.tituloModal = this.productoTranslate.listadoProductos;
                //$('#tituloModal').html(this.productoTranslate.listadoProductos);
                this.altura = this.producto.dataProductoCopy.length * 30 + 30;
                this.producto.mostrarModal = 2;
                this.dataSourceTable = new MatTableDataSource(
                    this.producto.dataProductoCopy
                );
                this.dataSourceTable.paginator = this.paginatorTable;
                this.modales.modalgrid.show();
                break;
            case 3:
                this.tituloModal = this.productoTranslate.listadoUnidadMedida;
                //$('#tituloModal').html(this.productoTranslate.listadoUnidadMedida);
                this.altura = this.unidadMedida.dataUnidadMedidaCopy.length * 30 + 30;
                this.producto.mostrarModal = 3;
                this.dataSourceTable = new MatTableDataSource(
                    this.unidadMedida.dataUnidadMedidaCopy
                );
                this.dataSourceTable.paginator = this.paginatorTable;
                this.modales.modalgrid.show();
                break;
            case 4:
                this.tituloModal = this.productoTranslate.listadoProveedores;
                //$('#tituloModal').html(this.productoTranslate.listadoProveedores);
                this.altura = this.proveedor.dataProveedorCopy.length * 30 + 30;
                this.producto.mostrarModal = 4;
                this.dataSourceTable = new MatTableDataSource(
                    this.proveedor.dataProveedorCopy
                );
                this.dataSourceTable.paginator = this.paginatorTable;
                this.modales.modalgrid.show();
                break;
        }
    }

    eliminarFiltro(idBusqueda?: any) {
        this._pantallaServicio.mostrarSpinner();
        let params2: any = {};
        switch (this.producto.mostrarModal) {
            case 1:
                params2.idInventarioMarca = idBusqueda;
                this._backService
                    .HttpPost('catalogos/Producto/validateEliminarMarca', {}, params2)
                    .subscribe(
                        (response) => {
                            let validateEliminar = eval(response);
                            if (validateEliminar === 'Baja') {
                                let item = this.marca.dataMarcaCopy.filter((d: any) => {
                                    if (d.id.match(idBusqueda) !== null) {
                                        return d;
                                    }
                                })[0];

                                let index = this.marca.dataMarcaCopy.indexOf(item);
                                this.marca.dataMarcaCopy.splice(index, 1);
                                this.altura = this.marca.dataMarcaCopy.length * 30 + 30;
                                this.producto.idEliminar.push(idBusqueda);
                                this.tipoFiltro = 1;
                                this.dataSourceTable = new MatTableDataSource(
                                    this.marca.dataMarcaCopy
                                );
                                this.dataSourceTable.paginator = this.paginatorTable;
                            } else {
                                this._toaster.error(
                                    this.productoTranslate.errorEliminarProducto
                                );
                            }
                            this._pantallaServicio.ocultarSpinner();
                        },
                        (error) => {
                            this._pantallaServicio.ocultarSpinner();
                            if (error === 'SinSesion' || error === 'SesionCaducada') {
                                if (error === 'SinSesion') {
                                    this._toaster.error(this.sessionTraslate.favorIniciarSesion);
                                }
                                if (error === 'SesionCaducada') {
                                    this._toaster.error(this.sessionTraslate.sesionCaducada);
                                }
                                this._router.navigate(['/login']);
                            }
                        }
                    );
                break;
            case 2:
                params2.idInventarioPresentacion = idBusqueda;
                this._backService
                    .HttpPost('catalogos/Producto/validateEliminarProducto', {}, params2)
                    .subscribe(
                        (response) => {
                            let validateEliminar = eval(response);
                            if (validateEliminar === 'Baja') {
                                let item = this.producto.dataProductoCopy.filter((d: any) => {
                                    if (d.id.match(idBusqueda) !== null) {
                                        return d;
                                    }
                                })[0];

                                let index = this.producto.dataProductoCopy.indexOf(item);
                                this.producto.dataProductoCopy.splice(index, 1);
                                this.altura = this.producto.dataProductoCopy.length * 30 + 30;
                                this.producto.idEliminar.push(idBusqueda);
                                this.tipoFiltro = 2;
                                this.dataSourceTable = new MatTableDataSource(
                                    this.producto.dataProductoCopy
                                );
                                this.dataSourceTable.paginator = this.paginatorTable;
                            } else {
                                this._toaster.error(
                                    this.productoTranslate.errorEliminarProducto
                                );
                            }
                            this._pantallaServicio.ocultarSpinner();
                        },
                        (error) => {
                            this._pantallaServicio.ocultarSpinner();
                            if (error === 'SinSesion' || error === 'SesionCaducada') {
                                if (error === 'SinSesion') {
                                    this._toaster.error(this.sessionTraslate.favorIniciarSesion);
                                }
                                if (error === 'SesionCaducada') {
                                    this._toaster.error(this.sessionTraslate.sesionCaducada);
                                }
                                this._router.navigate(['/login']);
                            }
                        }
                    );
                break;
            case 3:
                params2.idInventarioUnidadMedida = idBusqueda;
                this._backService
                    .HttpPost(
                        'catalogos/Producto/validateEliminarUnidadMedida',
                        {},
                        params2
                    )
                    .subscribe(
                        (response) => {
                            let validateEliminar = eval(response);
                            if (validateEliminar === 'Baja') {
                                let item = this.unidadMedida.dataUnidadMedidaCopy.filter(
                                    (d: any) => {
                                        if (d.id.match(idBusqueda) !== null) {
                                            return d;
                                        }
                                    }
                                )[0];

                                let index =
                                    this.unidadMedida.dataUnidadMedidaCopy.indexOf(item);
                                this.unidadMedida.dataUnidadMedidaCopy.splice(index, 1);
                                this.altura =
                                    this.unidadMedida.dataUnidadMedidaCopy.length * 30 + 30;
                                this.producto.idEliminar.push(idBusqueda);
                                this.tipoFiltro = 3;
                                this.dataSourceTable = new MatTableDataSource(
                                    this.unidadMedida.dataUnidadMedidaCopy
                                );
                                this.dataSourceTable.paginator = this.paginatorTable;
                            } else {
                                this._toaster.error(
                                    this.productoTranslate.errorEliminarUnidadMedida
                                );
                            }
                            this._pantallaServicio.ocultarSpinner();
                        },
                        (error) => {
                            this._pantallaServicio.ocultarSpinner();
                            if (error === 'SinSesion' || error === 'SesionCaducada') {
                                if (error === 'SinSesion') {
                                    this._toaster.error(this.sessionTraslate.favorIniciarSesion);
                                }
                                if (error === 'SesionCaducada') {
                                    this._toaster.error(this.sessionTraslate.sesionCaducada);
                                }
                                this._router.navigate(['/login']);
                            }
                        }
                    );
                break;
            case 4:
                params2.idInventarioProveedor = idBusqueda;
                this._backService
                    .HttpPost('catalogos/Producto/validateEliminarProveedor', {}, params2)
                    .subscribe(
                        (response) => {
                            let validateEliminar = eval(response);
                            if (validateEliminar === 'Baja') {
                                let item = this.proveedor.dataProveedorCopy.filter((d: any) => {
                                    if (d.id.match(idBusqueda) !== null) {
                                        return d;
                                    }
                                })[0];

                                let index = this.proveedor.dataProveedorCopy.indexOf(item);
                                this.proveedor.dataProveedorCopy.splice(index, 1);
                                this.altura = this.proveedor.dataProveedorCopy.length * 30 + 30;
                                this.producto.idEliminar.push(idBusqueda);
                                this.tipoFiltro = 4;
                                this.dataSourceTable = new MatTableDataSource(
                                    this.proveedor.dataProveedorCopy
                                );
                                this.dataSourceTable.paginator = this.paginatorTable;
                            } else {
                                this._toaster.error(
                                    this.productoTranslate.errorEliminarProveedor
                                );
                            }
                            this._pantallaServicio.ocultarSpinner();
                        },
                        (error) => {
                            this._pantallaServicio.ocultarSpinner();
                            if (error === 'SinSesion' || error === 'SesionCaducada') {
                                if (error === 'SinSesion') {
                                    this._toaster.error(this.sessionTraslate.favorIniciarSesion);
                                }
                                if (error === 'SesionCaducada') {
                                    this._toaster.error(this.sessionTraslate.sesionCaducada);
                                }
                                this._router.navigate(['/login']);
                            }
                        }
                    );
                break;
        }
    }

    confirmarEliminar() {
        if (this.producto.idEliminar.length > 0) {
            let params: any = {};
            params.tipoFiltro = this.tipoFiltro;
            params.idEliminar = this.producto.idEliminar;
            this.marca.dataMarca = JSON.parse(
                JSON.stringify(this.marca.dataMarcaCopy)
            );
            this.producto.dataProducto = JSON.parse(
                JSON.stringify(this.producto.dataProductoCopy)
            );
            this.unidadMedida.dataUnidadMedida = JSON.parse(
                JSON.stringify(this.unidadMedida.dataUnidadMedidaCopy)
            );
            this.proveedor.dataProveedor = JSON.parse(
                JSON.stringify(this.proveedor.dataProveedorCopy)
            );

            this._backService
                .HttpPost('catalogos/Producto/eliminarFiltros', {}, params)
                .subscribe(
                    (response) => {
                        this.consultarFiltros();
                    },
                    (error) => {
                        this._pantallaServicio.ocultarSpinner();
                        if (error === 'SinSesion' || error === 'SesionCaducada') {
                            if (error === 'SinSesion') {
                                this._toaster.error(this.sessionTraslate.favorIniciarSesion);
                            }
                            if (error === 'SesionCaducada') {
                                this._toaster.error(this.sessionTraslate.sesionCaducada);
                            }
                            this._router.navigate(['/login']);
                        }
                    }
                );
        }
    }

    getDataFiltros(data?: any, pnomBuscar?: any) {
        let nomBuscar: any = '';
        if (typeof pnomBuscar === 'object') {
            nomBuscar = pnomBuscar.nombre;
        } else {
            nomBuscar = pnomBuscar;
        }

        let f = data.filter((d: any) => {
            if (d.nombre.toUpperCase().match(nomBuscar.toUpperCase()) !== null) {
                return d;
            }
        })[0];

        if (f !== undefined) {
            return [f.id.toString(), nomBuscar];
        } else {
            return ['-1', nomBuscar];
        }
    }

    getOnlyName(valor?: any) {
        if (typeof valor === 'object') {
            if (valor !== null) {
                return valor.nombre;
            } else {
                return '';
            }
        } else {
            return valor;
        }
    }

    cargarPantalla() {
        if (this.stateParamsId === 'N') {
            this.productoCargado = false;
            this.producto.dataPrincipal = [
                '',
                '',
                '',
                '',
                '',
                '',
                '',
                '',
                '',
                '',
                false,
                true,
                '',
                '',
                '',
            ];
            this.consultaConfigurables();
        } else {
            this.productoCargado = true;
            this.cargarProducto();
            $('#txtExistencia').attr('disabled', true);
            $('.txtExistencia').attr('disabled', true);
            $('#txtCosto').attr('disabled', true);
            $('.txtCosto').attr('disabled', true);
        }
        this.getGerente();
    }

    descartarCambiosProductos(dir?: any) {
        let cambios = false;
        let dataActual = [
            JSON.parse(JSON.stringify(this.getOnlyName(this.marca.select))),
            JSON.parse(JSON.stringify(this.getOnlyName(this.producto.select))),
            JSON.parse(JSON.stringify(this.producto.presentacion)),
            JSON.parse(JSON.stringify(this.getOnlyName(this.producto.unidadMedida))),
            JSON.parse(JSON.stringify(this.producto.existencia)),
            JSON.parse(JSON.stringify(this.producto.costo)),
            JSON.parse(JSON.stringify(this.producto.precio)),
            JSON.parse(JSON.stringify(this.getOnlyName(this.proveedor.select))),
            JSON.parse(JSON.stringify(this.producto.contactoProv)),
            JSON.parse(JSON.stringify(this.producto.comision)),
            JSON.parse(JSON.stringify(this.producto.iva)),
            JSON.parse(JSON.stringify(this.producto.activo)),
            JSON.parse(JSON.stringify(this.producto.cbarras)),
            JSON.parse(JSON.stringify(this.producto.infoProducto)),
            JSON.parse(
                JSON.stringify(
                    (document.getElementById('productoFoto') as any).src.indexOf(
                        'iconoCamara'
                    ) > 0
                        ? ''
                        : (document.getElementById('productoFoto') as any).src
                )
            ),
        ];
        for (let i = 0; i < dataActual.length; i++) {
            if (dataActual[i] !== this.producto.dataPrincipal[i]) {
                cambios = true;
            }
        }
        if (cambios) {
            $('#modalConfirm .modal-body').html(
                '<span class="title">' +
                this.configuracionSucursalTranslate.descartarCambios +
                '</span>'
            );
            this.modales.modalConfirm.show();
        } else {
            //   if (dir === undefined)
            //     this._router.navigate(['/' + this.rootScope_toState]);
            //   else this._router.navigate(['/' + dir]);
            this._router.navigate(['/inventario/productos']);
        }
    }

    cancelarParametros() {
        this._router.navigate(['/inventario/productos']);
    }

    getGerente() {
        this._backService
            .HttpPost('catalogos/Producto/getGerente', {}, {})
            .subscribe(
                (response) => {
                    this.isGerenteCosto = eval(response);
                },
                (error) => {
                    this._pantallaServicio.ocultarSpinner();
                    if (error === 'SinSesion' || error === 'SesionCaducada') {
                        if (error === 'SinSesion') {
                            this._toaster.error(this.sessionTraslate.favorIniciarSesion);
                        }
                        if (error === 'SesionCaducada') {
                            this._toaster.error(this.sessionTraslate.sesionCaducada);
                        }
                        this._router.navigate(['/login']);
                    }
                }
            );
    }

    /////////////////////////////////////////////// FUNCIONES DEL LECTOR DE BARCODE ///////////////////////////////////////////////////

    //Cuando se abre el modal la primera vez para leer el codigo de barras
    leerCodigoBarras() {
        this.scannerEnabled = true;
        this.modales.modalBarCode.show();
    }

    //En caso de que seleccione Si en el modal-confirm-BarCode se procede a capturar dicho codigo en el input inicial
    guardarBarCode() {
        const camaraAuxiliar = JSON.parse(JSON.stringify(this.selectedDevice));
        this.producto.cbarras = JSON.parse(JSON.stringify(this.codigoBarrasCamara));
        this.codigoBarrasCamara = '';
        this.imgCanvas = '';
        this.selectedDevice = null;
        this.scannerEnabled = false;
        this.selectedDevice = camaraAuxiliar;
        this.modales.modalBarCode.hide();
    }

    //En caso de que seleccione No en el modal-confirm-BarCode se procede cerrar dicho modal y a volver a capturar el codigo
    scannerAgain() {
        const camaraAuxiliar = JSON.parse(JSON.stringify(this.selectedDevice));
        this.codigoBarrasCamara = '';
        this.imgCanvas = '';
        this.selectedDevice = null;
        this.scannerEnabled = true;
        this.selectedDevice = camaraAuxiliar;
    }

    //Se cierra el modalBarCode cuando se pulsa en Salir o en la X del modal
    cerrarModal() {
        this.codigoBarrasCamara = '';
        this.imgCanvas = '';
        this.scannerEnabled = false;
        this.modales.modalBarCode.hide();
    }

    cargarCPS() {
        let params: any = {};
        this._backService
            .HttpPost('catalogos/Servicio/cargarCPS', {}, params)
            .subscribe(
                (response) => {
                    this.dataCPS = eval(response);
                },
                (error) => {
                    this._pantallaServicio.ocultarSpinner();
                    if (error === 'SinSesion' || error === 'SesionCaducada') {
                        if (error === 'SinSesion') {
                            this._toaster.error(this.sessionTraslate.favorIniciarSesion);
                        }
                        if (error === 'SesionCaducada') {
                            this._toaster.error(this.sessionTraslate.sesionCaducada);
                        }
                        this._router.navigate(['/login']);
                    }
                }
            );
    }

    cargarUnidadMedida() {
        let params: any = {};

        this._backService
            .HttpPost('catalogos/Servicio/cargarUnidadMedida', {}, params)
            .subscribe(
                (response) => {
                    this.dataUM = eval(response);
                },
                (error) => {
                    this._pantallaServicio.ocultarSpinner();
                    if (error === 'SinSesion' || error === 'SesionCaducada') {
                        if (error === 'SinSesion') {
                            this._toaster.error(this.sessionTraslate.favorIniciarSesion);
                        }
                        if (error === 'SesionCaducada') {
                            this._toaster.error(this.sessionTraslate.sesionCaducada);
                        }
                        this._router.navigate(['/login']);
                    }
                }
            );
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

    validarNumDecimal(e: any) {
        let key;
        if (window.event) {
            // IE
            key = e.keyCode;
        } else if (e.which) {
            // Netscape/Firefox/Opera
            key = e.which;
        }
        if (key < 48 || key > 57) {
            if (key === 46 && !e.target.value.includes('.')) {
                return true;
            }
            if (key === 8) {
                return true;
            }
            return false;
        }
        return true;
    }

    // Para los inputs de multiples etiquetas-----------------------
    add(event: MatChipInputEvent, array: any): void {
        const value = (event.value || '').trim();
        // Add our fruit
        if (value) {
            if (array === 'listProductos') {
                this.listProductos.push(value);
            }
            if (array === 'listExistencia') {
                this.listExistencia.push(value);
            }
            if (array === 'listCosto') {
                this.listCosto.push(value);
            }
            if (array === 'listCodigo') {
                this.listCodigo.push(value);
            }
            if (array === 'listPrecio') {
                this.listPrecio.push(value);
            }
        }
        // Clear the input value
        event.chipInput!.clear();
    }

    remove(item: any, array: any): void {
        let index: any;
        if (array === 'listProductos') {
            index = this.listProductos.indexOf(item);
            if (index >= 0) {
                this.listProductos.splice(index, 1);
            }
        }
        if (array === 'listExistencia') {
            index = this.listExistencia.indexOf(item);
            if (index >= 0) {
                this.listExistencia.splice(index, 1);
            }
        }
        if (array === 'listCosto') {
            index = this.listCosto.indexOf(item);
            if (index >= 0) {
                this.listCosto.splice(index, 1);
            }
        }
        if (array === 'listCodigo') {
            index = this.listCodigo.indexOf(item);
            if (index >= 0) {
                this.listCodigo.splice(index, 1);
            }
        }
        if (array === 'listPrecio') {
            index = this.listPrecio.indexOf(item);
            if (index >= 0) {
                this.listPrecio.splice(index, 1);
            }
        }
    }

    filterInput(inputChnage: any) {
        if (inputChnage === 'marca') {
            const filterValue = this.marca.select.toLowerCase();
            this.displayFilterMarcas = this.marca.dataMarca.filter((option: any) =>
                option.nombre.toLowerCase().includes(filterValue)
            );
        }
        if (inputChnage === 'producto') {
            const filterValue = this.producto.select.toLowerCase();
            this.displayFilterProductos = this.producto.dataProducto.filter(
                (option: any) => option.nombre.toLowerCase().includes(filterValue)
            );
        }
        if (inputChnage === 'proveedor') {
            const filterValue = this.proveedor.select.toLowerCase();
            this.displayFilterProveedores = this.proveedor.dataProveedor.filter(
                (option: any) => option.nombre.toLowerCase().includes(filterValue)
            );
        }
    }

    // Funcion del barcode cuando se obtiene datos
    scanSuccessHandler(foto: any) {
        if (foto) {
            html2canvas(document.getElementById('imgScanner') as any).then(
                (canvas) => {
                    this.codigoBarrasCamara = foto;
                    this.imgCanvas = canvas.toDataURL();
                    this.scannerEnabled = false;
                }
            );
        }
    }

    camerasFoundHandler(cameras: MediaDeviceInfo[]) {
        if (cameras.length > 0) {
            this.availableDevices = cameras;
            this.selectedDevice = cameras[0];
        }
    }

    cambiarCamara(deviceId: any) {
        const camaraSeleccionada = this.availableDevices.find(
            (a) => a.deviceId === deviceId
        );
        this.selectedDevice = camaraSeleccionada;
    }
}
