/** Calculadora de Apalancamiento y Precio de Liquidación */
export interface Inputs { precioEntrada: number; leverage: number; direccion: 'long'|'short'; mantenimientoPorcentaje: number; }
export interface Outputs { precioLiquidacion: number; distanciaPorcentaje: number; distanciaAbsoluta: number; nivelRiesgo: string; _insight?: any; _chart?: any; }
export function apalancamientoLiquidacion(i: Inputs): Outputs {
  const ent = Number(i.precioEntrada); const lev = Number(i.leverage);
  const mant = Number(i.mantenimientoPorcentaje)/100;
  if (!ent || ent <= 0) throw new Error('Ingresá entrada');
  if (!lev || lev <= 0) throw new Error('Ingresá leverage');
  const pct = (1/lev) * (1 - mant);
  const dist = ent * pct;
  const liq = i.direccion === 'long' ? ent - dist : ent + dist;
  let r = '';
  if (lev >= 50) r = '☠️ Extremo';
  else if (lev >= 20) r = '⚠️ Muy alto';
  else if (lev >= 10) r = '⚠️ Alto';
  else if (lev >= 5) r = '✅ Moderado';
  else r = '✅ Bajo';
  const pctDisp = (pct*100).toFixed(2);
  const liqDisp = Number(liq.toFixed(4)).toLocaleString('es-AR');
  const dirTxt = i.direccion === 'long' ? 'caída' : 'suba';
  const tone = lev >= 20 ? 'warn' : lev >= 10 ? 'warn' : 'good';
  const insightText = lev >= 20
    ? `Con **${lev}x** te liquidan ante una **${dirTxt} de apenas ${pctDisp}%** (precio **${liqDisp}**): un movimiento mínimo en contra borra tu posición. Apalancamiento de altísimo riesgo.`
    : lev >= 10
      ? `Una **${dirTxt} del ${pctDisp}%** hasta **${liqDisp}** liquida tu posición. Con **${lev}x** el margen de error es chico: cuidá el stop y el tamaño.`
      : `Tu colchón es de **${pctDisp}%** (liquidación en **${liqDisp}**): con **${lev}x** tolerás un movimiento en contra razonable antes de que te liquiden.`;
  const _insight = {
    title: 'Qué significa tu liquidación',
    text: insightText,
    tone,
    icon: '⚖️',
  };
  const _chart = {
    type: 'scale',
    marker: lev,
    markerLabel: `${lev}x`,
    min: 1,
    segments: [
      { nombre: 'Bajo', max: 5, color: '#16a34a', colorDark: '#22c55e' },
      { nombre: 'Moderado', max: 10, color: '#84cc16', colorDark: '#a3e635' },
      { nombre: 'Alto', max: 20, color: '#f59e0b', colorDark: '#fbbf24' },
      { nombre: 'Muy alto', max: 50, color: '#f97316', colorDark: '#fb923c' },
      { nombre: 'Extremo', max: Math.max(125, lev + 5), color: '#dc2626', colorDark: '#ef4444' },
    ],
    ariaLabel: `Nivel de apalancamiento ${lev}x ubicado en la zona de riesgo correspondiente`,
  };
  return {
    precioLiquidacion: Number(liq.toFixed(4)),
    distanciaPorcentaje: Number((pct*100).toFixed(2)),
    distanciaAbsoluta: Number(dist.toFixed(2)),
    nivelRiesgo: r,
    _insight,
    _chart,
  };
}