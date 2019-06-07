import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, mergeMap} from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Observable, of, from, concat } from 'rxjs';
import * as moment from 'moment';
import { Scrobble,  } from '../models/scrobble.model';

@Injectable({
  providedIn: 'root'
})
export class LastfmService {

  constructor( private http: HttpClient ) {
    console.log('LastFM service running');
  }

  simpleObservable = new Observable((observer) => (data) => {
    // observable execution
    observer.next('bla bla bla' + data);
    observer.complete();
  });

  private getQuery( query: string ) {
    const url = 'http://ws.audioscrobbler.com/2.0';
    const API_KEY = environment.LAST_FM_API_KEY;
    return this.http.get(`${url}/${query}&api_key=${API_KEY}&format=json`);
  }

  private getScrobblesFromAPI( userName: string, since: number, page: number ) {
    return new Observable( (observer) => {
      this.getQuery(`?method=user.getrecenttracks&limit=200&from=${since}&user=${userName}&page=${page}`)
        .subscribe( data => {
          console.log('data: ', data);
          observer.next(data);
          observer.complete();
        });
    });
  }

  getUserWeekScrobbles( userName: string ) {
    this.simpleObservable.subscribe();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate( oneWeekAgo.getDate() - 7 );
    oneWeekAgo.setMinutes(0);
    oneWeekAgo.setSeconds(0);
    oneWeekAgo.setHours(0);
    const oneWeekAgoUnix: number = moment.utc(oneWeekAgo).unix();

    return this.getQuery(`?method=user.getrecenttracks&limit=200&from=${oneWeekAgoUnix}&user=${userName}&page=${1}`)
    .pipe(
      mergeMap( data => {
        if (data['recenttracks']['@attr'].total == 0) {
          throw new Error("No tracks were found for this user");
        }
        const totalPages: number = parseInt(data['recenttracks']['@attr'].totalPages, 10);
        // const pages: number[] = Array.from(Array(totalPages).keys()).map(x => x + 2);
        const pages: number[] = [];
        for (let i = 2; i <= totalPages; i++) {
          pages.push(i);
        }
        return concat(
          of(data),
         from(pages).pipe(
          mergeMap( page => this.getQuery(`?method=user.getrecenttracks&limit=200&from=${oneWeekAgoUnix}&user=${userName}&page=${page}`)),
        ));
      }),
      map( data => (data['recenttracks']['track'][0]['@attr']) ?
            data['recenttracks']['track'].slice(1) :
            data['recenttracks']['track'])
    );
  }
}
