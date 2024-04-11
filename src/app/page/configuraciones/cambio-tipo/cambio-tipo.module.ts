import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CambioTipoComponent } from './cambio-tipo.component';
import { CambioTipoCreacionEdicionComponent } from './cambio-tipo-creacion-edicion/cambio-tipo-creacion-edicion.component';


// TRANSLATE
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

// NG SELECT
import { NgSelectModule } from '@ng-select/ng-select';
import { SharedModule } from 'src/shared/shared.module';
import { CambioTipoRoutingModule } from './cambio-tipo.routing';
import { FormsModule } from '@angular/forms';


@NgModule({
    declarations: [
        CambioTipoComponent,
    ],
    imports: [
        CommonModule,
        SharedModule,
        CambioTipoRoutingModule,
        FormsModule,
        NgSelectModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient]
            }
        }),
    ]
})
export class CambioTipoModule { }
