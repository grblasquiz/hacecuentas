/** % grasa corporal por pliegues cutáneos — Jackson-Pollock 3 pliegues */
export interface Inputs {
  sexo: string;
  edad: number;
  pliegue1: number;
  pliegue2: number;
  pliegue3: number;
}
export interface Outputs {
  densidadCorporal: number;
  porcentajeGrasa: number;
  masaGrasa: number;
  masaMagra: number;
  categoria: string;
  mensaje: string;
}

export function grasaCorporalPliegues(i: Inputs): Outputs {
  const sexo = String(i.sexo || 'm');
  const edad = Number(i.edad);
  const p1 = Number(i.pliegue1); // Hombres: pecho, Mujeres: tríceps
  const p2 = Number(i.pliegue2); // Hombres: abdomen, Mujeres: suprailiaco
  const p3 = Number(i.pliegue3); // Hombres: muslo, Mujeres: muslo

  if (!edad || edad < 10) throw new Error('Ingresá una edad válida');
  if (!p1 || !p2 || !p3) throw new Error('Ingresá los 3 pliegues en mm');

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
    if (porcentajeGrasa < 14) categoria = 'Grasa esencial';
    else if (porcentajeGrasa < 21) categoria = 'Atleta';
    else if (porcentajeGrasa < 25) categoria = 'Fitness';
    else if (porcentajeGrasa < 32) categoria = 'Promedio';
    else categoria = 'Sobrepeso';
  } else {
    if (porcentajeGrasa < 6) categoria = 'Grasa esencial';
    else if (porcentajeGrasa < 14) categoria = 'Atleta';
    else if (porcentajeGrasa < 18) categoria = 'Fitness';
    else if (porcentajeGrasa < 25) categoria = 'Promedio';
    else categoria = 'Sobrepeso';
  }

  return {
    densidadCorporal: Number(densidad.toFixed(5)),
    porcentajeGrasa: Number(porcentajeGrasa.toFixed(1)),
    masaGrasa: 0, // Necesita peso total, se muestra como referencia
    masaMagra: 0,
    categoria,
    mensaje: `Tu porcentaje de grasa corporal estimado es ${porcentajeGrasa.toFixed(1)}% — categoría: ${categoria}.`,
  };
}
