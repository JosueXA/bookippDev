import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/shared/shared.module';
import { RecepcionProductoComponent } from './recepcion-producto.component';
import { RecepcionProductoRoutingModule } from './recepcion-producto.routing';

// TRANSLATE
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

// Date range picker
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';

// FULL CALENDAR
import { FullCalendarModule } from '@fullcalendar/angular'; // must go before plugins
import dayGridPlugin from '@fullcalendar/daygrid'; // a plugin!
import interactionPlugin from '@fullcalendar/interaction';

FullCalendarModule.registerPlugins([dayGridPlugin, interactionPlugin]);

@NgModule({
  declarations: [RecepcionProductoComponent],
  imports: [
    CommonModule,
    SharedModule,
    RecepcionProductoRoutingModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    NgxDaterangepickerMd.forRoot(),
    FullCalendarModule,
  ],
})
export class RecepcionProductoModule {}
