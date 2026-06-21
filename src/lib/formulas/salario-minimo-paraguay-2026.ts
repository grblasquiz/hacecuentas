/**
 * Salario mínimo PARAGUAY 2026 — monto vigente, jornal, hora y proporcional.
 *
 * SMVM mensual Gs. 3.044.000 (Decreto N° 6225, +5%, vigente 1-jul-2026).
 * Jornal mínimo Gs. 117.077. Hora ordinaria = salario mensual / 240 (30 días × 8 h).
 * Trabajo nocturno (20:00–06:00): recargo +30% sobre el salario ordinario (art. 198).
 * Proporcional por días: jornal × días trabajados.
 *
 * Fuente: MTESS — Decreto N° 6225/2026; Código del Trabajo (Ley 213/93).
 */
import { PARAGUAY_2026, fmtPYG } from '../data/paraguay-2026';

export interface Inputs {
  jornada?: 'diurna' | 'nocturna'; // tipo de jornada (afecta el recargo nocturno)
  dias?: number;                   // días trabajados en el mes (proporcional)
}

export interface Outputs {
  [k: string]: any;
  _insight?: any;
  _table?: any;
}

export function salarioMinimoParaguay2026(i: Inputs): Outputs {
  const p = PARAGUAY_2026;
  const jornada = i.jornada === 'nocturna' ? 'nocturna' : 'diurna';
  const dias = Math.min(31, Math.max(0, Number(i.dias ?? p.diasMes) || p.diasMes));

  const smvmMes = p.salarioMinimo;          // 3.044.000
  const jornalMin = smvmMes / p.diasMes;    // salario mínimo diario base (mensual/30)
  const horaMin = smvmMes / p.horasMesEstandar; // 240
  const quincena = smvmMes / 2;

  const recargoNocturno = p.laboral.recargoNocturno; // 0,30
  const factorNocturno = jornada === 'nocturna' ? 1 + recargoNocturno : 1;

  // Proporcional según jornada y días trabajados.
  const jornalAplicado = jornalMin * factorNocturno;
  const horaAplicada = horaMin * factorNocturno;
  const proporcional = jornalAplicado * dias;

  const _insight = {
    type: 'highlight',
    icon: '💵',
    text:
      `El salario mínimo en Paraguay (vigente desde el 1-jul-2026) es **${fmtPYG(smvmMes)}** al mes, ` +
      `equivalente a **${fmtPYG(jornalMin)}** por día y **${fmtPYG(horaMin)}** por hora. ` +
      (jornada === 'nocturna'
        ? `En jornada **nocturna** se aplica un recargo del 30%: el día sube a **${fmtPYG(jornalAplicado)}**.`
        : `El jornal mínimo legal a destajo es **${fmtPYG(p.jornalMinimo)}**.`),
  };

  const _table = {
    title: 'Salario mínimo Paraguay 2026 por período',
    headers: ['Período', 'Monto (jornada ' + jornada + ')'],
    rows: [
      ['Mensual', fmtPYG(smvmMes * factorNocturno)],
      ['Quincenal', fmtPYG(quincena * factorNocturno)],
      ['Diario (jornal)', fmtPYG(jornalAplicado)],
      ['Por hora', fmtPYG(horaAplicada)],
      [`Proporcional por ${dias} día(s)`, fmtPYG(proporcional)],
    ],
    note: 'SMVM Gs. 3.044.000 (Decreto N° 6225, vigente 1-jul-2026). Hora = mensual ÷ 240. El recargo nocturno es del 30% (Código del Trabajo, art. 198).',
  };

  return {
    salarioMinimoMensual: smvmMes,
    jornal: Math.round(jornalMin),
    jornalMinimoLegal: p.jornalMinimo,
    hora: Math.round(horaMin),
    quincena: Math.round(quincena),
    proporcional: Math.round(proporcional),
    proporcionalDetalle: `${fmtPYG(jornalAplicado)} × ${dias} día(s) = ${fmtPYG(proporcional)}`,
    _insight,
    _table,
  };
}
