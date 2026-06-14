/**
 * Calculadora de mezcla de presupuesto por canales de marketing
 * Reparte el presupuesto total entre Search, Social, Display y Email según los % dados.
 * Si los % no suman 100, los normaliza y avisa.
 */

export interface MezclaPresupuestoCanalesMarketingInputs {
  presupuesto_total: number | string;
  search_pct?: number | string; // % default 40
  social_pct?: number | string; // % default 30
  display_pct?: number | string; // % default 15
  email_pct?: number | string; // % default 15
}

export interface MezclaPresupuestoCanalesMarketingOutputs {
  montoSearch: number;
  montoSocial: number;
  montoDisplay: number;
  montoEmail: number;
  sumaPct: number;
  normalizado: boolean;
  tabla: { canal: string; pct: number; monto: number }[];
  detalle: string;
  _insight?: any;
  _chart?: any;
}

function num(v: number | string | undefined, def = 0): number {
  if (v === '' || v == null) return def;
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}

export function mezclaPresupuestoCanalesMarketing(
  i: MezclaPresupuestoCanalesMarketingInputs
): MezclaPresupuestoCanalesMarketingOutputs {
  const presupuesto = num(i.presupuesto_total);
  let search = Math.max(0, num(i.search_pct, 40));
  let social = Math.max(0, num(i.social_pct, 30));
  let display = Math.max(0, num(i.display_pct, 15));
  let email = Math.max(0, num(i.email_pct, 15));

  if (!presupuesto || presupuesto <= 0)
    throw new Error('Ingresá el presupuesto total de marketing');

  const sumaPctOriginal = search + social + display + email;
  if (sumaPctOriginal <= 0)
    throw new Error('Ingresá al menos un porcentaje de canal mayor a 0');

  // Normalizar si no suman 100 (con tolerancia para errores de redondeo)
  const normalizado = Math.abs(sumaPctOriginal - 100) > 0.01;
  let factor = 1;
  if (normalizado) {
    factor = 100 / sumaPctOriginal;
    search = search * factor;
    social = social * factor;
    display = display * factor;
    email = email * factor;
  }

  const montoSearch = presupuesto * (search / 100);
  const montoSocial = presupuesto * (social / 100);
  const montoDisplay = presupuesto * (display / 100);
  const montoEmail = presupuesto * (email / 100);

  const tabla = [
    { canal: 'Search (SEM)', pct: Math.round(search * 10) / 10, monto: Math.round(montoSearch) },
    { canal: 'Social Ads', pct: Math.round(social * 10) / 10, monto: Math.round(montoSocial) },
    { canal: 'Display', pct: Math.round(display * 10) / 10, monto: Math.round(montoDisplay) },
    { canal: 'Email', pct: Math.round(email * 10) / 10, monto: Math.round(montoEmail) },
  ].filter((x) => x.monto > 0 || x.pct > 0);

  const top = tabla.slice().sort((a, b) => b.monto - a.monto)[0];
  const tone: 'good' | 'warn' | 'neutral' = normalizado ? 'warn' : 'good';

  const insightText = normalizado
    ? `Los porcentajes que cargaste sumaban **${Math.round(sumaPctOriginal * 10) / 10}%**, así que los **normalicé a 100%** para repartir todo el presupuesto. El canal con mayor asignación es **${top ? top.canal : 'Search'}** con $${top ? top.monto.toLocaleString('es-AR') : 0}. Ajustá los % para que sumen exactamente 100 y controlar vos la mezcla.`
    : `El presupuesto de **$${Math.round(presupuesto).toLocaleString('es-AR')}** queda repartido con **${top ? top.canal : 'Search'}** como canal principal ($${top ? top.monto.toLocaleString('es-AR') : 0}). Una mezcla diversificada reduce el riesgo de depender de una sola plataforma; reasigná según el ROAS de cada canal.`;

  const _insight = {
    title: 'Mezcla de canales',
    text: insightText,
    tone,
    icon: '🧮',
  };

  const _chart =
    tabla.length > 0
      ? {
          type: 'doughnut',
          slices: tabla.map((x) => ({ label: x.canal, value: x.monto })),
          prefix: '$',
          centerValue: `$${Math.round(presupuesto).toLocaleString('es-AR')}`,
          centerLabel: 'Presupuesto',
          ariaLabel: `Gráfico de torta de la distribución del presupuesto de marketing por canal, total $${Math.round(presupuesto).toLocaleString('es-AR')}`,
        }
      : undefined;

  const out: MezclaPresupuestoCanalesMarketingOutputs = {
    montoSearch: Math.round(montoSearch),
    montoSocial: Math.round(montoSocial),
    montoDisplay: Math.round(montoDisplay),
    montoEmail: Math.round(montoEmail),
    sumaPct: Math.round(sumaPctOriginal * 10) / 10,
    normalizado,
    tabla,
    detalle: `Presupuesto $${Math.round(presupuesto).toLocaleString('es-AR')}. Search $${Math.round(montoSearch).toLocaleString('es-AR')}, Social $${Math.round(montoSocial).toLocaleString('es-AR')}, Display $${Math.round(montoDisplay).toLocaleString('es-AR')}, Email $${Math.round(montoEmail).toLocaleString('es-AR')}.${normalizado ? ' (porcentajes normalizados a 100%)' : ''}`,
    _insight,
  };
  if (_chart) out._chart = _chart;
  return out;
}
