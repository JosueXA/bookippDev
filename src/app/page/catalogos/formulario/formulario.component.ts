import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import * as bootstrap from 'bootstrap'; // BOOTSTRAP
import { Console } from 'console';
import { param } from 'jquery';
declare var $: any; // JQUERY
import { MethodsService } from 'src/app/core/services/methods.service';
import { PantallaService } from 'src/app/core/services/pantalla.service';
import { ToasterService } from 'src/shared/toaster/toaster.service';


@Component({
  selector: 'app-formulario',
  templateUrl: './formulario.component.html',
  styleUrls: ['./formulario.component.scss', '../../page.component.scss'],
})



export class FormularioComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['acciones', 'nombreFormulario', 'nombreSucursal', 'fechaAlta'];
  msg_modalConfirmEliminar: any = "";

  modales: any = {};

  secciones: any = [];
  campos: any = [];
  formularios: any = [];
  campos_detalle_om: any = [];
  campos_detalle_ld: any = [];
  campos_detalle_check: any = [];
  param: any = [];
  idFormulario: number = 0;

  permisos: any = {};


  constructor(
    private _router: Router,
    private _translate: TranslateService,
    public _pantallaServicio: PantallaService,
    private matIconRegistry: MatIconRegistry,
    private _toaster: ToasterService,
    private domSanitizer: DomSanitizer,
    private _route: ActivatedRoute,
    private _backService: MethodsService) {

    this._translate.setDefaultLang(this._pantallaServicio.idioma);
    this._translate.use(this._pantallaServicio.idioma);
    this.matIconRegistry.addSvgIcon('iconFlecha1DerechaPeque', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/FlechaDerechaPequena-icon.svg"));
    this.matIconRegistry.addSvgIcon('iconEditar', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Editar-icon.svg"));
    this.matIconRegistry.addSvgIcon('iconBasura', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Basura-icon.svg"));
    this.matIconRegistry.addSvgIcon('iconAgregar', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Agregar-1-icon.svg"));
    this.matIconRegistry.addSvgIcon('iconList', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/13-list-icon.svg"));
    this.matIconRegistry.addSvgIcon('iconText', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/14-Text-icon.svg"));
    this.matIconRegistry.addSvgIcon('iconSection', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/15-Section-icon.svg"));
    this.matIconRegistry.addSvgIcon('iconSelect', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/16-Select-icon.svg"));
    this.matIconRegistry.addSvgIcon('IconFormulario', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/images/assets/Formulario.png"));

    this.matIconRegistry.addSvgIcon('iconCasa1', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Casa1-icon.svg"));
    this.matIconRegistry.addSvgIcon('iconCopy', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/iconCopy.svg"));


  }

  ngOnInit(): void {
    this.crearModales();

    // Permiso Acciones
    if (Object.prototype.hasOwnProperty.call(this._pantallaServicio.session, 'FORMS002')) {
      if (this._pantallaServicio.session['FORMS002'] === '1' || this._pantallaServicio.session['FORMS002'] === 'True') {
        this.permisos.acciones = true;
      } else {
        this.permisos.acciones = false;
      }
    } else {
      this.permisos.acciones = false;
    }

    // Permiso Acciones
    if (Object.prototype.hasOwnProperty.call(this._pantallaServicio.session, 'FORMS002')) {
      if (this._pantallaServicio.session['FORMS002'] === '1' || this._pantallaServicio.session['FORMS002'] === 'True') {
        this.permisos.acciones = true;
      } else {
        this.permisos.acciones = false;
      }
    } else {
      this.permisos.acciones = false;
    }

    this._INIT();
  }

  borrar_formulario(element: any) {
    this.idFormulario = element.idFormulario;
    this.confirm('BORRAR-¿Deseas borrar el formulario?');
  }



  copiarFormulario(element: any) {
    this.idFormulario = element.idFormulario;
    this.confirm('COPIAR-¿Deseas copiar el formulario?');
  }

  crearModales() {
    if ($('body').find('.modal-confirmEliminar').length > 1) {
      $('body').find('.modal-confirmEliminar')[1].remove();
    }
    this.modales.modalConfirmEliminar = new bootstrap.Modal($("#modal-confirmEliminar").appendTo("body"), {
      backdrop: "static",
      keyboard: false,
    });
  }

  AgregarNuevoFormulario() {
    this._router.navigate([`catalogos/formulario/nuevo`]);
  }

  EditarFormulario(idFormulario: number){
    if(this.permisos.acciones){
      this._router.navigate([`catalogos/formulario/actualizar/${idFormulario}`]);
    }
  }

  private _INIT(): void {
    this._pantallaServicio.mostrarSpinner();
    this._backService.HttpPost('catalogos/Formulario/getListFormularios', {}, {}).subscribe({
      next: (response: any) => {
        this.formularios = response;
        this._pantallaServicio.ocultarSpinner();
      },
      error: (err: any) => {
        this._pantallaServicio.ocultarSpinner();
      }
    });
  }

  confirmarAcccion() {
    switch(this.type) {
      case 'BORRAR': {
        this._pantallaServicio.mostrarSpinner();
        this._backService.HttpPost('catalogos/Formulario/bajaFormulario', {}, { idFormulario: this.idFormulario }).subscribe({
          next: (response: any) => {
            this.formularios = this.formularios.filter((a: any) => a.idFormulario !== this.idFormulario);
            // console.log(this.formularios.findIndex((a: any) => a.idFormulario === this.idFormulario));
            // this.formularios.find((a: any) => a.idFormulario === this.idFormulario).esEditable = false;
            this.idFormulario = 0;
            this._pantallaServicio.ocultarSpinner();
          },
          error: (error: any) => {
            this.idFormulario = 0
            this._pantallaServicio.ocultarSpinner();
          },
          complete: () => {
            this._pantallaServicio.ocultarSpinner();
            this.idFormulario = 0;
          }
        });
        break;
      }
      case 'COPIAR': {
        this._pantallaServicio.mostrarSpinner();
        this._backService.HttpPost('catalogos/Formulario/copiarFormulario', {}, {idFormulario: this.idFormulario}).subscribe({
          next: (response: any)=> {
            this.formularios.push(response[0]);
            this._pantallaServicio.ocultarSpinner();

          },
          error:(error: any) => {
            this._pantallaServicio.ocultarSpinner();
          }
        });
        break;
      }
      default: {


      }

    }

  }
  type: string = 'BORRAR'|| 'COPIAR';
  confirm(message: any) {
    const mesgSplit = message.split('-')
    this.type = mesgSplit[0];
    if (this.idFormulario > 0) {
      this.modales.modalConfirmEliminar.show();
      this.msg_modalConfirmEliminar = mesgSplit[1];
    }
  };


  ngAfterViewInit(): void {
    // this.paginator._intl.itemsPerPageLabel = 'Filas por página';
    // this.dataSource.paginator = this.paginator;
    // this.dataSource.sort = this.sort;
  }


  // onInit() {
  //   this._route.queryParams.subscribe(params => {
  //     this.param = params["param"]?.split(',');
  //     if (this.param?.length > 0) {
  //       this.idFormularo = this.param[0];
  //       return;
  //     }
  //   },
  //     error => {
  //       this._toaster.error("Ha ocurrido un error");
  //     });

  //   this._pantallaServicio.mostrarSpinner();

  //   var params: any = { idFormulario: this.idFormularo };

  //   this._backService.HttpPost("catalogos/Formulario/consultaFormulario", {}, params).subscribe((response: any) => {

  //     this.formularios = response.Formularios;
  //     this.secciones = response.Secciones;
  //     this.campos = response.Campos;
  //     this.campos_detalle_check = response.OpcionesCheck;
  //     this.campos_detalle_om = response.Opciones;
  //     this.campos_detalle_ld = response.Listas;

  //     console.log(this.campos_detalle_om)

  //     this._pantallaServicio.ocultarSpinner();
  //   }, error => {
  //     this._toaster.error("Ha ocurrido un error");
  //     this._pantallaServicio.ocultarSpinner();
  //   });
  // }





  /*
    ngAfterViewInit(): void {
      setTimeout(() => {
        this._pantallaServicio.ocultarSpinner();
      }, 1000);
    }*/

  compararLista(data: any) {
    console.log(data);

  }

  lista(data: any) {

  }


}

