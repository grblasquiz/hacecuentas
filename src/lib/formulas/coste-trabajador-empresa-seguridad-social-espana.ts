/** Coste total de un trabajador para la empresa (España) — salario bruto + cotización
 *  empresarial a la Seguridad Social. La empresa paga el bruto MÁS ~30% de cotizaciones.
 *  Tipos de cotización empresarial 2026 (Régimen General, sobre base de contingencias comunes):
 *    - Contingencias comunes: 23,60%
 *    - Desempleo: 5,50% (indefinido) / 6,70% (temporal)
 *    - FOGASA: 0,20%
 *    - Formación profesional: 0,60%
 *    - MEI (Mecanismo de Equidad Intergeneracional) 2026: ~0,75% empresa (referencial)
 *    - AT y EP: variable por actividad (CNAE), tipo indicativo ~1,5% (referencial)
 *  Fuente: Seguridad Social — Tipos de cotización 2026 (seg-social.es).
 *  La base tiene un tope (base máxima). Base máxima 2025 = 4.909,50 €/mes (referencial 2026). */

const fmtEur = (n: number): string =>
  new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    .format(Math.round(n * 100) / 100) + ' €';

// Tipos de cotización a cargo de la EMPRESA (Régimen General 2026).
const CC_EMPRESA = 0.236;        // contingencias comunes
const DESEMPLEO_INDEF = 0.055;   // desempleo contrato indefinido
const DESEMPLEO_TEMP = 0.067;    // desempleo contrato temporal
const FOGASA = 0.002;            // Fondo de Garantía Salarial
const FORMACION = 0.006;         // formación profesional
const MEI_EMPRESA = 0.0075;      // MEI 2026 a cargo de la empresa (referencial)
const BASE_MAX_MES = 4909.50;    // base máxima de cotización €/mes (2025, referencial 2026)

export interface Inputs {
  salarioBrutoAnual: number;   // salario bruto anual (€)
  numeroPagas?: number;        // 12 o 14 (default 14)
  tipoContrato?: string;       // 'indefinido' | 'temporal'
  tipoATEP?: number;           // % AT y EP según actividad (default 1.5)
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const brutoAnual = Number(i.salarioBrutoAnual) || 0;
  const numeroPagas = Number(i.numeroPagas) === 12 ? 12 : 14;
  const temporal = String(i.tipoContrato || 'indefinido') === 'temporal';
  const atepPct = (Number(i.tipoATEP) >= 0 ? Number(i.tipoATEP) : 1.5) / 100;
  if (brutoAnual <= 0) throw new Error('Introduce el salario bruto anual del trabajador');

  const desempleo = temporal ? DESEMPLEO_TEMP : DESEMPLEO_INDEF;
  const tipoEmpresaTotal = CC_EMPRESA + desempleo + FOGASA + FORMACION + MEI_EMPRESA + atepPct;

  // La cotización se calcula sobre 12 bases mensuales (las pagas extra se prorratean),
  // con tope en la base máxima mensual.
  const baseMensual = Math.min(brutoAnual / 12, BASE_MAX_MES);
  const cotizacionMensual = baseMensual * tipoEmpresaTotal;
  const cotizacionAnual = cotizacionMensual * 12;
  const costeTotalAnual = brutoAnual + cotizacionAnual;
  const costeTotalMensual = costeTotalAnual / numeroPagas;
  const sobrecostePct = brutoAnual > 0 ? (cotizacionAnual / brutoAnual) * 100 : 0;

  // Desglose anual por concepto (sobre la misma base anual cotizable).
  const baseAnualCotizable = baseMensual * 12;
  const desglose = {
    contingenciasComunes: baseAnualCotizable * CC_EMPRESA,
    desempleo: baseAnualCotizable * desempleo,
    fogasa: baseAnualCotizable * FOGASA,
    formacion: baseAnualCotizable * FORMACION,
    mei: baseAnualCotizable * MEI_EMPRESA,
    atep: baseAnualCotizable * atepPct,
  };

  const _insight = {
    title: 'Lo que te cuesta de verdad',
    text: `Un salario bruto de **${fmtEur(brutoAnual)}/año** le cuesta a la empresa **${fmtEur(costeTotalAnual)}** al año: el bruto más **${fmtEur(cotizacionAnual)}** de cotización a la Seguridad Social (**+${sobrecostePct.toFixed(1)}%**). Por cada euro de sueldo bruto, la empresa desembolsa alrededor de **${(1 + sobrecostePct / 100).toFixed(2)} €**.`,
    tone: 'neutral',
    icon: '🏢',
  };
  const _chart = {
    type: 'bar',
    labels: ['Salario bruto', 'Cotización empresa'],
    values: [Math.round(brutoAnual), Math.round(cotizacionAnual)],
    prefix: '€ ',
    ariaLabel: `Salario bruto ${fmtEur(brutoAnual)} más cotización empresarial ${fmtEur(cotizacionAnual)}.`,
  };

  return {
    costeTotalAnual: fmtEur(costeTotalAnual),
    costeTotalMensual: fmtEur(costeTotalMensual),
    cotizacionAnual: fmtEur(cotizacionAnual),
    cotizacionMensual: fmtEur(cotizacionMensual),
    sobrecostePct: `${sobrecostePct.toFixed(1)} %`,
    detalle: `Coste empresa: ${fmtEur(costeTotalAnual)}/año (${fmtEur(costeTotalMensual)} en ${numeroPagas} pagas). Desglose cotización: CC ${fmtEur(desglose.contingenciasComunes)} · desempleo ${fmtEur(desglose.desempleo)} · FOGASA ${fmtEur(desglose.fogasa)} · formación ${fmtEur(desglose.formacion)} · MEI ${fmtEur(desglose.mei)} · AT/EP ${fmtEur(desglose.atep)}.`,
    _insight,
    _chart,
  };
}
