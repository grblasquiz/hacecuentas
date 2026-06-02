export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | any; }
export function costoTotalCriarHijo18Anios(i: Inputs): Outputs {
  const m=Number(i.mensual)||0; const inf=Number(i.infl)||0;
  let tot=0, presente=0;
  for (let k=0;k<18;k++) { const costAnio=m*12*Math.pow(1+inf/100,k); tot+=costAnio; presente+=m*12; }
  const premiumInfl = tot - presente;
  const fmt = (x:number) => x.toLocaleString('es-AR', { maximumFractionDigits: 0 });
  const _insight = {
    title: 'El costo real de criar 18 años',
    text: `A **$${fmt(m)}/mes**, criar un hijo hasta los 18 suma **$${fmt(tot)}** nominales${inf > 0 ? `, de los cuales **$${fmt(premiumInfl)}** son puro efecto de la inflación del ${inf}% anual` : ''}. En plata de hoy, el esfuerzo equivale a **$${fmt(presente)}**.`,
    tone: 'neutral' as const,
    icon: '👶',
  };
  const out: Outputs = { totalNom:`$${tot.toFixed(0)}`, totalReal:`$${presente.toFixed(0)}`, resumen:`18 años a $${m}/mes: nominal $${tot.toFixed(0)}.`, _insight };
  if (inf > 0 && premiumInfl > 0) {
    out._chart = {
      type: 'doughnut',
      slices: [
        { label: 'Costo a valor de hoy', value: Math.round(presente) },
        { label: 'Efecto inflación', value: Math.round(premiumInfl) },
      ],
      prefix: '$',
      centerValue: `$${fmt(tot)}`,
      centerLabel: 'Total nominal',
      ariaLabel: `Gráfico de torta del costo total nominal de criar un hijo 18 años, $${fmt(tot)}`,
    };
  }
  return out;
}
