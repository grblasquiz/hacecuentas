export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

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

  // Campo opcional: el form manda '' cuando está vacío, y Number('') === 0,
  // así que un guard que sólo chequea NaN dejaría dormirse=0 (default 15 perdido).
  const rawDormirse = i.minutosDormirse;
  let dormirse =
    rawDormirse === '' || rawDormirse === null || rawDormirse === undefined
      ? 15
      : Number(rawDormirse);
  if (!Number.isFinite(dormirse) || dormirse < 0) dormirse = 15;
  if (dormirse > 90) dormirse = 90;

  const despertar = hh * 60 + mm;
  const bed = (c: number) => fmt(despertar - c * CICLO_MIN - dormirse);

  // Horas de sueño que da cada opción (ciclos × 90 min), sin contar la latencia.
  const horasCiclo = (c: number) => (c * CICLO_MIN) / 60;
  const fmtHoras = (hs: number) => {
    const h = Math.floor(hs);
    const min = Math.round((hs - h) * 60);
    return min === 0 ? `${h}h` : `${h}h${min}`;
  };

  const _insight = {
    title: 'Acostate a esta hora',
    text: `Para despertarte a las **${hora}** descansado, acostate a las **${bed(6)}** (${fmtHoras(horasCiclo(6))} de sueño, 6 ciclos) o a las **${bed(5)}** (${fmtHoras(horasCiclo(5))}, 5 ciclos). Despertarte al final de un ciclo evita la modorra de cortar el sueño profundo. Calculado con **${dormirse} min** para quedarte dormido.`,
    tone: 'good' as const,
    icon: '😴',
  };

  return {
    // El primary muestra solo las dos mejores horas (6 y 5 ciclos), bien grande.
    // El detalle de horas de sueño va en los cards secundarios, sin jerga.
    resumen: `${bed(6)} o ${bed(5)}`,
    acostarse6: bed(6),
    acostarse5: bed(5),
    acostarse4: bed(4),
    _insight,
  };
}

export const compute = aQueHoraAcostarme;
export default aQueHoraAcostarme;
