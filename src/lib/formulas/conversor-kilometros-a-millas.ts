/** Conversor: kilómetro ↔ milla */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; }

export function conversorKilometrosAMillas(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const factor = 0.621371;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * factor;
    fromLabel = 'kilómetros'; toLabel = 'millas';
  } else {
    r = v / factor;
    fromLabel = 'millas'; toLabel = 'kilómetros';
  }
  const fmtV = v.toLocaleString('es-AR', { maximumFractionDigits: 2 });
  const fmtR = r.toLocaleString('es-AR', { maximumFractionDigits: 2 });
  const _insight = {
    title: 'Cómo interpretar el resultado',
    text: d === 'ida'
      ? '**' + fmtV + ' km** son **' + fmtR + ' millas**. Una milla es más larga que un kilómetro (**1 mi ≈ 1,61 km**), por eso el número en millas siempre baja respecto al de kilómetros.'
      : '**' + fmtV + ' millas** son **' + fmtR + ' km**. Cada milla equivale a **1,61 km**, así que al pasar a kilómetros el número crece.',
    tone: 'neutral',
    icon: '🛣️'
  };
  return {
    resultado: r.toFixed(6).replace(/\.?0+$/, '') + ' ' + 'mi'.toString(),
    resumen: v + ' ' + fromLabel + ' = ' + r.toFixed(4).replace(/\.?0+$/, '') + ' ' + toLabel + '.',
    _insight
  };
}
