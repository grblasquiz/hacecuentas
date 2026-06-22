/**
 * Calculadora de despido e indemnización por despido (IPD) — Uruguay 2026.
 *
 * Régimen (Ley 10.489 y normas concordantes, MTSS):
 *  - Mensual: 1 mensualidad por año de antigüedad. La fracción de año se cuenta
 *    como año entero (basta superar el mes en el año en curso). Tope: 6 meses.
 *  - Jornalero: 25 jornales por año trabajado (si trabajó ≥ 240 jornadas/año).
 *    Tope: 150 jornales (= 6 años). Sin derecho a IPD si trabajó < 100 jornadas.
 *
 * Data: src/lib/data/uruguay-2026.ts (URUGUAY_2026.laboral.despido).
 */
import { URUGUAY_2026, fmtUYU } from '../data/uruguay-2026';

export interface DespidoInputs {
  /** "mensual" (sueldo mensual) | "jornalero" (jornal diario). */
  tipo?: string;
  /** Sueldo mensual nominal (mensual) o valor del jornal (jornalero), en pesos. */
  monto?: number | string;
  /** Años de antigüedad (puede llevar decimales: 2,5 = 2 años y medio). */
  aniosAntiguedad?: number | string;
  /** Solo jornalero: jornadas trabajadas por año (define el derecho y el cómputo). */
  jornadasPorAnio?: number | string;
}

export interface DespidoOutputs {
  indemnizacion: string;
  indemnizacionMonto: number;
  baseCalculo: string;
  aniosComputados: number;
  topeAplicado: string;
  detalle: string;
  _insight?: any;
  _table?: any;
}

export function calculadoraDespidoUruguay(i: DespidoInputs): DespidoOutputs {
  const d = URUGUAY_2026.laboral.despido;
  const tipo = i.tipo === 'jornalero' ? 'jornalero' : 'mensual';
  const monto = Math.max(0, Number(i.monto) || 0);
  const aniosRaw = Math.max(0, Number(i.aniosAntiguedad) || 0);

  if (tipo === 'jornalero') {
    const jornadas = Math.max(0, Math.round(Number(i.jornadasPorAnio) || 0));
    // Años computados: la fracción cuenta como año entero.
    const aniosComputados = Math.max(1, Math.ceil(aniosRaw));

    // Sin derecho a IPD si trabajó menos de 100 jornadas en el año.
    if (jornadas > 0 && jornadas < d.jornalero.minimoJornadasParaDerecho) {
      return {
        indemnizacion: fmtUYU(0),
        indemnizacionMonto: 0,
        baseCalculo: `${fmtUYU(monto)} por jornal`,
        aniosComputados,
        topeAplicado: 'Sin derecho',
        detalle: `Con ${jornadas} jornadas en el año (menos de ${d.jornalero.minimoJornadasParaDerecho}) no se genera derecho a indemnización por despido.`,
        _insight: {
          title: 'Sin derecho a indemnización',
          text: `Un jornalero que trabajó **${jornadas} jornadas** en el año (menos de **${d.jornalero.minimoJornadasParaDerecho}**) **no genera derecho** a indemnización por despido. Recién con 100 jornadas o más empieza a computar.`,
          tone: 'warn' as const,
          icon: '⚠️',
        },
      };
    }

    // 25 jornales por año si trabajó ≥ 240 jornadas; si trabajó entre 100 y 239,
    // se prorratea proporcionalmente (jornales = 25 × jornadas/240) por año.
    const factorPlena = jornadas === 0 || jornadas >= 240;
    const jornalesPorAnio = factorPlena
      ? d.jornalero.jornalesPorAnio
      : (d.jornalero.jornalesPorAnio * jornadas) / 240;

    const jornalesBruto = jornalesPorAnio * aniosComputados;
    const jornalesFinal = Math.min(jornalesBruto, d.jornalero.topeJornales);
    const topeAplica = jornalesBruto > d.jornalero.topeJornales;
    const indem = jornalesFinal * monto;

    return {
      indemnizacion: fmtUYU(indem),
      indemnizacionMonto: Math.round(indem),
      baseCalculo: `${fmtUYU(monto)} por jornal`,
      aniosComputados,
      topeAplicado: topeAplica ? `Sí (tope ${d.jornalero.topeJornales} jornales)` : 'No',
      detalle: `${jornalesFinal.toFixed(jornalesFinal % 1 === 0 ? 0 : 1)} jornales × ${fmtUYU(monto)} = ${fmtUYU(indem)} (${aniosComputados} año/s × ${jornalesPorAnio.toFixed(jornalesPorAnio % 1 === 0 ? 0 : 1)} jornales).`,
      _insight: {
        title: 'Indemnización del jornalero',
        text: `Un jornalero cobra **25 jornales por año** trabajado (si hizo 240 jornadas o más). Con **${aniosComputados} año/s** te corresponden **${jornalesFinal.toFixed(jornalesFinal % 1 === 0 ? 0 : 1)} jornales** = **${fmtUYU(indem)}**${topeAplica ? `, ya con el tope de ${d.jornalero.topeJornales} jornales (6 años) aplicado` : ''}.`,
        tone: 'info' as const,
        icon: '📅',
      },
      _table: {
        title: 'Indemnización del jornalero según antigüedad (jornal de ' + fmtUYU(monto) + ')',
        headers: ['Años', 'Jornales', 'Indemnización'],
        rows: [1, 2, 3, 4, 5, 6].map((a) => {
          const jn = Math.min(jornalesPorAnio * a, d.jornalero.topeJornales);
          return [
            String(a) + (a >= 6 ? ' o más' : ''),
            jn.toFixed(jn % 1 === 0 ? 0 : 1),
            fmtUYU(jn * monto),
          ];
        }),
        note: 'El tope es de 150 jornales (6 años). Requiere haber trabajado al menos 240 jornadas/año para computar 25 jornales completos; con menos de 100 jornadas no hay derecho.',
      },
    };
  }

  // ── Mensual ──────────────────────────────────────────────────────────────
  // 1 mensualidad por año; la fracción cuenta como año entero. Tope 6 meses.
  const aniosComputados = Math.max(1, Math.ceil(aniosRaw));
  const mesesBruto = aniosComputados * d.mensual.mesesPorAnio;
  const mesesFinal = Math.min(mesesBruto, d.mensual.topeMeses);
  const topeAplica = mesesBruto > d.mensual.topeMeses;
  const indem = mesesFinal * monto;

  return {
    indemnizacion: fmtUYU(indem),
    indemnizacionMonto: Math.round(indem),
    baseCalculo: `${fmtUYU(monto)} mensual`,
    aniosComputados,
    topeAplicado: topeAplica ? `Sí (tope ${d.mensual.topeMeses} meses)` : 'No',
    detalle: `${mesesFinal} mensualidad/es × ${fmtUYU(monto)} = ${fmtUYU(indem)}.`,
    _insight: {
      title: 'Indemnización mensual',
      text: `Por despido te corresponde **1 sueldo por año** trabajado. Con **${aniosComputados} año/s** y un sueldo de **${fmtUYU(monto)}** la indemnización es **${fmtUYU(indem)}** (${mesesFinal} mensualidad/es)${topeAplica ? `. Llegaste al **tope de ${d.mensual.topeMeses} meses**: aunque tengas más antigüedad, no aumenta` : ''}.`,
      tone: 'info' as const,
      icon: '💼',
    },
    _table: {
      title: 'Indemnización mensual según antigüedad (sueldo de ' + fmtUYU(monto) + ')',
      headers: ['Años', 'Mensualidades', 'Indemnización'],
      rows: [1, 2, 3, 4, 5, 6, 7].map((a) => {
        const m = Math.min(a, d.mensual.topeMeses);
        return [
          String(a) + (a >= 7 ? ' o más' : ''),
          String(m),
          fmtUYU(m * monto),
        ];
      }),
      note: 'El tope es de 6 mensualidades: a partir del 7º año la indemnización no sigue creciendo. La fracción de año cuenta como año entero.',
    },
  };
}
