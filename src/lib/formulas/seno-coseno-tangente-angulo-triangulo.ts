export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function senoCosenoTangenteAnguloTriangulo(i: Inputs): Outputs {
  const a=Number(i.ang)||0; const u=String(i.unidad||'deg');
  const rad=u==='deg'?a*Math.PI/180:a;
  const s=Math.sin(rad), c=Math.cos(rad); const t=Math.abs(c)<1e-10?'∞':Math.tan(rad);
  const tStr=typeof t==='number'?t.toFixed(4):t;

  let insightText:string;
  if (t==='∞') {
    insightText=`En **${a} ${u}** el coseno vale **0**, así que la **tangente no está definida** (tiende a ∞). El seno es **${s.toFixed(4)}**.`;
  } else {
    insightText=`Para **${a} ${u}**: seno **${s.toFixed(4)}**, coseno **${c.toFixed(4)}** y tangente **${tStr}**. Recordá que sin²+cos²=1 y que tan = seno/coseno.`;
  }
  const _insight={
    title:'Razones trigonométricas',
    text:insightText,
    tone:'neutral',
    icon:'📐',
  };

  return { seno:s.toFixed(4), coseno:c.toFixed(4), tangente:tStr, resumen:`${a} ${u}: sin=${s.toFixed(3)}, cos=${c.toFixed(3)}.`, _insight };
}
