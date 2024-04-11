import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { PantallaService } from '../core/services/pantalla.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ToasterService } from 'src/shared/toaster/toaster.service';

@Component({
	selector: 'app-politica-privacidad',
	templateUrl: './politica-privacidad.component.html',
	styleUrls: [ './politica-privacidad.component.scss', '../page/page.component.scss']
})
export class PoliticaPrivacidadComponent implements OnInit {

	constructor(
		private _translate: TranslateService,
		private _pantallaServicio: PantallaService,
		private _router: Router,
		private _toaster: ToasterService,
		private _route: ActivatedRoute
	) {
		
	}

	ngOnInit(): void {
		
	}
}
