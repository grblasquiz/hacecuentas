/** Conversor: bar ↔ libra por pulgada cuadrada */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; }

export function conversorBarAPsi(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const factor = 14.5038;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * factor;
    fromLabel = 'bar'; toLabel = 'libras por pulgada cuadrada';
  } else {
    r = v / factor;
    fromLabel = 'libras por pulgada cuadrada'; toLabel = 'bar';
  }
  // Anchor: presión en PSI y bar, comparada con un neumático típico de auto (~32 PSI / 2,2 bar)
  const psi = d === 'ida' ? r : v;
  const bar = d === 'ida' ? v : r;
  const ruedas = psi / 32;
  const psiFmt = psi.toLocaleString('es-AR', { maximumFractionDigits: 4 });
  const barFmt = bar.toLocaleString('es-AR', { maximumFractionDigits: 4 });
  const ruedasFmt = ruedas.toLocaleString('es-AR', { maximumFractionDigits: ruedas < 10 ? 2 : 0 });
  return {
    resultado: r.toFixed(6).replace(/\.?0+$/, '') + ' ' + 'PSI'.toString(),
    resumen: v + ' ' + fromLabel + ' = ' + r.toFixed(4).replace(/\.?0+$/, '') + ' ' + toLabel + '.',
    _insight: {
      title: 'Qué presión representa',
      text: 'Son **' + psiFmt + ' PSI** (' + barFmt + ' bar): unas **' + ruedasFmt + ' veces** la presión de un neumático de auto, que ronda 32 PSI. 1 bar = 14,5038 PSI.',
      tone: 'neutral',
      icon: '🛞'
    }
  };
}
