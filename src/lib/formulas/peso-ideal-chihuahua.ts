/**
 * Calculadora de Peso Ideal del Chihuahua
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
  macho: { min: 1.5, max: 3 },
  hembra: { min: 1.5, max: 3 },
  esperanza: 15,
};

export function pesoIdealChihuahua(inputs: Inputs): Outputs {
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

  const _insight = edad === 'cachorro'
    ? {
        title: 'Todavía está creciendo',
        text: `Como cachorro aún no llegó a su peso adulto. De adulto, un Chihuahua ${contextura} debería pesar entre **${min.toFixed(1)} y ${max.toFixed(1)} kg**. Pesalo cada semana para seguir la curva de crecimiento.`,
        tone: 'neutral',
        icon: '🐶',
      }
    : edad === 'senior'
    ? {
        title: 'Etapa senior: vigilá el peso',
        text: `Un Chihuahua senior suele perder un 5-10% respecto al adulto. Su rango saludable ahora es **${min.toFixed(1)}-${max.toFixed(1)} kg** (promedio **${promedio.toFixed(1)} kg**). Una baja brusca o continua amerita consulta veterinaria.`,
        tone: 'warn',
        icon: '🐾',
      }
    : {
        title: 'Peso ideal de tu Chihuahua',
        text: `Para un macho/hembra ${contextura} adulto, el peso saludable ronda los **${promedio.toFixed(1)} kg** (rango **${min.toFixed(1)}-${max.toFixed(1)} kg**). Por encima de ${max.toFixed(1)} kg conviene ajustar la ración: el sobrepeso recorta los ~${RAZA.esperanza} años de esperanza de vida de la raza.`,
        tone: 'neutral',
        icon: '🐕',
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
