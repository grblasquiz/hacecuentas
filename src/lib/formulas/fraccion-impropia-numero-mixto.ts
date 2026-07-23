/** Conversión fracción impropia ↔ número mixto, con simplificación por MCD */
export interface Inputs {
  modo?: string;
  numerador?: number;
  denominador?: number;
  entero?: number;
  __lang?: string;
}
export interface Outputs {
  resultado: string;
  simplificada: string;
  decimal: number;
  formula: string;
  _insight?: any;
}

function mcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    [a, b] = [b, a % b];
  }
  return a || 1;
}

export function fraccionImpropiaNumeroMixto(i: Inputs): Outputs {
  const modo = String(i.modo || 'impropia-mixto');
  const numerador = Number(i.numerador);
  const denominador = Number(i.denominador);
  const entero = Number(i.entero) || 0;

  if (Number.isNaN(numerador) || Number.isNaN(denominador)) {
    throw new Error('Ingresá numerador y denominador');
  }
  if (denominador === 0) throw new Error('El denominador no puede ser 0: no se puede dividir por cero');
  if (!Number.isInteger(numerador) || !Number.isInteger(denominador) || !Number.isInteger(entero)) {
    throw new Error('Usá números enteros para numerador, denominador y parte entera');
  }
  if (numerador < 0 || denominador < 0 || entero < 0) {
    throw new Error('Ingresá valores positivos (la calculadora trabaja con fracciones positivas)');
  }

  let resultado = '';
  let simplificada = '';
  let formula = '';
  let decimal = 0;
  let insightText = '';

  if (modo === 'mixto-impropia') {
    // mixto → impropia: (entero × den + num) / den
    const numImpropio = entero * denominador + numerador;
    const g = mcd(numImpropio, denominador);
    const ns = numImpropio / g;
    const ds = denominador / g;
    decimal = numImpropio / denominador;
    resultado = ds === 1 ? `${ns}` : `${numImpropio}/${denominador}`;
    simplificada = ds === 1 ? `${ns}` : `${ns}/${ds}`;
    formula = `(${entero} × ${denominador} + ${numerador}) / ${denominador} = ${numImpropio}/${denominador}`;
    insightText = `El número mixto **${entero} ${numerador}/${denominador}** equivale a la fracción impropia **${numImpropio}/${denominador}**${g > 1 ? `, que simplificada por el MCD ${g} queda **${simplificada}**` : ''}. En decimal: **${Number(decimal.toFixed(4)).toLocaleString('es-AR')}**.`;
  } else {
    // impropia → mixto
    const g = mcd(numerador, denominador);
    const ns = numerador / g;
    const ds = denominador / g;
    const parteEntera = Math.floor(ns / ds);
    const resto = ns % ds;
    decimal = numerador / denominador;
    simplificada = ds === 1 ? `${ns}` : `${ns}/${ds}`;
    if (resto === 0) {
      resultado = `${parteEntera}`;
      formula = `${numerador} ÷ ${denominador} = ${parteEntera} exacto (resto 0)`;
      insightText = `**${numerador}/${denominador}** no deja resto: es exactamente el entero **${parteEntera}**.`;
    } else if (parteEntera === 0) {
      resultado = simplificada;
      formula = `${numerador} < ${denominador}: la fracción ya es propia (${simplificada})`;
      insightText = `**${numerador}/${denominador}** es una fracción **propia** (el numerador es menor que el denominador), así que no tiene parte entera: simplificada queda **${simplificada}** = ${Number(decimal.toFixed(4)).toLocaleString('es-AR')}.`;
    } else {
      resultado = `${parteEntera} ${resto}/${ds}`;
      formula = `${ns} ÷ ${ds} = ${parteEntera}, resto ${resto} → ${parteEntera} ${resto}/${ds}`;
      insightText = `La fracción impropia **${numerador}/${denominador}** equivale al número mixto **${parteEntera} ${resto}/${ds}**: ${parteEntera} unidades enteras más ${resto}/${ds}. En decimal: **${Number(decimal.toFixed(4)).toLocaleString('es-AR')}**.`;
    }
  }

  return {
    resultado,
    simplificada,
    decimal: Number(decimal.toFixed(4)),
    formula,
    _insight: {
      title: 'Qué te dice el resultado',
      text: insightText,
      tone: 'neutral',
      icon: '➗',
    },
  };
}
