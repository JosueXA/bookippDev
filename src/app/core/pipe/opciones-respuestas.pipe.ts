import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'opcionesRespuestas'
})
export class OpcionesRespuestasPipe implements PipeTransform {

  lista:any=[];
  transform(value: any[],id:number): any[] {
    value.forEach(element => {
        if(element.idFormularioElemento == id)
          this.lista.push(element);
    });

    return this.lista;
   /* console.log(value.filter((data)=>{data.campo=1}));
    return value.filter((data) => 
    {
       data.campo = 1
    });*/
  }

}
