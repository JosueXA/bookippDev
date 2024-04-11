import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MethodsService } from './services/methods.service';
import { SetTokenHeaderInterceptors } from './interceptor/set-token.interceptor';
import { OpcionesRespuestasPipe } from './pipe/opciones-respuestas.pipe';

@NgModule({
    declarations: [
  ],
    imports: [
        CommonModule,
    ],
    providers: [
        MethodsService,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: SetTokenHeaderInterceptors,
            multi: true,
        }
    ],
    exports: [HttpClientModule]
})
export class CoreModule { }
