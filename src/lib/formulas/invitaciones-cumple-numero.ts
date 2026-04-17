/**
 * Calculadora de Invitaciones.
 */
export interface InvitacionesCumpleNumeroInputs { invitados:number; formato:string; }
export interface InvitacionesCumpleNumeroOutputs { invitacionesAImprimir:number; costoTotal:number; costoUnidad:number; tiempoEnvio:number; }
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
  return {
    invitacionesAImprimir,
    costoTotal,
    costoUnidad: Number(costoUnidad.toFixed(2)),
    tiempoEnvio,
  };
}
