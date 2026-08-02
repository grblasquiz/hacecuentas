import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { EMBEDDABLE_BY_PATH, EMBEDDABLE_TOOLS } from '../src/lib/embed-tools';
import { GET as getCatalog } from '../src/pages/api/embed-calcs.json';
import { GET as getOembed } from '../src/pages/oembed.json';

const POPULAR = [
  '/trabajo/sueldo-bruto-y-neto',
  '/impuestos/monotributo',
  '/trabajo/aguinaldo',
  '/trabajo/indemnizacion-por-despido',
  '/impuestos/ganancias-cuarta-categoria',
  '/finanzas-personales/prestamo',
  '/inversiones/interes-compuesto',
  '/inversiones/plazo-fijo',
  '/salud/peso-ideal-imc',
  '/matematica/porcentajes',
];

describe('catálogo embebible de hubs', () => {
  it('excluye índices de silo e incluye todos los accesos populares', () => {
    expect(EMBEDDABLE_TOOLS.length).toBeGreaterThan(400);
    expect(EMBEDDABLE_BY_PATH.has('/trabajo')).toBe(false);
    expect(EMBEDDABLE_BY_PATH.has('/cl/finanzas')).toBe(false);
    for (const path of POPULAR) expect(EMBEDDABLE_BY_PATH.has(path), path).toBe(true);
  });

  it('sirve un JSON CORS con rutas de hub, no slugs retirados', async () => {
    const response = await getCatalog({} as never);
    const data = await response.json() as Array<{ s: string; t: string; l: string }>;
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect(data.length).toBe(EMBEDDABLE_TOOLS.length);
    expect(data.some((item) => item.s === 'salud/peso-ideal-imc')).toBe(true);
    expect(data.some((item) => item.s === 'calculadora-imc')).toBe(false);
  });
});

describe('oEmbed después de la migración a hubs', () => {
  async function oembed(target: string) {
    const url = new URL('https://hacecuentas.com/oembed.json');
    url.searchParams.set('url', target);
    const response = await getOembed({ url } as never);
    return response.json() as Promise<{ type: string; title: string; html?: string }>;
  }

  it('devuelve rich para una URL canónica de hub', async () => {
    const data = await oembed('https://hacecuentas.com/salud/peso-ideal-imc');
    expect(data.type).toBe('rich');
    expect(data.html).toContain('/salud/peso-ideal-imc?hc_embed=1');
    expect(data.html).not.toContain('/embed/calculadora-imc');
  });

  it('mantiene compatible una URL vieja de calculadora', async () => {
    const data = await oembed('https://hacecuentas.com/calculadora-imc');
    expect(data.type).toBe('rich');
    expect(data.html).toContain('/salud/peso-ideal-imc?hc_embed=1');
  });

  it('no convierte una URL ajena o desconocida en iframe', async () => {
    expect((await oembed('https://example.com/calculadora-imc')).type).toBe('link');
    expect((await oembed('https://hacecuentas.com/no-existe')).type).toBe('link');
  });
});

describe('paquete WordPress', () => {
  const php = readFileSync(
    new URL('../wordpress-plugin/hace-cuentas-calculadoras/hace-cuentas-calculadoras.php', import.meta.url),
    'utf8',
  );
  const frontend = readFileSync(
    new URL('../wordpress-plugin/hace-cuentas-calculadoras/frontend.js', import.meta.url),
    'utf8',
  );

  it('conserva segmentos de ruta y usa el modo hub', () => {
    expect(php).toContain("Version:           1.1.0");
    expect(php).toContain("hacecuentas_normalize_path");
    expect(php).toContain("'?hc_embed=1'");
    expect(php).not.toContain("'/embed/' . $slug");
  });

  it('ajusta cada iframe por su propia ventana, incluso tras redirects', () => {
    expect(frontend).toContain("frames[ i ].contentWindow === e.source");
    expect(frontend).not.toContain('data-hc-slug');
  });
});

