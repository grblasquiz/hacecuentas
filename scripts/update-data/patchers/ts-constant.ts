/**
 * Patchea constantes dentro de archivos TypeScript de fórmulas preservando
 * el resto del archivo (incluido comentarios, formato, tipos).
 *
 * Dos modos:
 *
 *   1. Reemplazar un literal numérico en una línea conocida (cotización fallback):
 *      replaceNumericConstInObject(path, 'blue', 1450, 1410)
 *
 *   2. Reemplazar un array literal completo (escala monotributo):
 *      replaceArrayLiteral(path, 'categoriasServicios', newArrayAsJSON)
 *
 * Usa regex cuidadosamente anclados. Si el archivo cambió de estructura, la
 * regex no matchea y la función devuelve false (no rompe silenciosamente).
 */

import { readFileSync, writeFileSync } from 'node:fs';

/**
 * Reemplaza `key: oldValue` por `key: newValue` dentro de un object literal.
 * Útil para patchear fallbacks tipo `{ blue: 1450, oficial: 1080 }`.
 * Devuelve true si hizo el cambio, false si no encontró el patrón.
 */
export function replaceNumericKeyInObject(
  filePath: string,
  key: string,
  newValue: number,
): { changed: boolean; oldValue: number | null } {
  const src = readFileSync(filePath, 'utf8');
  // Match: key: número (con o sin decimales, posible coma al final)
  const re = new RegExp(`(${key}\\s*:\\s*)(-?\\d+(?:\\.\\d+)?)(\\b)`, 'g');
  let match: RegExpExecArray | null;
  let oldValue: number | null = null;
  let replaced = false;
  const out = src.replace(re, (_full, prefix: string, num: string, suffix: string) => {
    if (replaced) return `${prefix}${num}${suffix}`; // solo reemplazamos la primera ocurrencia
    oldValue = Number(num);
    replaced = true;
    const rounded = Number.isInteger(newValue) ? String(newValue) : newValue.toString();
    return `${prefix}${rounded}${suffix}`;
  });
  if (!replaced) return { changed: false, oldValue: null };
  if (oldValue === newValue) return { changed: false, oldValue }; // no-op
  writeFileSync(filePath, out, 'utf8');
  return { changed: true, oldValue };
}

/**
 * Reemplaza un array literal completo asignado a una const.
 *   const NAME: Foo[] = [ ... ];
 * Se matchea por nombre y se reemplaza todo el contenido entre `[` y `];`.
 * El newContent debe ser el texto TS del array (sin `[` `]` — solo los items).
 */
export function replaceArrayLiteral(
  filePath: string,
  constName: string,
  newContent: string,
): boolean {
  const src = readFileSync(filePath, 'utf8');
  // Match: const NAME<opcional tipo> = [  ... ];
  const re = new RegExp(
    `(const\\s+${constName}(?:\\s*:\\s*[^=]+)?\\s*=\\s*\\[)([\\s\\S]*?)(\\]\\s*;)`,
  );
  const m = re.exec(src);
  if (!m) return false;
  const replaced = src.replace(re, `$1\n${newContent}\n$3`);
  if (replaced === src) return false;
  writeFileSync(filePath, replaced, 'utf8');
  return true;
}
