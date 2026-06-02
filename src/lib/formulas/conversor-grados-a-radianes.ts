/** Conversor: grado ↔ radián */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; }

export function conversorGradosARadianes(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const factor = 0.0174533;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * factor;
    fromLabel = 'grados'; toLabel = 'radianes';
  } else {
    r = v / factor;
    fromLabel = 'radianes'; toLabel = 'grados';
  }
  // Radianes de referencia, expresados en múltiplos de π para intuición
  const radianes = d === 'ida' ? r : v;
  const enPi = radianes / Math.PI;
  const insight = {
    title: 'Para que te des una idea',
    text: '**' + radianes.toFixed(4) + ' rad** equivalen a **' + enPi.toFixed(3) + ' π**. Clave: 180° = π rad (≈3,1416) y la vuelta completa (360°) = 2π rad.',
    tone: 'neutral',
    icon: '📐'
  };
  return {
    resultado: r.toFixed(6).replace(/\.?0+$/, '') + ' ' + 'rad'.toString(),
    resumen: v + ' ' + fromLabel + ' = ' + r.toFixed(4).replace(/\.?0+$/, '') + ' ' + toLabel + '.',
    _insight: insight
  };
}
