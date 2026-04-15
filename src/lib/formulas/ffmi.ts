/** FFMI — Fat-Free Mass Index (Índice de Masa Libre de Grasa) */
export interface Inputs {
  peso: number;
  altura: number;
  grasa: number; // % grasa corporal
  sexo?: string;
}
export interface Outputs {
  ffmi: number;
  ffmiAjustado: number;
  masaMagra: number;
  masaGrasa: number;
  categoria: string;
  resumen: string;
  natural: string;
}

export function ffmi(i: Inputs): Outputs {
  const peso = Number(i.peso);
  const altura = Number(i.altura) / 100; // m
  const grasa = Number(i.grasa);
  const sexo = String(i.sexo || 'hombre');

  if (!peso || peso < 30 || peso > 250) throw new Error('Peso entre 30 y 250 kg');
  if (!altura || altura < 1.0 || altura > 2.5) throw new Error('Altura entre 100 y 250 cm');
  if (grasa < 3 || grasa > 60) throw new Error('% grasa corporal entre 3 y 60');

  const masaMagra = peso * (1 - grasa / 100);
  const masaGrasa = peso - masaMagra;

  const ffmi = masaMagra / (altura * altura);
  // Ajuste a altura de 1.80m (Kouri et al., 1995)
  const ffmiAjustado = ffmi + 6.1 * (1.8 - altura);

  // Categorías según Kouri (hombres) y aproximación para mujeres
  let categoria = '';
  let natural = '';
  if (sexo === 'hombre') {
    if (ffmiAjustado < 18) categoria = 'Por debajo del promedio';
    else if (ffmiAjustado < 20) categoria = 'Promedio';
    else if (ffmiAjustado < 22) categoria = 'Por encima del promedio';
    else if (ffmiAjustado < 23) categoria = 'Excelente (rango natural alto)';
    else if (ffmiAjustado < 25) categoria = 'Sobresaliente (límite natural superior)';
    else categoria = 'Sospechoso (probable uso de ayudas no naturales)';

    if (ffmiAjustado <= 25) natural = 'Dentro del rango natural alcanzable sin esteroides anabólicos.';
    else natural = 'Por encima del techo natural descripto en el estudio de Kouri (1995). En personas no entrenadas o con menos años de entrenamiento, este FFMI suele asociarse a uso de ayudas no naturales.';
  } else {
    if (ffmiAjustado < 14) categoria = 'Por debajo del promedio';
    else if (ffmiAjustado < 16) categoria = 'Promedio';
    else if (ffmiAjustado < 18) categoria = 'Por encima del promedio';
    else if (ffmiAjustado < 19) categoria = 'Excelente';
    else if (ffmiAjustado < 22) categoria = 'Sobresaliente';
    else categoria = 'Excepcional (revisar mediciones)';

    if (ffmiAjustado <= 22) natural = 'Dentro del rango natural alcanzable.';
    else natural = 'Muy por encima del rango habitual en mujeres entrenadas naturalmente.';
  }

  return {
    ffmi: Number(ffmi.toFixed(1)),
    ffmiAjustado: Number(ffmiAjustado.toFixed(1)),
    masaMagra: Number(masaMagra.toFixed(1)),
    masaGrasa: Number(masaGrasa.toFixed(1)),
    categoria,
    resumen: `Tu FFMI es ${ffmi.toFixed(1)} (ajustado a 1.80m: ${ffmiAjustado.toFixed(1)}) → ${categoria}.`,
    natural,
  };
}
