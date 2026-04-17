/**
 * Calculadora de Agua por Invitado - Fiesta.
 * Base: 0.5 L templado, 1 L verano, 0.4 L invierno.
 */

export interface AguaPorInvitadoFiestaInputs {
  invitados: number;
  horas: number;
  clima: string;
}

export interface AguaPorInvitadoFiestaOutputs {
  litrosTotales: number;
  botellas500: number;
  bidones20L: number;
  litrosPorPersona: number;
}

export function aguaPorInvitadoFiesta(
  inputs: AguaPorInvitadoFiestaInputs
): AguaPorInvitadoFiestaOutputs {
  const invitados = Number(inputs.invitados);
  const horas = Number(inputs.horas);
  const clima = inputs.clima;

  if (!invitados || invitados <= 0) throw new Error('Ingresá invitados válidos');
  if (!horas || horas <= 0) throw new Error('Ingresá duración válida');

  let litrosPorPersona = 0.5;
  if (clima === 'verano') litrosPorPersona = 1.0;
  else if (clima === 'invierno') litrosPorPersona = 0.4;

  if (horas >= 6) litrosPorPersona *= 1.15;

  const litrosTotales = litrosPorPersona * invitados * 1.1;
  const botellas500 = Math.ceil(litrosTotales / 0.5);
  const bidones20L = Math.ceil(litrosTotales / 20);

  return {
    litrosTotales: Number(litrosTotales.toFixed(1)),
    botellas500,
    bidones20L,
    litrosPorPersona: Number(litrosPorPersona.toFixed(2)),
  };
}
