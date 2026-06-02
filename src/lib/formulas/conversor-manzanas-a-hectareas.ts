/** Conversor: manzana ↔ hectárea */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; }

export function conversorManzanasAHectareas(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const factor = 0.7;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * factor;
    fromLabel = 'manzanas'; toLabel = 'hectáreas';
  } else {
    r = v / factor;
    fromLabel = 'hectáreas'; toLabel = 'manzanas';
  }
  const rTxt = r.toFixed(4).replace(/\.?0+$/, '');
  const ha = d === 'ida' ? r : v;
  const canchas = ha / 0.714;
  return {
    resultado: r.toFixed(6).replace(/\.?0+$/, '') + ' ' + 'ha'.toString(),
    resumen: v + ' ' + fromLabel + ' = ' + rTxt + ' ' + toLabel + '.',
    _insight: {
      title: 'Cuánto terreno es',
      text: '**' + v + ' ' + fromLabel + '** equivalen a **' + rTxt + ' ' + toLabel + '** — unas **' + canchas.toFixed(1).replace(/\.0$/, '') + '** canchas de fútbol. Acá la manzana agraria se toma como **0,7 ha**; en otros países el valor cambia, confirmá la equivalencia local.',
      tone: 'neutral',
      icon: '🌾'
    }
  };
}
