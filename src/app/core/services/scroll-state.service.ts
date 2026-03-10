import { Injectable, signal } from '@angular/core';

/** Service for header transparency: scroll position + hero visibility. */
@Injectable({ providedIn: 'root' })
export class ScrollStateService {
  readonly scrollY = signal(0);
  readonly heroInView = signal(true);

  setScrollY(y: number): void {
    this.scrollY.set(y);
  }

  setHeroInView(inView: boolean): void {
    this.heroInView.set(inView);
  }
}
