/** Calculadora de Calendario de Contenido Mensual */
export interface Inputs { plataformas: number; postsSemanaPorPlataforma: number; storiesDia?: number; horasProduccion: number; }
export interface Outputs { postsMes: number; storiesMes: number; horasMes: number; resumen: string; }

export function contenidoCalendarioMensual(i: Inputs): Outputs {
  const plat = Number(i.plataformas);
  const ppw = Number(i.postsSemanaPorPlataforma);
  const spd = i.storiesDia ? Number(i.storiesDia) : 0;
  const hpp = Number(i.horasProduccion);
  if (!plat || plat < 1) throw new Error('Ingresá las plataformas');
  if (!ppw || ppw < 1) throw new Error('Ingresá posts por semana');
  if (!hpp || hpp <= 0) throw new Error('Ingresá horas de producción');

  const postsMes = Math.round(plat * ppw * 4.33);
  const storiesMes = Math.round(spd * 30);
  const horasMes = Number((postsMes * hpp + storiesMes * 0.25).toFixed(1));

  return {
    postsMes,
    storiesMes,
    horasMes,
    resumen: `${plat} plataformas × ${ppw} posts/semana = ${postsMes} posts/mes + ${storiesMes} stories. Total producción: ${horasMes} horas/mes.`,
  };
}
