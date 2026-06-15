/**
 * Arriendo máximo legal — Ecuador (Ley de Inquilinato, Art. 17).
 * La pensión mensual de arrendamiento NO puede exceder la doceava parte del 10%
 * del avalúo comercial con que el inmueble conste en el Catastro Municipal.
 *   → tope mensual = avalúo × 10% ÷ 12 = avalúo × 0,10 / 12.
 * Si se arrienda solo una parte del predio, el tope se fija proporcionalmente (Art. 17).
 * Ecuador está dolarizado → todos los montos en USD ("$"), sin conversión.
 * Fuente: Ley de Inquilinato, Codificación 1, R.O. 196 (01-nov-2000), Art. 17.
 *   https://www.gob.ec/sites/default/files/regulations/2025-10/LEY_DE_INQUILINATO.pdf
 */
import { fmtUSDec } from '../data/ecuador-2026.ts';

// fuente: Ley de Inquilinato, Art. 17 (R.O. 196, 2000) — doceava parte del 10% del avalúo.
const PORCENTAJE_LEGAL = 0.10;  // 10% anual del avalúo comercial municipal
const MESES = 12;               // doceava parte (canon mensual)

export interface Inputs {
  /** Avalúo comercial del predio según el Catastro Municipal (USD). */
  avaluoComercial: number;
  /** % del predio efectivamente arrendado (1–100). Opcional; default 100 (todo el predio). */
  porcentajeArrendado?: number;
  /** Canon mensual actual que se cobra/paga (USD). Opcional, para comparar con el tope. */
  arriendoActual?: number;
}

export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const avaluo = Number(i.avaluoComercial) || 0;
  if (avaluo <= 0) throw new Error('Ingresá el avalúo comercial del predio (Catastro Municipal)');

  // Porcentaje arrendado: '' / undefined / null → 100% (todo el predio).
  let pct = (i.porcentajeArrendado === undefined || i.porcentajeArrendado === null || (i.porcentajeArrendado as any) === '')
    ? 100
    : Number(i.porcentajeArrendado);
  if (!Number.isFinite(pct) || pct <= 0) pct = 100;
  if (pct > 100) pct = 100;
  const fraccion = pct / 100;

  // Tope legal sobre el predio completo y sobre la parte arrendada.
  const topeAnual = avaluo * PORCENTAJE_LEGAL;          // 10% del avalúo (referencia anual)
  const topeMensualPredio = topeAnual / MESES;          // doceava parte → canon mensual del predio
  const arriendoMaximoMensual = topeMensualPredio * fraccion;  // proporcional a la parte arrendada
  const arriendoMaximoAnual = arriendoMaximoMensual * MESES;

  // Comparación con el arriendo actual, si se ingresó.
  const actualRaw = (i.arriendoActual === undefined || i.arriendoActual === null || (i.arriendoActual as any) === '')
    ? null
    : Number(i.arriendoActual);
  const actual = (actualRaw !== null && Number.isFinite(actualRaw) && actualRaw > 0) ? actualRaw : null;

  let comparacion = '';
  let estado: 'legal' | 'excesivo' | 'sin-dato' = 'sin-dato';
  let excesoMensual = 0;
  if (actual !== null) {
    excesoMensual = actual - arriendoMaximoMensual;
    if (excesoMensual > 0.005) {
      estado = 'excesivo';
      comparacion = `El canon actual de ${fmtUSDec(actual)} SUPERA el tope legal en ${fmtUSDec(excesoMensual)}/mes (${fmtUSDec(excesoMensual * MESES)}/año). Excede el máximo del Art. 17.`;
    } else {
      estado = 'legal';
      const margen = arriendoMaximoMensual - actual;
      comparacion = `El canon actual de ${fmtUSDec(actual)} está dentro del tope legal (margen de ${fmtUSDec(margen)}/mes hasta el máximo).`;
    }
  }

  const _insight = {
    title: 'Tope legal del arriendo',
    text: actual === null
      ? `Para un predio con avalúo comercial de **${fmtUSDec(avaluo)}**${pct < 100 ? ` (arrendás el ${pct}%)` : ''}, el arriendo máximo legal es **${fmtUSDec(arriendoMaximoMensual)} al mes** (doceava parte del 10% del avalúo, Art. 17 de la Ley de Inquilinato).`
      : (estado === 'excesivo'
          ? `El canon de **${fmtUSDec(actual)}** supera el máximo legal de **${fmtUSDec(arriendoMaximoMensual)}/mes** en **${fmtUSDec(excesoMensual)}**. La Ley de Inquilinato sanciona el cobro excesivo (Art. 19).`
          : `El canon de **${fmtUSDec(actual)}** está dentro del tope legal de **${fmtUSDec(arriendoMaximoMensual)}/mes** del Art. 17.`),
    tone: estado === 'excesivo' ? 'warn' : 'neutral',
    icon: '🔑',
  };

  const _chart = actual === null
    ? {
        type: 'bar',
        segments: [
          { label: 'Arriendo máximo mensual', value: Math.round(arriendoMaximoMensual * 100) / 100 },
          { label: '10% del avalúo (anual)', value: Math.round(topeAnual * 100) / 100 },
        ],
        ariaLabel: `Arriendo máximo mensual ${fmtUSDec(arriendoMaximoMensual)} y 10% anual del avalúo ${fmtUSDec(topeAnual)}.`,
      }
    : {
        type: 'bar',
        segments: [
          { label: 'Canon actual', value: Math.round(actual * 100) / 100 },
          { label: 'Tope legal mensual', value: Math.round(arriendoMaximoMensual * 100) / 100 },
        ],
        ariaLabel: `Canon actual ${fmtUSDec(actual)} versus tope legal ${fmtUSDec(arriendoMaximoMensual)}.`,
      };

  return {
    arriendoMaximoMensual: fmtUSDec(arriendoMaximoMensual),
    arriendoMaximoAnual: fmtUSDec(arriendoMaximoAnual),
    topeAnual10pct: fmtUSDec(topeAnual),
    porcentajeArrendado: `${pct}%`,
    comparacion: comparacion || 'Ingresá el arriendo actual para comparar con el tope legal.',
    estado,
    detalle: `Avalúo ${fmtUSDec(avaluo)} × 10% = ${fmtUSDec(topeAnual)} anual ÷ 12 = ${fmtUSDec(topeMensualPredio)}/mes${pct < 100 ? ` × ${pct}% = ${fmtUSDec(arriendoMaximoMensual)}/mes` : ''} (Art. 17, Ley de Inquilinato).`,
    _insight,
    _chart,
  };
}
