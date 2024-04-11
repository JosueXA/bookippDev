import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormularioRoutingModule } from './formulario-routing.module';
import { FormularioComponent } from './formulario.component';
import { SharedModule } from 'src/shared/shared.module';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

// TRANSLATE
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

// NG SELECT
import { NgSelectModule } from '@ng-select/ng-select';

// CURRENCY MASK
import { NgxCurrencyModule } from "ngx-currency";

// Date range picker
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { OpcionListaPipe } from 'src/app/core/pipe/opcion-lista.pipe';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    FormularioComponent,
    OpcionListaPipe
  ],
  imports: [
    CommonModule,
    FormularioRoutingModule,
    SharedModule,
    FormsModule,
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

  ]
})
export class FormularioModule { }
