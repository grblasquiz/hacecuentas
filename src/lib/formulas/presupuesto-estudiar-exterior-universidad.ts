export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: any; _insight?: any; }
export function presupuestoEstudiarExteriorUniversidad(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  const tuition   = Math.max(0, Number(i.tuition)   || 0);
  const housing   = Math.max(0, Number(i.housing)   || 0);
  const food      = Math.max(0, Number(i.food)       || 0);
  const insurance = Math.max(0, Number(i.insurance)  || 0);
  const flights   = Math.max(0, Number(i.flights)    || 0);
  const visa      = Math.max(0, Number(i.visa)        || 0);
  const personal  = Math.max(0, Number(i.personal)   || 0);

  const total = tuition + housing + food + insurance + flights + visa + personal;
  const weekly = total > 0 ? (total / 17) : 0; // ~17 weeks per semester

  const fmt = (n: number) =>
    n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  const costBreakdown = __lang === 'en'
    ? `Tuition/Fees: $${fmt(tuition)} | Housing: $${fmt(housing)} | Food: $${fmt(food)} | Insurance: $${fmt(insurance)} | Flights: $${fmt(flights)} | Visa: $${fmt(visa)} | Personal: $${fmt(personal)}`
    : `Matrícula: $${fmt(tuition)} | Alojamiento: $${fmt(housing)} | Comida: $${fmt(food)} | Seguro: $${fmt(insurance)} | Vuelos: $${fmt(flights)} | Visa: $${fmt(visa)} | Personal: $${fmt(personal)}`;

  const _insight = {
    title: __lang === 'en' ? 'Your study abroad budget' : 'Tu presupuesto en el exterior',
    text: __lang === 'en'
      ? `Your estimated total cost for one semester abroad is **$${fmt(total)} USD** (~$${fmt(weekly)}/week). Tuition and housing are usually the two largest line items — together they account for most of the budget. Apply for the **Gilman Scholarship** (up to $5,000 for Pell recipients) or **Boren** (up to $25,000 for critical languages) to reduce your out-of-pocket gap.`
      : `El costo estimado para un semestre en el exterior es **$${fmt(total)} USD** (~$${fmt(weekly)}/semana). La matrícula y el alojamiento suelen ser los dos ítems más grandes. Buscá becas como Gilman (hasta $5.000) o Boren (hasta $25.000) para reducir el gasto de bolsillo.`,
    tone: 'neutral',
    icon: '🌍',
  };

  return {
    total: '$' + fmt(total),
    weeklyAvg: '$' + fmt(weekly),
    costBreakdown,
    _insight,
  };
}
