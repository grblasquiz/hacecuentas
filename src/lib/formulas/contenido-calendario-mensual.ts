/** Calculadora de Calendario de Contenido Mensual */
export interface Inputs { plataformas: number; postsSemanaPorPlataforma: number; storiesDia?: number; horasProduccion: number; }
export interface Outputs { postsMes: number; storiesMes: number; horasMes: number; resumen: string; _insight?: any; _chart?: any; }

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

  const horasSemana = Number((horasMes / 4.33).toFixed(1));
  const out: Outputs = {
    postsMes,
    storiesMes,
    horasMes,
    resumen: `${plat} plataformas × ${ppw} posts/semana = ${postsMes} posts/mes + ${storiesMes} stories. Total producción: ${horasMes} horas/mes.`,
    _insight: {
      title: 'Tu carga de producción mensual',
      text: `Producir **${postsMes} posts** y **${storiesMes} stories** al mes te demanda **${horasMes} horas** (~**${horasSemana} h/semana**). Tenelo en cuenta al definir cuánto podés sostener sin perder calidad.`,
      tone: 'neutral',
      icon: '📅',
    },
  };

  // Donut sólo si hay stories: muestra cómo se reparten las horas posts vs stories.
  if (storiesMes > 0) {
    const horasPosts = Number((postsMes * hpp).toFixed(1));
    const horasStories = Number((horasMes - horasPosts).toFixed(1));
    out._chart = {
      type: 'doughnut',
      slices: [
        { label: 'Posts', value: horasPosts },
        { label: 'Stories', value: horasStories },
      ],
      prefix: '',
      centerValue: `${horasMes} h`,
      centerLabel: 'horas/mes',
      ariaLabel: `Reparto de las ${horasMes} horas mensuales entre posts (${horasPosts} h) y stories (${horasStories} h)`,
    };
  }

  return out;
}
