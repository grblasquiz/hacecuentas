export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function costoTokensApiOpenaiClaudeMensual(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const ti=Number(i.in_tok)||0; const to=Number(i.out_tok)||0; const n=Number(i.calls)||0; const pI=Number(i.pIn)||3; const pO=Number(i.pOut)||15;
  const perCall=(ti*pI+to*pO)/1000/1000;
  const dia=perCall*n;
  const resumen = __lang === 'en'
    ? `${n} calls/day: $${dia.toFixed(2)}/day, $${(dia*30).toFixed(0)}/month.`
    : `${n} llamadas/día: $${dia.toFixed(2)}/día, $${(dia*30).toFixed(0)}/mes.`;
  return { diario:`$${dia.toFixed(2)}`, mensual:`$${(dia*30).toFixed(2)}`, anual:`$${(dia*365).toFixed(2)}`, resumen };
}
