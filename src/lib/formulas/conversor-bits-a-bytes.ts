/** Conversor: bit ↔ byte */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; }

export function conversorBitsABytes(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const factor = 0.125;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * factor;
    fromLabel = 'bits'; toLabel = 'bytes';
  } else {
    r = v / factor;
    fromLabel = 'bytes'; toLabel = 'bits';
  }
  const rFmt = r.toFixed(4).replace(/\.?0+$/, '');
  const _insight = {
    title: 'Por qué dividir entre 8',
    text: `**${v} ${fromLabel}** equivalen a **${rFmt} ${toLabel}** porque 1 byte agrupa 8 bits. Ojo al leer planes de internet: la velocidad va en **bits** por segundo (Mbps), pero los archivos que bajás se miden en **bytes** (MB), así que tu descarga real es ~8 veces más chica que el número del plan.`,
    tone: 'neutral',
    icon: '💾',
  };

  return {
    resultado: r.toFixed(6).replace(/\.?0+$/, '') + ' ' + 'B'.toString(),
    resumen: v + ' ' + fromLabel + ' = ' + r.toFixed(4).replace(/\.?0+$/, '') + ' ' + toLabel + '.',
    _insight
  };
}
