/**
 * Calculadora de Peso Ideal del gato British Shorthair
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
}

const RAZA = {
  macho: { min: 5, max: 8 },
  hembra: { min: 3.5, max: 5.5 },
  esperanza: 15,
};

export function pesoIdealGatoBritanico(inputs: Inputs): Outputs {
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

  const _insight = castrado
    ? {
        title: 'Castrado: vigilá las porciones',
        text: `Un British Shorthair ${sexo === 'macho' ? 'macho' : 'hembra'} ${contextura} debería pesar **${min.toFixed(1)}-${max.toFixed(1)} kg** (promedio **${promedio.toFixed(1)} kg**). Al estar castrado, su metabolismo baja ~20%: con la misma ración tiende a engordar, así que medí la comida y elegí un alimento "light/esterilizado".`,
        tone: 'warn',
        icon: '🐈',
      }
    : {
        title: 'Peso ideal de tu British Shorthair',
        text: `Un ${sexo === 'macho' ? 'macho' : 'hembra'} ${contextura} debería pesar **${min.toFixed(1)}-${max.toFixed(1)} kg** (promedio **${promedio.toFixed(1)} kg**). Es una raza naturalmente robusta y maciza, pero por encima de ${max.toFixed(1)} kg ya hablamos de sobrepeso, no de "porte grande".`,
        tone: 'neutral',
        icon: '🐱',
      };

  return {
    pesoPromedio: Number(promedio.toFixed(1)),
    pesoIdealMin: Number(min.toFixed(1)),
    pesoIdealMax: Number(max.toFixed(1)),
    esperanzaAnios: RAZA.esperanza,
    resumen,
    _insight,
  };
}
