/** Conversor: kilómetro por hora ↔ milla por hora */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; }

export function conversorKmhAMph(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const factor = 0.621371;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * factor;
    fromLabel = 'kilómetros por hora'; toLabel = 'millas por hora';
  } else {
    r = v / factor;
    fromLabel = 'millas por hora'; toLabel = 'kilómetros por hora';
  }
  const fmtV = v.toLocaleString('es-AR', { maximumFractionDigits: 2 });
  const fmtR = r.toLocaleString('es-AR', { maximumFractionDigits: 2 });
  const _insight = {
    title: 'Cómo interpretar el resultado',
    text: d === 'ida'
      ? 'Ir a **' + fmtV + ' km/h** es ir a **' + fmtR + ' mph**. El velocímetro en millas marca un número más bajo que en km/h, aunque la velocidad sea la misma (**1 mph ≈ 1,61 km/h**).'
      : 'Ir a **' + fmtV + ' mph** es ir a **' + fmtR + ' km/h**. Cada milla por hora equivale a **1,61 km/h**, por eso al pasar a km/h el número sube.',
    tone: 'neutral',
    icon: '🚗'
  };
  return {
    resultado: r.toFixed(6).replace(/\.?0+$/, '') + ' ' + 'mph'.toString(),
    resumen: v + ' ' + fromLabel + ' = ' + r.toFixed(4).replace(/\.?0+$/, '') + ' ' + toLabel + '.',
    _insight
  };
}
