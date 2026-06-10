/**
 * Salario integral Colombia 2026 — valida el mínimo legal (13 SMLMV = 10 + factor
 * prestacional del 30%, art. 132 CST), cotiza seguridad social sobre el 70% (IBC),
 * descuenta salud 4% + pensión 4% + FSP y retención en la fuente (art. 383 ET con
 * renta exenta del 25%, tope 790 UVT/año), y compara contra el salario ordinario
 * equivalente con prima, cesantías e intereses.
 * Constantes: src/lib/data/colombia-2026.ts (CST art. 132, Ley 100/1993, Ley 2277/2022).
 */
import { COLOMBIA_2026, fmtCOP, tasaFsp, retefuenteMensualArt383 } from '../data/colombia-2026.ts';

export interface Inputs {
  monto: number;        // salario integral pactado, o salario ordinario a convertir
  tipoMonto?: string;   // 'integral' (default) | 'ordinario'
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const C = COLOMBIA_2026;
  const SI = C.salarioIntegral;

  const monto = Number(i.monto) || 0;
  const tipo = String(i.tipoMonto ?? 'integral') === 'ordinario' ? 'ordinario' : 'integral';
  if (monto <= 0) throw new Error('Ingresá el salario mensual en pesos');

  const factor = 1 + SI.factorPrestacional; // 1,30
  const integral = tipo === 'ordinario' ? monto * factor : monto;
  const ordinario = tipo === 'ordinario' ? monto : monto / factor;

  const minimoIntegral = C.smlmv * SI.minimoSmlmv; // 13 SMLMV = $22.761.765 en 2026
  const cumpleMinimo = integral >= minimoIntegral - 0.5;
  const faltante = Math.max(0, minimoIntegral - integral);

  // IBC: 70% del salario integral, entre 1 y 25 SMLMV (Ley 797/2003).
  const ibcTope = C.smlmv * C.aportes.ibcTopeSmlmv;
  const ibc = Math.min(Math.max(integral * SI.ibcFactor, C.smlmv), ibcTope);
  const topeAplicado = integral * SI.ibcFactor > ibcTope;

  const salud = ibc * C.aportes.saludEmpleado;
  const pension = ibc * C.aportes.pensionEmpleado;
  const fsp = ibc * tasaFsp(ibc);
  const aportes = salud + pension + fsp;

  // Retención en la fuente (procedimiento 1 simplificado): ingreso − aportes
  // obligatorios (INCRNGO) − renta exenta 25% (tope 790 UVT/año ⇒ 790/12 al mes).
  const subtotal = integral - aportes;
  const topeExentaMensual = (C.rentaExentaLaboral.topeAnualUvt / 12) * C.uvt;
  const exenta = Math.min(subtotal * C.rentaExentaLaboral.porcentaje, topeExentaMensual);
  const baseGravable = Math.max(0, subtotal - exenta);
  const retefuente = retefuenteMensualArt383(baseGravable);

  const neto = integral - aportes - retefuente;

  // Comparación anual bruta vs. ordinario equivalente (mismo costo de bolsillo base):
  // el ordinario suma prima (1 sueldo), cesantías (1 sueldo) e intereses (12% de cesantías).
  const primaAnualOrd = ordinario * 12 * C.prestaciones.primaPorcentaje;
  const cesantiasAnualOrd = ordinario * 12 * C.prestaciones.cesantiasPorcentaje;
  const interesesAnualOrd = cesantiasAnualOrd * C.prestaciones.interesesCesantias;
  const paqueteOrdinario = ordinario * 12 + primaAnualOrd + cesantiasAnualOrd + interesesAnualOrd;
  const paqueteIntegral = integral * 12;
  const difAnual = paqueteIntegral - paqueteOrdinario;

  // IBC de pensión: el integral cotiza sobre el 70% (0,91 del ordinario equivalente).
  const ibcOrdinario = Math.min(ordinario, ibcTope);

  const _insight = cumpleMinimo
    ? {
        title: 'Tu salario integral, en limpio',
        text: `Tu integral de **${fmtCOP(integral)}** cumple el mínimo legal 2026 (**${fmtCOP(minimoIntegral)}** = 13 SMLMV). Cotizás sobre un IBC de **${fmtCOP(ibc)}** (el 70%${topeAplicado ? ', con tope de 25 SMLMV aplicado' : ''}): te descuentan **${fmtCOP(aportes)}** de aportes y **${fmtCOP(retefuente)}** de retención en la fuente → neto de **${fmtCOP(neto)}**. En bruto anual, el paquete integral (${fmtCOP(paqueteIntegral)}) supera en **${fmtCOP(difAnual)}** al ordinario equivalente con prima y cesantías, pero tu base de pensión es menor (${fmtCOP(ibc)} vs. ${fmtCOP(ibcOrdinario)}).`,
        tone: 'good',
        icon: '💼',
      }
    : {
        title: 'Ese monto NO puede pactarse como integral',
        text: `Un salario integral exige mínimo **13 SMLMV = ${fmtCOP(minimoIntegral)}** en 2026 (10 SMLMV + factor prestacional del 30%, art. 132 CST). A tu monto de **${fmtCOP(integral)}** le faltan **${fmtCOP(faltante)}**: si te lo ofrecen como "integral", el pacto es inválido y conservás derecho a prima, cesantías, intereses, recargos y horas extras como cualquier salario ordinario. Los valores de abajo aplican sólo si el monto llegara al mínimo legal.`,
        tone: 'warning',
        icon: '⚠️',
      };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Neto en mano', value: Math.round(neto) },
      { label: 'Salud 4%', value: Math.round(salud) },
      { label: 'Pensión 4%', value: Math.round(pension) },
      { label: 'FSP', value: Math.round(fsp) },
      { label: 'Retención en la fuente', value: Math.round(retefuente) },
    ].filter((s) => s.value > 0),
    prefix: '$ ',
    centerValue: fmtCOP(neto),
    centerLabel: 'Neto mensual',
    ariaLabel: `Salario integral de ${fmtCOP(integral)}: neto ${fmtCOP(neto)} tras ${fmtCOP(aportes)} de aportes y ${fmtCOP(retefuente)} de retención.`,
  };

  return {
    netoMensual: fmtCOP(neto),
    cumpleMinimo: cumpleMinimo
      ? `Sí — supera el mínimo legal de ${fmtCOP(minimoIntegral)} (13 SMLMV)`
      : `No — faltan ${fmtCOP(faltante)} para el mínimo legal de ${fmtCOP(minimoIntegral)} (13 SMLMV)`,
    ibc: `${fmtCOP(ibc)} (70% del integral${topeAplicado ? ', tope 25 SMLMV' : ''})`,
    aportesEmpleado: `${fmtCOP(aportes)} (salud ${fmtCOP(salud)} + pensión ${fmtCOP(pension)}${fsp > 0 ? ` + FSP ${fmtCOP(fsp)}` : ''})`,
    retefuente: fmtCOP(retefuente),
    ordinarioEquivalente: `${fmtCOP(ordinario)} + prima, cesantías e intereses`,
    comparacionAnual: `Integral ${fmtCOP(paqueteIntegral)}/año vs. ordinario ${fmtCOP(paqueteOrdinario)}/año (prestaciones incluidas): diferencia ${fmtCOP(difAnual)} a favor del integral en bruto`,
    detalle: `Integral ${fmtCOP(integral)} − aportes ${fmtCOP(aportes)} (sobre IBC ${fmtCOP(ibc)}) − retefuente ${fmtCOP(retefuente)} = neto ${fmtCOP(neto)}. Ordinario equivalente: ${fmtCOP(ordinario)} (integral ÷ 1,30).`,
    _insight,
    _chart,
  };
}
