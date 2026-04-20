export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function calendarioVacunasBebeArgentina2026Completo(i: Inputs): Outputs {
  const m=Number(i.edadMeses)||0;
  let apl='', prox='';
  if(m>=0) apl='BCG + Hepatitis B';
  if(m>=2) apl+=', Pentavalente + Neumococo + Rotavirus + IPV';
  if(m>=4) apl+=', Refuerzos';
  if(m>=6) apl+=', Pentavalente + IPV';
  if(m>=12) apl+=', Triple viral + HepA + Neumococo 13';
  if(m>=18) apl+=', Cuádruple + Polio oral';
  if(m<2) prox='2 meses: Pentavalente + Rotavirus';
  else if(m<4) prox='4 meses: 2° dosis pentavalente';
  else if(m<6) prox='6 meses: gripe + refuerzos';
  else if(m<12) prox='12 meses: Triple viral + HepA';
  else prox='Según calendario continuar';
  return { vacunasAplicadas:apl, proximas:prox, gratis:'Sí, gratuitas en centros de salud públicos. Ley 27.491.' };
}
