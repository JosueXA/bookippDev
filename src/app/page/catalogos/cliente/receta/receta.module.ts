import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecetaComponent } from './receta.component';
import { RecetaRoutingModule } from './receta.routing';
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

// Scroll Module
import { ScrollingModule } from '@angular/cdk/scrolling';

@NgModule({
    declarations: [
        RecetaComponent
    ],
    imports: [
        CommonModule,
        SharedModule,
        FormsModule,
        RecetaRoutingModule,
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
        ScrollingModule,
        NgxDaterangepickerMd.forRoot(),
    ]
})
export class RecetaModule { }
