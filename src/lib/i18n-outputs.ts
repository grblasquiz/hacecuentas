/**
 * i18n runtime layer para OUTPUTS de fórmulas.
 *
 * Muchas fórmulas retornan strings en español (p.ej. "16-17 horas totales
 * (8-9 nocturnas + siestas irregulares)"). Cuando el calc se renderiza en /en/,
 * aplicamos una capa de traducción runtime con regex + dict ES→EN para que el
 * output se muestre en inglés sin tener que refactorear las 157 fórmulas afectadas.
 *
 * Cobertura objetivo: 80-90% de frases comunes. Las muy específicas pueden quedar
 * en ES — mejor eso que romper el build o mostrar texto roto.
 */

// Regex-based rules: patrones ES → template EN. Se aplican en orden.
// Ojo: regex de más específico a más general para evitar conflictos.
const REGEX_RULES: Array<[RegExp, string]> = [
  // Tiempo compuesto
  [/\b(\d+(?:[-–]\d+)?)\s+horas?\s+totales?\s+\(([^)]+)\)/gi, '$1 total hours ($2)'],
  [/\b(\d+(?:[-–]\d+)?)\s+horas?\s+totales?/gi, '$1 total hours'],
  [/\b(\d+(?:[-–]\d+)?)\s+nocturnas?\b/gi, '$1 nighttime'],
  [/\b(\d+(?:[-–]\d+)?)\s+diurnas?\b/gi, '$1 daytime'],

  // Siestas
  [/\bsiestas?\s+irregulares?\b/gi, 'irregular naps'],
  [/\b(\d+(?:[-–]\d+)?|algunas|muchas)\s+siestas?\b/gi, '$1 naps'],
  [/\bsin\s+siestas?\b/gi, 'no naps'],
  [/\bsiesta\s+opcional\b/gi, 'optional nap'],

  // Por período
  [/\bpor\s+día\b/gi, 'per day'],
  [/\bpor\s+semana\b/gi, 'per week'],
  [/\bpor\s+mes\b/gi, 'per month'],
  [/\bpor\s+año\b/gi, 'per year'],
  [/\bpor\s+hora\b/gi, 'per hour'],
  [/\bpor\s+persona\b/gi, 'per person'],
  [/\bpor\s+kg\b/gi, 'per kg'],
  [/\bpor\s+porción\b/gi, 'per serving'],
  [/\bpor\s+comida\b/gi, 'per meal'],

  // Unidades de tiempo con números
  [/\b(\d+(?:[.,]\d+)?(?:[-–]\d+(?:[.,]\d+)?)?)\s+años?\b/gi, '$1 years'],
  [/\b(\d+(?:[.,]\d+)?(?:[-–]\d+(?:[.,]\d+)?)?)\s+meses?\b/gi, '$1 months'],
  [/\b(\d+(?:[.,]\d+)?(?:[-–]\d+(?:[.,]\d+)?)?)\s+semanas?\b/gi, '$1 weeks'],
  [/\b(\d+(?:[.,]\d+)?(?:[-–]\d+(?:[.,]\d+)?)?)\s+días?\b/gi, '$1 days'],
  [/\b(\d+(?:[.,]\d+)?(?:[-–]\d+(?:[.,]\d+)?)?)\s+horas?\b/gi, '$1 hours'],
  [/\b(\d+(?:[.,]\d+)?(?:[-–]\d+(?:[.,]\d+)?)?)\s+minutos?\b/gi, '$1 minutes'],
  [/\b(\d+(?:[.,]\d+)?(?:[-–]\d+(?:[.,]\d+)?)?)\s+segundos?\b/gi, '$1 seconds'],
  [/\b(\d+(?:[.,]\d+)?(?:[-–]\d+(?:[.,]\d+)?)?)\s+veces\b/gi, '$1 times'],

  // Unidades de personas/objetos
  [/\b(\d+(?:[-–]\d+)?)\s+personas?\b/gi, '$1 people'],
  [/\b(\d+(?:[-–]\d+)?)\s+adultos?\b/gi, '$1 adults'],
  [/\b(\d+(?:[-–]\d+)?)\s+niños?\b/gi, '$1 children'],
  [/\b(\d+(?:[-–]\d+)?)\s+hijos?\b/gi, '$1 children'],
  [/\b(\d+(?:[-–]\d+)?)\s+bebés?\b/gi, '$1 babies'],
  [/\b(\d+(?:[-–]\d+)?)\s+invitados?\b/gi, '$1 guests'],

  // Intensidad / nivel
  [/\bmuy\s+alto\b/gi, 'very high'],
  [/\bmuy\s+bajo\b/gi, 'very low'],
  [/\bmuy\s+intenso\b/gi, 'very intense'],
  [/\bmoderado\b/gi, 'moderate'],
  [/\bintenso\b/gi, 'intense'],
  [/\bligero\b/gi, 'light'],
  [/\bsedentario\b/gi, 'sedentary'],

  // Frecuencia típica ejercicio
  [/\b(\d+(?:-\d+)?)x\/semana\b/gi, '$1x/week'],
  [/\b(\d+(?:-\d+)?)x\/mes\b/gi, '$1x/month'],
  [/\b(\d+(?:-\d+)?)x\/día\b/gi, '$1x/day'],

  // Comparativas
  [/\bmayor\s+a\b/gi, 'greater than'],
  [/\bmenor\s+a\b/gi, 'less than'],
  [/\bentre\s+(\d+)\s+y\s+(\d+)/gi, 'between $1 and $2'],

  // Fases / etapas comunes
  [/\brecién\s+nacido\b/gi, 'newborn'],
  [/\bembarazo\b/gi, 'pregnancy'],
  [/\bembarazada\b/gi, 'pregnant'],
  [/\bpost-?parto\b/gi, 'postpartum'],
  [/\blactancia\b/gi, 'breastfeeding'],
  [/\bmenopausia\b/gi, 'menopause'],
  [/\bovulación\b/gi, 'ovulation'],
  [/\bmenstrua(?:ción|l)\b/gi, 'menstruation'],

  // Dosis / medicina
  [/\bliberación\s+sostenida\b/gi, 'sustained release'],
  [/\bliberación\s+inmediata\b/gi, 'immediate release'],
  [/\bantes\s+del\s+sueño\b/gi, 'before sleep'],
  [/\bantes\s+de\s+dormir\b/gi, 'before bed'],
  [/\bal\s+despertar\b/gi, 'upon waking'],
  [/\bdosis\s+máxima\b/gi, 'maximum dose'],
  [/\bdosis\s+mínima\b/gi, 'minimum dose'],
  [/\bdosis\s+recomendada\b/gi, 'recommended dose'],

  // Ejercicio / fitness
  [/\bde\s+músculo\b/gi, 'of muscle'],
  [/\bganancia\s+muscular\b/gi, 'muscle gain'],
  [/\bpérdida\s+de\s+grasa\b/gi, 'fat loss'],
  [/\bfuerza\s+máxima\b/gi, 'max strength'],
  [/\bresistencia\b/gi, 'endurance'],
  [/\bhipertrofia\b/gi, 'hypertrophy'],

  // Descriptores comunes
  [/\bnormal\b/gi, 'normal'],
  [/\baceptable\b/gi, 'acceptable'],
  [/\bideal\b/gi, 'ideal'],
  [/\bsaludable\b/gi, 'healthy'],
  [/\brecomendable\b/gi, 'recommended'],
  [/\brecomendad[oa]\b/gi, 'recommended'],
  [/\bno\s+recomendad[oa]\b/gi, 'not recommended'],
  [/\bnecesario\b/gi, 'necessary'],
  [/\bopcional\b/gi, 'optional'],
  [/\bimportante\b/gi, 'important'],
  [/\burgente\b/gi, 'urgent'],
  [/\bgrave\b/gi, 'serious'],
  [/\bmoderad[oa]\b/gi, 'moderate'],
  [/\bleve\b/gi, 'mild'],
  [/\bmínim[oa]\b/gi, 'minimum'],
  [/\bmáxim[oa]\b/gi, 'maximum'],
  [/\bprimer(?:a|o)?\b/gi, 'first'],
  [/\bsegund(?:a|o)\b/gi, 'second'],
  [/\btercer(?:a|o)?\b/gi, 'third'],
  [/\bdiari[oa]\b/gi, 'daily'],
  [/\bsemanal\b/gi, 'weekly'],
  [/\bmensual\b/gi, 'monthly'],
  [/\banual\b/gi, 'annual'],

  // Conectores
  [/\s+o\s+más\b/gi, ' or more'],
  [/\s+o\s+menos\b/gi, ' or less'],
  [/\bmás\s+de\b/gi, 'more than'],
  [/\bmenos\s+de\b/gi, 'less than'],

  // Frases comunes
  [/\bdesde\s+(\d+)\s+años?\b/gi, 'from $1 years'],
  [/\bhasta\s+(\d+)\s+años?\b/gi, 'up to $1 years'],
  [/\bventana\s+fértil\b/gi, 'fertile window'],
  [/\bventana\s+de\s+vigilia\b/gi, 'wake window'],
  [/\bventana\s+vigilia\b/gi, 'wake window'],

  // Símbolos
  [/¿/g, ''],
  [/¡/g, ''],
];

// Unit abbreviations often in outputs
const UNIT_RULES: Array<[RegExp, string]> = [
  [/\bg\/día\b/gi, 'g/day'],
  [/\bmg\/día\b/gi, 'mg/day'],
  [/\bml\/día\b/gi, 'ml/day'],
  [/\bkg\/mes\b/gi, 'kg/month'],
  [/\bkg\/semana\b/gi, 'kg/week'],
  [/\bg\/kg\/día\b/gi, 'g/kg/day'],
  [/\bmg\/kg\/día\b/gi, 'mg/kg/day'],
  [/\bml\/kg\/día\b/gi, 'ml/kg/day'],
];

// Accented chars to replace (last pass to clean leftover ES accents in words
// that weren't caught by regex). Aggressive but low risk since output strings
// are short and accent removal just hurts legibility a tiny bit vs showing ES.
// NOTE: we do NOT strip accents by default — that would break numbers formatted
// with commas/periods. Only apply when there are actual letters.

/**
 * Translate an output value from Spanish to target lang.
 * For English, applies regex rules + unit conversions.
 * For other langs, returns value unchanged.
 */
export function translateOutput(value: string | number | null | undefined, lang: 'es' | 'en'): string {
  if (value === null || value === undefined) return '';
  const s = String(value);
  if (lang === 'es' || !s) return s;
  // EN: apply rules
  let out = s;
  for (const [re, repl] of REGEX_RULES) {
    out = out.replace(re, repl);
  }
  for (const [re, repl] of UNIT_RULES) {
    out = out.replace(re, repl);
  }
  return out;
}
