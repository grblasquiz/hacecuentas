export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function upworkFreelancerComisionNetaArgentina(i: Inputs): Outputs {
  const b=Number(i.brutoHora)||0; const h=Number(i.horasMes)||0; const p=String(i.plataforma||'upwork');
  const comRates={'upwork':0.1,'freelancer':0.1,'toptal':0,'fiverr':0.2,'direct':0};
  const bruto=b*h; const comision=bruto*comRates[p]; const neto=bruto-comision;
  const pctCom=comRates[p]*100;
  const plataformaNombre:Record<string,string>={'upwork':'Upwork','freelancer':'Freelancer','toptal':'Toptal','fiverr':'Fiverr','direct':'cliente directo'};
  const tone = pctCom===0 ? 'good' : pctCom>=20 ? 'warn' : 'neutral';
  const insight = {
    title: pctCom===0 ? `Te quedás con los USD ${Math.round(neto).toLocaleString('en-US')} completos` : `${plataformaNombre[p]} se lleva USD ${Math.round(comision).toLocaleString('en-US')}/mes`,
    text: pctCom===0
      ? `Facturando **USD ${Math.round(bruto).toLocaleString('en-US')}/mes** sin comisión de plataforma, te quedan los **USD ${Math.round(neto).toLocaleString('en-US')}** íntegros. Ojo: igual restá impuestos y el costo de pasar USD a pesos.`
      : `De los **USD ${Math.round(bruto).toLocaleString('en-US')}** que facturás, **${plataformaNombre[p]}** se queda con el **${pctCom.toFixed(0)}%** (**USD ${Math.round(comision).toLocaleString('en-US')}/mes**) y te llegan **USD ${Math.round(neto).toLocaleString('en-US')}**.${pctCom>=20 ? ' Es una mordida fuerte: a este volumen, mover parte a clientes directos te suma un sueldo extra al año.' : ''}`,
    tone,
    icon: pctCom===0 ? '🟢' : pctCom>=20 ? '✂️' : '💸',
  };
  const out:Outputs = { netoMensual:`USD ${Math.round(neto).toLocaleString('en-US')}`, comision:`USD ${Math.round(comision).toLocaleString('en-US')} (${(comRates[p]*100).toFixed(0)}%)`, observacion:p==='toptal'?'Toptal: no te cobra comisión directa.':`Neto USD ${Math.round(neto).toLocaleString('en-US')}/mes.`, _insight:insight };
  // donut sólo si hay comisión real y bruto > 0 (si no, no hay dos partes que mostrar)
  if (bruto>0 && comision>0) {
    out._chart = {
      type:'doughnut',
      prefix:'USD ',
      slices:[
        { label:'Neto para vos', value:Math.round(neto) },
        { label:`Comisión ${plataformaNombre[p]}`, value:Math.round(comision) },
      ],
      centerValue:`USD ${Math.round(bruto).toLocaleString('en-US')}`,
      centerLabel:'Facturado',
      ariaLabel:`De USD ${Math.round(bruto).toLocaleString('en-US')} facturados, USD ${Math.round(neto).toLocaleString('en-US')} netos y USD ${Math.round(comision).toLocaleString('en-US')} de comisión.`,
    };
  }
  return out;
}
