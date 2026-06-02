/** Grasa corporal — fórmula US Navy (perímetros) */
export interface Inputs {
  sexo: 'm' | 'f' | string;
  altura: number; // cm
  cuello: number; // cm
  cintura: number; // cm
  cadera?: number; // cm (solo mujeres)
  __lang?: string;
}
export interface Outputs {
  porcentajeGrasa: number;
  categoria: string;
  masaMagra: number;
  masaGrasa: number;
  _chart?: any;
}

export function grasaCorporal(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  const T = ({
    es: {
      errAltura: 'Ingresá altura',
      errCuello: 'Ingresá cuello',
      errCintura: 'Ingresá cintura',
      errCadera: 'Ingresá cadera',
      errCinturaCuello: 'La cintura debe ser mayor al cuello',
      errSumaCuello: 'La suma de cintura + cadera debe ser mayor al cuello',
      catEsencialMuy: 'Grasa esencial (muy bajo)',
      catAtletica: 'Atlética',
      catFitness: 'Fitness',
      catPromedio: 'Promedio',
      catObesidad: 'Obesidad',
      segEsencial: 'Grasa esencial',
      segAtletica: 'Atlética',
      segFitness: 'Fitness',
      segPromedio: 'Promedio',
      segObesidad: 'Obesidad',
      ariaLabel: 'Escala de porcentaje de grasa corporal por categorías (US Navy)',
      insTitle: 'Tu grasa corporal',
      insText: (p: string, c: string) => `Con **${p}%** de grasa corporal, el método US Navy te ubica en la categoría **${c}**.`,
    },
    en: {
      errAltura: 'Enter height',
      errCuello: 'Enter neck circumference',
      errCintura: 'Enter waist circumference',
      errCadera: 'Enter hip circumference',
      errCinturaCuello: 'Waist must be greater than neck',
      errSumaCuello: 'Waist + hip sum must be greater than neck',
      catEsencialMuy: 'Essential fat (very low)',
      catAtletica: 'Athletic',
      catFitness: 'Fitness',
      catPromedio: 'Average',
      catObesidad: 'Obesity',
      segEsencial: 'Essential fat',
      segAtletica: 'Athletic',
      segFitness: 'Fitness',
      segPromedio: 'Average',
      segObesidad: 'Obesity',
      ariaLabel: 'Body fat percentage scale by category (US Navy)',
      insTitle: 'Your body fat',
      insText: (p: string, c: string) => `At **${p}%** body fat, the US Navy method places you in the **${c}** category.`,
    },
  } as const)[__lang];

  const sexo = String(i.sexo || 'm');
  const alt = Number(i.altura);
  const cuello = Number(i.cuello);
  const cintura = Number(i.cintura);
  const cadera = Number(i.cadera) || 0;
  if (!alt || alt <= 0) throw new Error(T.errAltura);
  if (!cuello || cuello <= 0) throw new Error(T.errCuello);
  if (!cintura || cintura <= 0) throw new Error(T.errCintura);
  if (sexo === 'f' && !cadera) throw new Error(T.errCadera);
  if (sexo !== 'f' && cintura <= cuello) throw new Error(T.errCinturaCuello);
  if (sexo === 'f' && (cintura + cadera) <= cuello) throw new Error(T.errSumaCuello);

  // US Navy formula
  let pct = 0;
  if (sexo === 'f') {
    pct = 495 / (1.29579 - 0.35004 * Math.log10(cintura + cadera - cuello) + 0.22100 * Math.log10(alt)) - 450;
  } else {
    pct = 495 / (1.0324 - 0.19077 * Math.log10(cintura - cuello) + 0.15456 * Math.log10(alt)) - 450;
  }
  pct = Math.max(0, pct);

  // Categorías (American Council on Exercise)
  let categoria = '';
  if (sexo === 'f') {
    if (pct < 14) categoria = T.catEsencialMuy;
    else if (pct < 21) categoria = T.catAtletica;
    else if (pct < 25) categoria = T.catFitness;
    else if (pct < 32) categoria = T.catPromedio;
    else categoria = T.catObesidad;
  } else {
    if (pct < 6) categoria = T.catEsencialMuy;
    else if (pct < 14) categoria = T.catAtletica;
    else if (pct < 18) categoria = T.catFitness;
    else if (pct < 25) categoria = T.catPromedio;
    else categoria = T.catObesidad;
  }

  const pg = Number(pct.toFixed(1));
  const segments = sexo === 'f'
    ? [
        { nombre: T.segEsencial, max: 14, color: '#fde68a', colorDark: '#b45309' },
        { nombre: T.segAtletica, max: 21, color: '#bbf7d0', colorDark: '#166534' },
        { nombre: T.segFitness, max: 25, color: '#a7f3d0', colorDark: '#047857' },
        { nombre: T.segPromedio, max: 32, color: '#fed7aa', colorDark: '#9a3412' },
        { nombre: T.segObesidad, max: Math.max(45, Math.ceil(pg) + 5), color: '#fecaca', colorDark: '#b91c1c' },
      ]
    : [
        { nombre: T.segEsencial, max: 6, color: '#fde68a', colorDark: '#b45309' },
        { nombre: T.segAtletica, max: 14, color: '#bbf7d0', colorDark: '#166534' },
        { nombre: T.segFitness, max: 18, color: '#a7f3d0', colorDark: '#047857' },
        { nombre: T.segPromedio, max: 25, color: '#fed7aa', colorDark: '#9a3412' },
        { nombre: T.segObesidad, max: Math.max(40, Math.ceil(pg) + 5), color: '#fecaca', colorDark: '#b91c1c' },
      ];
  const chart = {
    type: 'scale' as const,
    marker: pg,
    markerLabel: __lang === 'en' ? 'Your fat: ' + pg + '%' : 'Tu grasa: ' + pg + '%',
    min: 0,
    unit: '%',
    segments,
    ariaLabel: T.ariaLabel,
  };

  const insTone = (categoria === T.catEsencialMuy || categoria === T.catObesidad)
    ? 'warn'
    : ((categoria === T.catAtletica || categoria === T.catFitness) ? 'good' : 'neutral');
  const _insight = {
    title: T.insTitle,
    text: T.insText(pg.toFixed(1), categoria),
    tone: insTone,
    icon: '📐',
  };

  return {
    porcentajeGrasa: pg,
    categoria,
    masaGrasa: 0, // se setea luego si hay peso
    masaMagra: 0,
    _chart: chart,
    _insight,
  };
}
