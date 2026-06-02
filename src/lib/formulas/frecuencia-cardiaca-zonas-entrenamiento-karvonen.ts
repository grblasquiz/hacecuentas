export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: any; }
export function frecuenciaCardiacaZonasEntrenamientoKarvonen(i: Inputs): Outputs {
  const e=Number(i.edad)||30; const r=Number(i.fcReposo)||60;
  const fcMax=220-e;
  const delta=fcMax-r;
  const z=[0.5,0.6,0.7,0.8,0.9,1.0].map(p=>Math.round(r+delta*p));
  const objetivoAerobico=Math.round(r+delta*0.75); // 75% reserva: centro de la zona aeróbica (Z3)
  return {
    fcMax:fcMax+' bpm', z1:z[0]+'-'+z[1]+' bpm', z2:z[1]+'-'+z[2]+' bpm', z3:z[2]+'-'+z[3]+' bpm', z4:z[3]+'-'+z[4]+' bpm', z5:z[4]+'-'+z[5]+' bpm', resumen:`Edad ${e}, FCR ${r}: FCmax ${fcMax}, zonas calculadas Karvonen.`,
    _insight: {
      title: 'Tus zonas Karvonen',
      text: `Con FCmax **${fcMax} bpm** y FC reposo ${r} bpm, tu reserva cardíaca es de ${delta} latidos. El grueso del entrenamiento aeróbico va en la zona 2-3 (**${z[1]}-${z[3]} bpm**); reservá las zonas 4-5 (${z[3]}-${z[5]} bpm) para series cortas e intensas.`,
      tone: 'neutral',
      icon: '🏃',
    },
    _chart: {
      type: 'scale',
      marker: objetivoAerobico,
      markerLabel: `Aeróbico ${objetivoAerobico}`,
      min: r,
      segments: [
        { nombre: 'Z1', max: z[1], color: '#22c55e', colorDark: '#4ade80' },
        { nombre: 'Z2', max: z[2], color: '#84cc16', colorDark: '#a3e635' },
        { nombre: 'Z3', max: z[3], color: '#eab308', colorDark: '#facc15' },
        { nombre: 'Z4', max: z[4], color: '#f97316', colorDark: '#fb923c' },
        { nombre: 'Z5 (FCmax)', max: z[5], color: '#ef4444', colorDark: '#f87171' },
      ],
      ariaLabel: `Zonas de entrenamiento Karvonen de ${r} a ${fcMax} bpm; objetivo aeróbico en ${objetivoAerobico} bpm`,
    },
  };
}
