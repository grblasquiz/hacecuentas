/** Décimo cuarto sueldo (bono escolar, Ecuador) — 1 SBU, proporcional a meses trabajados. */
import { ECUADOR_2026, fmtUSDec } from '../data/ecuador-2026.ts';

export interface Inputs {
  mesesTrabajados: number;   // meses trabajados en el periodo (0-12)
  jornada?: string;          // 'completa' o 'parcial'
  horasSemanales?: number;   // si parcial: horas/semana (proporcional sobre 40)
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const sbu = ECUADOR_2026.decimoCuarto; // 1 SBU = 482
  const meses = Math.max(0, Math.min(12, Number(i.mesesTrabajados) || 0));
  const jornada = String(i.jornada || 'completa');
  if (meses <= 0) throw new Error('Ingresá los meses trabajados');

  // Proporcional por meses trabajados
  let decimoCuarto = (sbu * meses) / 12;

  // Si es jornada parcial, proporcional a las horas (sobre jornada completa de 40h)
  let factorJornada = 1;
  if (jornada === 'parcial') {
    const horas = Math.max(0, Math.min(40, Number(i.horasSemanales) || 0));
    factorJornada = horas > 0 ? horas / 40 : 0;
    decimoCuarto = decimoCuarto * factorJornada;
  }

  const completo = meses === 12 && factorJornada === 1;

  const _insight = {
    title: 'Tu décimo cuarto sueldo',
    text: completo
      ? `Por el **año completo** te corresponde **${fmtUSDec(sbu)}** (1 Salario Básico Unificado 2026). Es el **bono escolar**, está **exento de impuesto a la renta** y se paga en **marzo** (Sierra y Oriente) o **agosto** (Costa e Insular).`
      : `Por **${meses} meses** trabajados${jornada === 'parcial' ? ` a jornada parcial (${Math.round(factorJornada * 40)} h/sem)` : ''}, tu décimo cuarto sueldo proporcional es **${fmtUSDec(decimoCuarto)}**. El bono escolar completo es 1 SBU (**${fmtUSDec(sbu)}**) y está exento de impuesto.`,
    tone: 'good',
    icon: '🎒',
  };
  const _chart = {
    type: 'gauge',
    value: Math.round(decimoCuarto * 100) / 100,
    min: 0,
    max: sbu,
    label: fmtUSDec(decimoCuarto),
    ariaLabel: `Décimo cuarto sueldo ${fmtUSDec(decimoCuarto)} sobre un SBU de ${fmtUSDec(sbu)}.`,
  };

  return {
    decimoCuarto: fmtUSDec(decimoCuarto),
    sbuReferencia: fmtUSDec(sbu),
    detalle: `${meses} meses · ${jornada === 'parcial' ? `jornada parcial (${Math.round(factorJornada * 40)} h/sem)` : 'jornada completa'} · 1 SBU = ${fmtUSDec(sbu)}.`,
    _insight,
    _chart,
  };
}
