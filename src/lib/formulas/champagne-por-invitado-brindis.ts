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
  _insight?: any;
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
  const costoEstimado = botellas * precioUnit;

  const fmtFormato = formato === '1500' ? 'magnum (1,5 L)' : 'estándar (750 ml)';
  return {
    botellas,
    copasTotales,
    litros: Number(litros.toFixed(1)),
    costoEstimado,
    _insight: {
      title: 'Tu compra para el brindis',
      text: `Para ${invitados} invitados (${copas} ${copas === 1 ? 'copa' : 'copas'} c/u = ${copasTotales} copas) necesitás **${botellas} ${botellas === 1 ? 'botella' : 'botellas'}** ${fmtFormato}, unos **$${costoEstimado}**. Ya incluye un **10% de margen** por descorches y los que repiten.`,
      tone: 'neutral',
      icon: '🥂',
    },
  };
}
