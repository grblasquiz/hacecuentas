/** Sustitución manteca ↔ aceite en repostería (regla del 80%) */
export interface Inputs {
  cantidad?: number;
  direccion?: string;
  __lang?: string;
}
export interface Outputs {
  resultado: number;
  resultadoMl: number;
  ajusteLiquidos: string;
  formula: string;
  _insight?: any;
}

const DENSIDAD_ACEITE = 0.92; // g/ml
const FACTOR = 0.8; // aceite = 80% del peso de la manteca
const AGUA_MANTECA = 0.16; // ~16% de agua en la manteca

export function sustituirMantecaPorAceiteReposteria(i: Inputs): Outputs {
  const cantidad = Number(i.cantidad) || 0;
  const direccion = String(i.direccion || 'manteca-aceite');

  if (cantidad <= 0) throw new Error('Ingresá una cantidad mayor a 0 gramos');

  let resultado = 0;
  let resultadoMl = 0;
  let ajusteLiquidos = '';
  let formula = '';
  let insightText = '';

  if (direccion === 'manteca-aceite') {
    resultado = cantidad * FACTOR;
    resultadoMl = resultado / DENSIDAD_ACEITE;
    const agua = cantidad * AGUA_MANTECA;
    ajusteLiquidos = `La manteca aportaba ~${Number(agua.toFixed(0))} ml de agua que el aceite no trae: sumá ${Number(agua.toFixed(0))} ml de leche o líquido de la receta para compensar.`;
    formula = `aceite = ${cantidad} g × 0.8 = ${Number(resultado.toFixed(1))} g = ${Number(resultado.toFixed(1))} / 0.92 = ${Number(resultadoMl.toFixed(0))} ml`;
    insightText = `**${cantidad} g de manteca** se reemplazan con **${Number(resultado.toFixed(0))} g de aceite (~${Number(resultadoMl.toFixed(0))} ml)**. El aceite es 100% grasa y la manteca solo ~82%, por eso va el 80% del peso. Sumá ~${Number((cantidad * AGUA_MANTECA).toFixed(0))} ml de líquido para mantener la humedad.`;
  } else {
    // aceite → manteca
    resultado = cantidad * 1.25;
    resultadoMl = cantidad / DENSIDAD_ACEITE;
    const agua = resultado * AGUA_MANTECA;
    ajusteLiquidos = `La manteca suma ~${Number(agua.toFixed(0))} ml de agua propia: restá ${Number(agua.toFixed(0))} ml de leche o líquido de la receta para que la masa no quede aguada.`;
    formula = `manteca = ${cantidad} g × 1.25 = ${Number(resultado.toFixed(1))} g (los ${cantidad} g de aceite eran ~${Number(resultadoMl.toFixed(0))} ml)`;
    insightText = `**${cantidad} g de aceite (~${Number(resultadoMl.toFixed(0))} ml)** se reemplazan con **${Number(resultado.toFixed(0))} g de manteca**. Como la manteca es solo ~82% grasa, necesitás un 25% más de peso. Restá ~${Number(agua.toFixed(0))} ml de líquido de la receta.`;
  }

  return {
    resultado: Number(resultado.toFixed(1)),
    resultadoMl: Number(resultadoMl.toFixed(0)),
    ajusteLiquidos,
    formula,
    _insight: {
      title: 'Qué te dice el resultado',
      text: insightText,
      tone: 'neutral',
      icon: '🧈',
    },
  };
}
