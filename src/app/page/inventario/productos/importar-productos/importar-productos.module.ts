import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/shared/shared.module';
import { ImportarProductosComponent } from './importar-productos.component';
import { ImportarProductosRoutingModule } from './importar-productos.routing';

// TRANSLATE
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

// NG SELECT
import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
  declarations: [ImportarProductosComponent],
  imports: [
    CommonModule,
    SharedModule,
    ImportarProductosRoutingModule,
    NgSelectModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
  ],
})
export class ImportarProductosModule {}
