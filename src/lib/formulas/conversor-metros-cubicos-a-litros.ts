/** Conversor: metro cúbico ↔ litro */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; }

export function conversorMetrosCubicosALitros(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const factor = 1000.0;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * factor;
    fromLabel = 'metros cúbicos'; toLabel = 'litros';
  } else {
    r = v / factor;
    fromLabel = 'litros'; toLabel = 'metros cúbicos';
  }
  const rTxt = r.toFixed(4).replace(/\.?0+$/, '');
  const m3 = d === 'ida' ? v : r;
  const litros = d === 'ida' ? r : v;
  const tanques = litros / 1000;
  return {
    resultado: r.toFixed(6).replace(/\.?0+$/, '') + ' ' + 'L'.toString(),
    resumen: v + ' ' + fromLabel + ' = ' + rTxt + ' ' + toLabel + '.',
    _insight: {
      title: 'Cuánta agua es',
      text: '**' + m3.toLocaleString('es-AR') + ' m³** son **' + Math.round(litros).toLocaleString('es-AR') + ' litros**, porque **1 m³ = 1000 L** exactos. Equivale a unos **' + tanques.toFixed(1).replace(/\.0$/, '') + '** tanques de agua de 1.000 L — el factor es directo y no depende del líquido.',
      tone: 'neutral',
      icon: '💧'
    }
  };
}
