import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
declare var $: any; // JQUERY
import { MethodsService } from 'src/app/core/services/methods.service';
import { PantallaService } from 'src/app/core/services/pantalla.service';
import { ToasterService } from 'src/shared/toaster/toaster.service';
import { environment } from 'src/environments/environment';
import * as bootstrap from 'bootstrap'; // BOOTSTRAP
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-importar-productos',
  templateUrl: './importar-productos.component.html',
  styleUrls: [
    './importar-productos.component.scss',
    '../../../page.component.scss',
  ],
})
export class ImportarProductosComponent implements OnInit {
  importador: any = {};
  importadorProductos: any = {};
  LANGS: any = {};
  modales: any = {};
  sessionTraslate: any = {};

  modalConfirmMessage: any = '';

  //variable para las pestañas
  tabSelect = 0;

  constructor(
    private _backService: MethodsService,
    private _translate: TranslateService,
    private _pantallaServicio: PantallaService,
    private _router: Router,
    private _toaster: ToasterService,
	private matIconRegistry: MatIconRegistry,
		private domSanitizer: DomSanitizer,
  ) {
    this._translate.setDefaultLang(this._pantallaServicio.idioma);
    this._translate.use(this._pantallaServicio.idioma);

    this._translate.get('importador').subscribe((translated: string) => {
      this.importador = this._translate.instant('importador');
      this.LANGS = this._translate.instant('LANGS');
      this.importadorProductos = this._translate.instant('importadorProductos');
      this.sessionTraslate = this._translate.instant('sessionTraslate');
    });

	this.matIconRegistry.addSvgIcon('iconCasita', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../../assets/icons/finales/Casa1-icon.svg"));
	this.matIconRegistry.addSvgIcon('iconFlechaDerecha', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../../assets/icons/finales/FlechaDerechaPequena-icon.svg"));
  }

  ngOnInit(): void {
    this.crearModales();
    this.iniciarPantalla();
  }

  colExcel: any = [];
  colExcelFiltros: any = [];
  fileName: any = null;
  dataExcel: any = null;
  colDefExcel: any = null;
  responseExcel: any = null;
  configuracion: any = {};
  isExcel: any = false;
  isExcel2: any = false;
  displayNameCamposSelect: any = null;
  dataImportar: any = [];
  ignorarCambios: any = false;
  camposSelect: any = null;
  filasIgnoradas: any = [];

  // Crear modales
  crearModales() {
    if ($('body').find('.modalConfirm').length > 1) {
      $('body').find('.modalConfirm')[1].remove();
    }

    this.modales.modalConfirm = new bootstrap.Modal(
      $('#modalConfirm').appendTo('body'),
      {
        backdrop: 'static',
        keyboard: false,
      }
    );

    if ($('body').find('.modalFinalizar').length > 1) {
      $('body').find('.modalFinalizar')[1].remove();
    }

    this.modales.modalFinalizar = new bootstrap.Modal(
      $('#modalFinalizar').appendTo('body'),
      {
        backdrop: 'static',
        keyboard: false,
      }
    );
  }

  regresarProductos() {
    this._router.navigate(['/inventario/productos']);
  }

  iniciarPantalla() {
    this._pantallaServicio.mostrarSpinner();
    this._backService
      .HttpPost('catalogos/ImportadorProductos/cargarConfigurables', {}, {})
      .subscribe(
        (response) => {
          const dataTemp = eval(response);
          this.colExcel = dataTemp;
          this.colExcelFiltros = dataTemp;
          this._pantallaServicio.ocultarSpinner();
        },
        (error) => {
          this._pantallaServicio.ocultarSpinner();
          if (error === 'SinSesion' || error === 'SesionCaducada') {
            if (error === 'SinSesion') {
              this._toaster.error(this.sessionTraslate.favorIniciarSesion);
            }
            if (error === 'SesionCaducada') {
              this._toaster.error(this.sessionTraslate.sesionCaducada);
            }
            this._router.navigate(['/login']);
            return;
          }
        }
      );
  }

  // [Evento] Se dispara cuando se selecciona un archivo
  fileSelected(file: any) {
    this._pantallaServicio.mostrarSpinner();
    this.fileName = '-1';
    const f = file.target.files[0];
    const ext = f.name.toLowerCase().split('.');
    if (ext[ext.length - 1] === 'xls' || ext[ext.length - 1] === 'xlsx') {
      $('#nomArchivo').html(f.name);
      const r = new FormData();
      r.append('fileExcel', f);
      const request = new XMLHttpRequest();
      request.open(
        'POST',
        environment.URL + 'catalogos/ImportadorProductos/parseExcel',
        true
      );
      request.onreadystatechange = () => {
        if (request.readyState === 4) {
          if (request.status === 200) {
            this.resultExcel(request.responseText);
          }
        }
      };
      request.send(r);
    } else {
      this.modalConfirmMessage =
        this.importador.errorExtension + " ('xls' ó 'xlsx').";
      this.modales.modalConfirm.show();
      $('#file').val('');
      this.isExcel = false;
      this._pantallaServicio.ocultarSpinner();
    }
  }

  resultExcel(response: any) {
    this.dataExcel = [];
    this.colDefExcel = [];
    try {
      const dataTemp = eval(response);
      this.dataExcel = dataTemp.map((item: any) => {
        Object.keys(item).forEach((key) => {
          if (item[key] === null) {
            delete item[key];
            return;
          }
          if (!this.colDefExcel.some((e: any) => e === key))
            this.colDefExcel.push(key);
        });
        return item;
      });

      this.colDefExcel.forEach((e: any, i: any) => {
        const validar = this.colExcel.find((ex: any) => ex.nombre === e.trim());
        if (validar) {
          this.configuracion['header' + i] = validar.idCampo;
          return;
        }

        this.configuracion['header' + i] = undefined;
      });

      $('#file').val('');
      this.isExcel = true;
      this._pantallaServicio.ocultarSpinner();
    } catch (e) {
      this.modalConfirmMessage = this.importador.formatoExtension;
      $('#nomArchivo').html('...');
      $('#file').val('');
      this.isExcel = false;
      this.modales.modalConfirm.show();
      this._pantallaServicio.ocultarSpinner();
    }
  }

  //Función para importar las columnas
  importarCols() {
    if (this.validarConfigCampos()) {
      let validRequeridos = true;
      let camposSelect = [];
      this.displayNameCamposSelect = [];
      let tCampos = [];
      let msgReque = '';
      let campRequeridos = this.colExcel.filter(
        (e: any) => e.requerido === '1'
      );
      for (let cs = 0; cs < this.colDefExcel.length; cs++) {
        if (this.configuracion['header' + cs] != undefined) {
          if (this.configuracion['header' + cs].length > 0) {
            camposSelect.push(this.configuracion['header' + cs]);
            this.displayNameCamposSelect.push(this.colDefExcel[cs].displayName);
          }
          tCampos.push(this.configuracion['header' + cs]);
        } else {
          tCampos.push('');
        }
      }
      lblReque: for (let cr = 0; cr < campRequeridos.length; cr++) {
        if (
          camposSelect.filter((c: any) => c === campRequeridos[cr].idCampo)
            .length <= 0
        ) {
          validRequeridos = false;
          if (this.LANGS.using != 'es') {
            msgReque =
              this.importador.columna +
              campRequeridos[cr].nomTranslate +
              this.importador.requerida;
          } else {
            msgReque =
              this.importador.columna +
              campRequeridos[cr].nombre +
              this.importador.requerida;
          }
          break lblReque;
        }
      }
      if (validRequeridos) {
        var makeArrayI = true;
        var resValid = [];
        this.dataImportar = [];
        lblValidar: for (var i = 0; i < this.dataExcel.length; i++) {
          //recorre cada fila
          var arrayTempCliente = [];
          var ignorarCampo = false;
          var arrayReg = Object.keys(this.dataExcel[i]); // arrayReg.pop();
          for (var j = 0; j < arrayReg.length; j++) {
            //recorre cada campo de la fila
            if (tCampos[j].length > 0) {
              resValid = this.validarCamposProductos(
                this.dataExcel[i][arrayReg[j]],
                tCampos[j],
                arrayReg[j],
                i
              );
              if (!resValid[0]) {
                makeArrayI = false;
                if (!this.ignorarCambios) {
                  break lblValidar;
                } else {
                  ignorarCampo = true;
                  break;
                }
              } else {
                arrayTempCliente.push(resValid[2]);
              }
            }
          }

          if (arrayTempCliente.length > 0 && !ignorarCampo)
            this.dataImportar.push(arrayTempCliente);
        }
        if (resValid[0]) {
          this.camposSelect = camposSelect;
        } else {
          this.modalConfirmMessage = resValid[1];
          this.modales.modalConfirm.show();
        }
        return resValid[0];
      } else {
        this.modalConfirmMessage = msgReque;
        this.modales.modalConfirm.show();
        return false;
      }
    } else {
      this.modalConfirmMessage = this.importador.noRepetirCamp;
      this.modales.modalConfirm.show();
      return false;
    }
  }

  validarConfigCampos() {
    let valid = true;
    let valorBuscar = '';
    let array = Object.keys(this.configuracion);
    let camposSelect = [];
    for (let cs = 0; cs < this.colDefExcel.length; cs++) {
      if (this.configuracion['header' + cs] != undefined) {
        if (this.configuracion['header' + cs].length > 0) {
          camposSelect.push(this.configuracion['header' + cs]);
        }
      }
    }
    for (let i in this.configuracion) {
      if (this.configuracion.hasOwnProperty(i)) {
        $('#' + i).removeClass('errorCampo');
      }
    }
    lblFor: for (let i = 0; i < array.length; i++) {
      if (this.configuracion[array[i]] != undefined) {
        if (this.configuracion[array[i]].length > 0) {
          valorBuscar = this.configuracion[array[i]];
          const found = camposSelect.filter(
            (item: any) => item === valorBuscar
          );
          if (found.length > 1) {
            valid = false;

            for (let i in this.configuracion) {
              if (this.configuracion.hasOwnProperty(i)) {
                if (this.configuracion[i] == valorBuscar) {
                  $('#' + i).addClass('errorCampo');
                }
              }
            }

            break lblFor;
          }
        }
      }
    }
    return valid;
  }

  validarCamposProductos(vp?: any, tipo?: any, nomExcel?: any, fila?: any) {
    let valor = vp;
    let valExpNumber = RegExp('(?:d*)?d+');
    let msg = this.importadorProductos.errorFormato;
    let validos = true;
    let valReturn = '';
    let msgTemp = '';

    switch (tipo) {
      case 'marca':
      case 'producto':
      case 'presentacion':
      case 'unidadMedida':
      case 'proveedor':
        if (valor === null || valor === undefined) {
          if (!this.ignorarCambios) {
            msgTemp =
              this.importadorProductos.campoFila +
              this.importadorProductos.requerido2;
            msg = msgTemp.replace('@camp', nomExcel);
            msg = msg.replace('@fila', (fila + 1).toString());
            validos = false;
          } else {
            validos = false;
            this.filasIgnoradas.push(fila);
          }
        } else {
          if (valor.length > 0) {
            if (valor.length <= 255) {
              valReturn = valor;
            } else {
              if (!this.ignorarCambios) {
                msgTemp =
                  this.importadorProductos.campoFila +
                  this.importadorProductos.noExceder;
                msg = msgTemp.replace('@camp', nomExcel);
                msg = msg.replace('@fila', (fila + 1).toString());
                validos = false;
              } else {
                validos = false;
                this.filasIgnoradas.push(fila);
              }
            }
          } else {
            if (!this.ignorarCambios) {
              msgTemp =
                this.importadorProductos.campoFila +
                this.importadorProductos.requerdio2;
              msg = msgTemp.replace('@camp', nomExcel);
              msg = msg.replace('@fila', (fila + 1).toString());
              validos = false;
            } else {
              validos = false;
              this.filasIgnoradas.push(fila);
            }
          }
        }
        break;
      case 'precio':
      case 'costo':
      case 'precioVenta':
        if (valor === null || valor === undefined) {
          valReturn = '';
        } else {
          if (isNaN(parseInt(valor, 10))) {
            if (!this.ignorarCambios) {
              errorCampo();
            } else {
              validos = false;
              this.filasIgnoradas.push(fila);
            }
          } else {
            valReturn = valor.toString();
          }
        }
        break;

      case 'existencia':
        if (valor === null || valor === undefined) {
          valReturn = '';
        } else {
          if (!Number.isInteger(valor) && parseInt(valor, 10) <= 0) {
            if (!this.ignorarCambios) {
              errorCampo();
            } else {
              validos = false;
              this.filasIgnoradas.push(fila);
            }
          } else {
            valReturn = valor.toString();
          }
        }
        break;
      default:
        if (valor === null || valor === undefined) {
          valReturn = '';
        } else {
          if (valor.toString().length > 255) {
            if (!this.ignorarCambios) {
              validos = false;
              msgTemp =
                this.importadorProductos.campoFila +
                this.importadorProductos.noExceder2;
              msg = msgTemp.replace('@camp', nomExcel);
              msg = msg.replace('@fila', (fila + 1).toString());
            } else {
              validos = false;
              this.filasIgnoradas.push(fila);
            }
          } else {
            valReturn = valor;
          }
        }
        break;
    }
    return [validos, msg, valReturn.toString()];

    function errorCampo() {
      validos = false;
      msg = msg.replace('@camp', nomExcel);
      msg = msg.replace('@fila', (fila + 1).toString());
    }
  }

  //Agraga las columnas de los campos selecionados para verificar
  crearGrid2() {
    let colDefExcel = [];
    let datosGrid2 = [];

    if (this.importarCols()) {
      for (let i = 0; i < this.camposSelect.length; i++) {
        let colName = this.camposSelect[i];
        let nomSelect = this.colExcel.filter(
          (e: any) => e.idCampo === colName
        )[0].nombre;

        if (this.LANGS.using != 'es') {
          nomSelect = this.colExcel.filter((e: any) => e.idCampo === colName)[0]
            .nomTranslate;
        }
      }

      for (let i = 0; i < this.dataImportar.length; i++) {
        let dObj = {};
        for (let j = 0; j < this.camposSelect.length; j++) {
          let nombreCampo = this.camposSelect[j];
          let valorCampo = this.dataImportar[i][j];

          Object.defineProperty(dObj, nombreCampo, {
            value: valorCampo,
            writable: true,
            enumerable: true,
            configurable: true,
          });
        }
        datosGrid2.push(dObj);
      }
      this.isExcel = false;
      this.isExcel2 = true;
      this.tabSelect = 1;
    }
  }

  guardarDatos() {
    this._pantallaServicio.mostrarSpinner();
    let params: any = {};
    params.productos = this.dataImportar;
    params.campos = this.camposSelect;

    this._backService
      .HttpPost('catalogos/ImportadorProductos/importarDatos', {}, params)
      .subscribe(
        (response) => {
          if (String(response).toLowerCase() === 'true') {
            this.modales.modalFinalizar.show();
          } else {
            this.modalConfirmMessage = response;
            this.modales.modalConfirm.show();
          }
          this._pantallaServicio.ocultarSpinner();
        },
        (error) => {
          this._pantallaServicio.ocultarSpinner();
          if (error === 'SinSesion' || error === 'SesionCaducada') {
            if (error === 'SinSesion') {
              this._toaster.error(this.sessionTraslate.favorIniciarSesion);
            }
            if (error === 'SesionCaducada') {
              this._toaster.error(this.sessionTraslate.sesionCaducada);
            }
            this._router.navigate(['/login']);
            return;
          }
        }
      );
  }

  regresarGrid() {
    this.isExcel = true;
    this.isExcel2 = false;
    this.tabSelect = 0;
  }
}
