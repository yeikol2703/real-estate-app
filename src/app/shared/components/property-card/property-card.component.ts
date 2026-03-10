import {
  Component,
  ChangeDetectionStrategy,
  input,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { Property } from '../../../core/models/property.model';
import {
  getPropertyWhatsAppLink,
  DEFAULT_WHATSAPP_PHONE,
} from '../../utils/whatsapp.util';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-property-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslatePipe],
  templateUrl: './property-card.component.html',
  styleUrl: './property-card.component.css',
})
export class PropertyCardComponent {
  readonly property = input.required<Property>();
  /** Número E.164 para WhatsApp; si no se pasa, se usa el por defecto (50662907950). */
  readonly whatsAppPhone = input<string>(DEFAULT_WHATSAPP_PHONE);
  /** Muestra el boton de WhatsApp tradicional. */
  readonly showWhatsAppButton = input<boolean>(true);
  /** Muestra solo un icono de WhatsApp (pensado para Home). */
  readonly showWhatsAppIconOnly = input<boolean>(false);
  /** 'catalog' = precio verde, fila de iconos (hab/baños/m²), botón Ver detalle; 'default' = tarjeta estándar. */
  readonly layout = input<'default' | 'catalog'>('default');

  getWhatsAppUrl(p: Property): string {
    const origin =
      typeof window !== 'undefined' ? window.location.origin : '';
    const propertyUrl = origin ? `${origin}/catalog/${p.id}` : undefined;
    return getPropertyWhatsAppLink(
      this.whatsAppPhone() || DEFAULT_WHATSAPP_PHONE,
      p.title,
      p.location || '',
      propertyUrl
    );
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

  isAvailableStatus(status: string): boolean {
    const s = status.toLowerCase();
    return s.includes('disponible') || s.includes('available') || s === 'activo';
  }

  isSoldStatus(status: string): boolean {
    const s = status.toLowerCase();
    return s.includes('vendido') || s.includes('sold') || s.includes('reservado');
  }
}
