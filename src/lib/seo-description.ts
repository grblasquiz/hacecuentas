// Google trunca la meta description alrededor de los ~160 caracteres (el ancho
// real varía, pero 155-160 es el consenso). Una description que se corta a la
// mitad de una frase pierde el gancho justo donde debería cerrar y baja el CTR
// —que en este sitio es el cuello de botella, no la posición.
//
// Mismo criterio que `seo-title.ts`: NO tocamos el texto editorial del JSON; se
// compacta sólo lo que va al `<meta name="description">`. og:/twitter: siguen
// recibiendo el texto completo (esas plataformas cortan con sus propias reglas).

/** Techo duro: por encima de esto la description se trunca en el SERP. */
export const SEO_DESC_MAX_LENGTH = 160;

/** Objetivo de compactación: deja margen para glifos anchos. */
const SEO_DESC_TARGET_LENGTH = 155;

/**
 * Mínimo para aceptar un corte por frase. Por debajo preferimos cortar por
 * palabra: quedarse con "Calculá tu sueldo." desperdicia el espacio del SERP.
 */
const MIN_SENTENCE_LENGTH = 90;

// Conectores que no pueden quedar colgando al final. ES + PT + EN.
const DANGLING_WORDS = new Set([
  'por', 'de', 'del', 'la', 'el', 'los', 'las', 'y', 'e', 'o', 'u', 'con', 'sin',
  'para', 'a', 'en', 'según', 'segun', 'mi', 'tu', 'su', 'un', 'una', 'al', 'vs',
  'da', 'do', 'das', 'dos', 'em', 'com', 'no', 'se', 'que', 'como', 'cuánto', 'cuanto',
  'the', 'of', 'for', 'and', 'to', 'by', 'your', 'with',
]);

/** Saca puntuación suelta, paréntesis abiertos sin cerrar y conectores colgantes. */
function cleanTail(input: string): string {
  let text = input.trim();
  for (;;) {
    const before = text;
    text = text.replace(/[\s+\-–—:,;·|/&(]+$/u, '').trim();
    const opens = (text.match(/\(/g) || []).length;
    const closes = (text.match(/\)/g) || []).length;
    if (opens > closes) {
      const idx = text.lastIndexOf('(');
      if (idx >= 0) text = text.slice(0, idx).trim();
    }
    const tokens = text.split(' ');
    const last = tokens[tokens.length - 1]?.toLowerCase().replace(/[.,;:]+$/u, '');
    if (last && DANGLING_WORDS.has(last) && tokens.length > 1) text = tokens.slice(0, -1).join(' ');
    if (text === before) break;
  }
  return text;
}

/**
 * Mantiene la meta description dentro del ancho que Google muestra.
 *
 * Orden de compactación:
 * 1. si entra, no se toca;
 * 2. corte en el último fin de frase que quepa (queda un texto que cierra bien,
 *    sin puntos suspensivos);
 * 3. si no hay frase utilizable, corte en el último límite de palabra + "…",
 *    limpiando conectores colgantes.
 */
export function compactSeoDescription(
  value: string,
  maxLength = SEO_DESC_TARGET_LENGTH,
): string {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  if (text.length <= maxLength) return text;

  // 2. Último fin de frase que entre en el límite.
  const window = text.slice(0, maxLength + 1);
  let sentenceEnd = -1;
  for (const m of window.matchAll(/[.!?](?=\s|$)/gu)) {
    // Evitar cortar en abreviaturas/decimales tipo "1.500" o "ej." sueltas.
    const idx = (m.index ?? 0) + 1;
    const next = text[idx];
    if (next && next !== ' ') continue;
    sentenceEnd = idx;
  }
  if (sentenceEnd >= MIN_SENTENCE_LENGTH) {
    return text.slice(0, sentenceEnd).trim();
  }

  // 3. Corte por palabra + elipsis (la elipsis ocupa 1 char del presupuesto).
  const hardWindow = text.slice(0, maxLength - 1);
  const lastSpace = hardWindow.lastIndexOf(' ');
  const cut = lastSpace > 0 ? hardWindow.slice(0, lastSpace) : hardWindow;
  const cleaned = cleanTail(cut);
  return `${cleaned}…`;
}
