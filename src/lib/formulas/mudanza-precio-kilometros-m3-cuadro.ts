export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function mudanzaPrecioKilometrosM3Cuadro(i: Inputs): Outputs {
  const k=Number(i.kilometros)||0; const m=Number(i.m3Carga)||0; const p=String(i.piso||'planta_baja');
  const base=350000; const porKm=2500; const porM3=20000;
  const multPiso={'planta_baja':1,'1_2':1.05,'3_5':1.12,'6_mas':1.2}[p];
  const subtotal=base+k*porKm+m*porM3;
  const recargoPiso=subtotal*(multPiso-1);
  const tot=subtotal*multPiso;
  const fmt=(n:number)=>`$${Math.round(n).toLocaleString('es-AR')}`;
  const slices=[
    {label:'Base',value:Math.round(base)},
    {label:'Kilómetros',value:Math.round(k*porKm)},
    {label:'Volumen (m³)',value:Math.round(m*porM3)},
  ];
  if(recargoPiso>0) slices.push({label:'Recargo piso',value:Math.round(recargoPiso)});
  const chart={
    type:'doughnut' as const,
    slices,
    prefix:'$',
    centerValue:fmt(tot),
    centerLabel:'Total',
    ariaLabel:'Desglose del costo de la mudanza: base, kilómetros, volumen y recargo por piso',
  };
  const pisoPct=((multPiso-1)*100).toFixed(0);
  const insight={
    title:'Costo estimado de la mudanza',
    text:`Mover **${m} m³** a **${k} km** ronda los **${fmt(tot)}**. Los kilómetros aportan **${fmt(k*porKm)}** y el volumen **${fmt(m*porM3)}**${multPiso>1?`; subir a piso suma un **${pisoPct}%** (**${fmt(recargoPiso)}**)`:''}. Cotizá siempre con seguro incluido y compará 3 presupuestos.`,
    tone:'neutral' as const,
    icon:'🚚',
  };
  return { costoEstimado:`$${Math.round(tot).toLocaleString('es-AR')}`, desglose:`Base $${base.toLocaleString('es-AR')} + ${k} km × $${porKm.toLocaleString('es-AR')} + ${m} m³ × $${porM3.toLocaleString('es-AR')} ${p!=='planta_baja'?`+ recargo piso ${((multPiso-1)*100).toFixed(0)}%`:''}`, consejos:'Pedí 3 presupuestos. Cotizá con seguro incluido.', _chart:chart, _insight:insight };
}
