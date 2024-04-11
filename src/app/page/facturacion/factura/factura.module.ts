import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from 'src/shared/shared.module';
import { FacturaRoutingModule } from './factura.routing';
import { FacturaComponent } from './factura.component';

// TRANSLATE
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
export function HttpLoaderFactory(http: HttpClient) {
	return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

// NG SELECT
import { NgSelectModule } from '@ng-select/ng-select';

// FULL CALENDAR
import { FullCalendarModule } from '@fullcalendar/angular'; // must go before plugins
import dayGridPlugin from '@fullcalendar/daygrid'; // a plugin!
import interactionPlugin from '@fullcalendar/interaction';
FullCalendarModule.registerPlugins([dayGridPlugin, interactionPlugin]);

// Date range picker
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';

@NgModule({
	declarations: [FacturaComponent],
	imports: [
		CommonModule,
		FacturaRoutingModule,
		SharedModule,
		NgSelectModule,
		FullCalendarModule,
		NgxDaterangepickerMd.forRoot(),
		TranslateModule.forRoot({
			loader: {
				provide: TranslateLoader,
				useFactory: HttpLoaderFactory,
				deps: [HttpClient],
			},
		}),
	],
})
export class FacturaModule { }
