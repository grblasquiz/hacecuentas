/** Conversor: gramo ↔ onza */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; }

export function conversorGramosAOnzas(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const factor = 0.035274;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * factor;
    fromLabel = 'gramos'; toLabel = 'onzas';
  } else {
    r = v / factor;
    fromLabel = 'onzas'; toLabel = 'gramos';
  }
  // Gramos y onzas de referencia
  const gramos = d === 'ida' ? v : r;
  const onzas = d === 'ida' ? r : v;
  const insight = {
    title: 'Para que te des una idea',
    text: '**' + gramos.toLocaleString('es-AR', { maximumFractionDigits: 2 }) + ' g** son **' + onzas.toFixed(2) + ' oz**. Una onza pesa 28,35 g; este conversor usa la onza avoirdupois (la común para alimentos y cocina), no la onza troy de 31,1 g del oro.',
    tone: 'neutral',
    icon: '⚖️'
  };
  return {
    resultado: r.toFixed(6).replace(/\.?0+$/, '') + ' ' + 'oz'.toString(),
    resumen: v + ' ' + fromLabel + ' = ' + r.toFixed(4).replace(/\.?0+$/, '') + ' ' + toLabel + '.',
    _insight: insight
  };
}
