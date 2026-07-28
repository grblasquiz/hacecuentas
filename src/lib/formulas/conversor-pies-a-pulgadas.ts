/** Conversor: pie ↔ pulgada */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; }

export function conversorPiesAPulgadas(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const factor = 12.0;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * factor;
    fromLabel = 'pies'; toLabel = 'pulgadas';
  } else {
    r = v / factor;
    fromLabel = 'pulgadas'; toLabel = 'pies';
  }
  const fmt = (n: number) => n.toFixed(4).replace(/\.?0+$/, '');
  // Expresamos siempre en pulgadas para anclar el dato (centímetros como referencia métrica).
  const pulgadas = d === 'ida' ? r : v;
  const cm = pulgadas * 2.54;
  return {
    resultado: r.toFixed(6).replace(/\.?0+$/, '') + ' ' + (d === 'ida' ? 'in' : "ft"),
    resumen: v + ' ' + fromLabel + ' = ' + fmt(r) + ' ' + toLabel + '.',
    _insight: {
      title: 'Equivalencia exacta',
      text: '**1 pie = 12 pulgadas** exactas, así que la conversión es limpia (sin redondeo). Tus **' + fmt(pulgadas) + ' in** son unos **' + fmt(cm) + ' cm** en sistema métrico.',
      tone: 'neutral',
      icon: '📐'
    }
  };
}
