export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function memorizacionSpacedRepetitionAnkiCardsDia(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      obs_alto: 'Mucho ritmo. Considerá extender plazo.',
      obs_ok: 'Ritmo sostenible.',
      dia: 'día',
      ins_title: 'Tu plan de estudio diario',
      ins_alto: (n: number, r: number, d: number) => `Para cubrir tu meta en **${d} días** tenés que sumar **${n} cartas nuevas/día** y repasar hasta **~${r}**. Es un ritmo exigente: si fallás un día, la cola de repasos se dispara. Considerá alargar el plazo.`,
      ins_ok: (n: number, r: number, d: number) => `Sumando **${n} cartas nuevas/día** y repasando hasta **~${r}**, llegás a tu meta en **${d} días**. Es un ritmo sostenible que evita acumular repasos atrasados.`,
    },
    en: {
      obs_alto: 'High pace. Consider extending the deadline.',
      obs_ok: 'Sustainable pace.',
      dia: 'day',
      ins_title: 'Your daily study plan',
      ins_alto: (n: number, r: number, d: number) => `To hit your goal in **${d} days** you need **${n} new cards/day** plus up to **~${r}** reviews. That is a demanding pace: miss one day and the review queue spikes. Consider extending the deadline.`,
      ins_ok: (n: number, r: number, d: number) => `Adding **${n} new cards/day** and reviewing up to **~${r}**, you reach your goal in **${d} days**. A sustainable pace that keeps the review backlog under control.`,
    },
  } as const)[__lang];
  const m=Number(i.cardsMeta)||0; const s=Number(i.semanasObjetivo)||12;
  const dias=s*7;
  const nuevas=Math.ceil(m/dias);
  const revisiones=nuevas*10;
  const alto=nuevas>30;
  const obs=alto?T.obs_alto:T.obs_ok;
  const _insight = {
    title: T.ins_title,
    text: (alto ? T.ins_alto : T.ins_ok)(nuevas, revisiones, dias),
    tone: alto ? 'warn' : 'good',
    icon: '🧠',
  };
  return { cardsNuevasDia:`${nuevas}/${T.dia}`, revisionesDiaMax:`~${revisiones}/${T.dia}`, observacion:obs, _insight };
}
