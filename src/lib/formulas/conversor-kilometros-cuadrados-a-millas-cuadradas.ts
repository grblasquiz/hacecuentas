/** Conversor: kilómetro cuadrado ↔ milla cuadrada */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; }

export function conversorKilometrosCuadradosAMillasCuadradas(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const factor = 0.386102;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * factor;
    fromLabel = 'kilómetros cuadrados'; toLabel = 'millas cuadradas';
  } else {
    r = v / factor;
    fromLabel = 'millas cuadradas'; toLabel = 'kilómetros cuadrados';
  }
  const fmtV = v.toLocaleString('es-AR', { maximumFractionDigits: 2 });
  const fmtR = r.toLocaleString('es-AR', { maximumFractionDigits: 2 });
  const _insight = {
    title: 'Cómo interpretar el resultado',
    text: d === 'ida'
      ? '**' + fmtV + ' km²** equivalen a **' + fmtR + ' mi²**. Como la milla es más larga que el kilómetro, al elevar al cuadrado **1 mi² ≈ 2,59 km²**: por eso el área en millas cuadradas es bastante menor.'
      : '**' + fmtV + ' mi²** equivalen a **' + fmtR + ' km²**. Cada milla cuadrada son **2,59 km²**, así que al pasar a kilómetros cuadrados el área se multiplica.',
    tone: 'neutral',
    icon: '🗺️'
  };
  const toUnit = d === 'ida' ? 'mi²' : 'km²';
  return {
    resultado: r.toFixed(6).replace(/\.?0+$/, '') + ' ' + toUnit,
    resumen: v + ' ' + fromLabel + ' = ' + r.toFixed(4).replace(/\.?0+$/, '') + ' ' + toLabel + '.',
    _insight
  };
}
