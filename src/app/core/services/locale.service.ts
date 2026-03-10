import { Injectable, inject, signal, computed } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { TRANSLATIONS, type LocaleId } from '../data/translations';

const STORAGE_KEY = 'terahome-locale';
const DEFAULT_LOCALE: LocaleId = 'es';

@Injectable({ providedIn: 'root' })
export class LocaleService {
  private readonly doc = inject(DOCUMENT, { optional: true });

  /** Current locale; persisted to localStorage. */
  readonly locale = signal<LocaleId>(this.readStored());

  /** All supported locale IDs. */
  readonly supportedLocales: LocaleId[] = ['en', 'es'];

  constructor() {
    this.updateDocumentLang(this.locale());
  }

  private readStored(): LocaleId {
    if (typeof localStorage === 'undefined') return DEFAULT_LOCALE;
    const stored = localStorage.getItem(STORAGE_KEY) as LocaleId | null;
    return stored === 'en' || stored === 'es' ? stored : DEFAULT_LOCALE;
  }

  setLocale(id: LocaleId): void {
    this.locale.set(id);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, id);
    }
    this.updateDocumentLang(id);
  }

  getTranslation(key: string): string {
    const dict = TRANSLATIONS[this.locale()];
    return dict?.[key] ?? key;
  }

  private updateDocumentLang(locale: LocaleId): void {
    const lang = locale === 'es' ? 'es' : 'en';
    try {
      if (this.doc?.documentElement) {
        this.doc.documentElement.lang = lang;
      }
    } catch {
      // ignore
    }
  }
}
