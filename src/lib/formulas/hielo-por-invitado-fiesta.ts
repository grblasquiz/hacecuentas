/**
 * Calculadora de Hielo por Invitado - Fiesta.
 */
export interface HieloPorInvitadoFiestaInputs { invitados:number; horas:number; clima:string; usoTragos:string; }
export interface HieloPorInvitadoFiestaOutputs { kgHielo:number; bolsas3kg:number; bolsas5kg:number; gramosPorPersona:number; }
export function hieloPorInvitadoFiesta(inputs: HieloPorInvitadoFiestaInputs): HieloPorInvitadoFiestaOutputs {
  const invitados = Number(inputs.invitados);
  const horas = Number(inputs.horas);
  const clima = inputs.clima;
  const uso = inputs.usoTragos;
  if (!invitados || invitados <= 0) throw new Error('Ingresá invitados válidos');
  if (!horas || horas <= 0) throw new Error('Ingresá duración válida');
  let gramos = uso === 'si' ? 400 : 200;
  if (clima === 'verano') gramos *= 2;
  else if (clima === 'invierno') gramos *= 0.6;
  if (horas >= 5) gramos *= 1.15;
  const kgHielo = (gramos * invitados) / 1000;
  return {
    kgHielo: Number(kgHielo.toFixed(1)),
    bolsas3kg: Math.ceil(kgHielo / 3),
    bolsas5kg: Math.ceil(kgHielo / 5),
    gramosPorPersona: Math.round(gramos),
  };
}
