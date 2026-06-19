import { OverlayRef } from '@angular/cdk/overlay';
import { Observable, Subject } from 'rxjs';

export class DialogRef<T> {
  private readonly _closed$ = new Subject<any>();
  private _closed = false;

  constructor(private readonly _overlayRef: OverlayRef) {}

  close(result?: unknown): void {
    if (this._closed) {
      return;
    }

    this._closed = true;
    this._overlayRef.dispose();
    this._closed$.next(result);
    this._closed$.complete();
  }

  afterClosed(): Observable<any> {
    return this._closed$.asObservable();
  }
}
