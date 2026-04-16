/** Fecha de boda ideal 2026 */
export interface Inputs { mesPreferido?: string; evitarSupersticiones?: string; }
export interface Outputs { mejoresFechas: string; totalSabados: number; mensaje: string; }

const FERIADOS_2026 = [
  '2026-01-01','2026-02-16','2026-02-17','2026-03-23','2026-03-24',
  '2026-04-02','2026-04-03','2026-05-01','2026-05-25','2026-06-17',
  '2026-06-20','2026-07-09','2026-08-17','2026-10-12','2026-11-20',
  '2026-12-08','2026-12-25'
];

export function fechaBodaIdeal(i: Inputs): Outputs {
  const mesPref = String(i.mesPreferido || 'todos');
  const evitar = String(i.evitarSupersticiones || 'si') === 'si';
  const anio = 2026;
  const sabados: { fecha: Date; score: number; nota: string }[] = [];

  for (let m = 0; m < 12; m++) {
    if (mesPref !== 'todos' && m !== Number(mesPref) - 1) continue;
    for (let d = 1; d <= 31; d++) {
      const f = new Date(anio, m, d);
      if (f.getMonth() !== m) break;
      if (f.getDay() !== 6) continue; // solo sábados

      let score = 70;
      let nota = '';
      const dia = f.getDate();
      const fStr = f.toISOString().slice(0, 10);

      // Supersticiones
      if (evitar && dia === 13) { score -= 30; nota += 'Día 13. '; }
      const martes13check = new Date(anio, m, 13);
      if (evitar && martes13check.getDay() === 2 && Math.abs(dia - 13) <= 1) { score -= 10; nota += 'Cerca de martes 13. '; }

      // Feriados
      const cercaFeriado = FERIADOS_2026.some(fer => {
        const fd = new Date(fer);
        return Math.abs(f.getTime() - fd.getTime()) <= 2 * 86400000;
      });
      if (cercaFeriado) { score -= 20; nota += 'Cerca de feriado. '; }

      // Estación
      if (m >= 9 && m <= 10) { score += 15; nota += 'Primavera. '; }
      else if (m >= 2 && m <= 3) { score += 10; nota += 'Otoño. '; }
      else if (m >= 5 && m <= 7) { score -= 5; nota += 'Invierno. '; }

      sabados.push({ fecha: f, score, nota: nota || 'Sin observaciones.' });
    }
  }

  sabados.sort((a, b) => b.score - a.score);
  const top = sabados.slice(0, 8);
  const mejores = top.map(s =>
    `${s.fecha.toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} (puntaje: ${s.score}) — ${s.nota}`
  ).join('\n');

  const estacion = mesPref !== 'todos'
    ? (Number(mesPref) >= 10 || Number(mesPref) <= 11 ? 'Excelente época — primavera argentina.' : 'Buena elección de mes.')
    : 'Te mostramos las mejores opciones de todo 2026.';

  return { mejoresFechas: mejores, totalSabados: sabados.length, mensaje: estacion };
}
