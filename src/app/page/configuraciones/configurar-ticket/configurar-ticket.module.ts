import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SharedModule } from "src/shared/shared.module";
import { ConfigurarTicketComponent } from "./configurar-ticket.component";
import { ConfigurarTicketRoutingModule } from "./configurar-ticket.routing";
import { FormsModule } from '@angular/forms';

// TRANSLATE
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

// NG SELECT
import { NgSelectModule } from '@ng-select/ng-select';

// Popover
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
    declarations: [
        ConfigurarTicketComponent
    ],
    imports: [
        CommonModule,
        SharedModule,
        ConfigurarTicketRoutingModule,
        FormsModule,
        NgSelectModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient]
            }
        }),
        NgbPopoverModule
    ],
    providers: [],
})
export class ConfigurarTicketModule { }