import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SharedModule } from "src/shared/shared.module";
import { ExcepcionesPersonalCreacionEdicionComponent } from "./excepcionesPersonal-creacion-edicion.component";
import { ExcepcionesPersonalCreacionEdicionRoutingModule } from "./excepcionesPersonal-creacion-edicion.routing";
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

// DATE RANGE PICKER
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';

@NgModule({
    declarations: [
        ExcepcionesPersonalCreacionEdicionComponent
    ],
    imports: [
        CommonModule,
        SharedModule,
        ExcepcionesPersonalCreacionEdicionRoutingModule,
        FormsModule,
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
    ],
    providers: [],
})
export class ExcepcionesPersonalCreacionEdicionModule { }