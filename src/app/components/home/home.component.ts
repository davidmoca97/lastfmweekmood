import { Component, OnInit } from '@angular/core';
import { LastfmService } from '../../services/lastfm.service';
import * as moment from 'moment';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  userName: string;
  data: any;
  loading: boolean;
  info: any[];
  error: boolean;
  errorMessage: string;

  constructor(private lastfm: LastfmService) {
    this.userName = 'davidmoca';
    this.loading = false;
    this.data = [];
    this.error = false;
  }

  ngOnInit() {

  }

  searchUser() {
    if (this.loading) {
      return
    }
    this.data = [];
    this.loading = true;
    this.lastfm.getUserWeekScrobbles(this.userName)
      .subscribe((data) => {
        this.data = [ ...this.data, ...data ];
      }, 
      (err) => { // Catch error
        this.loading = false;
        this.error = true;
        this.info = [];
        if (err.status) { // If it's an http error, show other message
          this.errorMessage = "API error, try again";
          return
        }
        this.errorMessage = err.message;
        console.error(err);
      },
        () => { // When observable ends
          const week = this.splitIntoDays();
          const info = this.getFrequents(week);
          this.info = info;
          this.loading = false;
          this.error = false;
        }
      );
  }

  getMostFrequent() {
    const data = this.data;
    const frequent = [];
    for ( const item of data ) {
      if ( frequent[item['url']] ) {
        frequent[item['url']]++;
      } else {
        frequent[item['url']] = 1;
      }
    }
    const newFrequent = [];
    for (const i of Object.keys(frequent)) {
      newFrequent.push({
        url: i,
        freq: frequent[i]
      });
    }
    console.log(newFrequent);
    const sorted = newFrequent.sort( ( x, y) => {
      return y.freq - x.freq;
    });
    console.log(sorted);
  }

  splitIntoDays(): any[] {
    let data = this.data;
    const today = new Date();
    const week = [];
    today.setHours(0);
    today.setMinutes(0);
    today.setSeconds(0);
    for (let i = 6; i >= 0; i--) {
      const pastDate = new Date(today);
      pastDate.setDate(today.getDate() - i);
      const unixTime: number = moment.utc(pastDate).unix();
      const newData = data.filter( (item) => {
        return parseInt(item.date.uts, 10) < unixTime;
      });
      data = data.filter( item => {
        return parseInt(item.date.uts, 10) >= unixTime;
      });
      week.push({
        day: moment(pastDate).subtract('1', 'day').format('dddd'),
        scrobbles: newData,
      });
    }
    return week;
  }

  getFrequents(week: any[]): any[] {
    const frequencyWeek: any[] = [];
    for (const day of week ) {
      const frequent: any[] = [];
      for ( const item of day.scrobbles ) {
        if ( frequent[item['url']] ) {
          frequent[item['url']].freq++;
        } else {
          frequent[item['url']] = item;
          frequent[item['url']].freq = 1;
        }
      }
      const newFrequent = [];
      for (const i of Object.keys(frequent)) {
        newFrequent.push({
          url: i,
          freq: frequent[i],
          day: day.day,
          ...frequent[i]
        });
      }
      const sorted = newFrequent.sort( ( x, y) => {
        return y.freq - x.freq;
      });
      frequencyWeek.push(sorted);
    }
    return frequencyWeek;
  }
}
