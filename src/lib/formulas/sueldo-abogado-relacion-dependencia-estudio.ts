export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function sueldoAbogadoRelacionDependenciaEstudio(i: Inputs): Outputs {
  const emp=String(i.empleador||'estudio-m'); const ant=Number(i.antiguedad)||0;
  const bases: Record<string,[number,number]> = {
    'estudio-s': [800000, 1500000],
    'estudio-m': [1200000, 2500000],
    'estudio-g': [2000000, 5000000],
    'empresa': [1500000, 3500000],
    'publico': [1400000, 2800000]
  };
  const labels: Record<string,string> = {
    'estudio-s':'estudio chico','estudio-m':'estudio mediano','estudio-g':'estudio grande',
    'empresa':'empresa (in-house)','publico':'sector público',
  };
  const [min,max]=bases[emp]||bases['estudio-m'];
  const factor=Math.min(1, 0.5+ant*0.06);
  const prom=min+(max-min)*factor;
  const fmt=(n:number)=>'$'+n.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.');
  const empLabel=labels[emp]||emp;
  // Posición dentro de la banda (0–100%): bajo si <33, medio 33–66, alto si >66
  const posPct=max>min?((prom-min)/(max-min))*100:50;
  const zona=posPct<40?'la parte baja':posPct>75?'el techo':'la zona media';
  const insight={
    title:'Dónde caés dentro de la banda salarial',
    text:`Con **${ant} ${ant===1?'año':'años'}** de antigüedad en ${empLabel}, tu sueldo estimado es **${fmt(prom)}**, ubicándote en **${zona}** del rango ${fmt(min)}–${fmt(max)}. La antigüedad es el principal driver: cada año extra te acerca al techo de la banda.`,
    tone: posPct>75?'good':'neutral',
    icon:'⚖️',
  };
  const chart={
    type:'scale',
    marker:Math.round(prom),
    markerLabel:fmt(prom),
    min:Math.round(min),
    segments:[
      { nombre:'Inicial', max:Math.round(min+(max-min)*0.33), color:'#fca5a5', colorDark:'#b91c1c' },
      { nombre:'Intermedio', max:Math.round(min+(max-min)*0.66), color:'#fde68a', colorDark:'#a16207' },
      { nombre:'Senior', max:Math.round(max*1.05), color:'#86efac', colorDark:'#15803d' },
    ],
    ariaLabel:`Posición del sueldo estimado de ${fmt(prom)} dentro de la banda salarial de ${empLabel}`,
  };
  return { rango:`$${min.toLocaleString('es-AR')} - $${max.toLocaleString('es-AR')}`, promedio:fmt(prom), resumen:`${emp} con ${ant} años: ~$${prom.toFixed(0)}.`, _insight:insight, _chart:chart };
}
