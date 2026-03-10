import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  PLATFORM_ID,
  afterNextRender,
  inject,
  viewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { map } from 'rxjs';
import { PropertyService } from '../../core/services/property.service';
import { ScrollStateService } from '../../core/services/scroll-state.service';
import { PropertyCardComponent } from '../../shared/components/property-card/property-card.component';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-home',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, AsyncPipe, PropertyCardComponent, TranslatePipe],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements AfterViewInit {
  private readonly propertyService = inject(PropertyService);
  private readonly scrollState = inject(ScrollStateService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly ngZone = inject(NgZone);
  private readonly platformId = inject(PLATFORM_ID);

  readonly heroSentinel = viewChild<ElementRef<HTMLDivElement>>('heroSentinel');

  readonly featured$ = this.propertyService.getProperties().pipe(
    map((list) => list.slice(0, 3))
  );

  trackById(_index: number, p: { id: string }): string {
    return p.id;
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    afterNextRender(() => this.setupHeroObserver());
  }

  private setupHeroObserver(): void {
    const el = this.heroSentinel()?.nativeElement;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    this.scrollState.setHeroInView(true);

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) {
          this.ngZone.run(() => this.scrollState.setHeroInView(entry.isIntersecting));
        }
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0,
      }
    );

    observer.observe(el);
    this.destroyRef.onDestroy(() => observer.disconnect());
  }
}
