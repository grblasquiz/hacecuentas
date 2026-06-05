/** Conversor: kilowatt ↔ caballo de fuerza */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; }

export function conversorKwAHp(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const factor = 1.34102;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * factor;
    fromLabel = 'kilowatts'; toLabel = 'caballos de fuerza';
  } else {
    r = v / factor;
    fromLabel = 'caballos de fuerza'; toLabel = 'kilowatts';
  }
  const fmtV = v.toLocaleString('es-AR', { maximumFractionDigits: 2 });
  const fmtR = r.toLocaleString('es-AR', { maximumFractionDigits: 2 });
  const _insight = {
    title: 'Cómo interpretar el resultado',
    text: d === 'ida'
      ? '**' + fmtV + ' kW** de potencia equivalen a **' + fmtR + ' HP**. Cada kilowatt rinde alrededor de **1,34 HP**, así que la cifra de caballos siempre es mayor que la de kW.'
      : '**' + fmtV + ' HP** equivalen a **' + fmtR + ' kW**. Cada caballo de fuerza son unos **0,746 kW**, por eso al pasar a kilowatts el número baja.',
    tone: 'neutral',
    icon: '🐎'
  };
  const unit = d === 'ida' ? 'HP' : 'kW';
  return {
    resultado: r.toFixed(6).replace(/\.?0+$/, '') + ' ' + unit,
    resumen: v + ' ' + fromLabel + ' = ' + r.toFixed(4).replace(/\.?0+$/, '') + ' ' + toLabel + '.',
    _insight
  };
}
