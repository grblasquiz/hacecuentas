export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

/**
 * Empanadas per guest calculator.
 *
 * Real formula:
 *   base = adults × rate_per_adult + children × rate_per_child
 *   con_margen = ceil(base × 1.12 / 12) × 12   (rounded up to nearest dozen with ~12% buffer)
 *
 * Per-person rates (based on Argentine catering standards and international party-planning guides):
 *   snack/picada:       2–3  → midpoint 2.5  (kids ~1.5)
 *   appetizer/entrada:  3–4  → midpoint 3.5  (kids ~2)
 *   main/principal:     5–6  → midpoint 5.5  (kids ~3)
 *   sole dish/único:    6–8  → midpoint 7    (kids ~4)
 */
export function cantidadEmpanadasPorInvitadoEvento(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  const totalGuests = Math.max(1, Math.round(Number(i.guests) || 0));
  const children    = Math.min(totalGuests, Math.max(0, Math.round(Number(i.children) || 0)));
  const adults      = totalGuests - children;
  const servingType = String(i.serving_type || 'main');

  // Per-adult rate and per-child rate by serving type
  const rates: Record<string, [number, number]> = {
    snack:     [2.5, 1.5],
    appetizer: [3.5, 2.0],
    main:      [5.5, 3.0],
    sole:      [7.0, 4.0],
  };

  const [adultRate, childRate] = rates[servingType] ?? rates['main'];
  const base = adults * adultRate + children * childRate;
  const docenasBase = base / 12;
  const docenasConMargen = Math.ceil((base * 1.12) / 12);
  const totalConMargen = docenasConMargen * 12;

  // Serving type label
  const typeLabels: Record<string, [string, string]> = {
    snack:     ['Picada/Snack', 'Snack / Side dish'],
    appetizer: ['Entrada / Appetizer', 'Appetizer / Starter'],
    main:      ['Plato principal', 'Main course'],
    sole:      ['Único plato (sin otra comida)', 'Sole dish (no other food)'],
  };
  const [typeEs, typeEn] = typeLabels[servingType] ?? typeLabels['main'];

  const resultado = Math.round(base);

  const resumen = __lang === 'en'
    ? `${adults} adult${adults !== 1 ? 's' : ''}${children > 0 ? ` + ${children} kid${children !== 1 ? 's' : ''}` : ''} · ${typeEn} (${adultRate}/adult${children > 0 ? `, ${childRate}/kid` : ''}) → **${resultado} empanadas** (${docenasBase.toFixed(1)} dozen). With 12 % safety buffer: **${totalConMargen} empanadas = ${docenasConMargen} dozen**.`
    : `${adults} adulto${adults !== 1 ? 's' : ''}${children > 0 ? ` + ${children} niño${children !== 1 ? 's' : ''}` : ''} · ${typeEs} (${adultRate}/adulto${children > 0 ? `, ${childRate}/niño` : ''}) → **${resultado} empanadas** (${docenasBase.toFixed(1)} docenas). Con 12 % de margen: **${totalConMargen} empanadas = ${docenasConMargen} docenas**.`;

  const insight = __lang === 'en'
    ? {
        title: 'How many to order',
        text: `You need about **${resultado} empanadas** (~${docenasBase.toFixed(1)} dozen). Adding the standard 12 % catering buffer, order **${docenasConMargen} dozen (${totalConMargen} empanadas)** so you don't run short. Vary at least 2–3 fillings for dietary diversity.`,
        tone: 'neutral',
        icon: '🥟',
      }
    : {
        title: 'Cuántas encargar',
        text: `Necesitás unas **${resultado} empanadas** (~${docenasBase.toFixed(1)} docenas). Sumando el 12 % de margen estándar, encargá **${docenasConMargen} docenas (${totalConMargen} empanadas)** para no quedarte corto. Variá al menos 2–3 sabores para cubrir preferencias.`,
        tone: 'neutral',
        icon: '🥟',
      };

  return {
    resultado: resultado.toString(),
    resumen,
    _insight: insight,
  };
}
