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

const INTERVAL = 5000;

const URL = 'https://random-dog-proxy.onrender.com/api';
const ACTIVE = 'Active';
const STOPPED = 'Stopped';

const startEl = document.getElementById('start');
const stopEl = document.getElementById('stop');
const imgEl = document.getElementById('image');
const statusEl = document.querySelector('.status-text');

const setImageSrc = src => (imgEl.src = src);
const setStatusText = text => (statusEl.innerText = text);

const getImg$ = ajax.getJSON(URL).pipe(
  map(({ url }) => url),
  filter(url => /.*\.(gif|jpe?g|bmp|png)$/gim.test(url))
);

const stop$ = fromEvent(stopEl, 'click').pipe(
  throttleTime(INTERVAL),
  tap(() => {
    startEl.disabled = false;
    setStatusText(STOPPED);
  })
);

const start$ = fromEvent(startEl, 'click').pipe(
  tap(() => {
    startEl.disabled = true;
    setStatusText(ACTIVE);
  }),
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
