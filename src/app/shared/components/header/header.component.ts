import {
  ChangeDetectorRef,
  Component,
  ChangeDetectionStrategy,
  computed,
  HostListener,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { getPropertyWhatsAppLink, DEFAULT_WHATSAPP_PHONE } from '../../utils/whatsapp.util';
import { LocaleService } from '../../../core/services/locale.service';
import { ScrollStateService } from '../../../core/services/scroll-state.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

const SCROLL_THRESHOLD = 60;

@Component({
  selector: 'app-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, TranslatePipe],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly scrollState = inject(ScrollStateService);
  readonly localeService = inject(LocaleService);
  readonly menuOpen = signal(false);
  readonly navWhatsAppUrl = getPropertyWhatsAppLink(
    DEFAULT_WHATSAPP_PHONE,
    'Consulta general',
    'Costa Rica'
  );
  private readonly isHomePage = signal(true);

  /** Inicialmente transparente en home; al hacer scroll down → blanco fijo. */
  readonly isTransparent = computed(
    () =>
      this.isHomePage() &&
      this.scrollState.scrollY() < SCROLL_THRESHOLD
  );

  constructor() {
    this.updateIsHomePage();
    this.updateScrollState();

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed()
      )
      .subscribe(() => {
        this.menuOpen.set(false);
        this.updateIsHomePage();
        this.updateScrollState();
      });
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.updateScrollState();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.updateScrollState();
  }

  private updateScrollState(): void {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    const y =
      window.scrollY ??
      document.documentElement?.scrollTop ??
      document.body?.scrollTop ??
      0;
    this.scrollState.setScrollY(y);
    this.cdr.markForCheck();
  }

  private updateIsHomePage(): void {
    const url = this.router.url.split('?')[0];
    this.isHomePage.set(url === '/' || url === '');
  }
}
