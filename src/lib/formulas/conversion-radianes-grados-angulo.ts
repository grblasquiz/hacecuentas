export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function conversionRadianesGradosAngulo(i: Inputs): Outputs {
  const v = Number(i.valor) || 0;
  const u = String(i.unidad || 'a');
  const factor = 57.29577951308232;
  const r = u === 'a' ? v * factor : v / factor;
  const fromU = u === 'a' ? 'rad' : '°';
  const toU = u === 'a' ? '°' : 'rad';
  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 4 });
  const grados = u === 'a' ? r : v;
  const radianes = u === 'a' ? v : r;
  const enPiRad = radianes / Math.PI;
  return {
    resultado: r.toFixed(4).replace(/\.?0+$/, '') + ' ' + toU,
    resumen: `${v} ${fromU} = ${r.toFixed(4).replace(/\.?0+$/, '')} ${toU}.`,
    _insight: {
      title: 'El ángulo, de un vistazo',
      text: `**${fmt.format(radianes)} rad** equivalen a **${fmt.format(grados)}°**, es decir **${fmt.format(enPiRad)}·π** radianes. Recordá los anclajes: π rad = 180° y 2π rad = 360° (una vuelta completa).`,
      tone: 'neutral' as const,
      icon: '📐',
    }
  };
}
