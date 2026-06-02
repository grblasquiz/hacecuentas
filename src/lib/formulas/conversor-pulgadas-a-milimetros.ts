/** Conversor: pulgada ↔ milímetro */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; }

export function conversorPulgadasAMilimetros(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const factor = 25.4;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * factor;
    fromLabel = 'pulgadas'; toLabel = 'milímetros';
  } else {
    r = v / factor;
    fromLabel = 'milímetros'; toLabel = 'pulgadas';
  }
  const rStr = r.toFixed(4).replace(/\.?0+$/, '');
  const vStr = String(v);
  return {
    resultado: r.toFixed(6).replace(/\.?0+$/, '') + ' ' + 'mm'.toString(),
    resumen: v + ' ' + fromLabel + ' = ' + rStr + ' ' + toLabel + '.',
    _insight: {
      title: 'Equivalencia exacta',
      text: '**' + vStr + ' ' + fromLabel + '** equivalen a **' + rStr + ' ' + toLabel + '**. La pulgada se define como exactamente **25,4 mm**, así que la conversión es exacta, sin redondeo de norma.',
      tone: 'neutral',
      icon: '📏'
    }
  };
}
