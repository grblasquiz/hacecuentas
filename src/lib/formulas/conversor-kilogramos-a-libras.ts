/** Conversor: kilogramo ↔ libra */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; }

export function conversorKilogramosALibras(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const factor = 2.20462;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * factor;
    fromLabel = 'kilogramos'; toLabel = 'libras';
  } else {
    r = v / factor;
    fromLabel = 'libras'; toLabel = 'kilogramos';
  }
  const fmtV = v.toLocaleString('es-AR', { maximumFractionDigits: 2 });
  const fmtR = r.toLocaleString('es-AR', { maximumFractionDigits: 2 });
  const _insight = {
    title: 'Cómo interpretar el resultado',
    text: d === 'ida'
      ? '**' + fmtV + ' kg** equivalen a **' + fmtR + ' lb**. Cada kilo pesa un poco más de **2,2 libras**, así que el número en libras siempre es más del doble.'
      : '**' + fmtV + ' lb** equivalen a **' + fmtR + ' kg**. Una libra es algo menos de medio kilo (**0,454 kg**), por eso el valor en kilos baja a menos de la mitad.',
    tone: 'neutral',
    icon: '⚖️'
  };
  return {
    resultado: r.toFixed(6).replace(/\.?0+$/, '') + ' ' + 'lb'.toString(),
    resumen: v + ' ' + fromLabel + ' = ' + r.toFixed(4).replace(/\.?0+$/, '') + ' ' + toLabel + '.',
    _insight
  };
}
