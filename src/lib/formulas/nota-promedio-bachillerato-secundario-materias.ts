export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function notaPromedioBachilleratoSecundarioMaterias(i: Inputs): Outputs {
  const t=String(i.notasTexto||'').split(',').map(x=>Number(x.trim())).filter(n=>!isNaN(n));
  if(t.length===0) return { promedio:'—', clasificacion:'—', materiasAprobadas:'—' };
  const prom=t.reduce((a,b)=>a+b,0)/t.length;
  const aprob=t.filter(n=>n>=4).length;
  let clas='';
  if(prom>=9) clas='Excelente';
  else if(prom>=7) clas='Muy bueno';
  else if(prom>=6) clas='Bueno';
  else if(prom>=4) clas='Aprobado';
  else clas='Desaprobado';

  const promOut = prom.toFixed(2);
  const desaprobadas = t.length - aprob;
  let tone: 'good' | 'warn' | 'neutral';
  let icon: string;
  if (prom >= 7) { tone = 'good'; icon = '🌟'; }
  else if (prom >= 4) { tone = 'neutral'; icon = '📚'; }
  else { tone = 'warn'; icon = '⚠️'; }
  const colita = desaprobadas > 0
    ? ` Tenés **${desaprobadas}** materia${desaprobadas === 1 ? '' : 's'} por debajo de 4 que arrastra${desaprobadas === 1 ? '' : 'n'} el promedio: levantarla${desaprobadas === 1 ? '' : 's'} es lo que más mueve la aguja.`
    : ` Aprobaste las **${t.length}** materias, sin previas que arrastren.`;
  const _insight = {
    title: 'Tu promedio general',
    text: `Promediando **${t.length}** materia${t.length === 1 ? '' : 's'} te da **${promOut}**, un boletín **${clas.toLowerCase()}**.${colita}`,
    tone,
    icon,
  };

  const topMax = prom >= 10 ? 10.5 : 10;
  const _chart = {
    type: 'scale',
    marker: Number(promOut),
    markerLabel: `Promedio ${promOut}`,
    min: 0,
    segments: [
      { nombre: 'Desaprobado', max: 4, color: '#ef4444', colorDark: '#dc2626' },
      { nombre: 'Aprobado', max: 6, color: '#f97316', colorDark: '#ea580c' },
      { nombre: 'Bueno', max: 7, color: '#eab308', colorDark: '#ca8a04' },
      { nombre: 'Muy bueno', max: 9, color: '#84cc16', colorDark: '#65a30d' },
      { nombre: 'Excelente', max: topMax, color: '#22c55e', colorDark: '#16a34a' },
    ],
    ariaLabel: `El promedio general ${promOut} sobre una escala de 0 a 10, con zonas de desaprobado a excelente`,
  };

  return { promedio:promOut, clasificacion:clas, materiasAprobadas:`${aprob}/${t.length}`, _insight, _chart };
}
