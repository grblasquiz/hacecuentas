export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function cuantoFaltaVencTarjetaCreditoMes(i: Inputs): Outputs {
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
    _insight = { title:'Con tiempo para pagar', text:`Faltan **${diff} días** para el vencimiento del resumen. Pagá el **total** antes de la fecha para no generar intereses de financiación.`, tone:'good', icon:'💳' };
  } else if (diff>=1) {
    _insight = { title:'Se acerca el vencimiento', text:`Quedan **${diff} día${diff===1?'':'s'}**. Si pagás solo el mínimo, el saldo financiado arrastra intereses altísimos: tratá de cubrir el total.`, tone:'warn', icon:'⏰' };
  } else if (diff===0) {
    _insight = { title:'Vence hoy', text:'El resumen **vence hoy**. Pagá antes del cierre para evitar punitorios e intereses de mora sobre el saldo.', tone:'warn', icon:'🚨' };
  } else {
    _insight = { title:'Pago atrasado', text:`El vencimiento fue hace **${Math.abs(diff)} días**. La mora suma intereses punitorios y puede afectar tu historial crediticio: regularizalo ya.`, tone:'warn', icon:'❌' };
  }

  // Gauge de urgencia dentro del ciclo de pago de la tarjeta
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
      ariaLabel:`Faltan ${diff} días para el vencimiento de la tarjeta`
    };
  }

  return { resultado:diff+' días', resumen:`Entre hoy y ${f}: ${diff} días.`, _insight, ...(_chart?{_chart}:{}) };
}
