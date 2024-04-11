import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SharedModule } from "src/shared/shared.module";
import { TestComponent } from "./test.component";
import { TestRoutingModule } from "./test.routing";

// Popover
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';

// Date range picker
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';

// Carousel
import { NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap';

// FULL CALENDAR
import { FullCalendarModule } from '@fullcalendar/angular'; // must go before plugins
import dayGridPlugin from '@fullcalendar/daygrid'; // a plugin!
import interactionPlugin from '@fullcalendar/interaction'; // a plugin!

FullCalendarModule.registerPlugins([
  dayGridPlugin,
  interactionPlugin
]);

// TRANSLATE
import {HttpClientModule, HttpClient} from '@angular/common/http';
import {TranslateModule, TranslateLoader} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    TestComponent
  ],  
  imports: [
    CommonModule,
    SharedModule,
    TestRoutingModule,
    FullCalendarModule,
    TranslateModule.forRoot({
      loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient]
      }
    }),
    NgbPopoverModule,
    NgxDaterangepickerMd.forRoot(),
    NgbCarouselModule
  ],
  providers: [],
})
export class TestModule { }