import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EquiposCreacionEdicionComponent } from './equipos-creacion-edicion.component';

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
import { EquiposCreacionEdicionRoutingModule } from './equipos-creacion-edicion.routing';
import { FormsModule } from '@angular/forms';


@NgModule({
    declarations: [
        EquiposCreacionEdicionComponent
    ],
    imports: [
        CommonModule,
        SharedModule,
        EquiposCreacionEdicionRoutingModule,
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
export class EquiposCreacionEdicionModule { }
