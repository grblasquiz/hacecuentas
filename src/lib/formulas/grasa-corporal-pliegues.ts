/** % grasa corporal por pliegues cutáneos — Jackson-Pollock 3 pliegues */
export interface Inputs {
  sexo: string;
  edad: number;
  peso: number;
  pliegue1: number;
  pliegue2: number;
  pliegue3: number;
  __lang?: string;
}
export interface Outputs {
  densidadCorporal: number;
  porcentajeGrasa: number;
  masaGrasa: number;
  masaMagra: number;
  categoria: string;
  mensaje: string;
  _chart?: any;
  _insight?: any;
}

export function grasaCorporalPliegues(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      errorEdad: 'Ingresá una edad válida',
      errorPliegues: 'Ingresá los 3 pliegues en mm',
      grasaEsencial: 'Grasa esencial',
      atleta: 'Atleta',
      fitness: 'Fitness',
      promedio: 'Promedio',
      sobrepeso: 'Sobrepeso',
      ariaLabel: 'Escala de porcentaje de grasa corporal por categorías (Jackson-Pollock)',
    },
    en: {
      errorEdad: 'Enter a valid age',
      errorPliegues: 'Enter all 3 skinfold measurements in mm',
      grasaEsencial: 'Essential fat',
      atleta: 'Athlete',
      fitness: 'Fitness',
      promedio: 'Average',
      sobrepeso: 'Obese',
      ariaLabel: 'Body fat percentage scale by category (Jackson-Pollock)',
    },
  } as const)[__lang];

  const sexo = String(i.sexo || 'm');
  const edad = Number(i.edad);
  const peso = Number(i.peso) || 0;
  const p1 = Number(i.pliegue1); // Hombres: pecho, Mujeres: tríceps
  const p2 = Number(i.pliegue2); // Hombres: abdomen, Mujeres: suprailiaco
  const p3 = Number(i.pliegue3); // Hombres: muslo, Mujeres: muslo

  if (!edad || edad < 10) throw new Error(T.errorEdad);
  if (!p1 || !p2 || !p3) throw new Error(T.errorPliegues);

  const sum = p1 + p2 + p3;

  // Jackson-Pollock 3 pliegues
  let densidad: number;
  if (sexo === 'f') {
    densidad = 1.0994921 - 0.0009929 * sum + 0.0000023 * sum * sum - 0.0001392 * edad;
  } else {
    densidad = 1.10938 - 0.0008267 * sum + 0.0000016 * sum * sum - 0.0002574 * edad;
  }

  // Siri: % grasa = (495 / densidad) - 450
  const porcentajeGrasa = (495 / densidad) - 450;

  // Categorías
  let categoria: string;
  if (sexo === 'f') {
    if (porcentajeGrasa < 14) categoria = T.grasaEsencial;
    else if (porcentajeGrasa < 21) categoria = T.atleta;
    else if (porcentajeGrasa < 25) categoria = T.fitness;
    else if (porcentajeGrasa < 32) categoria = T.promedio;
    else categoria = T.sobrepeso;
  } else {
    if (porcentajeGrasa < 6) categoria = T.grasaEsencial;
    else if (porcentajeGrasa < 14) categoria = T.atleta;
    else if (porcentajeGrasa < 18) categoria = T.fitness;
    else if (porcentajeGrasa < 25) categoria = T.promedio;
    else categoria = T.sobrepeso;
  }

  const pg = Number(porcentajeGrasa.toFixed(1));
  const segments = sexo === 'f'
    ? [
        { nombre: T.grasaEsencial, max: 14, color: '#fde68a', colorDark: '#b45309' },
        { nombre: T.atleta, max: 21, color: '#bbf7d0', colorDark: '#166534' },
        { nombre: T.fitness, max: 25, color: '#a7f3d0', colorDark: '#047857' },
        { nombre: T.promedio, max: 32, color: '#fed7aa', colorDark: '#9a3412' },
        { nombre: T.sobrepeso, max: Math.max(45, Math.ceil(pg) + 5), color: '#fecaca', colorDark: '#b91c1c' },
      ]
    : [
        { nombre: T.grasaEsencial, max: 6, color: '#fde68a', colorDark: '#b45309' },
        { nombre: T.atleta, max: 14, color: '#bbf7d0', colorDark: '#166534' },
        { nombre: T.fitness, max: 18, color: '#a7f3d0', colorDark: '#047857' },
        { nombre: T.promedio, max: 25, color: '#fed7aa', colorDark: '#9a3412' },
        { nombre: T.sobrepeso, max: Math.max(40, Math.ceil(pg) + 5), color: '#fecaca', colorDark: '#b91c1c' },
      ];
  const chart = {
    type: 'scale' as const,
    marker: pg,
    markerLabel: __lang === 'en' ? `Your fat: ${pg}%` : 'Tu grasa: ' + pg + '%',
    min: 0,
    unit: '%',
    segments,
    ariaLabel: T.ariaLabel,
  };

  return {
    densidadCorporal: Number(densidad.toFixed(5)),
    porcentajeGrasa: Number(porcentajeGrasa.toFixed(1)),
    masaGrasa: peso > 0 ? Number((peso * porcentajeGrasa / 100).toFixed(1)) : 0,
    masaMagra: peso > 0 ? Number((peso - peso * porcentajeGrasa / 100).toFixed(1)) : 0,
    categoria,
    mensaje: __lang === 'en'
      ? `Your estimated body fat percentage is ${porcentajeGrasa.toFixed(1)}% — category: ${categoria}.`
      : `Tu porcentaje de grasa corporal estimado es ${porcentajeGrasa.toFixed(1)}% — categoría: ${categoria}.`,
    _chart: chart,
  };
}
