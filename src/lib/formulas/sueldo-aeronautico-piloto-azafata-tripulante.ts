export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function sueldoAeronauticoPilotoAzafataTripulante(i: Inputs): Outputs {
  const p=String(i.puesto||'trip'); const hv=Number(i.horasVuelo)||0; const ant=Number(i.antiguedad)||0;
  const bases: Record<string,[number,number]> = {
    'piloto-com': [3500000, 45000],
    'copilot': [2200000, 32000],
    'trip': [900000, 12000],
    'despach': [1100000, 0]
  };
  const labels: Record<string,string> = {
    'piloto-com':'Piloto comercial','copilot':'Copiloto','trip':'Tripulante de cabina','despach':'Despachante',
  };
  const [b,hora]=bases[p]||bases.trip;
  const basicoAntig=b*(1+ant*0.01);
  const horas=hora*hv;
  const bruto=basicoAntig+horas;
  const neto=bruto*0.80;
  const aportes=bruto-neto;
  const fmt=(n:number)=>'$'+n.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.');
  const pLabel=labels[p]||p;
  const pctHoras=bruto>0?horas/bruto*100:0;
  const insight={
    title:'Cuánto pesan las horas de vuelo en tu sueldo',
    text:`Como **${pLabel}** con **${ant} ${ant===1?'año':'años'}** de antigüedad y **${hv} horas** de vuelo, tu bruto es **${fmt(bruto)}** y te quedan **${fmt(neto)}** netos tras **${fmt(aportes)}** de aportes (20%). Las horas de vuelo aportan **${fmt(horas)}** (**${pctHoras.toFixed(0)}%** del bruto), el resto es básico más antigüedad.`,
    tone:'neutral',
    icon:'✈️',
  };
  const chart={
    type:'doughnut',
    slices:[
      { label:'Neto en mano', value:Math.round(neto) },
      { label:'Aportes (20%)', value:Math.round(aportes) },
    ],
    prefix:'$',
    centerValue:fmt(bruto),
    centerLabel:'Bruto',
    ariaLabel:'Composición del sueldo bruto aeronáutico: neto en mano y aportes',
  };
  return { basico:fmt(basicoAntig), horasPago:fmt(horas), neto:fmt(neto), resumen:`${p} con ${hv} horas vuelo + antigüedad ${ant}y: neto ~$${neto.toFixed(0)}.`, _insight:insight, _chart:chart };
}
