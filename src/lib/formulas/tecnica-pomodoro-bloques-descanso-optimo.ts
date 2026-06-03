/**
 * Técnica Pomodoro — cuántos bloques y descansos entran en tu tiempo disponible.
 *
 * Dado el tiempo total que tenés, mete tantos Pomodoros como entren respetando la
 * regla clásica: descanso corto entre bloques y descanso largo cada K bloques (en
 * lugar del corto), nunca después del último bloque (la sesión termina ahí).
 * Devuelve cantidad de Pomodoros, descansos cortos/largos, foco real y duración
 * total de la sesión. Bilingüe (es/en) vía i.__lang.
 */

export interface Inputs {
  [k: string]: any;
  __lang?: string;
}

export interface Outputs {
  pomodoros: number;
  tiempoFoco: number;
  tiempoTotal: number;
  descansosCortos: number;
  descansosLargos: number;
  tiempoLibre: number;
  resumen: string;
  _chart?: any;
  _insight?: any;
}

// El form manda '' (no clave ausente) en campos opcionales vacíos, y Number('')=0.
// Por eso tratamos ''/null/undefined/no-positivo como el default. Ver memoria
// "optional-numeric-field-defaults".
function posNum(v: unknown, def: number): number {
  if (v === '' || v === null || v === undefined) return def;
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : def;
}

export function tecnicaPomodoroBloquesDescansoOptimo(i: Inputs): Outputs {
  const en = i.__lang === 'en';

  const disponible = posNum(i.minutos, 0);
  if (disponible <= 0) {
    throw new Error(en ? 'Enter the minutes available for the session.' : 'Ingresá los minutos disponibles para la sesión.');
  }
  const tBloque = posNum(i.duracionBloque, 25);
  const tCorto = posNum(i.descansoCorto, 5);
  const tLargo = posNum(i.descansoLargo, 20);
  const cada = Math.max(2, Math.round(posNum(i.cadaCuantos, 4)));

  // Greedy: metemos bloques mientras entren. El descanso va ANTES de cada bloque
  // (salvo el primero); es largo si el bloque previo cierra un grupo de `cada`.
  let bloques = 0;
  let usado = 0;
  let cortos = 0;
  let largos = 0;
  while (bloques < 5000) {
    const descanso = bloques === 0 ? 0 : bloques % cada === 0 ? tLargo : tCorto;
    if (usado + descanso + tBloque > disponible) break;
    usado += descanso + tBloque;
    if (bloques > 0) {
      if (bloques % cada === 0) largos++;
      else cortos++;
    }
    bloques++;
  }

  const foco = Math.round(bloques * tBloque);
  const total = Math.round(usado);
  const libre = Math.max(0, Math.round(disponible - usado));
  const efic = total > 0 ? Math.round((foco / total) * 100) : 0;
  const focoHoras = foco / 60;

  const fmtTime = (min: number): string => {
    const m = Math.round(min);
    const h = Math.floor(m / 60);
    const r = m % 60;
    if (en) return h && r ? `${h}h ${r}m` : h ? `${h}h` : `${r}m`;
    return h && r ? `${h} h ${r} min` : h ? `${h} h` : `${r} min`;
  };
  const pl = (n: number, sing: string, plu: string) => `${n} ${n === 1 ? sing : plu}`;

  const focoFmt = fmtTime(foco);
  const totalFmt = fmtTime(total);
  const pomosTxt = pl(bloques, 'Pomodoro', 'Pomodoros');
  const cortosTxt = en ? pl(cortos, 'short break', 'short breaks') : pl(cortos, 'descanso corto', 'descansos cortos');
  const largosTxt = en ? pl(largos, 'long break', 'long breaks') : pl(largos, 'descanso largo', 'descansos largos');

  let insight;
  if (bloques === 0) {
    insight = {
      title: en ? 'Not enough for one Pomodoro' : 'No alcanza para un Pomodoro',
      text: en
        ? `**${disponible} min** isn't enough for a single **${tBloque}-min** Pomodoro. Shorten the block or free up more time.`
        : `**${disponible} min** no alcanzan ni para un Pomodoro de **${tBloque} min**. Acortá el bloque o conseguí más tiempo.`,
      tone: 'warn' as const,
      icon: '🍅',
    };
  } else if (focoHoras > 4.5) {
    insight = {
      title: en ? 'Too much focus in one sitting' : 'Demasiado foco de una sentada',
      text: en
        ? `You fit **${pomosTxt}** of **${tBloque} min** = **${focoFmt}** of real focus — above the ~4 h the brain sustains well in one go. Split it into two sessions.`
        : `Te entran **${pomosTxt}** de **${tBloque} min** = **${focoFmt}** de foco real: por encima de las ~4 h que el cerebro sostiene bien de una sentada. Repartilo en dos sesiones.`,
      tone: 'warn' as const,
      icon: '🍅',
    };
  } else {
    insight = {
      title: en ? 'Your Pomodoro session' : 'Tu sesión Pomodoro',
      text: en
        ? `You fit **${pomosTxt}** of **${tBloque} min** = **${focoFmt}** of real focus (**${efic}%** of the session), with **${cortosTxt}**${largos ? ` and **${largosTxt}**` : ''}. The full session runs **${totalFmt}**${libre > 0 ? `, leaving **${libre} min** to spare` : ''}.`
        : `Te entran **${pomosTxt}** de **${tBloque} min** = **${focoFmt}** de foco real (**${efic}%** de la sesión), con **${cortosTxt}**${largos ? ` y **${largosTxt}**` : ''}. La sesión completa dura **${totalFmt}**${libre > 0 ? ` y te sobran **${libre} min**` : ''}.`,
      tone: 'good' as const,
      icon: '🍅',
    };
  }

  const resumen = en
    ? `${pomosTxt} of ${tBloque} min · ${focoFmt} focus · ${cortosTxt}${largos ? ` · ${largosTxt}` : ''} · ${totalFmt} session${libre > 0 ? ` · ${libre} min free` : ''}`
    : `${pomosTxt} de ${tBloque} min · ${focoFmt} de foco · ${cortosTxt}${largos ? ` · ${largosTxt}` : ''} · sesión ${totalFmt}${libre > 0 ? ` · ${libre} min libres` : ''}`;

  const out: Outputs = {
    pomodoros: bloques,
    tiempoFoco: foco,
    tiempoTotal: total,
    descansosCortos: cortos,
    descansosLargos: largos,
    tiempoLibre: libre,
    resumen,
    _insight: insight,
  };

  if (bloques > 0) {
    out._chart = {
      type: 'doughnut' as const,
      slices: [
        { label: en ? 'Real focus' : 'Foco real', value: foco },
        { label: en ? 'Short breaks' : 'Descansos cortos', value: cortos * tCorto },
        { label: en ? 'Long breaks' : 'Descansos largos', value: largos * tLargo },
      ].filter((s) => s.value > 0),
      suffix: ' min',
      centerValue: totalFmt,
      centerLabel: en ? 'Session' : 'Sesión',
      ariaLabel: en
        ? 'Pomodoro session breakdown: real focus, short breaks and long break.'
        : 'Distribución de la sesión Pomodoro: foco real, descansos cortos y descanso largo.',
    };
  }

  return out;
}
