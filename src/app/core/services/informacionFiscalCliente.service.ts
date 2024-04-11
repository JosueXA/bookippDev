import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Type } from '@angular/core';

declare var $: any;

@Injectable({
    providedIn: 'root'
})
export class InformacionFiscalClienteService {

    constructor(private dialog: MatDialog) { }

    async openModal(component: Type<any>, dataDialog: any): Promise<Boolean> {
        const dialogRef = this.dialog.open(component, {
            data: dataDialog,
            minWidth: '400px',
            width: '100%',
			height: '100%',
            maxWidth: '1000px',
            maxHeight: '515px',
            disableClose: true,
        });

		$('.cdk-overlay-container').addClass("dialogInfoFiscalCliente");
        
		return dialogRef.afterClosed().toPromise().then(result => {
			$('.cdk-overlay-container').removeClass("dialogInfoFiscalCliente");

            return Promise.resolve(true);
		});
    }
}
