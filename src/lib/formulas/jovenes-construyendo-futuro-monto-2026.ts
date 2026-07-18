/**
 * Jóvenes Construyendo el Futuro 2026 — cuánto pagan al mes y cuánto suma el programa.
 * El apoyo mensual 2026 es $9,582.47 (ligado al salario mínimo general, +13% vs 2025)
 * y se paga hasta 12 meses de capacitación. Constantes desde src/lib/data/mexico-2026.ts
 * (JCF_2026), verificadas en programasparaelbienestar.gob.mx.
 */
import { JCF_2026, fmtMXN } from '../data/mexico-2026.ts';

export interface Inputs {
  mesesCapacitacion: number;   // duración total prevista (1 a 12)
  mesesCursados?: number;      // meses ya cobrados (0 a mesesCapacitacion)
}

export interface Outputs { [k: string]: any; detalle: string; _insight?: any; _chart?: any; }

/** '' / null / undefined → default, sin pisar el 0 del usuario. */
function num(v: unknown, d: number): number {
  if (v === '' || v === null || v === undefined) return d;
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

export function compute(i: Inputs): Outputs {
  const meses = Math.min(JCF_2026.duracionMaxMeses, Math.max(1, Math.floor(num(i.mesesCapacitacion, JCF_2026.duracionMaxMeses))));
  const cursados = Math.min(meses, Math.max(0, Math.floor(num(i.mesesCursados, 0))));
  const restantes = meses - cursados;

  const mensual = JCF_2026.apoyoMensual;
  const totalPrograma = round2(mensual * meses);
  const cobrado = round2(mensual * cursados);
  const porCobrar = round2(mensual * restantes);
  const aumentoVs2025 = round2(mensual - JCF_2026.apoyoMensual2025);

  const detalle = `Apoyo 2026: ${fmtMXN(mensual)}/mes × ${meses} meses = ${fmtMXN(totalPrograma)}. Ya cobrado: ${fmtMXN(cobrado)} (${cursados} ${cursados === 1 ? 'mes' : 'meses'}) · por cobrar: ${fmtMXN(porCobrar)} (${restantes} ${restantes === 1 ? 'mes' : 'meses'}).`;

  const _insight = {
    title: 'Tu apoyo de Jóvenes Construyendo el Futuro',
    text: `En 2026 el programa paga **${fmtMXN(mensual)} al mes** (subió ${fmtMXN(aumentoVs2025)} vs 2025 porque va ligado al salario mínimo). Con **${meses} meses** de capacitación juntas **${fmtMXN(totalPrograma)}** en total${restantes > 0 ? `; te quedan **${fmtMXN(porCobrar)}** por cobrar (${restantes} ${restantes === 1 ? 'mes' : 'meses'})` : ''}. Además del dinero, tienes **seguro médico del IMSS** (enfermedades, maternidad y riesgos de trabajo) mientras dura la capacitación.`,
    tone: 'good',
    icon: '🛠️',
  };

  const _chart = {
    type: 'bar' as const,
    labels: ['Ya cobrado', 'Por cobrar', 'Total del programa'],
    values: [Math.round(cobrado), Math.round(porCobrar), Math.round(totalPrograma)],
    prefix: '$',
    ariaLabel: `Cobrado ${fmtMXN(cobrado)}, por cobrar ${fmtMXN(porCobrar)}, total del programa ${fmtMXN(totalPrograma)}.`,
  };

  return {
    apoyoMensual: fmtMXN(mensual),
    totalPrograma: fmtMXN(totalPrograma),
    yaCobrado: fmtMXN(cobrado),
    porCobrar: `${fmtMXN(porCobrar)} (${restantes} ${restantes === 1 ? 'mes' : 'meses'} restantes)`,
    detalle,
    _insight,
    _chart,
  };
}
