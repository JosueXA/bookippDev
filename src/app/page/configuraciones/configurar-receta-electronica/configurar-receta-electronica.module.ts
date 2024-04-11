import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SharedModule } from "src/shared/shared.module";
import { ConfigurarRecetaElectronicaComponent } from "./configurar-receta-electronica.component";
import { ConfigurarRecetaElectronicaRoutingModule } from "./configurar-receta-electronica.routing";
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


@NgModule({
    declarations: [
        ConfigurarRecetaElectronicaComponent
    ],
    imports: [
        CommonModule,
        SharedModule,
        ConfigurarRecetaElectronicaRoutingModule,
        FormsModule,
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
})
export class ConfigurarRecetaElectronicaModule { }