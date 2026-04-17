/** Substack Suscriptores Meta */
export interface Inputs { metaMensual: number; precioMensual: number; pctAnual: number; }
export interface Outputs { suscriptoresNecesarios: string; ingresoBruto: string; comisionFees: string; ingresoNeto: string; }

export function substackSuscriptoresMeta(i: Inputs): Outputs {
  const meta = Number(i.metaMensual);
  const pm = Number(i.precioMensual);
  const pctA = Number(i.pctAnual);
  if (meta <= 0 || pm < 5) throw new Error('Valores inválidos');
  const pctM = 100 - pctA;
  const precioAnualMensualizado = pm * 0.84;
  const precioEfectivo = (pm * pctM / 100) + (precioAnualMensualizado * pctA / 100);
  const netoSub = precioEfectivo * 0.9 - (precioEfectivo * 0.029 + 0.30 / 12);
  const subs = Math.ceil(meta / netoSub);
  const bruto = subs * precioEfectivo;
  const feesCom = bruto - subs * netoSub;
  return {
    suscriptoresNecesarios: `${subs.toLocaleString('es-AR')} subs pagos`,
    ingresoBruto: `$${bruto.toFixed(2)} USD/mes`,
    comisionFees: `$${feesCom.toFixed(2)} USD (Substack 10% + Stripe 3%)`,
    ingresoNeto: `$${(subs * netoSub).toFixed(2)} USD`,
  };
}
