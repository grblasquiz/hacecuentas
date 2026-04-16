/**
 * Conversor de pulgadas a centímetros y metros
 * Modos: pulgadas→cm, cm→pulgadas, pies→m, m→pies
 */

export interface PulgadasCentimetrosInputs {
  modo: string;
  longitud: number;
}

export interface PulgadasCentimetrosOutputs {
  resultado: string;
  formula: string;
  explicacion: string;
}

export function pulgadasCentimetros(inputs: PulgadasCentimetrosInputs): PulgadasCentimetrosOutputs {
  const modo = inputs.modo || 'pulgadas-a-cm';
  const valor = Number(inputs.longitud);

  if (isNaN(valor)) throw new Error('Ingresá un valor de longitud válido');
  if (valor < 0) throw new Error('La longitud no puede ser negativa');

  const fmt = (n: number) => new Intl.NumberFormat('es-AR', { maximumFractionDigits: 4 }).format(n);

  switch (modo) {
    case 'pulgadas-a-cm': {
      const r = valor * 2.54;
      return {
        resultado: `${fmt(r)} cm`,
        formula: `cm = pulgadas × 2,54 = ${fmt(valor)} × 2,54 = ${fmt(r)}`,
        explicacion: `${fmt(valor)} pulgadas equivalen a **${fmt(r)} centímetros**. La pulgada (inch) mide exactamente 2,54 cm por definición internacional desde 1959. Se usa en pantallas (TV, celulares), herramientas y medidas de EE.UU./Reino Unido.`,
      };
    }
    case 'cm-a-pulgadas': {
      const r = valor / 2.54;
      return {
        resultado: `${fmt(r)} pulgadas`,
        formula: `pulgadas = cm ÷ 2,54 = ${fmt(valor)} ÷ 2,54 = ${fmt(r)}`,
        explicacion: `${fmt(valor)} centímetros equivalen a **${fmt(r)} pulgadas**. Para una estimación rápida, dividí los cm por 2,5.`,
      };
    }
    case 'pies-a-m': {
      const r = valor * 0.3048;
      return {
        resultado: `${fmt(r)} m`,
        formula: `m = pies × 0,3048 = ${fmt(valor)} × 0,3048 = ${fmt(r)}`,
        explicacion: `${fmt(valor)} pies equivalen a **${fmt(r)} metros**. Un pie (foot) equivale exactamente a 0,3048 metros o 30,48 centímetros. Se usa para medir alturas de personas, habitaciones y edificios en EE.UU.`,
      };
    }
    case 'm-a-pies': {
      const r = valor / 0.3048;
      return {
        resultado: `${fmt(r)} pies`,
        formula: `pies = m ÷ 0,3048 = ${fmt(valor)} ÷ 0,3048 = ${fmt(r)}`,
        explicacion: `${fmt(valor)} metros equivalen a **${fmt(r)} pies**. Para una estimación rápida, multiplicá los metros por 3,28.`,
      };
    }
    default:
      throw new Error('Modo no reconocido. Elegí pulgadas→cm, cm→pulgadas, pies→m o m→pies.');
  }
}
