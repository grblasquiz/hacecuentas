/**
 * Calculadora de Achuras por Invitado - Parrilla.
 */
export interface AchurasPorInvitadoParrillaInputs { invitados:number; nivelAchurero:string; }
export interface AchurasPorInvitadoParrillaOutputs { kgMolleja:number; kgChinchulines:number; kgRinon:number; morcillas:number; kgTotal:number; }
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
  const kgTotal = Number((kgMolleja + kgChinchulines + kgRinon + morcillas * 0.15).toFixed(2));
  return { kgMolleja, kgChinchulines, kgRinon, morcillas, kgTotal };
}
