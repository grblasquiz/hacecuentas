/** Conversor: talle US ↔ talle AR/EU */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; }

export function conversorTallesRopaUsArEu(i: Inputs): Outputs {
  const v = String(i.valor || '');
  const d = String(i.direccion || 'ida');
  if (!v) return { resultado: '—', resumen: 'Ingresá un talle (ej: M, 42, 10).' };
  return {
    resultado: v + ' → consultá tabla',
    resumen: 'Los talles varían por marca. Consultá la tabla del fabricante específico para equivalencias exactas US/AR/EU.'
  };
}
