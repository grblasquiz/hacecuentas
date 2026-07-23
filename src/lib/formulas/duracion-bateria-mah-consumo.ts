/** Estimación de duración de batería según capacidad mAh y consumo */
export interface Inputs { capacidadMah: number; consumoMa: number; eficiencia?: number; }
export interface Outputs { horasEstimadas: number; minutosEstimados: number; energiaWh: number; detalle: string; _insight?: any; _table?: any; _chart?: any; }

export function duracionBateriaMahConsumo(i: Inputs): Outputs {
  const capacidad = Number(i.capacidadMah);
  const consumo = Number(i.consumoMa);
  const eficiencia = Number(i.eficiencia || 85) / 100;

  if (!capacidad || capacidad <= 0) throw new Error('Ingresá la capacidad de la batería en mAh');
  if (!consumo || consumo <= 0) throw new Error('Ingresá el consumo del dispositivo en mA');
  if (eficiencia <= 0 || eficiencia > 1) throw new Error('La eficiencia debe estar entre 1 y 100');

  const capacidadReal = capacidad * eficiencia;
  const horas = capacidadReal / consumo;
  const minutos = horas * 60;
  const energiaWh = (capacidad * 3.7) / 1000; // voltaje típico Li-ion

  const hWhole = Math.floor(horas);
  const mRest = Math.round((horas - hWhole) * 60);
  const duracionTxt = hWhole >= 1 ? `${hWhole} h ${mRest} min` : `${Math.round(minutos)} min`;
  const perdida = Math.round((1 - eficiencia) * 100);
  const _insight = {
    title: 'Cuánto te dura la batería',
    text: `Una batería de **${capacidad} mAh** con un consumo de **${consumo} mA** rinde unas **${duracionTxt}** (${horas.toFixed(1)} h). La eficiencia del **${(eficiencia * 100).toFixed(0)}%** se come cerca del **${perdida}%** de la capacidad nominal.`,
    tone: 'neutral' as const,
    icon: '🔋',
  };

  // Tabla viva: las capacidades que la gente busca, con TU consumo aplicado.
  const capsBase = [30, 100, 300, 400, 1000, 1200, 2000, 2500, 3000, 3500, 4000, 5000, 10000, 20000];
  const caps = capsBase.includes(capacidad) ? capsBase : [...capsBase, capacidad].sort((a, b) => a - b);
  const fmtDur = (h: number) => {
    if (h >= 48) return `${Math.round(h / 24)} días`;
    if (h >= 10) return `${Math.round(h)} h`;
    if (h >= 1) return `${h.toFixed(1).replace('.', ',')} h`;
    return `${Math.round(h * 60)} min`;
  };
  const _table = {
    title: `¿Cuánto dura cada capacidad con un consumo de ${consumo} mA?`,
    headers: ['Capacidad', 'Duración estimada'],
    align: ['left', 'right'],
    rows: caps.map((c) => [
      `${c.toLocaleString('es-AR')} mAh${c === capacidad ? ' (la tuya)' : ''}`,
      fmtDur((c * eficiencia) / consumo),
    ]),
    note: `Recalculada con tu consumo (${consumo} mA) y eficiencia (${(eficiencia * 100).toFixed(0)}%). A mayor consumo, toda la tabla baja proporcionalmente.`,
  };

  // Comparación visual: la misma batería frente a consumos típicos.
  const consumosTipicos = [10, 50, 200, 500];
  const _chart = {
    type: 'bar',
    label: 'Según el consumo del dispositivo',
    data: {
      labels: consumosTipicos.map((c) => `${c} mA`),
      datasets: [
        {
          label: `Horas con ${capacidad.toLocaleString('es-AR')} mAh`,
          data: consumosTipicos.map((c) => Number(((capacidad * eficiencia) / c).toFixed(1))),
          suffix: ' h',
        },
      ],
    },
    ariaLabel: `Con ${capacidad} mAh la duración va de ${fmtDur((capacidad * eficiencia) / 500)} a 500 mA hasta ${fmtDur((capacidad * eficiencia) / 10)} a 10 mA`,
  };

  return {
    horasEstimadas: Number(horas.toFixed(2)),
    minutosEstimados: Math.round(minutos),
    energiaWh: Number(energiaWh.toFixed(2)),
    _table,
    _chart,
    detalle: `Batería de ${capacidad} mAh (${(eficiencia * 100).toFixed(0)}% eficiencia) con consumo de ${consumo} mA: ~${horas.toFixed(1)} horas (${Math.round(minutos)} min). Energía: ${energiaWh.toFixed(1)} Wh a 3,7V.`,
    _insight,
  };
}
