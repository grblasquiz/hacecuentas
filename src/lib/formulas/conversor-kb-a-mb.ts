/** Conversor: kilobyte ↔ megabyte */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; }

export function conversorKbAMb(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const factor = 0.001;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * factor;
    fromLabel = 'kilobytes'; toLabel = 'megabytes';
  } else {
    r = v / factor;
    fromLabel = 'megabytes'; toLabel = 'kilobytes';
  }
  const kb = d === 'ida' ? v : r;
  const mbDecimal = d === 'ida' ? r : v;
  const mbBinario = kb / 1024;
  return {
    resultado: r.toFixed(6).replace(/\.?0+$/, '') + ' ' + (d === 'ida' ? 'MB' : "KB"),
    resumen: v + ' ' + fromLabel + ' = ' + r.toFixed(4).replace(/\.?0+$/, '') + ' ' + toLabel + '.',
    _insight: {
      title: 'Decimal (1.000) vs. binario (1.024)',
      text: 'Este conversor usa el estándar **decimal (1 MB = 1.000 KB)**: por eso **' + kb.toLocaleString('es-AR', { maximumFractionDigits: 2 }) + ' KB = ' + mbDecimal.toLocaleString('es-AR', { maximumFractionDigits: 4 }) + ' MB**. Tu sistema operativo suele usar binario (1 MiB = 1.024 KiB), donde lo mismo daría ≈ **' + mbBinario.toLocaleString('es-AR', { maximumFractionDigits: 4 }) + ' MiB**.',
      tone: 'neutral',
      icon: '💾'
    }
  };
}
