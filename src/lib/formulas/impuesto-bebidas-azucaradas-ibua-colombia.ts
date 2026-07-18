/**
 * IBUA — Impuesto a las Bebidas Ultraprocesadas Azucaradas, Colombia 2026.
 * Resolución DIAN 000247 del 30-dic-2025 (art. 513-1 y ss. ET, Ley 2277/2022):
 *   < 5 g de azúcar añadido por 100 ml → $0 · ≥5 y <9 g → $40 por 100 ml · ≥9 g → $68 por 100 ml.
 * El impuesto se liquida por el volumen del envase. Tabla importada de la data país (NO hardcodear).
 */
import { IBUA_2026, fmtCOP } from '../data/colombia-2026.ts';

export interface Inputs {
  ml_envase: number;
  azucar_g_100ml: number;
  unidades: number;
}
export interface Outputs { [k: string]: any; _insight?: any; }

export function compute(i: Inputs): Outputs {
  const ml = Number(i.ml_envase);
  if (!Number.isFinite(ml) || ml <= 0) throw new Error('Ingresa los mililitros del envase');
  const azucar = Number(i.azucar_g_100ml);
  if (!Number.isFinite(azucar) || azucar < 0) throw new Error('Ingresa los gramos de azúcar añadido por 100 ml (está en la etiqueta)');
  let unidades = Math.round(Number(i.unidades));
  if (!Number.isFinite(unidades) || unidades < 1) unidades = 1;

  const tramo = IBUA_2026.find(t => azucar >= t.desdeG && azucar < t.hastaG) ?? IBUA_2026[IBUA_2026.length - 1];
  const tarifa = tramo.tarifaPor100ml;

  const impuestoUnidad = (ml / 100) * tarifa;
  const impuestoTotal = impuestoUnidad * unidades;

  const tramoLabel = tarifa === 0 ? 'menos de 5 g/100 ml (no grava)' : tarifa === 40 ? 'entre 5 y menos de 9 g/100 ml' : '9 g/100 ml o más';

  const _insight = tarifa === 0
    ? {
        title: 'Esta bebida no paga IBUA',
        text: `Con **${azucar.toLocaleString('es-CO')} g de azúcar añadido por 100 ml**, la bebida queda en el tramo exento del IBUA 2026 (menos de 5 g/100 ml): tarifa **$0**. Ojo: el umbral se revisa cada año por resolución de la DIAN.`,
        tone: 'good',
        icon: '🥤',
      }
    : {
        title: `IBUA: ${fmtCOP(impuestoTotal)}${unidades > 1 ? ` por ${unidades} unidades` : ' por envase'}`,
        text: `Con **${azucar.toLocaleString('es-CO')} g/100 ml** la bebida cae en el tramo de **${fmtCOP(tarifa)} por cada 100 ml** (${tramoLabel}). Un envase de **${ml.toLocaleString('es-CO')} ml** paga **${fmtCOP(impuestoUnidad)}**${unidades > 1 ? `; las ${unidades} unidades suman **${fmtCOP(impuestoTotal)}**` : ''}. El IBUA lo declara el productor o importador, pero se traslada al precio final que pagas.`,
        tone: 'warn',
        icon: '🥤',
      };

  return {
    impuesto_por_envase: fmtCOP(impuestoUnidad),
    impuesto_total: fmtCOP(impuestoTotal),
    tarifa_aplicada: `${fmtCOP(tarifa)} por 100 ml (${tramoLabel})`,
    detalle: `${ml.toLocaleString('es-CO')} ml ÷ 100 × ${fmtCOP(tarifa)} = ${fmtCOP(impuestoUnidad)} por envase${unidades > 1 ? ` × ${unidades} unidades = ${fmtCOP(impuestoTotal)}` : ''}.`,
    _insight,
  };
}
