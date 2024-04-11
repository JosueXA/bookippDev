import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SharedModule } from 'src/shared/shared.module';
import { AppRoutingModule } from './app.routing';
import { CoreModule } from './core/core.module';
import { PageModule } from './page/page.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// FULL CALENDAR
import { FullCalendarModule } from '@fullcalendar/angular'; // must go before plugins
import dayGridPlugin from '@fullcalendar/daygrid'; // a plugin!
import interactionPlugin from '@fullcalendar/interaction'; // a plugin!
import timeGridPlugin from '@fullcalendar/timegrid';
import resourceTimeGridPlugin from '@fullcalendar/resource-timegrid';
import momentPlugin from '@fullcalendar/moment';
FullCalendarModule.registerPlugins([
    dayGridPlugin,
    interactionPlugin,
    timeGridPlugin,
    resourceTimeGridPlugin,
    momentPlugin,
]);

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
import { NgxCurrencyModule } from 'ngx-currency';

import { InformacionFiscalClienteComponent } from './page/procesos/agenda/informacion-fiscal-cliente/informacion-fiscal-cliente.component';

@NgModule({
    declarations: [AppComponent, InformacionFiscalClienteComponent],
    imports: [
        BrowserModule,
        PageModule,
        AppRoutingModule,
        CoreModule,
        BrowserAnimationsModule,
        SharedModule,
        FormsModule,
        ReactiveFormsModule,
        FullCalendarModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient],
            },
        }),
        NgSelectModule,
        NgxCurrencyModule,
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule { }
