/** Calculadora de Gasto en Suscripciones */
export interface Inputs { netflix?: number; spotify?: number; gamepass?: number; disney?: number; youtube?: number; otros?: number; }
export interface Outputs { totalMensual: number; totalAnual: number; costoDiario: number; mensaje: string; _insight?: any; _chart?: any; }

export function costoSuscripcionesMensual(i: Inputs): Outputs {
  const n = Number(i.netflix) || 0;
  const s = Number(i.spotify) || 0;
  const g = Number(i.gamepass) || 0;
  const d = Number(i.disney) || 0;
  const y = Number(i.youtube) || 0;
  const o = Number(i.otros) || 0;

  const totalMensual = n + s + g + d + y + o;
  if (totalMensual <= 0) throw new Error('Ingresá al menos una suscripción');

  const totalAnual = totalMensual * 12;
  const costoDiario = totalMensual / 30;

  let subs = 0;
  if (n > 0) subs++;
  if (s > 0) subs++;
  if (g > 0) subs++;
  if (d > 0) subs++;
  if (y > 0) subs++;
  if (o > 0) subs++;

  let mensaje = `${subs} suscripciones = $${totalMensual.toLocaleString()}/mes, $${totalAnual.toLocaleString()}/año. `;
  let tone: 'good' | 'warn' | 'neutral';
  if (totalMensual > 30000) { mensaje += 'Gasto alto — revisá cuáles realmente usás.'; tone = 'warn'; }
  else if (totalMensual > 15000) { mensaje += 'Gasto moderado — normal para un hogar con entretenimiento digital.'; tone = 'neutral'; }
  else { mensaje += 'Gasto contenido — buena gestión de suscripciones.'; tone = 'good'; }

  const _insight = {
    title: tone === 'warn' ? 'Pila de suscripciones cara' : tone === 'good' ? 'Suscripciones bajo control' : 'Gasto digital moderado',
    text: tone === 'warn'
      ? `Tus **${subs} suscripciones** suman **$${totalMensual.toLocaleString()}/mes** y **$${totalAnual.toLocaleString()}/año**. Dar de baja una sola te ahorraría una parte de esos $${totalAnual.toLocaleString()} anuales.`
      : `Tus **${subs} suscripciones** cuestan **$${totalMensual.toLocaleString()}/mes** ($${costoDiario.toFixed(0)}/día), unos **$${totalAnual.toLocaleString()} al año**. Un nivel razonable de entretenimiento digital.`,
    tone,
    icon: '📺',
  };

  const slices = [
    { label: 'Netflix', value: n },
    { label: 'Spotify', value: s },
    { label: 'Game Pass', value: g },
    { label: 'Disney+', value: d },
    { label: 'YouTube', value: y },
    { label: 'Otros', value: o },
  ].filter(x => x.value > 0);

  const _chart = slices.length > 1 ? {
    type: 'doughnut',
    slices,
    prefix: '$',
    centerValue: `$${totalMensual.toLocaleString()}`,
    centerLabel: 'Por mes',
    ariaLabel: `Gráfico de torta del gasto mensual en suscripciones, total $${totalMensual.toLocaleString()}`,
  } : undefined;

  const out: Outputs = { totalMensual, totalAnual, costoDiario: Number(costoDiario.toFixed(0)), mensaje, _insight };
  if (_chart) out._chart = _chart;
  return out;
}
