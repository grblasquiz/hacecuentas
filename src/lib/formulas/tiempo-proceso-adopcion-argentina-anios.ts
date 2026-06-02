export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function tiempoProcesoAdopcionArgentinaAnios(i: Inputs): Outputs {
  const e=Number(i.edadBuscada)||0;
  let t:string; let p:string; let insText:string; let insTone:'good'|'warn'|'neutral';
  if (e<=2) {
    t='3-5+ años'; p='Baja disponibilidad';
    insTone='warn';
    insText=`Buscar un niño de **${e} año${e===1?'':'s'}** es lo más demandado del registro: la disponibilidad es **baja** y la espera estimada de **${t}**. Ampliar la franja de edad o abrirse a grupos de hermanos acorta los tiempos drásticamente.`;
  } else if (e<=5) {
    t='2-4 años'; p='Media';
    insTone='neutral';
    insText=`A los **${e} años** la disponibilidad es **media**: la espera ronda **${t}**. Flexibilizar la edad hacia arriba suele reducir bastante el tiempo de espera.`;
  } else if (e<=10) {
    t='1-3 años'; p='Alta';
    insTone='good';
    insText=`A los **${e} años** la disponibilidad ya es **alta** y la espera baja a **${t}**: hay muchos más niños en esta franja que familias dispuestas a adoptarlos.`;
  } else {
    t='<1 año'; p='Muy alta';
    insTone='good';
    insText=`Buscar a partir de los **${e} años** es donde más urge la adopción: disponibilidad **muy alta** y espera de **${t}**. Adolescentes y grupos de hermanos son los que más esperan una familia.`;
  }
  return {
    tiempoProm:t, probable:p,
    resumen:`Edad buscada ${e}: espera ${t}, disponibilidad ${p}.`,
    _insight: { title: 'Qué esperar en este proceso', text: insText, tone: insTone, icon: '🤝' },
  };
}
