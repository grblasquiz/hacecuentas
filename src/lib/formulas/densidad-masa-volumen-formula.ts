/** Densidad ρ = m/V: calcular densidad, masa o volumen en g y cm³, con conversión a kg/m³ y test de flotación */
export interface Inputs {
  calcular?: string;
  masa?: number;
  volumen?: number;
  densidad?: number;
  __lang?: string;
}
export interface Outputs {
  resultado: number;
  densidadGcm3: number;
  densidadKgm3: number;
  flota: string;
  formula: string;
  _insight?: any;
}

export function densidadMasaVolumenFormula(i: Inputs): Outputs {
  const calcular = String(i.calcular || 'densidad');
  const masa = Number(i.masa) || 0;
  const volumen = Number(i.volumen) || 0;
  const densidad = Number(i.densidad) || 0;

  let resultado = 0;
  let rho = 0;
  let formula = '';
  let insightText = '';

  if (calcular === 'densidad') {
    if (masa <= 0) throw new Error('Ingresá una masa mayor a cero');
    if (volumen <= 0) throw new Error('Ingresá un volumen mayor a cero');
    rho = masa / volumen;
    resultado = Number(rho.toFixed(4));
    formula = `ρ = m ÷ V = ${masa} g ÷ ${volumen} cm³ = ${resultado} g/cm³`;
    insightText = `Con **${masa} g en ${volumen} cm³**, la densidad es **${resultado} g/cm³** (${Number((rho * 1000).toFixed(2))} kg/m³).`;
  } else if (calcular === 'masa') {
    if (densidad <= 0) throw new Error('Ingresá una densidad mayor a cero');
    if (volumen <= 0) throw new Error('Ingresá un volumen mayor a cero');
    rho = densidad;
    resultado = Number((densidad * volumen).toFixed(4));
    formula = `m = ρ × V = ${densidad} g/cm³ × ${volumen} cm³ = ${resultado} g`;
    insightText = `Un volumen de **${volumen} cm³** con densidad **${densidad} g/cm³** pesa **${resultado} g** (${Number((resultado / 1000).toFixed(4))} kg).`;
  } else if (calcular === 'volumen') {
    if (densidad <= 0) throw new Error('Ingresá una densidad mayor a cero');
    if (masa <= 0) throw new Error('Ingresá una masa mayor a cero');
    rho = densidad;
    resultado = Number((masa / densidad).toFixed(4));
    formula = `V = m ÷ ρ = ${masa} g ÷ ${densidad} g/cm³ = ${resultado} cm³`;
    insightText = `Una masa de **${masa} g** con densidad **${densidad} g/cm³** ocupa **${resultado} cm³** (${Number((resultado / 1000).toFixed(4))} litros).`;
  } else {
    throw new Error('Elegí qué calcular: densidad, masa o volumen');
  }

  const densidadGcm3 = Number(rho.toFixed(4));
  const densidadKgm3 = Number((rho * 1000).toFixed(2));
  const flota =
    rho < 1
      ? `Sí, flota en agua (ρ = ${densidadGcm3} < 1.00 g/cm³)`
      : rho === 1
        ? 'Queda en equilibrio: misma densidad que el agua (1.00 g/cm³)'
        : `No, se hunde en agua (ρ = ${densidadGcm3} > 1.00 g/cm³)`;

  return {
    resultado,
    densidadGcm3,
    densidadKgm3,
    flota,
    formula,
    _insight: {
      title: 'Qué te dice el resultado',
      text: `${insightText} ${rho < 1 ? 'Como su densidad es menor que la del agua (1.00 g/cm³), **flota**.' : rho > 1 ? 'Como su densidad es mayor que la del agua (1.00 g/cm³), **se hunde**.' : 'Con la misma densidad que el agua, queda suspendido sin hundirse ni flotar.'} Recordá: 1 g/cm³ = 1000 kg/m³ y 1 cm³ = 1 ml.`,
      tone: 'neutral',
      icon: '⚗️',
    },
  };
}
