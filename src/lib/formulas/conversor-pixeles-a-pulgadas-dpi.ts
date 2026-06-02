/** Conversor: píxel ↔ pulgada */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; }

export function conversorPixelesAPulgadasDpi(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const factor = 0.00694444;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * factor;
    fromLabel = 'píxeles'; toLabel = 'pulgadas';
  } else {
    r = v / factor;
    fromLabel = 'pulgadas'; toLabel = 'píxeles';
  }
  const fmt = (n: number) => n.toFixed(4).replace(/\.?0+$/, '');
  // El factor 0,006944 = 1/144, o sea esta conversión asume una densidad fija de 144 DPI.
  const dpi = Math.round(1 / factor); // 144
  const pulgadas = d === 'ida' ? r : v;
  const px96 = pulgadas * 96;
  return {
    resultado: r.toFixed(6).replace(/\.?0+$/, '') + ' ' + 'in'.toString(),
    resumen: v + ' ' + fromLabel + ' = ' + fmt(r) + ' ' + toLabel + '.',
    _insight: {
      title: 'Depende de la densidad',
      text: 'El resultado supone **' + dpi + ' DPI**. La equivalencia px↔pulgada NO es fija: a **96 DPI** (estándar web) esas **' + fmt(pulgadas) + ' in** serían **' + fmt(px96) + ' px**. Verificá el DPI real de tu pantalla o archivo.',
      tone: 'warn',
      icon: '🖥️'
    }
  };
}
