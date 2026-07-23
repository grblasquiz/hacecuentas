/**
 * Calculadora de Peso Ideal del Boxer
 * Rango adulto FCI/AKC por sexo y contextura + curva de crecimiento del cachorro.
 *
 * Si la edad elegida es un cachorro (m2, m3, …) devuelve el peso esperado A ESA
 * EDAD, no el rango adulto: es lo que la gente busca ("cuánto debe pesar un
 * boxer de 2 meses"). Ver src/lib/formulas/_puppy-growth.ts.
 */

import { tamanoPorPeso, pesoALosMeses, mesesDeEdad, serieCrecimiento, fmtKg } from './_puppy-growth';

export interface Inputs {
  sexo: string;
  contextura: string;
  edad: string;
}

export interface Outputs {
  pesoPromedio: number;
  pesoIdealMin: number;
  pesoIdealMax: number;
  pesoAdultoEstimado: number;
  porcentajeCrecimiento: number;
  esperanzaAnios: number;
  resumen: string;
  _insight?: any;
  _charts?: any[];
}

const RAZA = {
  macho: { min: 27, max: 32 },
  hembra: { min: 25, max: 29 },
  esperanza: 11,
};

const TAMANO = tamanoPorPeso((27 + 32 + 25 + 29) / 4);

export function pesoIdealBoxer(inputs: Inputs): Outputs {
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

  // Rango adulto ya ajustado por contextura — es la base de toda la curva.
  const adultoMin = min;
  const adultoMax = max;
  const adultoProm = Number(((adultoMin + adultoMax) / 2).toFixed(1));

  const meses = mesesDeEdad(edad);
  const sexoTxt = sexo === 'macho' ? 'macho' : 'hembra';
  const sexoArt = sexo === 'macho' ? 'Un' : 'Una';

  let resumen: string;
  let porcentaje = 100;
  let insightTitle: string;
  let insightText: string;
  let insightTone = 'good';

  if (meses !== null) {
    // ── Cachorro: peso esperado A ESA EDAD ────────────────────────────
    const p = pesoALosMeses(adultoMin, adultoMax, meses, TAMANO);
    min = p.min;
    max = p.max;
    porcentaje = p.porcentaje;
    resumen = `A los ${meses} meses un Boxer ${sexoTxt} pesa entre ${fmtKg(p.min)} y ${fmtKg(p.max)} kg (${p.porcentaje}% de su peso adulto).`;
    insightTitle = `Tu cachorro a los ${meses} meses`;
    insightText = `${sexoArt} Boxer ${sexoTxt} de **${meses} meses** debería pesar entre **${fmtKg(p.min)} y ${fmtKg(p.max)} kg** — cerca del **${p.porcentaje}%** de su peso adulto. De grande va a rondar los **${fmtKg(adultoMin)} a ${fmtKg(adultoMax)} kg**, y termina de crecer alrededor de los **${p.cierreMeses} meses**. Que esté algo por debajo o por encima no alarma: lo que importa es que la curva suba parejo y que las costillas se palpen sin apretar.`;
    insightTone = 'neutral';
  } else if (edad === 'senior') {
    min = adultoMin * 0.9;
    max = adultoMax;
    resumen = `Senior: podría bajar un 5-10% del peso de adulto. Rango ${fmtKg(min)}-${fmtKg(max)} kg.`;
    insightTitle = 'Tu Boxer senior';
    insightText = `${sexoArt} Boxer ${sexoTxt} senior suele pesar entre **${fmtKg(min)} y ${fmtKg(max)} kg**, algo menos que en su adultez por la pérdida natural de masa muscular. Si baja de golpe o pierde tono muscular notorio, conviene un control veterinario.`;
    insightTone = 'warn';
  } else {
    resumen = `${sexo === 'macho' ? 'Macho' : 'Hembra'} ${contextura}: peso ideal ${fmtKg(min)}-${fmtKg(max)} kg`;
    insightTitle = 'Tu Boxer en su peso';
    insightText = `${sexoArt} Boxer ${sexoTxt} de contextura ${contextura} debería pesar entre **${fmtKg(min)} y ${fmtKg(max)} kg** (promedio **${fmtKg(adultoProm)} kg**). Guiate también por el Body Condition Score: costillas palpables sin apretar y cintura visible desde arriba valen más que el número de la balanza.`;
  }

  const minR = Number(min.toFixed(1));
  const maxR = Number(max.toFixed(1));
  const promR = Number(((min + max) / 2).toFixed(1));

  // Gráfico 1: dónde cae el peso esperado dentro de la escala.
  const chartEscala = {
    type: 'scale',
    label: meses !== null ? `Peso a los ${meses} meses` : 'Escala de peso',
    marker: promR,
    markerLabel: `Promedio ${fmtKg(promR)} kg`,
    min: 0,
    unit: 'kg',
    segments: [
      { nombre: 'Bajo peso', max: minR, color: '#f59e0b', colorDark: '#fbbf24' },
      { nombre: 'Peso ideal', max: maxR, color: '#22c55e', colorDark: '#4ade80' },
      { nombre: 'Sobrepeso', max: Number((maxR * 1.3).toFixed(1)), color: '#ef4444', colorDark: '#f87171' },
    ],
    ariaLabel: `Escala de peso: la franja ideal va de ${fmtKg(minR)} a ${fmtKg(maxR)} kg, con promedio ${fmtKg(promR)} kg`,
  };

  // Gráfico 2: curva de crecimiento completa, con el punto del usuario marcado.
  const serie = serieCrecimiento(adultoMin, adultoMax, TAMANO);
  const chartCurva = {
    type: 'line',
    label: 'Curva de crecimiento',
    data: {
      labels: serie.map((s) => `${s.meses} m`),
      datasets: [
        { label: 'Máximo esperado', data: serie.map((s) => s.max), suffix: ' kg', fill: false },
        { label: 'Mínimo esperado', data: serie.map((s) => s.min), suffix: ' kg', fill: false, dashed: true },
      ],
    },
    ariaLabel: `Curva de crecimiento del Boxer ${sexoTxt}: de ${fmtKg(serie[0].min)}-${fmtKg(serie[0].max)} kg a los ${serie[0].meses} meses hasta ${fmtKg(adultoMin)}-${fmtKg(adultoMax)} kg de adulto`,
  };

  return {
    pesoPromedio: promR,
    pesoIdealMin: minR,
    pesoIdealMax: maxR,
    pesoAdultoEstimado: adultoProm,
    porcentajeCrecimiento: porcentaje,
    esperanzaAnios: RAZA.esperanza,
    resumen,
    _insight: { title: insightTitle, text: insightText, tone: insightTone, icon: '🐶' },
    _charts: [chartEscala, chartCurva],
  };
}
