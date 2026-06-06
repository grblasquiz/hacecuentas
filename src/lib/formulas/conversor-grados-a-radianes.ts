/** Conversor: grado ↔ radián */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; }

const DEG_TO_RAD = Math.PI / 180;  // exact: π/180 ≈ 0.017453292519943295
const RAD_TO_DEG = 180 / Math.PI;  // exact: 180/π ≈ 57.29577951308232

export function conversorGradosARadianes(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  let r: number;
  let fromLabel: string, toLabel: string, unit: string;
  if (d === 'ida') {
    r = v * DEG_TO_RAD;
    fromLabel = 'grados'; toLabel = 'radianes'; unit = 'rad';
  } else {
    r = v * RAD_TO_DEG;
    fromLabel = 'radianes'; toLabel = 'grados'; unit = '°';
  }
  // Radianes de referencia, expresados en múltiplos de π para intuición
  const radianes = d === 'ida' ? r : v;
  const enPi = radianes / Math.PI;
  const insight = {
    title: 'Para que te des una idea',
    text: '**' + radianes.toFixed(4) + ' rad** equivalen a **' + enPi.toFixed(4) + ' π**. Clave: 180° = π rad (≈3,14159) y la vuelta completa (360°) = 2π rad (≈6,28318).',
    tone: 'neutral',
    icon: '📐'
  };
  return {
    resultado: r.toFixed(8).replace(/\.?0+$/, '') + ' ' + unit,
    resumen: v + ' ' + fromLabel + ' = ' + r.toFixed(6).replace(/\.?0+$/, '') + ' ' + toLabel + '.',
    _insight: insight
  };
}
