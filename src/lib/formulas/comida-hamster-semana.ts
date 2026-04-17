/** Comida semanal del hámster según especie y peso. */
export interface Inputs {
  especie?: string;
  pesoGr?: number;
  edad?: string;
}
export interface Outputs {
  mixSemillasSemanaGr: number;
  mixPorDiaGr: number;
  proteinaSemana: string;
  verdurasSemana: string;
  premiosSemana: string;
  mixMesKg: number;
}

export function comidaHamsterSemana(i: Inputs): Outputs {
  const especie = String(i.especie || 'sirio');
  const edad = String(i.edad || 'adulto');
  const peso = Math.max(10, Number(i.pesoGr ?? 120));

  // Gramos/día base por especie
  const baseDia: Record<string, number> = {
    'sirio': 17, 'ruso': 9, 'campbell': 9, 'roborowski': 6, 'chino': 9,
  };
  let diaGr = baseDia[especie] ?? 10;

  // Ajuste por peso (proporcional a un peso de referencia)
  const pesoRef: Record<string, number> = {
    'sirio': 140, 'ruso': 40, 'campbell': 40, 'roborowski': 25, 'chino': 40,
  };
  const ref = pesoRef[especie] ?? 100;
  diaGr = diaGr * (peso / ref);

  // Ajuste por edad
  if (edad === 'cachorro') diaGr *= 1.2;
  else if (edad === 'senior') diaGr *= 0.9;

  const semana = Math.round(diaGr * 7);
  const diaRedondeo = Math.round(diaGr * 10) / 10;
  const mesKg = Math.round((semana * 4.3) / 1000 * 10) / 10;

  const isDiabetico = especie === 'ruso' || especie === 'campbell';

  const proteina = edad === 'cachorro'
    ? '2 veces por semana: huevo duro, pollo cocido sin sal o grillo deshidratado.'
    : '1 vez por semana: huevo duro, pollo cocido sin sal, grillo o tenebrio deshidratado.';

  const verduras = isDiabetico
    ? '2-3 veces/semana, solo bajas en azúcar: pepino, brócoli, hojas de rúcula o espinaca. Cero fruta dulce.'
    : '2-3 veces/semana en trocitos: pepino, zanahoria, brócoli, manzana sin semillas, hojas verdes.';

  const premios = isDiabetico
    ? 'Solo grillo deshidratado, pepino o pedacito de huevo. Ninguna fruta dulce ni maíz.'
    : especie === 'sirio'
      ? 'Pipa de girasol, cacahuete sin sal o trocito de manzana, 1-2 veces por semana.'
      : 'Semillas de calabaza, arándano deshidratado. Ocasional.';

  return {
    mixSemillasSemanaGr: semana,
    mixPorDiaGr: diaRedondeo,
    proteinaSemana: proteina,
    verdurasSemana: verduras,
    premiosSemana: premios,
    mixMesKg: mesKg,
  };
}
