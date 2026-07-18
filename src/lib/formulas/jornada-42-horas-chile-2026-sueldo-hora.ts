/** Jornada de 42 horas en Chile (Ley 21.561, 2ª etapa desde el 26-abr-2026).
 *  Valor hora ordinaria según método DT: (sueldo ÷ 30 × 28) ÷ (4 × jornada semanal).
 *  Con 42 h: sueldo × 28 ÷ 5.040 (= sueldo ÷ 180); hora extra al 50% = sueldo × 0,0083333.
 *  Con 44 h (hasta el 25-abr-2026): sueldo × 28 ÷ 5.280; hora extra = sueldo × 0,0079545.
 *  Fuente: DT — https://www.dt.gob.cl/portal/1628/w3-article-95182.html */
import { fmtCLP } from '../data/chile-2026.ts';

export interface Inputs {
  sueldoMensual: number;  // sueldo base mensual (CLP)
  horasExtrasMes: number; // horas extraordinarias en el mes
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

function horaOrdinaria(sueldo: number, jornada: number): number {
  return (sueldo / 30) * 28 / (4 * jornada);
}

export function compute(i: Inputs): Outputs {
  const sueldo = Number(i.sueldoMensual) || 0;
  const hExtras = Math.max(0, Number(i.horasExtrasMes) || 0);

  if (sueldo <= 0) throw new Error('Ingresá tu sueldo base mensual');

  const hora42 = horaOrdinaria(sueldo, 42);
  const hora44 = horaOrdinaria(sueldo, 44);
  const extra42 = hora42 * 1.5;
  const extra44 = hora44 * 1.5;
  const aumentoPct = (hora42 / hora44 - 1) * 100; // 4,76%

  const pagoExtras = extra42 * hExtras;
  const sueldoTotal = sueldo + pagoExtras;

  const _insight = {
    title: 'Tu hora vale más con la jornada de 42',
    text: `Con la jornada de **42 horas** (vigente desde el 26 de abril de 2026), tu hora ordinaria vale **${fmtCLP(hora42)}** — un **${aumentoPct.toLocaleString('es-CL', { maximumFractionDigits: 2 })}% más** que con la jornada de 44 h (${fmtCLP(hora44)}), porque el mismo sueldo se divide en menos horas. Tu hora extra al 50% pasa de ${fmtCLP(extra44)} a **${fmtCLP(extra42)}**.${hExtras > 0 ? ` Con ${hExtras.toLocaleString('es-CL')} horas extra, sumás **${fmtCLP(pagoExtras)}** y tu sueldo del mes queda en **${fmtCLP(sueldoTotal)}**.` : ''}`,
    tone: 'positive',
    icon: '⏱️',
  };
  const _chart = {
    type: 'bar',
    segments: [
      { label: 'Hora extra con 44 h', value: Math.round(extra44) },
      { label: 'Hora extra con 42 h', value: Math.round(extra42) },
    ],
    ariaLabel: `Valor de la hora extraordinaria: ${fmtCLP(extra44)} con jornada de 44 horas y ${fmtCLP(extra42)} con jornada de 42 horas.`,
  };

  return {
    valorHora42: fmtCLP(hora42),
    valorHora44: fmtCLP(hora44),
    valorHoraExtra42: `${fmtCLP(extra42)} (recargo 50%)`,
    aumentoPorHora: `+${aumentoPct.toLocaleString('es-CL', { maximumFractionDigits: 2 })}% por el cambio 44 → 42 h`,
    pagoHorasExtras: hExtras > 0 ? `${fmtCLP(pagoExtras)} por ${hExtras.toLocaleString('es-CL')} horas` : '$0',
    sueldoConExtras: fmtCLP(sueldoTotal),
    detalle: `Método DT: valor hora = (sueldo ÷ 30 × 28) ÷ (4 × jornada). Con 42 h: (${fmtCLP(sueldo)} ÷ 30 × 28) ÷ 168 = ${fmtCLP(hora42)}; hora extra = × 1,5 = ${fmtCLP(extra42)} (equivale a sueldo × 0,0083333). Con 44 h el divisor era 176 → ${fmtCLP(hora44)} y extra ${fmtCLP(extra44)}. La reducción de jornada NO puede rebajar tu sueldo (Ley 21.561): trabajás menos horas por el mismo sueldo mensual y cada hora vale más. Próxima etapa: 40 horas en abril de 2028.`,
    _insight,
    _chart,
  };
}
