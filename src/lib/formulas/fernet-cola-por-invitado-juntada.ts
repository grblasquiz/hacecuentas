/**
 * Calculadora de Fernet y Cola por Invitado
 * Base: 2.5 fernets/persona en juntada 4-6h, vaso 300 ml.
 */

export interface FernetColaPorInvitadoJuntadaInputs {
  invitados: number;
  horas: number;
  proporcion: string;
}

export interface FernetColaPorInvitadoJuntadaOutputs {
  litrosFernet: number;
  litrosCola: number;
  botellas750: number;
  botellasCola225: number;
  fernetsPorPersona: number;
}

export function fernetColaPorInvitadoJuntada(
  inputs: FernetColaPorInvitadoJuntadaInputs
): FernetColaPorInvitadoJuntadaOutputs {
  const invitados = Number(inputs.invitados);
  const horas = Number(inputs.horas);
  const prop = inputs.proporcion;

  if (!invitados || invitados <= 0) throw new Error('Ingresá invitados válidos');
  if (!horas || horas <= 0) throw new Error('Ingresá una duración válida');

  let fernetsPorPersona = 2 + Math.max(0, Math.min(horas - 4, 2)) * 0.5;
  if (horas < 3) fernetsPorPersona = 1.5;

  const vasoMl = 300;
  let fernetPct = 0.5, colaPct = 0.5;
  if (prop === '3070') { fernetPct = 0.3; colaPct = 0.7; }
  else if (prop === '7030') { fernetPct = 0.7; colaPct = 0.3; }

  const totalFernets = fernetsPorPersona * invitados;
  const litrosFernet = (totalFernets * vasoMl * fernetPct) / 1000;
  const litrosCola = (totalFernets * vasoMl * colaPct) / 1000;
  const botellas750 = Math.ceil(litrosFernet / 0.75);
  const botellasCola225 = Math.ceil(litrosCola / 2.25);

  return {
    litrosFernet: Number(litrosFernet.toFixed(1)),
    litrosCola: Number(litrosCola.toFixed(1)),
    botellas750,
    botellasCola225,
    fernetsPorPersona: Number(fernetsPorPersona.toFixed(1)),
  };
}
