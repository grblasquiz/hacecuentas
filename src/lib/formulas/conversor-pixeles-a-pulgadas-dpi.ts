/** Conversor: píxeles ↔ pulgadas con DPI configurable */
export interface Inputs {
  valor: number | string;
  dpi?: number | string;
  direccion?: string;
}
export interface Outputs { resultado: string; resumen: string; _insight?: any; }

export function conversorPixelesAPulgadasDpi(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v) || v === 0) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };

  // DPI: default 96 (estándar web/pantalla). Mínimo 1.
  const dpiRaw = Number(i.dpi);
  const dpi = (!isNaN(dpiRaw) && dpiRaw >= 1) ? dpiRaw : 96;

  const d = String(i.direccion || 'ida');
  let resultado: number;
  let fromLabel: string, toLabel: string, fromUnit: string, toUnit: string;

  if (d === 'ida') {
    // Píxeles → Pulgadas: in = px / dpi
    resultado = v / dpi;
    fromLabel = 'píxeles'; toLabel = 'pulgadas';
    fromUnit = 'px'; toUnit = 'in';
  } else {
    // Pulgadas → Píxeles: px = in × dpi
    resultado = v * dpi;
    fromLabel = 'pulgadas'; toLabel = 'píxeles';
    fromUnit = 'in'; toUnit = 'px';
  }

  const fmt = (n: number, dec = 4) => {
    const s = n.toFixed(dec);
    // Remove trailing zeros but keep at least 2 decimals for readability
    return s.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '');
  };

  // Context hint for the insight
  let contexto = '';
  if (dpi === 72) contexto = 'Pantalla estándar / web antigua (72 DPI).';
  else if (dpi === 96) contexto = 'Pantalla estándar web / Windows (96 DPI).';
  else if (dpi === 150) contexto = 'Impresión básica / pósters grandes.';
  else if (dpi === 300) contexto = 'Impresión profesional / imprenta (300 DPI).';
  else if (dpi === 600) contexto = 'Alta resolución / offset profesional (600 DPI).';
  else if (dpi >= 400) contexto = 'Pantalla Retina / alta densidad.';
  else contexto = `Densidad personalizada: ${dpi} DPI.`;

  const displayResult = d === 'ida'
    ? fmt(resultado, 6)
    : Math.round(resultado).toString();

  return {
    resultado: displayResult + ' ' + toUnit,
    resumen: `${v} ${fromLabel} a ${dpi} DPI = ${displayResult} ${toLabel}.`,
    _insight: {
      title: 'Contexto de resolución',
      text: contexto + ` **1 pulgada = ${dpi} px** a esta densidad. Fórmula: ${d === 'ida' ? `pulgadas = px ÷ DPI = ${v} ÷ ${dpi} = ${fmt(resultado, 4)}` : `píxeles = in × DPI = ${v} × ${dpi} = ${Math.round(resultado)}`}.`,
      tone: 'info',
      icon: '🖥️'
    }
  };
}
