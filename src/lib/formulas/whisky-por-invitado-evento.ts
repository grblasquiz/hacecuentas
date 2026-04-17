/**
 * Calculadora de Whisky por Invitado - Evento.
 * Base: medida 45 ml, botella 750 ml = 16 medidas.
 */

export interface WhiskyPorInvitadoEventoInputs {
  invitados: number;
  horas: number;
  perfil: string;
}

export interface WhiskyPorInvitadoEventoOutputs {
  litrosWhisky: number;
  botellas750: number;
  medidasTotales: number;
  medidasPorPersona: number;
}

export function whiskyPorInvitadoEvento(
  inputs: WhiskyPorInvitadoEventoInputs
): WhiskyPorInvitadoEventoOutputs {
  const invitados = Number(inputs.invitados);
  const horas = Number(inputs.horas);
  const perfil = inputs.perfil;

  if (!invitados || invitados <= 0) throw new Error('Ingresá invitados válidos');
  if (!horas || horas <= 0) throw new Error('Ingresá duración válida');

  let medidasPorPersona = 2;
  if (perfil === 'bajo') medidasPorPersona = 1;
  else if (perfil === 'alto') medidasPorPersona = 4;

  if (horas >= 6) medidasPorPersona *= 1.25;
  else if (horas <= 2) medidasPorPersona *= 0.8;

  const medidasTotales = Math.round(medidasPorPersona * invitados);
  const litrosWhisky = (medidasTotales * 45) / 1000;
  const botellas750 = Math.ceil((litrosWhisky * 1.1) / 0.75);

  return {
    litrosWhisky: Number(litrosWhisky.toFixed(2)),
    botellas750,
    medidasTotales,
    medidasPorPersona: Number(medidasPorPersona.toFixed(1)),
  };
}
