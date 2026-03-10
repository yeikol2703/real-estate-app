import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { switchMap, map, of } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { PropertyService } from '../../../core/services/property.service';
import { Property } from '../../../core/models/property.model';
import { getPropertyWhatsAppLink, DEFAULT_WHATSAPP_PHONE } from '../../../shared/utils/whatsapp.util';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

const AGENT_NAME = 'Dario Villalobos Herrera';
const AGENT_TITLE = 'Especialista';
const DEFAULT_LOCATION = 'Costa Rica';

@Component({
  selector: 'app-property-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslatePipe, AsyncPipe],
  templateUrl: './property-detail.component.html',
  styleUrl: './property-detail.component.css',
})
export class PropertyDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly propertyService = inject(PropertyService);

  readonly property = signal<Property | null>(null);
  readonly activeImageIndex = signal(0);
  readonly loading = signal(true);
  readonly notFound = signal(false);
  readonly shareCopied = signal(false);

  readonly whatsAppPhone = signal<string>(DEFAULT_WHATSAPP_PHONE);
  readonly agentName = AGENT_NAME;
  readonly agentTitle = AGENT_TITLE;
  /** Dynamic agent photo from Cloudinary (`perfil` tag), falls back in template if null. */
  readonly agentPhoto$ = this.propertyService.getProfileImageUrl();
  readonly defaultLocation = DEFAULT_LOCATION;

  readonly whatsAppUrl = computed(() => {
    const p = this.property();
    if (!p) return '';
    const propertyUrl =
      typeof window !== 'undefined' ? `${window.location.origin}/catalog/${p.id}` : '';
    return getPropertyWhatsAppLink(
      this.whatsAppPhone() || DEFAULT_WHATSAPP_PHONE,
      p.title,
      p.location || DEFAULT_LOCATION,
      propertyUrl
    );
  });

  /** Genera el enlace compartible de la propiedad (URL actual) y lo copia al portapapeles. */
  copyShareLink(): void {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return;
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(
      () => {
        this.shareCopied.set(true);
        setTimeout(() => this.shareCopied.set(false), 2500);
      },
      () => {}
    );
  }

  readonly currentImage = computed(() => {
    const p = this.property();
    if (!p || p.images.length === 0) return null;
    const index = this.activeImageIndex();
    const safeIndex = Math.min(Math.max(index, 0), p.images.length - 1);
    return p.images[safeIndex];
  });

  constructor() {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const id = params.get('id');
          if (!id) return of<Property | null>(null);
          return this.propertyService.getProperties().pipe(
            map((list) => list.find((p) => p.id === id) ?? null)
          );
        })
      )
      .subscribe({
        next: (found) => {
          this.property.set(found);
          this.activeImageIndex.set(0);
          this.notFound.set(found === null);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.notFound.set(true);
        },
      });
  }

  formatPrice(price: number): string {
    if (price <= 0) return 'Consultar precio';
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC',
      maximumFractionDigits: 0,
    }).format(price);
  }

  formatSize(size: number): string {
    if (size <= 0) return '—';
    return `${size} m²`;
  }

  previousImage(): void {
    const p = this.property();
    if (!p || p.images.length <= 1) return;
    const index = this.activeImageIndex();
    const nextIndex = (index - 1 + p.images.length) % p.images.length;
    this.activeImageIndex.set(nextIndex);
  }

  nextImage(): void {
    const p = this.property();
    if (!p || p.images.length <= 1) return;
    const index = this.activeImageIndex();
    const nextIndex = (index + 1) % p.images.length;
    this.activeImageIndex.set(nextIndex);
  }

  selectImage(index: number): void {
    const p = this.property();
    if (!p || index < 0 || index >= p.images.length) return;
    this.activeImageIndex.set(index);
  }
}
