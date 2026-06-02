export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function gananciasTramosEmpleadoMensual2026(i: Inputs): Outputs {
  const s=Number(i.sueldoBrutoMensual)||0;
  const tramos=[[1800000,0.05],[2200000,0.09],[2700000,0.12],[3300000,0.15],[4000000,0.19],[5000000,0.23],[6500000,0.27],[9000000,0.31]];
  let imp=0, prev=0, alic=0.35;
  for (const [tope,al] of tramos) { if (s<=tope) { imp+=(s-prev)*al; alic=al; break; } else { imp+=(tope-prev)*al; prev=tope; } }
  if (s>9000000) imp+=(s-9000000)*0.35;
  const alicPct=alic*100;
  const efectiva=s>0?(imp/s)*100:0;
  const _insight={
    title:'Tu retención de Ganancias',
    text:`Sobre $${s.toLocaleString('es-AR')} brutos te retienen ~**$${imp.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.')}** (alícuota efectiva **${efectiva.toFixed(1)}%**). Tu último peso ganado tributa al **${alicPct.toFixed(0)}%** marginal, así que cada aumento rinde menos de lo que parece.`,
    tone: alic>=0.27?'warn':(alic<=0.12?'good':'neutral'),
    icon:'🧾',
  };
  const _chart={
    type:'scale',
    marker:alicPct,
    markerLabel:`${alicPct.toFixed(0)}% marginal`,
    min:0,
    segments:[
      {nombre:'Baja',max:12,color:'#16a34a',colorDark:'#22c55e'},
      {nombre:'Media',max:23,color:'#eab308',colorDark:'#facc15'},
      {nombre:'Alta',max:31,color:'#f97316',colorDark:'#fb923c'},
      {nombre:'Tope',max:35,color:'#dc2626',colorDark:'#ef4444'},
    ],
    ariaLabel:`Alícuota marginal de ${alicPct.toFixed(0)}% sobre una escala de 0 a 35%`,
  };
  return { retencion:'$'+imp.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), alicuotaMarginal:alicPct.toFixed(0)+'%', resumen:`Sueldo $${s.toLocaleString('es-AR')}: retención ganancias ~$${imp.toFixed(0)}, tramo marginal ${alicPct.toFixed(0)}%.`, _insight, _chart };
}
