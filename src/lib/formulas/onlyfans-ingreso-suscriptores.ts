/** OnlyFans Ingreso Suscriptores */
export interface Inputs { suscriptores: number; precioMensual: number; ppvMensual: number; tipsMensual: number; }
export interface Outputs { bruto: string; comisionOF: string; neto: string; desglose: string; }

export function onlyfansIngresoSuscriptores(i: Inputs): Outputs {
  const s = Number(i.suscriptores) || 0;
  const p = Number(i.precioMensual) || 0;
  const ppv = Number(i.ppvMensual) || 0;
  const tips = Number(i.tipsMensual) || 0;
  if (s < 0 || p < 0) throw new Error('Valores inválidos');
  const subs = s * p;
  const bruto = subs + ppv + tips;
  const com = bruto * 0.20;
  const neto = bruto - com;
  const fmt = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`;
  return {
    bruto: fmt(bruto),
    comisionOF: fmt(com),
    neto: fmt(neto),
    desglose: `Subs: ${fmt(subs)} | PPV: ${fmt(ppv)} | Tips: ${fmt(tips)}`,
  };
}
