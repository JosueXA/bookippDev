import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MethodsService } from 'src/app/core/services/methods.service';
import { PantallaService } from 'src/app/core/services/pantalla.service';
import { ToasterService } from 'src/shared/toaster/toaster.service';
declare var $: any; // JQUERY
import * as bootstrap from 'bootstrap'; // BOOTSTRAP
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-importar-clientes',
  templateUrl: './importar-clientes.component.html',
  styleUrls: [
    './importar-clientes.component.scss',
    '../../../page.component.scss',
  ],
})
export class ImportarClientesComponent implements OnInit {
  tabSelect = 0;
  filasIgnoradas: any = [];
  dataExcel: any = [];
  colDefExcel: any = [];
  responseExcel: any = null;
  configuracion: any = [];
  colExcelFiltros: any = [];
  colExcel: any = [];
  isExcel: any = false;
  isExcel2: any = false;
  dataImportarCopy: any = null;
  dataImportar: any = null;
  camposSelect: any = null;
  dataExcel2: any = null;
  altura2: any = null;
  altura: any = null;
  gridConfiguracionesExcel2: any = null;
  colDefExcel2: any = null;
  gridConfiguracionesExcel: any = null;
  fileName: any = null;
  displayNameCamposSelect: any = [];
  formatoFecha: any = {
    select: 0,
    data: [],
  };
  ignorarCambios: any = false;
  fileLoaded: any = false;

  importador: any = {};
  LANGS: any = {};
  modales: any = {};
  sessionTraslate: any = {};
  modalConfirmMessage: any = '';

  constructor(
    private _backService: MethodsService,
    private _translate: TranslateService,
    private _pantallaServicio: PantallaService,
    private _router: Router,
    private _toaster: ToasterService
  ) {
    this._translate.setDefaultLang(this._pantallaServicio.idioma);
    this._translate.use(this._pantallaServicio.idioma);

    this._translate.get('importador').subscribe((translated: string) => {
      this.importador = this._translate.instant('importador');
      this.LANGS = this._translate.instant('LANGS');
      this.sessionTraslate = this._translate.instant('sessionTraslate');

      this.formatoFecha.data = [
        {
          id: 0,
          nombre: 'DD MM AAAA ' + this.importador.ej + ' 26-04-1986)',
          regEx:
            /^(?:3[01]|[12][0-9]|0?[1-9])([\-/.\s])(0?[1-9]|1[0-2])\1\d{4}(\s([0-1][0-9]|[2][0-3])(:)([0-5][0-9])((:)[0-5][0-9])?)?$/,
          regEx2:
            /^(?:3[01]|[12][0-9]|0?[1-9])([\-/.\s])(0?[1-9]|1[0-2])\1\d{4}([T]([0-1][0-9]|[2][0-3])(:)([0-5][0-9])((:)[0-5][0-9])?)?$/,
        },
        {
          id: 1,
          nombre: 'MM DD AAAA ' + this.importador.ej + ' 04-26-1986)',
          regEx:
            /^(?:0?[1-9]|1[0-2])([\-/.\s])(3[01]|[12][0-9]|0?[1-9])\1\d{4}(\s([0-1][0-9]|[2][0-3])(:)([0-5][0-9])((:)[0-5][0-9])?)?$/,
          regEx2:
            /^(?:0?[1-9]|1[0-2])([\-/.\s])(3[01]|[12][0-9]|0?[1-9])\1\d{4}([T]([0-1][0-9]|[2][0-3])(:)([0-5][0-9])((:)[0-5][0-9])?)?$/,
        },
        {
          id: 2,
          nombre: 'AAAA MM DD ' + this.importador.ej + ' 1986-04-26)',
          regEx:
            /^\d{4}([\-/.\s])(0?[1-9]|1[0-2])\1(3[01]|[12][0-9]|0?[1-9])(\s([0-1][0-9]|[2][0-3])(:)([0-5][0-9])((:)[0-5][0-9])?)?$/,
          regEx2:
            /^\d{4}([\-/.\s])(0?[1-9]|1[0-2])\1(3[01]|[12][0-9]|0?[1-9])([T]([0-1][0-9]|[2][0-3])(:)([0-5][0-9])((:)[0-5][0-9])?)?$/,
        },
        {
          id: 3,
          nombre:
            'DD MMM AAAA ' +
            this.importador.ej +
            ' 26-' +
            this.importador.abrilEjemplo +
            '-1986)',
          regEx:
            /^\d{4}([\-/.\s])(0?[1-9]|1[0-2])\1(3[01]|[12][0-9]|0?[1-9])(\s([0-1][0-9]|[2][0-3])(:)([0-5][0-9])((:)[0-5][0-9])?)?$/,
          regEx2:
            /^\d{4}([\-/.\s])(0?[1-9]|1[0-2])\1(3[01]|[12][0-9]|0?[1-9])([T]([0-1][0-9]|[2][0-3])(:)([0-5][0-9])((:)[0-5][0-9])?)?$/,
        },
        {
          id: 4,
          nombre:
            'AAAA MMM DD ' +
            this.importador.ej +
            ' 1986-' +
            this.importador.abrilEjemplo +
            '-26)',
          regEx:
            /^\d{4}([\-/.\s])(0?[1-9]|1[0-2])\1(3[01]|[12][0-9]|0?[1-9])(\s([0-1][0-9]|[2][0-3])(:)([0-5][0-9])((:)[0-5][0-9])?)?$/,
          regEx2:
            /^\d{4}([\-/.\s])(0?[1-9]|1[0-2])\1(3[01]|[12][0-9]|0?[1-9])([T]([0-1][0-9]|[2][0-3])(:)([0-5][0-9])((:)[0-5][0-9])?)?$/,
        },
      ];
    });
  }

  ngOnInit(): void {
    this.crearModales();
    this.iniciarPantalla();
  }

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

  iniciarPantalla() {
    this._pantallaServicio.mostrarSpinner();
    this._backService
      .HttpPost('catalogos/importador/cargarConfigurables', {}, {})
      .subscribe(
        (response) => {
          const dataTemp = eval(response);
          this.colExcel = dataTemp;
          this.colExcelFiltros = dataTemp;
          console.log(this.colExcel);
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
    this.fileName = '-1';
    if (file.target.files[0] != undefined || file.target.files[0] != null) {
      this._pantallaServicio.mostrarSpinner();
      let f = file.target.files[0];
      const ext = f.name.toLowerCase().split('.');
      if (ext[ext.length - 1] === 'xls' || ext[ext.length - 1] === 'xlsx') {
        $('#nomArchivo').html(f.name);
        const r = new FormData();
        r.append('fileExcel', f);
        const request = new XMLHttpRequest();
        request.open(
          'POST',
          environment.URL + 'catalogos/Importador/parseExcel',
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
    } else {
      this.fileName = undefined;
      this.fileLoaded = false;
    }
  }

  guardarDatos() {
    this._pantallaServicio.mostrarSpinner();
    let params: any = {};
    let dataImportarCopy2: any = [];
    let arrayReg: any = [];
    for (let i = 0; i < this.dataImportarCopy.length; i++) {
      //recorre cada fila
      let arrayTempCliente = [];
      arrayReg = Object.keys(this.dataImportarCopy[i]); // arrayReg.pop();
      for (let j = 0; j < arrayReg.length; j++) {
        //recorre cada campo de la fila
        arrayTempCliente.push(this.dataImportarCopy[i][arrayReg[j]]);
      }
      dataImportarCopy2.push(arrayTempCliente);
    }
    params.clientes = dataImportarCopy2;
    params.campos = arrayReg;

    this._backService
      .HttpPost('catalogos/importador/importarDatos', {}, params)
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
    this.dataImportar = [];
    this.dataImportarCopy = [];
    this.isExcel2 = false;
    this.isExcel = true;
    this.tabSelect = 0;
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
        (item: any) => item.requerido === '1'
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
          camposSelect.filter(
            (item: any) => item === campRequeridos[cr].idCampo
          ).length <= 0
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
        let makeArrayI = true;
        let resValid = [];
        this.dataImportar = [];
        lblValidar: for (let i = 0; i < this.dataExcel.length; i++) {
          //recorre cada fila
          let arrayTempCliente = [];
          let ignorarCampo = false;
          let arrayReg = Object.keys(this.dataExcel[i]); // arrayReg.pop();
          for (let j = 0; j < arrayReg.length; j++) {
            //recorre cada campo de la fila
            if (tCampos[j].length > 0) {
              resValid = this.validarCamposClientes(
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
          if (!this.ignorarCambios) {
            this.modalConfirmMessage = resValid[1];
            this.modales.modalConfirm.show();
          } else {
            this.camposSelect = camposSelect;
            return true;
          }
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
          let found = camposSelect.filter((item: any) => item === valorBuscar);

          if (found.length > 1) {
            valid = false;

            for (let i in this.configuracion) {
              if (this.configuracion.hasOwnProperty(i)) {
                if (this.configuracion[i] === valorBuscar) {
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

  getNumberMonth(mes?: any) {
    switch (mes) {
      case 'jan':
      case 'ene':
      case 'jan.':
        mes = '01';
        break;
      case 'feb':
      case 'feb.':
        mes = '02';
        break;
      case 'mar':
      case 'mar.':
        mes = '03';
        break;
      case 'apr':
      case 'abr':
      case 'apr.':
        mes = '04';
        break;
      case 'may':
      case 'may.':
        mes = '05';
        break;
      case 'jun':
      case 'jun.':
        mes = '06';
        break;
      case 'jul':
      case 'jul.':
        mes = '07';
        break;
      case 'aug':
      case 'ago':
      case 'aug.':
        mes = '08';
        break;
      case 'set':
      case 'sep':
      case 'sep.':
        mes = '09';
        break;
      case 'oct':
      case 'oct.':
        mes = '10';
        break;
      case 'nov':
      case 'nov.':
        mes = '11';
        break;
      case 'dec':
      case 'dic':
      case 'dec.':
        mes = '12';
        break;
    }
    return mes.toString();
  }

  yyyyMMdd(date?: any) {
    let mm = date.getMonth() + 1; // getMonth() is zero-based
    let dd = date.getDate();

    return [
      date.getFullYear(),
      (mm > 9 ? '' : '0') + mm,
      (dd > 9 ? '' : '0') + dd,
    ].join('');
  }

  getYearString(year?: any) {
    let yearS = '';
    //96
    let anioActual = new Date().getFullYear().toString();
    anioActual = anioActual.substr(2);
    //SI EL AÑO INGRESADO ES MAYOR AL ACTUAL PONER EL 19 Y SI ES MENOR AL ACTUAL PONER 20
    if (year.length === 2) {
      yearS = parseInt(year) > parseInt(anioActual) ? '19' + year : '20' + year;
    } else {
      yearS = year;
    }
    return yearS;
  }

  validarCamposClientes(vp?: any, tipo?: any, nomExcel?: any, fila?: any) {
    let valor = vp;
    if (typeof valor === 'string') {
      valor = valor.trim();
    }
    let valExp = RegExp('^[a-zA-Z -. áàéèíìóòúñÁÀÉÈÍÏÓÒÚÙÑüùÜs\r\n]*$');

    let valExpPhone = RegExp('^.*$');
    let telefonoExp = new RegExp(
      '^(\\(\\d{2}\\)|\\d{2})?-?(\\d{2})?-?\\d{2}-?\\d{2}-?\\d{2}-?\\d{2}$'
    ); //Solamente que contenga
    let eMailExp = new RegExp(
      /^(?:[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-zA-Z0-9-]*[a-zA-Z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/
    );
    //let emailExp = {id: emailExp, RegExp: /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-zA-Z0-9-]*[a-zA-Z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/}

    let msg = this.importador.errorFormato;
    let validos = true;
    let valReturn = '';
    let msgTemp = '';
    $('#ffechaddl').removeClass('errorCampo');
    switch (tipo) {
      case 'nombre':
        if (valor == null || valor == undefined || valor == '') {
          msgTemp = this.importador.campoFila + this.importador.requerido2;
          msg = msgTemp.replace('@camp', nomExcel);
          msg = msg.replace('@fila', (fila + 1).toString());
          validos = false;
        } else {
          if (valor.length > 0) {
            if (valor.length <= 200) {
              if (!valExp.test(valor)) {
                if (!this.ignorarCambios) {
                  errorCampo();
                } else {
                  validos = false;
                  this.filasIgnoradas.push(fila);
                  //alert("ignorar error");
                }
              } else {
                valReturn = valor;
              }
            } else {
              if (!this.ignorarCambios) {
                msgTemp = this.importador.campoFila + this.importador.noExceder;
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
              msgTemp = this.importador.campoFila + this.importador.requerdio2;
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
      case 'telefono':
      case 'telefonoCasa':
      case 'telefonoOficina':
        if (valor == null || valor == undefined || valor == '') {
          valReturn = '';
        } else {
          if (valor === parseInt(valor, 10)) {
            //Es entero
            if (valor.toString().length <= 40) {
              valReturn = valor;
            } else {
              if (!this.ignorarCambios) {
                errorCampo();
              } else {
                validos = false;
                this.filasIgnoradas.push(fila);
              }
            }
          } else {
            if (!valExpPhone.test(valor)) {
              if (!this.ignorarCambios) {
                errorCampo();
              } else {
                validos = false;
                this.filasIgnoradas.push(fila);
              }
            } else {
              valReturn = valor;
            }
          }
        }
        break;
      case 'email':
        if (valor == null || valor == undefined || valor == '') {
          valReturn = '';
        } else {
          if (valor.length <= 200) {
            if (!eMailExp.test(valor)) {
              if (!this.ignorarCambios) {
                errorCampo();
              } else {
                validos = false;
                this.filasIgnoradas.push(fila);
              }
            } else {
              valReturn = valor;
            }
          } else {
            if (!this.ignorarCambios) {
              msgTemp = this.importador.campoFila + this.importador.noExceder;
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
      case 'fechaNacimiento':
        if (this.formatoFecha.select != undefined) {
          if (valor == null || valor == undefined || valor == '') {
            valReturn = '';
          } else {
            if (this.formatoFecha.select > 2) {
              //DD MMM AAAA o AAAA MMM DD
              let fecha = valor;
              let fechaFormateada = '';
              let expRegular = new RegExp('[a-zA-Z]');
              let contieneLetras = expRegular.test(fecha);
              let dontF = fecha.indexOf('T');
              if (contieneLetras && dontF == -1) {
                //Contiene letras la fecha
                let formato1 = fecha.search('-'); //Buscar el char -
                let formato2 = fecha.search('/'); //Buscar el char /
                let formato3 = fecha.search(' ');
                if (formato1 != -1) {
                  fechaFormateada = fecha;
                  fechaFormateada = fechaFormateada.toLowerCase(); //Convertir a minusculas
                  let fechaFArray = fechaFormateada.split('-');

                  let mes = '';
                  mes = this.getNumberMonth(fechaFArray[1].toString());

                  if (this.formatoFecha.select == 3) {
                    //DD MMM AAAA
                    let anioS = this.getYearString(fechaFArray[2]);

                    let newFecha = anioS + '/' + mes + '/' + fechaFArray[0]; //dd mmm yy
                    valor = newFecha;
                    valReturn = newFecha;
                  } else {
                    if (this.formatoFecha.select == 4) {
                      //AAAA MMM DD
                      let anioS = this.getYearString(fechaFArray[0]);

                      let newFecha = anioS + '/' + mes + '/' + fechaFArray[2]; //yy mm dd
                      valor = newFecha;
                      valReturn = newFecha;
                    }
                  }
                } else {
                  if (formato2 != -1) {
                    fechaFormateada = fecha;
                    fechaFormateada = fechaFormateada.toLowerCase(); //Convertir a minusculas

                    let fechaFArray = fechaFormateada.split('/');
                    let mes = '';

                    mes = this.getNumberMonth(fechaFArray[1].toString());
                    if (this.formatoFecha.select == 3) {
                      //DD MMM AAAA
                      let newFecha =
                        fechaFArray[2] + '/' + mes + '/' + fechaFArray[0];
                      valor = newFecha;
                      valReturn = newFecha;
                    } else {
                      if (this.formatoFecha.select == 4) {
                        //AAAA MMM DD
                        let newFecha =
                          fechaFArray[0] + '/' + mes + '/' + fechaFArray[2];
                        valor = newFecha;
                        valReturn = newFecha;
                      } else {
                        if (!this.ignorarCambios) {
                          errorCampo();
                        } else {
                          validos = false;
                          this.filasIgnoradas.push(fila);
                        }
                      }
                    }
                  } else {
                    if (formato3 != -1) {
                      fechaFormateada = fecha;
                      fechaFormateada = fechaFormateada.toLowerCase(); //Convertir a minusculas

                      let fechaFArray = fechaFormateada.split(' ');
                      let mes = '';

                      mes = this.getNumberMonth(fechaFArray[1].toString());
                      if (this.formatoFecha.select == 3) {
                        //DD MMM AAAA
                        let newFecha =
                          fechaFArray[2] + '/' + mes + '/' + fechaFArray[0];
                        valor = newFecha;
                        valReturn = newFecha;
                      } else {
                        if (this.formatoFecha.select == 4) {
                          //AAAA MMM DD
                          let newFecha =
                            fechaFArray[0] + '/' + mes + '/' + fechaFArray[2];
                          valor = newFecha;
                          valReturn = newFecha;
                        } else {
                          if (!this.ignorarCambios) {
                            errorCampo();
                          } else {
                            validos = false;
                            this.filasIgnoradas.push(fila);
                          }
                        }
                      }
                    } else {
                      if (!this.ignorarCambios) {
                        errorCampo();
                      } else {
                        validos = false;
                        this.filasIgnoradas.push(fila);
                      }
                    }
                  }
                }
              } else {
                //No contiene letras
                //return error
                if (!this.ignorarCambios) {
                  errorCampo();
                } else {
                  validos = false;
                  this.filasIgnoradas.push(fila);
                }
              }
            } else {
              valor = valor.replace('T', ' ');
              let regEx =
                this.formatoFecha.data[this.formatoFecha.select].regEx.test(
                  valor
                );
              let regEx2 =
                this.formatoFecha.data[this.formatoFecha.select].regEx2.test(
                  valor
                );

              if (regEx || regEx2) {
                let d, m, a, h;
                switch (this.formatoFecha.select) {
                  case 0:
                    d = valor.substring(0, 2);
                    m = valor.substring(3, 5);
                    a = valor.substring(6, 10);
                    h =
                      valor.length > 10
                        ? valor.substring(10, valor.length)
                        : '00:00:00';
                    h = h.split(':');
                    h =
                      h.length == 3
                        ? valor.substring(10, valor.length)
                        : valor.substring(10, valor.length) + ':00';
                    // valor = a + m + d;
                    valor = a + '/' + m + '/' + d;
                    valor = valor.replace('T', '');
                    break;
                  case 1:
                    m = valor.substring(0, 2);
                    d = valor.substring(3, 5);
                    a = valor.substring(6, 10);
                    h =
                      valor.length > 10
                        ? valor.substring(10, valor.length)
                        : '00:00:00';
                    h = h.split(':');
                    h =
                      h.length == 3
                        ? valor.substring(10, valor.length)
                        : valor.substring(10, valor.length) + ':00';
                    // valor = a + m + d;
                    valor = a + '/' + m + '/' + d;
                    valor = valor.replace('T', '');
                    break;
                  case 2:
                    a = valor.substring(0, 4);
                    m = valor.substring(5, 7);
                    d = valor.substring(8, 10);
                    h =
                      valor.length > 10
                        ? valor.substring(10, valor.length)
                        : '00:00:00';
                    h = h.split(':');
                    h =
                      h.length == 3
                        ? valor.substring(10, valor.length)
                        : valor.substring(10, valor.length) + ':00';
                    //valor = a + m + d + ' ' + h;
                    // valor = a + m + d;
                    valor = a + '/' + m + '/' + d;
                    valor = valor.replace('T', '');
                    break;
                }
                valReturn = valor; //$filter('date')(valor, 'yyyyMMdd HH:mm:ss');
              } else {
                if (!this.ignorarCambios) {
                  errorCampo();
                } else {
                  validos = false;
                  this.filasIgnoradas.push(fila);
                }
              }
            }
          }
        } else {
          if (!this.ignorarCambios) {
            validos = false;
            msg = this.importador.selectFFecha;
            $('#ffechaddl').addClass('errorCampo');
          } else {
            validos = false;
            this.filasIgnoradas.push(fila);
          }
        }
        break;
      default:
        if (valor == null || valor == undefined || valor == '') {
          valReturn = '';
        } else {
          if (valor.toString().length > 10000000) {
            if (!this.ignorarCambios) {
              validos = false;
              msgTemp = this.importador.campoFila + this.importador.noExceder2;
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

  //Inicialización del grid para archivos Excel
  inicializarGridExcel(dataExcel?: any, col?: any) {
    this.dataExcel = JSON.parse(JSON.stringify(dataExcel));
    let dd = JSON.parse(JSON.stringify(dataExcel));
    this.colDefExcel = col;
    if (dd.length > 10) {
      dd.splice(10, dd.length - 1);
    }
    setTimeout(() => {
      this.gridConfiguracionesExcel = {
        data: dd,
        columnDefs: 'colDefs',
        enableMoveColums: false,
        enableColumnMenus: false,
        enablePinning: true,
        enableColumnResizing: true,
        paginationPageSizes: [10, 25, 50, 100, 200],
        paginationPageSize: 10,
        enableSorting: false,
      };

      this.gridConfiguracionesExcel.columnDefs = col;

      this.gridConfiguracionesExcel.onRegisterApi = (gridApi: any) => {
        this.gridConfiguracionesExcel.gridApi = gridApi;
      };

      this.gridConfiguracionesExcel.enableVerticalScrollbar = 0;

      this.gridConfiguracionesExcel.enableHorizontalScrollbar = 2;

      this.altura = dataExcel.length * 30 + 90;
      if (this.altura > 390) {
        this.altura = 390;
      }
      if (this.dataExcel.length != 0) {
        this.isExcel = true;
      } else {
        this._toaster.error(this.importador.noHayDatos);
      }
    });
  }

  //Inicialización del grid para verificar las columnas selecionadas
  inicializarGridExcel2(dataExcel?: any, col?: any) {
    this.dataExcel2 = dataExcel;
    let dd = dataExcel;
    if (dd.length > 10) {
      dd.splice(10, dd.length - 1);
    }
    this.altura2 = dd.length * 30 + 90;
    this.colDefExcel2 = col;
    setTimeout(() => {
      this.gridConfiguracionesExcel2 = {
        data: dd,
        columnDefs: 'colDefExcel2',
        enableMoveColums: false,
        enableColumnMenus: false,
        enablePinning: true,
        enableColumnResizing: true,
        paginationPageSizes: [10, 25, 50, 100, 200],
        paginationPageSize: 10,
        enableSorting: false,
      };

      this.gridConfiguracionesExcel2.columnDefs = col;

      this.gridConfiguracionesExcel2.enableVerticalScrollbar = 0;

      this.gridConfiguracionesExcel2.enableHorizontalScrollbar = 2;

      $('#li2').click();
      this.isExcel2 = true;
    });
  }

  //Agraga las columnas de los campos selecionados para verificar
  crearGrid2() {
    let colDefExcel = [];
    let datosGrid2 = [];
    this.dataImportarCopy = [];
    if (this.importarCols()) {
      for (let i = 0; i < this.camposSelect.length; i++) {
        let colName = this.camposSelect[i];
        let nomSelect = this.colExcel.filter(
          (item: any) => item.idCampo === colName
        )[0].nombre;

        if (this.LANGS.using !== 'es') {
          nomSelect = this.colExcel.filter(
            (item: any) => item.idCampo === colName
          )[0].nomTranslate;
        }
      }

      for (let i = 0; i < this.dataImportar.length; i++) {
        let dObj = {};
        let dObj2 = {};
        for (let j = 0; j < this.camposSelect.length; j++) {
          let nombreCampo = this.camposSelect[j];
          let valorCampo = this.dataImportar[i][j];
          let valorCampo2 = this.dataImportar[i][j];
          if (nombreCampo === 'fechaNacimiento') {
            if (
              valorCampo !== undefined &&
              valorCampo !== null &&
              valorCampo.length > 0 &&
              valorCampo !== ''
            ) {
              let from = valorCampo.split('/');
              valorCampo = new Date(
                parseInt(from[0]),
                parseInt(from[1]) - 1,
                parseInt(from[2])
              );
              valorCampo2 = new Date(
                parseInt(from[0]),
                parseInt(from[1]) - 1,
                parseInt(from[2])
              );
              valorCampo2 = this.yyyyMMdd(valorCampo2);
            }
          }
          Object.defineProperty(dObj, nombreCampo, {
            value: valorCampo,
            writable: true,
            enumerable: true,
            configurable: true,
          });
          Object.defineProperty(dObj2, nombreCampo, {
            value: valorCampo2,
            writable: true,
            enumerable: true,
            configurable: true,
          });
        }
        this.dataImportarCopy.push(dObj2);
        datosGrid2.push(dObj);
      }

      this.isExcel = false;
      this.isExcel2 = true;
      this.tabSelect = 1;
    }
  }

  /**
   * Crea el grid configurado para el excel que se acaba de cargar.
   * @Params: @response es la información que se obtuvo del xhttprequest del service <parseExcel>
   */
  resultExcel(response?: any) {
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

      for (let i = 0; i < this.dataExcel.length; i++) {
        let fecha = this.dataExcel[i].cumpleaños;
        if (
          fecha !== null &&
          fecha !== undefined &&
          fecha !== '' &&
          fecha.length > 10 &&
          fecha.indexOf('T') !== -1
        ) {
          this.dataExcel[i].cumpleaños = this.dataExcel[i].cumpleaños.substring(
            0,
            10
          );
        }
      }

      this.colDefExcel.forEach((e: any, i: any) => {
        const validar = this.colExcel.find((ex: any) => ex.nombre === e.trim());
        if (validar) {
          this.configuracion['header' + i] = validar.idCampo;
          return;
        }

        this.configuracion['header' + i] = undefined;
      });

      $('#file').val('');
      this.isExcel = this.dataExcel.length !== 0;
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

  regresarClientes() {
    this._router.navigate(['catalogos/cliente'], {
      queryParams: {
        idEtiqueta: 'N',
      },
    });
  }
}
