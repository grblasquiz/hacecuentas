/**
 * Calculadora de Invitaciones.
 */
export interface InvitacionesCumpleNumeroInputs { invitados:number; formato:string; }
export interface InvitacionesCumpleNumeroOutputs { invitacionesAImprimir:number; costoTotal:number; costoUnidad:number; tiempoEnvio:number; _insight?:any; }
export function invitacionesCumpleNumero(inputs: InvitacionesCumpleNumeroInputs): InvitacionesCumpleNumeroOutputs {
  const inv = Number(inputs.invitados);
  const formato = inputs.formato;
  if (!inv || inv <= 0) throw new Error('Ingresá invitados');
  const invitacionesAImprimir = Math.ceil(inv * 0.55);
  let costoUnidad = 0;
  if (formato === 'impresa') costoUnidad = 0.75;
  else if (formato === 'premium') costoUnidad = 3.5;
  const costoTotal = Math.ceil(invitacionesAImprimir * costoUnidad);
  let tiempoEnvio = 30;
  if (inv >= 80) tiempoEnvio = 45;
  const esDigital = costoUnidad === 0;
  const _insight = {
    title: 'Cuántas invitaciones imprimir',
    text: esDigital
      ? `Para ${inv} invitados alcanza con **${invitacionesAImprimir} invitaciones** (se asume ~1 cada 1,8 invitados, por familias y parejas). En formato digital el costo es **$0**; envialas con **${tiempoEnvio} días** de anticipación.`
      : `Para ${inv} invitados conviene imprimir **${invitacionesAImprimir} invitaciones** (~1 cada 1,8 invitados), con un costo total de **$${costoTotal.toLocaleString('es-AR')}** ($${costoUnidad.toFixed(2)} c/u). Envialas con **${tiempoEnvio} días** de anticipación.`,
    tone: esDigital ? 'good' : 'neutral',
    icon: '🎉',
  };
  return {
    invitacionesAImprimir,
    costoTotal,
    costoUnidad: Number(costoUnidad.toFixed(2)),
    tiempoEnvio,
    _insight,
  };
}
