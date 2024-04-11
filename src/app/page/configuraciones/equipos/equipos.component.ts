import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MethodsService } from 'src/app/core/services/methods.service';
import { PantallaService } from 'src/app/core/services/pantalla.service';
import { ToasterService } from 'src/shared/toaster/toaster.service';
declare var $: any; // JQUERY
import * as bootstrap from 'bootstrap'; // BOOTSTRAP
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-equipos',
  templateUrl: './equipos.component.html',
  styleUrls: ['./equipos.component.scss', '../../page.component.scss']
})

export class EquiposComponent implements OnInit {
    // Variables de Translate
    consultaExcepcionesTranslate: any = {};
    consultaServicioTranslate: any = {};
    promocionTranslate: any = {};
    agendaTranslate: any = {};
    equiposTranslate: any = {};

    // Modales
    modales: any = {};

    displayedColumns: any [] = ['acciones', 'nombre', 'cantidad', 'servicio', 'descripcion'];    
      
	dataSource = new MatTableDataSource<any>([]);
	@ViewChild(MatPaginator) paginator!: MatPaginator;
	@ViewChild(MatSort) sort!: MatSort;    

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

            this._translate.get('consultaExcepcionesTranslate').subscribe((translated) => {                        
                this.consultaExcepcionesTranslate = this._translate.instant('consultaExcepcionesTranslate');
                this.consultaServicioTranslate = this._translate.instant('consultaServicioTranslate');
                this.promocionTranslate = this._translate.instant('promocionTranslate');
                this.agendaTranslate = this._translate.instant('agendaTranslate');
                this.equiposTranslate = this._translate.instant('equiposTranslate');
            });

            this.matIconRegistry.addSvgIcon('iconAgregar', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Agregar-1-icon.svg"));
            this.matIconRegistry.addSvgIcon('iconCasa1', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Casa1-icon.svg"));
            this.matIconRegistry.addSvgIcon('iconFlecha1DerechaPeque', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/FlechaDerechaPequena-icon.svg"));
            this.matIconRegistry.addSvgIcon('iconEditar', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Editar-icon.svg"));
            this.matIconRegistry.addSvgIcon('iconBasura', this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/icons/finales/Basura-icon.svg"));
    }

    ngOnInit(): void {
        this.crearModales();

        setTimeout(() => {
            
        });
        this.consultaPrincipal();
    }

    ngAfterViewInit() {
		this.paginator._intl.itemsPerPageLabel = 'Filas por página';
		this.dataSource.paginator = this.paginator;
		this.dataSource.sort = this.sort;
	}

    crearModales() {
        if($("body").find(".modal-confirm").length > 1){
            $("body").find(".modal-confirm")[1].remove();
        }
        this.modales.modalConfirm = new bootstrap.Modal($("#modal-confirm").appendTo("body"), {
            backdrop: "static", 
            keyboard: false,
        });
    }

    rootScope_fromState = "";

    screenGridStyleA = 'none';
    altura = 0;

    //Define las propiedades del grid
    gridOptions = {
    enableSorting: true,
    enableHiding: false,
    enableColumnMenus: false,
    enableColumnResizing: true,
    data: 'dataEquipos',
    enableVerticalScrollbar: 0,
    enableHorizontalScrollbar: 2,
    columnDefs: [
        {
            name: this.consultaExcepcionesTranslate.acciones,
        },
        { displayName: this.consultaServicioTranslate.nombre, field: 'nombre', width: '180', headerCellClass: "alignCenter", cellClass: "alignLeft" },
        { displayName: this.promocionTranslate.cantidad, field: 'cantidad', width: '100', headerCellClass: "alignCenter", cellClass: "alignCenter" },
        { displayName: this.agendaTranslate.servicio, field: 'servicio', width: '180', headerCellClass: "alignCenter", cellClass: "alignLeft" },
        { displayName: this.equiposTranslate.descripcionEquipo, field: 'descripcion', minWidth: '300', headerCellClass: "alignCenter", cellClass: "alignLeft" }
        ]
    };  

    dataEquipos:any;
    //Función que carga los datos del grid
    consultarEquipos() {
        this._backService.HttpPost("catalogos/Equipos/consultarEquipos", {}, {}).subscribe( (data:any) => {
            var dataTemp = eval(data);
            this.dataEquipos = JSON.parse(JSON.stringify(dataTemp));
            this.dataSource.data = this.dataEquipos;
            this.altura = dataTemp.length * 30 + 57;
            this.screenGridStyleA = 'initial';

            if (dataTemp.length == 0) {
                // $location.path('/equipo/N');
                this._router.navigate(['configuraciones/equipo'], {
                    queryParams: { idEquipo: 'N' },            
                });
            } else {
                $("#screenGrid").show();                
            }
        }, error => {

        });
    }

    equipoSelec:any;
    //Función que muestra el modal para eliminar un registro
    modalBorrar(row:any) {
        this.equipoSelec = row;
        $("#modal-confirm .modal-body").html('<span class="title">' + this.equiposTranslate.deseaBorrar + '</span>');
        this.modales.modalConfirm.show();
    };

    accesoTotal:any;
    //Función que borra un registro del grid
    borrarEquipo() {
        var params:any = {};
        params.idEquipo = this.equipoSelec.idEquipo;

        this._backService.HttpPost("catalogos/Equipos/borrarEquipo", {}, params).subscribe( (data: any) => {
            this.consultarEquipos();
        }, error => {

        });
    }

    accesosPantalla:any = {
        lecturaEquipos: null,
        accionEquipos: null,
    };
    consultaPrincipal(){

        this._backService.HttpPost("catalogos/ConfiguracionPerfil/ConsultaVariblesSession", {}, {}).subscribe((data) => {
            this.accesosPantalla = {};
            var dataTemp = eval(data);
            for (var i = 0; i < dataTemp.length; i++) {
                switch (dataTemp[i].Codigo) {
                    case "CONFIGCT001":
                        this.accesosPantalla.lecturaEquipos = dataTemp[i].Valor;
                        break;
                    case "CONFIGCT002":
                        this.accesosPantalla.accionEquipos = dataTemp[i].Valor;
                        break;
                }
            }
            this.consultarEquipos();
        }, error => {
            this._router.navigate(['/login']);
        });
    }

    editarEquipo(idEquipo: any){
        this._router.navigate(['configuraciones/equipo'], {
            queryParams: { idEquipo: idEquipo },            
        });
    }

    irAAgenda(){
        this._router.navigate(['/procesos/agenda']);
    }
}