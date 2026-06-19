/**
 * Calculadora de ISR sobre intereses bancarios e inversiones — México 2026
 *
 * Retención de ISR sobre intereses pagados por el sistema financiero (bancos, casas de bolsa,
 * SOFIPOs): LISR Arts. 54 y 135. El retenedor aplica una tasa ANUAL sobre el CAPITAL que da
 * origen al interés (no sobre el interés), prorrateada por los días de la inversión.
 *
 * Tasa de retención 2026 = 0.90% anual sobre el capital (Art. 24 LIF 2026, DOF 07-nov-2025;
 * subió desde 0.50% vigente en 2024-2025). VERIFICADO 2026-06-19 contra múltiples firmas
 * (IDC, EY, Russell Bedford, DFK, siemprealdia) y el CEFP (nota 147/2025).
 *
 * La retención es un ANTICIPO (pago provisional), no el impuesto definitivo. El impuesto
 * definitivo se determina en la declaración anual sobre el INTERÉS REAL = interés nominal −
 * ajuste por inflación (INPC × saldo). Esta calc estima el interés nominal, la retención
 * provisional y el interés neto que recibe el ahorrador; además aproxima el interés real
 * para contextualizar la anual.
 */

import { fmtMXN } from '../data/mexico-2026.ts';

/** Tasa de retención anual de ISR sobre el capital que genera intereses (Art. 24 LIF 2026). */
export const TASA_RETENCION_INTERESES_2026 = 0.009; // 0.90% (era 0.50% en 2025)

export interface Inputs {
  capital: number;          // capital invertido (MXN)
  tasaInteresAnual: number; // tasa de interés anual del instrumento (% nominal)
  plazoDias: number;        // plazo de la inversión en días
  inflacionAnual?: number;  // inflación estimada del periodo (% anual, INPC) — para el interés real
}

export interface Outputs {
  interesNominal: number;   // interés ganado en el plazo (antes de impuesto)
  isrRetenido: number;      // ISR retenido por el banco (capital × 0.90% × días/365)
  interesNeto: number;      // interés que te queda tras la retención
  tasaEfectivaSobreInteres: number; // % que la retención representa del interés ganado
  interesReal: number;      // interés nominal − ajuste por inflación del periodo
  isrSobreInteresReal: number;      // referencia: si la retención fuera ISR definitivo sobre el real
  montoFinal: number;       // capital + interés neto al vencimiento
  mensaje: string;
  _insight?: any;
  _chart?: any;
}

const num = (v: unknown): number => {
  const n = typeof v === 'string' ? parseFloat(v.replace(/[^0-9.\-]/g, '')) : Number(v);
  return Number.isFinite(n) ? n : 0;
};

export function isrInteresesBancariosInversionMexico2026(i: Inputs): Outputs {
  const capital = num(i.capital);
  const tasaAnual = num(i.tasaInteresAnual) / 100;
  const plazoDias = num(i.plazoDias);

  if (capital <= 0) throw new Error('Ingresá el capital invertido');
  if (tasaAnual <= 0) throw new Error('Ingresá la tasa de interés anual del instrumento');
  if (plazoDias <= 0) throw new Error('Ingresá el plazo en días');

  // Inflación del periodo: default = inflación objetivo Banxico 3% anual si no la dan.
  const inflacionAnual = i.inflacionAnual != null ? num(i.inflacionAnual) / 100 : 0.03;

  const fraccionAnio = plazoDias / 365;

  // Interés nominal del periodo (interés simple, base 365 — convención del mercado de dinero MX).
  const interesNominal = capital * tasaAnual * fraccionAnio;

  // Retención de ISR: tasa anual 0.90% sobre el CAPITAL, prorrateada por días.
  const isrRetenido = capital * TASA_RETENCION_INTERESES_2026 * fraccionAnio;

  const interesNeto = interesNominal - isrRetenido;

  const tasaEfectivaSobreInteres = interesNominal > 0 ? (isrRetenido / interesNominal) * 100 : 0;

  // Interés real (para la anual): interés nominal − ajuste por inflación del periodo sobre el capital.
  const ajusteInflacion = capital * inflacionAnual * fraccionAnio;
  const interesReal = interesNominal - ajusteInflacion;

  // Referencia: ISR definitivo "puro" sobre el interés real (la tasa marginal real depende de la
  // suma con los demás ingresos del año; aquí mostramos solo cuánto del retenido lo respalda).
  const isrSobreInteresReal = Math.max(0, interesReal); // base gravable de la anual

  const montoFinal = capital + interesNeto;

  // ── Formato y mensajes ──
  const tasaPct = (tasaAnual * 100).toLocaleString('es-MX', { maximumFractionDigits: 2 });
  const haySaldoFavor = isrRetenido > Math.max(0, interesReal) * 0.10; // heurística: retenido > ISR plausible del real

  const _insight = {
    title: interesReal <= 0 ? 'El banco te retiene aunque pierdas contra la inflación' : 'Retención provisional sobre tu capital',
    text:
      `Sobre **${fmtMXN(capital)}** invertidos a una tasa del **${tasaPct}%** durante **${Math.round(plazoDias)} días**, ` +
      `ganás **${fmtMXN(interesNominal)}** de interés nominal. El banco te retiene **${fmtMXN(isrRetenido)}** de ISR ` +
      `(0.90% anual sobre el capital, prorrateado), así que cobrás **${fmtMXN(interesNeto)}** netos. ` +
      (interesReal <= 0
        ? `Ojo: con una inflación estimada del ${(inflacionAnual * 100).toFixed(1)}%, tu interés **real** es negativo (**${fmtMXN(interesReal)}**): no ganaste poder adquisitivo, pero la retención igual se aplica sobre el capital. En la anual ese interés real negativo puede generarte saldo a favor.`
        : `La retención es un anticipo: en la declaración anual el ISR se recalcula sobre el interés **real** (**${fmtMXN(interesReal)}**, ya descontada la inflación), y la retención del año se acredita contra ese impuesto.`),
    tone: interesReal <= 0 ? 'warn' : 'neutral',
    icon: '🏦',
  };

  const out: Outputs = {
    interesNominal: round2(interesNominal),
    isrRetenido: round2(isrRetenido),
    interesNeto: round2(interesNeto),
    tasaEfectivaSobreInteres: Math.round(tasaEfectivaSobreInteres * 10) / 10,
    interesReal: round2(interesReal),
    isrSobreInteresReal: round2(isrSobreInteresReal),
    montoFinal: round2(montoFinal),
    mensaje:
      `De ${fmtMXN(interesNominal)} de interés, el banco retiene ${fmtMXN(isrRetenido)} de ISR (0.90% sobre el capital): ` +
      `te quedan ${fmtMXN(interesNeto)} netos${haySaldoFavor ? ' — posible saldo a favor en la anual' : ''}.`,
    _insight,
  };

  // Donut: el interés nominal se reparte entre lo que te queda (neto) y lo retenido.
  if (interesNominal > 0 && isrRetenido > 0) {
    out._chart = {
      type: 'doughnut',
      slices: [
        { label: 'Interés neto', value: round2(Math.max(0, interesNeto)) },
        { label: 'ISR retenido', value: round2(isrRetenido) },
      ],
      prefix: '$',
      centerValue: fmtMXN(interesNominal),
      centerLabel: 'Interés nominal',
      ariaLabel: 'Reparto del interés nominal entre el interés neto y el ISR retenido por el banco',
    };
  }

  return out;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
