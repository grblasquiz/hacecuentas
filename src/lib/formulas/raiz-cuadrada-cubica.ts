/**
 * Calculadora de raíz cuadrada, cúbica y n-ésima
 * Modos: raíz cuadrada (√), raíz cúbica (∛), raíz n-ésima
 */

export interface RaizCuadradaCubicaInputs {
  modo: string;
  numero: number;
  indice: number;
}

export interface RaizCuadradaCubicaOutputs {
  resultado: string;
  formula: string;
  explicacion: string;
  esPerfecta: string;
}

export function raizCuadradaCubica(inputs: RaizCuadradaCubicaInputs): RaizCuadradaCubicaOutputs {
  const modo = inputs.modo || 'cuadrada';
  const num = Number(inputs.numero);
  const indice = Number(inputs.indice) || 2;

  if (isNaN(num)) throw new Error('Ingresá un número válido');

  const fmt = (n: number) => new Intl.NumberFormat('es-AR', { maximumFractionDigits: 6 }).format(n);

  switch (modo) {
    case 'cuadrada': {
      if (num < 0) throw new Error('No existe raíz cuadrada de un número negativo en los reales');
      const r = Math.sqrt(num);
      const perfecta = Number.isInteger(r);
      return {
        resultado: fmt(r),
        formula: `√${fmt(num)} = ${fmt(num)}^(1/2) = ${fmt(r)}`,
        explicacion: `La raíz cuadrada de ${fmt(num)} es **${fmt(r)}**. ${perfecta ? `Es una raíz perfecta porque ${fmt(r)} × ${fmt(r)} = ${fmt(num)}.` : `No es una raíz perfecta (el resultado es irracional). El cuadrado perfecto más cercano es ${fmt(Math.round(r) ** 2)}.`}`,
        esPerfecta: perfecta ? `Sí — ${fmt(r)}² = ${fmt(num)}` : `No — ${fmt(r)} es un número irracional`,
      };
    }
    case 'cubica': {
      const r = Math.cbrt(num);
      const perfecta = Math.abs(Math.round(r) ** 3 - num) < 1e-9;
      return {
        resultado: fmt(r),
        formula: `∛${fmt(num)} = ${fmt(num)}^(1/3) = ${fmt(r)}`,
        explicacion: `La raíz cúbica de ${fmt(num)} es **${fmt(r)}**. ${perfecta ? `Es una raíz perfecta porque ${fmt(Math.round(r))} × ${fmt(Math.round(r))} × ${fmt(Math.round(r))} = ${fmt(num)}.` : `No es una raíz cúbica perfecta.`}${num < 0 ? ' La raíz cúbica acepta números negativos porque un número negativo elevado al cubo da negativo.' : ''}`,
        esPerfecta: perfecta ? `Sí — ${fmt(Math.round(r))}³ = ${fmt(num)}` : `No — ${fmt(r)} es un número irracional`,
      };
    }
    case 'n-esima': {
      if (indice <= 0 || !Number.isInteger(indice)) throw new Error('El índice debe ser un entero positivo');
      if (indice === 0) throw new Error('El índice de la raíz no puede ser 0');
      if (num < 0 && indice % 2 === 0) throw new Error('No existe raíz de índice par de un número negativo en los reales');

      let r: number;
      if (num < 0) {
        r = -Math.pow(-num, 1 / indice);
      } else {
        r = Math.pow(num, 1 / indice);
      }

      const roundedR = Math.round(r);
      const perfecta = Math.abs(Math.pow(roundedR, indice) - num) < 1e-9;

      return {
        resultado: fmt(r),
        formula: `${indice}√${fmt(num)} = ${fmt(num)}^(1/${indice}) = ${fmt(r)}`,
        explicacion: `La raíz ${indice}-ésima de ${fmt(num)} es **${fmt(r)}**. ${perfecta ? `Es perfecta: ${fmt(roundedR)}^${indice} = ${fmt(num)}.` : 'No es una raíz perfecta.'}`,
        esPerfecta: perfecta ? `Sí — ${fmt(roundedR)}^${indice} = ${fmt(num)}` : `No — ${fmt(r)} es un número irracional`,
      };
    }
    default:
      throw new Error('Modo no reconocido. Elegí raíz cuadrada (√), cúbica (∛) o n-ésima.');
  }
}
