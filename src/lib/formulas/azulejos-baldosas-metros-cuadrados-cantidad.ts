export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function azulejosBaldosasMetrosCuadradosCantidad(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const v1=Number(i.v1)||0; const v2=Number(i.v2)||1;
  const r=v1*v2;
  const resumen = __lang === 'en'
    ? `Calculation: ${v1} × ${v2} = ${r.toFixed(2)}.`
    : `Cálculo: ${v1} × ${v2} = ${r.toFixed(2)}.`;
  const conMerma = r * 1.1;
  const _insight = __lang === 'en'
    ? {
        title: 'Buy a bit extra',
        text: `You need about **${r.toFixed(2)}** tiles. Add **10%** for cuts and breakage and buy roughly **${conMerma.toFixed(0)}** — keeping spares from the same batch avoids shade mismatches later.`,
        tone: 'neutral',
        icon: '🧱',
      }
    : {
        title: 'Comprá un poco de más',
        text: `Necesitás unas **${r.toFixed(2)}** piezas. Sumá un **10%** por cortes y roturas y comprá cerca de **${conMerma.toFixed(0)}**: guardar repuestos del mismo lote evita diferencias de tono más adelante.`,
        tone: 'neutral',
        icon: '🧱',
      };
  return { resultado:r.toFixed(2), resumen, _insight };
}
