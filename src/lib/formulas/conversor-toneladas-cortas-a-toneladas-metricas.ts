/** Conversor: tonelada corta ↔ tonelada métrica */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; }

export function conversorToneladasCortasAToneladasMetricas(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const factor = 0.907185;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * factor;
    fromLabel = 'toneladas cortas'; toLabel = 'toneladas métricas';
  } else {
    r = v / factor;
    fromLabel = 'toneladas métricas'; toLabel = 'toneladas cortas';
  }
  const rTxt = r.toFixed(4).replace(/\.?0+$/, '');
  const vTxt = String(v);
  return {
    resultado: r.toFixed(6).replace(/\.?0+$/, '') + ' ' + (d === 'ida' ? 't' : "t cortas"),
    resumen: v + ' ' + fromLabel + ' = ' + rTxt + ' ' + toLabel + '.',
    _insight: {
      title: 'Tonelada corta vs métrica',
      text: 'La **tonelada corta** de EE.UU. (2000 libras) equivale a **0,907 toneladas métricas**, un **9 % menos**. Por eso **' + vTxt + ' ' + fromLabel + '** dan **' + rTxt + ' ' + toLabel + '**. En contratos de commodities (granos, mineral) esta diferencia mueve mucha plata, conviene aclarar siempre qué tonelada se cotiza.',
      tone: 'warn',
      icon: '⚖️'
    }
  };
}
