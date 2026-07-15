export interface HorasTrabajadasInputs {
  [key: string]: string | number | undefined;
  jornadaNormal?: number;
  valorHora?: number;
  recargoExtra?: number;
}
export interface HorasTrabajadasOutputs {
  totalHoras: string; horasDecimales: number; horasNormales: number; horasExtra: number;
  sueldoNormal: number; sueldoExtra: number; sueldoTotal: number; tablaSemanal: string;
  _insight?: any;
}
const DIAS = [['lun','Lunes'],['mar','Martes'],['mie','Miércoles'],['jue','Jueves'],['vie','Viernes'],['sab','Sábado'],['dom','Domingo']] as const;
function minutos(value: unknown): number | null {
  const text = String(value || '').trim();
  if (!text) return null;
  const match = /^(\d{1,2}):(\d{2})$/.exec(text);
  if (!match) throw new Error(`Usá HH:MM para los horarios (${text})`);
  const h = Number(match[1]), m = Number(match[2]);
  if (h > 23 || m > 59) throw new Error(`Horario inválido: ${text}`);
  return h * 60 + m;
}
const hhmm = (mins: number) => `${Math.floor(mins / 60)}:${String(Math.round(mins % 60)).padStart(2, '0')}`;
export function horasTrabajadasSemanal(i: HorasTrabajadasInputs): HorasTrabajadasOutputs {
  const filas: string[] = []; let totalMin = 0;
  for (const [id, nombre] of DIAS) {
    const entrada = minutos(i[`${id}Entrada`]); const salida = minutos(i[`${id}Salida`]);
    const descanso = Math.max(0, Number(i[`${id}Descanso`]) || 0);
    if (entrada == null && salida == null) { filas.push(`${nombre}: —`); continue; }
    if (entrada == null || salida == null) throw new Error(`Completá entrada y salida de ${nombre}`);
    let tramo = salida - entrada; if (tramo < 0) tramo += 1440;
    tramo -= descanso; if (tramo < 0) throw new Error(`El descanso de ${nombre} supera el turno`);
    totalMin += tramo; filas.push(`${nombre}: ${hhmm(tramo)} (${(tramo / 60).toFixed(2)} h)`);
  }
  if (!totalMin) throw new Error('Cargá al menos un día trabajado');
  const limite = Math.max(0, Number(i.jornadaNormal) || 40);
  const valor = Math.max(0, Number(i.valorHora) || 0);
  const recargo = Math.max(0, Number(i.recargoExtra) || 50) / 100;
  const decimal = totalMin / 60;
  const normales = Math.min(decimal, limite), extras = Math.max(0, decimal - limite);
  const sueldoNormal = normales * valor, sueldoExtra = extras * valor * (1 + recargo);
  return {
    totalHoras: hhmm(totalMin), horasDecimales: Number(decimal.toFixed(2)),
    horasNormales: Number(normales.toFixed(2)), horasExtra: Number(extras.toFixed(2)),
    sueldoNormal: Number(sueldoNormal.toFixed(2)), sueldoExtra: Number(sueldoExtra.toFixed(2)),
    sueldoTotal: Number((sueldoNormal + sueldoExtra).toFixed(2)), tablaSemanal: filas.join('\n'),
    _insight: { title: `${hhmm(totalMin)} trabajadas esta semana`, text: `El total equivale a **${decimal.toFixed(2)} horas decimales**: **${normales.toFixed(2)} normales** y **${extras.toFixed(2)} extra** sobre un límite configurable de ${limite} h.`, tone: extras ? 'warn' : 'neutral', icon: '⏱️' },
  };
}
