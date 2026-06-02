/** TikTok Creator Fund */
export interface Inputs { vistasMensuales: number; rpm: number; }
export interface Outputs { ingresoMensual: string; ingresoAnual: string; vistasPorDolar: string; nivel: string; _insight?: any; _chart?: any; }

export function tiktokCreatorFundIngreso(i: Inputs): Outputs {
  const v = Number(i.vistasMensuales);
  const rpm = Number(i.rpm);
  if (v <= 0 || rpm <= 0) throw new Error('Ingresá valores válidos');
  const mensual = (v / 1000) * rpm;
  const anual = mensual * 12;
  const vpd = mensual > 0 ? v / mensual : 0;
  let nivel = '';
  if (rpm < 0.2) nivel = 'RPM bajo (típico India / LATAM pequeño)';
  else if (rpm < 0.5) nivel = 'RPM medio-bajo (LATAM / sur de Europa)';
  else if (rpm < 0.8) nivel = 'RPM medio (Europa / EEUU parcial)';
  else nivel = 'RPM alto (tier 1: EEUU, UK, DE, FR)';

  const mensualFmt = `$${mensual.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const _insight = {
    title: 'Tu ingreso por el fondo',
    text: `Con **${v.toLocaleString('es-AR')} vistas/mes** y un RPM de **$${rpm.toFixed(2)}** ganás unos **${mensualFmt} USD/mes** (${nivel}). El Creator Fund paga poco solo: el grueso del ingreso de los creadores viene de marcas, TikTok Shop y lives.`,
    tone: rpm < 0.2 ? 'warn' : rpm >= 0.8 ? 'good' : 'neutral',
    icon: '💸',
  };

  const _chart = {
    type: 'scale',
    marker: Number(rpm.toFixed(2)),
    markerLabel: `RPM $${rpm.toFixed(2)}`,
    min: 0,
    segments: [
      { nombre: 'Bajo', max: 0.2, color: '#f87171', colorDark: '#ef4444' },
      { nombre: 'Medio-bajo', max: 0.5, color: '#fbbf24', colorDark: '#f59e0b' },
      { nombre: 'Medio', max: 0.8, color: '#a3e635', colorDark: '#84cc16' },
      { nombre: 'Alto (tier 1)', max: Math.max(1.2, Number((rpm * 1.15).toFixed(2))), color: '#4ade80', colorDark: '#22c55e' },
    ],
    ariaLabel: `RPM de $${rpm.toFixed(2)} ubicado en el nivel: ${nivel}`,
  };

  return {
    ingresoMensual: `${mensualFmt} USD/mes`,
    ingresoAnual: `$${anual.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD/año`,
    vistasPorDolar: `${Math.round(vpd).toLocaleString('en-US')} vistas por dólar`,
    nivel,
    _insight,
    _chart,
  };
}
