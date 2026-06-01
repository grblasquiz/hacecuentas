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
  _insight?: any;
  _chart?: any;
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

  const consumoBase = litrosPorPersona * invitados;
  const margen = litrosTotales - consumoBase; // 10% de reserva
  const _insight = {
    title: 'Cuánta agua comprar',
    text: `Para ${invitados} invitados durante ${horas} h${clima === 'verano' ? ' en verano' : clima === 'invierno' ? ' en invierno' : ''} comprá **${Number(litrosTotales.toFixed(1))} L** (~**${botellas500} botellas** de 500 ml o **${bidones20L} bidón${bidones20L > 1 ? 'es' : ''}** de 20 L). Ya incluye un 10% de reserva por si se alarga.`,
    tone: 'neutral',
    icon: '🥤',
  };

  return {
    litrosTotales: Number(litrosTotales.toFixed(1)),
    botellas500,
    bidones20L,
    litrosPorPersona: Number(litrosPorPersona.toFixed(2)),
    _insight,
    _chart: {
      type: 'doughnut',
      slices: [
        { label: 'Consumo estimado', value: Number(consumoBase.toFixed(1)) },
        { label: 'Reserva (10%)', value: Number(margen.toFixed(1)) },
      ],
      prefix: '',
      centerValue: `${Number(litrosTotales.toFixed(1))} L`,
      centerLabel: 'a comprar',
      ariaLabel: `De ${Number(litrosTotales.toFixed(1))} litros totales, ${Number(consumoBase.toFixed(1))} son consumo y ${Number(margen.toFixed(1))} de reserva`,
    },
  };
}
