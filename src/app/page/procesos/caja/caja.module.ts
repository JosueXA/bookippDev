import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/shared/shared.module';
import { FormsModule } from '@angular/forms';
import { CajaComponent } from './caja.component';
import { CajaRoutingModule } from './caja.routing';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxCurrencyModule } from 'ngx-currency';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';

// TRANSLATE
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    CajaComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    CajaRoutingModule,
    NgbModule,
    TranslateModule.forRoot({
      loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient]
        }
    }),  
    NgSelectModule,
    NgxCurrencyModule,
    NgxDaterangepickerMd.forRoot(),
  ],
  exports: [
    CajaComponent
  ]
})
export class CajaModule { }
