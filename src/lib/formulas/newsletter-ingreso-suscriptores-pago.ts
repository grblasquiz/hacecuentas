/**
 * Calculadora de ingreso de newsletter / Substack con suscriptores pagos.
 * Ingreso bruto mensual y anual, menos fee de plataforma y procesador de pago,
 * para obtener el neto que realmente te queda.
 *
 * Fee de plataforma (sobre ingreso):
 *   Substack 10% · Beehiiv 0% · Ghost 0% · Patreon 8%
 * Fee de procesador de pago (Stripe) por default 3% (configurable).
 *
 * Nota: Ghost/Beehiiv cobran suscripción mensual fija por la herramienta
 * (no un % por venta); acá se modela el % de revenue-share, que es 0 en ambos.
 * Stripe en la práctica cobra ~2,9% + fijo por transacción; 3% es una aproximación.
 */

export interface NewsletterIngresoSuscriptoresPagoInputs {
  suscriptores_pagos: number | string | null;
  precio_mensual: number | string | null;
  plataforma: string; // Substack-10 | Beehiiv-0 | Ghost-0 | Patreon-8
  procesador_pago_pct: number | string | null; // % (Stripe), default 3
}

export interface NewsletterIngresoSuscriptoresPagoOutputs {
  brutoMensual: number;
  brutoAnual: number;
  feePlataformaMensual: number;
  feeProcesadorMensual: number;
  netoMensual: number;
  netoAnual: number;
  porcentajeRetenido: number; // % que se queda el creador
  detalle: string;
  _insight?: any;
  _chart?: any;
}

const PLATAFORMA_FEE: Record<string, number> = {
  'Substack-10': 0.1,
  'Beehiiv-0': 0,
  'Ghost-0': 0,
  'Patreon-8': 0.08,
};

const PLATAFORMA_LABEL: Record<string, string> = {
  'Substack-10': 'Substack (10%)',
  'Beehiiv-0': 'Beehiiv (0% revenue-share)',
  'Ghost-0': 'Ghost (0% revenue-share)',
  'Patreon-8': 'Patreon (8%)',
};

export function newsletterIngresoSuscriptoresPago(
  i: NewsletterIngresoSuscriptoresPagoInputs
): NewsletterIngresoSuscriptoresPagoOutputs {
  const subs =
    i.suscriptores_pagos === '' || i.suscriptores_pagos == null
      ? 0
      : Number(i.suscriptores_pagos);
  const precio =
    i.precio_mensual === '' || i.precio_mensual == null
      ? 0
      : Number(i.precio_mensual);
  const plataforma =
    i.plataforma === '' || i.plataforma == null
      ? 'Substack-10'
      : String(i.plataforma);
  const procPct =
    i.procesador_pago_pct === '' || i.procesador_pago_pct == null
      ? 3
      : Number(i.procesador_pago_pct);

  if (!subs || subs <= 0)
    throw new Error('Ingresá tu cantidad de suscriptores pagos');
  if (!precio || precio <= 0)
    throw new Error('Ingresá el precio mensual de la suscripción');

  const feePlataforma = PLATAFORMA_FEE[plataforma] ?? 0;
  const feeProcesador = Math.max(0, procPct) / 100;

  const brutoMensual = subs * precio;
  const brutoAnual = brutoMensual * 12;

  const feePlataformaMensual = brutoMensual * feePlataforma;
  const feeProcesadorMensual = brutoMensual * feeProcesador;

  const netoMensual = brutoMensual - feePlataformaMensual - feeProcesadorMensual;
  const netoAnual = netoMensual * 12;

  const porcentajeRetenido =
    brutoMensual > 0 ? (netoMensual / brutoMensual) * 100 : 0;

  const r = (n: number) => Math.round(n);
  const fmt = (n: number) => `$${r(n).toLocaleString('en-US')}`;
  const platLbl = PLATAFORMA_LABEL[plataforma] ?? plataforma;

  let tone: 'good' | 'warn' | 'neutral';
  let insightText: string;
  if (feePlataforma >= 0.1) {
    tone = 'warn';
    insightText = `Con **${platLbl}** te retienen el **${(
      (feePlataforma + feeProcesador) *
      100
    ).toFixed(
      1
    )}%** entre plataforma y procesador: de **${fmt(
      brutoMensual
    )}** brutos mensuales te quedan **${fmt(
      netoMensual
    )}**. Sobre el año son **${fmt(
      brutoMensual * feePlataforma * 12
    )}** solo en fee de plataforma. Si crecés, migrar a Ghost/Beehiiv (0% revenue-share, pagás suscripción fija de la herramienta) puede convenir.`;
  } else if (feePlataforma === 0) {
    tone = 'good';
    insightText = `**${platLbl}** no se queda un % de tu revenue: de **${fmt(
      brutoMensual
    )}** brutos mensuales solo se va el **${(feeProcesador * 100).toFixed(
      1
    )}%** del procesador, dejándote **${fmt(
      netoMensual
    )}** netos (**${fmt(
      netoAnual
    )}** al año). Ojo: estas plataformas cobran una suscripción mensual fija por la herramienta, que conviene a partir de cierto volumen.`;
  } else {
    tone = 'neutral';
    insightText = `Con **${platLbl}** + procesador (${(
      feeProcesador * 100
    ).toFixed(
      1
    )}%), te quedás con el **${porcentajeRetenido.toFixed(
      1
    )}%**: **${fmt(netoMensual)}** netos mensuales sobre **${fmt(
      brutoMensual
    )}** brutos (**${fmt(netoAnual)}** al año).`;
  }

  const detalle = `${subs.toLocaleString('es-AR')} subs × ${fmt(
    precio
  )}/mes = ${fmt(brutoMensual)} bruto. Fee ${platLbl} ${fmt(
    feePlataformaMensual
  )} + procesador ${fmt(feeProcesadorMensual)} → neto ${fmt(
    netoMensual
  )}/mes (${fmt(netoAnual)}/año).`;

  return {
    brutoMensual: r(brutoMensual),
    brutoAnual: r(brutoAnual),
    feePlataformaMensual: r(feePlataformaMensual),
    feeProcesadorMensual: r(feeProcesadorMensual),
    netoMensual: r(netoMensual),
    netoAnual: r(netoAnual),
    porcentajeRetenido: Math.round(porcentajeRetenido * 10) / 10,
    detalle,
    _insight: {
      title: 'Lo que realmente te queda',
      text: insightText,
      tone,
      icon: '📧',
    },
    _chart: {
      type: 'doughnut',
      slices: [
        { label: 'Neto para vos', value: r(netoMensual) },
        { label: 'Fee plataforma', value: r(feePlataformaMensual) },
        { label: 'Fee procesador', value: r(feeProcesadorMensual) },
      ].filter((s) => s.value > 0),
      prefix: '$',
      centerValue: fmt(netoMensual),
      centerLabel: 'Neto mensual',
      ariaLabel: `De ${fmt(brutoMensual)} brutos mensuales, ${fmt(
        netoMensual
      )} netos para el creador.`,
    },
  };
}
