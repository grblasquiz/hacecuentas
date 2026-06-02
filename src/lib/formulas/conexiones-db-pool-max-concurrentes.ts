export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function conexionesDbPoolMaxConcurrentes(i: Inputs): Outputs {
  const c=Number(i.cores)||1; const carga=String(i.carga||'med');
  const mult:Record<string,number>={baja:1,med:2,alta:3};
  const mx=c*(mult[carga]||2);
  const mn=Math.max(2,Math.floor(mx/4));
  const cargaTxt:Record<string,string>={baja:'baja',med:'media',alta:'alta'};
  const _insight = {
    title: 'Tu pool de conexiones',
    text: mx > 200
      ? `Con **${c} cores** y carga **${cargaTxt[carga]||carga}** el máximo sugerido es **${mx}**, que supera las **200** conexiones: poné **PgBouncer** delante para multiplexar y no agotar la DB.`
      : `Con **${c} cores** y carga **${cargaTxt[carga]||carga}** te alcanza un pool de **${mn} a ${mx}** conexiones. Empezá por el mínimo y subí solo si ves esperas por conexión.`,
    tone: mx > 200 ? 'warn' : 'good',
    icon: mx > 200 ? '⚠️' : '🗄️'
  };
  const _chart = {
    type: 'scale',
    marker: mx,
    markerLabel: `máx ${mx}`,
    min: 0,
    segments: [
      { nombre: 'Holgado', max: 100, color: '#16a34a', colorDark: '#22c55e' },
      { nombre: 'Vigilar', max: 200, color: '#f59e0b', colorDark: '#fbbf24' },
      { nombre: 'PgBouncer', max: Math.max(300, mx + 20), color: '#dc2626', colorDark: '#ef4444' }
    ],
    ariaLabel: `Pool máximo de ${mx} conexiones; arriba de 200 conviene PgBouncer`
  };
  return { min:mn.toString(), max:mx.toString(), consejo:'Usar PgBouncer si excede 200', resumen:`DB ${c} cores, carga ${carga}: pool ${mn}-${mx}.`, _insight, _chart };
}
