import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { MethodsService } from 'src/app/core/services/methods.service';

@Injectable({
    providedIn: 'root'
})

export class AuthService {

    // ----------------------------------- Declaracion de variables ----------------------------------- 
    jwtHelper = new JwtHelperService();


    // ----------------------------------- Declaracion de funciones -----------------------------------
    constructor(private _backService: MethodsService) {

    }

    // ---------------------- Session ----------------------
    public CargarSession(session: any) {
        localStorage.setItem('tokenBookipp', session);
        const sessionAux = this.jwtHelper.decodeToken<any>(localStorage.getItem('tokenBookipp') + '');
        localStorage.setItem('idioma', sessionAux.idioma);
    }

    public CerrarSession() {
        localStorage.removeItem('tokenBookipp');
        localStorage.removeItem('idioma');
    }
    
}
