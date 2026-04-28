import {
  DestroyRef,
  Directive,
  ElementRef,
  OnInit,
  inject,
  input,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent } from 'rxjs';

@Directive({
  selector: '[appScrollVisibility]',
  standalone: true,
})
export class ScrollVisibilityDirective implements OnInit {
  readonly scrollContainer = input.required<HTMLElement>();

  private readonly _elementRef = inject(ElementRef);
  private readonly _destroyRef = inject(DestroyRef);

  private lastScrollPosition = 0;

  ngOnInit() {
    const scrollContainer = this.scrollContainer();
    if (scrollContainer) {
      fromEvent(scrollContainer, 'scroll')
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe(() => this.onScroll());
    }
  }

  private onScroll(): void {
    console.log('scroll');
    const currentScrollPosition = this.scrollContainer().scrollTop;
    const element = this._elementRef.nativeElement;
    console.log(currentScrollPosition, this.lastScrollPosition);
    if (currentScrollPosition > this.lastScrollPosition) {
      element.classList.add('hidden');
    } else {
      element.classList.remove('hidden');
    }
    this.lastScrollPosition = currentScrollPosition;
  }
}
