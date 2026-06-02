/** Conversor: terabyte ↔ gigabyte */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; }

export function conversorTbAGb(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const factor = 1000.0;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * factor;
    fromLabel = 'terabytes'; toLabel = 'gigabytes';
  } else {
    r = v / factor;
    fromLabel = 'gigabytes'; toLabel = 'terabytes';
  }
  const rTxt = r.toFixed(4).replace(/\.?0+$/, '');
  const vTxt = String(v);
  return {
    resultado: r.toFixed(6).replace(/\.?0+$/, '') + ' ' + 'GB'.toString(),
    resumen: v + ' ' + fromLabel + ' = ' + rTxt + ' ' + toLabel + '.',
    _insight: {
      title: 'Sistema decimal (1 TB = 1000 GB)',
      text: 'Convertimos en base **decimal**: **' + vTxt + ' ' + fromLabel + '** son **' + rTxt + ' ' + toLabel + '**, como lo miden los fabricantes de discos. Tu sistema operativo (Windows) usa base binaria (1 TB = 1024 GB), por eso un disco de 1 TB muestra ~931 GB libres.',
      tone: 'neutral',
      icon: '💾'
    }
  };
}
