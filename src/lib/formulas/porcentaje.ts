/**
 * Calculadora de porcentajes
 * Modos:
 *   - simple: X% de Y
 *   - descuento: precio con X% de descuento
 *   - aumento: precio con X% de aumento
 *   - diferencia: qué % representa X respecto a Y
 *   - variacion: variación porcentual entre dos valores
 */

export interface PorcentajeInputs {
  modo: string;
  valor1: number;
  valor2: number;
}

export interface PorcentajeOutputs {
  resultado: string;
  formula: string;
  explicacion: string;
}

export function porcentaje(inputs: PorcentajeInputs): PorcentajeOutputs {
  const modo = inputs.modo || 'simple';
  const v1 = Number(inputs.valor1);
  const v2 = Number(inputs.valor2);

  if (isNaN(v1) || isNaN(v2)) throw new Error('Ingresá valores numéricos válidos');

  const fmt = (n: number) => new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 }).format(n);

  switch (modo) {
    case 'simple': {
      const r = (v1 * v2) / 100;
      return {
        resultado: fmt(r),
        formula: `${v1} × ${v2} ÷ 100 = ${fmt(r)}`,
        explicacion: `El ${v2}% de ${v1} es ${fmt(r)}`,
      };
    }
    case 'descuento': {
      const descuento = (v1 * v2) / 100;
      const final = v1 - descuento;
      return {
        resultado: fmt(final),
        formula: `${v1} − (${v1} × ${v2}%) = ${fmt(final)}`,
        explicacion: `${v1} con ${v2}% de descuento: ahorrás ${fmt(descuento)} y pagás ${fmt(final)}`,
      };
    }
    case 'aumento': {
      const aumento = (v1 * v2) / 100;
      const final = v1 + aumento;
      return {
        resultado: fmt(final),
        formula: `${v1} + (${v1} × ${v2}%) = ${fmt(final)}`,
        explicacion: `${v1} con ${v2}% de aumento: sumás ${fmt(aumento)} y pagás ${fmt(final)}`,
      };
    }
    case 'diferencia': {
      if (v2 === 0) throw new Error('El segundo valor no puede ser cero');
      const pct = (v1 / v2) * 100;
      return {
        resultado: `${pct.toFixed(2)}%`,
        formula: `(${v1} ÷ ${v2}) × 100`,
        explicacion: `${v1} es el ${pct.toFixed(2)}% de ${v2}`,
      };
    }
    case 'variacion': {
      if (v1 === 0) throw new Error('El valor inicial no puede ser cero');
      const variacion = ((v2 - v1) / v1) * 100;
      const signo = variacion >= 0 ? '+' : '';
      return {
        resultado: `${signo}${variacion.toFixed(2)}%`,
        formula: `((${v2} − ${v1}) ÷ ${v1}) × 100`,
        explicacion: variacion >= 0
          ? `Aumentó ${variacion.toFixed(2)}% de ${v1} a ${v2}`
          : `Disminuyó ${Math.abs(variacion).toFixed(2)}% de ${v1} a ${v2}`,
      };
    }
    default:
      throw new Error('Modo no reconocido');
  }
}
