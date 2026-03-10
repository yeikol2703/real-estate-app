# TeraHome — Real Estate App

Angular 21 real estate showcase application for Costa Rica. Features SSR (Server-Side Rendering), i18n (EN/ES), Cloudinary image hosting, and a token-based design system.

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **Angular 21** | Framework |
| **Angular SSR** | Server-side rendering + prerendering |
| **Cloudinary** | Image hosting & property gallery via List API |
| **RxJS** | Reactive data flow |
| **TypeScript 5.9** | Type safety |

---

## Project Structure

```
src/
├── app/
│   ├── core/                    # Core layer
│   │   ├── config/              # app-config.ts (generated from .env)
│   │   ├── data/                # placeholder-properties, translations
│   │   ├── models/              # Property, Cloudinary types
│   │   └── services/            # PropertyService, LocaleService
│   ├── features/                # Route modules
│   │   ├── home/                # Landing + featured properties
│   │   ├── catalog/             # Catalog + property-detail
│   │   ├── about/               # About page
│   │   └── contact/             # Contact form
│   └── shared/                  # Shared components & utils
│       ├── components/          # header, footer, property-card
│       ├── pipes/               # translate pipe
│       └── utils/               # whatsapp.util
├── styles.css                   # Global tokens & base styles
└── index.html
```

---

## Setup

### Prerequisites

- **Node.js** 20+
- **npm** 11+

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy the example env and fill in your values:

```bash
cp .env.example .env
```

Edit `.env`:

| Variable | Description |
|----------|-------------|
| `NG_APP_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `NG_APP_CLOUDINARY_API_KEY` | Cloudinary API key (public, not secret) |
| `NG_APP_CLOUDINARY_PROFILE_TAG` | Tag for profile image (default: `perfil`) |
| `NG_APP_CLOUDINARY_PROPERTY_TAGS` | Comma-separated tags for properties (e.g. `propiedad,property`) |
| `NG_APP_DEFAULT_WHATSAPP_PHONE` | WhatsApp number, E.164 format (e.g. `50662907950`) |
| `NG_APP_DEFAULT_EMAIL` | Contact email |
| `NG_APP_DEFAULT_LOCATION` | Default location text |
| `NG_APP_BUSINESS_NAME` | Business name (e.g. `TeraHome`) |

Config is generated before build/serve via `scripts/generate-config.cjs` → `src/app/core/config/app-config.ts`.

### 3. Run development server

```bash
npm start
```

App runs at `http://localhost:4200`.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Serve dev (runs `generate-config` via prestart) |
| `npm run build` | Production build (runs `generate-config` via prebuild) |
| `npm run serve:ssr:real-estate-app` | Serve production SSR build |
| `npm run generate-config` | Regenerate `app-config.ts` from `.env` |
| `npm test` | Run unit tests |
| `npm run watch` | Development build with watch |

---

## Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/` | HomeComponent | Hero, featured properties |
| `/catalog` | CatalogComponent | Catalog with filters |
| `/catalog/:id` | PropertyDetailComponent | Property detail page |
| `/about` | AboutComponent | About page |
| `/contact` | ContactComponent | Contact form |
| `**` | Redirects to `/` | 404 handling |

All feature routes are **lazy-loaded**.

---

## Configuration

### app-config.ts

Generated from `.env`; used by:

- **PropertyService** — Cloudinary cloud name, API key, property tags, profile tag
- **Contact / WhatsApp** — Default phone, email, location, business name

Never commit `.env`; it is in `.gitignore`. Use `.env.example` as template.

### Cloudinary

Property images are loaded via the Cloudinary List API (`/image/list/{tag}.json`). Asset metadata (title, price, location, etc.) is read from:

- `context.custom` on each resource
- Structured metadata with `external_id` keys

Configure tags in `.env`; the service tries them in order until it finds resources.

---

## Internationalization (i18n)

- **Locales**: English (`en`), Spanish (`es`)
- **Storage**: Locale stored in `localStorage` under `terahome-locale`
- **Translation keys**: In `src/app/core/data/translations.ts`, used with `{{ 'key' | translate }}`
- **Document language**: `document.documentElement.lang` updated when locale changes

---

## Components Overview

### Header

- Fixed navbar; transparent over hero on home, white with shadow on scroll
- Responsive menu, locale switcher, WhatsApp link
- Scroll threshold: 60px

### Footer

- Brand description, navigation links, contact info
- Locale switcher, social links

### Property Card

- Reusable card with image, title, price, location, CTA
- Variants: `showWhatsAppButton`, `showWhatsAppIconOnly`
- Used in home (featured) and catalog

---

## Data Flow

1. **PropertyService** fetches from Cloudinary List API using configured tags.
2. On failure or empty, falls back to `PLACEHOLDER_PROPERTIES`.
3. **LocaleService** provides translations; components use `TranslatePipe`.
4. **Contact** uses `appConfig.contact` and `getPropertyWhatsAppLink()` for WhatsApp links.

---

## Build & Deploy

```bash
npm run build
```

Output:

- `dist/real-estate-app/browser/` — Static assets for CSR fallback
- `dist/real-estate-app/server/` — SSR server

Serve SSR:

```bash
npm run serve:ssr:real-estate-app
```

---

## Accessibility

- Semantics: headings, landmarks, `aria-labelledby`
- Reduced motion: `prefers-reduced-motion` respected in styles
- Visually hidden labels for form inputs and filters

---

## License

Private project.
