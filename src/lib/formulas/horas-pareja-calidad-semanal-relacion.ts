export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function horasParejaCalidadSemanalRelacion(i: Inputs): Outputs {
  const n=Number(i.hijosNum)||0; const o=String(i.ocup||'med');
  // Gottman base: 5h/sem para parejas sin hijos (conexión intencional)
  // Más hijos = más esfuerzo intencional necesario para mantener el vínculo
  // Ocupación alta = más planificación explícita
  const base=5;
  const ajusteHijos=Math.min(n,4)*0.75; // +0.75h por hijo, tope en 4 hijos
  const ajusteOcup=o==='alta'?1:o==='baja'?-0.5:0;
  const sem=Math.max(4,Math.round((base+ajusteHijos+ajusteOcup)*2)/2);
  const minDia=Math.round(sem*60/7);
  const _insight={
    title:'Tu tiempo de calidad en pareja',
    text:`Con ${n} ${n===1?'hijo':'hijos'} y carga laboral ${o==='alta'?'alta':o==='baja'?'baja':'media'}, apuntá a **${sem.toFixed(1)} h/semana** de tiempo juntos sin distracciones: unos **${minDia} min por día**.`,
    tone: sem<=5 ? 'warn' : 'neutral',
    icon:'❤️',
  };
  return { semanal:`${sem.toFixed(1)}h`, diario:`${minDia} min`, cita:sem>=7?'2/mes':'1-2/mes', resumen:`Pareja con ${n} hijos: ${sem.toFixed(1)}h/semana, ${minDia}min/día.`, _insight };
}
