import { Component, ElementRef, OnInit, ViewChild, ViewChildren, QueryList } from '@angular/core';
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
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
declare const InstallTrigger: any;

@Component({
  selector: 'app-receta',
  templateUrl: './receta.component.html',
  styleUrls: ['./receta.component.scss', '../../../page.component.scss']
})

export class RecetaComponent implements OnInit {
    //Variables de Translate
    recetaMedicaTranslate: any = {};
    agendaTranslate: any = {};
    sessionTraslate: any = {};

    // Modales
    modales: any = {};

    // Mat autocomplete
    // @ViewChild(CdkVirtualScrollViewport) virtualScroll: CdkVirtualScrollViewport;
    @ViewChildren(CdkVirtualScrollViewport) virtualScroll: QueryList<CdkVirtualScrollViewport>;
    @ViewChild(MatAutocompleteTrigger) autocompleteTrigger: MatAutocompleteTrigger;
    @ViewChild('autoListClientesInput') autoListClientesInput: ElementRef;
    
    constructor(private _translate: TranslateService, private _backService: MethodsService, public _pantallaServicio: PantallaService, private _dialog: MatDialog, private _router: Router, private _toaster: ToasterService, private _route: ActivatedRoute, private matIconRegistry: MatIconRegistry, private domSanitizer: DomSanitizer, public _ticketService: TicketService) {
            this._translate.setDefaultLang(this._pantallaServicio.idioma);
            this._translate.use(this._pantallaServicio.idioma);
            
            this._translate.get('agendaTranslate').subscribe((translated) => {             
                this.recetaMedicaTranslate = this._translate.instant('recetaMedicaTranslate');
                this.agendaTranslate = this._translate.instant('agendaTranslate');
                this.sessionTraslate = this._translate.instant('sessionTraslate');
            });

            this.matIconRegistry.addSvgIcon('iconCasa1', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Casa1-icon.svg"));
            this.matIconRegistry.addSvgIcon('iconFlecha1DerechaPeque', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/FlechaDerechaPequena-icon.svg"));
            this.matIconRegistry.addSvgIcon('iconBasura', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Basura-icon.svg"));
            this.matIconRegistry.addSvgIcon('iconCorreo', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Correo-icon.svg"));
            this.matIconRegistry.addSvgIcon('iconImprimir', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Imprimir-icon.svg"));
            this.matIconRegistry.addSvgIcon('iconExcel', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Excel-icon.svg"));
    }    

  	ngOnInit(): void {
		this._route.queryParams.subscribe(params => {
			this.idCitaSeleccionada = params["idCita"];
			this.idServicioSeleccionado = params["idServicio"];
			this.idClienteSeleccionado = params["idCliente"];

            this.iniciarPantalla();
            this.crearModales();
		});
    }

    // --------------------------------------------------------------------------------------------------- //
    // --------------------------------------- CREACIÓN DE MODALES --------------------------------------- //
    crearModales() {
        if ($('body').find('.modal-confirm').length > 1) {
            $('body').find('.modal-confirm')[1].remove();
        }
        this.modales.modalConfirm = new bootstrap.Modal($("#modal-confirm").appendTo("body"), {
            backdrop: "static", 
            keyboard: false,
        });

        if ($('body').find('.modal-guardar').length > 1) {
            $('body').find('.modal-guardar')[1].remove();
        }
        this.modales.modalGuardar = new bootstrap.Modal($("#modal-guardar").appendTo("body"), {
            backdrop: "static", 
            keyboard: false,
        });

        if ($('body').find('.modal-descartar').length > 1) {
            $('body').find('.modal-descartar')[1].remove();
        }
        this.modales.modalDescartar = new bootstrap.Modal($("#modal-descartar").appendTo("body"), {
            backdrop: "static", 
            keyboard: false,
        });
    }

    // --------------------------------------------------------------------------------------------------- //
    // ------------------------------------- DECLARACIÓN DE VARIABLES ------------------------------------ //
    displayedColumns: any [] = ['Producto', "Indicaciones"];
    idCitaSeleccionada: any;
    idServicioSeleccionado: any;
    idClienteSeleccionado: any;
    receta: any = {
        select: '',
        selectNueva: '',
        descripcion: '',
        descripcionNueva: '',
        dataProducto: [],
        dataProductoBuffer: [],
        dataProductoGrid: [],
        productos: [],
        descripciones: [],
        dataProductoFiltro: [],
        nombreCliente: '',
        fechaNacimiento: '',
        nombreAtendido: '',
        cedulaProfesional: '',
        email: '',
        producto: [],
        ErrorProd: false,
        ErrorDesc: false,
        ErrorProdNew: false,
        ErrorDescNew: false,
        bandGuardar: false,
        bandEditar: false,
        bandAgregar: false,
        fechaValida: false,
        guardar: false,
        bandRecetaExistente: false,
        imprimir: false,
        imp: false
    };
    anterior = -1;
    eventInfo = false;
    recargarPagina = false;
    camposVacios: any;
    camposIncorrectos: any;
    altura: any;
    d: any;
    row: any;
    direccion: any;
    nArchivoData: any;
    _printIframe: any;
    deshabilitarProducto2 = false;
    deshabilitarDescripcion2 = false;
    dataExportar: any;
    rowSeleccionadaEliminar: any;
    gridProducto = {
        columnDefs: [
            { name: 'Producto',  header: 'Producto'}, 
            { name: 'Indicaciones',  header: 'Indicaciones'}
        ]
    };


    // --------------------------------------------------------------------------------------------------- //
    // ------------------------------------- DECLARACIÓN DE FUNCIONES ------------------------------------ //
    // ----------------------------------------- Infinite Scroll ----------------------------------------- //
    infiniteScroll: any = {
        numToAdd: 20
    };
    listaDeBusqueda: any = [];
    loading = false;
    bufferSize = 40;
    numberOfItemsFromEndBeforeFetchingMore = 10;
    idProducto: any;

    resetDdl(){
        this.listaDeBusqueda = [];
    }

    buscarEnScroll(id: any) {
        this.listaDeBusqueda = [];
        if(id == 'RecetaBuscadorProducto'){
            var valor = this.receta.select;
        }

        if(id == 'RecetaBuscadorProducto2'){
            var valor = this.receta.selectNueva;
        }

        if(id == 'RecetaBuscadorProducto' && valor != ""){
            for(var i = 0; i < this.receta.dataProducto.length; i++){
                this.receta.dataProducto[i].nombre.toUpperCase().includes(valor.toUpperCase()) ? this.listaDeBusqueda.push(this.receta.dataProducto[i]) : null;
            }
        }

        if(id == 'RecetaBuscadorProducto2' && valor != ""){
            for(var i = 0; i < this.receta.dataProducto.length; i++){
                this.receta.dataProducto[i].nombre.toUpperCase().includes(valor.toUpperCase()) ? this.listaDeBusqueda.push(this.receta.dataProducto[i]) : null;
            }
        }
        
        this.resetInfScroll(id);
    }

    resetInfScroll(id: any) {
        if(id == 'RecetaBuscadorProducto'){
            if(this.listaDeBusqueda.length > 0){
                this.receta.dataProductoBuffer = this.listaDeBusqueda.slice(0, this.infiniteScroll.numToAdd);   
            }
            else{
                this.receta.dataProductoBuffer = this.receta.dataProducto.slice(0, this.infiniteScroll.numToAdd);
            }
        }

        if(id == 'RecetaBuscadorProducto2'){
            if(this.listaDeBusqueda.length > 0){
                this.receta.dataProductoBuffer = this.listaDeBusqueda.slice(0, this.infiniteScroll.numToAdd);   
            }
            else{
                this.receta.dataProductoBuffer = this.receta.dataProducto.slice(0, this.infiniteScroll.numToAdd);
            }
        }
    }

    onScroll(id: any, event: any, i: any) {
        // var dataTotal: any = [];
        // var dataBuffer: any = [];
        // if(id == 'RecetaBuscadorProducto'){
        //     if(this.listaDeBusqueda.length > 0){
        //         dataTotal = this.listaDeBusqueda;
        //     }
        //     else{
        //         dataTotal = this.receta.dataProducto;
        //     }
        //     dataBuffer = this.receta.dataProductoBuffer;
        // }

        // if(id == 'RecetaBuscadorProducto2'){
        //     if(this.listaDeBusqueda.length > 0){
        //         dataTotal = this.listaDeBusqueda;
        //     }
        //     else{
        //         dataTotal = this.receta.dataProducto;
        //     }
        //     dataBuffer = this.receta.dataProductoBuffer;
        // }

        // if (this.loading || dataTotal.length <= dataBuffer.length) {
        //     return;
        // }

        var virtScroll: any = this.virtualScroll;
        for(var j = 0; j < virtScroll._results.length; j++){
            if(virtScroll._results[j].elementRef.nativeElement.id == (id + "-" + i)){
                if (virtScroll._results[j].getRenderedRange().end == this.receta.dataProductoBuffer.length && this.autocompleteTrigger.panelOpen) {
                    if(id == 'RecetaBuscadorProducto'){
                        const len = this.receta.dataProductoBuffer.length;
            
                        let more: any = [];
                        if(this.listaDeBusqueda.length > 0){
                            more = this.listaDeBusqueda.slice(len, this.bufferSize + len);
                        }
                        else{
                            more = this.receta.dataProducto.slice(len, this.bufferSize + len);
                        }
            
                        this.receta.dataProductoBuffer = this.receta.dataProductoBuffer.concat(more);
                    }
        
                    if(id == 'RecetaBuscadorProducto2'){
                        const len = this.receta.dataProductoBuffer.length;
            
                        let more: any = [];
                        if(this.listaDeBusqueda.length > 0){
                            more = this.listaDeBusqueda.slice(len, this.bufferSize + len);
                        }
                        else{
                            more = this.receta.dataProducto.slice(len, this.bufferSize + len);
                        }
            
                        this.receta.dataProductoBuffer = this.receta.dataProductoBuffer.concat(more);
                    }
                }
            }
        }
    }

    //Funciones para obtener el nombre y el idInventarioPresentacion del producto seleccionado
    getOnlyName(objeto: any) {
        var nombre;

        if(objeto.idInventarioPresentacion != undefined){
            this.receta.dataProducto.forEach((element: { idInventarioPresentacion: any; nombre: any; }) => {
                if(element.idInventarioPresentacion == objeto.idInventarioPresentacion){
                    nombre = element.nombre
                }
            });

            return nombre;
        } else if(objeto.idInventarioPresentacion === null){
            nombre = objeto.nombre;

            return nombre;
        } else {
            nombre = objeto;

            return nombre;
        }
    };

    getOnlyId(objeto: any) {
        var idInventarioPresentacion;

        if(objeto.idInventarioPresentacion != undefined){
            this.receta.dataProducto.forEach((element: { idInventarioPresentacion: any; nombre: any; }) => {
                if(element.idInventarioPresentacion == objeto.idInventarioPresentacion){
                    idInventarioPresentacion = element.idInventarioPresentacion
                }
            });

            return idInventarioPresentacion;
        } else {
            idInventarioPresentacion = null;

            return idInventarioPresentacion;
        }
    };

    //Funciones para editar la fila a la que se le de un clic
    rowClick(row: any, indexOfRow: any) {
        var index = indexOfRow;
        var itemsEditables = this.receta.dataProductoGrid.filter((obj: any) => {
            if(obj.editable == 1){
                return obj;
            }
        });
        if (itemsEditables.length == 0) {
            this.receta.descripcion = this.receta.dataProductoGrid[index].Indicaciones;
            this.receta.select = {idInventarioPresentacion: this.receta.dataProductoGrid[index].idInventarioPresentacion, nombre: this.receta.dataProductoGrid[index].Producto};
            this.anterior = index;
        } else {
            this.receta.dataProductoGrid[this.anterior].Indicaciones = this.receta.descripcion;
            this.receta.dataProductoGrid[this.anterior].Producto = this.getOnlyName(this.receta.select);
            this.receta.dataProductoGrid[this.anterior].idInventarioPresentacion = this.getOnlyId(this.receta.select);

            this.receta.descripcion = this.receta.dataProductoGrid[index].Indicaciones;
            this.receta.select = this.receta.dataProductoGrid[index];
            this.anterior = index;
        }
        for (var i = 0; i < itemsEditables.length; i++) {
            var ii = this.receta.dataProductoGrid.indexOf(itemsEditables[i]);
            this.receta.dataProductoGrid[ii].editable = 0;
        }
        this.receta.dataProductoGrid[index].editable = 1;
        this.deshabilitarProducto2 = true;
        this.deshabilitarDescripcion2 = true;
    };

    clickCero(row: any, indexOfRow: any) {
        if (this.receta.selectNueva == "" && this.receta.descripcionNueva == "") {
            if (!this.receta.bandEditar) {
                this.rowClick(row, indexOfRow);
                this.receta.bandEditar = true;
            }
        }
    }

    //Funcion para agregar una nueva fila de datos, siempre que le den clic a la primera fila de la lupita
    rowRemoveClick() {
        if (this.anterior != -1) {
            var itemsEditables = this.receta.dataProductoGrid.filter((obj: any) => {
                if(obj.editable == 1){
                    return obj;
                }
            });
            this.receta.dataProductoGrid[this.anterior].Indicaciones = this.receta.descripcion;
            this.receta.dataProductoGrid[this.anterior].Producto = this.getOnlyName(this.receta.select);
            this.receta.dataProductoGrid[this.anterior].idInventarioPresentacion = this.getOnlyId(this.receta.select);
            for (var i = 0; i < itemsEditables.length; i++) {
                var ii = this.receta.dataProductoGrid.indexOf(itemsEditables[i]);
                this.receta.dataProductoGrid[ii].editable = 0;
            }
            this.anterior = -1;
            this.deshabilitarProducto2 = false;
            this.deshabilitarDescripcion2 = false;
        }
    };

    //Funciones para validar los datos introducidos, tanto los campos personales como los del grid
    validarFecha() {
        if (this.receta.fechaNacimiento) {
            this.receta.fechaValida = true;
        }
        else {
            if (this.receta.fechaNacimiento == "" || this.receta.fechaNacimiento === null) {
                this.receta.fechaValida = true;
            }
            else {
                this.receta.fechaValida = false;
            }
        }
    }
    
    validarCampos() {
        var valExp = RegExp("^[a-zA-Z áéíóúñÁÉÍÓÚÑüÜ\s\r\n]*$");
        var numerosExp = new RegExp("^([0-9])*$");
        this.camposVacios = 0;
        this.camposIncorrectos = 0;
        this.receta.guardar = true;
        this.validarFecha();

        if (this.receta.nombreCliente == "") {
            $("#nomPaciente").addClass("errorCampo");
            $('#errornomPaciente').text("");
            this.camposVacios++;
        } else {
            if (!valExp.test(this.receta.nombreCliente)) {
                $("#nomPaciente").addClass("errorCampo");
                $('#errornomPaciente').text(this.recetaMedicaTranslate.errornomPaciente);
                this.camposIncorrectos++;
            }
            else {
                $("#nomPaciente").removeClass("errorCampo");
                $('#errornomPaciente').text("");
            }
        }

        if (this.receta.fechaNacimiento == "" || this.receta.fechaNacimiento === null) {
            $("#idFecha").addClass("errorCampo");
            $('#erroridFecha').text("");
            this.camposVacios++;
        }
        else {                        
            $("#idFecha").removeClass("errorCampo");
            $('#erroridFecha').text("");
        }

        if (this.receta.nombreAtendido == "") {
            $("#nomAtendido").addClass("errorCampo");
            $('#errornomAtendido').text("");
            this.camposVacios++;
        } else {
            if (!valExp.test(this.receta.nombreAtendido)) {
                $("#nomAtendido").addClass("errorCampo");
                $('#errornomAtendido').text(this.recetaMedicaTranslate.errornomAtendido);
                this.camposIncorrectos++;
            }
            else {
                $("#nomAtendido").removeClass("errorCampo");
                $('#errornomAtendido').text("");
            }
        }
        if (this.receta.cedulaProfesional !== "" && this.receta.cedulaProfesional !== null) {
            if (!numerosExp.test(this.receta.cedulaProfesional)) {
                $("#cedulaProfesional").addClass("errorCampo");
                $('#errorcedulaProfesional').text(this.recetaMedicaTranslate.errorcedulaProfesional);
                this.camposIncorrectos++;
            }
            else {
                $("#cedulaProfesional").removeClass("errorCampo");
                $('#errorcedulaProfesional').text("");
            }
        }
        if (this.camposIncorrectos == 0 && this.camposVacios == 0) {
            return true;
        } else {
            return false;
        }
    }

    validarGrid() {
        if (!this.receta.bandEditar) {                
            if (this.receta.descripcionNueva != "" || this.receta.selectNueva != "") {
                $("#descripcion2").removeClass("errorCampo");
                $("#producto2 ").removeClass("errorCampo");
                return true;
            }
            else {
                if (this.receta.dataProductoGrid.length == 1) {
                    $("#descripcion2").addClass("errorCampo");
                    $("#producto2 ").addClass("errorCampo");
                    return false;
                }
                return true;
            }
            
        } else {
            if(this.receta.select.idInventarioPresentacion === undefined){
                if (this.receta.descripcion != "" || this.receta.select != "") {
                    $("#descripcion1").removeClass("errorCampo");
                    $("#producto1").removeClass("errorCampo");
                    return true;
                }
                else {
                    $("#descripcion1").addClass("errorCampo");
                    $("#producto1").addClass("errorCampo");
                    return false;
                }
            }
            if(this.receta.select.idInventarioPresentacion === null){
                if (this.receta.descripcion != "" || this.receta.select.nombre != "") {
                    $("#descripcion1").removeClass("errorCampo");
                    $("#producto1").removeClass("errorCampo");
                    return true;
                }
                else {
                    $("#descripcion1").addClass("errorCampo");
                    $("#producto1").addClass("errorCampo");
                    return false;
                }
            }else{
                if (this.receta.descripcion != "" || this.receta.select.idInventarioPresentacion != "" || this.receta.select.nombre != "") {
                    $("#descripcion1").removeClass("errorCampo");
                    $("#producto1").removeClass("errorCampo");
                    return true;
                }
                else {
                    $("#descripcion1").addClass("errorCampo");
                    $("#producto1").addClass("errorCampo");
                    return false;
            }
            }
        }
    };

    txtfocus(ob: any, evento: any, tipo: any, grid: any) {
        if (grid) {
            if (tipo == 'f') {
                if (this.receta.guardar) {
                        $("#descripcion2").removeClass("errorCampo");
                        $("#producto2 ").removeClass("errorCampo");
                        $("#descripcion1").removeClass("errorCampo");
                        $("#producto1").removeClass("errorCampo");
                }
            } else {
                if (this.receta.guardar) {
                    if (!this.receta.bandEditar) {
                        if (this.receta.descripcionNueva != "" || this.receta.selectNueva != "") {
                            $("#descripcion2").removeClass("errorCampo");
                            $("#producto2 ").removeClass("errorCampo");
                        } else {
                            if (this.receta.dataProductoGrid.length == 1) {
                                $("#descripcion2").addClass("errorCampo");
                                $("#producto2 ").addClass("errorCampo");
                            }
                        }
                    } else {
                        if (this.receta.descripcion != "" || this.receta.select != "") {
                            $("#descripcion1").removeClass("errorCampo");
                            $("#producto1").removeClass("errorCampo");
                        } else {
                            $("#descripcion1").addClass("errorCampo");
                            $("#producto1").addClass("errorCampo");
                        }
                    }
                }
            }
        } else {
            if (tipo == 'f') {
                if (this.receta.guardar) {
                    let ebi_targetId: any = document.getElementById(evento.target.id);
                    let ebi_errorTargetId: any = document.getElementById('error' + evento.target.id);
                    var txt = ebi_targetId.value;
                    var error = ebi_errorTargetId.innerHTML;
                    if (error == '' || error == undefined) {
                        $("#" + evento.target.id).removeClass("errorCampo");
                    }
                }
            } else {
                if (this.receta.guardar) {
                    let ebi_targetId: any = document.getElementById(evento.target.id);
                    var txt = ebi_targetId.value;
                    if (txt == "" || txt == undefined) {
                        if (ob == 1) {
                            $("#" + evento.target.id).addClass("errorCampo");
                        }
                    } else {
                        let ebi_errorTargetId: any = document.getElementById('error' + evento.target.id);
                        var error = ebi_errorTargetId.innerHTML;
                        if (error == '' || error == undefined) {
                            $("#" + evento.target.id).removeClass("errorCampo");
                        }
                    }
                }
            }
        }
    };            

    //Funcion para agregar una nueva fila de datos al grid
    addRegistro() {
        this.receta.bandAgregar = false;
        if (!this.receta.bandEditar) {                        
            if (this.validarGrid()) {
                var producto: any = {}
                producto.idInventarioPresentacion = this.getOnlyId(this.receta.selectNueva);
                producto.Producto = this.getOnlyName(this.receta.selectNueva);
                producto.Indicaciones = this.receta.descripcionNueva;
                producto.editable = 0;
                this.receta.dataProductoGrid.splice(this.receta.dataProductoGrid.length - 1, 0, producto);
                this.altura = (this.receta.dataProductoGrid.length * 60) + 32;
                this.receta.selectNueva = "";
                this.receta.descripcionNueva = "";
                this.receta.bandGuardar = false;
                $("#descripcion2").removeClass("errorCampo");
                $("#producto2 ").removeClass("errorCampo");
            }                        
        } else {
            if (this.validarGrid()) {
                this.rowRemoveClick();
                this.receta.bandEditar = false;
            }
        }
    };

    addRegAux(e: any){ //BORRAR
        e;
    }
            
    //Funcion para eliminar una fila de datos al grid
    removeRegistro() {
        var index = this.rowSeleccionadaEliminar;
        this.receta.dataProductoGrid.splice(index, 1);
        this.altura = (this.receta.dataProductoGrid.length * 60) + 32;
        this.deshabilitarProducto2 = false;
        this.deshabilitarDescripcion2 = false;
        this.receta.bandEditar = false;
        this.modales.modalConfirm.hide();
    };

    //Funciones para cargar la pantalla de Receta
    cargarProductos() {
        this._backService.HttpPost("catalogos/receta/cargarProductos", {}, {}).subscribe((response: string) => {
            this.receta.dataProducto = eval(response);
            this.receta.dataProductoBuffer = eval(response);
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
    };

    iniciarPantalla() {
        this.cargarProductos();
        this.receta.dataProductoGrid = [];
        this.receta.idReceta = "";
        var params: any = {};
        params.idCita = this.idCitaSeleccionada;
        params.idServicio = this.idServicioSeleccionado;

        this._backService.HttpPost("catalogos/receta/getReceta", {}, params).subscribe((response: string) => {
            this.receta.datosReceta = eval(response);
            this.receta.idReceta = this.receta.datosReceta[0].idReceta;
            this.receta.nombreCliente = this.receta.datosReceta[0].paciente;
            this.d = new Date(this.receta.datosReceta[0].fechaNacimiento);
            this.d.setMinutes(this.d.getMinutes() + this.d.getTimezoneOffset());
            this.receta.fechaNacimiento = format(new Date (this.d), 'yyyy-MM-dd');
            this.receta.nombreAtendido = this.receta.datosReceta[0].atendidoPor;
            this.receta.cedulaProfesional = this.receta.datosReceta[0].cedula;
            this.receta.email = this.receta.datosReceta[0].email;
            if (this.receta.datosReceta.length == 1) {
                this.receta.bandRecetaExistente = false;
                this.receta.dataProductoGrid.push({ idInventarioPresentacion: -1, Producto: '', Indicaciones: '', editable: 2 });
                this.altura = (this.receta.dataProductoGrid.length * 60) + 32;
            } else {
                this.recargarPagina = true;
                this.receta.bandRecetaExistente = true;
                for (var i = 1; i < this.receta.datosReceta.length; i++) {
                    let idInventarioPresentacion = null;
                    this.receta.dataProducto.forEach((element: { nombre: any; idInventarioPresentacion: number; }) => {
                        if(this.receta.datosReceta[i].medicamento == element.nombre){
                            idInventarioPresentacion = element.idInventarioPresentacion;
                        }
                    });
                    this.receta.dataProductoGrid.push({ idInventarioPresentacion: idInventarioPresentacion, Producto: this.receta.datosReceta[i].medicamento, Indicaciones: this.receta.datosReceta[i].tratamiento, editable: 0 });
                }
                this.receta.dataProductoGrid.push({ idInventarioPresentacion: -1, Producto: '', Indicaciones: '', editable: 2 });
                this.altura = (this.receta.dataProductoGrid.length * 60) + 32;
            }
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
    };
    
    limpiarErrorMsg() {
        $("#cedulaProfesional").removeClass("errorCampo");
        $('#errorcedulaProfesional').text("");
        $("#idFecha").removeClass("errorCampo");
        $('#erroridFecha').text("");
        $("#nomPaciente").removeClass("errorCampo");
        $('#errornomPaciente').text("");
        $("#nomAtendido").removeClass("errorCampo");
        $('#errornomAtendido').text("");
        $("#producto2 ").removeClass("errorCampo");
        $("#descripcion2").removeClass("errorCampo");
    };

    //Funciones para guardar la receta
    guardarReceta() {
        $("#botonGuardar").addClass("disabled");
        this.limpiarErrorMsg();
        this.receta.bandAgregar = true;
        if (!this.receta.bandEditar) {
            if (this.validarGrid()) {
                if (this.receta.descripcionNueva != "" || this.receta.selectNueva != "") {
                    var producto: any = {};
                    producto.idInventarioPresentacion = this.getOnlyId(this.receta.selectNueva);
                    producto.Producto = this.getOnlyName(this.receta.selectNueva);
                    producto.Indicaciones = this.receta.descripcionNueva;
                    producto.editable = 0;
                    this.receta.dataProductoGrid.splice(this.receta.dataProductoGrid.length - 1, 0, producto);
                    this.altura = (this.receta.dataProductoGrid.length * 60) + 32;
                    this.receta.selectNueva = "";
                    this.receta.descripcionNueva = "";
                    this.receta.bandGuardar = false;
                    if (this.validarCampos()) {
                        this.guardarDatos();
                        $("#cedulaProfesional").removeClass("errorCampo");
                        $("#idFecha").removeClass("errorCampo");
                        $("#nomPaciente").removeClass("errorCampo");
                        $("#nomAtendido").removeClass("errorCampo");
                        $("#producto2 ").removeClass("errorCampo");
                        $("#descripcion2").removeClass("errorCampo");
                    }
                } else {
                    if (this.validarCampos()) {
                        this.guardarDatos();
                        $("#cedulaProfesional").removeClass("errorCampo");
                        $("#idFecha").removeClass("errorCampo");
                        $("#nomPaciente").removeClass("errorCampo");
                        $("#nomAtendido").removeClass("errorCampo");
                        $("#producto2 ").removeClass("errorCampo");
                        $("#descripcion2").removeClass("errorCampo");
                    }
                }
            } else {
                this.validarCampos();
            }
        } else {
            if (this.validarGrid() && this.validarCampos()) {
                this.rowRemoveClick();
                this.receta.bandEditar = false;
                this.guardarDatos();
                $("#cedulaProfesional").removeClass("errorCampo");
                $("#idFecha").removeClass("errorCampo");
                $("#nomPaciente").removeClass("errorCampo");
                $("#nomAtendido").removeClass("errorCampo");
                $("#producto2 ").removeClass("errorCampo");
                $("#descripcion2").removeClass("errorCampo");
            }
        }
        $("#botonGuardar").removeClass("disabled");
    }

    //Aqui llega con los datos ya correctos y listos para ingresarse a BD
    guardarDatos() {
        var params: any = {};
        var dataGrid = JSON.parse(JSON.stringify(this.receta.dataProductoGrid));
        dataGrid.pop();                
        params.paciente = this.receta.nombreCliente;
        params.fechaNacimiento = this.receta.fechaNacimiento;
        params.atendidoPor = this.receta.nombreAtendido;
        params.cedula = this.receta.cedulaProfesional;
        params.idInventarioPresentacion = [];
        params.Producto = [];
        params.Descripcion = [];
        for (var i = 0; i < dataGrid.length; i++) {
            params.idInventarioPresentacion[i] = dataGrid[i].idInventarioPresentacion;
            params.Producto[i] = dataGrid[i].Producto;
            params.Descripcion[i] = dataGrid[i].Indicaciones;
        }
        if (this.receta.bandRecetaExistente) {
            params.idReceta = this.receta.idReceta;

            this._backService.HttpPost("catalogos/receta/editarReceta", {}, params).subscribe((response: string) => {
                $("#botonGuardar").removeClass("disabled");
                this.receta.bandRecetaExistente = true;
                if (!this.receta.imprimir) {
                    this.modales.modalGuardar.show();
                    $("#modal-guardar .modal-body").html('<span class="title">' + this.recetaMedicaTranslate.msgRecetaGuardar + '</span>');
                } else {
                    this.imprimir();
                }
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
        } else {
            params.idCita = this.idCitaSeleccionada;

            this._backService.HttpPost("catalogos/receta/guardarReceta", {}, params).subscribe((response: string) => {
                $("#botonGuardar").removeClass("disabled");
                this.receta.bandRecetaExistente = true;
                this.modales.modalGuardar.show();
                $("#modal-guardar .modal-body").html('<span class="title">' + this.recetaMedicaTranslate.msgRecetaGuardar + '</span>');
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
    }

    //Funciones para modales
    confirEliminar(row: any, index: any) {
        this.row = row;
        this.rowSeleccionadaEliminar = index;
        this.modales.modalConfirm.show();
        $("#modal-confirm .modal-body").html('<span class="title">' + this.recetaMedicaTranslate.msgConfirmBorrar + '</span>');
    };

    //Funcion para descartar los campos agregador en la pantalla
    descartarCambios(direccion: any) {
        if (!this.receta.bandRecetaExistente) {
            this.modales.modalDescartar.show();
            $("#modal-descartar .modal-body").html('<span class="title">' + this.recetaMedicaTranslate.msgConfirmDescartar + '</span>');
            this.direccion = direccion;
        } else {
            if (direccion === "agenda") {
                this._router.navigate(['procesos/' + direccion]);
            }
            if (direccion === "consultaCliente") {
                this._router.navigate(['catalogos/cliente-creacion-edicion'], {queryParams: { idEtiqueta: 'N' }});
            }
            if (direccion === "cliente") {
                this._router.navigate(['catalogos/cliente-creacion-edicion/'], {queryParams: { idCliente: this.idClienteSeleccionado }});
            }
        }
    }

    recargar() {
        this.modales.modalGuardar.hide();
        if (!this.recargarPagina) {
            window.location.reload();
        }
    }

    //Funcion para limpiar los campos de la pantalla Receta
    vaciarCampos() {
        this.receta.select = '';
        this.receta.selectNueva = '';
        this.receta.descripcion = '';
        this.receta.descripcionNueva = '';
        this.receta.dataProducto = [];
        this.receta.dataProductoGrid = [];
        this.receta.productos = [];
        this.receta.descripciones = [];
        this.anterior = -1;
        this.eventInfo = false;
        this.receta.nombreCliente = '';
        this.receta.fechaNacimiento = '';
        this.receta.nombreAtendido = '';
        this.receta.cedulaProfesional = '';
        this.receta.producto = [];
        this.receta.ErrorProd = false;
        this.receta.ErrorDesc = false;
        this.receta.ErrorProdNew = false;
        this.receta.ErrorDescNew = false;
        this.receta.bandGuardar = false;
        this.receta.bandEditar = false;
        this.receta.bandAgregar = false;
        this.receta.fechaValida = false;
        this.receta.guardar = false;
        this.modales.modalDescartar.hide();
        if (this.direccion === "agenda") {
            this._router.navigate(['procesos/agenda']);
        }
        if (this.direccion === "consultaCliente") {
            this._router.navigate(['catalogos/cliente-creacion-edicion'], {queryParams: { idEtiqueta: 'N' }});
        }
        if (this.direccion === "cliente") {
            this._router.navigate(['catalogos/cliente-creacion-edicion'], {queryParams: { idCliente: this.idClienteSeleccionado }});
        }
    }
    
    /********************************* IMPRIMIR LA RECETA, CON LA PLANTILLA **********************************/
    imprimir() {
        var d = new Date();
        var params: any = {};
        params.idCita = this.idCitaSeleccionada;
        params.diaActual = d.getDate();
        params.mesActual = this.obtenerMes(d.getMonth());
        params.añoActual = d.getFullYear();
        this._pantallaServicio.mostrarSpinner();

        this._backService.HttpPost("catalogos/receta/getRecetaCompleta", {}, params, "text").subscribe((response: string) => {
            this.nArchivoData = response;
            if (!response) {
                this.receta.imprimir = false;
                this.modales.modalGuardar.show();
                $("#modal-guardar .modal-body").html('<span class="title">' + this.recetaMedicaTranslate.msgSinPlantilla + '</span>');
            } else {
                // var isFirefox = typeof InstallTrigger !== 'undefined';
                // if (isFirefox) {
                //     var window: any = window.open('handlers/handlerFileRequest.ashx?idRecetaPdf=' + response);
                //     this.receta.imprimir = false;
                // } else {
                //     var direccion = "../../../../bookipp/archivos/recetaArchivos/" + response;
                //     this.printPdf(direccion); //SI EN CHROME, NO FUNCIONA EN FIREFOX
                // }
                window.open(environment.URL + 'handler?idRecetaPdf=' + response);
                this.receta.imprimir = false;
            }

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

    printPdf(url: any) {
        var iframe: any = undefined;
        this._printIframe = undefined;
        iframe = this._printIframe;
        if (!this._printIframe) {
            iframe = this._printIframe = document.createElement('iframe');
            document.body.appendChild(iframe);

            iframe.style.display = 'none';
            iframe.onload(() => {
                setTimeout(() =>{
                    iframe.focus();
                    iframe.contentWindow.print();
                    setTimeout(() => {
                        if (this.nArchivoData != "false") {
                            var params: any = {};
                            params.nombreArchivo = this.nArchivoData;

                            this._backService.HttpPost("catalogos/receta/borrarReceta", {}, params).subscribe((response: string) => {
                                this.receta.imprimir = false;
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
                    }, 500);
                }, 1);
            });
        }

        iframe.src = url;
    }

    obtenerMes(fecha: any) {
        var mes = "";
        switch (fecha) {
            case 0:
                mes = "Enero";
                break;
            case 1:
                mes = "Febrero";
                break;
            case 2:
                mes = "Marzo";
                break;
            case 3:
                mes = "Abril";
                break;
            case 4:
                mes = "Mayo";
                break;
            case 5:
                mes = "Junio";
                break;
            case 6:
                mes = "Julio";
                break;
            case 7:
                mes = "Agosto";
                break;
            case 8:
                mes = "Septiembre";
                break;
            case 9:
                mes = "Octubre";
                break;
            case 10:
                mes = "Noviembre";
                break;
            case 11:
                mes = "Diciembre";
                break;
        }
        return mes;
    }

    /************************************** EXPORTAR RECETA A EXCEL ******************************************/
    exportToExcelReceta() {
        if (!this.receta.bandRecetaExistente) {
            var dataCopy = JSON.parse(JSON.stringify(this.receta.dataProductoGrid));
            this.formatearGridReporteIngresos(dataCopy);
            this.exportXlsTableView(dataCopy, this.gridProducto.columnDefs, this.recetaMedicaTranslate.receta + " - " + this.receta.nombreCliente);
        } else {
            var dataCopy = JSON.parse(JSON.stringify(this.receta.dataProductoGrid));
            this.formatearGridReporteIngresos(dataCopy);
            this.exportXlsTableView(dataCopy, this.gridProducto.columnDefs, this.recetaMedicaTranslate.receta + " - " + this.receta.nombreCliente);
        }
    };

    formatearGridReporteIngresos(data: any){
        this.dataExportar = [];
        var nombreColumnas = Object.keys(this.receta.dataProducto[0]);

        for (var i = 0; i < data.length; i++) {
            var Objeto: any = {};
            Objeto.Producto = data[i].Producto || " ";
            Objeto.Indicaciones = data[i].Indicaciones || " ";

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

    exportXlsTableView(dataArray: any, columnas: any, nameExcel: any) {
        setTimeout(() => { $("#btnAcciones").trigger("click") },10);
        if (!this.receta.bandRecetaExistente) {
            if (dataArray.length > 0) {
                var dataGridOptionsExportReceta = this.formatJSONData(columnas, dataArray);
                this.drawTable(dataGridOptionsExportReceta, nameExcel);
            } else {
                this.modales.modalGuardar.show();
                $("#modal-guardar .modal-body").html('<span class="title">' + this.recetaMedicaTranslate.msgExportar + '</span>');
            }
        } else {
            var dataGridOptionsExportReceta = this.formatJSONData(columnas, dataArray);
            this.drawTable(dataGridOptionsExportReceta, nameExcel);
        }                
    };

    formatJSONData(columns: any, data: any) {
        var i = 0;
        var lenght = 0;
        var str = "";
        this.receta.headersReceta = [];
        this.receta.dataGridOptionsExportReceta = [];
        columns.forEach((col: any) => {
            var colString = "";
            var element: any = {};
            if (col.name != undefined) {
                element.name = col.name;
                element.displayName = col.name;
                this.receta.headersReceta.push(element);
            }
        });

        data.forEach((evento: any) => {
            var reg = '{';
            var colIndex = 0;
            columns.forEach((col: any) => {
                if (evento[col.name] !== undefined && evento[col.name] !== null) {
                    reg += "\"" + col.name + "\"" + ":" + "\"" + evento[col.name.toString()].toString().split('"').join('\'') + "\",";
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
    drawTable(data: any, nameExcel: any) {
        var table = '<table id="DataTable" cellspacing="0" cellpadding="0"><tr>';
        var headersString = "";
        this.receta.headersReceta.forEach((header: any) => {
            if (header.name != "Acciones") {
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
        let ebi_excelTableReceta : any = document.getElementById("excelTableReceta");
        ebi_excelTableReceta.innerHTML = table;
        var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        var isFirefox = typeof InstallTrigger !== 'undefined';
        if (isSafari) {
            var blob = new Blob([table], { type: "application/vnd.ms-excel" });
            saveAs(blob, nameExcel);
        } else {
            var blob = new Blob(["\ufeff", table]);
            //var blob = new Blob([table], { type: "text/plain;charset=utf-8" });
            saveAs(blob, nameExcel + ".xls");
        }
    };

    /*Crea una fila en la tabla en base a la información correspondiente al json-dataEventoOperadorRow[i]*/
    drawRow(i: any, dataRow: any) {
        var value = '';
        var row = "<tr>";
        if ((i % 2) == 0) {
            this.receta.headersReceta.forEach((elem: any) => {
                if (dataRow[elem.displayName] == undefined) {
                    value = '';
                }
                else {
                    value = dataRow[elem.displayName];
                }
                if (value.length >= 0) {
                    row += '<td>' + value + '</td>';
                }
            });
        } else {
            this.receta.headersReceta.forEach((elem: any) => {
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

    /********************************* ENVIAR LA RECETA POR EMAIL **********************************/
    mandarCorreoReceta() {
        if (this.receta.email !== null && this.receta.email != '' && this.receta.email !== undefined) {
            this._pantallaServicio.mostrarSpinner();
            var d = new Date();
            var params: any = {};
            params.idCita = this.idCitaSeleccionada;
            params.diaActual = d.getDate();
            params.mesActual = this.obtenerMes(d.getMonth());
            params.añoActual = d.getFullYear();
            params.email = this.receta.email;

            this._backService.HttpPost("catalogos/receta/enviarCorreoReceta", {}, params).subscribe((response: string) => {
                if (response == "false") {
                    this.modales.modalGuardar.show();
                    $("#modal-guardar .modal-body").html('<span class="title">' + this.recetaMedicaTranslate.msgSinPlantilla + '</span>');
                } else {
                    
                    this._toaster.success(this.agendaTranslate.reciboCorreoEnviado);
                }
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
        else {
            this._toaster.error(this.agendaTranslate.reciboClienteSinEmail);
        }
    }

    /********************************* ENVIAR LA RECETA ELECTRONICA POR EMAIL **********************************/
    mandarCorreoRecetaElectronica() {
        if (this.receta.email !== null && this.receta.email != '' && this.receta.email !== undefined) {
            this._pantallaServicio.mostrarSpinner();
            var d = new Date();
            var params: any = {};
            params.idCita = this.idCitaSeleccionada;
            params.diaActual = d.getDate();
            params.mesActual = this.obtenerMes(d.getMonth());
            params.añoActual = d.getFullYear();
            params.email = this.receta.email;

            this._backService.HttpPost("catalogos/receta/enviarCorreoRecetaElectronica", {}, params).subscribe((response: string) => {
                if (!response) {
                    this.modales.modalGuardar.show();
                    $("#modal-guardar .modal-body").html('<span class="title">' + this.recetaMedicaTranslate.msgSinPlantilla + '</span>');
                } else {
                    this._toaster.success(this.agendaTranslate.reciboCorreoEnviado);
                }
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
        else {
            this._toaster.error(this.agendaTranslate.reciboClienteSinEmail);
        }
    }

    cerrarModalDescartar(){
        this.modales.modalDescartar.hide();
    }

    cerrarModalConfirm(){
        this.modales.modalConfirm.hide();
    }

    valFecha(e: any) {
        var key;
        if (window.event) // IE
        {
            key = e.keyCode;
        }
        else if (e.which) // Netscape/Firefox/Opera
        {
            key = e.which;
        }
        if (key < 47 || key > 57) {
            if (key == 8) // Detectar backspace (retroceso)
            {
                return true;
            }
            else {
                return false;
            }
        }
        return true;
    }

    filtroEtiquetas(id: any) {
        if(id == 'producto1'){
            if (typeof this.receta.select !== 'string') {
                return;
            }
        
            this.receta.dataProductoBuffer = this.receta.dataProducto.filter(
                (eti: any) => {
                    if (eti.nombre.toUpperCase().match(this.receta.select.toUpperCase()) != null) {
                        return eti;
                    }
                }
            );
        }
        if(id == 'producto2'){
            if (typeof this.receta.selectNueva !== 'string') {
                return;
            }
        
            this.receta.dataProductoBuffer = this.receta.dataProducto.filter(
                (eti: any) => {
                    if (eti.nombre.toUpperCase().match(this.receta.selectNueva.toUpperCase()) != null) {
                        return eti;
                    }
                }
            );
        }
    }

    displayEtiquetas(item: any) {
        return item ? item.nombre : '';
    }
}