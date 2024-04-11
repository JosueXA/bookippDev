import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/shared/shared.module';
import { SucursalComponent } from './sucursal.component';
import { SucursalRoutingModule } from './sucursal.routing';
import { FormsModule } from '@angular/forms';

// TRANSLATE
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

// NG SELECT
import { NgSelectModule } from '@ng-select/ng-select';

// CURRENCY MASK
import { NgxCurrencyModule } from 'ngx-currency';

// Carousel
import { NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap';

// Popover
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
    declarations: [SucursalComponent],
    imports: [
        CommonModule,
        SharedModule,
        SucursalRoutingModule,
        FormsModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient],
            },
        }),
        NgSelectModule,
        NgxCurrencyModule,
        NgbCarouselModule,
        NgbPopoverModule,
    ],
    providers: [],
})
export class SucursalModule { }
