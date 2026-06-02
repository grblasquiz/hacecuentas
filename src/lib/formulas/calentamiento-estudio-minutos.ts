/** Minutos de calentamiento antes de estudiar */
export interface Inputs {
  [k: string]: any;
}
export interface Outputs {
  calentamientoMin: number;
  primerosMin: string;
  transicion: string;
  consejo: string;
  _insight?: any;
}

export function calentamientoEstudioMinutos(i: Inputs): Outputs {
  const tarea = String(i.tipoTarea || 'razonamiento');
  const gap = Number(i.horasDesde) || 3;
  if (gap < 0) throw new Error('Gap inválido');

  const BASE: Record<string, number> = { memorizacion: 5, razonamiento: 15, escritura: 20, programacion: 20 };
  const PER_HOUR: Record<string, number> = { memorizacion: 2, razonamiento: 5, escritura: 5, programacion: 8 };

  const base = BASE[tarea] || 15;
  const ph = PER_HOUR[tarea] || 5;

  const minCalc = Math.round(base + ph * Math.min(gap, 6));

  const primerosMin: Record<string, string> = {
    memorizacion: 'Revisá 5 flashcards fáciles',
    razonamiento: 'Resolvé 2-3 problemas de nivel previo',
    escritura: 'Releé lo escrito ayer + outline',
    programacion: 'Revisá código de ayer, setup entorno',
  };

  const tareaLabel: Record<string, string> = {
    memorizacion: 'memorización',
    razonamiento: 'razonamiento',
    escritura: 'escritura',
    programacion: 'programación',
  };
  const tLabel = tareaLabel[tarea] || 'razonamiento';
  const gapTxt = gap >= 6 ? '6+ h' : `${gap} h`;
  const insTone = minCalc >= 25 ? 'warn' : minCalc >= 15 ? 'neutral' : 'good';
  const insText = `Tras **${gapTxt}** sin estudiar, una tarea de ${tLabel} necesita **${minCalc} min** de calentamiento antes de entrar en foco. ${minCalc >= 25 ? 'Es un arranque largo: no lo saltees o vas a rendir a media máquina.' : 'Arrancá con algo fácil y subí la dificultad de a poco.'}`;

  return {
    calentamientoMin: minCalc,
    primerosMin: primerosMin[tarea] || 'Releé apuntes anteriores',
    transicion: 'Subí dificultad gradualmente del min 10 al 15',
    consejo: 'Sesión efectiva >60 min para aprovechar el flow. No interrumpir con notificaciones.',
    _insight: { title: 'Tu rampa de arranque', text: insText, tone: insTone, icon: '🧠' },
  };

}
