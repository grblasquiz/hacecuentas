/**
 * Generate the default Open Graph image (1200x630) for Hacé Cuentas.
 * Output: public/og-default.png
 *
 * Uses the same satori + @resvg/resvg-js pipeline as generate-og-images.ts.
 * Run with: npx tsx scripts/generate-og-default.ts
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const FONTS_DIR = join(__dirname, '.fonts');
const OUT_PATH = join(ROOT, 'public', 'og-default.png');

async function loadFonts() {
  return [
    { name: 'Inter', data: readFileSync(join(FONTS_DIR, 'Inter-Regular.ttf')), weight: 400 as const, style: 'normal' as const },
    { name: 'Inter', data: readFileSync(join(FONTS_DIR, 'Inter-Bold.ttf')), weight: 700 as const, style: 'normal' as const },
    { name: 'Inter', data: readFileSync(join(FONTS_DIR, 'Inter-ExtraBold.ttf')), weight: 800 as const, style: 'normal' as const },
  ];
}

function buildTemplate() {
  return {
    type: 'div',
    props: {
      style: {
        width: '1200px',
        height: '630px',
        display: 'flex',
        flexDirection: 'column',
        padding: '72px',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 55%, #1e3a8a 100%)',
        color: '#f1f5f9',
        fontFamily: 'Inter',
        position: 'relative',
      },
      children: [
        // Accent bar top
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '8px',
              background: '#2563eb',
              display: 'flex',
            },
          },
        },
        // Calculator emoji icon
        {
          type: 'div',
          props: {
            style: {
              fontSize: '100px',
              lineHeight: 1,
              marginBottom: '32px',
              display: 'flex',
            },
            children: '🧮',
          },
        },
        // Main title
        {
          type: 'div',
          props: {
            style: {
              fontSize: '88px',
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: '-0.03em',
              color: '#f1f5f9',
              marginBottom: '24px',
              display: 'flex',
            },
            children: 'Hacé Cuentas',
          },
        },
        // Tagline
        {
          type: 'div',
          props: {
            style: {
              fontSize: '32px',
              fontWeight: 400,
              lineHeight: 1.4,
              color: '#cbd5e1',
              display: 'flex',
            },
            children: 'Calculadoras online gratuitas y precisas',
          },
        },
        // Spacer
        {
          type: 'div',
          props: {
            style: { flex: 1, display: 'flex' },
          },
        },
        // Footer
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
                          width: '44px',
                          height: '44px',
                          borderRadius: '10px',
                          background: '#2563eb',
                          color: '#ffffff',
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

async function main() {
  const fonts = await loadFonts();
  const element = buildTemplate();

  const svg = await satori(element as Parameters<typeof satori>[0], {
    width: 1200,
    height: 630,
    fonts,
  });

  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: 1200 },
    font: { loadSystemFonts: false },
  });

  const png = resvg.render().asPng();
  writeFileSync(OUT_PATH, png);
  console.log(`[og-default] written ${png.length} bytes → ${OUT_PATH}`);
}

main().catch((err) => {
  console.error('[og-default] fatal:', err);
  process.exit(1);
});
