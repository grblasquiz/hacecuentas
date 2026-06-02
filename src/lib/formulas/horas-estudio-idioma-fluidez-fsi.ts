export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | any; }
export function horasEstudioIdiomaFluidezFsi(i: Inputs): Outputs {
  const id=String(i.idioma||'ingles');
  const h:Record<string,[number,string]>={ingles:[600,'I'],frances:[600,'I'],aleman:[900,'II'],ruso:[1100,'III'],chino:[2200,'IV'],japones:[2200,'IV']};
  const [hr,cat]=h[id]||[600,'I'];
  const mesesNum = hr / 30;
  const tono = cat === 'IV' ? 'warn' : cat === 'I' ? 'good' : 'neutral';
  const insight = {
    title: 'Esfuerzo según el FSI',
    text: `Alcanzar fluidez profesional en **${id}** requiere unas **${hr} horas** de estudio (Categoría **${cat}** del FSI), equivalente a **${mesesNum.toFixed(1)} meses** a 1 h por día. Cuanto más alta la categoría, más se aleja el idioma del español en gramática y escritura.`,
    tone: tono,
    icon: '🗣️',
  };
  const chart = {
    type: 'scale' as const,
    marker: hr,
    markerLabel: `${id}: ${hr}h`,
    min: 0,
    segments: [
      { nombre: 'Cat I', max: 750, color: '#22c55e', colorDark: '#16a34a' },
      { nombre: 'Cat II', max: 1000, color: '#84cc16', colorDark: '#65a30d' },
      { nombre: 'Cat III', max: 1300, color: '#f59e0b', colorDark: '#d97706' },
      { nombre: 'Cat IV', max: 2400, color: '#ef4444', colorDark: '#dc2626' },
    ],
    ariaLabel: 'Escala de dificultad FSI por horas de estudio: el marcador ubica al idioma elegido entre las categorías I a IV',
  };
  return { horas:`${hr}h`, meses:`${mesesNum.toFixed(1)} meses`, categoria:cat, resumen:`${id} cat ${cat}: ${hr}h estudio (${mesesNum.toFixed(0)} meses a 1h/día).`, _insight: insight, _chart: chart };
}
