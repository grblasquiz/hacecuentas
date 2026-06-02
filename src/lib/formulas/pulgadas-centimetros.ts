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
  _insight?: any;
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
        _insight: {
          title: 'Tu conversión',
          text: `**${fmt(valor)} in = ${fmt(r)} cm**. Multiplicá pulgadas por 2,54 para pasar a centímetros. Ojo: en pantallas las pulgadas miden la **diagonal**, no el ancho.`,
          tone: 'neutral',
          icon: '📐',
        },
      };
    }
    case 'cm-a-pulgadas': {
      const r = valor / 2.54;
      return {
        resultado: `${fmt(r)} pulgadas`,
        formula: `pulgadas = cm ÷ 2,54 = ${fmt(valor)} ÷ 2,54 = ${fmt(r)}`,
        explicacion: `${fmt(valor)} centímetros equivalen a **${fmt(r)} pulgadas**. Para una estimación rápida, dividí los cm por 2,5.`,
        _insight: {
          title: 'Tu conversión',
          text: `**${fmt(valor)} cm = ${fmt(r)} in**. Dividí los centímetros por 2,54 (o por 2,5 para una estimación rápida de cabeza).`,
          tone: 'neutral',
          icon: '📐',
        },
      };
    }
    case 'pies-a-m': {
      const r = valor * 0.3048;
      return {
        resultado: `${fmt(r)} m`,
        formula: `m = pies × 0,3048 = ${fmt(valor)} × 0,3048 = ${fmt(r)}`,
        explicacion: `${fmt(valor)} pies equivalen a **${fmt(r)} metros**. Un pie (foot) equivale exactamente a 0,3048 metros o 30,48 centímetros. Se usa para medir alturas de personas, habitaciones y edificios en EE.UU.`,
        _insight: {
          title: 'Tu conversión',
          text: `**${fmt(valor)} ft = ${fmt(r)} m**. Cada pie son 0,3048 m (30,48 cm). Recordá que 1 pie = 12 pulgadas si venís de una medida en pies y pulgadas.`,
          tone: 'neutral',
          icon: '📐',
        },
      };
    }
    case 'm-a-pies': {
      const r = valor / 0.3048;
      return {
        resultado: `${fmt(r)} pies`,
        formula: `pies = m ÷ 0,3048 = ${fmt(valor)} ÷ 0,3048 = ${fmt(r)}`,
        explicacion: `${fmt(valor)} metros equivalen a **${fmt(r)} pies**. Para una estimación rápida, multiplicá los metros por 3,28.`,
        _insight: {
          title: 'Tu conversión',
          text: `**${fmt(valor)} m = ${fmt(r)} ft**. Multiplicá los metros por 3,28 para tener los pies de cabeza.`,
          tone: 'neutral',
          icon: '📐',
        },
      };
    }
    default:
      throw new Error('Modo no reconocido. Elegí pulgadas→cm, cm→pulgadas, pies→m o m→pies.');
  }
}
