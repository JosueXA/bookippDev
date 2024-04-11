import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'opcionLista'
})
export class OpcionListaPipe implements PipeTransform {
  lista:any=[];
  transform(value: any[],idFormularioElemento:number): any[] {
    value.forEach(element => {
        if(element.idFormularioElemento == idFormularioElemento)
          this.lista.push(element);
    });

    return this.lista;
   /* console.log(value.filter((data)=>{data.campo=1}));
    return value.filter((data) => 
    {
       data.campo = 1
    });*/
  }
/*
  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }
*/
}
