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

/**
 * Reemplaza el valor numérico de una const top-level:
 *   export const NAME = 2_280_000;
 *   const NAME: number = 340000;
 * Preserva underscores de miles en la salida (style del proyecto).
 */
export function replaceNumericConst(
  filePath: string,
  constName: string,
  newValue: number,
): { changed: boolean; oldValue: number | null } {
  const src = readFileSync(filePath, 'utf8');
  const re = new RegExp(
    `(const\\s+${constName}(?:\\s*:\\s*[^=]+)?\\s*=\\s*)(-?[\\d_]+(?:\\.\\d+)?)(\\s*;)`,
  );
  const m = re.exec(src);
  if (!m) return { changed: false, oldValue: null };
  const oldRaw = m[2].replace(/_/g, '');
  const oldValue = Number(oldRaw);
  if (oldValue === newValue) return { changed: false, oldValue };
  const formatted = formatNumberWithUnderscores(newValue);
  const replaced = src.replace(re, `$1${formatted}$3`);
  writeFileSync(filePath, replaced, 'utf8');
  return { changed: true, oldValue };
}

/**
 * Reemplaza el valor string de una const top-level:
 *   const FECHA = 'abril 2026';
 *   export const FECHA = "abril 2026";
 * Preserva el tipo de quote (comilla simple/doble) que ya haya en el archivo.
 */
export function replaceStringConst(
  filePath: string,
  constName: string,
  newValue: string,
): { changed: boolean; oldValue: string | null } {
  const src = readFileSync(filePath, 'utf8');
  const re = new RegExp(
    `(const\\s+${constName}(?:\\s*:\\s*[^=]+)?\\s*=\\s*)(['"\`])([^'"\`]*)(['"\`])(\\s*;)`,
  );
  const m = re.exec(src);
  if (!m) return { changed: false, oldValue: null };
  const oldValue = m[3];
  if (oldValue === newValue) return { changed: false, oldValue };
  // Escapar quote del tipo usado
  const quote = m[2];
  const escaped = newValue.replace(new RegExp(quote, 'g'), `\\${quote}`);
  const replaced = src.replace(re, `$1${quote}${escaped}${quote}$5`);
  writeFileSync(filePath, replaced, 'utf8');
  return { changed: true, oldValue };
}

/** Formatea un entero con underscores cada 3 dígitos (estilo del proyecto). */
export function formatNumberWithUnderscores(n: number): string {
  if (!Number.isFinite(n)) return 'Infinity';
  if (!Number.isInteger(n)) return String(n);
  return n.toLocaleString('en-US').replace(/,/g, '_');
}
