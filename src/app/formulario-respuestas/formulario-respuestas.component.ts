import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PantallaService } from '../core/services/pantalla.service';
import { FormularioRespuestasService } from './formulario-respuestas.service';
import { ToasterService } from 'src/shared/toaster/toaster.service';
import { FormBuilder, FormGroup, NgForm } from '@angular/forms';
import { URLEncruptService } from 'src/app/core/services/urlencrypt.service';
import { NgSignaturePadOptions } from '@almothafar/angular-signature-pad';

@Component({
    selector: 'app-formulario-respuestas',
    templateUrl: './formulario-respuestas.component.html',
    styleUrls: ['./formulario-respuestas.component.scss']
})
export class FormularioRespuestasComponent implements OnInit {

  BTN_CLICK_RESPONDER_FORM: boolean = false;
  public signaturePadOptions: NgSignaturePadOptions = {
    minWidth: 5,
    canvasWidth: 350,
    canvasHeight: 170
  };

    param: any = [];
    secciones: any = [];
    campos: any = [];
    formularios: any = [];
    campos_detalle_om: any = [];
    campos_detalle_ld: any = [];
    campos_detalle_check: any = [];
    opciones_check: any = [];
    opciones: any = [];
    opciones_list: any = [];
    respuesta: any = [];
    errorValidacion: string = "";
    formulario: FormGroup;

    constructor(private _backService: FormularioRespuestasService,
        private fb: FormBuilder,
        private _route: ActivatedRoute, private _toaster: ToasterService,
        private _pantallaServicio: PantallaService,
        public _urlEncrypt: URLEncruptService) { }

    ngOnInit(): void {
        this._route.queryParams.subscribe(params => {
            var url = this._urlEncrypt.desencrypt(params["param"]);
            this.param = url?.split(',');
            if (this.param?.length > 0) {
                this.cargarFormulario();
                return;
            }
        },
            error => {
                this._toaster.error("Ha ocurrido un error");
            });


    }

    drawStart(event: MouseEvent | Touch) {
    }

    limpiarDibujo(campo: any) {
      campo.imagenPath = null;
    }

    drawComplete(event: MouseEvent | Touch, base64: any, campo: any) {
      campo.imagenPath = base64;
    }

    onChangeTextSinInput(event: any[], requerido: number) {
        var respuesta = (<HTMLInputElement>document.getElementById('TEXTSI-' + event)).value;

        if (respuesta.trim() != '') {
            $("#" + 'TEXTSI-' + event).removeClass("errorCampo");

        } else {
            if (requerido == 0) {
                $("#" + 'TEXTSI-' + event).removeClass("errorCampo");
            } else {
                $("#" + 'TEXTSI-' + event).addClass("errorCampo");
            }

        }
    }

    cargarFormulario() {

        this._pantallaServicio.mostrarSpinner();
        this._backService.HttpPost("aspxs/FormularioRespuesta/cargarFormulario", {}, { idFormulario: this.param[0], idCliente: this.param[1], fecha: this.param[2] }).subscribe(
            response => {
                this.formularios = response.Formularios;
                this.secciones = response.Secciones;
                this.campos = response.Campos;
                this.campos_detalle_check = response.OpcionesCheck;
                this.campos_detalle_om = response.Opciones;
                this.campos_detalle_ld = response.Listas;

                /* for(let i =0 ; i<this.campos.length;i++){
                   var a = this.fb.group({
                     datos:this.fb.array(this.campos[i].descripcion)
                   });

                   this.formulario = (a);
                 }

                 console.log(this.formulario)*/
                this._pantallaServicio.ocultarSpinner();

            },
            error => {
                this._toaster.error("Ha ocurrido un error");
                this._pantallaServicio.ocultarSpinner();
            }
        );
    }

    guardarRespuesta() {
      this.BTN_CLICK_RESPONDER_FORM = true;
        this.respuesta = [];
        this.opciones = [];
        this.opciones_check = [];
        this.opciones_list = [];
        this.errorValidacion = "";

        for (let i = 0; i < this.campos.length; i++) {

            if (this.campos[i].idTipoElementoFormulario == 1) {//Opción Multiple - Respuesta Multiple

                let contador_resmu = 0;

                this.opciones_check = this.campos_detalle_check.filter((e: any) => e.idFormularioElemento == this.campos[i].idFormularioElemento);

                for (let j = 0; j < this.opciones_check.length; j++) {

                    var element = <HTMLInputElement>document.getElementById('OM-' + this.opciones_check[j].idFormularioOpcion);
                    if (element.checked == true) {
                        this.respuesta.push({ "idFormularioElemento": this.campos[i].idFormularioElemento, "respuestaLibre": "", "idFormularioOpcion": this.opciones_check[j].idFormularioOpcion });
                        contador_resmu++;
                    }

                }

                if (contador_resmu == 0 && this.campos[i].esRequerido === 1) {
                    // $("#txtTelefono").addClass("errorCampo");
                    var a = <HTMLInputElement>document.getElementById('error' + this.campos[i].idFormularioElemento);
                    a.innerHTML = "  * Requerido. ";

                    //var pregunta = <HTMLInputElement>document.getElementById('pregunta' + this.campos[i].idFormularioElemento);
                    //  pregunta.style.color = "red";

                    this.errorValidacion += "\n" + this.campos[i].descripcion + " * ";
                } else {
                    var a = <HTMLInputElement>document.getElementById('error' + this.campos[i].idFormularioElemento);
                    a.innerHTML = "";

                    //var pregunta = <HTMLInputElement>document.getElementById('pregunta' + this.campos[i].idFormularioElemento);
                    //pregunta.style.color = "black";
                }

            }

            if (this.campos[i].idTipoElementoFormulario == 2) {//Opción Multiple - Respuesta Sencilla
                let contador_resop = 0;

                this.opciones = this.campos_detalle_om.filter((e: any) => e.idFormularioElemento == this.campos[i].idFormularioElemento);

                for (let j = 0; j < this.opciones.length; j++) {
                    var respuesta_sencilla = <HTMLInputElement>document.getElementById('OP-' + this.opciones[j].idFormularioOpcion);
                    if (respuesta_sencilla.checked == true) {
                        this.respuesta.push({ "idFormularioElemento": this.campos[i].idFormularioElemento, "respuestaLibre": "", "idFormularioOpcion": this.opciones[j].idFormularioOpcion });
                        contador_resop++;
                    }
                }

                if (contador_resop == 0 && this.campos[i].esRequerido === 1) {
                    var a = <HTMLInputElement>document.getElementById('error' + this.campos[i].idFormularioElemento);
                    a.innerHTML = "  * Requerido. ";

                    this.errorValidacion += "\n" + this.campos[i].descripcion + " * ";
                }

            }

            if (this.campos[i].idTipoElementoFormulario == 3) {//Texto

                var respuesta = (<HTMLInputElement>document.getElementById('TEXT-' + this.campos[i].idFormularioElemento)).value;

                if (respuesta.trim() != '') {
                    this.respuesta.push({ "idFormularioElemento": this.campos[i].idFormularioElemento, "respuestaLibre": respuesta.trim(), "idFormularioOpcion": 0 });
                }
                else {
                    if (this.campos[i].esRequerido === 1) {

                        var pregunta = <HTMLInputElement>document.getElementById('TEXT-' + this.campos[i].idFormularioElemento);
                        pregunta.style.outline = "1px solid red";
                        this.errorValidacion += "\n" + this.campos[i].descripcion + " * ";

                    }


                    /*

                    .borderAzul {
                    height: 34px !important;
                    outline: 1px solid #337dc0 !important;
                    outline-offset: 0 !important;
                    border: none;
                }
                */

                }


            }

            if (this.campos[i].idTipoElementoFormulario == 4) {//Lista

                this.opciones_list = this.campos_detalle_ld.filter((e: any) => e.idFormularioElemento == this.campos[i].idFormularioElemento);
                var list = (<HTMLInputElement>document.getElementById('LIST-' + this.campos[i].idFormularioElemento)).value;
                if (list != "0")
                    this.respuesta.push({ "idFormularioElemento": this.campos[i].idFormularioElemento, "respuestaLibre": "", "idFormularioOpcion": list });
                else {
                    if (this.campos[i].esRequerido === 1) {
                        var pregunta = <HTMLInputElement>document.getElementById('LIST-' + this.campos[i].idFormularioElemento);

                        pregunta.style.outline = "1px solid red";
                        this.errorValidacion += "\n" + this.campos[i].descripcion + " * ";
                    }

                }


            }

            if (this.campos[i].idTipoElementoFormulario == 6) {//Texto

                var respuesta = (<HTMLInputElement>document.getElementById('TEXTSI-' + this.campos[i].idFormularioElemento)).value;
                console.log(this.campos[i])
                console.log(respuesta);
                if (respuesta.trim() != '') {
                    $("#" + 'TEXTSI-' + this.campos[i].idFormularioElemento).removeClass("errorCampo");
                    this.respuesta.push({ "idFormularioElemento": this.campos[i].idFormularioElemento, "respuestaLibre": respuesta.trim(), "idFormularioOpcion": 0 });
                }
                else {

                    if (this.campos[i].esRequerido === 1) {
                        var preguntatex = <HTMLInputElement>document.getElementById('TEXTSI-' + this.campos[i].idFormularioElemento);
                        preguntatex.style.outline = "1px solid red";


                        $("#" + 'TEXTSI-' + this.campos[i].idFormularioElemento).addClass("errorCampo");
                        this.errorValidacion += "\n" + this.campos[i].descripcion + " * ";
                    }
                }
            }
            if(this.campos[i].idTipoElementoFormulario === 7) {
              if ((this.campos[i].imagenPath?.lenght === 0 || !this.campos[i].imagenPath) && this.campos[i].esRequerido === 1) {
                this.errorValidacion += "\n" + this.campos[i].descripcion + " * ";
              } else {
                this.respuesta.push({ "idFormularioElemento": this.campos[i].idFormularioElemento, "respuestaLibre": ``, "idFormularioOpcion": 0, imagenPath: this.campos[i].imagenPath });

              }
            }
            if(this.campos[i].idTipoElementoFormulario === 8) {
              if ((this.campos[i].imagenPath?.lenght === 0 || !this.campos[i].imagenPath) && this.campos[i].esRequerido === 1) {
                this.errorValidacion += "\n" + this.campos[i].descripcion + " * ";
              } else {
                this.respuesta.push({ "idFormularioElemento": this.campos[i].idFormularioElemento, "respuestaLibre": ``, "idFormularioOpcion": 0, imagenPath: this.campos[i].imagenPath });

              }
            }


        }

        if (this.errorValidacion != "") {
            //this._toaster.error("Campos Incompletos");
        } else {
            this._pantallaServicio.mostrarSpinner();

            var params = {
                idFormulario: this.param[0],
                idCliente: this.param[1],
                fechaVigencia: this.param[2],
                respuestas: this.respuesta
            }

            this._backService.HttpPost("aspxs/FormularioRespuesta/guardarFormulario", {}, params).subscribe(
                response => {
                    if (response > 0) {

                        this._pantallaServicio.ocultarSpinner();
                        this._toaster.success("Las respuestas fueron guardadas.");
                        //limpiamos los arrreglos
                        this.limpiarFomulario();

                    }
                    else {
                        if (response == 0) {
                            this._toaster.error("Ha ocurrido un error interno comunicar al Administrador");
                        }
                        else if (response == -1) {
                            this._toaster.error("Ya no se cumple con la fecha de Vigencia");
                        }

                        this._pantallaServicio.ocultarSpinner();
                    }


                },
                error => {
                    this._toaster.error("Ha ocurrido un error");
                    this._pantallaServicio.ocultarSpinner();
                }
            );
        }


    }


    imagePreview(e: any, campo: any) {
      const file: File = e.target.files[0];
      // const filev = file;
      const render = new FileReader();
      render.onload = () => {
        campo.imagenPath= render.result as string;
      };
      render.readAsDataURL(file);
      e.srcElement.value = null;
    }



    /* Validamos los campos para poder camiar los colores
    y advertencias de los campos faltantes */

    onChangeOpcionMultiple(event: any[], requerido: number) {

        let seleccionados = 0;
        var a = <HTMLInputElement>document.getElementById('error' + event);

        var checksSeleccionados = this.campos_detalle_check.filter((e: any) => e.idFormularioElemento == event);

        for (let j = 0; j < checksSeleccionados.length; j++) {

            var element = <HTMLInputElement>document.getElementById('OM-' + checksSeleccionados[j].idFormularioOpcion);
            if (element.checked == true) {
                seleccionados++;
            }
        }
        if (requerido == 0) {
            a.innerHTML = "";
        } else {
            if (seleccionados > 0) {
                a.innerHTML = "";
            } else {
                a.innerHTML = "  * Requerido. ";
            }
        }

    }

    onChangeOpcion(event: any[], requerido: number) {
        let opciones = 0;
        var a = <HTMLInputElement>document.getElementById('error' + event);

        var opcionesSeleccionadas = this.campos_detalle_om.filter((e: any) => e.idFormularioElemento == event);

        for (let j = 0; j < opcionesSeleccionadas.length; j++) {
            var respuesta_sencilla = <HTMLInputElement>document.getElementById('OP-' + opcionesSeleccionadas[j].idFormularioOpcion);
            if (respuesta_sencilla.checked == true) {
                opciones++;
            }
        }
        if (requerido == 0) {
            a.innerHTML = "";
        } else {
            if (opciones > 0) {
                a.innerHTML = "";
            } else {
                a.innerHTML = "  * Requerido. ";
            }

        }

    }

    onChangeText(event: any[], requerido: number) {
        var respuesta = (<HTMLInputElement>document.getElementById('TEXT-' + event)).value;
        var pregunta = <HTMLInputElement>document.getElementById('TEXT-' + event);

        if (respuesta.trim() != '') {
            pregunta.style.outline = "1px solid #ced4da";
        } else {
            if (requerido == 0) {
                pregunta.style.outline = "1px solid #ced4da";
            } else {
                pregunta.style.outline = "1px solid red";

            }

        }
    }

    onChangeLista(event: any[], requerido: number) {
        var list = (<HTMLInputElement>document.getElementById('LIST-' + event)).value;
        var pregunta = <HTMLInputElement>document.getElementById('LIST-' + event);

        if (list != "0")
            pregunta.style.outline = "1px solid #ced4da";
        else {
            if (requerido == 0) {
                pregunta.style.outline = "1px solid #ced4da";
            }
            else {
                pregunta.style.outline = "1px solid red";
            }
        }
    }

    limpiarFomulario() {
        this.secciones = [];
        this.campos = [];
        this.formularios = [];
        this.campos_detalle_om = [];
        this.campos_detalle_ld = [];
        this.campos_detalle_check = [];
        this.BTN_CLICK_RESPONDER_FORM = false;
        this.cargarFormulario();
    }

}
