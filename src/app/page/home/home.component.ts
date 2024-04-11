import { Component, OnInit } from '@angular/core';
import { CalendarEvent, CalendarMonthViewDay } from 'angular-calendar';
import { Subject } from 'rxjs';


const RED_CELL: 'red-cell' = 'red-cell';
const BLUE_CELL: 'blue-cell' = 'blue-cell';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

    cssClass: string = RED_CELL;

    testList: string[] = [];
    constructor() { }


    refreshView(): void {
        this.cssClass = this.cssClass === RED_CELL ? BLUE_CELL : RED_CELL;
        // this.refresh.next(a);
    }

    ngOnInit(): void {

    }

}
