export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }

const CICLO_MIN = 90;

function fmt(totalMin: number): string {
  const t = ((Math.round(totalMin) % 1440) + 1440) % 1440;
  const h = Math.floor(t / 60);
  const m = t % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * ¿A qué hora acostarme? — dado el horario al que te tenés que despertar,
 * calcula a qué hora conviene acostarte, restando ciclos completos de 90 min
 * más la latencia para quedarte dormido (~15 min).
 */
export function aQueHoraAcostarme(i: Inputs): Outputs {
  const hora = String(i.horaDespertar || '').trim();
  const m = hora.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) throw new Error('Ingresá la hora en formato HH:MM (ej: 07:00).');
  const hh = Number(m[1]);
  const mm = Number(m[2]);
  if (hh > 23 || mm > 59) throw new Error('Hora inválida. Usá formato 24h, ej: 07:00.');

  let dormirse = Number(i.minutosDormirse);
  if (isNaN(dormirse) || dormirse < 0) dormirse = 15;
  if (dormirse > 90) dormirse = 90;

  const despertar = hh * 60 + mm;
  const bed = (c: number) => fmt(despertar - c * CICLO_MIN - dormirse);

  return {
    acostarse6: bed(6),
    acostarse5: bed(5),
    acostarse4: bed(4),
    resumen: `Para despertarte a las ${fmt(despertar)} descansado, acostate a las ${bed(6)} (9 h) o ${bed(5)} (7½ h). Se suman ${dormirse} min para quedarte dormido.`,
  };
}

export const compute = aQueHoraAcostarme;
export default aQueHoraAcostarme;
