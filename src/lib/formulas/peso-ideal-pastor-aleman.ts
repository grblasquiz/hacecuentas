/**
 * Calculadora de Peso Ideal del Pastor Alemán
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
  macho: { min: 30, max: 40 },
  hembra: { min: 22, max: 32 },
  esperanza: 11,
};

export function pesoIdealPastorAleman(inputs: Inputs): Outputs {
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

  const sexoTxt = sexo === 'macho' ? 'Un macho' : 'Una hembra';
  let insightText: string;
  let insightTone = 'neutral';
  if (edad === 'cachorro') {
    insightText = `Todavía está creciendo: el Pastor Alemán completa su desarrollo recién a los 18-24 meses. ${sexoTxt} ${contextura} debería estabilizarse entre **${min.toFixed(1)} y ${max.toFixed(1)} kg** de adulto. No te guíes por el peso ahora; controlá que coma según su etapa.`;
  } else if (edad === 'senior') {
    insightText = `${sexoTxt} senior suele perder algo de masa muscular: un rango de **${min.toFixed(1)}-${max.toFixed(1)} kg** es esperable. Vigilá que la baja sea gradual; una caída brusca amerita control veterinario.`;
    insightTone = 'warn';
  } else {
    insightText = `${sexoTxt} ${contextura} en su punto debería pesar entre **${min.toFixed(1)} y ${max.toFixed(1)} kg** (promedio **${promedio.toFixed(1)} kg**). Como raza propensa a displasia de cadera, mantenerlo en ese rango y no por encima protege sus articulaciones.`;
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
      icon: '🐕‍🦺',
    },
  };
}
