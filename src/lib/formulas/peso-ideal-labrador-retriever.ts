/**
 * Calculadora de Peso Ideal del Labrador Retriever
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
  _chart?: any;
}

const RAZA = {
  macho: { min: 29, max: 36 },
  hembra: { min: 25, max: 32 },
  esperanza: 12,
};

export function pesoIdealLabradorRetriever(inputs: Inputs): Outputs {
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

  const minR = Number(min.toFixed(1));
  const maxR = Number(max.toFixed(1));
  const promR = Number(promedio.toFixed(1));
  const sexoTxt = sexo === 'macho' ? 'macho' : 'hembra';

  const _insight = {
    title: 'Tu Labrador Retriever en su peso',
    text: edad === 'cachorro'
      ? `Tu Labrador ${sexoTxt} todavía está creciendo: de adulto rondará los **${minR} a ${maxR} kg** (promedio **${promR} kg**). Es una raza muy comelona; no uses el "todavía es cachorro" como excusa para sobrealimentarlo.`
      : edad === 'senior'
      ? `Un Labrador ${sexoTxt} senior suele pesar entre **${minR} y ${maxR} kg** (promedio **${promR} kg**), algo menos que en su adultez. Cuidá las articulaciones y evitá que el menor gasto energético se traduzca en sobrepeso.`
      : `Un Labrador ${sexoTxt} de contextura ${contextura} debería pesar entre **${minR} y ${maxR} kg**, con un promedio de **${promR} kg**. Es la raza con mayor tendencia genética a la obesidad: medí la ración y mantené las costillas palpables.`,
    tone: edad === 'senior' ? 'warn' : edad === 'cachorro' ? 'neutral' : 'good',
    icon: '🐶',
  };

  const _chart = {
    type: 'scale',
    marker: promR,
    markerLabel: `Promedio ${promR} kg`,
    min: 0,
    segments: [
      { nombre: 'Bajo peso', max: minR, color: '#f59e0b', colorDark: '#fbbf24' },
      { nombre: 'Peso ideal', max: maxR, color: '#22c55e', colorDark: '#4ade80' },
      { nombre: 'Sobrepeso', max: Number((maxR * 1.3).toFixed(1)), color: '#ef4444', colorDark: '#f87171' },
    ],
    ariaLabel: `Escala de peso: la franja ideal del Labrador Retriever va de ${minR} a ${maxR} kg, con promedio ${promR} kg`,
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
