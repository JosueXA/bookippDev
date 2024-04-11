import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Type } from '@angular/core';
import { PantallaService } from 'src/app/core/services/pantalla.service';
declare var $: any;

@Injectable({
    providedIn: 'root'
})
export class CajaService {

    constructor(private dialog: MatDialog, public _pantallaServicio: PantallaService) { }

    async openModalCaja(component: Type<any>, dataDialog: any): Promise<Boolean> {
        this._pantallaServicio.enCaja = true;

        const dialogRef = this.dialog.open(component, {
            data: dataDialog,
            minWidth: '400px',
            width: '80%',
            height: 'inherit',
            disableClose: true
        });
		
		$('.cdk-overlay-container').addClass("dialogCaja");
        
        return dialogRef.afterClosed().toPromise().then(result => {
            this._pantallaServicio.enCaja = false;

			$('.cdk-overlay-container').removeClass("dialogCaja");
            if(dataDialog.opc == 2){
                return Promise.resolve(true);
            }
            else{
                return Promise.resolve(false);
            }
        });
    }
}
