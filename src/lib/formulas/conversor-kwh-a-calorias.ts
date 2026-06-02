/** Conversor: kilowatt-hora ↔ kilocaloría */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; }

export function conversorKwhACalorias(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const factor = 860.421;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * factor;
    fromLabel = 'kilowatts-hora'; toLabel = 'kilocalorías';
  } else {
    r = v / factor;
    fromLabel = 'kilocalorías'; toLabel = 'kilowatts-hora';
  }
  const fmtV = v.toLocaleString('es-AR', { maximumFractionDigits: 2 });
  const fmtR = r.toLocaleString('es-AR', { maximumFractionDigits: 2 });
  const _insight = {
    title: 'Cómo interpretar el resultado',
    text: d === 'ida'
      ? '**' + fmtV + ' kWh** equivalen a **' + fmtR + ' kcal**. Un solo kilowatt-hora libera más de **860.000 calorías** de energía: por eso la cifra en kcal se dispara.'
      : '**' + fmtV + ' kcal** equivalen a **' + fmtR + ' kWh**. Hacen falta unas **860 kcal** para sumar apenas 1 Wh, por eso el valor en kWh queda muy chico.',
    tone: 'neutral',
    icon: '⚡'
  };
  return {
    resultado: r.toFixed(6).replace(/\.?0+$/, '') + ' ' + 'kcal'.toString(),
    resumen: v + ' ' + fromLabel + ' = ' + r.toFixed(4).replace(/\.?0+$/, '') + ' ' + toLabel + '.',
    _insight
  };
}
