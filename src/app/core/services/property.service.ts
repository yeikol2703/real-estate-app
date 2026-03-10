import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, catchError, of, switchMap } from 'rxjs';
import { Property } from '../models/property.model';
import {
  CloudinaryListResponse,
  CloudinaryResource,
  CloudinaryAssetContextCustom,
  CloudinaryMetadataItem,
  CloudinaryMetadataValue,
} from '../models/cloudinary.model';
import { PLACEHOLDER_PROPERTIES } from '../data/placeholder-properties';
import { appConfig } from '../config/app-config';

@Injectable({ providedIn: 'root' })
export class PropertyService {
  private readonly http = inject(HttpClient);
  /**
   * Cloudinary public list endpoint.
   * Important: this frontend app must only use public values (never API secret).
   */
  private readonly cloudName = appConfig.cloudinary.cloudName;
  private readonly apiKey = appConfig.cloudinary.publicApiKey;
  private readonly listTags = appConfig.cloudinary.propertyTags;
  /** Tag used in Cloudinary to identify the dynamic profile image. */
  private readonly profileTag = appConfig.cloudinary.profileTag;

  private getListUrl(tag: string): string {
    return `https://res.cloudinary.com/${this.cloudName}/image/list/${tag}.json?api_key=${this.apiKey}`;
  }

  getProperties(): Observable<Property[]> {
    return this.fetchByTags(this.listTags).pipe(
      map((list) => (list.length > 0 ? list : PLACEHOLDER_PROPERTIES)),
      catchError((error) => {
        // Helps diagnose Cloudinary list access (401/403) in browser console.
        console.error('Cloudinary list request failed:', error);
        return of(PLACEHOLDER_PROPERTIES);
      })
    );
  }

  /**
   * Returns the URL of the profile image stored in Cloudinary under the `perfil` tag.
   * Falls back to null when the image cannot be loaded (e.g. network error or no resources).
   */
  getProfileImageUrl(): Observable<string | null> {
    return this.http.get<CloudinaryListResponse>(this.getListUrl(this.profileTag)).pipe(
      map((res) => {
        const resources = res?.resources ?? [];
        if (!resources.length) return null;
        const url = this.getResourceImageUrl(resources[0]);
        return url ?? null;
      }),
      catchError((error) => {
        console.error('Cloudinary profile image request failed:', error);
        return of(null);
      })
    );
  }

  private fetchByTags(tags: string[], index = 0): Observable<Property[]> {
    if (index >= tags.length) {
      return of([]);
    }

    return this.http.get<CloudinaryListResponse>(this.getListUrl(tags[index])).pipe(
      map((res) => this.transformToProperties(res?.resources ?? [])),
      switchMap((list) => {
        if (list.length > 0) return of(list);
        return this.fetchByTags(tags, index + 1);
      }),
      catchError(() => this.fetchByTags(tags, index + 1))
    );
  }

  private transformToProperties(resources: CloudinaryResource[]): Property[] {
    const byId = new Map<string, { urls: string[]; custom: CloudinaryAssetContextCustom }>();

    for (const r of resources) {
      const custom = this.normalizePropertyData(r);
      const propertyId = this.getString(custom.property_id) || r.public_id;

      if (!byId.has(propertyId)) {
        byId.set(propertyId, { urls: [], custom });
      }
      const entry = byId.get(propertyId)!;
      const imageUrl = this.getResourceImageUrl(r);
      if (imageUrl) {
        entry.urls.push(imageUrl);
      }
      // Merge context from first image (or overwrite with latest if you prefer)
      if (entry.urls.length === 1) {
        entry.custom = { ...custom };
      }
    }

    return Array.from(byId.entries()).map(([id, { urls, custom }]) =>
      this.buildProperty(id, urls, custom)
    );
  }

  private buildProperty(
    id: string,
    images: string[],
    custom: CloudinaryAssetContextCustom
  ): Property {
    const num = (v: string | number | undefined): number => {
      if (v === undefined || v === null) return 0;
      const n = typeof v === 'string' ? parseFloat(v) : v;
      return Number.isFinite(n) ? n : 0;
    };
    const str = (v: string | number | undefined): string =>
      v !== undefined && v !== null ? String(v).trim() : '';

    return {
      id,
      title: str(custom.title) || 'Untitled Property',
      price: num(custom.price),
      location: str(custom.location) || '',
      type: str(custom.type) || '',
      bedrooms: num(custom.bedrooms),
      bathrooms: num(custom.bathrooms),
      size: num(custom.size),
      status: str(custom.status) || '',
      images,
    };
  }

  private getString(v: string | number | undefined): string | null {
    if (v === undefined || v === null) return null;
    const s = String(v).trim();
    return s === '' ? null : s;
  }

  private normalizePropertyData(resource: CloudinaryResource): CloudinaryAssetContextCustom {
    const context = resource.context?.custom ?? {};
    const metadata = this.normalizeMetadataCollection(resource.metadata);
    const folderPropertyId =
      this.extractFolderPropertyId(resource.asset_folder) ??
      this.extractFolderPropertyId(resource.public_id);

    const get = (field: keyof CloudinaryAssetContextCustom): string | number | undefined => {
      const fromContext = context[field];
      if (fromContext !== undefined) return fromContext;
      return this.normalizeMetadataValue(metadata[field]);
    };

    return {
      property_id:
        folderPropertyId ??
        this.getString(get('property_id')) ??
        resource.public_id,
      title: this.getString(get('title')) ?? undefined,
      price: get('price'),
      location: this.getString(get('location')) ?? undefined,
      type: this.getString(get('type')) ?? undefined,
      bedrooms: get('bedrooms'),
      bathrooms: get('bathrooms'),
      size: get('size'),
      status: this.getString(get('status')) ?? undefined,
    };
  }

  private extractFolderPropertyId(path: string | undefined): string | undefined {
    if (!path) return undefined;
    const parts = path.split('/').filter(Boolean);
    if (parts.length === 0) return undefined;
    // asset_folder example: propiedades/casa01-lasole -> casa01-lasole
    // public_id with folders example: Home/propieedades/casa01-lasole/img-1 -> casa01-lasole
    if (parts.length >= 3) return parts[parts.length - 2];
    if (parts.length >= 2) return parts[parts.length - 1];
    return undefined;
  }

  private normalizeMetadataValue(value: CloudinaryMetadataValue | undefined): string | number | undefined {
    if (value === undefined || value === null) return undefined;
    if (typeof value === 'string' || typeof value === 'number') return value;
    if (typeof value === 'boolean') return value ? 'true' : 'false';

    if (Array.isArray(value)) {
      if (value.length === 0) return undefined;
      return this.normalizeMetadataValue(value[0]);
    }

    if (typeof value === 'object') {
      if ('value' in value) {
        return this.normalizeMetadataValue(value.value as CloudinaryMetadataValue);
      }
      if ('external_id' in value && typeof value.external_id === 'string') {
        return value.external_id;
      }
    }

    return undefined;
  }

  private normalizeMetadataCollection(
    metadata: CloudinaryResource['metadata']
  ): Record<string, CloudinaryMetadataValue> {
    if (!metadata) return {};
    if (Array.isArray(metadata)) {
      return metadata.reduce<Record<string, CloudinaryMetadataValue>>((acc, item) => {
        if (this.isMetadataItem(item)) {
          acc[item.external_id] = item.value;
        }
        return acc;
      }, {});
    }
    return metadata;
  }

  private isMetadataItem(value: unknown): value is CloudinaryMetadataItem {
    if (!value || typeof value !== 'object') return false;
    const maybeItem = value as Partial<CloudinaryMetadataItem>;
    return typeof maybeItem.external_id === 'string';
  }

  private getResourceImageUrl(resource: CloudinaryResource): string | null {
    if (resource.secure_url) {
      return resource.secure_url;
    }

    if (!resource.public_id || !resource.format || !resource.version) {
      return null;
    }

    const encodedPublicId = resource.public_id
      .split('/')
      .map((part) => encodeURIComponent(part))
      .join('/');

    return `https://res.cloudinary.com/${this.cloudName}/image/upload/v${resource.version}/${encodedPublicId}.${resource.format}`;
  }
}
