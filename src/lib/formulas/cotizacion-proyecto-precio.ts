/** Cotizacion de proyecto freelance */
export interface Inputs { horasEstimadas: number; rateHora: number; bufferPct: number; margenPct: number; }
export interface Outputs { precioFinal: number; precioBase: number; montoBuffer: number; montoMargen: number; horasConBuffer: number; }
export function cotizacionProyectoPrecio(i: Inputs): Outputs {
  const hs = Number(i.horasEstimadas);
  const rate = Number(i.rateHora);
  const buf = Number(i.bufferPct) / 100;
  const mar = Number(i.margenPct) / 100;
  if (!hs || hs <= 0) throw new Error('Ingresá horas');
  if (!rate || rate <= 0) throw new Error('Ingresá rate');
  const base = hs * rate;
  const montoBuffer = base * buf;
  const subtotal = base + montoBuffer;
  const montoMargen = subtotal * mar;
  const final = subtotal + montoMargen;
  return {
    precioFinal: Math.round(final),
    precioBase: Math.round(base),
    montoBuffer: Math.round(montoBuffer),
    montoMargen: Math.round(montoMargen),
    horasConBuffer: Math.round(hs * (1 + buf))
  };
}
