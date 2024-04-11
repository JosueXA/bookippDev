import { AfterContentInit, AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DataFormularios, Formulario, FormularioElemento, FormularioOpcion, FormularioSeccion, TipoElemento } from '../update-formulario/formulario-model';
import { Router } from '@angular/router';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import * as bootstrap from 'bootstrap'; // BOOTSTRAP
import { param } from 'jquery';

import {CdkDragDrop, CdkDropList, CdkDrag, moveItemInArray} from '@angular/cdk/drag-drop';
import { MethodsService } from 'src/app/core/services/methods.service';
import { PantallaService } from 'src/app/core/services/pantalla.service';
import { ToasterService } from 'src/shared/toaster/toaster.service';
import { NgSignaturePadOptions, SignaturePadComponent } from '@almothafar/angular-signature-pad';
declare var $: any; // JQUERY

@Component({
  selector: 'app-nuevo-formulario',
  templateUrl: './nuevo-formulario.component.html',
  styleUrls: ['./nuevo-formulario.component.scss']
})
export class NuevoFormularioComponent implements OnInit, AfterContentInit, AfterViewInit {
  msg_modalConfirmEliminar: any = "";
  public signaturePadOptions: NgSignaturePadOptions = {
    minWidth: 5,
    canvasWidth: 350,
    canvasHeight: 170
  };

  @ViewChild('signature')
  public signaturePad: SignaturePadComponent;
  @ViewChild('canvas', { static: true }) canvasEl!: ElementRef;
  CLICK_BTN_OK_MODAL: Boolean = false;
  modales: any = {};
  formularioSeccionOpciones: any = [];
  tipoElementos: TipoElemento[] = [];
  formulario_opcion: FormularioOpcion[] = [];
  formulario: Formulario = new Formulario('');
  formuLarioElemento: FormularioElemento = {
    idFormularioElemento: -1,
    descripcion: '',
    idTipoElementoFormulario: -1,
    orden: 1,
    esRequerido: 1,
    idFormularioSeccion: -1,
    formularioOpcion: [] as FormularioOpcion[],
    imagenPath: ''
  };
  formularioSeccion: FormularioSeccion = new FormularioSeccion();

  data: DataFormularios = new DataFormularios({
    formulario: new Formulario(),
    formularioSeccion: []
  });
  constructor(
    private _router: Router,
    private _backService: MethodsService,
    private _toaster: ToasterService,
    public _pantallaServicio: PantallaService,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
  ) {
    this.matIconRegistry.addSvgIcon('iconCasa1', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Casa1-icon.svg"));

    this.matIconRegistry.addSvgIcon('iconFlecha1DerechaPeque', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/FlechaDerechaPequena-icon.svg"));
    this.matIconRegistry.addSvgIcon('iconEditar', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Editar-icon.svg"));
    this.matIconRegistry.addSvgIcon('iconBasura', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Basura-icon.svg"));
    this.matIconRegistry.addSvgIcon('IconFlechaAbajo', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/FlechaAbajoPequena-icon.svg"));
    this.matIconRegistry.addSvgIcon('iconAgregar', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Agregar-1-icon.svg"));
    this.matIconRegistry.addSvgIcon('iconList', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/13-list-icon.svg"));
    this.matIconRegistry.addSvgIcon('iconText', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/14-Text-icon.svg"));
    this.matIconRegistry.addSvgIcon('iconSection', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/15-Section-icon.svg"));
    this.matIconRegistry.addSvgIcon('iconSelect', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/16-Select-icon.svg"));
    this.matIconRegistry.addSvgIcon('IconFormulario', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/images/assets/Formulario.png"));
    this.matIconRegistry.addSvgIcon('IconSeccion', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Menu-Hamburguesa-icon.png"));
    this.matIconRegistry.addSvgIcon('iconCerrarModal', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/10-2-TiposdeExcepcion-icon.svg"));


  }

  ngOnInit(): void {
    this.data.formulario.idFormulario = -1;
    this.data.formularioSeccion.push({
      idFormularioSeccion: 1,
      nombre: '',
      orden: 1,
      seccionDefault: 1,
      idFormulario: -1,
      formularioElemento: []
    });
    this.formularioSeccionOpciones.push({
      idFormularioSeccion: 1,
      nombre: '',
      orden: 1,
      seccionDefault: 1,
      idFormulario: -1,
      formularioElemento: []
    });
    this.crearModales();
    this._ObtenerTipoElementos();
  }

  ngAfterViewInit() {
    this.signaturePad.set('minWidth', 5);
    this.signaturePad.clear();
  }

  drawComplete(event: MouseEvent | Touch) {
    // console.log('Completed drawing', event);
    // console.log(this.signaturePad.toDataURL());
    this.formuLarioElemento.imagenPath = this.signaturePad.toDataURL();

  }

  drawStart(event: MouseEvent | Touch) {
    console.log('Start drawing', event);
  }


  resetFormulario() {
    this.formulario.nombre = '';
  }

  guardarFormulario(): void {
    this._pantallaServicio.mostrarSpinner();
    if (this.data.formulario.nombre.replace(' ', '').length === 0) {
      this._toaster.error('Favor de ponerle un nombre al Formulario');
      this._pantallaServicio.ocultarSpinner();
      return;
    }
    this._backService.HttpPost('catalogos/Formulario/registrarFormulario', {}, { formulario: this.data.formulario, formularioSeccion: this.data.formularioSeccion }).subscribe({
      next: (r) => {
        this._pantallaServicio.ocultarSpinner();
        this.redirec('formulario');
      },
      error: (ex) => {
        this._pantallaServicio.ocultarSpinner();
      }
    });
  }

  private _ObtenerTipoElementos() {
    this._backService.HttpPost('catalogos/Formulario/obtenerTipoElementos', {}, {}).subscribe({
      next: (r) => {
        this.tipoElementos = r;
      },
      error: (ex) => {

      }
    });
  }

  ngAfterContentInit(): void {

  }

  crearModales() {
    if ($('body').find('.modal-formulario').length > 1) {
      $('body').find('.modal-confirmEliminar')[1].remove();
    }
    this.modales.modalEditarFormulario = new bootstrap.Modal($("#modal-formulario").appendTo("body"), {
      backdrop: "static",
      keyboard: false,
    });

    if ($('body').find('.modal-agregar-seccion').length > 1) {
      $('body').find('.modal-confirmEliminar')[1].remove();
    }
    this.modales.modalAgregarSeccion = new bootstrap.Modal($("#modal-agregar-seccion").appendTo("body"), {
      backdrop: "static",
      keyboard: false,
    });


    if ($('body').find('.modal-editar-seccion').length > 1) {
      $('body').find('.modal-confirmEliminar')[1].remove();
    }
    this.modales.modalEditarSeccion = new bootstrap.Modal($("#modal-editar-seccion").appendTo("body"), {
      backdrop: "static",
      keyboard: false,
    });

    if ($('body').find('.modal-editar-elemento').length > 1) {
      $('body').find('.modal-confirmEliminar')[1].remove();
    }
    this.modales.modalEditarElemento = new bootstrap.Modal($("#modal-editar-elemento").appendTo("body"), {
      backdrop: "static",
      keyboard: false,
    });




    if ($('body').find('.modal-confirmAgregarElemento').length > 1) {
      $('body').find('.modal-confirmEliminar')[1].remove();
    }
    this.modales.modalAgregarElemento = new bootstrap.Modal($("#modal-confirmAgregarElemento").appendTo("body"), {
      backdrop: "static",
      keyboard: false,
    });





  }

  editarFormulario() {
    this.formulario = {
      idFormulario: -1,
      nombre: this.data.formulario.nombre ? this.formulario.nombre : '',
      idSucursal: -1,
      realizoAlta: null,
      fechaAlta: Date(),
      realizoCambio: null,
      fechaCambio: null,
      realizoBaja: null,
      fechaBaja: null
    } as Formulario;
    this.confirm('Editar Nombre Formulario', 'editar-formulario');

  }

  editarSeccion(seccion: FormularioSeccion) {
    this.formularioSeccion = {
      idFormularioSeccion: seccion.idFormularioSeccion,
      nombre: seccion.nombre,
      orden: seccion.orden,
      seccionDefault: seccion.seccionDefault,
      idFormulario: seccion.idFormulario,
      formularioElemento: [] as FormularioElemento[]
    };
    this.confirm('Editar Sección', 'editar-seccion');
  }

  eliminarSeccion(seccion: FormularioSeccion) {
    this.formularioSeccionOpciones = this.formularioSeccionOpciones.filter((a: any) => Number(a.idFormularioSeccion) !== Number(seccion.idFormularioSeccion));
    this.data.formularioSeccion = this.data.formularioSeccion.filter(a => a.idFormularioSeccion !== seccion.idFormularioSeccion);
  }

  agregarSeccion(): void {
    const lastSeccion = this.data.formularioSeccion[this.data.formularioSeccion.length - 1];

    this.formularioSeccion = {
      idFormularioSeccion: lastSeccion === undefined || lastSeccion === null ? 1 : lastSeccion.idFormularioSeccion + 3,
      nombre: '',
      orden: lastSeccion === undefined || lastSeccion === null ? 1 : lastSeccion.orden + 1,
      seccionDefault: 0,
      idFormulario: lastSeccion === undefined || lastSeccion === null ? 1 : lastSeccion.idFormulario,
      formularioElemento: [] as FormularioElemento[]
    };
    this.confirm('Nueva Sección', 'agregar-seccion');
  }

  drop(event: CdkDragDrop<any>, seccion: any) {
    // console.log(event);
    moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    this._reordenarTodosElementos();
    // console.log(this.data.formularioSeccion);
    // moveItemInArray(seccion.formularioElemento, event.previousIndex, event.currentIndex);
  }


  dropSeccion(event: CdkDragDrop<any>) {
    if(event.currentIndex > 0) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      this._reordenarTodosElementos();
    }
    console.log(event.previousIndex, event.currentIndex);
    // if(isSeccionDefault === 0) {
    //
    //
    // }

  }



  private _ObtenerNuevoIdFormularioElemento(): number[] {
    let result: number[] = [];
    for (let seccion of this.data.formularioSeccion) {
      for (let elemento of seccion.formularioElemento) {
        result.push(elemento.idFormularioElemento);
      }
    }
    return result;
  }

  agregarElementoNuevoElemento() {
    const seccionDefault = this.data.formularioSeccion.find(a => a.seccionDefault === 1);
    const arrIds: number[] = this._ObtenerNuevoIdFormularioElemento();
    const nextId: number = arrIds.length === 0 ? 1 : Math.max(...arrIds) + 1;
    if (seccionDefault?.formularioElemento?.length !== 0 && seccionDefault?.formularioElemento?.length !== undefined) {

      this.formuLarioElemento = {
        idFormularioElemento: nextId,
        descripcion: '',
        idTipoElementoFormulario: -1,
        orden: seccionDefault.formularioElemento.length,
        esRequerido: 1,
        idFormularioSeccion: seccionDefault ? seccionDefault.idFormularioSeccion : 562,
        formularioOpcion: [] as FormularioOpcion[],
        imagenPath: ''
      };
    } else {

      this.formuLarioElemento = {
        idFormularioElemento: nextId,
        descripcion: '',
        idTipoElementoFormulario: -1,
        orden: 1,
        esRequerido: 1,
        idFormularioSeccion: seccionDefault ? seccionDefault.idFormularioSeccion : 562,
        formularioOpcion: [] as FormularioOpcion[],
        imagenPath: ''
      };
    }

    this.confirm('Nuevo Elemento', 'agregar-elemento');
  }

  editarElemento(elemento: FormularioElemento): void {
    this.formuLarioElemento = {
      idFormularioElemento: elemento.idFormularioElemento,
      lastSeccionId: Number(elemento.idFormularioSeccion),
      descripcion: elemento.descripcion,
      idTipoElementoFormulario: elemento.idTipoElementoFormulario,
      orden: elemento.orden,
      esRequerido: elemento.esRequerido,
      idFormularioSeccion: Number(elemento.idFormularioSeccion),
      formularioOpcion: [] as FormularioOpcion[],
      imagenPath: ''
    };
    for (let i = 0; i < elemento.formularioOpcion.length; i++) {
      const currentOpcion = elemento.formularioOpcion[i];
      this.formuLarioElemento.formularioOpcion.push({
        idFormularioOpcion: currentOpcion.idFormularioOpcion,
        descripcion: currentOpcion.descripcion,
        orden: currentOpcion.orden,
        idFormularioElemento: currentOpcion.idFormularioElemento
      });
    }
    this.confirm('Editar Elemento', 'editar-elemento');
  }

  eliminarElemento(elemento: FormularioElemento): void {
    const indexSeccion: number = this.data.formularioSeccion.findIndex(a => Number(a.idFormularioSeccion) === Number(elemento.idFormularioSeccion));
    if (elemento.idFormularioElemento === -1) {
      this.data.formularioSeccion[indexSeccion].formularioElemento = this.data.formularioSeccion[indexSeccion].formularioElemento.filter(a => Number(a.idFormularioElemento) !== Number(elemento.idFormularioElemento) && Number(a.orden) !== Number(elemento.orden));
      this._reordenarElementos(this.data.formularioSeccion[indexSeccion].idFormularioSeccion);
    } else {
      this.data.formularioSeccion[indexSeccion].formularioElemento = this.data.formularioSeccion[indexSeccion].formularioElemento.filter(a => Number(a.idFormularioElemento) !== Number(elemento.idFormularioElemento));
      this._reordenarElementos(this.data.formularioSeccion[indexSeccion].idFormularioSeccion);
    }

  }


  agregarOpciones() {
    const lengthOpcion = this.formuLarioElemento.formularioOpcion.length;
    if (lengthOpcion > 0) {
      if (this.formuLarioElemento.formularioOpcion[lengthOpcion - 1].descripcion.replace(' ', '').length === 0) {
      } else {
        const orden = this.formuLarioElemento.formularioOpcion.length + 1;
        const opcion = {
          idFormularioOpcion: -1,
          descripcion: '',
          orden: orden,
          idFormularioElemento: this.formuLarioElemento.idFormularioElemento
        };
        this.formuLarioElemento.formularioOpcion.push(opcion);
      }
    } else {
      if (lengthOpcion === 0) {
        const orden = this.formuLarioElemento.formularioOpcion.length + 1;
        const opcion = {
          idFormularioOpcion: -1,
          descripcion: '',
          orden: orden,
          idFormularioElemento: this.formuLarioElemento.idFormularioElemento
        };
        this.formuLarioElemento.formularioOpcion.push(opcion);
      } else {
        if (this.formuLarioElemento.formularioOpcion[0].descripcion.replace(' ', '').length === 0) {
        } else {
          const orden = this.formuLarioElemento.formularioOpcion.length + 1;
          const opcion = {
            idFormularioOpcion: -1,
            descripcion: '',
            orden: orden,
            idFormularioElemento: this.formuLarioElemento.idFormularioElemento
          };
          this.formuLarioElemento.formularioOpcion.push(opcion);
        }
      }
    }
  }


  borrarOpcion(index: number) {
    this.formuLarioElemento.formularioOpcion = this.formuLarioElemento.formularioOpcion.filter(a => a.orden !== index + 1);
    for (let i = 0; i < this.formuLarioElemento.formularioOpcion.length; i++) {
      this.formuLarioElemento.formularioOpcion[i].orden = i + 1;
    }
  }


  selectTipoELemento(event: any) {
    const idTipoElementoFormulario = Number(event.target.value);
    const tipoELemento = this.tipoElementos.find(a => a.idTipoElementoFormulario === idTipoElementoFormulario);
    this.formuLarioElemento.idTipoElementoFormulario = idTipoElementoFormulario;
    this.formuLarioElemento.formularioTipoElemento = tipoELemento;
    this.formuLarioElemento.formularioOpcion = [];
    this.formuLarioElemento.descripcion = ``;
    if (idTipoElementoFormulario === 1 || idTipoElementoFormulario === 2 || idTipoElementoFormulario === 4) {
      this.formuLarioElemento.formularioOpcion.push({
        idFormularioOpcion: 1,
        descripcion: '',
        orden: 1,
        idFormularioElemento: this.formuLarioElemento.idFormularioElemento
      });
    }


  }






  changeSeccionElement(event: any, esNuevo: boolean) {

    const idFormularioSeccion = Number(event.target.value);
    // const indexSeccion = this.data.formularioSeccion.findIndex(a => Number(a.idFormularioSeccion) === Number(idFormularioSeccion));
    this.formuLarioElemento.idFormularioSeccion = idFormularioSeccion;






    // const idFormularioSeccion = Number(event.target.value);
    // // this.formuLarioElemento.idFormularioSeccion = idFormularioSeccion;
    // const indexSeccion = this.data.formularioSeccion.findIndex(a => Number(a.idFormularioSeccion) === Number(idFormularioSeccion));

    // const formularioSeccion = this.data.formularioSeccion[indexSeccion];
    // let lastIndex = this.data.formularioSeccion.findIndex(a => a.idFormularioSeccion === this.formuLarioElemento.lastSeccionId);
    // let lastElemento = this.data.formularioSeccion[lastIndex].formularioElemento.filter(a => Number(a.idFormularioElemento) === Number(this.formuLarioElemento.idFormularioElemento))[0];
    // if(esNuevo === true) {
    //   const newId = formularioSeccion.formularioElemento.length > 0 ? formularioSeccion.formularioElemento[formularioSeccion.formularioElemento.length - 1].idFormularioElemento + 33 : 598;

    //   this.formuLarioElemento.idFormularioElemento = newId;
    //   lastElemento.idFormularioElemento = newId;
    // }

    // this.formuLarioElemento.orden = formularioSeccion?.formularioElemento ? formularioSeccion.formularioElemento.length + 1 : 1;
  }


  confirm(message: any, tipoModal: 'agregar-elemento' | 'editar-elemento' | 'editar-formulario' | 'agregar-seccion' | 'agregar-nuevo-elemento' | 'editar-seccion') {
    this.msg_modalConfirmEliminar = message;
    this.CLICK_BTN_OK_MODAL = false;
    switch (tipoModal) {
      case 'agregar-elemento': {
        this.modales.modalAgregarElemento.show();
        break;
      }
      case 'editar-elemento': {
        this.modales.modalEditarElemento.show();
        break;
      }
      case 'editar-formulario': {
        this.modales.modalEditarFormulario.show();
        break;
      }
      case 'agregar-seccion': {
        this.modales.modalAgregarSeccion.show();
        break;
      }
      case 'editar-seccion': {
        this.modales.modalEditarSeccion.show();
        break;
      }
    }
  };



  private _reordenarTodosElementos() {
    for (let ISeccion = 0; ISeccion < this.data.formularioSeccion.length; ISeccion++) {
      this.data.formularioSeccion[ISeccion].orden = ISeccion + 1;
      for (let IElemento = 0; IElemento < this.data.formularioSeccion[ISeccion].formularioElemento.length; IElemento++) {
        this.data.formularioSeccion[ISeccion].formularioElemento[IElemento].orden = IElemento + 1;
      }
    }
  }


  confirmarAcccion(actionType: 'FORMULARIO' | 'AGREGAR-SECCION' | 'AGREGAR-ELEMENTO' | 'EDITAR-SECCION' | 'EDITAR-ELEMENTO') {
    this.CLICK_BTN_OK_MODAL = true;
    switch (actionType) {
      case 'FORMULARIO': {
        if (this.formulario.nombre.length > 0) {
          this.data.formulario.nombre = this.formulario.nombre;
          this.modales.modalEditarFormulario.hide();
        } else {
          return;
        }
        break;
      }
      case 'AGREGAR-SECCION': {
        this.CLICK_BTN_OK_MODAL = true;
        let secciones = this.data.formularioSeccion;
        secciones.push(this.formularioSeccion);
        this.data.formularioSeccion = secciones;
        this.formularioSeccionOpciones.push(this.formularioSeccion);
        this._RESETFORMULARIOSECCION();
        this.modales.modalAgregarSeccion.hide();
        this.CLICK_BTN_OK_MODAL = false;
        break;
      }
      case 'AGREGAR-ELEMENTO': {
        this.CLICK_BTN_OK_MODAL = true;
        this.formuLarioElemento.lastSeccionId = this.formuLarioElemento.idFormularioElemento;
        if (this._ValidarElemento() === true) {
          let indexSeccion = this.data.formularioSeccion.findIndex(a => Number(a.idFormularioSeccion) === Number(this.formuLarioElemento.idFormularioSeccion));

          if (indexSeccion === - 1) {
            let seccionDefaultIndex = this.data.formularioSeccion.findIndex(a => a.seccionDefault === 1);
            if (seccionDefaultIndex === -1) {
              this.data.formularioSeccion.push({
                idFormularioSeccion: -1,
                nombre: '',
                orden: 1,
                seccionDefault: 1,
                idFormulario: this.data.formulario.idFormulario,
                formularioElemento: [this.formuLarioElemento]
              });
              this._reordenarTodosElementos();
            } else {
              this.data.formularioSeccion[seccionDefaultIndex].formularioElemento.push(this.formuLarioElemento);
              this._reordenarTodosElementos();
            }
          } else {

            const insertElement = {
              idFormularioElemento: Number(this.formuLarioElemento.idFormularioElemento),
              descripcion: this.formuLarioElemento.descripcion,
              idTipoElementoFormulario: Number(this.formuLarioElemento.idTipoElementoFormulario),
              orden: Number(this.formuLarioElemento.orden),
              esRequerido: Number(this.formuLarioElemento.esRequerido),
              idFormularioSeccion: Number(this.formuLarioElemento.idFormularioSeccion),
              formularioOpcion: this.formuLarioElemento.formularioOpcion,
              imagenPath: ''
            };
            this.data.formularioSeccion[indexSeccion].formularioElemento.push(insertElement);

            this._reordenarTodosElementos();
          }

          this.modales.modalAgregarElemento.hide();

          this.CLICK_BTN_OK_MODAL = false;
          this._RESETFORMULARIOELEMENTO();
        }


        //
        break;
      }
      case 'EDITAR-SECCION': {
        this.CLICK_BTN_OK_MODAL = true;
        const indexSeccion = this.data.formularioSeccion.findIndex(a => Number(a.idFormularioSeccion) === Number(this.formularioSeccion.idFormularioSeccion));
        this.data.formularioSeccion[indexSeccion].nombre = this.formularioSeccion.nombre;
        this._RESETFORMULARIOSECCION();
        this.modales.modalEditarSeccion.hide();
        break;
      }
      case 'EDITAR-ELEMENTO': {
        this.CLICK_BTN_OK_MODAL = true;
        if (this._ValidarElemento()) {
          if (Number(this.formuLarioElemento.idFormularioSeccion) !== Number(this.formuLarioElemento.lastSeccionId)) {
            const indexSeccionM = this.data.formularioSeccion.findIndex(a => Number(a.idFormularioSeccion) === Number(this.formuLarioElemento.idFormularioSeccion));

            this.data.formularioSeccion[indexSeccionM].formularioElemento.push(this.formuLarioElemento);

            const lastIndexSeccion = this.data.formularioSeccion.findIndex(a => Number(a.idFormularioSeccion) === Number(this.formuLarioElemento.lastSeccionId));
            console.log(lastIndexSeccion);
            console.log(this.data.formularioSeccion[lastIndexSeccion].formularioElemento);
            const lastElements = this.data.formularioSeccion[lastIndexSeccion].formularioElemento.filter(a => Number(a.idFormularioElemento) !== Number(this.formuLarioElemento.idFormularioElemento));
            console.log(lastElements);
            this.data.formularioSeccion[lastIndexSeccion].formularioElemento = lastElements;

            this._reordenarTodosElementos();
            this._RESETFORMULARIOOPCION();

            this.modales.modalEditarElemento.hide();
            this.CLICK_BTN_OK_MODAL = false;

          } else {
            const indexSeccion = this.data.formularioSeccion.findIndex(a => Number(a.idFormularioSeccion) === Number(this.formuLarioElemento.lastSeccionId));
            // if(this.data.formularioSeccion[indexSeccion].formularioElemento.length <= 1) {
            //   this._toaster.error('La seccion no se puede quedar sin elementos');
            //   return;
            // }
            const indexElemento = this.data.formularioSeccion[indexSeccion].formularioElemento.findIndex(a => Number(a.idFormularioElemento) === Number(this.formuLarioElemento.idFormularioElemento));
            this.data.formularioSeccion[indexSeccion].formularioElemento[indexElemento].idTipoElementoFormulario = this.formuLarioElemento.idTipoElementoFormulario;
            this.data.formularioSeccion[indexSeccion].formularioElemento[indexElemento].descripcion = this.formuLarioElemento.descripcion;
            this.data.formularioSeccion[indexSeccion].formularioElemento[indexElemento].esRequerido = this.formuLarioElemento.esRequerido;
            this.data.formularioSeccion[indexSeccion].formularioElemento[indexElemento].formularioOpcion = this.formuLarioElemento.formularioOpcion;
            this.data.formularioSeccion[indexSeccion].formularioElemento[indexElemento].idFormularioSeccion = this.formuLarioElemento.idFormularioSeccion;

            this._reordenarTodosElementos();
            this._RESETFORMULARIOOPCION();

            this.modales.modalEditarElemento.hide();
            this.CLICK_BTN_OK_MODAL = false;
          }
        }

        break;
      }

    }

  }

  redirec(path: string) {
    switch (path) {
      case "formulario": {
        this._router.navigate([`catalogos/formulario`]);
        break;
      }
    }

  }

  startDrawing(event: Event) {
    // works in device not in browser
  }

  clearPad() {
    // this.signaturePad.clear();
  }

  private _reordenarElementos(idFormularioSeccion: number): void {
    const indexSeccion = this.data.formularioSeccion.findIndex(a => Number(a.idFormularioSeccion) === Number(idFormularioSeccion));
    if (indexSeccion === -1) return;
    const lengthElementos = this.data.formularioSeccion[indexSeccion].formularioElemento.length;
    for (let i = 0; i < lengthElementos; i++) {
      this.data.formularioSeccion[indexSeccion].formularioElemento[i].orden = i + 1;
    }
  }


  private _ValidarElementosOpciones(): boolean {
    if (this.formuLarioElemento.idTipoElementoFormulario <= 0) {
      // this._toaster.error('se debe seleccionar un tipo de elemento');
      return false;
    }
    if (this.formuLarioElemento.idTipoElementoFormulario === 1 || this.formuLarioElemento.idTipoElementoFormulario === 2 || this.formuLarioElemento.idTipoElementoFormulario === 4) {
      if (this.formuLarioElemento.formularioOpcion.length === 0) {
        // this._toaster.error('no contiene opciones');
        return false;
      } else {
        for (let a of this.formuLarioElemento.formularioOpcion) {
          if (a.descripcion.replace(' ', '').length === 0) {
            // this._toaster.error('uno o mas campos estan vacios');
            return false;
          }
        }
      }
      return true;
    } else {
      return true;
    }
  }


  private _ValidarElemento(): boolean {
    switch (this.formuLarioElemento.idTipoElementoFormulario) {
      case 1: {
        return this.formuLarioElemento.descripcion.length > 0 && this._ValidarElementosOpciones();
      } case 2: {
        return this.formuLarioElemento.descripcion.length > 0 && this._ValidarElementosOpciones();
      } case 4: {
        return this.formuLarioElemento.descripcion.length > 0 && this._ValidarElementosOpciones();
      } case 5: {
        return this.formuLarioElemento?.descripcion?.length > 0;
      } case 3: {
        return this.formuLarioElemento?.descripcion?.length > 0;
      } case 6: {
        this.formuLarioElemento.descripcion = '';
        return true;
      } case 7: {
        return true;
      } case 8: {
        return true;
      }
      default:
        return false;
    }
  }

  _RESETFORMULARIOSECCION() {
    this.formularioSeccion = {
      idFormularioSeccion: -1,
      nombre: '',
      orden: -1,
      seccionDefault: 0,
      idFormulario: -1,
      formularioElemento: [] as FormularioElemento[]
    };
  }

  _RESETFORMULARIOOPCION(): void {
    this.formuLarioElemento = {
      idFormularioElemento: -1,
      descripcion: '',
      idTipoElementoFormulario: -1,
      orden: 1,
      esRequerido: 1,
      idFormularioSeccion: -1,
      formularioOpcion: [] as FormularioOpcion[],
      imagenPath: ''
    };
  }


  _RESETFORMULARIOELEMENTO() {
    this.formuLarioElemento = {
      idFormularioElemento: 1,
      descripcion: '',
      idTipoElementoFormulario: -1,
      orden: 1,
      esRequerido: 1,
      idFormularioSeccion: -1,
      formularioOpcion: [] as FormularioOpcion[],
      imagenPath: ''
    };
  }

}
