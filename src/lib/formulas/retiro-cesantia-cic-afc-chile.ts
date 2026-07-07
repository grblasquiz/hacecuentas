/** Retiro del Seguro de Cesantía con cargo a la Cuenta Individual (CIC) — AFC (Chile) 2026.
 *  Escala decreciente de giros mensuales sobre el promedio de las últimas remuneraciones.
 *  Fuente: Ley 19.728 art. 15 + Superintendencia de Pensiones / AFC Chile.
 *  Giros: 70%, 55%, 45%, 40%, 35%, 30% del promedio (indefinido: prom. 12 meses; plazo fijo: 6 meses).
 *  El último giro puede ser menor: corresponde al saldo pendiente de la CIC. */
import { fmtCLP } from '../data/chile-2026.ts';

// Escala legal de giros de la Cuenta Individual por Cesantía — Ley 19.728 art. 15.
const ESCALA_GIROS = [0.70, 0.55, 0.45, 0.40, 0.35, 0.30];

// Cotizaciones mínimas para girar de la CIC (Ley 19.728).
const MIN_COTIZACIONES_INDEFINIDO = 12; // 12 cotizaciones (mensuales) para contrato indefinido
const MIN_COTIZACIONES_PLAZO_FIJO = 6;  // 6 cotizaciones para plazo fijo / obra o faena

export interface Inputs {
  sueldoPromedio: number;                    // promedio de las últimas remuneraciones imponibles
  mesesCotizados?: number;                    // cotizaciones registradas antes del término
  tipoContrato?: 'indefinido' | 'plazo_fijo'; // define mínimo de cotizaciones y ventana del promedio
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const prom = Number(i.sueldoPromedio) || 0;
  const meses = Math.max(0, Number(i.mesesCotizados) || 0);
  const tipo = i.tipoContrato === 'plazo_fijo' ? 'plazo_fijo' : 'indefinido';
  if (prom <= 0) throw new Error('Ingresá el promedio de tus últimas remuneraciones imponibles');

  const minCotizaciones = tipo === 'plazo_fijo' ? MIN_COTIZACIONES_PLAZO_FIJO : MIN_COTIZACIONES_INDEFINIDO;
  const cumpleRequisito = meses >= minCotizaciones;

  const primerGiro = prom * ESCALA_GIROS[0];
  const giros = ESCALA_GIROS.map((pct, idx) => ({ mes: idx + 1, pct, monto: Math.round(prom * pct) }));
  const totalEstimado = giros.reduce((acc, g) => acc + g.monto, 0);

  const escalaTexto = giros
    .map((g) => `mes ${g.mes}: ${(g.pct * 100).toLocaleString('es-CL')}% = ${fmtCLP(g.monto)}`)
    .join('; ');

  const requisitoTexto = cumpleRequisito
    ? `Con ${meses} cotizaciones cumplís el mínimo de ${minCotizaciones} para girar de tu CIC (contrato ${tipo === 'plazo_fijo' ? 'a plazo fijo' : 'indefinido'}).`
    : `Con ${meses} cotizaciones aún no alcanzás el mínimo de ${minCotizaciones} exigido para un contrato ${tipo === 'plazo_fijo' ? 'a plazo fijo' : 'indefinido'}.`;

  const _insight = {
    title: 'Tu primer giro del seguro de cesantía',
    text: `Con un promedio de **${fmtCLP(prom)}**, tu **primer giro** sería de **${fmtCLP(primerGiro)}** (70% del promedio) y los siguientes bajan al 55%, 45%, 40%, 35% y 30%. El total teórico de la escala completa es **${fmtCLP(totalEstimado)}**, siempre que el saldo de tu Cuenta Individual (CIC) alcance.`,
    tone: cumpleRequisito ? 'positive' : 'neutral',
    icon: '🛟',
  };
  const _chart = {
    type: 'bar',
    segments: giros.map((g) => ({ label: `Mes ${g.mes}`, value: g.monto })),
    ariaLabel: `Giros mensuales decrecientes desde ${fmtCLP(giros[0].monto)} hasta ${fmtCLP(giros[giros.length - 1].monto)}.`,
  };

  return {
    primerGiro: fmtCLP(primerGiro),
    girosSiguientes: escalaTexto,
    totalEstimado: fmtCLP(totalEstimado),
    requisito: requisitoTexto,
    detalle: `Escala CIC (Ley 19.728) sobre promedio ${fmtCLP(prom)} → ${escalaTexto}. Total teórico = ${fmtCLP(totalEstimado)} (limitado por el saldo real de tu CIC).`,
    _insight,
    _chart,
  };
}
