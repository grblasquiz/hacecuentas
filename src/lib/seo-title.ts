// Límite que marca el auditor de Bing (~600px ≈ 65 chars). Es el guard duro de
// build (scripts/verify-build-integrity.ts) y el techo que compactSeoTitle nunca
// supera. Bajado de 70 → 65 en 2026-07 tras el warning "Title too long" (176 págs).
export const SEO_TITLE_MAX_LENGTH = 65;

// Objetivo real de compactación: apuntamos por debajo del límite para dejar margen
// (glifos anchos, mayúsculas) y que el título entre entero en el SERP sin truncar.
const SEO_TITLE_TARGET_LENGTH = 60;

const MIN_USEFUL_PREFIX_LENGTH = 35;
// Longitud mínima aceptable para un corte por palabra; por debajo preferimos no
// mutilar y dejar el título un poco más largo (pero siempre ≤ SEO_TITLE_MAX_LENGTH).
const MIN_HARDCUT_LENGTH = 45;

const TRAILING_BRAND =
  /\s*\|\s*Hacé Cuentas(?:\s+(?:Argentina|México|Mexico|Chile|Colombia|España|Perú|Ecuador|Uruguay|Venezuela|Portugal|Brasil))?\s*$/i;

// Separadores de cláusula secundaria, del menos valioso al más. Incluye apertura de
// paréntesis ` (` y ` + ` (patrón "+ tabla") para poder soltar aclaraciones enteras
// en vez de cortarlas por la mitad.
const CLAUSE_SEPARATORS = [' | ', ' — ', ' – ', ' (', ' + ', ' · ', ': '];

// Palabras/símbolos que no pueden quedar al final de un título (preposiciones,
// conjunciones, conectores, puntuación suelta). ES + PT + EN.
const DANGLING_WORDS = new Set([
  'por', 'de', 'del', 'la', 'el', 'los', 'las', 'y', 'e', 'o', 'u', 'con', 'sin',
  'para', 'a', 'en', 'según', 'segun', 'mi', 'tu', 'su', 'un', 'una', 'al', 'vs',
  'da', 'do', 'das', 'dos', 'em', 'com', 'no', 'se', 'que',
  'the', 'of', 'for', 'and', 'to', 'by',
]);

/** Saca puntuación suelta, un paréntesis abierto sin cerrar y conectores colgantes. */
function cleanTail(input: string): string {
  let title = input.trim();
  for (;;) {
    const before = title;
    title = title.replace(/[\s+\-–—:,;·|/&(]+$/u, '').trim();
    // fragmento de paréntesis abierto sin cerrar → soltamos desde el "("
    const opens = (title.match(/\(/g) || []).length;
    const closes = (title.match(/\)/g) || []).length;
    if (opens > closes) {
      const idx = title.lastIndexOf('(');
      if (idx >= 0) title = title.slice(0, idx).trim();
    }
    const tokens = title.split(' ');
    const last = tokens[tokens.length - 1]?.toLowerCase().replace(/[.,;:]+$/u, '');
    if (last && DANGLING_WORDS.has(last)) title = tokens.slice(0, -1).join(' ');
    if (title === before) break;
  }
  return title;
}

/**
 * Mantiene el title de SERP dentro del límite del auditor sin tocar el título
 * editorial, el H1, el schema ni las tarjetas sociales.
 *
 * Orden de compactación:
 * 1. saca la marca final si el title ya es largo;
 * 2. elimina una cláusula secundaria desde la derecha (paréntesis, "+ …", etc.);
 * 3. corta en el último límite de palabra, limpiando conectores colgantes;
 * 4. si un corte limpio no es posible, deja el título sin mutilar (pero garantiza
 *    que nunca supere SEO_TITLE_MAX_LENGTH).
 */
export function compactSeoTitle(
  value: string,
  maxLength = SEO_TITLE_TARGET_LENGTH,
): string {
  let title = String(value || '').replace(/\s+/g, ' ').trim();
  if (title.length <= maxLength) return title;

  title = title.replace(TRAILING_BRAND, '').trim();
  if (title.length <= maxLength) return title;

  for (const separator of CLAUSE_SEPARATORS) {
    while (title.length > maxLength) {
      const index = title.lastIndexOf(separator);
      if (index < MIN_USEFUL_PREFIX_LENGTH) break;
      title = cleanTail(title.slice(0, index));
    }
    if (title.length <= maxLength) return title;
  }

  // Corte por palabra al objetivo, limpiando el final.
  const bounded = title.slice(0, maxLength + 1);
  const wordBoundary = bounded.lastIndexOf(' ');
  if (wordBoundary >= MIN_USEFUL_PREFIX_LENGTH) {
    const candidate = cleanTail(bounded.slice(0, wordBoundary));
    if (candidate.length >= MIN_HARDCUT_LENGTH) return candidate;
  }

  // Fallback: no hay corte limpio. Si ya entra en el límite del auditor, lo dejamos
  // sin mutilar; si no, cortamos al límite duro como último recurso.
  if (title.length <= SEO_TITLE_MAX_LENGTH) return title;
  const hard = title.slice(0, SEO_TITLE_MAX_LENGTH + 1);
  const hardBoundary = hard.lastIndexOf(' ');
  return cleanTail(
    hardBoundary >= MIN_USEFUL_PREFIX_LENGTH
      ? hard.slice(0, hardBoundary)
      : title.slice(0, SEO_TITLE_MAX_LENGTH),
  );
}
