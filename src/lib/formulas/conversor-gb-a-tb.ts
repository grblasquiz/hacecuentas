/** Conversor: gigabyte ↔ terabyte */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; }

export function conversorGbATb(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const factor = 0.001;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * factor;
    fromLabel = 'gigabytes'; toLabel = 'terabytes';
  } else {
    r = v / factor;
    fromLabel = 'terabytes'; toLabel = 'gigabytes';
  }
  // Gigabytes y terabytes de referencia
  const gb = d === 'ida' ? v : r;
  const tb = d === 'ida' ? r : v;
  const insight = {
    title: 'Para que te des una idea',
    text: '**' + gb.toLocaleString('es-AR', { maximumFractionDigits: 2 }) + ' GB** son **' + tb.toLocaleString('es-AR', { maximumFractionDigits: 3 }) + ' TB**: aprox. ' + (tb).toFixed(1) + ' discos SSD de 1 TB. Usamos la convención decimal (1 TB = 1000 GB); en binario serían 1024 GB.',
    tone: 'neutral',
    icon: '🗄️'
  };
  return {
    resultado: r.toFixed(6).replace(/\.?0+$/, '') + ' ' + (d === 'ida' ? 'TB' : 'GB'),
    resumen: v + ' ' + fromLabel + ' = ' + r.toFixed(4).replace(/\.?0+$/, '') + ' ' + toLabel + '.',
    _insight: insight
  };
}
