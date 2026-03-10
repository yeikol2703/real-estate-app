/** Raw context.custom from Cloudinary asset (metadata fields) */
export interface CloudinaryAssetContextCustom {
  property_id?: string;
  title?: string;
  price?: string | number;
  location?: string;
  type?: string;
  bedrooms?: string | number;
  bathrooms?: string | number;
  size?: string | number;
  status?: string;
  [key: string]: string | number | undefined;
}

export type CloudinaryMetadataValue =
  | string
  | number
  | boolean
  | null
  | { value?: unknown; external_id?: string }
  | CloudinaryMetadataValue[];

export interface CloudinaryMetadataItem {
  external_id: string;
  value: CloudinaryMetadataValue;
}

export interface CloudinaryResource {
  public_id: string;
  secure_url?: string;
  version?: number;
  format?: string;
  asset_folder?: string;
  context?: {
    custom?: CloudinaryAssetContextCustom;
  };
  metadata?: Record<string, CloudinaryMetadataValue> | CloudinaryMetadataItem[];
}

export interface CloudinaryListResponse {
  resources: CloudinaryResource[];
}
