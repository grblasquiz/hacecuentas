/**
 * Calculadora de Achuras por Invitado - Parrilla.
 */
export interface AchurasPorInvitadoParrillaInputs { invitados:number; nivelAchurero:string; }
export interface AchurasPorInvitadoParrillaOutputs { kgMolleja:number; kgChinchulines:number; kgRinon:number; morcillas:number; kgTotal:number; _chart?:any; }
export function achurasPorInvitadoParrilla(inputs: AchurasPorInvitadoParrillaInputs): AchurasPorInvitadoParrillaOutputs {
  const inv = Number(inputs.invitados);
  const nivel = inputs.nivelAchurero;
  if (!inv || inv <= 0) throw new Error('Ingresá invitados');
  let molleja = 0, chinchu = 0, rinon = 0, morcillasFactor = 0;
  if (nivel === 'bajo') { molleja = 0.15; }
  else if (nivel === 'medio') { molleja = 0.1; chinchu = 0.1; morcillasFactor = 1/4; }
  else { molleja = 0.1; chinchu = 0.15; rinon = 0.08; morcillasFactor = 1/3; }
  const kgMolleja = Number((inv * molleja).toFixed(2));
  const kgChinchulines = Number((inv * chinchu).toFixed(2));
  const kgRinon = Number((inv * rinon).toFixed(2));
  const morcillas = Math.ceil(inv * morcillasFactor);
  const kgMorcillas = Number((morcillas * 0.15).toFixed(2));
  const kgTotal = Number((kgMolleja + kgChinchulines + kgRinon + morcillas * 0.15).toFixed(2));
  // Donut: desglose del peso total en kg por tipo de achura.
  // En nivel 'bajo' solo hay molleja → 1 sola parte, no aplica donut.
  const slices = [
    { label: 'Molleja', value: kgMolleja },
    { label: 'Chinchulines', value: kgChinchulines },
    { label: 'Riñón', value: kgRinon },
    { label: 'Morcillas', value: kgMorcillas },
  ].filter((s) => s.value > 0);
  const chart = slices.length >= 2 ? {
    type: 'doughnut' as const,
    slices,
    prefix: '',
    centerValue: kgTotal.toLocaleString('es-AR') + ' kg',
    centerLabel: 'Total',
    ariaLabel: 'Composición en kilos de las achuras por tipo.',
  } : undefined;
  return { kgMolleja, kgChinchulines, kgRinon, morcillas, kgTotal, _chart: chart };
}
