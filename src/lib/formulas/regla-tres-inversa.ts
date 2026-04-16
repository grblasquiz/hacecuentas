/**
 * Regla de tres directa e inversa con explicación paso a paso
 */

export interface ReglaTresInversaInputs {
  valor1: number;
  valor2: number;
  valor3: number;
  modo: string;
}

export interface ReglaTresInversaOutputs {
  resultado: number;
  tipo: string;
  formula: string;
  explicacion: string;
}

export function reglaTresInversa(inputs: ReglaTresInversaInputs): ReglaTresInversaOutputs {
  const a = Number(inputs.valor1);
  const b = Number(inputs.valor2);
  const c = Number(inputs.valor3);
  const modo = String(inputs.modo || 'directa');

  if (isNaN(a) || isNaN(b) || isNaN(c)) throw new Error('Ingresá los tres valores numéricos');
  if (a === 0) throw new Error('El valor A no puede ser cero');
  if (modo === 'inversa' && c === 0) throw new Error('El nuevo valor de A no puede ser cero en proporción inversa');

  const fmt = (n: number) => {
    const rounded = Number(n.toFixed(4));
    return new Intl.NumberFormat('es-AR', { maximumFractionDigits: 4 }).format(rounded);
  };

  let resultado: number;
  let formula: string;
  let explicacion: string;
  let tipo: string;

  if (modo === 'inversa') {
    // Inversamente proporcional: A × B = C × X → X = (A × B) / C
    resultado = (a * b) / c;
    tipo = 'Proporción inversa';
    formula = `X = (A × B) / C = (${fmt(a)} × ${fmt(b)}) / ${fmt(c)} = ${fmt(resultado)}`;
    explicacion = `Proporción inversa: si A pasa de ${fmt(a)} a ${fmt(c)}, B pasa de ${fmt(b)} a ${fmt(resultado)}. Cuando una magnitud crece, la otra disminuye proporcionalmente. Verificación: ${fmt(a)} × ${fmt(b)} = ${fmt(a * b)} y ${fmt(c)} × ${fmt(resultado)} = ${fmt(c * resultado)}.`;
  } else {
    // Directamente proporcional: A/B = C/X → X = (B × C) / A
    resultado = (b * c) / a;
    tipo = 'Proporción directa';
    formula = `X = (B × C) / A = (${fmt(b)} × ${fmt(c)}) / ${fmt(a)} = ${fmt(resultado)}`;
    explicacion = `Proporción directa: si A pasa de ${fmt(a)} a ${fmt(c)}, B pasa de ${fmt(b)} a ${fmt(resultado)}. Cuando una magnitud crece, la otra crece proporcionalmente. Verificación: ${fmt(a)} / ${fmt(b)} = ${fmt(a / b)} y ${fmt(c)} / ${fmt(resultado)} = ${fmt(c / resultado)}.`;
  }

  return {
    resultado: Number(resultado.toFixed(4)),
    tipo,
    formula,
    explicacion,
  };
}
