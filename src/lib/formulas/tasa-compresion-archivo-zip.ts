export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | any; }
export function tasaCompresionArchivoZip(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: { error: 'Original no puede ser 0.', insTitle: 'Cuánto encogió tu archivo', center: 'Original' },
    en: { error: 'Original size cannot be 0.', insTitle: 'How much your file shrank', center: 'Original' },
  } as const)[__lang];
  const o=Number(i.original)||0; const c=Number(i.comprimido)||0;
  if (o===0) return { tasa:'—', ratio:'—', ahorro:'—', resumen: T.error };
  const tasa=(1-c/o)*100; const ratio=o/c;
  const ahorroMb = o - c;
  const resumen = __lang === 'en'
    ? `Compression ${tasa.toFixed(1)}%, savings ${ahorroMb.toFixed(1)} MB.`
    : `Compresión ${tasa.toFixed(1)}%, ahorro ${ahorroMb.toFixed(1)} MB.`;

  const _insight = {
    title: T.insTitle,
    text: __lang === 'en'
      ? `Compressing dropped the size from **${o.toFixed(1)} MB** to **${c.toFixed(1)} MB**: a **${tasa.toFixed(1)}%** reduction (**${ratio.toFixed(2)}:1** ratio), saving ${ahorroMb.toFixed(2)} MB.`
      : `Comprimir bajó el tamaño de **${o.toFixed(1)} MB** a **${c.toFixed(1)} MB**: una reducción del **${tasa.toFixed(1)}%** (ratio **${ratio.toFixed(2)}:1**), con un ahorro de ${ahorroMb.toFixed(2)} MB.`,
    tone: tasa >= 50 ? 'good' : tasa > 0 ? 'neutral' : 'warn',
    icon: '🗜️',
  };

  const _chart = ahorroMb > 0 ? {
    type: 'doughnut',
    slices: [
      { label: __lang === 'en' ? 'Compressed' : 'Comprimido', value: Number(c.toFixed(2)) },
      { label: __lang === 'en' ? 'Saved' : 'Ahorro', value: Number(ahorroMb.toFixed(2)) },
    ],
    suffix: ' MB',
    centerValue: `${o.toFixed(1)} MB`,
    centerLabel: T.center,
    ariaLabel: __lang === 'en'
      ? `Original ${o.toFixed(1)} MB split into ${c.toFixed(1)} MB compressed and ${ahorroMb.toFixed(1)} MB saved`
      : `Original de ${o.toFixed(1)} MB repartido en ${c.toFixed(1)} MB comprimido y ${ahorroMb.toFixed(1)} MB de ahorro`,
  } : undefined;

  return { tasa:`${tasa.toFixed(1)}%`, ratio:`${ratio.toFixed(2)}:1`, ahorro:`${ahorroMb.toFixed(2)} MB`, resumen, _insight, ...(_chart ? { _chart } : {}) };
}
