/** Conversor: metro cuadrado ↔ pie cuadrado */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; }

export function conversorMetrosCuadradosAPiesCuadrados(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const factor = 10.7639;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * factor;
    fromLabel = 'metros cuadrados'; toLabel = 'pies cuadrados';
  } else {
    r = v / factor;
    fromLabel = 'pies cuadrados'; toLabel = 'metros cuadrados';
  }
  const rTxt = r.toFixed(4).replace(/\.?0+$/, '');
  const m2 = d === 'ida' ? v : r;
  const ft2 = d === 'ida' ? r : v;
  return {
    resultado: r.toFixed(6).replace(/\.?0+$/, '') + ' ' + 'ft²'.toString(),
    resumen: v + ' ' + fromLabel + ' = ' + rTxt + ' ' + toLabel + '.',
    _insight: {
      title: 'Para avisos inmobiliarios',
      text: 'Una superficie de **' + m2.toLocaleString('es-AR') + ' m²** figura como **' + Math.round(ft2).toLocaleString('es-AR') + ' ft²** en listings de EE.UU. — más de **10 veces** el número, porque cada metro cuadrado son **10,76 pies cuadrados**. No confundas el área (×10,76) con el lado (×3,28).',
      tone: 'neutral',
      icon: '🏠'
    }
  };
}
