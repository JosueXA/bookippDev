import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { Observable } from "rxjs";
import { PantallaService } from "src/app/core/services/pantalla.service";

@Injectable({
    providedIn: 'root'
})

export class AuthGuard implements CanActivate {
    constructor(private _router: Router, private _pantallaService: PantallaService) {

    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
        let state_nombre = route.data["state"];
        let id_menu = route.data["id_menu"];

        if (this._pantallaService.ContieneSession()) {
            if(this._pantallaService.SessionVigente()){
                if(this._pantallaService.session.rs == "True"){
                    if (this._pantallaService.VerificarPaqueteVigente()) {
                        // El Paquete está vigente
                        if (this._pantallaService.VerificarAccesoPerfil(id_menu)) {
                            // El Perfil del Usuario tiene acceso

                            return true;
                        }
                        else {
                            if(state_nombre == "home"){
                                // La pantalla seleccionada era home pero como no se tiene acceso se manda a login
                                this._router.navigate(['/login']);
                                return false;
                            }
                            else{
                                // Al no tener acceso a una pantalla se redirecciona en automatico a home
                                this._router.navigate(['/home']);
                                return false;
                            }
                        }
                    }
                    else {
                        // Paquete no vigente
                        if(state_nombre != "metodoPago" && state_nombre != "suscripcion"){
                            // Al no tener paquete las unicas pantallas que se pueden acceder son método de pago y suscripción
                            // Si no es la de método de pago se manda a suscripción
                            this._router.navigate(['/procesos/suscripcion']);
                            return false;
                        }
                        else{
                            // Cómo no tiene paquete vigente si se deja entrar a la pantalla de método de pago sin checar si tiene permiso o no
                            return true;
                        }
                    }
                }
                else{
                    this._router.navigate(['/login']);
                    return false;
                }
            }
            else{
                // Redirección al login
                this._router.navigate(['/login']);
                return false;
            }
        }
        else {
            // Redirección al login
            this._router.navigate(['/login']);
            return false;
        }
    }
}
