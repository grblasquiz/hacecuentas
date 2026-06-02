/** Calculadora de Probabilidad de Drop/Loot */
export interface Inputs {
  dropRate: number;
  intentos: number;
  __lang?: string;
}
export interface Outputs {
  probAlMenosUno: number;
  intentos50: number;
  intentos90: number;
  intentos99: number;
  mensaje: string;
  _insight?: any;
  _chart?: any;
}

function dropChart(prob: number, __lang: string) {
  const p = Math.round(prob);
  return {
    type: 'scale' as const,
    marker: p,
    markerLabel: (__lang === 'en' ? 'Chance: ' : 'Chance: ') + p + ' %',
    min: 0,
    unit: '%',
    segments: [
      { nombre: __lang === 'en' ? 'Unlikely' : 'Improbable', max: 25, color: '#fca5a5', colorDark: '#7f1d1d' },
      { nombre: __lang === 'en' ? 'Low' : 'Baja', max: 50, color: '#fed7aa', colorDark: '#9a3412' },
      { nombre: __lang === 'en' ? 'Even' : 'Pareja', max: 75, color: '#fde68a', colorDark: '#b45309' },
      { nombre: __lang === 'en' ? 'Likely' : 'Probable', max: 90, color: '#bbf7d0', colorDark: '#166534' },
      { nombre: __lang === 'en' ? 'Near-certain' : 'Casi seguro', max: 100, color: '#86efac', colorDark: '#14532d' },
    ],
    ariaLabel: __lang === 'en'
      ? 'Scale of the chance of getting at least one drop, from unlikely to near-certain.'
      : 'Escala de la chance de obtener al menos un drop, de improbable a casi seguro.',
  };
}

export function probabilidadDropLoot(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const dr = Number(i.dropRate) / 100;
  const n = Number(i.intentos);

  if (!dr || dr <= 0 || dr > 1) throw new Error(__lang === 'en' ? 'Enter a valid drop rate (0.001% - 100%)' : 'Ingresá un drop rate válido (0.001% - 100%)');
  if (!n || n < 1) throw new Error(__lang === 'en' ? 'Enter at least 1 attempt' : 'Ingresá al menos 1 intento');

  // Short-circuit: drop rate 100% → siempre se obtiene en 1 intento
  if (dr >= 1) {
    return {
      probAlMenosUno: 100,
      intentos50: 1,
      intentos90: 1,
      intentos99: 1,
      mensaje: __lang === 'en'
        ? `With a 100% drop rate, you get the item guaranteed in 1 attempt.`
        : `Con 100% de drop rate, obtenés el ítem garantizado en 1 intento.`,
      _insight: {
        title: __lang === 'en' ? 'Guaranteed drop' : 'Drop garantizado',
        text: __lang === 'en'
          ? `A **100% drop rate** means the item is guaranteed: **1 attempt** is always enough.`
          : `Un **drop rate de 100%** significa ítem garantizado: con **1 intento** siempre alcanza.`,
        tone: 'good',
        icon: '🎁',
      },
      _chart: dropChart(100, __lang),
    };
  }

  // P(at least 1) = 1 - (1 - dr)^n
  const probAlMenosUno = (1 - Math.pow(1 - dr, n)) * 100;

  // Intentos para X% = ln(1 - X) / ln(1 - dr)
  const intentos50 = Math.ceil(Math.log(0.5) / Math.log(1 - dr));
  const intentos90 = Math.ceil(Math.log(0.1) / Math.log(1 - dr));
  const intentos99 = Math.ceil(Math.log(0.01) / Math.log(1 - dr));

  const _insight = {
    title: __lang === 'en' ? 'Your odds so far' : 'Tu chance hasta ahora',
    text: probAlMenosUno >= 90
      ? (__lang === 'en'
          ? `After **${n} attempts** you have a **${probAlMenosUno.toFixed(1)}% chance** of having dropped it — you're past the 90% mark, so it'd be unlucky not to have it.`
          : `Tras **${n} intentos** tenés **${probAlMenosUno.toFixed(1)}% de chance** de haberlo dropeado: ya pasaste el 90%, sería mala suerte no tenerlo.`)
      : probAlMenosUno >= 50
        ? (__lang === 'en'
            ? `**${probAlMenosUno.toFixed(1)}% chance** after **${n} attempts** — better than a coin flip, but **${intentos90}** attempts get you to 90%.`
            : `**${probAlMenosUno.toFixed(1)}% de chance** tras **${n} intentos**: mejor que cara o cruz, pero llegás al 90% recién con **${intentos90}** intentos.`)
        : (__lang === 'en'
            ? `Only **${probAlMenosUno.toFixed(1)}%** after **${n} attempts**. You'd need **${intentos50}** just for a coin-flip chance and **${intentos90}** for 90% — grind ahead.`
            : `Solo **${probAlMenosUno.toFixed(1)}%** tras **${n} intentos**. Necesitás **${intentos50}** para llegar a 50% y **${intentos90}** para 90%: hay farmeo por delante.`),
    tone: probAlMenosUno >= 90 ? 'good' : probAlMenosUno >= 50 ? 'neutral' : 'warn',
    icon: '🎲',
  };

  return {
    probAlMenosUno: Number(probAlMenosUno.toFixed(2)),
    intentos50,
    intentos90,
    intentos99,
    mensaje: __lang === 'en'
      ? `With a ${(dr * 100).toFixed(3)}% drop rate and ${n} attempts, you have a ${probAlMenosUno.toFixed(1)}% chance of getting at least 1. You need ${intentos50} attempts for 50% and ${intentos90} for 90%.`
      : `Con ${(dr * 100).toFixed(3)}% de drop rate y ${n} intentos, tenés ${probAlMenosUno.toFixed(1)}% de chance de haber obtenido al menos 1. Necesitás ${intentos50} intentos para 50% y ${intentos90} para 90%.`,
    _insight,
    _chart: dropChart(probAlMenosUno, __lang),
  };
}
