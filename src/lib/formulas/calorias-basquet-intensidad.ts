/** Calorías quemadas jugando básquet */
export interface Inputs {
  peso: number;
  tipo: string;
  minutos: number;
}

export interface Outputs {
  result: number;
  kcalMin: number;
  metUsado: number;
  detalle: string;
  _insight?: any;
}

const MET_BASQUET: Record<string, { met: number; nombre: string }> = {
  'tiros': { met: 4.0, nombre: 'Práctica de tiros' },
  'recreativo': { met: 4.5, nombre: 'Picadito recreativo' },
  'half-court': { met: 6.0, nombre: 'Half-court competitivo' },
  'full-court': { met: 6.5, nombre: 'Partido full-court' },
  'competitivo': { met: 8.0, nombre: 'Partido competitivo / liga' },
};

export function caloriasBasquetIntensidad(i: Inputs): Outputs {
  const peso = Number(i.peso);
  const min = Number(i.minutos);
  const tipo = String(i.tipo || 'full-court');

  if (!peso || peso <= 0) throw new Error('Ingresá tu peso en kg');
  if (!min || min <= 0) throw new Error('Ingresá los minutos de juego');

  const info = MET_BASQUET[tipo] || MET_BASQUET['full-court'];
  const kcalPorMin = (info.met * 3.5 * peso) / 200;
  const total = kcalPorMin * min;

  // Equivalencias rápidas
  const minCaminar = Math.round(total / 5); // ~5 kcal/min caminando
  const alfajores = total / 230; // alfajor común ~230 kcal
  const _insight = {
    title: 'Lo que dejaste en la cancha',
    text: `${info.nombre} durante ${min} min te hace quemar **~${Math.round(total)} kcal** (${kcalPorMin.toFixed(2)} kcal/min). Equivale a **${minCaminar} min** de caminata${alfajores >= 0.5 ? ` o **${alfajores.toFixed(1)} alfajores**` : ''}. A mayor intensidad (MET ${info.met}), más gasto por minuto.`,
    tone: 'good',
    icon: '🏀',
  };

  return {
    result: Math.round(total),
    kcalMin: Number(kcalPorMin.toFixed(2)),
    metUsado: info.met,
    detalle: `Jugando **${info.nombre}** durante ${min} min quemás **${Math.round(total)} kcal** (${kcalPorMin.toFixed(2)} kcal/min, MET ${info.met}).`,
    _insight,
  };
}
