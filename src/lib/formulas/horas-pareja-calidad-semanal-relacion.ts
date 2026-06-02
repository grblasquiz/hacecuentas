export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function horasParejaCalidadSemanalRelacion(i: Inputs): Outputs {
  const n=Number(i.hijosNum)||0; const o=String(i.ocup||'med');
  const base=6; const extra=n*0.5+(o==='alta'?1:o==='med'?0:-1);
  const sem=Math.max(3,base-extra);
  const minDia=(sem*60/7).toFixed(0);
  const _insight={
    title:'Tu tiempo de calidad en pareja',
    text:`Con ${n} ${n===1?'hijo':'hijos'} y carga laboral ${o==='alta'?'alta':o==='baja'?'baja':'media'}, apuntá a **${sem.toFixed(1)} h/semana** de tiempo juntos sin distracciones: unos **${minDia} min por día**.`,
    tone: sem<=3 ? 'warn' : 'neutral',
    icon:'❤️',
  };
  return { semanal:`${sem.toFixed(1)}h`, diario:`${minDia} min`, cita:'1-2/mes', resumen:`Pareja con ${n} hijos: ${sem.toFixed(1)}h/semana, ${minDia}min/día.`, _insight };
}
