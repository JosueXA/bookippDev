import { Injectable } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';

@Injectable({
    providedIn: 'root'
})
export class SidebarService {
    public sidenav!: MatSidenav;

    constructor() {
    }

    public setSidenav(sidenav: MatSidenav) {
        this.sidenav = sidenav;
    }

    public open() {
        return this.sidenav.open();
    }

    public close() {
        return this.sidenav.close();
    }

    public toggle(): void {
        this.sidenav.toggle();
    }

    // public modeOver(){
    //     this.sidenav.mode = "over";
    // }

    // public modeSide(){
    //     this.sidenav.mode = "side";
    // }

    // public modePush(){
    //     this.sidenav.mode = "push";
    // }

}
