import {
  Injectable,
  Injector,
  StaticProvider,
  Type,
  inject,
} from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { filter } from 'rxjs';
import { DIALOG_DATA } from '../tokens/dialog-data.token';
import { DialogRef } from './dialog-ref';

@Injectable({ providedIn: 'root' })
export class DialogService {
  private readonly _overlay = inject(Overlay);
  private readonly _injector = inject(Injector);

  open<T, D = unknown>(component: Type<T>, data?: D): DialogRef<T> {
    const overlayRef = this.createOverlay();
    const dialogRef = new DialogRef<T>(overlayRef);

    const injector = this.createInjector(dialogRef, data);
    const portal = new ComponentPortal(component, null, injector);

    overlayRef.attach(portal);

    overlayRef.backdropClick().subscribe(() => {
      dialogRef.close();
    });

    overlayRef
      .keydownEvents()
      .pipe(filter((event) => event.key === 'Escape'))
      .subscribe(() => {
        dialogRef.close();
      });

    return dialogRef;
  }

  private createOverlay(): OverlayRef {
    return this._overlay.create({
      hasBackdrop: true,
      backdropClass: 'hub-backdrop',
      panelClass: 'hub-modal',
      scrollStrategy: this._overlay.scrollStrategies.block(),
      positionStrategy: this._overlay
        .position()
        .global()
        .centerHorizontally()
        .centerVertically(),
    });
  }

  private createInjector<D>(dialogRef: DialogRef<unknown>, data?: D): Injector {
    const providers: StaticProvider[] = [
      { provide: DialogRef, useValue: dialogRef },
      { provide: DIALOG_DATA, useValue: data },
    ];

    return Injector.create({
      providers,
      parent: this._injector,
    });
  }
}
