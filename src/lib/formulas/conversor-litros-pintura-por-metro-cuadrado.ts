/** Conversor: metro cuadrado ↔ litro de pintura */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; }

export function conversorLitrosPinturaPorMetroCuadrado(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const factor = 0.1;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * factor;
    fromLabel = 'metros cuadrados'; toLabel = 'litros de pintura';
  } else {
    r = v / factor;
    fromLabel = 'litros de pintura'; toLabel = 'metros cuadrados';
  }
  const rTxt = r.toFixed(4).replace(/\.?0+$/, '');
  const _insight = {
    title: 'Pensá en las manos de pintura',
    text: d === 'ida'
      ? 'Para **' + v + ' m²** calculá unos **' + rTxt + ' L** por mano (rinde ~10 m²/L). Como casi siempre van **2 manos**, duplicá ese número al comprar.'
      : '**' + v + ' L** cubren aprox. **' + rTxt + ' m²** por mano (rinde ~10 m²/L). El rinde real cae con paredes porosas, colores fuertes o rodillos que cargan de más.',
    tone: 'neutral',
    icon: '🎨'
  };
  return {
    resultado: r.toFixed(6).replace(/\.?0+$/, '') + ' ' + 'L'.toString(),
    resumen: v + ' ' + fromLabel + ' = ' + rTxt + ' ' + toLabel + '.',
    _insight
  };
}
