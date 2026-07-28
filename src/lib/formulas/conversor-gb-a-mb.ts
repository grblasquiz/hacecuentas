/** Conversor: gigabyte ↔ megabyte */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; }

export function conversorGbAMb(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const factor = 1000.0;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * factor;
    fromLabel = 'gigabytes'; toLabel = 'megabytes';
  } else {
    r = v / factor;
    fromLabel = 'megabytes'; toLabel = 'gigabytes';
  }
  // Megabytes de referencia (ida da MB; en vuelta el input ya está en MB)
  const mb = d === 'ida' ? r : v;
  const fotos = Math.round(mb / 4); // foto de celular ≈ 4 MB
  const insight = {
    title: 'Para que te des una idea',
    text: '**' + mb.toLocaleString('es-AR', { maximumFractionDigits: 0 }) + ' MB** alcanzan para unas **' + fotos.toLocaleString('es-AR') + ' fotos** de celular (≈4 MB c/u). Usamos la convención decimal (1 GB = 1000 MB); en binario serían 1024 MB.',
    tone: 'neutral',
    icon: '💾'
  };
  return {
    resultado: r.toFixed(6).replace(/\.?0+$/, '') + ' ' + (d === 'ida' ? 'MB' : "GB"),
    resumen: v + ' ' + fromLabel + ' = ' + r.toFixed(4).replace(/\.?0+$/, '') + ' ' + toLabel + '.',
    _insight: insight
  };
}
