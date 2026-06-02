export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function calefactorTiroBalanceadoKcalM2Invierno(i: Inputs): Outputs {
  const m=Number(i.m2)||0; const h=Number(i.alturaTecho)||2.5; const a=String(i.aislacion||'regular');
  const factor={'buena':40,'regular':50,'mala':60}[a] || 50;
  const kcal=m*h*factor;
  const modelos=[2500,3000,4000,5500,7500]; const sug=modelos.find(x=>x>=kcal)||7500;
  const kcalR = Math.round(kcal);
  const supera = kcal > 7500;
  return {
    kcalHora:`${kcalR.toLocaleString('es-AR')} kcal/h`,
    modeloSugerido:`${sug} kcal/h (tiro balanceado)`,
    observacion:a==='mala'?'Mala aislación: considerá aislar techo/ventanas':'Dimensionado correcto',
    _insight: {
      title: supera ? 'Ambiente grande' : 'Modelo sugerido',
      text: supera
        ? `Necesitás **${kcalR.toLocaleString('es-AR')} kcal/h** para ${m} m²: supera el tiro balanceado más grande (7500 kcal/h), conviene **dividir en dos equipos** o sumar otra fuente de calor.`
        : `Para ${m} m² con aislación ${a} pedís **${kcalR.toLocaleString('es-AR')} kcal/h**: el tiro balanceado de **${sug} kcal/h** es el modelo justo${a==='mala'?'. Aislar techo y ventanas bajaría bastante el requerimiento':''}.`,
      tone: a==='mala' || supera ? 'warn' : 'good',
      icon: '🔥',
    },
    _chart: {
      type: 'scale',
      marker: kcalR,
      markerLabel: `${kcalR.toLocaleString('es-AR')} kcal/h`,
      min: 0,
      segments: [
        { nombre: '2500', max: 2500, color: '#bae6fd', colorDark: '#38bdf8' },
        { nombre: '3000', max: 3000, color: '#a7f3d0', colorDark: '#10b981' },
        { nombre: '4000', max: 4000, color: '#86efac', colorDark: '#22c55e' },
        { nombre: '5500', max: 5500, color: '#fde68a', colorDark: '#f59e0b' },
        { nombre: '7500+', max: Math.max(9000, kcalR + 500), color: '#fdba74', colorDark: '#ea580c' },
      ],
      ariaLabel: `Requerimiento de ${kcalR.toLocaleString('es-AR')} kcal por hora ubicado en la escala de modelos de calefactor de tiro balanceado.`,
    },
  };
}
