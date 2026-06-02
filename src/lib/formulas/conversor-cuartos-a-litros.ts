/** Conversor: cuarto ↔ litro */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; }

export function conversorCuartosALitros(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const factor = 0.946353;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * factor;
    fromLabel = 'cuartos'; toLabel = 'litros';
  } else {
    r = v / factor;
    fromLabel = 'litros'; toLabel = 'cuartos';
  }

  const cuartos = d === 'ida' ? v : r;
  const litros = d === 'ida' ? r : v;
  const insight = {
    title: 'Equivalencia útil en la cocina',
    text: '**' + cuartos.toFixed(2).replace(/\.?0+$/, '') + ' cuartos** (quarts de EE. UU.) son **' + litros.toFixed(2).replace(/\.?0+$/, '') + ' litros**. Cada cuarto equivale a **0,946 L**, un poco menos que una botella de litro, dato clave al seguir recetas en medidas estadounidenses.',
    tone: 'neutral',
    icon: '🥛'
  };

  return {
    resultado: r.toFixed(6).replace(/\.?0+$/, '') + ' ' + 'L'.toString(),
    resumen: v + ' ' + fromLabel + ' = ' + r.toFixed(4).replace(/\.?0+$/, '') + ' ' + toLabel + '.',
    _insight: insight
  };
}
