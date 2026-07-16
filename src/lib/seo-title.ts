export const SEO_TITLE_MAX_LENGTH = 70;

const MIN_USEFUL_PREFIX_LENGTH = 35;
const TRAILING_BRAND =
  /\s*\|\s*Hacé Cuentas(?:\s+(?:Argentina|México|Mexico|Chile|Colombia|España|Perú|Ecuador|Uruguay|Venezuela|Portugal|Brasil))?\s*$/i;
const CLAUSE_SEPARATORS = [' | ', ' — ', ' – ', ': '];

/**
 * Mantiene el title de SERP dentro del límite del auditor sin tocar el título
 * editorial, el H1, el schema ni las tarjetas sociales.
 *
 * Orden de compactación:
 * 1. saca la marca final si el title ya es largo;
 * 2. elimina una cláusula secundaria desde la derecha;
 * 3. como último recurso corta en el último límite de palabra.
 */
export function compactSeoTitle(
  value: string,
  maxLength = SEO_TITLE_MAX_LENGTH,
): string {
  let title = String(value || '').replace(/\s+/g, ' ').trim();
  if (title.length <= maxLength) return title;

  title = title.replace(TRAILING_BRAND, '').trim();
  if (title.length <= maxLength) return title;

  for (const separator of CLAUSE_SEPARATORS) {
    while (title.length > maxLength) {
      const index = title.lastIndexOf(separator);
      if (index < MIN_USEFUL_PREFIX_LENGTH) break;
      title = title.slice(0, index).trim();
    }
    if (title.length <= maxLength) return title;
  }

  const bounded = title.slice(0, maxLength + 1);
  const wordBoundary = bounded.lastIndexOf(' ');
  return (
    wordBoundary >= MIN_USEFUL_PREFIX_LENGTH
      ? bounded.slice(0, wordBoundary)
      : title.slice(0, maxLength)
  ).trim();
}
