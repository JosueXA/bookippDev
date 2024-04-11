import { Component, EventEmitter, OnInit, Output, Input } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { MethodsService } from 'src/app/core/services/methods.service';
import { PantallaService } from 'src/app/core/services/pantalla.service';
import { SidebarService } from '../sidebar/sidebar.service';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { AgendaComponent } from 'src/app/page/procesos/agenda/agenda.component';
import { Location } from '@angular/common';

@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {
    @Output('menuStatus') menuStatus = new EventEmitter<boolean>();
    menuOpen = false;
    isTogleMenu: boolean = false;
    logo: string = '../../assets/images/logo/logo-toolbar.png';

    constructor(
        public sidenav: SidebarService,
        private _router: Router,
        public _pantallaService: PantallaService,
        private _backService: MethodsService,
        private _authService: AuthService,
        private observer: BreakpointObserver,
        private matIconRegistry: MatIconRegistry, 
        private domSanitizer: DomSanitizer,
		private _location: Location
    ) { 
        this.matIconRegistry.addSvgIcon('iconMenuHambur', this.domSanitizer.bypassSecurityTrustResourceUrl("../../assets/icons/finales/Menu-Hamburguesa-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconWSPNotificacion', this.domSanitizer.bypassSecurityTrustResourceUrl("../../assets/icons/finales/WSP-notification-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconSMSNotificacion', this.domSanitizer.bypassSecurityTrustResourceUrl("../../assets/icons/finales/SMS-notification-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconCampanaNotificacion', this.domSanitizer.bypassSecurityTrustResourceUrl("../../assets/icons/finales/Campana-notification-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconLogOut', this.domSanitizer.bypassSecurityTrustResourceUrl("../../assets/icons/finales/LogOut-icon.svg"));
    }

    ngOnInit(): void {
    }

    togleSideNav() {
        this.isTogleMenu = !this.isTogleMenu;
        this.sidenav.toggle();
    }

    clickMenuSide() {
        if (this.isTogleMenu === false) {
            this.menuOpen = !this.menuOpen;
            this.menuStatus.emit(this.menuOpen);
        }
    }

    clickMenuOver() {
        this.sidenav.toggle();
    }

    logOut() {
        this._router.navigate(['/login']);
    }

    verAlertas(){
        this._pantallaService.datos_pantalla.numAlertas = 0;
    }

    irAAgenda(){
        this._router.navigate(['/procesos/agenda']);
    }

    ngAfterViewInit(){
        // Para cuando sea abra en una pantalla pequena el sidenav se posicione por encima del contenido
        this.observer.observe(['(max-width: 800px)']).subscribe((res: any) => {
            if(res.matches){
                if(this.sidenav.sidenav.mode == "side"){
                    this.sidenav.sidenav.mode = "over";

                    this.menuOpen = true;
                    this.menuStatus.emit(this.menuOpen);

                    if(this.sidenav.sidenav.opened){
                        this.sidenav.toggle();
                    }   
                }
            }
            else{
                if(this.sidenav.sidenav.mode == "over"){
                    this.sidenav.sidenav.mode = "side";

                    this.menuOpen = false;
                    this.menuStatus.emit(this.menuOpen);

                    if(!this.sidenav.sidenav.opened){
                        this.sidenav.toggle();
                    }
                }
            }
        });
    }

    cambiarSucursal() {
		const pathString = this._location.path();
        this._pantallaService.mostrarSpinner();

        var params: any = {};
        params.idSucursal = this._pantallaService.idSucursal;
        this._backService.HttpPost('Login/RefreshTokenCambioSucursal', {}, params).subscribe(
            (response) => {
                const dataTemp = eval(response);
                this._authService.CargarSession(dataTemp.data);

				if(pathString === "/procesos/agenda"){
					window.location.reload();
				}else{
					this._pantallaService.refreshAgenda = true;
					this._router.navigate(['/procesos/agenda']);
				}
            },
            (error) => {
                this._pantallaService.ocultarSpinner();
            }
        );
    }
}
