export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function uvaHipotecaVsInflacionRiesgo(i: Inputs): Outputs {
  const c=Number(i.cuotaInicial)||0; const inf=Number(i.inflacionAnual)||0; const a=Number(i.anos)||0;
  const mult=(1+inf/100)**a; const cf=c*mult;
  const aumentoPct = Math.round((mult - 1) * 100);
  const tone = mult >= 2.5 ? 'warn' : mult >= 1.5 ? 'neutral' : 'good';
  const insight = {
    title: 'Cómo evoluciona tu cuota UVA',
    text: `Con **${inf}% de inflación anual** durante **${a} años**, la cuota pasa de **$${Math.round(c).toLocaleString('es-AR')}** a **$${Math.round(cf).toLocaleString('es-AR')}** (×${mult.toFixed(2)}, un **+${aumentoPct}%** nominal). El riesgo real depende de si tu sueldo le sigue el ritmo a la inflación: si tu ingreso ajusta menos que el UVA, la cuota te pesa cada vez más.`,
    tone,
    icon: '🏠',
  };
  const chart = {
    type: 'scale' as const,
    marker: Number(mult.toFixed(2)),
    markerLabel: `×${mult.toFixed(2)}`,
    min: 1,
    segments: [
      { nombre: 'Manejable', max: 1.5, color: '#16a34a', colorDark: '#22c55e' },
      { nombre: 'Atención', max: 2.5, color: '#f59e0b', colorDark: '#fbbf24' },
      { nombre: 'Alto riesgo', max: Math.max(4, Math.ceil(mult * 1.1)), color: '#dc2626', colorDark: '#ef4444' },
    ],
    ariaLabel: `Multiplicador de la cuota UVA: ×${mult.toFixed(2)} sobre la inflación acumulada`,
  };
  return { cuotaFinal:`$${Math.round(cf).toLocaleString('es-AR')}`, multiplicador:`${mult.toFixed(2)}x`, interpretacion:`Con ${inf}% inflación anual durante ${a} años, tu cuota UVA se multiplica por ${mult.toFixed(1)}.`, _insight: insight, _chart: chart };
}
