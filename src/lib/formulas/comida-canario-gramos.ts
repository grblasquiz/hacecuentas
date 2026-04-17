/** Comida del canario en gramos según etapa y cantidad. */
export interface Inputs {
  cantidad?: number;
  etapa?: string;
  pesoGr?: number;
}
export interface Outputs {
  semillasDiaGr: number;
  semillasTotalDiaGr: number;
  pastaCriaGr: string;
  verdurasSemana: string;
  huevoCocido: string;
  mixMesGr: number;
}

export function comidaCanarioGramos(i: Inputs): Outputs {
  const cant = Math.max(1, Math.round(Number(i.cantidad ?? 1)));
  const etapa = String(i.etapa || 'descanso');
  const peso = Math.max(10, Number(i.pesoGr ?? 22));

  // Consumo base: 20% del peso corporal aprox
  let diaPorAve = peso * 0.22;
  if (etapa === 'reproduccion') diaPorAve *= 1.15;
  else if (etapa === 'pichones') diaPorAve *= 1.4;
  else if (etapa === 'muda') diaPorAve *= 1.2;

  diaPorAve = Math.round(diaPorAve * 10) / 10;
  const total = Math.round(diaPorAve * cant * 10) / 10;

  const pasta = etapa === 'descanso'
    ? '1-2 veces por semana, 2-3 g por ave'
    : etapa === 'muda'
      ? '3-4 veces por semana, 3-5 g por ave'
      : etapa === 'reproduccion'
        ? 'Diaria, 4-5 g por ave'
        : 'Ilimitada mientras haya pichones, 5-8 g por ave/día';

  const verduras = etapa === 'muda' || etapa === 'reproduccion' || etapa === 'pichones'
    ? 'Achicoria, brócoli, zanahoria rallada y hojas de diente de león 4-5 veces/semana. Cantidad pequeña por toma.'
    : 'Achicoria, brócoli, rúcula y hojas de diente de león 2-3 veces/semana.';

  const huevo = etapa === 'descanso'
    ? '1-2 veces por semana, picado con cáscara'
    : etapa === 'muda'
      ? '3 veces por semana'
      : etapa === 'pichones'
        ? 'Diario'
        : '2-3 veces por semana';

  return {
    semillasDiaGr: diaPorAve,
    semillasTotalDiaGr: total,
    pastaCriaGr: pasta,
    verdurasSemana: verduras,
    huevoCocido: huevo,
    mixMesGr: Math.round(total * 30),
  };
}
