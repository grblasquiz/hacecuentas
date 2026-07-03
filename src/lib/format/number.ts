/**
 * Normalización de números localizados — ÚNICA fuente de verdad.
 * ---------------------------------------------------------------------------
 * Antes cada formulario/fórmula re-implementaba su propio parseo de "1.000.000",
 * "1,000,000", "1.000.000,50", etc. (ver el viejo `coerce()` de calc-compute.ts,
 * que sólo entendía es-AR y rompía formatos US). Este módulo centraliza el
 * parseo para que TODA superficie — el endpoint REST, el MCP y el front — acepte
 * la misma familia de formatos con el mismo criterio.
 *
 * Acepta, como pide la spec de UX:
 *   1000000        → 1000000
 *   1.000.000      → 1000000
 *   1,000,000      → 1000000
 *   1.000.000,50   → 1000000.5
 *   1000000.50     → 1000000.5
 * y además tolera símbolos de moneda/unidad y espacios ($ 1.234,50 kg → 1234.5).
 *
 * No tiene dependencias: seguro en el runtime de Cloudflare Workers.
 */

/** Locale o país que define el separador decimal esperado cuando el input es
 *  ambiguo (un solo separador que agrupa exactamente 3 dígitos). */
export type NumberLocaleHint = string;

/**
 * Separador decimal por locale/país. La regla real del mundo:
 * inglés (en / en-US / en-GB) usa "." decimal; el resto de los mercados de
 * Hacé Cuentas (es-AR, es, es-MX, pt-BR, …) usa "," decimal.
 */
export function decimalSeparatorFor(hint: NumberLocaleHint = 'es-AR'): ',' | '.' {
  const base = String(hint).toLowerCase().split(/[-_]/)[0];
  return base === 'en' ? '.' : ',';
}

/** Resuelve un input con UN solo tipo de separador (`.` o `,`). */
function resolveSingleSeparator(digits: string, sep: '.' | ',', decSep: '.' | ','): string {
  const occurrences = digits.split(sep).length - 1;
  // Un separador que aparece más de una vez sólo puede ser agrupador de miles
  // ("1.000.000", "1,000,000"): un decimal nunca se repite.
  if (occurrences > 1) return digits.split(sep).join('');

  const [left, right] = digits.split(sep);
  // Grupo derecho de exactamente 3 dígitos → genuinamente ambiguo
  // ("1.000" puede ser 1000 o 1.0). Lo resuelve el separador decimal del locale:
  // si el separador ES el decimal del locale → es decimal; si no → miles.
  if (right.length === 3) {
    return sep === decSep ? `${left}.${right}` : `${left}${right}`;
  }
  // Cualquier otro largo (1, 2, 4+ dígitos) → es un decimal ("1000.5", "0,50").
  return `${left}.${right}`;
}

/**
 * Parsea un número localizado a `number`. Devuelve `NaN` si no hay dígitos
 * parseables (el caller decide el fallback).
 *
 * @param input  string | number | null
 * @param opts.locale  pista de locale/país para desambiguar ("es-AR" por defecto)
 */
export function parseLocaleNumber(
  input: unknown,
  opts: { locale?: NumberLocaleHint } = {},
): number {
  if (typeof input === 'number') return input;
  if (input == null) return NaN;

  let s = String(input).trim();
  if (s === '') return NaN;

  const negative = /^\s*[-−]/.test(s); // guion ASCII o signo menos Unicode
  // Nos quedamos sólo con dígitos y separadores; símbolos de moneda/unidad y
  // espacios (incluye NBSP/thin space) se descartan.
  const digits = s.replace(/[^0-9.,]/g, '');
  if (digits === '' || !/[0-9]/.test(digits)) return NaN;

  const hasDot = digits.includes('.');
  const hasComma = digits.includes(',');
  const decSep = decimalSeparatorFor(opts.locale);

  let normalized: string;
  if (hasDot && hasComma) {
    // Ambos presentes: el que aparece MÁS A LA DERECHA es el decimal; el otro
    // es el agrupador de miles. Cubre "1.000.000,50" y "1,000,000.50".
    const dec: '.' | ',' = digits.lastIndexOf('.') > digits.lastIndexOf(',') ? '.' : ',';
    const grp: '.' | ',' = dec === '.' ? ',' : '.';
    normalized = digits.split(grp).join('').replace(dec, '.');
  } else if (hasComma) {
    normalized = resolveSingleSeparator(digits, ',', decSep);
  } else if (hasDot) {
    normalized = resolveSingleSeparator(digits, '.', decSep);
  } else {
    normalized = digits;
  }

  const n = Number(normalized);
  if (!Number.isFinite(n)) return NaN;
  return negative ? -Math.abs(n) : n;
}

/**
 * Igual que `parseLocaleNumber` pero con fallback explícito en vez de NaN.
 * Útil en formularios donde querés conservar el input crudo si es inválido.
 */
export function parseLocaleNumberOr<T>(
  input: unknown,
  fallback: T,
  opts: { locale?: NumberLocaleHint } = {},
): number | T {
  const n = parseLocaleNumber(input, opts);
  return Number.isNaN(n) ? fallback : n;
}

/** ¿El string representa un número parseable? (para validación de campos). */
export function isNumericInput(input: unknown, opts: { locale?: NumberLocaleHint } = {}): boolean {
  return !Number.isNaN(parseLocaleNumber(input, opts));
}

/**
 * Formatea un número con separadores de miles para mostrar. Espejo de
 * `parseLocaleNumber`: lo que este formatea, aquel lo vuelve a parsear.
 */
export function formatThousands(
  value: number,
  opts: { locale?: NumberLocaleHint; decimals?: number } = {},
): string {
  if (!Number.isFinite(value)) return '';
  const decSep = decimalSeparatorFor(opts.locale);
  const grp = decSep === ',' ? '.' : ',';
  const fixed = opts.decimals != null ? value.toFixed(opts.decimals) : String(value);
  const [intPart, fracPart] = fixed.replace('-', '').split('.');
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, grp);
  const sign = value < 0 ? '-' : '';
  return fracPart != null ? `${sign}${grouped}${decSep}${fracPart}` : `${sign}${grouped}`;
}
