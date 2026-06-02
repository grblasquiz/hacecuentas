export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function reunionesCostoTiempoPersonasEmpresa(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      porPersonaH: '/persona/h',
      caro: 'Caro — evalúa si async puede reemplazar.',
      razonable: 'Razonable',
      insTitle: 'Costo de la reunión',
      insCaro: (c: string, p: number, d: number) => `Juntar a **${p} personas** durante **${d} min** cuesta **$${c}** en horas-hombre. Para una decisión menor, evaluá si un mensaje async o un doc compartido lo resuelve igual.`,
      insOk: (c: string, p: number, d: number) => `Reunir a **${p} personas** por **${d} min** vale **$${c}** en tiempo. Es un costo razonable si la agenda está cerrada y todos vienen preparados.`,
    },
    en: {
      porPersonaH: '/person/h',
      caro: 'Expensive — consider whether async can replace this.',
      razonable: 'Reasonable',
      insTitle: 'Meeting cost',
      insCaro: (c: string, p: number, d: number) => `Getting **${p} people** together for **${d} min** costs **$${c}** in labor hours. For a minor decision, check whether an async message or a shared doc gets you there.`,
      insOk: (c: string, p: number, d: number) => `Bringing **${p} people** together for **${d} min** is worth **$${c}** in time. A reasonable cost if the agenda is set and everyone comes prepared.`,
    },
  } as const)[__lang];
  const locale = __lang === 'en' ? 'en-US' : 'es-AR';
  const p=Number(i.personas)||0; const d=Number(i.duracionMin)||0; const s=Number(i.sueldoPromedioMes)||0;
  const sHora=s/176;
  const horas=d/60;
  const costo=p*horas*sHora;
  const esCaro = costo > 50000;
  const costoFmt = Math.round(costo).toLocaleString(locale);
  return {
    costoReunion:`$${costoFmt}`,
    porHora:`$${Math.round(sHora).toLocaleString(locale)}${T.porPersonaH}`,
    observacion:esCaro?T.caro:T.razonable,
    _insight: {
      title: T.insTitle,
      text: esCaro ? T.insCaro(costoFmt, p, d) : T.insOk(costoFmt, p, d),
      tone: esCaro ? 'warn' : 'neutral',
      icon: esCaro ? '💸' : '🗓️',
    },
  };
}
