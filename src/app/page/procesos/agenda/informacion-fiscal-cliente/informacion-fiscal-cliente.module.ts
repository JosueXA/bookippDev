import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SharedModule } from "src/shared/shared.module";
import { InformacionFiscalClienteComponent } from "./informacion-fiscal-cliente.component";

// NG SELECT
import { NgSelectModule } from '@ng-select/ng-select';

// TRANSLATE
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { AppComponent } from "src/app/app.component";
export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
    declarations: [
        InformacionFiscalClienteComponent
    ],
    imports: [
        CommonModule,
        SharedModule,
        NgSelectModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient]
            }
        }),
    ],
    providers: [],
    bootstrap: [AppComponent],
    entryComponents: [InformacionFiscalClienteComponent],
})
export class InformacionFiscalClienteModule { }