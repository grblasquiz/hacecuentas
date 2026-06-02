export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function seguroAutoCuotaMensualCobertura(i: Inputs): Outputs {
  const v=Number(i.valor)||0; const c=String(i.cob||'rc');
  const pct:Record<string,number>={rc:0.01,interm:0.025,todo:0.04};
  const mes=v*(pct[c]||0.02)/12;
  const nombreCob:Record<string,string>={rc:'Responsabilidad civil',interm:'Cobertura intermedia',todo:'Todo riesgo'};
  const pctAnual=(((pct[c]||0.02))*100).toFixed(1);
  const _insight = {
    title: 'Tu cuota mensual estimada',
    text: `Para un auto de **$${v.toLocaleString()}** con cobertura **${nombreCob[c]||c}**, la cuota ronda los **$${mes.toFixed(0)}/mes** ($${(mes*12).toFixed(0)}/año), cerca del **${pctAnual}%** del valor por año. Pedí varias cotizaciones: la tasa real varía mucho entre aseguradoras.`,
    tone: 'neutral',
    icon: '🚗',
  };
  return { mensual:`$${mes.toFixed(0)}`, anual:`$${(mes*12).toFixed(0)}`, resumen:`Auto $${v.toLocaleString()} ${c}: ~$${mes.toFixed(0)}/mes.`, _insight } as Outputs;
}
