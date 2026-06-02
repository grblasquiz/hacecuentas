/** Temperatura servicio vino */
export interface Inputs { tipoVino: string; temperaturaActual: number; }
export interface Outputs { tempOptima: string; tiempoHeladera: string; tiempoFreezer: string; recomendacion: string; _insight?: any; _chart?: any; }

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

  let insightTone: 'good' | 'warn' | 'neutral';
  let insightText: string;
  if (delta > 0) {
    insightTone = 'warn';
    insightText = `Está **${delta.toFixed(0)}°C por encima** del rango ideal (${tempOpt}): servido así pierde aromas y se siente más alcohólico. Enfrialo **${hel}** antes de descorchar.`;
  } else if (delta < -1) {
    insightTone = 'warn';
    insightText = `Está **${(-delta).toFixed(0)}°C demasiado frío** (ideal ${tempOpt}): el frío tapa los aromas. Dejalo atemperar **10-15 min** fuera del frío antes de servir.`;
  } else {
    insightTone = 'good';
    insightText = `A **${tAct.toFixed(0)}°C** ya está dentro del rango ideal de **${tempOpt}**: serví sin esperar para disfrutarlo en su punto.`;
  }

  return {
    tempOptima: tempOpt,
    tiempoHeladera: hel,
    tiempoFreezer: fre,
    recomendacion: rec,
    _insight: {
      title: 'Tu copa en su punto',
      text: insightText,
      tone: insightTone,
      icon: '🍷',
    },
    _chart: {
      type: 'scale',
      marker: Number(tAct.toFixed(1)),
      markerLabel: `Actual ${tAct.toFixed(0)}°C`,
      min: 0,
      segments: [
        { nombre: 'Muy frío', max: lo, color: '#60a5fa', colorDark: '#3b82f6' },
        { nombre: 'Ideal', max: hi, color: '#34d399', colorDark: '#10b981' },
        { nombre: 'Muy cálido', max: Math.max(hi + 6, Math.ceil(tAct) + 2), color: '#f87171', colorDark: '#ef4444' },
      ],
      ariaLabel: `Temperatura actual ${tAct.toFixed(0)}°C frente al rango ideal de servicio ${tempOpt}`,
    },
  };
}
