export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | any; _insight?: any; _chart?: any; }
export function pensionViudezPorcentajeConyuge(i: Inputs): Outputs {
  const h=Number(i.haberJubilado)||0; const hij=Math.max(0,Math.floor(Number(i.hijosMenores)||0));
  // Ley 24.241 (SIPA) art. 98, sobre el haber del causante:
  //  · cónyuge/conviviente: 70% sin hijos con derecho (inc. a), 50% con hijos con derecho (inc. b)
  //  · 20% por cada hijo con derecho (inc. c)
  //  · pauta II: la suma de TODAS las pensiones no puede superar el 100% del haber del causante;
  //    si lo supera, se recalcula manteniendo las proporciones (prorrateo).
  const pctConyugeNom=hij===0?70:50;
  const totalNom=pctConyugeNom+hij*20;            // 70, 70, 90, 110, 130…
  const factor=totalNom>100?100/totalNom:1;       // prorrateo (pauta II)
  const prorrateo=totalNom>100;
  const pctConyuge=pctConyugeNom*factor;          // % del haber para el cónyuge
  const pctHijo=hij>0?20*factor:0;                // % del haber por cada hijo
  const pctTotal=Math.min(100,totalNom);          // % total del grupo familiar
  const pConyuge=h*pctConyuge/100;
  const pTotal=h*pctTotal/100;
  const fmtAR=(n:number)=>'$'+Math.round(n).toLocaleString('es-AR');
  const fpct=(n:number)=>(Math.round(n*100)/100).toLocaleString('es-AR',{maximumFractionDigits:2})+'%';
  const _insight={
    title: hij===0 ? 'Cónyuge sin hijos: 70% del haber' : (prorrateo ? 'Concurrencia con hijos: prorrateo al 100%' : 'Concurrencia con hijos: 50% para el cónyuge'),
    text: hij===0
      ? `Sin hijos con derecho a pensión, el cónyuge supérstite cobra el **70%** del haber del causante: **${fmtAR(pConyuge)}/mes** sobre ${fmtAR(h)} (Ley 24.241, art. 98 inc. a).`
      : (prorrateo
          ? `Con **${hij} hijos** la suma supera el 100% (50% + 20%×${hij} = ${totalNom}%), así que se **prorratea** (art. 98, pauta II): el cónyuge queda en **${fpct(pctConyuge)}** (≈${fmtAR(pConyuge)}/mes) y cada hijo en **${fpct(pctHijo)}**. El grupo familiar cobra el 100% (${fmtAR(pTotal)}/mes).`
          : `Con hijos con derecho, el cónyuge baja al **50%** (art. 98 inc. b) y cada hijo cobra **20%** (inc. c). Tu pensión: **${fmtAR(pConyuge)}/mes**; con ${hij} hijo(s) el grupo familiar suma **${fpct(pctTotal)}** del haber (${fmtAR(pTotal)}/mes).`),
    tone: 'neutral',
    icon:'🕊️',
  };
  const _chart={
    type:'scale',
    marker:Math.round(pctConyuge),
    markerLabel:fpct(pctConyuge),
    min:0,
    segments:[
      { nombre:'Con hijos (50% o prorrateo)', max:50, color:'#fcd34d', colorDark:'#b45309' },
      { nombre:'Sin hijos (70%)', max:70, color:'#86efac', colorDark:'#15803d' },
    ],
    ariaLabel:`Porcentaje del haber para el cónyuge: ${fpct(pctConyuge)} (70% sin hijos, 50% con hijos, prorrateo si la suma supera el 100%)`,
  };
  const resumen = hij===0
    ? `Cónyuge sin hijos: 70% de ${fmtAR(h)} = ${fmtAR(pConyuge)}/mes.`
    : `Cónyuge ${fpct(pctConyuge)} + ${hij} hijo(s) a ${fpct(pctHijo)} c/u. Grupo familiar ${fpct(pctTotal)} de ${fmtAR(h)} = ${fmtAR(pTotal)}/mes; el cónyuge cobra ${fmtAR(pConyuge)}/mes.`;
  return { pension:fmtAR(pConyuge), porcentaje:fpct(pctConyuge), resumen, _insight, _chart };
}
