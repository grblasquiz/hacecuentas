export type SearchIntent =
  | 'calculo'
  | 'informacional'
  | 'comparacion-comercial'
  | 'navegacional';

export interface SearchTargetInput {
  path: string;
  title: string;
  description?: string;
  pageType?: string;
  lang?: 'es' | 'en' | 'pt';
  primaryKeyword?: string;
  searchIntent?: SearchIntent;
}

export interface SearchTarget {
  primaryKeyword: string;
  searchIntent: SearchIntent;
  source: 'explicit' | 'title';
}

const BRAND = /\s*(?:\||—|-)\s*hac[eé]\s+cuentas\s*$/i;
const GENERIC_TAIL = /\s+(?:\||—)\s+(?:calculadora|simulador|herramienta|gu[ií]a)\s+(?:online\s+)?(?:gratis|gratuita).*$/i;

export function cleanPrimaryKeyword(value: string): string {
  let keyword = String(value || '')
    .replace(BRAND, '')
    .replace(GENERIC_TAIL, '')
    .replace(/\s+/g, ' ')
    .trim();

  // En títulos del tipo "tema: promesa editorial", la parte previa a los dos
  // puntos suele ser la consulta estable. Conservamos preguntas y comparadores,
  // donde el complemento sí cambia la intención.
  const colon = keyword.indexOf(':');
  if (colon >= 12 && colon <= 70 && !/\b(?:vs\.?|versus|compar)/i.test(keyword)) {
    keyword = keyword.slice(0, colon).trim();
  }
  const dash = keyword.indexOf('—');
  if (dash >= 12 && dash <= 80 && !/\b(?:vs\.?|versus|compar)/i.test(keyword)) {
    keyword = keyword.slice(0, dash).trim();
  }

  return keyword.replace(/^[¿¡]+|[?!¡¿]+$/g, '').trim().slice(0, 100);
}

export function inferSearchIntent(input: Omit<SearchTargetInput, 'primaryKeyword' | 'searchIntent'>): SearchIntent {
  const path = `/${String(input.path || '').replace(/^\/+|\/+$/g, '')}`.toLowerCase();
  const text = `${input.title} ${input.description || ''} ${path}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');

  if (/^\/(?:$|contacto|sobre-nosotros|privacidad|cookies|aviso-legal|terminos|buscar|autores(?:\/|$))/.test(path)) {
    return 'navegacional';
  }
  if (/\b(?:vs\.?|versus|comparar|comparador|me conviene|conviene|precio|tarifa|costo real|cuanto cuesta)\b/.test(text)) {
    return 'comparacion-comercial';
  }
  if (
    input.pageType === 'calculator' ||
    /\b(?:calculadora|calcul[a-z]*|simulador|convertir|conversor|contador|validar|estimar|cuant[oa] necesito|cuant[oa] pago|cuant[oa] cobro)\b/.test(text)
  ) {
    return 'calculo';
  }
  return 'informacional';
}

export function resolveSearchTarget(input: SearchTargetInput): SearchTarget {
  const explicitKeyword = cleanPrimaryKeyword(input.primaryKeyword || '');
  const primaryKeyword = explicitKeyword || cleanPrimaryKeyword(input.title) || input.path.replace(/^\/+|\/+$/g, '').replace(/-/g, ' ');
  return {
    primaryKeyword,
    searchIntent: input.searchIntent || inferSearchIntent(input),
    source: explicitKeyword || input.searchIntent ? 'explicit' : 'title',
  };
}

const STOP = new Set([
  'calculadora', 'calcular', 'calculo', 'online', 'gratis', 'gratuita', 'hace', 'cuentas',
  'para', 'como', 'cuanto', 'cuanta', 'cuantos', 'cuantas', 'con', 'del', 'las', 'los',
  'una', 'uno', 'por', 'que', 'and', 'the', 'how', 'what', 'calculator', 'calculadora',
]);

export function searchTokens(value: string): Set<string> {
  return new Set(String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 2 && !STOP.has(token)));
}

export function keywordAlignment(keyword: string, copy: string): number {
  const target = searchTokens(keyword);
  if (!target.size) return 1;
  const present = searchTokens(copy);
  let hits = 0;
  target.forEach((token) => { if (present.has(token)) hits += 1; });
  return hits / target.size;
}
