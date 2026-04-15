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
  const description = truncate(calc.description, 160);
  const icon = calc.icon && calc.icon.trim().length > 0 ? calc.icon : '🧮';

  // Deep-blue gradient + subtle radial accent top-right for depth.
  const background =
    'linear-gradient(135deg, #0f172a 0%, #1e293b 55%, #1e3a8a 100%)';

  return {
    type: 'div',
    props: {
      style: {
        width: '1200px',
        height: '630px',
        display: 'flex',
        flexDirection: 'column',
        padding: '72px',
        background,
        color: '#f1f5f9',
        fontFamily: 'Inter',
        position: 'relative',
      },
      children: [
        // Accent bar
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '8px',
              background: '#60a5fa',
              display: 'flex',
            },
          },
        },
        // Icon
        {
          type: 'div',
          props: {
            style: {
              fontSize: '112px',
              lineHeight: 1,
              marginBottom: '28px',
              display: 'flex',
            },
            children: icon,
          },
        },
        // Title
        {
          type: 'div',
          props: {
            style: {
              fontSize: '60px',
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              color: '#f1f5f9',
              marginBottom: '20px',
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
              fontSize: '28px',
              fontWeight: 400,
              lineHeight: 1.35,
              color: '#cbd5e1',
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
              borderTop: '1px solid #334155',
              paddingTop: '28px',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    fontSize: '24px',
                    fontWeight: 700,
                    color: '#f1f5f9',
                  },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: {
                          width: '40px',
                          height: '40px',
                          borderRadius: '10px',
                          background: '#60a5fa',
                          color: '#0f172a',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '22px',
                          fontWeight: 800,
                        },
                        children: 'HC',
                      },
                    },
                    {
                      type: 'div',
                      props: {
                        style: { display: 'flex' },
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
                    fontSize: '22px',
                    fontWeight: 400,
                    color: '#94a3b8',
                    display: 'flex',
                  },
                  children: 'hacecuentas.com',
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
