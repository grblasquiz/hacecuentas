/**
 * Calculadora de Canapé por Invitado - Cóctel.
 */
export interface CanapePorInvitadoCoctelInputs { invitados:number; horas:number; tipoEvento:string; }
export interface CanapePorInvitadoCoctelOutputs { canapesTotales:number; canapesPorPersona:number; variedades:number; costoEstimado:number; }
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
  return {
    canapesTotales,
    canapesPorPersona: Number(porPersona.toFixed(1)),
    variedades,
    costoEstimado: Number((canapesTotales * 1.5).toFixed(0)),
  };
}
