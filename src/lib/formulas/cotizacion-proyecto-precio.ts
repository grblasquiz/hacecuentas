/** Cotizacion de proyecto freelance */
export interface Inputs { horasEstimadas: number; rateHora: number; bufferPct: number; margenPct: number; }
export interface Outputs { precioFinal: number; precioBase: number; montoBuffer: number; montoMargen: number; horasConBuffer: number; _insight?: any; _chart?: any; }
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
  const baseR = Math.round(base);
  const bufR = Math.round(montoBuffer);
  const marR = Math.round(montoMargen);
  const totalSlices = baseR + bufR + marR;
  const margenPctReal = final > 0 ? (montoMargen / final) * 100 : 0;
  const _insight = {
    title: 'Tu precio de cotización',
    text: `Cotizá el proyecto en **$${Math.round(final)}**: $${baseR} de trabajo base (${hs}h × $${rate}), más $${bufR} de colchón por imprevistos y $${marR} de margen. El margen representa el **${margenPctReal.toFixed(0)}%** del precio final, tu ganancia real.`,
    tone: margenPctReal >= 15 ? 'good' : 'warn',
    icon: '💼',
  };
  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Trabajo base', value: baseR },
      { label: 'Buffer imprevistos', value: bufR },
      { label: 'Margen', value: marR },
    ],
    prefix: '$',
    centerValue: `$${totalSlices}`,
    centerLabel: 'Precio final',
    ariaLabel: `Composición del precio: trabajo base $${baseR}, buffer $${bufR}, margen $${marR}`,
  };
  return {
    precioFinal: Math.round(final),
    precioBase: baseR,
    montoBuffer: bufR,
    montoMargen: marR,
    horasConBuffer: Math.round(hs * (1 + buf)),
    _insight,
    _chart
  };
}
