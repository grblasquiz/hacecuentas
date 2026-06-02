/** YT ingresos por pais */
export interface YoutubeIngresosVistasPaisInputs { vistasMensuales: number; pctTier1: number; pctTier2: number; pctTier3: number; }
export interface YoutubeIngresosVistasPaisOutputs { cpmPonderado: number; rpmPonderado: number; ingresoMensual: number; ingresoAnual: number; _insight?: any; _chart?: any; }
export function youtubeIngresosVistasPais(i: YoutubeIngresosVistasPaisInputs): YoutubeIngresosVistasPaisOutputs {
  const v=Number(i.vistasMensuales), t1=Number(i.pctTier1), t2=Number(i.pctTier2), t3=Number(i.pctTier3);
  if (!v || v<=0) throw new Error('Vistas invalidas');
  if (Math.abs(t1+t2+t3-100) > 0.5) throw new Error('Los porcentajes deben sumar 100');
  const cpm=(t1*12+t2*5+t3*1.5)/100, rpm=cpm*0.55, m=(v/1000)*rpm;
  // Aporte de cada tier al ingreso mensual (suman m exactamente)
  const k=(v/1000)*0.55/100;
  const apT1=k*t1*12, apT2=k*t2*5, apT3=k*t3*1.5;
  const _insight = {
    title: 'De dónde sale tu ingreso',
    text: `Tu mezcla de audiencia (**${t1}%** Tier 1, **${t2}%** Tier 2, **${t3}%** Tier 3) da un CPM ponderado de **USD ${cpm.toFixed(2)}** y un RPM de **USD ${rpm.toFixed(2)}**. Con **${v.toLocaleString('es-AR')}** vistas/mes son **USD ${m.toFixed(2)}/mes** (**USD ${(m*12).toFixed(2)}/año**). El Tier 1 paga ~8x más que el Tier 3: subir su peso mueve mucho la aguja.`,
    tone: 'neutral' as const,
    icon: '🌎',
  };
  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Tier 1 (USA/UK/CA…)', value: +apT1.toFixed(2) },
      { label: 'Tier 2 (Europa/LatAm rico)', value: +apT2.toFixed(2) },
      { label: 'Tier 3 (resto)', value: +apT3.toFixed(2) },
    ],
    prefix: 'USD ',
    centerValue: `USD ${m.toFixed(2)}`,
    centerLabel: 'Ingreso/mes',
    ariaLabel: `Ingreso mensual de USD ${m.toFixed(2)} desglosado por aporte de cada tier de países`,
  };
  return { cpmPonderado:+cpm.toFixed(2), rpmPonderado:+rpm.toFixed(2), ingresoMensual:+m.toFixed(2), ingresoAnual:+(m*12).toFixed(2), _insight, _chart };
}
