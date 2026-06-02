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
  _insight?: any;
  _chart?: any;
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

  const lFernet = Number(litrosFernet.toFixed(1));
  const lCola = Number(litrosCola.toFixed(1));
  const totalLitros = Number((lFernet + lCola).toFixed(1));
  const fpp = Number(fernetsPorPersona.toFixed(1));

  const _insight = {
    title: 'Tu lista para la juntada',
    text: `Para **${invitados}** invitados (${fpp} fernets c/u) vas a necesitar **${botellas750}** botella${botellas750 === 1 ? '' : 's'} de fernet de 750 ml y **${botellasCola225}** de cola de 2,25 L. En total se sirven unos **${totalLitros} L** de trago.`,
    tone: 'neutral' as const,
    icon: '🥃',
  };
  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Fernet', value: lFernet },
      { label: 'Cola', value: lCola },
    ],
    prefix: '',
    centerValue: `${totalLitros} L`,
    centerLabel: 'Total trago',
    ariaLabel: `Del total de ${totalLitros} litros de trago, ${lFernet} litros son de fernet y ${lCola} de cola.`,
  };

  return {
    litrosFernet: lFernet,
    litrosCola: lCola,
    botellas750,
    botellasCola225,
    fernetsPorPersona: fpp,
    _insight,
    _chart,
  };
}
