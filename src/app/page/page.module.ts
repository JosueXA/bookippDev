import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { PageRoutingModule } from "./page.routing";
import { PageComponent } from "./page.component";
import { SharedModule } from "src/shared/shared.module";

@NgModule({
    declarations: [
        PageComponent,
    ],
    imports: [
        CommonModule,
        PageRoutingModule,
        SharedModule
    ]
})
export class PageModule { }
