export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function gasNaturalSubsidioZonasFriasPatagonia(i: Inputs): Outputs {
  const m=Number(i.m3Mes)||0; const z=String(i.zona||'sin_subsidio'); const tb=Number(i.tarifaBase)||200;
  const desc={'patagonia':0.6,'cordillera':0.5,'resto_sur':0.3,'sin_subsidio':0}[z] ?? 0;
  const costo=m*tb*(1-desc)*1.21;
  const sinSubsidio=m*tb*1.21;
  const ahorro=sinSubsidio-costo;
  const descPct=desc*100;
  const zonaTxt=z.replace(/_/g,' ');
  const _insight={
    title:'Tu factura de gas con subsidio',
    text: desc>0
      ? `En zona **${zonaTxt}** pagás **$${Math.round(costo).toLocaleString('es-AR')}**/mes: el subsidio del **${descPct.toFixed(0)}%** te ahorra **$${Math.round(ahorro).toLocaleString('es-AR')}** frente a la tarifa plena.`
      : `Sin subsidio de zona fría pagás la tarifa plena: **$${Math.round(costo).toLocaleString('es-AR')}**/mes por ${m} m³. Verificá si tu localidad califica para algún descuento.`,
    tone: desc>0?'good':'neutral',
    icon:'🔥',
  };
  const _chart={
    type:'scale',
    marker:descPct,
    markerLabel:`${descPct.toFixed(0)}% subsidio`,
    min:0,
    segments:[
      {nombre:'Sin subsidio',max:15,color:'#dc2626',colorDark:'#ef4444'},
      {nombre:'Parcial',max:35,color:'#eab308',colorDark:'#facc15'},
      {nombre:'Cordillera',max:55,color:'#3b82f6',colorDark:'#60a5fa'},
      {nombre:'Patagonia',max:70,color:'#16a34a',colorDark:'#22c55e'},
    ],
    ariaLabel:`Subsidio aplicado del ${descPct.toFixed(0)}% sobre una escala de 0 a 70%`,
  };
  return { costoMensual:`$${Math.round(costo).toLocaleString('es-AR')}`, descuentoAplicado:`${descPct.toFixed(0)}%`, interpretacion:`Zona ${zonaTxt}: pagás $${Math.round(costo).toLocaleString('es-AR')} (${descPct.toFixed(0)}% subsidio).`, _insight, _chart };
}
