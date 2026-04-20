export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function memorizacionSpacedRepetitionAnkiCardsDia(i: Inputs): Outputs {
  const m=Number(i.cardsMeta)||0; const s=Number(i.semanasObjetivo)||12;
  const dias=s*7;
  const nuevas=Math.ceil(m/dias);
  const revisiones=nuevas*10;
  const obs=nuevas>30?'Mucho ritmo. Considerá extender plazo.':'Ritmo sostenible.';
  return { cardsNuevasDia:`${nuevas}/día`, revisionesDiaMax:`~${revisiones}/día`, observacion:obs };
}
