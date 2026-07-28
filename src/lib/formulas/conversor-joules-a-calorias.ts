/** Conversor: joule ↔ caloría */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; }

export function conversorJoulesACalorias(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const factor = 0.239006;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * factor;
    fromLabel = 'joules'; toLabel = 'calorías';
  } else {
    r = v / factor;
    fromLabel = 'calorías'; toLabel = 'joules';
  }
  const cal = d === 'ida' ? r : v;
  const kcal = cal / 1000;
  return {
    resultado: r.toFixed(6).replace(/\.?0+$/, '') + ' ' + (d === 'ida' ? 'cal' : "J"),
    resumen: v + ' ' + fromLabel + ' = ' + r.toFixed(4).replace(/\.?0+$/, '') + ' ' + toLabel + '.',
    _insight: {
      title: 'Caloría chica vs. kcal de las etiquetas',
      text: 'Acá hablamos de la **caloría chica (cal)**: tu resultado son **' + cal.toLocaleString('es-AR', { maximumFractionDigits: 2 }) + ' cal**, que son apenas **' + kcal.toLocaleString('es-AR', { maximumFractionDigits: 4 }) + ' kcal**. Las "calorías" de los alimentos son en realidad kilocalorías (1 kcal = 1.000 cal = 4.184 J).',
      tone: 'neutral',
      icon: '🔥'
    }
  };
}
