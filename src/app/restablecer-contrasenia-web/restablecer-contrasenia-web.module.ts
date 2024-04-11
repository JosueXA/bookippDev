import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { SharedModule } from "../../shared/shared.module";
import { RestablecerContraseniaWebComponent } from "./restablecer-contrasenia-web.component";
import { RestablecerContraseniaWebRouting } from "./restablecer-contrasenia-web.routing";

// TRANSLATE
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
export function HttpLoaderFactory(http: HttpClient) {
	return new TranslateHttpLoader(http, '../../assets/i18n/', '.json');
}

// NG SELECT
import { NgSelectModule } from '@ng-select/ng-select';

// CURRENCY MASK
import { NgxCurrencyModule } from "ngx-currency";

@NgModule({
	declarations: [
		RestablecerContraseniaWebComponent
	],
	imports: [
		RestablecerContraseniaWebRouting,
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
export class RestablecerContraseniaWebModule { }
