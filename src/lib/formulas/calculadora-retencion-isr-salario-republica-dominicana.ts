/**
 * Calculadora de retención mensual de ISR sobre salario — Rep. Dominicana 2026.
 *
 * El empleador retiene mensualmente el ISR del asalariado así:
 *   1. Base mensual = salario bruto − AFP(2,87%) − SFS(3,04%)  (TSS deducible).
 *   2. Anualizar: base × 12.
 *   3. Aplicar la escala anual del Art. 296 (isrAnual): exento hasta RD$416.220.
 *   4. Retención mensual = ISR anual ÷ 12.
 *
 * La regalía pascual NO se incluye (exenta de ISR).
 *
 * Data: src/lib/data/republica-dominicana-2026.ts (tss.*, isrAnual, isr.*).
 */
import { REPUBLICA_DOMINICANA_2026, isrAnual, fmtDOP } from '../data/republica-dominicana-2026';

export interface RetencionIsrInputs {
  /** Salario bruto mensual en RD$. */
  salario?: number | string;
}

export interface RetencionIsrOutputs {
  afp: number;
  sfs: number;
  tss: number;
  baseMensual: number;
  baseAnual: number;
  isrAnual: number;
  retencionMensual: number;
  netoDespuesIsr: number;
  tasaEfectiva: number;
  tasaMarginal: number;
  retencionTexto: string;
  baseMensualTexto: string;
  netoTexto: string;
  detalle: string;
  _insight?: any;
  _table?: any;
}

export function calculadoraRetencionIsrSalarioRepublicaDominicana(i: RetencionIsrInputs): RetencionIsrOutputs {
  const d = REPUBLICA_DOMINICANA_2026;
  const salario = Math.max(0, Number(i.salario) || 0);

  // 1. TSS deducible (topeada).
  const afp = Math.min(salario, d.tss.topeAfp) * d.tss.afpEmpleado;
  const sfs = Math.min(salario, d.tss.topeSfs) * d.tss.sfsEmpleado;
  const tss = afp + sfs;

  // 2-3. Base mensual → anual → escala.
  const baseMensual = salario - tss;
  const baseAnual = baseMensual * 12;
  const isrAnualMonto = isrAnual(baseAnual);
  const retencionMensual = isrAnualMonto / 12;
  const netoDespuesIsr = salario - tss - retencionMensual;

  // Tasa marginal: tramo en que cae la base anual.
  let tasaMarginal = 0;
  for (const t of d.isr.tramos) {
    if (baseAnual > t.desde && baseAnual <= t.hasta) { tasaMarginal = t.tasa * 100; break; }
    if (t.hasta === Infinity && baseAnual > t.desde) tasaMarginal = t.tasa * 100;
  }
  const tasaEfectiva = salario > 0 ? (retencionMensual / salario) * 100 : 0;

  const exento = baseAnual <= d.isr.exencionAnual;

  const detalle = exento
    ? `Tu base anualizada (${fmtDOP(baseAnual)}) no supera la exención de ${fmtDOP(d.isr.exencionAnual)}: no te retienen ISR.`
    : `Base mensual ${fmtDOP(baseMensual)} (salario − TSS) × 12 = ${fmtDOP(baseAnual)}. ISR anual ${fmtDOP(isrAnualMonto)} ÷ 12 = ${fmtDOP(retencionMensual)} de retención mensual (tramo marginal ${tasaMarginal}%).`;

  const _insight = {
    title: exento ? 'No te retienen ISR' : `Te retienen ${fmtDOP(retencionMensual)} de ISR al mes`,
    text: exento
      ? `Con un salario de **${fmtDOP(salario)}**, tu base anualizada después de TSS es **${fmtDOP(baseAnual)}**, por debajo de la exención de **${fmtDOP(d.isr.exencionAnual)}** (RD$34.685/mes). **No te retienen ISR.**`
      : `Sobre un salario de **${fmtDOP(salario)}**, primero se restan **${fmtDOP(tss)}** de TSS; la base anualizada queda en **${fmtDOP(baseAnual)}**. Aplicando la escala anual, el ISR es **${fmtDOP(isrAnualMonto)}** al año → **${fmtDOP(retencionMensual)}** retenidos por mes (tasa efectiva **${tasaEfectiva.toFixed(1)}%**, tramo marginal **${tasaMarginal}%**).`,
    tone: (exento ? 'good' : tasaMarginal >= 25 ? 'warn' : 'info') as 'good' | 'warn' | 'info',
    icon: '🇩🇴',
  };

  // Tabla: cómo cambia la retención según el salario bruto (referencia).
  const ejemplos = [25000, 35000, 50000, 75000, 100000];
  const _table = {
    title: 'Retención de ISR según el salario bruto mensual',
    headers: ['Salario bruto', 'TSS (5,91%)', 'Base anual', 'Retención ISR/mes'],
    rows: ejemplos.map((s) => {
      const a = Math.min(s, d.tss.topeAfp) * d.tss.afpEmpleado;
      const f = Math.min(s, d.tss.topeSfs) * d.tss.sfsEmpleado;
      const t = a + f;
      const ba = (s - t) * 12;
      const ret = isrAnual(ba) / 12;
      return [fmtDOP(s), fmtDOP(t), fmtDOP(ba), ret === 0 ? 'Exento' : fmtDOP(ret)];
    }),
    note: `Exención: hasta RD$416.220 anuales (RD$34.685/mes). La base es el salario menos AFP+SFS, anualizada (×12); se aplica la escala del Art. 296 y se divide ÷12. La regalía pascual no se incluye (exenta).`,
  };

  return {
    afp: Math.round(afp * 100) / 100,
    sfs: Math.round(sfs * 100) / 100,
    tss: Math.round(tss * 100) / 100,
    baseMensual: Math.round(baseMensual * 100) / 100,
    baseAnual: Math.round(baseAnual * 100) / 100,
    isrAnual: Math.round(isrAnualMonto * 100) / 100,
    retencionMensual: Math.round(retencionMensual * 100) / 100,
    netoDespuesIsr: Math.round(netoDespuesIsr * 100) / 100,
    tasaEfectiva: Number(tasaEfectiva.toFixed(2)),
    tasaMarginal,
    retencionTexto: fmtDOP(retencionMensual),
    baseMensualTexto: fmtDOP(baseMensual),
    netoTexto: fmtDOP(netoDespuesIsr),
    detalle,
    _insight,
    _table,
  };
}
