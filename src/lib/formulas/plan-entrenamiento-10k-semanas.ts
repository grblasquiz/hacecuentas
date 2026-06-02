export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function planEntrenamiento10kSemanas(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      resumen: (nivel: string, total: number, kmPico: number) => `Plan ${nivel} 10k: ${total} semanas, pico ${kmPico} km/sem.`,
      title: 'Tu plan de 10K',
      insight: (total: number, kmPico: number) => `Necesitás **${total} semanas** de preparación, con un pico de volumen de **${kmPico} km en la última semana** antes de aflojar. Sumá un día de fondo largo por semana y respetá los descansos para llegar entero al 10K.`,
    },
    en: {
      resumen: (nivel: string, total: number, kmPico: number) => `${nivel} 10K plan: ${total} weeks, peak ${kmPico} km/week.`,
      title: 'Your 10K plan',
      insight: (total: number, kmPico: number) => `You need **${total} weeks** of training, peaking at **${kmPico} km in the final week** before the taper. Add one long run per week and respect your rest days to reach the 10K in one piece.`,
    },
  } as const)[__lang];
  const niveles: Record<string, number> = { principiante: 2, intermedio: 0, avanzado: -2 };
  const base = 8; const extra = niveles[String(i.nivel)] || 0;
  const total = base + extra;
  const kmPico = total * 3 + 40;
  const _insight = { title: T.title, text: T.insight(total, kmPico), tone: 'good', icon: '🏃' };
  return { semanas: total.toString(), kmSemanaFinal: kmPico.toFixed(0) + ' km', resumen: T.resumen(String(i.nivel), total, kmPico), _insight };
}
