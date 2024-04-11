import { Component, OnInit } from '@angular/core';
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
    selector: 'app-recepcion-producto-creacion-edicion',
    templateUrl: './recepcion-producto-creacion-edicion.component.html',
    styleUrls: [
        './recepcion-producto-creacion-edicion.component.scss',
        '../../../page.component.scss',
    ],
})
export class RecepcionProductoCreacionEdicionComponent implements OnInit {
    agregarOrdenCompraTranslate: any = {};
    sessionTraslate: any = {};

    // Modales
    modales: any = {};

    constructor(
        private _backService: MethodsService,
        private _translate: TranslateService,
        private _pantallaServicio: PantallaService,
        private _router: Router,
        private _toaster: ToasterService,
        private _route: ActivatedRoute,
        private matIconRegistry: MatIconRegistry,
		private domSanitizer: DomSanitizer,
    ) {
        this._translate.setDefaultLang(this._pantallaServicio.idioma);
        this._translate.use(this._pantallaServicio.idioma);
        this._translate
            .get('agregarOrdenCompraTranslate')
            .subscribe((translated: string) => {
                this.agregarOrdenCompraTranslate = this._translate.instant(
                    'agregarOrdenCompraTranslate'
                );
                this.sessionTraslate = this._translate.instant('sessionTraslate');
            });

        this.matIconRegistry.addSvgIcon('iconCalendario', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../../assets/icons/finales/CalendarioEditar-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconAgregar', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../../assets/icons/finales/Agregar-1-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconEliminar', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../../assets/icons/finales/Basura-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconEditar', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../../assets/icons/finales/Editar-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconGuardar', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../../assets/icons/finales/Guardar-icon.svg"));
		this.matIconRegistry.addSvgIcon('iconCasita', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../../assets/icons/finales/Casa1-icon.svg"));
		this.matIconRegistry.addSvgIcon('iconFlechaDerecha', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../../assets/icons/finales/FlechaDerechaPequena-icon.svg"));
    }

    ngOnInit(): void {
        this.crearModales();
        this.modelFechaRecibido.setHours(0, 0, 0, 0);
        this.modelFechaOrden.setHours(0, 0, 0, 0);
        this.verificacionGerenteGeneral();

        this._route.queryParams.subscribe((params) => {
            this.ordenCompraSeleccionada = params['idOrden'];
            this.cargarDatosOrdenCompra();
        });
    }

    accionTabla = this.agregarOrdenCompraTranslate.acciones;
    accionCantidad = this.agregarOrdenCompraTranslate.cantidad;
    accionCosto = this.agregarOrdenCompraTranslate.costo;
    accionObservaciones = this.agregarOrdenCompraTranslate.observaciones;
    dropdownProducto = this.agregarOrdenCompraTranslate.producto;
    dataTrue = false;

    modelFechaRecibido: Date = new Date();
    modelFechaOrden: Date = new Date();
    modelFactura: any = null;
    modelObservacionesOrden: any = null;

    totalDebajoGrid: any = 0;
    cantidadDebajoGrid = 0;
    isEdicionEnCurso = false;
    ventanaOrdenNueva = true;
    guardar = false;
    ordenCompraSeleccionada: any = null;
    mensajeErrorFechaOrden: any = null;
    mensajeErrorFechaRecibido: any = null;

    producto: any = {
        idInventarioPresentacion: 0,
        nombreProducto: '',
        cantidad: 0,
        costo: 0,
        costoGrid: 0,
        total: 0,
        totalGrid: 0,
        observaciones: '',
    };

    isGerente: any = 0;
    dataGridAgregarOC: any = [];

    orden: any = {
        sucursalSeleccionada: '',
        proveedorSeleccionado: '',
    };

    dataOrdenCompraDetalle: any = [];
    isGerenteBin: any = null;
    idSucursal: any = null;
    cantidadSucursales: any = null;

    isGerenteCosto: any = null;
    totalDebajoGridCommas: any = 0;
    modelCantidadEdicion: any = 0;
    modelCostoEdicion: any = 0;
    modelObservacionesEdicion: any = 0;

    messageModalProductos: any = '';

    // <-----------------Funciones ------------------------->
    crearModales() {
        if ($('body').find('.confirmacionCancelacion').length > 1) {
            $('body').find('.confirmacionCancelacion')[1].remove();
        }

        this.modales.confirmacionCancelacion = new bootstrap.Modal(
            $('#confirmacionCancelacion').appendTo('body'),
            {
                backdrop: 'static',
                keyboard: false,
            }
        );

        if ($('body').find('.confirmacionProductos').length > 1) {
            $('body').find('.confirmacionProductos')[1].remove();
        }

        this.modales.confirmacionProductos = new bootstrap.Modal(
            $('#confirmacionProductos').appendTo('body'),
            {
                backdrop: 'static',
                keyboard: false,
            }
        );
    }

    // ----------------------------------------------- Infinite Scroll --------------------------------------------------- //
    infiniteScroll: any = {
        numToAdd: 20
    };
    listaDeBusqueda: any = [];
    loading = false;
    bufferSize = 40;
    numberOfItemsFromEndBeforeFetchingMore = 10;

    resetDdl(){
        this.listaDeBusqueda = [];
    }

    buscarEnScroll(id: any, idDDL: any) {
        this.listaDeBusqueda = [];
        var valor = $("#" + idDDL + " input")[0].value;

        if(id == 'RecepcionProductoAgregarProducto' && valor != ""){
            for(var i = 0; i < this.orden.listaProductos.length; i++){
                this.orden.listaProductos[i].nombre.toUpperCase().includes(valor.toUpperCase()) ? this.listaDeBusqueda.push(this.orden.listaProductos[i]) : null;
            }
        }
        
        this.resetInfScroll(id);
    }

    resetInfScroll(id: any) {
        if(id == 'RecepcionProductoAgregarProducto'){
            if(this.listaDeBusqueda.length > 0){
                this.orden.listaProductosBuffer = this.listaDeBusqueda.slice(0, this.infiniteScroll.numToAdd);   
            }
            else{
                this.orden.listaProductosBuffer = this.orden.listaProductos.slice(0, this.infiniteScroll.numToAdd);
            }
        }
    }

    onScroll(id: any, event: any) {
        var dataTotal: any = [];
        var dataBuffer: any = [];
        if(id == 'RecepcionProductoAgregarProducto'){
            if(this.listaDeBusqueda.length > 0){
                dataTotal = this.listaDeBusqueda;
            }
            else{
                dataTotal = this.orden.listaProductos;
            }
            dataBuffer = this.orden.listaProductosBuffer;
        }

        if (this.loading || dataTotal.length <= dataBuffer.length) {
            return;
        }

        if (event.end + this.numberOfItemsFromEndBeforeFetchingMore > dataBuffer.length) {
            if(id == 'RecepcionProductoAgregarProducto'){
                const len = this.orden.listaProductosBuffer.length;
    
                let more: any = [];
                if(this.listaDeBusqueda.length > 0){
                    more = this.listaDeBusqueda.slice(len, this.bufferSize + len);
                }
                else{
                    more = this.orden.listaProductos.slice(len, this.bufferSize + len);
                }
    
                this.orden.listaProductosBuffer = this.orden.listaProductosBuffer.concat(more);
            }
        }
    }

    //MOSTRAR ORDEN COMPRA AL DETALLE//
    cargarDatosOrdenCompraDetalle() {
        for (let i = 0; i < this.dataOrdenCompraDetalle.length; i++) {
            this.producto.cantidad = this.dataOrdenCompraDetalle[i].cantidad;
            this.producto.costo = this.dataOrdenCompraDetalle[i].costo;
            this.producto.total = (
                parseFloat(this.producto.cantidad) * parseFloat(this.producto.costo)
            ).toFixed(2);
            this.producto.idInventarioPresentacion =
                this.dataOrdenCompraDetalle[i].idInventarioPresentacion;

            this.producto.nombreProducto = this.findName(
                this.producto.idInventarioPresentacion
            );

            this.producto.observaciones =
                this.dataOrdenCompraDetalle[i].observaciones1;
            this.producto.costoGrid = '$ ' + this.producto.costo;
            this.producto.totalGrid =
                '$ ' + this.numberWithCommas(this.producto.total);
            this.producto.editar = 0;

            this.totalDebajoGrid = (
                parseFloat(this.totalDebajoGrid) + parseFloat(this.producto.total)
            ).toFixed(2);
            this.totalDebajoGridCommas = this.numberWithCommas(this.totalDebajoGrid);
            this.cantidadDebajoGrid =
                this.cantidadDebajoGrid + parseInt(this.producto.cantidad);

            this.dataGridAgregarOC.push(this.producto);

            this.producto = {};
        }
    }

    cargarDatosOrdenCompra() {
        if (
            this.ordenCompraSeleccionada !== 'N' &&
            this.ordenCompraSeleccionada.charAt(0) !== 'P'
        ) {
            this._pantallaServicio.mostrarSpinner();
            let params: any = {};
            params.idInventarioOrdenCompra = this.ordenCompraSeleccionada;

            this._backService
                .HttpPost('catalogos/OrdenCompra/queryOrdenCompra', {}, params)
                .subscribe(
                    (response) => {
                        this.dataOrdenCompraDetalle = eval(response);
                        this.ventanaOrdenNueva = false;
                        this.orden.sucursalSeleccionada = eval(response)[0].idSucursal;
                        this.cargarProveedor(this.orden.sucursalSeleccionada);
                        this.orden.proveedorSeleccionado =
                            eval(response)[0].idInventarioProveedor;
                        this.modelFactura = eval(response)[0].factura;
                        this.modelFechaOrden = eval(response)[0].fechaOrden;
                        this.modelFechaRecibido = eval(response)[0].fechaRecibo;
                        this.modelObservacionesOrden = eval(response)[0].observaciones;
                        this._pantallaServicio.ocultarSpinner();
                        this.cargarProductos();
                    },
                    (error) => {
                        this._pantallaServicio.ocultarSpinner();
                    }
                );
        }

        if (this.ordenCompraSeleccionada.charAt(0) === 'P') {
            this._pantallaServicio.mostrarSpinner();
            let id = this.ordenCompraSeleccionada.split('P');
            let params: any = {};
            params.idPresentacionPrecargaCompra = id[1];

            this._backService
                .HttpPost('catalogos/OrdenCompra/queryPresentacion', {}, params)
                .subscribe(
                    (response) => {
                        this.orden.sucursalSeleccionada = eval(response)[0].idSucursal;
                        this.cargar();
                        this.orden.proveedorSeleccionado =
                            eval(response)[0].idInventarioProveedor;
                        this.orden.productoSeleccionado =
                            eval(response)[0].idInventarioPresentacion;
                        (document.getElementById('idCosto') as any).value =
                            eval(response)[0].costo;
                        this._pantallaServicio.ocultarSpinner();
                    },
                    (error) => {
                        this._pantallaServicio.ocultarSpinner();
                    }
                );
        } else {
            // this.cargarProductos(); JeoC
            return;
        }
    }
    //////////////////////////////////

    //VALIDACIONES//
    validacionAntesGuardar() {
        let fechaActual = new Date();
        let flag = 0;

        if (
            this.orden.sucursalSeleccionada == '' ||
            this.orden.sucursalSeleccionada == null ||
            this.orden.sucursalSeleccionada == undefined
        ) {
            $('#idSucursalSelect').addClass('errorCampo');
            flag++;
        } else {
            $('#idSucursalSelect').removeClass('errorCampo');
        }

        if (
            this.modelFechaOrden != undefined &&
            this.modelFechaRecibido != undefined
        ) {
            var currentDate = new Date();
            var currentTime = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            let fechaOrden = new Date(this.modelFechaOrden + " " + currentTime);
            let fechaRecibido = new Date(this.modelFechaRecibido + " " + currentTime);
            if (fechaOrden > fechaActual) {
                //La fecha de orden tiene que ser menor a la fecha actual
                this.mensajeErrorFechaOrden =
                    this.agregarOrdenCompraTranslate.fechaOrdenMayorActual;
                $('#idFechaOrden').addClass('errorCampo');
                flag++;
            } else {
                if (fechaOrden > fechaRecibido) {
                    //La fecha de orden tiene que ser menor a la fecha de recibido
                    this.mensajeErrorFechaOrden =
                        this.agregarOrdenCompraTranslate.fechaOrdenMayorRecibido;
                    $('#idFechaOrden').addClass('errorCampo');
                    flag++;
                } else {
                    $('#idFechaOrden').removeClass('errorCampo');
                    this.mensajeErrorFechaOrden = '';
                }
            }

            if (fechaRecibido > fechaActual) {
                //La fecha de recibido tiene que ser menor a la fecha actual
                this.mensajeErrorFechaRecibido =
                    this.agregarOrdenCompraTranslate.fechaRecibidoMayorActual;
                $('#idFechaRecibido').addClass('errorCampo');
                flag++;
            } else {
                $('#idFechaRecibido').removeClass('errorCampo');
                this.mensajeErrorFechaRecibido = '';
            }
        } else {
            if (this.modelFechaOrden == undefined) {
                $('#idFechaOrden').addClass('errorCampo');
                flag++;
            }
            if (this.modelFechaRecibido == undefined) {
                $('#idFechaRecibido').addClass('errorCampo');
                flag++;
            }
        }

        if (flag === 0) {
            return true;
        } else {
            return false;
        }
    }

    guardarOrdenCompra() {
        if (this.guardar === false) {
            this._pantallaServicio.mostrarSpinner();
            $('#idGuardar').addClass('disabled');
            this.guardar = true;
            if (this.validacionAntesGuardar() && this.isEdicionEnCurso === false) {
                if (this.dataGridAgregarOC.length > 0) {
                    let params: any = {};
                    params.idInventarioProveedor = this.orden.proveedorSeleccionado;
                    params.factura = this.modelFactura || '';
                    params.fechaOrden = this.modelFechaOrden;
                    params.fechaRecibo = this.modelFechaRecibido;
                    params.observaciones = this.modelObservacionesOrden || '';
                    params.idSucursal = this.orden.sucursalSeleccionada;
                    params.productos = this.dataGridAgregarOC;

                    this._backService
                        .HttpPost('catalogos/OrdenCompra/insertOrdenCompra', {}, params)
                        .subscribe(
                            (response) => {
                                this._pantallaServicio.ocultarSpinner();
                                this._router.navigate(['/inventario/recepcion-productos']);
                            },
                            (error) => {
                                this._pantallaServicio.ocultarSpinner();
                            }
                        );
                } else {
                    let msg = this.agregarOrdenCompraTranslate.gridVacio;
                    this.alertGridVacio(msg);
                    this.guardar = false;
                    $('#idGuardar').removeClass('disabled');
                    this._pantallaServicio.ocultarSpinner();
                }
            } else {
                this.guardar = false;
                $('#idGuardar').removeClass('disabled');
                this._pantallaServicio.ocultarSpinner();
            }
        }
    }

    txtfocus(id?: any) {
        $(id).removeClass('errorCampo');
    }

    alertGridVacio(message?: any) {
        this.messageModalProductos = message;
        this.modales.confirmacionProductos.show();
    }

    validacionContenido() {
        if (this.dataGridAgregarOC.length > 0) {
            return true;
        }
        if (this.orden.sucursalSeleccionada != '') {
            return true;
        }
        if (this.orden.proveedorSeleccionado != '') {
            return true;
        }
        //if (this.modelFechaOrden != undefined || this.modelFechaRecibido != undefined) { return true; }
        if (this.modelFactura != undefined) {
            if (this.modelFactura == '') {
                return false;
            }
            return true;
        }
        if (this.modelObservacionesOrden != undefined) {
            if (this.modelObservacionesOrden == '') {
                return false;
            }
            return true;
        }
        return false;
    }

    alertReturn() {
        if (this.ordenCompraSeleccionada === 'N') {
            if (this.validacionContenido()) {
                this.modales.confirmacionCancelacion.show();
            } else {
                this.htmlRegresar();
            }
        } else {
            this.htmlRegresar();
        }
    }

    validacionCantidad(value?: any) {
        let x;
        if (isNaN(value) || value <= 0) {
            return false;
        }

        x = parseFloat(value);
        return (x | 0) === x;
    }

    validacionCosto(value?: any) {
        let x;
        if (isNaN(value) || value < 0) {
            return false;
        }

        return value.search(/^\$?[\d]+(\.\d+)?$/) >= 0;
    }

    bloqueo() {
        if (!this.ventanaOrdenNueva || !this.isGerenteBin) {
            return true;
        } else {
            return false;
        }
    }

    verificacionGerenteGeneral() {
        this._pantallaServicio.mostrarSpinner();
        this._backService
            .HttpPost('catalogos/OrdenCompra/validarGerente', {}, {})
            .subscribe(
                (response) => {
                    this._pantallaServicio.ocultarSpinner();
                    if (eval(response)[0] === '1') {
                        this.isGerente = eval(response)[0];
                        this.idSucursal = eval(response)[1];
                        this.cantidadSucursales = eval(response)[2];
                        this.querySucursales();
                        this.isGerenteBin = 1;
                        this.getGerente();
                    } else if (eval(response)[0] === '0') {
                        this.isGerente = eval(response)[0];
                        this.idSucursal = eval(response)[1];
                        this.cantidadSucursales = eval(response)[2];
                        this.cargarProveedor(this.idSucursal);
                        this.querySucursal();
                        this.orden.sucursalSeleccionada = this.idSucursal;
                        this.isGerenteBin = 0;
                        this.getGerente();
                    }
                },
                (error) => {
                    this._pantallaServicio.ocultarSpinner();
                }
            );
    }

    numberWithCommas(x?: any) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    htmlRegresar() {
        this._router.navigate(['/inventario/recepcion-productos']);
    }

    cambioProducto() {
        $('#idProducto').removeClass('errorCampo');
    }
    ////////////////

    //CARGAS DE LISTAS//
    querySucursales() {
        let params: any = {};
        params.isGerenteGeneral = this.isGerente;
        params.idSucursal = this.idSucursal;
        params.cantidadSucursales = this.cantidadSucursales;

        this._backService
            .HttpPost('catalogos/OrdenCompra/querySucursales', {}, params)
            .subscribe(
                (response) => {
                    this.orden.listaSucursales = eval(response);
                },
                (error) => { }
            );
    }

    querySucursal() {
        let params: any = {};
        params.isGerenteGeneral = null;
        params.idSucursal = this.idSucursal;
        params.cantidadSucursales = null;

        this._backService
            .HttpPost('catalogos/ordenCompra/querySucursales', {}, params)
            .subscribe(
                (response) => {
                    this.orden.listaSucursales = eval(response);
                    this.cargar();
                },
                (error) => { }
            );
    }

    getGerente() {
        this._backService
            .HttpPost('catalogos/Producto/getGerente', {}, {})
            .subscribe(
                (response) => {
                    this.isGerenteCosto = response;
                },
                (error) => { }
            );
    }

    cargar() {
        this.cargarProveedor('undefined');
        this.cargarProductos();
    }

    cargarProductos() {
        this._pantallaServicio.mostrarSpinner();
        let params: any = {};
        params.idSucursal = this.orden.sucursalSeleccionada;

        this._backService
            .HttpPost('catalogos/ordenCompra/queryProductos', {}, params)
            .subscribe(
                (response) => {
                    this.orden.listaProductos = eval(response);
                    this.orden.listaProductosBuffer = JSON.parse(JSON.stringify(this.orden.listaProductos));
                    if (!this.ventanaOrdenNueva) {
                        this.cargarDatosOrdenCompraDetalle();
                    }
                    this._pantallaServicio.ocultarSpinner();
                },
                (error) => {
                    this._pantallaServicio.ocultarSpinner();
                }
            );
    }

    cargarProveedor(idSucursal?: any) {
        this._pantallaServicio.mostrarSpinner();
        this.orden.proveedorSeleccionado = '';
        let params: any = {};
        if (idSucursal !== 'undefined') {
            params.idSucursal = idSucursal;
        } else {
            params.idSucursal = this.orden.sucursalSeleccionada;
        }

        this._backService
            .HttpPost('catalogos/OrdenCompra/queryProveedor', {}, params)
            .subscribe(
                (response) => {
                    this.orden.listaProveedores = eval(response);
                },
                (error) => {
                    this._pantallaServicio.ocultarSpinner();
                }
            );
    }

    //ELEMENTOS EN EL MODAL//
    focusUiSelectCliente(val?: any) {
        setTimeout(function () {
            if (val === 2) {
                $('#selectProductos')[0].children[1].children[0].children[0].id =
                    'selectProductsHijo';
                $('#selectProductsHijo').focus();
            }
            if (val === 1) {
                $('#selectProductosEdit')[0].children[1].children[0].children[0].id =
                    'selectProductsEditHijo';
                $('#selectProductsEditHijo').focus();
            }
        }, 10);
    }

    findName(id?: any) {
        for (let i = 0; i < this.orden.listaProductos.length; i++) {
            if (this.orden.listaProductos[i].idInventarioPresentacion === id) {
                return this.orden.listaProductos[i].nombre;
            }
        }
    }

    findUm(id?: any) {
        for (var i = 0; i < this.orden.listaProductos.length; i++) {
            if (this.orden.listaProductos[i].idInventarioPresentacion === id) {
                return this.orden.listaProductos[i].unidadMedida;
            }
        }
    }

    agregarElementoOrden() {
        let cantidad = (document.getElementById('idCantidad') as any).value;
        let costo = (document.getElementById('idCosto') as any).value;
        let observaciones = (document.getElementById('idObservaciones') as any)
            .value;
        let idProducto = this.orden.productoSeleccionado;

        if (!this.isGerenteCosto) {
            costo = '0';
        }

        let flag = 0;
        if (this.isEdicionEnCurso) {
            this._toaster.error(this.agregarOrdenCompraTranslate.edicionCurso);
            return;
        }

        if (cantidad === '') {
            $('#idCantidad').addClass('errorCampo');
            flag++;
        } else {
            $('#idCantidad').removeClass('errorCampo');
        }

        if (costo === '' || !this.validacionCosto(costo.replace(/,/g, ''))) {
            $('#idCosto').addClass('errorCampo');
            flag++;
        } else {
            $('#idCosto').removeClass('errorCampo');
        }

        if (idProducto === undefined) {
            $('#idProducto').addClass('errorCampo');
            flag++;
        } else {
            $('#idProducto').removeClass('errorCampo');
        }

        if (observaciones === undefined || observaciones == '') {
            $('#idObservaciones').addClass('errorCampo');
            flag++;
        } else {
            $('#idObservaciones').removeClass('errorCampo');
        }

        if (flag === 0) {
            this.producto.cantidad = cantidad;
            this.producto.costo = costo.replace(/,/g, '');
            this.producto.total = (
                this.producto.costo * this.producto.cantidad
            ).toFixed(2);
            this.producto.idInventarioPresentacion = idProducto;
            this.producto.nombreProducto = this.findName(idProducto);
            this.producto.observaciones = observaciones;
            this.producto.costoGrid = costo;
            this.producto.totalGrid = this.numberWithCommas(this.producto.total);
            this.producto.editar = 0;

            this.totalDebajoGrid = (
                parseFloat(this.totalDebajoGrid) + parseFloat(this.producto.total)
            ).toFixed(2);
            this.totalDebajoGridCommas = this.numberWithCommas(this.totalDebajoGrid);
            this.cantidadDebajoGrid = this.cantidadDebajoGrid + parseInt(cantidad);

            this.dataGridAgregarOC.push(this.producto);

            console.log(this.dataGridAgregarOC);

            this.producto = {};
            (document.getElementById('idCantidad') as any).value = '';
            (document.getElementById('idCosto') as any).value = '';
            (document.getElementById('idObservaciones') as any).value = '';
            this.orden.productoSeleccionado = undefined;
        }
    }

    editarElementoOrden(index?: any) {
        if (this.isEdicionEnCurso === false) {
            this.isEdicionEnCurso = true;
            this.dataGridAgregarOC[index].editar = 1;
            this.orden.productoSeleccionadoEdicion =
                this.dataGridAgregarOC[index].idInventarioPresentacion;
            this.modelCantidadEdicion = this.dataGridAgregarOC[index].cantidad;
            this.modelCostoEdicion = this.dataGridAgregarOC[index].costo;
            this.modelObservacionesEdicion =
                this.dataGridAgregarOC[index].observaciones;
        }
    }

    aceptarEdicionElementoOrden(index?: any) {
        debugger;
        let flag = 0;

        if (
            this.modelCantidadEdicion === '' ||
            !this.validacionCantidad(this.modelCantidadEdicion)
        ) {
            $('#idCantidadEdicion').addClass('errorCampo');
            flag++;
        } else {
            $('#idCantidadEdicion').removeClass('errorCampo');
        }

        if (
            this.modelCostoEdicion === '' ||
            !this.validacionCosto(this.modelCostoEdicion.toString())
        ) {
            $('#idCostoEdicion').addClass('errorCampo');
            flag++;
        } else {
            $('#idCostoEdicion').removeClass('errorCampo');
        }

        if (flag === 0) {
            this.totalDebajoGrid =
                this.totalDebajoGrid - this.dataGridAgregarOC[index].total;
            this.cantidadDebajoGrid =
                this.cantidadDebajoGrid - this.dataGridAgregarOC[index].cantidad;

            this.dataGridAgregarOC[index].editar = 0;
            this.dataGridAgregarOC[index].idInventarioPresentacion =
                this.orden.productoSeleccionadoEdicion;
            this.dataGridAgregarOC[index].cantidad = this.modelCantidadEdicion;
            this.dataGridAgregarOC[index].costo = this.modelCostoEdicion;
            this.dataGridAgregarOC[index].costoGrid = this.modelCostoEdicion;
            this.dataGridAgregarOC[index].total = (
                this.dataGridAgregarOC[index].cantidad *
                this.dataGridAgregarOC[index].costo
            ).toFixed(2);
            this.dataGridAgregarOC[index].totalGrid =
                '$' + this.numberWithCommas(this.dataGridAgregarOC[index].total);
            this.dataGridAgregarOC[index].observaciones =
                this.modelObservacionesEdicion;
            this.dataGridAgregarOC[index].nombreProducto = this.findName(
                this.dataGridAgregarOC[index].idInventarioPresentacion
            );

            this.totalDebajoGrid = (
                parseFloat(this.totalDebajoGrid) +
                parseFloat(this.dataGridAgregarOC[index].total)
            ).toFixed(2);
            this.totalDebajoGridCommas = this.numberWithCommas(this.totalDebajoGrid);
            this.cantidadDebajoGrid =
                this.cantidadDebajoGrid +
                parseInt(this.dataGridAgregarOC[index].cantidad);

            this.isEdicionEnCurso = false;
        }
    }

    quitarElementoOrden(elem?: any, index?: any) {
        this.totalDebajoGrid = (
            parseFloat(this.totalDebajoGrid) - parseFloat(elem.total)
        ).toFixed(2);
        this.totalDebajoGridCommas = this.numberWithCommas(this.totalDebajoGrid);
        this.cantidadDebajoGrid = this.cantidadDebajoGrid - elem.cantidad;
        this.dataGridAgregarOC.splice(index, 1);
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
}
