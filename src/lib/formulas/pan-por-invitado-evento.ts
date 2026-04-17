/**
 * Calculadora de Pan por Invitado - Evento.
 */
export interface PanPorInvitadoEventoInputs { invitados:number; tipoEvento:string; }
export interface PanPorInvitadoEventoOutputs { panesTotales:number; kgPan:number; mignones:number; flautas:number; }
export function panPorInvitadoEvento(inputs: PanPorInvitadoEventoInputs): PanPorInvitadoEventoOutputs {
  const inv = Number(inputs.invitados);
  const tipo = inputs.tipoEvento;
  if (!inv || inv <= 0) throw new Error('Ingresá invitados');
  let panesPorPersona = 1;
  if (tipo === 'cena') panesPorPersona = 1.5;
  else if (tipo === 'hamburguesas') panesPorPersona = 1;
  else if (tipo === 'picada') panesPorPersona = 1.25;
  const panesTotales = Math.ceil(inv * panesPorPersona * 1.15);
  const kgPan = Number((panesTotales * 0.08).toFixed(2));
  const mignones = panesTotales;
  const flautas = Math.ceil(panesTotales / 3);
  return { panesTotales, kgPan, mignones, flautas };
}
