/** Precio mensual coliving destinos top nómadas digitales */
export interface Inputs { destino: 'canggu' | 'medellin' | 'cdmx' | 'lisboa' | 'lisbonOther'; tipoHabitacion: 'compartida' | 'privada' | 'suite'; meses: number; coworking: boolean; }
export interface Outputs { precioMensualUsd: number; totalEstanciaUsd: number; descuentoLargaEstanciaUsd: number; explicacion: string; }
export function colivingPrecioMesBaliMedellinMexico(i: Inputs): Outputs {
  const meses = Number(i.meses);
  if (!meses || meses <= 0) throw new Error('Ingresá la cantidad de meses');
  const tabla: Record<string, Record<string, number>> = {
    canggu:      { compartida: 550, privada: 950, suite: 1500 },
    medellin:    { compartida: 600, privada: 1100, suite: 1800 },
    cdmx:        { compartida: 700, privada: 1300, suite: 2100 },
    lisboa:      { compartida: 850, privada: 1500, suite: 2400 },
    lisbonOther: { compartida: 700, privada: 1200, suite: 2000 },
  };
  const base = tabla[i.destino]?.[i.tipoHabitacion];
  if (!base) throw new Error('Destino o tipo inválido');
  const cowork = i.coworking ? 0 : -100;
  const precio = base + cowork;
  const bruto = precio * meses;
  const descuento = meses >= 3 ? bruto * 0.1 : meses >= 2 ? bruto * 0.05 : 0;
  const total = bruto - descuento;
  return {
    precioMensualUsd: Number(precio.toFixed(2)),
    totalEstanciaUsd: Number(total.toFixed(2)),
    descuentoLargaEstanciaUsd: Number(descuento.toFixed(2)),
    explicacion: `${i.destino} ${i.tipoHabitacion}${i.coworking ? ' con coworking' : ' sin coworking'}: USD ${precio}/mes × ${meses} meses = USD ${bruto.toLocaleString('es-AR')}. Descuento larga estancia: USD ${descuento.toFixed(2)}. Total: USD ${total.toLocaleString('es-AR')}.`,
  };
}
