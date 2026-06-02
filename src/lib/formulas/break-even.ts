/** Punto de equilibrio (break-even) */
export interface Inputs {
  costosFijos: number;
  precioUnitario: number;
  costoVariableUnitario: number;
}
export interface Outputs {
  unidadesBreakEven: number;
  ventasBreakEven: number;
  margenContribucionUnitario: number;
  margenContribucionPorcentual: number;
  mensaje: string;
  _insight?: any;
  _chart?: any;
}

export function breakEven(i: Inputs): Outputs {
  const cf = Number(i.costosFijos);
  const pu = Number(i.precioUnitario);
  const cv = Number(i.costoVariableUnitario);
  if (!cf || cf <= 0) throw new Error('Ingresá los costos fijos');
  if (!pu || pu <= 0) throw new Error('Ingresá el precio unitario');
  if (cv < 0) throw new Error('Costo variable inválido');

  const margenUnitario = pu - cv;
  if (margenUnitario <= 0) throw new Error('El precio debe ser mayor al costo variable para poder equilibrar');

  const unidades = cf / margenUnitario;
  const ventas = unidades * pu;
  const pctMargen = (margenUnitario / pu) * 100;

  const unidadesCeil = Math.ceil(unidades);
  const ventasRound = Math.round(ventas);
  const cfRound = Math.round(cf);
  const cvTotal = ventasRound - cfRound; // costos variables totales en el punto de equilibrio

  const _insight = {
    title: 'Tu punto de equilibrio',
    text: `Cada unidad deja **$${Math.round(margenUnitario).toLocaleString('es-AR')}** de margen (**${pctMargen.toFixed(0)}%** del precio). Vendiendo **${unidadesCeil} unidad${unidadesCeil === 1 ? '' : 'es'}** (≈ **$${ventasRound.toLocaleString('es-AR')}** facturados) cubrís los costos fijos; de ahí en más, cada venta es ganancia.`,
    tone: pctMargen < 20 ? 'warn' : pctMargen < 40 ? 'neutral' : 'good',
    icon: '⚖️',
  };

  const _chart = cvTotal >= 0 ? {
    type: 'doughnut',
    slices: [
      { label: 'Costos fijos', value: cfRound },
      { label: 'Costos variables', value: cvTotal },
    ],
    prefix: '$',
    centerValue: `$${ventasRound.toLocaleString('es-AR')}`,
    centerLabel: 'Ventas',
    ariaLabel: `Composición de las ventas en el punto de equilibrio: costos fijos y costos variables`,
  } : undefined;

  return {
    unidadesBreakEven: unidadesCeil,
    ventasBreakEven: ventasRound,
    margenContribucionUnitario: Math.round(margenUnitario),
    margenContribucionPorcentual: Number(pctMargen.toFixed(2)),
    mensaje: `Necesitás vender ${unidadesCeil} unidades (o facturar $${ventasRound.toLocaleString('es-AR')}) para cubrir costos fijos. A partir de ahí, cada venta agrega $${Math.round(margenUnitario).toLocaleString('es-AR')} de ganancia.`,
    _insight,
    _chart,
  };
}
