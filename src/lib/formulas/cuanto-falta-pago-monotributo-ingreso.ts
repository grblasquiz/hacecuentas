export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function cuantoFaltaPagoMonotributoIngreso(i: Inputs): Outputs {
  const f=String(i.fecha1||'');
  if (!f) {
    const hoy=new Date();
    return { resultado:hoy.toISOString().slice(0,10), resumen:'Ingresá una fecha.' };
  }
  const parts=f.split('-').map(Number);
  if (parts.length!==3 || parts.some(isNaN)) return { resultado:'—', resumen:'Fecha inválida.' };
  const [yy,mm,dd]=parts;
  const d=new Date(yy,mm-1,dd);
  if (isNaN(d.getTime())) return { resultado:'—', resumen:'Fecha inválida.' };
  const hoy=new Date();
  hoy.setHours(0,0,0,0);
  const diff=Math.round((d.getTime()-hoy.getTime())/86400000);

  let _insight;
  let _chart;
  if (diff>7) {
    _insight = { title:'Con margen de sobra', text:`Te quedan **${diff} días** para pagar el monotributo. Vencimiento general el día **20 de cada mes**: agendalo para no comerte el recargo por mora.`, tone:'good', icon:'🗓️' };
  } else if (diff>=1) {
    _insight = { title:'Se viene el vencimiento', text:`Quedan solo **${diff} día${diff===1?'':'s'}** para el pago. Pagá ya por débito o VEP para evitar que AFIP te excluya o te aplique intereses.`, tone:'warn', icon:'⏰' };
  } else if (diff===0) {
    _insight = { title:'Vence hoy', text:'El monotributo **vence hoy**: pagalo antes de la medianoche para no entrar en mora.', tone:'warn', icon:'🚨' };
  } else {
    _insight = { title:'Pago vencido', text:`El vencimiento fue hace **${Math.abs(diff)} días**. Regularizá cuanto antes: la deuda acumula intereses y arriesgás la baja del monotributo.`, tone:'warn', icon:'❌' };
  }

  // Gauge de urgencia: cuántos días faltan dentro del ciclo mensual de pago
  if (diff>=0) {
    _chart = {
      type:'scale',
      marker: Math.min(diff, 31),
      markerLabel: `${diff} días`,
      min: 0,
      segments: [
        { nombre:'Urgente', max:3, color:'#ef4444', colorDark:'#f87171' },
        { nombre:'Atención', max:7, color:'#f59e0b', colorDark:'#fbbf24' },
        { nombre:'Con margen', max:31, color:'#22c55e', colorDark:'#4ade80' }
      ],
      ariaLabel:`Faltan ${diff} días para el vencimiento del monotributo`
    };
  }

  return { resultado:diff+' días', resumen:`Entre hoy y ${f}: ${diff} días.`, _insight, ...(_chart?{_chart}:{}) };
}
