export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function planEntrenamiento10kSemanas(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: { resumen: (nivel: string, total: number, kmPico: number) => `Plan ${nivel} 10k: ${total} semanas, pico ${kmPico} km/sem.` },
    en: { resumen: (nivel: string, total: number, kmPico: number) => `${nivel} 10K plan: ${total} weeks, peak ${kmPico} km/week.` },
  } as const)[__lang];
  const niveles: Record<string, number> = { principiante: 2, intermedio: 0, avanzado: -2 };
  const base = 8; const extra = niveles[String(i.nivel)] || 0;
  const total = base + extra;
  const kmPico = total * 3 + 40;
  return { semanas: total.toString(), kmSemanaFinal: kmPico.toFixed(0) + ' km', resumen: T.resumen(String(i.nivel), total, kmPico) };
}
