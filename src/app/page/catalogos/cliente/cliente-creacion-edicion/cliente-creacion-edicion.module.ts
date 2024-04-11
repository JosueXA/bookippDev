import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClienteCreacionEdicionComponent } from './cliente-creacion-edicion.component';
import { ClienteCreacionEdicionRoutingModule } from './cliente-creacion-edicion.routing';
import { SharedModule } from 'src/shared/shared.module';
import { FormsModule } from '@angular/forms';

// TRANSLATE
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

// NG SELECT
import { NgSelectModule } from '@ng-select/ng-select';

// CURRENCY MASK
import { NgxCurrencyModule } from "ngx-currency";

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

// Date range picker
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { RespuestasFormularioPipe } from 'src/app/core/pipe/respuestas-formulario.pipe';


@NgModule({
    declarations: [
        ClienteCreacionEdicionComponent,
        RespuestasFormularioPipe
    ],
    imports: [
        CommonModule,
        SharedModule,
        FormsModule,
        ClienteCreacionEdicionRoutingModule,
        NgbModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient]
            }
        }),
        NgSelectModule,
        NgxCurrencyModule,
        NgxDaterangepickerMd.forRoot(),
    ]
})
export class ClienteCreacionEdicionModule { }
