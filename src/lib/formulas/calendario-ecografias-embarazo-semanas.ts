export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function calendarioEcografiasEmbarazoSemanas(i: Inputs): Outputs {
  const s=Number(i.semanaActual)||0;
  let prox='', que='';
  if (s<=6) { prox='6-8 sem'; que='Confirmar embarazo + posición'; }
  else if (s<=14) { prox='11-14 sem'; que='Scan nucal + aneuploidías'; }
  else if (s<=22) { prox='20-22 sem'; que='ECO morfológica (órganos)'; }
  else if (s<=34) { prox='32-34 sem'; que='Crecimiento + placenta'; }
  else { prox='Parto'; que='Monitoreo fetal'; }
  return { proximaEco:prox, queRevisa:que, resumen:`Semana ${s}: próximo control ${prox}.` };
}
