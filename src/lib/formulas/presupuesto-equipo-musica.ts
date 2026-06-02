/** Calculadora de Presupuesto para Equipo de Música */
export interface Inputs {
  presupuesto: number;
  nivel: string;
  tipo: string;
  __lang?: string;
}
export interface Outputs {
  instrumento: number;
  amplificacion: number;
  accesorios: number;
  grabacion: number;
  recomendacion: string;
  _insight?: any;
  _chart?: any;
}

interface Dist { instrumento: number; amplificacion: number; accesorios: number; grabacion: number; }

const DISTRIBUCIONES: Record<string, Record<string, Dist>> = {
  principiante: {
    vivo:     { instrumento: 0.50, amplificacion: 0.30, accesorios: 0.15, grabacion: 0.05 },
    estudio:  { instrumento: 0.35, amplificacion: 0.20, accesorios: 0.10, grabacion: 0.35 },
    practica: { instrumento: 0.55, amplificacion: 0.25, accesorios: 0.15, grabacion: 0.05 },
  },
  intermedio: {
    vivo:     { instrumento: 0.40, amplificacion: 0.30, accesorios: 0.20, grabacion: 0.10 },
    estudio:  { instrumento: 0.25, amplificacion: 0.25, accesorios: 0.10, grabacion: 0.40 },
    practica: { instrumento: 0.45, amplificacion: 0.25, accesorios: 0.20, grabacion: 0.10 },
  },
  avanzado: {
    vivo:     { instrumento: 0.35, amplificacion: 0.30, accesorios: 0.25, grabacion: 0.10 },
    estudio:  { instrumento: 0.20, amplificacion: 0.25, accesorios: 0.10, grabacion: 0.45 },
    practica: { instrumento: 0.40, amplificacion: 0.20, accesorios: 0.20, grabacion: 0.20 },
  },
};

const T = {
  es: {
    errorPresupuesto: 'Ingresá el presupuesto',
    errorNivelTipo: 'Seleccioná nivel y tipo válidos',
    distribPrefix: 'Distribución para',
    instrumento: 'Instrumento',
    amplificacion: 'Amplificación',
    accesorios: 'Accesorios',
    grabacion: 'Grabación',
    tipBajo: 'Con este presupuesto, priorizá lo esencial y comprá usado.',
    tipMedio: 'Buen presupuesto para empezar. Podés conseguir equipo de calidad media.',
    tipAlto: 'Excelente presupuesto. Podés armar un setup muy completo.',
    insightTitle: 'Cómo repartir el presupuesto',
    insightLow: (b: string, item: string, amt: string, pct: string) => `Con **${b}** te conviene volcar lo grueso al **${item}** (**${amt}**, el **${pct}%**). Presupuesto ajustado: priorizá lo esencial y mirá el mercado de usados.`,
    insightMid: (b: string, item: string, amt: string, pct: string) => `Con **${b}**, la mayor parte va al **${item}** (**${amt}**, el **${pct}%**). Es un buen punto de partida para conseguir equipo de calidad media.`,
    insightHigh: (b: string, item: string, amt: string, pct: string) => `Con **${b}** podés armar un setup muy completo: el grueso va al **${item}** (**${amt}**, el **${pct}%**).`,
    centerLabel: 'Presupuesto',
  },
  en: {
    errorPresupuesto: 'Enter your budget',
    errorNivelTipo: 'Select a valid level and type',
    distribPrefix: 'Distribution for',
    instrumento: 'Instrument',
    amplificacion: 'Amplification',
    accesorios: 'Accessories',
    grabacion: 'Recording',
    tipBajo: 'With this budget, prioritize the essentials and consider buying used.',
    tipMedio: 'Good budget to get started. You can get mid-quality gear.',
    tipAlto: 'Excellent budget. You can put together a very complete setup.',
    insightTitle: 'How to split your budget',
    insightLow: (b: string, item: string, amt: string, pct: string) => `With **${b}**, put the bulk into **${item}** (**${amt}**, **${pct}%**). On a tight budget: cover the essentials first and check the used market.`,
    insightMid: (b: string, item: string, amt: string, pct: string) => `With **${b}**, most goes to **${item}** (**${amt}**, **${pct}%**). A solid starting point for mid-quality gear.`,
    insightHigh: (b: string, item: string, amt: string, pct: string) => `With **${b}** you can build a very complete setup: the bulk goes to **${item}** (**${amt}**, **${pct}%**).`,
    centerLabel: 'Budget',
  },
} as const;

export function presupuestoEquipoMusica(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const t = T[__lang];

  const presupuesto = Number(i.presupuesto);
  if (!presupuesto || presupuesto <= 0) throw new Error(t.errorPresupuesto);

  const dist = DISTRIBUCIONES[i.nivel]?.[i.tipo];
  if (!dist) throw new Error(t.errorNivelTipo);

  const instrumento = Math.round(presupuesto * dist.instrumento);
  const amplificacion = Math.round(presupuesto * dist.amplificacion);
  const accesorios = Math.round(presupuesto * dist.accesorios);
  const grabacion = Math.round(presupuesto * dist.grabacion);

  let recomendacion = `${t.distribPrefix} ${i.nivel} (${i.tipo}): `;
  recomendacion += `${t.instrumento} ${(dist.instrumento * 100).toFixed(0)}%, `;
  recomendacion += `${t.amplificacion} ${(dist.amplificacion * 100).toFixed(0)}%, `;
  recomendacion += `${t.accesorios} ${(dist.accesorios * 100).toFixed(0)}%, `;
  recomendacion += `${t.grabacion} ${(dist.grabacion * 100).toFixed(0)}%. `;

  if (presupuesto < 200000) recomendacion += t.tipBajo;
  else if (presupuesto < 500000) recomendacion += t.tipMedio;
  else recomendacion += t.tipAlto;

  const fmt = new Intl.NumberFormat(__lang === 'en' ? 'en-US' : 'es-AR', { maximumFractionDigits: 0 });
  const partes = [
    { label: t.instrumento, value: instrumento, frac: dist.instrumento },
    { label: t.amplificacion, value: amplificacion, frac: dist.amplificacion },
    { label: t.accesorios, value: accesorios, frac: dist.accesorios },
    { label: t.grabacion, value: grabacion, frac: dist.grabacion },
  ];
  const top = partes.reduce((a, b) => (b.value > a.value ? b : a), partes[0]);
  const presupuestoFmt = `$${fmt.format(presupuesto)}`;
  const topAmtFmt = `$${fmt.format(top.value)}`;
  const topPct = (top.frac * 100).toFixed(0);
  const insightFn = presupuesto < 200000 ? t.insightLow : presupuesto < 500000 ? t.insightMid : t.insightHigh;
  const _insight = {
    title: t.insightTitle,
    text: insightFn(presupuestoFmt, top.label, topAmtFmt, topPct),
    tone: presupuesto < 200000 ? 'warn' : 'good',
    icon: '🎸',
  };
  const _chart = {
    type: 'doughnut',
    slices: partes.map((p) => ({ label: p.label, value: p.value })),
    prefix: '$',
    centerValue: presupuestoFmt,
    centerLabel: t.centerLabel,
    ariaLabel: `${t.insightTitle}: ${presupuestoFmt}`,
  };

  return { instrumento, amplificacion, accesorios, grabacion, recomendacion, _insight, _chart };
}
