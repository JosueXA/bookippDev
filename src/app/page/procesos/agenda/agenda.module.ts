import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SharedModule } from "src/shared/shared.module";
import { AgendaComponent } from "./agenda.component";
import { AgendaRoutingModule } from "./agenda.routing";

// FULL CALENDAR
import { FullCalendarModule } from '@fullcalendar/angular'; // must go before plugins
import dayGridPlugin from '@fullcalendar/daygrid'; // a plugin!
import interactionPlugin from '@fullcalendar/interaction'; // a plugin!

FullCalendarModule.registerPlugins([
    dayGridPlugin,
    interactionPlugin
]);

// NG SELECT
import { NgSelectModule } from '@ng-select/ng-select';

// CURRENCY MASK
import { NgxCurrencyModule } from "ngx-currency";

// DATE RANGE PICKER
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';

// TRANSLATE
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

// Popover
import { NgbPopoverModule, NgbPopoverConfig, NgbPopover } from '@ng-bootstrap/ng-bootstrap';

// Scroll Module
import { ScrollingModule } from '@angular/cdk/scrolling';

@NgModule({
    declarations: [
        AgendaComponent
    ],
    imports: [
        CommonModule,
        SharedModule,
        AgendaRoutingModule,
        FullCalendarModule,
        NgSelectModule,
        NgxCurrencyModule,
        NgxDaterangepickerMd,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient]
            }
        }),
        NgbPopoverModule,
        ScrollingModule
    ],
    providers: [NgbPopoverConfig],
})
export class AgendaModule { }