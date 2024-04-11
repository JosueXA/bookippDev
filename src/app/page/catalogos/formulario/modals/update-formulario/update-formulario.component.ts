import { AfterContentChecked, AfterContentInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { MethodsService } from 'src/app/core/services/methods.service';
import { PantallaService } from 'src/app/core/services/pantalla.service';
import { DataFormularios, Formulario, FormularioElemento, FormularioOpcion, FormularioSeccion, TipoElemento } from './formulario-model';
import { TranslateService } from '@ngx-translate/core';
import * as bootstrap from 'bootstrap'; // BOOTSTRAP
import { param } from 'jquery';
import {CdkDragDrop, CdkDropList, CdkDrag, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ToasterService } from 'src/shared/toaster/toaster.service';
import { NgSignaturePadOptions, SignaturePadComponent } from '@almothafar/angular-signature-pad';
declare var $: any; // JQUERY

@Component({
  selector: 'app-update-formulario',
  templateUrl: './update-formulario.component.html',
  styleUrls: ['./update-formulario.component.scss']
})
export class UpdateFormularioComponent implements OnInit, AfterContentInit, AfterContentChecked {
  msg_modalConfirmEliminar: any = "";
  public signaturePadOptions: NgSignaturePadOptions = {
    minWidth: 5,
    canvasWidth: 350,
    canvasHeight: 170
  };

  @ViewChild('signature')
  public signaturePad: SignaturePadComponent;
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


  data: DataFormularios = new DataFormularios();
  datosFormularios: any;
  constructor(

    private _router: Router,
    // private _toaster: ToasterService,
    private _translate: TranslateService,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private _backService: MethodsService,
    private _activatedRoute: ActivatedRoute,
    public _pantallaServicio: PantallaService,
    private _toaster: ToasterService,
  ) {

    this._translate.setDefaultLang(this._pantallaServicio.idioma);
    this._translate.use(this._pantallaServicio.idioma);
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
  ngAfterContentChecked(): void {
  }

  ngAfterContentInit(): void {
    this.crearModales();

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



  subirSeccion(seccion: FormularioSeccion, indexSeccion: number): void {
    if (indexSeccion === 0) {
      let currentOrden = seccion.orden;
      let newOrden = this.data.formularioSeccion.length;
      let currenSeccion = this.data.formularioSeccion[indexSeccion];
      currenSeccion.orden = newOrden;
      let ownerSeccion = this.data.formularioSeccion[this.data.formularioSeccion.length - 1];
      ownerSeccion.orden = currentOrden;
      this.data.formularioSeccion[indexSeccion] = ownerSeccion;
      this.data.formularioSeccion[this.data.formularioSeccion.length - 1] = currenSeccion;
    }



  }

  selectTipoELemento(event: any) {
    const idTipoElementoFormulario = Number(event.target.value);
    const tipoELemento = this.tipoElementos.find(a => a.idTipoElementoFormulario === idTipoElementoFormulario);
    this.formuLarioElemento.idTipoElementoFormulario = idTipoElementoFormulario;
    this.formuLarioElemento.formularioTipoElemento = tipoELemento;
    this.formuLarioElemento.formularioOpcion = [];
    this.formuLarioElemento.descripcion = '';
    if (idTipoElementoFormulario === 1 || idTipoElementoFormulario === 2 || idTipoElementoFormulario === 4) {
      this.formuLarioElemento.formularioOpcion.push({
        idFormularioOpcion: 1,
        descripcion: '',
        orden: 1,
        idFormularioElemento: this.formuLarioElemento.idFormularioElemento
      });
    }


  }

  ngOnInit(): void {

    this._pantallaServicio.mostrarSpinner();
    setTimeout(() => {
      this._activatedRoute.queryParams.subscribe({
        next: (params: any) => {
          const idFormulario = this._activatedRoute.snapshot.paramMap.get('id');
          this._GETFormulario(idFormulario);
        }
      });
    }, 2000);

  }






  agregarSeccion(): void {
    const lastSeccion = this.data.formularioSeccion[this.data.formularioSeccion.length - 1];
    this.formularioSeccion = {
      idFormularioSeccion: lastSeccion.idFormularioSeccion + 3,
      nombre: '',
      orden: lastSeccion.orden + 1,
      seccionDefault: 0,
      idFormulario: lastSeccion.idFormulario,
      formularioElemento: [] as FormularioElemento[]
    };
    this.confirm('Nueva Sección', 'agregar-seccion');
  }


  editarFormulario(formulario: Formulario): void {
    this.formulario = {
      idFormulario: formulario.idFormulario,
      nombre: formulario.nombre,
      idSucursal: formulario.idSucursal,
      realizoAlta: formulario.realizoAlta,
      fechaAlta: formulario.fechaAlta,
      realizoCambio: formulario.realizoCambio,
      fechaCambio: formulario.fechaCambio,
      realizoBaja: formulario.realizoBaja,
      fechaBaja: formulario.fechaBaja
    } as Formulario;
    this.confirm('Editar Nombre Formulario', 'editar-formulario');
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

  agregarOpciones() {
    const lengthOpcion = this.formuLarioElemento.formularioOpcion.length;
    if (lengthOpcion > 0) {
      if (this.formuLarioElemento.formularioOpcion[lengthOpcion - 1].descripcion.replace(' ', '').length === 0) {
        // this._toaster.error('Revice el nombre de la opcion');
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
          // this._toaster.error('Revise el nombre de la opcion');
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
    // this.formuLarioElemento = seccion.formularioElemento;
  }

  private _reordenarSecciones(): void {
    for (let i = 0; this.data.formularioSeccion.length; i++) {
      this.data.formularioSeccion[i].orden = i + 1;
    }
  }

  // private _reordenarElementos(idFormularioSeccion: number): void {
  //   const indexSeccion = this.data.formularioSeccion.findIndex(a => Number(a.idFormularioSeccion) === Number(idFormularioSeccion));
  //   if (indexSeccion === -1) return;
  //   const lengthElementos = this.data.formularioSeccion[indexSeccion].formularioElemento.length;
  //   for (let i = 0; i < lengthElementos; i++) {
  //     this.data.formularioSeccion[indexSeccion].formularioElemento[i].orden = i + 1;
  //   }
  // }


  private _reordenarTodosElementos() {
    for (let ISeccion = 0; ISeccion < this.data.formularioSeccion.length; ISeccion++) {
      this.data.formularioSeccion[ISeccion].orden = ISeccion + 1;
      for (let IElemento = 0; IElemento < this.data.formularioSeccion[ISeccion].formularioElemento.length; IElemento++) {
        this.data.formularioSeccion[ISeccion].formularioElemento[IElemento].orden = IElemento + 1;
      }
    }
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

  agregarElemento(seccion: FormularioSeccion) {
    this.formuLarioElemento = {
      idFormularioElemento: -1,
      descripcion: '',
      idTipoElementoFormulario: -1,
      orden: 1,
      esRequerido: 1,
      idFormularioSeccion: seccion.idFormularioSeccion,
      formularioOpcion: [] as FormularioOpcion[],
      imagenPath: ''
    };
    this.confirm('Agregar Elemento', 'agregar-elemento');
  }

  crearModales() {
    if ($('body').find('.modal-confirmAgregarElemento').length > 1) {
      $('body').find('.modal-confirmEliminar')[1].remove();
    }
    this.modales.modalAgregarElemento = new bootstrap.Modal($("#modal-confirmAgregarElemento").appendTo("body"), {
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



    if ($('body').find('.modal-agregar-seccion').length > 1) {
      $('body').find('.modal-confirmEliminarS')[1].remove();
    }
    this.modales.modalAgregarSeccion = new bootstrap.Modal($("#modal-agregar-seccion").appendTo("body"), {
      backdrop: "static",
      keyboard: false,
    });

    if ($('body').find('.modal-editar-seccion').length > 1) {
      $('body').find('.modal-confirmEliminarS')[1].remove();
    }
    this.modales.modalEditarSeccion = new bootstrap.Modal($("#modal-editar-seccion").appendTo("body"), {
      backdrop: "static",
      keyboard: false,
    });



    if ($('body').find('.modal-editar-formulario').length > 1) {
      $('body').find('.modal-confirmEliminarS')[1].remove();
    }
    this.modales.modalEditarFormulario = new bootstrap.Modal($("#modal-editar-formulario").appendTo("body"), {
      backdrop: "static",
      keyboard: false,
    });


  }

  borrarOpcion(index: number) {
    this.formuLarioElemento.formularioOpcion = this.formuLarioElemento.formularioOpcion.filter(a => a.orden !== index + 1);
    for (let i = 0; i < this.formuLarioElemento.formularioOpcion.length; i++) {
      this.formuLarioElemento.formularioOpcion[i].orden = i + 1;
    }

  }


  private _GETFormulario(idFormulario: any): void {
    this._backService.HttpPost('catalogos/Formulario/ObtenerFormulario', { idFormulario: idFormulario }, {}).subscribe({
      next: (response: any) => {
        this.tipoElementos = response.tipo_elemento_formulario;
        this.data.formulario = response.formulario[0];
        this.data.formularioSeccion = response.formulario_seccion;
        for (let indexFS = 0; indexFS < this.data.formularioSeccion?.length; indexFS++) {
          const currentSeccion = this.data.formularioSeccion[indexFS];
          if (currentSeccion.seccionDefault === 1) {
            this.formularioSeccionOpciones.push({
              idFormularioSeccion: currentSeccion.idFormularioSeccion,
              nombre: '',
              orden: currentSeccion.orden,
              seccionDefault: currentSeccion.seccionDefault,
              idFormulario: currentSeccion.idFormulario,
              formularioElemento: currentSeccion.formularioElemento
            });
          } else {
            this.formularioSeccionOpciones.push(currentSeccion);
          }
          const currentFormularioElemento = response.formulario_elemento.filter((a: any) => a.idFormularioSeccion === currentSeccion.idFormularioSeccion);
          this.data.formularioSeccion[indexFS].formularioElemento = currentFormularioElemento;
          for (let indexFE = 0; indexFE < currentFormularioElemento.length; indexFE++) {
            const formularioElemento = currentFormularioElemento[indexFE];
            const currentFO = response.formulario_opcion.filter((fo: any) => fo.idFormularioElemento === formularioElemento.idFormularioElemento); // currentFormularioElemento.filter((fe: any) => fe.)
            const tipoElementoFO = this.tipoElementos.find(a => a.idTipoElementoFormulario === formularioElemento.idTipoElementoFormulario);

            this.data.formularioSeccion[indexFS].formularioElemento[indexFE].formularioTipoElemento = tipoElementoFO;
            this.data.formularioSeccion[indexFS].formularioElemento[indexFE].formularioOpcion = currentFO;
          }
        }

        this._pantallaServicio.ocultarSpinner();
      }, error: (error: any) => {
        this._pantallaServicio.ocultarSpinner();

      }
    });
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


  resetFormulario() {
    this.formulario.nombre = '';
  }



  _RESETFORMULARIOELEMENTO() {
    this.formuLarioElemento = {
      idFormularioElemento: -1,
      descripcion: '',
      idTipoElementoFormulario: -1,
      orden: 1,
      esRequerido: 1,
      idFormularioSeccion: -1,
      formularioOpcion: [] as FormularioOpcion[],
      imagenPath: '',
      file: undefined
    };
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


  private _ValidarElemento(): boolean {
    switch (this.formuLarioElemento.idTipoElementoFormulario) {
      case 1: {
        console.log(this.formuLarioElemento.descripcion);
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

  confirmarAcccion(accionType: 'AGREGAR-ELEMENTO' | 'EDITAR-ELEMENTO' | 'EDITAR-FORMULARIO' | 'AGREGAR-SECCION' | 'EDITAR-SECCION') {
    // alert(accionType);
    switch (accionType) {
      case 'AGREGAR-ELEMENTO': {
        this.CLICK_BTN_OK_MODAL = true;
        this.formuLarioElemento.lastSeccionId = this.formuLarioElemento.idFormularioElemento;
        if (this._ValidarElemento() === true) {
          let indexSeccion = this.data.formularioSeccion.findIndex(a => Number(a.idFormularioSeccion) === Number(this.formuLarioElemento.idFormularioSeccion));

          if (indexSeccion === -1) {
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

            const insertElement: FormularioElemento = {
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
            this.data.formularioSeccion[indexSeccion].formularioElemento = this.data.formularioSeccion[indexSeccion].formularioElemento;
            console.log(this.data.formularioSeccion[indexSeccion].formularioElemento);
            this._reordenarTodosElementos();
          }

          this.modales.modalAgregarElemento.hide();

          this.CLICK_BTN_OK_MODAL = false;
          this._RESETFORMULARIOELEMENTO();
        }


        //
        break;
      }
      case 'EDITAR-ELEMENTO': {
        this.CLICK_BTN_OK_MODAL = true;
        if (this._ValidarElemento()) {

          if (Number(this.formuLarioElemento.idFormularioSeccion) !== Number(this.formuLarioElemento.lastSeccionId)) {

            const indexSeccionM = this.data.formularioSeccion.findIndex(a => Number(a.idFormularioSeccion) === Number(this.formuLarioElemento.idFormularioSeccion));

            this.data.formularioSeccion[indexSeccionM].formularioElemento.push(this.formuLarioElemento);

            const lastIndexSeccion = this.data.formularioSeccion.findIndex(a => Number(a.idFormularioSeccion) === Number(this.formuLarioElemento.lastSeccionId));

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

          // if (this.formuLarioElemento.idFormularioSeccion !== this.formuLarioElemento.lastSeccionId) {
          //   this.data.formularioSeccion.find(a => Number(a.idFormularioSeccion) === Number(this.formuLarioElemento.idFormularioSeccion))?.formularioElemento.push(this.formuLarioElemento);
          // }

        }

        break;
      }
      case 'EDITAR-FORMULARIO': {
        this.CLICK_BTN_OK_MODAL = true;
        if (this.formulario.nombre.replace(' ', '').length === 0) {
          // this._toaster.error('El nombre no puede ir vacio');
        } else {
          this.data.formulario.nombre = this.formulario.nombre;
          this.formulario = new Formulario('');
          this.modales.modalEditarFormulario.hide();
        }
        break;
      }
      case 'AGREGAR-SECCION': {
        this.CLICK_BTN_OK_MODAL = true;
        // if (!this.formularioSeccion.nombre) {
        //   // this._toaster.error('El nombre de la seccion no debe ir vacio')
        //   return;
        // }
        let secciones = this.data.formularioSeccion;
        secciones.push(this.formularioSeccion);
        this.data.formularioSeccion = secciones;
        this.formularioSeccionOpciones.push(this.formularioSeccion);
        this.formularioSeccion = new FormularioSeccion();
        this.modales.modalAgregarSeccion.hide();
        this.CLICK_BTN_OK_MODAL = false;
        break;
      }
      case 'EDITAR-SECCION': {
        this.CLICK_BTN_OK_MODAL = true;
        const indexSeccion = this.data.formularioSeccion.findIndex(a => Number(a.idFormularioSeccion) === Number(this.formularioSeccion.idFormularioSeccion));
        this.data.formularioSeccion[indexSeccion].nombre = this.formularioSeccion.nombre;
        this.formularioSeccionOpciones.push(this.formularioSeccion);
        this._RESETFORMULARIOSECCION();
        this.modales.modalEditarSeccion.hide();
        break;
      }

    }
  }


  borrarImagen() {
    var elem: any = document.getElementById("fileFoto");
    elem.value = "";
    var elem1: any = document.getElementById("clienteFoto");
    elem1.src = "assets/images/system/iconoPersona.png";
    $('#txtImagen').text("");
    var elem2: any = document.getElementById("clienteFoto");
    elem2.style.border = "";
    $("#btnBorrarImagen").css("display", "none");
  }



  imagePreview(e: any) {
    const file: File = e.target.files[0];
    this.formuLarioElemento.file = file;
    const render = new FileReader();
    render.onload = () => {
      this.formuLarioElemento.imagenPath = render.result as string;
    };
    render.readAsDataURL(file);
    e.srcElement.value = null;
  }


  changeSeccionElement(event: any, esNuevo: boolean) {
    const idFormularioSeccion = Number(event.target.value);
    const seccion = this.data.formularioSeccion.findIndex(a => Number(a.idFormularioSeccion) === Number(idFormularioSeccion));
    this.formuLarioElemento.idFormularioSeccion = idFormularioSeccion;
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

  eliminarSeccion(seccion: FormularioSeccion): void {
    this.formularioSeccionOpciones = this.formularioSeccionOpciones.filter((a: any) => Number(a.idFormularioSeccion) !== Number(seccion.idFormularioSeccion));

    this.data.formularioSeccion = this.data.formularioSeccion.filter(a => a.idFormularioSeccion !== seccion.idFormularioSeccion);
  }

  eliminarElemento(elemento: FormularioElemento): void {
    const indexSeccion: number = this.data.formularioSeccion.findIndex(a => Number(a.idFormularioSeccion) === Number(elemento.idFormularioSeccion));
    if (elemento.idFormularioElemento === -1) {
      this.data.formularioSeccion[indexSeccion].formularioElemento = this.data.formularioSeccion[indexSeccion].formularioElemento.filter(a => Number(a.idFormularioElemento) !== Number(elemento.idFormularioElemento) && Number(a.orden) !== Number(elemento.orden));
      this._reordenarTodosElementos();
    } else {
      this.data.formularioSeccion[indexSeccion].formularioElemento = this.data.formularioSeccion[indexSeccion].formularioElemento.filter(a => Number(a.idFormularioElemento) !== Number(elemento.idFormularioElemento));
      this._reordenarTodosElementos();
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

  drop(event: CdkDragDrop<any>, seccion: any) {
    console.log(event.previousContainer);
     console.log(event.container);

    // if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    // } else {
    //   transferArrayItem(
    //     event.previousContainer.data,
    //     event.container.data,
    //     event.previousIndex,
    //     event.currentIndex,
    //   );
    // }


    // moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
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



  GuardarDatos() {
    this._pantallaServicio.mostrarSpinner();
    if (this.data.formulario.nombre.replace(' ', '').length === 0) {
      this._toaster.error('Favor de ponerle un nombre al Formulario');
      this._pantallaServicio.ocultarSpinner();
      return;
    }
    this._backService.HttpPost('catalogos/Formulario/actualizarFormulario', {}, this.data).subscribe({
      next: (response: any) => {
        this._pantallaServicio.ocultarSpinner();
        this._router.navigate([`catalogos/formulario`]);
        // if (response === false) {
        // } else {
        //   this._toaster.success('Formulario actualizado correctamente');
        // }
      },
      error: (error: any) => {
        // this._toaster.error(error.error.message);
        this._pantallaServicio.ocultarSpinner();
      }
    });
  }





}
