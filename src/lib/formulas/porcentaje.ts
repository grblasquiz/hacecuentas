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
  __lang?: string;
}

export interface PorcentajeOutputs {
  resultado: string;
  formula: string;
  explicacion: string;
  _insight?: any;
}

export function porcentaje(inputs: PorcentajeInputs): PorcentajeOutputs {
  const __lang = inputs.__lang === 'en' ? 'en' : 'es';
  const modo = inputs.modo || 'simple';
  const v1 = Number(inputs.valor1);
  const v2 = Number(inputs.valor2);

  if (isNaN(v1) || isNaN(v2)) throw new Error(__lang === 'en' ? 'Enter valid numeric values' : 'Ingresá valores numéricos válidos');

  const fmt = (n: number) => new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 }).format(n);

  switch (modo) {
    case 'simple': {
      const r = (v1 * v2) / 100;
      return {
        resultado: fmt(r),
        formula: `${v1} × ${v2} ÷ 100 = ${fmt(r)}`,
        explicacion: __lang === 'en' ? `${v2}% of ${v1} is ${fmt(r)}` : `El ${v2}% de ${v1} es ${fmt(r)}`,
        _insight: {
          title: __lang === 'en' ? 'Result' : 'Resultado',
          text: __lang === 'en'
            ? `**${fmt(v2)}%** of **${fmt(v1)}** equals **${fmt(r)}** — that is, ${fmt(v2)} parts out of every 100.`
            : `El **${fmt(v2)}%** de **${fmt(v1)}** es **${fmt(r)}**, es decir ${fmt(v2)} de cada 100.`,
          tone: 'neutral',
          icon: '📊',
        },
      };
    }
    case 'descuento': {
      const descuento = (v1 * v2) / 100;
      const final = v1 - descuento;
      return {
        resultado: fmt(final),
        formula: `${v1} − (${v1} × ${v2}%) = ${fmt(final)}`,
        explicacion: __lang === 'en'
          ? `${v1} with ${v2}% discount: you save ${fmt(descuento)} and pay ${fmt(final)}`
          : `${v1} con ${v2}% de descuento: ahorrás ${fmt(descuento)} y pagás ${fmt(final)}`,
        _insight: {
          title: __lang === 'en' ? 'You save' : 'Te ahorrás',
          text: __lang === 'en'
            ? `A **${fmt(v2)}%** discount knocks off **${fmt(descuento)}**, so you pay **${fmt(final)}** instead of ${fmt(v1)}.`
            : `Un descuento del **${fmt(v2)}%** te saca **${fmt(descuento)}**, así que pagás **${fmt(final)}** en lugar de ${fmt(v1)}.`,
          tone: 'good',
          icon: '🏷️',
        },
      };
    }
    case 'aumento': {
      const aumento = (v1 * v2) / 100;
      const final = v1 + aumento;
      return {
        resultado: fmt(final),
        formula: `${v1} + (${v1} × ${v2}%) = ${fmt(final)}`,
        explicacion: __lang === 'en'
          ? `${v1} with ${v2}% increase: you add ${fmt(aumento)} and pay ${fmt(final)}`
          : `${v1} con ${v2}% de aumento: sumás ${fmt(aumento)} y pagás ${fmt(final)}`,
        _insight: {
          title: __lang === 'en' ? 'Increase applied' : 'Aumento aplicado',
          text: __lang === 'en'
            ? `A **${fmt(v2)}%** increase adds **${fmt(aumento)}**, taking ${fmt(v1)} up to **${fmt(final)}**.`
            : `Un aumento del **${fmt(v2)}%** suma **${fmt(aumento)}** y lleva ${fmt(v1)} hasta **${fmt(final)}**.`,
          tone: 'warn',
          icon: '📈',
        },
      };
    }
    case 'diferencia': {
      if (v2 === 0) throw new Error(__lang === 'en' ? 'The second value cannot be zero' : 'El segundo valor no puede ser cero');
      const pct = (v1 / v2) * 100;
      return {
        resultado: `${pct.toFixed(2)}%`,
        formula: `(${v1} ÷ ${v2}) × 100`,
        explicacion: __lang === 'en' ? `${v1} is ${pct.toFixed(2)}% of ${v2}` : `${v1} es el ${pct.toFixed(2)}% de ${v2}`,
        _insight: {
          title: __lang === 'en' ? 'Proportion' : 'Proporción',
          text: __lang === 'en'
            ? `**${fmt(v1)}** represents **${pct.toFixed(2)}%** of **${fmt(v2)}**${pct > 100 ? ' — it is larger than the whole' : ''}.`
            : `**${fmt(v1)}** representa el **${pct.toFixed(2)}%** de **${fmt(v2)}**${pct > 100 ? ' — es mayor que el total' : ''}.`,
          tone: 'neutral',
          icon: '🧮',
        },
      };
    }
    case 'variacion': {
      if (v1 === 0) throw new Error(__lang === 'en' ? 'The initial value cannot be zero' : 'El valor inicial no puede ser cero');
      const variacion = ((v2 - v1) / v1) * 100;
      const signo = variacion >= 0 ? '+' : '';
      const subio = variacion >= 0;
      return {
        resultado: `${signo}${variacion.toFixed(2)}%`,
        formula: `((${v2} − ${v1}) ÷ ${v1}) × 100`,
        explicacion: variacion >= 0
          ? (__lang === 'en' ? `Increased ${variacion.toFixed(2)}% from ${v1} to ${v2}` : `Aumentó ${variacion.toFixed(2)}% de ${v1} a ${v2}`)
          : (__lang === 'en' ? `Decreased ${Math.abs(variacion).toFixed(2)}% from ${v1} to ${v2}` : `Disminuyó ${Math.abs(variacion).toFixed(2)}% de ${v1} a ${v2}`),
        _insight: {
          title: subio
            ? (__lang === 'en' ? 'It went up' : 'Subió')
            : (__lang === 'en' ? 'It went down' : 'Bajó'),
          text: __lang === 'en'
            ? `Going from **${fmt(v1)}** to **${fmt(v2)}** is a **${signo}${variacion.toFixed(2)}%** change.`
            : `Pasar de **${fmt(v1)}** a **${fmt(v2)}** es una variación del **${signo}${variacion.toFixed(2)}%**.`,
          tone: 'neutral',
          icon: subio ? '📈' : '📉',
        },
      };
    }
    default:
      throw new Error(__lang === 'en' ? 'Unrecognized mode' : 'Modo no reconocido');
  }
}
