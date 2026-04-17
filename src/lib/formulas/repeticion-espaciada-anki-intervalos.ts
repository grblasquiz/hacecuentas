/** Calculadora de Intervalos Anki */
export interface Inputs {
  [k: string]: any;
}
export interface Outputs {
  diasCompletar: number;
  repasosDiarios: number;
  intervalos: string;
  totalMinutos: number;
}

export function repeticionEspaciadaAnkiIntervalos(i: Inputs): Outputs {
  const total = Number(i.tarjetasTotales) || 2000;
  const nuevas = Number(i.nuevasPorDia) || 20;
  const ease = Number(i.easeFactor) || 2.5;
  if (total <= 0) throw new Error('Total tarjetas inválido');
  if (nuevas <= 0) throw new Error('Nuevas por día inválidas');

  const diasCompletar = Math.ceil(total / nuevas);
  // Repasos diarios en régimen: aprox 10x nuevas
  const factor = ease >= 2.8 ? 8 : ease >= 2.5 ? 10 : 12;
  const repasosDiarios = nuevas * factor;
  const minutos = Math.round((repasosDiarios * 12) / 60);

  const intervalos = `1, 3, 7, 15, ${Math.round(15 * ease)}, ${Math.round(15 * ease * ease)} días (ease ${ease})`;

  return {
    diasCompletar,
    repasosDiarios,
    intervalos,
    totalMinutos: minutos,
  };

}
