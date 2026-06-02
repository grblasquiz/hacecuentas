export interface Inputs { [k: string]: number | string; }
export interface Outputs { percentil: string; medianaCm: string; resumen: string; _insight?: any; _chart?: any; }
export function percentilEstaturaPesoBebeOms(i: Inputs): Outputs {
  const m=Number(i.edadMeses)||0; const e=Number(i.estaturaCm)||0; const s=String(i.sexo||'m');
  const medM: Record<number,number> = { 0:50, 3:61, 6:67.5, 9:72, 12:76, 18:82.5, 24:87.5, 36:96 };
  const medF: Record<number,number> = { 0:49.5, 3:59.5, 6:65.5, 9:70, 12:74, 18:80, 24:85, 36:94 };
  const tabla=s==='m'?medM:medF;
  const keys=Object.keys(tabla).map(Number).sort((a,b)=>a-b);
  let closest=keys[0]; for (const k of keys) if (k<=m) closest=k;
  const med=tabla[closest];
  const desv=(e-med)/med*100;
  let p='P50';
  if (desv>8) p='>P97'; else if (desv>3) p='P85-97'; else if (desv<-8) p='<P3'; else if (desv<-3) p='P3-15';
  const fuera = desv>8 || desv<-8;
  const desvR = Math.round(desv*10)/10;
  const _insight = {
    title: 'Estatura del bebé',
    text: `Con **${e} cm** a los **${m} meses**, la estatura está **${desvR>=0?'+':''}${desvR}%** respecto de la mediana OMS (**${med} cm**), lo que corresponde a **${p}**.${fuera ? ' Conviene comentarlo con el pediatra.' : ' Dentro del rango esperado.'}`,
    tone: fuera ? 'warn' : 'good',
    icon: '📏',
  };
  const _chart = {
    type: 'scale' as const,
    marker: desvR,
    markerLabel: 'Desvío vs mediana: ' + (desvR>=0?'+':'') + desvR + '%',
    min: Math.min(-12, Math.floor(desv)-2),
    unit: '%',
    segments: [
      { nombre: 'Baja (<P3)', max: -8, color: '#fecaca', colorDark: '#b91c1c' },
      { nombre: 'P3–P15', max: -3, color: '#fed7aa', colorDark: '#9a3412' },
      { nombre: 'Normal (P15–P85)', max: 3, color: '#bbf7d0', colorDark: '#166534' },
      { nombre: 'P85–P97', max: 8, color: '#fed7aa', colorDark: '#9a3412' },
      { nombre: 'Alta (>P97)', max: Math.max(12, Math.ceil(desv)+2), color: '#fecaca', colorDark: '#b91c1c' },
    ],
    ariaLabel: 'Escala de desvío de estatura respecto de la mediana OMS, con zonas de percentil',
  };
  return { percentil:p, medianaCm:med+' cm', resumen:`${m}m ${s}: ${e}cm (mediana ${med}cm) → ${p}.`, _insight, _chart };
}
