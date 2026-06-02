/** Conversor: caballo de fuerza ↔ kilowatt */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; }

export function conversorHpAKw(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const factor = 0.7457;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * factor;
    fromLabel = 'caballos de fuerza'; toLabel = 'kilowatts';
  } else {
    r = v / factor;
    fromLabel = 'kilowatts'; toLabel = 'caballos de fuerza';
  }
  const hp = d === 'ida' ? v : r;
  const kw = d === 'ida' ? r : v;
  const cv = hp * 1.01387;
  return {
    resultado: r.toFixed(6).replace(/\.?0+$/, '') + ' ' + 'kW'.toString(),
    resumen: v + ' ' + fromLabel + ' = ' + r.toFixed(4).replace(/\.?0+$/, '') + ' ' + toLabel + '.',
    _insight: {
      title: 'HP mecánico, no CV',
      text: 'Esta conversión usa el **HP mecánico (1 HP = 0,7457 kW)**, así que **' + hp.toLocaleString('es-AR', { maximumFractionDigits: 2 }) + ' HP = ' + kw.toLocaleString('es-AR', { maximumFractionDigits: 2 }) + ' kW**. Ojo: el "caballo" europeo (CV/PS) es algo menor, esa misma potencia serían ≈ **' + cv.toLocaleString('es-AR', { maximumFractionDigits: 1 }) + ' CV**.',
      tone: 'neutral',
      icon: '⚙️'
    }
  };
}
