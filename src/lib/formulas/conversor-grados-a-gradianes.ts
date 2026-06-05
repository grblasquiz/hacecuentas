/** Conversor: grado ↔ gradián (gon)
 * Factor exacto: 1° = 10/9 gon (400 gon / 360°)
 * 1 gon = 9/10 = 0.9°
 */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; }

export function conversorGradosAGradianes(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  // Factor exacto: 10/9 (no 1.11111, que introduce error de redondeo)
  const FACTOR = 10 / 9; // 1° = 10/9 gon exactos
  let r: number;
  let fromLabel: string, toLabel: string, toUnit: string;
  if (d === 'ida') {
    r = v * FACTOR;
    fromLabel = 'grados'; toLabel = 'gradianes'; toUnit = 'gon';
  } else {
    r = v * (9 / 10); // inverso exacto
    fromLabel = 'gradianes'; toLabel = 'grados'; toUnit = '°';
  }
  // Grados de referencia para situar el ángulo en el círculo
  const grados = d === 'ida' ? v : r;
  const vueltas = grados / 360;
  const insight = {
    title: 'Para que te des una idea',
    text: '**' + grados.toLocaleString('es-AR', { maximumFractionDigits: 4 }) + '°** son **' + vueltas.toFixed(4).replace(/\.?0+$/, '') + ' vueltas** completas. En gradianes, la circunferencia entera mide 400 gon (el ángulo recto = 100 gon, no 90).',
    tone: 'neutral',
    icon: '📐'
  };
  // Format result: show up to 6 significant decimals, strip trailing zeros
  const rFormatted = parseFloat(r.toFixed(8)).toString();
  return {
    resultado: rFormatted + ' ' + toUnit,
    resumen: v + ' ' + fromLabel + ' = ' + rFormatted + ' ' + toLabel + '.',
    _insight: insight
  };
}
