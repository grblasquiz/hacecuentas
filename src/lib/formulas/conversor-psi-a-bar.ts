/** Conversor: libra por pulgada cuadrada ↔ bar */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; }

export function conversorPsiABar(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const factor = 0.0689476;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * factor;
    fromLabel = 'libras por pulgada cuadrada'; toLabel = 'bar';
  } else {
    r = v / factor;
    fromLabel = 'bar'; toLabel = 'libras por pulgada cuadrada';
  }
  const fmt = (n: number) => n.toFixed(4).replace(/\.?0+$/, '');
  // Referencia práctica: presión de neumáticos (~32 psi ≈ 2,2 bar) y atmósfera (~1 bar).
  const bar = d === 'ida' ? r : v;
  const psi = d === 'ida' ? v : r;
  let refTxt: string;
  if (bar < 1) refTxt = 'menos que **una atmósfera** (1 bar al nivel del mar)';
  else if (bar <= 3.5) refTxt = 'el rango típico de **presión de neumáticos** de auto (≈2-2,5 bar)';
  else refTxt = 'una presión **alta**, propia de equipos o industria';
  return {
    resultado: r.toFixed(6).replace(/\.?0+$/, '') + ' ' + (d === 'ida' ? 'bar' : "psi"),
    resumen: v + ' ' + fromLabel + ' = ' + fmt(r) + ' ' + toLabel + '.',
    _insight: {
      title: 'En la práctica',
      text: '**' + fmt(psi) + ' psi** son **' + fmt(bar) + ' bar**: ' + refTxt + '. Regla rápida: **1 bar ≈ 14,5 psi**.',
      tone: 'neutral',
      icon: '🛞'
    }
  };
}
