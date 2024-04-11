import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { BookippAppComponent } from "./bookipp-app.component";

const routes: Routes = [
    {
        path: '',
        component: BookippAppComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class BookippAppRouting { }
