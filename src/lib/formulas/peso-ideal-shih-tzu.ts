/**
 * Calculadora de Peso Ideal del Shih Tzu
 * Lookup por sexo + contextura + edad, rango oficial FCI/AKC.
 */

export interface Inputs {
  sexo: string;
  contextura: string;
  edad: string;
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
  macho: { min: 4, max: 7.5 },
  hembra: { min: 4, max: 7.5 },
  esperanza: 13,
};

export function pesoIdealShihTzu(inputs: Inputs): Outputs {
  const sexo = String(inputs.sexo || 'macho');
  const contextura = String(inputs.contextura || 'mediana');
  const edad = String(inputs.edad || 'adulto');

  if (sexo !== 'macho' && sexo !== 'hembra') throw new Error('Sexo inválido');

  const base = sexo === 'macho' ? RAZA.macho : RAZA.hembra;
  let min = base.min;
  let max = base.max;
  const range = max - min;

  if (contextura === 'pequena') {
    max = min + range * 0.45;
  } else if (contextura === 'grande') {
    min = max - range * 0.45;
  } else {
    min = min + range * 0.25;
    max = max - range * 0.1;
  }

  // Ajuste por edad (cachorro: rango indicado solo es referencia adulta)
  let resumen = `${sexo === 'macho' ? 'Macho' : 'Hembra'} ${contextura}: peso ideal ${min.toFixed(1)}-${max.toFixed(1)} kg`;
  if (edad === 'cachorro') {
    resumen = `Cachorro: todavía en crecimiento. Peso final esperado ${min.toFixed(1)}-${max.toFixed(1)} kg (adulto).`;
  } else if (edad === 'senior') {
    resumen = `Senior: podría bajar un 5-10% del peso de adulto. Rango ${(min*0.9).toFixed(1)}-${max.toFixed(1)} kg.`;
    min = min * 0.9;
  }

  const promedio = (min + max) / 2;

  let insightText: string;
  let insightTone = 'neutral';
  if (edad === 'cachorro') {
    insightText = `Todavía en crecimiento: el Shih Tzu alcanza su peso adulto cerca de los 10-12 meses. Debería estabilizarse entre **${min.toFixed(1)} y ${max.toFixed(1)} kg**. En una raza tan chica, un par de kilos de más pesan muchísimo: cuidá las porciones desde cachorro.`;
  } else if (edad === 'senior') {
    insightText = `Un Shih Tzu senior puede afinarse un poco: un rango de **${min.toFixed(1)}-${max.toFixed(1)} kg** es esperable. Vigilá que no engorde por el sedentarismo de la edad, que recarga su columna.`;
    insightTone = 'warn';
  } else {
    insightText = `En su punto debería pesar entre **${min.toFixed(1)} y ${max.toFixed(1)} kg** (promedio **${promedio.toFixed(1)} kg**). Al ser braquicéfalo, el sobrepeso le complica la respiración: mantenerlo en ese rango es clave para que respire y se mueva cómodo.`;
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
      icon: '🐶',
    },
  };
}
