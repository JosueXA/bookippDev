import { Component, OnInit } from '@angular/core';

// date range picker
import moment from 'moment';

// carousel
import '@angular/localize/init';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss', '../../page.component.scss'],
})
export class TestComponent {
	constructor() {

	}

    // date range picker
    selected: any;
    alwaysShowCalendars: boolean;
    ranges: any = {
        'Today': [moment(), moment()],
        'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
        'Last 7 Days': [moment().subtract(6, 'days'), moment()],
        'Last 30 Days': [moment().subtract(29, 'days'), moment()],
        'This Month': [moment().startOf('month'), moment().endOf('month')],
        'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
    }
    invalidDates: moment.Moment[] = [moment().add(2, 'days'), moment().add(3, 'days'), moment().add(5, 'days')];

    isInvalidDate = (m: moment.Moment) =>  {
        return this.invalidDates.some(d => d.isSame(m, 'day') )
    }

    // carousel
    images = [944, 1011, 984].map((n) => `https://picsum.photos/id/${n}/900/500`);
}
