/** Hidratación necesaria para futbolista 90 min + prórroga según peso, clima y tasa de sudor */
export interface Inputs {
  peso: number;
  minutos: number;
  clima: string; // 'templado' | 'calor' | 'calor-extremo' | 'frio'
  tasaSudorExtra?: number; // opcional (L/hr estimado personal)
}

export interface Outputs {
  perdidaTotalMl: number;
  reposicionMl: number;
  sodioMg: number;
  potasioMg: number;
  tomasRecomendadas: number;
  mlPorToma: number;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

// Tasa base de sudor L/hr por clima (70 kg referencia)
const CLIMA: Record<string, { tasa: number; nombre: string }> = {
  'frio':          { tasa: 0.6, nombre: 'Frío (<15°C)' },
  'templado':      { tasa: 1.0, nombre: 'Templado (15-25°C)' },
  'calor':         { tasa: 1.5, nombre: 'Calor (26-32°C)' },
  'calor-extremo': { tasa: 2.0, nombre: 'Calor extremo (>32°C)' },
};

export function hidratacionFutbolista(i: Inputs): Outputs {
  const peso = Number(i.peso);
  const min = Number(i.minutos);
  const clima = String(i.clima || 'templado');
  const extra = Number(i.tasaSudorExtra);

  if (!peso || peso <= 0) throw new Error('Ingresá tu peso');
  if (!min || min <= 0) throw new Error('Ingresá los minutos jugados');

  const info = CLIMA[clima] || CLIMA['templado'];
  // Ajuste por peso: base 70 kg, escala lineal
  let tasaBase = info.tasa * (peso / 70);
  if (extra && extra > 0) tasaBase = extra;

  const perdidaTotal = tasaBase * (min / 60) * 1000; // mL
  // Reposicion durante juego: 70-80% de pérdida (resto post-partido)
  const reposicion = perdidaTotal * 0.75;
  // Cada 15 min una toma
  const tomas = Math.max(1, Math.round(min / 15));
  const mlToma = Math.round(reposicion / tomas);

  // Electrolitos: sodio 500-700 mg/L sudor, potasio 150-200 mg/L
  const sodioMg = Math.round((perdidaTotal / 1000) * 600);
  const potasioMg = Math.round((perdidaTotal / 1000) * 180);

  const perdidaTotalR = Math.round(perdidaTotal);
  const reposicionR = Math.round(reposicion);
  const postPartido = perdidaTotalR - reposicionR;
  // Deshidratación como % del peso corporal (>2% afecta rendimiento)
  const pctPeso = (perdidaTotal / 1000) / peso * 100;

  let insightText: string;
  let insightTone: 'good' | 'warn' | 'neutral';
  if (pctPeso >= 2) {
    insightText = `Pérdida fuerte: ~**${perdidaTotalR} mL** equivalen a **${pctPeso.toFixed(1)}% de tu peso**, por encima del 2% que ya baja el rendimiento. Tomá **${mlToma} mL** cada 15 min sin saltearte tomas.`;
    insightTone = 'warn';
  } else if (pctPeso >= 1) {
    insightText = `Vas a perder ~**${perdidaTotalR} mL** (${pctPeso.toFixed(1)}% de tu peso). Reponé **${reposicionR} mL** durante el juego en ${tomas} tomas de ~${mlToma} mL para no caer en deshidratación.`;
    insightTone = 'neutral';
  } else {
    insightText = `Pérdida controlada: ~**${perdidaTotalR} mL** (${pctPeso.toFixed(1)}% de tu peso). Con **${mlToma} mL** cada 15 min mantenés la hidratación sin problemas.`;
    insightTone = 'good';
  }

  return {
    perdidaTotalMl: perdidaTotalR,
    reposicionMl: reposicionR,
    sodioMg,
    potasioMg,
    tomasRecomendadas: tomas,
    mlPorToma: mlToma,
    detalle: `Futbolista ${peso} kg, ${min} min, **${info.nombre}**: pérdida ~${perdidaTotalR} mL. Reponer **${reposicionR} mL** durante el juego, en ${tomas} tomas de ~${mlToma} mL cada 15 min. Sodio ${sodioMg} mg, potasio ${potasioMg} mg.`,
    _insight: {
      title: 'Tu reposición en cancha',
      text: insightText,
      tone: insightTone,
      icon: '⚽',
    },
    _chart: {
      type: 'doughnut',
      slices: [
        { label: 'Durante el juego', value: reposicionR },
        { label: 'Post-partido', value: postPartido },
      ],
      prefix: '',
      centerValue: `${perdidaTotalR} mL`,
      centerLabel: 'Pérdida total',
      ariaLabel: `Reparto de la pérdida de ${perdidaTotalR} mL: ${reposicionR} mL a reponer durante el juego y ${postPartido} mL post-partido`,
    },
  };
}
