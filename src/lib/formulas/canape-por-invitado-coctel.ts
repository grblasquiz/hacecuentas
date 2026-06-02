/**
 * Calculadora de Canapé por Invitado - Cóctel.
 */
export interface CanapePorInvitadoCoctelInputs { invitados:number; horas:number; tipoEvento:string; }
export interface CanapePorInvitadoCoctelOutputs { canapesTotales:number; canapesPorPersona:number; variedades:number; costoEstimado:number; _insight?:any; }
export function canapePorInvitadoCoctel(inputs: CanapePorInvitadoCoctelInputs): CanapePorInvitadoCoctelOutputs {
  const inv = Number(inputs.invitados);
  const horas = Number(inputs.horas);
  const tipo = inputs.tipoEvento;
  if (!inv || inv <= 0) throw new Error('Ingresá invitados');
  if (!horas || horas <= 0) throw new Error('Ingresá duración');
  let porPersona = 7;
  if (tipo === 'coctelCena') porPersona = 13;
  else if (tipo === 'aperitivo') porPersona = 4.5;
  if (horas > 2) porPersona *= 1.15;
  const canapesTotales = Math.ceil(inv * porPersona);
  let variedades = 4;
  if (inv >= 50) variedades = 6;
  if (inv >= 100) variedades = 8;
  if (inv >= 200) variedades = 10;
  const porPersonaR = Number(porPersona.toFixed(1));
  const costo = Number((canapesTotales * 1.5).toFixed(0));
  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });
  const fmt1 = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 });
  const horasTxt = horas > 2 ? ` Como el evento dura más de 2 h, sumamos un 15% extra por persona.` : '';

  return {
    canapesTotales,
    canapesPorPersona: porPersonaR,
    variedades,
    costoEstimado: costo,
    _insight: {
      title: 'Tu picada en números',
      text: `Para **${fmt.format(inv)} invitados** preparás unos **${fmt.format(canapesTotales)} canapés** (${fmt1.format(porPersonaR)} por persona) en **${variedades} variedades**, con un costo estimado de **$${fmt.format(costo)}**.${horasTxt} Pedí un 10% extra para cubrir a los más comelones.`,
      tone: 'neutral',
      icon: '🍤',
    },
  };
}
