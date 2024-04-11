import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ToasterComponent } from './toaster.component';

@Injectable({
    providedIn: 'root'
})
export class ToasterService {

    constructor(private snackBar: MatSnackBar) { }

    success(message: string | null | undefined): void {
        this.snackBar.openFromComponent(ToasterComponent, {
            data: {
                title: '',
                message: message,
                button_type: 'fa-solid fa-circle-check'
            },
            verticalPosition: 'bottom',
            horizontalPosition: 'center',
            duration: 3000,
            panelClass: 'success'
        });
    }


    error(message: string, title?: string | undefined | null) {
        this.snackBar.openFromComponent(ToasterComponent, {
            data: {
                title: title,
                message: message,
                button_type: 'fa-solid fa-circle-exclamation'
            },
            verticalPosition: 'bottom',
            horizontalPosition: 'center',
            duration: 3000,
            panelClass: 'error'
        });
    }

    unautorized(message: string) {
        this.snackBar.openFromComponent(ToasterComponent, {
            data: {
                title: '',
                message: message,
                button_type: 'fa-solid fa-circle-exclamation'
            },
            verticalPosition: 'bottom',
            horizontalPosition: 'center',
            duration: 3000,
            panelClass: 'error'
        });
    }


    errorServer() {
        this.snackBar.openFromComponent(ToasterComponent, {
            data: {
                title: 'Error Server',
                message: 'error interno',
                button_type: 'fa-solid fa-circle-exclamation'
            },
            verticalPosition: 'bottom',
            horizontalPosition: 'center',
            duration: 3000,
            panelClass: 'error'
        });
    }

}
