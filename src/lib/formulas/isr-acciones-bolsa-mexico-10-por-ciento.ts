/**
 * ISR por ganancia en venta de acciones en bolsa (México) — LISR Art. 129.
 * Tasa del 10% DEFINITIVO sobre la ganancia neta del ejercicio (BMV/BIVA/SIC,
 * vía casas de bolsa o apps como GBM+, Kuspit, Bursanet…).
 * Las pérdidas del régimen solo se compensan contra ganancias del mismo régimen
 * y son amortizables hasta 10 ejercicios siguientes.
 * Constantes desde src/lib/data/mexico-2026.ts (bolsaIsrGanancia + tarifa anual Art. 152 para comparar).
 */
import { MEXICO_2026, isrAnual2026, fmtMXN } from '../data/mexico-2026.ts';

export interface Inputs {
  ganancias: number;        // suma de ganancias por ventas con utilidad en el ejercicio
  perdidas?: number;        // suma de pérdidas por ventas con minusvalía del ejercicio
  perdidasPrevias?: number; // pérdidas pendientes de amortizar de ejercicios anteriores (hasta 10)
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

/** Guard de defaults: '' / null / undefined → default, sin pisar el 0 del usuario. */
function num(v: unknown, d: number): number {
  if (v === '' || v === null || v === undefined) return d;
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
}

const r2 = (n: number) => Math.round(n * 100) / 100;

export function compute(i: Inputs): Outputs {
  const tasa = MEXICO_2026.bolsaIsrGanancia; // 0.10 (LISR Art. 129)

  const ganancias = num(i.ganancias, 0);
  const perdidas = Math.max(0, num(i.perdidas, 0));
  const perdidasPrevias = Math.max(0, num(i.perdidasPrevias, 0));
  if (ganancias < 0) throw new Error('Las ganancias no pueden ser negativas: captura las minusvalías en el campo de pérdidas');
  if (ganancias <= 0 && perdidas <= 0) throw new Error('Captura tus ganancias (y pérdidas) por ventas de acciones del ejercicio');

  const gananciaNetaEjercicio = r2(ganancias - perdidas);

  // ── Caso pérdida neta del ejercicio: no hay ISR, la pérdida se amortiza hasta 10 ejercicios ──
  if (gananciaNetaEjercicio <= 0) {
    const perdidaEjercicio = r2(-gananciaNetaEjercicio);
    const _insight = {
      title: 'Año con pérdida: no pagas ISR bursátil',
      text: `Tu ejercicio cierra con una **pérdida neta de ${fmtMXN(perdidaEjercicio)}** (${fmtMXN(ganancias)} de ganancias − ${fmtMXN(perdidas)} de pérdidas), así que el ISR del 10% es **$0**. Esa pérdida la puedes **compensar contra ganancias bursátiles de los próximos 10 ejercicios** (LISR Art. 129) — pero solo contra ganancias de este mismo régimen, no contra tu sueldo ni otros ingresos. Declárala en tu anual para no perder el derecho.${perdidasPrevias > 0 ? ` Tus ${fmtMXN(perdidasPrevias)} de pérdidas previas siguen pendientes, cada una con su propia ventana de 10 años.` : ''}`,
      tone: 'warn',
      icon: '📉',
    };
    return {
      isr: `${fmtMXN(0)} — sin impuesto este ejercicio`,
      gananciaNeta: `Pérdida neta del ejercicio: ${fmtMXN(perdidaEjercicio)}`,
      perdidaAmortizable: `${fmtMXN(r2(perdidaEjercicio + perdidasPrevias))} compensables contra ganancias bursátiles futuras (hasta 10 ejercicios cada una)`,
      comparativa: 'Sin base gravable: ni el 10% bursátil ni la tarifa general aplican este año',
      detalle: `Ganancias ${fmtMXN(ganancias)} − pérdidas ${fmtMXN(perdidas)} = ${fmtMXN(gananciaNetaEjercicio)}. La pérdida se actualiza por inflación y se declara en la anual (abril).`,
      _insight,
    };
  }

  // ── Caso ganancia: compensar pérdidas previas y aplicar el 10% definitivo ──
  const compensadas = r2(Math.min(perdidasPrevias, gananciaNetaEjercicio));
  const base = r2(gananciaNetaEjercicio - compensadas);
  const remanentePrevias = r2(perdidasPrevias - compensadas);
  const isr = r2(base * tasa);
  const netoDespuesIsr = r2(gananciaNetaEjercicio - isr);

  // Referencia: el mismo monto con la tarifa general anual (Art. 152), como tributan cripto o intereses.
  const isrTarifaGeneral = isrAnual2026(base);
  const ahorroVsGeneral = r2(isrTarifaGeneral - isr);

  const _insight = {
    title: 'Tu ISR bursátil del ejercicio',
    text: `Sobre una base de **${fmtMXN(base)}**${compensadas > 0 ? ` (ganancia neta de ${fmtMXN(gananciaNetaEjercicio)} menos ${fmtMXN(compensadas)} de pérdidas previas compensadas)` : ''} pagas **${fmtMXN(isr)}** de ISR: el **10% definitivo** del Art. 129 LISR. ${ahorroVsGeneral > 0
      ? `Si esa misma ganancia tributara con la tarifa general (como cripto o intereses, suponiendo que fuera tu único ingreso), el ISR rondaría **${fmtMXN(isrTarifaGeneral)}**: el régimen bursátil te ahorra ~${fmtMXN(ahorroVsGeneral)}.`
      : `Ojo: con bases chicas, la tarifa general daría menos (~${fmtMXN(isrTarifaGeneral)}), pero el 10% bursátil es **definitivo y obligatorio** — no puedes optar por la tarifa general.`} La casa de bolsa **no retiene**: el impuesto lo enteras tú en la declaración anual de abril, con la constancia fiscal que te emite tu intermediario.`,
    tone: ahorroVsGeneral > 0 ? 'success' : 'warn',
    icon: '📈',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Ganancia después de ISR', value: Math.round(netoDespuesIsr) },
      { label: 'ISR (10%)', value: Math.round(isr) },
    ].filter((s) => s.value > 0),
    prefix: '$',
    centerValue: fmtMXN(isr),
    centerLabel: 'ISR a pagar',
    ariaLabel: `ISR bursátil de ${fmtMXN(isr)} (10% sobre base de ${fmtMXN(base)}); te quedan ${fmtMXN(netoDespuesIsr)} de la ganancia neta del ejercicio.`,
  };

  return {
    isr: `${fmtMXN(isr)} (10% definitivo, se declara en la anual)`,
    gananciaNeta: `${fmtMXN(gananciaNetaEjercicio)} del ejercicio${compensadas > 0 ? ` → base gravable ${fmtMXN(base)} tras compensar ${fmtMXN(compensadas)} de pérdidas previas` : ''}`,
    perdidaAmortizable: remanentePrevias > 0
      ? `${fmtMXN(remanentePrevias)} de pérdidas previas siguen pendientes para ejercicios futuros`
      : (compensadas > 0 ? 'Agotaste tus pérdidas previas en esta compensación' : 'Sin pérdidas pendientes de ejercicios anteriores'),
    comparativa: `Con tarifa general (Art. 152, como cripto/intereses): ~${fmtMXN(isrTarifaGeneral)} → ${ahorroVsGeneral > 0 ? `el 10% bursátil te ahorra ${fmtMXN(ahorroVsGeneral)}` : `la general daría ${fmtMXN(r2(-ahorroVsGeneral))} menos, pero el 10% es obligatorio en bolsa`}`,
    detalle: `Ganancias ${fmtMXN(ganancias)} − pérdidas del ejercicio ${fmtMXN(perdidas)} = ${fmtMXN(gananciaNetaEjercicio)}; base ${fmtMXN(base)} × 10% = ${fmtMXN(isr)}. Aplica a acciones operadas en BMV/BIVA/SIC vía intermediario; los dividendos llevan su propia retención del 10% aparte.`,
    _insight,
    _chart,
  };
}
