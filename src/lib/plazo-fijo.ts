// ────────────────────────────────────────────────────────────────────────────
// plazo-fijo.ts — fuente compartida de tasas de plazo fijo (BCRA vía argentinadatos)
// Usado por /comparador-plazo-fijo. (api.argentinadatos.com SÍ responde al SSR de
// Astro — a diferencia del WAF de api.bcra.gob.ar, ver fetch-bcra-indices.mjs.)
// ────────────────────────────────────────────────────────────────────────────

import { fetchJSON } from './fetch-timeout';

export type PlazoFijoBanco = { banco: string; tna: number };

// Colores de marca para los bancos reconocibles; default neutro para el resto.
const COLORS: Record<string, string> = {
  Hipotecario: '#d32f2f', Macro: '#1f2b5e', 'Provincia BA': '#00893d', BBVA: '#004481',
  ICBC: '#e60012', Credicoop: '#003b8e', Nación: '#00a651', Ciudad: '#ffcd00',
  Galicia: '#fb6409', Patagonia: '#00a6a9', Santander: '#ec0000', Supervielle: '#e2001a',
  Comafi: '#1d3f6e', CMF: '#1a3e6f', Meridian: '#0a7d5a', VOII: '#6d28d9', BICA: '#1d4ed8',
  'Banco del Sol': '#f59e0b', 'Crédito Regional': '#0369a1', Mariva: '#7c3aed', Reba: '#db2777',
  'Bancor (Cba)': '#c026d3', Ualá: '#0b1f3a', Dino: '#16a34a', 'Banco Julio': '#b91c1c',
};
const DEFAULT_COLOR = '#64748b';
export function bancoColor(short: string): string {
  return COLORS[short] || DEFAULT_COLOR;
}

// Bancos reconocibles para mostrar en el comparador. Excluye compañías
// financieras y bancos chicos/regionales que el público no identifica
// (Crédito Regional, CMF, Meridian, VOII, BICA, Reba, Mariva, BiBank, Dino,
// Banco Julio, Masventas, Comercio, etc.). Martin: "solo nombres de bancos".
export const BANCOS_RECONOCIBLES = new Set<string>([
  'Nación', 'Galicia', 'BBVA', 'Macro', 'Provincia BA', 'Ciudad', 'Santander',
  'Credicoop', 'Patagonia', 'Hipotecario', 'Comafi', 'ICBC', 'Supervielle', 'Bancor (Cba)',
]);

// Nombres cortos legibles desde la razón social del BCRA.
export function bancoCorto(entidad: string): string {
  const e = (entidad || '').toUpperCase().trim();
  if (e.includes('INDUSTRIAL AND COMMERCIAL BANK OF CHINA')) return 'ICBC';
  const map: Record<string, string> = {
    'BANCO DE LA NACION ARGENTINA': 'Nación',
    'BANCO DE GALICIA Y BUENOS AIRES S.A.': 'Galicia',
    'BANCO BBVA ARGENTINA S.A.': 'BBVA',
    'BANCO MACRO S.A.': 'Macro',
    'BANCO DE LA PROVINCIA DE BUENOS AIRES': 'Provincia BA',
    'BANCO DE LA CIUDAD DE BUENOS AIRES': 'Ciudad',
    'BANCO SANTANDER ARGENTINA S.A.': 'Santander',
    'BANCO CREDICOOP COOPERATIVO LIMITADO': 'Credicoop',
    'BANCO PATAGONIA S.A.': 'Patagonia',
    'BANCO HIPOTECARIO S.A.': 'Hipotecario',
    'BANCO SUPERVIELLE S.A.': 'Supervielle',
    'BANCO COMAFI SOCIEDAD ANONIMA': 'Comafi',
    UALA: 'Ualá',
    'BANCO DE LA PROVINCIA DE CORDOBA S.A.': 'Bancor (Cba)',
    'BANCO DEL SOL S.A.': 'Banco del Sol',
    'BANCO VOII S.A.': 'VOII',
    'BANCO CMF S.A.': 'CMF',
    'BANCO MERIDIAN S.A.': 'Meridian',
    'BANCO BICA S.A.': 'BICA',
    'BANCO MARIVA S.A.': 'Mariva',
    'REBA COMPAÑIA FINANCIERA S.A.': 'Reba',
    'CRÉDITO REGIONAL COMPAÑÍA FINANCIERA S.A.U.': 'Crédito Regional',
    'BIBANK S.A.': 'BiBank',
    'BANCO DINO S.A.': 'Dino',
    'BANCO JULIO SOCIEDAD ANONIMA': 'Banco Julio',
    'BANCO DE COMERCIO S.A.': 'Comercio',
    'BANCO DE FORMOSA S.A.': 'Formosa',
    'BANCO MASVENTAS S.A.': 'Masventas',
    'BANCO PROVINCIA DE TIERRA DEL FUEGO': 'Tierra del Fuego',
    'INDUSTRIAL AND COMMERCIAL BANK OF CHINA': 'ICBC',
    'ICBC': 'ICBC',
  };
  if (map[e]) return map[e];
  let s = e
    .replace(/\bS\.?A\.?U?\.?\b/g, '')
    .replace(/\bSOCIEDAD ANONIMA\b/g, '')
    .replace(/\bCOMPA[ÑN]?[IÍ]?A FINANCIERA\b/g, '')
    .replace(/\bCOOPERATIVO LIMITADO\b/g, '')
    .replace(/^BANCO (DE LA |DE LOS |DE |DEL )?/, '')
    .replace(/[.]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  s = s.toLowerCase().replace(/\b\w/g, (ch) => ch.toUpperCase());
  return s || entidad;
}

type Raw = { entidad: string; tnaClientes: number };
export async function getPlazoFijoTop(n = 14): Promise<PlazoFijoBanco[]> {
  try {
    const data = await fetchJSON<Raw[]>('https://api.argentinadatos.com/v1/finanzas/tasas/plazoFijo', []);
    return (data || [])
      .filter((x) => x && x.tnaClientes > 0)
      .map((x) => ({ banco: bancoCorto(x.entidad), tna: +(x.tnaClientes * 100).toFixed(2) }))
      .filter((b) => BANCOS_RECONOCIBLES.has(b.banco)) // solo bancos reconocibles
      .sort((a, b) => b.tna - a.tna)
      .slice(0, n);
  } catch {
    return [];
  }
}
