/** Calculadora de Gasto en Suscripciones */
export interface Inputs { netflix?: number; spotify?: number; gamepass?: number; disney?: number; youtube?: number; otros?: number; }
export interface Outputs { totalMensual: number; totalAnual: number; costoDiario: number; mensaje: string; }

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
  if (totalMensual > 30000) mensaje += 'Gasto alto — revisá cuáles realmente usás.';
  else if (totalMensual > 15000) mensaje += 'Gasto moderado — normal para un hogar con entretenimiento digital.';
  else mensaje += 'Gasto contenido — buena gestión de suscripciones.';

  return { totalMensual, totalAnual, costoDiario: Number(costoDiario.toFixed(0)), mensaje };
}
