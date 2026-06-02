/** Precio mensual coliving destinos top nómadas digitales */
export interface Inputs { destino: 'canggu' | 'medellin' | 'cdmx' | 'lisboa' | 'lisbonOther'; tipoHabitacion: 'compartida' | 'privada' | 'suite'; meses: number; coworking: boolean; }
export interface Outputs { precioMensualUsd: number; totalEstanciaUsd: number; descuentoLargaEstanciaUsd: number; explicacion: string; _insight?: any; _chart?: any; }
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
  const pctDesc = bruto > 0 ? Math.round((descuento / bruto) * 100) : 0;
  const _insight = {
    title: descuento > 0 ? 'Quedarte más tiempo te conviene' : 'Sin descuento todavía',
    text: descuento > 0
      ? `Por reservar **${meses} meses** activás el descuento de larga estancia: te ahorrás **USD ${descuento.toLocaleString('es-AR')}** (${pctDesc}%) y la estadía completa queda en **USD ${total.toLocaleString('es-AR')}**, o sea USD ${Math.round(total / meses).toLocaleString('es-AR')}/mes efectivos.`
      : `Con **${meses} ${meses === 1 ? 'mes' : 'meses'}** todavía no aplica descuento: la estadía sale **USD ${total.toLocaleString('es-AR')}**. A partir de 2 meses arrancás con 5% off y desde 3 meses con 10%.`,
    tone: descuento > 0 ? 'good' : 'neutral',
    icon: '🌴',
  };
  const _chart = descuento > 0 ? {
    type: 'doughnut',
    slices: [
      { label: 'Pagás', value: Number(total.toFixed(2)) },
      { label: 'Ahorro larga estancia', value: Number(descuento.toFixed(2)) },
    ],
    prefix: '$',
    centerValue: `$${Math.round(bruto).toLocaleString('es-AR')}`,
    centerLabel: 'Sin descuento',
    ariaLabel: `De USD ${Math.round(bruto)} sin descuento, pagás USD ${Math.round(total)} y ahorrás USD ${Math.round(descuento)}`,
  } : undefined;
  return {
    precioMensualUsd: Number(precio.toFixed(2)),
    totalEstanciaUsd: Number(total.toFixed(2)),
    descuentoLargaEstanciaUsd: Number(descuento.toFixed(2)),
    explicacion: `${i.destino} ${i.tipoHabitacion}${i.coworking ? ' con coworking' : ' sin coworking'}: USD ${precio}/mes × ${meses} meses = USD ${bruto.toLocaleString('es-AR')}. Descuento larga estancia: USD ${descuento.toFixed(2)}. Total: USD ${total.toLocaleString('es-AR')}.`,
    _insight,
    _chart,
  };
}
