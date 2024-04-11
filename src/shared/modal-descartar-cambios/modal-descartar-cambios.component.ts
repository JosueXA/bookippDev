import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-modal-descartar-cambios',
    templateUrl: './modal-descartar-cambios.component.html',
    styleUrls: [
        './modal-descartar-cambios.component.scss',
        '../../app/page/page.component.scss',
    ],
})
export class ModalDescartarCambiosComponent implements OnInit {
    constructor(public activeModal: NgbActiveModal) { }

    ngOnInit(): void { }

    cancelBack() {
        this.activeModal.close('0');
    }

    passBack() {
        this.activeModal.close('1');
    }
}
