/**
 * Calculadora de Masitas Dulces por Invitado - Casamiento.
 */
export interface MasitasDulcesPorInvitadoCasamientoInputs { invitados:number; rol:string; }
export interface MasitasDulcesPorInvitadoCasamientoOutputs { masitas:number; docenas:number; variedades:number; costoEstimado:number; }
export function masitasDulcesPorInvitadoCasamiento(inputs: MasitasDulcesPorInvitadoCasamientoInputs): MasitasDulcesPorInvitadoCasamientoOutputs {
  const inv = Number(inputs.invitados);
  const rol = inputs.rol;
  if (!inv || inv <= 0) throw new Error('Ingresá invitados');
  let porPersona = 7;
  if (rol === 'acompPostre') porPersona = 3.5;
  else if (rol === 'cafeCorte') porPersona = 2.5;
  const masitas = Math.ceil(inv * porPersona);
  let variedades = 4;
  if (inv >= 30) variedades = 6;
  if (inv >= 50) variedades = 8;
  if (inv >= 150) variedades = 10;
  return {
    masitas,
    docenas: Math.ceil(masitas / 12),
    variedades,
    costoEstimado: Number((masitas * 0.8).toFixed(0)),
  };
}
