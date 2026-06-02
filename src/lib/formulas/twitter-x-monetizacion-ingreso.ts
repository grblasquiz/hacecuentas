/** Twitter/X Monetización */
export interface Inputs { impresionesMensuales: number; nicho: string; premium: string; }
export interface Outputs { rpmEstimado: string; ingresoMensual: string; ingresoAnual: string; netoAnual: string; _insight?: any; _chart?: any; }

export function twitterXMonetizacionIngreso(i: Inputs): Outputs {
  const imp = Number(i.impresionesMensuales) || 0;
  const n = String(i.nicho);
  const pr = String(i.premium);
  const rpmBase: Record<string, { p: number; pp: number }> = {
    'Finanzas / trading': { p: 5, pp: 8 },
    'Negocios / marketing B2B': { p: 4, pp: 6.5 },
    'Tech / SaaS': { p: 3, pp: 5 },
    'Entretenimiento / memes': { p: 1, pp: 1.5 },
    'Política / opinión': { p: 1.5, pp: 2.5 },
    'Deportes': { p: 1.5, pp: 2.5 },
    'Gaming': { p: 1.2, pp: 2 },
    'Lifestyle': { p: 0.75, pp: 1.5 },
  };
  const r = rpmBase[n] || { p: 1, pp: 2 };
  const rpm = pr.startsWith('Premium+') ? r.pp : r.p;
  const costoPrem = pr.startsWith('Premium+') ? 16 : 8;
  const mensual = (imp / 1000000) * rpm;
  const anual = mensual * 12;
  const costoAnual = costoPrem * 12;
  const neto = anual - costoAnual;

  const tone = neto < 0 ? 'warn' : neto >= costoAnual ? 'good' : 'neutral';
  const text = neto < 0
    ? `Con **${imp.toLocaleString('en-US')} impresiones/mes** generás **$${anual.toFixed(0)} al año**, pero la suscripción Premium cuesta **$${costoAnual}**: hoy estás **$${Math.abs(neto).toFixed(0)} en rojo**. Necesitás más alcance para que rinda.`
    : `Con **${imp.toLocaleString('en-US')} impresiones/mes** y un RPM de **$${rpm.toFixed(2)}** en ${n}, ganás **$${anual.toFixed(0)} brutos al año** y te quedan **$${neto.toFixed(0)} netos** tras pagar $${costoAnual} de Premium.`;
  const _insight = {
    title: 'Tu ingreso por X',
    text,
    tone,
    icon: '🐦',
  };

  const out: Outputs = {
    rpmEstimado: `$${rpm.toFixed(2)} USD por millón impresiones`,
    ingresoMensual: `$${mensual.toFixed(2)} USD/mes`,
    ingresoAnual: `$${anual.toFixed(2)} USD/año`,
    netoAnual: `$${neto.toFixed(2)} USD/año (después de $${costoAnual} Premium)`,
    _insight,
  };

  // Donut sólo cuando el bruto se descompone limpio en neto + costo Premium (neto >= 0)
  if (neto >= 0) {
    out._chart = {
      type: 'doughnut',
      slices: [
        { label: 'Neto para vos', value: Math.round(neto) },
        { label: 'Costo Premium', value: costoAnual },
      ],
      prefix: '$',
      centerValue: `$${anual.toFixed(0)}`,
      centerLabel: 'bruto/año',
      ariaLabel: `Desglose del ingreso anual bruto de $${anual.toFixed(0)}: $${neto.toFixed(0)} netos y $${costoAnual} de suscripción Premium`,
    };
  }

  return out;
}
