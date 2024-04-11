import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { SharedModule } from "../../shared/shared.module";
import { BookippAppComponent } from "./bookipp-app.component";
import { BookippAppRouting } from "./bookipp-app.routing";

// TRANSLATE
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
export function HttpLoaderFactory(http: HttpClient) {
	return new TranslateHttpLoader(http, '../../assets/i18n/facebook/', '.json');
}

// NG SELECT
import { NgSelectModule } from '@ng-select/ng-select';

// CURRENCY MASK
import { NgxCurrencyModule } from "ngx-currency";

@NgModule({
	declarations: [
		BookippAppComponent
	],
	imports: [
		BookippAppRouting,
		CommonModule,
		SharedModule,
		TranslateModule.forRoot({
			loader: {
				provide: TranslateLoader,
				useFactory: HttpLoaderFactory,
				deps: [HttpClient]
			}
		}),
		NgSelectModule,
		NgxCurrencyModule,
	]
})
export class BookippAppModule { }
