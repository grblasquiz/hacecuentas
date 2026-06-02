/** Conversor: talle de calzado US ↔ talle de calzado AR/EU */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; }

export function conversorTallesCalzadoUsArEu(i: Inputs): Outputs {
  const v = String(i.valor || '');
  const d = String(i.direccion || 'ida');
  if (!v) return { resultado: '—', resumen: 'Ingresá un talle (ej: M, 42, 10).' };
  const _insight = {
    title: 'Antes de comprar tu calzado',
    text: `Para el talle **${v}** no hay una equivalencia única: una zapatilla deportiva US calza distinto que un zapato de vestir EU. La regla práctica es **medir el pie en centímetros** y cruzarlo con la tabla del fabricante, porque entre marcas puede haber hasta un número de diferencia.`,
    tone: 'neutral',
    icon: '👟',
  };
  return {
    resultado: v + ' → consultá tabla',
    resumen: 'Los talles varían por marca. Consultá la tabla del fabricante específico para equivalencias exactas US/AR/EU.',
    _insight
  };
}
