export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function presupuesto503020FamiliarSueldo(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const loc = __lang === 'en' ? 'en-US' : 'es-AR';
  const fmt = (n: number) => '$' + Math.round(n).toLocaleString(loc);

  // Ingreso mensual neto del hogar (take-home)
  const ingresoMensual = Math.max(0, Number(i.monto) || 0);

  // Número opcional que trata ''/null/undefined como ausente (el form manda '').
  const optNum = (v: unknown): number | undefined => {
    if (v === '' || v === null || v === undefined) return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  };

  // Período en meses: 1 = vista mensual, 12 = vista anual. Default 1.
  let plazo = optNum(i.plazo) ?? 1;
  if (plazo <= 0) plazo = 1;

  // Override opcional del % de ahorro. Default 20%. El resto se reparte 50/30
  // (necesidades/deseos) en proporción 5:3 sobre lo que queda tras ahorro.
  let ahorroPct = optNum(i.tasa) ?? 20;
  if (ahorroPct < 0) ahorroPct = 20;
  if (ahorroPct > 100) ahorroPct = 100;

  // Reparto base 50/30/20. Si el usuario cambia el % de ahorro, el remanente
  // (100 - ahorro) se divide entre necesidades y deseos manteniendo la
  // proporción 50:30 = 5:3.
  const restante = 100 - ahorroPct;
  const necesidadesPct = restante * (5 / 8);
  const deseosPct = restante * (3 / 8);

  const base = ingresoMensual * plazo;
  const necesidades = base * (necesidadesPct / 100);
  const deseos = base * (deseosPct / 100);
  const ahorro = base * (ahorroPct / 100);

  const periodoTxt = __lang === 'en'
    ? (plazo === 1 ? 'month' : `${plazo} months`)
    : (plazo === 1 ? 'mes' : `${plazo} meses`);

  const resumen = __lang === 'en'
    ? `On ${fmt(base)} net per ${periodoTxt}: ${fmt(necesidades)} needs, ${fmt(deseos)} wants, ${fmt(ahorro)} savings.`
    : `Sobre ${fmt(base)} netos por ${periodoTxt}: ${fmt(necesidades)} necesidades, ${fmt(deseos)} deseos, ${fmt(ahorro)} ahorro.`;

  const esDefault = Math.abs(ahorroPct - 20) < 0.01;
  const _insight = __lang === 'en'
    ? {
        title: esDefault ? 'Your 50/30/20 split' : `Your ${Math.round(necesidadesPct)}/${Math.round(deseosPct)}/${Math.round(ahorroPct)} split`,
        text: `Out of **${fmt(base)}** take-home, allocate **${fmt(necesidades)}** to needs (rent, groceries, utilities, minimum debt), **${fmt(deseos)}** to wants (dining, streaming, hobbies) and **${fmt(ahorro)}** to savings and extra debt payoff${esDefault ? '' : ` (${Math.round(ahorroPct)}% savings rate)`}.`,
        tone: ahorroPct >= 20 ? 'positive' : 'neutral',
        icon: '💰',
      }
    : {
        title: esDefault ? 'Tu reparto 50/30/20' : `Tu reparto ${Math.round(necesidadesPct)}/${Math.round(deseosPct)}/${Math.round(ahorroPct)}`,
        text: `De **${fmt(base)}** netos, destiná **${fmt(necesidades)}** a necesidades (alquiler, comida, servicios, mínimos de deuda), **${fmt(deseos)}** a deseos (salidas, streaming, hobbies) y **${fmt(ahorro)}** a ahorro y pago extra de deuda${esDefault ? '' : ` (tasa de ahorro ${Math.round(ahorroPct)}%)`}.`,
        tone: ahorroPct >= 20 ? 'positive' : 'neutral',
        icon: '💰',
      };

  const _chart = {
    type: 'doughnut' as const,
    slices: [
      { label: __lang === 'en' ? 'Needs' : 'Necesidades', value: Math.round(necesidades) },
      { label: __lang === 'en' ? 'Wants' : 'Deseos', value: Math.round(deseos) },
      { label: __lang === 'en' ? 'Savings' : 'Ahorro', value: Math.round(ahorro) },
    ].filter((s) => s.value > 0),
    prefix: '$',
    centerValue: fmt(base),
    centerLabel: __lang === 'en' ? 'Net income' : 'Ingreso neto',
    ariaLabel: __lang === 'en'
      ? 'Breakdown of net income into needs, wants and savings under the 50/30/20 rule.'
      : 'Reparto del ingreso neto en necesidades, deseos y ahorro según la regla 50/30/20.',
  };

  return {
    resultado: fmt(necesidades),
    deseos: fmt(deseos),
    ahorro: fmt(ahorro),
    resumen,
    _insight,
    _chart,
  };
}
