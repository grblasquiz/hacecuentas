/** Conversor: kilómetro por hora ↔ metro por segundo */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; }

export function conversorKmhAMs(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const factor = 0.277778;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * factor;
    fromLabel = 'kilómetros por hora'; toLabel = 'metros por segundo';
  } else {
    r = v / factor;
    fromLabel = 'metros por segundo'; toLabel = 'kilómetros por hora';
  }
  const fmtV = v.toLocaleString('es-AR', { maximumFractionDigits: 2 });
  const fmtR = r.toLocaleString('es-AR', { maximumFractionDigits: 2 });
  const _insight = {
    title: 'Cómo interpretar el resultado',
    text: d === 'ida'
      ? '**' + fmtV + ' km/h** son **' + fmtR + ' m/s**. El truco mental: dividir los km/h por **3,6** da los metros por segundo.'
      : '**' + fmtV + ' m/s** son **' + fmtR + ' km/h**. El truco mental: multiplicar los m/s por **3,6** da los km/h.',
    tone: 'neutral',
    icon: '🏃'
  };
  return {
    resultado: r.toFixed(6).replace(/\.?0+$/, '') + ' ' + 'm/s'.toString(),
    resumen: v + ' ' + fromLabel + ' = ' + r.toFixed(4).replace(/\.?0+$/, '') + ' ' + toLabel + '.',
    _insight
  };
}
