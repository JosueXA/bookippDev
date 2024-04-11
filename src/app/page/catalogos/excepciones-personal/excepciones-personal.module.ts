import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SharedModule } from "src/shared/shared.module";
import { Excepciones_PersonalComponent } from "./excepciones-personal.component";
import { Excepciones_PersonalRoutingModule } from "./excepciones-personal.routing";
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

// POPOVER
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
    declarations: [
        Excepciones_PersonalComponent
    ],
    imports: [
        CommonModule,
        SharedModule,
        Excepciones_PersonalRoutingModule,
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
        NgbPopoverModule,
        NgxDaterangepickerMd.forRoot(),
    ],
    providers: [],
})
export class Excepciones_PersonalModule { }