import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, Input, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { TranslateService } from '@ngx-translate/core';
import { PantallaService } from "src/app/core/services/pantalla.service";
import { environment } from 'src/environments/environment';
import { MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from '@angular/platform-browser';
import { CajaService } from 'src/app/core/services/caja.service';
import { CajaComponent } from 'src/app/page/procesos/caja/caja.component';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
    animations: [
        trigger('detailExpand', [
            state('collapsed', style({ height: '0px', minHeight: '0' })),
            state('expanded', style({ height: '*' })),
            transition('expanded <=> collapsed', animate('500ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
        ]),
    ],
})
export class SidebarComponent implements OnInit {
    @Input() menuOpen!: boolean;    

    // ----------------------------------- Declaracion de variables -----------------------------------
    nombreSucursal: any = "";
    imagenSucursal: any = "";
    grupoCatalogoEstaVacio: any = true;
    grupoConfigEstaVacio: any = true;
    grupoInveEstaVacio: any = true;
    direccionImagenesSucursal: any = "";

    // Variables de Translate
    translateTranslate: any = {};

    // ----------------------------------- Declaracion de funciones -----------------------------------
    constructor(private _sidenav: MatSidenav, public _pantallaService: PantallaService, private _translate: TranslateService,
        private matIconRegistry: MatIconRegistry,
        private domSanitizer: DomSanitizer,
        private _serviceCaja: CajaService) {
        this._translate.setDefaultLang(this._pantallaService.idioma);
        this._translate.use(this._pantallaService.idioma);

        this.matIconRegistry.addSvgIcon('iconCalendario', this.domSanitizer.bypassSecurityTrustResourceUrl("../../assets/icons/finales/01-Agenda-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconCaja', this.domSanitizer.bypassSecurityTrustResourceUrl("../../assets/icons/finales/02-PuntodeVenta-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconSucursal', this.domSanitizer.bypassSecurityTrustResourceUrl("../../assets/icons/finales/03-Sucursal-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconServicios', this.domSanitizer.bypassSecurityTrustResourceUrl("../../assets/icons/finales/04-Servicios-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconPersonal', this.domSanitizer.bypassSecurityTrustResourceUrl("../../assets/icons/finales/05-Personal-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconClientes', this.domSanitizer.bypassSecurityTrustResourceUrl("../../assets/icons/finales/06-Clientes-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconPromociones', this.domSanitizer.bypassSecurityTrustResourceUrl("../../assets/icons/finales/07-Promociones-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconInventario', this.domSanitizer.bypassSecurityTrustResourceUrl("../../assets/icons/finales/08-Inventario-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconProducto', this.domSanitizer.bypassSecurityTrustResourceUrl("../../assets/icons/finales/08-1-Producto-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconRecepcionProducto', this.domSanitizer.bypassSecurityTrustResourceUrl("../../assets/icons/finales/08-2-RecepciondeProducto-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconReportes', this.domSanitizer.bypassSecurityTrustResourceUrl("../../assets/icons/finales/09-Reportes-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconReporteProductividad', this.domSanitizer.bypassSecurityTrustResourceUrl("../../assets/icons/finales/09-1-ReportedeProductividad-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconReporteCitas', this.domSanitizer.bypassSecurityTrustResourceUrl("../../assets/icons/finales/09-2-ReportedeCitas-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconReporteIngresos', this.domSanitizer.bypassSecurityTrustResourceUrl("../../assets/icons/finales/09-3-Reportedeingresos-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconConsultaClientes', this.domSanitizer.bypassSecurityTrustResourceUrl("../../assets/icons/finales/09-4-ConsultadeClientes-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconArchivoLleno', this.domSanitizer.bypassSecurityTrustResourceUrl("../../assets/icons/finales/ArchivoLleno-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconArchivoMas', this.domSanitizer.bypassSecurityTrustResourceUrl("../../assets/icons/finales/ArchivoMas-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconArchivoAceptar', this.domSanitizer.bypassSecurityTrustResourceUrl("../../assets/icons/finales/ArchivoAceptar-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconConfiguracion', this.domSanitizer.bypassSecurityTrustResourceUrl("../../assets/icons/finales/10-Configuracion-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconEquipos', this.domSanitizer.bypassSecurityTrustResourceUrl("../../assets/icons/finales/10-1-Equipos-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconTiposExcepcion', this.domSanitizer.bypassSecurityTrustResourceUrl("../../assets/icons/finales/10-2-TiposdeExcepcion-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconTiposCambios', this.domSanitizer.bypassSecurityTrustResourceUrl("../../assets/icons/finales/10-3-TiposdeCambios-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconPerfilUsuario', this.domSanitizer.bypassSecurityTrustResourceUrl("../../assets/icons/finales/10-4-PerfildeUsuario-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconUsuarios', this.domSanitizer.bypassSecurityTrustResourceUrl("../../assets/icons/finales/10-5-Usuarios-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconConfiguracionTicket', this.domSanitizer.bypassSecurityTrustResourceUrl("../../assets/icons/finales/10-6-ConfiguraciondeTicket-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconConfiguracionParametros', this.domSanitizer.bypassSecurityTrustResourceUrl("../../assets/icons/finales/10-7-ConfiguraciondeParametros-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconConfiguracionReceta', this.domSanitizer.bypassSecurityTrustResourceUrl("../../assets/icons/finales/10-8-ConfiguraciondeReceta-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconSuscripcion', this.domSanitizer.bypassSecurityTrustResourceUrl("../../assets/icons/finales/11-Suscripcion-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconForms', this.domSanitizer.bypassSecurityTrustResourceUrl("../../assets/icons/finales/12-Forms-icon.svg"));
//
    }

    ngOnInit(): void {
        
    }

    openModalCaja(){
        var params: any = {};
        params.data = {};
        params.opc = 1;
        this._serviceCaja.openModalCaja(CajaComponent, params);
    }

}
