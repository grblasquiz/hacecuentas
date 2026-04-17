/** Minutos de calentamiento antes de estudiar */
export interface Inputs {
  [k: string]: any;
}
export interface Outputs {
  calentamientoMin: number;
  primerosMin: string;
  transicion: string;
  consejo: string;
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

  return {
    calentamientoMin: minCalc,
    primerosMin: primerosMin[tarea] || 'Releé apuntes anteriores',
    transicion: 'Subí dificultad gradualmente del min 10 al 15',
    consejo: 'Sesión efectiva >60 min para aprovechar el flow. No interrumpir con notificaciones.',
  };

}
