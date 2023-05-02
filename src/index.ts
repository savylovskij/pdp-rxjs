import './index.html';
import './index.scss';
import {
  catchError,
  filter,
  fromEvent,
  interval,
  map,
  merge,
  mergeMap,
  of,
  startWith,
  switchMap,
  takeUntil,
  tap,
  throttleTime,
} from 'rxjs';
import { ajax } from 'rxjs/ajax';

const INTERVAL: number = 5000;

const URL = 'https://random-dog-proxy.onrender.com/api';
const ACTIVE = 'Active';
const STOPPED = 'Stopped';

const startEl: HTMLElement = document.getElementById(
  'start'
) as HTMLButtonElement;
const stopEl = document.getElementById('stop') as HTMLButtonElement;
const imgEl = document.getElementById('image') as HTMLImageElement;
const statusEl = document.querySelector('.status-text') as HTMLElement;

const setImageSrc = (src: string): void => {
  imgEl.src = src;
};
const setStatusText = (text: string): void => {
  statusEl.innerText = text;
};

const getImg$ = ajax.getJSON(URL).pipe(
  map(({ url }) => url),
  filter<string>(url => /.*\.(gif|jpe?g|bmp|png)$/gim.test(url))
);

const stop$ = fromEvent(stopEl, 'click').pipe(
  throttleTime(INTERVAL),
  tap(() => setStatusText(STOPPED))
);

const start$ = fromEvent(startEl, 'click').pipe(
  tap(() => setStatusText(ACTIVE)),
  throttleTime(INTERVAL),
  mergeMap(() =>
    interval(INTERVAL).pipe(
      startWith(null),
      switchMap(() =>
        getImg$.pipe(
          tap(setImageSrc),
          catchError(({ message, status }) => {
            console.log('error: ', { message, status });
            return of('');
          })
        )
      ),
      takeUntil(stop$)
    )
  )
);

merge(start$, stop$).subscribe();
