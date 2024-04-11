import { Component, Inject, OnInit } from "@angular/core";
import { MatSnackBarRef, MAT_SNACK_BAR_DATA } from "@angular/material/snack-bar";
@Component({
    selector: 'app-toaster',
    templateUrl: './toaster.component.html',
    styleUrls: ['./toaster.component.scss'],
})
export class ToasterComponent implements OnInit {
    constructor(
        @Inject(MAT_SNACK_BAR_DATA) public data: any,
        public snackBarRef: MatSnackBarRef<ToasterComponent>
    ) { }
    ngOnInit(): void {
    }
}
