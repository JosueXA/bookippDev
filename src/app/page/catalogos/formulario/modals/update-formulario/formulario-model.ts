export class DataFormularios {
  formulario: Formulario
  formularioSeccion: FormularioSeccion[]
  constructor(attrs?: DataFormularios ) {
    this.formulario = attrs ? attrs.formulario : new Formulario('');
    this.formularioSeccion = attrs?.formularioSeccion ? attrs.formularioSeccion : [];
  }



}

export class Formulario {
  idFormulario: number;
  nombre: string;
  idSucursal: number;
  realizoAlta: any;
  fechaAlta: string;
  realizoCambio: any;
  fechaCambio: any;
  realizoBaja: any;
  fechaBaja: any;
  constructor(nombre?: string) {
    this.nombre = this.nombre ? this.nombre : '';
  }
}

export class TipoElemento {
  idTipoElementoFormulario: number
  nombre: string
  labelTranslate?: string
}

export class FormularioSeccion {
  idFormularioSeccion: number
  nombre: string
  orden: number
  seccionDefault: number
  idFormulario: number
  formularioElemento: FormularioElemento[]
}

export class FormularioElemento {
  idFormularioElemento: number;
  descripcion: string;
  idTipoElementoFormulario: number;
  orden: number;
  esRequerido: number;
  idFormularioSeccion: number;
  formularioOpcion: FormularioOpcion[];
  formularioTipoElemento?: TipoElemento;
  lastSeccionId?: number;
  imagenPath: string;
  file?: File;
}

export class FormularioOpcion {
  idFormularioOpcion: number
  descripcion: string
  orden: number
  idFormularioElemento: number
}
