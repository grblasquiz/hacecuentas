/** Conversor: talle US ↔ talle AR/EU */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; }

export function conversorTallesRopaUsArEu(i: Inputs): Outputs {
  const v = String(i.valor || '');
  const d = String(i.direccion || 'ida');
  if (!v) return { resultado: '—', resumen: 'Ingresá un talle (ej: M, 42, 10).' };
  const _insight = {
    title: 'Antes de comprar tu ropa',
    text: `Para el talle **${v}** la equivalencia no es exacta: el talle US suele correr más grande que el AR/EU y cada marca arma su propio molde. Lo más seguro es **medirte (busto, cintura, cadera) en centímetros** y compararlo con la tabla específica del fabricante antes de elegir.`,
    tone: 'neutral',
    icon: '👕',
  };
  return {
    resultado: v + ' → consultá tabla',
    resumen: 'Los talles varían por marca. Consultá la tabla del fabricante específico para equivalencias exactas US/AR/EU.',
    _insight
  };
}
