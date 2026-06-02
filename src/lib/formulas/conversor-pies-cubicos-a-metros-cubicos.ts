/** Conversor: pie cúbico ↔ metro cúbico */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; }

export function conversorPiesCubicosAMetrosCubicos(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const factor = 0.0283168;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * factor;
    fromLabel = 'pies cúbicos'; toLabel = 'metros cúbicos';
  } else {
    r = v / factor;
    fromLabel = 'metros cúbicos'; toLabel = 'pies cúbicos';
  }
  const fmt = (n: number) => n.toFixed(4).replace(/\.?0+$/, '');
  // Anclamos en m³ y damos el equivalente en litros (1 m³ = 1000 L).
  const m3 = d === 'ida' ? r : v;
  const litros = m3 * 1000;
  return {
    resultado: r.toFixed(6).replace(/\.?0+$/, '') + ' ' + 'm³'.toString(),
    resumen: v + ' ' + fromLabel + ' = ' + fmt(r) + ' ' + toLabel + '.',
    _insight: {
      title: 'Volumen en litros',
      text: 'Equivale a **' + fmt(m3) + ' m³**, es decir unos **' + fmt(litros) + ' litros**. En volumen el factor va al cubo: **1 ft³ = 0,0283 m³**.',
      tone: 'neutral',
      icon: '📦'
    }
  };
}
