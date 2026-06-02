export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function porcentajeGrasaCorporalFormulaNavy(i: Inputs): Outputs {
  const s=String(i.sexo||'m'); const h=Number(i.alturaCm)||0; const ci=Number(i.cinturaCm)||0; const cu=Number(i.cuelloCm)||0; const ca=Number(i.caderaCm)||0;
  if (h <= 0) throw new Error('Ingresá una altura válida');
  if (cu <= 0) throw new Error('Ingresá un cuello válido');
  if (ci <= 0) throw new Error('Ingresá una cintura válida');
  if (s === 'm' && ci <= cu) throw new Error('La cintura debe ser mayor al cuello');
  if (s !== 'm' && (ci + ca) <= cu) throw new Error('La suma de cintura + cadera debe ser mayor al cuello');
  let g=0;
  if (s==='m') g=86.010*Math.log10(ci-cu)-70.041*Math.log10(h)+36.76;
  else g=163.205*Math.log10(ci+ca-cu)-97.684*Math.log10(h)-78.387;
  let cat='—';
  if (s==='m') { if (g<6) cat='Esencial'; else if (g<14) cat='Atlético'; else if (g<18) cat='Fitness'; else if (g<25) cat='Normal'; else cat='Alto'; }
  else { if (g<14) cat='Esencial'; else if (g<21) cat='Atlético'; else if (g<25) cat='Fitness'; else if (g<32) cat='Normal'; else cat='Alto'; }
  const gFix = Number(g.toFixed(1));
  const tone = (cat==='Esencial'||cat==='Alto') ? 'warn' : (cat==='Atlético'||cat==='Fitness') ? 'good' : 'neutral';
  const insightTexto = (cat==='Atlético'||cat==='Fitness')
    ? `Con **${gFix}%** estás en zona **${cat}**, un rango saludable y deportivo para ${s==='m'?'un hombre':'una mujer'}.`
    : cat==='Normal'
      ? `Tu **${gFix}%** cae en la zona **Normal**: dentro de lo aceptable, con margen para mejorar si buscás definición.`
      : cat==='Alto'
        ? `Tu **${gFix}%** está en la zona **Alta**: conviene apuntar a bajar el porcentaje con dieta y entrenamiento.`
        : `Tu **${gFix}%** está en grasa **Esencial**: por debajo de este nivel hay riesgo para la salud, no conviene reducir más.`;
  const _insight = { title: `Grasa corporal: ${cat}`, text: insightTexto, tone, icon: '🏋️' };
  const segments = s==='m'
    ? [
        { nombre:'Esencial', max:6, color:'#f59e0b', colorDark:'#d97706' },
        { nombre:'Atlético', max:14, color:'#22c55e', colorDark:'#16a34a' },
        { nombre:'Fitness', max:18, color:'#10b981', colorDark:'#059669' },
        { nombre:'Normal', max:25, color:'#eab308', colorDark:'#ca8a04' },
        { nombre:'Alto', max:Math.max(40, Math.ceil(gFix)+5), color:'#ef4444', colorDark:'#dc2626' },
      ]
    : [
        { nombre:'Esencial', max:14, color:'#f59e0b', colorDark:'#d97706' },
        { nombre:'Atlético', max:21, color:'#22c55e', colorDark:'#16a34a' },
        { nombre:'Fitness', max:25, color:'#10b981', colorDark:'#059669' },
        { nombre:'Normal', max:32, color:'#eab308', colorDark:'#ca8a04' },
        { nombre:'Alto', max:Math.max(45, Math.ceil(gFix)+5), color:'#ef4444', colorDark:'#dc2626' },
      ];
  const _chart = { type:'scale', marker:gFix, markerLabel:`${gFix}%`, min:0, segments, ariaLabel:`Porcentaje de grasa corporal ${gFix}%, categoría ${cat}` };
  return { grasa:g.toFixed(1)+'%', categoria:cat, resumen:`${s==='m'?'Hombre':'Mujer'} ${h}cm: ${g.toFixed(1)}% grasa (${cat}).`, _insight, _chart };
}
