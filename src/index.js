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
  switchMap,
  takeUntil,
  tap,
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

const imageUrl$ = ajax.getJSON(URL).pipe(
  map(({ url }) => url),
  filter(url => /.*\.(gif|jpe?g|bmp|png)$/gim.test(url)),
  tap(setImageSrc)
);

const stop$ = fromEvent(stopEl, 'click').pipe(
  tap(() => setStatusText(STOPPED))
);

const start$ = fromEvent(startEl, 'click').pipe(
  tap(() => setStatusText(ACTIVE)),
  mergeMap(() =>
    interval(INTERVAL).pipe(
      switchMap(() =>
        imageUrl$.pipe(
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
