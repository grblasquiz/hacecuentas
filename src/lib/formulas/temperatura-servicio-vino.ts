/** Temperatura servicio vino */
export interface Inputs { tipoVino: string; temperaturaActual: number; }
export interface Outputs { tempOptima: string; tiempoHeladera: string; tiempoFreezer: string; recomendacion: string; }

export function temperaturaServicioVino(i: Inputs): Outputs {
  const tipo = String(i.tipoVino || 'tinto_medio');
  const tAct = Number(i.temperaturaActual);
  if (!isFinite(tAct)) throw new Error('Ingresá temperatura actual');

  const tempsObjetivo: Record<string, [number, number]> = {
    tinto_liviano: [12, 14],
    tinto_medio: [14, 16],
    tinto_robusto: [16, 18],
    blanco_liviano: [8, 10],
    blanco_medio: [9, 11],
    blanco_barrica: [10, 12],
    rosado: [8, 12],
    espumante: [6, 8],
    oporto: [10, 14],
  };
  const [lo, hi] = tempsObjetivo[tipo] ?? [14, 16];
  const obj = (lo + hi) / 2;
  const delta = tAct - obj;

  const tempOpt = `${lo}-${hi}°C`;
  let hel = '';
  let fre = '';
  let rec = '';

  if (delta > 0) {
    const minH = Math.max(5, Math.round(delta * 12));
    const minF = Math.max(3, Math.round(delta * 2));
    hel = `${minH} min en heladera`;
    fre = `${minF} min en freezer (vigilar)`;
    rec = `Enfriar ${delta.toFixed(0)}°C para llegar al rango óptimo.`;
  } else if (delta < -1) {
    hel = 'No necesita heladera';
    fre = 'No necesita freezer';
    rec = `Está demasiado frío (${(-delta).toFixed(0)}°C menos que óptimo). Sacalo del frío 10-15 min antes de servir.`;
  } else {
    hel = 'Ya está en rango';
    fre = 'No necesita';
    rec = 'Listo para servir.';
  }

  return {
    tempOptima: tempOpt,
    tiempoHeladera: hel,
    tiempoFreezer: fre,
    recomendacion: rec,
  };
}
