// UTM live desde mindicador.cl (cron diario fetch-chile.mjs), con fallback verificado.
import clLive from "../../data/live/chile.json";
// Exención y tasa máxima 2026 — fuente única (Art. 43 N°1 LIR).
import { CHILE_2026 } from "../data/chile-2026";

export interface Inputs {
  sueldo_bruto: number;
  incluir_cotizaciones: boolean;
}

export interface Outputs {
  utm_2026: number;
  base_imponible_utm: number;
  tramo_actual: string;
  tasa_marginal: number;
  iusc_calculado: number;
  sueldo_neto: number;
  tasa_efectiva: number;
  detalle_tramos: string;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  // UTM vigente (se reajusta el 1.º de cada mes), con fallback al último verificado (jun-2026).
  const UTM = (clLive as any)?.utm?.valor ?? 71506;

  // Cotizaciones obligatorias aproximadas (AFP 10% + salud 7%)
  const tasa_cotizaciones = 0.17;

  const sueldoBruto = Math.max(0, i.sueldo_bruto || 0);
  const base_imponible = i.incluir_cotizaciones ? sueldoBruto * (1 - tasa_cotizaciones) : sueldoBruto;
  const base_utm = UTM > 0 ? base_imponible / UTM : 0;

  // Impuesto Único de Segunda Categoría — Art. 43 N°1 LIR.
  // Tabla mensual progresiva en UTM (factor marginal + rebaja en UTM, ambos sobre el valor UTM vigente).
  // La rebaja en UTM da continuidad entre tramos: impuesto = base·factor − rebaja·UTM.
  // Tramos: 13,5 / 30 / 50 / 70 / 90 / 120 / 310 UTM. Tasa máxima 40%.
  const EXENTO_UTM = CHILE_2026.segundaCategoriaExentoUtm; // 13,5 UTM exentas
  const TRAMOS: { desdeUtm: number; hastaUtm: number; factor: number; rebajaUtm: number; nombre: string }[] = [
    { desdeUtm: 0,          hastaUtm: EXENTO_UTM, factor: 0,     rebajaUtm: 0,     nombre: 'Exento' },
    { desdeUtm: EXENTO_UTM, hastaUtm: 30,         factor: 0.04,  rebajaUtm: 0.54,  nombre: '4%' },
    { desdeUtm: 30,         hastaUtm: 50,         factor: 0.08,  rebajaUtm: 1.74,  nombre: '8%' },
    { desdeUtm: 50,         hastaUtm: 70,         factor: 0.135, rebajaUtm: 4.49,  nombre: '13,5%' },
    { desdeUtm: 70,         hastaUtm: 90,         factor: 0.23,  rebajaUtm: 11.14, nombre: '23%' },
    { desdeUtm: 90,         hastaUtm: 120,        factor: 0.304, rebajaUtm: 17.80, nombre: '30,4%' },
    { desdeUtm: 120,        hastaUtm: 310,        factor: 0.35,  rebajaUtm: 23.32, nombre: '35%' },
    { desdeUtm: 310,        hastaUtm: Infinity,   factor: CHILE_2026.segundaCategoriaTasaMaxima, rebajaUtm: 38.82, nombre: '40%' },
  ];

  let tramo = TRAMOS[0];
  for (const t of TRAMOS) {
    if (base_utm <= t.hastaUtm) { tramo = t; break; }
  }

  const tasa_marginal = tramo.factor;
  const iusc = Math.round(Math.max(0, base_imponible * tasa_marginal - tramo.rebajaUtm * UTM));

  const tramo_nombre =
    base_utm <= EXENTO_UTM
      ? 'Exento (hasta 13,5 UTM)'
      : `${tramo.desdeUtm} a ${tramo.hastaUtm === Infinity ? '+' : tramo.hastaUtm} UTM (${tramo.nombre})`;

  // Sueldo neto (descuentos: cotizaciones + IUSC)
  const cotizaciones_monto = i.incluir_cotizaciones ? Math.round(sueldoBruto * tasa_cotizaciones) : 0;
  const descuentos = cotizaciones_monto + iusc;
  const sueldo_neto = sueldoBruto - descuentos;
  const neto_redondeado = Math.round(sueldo_neto);

  // Tasa efectiva del IUSC sobre el bruto
  const tasa_efectiva = sueldoBruto > 0 ? iusc / sueldoBruto : 0;

  const fmtCL = (n: number) => '$' + Math.round(n).toLocaleString('es-CL');
  const utmFmt = (n: number) => (Math.round(n * 100) / 100).toLocaleString('es-CL');

  // Desglose del cálculo (informativo)
  let detalle_tramos = '';
  if (base_utm <= EXENTO_UTM) {
    detalle_tramos = 'Bajo el tramo exento (13,5 UTM): 0% de IUSC. Solo se descuentan AFP y salud.';
  } else {
    detalle_tramos = `Base imponible ${utmFmt(base_utm)} UTM → tramo ${tramo.nombre}: ${fmtCL(base_imponible)} × ${(tramo.factor * 100).toLocaleString('es-CL')}% − ${utmFmt(tramo.rebajaUtm)} UTM × ${fmtCL(UTM)} = ${fmtCL(iusc)}`;
  }

  const tasaEfPct = tasa_efectiva * 100;

  // Insight dinámico según carga de IUSC
  let insightTone: 'good' | 'warn' | 'neutral';
  let insightText: string;
  if (iusc <= 0) {
    insightTone = 'good';
    insightText = `Tu base imponible (**${utmFmt(base_utm)} UTM**) cae en el tramo exento: **no pagás Impuesto Único de Segunda Categoría**. Lo único que se te descuenta son las cotizaciones de AFP y salud.`;
  } else if (tasaEfPct < 5) {
    insightTone = 'good';
    insightText = `El IUSC te toma **${fmtCL(iusc)}** al mes, apenas **${tasaEfPct.toFixed(1)}%** de tu sueldo bruto. Tu líquido a recibir queda en **${fmtCL(sueldo_neto)}**.`;
  } else if (tasaEfPct < 15) {
    insightTone = 'neutral';
    insightText = `Estás en el tramo del **${(tramo.factor * 100).toLocaleString('es-CL')}% marginal**: pagás **${fmtCL(iusc)}** de IUSC al mes (tasa efectiva **${tasaEfPct.toFixed(1)}%**) y recibís un líquido de **${fmtCL(sueldo_neto)}**.`;
  } else {
    insightTone = 'warn';
    insightText = `Carga alta: el IUSC se lleva **${fmtCL(iusc)}** al mes (tasa efectiva **${tasaEfPct.toFixed(1)}%**, marginal **${(tramo.factor * 100).toLocaleString('es-CL')}%**). Sobre cada peso extra sobre tu tramo tributás al máximo.`;
  }

  const _insight = {
    title: 'Tu Impuesto Único de Segunda Categoría',
    text: insightText,
    tone: insightTone,
    icon: '🇨🇱',
  };

  // Donut: composición del sueldo bruto → líquido + IUSC (+ cotizaciones si se incluyen)
  const slices: Array<{ label: string; value: number }> = [
    { label: 'Líquido a recibir', value: neto_redondeado },
  ];
  if (iusc > 0) slices.push({ label: 'IUSC (impuesto)', value: iusc });
  if (cotizaciones_monto > 0) slices.push({ label: 'AFP + Salud', value: cotizaciones_monto });

  const _chart = slices.length > 1 ? {
    type: 'doughnut',
    slices,
    prefix: '$',
    centerValue: fmtCL(sueldoBruto),
    centerLabel: 'Sueldo bruto',
    ariaLabel: `Distribución del sueldo bruto de ${fmtCL(sueldoBruto)}: líquido ${fmtCL(neto_redondeado)}, IUSC ${fmtCL(iusc)}${cotizaciones_monto > 0 ? `, cotizaciones ${fmtCL(cotizaciones_monto)}` : ''}`,
  } : undefined;

  return {
    utm_2026: UTM,
    base_imponible_utm: Math.round(base_utm * 100) / 100,
    tramo_actual: tramo_nombre,
    tasa_marginal,
    iusc_calculado: iusc,
    sueldo_neto: neto_redondeado,
    tasa_efectiva: Math.round(tasa_efectiva * 10000) / 10000,
    detalle_tramos,
    _insight,
    _chart,
  };
}
