import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { MethodsService } from 'src/app/core/services/methods.service';
declare var $: any; // JQUERY
import * as bootstrap from 'bootstrap'; // BOOTSTRAP
import { Location } from '@angular/common';

@Injectable({
    providedIn: 'root',
})
export class PantallaService {
    // ----------------------------------- Declaracion de variables -----------------------------------
    jwtHelper = new JwtHelperService();

    public session: any = {};
    public idioma: any = "";
    public idIdioma: any = "";
    public spinnerVisible: any = false;

    public esPremium = false;
    public esGerenteGeneral = false;
    public esGerenteSucursal = false;
    public empresaPremium_configuracion: any = {};
    public permisos_visualizacion: any = {};
    public tipoUsuario: any = {};
    public dataSucursales: any[] = [];
    public idSucursal: any = "";
    public validSucursales = false;
    public numSucursales: any = "";
    public dataTipoCambio: any[] = [];
    public montotipocambio: any = 0;
    public dataTempSmsMinimos: any= [];
    public dataTempWppMinimos: any= [];
    public modales: any = {};
    public datos_pantalla: any = {};
    public dataAlertas: any= [];

    public fromState = "";
    public toState = "";

    public refreshAgenda = false;

    enCaja: any = false;

    // ---------------------------------- Declaración de varaiables Globales -------------------------
    public global_IdPersonal: any = null;

    // ----------------------------------- Declaracion de funciones -----------------------------------
    constructor(private _backService: MethodsService, private location: Location) { }

    // ---------------------- Spinner ----------------------
    mostrarSpinner() {
        this.spinnerVisible = true;
    }

    ocultarSpinner() {
        this.spinnerVisible = false;
    }

    // ---------------------- Session ----------------------
    public ContieneSession(): boolean {
        return localStorage.getItem('tokenBookipp') ? true : false;
    }

    public SessionVigente(): boolean {
        try {
            const token = localStorage.getItem('tokenBookipp') + '';
            const isTokenExpired = this.jwtHelper.isTokenExpired(token);
            if (isTokenExpired === true) {
                return false;
            } else {
                return true;
            }
        } catch (e) {
            return false;
        }
    }

    public ObtenerSession(): any {
        this.session = this.jwtHelper.decodeToken<any>(
            localStorage.getItem('tokenBookipp') + ''
        );
        this.idioma = this.session.idioma;
        this.idIdioma = this.session.idIdioma;
        this.idSucursal = Number(this.session.idSucursal);
    }

    // ---------------------- Permisos Empresa Premium ----------------------
    public CargaPrincipalDelSistema(opcion: any): any {
        this.DefinirEmpresaPremiumConfiguracion();

        this.permisos_visualizacion.accesosPantalla = {};
        this.permisos_visualizacion.accesosPantalla.sitebar = {};
        this.permisos_visualizacion.accesosPantalla.sitebar.mostrarInventario = false;
        this.permisos_visualizacion.accesosPantalla.sitebar.mostrarReportes = false;
        this.permisos_visualizacion.accesosPantalla.sitebar.mostrarFacturacion = false;
        this.permisos_visualizacion.accesosPantalla.sitebar.mostrarConfiguracion = false;
        this.permisos_visualizacion.accesosPantalla.sitebar.mostrarCaja = false;
        this.DefinirPermisosVisualizacion();

        this.DefinirTipoUsuario();

        this.Consultas(opcion);

        this.ObtenerDatosPantalla();
    }

    // ---------------------- Permisos Empresa Premium ----------------------
    public DefinirEmpresaPremiumConfiguracion() {
        this.esPremium = this.session.esPremium == "True" ? true : false;
        this.empresaPremium_configuracion.cantidadSucursales = this.session.cantidadSucursales ? Number(this.session.cantidadSucursales) : 0;
        this.empresaPremium_configuracion.cantidadPersonales = this.session.cantidadPersonal ? Number(this.session.cantidadPersonal) : 0;
        this.empresaPremium_configuracion.cantidadPromociones = this.session.cantidadPromociones ? Number(this.session.cantidadPromociones) : 0;
        this.empresaPremium_configuracion.cantidadFacturaciones = this.session.cantidadFacturaciones ? Number(this.session.cantidadFacturaciones) : 0;
    }

    // ---------------------- Permisos de Visualización ----------------------
    public DefinirPermisosVisualizacion() {
        if (Object.prototype.hasOwnProperty.call(this.session, 'AGENCAT002')) {
            if (this.session['AGENCAT002'] === '1' || this.session['AGENCAT002'] === 'True') {
                this.permisos_visualizacion.accesosPantalla.sitebar.todasLasAgendas = true;
            } else {
                this.permisos_visualizacion.accesosPantalla.sitebar.todasLasAgendas = false;
            }
        } else {
            this.permisos_visualizacion.accesosPantalla.sitebar.todasLasAgendas = false;
        }

        if (Object.prototype.hasOwnProperty.call(this.session, 'AGENCAT004')) {
            if (this.session['AGENCAT004'] === '1' || this.session['AGENCAT004'] === 'True') {
                this.permisos_visualizacion.accesosPantalla.sitebar.agenda = true;
            } else {
                this.permisos_visualizacion.accesosPantalla.sitebar.agenda = false;
            }
        } else {
            this.permisos_visualizacion.accesosPantalla.sitebar.agenda = false;
        }

        if (Object.prototype.hasOwnProperty.call(this.session, 'AGENCAT008')) {
            if (this.session['AGENCAT008'] === '1' || this.session['AGENCAT008'] === 'True') {
                this.permisos_visualizacion.accesosPantalla.sitebar.iconosSMSDisponibles = true;
            } else {
                this.permisos_visualizacion.accesosPantalla.sitebar.iconosSMSDisponibles = false;
            }
        } else {
            this.permisos_visualizacion.accesosPantalla.sitebar.iconosSMSDisponibles = false;
        }

        if (Object.prototype.hasOwnProperty.call(this.session, 'SUCURSA001')) {
            if (this.session['SUCURSA001'] === '1' || this.session['SUCURSA001'] === 'True') {
                this.permisos_visualizacion.accesosPantalla.sitebar.sucursal = true;
            } else {
                this.permisos_visualizacion.accesosPantalla.sitebar.sucursal = false;
            }
        } else {
            this.permisos_visualizacion.accesosPantalla.sitebar.sucursal = false;
        }

        if (Object.prototype.hasOwnProperty.call(this.session, 'SERPAQCT001')) {
            if (this.session['SERPAQCT001'] === '1' || this.session['SERPAQCT001'] === 'True') {
                this.permisos_visualizacion.accesosPantalla.sitebar.servicio = true;
            } else {
                this.permisos_visualizacion.accesosPantalla.sitebar.servicio = false;
            }
        } else {
            this.permisos_visualizacion.accesosPantalla.sitebar.servicio = false;
        }

        if (Object.prototype.hasOwnProperty.call(this.session, 'PERSCAT001')) {
            if (this.session['PERSCAT001'] === '1' || this.session['PERSCAT001'] === 'True') {
                this.permisos_visualizacion.accesosPantalla.sitebar.personal = true;
            } else {
                this.permisos_visualizacion.accesosPantalla.sitebar.personal = false;
            }
        } else {
            this.permisos_visualizacion.accesosPantalla.sitebar.personal = false;
        }

        if (Object.prototype.hasOwnProperty.call(this.session, 'CLIENCAT001')) {
            if (this.session['CLIENCAT001'] === '1' || this.session['CLIENCAT001'] === 'True') {
                this.permisos_visualizacion.accesosPantalla.sitebar.cliente = true;
            } else {
                this.permisos_visualizacion.accesosPantalla.sitebar.cliente = false;
            }
        } else {
            this.permisos_visualizacion.accesosPantalla.sitebar.cliente = false;
        }

        if (Object.prototype.hasOwnProperty.call(this.session, 'PROMCAT001')) {
            if (this.session['PROMCAT001'] === '1' || this.session['PROMCAT001'] === 'True') {
                this.permisos_visualizacion.accesosPantalla.sitebar.promocion = true;
            } else {
                this.permisos_visualizacion.accesosPantalla.sitebar.promocion = false;
            }
        } else {
            this.permisos_visualizacion.accesosPantalla.sitebar.promocion = false;
        }

        if (Object.prototype.hasOwnProperty.call(this.session, 'INVENTCT001')) {
            if (this.session['INVENTCT001'] === '1' || this.session['INVENTCT001'] === 'True') {
                this.permisos_visualizacion.accesosPantalla.sitebar.producto = true;
            } else {
                this.permisos_visualizacion.accesosPantalla.sitebar.producto = false;
            }
        } else {
            this.permisos_visualizacion.accesosPantalla.sitebar.producto = false;
        }
        if(this.permisos_visualizacion.accesosPantalla.sitebar.producto){
            this.permisos_visualizacion.accesosPantalla.sitebar.mostrarInventario = true;
        }

        if (Object.prototype.hasOwnProperty.call(this.session, 'INVENTCT003')) {
            if (this.session['INVENTCT003'] === '1' || this.session['INVENTCT003'] === 'True') {
                this.permisos_visualizacion.accesosPantalla.sitebar.productoRecepcion = true;
            } else {
                this.permisos_visualizacion.accesosPantalla.sitebar.productoRecepcion = false;
            }
        } else {
            this.permisos_visualizacion.accesosPantalla.sitebar.productoRecepcion = false;
        }
        if(this.permisos_visualizacion.accesosPantalla.sitebar.productoRecepcion){
            this.permisos_visualizacion.accesosPantalla.sitebar.mostrarInventario = true;
        }

        if (Object.prototype.hasOwnProperty.call(this.session, 'REPORCAT001')) {
            if (this.session['REPORCAT001'] === '1' || this.session['REPORCAT001'] === 'True') {
                this.permisos_visualizacion.accesosPantalla.sitebar.reporteProductividad = true;
            } else {
                this.permisos_visualizacion.accesosPantalla.sitebar.reporteProductividad = false;
            }
        } else {
            this.permisos_visualizacion.accesosPantalla.sitebar.reporteProductividad = false;
        }
        if(this.permisos_visualizacion.accesosPantalla.sitebar.reporteProductividad){
            this.permisos_visualizacion.accesosPantalla.sitebar.mostrarReportes = true;
        }

        if (Object.prototype.hasOwnProperty.call(this.session, 'REPORCAT002')) {
            if (this.session['REPORCAT002'] === '1' || this.session['REPORCAT002'] === 'True') {
                this.permisos_visualizacion.accesosPantalla.sitebar.reporteCitas = true;
            } else {
                this.permisos_visualizacion.accesosPantalla.sitebar.reporteCitas = false;
            }
        } else {
            this.permisos_visualizacion.accesosPantalla.sitebar.reporteCitas = false;
        }
        if(this.permisos_visualizacion.accesosPantalla.sitebar.reporteCitas){
            this.permisos_visualizacion.accesosPantalla.sitebar.mostrarReportes = true;
        }

        if (Object.prototype.hasOwnProperty.call(this.session, 'REPORCAT003')) {
            if (this.session['REPORCAT003'] === '1' || this.session['REPORCAT003'] === 'True') {
                this.permisos_visualizacion.accesosPantalla.sitebar.reporteIngresos = true;
            } else {
                this.permisos_visualizacion.accesosPantalla.sitebar.reporteIngresos = false;
            }
        } else {
            this.permisos_visualizacion.accesosPantalla.sitebar.reporteIngresos = false;
        }
        if(this.permisos_visualizacion.accesosPantalla.sitebar.reporteIngresos){
            this.permisos_visualizacion.accesosPantalla.sitebar.mostrarReportes = true;
        }

        if (Object.prototype.hasOwnProperty.call(this.session, 'REPORCAT004')) {
            if (this.session['REPORCAT004'] === '1' || this.session['REPORCAT004'] === 'True') {
                this.permisos_visualizacion.accesosPantalla.sitebar.reporteClientes = true;
            } else {
                this.permisos_visualizacion.accesosPantalla.sitebar.reporteClientes = false;
            }
        } else {
            this.permisos_visualizacion.accesosPantalla.sitebar.reporteClientes = false;
        }
        if(this.permisos_visualizacion.accesosPantalla.sitebar.reporteClientes){
            this.permisos_visualizacion.accesosPantalla.sitebar.mostrarReportes = true;
        }

        if (Object.prototype.hasOwnProperty.call(this.session, 'FACTUCAT001')) {
            if (this.session['FACTUCAT001'] === '1' || this.session['FACTUCAT001'] === 'True') {
                this.permisos_visualizacion.accesosPantalla.sitebar.facturacionConfiguracion = true;
                this.permisos_visualizacion.accesosPantalla.sitebar.facturacion = true;
            } else {
                this.permisos_visualizacion.accesosPantalla.sitebar.facturacionConfiguracion = false;
                this.permisos_visualizacion.accesosPantalla.sitebar.facturacion = false;
            }
        } else {
            this.permisos_visualizacion.accesosPantalla.sitebar.facturacionConfiguracion = false;
            this.permisos_visualizacion.accesosPantalla.sitebar.facturacion = false;
        }
        if(this.permisos_visualizacion.accesosPantalla.sitebar.facturacionConfiguracion){
            this.permisos_visualizacion.accesosPantalla.sitebar.mostrarFacturacion = true;
        }
        if(this.permisos_visualizacion.accesosPantalla.sitebar.facturacion){
            this.permisos_visualizacion.accesosPantalla.sitebar.mostrarFacturacion = true;
        }

        if (Object.prototype.hasOwnProperty.call(this.session, 'CONFIGCT001')) {
            if (this.session['CONFIGCT001'] === '1' || this.session['CONFIGCT001'] === 'True') {
                this.permisos_visualizacion.accesosPantalla.sitebar.equipos = true;
            } else {
                this.permisos_visualizacion.accesosPantalla.sitebar.equipos = false;
            }
        } else {
            this.permisos_visualizacion.accesosPantalla.sitebar.equipos = false;
        }
        if(this.permisos_visualizacion.accesosPantalla.sitebar.equipos){
            this.permisos_visualizacion.accesosPantalla.sitebar.mostrarConfiguracion = true;
        }

        if (Object.prototype.hasOwnProperty.call(this.session, 'CONFIGCT003')) {
            if (this.session['CONFIGCT003'] === '1' || this.session['CONFIGCT003'] === 'True') {
                this.permisos_visualizacion.accesosPantalla.sitebar.tiposExcepcion = true;
            } else {
                this.permisos_visualizacion.accesosPantalla.sitebar.tiposExcepcion = false;
            }
        } else {
            this.permisos_visualizacion.accesosPantalla.sitebar.tiposExcepcion = false;
        }
        if(this.permisos_visualizacion.accesosPantalla.sitebar.tiposExcepcion){
            this.permisos_visualizacion.accesosPantalla.sitebar.mostrarConfiguracion = true;
        }

        if (Object.prototype.hasOwnProperty.call(this.session, 'CONFIGCT005')) {
            if (this.session['CONFIGCT005'] === '1' || this.session['CONFIGCT005'] === 'True') {
                this.permisos_visualizacion.accesosPantalla.sitebar.tipoCambio = true;
            } else {
                this.permisos_visualizacion.accesosPantalla.sitebar.tipoCambio = false;
            }
        } else {
            this.permisos_visualizacion.accesosPantalla.sitebar.tipoCambio = false;
        }
        if(this.permisos_visualizacion.accesosPantalla.sitebar.tipoCambio){
            this.permisos_visualizacion.accesosPantalla.sitebar.mostrarConfiguracion = true;
        }

        if (Object.prototype.hasOwnProperty.call(this.session, 'CONFIGCT007')) {
            if (this.session['CONFIGCT007'] === '1' || this.session['CONFIGCT007'] === 'True') {
                this.permisos_visualizacion.accesosPantalla.sitebar.perfil = true;
                this.permisos_visualizacion.accesosPantalla.sitebar.usuario = true;
            } else {
                this.permisos_visualizacion.accesosPantalla.sitebar.perfil = false;
                this.permisos_visualizacion.accesosPantalla.sitebar.usuario = false;
            }
        } else {
            this.permisos_visualizacion.accesosPantalla.sitebar.perfil = false;
            this.permisos_visualizacion.accesosPantalla.sitebar.usuario = false;
        }
        if(this.permisos_visualizacion.accesosPantalla.sitebar.perfil){
            this.permisos_visualizacion.accesosPantalla.sitebar.mostrarConfiguracion = true;
        }
        if(this.permisos_visualizacion.accesosPantalla.sitebar.usuario){
            this.permisos_visualizacion.accesosPantalla.sitebar.mostrarConfiguracion = true;
        }

        if (Object.prototype.hasOwnProperty.call(this.session, 'CONFIGCT009')) {
            if (this.session['CONFIGCT009'] === '1' || this.session['CONFIGCT009'] === 'True') {
                this.permisos_visualizacion.accesosPantalla.sitebar.configuracionTicket = true;
            } else {
                this.permisos_visualizacion.accesosPantalla.sitebar.configuracionTicket = false;
            }
        } else {
            this.permisos_visualizacion.accesosPantalla.sitebar.configuracionTicket = false;
        }
        if(this.permisos_visualizacion.accesosPantalla.sitebar.configuracionTicket){
            this.permisos_visualizacion.accesosPantalla.sitebar.mostrarConfiguracion = true;
        }

        if (Object.prototype.hasOwnProperty.call(this.session, 'CONFIGCT011')) {
            if (this.session['CONFIGCT011'] === '1' || this.session['CONFIGCT011'] === 'True') {
                this.permisos_visualizacion.accesosPantalla.sitebar.configuracionParametros = true;
            } else {
                this.permisos_visualizacion.accesosPantalla.sitebar.configuracionParametros = false;
            }
        } else {
            this.permisos_visualizacion.accesosPantalla.sitebar.configuracionParametros = false;
        }
        if(this.permisos_visualizacion.accesosPantalla.sitebar.configuracionParametros){
            this.permisos_visualizacion.accesosPantalla.sitebar.mostrarConfiguracion = true;
        }

        if (Object.prototype.hasOwnProperty.call(this.session, 'CONFIGCT013')) {
            if (this.session['CONFIGCT013'] === '1' || this.session['CONFIGCT013'] === 'True') {
                this.permisos_visualizacion.accesosPantalla.sitebar.configuracionReceta = true;
            } else {
                this.permisos_visualizacion.accesosPantalla.sitebar.configuracionReceta = false;
            }
        } else {
            this.permisos_visualizacion.accesosPantalla.sitebar.configuracionReceta = false;
        }
        if(this.permisos_visualizacion.accesosPantalla.sitebar.configuracionReceta){
            this.permisos_visualizacion.accesosPantalla.sitebar.mostrarConfiguracion = true;
        }

        if (Object.prototype.hasOwnProperty.call(this.session, 'CONFIGCT015')) {
            if (this.session['CONFIGCT015'] === '1' || this.session['CONFIGCT015'] === 'True') {
                this.permisos_visualizacion.accesosPantalla.sitebar.configuracionRecetaElectronica = true;
            } else {
                this.permisos_visualizacion.accesosPantalla.sitebar.configuracionRecetaElectronica = false;
            }
        } else {
            this.permisos_visualizacion.accesosPantalla.sitebar.configuracionRecetaElectronica = false;
        }
        if(this.permisos_visualizacion.accesosPantalla.sitebar.configuracionRecetaElectronica){
            this.permisos_visualizacion.accesosPantalla.sitebar.mostrarConfiguracion = true;
        }

        if (Object.prototype.hasOwnProperty.call(this.session, 'SUSCRIP001')) {
            if (this.session['SUSCRIP001'] === '1' || this.session['SUSCRIP001'] === 'True') {
                this.permisos_visualizacion.accesosPantalla.sitebar.suscripcion = true;
            } else {
                this.permisos_visualizacion.accesosPantalla.sitebar.suscripcion = false;
            }
        } else {
            this.permisos_visualizacion.accesosPantalla.sitebar.suscripcion = false;
        }

        if (Object.prototype.hasOwnProperty.call(this.session, 'CAJACAT001')) {
            if (this.session['CAJACAT001'] === '1' || this.session['CAJACAT001'] === 'True') {
                this.permisos_visualizacion.accesosPantalla.sitebar.caja = true;
            } else {
                this.permisos_visualizacion.accesosPantalla.sitebar.caja = false;
            }
        } else {
            this.permisos_visualizacion.accesosPantalla.sitebar.caja = false;
        }
        if(this.permisos_visualizacion.accesosPantalla.sitebar.caja){
            this.permisos_visualizacion.accesosPantalla.sitebar.mostrarCaja = true;
        }

        if (Object.prototype.hasOwnProperty.call(this.session, 'FORMS001')) {
            if (this.session['FORMS001'] === '1' || this.session['FORMS001'] === 'True') {
                this.permisos_visualizacion.accesosPantalla.sitebar.formulario = true;
            } else {
                this.permisos_visualizacion.accesosPantalla.sitebar.formulario = false;
            }
        } else {
            this.permisos_visualizacion.accesosPantalla.sitebar.formulario = false;
        }
    }

    // ---------------------- Permisos de Tipo Usuario ----------------------
    public DefinirTipoUsuario(){
        if(this.session.isGerenteGeneral == "True"){
            this.esGerenteGeneral = true;
        }
        else{
            if(this.session.isGerenteSucursal == "True"){
                this.esGerenteSucursal  = true;
            }
        }
    }

    // ------------------------------ Consultas ------------------------------
    public Consultas(opcion: any){
        this.ConsultarTimbrasFacturas();

        this.CrearModales()
        this.ConsultarSms(opcion);
        this.ConsultarWhatsapps(opcion);
    }

    // ------------------------- Consulta de Timbres -------------------------
    public ConsultarTimbrasFacturas(){
        this.mostrarSpinner();

        var params: any = {};
        this._backService.HttpPost("catalogos/Factura/consultarTimbres", {}, params).subscribe((response: string) => {
            var datosTimbre = eval(response);
            if (datosTimbre.length > 0) {
                if(datosTimbre[0].usuarioTimbrado == null || datosTimbre[0].passwordTimbrado == null) {
                    this.permisos_visualizacion.accesosPantalla.sitebar.mostrarFacturacion = false; 
                }
            }
            else {
                this.permisos_visualizacion.accesosPantalla.sitebar.mostrarFacturacion = false; 
            }

            this.ConsultarTiposCambio();
        }, error => {
        
        });
    }

    // --------------------- Consulta de Tipos de Cambio ---------------------
    public ConsultarTiposCambio(){
        if(this.idSucursal == 689 || this.idSucursal == 269){
            var params: any = {};
            this._backService.HttpPost("procesos/agenda/Agenda/consultarTipoCambio", {}, params).subscribe((response: string) => {
                this.dataTipoCambio = eval(response);
                this.montotipocambio = this.dataTipoCambio[0].monto;

                this.ConsultarSucursales();
            }, error => {
            
            });
        }
        else{
            this.ConsultarSucursales();
        }
    }

    // ----------------------- Consulta de Sucursales -----------------------
    public ConsultarSucursales(){
        this.mostrarSpinner();

        var params: any = {};
        this._backService.HttpPost("catalogos/Sucursal/consultarListadoSucursalesMain", {}, params).subscribe((response: string) => {
            this.dataSucursales = eval(response);

            // if (idSucursal != null) {
            //     this.idSucursal = idSucursal;
            // }
            if (this.dataSucursales.length == 1) {
                this.validSucursales = false;
            } else {
                this.validSucursales = true;
            }
            this.numSucursales = this.dataSucursales.length;

            this.ocultarSpinner();
        }, error => {
        
        });
    }

    // ------------------------ Creación de modales -------------------------
    public CrearModales(){
        if ($('body').find('.modalSMS').length > 1) {
            $('body').find('.modalSMS')[1].remove();
        }
        this.modales.modalSMS = new bootstrap.Modal($("#modalSMS").appendTo("body"), {
            backdrop: "static", 
            keyboard: false,
        });

        if ($('body').find('.modalWPP').length > 1) {
            $('body').find('.modalWPP')[1].remove();
        }
        this.modales.modalWPP = new bootstrap.Modal($("#modalWPP").appendTo("body"), {
            backdrop: "static", 
            keyboard: false,
        });
    }

    // ---------------------- Consulta mensajes de texto ---------------------
    public ConsultarSms(opcion: any){
        var pathString = this.location.path();
        if(this.permisos_visualizacion.accesosPantalla.sitebar.iconosSMSDisponibles){
            var params: any = {};
            this._backService.HttpPost("procesos/agenda/Agenda/consultarSmsMinimosAviso", {}, params).subscribe((response: string) => {
                this.dataTempSmsMinimos = eval(response)[0];
                
                if(this.dataTempSmsMinimos.envioSms == "1"){
                    this.dataTempSmsMinimos.mensaje = "Atención: Quedan " + this.dataTempSmsMinimos.smsDisponibles + " mensajes disponibles en su bolsa del mes actual";

                    if(this.dataTempSmsMinimos.smsDisponibles <= this.dataTempSmsMinimos.smsMinimosAviso){
                        if(opcion == 2){
                            this.modales.modalSMS.show();
                        }
                        else{
                            if(pathString == "/procesos/agenda"){
                                this.modales.modalSMS.show();
                            }
                        }
                    }
                }
            }, error => {
            
            });
        }
    }

    // ------------------------- Consulta Whatsapps --------------------------
    public ConsultarWhatsapps(opcion: any){
        var pathString = this.location.path();
        if(this.permisos_visualizacion.accesosPantalla.sitebar.iconosSMSDisponibles){
            var params: any = {};
            this._backService.HttpPost("procesos/agenda/Agenda/consultarWppMinimosAviso", {}, params).subscribe((response: string) => {
                this.dataTempWppMinimos = eval(response)[0];

                if (this.dataTempWppMinimos.envioWpp == "1") {
                    this.dataTempWppMinimos.mensaje = "Atención: Quedan " + this.dataTempWppMinimos.wppDisponibles + " mensajes WhatsApp disponibles en su bolsa del mes actual";

                    if (this.dataTempWppMinimos.wppDisponibles <= this.dataTempWppMinimos.wppMinimosAviso) {
                        if(opcion == 2){
                            this.modales.modalWPP.show();
                        }
                        else{
                            if(pathString == "/procesos/agenda"){
                                this.modales.modalWPP.show();
                            }
                        }
                    }
                }
            }, error => {
            
            });
        }
    }

    // ----------------------- Obtener datos pantalla ------------------------
    public ObtenerDatosPantalla(){
        var params = {};
        this._backService.HttpPost("Login/pantalla", {}, params).subscribe((response: string) => {
            var dataTemp = (response).split(",");
            this.datos_pantalla.nUsuario = dataTemp[0];
            this.datos_pantalla.nombreUsuario = dataTemp[0];
            this.datos_pantalla.nSucursal = dataTemp[1];
            this.datos_pantalla.idImagen = dataTemp[2];
            this.datos_pantalla.sucursalSession = dataTemp[3];
            this.datos_pantalla.idSucursal = dataTemp[3];
            this.datos_pantalla.idiomaSuc = dataTemp[4];
            this.datos_pantalla.numAlertas = dataTemp[5];

            // Consulta de alertas
            var params2 = {};
            this._backService.HttpPost("Login/alertas", {}, params2).subscribe((response: string) => {
                this.dataAlertas = eval(response);

                // Carga de Imagen
                if (this.datos_pantalla.idImagen == "") {
                    this.datos_pantalla.img = "img/system/logoSucursal.png";
                }
                else{
                    var params3: any = {};
                    params3.idImagen = this.datos_pantalla.idImagen;
                    this._backService.HttpPost("catalogos/Imagen/cargarImagen", {}, params3).subscribe((response: string) => {
                        var dataImg = eval(response);
                        this.datos_pantalla.img = dataImg[0].codigo;
                    }, error => {
                    
                    });
                }
    
            }, error => {
            
            });

        }, error => {
        
        });
    }

    // ---------------------- Permisos de Acceso ----------------------
    // Paquete vigente
    public VerificarPaqueteVigente(): boolean {
        if (this.session['paqueteVigente'] == 'True') {
            return true;
        } else {
            return false;
        }
    }

    // Acceso perfil
    public VerificarAccesoPerfil(codigo: string): boolean {

        if(codigo == "HOMEHOME000"){
            return true;
        }

        if (Object.prototype.hasOwnProperty.call(this.session, codigo)) {
            if (this.session[codigo] === '1' || this.session[codigo] === 'True') {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }
}
