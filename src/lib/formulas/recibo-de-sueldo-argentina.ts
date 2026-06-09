/**
 * Simulador de recibo de sueldo INTEGRAL (Argentina) — multicálculo.
 *
 * A partir de UN solo bruto mensual calcula, de una:
 *   1. Recibo neto desglosado (reusa `sueldoAR` → cero divergencia con la calc
 *      `sueldo-en-mano-argentina`: 17% aportes + Ganancias 4ta cat).
 *   2. Aguinaldo / SAC (LCT art. 121: ½ de la mejor remuneración del semestre).
 *   3. Vacaciones devengadas (LCT art. 150 días + art. 155 valor día = bruto/25).
 *   4. Total anual (13 sueldos: 12 + aguinaldo).
 *   5. Costo laboral del empleador (contribuciones patronales — ESTIMADO, ver nota).
 *
 * NO compite con las calcs dedicadas: es un hub que las resume y enlaza.
 * La intención de búsqueda objetivo es "recibo de sueldo / liquidación mensual",
 * distinta de "sueldo en mano / neto" (que ya posee `sueldo-en-mano-argentina`).
 *
 * ⚠️ Costo empleador: contribuciones patronales ≈ 26,4% (Dec. 814/01 art. 2 inc. a
 * comercio/servicios 20,4% + Obra Social Ley 23.660 6%). PyME industria ≈ 24%.
 * NO incluye ART (variable según actividad/siniestralidad) ni seguro de vida
 * obligatorio, ni la detracción de contribuciones. Es una ESTIMACIÓN.
 */

import { sueldoAR, BASE_IMPONIBLE_MAXIMA_APORTES } from './sueldo-ar';

export interface ReciboSueldoInputs {
  bruto: number;
  conyuge?: boolean | string;
  hijos?: number | string;
  /** Antigüedad en años (define días de vacaciones). */
  antiguedad?: number | string;
  __lang?: string;
}

export interface ReciboSueldoOutputs {
  // Recibo mensual
  neto: number;
  aportes: number;
  jubilacion: number;
  obraSocial: number;
  pami: number;
  ganancias: number;
  descuentoTotal: number;
  porcentajeDescuento: number;
  // Aguinaldo (SAC)
  aguinaldoBruto: number;
  aguinaldoNeto: number;
  // Vacaciones
  diasVacaciones: number;
  valorDiaVacaciones: number;
  montoVacaciones: number;
  // Anual
  brutoAnual: number;
  netoAnual: number;
  // Empleador (estimado)
  contribucionesPatronales: number;
  costoEmpleadorMensual: number;
  costoEmpleadorAnual: number;
  _chart?: any;
  _insight?: any;
}

// Contribuciones patronales estimadas (ver nota de cabecera). 26,4% = 20,4% + 6%.
const TASA_CONTRIB_PATRONAL = 0.264;

export function reciboDeSueldoArgentina(inputs: ReciboSueldoInputs): ReciboSueldoOutputs {
  const __lang = inputs.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      errorBruto: 'Ingresá un sueldo bruto válido',
      neto: 'Neto en mano',
      jubilacion: 'Jubilación',
      obraSocial: 'Obra social',
      ganancias: 'Ganancias',
      centerLabel: 'Bruto',
      aria: 'Composición del recibo de sueldo: neto, jubilación, obra social, PAMI y Ganancias',
      insTitle: 'Todo lo que mueve tu sueldo, de un vistazo',
      insText: (neto: string, agui: string, vac: string, costo: string) =>
        `En mano cobrás **${neto}**/mes. Sumás **${agui}** de aguinaldo por semestre y **${vac}** de vacaciones al año. ` +
        `Para tu empleador costás **${costo}**/mes aprox (con contribuciones patronales, sin ART).`,
    },
    en: {
      errorBruto: 'Enter a valid gross salary',
      neto: 'Take-home',
      jubilacion: 'Retirement',
      obraSocial: 'Health insurance',
      ganancias: 'Income tax',
      centerLabel: 'Gross',
      aria: 'Payslip breakdown: take-home, retirement, health insurance, PAMI and income tax',
      insTitle: 'Everything your salary moves, at a glance',
      insText: (neto: string, agui: string, vac: string, costo: string) =>
        `You take home **${neto}**/month. Plus **${agui}** annual bonus per half-year and **${vac}** of vacation pay per year. ` +
        `You cost your employer about **${costo}**/month (employer contributions, ART not included).`,
    },
  } as const)[__lang];

  const bruto = Number(inputs.bruto);
  if (!bruto || bruto <= 0) {
    throw new Error(T.errorBruto);
  }

  // 1. Recibo neto — reusa la fórmula oficial del sitio (no duplicar lógica).
  const s = sueldoAR({
    bruto,
    conyuge: inputs.conyuge,
    hijos: inputs.hijos,
    __lang,
  });

  // 2. Aguinaldo / SAC: ½ de la mejor remuneración del semestre (= medio bruto).
  //    Descuentos 17% (mismo criterio que la calc `aguinaldo`).
  const aguinaldoBruto = bruto / 2;
  // El SAC topea a MEDIA base imponible máxima (es medio sueldo).
  const aguinaldoNeto = aguinaldoBruto - Math.min(aguinaldoBruto, BASE_IMPONIBLE_MAXIMA_APORTES / 2) * 0.17;

  // 3. Vacaciones (LCT art. 150 días según antigüedad; art. 155 valor día = bruto/25).
  const antiguedad = Math.max(0, Number(inputs.antiguedad) || 0);
  let dias: number;
  if (antiguedad < 5) dias = 14;
  else if (antiguedad < 10) dias = 21;
  else if (antiguedad < 20) dias = 28;
  else dias = 35;
  const valorDiaVacaciones = bruto / 25;
  const montoVacaciones = valorDiaVacaciones * dias;

  // 4. Total anual: 13 sueldos (12 + aguinaldo completo repartido en 2 cuotas).
  const brutoAnual = bruto * 13;
  const netoAnual = s.neto * 12 + aguinaldoNeto * 2;

  // 5. Costo empleador (ESTIMADO — ver nota de cabecera).
  const contribucionesPatronales = bruto * TASA_CONTRIB_PATRONAL;
  const costoEmpleadorMensual = bruto + contribucionesPatronales;
  const costoEmpleadorAnual = costoEmpleadorMensual * 13;

  const f = (n: number) => '$' + Math.round(n).toLocaleString('es-AR');

  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: T.neto, value: Math.round(s.neto) },
      { label: T.jubilacion, value: Math.round(s.jubilacion) },
      { label: T.obraSocial, value: Math.round(s.obraSocial) },
      { label: 'PAMI', value: Math.round(s.pami) },
      { label: T.ganancias, value: Math.round(s.ganancias) },
    ],
    prefix: '$',
    centerValue: '$' + Math.round(bruto).toLocaleString('es-AR'),
    centerLabel: T.centerLabel,
    ariaLabel: T.aria,
  };

  const insight = {
    title: T.insTitle,
    text: T.insText(f(s.neto), f(aguinaldoNeto), f(montoVacaciones), f(costoEmpleadorMensual)),
    tone: s.porcentajeDescuento >= 25 ? 'warn' : 'neutral',
    icon: '🧾',
  };

  return {
    neto: s.neto,
    aportes: s.aportes,
    jubilacion: s.jubilacion,
    obraSocial: s.obraSocial,
    pami: s.pami,
    ganancias: s.ganancias,
    descuentoTotal: s.descuentoTotal,
    porcentajeDescuento: s.porcentajeDescuento,
    aguinaldoBruto: Math.round(aguinaldoBruto),
    aguinaldoNeto: Math.round(aguinaldoNeto),
    diasVacaciones: dias,
    valorDiaVacaciones: Math.round(valorDiaVacaciones),
    montoVacaciones: Math.round(montoVacaciones),
    brutoAnual: Math.round(brutoAnual),
    netoAnual: Math.round(netoAnual),
    contribucionesPatronales: Math.round(contribucionesPatronales),
    costoEmpleadorMensual: Math.round(costoEmpleadorMensual),
    costoEmpleadorAnual: Math.round(costoEmpleadorAnual),
    _chart: chart,
    _insight: insight,
  };
}
