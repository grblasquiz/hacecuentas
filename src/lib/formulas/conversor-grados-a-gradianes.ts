/** Conversor: grado ↔ gradián */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; }

export function conversorGradosAGradianes(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const factor = 1.11111;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * factor;
    fromLabel = 'grados'; toLabel = 'gradianes';
  } else {
    r = v / factor;
    fromLabel = 'gradianes'; toLabel = 'grados';
  }
  // Grados de referencia para situar el ángulo en el círculo
  const grados = d === 'ida' ? v : r;
  const vueltas = grados / 360;
  const insight = {
    title: 'Para que te des una idea',
    text: '**' + grados.toLocaleString('es-AR', { maximumFractionDigits: 2 }) + '°** son **' + vueltas.toFixed(2) + ' vueltas** completas. En gradianes, la circunferencia entera mide 400 gon (el ángulo recto = 100 gon, no 90).',
    tone: 'neutral',
    icon: '📐'
  };
  return {
    resultado: r.toFixed(6).replace(/\.?0+$/, '') + ' ' + 'gon'.toString(),
    resumen: v + ' ' + fromLabel + ' = ' + r.toFixed(4).replace(/\.?0+$/, '') + ' ' + toLabel + '.',
    _insight: insight
  };
}
