export interface UpsAutonomiaPotenciaCargaInputs { vaUps: number; cargaW: number; ahBateria: number; vBateria: number; eficiencia?: number; }
export interface UpsAutonomiaPotenciaCargaOutputs { minutos: string; porcentajeCarga: string; resumen: string; _insight?: any; _chart?: any; }
export function upsAutonomiaPotenciaCarga(i: UpsAutonomiaPotenciaCargaInputs): UpsAutonomiaPotenciaCargaOutputs {
  const va = Number(i.vaUps); const w = Number(i.cargaW); const ah = Number(i.ahBateria);
  const v = Number(i.vBateria); const eff = Number(i.eficiencia ?? 85) / 100;
  if (!va || !w || !ah || !v) throw new Error('Completá todos los campos');
  const energia = ah * v * eff;
  const minutos = (energia * 60) / w;
  const pct = (w / (va * 0.6)) * 100;
  const tone = pct > 100 ? 'warn' : pct > 80 ? 'neutral' : 'good';
  const _insight = {
    title: 'Autonomía y carga del UPS',
    text: `Con una carga de **${w} W** vas a aguantar unos **${minutos.toFixed(0)} min** de respaldo, usando el **${pct.toFixed(0)}%** de la capacidad útil del UPS. ${
      pct > 100 ? 'Estás sobrecargando el equipo: bajá la carga o usá un UPS más grande.'
      : pct > 80 ? 'La carga es alta, así que la autonomía real puede ser algo menor.'
      : 'Carga cómoda, con buen margen.'
    }`,
    tone,
    icon: pct > 100 ? '⚠️' : '🔋',
  };
  const _chart = {
    type: 'scale',
    marker: Math.min(pct, 120),
    markerLabel: `${pct.toFixed(0)}%`,
    min: 0,
    segments: [
      { nombre: 'Holgado', max: 60, color: '#22c55e', colorDark: '#4ade80' },
      { nombre: 'Moderado', max: 80, color: '#84cc16', colorDark: '#a3e635' },
      { nombre: 'Alto', max: 100, color: '#f59e0b', colorDark: '#fbbf24' },
      { nombre: 'Sobrecarga', max: 120, color: '#ef4444', colorDark: '#f87171' },
    ],
    ariaLabel: `Carga del UPS: ${pct.toFixed(0)}% de la capacidad útil`,
  };
  return { minutos: minutos.toFixed(1) + ' min', porcentajeCarga: pct.toFixed(0) + '%',
    resumen: `Autonomía ~${minutos.toFixed(0)} min con carga ${w}W (${pct.toFixed(0)}% del UPS). ${pct > 80 ? 'Carga alta — autonomía real puede ser menor.' : 'Carga moderada.'}`,
    _insight, _chart };
}
