/**
 * Subsidio por incapacidad IMSS — enfermedad general (60% del SBC desde el día 4, LSS Art. 98)
 * y riesgo de trabajo (100% del SBC desde el día 1, LSS Art. 58). SBC topado a 25 UMA.
 * Constantes desde src/lib/data/mexico-2026.ts.
 */
import { MEXICO_2026, fmtMXN } from '../data/mexico-2026.ts';

export interface Inputs {
  salario: number;
  periodo?: string;        // 'diario' | 'mensual'
  diasIncapacidad: number;
  tipo?: string;           // 'enfermedad' | 'riesgo'
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

/** Guard de defaults: '' / null / undefined → default, sin pisar el 0 del usuario. */
function num(v: unknown, d: number): number {
  if (v === '' || v === null || v === undefined) return d;
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
}

export function compute(i: Inputs): Outputs {
  const { incapacidades, uma, imss, salarioMinimo } = MEXICO_2026;

  const salario = num(i.salario, 0);
  if (salario <= 0) throw new Error('Ingresa tu salario base de cotización (SBC)');
  const dias = Math.floor(num(i.diasIncapacidad, 0));
  if (dias <= 0) throw new Error('Ingresa los días de incapacidad de tu certificado');
  const periodo = String(i.periodo || 'diario') === 'mensual' ? 'mensual' : 'diario';
  const tipo = String(i.tipo || 'enfermedad') === 'riesgo' ? 'riesgo' : 'enfermedad';

  const factorMensual = salarioMinimo.factorMensual; // 30.4
  const sbcIngresado = periodo === 'mensual' ? salario / factorMensual : salario;
  const topeSbcDiario = uma.diaria * imss.topeSbcUmas; // 25 UMA = $2,932.75/día en 2026
  const topado = sbcIngresado > topeSbcDiario;
  const sbc = Math.min(sbcIngresado, topeSbcDiario);

  const eg = incapacidades.enfermedadGeneral;
  const rt = incapacidades.riesgoTrabajo;

  const porcentaje = tipo === 'riesgo' ? rt.porcentajeSbc : eg.porcentajeSbc;
  const diasCarencia = tipo === 'riesgo' ? rt.desdeDia - 1 : eg.desdeDia - 1; // 0 o 3
  const diasNoPagados = Math.min(dias, diasCarencia);
  const diasPagados = dias - diasNoPagados;

  const subsidioDiario = sbc * porcentaje;
  const subsidioTotal = subsidioDiario * diasPagados;
  const salarioPleno = sbc * dias;
  const noCubierto = salarioPleno - subsidioTotal;

  // Límite temporal: enfermedad general paga hasta 52 semanas, prorrogables 26 más (LSS Art. 96).
  const maxDiasInicial = eg.maxSemanas * 7;                       // 364
  const maxDiasTotal = (eg.maxSemanas + eg.prorrogaSemanas) * 7;  // 546
  let avisoLimite = '';
  if (tipo === 'enfermedad' && dias > maxDiasTotal) {
    avisoLimite = ` Ojo: la ley cubre como máximo ${eg.maxSemanas} semanas + ${eg.prorrogaSemanas} de prórroga (${maxDiasTotal} días); más allá de eso el subsidio termina y procede el dictamen de invalidez.`;
  } else if (tipo === 'enfermedad' && dias > maxDiasInicial) {
    avisoLimite = ` Superas las ${eg.maxSemanas} semanas iniciales: el tramo extra requiere prórroga autorizada por el IMSS (hasta ${eg.prorrogaSemanas} semanas más, LSS Art. 96).`;
  }

  const _insight = {
    title: tipo === 'riesgo' ? 'Subsidio por riesgo de trabajo' : 'Subsidio por enfermedad general',
    text: tipo === 'riesgo'
      ? `El IMSS te paga el **100% de tu SBC desde el día 1**: **${fmtMXN(subsidioDiario)}** por día × ${diasPagados} días = **${fmtMXN(subsidioTotal)}**. En riesgo de trabajo no pierdes ingreso (sobre el SBC registrado).${topado ? ` Tu SBC excede el tope legal y se calculó sobre ${fmtMXN(topeSbcDiario)}/día (25 UMA).` : ''}`
      : `El IMSS paga el **60% de tu SBC a partir del día 4**: ${diasNoPagados > 0 ? `los primeros **${diasNoPagados} días no se pagan**, ` : ''}cobras **${fmtMXN(subsidioDiario)}** por día × ${diasPagados} ${diasPagados === 1 ? 'día' : 'días'} = **${fmtMXN(subsidioTotal)}**. Frente a tu salario pleno del periodo (${fmtMXN(salarioPleno)}) dejas de percibir ${fmtMXN(noCubierto)}.${topado ? ` Tu SBC excede el tope legal y se calculó sobre ${fmtMXN(topeSbcDiario)}/día (25 UMA).` : ''}${avisoLimite}`,
    tone: tipo === 'riesgo' ? 'good' : 'warn',
    icon: '🏥',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Subsidio IMSS', value: Math.round(subsidioTotal) },
      { label: 'No cubierto', value: Math.round(noCubierto) },
    ].filter((s) => s.value > 0),
    prefix: '$',
    centerValue: fmtMXN(subsidioTotal),
    centerLabel: 'Subsidio total',
    ariaLabel: `Subsidio IMSS de ${fmtMXN(subsidioTotal)} por ${dias} días de incapacidad; ${fmtMXN(noCubierto)} del salario pleno no se cubre.`,
  };

  return {
    subsidioTotal: fmtMXN(subsidioTotal),
    subsidioDiario: `${fmtMXN(subsidioDiario)} (${Math.round(porcentaje * 100)}% del SBC)`,
    diasPagados: `${diasPagados} de ${dias}`,
    diasNoPagados: tipo === 'riesgo' ? '0 (se paga desde el día 1)' : `${diasNoPagados} (días 1 a 3, sin subsidio del IMSS)`,
    detalle: `SBC diario ${fmtMXN(sbc)}${topado ? ' (topado a 25 UMA)' : ''} × ${Math.round(porcentaje * 100)}% = ${fmtMXN(subsidioDiario)}/día × ${diasPagados} días pagados = ${fmtMXN(subsidioTotal)}.${avisoLimite}`,
    _insight,
    _chart,
  };
}
