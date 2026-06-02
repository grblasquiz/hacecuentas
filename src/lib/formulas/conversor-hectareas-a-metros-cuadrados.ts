/** Conversor: hectárea ↔ metro cuadrado */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; }

export function conversorHectareasAMetrosCuadrados(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const factor = 10000.0;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * factor;
    fromLabel = 'hectáreas'; toLabel = 'metros cuadrados';
  } else {
    r = v / factor;
    fromLabel = 'metros cuadrados'; toLabel = 'hectáreas';
  }
  const metros2 = d === 'ida' ? r : v;
  const canchas = metros2 / 7000;
  return {
    resultado: r.toFixed(6).replace(/\.?0+$/, '') + ' ' + 'm²'.toString(),
    resumen: v + ' ' + fromLabel + ' = ' + r.toFixed(4).replace(/\.?0+$/, '') + ' ' + toLabel + '.',
    _insight: {
      title: 'Para dimensionarlo',
      text: 'Una hectárea son exactamente **10.000 m²**. Tu superficie de **' + metros2.toLocaleString('es-AR', { maximumFractionDigits: 0 }) + ' m²** equivale a unas **' + canchas.toLocaleString('es-AR', { maximumFractionDigits: 1 }) + ' canchas de fútbol** (≈7.000 m² cada una), un buen punto de referencia para visualizar el tamaño del terreno.',
      tone: 'neutral',
      icon: '🌾'
    }
  };
}
