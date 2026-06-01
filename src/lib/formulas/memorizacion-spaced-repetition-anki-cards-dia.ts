export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function memorizacionSpacedRepetitionAnkiCardsDia(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      obs_alto: 'Mucho ritmo. Considerá extender plazo.',
      obs_ok: 'Ritmo sostenible.',
      dia: 'día',
    },
    en: {
      obs_alto: 'High pace. Consider extending the deadline.',
      obs_ok: 'Sustainable pace.',
      dia: 'day',
    },
  } as const)[__lang];
  const m=Number(i.cardsMeta)||0; const s=Number(i.semanasObjetivo)||12;
  const dias=s*7;
  const nuevas=Math.ceil(m/dias);
  const revisiones=nuevas*10;
  const obs=nuevas>30?T.obs_alto:T.obs_ok;
  return { cardsNuevasDia:`${nuevas}/${T.dia}`, revisionesDiaMax:`~${revisiones}/${T.dia}`, observacion:obs };
}
