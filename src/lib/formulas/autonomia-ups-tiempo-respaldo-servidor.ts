export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function autonomiaUpsTiempoRespaldoServidor(i: Inputs): Outputs {
  const va=Number(i.va)||0; const w=Number(i.w)||0;
  if (w===0) return { minutos:'—', utilizacion:'—', resumen:'Carga no puede ser 0.' };
  const wMax=va*0.6;
  const ut=w/wMax*100;
  const min=(va*0.4)/w;

  const sobrecarga = ut > 100;
  const tone = sobrecarga ? 'warn' : (ut > 80 ? 'warn' : 'good');
  const text = sobrecarga
    ? `Con **${w} W** superás la potencia útil del UPS de ${va} VA (~${wMax.toFixed(0)} W): está **sobrecargado al ${ut.toFixed(0)}%** y puede apagarse de golpe. Bajá la carga o pasá a un equipo más grande.`
    : (ut > 80
      ? `Estás usando el **${ut.toFixed(0)}%** de la capacidad del UPS: el respaldo de **~${min.toFixed(0)} min** alcanza apenas para un apagado ordenado. Con tan poco margen, cualquier consumo extra lo deja corto.`
      : `Con **${w} W** sobre un UPS de ${va} VA usás el **${ut.toFixed(0)}%** de su capacidad y obtenés **~${min.toFixed(0)} min** de respaldo. Margen cómodo para guardar y apagar sin apuro.`);
  const _insight = {
    title: 'Respaldo estimado',
    text,
    tone,
    icon: '🔋',
  };

  const _chart = {
    type: 'scale',
    marker: Math.round(ut),
    markerLabel: `${ut.toFixed(0)}% de uso`,
    min: 0,
    segments: [
      { nombre: 'Holgado', max: 50, color: '#16a34a', colorDark: '#22c55e' },
      { nombre: 'Recomendado', max: 80, color: '#65a30d', colorDark: '#84cc16' },
      { nombre: 'Al límite', max: 100, color: '#f59e0b', colorDark: '#fbbf24' },
      { nombre: 'Sobrecarga', max: Math.max(130, Math.ceil(ut) + 5), color: '#dc2626', colorDark: '#f87171' },
    ],
    ariaLabel: `Nivel de uso del UPS: ${ut.toFixed(0)}% de su capacidad útil`,
  };

  return { minutos:`${min.toFixed(1)} min`, utilizacion:`${ut.toFixed(0)}%`, resumen:`UPS ${va}VA con ${w}W: ~${min.toFixed(0)} min (${ut.toFixed(0)}% uso).`, _insight, _chart };
}
