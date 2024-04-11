import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/shared/shared.module';
import { ProductosComponent } from './productos.component';
import { ProductosRoutingModule } from './productos.routing';

// TRANSLATE
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

// NG SELECT
import { NgSelectModule } from '@ng-select/ng-select';

// Date range picker
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';

// FULL CALENDAR
import { FullCalendarModule } from '@fullcalendar/angular'; // must go before plugins
import dayGridPlugin from '@fullcalendar/daygrid'; // a plugin!
import interactionPlugin from '@fullcalendar/interaction'; // a plugin!

FullCalendarModule.registerPlugins([dayGridPlugin, interactionPlugin]);

// POPOVER
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
    declarations: [ProductosComponent],
    imports: [
        CommonModule,
        SharedModule,
        ProductosRoutingModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient],
            },
        }),
        NgSelectModule,
        NgxDaterangepickerMd.forRoot(),
        FullCalendarModule,
        NgbPopoverModule,
    ],
})
export class ProductosModule { }
