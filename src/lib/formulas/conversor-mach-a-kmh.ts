/** Conversor: Mach ↔ kilómetro por hora */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; }

export function conversorMachAKmh(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const factor = 1234.8;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * factor;
    fromLabel = 'Mach'; toLabel = 'kilómetros por hora';
  } else {
    r = v / factor;
    fromLabel = 'kilómetros por hora'; toLabel = 'Mach';
  }
  const rTxt = r.toFixed(4).replace(/\.?0+$/, '');
  const machVal = d === 'ida' ? v : r;
  const _insight = {
    title: machVal >= 1 ? 'Velocidad supersónica' : 'Por debajo del sonido',
    text: d === 'ida'
      ? '**Mach ' + v + '** equivale a **' + rTxt + ' km/h** al nivel del mar (Mach 1 ≈ 1.234,8 km/h). ' + (v >= 1 ? 'Supera la barrera del sonido.' : 'Está por debajo de la velocidad del sonido.') + ' Ojo: la velocidad del sonido baja con la altitud y el frío.'
      : '**' + v + ' km/h** son **' + rTxt + ' Mach** al nivel del mar (Mach 1 ≈ 1.234,8 km/h). ' + (r >= 1 ? 'Ya es velocidad supersónica.' : 'Aún no llega a la barrera del sonido.'),
    tone: machVal >= 1 ? 'warn' : 'neutral',
    icon: '✈️'
  };
  return {
    resultado: r.toFixed(6).replace(/\.?0+$/, '') + ' ' + 'km/h'.toString(),
    resumen: v + ' ' + fromLabel + ' = ' + rTxt + ' ' + toLabel + '.',
    _insight
  };
}
