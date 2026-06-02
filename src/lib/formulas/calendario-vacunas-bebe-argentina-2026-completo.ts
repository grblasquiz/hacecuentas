export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function calendarioVacunasBebeArgentina2026Completo(i: Inputs): Outputs {
  const m=Number(i.edadMeses)||0;
  const grupos:string[]=[];
  if(m>=0) grupos.push('BCG + Hepatitis B');
  if(m>=2) grupos.push('Pentavalente + Neumococo + Rotavirus + IPV');
  if(m>=4) grupos.push('Refuerzos');
  if(m>=6) grupos.push('Pentavalente + IPV');
  if(m>=12) grupos.push('Triple viral + HepA + Neumococo 13');
  if(m>=18) grupos.push('Cuádruple + Polio oral');
  let prox='';
  if(m<2) prox='2 meses: Pentavalente + Rotavirus';
  else if(m<4) prox='4 meses: 2° dosis pentavalente';
  else if(m<6) prox='6 meses: gripe + refuerzos';
  else if(m<12) prox='12 meses: Triple viral + HepA';
  else prox='Según calendario continuar';
  const mesesTxt = Number.isInteger(m) ? `${m}` : m.toFixed(1).replace('.', ',');
  const resumen = grupos.length
    ? `${grupos.length} instancias hasta los ${mesesTxt} meses`
    : 'Recién nacido: aún sin vacunas';
  const insText = grupos.length
    ? `A los **${mesesTxt} meses** ya corresponden **${grupos.length} instancia${grupos.length === 1 ? '' : 's'}** de vacunación del calendario oficial. Próximo turno: **${prox}**. Todas gratuitas por Ley 27.491.`
    : `Recién nacido: todavía **sin vacunas** del calendario. El primer turno es a los **2 meses** (Pentavalente + Rotavirus). Son gratuitas por Ley 27.491.`;

  return {
    vacunasAplicadas: resumen,
    detalleAplicadas: grupos.length ? grupos.join('; ') : 'Ninguna todavía',
    proximas: prox,
    gratis: 'Sí, gratuitas en centros de salud públicos. Ley 27.491.',
    _insight: { title: 'Esquema de vacunación', text: insText, tone: 'neutral', icon: '💉' },
  };
}
