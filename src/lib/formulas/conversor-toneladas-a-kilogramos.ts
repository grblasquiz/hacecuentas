/** Conversor: tonelada ↔ kilogramo */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; }

export function conversorToneladasAKilogramos(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const factor = 1000.0;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * factor;
    fromLabel = 'toneladas'; toLabel = 'kilogramos';
  } else {
    r = v / factor;
    fromLabel = 'kilogramos'; toLabel = 'toneladas';
  }
  const rTxt = r.toFixed(4).replace(/\.?0+$/, '');
  const vTxt = String(v);
  return {
    resultado: r.toFixed(6).replace(/\.?0+$/, '') + ' ' + 'kg'.toString(),
    resumen: v + ' ' + fromLabel + ' = ' + rTxt + ' ' + toLabel + '.',
    _insight: {
      title: 'Tonelada métrica',
      text: 'Trabajamos con la **tonelada métrica (1 t = 1000 kg)**, la del Sistema Internacional. Entonces **' + vTxt + ' ' + fromLabel + '** son **' + rTxt + ' ' + toLabel + '**. No la confundas con la tonelada corta de EE.UU. (907 kg) ni la larga británica (1016 kg).',
      tone: 'neutral',
      icon: '⚖️'
    }
  };
}
