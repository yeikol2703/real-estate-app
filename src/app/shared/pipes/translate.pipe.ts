import { Pipe, PipeTransform, inject } from '@angular/core';
import { LocaleService } from '../../core/services/locale.service';

/**
 * Translates a key into the current locale string.
 * Impure so that UI updates when locale changes without passing locale as argument.
 */
@Pipe({
  name: 'translate',
  standalone: true,
  pure: false,
})
export class TranslatePipe implements PipeTransform {
  private readonly localeService = inject(LocaleService);

  transform(key: string): string {
    if (!key) return '';
    return this.localeService.getTranslation(key);
  }
}
