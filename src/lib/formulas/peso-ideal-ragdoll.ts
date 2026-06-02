/**
 * Calculadora de Peso Ideal del gato Ragdoll
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
  macho: { min: 5, max: 9 },
  hembra: { min: 4, max: 6.5 },
  esperanza: 14,
};

export function pesoIdealRagdoll(inputs: Inputs): Outputs {
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

  const sexoTxt = sexo === 'macho' ? 'Un macho' : 'Una hembra';
  let insightText: string;
  let insightTone = 'neutral';
  if (castrado) {
    insightText = `${sexoTxt} ${contextura} debería pesar entre **${min.toFixed(1)} y ${max.toFixed(1)} kg** (promedio **${promedio.toFixed(1)} kg**). Al estar castrado, su metabolismo baja cerca de **20%**: con la misma comida engorda fácil, así que ajustá la ración o usá un alimento para gatos esterilizados.`;
    insightTone = 'warn';
  } else {
    insightText = `${sexoTxt} ${contextura} en su punto debería pesar entre **${min.toFixed(1)} y ${max.toFixed(1)} kg** (promedio **${promedio.toFixed(1)} kg**). El Ragdoll es una de las razas de gato más grandes, así que ese peso es normal; lo importante es que sea músculo y no grasa abdominal.`;
  }

  return {
    pesoPromedio: Number(promedio.toFixed(1)),
    pesoIdealMin: Number(min.toFixed(1)),
    pesoIdealMax: Number(max.toFixed(1)),
    esperanzaAnios: RAZA.esperanza,
    resumen,
    _insight: {
      title: 'Qué significa este rango',
      text: insightText,
      tone: insightTone,
      icon: '🐱',
    },
  };
}
