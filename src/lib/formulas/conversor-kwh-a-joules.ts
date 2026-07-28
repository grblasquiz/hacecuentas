/** Conversor: kilowatt-hora ↔ joule */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; }

export function conversorKwhAJoules(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const factor = 3600000.0;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * factor;
    fromLabel = 'kilowatts-hora'; toLabel = 'joules';
  } else {
    r = v / factor;
    fromLabel = 'joules'; toLabel = 'kilowatts-hora';
  }
  const fmtV = v.toLocaleString('es-AR', { maximumFractionDigits: 2 });
  const fmtR = r.toLocaleString('es-AR', { maximumFractionDigits: 2 });
  const _insight = {
    title: 'Cómo interpretar el resultado',
    text: d === 'ida'
      ? '**' + fmtV + ' kWh** equivalen a **' + fmtR + ' J**. Un kilowatt-hora son **3.600.000 joules** (3,6 MJ), por eso el número en joules es enorme: el joule es una unidad muy chica.'
      : '**' + fmtV + ' J** equivalen a **' + fmtR + ' kWh**. Como cada kWh son **3,6 millones de joules**, un puñado de joules representa una fracción mínima de kWh.',
    tone: 'neutral',
    icon: '⚡'
  };
  return {
    resultado: r.toFixed(6).replace(/\.?0+$/, '') + ' ' + (d === 'ida' ? 'J' : "kWh"),
    resumen: v + ' ' + fromLabel + ' = ' + r.toFixed(4).replace(/\.?0+$/, '') + ' ' + toLabel + '.',
    _insight
  };
}
