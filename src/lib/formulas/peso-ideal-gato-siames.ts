/**
 * Calculadora de Peso Ideal del gato Siamés
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
}

const RAZA = {
  macho: { min: 3.5, max: 5.5 },
  hembra: { min: 2.5, max: 4.5 },
  esperanza: 16,
};

export function pesoIdealGatoSiames(inputs: Inputs): Outputs {
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

  return {
    pesoPromedio: Number(promedio.toFixed(1)),
    pesoIdealMin: Number(min.toFixed(1)),
    pesoIdealMax: Number(max.toFixed(1)),
    esperanzaAnios: RAZA.esperanza,
    resumen,
  };
}
