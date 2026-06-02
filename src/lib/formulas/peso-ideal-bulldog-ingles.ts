/**
 * Calculadora de Peso Ideal del Bulldog Inglés
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
  macho: { min: 23, max: 25 },
  hembra: { min: 18, max: 23 },
  esperanza: 9,
};

export function pesoIdealBulldogIngles(inputs: Inputs): Outputs {
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

  let insightText: string;
  if (edad === 'cachorro') {
    insightText = `Tu Bulldog Inglés cachorro todavía está creciendo: de adulto debería rondar **${minR}–${maxR} kg**. Cuidá que no engorde de chico, porque el exceso de peso castiga sus articulaciones desde temprano.`;
  } else if (edad === 'senior') {
    insightText = `En un Bulldog Inglés senior es normal perder algo de peso: el rango baja a **${minR}–${maxR} kg**. Mantenerlo liviano alivia articulaciones y respiración, dos puntos débiles de la raza.`;
  } else {
    insightText = `Un Bulldog Inglés ${sexoTxt} de contextura ${contextura} debería pesar entre **${minR} y ${maxR} kg** (centro ideal **${promR} kg**). Cada kilo de más recarga sus articulaciones y su respiración braquicéfala, así que conviene no pasarse del rango.`;
  }

  return {
    pesoPromedio: promR,
    pesoIdealMin: minR,
    pesoIdealMax: maxR,
    esperanzaAnios: RAZA.esperanza,
    resumen,
    _insight: {
      title: 'Lectura del peso ideal',
      text: insightText,
      tone: 'neutral',
      icon: '🐶',
    },
    _chart: {
      type: 'scale',
      marker: promR,
      markerLabel: `Centro ideal ${promR} kg`,
      min: 0,
      segments: [
        { nombre: 'Bajo peso', max: minR, color: '#f59e0b', colorDark: '#fbbf24' },
        { nombre: 'Peso ideal', max: maxR, color: '#16a34a', colorDark: '#22c55e' },
        { nombre: 'Sobrepeso', max: Number((maxR * 1.3).toFixed(1)), color: '#dc2626', colorDark: '#ef4444' },
      ],
      ariaLabel: `Escala de peso del Bulldog Inglés: zona ideal ${minR} a ${maxR} kg, con el centro en ${promR} kg`,
    },
  };
}
