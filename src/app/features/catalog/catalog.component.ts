import {
  Component,
  ChangeDetectionStrategy,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Observable, combineLatest, map, startWith } from 'rxjs';
import { PropertyService } from '../../core/services/property.service';
import { Property } from '../../core/models/property.model';
import { PropertyCardComponent } from '../../shared/components/property-card/property-card.component';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

/** Rango de precio: [min, max] en CRC; null = sin límite. translationKey for i18n. */
const PRICE_RANGES: { value: string; translationKey: string; min: number | null; max: number | null }[] = [
  { value: 'all', translationKey: 'catalog.priceAll', min: null, max: null },
  { value: '0-50', translationKey: 'catalog.priceUp50', min: 0, max: 50_000_000 },
  { value: '50-100', translationKey: 'catalog.price50_100', min: 50_000_000, max: 100_000_000 },
  { value: '100-200', translationKey: 'catalog.price100_200', min: 100_000_000, max: 200_000_000 },
  { value: '200+', translationKey: 'catalog.price200Plus', min: 200_000_000, max: null },
];

/** Tipos por defecto cuando el API no devuelve ninguno (placeholders). */
const DEFAULT_PROPERTY_TYPES = ['Casa', 'Apartamento', 'Lote', 'Finca', 'Local', 'Villa', 'Otro'];

@Component({
  selector: 'app-catalog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, AsyncPipe, PropertyCardComponent, TranslatePipe],
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.css',
})
export class CatalogComponent implements OnInit {
  private readonly propertyService = inject(PropertyService);
  private readonly fb = inject(FormBuilder);

  readonly priceRanges = PRICE_RANGES;
  /** Tipos únicos desde el API, ordenados; si no hay datos se usan los por defecto. */
  readonly propertyTypes$: Observable<string[]> = this.propertyService.getProperties().pipe(
    map((list) => {
      const types = new Set<string>();
      for (const p of list) {
        const t = (p.type || '').trim();
        if (t) types.add(t);
      }
      const arr = Array.from(types).sort((a, b) => a.localeCompare(b, 'es'));
      return arr.length > 0 ? arr : DEFAULT_PROPERTY_TYPES;
    })
  );
  readonly bedroomOptions = [
    { value: '', translationKey: 'catalog.bedsAny' },
    { value: '1', translationKey: 'catalog.beds1' },
    { value: '2', translationKey: 'catalog.beds2' },
    { value: '3', translationKey: 'catalog.beds3' },
    { value: '4', translationKey: 'catalog.beds4' },
  ];

  readonly filterForm = this.fb.group({
    search: [''],
    type: [''],
    priceRange: ['all'],
    bedrooms: [''],
  });

  readonly properties$: Observable<Property[]> = this.propertyService.getProperties();
  readonly filterValues$ = this.filterForm.valueChanges.pipe(
    startWith(this.filterForm.getRawValue())
  );

  readonly filteredProperties$: Observable<Property[]> = combineLatest([
    this.properties$,
    this.filterValues$,
  ]).pipe(
    map(([properties, filters]) => this.applyFilters(properties, filters))
  );

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.properties$.subscribe({
      next: () => this.loading.set(false),
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.message ?? 'No se pudieron cargar las propiedades');
      },
    });
  }

  private applyFilters(
    properties: Property[],
    filters: Partial<{
      search: string | null;
      type: string | null;
      priceRange: string | null;
      bedrooms: string | null;
    }>
  ): Property[] {
    if (!filters) return properties;
    const search = (filters.search ?? '').trim().toLowerCase();
    const type = (filters.type ?? '').trim().toLowerCase();
    const priceRangeKey = filters.priceRange ?? 'all';
    const range = PRICE_RANGES.find((r) => r.value === priceRangeKey);
    const minPrice = range?.min ?? null;
    const maxPrice = range?.max ?? null;
    const bedroomsStr = (filters.bedrooms ?? '').trim();
    const bedrooms = bedroomsStr === '' ? null : parseInt(bedroomsStr, 10);

    return properties.filter((p) => {
      if (search) {
        const matchTitle = p.title.toLowerCase().includes(search);
        const matchLocation = (p.location || '').toLowerCase().includes(search);
        if (!matchTitle && !matchLocation) return false;
      }
      if (type && (p.type || '').trim().toLowerCase() !== type) return false;
      if (minPrice != null && p.price < minPrice) return false;
      if (maxPrice != null && p.price > maxPrice) return false;
      if (bedrooms != null && !isNaN(bedrooms) && p.bedrooms < bedrooms) return false;
      return true;
    });
  }

  trackById(_index: number, p: Property): string {
    return p.id;
  }
}
