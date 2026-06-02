/** Conversor: libra ↔ kilogramo */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; }

export function conversorLibrasAKilogramos(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const factor = 0.45359237;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * factor;
    fromLabel = 'libras'; toLabel = 'kilogramos';
  } else {
    r = v / factor;
    fromLabel = 'kilogramos'; toLabel = 'libras';
  }
  const rTxt = r.toFixed(4).replace(/\.?0+$/, '');
  const _insight = {
    title: 'Truco para estimar',
    text: d === 'ida'
      ? '**' + v + ' lb** son **' + rTxt + ' kg** (1 libra = 0,4536 kg). Para una cuenta rápida de cabeza, dividí las libras por 2,2.'
      : '**' + v + ' kg** equivalen a **' + rTxt + ' lb**. Atajo mental: multiplicá los kilos por 2,2 para tener las libras aproximadas.',
    tone: 'neutral',
    icon: '⚖️'
  };
  return {
    resultado: r.toFixed(6).replace(/\.?0+$/, '') + ' ' + 'kg'.toString(),
    resumen: v + ' ' + fromLabel + ' = ' + rTxt + ' ' + toLabel + '.',
    _insight
  };
}
