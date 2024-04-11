import { Component, OnInit } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { MatTableDataSource } from '@angular/material/table';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
declare var $: any; // JQUERY
import * as bootstrap from 'bootstrap'; // BOOTSTRAP
import { MethodsService } from 'src/app/core/services/methods.service';
import { PantallaService } from 'src/app/core/services/pantalla.service';
import { ToasterService } from 'src/shared/toaster/toaster.service';

@Component({
	selector: 'app-facturacion',
	templateUrl: './facturacion.component.html',
	styleUrls: ['./facturacion.component.scss', '../../page.component.scss']
})
export class FacturacionComponent implements OnInit {
	
	//Translate variable
	consultaFacturaSerieTranslate: any = {};
	sessionTraslate: any = {};

	// Modales
	modales: any = {};
	messageModal: any = '';

	constructor(private _translate: TranslateService,
		private _backService: MethodsService,
		public _pantallaServicio: PantallaService,
		private matIconRegistry: MatIconRegistry,
		private domSanitizer: DomSanitizer,
		private _toaster: ToasterService,
		private _router: Router) {
		this._translate.setDefaultLang(this._pantallaServicio.idioma);
		this._translate.use(this._pantallaServicio.idioma);

		this._translate.get('consultaFacturaSerieTranslate').subscribe((translated) => {
			this.consultaFacturaSerieTranslate = this._translate.instant('consultaFacturaSerieTranslate');
            this.sessionTraslate = this._translate.instant('sessionTraslate');
		});

		this.matIconRegistry.addSvgIcon('iconBorrar', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Basura-icon.svg"));
		this.matIconRegistry.addSvgIcon('iconEditar', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Editar-icon.svg"));
		this.matIconRegistry.addSvgIcon('iconAgregar', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Agregar-1-icon.svg"));
		this.matIconRegistry.addSvgIcon('iconFlechaDerecha', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/FlechaDerechaPequena-icon.svg"));
		this.matIconRegistry.addSvgIcon('iconCasita', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Casa1-icon.svg"));
	}

	ngOnInit(): void {
		this.crearModales();
		this.dataConsulta();
	}

	// ******************** VARIABLES ******************
	
	facturaSeries: any = {};
	idSerie: any = "";
	displayedColumns: string[] = ['acciones', 'nombre', 'descripcion', 'contador', 'minimo', 'maximo'];
	dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();


	// ******************** FUNCIONES ******************
	
	dataConsulta() {
        this._pantallaServicio.mostrarSpinner();
		this._backService.HttpPost('catalogos/factura/consultarFacturaSeries', {}, {}).subscribe(
			response => {
				this.facturaSeries.data = eval(response);
				for (let i = 0; i < this.facturaSeries.data.length; i++) {
					this.facturaSeries.data[i].contador = this.facturaSeries.data[i].contador == '0' ? '1' : this.facturaSeries.data[i].contador;
					this.facturaSeries.data[i].minimo = this.facturaSeries.data[i].minimo == null ? "1" : this.facturaSeries.data[i].minimo;
					this.facturaSeries.data[i].maximo = this.facturaSeries.data[i].maximo == null ? "100000" : this.facturaSeries.data[i].maximo;
				}
				this.facturaSeries.altura = this.facturaSeries.data.length * 30 + 45;
				this.dataSource.data = this.facturaSeries.data;
                this._pantallaServicio.ocultarSpinner();
			},
			error => {
				this._pantallaServicio.ocultarSpinner();
				if (error === 'SinSesion' || error === 'SesionCaducada') {
					if (error === 'SinSesion') {
						this._toaster.error(this.sessionTraslate.favorIniciarSesion);
					}
					if (error === 'SesionCaducada') {
						this._toaster.error(this.sessionTraslate.sesionCaducada);
					}
					this._router.navigate(['/login']);
				}
			}
		)
	}

	preparacionBorrarSerie(id?: any) {
		this.idSerie = id;
		this.confirmBorrarProducto(this.consultaFacturaSerieTranslate.deseaBorrarSerie);
	};

	borrarSerie() {
        this._pantallaServicio.mostrarSpinner();
		let params: any = {};
		params.idSerie = this.idSerie;

		this._backService.HttpPost('catalogos/factura/eliminarFacturaSeries', {}, params).subscribe(
			response => {
				// this.facturaSeries.data = eval(response);
				// $("body").css("overflow-y", "auto");
				// for (let i = 0; i < this.facturaSeries.data.length; i++) {
				// 	this.facturaSeries.data[i].contador = this.facturaSeries.data[i].contador == '0' ? '1' : this.facturaSeries.data[i].contador;
				// 	this.facturaSeries.data[i].minimo = this.facturaSeries.data[i].minimo == null ? "1" : this.facturaSeries.data[i].minimo;
				// 	this.facturaSeries.data[i].maximo = this.facturaSeries.data[i].maximo == null ? "100000" : this.facturaSeries.data[i].maximo;
				// }
				// this.facturaSeries.altura = this.facturaSeries.data.length * 30 + 45;
				// this.dataSource.data = this.facturaSeries.data;
				
                this._pantallaServicio.ocultarSpinner();
				this.dataConsulta();
			},
			error => {
				this._pantallaServicio.ocultarSpinner();
				if (error === 'SinSesion' || error === 'SesionCaducada') {
					if (error === 'SinSesion') {
						this._toaster.error(this.sessionTraslate.favorIniciarSesion);
					}
					if (error === 'SesionCaducada') {
						this._toaster.error(this.sessionTraslate.sesionCaducada);
					}
					this._router.navigate(['/login']);
				}
			}
		);
	};

	confirmBorrarProducto(message?: any) {
		this.modales.modalConfirmBorrarSerie.show();
		this.messageModal = message;
	}

	nuevaSerie() {
		this._router.navigate(['facturacion/facturaSerie'], {
			queryParams: {
				idFactura: 'N'
			}
		})
	}

	editarSerie(row?: any) {
		this._router.navigate(['facturacion/facturaSerie'], {
			queryParams: {
				idFactura: row
			}
		})
	}

	// Crear modales
	crearModales() {
		if ($('body').find('.modalConfirmBorrarSerie').length > 1) {
			$('body').find('.modalConfirmBorrarSerie')[1].remove();
		}

		this.modales.modalConfirmBorrarSerie = new bootstrap.Modal(
			$('#modalConfirmBorrarSerie').appendTo('body'),
			{
				backdrop: 'static',
				keyboard: false,
			}
		);
	}
}
