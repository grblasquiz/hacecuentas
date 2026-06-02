/** Conversor: pulgada ↔ centímetro */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; }

export function conversorPulgadasACentimetros(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const factor = 2.54;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * factor;
    fromLabel = 'pulgadas'; toLabel = 'centímetros';
  } else {
    r = v / factor;
    fromLabel = 'centímetros'; toLabel = 'pulgadas';
  }
  const fmt = (n: number) => n.toFixed(4).replace(/\.?0+$/, '');
  // Caso de uso típico: tamaños de pantalla. La pulgada mide la diagonal.
  const pulgadas = d === 'ida' ? v : r;
  const cm = d === 'ida' ? r : v;
  return {
    resultado: r.toFixed(6).replace(/\.?0+$/, '') + ' ' + 'cm'.toString(),
    resumen: v + ' ' + fromLabel + ' = ' + fmt(r) + ' ' + toLabel + '.',
    _insight: {
      title: 'Equivalencia exacta',
      text: '**1 pulgada = 2,54 cm** por definición (sin redondeo). Si son pulgadas de pantalla, esos **' + fmt(pulgadas) + '"** miden **' + fmt(cm) + ' cm** de diagonal, no de ancho.',
      tone: 'neutral',
      icon: '📺'
    }
  };
}
