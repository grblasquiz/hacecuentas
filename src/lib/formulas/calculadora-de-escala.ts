/**
 * Calculadora de escala (mapas y planos)
 * Modos: dibujo→real, real→dibujo, hallar escala.
 */

export interface EscalaInputs {
  modo: string;
  escala?: number | string;
  medida: number | string;
  unidad?: string;
  medidaPlano?: number | string;
  __lang?: string;
}

export interface EscalaOutputs {
  resultado: string;
  escalaTexto: string;
  detalle: string;
  resumen: string;
  _insight?: any;
}

// Factores a milímetros para conversión amigable
const A_MM: Record<string, number> = {
  mm: 1,
  cm: 10,
  m: 1000,
  km: 1000000,
};

const NOMBRE_UNIDAD: Record<string, string> = {
  mm: 'mm',
  cm: 'cm',
  m: 'm',
  km: 'km',
};

// Formatea un número quitando ceros sobrantes (hasta 4 decimales)
function fmt(n: number): string {
  if (!isFinite(n)) return '0';
  const rounded = Math.round(n * 10000) / 10000;
  return rounded
    .toLocaleString('es-ES', { maximumFractionDigits: 4, useGrouping: true });
}

// Convierte una medida (en su unidad) a una unidad más legible y devuelve el texto
function conversionAmigable(valor: number, unidad: string): string {
  const mm = valor * (A_MM[unidad] || 1);
  if (mm <= 0) return '';
  // Elegir la unidad más natural según la magnitud en mm
  if (mm >= 1000000) {
    return `${fmt(mm / 1000000)} km`;
  }
  if (mm >= 1000) {
    return `${fmt(mm / 1000)} m`;
  }
  if (mm >= 10) {
    return `${fmt(mm / 10)} cm`;
  }
  return `${fmt(mm)} mm`;
}

export function calculadoraDeEscala(inputs: EscalaInputs): EscalaOutputs {
  const __lang = inputs.__lang === 'en' ? 'en' : 'es';

  const T = ({
    es: {
      needMedida: 'Ingresá la medida conocida (mayor que cero).',
      needEscala: 'Ingresá la escala (el denominador N de 1:N, mayor que cero).',
      needPlano: 'Para hallar la escala ingresá la medida en el plano (mayor que cero).',
      badMode: 'Modo no reconocido.',
      insightTitle: 'Qué significa esta escala',
      // dibujoAReal
      realResultado: (v: string, u: string) => `${v} ${u} en la realidad`,
      realDetalle: (planoTxt: string, esc: string, conv: string) =>
        `${planoTxt} en el plano a escala 1:${esc} equivalen a ${conv} en la realidad.`,
      realResumen: (planoTxt: string, esc: string, realTxt: string) =>
        `A escala 1:${esc}, ${planoTxt} del dibujo representan ${realTxt} reales.`,
      // realADibujo
      dibResultado: (v: string, u: string) => `${v} ${u} en el plano`,
      dibDetalle: (realTxt: string, esc: string, conv: string) =>
        `${realTxt} reales se dibujan como ${conv} a escala 1:${esc}.`,
      dibResumen: (realTxt: string, esc: string, planoTxt: string) =>
        `A escala 1:${esc}, ${realTxt} reales se representan con ${planoTxt} en el papel.`,
      // hallarEscala
      hallResultado: (n: string) => `Escala 1:${n}`,
      hallDetalle: (realTxt: string, planoTxt: string, n: string) =>
        `${planoTxt} en el plano representan ${realTxt} reales, así que la escala es 1:${n} (real ÷ plano).`,
      hallResumen: (n: string) =>
        `La escala del dibujo es 1:${n}: 1 unidad en el papel equivale a ${n} unidades reales.`,
      insightRealText: (planoTxt: string, esc: string, conv: string) =>
        `En una escala de **reducción 1:${esc}**, el objeto real es **${esc} veces más grande** que el dibujo. Por eso ${planoTxt} en el plano se vuelven **${conv}** en la realidad.`,
      insightDibText: (realTxt: string, esc: string, conv: string) =>
        `Para dibujar a escala **1:${esc}** dividís cada medida real por ${esc}. Por eso ${realTxt} reales caben en **${conv}** sobre el papel.`,
      insightHallText: (n: string) =>
        `Una escala **1:${n}** significa que **1 unidad del dibujo = ${n} unidades reales** (misma unidad). Cuanto mayor es el número, más reducido está el plano.`,
    },
    en: {
      needMedida: 'Enter the known measurement (greater than zero).',
      needEscala: 'Enter the scale (the N denominator of 1:N, greater than zero).',
      needPlano: 'To find the scale, enter the measurement on the drawing (greater than zero).',
      badMode: 'Mode not recognized.',
      insightTitle: 'What this scale means',
      realResultado: (v: string, u: string) => `${v} ${u} in real life`,
      realDetalle: (planoTxt: string, esc: string, conv: string) =>
        `${planoTxt} on the drawing at 1:${esc} equal ${conv} in real life.`,
      realResumen: (planoTxt: string, esc: string, realTxt: string) =>
        `At 1:${esc}, ${planoTxt} on the drawing represent ${realTxt} in real life.`,
      dibResultado: (v: string, u: string) => `${v} ${u} on the drawing`,
      dibDetalle: (realTxt: string, esc: string, conv: string) =>
        `${realTxt} in real life are drawn as ${conv} at 1:${esc}.`,
      dibResumen: (realTxt: string, esc: string, planoTxt: string) =>
        `At 1:${esc}, ${realTxt} in real life are drawn as ${planoTxt} on paper.`,
      hallResultado: (n: string) => `Scale 1:${n}`,
      hallDetalle: (realTxt: string, planoTxt: string, n: string) =>
        `${planoTxt} on the drawing represent ${realTxt} in real life, so the scale is 1:${n} (real ÷ drawing).`,
      hallResumen: (n: string) =>
        `The drawing scale is 1:${n}: 1 unit on paper equals ${n} real units.`,
      insightRealText: (planoTxt: string, esc: string, conv: string) =>
        `In a **reduction scale 1:${esc}**, the real object is **${esc} times larger** than the drawing. That is why ${planoTxt} on the plan become **${conv}** in reality.`,
      insightDibText: (realTxt: string, esc: string, conv: string) =>
        `To draw at **1:${esc}** you divide every real measurement by ${esc}. That is why ${realTxt} in real life fit into **${conv}** on paper.`,
      insightHallText: (n: string) =>
        `A scale of **1:${n}** means **1 unit on the drawing = ${n} real units** (same unit). The larger the number, the more reduced the plan is.`,
    },
  } as const)[__lang];

  const modo = String(inputs.modo || '').trim();
  const unidad = NOMBRE_UNIDAD[String(inputs.unidad || 'cm')] ? String(inputs.unidad) : 'cm';

  const medida = Number(inputs.medida);
  if (!isFinite(medida) || medida <= 0) {
    throw new Error(T.needMedida);
  }

  if (modo === 'dibujoAReal') {
    const escala = Number(inputs.escala);
    if (!isFinite(escala) || escala <= 0) {
      throw new Error(T.needEscala);
    }
    const real = medida * escala;
    const escTxt = String(Math.round(escala));
    const planoTxt = `${fmt(medida)} ${unidad}`;
    const conv = conversionAmigable(real, unidad);
    const resultado = T.realResultado(fmt(real), unidad);
    return {
      resultado,
      escalaTexto: `1:${escTxt}`,
      detalle: T.realDetalle(planoTxt, escTxt, conv),
      resumen: T.realResumen(planoTxt, escTxt, conv),
      _insight: {
        title: T.insightTitle,
        text: T.insightRealText(planoTxt, escTxt, conv),
        tone: 'neutral',
        icon: '📐',
      },
    };
  }

  if (modo === 'realADibujo') {
    const escala = Number(inputs.escala);
    if (!isFinite(escala) || escala <= 0) {
      throw new Error(T.needEscala);
    }
    const plano = medida / escala;
    const escTxt = String(Math.round(escala));
    const realTxt = `${fmt(medida)} ${unidad}`;
    const conv = conversionAmigable(plano, unidad);
    const resultado = T.dibResultado(fmt(plano), unidad);
    return {
      resultado,
      escalaTexto: `1:${escTxt}`,
      detalle: T.dibDetalle(realTxt, escTxt, conv),
      resumen: T.dibResumen(realTxt, escTxt, conv),
      _insight: {
        title: T.insightTitle,
        text: T.insightDibText(realTxt, escTxt, conv),
        tone: 'neutral',
        icon: '📐',
      },
    };
  }

  if (modo === 'hallarEscala') {
    const medidaPlano = Number(inputs.medidaPlano);
    if (!isFinite(medidaPlano) || medidaPlano <= 0) {
      throw new Error(T.needPlano);
    }
    const n = medida / medidaPlano;
    const nTxt = String(Math.round(n));
    const realTxt = `${fmt(medida)} ${unidad}`;
    const planoTxt = `${fmt(medidaPlano)} ${unidad}`;
    return {
      resultado: T.hallResultado(nTxt),
      escalaTexto: `1:${nTxt}`,
      detalle: T.hallDetalle(realTxt, planoTxt, nTxt),
      resumen: T.hallResumen(nTxt),
      _insight: {
        title: T.insightTitle,
        text: T.insightHallText(nTxt),
        tone: 'neutral',
        icon: '📐',
      },
    };
  }

  throw new Error(T.badMode);
}
