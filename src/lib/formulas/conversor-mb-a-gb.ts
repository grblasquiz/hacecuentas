/** Conversor: megabyte ↔ gigabyte */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; }

export function conversorMbAGb(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const factor = 0.001;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * factor;
    fromLabel = 'megabytes'; toLabel = 'gigabytes';
  } else {
    r = v / factor;
    fromLabel = 'gigabytes'; toLabel = 'megabytes';
  }
  const rTxt = r.toFixed(4).replace(/\.?0+$/, '');
  const mbTotal = d === 'ida' ? v : r;
  const gbBin = mbTotal / 1024;
  return {
    resultado: r.toFixed(6).replace(/\.?0+$/, '') + ' ' + 'GB'.toString(),
    resumen: v + ' ' + fromLabel + ' = ' + rTxt + ' ' + toLabel + '.',
    _insight: {
      title: 'Decimal vs binario',
      text: '**' + v + ' ' + fromLabel + '** = **' + rTxt + ' ' + toLabel + '** usando el sistema decimal (1 GB = 1000 MB), el que usan operadoras y discos. Tu **sistema operativo** mide en binario (1 GiB = 1024 MB), así que ahí verías **' + gbBin.toFixed(3).replace(/\.?0+$/, '') + ' GB** — por eso un disco "rinde" un poco menos.',
      tone: 'neutral',
      icon: '💾'
    }
  };
}
