/**
 * Generate static Open Graph images (1200x630) for every calculator.
 *
 * Pipeline: satori (JSX -> SVG) -> @resvg/resvg-js (SVG -> PNG) -> public/og/{slug}.png
 *
 * Idempotent: skips a slug when its PNG exists AND is newer than its source JSON.
 * Fonts are downloaded once into scripts/.fonts and cached locally (never fetched
 * from the CDN on subsequent builds).
 *
 * Usage: `npm run og` (also runs automatically as part of `npm run build`).
 */

import { readFileSync, writeFileSync, existsSync, statSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const CALCS_DIR = join(ROOT, 'src', 'content', 'calcs');
const OUT_DIR = join(ROOT, 'public', 'og');
const FONTS_DIR = join(__dirname, '.fonts');

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Calc {
  slug: string;
  h1: string;
  description: string;
  icon?: string;
  category?: string;
}

// Paleta por categoría — cada calc hereda un color de marca.
// Los gradients combinan 2 tonos: base (55%) y acento (100%).
// También devolvemos el color del "accent bar" superior.
interface CategoryTheme {
  base: string;     // inicio del gradient (tono oscuro)
  mid: string;      // medio del gradient
  accent: string;   // final del gradient + accent bar + badge + logo
  label: string;    // texto legible del badge
}

const CATEGORY_THEMES: Record<string, CategoryTheme> = {
  finanzas:       { base: '#052e16', mid: '#14532d', accent: '#22c55e', label: 'Finanzas' },
  negocios:       { base: '#0f172a', mid: '#1e3a8a', accent: '#3b82f6', label: 'Negocios' },
  marketing:      { base: '#1e1b4b', mid: '#4c1d95', accent: '#a855f7', label: 'Marketing' },
  salud:          { base: '#500724', mid: '#9f1239', accent: '#f43f5e', label: 'Salud' },
  deportes:       { base: '#431407', mid: '#9a3412', accent: '#f97316', label: 'Deportes' },
  viajes:         { base: '#042f2e', mid: '#115e59', accent: '#06b6d4', label: 'Viajes' },
  vida:           { base: '#172554', mid: '#1e40af', accent: '#60a5fa', label: 'Vida' },
  mascotas:       { base: '#431407', mid: '#78350f', accent: '#f59e0b', label: 'Mascotas' },
  matematica:     { base: '#0c0a09', mid: '#1e293b', accent: '#6366f1', label: 'Matemática' },
  ciencia:        { base: '#1e1b4b', mid: '#312e81', accent: '#818cf8', label: 'Ciencia' },
  cocina:         { base: '#422006', mid: '#713f12', accent: '#eab308', label: 'Cocina' },
  educacion:      { base: '#064e3b', mid: '#065f46', accent: '#10b981', label: 'Educación' },
  tecnologia:     { base: '#020617', mid: '#1e293b', accent: '#38bdf8', label: 'Tecnología' },
  construccion:   { base: '#292524', mid: '#44403c', accent: '#eab308', label: 'Construcción' },
  automotor:      { base: '#450a0a', mid: '#7f1d1d', accent: '#dc2626', label: 'Automotor' },
  jardineria:     { base: '#052e16', mid: '#166534', accent: '#84cc16', label: 'Jardinería' },
  'medio-ambiente': { base: '#022c22', mid: '#064e3b', accent: '#10b981', label: 'Medio Ambiente' },
  electronica:    { base: '#082f49', mid: '#0c4a6e', accent: '#0ea5e9', label: 'Electrónica' },
  entretenimiento: { base: '#3b0764', mid: '#6b21a8', accent: '#d946ef', label: 'Entretenimiento' },
  auto:           { base: '#450a0a', mid: '#7f1d1d', accent: '#dc2626', label: 'Automotor' },
};

const DEFAULT_THEME: CategoryTheme = {
  base: '#0f172a', mid: '#1e293b', accent: '#60a5fa', label: 'Calculadora',
};

function getTheme(category?: string): CategoryTheme {
  if (!category) return DEFAULT_THEME;
  return CATEGORY_THEMES[category] || DEFAULT_THEME;
}

// ---------------------------------------------------------------------------
// Font loading (Inter 700 + 400 from Google Fonts, cached locally)
// ---------------------------------------------------------------------------

/**
 * Direct-link TTFs from Google Fonts CDN. Using TTF (not woff2) because
 * satori only supports TTF/OTF. These URLs are resolved once, cached to
 * scripts/.fonts, and never fetched again on subsequent builds.
 */
const FONT_URLS: Record<string, string> = {
  'Inter-Regular.ttf':
    'https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfMZg.ttf',
  'Inter-Bold.ttf':
    'https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYMZg.ttf',
  'Inter-ExtraBold.ttf':
    'https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuDyYMZg.ttf',
};

async function ensureFont(name: string, url: string): Promise<Buffer> {
  const dest = join(FONTS_DIR, name);
  if (existsSync(dest)) {
    return readFileSync(dest);
  }
  mkdirSync(FONTS_DIR, { recursive: true });
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${name}: ${res.status} ${res.statusText}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(dest, buf);
  return buf;
}

async function loadFonts(): Promise<
  Array<{ name: string; data: Buffer; weight: 400 | 700 | 800; style: 'normal' }>
> {
  const entries = Object.entries(FONT_URLS);
  const loaded = await Promise.all(entries.map(([n, u]) => ensureFont(n, u)));
  return [
    { name: 'Inter', data: loaded[0], weight: 400, style: 'normal' },
    { name: 'Inter', data: loaded[1], weight: 700, style: 'normal' },
    { name: 'Inter', data: loaded[2], weight: 800, style: 'normal' },
  ];
}

// ---------------------------------------------------------------------------
// Template
// ---------------------------------------------------------------------------

function truncate(str: string, max: number): string {
  if (str.length <= max) return str;
  return str.slice(0, max - 1).trimEnd() + '…';
}

/**
 * Build the satori element tree. satori accepts React-like JSX but we emit
 * it as plain object nodes so this file does not need the React runtime.
 */
function buildTemplate(calc: Calc): Parameters<typeof satori>[0] {
  const title = truncate(calc.h1, 60);
  const description = truncate(calc.description, 140);
  const icon = calc.icon && calc.icon.trim().length > 0 ? calc.icon : '🧮';
  const theme = getTheme(calc.category);

  // Fondo: gradient diagonal que va del tono oscuro al tono accent.
  // Cada categoría tiene su paleta propia → OG images visualmente distintas.
  const background = `linear-gradient(135deg, ${theme.base} 0%, ${theme.mid} 55%, ${theme.accent} 100%)`;

  return {
    type: 'div',
    props: {
      style: {
        width: '1200px',
        height: '630px',
        display: 'flex',
        flexDirection: 'column',
        padding: '72px 72px 60px',
        background,
        color: '#f8fafc',
        fontFamily: 'Inter',
        position: 'relative',
      },
      children: [
        // Glow radial decorativo (esquina superior derecha)
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: '-160px',
              right: '-160px',
              width: '500px',
              height: '500px',
              borderRadius: '500px',
              background: `radial-gradient(circle, ${theme.accent}55 0%, transparent 70%)`,
              display: 'flex',
            },
          },
        },
        // Glow radial secundario (esquina inferior izquierda, sutil)
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              bottom: '-120px',
              left: '-120px',
              width: '400px',
              height: '400px',
              borderRadius: '400px',
              background: `radial-gradient(circle, ${theme.accent}22 0%, transparent 65%)`,
              display: 'flex',
            },
          },
        },
        // Accent bar superior
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '10px',
              background: theme.accent,
              display: 'flex',
            },
          },
        },
        // Top row: badge categoría + icon en círculo
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              marginBottom: '40px',
            },
            children: [
              // Badge de categoría
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px 22px',
                    background: `${theme.accent}33`,
                    border: `2px solid ${theme.accent}`,
                    borderRadius: '999px',
                    fontSize: '22px',
                    fontWeight: 700,
                    color: '#ffffff',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                  },
                  children: theme.label,
                },
              },
              // Icon grande en círculo con gradient
              {
                type: 'div',
                props: {
                  style: {
                    width: '140px',
                    height: '140px',
                    borderRadius: '140px',
                    background: `linear-gradient(135deg, ${theme.accent}66 0%, ${theme.accent}22 100%)`,
                    border: `3px solid ${theme.accent}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '82px',
                    lineHeight: 1,
                  },
                  children: icon,
                },
              },
            ],
          },
        },
        // Title
        {
          type: 'div',
          props: {
            style: {
              fontSize: '68px',
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: '-0.025em',
              color: '#ffffff',
              marginBottom: '24px',
              display: 'flex',
            },
            children: title,
          },
        },
        // Description
        {
          type: 'div',
          props: {
            style: {
              fontSize: '26px',
              fontWeight: 400,
              lineHeight: 1.4,
              color: '#e2e8f0',
              maxWidth: '1056px',
              display: 'flex',
            },
            children: description,
          },
        },
        // Spacer
        {
          type: 'div',
          props: {
            style: { flex: 1, display: 'flex' },
          },
        },
        // Footer / branding
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              borderTop: `2px solid ${theme.accent}55`,
              paddingTop: '28px',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '18px',
                    fontSize: '30px',
                    fontWeight: 800,
                    color: '#ffffff',
                  },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: {
                          width: '56px',
                          height: '56px',
                          borderRadius: '14px',
                          background: theme.accent,
                          color: theme.base,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '28px',
                          fontWeight: 800,
                          letterSpacing: '-0.02em',
                        },
                        children: 'HC',
                      },
                    },
                    {
                      type: 'div',
                      props: {
                        style: { display: 'flex', letterSpacing: '-0.015em' },
                        children: 'Hacé Cuentas',
                      },
                    },
                  ],
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 18px',
                    background: '#ffffff15',
                    border: '1px solid #ffffff33',
                    borderRadius: '999px',
                    fontSize: '20px',
                    fontWeight: 600,
                    color: '#f1f5f9',
                  },
                  children: 'Gratis · Sin registro',
                },
              },
            ],
          },
        },
      ],
    },
  };
}

// ---------------------------------------------------------------------------
// Generation
// ---------------------------------------------------------------------------

interface GenResult {
  generated: number;
  cached: number;
  failed: Array<{ slug: string; error: string }>;
}

async function renderOne(
  calc: Calc,
  fonts: Awaited<ReturnType<typeof loadFonts>>,
): Promise<Buffer> {
  const element = buildTemplate(calc);
  const svg = await satori(element, {
    width: 1200,
    height: 630,
    fonts,
  });
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: 1200 },
    font: { loadSystemFonts: false },
  });
  return resvg.render().asPng();
}

async function main(): Promise<void> {
  const started = Date.now();

  mkdirSync(OUT_DIR, { recursive: true });

  const files = readdirSync(CALCS_DIR).filter((f) => f.endsWith('.json'));
  if (files.length === 0) {
    console.warn(`[og] no calcs found in ${CALCS_DIR}`);
    return;
  }

  const fonts = await loadFonts();

  const result: GenResult = { generated: 0, cached: 0, failed: [] };

  for (const file of files) {
    const srcPath = join(CALCS_DIR, file);
    let calc: Calc;
    try {
      calc = JSON.parse(readFileSync(srcPath, 'utf8')) as Calc;
    } catch (err) {
      result.failed.push({
        slug: file,
        error: `parse error: ${(err as Error).message}`,
      });
      continue;
    }
    if (!calc.slug || !calc.h1 || !calc.description) {
      result.failed.push({
        slug: file,
        error: 'missing required fields (slug/h1/description)',
      });
      continue;
    }

    const outPath = join(OUT_DIR, `${calc.slug}.png`);

    // Cache check: skip if PNG already exists and has content.
    // NOTE: no usamos mtime porque en CI (Cloudflare Pages) el git clone
    // le pone el mismo timestamp a todos los archivos, lo que fuerza
    // regeneración innecesaria de TODAS las imágenes → build timeout.
    if (existsSync(outPath) && statSync(outPath).size > 1000) {
      result.cached++;
      continue;
    }

    try {
      const png = await renderOne(calc, fonts);
      writeFileSync(outPath, png);
      result.generated++;
    } catch (err) {
      result.failed.push({
        slug: calc.slug,
        error: (err as Error).message,
      });
    }
  }

  const elapsed = ((Date.now() - started) / 1000).toFixed(2);
  console.log(
    `[og] done in ${elapsed}s — generated: ${result.generated}, cached: ${result.cached}, failed: ${result.failed.length}`,
  );
  if (result.failed.length > 0) {
    for (const f of result.failed) {
      console.warn(`[og] FAILED ${f.slug}: ${f.error}`);
    }
  }
}

main().catch((err) => {
  console.error('[og] fatal error:', err);
  process.exit(1);
});
