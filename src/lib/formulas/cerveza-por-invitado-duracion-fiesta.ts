/**
 * Calculadora de Cerveza por Invitado según Duración de la Fiesta
 * Base: 500 ml primera hora + 300 ml por hora adicional, ajustes por clima y única bebida.
 */

export interface CervezaPorInvitadoFiestaInputs {
  invitados: number;
  horas: number;
  clima: string;
  unicaBebida: string;
}

export interface CervezaPorInvitadoFiestaOutputs {
  litrosTotales: number;
  latas473: number;
  botellas1L: number;
  barril30L: number;
  litrosPorPersona: number;
  _insight?: any;
}

export function cervezaPorInvitadoFiesta(
  inputs: CervezaPorInvitadoFiestaInputs
): CervezaPorInvitadoFiestaOutputs {
  const invitados = Number(inputs.invitados);
  const horas = Number(inputs.horas);
  const clima = inputs.clima;
  const unica = inputs.unicaBebida;

  if (!invitados || invitados <= 0) throw new Error('Ingresá invitados válidos');
  if (!horas || horas <= 0) throw new Error('Ingresá una duración válida');

  let litrosPorPersona = 0.5 + 0.3 * Math.max(0, horas - 1);

  if (clima === 'verano') litrosPorPersona *= 1.3;
  else if (clima === 'invierno') litrosPorPersona *= 0.85;

  if (unica === 'si') litrosPorPersona *= 1.5;

  const litrosTotales = litrosPorPersona * invitados;
  const latas473 = Math.ceil(litrosTotales / 0.473);
  const botellas1L = Math.ceil(litrosTotales);
  const barril30L = Math.ceil(litrosTotales / 30);

  const lpp = Number(litrosPorPersona.toFixed(2));
  const ltot = Number(litrosTotales.toFixed(1));
  const climaTxt = clima === 'verano' ? ' (ajustado por calor de verano)' : clima === 'invierno' ? ' (ajustado a la baja por el frío)' : '';
  const _insight = {
    title: 'Cerveza por persona y total',
    text: `Con **${horas} h** de fiesta calculá **${lpp.toLocaleString('es-AR')} L por persona**${climaTxt}${unica === 'si' ? ', tomando que la cerveza es la única bebida' : ''}. Para **${invitados}** invitados son **${ltot.toLocaleString('es-AR')} L**: comprá **${latas473} latas** de 473 ml o **${botellas1L} botellas** de litro${barril30L === 1 ? ', o 1 barril de 30 L' : barril30L > 1 ? `, o ${barril30L} barriles de 30 L` : ''}.`,
    tone: 'neutral',
    icon: '🍻',
  };
  return {
    litrosTotales: ltot,
    latas473,
    botellas1L,
    barril30L,
    litrosPorPersona: lpp,
    _insight,
  };
}
