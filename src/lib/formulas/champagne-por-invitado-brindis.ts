/**
 * Calculadora de Champagne por Invitado - Brindis.
 * Base: 1 botella 750 ml = 6 copas flauta de 125 ml.
 */

export interface ChampagnePorInvitadoBrindisInputs {
  invitados: number;
  copasPorPersona: number;
  formato: string;
}

export interface ChampagnePorInvitadoBrindisOutputs {
  botellas: number;
  copasTotales: number;
  litros: number;
  costoEstimado: number;
}

export function champagnePorInvitadoBrindis(
  inputs: ChampagnePorInvitadoBrindisInputs
): ChampagnePorInvitadoBrindisOutputs {
  const invitados = Number(inputs.invitados);
  const copas = Number(inputs.copasPorPersona);
  const formato = inputs.formato;

  if (!invitados || invitados <= 0) throw new Error('Ingresá invitados válidos');
  if (!copas || copas <= 0) throw new Error('Ingresá copas por persona');

  const copasTotales = invitados * copas;
  const copasPorBotella = formato === '1500' ? 12 : 6;
  const botellas = Math.ceil((copasTotales * 1.1) / copasPorBotella);
  const litros = botellas * (formato === '1500' ? 1.5 : 0.75);
  const precioUnit = formato === '1500' ? 22 : 12;

  return {
    botellas,
    copasTotales,
    litros: Number(litros.toFixed(1)),
    costoEstimado: botellas * precioUnit,
  };
}
