/**
 * Calculadora de Peso Ideal del gato Persa
 */

export interface Inputs {
  sexo: string;
  contextura: string;
  castrado: string;
}

export interface Outputs {
  pesoPromedio: number;
  pesoIdealMin: number;
  pesoIdealMax: number;
  esperanzaAnios: number;
  resumen: string;
  _insight?: any;
  _chart?: any;
}

const RAZA = {
  macho: { min: 4, max: 7 },
  hembra: { min: 3, max: 5 },
  esperanza: 14,
};

export function pesoIdealGatoPersa(inputs: Inputs): Outputs {
  const sexo = String(inputs.sexo || 'macho');
  const contextura = String(inputs.contextura || 'mediana');
  const castrado = String(inputs.castrado || 'no') === 'si';

  if (sexo !== 'macho' && sexo !== 'hembra') throw new Error('Sexo inválido');

  const base = sexo === 'macho' ? RAZA.macho : RAZA.hembra;
  let min = base.min;
  let max = base.max;
  const range = max - min;

  if (contextura === 'pequena') {
    max = min + range * 0.5;
  } else if (contextura === 'grande') {
    min = max - range * 0.5;
  } else {
    min = min + range * 0.25;
    max = max - range * 0.1;
  }

  const promedio = (min + max) / 2;

  let resumen = `${sexo === 'macho' ? 'Macho' : 'Hembra'} ${contextura}: peso ideal ${min.toFixed(1)}-${max.toFixed(1)} kg`;
  if (castrado) {
    resumen += '. Castrado: cuidá no sobrealimentar (metabolismo 20% menor).';
  }

  const minR = Number(min.toFixed(1));
  const maxR = Number(max.toFixed(1));
  const promR = Number(promedio.toFixed(1));

  const _insight = {
    title: 'Tu Persa en su peso',
    text: castrado
      ? `Un Persa ${sexo === 'macho' ? 'macho' : 'hembra'} de contextura ${contextura} debería pesar entre **${minR} y ${maxR} kg** (promedio **${promR} kg**). Al estar castrado, su metabolismo baja ~20%: pesalo cada mes y ajustá la ración para no pasarte del rango.`
      : `Un Persa ${sexo === 'macho' ? 'macho' : 'hembra'} de contextura ${contextura} debería pesar entre **${minR} y ${maxR} kg**, con un promedio de **${promR} kg**. Pesalo cada 1-2 meses: si se va por encima del rango, recortá las porciones.`,
    tone: castrado ? 'warn' : 'neutral',
    icon: '🐱',
  };

  const _chart = {
    type: 'scale',
    marker: promR,
    markerLabel: `Promedio ${promR} kg`,
    min: 0,
    segments: [
      { nombre: 'Bajo peso', max: minR, color: '#f59e0b', colorDark: '#fbbf24' },
      { nombre: 'Peso ideal', max: maxR, color: '#22c55e', colorDark: '#4ade80' },
      { nombre: 'Sobrepeso', max: Number((maxR * 1.4).toFixed(1)), color: '#ef4444', colorDark: '#f87171' },
    ],
    ariaLabel: `Escala de peso: la franja ideal del Persa va de ${minR} a ${maxR} kg, con promedio ${promR} kg`,
  };

  return {
    pesoPromedio: promR,
    pesoIdealMin: minR,
    pesoIdealMax: maxR,
    esperanzaAnios: RAZA.esperanza,
    resumen,
    _insight,
    _chart,
  };
}
