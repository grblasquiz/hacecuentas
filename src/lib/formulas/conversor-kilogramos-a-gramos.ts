/** Conversor: kilogramo ↔ gramo */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; }

export function conversorKilogramosAGramos(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const factor = 1000.0;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * factor;
    fromLabel = 'kilogramos'; toLabel = 'gramos';
  } else {
    r = v / factor;
    fromLabel = 'gramos'; toLabel = 'kilogramos';
  }
  const kg = d === 'ida' ? v : r;
  const gramos = d === 'ida' ? r : v;
  return {
    resultado: r.toFixed(6).replace(/\.?0+$/, '') + ' ' + 'g'.toString(),
    resumen: v + ' ' + fromLabel + ' = ' + r.toFixed(4).replace(/\.?0+$/, '') + ' ' + toLabel + '.',
    _insight: {
      title: 'Solo corrés la coma',
      text: 'Un kilogramo son **1.000 gramos** exactos, así que **' + kg.toLocaleString('es-AR', { maximumFractionDigits: 4 }) + ' kg = ' + gramos.toLocaleString('es-AR', { maximumFractionDigits: 2 }) + ' g**. Pasar de kg a g es multiplicar por 1.000 (mover la coma 3 lugares); para volver, dividir por 1.000.',
      tone: 'neutral',
      icon: '⚖️'
    }
  };
}
