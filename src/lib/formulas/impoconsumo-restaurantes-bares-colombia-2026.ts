/**
 * Impoconsumo (INC) en restaurantes y bares Colombia 2026.
 * Servicio de restaurante/bar = Impuesto Nacional al Consumo del 8% sobre el valor
 * del consumo (comida + todas las bebidas), art. 512-9 y 512-12 ET. La propina, por ser
 * voluntaria, NUNCA hace parte de la base (art. 512-9 ET). El INC no genera impuesto
 * descontable. EXCEPCIÓN: el servicio prestado bajo franquicia cobra IVA 19% en vez de INC.
 * Tasas fijas de ley → no salen de colombia-2026.ts; reusa fmtCOP para el formato.
 */
import { fmtCOP } from '../data/colombia-2026.ts';

const TASA_INC = 0.08;  // 8% Impuesto Nacional al Consumo restaurantes y bares (art. 512-9 ET)
const TASA_IVA = 0.19;  // 19% IVA — sólo si el establecimiento opera bajo franquicia

export interface Inputs {
  valorConsumo: number | string;
  propina?: number | string;
  franquicia?: string; // 'no' | 'si'
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

/** ''/null/undefined → default; nunca pisa un 0 válido. */
const num = (v: unknown, def = 0): number => {
  if (v === '' || v === null || v === undefined) return def;
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
};

export function compute(i: Inputs): Outputs {
  const consumo = num(i.valorConsumo);
  if (consumo <= 0) throw new Error('Ingresá el valor del consumo (comida y bebidas)');

  const propina = Math.max(0, num(i.propina, 0));
  const esFranquicia = String(i.franquicia ?? 'no') === 'si';

  // La base es SIEMPRE el consumo antes de la propina (la propina no hace base, art. 512-9 ET).
  const base = consumo;
  const tasa = esFranquicia ? TASA_IVA : TASA_INC;
  const nombreImpuesto = esFranquicia ? 'IVA' : 'Impoconsumo (INC)';
  const pctTexto = esFranquicia ? '19%' : '8%';
  const impuesto = base * tasa;

  // Total a pagar = consumo + impuesto + propina (la propina se suma al final, no se grava).
  const totalSinPropina = consumo + impuesto;
  const total = totalSinPropina + propina;

  // Cuánto sería con el otro régimen (para mostrar la diferencia franquicia vs no franquicia).
  const impuestoAlternativo = base * (esFranquicia ? TASA_INC : TASA_IVA);
  const diferencia = Math.abs(impuesto - impuestoAlternativo);

  const _insight = {
    title: `${nombreImpuesto} de tu cuenta`,
    text: `Sobre un consumo de **${fmtCOP(consumo)}**, el ${nombreImpuesto} del **${pctTexto}** suma **${fmtCOP(impuesto)}**${esFranquicia ? ' (este local opera bajo franquicia, por eso cobra IVA y no INC)' : ' (servicio de restaurante/bar, art. 512-9 ET)'}.${propina > 0 ? ` Sumando la propina voluntaria de ${fmtCOP(propina)} —que **no** paga impuesto— la cuenta total queda en **${fmtCOP(total)}**.` : ` La cuenta total queda en **${fmtCOP(total)}**.`} ${esFranquicia ? `Si fuera un restaurante normal (INC 8%) pagarías ${fmtCOP(impuestoAlternativo)}: ${fmtCOP(diferencia)} menos.` : `Si fuera una franquicia (IVA 19%) pagarías ${fmtCOP(impuestoAlternativo)}: ${fmtCOP(diferencia)} más.`}`,
    tone: 'good' as const,
    icon: '🍽️',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Consumo (comida y bebidas)', value: Math.round(consumo) },
      { label: `${nombreImpuesto} ${pctTexto}`, value: Math.round(impuesto) },
      ...(propina > 0 ? [{ label: 'Propina (voluntaria)', value: Math.round(propina) }] : []),
    ],
    prefix: '$',
    centerValue: fmtCOP(total),
    centerLabel: 'total a pagar',
    ariaLabel: `Cuenta total ${fmtCOP(total)}: consumo ${fmtCOP(consumo)} más ${nombreImpuesto} ${pctTexto} de ${fmtCOP(impuesto)}${propina > 0 ? ` y propina de ${fmtCOP(propina)}` : ''}.`,
  };

  return {
    total: fmtCOP(total),
    impuesto: `${fmtCOP(impuesto)} (${nombreImpuesto} ${pctTexto})`,
    base: `${fmtCOP(base)} (consumo, sin la propina)`,
    propinaOut: propina > 0 ? `${fmtCOP(propina)} (no paga impuesto)` : 'Sin propina',
    totalSinPropina: fmtCOP(totalSinPropina),
    detalle: `${fmtCOP(consumo)} × ${pctTexto} = ${fmtCOP(impuesto)} de ${nombreImpuesto}. ${fmtCOP(consumo)} + ${fmtCOP(impuesto)}${propina > 0 ? ` + ${fmtCOP(propina)} de propina` : ''} = ${fmtCOP(total)}.`,
    _insight,
    _chart,
  };
}
