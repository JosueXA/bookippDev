import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SharedModule } from "src/shared/shared.module";
import { PersonalComponent } from "./personal.component";
import { PersonalRoutingModule } from "./personal.routing";
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


@NgModule({
    declarations: [
        PersonalComponent
    ],
    imports: [
        CommonModule,
        SharedModule,
        PersonalRoutingModule,
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
        NgbPopoverModule
    ],
    providers: [],
})
export class PersonalModule { }