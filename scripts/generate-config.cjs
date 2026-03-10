/**
 * Genera app-config.generated.ts desde .env para no exponer datos sensibles en el repo.
 * Se ejecuta antes de build/serve (prebuild, prestart).
 */
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const envPath = path.join(rootDir, '.env');
const outPath = path.join(rootDir, 'src/app/core/config/app-config.ts');

function parseEnv(content) {
  const env = {};
  content.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const eq = trimmed.indexOf('=');
    if (eq === -1) return;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  });
  return env;
}

/* Fallbacks solo si una clave falta en .env. Crea .env desde .env.example. */
const defaults = {
  NG_APP_CLOUDINARY_CLOUD_NAME: '',
  NG_APP_CLOUDINARY_API_KEY: '',
  NG_APP_CLOUDINARY_PROFILE_TAG: 'perfil',
  NG_APP_CLOUDINARY_PROPERTY_TAGS: 'propiedad,property,propiedades,propieedades',
  NG_APP_DEFAULT_WHATSAPP_PHONE: '',
  NG_APP_DEFAULT_EMAIL: '',
  NG_APP_DEFAULT_LOCATION: 'Costa Rica',
  NG_APP_BUSINESS_NAME: 'TeraHome',
};

let env = { ...defaults };
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  const parsed = parseEnv(content);
  env = { ...env, ...parsed };
} else {
  console.warn('⚠ .env no encontrado. Copia .env.example a .env y completa los valores.');
}

const propertyTags = (env.NG_APP_CLOUDINARY_PROPERTY_TAGS || '')
  .split(',')
  .map((t) => t.trim())
  .filter(Boolean);
const propertyTagsStr = JSON.stringify(propertyTags);

const ts = `/** Auto-generado por scripts/generate-config.cjs - Valores desde .env */
export const appConfig = {
  cloudinary: {
    cloudName: '${(env.NG_APP_CLOUDINARY_CLOUD_NAME || '').replace(/'/g, "\\'")}',
    publicApiKey: '${(env.NG_APP_CLOUDINARY_API_KEY || '').replace(/'/g, "\\'")}',
    profileTag: '${(env.NG_APP_CLOUDINARY_PROFILE_TAG || '').replace(/'/g, "\\'")}',
    propertyTags: ${propertyTagsStr},
  },
  contact: {
    defaultWhatsappPhone: '${(env.NG_APP_DEFAULT_WHATSAPP_PHONE || '').replace(/'/g, "\\'")}',
    defaultEmail: '${(env.NG_APP_DEFAULT_EMAIL || '').replace(/'/g, "\\'")}',
    defaultLocation: '${(env.NG_APP_DEFAULT_LOCATION || '').replace(/'/g, "\\'")}',
    businessName: '${(env.NG_APP_BUSINESS_NAME || '').replace(/'/g, "\\'")}',
  },
};
`;

fs.writeFileSync(outPath, ts, 'utf8');
console.log('Config generado desde .env → app-config.ts');
