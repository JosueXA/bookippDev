import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'respuestasFormulario'
})
export class RespuestasFormularioPipe implements PipeTransform {

  lista:any=[];
  transform(value: any[],id:number): any[] {
    value.forEach(element => {
        if(element.idFormularioElemento == id)
          this.lista.push(element);
    });
    return this.lista;
  }

}
