/**
 * Calculadora de Chorizos por Invitado - Asado.
 * Base: 1-2 previa, 3-4 principal, 0.5-1 acompañamiento.
 */
export interface ChorizosPorInvitadoAsadoInputs { invitados:number; rolDelChorizo:string; ninos:number; }
export interface ChorizosPorInvitadoAsadoOutputs { chorizosTotales:number; kgChorizos:number; chorizosPorPersona:number; panes:number; }
export function chorizosPorInvitadoAsado(inputs: ChorizosPorInvitadoAsadoInputs): ChorizosPorInvitadoAsadoOutputs {
  const total = Number(inputs.invitados);
  const ninos = Number(inputs.ninos);
  const rol = inputs.rolDelChorizo;
  if (!total || total <= 0) throw new Error('Ingresá invitados');
  if (ninos < 0 || ninos > total) throw new Error('Niños inválidos');
  const adultos = total - ninos;
  let adultoFactor = 1.5;
  if (rol === 'principal') adultoFactor = 3.5;
  else if (rol === 'acompanamiento') adultoFactor = 0.75;
  const ninoFactor = adultoFactor * 0.4;
  const chorizosTotales = Math.ceil((adultos * adultoFactor + ninos * ninoFactor) * 1.1);
  const kgChorizos = Number((chorizosTotales * 0.11).toFixed(2));
  return {
    chorizosTotales,
    kgChorizos,
    chorizosPorPersona: Number(((adultos * adultoFactor + ninos * ninoFactor) / total).toFixed(1)),
    panes: Math.ceil(chorizosTotales * 1.15),
  };
}
