import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalDescartarCambiosComponent } from 'src/shared/modal-descartar-cambios/modal-descartar-cambios.component';

@Injectable({
    providedIn: 'root',
})
export class DescartarCambiosServices {
    // ----------------------------------- Declaracion de variables -----------------------------------


    // ----------------------------------- Declaracion de funciones -----------------------------------
    constructor(private _modalService: NgbModal) { }

    // Funcion para descartar cambios de la pantalla cuando estos se validen por modulo
    public async mostrarModal(mostrarPantalla: boolean): Promise<boolean>{
        if(!mostrarPantalla) return true;
        const result = await this._modalService.open(ModalDescartarCambiosComponent, { size: 'md', beforeDismiss: () => false }).result;
        return result === '1';
    }
}