/**
 * Calculadora de Vino por Invitado - Cena.
 * Base: 1 botella 750 ml = 5 copas 150 ml, media botella por adulto en cena tradicional.
 */

export interface VinoPorInvitadoCenaInputs {
  invitados: number;
  horas: number;
  tipo: string;
}

export interface VinoPorInvitadoCenaOutputs {
  botellas: number;
  copasPorPersona: number;
  litrosTotales: number;
  botellasTinto: number;
  botellasBlanco: number;
}

export function vinoPorInvitadoCena(
  inputs: VinoPorInvitadoCenaInputs
): VinoPorInvitadoCenaOutputs {
  const invitados = Number(inputs.invitados);
  const horas = Number(inputs.horas);
  const tipo = inputs.tipo;

  if (!invitados || invitados <= 0) throw new Error('Ingresá invitados válidos');
  if (!horas || horas <= 0) throw new Error('Ingresá duración válida');

  let botellasPorPersona = 0.5;
  if (tipo === 'cata') botellasPorPersona = 0.4;
  else if (tipo === 'cocktail') botellasPorPersona = 0.3;

  if (horas >= 5) botellasPorPersona *= 1.25;
  else if (horas <= 2) botellasPorPersona *= 0.8;

  const botellas = Math.ceil(invitados * botellasPorPersona * 1.1);
  const copasPorPersona = (botellas * 5) / invitados;
  const litrosTotales = botellas * 0.75;
  const botellasTinto = Math.ceil(botellas * 0.6);
  const botellasBlanco = botellas - botellasTinto;

  return {
    botellas,
    copasPorPersona: Number(copasPorPersona.toFixed(1)),
    litrosTotales: Number(litrosTotales.toFixed(2)),
    botellasTinto,
    botellasBlanco,
  };
}
