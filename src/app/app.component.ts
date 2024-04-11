import { Component, HostBinding, HostListener, OnInit } from '@angular/core';
import { PantallaService } from "src/app/core/services/pantalla.service";
import { TicketService } from './core/services/ticket.service';
import { FacturacionService } from './core/services/facturacion.service';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { fromEvent } from 'rxjs/internal/observable/fromEvent';
import { Observable, Subscription } from 'rxjs';
import { ToasterService } from 'src/shared/toaster/toaster.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss', './page/page.component.scss']
})
export class AppComponent implements OnInit {

    // ----------------------------------- Declaracion de variables -----------------------------------
    title = 'Bookipp';


    // ----------------------------------- Declaracion de funciones -----------------------------------
    constructor(public _pantallaService: PantallaService, private _toaster: ToasterService, public _ticketService: TicketService, public _facturacionService: FacturacionService, private matIconRegistry: MatIconRegistry, private domSanitizer: DomSanitizer,) {
		this.matIconRegistry.addSvgIcon('iconCloseModal', this.domSanitizer.bypassSecurityTrustResourceUrl("../assets/icons/finales/10-2-TiposdeExcepcion-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconAgregar', this.domSanitizer.bypassSecurityTrustResourceUrl("../assets/icons/finales/Agregar-1-icon.svg"));
    }

    ngOnInit(): void {
        const havingToken = localStorage.getItem('tokenBookipp') ? true : false;
        if (this._pantallaService.ContieneSession()) {
            if (this._pantallaService.SessionVigente()) {
                this._pantallaService.ObtenerSession();
                
                if(this._pantallaService.session.rs == "True"){
                    this._pantallaService.CargaPrincipalDelSistema(1);
                    this._ticketService.crearModales();
                }
            }
        }

        this.handleAppConnectivityChanges();
    }

    offlineEvent: Observable<Event>;
    onlineEvent: Observable<Event>;
    subscriptions: Subscription[] = [];
    private isOffline = false;

    @HostBinding('disabled')
    get isDisabled(): boolean {
        return this.isOffline;
    }

    @HostListener('window:offline')
    setNetworkOffline(): void {
        this.isOffline = true;
    }

    @HostListener('window:online')
    setNetworkOnline(): void {
        this.isOffline = false;
    }

    private handleAppConnectivityChanges(): void {
        this.onlineEvent = fromEvent(window, 'online');
        this.offlineEvent = fromEvent(window, 'offline');
    
        this.subscriptions.push(this.onlineEvent.subscribe((e: any) => {
            this._toaster.success("Se ha restablecido la conexión");
        }));
    
        this.subscriptions.push(this.offlineEvent.subscribe((e: any) => {
            this._toaster.error("Se ha perdido la conexión");
        }));
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach((subscription: any) => subscription.unsubscribe());
    }
    
    // moduloFactura: any = {
    //     datosGenerales: false,
    //     conceptos: true,
    //     ocultarGuardar: false,
    //     facturacion: {
    //         idFactura: "",
    //         emisorSucursal: "",
    //         emisorRegimenFiscal: "",
    //         receptorCFDI: "",
    //         receptorFormaPago: "",
    //         receptorMetodoPago: "",
    //         receptorNombre: "",
    //         receptorRFC: "",
    //         serieyFolioFactura: "",
    //         listaFacturar: [],
    //         subtotal: 0.0,
    //         total: 0.0,
    //         impuestoIva: 0.0,
    //         subtotalMostrar: 0.0,
    //         totalMostrar: 0.0,
    //         impuestoIvaMostrar: 0.0,
    //         ivaGeneral: 0,
    //         aplicaIVA: true,
    //     },
    //     dataSucursales: [],
    //     dataformasDePago: [],
    //     datametodosDePago: [],
    //     dataCFDI: [],
    //     dataRegimen: [],
    //     dataSerie: [],
    //     datosFiscales: [],
    //     sinSeries: false,
    //     validarestatusfactura: true
    // };
    // caja: any = {
    //     venta: {
    //         ticket: {
    //             cargos: [],
    //             promocion: [],
    //             productos: [],
    //             paquetes: [],
    //             certificadosRegalo: [],
    //             propina: [],
    //             total: 0,
    //             cliente: "",
    //             idCliente: 0,
    //             folio: "",
    //             emailCliente: "",
    //             folio_pago: "",
    //             descuento: {
    //                 pago: 0
    //             },
    //             totalDescuento: 0,
    //         },
    //         ticketVenta: {
    //             cargos: [],
    //             promocion: [],
    //             productos: [],
    //             paquetes: [],
    //             certificadosRegalo: [],
    //             propina: [],
    //             total: 0,
    //             cliente: "",
    //             idCliente: 0,
    //             folio: "",
    //             emailCliente: "",
    //             folio_pago: "",
    //             descuento: 0,
    //             totalDescuento: 0,
    //             devoluciones: []
    //         }
    //     },
    //     retiroEfectivo: {
    //         ticket: {
    //             Usuario: "",
    //             Folio: "",
    //             Fecha: "",
    //             motivoRetiro: "",
    //             Monto: "",
    //         }
    //     }
    // };
    // dataTicket: any;
}
