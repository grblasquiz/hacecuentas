/**
 * Calculadora de Peso Ideal del Husky Siberiano
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
  macho: { min: 20, max: 27 },
  hembra: { min: 16, max: 23 },
  esperanza: 13,
};

export function pesoIdealHuskySiberiano(inputs: Inputs): Outputs {
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
    title: 'Tu Husky Siberiano en su peso',
    text: edad === 'cachorro'
      ? `Tu Husky ${sexoTxt} todavía está creciendo: de adulto rondará los **${minR} a ${maxR} kg** (promedio **${promR} kg**). El Husky es de constitución atlética y liviana para su tamaño; no lo sobrealimentes buscando "que engorde".`
      : edad === 'senior'
      ? `Un Husky ${sexoTxt} senior suele pesar entre **${minR} y ${maxR} kg** (promedio **${promR} kg**), algo menos que en su adultez. Mantené la masa muscular con actividad regular y controlá descensos bruscos.`
      : `Un Husky ${sexoTxt} de contextura ${contextura} debería pesar entre **${minR} y ${maxR} kg**, con un promedio de **${promR} kg**. Es un atleta nato: bajo el manto de pelo conviene palpar las costillas para confirmar que está fibroso y no relleno.`,
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
    ariaLabel: `Escala de peso: la franja ideal del Husky Siberiano va de ${minR} a ${maxR} kg, con promedio ${promR} kg`,
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
