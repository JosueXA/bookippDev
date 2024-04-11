import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SharedModule } from "src/shared/shared.module";
import { ReporteCitasComponent } from "./reporteCitas.component";
import { ReporteCitasRoutingModule } from "./reporteCitas.routing";
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

// POPOVER
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';

// CURRENCY MASK
import { NgxCurrencyModule } from "ngx-currency";

// DATE RANGE PICKER
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';

@NgModule({
    declarations: [
        ReporteCitasComponent
    ],
    imports: [
        CommonModule,
        SharedModule,
        ReporteCitasRoutingModule,
        FormsModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient]
            }
        }),
        NgbPopoverModule,
        NgSelectModule,
        NgxCurrencyModule,
        NgxDaterangepickerMd.forRoot(),
    ],
    providers: [],
})
export class ReporteCitasModule { }