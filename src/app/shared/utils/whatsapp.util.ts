import { appConfig } from '../../core/config/app-config';

/** Número por defecto para WhatsApp (Costa Rica, sin + ni espacios). */
export const DEFAULT_WHATSAPP_PHONE = appConfig.contact.defaultWhatsappPhone;

/**
 * Genera la URL de WhatsApp con mensaje prerellenado según el contexto.
 * @param phone - Número E.164 (ej. "50662907950") o vacío para abrir sin número
 * @param propertyTitle - Título de la propiedad o asunto del mensaje
 * @param propertyLocation - Ubicación o texto complementario
 * @param propertyUrl - Si se indica (ej. desde una ficha/card), se incluye el enlace en el mensaje
 */
export function getPropertyWhatsAppLink(
  phone: string,
  propertyTitle: string,
  propertyLocation: string,
  propertyUrl?: string
): string {
  const lines: string[] = propertyUrl
    ? [
        'Hola, me interesa esta propiedad:',
        '',
        propertyTitle,
        propertyLocation ? `Ubicación: ${propertyLocation}` : '',
        '',
        `Ver ficha: ${propertyUrl}`,
      ]
    : [
        'Hola, tengo una consulta general desde su sitio web.',
        propertyLocation ? propertyLocation : '',
      ];

  const text = lines.filter(Boolean).join('\n');
  const encoded = encodeURIComponent(text);
  const base = 'https://wa.me/';
  const path = phone ? `${phone}?text=${encoded}` : `?text=${encoded}`;
  return `${base}${path}`;
}
