export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: any; }

// Pomodoros posibles = Minutos disponibles ÷ Minutos por ciclo
// Ciclo estándar (Cirillo) = 30 min (25 trabajo + 5 descanso corto).
export function pomodoroSesionesDiaProductividadHoras(i: Inputs): Outputs {
  const disponibles = Number(i.v1) || 0;        // minutos disponibles
  const porCiclo = Number(i.v2) > 0 ? Number(i.v2) : 30; // minutos por ciclo

  const pomodorosExactos = disponibles / porCiclo;
  const pomodorosEnteros = Math.floor(pomodorosExactos);
  const sobranteMin = Math.round(disponibles - pomodorosEnteros * porCiclo);

  // Trabajo real: 25 de cada 30 min de ciclo estándar => 5/6 del ciclo es trabajo,
  // pero para ciclos personalizados asumimos el ratio 25/30 sólo si el ciclo es 30.
  // Estimación general: trabajo ≈ pomodoros enteros × (porCiclo − descanso).
  // Descanso corto estándar = 5 min por cada 30; para otros ciclos usamos ~1/6 del ciclo.
  const descansoPorCiclo = porCiclo === 30 ? 5 : Math.round(porCiclo / 6);
  const trabajoPorCiclo = porCiclo - descansoPorCiclo;
  const trabajoRealMin = pomodorosEnteros * trabajoPorCiclo;
  const descansoTotalMin = pomodorosEnteros * descansoPorCiclo;

  const exactoFmt = pomodorosExactos.toLocaleString('es-AR', { maximumFractionDigits: 2 });
  const hhmm = (m: number) => {
    const h = Math.floor(m / 60);
    const min = m % 60;
    if (h === 0) return `${min} min`;
    if (min === 0) return `${h} h`;
    return `${h} h ${min} min`;
  };

  const resumen =
    `${disponibles} min disponibles ÷ ${porCiclo} min por ciclo = ${exactoFmt} pomodoros ` +
    `(${pomodorosEnteros} completos${sobranteMin > 0 ? `, sobran ${sobranteMin} min` : ''}). ` +
    `Equivale a ${hhmm(trabajoRealMin)} de trabajo real y ${hhmm(descansoTotalMin)} de descansos cortos.`;

  return {
    resultado: pomodorosEnteros,
    resumen,
    _insight: {
      title: `${pomodorosEnteros} pomodoros completos`,
      text:
        `Con **${disponibles} min** disponibles y ciclos de **${porCiclo} min** entran **${pomodorosEnteros} pomodoros** ` +
        `(${exactoFmt} exactos). Eso son **${hhmm(trabajoRealMin)}** de trabajo enfocado` +
        `${sobranteMin > 0 ? ` y te sobran ${sobranteMin} min, insuficientes para otro ciclo` : ''}.`,
      tone: pomodorosEnteros >= 8 && pomodorosEnteros <= 12 ? 'positive' : 'neutral',
      icon: '🍅',
    },
    _chart: {
      type: 'scale',
      marker: pomodorosEnteros,
      markerLabel: `${pomodorosEnteros} pomodoros`,
      min: 0,
      segments: [
        { nombre: 'Jornada corta', max: 6, color: '#94a3b8', colorDark: '#cbd5e1' },
        { nombre: 'Zona saludable (8-12)', max: 12, color: '#16a34a', colorDark: '#22c55e' },
        { nombre: 'Riesgo de fatiga', max: 16, color: '#f59e0b', colorDark: '#fbbf24' },
      ],
      ariaLabel: `${pomodorosEnteros} pomodoros posibles en el día`,
    },
  };
}
