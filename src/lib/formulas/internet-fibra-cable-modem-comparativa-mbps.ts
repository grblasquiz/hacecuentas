export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function internetFibraCableModemComparativaMbps(i: Inputs): Outputs {
  const m=Number(i.mbps)||100; const h=Number(i.hogarHabitantes)||1; const g=String(i.gamingStreaming||'no');
  const minimo=h*50+(g==='si'?100:0);
  const cubre=m>=minimo;
  const rec=cubre?'Fibra óptica (mejor upload y latencia)':'Necesitás más Mbps: considerá 500-1000';
  const gamingTxt=g==='si'?' (incluye +100 Mbps por gaming/streaming pesado)':'';
  return {
    recomendacion:rec,
    mbpsMinimos:`${minimo} Mbps`,
    observacion:'Fibra: misma velocidad descarga/subida. Cablemodem: subida ~10% descarga.',
    _insight: {
      title: cubre ? 'Tu plan rinde' : 'Tu plan queda corto',
      text: cubre
        ? `Para **${h}** ${h===1?'persona':'personas'} se recomiendan ~**${minimo} Mbps**${gamingTxt} y vos contratás **${m} Mbps**: vas holgado. Priorizá **fibra óptica** por su mejor subida y latencia.`
        : `Para **${h}** ${h===1?'persona':'personas'} hacen falta ~**${minimo} Mbps**${gamingTxt}, pero contratás **${m} Mbps**: te quedás corto. Considerá subir a **500–1000 Mbps**, idealmente por fibra.`,
      tone: cubre ? 'good' : 'warn',
      icon: '🌐',
    },
    _chart: {
      type: 'scale',
      marker: m,
      markerLabel: `Contratás ${m} Mbps`,
      min: 0,
      segments: [
        { nombre: 'Insuficiente', max: minimo, color: '#fca5a5', colorDark: '#ef4444' },
        { nombre: 'Justo', max: minimo * 1.5, color: '#fde68a', colorDark: '#f59e0b' },
        { nombre: 'Holgado', max: Math.max(minimo * 2.5, m * 1.1), color: '#86efac', colorDark: '#22c55e' },
      ],
      ariaLabel: `Velocidad contratada de ${m} Mbps frente al mínimo recomendado de ${minimo} Mbps`,
    },
  };
}
