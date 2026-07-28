/** Conversor: pulgada cuadrada ↔ centímetro cuadrado */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; }

export function conversorPulgadasCuadradasACentimetrosCuadrados(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const factor = 6.4516;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * factor;
    fromLabel = 'pulgadas cuadradas'; toLabel = 'centímetros cuadrados';
  } else {
    r = v / factor;
    fromLabel = 'centímetros cuadrados'; toLabel = 'pulgadas cuadradas';
  }
  const rStr = r.toFixed(4).replace(/\.?0+$/, '');
  const vStr = String(v);
  return {
    resultado: r.toFixed(6).replace(/\.?0+$/, '') + ' ' + (d === 'ida' ? 'cm²' : "in²"),
    resumen: v + ' ' + fromLabel + ' = ' + rStr + ' ' + toLabel + '.',
    _insight: {
      title: 'Ojo: es área, no longitud',
      text: '**' + vStr + ' ' + fromLabel + '** son **' + rStr + ' ' + toLabel + '**. Al ser superficie, el factor es **6,4516** (= 2,54²), no 2,54: por eso el número crece mucho más rápido que en una conversión de largo.',
      tone: 'neutral',
      icon: '🟦'
    }
  };
}
