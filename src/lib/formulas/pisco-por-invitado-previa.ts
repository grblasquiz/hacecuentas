/**
 * Calculadora de Pisco por Invitado - Previa.
 * Base: 3 tragos/persona en 3h, sour/chilcano 60 ml o shot 45 ml.
 */

export interface PiscoPorInvitadoPreviaInputs {
  invitados: number;
  horas: number;
  trago: string;
}

export interface PiscoPorInvitadoPreviaOutputs {
  litrosPisco: number;
  botellas750: number;
  tragosTotales: number;
  tragosPorPersona: number;
  _insight?: any;
}

export function piscoPorInvitadoPrevia(
  inputs: PiscoPorInvitadoPreviaInputs
): PiscoPorInvitadoPreviaOutputs {
  const invitados = Number(inputs.invitados);
  const horas = Number(inputs.horas);
  const trago = inputs.trago;

  if (!invitados || invitados <= 0) throw new Error('Ingresá invitados válidos');
  if (!horas || horas <= 0) throw new Error('Ingresá duración válida');

  let tragosPorPersona = 2 + Math.max(0, horas - 2) * 0.5;
  if (horas <= 1.5) tragosPorPersona = 1.5;

  const mlPorTrago = trago === 'puro' ? 45 : 60;
  const tragosTotales = Math.round(tragosPorPersona * invitados);
  const litrosPisco = (tragosTotales * mlPorTrago) / 1000;
  const botellas750 = Math.ceil((litrosPisco * 1.1) / 0.75);

  return {
    litrosPisco: Number(litrosPisco.toFixed(2)),
    botellas750,
    tragosTotales,
    tragosPorPersona: Number(tragosPorPersona.toFixed(1)),
    _insight: {
      title: 'Cuánto pisco comprar',
      text: `Para **${invitados}** personas en **${horas} h** salen unos **${tragosTotales} tragos** (≈${litrosPisco.toFixed(2)} L): comprá **${botellas750} botella${botellas750 === 1 ? '' : 's'} de 750 ml**, ya con un 10% de colchón. Si la previa se estira o el grupo es de buen beber, sumá una botella extra.`,
      tone: 'neutral',
      icon: '🍸',
    },
  };
}
