/** TikTok Diamonds a Dólares */
export interface Inputs { diamantes: number; comision: number; }
export interface Outputs { bruto: string; neto: string; retiroMinimo: string; equivalenteRegalos: string; }

export function tiktokLiveDiamondsDolares(i: Inputs): Outputs {
  const d = Number(i.diamantes);
  const com = Number(i.comision);
  if (d < 0) throw new Error('Ingresá una cantidad válida');
  if (com < 0 || com > 100) throw new Error('Comisión inválida');
  const VALOR = 0.005;
  const bruto = d * VALOR;
  const neto = bruto * (1 - com / 100);
  const retiro = neto >= 100 ? 'Sí — superás el mínimo de 100 USD' : `No — te faltan $${(100 - neto).toFixed(2)} USD`;
  const galaxias = Math.floor(d / 500);
  const leones = (d / 15000).toFixed(2);
  return {
    bruto: `$${bruto.toFixed(2)} USD`,
    neto: `$${neto.toFixed(2)} USD`,
    retiroMinimo: retiro,
    equivalenteRegalos: `${galaxias} galaxias o ${leones} leones`,
  };
}
