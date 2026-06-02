/** Conversor: byte ↔ kilobyte */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; }

export function conversorBytesAKilobytes(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const factor = 0.001;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * factor;
    fromLabel = 'bytes'; toLabel = 'kilobytes';
  } else {
    r = v / factor;
    fromLabel = 'kilobytes'; toLabel = 'bytes';
  }
  const rFmt = r.toFixed(4).replace(/\.?0+$/, '');
  const _insight = {
    title: 'KB decimal vs binario',
    text: `**${v} ${fromLabel}** equivalen a **${rFmt} ${toLabel}** usando el criterio decimal (1 KB = 1000 bytes), el que aplican los fabricantes de discos y los planes de datos. Tu sistema operativo, en cambio, suele contar en binario (1 KiB = 1024 bytes), por eso el tamaño que ves en la PC aparece un poco más chico.`,
    tone: 'neutral',
    icon: '💽',
  };

  return {
    resultado: r.toFixed(6).replace(/\.?0+$/, '') + ' ' + 'KB'.toString(),
    resumen: v + ' ' + fromLabel + ' = ' + r.toFixed(4).replace(/\.?0+$/, '') + ' ' + toLabel + '.',
    _insight
  };
}
