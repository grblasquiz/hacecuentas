export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function productividadPomodoroSesionesDiaEfectivas(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      tiempoEfectivo: (h: string) => `${h} horas efectivas`,
      sostenible: 'Sostenible',
      recomendacion: 'Considerá no más de 10 por día para mantener calidad.',
      insightTitle: 'Tu día en foco profundo',
      insightOk: (s: number, h: string) => `Tu jornada da para **${s} Pomodoros**, o sea **${h} horas** de foco profundo. Es un volumen sostenible: andá por el café o caminá en las pausas para llegar entero al final del día.`,
      insightHigh: (s: number, h: string) => `Tu jornada da para **${s} Pomodoros** (**${h} horas** de foco real). Es bastante: apuntá a **no más de 10 por día** para no fundirte y mantener la calidad del trabajo.`,
      foco: 'Foco efectivo',
      pausas: 'Pausas y descansos',
      center: 'Pomodoros',
      aria: 'Reparto del día entre tiempo de foco efectivo y pausas',
    },
    en: {
      tiempoEfectivo: (h: string) => `${h} effective hours`,
      sostenible: 'Sustainable',
      recomendacion: 'Consider no more than 10 per day to maintain quality.',
      insightTitle: 'Your day in deep focus',
      insightOk: (s: number, h: string) => `Your day fits **${s} Pomodoros**, that is **${h} hours** of deep focus. It is a sustainable load: grab a coffee or take a walk on the breaks to finish the day fresh.`,
      insightHigh: (s: number, h: string) => `Your day fits **${s} Pomodoros** (**${h} hours** of real focus). That is a lot: aim for **no more than 10 per day** to avoid burnout and keep your work quality up.`,
      foco: 'Effective focus',
      pausas: 'Breaks and rest',
      center: 'Pomodoros',
      aria: 'Split of the day between effective focus time and breaks',
    },
  } as const)[__lang];
  const h=Number(i.horasDisponibles)||8;
  const minTotales=h*60;
  const cicloCompleto=120; // 4×(25+5) + 30 pausa larga
  const ciclos=Math.floor(minTotales/cicloCompleto);
  const sesiones=ciclos*4+Math.floor((minTotales%cicloCompleto)/30);
  const efectivo=sesiones*25;
  const horasFoco=(efectivo/60).toFixed(1);
  const pausas=Math.max(0, minTotales - efectivo);
  const _insight = {
    title: T.insightTitle,
    text: sesiones < 8 ? T.insightOk(sesiones, horasFoco) : T.insightHigh(sesiones, horasFoco),
    tone: sesiones < 8 ? 'good' : 'warn',
    icon: '🍅',
  };
  const _chart = {
    type: 'doughnut',
    slices: [
      { label: T.foco, value: efectivo },
      { label: T.pausas, value: pausas },
    ],
    suffix: ' min',
    centerValue: `${sesiones}`,
    centerLabel: T.center,
    ariaLabel: T.aria,
  };
  return { sesionesMax:`${sesiones} Pomodoros`, tiempoEfectivo:T.tiempoEfectivo(horasFoco), recomendacion:sesiones<8?T.sostenible:T.recomendacion, _insight, _chart };
}
