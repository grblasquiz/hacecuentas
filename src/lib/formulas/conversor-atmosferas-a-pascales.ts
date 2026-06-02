/** Conversor: atmósfera ↔ pascal */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; }

export function conversorAtmosferasAPascales(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const factor = 101325.0;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * factor;
    fromLabel = 'atmósferas'; toLabel = 'pascales';
  } else {
    r = v / factor;
    fromLabel = 'pascales'; toLabel = 'atmósferas';
  }
  // Anchor: la presión expresada en atmósferas (1 atm = presión a nivel del mar) y en kPa
  const atm = d === 'ida' ? v : r;
  const pa = d === 'ida' ? r : v;
  const kPa = pa / 1000;
  const atmFmt = atm.toLocaleString('es-AR', { maximumFractionDigits: 4 });
  const kPaFmt = kPa.toLocaleString('es-AR', { maximumFractionDigits: 2 });
  return {
    resultado: r.toFixed(6).replace(/\.?0+$/, '') + ' ' + 'Pa'.toString(),
    resumen: v + ' ' + fromLabel + ' = ' + r.toFixed(4).replace(/\.?0+$/, '') + ' ' + toLabel + '.',
    _insight: {
      title: 'Qué presión representa',
      text: 'Son **' + atmFmt + ' atmósferas** (' + kPaFmt + ' kPa): 1 atm es la presión del aire a nivel del mar. 1 atm = 101.325 Pa exactos.',
      tone: 'neutral',
      icon: '🌡️'
    }
  };
}
