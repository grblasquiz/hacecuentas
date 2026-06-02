/** Conversor: milímetro de mercurio ↔ kilopascal */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; }

export function conversorMmhgAKpa(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const factor = 0.133322;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * factor;
    fromLabel = 'milímetros de mercurio'; toLabel = 'kilopascales';
  } else {
    r = v / factor;
    fromLabel = 'kilopascales'; toLabel = 'milímetros de mercurio';
  }
  const rTxt = r.toFixed(4).replace(/\.?0+$/, '');
  // Valor expresado siempre en mmHg para referenciar presión arterial / atmosférica
  const mmhg = d === 'ida' ? v : r;
  let ref: string;
  if (mmhg >= 740 && mmhg <= 780) {
    ref = `Equivale a la presión atmosférica a nivel del mar (~760 mmHg = 101,3 kPa).`;
  } else if (mmhg >= 110 && mmhg <= 140) {
    ref = `Está en el rango de la presión arterial sistólica típica (120 mmHg ≈ 16 kPa).`;
  } else if (mmhg >= 60 && mmhg <= 90) {
    ref = `Está en el rango de la presión arterial diastólica típica (80 mmHg ≈ 10,7 kPa).`;
  } else {
    ref = `Recordá: 1 mmHg = 0,133322 kPa, así que 1 kPa equivale a unos 7,5 mmHg.`;
  }
  return {
    resultado: r.toFixed(6).replace(/\.?0+$/, '') + ' ' + 'kPa'.toString(),
    resumen: v + ' ' + fromLabel + ' = ' + rTxt + ' ' + toLabel + '.',
    _insight: {
      title: 'Cómo leer la conversión',
      text: `**${v} ${fromLabel}** equivalen a **${rTxt} ${toLabel}**. ${ref}`,
      tone: 'neutral',
      icon: '🩺'
    }
  };
}
