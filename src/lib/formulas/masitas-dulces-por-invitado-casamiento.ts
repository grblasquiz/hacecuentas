/**
 * Calculadora de Masitas Dulces por Invitado - Casamiento.
 */
export interface MasitasDulcesPorInvitadoCasamientoInputs { invitados:number; rol:string; }
export interface MasitasDulcesPorInvitadoCasamientoOutputs { masitas:number; docenas:number; variedades:number; costoEstimado:number; _insight?:any; }
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
  const docenas = Math.ceil(masitas / 12);
  const rolLabel = rol === 'acompPostre' ? 'acompañando el postre' : rol === 'cafeCorte' ? 'solo para el café/corte' : 'como mesa dulce principal';
  return {
    masitas,
    docenas,
    variedades,
    costoEstimado: Number((masitas * 0.8).toFixed(0)),
    _insight: {
      title: 'Tu mesa dulce',
      text: `Para **${inv} invitados** (${rolLabel}) calculá **${masitas} masitas** ≈ **${docenas} docenas**, repartidas en **${variedades} variedades** distintas para que no se repita el mismo bocado.`,
      tone: 'neutral',
      icon: '🍬',
    },
  };
}
