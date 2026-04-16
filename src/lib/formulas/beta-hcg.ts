/** Niveles de beta hCG en embarazo */
export interface Inputs { nivelHCG: number; semanaDesdeFUM: number; segundaBeta?: number; diasEntreBetas?: number; }
export interface Outputs { evaluacion: string; rangoNormal: string; duplicacion: string; siguiente: string; }

export function betaHcg(i: Inputs): Outputs {
  const hcg = Number(i.nivelHCG);
  const sem = Number(i.semanaDesdeFUM);
  const beta2 = Number(i.segundaBeta) || 0;
  const dias = Number(i.diasEntreBetas) || 2;

  if (hcg < 0) throw new Error('El nivel de hCG no puede ser negativo');
  if (sem < 3 || sem > 14) throw new Error('Ingresá una semana entre 3 y 14');

  // Rangos por semana (min, max en mUI/ml)
  const rangos: Record<number, [number, number]> = {
    3: [5, 50], 4: [5, 426], 5: [18, 7340], 6: [1080, 56500],
    7: [7650, 229000], 8: [7650, 229000], 9: [25700, 288000],
    10: [25700, 288000], 11: [25700, 288000], 12: [25700, 288000],
    13: [13300, 254000], 14: [13300, 254000],
  };

  const semInt = Math.round(sem);
  const rango = rangos[semInt] || rangos[5];
  const rangoNormal = `${rango[0].toLocaleString()} - ${rango[1].toLocaleString()} mUI/ml (semana ${semInt})`;

  let evaluacion = '';
  if (hcg < rango[0]) {
    evaluacion = 'Nivel por debajo del rango esperado. Puede ser embarazo más temprano de lo calculado, embarazo ectópico o no viable. Consultá con tu obstetra.';
  } else if (hcg > rango[1]) {
    evaluacion = 'Nivel por encima del rango esperado. Puede indicar embarazo gemelar, embarazo molar o simplemente variación normal. Se confirma por ecografía.';
  } else {
    evaluacion = 'Nivel dentro del rango normal para esta semana de embarazo.';
  }

  // Duplicación
  let duplicacion = 'Ingresá una segunda beta para calcular el tiempo de duplicación.';
  if (beta2 > 0 && hcg > 0 && beta2 !== hcg) {
    const ratio = beta2 / hcg;
    if (ratio > 1) {
      const tiempoDuplicacion = (dias * Math.log(2)) / Math.log(ratio) * 24;
      duplicacion = `Tiempo de duplicación: ${tiempoDuplicacion.toFixed(1)} horas (${(tiempoDuplicacion / 24).toFixed(1)} días)`;
      if (tiempoDuplicacion <= 72) duplicacion += '. Duplicación normal (< 72 horas).';
      else if (tiempoDuplicacion <= 96) duplicacion += '. Duplicación aceptable pero a monitorear.';
      else duplicacion += '. Duplicación lenta. Consultá con tu obstetra.';
    } else {
      duplicacion = 'La segunda beta es menor que la primera. Los niveles están bajando.';
    }
  }

  // Qué esperar
  let siguiente = '';
  if (hcg < 1500) siguiente = 'Con estos niveles, aún puede ser temprano para ver algo en la ecografía. Se recomienda repetir la beta en 48-72 horas.';
  else if (hcg < 6000) siguiente = 'Con estos niveles, se debería ver el saco gestacional por ecografía transvaginal.';
  else if (hcg < 20000) siguiente = 'Con estos niveles, se debería ver el embrión en la ecografía.';
  else siguiente = 'Con estos niveles, se debería ver embrión con latido cardíaco en la ecografía.';

  return { evaluacion, rangoNormal, duplicacion, siguiente };
}
