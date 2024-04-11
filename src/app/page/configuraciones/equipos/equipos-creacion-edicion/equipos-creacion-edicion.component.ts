import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MethodsService } from 'src/app/core/services/methods.service';
import { PantallaService } from 'src/app/core/services/pantalla.service';
import { ToasterService } from 'src/shared/toaster/toaster.service';
declare var $: any; // JQUERY
import * as bootstrap from 'bootstrap'; // BOOTSTRAP
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'app-equipos-creacion-edicion',
    templateUrl: "./equipos-creacion-edicion.component.html",
    styleUrls: ['./equipos-creacion-edicion.component.scss', '../../../page.component.scss']
})
export class EquiposCreacionEdicionComponent implements OnInit {

    // Variables de Translate
    excepcionesTranslate: any = {};
    informacionFiscalCliente: any = {};
    usuarioTranslate: any = {};
    equiposTranslate: any = {};
    configuracionSucursalTranslate: any = {};

    stateParams_idEquipo: any;

    modales: any = {};

    constructor(private _translate: TranslateService,
        private _backService: MethodsService,
        public _pantallaServicio: PantallaService,
        private _dialog: MatDialog,
        private _router: Router,
        private _toaster: ToasterService,
        private _route: ActivatedRoute,
        private matIconRegistry: MatIconRegistry, 
        private domSanitizer: DomSanitizer) {

        this._translate.setDefaultLang(this._pantallaServicio.idioma);
        this._translate.use(this._pantallaServicio.idioma);

        this._translate.get('excepcionesTranslate').subscribe((translated) => {
            this.excepcionesTranslate = this._translate.instant('excepcionesTranslate');
            this.informacionFiscalCliente = this._translate.instant('informacionFiscalCliente');
            this.usuarioTranslate = this._translate.instant('usuarioTranslate');
            this.equiposTranslate = this._translate.instant('equiposTranslate');
            this.configuracionSucursalTranslate = this._translate.instant('configuracionSucursalTranslate');
        });

        this.matIconRegistry.addSvgIcon('iconCasa1', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Casa1-icon.svg"));
        this.matIconRegistry.addSvgIcon('iconFlecha1DerechaPeque', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/FlechaDerechaPequena-icon.svg"));
    }

    ngOnInit(): void {
        this.crearModales();

        this._route.queryParams.subscribe(params => {
            this.stateParams_idEquipo = params["idEquipo"];
        });

        this.cargarServicios();
    }

    crearModales() {

        if ($("body").find(".modal-confirm").length > 1) {
            $("body").find(".modal-confirm")[1].remove();
        }
        this.modales.modalConfirm = new bootstrap.Modal($("#modal-confirm").appendTo("body"), {
            backdrop: "static",
            keyboard: false,
        });
    }

    rootScope_fromState = "";

    divStyle = 'none';
    direccion = "";
    tipoPantalla = this.excepcionesTranslate.nueva;
    equipo = {
        nombre: "",
        descripcion: "",
        cantidad: "",
        servicios: [],
        dataServicios: [],
    };
    dataOriginal: any = [];

    valido = true;
    clickG = 0;
    guardar = false;

    // $("#btnCancelar").attr('disabled', 'disabled');

    cargarServicios() {
        this._backService.HttpPost("catalogos/Equipos/cargarServicios", {}, {}).subscribe((data: any) => {
            this.equipo.dataServicios = eval(data);
            this.cargarPantalla();
        });
    }

    dataTempt: any;
    cargarPantalla() {
        if (this.stateParams_idEquipo != 'N') {
            this.tipoPantalla = this.excepcionesTranslate.actualizar;
            if (this.stateParams_idEquipo != undefined && this.stateParams_idEquipo != null && this.stateParams_idEquipo != "") {
                var params: any = {};
                params.idEquipo = this.stateParams_idEquipo;

                this._backService.HttpPost("catalogos/Equipos/consultarEquipo", {}, params).subscribe((data: any) => {
                    this.dataTempt = eval(data);
                    var servicios = [];

                    this.equipo.nombre = this.dataTempt[0].nombre;
                    this.equipo.descripcion = this.dataTempt[0].descripcion;
                    this.equipo.cantidad = this.dataTempt[0].cantidad;
                    for (var i = 0; i < this.dataTempt.length; i++) {
                        servicios.push(this.dataTempt[i].idServicio)
                    }
                    this.equipo.servicios = JSON.parse(JSON.stringify(servicios));
                    this.dataOriginal = JSON.parse(JSON.stringify(this.equipo));

                    this.divStyle = 'block';
                    $('#dir2').hide();
                    $('#dir1').show();
                    $("#btnCancelar").removeAttr("disabled");
                });

            } else {
                this._router.navigate(['configuraciones/equipo'], {
                    queryParams: { idEquipo: 'N' },
                });
            }
        } else {

            this._backService.HttpPost("catalogos/Equipos/consultarEquipos", {}, {}).subscribe((data: any) => {
                var dataTemp = eval(data);
                if (dataTemp.length > 0) {
                    $('#dir2').hide();
                    $('#dir1').show();
                    $("#btnCancelar").removeAttr("disabled");
                }
            }, error => {

            });
            this.divStyle = 'block';
        }
    }

    accesoTotal: any;
    Guardar() {
        if (this.stateParams_idEquipo == 'N') {
            var params: any = {};
            params.nombre = this.equipo.nombre;
            params.descripcion = this.equipo.descripcion;
            params.cantidad = this.equipo.cantidad;
            params.idServicio = this.equipo.servicios;

            this._backService.HttpPost("catalogos/Equipos/guardarEquipo", {}, params).subscribe((data: any) => {
                this.clickG = 0;
                this._router.navigate(['configuraciones/consultaEquipos']);
            }, error => {

            });

        } else {
            var params: any = {};
            params.idEquipo = this.stateParams_idEquipo;
            params.nombre = this.equipo.nombre;
            params.descripcion = this.equipo.descripcion;
            params.cantidad = this.equipo.cantidad;
            params.idServicio = this.equipo.servicios;

            this._backService.HttpPost("catalogos/Equipos/actualizarEquipo", {}, params).subscribe((data: any) => {
                this.clickG = 0;
                this._router.navigate(['configuraciones/consultaEquipos']);
            }, error => {

            });
        }
    }

    //Función para cancelar la alta o edición de registros
    cancelarPantalla(direccion: any) {
        if (this.stateParams_idEquipo == "N") {
            if (this.equipo.servicios.length != 0 || this.equipo.nombre != "" || this.equipo.descripcion != "" || this.equipo.cantidad != "") {
                this.direccion = direccion;
                this.modalDescartar();
            }
            else {
                this._router.navigate(['/' + direccion]);
            }
        } else {

            if (this.dataOriginal.nombre != this.equipo.nombre || this.dataOriginal.descripcion != this.equipo.descripcion || this.dataOriginal.cantidad != this.equipo.cantidad || this.dataOriginal.servicios.length != this.equipo.servicios.length) {
                this.direccion = direccion;
                this.modalDescartar();
            }
            else {
                var cont = 0;
                for (var i = 0; i < this.dataOriginal.servicios.length; i++) {
                    for (var j = 0; j < this.equipo.servicios.length; j++) {
                        if (this.dataOriginal.servicios[i] == this.equipo.servicios[j]) {
                            cont++;
                        }
                    }
                }

                if (this.dataOriginal.servicios.length == cont) {
                    this._router.navigate(['/' + direccion]);
                }
                else {
                    this.direccion = direccion;
                    this.modalDescartar();
                }
            }
        }
    }

    validar() {
        this.valido = true;
        this.guardar = true;
        var regex = /^[a-zA-Z0-9À-ÖØ-öø-ÿ]+\.?(( |\-)[a-zA-Z0-9À-ÖØ-öø-ÿ]+\.?)*$/;
        var numExp = RegExp("^[0-9]*$");

        if (this.equipo.nombre == "") {
            $("#nombre").addClass("errorCampo");
            $('#errornombre').text('');
            this.valido = false;
        } else {
            if (!regex.test(this.equipo.nombre)) {
                $("#nombre").addClass("errorCampo");
                $('#errornombre').text(this.usuarioTranslate.formatoNombre);
                this.valido = false;
            } else {
                $("#nombre").removeClass("errorCampo");
                $('#errornombre').text('');
            }
        }
        if (this.equipo.descripcion == "") {
            $("#descripcion").addClass("errorCampo");
            $('#errordescripcion').text('');
            this.valido = false;
        } else {
            if (!regex.test(this.equipo.descripcion)) {
                $("#descripcion").addClass("errorCampo");
                $('#errordescripcion').text(this.equiposTranslate.formatoDescripcion);
                this.valido = false;
            } else {
                $("#descripcion").removeClass("errorCampo");
                $('#errordescripcion').text('');
            }
        }
        if (this.equipo.cantidad == "") {
            $("#cantidad").addClass("errorCampo");
            $('#errorcantidad').text('');
            this.valido = false;
        } else {
            if (!numExp.test(this.equipo.cantidad)) {
                $("#cantidad").addClass("errorCampo");
                $('#errorcantidad').text(this.configuracionSucursalTranslate.soloEnteros);
                this.valido = false;
            } else {
                $("#cantidad").removeClass("errorCampo");
                $('#errorcantidad').text('');
            }
        }
        if (this.equipo.servicios.length == 0) {
            //$("#ddlServicios").addClass("errorCampo");
            $("#ddlServicios > div:first-child").attr("style", "outline: red solid 1px !important;");
            this.valido = false;
        } else {
            //$("#ddlServicios").removeClass("errorCampo");
            $("#ddlServicios > div:first-child").attr("style", "outline: none;");
        }
        if (this.valido) {
            if (this.clickG == 0) {
                this.Guardar();
            }
            this.clickG++;
        }
    }

    txtfocus(v: any, event: any, t: any) {
        if (t == 'f') {
            if (this.guardar) {
                var txt: any = document.getElementById(event.target.id);
                var error: any = document.getElementById('error' + event.target.id);

                if (error.innerHTML == '' || error.innerHTML == undefined) {
                    $("#" + event.target.id).removeClass("errorCampo");
                }
            }
        } else {
            if (this.guardar) {
                var txt: any = document.getElementById(event.target.id);
                if (txt.value == "" || txt.value == undefined) {
                    $("#" + event.target.id).addClass("errorCampo");
                } else {
                    var error: any = document.getElementById('error' + event.target.id);
                    if (error.innerHTML == '' || error.innerHTML == undefined) {
                        $("#" + event.target.id).removeClass("errorCampo");
                    }
                }
            }
        }
    };

    modalDescartar() {
        $("#modal-confirm .modal-body").html('<span class="title">' + this.informacionFiscalCliente.descartar + '</span>');
        this.modales.modalConfirm.show();
    }

    redireccion() {
        this._router.navigate(['/' + this.direccion]);
    }

    onClickDdl(elemento: any) {
        if (this.guardar) {
            //$("#" + elemento).removeClass('errorCampo');            
            $("#" + elemento + " > div:first-child").attr("style", "outline: none;");
        }
    }

    irAAgenda(){
        this._router.navigate(['/procesos/agenda']);
    }

    irAEquipos(){
        this._router.navigate(['/configuraciones/consultaEquipos']);
    }
}
