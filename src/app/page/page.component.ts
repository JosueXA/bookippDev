import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { SidebarService } from 'src/shared/sidebar/sidebar.service';

@Component({
    selector: 'app-page',
    templateUrl: './page.component.html',
    styleUrls: ['./page.component.scss']
})
export class PageComponent implements OnInit {
    @ViewChild('sidenav', { static: true }) public sidenav!: MatSidenav;


    // ----------------------------------- Declaracion de variables -----------------------------------
    menuOpen: boolean = false;
    isExpanded = true;
    isShowing = false;
    showSubSubMenu: boolean = false;


    // ----------------------------------- Declaracion de funciones -----------------------------------
    constructor(private _sidebarService: SidebarService) { 

    }

    ngOnInit(): void {
        this._sidebarService.setSidenav(this.sidenav);
        this._sidebarService.open();
    }

    isOpenMenu(value: boolean) {
        this.menuOpen = value;
    }

    async clickEsc(event: any) {
        this._sidebarService.open();
    }
}